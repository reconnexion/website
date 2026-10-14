import { Bloc, Paragraphes, Surtitre } from './_commun';
import { Image } from './_image';
import type { Champ } from './types';
import { STATUTS, type Statut } from '../lib/applications';
import { ChevronLeft, ChevronRight, ExternalLink, GitBranch, X } from 'lucide-react';
import { ID_VISIONNEUSE, defilerCaptures, ouvrirCapture } from '../lib/visionneuse';
import { useState, type CSSProperties, type ReactNode } from 'react';

/** Couleur de l'étiquette de statut (classes écrites en entier pour Tailwind). */
const couleursStatut: Record<Statut, string> = {
  'En ligne': 'border-vert-fonce bg-vert-fonce text-fond',
  'En bêta': 'border-bleu-fonce bg-bleu-fonce text-fond',
};

/** Étiquette du statut d'une application (sur sa page). */
function EtiquetteStatut({ statut, className = '' }: { statut?: Statut; className?: string }) {
  if (!statut || !couleursStatut[statut]) return null;
  return <span className={`badge rounded-none font-semibold ${couleursStatut[statut]} ${className}`.trim()}>{statut}</span>;
}

const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Date AAAA-MM-JJ (ou date complète) → « 1 novembre 2021 ». */
function dateLisible(date: string) {
  const d = new Date(date.slice(0, 10));
  return Number.isNaN(d.getTime()) ? date : fmtDate.format(d);
}

/** Une ligne des informations sous les captures (libellé à gauche, valeur à droite). */
export function LigneInfo({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="font-titre font-semibold">{libelle}</dt>
      <dd className="max-w-texte">{children}</dd>
    </div>
  );
}

type Bouton = { texte: string; lien: string; style?: 'principal' | 'secondaire' };
/** `largeur` et `hauteur` : dimensions de l'image, lues au build (sinon mesurées à son chargement). */
type Capture = { image: string; description?: string; largeur?: number; hauteur?: number };

export type FicheApplicationProps = {
  /** Page parente, affichée au-dessus du titre comme le surtitre des autres pages. */
  surtitre?: { texte: string; lien?: string };
  titre: string;
  statut?: Statut;
  logo?: string;
  sous_titre?: string;
  boutons?: Bouton[];
  captures?: Capture[];
  /** Ligne « Utilisateurs », lue sur l'application (server island sur le site, exemple dans l'aperçu du CMS). */
  utilisateurs?: ReactNode;
  date_lancement?: string;
  description?: string;
};

/** Somme des formats (largeur / hauteur) au-delà de laquelle les captures passent sur plusieurs lignes. */
const FORMATS_PAR_LIGNE = 3.5;
/** Format supposé d'une capture tant que ses dimensions ne sont pas connues (aperçu du CMS). */
const FORMAT_PAR_DEFAUT = 16 / 9;

type CaptureMesuree = Capture & { format: number; index: number };

/** Répartit les captures, dans l'ordre, en lignes de formats cumulés équilibrés. */
function enLignes(captures: CaptureMesuree[]) {
  const total = captures.reduce((s, c) => s + c.format, 0);
  const nbLignes = Math.ceil(total / FORMATS_PAR_LIGNE);
  const cible = total / nbLignes;
  const lignes: CaptureMesuree[][] = [];
  let somme = 0;
  for (const c of captures) {
    if (!lignes.length || (lignes.length < nbLignes && somme + c.format / 2 > cible)) {
      lignes.push([]);
      somme = 0;
    }
    lignes[lignes.length - 1].push(c);
    somme += c.format;
  }
  return lignes;
}

/**
 * Captures d'écran, ordinateur (paysage) et mobile (portrait) mélangées.
 * Sur grand écran, les captures d'une même ligne ont la même hauteur : chacune prend une largeur
 * proportionnelle à son format (utilitaires `ligne-captures` et `capture-dans-ligne`).
 * Sur mobile, carrousel : une capture paysage occupe presque tout l'écran, une capture portrait les 3/5.
 * S'il y a des captures mobiles, les captures ordinateur ne sont pas affichées sur mobile.
 * Un clic sur une capture ouvre la visionneuse (src/lib/visionneuse.ts).
 */
function Captures({ captures }: { captures: Capture[] }) {
  // Dimensions mesurées au chargement des images dont on ne connaît pas la taille (aperçu du CMS).
  const [mesures, setMesures] = useState<Record<string, number>>({});
  const mesurees = captures.map((c, index) => ({
    ...c,
    index,
    format: c.largeur && c.hauteur ? c.largeur / c.hauteur : (mesures[c.image] ?? FORMAT_PAR_DEFAUT),
  }));
  const avecMobiles = mesurees.some((c) => c.format < 1);
  // Classe des captures ordinateur (paysage) : masquées sur mobile s'il y a des captures mobiles.
  const masquage = (c: CaptureMesuree) => (avecMobiles && c.format >= 1 ? 'max-md:hidden' : '');
  return (
    <>
      <div className="carousel carousel-center mt-e5 w-full items-center gap-e4 md:flex md:items-start md:flex-col md:overflow-visible">
        {enLignes(mesurees).map((ligne, i) => {
          const somme = ligne.reduce((s, c) => s + c.format, 0);
          return (
            <div
              key={i}
              className="contents md:ligne-captures"
              style={{ '--somme-formats': somme, '--nb-captures': ligne.length } as CSSProperties}
            >
              {ligne.map((c, j) => {
                const portrait = c.format < 1;
                return (
                  <a
                    key={j}
                    href={c.image}
                    data-capture={c.index}
                    onClick={(e) => {
                      // Aperçu du CMS (sur le site, le script de la page s'en charge).
                      e.preventDefault();
                      ouvrirCapture(e.currentTarget.ownerDocument, c.index);
                    }}
                    className={`carousel-item min-w-0 cursor-zoom-in items-start md:w-auto md:capture-dans-ligne ${portrait ? 'w-3/5 sm:w-2/5' : 'w-5/6'} ${masquage(c)}`}
                    // Part de la ligne : des parts qui totalisent 1 la remplissent (une somme < 1 la laisserait incomplète).
                    style={{ '--part': c.format / somme } as CSSProperties}
                  >
                    <Image
                      src={c.image}
                      sizes={portrait ? '(min-width: 768px) 24rem, 60vw' : '(min-width: 768px) 72rem, 85vw'}
                      alt={c.description ?? ''}
                      width={c.largeur}
                      height={c.hauteur}
                      loading="lazy"
                      onLoad={
                        c.largeur && c.hauteur
                          ? undefined
                          : (e) => {
                              const { naturalWidth: l, naturalHeight: h } = e.currentTarget;
                              if (l && h) setMesures((m) => (m[c.image] === l / h ? m : { ...m, [c.image]: l / h }));
                            }
                      }
                      className="w-full outline outline-base-300 -outline-offset-1"
                    />
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>

      <dialog id={ID_VISIONNEUSE} className="modal bg-noir/95" aria-label="Captures d’écran">
        <div data-diapos className="carousel absolute inset-0">
          {mesurees.map((c) => (
            <div
              key={c.index}
              data-diapo
              onClick={(e) => e.target === e.currentTarget && e.currentTarget.closest('dialog')?.close()}
              className={`carousel-item box-border h-full w-full flex-col items-center justify-center p-e3 md:p-e6 ${masquage(c)}`}
            >
              <Image src={c.image} sizes="100vw" alt={c.description ?? ''} loading="lazy" className="min-h-0 max-w-full object-contain" />
              {c.description && <p className="mt-e3 max-w-texte text-center text-s text-fond">{c.description}</p>}
            </div>
          ))}
        </div>
        {captures.length > 1 &&
          ([-1, 1] as const).map((sens) => {
            const Icone = sens < 0 ? ChevronLeft : ChevronRight;
            return (
              <button
                key={sens}
                type="button"
                data-defiler={sens}
                onClick={(e) => defilerCaptures(e.currentTarget.ownerDocument, sens)}
                aria-label={sens < 0 ? 'Capture précédente' : 'Capture suivante'}
                className={`btn absolute top-1/2 btn-circle -translate-y-1/2 max-md:hidden ${sens < 0 ? 'left-e3' : 'right-e3'}`}
              >
                <Icone size={24} aria-hidden="true" />
              </button>
            );
          })}
        <form method="dialog">
          <button className="btn absolute top-e3 right-e3 btn-circle" aria-label="Fermer">
            <X size={24} aria-hidden="true" />
          </button>
        </form>
      </dialog>
    </>
  );
}

export function FicheApplication({
  surtitre,
  titre,
  statut,
  logo,
  sous_titre,
  boutons = [],
  captures = [],
  utilisateurs,
  date_lancement,
  description,
}: FicheApplicationProps) {
  return (
    // Même en-tête que les autres pages (cf. Bandeau) : surtitre, h1, moins d'espace sous le menu sur mobile.
    <Bloc className="pt-e4 md:pt-e6">
      <div className="grid items-start gap-e4 md:grid-cols-[1fr_auto]">
        <div>
          <Surtitre texte={surtitre?.texte} lien={surtitre?.lien} />
          <div className="mb-e3 flex items-center gap-e4">
            {logo && <Image src={logo} sizes="4rem" alt="" className="size-12 shrink-0 sm:size-16" />}
            <h1 className="text-xxl">{titre}</h1>
          </div>
          {sous_titre && <p className="text-l text-gris italic">{sous_titre}</p>}
        </div>
        {boutons.length > 0 && (
          <div className="flex flex-wrap gap-e3 md:w-60 md:flex-col md:pt-e5">
            {boutons.map((b, i) => {
              // Bouton principal : ouvrir l'application ; secondaire : son code source.
              const Icone = b.style === 'secondaire' ? GitBranch : ExternalLink;
              return (
                <a
                  key={i}
                  href={b.lien}
                  className={`btn ${b.style === 'secondaire' ? 'border-barre bg-barre text-noir hover:border-trait hover:bg-trait' : 'btn-primary'}`}
                >
                  <Icone size={18} aria-hidden="true" />
                  {b.texte}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {captures.length > 0 && <Captures captures={captures} />}

      {(statut || utilisateurs || date_lancement || description) && (
        <dl className="mt-e5 grid gap-x-e5 gap-y-e4 md:grid-cols-[12rem_1fr]">
          {statut && (
            <LigneInfo libelle="Statut">
              <EtiquetteStatut statut={statut} className="badge-lg" />
            </LigneInfo>
          )}
          {utilisateurs}
          {date_lancement && <LigneInfo libelle="Date de lancement">{dateLisible(date_lancement)}</LigneInfo>}
          {description && (
            <LigneInfo libelle="Description">
              <Paragraphes texte={description} />
            </LigneInfo>
          )}
        </dl>
      )}
    </Bloc>
  );
}

/**
 * Champs d'une fiche de la collection « Applications » (src/content/applications/*.yml).
 * La page /applications/<slug> et les listes du bloc Applications en sont tirées.
 */
export const champsApplication: Champ[] = [
  { name: 'nom', label: "Nom de l'application", widget: 'string' },
  {
    name: 'slug',
    label: 'Adresse',
    widget: 'string',
    hint: 'La page sera /applications/<adresse>. Minuscules et tirets (ex. « la-carte-des-savoirs »).',
    pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
  },
  { name: 'ordre', label: "Ordre d'affichage", widget: 'number', value_type: 'int', required: false },
  {
    name: 'statut',
    label: 'Statut',
    widget: 'select',
    options: [...STATUTS],
    required: false,
    hint: 'Affiché en étiquette sous les captures, sur la page de l’application.',
  },
  { name: 'logo', label: 'Logo', widget: 'image', required: false, hint: 'Image carrée, affichée à gauche du nom.' },
  { name: 'accroche', label: 'Accroche', widget: 'string', required: false, hint: 'Sous le nom, sur la page de l’application.' },
  { name: 'resume', label: 'Résumé', widget: 'text', required: false, hint: 'Affiché dans les listes d’applications (accueil, page Applications).' },
  { name: 'vignette', label: 'Vignette (format paysage 16:9)', widget: 'image', required: false, hint: 'Affichée dans les listes d’applications.' },
  {
    name: 'boutons',
    label: 'Boutons',
    widget: 'list',
    required: false,
    summary: '{{texte}}',
    hint: 'Le nombre d’utilisateurs affiché sur la page est lu sur l’adresse du bouton principal (/.well-known/nodeinfo).',
    fields: [
      { name: 'texte', label: 'Texte', widget: 'string' },
      { name: 'lien', label: 'Lien', widget: 'string' },
      { name: 'style', label: 'Style', widget: 'select', options: ['principal', 'secondaire'], default: 'principal' },
    ],
  },
  {
    name: 'captures',
    label: "Captures d'écran",
    widget: 'list',
    required: false,
    hint: 'Ordinateur et mobile peuvent se mélanger (ex. une capture ordinateur puis deux captures mobiles) : elles sont alignées à la même hauteur et affichées en entier. Formats conseillés : ordinateur 16:9 (fenêtre de 1280 × 720, ex. 2560 × 1440 px), mobile 360 × 760 (écran du Galaxy S10, ex. 1080 × 2280 px).',
    summary: '{{description}}',
    fields: [
      { name: 'image', label: 'Image', widget: 'image' },
      { name: 'description', label: "Description de l'image", widget: 'string', required: false },
    ],
  },
  {
    name: 'date_lancement',
    label: 'Date de lancement',
    widget: 'datetime',
    format: 'YYYY-MM-DD',
    time_format: false,
    required: false,
  },
  {
    name: 'description',
    label: 'Description',
    widget: 'text',
    required: false,
    hint: 'Sous les captures, sur la page de l’application. Paragraphes séparés par une ligne vide, liens [texte](adresse). La page est créée dès qu’il y a des captures ou une description.',
  },
  {
    name: 'categorie_forum',
    label: 'Catégorie du forum',
    widget: 'string',
    required: false,
    hint: 'Adresse de la catégorie, copiée depuis le forum (ex. https://forum.reconnexion.coop/c/applications-disponibles/lentraide/7). Ses derniers sujets s’affichent sous la page de l’application, avec un bouton pour lancer une conversation.',
    pattern: ['^https?://[^/]+/c/.*\\d+/?$', 'Adresse d’une catégorie du forum : …/c/<catégorie>/<numéro>'],
  },
];

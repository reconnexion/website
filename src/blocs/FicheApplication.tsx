import { Bloc, Paragraphes, Surtitre } from './_commun';
import { Image } from './_image';
import type { Champ } from './types';
import { STATUTS, type Statut } from '../lib/applications';
import { ExternalLink, GitBranch } from 'lucide-react';
import type { ReactNode } from 'react';

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
type Capture = { image: string; description?: string };

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

/** Colonnes de la galerie de captures selon leur nombre (classes écrites en entier pour Tailwind). */
const colonnesCaptures: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

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

      {captures.length === 1 && (
        // Une seule capture (souvent au format paysage) : pleine largeur.
        <a href={captures[0].image} className="mt-e5 block">
          <Image src={captures[0].image} sizes="min(100vw, 72rem)" alt={captures[0].description ?? ''} loading="lazy" className="w-full border border-base-300" />
        </a>
      )}
      {captures.length > 1 && (
        <ul className={`carousel carousel-center mt-e5 w-full gap-e4 md:grid ${colonnesCaptures[Math.min(captures.length, 4)]}`}>
          {captures.map((c, i) => (
            <li key={i} className="carousel-item w-3/5 sm:w-2/5 md:w-auto">
              <a href={c.image} className="block w-full">
                <Image src={c.image} sizes="(min-width: 768px) 36rem, 100vw" alt={c.description ?? ''} loading="lazy" className="w-full border border-base-300" />
              </a>
            </li>
          ))}
        </ul>
      )}

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

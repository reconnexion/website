import { Bloc, Paragraphes, Surtitre } from './_commun';
import type { Champ } from './types';
import { STATUTS, type Statut } from '../lib/applications';
import { ExternalLink, GitBranch } from 'lucide-react';

/** Couleur de l'étiquette de statut (classes écrites en entier pour Tailwind). */
const couleursStatut: Record<Statut, string> = {
  'En ligne': 'border-vert-fonce bg-vert-fonce text-fond',
  'En test': 'border-bleu-fonce bg-bleu-fonce text-fond',
  'En développement': 'border-gris bg-gris text-fond',
};

/** Étiquette du statut d'une application (sur sa page). */
function EtiquetteStatut({ statut, className = '' }: { statut?: Statut; className?: string }) {
  if (!statut || !couleursStatut[statut]) return null;
  return <span className={`badge rounded-none font-semibold ${couleursStatut[statut]} ${className}`.trim()}>{statut}</span>;
}

type Bouton = { texte: string; lien: string; style?: 'principal' | 'secondaire' };
type Capture = { image: string; description?: string };
type Info = { libelle: string; valeur?: string };

export type FicheApplicationProps = {
  /** Page parente, affichée au-dessus du titre comme le surtitre des autres pages. */
  surtitre?: { texte: string; lien?: string };
  titre: string;
  statut?: Statut;
  logo?: string;
  sous_titre?: string;
  boutons?: Bouton[];
  captures?: Capture[];
  infos?: Info[];
};

/** Colonnes de la galerie de captures selon leur nombre (classes écrites en entier pour Tailwind). */
const colonnesCaptures: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

export function FicheApplication({ surtitre, titre, statut, logo, sous_titre, boutons = [], captures = [], infos: infosFiche = [] }: FicheApplicationProps) {
  // Le statut s'affiche en étiquette sur la ligne « Statut » des informations (ajoutée en tête si la fiche n'en a pas).
  const estStatut = (info: Info) => info.libelle.trim().toLowerCase() === 'statut';
  const infos = statut && !infosFiche.some(estStatut) ? [{ libelle: 'Statut' }, ...infosFiche] : infosFiche;
  return (
    // Même en-tête que les autres pages (cf. Bandeau) : surtitre, h1.
    <Bloc>
      <div className="grid items-start gap-e4 md:grid-cols-[1fr_auto]">
        <div>
          <Surtitre texte={surtitre?.texte} lien={surtitre?.lien} />
          <div className="mb-e3 flex items-center gap-e4">
            {logo && <img src={logo} alt="" className="size-12 shrink-0 sm:size-16" />}
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
          <img src={captures[0].image} alt={captures[0].description ?? ''} loading="lazy" className="w-full border border-base-300" />
        </a>
      )}
      {captures.length > 1 && (
        <ul className={`carousel carousel-center mt-e5 w-full gap-e4 md:grid ${colonnesCaptures[Math.min(captures.length, 4)]}`}>
          {captures.map((c, i) => (
            <li key={i} className="carousel-item w-3/5 sm:w-2/5 md:w-auto">
              <a href={c.image} className="block w-full">
                <img src={c.image} alt={c.description ?? ''} loading="lazy" className="w-full border border-base-300" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {infos.length > 0 && (
        <dl className="mt-e5 grid gap-x-e5 gap-y-e4 md:grid-cols-[12rem_1fr]">
          {infos.map((info, i) => (
            <div key={i} className="contents">
              <dt className="font-titre font-semibold">{info.libelle}</dt>
              <dd className="max-w-texte">
                {estStatut(info) && statut ? (
                  <div className="flex flex-col items-start gap-e2">
                    <EtiquetteStatut statut={statut} className="badge-lg" />
                    <Paragraphes texte={info.valeur} />
                  </div>
                ) : (
                  <Paragraphes texte={info.valeur} />
                )}
              </dd>
            </div>
          ))}
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
    hint: 'Affiché en étiquette sur la ligne « Statut » des informations de la page de l’application (le texte de cette ligne s’affiche dessous).',
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
    name: 'infos',
    label: 'Informations',
    widget: 'list',
    required: false,
    summary: '{{libelle}}',
    hint: 'Ex. Utilisateurs, Statut (précisions sous l’étiquette de statut), Description. Une page est créée pour l’application dès qu’il y a des captures ou des informations.',
    fields: [
      { name: 'libelle', label: 'Libellé', widget: 'string' },
      { name: 'valeur', label: 'Valeur', widget: 'text', required: false },
    ],
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

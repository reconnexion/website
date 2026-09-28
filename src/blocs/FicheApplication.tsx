import { Bloc, Paragraphes, Surtitre } from './_commun';
import type { Champ } from './types';

type Bouton = { texte: string; lien: string; style?: 'principal' | 'secondaire' };
type Capture = { image: string; description?: string };
type Info = { libelle: string; valeur?: string };

export type FicheApplicationProps = {
  /** Page parente, affichée au-dessus du titre comme le surtitre des autres pages. */
  surtitre?: { texte: string; lien?: string };
  titre: string;
  logo?: string;
  sous_titre?: string;
  boutons?: Bouton[];
  captures?: Capture[];
  infos?: Info[];
};

/** Colonnes de la galerie de captures selon leur nombre (classes écrites en entier pour Tailwind). */
const colonnesCaptures: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

export function FicheApplication({ surtitre, titre, logo, sous_titre, boutons = [], captures = [], infos = [] }: FicheApplicationProps) {
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
            {boutons.map((b, i) => (
              <a
                key={i}
                href={b.lien}
                className={`btn btn-lg uppercase ${b.style === 'secondaire' ? 'border-gris bg-gris text-fond hover:bg-noir' : 'btn-primary'}`}
              >
                {b.texte}
              </a>
            ))}
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
                <Paragraphes texte={info.valeur} />
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
    hint: 'Ex. Utilisateurs, Statut, Description. Une page est créée pour l’application dès qu’il y a des captures ou des informations.',
    fields: [
      { name: 'libelle', label: 'Libellé', widget: 'string' },
      { name: 'valeur', label: 'Valeur', widget: 'text', required: false },
    ],
  },
];

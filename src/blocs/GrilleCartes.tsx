import { Bloc, Boutons, Paragraphes, TitreBloc, champBoutons, champFond, champIconeTitre, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

type Carte = { icone?: string; titre: string; texte?: string };

export type GrilleCartesProps = {
  fond?: Fond;
  titre?: string;
  icone?: string;
  texte?: string;
  colonnes?: '1' | '2' | '3' | '4';
  cartes?: Carte[];
  /** Texte sous les cartes (avant les boutons centrés). */
  texte_apres?: string;
  boutons?: { texte: string; lien: string }[];
  texte_grand?: boolean;
  sans_cadre?: boolean;
  boutons_centres?: boolean;
  rapproche?: boolean;
};

/** Classes écrites en entier pour Tailwind. */
const classesColonnes = { '1': '', '2': 'md:grid-cols-2', '3': 'md:grid-cols-2 lg:grid-cols-3', '4': 'md:grid-cols-2 lg:grid-cols-4' };

/**
 * Grille de cartes (avantages, services…) : icône facultative, titre, texte facultatif.
 * Les boutons (ex. « En savoir plus ») sont en haut à droite, au niveau du titre ; en bas s'il n'y a pas de titre,
 * ou centrés sous les cartes avec `boutons_centres` (ex. « S'inscrire »).
 */
export function GrilleCartes({ fond = 'blanc', titre, icone, texte, colonnes = '2', cartes = [], texte_apres, boutons = [], texte_grand, sans_cadre, boutons_centres, rapproche }: GrilleCartesProps) {
  const boutonsEnHaut = !!titre && boutons.length > 0 && !boutons_centres;
  return (
    <Bloc fond={fond} className={rapproche ? 'bloc-rapproche' : ''}>
      {boutonsEnHaut ? (
        <div className="mb-e4 flex flex-wrap items-center justify-between gap-x-e4 gap-y-e3">
          <TitreBloc titre={titre} icone={icone} className="mb-0!" />
          <Boutons boutons={boutons} className="mt-0!" />
        </div>
      ) : (
        <TitreBloc titre={titre} icone={icone} />
      )}
      <Paragraphes texte={texte} className="mb-e4" />
      <ul className={`grid ${sans_cadre ? 'gap-e5' : 'gap-e4'} ${classesColonnes[colonnes] ?? classesColonnes['2']}`}>
        {cartes.map((c, i) => {
          const Icone = c.icone ? icones[c.icone] : undefined;
          if (sans_cadre) {
            // Sans cadre : chaque élément est une petite section, titre à la taille des titres de section
            // (h2 si le bloc n'a pas de titre), icône de la hauteur du titre.
            const Titre = titre ? 'h3' : 'h2';
            return (
              <li key={i}>
                <Titre className="flex items-center gap-e2 text-xl">
                  {Icone && <Icone size="0.9em" aria-hidden="true" className="shrink-0 text-vert-fonce" />}
                  {c.titre}
                </Titre>
                <Paragraphes texte={c.texte} className={`mt-e3${texte_grand ? ' text-ml' : ''}`} />
              </li>
            );
          }
          return (
            <li key={i} className="flex gap-e3 bg-base-200 p-e4 text-noir">
              {Icone && (
                <span className="grid size-10 shrink-0 place-items-center bg-primary text-primary-content">
                  <Icone size={22} aria-hidden="true" />
                </span>
              )}
              <div>
                <h3 className="text-l">{c.titre}</h3>
                <Paragraphes texte={c.texte} className={`mt-e2 text-gris${texte_grand ? ' text-ml' : ''}`} />
              </div>
            </li>
          );
        })}
      </ul>
      <Paragraphes texte={texte_apres} className="mt-e4" />
      {!boutonsEnHaut && <Boutons boutons={boutons} className={boutons_centres ? 'mt-e5 justify-center' : ''} />}
    </Bloc>
  );
}

export const grilleCartes: DefinitionBloc<GrilleCartesProps> = {
  name: 'grille_cartes',
  label: 'Grille de cartes',
  Component: GrilleCartes,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    champIconeTitre,
    { name: 'texte', label: 'Introduction', widget: 'text', required: false },
    { name: 'colonnes', label: 'Cartes par ligne (grand écran)', widget: 'select', options: ['1', '2', '3', '4'], default: '2', required: false },
    {
      name: 'cartes',
      label: 'Cartes',
      widget: 'list',
      summary: '{{titre}}',
      fields: [
        { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
        { name: 'titre', label: 'Titre', widget: 'string' },
        { name: 'texte', label: 'Texte', widget: 'text', required: false },
      ],
    },
    { name: 'sans_cadre', label: 'Sans cadre (icône et texte directement sur le fond, titres plus grands)', widget: 'boolean', required: false, default: false },
    { name: 'texte_apres', label: 'Texte sous les cartes', widget: 'text', required: false },
    { name: 'texte_grand', label: 'Texte des cartes plus grand', widget: 'boolean', required: false, default: false },
    champBoutons,
    {
      name: 'rapproche',
      label: 'Rapprocher du bloc précédent',
      widget: 'boolean',
      required: false,
      default: false,
      hint: 'Réduit l’espace avec le bloc au-dessus, s’il a le même fond (suite de la même section).',
    },
    { name: 'boutons_centres', label: 'Boutons centrés sous les cartes', widget: 'boolean', required: false, default: false },
  ],
};

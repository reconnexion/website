import { Bloc, Boutons, Paragraphes, TitreBloc, champBoutons, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

type Carte = { icone?: string; titre: string; texte?: string };

export type GrilleCartesProps = {
  fond?: Fond;
  titre?: string;
  texte?: string;
  colonnes?: '2' | '3' | '4';
  cartes?: Carte[];
  boutons?: { texte: string; lien: string }[];
};

/** Classes écrites en entier pour Tailwind. */
const classesColonnes = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-2 lg:grid-cols-3', '4': 'md:grid-cols-2 lg:grid-cols-4' };

/**
 * Grille de cartes (avantages, services…) : icône facultative, titre, texte facultatif.
 * Les boutons (ex. « En savoir plus ») sont en haut à droite, au niveau du titre ; en bas s'il n'y a pas de titre.
 */
export function GrilleCartes({ fond = 'blanc', titre, texte, colonnes = '2', cartes = [], boutons = [] }: GrilleCartesProps) {
  const boutonsEnHaut = !!titre && boutons.length > 0;
  return (
    <Bloc fond={fond}>
      {boutonsEnHaut ? (
        <div className="mb-e4 flex flex-wrap items-center justify-between gap-x-e4 gap-y-e3">
          <TitreBloc titre={titre} className="mb-0!" />
          <Boutons boutons={boutons} className="mt-0!" />
        </div>
      ) : (
        <TitreBloc titre={titre} />
      )}
      <Paragraphes texte={texte} className="mb-e4 max-w-texte" />
      <ul className={`grid gap-e4 ${classesColonnes[colonnes] ?? classesColonnes['2']}`}>
        {cartes.map((c, i) => {
          const Icone = c.icone ? icones[c.icone] : undefined;
          return (
            <li key={i} className="flex gap-e3 bg-base-200 p-e4 text-noir">
              {Icone && (
                <span className="grid size-10 shrink-0 place-items-center bg-primary text-primary-content">
                  <Icone size={22} aria-hidden="true" />
                </span>
              )}
              <div>
                <h3 className="text-l">{c.titre}</h3>
                <Paragraphes texte={c.texte} className="mt-e2 text-gris" />
              </div>
            </li>
          );
        })}
      </ul>
      {!boutonsEnHaut && <Boutons boutons={boutons} />}
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
    { name: 'texte', label: 'Introduction', widget: 'text', required: false },
    { name: 'colonnes', label: 'Cartes par ligne (grand écran)', widget: 'select', options: ['2', '3', '4'], default: '2', required: false },
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
    champBoutons,
  ],
};

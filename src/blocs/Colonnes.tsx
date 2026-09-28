import { Bloc, BoutonAction, Paragraphes, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

type Colonne = { titre: string; texte?: string; bouton_texte?: string; bouton_lien?: string };

export type ColonnesProps = {
  fond?: Fond;
  titre?: string;
  colonnes?: Colonne[];
};

/** Plusieurs appels à l'action côte à côte : titre, texte, bouton. */
export function Colonnes({ fond = 'blanc', titre, colonnes = [] }: ColonnesProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-e5">
        {colonnes.map((c, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <TitreBloc titre={c.titre} />
            <Paragraphes texte={c.texte} />
            <div className="mt-auto pt-e4">
              <BoutonAction texte={c.bouton_texte} lien={c.bouton_lien} />
            </div>
          </div>
        ))}
      </div>
    </Bloc>
  );
}

export const colonnes: DefinitionBloc<ColonnesProps> = {
  name: 'colonnes',
  label: 'Colonnes avec bouton',
  Component: Colonnes,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'colonnes',
      label: 'Colonnes',
      widget: 'list',
      summary: '{{titre}}',
      fields: [
        { name: 'titre', label: 'Titre', widget: 'string' },
        { name: 'texte', label: 'Texte', widget: 'text', required: false },
        { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
        { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
      ],
    },
  ],
};

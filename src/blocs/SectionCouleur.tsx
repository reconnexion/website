import { Bloc, BoutonAction, Paragraphes, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type SectionCouleurProps = {
  fond?: Fond;
  alignement?: 'centre' | 'gauche';
  titre?: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
};

/** Texte centré sur un fond de couleur (annonce, raison d'être, newsletter…). */
export function SectionCouleur({ fond = 'vert', alignement = 'centre', titre, texte, bouton_texte, bouton_lien }: SectionCouleurProps) {
  return (
    <Bloc fond={fond}>
      <div className={alignement === 'gauche' ? '' : 'mx-auto max-w-[48rem] text-center'}>
        <TitreBloc titre={titre} />
        <Paragraphes texte={texte} />
        {bouton_texte && bouton_lien && (
          <div className="mt-e4">
            <BoutonAction texte={bouton_texte} lien={bouton_lien} />
          </div>
        )}
      </div>
    </Bloc>
  );
}

export const sectionCouleur: DefinitionBloc<SectionCouleurProps> = {
  name: 'section_couleur',
  label: 'Section colorée',
  Component: SectionCouleur,
  fields: [
    { ...champFond, default: 'vert' },
    { name: 'alignement', label: 'Alignement', widget: 'select', options: ['centre', 'gauche'], default: 'centre', required: false },
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'texte',
      label: 'Texte',
      widget: 'text',
      required: false,
      hint: 'Ligne vide = nouveau paragraphe. **gras**, [texte du lien](https://…).',
    },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
  ],
};

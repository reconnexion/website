import { Bloc, BoutonAction, Paragraphes, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

export type SectionCouleurProps = {
  fond?: Fond;
  alignement?: 'centre' | 'gauche';
  icone?: string;
  titre?: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
  bouton_icone?: string;
};

/** Texte centré sur un fond de couleur (annonce, raison d'être, newsletter…). */
export function SectionCouleur({ fond = 'vert', alignement = 'centre', icone, titre, texte, bouton_texte, bouton_lien, bouton_icone }: SectionCouleurProps) {
  const Icone = icone ? icones[icone] : undefined;
  return (
    <Bloc fond={fond}>
      <div className={alignement === 'gauche' ? '' : 'mx-auto max-w-texte text-center'}>
        {Icone ? (
          <div className={`mb-e4 flex items-center gap-e3${alignement === 'gauche' ? '' : ' justify-center'}`}>
            <Icone size={32} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
            <TitreBloc titre={titre} className="mb-0!" />
            {alignement !== 'gauche' && <Icone size={32} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
          </div>
        ) : (
          <TitreBloc titre={titre} />
        )}
        <Paragraphes texte={texte} className="text-l leading-snug" />
        {bouton_texte && bouton_lien && (
          <div className="mt-e4">
            <BoutonAction texte={bouton_texte} lien={bouton_lien} icone={bouton_icone} />
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
    { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false, hint: 'Affichée de chaque côté du titre (à gauche seulement si le texte est aligné à gauche), dans la couleur du texte.' },
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
    { name: 'bouton_icone', label: 'Icône du bouton', widget: 'select', options: nomsIcones, required: false },
  ],
};

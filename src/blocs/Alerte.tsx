import { Bloc, Paragraphes, SurFondClair, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

type Couleur = 'vert' | 'bleu' | 'ardoise' | 'gris';

/** Teinte claire du fond et couleur de l'icône (classes écrites en entier pour Tailwind). */
const classesCouleur: Record<Couleur, { boite: string; icone: string }> = {
  vert: { boite: 'bg-vert/10', icone: 'text-vert-fonce' },
  bleu: { boite: 'bg-bleu/10', icone: 'text-bleu-fonce' },
  ardoise: { boite: 'bg-ardoise/10', icone: 'text-ardoise' },
  gris: { boite: 'bg-fond-2', icone: 'text-gris' },
};

export type AlerteProps = {
  fond?: Fond;
  icone?: string;
  couleur?: Couleur;
  texte?: string;
};

/**
 * Message mis en évidence dans le fil de la page (information pratique, avertissement…) : icône et teinte
 * claire, sur toute la largeur du contenu. Collé au bloc précédent s'il a le même fond (`bloc-rapproche`, theme.css).
 */
export function Alerte({ fond = 'blanc', icone, couleur = 'vert', texte }: AlerteProps) {
  const Icone = icone ? icones[icone] : undefined;
  const c = classesCouleur[couleur] ?? classesCouleur.vert;
  return (
    <Bloc fond={fond} className="bloc-rapproche">
      <SurFondClair>
        <div className="bg-fond text-noir">
          <div role="note" className={`flex gap-e3 p-e4 ${c.boite}`}>
            {Icone && <Icone size={24} aria-hidden="true" className={`mt-0.5 shrink-0 ${c.icone}`} />}
            <Paragraphes texte={texte} />
          </div>
        </div>
      </SurFondClair>
    </Bloc>
  );
}

export const alerte: DefinitionBloc<AlerteProps> = {
  name: 'alerte',
  label: 'Alerte (message mis en évidence)',
  Component: Alerte,
  fields: [
    champFond,
    { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
    { name: 'couleur', label: 'Couleur', widget: 'select', options: ['vert', 'bleu', 'ardoise', 'gris'], default: 'vert', required: false },
    {
      name: 'texte',
      label: 'Texte',
      widget: 'text',
      hint: 'Commencez par une phrase en **gras** pour l’essentiel. Ligne vide = nouveau paragraphe.',
    },
  ],
};

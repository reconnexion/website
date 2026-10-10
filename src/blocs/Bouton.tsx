import { Bloc, Boutons, champBoutons, champFond, champRapproche, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type BoutonProps = {
  fond?: Fond;
  boutons?: { texte: string; lien: string; icone?: string }[];
  alignement?: 'centre' | 'gauche';
  /** Réduit l'espace avec le bloc précédent s'il a le même fond (suite de la même section). */
  rapproche?: boolean;
};

/** Un ou plusieurs boutons seuls, à placer n'importe où dans la page (ex. « S'inscrire » sous un texte). */
export function Bouton({ fond = 'blanc', boutons = [], alignement = 'centre', rapproche }: BoutonProps) {
  return (
    <Bloc fond={fond} className={rapproche ? 'bloc-rapproche' : ''}>
      <Boutons boutons={boutons} className={`mt-0!${alignement === 'gauche' ? '' : ' justify-center'}`} />
    </Bloc>
  );
}

export const bouton: DefinitionBloc<BoutonProps> = {
  name: 'bouton',
  label: 'Bouton',
  Component: Bouton,
  fields: [
    champFond,
    { ...champBoutons, required: true },
    { name: 'alignement', label: 'Alignement', widget: 'select', options: ['centre', 'gauche'], default: 'centre', required: false },
    champRapproche,
  ],
};

import { Bloc, TitreBloc, champFond, type Fond } from './_commun';
import { GrilleLogos } from './_logos';
import type { DefinitionBloc } from './types';
import type { Logo } from '../lib/types';

export type LogosProps = {
  fond?: Fond;
  titre?: string;
  logos?: Logo[];
};

/** Grille de logos saisis à la main (ex. partenaires d'un événement), contrairement à « Partenaires » qui lit Grist. */
export function Logos({ fond = 'blanc', titre, logos = [] }: LogosProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <GrilleLogos logos={logos} />
    </Bloc>
  );
}

export const logos: DefinitionBloc<LogosProps> = {
  name: 'logos',
  label: 'Logos (saisis à la main)',
  Component: Logos,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'logos',
      label: 'Logos',
      widget: 'list',
      summary: '{{nom}}',
      fields: [
        { name: 'nom', label: 'Nom', widget: 'string' },
        { name: 'logo', label: 'Logo', widget: 'image', required: false },
        { name: 'lien', label: 'Lien', widget: 'string', required: false },
      ],
    },
  ],
};

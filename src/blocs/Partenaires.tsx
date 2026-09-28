import { Bloc, TitreBloc } from './_commun';
import { GrilleLogos } from './_logos';
import type { DefinitionBloc } from './types';
import type { Logo } from '../lib/types';
import { organisationsDemo } from '../lib/demo';

export type PartenairesProps = {
  titre?: string;
  /** Réglages éditables : document et table Grist. */
  document?: string;
  table?: string;
  texte_vide?: string;
  /** Injecté au rendu depuis Grist — pas édité dans le CMS. */
  organisations?: Logo[];
};

export function Partenaires({ titre, texte_vide, organisations = [] }: PartenairesProps) {
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {organisations.length === 0 ? texte_vide && <p className="text-gris">{texte_vide}</p> : <GrilleLogos logos={organisations} />}
    </Bloc>
  );
}

export const partenaires: DefinitionBloc<PartenairesProps> = {
  name: 'partenaires',
  label: 'Partenaires (depuis Grist)',
  Component: Partenaires,
  source: 'grist',
  donneesExemple: () => ({ organisations: organisationsDemo }),
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'document',
      label: 'Document Grist (identifiant)',
      widget: 'string',
      required: false,
      hint: 'Identifiant du document qui contient la table (celui de l’URL Grist). Vide : document par défaut du site.',
    },
    {
      name: 'table',
      label: 'Table Grist',
      widget: 'string',
      default: 'Organisations',
      hint: 'Colonnes Nom, Logo (pièce jointe) et Site web. Colonne Public facultative pour masquer une organisation.',
    },
    { name: 'texte_vide', label: 'Texte si aucune organisation', widget: 'string', required: false },
  ],
};

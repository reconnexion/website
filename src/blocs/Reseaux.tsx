import { Bloc, TitreBloc, champFond, type Fond } from './_commun';
import { GrilleLogos } from './_logos';
import type { DefinitionBloc } from './types';
import type { Logo } from '../lib/types';
import { logoReseau, selectionnerReseaux, type Reseau } from '../lib/reseaux';

export type ReseauxProps = {
  fond?: Fond;
  titre?: string;
  /** Réglage éditable : slugs des réseaux à afficher (tous si vide). */
  selection?: string[];
  /** Injecté au rendu depuis la collection « Réseaux » — pas édité dans le bloc. */
  reseaux?: Logo[];
};

/** Fiches injectées dans l'aperçu du CMS par scripts/build-cms.mjs. */
declare const __RESEAUX__: Reseau[] | undefined;

export function Reseaux({ fond = 'blanc', titre, reseaux = [] }: ReseauxProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <GrilleLogos logos={reseaux} />
    </Bloc>
  );
}

export const reseaux: DefinitionBloc<ReseauxProps> = {
  name: 'reseaux',
  label: 'Réseaux',
  Component: Reseaux,
  donneesExemple: (d) => ({
    reseaux: selectionnerReseaux(typeof __RESEAUX__ !== 'undefined' ? __RESEAUX__ : [], d.selection).map(logoReseau),
  }),
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'selection',
      label: 'Réseaux affichés',
      widget: 'relation',
      collection: 'reseaux',
      value_field: '{{slug}}',
      search_fields: ['nom'],
      display_fields: ['{{nom}}'],
      multiple: true,
      required: false,
      hint: 'Laissez vide pour afficher tous les réseaux (collection « Réseaux »).',
    },
  ],
};

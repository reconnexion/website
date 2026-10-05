import type { ComponentType } from 'react';

/** Définition d'un champ Sveltia (sous-ensemble utile ici). */
export type Champ = {
  name: string;
  label: string;
  widget: 'string' | 'text' | 'image' | 'boolean' | 'number' | 'list' | 'select' | 'relation';
  required?: boolean;
  default?: unknown;
  hint?: string;
  options?: string[];
  fields?: Champ[];
  summary?: string;
  value_type?: 'int' | 'float';
  min?: number;
  max?: number;
  pattern?: [string, string];
  /** Widget « relation » : entrées d'une autre collection. */
  collection?: string;
  value_field?: string;
  search_fields?: string[];
  display_fields?: string[];
  multiple?: boolean;
};

/**
 * Un bloc = un composant React + la liste des champs éditables dans le CMS.
 * `source` indique qu'une partie du contenu vient de données live
 * (le CMS n'édite alors que les réglages du bloc, pas les données).
 */
export type DefinitionBloc<P = any> = {
  name: string;
  label: string;
  Component: ComponentType<P>;
  fields: Champ[];
  source?: 'grist' | 'discourse';
  /** Données injectées dans l'aperçu du CMS (exemples Grist, fiches d'applications, événements…). */
  donneesExemple?: (donnees: Record<string, unknown>) => Partial<P>;
};

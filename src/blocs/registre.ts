/**
 * Registre des blocs : LA source de vérité.
 * - le site l'utilise pour rendre les pages ;
 * - `scripts/build-cms.mjs` l'utilise pour générer la config Sveltia
 *   et l'aperçu du CMS.
 * Ajouter un bloc = créer son fichier dans src/blocs/ et l'ajouter ici.
 */
import { bandeau } from './Bandeau';
import { texteImage } from './TexteImage';
import { applications } from './Applications';
import { equipe } from './Equipe';
import { agenda } from './Agenda';
import { appel } from './Appel';
import { roles } from './Roles';
import { societaires } from './Societaires';
import { partenaires } from './Partenaires';
import { reseaux } from './Reseaux';
import { cartes } from './Cartes';
import { sectionCouleur } from './SectionCouleur';
import { annonce } from './Annonce';
import { video } from './Video';
import { colonnes } from './Colonnes';
import { texte } from './Texte';
import { offre } from './Offre';
import { grilleCartes } from './GrilleCartes';
import { encadre } from './Encadre';
import type { DefinitionBloc } from './types';

export const blocs: DefinitionBloc[] = [
  bandeau,
  annonce,
  sectionCouleur,
  texte,
  texteImage,
  offre,
  grilleCartes,
  encadre,
  video,
  applications,
  colonnes,
  equipe,
  roles,
  societaires,
  partenaires,
  reseaux,
  cartes,
  agenda,
  appel,
];

export const blocsParNom: Record<string, DefinitionBloc> = Object.fromEntries(
  blocs.map((b) => [b.name, b]),
);

/** Données d'un bloc telles que stockées dans les fichiers de contenu. */
export type DonneesBloc = { type: string } & Record<string, unknown>;

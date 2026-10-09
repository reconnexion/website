/**
 * Lecture des fichiers de contenu édités dans Sveltia (YAML dans src/content/).
 * Lus au build : une modification dans le CMS = un commit = un rebuild par la CI.
 */
import { parse } from 'yaml';
import type { DonneesBloc } from '../blocs/registre';
import { trierApplications, type Application } from './applications';
import { trierReseaux, type Reseau } from './reseaux';
import { trierCartes, trierTypes, type Carte, type ReglagesCartes, type TypeCarte } from './cartes';
import type { FicheEvenement } from './evenements';
import { lienVisioValide, type LienVisio } from './visios';

export type Page = {
  titre: string;
  slug: string;
  description?: string;
  sections: DonneesBloc[];
};

export type LienMenu = {
  texte: string;
  lien?: string;
  icone?: string;
  sous_menu?: { texte: string; lien: string }[];
};

export type Site = {
  nom: string;
  logo?: string;
  texte_menu?: string;
  menu: LienMenu[];
  pied_de_page?: string;
  texte_chargement?: string;
};

const fichiersPages = import.meta.glob('../content/pages/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const fichierSite = import.meta.glob('../content/site.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Sveltia enregistre les champs laissés vides sous forme de chaîne vide (`fond: ''`).
 * On les supprime pour que les valeurs par défaut des blocs s'appliquent.
 */
function sansChampsVides<T>(valeur: T): T {
  if (Array.isArray(valeur)) return valeur.map(sansChampsVides) as T;
  if (valeur && typeof valeur === 'object')
    return Object.fromEntries(
      Object.entries(valeur)
        .filter(([, v]) => v !== '' && v !== null)
        .map(([k, v]) => [k, sansChampsVides(v)]),
    ) as T;
  return valeur;
}

export function toutesLesPages(): Page[] {
  return Object.values(fichiersPages).map((brut) => {
    const page = sansChampsVides(parse(brut) as Page);
    return { ...page, sections: page.sections ?? [] };
  });
}

const fichiersApplications = import.meta.glob('../content/applications/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Fiches de la collection « Applications », dans l'ordre choisi (champ `ordre`). */
export function toutesLesApplications(): Application[] {
  return trierApplications(Object.values(fichiersApplications).map((brut) => sansChampsVides(parse(brut) as Application)));
}

const fichiersReseaux = import.meta.glob('../content/reseaux/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Fiches de la collection « Réseaux », dans l'ordre choisi (champ `ordre`). */
export function tousLesReseaux(): Reseau[] {
  return trierReseaux(Object.values(fichiersReseaux).map((brut) => sansChampsVides(parse(brut) as Reseau)));
}

const fichiersCartes = import.meta.glob('../content/cartes/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;
const fichiersTypesCartes = import.meta.glob('../content/types-de-cartes/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const lire = <T>(fichiers: Record<string, string>) => Object.values(fichiers).map((brut) => sansChampsVides(parse(brut) as T));

/** Types de cartes (Fléaux, Solutions…), dans l'ordre choisi. */
export const tousLesTypesDeCartes = (): TypeCarte[] => trierTypes(lire<TypeCarte>(fichiersTypesCartes));

/** Cartes QR, triées par type puis par titre. */
export const toutesLesCartes = (): Carte[] => trierCartes(lire<Carte>(fichiersCartes), tousLesTypesDeCartes());


const fichierReglagesCartes = import.meta.glob('../content/reglages-cartes.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const reglagesCartes = (): ReglagesCartes => lire<ReglagesCartes>(fichierReglagesCartes)[0] ?? {};

/** Documents Grist cités dans les blocs des pages (champ `document`) : ceux dont le site peut servir les images. */
export function documentsGrist(): string[] {
  return toutesLesPages().flatMap((p) =>
    p.sections.map((s) => s.document).filter((d): d is string => typeof d === 'string' && !!d),
  );
}

export function reglagesSite(): Site {
  return sansChampsVides(parse(Object.values(fichierSite)[0]) as Site);
}

export type ReglagesActualites = {
  forum?: string;
  etiquette?: string;
  titre_liste?: string;
  lien_liste?: string;
  texte_lien_forum?: string;
  titre_auteur?: string;
  texte_profil_forum?: string;
  titre_reagir?: string;
  texte_reponses?: string;
  texte_likes?: string;
  titre_autres?: string;
  texte_tous?: string;
};

const fichierReglagesActualites = import.meta.glob('../content/reglages-actualites.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const reglagesActualites = (): ReglagesActualites => lire<ReglagesActualites>(fichierReglagesActualites)[0] ?? {};

/** Réglages des pages d'applications : sections ajoutées en bas de chaque page (ex. bandeau newsletter). */
export type ReglagesApplications = {
  sections_bas?: DonneesBloc[];
};

const fichierReglagesApplications = import.meta.glob('../content/reglages-applications.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const reglagesApplications = (): ReglagesApplications => lire<ReglagesApplications>(fichierReglagesApplications)[0] ?? {};

const fichiersEvenements = import.meta.glob('../content/evenements/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** Événements de l'agenda (collection « Événements »). Les occurrences sont calculées par lib/evenements.ts. */
export const tousLesEvenements = (): FicheEvenement[] => lire<FicheEvenement>(fichiersEvenements).filter((e) => e.titre && e.debut);

const fichiersVisios = import.meta.glob('../content/visios/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** Liens de visio courts (collection « Liens de visio »), sans ceux qui ne pointent pas vers meet.reconnexion.coop. */
export const tousLesLiensVisio = (): LienVisio[] => lire<Partial<LienVisio>>(fichiersVisios).filter(lienVisioValide);

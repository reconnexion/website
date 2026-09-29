/**
 * Cartes QR (reprise des « QrCards » Bazar de reconnexion.coop) : une fiche par carte dans src/content/cartes/,
 * des types de cartes (Fléaux, Solutions…) dans src/content/types-de-cartes/, des sets dans src/content/sets-de-cartes/.
 * Ce module ne lit pas les fichiers (voir contenu.ts) : il sert aussi à l'aperçu du CMS.
 */

export type Picto = { image?: string; texte?: string };

export type Carte = {
  titre: string;
  slug: string;
  /** Slug d'un type de carte. */
  type?: string;
  complexite?: 'aucune' | 'facile' | 'moyen' | 'complexe';
  /** Couleur de fond (bordure) ; à défaut, celle du type. */
  couleur?: string;
  visuel?: string;
  accroche?: string;
  pictos?: Picto[];
  /** Verso : « L'essentiel ». */
  essentiel?: string;
  /** URL du QR code ; à défaut, la page de la carte. */
  url_qr?: string;
  /** Contenus complémentaires (Markdown). */
  description?: string;
  mots_cles?: string[];
  cartes_liees?: string[];
  adresse?: string;
  /** Position (GeoJSON, widget map de Sveltia). */
  position?: string;
  date_debut?: string;
  date_fin?: string;
  contributeurices?: string;
  /** Sources, références (Markdown). */
  ressources?: string;
  licence?: string;
  /** Notes d'édition : jamais publiées. */
  notes_edition?: string;
  maturite?: 'esquisse' | 'encours' | 'aboutie';
};

export type TypeCarte = { slug: string; nom: string; ordre?: number; couleur?: string };

export type SetCartes = { slug: string; nom: string; description?: string; cartes?: string[] };

export const COMPLEXITES = { aucune: 'Aucune', facile: 'Facile', moyen: 'Moyen', complexe: 'Complexe' } as const;
export const MATURITES = { esquisse: 'Brouillon', encours: 'En cours', aboutie: 'Aboutie' } as const;

/** Couleur par défaut d'une carte sans couleur ni type coloré. */
const COULEUR_DEFAUT = '#5f6166';

export const trierTypes = (types: TypeCarte[]) =>
  [...types].sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.nom.localeCompare(b.nom));

/** Cartes triées par type (ordre des types) puis par titre. */
export function trierCartes(cartes: Carte[], types: TypeCarte[]): Carte[] {
  const rang = new Map(trierTypes(types).map((t, i) => [t.slug, i]));
  return [...cartes].sort(
    (a, b) =>
      (rang.get(a.type ?? '') ?? 999) - (rang.get(b.type ?? '') ?? 999) || a.titre.localeCompare(b.titre, 'fr'),
  );
}

export const couleurCarte = (c: Carte, types: TypeCarte[]) =>
  c.couleur || types.find((t) => t.slug === c.type)?.couleur || COULEUR_DEFAUT;

export const nomType = (c: Carte, types: TypeCarte[]) => types.find((t) => t.slug === c.type)?.nom;

export const lienCarte = (c: Carte) => `/cartes/${c.slug}`;

/** Adresse encodée dans le QR code : URL choisie, sinon la page de la carte sur le site. */
export const urlQr = (c: Carte, site: string) => c.url_qr || new URL(lienCarte(c), site).href;

/** Libellés des pages de cartes (src/content/reglages-cartes.yml, « Réglages du site → Cartes QR » dans le CMS). */
export type ReglagesCartes = {
  titre_liste?: string;
  lien_liste?: string;
  texte_tous?: string;
  texte_favoris?: string;
  texte_voir?: string;
  texte_imprimer?: string;
  texte_favori_ajouter?: string;
  texte_favori_retirer?: string;
  texte_vue_impression?: string;
  texte_ajouter?: string;
  texte_noir_et_blanc?: string;
  texte_lancer_impression?: string;
  texte_vide?: string;
  libelles?: Record<string, string>;
};

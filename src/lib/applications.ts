/**
 * Applications du Réseau Social Universel : une fiche par application dans src/content/applications/,
 * éditée une seule fois dans le CMS (collection « Applications »).
 * Les listes (bloc Applications) et la page de chaque application (/applications/<slug>) en dérivent.
 * Ce module ne lit pas les fichiers (voir contenu.ts) : il sert aussi à l'aperçu du CMS.
 */

export type BoutonApplication = { texte: string; lien: string; style?: 'principal' | 'secondaire' };

export type Application = {
  slug: string;
  nom: string;
  ordre?: number;
  logo?: string;
  accroche?: string;
  /** Description courte, affichée dans les listes d'applications. */
  resume?: string;
  /** Image au format paysage (16:9), affichée dans les listes. */
  vignette?: string;
  boutons?: BoutonApplication[];
  captures?: { image: string; description?: string }[];
  infos?: { libelle: string; valeur?: string }[];
};

/** Une application a sa propre page dès que sa fiche a des captures ou des informations. */
export const aUnePage = (a: Application) => !!(a.captures?.length || a.infos?.length);

export const lienApplication = (a: Application) => (aUnePage(a) ? `/applications/${a.slug}` : undefined);

export const trierApplications = (apps: Application[]) =>
  [...apps].sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.nom.localeCompare(b.nom));

/** Applications choisies dans un bloc (par slug, dans l'ordre choisi) ; toutes si aucune n'est choisie. */
export function selectionnerApplications(apps: Application[], selection?: unknown): Application[] {
  const slugs = Array.isArray(selection) ? selection.filter((s): s is string => typeof s === 'string') : [];
  if (!slugs.length) return trierApplications(apps);
  return slugs.map((s) => apps.find((a) => a.slug === s)).filter((a): a is Application => !!a);
}

/** Données affichées pour une application dans une liste (bloc Applications). */
export const carteApplication = (a: Application) => ({
  nom: a.nom,
  description: a.resume,
  image: a.vignette,
  lien: lienApplication(a),
});

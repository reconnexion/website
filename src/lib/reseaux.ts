/**
 * Réseaux dont Reconnexion fait partie : une fiche par réseau dans src/content/reseaux/
 * (collection « Réseaux » du CMS), affichés par le bloc Réseaux.
 * Ce module ne lit pas les fichiers (voir contenu.ts) : il sert aussi à l'aperçu du CMS.
 */
import type { Logo } from './types';

export type Reseau = { slug: string; nom: string; ordre?: number; logo?: string; site?: string };

export const trierReseaux = (reseaux: Reseau[]) =>
  [...reseaux].sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.nom.localeCompare(b.nom));

/** Réseaux choisis dans un bloc (par slug, dans l'ordre choisi) ; tous si aucun n'est choisi. */
export function selectionnerReseaux(reseaux: Reseau[], selection?: unknown): Reseau[] {
  const slugs = Array.isArray(selection) ? selection.filter((s): s is string => typeof s === 'string') : [];
  if (!slugs.length) return trierReseaux(reseaux);
  return slugs.map((s) => reseaux.find((r) => r.slug === s)).filter((r): r is Reseau => !!r);
}

export const logoReseau = (r: Reseau): Logo => ({ nom: r.nom, logo: r.logo, lien: r.site });

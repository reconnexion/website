/** Liens de visio courts : /visio/<slug> → salle meet.reconnexion.coop (collection « Liens de visio »). */
export const PREFIXE_VISIO = 'https://meet.reconnexion.coop/';

export type LienVisio = {
  nom: string;
  slug: string;
  lien: string;
};

/** Seuls les liens vers meet.reconnexion.coop sont suivis (pas de redirection ouverte). */
export const lienVisioValide = (v: Partial<LienVisio>): v is LienVisio =>
  !!v.slug && typeof v.lien === 'string' && v.lien.startsWith(PREFIXE_VISIO) && /^[^/\s?#]+$/.test(v.lien.slice(PREFIXE_VISIO.length));

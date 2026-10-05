import type { APIRoute } from 'astro';
import { COLONNES_IMAGES, lireImage } from '../../../../../../../lib/grist';
import { documentsGrist } from '../../../../../../../lib/contenu';

// Images (photos, logos) stockées en pièces jointes Grist : la clé d'API reste sur le serveur.
// Seuls les documents utilisés par le site (celui par défaut et ceux cités dans les pages)
// et les colonnes Photo / Logo / Image sont autorisés (cf. COLONNES_IMAGES).
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { doc, table, colonne } = params;
  const id = Number(params.id);
  const docs = new Set([process.env.GRIST_DOC_ID, ...documentsGrist()]);
  if (!doc || !table || !colonne || !docs.has(doc) || !COLONNES_IMAGES.includes(colonne) || !Number.isInteger(id))
    return new Response(null, { status: 404 });
  try {
    const image = await lireImage(doc, table, colonne, id);
    if (!image) return new Response(null, { status: 404 });
    return new Response(image.donnees, {
      headers: { 'Content-Type': image.type, 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err) {
    console.error('[grist] image', err);
    return new Response(null, { status: 502 });
  }
};

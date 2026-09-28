import type { APIRoute } from 'astro';
import { prochainsEvenements } from '../../lib/caldav';

// Endpoint rendu à la demande : proxy vers CalDAV pour les client islands.
// Les identifiants CalDAV restent sur le serveur ; seuls les champs publics sortent.
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const n = Math.min(Math.max(Number(url.searchParams.get('n')) || 4, 1), 20);
  const evenements = await prochainsEvenements(n);
  return new Response(JSON.stringify(evenements), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30',
    },
  });
};

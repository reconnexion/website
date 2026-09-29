import type { APIRoute } from 'astro';
import { originePublique } from '../../lib/origine';

/**
 * Connexion au CMS (Sveltia) avec un compte GitHub — étape 1 : redirection vers GitHub.
 * Sveltia ouvre cette page dans une popup (backend.base_url + auth_endpoint, cf. src/cms/config.ts).
 *
 * Variables d'environnement : GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (application OAuth GitHub
 * dont l'URL de callback est https://<domaine>/api/callback).
 * Seules les personnes ayant les droits d'écriture sur le dépôt peuvent ensuite enregistrer.
 */
export const prerender = false;

export const GET: APIRoute = ({ request, url, cookies, redirect }) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return new Response('GITHUB_CLIENT_ID manquant', { status: 500 });

  // Jeton anti-CSRF, vérifié au retour de GitHub.
  const state = crypto.randomUUID();
  cookies.set('oauth_state', state, { path: '/api', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', clientId);
  github.searchParams.set('redirect_uri', new URL('/api/callback', originePublique(request, url)).href);
  github.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  github.searchParams.set('state', state);
  return redirect(github.href);
};

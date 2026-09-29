import type { APIRoute } from 'astro';

/**
 * Connexion au CMS avec un compte GitHub — étape 2 : GitHub renvoie ici avec un code,
 * échangé contre un jeton d'accès, puis transmis à la fenêtre du CMS par postMessage
 * (protocole des CMS Decap / Sveltia : « authorizing:github », puis « authorization:github:success:… »).
 */
export const prerender = false;

function reponse(message: string, origine: string) {
  // Le message n'est envoyé qu'à la fenêtre du CMS de ce même site (origine vérifiée).
  const html = `<!doctype html><meta charset="utf-8"><body><script>
(() => {
  const origine = ${JSON.stringify(origine)};
  const message = ${JSON.stringify(message)};
  window.addEventListener('message', (e) => {
    if (e.origin !== origine) return;
    window.opener.postMessage(message, origine);
  }, { once: true });
  window.opener.postMessage('authorizing:github', origine);
})();
</script></body>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const erreur = (texte: string) =>
    reponse(`authorization:github:error:${JSON.stringify({ message: texte })}`, url.origin);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const attendu = cookies.get('oauth_state')?.value;
  cookies.delete('oauth_state', { path: '/api' });
  if (!code || !state || state !== attendu) return erreur('Requête de connexion invalide, veuillez réessayer.');

  const rep = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/api/callback', url.origin).href,
    }),
  });
  const donnees = (await rep.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!donnees.access_token) return erreur(donnees.error_description ?? 'Échec de la connexion à GitHub.');

  return reponse(
    `authorization:github:success:${JSON.stringify({ token: donnees.access_token, provider: 'github' })}`,
    url.origin,
  );
};

/**
 * Origine publique du site (https://domaine). Derrière le proxy de Coolify, le serveur Node reçoit
 * les requêtes en HTTP : on se fie aux en-têtes X-Forwarded-* posés par le proxy.
 */
export function originePublique(request: Request, url: URL): string {
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || url.protocol.replace(':', '');
  const hote = request.headers.get('x-forwarded-host')?.split(',')[0].trim() || url.host;
  return `${proto}://${hote}`;
}

/**
 * Nombre d'utilisateurs d'une application, côté serveur uniquement.
 * Les applications ActivityPods publient un document NodeInfo : /.well-known/nodeinfo donne l'adresse
 * du schéma 2.x, dont on lit `usage.users.total`. Résultat gardé en mémoire une heure ;
 * en cas d'erreur, on garde la dernière valeur connue.
 */

const CACHE_MS = 60 * 60_000;
const NE_PAS_RETENTER_MS = 5 * 60_000;

const cache = new Map<string, { t: number; total?: number }>();

async function lireJson<T>(url: string): Promise<T> {
  const rep = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!rep.ok) throw new Error(`NodeInfo ${rep.status} ${url}`);
  return rep.json() as Promise<T>;
}

async function lireTotal(origine: string): Promise<number | undefined> {
  const { links = [] } = await lireJson<{ links?: { rel: string; href: string }[] }>(`${origine}/.well-known/nodeinfo`);
  const lien = links.find((l) => /nodeinfo\.diaspora\.software\/ns\/schema\/2\./.test(l.rel));
  if (!lien) return undefined;
  const doc = await lireJson<{ usage?: { users?: { total?: unknown } } }>(lien.href);
  const total = doc.usage?.users?.total;
  return typeof total === 'number' ? total : undefined;
}

/** Nombre total d'utilisateurs de l'application servie à cette adresse (undefined si inconnu). */
export async function nombreUtilisateurs(adresse: string): Promise<number | undefined> {
  let origine: string;
  try {
    origine = new URL(adresse).origin;
  } catch {
    return undefined;
  }
  const enCache = cache.get(origine);
  const age = enCache ? Date.now() - enCache.t : Infinity;
  if (enCache && age < (enCache.total === undefined ? NE_PAS_RETENTER_MS : CACHE_MS)) return enCache.total;
  try {
    const total = await lireTotal(origine);
    cache.set(origine, { t: Date.now(), total: total ?? enCache?.total });
  } catch (e) {
    console.error(e);
    cache.set(origine, { t: Date.now(), total: enCache?.total });
  }
  return cache.get(origine)?.total;
}

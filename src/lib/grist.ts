/**
 * Lecture d'une table Grist via son API REST — côté serveur uniquement
 * (la clé d'API ne doit jamais arriver dans le navigateur).
 *
 * Variables d'environnement :
 *   GRIST_URL      ex. https://grist.reconnexion.coop
 *   GRIST_DOC_ID   identifiant du document
 *   GRIST_API_KEY  clé d'API (idéalement celle d'un compte en lecture seule)
 *
 * Colonnes attendues dans la table : Nom, Role, Photo, Lien, Public (case à cocher).
 * Si la colonne Public existe, seules les lignes cochées sont publiées.
 * Dans tous les cas, seules ces colonnes sortent du serveur.
 */
import type { Personne } from './types';
import { personnesDemo } from './demo';

const CACHE_MS = 60_000;
const cache = new Map<string, { t: number; data: Personne[] }>();

type LigneGrist = { id: number; fields: Record<string, unknown> };

const texte = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export async function lirePersonnes(table = 'Equipe'): Promise<Personne[]> {
  const { GRIST_URL, GRIST_DOC_ID, GRIST_API_KEY } = process.env;
  if (!GRIST_URL || !GRIST_DOC_ID || !GRIST_API_KEY) return personnesDemo;

  const enCache = cache.get(table);
  if (enCache && Date.now() - enCache.t < CACHE_MS) return enCache.data;

  const url = `${GRIST_URL.replace(/\/$/, '')}/api/docs/${GRIST_DOC_ID}/tables/${encodeURIComponent(table)}/records`;
  try {
    const rep = await fetch(url, {
      headers: { Authorization: `Bearer ${GRIST_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!rep.ok) throw new Error(`Grist ${rep.status}`);
    const { records } = (await rep.json()) as { records: LigneGrist[] };
    const data = records
      .filter((r) => r.fields.Public !== false)
      .map((r) => ({
        nom: texte(r.fields.Nom) ?? '',
        role: texte(r.fields.Role),
        photo: texte(r.fields.Photo),
        lien: texte(r.fields.Lien),
      }))
      .filter((p) => p.nom);
    cache.set(table, { t: Date.now(), data });
    return data;
  } catch (err) {
    console.error('[grist]', err);
    return enCache?.data ?? []; // en cas de panne : dernière version connue
  }
}

/**
 * Lecture de tables Grist via l'API REST — côté serveur uniquement
 * (la clé d'API ne doit jamais arriver dans le navigateur).
 *
 * Variables d'environnement :
 *   GRIST_URL      ex. https://grist.reconnexion.coop/o/equipe-operationnelle
 *   GRIST_DOC_ID   identifiant du document
 *   GRIST_API_KEY  clé d'API (idéalement celle d'un compte en lecture seule)
 *
 * Chaque fonction ne renvoie que des champs publics : les autres colonnes
 * (e-mails, téléphones…) ne sortent jamais du serveur.
 */
import type { Logo, Personne, Role, Societaire } from './types';
import { organisationsDemo, personnesDemo, rolesDemo, societairesDemo } from './demo';

const CACHE_MS = 60_000;

type LigneGrist = { id: number; fields: Record<string, unknown> };

const texte = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

const gristConfigure = () => {
  const { GRIST_URL, GRIST_DOC_ID, GRIST_API_KEY } = process.env;
  return !!(GRIST_URL && GRIST_DOC_ID && GRIST_API_KEY);
};

const cacheJson = new Map<string, { t: number; data: unknown }>();

/**
 * Appel GET à l'API d'un document Grist (par défaut GRIST_DOC_ID ; d'autres documents de la même
 * organisation sont lisibles avec la même clé). Cache d'une minute ; en cas de panne, dernière version connue.
 */
async function lireApi<T>(chemin: string, doc: string | undefined, secours: T): Promise<T> {
  const { GRIST_URL, GRIST_DOC_ID, GRIST_API_KEY } = process.env;
  const url = `${GRIST_URL!.replace(/\/$/, '')}/api/docs/${doc || GRIST_DOC_ID}/${chemin}`;
  const enCache = cacheJson.get(url);
  if (enCache && Date.now() - enCache.t < CACHE_MS) return enCache.data as T;
  try {
    const rep = await fetch(url, {
      headers: { Authorization: `Bearer ${GRIST_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!rep.ok) throw new Error(`Grist ${rep.status} (${chemin})`);
    const data = (await rep.json()) as T;
    cacheJson.set(url, { t: Date.now(), data });
    return data;
  } catch (err) {
    console.error('[grist]', err);
    return (enCache?.data as T) ?? secours;
  }
}

/** Lignes d'une table, dans l'ordre affiché dans Grist. */
async function lireTable(table: string, doc?: string): Promise<LigneGrist[]> {
  const { records } = await lireApi<{ records: LigneGrist[] }>(
    `tables/${encodeURIComponent(table)}/records?sort=manualSort`,
    doc,
    { records: [] },
  );
  return records;
}

/** Choix d'une colonne « Choice » / « Choice List », dans l'ordre défini dans Grist. */
async function lireChoix(table: string, colonne: string, doc?: string): Promise<string[]> {
  const { columns } = await lireApi<{ columns: { id: string; fields: { widgetOptions?: string } }[] }>(
    `tables/${encodeURIComponent(table)}/columns`,
    doc,
    { columns: [] },
  );
  try {
    const options = columns.find((c) => c.id === colonne)?.fields.widgetOptions;
    return options ? (JSON.parse(options).choices ?? []) : [];
  } catch {
    return [];
  }
}

/** Valeurs d'une cellule « Choice » (texte) ou « Choice List » (`['L', 'a', 'b']`). */
const choix = (v: unknown): string[] =>
  Array.isArray(v) && v[0] === 'L'
    ? v.slice(1).filter((x): x is string => typeof x === 'string' && !!x.trim())
    : typeof v === 'string' && v.trim()
      ? [v.trim()]
      : [];

/**
 * Sociétaires : lignes de la table des personnes (Contacts) et de la table des organisations
 * (Organisations) dont la case « Societaire » est cochée.
 * Seuls Prénom, Nom, Collège (et le site web des organisations) sont publiés
 * (colonne College facultative : Choice ou Choice List).
 * Renvoie aussi la liste des collèges, dans l'ordre des choix de la colonne, pour le filtre.
 */
export async function lireSocietaires(
  doc?: string,
  table = 'Contacts',
  tableOrganisations = 'Organisations',
): Promise<{ societaires: Societaire[]; colleges: string[] }> {
  if (!gristConfigure()) return societairesDemo;
  const [lignes, organisations, ordre] = await Promise.all([
    lireTable(table, doc),
    tableOrganisations ? lireTable(tableOrganisations, doc) : Promise.resolve([]),
    lireChoix(table, 'College', doc),
  ]);
  // Personnes (Prénom, Nom) et organisations (Nom, Site web) sociétaires, triées ensemble par nom.
  const personnes = lignes
    .filter((r) => r.fields.Societaire === true)
    .map((r) => ({
      cle: texte(r.fields.Nom) ?? texte(r.fields.Prenom) ?? '',
      nom: `${texte(r.fields.Prenom) ?? ''} ${texte(r.fields.Nom) ?? ''}`.trim(),
      colleges: choix(r.fields.College),
    }));
  const orgs = organisations
    .filter((r) => r.fields.Societaire === true)
    .map((r) => ({
      cle: texte(r.fields.Nom) ?? '',
      nom: texte(r.fields.Nom) ?? '',
      colleges: choix(r.fields.College),
      lien: texte(r.fields.Site_web),
      organisation: true,
    }));
  const societaires = [...personnes, ...orgs]
    .filter((s) => s.nom)
    .sort((a, b) => a.cle.localeCompare(b.cle, 'fr', { sensitivity: 'base' }) || a.nom.localeCompare(b.nom, 'fr'))
    .map(({ cle: _cle, ...s }) => s);
  // Collèges effectivement utilisés, dans l'ordre des choix de la colonne (puis les éventuels autres).
  const utilises = new Set(societaires.flatMap((s) => s.colleges));
  const colleges = [...ordre.filter((c) => utilises.has(c)), ...[...utilises].filter((c) => !ordre.includes(c))];
  return { societaires, colleges };
}

/** Identifiants des pièces jointes d'une cellule Grist de type « Attachments » (`['L', 4, 7]`). */
const piecesJointes = (v: unknown): number[] =>
  Array.isArray(v) && v[0] === 'L' ? v.slice(1).filter((x): x is number => typeof x === 'number') : [];

/** Lignes publiées d'une table (si la colonne Public existe, seules les lignes cochées). */
const lignesPubliees = async (table: string, doc?: string) =>
  (await lireTable(table, doc)).filter((r) => r.fields.Public !== false);

/** Colonnes de pièces jointes dont les images peuvent être servies publiquement. */
export const COLONNES_IMAGES = ['Photo', 'Logo'];

/** URL publique d'une image Grist (servie par src/pages/api/grist/image/…). */
const urlImage = (doc: string | undefined, table: string, colonne: string, id: number) =>
  `/api/grist/image/${encodeURIComponent(doc || process.env.GRIST_DOC_ID || '')}/${encodeURIComponent(table)}/${colonne}/${id}`;

/**
 * Personnes d'une table. Colonnes reconnues :
 *   Nom ou Contributeur (texte), Role, Lien,
 *   Photo : URL (texte) ou pièce jointe Grist (servie par /api/grist/image/…),
 *   Public (case à cocher, facultative).
 */
export async function lirePersonnes(table = 'Equipe'): Promise<Personne[]> {
  if (!gristConfigure()) return personnesDemo;
  return (await lignesPubliees(table))
    .map((r) => {
      const [photoJointe] = piecesJointes(r.fields.Photo);
      return {
        nom: texte(r.fields.Nom) ?? texte(r.fields.Contributeur) ?? '',
        role: texte(r.fields.Role),
        photo: photoJointe ? urlImage(undefined, table, 'Photo', photoJointe) : texte(r.fields.Photo),
        lien: texte(r.fields.Lien),
      };
    })
    .filter((p) => p.nom);
}

const cacheImages = new Map<string, { type: string; donnees: ArrayBuffer }>();

/**
 * Image (photo, logo) d'une ligne publiée. Seules les pièces jointes de cette colonne, dans les lignes
 * publiées de la table, sont servies : impossible de récupérer une autre pièce jointe du document.
 * Le document et la colonne doivent en plus être autorisés par l'appelant (route /api/grist/image).
 */
export async function lireImage(
  doc: string,
  table: string,
  colonne: string,
  id: number,
): Promise<{ type: string; donnees: ArrayBuffer } | undefined> {
  if (!gristConfigure() || !COLONNES_IMAGES.includes(colonne)) return undefined;
  const autorisees = new Set((await lignesPubliees(table, doc)).flatMap((r) => piecesJointes(r.fields[colonne])));
  if (!autorisees.has(id)) return undefined;

  const cle = `${doc}/${table}/${colonne}/${id}`;
  const enCache = cacheImages.get(cle);
  if (enCache) return enCache;

  const { GRIST_URL, GRIST_API_KEY } = process.env;
  const rep = await fetch(`${GRIST_URL!.replace(/\/$/, '')}/api/docs/${doc}/attachments/${id}/download`, {
    headers: { Authorization: `Bearer ${GRIST_API_KEY}` },
    signal: AbortSignal.timeout(5000),
  });
  const type = rep.headers.get('content-type') ?? '';
  if (!rep.ok || !type.startsWith('image/')) return undefined;
  const image = { type, donnees: await rep.arrayBuffer() };
  cacheImages.set(cle, image);
  return image;
}

/**
 * Organisations partenaires (table Organisations) : nom, logo (pièce jointe) et site web.
 * Toutes les lignes sont publiées, sauf celles dont la colonne facultative Public est décochée.
 */
export async function lireOrganisations(doc?: string, table = 'Organisations'): Promise<Logo[]> {
  if (!gristConfigure()) return organisationsDemo;
  return (await lignesPubliees(table, doc))
    .map((r) => {
      const [logo] = piecesJointes(r.fields.Logo);
      return {
        nom: texte(r.fields.Nom) ?? '',
        logo: logo ? urlImage(doc, table, 'Logo', logo) : undefined,
        lien: texte(r.fields.Site_web),
      };
    })
    .filter((o) => o.nom);
}

/**
 * Rôles de l'équipe opérationnelle :
 *   table Projects : Role (texte), Raison_d_etre (texte), Ordre (nombre), Referent_e (référence vers People)
 *   table People   : Contributeur (nom) et Photo — seuls champs publiés
 *                    (la photo seulement si la personne est publiée, cf. colonne Public)
 */
export async function lireRoles(): Promise<Role[]> {
  if (!gristConfigure()) return rolesDemo;
  const [roles, personnes, publiees] = await Promise.all([
    lireTable('Projects'),
    lireTable('People'),
    lignesPubliees('People'),
  ]);
  const noms = new Map(personnes.map((p) => [p.id, texte(p.fields.Contributeur)]));
  const photos = new Map(
    publiees.flatMap((p) => {
      const [photo] = piecesJointes(p.fields.Photo);
      return photo ? [[p.id, urlImage(undefined, 'People', 'Photo', photo)] as const] : [];
    }),
  );
  // Ordre : colonne « Ordre » (1 = en premier) ; les rôles sans ordre viennent ensuite, dans l'ordre de Grist.
  const ordre = (r: LigneGrist) => (typeof r.fields.Ordre === 'number' ? r.fields.Ordre : Infinity);
  return [...roles]
    .sort((a, b) => ordre(a) - ordre(b))
    .map((r) => {
      const ref = typeof r.fields.Referent_e === 'number' ? r.fields.Referent_e : undefined;
      return {
        titre: texte(r.fields.Role) ?? '',
        raison_d_etre: texte(r.fields.Raison_d_etre),
        referent: ref ? noms.get(ref) : undefined,
        referent_photo: ref ? photos.get(ref) : undefined,
      };
    })
    .filter((r) => r.titre);
}

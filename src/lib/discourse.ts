/**
 * Actualités : sujets du forum Discourse portant une étiquette donnée (ex. « blog ») — côté serveur uniquement.
 *
 * Forum et étiquette sont réglés dans le CMS (Réglages → Actualités). Le forum est public :
 * pas de clé d'API, on lit les mêmes JSON que l'interface de Discourse.
 *   /tag/<etiquette>.json  liste des sujets (paginée)
 *   /t/<id>.json           sujet, dont le premier message en HTML (« cooked »)
 */
import type { Article } from './types';
import { reglagesActualites } from './contenu';

const CACHE_LISTE_MS = 5 * 60_000;
const CACHE_SUJET_MS = 10 * 60_000;
const MAX_PAGES = 10;
const LONGUEUR_RESUME = 220;

type SujetListe = {
  id: number;
  slug: string;
  title: string;
  created_at: string;
  visible: boolean;
  archetype: string;
  tags?: (string | { name: string })[];
};

let cacheListe: { t: number; sujets: SujetListe[] } | undefined;
const cacheSujets = new Map<number, { t: number; article: Article }>();

function reglages() {
  const r = reglagesActualites();
  return { forum: (r.forum ?? 'https://forum.reconnexion.coop').replace(/\/$/, ''), etiquette: r.etiquette ?? 'blog' };
}

async function lireJson<T>(url: string): Promise<T> {
  const rep = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!rep.ok) throw new Error(`Discourse ${rep.status} ${url}`);
  return rep.json() as Promise<T>;
}

const ENTITES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—',
};
const decoderEntites = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (tout, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
      : (ENTITES[e.toLowerCase()] ?? tout),
  );

/** Texte brut d'un fragment HTML. */
const texteBrut = (html: string) => decoderEntites(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** Chapô (citation d'ouverture) ou premier paragraphe, coupé à un mot entier. */
function resume(html: string): string | undefined {
  const bloc = html.match(/^\s*<blockquote>([\s\S]*?)<\/blockquote>/)?.[1] ?? html.match(/<p>([\s\S]*?)<\/p>/)?.[1];
  const texte = bloc && texteBrut(bloc);
  if (!texte) return undefined;
  if (texte.length <= LONGUEUR_RESUME) return texte;
  return texte.slice(0, LONGUEUR_RESUME).replace(/\s+\S*$/, '').replace(/[\s.,;:!?]+$/, '') + '…';
}

/** Première image du message (hors émojis), dans sa version redimensionnée par Discourse. */
const premiereImage = (html: string) =>
  [...html.matchAll(/<img\b[^>]*>/g)].map(([img]) => img).find((img) => !/class="[^"]*emoji/.test(img))?.match(/\ssrc="([^"]+)"/)?.[1];

/**
 * HTML du forum → HTML du site : on garde la mise en forme et les images,
 * on retire ce qui ne sert qu'à l'interface de Discourse.
 */
function nettoyer(html: string, forum: string): string {
  return (
    html
      // Nom de fichier et poids des images, affichés au survol sur le forum.
      .replace(/<div class="meta">[\s\S]*?<\/div>/g, '')
      // Visionneuse d'images : on garde le lien vers l'image en taille réelle (un <div> dans un <p> est invalide).
      .replace(/<div class="lightbox-wrapper">([\s\S]*?)<\/div>/g, '$1')
      // Ancres des intertitres.
      .replace(/<a name="[^"]*" class="anchor"[^>]*><\/a>/g, '')
      // Liens et images relatifs au forum (téléversements, émojis, mentions…).
      .replace(/\b(href|src)="\/(?!\/)/g, `$1="${forum}/`)
      .replace(/<img\b/g, '<img loading="lazy"')
  );
}

async function sujetsEtiquetes(): Promise<SujetListe[]> {
  if (cacheListe && Date.now() - cacheListe.t < CACHE_LISTE_MS) return cacheListe.sujets;
  const { forum, etiquette } = reglages();
  try {
    const sujets: SujetListe[] = [];
    let url: string | undefined = `${forum}/tag/${encodeURIComponent(etiquette)}.json`;
    for (let page = 0; url && page < MAX_PAGES; page++) {
      const data: { topic_list: { topics: SujetListe[]; more_topics_url?: string } } = await lireJson(url);
      sujets.push(...data.topic_list.topics);
      // more_topics_url pointe vers la page HTML : on demande sa version JSON.
      const suite = data.topic_list.more_topics_url;
      url = suite ? new URL(suite.replace(/^([^?]*)/, '$1.json'), forum).href : undefined;
    }
    const aEtiquette = (s: SujetListe) => s.tags?.some((t) => (typeof t === 'string' ? t : t.name) === etiquette);
    cacheListe = {
      t: Date.now(),
      sujets: sujets
        .filter((s) => s.visible && s.archetype === 'regular' && aEtiquette(s))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  } catch (err) {
    console.error('[discourse]', err);
    if (!cacheListe) return [];
  }
  return cacheListe.sujets;
}

async function lireArticle(sujet: SujetListe): Promise<Article | undefined> {
  const enCache = cacheSujets.get(sujet.id);
  if (enCache && Date.now() - enCache.t < CACHE_SUJET_MS) return enCache.article;
  const { forum } = reglages();
  try {
    const data: {
      posts_count: number;
      like_count?: number;
      post_stream: { posts: { post_number: number; cooked: string; name?: string; username: string; avatar_template?: string }[] };
    } = await lireJson(`${forum}/t/${sujet.id}.json`);
    const message = data.post_stream.posts.find((p) => p.post_number === 1);
    if (!message) return enCache?.article;
    const contenu = nettoyer(message.cooked, forum);
    const article: Article = {
      slug: sujet.slug,
      titre: sujet.title,
      date: sujet.created_at,
      auteur: message.name || message.username,
      pseudo: message.username,
      avatar: message.avatar_template && new URL(message.avatar_template.replace('{size}', '240'), forum).href,
      nb_reponses: data.posts_count - 1,
      nb_likes: data.like_count ?? 0,
      image: premiereImage(contenu),
      resume: resume(contenu),
      lien_forum: `${forum}/t/${sujet.slug}/${sujet.id}`,
      contenu,
    };
    cacheSujets.set(sujet.id, { t: Date.now(), article });
    return article;
  } catch (err) {
    console.error('[discourse]', err);
    return enCache?.article;
  }
}

/** Articles les plus récents, sans leur contenu (cartes). `nombre` absent : tous. */
export async function derniersArticles(nombre?: number): Promise<Article[]> {
  const sujets = (await sujetsEtiquetes()).slice(0, nombre);
  const articles = await Promise.all(sujets.map(lireArticle));
  return articles.filter((a): a is Article => !!a).map(({ contenu, ...carte }) => carte);
}

/** Profil d'une personne sur le forum. */
export const lienProfil = (pseudo: string) => `${reglages().forum}/u/${encodeURIComponent(pseudo)}`;

/** Article complet, s'il porte bien l'étiquette (on ne sert pas n'importe quel sujet du forum). */
export async function articleParSlug(slug: string): Promise<Article | undefined> {
  const sujet = (await sujetsEtiquetes()).find((s) => s.slug === slug);
  return sujet && lireArticle(sujet);
}

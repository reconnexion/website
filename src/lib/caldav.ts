/**
 * Lecture des prochains événements d'un calendrier CalDAV — côté serveur uniquement.
 *
 * Variables d'environnement :
 *   CALDAV_URL       URL de la collection, ex. https://cloud.exemple.org/remote.php/dav/calendars/reconnexion/visios/
 *   CALDAV_USER      identifiant (compte en lecture seule conseillé)
 *   CALDAV_PASSWORD  mot de passe ou mot de passe d'application
 *
 * On envoie une requête REPORT « calendar-query » avec <expand> :
 * le serveur déplie lui-même les événements récurrents sur la période demandée.
 */
import ICAL from 'ical.js';
import type { Evenement } from './types';
import { evenementsDemo } from './demo';

const CACHE_MS = 60_000;
const JOURS = 90;
let cache: { t: number; data: Evenement[] } | undefined;

const fmtCaldav = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function corpsRequete(debut: Date, fin: Date) {
  const s = fmtCaldav(debut);
  const e = fmtCaldav(fin);
  return `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <C:calendar-data><C:expand start="${s}" end="${e}"/></C:calendar-data>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT"><C:time-range start="${s}" end="${e}"/></C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;
}

const decoderXml = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#13;/g, '\r')
    .replace(/&amp;/g, '&');

function extraireEvenements(xml: string): Evenement[] {
  const blocs = [...xml.matchAll(/<[^>]*calendar-data[^>]*>([\s\S]*?)<\/[^>]*calendar-data>/g)];
  const evenements: Evenement[] = [];
  for (const [, brut] of blocs) {
    try {
      const vcal = new ICAL.Component(ICAL.parse(decoderXml(brut)));
      for (const vevent of vcal.getAllSubcomponents('vevent')) {
        const ev = new ICAL.Event(vevent);
        evenements.push({
          titre: ev.summary ?? '',
          debut: ev.startDate.toJSDate().toISOString(),
          fin: ev.endDate?.toJSDate().toISOString(),
          lieu: ev.location || undefined,
          description: ev.description || undefined,
        });
      }
    } catch (err) {
      console.error('[caldav] événement illisible', err);
    }
  }
  return evenements;
}

export async function prochainsEvenements(nombre = 5): Promise<Evenement[]> {
  const { CALDAV_URL, CALDAV_USER, CALDAV_PASSWORD } = process.env;
  if (!CALDAV_URL) return evenementsDemo().slice(0, nombre);

  if (!cache || Date.now() - cache.t > CACHE_MS) {
    const maintenant = new Date();
    const fin = new Date(maintenant.getTime() + JOURS * 24 * 3600 * 1000);
    const headers: Record<string, string> = {
      Depth: '1',
      'Content-Type': 'application/xml; charset=utf-8',
    };
    if (CALDAV_USER) {
      headers.Authorization = 'Basic ' + Buffer.from(`${CALDAV_USER}:${CALDAV_PASSWORD ?? ''}`).toString('base64');
    }
    try {
      const rep = await fetch(CALDAV_URL, {
        method: 'REPORT',
        headers,
        body: corpsRequete(maintenant, fin),
        signal: AbortSignal.timeout(5000),
      });
      if (!rep.ok) throw new Error(`CalDAV ${rep.status}`);
      const data = extraireEvenements(await rep.text())
        .filter((e) => new Date(e.fin ?? e.debut) >= maintenant)
        .sort((a, b) => a.debut.localeCompare(b.debut));
      cache = { t: Date.now(), data };
    } catch (err) {
      console.error('[caldav]', err);
      if (!cache) return [];
    }
  }
  return cache.data.slice(0, nombre);
}

/**
 * Lecture des prochains événements d'un calendrier CalDAV — côté serveur uniquement.
 *
 * Variables d'environnement :
 *   CALDAV_URL       URL de la collection, ex. https://cloud.exemple.org/remote.php/dav/calendars/reconnexion/visios/
 *   CALDAV_USER      identifiant (compte en lecture seule conseillé)
 *   CALDAV_PASSWORD  mot de passe ou mot de passe d'application
 *
 * On envoie une requête REPORT « calendar-query » avec <expand> pour que le serveur déplie
 * les événements récurrents. Certains serveurs (SOGo…) l'ignorent et renvoient l'événement
 * maître avec sa RRULE : on déplie alors nous-mêmes les occurrences avec ical.js.
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
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');

/** Garde-fou contre les RRULE sans fin très fréquentes. */
const MAX_OCCURRENCES = 500;

function versEvenement(ev: ICAL.Event, debut: ICAL.Time, fin?: ICAL.Time): Evenement {
  return {
    titre: ev.summary ?? '',
    debut: debut.toJSDate().toISOString(),
    fin: fin?.toJSDate().toISOString(),
    lieu: ev.location || undefined,
    description: ev.description || undefined,
  };
}

function extraireEvenements(xml: string, debut: Date, fin: Date): Evenement[] {
  const blocs = [...xml.matchAll(/<[^>]*calendar-data[^>]*>([\s\S]*?)<\/[^>]*calendar-data>/g)];
  const limite = ICAL.Time.fromJSDate(fin, true);
  const evenements: Evenement[] = [];
  for (const [, brut] of blocs) {
    try {
      const vcal = new ICAL.Component(ICAL.parse(decoderXml(brut)));
      for (const vtimezone of vcal.getAllSubcomponents('vtimezone')) ICAL.TimezoneService.register(vtimezone);

      const vevents = vcal.getAllSubcomponents('vevent');
      const maitre = vevents.find((v) => !v.hasProperty('recurrence-id'));
      if (!maitre || !maitre.hasProperty('rrule')) {
        // Événement simple, ou occurrences déjà dépliées par le serveur.
        for (const vevent of vevents) {
          const ev = new ICAL.Event(vevent);
          evenements.push(versEvenement(ev, ev.startDate, ev.endDate));
        }
        continue;
      }

      // Événement récurrent non déplié : on parcourt les occurrences jusqu'à la fin de la période
      // (les EXDATE sont exclues par l'itérateur, les occurrences modifiées viennent des RECURRENCE-ID).
      const ev = new ICAL.Event(maitre, { exceptions: vevents.filter((v) => v !== maitre) });
      const it = ev.iterator();
      for (let i = 0, date = it.next(); date && i < MAX_OCCURRENCES; i++, date = it.next()) {
        if (date.compare(limite) > 0) break;
        const occ = ev.getOccurrenceDetails(date);
        if (occ.endDate.toJSDate() < debut) continue;
        evenements.push(versEvenement(occ.item, occ.startDate, occ.endDate));
      }
    } catch (err) {
      console.error('[caldav] événement illisible', err);
    }
  }
  return evenements;
}

export async function prochainsEvenements(nombre = 5): Promise<Evenement[]> {
  const { CALDAV_URL, CALDAV_USER, CALDAV_PASSWORD } = process.env;
  // Non configuré : données d'exemple en développement, rien en production (pas de faux événements publiés).
  if (!CALDAV_URL) return import.meta.env.DEV ? evenementsDemo().slice(0, nombre) : [];

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
      const data = extraireEvenements(await rep.text(), maintenant, fin)
        .filter((e) => new Date(e.fin ?? e.debut) >= maintenant && new Date(e.debut) < fin)
        .sort((a, b) => a.debut.localeCompare(b.debut));
      cache = { t: Date.now(), data };
    } catch (err) {
      console.error('[caldav]', err);
      if (!cache) return [];
    }
  }
  return cache.data.slice(0, nombre);
}

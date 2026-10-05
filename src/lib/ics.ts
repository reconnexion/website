/**
 * Export iCalendar (RFC 5545) de l'agenda : abonnement depuis Google Agenda, Apple Calendrier, Thunderbird…
 * Les récurrences sont exportées en RRULE (et non dépliées) : l'agenda de la personne les calcule lui-même.
 */
import {
  FUSEAU,
  lienCarte,
  lienVisio,
  lireDate,
  rangDansLeMois,
  texteJour,
  versInstant,
  type DateMurale,
  type FicheEvenement,
} from './evenements';

const JOURS_ICS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Fuseau Europe/Paris (règles en vigueur depuis 1996). */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${FUSEAU}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const echapper = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lignes de 75 octets au plus, les suivantes commençant par une espace. */
function plier(ligne: string): string {
  const octets = new TextEncoder().encode(ligne);
  if (octets.length <= 75) return ligne;
  const morceaux: string[] = [];
  let courant = '';
  let taille = 0;
  for (const c of ligne) {
    const n = new TextEncoder().encode(c).length;
    if (taille + n > (morceaux.length ? 74 : 75)) {
      morceaux.push(courant);
      courant = '';
      taille = 0;
    }
    courant += c;
    taille += n;
  }
  morceaux.push(courant);
  return morceaux.join('\r\n ');
}

const date = (jour: number) => texteJour(jour).replace(/-/g, '');
const dateHeure = ({ jour, minutes }: DateMurale) =>
  `${date(jour)}T${String(Math.floor(minutes / 60)).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}00`;
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Retire la mise en forme légère des descriptions (**gras**, [texte](lien)). */
const texteBrut = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)');

function vevent(f: FicheEvenement, site: string, maintenant: Date): string[] {
  const debut = lireDate(f.debut);
  if (!debut || !f.titre) return [];
  const fin = lireDate(f.fin);
  const journee = !!f.journee_entiere;
  const lignes = ['BEGIN:VEVENT', `UID:${f.slug ?? texteJour(debut.jour) + '-' + f.titre}@${new URL(site).hostname}`, `DTSTAMP:${utc(maintenant)}`];

  if (journee) {
    lignes.push(`DTSTART;VALUE=DATE:${date(debut.jour)}`, `DTEND;VALUE=DATE:${date((fin && fin.jour >= debut.jour ? fin.jour : debut.jour) + 1)}`);
  } else {
    lignes.push(`DTSTART;TZID=${FUSEAU}:${dateHeure(debut)}`);
    if (fin) lignes.push(`DTEND;TZID=${FUSEAU}:${dateHeure(fin)}`);
  }

  const recurrence = f.recurrence ?? 'aucune';
  if (recurrence !== 'aucune') {
    const regle =
      recurrence === 'mensuelle'
        ? `FREQ=MONTHLY;BYDAY=${rangDansLeMois(debut.jour)}${JOURS_ICS[new Date(debut.jour * 86_400_000).getUTCDay()]}`
        : `FREQ=WEEKLY${recurrence === 'bihebdomadaire' ? ';INTERVAL=2' : ''}`;
    const finRec = lireDate(f.fin_recurrence);
    // UNTIL en UTC (obligatoire quand DTSTART a un fuseau) : fin du dernier jour, heure de Paris.
    const until = finRec && (journee ? date(finRec.jour) : utc(versInstant({ jour: finRec.jour, minutes: 1439 })));
    lignes.push(`RRULE:${regle}${until ? `;UNTIL=${until}` : ''}`);
    for (const annulee of f.dates_annulees ?? []) {
      const j = lireDate(annulee)?.jour;
      if (j === undefined) continue;
      lignes.push(journee ? `EXDATE;VALUE=DATE:${date(j)}` : `EXDATE;TZID=${FUSEAU}:${dateHeure({ jour: j, minutes: debut.minutes })}`);
    }
  }

  lignes.push(`SUMMARY:${echapper(f.titre)}`);
  const visio = lienVisio(f);
  const lieu = visio ?? f.adresse;
  if (lieu) lignes.push(`LOCATION:${echapper(lieu)}`);
  if (visio) lignes.push(`URL:${visio}`);
  const description = [
    f.description && texteBrut(f.description),
    visio && `Visio : ${visio}`,
    !visio && f.adresse && `Plan : ${lienCarte(f.adresse)}`,
  ]
    .filter(Boolean)
    .join('\n\n');
  if (description) lignes.push(`DESCRIPTION:${echapper(description)}`);
  lignes.push('END:VEVENT');
  return lignes;
}

export function calendrierIcs(fiches: FicheEvenement[], { nom, site }: { nom: string; site: string }): string {
  const maintenant = new Date();
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${nom}//Agenda//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${echapper(nom)}`,
    `X-WR-TIMEZONE:${FUSEAU}`,
    // Fréquence de mise à jour suggérée aux agendas abonnés.
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...VTIMEZONE,
    ...fiches.flatMap((f) => vevent(f, site, maintenant)),
    'END:VCALENDAR',
  ];
  return lignes.map(plier).join('\r\n') + '\r\n';
}

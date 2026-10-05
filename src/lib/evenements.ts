/**
 * Agenda : événements de la collection « Événements » (src/content/evenements/*.yml), édités dans le CMS.
 * Ce module ne lit pas les fichiers (voir contenu.ts) : il sert aussi dans le navigateur (calendrier)
 * et dans l'aperçu du CMS.
 *
 * Les dates sont saisies en heure de Paris (« 2026-09-18T10:00 ») : les récurrences sont calculées
 * sur ces dates « murales », puis converties en instants (une réunion à 10 h reste à 10 h après le
 * changement d'heure).
 */

export const RECURRENCES = {
  aucune: 'Aucune',
  hebdomadaire: 'Toutes les semaines',
  bihebdomadaire: 'Toutes les deux semaines',
  mensuelle: 'Tous les mois, même jour de la semaine (ex. premier vendredi du mois)',
} as const;
export type Recurrence = keyof typeof RECURRENCES;

export const FORMATS = { en_ligne: 'En ligne', presentiel: 'En présentiel' } as const;
export type Format = keyof typeof FORMATS;

export const LIEN_VISIO_PAR_DEFAUT = 'https://meet.reconnexion.coop/zww-ygql-jes';

/** Fiche d'un événement, telle qu'éditée dans le CMS. */
export type FicheEvenement = {
  titre: string;
  slug?: string;
  description?: string;
  image?: string;
  /** « AAAA-MM-JJTHH:mm », heure de Paris. */
  debut: string;
  fin?: string;
  journee_entiere?: boolean;
  format?: Format;
  lien_visio?: string;
  adresse?: string;
  recurrence?: Recurrence;
  /** Dernier jour de la récurrence (« AAAA-MM-JJ », inclus). */
  fin_recurrence?: string;
  /** Jours où l'événement récurrent n'a pas lieu (« AAAA-MM-JJ »). */
  dates_annulees?: string[];
};

/** Une occurrence datée d'un événement (un événement récurrent en a plusieurs). */
export type Occurrence = Omit<FicheEvenement, 'debut' | 'fin' | 'dates_annulees' | 'fin_recurrence'> & {
  /** Identifiant unique : slug + jour. */
  id: string;
  /** Instants ISO 8601. */
  debut: string;
  fin?: string;
  /** Jours (« AAAA-MM-JJ », heure de Paris) couverts par l'occurrence, pour le calendrier. */
  jours: string[];
  /** Description de la récurrence (ex. « Le 3e vendredi de chaque mois »). */
  rythme?: string;
};

export const FUSEAU = 'Europe/Paris';
const JOUR_MS = 24 * 3600 * 1000;

// --- Dates « murales » (heure de Paris) -------------------------------------------------------

export type DateMurale = { jour: number; minutes: number }; // jour = nombre de jours depuis 1970-01-01

/** Normalise une valeur saisie (texte, ou Date si le YAML l'a convertie) en date murale. */
export function lireDate(v: unknown): DateMurale | undefined {
  if (v instanceof Date) return versMurale(v);
  if (typeof v !== 'string') return undefined;
  const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/);
  if (!m) return undefined;
  const [, a, mo, j, h = '0', mi = '0', zone] = m;
  // Avec un fuseau explicite (ex. saisie en UTC) : on revient à l'heure de Paris.
  if (zone) return versMurale(new Date(v));
  return { jour: Date.UTC(+a, +mo - 1, +j) / JOUR_MS, minutes: +h * 60 + +mi };
}

const partiesParis = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSEAU,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function versMurale(d: Date): DateMurale {
  const p = Object.fromEntries(partiesParis.formatToParts(d).map((x) => [x.type, x.value]));
  return { jour: Date.UTC(+p.year, +p.month - 1, +p.day) / JOUR_MS, minutes: +p.hour * 60 + +p.minute };
}

/** Instant correspondant à une date murale de Paris (gère les changements d'heure). */
export function versInstant({ jour, minutes }: DateMurale): Date {
  const naif = jour * JOUR_MS + minutes * 60_000;
  let t = naif;
  for (let i = 0; i < 2; i++) {
    const m = versMurale(new Date(t));
    t += naif - (m.jour * JOUR_MS + m.minutes * 60_000);
  }
  return new Date(t);
}

/** « AAAA-MM-JJ » d'un numéro de jour. */
export const texteJour = (jour: number) => new Date(jour * JOUR_MS).toISOString().slice(0, 10);
/** Numéro de jour (heure de Paris) d'un instant. */
export const jourDe = (d: Date) => versMurale(d).jour;
/** Numéro de jour d'un « AAAA-MM-JJ ». */
export const jourDeTexte = (s: string) => lireDate(s)?.jour;

// --- Récurrences ------------------------------------------------------------------------------

export const jourSemaine = (jour: number) => new Date(jour * JOUR_MS).getUTCDay(); // 0 = dimanche

/** Rang du jour dans le mois : 1 à 4, ou -1 pour le dernier (5e semaine). */
export function rangDansLeMois(jour: number) {
  const n = Math.ceil(new Date(jour * JOUR_MS).getUTCDate() / 7);
  return n === 5 ? -1 : n;
}

/** Jour du `rang`-ième `js` (jour de la semaine) du mois `annee`/`mois`, s'il existe. */
function nemeJourDuMois(annee: number, mois: number, js: number, rang: number): number | undefined {
  if (rang === -1) {
    const dernier = Date.UTC(annee, mois + 1, 0) / JOUR_MS;
    return dernier - ((jourSemaine(dernier) - js + 7) % 7);
  }
  const premier = Date.UTC(annee, mois, 1) / JOUR_MS;
  const jour = premier + ((js - jourSemaine(premier) + 7) % 7) + (rang - 1) * 7;
  return new Date(jour * JOUR_MS).getUTCMonth() === mois ? jour : undefined;
}

const nomsJours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const nomsRangs: Record<number, string> = { 1: 'premier', 2: '2e', 3: '3e', 4: '4e', [-1]: 'dernier' };

function rythme(recurrence: Recurrence, debut: number): string | undefined {
  const js = nomsJours[jourSemaine(debut)];
  if (recurrence === 'hebdomadaire') return `Tous les ${js}s`;
  if (recurrence === 'bihebdomadaire') return `Un ${js} sur deux`;
  if (recurrence === 'mensuelle') return `Le ${nomsRangs[rangDansLeMois(debut)]} ${js} de chaque mois`;
  return undefined;
}

/** Jours de début des occurrences d'un événement entre deux jours (inclus). */
function joursDeDebut(f: FicheEvenement, debut: number, duree: number, de: number, a: number): number[] {
  const recurrence = f.recurrence ?? 'aucune';
  const finRec = f.fin_recurrence ? jourDeTexte(f.fin_recurrence) : undefined;
  const borne = Math.min(a, finRec ?? Infinity);
  // Une occurrence est visible si elle se termine après `de` : on remonte de sa durée.
  const depuis = de - duree;
  const jours: number[] = [];
  if (recurrence === 'aucune') {
    if (debut >= depuis && debut <= a) jours.push(debut);
  } else if (recurrence === 'mensuelle') {
    const d0 = new Date(debut * JOUR_MS);
    const js = jourSemaine(debut);
    const rang = rangDansLeMois(debut);
    const premierMois = new Date(Math.max(debut, depuis) * JOUR_MS);
    let annee = premierMois.getUTCFullYear();
    let mois = premierMois.getUTCMonth();
    // Commence au mois précédent pour ne pas rater une occurrence qui déborde sur la période.
    if (annee * 12 + mois > d0.getUTCFullYear() * 12 + d0.getUTCMonth()) mois--;
    for (;;) {
      const j = nemeJourDuMois(annee + Math.floor(mois / 12), ((mois % 12) + 12) % 12, js, rang);
      mois++;
      if (j === undefined) continue;
      if (j > borne) break;
      if (j >= debut && j >= depuis) jours.push(j);
    }
  } else {
    const pas = recurrence === 'bihebdomadaire' ? 14 : 7;
    const k = Math.max(0, Math.ceil((depuis - debut) / pas));
    for (let j = debut + k * pas; j <= borne; j += pas) jours.push(j);
  }
  const annulees = new Set((f.dates_annulees ?? []).map(jourDeTexte));
  return jours.filter((j) => !annulees.has(j));
}

/** Occurrences des événements entre deux instants, triées par date de début. */
export function occurrences(fiches: FicheEvenement[], de: Date, a: Date): Occurrence[] {
  const jourDebutPeriode = jourDe(de);
  const jourFinPeriode = jourDe(a);
  const resultat: Occurrence[] = [];
  for (const f of fiches) {
    const debut = lireDate(f.debut);
    if (!debut || !f.titre) continue;
    const fin = lireDate(f.fin);
    const journee = !!f.journee_entiere;
    // Durée en jours (événements sur plusieurs jours) et en minutes.
    const dureeJours = fin && fin.jour >= debut.jour ? fin.jour - debut.jour : 0;
    const dureeMin = fin ? (fin.jour - debut.jour) * 1440 + fin.minutes - debut.minutes : 0;
    const { dates_annulees: _a, fin_recurrence: _f, debut: _d, fin: _fi, ...reste } = f;
    for (const jour of joursDeDebut(f, debut.jour, dureeJours, jourDebutPeriode, jourFinPeriode)) {
      const d = versInstant({ jour, minutes: journee ? 0 : debut.minutes });
      const e = fin && dureeMin > 0 ? versInstant({ jour, minutes: (journee ? 0 : debut.minutes) + (journee ? (dureeJours + 1) * 1440 : dureeMin) }) : undefined;
      if ((e ?? d) < de && !(journee && jour + dureeJours >= jourDebutPeriode)) continue;
      resultat.push({
        ...reste,
        id: `${f.slug ?? f.titre}-${texteJour(jour)}`,
        debut: d.toISOString(),
        fin: e?.toISOString(),
        jours: Array.from({ length: dureeJours + 1 }, (_, i) => texteJour(jour + i)),
        rythme: rythme(f.recurrence ?? 'aucune', debut.jour),
      });
    }
  }
  return resultat.sort((x, y) => x.debut.localeCompare(y.debut));
}

/** Les `nombre` prochaines occurrences (en cours ou à venir), dans l'année qui vient. */
export function prochainesOccurrences(fiches: FicheEvenement[], nombre: number, maintenant = new Date()): Occurrence[] {
  return occurrences(fiches, maintenant, new Date(maintenant.getTime() + 366 * JOUR_MS)).slice(0, nombre);
}

// --- Affichage --------------------------------------------------------------------------------

const fmtJourLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSEAU });
const fmtHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: FUSEAU });
export const formatHeure = (iso: string) => fmtHeure.format(new Date(iso));

/** « mardi 6 octobre, 10:00 – 11:30 », « du vendredi 26 au samedi 27 novembre »… */
export function quand(o: Occurrence): string {
  const d = new Date(o.debut);
  const f = o.fin ? new Date(o.fin) : undefined;
  if (o.jours.length > 1) {
    const dernier = new Date(`${o.jours[o.jours.length - 1]}T12:00:00Z`);
    if (o.journee_entiere) return `Du ${fmtJourLong.format(d)} au ${fmtJourLong.format(dernier)}`;
    return `Du ${fmtJourLong.format(d)}, ${fmtHeure.format(d)}, au ${fmtJourLong.format(dernier)}${f ? `, ${fmtHeure.format(f)}` : ''}`;
  }
  const jour = fmtJourLong.format(d);
  const texte = jour.charAt(0).toUpperCase() + jour.slice(1);
  if (o.journee_entiere) return texte;
  return `${texte}, ${fmtHeure.format(d)}${f ? ` – ${fmtHeure.format(f)}` : ''}`;
}

/** Lien de visio d'une occurrence en ligne (lien par défaut si le champ est vide). */
export const lienVisio = (o: Pick<Occurrence, 'format' | 'lien_visio'>) =>
  (o.format ?? 'en_ligne') === 'en_ligne' ? o.lien_visio || LIEN_VISIO_PAR_DEFAUT : undefined;

/** Lien vers la carte (OpenStreetMap) d'une adresse. */
export const lienCarte = (adresse: string) => `https://www.openstreetmap.org/search?query=${encodeURIComponent(adresse)}`;

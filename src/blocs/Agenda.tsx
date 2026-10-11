import { CalendarPlus, Lock, MapPin, Repeat, SlidersHorizontal, UsersRound, Video } from 'lucide-react';
import { Bloc, Paragraphes, TitreBloc } from './_commun';
import { Image } from './_image';
import type { DefinitionBloc } from './types';
import { Calendrier } from './_calendrier';
import { FUSEAU, lienCarte, lienVisio, prochainesOccurrences, quand, type FicheEvenement, type Occurrence } from '../lib/evenements';

export type AgendaProps = {
  titre?: string;
  affichage?: 'prochains' | 'calendrier';
  nombre?: number;
  texte_vide?: string;
  /** Injectés au rendu (server island) depuis la collection « Événements » — pas édités dans le bloc. */
  fiches?: FicheEvenement[];
  /** Instant du rendu : « aujourd'hui » du calendrier (le même côté serveur et navigateur). */
  maintenant?: string;
  /** Adresse publique du flux iCalendar (/agenda.ics). */
  lien_ics?: string;
};

const fmtJour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: FUSEAU });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: FUSEAU });

/** Pastille de date (jour et mois) ; rouge pour une réunion sur invitation. */
export function PastilleDate({ iso, invitation }: { iso: string; invitation?: boolean }) {
  const d = new Date(iso);
  return (
    <div
      className={`w-18 shrink-0 rounded-box p-e2 text-center font-titre leading-tight ${invitation ? 'bg-rouge text-fond' : 'bg-primary text-primary-content'}`}
    >
      <b className="block text-l">{fmtJour.format(d)}</b>
      <small className="text-xs uppercase">{fmtMois.format(d)}</small>
    </div>
  );
}

/** Lieu d'une occurrence : lien de visio, ou adresse avec un lien vers la carte. */
export function Lieu({ o }: { o: Occurrence }) {
  const visio = lienVisio(o);
  if (visio)
    return (
      <a href={visio} className="link flex items-center gap-e1 font-semibold text-vert-fonce" target="_blank" rel="noopener">
        <Video size={16} aria-hidden="true" />
        Rejoindre la visio
      </a>
    );
  if (!o.adresse) return null;
  return (
    <a href={lienCarte(o.adresse)} className="link flex items-center gap-e1 font-semibold text-vert-fonce" target="_blank" rel="noopener">
      <MapPin size={16} aria-hidden="true" />
      {o.adresse}
    </a>
  );
}

/** Date, récurrence et lieu d'une occurrence. */
export function InfosOccurrence({ o }: { o: Occurrence }) {
  return (
    <div className="flex flex-col gap-e1 text-s">
      <p className="text-gris">{quand(o)}</p>
      {o.rythme && (
        <p className="flex items-center gap-e1 text-gris">
          <Repeat size={16} aria-hidden="true" />
          {o.rythme}
        </p>
      )}
      <p className="flex items-center gap-e1 font-semibold">
        {o.ouvert_a_tous ? <UsersRound size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
        {o.ouvert_a_tous ? 'Ouvert à tous' : 'Sur invitation'}
      </p>
      <Lieu o={o} />
    </div>
  );
}

/** Détail complet d'une occurrence (modale du calendrier). */
export function DetailOccurrence({ o }: { o: Occurrence }) {
  return (
    <>
      {o.image && <Image src={o.image} sizes="min(100vw, 72rem)" alt="" className="mb-e4 aspect-video w-full object-cover" />}
      <h2 className="pr-e5 text-xl">{o.titre}</h2>
      <div className="mt-e3">
        <InfosOccurrence o={o} />
      </div>
      {o.description && <Paragraphes texte={o.description} className="mt-e4" />}
    </>
  );
}

/**
 * S'abonner à l'agenda depuis un autre agenda (flux iCalendar, mis à jour automatiquement) :
 * Google Agenda, ou lien webcal:// pour Apple Calendrier, Outlook, Thunderbird…
 */
export function Abonnement({ lien_ics }: { lien_ics?: string }) {
  if (!lien_ics) return null;
  const webcal = lien_ics.replace(/^https?:/, 'webcal:');
  return (
    <details className="dropdown dropdown-end ml-auto">
      <summary className="btn btn-sm">
        <CalendarPlus size={16} aria-hidden="true" />
        S’abonner
      </summary>
      <div className="dropdown-content z-10 mt-e2 flex w-80 flex-col gap-e3 rounded-box border border-base-300 bg-base-100 p-e4 text-s">
        <p>Ajoutez cet agenda au vôtre : les événements s’y mettront à jour automatiquement.</p>
        <a className="btn btn-sm btn-primary" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener">
          Google Agenda
        </a>
        <a className="btn btn-sm" href={webcal}>
          Apple, Outlook, Thunderbird…
        </a>
        <label className="flex flex-col gap-e1">
          <span className="text-gris">Ou copiez l’adresse de l’agenda :</span>
          <input className="input input-sm w-full" readOnly value={lien_ics} onFocus={(e) => e.currentTarget.select()} />
        </label>
      </div>
    </details>
  );
}

export type FiltreAgenda = { label: string; coche: boolean; onChange: (coche: boolean) => void };

/** Bouton « Filtres » de l'agenda : liste de cases à cocher (nombre de filtres actifs sur le bouton). */
export function Filtres({ filtres }: { filtres: FiltreAgenda[] }) {
  const actifs = filtres.filter((f) => f.coche).length;
  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-sm">
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filtres
        {actifs > 0 && <span className="badge badge-sm badge-primary">{actifs}</span>}
      </summary>
      <div className="dropdown-content z-10 mt-e2 flex w-60 flex-col gap-e3 rounded-box border border-base-300 bg-base-100 p-e4 text-s">
        {filtres.map(({ label, coche, onChange }) => (
          <label key={label} className="flex cursor-pointer items-center gap-e2">
            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={coche} onChange={(e) => onChange(e.currentTarget.checked)} />
            {label}
          </label>
        ))}
      </div>
    </details>
  );
}

/** Liste d'occurrences (prochains événements, et calendrier sur mobile). */
export function ListeOccurrences({ occurrences, onOuvrir }: { occurrences: Occurrence[]; onOuvrir?: (o: Occurrence) => void }) {
  return (
    <ul className="list gap-e3">
      {occurrences.map((o) => (
        <li className="list-row items-start gap-e3 rounded-box bg-base-200 p-e3 after:hidden" key={o.id}>
          <PastilleDate iso={o.debut} invitation={!o.ouvert_a_tous} />
          <div className="list-col-grow flex flex-col gap-e1">
            <h3 className="font-texte text-m">
              {onOuvrir ? (
                <button type="button" className="link-hover cursor-pointer text-left font-semibold" onClick={() => onOuvrir(o)}>
                  {o.titre}
                </button>
              ) : (
                o.titre
              )}
            </h3>
            <InfosOccurrence o={o} />
            {!onOuvrir && o.description && <Paragraphes texte={o.description} className="text-s text-gris" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Agenda des événements de la collection « Événements ».
 * - « prochains » : les N prochains événements, en liste ;
 * - « calendrier » : calendrier mensuel (liste à défilement infini sur mobile), voir _calendrier.tsx.
 */
export function Agenda({ titre, affichage = 'prochains', nombre = 4, texte_vide, fiches = [], maintenant, lien_ics }: AgendaProps) {
  if (affichage === 'calendrier') return <Calendrier titre={titre} texte_vide={texte_vide} fiches={fiches} maintenant={maintenant} lien_ics={lien_ics} />;
  const occurrences = prochainesOccurrences(fiches, nombre, maintenant ? new Date(maintenant) : undefined);
  return (
    <Bloc>
      <div className="mb-e4 flex flex-wrap items-center justify-between gap-x-e4 gap-y-e3">
        <TitreBloc titre={titre} className="mb-0!" />
        <Abonnement lien_ics={lien_ics} />
      </div>
      {occurrences.length === 0 ? texte_vide && <p>{texte_vide}</p> : <ListeOccurrences occurrences={occurrences} />}
    </Bloc>
  );
}

/** Fiches injectées dans l'aperçu du CMS par scripts/build-cms.mjs. */
declare const __EVENEMENTS__: FicheEvenement[] | undefined;

export const agenda: DefinitionBloc<AgendaProps> = {
  name: 'agenda',
  label: 'Agenda',
  Component: Agenda,
  donneesExemple: () => ({ fiches: typeof __EVENEMENTS__ !== 'undefined' ? __EVENEMENTS__ : [] }),
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'affichage',
      label: 'Affichage',
      widget: 'select',
      options: ['prochains', 'calendrier'],
      default: 'prochains',
      hint: '« prochains » : liste des prochains événements. « calendrier » : calendrier du mois (liste sur mobile). Les événements se gèrent dans la collection « Événements ».',
    },
    {
      name: 'nombre',
      label: "Nombre d'événements (affichage « prochains »)",
      widget: 'number',
      value_type: 'int',
      min: 1,
      max: 20,
      default: 4,
      required: false,
    },
    { name: 'texte_vide', label: 'Texte si aucun événement', widget: 'string', required: false },
  ],
};

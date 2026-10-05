import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Bloc, TitreBloc } from './_commun';
import { Abonnement, DetailOccurrence, ListeOccurrences } from './Agenda';
import { formatHeure, jourDe, occurrences, texteJour, versInstant, type FicheEvenement, type Occurrence } from '../lib/evenements';

type Props = {
  titre?: string;
  texte_vide?: string;
  fiches: FicheEvenement[];
  /** Instant du rendu serveur ; à défaut, l'heure du navigateur. */
  maintenant?: string;
  lien_ics?: string;
};

const JOUR_MS = 24 * 3600 * 1000;
const NOMS_JOURS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
/** Événements affichés par case avant « + n autres ». */
const MAX_PAR_JOUR = 3;
/** Liste mobile : mois chargés au départ, à chaque fois qu'on atteint le bas, et au maximum. */
const MOIS_INITIAUX = 3;
const MOIS_EN_PLUS = 3;
const MOIS_MAX = 24;

/** Premier jour (numéro de jour) d'un mois, `decalage` mois après celui du jour donné. */
function debutMois(jour: number, decalage = 0) {
  const d = new Date(jour * JOUR_MS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + decalage, 1) / JOUR_MS;
}
const debutDuJour = (jour: number) => versInstant({ jour, minutes: 0 });

/**
 * Calendrier de l'agenda. Hydraté dans le navigateur (client:load) : navigation de mois en mois,
 * détail d'un événement dans une modale. Sur mobile, liste des événements à venir qui s'allonge
 * en faisant défiler la page (les réunions récurrentes n'ont pas de fin).
 */
export function Calendrier({ titre, texte_vide, fiches, maintenant, lien_ics }: Props) {
  const aujourdhui = jourDe(maintenant ? new Date(maintenant) : new Date());
  const [mois, setMois] = useState(() => debutMois(aujourdhui));
  // Événement choisi, ou tous les événements d'un jour trop chargé (« + n »).
  const [selection, setSelection] = useState<Occurrence | Occurrence[] | null>(null);
  const modale = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selection && !modale.current?.open) modale.current?.showModal();
  }, [selection]);

  // --- Grille du mois (écrans larges) : semaines du lundi au dimanche.
  const premier = mois - ((new Date(mois * JOUR_MS).getUTCDay() + 6) % 7);
  const dernierDuMois = debutMois(mois, 1) - 1;
  const nbSemaines = Math.ceil((dernierDuMois - premier + 1) / 7);
  const jours = Array.from({ length: nbSemaines * 7 }, (_, i) => premier + i);
  const parJour = useMemo(() => {
    const index = new Map<string, Occurrence[]>();
    for (const o of occurrences(fiches, debutDuJour(premier), debutDuJour(premier + nbSemaines * 7))) {
      for (const j of o.jours) index.set(j, [...(index.get(j) ?? []), o]);
    }
    return index;
  }, [fiches, premier, nbSemaines]);

  // --- Liste (mobile) : à partir d'aujourd'hui, prolongée quand le bas de la liste devient visible.
  const [nbMois, setNbMois] = useState(MOIS_INITIAUX);
  const finListe = useRef<HTMLDivElement>(null);
  const aVenir = useMemo(
    () => occurrences(fiches, maintenant ? new Date(maintenant) : new Date(), debutDuJour(debutMois(aujourdhui, nbMois))),
    [fiches, maintenant, aujourdhui, nbMois],
  );
  const groupes = useMemo(() => {
    const g = new Map<number, Occurrence[]>();
    for (const o of aVenir) {
      const m = debutMois(jourDe(new Date(o.debut)));
      g.set(m, [...(g.get(m) ?? []), o]);
    }
    return [...g];
  }, [aVenir]);
  useEffect(() => {
    const cible = finListe.current;
    if (!cible || nbMois >= MOIS_MAX) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setNbMois((n) => Math.min(n + MOIS_EN_PLUS, MOIS_MAX)), {
      rootMargin: '400px',
    });
    obs.observe(cible);
    return () => obs.disconnect();
  }, [nbMois]);

  const bouton = 'btn btn-sm btn-square';
  return (
    <Bloc>
      <TitreBloc titre={titre} />

      {/* Écrans larges : grille du mois. */}
      <div className="hidden md:block">
        <div className="mb-e3 flex items-center gap-e2">
          <button type="button" className={bouton} onClick={() => setMois(debutMois(mois, -1))} aria-label="Mois précédent">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className={bouton} onClick={() => setMois(debutMois(mois, 1))} aria-label="Mois suivant">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <h3 className="ml-e2 text-l first-letter:uppercase" aria-live="polite">
            {fmtMois.format(new Date(mois * JOUR_MS))}
          </h3>
          {/* Bouton d'abonnement à la hauteur du mois. */}
          <div className="ml-auto flex items-center gap-e2">
            {mois !== debutMois(aujourdhui) && (
              <button type="button" className="btn btn-sm" onClick={() => setMois(debutMois(aujourdhui))}>
                Aujourd’hui
              </button>
            )}
            <Abonnement lien_ics={lien_ics} />
          </div>
        </div>
        <div className="grid grid-cols-7 border-t border-l border-base-300" role="grid">
          {NOMS_JOURS.map((n) => (
            <div key={n} className="border-r border-b border-base-300 bg-base-200 p-e1 text-center text-xs font-semibold text-gris" role="columnheader">
              {n}
            </div>
          ))}
          {jours.map((j) => {
            const evs = parJour.get(texteJour(j)) ?? [];
            const horsMois = j < mois || j > dernierDuMois;
            return (
              <div key={j} className={`flex min-h-28 flex-col gap-e1 border-r border-b border-base-300 p-e1 ${horsMois ? 'bg-base-200' : ''}`} role="gridcell">
                <span
                  className={`grid size-7 place-items-center rounded-full text-xs ${
                    j === aujourdhui ? 'bg-primary font-bold text-primary-content' : horsMois ? 'text-gris' : ''
                  }`}
                >
                  {new Date(j * JOUR_MS).getUTCDate()}
                </span>
                {evs.slice(0, MAX_PAR_JOUR).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelection(o)}
                    title={o.titre}
                    className={`cursor-pointer truncate rounded-box px-e1 text-left text-xs hover:opacity-85 ${
                      o.format === 'presentiel' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'
                    }`}
                  >
                    {!o.journee_entiere && o.jours[0] === texteJour(j) && <b className="font-semibold">{formatHeure(o.debut)} </b>}
                    {o.titre}
                  </button>
                ))}
                {evs.length > MAX_PAR_JOUR && (
                  <button type="button" className="link-hover cursor-pointer text-left text-xs text-gris" onClick={() => setSelection(evs)}>
                    + {evs.length - MAX_PAR_JOUR}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile : liste des événements à venir, groupés par mois. */}
      <div className="md:hidden">
        {groupes.length === 0 && (
          <div className="mb-e4 flex justify-end">
            <Abonnement lien_ics={lien_ics} />
          </div>
        )}
        {groupes.length === 0 && nbMois >= MOIS_MAX
          ? texte_vide && <p>{texte_vide}</p>
          : groupes.map(([m, occs], i) => (
              <section key={m} className="mb-e4">
                {/* Bouton d'abonnement à la hauteur du premier mois. */}
                <div className="mb-e3 flex items-center justify-between gap-e3">
                  <h3 className="text-l first-letter:uppercase">{fmtMois.format(new Date(m * JOUR_MS))}</h3>
                  {i === 0 && <Abonnement lien_ics={lien_ics} />}
                </div>
                <ListeOccurrences occurrences={occs} onOuvrir={setSelection} />
              </section>
            ))}
        {nbMois < MOIS_MAX && (
          <div ref={finListe} className="flex justify-center p-e3">
            <span className="loading loading-dots loading-sm text-gris" aria-hidden="true" />
          </div>
        )}
      </div>

      <dialog ref={modale} className="modal" onClose={() => setSelection(null)}>
        <div className="modal-box max-w-xl p-e5">
          <form method="dialog">
            <button className="btn absolute top-e3 right-e3 btn-square btn-ghost btn-sm" aria-label="Fermer">
              <X size={20} aria-hidden="true" />
            </button>
          </form>
          {Array.isArray(selection) ? (
            <div className="pt-e5">
              <ListeOccurrences occurrences={selection} onOuvrir={setSelection} />
            </div>
          ) : (
            selection && <DetailOccurrence o={selection} />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>
    </Bloc>
  );
}

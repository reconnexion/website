import { Bloc } from './_commun';
import type { DefinitionBloc } from './types';
import type { Evenement } from '../lib/types';

export type AgendaProps = {
  titre?: string;
  nombre?: number;
  live?: boolean;
  texte_vide?: string;
  texte_live?: string;
  /** Injecté au rendu depuis CalDAV — pas édité dans le CMS. */
  evenements?: Evenement[];
};

const fmtJour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'Europe/Paris' });
const fmtHeure = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });

export function Agenda({ titre, live, texte_vide, texte_live, evenements }: AgendaProps) {
  return (
    <Bloc>
      {titre && <h2>{titre}</h2>}
      {live && texte_live && <div className="badge-live">{texte_live}</div>}
      {evenements === undefined ? null : evenements.length === 0 ? (
        texte_vide && <p>{texte_vide}</p>
      ) : (
        <ul className="agenda">
          {evenements.map((e, i) => {
            const d = new Date(e.debut);
            return (
              <li className="evenement" key={i}>
                <div className="date">
                  <b>{fmtJour.format(d)}</b>
                  <small>{fmtMois.format(d)}</small>
                </div>
                <div>
                  <h3>{e.titre}</h3>
                  <p>
                    {fmtHeure.format(d)}
                    {e.lieu ? ` · ${e.lieu}` : ''}
                  </p>
                  {e.description && <p>{e.description}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Bloc>
  );
}

export const agenda: DefinitionBloc<AgendaProps> = {
  name: 'agenda',
  label: 'Agenda (depuis CalDAV)',
  Component: Agenda,
  source: 'caldav',
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'nombre', label: "Nombre d'événements affichés", widget: 'number', value_type: 'int', min: 1, max: 20, default: 4 },
    {
      name: 'live',
      label: 'Rafraîchir en direct dans le navigateur',
      widget: 'boolean',
      default: false,
      hint: "Désactivé : l'agenda est à jour à chaque chargement de page. Activé : il se met aussi à jour sans recharger.",
    },
    { name: 'texte_vide', label: "Texte si aucun événement", widget: 'string', required: false },
    { name: 'texte_live', label: 'Mention « en direct »', widget: 'string', required: false },
  ],
};

import { Bloc, TitreBloc } from './_commun';
import type { DefinitionBloc } from './types';
import type { Evenement } from '../lib/types';
import { evenementsDemo } from '../lib/demo';

export type AgendaProps = {
  titre?: string;
  nombre?: number;
  live?: boolean;
  texte_vide?: string;
  texte_live?: string;
  texte_lien_visio?: string;
  /** Injecté au rendu depuis CalDAV — pas édité dans le CMS. */
  evenements?: Evenement[];
};

const fmtJour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'Europe/Paris' });
const fmtHeure = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });

export function Agenda({ titre, live, texte_vide, texte_live, texte_lien_visio, evenements }: AgendaProps) {
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {live && texte_live && (
        <div className="mb-e3 flex items-center gap-e2 text-xs font-bold text-vert-fonce">
          <span className="status status-success animate-pulse" aria-hidden="true" />
          {texte_live}
        </div>
      )}
      {evenements === undefined ? null : evenements.length === 0 ? (
        texte_vide && <p>{texte_vide}</p>
      ) : (
        <ul className="list gap-e3">
          {evenements.map((e, i) => {
            const d = new Date(e.debut);
            return (
              <li className="list-row items-start gap-e3 rounded-box bg-base-200 p-e3 after:hidden" key={i}>
                <div className="w-18 rounded-box bg-primary p-e2 text-center font-titre leading-tight text-primary-content">
                  <b className="block text-l">{fmtJour.format(d)}</b>
                  <small className="text-xs uppercase">{fmtMois.format(d)}</small>
                </div>
                <div className="list-col-grow">
                  <h3 className="font-texte text-m">{e.titre}</h3>
                  <p className="text-s text-gris">
                    {fmtHeure.format(d)}
                    {/* Lieu = lien de visio : lien cliquable plutôt que l'adresse brute. */}
                    {e.lieu &&
                      (/^https?:\/\//.test(e.lieu) ? (
                        <>
                          {' · '}
                          <a href={e.lieu} className="link font-semibold text-vert-fonce" target="_blank" rel="noopener">
                            {texte_lien_visio || e.lieu}
                          </a>
                        </>
                      ) : (
                        ` · ${e.lieu}`
                      ))}
                  </p>
                  {e.description && <p className="text-s text-gris">{e.description}</p>}
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
  donneesExemple: (d) => ({ evenements: evenementsDemo().slice(0, Number(d.nombre) || 4) }),
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
    {
      name: 'texte_lien_visio',
      label: 'Texte du lien de visio',
      widget: 'string',
      required: false,
      hint: 'Quand le lieu d’un événement est une adresse web (Meet, Jitsi…), elle est affichée sous forme de lien avec ce texte.',
    },
  ],
};

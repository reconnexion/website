import { Bloc, TitreBloc, champFond, type Fond } from './_commun';
import { Image } from './_image';
import { EtiquetteStatut } from './FicheApplication';
import type { DefinitionBloc } from './types';
import { carteApplication, selectionnerApplications, type Application as FicheApplication, type Statut } from '../lib/applications';

type Application = { nom: string; logo?: string; statut?: Statut; description?: string; domaine?: string; lien?: string };

export type ApplicationsProps = {
  fond?: Fond;
  titre?: string;
  texte_lien?: string;
  une_par_ligne?: boolean;
  /** Réglage éditable : slugs des applications à afficher (toutes si vide). */
  selection?: string[];
  /** Injecté au rendu depuis la collection « Applications » — pas édité dans le bloc. */
  applications?: Application[];
};

/** Fiches injectées dans l'aperçu du CMS par scripts/build-cms.mjs. */
declare const __APPLICATIONS__: FicheApplication[] | undefined;

/**
 * Une carte par application, comme sur le frontend du Pod provider : logo à gauche, nom et statut,
 * résumé. Toute la carte mène à la page de l'application. Deux par ligne, ou une par ligne (option).
 */
export function Applications({ fond = 'blanc', titre, texte_lien, une_par_ligne, applications = [] }: ApplicationsProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <div className={une_par_ligne ? 'flex flex-col gap-e4' : 'grid gap-e4 md:grid-cols-2'}>
        {applications.map((app, i) => (
          <article
            key={i}
            className={`relative flex items-start gap-e4 border border-base-300 bg-base-100 p-e4 text-noir ${app.lien ? 'transition-colors hover:border-vert-fonce' : ''}`}
          >
            {app.logo && <Image src={app.logo} sizes="4rem" alt="" loading="lazy" className="size-12 shrink-0 sm:size-16" />}
            <div className="flex min-w-0 flex-1 flex-col items-start gap-e2">
              <div className="flex w-full flex-wrap items-center justify-between gap-e2">
                <h3 className="text-l">
                  {/* Le lien recouvre toute la carte. */}
                  {app.lien ? (
                    <a href={app.lien} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-vert-fonce">
                      {app.nom}
                    </a>
                  ) : (
                    app.nom
                  )}
                </h3>
                <EtiquetteStatut statut={app.statut} />
              </div>
              {app.description && <p>{app.description}</p>}
              {app.domaine && <p className="text-s text-gris italic">{app.domaine}</p>}
              {app.lien && texte_lien && <span className="mt-auto font-semibold text-vert-fonce">{texte_lien}</span>}
            </div>
          </article>
        ))}
      </div>
    </Bloc>
  );
}

export const applications: DefinitionBloc<ApplicationsProps> = {
  name: 'applications',
  label: "Cartes d'applications",
  Component: Applications,
  donneesExemple: (d) => ({
    applications: selectionnerApplications(typeof __APPLICATIONS__ !== 'undefined' ? __APPLICATIONS__ : [], d.selection).map(
      carteApplication,
    ),
  }),
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'texte_lien', label: 'Texte du lien sous chaque application', widget: 'string', required: false, hint: 'Facultatif : toute la carte mène déjà à la page de l’application.' },
    { name: 'une_par_ligne', label: 'Une application par ligne', widget: 'boolean', required: false, default: false },
    {
      name: 'selection',
      label: 'Applications affichées',
      widget: 'relation',
      collection: 'applications',
      value_field: '{{slug}}',
      search_fields: ['nom'],
      display_fields: ['{{nom}}'],
      multiple: true,
      required: false,
      hint: 'Laissez vide pour afficher toutes les applications. Nom, logo, statut, résumé et nom de domaine (adresse du bouton principal) viennent de la collection « Applications ».',
    },
  ],
};

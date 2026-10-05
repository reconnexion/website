import { Bloc, TitreBloc, champFond, type Fond } from './_commun';
import { Image } from './_image';
import type { DefinitionBloc } from './types';
import { carteApplication, selectionnerApplications, type Application as FicheApplication } from '../lib/applications';

type Application = { nom: string; description?: string; lien?: string; image?: string };

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
 * Comme sur reconnexion.coop : capture de l'application, nom et description centrés, deux par ligne.
 * Option « une par ligne » : capture à gauche, texte à droite (page qui liste les applications).
 */
export function Applications({ fond = 'blanc', titre, texte_lien, une_par_ligne, applications = [] }: ApplicationsProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <div className={une_par_ligne ? 'flex flex-col gap-e5' : 'grid gap-e5 md:grid-cols-2'}>
        {applications.map((app, i) => {
          const image = app.image && <Image src={app.image} sizes="(min-width: 768px) 36rem, 100vw" alt="" loading="lazy" className="aspect-video w-full object-cover" />;
          return (
            <article
              key={i}
              className={
                une_par_ligne
                  ? 'grid items-center gap-e4 md:grid-cols-[2fr_3fr] md:gap-e5'
                  : 'flex flex-col items-center gap-e3 text-center'
              }
            >
              {image && (app.lien ? <a href={app.lien} className="block w-full transition-opacity hover:opacity-90">{image}</a> : image)}
              <div className={une_par_ligne ? 'flex flex-col items-start gap-e3' : 'contents'}>
                <h3 className="text-l">{app.lien ? <a href={app.lien} className="link-hover">{app.nom}</a> : app.nom}</h3>
                {app.description && <p>{app.description}</p>}
                {app.lien && texte_lien && (
                  <a className="link mt-auto font-semibold text-vert-fonce" href={app.lien}>
                    {texte_lien}
                  </a>
                )}
              </div>
            </article>
          );
        })}
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
    { name: 'texte_lien', label: 'Texte du lien sous chaque application', widget: 'string', required: false, hint: 'Facultatif : l’image et le nom mènent déjà à la page de l’application.' },
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
      hint: 'Laissez vide pour afficher toutes les applications. Nom, résumé et image viennent de la collection « Applications ».',
    },
  ],
};

import { Bloc } from './_commun';
import type { DefinitionBloc } from './types';

type Application = { nom: string; description?: string; lien?: string };

export type ApplicationsProps = {
  titre?: string;
  texte_lien?: string;
  applications?: Application[];
};

export function Applications({ titre, texte_lien, applications = [] }: ApplicationsProps) {
  return (
    <Bloc>
      {titre && <h2>{titre}</h2>}
      <div className="grille">
        {applications.map((app, i) => (
          <article className="carte" key={i}>
            <h3>{app.nom}</h3>
            {app.description && <p>{app.description}</p>}
            {app.lien && texte_lien && <a href={app.lien}>{texte_lien}</a>}
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
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'texte_lien', label: 'Texte des liens', widget: 'string', required: false, default: 'Découvrir →' },
    {
      name: 'applications',
      label: 'Applications',
      widget: 'list',
      summary: '{{nom}}',
      fields: [
        { name: 'nom', label: 'Nom', widget: 'string' },
        { name: 'description', label: 'Description', widget: 'text', required: false },
        { name: 'lien', label: 'Lien', widget: 'string', required: false },
      ],
    },
  ],
};

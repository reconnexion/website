import { Bloc } from './_commun';
import type { DefinitionBloc } from './types';
import type { Personne } from '../lib/types';

export type EquipeProps = {
  titre?: string;
  /** Réglage éditable : nom de la table Grist à afficher. */
  table?: string;
  /** Injecté au rendu depuis Grist — pas édité dans le CMS. */
  personnes?: Personne[];
};

function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Equipe({ titre, personnes = [] }: EquipeProps) {
  return (
    <Bloc>
      {titre && <h2>{titre}</h2>}
      <div className="personnes">
        {personnes.map((p, i) => {
          const contenu = (
            <>
              {p.photo ? (
                <img className="avatar" src={p.photo} alt="" loading="lazy" />
              ) : (
                <div className="avatar" aria-hidden="true">{initiales(p.nom)}</div>
              )}
              <strong>{p.nom}</strong>
              {p.role && <span>{p.role}</span>}
            </>
          );
          return (
            <div className="personne" key={i}>
              {p.lien ? <a href={p.lien}>{contenu}</a> : contenu}
            </div>
          );
        })}
      </div>
    </Bloc>
  );
}

export const equipe: DefinitionBloc<EquipeProps> = {
  name: 'equipe',
  label: 'Personnes (depuis Grist)',
  Component: Equipe,
  source: 'grist',
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'table',
      label: 'Table Grist',
      widget: 'string',
      default: 'Equipe',
      hint: 'Les personnes sont gérées dans Grist, pas ici.',
    },
  ],
};

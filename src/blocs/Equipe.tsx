import { Bloc, BoutonAction, TitreBloc } from './_commun';
import type { DefinitionBloc } from './types';
import type { Personne } from '../lib/types';
import { personnesDemo } from '../lib/demo';

export type EquipeProps = {
  titre?: string;
  /** Réglage éditable : nom de la table Grist à afficher. */
  table?: string;
  bouton_texte?: string;
  bouton_lien?: string;
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

export function Equipe({ titre, bouton_texte, bouton_lien, personnes = [] }: EquipeProps) {
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {/* Trombinoscope comme sur reconnexion.coop : grandes photos carrées, nom en vert dessous. */}
      <div className="grid grid-cols-2 gap-e4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {personnes.map((p, i) => {
          const contenu = (
            <>
              {p.photo ? (
                <img src={p.photo} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              ) : (
                <div
                  className="grid aspect-square w-full place-items-center bg-secondary text-secondary-content"
                  aria-hidden="true"
                >
                  <span className="font-titre text-xl">{initiales(p.nom)}</span>
                </div>
              )}
              <strong className="mt-e2 block font-semibold text-vert-fonce">{p.nom}</strong>
              {p.role && <span className="text-s text-gris">{p.role}</span>}
            </>
          );
          return (
            <div className="text-center" key={i}>
              {p.lien ? (
                <a className="link-hover block" href={p.lien}>
                  {contenu}
                </a>
              ) : (
                contenu
              )}
            </div>
          );
        })}
      </div>
      {bouton_texte && bouton_lien && (
        <div className="mt-e5 text-center">
          <BoutonAction texte={bouton_texte} lien={bouton_lien} />
        </div>
      )}
    </Bloc>
  );
}

export const equipe: DefinitionBloc<EquipeProps> = {
  name: 'equipe',
  label: 'Personnes (depuis Grist)',
  Component: Equipe,
  source: 'grist',
  donneesExemple: () => ({ personnes: personnesDemo }),
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'table',
      label: 'Table Grist',
      widget: 'string',
      default: 'People',
      hint: 'Les personnes sont gérées dans Grist, pas ici.',
    },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
  ],
};

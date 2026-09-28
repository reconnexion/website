import { Bloc, TitreBloc } from './_commun';
import type { DefinitionBloc } from './types';
import type { Role } from '../lib/types';
import { rolesDemo } from '../lib/demo';

export type RolesProps = {
  titre?: string;
  texte_referent?: string;
  texte_vide?: string;
  /** Injecté au rendu depuis Grist — pas édité dans le CMS. */
  roles?: Role[];
};

function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Roles({ titre, texte_referent, texte_vide, roles = [] }: RolesProps) {
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {roles.length === 0 ? (
        texte_vide && <p className="text-gris">{texte_vide}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-e4">
          {roles.map((r, i) => (
            <li className="card bg-base-200" key={i}>
              <div className="card-body gap-e3 p-e4">
                <h3 className="card-title text-l">{r.titre}</h3>
                {r.raison_d_etre && <p className="text-s text-gris">{r.raison_d_etre}</p>}
                {r.referent && (
                  <div className="mt-auto flex items-center gap-e3">
                    {/* Carrée, sans arrondi, comme dans le trombinoscope ; initiales si pas de photo. */}
                    {r.referent_photo ? (
                      <img src={r.referent_photo} alt="" loading="lazy" className="size-12 shrink-0 object-cover" />
                    ) : (
                      <div
                        className="grid size-12 shrink-0 place-items-center bg-secondary text-secondary-content"
                        aria-hidden="true"
                      >
                        <span className="font-titre text-xs">{initiales(r.referent)}</span>
                      </div>
                    )}
                    <div className="leading-tight">
                      {texte_referent && <span className="block text-xs text-gris">{texte_referent}</span>}
                      <strong className="text-s font-semibold">{r.referent}</strong>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Bloc>
  );
}

export const roles: DefinitionBloc<RolesProps> = {
  name: 'roles',
  label: 'Rôles de l’équipe (depuis Grist)',
  Component: Roles,
  source: 'grist',
  donneesExemple: () => ({ roles: rolesDemo }),
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'texte_referent', label: 'Libellé du référent', widget: 'string', required: false, default: 'Référent·e' },
    { name: 'texte_vide', label: 'Texte si aucun rôle', widget: 'string', required: false },
  ],
};

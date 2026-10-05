import { X } from 'lucide-react';
import { Bloc, Paragraphes, TitreBloc } from './_commun';
import { Image } from './_image';
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

/** Photo carrée, sans arrondi, comme dans le trombinoscope ; initiales si pas de photo. */
function Avatar({ nom, photo }: { nom: string; photo?: string }) {
  return photo ? (
    <Image src={photo} sizes="3rem" alt="" loading="lazy" className="size-12 shrink-0 object-cover" />
  ) : (
    <div className="grid size-12 shrink-0 place-items-center bg-secondary text-secondary-content" aria-hidden="true">
      <span className="font-titre text-xs">{initiales(nom)}</span>
    </div>
  );
}

function Personne({ nom, photo, libelle }: { nom: string; photo?: string; libelle?: string }) {
  return (
    <div className="flex items-center gap-e3">
      <Avatar nom={nom} photo={photo} />
      <div className="leading-tight">
        {libelle && <span className="block text-xs text-gris">{libelle}</span>}
        <strong className="text-s font-semibold">{nom}</strong>
      </div>
    </div>
  );
}

/** Détail d'un rôle dans une modale <dialog> (ouverte par le script de Base.astro, fermée sans JS). */
function DetailRole({ id, role, texte_referent }: { id: string; role: Role; texte_referent?: string }) {
  const { titre, raison_d_etre, redevabilites, referent, referent_photo, membres = [] } = role;
  return (
    <dialog id={id} className="modal" aria-labelledby={`${id}-titre`}>
      <div className="modal-box max-w-2xl p-e5">
        <form method="dialog">
          <button className="btn absolute top-e3 right-e3 btn-square btn-ghost btn-sm" aria-label="Fermer">
            <X size={20} aria-hidden="true" />
          </button>
        </form>
        <h2 id={`${id}-titre`} className="pr-e5 text-xl">
          {titre}
        </h2>
        {raison_d_etre && (
          <section className="mt-e4">
            <h3 className="mb-e2 text-ml">Raison d’être</h3>
            <p>{raison_d_etre}</p>
          </section>
        )}
        {redevabilites && (
          <section className="mt-e4">
            <h3 className="mb-e2 text-ml">Redevabilités</h3>
            <Paragraphes texte={redevabilites} />
          </section>
        )}
        {(referent || membres.length > 0) && (
          <section className="mt-e4 flex flex-col gap-e3">
            {referent && (
              <>
                {texte_referent && <h3 className="-mb-e2 text-ml">{texte_referent}</h3>}
                <Personne nom={referent} photo={referent_photo} />
              </>
            )}
            {membres.length > 0 && (
              <>
                <h3 className="mt-e2 -mb-e2 text-ml">Membres</h3>
                <ul className="grid gap-e3 sm:grid-cols-2">
                  {membres.map((m, i) => (
                    <li key={i}>
                      <Personne nom={m.nom} photo={m.photo} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Fermer</button>
      </form>
    </dialog>
  );
}

export function Roles({ titre, texte_referent, texte_vide, roles = [] }: RolesProps) {
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {roles.length === 0 ? (
        texte_vide && <p className="text-gris">{texte_vide}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-e4">
          {roles.map((r, i) => {
            const id = `role-${i + 1}`;
            const ouvrir = () => (document.getElementById(id) as HTMLDialogElement | null)?.showModal();
            return (
              <li className="card relative bg-base-200 transition-colors hover:bg-base-300" key={i}>
                <div className="card-body gap-e3 p-e4">
                  <h3 className="card-title text-l">
                    {/* Toute la carte est cliquable (le bouton la recouvre). onClick : aperçu du CMS, rendu en React. */}
                    <button
                      type="button"
                      data-dialogue={id}
                      onClick={ouvrir}
                      className="cursor-pointer text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-vert-fonce"
                    >
                      {r.titre}
                    </button>
                  </h3>
                  {r.raison_d_etre && <p className="text-s text-gris">{r.raison_d_etre}</p>}
                  {r.referent && (
                    <div className="mt-auto">
                      <Personne nom={r.referent} photo={r.referent_photo} libelle={texte_referent} />
                    </div>
                  )}
                </div>
                <DetailRole id={id} role={r} texte_referent={texte_referent} />
              </li>
            );
          })}
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

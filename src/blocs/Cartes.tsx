import { Printer } from 'lucide-react';
import { Bloc, TitreBloc, champFond, type Fond } from './_commun';
import { CarteRetournable } from './_carte';
import type { DefinitionBloc } from './types';
import { lienCarte, type Carte, type ReglagesCartes, type TypeCarte } from '../lib/cartes';

export type CartesProps = {
  fond?: Fond;
  titre?: string;
  /** Réglage éditable : n'afficher que les cartes d'un set (toutes si vide). */
  set?: string;
  /** Injectés au rendu (collections Cartes, Types de cartes, réglages) — pas édités dans le bloc. */
  cartes?: Carte[];
  types?: TypeCarte[];
  reglages?: ReglagesCartes;
  site?: string;
};

/** Données injectées dans l'aperçu du CMS par scripts/build-cms.mjs. */
declare const __CARTES__: { cartes: Carte[]; types: TypeCarte[]; reglages: ReglagesCartes } | undefined;

/**
 * Liste des cartes QR : filtre par type (boutons radio + CSS, sans JS), cartes retournables au survol,
 * chaque carte menant à sa fiche. 4 cartes par ligne sur grand écran (cartes réduites à 95 %).
 */
export function Cartes({ fond = 'blanc', titre, cartes = [], types = [], reglages = {}, site = 'https://reconnexion.coop' }: CartesProps) {
  const r = reglages;
  const typesUtilises = types.filter((t) => cartes.some((c) => c.type === t.slug));
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      {cartes.length === 0 ? (
        r.texte_vide && <p className="text-gris">{r.texte_vide}</p>
      ) : (
        <div className="filtre-cartes">
          <div className="mb-e5 flex flex-wrap items-center justify-between gap-e3">
            <form className="flex flex-wrap gap-e2">
              <input className="btn btn-sm checked:btn-primary" type="radio" name="type-carte" value="" aria-label={r.texte_tous ?? '*'} defaultChecked />
              {typesUtilises.map((t) => (
                <input
                  key={t.slug}
                  className="btn btn-sm checked:btn-primary"
                  type="radio"
                  name="type-carte"
                  value={types.indexOf(t)}
                  aria-label={`${t.nom} (${cartes.filter((c) => c.type === t.slug).length})`}
                />
              ))}
            </form>
            <div className="flex flex-wrap gap-e2">
              {r.texte_vue_impression && (
                <a className="btn btn-sm" href="/cartes/impression">
                  <Printer size={16} aria-hidden="true" />
                  {r.texte_vue_impression}
                </a>
              )}
            </div>
          </div>
          <ul className="liste-cartes grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] justify-items-center gap-x-e4 gap-y-e5">
            {cartes.map((c) => (
              <li key={c.slug} data-carte={c.slug} data-type={types.findIndex((t) => t.slug === c.type)}>
                <CarteRetournable carte={c} types={types} site={site} lien={lienCarte(c)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bloc>
  );
}

export const cartes: DefinitionBloc<CartesProps> = {
  name: 'cartes',
  label: 'Cartes QR',
  Component: Cartes,
  donneesExemple: () =>
    typeof __CARTES__ !== 'undefined'
      ? { ...__CARTES__, site: typeof location !== 'undefined' ? location.origin : undefined }
      : {},
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'set',
      label: 'Set de cartes',
      widget: 'relation',
      collection: 'sets-de-cartes',
      value_field: '{{slug}}',
      search_fields: ['nom'],
      display_fields: ['{{nom}}'],
      required: false,
      hint: 'Laissez vide pour afficher toutes les cartes (collection « Cartes »). Les libellés se règlent dans Réglages du site → Cartes QR.',
    },
  ],
};

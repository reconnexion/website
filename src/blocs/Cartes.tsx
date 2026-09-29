import { Eye, Plus, Printer, Star } from 'lucide-react';
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
 * Liste des cartes QR : filtre par type (boutons radio + CSS, sans JS) et favoris (mémorisés dans le navigateur,
 * cf. src/lib/favoris.ts), cartes retournables au survol, liens vers la fiche et la vue impression.
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
              {r.texte_favoris && (
                <input className="btn btn-sm checked:btn-primary" type="radio" name="type-carte" value="favoris" aria-label={r.texte_favoris} />
              )}
            </form>
            <div className="flex flex-wrap gap-e2">
              {r.texte_vue_impression && (
                <a className="btn btn-sm" href="/cartes/impression">
                  <Printer size={16} aria-hidden="true" />
                  {r.texte_vue_impression}
                </a>
              )}
              {r.texte_ajouter && (
                <a className="btn btn-sm" href="/admin/#/collections/cartes/new">
                  <Plus size={16} aria-hidden="true" />
                  {r.texte_ajouter}
                </a>
              )}
            </div>
          </div>
          <ul className="flex flex-wrap justify-center gap-e5 sm:justify-start">
            {cartes.map((c) => (
              <li key={c.slug} data-carte={c.slug} data-type={types.findIndex((t) => t.slug === c.type)}>
                <CarteRetournable carte={c} types={types} site={site} />
                <div className="mt-e2 flex items-center justify-between">
                  <div className="flex gap-e1">
                    <a className="btn btn-ghost btn-sm btn-square" href={lienCarte(c)} title={r.texte_voir} aria-label={r.texte_voir}>
                      <Eye size={18} aria-hidden="true" />
                    </a>
                    <a
                      className="btn btn-ghost btn-sm btn-square"
                      href={`/cartes/impression?carte=${c.slug}`}
                      title={r.texte_imprimer}
                      aria-label={r.texte_imprimer}
                    >
                      <Printer size={18} aria-hidden="true" />
                    </a>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square favori"
                    data-favori-bouton={c.slug}
                    data-texte-ajouter={r.texte_favori_ajouter}
                    data-texte-retirer={r.texte_favori_retirer}
                    title={r.texte_favori_ajouter}
                    aria-label={r.texte_favori_ajouter}
                    aria-pressed="false"
                  >
                    <Star size={18} aria-hidden="true" />
                  </button>
                </div>
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

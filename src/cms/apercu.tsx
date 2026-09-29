/**
 * Aperçu dans Sveltia : rend les sections d'une page avec les VRAIS composants du site.
 *
 * Sveltia fournit sa propre instance de React (via window.h / window.createClass)
 * et attend un composant de classe. Pour ne pas dépendre de cette instance
 * (et pouvoir utiliser des hooks dans nos blocs), on lui donne une coquille minimale
 * qui monte NOTRE React dans une div.
 */
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { blocsParNom, type DonneesBloc } from '../blocs/registre';
import { FicheApplication } from '../blocs/FicheApplication';
import { FicheCarte } from '../blocs/_fiche-carte';
import type { Carte, ReglagesCartes, TypeCarte } from '../lib/cartes';

declare const __CARTES__: { cartes: Carte[]; types: TypeCarte[]; reglages: ReglagesCartes };

declare global {
  interface Window {
    CMS: any;
    h: (...args: any[]) => any;
    createClass: (spec: Record<string, unknown>) => any;
  }
}

function Apercu({ sections }: { sections: DonneesBloc[] }) {
  return (
    <>
      {sections.map(({ type, ...donnees }, i) => {
        const def = blocsParNom[type];
        if (!def) return null;
        const Composant = def.Component;
        // Les blocs alimentés par Grist / CalDAV affichent des données d'exemple.
        const extra = def.donneesExemple?.(donnees) ?? {};
        return (
          <div key={i} className={def.source ? 'apercu-donnees-exemple' : undefined}>
            {def.source && (
              <span className="badge badge-secondary absolute top-e3 right-e3 z-1 font-bold">
                Aperçu avec des données d’exemple — les vraies données viennent de Grist / CalDAV
              </span>
            )}
            <Composant {...donnees} {...extra} />
          </div>
        );
      })}
    </>
  );
}

/** Coquille Sveltia qui monte NOTRE React et y rend `vue(données de l'entrée)`. */
const coquille = (vue: (donnees: Record<string, any>) => ReactNode) =>
  window.createClass({
    racine: null as Root | null,
    noeud: null as HTMLElement | null,
    rendre: function (this: any) {
      if (!this.noeud) return;
      if (!this.racine) this.racine = createRoot(this.noeud);
      this.racine.render(vue(this.props.entry.getIn(['data'])?.toJS?.() ?? {}));
    },
    componentDidMount: function (this: any) {
      this.rendre();
    },
    componentDidUpdate: function (this: any) {
      this.rendre();
    },
    componentWillUnmount: function (this: any) {
      const racine = this.racine;
      this.racine = null;
      setTimeout(() => racine?.unmount());
    },
    render: function (this: any) {
      return window.h('div', { ref: (n: HTMLElement | null) => (this.noeud = n) });
    },
  });

const ApercuPage = coquille((d) => <Apercu sections={d.sections ?? []} />);

// Fiche d'application : même rendu que sa page /applications/<slug>.
const ApercuApplication = coquille((d) => (
  <FicheApplication
    titre={d.nom ?? ''}
    logo={d.logo || undefined}
    sous_titre={d.accroche || undefined}
    boutons={d.boutons}
    captures={d.captures}
    infos={d.infos}
  />
));

window.CMS.registerPreviewStyle('/admin/apercu.css');
window.CMS.registerPreviewTemplate('pages', ApercuPage);
window.CMS.registerPreviewTemplate('applications', ApercuApplication);

// Carte QR : même rendu que sa fiche /cartes/<slug> (carte retournable au survol, QR code).
const ApercuCarte = coquille((d) => (
  <FicheCarte
    carte={{ ...d, titre: d.titre ?? '', slug: d.slug || 'nouvelle-carte' } as Carte}
    types={__CARTES__.types}
    cartes={__CARTES__.cartes}
    reglages={__CARTES__.reglages}
    site={location.origin}
  />
));
window.CMS.registerPreviewTemplate('cartes', ApercuCarte);

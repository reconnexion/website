/**
 * Aperçu dans Sveltia : rend les sections d'une page avec les VRAIS composants du site.
 *
 * Sveltia fournit sa propre instance de React (via window.h / window.createClass)
 * et attend un composant de classe. Pour ne pas dépendre de cette instance
 * (et pouvoir utiliser des hooks dans nos blocs), on lui donne une coquille minimale
 * qui monte NOTRE React dans une div.
 */
import { createRoot, type Root } from 'react-dom/client';
import { blocsParNom, type DonneesBloc } from '../blocs/registre';
import { personnesDemo, evenementsDemo } from '../lib/demo';

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
        const extra =
          def.source === 'grist'
            ? { personnes: personnesDemo }
            : def.source === 'caldav'
              ? { evenements: evenementsDemo().slice(0, Number(donnees.nombre) || 4) }
              : {};
        return (
          <div key={i} className={def.source ? 'apercu-donnees-exemple' : undefined}>
            <Composant {...donnees} {...extra} />
          </div>
        );
      })}
    </>
  );
}

const ApercuPage = window.createClass({
  racine: null as Root | null,
  noeud: null as HTMLElement | null,
  rendre: function (this: any) {
    if (!this.noeud) return;
    if (!this.racine) this.racine = createRoot(this.noeud);
    const donnees = this.props.entry.getIn(['data'])?.toJS?.() ?? {};
    this.racine.render(<Apercu sections={donnees.sections ?? []} />);
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

window.CMS.registerPreviewStyle('/admin/apercu.css');
window.CMS.registerPreviewTemplate('pages', ApercuPage);

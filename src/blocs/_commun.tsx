import { createContext, useContext, type ReactNode } from 'react';
import type { Champ } from './types';

/** Couleur de fond d'une section, choisie dans le CMS. */
export type Fond = 'blanc' | 'gris' | 'vert' | 'bleu';

const classesFond: Record<Fond, string> = {
  blanc: '',
  gris: 'bg-barre',
  vert: 'bg-primary text-primary-content',
  bleu: 'bg-bleu-fonce text-fond',
};

/** Vrai quand la section a un fond foncé (texte blanc) : les accents verts deviennent blancs. */
const FondFonce = createContext(false);
export const useFondFonce = () => useContext(FondFonce);

export const champFond: Champ = {
  name: 'fond',
  label: 'Couleur de fond',
  widget: 'select',
  options: ['blanc', 'gris', 'vert', 'bleu'],
  default: 'blanc',
  required: false,
};

/**
 * Texte léger : `**gras**`, `[texte du lien](https://…)`, retour à la ligne simple.
 * Suffisant pour les champs « texte » du CMS sans passer par un éditeur riche.
 */
function enrichir(texte: string, fonce: boolean): ReactNode[] {
  return texte.split(/(\*\*.+?\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((morceau, i) => {
    const gras = morceau.match(/^\*\*(.+)\*\*$/);
    if (gras) return <strong key={i}>{enrichir(gras[1], fonce)}</strong>;
    const lien = morceau.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (lien)
      return (
        <a key={i} href={lien[2]} className={`link font-semibold${fonce ? '' : ' text-vert-fonce'}`}>
          {lien[1]}
        </a>
      );
    return morceau;
  });
}

function TexteEnrichi({ texte }: { texte: string }) {
  const fonce = useFondFonce();
  return texte.split('\n').map((ligne, n) => (
    <span key={n}>
      {n > 0 && <br />}
      {enrichir(ligne, fonce)}
    </span>
  ));
}

/**
 * Texte courant d'un bloc : paragraphes séparés par une ligne vide, listes à puces
 * (lignes commençant par « - »), et la mise en forme légère ci-dessus.
 * Espacement vertical uniforme sur tout le site (utilitaire `texte` de theme.css).
 */
export function Paragraphes({ texte, className = '' }: { texte?: string; className?: string }): ReactNode {
  if (!texte) return null;
  const blocs = texte
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className={`texte ${className}`.trim()}>
      {blocs.map((p, i) => {
        const lignes = p.split('\n');
        if (lignes.every((l) => /^\s*- /.test(l)))
          return (
            <ul key={i} className="list-disc space-y-e1 pl-e4">
              {lignes.map((l, j) => (
                <li key={j}>
                  <TexteEnrichi texte={l.replace(/^\s*- /, '')} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            <TexteEnrichi texte={p} />
          </p>
        );
      })}
    </div>
  );
}

/** Petit libellé au-dessus d'un titre (rubrique, page parente). Cliquable si `lien` est fourni. */
export function Surtitre({ texte, lien }: { texte?: string; lien?: string }) {
  const fonce = useFondFonce();
  if (!texte) return null;
  const classes = `mb-e3 inline-block text-xs font-bold tracking-widest uppercase${fonce ? '' : ' text-vert-fonce'}`;
  return lien ? (
    <a href={lien} className={`${classes} link-hover`}>
      {texte}
    </a>
  ) : (
    <span className={classes}>{texte}</span>
  );
}

/** Titre de section (h2) : même taille et même marge dans tous les blocs. */
export function TitreBloc({ titre, className = '' }: { titre?: string; className?: string }) {
  if (!titre) return null;
  // Pas de marge sous le titre s'il est seul (ex. bande de titre) : marges haut et bas égales.
  return <h2 className={`mb-e4 text-xl last:mb-0 ${className}`.trim()}>{titre}</h2>;
}

/** Rangée de boutons d'action. */
export function Boutons({ boutons = [], className = '' }: { boutons?: { texte: string; lien: string }[]; className?: string }) {
  if (!boutons.length) return null;
  return (
    <div className={`mt-e4 flex flex-wrap gap-e3 ${className}`.trim()}>
      {boutons.map((b, i) => (
        <BoutonAction key={i} texte={b.texte} lien={b.lien} />
      ))}
    </div>
  );
}

export const champBoutons: Champ = {
  name: 'boutons',
  label: 'Boutons',
  widget: 'list',
  required: false,
  summary: '{{texte}}',
  fields: [
    { name: 'texte', label: 'Texte', widget: 'string' },
    { name: 'lien', label: 'Lien', widget: 'string' },
  ],
};

/** Bouton d'action : vert sur fond clair, blanc sur fond foncé. */
export function BoutonAction({ texte, lien }: { texte?: string; lien?: string }) {
  const fonce = useFondFonce();
  if (!texte || !lien) return null;
  return (
    <a
      href={lien}
      className={fonce ? 'btn border-fond bg-fond text-noir hover:border-fond-2 hover:bg-fond-2' : 'btn btn-primary'}
    >
      {texte}
    </a>
  );
}

export function Bloc({ children, className = '', fond = 'blanc' }: { children: ReactNode; className?: string; fond?: Fond }) {
  const classes = classesFond[fond] ?? '';
  return (
    <FondFonce.Provider value={fond === 'vert' || fond === 'bleu'}>
      <section data-fond={fond} className={`bloc ${classes} ${className}`.trim()}>
        <div className="conteneur">{children}</div>
      </section>
    </FondFonce.Provider>
  );
}

import { Fragment, createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { courrielLisible, devoilerCourriels, encoderCourriel } from '../lib/courriel';
import type { Champ } from './types';
import { icones, nomsIcones } from '../lib/icones';

/** Couleur de fond d'une section, choisie dans le CMS. */
export type Fond = 'blanc' | 'gris' | 'vert' | 'bleu' | 'degrade';

const classesFond: Record<Fond, string> = {
  blanc: '',
  gris: 'bg-barre',
  vert: 'bg-primary text-primary-content',
  bleu: 'bg-bleu-fonce text-fond',
  // Dégradé du X du logo, traité comme un fond foncé (texte et boutons blancs).
  degrade: 'bg-linear-to-br from-degrade-debut to-degrade-fin text-fond',
};

/** Vrai quand la section a un fond foncé (texte blanc) : les accents verts deviennent blancs. */
const FondFonce = createContext(false);
export const useFondFonce = () => useContext(FondFonce);

/** Zone claire (ex. carte blanche) dans une section colorée : liens et boutons retrouvent leurs couleurs normales. */
export const SurFondClair = ({ children }: { children: ReactNode }) => (
  <FondFonce.Provider value={false}>{children}</FondFonce.Provider>
);

/** Zone foncée hors d'un `Bloc` (ex. bandeau dégradé) : surtitres, liens et boutons passent en blanc. */
export const SurFondFonce = ({ children }: { children: ReactNode }) => (
  <FondFonce.Provider value={true}>{children}</FondFonce.Provider>
);

export const champFond: Champ = {
  name: 'fond',
  label: 'Couleur de fond',
  widget: 'select',
  options: ['blanc', 'gris', 'vert', 'bleu', 'degrade'],
  default: 'blanc',
  required: false,
};

const RE_COURRIEL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

/**
 * Lien e-mail masqué : l'adresse est encodée dans data-courriel et rétablie par un script
 * (Base.astro sur le site ; l'effet ci-dessous dans l'aperçu du CMS, qui est rendu en React).
 */
function Courriel({ adresse, texte, className }: { adresse: string; texte?: string; className: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (ref.current?.parentElement) devoilerCourriels(ref.current.parentElement);
  });
  const texteEstAdresse = !texte || texte === adresse;
  return (
    <a
      ref={ref}
      href="#"
      data-courriel={encoderCourriel(adresse)}
      data-courriel-texte={texteEstAdresse ? '' : undefined}
      className={className}
    >
      {texteEstAdresse ? courrielLisible(adresse) : texte}
    </a>
  );
}

/**
 * Texte léger : `**gras**`, `[texte du lien](https://…)`, retour à la ligne simple.
 * Les adresses e-mail (liens mailto: ou tapées telles quelles) sont masquées aux robots.
 * Suffisant pour les champs « texte » du CMS sans passer par un éditeur riche.
 */
function enrichir(texte: string, fonce: boolean): ReactNode[] {
  const classeLien = `link font-semibold${fonce ? '' : ' text-vert-fonce'}`;
  return texte
    .split(new RegExp(`(\\*\\*.+?\\*\\*|\\[[^\\]]+\\]\\([^)\\s]+\\)|${RE_COURRIEL.source})`, 'g'))
    .map((morceau, i) => {
      const gras = morceau.match(/^\*\*(.+)\*\*$/);
      if (gras) return <strong key={i}>{enrichir(gras[1], fonce)}</strong>;
      const lien = morceau.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (lien) {
        const mailto = lien[2].match(/^mailto:(.+)$/);
        if (mailto) return <Courriel key={i} adresse={mailto[1]} texte={lien[1]} className={classeLien} />;
        // Liens externes dans un nouvel onglet, comme dans le menu.
        const externe = /^https?:\/\//.test(lien[2]);
        return (
          <a key={i} href={lien[2]} className={classeLien} target={externe ? '_blank' : undefined} rel={externe ? 'noopener' : undefined}>
            {lien[1]}
          </a>
        );
      }
      if (new RegExp(`^${RE_COURRIEL.source}$`).test(morceau))
        return <Courriel key={i} adresse={morceau} className={classeLien} />;
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

/**
 * Texte d'un titre : suffixes des nombres ordinaux en exposant (« 1er », « 2e », « 3ème »…)
 * et retours à la ligne voulus (saisis dans le CMS) conservés.
 */
export function Ordinaux({ texte }: { texte: string }) {
  return texte.split('\n').map((ligne, n) => (
    <Fragment key={n}>
      {n > 0 && <br />}
      {ligne.split(/(?<=\b\d+)(er|re|e|ème|nde?)\b/).map((morceau, i) => (i % 2 ? <sup key={i} className="exposant">{morceau}</sup> : morceau))}
    </Fragment>
  ));
}

/** Titre de section (h2) : même taille et même marge dans tous les blocs. Icône facultative, de la hauteur du titre. */
export function TitreBloc({ titre, icone, className = '' }: { titre?: string; icone?: string; className?: string }) {
  const fonce = useFondFonce();
  if (!titre) return null;
  const Icone = icone ? icones[icone] : undefined;
  // Pas de marge sous le titre s'il est seul (ex. bande de titre) : marges haut et bas égales.
  return (
    <h2 className={`mb-e4 text-xl last:mb-0 ${Icone ? 'flex items-center gap-e2 ' : ''}${className}`.trim()}>
      {Icone && <Icone size="0.9em" aria-hidden="true" className={`shrink-0${fonce ? '' : ' text-vert-fonce'}`} />}
      <span>
        <Ordinaux texte={titre} />
      </span>
    </h2>
  );
}

/** Champ « icône du titre » des blocs qui ont un titre de section. */
export const champIconeTitre: Champ = { name: 'icone', label: 'Icône du titre', widget: 'select', options: nomsIcones, required: false };

/** Rangée de boutons d'action. */
export function Boutons({ boutons = [], className = '' }: { boutons?: { texte: string; lien: string; icone?: string }[]; className?: string }) {
  if (!boutons.length) return null;
  return (
    <div className={`mt-e4 flex flex-wrap gap-e3 ${className}`.trim()}>
      {boutons.map((b, i) => (
        <BoutonAction key={i} texte={b.texte} lien={b.lien} icone={b.icone} />
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
    { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
  ],
};

/**
 * Bouton d'action : vert sur fond clair, blanc sur fond foncé. Icône facultative devant le texte.
 * Lien mailto: masqué aux robots comme dans les textes (cf. src/lib/courriel.ts).
 */
export function BoutonAction({ texte, lien, icone }: { texte?: string; lien?: string; icone?: string }) {
  const fonce = useFondFonce();
  const ref = useRef<HTMLAnchorElement>(null);
  const courriel = lien?.startsWith('mailto:') ? lien.slice('mailto:'.length) : undefined;
  useEffect(() => {
    if (courriel && ref.current?.parentElement) devoilerCourriels(ref.current.parentElement);
  });
  if (!texte || !lien) return null;
  const Icone = icone ? icones[icone] : undefined;
  return (
    <a
      ref={ref}
      href={courriel ? '#' : lien}
      data-courriel={courriel ? encoderCourriel(courriel) : undefined}
      className={fonce ? 'btn border-fond bg-fond text-noir hover:border-fond-2 hover:bg-fond-2' : 'btn btn-primary'}
    >
      {Icone && <Icone size={18} aria-hidden="true" />}
      {texte}
    </a>
  );
}

/** Section de page. `pleineLargeur` : pas de conteneur, le bloc place lui-même ses `conteneur` (bande sur toute la largeur). */
export function Bloc({
  children,
  className = '',
  fond = 'blanc',
  pleineLargeur = false,
}: {
  children: ReactNode;
  className?: string;
  fond?: Fond;
  pleineLargeur?: boolean;
}) {
  const classes = classesFond[fond] ?? '';
  return (
    <FondFonce.Provider value={fond === 'vert' || fond === 'bleu' || fond === 'degrade'}>
      <section data-fond={fond} className={`bloc ${classes} ${className}`.trim()}>
        {pleineLargeur ? children : <div className="conteneur">{children}</div>}
      </section>
    </FondFonce.Provider>
  );
}

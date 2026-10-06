import { BoutonAction, Ordinaux, Paragraphes, SurFondFonce, Surtitre } from './_commun';
import { urlImage } from './_image';
import type { DefinitionBloc } from './types';
import { nomsIcones } from '../lib/icones';

export type BandeauProps = {
  surtitre?: string;
  /** Injecté au rendu (pages générées, ex. articles) : le surtitre mène à la page parente. */
  lien_surtitre?: string;
  titre: string;
  /** Ligne mise en avant sous le titre (ex. date et lieu d'un événement). */
  sous_titre?: string;
  texte?: string;
  image?: string;
  bouton_texte?: string;
  bouton_lien?: string;
  bouton_icone?: string;
  /** Sans image : titre et texte centrés. */
  centre?: boolean;
  /** Sans image : fond en dégradé (celui du X du logo, comme le fond « degrade » des sections), texte blanc. */
  degrade?: boolean;
  /** Injecté au rendu : la section suivante est blanche, pas de marge du bas. */
  enchaine?: boolean;
};

export function Bandeau({ surtitre, lien_surtitre, titre, sous_titre, texte, image, bouton_texte, bouton_lien, bouton_icone, centre, degrade, enchaine }: BandeauProps) {
  const bouton = bouton_texte && bouton_lien && (
    <div className={`mt-e4 flex flex-wrap gap-e3${image || centre ? ' justify-center' : ''}`}>
      {/* Vert sur fond clair, blanc sur le dégradé. */}
      <BoutonAction texte={bouton_texte} lien={bouton_lien} icone={bouton_icone} />
    </div>
  );

  if (image) {
    // Comme la page d'accueil du YesWiki : grande photo sans voile, texte blanc centré.
    // Hauteur : tout l'écran sous l'en-tête (voir `hero-plein-ecran` et `premier-ecran` dans theme.css).
    // (une ombre légère sous le texte le garde lisible sur les zones claires).
    return (
      <section
        className="hero hero-plein-ecran relative bg-cover bg-center"
        style={{
          // Essai : bords teintés du bleu du logo, le halo jaune du centre de la photo reste intact.
          backgroundImage: `radial-gradient(ellipse at 55% 10%, transparent 35%, color-mix(in srgb, var(--c-bleu) 60%, transparent) 100%), url(${urlImage(image, 2400)})`,
        }}
      >
        <div className="hero-content conteneur relative flex-col gap-0 px-0 py-e7 text-center text-fond text-shadow-lg">
          {surtitre && <span className="text-xs font-bold tracking-widest uppercase">{surtitre}</span>}
          {/* Taille calée pour que le titre ait à peu près la largeur du texte (text-xl) en dessous. */}
          <h1 className="text-[clamp(3.1rem,5.4vw,4rem)] leading-[1.1]">
            <Ordinaux texte={titre} />
          </h1>
          <Paragraphes texte={texte} className="font-titre text-xl" />
          {bouton}
        </div>
      </section>
    );
  }

  const lignes = titre.split('\n');
  const premiereLigne = lignes.length > 1 ? lignes[0] : undefined;
  const suite = lignes.length > 1 ? lignes.slice(1).join('\n') : titre;
  const contenu = (
    <div className={`hero-content conteneur block p-0${centre ? ' text-center' : ''}`}>
      <Surtitre texte={surtitre} lien={lien_surtitre} />
      <h1 className="mb-e3 text-xxl last:mb-0">
        {/* Titre sur plusieurs lignes : la première, en plus grand, fait office d'accroche. */}
        {premiereLigne !== undefined && (
          <span className="block text-xxxl leading-none">
            <Ordinaux texte={premiereLigne} />
          </span>
        )}
        <Ordinaux texte={suite} />
      </h1>
      {sous_titre && <p className="mb-e4 font-titre text-l font-semibold tracking-wider uppercase last:mb-0">{sous_titre}</p>}
      <Paragraphes texte={texte} className={`mb-e3 text-l last:mb-0${degrade ? '' : ' text-gris'}${centre ? ' mx-auto max-w-[60rem]' : ''}`} />
      {bouton}
    </div>
  );

  if (degrade)
    return (
      <SurFondFonce>
        <section className="hero bg-linear-to-br from-degrade-debut to-degrade-fin py-e6 text-fond">{contenu}</section>
      </SurFondFonce>
    );

  return (
    // Suivi d'une section blanche : on remonte la section suivante pour ne laisser qu'un petit écart
    // (e4 sous un titre seul, e5 sous un sous-titre, qui a besoin de plus d'air).
    <section className={`hero pt-e6 ${enchaine ? (texte ? '-mb-e4 pb-0' : '-mb-e5 pb-0') : 'pb-e6'}`}>{contenu}</section>
  );
}

export const bandeau: DefinitionBloc<BandeauProps> = {
  name: 'bandeau',
  label: "Bandeau d'accueil",
  Component: Bandeau,
  fields: [
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'text', hint: 'Passez à la ligne pour couper le titre : la première ligne est alors affichée plus grande (sans image de fond).' },
    { name: 'sous_titre', label: 'Sous-titre', widget: 'string', required: false, hint: 'Ligne mise en avant sous le titre, ex. « 26-27 novembre 2026 à Villeurbanne ».' },
    { name: 'texte', label: 'Texte', widget: 'text', required: false },
    {
      name: 'image',
      label: 'Image de fond',
      widget: 'image',
      required: false,
      hint: 'Avec une image, le texte est centré et affiché en blanc.',
    },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
    { name: 'bouton_icone', label: 'Icône du bouton', widget: 'select', options: nomsIcones, required: false },
    { name: 'centre', label: 'Centré (sans image de fond)', widget: 'boolean', required: false, default: false },
    { name: 'degrade', label: 'Fond en dégradé (sans image de fond)', widget: 'boolean', required: false, default: false },
  ],
};

import { Paragraphes, Surtitre } from './_commun';
import type { DefinitionBloc } from './types';

export type BandeauProps = {
  surtitre?: string;
  titre: string;
  texte?: string;
  image?: string;
  bouton_texte?: string;
  bouton_lien?: string;
  /** Injecté au rendu : la section suivante est blanche, pas de marge du bas. */
  enchaine?: boolean;
};

export function Bandeau({ surtitre, titre, texte, image, bouton_texte, bouton_lien, enchaine }: BandeauProps) {
  const bouton = bouton_texte && bouton_lien && (
    <div className={`mt-e4 flex flex-wrap gap-e3${image ? ' justify-center' : ''}`}>
      <a className="btn btn-primary btn-lg" href={bouton_lien}>
        {bouton_texte}
      </a>
    </div>
  );

  if (image) {
    // Comme la page d'accueil du YesWiki : grande photo sans voile, texte blanc centré.
    // Hauteur : tout l'écran sous l'en-tête (voir `hero-plein-ecran` et `premier-ecran` dans theme.css).
    // (une ombre légère sous le texte le garde lisible sur les zones claires).
    return (
      <section
        className="hero hero-plein-ecran relative bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="hero-content conteneur relative flex-col px-0 py-e7 text-center text-fond text-shadow-lg">
          {surtitre && <span className="text-xs font-bold tracking-widest uppercase">{surtitre}</span>}
          <h1 className="text-xxl">{titre}</h1>
          <Paragraphes texte={texte} className="font-titre text-xl" />
          {bouton}
        </div>
      </section>
    );
  }

  return (
    // Suivi d'une section blanche : on remonte la section suivante pour ne laisser qu'un petit écart
    // (e4 sous un titre seul, e5 sous un sous-titre, qui a besoin de plus d'air).
    <section className={`hero pt-e6 ${enchaine ? (texte ? '-mb-e4 pb-0' : '-mb-e5 pb-0') : 'pb-e6'}`}>
      <div className="hero-content conteneur block p-0">
        <Surtitre texte={surtitre} />
        <h1 className="mb-e3 text-xxl last:mb-0">{titre}</h1>
        <Paragraphes texte={texte} className="mb-e3 max-w-texte text-l text-gris last:mb-0" />
        {bouton}
      </div>
    </section>
  );
}

export const bandeau: DefinitionBloc<BandeauProps> = {
  name: 'bandeau',
  label: "Bandeau d'accueil",
  Component: Bandeau,
  fields: [
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'string' },
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
  ],
};

import { Bloc, Boutons, Paragraphes, TitreBloc, champBoutons, champFond, champIconeTitre, type Fond } from './_commun';
import { Image } from './_image';
import type { DefinitionBloc } from './types';

export type TexteProps = {
  fond?: Fond;
  titre?: string;
  icone?: string;
  texte?: string;
  image?: string;
  image_alt?: string;
  /** Seconde image, affichée à côté de la première (même hauteur). */
  image_2?: string;
  image_2_alt?: string;
  image_avant?: boolean;
  image_pleine_largeur?: boolean;
  /** Image à droite, le texte l'habille (float). */
  image_a_droite?: boolean;
  /** Texte affiché sous l'image (l'image s'insère alors entre les deux textes). */
  texte_apres?: string;
  boutons?: { texte: string; lien: string }[];
};

/**
 * Bloc de texte simple : titre, paragraphes et listes, image (schéma, visuel…) au-dessus, en dessous, entre deux textes
 * ou à droite (habillée par le texte), boutons.
 */
export function Texte({ fond = 'blanc', titre, icone, texte, image, image_alt, image_2, image_2_alt, image_avant, image_pleine_largeur, image_a_droite, texte_apres, boutons }: TexteProps) {
  const marge = image_avant ? 'mb-e4' : 'mt-e4';
  const img =
    image &&
    (image_2 ? (
      // Deux images côte à côte, recadrées au même format (2:1) pour avoir la même hauteur.
      <div className={`grid gap-e3 md:grid-cols-2 ${marge}`}>
        {[
          [image, image_alt],
          [image_2, image_2_alt],
        ].map(([src, alt]) => (
          <Image key={src} sizes="(min-width: 768px) 36rem, 100vw" src={src!} alt={alt ?? ''} loading="lazy" className="block aspect-[2/1] w-full object-cover" />
        ))}
      </div>
    ) : (
      <Image
        sizes={image_pleine_largeur ? 'min(100vw, 72rem)' : 'min(100vw, 56rem)'}
        src={image}
        alt={image_alt ?? ''}
        loading="lazy"
        className={`mx-auto block w-full ${image_pleine_largeur ? '' : 'max-w-[56rem] '}${marge}`}
      />
    ));
  if (image && image_a_droite)
    return (
      <Bloc fond={fond}>
        <div className="flow-root">
          <Image
            sizes="(min-width: 768px) 36rem, 100vw"
            src={image}
            alt={image_alt ?? ''}
            loading="lazy"
            className="mb-e4 block w-full md:float-right md:mb-e3 md:ml-e5 md:w-1/2"
          />
          <TitreBloc titre={titre} icone={icone} />
          <Paragraphes texte={texte} />
          <Paragraphes texte={texte_apres} className="mt-e3" />
        </div>
        <Boutons boutons={boutons} />
      </Bloc>
    );
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} icone={icone} />
      {image_avant && img}
      <Paragraphes texte={texte} />
      {!image_avant && img}
      <Paragraphes texte={texte_apres} className="mt-e4" />
      <Boutons boutons={boutons} />
    </Bloc>
  );
}

export const texte: DefinitionBloc<TexteProps> = {
  name: 'texte',
  label: 'Texte',
  Component: Texte,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    champIconeTitre,
    {
      name: 'texte',
      label: 'Texte',
      widget: 'text',
      required: false,
      hint: 'Ligne vide = nouveau paragraphe. « - » en début de ligne = liste à puces. **gras**, [texte du lien](https://…).',
    },
    { name: 'image', label: 'Image', widget: 'image', required: false },
    { name: 'image_alt', label: "Description de l'image", widget: 'string', required: false },
    { name: 'image_2', label: 'Seconde image (à côté de la première)', widget: 'image', required: false },
    { name: 'image_2_alt', label: 'Description de la seconde image', widget: 'string', required: false },
    { name: 'texte_apres', label: "Texte sous l'image", widget: 'text', required: false },
    { name: 'image_avant', label: 'Image au-dessus du texte', widget: 'boolean', required: false, default: false },
    { name: 'image_a_droite', label: 'Image à droite, habillée par le texte', widget: 'boolean', required: false, default: false },
    { name: 'image_pleine_largeur', label: 'Image sur toute la largeur de la page', widget: 'boolean', required: false, default: false },
    champBoutons,
  ],
};

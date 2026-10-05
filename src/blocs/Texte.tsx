import { Bloc, Boutons, Paragraphes, TitreBloc, champBoutons, champFond, type Fond } from './_commun';
import { Image } from './_image';
import type { DefinitionBloc } from './types';

export type TexteProps = {
  fond?: Fond;
  titre?: string;
  texte?: string;
  image?: string;
  image_alt?: string;
  image_avant?: boolean;
  image_pleine_largeur?: boolean;
  boutons?: { texte: string; lien: string }[];
};

/** Bloc de texte simple : titre, paragraphes et listes, image (schéma, visuel…) au-dessus ou en dessous, boutons. */
export function Texte({ fond = 'blanc', titre, texte, image, image_alt, image_avant, image_pleine_largeur, boutons }: TexteProps) {
  const img = image && (
    <Image
      sizes={image_pleine_largeur ? 'min(100vw, 72rem)' : 'min(100vw, 56rem)'}
      src={image}
      alt={image_alt ?? ''}
      loading="lazy"
      className={`mx-auto block w-full ${image_pleine_largeur ? '' : 'max-w-[56rem] '}${image_avant ? 'mb-e4' : 'mt-e4'}`}
    />
  );
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      {image_avant && img}
      <Paragraphes texte={texte} />
      {!image_avant && img}
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
    {
      name: 'texte',
      label: 'Texte',
      widget: 'text',
      required: false,
      hint: 'Ligne vide = nouveau paragraphe. « - » en début de ligne = liste à puces. **gras**, [texte du lien](https://…).',
    },
    { name: 'image', label: 'Image', widget: 'image', required: false },
    { name: 'image_alt', label: "Description de l'image", widget: 'string', required: false },
    { name: 'image_avant', label: 'Image au-dessus du texte', widget: 'boolean', required: false, default: false },
    { name: 'image_pleine_largeur', label: 'Image sur toute la largeur de la page', widget: 'boolean', required: false, default: false },
    champBoutons,
  ],
};

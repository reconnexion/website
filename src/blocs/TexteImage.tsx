import { Bloc, Paragraphes, Surtitre, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type TexteImageProps = {
  fond?: Fond;
  surtitre?: string;
  titre: string;
  texte?: string;
  image?: string;
  image_alt?: string;
  inverse?: boolean;
  image_large?: boolean;
  image_logo?: boolean;
};

/**
 * Colonnes (classes écrites en entier pour Tailwind) : l'image occupe 1/2 par défaut, 2/3 si « large »,
 * 1/3 pour un logo. Avec `inverse`, l'image passe en première colonne.
 */
function colonnes(inverse?: boolean, image_large?: boolean, image_logo?: boolean) {
  if (image_logo) return inverse ? 'md:grid-cols-[1fr_2fr]' : 'md:grid-cols-[2fr_1fr]';
  if (image_large) return inverse ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-[1fr_2fr]';
  return 'md:grid-cols-2';
}

export function TexteImage({ fond = 'blanc', surtitre, titre, texte, image, image_alt, inverse, image_large, image_logo }: TexteImageProps) {
  return (
    <Bloc fond={fond}>
      <div className={`grid items-center gap-e5 ${colonnes(inverse, image_large, image_logo)}`}>
        {/* Texte à droite (image à gauche) : calé contre le bord droit du contenu et aligné à droite. */}
        <div className={`max-w-texte${inverse ? ' md:order-2 md:justify-self-end md:text-right' : ''}`}>
          <Surtitre texte={surtitre} />
          <TitreBloc titre={titre} />
          <Paragraphes texte={texte} />
        </div>
        {image && (
          <img
            className={image_logo ? 'mx-auto block max-h-52 w-full max-w-[23rem] object-contain' : 'block w-full'}
            src={image}
            alt={image_alt ?? ''}
            loading="lazy"
          />
        )}
      </div>
    </Bloc>
  );
}

export const texteImage: DefinitionBloc<TexteImageProps> = {
  name: 'texte_image',
  label: 'Texte et image',
  Component: TexteImage,
  fields: [
    champFond,
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'string' },
    { name: 'texte', label: 'Texte', widget: 'text', required: false, hint: 'Laissez une ligne vide pour changer de paragraphe.' },
    { name: 'image', label: 'Image', widget: 'image', required: false },
    { name: 'image_alt', label: "Description de l'image", widget: 'string', required: false },
    { name: 'inverse', label: 'Image à gauche', widget: 'boolean', required: false, default: false },
    { name: 'image_large', label: 'Image plus large que le texte (2/3)', widget: 'boolean', required: false, default: false },
    {
      name: 'image_logo',
      label: 'Image de type logo (1/3 de la largeur, taille réduite, centrée)',
      widget: 'boolean',
      required: false,
      default: false,
    },
  ],
};

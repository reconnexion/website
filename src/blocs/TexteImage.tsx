import type { ReactNode } from 'react';
import { Bloc, Paragraphes, Surtitre, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type TexteImageProps = {
  fond?: Fond;
  surtitre?: string;
  titre: string;
  texte?: string;
  image?: string;
  image_alt?: string;
  /** Lien ouvert au clic sur l'image (nouvel onglet s'il est externe). */
  image_lien?: string;
  inverse?: boolean;
  image_large?: boolean;
  image_logo?: boolean;
  texte_grand?: boolean;
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

export function TexteImage({ fond = 'blanc', surtitre, titre, texte, image, image_alt, image_lien, inverse, image_large, image_logo, texte_grand }: TexteImageProps) {
  return (
    <Bloc fond={fond}>
      <div className={`grid items-center gap-e5 ${colonnes(inverse, image_large, image_logo)}`}>
        {/* Texte à droite (image à gauche) : calé contre le bord droit du contenu et aligné à droite. */}
        <div className={`max-w-texte${inverse ? ' md:order-2 md:justify-self-end md:text-right' : ''}`}>
          <Surtitre texte={surtitre} />
          <TitreBloc titre={titre} />
          <Paragraphes texte={texte} className={texte_grand ? 'text-ml' : ''} />
        </div>
        {image && (
          <Lien lien={image_lien}>
            <img
              className={image_logo ? 'mx-auto block max-h-52 w-full max-w-[23rem] object-contain' : 'block w-full'}
              src={image}
              alt={image_alt ?? ''}
              loading="lazy"
            />
          </Lien>
        )}
      </div>
    </Bloc>
  );
}

/** Entoure l'image d'un lien s'il y en a un ; les liens externes s'ouvrent dans un nouvel onglet. */
function Lien({ lien, children }: { lien?: string; children: ReactNode }) {
  if (!lien) return children;
  const externe = /^https?:\/\//.test(lien);
  return (
    <a href={lien} target={externe ? '_blank' : undefined} rel={externe ? 'noopener' : undefined}>
      {children}
    </a>
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
    { name: 'image_lien', label: "Lien de l'image", widget: 'string', required: false, hint: 'Ex. https://forum.reconnexion.coop' },
    { name: 'inverse', label: 'Image à gauche', widget: 'boolean', required: false, default: false },
    { name: 'image_large', label: 'Image plus large que le texte (2/3)', widget: 'boolean', required: false, default: false },
    {
      name: 'image_logo',
      label: 'Image de type logo (1/3 de la largeur, taille réduite, centrée)',
      widget: 'boolean',
      required: false,
      default: false,
    },
    { name: 'texte_grand', label: 'Texte plus grand', widget: 'boolean', required: false, default: false },
  ],
};

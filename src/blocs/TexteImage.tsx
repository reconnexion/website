import { Bloc, Paragraphes } from './_commun';
import type { DefinitionBloc } from './types';

export type TexteImageProps = {
  surtitre?: string;
  titre: string;
  texte?: string;
  image?: string;
  image_alt?: string;
  inverse?: boolean;
};

export function TexteImage({ surtitre, titre, texte, image, image_alt, inverse }: TexteImageProps) {
  return (
    <Bloc>
      <div className={`texte-image${inverse ? ' texte-image--inverse' : ''}`}>
        <div className="corps">
          {surtitre && <span className="surtitre">{surtitre}</span>}
          <h2>{titre}</h2>
          <Paragraphes texte={texte} />
        </div>
        {image && <img src={image} alt={image_alt ?? ''} loading="lazy" />}
      </div>
    </Bloc>
  );
}

export const texteImage: DefinitionBloc<TexteImageProps> = {
  name: 'texte_image',
  label: 'Texte et image',
  Component: TexteImage,
  fields: [
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'string' },
    { name: 'texte', label: 'Texte', widget: 'text', required: false, hint: 'Laissez une ligne vide pour changer de paragraphe.' },
    { name: 'image', label: 'Image', widget: 'image', required: false },
    { name: 'image_alt', label: "Description de l'image", widget: 'string', required: false },
    { name: 'inverse', label: 'Image à gauche', widget: 'boolean', required: false, default: false },
  ],
};

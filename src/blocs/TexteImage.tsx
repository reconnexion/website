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
};

export function TexteImage({ fond = 'blanc', surtitre, titre, texte, image, image_alt, inverse, image_large }: TexteImageProps) {
  return (
    <Bloc fond={fond}>
      <div className={`grid items-center gap-e5 ${image_large ? (inverse ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-[1fr_2fr]') : 'md:grid-cols-2'}`}>
        <div className={`max-w-texte${inverse ? ' md:order-2' : ''}`}>
          <Surtitre texte={surtitre} />
          <TitreBloc titre={titre} />
          <Paragraphes texte={texte} />
        </div>
        {image && <img className="block w-full" src={image} alt={image_alt ?? ''} loading="lazy" />}
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
  ],
};

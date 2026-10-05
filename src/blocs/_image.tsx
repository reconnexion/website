import type { ImgHTMLAttributes } from 'react';

/**
 * Images optimisées : `scripts/optimiser-images.mjs` génère au build, pour chaque image matricielle de
 * `public/images/`, des variantes WebP dans `dist/client/_img/<largeur>/<chemin>.webp`.
 * Les originaux restent dans `public/images/` (déposés par le CMS) et servis tels quels à `/images/…`.
 * Garder ces largeurs et ce format d'URL alignés avec le script.
 */
export const LARGEURS_IMAGES = [480, 960, 1600, 2400] as const;

// Les variantes n'existent qu'une fois le site construit : ni avec `astro dev`, ni dans l'aperçu du CMS
// (scripts/build-cms.mjs y définit `import.meta.env.PROD` à false).
const VARIANTES = import.meta.env.PROD;

function aDesVariantes(src?: string): src is string {
  return VARIANTES && !!src && /^\/images\/[^?#]+\.(png|jpe?g|webp)$/i.test(src);
}

function urlVariante(src: string, largeur: number) {
  // Virgules encodées : elles séparent les candidats dans `srcset`.
  return encodeURI(`/_img/${largeur}/${src.slice('/images/'.length)}.webp`).replace(/,/g, '%2C');
}

/** URL de l'image en `largeur` px au plus (pour un `background-image`), ou l'original si elle n'a pas de variantes. */
export function urlImage(src: string, largeur: (typeof LARGEURS_IMAGES)[number]) {
  return aDesVariantes(src) ? urlVariante(src, largeur) : src;
}

/**
 * `<img>` qui charge la variante adaptée à la place affichée. `sizes` : largeur affichée de l'image
 * (ex. `(min-width: 768px) 36rem, 100vw`). Les autres images (SVG, Grist, URL externes) passent telles quelles.
 */
export function Image({ src, sizes, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src?: string; sizes: string }) {
  if (!aDesVariantes(src)) return <img src={src} {...props} />;
  return (
    <img
      src={urlVariante(src, 960)}
      srcSet={LARGEURS_IMAGES.map((l) => `${urlVariante(src, l)} ${l}w`).join(', ')}
      sizes={sizes}
      {...props}
    />
  );
}

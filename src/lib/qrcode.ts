/**
 * QR code en SVG, calculé de façon synchrone (build du site et aperçu du CMS) avec la bibliothèque qrcode.
 * Un seul <path> : léger, net à toutes les tailles et à l'impression.
 */
// Noyau de calcul seulement : le point d'entrée principal de qrcode utilise fs (inutilisable dans le navigateur).
import { create } from 'qrcode/lib/core/qrcode';

export function qrcodeSvg(texte: string, couleur = '#000'): string {
  const { modules } = create(texte, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges"><path fill="${couleur}" d="${d}"/></svg>`;
}

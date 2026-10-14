/**
 * Visionneuse des captures d'écran d'une application (cf. FicheApplication) : modale <dialog> plein écran
 * dont les diapositives défilent horizontalement (carrousel à défilement magnétique, balayage au doigt).
 * Sur le site, `installerVisionneuse` (script de la page) gère les clics ; dans l'aperçu du CMS, rendu en React,
 * les mêmes fonctions sont appelées par des `onClick`.
 */
export const ID_VISIONNEUSE = 'visionneuse-captures';

const visionneuse = (doc: Document) => doc.getElementById(ID_VISIONNEUSE) as HTMLDialogElement | null;

/** Ouvre la visionneuse sur la capture n° `index` (dans l'ordre de la fiche). */
export function ouvrirCapture(doc: Document, index: number) {
  const dialogue = visionneuse(doc);
  if (!dialogue) return;
  dialogue.showModal();
  dialogue.querySelectorAll('[data-diapo]')[index]?.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'instant' });
}

/** Passe à la capture suivante (sens = 1) ou précédente (sens = -1). */
export function defilerCaptures(doc: Document, sens: number) {
  const diapos = visionneuse(doc)?.querySelector('[data-diapos]');
  diapos?.scrollBy({ left: sens * diapos.clientWidth, behavior: 'smooth' });
}

export function installerVisionneuse() {
  document.addEventListener('click', (e) => {
    const cible = e.target as Element;
    const vignette = cible.closest<HTMLElement>('[data-capture]');
    if (vignette) {
      // Sans JavaScript, le lien ouvre l'image seule.
      e.preventDefault();
      ouvrirCapture(document, Number(vignette.dataset.capture));
    }
    const fleche = cible.closest<HTMLElement>('[data-defiler]');
    if (fleche) defilerCaptures(document, Number(fleche.dataset.defiler));
    // Clic à côté de l'image : ferme la visionneuse.
    if (cible.hasAttribute('data-diapo')) visionneuse(document)?.close();
  });
  document.addEventListener('keydown', (e) => {
    if (!visionneuse(document)?.open) return;
    if (e.key === 'ArrowRight') defilerCaptures(document, 1);
    if (e.key === 'ArrowLeft') defilerCaptures(document, -1);
  });
}

/**
 * Cartes favorites, mémorisées dans le navigateur du visiteur (localStorage) : boutons étoile de la liste
 * (data-favori-bouton) et filtre « Favoris » (attribut data-favori sur les cartes, cf. theme.css).
 */
const CLE = 'reconnexion-cartes-favoris';

export function lireFavoris(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function ecrireFavoris(favoris: string[]) {
  try {
    localStorage.setItem(CLE, JSON.stringify(favoris));
  } catch {
    /* stockage indisponible (navigation privée…) : les favoris ne sont pas conservés */
  }
}

function afficher(favoris: string[]) {
  document.querySelectorAll<HTMLElement>('[data-carte]').forEach((el) => {
    el.toggleAttribute('data-favori', favoris.includes(el.dataset.carte!));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-favori-bouton]').forEach((b) => {
    const actif = favoris.includes(b.dataset.favoriBouton!);
    const texte = actif ? b.dataset.texteRetirer : b.dataset.texteAjouter;
    b.setAttribute('aria-pressed', String(actif));
    b.classList.toggle('text-vert-fonce', actif);
    b.querySelector('svg')?.setAttribute('fill', actif ? 'currentColor' : 'none');
    if (texte) {
      b.title = texte;
      b.setAttribute('aria-label', texte);
    }
  });
}

export function initialiserFavoris() {
  if (!document.querySelector('[data-favori-bouton]')) return;
  let favoris = lireFavoris();
  afficher(favoris);
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-favori-bouton]');
    if (!b) return;
    const slug = b.dataset.favoriBouton!;
    favoris = favoris.includes(slug) ? favoris.filter((s) => s !== slug) : [...favoris, slug];
    ecrireFavoris(favoris);
    afficher(favoris);
  });
}

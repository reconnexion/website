/**
 * Masquage des adresses e-mail contre les robots collecteurs : l'adresse n'apparaît jamais en clair
 * dans le HTML (encodée dans data-courriel), un petit script la rétablit dans le navigateur
 * (cf. `devoilerCourriels`, appelé par Base.astro et par le composant Courriel dans l'aperçu du CMS).
 */

/** Encodage réversible : adresse à l'envers, en base64. */
export const encoderCourriel = (adresse: string) => btoa([...adresse].reverse().join(''));
export const decoderCourriel = (code: string) => [...atob(code)].reverse().join('');

/** Forme lisible par un humain mais pas par un robot, affichée si JavaScript est désactivé. */
export const courrielLisible = (adresse: string) => adresse.replace('@', ' [at] ').replace(/\./g, ' [dot] ');

/** Rétablit les liens mailto (et le texte, s'il s'agissait de l'adresse) des éléments masqués. */
export function devoilerCourriels(racine: ParentNode = document) {
  racine.querySelectorAll<HTMLAnchorElement>('a[data-courriel]').forEach((a) => {
    const adresse = decoderCourriel(a.dataset.courriel!);
    a.href = `mailto:${adresse}`;
    if (a.dataset.courrielTexte !== undefined) a.textContent = adresse;
    a.removeAttribute('data-courriel');
  });
}

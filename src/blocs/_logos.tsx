import type { Logo } from '../lib/types';

/** Grille de logos (partenaires, réseaux) : logo carré sur fond blanc, nom dessous, lien vers le site. */
export function GrilleLogos({ logos }: { logos: Logo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-e4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {logos.map((o, i) => {
        const contenu = (
          <>
            <div className="grid aspect-square place-items-center border border-base-300 bg-fond p-e4">
              {o.logo ? (
                <img src={o.logo} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-center font-titre text-l">{o.nom}</span>
              )}
            </div>
            <strong className="mt-e2 block text-center font-semibold text-noir">{o.nom}</strong>
          </>
        );
        return (
          <li key={i}>
            {o.lien ? (
              <a href={o.lien} className="link-hover block" target="_blank" rel="noopener">
                {contenu}
              </a>
            ) : (
              contenu
            )}
          </li>
        );
      })}
    </ul>
  );
}

import { Bloc, Boutons, TitreBloc, champBoutons, champFond, type Fond } from './_commun';
import { Image } from './_image';
import type { DefinitionBloc } from './types';
import type { Article } from '../lib/types';
import { articlesDemo } from '../lib/demo';

export type ActualitesProps = {
  fond?: Fond;
  titre?: string;
  nombre?: number;
  texte_lien?: string;
  texte_vide?: string;
  boutons?: { texte: string; lien: string }[];
  /** Injecté au rendu depuis le forum — pas édité dans le CMS. */
  articles?: Article[];
};

const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

export const lienArticle = (a: Pick<Article, 'slug'>) => `/actualites/${a.slug}`;

/**
 * Derniers articles du forum (sujets portant l'étiquette réglée dans « Réglages → Actualités »), en cartes.
 * Comme la grille de cartes : bouton (ex. « Toutes les actualités ») au niveau du titre.
 */
export function Actualites({ fond = 'blanc', titre, texte_lien, texte_vide, boutons = [], articles }: ActualitesProps) {
  const boutonsEnHaut = !!titre && boutons.length > 0;
  return (
    <Bloc fond={fond}>
      {boutonsEnHaut ? (
        <div className="mb-e4 flex flex-wrap items-center justify-between gap-x-e4 gap-y-e3">
          <TitreBloc titre={titre} className="mb-0!" />
          <Boutons boutons={boutons} className="mt-0!" />
        </div>
      ) : (
        <TitreBloc titre={titre} />
      )}
      {articles === undefined ? null : articles.length === 0 ? (
        texte_vide && <p>{texte_vide}</p>
      ) : (
        <ul className="grid gap-e4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => {
            const lien = lienArticle(a);
            return (
              <li key={a.slug} className="flex flex-col bg-base-200 text-noir">
                {a.image && (
                  <a href={lien} className="block transition-opacity hover:opacity-90" tabIndex={-1}>
                    <Image src={a.image} sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw" alt="" loading="lazy" className="aspect-video w-full object-cover" />
                  </a>
                )}
                <div className="flex grow flex-col items-start gap-e2 p-e4">
                  <time dateTime={a.date} className="text-xs text-gris">
                    {fmtDate.format(new Date(a.date))}
                  </time>
                  <h3 className="text-l">
                    <a href={lien} className="link-hover">
                      {a.titre}
                    </a>
                  </h3>
                  {a.resume && <p className="text-s text-gris">{a.resume}</p>}
                  {texte_lien && (
                    <a href={lien} className="link mt-auto pt-e2 font-semibold text-vert-fonce">
                      {texte_lien}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {!boutonsEnHaut && <Boutons boutons={boutons} />}
    </Bloc>
  );
}

export const actualites: DefinitionBloc<ActualitesProps> = {
  name: 'actualites',
  label: 'Actualités (depuis le forum)',
  Component: Actualites,
  source: 'discourse',
  donneesExemple: (d) => ({ articles: articlesDemo.slice(0, Number(d.nombre) || undefined) }),
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'nombre',
      label: "Nombre d'articles affichés",
      widget: 'number',
      value_type: 'int',
      min: 0,
      max: 100,
      default: 3,
      required: false,
      hint: '0 ou vide : tous les articles. Les articles sont les sujets du forum portant l’étiquette réglée dans « Réglages du site → Actualités ».',
    },
    { name: 'texte_lien', label: 'Texte du lien sous chaque article', widget: 'string', required: false },
    { name: 'texte_vide', label: 'Texte si aucun article', widget: 'string', required: false },
    champBoutons,
  ],
};

/**
 * Lecture des fichiers de contenu édités dans Sveltia (YAML dans src/content/).
 * Lus au build : une modification dans le CMS = un commit = un rebuild par la CI.
 */
import { parse } from 'yaml';
import type { DonneesBloc } from '../blocs/registre';

export type Page = {
  titre: string;
  slug: string;
  description?: string;
  sections: DonneesBloc[];
};

export type Site = {
  nom: string;
  menu: { texte: string; lien: string }[];
  pied_de_page?: string;
  texte_chargement?: string;
};

const fichiersPages = import.meta.glob('../content/pages/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const fichierSite = import.meta.glob('../content/site.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function toutesLesPages(): Page[] {
  return Object.values(fichiersPages).map((brut) => {
    const page = parse(brut) as Page;
    return { ...page, sections: page.sections ?? [] };
  });
}

export function reglagesSite(): Site {
  return parse(Object.values(fichierSite)[0]) as Site;
}

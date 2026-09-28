import { Paragraphes } from './_commun';
import type { DefinitionBloc } from './types';

export type BandeauProps = {
  surtitre?: string;
  titre: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
};

export function Bandeau({ surtitre, titre, texte, bouton_texte, bouton_lien }: BandeauProps) {
  return (
    <section className="bandeau">
      <svg className="fils" viewBox="0 0 400 300" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="2">
          <path d="M20 250 C 120 80, 220 260, 380 60" />
          <path d="M40 60 C 160 200, 240 20, 360 240" />
          <path d="M10 150 C 140 140, 260 180, 390 150" />
        </g>
        <g fill="currentColor">
          <circle cx="20" cy="250" r="7" /><circle cx="380" cy="60" r="7" />
          <circle cx="40" cy="60" r="7" /><circle cx="360" cy="240" r="7" />
          <circle cx="200" cy="158" r="10" />
        </g>
      </svg>
      <div className="conteneur">
        {surtitre && <span className="surtitre">{surtitre}</span>}
        <h1>{titre}</h1>
        <Paragraphes texte={texte} />
        {bouton_texte && bouton_lien && (
          <div className="actions">
            <a className="bouton" href={bouton_lien}>{bouton_texte}</a>
          </div>
        )}
      </div>
    </section>
  );
}

export const bandeau: DefinitionBloc<BandeauProps> = {
  name: 'bandeau',
  label: "Bandeau d'accueil",
  Component: Bandeau,
  fields: [
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'string' },
    { name: 'texte', label: 'Texte', widget: 'text', required: false },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
  ],
};

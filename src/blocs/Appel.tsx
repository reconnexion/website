import { Paragraphes } from './_commun';
import type { DefinitionBloc } from './types';

export type AppelProps = {
  titre: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
};

export function Appel({ titre, texte, bouton_texte, bouton_lien }: AppelProps) {
  return (
    <section className="bloc">
      <div className="conteneur">
        <div className="appel">
          <h2>{titre}</h2>
          <Paragraphes texte={texte} />
          {bouton_texte && bouton_lien && (
            <a className="bouton" href={bouton_lien}>{bouton_texte}</a>
          )}
        </div>
      </div>
    </section>
  );
}

export const appel: DefinitionBloc<AppelProps> = {
  name: 'appel',
  label: "Appel à l'action",
  Component: Appel,
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string' },
    { name: 'texte', label: 'Texte', widget: 'text', required: false },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
  ],
};

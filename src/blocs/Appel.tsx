import { Bloc, Paragraphes } from './_commun';
import type { DefinitionBloc } from './types';

export type AppelProps = {
  titre: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
};

export function Appel({ titre, texte, bouton_texte, bouton_lien }: AppelProps) {
  return (
    <Bloc>
      <div className="card bg-primary text-primary-content">
        <div className="card-body gap-e3 p-e5">
          <h2 className="card-title text-xl">{titre}</h2>
          <Paragraphes texte={texte} className="max-w-texte opacity-85" />
          {bouton_texte && bouton_lien && (
            <div className="card-actions">
              <a className="btn border-fond bg-fond text-vert-fonce hover:border-fond-2 hover:bg-fond-2" href={bouton_lien}>
                {bouton_texte}
              </a>
            </div>
          )}
        </div>
      </div>
    </Bloc>
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

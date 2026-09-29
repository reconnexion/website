import { Bloc, Paragraphes, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

export type EncadreProps = {
  fond?: Fond;
  icone?: string;
  titre?: string;
  texte?: string;
};

/** Encadré mis en exergue dans le fil du texte (ex. « La place de l'IA »). */
export function Encadre({ fond = 'blanc', icone, titre, texte }: EncadreProps) {
  const Icone = icone ? icones[icone] : undefined;
  return (
    <Bloc fond={fond}>
      <aside className="max-w-[48rem] bg-base-200 p-e4 text-noir sm:p-e5">
        {titre && (
          <h2 className="mb-e3 flex items-center gap-e3 text-l">
            {Icone && (
              <span className="grid size-10 shrink-0 place-items-center bg-primary text-primary-content">
                <Icone size={22} aria-hidden="true" />
              </span>
            )}
            {titre}
          </h2>
        )}
        <Paragraphes texte={texte} />
      </aside>
    </Bloc>
  );
}

export const encadre: DefinitionBloc<EncadreProps> = {
  name: 'encadre',
  label: 'Encadré',
  Component: Encadre,
  fields: [
    champFond,
    { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'texte', label: 'Texte', widget: 'text', required: false },
  ],
};

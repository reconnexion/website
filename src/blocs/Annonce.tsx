import { ArrowRight } from 'lucide-react';
import { Bloc } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

export type AnnonceProps = {
  icone?: string;
  etiquette?: string;
  titre: string;
  texte?: string;
  bouton_texte?: string;
  bouton_lien?: string;
};

/** Annonce mise en avant (événement, nouveauté…) : bande verte pleine largeur, éléments daisyUI. */
export function Annonce({ icone, etiquette, titre, texte, bouton_texte, bouton_lien }: AnnonceProps) {
  const Icone = icone ? icones[icone] : undefined;
  return (
    <Bloc fond="vert" className="py-e4">
      <div role="status" className="flex flex-col items-center gap-e4 text-center sm:flex-row sm:text-left">
        {Icone && (
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-fond text-vert-fonce">
            <Icone size={24} aria-hidden="true" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-x-e3 gap-y-e2 sm:justify-start">
            <h2 className="text-l">{titre}</h2>
            {etiquette && <span className="badge badge-outline font-semibold">{etiquette}</span>}
          </div>
          {texte && <p className="text-ml opacity-90">{texte}</p>}
        </div>
        {bouton_texte && bouton_lien && (
          <a href={bouton_lien} className="btn shrink-0 border-fond bg-fond text-vert-fonce hover:border-fond-2 hover:bg-fond-2">
            {bouton_texte}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        )}
      </div>
    </Bloc>
  );
}

export const annonce: DefinitionBloc<AnnonceProps> = {
  name: 'annonce',
  label: 'Annonce',
  Component: Annonce,
  fields: [
    { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
    { name: 'etiquette', label: 'Étiquette', widget: 'string', required: false, hint: 'Affichée à droite du titre. Ex. « 26-27 novembre · Lyon », « Nouveau ».' },
    { name: 'titre', label: 'Titre', widget: 'string' },
    { name: 'texte', label: 'Texte', widget: 'string', required: false },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
  ],
};

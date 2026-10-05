import type { CSSProperties } from 'react';
import { Bloc, Paragraphes, SurFondClair, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

type Pilier = { icone?: string; titre: string; texte?: string };

export type PiliersProps = {
  fond?: Fond;
  surtitre?: string;
  titre?: string;
  piliers?: Pilier[];
};

/**
 * Principes clés (ex. « les 3 libertés fondamentales ») : titre sur fond coloré, une grande icône blanche
 * par colonne, coupée par une bande blanche qui porte le titre et le texte de chaque colonne.
 * Sur mobile, les colonnes s'empilent : l'icône passe dans la bande, au-dessus de son texte.
 */
export function Piliers({ fond = 'degrade', surtitre, titre, piliers = [] }: PiliersProps) {
  const colonnes = { '--colonnes': Math.max(piliers.length, 1) } as CSSProperties;
  const grille = 'gap-e5 md:grid-cols-[repeat(var(--colonnes),minmax(0,1fr))]';
  return (
    <Bloc fond={fond} pleineLargeur>
      <div className="conteneur text-center">
        {/* Titre d'affiche, plus grand que les titres de section habituels. */}
        {surtitre && <p className="mb-e2 text-l tracking-wide uppercase">{surtitre}</p>}
        <TitreBloc titre={titre} className="text-xxl" />
        <div className={`hidden md:grid ${grille}`} style={colonnes} aria-hidden="true">
          {piliers.map((p, i) => {
            const Icone = p.icone ? icones[p.icone] : undefined;
            // L'icône dépasse sous la bande blanche, qui en masque le bas.
            return <div key={i} className="flex h-24 justify-center overflow-hidden">{Icone && <Icone size={128} strokeWidth={2.25} />}</div>;
          })}
        </div>
      </div>
      <SurFondClair>
        <div className="mt-e4 bg-fond py-e5 text-noir md:mt-0">
          <div className={`conteneur grid ${grille} text-center`} style={colonnes}>
            {piliers.map((p, i) => {
              const Icone = p.icone ? icones[p.icone] : undefined;
              return (
                <div key={i} className="mx-auto max-w-80">
                  {Icone && <Icone size={56} strokeWidth={2.25} aria-hidden="true" className="mx-auto mb-e3 text-vert md:hidden" />}
                  <h3 className="mb-e3 text-l text-balance">{p.titre}</h3>
                  <Paragraphes texte={p.texte} />
                </div>
              );
            })}
          </div>
        </div>
      </SurFondClair>
    </Bloc>
  );
}

export const piliers: DefinitionBloc<PiliersProps> = {
  name: 'piliers',
  label: 'Piliers (colonnes à grande icône)',
  Component: Piliers,
  fields: [
    { ...champFond, options: ['degrade', 'vert', 'bleu'], default: 'degrade' },
    { name: 'surtitre', label: 'Surtitre', widget: 'string', required: false },
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    {
      name: 'piliers',
      label: 'Colonnes',
      widget: 'list',
      summary: '{{titre}}',
      hint: 'Trois colonnes de préférence.',
      fields: [
        { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
        { name: 'titre', label: 'Titre', widget: 'string' },
        { name: 'texte', label: 'Texte', widget: 'text', required: false },
      ],
    },
  ],
};

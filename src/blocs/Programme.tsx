import { Bloc, Paragraphes, TitreBloc, champFond, champIconeTitre, useFondFonce, type Fond } from './_commun';
import type { DefinitionBloc } from './types';
import { icones, nomsIcones } from '../lib/icones';

type Etape = { jour?: string; moment?: string; titre: string; texte?: string; icone?: string; etiquette?: string };

export type ProgrammeProps = {
  fond?: Fond;
  titre?: string;
  icone?: string;
  texte?: string;
  etapes?: Etape[];
};

/** Regroupe les étapes consécutives d'un même jour. */
function parJour(etapes: Etape[]) {
  const jours: { jour?: string; etapes: Etape[] }[] = [];
  for (const e of etapes) {
    const dernier = jours.at(-1);
    if (dernier && dernier.jour === e.jour) dernier.etapes.push(e);
    else jours.push({ jour: e.jour, etapes: [e] });
  }
  return jours;
}

/**
 * Programme d'un événement, compact : une ligne par jour (le jour à gauche, ses étapes côte à côte sur
 * grand écran ; tout s'empile sur mobile).
 */
export function Programme({ fond = 'blanc', titre, icone, texte, etapes = [] }: ProgrammeProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} icone={icone} />
      <Paragraphes texte={texte} className="mb-e4" />
      <Jours etapes={etapes} />
    </Bloc>
  );
}

/** Composant à part : `useFondFonce` doit être appelé sous le `Bloc` qui fournit le fond. */
function Jours({ etapes }: { etapes: Etape[] }) {
  const fonce = useFondFonce();
  return (
    <div className={`divide-y ${fonce ? 'divide-fond/40' : 'divide-trait'}`}>
      {parJour(etapes).map((j, n) => (
        <section key={n} className="grid gap-e3 py-e4 md:grid-cols-[10rem_1fr] md:gap-e5">
          {j.jour && <h3 className="text-l">{j.jour}</h3>}
          <ol className="grid gap-e4 md:col-start-2 md:grid-cols-3">
            {j.etapes.map((e, i) => {
              const Icone = e.icone ? icones[e.icone] : undefined;
              return (
                <li key={i}>
                  {e.moment && (
                    <p className={`text-xs font-bold tracking-widest uppercase${fonce ? '' : ' text-vert-fonce'}`}>{e.moment}</p>
                  )}
                  <h4 className="mt-e1 flex items-center gap-e2 font-titre text-ml font-semibold">
                    {Icone && <Icone size="1em" aria-hidden="true" className={`shrink-0${fonce ? '' : ' text-vert-fonce'}`} />}
                    {e.titre}
                  </h4>
                  {e.etiquette && <span className={`badge mt-e2 badge-outline${fonce ? '' : ' badge-primary'}`}>{e.etiquette}</span>}
                  <Paragraphes texte={e.texte} className="mt-e2 text-s" />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export const programme: DefinitionBloc<ProgrammeProps> = {
  name: 'programme',
  label: 'Programme (par jour)',
  Component: Programme,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    champIconeTitre,
    { name: 'texte', label: 'Introduction', widget: 'text', required: false },
    {
      name: 'etapes',
      label: 'Étapes',
      widget: 'list',
      summary: '{{jour}} {{moment}} : {{titre}}',
      fields: [
        {
          name: 'jour',
          label: 'Jour',
          widget: 'string',
          required: false,
          hint: 'Ex. « Jeudi 26 ». Les étapes qui se suivent avec le même jour sont regroupées sur une ligne.',
        },
        { name: 'moment', label: 'Moment', widget: 'string', required: false, hint: 'Ex. « Matin », « Midi », « 18h ».' },
        { name: 'titre', label: 'Titre', widget: 'string' },
        { name: 'etiquette', label: 'Étiquette', widget: 'string', required: false, hint: 'Ex. « Ouvert à tous ».' },
        { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
        { name: 'texte', label: 'Texte', widget: 'text', required: false },
      ],
    },
  ],
};

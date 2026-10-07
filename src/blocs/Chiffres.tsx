import { Bloc, TitreBloc, champFond, champIconeTitre, useFondFonce, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

type Chiffre = { nombre: string; libelle: string };

export type ChiffresProps = {
  fond?: Fond;
  titre?: string;
  icone?: string;
  chiffres?: Chiffre[];
};

function ListeChiffres({ chiffres }: { chiffres: Chiffre[] }) {
  const fonce = useFondFonce();
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-e5 text-center">
      {chiffres.map((c, i) => (
        // Le nombre avant son libellé à l'écran, mais <dt> (libellé) d'abord pour les lecteurs d'écran.
        <div key={i} className="flex flex-col-reverse justify-end">
          <dt className="text-l text-balance">{c.libelle}</dt>
          <dd className={`mb-e2 font-titre text-xxxl leading-none font-semibold${fonce ? '' : ' text-vert-fonce'}`}>{c.nombre}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Chiffres clés (ex. « 40 participants ») : grands nombres côte à côte, chacun avec un libellé court. */
export function Chiffres({ fond = 'blanc', titre, icone, chiffres = [] }: ChiffresProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} icone={icone} className="justify-center text-center" />
      <ListeChiffres chiffres={chiffres} />
    </Bloc>
  );
}

export const chiffres: DefinitionBloc<ChiffresProps> = {
  name: 'chiffres',
  label: 'Chiffres clés',
  Component: Chiffres,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    champIconeTitre,
    {
      name: 'chiffres',
      label: 'Chiffres',
      widget: 'list',
      summary: '{{nombre}} {{libelle}}',
      hint: 'Trois ou quatre chiffres de préférence.',
      fields: [
        { name: 'nombre', label: 'Nombre', widget: 'string', hint: 'Ex. « 40 », « 2 », « +100 ».' },
        { name: 'libelle', label: 'Libellé', widget: 'string', hint: 'Ex. « participants ».' },
      ],
    },
  ],
};

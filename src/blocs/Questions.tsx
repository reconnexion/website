import { Bloc, Paragraphes, SurFondClair, TitreBloc, champFond, champIconeTitre, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

type Question = { question: string; reponse?: string };

export type QuestionsProps = {
  fond?: Fond;
  titre?: string;
  icone?: string;
  questions?: Question[];
  /** Texte centré sous les questions (ex. invitation à nous contacter). */
  texte_apres?: string;
};

/**
 * Questions fréquentes : liste dépliable (`<details>` + collapse daisyUI, sans JavaScript).
 * Toutes les questions sont repliées au chargement ; plusieurs peuvent être ouvertes à la fois.
 */
export function Questions({ fond = 'blanc', titre, icone, questions = [], texte_apres }: QuestionsProps) {
  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} icone={icone} />
      <SurFondClair>
        <div className="flex flex-col gap-e2">
          {questions.map((q, i) => (
            <details key={i} className="collapse-arrow collapse bg-base-200 text-noir">
              <summary className="collapse-title font-titre text-ml font-semibold">{q.question}</summary>
              <div className="collapse-content">
                <Paragraphes texte={q.reponse} />
              </div>
            </details>
          ))}
        </div>
      </SurFondClair>
      <Paragraphes texte={texte_apres} className="mt-e4 text-center" />
    </Bloc>
  );
}

export const questions: DefinitionBloc<QuestionsProps> = {
  name: 'questions',
  label: 'Questions fréquentes (liste dépliable)',
  Component: Questions,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    champIconeTitre,
    {
      name: 'questions',
      label: 'Questions',
      widget: 'list',
      summary: '{{question}}',
      fields: [
        { name: 'question', label: 'Question', widget: 'string' },
        {
          name: 'reponse',
          label: 'Réponse',
          widget: 'text',
          required: false,
          hint: 'Ligne vide = nouveau paragraphe. « - » en début de ligne = liste à puces. **gras**, [texte du lien](https://…).',
        },
      ],
    },
    { name: 'texte_apres', label: 'Texte sous les questions', widget: 'text', required: false, hint: 'Centré. [texte du lien](/contact).' },
  ],
};

import { useEffect, useState, type FormEvent } from 'react';
import { Bloc, Paragraphes, TitreBloc, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type FormulaireContactProps = {
  fond?: Fond;
  titre?: string;
  texte?: string;
  libelle_nom: string;
  libelle_courriel: string;
  libelle_sujet: string;
  libelle_message: string;
  texte_bouton: string;
  texte_envoi?: string;
  texte_succes: string;
  texte_erreur: string;
};

type Etat = 'saisie' | 'envoi' | 'envoye' | 'erreur';

/**
 * Formulaire de contact : envoyé à /api/contact, qui le transmet par Brevo (cf. src/lib/brevo.ts).
 * Hydraté côté client (Section.astro). Le sujet peut être prérempli par un lien `/contact?sujet=…`.
 */
export function FormulaireContact({
  fond = 'blanc',
  titre,
  texte,
  libelle_nom,
  libelle_courriel,
  libelle_sujet,
  libelle_message,
  texte_bouton,
  texte_envoi,
  texte_succes,
  texte_erreur,
}: FormulaireContactProps) {
  // Calculé ici : le contexte « fond foncé » n'est fourni qu'à l'intérieur du <Bloc>.
  const fonce = fond === 'vert' || fond === 'bleu' || fond === 'degrade';
  const [etat, setEtat] = useState<Etat>('saisie');
  const [sujet, setSujet] = useState('');

  useEffect(() => {
    const prerempli = new URLSearchParams(location.search).get('sujet');
    if (prerempli) setSujet(prerempli);
  }, []);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEtat('envoi');
    try {
      const rep = await fetch('/api/contact', { method: 'POST', body: new FormData(e.currentTarget) });
      setEtat(rep.ok ? 'envoye' : 'erreur');
    } catch {
      setEtat('erreur');
    }
  }

  const classeLibelle = `fieldset-legend text-s${fonce ? ' text-fond' : ''}`;
  const encart = 'max-w-texte bg-base-200 p-e4 text-noir';

  return (
    <Bloc fond={fond}>
      <TitreBloc titre={titre} />
      <Paragraphes texte={texte} className="mb-e4 max-w-texte" />
      {etat === 'envoye' ? (
        <div role="status" className={encart}>
          <Paragraphes texte={texte_succes} />
        </div>
      ) : (
        <form onSubmit={envoyer} className="flex max-w-texte flex-col gap-e2">
          <div className="grid gap-e2 sm:grid-cols-2">
            <fieldset className="fieldset">
              <label className={classeLibelle} htmlFor="contact-nom">{libelle_nom}</label>
              <input id="contact-nom" name="nom" className="input w-full" required maxLength={200} autoComplete="name" />
            </fieldset>
            <fieldset className="fieldset">
              <label className={classeLibelle} htmlFor="contact-courriel">{libelle_courriel}</label>
              <input id="contact-courriel" name="courriel" type="email" className="input w-full" required maxLength={200} autoComplete="email" />
            </fieldset>
          </div>
          <fieldset className="fieldset">
            <label className={classeLibelle} htmlFor="contact-sujet">{libelle_sujet}</label>
            <input id="contact-sujet" name="sujet" className="input w-full" maxLength={200} value={sujet} onChange={(e) => setSujet(e.target.value)} />
          </fieldset>
          <fieldset className="fieldset">
            <label className={classeLibelle} htmlFor="contact-message">{libelle_message}</label>
            <textarea id="contact-message" name="message" className="textarea h-48 w-full" required maxLength={10000} />
          </fieldset>
          {/* Pot de miel anti-robots : invisible pour les humains, ignoré s'il est vide. */}
          <input name="site_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          {etat === 'erreur' && (
            <div role="alert" className={encart}>
              <Paragraphes texte={texte_erreur} />
            </div>
          )}
          <div className="mt-e3">
            <button
              type="submit"
              disabled={etat === 'envoi'}
              className={fonce ? 'btn border-fond bg-fond text-noir hover:border-fond-2 hover:bg-fond-2' : 'btn btn-primary'}
            >
              {etat === 'envoi' ? texte_envoi || texte_bouton : texte_bouton}
            </button>
          </div>
        </form>
      )}
    </Bloc>
  );
}

export const formulaireContact: DefinitionBloc<FormulaireContactProps> = {
  name: 'formulaire_contact',
  label: 'Formulaire de contact',
  Component: FormulaireContact,
  fields: [
    champFond,
    { name: 'titre', label: 'Titre', widget: 'string', required: false },
    { name: 'texte', label: 'Texte', widget: 'text', required: false },
    { name: 'libelle_nom', label: 'Libellé du champ « nom »', widget: 'string' },
    { name: 'libelle_courriel', label: 'Libellé du champ « e-mail »', widget: 'string' },
    {
      name: 'libelle_sujet',
      label: 'Libellé du champ « sujet »',
      widget: 'string',
      hint: 'Le sujet peut être prérempli par un lien vers la page, ex. /contact?sujet=Demande de devis',
    },
    { name: 'libelle_message', label: 'Libellé du champ « message »', widget: 'string' },
    { name: 'texte_bouton', label: 'Texte du bouton', widget: 'string' },
    { name: 'texte_envoi', label: "Texte du bouton pendant l'envoi", widget: 'string', required: false },
    { name: 'texte_succes', label: 'Message une fois envoyé', widget: 'text' },
    { name: 'texte_erreur', label: "Message en cas d'erreur", widget: 'text' },
  ],
};

import { Check } from 'lucide-react';
import { Bloc, BoutonAction, Paragraphes, champFond, type Fond } from './_commun';
import type { DefinitionBloc } from './types';

export type OffreProps = {
  fond?: Fond;
  nom?: string;
  prix: string;
  sous_titre?: string;
  titre_liste?: string;
  elements?: { texte: string }[];
  bouton_texte?: string;
  bouton_lien?: string;
  mention?: string;
};

/** Offre mise en avant (forfait) : carte centrée, prix en grand, ce qui est compris, bouton d'action. */
export function Offre({ fond = 'gris', nom, prix, sous_titre, titre_liste, elements = [], bouton_texte, bouton_lien, mention }: OffreProps) {
  return (
    <Bloc fond={fond}>
      <div className="mx-auto max-w-[40rem] border-t-8 border-primary bg-fond p-e5 text-center text-noir sm:p-e6">
        {nom && <p className="text-s font-bold tracking-widest text-vert-fonce uppercase">{nom}</p>}
        <p className="mt-e2 font-titre text-xxl leading-none font-semibold">{prix}</p>
        {sous_titre && <p className="mx-auto mt-e3 max-w-texte text-l text-gris">{sous_titre}</p>}
        {elements.length > 0 && (
          <>
            <div className="divider my-e5" />
            {titre_liste && <h2 className="mb-e4 text-l">{titre_liste}</h2>}
            <ul className="mx-auto flex max-w-[30rem] flex-col gap-e3 text-left">
              {elements.map((e, i) => (
                <li key={i} className="flex items-start gap-e3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center bg-primary text-primary-content">
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>{e.texte}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {bouton_texte && bouton_lien && (
          <div className="mt-e5">
            <BoutonAction texte={bouton_texte} lien={bouton_lien} />
          </div>
        )}
        <Paragraphes texte={mention} className="mt-e3 text-s text-gris" />
      </div>
    </Bloc>
  );
}

export const offre: DefinitionBloc<OffreProps> = {
  name: 'offre',
  label: 'Offre (forfait mis en avant)',
  Component: Offre,
  fields: [
    { ...champFond, default: 'gris' },
    { name: 'nom', label: "Nom de l'offre", widget: 'string', required: false, hint: 'Ex. « Forfait de base ».' },
    { name: 'prix', label: 'Prix', widget: 'string', hint: 'Ex. « 9 000 € ».' },
    { name: 'sous_titre', label: 'Sous-titre', widget: 'string', required: false },
    { name: 'titre_liste', label: 'Titre de la liste', widget: 'string', required: false, hint: 'Ex. « Ce que comprend le forfait ».' },
    {
      name: 'elements',
      label: 'Ce qui est compris',
      widget: 'list',
      required: false,
      summary: '{{texte}}',
      fields: [{ name: 'texte', label: 'Texte', widget: 'string' }],
    },
    { name: 'bouton_texte', label: 'Texte du bouton', widget: 'string', required: false },
    { name: 'bouton_lien', label: 'Lien du bouton', widget: 'string', required: false },
    { name: 'mention', label: 'Mention sous le bouton', widget: 'text', required: false },
  ],
};

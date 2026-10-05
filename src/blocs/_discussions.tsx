import { MessageCircle } from 'lucide-react';
import { Bloc, BoutonAction, TitreBloc } from './_commun';
import type { Sujet } from '../lib/types';

const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

type Props = {
  sujets: Sujet[];
  /** Catégorie du forum et éditeur de nouveau sujet dans cette catégorie. */
  lien_categorie?: string;
  lien_nouveau_sujet?: string;
};

/**
 * Derniers sujets de la catégorie du forum d'une application, sous sa page.
 * Bouton « Lancer une conversation » au niveau du titre, comme les boutons du bloc Actualités.
 */
export function Discussions({ sujets, lien_categorie, lien_nouveau_sujet }: Props) {
  return (
    <Bloc fond="gris">
      <div className="mb-e4 flex flex-wrap items-center justify-between gap-x-e4 gap-y-e3">
        <TitreBloc titre="Discussions sur le forum" className="mb-0!" />
        <BoutonAction texte="Lancer une conversation" lien={lien_nouveau_sujet} />
      </div>
      {sujets.length === 0 ? (
        <p>Aucune discussion pour le moment. Lancez la première !</p>
      ) : (
        <ul className="list bg-base-100">
          {sujets.map((s) => (
            <li key={s.lien} className="list-row items-center">
              {s.avatar ? <img src={s.avatar} alt="" loading="lazy" className="size-10 rounded-full" /> : <span className="size-10" />}
              <div className="min-w-0">
                <a href={s.lien} className="link-hover font-semibold">
                  {s.titre}
                </a>
                <p className="text-xs text-gris">
                  {s.auteur && <>{s.auteur} · </>}
                  <time dateTime={s.date}>{fmtDate.format(new Date(s.date))}</time>
                </p>
              </div>
              <span className="flex items-center gap-e1 text-gris" title="Réponses">
                <MessageCircle size={18} aria-hidden="true" />
                {s.nb_reponses}
                <span className="sr-only">réponses</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {lien_categorie && sujets.length > 0 && (
        <a href={lien_categorie} className="link mt-e4 inline-block font-semibold text-vert-fonce">
          Toutes les discussions
        </a>
      )}
    </Bloc>
  );
}

import { Heart, MessageCircle } from 'lucide-react';
import { Bloc, BoutonAction } from './_commun';
import { Image } from './_image';
import { Bandeau } from './Bandeau';
import { lienArticle } from './Actualites';
import type { Article, Auteur } from '../lib/types';
import type { ReglagesActualites } from '../lib/contenu';

const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

type Props = {
  article: Article;
  auteur?: Auteur;
  autres: Article[];
  reglages: ReglagesActualites;
};

/** Encart de la colonne de droite : même titre (petites capitales vertes) pour tous. */
function Encart({ titre, children, className = '' }: { titre?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-base-200 p-e4 ${className}`.trim()}>
      {titre && <h2 className="mb-e3 font-texte text-xs font-bold tracking-widest text-vert-fonce uppercase">{titre}</h2>}
      {children}
    </section>
  );
}

/** Nombre de réponses et de « j'aime » sur le forum, et bouton pour réagir. */
function Reagir({ article, r }: Pick<Props, 'article'> & { r: ReglagesActualites }) {
  return (
    <>
      <p className="mb-e3 flex gap-e4 text-gris">
        <span className="flex items-center gap-e1" title={r.texte_reponses}>
          <MessageCircle size={18} aria-hidden="true" />
          {article.nb_reponses ?? 0}
          {r.texte_reponses && <span className="sr-only">{r.texte_reponses}</span>}
        </span>
        <span className="flex items-center gap-e1" title={r.texte_likes}>
          <Heart size={18} aria-hidden="true" />
          {article.nb_likes ?? 0}
          {r.texte_likes && <span className="sr-only">{r.texte_likes}</span>}
        </span>
      </p>
      <BoutonAction texte={r.texte_lien_forum} lien={article.lien_forum} />
    </>
  );
}

function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Page d'un article du forum : en-tête comme les autres pages, texte du forum à gauche ;
 * à droite (sous l'article sur mobile) l'auteur·ice, l'invitation à réagir sur le forum et les autres articles.
 */
export function FicheArticle({ article, auteur, autres, reglages: r }: Props) {
  const photo = auteur?.photo ?? article.avatar;
  const nom = auteur?.nom ?? article.auteur;
  return (
    <>
      <Bandeau
        surtitre={r.titre_liste}
        lien_surtitre={r.lien_liste}
        titre={article.titre}
        texte={fmtDate.format(new Date(article.date))}
        enchaine
      />
      <Bloc>
        <div className="grid items-start gap-e5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-e6">
          <div>
            <article className="article" dangerouslySetInnerHTML={{ __html: article.contenu ?? '' }} />
            <footer className="mt-e5 border-t border-trait pt-e4">
              <Reagir article={article} r={r} />
            </footer>
          </div>
          <aside className="flex flex-col gap-e4">
            {nom && (
              <Encart titre={r.titre_auteur}>
                <div className="flex items-center gap-e3">
                  {photo ? (
                    <Image src={photo} sizes="4rem" alt="" loading="lazy" className="size-16 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span
                      className="grid size-16 shrink-0 place-items-center rounded-full bg-secondary font-titre text-l text-secondary-content"
                      aria-hidden="true"
                    >
                      {initiales(nom)}
                    </span>
                  )}
                  <div>
                    <strong className="block font-semibold">{nom}</strong>
                    {auteur?.lien_forum && r.texte_profil_forum && (
                      <a href={auteur.lien_forum} className="link text-s font-semibold text-vert-fonce">
                        {r.texte_profil_forum}
                      </a>
                    )}
                  </div>
                </div>
                {/* Rôles dans l'équipe : sous la photo, ils peuvent être nombreux. */}
                {auteur?.roles?.length ? <p className="mt-e3 text-s text-gris">{auteur.roles.join(' · ')}</p> : null}
              </Encart>
            )}

            {/* Sur mobile, la colonne passe sous l'article, qui se termine déjà par ces infos. */}
            <Encart titre={r.titre_reagir} className="hidden lg:block">
              <Reagir article={article} r={r} />
            </Encart>

            {autres.length > 0 && (
              <Encart titre={r.titre_autres}>
                <ul className="flex flex-col gap-e3">
                  {autres.map((a) => (
                    <li key={a.slug}>
                      <a href={lienArticle(a)} className="group flex items-start gap-e3">
                        {a.image && <Image src={a.image} sizes="4rem" alt="" loading="lazy" className="aspect-square w-16 shrink-0 object-cover" />}
                        <span>
                          <span className="block font-semibold leading-snug group-hover:underline">{a.titre}</span>
                          <time dateTime={a.date} className="text-xs text-gris">
                            {fmtDate.format(new Date(a.date))}
                          </time>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                {r.texte_tous && r.lien_liste && (
                  <a href={r.lien_liste} className="link mt-e3 inline-block font-semibold text-vert-fonce">
                    {r.texte_tous}
                  </a>
                )}
              </Encart>
            )}
          </aside>
        </div>
      </Bloc>
    </>
  );
}

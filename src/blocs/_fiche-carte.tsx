import type { ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { marked } from 'marked';
import { Bloc, Paragraphes, Surtitre } from './_commun';
import { CarteRetournable } from './_carte';
import { COMPLEXITES, MATURITES, lienCarte, nomType, type Carte, type ReglagesCartes, type TypeCarte } from '../lib/cartes';

type Props = { carte: Carte; types: TypeCarte[]; cartes: Carte[]; reglages: ReglagesCartes; site: string };

/** Contenu Markdown (contenus complémentaires, sources) : saisi dans le CMS par l'équipe. */
const Markdown = ({ texte }: { texte: string }) => (
  <div className="markdown texte" dangerouslySetInnerHTML={{ __html: marked.parse(texte, { async: false }) }} />
);

const fmtDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' });

/** Position GeoJSON (widget map de Sveltia) → [longitude, latitude]. */
function coordonnees(position?: string): [number, number] | undefined {
  try {
    const g = position ? JSON.parse(position) : undefined;
    const c = g?.type === 'Point' ? g.coordinates : g?.geometry?.coordinates;
    return Array.isArray(c) && c.length >= 2 ? [Number(c[0]), Number(c[1])] : undefined;
  } catch {
    return undefined;
  }
}

/** Fiche d'une carte QR : informations à gauche, carte retournable à droite (comme la fiche Bazar). */
export function FicheCarte({ carte: c, types, cartes, reglages: r, site }: Props) {
  const l = r.libelles ?? {};
  const liees = (c.cartes_liees ?? []).map((s) => cartes.find((x) => x.slug === s)).filter((x): x is Carte => !!x);
  const coord = coordonnees(c.position);
  const dates = [c.date_debut, c.date_fin].filter(Boolean).map((d) => fmtDate.format(new Date(d!)));

  const rubriques: [string | undefined, ReactNode][] = [
    [l.accroche, c.accroche && <p>{c.accroche}</p>],
    [l.essentiel, c.essentiel && <Paragraphes texte={c.essentiel} />],
    [l.description, c.description && <Markdown texte={c.description} />],
    [
      l.mots_cles,
      c.mots_cles?.length ? (
        <div className="flex flex-wrap gap-e2">
          {c.mots_cles.map((m) => (
            <span key={m} className="badge">
              {m}
            </span>
          ))}
        </div>
      ) : null,
    ],
    [
      l.cartes_liees,
      liees.length ? (
        <ul className="list-disc pl-e4">
          {liees.map((x) => (
            <li key={x.slug}>
              <a className="link font-semibold text-vert-fonce" href={lienCarte(x)}>
                {x.titre}
              </a>
            </li>
          ))}
        </ul>
      ) : null,
    ],
    [
      l.adresse,
      (c.adresse || coord) && (
        <div className="texte">
          {c.adresse && <p>{c.adresse}</p>}
          {coord && (
            <iframe
              title={c.adresse ?? c.titre}
              className="aspect-video w-full max-w-texte border border-base-300"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coord[0] - 0.01},${coord[1] - 0.006},${coord[0] + 0.01},${coord[1] + 0.006}&marker=${coord[1]},${coord[0]}`}
            />
          )}
        </div>
      ),
    ],
    [l.dates, dates.length ? <p>{dates.join(' → ')}</p> : null],
    [l.contributeurices, c.contributeurices && <Paragraphes texte={c.contributeurices} />],
    [l.ressources, c.ressources && <Markdown texte={c.ressources} />],
    [l.complexite, c.complexite && c.complexite !== 'aucune' && <p>{COMPLEXITES[c.complexite]}</p>],
    [l.maturite, c.maturite && <p>{MATURITES[c.maturite]}</p>],
    [l.licence, c.licence && <p>{c.licence}</p>],
  ];

  return (
    <Bloc>
      <div className="grid items-start gap-e5 lg:grid-cols-[1fr_auto]">
        <div>
          <Surtitre texte={nomType(c, types) ?? r.titre_liste} lien={r.lien_liste} />
          <h1 className="mb-e5 text-xxl">{c.titre}</h1>
          <dl className="flex flex-col gap-e4">
            {rubriques
              .filter(([, contenu]) => contenu)
              .map(([libelle, contenu], i) => (
                <div key={i}>
                  {libelle && <dt className="mb-e1 font-titre text-l font-semibold text-vert-fonce">{libelle}</dt>}
                  <dd className="max-w-texte">{contenu}</dd>
                </div>
              ))}
          </dl>
        </div>
        <div className="flex flex-col items-center gap-e3 justify-self-center">
          <CarteRetournable carte={c} types={types} site={site} />
          {r.texte_imprimer && (
            <a className="btn btn-sm" href={`/cartes/impression?carte=${c.slug}`}>
              <Printer size={16} aria-hidden="true" />
              {r.texte_imprimer}
            </a>
          )}
        </div>
      </div>
    </Bloc>
  );
}

import { Paragraphes } from './_commun';
import { COMPLEXITES, couleurCarte, lienCarte, nomType, urlQr, type Carte, type TypeCarte } from '../lib/cartes';
import { qrcodeSvg } from '../lib/qrcode';

/** Logo par défaut (visuel manquant, pied de carte) et logo de licence, repris des QrCards de YesWiki. */
const LOGO = '/images/cartes/logo-qr-cartes.svg';
const LOGO_CC_BY_SA = '/images/cartes/cc-by-sa.svg';

/** Taille du titre selon sa longueur (la zone de titre a une hauteur fixe). */
const classeTitre = (titre: string) => (titre.length > 40 ? 'titre-xxl' : titre.length > 26 ? 'titre-xl' : '');

type Props = { carte: Carte; types: TypeCarte[]; site: string };

function Entete({ carte, types }: Omit<Props, 'site'>) {
  const complexite = carte.complexite && carte.complexite !== 'aucune' ? COMPLEXITES[carte.complexite] : undefined;
  return (
    <div className="carte-qr-entete">
      <span>{complexite}</span>
      <span>{nomType(carte, types)}</span>
    </div>
  );
}

export function Recto({ carte, types }: Omit<Props, 'site'>) {
  return (
    <div className="carte-qr recto" style={{ backgroundColor: couleurCarte(carte, types) }}>
      <Entete carte={carte} types={types} />
      <h2 className={`carte-qr-titre ${classeTitre(carte.titre)}`}>{carte.titre}</h2>
      <div className="carte-qr-visuel">
        <img src={carte.visuel || LOGO} alt="" loading="lazy" />
      </div>
      <div className="carte-qr-accroche">{carte.accroche}</div>
      <div className="carte-qr-pied">
        <img className="carte-qr-logo" src={LOGO} alt="" />
        {[0, 1, 2].map((i) => {
          const p = carte.pictos?.[i];
          return (
            <div key={i} className="carte-qr-picto">
              {p?.image && <img src={p.image} alt="" />}
              <span>{p?.texte}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Verso({ carte, types, site, sansLien }: Props & { sansLien?: boolean }) {
  const qr = urlQr(carte, site);
  const lien = new URL(lienCarte(carte), site);
  return (
    <div className="carte-qr verso" style={{ backgroundColor: couleurCarte(carte, types) }}>
      <Entete carte={carte} types={types} />
      <h2 className={`carte-qr-titre ${classeTitre(carte.titre)}`}>{carte.titre}</h2>
      <div className="carte-qr-essentiel">
        <Paragraphes texte={carte.essentiel} />
      </div>
      <div className="carte-qr-pied">
        <img className="carte-qr-logo" src={LOGO} alt="" />
        <div className="carte-qr-lien">
          {/* Pas de lien imbriqué quand toute la carte est déjà un lien (liste des cartes). */}
          {sansLien ? <span>{`${lien.host}${lien.pathname}`}</span> : <a href={lien.href}>{`${lien.host}${lien.pathname}`}</a>}
          {(!carte.licence || carte.licence === 'CC-BY-SA') && <img src={LOGO_CC_BY_SA} alt={carte.licence ?? 'CC-BY-SA'} />}
          {carte.licence && carte.licence !== 'CC-BY-SA' && <span>{carte.licence}</span>}
        </div>
        <div className="carte-qr-code" role="img" aria-label={qr} dangerouslySetInnerHTML={{ __html: qrcodeSvg(qr) }} />
      </div>
    </div>
  );
}

/** Carte retournable : le verso apparaît au survol (ou au focus). Avec `lien`, toute la carte est un lien. */
export function CarteRetournable({ lien, ...props }: Props & { lien?: string }) {
  const faces = (
    <div className="carte-qr-faces">
      <Recto carte={props.carte} types={props.types} />
      <Verso {...props} sansLien={!!lien} />
    </div>
  );
  return lien ? (
    <a className="carte-qr-retournable block" href={lien}>
      {faces}
    </a>
  ) : (
    <div className="carte-qr-retournable" tabIndex={0}>
      {faces}
    </div>
  );
}

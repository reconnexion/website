import { Building2, Globe, User } from "lucide-react";
import { Bloc, TitreBloc } from "./_commun";
import type { DefinitionBloc } from "./types";
import type { Societaire } from "../lib/types";
import { societairesDemo } from "../lib/demo";

export type SocietairesProps = {
  titre?: string;
  /** Réglages éditables : document et table Grist. */
  document?: string;
  table?: string;
  table_organisations?: string;
  texte_tous?: string;
  texte_vide?: string;
  /** Injecté au rendu depuis Grist — pas édité dans le CMS. */
  societaires?: Societaire[];
  colleges?: string[];
};

/**
 * Liste des sociétaires avec un filtre par collège en haut.
 * Filtre sans JavaScript : des boutons radio (« Tous » coché au chargement) et des règles CSS
 * `:has()` dans theme.css (`filtre-colleges`) qui masquent les sociétaires des autres collèges.
 */
export function Societaires({
  titre,
  texte_tous,
  texte_vide,
  societaires = [],
  colleges = [],
}: SocietairesProps) {
  const compte = (c: string) =>
    societaires.filter((s) => s.colleges.includes(c)).length;
  return (
    <Bloc>
      <TitreBloc titre={titre} />
      {societaires.length === 0 ? (
        texte_vide && <p className="text-gris">{texte_vide}</p>
      ) : (
        <div className="filtre-colleges">
          {colleges.length > 0 && (
            <form className="mb-e4 flex flex-wrap gap-e2">
              <input
                className="btn btn-sm checked:btn-primary"
                type="radio"
                name="college"
                value=""
                aria-label={
                  texte_tous ? `${texte_tous} (${societaires.length})` : "×"
                }
                defaultChecked
              />
              {colleges.map((c, i) => (
                <input
                  key={c}
                  className="btn btn-sm checked:btn-primary"
                  type="radio"
                  name="college"
                  value={i}
                  aria-label={`${c} (${compte(c)})`}
                />
              ))}
            </form>
          )}
          <ul className="grid grid-cols-2 gap-e3 sm:grid-cols-3 lg:grid-cols-4">
            {societaires.map((s, i) => (
              <li
                key={i}
                data-colleges={s.colleges
                  .map((c) => colleges.indexOf(c))
                  .join(" ")}
                className="flex items-start gap-e3 bg-base-200 p-e3"
              >
                {/* Photo (personne) ou logo (organisation) ; à défaut, silhouette ou bâtiment. */}
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt=""
                    loading="lazy"
                    className={`size-12 shrink-0 ${s.organisation ? "bg-fond object-contain p-e1" : "object-cover"}`}
                  />
                ) : (
                  <div
                    className="grid size-12 shrink-0 place-items-center bg-base-300 text-gris"
                    aria-hidden="true"
                  >
                    {s.organisation ? (
                      <Building2 size={24} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <strong className="block font-semibold">{s.nom}</strong>
                  {s.colleges.length > 0 && (
                    <span className="text-s text-gris">
                      {s.colleges.join(", ")}
                    </span>
                  )}
                  {(s.lien || s.linkedin) && (
                    <span className="mt-e2 flex items-center gap-e3">
                      {s.lien && (
                        <a
                          href={s.lien}
                          className="text-vert-fonce hover:opacity-80"
                          target="_blank"
                          rel="noopener"
                          aria-label="Site web"
                          title="Site web"
                        >
                          <Globe size={20} aria-hidden="true" />
                        </a>
                      )}
                      {s.linkedin && (
                        <a
                          href={s.linkedin}
                          className="hover:opacity-80"
                          target="_blank"
                          rel="noopener"
                          title="LinkedIn"
                        >
                          {/* Logo officiel (fichier SVG : ses couleurs ne sont pas celles du site). */}
                          <img
                            src="/images/icones/linkedin.svg"
                            alt="LinkedIn"
                            className="size-5"
                          />
                        </a>
                      )}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bloc>
  );
}

export const societaires: DefinitionBloc<SocietairesProps> = {
  name: "societaires",
  label: "Sociétaires (depuis Grist)",
  Component: Societaires,
  source: "grist",
  donneesExemple: () => societairesDemo,
  fields: [
    { name: "titre", label: "Titre", widget: "string", required: false },
    {
      name: "document",
      label: "Document Grist (identifiant)",
      widget: "string",
      required: false,
      hint: "Identifiant du document qui contient la table (celui de l’URL Grist). Vide : document par défaut du site.",
    },
    {
      name: "table",
      label: "Table Grist",
      widget: "string",
      default: "Contacts",
      hint: "Personnes. Seules les lignes avec la case « Sociétaire » cochée sont publiées (prénom, nom, collège, site web, LinkedIn et photo — colonne « Image » — uniquement).",
    },
    {
      name: "table_organisations",
      label: "Table Grist des organisations",
      widget: "string",
      required: false,
      default: "Organisations",
      hint: "Organisations sociétaires (nom, collège, site web et logo), dans le même document. Vide : pas d’organisations.",
    },
    {
      name: "texte_tous",
      label: "Texte du bouton « tous les collèges »",
      widget: "string",
      required: false,
    },
    {
      name: "texte_vide",
      label: "Texte si aucun sociétaire",
      widget: "string",
      required: false,
    },
  ],
};

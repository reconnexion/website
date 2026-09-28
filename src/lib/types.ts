/** Données venant de sources externes (Grist, CalDAV). */

export type Personne = {
  nom: string;
  role?: string;
  photo?: string;
  lien?: string;
};

/** Organisation affichée par son logo (partenaires, réseaux). */
export type Logo = {
  nom: string;
  logo?: string;
  lien?: string;
};

export type Societaire = {
  nom: string;
  colleges: string[];
  /** Organisation sociétaire (plutôt qu'une personne). */
  organisation?: boolean;
  /** Site web (organisations). */
  lien?: string;
};

export type Role = {
  titre: string;
  raison_d_etre?: string;
  referent?: string;
  referent_photo?: string;
};

export type Evenement = {
  titre: string;
  debut: string; // ISO 8601
  fin?: string;
  lieu?: string;
  description?: string;
};

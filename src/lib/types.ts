/** Données venant de sources externes (Grist, CalDAV). */

export type Personne = {
  nom: string;
  role?: string;
  photo?: string;
  lien?: string;
};

export type Evenement = {
  titre: string;
  debut: string; // ISO 8601
  fin?: string;
  lieu?: string;
  description?: string;
};

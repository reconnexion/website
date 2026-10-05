/** Données venant de sources externes (Grist, forum Discourse). */

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
  /** Site web. */
  lien?: string;
  linkedin?: string;
  /** Photo (personnes) ou logo (organisations), servi par /api/grist/image/…. */
  photo?: string;
};

export type Role = {
  titre: string;
  raison_d_etre?: string;
  referent?: string;
  referent_photo?: string;
  /** Liste à puces (lignes « - … »), cf. Paragraphes. */
  redevabilites?: string;
  membres?: { nom: string; photo?: string }[];
};


/** Article d'actualité (sujet du forum Discourse). */
export type Article = {
  slug: string;
  titre: string;
  date: string; // ISO 8601
  auteur?: string;
  /** Pseudo de l'auteur·ice sur le forum (relié à la colonne Pseudo_Discourse de Grist). */
  pseudo?: string;
  /** Avatar sur le forum (si la personne n'a pas de photo dans Grist). */
  avatar?: string;
  /** Réponses et « j'aime » du sujet sur le forum. */
  nb_reponses?: number;
  nb_likes?: number;
  /** Première image du message. */
  image?: string;
  /** Chapô ou début du texte, en texte brut. */
  resume?: string;
  lien_forum: string;
  /** HTML du message, nettoyé (absent dans les listes). */
  contenu?: string;
};

/** Auteur·ice d'un article : fiche de l'équipe (Grist), sinon profil du forum. */
export type Auteur = {
  nom: string;
  photo?: string;
  /** Rôles dont la personne est référente (table Projects). */
  roles?: string[];
  lien_forum?: string;
};

/** Sujet de discussion du forum (catégorie d'une application). */
export type Sujet = {
  titre: string;
  lien: string;
  /** Dernière activité (ISO 8601). */
  date: string;
  nb_reponses: number;
  auteur?: string;
  avatar?: string;
};

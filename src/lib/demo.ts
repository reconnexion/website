/**
 * Données de démonstration, utilisées quand Grist / CalDAV ne sont pas configurés
 * (variables d'environnement absentes) et dans l'aperçu du CMS.
 */
import type { Article, Evenement, Logo, Personne, Role, Societaire } from './types';

export const organisationsDemo: Logo[] = [
  { nom: 'Organisation partenaire', lien: 'https://exemple.org' },
  { nom: 'Autre partenaire' },
];

export const societairesDemo: { societaires: Societaire[]; colleges: string[] } = {
  colleges: ['Soutiens financiers', 'Equipe opérationnelle', "Co-créateurs d'applications"],
  societaires: [
    { nom: 'Camille Martin', colleges: ['Equipe opérationnelle'] },
    { nom: 'Yanis Benali', colleges: ["Co-créateurs d'applications"] },
    { nom: 'Louise Garnier', colleges: ['Soutiens financiers'] },
    { nom: 'Théo Rousseau', colleges: ['Soutiens financiers'] },
  ],
};

export const personnesDemo: Personne[] = [
  { nom: 'Camille Martin', role: 'Coordination' },
  { nom: 'Yanis Benali', role: 'Développement' },
  { nom: 'Louise Garnier', role: 'Animation des rencontres' },
  { nom: 'Théo Rousseau', role: 'Communication' },
];

export const rolesDemo: Role[] = [
  {
    titre: 'Coordination',
    raison_d_etre: 'Une équipe qui avance dans la même direction',
    referent: 'Camille Martin',
    redevabilites: '- Animer les réunions du cercle\n- Suivre les décisions prises',
    membres: [{ nom: 'Yanis Benali' }, { nom: 'Louise Garnier' }],
  },
  { titre: 'Outils numériques', referent: 'Yanis Benali' },
  { titre: 'Vie coopérative', referent: 'Louise Garnier' },
  { titre: 'Rayonnement', referent: 'Théo Rousseau' },
];

/** Événements relatifs à « maintenant », pour que la démo ait toujours des dates futures. */
export function evenementsDemo(): Evenement[] {
  const jour = 24 * 3600 * 1000;
  const base = new Date();
  base.setUTCHours(18, 0, 0, 0);
  const t = base.getTime();
  return [
    { titre: 'Visio mensuelle ouverte', debut: new Date(t + 3 * jour).toISOString(), lieu: 'En ligne', description: 'Présentation du projet et questions-réponses.' },
    { titre: 'Atelier « Bienvenue chez moi »', debut: new Date(t + 9 * jour).toISOString(), lieu: 'En ligne' },
    { titre: 'Point technique ActivityPods', debut: new Date(t + 16 * jour).toISOString(), lieu: 'En ligne' },
    { titre: 'Hackathon des Applications Citoyennes', debut: new Date(t + 30 * jour).toISOString(), lieu: 'Lyon' },
  ];
}

export const articlesDemo: Article[] = [
  {
    slug: 'recit-de-la-residence',
    titre: 'Le récit de la résidence',
    date: '2026-07-10T13:00:00Z',
    auteur: 'Camille Martin',
    resume: 'Une semaine pour travailler sur la coopérative, puis pour accueillir l’écosystème du Réseau Social Universel.',
    lien_forum: 'https://forum.reconnexion.coop',
  },
  {
    slug: 'retours-sur-une-rencontre',
    titre: 'Retours sur une rencontre',
    date: '2026-06-20T09:00:00Z',
    auteur: 'Yanis Benali',
    resume: 'Trois jours d’échanges autour de la convergence du numérique éthique.',
    lien_forum: 'https://forum.reconnexion.coop',
  },
  {
    slug: 'nouvelle-application',
    titre: 'Une nouvelle application',
    date: '2026-05-02T09:00:00Z',
    auteur: 'Louise Garnier',
    resume: 'Présentation de la dernière application rejoignant le Réseau Social Universel.',
    lien_forum: 'https://forum.reconnexion.coop',
  },
];

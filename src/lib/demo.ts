/**
 * Données de démonstration, utilisées quand Grist / CalDAV ne sont pas configurés
 * (variables d'environnement absentes) et dans l'aperçu du CMS.
 */
import type { Evenement, Logo, Personne, Role, Societaire } from './types';

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
  { titre: 'Coordination', raison_d_etre: 'Une équipe qui avance dans la même direction', referent: 'Camille Martin' },
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

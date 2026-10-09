import type { APIRoute } from 'astro';
import { tousLesLiensVisio } from '../../lib/contenu';
import { LIEN_VISIO_PAR_DEFAUT } from '../../lib/evenements';

// Redirection /visio/<slug> → salle de visio (collection « Liens de visio », lue au build) ;
// /visio seul → salle par défaut (celle des événements en ligne).
// Rendue côté serveur pour renvoyer une vraie redirection HTTP plutôt qu'une page à meta refresh.
export const prerender = false;

const liens = new Map(tousLesLiensVisio().map((v) => [v.slug, v.lien]));

export const GET: APIRoute = ({ params, redirect }) => {
  const lien = params.slug ? liens.get(params.slug) : LIEN_VISIO_PAR_DEFAUT;
  // Réponse 404 vide : l'adaptateur la remplace par la page 404 du site.
  return lien ? redirect(lien, 302) : new Response(null, { status: 404 });
};

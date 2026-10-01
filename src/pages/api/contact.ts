import type { APIRoute } from 'astro';
import { envoyerMessageContact } from '../../lib/brevo';

// Endpoint rendu à la demande : reçoit le formulaire de contact et l'envoie par Brevo.
// La clé Brevo et l'adresse du destinataire restent sur le serveur.
export const prerender = false;

const RE_COURRIEL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texte = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const reponse = (status: number) => new Response(null, { status });

export const POST: APIRoute = async ({ request }) => {
  let donnees: FormData;
  try {
    donnees = await request.formData();
  } catch {
    return reponse(400);
  }
  // Pot de miel : champ caché que seuls les robots remplissent. On fait comme si tout allait bien.
  if (texte(donnees.get('site_web'), 200)) return reponse(204);

  const nom = texte(donnees.get('nom'), 200).replace(/[\r\n]+/g, ' ');
  const courriel = texte(donnees.get('courriel'), 200);
  const sujet = texte(donnees.get('sujet'), 200).replace(/[\r\n]+/g, ' ');
  const message = texte(donnees.get('message'), 10_000);
  if (!nom || !RE_COURRIEL.test(courriel) || !message) return reponse(400);

  try {
    await envoyerMessageContact({ nom, courriel, sujet: sujet || `Message de ${nom}`, message });
    return reponse(204);
  } catch (e) {
    console.error('Formulaire de contact :', e);
    return reponse(502);
  }
};

/**
 * Envoi des messages du formulaire de contact via l'API transactionnelle Brevo — côté serveur uniquement.
 *
 * Variables d'environnement :
 *   BREVO_API_KEY        clé d'API Brevo (SMTP & API → Clés API)
 *   CONTACT_DESTINATAIRE adresse qui reçoit les messages (défaut : contact@reconnexion.coop)
 *   CONTACT_EXPEDITEUR   expéditeur des courriels, à valider dans Brevo (défaut : le destinataire)
 *
 * Le visiteur est mis en « Répondre à » : on lui répond directement depuis sa messagerie.
 */

export type MessageContact = {
  nom: string;
  courriel: string;
  sujet: string;
  message: string;
};

const DESTINATAIRE = process.env.CONTACT_DESTINATAIRE || 'contact@reconnexion.coop';
const EXPEDITEUR = process.env.CONTACT_EXPEDITEUR || DESTINATAIRE;

export async function envoyerMessageContact({ nom, courriel, sujet, message }: MessageContact) {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) throw new Error('BREVO_API_KEY manquante');
  const rep = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: EXPEDITEUR, name: `${nom} (site Reconnexion)` },
      to: [{ email: DESTINATAIRE }],
      replyTo: { email: courriel, name: nom },
      subject: sujet,
      textContent: `${message}\n\n--\n${nom} <${courriel}>\nMessage envoyé depuis le formulaire de contact du site.`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!rep.ok) throw new Error(`Brevo ${rep.status} : ${await rep.text()}`);
}

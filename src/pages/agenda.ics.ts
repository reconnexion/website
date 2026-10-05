import type { APIRoute } from 'astro';
import { calendrierIcs } from '../lib/ics';
import { reglagesSite, tousLesEvenements } from '../lib/contenu';

// Flux iCalendar de l'agenda (abonnement depuis Google Agenda, Apple Calendrier…).
// Généré au build : les événements viennent de la collection « Événements ».
export const GET: APIRoute = ({ site }) =>
  new Response(calendrierIcs(tousLesEvenements(), { nom: `Agenda ${reglagesSite().nom}`, site: site!.href }), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });

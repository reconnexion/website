import type { APIRoute } from 'astro';
import { calendrierIcs } from '../lib/ics';
import { reglagesSite, tousLesEvenements } from '../lib/contenu';

// Flux iCalendar limité aux événements ouverts à tous (le flux complet est /agenda.ics).
export const GET: APIRoute = ({ site }) =>
  new Response(
    calendrierIcs(
      tousLesEvenements().filter((f) => f.ouvert_a_tous),
      { nom: `Agenda ${reglagesSite().nom} (ouvert à tous)`, site: site!.href },
    ),
    { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } },
  );

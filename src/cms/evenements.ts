/** Collection Sveltia « Événements » : l'agenda du site (bloc Agenda, flux /agenda.ics). */
import { FORMATS, LIEN_VISIO_PAR_DEFAUT, RECURRENCES } from '../lib/evenements';

const options = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

/** Dates saisies en heure de Paris, sans fuseau (cf. lib/evenements.ts). */
const dateHeure = { widget: 'datetime', format: 'YYYY-MM-DDTHH:mm' };
const dateSeule = { widget: 'datetime', format: 'YYYY-MM-DD', time_format: false };

export const collectionEvenements = {
  name: 'evenements',
  label: 'Événements',
  label_singular: 'Événement',
  folder: 'src/content/evenements',
  extension: 'yml',
  format: 'yml',
  create: true,
  slug: '{{slug}}',
  identifier_field: 'titre',
  summary: '{{titre}} — {{debut}}',
  sortable_fields: ['debut', 'titre'],
  fields: [
    { name: 'titre', label: 'Titre', widget: 'string' },
    {
      name: 'slug',
      label: 'Identifiant',
      widget: 'string',
      hint: 'Minuscules et tirets, unique (ex. « reunion-de-triage »). Ne pas le changer ensuite : les agendas abonnés s’en servent pour reconnaître l’événement.',
      pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
    },
    { name: 'description', label: 'Description', widget: 'text', required: false, hint: 'Ligne vide = nouveau paragraphe. **gras**, [texte du lien](https://…).' },
    { name: 'image', label: 'Image', widget: 'image', required: false },
    { name: 'debut', label: 'Début', ...dateHeure, hint: 'Heure de Paris. Pour un événement récurrent : la première occurrence.' },
    { name: 'fin', label: 'Fin', ...dateHeure, required: false, hint: 'Peut être un autre jour (événement sur plusieurs jours).' },
    { name: 'journee_entiere', label: 'Journée(s) entière(s)', widget: 'boolean', default: false, required: false, hint: 'Les heures ne sont pas affichées.' },
    { name: 'format', label: 'Format', widget: 'select', options: options(FORMATS), default: 'en_ligne' },
    {
      name: 'lien_visio',
      label: 'Lien de visio',
      widget: 'string',
      required: false,
      default: LIEN_VISIO_PAR_DEFAUT,
      hint: `Événements en ligne. Vide : ${LIEN_VISIO_PAR_DEFAUT}`,
    },
    { name: 'adresse', label: 'Adresse', widget: 'string', required: false, hint: 'Événements en présentiel (un lien vers la carte est ajouté).' },
    {
      name: 'recurrence',
      label: 'Récurrence',
      widget: 'select',
      options: options(RECURRENCES),
      default: 'aucune',
      hint: 'Calculée à partir de la date de début (ex. début un 3e vendredi → « le 3e vendredi de chaque mois » ; un 5e vendredi → « le dernier vendredi »).',
    },
    { name: 'fin_recurrence', label: 'Dernier jour de la récurrence', ...dateSeule, required: false, hint: 'Vide : sans fin.' },
    {
      name: 'dates_annulees',
      label: 'Dates annulées',
      widget: 'list',
      required: false,
      field: { name: 'date', label: 'Date', ...dateSeule },
      hint: 'Jours où l’événement récurrent n’a pas lieu (vacances…).',
    },
  ],
};

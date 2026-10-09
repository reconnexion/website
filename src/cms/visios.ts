/** Collection Sveltia « Liens de visio » : /visio/<identifiant> redirige vers une salle meet.reconnexion.coop. */
import { PREFIXE_VISIO } from '../lib/visios';

export const collectionVisios = {
  name: 'visios',
  label: 'Liens de visio',
  label_singular: 'Lien de visio',
  folder: 'src/content/visios',
  extension: 'yml',
  format: 'yml',
  create: true,
  slug: '{{slug}}',
  identifier_field: 'nom',
  summary: '{{nom}} — /visio/{{slug}}',
  sortable_fields: ['nom', 'slug'],
  fields: [
    { name: 'nom', label: 'Nom', widget: 'string', hint: 'Pour s’y retrouver dans le CMS (non affiché sur le site).' },
    {
      name: 'slug',
      label: 'Identifiant',
      widget: 'string',
      hint: 'Minuscules et tirets ; l’adresse courte sera /visio/<identifiant>.',
      pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
    },
    {
      name: 'lien',
      label: 'Lien de la salle',
      widget: 'string',
      hint: `Ex. ${PREFIXE_VISIO}zww-ygql-jes`,
      pattern: [`^${PREFIXE_VISIO.replace(/[.]/g, '\\.')}[^/\\s?#]+$`, `Doit commencer par ${PREFIXE_VISIO}, suivi de l’identifiant de la salle`],
    },
  ],
};

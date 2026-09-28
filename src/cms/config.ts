/**
 * Configuration Sveltia générée à partir du registre de blocs.
 * `npm run cms` la transforme en public/admin/config.yml.
 * → Ne modifiez pas config.yml à la main : modifiez ce fichier ou les blocs.
 */
import { blocs } from '../blocs/registre';

// À adapter à votre forge.
const FORGE = 'https://forge.exemple.org';

const typesDeBlocs = blocs.map(({ name, label, fields }) => ({ name, label, fields }));

export const config = {
  backend: {
    name: 'gitea', // vaut aussi pour Forgejo (≥ 12.0)
    repo: 'reconnexion/site',
    base_url: FORGE,
    api_root: `${FORGE}/api/v1`,
    // app_id: '…', // Client ID de l'application OAuth créée dans Forgejo
  },
  media_folder: 'public/images',
  public_folder: '/images',
  collections: [
    {
      name: 'pages',
      label: 'Pages',
      label_singular: 'Page',
      folder: 'src/content/pages',
      extension: 'yml',
      format: 'yml',
      create: true,
      slug: '{{slug}}',
      identifier_field: 'titre',
      summary: '{{titre}}',
      fields: [
        { name: 'titre', label: 'Titre de la page', widget: 'string' },
        {
          name: 'slug',
          label: 'Adresse',
          widget: 'string',
          hint: '« index » pour la page d’accueil, sinon un mot sans espace (ex. « contribuer »).',
          pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
        },
        { name: 'description', label: 'Description (moteurs de recherche)', widget: 'text', required: false },
        {
          name: 'sections',
          label: 'Sections',
          label_singular: 'Section',
          widget: 'list',
          types: typesDeBlocs,
        },
      ],
    },
    {
      name: 'reglages',
      label: 'Réglages du site',
      files: [
        {
          name: 'site',
          label: 'Menu et pied de page',
          file: 'src/content/site.yml',
          fields: [
            { name: 'nom', label: 'Nom du site', widget: 'string' },
            {
              name: 'menu',
              label: 'Menu',
              widget: 'list',
              summary: '{{texte}}',
              fields: [
                { name: 'texte', label: 'Texte', widget: 'string' },
                { name: 'lien', label: 'Lien', widget: 'string' },
              ],
            },
            { name: 'pied_de_page', label: 'Pied de page', widget: 'text', required: false },
            { name: 'texte_chargement', label: 'Texte pendant le chargement des données', widget: 'string', required: false },
          ],
        },
      ],
    },
  ],
};

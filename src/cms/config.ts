/**
 * Configuration Sveltia générée à partir du registre de blocs.
 * `npm run cms` la transforme en public/admin/config.yml.
 * → Ne modifiez pas config.yml à la main : modifiez ce fichier ou les blocs.
 */
import { blocs } from '../blocs/registre';
import { nomsIcones } from '../lib/icones';
import { champsApplication } from '../blocs/FicheApplication';

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
          hint: '« index » pour la page d’accueil, sinon des mots sans espace (ex. « contribuer » ou « nous-rencontrer/agenda »).',
          pattern: ['^[a-z0-9-]+(/[a-z0-9-]+)*$', 'Minuscules, chiffres, tirets et « / » uniquement'],
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
      // Une fiche par application : sa page /applications/<slug> et les listes du bloc Applications en dérivent.
      name: 'applications',
      label: 'Applications',
      label_singular: 'Application',
      folder: 'src/content/applications',
      extension: 'yml',
      format: 'yml',
      create: true,
      slug: '{{slug}}',
      identifier_field: 'nom',
      summary: '{{nom}}',
      sortable_fields: ['ordre', 'nom'],
      fields: champsApplication,
    },
    {
      // Réseaux dont Reconnexion fait partie, affichés par le bloc Réseaux.
      name: 'reseaux',
      label: 'Réseaux',
      label_singular: 'Réseau',
      folder: 'src/content/reseaux',
      extension: 'yml',
      format: 'yml',
      create: true,
      slug: '{{slug}}',
      identifier_field: 'nom',
      summary: '{{nom}}',
      fields: [
        { name: 'nom', label: 'Nom', widget: 'string' },
        {
          name: 'slug',
          label: 'Identifiant',
          widget: 'string',
          pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
        },
        { name: 'ordre', label: "Ordre d'affichage", widget: 'number', value_type: 'int', required: false },
        { name: 'logo', label: 'Logo', widget: 'image', required: false },
        { name: 'site', label: 'Site web', widget: 'string', required: false },
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
            { name: 'logo', label: 'Logo', widget: 'image', required: false, hint: 'Remplace le nom du site dans la barre de menu.' },
            { name: 'texte_menu', label: 'Libellé du bouton de menu (mobile)', widget: 'string', required: false },
            {
              name: 'menu',
              label: 'Menu',
              widget: 'list',
              summary: '{{texte}}',
              fields: [
                { name: 'texte', label: 'Texte', widget: 'string' },
                {
                  name: 'lien',
                  label: 'Lien',
                  widget: 'string',
                  required: false,
                  hint: 'Facultatif si le lien a un sous-menu.',
                },
                { name: 'icone', label: 'Icône', widget: 'select', options: nomsIcones, required: false },
                {
                  name: 'sous_menu',
                  label: 'Sous-menu',
                  widget: 'list',
                  required: false,
                  summary: '{{texte}}',
                  fields: [
                    { name: 'texte', label: 'Texte', widget: 'string' },
                    { name: 'lien', label: 'Lien', widget: 'string' },
                  ],
                },
              ],
            },
            {
              name: 'pied_de_page',
              label: 'Pied de page',
              widget: 'text',
              required: false,
              hint: 'Ligne vide = nouveau paragraphe. **gras**, [texte du lien](https://…).',
            },
            { name: 'texte_chargement', label: 'Texte pendant le chargement des données', widget: 'string', required: false },
          ],
        },
      ],
    },
  ],
};

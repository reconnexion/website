/**
 * Configuration Sveltia générée à partir du registre de blocs.
 * `npm run cms` la transforme en public/admin/config.yml.
 * → Ne modifiez pas config.yml à la main : modifiez ce fichier ou les blocs.
 */
import { blocs } from '../blocs/registre';
import { nomsIcones } from '../lib/icones';
import { champsApplication } from '../blocs/FicheApplication';
import { collectionsCartes, fichierReglagesCartes } from './cartes';

/** Réglages → « Actualités » : forum lu par le bloc Actualités et libellés des pages d'articles. */
const fichierReglagesActualites = {
  name: 'actualites',
  label: 'Actualités (forum)',
  file: 'src/content/reglages-actualites.yml',
  fields: [
    { name: 'forum', label: 'Adresse du forum Discourse', widget: 'string' },
    {
      name: 'etiquette',
      label: 'Étiquette des sujets publiés',
      widget: 'string',
      hint: 'Les sujets du forum portant cette étiquette deviennent des articles du site (texte et photos du premier message).',
    },
    { name: 'titre_liste', label: 'Nom de la liste des articles (surtitre des articles)', widget: 'string', required: false },
    { name: 'lien_liste', label: 'Adresse de la page qui liste les articles', widget: 'string', required: false },
    ...[
      ['texte_lien_forum', 'Bouton vers le sujet du forum'],
      ['titre_auteur', 'Titre de l’encart « auteur·ice »'],
      ['texte_profil_forum', 'Lien vers le profil de l’auteur·ice sur le forum'],
      ['titre_reagir', 'Titre de l’encart « réagir »'],
      ['texte_reponses', 'Libellé du nombre de réponses'],
      ['texte_likes', 'Libellé du nombre de « j’aime »'],
      ['titre_autres', 'Titre de l’encart « autres articles »'],
      ['texte_tous', 'Lien vers la liste des articles'],
    ].map(([name, label]) => ({ name, label, widget: 'string', required: false })),
  ],
};

// Adresse publique du site : c'est lui qui sert la connexion GitHub (src/pages/api/auth.ts et callback.ts).
const SITE = process.env.SITE_URL || 'https://new.reconnexion.coop';

const typesDeBlocs = blocs.map(({ name, label, fields }) => ({ name, label, fields }));

export const config = {
  backend: {
    name: 'github',
    repo: 'reconnexion/website',
    branch: 'master',
    base_url: SITE,
    auth_endpoint: 'api/auth',
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
    ...collectionsCartes,
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
        {
          name: 'applications',
          label: 'Pages d’applications',
          file: 'src/content/reglages-applications.yml',
          fields: [
            {
              name: 'sections_bas',
              label: 'Sections en bas de chaque page d’application',
              label_singular: 'Section',
              widget: 'list',
              required: false,
              types: typesDeBlocs,
              hint: 'Affichées sous la fiche et les discussions du forum de chaque application (ex. bandeau newsletter).',
            },
          ],
        },
        fichierReglagesCartes,
        fichierReglagesActualites,
      ],
    },
  ],
};

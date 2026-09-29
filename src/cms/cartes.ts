/**
 * Collections Sveltia des cartes QR : reprise complète du formulaire Bazar « QrCards » (et « Sets de cartes »)
 * de reconnexion.coop. Voir src/lib/cartes.ts pour le modèle de données.
 */
import type { Champ } from '../blocs/types';
import { COMPLEXITES, MATURITES } from '../lib/cartes';

const slug: Champ = {
  name: 'slug',
  label: 'Identifiant',
  widget: 'string',
  hint: 'Minuscules et tirets ; pour une carte, sa page sera /cartes/<identifiant> (adresse du QR code).',
  pattern: ['^[a-z0-9-]+$', 'Minuscules, chiffres et tirets uniquement'],
};

const options = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

const collection = (name: string, label: string, label_singular: string, fields: unknown[], extra = {}) => ({
  name,
  label,
  label_singular,
  folder: `src/content/${name}`,
  extension: 'yml',
  format: 'yml',
  create: true,
  slug: '{{slug}}',
  ...extra,
  fields,
});

export const collectionsCartes = [
  collection(
    'cartes',
    'Cartes QR',
    'Carte',
    [
      { name: 'titre', label: 'Titre de la carte', widget: 'string' },
      slug,
      {
        name: 'type',
        label: 'Type de carte',
        widget: 'relation',
        collection: 'types-de-cartes',
        value_field: '{{slug}}',
        search_fields: ['nom'],
        display_fields: ['{{nom}}'],
      },
      { name: 'complexite', label: 'Complexité', widget: 'select', options: options(COMPLEXITES), required: false },
      {
        name: 'couleur',
        label: 'Couleur de fond',
        widget: 'color',
        required: false,
        hint: 'Vide : couleur du type de carte.',
      },
      // Recto
      { name: 'visuel', label: 'Visuel (recto)', widget: 'image', required: false, hint: 'Vide : logo des cartes.' },
      { name: 'accroche', label: 'Accroche (recto)', widget: 'string', required: false },
      {
        name: 'pictos',
        label: 'Pictogrammes du pied de carte (gauche, centre, droite)',
        widget: 'list',
        required: false,
        max: 3,
        summary: '{{texte}}',
        fields: [
          { name: 'image', label: 'Pictogramme', widget: 'image', required: false },
          { name: 'texte', label: 'Texte', widget: 'string', required: false },
        ],
      },
      // Verso
      {
        name: 'essentiel',
        label: "L'essentiel (verso)",
        widget: 'text',
        required: false,
        hint: 'Ligne vide = nouveau paragraphe. « - » en début de ligne = liste. **gras**, [lien](https://…).',
      },
      {
        name: 'url_qr',
        label: 'Url pour le QR code',
        widget: 'string',
        required: false,
        hint: 'Laisser vide pour renvoyer vers la page de la carte sur ce site.',
      },
      // Fiche détaillée
      {
        name: 'description',
        label: 'Contenus complémentaires (textes, images, liens, vidéos…)',
        widget: 'markdown',
        required: false,
      },
      { name: 'mots_cles', label: 'Mots clés', widget: 'list', required: false },
      {
        name: 'cartes_liees',
        label: 'Cartes liées',
        widget: 'relation',
        collection: 'cartes',
        value_field: '{{slug}}',
        search_fields: ['titre'],
        display_fields: ['{{titre}}'],
        multiple: true,
        required: false,
      },
      { name: 'adresse', label: 'Adresse', widget: 'string', required: false },
      { name: 'position', label: 'Position sur la carte', widget: 'map', required: false },
      { name: 'date_debut', label: 'Date de début', widget: 'datetime', time_format: false, required: false },
      { name: 'date_fin', label: 'Date de fin', widget: 'datetime', time_format: false, required: false },
      { name: 'contributeurices', label: 'Contributeurices', widget: 'text', required: false },
      { name: 'ressources', label: 'Sources, références…', widget: 'markdown', required: false },
      { name: 'licence', label: 'Licence', widget: 'string', default: 'CC-BY-SA' },
      {
        name: 'notes_edition',
        label: "Notes sur l'édition (pour soi ou pour les autres éditeurs)",
        widget: 'text',
        required: false,
        hint: 'Jamais publiées sur le site.',
      },
      { name: 'maturite', label: "État d'avancement de la carte", widget: 'select', options: options(MATURITES), required: false },
    ],
    { identifier_field: 'titre', summary: '{{titre}}', sortable_fields: ['titre', 'type'] },
  ),
  collection(
    'types-de-cartes',
    'Types de cartes',
    'Type de carte',
    [
      { name: 'nom', label: 'Nom', widget: 'string' },
      slug,
      { name: 'ordre', label: "Ordre d'affichage", widget: 'number', value_type: 'int', required: false },
      { name: 'couleur', label: 'Couleur par défaut des cartes', widget: 'color', required: false },
    ],
    { identifier_field: 'nom', summary: '{{nom}}', sortable_fields: ['ordre', 'nom'] },
  ),
  collection(
    'sets-de-cartes',
    'Sets de cartes',
    'Set de cartes',
    [
      { name: 'nom', label: 'Nom du set', widget: 'string' },
      slug,
      { name: 'description', label: 'Description', widget: 'text', required: false },
      {
        name: 'cartes',
        label: 'Cartes du set',
        widget: 'relation',
        collection: 'cartes',
        value_field: '{{slug}}',
        search_fields: ['titre'],
        display_fields: ['{{titre}}'],
        multiple: true,
        required: false,
      },
    ],
    { identifier_field: 'nom', summary: '{{nom}}' },
  ),
];

/** Réglages → « Cartes QR » : libellés des pages de cartes. */
export const fichierReglagesCartes = {
  name: 'cartes',
  label: 'Cartes QR (libellés)',
  file: 'src/content/reglages-cartes.yml',
  fields: [
    { name: 'titre_liste', label: 'Nom de la liste des cartes (surtitre des fiches)', widget: 'string' },
    { name: 'lien_liste', label: 'Adresse de la page qui liste les cartes', widget: 'string' },
    ...[
      ['texte_tous', 'Filtre « toutes les cartes »'],
      ['texte_imprimer', 'Bouton « imprimer » (fiche d’une carte)'],
      ['texte_vue_impression', 'Lien « vue impression »'],
      ['texte_noir_et_blanc', 'Option « noir et blanc » (vue impression)'],
      ['texte_lancer_impression', 'Bouton « lancer l’impression »'],
      ['texte_vide', 'Texte si aucune carte'],
    ].map(([name, label]) => ({ name, label, widget: 'string', required: false })),
    {
      name: 'libelles',
      label: 'Libellés des rubriques de la fiche',
      widget: 'object',
      fields: Object.entries({
        accroche: 'Accroche',
        essentiel: "L'essentiel",
        description: 'Contenus complémentaires',
        mots_cles: 'Mots clés',
        cartes_liees: 'Cartes liées',
        adresse: 'Adresse',
        dates: 'Dates',
        contributeurices: 'Contributeurices',
        ressources: 'Sources, références',
        licence: 'Licence',
        complexite: 'Complexité',
        maturite: "État d'avancement",
      }).map(([name, label]) => ({ name, label, widget: 'string', required: false })),
    },
  ],
};

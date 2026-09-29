# Consignes pour les agents IA (et les humains)

## Règle n° 1 : aucun texte de contenu dans le code
Tout texte visible par les visiteurs vient :
- des fichiers de contenu `src/content/**/*.yml`, édités dans Sveltia CMS ;
- ou des données Grist / CalDAV.

Si un composant a besoin d'un libellé (bouton, mention, texte vide…), ajoutez un **champ** au bloc
plutôt qu'une chaîne en dur. Seules exceptions : formats de date (Intl) et attributs techniques.

## Règle n° 2 : uniquement le design system
- Couleurs, polices, espacements, rayons : **uniquement** les variables de `src/styles/tokens.css`.
- Pas de nouvelle couleur, police ou ombre inventée. Pas de dégradé violet, pas d'emoji décoratif.
- Les composants sont stylés avec **Tailwind CSS v4 + daisyUI 5**, configurés dans `src/styles/theme.css`
  (partagé entre le site et l'aperçu du CMS) :
  - composants daisyUI d'abord (`btn`, `card`, `avatar`, `list`, `badge`, `navbar`, `menu`…) ;
    le thème `reconnexion` les branche sur les tokens (`primary` = vert foncé, `accent` = vert vif, `secondary` = bleu, `neutral` = noir, `base-*` = fond…) ;
  - pour le reste, les utilitaires Tailwind générés depuis les tokens : couleurs `text-gris`,
    `bg-fond-2`, `bg-barre`…, tailles `text-xs` à `text-xxl`, espacements `p-e1` à `p-e7`, `font-titre`,
    `rounded-carte`, `max-w-texte`, et `conteneur` / `bloc` pour la mise en page.
    Les palettes, tailles de texte, polices et ombres par défaut de Tailwind sont désactivées.
- Pas de valeurs arbitraires (`text-[#…]`, `p-[13px]`) pour les couleurs, polices ou espacements.
- Pas de fichier CSS par composant : si un style manque, ajouter un token ou un `@utility` dans `theme.css`.

## Règle n° 3 : même typographie et mêmes espacements sur toutes les pages
- Chaque section est un `<Bloc>` (`src/blocs/_commun.tsx`) : marge verticale `bloc` (e6), fond via le champ `fond`.
  Pas de `py-*` propre à un bloc (seule exception : le bandeau d'annonce, volontairement compact).
- Titre de section : `<TitreBloc>` (h2, `text-xl`, marge e4). Titre de carte : h3 `text-l`. h1 : uniquement dans
  le bandeau d'en-tête de page ou la fiche d'application.
- Texte courant : `<Paragraphes>` (taille `m`, paragraphes espacés de e3 via l'utilitaire `texte`, listes « - »).
  Seuls les chapeaux (bandeau) sont en `text-l` / `text-xl`.
- Boutons : `<BoutonAction>` / `<Boutons>` (vert sur fond clair, blanc sur fond vert ou bleu).
- Une page commence par un bandeau (surtitre = rubrique du menu, titre = nom de la page), sauf les fiches d'application.

## Données partagées : ne pas recopier
- Les applications ont leur propre collection (`src/content/applications/*.yml`, « Applications » dans le CMS).
  Leur page `/applications/<slug>` est générée par `src/pages/applications/[app].astro` (dès qu'une fiche a
  des captures ou des informations), et le bloc Applications ne stocke que la sélection (`selection`) :
  nom, résumé et vignette sont injectés au rendu par `Section.astro`.
- Cartes QR (reprise des QrCards Bazar) : collections `cartes` et `types-de-cartes`
  (`src/cms/cartes.ts`, modèle dans `src/lib/cartes.ts`), libellés dans `src/content/reglages-cartes.yml`.
  Liste = bloc « Cartes QR » ; fiches `/cartes/<slug>` (cible du QR code) et `/cartes/impression`
  générées par `src/pages/cartes/`. Nouveau type de carte = une fiche dans « Types de cartes », rien à coder.
- Idem pour les réseaux (`src/content/reseaux/*.yml`, « Réseaux » dans le CMS, bloc Réseaux).
- Même principe pour toute donnée affichée à plusieurs endroits : une collection, et des blocs qui la référencent.
- Images Grist (photos, logos) : jamais d'URL Grist dans le HTML (la clé d'API est requise) ; elles passent par
  `/api/grist/image/<doc>/<table>/<Photo|Logo>/<id>`, qui ne sert que les pièces jointes des lignes publiées
  des documents utilisés par le site.

## Ajouter un bloc
1. Créer `src/blocs/MonBloc.tsx` : le composant React **et** sa définition (`name`, `label`, `fields`).
2. L'ajouter à `src/blocs/registre.ts`.
3. Si le bloc affiche des données Grist/CalDAV : `source: 'grist' | 'caldav'`, un composant
   server island dans `src/components/`, et un cas dans `RenduBlocs.astro`.
4. `npm run cms` régénère la config Sveltia et l'aperçu. Ne jamais modifier `public/admin/config.yml` à la main.

## Données externes
- Grist et CalDAV sont lus **côté serveur uniquement** (`src/lib/grist.ts`, `src/lib/caldav.ts`).
- Ne jamais appeler Grist/CalDAV depuis le navigateur ; passer par un endpoint `src/pages/api/*`.
- Ne renvoyer que les champs publics.

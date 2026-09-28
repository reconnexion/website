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
- Styles des blocs dans `src/styles/blocs.css` (partagé avec l'aperçu du CMS).

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

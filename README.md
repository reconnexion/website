# Démo — site Reconnexion (Astro + Sveltia CMS + Grist + CalDAV)

Petit prototype pour évaluer l'architecture. Le design est un **placeholder** à remplacer par votre design system.

## Lancer la démo

```bash
npm install
npm run dev          # http://localhost:4321
```

Sans configuration, Grist et CalDAV sont remplacés par des **données d'exemple**.

- Site : http://localhost:4321
- Administration : http://localhost:4321/admin/index.html
  → cliquer sur **« Work with Local Repository »** et choisir le dossier du projet
  (Chrome, Edge ou Brave uniquement ; le dossier doit être un dépôt git — il l'est déjà).
  Les modifications sont écrites dans `src/content/` ; rechargez le site pour les voir,
  puis committez avec git.

## Ce qu'il y a à regarder

| Où | Quoi |
|---|---|
| `src/blocs/` | Les blocs : chaque fichier = composant React + champs éditables |
| `src/blocs/registre.ts` | Le registre, source unique pour le site ET le CMS |
| `src/content/` | Le contenu (YAML), édité via Sveltia |
| `scripts/build-cms.mjs` | Génère `public/admin/config.yml` + l'aperçu du CMS depuis le registre |
| `src/cms/apercu.tsx` | L'aperçu Sveltia rendu avec les vrais composants |
| `src/components/*Ile.astro` | Server islands (Grist, CalDAV) : rendues à chaque requête |
| `src/components/AgendaLive.tsx` | Client island : agenda rafraîchi sans recharger la page |
| `src/pages/api/agenda.json.ts` | Endpoint proxy vers CalDAV pour le navigateur |
| `AGENTS.md` | Règles pour la génération de code par IA |

## Trois modes de rendu, dans la même page

- **Texte éditorial** (bandeau, cartes, appel…) : HTML statique généré au build, zéro JS.
- **Équipe (Grist)** et **agenda (CalDAV)** : server islands (`server:defer`). La page reste statique ;
  le bloc est rendu côté serveur à chaque visite (cache d'une minute). Aucun rebuild nécessaire.
- **Agenda « live »** (case cochée dans le CMS) : en plus, le navigateur le rafraîchit chaque minute
  via `/api/agenda.json`.

## Brancher les vraies données

Copier `.env.example` en `.env` et renseigner les variables. Côté Grist, la table doit avoir
les colonnes `Nom`, `Role`, `Photo`, `Lien` et, optionnellement, `Public` (case à cocher).

## Production

```bash
npm run build
npm start                      # serveur Node, lit .env (HOST / PORT configurables)
```

Pour l'édition en ligne : renseigner l'URL de votre Forgejo et le `app_id` OAuth dans
`src/cms/config.ts` (Forgejo ≥ 12, CORS à activer), puis faire reconstruire le site par la CI
à chaque push sur la branche principale.

// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Par défaut, tout le site est pré-rendu (statique).
// L'adaptateur Node sert uniquement aux server islands (`server:defer`)
// et aux endpoints marqués `prerender = false` (données Grist, forum, agenda).
export default defineConfig({
  // Adresse publique (QR codes des cartes, liens absolus).
  site: process.env.SITE_URL || 'https://new.reconnexion.coop',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});

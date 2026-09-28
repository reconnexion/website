// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

// Par défaut, tout le site est pré-rendu (statique).
// L'adaptateur Node sert uniquement aux server islands (`server:defer`)
// et aux endpoints marqués `prerender = false` (données Grist / CalDAV).
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
});

/**
 * Génère l'interface d'administration Sveltia à partir du code :
 *   public/admin/config.yml  ← src/cms/config.ts (qui lit le registre de blocs)
 *   public/admin/apercu.js   ← src/cms/apercu.tsx (aperçu avec les vrais composants)
 *   public/admin/apercu.css  ← src/styles/apercu.css (Tailwind + daisyUI + tokens)
 * Lancé automatiquement par `npm run dev` et `npm run build`.
 */
import { build } from 'esbuild';
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { stringify, parse } from 'yaml';

const admin = 'public/admin';

async function lireCollection(nom) {
  const dossier = `src/content/${nom}`;
  const fichiers = (await readdir(dossier)).filter((f) => f.endsWith('.yml'));
  return Promise.all(fichiers.map(async (f) => parse(await readFile(`${dossier}/${f}`, 'utf8'))));
}
const tmp = 'node_modules/.cache/cms-config.mjs';
await mkdir(admin, { recursive: true });

// 1. config.yml
await build({
  entryPoints: ['src/cms/config.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: tmp,
  jsx: 'automatic',
  logLevel: 'error',
});
const { config } = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
await rm(tmp);
await writeFile(
  `${admin}/config.yml`,
  '# FICHIER GÉNÉRÉ par scripts/build-cms.mjs — ne pas modifier à la main.\n' +
    stringify(config, { lineWidth: 0 }),
);

// 2. apercu.js
await build({
  entryPoints: ['src/cms/apercu.tsx'],
  bundle: true,
  format: 'iife',
  outfile: `${admin}/apercu.js`,
  jsx: 'automatic',
  minify: true,
  // Fiches d'applications et de réseaux, pour que leurs blocs montrent les vraies données dans l'aperçu.
  define: { 'process.env.NODE_ENV': '"production"', __APPLICATIONS__: JSON.stringify(await lireCollection('applications')),
    __RESEAUX__: JSON.stringify(await lireCollection('reseaux')),
  },
  logLevel: 'error',
});

// 3. apercu.css — même Tailwind/daisyUI que le site, compilé avec la CLI
execFileSync(
  'node_modules/.bin/tailwindcss',
  ['-i', 'src/styles/apercu.css', '-o', `${admin}/apercu.css`, '--minify'],
  { stdio: 'pipe' },
);

console.log('✓ Admin Sveltia générée dans public/admin/');

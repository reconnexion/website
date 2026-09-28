/**
 * Génère l'interface d'administration Sveltia à partir du code :
 *   public/admin/config.yml  ← src/cms/config.ts (qui lit le registre de blocs)
 *   public/admin/apercu.js   ← src/cms/apercu.tsx (aperçu avec les vrais composants)
 *   public/admin/apercu.css  ← styles du design system
 * Lancé automatiquement par `npm run dev` et `npm run build`.
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { stringify } from 'yaml';

const admin = 'public/admin';
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
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'error',
});

// 3. apercu.css
const css = await Promise.all(['src/styles/tokens.css', 'src/styles/blocs.css'].map((f) => readFile(f, 'utf8')));
css.push(`
/* Propre à l'aperçu du CMS */
.apercu-donnees-exemple { position: relative; outline: 2px dashed var(--c-mousse); outline-offset: -8px; }
.apercu-donnees-exemple::before {
  content: 'Aperçu avec des données d’exemple — les vraies données viennent de Grist / CalDAV';
  position: absolute; top: 12px; right: 12px; z-index: 1;
  font: 700 12px var(--f-texte); background: var(--c-mousse); color: var(--c-papier);
  padding: 4px 8px; border-radius: 6px;
}
`);
await writeFile(`${admin}/apercu.css`, css.join('\n'));

console.log('✓ Admin Sveltia générée dans public/admin/');

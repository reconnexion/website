/**
 * Génère les variantes WebP des images déposées dans public/images/ (PNG, JPEG, WebP) :
 *   public/images/<chemin>  →  dist/client/_img/<largeur>/<chemin>.webp
 * Les originaux ne sont pas touchés et restent servis à /images/<chemin>.
 * Utilisées par le composant `Image` de src/blocs/_image.tsx (garder les largeurs alignées).
 * Lancé par `npm run build`, après `astro build`. Cache dans node_modules/.cache/images (par contenu).
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const LARGEURS = [480, 960, 1600, 2400];
const source = 'public/images';
const sortie = 'dist/client/_img';
const cache = 'node_modules/.cache/images';

const existe = (f) => stat(f).then(() => true, () => false);

await mkdir(cache, { recursive: true });
const fichiers = (await readdir(source, { recursive: true })).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

let generees = 0;
for (const fichier of fichiers) {
  const contenu = await readFile(join(source, fichier));
  const empreinte = createHash('sha1').update(contenu).digest('hex');
  for (const largeur of LARGEURS) {
    const enCache = join(cache, `${empreinte}-${largeur}.webp`);
    if (!(await existe(enCache))) {
      // Jamais agrandie : une image plus petite que `largeur` est seulement convertie.
      await sharp(contenu).rotate().resize({ width: largeur, withoutEnlargement: true }).webp({ quality: 80 }).toFile(enCache);
      generees++;
    }
    const cible = join(sortie, String(largeur), `${fichier}.webp`);
    await mkdir(dirname(cible), { recursive: true });
    await copyFile(enCache, cible);
  }
}

console.log(`✓ Variantes de ${fichiers.length} images dans ${sortie} (${generees} générées, le reste en cache)`);

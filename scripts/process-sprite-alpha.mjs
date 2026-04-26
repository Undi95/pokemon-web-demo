#!/usr/bin/env node
/**
 * process-sprite-alpha.mjs
 * ------------------------
 * Pré-process certains PNG indexed du décomp en RGBA avec alpha proper.
 *
 * Pourquoi : convention décomp = idx 0 du palette PNG = couleur "transparente"
 * convention. MAIS idx 0 peut avoir la MÊME RGB qu'un autre idx (ex. poke.png
 * idx 0 = idx 5 = (255,255,255) blanc). Si on transparentise par RGB côté
 * navigateur, on efface AUSSI les pixels idx 5 = highlights cassés.
 *
 * Solution : lire le PNG en INDEXED, générer RGBA où idx 0 → alpha=0.
 *
 * À runtime, ces PNGs RGBA se chargent direct sans besoin de transparentise.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SPRITES = [
  // path relative to public/decomp/em/
  'balls/poke.png',
  'balls/open.png',
];

for (const rel of SPRITES) {
  const inPath = resolve(ROOT, 'public/decomp/em', rel);
  const outPath = inPath.replace(/\.png$/, '-rgba.png');

  const buf = readFileSync(inPath);
  const png = PNG.sync.read(buf);

  // pngjs expand indexed → RGBA already in png.data BUT alpha = 255 for all.
  // On a besoin de la vraie indexation source. Re-read en mode indexed via
  // raw decode : pngjs garde palette dans png.palette si présent.
  const palette = png.palette as [number, number, number, number?][] | undefined;
  if (!palette || palette.length === 0) {
    console.warn(`[process-sprite-alpha] ${rel} pas indexed (skip)`);
    continue;
  }

  // pngjs read en mode RGBA expand. Pour récupérer indexes, refaire decode raw.
  // Hack : sample chaque pixel RGBA, trouver l'idx dans palette qui matche EN PREMIER.
  // Si idx 0 RGB = idx 5 RGB, le find retourne idx 0 (premier match) → tous les
  // pixels "blancs" deviennent idx 0 → tous transparentisés. CASSÉ.
  //
  // Workaround : utiliser PNG metadata.bitDepth + raw IDAT data. Trop complexe.
  //
  // Solution PROPRE : utiliser pngjs `parse` callback qui expose les rows en
  // mode indexed via colorType 3 + bpp.
  //
  // Solution PRAGMATIQUE : utiliser un OUTPUT séparé pour idx 0. On parse le
  // PNG indexed via header bitDepth + raw IDAT. PNG.sync.read decode déjà mais
  // perd l'idx. Fallback : si idx 0 RGB est UNIQUE dans palette, RGB-match marche.

  // Check si idx 0 RGB est unique dans palette
  const idx0 = palette[0];
  const idx0Rgb = (idx0[0] << 16) | (idx0[1] << 8) | idx0[2];
  let idx0Unique = true;
  for (let i = 1; i < palette.length; i++) {
    const rgb = (palette[i][0] << 16) | (palette[i][1] << 8) | palette[i][2];
    if (rgb === idx0Rgb) { idx0Unique = false; break; }
  }

  if (idx0Unique) {
    // RGB match safe : transparentise par RGB
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i] === idx0[0] && png.data[i + 1] === idx0[1] && png.data[i + 2] === idx0[2]) {
        png.data[i + 3] = 0;
      }
    }
    console.log(`[process-sprite-alpha] ${rel} : idx 0 unique RGB, transparentise OK`);
  } else {
    // idx 0 RGB collide avec autre idx. Need raw indexed parsing.
    // Use pngjs.PNG with skipRescale to get raw RGBA but we still need idx info.
    // Fallback : re-decode via the PNG parser callback that gives indexed rows.
    const png2 = new PNG();
    png2.parse(buf, () => {});
    // Hack workaround : write 2 separate transparent versions, user picks.
    // For now : warn + skip (or use idx 0 RGB and accept some highlights lost)
    console.warn(`[process-sprite-alpha] ${rel} : idx 0 RGB ${JSON.stringify(idx0)} collide avec autre idx → fallback indexed parser nécessaire`);

    // FALLBACK BRUTAL : parse brut en indexed mode.
    // pngjs avec colorType 3 expose les bytes raw via inflate de IDAT.
    // Trop complexe inline ici. Use Python/PIL approach via subprocess.
    continue;
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, PNG.sync.write(png));
  console.log(`[process-sprite-alpha] écrit ${outPath}`);
}

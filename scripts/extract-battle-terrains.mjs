#!/usr/bin/env node
/**
 * Copie les 12 battle terrains du décomp + convertit palette.pal (JASC-PAL
 * format texte) en JSON pour conso runtime.
 *
 * Source : `D:/Projet 1/decomps/pokeemeraude/graphics/battle_environment/<env>/`
 * Contenu : tiles.png (128×128 atlas 8×8 tiles), map.bin (u16 tilemap GBA),
 *   palette.pal (JASC-PAL texte), anim_tiles.png + anim_map.bin (optionnel).
 *
 * Sortie : `public/decomp/em/battle_terrains/<env>/`
 *   - tiles.png (copié tel quel)
 *   - map.bin (copié tel quel)
 *   - palette.json (parsé : { colors: [[r,g,b], ...] })
 *   - meta.json (dimensions tilemap : { tilemapW, tilemapH, tileCount })
 *
 * Composition côté runtime via `src/engine/battle-terrain.ts`.
 * Cf. MASTER_PLAN.md §7.1 P1.1.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'graphics', 'battle_environment');
const outBase = join(projectRoot, 'public', 'decomp', 'em', 'battle_terrains');

mkdirSync(outBase, { recursive: true });

/** Parse un fichier JASC-PAL :
 *   JASC-PAL\n0100\n<count>\n<r> <g> <b>\n<r> <g> <b>\n...
 */
function parseJascPal(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== 'JASC-PAL') throw new Error('not JASC-PAL');
  const count = Number(lines[2]);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const parts = lines[3 + i].trim().split(/\s+/);
    colors.push([Number(parts[0]), Number(parts[1]), Number(parts[2])]);
  }
  return colors;
}

/** Lit dimensions PNG via header IHDR. */
function pngDims(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const envs = readdirSync(srcDir).filter(f => {
  try { return readdirSync(join(srcDir, f)).includes('tiles.png'); } catch { return false; }
});

let okCount = 0;
for (const env of envs) {
  const inDir = join(srcDir, env);
  const outDir = join(outBase, env);
  mkdirSync(outDir, { recursive: true });

  // Copies brutes
  copyFileSync(join(inDir, 'tiles.png'), join(outDir, 'tiles.png'));
  copyFileSync(join(inDir, 'map.bin'), join(outDir, 'map.bin'));

  // Anim optionnel
  if (existsSync(join(inDir, 'anim_tiles.png'))) {
    copyFileSync(join(inDir, 'anim_tiles.png'), join(outDir, 'anim_tiles.png'));
  }
  if (existsSync(join(inDir, 'anim_map.bin'))) {
    copyFileSync(join(inDir, 'anim_map.bin'), join(outDir, 'anim_map.bin'));
  }

  // Palette : palette.pal standard, sinon 1ère .pal trouvée (cas stadium qui
  // a plusieurs variantes elite four sans palette par défaut).
  const palFiles = readdirSync(inDir).filter(f => f.endsWith('.pal'));
  const palMain = palFiles.includes('palette.pal') ? 'palette.pal' : palFiles[0];
  if (!palMain) { console.warn(`[skip] ${env}: aucune palette`); continue; }
  const palText = readFileSync(join(inDir, palMain), 'utf8');
  const colors = parseJascPal(palText);
  writeFileSync(join(outDir, 'palette.json'), JSON.stringify({ colors }));

  // Meta : dimensions tilemap (déduites du map.bin et hypothèses GBA)
  const mapBuf = readFileSync(join(inDir, 'map.bin'));
  const tileEntries = mapBuf.length / 2; // u16 par entry
  // GBA battle bg : 32×32 tiles 8×8 = 1024 entries (256×256 px). Si 2048 entries
  // = 32×64 (256×512), c'est un layered atlas (front+back). On stocke la valeur.
  const tilesPng = readFileSync(join(inDir, 'tiles.png'));
  const tilesDims = pngDims(tilesPng);
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify({
    tilemapEntries: tileEntries,
    tilesAtlas: tilesDims,
    paletteCount: colors.length,
    hasAnim: existsSync(join(inDir, 'anim_tiles.png')),
  }));

  okCount++;
}

// Index global pour conso runtime
const index = envs.map(e => ({ name: e, path: `battle_terrains/${e}` }));
writeFileSync(join(outBase, 'index.json'), JSON.stringify(index, null, 2));

console.log(`[extract-battle-terrains] ${okCount} terrains extraits → ${outBase}`);
console.log(`  → ${envs.join(', ')}`);

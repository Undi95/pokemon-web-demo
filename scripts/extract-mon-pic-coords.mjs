#!/usr/bin/env node
/**
 * Extrait les coordonnées de sprites Pokémon en combat (front + back).
 *
 * Source : `src/data/pokemon_graphics/{front,back}_pic_coordinates.h`
 *   Format : `[SPECIES_X] = { .size = MON_COORDS_SIZE(W, H), .y_offset = N },`
 *   - size : ((ceil(W/8) << 4) | ceil(H/8)) — 2 nibbles
 *   - y_offset : px entre le bas du sprite réel et le bas de la frame 64×64
 *
 * Sortie : `public/decomp/em/mon-pic-coords.json` :
 *   { "SPECIES_BULBASAUR": { "back": {"w":48,"h":32,"yOffset":16},
 *                            "front": {...} }, ... }
 *
 * Critique pour Pokémon volants (Pidgeot y_offset=2 = sprite très haut) ou
 * statiques (Caterpie y_offset=15 = sprite tout en bas). Sans ça, tous les
 * sprites sont alignés bas, les volants apparaissent flottant trop bas.
 *
 * Cf. `include/data.h` MON_COORDS_SIZE macro + DEV_LOG session 47.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

function parseFile(relPath) {
  const text = readFileSync(join(decompPath, relPath), 'utf8');
  // Match: [SPECIES_X] = { .size = MON_COORDS_SIZE(W, H), .y_offset = N },
  const re = /\[(SPECIES_\w+)\]\s*=\s*\{\s*\.size\s*=\s*MON_COORDS_SIZE\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*,\s*\.y_offset\s*=\s*(\d+)/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    out[m[1]] = { w: Number(m[2]), h: Number(m[3]), yOffset: Number(m[4]) };
  }
  return out;
}

const back = parseFile('src/data/pokemon_graphics/back_pic_coordinates.h');
const front = parseFile('src/data/pokemon_graphics/front_pic_coordinates.h');

// Compose : merge back + front par species
const merged = {};
const species = new Set([...Object.keys(back), ...Object.keys(front)]);
for (const sp of species) {
  merged[sp] = { back: back[sp] ?? null, front: front[sp] ?? null };
}

const json = JSON.stringify(merged);
writeFileSync(join(outDirSrc, 'mon-pic-coords.json'), json);
writeFileSync(join(outDirPub, 'mon-pic-coords.json'), json);

console.log(`[extract-mon-pic-coords] ${Object.keys(merged).length} species (back: ${Object.keys(back).length}, front: ${Object.keys(front).length})`);
console.log(`  → ${outDirSrc}/mon-pic-coords.json`);
console.log(`  → ${outDirPub}/mon-pic-coords.json`);

// Spot-check Bulbasaur
console.log('  spot-check BULBASAUR:', JSON.stringify(merged.SPECIES_BULBASAUR));
console.log('  spot-check PIDGEOT (volant):', JSON.stringify(merged.SPECIES_PIDGEOT));

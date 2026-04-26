#!/usr/bin/env node
/**
 * Extrait les IDs d'animations Pokémon (front anim + delay) du décomp.
 *
 * Sources :
 *   - `src/pokemon.c` ~1406 : `sMonFrontAnimIdsTable[NUM_SPECIES - 1]`
 *   - `src/pokemon.c` ~1796 : `sMonAnimationDelayTable[NUM_SPECIES - 1]`
 *   - `include/pokemon_animation.h` : constantes ANIM_*
 *
 * Sortie : `pokemon-anims.json` :
 *   { "SPECIES_BULBASAUR": { "frontAnimId": "ANIM_V_JUMPS_H_JUMPS", "delay": 0 }, ... }
 *
 * Critique : sans ces valeurs, le sprite Pokémon en combat utilise une anim
 * arbitraire (loop frame 0/1) au lieu de l'anim spécifique du décomp.
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

function extractAnimConstants() {
  try {
    const text = readFileSync(join(decompPath, 'include/pokemon_animation.h'), 'utf8');
    const constants = {};
    const re = /#define\s+(ANIM_\w+)\s+(\d+)/g;
    let m;
    while ((m = re.exec(text)) !== null) constants[Number(m[2])] = m[1];
    return constants;
  } catch { return {}; }
}

function parseTable(filePath, tableName, isDelay = false) {
  const text = readFileSync(join(decompPath, filePath), 'utf8');
  const startIdx = text.indexOf(`${tableName}[`);
  if (startIdx === -1) {
    console.error(`Table ${tableName} not found`);
    return {};
  }
  const endIdx = text.indexOf('};', startIdx);
  const tableText = text.substring(startIdx, endIdx);
  const re = /\[(SPECIES_\w+)\s*-\s*1\]\s*=\s*([A-Z_0-9]+)/g;
  const out = {};
  let m;
  while ((m = re.exec(tableText)) !== null) {
    out[m[1]] = isDelay ? Number(m[2]) : m[2];
  }
  return out;
}

const animConstants = extractAnimConstants();
const animIds = parseTable('src/pokemon.c', 'sMonFrontAnimIdsTable', false);
const delays = parseTable('src/pokemon.c', 'sMonAnimationDelayTable', true);

const merged = {};
const allSpecies = new Set([...Object.keys(animIds), ...Object.keys(delays)]);
for (const species of allSpecies) {
  const animIdRaw = animIds[species];
  const animIdResolved = animConstants[Number(animIdRaw)] !== undefined
    ? animConstants[Number(animIdRaw)]
    : animIdRaw;
  merged[species] = {
    frontAnimId: animIdResolved,
    delay: delays[species] ?? 0,
  };
}

const json = JSON.stringify(merged);
writeFileSync(join(outDirSrc, 'pokemon-anims.json'), json);
writeFileSync(join(outDirPub, 'pokemon-anims.json'), json);

console.log(`[extract-pokemon-anims] ${Object.keys(merged).length} species (anims:${Object.keys(animIds).length}, delays:${Object.keys(delays).length})`);
console.log(`  spot BULBASAUR:`, JSON.stringify(merged.SPECIES_BULBASAUR));
console.log(`  spot POOCHYENA:`, JSON.stringify(merged.SPECIES_POOCHYENA));
console.log(`  spot TREECKO:`, JSON.stringify(merged.SPECIES_TREECKO));

#!/usr/bin/env node
/**
 * Mappe SPECIES_X → fichier WAV cri (déjà extraits dans public/decomp/em/cries/).
 *
 * Source : `src/data/pokemon/cry_ids.h` (gSpeciesIdToCryId[])
 *  - format : `[SPECIES_X - 277] = N` (offset 277 car NUM_SPECIES_GEN1 etc.)
 *
 * Sortie : `cries.json` :
 *   { "SPECIES_BULBASAUR": "cries/bulbasaur.wav", ... }
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const dataDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const dataDirPub = join(projectRoot, 'public', 'decomp', 'em');
const criesDir = join(projectRoot, 'public', 'decomp', 'em', 'cries');
mkdirSync(dataDirSrc, { recursive: true });
mkdirSync(dataDirPub, { recursive: true });

if (!existsSync(criesDir)) {
  console.error(`cries dir absent: ${criesDir}`);
  process.exit(1);
}

const wavFiles = readdirSync(criesDir).filter(f => f.endsWith('.wav'));
const wavIndex = new Set(wavFiles.map(f => f.replace(/\.wav$/, '').toLowerCase()));

// Approach robuste : ne dépend pas du parsing cry_ids.h. On scan tous les
// dossiers `public/decomp/em/pokemon/<species>/` qui ont un cry homonyme dans
// cries/. Plus simple + fiable que le parsing GBA-specific.
const pokemonDir = join(projectRoot, 'public', 'decomp', 'em', 'pokemon');
const manifest = {};
let mapped = 0;
if (existsSync(pokemonDir)) {
  for (const sp of readdirSync(pokemonDir)) {
    const lower = sp.toLowerCase();
    if (wavIndex.has(lower)) {
      manifest[`SPECIES_${sp.toUpperCase()}`] = `cries/${lower}.wav`;
      mapped++;
    }
  }
}

const json = JSON.stringify(manifest);
writeFileSync(join(dataDirSrc, 'cries.json'), json);
writeFileSync(join(dataDirPub, 'cries.json'), json);

console.log(`[extract-cries] ${mapped} cries mappées (sur ${wavFiles.length} WAV présents)`);
console.log(`  spot BULBASAUR:`, manifest.SPECIES_BULBASAUR);
console.log(`  spot POOCHYENA:`, manifest.SPECIES_POOCHYENA);
console.log(`  spot TREECKO:`, manifest.SPECIES_TREECKO);

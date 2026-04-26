#!/usr/bin/env node
/**
 * Extrait les évolutions Pokémon depuis `src/data/pokemon/evolution.h`.
 *
 * Format décomp : `gEvolutionTable[NUM_SPECIES][EVOS_PER_MON]`
 *   `[SPECIES_X] = {{EVO_LEVEL, 16, SPECIES_Y}, ...},`
 *
 * Méthodes courantes : EVO_LEVEL (param=level), EVO_ITEM (param=ITEM_X),
 * EVO_FRIENDSHIP, EVO_FRIENDSHIP_DAY/NIGHT, EVO_TRADE, EVO_TRADE_ITEM, etc.
 *
 * Sortie : `pokemon-evolutions.json` :
 *   { "SPECIES_CHARMANDER": [{ "method": "EVO_LEVEL", "param": 16, "target": "SPECIES_CHARMELEON" }] }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

// Cherche dans plusieurs paths potentiels (variations des décomp FR/EN)
const candidates = [
  'src/data/pokemon/evolution.h',
  'src/data/pokemon_evolutions.h',
  'src/data/pokemon/evolution_table.h',
];
let evoFile = null;
for (const c of candidates) {
  if (existsSync(join(decompPath, c))) { evoFile = c; break; }
}
if (!evoFile) {
  console.error(`Evolution file not found, tried: ${candidates.join(', ')}`);
  process.exit(1);
}

const text = readFileSync(join(decompPath, evoFile), 'utf8');
const reSpecies = /\[(SPECIES_\w+)\]\s*=\s*\{([\s\S]*?)\}\s*,?\s*\n/g;

const merged = {};
let m;
while ((m = reSpecies.exec(text)) !== null) {
  const species = m[1];
  const body = m[2];
  const reEvo = /\{\s*(EVO_\w+)\s*,\s*(\d+|[A-Z_0-9]+)\s*,\s*(SPECIES_\w+)\s*\}/g;
  const evos = [];
  let evo;
  while ((evo = reEvo.exec(body)) !== null) {
    evos.push({
      method: evo[1],
      param: /^\d+$/.test(evo[2]) ? Number(evo[2]) : evo[2],
      target: evo[3],
    });
  }
  merged[species] = evos;
}

const json = JSON.stringify(merged);
writeFileSync(join(outDirSrc, 'pokemon-evolutions.json'), json);
writeFileSync(join(outDirPub, 'pokemon-evolutions.json'), json);

const withEvo = Object.values(merged).filter(e => e.length > 0).length;
console.log(`[extract-pokemon-evolutions] ${Object.keys(merged).length} species (${withEvo} avec évolutions)`);
console.log(`  source: ${evoFile}`);
console.log(`  spot CHARMANDER:`, JSON.stringify(merged.SPECIES_CHARMANDER));
console.log(`  spot EEVEE:`, JSON.stringify(merged.SPECIES_EEVEE));

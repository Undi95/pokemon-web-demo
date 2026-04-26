#!/usr/bin/env node
/**
 * Parse les `include/constants/{species,moves,items,abilities,natures}.h`
 * pour produire les mappings enum → numérique. Permet au runtime de
 * convertir SPECIES_BULBASAUR → 1, MOVE_TACKLE → 33, etc.
 *
 * Sortie : public/decomp/em/constants.json
 *   {
 *     species: { SPECIES_BULBASAUR: 1, ... },
 *     moves:   { MOVE_TACKLE: 33, ... },
 *     items:   { ITEM_POTION: 13, ... },
 *     abilities: { ABILITY_STENCH: 1, ... },
 *     natures: { NATURE_HARDY: 0, ... }
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'constants.json');
mkdirSync(dirname(outPath), { recursive: true });

function parseDefines(filePath, prefix) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const re = /^\s*#define\s+(\w+)\s+((?:0x)?[0-9A-Fa-f]+)\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!m[1].startsWith(prefix)) continue;
    const value = m[2].startsWith('0x') ? parseInt(m[2], 16) : Number(m[2]);
    if (!Number.isNaN(value)) out[m[1]] = value;
  }
  return out;
}

const constsDir = join(decompPath, 'include', 'constants');
const out = {
  species: parseDefines(join(constsDir, 'species.h'), 'SPECIES_'),
  moves: parseDefines(join(constsDir, 'moves.h'), 'MOVE_'),
  items: parseDefines(join(constsDir, 'items.h'), 'ITEM_'),
  abilities: parseDefines(join(constsDir, 'abilities.h'), 'ABILITY_'),
  natures: parseDefines(join(constsDir, 'pokemon.h'), 'NATURE_'),
};

writeFileSync(outPath, JSON.stringify(out));
console.log('[constants]', {
  species: Object.keys(out.species).length,
  moves: Object.keys(out.moves).length,
  items: Object.keys(out.items).length,
  abilities: Object.keys(out.abilities).length,
  natures: Object.keys(out.natures).length,
  output: outPath
});

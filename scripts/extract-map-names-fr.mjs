#!/usr/bin/env node
/**
 * Copy + simplifie `src/data/region_map/region_map_sections.json` du décomp.
 * Sortie : public/decomp/em/map-names-fr.json — mapping MAPSEC_X → "NOM FR".
 *
 * Remplace le hardcode dans src/data/map-names-fr.ts qui ne couvrait que
 * 16 zones sur 100+.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'map-names-fr.json');
mkdirSync(dirname(outPath), { recursive: true });

const raw = JSON.parse(readFileSync(
  join(decompPath, 'src', 'data', 'region_map', 'region_map_sections.json'), 'utf8'
));

const out = {};
for (const sec of raw.map_sections) {
  out[sec.id] = sec.name;
}

writeFileSync(outPath, JSON.stringify(out));
console.log('[map-names-fr]', { count: Object.keys(out).length, output: outPath });

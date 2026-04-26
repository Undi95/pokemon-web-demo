#!/usr/bin/env node
/**
 * Copy `src/data/wild_encounters.json` du décomp + indexe par mapId pour
 * lookup rapide au runtime. Sortie : public/decomp/em/wild-encounters.json
 *
 * Format simplifié :
 *   {
 *     "byMap": {
 *       "MAP_ROUTE101": {
 *         "land": { "rate": 20, "mons": [{ species, min_level, max_level }] },
 *         "water": null | {...},
 *         "rock_smash": null | {...},
 *         "fishing": null | { "old_rod": [...], "good_rod": [...], "super_rod": [...] }
 *       }
 *     },
 *     "encounter_rates": {
 *       "land": [20,20,10,10,10,10,5,5,4,4,1,1],
 *       "water": [60,30,5,4,1],
 *       ...
 *     }
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'wild-encounters.json');
mkdirSync(dirname(outPath), { recursive: true });

const raw = JSON.parse(readFileSync(join(decompPath, 'src', 'data', 'wild_encounters.json'), 'utf8'));

const out = { byMap: {}, encounter_rates: {} };

// Index encounter_rates par type (depuis le 1er group)
const mainGroup = raw.wild_encounter_groups[0];
for (const field of mainGroup.fields) {
  out.encounter_rates[field.type] = field.encounter_rates;
}

// Index par mapId
for (const enc of mainGroup.encounters) {
  const mapId = enc.map;
  if (!out.byMap[mapId]) out.byMap[mapId] = {};
  for (const fieldType of ['land_mons', 'water_mons', 'rock_smash_mons', 'fishing_mons']) {
    if (!enc[fieldType]) continue;
    const key = fieldType.replace('_mons', '');
    out.byMap[mapId][key] = enc[fieldType];
  }
}

writeFileSync(outPath, JSON.stringify(out));
console.log('[wild-encounters]', {
  maps: Object.keys(out.byMap).length,
  rate_tables: Object.keys(out.encounter_rates).length,
  output: outPath
});

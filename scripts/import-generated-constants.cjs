#!/usr/bin/env node
'use strict';
/*
 * import-generated-constants.cjs — génère include/constants/region_map_sections.ts
 * depuis la source jsonproc de la décomp (src/data/region_map/region_map_sections.json
 * + template region_map_sections.constants.json.txt : enum ordre JSON puis
 * MAPSEC_NONE/MAPSEC_COUNT, METLOC_* fixes).
 */
const fs = require('fs');
const path = require('path');
const DECOMP = process.env.DECOMP_ROOT || 'D:/Projet 1/decomps/pokeemeraude';
const REPO = path.resolve(__dirname, '..');

const j = JSON.parse(fs.readFileSync(path.join(DECOMP, 'src/data/region_map/region_map_sections.json'), 'utf8'));
const lines = [
  '/**',
  ' * region_map_sections.ts — miroir 1:1 des constantes MAPSEC générées au build',
  ' * (jsonproc : src/data/region_map/region_map_sections.json + template',
  ' * region_map_sections.constants.json.txt — enum ordre JSON, puis MAPSEC_NONE,',
  ' * MAPSEC_COUNT ; METLOC_* fixes). Généré par scripts/import-generated-constants.cjs.',
  ' */',
  '',
];
let i = 0;
for (const s of j.map_sections) lines.push(`export const ${s.id} = ${i++}; // ${s.name}`);
lines.push(`export const MAPSEC_NONE = ${i};`);
lines.push(`export const MAPSEC_COUNT = ${i + 1};`);
lines.push('');
lines.push('// Special location IDs that use the same value space as MAPSECs.');
lines.push('export const METLOC_SPECIAL_EGG = 0xFD;');
lines.push('export const METLOC_IN_GAME_TRADE = 0xFE;');
lines.push('export const METLOC_FATEFUL_ENCOUNTER = 0xFF;');
lines.push('');
lines.push('export const KANTO_MAPSEC_START = MAPSEC_PALLET_TOWN;');
lines.push('export const KANTO_MAPSEC_END = MAPSEC_SPECIAL_AREA;');
lines.push('export const KANTO_MAPSEC_COUNT = KANTO_MAPSEC_END - KANTO_MAPSEC_START + 1;');
lines.push('');

const out = path.join(REPO, 'include', 'constants', 'region_map_sections.ts');
fs.writeFileSync(out, lines.join('\n'));
console.log(`${j.map_sections.length + 2} MAPSEC + 3 METLOC → ${out}`);

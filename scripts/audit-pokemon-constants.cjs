#!/usr/bin/env node
/**
 * audit-pokemon-constants.cjs — ORACLE des LIMITES FONDAMENTALES Pokémon.
 *
 * Confronte un set curé de constantes-piliers (utilisées partout : caps EV/niveau/amitié,
 * tailles d'équipe/moves/stats/natures) à leurs `#define` décomp (constants/pokemon.h +
 * constants/global.h). Une seule fausse = bug systémique (EV training capé faux, niveau max
 * faux, équipe de mauvaise taille, etc.).
 *
 * Décomp = vérité (#define NAME val). Ours = `export const NAME = val` (include/constants/*.ts).
 *
 *   node scripts/audit-pokemon-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_HEADERS = [
  'D:/Projet 1/decomps/pokeemeraude/include/constants/pokemon.h',
  'D:/Projet 1/decomps/pokeemeraude/include/constants/global.h',
];
const OURS_DIR = path.join(ROOT, 'include/constants');

// Constantes-piliers à vérifier (gameplay-fondamentales).
const NAMES = [
  'MAX_LEVEL', 'MIN_LEVEL', 'MAX_TOTAL_EVS', 'MAX_PER_STAT_EVS', 'MAX_FRIENDSHIP',
  'NUM_STATS', 'NUM_NATURES', 'PARTY_SIZE', 'MAX_MON_MOVES',
];

// décomp : #define NAME val (sur les 2 headers)
const decomp = {};
for (const h of DECOMP_HEADERS) {
  for (const m of fs.readFileSync(h, 'utf8').matchAll(/#define\s+([A-Z_][A-Z0-9_]*)\s+(\d+)\b/g)) {
    if (decomp[m[1]] === undefined) decomp[m[1]] = Number(m[2]);
  }
}
// ours : export const NAME = val (tous les include/constants/*.ts)
const ours = {};
for (const f of fs.readdirSync(OURS_DIR)) {
  if (!f.endsWith('.ts')) continue;
  for (const m of fs.readFileSync(path.join(OURS_DIR, f), 'utf8').matchAll(/export const ([A-Z_][A-Z0-9_]*)\s*=\s*(\d+)\b/g)) {
    if (ours[m[1]] === undefined) ours[m[1]] = Number(m[2]);
  }
}

const findings = [];
for (const n of NAMES) {
  if (decomp[n] === undefined) { findings.push(`${n} : absent des headers décomp`); continue; }
  if (ours[n] === undefined) { findings.push(`${n} : absent de nos include/constants/*.ts`); continue; }
  if (decomp[n] !== ours[n]) findings.push(`${n} : décomp=${decomp[n]} ours=${ours[n]}`);
}

console.log(`Limites fondamentales : ${NAMES.length} constantes confrontées`);
if (findings.length === 0) { console.log('✅ Constantes-piliers Pokémon (caps EV/niveau/amitié, tailles équipe/moves/stats/natures) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

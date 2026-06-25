#!/usr/bin/env node
/**
 * audit-data-1to1.cjs — RUNNER agrégateur des oracles de fidélité DATA 1:1 (campagne finale).
 *
 * Exécute en une commande tous les oracles déterministes headless qui confrontent
 * `public/decomp/em/*.json` (+ quelques tables TS hand-codées) au décomp pokeemeraude.
 * Sortie : une ligne ✅/❌ par oracle + un verdict global. exit 1 si un seul échoue.
 * = garde anti-dérive unique pour toute la data du jeu.
 *
 * NB : les oracles de FORMULE (probe-*-1to1.mjs : stats/dégâts) ne sont PAS ici — ils
 * exigent le moteur live (preview_eval), pas headless.
 *
 *   node scripts/audit-data-1to1.cjs  (ou `npm run audit:data-1to1`)  ·  exit 0 vert / 1 écart
 */
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

const DIR = __dirname;
// Oracles de fidélité DATA de la campagne (ordre = familles).
const ORACLES = [
  // — Pokémon / espèces —
  'audit-species-data.cjs', 'audit-evolution-data.cjs', 'audit-learnset-data.cjs',
  'audit-tmhm-learnsets.cjs', 'audit-tutor-learnsets.cjs', 'audit-egg-moves.cjs',
  'audit-experience-tables.cjs', 'audit-pokedex-orders.cjs', 'audit-pokedex-entries.cjs',
  'audit-pokedex-text.cjs',
  // — Combat —
  'audit-move-data.cjs', 'audit-type-chart.cjs', 'audit-item-data.cjs',
  'audit-item-effects-bytes.cjs', 'audit-contest-moves.cjs',
  // — Dresseurs —
  'audit-trainer-parties.cjs', 'audit-trainer-meta.cjs',
  // — Monde / progression —
  'audit-wild-encounters.cjs', 'audit-mart-lists.cjs', 'audit-item-balls.cjs',
  'audit-heal-locations.cjs', 'audit-flags-vars.cjs',
  // — Tables TS hand-codées —
  'audit-battle-stat-tables.cjs',
  // — Textes FR (gameplay-visible) —
  'audit-fr-names.cjs', 'audit-fr-descriptions.cjs', 'audit-item-descriptions-fr.cjs',
  'audit-map-names-fr.cjs', 'audit-strings-fresh.cjs',
];

const results = [];
for (const o of ORACLES) {
  let ok = true, lastLine = '';
  try {
    const out = execFileSync('node', [path.join(DIR, o)], { encoding: 'utf8' });
    lastLine = out.trim().split('\n').filter(Boolean).pop() || '';
  } catch (e) {
    ok = false;
    const out = (e.stdout || '') + (e.stderr || '');
    lastLine = out.trim().split('\n').filter(Boolean).pop() || `exit ${e.status}`;
  }
  results.push({ o, ok, lastLine });
}

const pad = Math.max(...results.map((r) => r.o.length));
console.log('═'.repeat(pad + 60));
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.o.padEnd(pad)}  ${r.lastLine.replace(/^[✅❌]\s*/, '')}`);
console.log('═'.repeat(pad + 60));
const fail = results.filter((r) => !r.ok);
if (fail.length === 0) { console.log(`✅ ${results.length}/${results.length} oracles DATA verts — toute la data extraite est 1:1 décomp.`); process.exit(0); }
console.log(`❌ ${fail.length}/${results.length} oracle(s) en échec : ${fail.map((r) => r.o).join(', ')}`);
process.exit(1);

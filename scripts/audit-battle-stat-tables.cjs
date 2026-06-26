#!/usr/bin/env node
/**
 * audit-battle-stat-tables.cjs — ORACLE des tables de stats de combat (hand-port TS).
 *
 * Confronte nos tables hand-codées `gNatureStatTable` (25×5) et `gStatStageRatios`
 * (13×2) dans `src/pokemon.ts` au décomp `src/pokemon.c` (1366 / 1869). Ces tables
 * pilotent le calcul de stats (nature ±10 %) et de dégâts (paliers ×0.25→×4). Headless
 * (remplace l'audit-stat-stage-ratios.mjs cassé par chemin périmé). Tout écart = stats/
 * dégâts faux.
 *
 *   node scripts/audit-battle-stat-tables.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TS = fs.readFileSync(path.join(ROOT, 'src/pokemon.ts'), 'utf8');
const C = fs.readFileSync('D:/Projet 1/decomps/pokeemeraude/src/pokemon.c', 'utf8');

// Extrait le corps d'un tableau entre un marqueur et le 1er délimiteur de fin, comments strippés.
const body = (src, marker, open, close) => {
  const a = src.indexOf(marker);
  if (a < 0) throw new Error('marqueur introuvable : ' + marker);
  const o = src.indexOf(open, a);
  const c = src.indexOf(close, o);
  return src.slice(o + 1, c).replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
};
const ints = (s) => [...s.matchAll(/[+-]?\d+/g)].map((m) => Number(m[0]));

const findings = [];
const cmp = (label, tsArr, cArr, expectLen) => {
  if (tsArr.length !== expectLen) findings.push(`${label} : ts ${tsArr.length} entiers (attendu ${expectLen})`);
  if (cArr.length !== expectLen) findings.push(`${label} : décomp ${cArr.length} entiers (attendu ${expectLen})`);
  const n = Math.min(tsArr.length, cArr.length);
  for (let i = 0; i < n; i++) if (tsArr[i] !== cArr[i]) findings.push(`${label}[#${i}] : ts=${tsArr[i]} ≠ décomp=${cArr[i]}`);
};

// gNatureStatTable : 25 natures × 5 = 125 entiers
cmp('gNatureStatTable',
  ints(body(TS, 'gNatureStatTable:', '[', '\n];')),
  ints(body(C, 'gNatureStatTable[NUM_NATURES]', '{', '\n};')),
  125);

// gStatStageRatios : 13 paliers × 2 = 26 entiers
cmp('gStatStageRatios',
  ints(body(TS, 'gStatStageRatios:', '[', '\n];')),
  ints(body(C, 'gStatStageRatios[MAX_STAT_STAGE', '{', '\n};')),
  26);

// sCriticalHitChance : 5 paliers de crit (dénominateurs 1/16…1/2) — battle_script_commands
const BSC_TS = fs.readFileSync(path.join(ROOT, 'src/battle_script_commands.ts'), 'utf8');
const BSC_C = fs.readFileSync('D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c', 'utf8');
cmp('sCriticalHitChance',
  ints(body(BSC_TS, 'const sCriticalHitChance', '[', ']')),
  ints(body(BSC_C, 'sCriticalHitChance[]', '{', '}')),
  5);

// sAccuracyStageRatios : 13 paliers précision/esquive × 2 (dividende, diviseur) = 26 entiers.
// Le type TS `ReadonlyArray<readonly [number, number]>` contient un `[` → on cherche `= [`.
const accA = BSC_TS.indexOf('= [', BSC_TS.indexOf('const sAccuracyStageRatios'));
cmp('sAccuracyStageRatios',
  ints(BSC_TS.slice(accA + 3, BSC_TS.indexOf('\n];', accA)).replace(/\/\/[^\n]*/g, '')),
  ints(body(BSC_C, 'sAccuracyStageRatios[]', '{', '\n};')),
  26);

if (findings.length === 0) { console.log('✅ gNatureStatTable (125) + gStatStageRatios (26) + sCriticalHitChance (5) + sAccuracyStageRatios (26) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de table de stats :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

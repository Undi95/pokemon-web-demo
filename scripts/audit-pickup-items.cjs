#!/usr/bin/env node
/**
 * audit-pickup-items.cjs — ORACLE des tables de la capacité RAMASSAGE (Pickup).
 *
 * Confronte sPickupItems / sRarePickupItems / sPickupProbabilities (battle_script_commands.ts)
 * au décomp (battle_script_commands.c:784-824). Pickup donne un objet après combat selon le
 * niveau + un roll vs sPickupProbabilities. Ces tables ONT DÉJÀ EU des bugs (14/18 + 10/11
 * valeurs fausses, corrigés) → l'oracle protège contre la régression.
 *
 * On résout les NOMS décomp (ITEM_*) en NUMÉROS via le décomp items.h, puis on confronte les
 * NUMÉROS de notre table (commentaires strippés — ils pourraient mentir, c'est le point).
 * 3 alias TM canoniques : ITEM_TM_FOCUS_PUNCH=TM01, ITEM_TM_EARTHQUAKE=TM26, ITEM_TM_REST=TM44.
 *
 *   node scripts/audit-pickup-items.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_BSC = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const DECOMP_ITEMS_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/items.h';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

// décomp name → numéro (items.h #define)
const NAME2NUM = {};
for (const m of fs.readFileSync(DECOMP_ITEMS_H, 'utf8').matchAll(/#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)\b/g)) {
  NAME2NUM[m[1]] = Number(m[2]);
}
const ALIAS = { ITEM_TM_FOCUS_PUNCH: 'ITEM_TM01', ITEM_TM_EARTHQUAKE: 'ITEM_TM26', ITEM_TM_REST: 'ITEM_TM44' };
const resolve = (name) => NAME2NUM[ALIAS[name] || name];

const bscC = fs.readFileSync(DECOMP_BSC, 'utf8');
const bscTs = fs.readFileSync(OURS, 'utf8');

/** Noms ITEM_* d'une table décomp `marker { … }`. */
function decompNames(src, marker) {
  const a = src.indexOf(marker);
  const body = src.slice(src.indexOf('{', a), src.indexOf('};', a));
  return [...body.matchAll(/ITEM_[A-Z0-9_]+/g)].map((m) => m[0]);
}
/** Numéros de notre table `marker [ … ]`, commentaires /* *​/ retirés. */
function oursNums(src, marker) {
  const a = src.indexOf(marker);
  const body = src.slice(src.indexOf('[', a), src.indexOf('];', a)).replace(/\/\*[\s\S]*?\*\//g, '');
  return [...body.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

const findings = [];
function cmpTable(label, names, nums) {
  const want = names.map(resolve);
  if (want.some((v) => v === undefined)) findings.push(`${label} : nom décomp non résolu (${names.filter((n) => resolve(n) === undefined).join(',')})`);
  if (want.length !== nums.length) { findings.push(`${label} : longueur décomp=${want.length} ours=${nums.length}`); return; }
  for (let i = 0; i < want.length; i++) if (want[i] !== nums[i]) findings.push(`${label}[${i}] ${names[i]} : décomp=${want[i]} ours=${nums[i]}`);
}

cmpTable('sPickupItems', decompNames(bscC, 'sPickupItems[]'), oursNums(bscTs, 'const sPickupItems'));
cmpTable('sRarePickupItems', decompNames(bscC, 'sRarePickupItems[]'), oursNums(bscTs, 'const sRarePickupItems'));

// sPickupProbabilities : numérique des deux côtés
const probC = [...bscC.slice(bscC.indexOf('sPickupProbabilities[]')).slice(0, 200).matchAll(/\d+/g)].map((m) => Number(m[0])).slice(0, 9);
const probTs = oursNums(bscTs, 'const sPickupProbabilities');
if (probC.join(',') !== probTs.join(',')) findings.push(`sPickupProbabilities : décomp=[${probC}] ours=[${probTs}]`);

console.log(`Pickup : sPickupItems ${oursNums(bscTs, 'const sPickupItems').length} · sRarePickupItems ${oursNums(bscTs, 'const sRarePickupItems').length} · proba ${probTs.length}`);
if (findings.length === 0) { console.log('✅ Tables Pickup (sPickupItems + sRarePickupItems + sPickupProbabilities) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

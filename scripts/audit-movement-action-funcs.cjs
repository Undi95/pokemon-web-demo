#!/usr/bin/env node
/**
 * audit-movement-action-funcs.cjs — ORACLE de la table maîtresse des actions de mouvement.
 *
 * `gMovementActionFuncs[]` (movement_action_func_tables.h) mappe chaque MOVEMENT_ACTION_* vers
 * sa fonction de step (`gMovementActionFuncs_<BaseName>`). C'est la colonne vertébrale du mouvement
 * NPC/joueur — zone flaggée SENSIBLE (gotcha mémoire : un getter d'action lisait la mauvaise source
 * et renvoyait WalkInPlaceNormal→JUMP_LEFT). Confronte `public/decomp/em/movement-action-funcs.json`
 * (champ `master`) au tableau décomp, action par action (nom de base).
 *
 *   node scripts/audit-movement-action-funcs.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const decompFile = path.join(DECOMP, 'src/data/object_events/movement_action_func_tables.h');
const jsonFile = path.join(ROOT, 'public/decomp/em/movement-action-funcs.json');

// — Table maîtresse décomp : extraire la région `gMovementActionFuncs[]) = { ... };` —
const txt = fs.readFileSync(decompFile, 'utf8');
const start = txt.indexOf('gMovementActionFuncs[])');
if (start < 0) { console.log('❌ table gMovementActionFuncs[] introuvable dans le décomp.'); process.exit(1); }
const region = txt.slice(start, start + txt.slice(start).indexOf('};'));
const decomp = {};
for (const m of region.matchAll(/\[(MOVEMENT_ACTION_\w+)\]\s*=\s*gMovementActionFuncs_(\w+)\s*,/g)) {
  decomp[m[1]] = m[2];
}

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8')).master || {};
const findings = [];
let checked = 0;
for (const action of Object.keys(decomp)) {
  checked++;
  if (!(action in json)) { findings.push(`${action} : absent du JSON (décomp=${decomp[action]})`); continue; }
  if (json[action] !== decomp[action]) findings.push(`${action} : JSON=${json[action]} · décomp=${decomp[action]}`);
}
for (const action of Object.keys(json)) {
  if (!(action in decomp)) findings.push(`${action} : dans le JSON mais ABSENT du décomp (JSON=${json[action]})`);
}

console.log(`Actions de mouvement confrontées : ${checked} (décomp ${Object.keys(decomp).length} · JSON ${Object.keys(json).length}).`);
if (findings.length === 0) { console.log('✅ master gMovementActionFuncs FIDÈLE au décomp (action → fonction de step 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 50)) console.log('  ' + f);
process.exit(1);

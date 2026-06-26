#!/usr/bin/env node
/**
 * audit-movement-action-ids.cjs — ORACLE des IDs d'actions de mouvement (enum MOVEMENT_ACTION_*).
 *
 * `movement-actions.json` donne pour chaque action un `actionId` (valeur numérique) + `actionConst`
 * (nom de l'enum). C'est l'ID que le système de mouvement DISPATCHE (gMovementActionFuncs[id]) — zone
 * flaggée sensible [[gotcha-movement-action-getter-dual-source]]. Confronte chaque `actionId` au
 * `#define MOVEMENT_ACTION_X value` du décomp (event_object_movement.h). Complète le -funcs (noms).
 *
 *   node scripts/audit-movement-action-ids.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const decompFile = path.join(DECOMP, 'include/constants/event_object_movement.h');
const jsonFile = path.join(ROOT, 'public/decomp/em/movement-actions.json');

function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref'); });
  if (!/^[-0-9<>|&~()+\s]+$/.test(s)) throw new Error('unsafe');
  return Function('"use strict";return (' + s + ')')() >>> 0;
}
// map MOVEMENT_ACTION_* -> valeur (résolution multi-passe pour réfs forward)
const decomp = {};
const txt = fs.readFileSync(decompFile, 'utf8');
const pend = [...txt.matchAll(/#define\s+(MOVEMENT_ACTION_[A-Z0-9_]*)\s+(.+)/g)].map((m) => [m[1], m[2]]);
let changed = true, pass = 0;
while (changed && pass++ < 6) { changed = false; for (const [n, x] of pend) { if (n in decomp) continue; try { decomp[n] = evalExpr(x, decomp); changed = true; } catch {} } }

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
const findings = [];
let checked = 0;
for (const key of Object.keys(json)) {
  const e = json[key];
  if (!e || typeof e.actionId !== 'number' || !e.actionConst) continue;
  if (!(e.actionConst in decomp)) { findings.push(`${e.actionConst} : absent du décomp (JSON id=${e.actionId})`); continue; }
  checked++;
  if (decomp[e.actionConst] !== e.actionId) findings.push(`${e.actionConst} : JSON id=${e.actionId} · décomp=${decomp[e.actionConst]}`);
}

console.log(`IDs d'actions de mouvement confrontés : ${checked} (#define MOVEMENT_ACTION_* connus : ${Object.keys(decomp).length}).`);
if (findings.length === 0) { console.log('✅ actionId == enum MOVEMENT_ACTION_* du décomp (dispatch 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 50)) console.log('  ' + f);
process.exit(1);

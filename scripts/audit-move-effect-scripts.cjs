#!/usr/bin/env node
/**
 * audit-move-effect-scripts.cjs — ORACLE de fidélité du dispatch effet→script de combat.
 *
 * Confronte `public/decomp/em/move-effect-scripts.json` (table effet→BattleScript : ce
 * que chaque effet de capacité déclenche en combat) au décomp `gBattleScriptsForMoveEffects`
 * (data/battle_scripts_1.s, `.4byte BattleScript_X @ EFFECT_Y`, indexé par effet).
 * Comparaison ordonnée. Tout écart = un effet de capacité exécute le mauvais script.
 *
 *   node scripts/audit-move-effect-scripts.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const S = 'D:/Projet 1/decomps/pokeemeraude/data/battle_scripts_1.s';
const JSON_F = path.join(ROOT, 'public/decomp/em/move-effect-scripts.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(S, 'utf8');

// Corps de la table : de `gBattleScriptsForMoveEffects::` jusqu'au prochain label `X::`
const start = src.indexOf('gBattleScriptsForMoveEffects::');
const after = src.slice(start + 'gBattleScriptsForMoveEffects::'.length);
const end = after.search(/\n\w+::/);
const body = end >= 0 ? after.slice(0, end) : after;

const decomp = [];
for (const m of body.matchAll(/\.4byte\s+(BattleScript_\w+)(?:\s*@\s*(EFFECT_\w+))?/g)) {
  decomp.push({ label: m[1], name: m[2] });
}

const findings = [];
if (ours.length !== decomp.length) findings.push(`nb entrées : json=${ours.length} ≠ décomp=${decomp.length}`);
const n = Math.min(ours.length, decomp.length);
for (let i = 0; i < n; i++) {
  const o = ours[i], d = decomp[i];
  if (o.label !== d.label) findings.push(`[${i}] (${d.name || ''}).label : json=${o.label} ≠ décomp=${d.label}`);
  if (d.name && o.name !== d.name) findings.push(`[${i}].name : json=${o.name} ≠ décomp=${d.name}`);
  if (o.effect !== i) findings.push(`[${i}].effect : json=${o.effect} ≠ index ${i}`);
}

console.log(`Effets→scripts décomp : ${decomp.length} · comparés : ${n}`);
if (findings.length === 0) { console.log('✅ move-effect-scripts.json FIDÈLE au décomp gBattleScriptsForMoveEffects (effet→script, ordre 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de dispatch effet→script :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-move-effect-status-flags.cjs — ORACLE de la map MOVE_EFFECT → flag de STATUT.
 *
 * Confronte `sStatusFlagsForMoveEffects` (battle_script_commands.ts, builder par index) au décomp
 * `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]` (battle_script_commands.c:608). Cette map dit
 * QUEL statut un effet de move inflige (SLEEP→STATUS1_SLEEP, TOXIC→STATUS1_TOXIC_POISON,
 * FLINCH→STATUS2_FLINCHED…). Un index ou un flag faux = un move qui endort inflige autre chose
 * (ou rien). Les INDEX de notre table sont des nombres sous commentaire (« [1 = SLEEP] ») =
 * classe du bug sSoundMovesTable.
 *
 * Vérifie DEUX choses : (1) chaque index-nombre == la constante MOVE_EFFECT_* (battle.h), et
 * (2) le mapping effet→flag == décomp (par nom de flag). + complétude (aucun manquant/en trop).
 *
 *   node scripts/audit-move-effect-status-flags.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_BSC = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const DECOMP_BATTLE_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

// MOVE_EFFECT_* → numéro (battle.h)
const EFF2NUM = {};
for (const m of fs.readFileSync(DECOMP_BATTLE_H, 'utf8').matchAll(/#define\s+MOVE_EFFECT_([A-Z0-9_]+)\s+(\d+)\b/g)) {
  EFF2NUM[m[1]] = Number(m[2]);
}

// décomp : { effectName: flagName }
const cTable = (() => {
  const src = fs.readFileSync(DECOMP_BSC, 'utf8');
  const a = src.indexOf('sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]');
  const body = src.slice(src.indexOf('{', a), src.indexOf('};', a));
  const out = {};
  for (const m of body.matchAll(/\[MOVE_EFFECT_([A-Z0-9_]+)\]\s*=\s*(STATUS\d_[A-Z0-9_]+)/g)) out[m[1]] = m[2];
  return out;
})();

// ours : [ { idx, effect, flag } ]
const oursEntries = [...fs.readFileSync(OURS, 'utf8').matchAll(
  /sStatusFlagsForMoveEffects\[(\d+)\s*\/\*\s*MOVE_EFFECT_([A-Z0-9_]+)\s*\*\/\]\s*=\s*(STATUS\d_[A-Z0-9_]+)/g,
)].map((m) => ({ idx: Number(m[1]), effect: m[2], flag: m[3] }));

const findings = [];
const oursByEffect = {};
for (const e of oursEntries) {
  oursByEffect[e.effect] = e;
  // (1) l'index-nombre doit == la constante MOVE_EFFECT_* (sinon nombre faux sous commentaire juste)
  if (EFF2NUM[e.effect] === undefined) findings.push(`MOVE_EFFECT_${e.effect} inconnu de battle.h`);
  else if (e.idx !== EFF2NUM[e.effect]) findings.push(`index MOVE_EFFECT_${e.effect} : ours=${e.idx} ≠ battle.h=${EFF2NUM[e.effect]}`);
}
// (2) + complétude : chaque entrée décomp doit exister chez nous avec le bon flag
for (const eff of Object.keys(cTable)) {
  const o = oursByEffect[eff];
  if (!o) { findings.push(`MOVE_EFFECT_${eff} ABSENT de notre table (décomp=${cTable[eff]})`); continue; }
  if (o.flag !== cTable[eff]) findings.push(`MOVE_EFFECT_${eff} flag : ours=${o.flag} ≠ décomp=${cTable[eff]}`);
}
for (const eff of Object.keys(oursByEffect)) if (!cTable[eff]) findings.push(`MOVE_EFFECT_${eff} EN TROP chez nous (absent du décomp)`);

console.log(`Map MOVE_EFFECT→statut : décomp=${Object.keys(cTable).length} · ours=${oursEntries.length} entrées`);
if (findings.length === 0) { console.log('✅ sStatusFlagsForMoveEffects FIDÈLE au décomp (index + mapping effet→flag 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

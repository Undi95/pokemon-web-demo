#!/usr/bin/env node
/**
 * audit-battle-flags.cjs — ORACLE des autres flags de combat (compl. audit-battle-status-bits).
 *
 * Confronte les constantes HITMARKER_* / BATTLE_TYPE_* / SIDE_STATUS_* / MOVE_TARGET_* /
 * STATUS3_* / B_WEATHER_* (src/engine/battle/constants.ts) au décomp `include/constants/battle.h`.
 * Flags utilisés partout : type de combat (dresseur/link/légendaire…), marqueurs de hit, effets de
 * camp (Reflet/Mur Lumière/Picots), ciblage de move, statut volatil (charge/perish/leech seed…),
 * météo. Une valeur fausse = branchement de combat faux.
 *
 * Mêmes ÉVALUATION d'expressions (hex/shifts/références) + intersection des noms que
 * audit-battle-status-bits.
 *
 *   node scripts/audit-battle-flags.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h';
const OURS = path.join(ROOT, 'src/engine/battle/constants.ts');

const WANT = /^(HITMARKER_|BATTLE_TYPE_|SIDE_STATUS_|MOVE_TARGET_|STATUS3_|B_WEATHER_)/;

function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => {
    if (id in scope) return '(' + scope[id] + ')';
    throw new Error('ref inconnue: ' + id);
  });
  if (!/^[-0-9<>|&~()+\s]+$/.test(s)) throw new Error('expr non sûre');
  return Function('"use strict";return (' + s + ')')() >>> 0;
}
function buildMap(src, re) {
  const scope = {};
  for (const m of src.matchAll(re)) {
    try { scope[m[1]] = evalExpr(m[2], scope); } catch { /* skip */ }
  }
  return scope;
}

const decomp = buildMap(fs.readFileSync(DECOMP, 'utf8'), /#define\s+([A-Z_][A-Z0-9_]*)\s+(.+)/g);
const ours = buildMap(fs.readFileSync(OURS, 'utf8'), /export const ([A-Z_][A-Z0-9_]*)\s*=\s*([^;]+);/g);

const names = Object.keys(decomp).filter((n) => WANT.test(n) && n in ours).sort();
const findings = [];
for (const n of names) if (decomp[n] !== ours[n]) findings.push(`${n} : décomp=0x${decomp[n].toString(16)} ours=0x${ours[n].toString(16)}`);
// garde-fous (valeurs connues)
if (decomp.BATTLE_TYPE_TRAINER !== 8) findings.push(`décomp BATTLE_TYPE_TRAINER=${decomp.BATTLE_TYPE_TRAINER} (attendu 8) — parse cassé ?`);

console.log(`Flags combat : ${names.length} constantes HITMARKER/BATTLE_TYPE/SIDE_STATUS/MOVE_TARGET/STATUS3/B_WEATHER confrontées`);
if (findings.length === 0) { console.log('✅ Flags de combat (type/marqueurs/camp/ciblage/statut3/météo) FIDÈLES au décomp battle.h.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

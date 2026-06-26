#!/usr/bin/env node
/**
 * audit-battle-status-bits.cjs — ORACLE des masques de bits de combat.
 *
 * Confronte les constantes STATUS1_* / STATUS2_* / MOVE_RESULT_* (src/engine/battle/constants.ts)
 * au décomp `include/constants/battle.h`. Ce sont des masques de bits utilisés PARTOUT en combat
 * (statut sommeil/poison/brûlure…, confusion/flinch/ligotage…, résultat raté/sans-effet…). La
 * mémoire note que 10+ de ces constantes avaient été FAUSSES (hardcodées) — d'où oracle anti-régression.
 *
 * Les valeurs sont des EXPRESSIONS (0x7, `1 << 3`, `A | B | C`) → on les ÉVALUE des deux côtés
 * (hex → décimal, références résolues dans l'ordre source) et on confronte l'intersection des noms.
 *
 *   node scripts/audit-battle-status-bits.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h';
const OURS = path.join(ROOT, 'src/engine/battle/constants.ts');

const WANT = /^(STATUS1_|STATUS2_|MOVE_RESULT_)/;

/** Évalue une expression C/JS de bits (hex + décalages + références au scope). */
function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));   // hex → décimal AVANT les identifiants
  s = s.replace(/[A-Za-z_]\w*/g, (id) => {
    if (id in scope) return '(' + scope[id] + ')';
    throw new Error('ref inconnue: ' + id);
  });
  if (!/^[-0-9<>|&~()+\s]+$/.test(s)) throw new Error('expr non sûre: ' + s);
  return Function('"use strict";return (' + s + ')')() >>> 0;
}

/** Construit name→valeur en évaluant dans l'ordre source (les références sont définies avant). */
function buildMap(src, re) {
  const scope = {};
  for (const m of src.matchAll(re)) {
    try { scope[m[1]] = evalExpr(m[2], scope); } catch { /* skip (réf hors scope) */ }
  }
  return scope;
}

const decomp = buildMap(fs.readFileSync(DECOMP, 'utf8'), /#define\s+([A-Z_][A-Z0-9_]*)\s+(.+)/g);
const ours = buildMap(fs.readFileSync(OURS, 'utf8'), /export const ([A-Z_][A-Z0-9_]*)\s*=\s*([^;]+);/g);

const names = Object.keys(decomp).filter((n) => WANT.test(n) && n in ours).sort();
const findings = [];
for (const n of names) if (decomp[n] !== ours[n]) findings.push(`${n} : décomp=0x${decomp[n].toString(16)} ours=0x${ours[n].toString(16)}`);
// garde-fou : valeurs connues
if (decomp.STATUS1_SLEEP !== 7) findings.push(`décomp STATUS1_SLEEP=${decomp.STATUS1_SLEEP} (attendu 7) — parse cassé ?`);

console.log(`Masques de bits combat : ${names.length} constantes STATUS1/STATUS2/MOVE_RESULT confrontées (intersection)`);
if (findings.length === 0) { console.log('✅ STATUS1_*/STATUS2_*/MOVE_RESULT_* FIDÈLES au décomp battle.h (masques 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

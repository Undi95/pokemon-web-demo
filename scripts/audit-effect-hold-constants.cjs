#!/usr/bin/env node
/**
 * audit-effect-hold-constants.cjs — ORACLE des enums EFFECT_* (moves) et HOLD_EFFECT_*.
 *
 * Confronte deux enums de constantes utilisés en COMPARAISON dans le code de combat :
 *   - EFFECT_* (battle_move_effects.h ↔ include/constants/battle_move_effects.ts) : l'effet d'un
 *     move (lu par Cmd_critcalc EFFECT_HIGH_CRITICAL, le dispatch d'effets, l'IA…).
 *   - HOLD_EFFECT_* (hold_effects.h ↔ include/constants/hold_effects.ts) : effet d'objet tenu
 *     (Choice Band/Macho Brace/Scope Lens… lus par CalculateBaseDamage, critcalc, MonGainEVs…).
 *
 * IMPORTANT : la résolution data (string→num) ET la comparaison code utilisent la MÊME constante
 * → un nombre faux est self-cohérent (invisible aux probes de données) mais FAUX vs le décomp.
 * Cet oracle confronte directement la VALEUR au décomp. Intersection des noms.
 *
 *   node scripts/audit-effect-hold-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = 'D:/Projet 1/decomps/pokeemeraude/include/constants/';
const O = path.join(ROOT, 'include/constants/');

function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref'); });
  if (!/^[-0-9<>|&~()+\s]+$/.test(s)) throw new Error('unsafe');
  return Function('"use strict";return (' + s + ')')() >>> 0;
}
function mapC(file, re) { const sc = {}; for (const m of fs.readFileSync(file, 'utf8').matchAll(re)) { try { sc[m[1]] = evalExpr(m[2], sc); } catch {} } return sc; }

const C_DEFINE = /#define\s+([A-Z_][A-Z0-9_]*)\s+(.+)/g;
const TS_CONST = /export const ([A-Z_][A-Z0-9_]*)\s*=\s*([^;]+);/g;

const findings = [];
function cmp(label, prefix, dFile, oFile) {
  const dec = mapC(D + dFile, C_DEFINE), our = mapC(O + oFile, TS_CONST);
  const names = Object.keys(dec).filter((n) => n.startsWith(prefix) && n in our);
  let n = 0;
  for (const name of names) { n++; if (dec[name] !== our[name]) findings.push(`${name} : décomp=${dec[name]} ours=${our[name]}`); }
  console.log(`  ${label} : ${n} constantes confrontées`);
  return n;
}

console.log('Enums EFFECT_* + HOLD_EFFECT_* :');
const nEff = cmp('EFFECT_ (move effects)', 'EFFECT_', 'battle_move_effects.h', 'battle_move_effects.ts');
const nHold = cmp('HOLD_EFFECT_', 'HOLD_EFFECT_', 'hold_effects.h', 'hold_effects.ts');
if (nEff < 50) findings.push(`EFFECT_ : seulement ${nEff} confrontées (attendu ~200) — parse cassé ?`);

if (findings.length === 0) { console.log('✅ EFFECT_* + HOLD_EFFECT_* FIDÈLES au décomp (valeurs d\'enum 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

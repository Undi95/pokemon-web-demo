#!/usr/bin/env node
/**
 * audit-ability-type-constants.cjs — ORACLE des enums ABILITY_* et TYPE_*.
 *
 * Confronte deux enums comparés en combat ET utilisés en résolution de données :
 *   - ABILITY_* (abilities.h ↔ include/constants/abilities.ts) : id de talent (Huge Power/Compound
 *     Eyes/Levitate… lus par CalculateBaseDamage, SetWildMonHeldItem, AI…).
 *   - TYPE_* (pokemon.h ↔ include/constants/pokemon.ts) : id de type (Feu/Eau/Mystery… lus par la
 *     météo de dégâts, le type chart, STAB…).
 * Même risque self-cohérent que EFFECT_/HOLD_EFFECT_ : un nombre faux est invisible aux probes
 * data (même constante des deux côtés) mais FAUX vs le décomp. Confrontation directe, intersection.
 *
 *   node scripts/audit-ability-type-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
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
  for (const name of names) if (dec[name] !== our[name]) findings.push(`${name} : décomp=${dec[name]} ours=${our[name]}`);
  console.log(`  ${label} : ${names.length} constantes confrontées`);
  return names.length;
}

console.log('Enums ABILITY_* + TYPE_* :');
const nAbi = cmp('ABILITY_', 'ABILITY_', 'abilities.h', 'abilities.ts');
const nType = cmp('TYPE_', 'TYPE_', 'pokemon.h', 'pokemon.ts');
if (nAbi < 50) findings.push(`ABILITY_ : seulement ${nAbi} (attendu ~78) — parse cassé ?`);
if (nType < 15) findings.push(`TYPE_ : seulement ${nType} (attendu ~18) — parse cassé ?`);

if (findings.length === 0) { console.log('✅ ABILITY_* + TYPE_* FIDÈLES au décomp (valeurs d\'enum 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

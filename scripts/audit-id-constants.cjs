#!/usr/bin/env node
/**
 * audit-id-constants.cjs — ORACLE des gros enums d'IDs : MOVE_* / ITEM_* / SPECIES_*.
 *
 * Confronte les constantes d'identifiants (include/constants/{moves,items,species}.ts) aux #define
 * décomp (constants/{moves,items,species}.h). Ces ids sont utilisés comme NOMBRES BRUTS dans le
 * code (ex. MOVE_GROWL dans sSoundMovesTable, ITEM_TM01 dans sTMHMMoves, SPECIES_CLAMPERL dans les
 * objets-espèce). Le bug Insonorisation (4e bug) était un id de move faux dans une table ; cet
 * oracle garantit que les CONSTANTES elles-mêmes sont 1:1 (foundation muette de tout le jeu).
 *
 * Évaluation d'expressions (hex/décalages/références) + intersection des noms.
 *
 *   node scripts/audit-id-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
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
function cmp(prefix, dFile, oFile, minExpected) {
  const dec = mapC(D + dFile, C_DEFINE), our = mapC(O + oFile, TS_CONST);
  const names = Object.keys(dec).filter((n) => n.startsWith(prefix) && n in our);
  let mism = 0;
  for (const name of names) if (dec[name] !== our[name]) { findings.push(`${name} : décomp=${dec[name]} ours=${our[name]}`); mism++; }
  console.log(`  ${prefix}* : ${names.length} confrontées (décomp ${Object.keys(dec).filter((n) => n.startsWith(prefix)).length} · ours ${Object.keys(our).filter((n) => n.startsWith(prefix)).length})`);
  if (names.length < minExpected) findings.push(`${prefix} : seulement ${names.length} confrontées (attendu ≥${minExpected}) — parse cassé ?`);
  return names.length;
}

console.log('Enums d\'IDs MOVE_* / ITEM_* / SPECIES_* :');
const total = cmp('MOVE_', 'moves.h', 'moves.ts', 300)
            + cmp('ITEM_', 'items.h', 'items.ts', 300)
            + cmp('SPECIES_', 'species.h', 'species.ts', 350);

if (findings.length === 0) { console.log(`✅ MOVE_*/ITEM_*/SPECIES_* FIDÈLES au décomp (${total} ids 1:1).`); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 50)) console.log('  ' + f);
process.exit(1);

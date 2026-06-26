#!/usr/bin/env node
/**
 * audit-move-power-tables.cjs — ORACLE des tables de PUISSANCE variable de moves.
 *
 * Confronte deux tables hand-codées de battle_script_commands.ts au décomp (.c) :
 *   - sFlailHpScaleToPowerTable : [hpFractionMax, power] → puissance de Flail/Reversal
 *     (plus la cible a peu de PV, plus c'est puissant). (c:749)
 *   - sWeightToDamageTable : [minWeightHectograms, basePower] + sentinelle {0xFFFF,0xFFFF}
 *     → puissance d'Écrasement (Low Kick) selon le poids de la cible. (c:774)
 * Tables de NOMBRES purs ⇒ on confronte les séquences d'entiers (décimal + hex 0xFFFF).
 * Une valeur fausse = puissance de move fausse (cf. bug sSoundMovesTable).
 *
 *   node scripts/audit-move-power-tables.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

const cSrc = fs.readFileSync(DECOMP, 'utf8');
const tsSrc = fs.readFileSync(OURS, 'utf8');

/** Entiers (décimal + hex) entre marker et le 1er close, commentaires strippés. */
function nums(src, marker, open, close) {
  const a = src.indexOf(marker);
  const body = src.slice(src.indexOf(open, a), src.indexOf(close, a))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return [...body.matchAll(/0x[0-9a-fA-F]+|\d+/g)].map((m) => Number(m[0]));
}

const findings = [];
function cmp(label, c, t) {
  if (c.length !== t.length) { findings.push(`${label} : longueur décomp=${c.length} ours=${t.length}`); return; }
  for (let i = 0; i < c.length; i++) if (c[i] !== t[i]) findings.push(`${label}[${i}] : décomp=${c[i]} ours=${t[i]}`);
}

cmp('sFlailHpScaleToPowerTable',
  nums(cSrc, 'sFlailHpScaleToPowerTable[]', '{', '}'),
  nums(tsSrc, 'const sFlailHpScaleToPowerTable', '[', '];'));
cmp('sWeightToDamageTable',
  nums(cSrc, 'sWeightToDamageTable[]', '{', '}'),
  nums(tsSrc, 'const sWeightToDamageTable', '[', '];'));

console.log('Tables de puissance : sFlailHpScaleToPowerTable + sWeightToDamageTable');
if (findings.length === 0) { console.log('✅ Tables de puissance de move (Flail/Reversal + Low Kick) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

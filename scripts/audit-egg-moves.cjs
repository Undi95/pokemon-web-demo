#!/usr/bin/env node
/**
 * audit-egg-moves.cjs — ORACLE de fidélité des MOUVEMENTS d'ŒUF (élevage).
 *
 * Confronte `public/decomp/em/egg-moves.json` (= moves héritables par reproduction)
 * au décomp `gEggMoves[]` (egg_moves.h, macro `egg_moves(ESPECE, MOVE_A, MOVE_B, …)`).
 * Comparaison ORDONNÉE par espèce. Tout écart = mauvais move d'élevage.
 *
 *   node scripts/audit-egg-moves.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EGG_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/egg_moves.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/egg-moves.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(EGG_H, 'utf8');

// Parse chaque bloc egg_moves(NAME, MOVE_..., ...)
const decomp = {};
for (const m of src.matchAll(/egg_moves\(\s*([A-Z0-9_]+)\s*,([\s\S]*?)\)/g)) {
  const sp = 'SPECIES_' + m[1];
  const moves = [...m[2].matchAll(/MOVE_[A-Z0-9_]+/g)].map((x) => x[0]);
  decomp[sp] = moves;
}

const findings = [];
let checked = 0;
for (const sp of Object.keys(decomp)) {
  const o = ours[sp];
  if (!o) { findings.push(`${sp} : ABSENT de egg-moves.json (décomp = ${decomp[sp].length} moves)`); continue; }
  checked++;
  const d = decomp[sp];
  if (o.length !== d.length) { findings.push(`${sp} : nb moves json=${o.length} ≠ décomp=${d.length}`); continue; }
  for (let i = 0; i < d.length; i++) {
    if (d[i] !== o[i]) findings.push(`${sp}[${i}] : json=${o[i]} ≠ décomp=${d[i]}`);
  }
}
// espèces dans notre JSON mais pas au décomp
for (const sp of Object.keys(ours)) if (!decomp[sp]) findings.push(`${sp} : dans egg-moves.json mais ABSENT du décomp`);

console.log(`Espèces à egg moves (décomp) : ${Object.keys(decomp).length} · comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ egg-moves.json FIDÈLE au décomp gEggMoves (moves d\'élevage, ordre inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de move d'œuf :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

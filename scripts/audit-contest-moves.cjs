#!/usr/bin/env node
/**
 * audit-contest-moves.cjs — ORACLE de fidélité des DONNÉES de CONCOURS par capacité.
 *
 * Confronte `public/decomp/em/contest-moves.json` (effet concours / catégorie /
 * combo-starter / combo-moves de chaque capacité) au décomp `gContestMoves[]`
 * (contest_moves.h). Tout écart = comportement de concours faux.
 *
 *   node scripts/audit-contest-moves.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/contest_moves.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/contest-moves.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

// Depth-scan : `[MOVE_NONE] = {0},` mono-ligne ferait avaler le bloc suivant à une regex
// gloutonne. comboMoves = liste de COMBO_STARTER_* (0 = vide).
const decomp = {};
const headRe = /\[(MOVE_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = headRe.exec(src)) !== null) {
  const key = m[1];
  let depth = 1, i = headRe.lastIndex;
  for (; i < src.length && depth > 0; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; }
  const body = src.slice(headRe.lastIndex, i - 1);
  headRe.lastIndex = i;
  if (key === 'MOVE_NONE') continue;                 // sentinelle {0}
  const f = (re) => { const x = body.match(re); return x ? x[1].trim() : undefined; };
  const cm = body.match(/\.comboMoves\s*=\s*\{([^}]*)\}/);
  const comboMoves = cm ? [...cm[1].matchAll(/COMBO_STARTER_[A-Z0-9_]+/g)].map((x) => x[0]) : [];
  decomp[key] = {
    effect: f(/\.effect\s*=\s*([A-Z0-9_]+)/),
    contestCategory: f(/\.contestCategory\s*=\s*([A-Z0-9_]+)/),
    comboStarterId: f(/\.comboStarterId\s*=\s*([A-Z0-9_]+)/),
    comboMoves,
  };
}

const findings = [];
let checked = 0;
for (const key of Object.keys(decomp)) {
  const o = ours[key];
  if (!o) { findings.push(`${key} : ABSENT de contest-moves.json`); continue; }
  checked++;
  const d = decomp[key];
  for (const fld of ['effect', 'contestCategory', 'comboStarterId']) {
    if (d[fld] !== undefined && String(d[fld]) !== String(o[fld])) findings.push(`${key}.${fld} : json=${JSON.stringify(o[fld])} ≠ décomp=${JSON.stringify(d[fld])}`);
  }
  const dcm = d.comboMoves.join(','), ocm = (o.comboMoves || []).join(',');
  if (dcm !== ocm) findings.push(`${key}.comboMoves : json=[${ocm}] ≠ décomp=[${dcm}]`);
}

console.log(`Capacités concours décomp : ${Object.keys(decomp).length} · comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ contest-moves.json FIDÈLE au décomp gContestMoves (effet/catégorie/combo).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de donnée concours :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

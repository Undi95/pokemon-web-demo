#!/usr/bin/env node
/**
 * audit-tutor-learnsets.cjs — ORACLE de fidélité des learnsets TUTEUR.
 *
 * Confronte `public/decomp/em/tutor-learnsets.json` (= moves apprenables via tuteurs de
 * capacités, par espèce) au décomp `sTutorLearnsets[]` (tutor_learnsets.h,
 * `[SPECIES_X] = (TUTOR(MOVE_A) | TUTOR(MOVE_B) | …)`). Comparaison en ENSEMBLES
 * (le décodage du bitmask peut réordonner). Tout écart = movepool tuteur faux.
 *
 *   node scripts/audit-tutor-learnsets.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TUTOR_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/tutor_learnsets.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/tutor-learnsets.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
let src = fs.readFileSync(TUTOR_H, 'utf8');

// Borne au tableau sTutorLearnsets[] = { ... };
const a = src.indexOf('sTutorLearnsets[]');
const o = src.indexOf('{', a);
const c = src.indexOf('\n};', o);
src = src.slice(o, c);

const isNonModeled = (sp) => sp === 'SPECIES_NONE' || /^SPECIES_OLD_UNOWN_/.test(sp);

// Parse par ancres [SPECIES_X] = ... jusqu'à la prochaine
const decomp = {};
const heads = [...src.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=/g)];
for (let i = 0; i < heads.length; i++) {
  const sp = heads[i][1];
  const body = src.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : src.length);
  decomp[sp] = [...body.matchAll(/TUTOR\((MOVE_[A-Z0-9_]+)\)/g)].map((x) => x[1]);
}

const sortedSet = (arr) => [...new Set(arr)].sort();
const findings = [];
const notModeled = [];
let checked = 0;
for (const sp of Object.keys(decomp)) {
  if (isNonModeled(sp)) continue;
  const oj = ours[sp];
  if (!oj) { notModeled.push(sp); continue; }
  checked++;
  const d = sortedSet(decomp[sp]), os = sortedSet(oj);
  const missing = d.filter((x) => !os.includes(x));
  const extra = os.filter((x) => !d.includes(x));
  if (missing.length) findings.push(`${sp} : MANQUE ${missing.join(',')}`);
  if (extra.length) findings.push(`${sp} : EN TROP ${extra.join(',')}`);
}

console.log(`Espèces tuteur (décomp) : ${Object.keys(decomp).length} · comparées : ${checked}` + (notModeled.length ? ` · non modélisées skip : ${notModeled.length}` : ''));
if (findings.length === 0) { console.log('✅ tutor-learnsets.json FIDÈLE au décomp sTutorLearnsets (moves tuteur par espèce, ensembles 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de learnset tuteur :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

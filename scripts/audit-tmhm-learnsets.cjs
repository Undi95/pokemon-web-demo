#!/usr/bin/env node
/**
 * audit-tmhm-learnsets.cjs — ORACLE de fidélité des learnsets TM/HM.
 *
 * Confronte `public/decomp/em/tmhm-learnsets.json` (= quelles CT/CS chaque espèce peut
 * apprendre → légalité movepool + accès CS terrain Surf/Force/Coupe…) au décomp
 * `gTMHMLearnsets[]` (tmhm_learnsets.h, `[SPECIES_X] = { .learnset = { .NAME = TRUE, … } }`).
 * Comparaison en ENSEMBLES (ordre indifférent). Tout écart = movepool faux.
 *
 *   node scripts/audit-tmhm-learnsets.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TMHM_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/tmhm_learnsets.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/tmhm-learnsets.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(TMHM_H, 'utf8');

// Placeholders non modélisés (cohérent avec species-info / learnsets level-up)
const isNonModeled = (sp) => sp === 'SPECIES_NONE' || /^SPECIES_OLD_UNOWN_/.test(sp);

// Parse chaque entrée [SPECIES_X] = { ... } : on capture le texte jusqu'à la prochaine entrée.
const decomp = {};
const headRe = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{/g;
const heads = [];
let m;
while ((m = headRe.exec(src)) !== null) heads.push({ sp: m[1], start: m.index });
for (let i = 0; i < heads.length; i++) {
  const body = src.slice(heads[i].start, i + 1 < heads.length ? heads[i + 1].start : src.length);
  const learned = [...body.matchAll(/\.([A-Z0-9_]+)\s*=\s*TRUE/g)].map((x) => x[1]);
  decomp[heads[i].sp] = learned;
}

const sortedSet = (arr) => [...new Set(arr)].sort();
const findings = [];
const notModeled = [];
let checked = 0;
for (const sp of Object.keys(decomp)) {
  const o = ours[sp];
  if (!o) { if (isNonModeled(sp)) { notModeled.push(sp); continue; } findings.push(`${sp} : ABSENT de tmhm-learnsets.json`); continue; }
  checked++;
  const d = sortedSet(decomp[sp]), oj = sortedSet(o);
  const missing = d.filter((x) => !oj.includes(x));     // dans le décomp, pas chez nous
  const extra = oj.filter((x) => !d.includes(x));       // chez nous, pas dans le décomp
  if (missing.length) findings.push(`${sp} : MANQUE ${missing.join(',')}`);
  if (extra.length) findings.push(`${sp} : EN TROP ${extra.join(',')}`);
}

console.log(`Espèces TMHM décomp : ${Object.keys(decomp).length} · comparées : ${checked}` + (notModeled.length ? ` · placeholders skip : ${notModeled.length}` : ''));
if (findings.length === 0) { console.log('✅ tmhm-learnsets.json FIDÈLE au décomp (CT/CS apprenables par espèce, ensembles 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de learnset TM/HM (= movepool faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

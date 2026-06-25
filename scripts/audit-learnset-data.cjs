#!/usr/bin/env node
/**
 * audit-learnset-data.cjs — ORACLE de fidélité DATA des learnsets level-up.
 *
 * Confronte `public/decomp/em/level-up-learnsets.json` (= gLevelUpLearnsets en jeu :
 * quels coups sont appris à quel niveau) au décomp :
 *   - src/data/pokemon/level_up_learnsets.h          (s<Nom>LevelUpLearnset[] = LEVEL_UP_MOVE(lvl,move))
 *   - src/data/pokemon/level_up_learnset_pointers.h  ([SPECIES_X] = s<Nom>LevelUpLearnset)
 * Tout écart = moveset faux (coup manquant, mauvais niveau, mauvais ordre).
 *
 *   node scripts/audit-learnset-data.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const LEARN_H = path.join(DECOMP, 'src/data/pokemon/level_up_learnsets.h');
const PTR_H = path.join(DECOMP, 'src/data/pokemon/level_up_learnset_pointers.h');
const JSON_F = path.join(ROOT, 'public/decomp/em/level-up-learnsets.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const learnSrc = fs.readFileSync(LEARN_H, 'utf8');
const ptrSrc = fs.readFileSync(PTR_H, 'utf8');

// 1) chaque learnset nommé → liste ordonnée {level, move}
const learnsets = {};
for (const m of learnSrc.matchAll(/static const u16 (s\w+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\};/g)) {
  const sym = m[1], body = m[2];
  const moves = [];
  for (const e of body.matchAll(/LEVEL_UP_MOVE\(\s*(\d+)\s*,\s*(MOVE_[A-Z0-9_]+)\s*\)/g)) {
    moves.push({ level: Number(e[1]), move: e[2] });
  }
  learnsets[sym] = moves;
}

// 2) pointeurs espèce → symbole learnset
const ptr = {};
for (const m of ptrSrc.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(s\w+LevelUpLearnset)/g)) ptr[m[1]] = m[2];

// Placeholders non modélisés côté jeu (cohérent avec species-info.json) :
// SPECIES_NONE (sentinelle, pointe vers Bulbasaur) + formes legacy SPECIES_OLD_UNOWN_*.
const isNonModeled = (sp) => sp === 'SPECIES_NONE' || /^SPECIES_OLD_UNOWN_/.test(sp);

const findings = [];
const notModeled = [];
let checked = 0;
for (const sp of Object.keys(ptr)) {
  const sym = ptr[sp];
  const d = learnsets[sym];
  if (!d) { findings.push(`${sp} : symbole ${sym} introuvable dans level_up_learnsets.h`); continue; }
  const o = ours[sp];
  if (!o) {
    if (isNonModeled(sp)) { notModeled.push(sp); continue; }   // skip placeholders connus
    findings.push(`${sp} : ABSENT de level-up-learnsets.json (décomp = ${d.length} coups)`); continue;
  }
  checked++;
  if (o.length !== d.length) { findings.push(`${sp} : nb coups json=${o.length} ≠ décomp=${d.length} (learnset ${sym})`); continue; }
  for (let j = 0; j < d.length; j++) {
    if (d[j].level !== o[j].level || d[j].move !== o[j].move) {
      findings.push(`${sp}[${j}] : json={${o[j].level},${o[j].move}} ≠ décomp={${d[j].level},${d[j].move}}`);
    }
  }
}

console.log(`Learnsets nommés : ${Object.keys(learnsets).length} · espèces pointées : ${Object.keys(ptr).length} · comparées : ${checked}` +
  (notModeled.length ? ` · placeholders skip : ${notModeled.length}` : ''));
if (findings.length === 0) { console.log('✅ level-up-learnsets.json FIDÈLE au décomp (coup/niveau/ordre par espèce).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de learnset (= movesets faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

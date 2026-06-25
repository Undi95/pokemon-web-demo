#!/usr/bin/env node
/**
 * audit-item-descriptions-fr.cjs — ORACLE de fidélité des DESCRIPTIONS d'OBJETS FR.
 *
 * Confronte `public/decomp/em/item-descriptions-fr.json` (texte affiché au sac / boutique)
 * au décomp `src/data/text/item_descriptions.h` (`s<Milieu>Desc[] = _("…\n"…)`). Notre
 * JSON est keyé par <Milieu> (sMasterBallDesc → "MasterBall") et aplatit les sauts de
 * ligne → comparaison normalisée (\n → espace). Tout écart = description d'objet fausse.
 *
 *   node scripts/audit-item-descriptions-fr.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/text/item_descriptions.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/item-descriptions-fr.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

const norm = (s) => s.replace(/\\[nlp]/g, ' ').replace(/\$/g, '').replace(/\s+/g, ' ').trim();

const findings = [];
let checked = 0, n = 0;
for (const m of src.matchAll(/static const u8 s(\w+)Desc\[\]\s*=\s*_\(([\s\S]*?)\);/g)) {
  n++;
  const key = m[1];
  const segs = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
  const dText = segs.join('');
  const o = ours[key];
  if (o === undefined) { findings.push(`${key} : ABSENT du JSON (décomp="${norm(dText)}")`); continue; }
  checked++;
  if (norm(dText) !== norm(o)) findings.push(`${key} :\n      json   = ${JSON.stringify(norm(o))}\n      décomp = ${JSON.stringify(norm(dText))}`);
}

console.log(`Descriptions d'objets décomp : ${n} · comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ item-descriptions-fr.json FIDÈLE au décomp item_descriptions.h (texte FR par objet).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de description d'objet :\n`);
for (const f of findings.slice(0, 20)) console.log('  ' + f);
process.exit(1);

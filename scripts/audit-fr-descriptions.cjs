#!/usr/bin/env node
/**
 * audit-fr-descriptions.cjs — ORACLE de fidélité des DESCRIPTIONS FR (capacités / talents).
 *
 * Confronte nos descriptions FR extraites (move-descriptions-fr.json, abilities-fr.json)
 * au décomp `src/data/text/{move_descriptions,abilities}.h` : définitions
 * `s<Nom>Description[] = _("…\n" "…")` + tables de pointeurs `[MOVE_X - 1]/[ABILITY_X] = sym`.
 * Texte FR gameplay-visible (info capacité, résumé talent). Comparaison EXACTE (sauts de
 * ligne \n inclus). Tout écart = description affichée fausse.
 *
 *   node scripts/audit-fr-descriptions.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// décomp `\n` (2 car.) → vrai saut ; `\l`/`\p` → espace ; $ (EOS) retiré ; trim
const norm = (s) => s.replace(/\\n/g, '\n').replace(/\\[lp]/g, ' ').replace(/\$/g, '').trim();

const TABLES = [
  {
    label: 'capacités', json: 'move-descriptions-fr.json', h: 'src/data/text/move_descriptions.h',
    ptrRe: /\[(MOVE_[A-Z0-9_]+)\s*-\s*1\]\s*=\s*(s\w+Description)/g, get: (o) => o,
  },
  {
    label: 'talents', json: 'abilities-fr.json', h: 'src/data/text/abilities.h',
    ptrRe: /\[(ABILITY_[A-Z0-9_]+)\]\s*=\s*(s\w+Description)/g, get: (o) => (o && o.description),
  },
];

const findings = [];
let checkedTotal = 0;
for (const t of TABLES) {
  const ours = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em', t.json), 'utf8'));
  const src = fs.readFileSync(path.join(DECOMP, t.h), 'utf8');
  // symbole → texte
  const texts = {};
  for (const m of src.matchAll(/static const u8 (s\w+Description)\[\]\s*=\s*_\(([\s\S]*?)\);/g)) {
    const segs = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
    texts[m[1]] = segs.join('');
  }
  // CONST → symbole
  let checked = 0;
  for (const m of src.matchAll(t.ptrRe)) {
    const key = m[1], sym = m[2];
    if (/_NONE\b/.test(key)) continue;
    const dRaw = texts[sym];
    if (dRaw === undefined) { findings.push(`[${t.label}] ${key} : symbole ${sym} sans texte`); continue; }
    const oVal = t.get(ours[key]);
    if (oVal === undefined) { findings.push(`[${t.label}] ${key} : ABSENT du JSON`); continue; }
    checked++;
    if (norm(dRaw) !== norm(oVal)) findings.push(`[${t.label}] ${key} :\n      json   = ${JSON.stringify(norm(oVal))}\n      décomp = ${JSON.stringify(norm(dRaw))}`);
  }
  checkedTotal += checked;
  console.log(`  ${t.label.padEnd(10)} : ${checked} descriptions comparées`);
}

console.log(`Descriptions FR comparées : ${checkedTotal}`);
if (findings.length === 0) { console.log('✅ descriptions FR (capacités/talents) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de description FR :\n`);
for (const f of findings.slice(0, 20)) console.log('  ' + f);
process.exit(1);

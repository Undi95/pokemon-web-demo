#!/usr/bin/env node
/**
 * audit-fr-names.cjs — ORACLE de fidélité des NOMS FR (capacités / talents / natures).
 *
 * Confronte nos tables de noms FR extraites (`public/decomp/em/*-names-fr.json`) au
 * décomp `src/data/text/*.h` (format `[CONST_X] = _("NOM")`). Texte FR gameplay-visible
 * (noms de capacités en combat, talents/natures en résumé). Tout écart = nom affiché faux.
 *
 *   node scripts/audit-fr-names.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

const TABLES = [
  { label: 'capacités', json: 'move-names-fr.json', h: 'src/data/text/move_names.h', prefix: 'MOVE_' },
  { label: 'talents', json: 'ability-names-fr.json', h: 'src/data/text/abilities.h', prefix: 'ABILITY_' },
  // natures : `s<Nom>NatureName[] = _("FR")` → clé NATURE_<NOM>
  { label: 'natures', json: 'nature-names-fr.json', h: 'src/data/text/nature_names.h', natureMode: true },
];

// Parse une table → [ [clé, nomFR], … ]
const parseTable = (src, t) => {
  if (t.natureMode) {
    return [...src.matchAll(/s(\w+)NatureName\[\]\s*=\s*_\("([^"]*)"\)/g)].map((m) => ['NATURE_' + m[1].toUpperCase(), m[2]]);
  }
  const re = new RegExp('\\[(' + t.prefix + '[A-Z0-9_]+)\\]\\s*=\\s*_\\("([^"]*)"\\)', 'g');
  return [...src.matchAll(re)].map((m) => [m[1], m[2]]);
};

let total = 0, checkedTotal = 0;
const findings = [];
for (const t of TABLES) {
  const ours = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em', t.json), 'utf8'));
  const src = fs.readFileSync(path.join(DECOMP, t.h), 'utf8');
  let n = 0, checked = 0;
  for (const [key, name] of parseTable(src, t)) {
    n++;
    if (/_NONE$/.test(key)) continue;                 // sentinelle
    const o = ours[key];
    if (o === undefined) { findings.push(`[${t.label}] ${key} : ABSENT du JSON (décomp="${name}")`); continue; }
    checked++;
    if (o !== name) findings.push(`[${t.label}] ${key} : json="${o}" ≠ décomp="${name}"`);
  }
  total += n; checkedTotal += checked;
  console.log(`  ${t.label.padEnd(10)} : ${checked} noms comparés (décomp ${n})`);
}

console.log(`Noms FR comparés : ${checkedTotal}`);
if (findings.length === 0) { console.log('✅ noms FR (capacités/talents/natures) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de nom FR :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

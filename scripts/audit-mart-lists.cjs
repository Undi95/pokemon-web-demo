#!/usr/bin/env node
/**
 * audit-mart-lists.cjs — ORACLE de fidélité des INVENTAIRES de boutiques.
 *
 * Confronte `public/decomp/em/mart-lists.json` (= ce que chaque Poké Mart / boutique
 * déco vend, lu par le menu d'achat) au décomp : re-parse INDÉPENDAMMENT les blocs
 * `<Label>: .2byte X … pokemartlistend` des `data/maps/<*>/scripts.inc`. Comparaison
 * ORDONNÉE (l'ordre = l'affichage en boutique). Tout écart = boutique fausse.
 *
 *   node scripts/audit-mart-lists.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAPS_DIR = 'D:/Projet 1/decomps/pokeemeraude/data/maps';
const JSON_F = path.join(ROOT, 'public/decomp/em/mart-lists.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));

// Récupère tous les scripts.inc sous data/maps/
const incFiles = [];
for (const entry of fs.readdirSync(MAPS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const p = path.join(MAPS_DIR, entry.name, 'scripts.inc');
  if (fs.existsSync(p)) incFiles.push(p);
}

// Parse chaque bloc <Label>: ( .2byte X )+ pokemartlistend
const decomp = {};
for (const f of incFiles) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/^(\w+):\s*\n((?:\s*\.2byte\s+\w+\s*\n)+?)\s*pokemartlistend/gm)) {
    const label = m[1];
    const items = [...m[2].matchAll(/\.2byte\s+(\w+)/g)].map((x) => x[1]);
    decomp[label] = items;
  }
}

const findings = [];
let checked = 0;
for (const label of Object.keys(decomp)) {
  const o = ours[label];
  if (!o) { findings.push(`${label} : ABSENT de mart-lists.json (décomp = ${decomp[label].length} items)`); continue; }
  checked++;
  const d = decomp[label];
  if (o.length !== d.length) { findings.push(`${label} : nb items json=${o.length} ≠ décomp=${d.length}`); continue; }
  for (let i = 0; i < d.length; i++) if (d[i] !== o[i]) findings.push(`${label}[${i}] : json=${o[i]} ≠ décomp=${d[i]}`);
}
for (const label of Object.keys(ours)) if (!decomp[label]) findings.push(`${label} : dans mart-lists.json mais ABSENT du décomp`);

console.log(`Listes de boutique décomp : ${Object.keys(decomp).length} · comparées : ${checked} · (notre JSON : ${Object.keys(ours).length})`);
if (findings.length === 0) { console.log('✅ mart-lists.json FIDÈLE au décomp (inventaires de boutique, ordre inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'inventaire de boutique :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

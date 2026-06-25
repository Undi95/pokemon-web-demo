#!/usr/bin/env node
/**
 * audit-item-balls.cjs — ORACLE de fidélité des OBJETS de TERRAIN (item balls visibles).
 *
 * Confronte `public/decomp/em/item-balls.json` (objet trouvable + quantité par script
 * d'item-ball) au décomp `data/scripts/item_ball_scripts.inc` (format
 * `<Label>:: finditem ITEM_X[, N] ; end`). Vérifie les item-balls VISIBLES. Les objets
 * cachés (finditem_underfoot, dans les map.json) sont une autre source → comptés à part.
 *
 *   node scripts/audit-item-balls.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const INC = path.join(DECOMP, 'data/scripts/item_ball_scripts.inc');
const MAPS_DIR = path.join(DECOMP, 'data/maps');
const JSON_F = path.join(ROOT, 'public/decomp/em/item-balls.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));

// Sources : item_ball_scripts.inc (centralisé) + tous les data/maps/*/scripts.inc
// (l'extracteur scanne TOUS les .inc → ex. la CS Plongée de Steven à Mossdeep).
const sources = [fs.readFileSync(INC, 'utf8')];
for (const e of fs.readdirSync(MAPS_DIR, { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  const p = path.join(MAPS_DIR, e.name, 'scripts.inc');
  if (fs.existsSync(p)) sources.push(fs.readFileSync(p, 'utf8'));
}

// Parse <Label>:: finditem ITEM_X[, N]
const decomp = {};
for (const src of sources)
  for (const m of src.matchAll(/(\w+)::\s*\n\s*finditem\s+(ITEM_[A-Z0-9_]+)(?:\s*,\s*(\d+))?/g))
    decomp[m[1]] = { item: m[2], quantity: m[3] ? Number(m[3]) : 1 };

const findings = [];
let checked = 0;
for (const label of Object.keys(decomp)) {
  const o = ours[label];
  if (!o) { findings.push(`${label} : ABSENT de item-balls.json (décomp = ${decomp[label].item})`); continue; }
  checked++;
  const d = decomp[label];
  if (o.item !== d.item) findings.push(`${label}.item : json=${o.item} ≠ décomp=${d.item}`);
  if (Number(o.quantity) !== d.quantity) findings.push(`${label}.quantity : json=${o.quantity} ≠ décomp=${d.quantity}`);
  if (o.hidden === true) findings.push(`${label}.hidden : json=true mais c'est un item-ball VISIBLE (finditem)`);
}
const hiddenInOurs = Object.values(ours).filter((e) => e.hidden === true).length;
const extraVisible = Object.keys(ours).filter((l) => !decomp[l] && ours[l].hidden !== true).length;

console.log(`Item-balls visibles décomp : ${Object.keys(decomp).length} · comparés : ${checked} · (notre JSON : ${Object.keys(ours).length}, dont cachés : ${hiddenInOurs})`);
if (extraVisible) console.log(`  ⚠️ ${extraVisible} entrée(s) visible(s) dans notre JSON sans script .inc correspondant`);
if (findings.length === 0) { console.log('✅ item-balls.json FIDÈLE au décomp item_ball_scripts.inc (objet/quantité des item-balls visibles).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'item-ball :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

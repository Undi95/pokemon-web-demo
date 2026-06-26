#!/usr/bin/env node
/**
 * audit-item-icons.cjs — ORACLE de fidélité des ICÔNES d'OBJETS.
 *
 * Confronte nos icônes d'objets `public/decomp/em/items/icons/*.{png,pal}` (l'image de
 * chaque objet, affichée au sac / à la boutique / en sélection) au décomp
 * `graphics/items/icons/`. Byte-exact. Tout écart = mauvaise icône d'objet.
 *
 *   node scripts/audit-item-icons.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUR = path.join(ROOT, 'public/decomp/em/items/icons');
const DEC = 'D:/Projet 1/decomps/pokeemeraude/graphics/items/icons';

const findings = [];
let checked = 0;
for (const f of fs.readdirSync(OUR)) {
  if (!/\.(png|pal)$/.test(f)) continue;
  const dp = path.join(DEC, f);
  if (!fs.existsSync(dp)) { findings.push(`${f} : absent du décomp`); continue; }
  checked++;
  if (Buffer.compare(fs.readFileSync(path.join(OUR, f)), fs.readFileSync(dp)) !== 0) findings.push(`${f} : DIFFÈRE (octets) du décomp`);
}

console.log(`Icônes d'objets comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ icônes d\'objets FIDÈLES au décomp (items/icons byte-exact).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'icône d'objet :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

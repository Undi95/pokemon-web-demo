#!/usr/bin/env node
/**
 * audit-tilesets.cjs — ORACLE de fidélité des TILESETS (structure + attributs + couleurs).
 *
 * Confronte les binaires de copie directe de chaque tileset
 * (`public/decomp/em/tilesets/<.../>{metatiles.bin, metatile_attributes.bin,
 * palettes/*.gbapal}`) au décomp `data/tilesets/`. metatiles.bin = quelles tuiles
 * composent chaque métatuile ; metatile_attributes.bin = comportement (MB_*) + couche
 * de chaque métatuile (= ce qui fait qu'une case est « herbe haute » vs « mur ») ;
 * .gbapal = palettes. Byte-exact. (Les tuiles graphiques anim/*.4bpp sont CONVERTIES,
 * hors scope = domaine gfx-verifier.) Tout écart = tileset au mauvais rendu/comportement.
 *
 *   node scripts/audit-tilesets.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUR = path.join(ROOT, 'public/decomp/em/tilesets');
const DEC = 'D:/Projet 1/decomps/pokeemeraude/data/tilesets';

const findings = [];
let checked = 0, tilesets = 0;

const isDirectCopy = (rel) => /(metatiles|metatile_attributes)\.bin$/.test(rel) || /palettes[\\/][^\\/]+\.gbapal$/.test(rel);

const walk = (rel) => {
  const ourDir = path.join(OUR, rel);
  for (const e of fs.readdirSync(ourDir)) {
    const r = path.join(rel, e);
    if (fs.statSync(path.join(OUR, r)).isDirectory()) { if (e === 'metatile_attributes.bin') {} walk(r); continue; }
    if (!isDirectCopy(r)) continue;
    const dp = path.join(DEC, r);
    if (!fs.existsSync(dp)) { findings.push(`${r} : absent du décomp`); continue; }
    checked++;
    if (Buffer.compare(fs.readFileSync(path.join(OUR, r)), fs.readFileSync(dp)) !== 0) findings.push(`${r} : DIFFÈRE (octets) du décomp`);
  }
};

for (const sub of ['primary', 'secondary']) {
  if (!fs.existsSync(path.join(OUR, sub))) continue;
  for (const ts of fs.readdirSync(path.join(OUR, sub))) {
    if (fs.statSync(path.join(OUR, sub, ts)).isDirectory()) { tilesets++; walk(path.join(sub, ts)); }
  }
}

console.log(`Tilesets : ${tilesets} · fichiers structurels comparés (metatiles/attributs/palettes) : ${checked}`);
if (findings.length === 0) { console.log('✅ tilesets FIDÈLES au décomp (metatiles.bin + metatile_attributes.bin byte-exact (palettes stockées hors-tileset)).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de tileset :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

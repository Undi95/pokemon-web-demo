#!/usr/bin/env node
/**
 * audit-layouts.cjs — ORACLE de fidélité des LAYOUTS (plans physiques des cartes).
 *
 * Confronte `public/decomp/em/layouts-index.json` (métadonnées : dimensions, tilesets,
 * chemins) + les tilemaps binaires `layouts/<Layout>/{blockdata,border}.bin` (la grille
 * de métatuiles réelle = ce qui est dessiné et walkable à chaque case) au décomp
 * `data/layouts/layouts.json` + ses .bin. Tout écart = carte au mauvais plan / collision.
 *
 *   node scripts/audit-layouts.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const OUR_BIN = path.join(ROOT, 'public/decomp/em/layouts');

const ours = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/layouts-index.json'), 'utf8')).layouts;
const dec = JSON.parse(fs.readFileSync(path.join(DECOMP, 'data/layouts/layouts.json'), 'utf8')).layouts;

const oursById = {};
for (const l of ours) oursById[l.id] = l;

const META = ['name', 'width', 'height', 'primary_tileset', 'secondary_tileset', 'border_filepath', 'blockdata_filepath'];
const findings = [];
let checkedMeta = 0, checkedBin = 0;
for (const d of dec) {
  const o = oursById[d.id];
  if (!o) { findings.push(`${d.id} : ABSENT de layouts-index.json`); continue; }
  checkedMeta++;
  for (const f of META) if (d[f] !== undefined && String(d[f]) !== String(o[f])) findings.push(`${d.id}.${f} : json=${JSON.stringify(o[f])} ≠ décomp=${JSON.stringify(d[f])}`);
  // tilemaps binaires
  if (!d.name) continue;
  const dirName = d.name.replace(/_Layout$/, '');
  for (const fld of ['blockdata_filepath', 'border_filepath']) {
    const rel = d[fld]; if (!rel) continue;
    const decP = path.join(DECOMP, rel);
    const ourP = path.join(OUR_BIN, dirName, path.basename(rel));
    if (!fs.existsSync(decP)) continue;
    if (!fs.existsSync(ourP)) { findings.push(`${d.id} : .bin manquant (${path.basename(rel)})`); continue; }
    checkedBin++;
    if (Buffer.compare(fs.readFileSync(ourP), fs.readFileSync(decP)) !== 0) findings.push(`${d.id} : ${path.basename(rel)} DIFFÈRE (octets) du décomp`);
  }
}

console.log(`Layouts décomp : ${dec.length} · métadonnées comparées : ${checkedMeta} · tilemaps .bin comparés : ${checkedBin}`);
if (findings.length === 0) { console.log('✅ layouts FIDÈLES au décomp (métadonnées + tilemaps blockdata/border byte-exact).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de layout :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

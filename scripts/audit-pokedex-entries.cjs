#!/usr/bin/env node
/**
 * audit-pokedex-entries.cjs — ORACLE de fidélité des ENTRÉES de Pokédex.
 *
 * Confronte `public/decomp/em/pokedex-entries.json` (catégorie FR / taille / poids /
 * clé de description, affichés dans le Pokédex) au décomp `pokedex_entries.h`
 * (gPokedexEntries[], keyé NATIONAL_DEX_*). Map NATIONAL_DEX_<NOM> → SPECIES_<NOM>.
 * Tout écart = fiche Pokédex fausse (mauvaise catégorie/taille/poids).
 *
 *   node scripts/audit-pokedex-entries.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/pokedex_entries.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/pokedex-entries.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

const decomp = {};
for (const m of src.matchAll(/\[NATIONAL_DEX_([A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g)) {
  const sp = 'SPECIES_' + m[1], body = m[2];
  const f = (re) => { const x = body.match(re); return x ? x[1] : undefined; };
  decomp[sp] = {
    category: f(/\.categoryName\s*=\s*_\("([^"]*)"\)/),
    height: f(/\.height\s*=\s*(\d+)/),
    weight: f(/\.weight\s*=\s*(\d+)/),
    descriptionKey: f(/\.description\s*=\s*(g[A-Za-z0-9_]+)/),
  };
}

const findings = [];
let checked = 0;
for (const sp of Object.keys(decomp)) {
  const o = ours[sp];
  if (!o) { findings.push(`${sp} : ABSENT de pokedex-entries.json`); continue; }
  checked++;
  const d = decomp[sp];
  for (const fld of ['category', 'height', 'weight', 'descriptionKey']) {
    if (d[fld] !== undefined && String(d[fld]) !== String(o[fld])) findings.push(`${sp}.${fld} : json=${JSON.stringify(o[fld])} ≠ décomp=${JSON.stringify(d[fld])}`);
  }
}

console.log(`Entrées Pokédex décomp : ${Object.keys(decomp).length} · comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ pokedex-entries.json FIDÈLE au décomp pokedex_entries.h (catégorie/taille/poids/clé-description).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'entrée Pokédex :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

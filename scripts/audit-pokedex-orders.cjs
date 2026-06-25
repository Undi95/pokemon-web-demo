#!/usr/bin/env node
/**
 * audit-pokedex-orders.cjs — ORACLE de fidélité des ORDRES DE TRI du Pokédex.
 *
 * Confronte `public/decomp/em/pokedex-orders.json` (ordres de tri Alphabétique/Poids/
 * Taille du Pokédex) au décomp `gPokedexOrder_{Alphabetical,Weight,Height}[]`
 * (pokedex_orders.h). Comparaison ORDONNÉE (l'ordre EST la donnée). Tout écart = tri
 * Pokédex faux.
 *
 *   node scripts/audit-pokedex-orders.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/pokedex_orders.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/pokedex-orders.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

// Parse chaque gPokedexOrder_<Nom>[] = { NATIONAL_DEX_*, … };
const decomp = {};
for (const m of src.matchAll(/gPokedexOrder_(\w+)\[\]\s*=\s*\{([\s\S]*?)\};/g)) {
  decomp[m[1]] = [...m[2].matchAll(/NATIONAL_DEX_[A-Z0-9_]+/g)].map((x) => x[0]);
}

const findings = [];
let checked = 0;
for (const name of Object.keys(decomp)) {
  const o = ours[name];
  if (!o) { findings.push(`${name} : ABSENT de pokedex-orders.json (décomp = ${decomp[name].length})`); continue; }
  checked++;
  const d = decomp[name];
  if (o.length !== d.length) { findings.push(`${name} : longueur json=${o.length} ≠ décomp=${d.length}`); continue; }
  let diffs = 0;
  for (let i = 0; i < d.length; i++) if (d[i] !== o[i]) { if (diffs < 5) findings.push(`${name}[${i}] : json=${o[i]} ≠ décomp=${d[i]}`); diffs++; }
  if (diffs >= 5) findings.push(`${name} : … +${diffs - 5} autres écarts`);
}

console.log(`Ordres Pokédex décomp : ${Object.keys(decomp).length} · comparés : ${checked} · (entrées : ${Object.values(decomp).map((a) => a.length).join('/')})`);
if (findings.length === 0) { console.log('✅ pokedex-orders.json FIDÈLE au décomp (tris Alphabétique/Poids/Taille, ordre 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'ordre Pokédex :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

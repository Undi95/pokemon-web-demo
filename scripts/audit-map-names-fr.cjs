#!/usr/bin/env node
/**
 * audit-map-names-fr.cjs — ORACLE de fidélité des NOMS DE LIEUX FR.
 *
 * Confronte `public/decomp/em/map-names-fr.json` (nom FR de chaque secteur de carte,
 * affiché à l'entrée d'une zone / sur la carte de Hoenn) au décomp
 * `src/data/region_map/region_map_sections.json` (map_sections[].name). Tout écart =
 * mauvais nom de lieu affiché.
 *
 *   node scripts/audit-map-names-fr.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_JSON = 'D:/Projet 1/decomps/pokeemeraude/src/data/region_map/region_map_sections.json';
const JSON_F = path.join(ROOT, 'public/decomp/em/map-names-fr.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const sections = JSON.parse(fs.readFileSync(DECOMP_JSON, 'utf8')).map_sections;

const findings = [];
let checked = 0;
for (const s of sections) {
  if (!s.name) continue;                              // secteur sans nom
  const o = ours[s.id];
  if (o === undefined) { findings.push(`${s.id} : ABSENT de map-names-fr.json (décomp="${s.name}")`); continue; }
  checked++;
  if (o !== s.name) findings.push(`${s.id} : json="${o}" ≠ décomp="${s.name}"`);
}

console.log(`Secteurs de carte décomp : ${sections.length} · noms comparés : ${checked}`);
if (findings.length === 0) { console.log('✅ map-names-fr.json FIDÈLE au décomp region_map_sections.json (noms de lieux FR).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de nom de lieu :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

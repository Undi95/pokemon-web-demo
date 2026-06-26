#!/usr/bin/env node
/**
 * audit-map-movement-type-references.cjs — ORACLE des movement_type des PNJ de map.
 *
 * Chaque object_event d'une map a un `movement_type` (MOVEMENT_TYPE_*) qui décide de son
 * comportement (face fixe / regarde autour / erre / patrouille…). Le décomp définit l'ensemble
 * CANONIQUE de ces types dans `include/constants/event_object_movement.h` (81 valeurs). Si une
 * map référence un movement_type HORS de ce canon, c'est un type inexistant → corruption
 * d'extraction / faute de frappe → PNJ au comportement indéfini.
 *
 * Cet oracle confronte tout movement_type utilisé dans les 518 maps au canon décomp → garde
 * anti-dérive (même famille que audit-map-warp/graphics/script-references : membership d'une
 * référence de map à un ensemble canonique). NB : c'est un contrôle de MEMBERSHIP au canon, pas
 * un contrôle de la couverture des handlers du port (les types non-encore-portés = dette de
 * feature, hors périmètre solo — pas un écart de fidélité de la donnée).
 *
 *   node scripts/audit-map-movement-type-references.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

const hdr = fs.readFileSync(path.join(DECOMP, 'include/constants/event_object_movement.h'), 'utf8');
const canon = new Set();
for (const m of hdr.matchAll(/^\s*#define\s+(MOVEMENT_TYPE_[A-Z0-9_]+)\s+/gm)) canon.add(m[1]);

const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
const used = new Map(); // movement_type -> {count, map}
const files = fs.readdirSync(mapsDir).filter((f) => f.endsWith('.json'));
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')); } catch { continue; }
  for (const oe of j.object_events || []) {
    const m = oe.movement_type;
    if (typeof m !== 'string') continue;
    if (!used.has(m)) used.set(m, { c: 0, m: f.replace('.json', '') });
    used.get(m).c++;
  }
}

const findings = [];
let checked = 0;
for (const [mt, info] of [...used.entries()].sort()) {
  checked++;
  if (!canon.has(mt))
    findings.push(`${mt} : movement_type (×${info.c}, map ${info.m}) HORS du canon décomp → type inexistant`);
}

console.log(`movement_type PNJ confrontés : ${checked} distincts (${files.length} maps) vs ${canon.size} types canoniques décomp.`);
if (findings.length === 0) { console.log('✅ Tout movement_type de map appartient au canon décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

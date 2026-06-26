#!/usr/bin/env node
/**
 * audit-map-graphics-references.cjs — ORACLE des graphics_id des PNJ de map.
 *
 * Chaque object_event d'une map a un `graphics_id` (OBJ_EVENT_GFX_*) qui désigne son sprite. Si le
 * graphics_id n'est PAS un sprite connu (object-event-graphics.json), le PNJ n'a pas de sprite. Cet
 * oracle confronte tout graphics_id STATIQUE utilisé dans les 518 maps à la table de graphics du port.
 *
 * Exclus (résolus hors table de graphics statique, légitimement) :
 *   - OBJ_EVENT_GFX_VAR_0..F : graphics DYNAMIQUES, résolus au runtime via VAR_OBJ_GFX_ID_*
 *     (Battle Frontier / Contest / Secret Base / PNJ paramétrés).
 *   - OBJ_EVENT_GFX_BERRY_TREE : sprite géré par la factory d'arbres à baies (stade/baie dynamiques),
 *     pas un sprite statique (cf. audit-object-event-graphics qui skip les baies = factories TS).
 *
 *   node scripts/audit-map-graphics-references.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const tbl = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/object-event-graphics.json'), 'utf8'))));
const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
const isDynamic = (g) => /^OBJ_EVENT_GFX_VAR_[0-9A-F]$/.test(g) || g === 'OBJ_EVENT_GFX_BERRY_TREE';

const used = new Map();
const files = fs.readdirSync(mapsDir).filter((f) => f.endsWith('.json'));
for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')); } catch { continue; }
  for (const oe of j.object_events || []) {
    const g = oe.graphics_id;
    if (typeof g !== 'string' || isDynamic(g)) continue;
    if (!used.has(g)) used.set(g, { c: 0, m: f.replace('.json', '') });
    used.get(g).c++;
  }
}

const findings = [];
let checked = 0;
for (const [g, info] of [...used.entries()].sort()) {
  checked++;
  if (!tbl.has(g)) findings.push(`${g} : graphics_id PNJ (×${info.c}, map ${info.m}) ABSENT de la table → PNJ sans sprite`);
}

console.log(`graphics_id PNJ confrontés : ${checked} statiques distincts (${files.length} maps) vs ${tbl.size} graphics définis (VAR_*/BERRY_TREE dynamiques exclus).`);
if (findings.length === 0) { console.log('✅ Tout graphics_id statique de PNJ est un sprite défini.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

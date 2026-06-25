#!/usr/bin/env node
/**
 * audit-object-event-graphics.cjs — ORACLE de fidélité des sprites d'OBJECT-EVENTS (PNJ).
 *
 * Confronte `public/decomp/em/object-event-graphics.json` (dimensions de frame de chaque
 * sprite d'object-event : PNJ, item balls, panneaux…) au décomp : croise
 * object_event_graphics_info.h (`gObjectEventGraphicsInfo_<Nom> { .width, .height }`) +
 * object_event_graphics_info_pointers.h (`[OBJ_EVENT_GFX_X] = &gObjectEventGraphicsInfo_<Nom>`).
 * Tout écart = sprite de PNJ aux mauvaises dimensions (rendu cassé).
 *
 *   node scripts/audit-object-event-graphics.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = 'D:/Projet 1/decomps/pokeemeraude/src/data/object_events';
const JSON_F = path.join(ROOT, 'public/decomp/em/object-event-graphics.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const infoSrc = fs.readFileSync(path.join(DIR, 'object_event_graphics_info.h'), 'utf8');
const ptrSrc = fs.readFileSync(path.join(DIR, 'object_event_graphics_info_pointers.h'), 'utf8');

// struct → {width, height}
const structs = {};
for (const m of infoSrc.matchAll(/(gObjectEventGraphicsInfo_\w+)\s*=\s*\{([\s\S]*?)\n\};/g)) {
  const body = m[2];
  const f = (re) => { const x = body.match(re); return x ? Number(x[1]) : undefined; };
  structs[m[1]] = { width: f(/\.width\s*=\s*(\d+)/), height: f(/\.height\s*=\s*(\d+)/) };
}

// OBJ_EVENT_GFX_X → struct
const ptr = {};
for (const m of ptrSrc.matchAll(/\[(OBJ_EVENT_GFX_[A-Z0-9_]+)\]\s*=\s*&(gObjectEventGraphicsInfo_\w+)/g)) ptr[m[1]] = m[2];

// Cas spéciaux : composés dynamiquement par stade (npc-loader.ts:109), absents du JSON
// standard {png,frameWidth,frameHeight} → factories TS dédiées (build_*BerryTree).
const SPECIAL = new Set(['OBJ_EVENT_GFX_BERRY_TREE', 'OBJ_EVENT_GFX_BERRY_TREE_EARLY_STAGES', 'OBJ_EVENT_GFX_BERRY_TREE_LATE_STAGES']);

const findings = [];
const special = [];
let checked = 0;
for (const gfx of Object.keys(ptr)) {
  const st = structs[ptr[gfx]];
  if (!st) { findings.push(`${gfx} : struct ${ptr[gfx]} introuvable`); continue; }
  const o = ours[gfx];
  if (!o) { if (SPECIAL.has(gfx)) { special.push(gfx); continue; } findings.push(`${gfx} : ABSENT de object-event-graphics.json`); continue; }
  checked++;
  if (st.width !== undefined && st.width !== o.frameWidth) findings.push(`${gfx}.width : json=${o.frameWidth} ≠ décomp=${st.width}`);
  if (st.height !== undefined && st.height !== o.frameHeight) findings.push(`${gfx}.height : json=${o.frameHeight} ≠ décomp=${st.height}`);
}

console.log(`Sprites object-event pointés : ${Object.keys(ptr).length} · comparés : ${checked}` + (special.length ? ` · spéciaux (factories TS) skip : ${special.length}` : ''));
if (findings.length === 0) { console.log('✅ object-event-graphics.json FIDÈLE au décomp (dimensions de frame des sprites 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de sprite object-event :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-doors.cjs — ORACLE de fidélité des PORTES (animation/son par métatuile de porte).
 *
 * Confronte `public/decomp/em/doors.json` (par métatuile de porte : son d'ouverture,
 * taille, jeu de tuiles + palette d'animation) au décomp `sDoorAnimGraphicsTable`
 * (field_door.c, `{METATILE_X, DOOR_SOUND_Y, size, sDoorAnimTiles_Z, sDoorAnimPalettes_W}`).
 * Tout écart = porte au mauvais son/anim.
 *
 *   node scripts/audit-doors.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const C = 'D:/Projet 1/decomps/pokeemeraude/src/field_door.c';
const JSON_F = path.join(ROOT, 'public/decomp/em/doors.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(C, 'utf8');

const start = src.indexOf('sDoorAnimGraphicsTable[]');
const body = src.slice(src.indexOf('{', start), src.indexOf('\n};', start));

const decomp = {};
for (const m of body.matchAll(/\{\s*(METATILE_\w+)\s*,\s*(DOOR_SOUND_\w+)\s*,\s*(\d+)\s*,\s*sDoorAnimTiles_(\w+)\s*,\s*sDoorAnimPalettes_(\w+)\s*\}/g)) {
  decomp[m[1]] = { sound: m[2], size: Number(m[3]), tilesName: m[4], paletteSet: m[5] };
}

const findings = [];
let checked = 0;
for (const mt of Object.keys(decomp)) {
  const o = ours[mt];
  if (!o) { findings.push(`${mt} : ABSENT de doors.json`); continue; }
  checked++;
  const d = decomp[mt];
  if (o.sound !== d.sound) findings.push(`${mt}.sound : json=${o.sound} ≠ décomp=${d.sound}`);
  if (Number(o.size) !== d.size) findings.push(`${mt}.size : json=${o.size} ≠ décomp=${d.size}`);
  if (o.tilesName !== d.tilesName) findings.push(`${mt}.tilesName : json=${o.tilesName} ≠ décomp=${d.tilesName}`);
  if (o.paletteSet !== d.paletteSet) findings.push(`${mt}.paletteSet : json=${o.paletteSet} ≠ décomp=${d.paletteSet}`);
}

console.log(`Portes décomp : ${Object.keys(decomp).length} · comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ doors.json FIDÈLE au décomp sDoorAnimGraphicsTable (son/taille/tuiles/palette par porte).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de porte :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

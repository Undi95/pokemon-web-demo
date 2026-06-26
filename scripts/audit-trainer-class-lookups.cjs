#!/usr/bin/env node
/**
 * audit-trainer-class-lookups.cjs — ORACLE des lookups de classe de dresseur.
 *
 * Deux tables (src/data/pokemon/trainer_class_lookups.h) indexées par FACILITY_CLASS_* :
 *   - gFacilityClassToPicIndex[]    : classe → sprite dresseur (TRAINER_PIC_*) ;
 *   - gFacilityClassToTrainerClass[]: classe → classe de combat (TRAINER_CLASS_*, → nom/argent).
 * Confronte `public/decomp/em/trainer-class-lookups.json` (facilityClassToPic /
 * facilityClassToTrainerClass) au décomp, entrée par entrée (noms de constantes).
 *
 *   node scripts/audit-trainer-class-lookups.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const decompFile = path.join(DECOMP, 'src/data/pokemon/trainer_class_lookups.h');
const jsonFile = path.join(ROOT, 'public/decomp/em/trainer-class-lookups.json');

const txt = fs.readFileSync(decompFile, 'utf8');
function parseTable(marker) {
  const start = txt.indexOf(marker);
  if (start < 0) return null;
  const region = txt.slice(start, start + txt.slice(start).indexOf('};'));
  const map = {};
  for (const m of region.matchAll(/\[(FACILITY_CLASS_\w+)\]\s*=\s*(\w+)\s*,/g)) map[m[1]] = m[2];
  return map;
}
const decompPic = parseTable('gFacilityClassToPicIndex[]');
const decompCls = parseTable('gFacilityClassToTrainerClass[]');
if (!decompPic || !decompCls) { console.log('❌ table(s) introuvable(s) dans le décomp.'); process.exit(1); }

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
const findings = [];
let checked = 0;
function confront(label, decompMap, jsonMap) {
  jsonMap = jsonMap || {};
  for (const k of Object.keys(decompMap)) {
    checked++;
    if (!(k in jsonMap)) { findings.push(`[${label}] ${k} : absent du JSON (décomp=${decompMap[k]})`); continue; }
    if (jsonMap[k] !== decompMap[k]) findings.push(`[${label}] ${k} : JSON=${jsonMap[k]} · décomp=${decompMap[k]}`);
  }
  for (const k of Object.keys(jsonMap)) if (!(k in decompMap)) findings.push(`[${label}] ${k} : dans le JSON mais ABSENT du décomp`);
}
confront('pic', decompPic, json.facilityClassToPic);
confront('class', decompCls, json.facilityClassToTrainerClass);

console.log(`Lookups de classe confrontés : ${checked} (pic ${Object.keys(decompPic).length} + class ${Object.keys(decompCls).length}).`);
if (findings.length === 0) { console.log('✅ gFacilityClassToPicIndex / gFacilityClassToTrainerClass FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 50)) console.log('  ' + f);
process.exit(1);

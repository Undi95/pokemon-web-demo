#!/usr/bin/env node
/**
 * audit-heal-locations.cjs — ORACLE de fidélité des LIEUX DE SOIN / points de respawn.
 *
 * Confronte notre `src/heal_location.ts` (sHealLocations, hand-codé : où le joueur
 * réapparaît au whiteout / atterrit en Vol) au décomp `src/data/heal_locations.json`.
 * Compare id/map/x/y en ordre. Tout écart = mauvais respawn / destination de Vol.
 *
 *   node scripts/audit-heal-locations.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TS_F = path.join(ROOT, 'src/heal_location.ts');
const DECOMP_JSON = 'D:/Projet 1/decomps/pokeemeraude/src/data/heal_locations.json';

const tsSrc = fs.readFileSync(TS_F, 'utf8');
const decomp = JSON.parse(fs.readFileSync(DECOMP_JSON, 'utf8')).heal_locations;

// Parse les entrées { id: '…', map: '…', x: N, y: N } du TS
const ours = [];
for (const m of tsSrc.matchAll(/\{\s*id:\s*'([^']+)',\s*map:\s*'([^']+)',\s*x:\s*(\d+),\s*y:\s*(\d+)\s*\}/g)) {
  ours.push({ id: m[1], map: m[2], x: Number(m[3]), y: Number(m[4]) });
}

const findings = [];
if (ours.length !== decomp.length) findings.push(`nb lieux : ts=${ours.length} ≠ décomp=${decomp.length}`);
const n = Math.min(ours.length, decomp.length);
for (let i = 0; i < n; i++) {
  const o = ours[i], d = decomp[i];
  for (const f of ['id', 'map', 'x', 'y']) {
    if (String(o[f]) !== String(d[f])) findings.push(`[${i}].${f} : ts=${JSON.stringify(o[f])} ≠ décomp=${JSON.stringify(d[f])}`);
  }
}

console.log(`Lieux de soin décomp : ${decomp.length} · ts : ${ours.length}`);
if (findings.length === 0) { console.log('✅ heal_location.ts FIDÈLE au décomp heal_locations.json (id/map/x/y, ordre inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de lieu de soin :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

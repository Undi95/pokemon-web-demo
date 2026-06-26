#!/usr/bin/env node
/**
 * audit-safari-factors.cjs — ORACLE des facteurs de capture/fuite du Parc Safari.
 *
 * Confronte 3 tables hand-codées (battle_util.ts) au décomp (battle_util.c:52-76) :
 *   - sPkblToEscapeFactor[5][3] : lance-compteur × message (curious/enthralled/ignored) →
 *     baisse du facteur de fuite quand on jette un POKéBLOCK.
 *   - sGoNearCounterToCatchFactor[4] = {4,3,2,1} : hausse du facteur de capture (s'approcher).
 *   - sGoNearCounterToEscapeFactor[4] = {4,4,4,4} : hausse du facteur de fuite (s'approcher).
 * Ces facteurs pilotent la proba d'attraper/voir fuir un Pokémon au Parc Safari (appât/rocher).
 * Tables de NOMBRES purs ⇒ confrontation des séquences d'entiers.
 *
 *   node scripts/audit-safari-factors.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_util.c';
const OURS = path.join(ROOT, 'src/battle_util.ts');

const cSrc = fs.readFileSync(DECOMP, 'utf8');
const tsSrc = fs.readFileSync(OURS, 'utf8');

function nums(src, marker, open, close) {
  const a = src.indexOf(marker);
  const eq = src.indexOf('=', a);   // l'ouverture du tableau suit le `=` (évite le `[` du type `number[]`)
  const oi = src.indexOf(open, eq);
  const body = src.slice(oi, src.indexOf(close, oi))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return [...body.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

const findings = [];
function cmp(label, c, t, expLen) {
  if (c.length !== expLen) findings.push(`${label} : décomp ${c.length} entiers (attendu ${expLen})`);
  if (t.length !== expLen) findings.push(`${label} : ours ${t.length} entiers (attendu ${expLen})`);
  const n = Math.min(c.length, t.length);
  for (let i = 0; i < n; i++) if (c[i] !== t[i]) findings.push(`${label}[${i}] : décomp=${c[i]} ours=${t[i]}`);
}

cmp('sPkblToEscapeFactor',
  nums(cSrc, 'sPkblToEscapeFactor[][3]', '{', '\n};'),
  nums(tsSrc, 'const sPkblToEscapeFactor', '[', '];'), 15);
cmp('sGoNearCounterToCatchFactor',
  nums(cSrc, 'sGoNearCounterToCatchFactor[]', '{', '}'),
  nums(tsSrc, 'const sGoNearCounterToCatchFactor', '[', ']'), 4);
cmp('sGoNearCounterToEscapeFactor',
  nums(cSrc, 'sGoNearCounterToEscapeFactor[]', '{', '}'),
  nums(tsSrc, 'const sGoNearCounterToEscapeFactor', '[', ']'), 4);

console.log('Facteurs Safari : sPkblToEscapeFactor (15) + catch (4) + escape (4)');
if (findings.length === 0) { console.log('✅ Facteurs Safari (capture/fuite appât/rocher/pokéblock) FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

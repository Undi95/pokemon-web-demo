#!/usr/bin/env node
/**
 * audit-pokeblock-flavor.cjs — ORACLE de la table de compatibilité NATURE×SAVEUR.
 *
 * Confronte `gPokeblockFlavorCompatibilityTable` (src/engine/battle/data/flavor-compat.ts) au
 * décomp `gPokeblockFlavorCompatibilityTable[NUM_NATURES * FLAVOR_COUNT]` (pokeblock.c:136).
 * 125 valeurs s8 (-1 dislike / 0 neutral / +1 like), indexées nature×5 + saveur. Pilote :
 *   - les baies CONFUSE_FOOD (Figy/Wiki/Mago/Aguav/Iapapa) → confusion si la nature déteste,
 *   - le gain de stat concours via Pokéblock.
 * Une valeur fausse = confusion/contest faux pour une nature.
 *
 *   node scripts/audit-pokeblock-flavor.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/pokeblock.c';
const OURS = path.join(ROOT, 'src/engine/battle/data/flavor-compat.ts');

/** Extrait les entiers de la 1re accolade `{…}`/`[…]` après le marqueur, commentaires retirés
 *  (nos commentaires `// 0 Hardy` contiennent l'index nature → fausseraient le parse). */
function parseInts(src, marker, open, close) {
  const start = src.indexOf(marker);
  const a = src.indexOf(open, start + marker.length);  // après le marqueur (qui peut contenir `[]`)
  const b = src.indexOf(close, a);
  const body = src.slice(a + 1, b).replace(/\/\/[^\n]*/g, '');  // strip line comments
  return [...body.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
}

const decomp = parseInts(fs.readFileSync(DECOMP, 'utf8'), 'gPokeblockFlavorCompatibilityTable[NUM_NATURES', '{', '}');
const ours = parseInts(fs.readFileSync(OURS, 'utf8'), 'gPokeblockFlavorCompatibilityTable: number[]', '[', ']');

const NATURES = ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed',
  'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet',
  'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'];
const FLAVORS = ['Spicy', 'Dry', 'Sweet', 'Bitter', 'Sour'];

const findings = [];
if (decomp.length !== 125) findings.push(`décomp : ${decomp.length} valeurs (≠125)`);
if (ours.length !== 125) findings.push(`ours : ${ours.length} valeurs (≠125)`);
const n = Math.min(decomp.length, ours.length);
for (let i = 0; i < n; i++) {
  if (decomp[i] !== ours[i]) {
    const nat = NATURES[Math.floor(i / 5)] ?? `nature${Math.floor(i / 5)}`;
    const fl = FLAVORS[i % 5] ?? `flavor${i % 5}`;
    findings.push(`[${i}] ${nat}/${fl} : décomp=${decomp[i]} ours=${ours[i]}`);
  }
}

console.log(`Table nature×saveur : décomp=${decomp.length} · ours=${ours.length} valeurs (attendu 125)`);
if (findings.length === 0) { console.log('✅ gPokeblockFlavorCompatibilityTable FIDÈLE au décomp (125 valeurs nature×saveur 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

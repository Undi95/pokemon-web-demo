#!/usr/bin/env node
/**
 * audit-berry-data.cjs — ORACLE de fidélité de la table des BAIES.
 *
 * Confronte `gBerries[]` (src/berry.ts) au décomp `gBerries[]` (berry.c:115). Cette table
 * pilote : la CULTURE de baies (`stageDuration` = durée par stade), les POKÉBLOCKS / CONCOURS
 * (saveurs spicy/dry/sweet/bitter/sour + smoothness), le RENDEMENT (min/maxYield), la taille
 * (record de baie) et la fermeté. Un champ faux = mécanique de baie fausse.
 *
 * Compare les 12 champs LANGUE-INDÉPENDANTS par index BERRY (CHERI=0 … ENIGMA=42) :
 *   firmness (enum), size, maxYield, minYield, stageDuration, spicy, dry, sweet, bitter,
 *   sour, smoothness — + le nom FR (le décomp pokeemeraude est déjà en français).
 *
 *   node scripts/audit-berry-data.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/berry.c';
const OURS = path.join(ROOT, 'src/berry.ts');

const NUM = ['size', 'maxYield', 'minYield', 'stageDuration', 'spicy', 'dry', 'sweet', 'bitter', 'sour', 'smoothness'];

/** Décomp : un bloc par `[ITEM_X_BERRY - FIRST_BERRY_INDEX] = { … }`, dans l'ordre BERRY. */
function parseDecomp(src) {
  const start = src.indexOf('const struct Berry gBerries[]');
  const body = src.slice(start, src.indexOf('\n};', start));
  const out = [];
  const re = /\[ITEM_([A-Z0-9_]+)_BERRY\s*-\s*FIRST_BERRY_INDEX\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const b = m[2];
    const g = (k, pat) => { const x = b.match(pat); return x ? x[1] : undefined; };
    const e = { berry: m[1], name: g('name', /\.name\s*=\s*_\("([^"]*)"\)/), firmness: g('firmness', /\.firmness\s*=\s*(BERRY_FIRMNESS_[A-Z_]+)/) };
    for (const k of NUM) e[k] = Number(g(k, new RegExp('\\.' + k + '\\s*=\\s*(\\d+)')));
    out.push(e);
  }
  return out;
}

/** Notre table : entrées `{ name: "…", firmness: BERRY_FIRMNESS_X, size: N, … }` dans l'ordre. */
function parseOurs(src) {
  const start = src.indexOf('export const gBerries');
  const body = src.slice(start, src.indexOf('\n];', start));
  const out = [];
  const re = /\{\s*name:\s*"([^"]*)",([\s\S]*?)smoothness:\s*(\d+)\s*\}/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const b = m[2];
    const g = (pat) => { const x = b.match(pat); return x ? x[1] : undefined; };
    const e = { name: m[1], firmness: g(/firmness:\s*(BERRY_FIRMNESS_[A-Z_]+)/), smoothness: Number(m[3]) };
    for (const k of NUM) { if (k === 'smoothness') continue; e[k] = Number(g(new RegExp(k + ':\\s*(\\d+)'))); }
    out.push(e);
  }
  return out;
}

const decomp = parseDecomp(fs.readFileSync(DECOMP, 'utf8'));
const ours = parseOurs(fs.readFileSync(OURS, 'utf8'));

const findings = [];
if (decomp.length !== ours.length) findings.push(`longueur : décomp=${decomp.length} ours=${ours.length}`);
const n = Math.min(decomp.length, ours.length);
const FIELDS = ['name', 'firmness', ...NUM];
for (let i = 0; i < n; i++) {
  const d = decomp[i], o = ours[i];
  for (const f of FIELDS) {
    if (d[f] !== o[f]) findings.push(`[${i}] ${d.berry} .${f} : décomp=${d[f]} ours=${o[f]}`);
  }
}

console.log(`Table baies : décomp=${decomp.length} · ours=${ours.length} entrées · 12 champs/baie`);
if (findings.length === 0) { console.log('✅ gBerries FIDÈLE au décomp (fermeté/taille/rendement/durée/saveurs/lissé + nom FR).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

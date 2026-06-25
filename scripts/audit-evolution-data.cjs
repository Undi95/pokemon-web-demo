#!/usr/bin/env node
/**
 * audit-evolution-data.cjs — ORACLE de fidélité DATA des évolutions.
 *
 * Confronte `public/decomp/em/evolutions.json` (= gEvolutionTable en jeu :
 * méthode/param/cible de chaque évolution) au décomp `src/data/pokemon/evolution.h`.
 * Tout écart = évolution cassée (mauvais niveau, mauvaise pierre, mauvaise cible).
 * Le param des EVO_ITEM/EVO_TRADE_ITEM est un constant ITEM_* au décomp mais un id
 * numérique dans notre JSON → résolu via include/constants/items.h (1:1).
 *
 *   node scripts/audit-evolution-data.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const EVO_H = path.join(DECOMP, 'src/data/pokemon/evolution.h');
const ITEMS_H = path.join(DECOMP, 'include/constants/items.h');
const EVO_JSON = path.join(ROOT, 'public/decomp/em/evolutions.json');

const ours = JSON.parse(fs.readFileSync(EVO_JSON, 'utf8'));
const src = fs.readFileSync(EVO_H, 'utf8');

// Résolveur ITEM_X → id numérique (1:1 include/constants/items.h)
const itemId = {};
for (const m of fs.readFileSync(ITEMS_H, 'utf8').matchAll(/^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)/gm)) itemId[m[1]] = Number(m[2]);

// Param : ITEM_* → id, numérique → Number, sinon string brute
const resolveParam = (p) => {
  if (/^ITEM_/.test(p)) { if (!(p in itemId)) throw new Error('ITEM inconnu: ' + p); return itemId[p]; }
  if (/^-?\d+$/.test(p)) return Number(p);
  return p;
};

// Parse chaque `[SPECIES_X] = { ...triples... }` par scan d'accolades appariées.
const decomp = {};
const headRe = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = headRe.exec(src)) !== null) {
  const key = m[1];
  let depth = 1, i = headRe.lastIndex;
  for (; i < src.length && depth > 0; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; }
  const body = src.slice(headRe.lastIndex, i - 1);
  headRe.lastIndex = i;
  const triples = [];
  for (const t of body.matchAll(/\{\s*(EVO_[A-Z_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*(SPECIES_[A-Z0-9_]+)\s*\}/g)) {
    triples.push({ method: t[1], param: resolveParam(t[2]), target: t[3] });
  }
  decomp[key] = triples;
}

const findings = [];
let checked = 0;
for (const key of Object.keys(decomp)) {
  const dEvos = decomp[key];
  const oEvos = ours[key];
  if (!oEvos) { findings.push(`${key} : ABSENT de evolutions.json (décomp a ${dEvos.length} évo)`); continue; }
  checked++;
  if (oEvos.length !== dEvos.length) { findings.push(`${key} : nb évolutions json=${oEvos.length} ≠ décomp=${dEvos.length}`); continue; }
  for (let j = 0; j < dEvos.length; j++) {
    const d = dEvos[j], o = oEvos[j];
    if (d.method !== o.method) findings.push(`${key}[${j}].method : json=${JSON.stringify(o.method)} ≠ décomp=${JSON.stringify(d.method)}`);
    if (String(d.param) !== String(o.param)) findings.push(`${key}[${j}].param : json=${JSON.stringify(o.param)} ≠ décomp=${JSON.stringify(d.param)}`);
    if (d.target !== o.target) findings.push(`${key}[${j}].target : json=${JSON.stringify(o.target)} ≠ décomp=${JSON.stringify(d.target)}`);
  }
}
// Espèces dans notre JSON mais absentes du décomp (= évolution inventée)
for (const key of Object.keys(ours)) if (!decomp[key]) findings.push(`${key} : présent dans evolutions.json mais ABSENT du décomp`);

console.log(`Espèces à évolution (décomp) : ${Object.keys(decomp).length} · comparées : ${checked} · (notre JSON : ${Object.keys(ours).length})`);
if (findings.length === 0) { console.log('✅ evolutions.json FIDÈLE au décomp evolution.h (méthode/param/cible, ordre inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'évolution (= bugs en jeu) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-item-effects-bytes.cjs — ORACLE de fidélité des OCTETS d'effets d'objets.
 *
 * Confronte `public/decomp/em/item-effects-bytes.json` (= source d'usage RUNTIME lue
 * par getItemEffectBytes → bag-item-effects.ts PokemonUseItemEffects : soin/cure/EV/
 * stats/réanimation…) au décomp `gItemEffect_<Nom>[]` (item_effects.h). Résout les
 * expressions de flags ITEMx_* en octets numériques (incl. `((u8) -N)`, ORs, composites).
 * Tout écart = effet d'objet faux en jeu.
 *
 * NB : `public/decomp/em/item-effects.json` ({size,fields}) est une représentation
 * SYMBOLIQUE secondaire (et a un décodage imparfait, ex. Revive byte4 ne montre que
 * ITEM4_REVIVE) — ce n'est PAS la source d'usage. On cible les OCTETS.
 *
 *   node scripts/audit-item-effects-bytes.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const EFFECTS_H = path.join(DECOMP, 'src/data/pokemon/item_effects.h');
const CONST_H = path.join(DECOMP, 'include/constants/item_effects.h');
const BYTES_JSON = path.join(ROOT, 'public/decomp/em/item-effects-bytes.json');

const ours = JSON.parse(fs.readFileSync(BYTES_JSON, 'utf8')).byId;
const effSrc = fs.readFileSync(EFFECTS_H, 'utf8');
const constSrc = fs.readFileSync(CONST_H, 'utf8');

// ── Résolveur de constantes ITEMx_* (#define) ────────────────────────────────
const rawDefs = {};
for (const m of constSrc.matchAll(/^#define\s+(ITEM[0-9]_[A-Z0-9_]+)\s+(.+?)\s*(?:\/\/.*)?$/gm)) rawDefs[m[1]] = m[2].trim();

const resolveToken = (tok) => {
  tok = tok.trim();
  let mm;
  // cast `((u8) -N)` (éventuellement re-parenthésé) AVANT de retirer les parenthèses
  if ((mm = tok.match(/\(u8\)\s*-\s*(\d+)/))) return (256 - Number(mm[1])) & 0xFF;
  tok = tok.replace(/[()]/g, '').trim();
  if ((mm = tok.match(/^(\d+)\s*<<\s*(\d+)$/))) return (Number(mm[1]) << Number(mm[2])) & 0xFF;
  if (/^0x[0-9a-fA-F]+$/.test(tok)) return parseInt(tok, 16) & 0xFF;
  if (/^-?\d+$/.test(tok)) return Number(tok) & 0xFF;
  if (rawDefs[tok] !== undefined) return resolveExpr(rawDefs[tok]);
  throw new Error('token non résolu : ' + tok);
};
function resolveExpr(expr) {
  expr = expr.replace(/\/\/.*$/, '').trim();
  return expr.split('|').map(resolveToken).reduce((a, b) => (a | b) & 0xFF, 0);
}

// ── Parse les arrays gItemEffect_<Nom>[size] = { [i]=expr, ... } ──────────────
const arrays = {};
for (const m of effSrc.matchAll(/const u8 (gItemEffect_\w+)\[(\d+)\]\s*=\s*\{([\s\S]*?)\};/g)) {
  const name = m[1], size = Number(m[2]), body = m[3];
  const bytes = new Array(size).fill(0);
  // macros friendship-change (item_effects.h:163/225/342)
  for (const v of body.matchAll(/VITAMIN_FRIENDSHIP_CHANGE\((\d+)\)/g)) {
    const i = Number(v[1]); bytes[i] = 5; bytes[i + 1] = 3; bytes[i + 2] = 2;
  }
  if (/STAT_BOOST_FRIENDSHIP_CHANGE/.test(body)) { bytes[6] = 1; bytes[7] = 1; }
  if (/EV_BERRY_FRIENDSHIP_CHANGE/.test(body)) { bytes[7] = 10; bytes[8] = 5; bytes[9] = 2; }
  for (const e of body.matchAll(/\[(\d+)\]\s*=\s*([^,]+?)\s*,/g)) {
    const idx = Number(e[1]); bytes[idx] = resolveExpr(e[2]);
  }
  arrays[name] = { size, bytes };
}

// ── Parse le mapping [ITEM_X - ITEM_POTION] = gItemEffect_<Nom> ───────────────
const itemToArray = {};
for (const m of effSrc.matchAll(/\[(ITEM_[A-Z0-9_]+)\s*-\s*ITEM_POTION\]\s*=\s*(gItemEffect_\w+)/g)) itemToArray[m[1]] = m[2];

// ── index notre JSON par NOM ─────────────────────────────────────────────────
const oursByName = {};
for (const id of Object.keys(ours)) oursByName[ours[id].name] = ours[id];

const findings = [];
let checked = 0;
for (const item of Object.keys(itemToArray)) {
  const arr = arrays[itemToArray[item]];
  if (!arr) { findings.push(`${item} : array ${itemToArray[item]} introuvable`); continue; }
  const o = oursByName[item];
  if (!o) { findings.push(`${item} : ABSENT de item-effects-bytes.json`); continue; }
  checked++;
  if (o.size !== arr.size) findings.push(`${item} : size json=${o.size} ≠ décomp=${arr.size}`);
  const n = Math.max(arr.bytes.length, (o.bytes || []).length);
  for (let i = 0; i < n; i++) {
    const d = arr.bytes[i] ?? 0, g = (o.bytes || [])[i] ?? 0;
    if (d !== g) findings.push(`${item}.byte[${i}] : json=${g} ≠ décomp=${d}`);
  }
}

console.log(`Effets décomp : ${Object.keys(itemToArray).length} · comparés à item-effects-bytes.json : ${checked}`);
if (findings.length === 0) { console.log('✅ item-effects-bytes.json FIDÈLE au décomp item_effects.h (octets d\'effet 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'effet d'objet (= comportement faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

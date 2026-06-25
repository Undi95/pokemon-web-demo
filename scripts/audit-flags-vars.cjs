#!/usr/bin/env node
/**
 * audit-flags-vars.cjs — ORACLE de fidélité des IDs de FLAGS et VARS.
 *
 * Confronte `public/decomp/em/flags-vars.json` (id numérique de chaque FLAG_../VAR_..,
 * = la colonne vertébrale de la progression : tout flagset/checkflag/setvar en
 * dépend) au décomp `include/constants/{flags,vars}.h`. Le décomp exprime les ids en
 * EXPRESSIONS (`SYSTEM_FLAGS + 0x7`, `0x4050`, modulo…) → résolveur récursif
 * (substitution d'identifiants + eval arithmétique). Tout écart = événement déclenché
 * sur le mauvais flag = progression cassée.
 *
 *   node scripts/audit-flags-vars.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INC = 'D:/Projet 1/decomps/pokeemeraude/include/constants';
const JSON_F = path.join(ROOT, 'public/decomp/em/flags-vars.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));

// Collecte tous les #define NAME value de flags.h + vars.h (+ externes seedés)
const defs = { MAX_TRAINERS_COUNT: '864' }; // opponents.h
for (const f of ['flags.h', 'vars.h']) {
  const src = fs.readFileSync(path.join(INC, f), 'utf8');
  for (const m of src.matchAll(/^#define\s+(\w+)\s+(.+?)\s*(?:\/\/.*)?$/gm)) defs[m[1]] = m[2].trim();
}

const memo = new Map();
const resolve = (name, stack = new Set()) => {
  if (memo.has(name)) return memo.get(name);
  if (stack.has(name)) throw new Error('cycle: ' + name);
  let raw = defs[name];
  if (raw === undefined) throw new Error('inconnu: ' + name);
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  // substitue chaque identifiant par sa valeur résolue
  stack.add(name);
  const expr = raw.replace(/\b([A-Za-z_]\w*)\b/g, (id) => String(resolve(id, stack)));
  stack.delete(name);
  let val;
  try { val = Function('"use strict"; return (' + expr + ')')(); }
  catch (e) { throw new Error(`eval ${name} ("${raw}"→"${expr}"): ${e.message}`); }
  if (!Number.isFinite(val)) throw new Error('non-numérique: ' + name);
  memo.set(name, val);
  return val;
};

const findings = [];
let checked = 0;
for (const [kind, prefix] of [['flags', 'FLAG_'], ['vars', 'VAR_']]) {
  const oMap = ours[kind] || {};
  for (const key of Object.keys(oMap)) {
    if (!(key in defs)) { findings.push(`${key} : dans le JSON mais ABSENT du décomp`); continue; }
    let dv;
    try { dv = resolve(key); } catch (e) { findings.push(`${key} : non résolu (${e.message})`); continue; }
    checked++;
    if (dv !== oMap[key]) findings.push(`${key} : json=${oMap[key]} ≠ décomp=${dv} (0x${dv.toString(16)})`);
  }
}

console.log(`Flags+vars comparés : ${checked} (flags ${Object.keys(ours.flags || {}).length} · vars ${Object.keys(ours.vars || {}).length})`);
if (findings.length === 0) { console.log('✅ flags-vars.json FIDÈLE au décomp (ids FLAG_../VAR_.. résolus 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de flag/var :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

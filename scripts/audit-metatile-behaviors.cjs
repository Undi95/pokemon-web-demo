#!/usr/bin/env node
/**
 * audit-metatile-behaviors.cjs — ORACLE de fidélité des COMPORTEMENTS de métatuiles.
 *
 * Confronte `public/decomp/em/metatile-behaviors.json` (valeur ↔ nom de chaque MB_*,
 * = sémantique du terrain : herbe haute/eau/ledge/porte/… qui régit collision,
 * rencontres, surf, sauts) au décomp `include/constants/metatile_behaviors.h` (enum
 * auto-incrémenté). Tout écart = terrain au mauvais comportement.
 *
 *   node scripts/audit-metatile-behaviors.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/metatile_behaviors.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/metatile-behaviors.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

// Extrait le corps de l'enum { … }
const enumBody = src.slice(src.indexOf('enum {') + 6, src.indexOf('};', src.indexOf('enum {')));
const KNOWN = { UCHAR_MAX: 255 };
const decomp = {};
let val = 0;
for (let raw of enumBody.split(',')) {
  raw = raw.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (!raw) continue;
  const m = raw.match(/^(MB_[A-Z0-9_]+)\s*(?:=\s*(.+))?$/);
  if (!m) continue;
  if (m[2] !== undefined) { const e = m[2].trim(); val = e in KNOWN ? KNOWN[e] : (/^0x/.test(e) ? parseInt(e, 16) : Number(e)); }
  decomp[m[1]] = val;
  val++;
}

// notre JSON : { "0x01": { name, value }, … } → name → value
const oursByName = {};
for (const k of Object.keys(ours)) { const e = ours[k]; if (e && e.name) oursByName[e.name] = e.value; }

const findings = [];
let checked = 0;
for (const [name, v] of Object.entries(decomp)) {
  if (!(name in oursByName)) { findings.push(`${name} (=${v}) : ABSENT du JSON`); continue; }
  checked++;
  if (oursByName[name] !== v) findings.push(`${name} : json=${oursByName[name]} ≠ décomp=${v}`);
}

console.log(`Comportements métatuiles décomp : ${Object.keys(decomp).length} · comparés : ${checked}`);
if (findings.length === 0) { console.log('✅ metatile-behaviors.json FIDÈLE au décomp (MB_* valeur↔nom 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de comportement de métatuile :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

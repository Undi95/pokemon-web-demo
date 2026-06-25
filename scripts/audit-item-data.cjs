#!/usr/bin/env node
/**
 * audit-item-data.cjs — ORACLE de fidélité DATA des objets.
 *
 * Confronte notre `public/decomp/em/items.json` (= source de gItems pour le jeu :
 * prix, pocket, type, hold effect, fieldUseFunc…) au décomp `src/data/items.h`
 * (gItems[] 1:1). Tout écart de VALEUR = bug en jeu (prix faux, mauvaise poche,
 * mauvais effet…). Déterministe, remplace l'œil.
 *
 *   node scripts/audit-item-data.cjs
 *   exit 0 = fidèle · exit 1 = écarts listés
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ITEMS_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/items.h';
const ITEMS_JSON = path.join(ROOT, 'public/decomp/em/items.json');

const ours = JSON.parse(fs.readFileSync(ITEMS_JSON, 'utf8'));
const src = fs.readFileSync(ITEMS_H, 'utf8');

// Parse chaque bloc `[ITEM_X] = { ... },` (jusqu'à `\n    },`).
const decomp = {};
const blockRe = /\[(ITEM_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  const key = m[1], body = m[2];
  const field = (re) => { const x = body.match(re); return x ? x[1] : undefined; };
  decomp[key] = {
    name: field(/\.name\s*=\s*_\("([^"]*)"\)/),
    price: field(/\.price\s*=\s*(\d+)/),
    holdEffectParam: field(/\.holdEffectParam\s*=\s*(\d+)/),
    pocket: field(/\.pocket\s*=\s*([A-Z0-9_]+)/),
    type: field(/\.type\s*=\s*([A-Z0-9_]+)/),
    fieldUseFunc: field(/\.fieldUseFunc\s*=\s*([A-Za-z0-9_]+)/),
    battleUsage: field(/\.battleUsage\s*=\s*([A-Z0-9_]+)/),
  };
}

const COMPARE = ['name', 'price', 'holdEffectParam', 'pocket', 'type', 'fieldUseFunc', 'battleUsage'];
const findings = [];
let checked = 0;
for (const key of Object.keys(decomp)) {
  const o = ours[key];
  if (!o) { findings.push(`${key} : ABSENT de items.json (présent au décomp)`); continue; }
  checked++;
  for (const f of COMPARE) {
    const d = decomp[key][f];
    if (d === undefined) continue;            // champ pas exprimé au décomp → skip
    const ov = o[f];
    // normalise nombre vs string
    const dn = /^\d+$/.test(d) ? Number(d) : d;
    const on = typeof ov === 'number' ? ov : (ov === undefined ? undefined : String(ov));
    if (ov === undefined) { findings.push(`${key}.${f} : items.json MANQUE (décomp = ${d})`); continue; }
    if (String(dn) !== String(on)) findings.push(`${key}.${f} : items.json=${JSON.stringify(ov)}  ≠  décomp=${JSON.stringify(dn)}`);
  }
}

console.log(`Items décomp parsés : ${Object.keys(decomp).length} · comparés à items.json : ${checked}`);
if (findings.length === 0) { console.log('✅ items.json FIDÈLE au décomp items.h (prix/pocket/type/hold/fieldUse/battleUsage).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de DATA item (= bugs en jeu) :\n`);
for (const f of findings) console.log('  ' + f);
process.exit(1);

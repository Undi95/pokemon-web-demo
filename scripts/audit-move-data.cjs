#!/usr/bin/env node
/**
 * audit-move-data.cjs — ORACLE de fidélité DATA des capacités (moves).
 *
 * Confronte `public/decomp/em/moves-data.json` (= source de gBattleMoves en jeu :
 * puissance/précision/PP/type/effet/cible/priorité/flags) au décomp
 * `src/data/battle_moves.h` (gBattleMoves[] 1:1). Tout écart = bug de combat.
 *
 *   node scripts/audit-move-data.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MOVES_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/battle_moves.h';
const MOVES_JSON = path.join(ROOT, 'public/decomp/em/moves-data.json');

const ours = JSON.parse(fs.readFileSync(MOVES_JSON, 'utf8'));
const src = fs.readFileSync(MOVES_H, 'utf8');

const normFlags = (s) => s == null ? '' : String(s).split('|').map(x => x.trim()).filter(Boolean).sort().join('|');

const decomp = {};
const blockRe = /\[(MOVE_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  const key = m[1], body = m[2];
  const field = (re) => { const x = body.match(re); return x ? x[1].trim() : undefined; };
  decomp[key] = {
    effect: field(/\.effect\s*=\s*([A-Z0-9_]+)/),
    power: field(/\.power\s*=\s*(\d+)/),
    type: field(/\.type\s*=\s*([A-Z0-9_]+)/),
    accuracy: field(/\.accuracy\s*=\s*(\d+)/),
    pp: field(/\.pp\s*=\s*(\d+)/),
    secondaryEffectChance: field(/\.secondaryEffectChance\s*=\s*(\d+)/),
    target: field(/\.target\s*=\s*([A-Z0-9_]+)/),
    priority: field(/\.priority\s*=\s*(-?\d+)/),
    flags: field(/\.flags\s*=\s*([^,]+),/),
  };
}

const NUM = ['power', 'accuracy', 'pp', 'secondaryEffectChance', 'priority'];
const STR = ['effect', 'type', 'target'];
const findings = [];
let checked = 0;
for (const key of Object.keys(decomp)) {
  const o = ours[key];
  if (!o) { findings.push(`${key} : ABSENT de moves-data.json`); continue; }
  checked++;
  for (const f of [...NUM, ...STR]) {
    const d = decomp[key][f]; if (d === undefined) continue;
    const ov = o[f];
    if (ov === undefined) { findings.push(`${key}.${f} : moves-data.json MANQUE (décomp=${d})`); continue; }
    const dn = NUM.includes(f) ? Number(d) : d;
    if (String(dn) !== String(ov)) findings.push(`${key}.${f} : json=${JSON.stringify(ov)} ≠ décomp=${JSON.stringify(dn)}`);
  }
  // flags (normalisés : ordre indifférent)
  if (decomp[key].flags !== undefined) {
    const df = normFlags(decomp[key].flags), of = normFlags(o.flags);
    if (df !== of) findings.push(`${key}.flags : json=${JSON.stringify(of)} ≠ décomp=${JSON.stringify(df)}`);
  }
}

console.log(`Moves décomp parsés : ${Object.keys(decomp).length} · comparés à moves-data.json : ${checked}`);
if (findings.length === 0) { console.log('✅ moves-data.json FIDÈLE au décomp battle_moves.h.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de DATA move (= bugs de combat) :\n`);
for (const f of findings) console.log('  ' + f);
process.exit(1);

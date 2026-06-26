#!/usr/bin/env node
/**
 * audit-trainer-sprites.cjs — ORACLE de fidélité des SPRITES de dresseurs.
 *
 * Confronte nos sprites de dresseurs en combat (face = le dresseur affronté, dos = le
 * joueur) au décomp. Mappings : `public/decomp/em/trainer_pics` ↔
 * `graphics/trainers/front_pics` ; `public/decomp/em/trainers/back_pics` ↔
 * `graphics/trainers/back_pics`. Byte-exact. Tout écart = mauvais sprite de dresseur.
 *
 *   node scripts/audit-trainer-sprites.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/graphics/trainers';

const MAPS = [
  { our: path.join(ROOT, 'public/decomp/em/trainer_pics'), dec: path.join(DECOMP, 'front_pics'), label: 'face' },
  { our: path.join(ROOT, 'public/decomp/em/trainers/back_pics'), dec: path.join(DECOMP, 'back_pics'), label: 'dos' },
];

const findings = [];
let checked = 0;
for (const m of MAPS) {
  if (!fs.existsSync(m.our)) { findings.push(`dossier ${m.our} absent`); continue; }
  for (const f of fs.readdirSync(m.our)) {
    if (!/\.(png|pal)$/.test(f)) continue;
    const dp = path.join(m.dec, f);
    if (!fs.existsSync(dp)) { findings.push(`${m.label}/${f} : absent du décomp`); continue; }
    checked++;
    if (Buffer.compare(fs.readFileSync(path.join(m.our, f)), fs.readFileSync(dp)) !== 0) findings.push(`${m.label}/${f} : DIFFÈRE (octets) du décomp`);
  }
}

console.log(`Sprites de dresseurs comparés (face + dos) : ${checked}`);
if (findings.length === 0) { console.log('✅ sprites de dresseurs FIDÈLES au décomp (face + dos byte-exact).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de sprite de dresseur :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

#!/usr/bin/env node
/**
 * audit-pokemon-sprites.cjs — ORACLE de fidélité des SPRITES de Pokémon.
 *
 * Confronte nos graphismes de Pokémon `public/decomp/em/pokemon/<espèce>/*.{png,pal}`
 * (front/back/icon/footprint/anim_front + normal.pal/shiny.pal = ce qui s'affiche en
 * combat, au Pokédex, dans l'équipe) au décomp `graphics/pokemon/<espèce>/`. Byte-exact.
 * Tout écart = mauvais sprite/couleur de Pokémon.
 *
 *   node scripts/audit-pokemon-sprites.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUR = path.join(ROOT, 'public/decomp/em/pokemon');
const DEC = 'D:/Projet 1/decomps/pokeemeraude/graphics/pokemon';

const findings = [];
let species = 0, checked = 0;
for (const sp of fs.readdirSync(OUR)) {
  const od = path.join(OUR, sp);
  if (!fs.statSync(od).isDirectory()) continue;
  species++;
  const dd = path.join(DEC, sp);
  if (!fs.existsSync(dd)) { findings.push(`${sp} : dossier absent du décomp`); continue; }
  for (const f of fs.readdirSync(od)) {
    if (!/\.(png|pal)$/.test(f)) continue;
    const op = path.join(od, f), dp = path.join(dd, f);
    if (!fs.existsSync(dp)) { findings.push(`${sp}/${f} : absent du décomp`); continue; }
    checked++;
    if (Buffer.compare(fs.readFileSync(op), fs.readFileSync(dp)) !== 0) findings.push(`${sp}/${f} : DIFFÈRE (octets) du décomp`);
  }
}

console.log(`Espèces (dossiers) : ${species} · fichiers sprites/palettes comparés : ${checked}`);
if (findings.length === 0) { console.log('✅ sprites Pokémon FIDÈLES au décomp (front/back/icon/footprint/anim + palettes byte-exact).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de sprite Pokémon :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);

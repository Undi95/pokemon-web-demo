// Audit 1:1 : coords sprite Pokémon (front+back) = placement vertical
// pixel-perfect en combat. Confronte décomp
// src/data/pokemon_graphics/{front,back}_pic_coordinates.h
// ([SPECIES_X] = { .size = MON_COORDS_SIZE(W,H), .y_offset = N }) à
// public/decomp/em/mon-pic-coords.json ({SPECIES:{front/back:{w,h,
// yOffset}}}). = "graphismes 1:1" VÉRIFIÉ DÉTERMINISTIQUEMENT (la
// donnée EST le placement pixel, pas besoin d'A/B visuel). Parser
// INDÉPENDANT, diff par espèce. Mirror méthodo audit-movement.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const FRONT = `${DEC}/src/data/pokemon_graphics/front_pic_coordinates.h`;
const BACK = `${DEC}/src/data/pokemon_graphics/back_pic_coordinates.h`;
const JSON_F = `${P}/public/decomp/em/mon-pic-coords.json`;

function parseCoords(file) {
  const src = readFileSync(file, 'utf8');
  const out = {};
  // [SPECIES_X] = { .size = MON_COORDS_SIZE(W, H), .y_offset = N },
  const re = /\[(SPECIES_\w+)\]\s*=\s*\{\s*\.size\s*=\s*MON_COORDS_SIZE\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*,\s*\.y_offset\s*=\s*(\d+)\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out[m[1]] = { w: +m[2], h: +m[3], yOffset: +m[4] };
  }
  return out;
}

const decFront = parseCoords(FRONT);
const decBack = parseCoords(BACK);
const j = JSON.parse(readFileSync(JSON_F, 'utf8'));

let mis = 0, compared = 0;
const sample = [];
const allSpecies = new Set([...Object.keys(decFront), ...Object.keys(decBack)]);
for (const sp of allSpecies) {
  const oj = j[sp];
  for (const side of ['front', 'back']) {
    const d = (side === 'front' ? decFront : decBack)[sp];
    if (!d) continue;
    compared++;
    const o = oj && oj[side];
    if (!o || o.w !== d.w || o.h !== d.h || o.yOffset !== d.yOffset) {
      mis++;
      if (sample.length < 20) sample.push(`${sp}.${side} décomp={w:${d.w},h:${d.h},y:${d.yOffset}} json=${o ? `{w:${o.w},h:${o.h},y:${o.yOffset}}` : '∅'}`);
    }
  }
}

console.log(`[audit mon-pic-coords] espèces décomp front=${Object.keys(decFront).length} back=${Object.keys(decBack).length} | json keys=${Object.keys(j).length}`);
console.log(`  comparés (front+back) : ${compared} | mismatches : ${mis}`);
if (sample.length) { console.error('  ÉCARTS :'); for (const s of sample) console.error('   ' + s); }
const ok = mis === 0 && compared > 700;
console.log(`\n${ok
  ? `✓ mon-pic-coords : ${compared} coords (front+back) 1:1 décomp — placement sprite pixel-perfect.`
  : `✗ mon-pic-coords : ${mis} mismatch / ${compared} — PAS 1:1 (placement sprite faux).`}`);
process.exit(ok ? 0 : 1);

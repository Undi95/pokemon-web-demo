#!/usr/bin/env node
/**
 * extract-front-pic-anims.mjs
 *
 * Extrait les séquences AnimCmd "2-frame" du front-pic Pokémon depuis
 * `src/data/pokemon_graphics/front_pic_anims.h` (décomp).
 *
 * 1:1 : `gMonFrontAnimsPtrTable[SPECIES_X] = sAnims_X` ;
 *       `sAnims_X[1] = sAnim_X_1` (SINGLE/DOUBLE_ANIMATION macro ou table
 *       explicite — l'index 1 = la séquence jouée par StartSpriteAnim(.,1)
 *       dans PokemonSummaryDoMonAnimation). `sAnims_X[0]` = GeneralFrame0
 *       (statique, ignoré).
 *
 * ANIMCMD_FRAME(imageValue, duration[, hFlip, vFlip]) — imageValue = index
 * de frame (0 ou 1), duration = ticks. ANIMCMD_END = fin (joue 1×, tient
 * la dernière frame). Aucun LOOP/JUMP dans ce fichier (vérifié).
 *
 * Sortie : public/decomp/em/pokemon/front-pic-anims.json
 *   { "SPECIES_TREECKO": [[0,6],[1,15],[0,6],[1,15],[0,3]], ... }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const SRC = join(DECOMP, 'src/data/pokemon_graphics/front_pic_anims.h');
const OUT_PUB = join(process.cwd(), 'public/decomp/em/pokemon');

const text = readFileSync(SRC, 'utf8');

// 1) Toutes les défs `static const union AnimCmd sAnim_<NAME>[] = { ... };`
const animDefs = new Map(); // sAnim_NAME → [[img,dur],...]
const reAnim = /static const union AnimCmd (sAnim_\w+)\[\]\s*=\s*\{([\s\S]*?)\};/g;
let m;
while ((m = reAnim.exec(text)) !== null) {
  const name = m[1];
  const body = m[2];
  const frames = [];
  const reF = /ANIMCMD_FRAME\(\s*(-?\d+)\s*,\s*(-?\d+)\s*(?:,\s*(\d+)\s*,\s*(\d+)\s*)?\)/g;
  let f;
  while ((f = reF.exec(body)) !== null) {
    frames.push([Number(f[1]), Number(f[2])]);
  }
  animDefs.set(name, frames);
}

// 2) SINGLE_ANIMATION(Name) / DOUBLE_ANIMATION(Name) → sAnims_Name[1] = sAnim_Name_1
const tableIndex1 = new Map(); // sAnims_NAME → sAnim ref pour index 1
const reSingle = /\b(?:SINGLE|DOUBLE)_ANIMATION\((\w+)\);/g;
while ((m = reSingle.exec(text)) !== null) {
  tableIndex1.set(`sAnims_${m[1]}`, `sAnim_${m[1]}_1`);
}
// 3) Tables explicites `static const union AnimCmd *const sAnims_<NAME>[] = { a, b, ... };`
const reExpl = /static const union AnimCmd \*const (sAnims_\w+)\[\]\s*=\s*\{([\s\S]*?)\};/g;
while ((m = reExpl.exec(text)) !== null) {
  const tbl = m[1];
  const refs = m[2].split(',').map((s) => s.trim()).filter((s) => s.startsWith('sAnim_'));
  if (refs.length >= 2) tableIndex1.set(tbl, refs[1]); // index 1
}

// 4) gMonFrontAnimsPtrTable[] : [SPECIES_X] = sAnims_Y
const out = {};
const reTbl = /\[SPECIES_(\w+)\]\s*=\s*(sAnims_\w+)/g;
let matched = 0, missing = 0;
while ((m = reTbl.exec(text)) !== null) {
  const species = `SPECIES_${m[1]}`;
  const tbl = m[2];
  const animRef = tableIndex1.get(tbl);
  if (!animRef) { missing++; continue; }
  const frames = animDefs.get(animRef);
  if (!frames || frames.length === 0) { missing++; continue; }
  out[species] = frames;
  matched++;
}

mkdirSync(OUT_PUB, { recursive: true });
const json = JSON.stringify(out);
writeFileSync(join(OUT_PUB, 'front-pic-anims.json'), json);
console.log(`[extract-front-pic-anims] ${matched} species mapped, ${missing} unresolved`);
console.log(`[extract-front-pic-anims] sample TREECKO=${JSON.stringify(out['SPECIES_TREECKO'])}`);
console.log(`[extract-front-pic-anims] wrote ${join(OUT_PUB, 'front-pic-anims.json')} (${json.length} bytes)`);

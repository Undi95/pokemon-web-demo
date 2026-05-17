// One-off audit : nos learnsets de niveau (public/decomp/em/
// level-up-learnsets.json) vs décomp 1:1 (level_up_learnset_pointers.h +
// level_up_learnsets.h). Chaque moveset de chaque Pokémon (wild/trainer)
// dépend de cette extraction → dérive = movesets faux vs ROM. Read-only.
import { readFileSync } from 'node:fs';

const PTR = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/level_up_learnset_pointers.h';
const LRN = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/level_up_learnsets.h';
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/level-up-learnsets.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));

// 1) SPECIES_X -> symbole tableau
const ptrSrc = readFileSync(PTR, 'utf8');
const sp2arr = {};
for (const mm of ptrSrc.matchAll(/\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*(\w+LevelUpLearnset)/g)) {
  sp2arr[mm[1]] = mm[2];
}

// 2) symbole tableau -> [{level,move}] ordonné
const lrnSrc = readFileSync(LRN, 'utf8');
const arr2list = {};
for (const mm of lrnSrc.matchAll(/static const u16 (\w+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\};/g)) {
  const sym = mm[1];
  const list = [];
  for (const e of mm[2].matchAll(/LEVEL_UP_MOVE\(\s*(\d+)\s*,\s*(MOVE_[A-Z0-9_]+)\s*\)/g)) {
    list.push({ level: Number(e[1]), move: e[2] });
  }
  arr2list[sym] = list;
}

let compared = 0, mismatches = 0, missingInOurs = 0, badSpecies = 0;
const bad = [];
for (const [sp, sym] of Object.entries(sp2arr)) {
  if (sp === 'SPECIES_NONE') continue;
  const dlist = arr2list[sym];
  if (!dlist) continue;
  const o = ours[sp];
  if (!o) { missingInOurs++; continue; }
  compared++;
  let speciesBad = false;
  if (o.length !== dlist.length) {
    speciesBad = true;
    bad.push(`${sp}: length ours=${o.length} decomp=${dlist.length}`);
  }
  const n = Math.min(o.length, dlist.length);
  for (let i = 0; i < n; i++) {
    if (o[i].level !== dlist[i].level || o[i].move !== dlist[i].move) {
      mismatches++;
      speciesBad = true;
      if (bad.length < 60) bad.push(`${sp}[${i}]: ours=L${o[i].level}:${o[i].move} decomp=L${dlist[i].level}:${dlist[i].move}`);
    }
  }
  if (speciesBad) badSpecies++;
}
console.log(`[audit learnsets] speciesInPtr=${Object.keys(sp2arr).length} compared=${compared} missingInOurs=${missingInOurs} entryMismatches=${mismatches} badSpecies=${badSpecies}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — learnsets de niveau extraits 1:1 décomp.');
process.exit(badSpecies ? 1 : 0);

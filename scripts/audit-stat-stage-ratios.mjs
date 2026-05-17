// One-off audit : notre table gStatStageRatios
// (src/engine/battle/damage-calc.ts) vs décomp 1:1
// (src/pokemon.c gStatStageRatios[MAX_STAT_STAGE+1][2]). Cette table
// pilote APPLY_STAT_MOD (pokemon.c:3101-3104) = le multiplicateur de
// stat selon le stat-stage (-6..+6) dans CalculateBaseDamage + ailleurs.
// preciseDamage/precisePipeline ne testent QUE les stages neutres
// (ratio identité 10/10) → cette garde verrouille les 12 autres ratios
// (boosts/drops) sans lesquels les dégâts stat-modifiés seraient faux
// vs ROM. Pur read-only, comparaison de SÉQUENCE de paires numériques.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude/src/pokemon.c';
const T = 'D:/Projet 1/pokemon-web-demo/src/engine/battle/damage-calc.ts';

const cSrc = readFileSync(DEC, 'utf8');
const tSrc = readFileSync(T, 'utf8');

// décomp : const u8 gStatStageRatios[MAX_STAT_STAGE + 1][2] = { {n,d}, ... };
const cm = cSrc.match(/gStatStageRatios\[[^\]]*\]\[2\]\s*=\s*\{([\s\S]*?)\}\s*;/);
if (!cm) { console.log('ERR: décomp gStatStageRatios introuvable'); process.exit(2); }
const decPairs = [];
for (const p of cm[1].replace(/\/\/[^\n]*/g, ' ').matchAll(/\{\s*(\d+)\s*,\s*(\d+)\s*\}/g)) {
  decPairs.push([Number(p[1]), Number(p[2])]);
}

// nous : const gStatStageRatios ... = [ [n,d], ... ];
const tm = tSrc.match(/gStatStageRatios[^=]*=\s*\[([\s\S]*?)\]\s*;/);
if (!tm) { console.log('ERR: notre gStatStageRatios introuvable'); process.exit(2); }
const ourPairs = [];
for (const p of tm[1].replace(/\/\/[^\n]*/g, ' ').matchAll(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)) {
  ourPairs.push([Number(p[1]), Number(p[2])]);
}

let mismatches = 0;
const bad = [];
if (decPairs.length !== ourPairs.length) {
  mismatches++;
  bad.push(`longueur décomp=${decPairs.length} ours=${ourPairs.length} (attendu 13 = MAX_STAT_STAGE+1)`);
}
const n = Math.max(decPairs.length, ourPairs.length);
const STAGE = (i) => `stage ${i - 6}`; // index 0 = -6 .. index 12 = +6
for (let i = 0; i < n; i++) {
  const d = decPairs[i];
  const o = ourPairs[i];
  if (!d || !o) { mismatches++; bad.push(`idx ${i} (${STAGE(i)}): ${d ? '' : 'décomp ∅'} ${o ? '' : 'ours ∅'}`); continue; }
  if (d[0] !== o[0] || d[1] !== o[1]) {
    mismatches++;
    bad.push(`idx ${i} (${STAGE(i)}): ours=[${o}] decomp=[${d}]`);
  }
}
console.log(`[audit statStageRatios] decompPairs=${decPairs.length} oursPairs=${ourPairs.length} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad) console.log('  ' + b); }
else console.log('✓ 0 mismatch — gStatStageRatios 1:1 décomp (13 paires -6..+6).');
process.exit(mismatches ? 1 : 0);

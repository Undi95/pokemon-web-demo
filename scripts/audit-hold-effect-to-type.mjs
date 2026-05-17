// One-off audit : notre table _sHoldEffectToType
// (src/engine/battle/damage-calc.ts) vs décomp 1:1
// (src/pokemon.c sHoldEffectToType[][2] + hold_effects.h + pokemon.h).
// Cette table pilote le boost des objets type-bonus (Charcoal Fire+10%,
// Mystic Water Water+10%, Sharp Beak Flying+10%…) DANS CalculateBaseDamage
// (pokemon.c:3171-3183) → une dérive = dégâts faux malgré la formule
// prouvée 1:1. Pur read-only. Compare la SÉQUENCE de paires résolues
// (décomp symbolique → numérique) vs nos paires numériques.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const PK = `${DEC}/src/pokemon.c`;
const HE = `${DEC}/include/constants/hold_effects.h`;
const TY = `${DEC}/include/constants/pokemon.h`;
const T = 'D:/Projet 1/pokemon-web-demo/src/engine/battle/damage-calc.ts';

const pkSrc = readFileSync(PK, 'utf8');
const heSrc = readFileSync(HE, 'utf8');
const tySrc = readFileSync(TY, 'utf8');
const tSrc = readFileSync(T, 'utf8');

const heId = {};
for (const m of heSrc.matchAll(/^#define\s+(HOLD_EFFECT_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) heId[m[1]] = Number(m[2]);
const tyId = {};
for (const m of tySrc.matchAll(/^#define\s+(TYPE_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) tyId[m[1]] = Number(m[2]);

// décomp : static const u8 sHoldEffectToType[][2] = { {HE, TYPE}, ... };
const dm = pkSrc.match(/sHoldEffectToType\[\]\[2\]\s*=\s*\{([\s\S]*?)\}\s*;/);
if (!dm) { console.log('ERR: décomp sHoldEffectToType introuvable'); process.exit(2); }
const decPairs = [];
for (const p of dm[1].matchAll(/\{\s*(HOLD_EFFECT_[A-Z0-9_]+)\s*,\s*(TYPE_[A-Z0-9_]+)\s*\}/g)) {
  const he = heId[p[1]];
  const ty = tyId[p[2]];
  decPairs.push({ heName: p[1], tyName: p[2], he, ty, ok: he !== undefined && ty !== undefined });
}

// nous : const _sHoldEffectToType ... = [ [N, M], ... ]; (strip // comments)
const tm = tSrc.match(/_sHoldEffectToType[^=]*=\s*\[([\s\S]*?)\]\s*;/);
if (!tm) { console.log('ERR: notre _sHoldEffectToType introuvable'); process.exit(2); }
const body = tm[1].replace(/\/\/[^\n]*/g, ' ');
const ourPairs = [];
for (const p of body.matchAll(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)) {
  ourPairs.push([Number(p[1]), Number(p[2])]);
}

let mismatches = 0;
const bad = [];
if (decPairs.length !== ourPairs.length) {
  mismatches++;
  bad.push(`longueur décomp=${decPairs.length} ours=${ourPairs.length}`);
}
const n = Math.max(decPairs.length, ourPairs.length);
for (let i = 0; i < n; i++) {
  const d = decPairs[i];
  const o = ourPairs[i];
  if (!d || !o) { mismatches++; bad.push(`idx ${i}: ${d ? '' : 'décomp ∅'} ${o ? '' : 'ours ∅'}`); continue; }
  if (!d.ok) { mismatches++; bad.push(`idx ${i}: décomp non résolvable ${d.heName}/${d.tyName}`); continue; }
  if (d.he !== o[0] || d.ty !== o[1]) {
    mismatches++;
    bad.push(`idx ${i}: ours=[${o[0]},${o[1]}] decomp=[${d.he},${d.ty}] (${d.heName},${d.tyName})`);
  }
}
console.log(`[audit holdEffectToType] decompPairs=${decPairs.length} oursPairs=${ourPairs.length} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad) console.log('  ' + b); }
else console.log('✓ 0 mismatch — sHoldEffectToType 1:1 décomp (paires résolues).');
process.exit(mismatches ? 1 : 0);

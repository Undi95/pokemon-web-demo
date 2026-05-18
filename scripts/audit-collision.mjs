// Audit 1:1 : maths "grid impassable / tout calculé" (= demandé user).
// Confronte les #define MAPGRID_*/METATILE_ATTR_* + macros UNPACK_* du
// décomp `include/global.fieldmap.h` à nos exports `src/engine/
// map-loader.ts` (consommés par toute la collision runtime :
// MapGridGetCollisionAt / GetMetatileBehavior / elevation). Parser
// INDÉPENDANT, diff valeur-par-valeur + cohérence (mask,shift) des
// UNPACK. Guard PERMANENT régression. Read-only. Méthodo = mirror
// audit-movement / audit-scrcmd.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const GFM = `${DEC}/include/global.fieldmap.h`;
const ML = `${P}/src/engine/map-loader.ts`;

const dec = readFileSync(GFM, 'utf8');
const ours = readFileSync(ML, 'utf8');

// 1) Décomp : #define NAME 0xVAL (numérique direct uniquement).
const decConst = {};
for (const m of dec.matchAll(/^#define\s+((?:MAPGRID|METATILE_ATTR)_\w+)\s+(0x[0-9A-Fa-f]+|\d+)\s*(?:\/\/|$)/gm)) {
  decConst[m[1]] = parseInt(m[2], m[2].startsWith('0x') ? 16 : 10);
}
// #define NAME OTHER_NAME (alias, ex. MAPGRID_UNDEFINED = MAPGRID_METATILE_ID_MASK).
const decAlias = {};
for (const m of dec.matchAll(/^#define\s+((?:MAPGRID|METATILE_ATTR)_\w+)\s+((?:MAPGRID|METATILE_ATTR)_\w+)\s*(?:\/\/|$)/gm)) {
  decAlias[m[1]] = m[2];
}
for (const [k, v] of Object.entries(decAlias)) if (decConst[v] !== undefined) decConst[k] = decConst[v];

// 2) Nous : export const NAME = 0xVAL ;  + alias = OTHER ;
const ourConst = {};
for (const m of ours.matchAll(/^export const ((?:MAPGRID|METATILE_ATTR)_\w+)\s*=\s*(0x[0-9A-Fa-f]+|\d+)\s*;/gm)) {
  ourConst[m[1]] = parseInt(m[2], m[2].startsWith('0x') ? 16 : 10);
}
for (const m of ours.matchAll(/^export const ((?:MAPGRID|METATILE_ATTR)_\w+)\s*=\s*((?:MAPGRID|METATILE_ATTR)_\w+)\s*;/gm)) {
  if (ourConst[m[2]] !== undefined) ourConst[m[1]] = ourConst[m[2]];
}

// 3) UNPACK_* : décomp `UNPACK(data, SHIFT, MASK)` ; nous `(data & MASK) >>> SHIFT`.
//    On vérifie que chaque UNPACK_X utilise le bon couple (MASK,SHIFT).
const decUnpack = {};
for (const m of dec.matchAll(/#define\s+(UNPACK_\w+)\(data\)\s+UNPACK\(data,\s*(\w+),\s*(\w+)\)/g)) {
  decUnpack[m[1]] = { shift: m[2], mask: m[3] };
}
const ourUnpack = {};
for (const m of ours.matchAll(/export const (UNPACK_\w+)\s*=\s*\(data:\s*number\):\s*number\s*=>\s*\(data\s*&\s*(\w+)\)\s*>>>\s*(\w+)/g)) {
  ourUnpack[m[1]] = { mask: m[2], shift: m[3] };
}

let cMis = 0, uMis = 0;
const keys = new Set([...Object.keys(decConst), ...Object.keys(ourConst)]);
for (const k of keys) {
  if (decConst[k] !== ourConst[k]) {
    cMis++;
    console.error(`  const ${k} : décomp=${decConst[k] ?? '∅'} (0x${(decConst[k] ?? 0).toString(16)}) ours=${ourConst[k] ?? '∅'}`);
  }
}
for (const k of new Set([...Object.keys(decUnpack), ...Object.keys(ourUnpack)])) {
  const d = decUnpack[k], o = ourUnpack[k];
  if (!d || !o || d.mask !== o.mask || d.shift !== o.shift) {
    uMis++;
    console.error(`  ${k} : décomp=(mask=${d?.mask},shift=${d?.shift}) ours=(mask=${o?.mask},shift=${o?.shift})`);
  }
}

// 4) MapGridGetCollisionAt règle 1:1 : hors-borne (MAPGRID_UNDEFINED) → impassable.
const oobRule = /GetMapGridBlockAt\([^)]*\)\s*===?\s*MAPGRID_UNDEFINED/.test(ours)
  || /MAPGRID_UNDEFINED[\s\S]{0,80}(TRUE|true|IMPASSABLE|impassable|CONNECTION_INVALID)/.test(ours);

console.log(`[audit collision] consts décomp=${Object.keys(decConst).length} ours=${Object.keys(ourConst).length} | UNPACK décomp=${Object.keys(decUnpack).length} ours=${Object.keys(ourUnpack).length}`);
console.log(`  consts mismatch  : ${cMis}`);
console.log(`  UNPACK mismatch  : ${uMis} (couple mask/shift)`);
console.log(`  règle hors-borne MAPGRID_UNDEFINED→impassable présente : ${oobRule ? 'oui' : 'NON ⚠'}`);
const ok = cMis === 0 && uMis === 0 && oobRule;
console.log(`\n${ok
  ? '✓ collision : maths grid-impassable 1:1 décomp (MAPGRID_*/METATILE_ATTR_*/UNPACK_* + règle hors-borne).'
  : `✗ collision : ${cMis} const + ${uMis} UNPACK mismatch${oobRule ? '' : ' + règle hors-borne absente'} — PAS 1:1.`}`);
process.exit(ok ? 0 : 1);

// One-off audit : nos tables d'expérience (public/decomp/em/
// experience-tables.json, consommé par battle/data/experience-tables.ts +
// game-data) vs décomp 1:1 (src/data/pokemon/experience_tables.h
// gExperienceTables + macros EXP_*). gExperienceTables[growthRate][level]
// pilote level↔exp (Cmd_getexp, GetMonData EXP, level-up) → une dérive =
// mauvais niveau = mauvaises stats en combat. Pur read-only. Évalue les
// macros EXP_* 1:1 (division entière C = trunc) ; 8 blocs décomp dont 6
// utilisés (ordre positionnel = enum GROWTH_* 0..5), 2 "copy unused".
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const ET = `${DEC}/src/data/pokemon/experience_tables.h`;
const PK = `${DEC}/include/constants/pokemon.h`;
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/experience-tables.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));
const etSrc = readFileSync(ET, 'utf8');
const pkSrc = readFileSync(PK, 'utf8');

// GROWTH_X -> index (= ligne du tableau, positionnel)
const growthIdx = {};
for (const m of pkSrc.matchAll(/^#define\s+(GROWTH_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) growthIdx[m[1]] = Number(m[2]);

const tr = (x) => Math.trunc(x); // division entière C (vers zéro)
function evalMacro(name, n) {
  const cube = n * n * n;
  const square = n * n;
  switch (name) {
    case 'EXP_SLOW': return tr((5 * cube) / 4);
    case 'EXP_FAST': return tr((4 * cube) / 5);
    case 'EXP_MEDIUM_FAST': return cube;
    case 'EXP_MEDIUM_SLOW': return tr((6 * cube) / 5) - (15 * square) + (100 * n) - 140;
    case 'EXP_ERRATIC':
      if (n <= 50) return tr(((100 - n) * cube) / 50);
      if (n <= 68) return tr(((150 - n) * cube) / 100);
      if (n <= 98) return tr((tr((1911 - 10 * n) / 3) * cube) / 500);
      return tr(((160 - n) * cube) / 100);
    case 'EXP_FLUCTUATING':
      if (n <= 15) return tr(((tr((n + 1) / 3) + 24) * cube) / 50);
      if (n <= 36) return tr(((n + 14) * cube) / 50);
      return tr(((tr(n / 2) + 32) * cube) / 50);
    default: throw new Error('macro EXP inconnue: ' + name);
  }
}

// Isole gExperienceTables[][...] = { ... }; puis scan des blocs de profondeur 1.
const tblM = etSrc.match(/gExperienceTables\[\]\[[^\]]*\]\s*=\s*\{([\s\S]*)\}\s*;/);
if (!tblM) { console.log('ERR: gExperienceTables introuvable'); process.exit(2); }
const body = tblM[1];
const blocks = [];
let depth = 0, start = -1;
for (let i = 0; i < body.length; i++) {
  const c = body[i];
  if (c === '{') { if (depth === 0) start = i + 1; depth++; }
  else if (c === '}') { depth--; if (depth === 0 && start >= 0) { blocks.push(body.slice(start, i)); start = -1; } }
}
// 6 premiers blocs = GROWTH 0..5 (les 2 derniers = Medium Fast copy unused).
function parseBlock(src) {
  const clean = src.replace(/\/\/[^\n]*/g, ' ');
  const out = [];
  for (const tk of clean.split(',')) {
    const t = tk.trim();
    if (!t) continue;
    let mm;
    if ((mm = t.match(/^(\d+)$/))) out.push(Number(mm[1]));
    else if ((mm = t.match(/^(EXP_[A-Z_]+)\s*\(\s*(\d+)\s*\)$/))) out.push(evalMacro(mm[1], Number(mm[2])));
    else throw new Error('token exp inconnu: "' + t + '"');
  }
  return out;
}
const decomp = blocks.slice(0, 6).map(parseBlock);

let compared = 0, mismatches = 0, missing = 0;
const bad = [];
for (const [gname, gi] of Object.entries(growthIdx)) {
  const o = ours[gname];
  const d = decomp[gi];
  if (!o) { missing++; bad.push(`${gname}: absent de notre JSON`); continue; }
  if (!d) { mismatches++; bad.push(`${gname}: bloc décomp idx ${gi} absent`); continue; }
  if (o.length !== d.length) { mismatches++; bad.push(`${gname}: length ours=${o.length} decomp=${d.length}`); }
  const n = Math.min(o.length, d.length);
  for (let lv = 0; lv < n; lv++) {
    compared++;
    if (Number(o[lv]) !== Number(d[lv])) {
      mismatches++;
      if (bad.length < 60) bad.push(`${gname}[L${lv}]: ours=${o[lv]} decomp=${d[lv]}`);
    }
  }
}
console.log(`[audit experience-tables] growthTables=${Object.keys(growthIdx).length} decompBlocks=${blocks.length} comparedValues=${compared} missing=${missing} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — gExperienceTables 1:1 décomp (macros EXP_* évaluées).');
process.exit(mismatches ? 1 : 0);

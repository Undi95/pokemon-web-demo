// One-off audit : nos tableaux d'effet d'objet (public/decomp/em/
// item-effects-bytes.json) vs décomp 1:1 (item_effects.h #defines +
// src/data/pokemon/item_effects.h gItemEffect_X[] + gItemEffectTable[]).
// Ces octets pilotent l'AI dresseur (ShouldUseItem/GetAI_ItemType/
// GetItemEffectParamOffset) → une dérive = mauvaise décision d'objet vs
// ROM. Read-only. Recompute INDÉPENDANT (parsing distinct de l'extracteur)
// puis diff octet-à-octet + vérif ensemble de clés == table non-NULL.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const IE_CONST = `${DEC}/include/constants/item_effects.h`;
const ITEMS = `${DEC}/include/constants/items.h`;
const IE_DATA = `${DEC}/src/data/pokemon/item_effects.h`;
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/item-effects-bytes.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));
const u8 = (n) => ((n % 256) + 256) % 256;

// 1) Symboles ITEM0..ITEM6 — résolution récursive directe sur l'AST simple.
const ieSrc = readFileSync(IE_CONST, 'utf8');
const rawDef = new Map();
for (const m of ieSrc.matchAll(/^#define\s+(ITEM[0-9]_[A-Z0-9_]+)\s+(.+?)\s*(?:\/\/.*)?$/gm)) {
  rawDef.set(m[1], m[2].trim());
}
const symCache = new Map();
function resolveSym(name) {
  if (symCache.has(name)) return symCache.get(name);
  const v = evalE(rawDef.get(name));
  symCache.set(name, v);
  return v;
}
function evalE(expr) {
  let s = expr.trim();
  // déballe les parens englobant tout
  while (s[0] === '(') {
    let d = 0, j = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') d++; else if (s[i] === ')') { if (--d === 0) { j = i; break; } }
    }
    if (j === s.length - 1) s = s.slice(1, j).trim(); else break;
  }
  // OR de profondeur 0
  const parts = []; let d = 0, st = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++; else if (s[i] === ')') d--;
    else if (s[i] === '|' && d === 0) { parts.push(s.slice(st, i)); st = i + 1; }
  }
  parts.push(s.slice(st));
  let acc = 0;
  for (let p of parts) {
    p = p.trim();
    let mm;
    if ((mm = p.match(/^\(*\s*\(u8\)\s*(-?\d+)\s*\)*$/))) acc |= u8(+mm[1]);
    else if ((mm = p.match(/^\(*\s*(\d+)\s*<<\s*(\d+)\s*\)*$/))) acc |= u8(+mm[1] << +mm[2]);
    else if ((mm = p.match(/^\(*\s*(0x[0-9a-fA-F]+)\s*\)*$/))) acc |= u8(parseInt(mm[1], 16));
    else if ((mm = p.match(/^\(*\s*(-?\d+)\s*\)*$/))) acc |= u8(+mm[1]);
    else acc |= resolveSym(p.replace(/^\(+|\)+$/g, '').trim());
  }
  return u8(acc);
}

// 2) items.h : ITEM_NAME -> id
const itSrc = readFileSync(ITEMS, 'utf8');
const id = new Map();
for (const m of itSrc.matchAll(/^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) id.set(m[1], +m[2]);
for (const m of itSrc.matchAll(/^#define\s+((?:FIRST|LAST)_BERRY_INDEX)\s+(ITEM_[A-Z0-9_]+)\s*$/gm)) {
  if (id.has(m[2])) id.set(m[1], id.get(m[2]));
}

// 3) arrays + table (parsing indépendant : on lit la taille déclarée et on
//    remplit, macros expansées via leur définition #define dans le fichier).
const dataSrc = readFileSync(IE_DATA, 'utf8');
function macroEntries(name, arg) {
  const a = arg != null ? +arg : 0;
  if (name === 'VITAMIN_FRIENDSHIP_CHANGE') return [[a, 5], [a + 1, 3], [a + 2, 2]];
  if (name === 'STAT_BOOST_FRIENDSHIP_CHANGE') return [[6, 1], [7, 1]];
  if (name === 'EV_BERRY_FRIENDSHIP_CHANGE') return [[7, 10], [8, 5], [9, 2]];
  throw new Error('macro inconnue ' + name);
}
const arr = new Map();
for (const m of dataSrc.matchAll(/const\s+u8\s+(gItemEffect_\w+)\s*\[\s*(\d+)\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) {
  const nm = m[1], size = +m[2];
  let body = m[3].replace(/\/\/[^\n]*/g, '');
  const b = new Array(size).fill(0);
  body = body.replace(/\b(VITAMIN_FRIENDSHIP_CHANGE|STAT_BOOST_FRIENDSHIP_CHANGE|EV_BERRY_FRIENDSHIP_CHANGE)\b(?:\s*\(\s*(\d+)\s*\))?/g,
    (_, n2, a2) => { for (const [i, v] of macroEntries(n2, a2)) b[i] = u8(v); return ''; });
  for (const e of body.matchAll(/\[\s*(\d+)\s*\]\s*=\s*([^,\[\]}]+?)\s*(?=,|$)/g)) {
    const ix = +e[1], ex = e[2].trim();
    if (ex) b[ix] = evalE(ex);
  }
  arr.set(nm, b);
}
const tM = dataSrc.match(/gItemEffectTable\[\]\s*=\s*\{([\s\S]*?)\}\s*;/);
const decById = {};
let nullN = 0;
for (const e of tM[1].matchAll(/\[\s*(ITEM_[A-Z0-9_]+|LAST_BERRY_INDEX|FIRST_BERRY_INDEX)\s*-\s*ITEM_POTION\s*\]\s*=\s*(gItemEffect_\w+|NULL)/g)) {
  if (e[2] === 'NULL') { nullN++; continue; }
  decById[id.get(e[1])] = { name: e[1], bytes: arr.get(e[2]) };
}

// 4) diff
let mismatches = 0;
const bad = [];
const decIds = Object.keys(decById).map(Number).sort((a, b) => a - b);
const ourIds = Object.keys(ours.byId || {}).map(Number).sort((a, b) => a - b);
if (decIds.join(',') !== ourIds.join(',')) {
  mismatches++;
  bad.push(`ensemble d'ids différent : décomp=${decIds.length} ours=${ourIds.length}`);
  const miss = decIds.filter((x) => !ourIds.includes(x));
  const extra = ourIds.filter((x) => !decIds.includes(x));
  if (miss.length) bad.push(`  manquants chez nous: ${miss.join(',')}`);
  if (extra.length) bad.push(`  en trop chez nous: ${extra.join(',')}`);
}
for (const i of decIds) {
  const d = decById[i];
  const o = ours.byId?.[i];
  if (!o) continue;
  const ob = o.bytes || [];
  if (JSON.stringify(ob) !== JSON.stringify(d.bytes)) {
    mismatches++;
    if (bad.length < 50) bad.push(`id ${i} (${d.name}): ours=${JSON.stringify(ob)} decomp=${JSON.stringify(d.bytes)}`);
  }
}
const ourNull = ours._meta?.nullEntries;
if (ourNull !== nullN) { mismatches++; bad.push(`nullEntries ours=${ourNull} decomp=${nullN}`); }

console.log(`[audit item-effects] decompItems=${decIds.length} oursItems=${ourIds.length} nullEntries=${nullN} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 50)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — gItemEffectTable octets extraits 1:1 décomp.');
process.exit(mismatches ? 1 : 0);

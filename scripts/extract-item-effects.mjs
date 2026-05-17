// Extraction 1:1 des tableaux d'effet d'objet (gItemEffectTable) depuis la
// décomp. Source de vérité :
//   include/constants/item_effects.h   (#defines ITEM0..ITEM6 + macros)
//   include/constants/items.h          (ITEM_X -> id numérique)
//   src/data/pokemon/item_effects.h    (gItemEffect_X[size]={...} + table)
//
// Le sous-système AI dresseur (ShouldUseItem / GetAI_ItemType /
// GetItemEffectParamOffset) lit `gItemEffectTable[item - ITEM_POTION]` =
// un `const u8 itemEffect[]` exact. L'ancien `item-effects.json` n'est PAS
// 1:1 (il droppe les valeurs OR-combinées : ex. gItemEffect_Revive a
// `[4] = ITEM4_REVIVE | ITEM4_HEAL_HP` mais le vieux JSON ne garde que
// ITEM4_REVIVE). Ce script produit la VRAIE séquence d'octets compilée
// (OR / 1<<n / (u8)-N / négatifs→u8 / macros résolus) → JSON numérique
// `item-effects-bytes.json` indexé par itemId absolu (= gItemEffectTable
// [itemId - ITEM_POTION]). Réutilisé par un audit read-only 1:1 séparé.
import { readFileSync, writeFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const IE_CONST = `${DEC}/include/constants/item_effects.h`;
const ITEMS = `${DEC}/include/constants/items.h`;
const IE_DATA = `${DEC}/src/data/pokemon/item_effects.h`;
const OUT = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/item-effects-bytes.json';

const u8 = (n) => ((n % 256) + 256) % 256;

// ─── 1) Table de symboles ITEM0..ITEM6 (item_effects.h #defines) ───────────
// Définis dans l'ordre, certains référencent les précédents
// (ITEM3_STATUS_ALL = OR de ITEM3_*, ITEM5_FRIENDSHIP_ALL = OR de ITEM5_*).
const sym = new Map();

/** Retire une (et une seule à la fois) paire de parenthèses englobant
 *  TOUTE l'expression. `(A | B | C)` → `A | B | C` ; `((u8) -1)` →
 *  `(u8) -1` ; mais `(u8) -1` est laissé tel quel (le `(` n'enveloppe
 *  pas tout). Itère pour les double-parenthèses. */
function stripWrapping(s0) {
  let s = s0.trim();
  while (s[0] === '(') {
    let d = 0, j = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') d++;
      else if (s[i] === ')') { d--; if (d === 0) { j = i; break; } }
    }
    if (j === s.length - 1) s = s.slice(1, j).trim();
    else break;
  }
  return s;
}

/** Évalue une expression d'octet : termes OR-combinés, chaque terme étant
 *  un symbole connu / décimal / hex / `1 << n` / `(u8) -N` / négatif. */
function evalExpr(raw) {
  const s = stripWrapping(raw.trim());
  const orParts = splitTopLevelOr(s);
  let acc = 0;
  for (const p of orParts) acc |= term(p.trim());
  return u8(acc);
}

/** Découpe sur les `|` de profondeur 0 (les parenthèses comme `(u8) -1`
 *  ne contiennent pas de `|`, mais on reste robuste). */
function splitTopLevelOr(s) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === '|' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

function term(t0) {
  let t = t0.trim();
  // (u8) -1  / ((u8) -1) / (u8)-2  → octet signé
  let m = t.match(/^\(*\s*\(u8\)\s*(-?\d+)\s*\)*$/);
  if (m) return u8(parseInt(m[1], 10));
  // a << b
  m = t.match(/^\(*\s*(\d+)\s*<<\s*(\d+)\s*\)*$/);
  if (m) return u8(Number(m[1]) << Number(m[2]));
  // hex
  m = t.match(/^\(*\s*(0x[0-9a-fA-F]+)\s*\)*$/);
  if (m) return u8(parseInt(m[1], 16));
  // décimal (potentiellement négatif)
  m = t.match(/^\(*\s*(-?\d+)\s*\)*$/);
  if (m) return u8(parseInt(m[1], 10));
  // symbole connu
  const name = t.replace(/^\(+|\)+$/g, '').trim();
  if (sym.has(name)) return sym.get(name);
  throw new Error(`item-effects: terme non résolu "${t0}"`);
}

{
  const src = readFileSync(IE_CONST, 'utf8');
  // #define NAME EXPR   (EXPR peut être `(A | B | C)`, `((u8) -1)`, 0xNN, N)
  for (const mm of src.matchAll(/^#define\s+(ITEM[0-9]_[A-Z0-9_]+|ITEM6_[A-Z0-9_]+)\s+(.+?)\s*(?:\/\/.*)?$/gm)) {
    const nm = mm[1];
    const expr = mm[2].trim();
    sym.set(nm, evalExpr(expr));
  }
}

// Garde-fous : valeurs canoniques attendues (item_effects.h).
const EXPECT_SYM = {
  ITEM3_STATUS_ALL: 0x3F, ITEM4_HEAL_HP: 0x04, ITEM4_REVIVE: 0x40,
  ITEM5_FRIENDSHIP_ALL: 0xE0, ITEM6_HEAL_HP_FULL: 255, ITEM6_HEAL_HP_HALF: 254,
  ITEM6_HEAL_PP_FULL: 0x7F, ITEM6_ADD_EV: 10, ITEM6_SUBTRACT_EV: u8(-10),
  ITEM0_DIRE_HIT: 0x30,
};
for (const [k, v] of Object.entries(EXPECT_SYM)) {
  if (sym.get(k) !== v) {
    console.error(`[extract item-effects] symbole ${k}=${sym.get(k)} attendu ${v}`);
    process.exit(2);
  }
}

// ─── 2) items.h : ITEM_NAME -> id numérique (+ alias FIRST/LAST_BERRY) ──────
const itemId = new Map();
{
  const src = readFileSync(ITEMS, 'utf8');
  for (const mm of src.matchAll(/^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) {
    itemId.set(mm[1], Number(mm[2]));
  }
  // alias : #define LAST_BERRY_INDEX ITEM_ENIGMA_BERRY
  for (const mm of src.matchAll(/^#define\s+((?:FIRST|LAST)_BERRY_INDEX)\s+(ITEM_[A-Z0-9_]+)\s*$/gm)) {
    if (itemId.has(mm[2])) itemId.set(mm[1], itemId.get(mm[2]));
  }
}
const ITEM_POTION = itemId.get('ITEM_POTION');
if (ITEM_POTION !== 13) { console.error('ITEM_POTION attendu 13'); process.exit(2); }

// ─── 3) src/data/pokemon/item_effects.h : arrays + macros + table ──────────
const data = readFileSync(IE_DATA, 'utf8');

// 3a) macros d'aide → liste d'entrées {idx, val} (val peut dépendre du param)
//   VITAMIN_FRIENDSHIP_CHANGE(i) : [i+0]=5,[i+1]=3,[i+2]=2
//   STAT_BOOST_FRIENDSHIP_CHANGE : [6]=1,[7]=1
//   EV_BERRY_FRIENDSHIP_CHANGE   : [7]=10,[8]=5,[9]=2
function expandMacro(name, argRaw) {
  const arg = argRaw != null ? Number(argRaw) : 0;
  if (name === 'VITAMIN_FRIENDSHIP_CHANGE') return [[arg + 0, 5], [arg + 1, 3], [arg + 2, 2]];
  if (name === 'STAT_BOOST_FRIENDSHIP_CHANGE') return [[6, 1], [7, 1]];
  if (name === 'EV_BERRY_FRIENDSHIP_CHANGE') return [[7, 10], [8, 5], [9, 2]];
  throw new Error(`macro item-effect inconnue: ${name}`);
}

// 3b) chaque `const u8 gItemEffect_NAME[SIZE] = { ... };`
const arrays = new Map(); // gItemEffect_NAME -> number[size]
for (const mm of data.matchAll(/const\s+u8\s+(gItemEffect_\w+)\s*\[\s*(\d+)\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) {
  const nm = mm[1];
  const size = Number(mm[2]);
  let body = mm[3];
  // retire les commentaires de ligne
  body = body.replace(/\/\/[^\n]*/g, '');
  const bytes = new Array(size).fill(0);

  // remplace les invocations de macro par leurs entrées [i]=v
  // (VITAMIN_FRIENDSHIP_CHANGE(7) / STAT_BOOST_FRIENDSHIP_CHANGE / EV_BERRY_FRIENDSHIP_CHANGE)
  const macroEntries = [];
  body = body.replace(/\b(VITAMIN_FRIENDSHIP_CHANGE|STAT_BOOST_FRIENDSHIP_CHANGE|EV_BERRY_FRIENDSHIP_CHANGE)\b(?:\s*\(\s*(\d+)\s*\))?/g,
    (_, mName, mArg) => { for (const e of expandMacro(mName, mArg)) macroEntries.push(e); return ''; });
  for (const [idx, val] of macroEntries) {
    if (idx < 0 || idx >= size) { console.error(`${nm}: macro idx ${idx} hors [0,${size})`); process.exit(2); }
    bytes[idx] = u8(val);
  }

  // initialiseurs désignés `[idx] = EXPR`
  for (const em of body.matchAll(/\[\s*(\d+)\s*\]\s*=\s*([^,\[\]}]+?)\s*(?=,|$)/g)) {
    const idx = Number(em[1]);
    const expr = em[2].trim();
    if (!expr) continue;
    if (idx < 0 || idx >= size) { console.error(`${nm}: idx ${idx} hors [0,${size})`); process.exit(2); }
    bytes[idx] = evalExpr(expr);
  }
  arrays.set(nm, bytes);
}

// 3c) gItemEffectTable[] = { [ITEM_X - ITEM_POTION] = gItemEffect_Y, ... }
const tableM = data.match(/gItemEffectTable\[\]\s*=\s*\{([\s\S]*?)\}\s*;/);
if (!tableM) { console.error('gItemEffectTable introuvable'); process.exit(2); }
const byId = {};
let nullCount = 0;
for (const em of tableM[1].matchAll(/\[\s*(ITEM_[A-Z0-9_]+|LAST_BERRY_INDEX|FIRST_BERRY_INDEX)\s*-\s*ITEM_POTION\s*\]\s*=\s*(gItemEffect_\w+|NULL)/g)) {
  const itemName = em[1];
  const tgt = em[2];
  if (!itemId.has(itemName)) { console.error(`item inconnu dans table: ${itemName}`); process.exit(2); }
  const id = itemId.get(itemName);
  if (tgt === 'NULL') { nullCount++; continue; }
  if (!arrays.has(tgt)) { console.error(`array inconnu: ${tgt}`); process.exit(2); }
  byId[id] = { name: itemName, size: arrays.get(tgt).length, bytes: arrays.get(tgt) };
}

// ─── Garde-fous golden (1:1 vérifiables à la main vs décomp) ───────────────
const GOLD = {
  // ITEM_POTION=13 : [4]=ITEM4_HEAL_HP(4), [6]=20
  13: [0, 0, 0, 0, 4, 0, 20],
  // ITEM_FULL_RESTORE=19 : [3]=STATUS_ALL(0x3F), [4]=HEAL_HP(4), [6]=HP_FULL(255)
  19: [0, 0, 0, 0x3F, 4, 0, 255],
  // ITEM_REVIVE=24 : [4]=REVIVE|HEAL_HP (0x44), [6]=HP_HALF(254)  ← bug ancien JSON
  24: [0, 0, 0, 0, 0x44, 0, 254],
};
for (const [id, exp] of Object.entries(GOLD)) {
  const got = byId[id]?.bytes;
  if (!got || JSON.stringify(got) !== JSON.stringify(exp)) {
    console.error(`[extract item-effects] golden id=${id} got=${JSON.stringify(got)} exp=${JSON.stringify(exp)}`);
    process.exit(2);
  }
}

const out = {
  _meta: {
    source: 'pokeemerald src/data/pokemon/item_effects.h (gItemEffectTable)',
    itemPotion: ITEM_POTION,
    count: Object.keys(byId).length,
    nullEntries: nullCount,
    note: 'byId[itemId] === gItemEffectTable[itemId - ITEM_POTION] (entrées non-NULL). bytes = const u8 itemEffect[] exact (OR/macros/(u8)-N résolus).',
  },
  byId,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`[extract item-effects] OK : ${Object.keys(byId).length} items, ${nullCount} NULL, golden ✓ → ${OUT.split('/').pop()}`);

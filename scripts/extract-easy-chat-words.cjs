#!/usr/bin/env node
/**
 * extract-easy-chat-words.cjs
 *
 * Extrait les données de mots easy_chat (FR) du décomp → JSON consommable.
 *
 * Source : decomps/pokeemeraude/src/data/easy_chat/easy_chat_group_*.h
 *          + include/constants/easy_chat.h (EC_WORD_* → group/index).
 *
 * Sortie : public/decomp/em/easy_chat/words.json =
 *   { "groupValues": { "EC_GROUP_X": n, ... },
 *     "groups": { "<groupValue>": ["texte index0", "texte index1", ...], ... } }
 *
 * Les groupes POKEMON(0)/POKEMON_NATIONAL/MOVE_1/MOVE_2 ne sont PAS émis ici
 * (le getter 1:1 les route vers gSpeciesNames/gMoveNames).
 *
 * 1:1 : `gEasyChatGroup_X[]` est indexé `[EC_INDEX(EC_WORD_Y)]` ; EC_WORD_Y =
 * `((EC_GROUP_Z << 9) | N)` → index = N. `.text = gEasyChatWord_W` → la string
 * `_("...")`.
 */
const fs = require('node:fs');
const path = require('node:path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const CONST_H = path.join(DECOMP, 'include/constants/easy_chat.h');
const DATA_DIR = path.join(DECOMP, 'src/data/easy_chat');
const OUT = 'D:/Projet 1/pokemon-web-demo/src/game/data/easy-chat-words.ts';

const EC_MASK_BITS = 9;
const EC_MASK_INDEX = (1 << EC_MASK_BITS) - 1;

// ─── 1. Parse constants/easy_chat.h ──────────────────────────────────────────
const constSrc = fs.readFileSync(CONST_H, 'utf8');

// EC_GROUP_X = value
const groupValues = {};
for (const m of constSrc.matchAll(/#define\s+(EC_GROUP_\w+)\s+(\d+)/g)) {
  groupValues[m[1]] = Number(m[2]);
}

// EC_WORD_X = ((EC_GROUP_Y << EC_MASK_BITS) | N)  → {group, index}
const ecWord = {}; // EC_WORD_X → { groupName, groupVal, index }
for (const m of constSrc.matchAll(/#define\s+(EC_WORD_\w+)\s+\(\(\s*(EC_GROUP_\w+)\s*<<\s*EC_MASK_BITS\s*\)\s*\|\s*(\d+)\s*\)/g)) {
  const [, word, groupName, idxStr] = m;
  const groupVal = groupValues[groupName];
  ecWord[word] = { groupName, groupVal, index: Number(idxStr) };
}
console.log(`[easy-chat] groups=${Object.keys(groupValues).length} EC_WORD defs=${Object.keys(ecWord).length}`);

// ─── 2. Parse chaque fichier de groupe ───────────────────────────────────────
// Groupes routés vers gSpeciesNames/gMoveNames → on skip leurs données.
const NAME_GROUPS = new Set(['EC_GROUP_POKEMON', 'EC_GROUP_POKEMON_NATIONAL', 'EC_GROUP_MOVE_1', 'EC_GROUP_MOVE_2']);

const groups = {}; // groupVal → { index → text }
let totalWords = 0;

for (const file of fs.readdirSync(DATA_DIR)) {
  if (!/^easy_chat_group_.*\.h$/.test(file)) continue;
  const src = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');

  // a. symbol → text : const u8 gEasyChatWord_X[] = _("TEXT");
  const sym2text = {};
  for (const m of src.matchAll(/const\s+u8\s+(gEasyChatWord_\w+)\s*\[\s*\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/g)) {
    sym2text[m[1]] = m[2];
  }

  // b. array entries : [EC_INDEX(EC_WORD_X)] = { .text = gEasyChatWord_Y, ... }
  // (l'index VIENT de la constante EC_WORD_X, pas de l'ordre d'apparition.)
  for (const m of src.matchAll(/\[\s*EC_INDEX\(\s*(EC_WORD_\w+)\s*\)\s*\]\s*=\s*\{[^}]*?\.text\s*=\s*(gEasyChatWord_\w+)/g)) {
    const [, word, sym] = m;
    const info = ecWord[word];
    if (!info) { console.warn(`  ⚠️ ${word} absent des constantes (file ${file})`); continue; }
    if (NAME_GROUPS.has(info.groupName)) continue; // routé vers names
    const text = sym2text[sym];
    if (text === undefined) { console.warn(`  ⚠️ ${sym} sans string (file ${file})`); continue; }
    if (!groups[info.groupVal]) groups[info.groupVal] = {};
    groups[info.groupVal][info.index] = text;
    totalWords++;
  }
}

// ─── 3. Densifier en tableaux (index 0..max) ─────────────────────────────────
const groupArrays = {};
for (const gv of Object.keys(groups)) {
  const obj = groups[gv];
  const maxIdx = Math.max(...Object.keys(obj).map(Number));
  const arr = new Array(maxIdx + 1).fill('');
  for (const idx of Object.keys(obj)) arr[Number(idx)] = obj[idx];
  groupArrays[gv] = arr;
}

// ─── 4. Émettre un module TS bundlé (import synchrone, pas de fetch) ─────────
const groupKeys = Object.keys(groupArrays).map(Number).sort((a, b) => a - b);
let ts = `// AUTO-GÉNÉRÉ par scripts/extract-easy-chat-words.cjs — NE PAS ÉDITER À LA MAIN.\n`;
ts += `// Données de mots easy_chat (FR) 1:1 décomp src/data/easy_chat/easy_chat_group_*.h.\n`;
ts += `// Indexé par valeur de groupe EC_GROUP_* → tableau[EC_INDEX] = texte (1:1 .text).\n`;
ts += `// Groupes POKEMON/POKEMON_NATIONAL/MOVE_1/MOVE_2 absents (routés vers gSpeciesNames/gMoveNames).\n\n`;
ts += `export const gEasyChatWordsByGroup: Readonly<Record<number, readonly string[]>> = {\n`;
for (const gv of groupKeys) {
  const arr = groupArrays[gv];
  const items = arr.map((s) => JSON.stringify(s)).join(', ');
  ts += `  ${gv}: [${items}],\n`;
}
ts += `};\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, ts, 'utf8');
console.log(`[easy-chat] ${totalWords} mots, ${groupKeys.length} groupes data → ${OUT}`);
// Spot-check
const g4 = groupArrays['4']; // GREETINGS
if (g4) console.log(`  GREETINGS[0..3] = ${JSON.stringify(g4.slice(0, 4))}`);

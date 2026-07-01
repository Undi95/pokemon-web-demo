#!/usr/bin/env node
/**
 * extract-easy-chat-data.cjs
 *
 * Extrait les DONNÉES COMPLÈTES easy_chat (au-delà du texte seul de
 * extract-easy-chat-words.cjs) nécessaires à l'ÉCRAN DE SAISIE (mail write) :
 *
 *   - gEasyChatGroups[]  : 1:1 src/data/easy_chat/easy_chat_groups.h
 *       word-groups → wordData.words[canonicalIndex] = {text, alphabeticalOrder, enabled}
 *       name-groups (POKEMON/POKEMON_NATIONAL/MOVE_1/MOVE_2) → wordData.valueList = [id,...]
 *       + numWords + numEnabledWords (avec les ajustements `- N` du décomp).
 *   - gEasyChatWordsByLetterPointers[] : 1:1 easy_chat_words_by_letter.h
 *       liste compressée (EC_EMPTY_WORD, count, alt0, alt1... pour DOUBLE_SPECIES_NAME).
 *   - sRestrictedWordSpecies / sDefaultProfileWords / sDefaultBattleStart|Won|Lost
 *   - sMysteryGiftPhrase / sBerryMasterWifePhrases / sAlphabetGroupIdMap
 *
 * Résolution : EC_GROUP_*, EC_WORD_*, SPECIES_*, MOVE_*, EC_POKEMON/EC_MOVE/
 * EC_POKEMON_NATIONAL, DOUBLE_SPECIES_NAME, EC_EMPTY_WORD.
 *
 * Sortie : src/data/easy-chat-data.ts (bundlé TS, synchrone).
 */
const fs = require('node:fs');
const path = require('node:path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const CONST_H = path.join(DECOMP, 'include/constants/easy_chat.h');
const SPECIES_H = path.join(DECOMP, 'include/constants/species.h');
const MOVES_H = path.join(DECOMP, 'include/constants/moves.h');
const DATA_DIR = path.join(DECOMP, 'src/data/easy_chat');
const EASY_CHAT_C = path.join(DECOMP, 'src/easy_chat.c');
const STRINGS_C = path.join(DECOMP, 'src/strings.c');
const OUT = 'D:/Projet 1/pokemon-web-demo/src/data/easy-chat-data.ts';

const EC_MASK_BITS = 9;
const EC_EMPTY_WORD = 0xffff;

// ─── Helpers de parsing de #define numériques ────────────────────────────────
function parseDefines(file, prefix) {
  const src = fs.readFileSync(file, 'utf8');
  const map = {};
  const re = new RegExp(`#define\\s+(${prefix}\\w+)\\s+(\\d+)\\b`, 'g');
  for (const m of src.matchAll(re)) map[m[1]] = Number(m[2]);
  return map;
}

const constSrc = fs.readFileSync(CONST_H, 'utf8');

// EC_GROUP_X = N
const EC_GROUP = {};
for (const m of constSrc.matchAll(/#define\s+(EC_GROUP_\w+)\s+(\d+)/g)) EC_GROUP[m[1]] = Number(m[2]);

const SPECIES = parseDefines(SPECIES_H, 'SPECIES_');
const MOVE = parseDefines(MOVES_H, 'MOVE_');

// EC_WORD_X = ((EC_GROUP_Y << EC_MASK_BITS) | N)
const EC_WORD = {};
for (const m of constSrc.matchAll(
  /#define\s+(EC_WORD_\w+)\s+\(\(\s*(EC_GROUP_\w+)\s*<<\s*EC_MASK_BITS\s*\)\s*\|\s*(\d+)\s*\)/g,
)) {
  const groupVal = EC_GROUP[m[2]];
  EC_WORD[m[1]] = (groupVal << EC_MASK_BITS) | Number(m[3]);
}

console.log(
  `[ec-data] groups=${Object.keys(EC_GROUP).length} words=${Object.keys(EC_WORD).length} species=${Object.keys(SPECIES).length} moves=${Object.keys(MOVE).length}`,
);

// ─── Résolveur de token EC (utilisé par words-by-letter + phrases) ───────────
function resolveEcToken(tok) {
  tok = tok.trim();
  if (tok === '' ) return null;
  if (tok === 'EC_EMPTY_WORD') return EC_EMPTY_WORD;
  if (/^\d+$/.test(tok)) return Number(tok); // ex: le "2" de DOUBLE_SPECIES_NAME
  let m;
  if ((m = tok.match(/^EC_POKEMON_NATIONAL\(\s*(\w+)\s*\)$/))) {
    return (EC_GROUP.EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) | SPECIES['SPECIES_' + m[1]];
  }
  if ((m = tok.match(/^EC_POKEMON\(\s*(\w+)\s*\)$/))) {
    return (EC_GROUP.EC_GROUP_POKEMON << EC_MASK_BITS) | SPECIES['SPECIES_' + m[1]];
  }
  if ((m = tok.match(/^EC_MOVE\(\s*(\w+)\s*\)$/))) {
    return (EC_GROUP.EC_GROUP_MOVE_1 << EC_MASK_BITS) | MOVE['MOVE_' + m[1]];
  }
  if ((m = tok.match(/^EC_MOVE2\(\s*(\w+)\s*\)$/))) {
    return (EC_GROUP.EC_GROUP_MOVE_2 << EC_MASK_BITS) | MOVE['MOVE_' + m[1]];
  }
  if ((m = tok.match(/^EC_WORD_\w+$/))) {
    if (EC_WORD[tok] === undefined) throw new Error(`EC_WORD inconnu: ${tok}`);
    return EC_WORD[tok];
  }
  throw new Error(`token EC non résolu: ${tok}`);
}

// ─── 1. Parse chaque header de groupe (words + valueList + sym→text) ─────────
const sym2text = {};       // gEasyChatWord_X → "TEXTE"
const wordArrays = {};     // gEasyChatGroup_Y (words) → {canonicalIndex: {text, alphabeticalOrder, enabled}}
const valueListArrays = {}; // gEasyChatGroup_Y (valueList) → [numériques]

for (const file of fs.readdirSync(DATA_DIR)) {
  if (!/^easy_chat_group_.*\.h$/.test(file)) continue;
  const src = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');

  for (const m of src.matchAll(/const\s+u8\s+(gEasyChatWord_\w+)\s*\[\s*\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/g)) {
    sym2text[m[1]] = m[2];
  }

  // words[] : const struct EasyChatWordInfo gEasyChatGroup_Y[] = { [EC_INDEX(EC_WORD_X)] = {...}, ... };
  for (const arrM of src.matchAll(
    /const\s+struct\s+EasyChatWordInfo\s+(gEasyChatGroup_\w+)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\n\};/g,
  )) {
    const arrName = arrM[1];
    const body = arrM[2];
    const entries = {};
    for (const e of body.matchAll(
      /\[\s*EC_INDEX\(\s*(EC_WORD_\w+)\s*\)\s*\]\s*=\s*\{\s*\.text\s*=\s*(gEasyChatWord_\w+)\s*,\s*\.alphabeticalOrder\s*=\s*(\d+)\s*,\s*\.enabled\s*=\s*(TRUE|FALSE)\s*,?\s*\}/g,
    )) {
      const [, word, sym, alpha, enabled] = e;
      const idx = EC_WORD[word] & ((1 << EC_MASK_BITS) - 1); // EC_INDEX
      entries[idx] = {
        text: sym2text[sym],
        alphabeticalOrder: Number(alpha),
        enabled: enabled === 'TRUE',
      };
    }
    wordArrays[arrName] = entries;
  }

  // valueList[] : const u16 gEasyChatGroup_Y[] = { SPECIES_A, ... }; ou { MOVE_A, ... };
  for (const arrM of src.matchAll(/const\s+u16\s+(gEasyChatGroup_\w+)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\n\};/g)) {
    const arrName = arrM[1];
    const vals = [];
    for (const tok of arrM[2].split(',')) {
      const t = tok.trim();
      if (!t) continue;
      if (t.startsWith('SPECIES_')) vals.push(SPECIES[t]);
      else if (t.startsWith('MOVE_')) vals.push(MOVE[t]);
      else throw new Error(`valueList token inconnu (${arrName}): ${t}`);
    }
    valueListArrays[arrName] = vals;
  }
}

// ─── 2. Parse easy_chat_groups.h → gEasyChatGroups indexé par EC_GROUP ──────
const groupsSrc = fs.readFileSync(path.join(DATA_DIR, 'easy_chat_groups.h'), 'utf8');
const gEasyChatGroups = {}; // groupVal → {wordData:{words|valueList}, numWords, numEnabledWords}

for (const m of groupsSrc.matchAll(
  /\[\s*(EC_GROUP_\w+)\s*\]\s*=\s*\{\s*\.wordData\s*=\s*\{\s*\.(valueList|words)\s*=\s*(gEasyChatGroup_\w+)\s*\}\s*,\s*\.numWords\s*=\s*ARRAY_COUNT\([^)]+\)\s*,\s*\.numEnabledWords\s*=\s*ARRAY_COUNT\([^)]+\)(\s*-\s*(\d+))?\s*,[^}]*\}/g,
)) {
  const [, groupName, kind, arrName, , minusStr] = m;
  const groupVal = EC_GROUP[groupName];
  const minus = minusStr ? Number(minusStr) : 0;

  if (kind === 'valueList') {
    const vals = valueListArrays[arrName];
    if (!vals) throw new Error(`valueList array manquant: ${arrName}`);
    gEasyChatGroups[groupVal] = {
      valueList: vals,
      numWords: vals.length,
      numEnabledWords: vals.length - minus,
    };
  } else {
    const entries = wordArrays[arrName];
    if (!entries) throw new Error(`words array manquant: ${arrName}`);
    const maxIdx = Math.max(...Object.keys(entries).map(Number));
    const words = [];
    for (let i = 0; i <= maxIdx; i++) {
      words.push(entries[i] || { text: '', alphabeticalOrder: 0, enabled: false });
    }
    gEasyChatGroups[groupVal] = {
      words,
      numWords: words.length,
      numEnabledWords: words.length - minus,
    };
  }
}

// ─── 3. Parse words_by_letter.h → gEasyChatWordsByLetterPointers ─────────────
const wblSrc = fs.readFileSync(path.join(DATA_DIR, 'easy_chat_words_by_letter.h'), 'utf8');
const wblArrays = {}; // gEasyChatWordsByLetter_X → [numériques]
for (const m of wblSrc.matchAll(/const\s+u16\s+(gEasyChatWordsByLetter_\w+)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\n\};/g)) {
  const arrName = m[1];
  // DOUBLE_SPECIES_NAME → "EC_EMPTY_WORD, 2," ; on remplace avant split.
  const body = m[2].replace(/DOUBLE_SPECIES_NAME/g, 'EC_EMPTY_WORD, 2,');
  const vals = [];
  for (const tok of body.split(',')) {
    const t = tok.trim();
    if (!t) continue;
    vals.push(resolveEcToken(t));
  }
  wblArrays[arrName] = vals;
}
// Ordre pointeur : Others, A..Z (27), puis 18 inutilisés (JP). On émet les 27
// utilisés (SetUnlockedWordsByAlphabet n'itère que EC_NUM_ALPHABET_GROUPS=27).
const wblOrder = [];
for (const m of wblSrc.matchAll(/\.words\s*=\s*(gEasyChatWordsByLetter_\w+)\s*,/g)) wblOrder.push(m[1]);
const gEasyChatWordsByLetterPointers = wblOrder.map((name) => ({
  words: wblArrays[name] || [],
  numWords: (wblArrays[name] || []).length,
}));

// ─── 4. Parse petites tables de easy_chat.c ──────────────────────────────────
const ecSrc = fs.readFileSync(EASY_CHAT_C, 'utf8');
function parseU16Array(name) {
  const re = new RegExp(`static\\s+const\\s+u16\\s+${name}\\s*\\[[^\\]]*\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`);
  const m = ecSrc.match(re);
  if (!m) throw new Error(`table ${name} introuvable`);
  const vals = [];
  for (const tok of m[1].split(',')) {
    const t = tok.trim();
    if (!t) continue;
    if (t.startsWith('SPECIES_')) vals.push(SPECIES[t]);
    else vals.push(resolveEcToken(t));
  }
  return vals;
}
const sRestrictedWordSpecies = parseU16Array('sRestrictedWordSpecies');
const sDefaultProfileWords = parseU16Array('sDefaultProfileWords');
const sDefaultBattleStartWords = parseU16Array('sDefaultBattleStartWords');
const sDefaultBattleWonWords = parseU16Array('sDefaultBattleWonWords');
const sDefaultBattleLostWords = parseU16Array('sDefaultBattleLostWords');
const sMysteryGiftPhrase = parseU16Array('sMysteryGiftPhrase');

// sBerryMasterWifePhrases[][2] — désignateurs [PHRASE_X - 1] = {A, B}
const bmwM = ecSrc.match(/static\s+const\s+u16\s+sBerryMasterWifePhrases\s*\[\s*\]\s*\[\s*2\s*\]\s*=\s*\{([\s\S]*?)\n\};/);
const sBerryMasterWifePhrases = [];
if (bmwM) {
  for (const e of bmwM[1].matchAll(/\[\s*(\w+)\s*-\s*1\s*\]\s*=\s*\{\s*([^,]+),\s*([^}]+)\}/g)) {
    // On suit l'ordre PHRASE_* (les désignateurs sont séquentiels 1..5).
    sBerryMasterWifePhrases.push([resolveEcToken(e[2].trim()), resolveEcToken(e[3].trim())]);
  }
}

// sAlphabetGroupIdMap[4][7]
const agmM = ecSrc.match(/static\s+const\s+u8\s+sAlphabetGroupIdMap\s*\[[^\]]*\]\s*\[[^\]]*\]\s*=\s*\{([\s\S]*?)\n\};/);
const sAlphabetGroupIdMap = [];
if (agmM) {
  for (const row of agmM[1].matchAll(/\{([^}]*)\}/g)) {
    sAlphabetGroupIdMap.push(row[1].split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)));
  }
}

// sEasyChatGroupNamePointers[EC_NUM_GROUPS] — noms de groupes (strings.c FR).
const stringsSrc = fs.readFileSync(STRINGS_C, 'utf8');
const groupNameSym2Text = {};
for (const m of stringsSrc.matchAll(/const\s+u8\s+(gEasyChatGroupName_\w+)\s*\[\s*\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/g)) {
  groupNameSym2Text[m[1]] = m[2];
}
const gnpM = ecSrc.match(/static\s+const\s+u8\s+\*const\s+sEasyChatGroupNamePointers\s*\[[^\]]*\]\s*=\s*\{([\s\S]*?)\n\};/);
const sEasyChatGroupNamePointers = [];
if (gnpM) {
  for (const e of gnpM[1].matchAll(/\[\s*(EC_GROUP_\w+)\s*\]\s*=\s*(gEasyChatGroupName_\w+)\s*,/g)) {
    const gv = EC_GROUP[e[1]];
    sEasyChatGroupNamePointers[gv] = groupNameSym2Text[e[2]];
  }
}

// ─── 4b. sEasyChatScreenTemplates (types/frameId + textes FR résolus) ────────
// EASY_CHAT_TYPE_* (constants/easy_chat.h)
const EASY_CHAT_TYPE = {};
for (const m of constSrc.matchAll(/#define\s+(EASY_CHAT_TYPE_\w+)\s+(\d+)/g)) EASY_CHAT_TYPE[m[1]] = Number(m[2]);
// FRAMEID_* : enum anonyme dans easy_chat.c → indices séquentiels.
const FRAMEID = {};
{
  const em = ecSrc.match(/enum\s*\{([^}]*FRAMEID_GENERAL_2x2[^}]*)\}/);
  if (em) {
    em[1].split(',').map((s) => s.trim().replace(/\/\/.*$/, '').trim()).filter(Boolean)
      .forEach((name, i) => { FRAMEID[name] = i; });
  }
}
// Toutes les strings gText_* (strings.c) → texte FR.
const gText = {};
for (const m of stringsSrc.matchAll(/const\s+u8\s+(gText_\w+)\s*\[\s*\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/g)) {
  gText[m[1]] = m[2];
}
const resolveText = (tok) => {
  const t = tok.trim();
  if (t === 'NULL') return null;
  if (gText[t] === undefined) { console.warn(`  ⚠️ gText inconnu: ${t}`); return null; }
  return gText[t];
};
// Parse le corps de sEasyChatScreenTemplates.
const tmplM = ecSrc.match(/static\s+const\s+struct\s+EasyChatScreenTemplate\s+sEasyChatScreenTemplates\s*\[\s*\]\s*=\s*\{([\s\S]*?)\n\};/);
const sEasyChatScreenTemplates = [];
if (tmplM) {
  for (const e of tmplM[1].matchAll(/\{([\s\S]*?)\n\s*\}/g)) {
    const b = e[1];
    const field = (name) => { const mm = b.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n]+)`)); return mm ? mm[1].trim() : null; };
    sEasyChatScreenTemplates.push({
      type: EASY_CHAT_TYPE[field('type')],
      numColumns: Number(field('numColumns')),
      numRows: Number(field('numRows')),
      frameId: FRAMEID[field('frameId')],
      fourFooterOptions: field('fourFooterOptions') === 'TRUE',
      titleText: resolveText(field('titleText')),
      instructionsText1: resolveText(field('instructionsText1')),
      instructionsText2: resolveText(field('instructionsText2')),
      confirmText1: resolveText(field('confirmText1')),
      confirmText2: resolveText(field('confirmText2')),
    });
  }
}
// Strings de prompt (getters exit/deletion — easy_chat.c GetEasyChatConfirm*Text).
const PROMPT_SYMS = [
  'gText_StopGivingPkmnMail', 'gText_LikeToQuitQuiz', 'gText_ChallengeQuestionMark',
  'gText_QuitEditing', 'gText_AllTextBeingEditedWill', 'gText_BeDeletedThatOkay',
];
const easyChatPromptTexts = {};
for (const s of PROMPT_SYMS) easyChatPromptTexts[s] = gText[s] ?? null;

// ─── 4c. Tables de LAYOUT (bg/window templates, frame dims, footer) ──────────
// Enums FOOTER_* / WIN_* (easy_chat.c anonymes).
function parseAnonEnum(firstMember) {
  const m = ecSrc.match(new RegExp(`enum\\s*\\{([^}]*${firstMember}[^}]*)\\}`));
  const map = {};
  if (m) {
    m[1].split(',').map((s) => s.trim().replace(/\/\/.*$/, '').trim()).filter(Boolean)
      .forEach((name, i) => { map[name] = i; });
  }
  return map;
}
const FOOTER = parseAnonEnum('FOOTER_NORMAL');
const WIN = parseAnonEnum('WIN_TITLE');
const num = (v) => Number(v.trim()); // gère "0x80", "28", etc.

// Parse un bloc `{ .field = val, ... }` → objet {field: rawStr}.
function parseFields(block) {
  const o = {};
  for (const m of block.matchAll(/\.(\w+)\s*=\s*([^,\n}]+)/g)) o[m[1]] = m[2].trim();
  return o;
}
// Extrait le corps `{...}` d'une table nommée.
function tableBody(name, isSingle = false) {
  const re = new RegExp(`${name}\\s*(?:\\[[^\\]]*\\])*\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`);
  const m = ecSrc.match(re);
  return m ? m[1] : null;
}
// Découpe un corps de tableau de structs en blocs `[DESIG] = { ... }` ou `{ ... }`.
function splitStructBlocks(body) {
  const blocks = [];
  const re = /(?:\[\s*(\w+)\s*\]\s*=\s*)?\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(body))) blocks.push({ desig: m[1] || null, body: m[2] });
  return blocks;
}

// sEasyChatBgTemplates (séquentiel).
const bgBody = tableBody('sEasyChatBgTemplates');
const sEasyChatBgTemplates = splitStructBlocks(bgBody).map((b) => {
  const f = parseFields(b.body);
  return {
    bg: num(f.bg), charBaseIndex: num(f.charBaseIndex), mapBaseIndex: num(f.mapBaseIndex),
    screenSize: num(f.screenSize), paletteMode: num(f.paletteMode), priority: num(f.priority),
    baseTile: num(f.baseTile),
  };
});

// sEasyChatWindowTemplates (désignés WIN_* + DUMMY_WIN_TEMPLATE).
const winBody = tableBody('sEasyChatWindowTemplates');
const winArr = [];
for (const b of splitStructBlocks(winBody)) {
  const f = parseFields(b.body);
  const t = {
    bg: num(f.bg), tilemapLeft: num(f.tilemapLeft), tilemapTop: num(f.tilemapTop),
    width: num(f.width), height: num(f.height), paletteNum: num(f.paletteNum), baseBlock: num(f.baseBlock),
  };
  const idx = b.desig ? WIN[b.desig] : winArr.length;
  winArr[idx] = t;
}
// DUMMY_WIN_TEMPLATE (terminateur bg=0xFF) — le split ne l'attrape pas (macro), on l'ajoute.
if (/DUMMY_WIN_TEMPLATE/.test(winBody)) {
  winArr.push({ bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 });
}
const sEasyChatWindowTemplates = winArr;

// sEasyChatYesNoWindowTemplate (single).
const ynBody = tableBody('sEasyChatYesNoWindowTemplate', true);
const ynF = parseFields(ynBody);
const sEasyChatYesNoWindowTemplate = {
  bg: num(ynF.bg), tilemapLeft: num(ynF.tilemapLeft), tilemapTop: num(ynF.tilemapTop),
  width: num(ynF.width), height: num(ynF.height), paletteNum: num(ynF.paletteNum), baseBlock: num(ynF.baseBlock),
};

// sPhraseFrameDimensions (désignés FRAMEID_*).
const pfBody = tableBody('sPhraseFrameDimensions');
const pfArr = [];
for (const b of splitStructBlocks(pfBody)) {
  const f = parseFields(b.body);
  const footerId = FOOTER[f.footerId] !== undefined ? FOOTER[f.footerId]
    : (f.footerId === 'NUM_FOOTER_TYPES' ? Object.keys(FOOTER).filter((k) => k.startsWith('FOOTER_')).length : Number(f.footerId));
  const idx = FRAMEID[b.desig];
  pfArr[idx] = { left: num(f.left), top: num(f.top), width: num(f.width), height: num(f.height), footerId };
}
const sPhraseFrameDimensions = pfArr;

// sAlphabetKeyboardColumnOffsets (flat).
const akm = ecSrc.match(/sAlphabetKeyboardColumnOffsets\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}/);
const sAlphabetKeyboardColumnOffsets = akm ? akm[1].split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)) : [];

// sFooterOptionXOffsets (désignés FOOTER_*, 4 nums).
const foBody = tableBody('sFooterOptionXOffsets');
const foArr = [];
for (const m of foBody.matchAll(/\[\s*(FOOTER_\w+)\s*\]\s*=\s*\{([^}]*)\}/g)) {
  foArr[FOOTER[m[1]]] = m[2].split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
}
const sFooterOptionXOffsets = foArr;

// sFooterTextOptions (désignés FOOTER_*, 4 gText/NULL → FR).
const ftBody = tableBody('sFooterTextOptions');
const ftArr = [];
for (const m of ftBody.matchAll(/\[\s*(FOOTER_\w+)\s*\]\s*=\s*\{([^}]*)\}/g)) {
  ftArr[FOOTER[m[1]]] = m[2].split(',').map((s) => {
    const t = s.trim();
    if (t === 'NULL' || t === '') return null;
    return gText[t] ?? null;
  }).filter((_, i, a) => i < 4);
}
const sFooterTextOptions = ftArr;

// sText_Clear17 = {CLEAR 17} = EXT_CTRL_CODE_BEGIN(0xFC), EXT_CTRL_CODE_CLEAR(0x11), 17, EOS(0xFF).
const sText_Clear17 = [0xFC, 0x11, 17, 0xFF];

// ─── 5. Émettre le module TS ─────────────────────────────────────────────────
const groupVals = Object.keys(gEasyChatGroups).map(Number).sort((a, b) => a - b);
let ts = `// AUTO-GÉNÉRÉ par scripts/extract-easy-chat-data.cjs — NE PAS ÉDITER À LA MAIN.\n`;
ts += `// Données complètes easy_chat pour l'écran de saisie (mail write), 1:1 décomp.\n`;
ts += `// Source : src/data/easy_chat/easy_chat_groups.h + easy_chat_words_by_letter.h + easy_chat.c.\n`;
ts += `// Types = ceux du renderer (import type) → injectables directement via _setG*.\n\n`;
ts += `import type { EasyChatGroup, EasyChatWordsByLetter, EasyChatPhraseFrameDimensions } from '../engine/ui/easy-chat-render';\n`;
ts += `import type { BgTemplate, WindowTemplate } from '../window';\n\n`;

// gEasyChatGroups en tableau dense indexé par groupVal (0..21), shape 1:1 EasyChatGroup.
const maxGroup = Math.max(...groupVals);
ts += `/** 1:1 gEasyChatGroups[] (indexé par EC_GROUP_*). */\n`;
ts += `export const gEasyChatGroups: EasyChatGroup[] = [\n`;
for (let gv = 0; gv <= maxGroup; gv++) {
  const g = gEasyChatGroups[gv];
  if (!g) { ts += `  { wordData: {}, numWords: 0, numEnabledWords: 0 }, // ${gv} (absent)\n`; continue; }
  if (g.valueList) {
    ts += `  { wordData: { valueList: [${g.valueList.join(', ')}] }, numWords: ${g.numWords}, numEnabledWords: ${g.numEnabledWords} }, // ${gv}\n`;
  } else {
    const words = g.words
      .map((w) => `{ text: ${JSON.stringify(w.text)}, alphabeticalOrder: ${w.alphabeticalOrder}, enabled: ${w.enabled ? 1 : 0} }`)
      .join(', ');
    ts += `  { wordData: { words: [${words}] }, numWords: ${g.numWords}, numEnabledWords: ${g.numEnabledWords} }, // ${gv}\n`;
  }
}
ts += `];\n\n`;

ts += `/** 1:1 gEasyChatWordsByLetterPointers[] (Others, A..Z ; 27 utilisés). */\n`;
ts += `export const gEasyChatWordsByLetterPointers: EasyChatWordsByLetter[] = [\n`;
for (const e of gEasyChatWordsByLetterPointers) {
  ts += `  { words: [${e.words.join(', ')}], numWords: ${e.numWords} },\n`;
}
ts += `];\n\n`;

const emitArr = (name, arr) => `export const ${name}: number[] = [${arr.join(', ')}];\n`;
ts += emitArr('sRestrictedWordSpecies', sRestrictedWordSpecies);
ts += emitArr('sDefaultProfileWords', sDefaultProfileWords);
ts += emitArr('sDefaultBattleStartWords', sDefaultBattleStartWords);
ts += emitArr('sDefaultBattleWonWords', sDefaultBattleWonWords);
ts += emitArr('sDefaultBattleLostWords', sDefaultBattleLostWords);
ts += emitArr('sMysteryGiftPhrase', sMysteryGiftPhrase);
ts += `export const sBerryMasterWifePhrases: Array<[number, number]> = [${sBerryMasterWifePhrases
  .map((p) => `[${p[0]}, ${p[1]}]`)
  .join(', ')}];\n`;
ts += `export const sAlphabetGroupIdMap: number[][] = [\n${sAlphabetGroupIdMap
  .map((r) => `  [${r.join(', ')}],`)
  .join('\n')}\n];\n`;
ts += `export const sEasyChatGroupNamePointers: string[] = [${sEasyChatGroupNamePointers
  .map((s) => JSON.stringify(s))
  .join(', ')}];\n`;

// ── Tables de layout (rendu) ──
const j = JSON.stringify;
ts += `\n// ─── Layout (rendu écran de saisie) ───\n`;
ts += `export const sEasyChatBgTemplates: BgTemplate[] = ${j(sEasyChatBgTemplates)};\n`;
ts += `export const sEasyChatWindowTemplates: WindowTemplate[] = ${j(sEasyChatWindowTemplates)};\n`;
ts += `export const sEasyChatYesNoWindowTemplate: WindowTemplate = ${j(sEasyChatYesNoWindowTemplate)};\n`;
ts += `export const sPhraseFrameDimensions: EasyChatPhraseFrameDimensions[] = ${j(sPhraseFrameDimensions)};\n`;
ts += `export const sAlphabetKeyboardColumnOffsets: number[] = ${j(sAlphabetKeyboardColumnOffsets)};\n`;
ts += `export const sFooterOptionXOffsets: number[][] = ${j(sFooterOptionXOffsets)};\n`;
ts += `export const sFooterTextOptions: Array<Array<string | null>> = ${j(sFooterTextOptions)};\n`;
ts += `export const sText_Clear17: number[] = ${j(sText_Clear17)};\n`;

ts += `\nexport interface EasyChatScreenTemplateData {\n`;
ts += `  type: number; numColumns: number; numRows: number; frameId: number; fourFooterOptions: boolean;\n`;
ts += `  titleText: string | null; instructionsText1: string | null; instructionsText2: string | null;\n`;
ts += `  confirmText1: string | null; confirmText2: string | null;\n`;
ts += `}\n`;
ts += `/** 1:1 sEasyChatScreenTemplates[] (easy_chat.c:428). */\n`;
ts += `export const sEasyChatScreenTemplates: EasyChatScreenTemplateData[] = [\n`;
for (const t of sEasyChatScreenTemplates) {
  ts += `  { type: ${t.type}, numColumns: ${t.numColumns}, numRows: ${t.numRows}, frameId: ${t.frameId}, fourFooterOptions: ${t.fourFooterOptions}, titleText: ${JSON.stringify(t.titleText)}, instructionsText1: ${JSON.stringify(t.instructionsText1)}, instructionsText2: ${JSON.stringify(t.instructionsText2)}, confirmText1: ${JSON.stringify(t.confirmText1)}, confirmText2: ${JSON.stringify(t.confirmText2)} },\n`;
}
ts += `];\n`;
ts += `export const easyChatPromptTexts = {\n`;
for (const [k, v] of Object.entries(easyChatPromptTexts)) ts += `  ${k}: ${JSON.stringify(v)},\n`;
ts += `};\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, ts, 'utf8');

// ─── Récap / spot-checks ─────────────────────────────────────────────────────
console.log(`[ec-data] gEasyChatGroups: ${groupVals.length} groupes → ${OUT}`);
console.log(`  POKEMON(0) valueList len = ${gEasyChatGroups[0]?.valueList?.length}`);
console.log(`  TRAINER(1) numWords=${gEasyChatGroups[1].numWords} numEnabled=${gEasyChatGroups[1].numEnabledWords} (attendu -6)`);
console.log(`  ACTIONS(11) word[0]=${JSON.stringify(gEasyChatGroups[11].words[0])}`);
console.log(`  wordsByLetter: ${gEasyChatWordsByLetterPointers.length} groupes ; A numWords=${gEasyChatWordsByLetterPointers[1]?.numWords}`);
console.log(`  sDefaultBattleWonWords=${JSON.stringify(sDefaultBattleWonWords)}`);
console.log(`  sBerryMasterWifePhrases=${JSON.stringify(sBerryMasterWifePhrases)}`);
console.log(`  sAlphabetGroupIdMap rows=${sAlphabetGroupIdMap.length}`);
console.log(`  groupNames[0..2]=${JSON.stringify(sEasyChatGroupNamePointers.slice(0, 3))} len=${sEasyChatGroupNamePointers.length}`);
console.log(`  bgTemplates=${sEasyChatBgTemplates.length} winTemplates=${sEasyChatWindowTemplates.length} (WIN_INPUT_SELECT bg=${sEasyChatWindowTemplates[2]?.bg})`);
console.log(`  phraseFrameDims[MAIL=2]=${JSON.stringify(sPhraseFrameDimensions[2])}`);
console.log(`  footerXOffsets[0]=${JSON.stringify(sFooterOptionXOffsets[0])} footerText[0]=${JSON.stringify(sFooterTextOptions[0])}`);
console.log(`  colOffsets=${JSON.stringify(sAlphabetKeyboardColumnOffsets)}`);

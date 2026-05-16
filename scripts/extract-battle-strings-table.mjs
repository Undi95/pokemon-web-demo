#!/usr/bin/env node
/**
 * extract-battle-strings-table.mjs
 * --------------------------------
 * Parse :
 *   1. `include/constants/battle_string_ids.h` → STRINGID_X = N mapping
 *   2. `src/battle_message.c` → gBattleStringsTable[STRINGID_X - START] = sText_Y
 *      → table mapping de stringId → sText_name (= clé dans strings.json)
 *
 * Output : `src/engine/decomp-data/battle-strings-table.ts`
 *   export const STRINGID_NAMES: Record<number, string>
 *   export const BATTLE_STRINGS_TABLE: Record<number, string>
 *   export const BATTLESTRINGS_TABLE_START: number
 *
 * Usage côté runtime :
 *   import { BATTLE_STRINGS_TABLE } from './decomp-data/battle-strings-table';
 *   const sTextName = BATTLE_STRINGS_TABLE[stringId];
 *   const frText = stringsJson[sTextName];  // = "{B_BUFF1} a gagné{B_BUFF2}..."
 *
 * Run : node scripts/extract-battle-strings-table.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const idsPath = join(decompRoot, 'include', 'constants', 'battle_string_ids.h');
const messagePath = join(decompRoot, 'src', 'battle_message.c');
const outPath = join(projectRoot, 'src', 'engine', 'decomp-data', 'battle-strings-table.ts');

console.log('[battle-strings] Parsing', idsPath);
const idsTxt = readFileSync(idsPath, 'utf8');
console.log('[battle-strings] Parsing', messagePath);
const msgTxt = readFileSync(messagePath, 'utf8');

// ─── Phase A : parse STRINGID_X = N ────────────────────────────────────────
const STRINGID_NAMES = {}; // id → "STRINGID_X"
const NAME_TO_ID = {};     // "STRINGID_X" → id
{
  const re = /#define\s+(STRINGID_[A-Z0-9_]+)\s+(\d+)/g;
  let m;
  while ((m = re.exec(idsTxt))) {
    const name = m[1];
    const id = parseInt(m[2], 10);
    STRINGID_NAMES[id] = name;
    NAME_TO_ID[name] = id;
  }
  // Also handle special constants
  const re2 = /#define\s+(BATTLESTRINGS_TABLE_START|BATTLESTRINGS_COUNT)\s+(STRINGID_[A-Z0-9_]+|\d+)/g;
  while ((m = re2.exec(idsTxt))) {
    const name = m[1];
    const val = m[2];
    if (/^\d+$/.test(val)) {
      NAME_TO_ID[name] = parseInt(val, 10);
    } else {
      NAME_TO_ID[name] = NAME_TO_ID[val] ?? 0;
    }
  }
}
const BATTLESTRINGS_TABLE_START = NAME_TO_ID['BATTLESTRINGS_TABLE_START'] ?? 12;
const BATTLESTRINGS_COUNT = NAME_TO_ID['BATTLESTRINGS_COUNT'] ?? 381;
console.log('[battle-strings] STRINGID_* parsed:', Object.keys(STRINGID_NAMES).length);
console.log('[battle-strings] BATTLESTRINGS_TABLE_START =', BATTLESTRINGS_TABLE_START);
console.log('[battle-strings] BATTLESTRINGS_COUNT =', BATTLESTRINGS_COUNT);

// ─── Phase B : parse gBattleStringsTable[] entries ─────────────────────────
const BATTLE_STRINGS_TABLE = {}; // id → "sText_X" / "gText_X"
{
  // Locate the gBattleStringsTable definition
  const idx = msgTxt.indexOf('gBattleStringsTable[BATTLESTRINGS_COUNT - BATTLESTRINGS_TABLE_START]');
  if (idx < 0) throw new Error('gBattleStringsTable[] not found in battle_message.c');
  // Find the closing }; from this point
  const startBrace = msgTxt.indexOf('{', idx);
  let depth = 1;
  let endBrace = startBrace + 1;
  while (endBrace < msgTxt.length && depth > 0) {
    const c = msgTxt[endBrace];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) break;
    endBrace++;
  }
  const tableBody = msgTxt.slice(startBrace + 1, endBrace);
  // Match `[STRINGID_X - BATTLESTRINGS_TABLE_START] = sText_Y,` (or gText_Y)
  const re = /\[\s*(STRINGID_[A-Z0-9_]+)\s*-\s*BATTLESTRINGS_TABLE_START\s*\]\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g;
  let m;
  while ((m = re.exec(tableBody))) {
    const stringIdName = m[1];
    const sTextName = m[2];
    const id = NAME_TO_ID[stringIdName];
    if (id === undefined) {
      console.warn('[battle-strings] WARN: unknown STRINGID:', stringIdName);
      continue;
    }
    BATTLE_STRINGS_TABLE[id] = sTextName;
  }
}
console.log('[battle-strings] gBattleStringsTable[] entries:', Object.keys(BATTLE_STRINGS_TABLE).length);

// ─── Write output TS module ────────────────────────────────────────────────
mkdirSync(dirname(outPath), { recursive: true });

const NOW = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push('// AUTO-GENERATED from extract-battle-strings-table.mjs');
lines.push('// Source 1:1 décomp :');
lines.push('//   - include/constants/battle_string_ids.h (= STRINGID_X enum)');
lines.push('//   - src/battle_message.c (= gBattleStringsTable[] mapping)');
lines.push(`// Generated: ${NOW}`);
lines.push('');
lines.push('/** 1:1 décomp `BATTLESTRINGS_TABLE_START` (battle_string_ids.h:387). */');
lines.push(`export const BATTLESTRINGS_TABLE_START = ${BATTLESTRINGS_TABLE_START};`);
lines.push('');
lines.push('/** 1:1 décomp `BATTLESTRINGS_COUNT` (battle_string_ids.h:382). */');
lines.push(`export const BATTLESTRINGS_COUNT = ${BATTLESTRINGS_COUNT};`);
lines.push('');
lines.push('/** Mapping id (number) → "STRINGID_X" name (debug). */');
lines.push('export const STRINGID_NAMES: Record<number, string> = {');
const sortedIds = Object.keys(STRINGID_NAMES).map(Number).sort((a, b) => a - b);
for (const id of sortedIds) {
  lines.push(`  ${id}: "${STRINGID_NAMES[id]}",`);
}
lines.push('};');
lines.push('');
lines.push('/** Mapping id (number) → sText_X / gText_X (= clé strings.json).');
lines.push(' *  1:1 décomp `gBattleStringsTable[]` (battle_message.c:518-1900). */');
lines.push('export const BATTLE_STRINGS_TABLE: Record<number, string> = {');
const sortedSIds = Object.keys(BATTLE_STRINGS_TABLE).map(Number).sort((a, b) => a - b);
for (const id of sortedSIds) {
  lines.push(`  ${id}: "${BATTLE_STRINGS_TABLE[id]}",`);
}
lines.push('};');
lines.push('');

writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('[battle-strings] Wrote', outPath);
console.log('[battle-strings] DONE.');

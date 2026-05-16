#!/usr/bin/env node
/**
 * extract-battle-string-id-tables.mjs
 * -----------------------------------
 * Parse src/battle_message.c → extract toutes les `const u16 gXxxStringIds[]`
 * tables (= u16 arrays mapping B_MSG_X → STRINGID_X). Output TS module +
 * fournit liste de noms pour BATTLE_MEMORY_SYMBOLS whitelist du compiler.
 *
 * Output : `src/engine/decomp-data/battle-string-id-tables.ts`
 *   export const BATTLE_STRING_ID_TABLES: Record<string, Uint16Array>
 *
 * Usage côté runtime : printfromtable opcode résoud le symbol nom via
 * memory-map → fetch dans BATTLE_STRING_ID_TABLES → u16 à idx*2.
 *
 * Run : node scripts/extract-battle-string-id-tables.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const messagePath = join(decompRoot, 'src', 'battle_message.c');
const idsPath = join(decompRoot, 'include', 'constants', 'battle_string_ids.h');
const battleHPath = join(decompRoot, 'include', 'battle.h');
const battleStringIdsPath = join(decompRoot, 'include', 'constants', 'battle_string_ids.h');
const outPath = join(projectRoot, 'src', 'engine', 'decomp-data', 'battle-string-id-tables.ts');

console.log('[battle-tables] Reading', messagePath);
const msgTxt = readFileSync(messagePath, 'utf8');
const idsTxt = readFileSync(idsPath, 'utf8');
const battleH = readFileSync(battleHPath, 'utf8');
const bsIds = readFileSync(battleStringIdsPath, 'utf8');

// ─── Parse STRINGID_X = N + B_MSG_X = N constants ──────────────────────────
const CONSTANTS = {};
{
  const re = /#define\s+(STRINGID_[A-Z0-9_]+|B_MSG_[A-Z0-9_]+|NUM_TRAPPING_MOVES)\s+(\d+|0x[0-9a-fA-F]+)/g;
  let m;
  for (const txt of [idsTxt, msgTxt, battleH, bsIds]) {
    while ((m = re.exec(txt))) {
      const name = m[1];
      const val = m[2].startsWith('0x') ? parseInt(m[2], 16) : parseInt(m[2], 10);
      if (!(name in CONSTANTS)) CONSTANTS[name] = val;
    }
    re.lastIndex = 0;
  }
}
console.log('[battle-tables] Constants parsed:', Object.keys(CONSTANTS).length);

// ─── Parse gXxxStringIds[] tables ──────────────────────────────────────────
const TABLES = {};
{
  // Match `const u16 gXxxStringIds[OPTIONAL_SIZE] = { ... };`
  const re = /const\s+u16\s+(g\w+StringIds)\s*(?:\[[^\]]*\])?\s*=\s*\{([^}]+)\};/g;
  let m;
  while ((m = re.exec(msgTxt))) {
    const name = m[1];
    let body = m[2];
    // Strip comments AVANT le split (= comments en fin de ligne contiennent
    // pas de `,` mais le split par `,` les déplace au début de la chunk suivante,
    // ce qui empêche le STRINGID_X regex de matcher).
    body = body.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // Parse entries : `[B_MSG_X] = STRINGID_Y,` OR `STRINGID_Y,` (= positional)
    const entriesByIndex = {};
    let positionalIdx = 0;
    const lines = body.split(',');
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) continue;
      // Strip comments (already done above, idempotent)
      const cleaned = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!cleaned) continue;
      // Match [B_MSG_X] = STRINGID_Y
      const designated = cleaned.match(/\[(\w+)\]\s*=\s*(\w+)/);
      if (designated) {
        const idxName = designated[1];
        const valName = designated[2];
        const idx = CONSTANTS[idxName] ?? null;
        const val = CONSTANTS[valName] ?? null;
        if (idx === null) {
          console.warn(`[battle-tables] WARN: unknown index ${idxName} in ${name}`);
          continue;
        }
        if (val === null) {
          console.warn(`[battle-tables] WARN: unknown value ${valName} in ${name}`);
          continue;
        }
        entriesByIndex[idx] = val;
      } else {
        // Positional entry
        const valMatch = cleaned.match(/^(STRINGID_\w+)/);
        if (valMatch) {
          const val = CONSTANTS[valMatch[1]] ?? null;
          if (val === null) {
            console.warn(`[battle-tables] WARN: unknown value ${valMatch[1]} in ${name}`);
            continue;
          }
          entriesByIndex[positionalIdx] = val;
        }
        positionalIdx++;
      }
    }
    // Determine max index → array size
    const indices = Object.keys(entriesByIndex).map(Number);
    if (indices.length === 0) continue;
    const maxIdx = Math.max(...indices);
    const arr = new Array(maxIdx + 1).fill(0);
    for (const [idx, val] of Object.entries(entriesByIndex)) {
      arr[Number(idx)] = val;
    }
    TABLES[name] = arr;
  }
}
console.log('[battle-tables] Tables extracted:', Object.keys(TABLES).length);

// ─── Generate TS module ────────────────────────────────────────────────────
mkdirSync(dirname(outPath), { recursive: true });
const NOW = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push('// AUTO-GENERATED from extract-battle-string-id-tables.mjs');
lines.push('// Source 1:1 décomp : src/battle_message.c gXxxStringIds[] arrays.');
lines.push(`// Generated: ${NOW}`);
lines.push('//');
lines.push('// Ces tables sont indexées par MULTISTRING_CHOOSER (= cMULTISTRING_CHOOSER');
lines.push('// dans le bytecode) pour résoudre stringId via printfromtable opcode.');
lines.push('');
lines.push('/** Mapping symbol name → Uint16Array de stringIds. */');
lines.push('export const BATTLE_STRING_ID_TABLES: Record<string, Uint16Array> = {');
for (const [name, arr] of Object.entries(TABLES).sort(([a], [b]) => a.localeCompare(b))) {
  const valsStr = arr.join(', ');
  lines.push(`  ${name}: new Uint16Array([${valsStr}]),`);
}
lines.push('};');
lines.push('');
lines.push('/** Lookup : symbol name → resolved stringId at index, ou null si invalid. */');
lines.push('export function getBattleStringId(tableName: string, index: number): number | null {');
lines.push('  const t = BATTLE_STRING_ID_TABLES[tableName];');
lines.push('  if (!t || index < 0 || index >= t.length) return null;');
lines.push('  return t[index];');
lines.push('}');
lines.push('');

writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('[battle-tables] Wrote', outPath);

// Also output the list of names for compiler whitelist.
const namesPath = join(projectRoot, 'src', 'engine', 'decomp-data', '_battle-string-id-tables-names.json');
writeFileSync(namesPath, JSON.stringify(Object.keys(TABLES).sort(), null, 2), 'utf8');
console.log('[battle-tables] Wrote', namesPath);
console.log('[battle-tables] DONE.');

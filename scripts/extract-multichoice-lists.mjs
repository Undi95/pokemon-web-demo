#!/usr/bin/env node
/**
 * Parse src/data/script_menu.h pour extraire :
 *   - chaque `MultichoiceList_X[] = { {gText_A}, {gText_B}, ... }`
 *   - l'index `sMultichoiceLists[MULTI_X] = MULTICHOICE(MultichoiceList_X)`
 *
 * Output : public/decomp/em/multichoice-lists.json
 *   {
 *     "lists": {
 *       "MultichoiceList_BrineyOnDewford": ["gText_Petalburg", "gText_Slateport", "gText_Exit"],
 *       ...
 *     },
 *     "index": {
 *       "MULTI_BRINEY_ON_DEWFORD": "MultichoiceList_BrineyOnDewford",
 *       ...
 *     }
 *   }
 *
 * Le runtime résout `gText_X` via `_common.json:texts[X]` pour avoir le FR final.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const sourcePath = join(decompPath, 'src', 'data', 'script_menu.h');
const outDir = join(projectRoot, 'public', 'decomp', 'em');
const outPath = join(outDir, 'multichoice-lists.json');

if (!existsSync(sourcePath)) {
  console.error(`[extract-multichoice-lists] source not found: ${sourcePath}`);
  process.exit(1);
}

const content = readFileSync(sourcePath, 'utf8');

// ── 1. Extract `MultichoiceList_X[] = { {gText_A}, ... }` blocks ─────────────
const lists = {};
const listBlockRegex = /static\s+const\s+struct\s+MenuAction\s+(MultichoiceList_\w+)\s*\[\s*\]\s*=\s*\{([\s\S]*?)\};/g;
let m;
while ((m = listBlockRegex.exec(content)) !== null) {
  const listName = m[1];
  const body = m[2];
  // Parse `{gText_X}` or `{gText_X, fnPtr}` entries — keep just gText_X.
  const entries = [];
  const entryRegex = /\{\s*([\w]+)(?:\s*,\s*[\w]+)?\s*\}/g;
  let e;
  while ((e = entryRegex.exec(body)) !== null) {
    entries.push(e[1]);
  }
  lists[listName] = entries;
}

// ── 2. Extract `sMultichoiceLists[MULTI_X] = MULTICHOICE(MultichoiceList_Y)` ─
const index = {};
const indexBlockRegex = /static\s+const\s+struct\s+MultichoiceListStruct\s+sMultichoiceLists\s*\[\s*\]\s*=\s*\{([\s\S]*?)\};/;
const idxBlockMatch = content.match(indexBlockRegex);
if (!idxBlockMatch) {
  console.error('[extract-multichoice-lists] sMultichoiceLists block not found');
  process.exit(1);
}
const idxBody = idxBlockMatch[1];
const idxEntryRegex = /\[(MULTI_\w+)\]\s*=\s*MULTICHOICE\((MultichoiceList_\w+)\)/g;
let idx;
while ((idx = idxEntryRegex.exec(idxBody)) !== null) {
  index[idx[1]] = idx[2];
}

mkdirSync(outDir, { recursive: true });
const out = { lists, index };
writeFileSync(outPath, JSON.stringify(out, null, 2));

const nLists = Object.keys(lists).length;
const nIndex = Object.keys(index).length;
console.log(`[extract-multichoice-lists] ${nLists} lists, ${nIndex} index entries → ${outPath}`);

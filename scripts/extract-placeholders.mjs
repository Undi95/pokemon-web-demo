#!/usr/bin/env node
/**
 * Extrait les `gText_ExpandedPlaceholder_*` de strings.c du décomp.
 *
 * Sortie : public/decomp/em/placeholders.json
 *   {
 *     "Brendan": "BRICE",
 *     "May": "FLORA",
 *     "Emerald": "EMERAUDE",
 *     ...
 *   }
 *
 * Le mapping placeholder code (dans les .string) → expander vient de
 * src/string_util.c (cf. PLACEHOLDER_ID_* + funcs[]) — appliqué côté
 * runtime dans dialogue-box.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repo = resolve(__dirname, '..');
const src = resolve(repo, '..', 'decomps', 'pokeemeraude', 'src', 'strings.c');
const out = join(repo, 'public', 'decomp', 'em', 'placeholders.json');

const text = readFileSync(src, 'utf8');
const re = /const\s+u8\s+gText_ExpandedPlaceholder_(\w+)\[\]\s*=\s*_\("([^"]*)"\)\s*;/g;
const result = {};
let m;
while ((m = re.exec(text)) !== null) {
  result[m[1]] = m[2];
}

writeFileSync(out, JSON.stringify(result, null, 2));
console.log(`[extract-placeholders] ${Object.keys(result).length} placeholders → ${out}`);
console.log('  Brendan:', result.Brendan, '/ May:', result.May, '/ Emerald:', result.Emerald);

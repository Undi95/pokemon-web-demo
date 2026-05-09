#!/usr/bin/env node
/**
 * extract-static-data-tables.mjs
 * --------------------------------
 * Pour chaque `.c` (et `.h` inclus) du décomp, extrait les `static const TYPE sName[N] = { ... };`
 * et écrit un JSON par fichier. Permet aux modules auto-portés d'accéder aux data
 * tables sans avoir à porter manuellement chaque déclaration.
 *
 * Patterns gérés :
 *   - `static const u8 sName[] = { ... };`
 *   - `static const u8 sName[N] = { ... };`
 *   - `static const u16 sName[]= { ... };` (= sans espace après `]`)
 *   - `static const u8 (*const sName[])(args) = { ... };` (= function pointer arrays)
 *   - `static const TYPE sName[X][Y] = { ... };` (= 2D arrays)
 *   - `[ENUM_VALUE] = expr,` indexed initializers
 *
 * Output : `public/decomp/em/static-tables/<file>.json` avec structure :
 *   {
 *     "tables": {
 *       "sMoveDirectionAnimNums": {
 *         "type": "u8",
 *         "isArray": true,
 *         "isFnPtr": false,
 *         "rawValue": "{ [DIR_NONE] = ANIM_STD_GO_SOUTH, ... }",
 *         "indexedKeys": ["DIR_NONE", "DIR_SOUTH", ...],
 *         "indexedValues": ["ANIM_STD_GO_SOUTH", ...]
 *       }
 *     }
 *   }
 *
 * Cf. Phase 5.3d roadmap : ces tables débloquent les MovementAction_X_Step bodies.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'src');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'static-tables');
mkdirSync(outDir, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findMatchingBrace(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

// ─── Static const table regex ────────────────────────────────────────────────
//
// We want to match :
//   static const TYPE sName[]= { ... };
//   static const TYPE sName[N] = { ... };
//   static const TYPE * const sName[] = { ... };
//   static const TYPE (*const sName[])(args) = { ... };
//   static const TYPE sName[X][Y] = { ... };
//
// Strategy : match `static const ... sName ... = {` then balance the {}.

// Two regexes for the common patterns :
//   (1) `static const TYPE name[]= { ... };`
//   (2) `static [const?] TYPE (*const name[])(args) = { ... };` (= function-ptr arrays)
const STATIC_PLAIN_RE = /\bstatic\s+(?:const\s+)?(?:struct\s+\w+\s*|union\s+\w+\s*|enum\s+\w+\s*)?(?:const\s+)?[a-zA-Z_]\w*\s*\*?\s*\*?\s*\b([a-zA-Z_]\w*)\b\s*(?:\[[^\]]*\])+\s*=\s*\{/g;
const STATIC_FNPTR_RE = /\bstatic\s+(?:const\s+)?[a-zA-Z_]\w*\s*\*?\s*\(\s*\*\s*const\s*\b([a-zA-Z_]\w*)\b\s*\[[^\]]*\]\s*\)\s*\([^)]*\)\s*=\s*\{/g;

function extractTablesFromFile(fpath) {
  const raw = readFileSync(fpath, 'utf8');
  const cleaned = stripComments(raw);
  const tables = {};

  let m;
  // Process both regexes : plain + fn-ptr.
  for (const [re, isFnPtrPattern] of [[STATIC_PLAIN_RE, false], [STATIC_FNPTR_RE, true]]) {
  re.lastIndex = 0;
  while ((m = re.exec(cleaned)) !== null) {
    const name = m[1];
    // Skip names like `data` (= local var, not table). Accept `s*` (= static prefix convention).
    if (!/^s[A-Z]/.test(name) && !/^g[A-Z]/.test(name) && !/^[A-Z]/.test(name)) continue;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(cleaned, openIdx);
    if (closeIdx === -1) continue;
    const rawValue = cleaned.slice(openIdx, closeIdx + 1).trim();
    const sigStart = m.index;
    const signature = cleaned.slice(sigStart, openIdx).trim();

    // Detect type + flags.
    const isFnPtr = isFnPtrPattern;
    const typeMatch = signature.match(/static\s+(?:const\s+)?([\w\s\*]+?)\b\w+\s*\[/);
    const type = typeMatch ? typeMatch[1].trim() : 'unknown';

    // Try parse [ENUM_KEY] = value, patterns.
    const indexedRe = /\[\s*([A-Z_][A-Z0-9_]*)\s*\]\s*=\s*([^,}]+)/g;
    const indexedKeys = [];
    const indexedValues = [];
    let im;
    indexedRe.lastIndex = 0;
    while ((im = indexedRe.exec(rawValue)) !== null) {
      indexedKeys.push(im[1]);
      indexedValues.push(im[2].trim());
    }

    // Try parse plain values { v1, v2, v3 }.
    let plainValues = [];
    if (indexedKeys.length === 0) {
      // Strip outer braces, split by top-level commas.
      const inner = rawValue.slice(1, -1).trim();
      // Naive split (= won't handle nested braces with commas, but good enough).
      plainValues = splitTopLevelCommas(inner)
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }

    if (tables[name]) continue;  // Skip duplicate names (= keep first).
    tables[name] = {
      type,
      isFnPtr,
      isArray: true,
      indexedKeys: indexedKeys.length > 0 ? indexedKeys : undefined,
      indexedValues: indexedKeys.length > 0 ? indexedValues : undefined,
      plainValues: plainValues.length > 0 && indexedKeys.length === 0 ? plainValues : undefined,
      rawValue: rawValue.length > 1024 ? rawValue.slice(0, 1024) + '...' : rawValue,
    };
  }
  }  // close for-loop over regexes
  return tables;
}

/** Split a string at top-level commas (= ignore commas inside { } or ( )). */
function splitTopLevelCommas(s) {
  const result = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      result.push(s.slice(start, i));
      start = i + 1;
    }
  }
  if (start < s.length) result.push(s.slice(start));
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function listCFiles() {
  const files = [];
  // Process .c files in src/.
  for (const f of readdirSync(srcDir)) {
    if (f.endsWith('.c')) files.push(join(srcDir, f));
  }
  // Also process .h files in src/data/object_events/ (= movement_action_func_tables.h).
  const dataDir = join(srcDir, 'data', 'object_events');
  if (existsSync(dataDir)) {
    for (const f of readdirSync(dataDir)) {
      if (f.endsWith('.h')) files.push(join(dataDir, f));
    }
  }
  return files;
}

const files = listCFiles();
console.log(`[extract-static-data-tables] processing ${files.length} files`);

let totalTables = 0;
const summary = { generatedAt: new Date().toISOString().slice(0, 10), perFileCounts: {} };

for (const fpath of files) {
  const fname = basename(fpath).replace(/\.[ch]$/, '');
  const tables = extractTablesFromFile(fpath);
  const count = Object.keys(tables).length;
  if (count === 0) continue;
  const outPath = join(outDir, `${fname}.json`);
  writeFileSync(outPath, JSON.stringify({
    srcFile: fpath.replace(decompPath + '/', '').replace(decompPath + '\\', '').replace(/\\/g, '/'),
    count,
    tables,
  }, null, 2));
  totalTables += count;
  summary.perFileCounts[fname] = count;
}

summary.totalTables = totalTables;
summary.totalFiles = Object.keys(summary.perFileCounts).length;
writeFileSync(join(outDir, '_summary.json'), JSON.stringify(summary, null, 2));

console.log(`[extract-static-data-tables] DONE`);
console.log(`  Files with tables : ${summary.totalFiles}`);
console.log(`  Total tables       : ${totalTables}`);
const top = Object.entries(summary.perFileCounts).sort(([,a], [,b]) => b - a).slice(0, 10);
console.log(`  Top 10 :`);
for (const [name, count] of top) console.log(`    ${count} tables : ${name}`);
console.log(`  Output : ${outDir}`);

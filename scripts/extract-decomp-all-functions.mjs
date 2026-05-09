#!/usr/bin/env node
/**
 * extract-decomp-all-functions.mjs
 * ---------------------------------
 * Extracteur EXHAUSTIF : pour chaque `.c` file dans `decomps/pokeemeraude/src/`,
 * extrait TOUTES les fonctions top-level (= n'importe quel return type, n'importe
 * quels params).
 *
 * Output : `public/decomp/em/extracted-all/<scene>.json` avec un mapping
 *   { funcName: { returnType, signature, paramsRaw, body, callsTo, lineCount } }
 *
 * Pourquoi : auto-extraire la base permet de transpiler tout d'un coup et de
 * voir CLAIREMENT les callTos non-résolus → on génère un manifest des helpers
 * manquants, on les bridge ou les implémente.
 *
 * Cf. roadmap session 124 — "extract tout d'un coup, base existe, le reste
 * doucement s'emboite".
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'src');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'extracted-all');
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

function extractCallsTo(body) {
  const calls = new Set();
  const re = /\b([A-Z_][A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    if (['TRUE', 'FALSE', 'NULL', 'IF', 'ELSE', 'ENDIF', 'COLOR', 'RGB', 'RGB_BLACK', 'RGB_WHITE',
         'DIR_SOUTH', 'DIR_NORTH', 'DIR_WEST', 'DIR_EAST', 'DIR_NONE'].includes(name)) continue;
    calls.add(name);
  }
  return [...calls].sort();
}

// Parse a C parameter list and return [{ name, typeRaw }, ...].
// Examples :
//   "void"                                       → []
//   ""                                           → []
//   "u8 a, u16 b"                                → [{name:'a',typeRaw:'u8'},{name:'b',typeRaw:'u16'}]
//   "struct ObjectEvent *objectEvent"            → [{name:'objectEvent',typeRaw:'struct ObjectEvent *'}]
//   "u8 **script, u32 *val"                      → [{name:'script',typeRaw:'u8 **'},{name:'val',typeRaw:'u32 *'}]
//   "void (*callback)(struct Sprite *)"          → [{name:'callback',typeRaw:'fnptr'}]  (function pointer)
//   "u16 graphicsId, u16 movementType, struct SpriteTemplate *spriteTemplate"
function parseParams(paramsRaw) {
  const trimmed = (paramsRaw || '').trim();
  if (!trimmed || trimmed === 'void') return [];
  // Split on commas, but only at top level (= respect parens).
  const parts = [];
  let depth = 0;
  let buf = '';
  for (const ch of trimmed) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());

  const out = [];
  for (const p of parts) {
    // Function pointer : `void (*callback)(struct Sprite *)` or `bool8 (*func)(void)`.
    const fnPtr = p.match(/^[^(]+\(\s*\*\s*([A-Za-z_]\w*)\s*\)\s*\(/);
    if (fnPtr) {
      out.push({ name: fnPtr[1], typeRaw: 'fnptr' });
      continue;
    }
    // Array param : `u8 arr[10]` or `u8 arr[]`.
    const arrM = p.match(/([A-Za-z_]\w*)\s*\[[^\]]*\]\s*$/);
    if (arrM) {
      out.push({ name: arrM[1], typeRaw: p.slice(0, p.lastIndexOf(arrM[1])).trim() + '[]' });
      continue;
    }
    // Standard : extract last identifier as name, the rest is type.
    // Strip trailing `*` from name region.
    const stdM = p.match(/([A-Za-z_]\w*)\s*$/);
    if (stdM) {
      const name = stdM[1];
      const typeRaw = p.slice(0, p.lastIndexOf(name)).trim();
      // If typeRaw is empty, it's just a name without type → treat it as `any`.
      out.push({ name, typeRaw: typeRaw || 'any' });
    } else {
      // Fallback for empty / weird : skip.
    }
  }
  return out;
}

// ─── Universal function regex ────────────────────────────────────────────────
//
// Capture top-level C function definitions in `src/*.c` files :
//   <storage>? <return-type> <NAME>(<params>) {
//
// Where :
//   <storage> = static | inline | static inline | etc.
//   <return-type> = void | bool8 | u8 | u16 | u32 | s8 | s16 | s32 | int |
//                   const struct X * | struct X | typedef-name | ...
//   <NAME> = identifier
//   <params> = void | type1 name1[, type2 name2, ...]
//
// We want a regex that matches MOST patterns without too many false positives.
// Key tricks :
//   - Anchor at line start (= `^`) to skip nested braces.
//   - Allow multi-line params.
//   - Require matching close brace to capture body.

// Simple return-type token list. Must cover most cases.
const RETURN_TYPES = [
  'void', 'bool', 'bool8', 'bool16', 'bool32',
  'u8', 'u16', 'u32', 's8', 's16', 's32', 'int', 'long', 'short', 'char',
  'size_t', 'unsigned',
  'f32', 'f64', 'float', 'double',
  'vu8', 'vu16', 'vu32', 'vs8', 'vs16', 'vs32',
];

// We allow optional `static`, `inline`, `const`, modifier prefixes.
// Then return type. Then optional `*` (pointer). Then NAME(params) {.
const fnRe = new RegExp(
  // Anchor : start of line (= avoid nested) but allow leading whitespace (some files have indented defs).
  '^(?:[ \\t]*(?:static|inline|extern|EWRAM_DATA|IWRAM_DATA|UNUSED|NORETURN)\\s+)*' +
  // Optional const for return type.
  '(?:const\\s+)?' +
  // Return type : either a struct, or a base type.
  '(?:struct\\s+[A-Za-z_][A-Za-z0-9_]*|(?:' + RETURN_TYPES.join('|') + ')|[A-Z][A-Za-z0-9_]+)\\s*\\*?\\s*\\*?\\s+' +
  // Function name. Must start with letter/underscore.
  '([A-Za-z_][A-Za-z0-9_]*)\\s*' +
  // Open paren.
  '\\(',
  'gm'
);

// ─── Per-file extraction ─────────────────────────────────────────────────────

function extractFunctionsFromFile(fpath) {
  const fname = basename(fpath, '.c');
  const raw = readFileSync(fpath, 'utf8');
  const cleaned = stripComments(raw);
  const out = {};

  fnRe.lastIndex = 0;
  let m;
  while ((m = fnRe.exec(cleaned)) !== null) {
    const name = m[1];
    const sigStart = m.index;
    const openParenIdx = m.index + m[0].length - 1;

    // Find matching close paren for params.
    let parenDepth = 1;
    let i = openParenIdx + 1;
    while (i < cleaned.length && parenDepth > 0) {
      if (cleaned[i] === '(') parenDepth++;
      else if (cleaned[i] === ')') parenDepth--;
      i++;
    }
    if (parenDepth !== 0) continue;
    const closeParenIdx = i - 1;
    const paramsRaw = cleaned.slice(openParenIdx + 1, closeParenIdx).trim();

    // After close paren, skip whitespace, must find `{`.
    let j = closeParenIdx + 1;
    while (j < cleaned.length && /\s/.test(cleaned[j])) j++;
    if (cleaned[j] !== '{') continue;
    const openBraceIdx = j;
    const closeBraceIdx = findMatchingBrace(cleaned, openBraceIdx);
    if (closeBraceIdx === -1) continue;

    const signature = cleaned.slice(sigStart, openBraceIdx).trim();
    const body = cleaned.slice(openBraceIdx + 1, closeBraceIdx).trim();

    // Extract return type from signature : everything before the function name.
    const nameInSig = signature.lastIndexOf(name);
    const returnTypeRaw = nameInSig >= 0 ? signature.slice(0, nameInSig).trim() : '';
    // Strip storage class prefixes for cleaner returnType.
    const returnType = returnTypeRaw
      .replace(/^(?:static|inline|extern|EWRAM_DATA|IWRAM_DATA|UNUSED|NORETURN)\s+/g, '')
      .replace(/\bstatic\b|\binline\b|\bextern\b/g, '')
      .trim();

    // Skip if duplicate name in same file (= keep longest body).
    const prev = out[name];
    if (prev && prev.body.length >= body.length) continue;

    out[name] = {
      returnType,
      signature,
      paramsRaw,
      paramsList: parseParams(paramsRaw),
      body,
      callsTo: extractCallsTo(body),
      lineCount: body.split('\n').length,
    };
  }
  return { srcFile: `src/${fname}.c`, count: Object.keys(out).length, functions: out };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const cFiles = globSync(`${srcDir.replace(/\\/g, '/')}/*.c`);
console.log(`[extract-decomp-all-functions] scanning ${cFiles.length} .c files`);

let totalFunctions = 0;
const summary = { generatedAt: new Date().toISOString().slice(0, 10), perFileCounts: {} };

for (const fpath of cFiles) {
  const fname = basename(fpath, '.c');
  const result = extractFunctionsFromFile(fpath);
  if (result.count === 0) continue;
  const outPath = join(outDir, `${fname}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  totalFunctions += result.count;
  summary.perFileCounts[fname] = result.count;
}

summary.totalFunctions = totalFunctions;
summary.totalFiles = Object.keys(summary.perFileCounts).length;

writeFileSync(join(outDir, '_summary.json'), JSON.stringify(summary, null, 2));

console.log(`[extract-decomp-all-functions] DONE`);
console.log(`  Files with functions  : ${summary.totalFiles} (out of ${cFiles.length} scanned)`);
console.log(`  Total functions       : ${totalFunctions}`);
console.log(`  Top 10 files :`);
const top = Object.entries(summary.perFileCounts).sort(([,a], [,b]) => b - a).slice(0, 10);
for (const [name, count] of top) console.log(`    ${count} functions : src/${name}.c`);
console.log(`  Output : ${outDir}`);

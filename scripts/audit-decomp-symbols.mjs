#!/usr/bin/env node
/**
 * Audit exhaustif : grep tous les symboles C utilisés dans les bodyC extraits
 * (intro-tasks.ts + sprite-system.ts SPRITE_CALLBACKS + SPRITE_HELPERS) et liste
 * ceux qu'on N'A PAS implémentés en TS (decomp-runtime, decomp-helpers, intro-callbacks).
 *
 * Output : liste catégorisée des symboles MANQUANTS.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Collecte tous les bodyC à analyser
function loadBodyC() {
  const all = [];
  for (const path of [
    'src/engine/decomp-data/auto-tasks/src/intro-tasks.ts',
    'src/engine/decomp-data/auto-tasks/src/intro_credits_graphics-tasks.ts',
    'src/engine/decomp-data/auto/src/sprite-system.ts',
  ]) {
    const text = readFileSync(resolve(root, path), 'utf8');
    // Extract all string literals containing C code (bodyC fields)
    for (const m of text.matchAll(/"bodyC"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
      all.push({ src: path, body: m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
    }
    // SPRITE_CALLBACKS values are direct strings (not objects)
    for (const m of text.matchAll(/"(SpriteCB_\w+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
      all.push({ src: path, body: m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
    }
  }
  return all;
}

// Symboles déjà implémentés dans nos modules TS
function loadImplemented() {
  const impl = new Set();
  for (const path of [
    'src/engine/decomp-runtime.ts',
    'src/engine/decomp-helpers.ts',
    'src/engine/decomp-impls/intro-callbacks.ts',
    'src/engine/decomp-data/intro-data.ts',
    'src/engine/decomp-data/auto/src/intro-data.ts',
    'src/engine/decomp-data/auto/src/sprite-system.ts',
  ]) {
    const text = readFileSync(resolve(root, path), 'utf8');
    // export function NAME(
    for (const m of text.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) impl.add(m[1]);
    // export const NAME =
    for (const m of text.matchAll(/export\s+const\s+(\w+)/g)) impl.add(m[1]);
    // class methods: NAME(   (catch SetGpuReg etc on class)
    for (const m of text.matchAll(/^\s+(?:async\s+)?(\w+)\s*\([^)]*\)/gm)) impl.add(m[1]);
    // interface fields: NAME:
    for (const m of text.matchAll(/^\s+(\w+)\s*[:?!]/gm)) impl.add(m[1]);
  }
  return impl;
}

// Patterns de symboles à grep dans les bodyC
const PATTERNS = {
  functionCalls: /\b([A-Z]\w*?)\s*\(/g,                       // FunctionName(
  helperFunctions: /\b([a-z]\w*[A-Z]\w*)\s*\(/g,              // camelCase()
  allCapsConsts: /\b([A-Z][A-Z0-9_]{2,})\b/g,                 // ALL_CAPS_CONSTS
  spriteFields: /sprite->(\w+)/g,                              // sprite->X
  oamFields: /sprite->oam\.(\w+)/g,                            // sprite->oam.X
  taskFields: /gTasks\[\w+\]\.(\w+)/g,                         // gTasks[N].X
  globalVars: /\bg([A-Z]\w+)/g,                                // gGlobalVar
};

const KNOWN_C_KEYWORDS = new Set([
  'if', 'else', 'switch', 'case', 'break', 'continue', 'default', 'return', 'while', 'for',
  'do', 'goto', 'sizeof', 'struct', 'union', 'enum', 'typedef', 'static', 'const',
  'unsigned', 'signed', 'void', 'int', 'char', 'float', 'double', 'long', 'short',
  'true', 'false', 'TRUE', 'FALSE', 'NULL',
  'u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'bool',
]);

function extractSymbols(bodyC) {
  const found = {
    functionCalls: new Set(),
    spriteFields: new Set(),
    oamFields: new Set(),
    taskFields: new Set(),
    globalVars: new Set(),
    allCapsConsts: new Set(),
  };
  for (const m of bodyC.matchAll(PATTERNS.functionCalls)) {
    if (!KNOWN_C_KEYWORDS.has(m[1])) found.functionCalls.add(m[1]);
  }
  for (const m of bodyC.matchAll(/\b([a-z]\w*[A-Z]\w*)\s*\(/g)) {
    if (!KNOWN_C_KEYWORDS.has(m[1])) found.functionCalls.add(m[1]);
  }
  for (const m of bodyC.matchAll(PATTERNS.spriteFields)) found.spriteFields.add(m[1]);
  for (const m of bodyC.matchAll(PATTERNS.oamFields)) found.oamFields.add(m[1]);
  for (const m of bodyC.matchAll(PATTERNS.taskFields)) found.taskFields.add(m[1]);
  for (const m of bodyC.matchAll(PATTERNS.globalVars)) found.globalVars.add('g' + m[1]);
  for (const m of bodyC.matchAll(PATTERNS.allCapsConsts)) {
    if (!KNOWN_C_KEYWORDS.has(m[1])) found.allCapsConsts.add(m[1]);
  }
  return found;
}

const bodies = loadBodyC();
const impl = loadImplemented();

const aggregated = {
  functionCalls: new Map(),    // name → count
  spriteFields: new Map(),
  oamFields: new Map(),
  taskFields: new Map(),
  globalVars: new Map(),
  allCapsConsts: new Map(),
};

for (const { body } of bodies) {
  const ext = extractSymbols(body);
  for (const cat of Object.keys(aggregated)) {
    for (const sym of ext[cat]) {
      aggregated[cat].set(sym, (aggregated[cat].get(sym) ?? 0) + 1);
    }
  }
}

function reportCategory(catName, map, isImplCheck = true) {
  console.log(`\n=== ${catName} (${map.size} unique) ===`);
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  for (const [sym, count] of sorted) {
    const status = isImplCheck && impl.has(sym) ? '✓' : '❌';
    console.log(`  ${status} ${sym.padEnd(40)} (×${count})`);
  }
}

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Audit décomp symboles utilisés dans bodyC vs notre engine TS`);
console.log(`══════════════════════════════════════════════════════════════════`);
console.log(`Bodies analysés : ${bodies.length} (intro tasks + sprite callbacks + helpers)`);
console.log(`Symboles déjà impl en TS : ${impl.size}`);

reportCategory('Function calls (helpers C utilisés)', aggregated.functionCalls);
reportCategory('sprite-> fields (struct Sprite)', aggregated.spriteFields, false);
reportCategory('sprite->oam. fields', aggregated.oamFields, false);
reportCategory('gTasks[].data fields', aggregated.taskFields, false);
reportCategory('Global vars (gXxx)', aggregated.globalVars);
reportCategory('ALL_CAPS constants/macros', aggregated.allCapsConsts);

// Stats finaux
let total = 0, missing = 0;
for (const [, m] of Object.entries(aggregated)) {
  for (const sym of m.keys()) {
    total++;
    if (!impl.has(sym)) missing++;
  }
}
console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  TOTAL symboles uniques : ${total}`);
console.log(`  ✓ Implémentés      : ${total - missing}`);
console.log(`  ❌ MANQUANTS       : ${missing}  (${Math.round(missing*100/total)}%)`);
console.log(`══════════════════════════════════════════════════════════════════`);

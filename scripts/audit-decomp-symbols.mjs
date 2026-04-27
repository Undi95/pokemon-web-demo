#!/usr/bin/env node
/**
 * Audit exhaustif : grep tous les symboles C utilisés dans les bodyC extraits
 * (TOUS les *-tasks.ts + sprite-system.ts SPRITE_CALLBACKS + SPRITE_HELPERS) et
 * liste ceux qu'on N'A PAS implémentés en TS NI extraits sous forme bodyC
 * transcrivable depuis le décomp.
 *
 * Sources de bodyC scannées :
 *   - src/engine/decomp-data/auto-tasks/src/*-tasks.ts        (TASKS / CB2S / SPRITE_CBS)
 *   - src/engine/decomp-data/auto/src/sprite-system.ts        (SPRITE_CALLBACKS / SPRITE_HELPERS)
 *
 * Sources d'implémentations (= "déjà OK") :
 *   - Modules TS écrits à la main : decomp-runtime, decomp-helpers, decomp-impls/*
 *   - Constants TS : _common-constants.ts
 *   - Tous les *-engine.ts (ENGINE_FUNCTIONS keys)              → bodyC dispo
 *   - Tous les *-tasks.ts   (TASKS / CB2S / SPRITE_CBS keys)    → bodyC dispo
 *   - sprite-system.ts top-level exports (SPRITE_TEMPLATES,
 *     OAM_DATAS, SPRITE_ANIMS, SPRITE_PALETTES, SPRITE_SHEETS,
 *     SPRITE_DATA_TABLES, EXTERNAL_PALETTES, SPRITE_CALLBACKS,
 *     SPRITE_HELPERS) — toutes les clés top-level
 *   - Tous les *-data.ts dans auto/src/ (constantes/tables extraites)
 *
 * Output : liste catégorisée des symboles MANQUANTS.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ─── 1. bodyC bodies à analyser ──────────────────────────────────────────────

/**
 * Walk a directory recursively (depth-first) yielding files matching a suffix.
 */
function* walkDir(dir, suffix) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) yield* walkDir(full, suffix);
    else if (ent.isFile() && ent.name.endsWith(suffix)) yield full;
  }
}

/**
 * Extract bodyC sources from a TS file. We look for two patterns:
 *   (A) bodyC: "…"  or  "bodyC": "…"   → object form (TASKS, SPRITE_HELPERS…)
 *   (B) "SpriteCB_Name": "…"           → string form (SPRITE_CALLBACKS in sprite-system.ts)
 */
function extractBodiesFromText(text, srcLabel) {
  const out = [];
  // Pattern A: bodyC: "…"  (TS object literal — no quotes around key in TASKS files)
  // Also matches "bodyC": "…"  (JSON-style — used in SPRITE_HELPERS).
  for (const m of text.matchAll(/(?:"bodyC"|\bbodyC)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    out.push({ src: srcLabel, body: m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
  }
  // Pattern B: "SpriteCB_*":"…"  (string-typed map values)
  for (const m of text.matchAll(/"(SpriteCB_\w+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    out.push({ src: srcLabel, body: m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"') });
  }
  return out;
}

function loadBodyC() {
  const all = [];
  // Sweep ALL *-tasks.ts under auto-tasks/src
  const tasksDir = resolve(root, 'src/engine/decomp-data/auto-tasks/src');
  for (const f of walkDir(tasksDir, '-tasks.ts')) {
    const text = readFileSync(f, 'utf8');
    all.push(...extractBodiesFromText(text, f.replace(root + '\\', '').replace(/\\/g, '/')));
  }
  // Plus the sprite-system.ts (SPRITE_CALLBACKS string map + SPRITE_HELPERS bodyC)
  const spriteSysPath = resolve(root, 'src/engine/decomp-data/auto/src/sprite-system.ts');
  if (existsSync(spriteSysPath)) {
    const text = readFileSync(spriteSysPath, 'utf8');
    all.push(...extractBodiesFromText(text, 'src/engine/decomp-data/auto/src/sprite-system.ts'));
  }
  return all;
}

// ─── 2. Symboles « déjà OK » (impl TS ou bodyC dispo) ────────────────────────

/** Add every export and method name from a TS file to the impl set. */
function harvestExports(text, impl) {
  for (const m of text.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) impl.add(m[1]);
  for (const m of text.matchAll(/export\s+(?:const|let|var)\s+(\w+)/g)) impl.add(m[1]);
  for (const m of text.matchAll(/export\s+(?:abstract\s+)?(?:class|interface|enum|type)\s+(\w+)/g)) impl.add(m[1]);
  // Method-like entries: "  Name(args) {" or "  Name<T>(args) {"
  for (const m of text.matchAll(/^\s+(?:async\s+)?(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*[{:]/gm)) impl.add(m[1]);
  // Object literal keys: "  Name:" or "  Name?:"
  for (const m of text.matchAll(/^\s+(\w+)\s*[:?!]/gm)) impl.add(m[1]);
}

/** Scan a TS module (.ts) and grab top-level "Name" keys at column 2/4 inside an object map. */
function harvestQuotedKeys(text, impl) {
  // "Name": { ...    or    "Name": "..."
  // We only count direct keys whose value starts with `{` or `"` (string body) — those are
  // the actual data entries, not nested fields.
  for (const m of text.matchAll(/^\s{2}"([A-Za-z_]\w*)"\s*:\s*[{"]/gm)) impl.add(m[1]);
}

function loadImplemented() {
  const impl = new Set();

  // ── Hand-written TS modules ─────────────────────────────────────────────
  const handWritten = [
    'src/engine/decomp-runtime.ts',
    'src/engine/decomp-helpers.ts',
    'src/engine/decomp-data/_common-constants.ts',
    'src/engine/decomp-data/_index.ts',
    'src/engine/decomp-data/intro-data.ts',
    'src/engine/decomp-data/credits-data.ts',
    'src/engine/decomp-data/main-menu-data.ts',
    'src/engine/decomp-data/menu-data.ts',
    'src/engine/decomp-data/naming-screen-data.ts',
    'src/engine/decomp-data/option-menu-data.ts',
    'src/engine/decomp-data/party-menu-data.ts',
    'src/engine/decomp-data/save-data.ts',
    'src/engine/decomp-data/start-menu-data.ts',
    'src/engine/decomp-data/text-data.ts',
    'src/engine/decomp-data/text-window-data.ts',
    'src/engine/decomp-data/title-screen-data.ts',
    'src/engine/decomp-data/window-data.ts',
  ];
  for (const rel of handWritten) {
    const abs = resolve(root, rel);
    if (!existsSync(abs)) continue;
    harvestExports(readFileSync(abs, 'utf8'), impl);
  }

  // Walk decomp-impls/ directory (every hand-written TS impl module)
  const implsDir = resolve(root, 'src/engine/decomp-impls');
  for (const f of walkDir(implsDir, '.ts')) {
    harvestExports(readFileSync(f, 'utf8'), impl);
  }

  // ── ENGINE_FUNCTIONS keys (auto-engine/src/*-engine.ts) ─────────────────
  // Each entry's bodyC is available, so it's transcribable. Counts as "OK".
  const engineDir = resolve(root, 'src/engine/decomp-data/auto-engine/src');
  for (const f of walkDir(engineDir, '-engine.ts')) {
    harvestQuotedKeys(readFileSync(f, 'utf8'), impl);
  }

  // ── TASKS / CB2S / SPRITE_CBS keys (auto-tasks/src/*-tasks.ts) ──────────
  // bodyC available for every Task_*, CB2_*, SpriteCB_* extracted.
  const tasksDir = resolve(root, 'src/engine/decomp-data/auto-tasks/src');
  for (const f of walkDir(tasksDir, '-tasks.ts')) {
    harvestQuotedKeys(readFileSync(f, 'utf8'), impl);
  }

  // ── sprite-system.ts top-level keys (all 9 maps) ─────────────────────────
  // SPRITE_TEMPLATES, OAM_DATAS, SPRITE_ANIMS, SPRITE_ANIM_TABLES,
  // SPRITE_AFFINE_ANIMS, SPRITE_AFFINE_ANIM_TABLES, SPRITE_PALETTES,
  // SPRITE_SHEETS, SPRITE_CALLBACKS, SPRITE_HELPERS, SPRITE_DATA_TABLES,
  // EXTERNAL_PALETTES — every entry name counts as "data exists, transcribable".
  const spriteSysPath = resolve(root, 'src/engine/decomp-data/auto/src/sprite-system.ts');
  if (existsSync(spriteSysPath)) {
    const text = readFileSync(spriteSysPath, 'utf8');
    harvestQuotedKeys(text, impl);
    // Plus the top-level export names themselves (e.g. SPRITE_TEMPLATES) are
    // not symbols we'd see in bodyC, but harmless to add.
    harvestExports(text, impl);
  }

  // ── Auto-extracted *-data.ts (constantes / data tables) ──────────────────
  const autoDataDir = resolve(root, 'src/engine/decomp-data/auto/src');
  for (const f of walkDir(autoDataDir, '-data.ts')) {
    const text = readFileSync(f, 'utf8');
    harvestQuotedKeys(text, impl);
    harvestExports(text, impl);
  }

  // ── intro-data.ts (autogenerated copy, top-level keys) ──────────────────
  const autoIntro = resolve(root, 'src/engine/decomp-data/auto/src/intro-data.ts');
  if (existsSync(autoIntro)) {
    const text = readFileSync(autoIntro, 'utf8');
    harvestQuotedKeys(text, impl);
    harvestExports(text, impl);
  }

  // ── Source-file local #define field aliases (from .c files) ────────────
  // Many .c files declare local aliases like `#define tMonSpriteId data[5]`
  // for sprite/task data slots. Picking them up here avoids false positives.
  const decompSrc = resolve(root, '..', 'decomps', 'pokeemeraude', 'src');
  if (existsSync(decompSrc)) {
    for (const f of walkDir(decompSrc, '.c')) {
      const text = readFileSync(f, 'utf8');
      for (const m of text.matchAll(/^\s*#\s*define\s+([A-Za-z_]\w*)\b/gm)) {
        impl.add(m[1]);
      }
    }
  }

  // ── #define macros / enum constants / function protos from headers ─────
  // These are header-only symbols (no .c file body to extract). Examples:
  //   - macros: JOY_NEW, ARRAY_COUNT, PIXEL_FILL, SPRITE_SHAPE, SPRITE_SIZE
  //   - BIOS syscalls: LZ77UnCompVram (gba/syscall.h)
  //   - ASM prototypes: m4aSongNumStart, IsLinkTaskFinished
  //   - enum constants: BATTLE_PARTNER, INTROCRED_SCENERY_NORMAL
  // All are 1:1 transcribable; counted as "data exists".
  const decompInclude = resolve(root, '..', 'decomps', 'pokeemeraude', 'include');
  if (existsSync(decompInclude)) {
    for (const f of walkDir(decompInclude, '.h')) {
      const text = readFileSync(f, 'utf8');
      // #define NAME(args) value   or   #define NAME value
      for (const m of text.matchAll(/^\s*#\s*define\s+([A-Za-z_]\w*)\b/gm)) {
        impl.add(m[1]);
      }
      // enum { NAME, NAME = V, ... }   — best-effort, captures every word
      // that begins a line at indent inside enum braces.
      for (const enumBlock of text.matchAll(/enum\s*(?:\w+\s*)?\{([\s\S]*?)\}/g)) {
        for (const id of enumBlock[1].matchAll(/\b([A-Za-z_]\w*)\b\s*(?:=|,|\})/g)) {
          impl.add(id[1]);
        }
      }
      // Function prototypes: returnType FunctionName( ... ) ;
      // Covers BIOS syscalls + functions defined in .s ASM files. Also catches
      // prototypes of .c functions we might have missed in extract-engine-helpers.
      // We require a `;` immediately after the closing `)` to avoid matching
      // function definitions (which end with `{`).
      // Pattern: optional `extern`, return type, IDENT, `(...)`, `;`
      for (const m of text.matchAll(/(?:^|\n)[ \t]*(?:extern[ \t]+|static[ \t]+|inline[ \t]+)*(?:const[ \t]+)?(?:struct[ \t]+\w+[ \t]*\*?\s*|union[ \t]+\w+[ \t]*\*?\s*|enum[ \t]+\w+[ \t]+|[A-Za-z_]\w*[ \t]*\*?\s*)([A-Za-z_]\w*)[ \t]*\([^;{]*\)[ \t]*;/g)) {
        impl.add(m[1]);
      }
      // Top-level extern variables: extern type NAME;
      for (const m of text.matchAll(/(?:^|\n)[ \t]*extern[ \t]+(?:const[ \t]+)?(?:struct[ \t]+\w+[ \t]*\*?\s*|[A-Za-z_]\w*[ \t]*\*?\s*)([A-Za-z_]\w*)\s*(?:\[[^\]]*\])?\s*;/g)) {
        impl.add(m[1]);
      }
    }
  }

  return impl;
}

// ─── 3. Patterns à grep dans les bodyC ───────────────────────────────────────

const PATTERNS = {
  functionCalls: /\b([A-Z]\w*?)\s*\(/g,             // FunctionName(
  helperFunctions: /\b([a-z]\w*[A-Z]\w*)\s*\(/g,    // camelCase()
  allCapsConsts: /\b([A-Z][A-Z0-9_]{2,})\b/g,       // ALL_CAPS_CONSTS
  spriteFields: /sprite->(\w+)/g,                    // sprite->X
  oamFields: /sprite->oam\.(\w+)/g,                  // sprite->oam.X
  taskFields: /gTasks\[\w+\]\.(\w+)/g,               // gTasks[N].X
  globalVars: /\bg([A-Z]\w+)/g,                      // gGlobalVar
};

const KNOWN_C_KEYWORDS = new Set([
  'if', 'else', 'switch', 'case', 'break', 'continue', 'default', 'return', 'while', 'for',
  'do', 'goto', 'sizeof', 'struct', 'union', 'enum', 'typedef', 'static', 'const',
  'unsigned', 'signed', 'void', 'int', 'char', 'float', 'double', 'long', 'short',
  'true', 'false', 'TRUE', 'FALSE', 'NULL',
  'u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'bool',
]);

// Sprite struct fields are intrinsics of the GBA sprite object — they're not
// symbols we'd "implement", they're fields read/written via .x, .y, .data, etc.
// We still report them but in a separate header so they don't pollute the score.
const SPRITE_STRUCT_FIELDS = new Set([
  'x', 'y', 'x2', 'y2', 'data', 'oam', 'callback', 'invisible',
  'animEnded', 'affineAnimEnded', 'animBeginning', 'subspriteTables',
  'subspriteTableNum', 'subpriority', 'centerToCornerVecX', 'centerToCornerVecY',
  'animNum', 'animCmdIndex', 'animPaused', 'affineAnimPaused', 'usingSheet',
  'sheetTileStart', 'inUse', 'flags',
]);

const OAM_FIELDS = new Set([
  'objMode', 'affineMode', 'matrixNum', 'shape', 'size', 'priority',
  'paletteNum', 'tileNum', 'x', 'y', 'mosaic', 'bpp',
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
  for (const m of bodyC.matchAll(PATTERNS.helperFunctions)) {
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

function reportCategory(catName, map, opts = {}) {
  const { isImplCheck = true, intrinsics = null } = opts;
  console.log(`\n=== ${catName} (${map.size} unique) ===`);
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  for (const [sym, count] of sorted) {
    let status;
    if (intrinsics && intrinsics.has(sym)) status = '∘'; // intrinsic field
    else if (isImplCheck && impl.has(sym)) status = '✓';
    else status = '❌';
    console.log(`  ${status} ${sym.padEnd(40)} (×${count})`);
  }
}

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Audit décomp symboles utilisés dans bodyC vs notre engine TS`);
console.log(`══════════════════════════════════════════════════════════════════`);
console.log(`Bodies analysés : ${bodies.length} (tous *-tasks + sprite-system bodies)`);
console.log(`Symboles déjà impl ou bodyC dispo : ${impl.size}`);

reportCategory('Function calls (helpers C utilisés)', aggregated.functionCalls);
reportCategory('sprite-> fields (struct Sprite)', aggregated.spriteFields,
  { isImplCheck: false, intrinsics: SPRITE_STRUCT_FIELDS });
reportCategory('sprite->oam. fields', aggregated.oamFields,
  { isImplCheck: false, intrinsics: OAM_FIELDS });
reportCategory('gTasks[].data fields', aggregated.taskFields, { isImplCheck: false });
reportCategory('Global vars (gXxx)', aggregated.globalVars);
reportCategory('ALL_CAPS constants/macros', aggregated.allCapsConsts);

// ─── 4. Stats finaux ─────────────────────────────────────────────────────────
//
// Comptabilité :
//   - Function calls + Global vars + ALL_CAPS constants : symboles "vrais"
//     qui doivent être implémentés en TS ou avoir un bodyC dispo.
//   - sprite-> fields, sprite->oam. fields, gTasks[].data fields : ce sont
//     des ACCÈS à des champs de struct (souvent #define sXxx data[N] alias).
//     Pas des symboles indépendants à porter — informationnels uniquement.
const SYMBOL_CATS = new Set(['functionCalls', 'globalVars', 'allCapsConsts']);
const FIELD_CATS = new Set(['spriteFields', 'oamFields', 'taskFields']);

let totalSyms = 0, missingSyms = 0;
let totalFields = 0;
for (const [cat, m] of Object.entries(aggregated)) {
  for (const sym of m.keys()) {
    if (FIELD_CATS.has(cat)) {
      totalFields++;
      continue;
    }
    if (SYMBOL_CATS.has(cat)) {
      totalSyms++;
      if (!impl.has(sym)) missingSyms++;
    }
  }
}
const okSyms = totalSyms - missingSyms;
console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Symboles VRAIS (function calls + globals + macros) :`);
console.log(`    Total                    : ${totalSyms}`);
console.log(`    ✓ Implémentés / bodyC OK : ${okSyms}`);
console.log(`    ❌ MANQUANTS (à porter)  : ${missingSyms}  (${Math.round(missingSyms*100/Math.max(totalSyms,1))}%)`);
console.log(``);
console.log(`  Field accesses (struct member aliases, informationnels) :`);
console.log(`    Total                    : ${totalFields}`);
console.log(`══════════════════════════════════════════════════════════════════`);

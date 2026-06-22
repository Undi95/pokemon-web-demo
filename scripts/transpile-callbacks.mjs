#!/usr/bin/env node
/**
 * transpile-callbacks.mjs
 * -----------------------
 * Mechanical C bodyC → TypeScript transpiler for decomp Pokemon Emerald
 * SpriteCB_X / Task_X / CB2_X function bodies.
 *
 * Reads :
 *   - src/engine/decomp-data/auto/src/sprite-system.ts (SPRITE_CALLBACKS, SPRITE_HELPERS, SPRITE_TEMPLATES)
 *   - src/engine/decomp-data/auto-tasks/src/<scene>-tasks.ts (TASKS, CB2S, SPRITE_CBS)
 *   - decomp .c source files (for #define sX data[N] / #define tX data[N] aliases)
 *
 * Generates :
 *   - src/engine/decomp-data/auto/src/<scene>-callbacks-auto.ts per scene
 *
 * Each generated module exports SpriteCallback / TaskCallback functions
 * with the bodyC mechanically converted to TS (using DecompRuntime helpers).
 *
 * See script header for full list of substitution rules.
 *
 * Usage : node scripts/transpile-callbacks.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');

const spriteSystemPath = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src', 'sprite-system.ts');
const tasksDirPath = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-tasks', 'src');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src');

const NOW = new Date().toISOString().slice(0, 10);

// ─── Stats / logging ─────────────────────────────────────────────────────────
const stats = {
  spriteCbAttempted: 0, spriteCbOk: 0, spriteCbFailed: 0,
  taskAttempted: 0, taskOk: 0, taskFailed: 0,
  cb2Attempted: 0, cb2Ok: 0, cb2Failed: 0,
  helperAttempted: 0, helperOk: 0,
  movementAttempted: 0, movementOk: 0, movementFailed: 0,
  filesGenerated: 0,
  warnings: [],
};
function warn(msg) { stats.warnings.push(msg); }

// ─── Step 1 : Parse ALL .c files for #define sX/tX data[N] aliases ──────────

/**
 * Scan all .c files in the decomp src/ dir.
 * Returns Map<filename, Map<aliasName, dataIndex>>.
 */
function parseAllFieldAliases() {
  const aliasesByFile = new Map();
  const cFiles = globSync(`${decompRoot.replace(/\\/g, '/')}/src/*.c`);
  for (const fpath of cFiles) {
    const fname = basename(fpath, '.c');
    const src = readFileSync(fpath, 'utf8');
    const aliases = new Map();
    // #define sFoo data[N] / #define tFoo (data[N]) etc
    const re = /^\s*#\s*define\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(?:\(\s*)?data\s*\[\s*(\d+)\s*\]/gm;
    let m;
    while ((m = re.exec(src)) !== null) {
      const [, name, idx] = m;
      // Filter to only include camelCase aliases starting with lowercase letter + uppercase
      // (typical decomp pattern for sX, tX, sFoo, tFoo, etc).
      if (!/^[stou][A-Z]/.test(name)) continue;
      // Last definition wins (handles re-uses across functions)
      aliases.set(name, parseInt(idx, 10));
    }
    if (aliases.size > 0) aliasesByFile.set(fname, aliases);
  }
  return aliasesByFile;
}

// ─── Step 2 : Load sprite-system.ts + task modules ──────────────────────────

async function loadSpriteSystem() {
  const url = `file:///${spriteSystemPath.replace(/\\/g, '/')}`;
  const mod = await import(url);
  return {
    callbacks: mod.SPRITE_CALLBACKS ?? {},
    helpers: mod.SPRITE_HELPERS ?? {},
    templates: mod.SPRITE_TEMPLATES ?? {},
    sources: mod.SPRITE_SYSTEM_SOURCES ?? {},
  };
}

async function loadTaskModule(modPath) {
  const url = `file:///${modPath.replace(/\\/g, '/')}`;
  const mod = await import(url);
  return {
    tasks: mod.TASKS ?? {},
    cb2s: mod.CB2S ?? {},
    spriteCbs: mod.SPRITE_CBS ?? {},
  };
}

// ─── Step 3 : The transpileur core ───────────────────────────────────────────

/** Find balanced brackets : returns end index (exclusive) of the closing ] for the [
 *  starting at openIdx. Returns -1 if unbalanced. */
function findBalancedClose(s, openIdx, openCh, closeCh) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === openCh) depth++;
    else if (s[i] === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Substitute `prefix(BALANCED)` calls. Prefix must end with `(`. replacer(inner) → string */
function substituteBalancedParens(s, prefix, replacer) {
  let result = '';
  let i = 0;
  while (i < s.length) {
    const idx = s.indexOf(prefix, i);
    if (idx < 0) { result += s.slice(i); break; }
    result += s.slice(i, idx);
    const openIdx = idx + prefix.length - 1;  // position of '('
    if (s[openIdx] !== '(') { result += prefix; i = idx + prefix.length; continue; }
    const closeIdx = findBalancedClose(s, openIdx, '(', ')');
    if (closeIdx < 0) { result += s.slice(idx); break; }
    const inner = s.slice(openIdx + 1, closeIdx);
    const repl = replacer(inner);
    result += repl;
    i = closeIdx + 1;
  }
  return result;
}

/** Split a comma-separated arg list at TOP LEVEL only (respect nested parens/brackets). */
function splitTopLevelCommas(inner) {
  const out = [];
  let depth = 0;
  let buf = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { out.push(buf); buf = ''; }
    else buf += ch;
  }
  if (buf.length > 0 || out.length > 0) out.push(buf);
  return out;
}

/** Substitute `prefix[BALANCED]` with replacer fn(content). The prefix must end with `[`. */
function substituteBalanced(s, prefix, replacer) {
  let result = '';
  let i = 0;
  while (i < s.length) {
    const idx = s.indexOf(prefix, i);
    if (idx < 0) { result += s.slice(i); break; }
    result += s.slice(i, idx);
    const openIdx = idx + prefix.length - 1;  // position of '['
    if (s[openIdx] !== '[') { result += prefix; i = idx + prefix.length; continue; }
    const closeIdx = findBalancedClose(s, openIdx, '[', ']');
    if (closeIdx < 0) { result += s.slice(idx); break; }
    const inner = s.slice(openIdx + 1, closeIdx);
    const repl = replacer(inner);
    result += repl;
    i = closeIdx + 1;
  }
  return result;
}

// ─── PHASE E2.B : templates convertis en vrais SpriteTemplate objets 1:1 ─────
// Registre (whitelist) des `struct SpriteTemplate` décomp déjà re-matérialisés en
// VRAIS objets TS (OAM + AnimCmd[][] + template) dans le fichier reconcilié, et
// consommés directement par `CreateSprite(rt, objet, …)` (= 1:1 décomp `CreateSprite`).
// Pour CES noms, on N'ÉMET PLUS le resolver string-catalogue `rt.CreateSpriteFromTemplate`
// (l'indirection M3, défaisable) → on émet l'appel objet. Les templates HORS whitelist
// gardent le resolver (fallback) jusqu'à leur conversion, feature par feature (cf. plan
// docs/ENGINE-1TO1-RECONCILIATION-PLAN.md, Phase E2.B). ⚠ Un template ici DOIT avoir ses
// defs d'objet (sX­OamData/sX­AnimTable/sX­SpriteTemplate) + les imports `CreateSprite`/
// `ANIMCMD_FRAME`/`ANIMCMD_END` présents dans le fichier reconcilié (cf. title_screen-callbacks-auto.ts).
const CONVERTED_TEMPLATES = new Set([
  'sVersionBannerLeftSpriteTemplate',
  'sVersionBannerRightSpriteTemplate',
  'sStartCopyrightBannerSpriteTemplate',
]);

/**
 * Apply substitution rules to a bodyC string.
 *
 * @param {string} bodyC raw C code
 * @param {object} ctx context : { aliases (Map alias→index), kind ('sprite'|'task'|'cb2'|'helper') }
 * @returns {{ tsCode, warnings: string[] }}
 */
function transpileBody(bodyC, ctx) {
  const warnings = [];
  let s = bodyC;

  // ─── Pre-pass : strip preprocessor directives ─────────────────────────────
  s = s.replace(/^\s*#\s*ifdef[^\n]*\n?/gm, '');
  s = s.replace(/^\s*#\s*ifndef[^\n]*\n?/gm, '');
  s = s.replace(/^\s*#\s*else[^\n]*\n?/gm, '');
  s = s.replace(/^\s*#\s*endif[^\n]*\n?/gm, '');
  s = s.replace(/^\s*#\s*if[^\n]*\n?/gm, '');
  // Strip in-body #define MACRO(args) ... (multi-line if backslash-newline) and
  // single-line #define X Y or #undef X.
  s = s.replace(/^\s*#\s*define\s+[^\n]*(?:\\\n[^\n]*)*\n?/gm, '');
  s = s.replace(/^\s*#\s*undef\s+[^\n]*\n?/gm, '');

  // ─── Pre-pass : drop attribute-like macros (UNUSED, NORETURN etc) ─────────
  s = s.replace(/\bUNUSED\b/g, '');
  s = s.replace(/\bNORETURN\b/g, '');
  s = s.replace(/\bALIGNED\(\d+\)/g, '');
  s = s.replace(/\b__attribute__\(\([^)]*\)\)/g, '');
  s = s.replace(/\bIWRAM_DATA\b/g, '');
  s = s.replace(/\bEWRAM_DATA\b/g, '');

  // ─── Pre-pass : convert C variable declarations to TS ─────────────────────
  // 0a. "s16 *data = gTasks[taskId].data;" → "const data = task.data;"
  s = s.replace(/(?:s16|u16|s8|u8|s32|u32|int)\s*\*\s*data\s*=\s*gTasks\[\s*taskId\s*\]\s*\.data\s*;/g,
    'const data = task.data;');
  // 0b. "u8 X = init;" → "let X = init;"
  s = s.replace(/^(\s*)(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|size_t|vu8|vu16|vu32|vs8|vs16|vs32|char|short|long|float|double|f32|f64)\s+\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm,
    '$1let $2 =');
  // 0c. "u8 X;" → "let X = 0;"  (default init)
  s = s.replace(/^(\s*)(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|size_t|vu8|vu16|vu32|vs8|vs16|vs32|char|short|long|float|double|f32|f64)\s+\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*;/gm,
    '$1let $2 = 0;');
  // 0c2. "u8 arr[N];" → "let arr: number[] = new Array(N).fill(0);"
  s = s.replace(/^(\s*)(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*([^\]]+)\s*\]\s*;/gm,
    '$1let $2: number[] = new Array($3).fill(0);');
  // 0c2b. "const u8 (X)[N];" / "const u8 (*X)[N];" — paren'd or pointer-paren'd var
  s = s.replace(/^(\s*)(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+\(\s*\**\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*(?:\[\s*[^\]]*\s*\])+\s*;/gm,
    '$1let $2: any = null;');
  s = s.replace(/^(\s*)(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+\(\s*\**\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*(?:\[\s*[^\]]*\s*\])+\s*=/gm,
    '$1let $2: any =');
  // 0c3. "u8 arr[] = {...};" / "u8 arr[N] = {...};"
  s = s.replace(/^(\s*)(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*[^\]]*\s*\]\s*=/gm,
    '$1let $2: any =');
  // 0c4. "static const u8 X[] = {...};" / "const u8 X[N] = {...};"
  s = s.replace(/^(\s*)(?:static\s+)?(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*[^\]]*\s*\]\s*=/gm,
    '$1const $2: any =');
  // 0c4b. Multi-dim array : "u8 X[][4] = ..." → const X: any =
  s = s.replace(/^(\s*)(?:static\s+)?(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|char|short|long)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[\s*[^\]]*\s*\])+\s*=/gm,
    '$1const $2: any =');
  // 0c5. C array literal `= { 1, 2, 3 };` → `= [1, 2, 3];` (when on RHS of assignment)
  s = s.replace(/=\s*\{([^{}]+)\}\s*;/g, '= [$1];');
  // 0c5b. C nested array literal `= { {a,b}, {c,d}, };` — replace just this case.
  //       We use balanced bracket parsing on the rhs of an assignment to a const X array decl.
  s = s.replace(/(=\s*)\{([^=;]+?)\}(\s*;)/g, (full, eq, content, end) => {
    // Convert all { → [ and } → ] in content
    const converted = content.replace(/\{/g, '[').replace(/\}/g, ']');
    return `${eq}[${converted}]${end}`;
  });
  // 0d. "u8 X, Y;" → "let X, Y;"  — best-effort, no init
  s = s.replace(/^(\s*)(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|size_t|vu8|vu16|vu32|vs8|vs16|vs32|char|short|long|float|double|f32|f64|bool32|size_t)\s+([a-zA-Z_][a-zA-Z0-9_]*\s*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*\s*)+);/gm,
    '$1let $2;');
  // 0e. "struct X Y;" / "const struct X *Y;" → "let Y: any = null;"
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*;/gm,
    '$1let $2: any = null;');
  // 0e1b. Multi-var struct decl : "struct X A, B, C;" → "let A: any = null, B: any = null, C: any = null;"
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+([a-zA-Z_][a-zA-Z0-9_]*\s*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*\s*)+);/gm,
    (full, indent, names) => {
      const nameList = names.split(/\s*,\s*/).map(n => n.trim()).filter(Boolean);
      return `${indent}let ${nameList.map(n => `${n}: any = null`).join(', ')};`;
    });
  // 0f. "struct X *Y = init;" / "struct X Y = init;" / "struct X **Y = init;"
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm,
    '$1let $2: any =');
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm,
    '$1let $2: any =');
  // 0e2. Typedef'd type names (CamelCase or upper-snake) : `MainCallback callback = ...;` etc.
  //      Heuristic : line starts with TypeName followed by varName followed by = or ;
  //      We require TypeName to be CamelCase (starts capital) and varName lowercase.
  s = s.replace(/^(\s*)([A-Z][A-Za-z0-9_]*)\s+(\*?\s*[a-z][a-zA-Z0-9_]*)\s*=\s*/gm,
    (full, indent, type, name) => `${indent}let ${name.replace(/^\*\s*/, '')} = `);
  s = s.replace(/^(\s*)([A-Z][A-Za-z0-9_]*)\s+(\*?\s*[a-z][a-zA-Z0-9_]*)\s*;\s*$/gm,
    (full, indent, type, name) => `${indent}let ${name.replace(/^\*\s*/, '')}: any = null;`);
  // 0g. "static u8 X[]" / "const u16 X[]" — drop top-level decls (rare in callback bodies)
  // 0h. "u8 *X" pointer-to-byte → "let X: any" (rare)
  s = s.replace(/^(\s*)(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|size_t|vu8|vu16|vu32|vs8|vs16|vs32|char|short|long|float|double|f32|f64)\s*\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*;/gm,
    '$1let $2: any = null;');
  s = s.replace(/^(\s*)(?:const\s+)?(?:u8|u16|u32|s8|s16|s32|int|bool8|bool32|size_t|vu8|vu16|vu32|vs8|vs16|vs32|char|short|long|float|double|f32|f64)\s*\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm,
    '$1let $2: any =');
  // 0i. Function pointer declaration "void (*X)(void);" / "void (**X)(void);"
  s = s.replace(/^(\s*)(?:void|u8|u16|u32|s8|s16|s32|int|bool8)\s*\(\s*\**\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*\([^)]*\)\s*;/gm,
    '$1let $2: any = null;');
  // 0i2. "void *X = ...;" / "void *X;"
  s = s.replace(/^(\s*)void\s*\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm, '$1let $2: any =');
  s = s.replace(/^(\s*)void\s*\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*;/gm, '$1let $2: any = null;');
  // 0j. "u32 *X" / "u8 *X" pointer var with init
  s = s.replace(/^(\s*)\bvolatile\s+/gm, '$1');
  s = s.replace(/^(\s*)\bregister\s+/gm, '$1');
  s = s.replace(/^(\s*)\bauto\s+/gm, '$1');

  // ─── Substitution rules ───────────────────────────────────────────────────

  // -1. PRE : sprite-method calls that take `&gSprites[X]` MUST be lifted to
  //     `rt.X(spriteId, ...)` BEFORE we rewrite gSprites[X] → _gs_(X). Otherwise
  //     section 0 turns the address-of into _gs_() and we end up with the wrong
  //     convention `StartSpriteAnim(_gs(rt, X), N)` (passing sprite obj instead
  //     of spriteId). Use balanced-bracket parsing because X may itself contain
  //     `[`/`(` (e.g. `gSprites[gTasks[id].data[0]]`).
  function _liftSpriteIdMethod(srcStr, fnName, methodName) {
    const prefix = `${fnName}(`;
    let result = '';
    let i = 0;
    while (i < srcStr.length) {
      const idx = srcStr.indexOf(prefix, i);
      if (idx < 0) { result += srcStr.slice(i); break; }
      // Word-boundary check : char before must not be [a-zA-Z0-9_.]
      // (`.` excludes `rt.StartSpriteAnim(` from re-lifting once we've already
      //  rewritten it.)
      const prev = idx > 0 ? srcStr[idx - 1] : ' ';
      if (/[A-Za-z0-9_.]/.test(prev)) { result += srcStr.slice(i, idx + prefix.length); i = idx + prefix.length; continue; }
      const openIdx = idx + prefix.length - 1; // '('
      const closeIdx = findBalancedClose(srcStr, openIdx, '(', ')');
      if (closeIdx < 0) { result += srcStr.slice(i); break; }
      const inner = srcStr.slice(openIdx + 1, closeIdx);
      const args = splitTopLevelCommas(inner);
      // First arg should be `&gSprites[X]` — extract X
      const first = (args[0] ?? '').trim();
      const m = first.match(/^&\s*gSprites\s*\[([\s\S]*)\]\s*$/);
      if (!m) {
        // No match — leave as-is, advance past the prefix
        result += srcStr.slice(i, closeIdx + 1);
        i = closeIdx + 1;
        continue;
      }
      const spriteIdExpr = m[1];
      const restArgs = args.slice(1).map(a => a.trim()).filter(Boolean);
      result += srcStr.slice(i, idx);
      result += `rt.${methodName}(${[spriteIdExpr.trim(), ...restArgs].join(', ')})`;
      i = closeIdx + 1;
    }
    return result;
  }
  s = _liftSpriteIdMethod(s, 'StartSpriteAnim',           'StartSpriteAnim');
  s = _liftSpriteIdMethod(s, 'StartSpriteAnimIfDifferent','StartSpriteAnim');
  s = _liftSpriteIdMethod(s, 'StartSpriteAffineAnim',     'StartSpriteAffineAnim');
  s = _liftSpriteIdMethod(s, 'DestroySprite',             'DestroySprite');
  s = _liftSpriteIdMethod(s, 'DestroySpriteAndFreeResources', 'DestroySprite');
  // (FreeSpriteOamMatrix : not in runtime ; will fall through as identifier ref)

  // -1b. gSprites[X].oam.field → rt.gba.oam[_gs(rt, X).oamIndex].field
  //      (lift BEFORE _gs_ rewrite so the result uses the spriteId-based form
  //      `rt.gba.oam[_gs(rt, X).oamIndex].field` instead of the post-section-5
  //      result that would only know about _gs_(X).)
  //      We use balanced bracket parsing because X may contain [..].
  {
    let result = '';
    let i = 0;
    const prefix = 'gSprites[';
    while (i < s.length) {
      const idx = s.indexOf(prefix, i);
      if (idx < 0) { result += s.slice(i); break; }
      // Word-boundary check
      const prev = idx > 0 ? s[idx - 1] : ' ';
      if (/[A-Za-z0-9_]/.test(prev)) { result += s.slice(i, idx + prefix.length); i = idx + prefix.length; continue; }
      const openIdx = idx + prefix.length - 1; // '['
      const closeIdx = findBalancedClose(s, openIdx, '[', ']');
      if (closeIdx < 0) { result += s.slice(i); break; }
      const inner = s.slice(openIdx + 1, closeIdx);
      // Look at what follows : `.oam.<field>` ?
      const after = s.slice(closeIdx + 1);
      const oamM = after.match(/^\s*\.\s*oam\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
      result += s.slice(i, idx);
      if (oamM) {
        result += `rt.gba.oam[_gs(rt, ${inner.trim()}).oamIndex].${oamM[1]}`;
        i = closeIdx + 1 + oamM[0].length;
      } else {
        // Leave gSprites[..] alone — section 0 will handle it.
        result += s.slice(idx, closeIdx + 1);
        i = closeIdx + 1;
      }
    }
    s = result;
  }

  // 0. Balanced bracket conversion FIRST : gSprites[X] → _gs_(X), gTasks[X] → _gt_(X).
  //    This must happen before alias subs to avoid greedy regex eating brackets
  //    in nested forms like gSprites[...gTasks[X].field...].
  for (let pass = 0; pass < 5; pass++) {
    const before = s;
    s = substituteBalanced(s, 'gSprites[', (inner) => `_gs_(${inner})`);
    s = substituteBalanced(s, 'gTasks[', (inner) => `_gt_(${inner})`);
    if (s === before) break;
  }

  // 1. Field alias rules (#define sX/tX data[N])
  if (ctx.aliases) {
    for (const [alias, idx] of ctx.aliases) {
      // sprite->sX → sprite.data[N]
      const reSp = new RegExp(`sprite\\s*->\\s*${alias}\\b`, 'g');
      s = s.replace(reSp, `sprite.data[${idx}]`);
      // _gs_(X).sY → _gs_(X).data[N]
      const reGs = new RegExp(`(_gs_\\([^()]*(?:\\([^()]*\\)[^()]*)*\\))\\s*\\.\\s*${alias}\\b`, 'g');
      s = s.replace(reGs, `$1.data[${idx}]`);
      // _gt_(X).tY
      const reGt = new RegExp(`(_gt_\\([^()]*(?:\\([^()]*\\)[^()]*)*\\))\\s*\\.\\s*${alias}\\b`, 'g');
      s = s.replace(reGt, `$1.data[${idx}]`);
      // Bare alias (when "s16 *data = ..." lifted to const data)
      const reBare = new RegExp(`\\b${alias}\\b`, 'g');
      s = s.replace(reBare, `data[${idx}]`);
    }
  }

  // 2. sprite->oam.X → rt.gba.oam[sprite.oamIndex].X
  s = s.replace(/sprite\s*->\s*oam\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    'rt.gba.oam[sprite.oamIndex].$1');
  // 3. sprite->X → sprite.X (general field access)
  s = s.replace(/sprite\s*->\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'sprite.$1');

  // 4. gIntroFrameCounter
  s = s.replace(/\bgIntroFrameCounter\b/g, 'rt.gIntroFrameCounter');
  // 4b. Strict equality on rt.gIntroFrameCounter → >= (60Hz fixed-step bug fix)
  s = s.replace(/rt\.gIntroFrameCounter\s*==\s*([A-Z_][A-Z0-9_]*)/g,
    'rt.gIntroFrameCounter >= $1');

  // 5. _gs_(X) → expanded form (with fields appended)
  // _gs_(X).oam.Y → rt.gba.oam[_gs(rt, X).oamIndex].Y
  s = s.replace(/_gs_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*oam\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    'rt.gba.oam[_gs(rt, $1).oamIndex].$2');
  // _gs_(X).callback = Y
  s = s.replace(/_gs_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*callback\s*=\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    'rt.setSpriteCallback($1, $2)');
  // _gs_(X).data[N]
  s = s.replace(/_gs_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*data\s*\[\s*(\d+)\s*\]/g,
    '_gs(rt, $1).data[$2]');
  // _gs_(X).field
  s = s.replace(/_gs_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '_gs(rt, $1).$2');
  // Bare _gs_(X) (no field access) — rare
  s = s.replace(/_gs_\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, '_gs(rt, $1)');

  // 5b. OAM C field names → JS engine field names (1:1 décomp struct OamData →
  //     notre engine src/engine/gba/types.ts OamEntry).
  //     Le décomp utilise les noms hardware GBA (paletteNum, tileNum, matrixNum)
  //     mais notre engine pixel-perfect a renommé en (paletteBank, tileId,
  //     affineParamIndex). On substitue uniquement sur les accès rt.gba.oam[X].FIELD
  //     (post-règles 2/5) — les data tables OAM_DATAS conservent leurs noms originaux.
  const OAM_FIELD_MAP = {
    paletteNum: 'paletteBank',
    tileNum: 'tileId',
    matrixNum: 'affineParamIndex',
  };
  for (const [from, to] of Object.entries(OAM_FIELD_MAP)) {
    const re = new RegExp(`(rt\\.gba\\.oam\\[[^\\]]+\\])\\.${from}\\b`, 'g');
    s = s.replace(re, `$1.${to}`);
  }

  // 6. _gt_(taskId).func = X → task.func, else _gt(rt, X).func
  s = s.replace(/_gt_\(\s*taskId\s*\)\s*\.\s*func\s*=\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    'task.func = (t) => $1(t, rt)');
  s = s.replace(/_gt_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*func\s*=\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    '_gt(rt, $1).func = (t) => $2(t, rt)');
  // _gt_(taskId).data[N] → task.data[N]
  s = s.replace(/_gt_\(\s*taskId\s*\)\s*\.\s*data\s*\[\s*(\d+)\s*\]/g, 'task.data[$1]');
  s = s.replace(/_gt_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*data\s*\[\s*(\d+)\s*\]/g,
    '_gt(rt, $1).data[$2]');
  // _gt_(taskId).field → task.field
  s = s.replace(/_gt_\(\s*taskId\s*\)\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'task.$1');
  s = s.replace(/_gt_\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '_gt(rt, $1).$2');
  // Bare _gt_(X)
  s = s.replace(/_gt_\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, '_gt(rt, $1)');

  // 7f. CpuCopy32 / CpuFastCopy / DmaCopy16 — alias to CpuCopy16 for our purposes
  s = s.replace(/\bCpuCopy32\b/g, 'CpuCopy16');
  s = s.replace(/\bCpuFastCopy\b/g, 'CpuCopy16');
  // 8. CpuCopy16(SRC, DST, SZ) → rt.CpuCopy16(...)  (must run BEFORE gPlttBufferFaded[N] subst)
  s = s.replace(/CpuCopy16\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (full, srcExpr, dstExpr, sizeExpr) => {
    let srcCode = '';
    let srcOffset = '0';
    const srcMatchAddr = srcExpr.trim().match(/^&([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*([^\]]+)\s*\]$/);
    if (srcMatchAddr) {
      const palName = srcMatchAddr[1];
      // gPlttBufferUnfaded/Faded special-cased
      if (palName === 'gPlttBufferUnfaded' || palName === 'gPlttBufferFaded') {
        const buf = palName === 'gPlttBufferUnfaded' ? 'rt.gPlttBufferUnfaded' : 'rt.gPlttBufferFaded';
        // build a wrapping ArrayLike that reads from buf
        const baseExpr = srcMatchAddr[2]
          .replace(/OBJ_PLTT_ID\s*\(\s*([^)]+)\s*\)/g, '(256 + ($1) * 16)')
          .replace(/BG_PLTT_ID\s*\(\s*([^)]+)\s*\)/g, '(($1) * 16)');
        srcCode = `({ length: 512, [Symbol.iterator]: function*(){}, get: function(i){return ${buf}.get(${baseExpr} + i);} } as any)`;
        // We need a plain function-style arrayLike — since CpuCopy16 in helpers does src[srcOffset+i]
        // → use a Proxy fallback : actually let me use a function-cast hack
        srcCode = `_palView(${buf}, ${baseExpr})`;
        srcOffset = '0';
      } else {
        srcCode = `(rt.getExtraPalette(${JSON.stringify(palName)}) ?? new Uint16Array(0))`;
        srcOffset = srcMatchAddr[2].trim();
      }
    } else if (/^[A-Z][A-Z0-9_]*_RAW_PTR\(/.test(srcExpr.trim())) {
      srcCode = `/* TODO: ${srcExpr.trim()} */ new Uint16Array(0)`;
      srcOffset = '0';
    } else {
      srcCode = `(rt.getExtraPalette(${JSON.stringify(srcExpr.trim())}) ?? new Uint16Array(0))`;
      srcOffset = '0';
    }
    // Parse dst
    let dstCode = 'NaN';
    const dstMatch = dstExpr.trim().match(/^&gPlttBuffer(?:Faded|Unfaded)\s*\[\s*(.+?)\s*\]$/);
    if (dstMatch) {
      const dstFlat = dstMatch[1]
        .replace(/OBJ_PLTT_ID\s*\(\s*([^)]+)\s*\)/g, '(256 + ($1) * 16)')
        .replace(/BG_PLTT_ID\s*\(\s*([^)]+)\s*\)/g, '(($1) * 16)');
      dstCode = dstFlat;
    } else {
      dstCode = `/* TODO: dst ${dstExpr.trim()} */ 0`;
    }
    // Size : PLTT_SIZEOF(N) means N entries u16
    let sizeCode = sizeExpr.trim();
    const pltSizeOfMatch = sizeCode.match(/^PLTT_SIZEOF\s*\(\s*([^)]+)\s*\)$/);
    if (pltSizeOfMatch) {
      sizeCode = `(${pltSizeOfMatch[1]})`;
    } else {
      sizeCode = `Math.floor((${sizeCode}) / 2)`;
    }
    return `rt.CpuCopy16(${srcCode}, ${srcOffset}, ${dstCode}, ${sizeCode})`;
  });

  // 8b. gPlttBufferFaded[N] = X → rt.gPlttBufferFaded.set(N, X)  (post-CpuCopy16)
  s = s.replace(/gPlttBufferFaded\s*\[([^\]]+)\]\s*=\s*([^;]+);/g,
    'rt.gPlttBufferFaded.set($1, $2);');
  s = s.replace(/gPlttBufferFaded\s*\[([^\]]+)\]/g, 'rt.gPlttBufferFaded.get($1)');
  s = s.replace(/gPlttBufferUnfaded\s*\[([^\]]+)\]\s*=\s*([^;]+);/g,
    'rt.gPlttBufferUnfaded.set($1, $2);');
  s = s.replace(/gPlttBufferUnfaded\s*\[([^\]]+)\]/g, 'rt.gPlttBufferUnfaded.get($1)');
  // 8c. C type casts (move BEFORE & / * strip)
  s = s.replace(/\(u8\)\s*/g, '');
  s = s.replace(/\(u16\)\s*/g, '');
  s = s.replace(/\(u32\)\s*/g, '');
  s = s.replace(/\(s8\)\s*/g, '');
  s = s.replace(/\(s16\)\s*/g, '');
  s = s.replace(/\(s32\)\s*/g, '');
  s = s.replace(/\(int\)\s*/g, '');
  s = s.replace(/\(void\s*\*\)\s*/g, '');
  s = s.replace(/\(bool8\)\s*/g, '');
  s = s.replace(/\(bool32\)\s*/g, '');
  s = s.replace(/\(const\s+u16\s*\*\)\s*/g, '');
  s = s.replace(/\(const\s+u8\s*\*\)\s*/g, '');
  s = s.replace(/\(([a-zA-Z_][a-zA-Z0-9_]*)\s*\*+\)\s*/g, '');
  // Plain typedef cast `(MainCallback)X` / `(SomeType)X` (no *) — only strip when
  // the identifier is CamelCase (heuristic for typedef'd type)
  s = s.replace(/\(([A-Z][A-Za-z0-9_]*[a-z][A-Za-z0-9_]*)\)\s*([a-zA-Z_])/g, '$2');
  s = s.replace(/\(struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\*+\)\s*/g, '');
  s = s.replace(/\(const\s+struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\*+\)\s*/g, '');
  s = s.replace(/\(const\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\*+\)\s*/g, '');
  // Function pointer cast : (RET (*)(ARGS)) → drop
  s = s.replace(/\([a-zA-Z_][a-zA-Z0-9_]*\s*\(\s*\*+\s*\)\s*\([^)]*\)\)\s*/g, '');
  s = s.replace(/\(void\s*\(\s*\*+\s*\)\s*\([^)]*\)\)\s*/g, '');
  // Function pointer var "void (X)(void) = ..." → "let X: any = ..."
  s = s.replace(/^(\s*)void\s+\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*\([^)]*\)\s*=/gm, '$1let $2: any =');
  s = s.replace(/^(\s*)void\s+\(\s*\**\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*\([^)]*\)\s*=/gm, '$1let $2: any =');

  // 8d. Strip stray '&' that's clearly address-of (NOT binary AND).
  s = s.replace(/(,\s*)&\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(\(\s*)&\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(=\s*)&\s*([a-zA-Z_])/g, '$1$2');
  // 8e. Strip unary deref `*` (after `(`, `,`, `[`, `=`, `?`, `:`, operators)
  s = s.replace(/(,\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(\[\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(\(\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(=\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(\?\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(return\s+)\*\s*([a-zA-Z_])/g, '$1$2');
  // Boolean operators followed by *deref : `&& *x`, `|| *x`, `! *x`
  s = s.replace(/(&&\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(\|\|\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  s = s.replace(/(!\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  // Comparison operators : `== *x`, `!= *x`, `< *x`, `> *x`, `<= *x`, `>= *x`
  s = s.replace(/([=!<>]=?\s*)\*\s*([a-zA-Z_])/g, '$1$2');
  // Arithmetic binary operators followed by *deref : `+ *x`, `- *x` (NOT `*` itself)
  // Beware `* *x` (mult by deref) — match only single arith op
  s = s.replace(/([+\-/%]\s+)\*\s*([a-zA-Z_])/g, '$1$2');
  // Newline + indent + *id (line starts with `*x`)
  s = s.replace(/(\n\s+)\*\s*([a-zA-Z_])/g, '$1$2');
  // Strip "*&foo" combo (deref-of-address) → "foo"
  s = s.replace(/\*\s*&\s*([a-zA-Z_])/g, '$1');
  // Strip "(&foo)" → "(foo)"
  s = s.replace(/\(\s*&\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/g, '($1)');
  // Strip "*(expr)" form (lhs of =) at start of line / after ws — write-context
  s = s.replace(/(^|\n)(\s*)\*\s*\(([^)]+)\)\s*=/gm, '$1$2/* deref-write skipped: *($3) = */ void 0 ;//');
  // Strip "*(X)" → "(X)" for read deref of paren'd expression
  s = s.replace(/(\s|=|\(|,|return\s)\*\s*\(/g, '$1(');
  // Strip "*ptr" at expression start
  s = s.replace(/^(\s*)\*\s*([a-zA-Z_])/gm, '$1$2');

  // 9. SetOamMatrix(N, a, b, c, d) → SetOamMatrix(rt.gba, N, a, b, c, d)
  s = s.replace(/\bSetOamMatrix\s*\(/g, 'SetOamMatrix(rt.gba, ');

  // 10. CalcCenterToCornerVec(sprite, SHAPE, SIZE, MODE) → set on sprite
  s = s.replace(/CalcCenterToCornerVec\s*\(\s*sprite\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\)/g,
    (full, shapeArg, sizeArg, modeArg) => {
      const sh = shapeArg.trim().match(/SPRITE_SHAPE\((\d+)x(\d+)\)/);
      const sz = sizeArg.trim().match(/SPRITE_SIZE\((\d+)x(\d+)\)/);
      let shapeNum = 0, sizeNum = 0;
      if (sh) {
        const w = parseInt(sh[1], 10), h = parseInt(sh[2], 10);
        if (w === h) shapeNum = 0;
        else if (w > h) shapeNum = 1;
        else shapeNum = 2;
      }
      if (sz) {
        const w = parseInt(sz[1], 10), h = parseInt(sz[2], 10);
        if (w === h) sizeNum = ({ 8: 0, 16: 1, 32: 2, 64: 3 })[w] ?? 0;
        else if (w > h) sizeNum = ({ '16x8': 0, '32x8': 1, '32x16': 2, '64x32': 3 })[`${w}x${h}`] ?? 0;
        else sizeNum = ({ '8x16': 0, '8x32': 1, '16x32': 2, '32x64': 3 })[`${w}x${h}`] ?? 0;
      }
      let modeNum = '0';
      const mode = modeArg.trim();
      if (mode === 'ST_OAM_AFFINE_NORMAL') modeNum = '1';
      else if (mode === 'ST_OAM_AFFINE_DOUBLE') modeNum = '3';
      else if (mode === 'ST_OAM_AFFINE_ERASE') modeNum = '2';
      else if (mode === 'ST_OAM_AFFINE_OFF') modeNum = '0';
      else modeNum = mode;
      return `(() => { const _ctcv = CalcCenterToCornerVec(${shapeNum}, ${sizeNum}, ${modeNum}); sprite.centerToCornerVecX = _ctcv.centerToCornerVecX; sprite.centerToCornerVecY = _ctcv.centerToCornerVecY; })()`;
    });

  // 11. StartSpriteAnim / StartSpriteAffineAnim — `sprite` (current SpriteCB
  //      param) form. The `&gSprites[X]` form was already lifted at section -1.
  s = s.replace(/\bStartSpriteAnim\s*\(\s*sprite\s*,\s*([^)]+)\)/g,
    'rt.StartSpriteAnim(sprite.spriteId, $1)');
  s = s.replace(/\bStartSpriteAnimIfDifferent\s*\(\s*sprite\s*,\s*([^)]+)\)/g,
    'rt.StartSpriteAnim(sprite.spriteId, $1)');
  s = s.replace(/\bStartSpriteAffineAnim\s*\(\s*sprite\s*,\s*([^)]+)\)/g,
    'rt.StartSpriteAffineAnim(sprite.spriteId, $1)');

  // 12. DestroySprite(sprite) → rt.DestroySprite(sprite.spriteId)
  //      The `&gSprites[X]` form was already lifted at section -1.
  s = s.replace(/\bDestroySprite\s*\(\s*sprite\s*\)/g, 'rt.DestroySprite(sprite.spriteId)');

  // 13. CreateSprite(&sSpriteTemplate_X, x, y, prio) → rt.CreateSpriteFromTemplate(...)
  s = s.replace(/\bCreateSprite\s*\(\s*&\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*[^)]+\)/g,
    `rt.CreateSpriteFromTemplate('$1', $2, $3)`);
  // 13b. CreateSprite without "&" — only if name looks like template
  s = s.replace(/\bCreateSprite\s*\(\s*([sg][A-Z][A-Za-z0-9_]*)\s*,/g,
    `rt.CreateSpriteFromTemplate('$1', `);
  // 13c. PHASE E2.B — pour les templates convertis (CONVERTED_TEMPLATES), réécrit le
  //      resolver string-catalogue produit par 13/13b vers l'appel objet 1:1
  //      `CreateSprite(rt, sX, …)` (= décomp `CreateSprite`, voie sheet-par-tag de
  //      game/sprite.ts). Les args (x, y[, prio]) sont préservés tels quels.
  for (const tplName of CONVERTED_TEMPLATES) {
    s = s.replace(
      new RegExp(`\\brt\\.CreateSpriteFromTemplate\\(\\s*'${tplName}'\\s*,`, 'g'),
      `CreateSprite(rt, ${tplName},`);
  }

  // 14. CreateTask(Task_X, prio) → rt.CreateTask((t) => Task_X(t, rt), prio)
  s = s.replace(/\bCreateTask\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*([^)]+)\)/g,
    `rt.CreateTask((t) => $1(t, rt), $2)`);

  // 15. DestroyTask(taskId) → rt.DestroyTask(taskId)
  s = s.replace(/\bDestroyTask\s*\(/g, 'rt.DestroyTask(');

  // 16. Random() → Math.floor(Math.random() * 0x10000)
  s = s.replace(/\bRandom\s*\(\s*\)/g, 'Math.floor(Math.random() * 0x10000)');

  // 17. MOD(a, b) / SAFE_DIV(a, b)
  s = s.replace(/\bMOD\s*\(([^,]+),\s*([^)]+)\)/g, '(($1) % ($2))');
  s = s.replace(/\bSAFE_DIV\s*\(([^,]+),\s*([^)]+)\)/g, '(($2) === 0 ? 0 : (($1) / ($2)) | 0)');

  // 18. ARRAY_COUNT(arr) → arr.length
  s = s.replace(/\bARRAY_COUNT\s*\(([^)]+)\)/g, '(($1)?.length ?? 0)');

  // 19. gOamMatrices[N] → rt.gba.affineParams[N]
  s = s.replace(/\bgOamMatrices\s*\[([^\]]+)\]/g, 'rt.gba.affineParams[$1]');

  // 20. TRUE / FALSE / NULL → true / false / null
  s = s.replace(/\bTRUE\b/g, 'true');
  s = s.replace(/\bFALSE\b/g, 'false');
  s = s.replace(/\bNULL\b/g, 'null');

  // 21. C type casts (already moved to section 8c above)
  // (no-op here, keeping placeholder for ordering)

  // 22. sizeof(X) → fallback
  //     For "struct X" inside, return placeholder constant.
  s = s.replace(/\bsizeof\s*\(\s*struct\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\)/g, '/* sizeof(struct) */ 0');
  s = s.replace(/\bsizeof\s*\(([a-zA-Z_][a-zA-Z0-9_.\[\]]*)\)/g, '(($1)?.length ?? 32)');
  s = s.replace(/\bsizeof\s*\(([^)]+)\)/g, '/* sizeof($1) */ 0');
  // sizeof X (no parens) — must be word
  s = s.replace(/\bsizeof\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '(($1)?.length ?? 32)');
  // offsetof(TYPE, field) → 0 (placeholder)
  s = s.replace(/\boffsetof\s*\([^)]+\)/g, '/* offsetof */ 0');

  // 23. Decomp-only macros : SetVBlankCallback / SetMainCallback2 → noop
  s = s.replace(/\bSetVBlankCallback\s*\([^)]*\)\s*;/g, '/* noop SetVBlankCallback */;');
  s = s.replace(/\bSetMainCallback2\s*\(([^)]+)\)\s*;/g, '/* TODO scene transition: SetMainCallback2($1) */;');
  // Audio : préserver BGM + SE 1:1 décomp.
  // Décomp utilise m4aSongNumStart pour BGM ET SE indistinctement (= ID dans song table).
  // Notre runtime sépare BGM (slot bgm) vs SE (slot se1/se2). Dispatch selon préfixe :
  //   m4aSongNumStart(SE_X)  → PlaySE(SE_X)        (= one-shot SE slot)
  //   m4aSongNumStart(MUS_X) → m4aSongNumStart(MUS_X) (= BGM slot, préservé)
  s = s.replace(/\bm4aSongNumStart\s*\(\s*SE_(\w+)\s*\)\s*;/g, 'PlaySE(SE_$1);');
  // m4aSongNumStart pour MUS_X et m4aSongNumStop préservés tels quels (BGM control).
  s = s.replace(/\bResetSerial\s*\(\s*\)\s*;/g, '/* noop ResetSerial */;');
  s = s.replace(/\bIntroResetGpuRegs\s*\(\s*\)\s*;/g, 'rt.IntroResetGpuRegs();');
  s = s.replace(/\bResetSpriteData\s*\(\s*\)\s*;/g, 'rt.ResetSpriteData();');
  s = s.replace(/\bFreeAllSpritePalettes\s*\(\s*\)\s*;/g, '/* TODO FreeAllSpritePalettes */;');
  // PlaySE / PlayBGM / PlayFanfare : préservés tels quels — exportés par
  // decomp-globals.ts et auto-importés dans header (= cf. KNOWN_DECOMP_GLOBALS).
  // Avant : ces calls étaient transformés en TODO comment → silence partout.

  // 24. SetGpuReg → rt.SetGpuReg
  s = s.replace(/\bSetGpuReg\s*\(/g, 'rt.SetGpuReg(');
  // 25. BeginNormalPaletteFade → rt.BeginNormalPaletteFade — needs balanced parsing
  s = substituteBalancedParens(s, 'BeginNormalPaletteFade(', (inner) => {
    const args = splitTopLevelCommas(inner);
    if (args.length < 5) return `rt.BeginNormalPaletteFade(/* args parse failed */ ${JSON.stringify(inner)})`;
    const [palettes, delay, startY, endY, color] = args;
    return `rt.BeginNormalPaletteFade(${JSON.stringify(palettes.trim())}, ${delay.trim()}, ${startY.trim()}, ${endY.trim()}, ${JSON.stringify(color.trim())})`;
  });

  // 26. LoadPalette / LoadCompressedSpriteSheet / LoadSpritePalettes / LZ77UnCompVram → TODO
  s = s.replace(/\bLoadPalette\s*\([^)]*\)\s*;/g, '/* TODO LoadPalette — load via rt.LoadPaletteBg/Obj at scene init */;');
  s = s.replace(/\bLoadCompressedSpriteSheet\s*\([^)]*\)\s*;/g, '/* TODO LoadCompressedSpriteSheet — load via rt.LoadCompressedSpriteSheetsFromTable */;');
  s = s.replace(/\bLoadSpritePalettes\s*\([^)]*\)\s*;/g, '/* TODO LoadSpritePalettes — load via rt.LoadSpritePalettesFromTable */;');
  s = s.replace(/\bLZ77UnCompVram\s*\([^)]*\)\s*;/g, '/* TODO LZ77UnCompVram — load via rt.LZ77UnCompVram_* at scene init */;');
  s = s.replace(/\bDmaClear16\s*\([^)]*\)\s*;/g, '/* TODO DmaClear16 (memory clear) */;');
  s = s.replace(/\bDmaCopy16\s*\([^)]*\)\s*;/g, '/* TODO DmaCopy16 */;');

  // 27. gPaletteFade → rt.gPaletteFade
  s = s.replace(/\bgPaletteFade\b/g, 'rt.gPaletteFade');

  // 27a. C numeric literal suffixes : 0.14f → 0.14 ; 100u → 100 ; 100U → 100 ; 100L → 100 ; 100UL → 100
  // \b au début sinon `0x7F` → `0x7` (le `F` est consommé comme suffixe).
  s = s.replace(/\b(\d+\.?\d*|\.\d+)([fFlLuU]+)\b/g, '$1');
  // 27a1. C octal literals 00, 02, 010, 0xx → strip leading zeros (keep `0` itself)
  //       In `case 00:` etc. Avoid touching `0x...` / `0b...` / `0o...`
  s = s.replace(/(\W)0+([1-9]\d*)\b/g, '$1$2');
  s = s.replace(/(\W)00+\b/g, '$10');
  // 27a2. SPRITE_SHAPE(WxH) / SPRITE_SIZE(WxH) → numeric (resolve W/H)
  s = s.replace(/SPRITE_SHAPE\((\d+)x(\d+)\)/g, (full, w, h) => {
    w = parseInt(w, 10); h = parseInt(h, 10);
    if (w === h) return '0';
    if (w > h) return '1';
    return '2';
  });
  s = s.replace(/SPRITE_SIZE\((\d+)x(\d+)\)/g, (full, w, h) => {
    w = parseInt(w, 10); h = parseInt(h, 10);
    if (w === h) return String(({ 8: 0, 16: 1, 32: 2, 64: 3 })[w] ?? 0);
    if (w > h) return String(({ '16x8': 0, '32x8': 1, '32x16': 2, '64x32': 3 })[`${w}x${h}`] ?? 0);
    return String(({ '8x16': 0, '8x32': 1, '16x32': 2, '32x64': 3 })[`${w}x${h}`] ?? 0);
  });

  // 27b. GCC range case `case A ... B:` → expand to comment + a fallback case A
  //      (TS doesn't support range case)
  s = s.replace(/case\s+([^:]+?)\s*\.\.\.\s*([^:]+?):/g, 'case $1: /* ... case $2: range collapsed */');

  // 28. GENDER_COUNT, MUS_INTRO etc — bare identifiers stay (assume defined)
  // (no op)

  // 29. Final fallback : convert remaining C pointer access X->Y to X.Y
  //     This makes the code parse-valid TS. Throws at runtime if null, but at
  //     least the file compiles.
  if (s.includes('->')) {
    warnings.push('Residual `->` (unmapped C pointer access) — fallback to .');
    s = s.replace(/->/g, '.');
  }

  // 30. Rename JS reserved keywords used as C var names
  //     `var`, `let`, `const`, `class`, `enum`, `function`, `delete`, `default`, etc.
  //     We only rename those that appear AS a `let X` declaration to avoid collateral.
  s = s.replace(/\blet\s+(var|let|const|class|enum|function|delete|new|in|with)\b/g, 'let _$1');
  //   And rename references to those in the same body. Heuristic : only `var` is common.
  s = s.replace(/\b(?<![\.\$])var\b(?!\s+\w+\s*:)/g, '_var');

  return { tsCode: s, warnings };
}

// ─── Step 4 : Generate one TS module per scene ──────────────────────────────

/** Map from scene .c name → matching data .ts file (relative to outDir). */
function findSceneDataModule(sceneName) {
  // The decomp-data dir uses kebab-case while .c files use snake_case.
  const candidates = [
    sceneName.replace(/_/g, '-') + '-data',
    sceneName + '-data',
  ];
  const dataDir = resolve(projectRoot, 'src', 'engine', 'decomp-data');
  for (const cand of candidates) {
    const fpath = resolve(dataDir, cand + '.ts');
    if (existsSync(fpath)) {
      return { importPath: `../../${cand}`, fsPath: fpath };
    }
  }
  return null;
}

/** Read a TS file and extract its `export const X = ...` and `export const X: T = ...` names. */
function extractExportedConstNames(fsPath) {
  try {
    const src = readFileSync(fsPath, 'utf8');
    const names = new Set();
    const re = /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*[:=]/g;
    let m;
    while ((m = re.exec(src)) !== null) names.add(m[1]);
    return names;
  } catch {
    return new Set();
  }
}

// ─── Constant resolver ──────────────────────────────────────────────────────

/**
 * Try to evaluate a C constant-expression of the form composed of:
 *   - decimal/hex integers (with optional U/L suffix)
 *   - the operators : | & ^ ~ << >> + - * / % ()
 *   - identifiers already in `known` map
 *   - simple bool ops via 0/1
 * Returns a JS number or `null` if the expression couldn't be evaluated.
 */
function tryEvalCExpr(expr, known) {
  let s = expr.trim();
  if (!s) return null;
  // Strip C numeric suffixes
  s = s.replace(/(\d+\.?\d*|\.\d+)([fFlLuU]+)\b/g, '$1');
  // Replace identifiers with their value (only those known)
  const idRe = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let allKnown = true;
  s = s.replace(idRe, (full, name) => {
    if (known.has(name)) return `(${known.get(name)})`;
    allKnown = false;
    return full;
  });
  if (!allKnown) return null;
  // Allow only safe characters
  if (!/^[\d\s+\-*/%&|^~()<>0xXa-fA-F.]+$/.test(s)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict";return (${s})`)();
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    return v | 0;  // coerce to int (most C #defines are int)
  } catch {
    return null;
  }
}

/**
 * Build the cross-decomp constant resolver.
 *
 * Sources :
 *  1. `decomp/include/**\/*.h` — `#define X N`, `enum {A,B,C}`, `enum X {A=1,B}`
 *  2. `decomp/src/*.c`         — anonymous enums declared inside .c files
 *  3. `auto/src/*-data.ts`     — `export const X = N`, `export const ENUM_X = { A: V }`
 *  4. `auto-engine/src/*-engine.ts` — same patterns
 *
 * Returns Map<string name, number value>.
 *
 * Multi-pass : we re-scan #defines until no new resolutions happen, since some
 * defines reference other defines (e.g. `BLDCNT_EFFECT_LIGHTEN (2 << 6)`).
 */
function buildConstantResolver() {
  const resolved = new Map();

  // ─── Pass 1 : TS exports (auto-generated data) — these are already concrete.
  const tsRoots = [
    resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src'),
    resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'include'),
    resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-engine', 'src'),
    resolve(projectRoot, 'src', 'engine', 'decomp-data'),
    resolve(projectRoot, 'src', 'engine'),
  ];
  for (const root of tsRoots) {
    if (!existsSync(root)) continue;
    const files = globSync(`${root.replace(/\\/g, '/')}/**/*.ts`);
    for (const fpath of files) {
      let src;
      try { src = readFileSync(fpath, 'utf8'); } catch { continue; }
      // a) export const X = NUM ;   (single line)
      const rePrim = /export\s+const\s+([A-Z][A-Z0-9_]*)\s*(?::\s*[^=]+)?\s*=\s*(0x[0-9a-fA-F]+|-?\d+)\s*;/g;
      let m;
      while ((m = rePrim.exec(src)) !== null) {
        const [, name, val] = m;
        const n = val.startsWith('0x') ? parseInt(val, 16) : parseInt(val, 10);
        if (!resolved.has(name)) resolved.set(name, n);
      }
      // b) export const X = (expr) ;  — try tryEvalCExpr
      const reExpr = /export\s+const\s+([A-Z][A-Z0-9_]*)\s*(?::\s*[^=]+)?\s*=\s*([^;{]+);/g;
      while ((m = reExpr.exec(src)) !== null) {
        const [, name, expr] = m;
        if (resolved.has(name)) continue;
        const v = tryEvalCExpr(expr, resolved);
        if (v !== null) resolved.set(name, v);
      }
      // c) export const ENUM_X = { A: 1, B: 2, ... } as const ;
      const reEnum = /export\s+const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\{([\s\S]*?)\}\s*as\s+const\s*;/g;
      while ((m = reEnum.exec(src)) !== null) {
        const body = m[1];
        const reMember = /([A-Z][A-Z0-9_]+)\s*:\s*(0x[0-9a-fA-F]+|-?\d+)\s*,?/g;
        let mm;
        while ((mm = reMember.exec(body)) !== null) {
          const [, name, val] = mm;
          const n = val.startsWith('0x') ? parseInt(val, 16) : parseInt(val, 10);
          if (!resolved.has(name)) resolved.set(name, n);
        }
      }
    }
  }

  // ─── Pass 2 : C #defines + enums (decomp/include + decomp/src).
  const cRoots = [
    resolve(decompRoot, 'include'),
    resolve(decompRoot, 'src'),
  ];
  const cFiles = [];
  for (const root of cRoots) {
    if (!existsSync(root)) continue;
    cFiles.push(...globSync(`${root.replace(/\\/g, '/')}/**/*.{h,c}`));
  }
  // Collect raw text once
  const rawSources = new Map();
  for (const fpath of cFiles) {
    try { rawSources.set(fpath, readFileSync(fpath, 'utf8')); } catch { /* ignore */ }
  }

  // Strip block + line comments for parsing
  function strip(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  }

  // a) Anonymous + named enums
  const reEnum = /\benum\s+(?:[A-Za-z_]\w*\s+)?\{([^{}]*)\}/g;
  for (const src of rawSources.values()) {
    const stripped = strip(src);
    let em;
    while ((em = reEnum.exec(stripped)) !== null) {
      const body = em[1];
      // Members : NAME or NAME = VALUE, separated by commas
      const members = body.split(',').map(p => p.trim()).filter(Boolean);
      let curr = 0;
      for (const mem of members) {
        const eq = mem.indexOf('=');
        let name, val;
        if (eq >= 0) {
          name = mem.slice(0, eq).trim();
          const valExpr = mem.slice(eq + 1).trim();
          const v = tryEvalCExpr(valExpr, resolved);
          if (v !== null) curr = v;
          val = curr;
        } else {
          name = mem;
          val = curr;
        }
        // Skip if name has whitespace or isn't an identifier
        if (!/^[A-Za-z_]\w*$/.test(name)) { curr++; continue; }
        if (!resolved.has(name)) resolved.set(name, val);
        curr++;
      }
    }
  }

  // b) #defines — multi-pass until stable (handles recursive resolution)
  const reDef = /^\s*#\s*define\s+([A-Z][A-Z0-9_]*)\s+([^\n\\]+(?:\\\n[^\n\\]+)*)$/gm;
  for (let pass = 0; pass < 8; pass++) {
    const sizeBefore = resolved.size;
    for (const src of rawSources.values()) {
      const stripped = strip(src);
      let m;
      reDef.lastIndex = 0;
      while ((m = reDef.exec(stripped)) !== null) {
        const [, name, exprRaw] = m;
        if (resolved.has(name)) continue;
        const expr = exprRaw.replace(/\\\n/g, ' ').trim();
        // Skip parametrized macros — heuristic : starts with `(` after skipping
        // ws. (Real fn-like macros are detected by checking if the original
        // line has `NAME(` form, but this regex requires a space after NAME so
        // we don't match those.)
        const v = tryEvalCExpr(expr, resolved);
        if (v !== null) resolved.set(name, v);
      }
    }
    if (resolved.size === sizeBefore) break;
  }

  return resolved;
}

/** Scan a transpiled body for ALL_CAPS identifiers (constants). */
function findAllCapsIdentifiers(tsCode) {
  const ids = new Set();
  // Strip /* ... */ block comments + // line comments to avoid false positives
  // (especially "/* TODO ... */" markers).
  const stripped = tsCode
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  const re = /\b([A-Z][A-Z0-9_]{2,})\b/g;
  let m;
  while ((m = re.exec(stripped)) !== null) ids.add(m[1]);
  return ids;
}

/** Common decomp constants/enums that aren't in <scene>-data.ts but are global. */
const GLOBAL_CONSTANTS = new Set([
  'TRUE', 'FALSE', 'NULL', 'DISPLAY_WIDTH', 'DISPLAY_HEIGHT',
  'PALETTES_ALL', 'PALETTES_BG', 'PALETTES_OBJ',
  'RGB', 'RGB_BLACK', 'RGB_WHITE', 'RGB_WHITEALPHA',
  'Q_8_8_TO_INT', 'SPRITE_SHAPE', 'SPRITE_SIZE',
  'ST_OAM_AFFINE_OFF', 'ST_OAM_AFFINE_NORMAL', 'ST_OAM_AFFINE_DOUBLE', 'ST_OAM_AFFINE_ERASE',
  'ST_OAM_OBJ_NORMAL', 'ST_OAM_OBJ_BLEND', 'ST_OAM_OBJ_WINDOW',
  'ST_OAM_4BPP', 'ST_OAM_8BPP',
  'PLTT_SIZE_4BPP', 'PLTT_SIZE_8BPP',
  'BLDCNT_EFFECT_BLEND', 'BLDCNT_TGT1_BG0', 'BLDCNT_TGT1_BG1', 'BLDCNT_TGT1_BG2', 'BLDCNT_TGT1_BG3',
  'BLDCNT_TGT1_OBJ', 'BLDCNT_TGT1_BD',
  'BLDCNT_TGT2_BG0', 'BLDCNT_TGT2_BG1', 'BLDCNT_TGT2_BG2', 'BLDCNT_TGT2_BG3',
  'BLDCNT_TGT2_OBJ', 'BLDCNT_TGT2_BD',
  'DISPCNT_MODE_0', 'DISPCNT_MODE_1', 'DISPCNT_MODE_2',
  'DISPCNT_OBJ_1D_MAP', 'DISPCNT_BG0_ON', 'DISPCNT_BG1_ON', 'DISPCNT_BG2_ON', 'DISPCNT_BG3_ON',
  'DISPCNT_OBJ_ON', 'DISPCNT_WIN0_ON', 'DISPCNT_BG_ALL_ON',
  'BGCNT_PRIORITY', 'BGCNT_CHARBASE', 'BGCNT_SCREENBASE', 'BGCNT_16COLOR', 'BGCNT_256COLOR',
  'BGCNT_TXT256x256', 'BGCNT_TXT512x256', 'BGCNT_TXT256x512', 'BGCNT_TXT512x512',
  'BGCNT_AFF128x128', 'BGCNT_AFF256x256', 'BGCNT_AFF512x512', 'BGCNT_AFF1024x1024',
  'BG_PLTT_ID', 'OBJ_PLTT_ID', 'BG_CHAR_ADDR', 'BG_SCREEN_ADDR',
  'REG_OFFSET_DISPCNT', 'REG_OFFSET_BG0CNT', 'REG_OFFSET_BG1CNT', 'REG_OFFSET_BG2CNT', 'REG_OFFSET_BG3CNT',
  'REG_OFFSET_BG0HOFS', 'REG_OFFSET_BG0VOFS', 'REG_OFFSET_BG1HOFS', 'REG_OFFSET_BG1VOFS',
  'REG_OFFSET_BG2HOFS', 'REG_OFFSET_BG2VOFS', 'REG_OFFSET_BG3HOFS', 'REG_OFFSET_BG3VOFS',
  'REG_OFFSET_WIN0H', 'REG_OFFSET_WIN1H', 'REG_OFFSET_WIN0V', 'REG_OFFSET_WIN1V',
  'REG_OFFSET_WININ', 'REG_OFFSET_WINOUT', 'REG_OFFSET_BLDCNT', 'REG_OFFSET_BLDALPHA', 'REG_OFFSET_BLDY',
  'BG_SCREEN_SIZE', 'PLTT_SIZEOF',
  'OBJ_PLTT_ID_FADED', 'BG_PLTT_ID_FADED',
  'BLDALPHA_BLEND', 'WIN_RANGE', 'GET_TRUE_SPRITE_INDEX', 'ANIM_SPRITES_START',
]);

function generateModule(sceneName, entries, aliases, constResolver) {
  // ── Phase 1 : transpile all bodies + collect referenced constants
  const transpiled = {
    spriteCbs: [],   // { name, tsCode | error }
    tasks: [],
    cb2s: [],
    helpers: [],
  };
  const referencedConstants = new Set();

  function transpileEntry(name, bodyC, kind) {
    if (!bodyC.trim()) return { name, tsCode: null, error: 'empty bodyC' };
    try {
      const { tsCode, warnings } = transpileBody(bodyC, { aliases, kind });
      for (const w of warnings) warn(`${sceneName}.c ${name} : ${w}`);
      // collect ALL_CAPS identifiers referenced
      for (const id of findAllCapsIdentifiers(tsCode)) referencedConstants.add(id);
      return { name, tsCode, info: undefined };
    } catch (e) {
      warn(`${sceneName}.c ${name} : transpile threw ${e.message}`);
      return { name, tsCode: null, error: e.message };
    }
  }

  const allSpriteCbs = { ...(entries.callbacks ?? {}), ...(entries.spriteCbs ?? {}) };
  for (const [name, info] of Object.entries(allSpriteCbs)) {
    stats.spriteCbAttempted++;
    const bodyC = typeof info === 'string' ? info : (info.bodyC ?? '');
    const r = transpileEntry(name, bodyC, 'sprite');
    if (r.tsCode) stats.spriteCbOk++; else stats.spriteCbFailed++;
    transpiled.spriteCbs.push(r);
  }
  for (const [name, info] of Object.entries(entries.tasks ?? {})) {
    stats.taskAttempted++;
    const r = transpileEntry(name, info.bodyC ?? '', 'task');
    if (r.tsCode) stats.taskOk++; else stats.taskFailed++;
    transpiled.tasks.push(r);
  }
  for (const [name, info] of Object.entries(entries.cb2s ?? {})) {
    stats.cb2Attempted++;
    const r = transpileEntry(name, info.bodyC ?? '', 'cb2');
    if (r.tsCode) stats.cb2Ok++; else stats.cb2Failed++;
    transpiled.cb2s.push(r);
  }
  for (const [name, info] of Object.entries(entries.helpers ?? {})) {
    stats.helperAttempted++;
    const r = transpileEntry(name, info.bodyC ?? '', 'helper');
    if (r.tsCode) stats.helperOk++;
    transpiled.helpers.push({ ...r, info });
  }

  // ── Phase 2 : Resolve constants
  const dataModInfo = findSceneDataModule(sceneName);
  let dataModExports = new Set();
  if (dataModInfo) dataModExports = extractExportedConstNames(dataModInfo.fsPath);

  const importsFromDataMod = [];
  const resolvedConstants = [];   // [{ name, value }]
  const undefinedConstants = [];
  // Cross-reference name set (other callbacks/tasks/helpers in same module)
  const localNames = new Set();
  for (const r of [...transpiled.spriteCbs, ...transpiled.tasks, ...transpiled.cb2s, ...transpiled.helpers]) {
    localNames.add(r.name);
  }

  for (const id of referencedConstants) {
    if (GLOBAL_CONSTANTS.has(id)) continue;
    if (dataModExports.has(id)) {
      importsFromDataMod.push(id);
      continue;
    }
    if (localNames.has(id)) continue;
    // Try the cross-decomp resolver
    if (constResolver && constResolver.has(id)) {
      resolvedConstants.push({ name: id, value: constResolver.get(id) });
      continue;
    }
    // Unknown — emit shim
    undefinedConstants.push(id);
  }

  // ── Phase 3 : Emit module
  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/transpile-callbacks.mjs`);
  lines.push(`// Source : src/${sceneName}.c (via SPRITE_CALLBACKS / TASKS / SPRITE_CBS / CB2S)`);
  lines.push(`// Generated : ${NOW}`);
  lines.push(`// DO NOT EDIT — re-run \`node scripts/transpile-callbacks.mjs\` to refresh.`);
  lines.push(`//`);
  lines.push(`// Symbol substitution rules in script header.`);
  lines.push(`// Manual fixes may be needed for /* TODO */ markers and undefined constants below.`);
  lines.push(``);
  lines.push(`/* eslint-disable */`);
  lines.push(`// @ts-nocheck`);
  lines.push(``);
  lines.push(`import type { DecompRuntime, DecompSprite, DecompTask } from '../../../decomp-runtime';`);
  // Hardcoded import set from decomp-helpers.ts.
  // ⚠ BUG FIX 2026-05-09 : ces symbols sont aussi candidats pour l'auto-scan
  // de decomp-globals.ts (= certains sont définis en doublon par accident).
  // On track ici l'ensemble pour exclure de l'auto-scan en aval (= éviter le
  // bug "duplicate imports BLDALPHA_BLEND").
  const HARDCODED_HELPERS_IMPORTS = new Set([
    'Sin', 'Cos', 'Q_8_8_TO_INT', 'SetOamMatrix', 'CalcCenterToCornerVec',
    'ST_OAM_AFFINE_OFF', 'ST_OAM_AFFINE_NORMAL', 'ST_OAM_AFFINE_DOUBLE', 'ST_OAM_AFFINE_ERASE',
    'ST_OAM_OBJ_NORMAL', 'ST_OAM_OBJ_BLEND', 'ST_OAM_OBJ_WINDOW',
    'ST_OAM_4BPP', 'ST_OAM_8BPP',
    'RGB', 'RGB_BLACK', 'RGB_WHITE', 'RGB_WHITEALPHA',
    'PLTT_SIZEOF', 'PLTT_SIZE_4BPP', 'PLTT_SIZE_8BPP',
    'OBJ_PLTT_ID_FADED', 'BG_PLTT_ID_FADED',
    'BLDALPHA_BLEND', 'WIN_RANGE', 'GET_TRUE_SPRITE_INDEX', 'ANIM_SPRITES_START',
    'gSineTable', 'PaletteBuffer',
  ]);
  lines.push(`import {`);
  lines.push(`  Sin, Cos, Q_8_8_TO_INT, SetOamMatrix, CalcCenterToCornerVec,`);
  lines.push(`  ST_OAM_AFFINE_OFF, ST_OAM_AFFINE_NORMAL, ST_OAM_AFFINE_DOUBLE, ST_OAM_AFFINE_ERASE,`);
  lines.push(`  ST_OAM_OBJ_NORMAL, ST_OAM_OBJ_BLEND, ST_OAM_OBJ_WINDOW,`);
  lines.push(`  ST_OAM_4BPP, ST_OAM_8BPP,`);
  lines.push(`  RGB, RGB_BLACK, RGB_WHITE, RGB_WHITEALPHA,`);
  lines.push(`  PLTT_SIZEOF, PLTT_SIZE_4BPP, PLTT_SIZE_8BPP,`);
  lines.push(`  OBJ_PLTT_ID_FADED, BG_PLTT_ID_FADED,`);
  lines.push(`  BLDALPHA_BLEND, WIN_RANGE, GET_TRUE_SPRITE_INDEX, ANIM_SPRITES_START,`);
  lines.push(`  gSineTable, PaletteBuffer,`);
  lines.push(`} from '../../../decomp-helpers';`);

  // ── Auto-import depuis decomp-globals.ts : scan dynamique de TOUS les exports
  // de decomp-globals.ts (= 250+ symbols) puis détecte ceux référencés dans les
  // bodies. Future-proof : pas de whitelist à maintenir, suit auto les ajouts
  // dans decomp-globals.ts.
  const decompGlobalsExports = (() => {
    try {
      const pathLib = resolve(__dirname, '../src/engine/decomp-globals.ts');
      const src = readFileSync(pathLib, 'utf8');
      const names = new Set();
      // Match `export function X`, `export const X`, `export class X`,
      // `export type X`, `export enum X`, `export interface X`. SKIP `let`/`var`
      // exports — ES modules ne permettent pas reassign de l'import binding,
      // donc l'auto code qui fait `gBattle_BG1_Y = ...` casserait.
      const reSingle = /^export\s+(?:async\s+)?(?:function|const|class|enum|interface)\s+([A-Za-z_$][\w$]*)/gm;
      let m;
      while ((m = reSingle.exec(src)) !== null) names.add(m[1]);
      // export { A, B as C } from '...';  OR  export { A, B };
      const reList = /^export\s*\{([^}]+)\}/gm;
      while ((m = reList.exec(src)) !== null) {
        for (const part of m[1].split(',')) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          // `Original as Alias` → garder Alias (= le nom exporté).
          const aliasMatch = trimmed.match(/^\S+\s+as\s+([A-Za-z_$][\w$]*)$/);
          names.add(aliasMatch ? aliasMatch[1] : trimmed.split(/\s+/)[0]);
        }
      }
      return names;
    } catch (e) {
      console.warn(`[transpile-callbacks] failed to scan decomp-globals.ts exports: ${e.message}`);
      return new Set();
    }
  })();
  // Scan all transpiled bodies for any exported symbol of decomp-globals.
  const usedDecompGlobals = new Set();
  // Pre-extract identifiers from each body to avoid 250×N regex sweeps.
  for (const r of [...transpiled.spriteCbs, ...transpiled.tasks, ...transpiled.cb2s, ...transpiled.helpers]) {
    if (!r.tsCode) continue;
    const ids = r.tsCode.match(/\b[A-Za-z_$][\w$]*\b/g) ?? [];
    for (const id of ids) {
      // Skip symbols already imported from decomp-helpers (= BUG FIX 2026-05-09 :
      // certains symbols comme BLDALPHA_BLEND existent dans LES DEUX fichiers,
      // l'auto-import les ajoutait → "Duplicate identifier" TS error).
      if (HARDCODED_HELPERS_IMPORTS.has(id)) continue;
      if (decompGlobalsExports.has(id)) usedDecompGlobals.add(id);
    }
  }
  if (usedDecompGlobals.size > 0) {
    const sorted = Array.from(usedDecompGlobals).sort();
    lines.push(`import {`);
    for (const sym of sorted) lines.push(`  ${sym},`);
    lines.push(`} from '../../../decomp-globals';`);
  }

  if (importsFromDataMod.length > 0) {
    importsFromDataMod.sort();
    lines.push(`import {`);
    for (const c of importsFromDataMod) lines.push(`  ${c},`);
    lines.push(`} from '${dataModInfo.importPath}';`);
  }
  if (resolvedConstants.length > 0) {
    resolvedConstants.sort((a, b) => a.name.localeCompare(b.name));
    lines.push(`// Constants resolved from decomp #defines / enums / TS data modules :`);
    for (const { name, value } of resolvedConstants) {
      lines.push(`const ${name} = ${value};`);
    }
  }
  if (undefinedConstants.length > 0) {
    undefinedConstants.sort();
    lines.push(`// Unresolved constants (auto-stub at 0; replace with real values when needed) :`);
    lines.push(`const _UNDEFINED = 0;`);
    for (const c of undefinedConstants) {
      lines.push(`const ${c}: any = _UNDEFINED; // TODO : not found in decomp /include or auto/src — possibly dynamic`);
    }
  }
  lines.push(``);
  lines.push(`export type SpriteCallback = (sprite: DecompSprite, rt: DecompRuntime) => void;`);
  lines.push(`export type TaskCallback = (task: DecompTask, rt: DecompRuntime) => void;`);
  lines.push(`export type CB2Callback = (rt: DecompRuntime) => void;`);
  lines.push(``);
  // Helper safe-getters
  lines.push(`const _emptySprite: any = { data: new Array(16).fill(0), invisible: false, x: 0, y: 0, x2: 0, y2: 0, oamIndex: 0, spriteId: -1 };`);
  lines.push(`const _emptyTask: any = { data: new Array(16).fill(0), func: null, taskId: -1 };`);
  lines.push(`function _gs(rt: DecompRuntime, id: number): DecompSprite { return (rt.gSprites.get(id) as DecompSprite) ?? _emptySprite; }`);
  lines.push(`function _gt(rt: DecompRuntime, id: number): DecompTask { return (rt.gTasks.get(id) as DecompTask) ?? _emptyTask; }`);
  lines.push(`function _palView(buf: PaletteBuffer, base: number): ArrayLike<number> {`);
  lines.push(`  return new Proxy({ length: 512 }, { get(t, k) { if (k === 'length') return 512; const i = Number(k); return Number.isFinite(i) ? buf.get(base + i) : undefined; } }) as ArrayLike<number>;`);
  lines.push(`}`);
  lines.push(``);

  // ── Emit all transpiled bodies
  for (const r of transpiled.spriteCbs) {
    if (r.tsCode === null) {
      lines.push(`/** Source: ${sceneName}.c (failed: ${r.error}) */`);
      lines.push(`export const ${r.name}: SpriteCallback = (_sprite, _rt) => { /* TODO ${r.error.replace(/\*\//g, '*-/')} */ };`);
      lines.push(``);
      continue;
    }
    lines.push(`/** Source: ${sceneName}.c → ${r.name} */`);
    lines.push(`export const ${r.name}: SpriteCallback = (sprite, rt) => {`);
    lines.push(indentBody(r.tsCode, '  '));
    lines.push(`};`);
    lines.push(``);
  }
  for (const r of transpiled.tasks) {
    if (r.tsCode === null) {
      lines.push(`/** Source: ${sceneName}.c (failed: ${r.error}) */`);
      lines.push(`export const ${r.name}: TaskCallback = (_task, _rt) => { /* TODO ${r.error.replace(/\*\//g, '*-/')} */ };`);
      lines.push(``);
      continue;
    }
    lines.push(`/** Source: ${sceneName}.c → ${r.name} */`);
    lines.push(`export const ${r.name}: TaskCallback = (task, rt) => {`);
    lines.push(`  const taskId = task.taskId;`);
    lines.push(indentBody(r.tsCode, '  '));
    lines.push(`};`);
    lines.push(``);
  }
  for (const r of transpiled.cb2s) {
    if (r.tsCode === null) {
      lines.push(`/** Source: ${sceneName}.c (failed: ${r.error}) */`);
      lines.push(`export const ${r.name}: CB2Callback = (_rt) => { /* TODO ${r.error.replace(/\*\//g, '*-/')} */ };`);
      lines.push(``);
      continue;
    }
    lines.push(`/** Source: ${sceneName}.c → ${r.name} */`);
    lines.push(`export const ${r.name}: CB2Callback = (rt) => {`);
    lines.push(indentBody(r.tsCode, '  '));
    lines.push(`};`);
    lines.push(``);
  }
  for (const r of transpiled.helpers) {
    if (r.tsCode === null) {
      lines.push(`export function ${r.name}(_rt: DecompRuntime, ..._args: number[]): number { return -1; /* ${(r.error ?? 'empty').replace(/\*\//g, '*-/')} */ }`);
      lines.push(``);
      continue;
    }
    const params = r.info?.params ?? '';
    // Extract param name + TS type. Décomp params come in many forms :
    //   simple    : `bool8 hasVerticalMove`           → name: number
    //   pointer   : `const struct Foo *metadata`      → name: any
    //   array     : `u8 buffer[16]`                   → name: number (= array of bytes)
    //   func ptr  : `void (*callback)(u8)`            → callback: any
    // Strategy : extract the LAST identifier as name (= deepest dereference name);
    // type is `any` if param has *, [, struct, union, const ; else `number`.
    const usedNames = new Set();
    const tsParams = params
      .split(',')
      .map(p => p.trim())
      .filter(p => p && p !== 'void')
      .map((p, idx) => {
        // Last identifier before ) or end-of-string (handles `(*name)`, `name[N]`, etc).
        const nameMatch = p.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[\s*\w*\s*\])?\s*\)?\s*$/);
        let name = nameMatch ? nameMatch[1] : `arg${idx}`;
        // Disambiguate duplicates (= same name appears twice) : append index.
        let unique = name;
        let suffix = 0;
        while (usedNames.has(unique)) {
          suffix++;
          unique = `${name}${suffix}`;
        }
        usedNames.add(unique);
        // Type : pointer/struct/array → any ; primitive → number.
        const isComplex = /\*|\bstruct\b|\bunion\b|\benum\b|\[/.test(p);
        const tsType = isComplex ? 'any' : 'number';
        return `${unique}: ${tsType}`;
      })
      .join(', ');
    lines.push(`/** Source: ${sceneName}.c → ${r.name} (helper) */`);
    lines.push(`export function ${r.name}(rt: DecompRuntime${tsParams ? ', ' + tsParams : ''}): number {`);
    lines.push(`  let sprite: any = _emptySprite;`);
    lines.push(`  let task: any = _emptyTask;`);
    lines.push(indentBody(r.tsCode, '  '));
    lines.push(`  return -1;`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join('\n');
}

function indentBody(body, prefix) {
  return body.split('\n').map(l => l.length > 0 ? prefix + l : l).join('\n');
}

// ─── Step 6 : MovementAction bodies → event_object_movement-callbacks-auto.ts ─

/** Read `public/decomp/em/movement-action-bodies.json` (= 253 bool8 functions
 *  extracted from event_object_movement.c) + transpile each to TS using the
 *  existing `transpileBody` machinery.
 *
 *  Output : `src/engine/decomp-data/auto/src/event_object_movement-callbacks-auto.ts`
 *  with one exported async-style function per movement action step. */
async function transpileMovementActions(aliasesByFile, constResolver) {
  const bodiesPath = resolve(projectRoot, 'public', 'decomp', 'em', 'movement-action-bodies.json');
  if (!existsSync(bodiesPath)) {
    console.warn(`[transpile-callbacks] movement-action-bodies.json not found, skip Step 6`);
    return;
  }
  const json = JSON.parse(readFileSync(bodiesPath, 'utf8'));
  const bodies = Object.entries(json);
  console.log(`[transpile-callbacks] Step 6 : transpiling ${bodies.length} MovementAction bodies`);

  const aliases = aliasesByFile.get('event_object_movement') ?? new Map();

  const transpiled = [];  // { name, tsCode | null, error?, signature, callsTo }
  const referencedConstants = new Set();

  for (const [name, info] of bodies) {
    stats.movementAttempted++;
    if (!info.body || !info.body.trim()) {
      stats.movementFailed++;
      transpiled.push({ name, tsCode: null, error: 'empty body', signature: info.signature, callsTo: info.callsTo });
      continue;
    }
    try {
      const { tsCode, warnings: ws } = transpileBody(info.body, { aliases, kind: 'movement' });
      for (const w of ws) warn(`event_object_movement.c ${name} : ${w}`);
      for (const id of findAllCapsIdentifiers(tsCode)) referencedConstants.add(id);
      transpiled.push({ name, tsCode, signature: info.signature, callsTo: info.callsTo });
      stats.movementOk++;
    } catch (e) {
      warn(`event_object_movement.c ${name} : transpile threw ${e.message}`);
      transpiled.push({ name, tsCode: null, error: e.message, signature: info.signature, callsTo: info.callsTo });
      stats.movementFailed++;
    }
  }

  // Emit single output module.
  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/transpile-callbacks.mjs (Step 6)`);
  lines.push(`// Source : src/event_object_movement.c — bool8 MovementAction_*_StepN bodies`);
  lines.push(`// Generated : ${NOW}`);
  lines.push(`// DO NOT EDIT — re-run \`node scripts/transpile-callbacks.mjs\` to refresh.`);
  lines.push(`//`);
  lines.push(`// 253 functions extracted by extract-movement-action-bodies.mjs.`);
  lines.push(`// Each function transpiled mechanically. Manual fixes may be needed for`);
  lines.push(`// /* TODO */ markers + undefined helper references.`);
  lines.push(``);
  lines.push(`/* eslint-disable */`);
  lines.push(`// @ts-nocheck`);
  lines.push(``);
  lines.push(`import type { DecompRuntime, DecompSprite } from '../../../decomp-runtime';`);
  lines.push(`import type { ObjectEvent } from '../../../object-events';`);
  lines.push(``);
  lines.push(`// NB : la signature décomp est`);
  lines.push(`//   bool8 MovementAction_X_StepN(struct ObjectEvent *objectEvent, struct Sprite *sprite)`);
  lines.push(`// Notre adaptation : (npc: ObjectEvent, sprite: DecompSprite, rt: DecompRuntime): boolean`);
  lines.push(`// pour matcher le runtime existant. Les helpers comme FaceDirection, InitMovementNormal,`);
  lines.push(`// etc. doivent être disponibles ; ils sont importés à la demande dans le runtime.`);
  lines.push(``);
  lines.push(`// ─── Function exports ──────────────────────────────────────────────────────`);
  lines.push(``);

  const ok = transpiled.filter(t => t.tsCode);
  const failed = transpiled.filter(t => !t.tsCode);

  for (const t of ok) {
    lines.push(`/** ${t.signature} */`);
    lines.push(`export function ${t.name}(npc: ObjectEvent, sprite: DecompSprite, rt: DecompRuntime): boolean {`);
    // Indent body 2 spaces.
    const indented = (t.tsCode ?? '').split('\n').map(l => l ? '  ' + l : l).join('\n');
    lines.push(indented);
    lines.push(`  return false;  // fallback : unknown body return value`);
    lines.push(`}`);
    lines.push(``);
  }

  // Stub out failed ones avec un placeholder qui throws.
  if (failed.length > 0) {
    lines.push(`// ─── Failed transpiles (= ${failed.length} functions) ─────────────────────────`);
    lines.push(`// Ces functions n'ont pas pu être transpilées mécaniquement. À porter manuel.`);
    lines.push(``);
    for (const t of failed) {
      lines.push(`/** STUB : ${t.signature}`);
      lines.push(` *  Reason : ${t.error} */`);
      lines.push(`export function ${t.name}(npc: ObjectEvent, sprite: DecompSprite, rt: DecompRuntime): boolean {`);
      lines.push(`  console.warn('[movement-actions-auto] STUB ${t.name} : not yet ported (1:1 décomp TODO)');`);
      lines.push(`  return false;`);
      lines.push(`}`);
      lines.push(``);
    }
  }

  // Add gMovementActionFuncs[] dispatch table from movement-action-funcs.json.
  const funcsPath = resolve(projectRoot, 'public', 'decomp', 'em', 'movement-action-funcs.json');
  if (existsSync(funcsPath)) {
    const fjson = JSON.parse(readFileSync(funcsPath, 'utf8'));
    lines.push(`// ─── Per-action step function tables (= gMovementActionFuncs_X) ──────────`);
    lines.push(``);
    for (const [tableName, stepFns] of Object.entries(fjson.tables)) {
      lines.push(`export const gMovementActionFuncs_${tableName} = [`);
      for (const fn of stepFns) {
        lines.push(`  ${fn},`);
      }
      lines.push(`] as const;`);
      lines.push(``);
    }
    lines.push(`// ─── Master table : MOVEMENT_ACTION_X → per-action step functions ──────`);
    lines.push(``);
    lines.push(`export const gMovementActionFuncs: Record<string, ReadonlyArray<(npc: ObjectEvent, sprite: DecompSprite, rt: DecompRuntime) => boolean>> = {`);
    for (const [actionConst, tableName] of Object.entries(fjson.master)) {
      lines.push(`  ${actionConst}: gMovementActionFuncs_${tableName} as any,`);
    }
    lines.push(`};`);
    lines.push(``);
  }

  const outPath = resolve(outDir, `event_object_movement-callbacks-auto.ts`);
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  stats.filesGenerated++;
  console.log(`[transpile-callbacks] Step 6 done : ${ok.length} ok, ${failed.length} failed → ${outPath}`);

  // Note : referencedConstants is collected but not currently emitted as imports.
  // Phase suivante : same constant resolution pipeline que Step 4. Pour MVP,
  // on génère le fichier avec @ts-nocheck pour pas planter le typecheck sur
  // les helpers manquants.
  void referencedConstants;
  void constResolver;
}

// ─── Step 7 : Bulk category transpiler (specials, scrcmd, etc.) ───────────────

const BULK_CAT_CONFIG = {
  specials: {
    paramSig: '',  // void Special_X(void) — no params
    tsParams: 'rt: DecompRuntime',
    importTypes: ['DecompRuntime'],
    description: 'Specials (= callspecial opcode targets, scripts.inc)',
  },
  scrcmd: {
    paramSig: 'ctx: any',
    tsParams: 'ctx: any, rt: DecompRuntime',
    importTypes: ['DecompRuntime'],
    description: 'ScrCmd opcodes (= scrcmd.c bool8 ScrCmd_X)',
  },
  metatile: {
    paramSig: 'metatileBehavior: number',
    tsParams: 'metatileBehavior: number',
    importTypes: [],
    description: 'MetatileBehavior_Is* predicates (= metatile_behavior.c)',
  },
  movementtype: {
    paramSig: 'npc: any, sprite: any',
    tsParams: 'npc: any, sprite: any, rt: DecompRuntime',
    importTypes: ['DecompRuntime'],
    description: 'MovementType_X_Step* state machines (= event_object_movement.c)',
  },
  fieldeffect: {
    paramSig: '...args: any[]',
    tsParams: 'rt: DecompRuntime, ...args: any[]',
    importTypes: ['DecompRuntime'],
    description: 'FldEff_* field effect callbacks (= field_effect_helpers.c et al.)',
  },
};

async function transpileBulkCategory(catName, aliasesByFile, constResolver) {
  const inPath = resolve(projectRoot, 'public', 'decomp', 'em', 'extracted', `${catName}.json`);
  if (!existsSync(inPath)) {
    console.warn(`[transpile-callbacks] ${catName}.json not found, skip`);
    return;
  }
  const json = JSON.parse(readFileSync(inPath, 'utf8'));
  const fns = json.functions || {};
  const cfg = BULK_CAT_CONFIG[catName];
  console.log(`[transpile-callbacks] Step 7 ${catName} : transpiling ${Object.keys(fns).length} functions`);

  const transpiled = [];
  let okCount = 0, failCount = 0;
  for (const [name, info] of Object.entries(fns)) {
    if (!info.body || !info.body.trim()) {
      transpiled.push({ name, tsCode: null, error: 'empty body', signature: info.signature, srcFile: info.srcFile });
      failCount++;
      continue;
    }
    // Find matching .c file aliases
    const cFile = (info.srcFile || '').replace(/^src\//, '').replace(/\.c$/, '');
    const aliases = aliasesByFile.get(cFile) ?? new Map();
    try {
      const { tsCode, warnings: ws } = transpileBody(info.body, { aliases, kind: catName });
      for (const w of ws) warn(`${catName} ${name} : ${w}`);
      transpiled.push({ name, tsCode, signature: info.signature, srcFile: info.srcFile });
      okCount++;
    } catch (e) {
      warn(`${catName} ${name} : transpile threw ${e.message}`);
      transpiled.push({ name, tsCode: null, error: e.message, signature: info.signature, srcFile: info.srcFile });
      failCount++;
    }
  }

  // Emit single output module per category.
  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/transpile-callbacks.mjs (Step 7 — ${catName})`);
  lines.push(`// Source : ${cfg.description}`);
  lines.push(`// Generated : ${NOW}`);
  lines.push(`// DO NOT EDIT — re-run transpiler to refresh.`);
  lines.push(`//`);
  lines.push(`// ${Object.keys(fns).length} functions extracted by extract-decomp-functions.mjs.`);
  lines.push(`// ${okCount} ok, ${failCount} failed.`);
  lines.push(``);
  lines.push(`/* eslint-disable */`);
  lines.push(`// @ts-nocheck`);
  lines.push(``);
  if (cfg.importTypes.length > 0) {
    lines.push(`import type { ${cfg.importTypes.join(', ')} } from '../../../decomp-runtime';`);
    lines.push(``);
  }
  lines.push(`// ─── Function exports ──────────────────────────────────────────────────────`);
  lines.push(``);

  for (const t of transpiled) {
    if (t.tsCode) {
      lines.push(`/** ${t.signature}`);
      lines.push(` *  Source : ${t.srcFile} */`);
      lines.push(`export function ${t.name}(${cfg.tsParams}): any {`);
      const indented = (t.tsCode ?? '').split('\n').map(l => l ? '  ' + l : l).join('\n');
      lines.push(indented);
      lines.push(`}`);
      lines.push(``);
    } else {
      lines.push(`/** STUB ${t.signature}`);
      lines.push(` *  Reason : ${t.error} */`);
      lines.push(`export function ${t.name}(${cfg.tsParams}): any {`);
      lines.push(`  console.warn('[${catName}-auto] STUB ${t.name} : ${t.error.replace(/'/g, "\\'")}');`);
      lines.push(`  return undefined;`);
      lines.push(`}`);
      lines.push(``);
    }
  }

  const outPath = resolve(outDir, `${catName}-auto.ts`);
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  stats.filesGenerated++;
  console.log(`[transpile-callbacks] Step 7 ${catName} done : ${okCount} ok, ${failCount} failed → ${outPath}`);
  void constResolver;
}

// ─── Step 5 : Main orchestration ─────────────────────────────────────────────

async function main() {
  console.log(`[transpile-callbacks] start`);

  const aliasesByFile = parseAllFieldAliases();
  console.log(`[transpile-callbacks] parsed aliases for ${aliasesByFile.size} .c files`);

  const constResolver = buildConstantResolver();
  console.log(`[transpile-callbacks] constant resolver : ${constResolver.size} symbols`);

  const sprSys = await loadSpriteSystem();
  console.log(`[transpile-callbacks] sprite-system: ${Object.keys(sprSys.callbacks).length} cb, ${Object.keys(sprSys.helpers).length} helpers, ${Object.keys(sprSys.templates).length} templates`);

  // Build sceneName → { callbacks, helpers } from sprite-system sources map
  const sprSysByScene = new Map();
  for (const [key, srcPath] of Object.entries(sprSys.sources ?? {})) {
    const m = String(srcPath).match(/^src\/(.+)\.c$/);
    if (!m) continue;
    const sceneName = m[1];
    const [section, name] = key.split(':');
    if (!sprSysByScene.has(sceneName)) {
      sprSysByScene.set(sceneName, { callbacks: {}, helpers: {} });
    }
    const bucket = sprSysByScene.get(sceneName);
    if (section === 'spriteCallbacks' && sprSys.callbacks[name]) {
      bucket.callbacks[name] = sprSys.callbacks[name];
    } else if (section === 'helpers' && sprSys.helpers[name]) {
      bucket.helpers[name] = sprSys.helpers[name];
    }
  }
  console.log(`[transpile-callbacks] sprite-system scenes: ${sprSysByScene.size}`);

  const taskFiles = globSync(`${tasksDirPath.replace(/\\/g, '/')}/*-tasks.ts`);
  console.log(`[transpile-callbacks] task modules: ${taskFiles.length}`);

  const tasksByScene = new Map();
  for (const fpath of taskFiles) {
    const sceneName = basename(fpath, '-tasks.ts');
    try {
      const mod = await loadTaskModule(fpath);
      tasksByScene.set(sceneName, mod);
    } catch (e) {
      warn(`Failed to load ${fpath}: ${e.message}`);
    }
  }

  const allScenes = new Set([
    ...sprSysByScene.keys(),
    ...tasksByScene.keys(),
  ]);
  console.log(`[transpile-callbacks] total scenes : ${allScenes.size}`);

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const sceneName of allScenes) {
    const aliases = aliasesByFile.get(sceneName) ?? new Map();
    const sprSysData = sprSysByScene.get(sceneName) ?? { callbacks: {}, helpers: {} };
    const taskData = tasksByScene.get(sceneName) ?? { tasks: {}, cb2s: {}, spriteCbs: {} };

    const entries = {
      callbacks: sprSysData.callbacks,
      helpers: sprSysData.helpers,
      tasks: taskData.tasks,
      cb2s: taskData.cb2s,
      spriteCbs: taskData.spriteCbs,
    };

    const total = Object.keys(entries.callbacks).length
                + Object.keys(entries.helpers).length
                + Object.keys(entries.tasks).length
                + Object.keys(entries.cb2s).length
                + Object.keys(entries.spriteCbs).length;
    if (total === 0) continue;

    const tsCode = generateModule(sceneName, entries, aliases, constResolver);
    const outPath = resolve(outDir, `${sceneName}-callbacks-auto.ts`);
    writeFileSync(outPath, tsCode, 'utf8');
    stats.filesGenerated++;
  }

  // ─── Step 6 : MovementAction bodies (= bool8 functions in event_object_movement.c) ──
  // Étend le transpiler aux 253 step + helper functions extraites par
  // `extract-movement-action-bodies.mjs`. Sortie : un fichier auto unique
  // pour event_object_movement.
  await transpileMovementActions(aliasesByFile, constResolver);

  // ─── Step 7 : Bulk transpile categories from extract-decomp-functions ───
  // Specials, ScrCmd opcodes, MetatileBehavior predicates, MovementType, FldEff.
  // Each écrit dans un fichier auto séparé pour faciliter import sélectif.
  for (const cat of ['specials', 'scrcmd', 'metatile', 'movementtype', 'fieldeffect']) {
    await transpileBulkCategory(cat, aliasesByFile, constResolver);
  }

  // ─── Final report ──────────────────────────────────────────────────────────
  console.log(``);
  console.log(`[transpile-callbacks] done`);
  console.log(`  Files generated         : ${stats.filesGenerated}`);
  console.log(`  SpriteCB attempted/ok   : ${stats.spriteCbAttempted}/${stats.spriteCbOk} (${stats.spriteCbFailed} failed)`);
  console.log(`  Task    attempted/ok    : ${stats.taskAttempted}/${stats.taskOk} (${stats.taskFailed} failed)`);
  console.log(`  CB2     attempted/ok    : ${stats.cb2Attempted}/${stats.cb2Ok} (${stats.cb2Failed} failed)`);
  console.log(`  Helpers attempted/ok    : ${stats.helperAttempted}/${stats.helperOk}`);
  console.log(`  Movement attempted/ok   : ${stats.movementAttempted}/${stats.movementOk} (${stats.movementFailed} failed)`);
  console.log(`  Warnings (residual ->)  : ${stats.warnings.length}`);
  if (stats.warnings.length > 0 && stats.warnings.length <= 30) {
    console.log(`  Warnings :`);
    for (const w of stats.warnings) console.log(`    - ${w}`);
  }

  const logPath = resolve(outDir, '_transpile-stats.json');
  writeFileSync(logPath, JSON.stringify({
    generatedAt: NOW,
    ...stats,
    warnings: stats.warnings.slice(0, 200),
  }, null, 2), 'utf8');
}

main().catch((e) => {
  console.error('[transpile-callbacks] FAILED:', e);
  process.exit(1);
});

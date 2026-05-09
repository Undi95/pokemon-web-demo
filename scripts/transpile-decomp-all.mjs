#!/usr/bin/env node
/**
 * transpile-decomp-all.mjs
 * ------------------------
 * Pour chaque `<scene>.json` dans `public/decomp/em/extracted-all/`, transpile
 * TOUS les bodies extraits vers TS via `transpileBody`.
 *
 * Output : `src/engine/decomp-data/auto/src-all/<scene>-all-auto.ts`
 *
 * Chaque fichier généré :
 *   - `@ts-nocheck` (= pas de typecheck, beaucoup d'identifiers non-résolus)
 *   - 1 export par fonction transpilée
 *   - Nommage : `<FunctionName>` directement, comme en C
 *   - Fallback `STUB` si transpile échoue
 *
 * Goal : output is SYNTACTICALLY VALID TS (= can be parsed by tsc, even if
 * many semantic errors via @ts-nocheck). Runtime correctness NOT required.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const inDir = resolve(projectRoot, 'public', 'decomp', 'em', 'extracted-all');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src-all');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
mkdirSync(outDir, { recursive: true });

// ─── Object-like macro extraction & substitution ─────────────────────────────
//
// Some decomp files define `#define NAME(arg) body` macros that expand to an
// lvalue expression (= can be assigned). Examples in `overworld.c` :
//   #define linkGender(obj)    obj->singleMovementActive
//   #define linkDirection(obj) ((u8 *)obj)[offsetof(typeof(*obj), range)]
//
// The transpiler must expand these in function bodies BEFORE running the C-
// to-TS rewrites — otherwise we get invalid TS like `linkGender(x) = y` (=
// can't assign to a function call).
//
// We extract per-source-file macros (different files may define the same name
// differently), and substitute calls with body-text where the formal arg is
// replaced by the actual call argument.

/** Extract simple 1-arg object-like macros from a source file.
 *  Returns Map<name, { arg, body }> for `#define NAME(ARG) BODY`. */
function extractMacros(srcText) {
  const macros = new Map();
  const re = /^[ \t]*#[ \t]*define[ \t]+(\w+)\(([^)]*)\)[ \t]*(.+?)[ \t]*$/gm;
  let m;
  while ((m = re.exec(srcText)) !== null) {
    const name = m[1];
    const arg = m[2].trim();
    let body = m[3]
      .replace(/\/\/.*$/, '')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
    if (!arg || arg === 'void') continue;
    if (arg.includes(',')) continue; // multi-arg, skip
    if (!body) continue;
    if (TS_RESERVED.has(name)) continue;
    if (!/^[A-Za-z_]\w*$/.test(arg)) continue;
    // Skip if macro looks like a function-call wrapper (= same body as a
    // common helper) to avoid infinite recursion if name == body.
    if (body === name || body.startsWith(`${name}(`)) continue;
    macros.set(name, { arg, body });
  }
  return macros;
}

/** Substitute `MACRO(<expr>)` calls with body-text where <arg> ↦ (<expr>). */
function substituteMacros(text, macros) {
  if (!macros.size) return text;
  for (const [name, { arg, body }] of macros) {
    const callRe = new RegExp(`\\b${name}\\s*\\(`, 'g');
    let out = '';
    let i = 0;
    while (i < text.length) {
      callRe.lastIndex = i;
      const m = callRe.exec(text);
      if (!m) {
        out += text.slice(i);
        break;
      }
      out += text.slice(i, m.index);
      // Find matching close paren.
      let depth = 1;
      let j = m.index + m[0].length;
      while (j < text.length && depth > 0) {
        if (text[j] === '(') depth++;
        else if (text[j] === ')') depth--;
        if (depth > 0) j++;
      }
      if (depth !== 0) {
        // Unbalanced — keep original.
        out += text.slice(m.index);
        break;
      }
      const argValue = text.slice(m.index + m[0].length, j).trim();
      // Substitute formal arg with `(actual)` so e.g. `obj->x` becomes
      // `(passed)->x` and not `passed->x` (precedence safe).
      const argRe = new RegExp(`\\b${arg}\\b`, 'g');
      const expanded = body.replace(argRe, `(${argValue})`);
      out += expanded;
      i = j + 1;
    }
    text = out;
  }
  return text;
}

// ─── Reserved-word renaming ──────────────────────────────────────────────────
//
// C identifiers that are TS reserved words. We rename them in-scope.
const TS_RESERVED = new Set([
  'var', 'let', 'const', 'function', 'class', 'interface', 'type', 'enum',
  'export', 'import', 'default', 'extends', 'implements', 'public', 'private',
  'protected', 'static', 'abstract', 'async', 'await', 'yield', 'new', 'delete',
  'in', 'of', 'instanceof', 'typeof', 'void', 'null', 'undefined', 'true',
  'false', 'this', 'super', 'arguments',
]);

const C_BASE_TYPES = '(?:u8|u16|u32|u64|s8|s16|s32|s64|int|long|short|char|signed|bool|bool8|bool16|bool32|f32|f64|float|double|size_t|ssize_t|ptrdiff_t|vu8|vu16|vu32|vs8|vs16|vs32|unsigned|register)';

function renameIfReserved(name) {
  return TS_RESERVED.has(name) ? `_${name}` : name;
}

// ─── Tokenized rewrites ──────────────────────────────────────────────────────
//
// Most rewrites are single-pass regex. The order matters !

function transpileBody(bodyC, paramNames = [], macros = null) {
  if (!bodyC) return { tsCode: '', warnings: [] };
  let s = bodyC;

  // ─── Pre-pass A : Object-like macro substitution ─────────────────────────
  // Expand simple `#define NAME(arg) body` macros so e.g. `linkGender(o) = x`
  // becomes `o.singleMovementActive = x`. Iterate up to 3 times in case macros
  // expand to other macros.
  if (macros && macros.size) {
    for (let pass = 0; pass < 3; pass++) {
      const before = s;
      s = substituteMacros(s, macros);
      if (s === before) break;
    }
  }

  // ─── Pre-pass : strip preprocessor and attribute macros ─────────────────
  // Handle `#if ... #else ... #endif` : keep only the first branch.
  // (= dropping #else through #endif as a comment).
  // Iterate until stable.
  for (let pass = 0; pass < 5; pass++) {
    const before = s;
    s = s.replace(/^\s*#\s*else[^\n]*\n([\s\S]*?)^\s*#\s*endif[^\n]*\n?/gm, '');
    if (s === before) break;
  }
  // Strip remaining preprocessor directives (= leading #).
  s = s.replace(/^\s*#\s*[a-z]+[^\n]*\n?/gm, '');
  s = s.replace(/\bUNUSED\b/g, '');
  s = s.replace(/\bNORETURN\b/g, '');
  s = s.replace(/\bIWRAM_DATA\b/g, '');
  s = s.replace(/\bEWRAM_DATA\b/g, '');
  // GBA / decomp-specific attribute macros with arguments.
  s = s.replace(/\bALIGNED\s*\(\s*\d+\s*\)/g, '');
  s = s.replace(/\bIWRAM_INIT\b/g, '');
  s = s.replace(/\bEWRAM_INIT\b/g, '');
  s = s.replace(/\bBSS_DATA\b/g, '');
  s = s.replace(/\bRODATA_DATA\b/g, '');
  s = s.replace(/\bASM_DIRECT\b/g, '');
  s = s.replace(/\bSECTION\s*\(\s*"[^"]*"\s*\)/g, '');
  s = s.replace(/\bATTRIBUTE_ALIGN\s*\(\s*\d+\s*\)/g, '');
  s = s.replace(/\b__attribute__\s*\(\([^)]*\)\)/g, '');
  s = s.replace(/\b__packed\b/g, '');
  s = s.replace(/\bvolatile\b/g, '');
  s = s.replace(/\brestrict\b/g, '');
  s = s.replace(/\b__restrict\b/g, '');

  // ─── Rename reserved word usages of param names ──────────────────────────
  // If a paramName is a reserved word (e.g. `var`), rewrite all uses inside body.
  for (const pn of paramNames) {
    if (TS_RESERVED.has(pn)) {
      const safe = `_${pn}`;
      s = s.replace(new RegExp(`\\b${pn}\\b`, 'g'), safe);
    }
  }

  // ─── Step 1 : function-pointer DECLs ────────────────────────────────────
  // `bool8 (*addr)(void) = expr;` → `let addr: any = expr;`
  // `void (*func)(int) = expr;`   → `let func: any = expr;`
  // `void (**ptr)(void);`         → `let ptr: any = null;`
  // `bool8 (*addr)(void);`        → `let addr: any = null;`
  s = s.replace(
    /^(\s*)(?:static\s+|const\s+)?[\w\s\*]+?\(\s*\*+\s*([A-Za-z_]\w*)\s*\)\s*\([^)]*\)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+|const\s+)?[\w\s\*]+?\(\s*\*+\s*([A-Za-z_]\w*)\s*\)\s*\([^)]*\)\s*;/gm,
    '$1let $2: any = null;'
  );
  // Pointer-to-array decls : `const u8 (*ptr)[4];` → `let ptr: any = null;`
  s = s.replace(
    /^(\s*)(?:static\s+|const\s+)?[\w\s\*]+?\(\s*\*+\s*([A-Za-z_]\w*)\s*\)(?:\s*\[[^\]]*\])+\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+|const\s+)?[\w\s\*]+?\(\s*\*+\s*([A-Za-z_]\w*)\s*\)(?:\s*\[[^\]]*\])+\s*;/gm,
    '$1let $2: any = null;'
  );

  // ─── Step 2 : variable declarations (struct types & base types) ─────────
  // Multi-line typedef'd struct decls : `struct X *Y = init;` → `let Y: any = init;`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s*\*+\s*([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s*\*+\s*([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );
  // Multi-var struct decls : `struct X a, b, c;`, `struct X *a, *b;`, `struct X a, b[N];` → `let a, b, c;`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+\*?\s*([A-Za-z_]\w*(?:\s*\[[^\]]*\])?(?:\s*,\s*\*?[A-Za-z_]\w*(?:\s*\[[^\]]*\])?)+)\s*;/gm,
    (full, ws, vars) => {
      // Strip `[N]` array brackets and pointers.
      const cleaned = vars.replace(/\[[^\]]*\]/g, '').replace(/\*/g, '');
      return `${ws}let ${cleaned};`;
    }
  );
  // `union X *Y = ...;`, `union X Y = ...;`, `union X Y;`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*\s*\*+\s*([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*\s*\*+\s*([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );
  // Union array decls : `static const union X arr[] = ...;`, `union X arr[N];`,
  // `static const union X *const arr[]` (= ptr-to-const-X array).
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*\*+)?(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*=/gm,
    '$1const $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?union\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*\*+)?(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*;/gm,
    '$1const $2: any[] = [];'
  );
  // `enum X Y;` and `enum X Y = ...;`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?enum\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?enum\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );
  // Struct array decls : `struct X arr[N];` → `let arr: any[] = [];`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*\[[^\]]*\]\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*\[[^\]]*\]\s*;/gm,
    '$1let $2: any[] = [];'
  );

  // `void *X = ...` and `void *X;`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?void\s*\*+\s*([A-Za-z_]\w*)\s*=/gm,
    '$1let $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?void\s*\*+\s*([A-Za-z_]\w*)\s*;/gm,
    '$1let $2: any = null;'
  );

  // Base types : `u8 X = init;` → `let X = init;`
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+\\*+\\s*([A-Za-z_]\\w*)\\s*=`, 'gm'),
    '$1let $2: any ='
  );
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+\\*+\\s*([A-Za-z_]\\w*)\\s*;`, 'gm'),
    '$1let $2: any = null;'
  );
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+([A-Za-z_]\\w*)\\s*=`, 'gm'),
    '$1let $2: any ='
  );
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+([A-Za-z_]\\w*)\\s*;`, 'gm'),
    '$1let $2: any = null;'
  );
  // Array decls : `u8 X[N] = ...;` and `u8 X[N];` — also multi-dim `[N][M]`.
  // Also handle `u8 *X[N]` (array of pointers) and `u8 *const X[N]` (const ptr).
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}(?:\\s*\\*+)?(?:\\s*const)?\\s+([A-Za-z_]\\w*)(?:\\s*\\[[^\\]]*\\])+\\s*=`, 'gm'),
    '$1const $2: any ='
  );
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}(?:\\s*\\*+)?(?:\\s*const)?\\s+([A-Za-z_]\\w*)(?:\\s*\\[[^\\]]*\\])+\\s*;`, 'gm'),
    '$1const $2: any[] = [];'
  );
  // `void *X[N]` and `void *const X[N]`.
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?void\s*\*+(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*=/gm,
    '$1const $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?void\s*\*+(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*;/gm,
    '$1const $2: any[] = [];'
  );
  // `struct X *Y[N]` and `struct X *const Y[N]`.
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_]\w*(?:\s*\*+)?(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*=/gm,
    '$1const $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?struct\s+[A-Za-z_]\w*(?:\s*\*+)?(?:\s*const)?\s+([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*;/gm,
    '$1const $2: any[] = [];'
  );
  // Multi-var single line : `u8 a, b, c;` → `let a, b, c;`
  // Also `s32 i, j, id = 0;` (= mixed init/no-init).
  // Also `u32 scores[N], temp;` (= mixed array/simple).
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+(\\*?[A-Za-z_]\\w*(?:\\s*\\[[^\\]]*\\])?(?:\\s*=\\s*[^,;]+)?(?:\\s*,\\s*\\*?[A-Za-z_]\\w*(?:\\s*\\[[^\\]]*\\])?(?:\\s*=\\s*[^,;]+)?)+)\\s*;`, 'gm'),
    (full, ws, vars) => {
      // Strip `[N]` from each var since TS `let` doesn't have C array syntax.
      const cleaned = vars.replace(/\[[^\]]*\]/g, '');
      return `${ws}let ${cleaned};`;
    }
  );
  // Multi-var with init : `int a = 1, b = 2;`
  s = s.replace(
    new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${C_BASE_TYPES}\\s+([A-Za-z_]\\w*\\s*=[^;]+)\\s*;`, 'gm'),
    '$1let $2;'
  );

  // For-loop init `for (int i = 0; ...; ...)` → `for (let i: any = 0; ...; ...)`
  s = s.replace(
    new RegExp(`for\\s*\\(\\s*${C_BASE_TYPES}\\s+([A-Za-z_]\\w*)\\s*=`, 'g'),
    'for (let $1: any ='
  );
  s = s.replace(
    /for\s*\(\s*struct\s+[A-Za-z_]\w*\s*\*?\s*([A-Za-z_]\w*)\s*=/g,
    'for (let $1: any ='
  );

  // ─── Step 3 : Capitalized custom-type DECLs (e.g. `NativeFunc x = ...`) ──
  // Heuristic : at line start, `Identifier (*?) name = ` where Identifier is
  // a single Capitalized word and not a known statement keyword.
  // Skip common statement keywords AND ALL CAPS macros (likely constant calls).
  const STMT_KEYWORDS = new Set([
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
    'break', 'continue', 'return', 'goto', 'sizeof', 'typedef',
    'struct', 'union', 'enum', 'static', 'inline', 'extern', 'const',
    'volatile', 'register', 'unsigned', 'signed', 'auto', 'void',
    'true', 'false', 'TRUE', 'FALSE', 'NULL',
  ]);
  s = s.replace(
    /^(\s*)([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)\s*=([^;]*);/gm,
    (full, ws, type, name, init) => {
      if (STMT_KEYWORDS.has(type)) return full;
      // Skip if name is reserved - we'll handle it separately
      const nm = renameIfReserved(name);
      return `${ws}let ${nm}: any =${init};`;
    }
  );
  s = s.replace(
    /^(\s*)([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)\s*;/gm,
    (full, ws, type, name) => {
      if (STMT_KEYWORDS.has(type)) return full;
      const nm = renameIfReserved(name);
      return `${ws}let ${nm}: any = null;`;
    }
  );
  // `static const MyType name[] = {...};` → `const name: any = ...`
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*=/gm,
    (full, ws, type, name) => {
      if (STMT_KEYWORDS.has(type)) return full;
      return `${ws}const ${renameIfReserved(name)}: any =`;
    }
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*;/gm,
    (full, ws, type, name) => {
      if (STMT_KEYWORDS.has(type)) return full;
      return `${ws}const ${renameIfReserved(name)}: any[] = [];`;
    }
  );
  // `static MyType name = ...;` and `static MyType name;` (with static prefix).
  s = s.replace(
    /^(\s*)(?:static\s+)(?:const\s+)?([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)\s*=/gm,
    (full, ws, type, name) => {
      if (STMT_KEYWORDS.has(type)) return full;
      return `${ws}let ${renameIfReserved(name)}: any =`;
    }
  );
  s = s.replace(
    /^(\s*)(?:static\s+)(?:const\s+)?([A-Z][A-Za-z_][A-Za-z0-9_]*)\s+\*?\s*([A-Za-z_]\w*)\s*;/gm,
    (full, ws, type, name) => {
      if (STMT_KEYWORDS.has(type)) return full;
      return `${ws}let ${renameIfReserved(name)}: any = null;`;
    }
  );
  // Function-pointer array decl : `static bool8 (const arr[])(u8) = ...;`,
  // `static bool8 (*arr[])(u8) = ...;`, `static bool8 (*const arr[])(u8) = ...;`.
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?[\w\s\*]+\(\s*[\*\s]*(?:const\s+)?[\*\s]*([A-Za-z_]\w*)\s*\[[^\]]*\]\s*\)\s*\([^)]*\)\s*=/gm,
    '$1const $2: any ='
  );
  s = s.replace(
    /^(\s*)(?:static\s+)?(?:const\s+)?[\w\s\*]+\(\s*[\*\s]*(?:const\s+)?[\*\s]*([A-Za-z_]\w*)\s*\[[^\]]*\]\s*\)\s*\([^)]*\)\s*;/gm,
    '$1const $2: any[] = [];'
  );

  // ─── Step 4 : `let var =` (from prior rewrite) → `let _var =` ────────────
  // This handles cases where step 2-3 produced `let var = ...` because the
  // C source had `int var = ...`.
  // Pattern: word boundary 'let' or 'const', followed by a TS reserved word.
  for (const kw of TS_RESERVED) {
    if (kw === 'var' || kw === 'function' || kw === 'class' || kw === 'new' || kw === 'delete' || kw === 'in') {
      s = s.replace(
        new RegExp(`\\b(let|const)\\s+${kw}\\b`, 'g'),
        `$1 _${kw}`
      );
      // And replace usages of `var` etc. *that look like identifiers* in body.
      // We only rewrite bare-word usages that are NOT preceded by a dot.
      s = s.replace(
        new RegExp(`(^|[^.\\w])${kw}\\b(?!\\s*[\\(\\.])`, 'g'),
        (m, pre) => pre + `_${kw}`
      );
    }
  }

  // ─── Step 5 : Pointer arrow ─────────────────────────────────────────────
  s = s.replace(/->/g, '.');

  // ─── Step 6 : `*(TYPE *)expr = rhs` and `*(TYPE *)expr` ─────────────────
  // Examples :
  //   *(u16 *)&spriteTemplate.paletteTag = TAG_NONE
  //     → spriteTemplate.paletteTag = TAG_NONE
  //   *(u8 *)(localId) = objectEvent.localId
  //     → localId = objectEvent.localId
  //   *(u32 *)(EWRAM_START + 0xAC) = X
  //     → MEM_WRITE(EWRAM_START + 0xAC, X)  (= preserves syntax validity)
  //
  // Order matters : handle the ASSIGNMENT case first (special) before the
  // generic strip.
  const TYPE_RE_INNER = `(?:const\\s+)?(?:struct\\s+\\w+|${C_BASE_TYPES}|[A-Z][A-Za-z0-9_]*)\\s*\\*+`;

  // (1) `*(TYPE *)(expr) = rhs;` → `MEM_WRITE(expr, rhs);`
  // We use MEM_WRITE as a stub call (= identifier so TS parses).
  // Be careful : `==` must not match. Use negative lookahead `(?!=)`.
  s = s.replace(
    new RegExp(`\\*\\s*\\(\\s*${TYPE_RE_INNER}\\s*\\)\\s*\\(([^()]*)\\)\\s*=(?!=)\\s*([^;]+);`, 'g'),
    'MEM_WRITE($1, $2);'
  );
  // (2) `*(TYPE *)& expr` → `expr` (drop deref+addr-of together).
  s = s.replace(
    new RegExp(`\\*\\s*\\(\\s*${TYPE_RE_INNER}\\s*\\)\\s*&\\s*`, 'g'),
    ''
  );
  // (3) `*(TYPE *)(expr)` → `(expr)` (drop cast, keep parens).
  s = s.replace(
    new RegExp(`\\*\\s*\\(\\s*${TYPE_RE_INNER}\\s*\\)\\s*\\(([^()]*)\\)`, 'g'),
    '($1)'
  );
  // (4) `*(TYPE *)expr` → `expr` (drop cast).
  s = s.replace(
    new RegExp(`\\*\\s*\\(\\s*${TYPE_RE_INNER}\\s*\\)\\s*`, 'g'),
    ''
  );

  // (5) `*(arbitrary expr)` (deref of expression) — convert to `(expr)` so
  // it parses (= drop the deref, keep the parens). Lossy but parseable.
  // Use balanced-paren matcher.
  s = (function transformDerefRead(text) {
    let out = '';
    let i = 0;
    while (i < text.length) {
      // Match `*( ... )` BUT only when this `*` is unary (= preceded by
      // operator/punct, not by an identifier/number/`)` which would make it
      // multiplication).
      if (text[i] === '*' && /[\s(]/.test(text[i + 1] || '')) {
        // Walk back through whitespace.
        let pk = i - 1;
        while (pk >= 0 && /[ \t]/.test(text[pk])) pk--;
        const prev = pk >= 0 ? text[pk] : '\n';
        if (/[0-9)\]]/.test(prev)) {
          // Multiplication. Skip.
          out += text[i++];
          continue;
        }
        // If preceded by identifier, check if the identifier is a keyword.
        if (/[a-zA-Z_]/.test(prev)) {
          // Get the identifier token.
          let idEnd = pk + 1;
          let idStart = pk;
          while (idStart > 0 && /[A-Za-z0-9_]/.test(text[idStart - 1])) idStart--;
          const ident = text.slice(idStart, idEnd);
          // Statement-keyword prefixes are unary; bare identifiers are mul.
          const KEYWORDS = ['return', 'case', 'sizeof', 'typeof', 'delete', 'new', 'throw', 'await', 'yield', 'in', 'of', 'instanceof', 'else', 'do', 'goto'];
          if (!KEYWORDS.includes(ident)) {
            // Bare identifier → multiplication. Skip.
            out += text[i++];
            continue;
          }
        }
        // Check that we have `*(` (skipping whitespace).
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (text[j] === '(') {
          // Find matching paren.
          let depth = 1;
          let k = j + 1;
          while (k < text.length && depth > 0) {
            if (text[k] === '(') depth++;
            else if (text[k] === ')') depth--;
            if (depth > 0) k++;
          }
          if (depth === 0) {
            const inner = text.slice(j + 1, k);
            // Look ahead : if followed by `++` / `--` / `=` then we have a
            // post-inc/dec or assignment LHS pattern that is HANDLED by other
            // rules (step 10). Skip to let those rules deal with it.
            let m = k + 1;
            while (m < text.length && /[ \t]/.test(text[m])) m++;
            if (
              text[m] === '+' && text[m + 1] === '+' ||
              text[m] === '-' && text[m + 1] === '-' ||
              (text[m] === '=' && text[m + 1] !== '=')
            ) {
              // Don't transform here — let step 10 / MEM_WRITE handle it.
              out += text[i++];
              continue;
            }
            // Simply replace `*(inner)` with `(inner)`.
            out += `(${inner})`;
            i = k + 1;
            continue;
          }
        }
      }
      out += text[i++];
    }
    return out;
  })(s);

  // ─── Step 7 : (TYPE *) and (TYPE) C casts ─────────────────────────────
  // `(struct X *)expr` → `expr` (drop pointer cast — semantics preserved)
  // `(const u8 *)expr` → `expr`
  // `(NativeFunc)expr` → `expr` (we accept loss of type info)
  // We must avoid eating function-pointer DECLS like `(void)` or
  // existing parens. So we only drop casts that come BEFORE an
  // identifier or `(` or `&`.
  s = s.replace(
    /\(\s*(?:const\s+)?struct\s+\w+\s*\*+\s*\)\s*/g,
    ''
  );
  s = s.replace(
    new RegExp(`\\(\\s*(?:const\\s+)?${C_BASE_TYPES}\\s*\\*+\\s*\\)\\s*`, 'g'),
    ''
  );
  s = s.replace(
    new RegExp(`\\(\\s*(?:const\\s+)?${C_BASE_TYPES}\\s*\\)\\s*(?=[A-Za-z_(\\-+~!])`, 'g'),
    ''
  );
  // `(void *)X` → `X`
  s = s.replace(/\(\s*(?:const\s+)?void\s*\*+\s*\)\s*/g, '');
  // `(void)X` → `X`  (void cast, common in C for "discard return")
  s = s.replace(/\(\s*void\s*\)\s*(?=[A-Za-z_(])/g, '');

  // `(snake_case_t)expr` casts (e.g. `(uintptr_t)X`) → strip.
  s = s.replace(/\(\s*(?:const\s+)?[a-z][a-z0-9_]*_t\s*\*?\s*\)\s*(?=[A-Za-z_(])/g, '');

  // Generic typedef pointer cast `(IDENT *)expr` → strip (any case).
  // Safe because the `*` makes this unambiguous (= not a function call).
  s = s.replace(/\(\s*(?:const\s+)?[A-Za-z_]\w*\s*\*+\s*\)\s*(?=[A-Za-z_(&])/g, '');
  // `(union X *)expr`, `(union X **)expr` → strip.
  s = s.replace(/\(\s*(?:const\s+)?union\s+[A-Za-z_]\w*\s*\*+\s*\)\s*/g, '');
  s = s.replace(/\(\s*(?:const\s+)?enum\s+[A-Za-z_]\w*\s*\*?\s*\)\s*(?=[A-Za-z_(&])/g, '');

  // Capitalized custom-type cast: `(MyType)expr` → `expr` (drop)
  // Pattern : `(` + Capitalized identifier + optional `*` + `)` + identifier|paren
  // But we MUST NOT drop function calls like `MyType(args)` or matrix literals.
  // Heuristic : the token after the `)` must be alphanumeric or `(` or `&` or
  // `*`. Also we avoid stmts like `if (cond)`.
  s = s.replace(
    /\(\s*([A-Z][A-Za-z0-9_]*)\s*\*+\s*\)\s*/g,
    (m, type) => {
      if (STMT_KEYWORDS.has(type)) return m;
      return '';
    }
  );
  s = s.replace(
    /\(\s*([A-Z][A-Za-z0-9_]*)\s*\)\s*(?=[A-Za-z_(])/g,
    (m, type, offset, full) => {
      // Don't drop `if (X)`, `while (X)`, etc. The `if` keyword would be
      // lowercase, so a Capitalized type is unlikely. But e.g. macros like
      // `MIN(a, b)` must stay. The previous char must be a `=`, `,`, `(`,
      // `;`, or whitespace, NOT a letter/digit/underscore.
      if (STMT_KEYWORDS.has(type)) return m;
      const before = full.slice(Math.max(0, offset - 2), offset);
      if (/[A-Za-z0-9_]/.test(before.charAt(before.length - 1) || '')) return m;
      return '';
    }
  );

  // ─── Step 8 : C compound literals ───────────────────────────────────────
  // `(struct X){.field = expr}` → `{ field: expr } as any`
  // `(struct X){}` → `{} as any`
  // `(struct X){val1, val2}` → `[val1, val2] as any` — close enough
  // We do this by matching `(struct Name){...}` non-greedy.
  // The contents may have nested braces; but compound literals usually don't
  // contain block braces in real code. So a non-greedy {} match is OK.
  s = s.replace(
    /\(\s*struct\s+\w+\s*\)\s*\{\s*\}/g,
    '({} as any)'
  );
  s = s.replace(
    /\(\s*struct\s+\w+\s*\)\s*\{([^{}]*)\}/g,
    (m, body) => {
      // Test if body contains `.field =` style.
      if (/\.\w+\s*=/.test(body)) {
        // Convert .field = expr → field: expr
        const fields = body
          .split(',')
          .map(f => f.trim())
          .filter(Boolean)
          .map(f => f.replace(/^\.(\w+)\s*=\s*/, '$1: '))
          .join(', ');
        return `({${fields}} as any)`;
      }
      // Otherwise treat as array.
      return `([${body}] as any)`;
    }
  );

  // ─── Step 9 : Address-of `&X` → `X` ──────────────────────────────────────
  // Only drop `&` in an UNARY position. To distinguish from binary `a & b`,
  // we look for `&` that is :
  //   - after `(`, `,`, `=`, `;`, `[`, `?`, `:`, `!`, `||`, `&&`, `return`
  //     directly (= no other operators in between)
  //   - OR at start of line/statement
  // The stricter pattern : punctuation directly followed by `&ident` (no space
  // or only whitespace, but the immediate non-space prev char is a starter).
  // We use a positive lookbehind on a SINGLE clear-starter char.
  s = s.replace(/([\(\[\,\=\;\?\:])\s*&\s*([A-Za-z_(])/g, '$1$2');
  // After `return` keyword.
  s = s.replace(/\breturn\s+&\s*([A-Za-z_(])/g, 'return $1');
  // After `!` (logical not), `||`, `&&` — unary `&` rare here but possible.
  s = s.replace(/(\!|\|\||\&\&)\s*&\s*([A-Za-z_(])/g, '$1 $2');
  // At start of line.
  s = s.replace(/^(\s*)&\s*([A-Za-z_(])/gm, '$1$2');

  // ─── Step 9b : `switch (X) { ... }` already valid. But `switch X` (= without
  // parens after deref strip) needs parens. We add them.
  // We also add for `if X`, `while X`, etc. — safer to leave alone unless triggered.
  // Actually the C source always has parens : `switch (*x)` → after `*` strip
  // becomes `switch (x)` (the parens stay). The only issue was when deref of
  // dot-access made paren-stripping aggressive. We don't strip outer parens.

  // ─── Step 10 : Pointer DEREFs ───────────────────────────────────────────
  // `*ptr = expr;`   → `ptr = expr;`
  // `*(ptr)`         → `(ptr)` → `ptr`
  // `(*ptr)++`       → `ptr++`
  // `(*ptr)[idx]`    → `ptr[idx]`
  // `(*ptr)(args)`   → `ptr(args)`
  // `(*ptr).field`   → `ptr.field` (already handled by `->` step)
  // `*ptr` in expr   → `ptr` (= drop the *)
  //
  // We process from MOST specific to LEAST specific.

  // `*X++ = rhs` → `X = rhs;` (LHS=deref+postinc; we drop both, lossy).
  // Must run BEFORE the generic `*X++` → `X++` rule otherwise we get `X++ = rhs`.
  s = s.replace(/\*\s*([A-Za-z_]\w*(?:\.\w+)*)(\+\+|--)\s*=(?!=)/g, '$1 = ');
  // `++*X`, `--*X` (pre-inc/dec on deref) → `++X`, `--X`.
  s = s.replace(/(\+\+|--)\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)/g, '$1$2');
  // `*++X`, `*--X` (pre-inc then deref) → `++X`, `--X` (lossy: drop deref).
  s = s.replace(/\*\s*(\+\+|--)\s*([A-Za-z_]\w*(?:\.\w+)*)/g, '$1$2');
  // `*X++`, `*X--` (deref then post-inc/dec) → `X++`, `X--`.
  s = s.replace(/\*\s*([A-Za-z_]\w*(?:\.\w+)*)(\+\+|--)/g, '$1$2');

  // *(X++) = Y → X = Y; X++  — but for parseability we just emit `X = Y;`
  // (= post-inc loss, but parses).
  s = s.replace(/\*\s*\(\s*([A-Za-z_]\w*(?:\.\w+)*)\s*(\+\+|--)\s*\)\s*=(?!=)/g, '$1 = ');
  // `*(X++)` in expression context (= no `=` after) → `X` (deref dropped).
  s = s.replace(/\*\s*\(\s*([A-Za-z_]\w*(?:\.\w+)*)\s*(\+\+|--)\s*\)/g, '$1');
  // `*(X)++ = Y` → `X = Y` (deref + post-inc on LHS, lossy).
  s = s.replace(/\*\s*\(\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*(\+\+|--)\s*=(?!=)/g, '$1 = ');
  // `*(X)++` in expression context → `X` (deref dropped, lossy).
  s = s.replace(/\*\s*\(\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*(\+\+|--)/g, '$1');
  // `*(X-- - K) = Y` and similar : drop the `*(`...`)` deref wrapper.
  // Only match at start of statement (= after `;`, `{`, line start).
  // Replace `*( arbitrary expr )` when followed by `=` with `MEM_WRITE(expr, rhs)`.
  // Handle nested parens via custom matcher.
  s = (function transformMemWrite(text) {
    let out = '';
    let i = 0;
    while (i < text.length) {
      // Check for a `*(` after a stmt boundary.
      // Look for this position : either at start (i===0), or after `\n`,
      // `;`, `{`, possibly with whitespace.
      let isStmtStart = false;
      if (i === 0) isStmtStart = true;
      else {
        // Walk back through whitespace.
        let k = i - 1;
        while (k >= 0 && /[ \t]/.test(text[k])) k--;
        if (k < 0 || text[k] === '\n' || text[k] === ';' || text[k] === '{') isStmtStart = true;
      }
      if (isStmtStart && text[i] === '*' && /[\s(]/.test(text[i + 1] || '')) {
        // Skip whitespace.
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (text[j] === '(') {
          // Find matching paren.
          let depth = 1;
          let k = j + 1;
          while (k < text.length && depth > 0) {
            if (text[k] === '(') depth++;
            else if (text[k] === ')') depth--;
            if (depth > 0) k++;
          }
          if (depth === 0) {
            const inner = text.slice(j + 1, k);
            // Skip whitespace after `)`.
            let m = k + 1;
            while (m < text.length && /\s/.test(text[m])) m++;
            // Must be `=` (not `==`).
            if (text[m] === '=' && text[m + 1] !== '=') {
              // Find `;` end.
              let sc = m + 1;
              let pdepth = 0;
              while (sc < text.length && (text[sc] !== ';' || pdepth > 0)) {
                if (text[sc] === '(') pdepth++;
                else if (text[sc] === ')') pdepth--;
                sc++;
              }
              if (sc < text.length) {
                const rhs = text.slice(m + 1, sc).trim();
                out += `MEM_WRITE((${inner.trim()}), ${rhs});`;
                i = sc + 1;
                continue;
              }
            }
          }
        }
      }
      out += text[i++];
    }
    return out;
  })(s);
  // (*X)++ / (*X)-- → X++ / X--
  s = s.replace(/\(\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*(\+\+|--)/g, '$1$2');
  // (*X) += / (*X) -= / (*X) = → X += / X -= / X =
  s = s.replace(/\(\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*([\+\-\*\/%]?=)/g, '$1 $2');
  // (*X)[idx] → X[idx]
  s = s.replace(/\(\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*\[/g, '$1[');
  // (*X)(args) → X(args)
  s = s.replace(/\(\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)\s*\(/g, '$1(');
  // (*X) → (X)  (keep parens — they may be required syntactically).
  s = s.replace(/\(\s*\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)/g, '($1)');
  // *(X) → (X) (when X is an identifier).
  s = s.replace(/\*\s*\(\s*([A-Za-z_]\w*(?:\.\w+)*)\s*\)/g, '($1)');

  // *X[idx] → X[idx]   (e.g. *gFieldEffectScriptFuncs[*script](...) — but `[*script]` first)
  // Drop `*` before `(` only at known positions (= statement start).
  // Statement-level `*X = Y;` (line start whitespace, then `*ident = `) → `X = Y;`
  s = s.replace(/^(\s*)\*\s*([A-Za-z_]\w*(?:\.\w+)*)\s*([\+\-\*\/%]?=)/gm, '$1$2 $3');

  // `*X++ = rhs` and `*X-- = rhs` — assignment form: drop deref+post-inc.
  // We just emit `X = rhs` (= we lose the post-inc semantically).
  s = s.replace(/^(\s*)\*\s*([A-Za-z_]\w*(?:\.\w+)*)(?:\+\+|--)\s*=(?!=)/gm, '$1$2 = ');

  // Inline `*ident` deref → `ident` (when not multiplication).
  // We handle the common idiom `arr[*idx]` → `arr[idx]`, `func(*arg, ...)` → `func(arg, ...)`.
  // Heuristic : `*` preceded by `(`, `,`, `[`, `=`, ` ` and followed by identifier.
  s = s.replace(/(?<=[(,\[=\s])\*([A-Za-z_]\w*)/g, '$1');

  // ─── Step 11 : C array literals `= { ... };` → `= [ ... ];` ─────────────
  // Handle nested-brace literals iteratively : convert innermost `{...}` first.
  // Strategy : detect that this `{` is in INITIALIZER context (= preceded by
  // `=` or `,` or `{` or after `=` with whitespace). For safety, only convert
  // brace lists whose body contains NO statement keyword.
  // We do up to 5 passes — enough for typical 2D/3D arrays.
  for (let pass = 0; pass < 5; pass++) {
    const before = s;
    // Drop designated array initializer `[idx] = ` ONLY when right after `{` or `,`.
    s = s.replace(/([\{\,])\s*\[\s*[^\[\]]+?\s*\]\s*=\s*/g, '$1 ');
    // Drop designated struct field initializer `.field = ` ONLY when right after `{` or `,`.
    s = s.replace(/([\{\,])\s*\.[A-Za-z_]\w*\s*=\s*/g, '$1 ');
    // `{ inner }` → `[ inner ]` only when inner has no inner braces and no
    // statement-like content. Must be in init context : preceded by `=` or `,` or `{`.
    s = s.replace(/([=,\{]\s*)\{([^{}]*)\}/g, (m, pre, body) => {
      if (/(?:^|[^a-zA-Z0-9_])(?:if|for|while|do|switch|return|let|const|var|case|default|break|continue|export|import|function)\b/.test(body)) {
        return m;
      }
      return `${pre}[${body}]`;
    });
    if (s === before) break;
  }
  // Final pass : convert top-level `= { ... };` (= simple non-nested) literals
  // not yet caught.
  s = s.replace(/=\s*\{([^{};]*)\}\s*;/g, '= [$1];');

  // ─── Step 12 : sizeof handling ───────────────────────────────────────────
  // `sizeof(struct X)` → `0`
  // `sizeof(X)` → `0`  (we use 0 because we lose the value, just need to parse)
  // `sizeof X` (without parens) → `0`
  s = s.replace(/\bsizeof\s*\(\s*struct\s+[A-Za-z_]\w*(?:\s*\*+)?\s*\)/g, '0');
  s = s.replace(/\bsizeof\s*\(\s*(?:const\s+)?(?:struct\s+)?[A-Za-z_]\w*(?:\s*\*+)?\s*\)/g, '0');
  s = s.replace(/\bsizeof\s+[A-Za-z_]\w*(?:\.\w+)*/g, '0');
  // `offsetof(struct X, field)` → 0 (lossy).
  s = s.replace(/\boffsetof\s*\(\s*(?:struct\s+|union\s+|enum\s+)?[A-Za-z_]\w*\s*,\s*[A-Za-z_]\w*(?:\.\w+|\[[^\]]*\])*\s*\)/g, '0');

  // ─── Step 13 : goto / labels ─────────────────────────────────────────────
  // TS does not support `goto`. Comment them out so they parse.
  // `goto label;` → `/* GOTO: label */`
  s = s.replace(/^\s*goto\s+([A-Za-z_]\w*)\s*;/gm, (m) => `// ${m.trim()}`);
  // `label:` → `// LABEL: label`. We must distinguish from case labels and
  // ternaries. Match a line that's just `identifier:` at start.
  s = s.replace(/^([ \t]*)([A-Za-z_]\w*)\s*:[ \t]*$/gm, (m, ws, name) => {
    if (['default', 'case', 'public', 'private', 'protected'].includes(name)) return m;
    return `${ws}// LABEL: ${name}:`;
  });

  // ─── Step 14 : `return ;` → `return;` ───────────────────────────────────
  s = s.replace(/\breturn\s+;/g, 'return;');

  // ─── Step 15 : Pre-inc/pre-dec `++X` `--X` are valid in TS ──────────────
  // (already valid, no rewrite needed)

  // ─── Step 16 : Casts in function-pointer style `(bool8 (*)(void))X` ─────
  // The C source `(bool8 (*)(void))ScriptReadWord(ctx)` casts a function ptr.
  // We drop the cast → `ScriptReadWord(ctx)`.
  s = s.replace(/\(\s*[\w\s]+\(\s*\*\s*\)\s*\([^)]*\)\s*\)\s*/g, '');
  // Less-specific function pointer cast `(TYPE (*))X` (missing args).
  s = s.replace(/\(\s*[\w\s]+\(\s*\*+\s*\)\s*\)\s*/g, '');

  // ─── Step 17 : enum-tag declarations inside body ────────────────────────
  // `enum X { ... };` is rare inside body. Comment out if found.
  s = s.replace(/^(\s*)enum\s+\w+\s*\{[^}]*\}\s*;/gm, '$1// $&');
  // Anonymous struct + decl : `struct { ... } static const arr[] = ...`
  // Replace with `const arr: any =`. Match across lines (multiline mode).
  s = s.replace(
    /\bstruct\s*\{[\s\S]*?\}\s*(?:static\s+|const\s+)*([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*=/g,
    'const $1: any ='
  );
  s = s.replace(
    /\bstruct\s*\{[\s\S]*?\}\s*(?:static\s+|const\s+)*([A-Za-z_]\w*)(?:\s*\[[^\]]*\])+\s*;/g,
    'const $1: any[] = [];'
  );
  s = s.replace(
    /\bstruct\s*\{[\s\S]*?\}\s*(?:static\s+|const\s+)*([A-Za-z_]\w*)\s*=/g,
    'let $1: any ='
  );
  s = s.replace(
    /\bstruct\s*\{[\s\S]*?\}\s*(?:static\s+|const\s+)*([A-Za-z_]\w*)\s*;/g,
    'let $1: any = null;'
  );

  // ─── Step 18 : `typedef ...` is rarely inside a body. Comment if present.
  s = s.replace(/^(\s*)typedef\s+[^;]+;/gm, '$1// $&');

  // ─── Step 19 : `static const TYPE arr[] = {...}` inside body ─────────────
  // Already handled by step 2.

  // ─── Step 20 : C99 designated initializer in array element ─────────────
  // `arr[idx] = expr` is fine.
  // `[idx] = expr` inside braces — leave as is (we'll inherit any errors).

  // ─── Step 21 : Last-resort fixups ───────────────────────────────────────
  // Empty `(void)` cast leftovers.
  s = s.replace(/\(\s*\)\s*(?=[A-Za-z_])/g, '');

  // ─── Step 21b : `va_arg(va, type)` → `va_arg(va, "type")` ──────────────
  // The 2nd arg of va_arg is a type name (= unparseable in TS). We wrap it
  // in quotes to make it a string literal and parseable.
  s = s.replace(/\bva_arg\s*\(\s*([A-Za-z_]\w*)\s*,\s*([^)]+)\s*\)/g, (m, name, typeArg) => {
    const cleaned = typeArg.replace(/"/g, '').trim();
    return `va_arg(${name}, "${cleaned}")`;
  });

  // ─── Step 22 : Strip C numeric literal suffixes ────────────────────────
  // `8u`, `0xFFu`, `100ULL`, `1L`, `2.0f`, `3.14F` etc.
  s = s.replace(/(\b\d+|0[xX][0-9a-fA-F]+)(?:[uU][lL]{0,2}|[lL]{1,2}[uU]?)\b/g, '$1');
  // Float suffix : `2.0f`, `3.14F`, `1.5L`.
  s = s.replace(/(\b\d+\.\d*|\b\.\d+|\b\d+\.)([fFlL])\b/g, '$1');
  s = s.replace(/(\b\d+(?:\.\d+)?[eE][+-]?\d+)([fFlL])\b/g, '$1');

  // ─── Step 22b : GCC `case A ... B:` → `case A:` (lossy fallthrough). ───
  s = s.replace(/\bcase\s+([^:]+?)\s*\.\.\.\s*([^:]+?)\s*:/g, 'case $1:');

  // ─── Step 23 : Macro args like `64x32` (= GBA OAM shape/size macros) ───
  // C macros : `SPRITE_SHAPE(64x32)`, `SPRITE_SIZE(8x16)`, etc. The `64x32`
  // token glues two literals via the preprocessor. In TS we replace by an
  // identifier-like token so it parses : `_64x32`.
  // Whitelist GBA OAM sizes (8/16/32/64) to avoid eating hex literals like
  // `0x1000` (= `0` + `x` + `1000`).
  s = s.replace(/\b(8|16|32|64)x(8|16|32|64)\b/g, '_$1x$2');

  return { tsCode: s, warnings: [] };
}

// ─── Generate per-file output ────────────────────────────────────────────────

const NOW = new Date().toISOString().slice(0, 10);

function generateFile(sceneName, json) {
  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/transpile-decomp-all.mjs`);
  lines.push(`// Source : ${json.srcFile}`);
  lines.push(`// Generated : ${NOW}`);
  lines.push(`// DO NOT EDIT — re-run \`node scripts/transpile-decomp-all.mjs\` to refresh.`);
  lines.push(`//`);
  lines.push(`// Total : ${json.count} functions extracted from ${json.srcFile}.`);
  lines.push(`//`);
  lines.push(`// IMPORTANT :`);
  lines.push(`//   - Tous les imports manquants : marqués @ts-nocheck (= pas de typecheck).`);
  lines.push(`//   - Les bodies référencent des helpers (= FaceDirection, InitMovementNormal, etc.)`);
  lines.push(`//     qui doivent être bridged vers nos TS impls. Cf. memory/audit pour la liste.`);
  lines.push(`//   - Pour activer une fonction, la importer depuis runtime engine + bridge`);
  lines.push(`//     ses callsTo manquants.`);
  lines.push(``);
  lines.push(`/* eslint-disable */`);
  lines.push(`// @ts-nocheck`);
  lines.push(``);

  // Extract per-source-file 1-arg object-like macros so transpileBody can
  // expand calls like `linkGender(o) = x` → `o.singleMovementActive = x`.
  let macros = null;
  if (json.srcFile) {
    const srcAbs = resolve(decompRoot, json.srcFile);
    if (existsSync(srcAbs)) {
      try {
        macros = extractMacros(readFileSync(srcAbs, 'utf8'));
      } catch { /* swallow — proceed without macros */ }
    }
  }

  let okCount = 0, failCount = 0;
  const failedNames = [];

  for (const [name, info] of Object.entries(json.functions)) {
    if (!info.body || !info.body.trim()) {
      failedNames.push({ name, reason: 'empty body' });
      failCount++;
      continue;
    }
    try {
      // Build TS param list from paramsList (= paramName: any).
      // Rename reserved names.
      const paramsList = info.paramsList || [];
      const paramNames = paramsList.map(p => p.name);
      const tsParams = paramsList.length === 0
        ? ''
        : paramsList.map(p => `${renameIfReserved(p.name)}: any`).join(', ');

      const { tsCode } = transpileBody(info.body, paramNames, macros);
      lines.push(`/** ${info.signature.replace(/\*\//g, '* /')} */`);
      lines.push(`export function ${name}(${tsParams}): any {`);
      const indented = (tsCode ?? '').split('\n').map(l => l ? '  ' + l : l).join('\n');
      lines.push(indented);
      lines.push(`}`);
      lines.push(``);
      okCount++;
    } catch (e) {
      failedNames.push({ name, reason: e.message });
      failCount++;
    }
  }

  // Append callsTo manifest at end (= helps detect helpers needed).
  const allCalls = new Set();
  for (const info of Object.values(json.functions)) {
    for (const c of info.callsTo || []) allCalls.add(c);
  }
  lines.push(`// ─── callsTo manifest (= ${allCalls.size} unique callees) ───────────────────────`);
  lines.push(`// (Sorted alphabetically. Used for helper bridge detection.)`);
  lines.push(`export const __callsTo__: ReadonlyArray<string> = ${JSON.stringify([...allCalls].sort())};`);
  lines.push(``);

  if (failedNames.length > 0) {
    lines.push(`// ─── Failed transpiles (${failedNames.length}) ───────────────────────────────`);
    for (const f of failedNames) {
      lines.push(`// ${f.name} : ${f.reason}`);
    }
  }

  return { ok: okCount, failed: failCount, content: lines.join('\n') };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const inFiles = readdirSync(inDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
console.log(`[transpile-decomp-all] processing ${inFiles.length} extracted JSON files`);

let totalOk = 0, totalFail = 0, filesWritten = 0;

for (const fname of inFiles) {
  const sceneName = fname.replace(/\.json$/, '');
  const json = JSON.parse(readFileSync(join(inDir, fname), 'utf8'));
  if (!json.functions || Object.keys(json.functions).length === 0) continue;
  const { ok, failed, content } = generateFile(sceneName, json);
  const outPath = join(outDir, `${sceneName}-all-auto.ts`);
  writeFileSync(outPath, content, 'utf8');
  filesWritten++;
  totalOk += ok;
  totalFail += failed;
}

console.log(`[transpile-decomp-all] DONE`);
console.log(`  Files written : ${filesWritten} → ${outDir}`);
console.log(`  Functions ok  : ${totalOk}`);
console.log(`  Failed        : ${totalFail}`);

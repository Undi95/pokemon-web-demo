#!/usr/bin/env node
/**
 * extract-decomp-asm.mjs
 * ----------------------
 * Pipeline d'extraction ASM (Phase 1.5) pour le décomp pokeemeraude :
 *   - data/**\/*.{s,inc}       (event scripts, battle scripts, anim scripts, maps)
 *   - constants/*.inc           (asm-side constants)
 *   - asm/macros/**\/*.inc      (macro→opcode mappings)
 *
 * Génère src/engine/decomp-data/auto-asm/<path>-data.ts par fichier.
 *
 * Patterns extraits :
 *   1. .equ NAME, VAL / .set NAME, VAL → constants
 *   2. LABEL:: (global) / LABEL: (local) → label table avec offset & global flag
 *   3. .include / .incbin → dependency graph
 *   4. .macro NAME args / .endm → macro definitions (avec body tokenized)
 *   5. Directive data : .byte / .2byte / .4byte / .string → raw data
 *   6. Macro invocations / opcode lines → AST tokenisé { op, args }
 *
 * Note : on ne compile PAS les macros vers bytecode binaire ici. On capture
 * seulement le source asm tokenisé. La compilation bytecode (Phase 2) lira
 * les macros + leurs args + leur expansion .byte pour faire le mapping.
 *
 * Usage : node scripts/extract-decomp-asm.mjs
 *
 * Volume attendu : ~580 fichiers asm → ~580 .ts générés.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-asm');

const NOW = new Date().toISOString().slice(0, 10);

const TS_RESERVED = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete',
  'do','else','enum','export','extends','false','finally','for','function','if',
  'import','in','instanceof','new','null','return','super','switch','this','throw',
  'true','try','typeof','var','void','while','with','yield','as','async','await',
  'implements','interface','let','package','private','protected','public','static',
  'object','any','number','string','boolean','undefined','never','unknown','symbol',
]);

function isValidExportName(name) {
  if (!name) return false;
  if (TS_RESERVED.has(name)) return false;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** Less strict than isValidExportName: any C/asm identifier, even TS reserved.
 *  Used for macro names + label names (stored as string fields in TS objects,
 *  not as top-level `export const` identifiers). */
function isValidIdentifier(name) {
  if (!name) return false;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** Strip asm comments: @ to EOL, /* ... *\/ block comments. */
function stripAsmComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/@[^\n]*/g, '');
}

function parseVal(s) {
  s = String(s).trim().replace(/[,;]$/, '').trim();
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^\(\s*-?\d+\s*\)$/.test(s)) return parseInt(s.replace(/[()]/g, ''), 10);
  if (s === 'TRUE') return 1;
  if (s === 'FALSE') return 0;
  return s; // identifier / expression
}

/** Tokenize one asm line: split off the leading mnemonic, then split args by comma.
 *  Handles strings ("...") preserving commas inside.
 *  Recognizes `\argname` as identifier (macro arg ref) — important for nested
 *  meta-macros where op name itself is a backslash-prefixed arg. */
function tokenizeLine(line) {
  line = line.trim();
  if (!line) return null;
  // Find first whitespace separator. Accept .word, word, \\argref as identifier.
  const m = line.match(/^(\\?[.\w]+)(?:\s+(.*))?$/);
  if (!m) return { op: line, args: [] };
  const op = m[1];
  const rest = (m[2] || '').trim();
  if (!rest) return { op, args: [] };
  // Split args by comma, respecting quoted strings
  const args = [];
  let cur = '', inStr = false, depth = 0;
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (c === '"' && rest[i - 1] !== '\\') { inStr = !inStr; cur += c; continue; }
    if (!inStr) {
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
    }
    cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return { op, args };
}

/** Process a single asm file and return TS body or null if empty. */
function processFile(absPath, relInput) {
  let raw;
  try { raw = readFileSync(absPath, 'utf8'); }
  catch { return null; }

  if (!raw.trim()) return null;
  const stripped = stripAsmComments(raw);
  const lines = stripped.split('\n');

  const constants = [];          // { name, val }
  const labels = [];             // { name, isGlobal, instrIndex }
  const macroDefs = [];          // { name, args, body[] }
  const includes = [];           // { kind: 'include' | 'incbin', path }
  const data = [];               // { kind: '.byte'|.2byte|.4byte|.string, vals[] }
  const ops = [];                // tokenized lines: { op, args[], lineNum }

  let inMacroDef = null;         // { name, args, body[] }
  let macroDepth = 0;            // tracks nested .macro/.endm depth
  let instrCounter = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    let line = lines[lineIdx].replace(/\t/g, ' ').trim();
    if (!line) continue;

    // Skip C-style #include — those go to dependency graph but are processed by C extractor
    if (line.startsWith('#include')) {
      const m = line.match(/#include\s+["<]([^">]+)[">]/);
      if (m) includes.push({ kind: 'cinclude', path: m[1] });
      continue;
    }
    // Skip other C-style preprocessor (#define etc)
    if (line.startsWith('#')) continue;

    // .include / .incbin
    if (line.startsWith('.include ')) {
      const m = line.match(/\.include\s+"([^"]+)"/);
      if (m) includes.push({ kind: 'include', path: m[1] });
      continue;
    }
    if (line.startsWith('.incbin ')) {
      const m = line.match(/\.incbin\s+"([^"]+)"/);
      if (m) includes.push({ kind: 'incbin', path: m[1] });
      continue;
    }

    // .set / .equ — constants
    const setMatch = line.match(/^\.(?:set|equ)\s+(\w+)\s*,\s*(.+)$/);
    if (setMatch) {
      const name = setMatch[1];
      if (isValidExportName(name)) {
        constants.push({ name, val: parseVal(setMatch[2]) });
      }
      continue;
    }

    // .macro / .endm  (NOTE: macro names use isValidIdentifier, not isValidExportName.
    // We track macroDepth to support nested .macro inside meta-macros, e.g.
    // movement.inc's `create_movement_action` defines `.macro \name` inside.)
    if (line.startsWith('.macro ')) {
      if (macroDepth === 0) {
        // Start outer macro definition
        const m = line.match(/^\.macro\s+(\w+)(?:\s+(.+))?$/);
        if (m && isValidIdentifier(m[1])) {
          inMacroDef = {
            name: m[1],
            args: (m[2] || '').split(',').map(s => s.trim()).filter(Boolean),
            body: [],
          };
        }
      } else if (inMacroDef) {
        // Nested .macro — just append to outer body verbatim (incl. \arg refs)
        const tok = tokenizeLine(line);
        if (tok) inMacroDef.body.push(tok);
      }
      macroDepth++;
      continue;
    }
    if (line === '.endm' || line.startsWith('.endm ')) {
      if (macroDepth > 0) macroDepth--;
      if (macroDepth === 0 && inMacroDef) {
        macroDefs.push(inMacroDef);
        inMacroDef = null;
      } else if (macroDepth > 0 && inMacroDef) {
        // Nested .endm: include in body so meta-macro detection can find it
        inMacroDef.body.push({ op: '.endm', args: [] });
      }
      continue;
    }
    if (inMacroDef) {
      // Body line of macro (any depth)
      const tok = tokenizeLine(line);
      if (tok) inMacroDef.body.push(tok);
      continue;
    }

    // Skip .global / .extern / .section / .align / etc directives at directive level
    if (line.startsWith('.global ') || line.startsWith('.extern ') ||
        line.startsWith('.section ') || line.startsWith('.align') ||
        line.startsWith('.thumb') || line.startsWith('.arm') ||
        line.startsWith('.syntax') || line.startsWith('.text') ||
        line.startsWith('.code') || line.startsWith('.fn_align') ||
        line.startsWith('.cpu') || line.startsWith('.fpu')) {
      continue;
    }

    // Labels: NAME: or NAME::  (use isValidIdentifier — labels are stored as
    // string fields in LABELS array, TS reserved words are valid asm labels.)
    const labelMatch = line.match(/^(\w+):(:?)\s*(.*)$/);
    if (labelMatch) {
      const name = labelMatch[1];
      const isGlobal = labelMatch[2] === ':';
      if (isValidIdentifier(name)) {
        labels.push({ name, isGlobal, instrIndex: instrCounter });
      }
      const restOfLine = labelMatch[3].trim();
      if (!restOfLine) continue;
      line = restOfLine; // fall through to process the rest
    }

    // Data directives
    const dataMatch = line.match(/^\.(byte|2byte|4byte|hword|word|string|asciz|ascii)\s+(.+)$/);
    if (dataMatch) {
      const kind = '.' + dataMatch[1];
      const argsRaw = dataMatch[2].trim();
      // For .string, keep as single arg
      if (kind === '.string' || kind === '.asciz' || kind === '.ascii') {
        data.push({ kind, vals: [argsRaw] });
      } else {
        const tok = tokenizeLine(line);
        if (tok) data.push({ kind, vals: tok.args.map(parseVal) });
      }
      continue;
    }

    // Other directives we don't care about → skip
    if (line.startsWith('.')) continue;

    // Macro invocation / opcode line
    const tok = tokenizeLine(line);
    if (tok) {
      ops.push({ op: tok.op, args: tok.args.map(parseVal), lineNum: lineIdx + 1 });
      instrCounter++;
    }
  }

  const stats = {
    constants: constants.length,
    labels: labels.length,
    globalLabels: labels.filter(l => l.isGlobal).length,
    macros: macroDefs.length,
    includes: includes.length,
    dataDirectives: data.length,
    ops: ops.length,
  };

  // Empty? skip
  if (Object.values(stats).every(v => v === 0)) return null;

  // ─── Render TS ──────────────────────────────────────────────────────────────
  const sections = [];

  // 1. Constants
  if (constants.length) {
    const lines = ['// ─── .equ / .set constants ──────────────────────────────────────────────────'];
    const seen = new Set();
    for (const c of constants) {
      if (seen.has(c.name)) continue;
      seen.add(c.name);
      if (typeof c.val === 'number') {
        lines.push(`export const ${c.name} = ${c.val};`);
      } else {
        lines.push(`/** Raw expr: \`${String(c.val).replace(/`/g, '\\`')}\` */`);
        lines.push(`export const ${c.name}_EXPR = ${JSON.stringify(String(c.val))};`);
      }
    }
    sections.push(lines.join('\n'));
  }

  // 2. Labels
  if (labels.length) {
    const lines = [
      '// ─── Labels (script entry points + local jumps) ─────────────────────────────',
      '// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).',
      'export const LABELS = [',
    ];
    for (const l of labels) {
      lines.push(`  { name: '${l.name}', isGlobal: ${l.isGlobal}, instrIndex: ${l.instrIndex} },`);
    }
    lines.push('] as const;');
    sections.push(lines.join('\n'));
  }

  // 3. Macro defs
  if (macroDefs.length) {
    const lines = [
      '// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────',
      'export const MACROS = [',
    ];
    for (const m of macroDefs) {
      const argsStr = m.args.map(a => JSON.stringify(a)).join(', ');
      const bodyStr = m.body.map(b => `{op:${JSON.stringify(b.op)},args:[${b.args.map(a => JSON.stringify(a)).join(',')}]}`).join(', ');
      lines.push(`  { name: ${JSON.stringify(m.name)}, args: [${argsStr}], body: [${bodyStr}] },`);
    }
    lines.push('] as const;');
    sections.push(lines.join('\n'));
  }

  // 4. Includes / dependency graph
  if (includes.length) {
    const lines = [
      '// ─── .include / .incbin / #include (dependency graph) ──────────────────────',
      'export const INCLUDES = [',
    ];
    for (const i of includes) {
      lines.push(`  { kind: '${i.kind}', path: ${JSON.stringify(i.path)} },`);
    }
    lines.push('] as const;');
    sections.push(lines.join('\n'));
  }

  // 5. Data directives (truncate massive ones)
  if (data.length) {
    const lines = [
      '// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────',
    ];
    // Aggregate counts per kind
    const byKind = {};
    for (const d of data) byKind[d.kind] = (byKind[d.kind] || 0) + 1;
    lines.push(`// Counts: ${Object.entries(byKind).map(([k,v]) => `${k}=${v}`).join(', ')}`);
    // For massive data sets, just emit summary; otherwise full
    const totalVals = data.reduce((acc, d) => acc + d.vals.length, 0);
    if (totalVals > 5000) {
      // Summary only — the full bytecode is in the .s file, recoverable on demand
      lines.push(`/** Data omitted (${totalVals} values) — too large; refer to source file. */`);
      lines.push(`export const DATA_TOTAL_VALUES = ${totalVals};`);
    } else {
      lines.push('export const DATA_DIRECTIVES = [');
      for (const d of data) {
        const valsStr = d.vals.map(v => typeof v === 'number' ? v : JSON.stringify(v)).join(', ');
        lines.push(`  { kind: '${d.kind}', vals: [${valsStr}] },`);
      }
      lines.push('] as const;');
    }
    sections.push(lines.join('\n'));
  }

  // 6. Tokenized op stream (truncate if large)
  if (ops.length) {
    const lines = [
      '// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────',
      `// ${ops.length} instructions. Each has { op, args[] } — args are unresolved strings/numbers.`,
    ];
    if (ops.length > 5000) {
      lines.push(`/** OPS truncated (${ops.length} total) — first 5000 shown. */`);
      lines.push(`export const OPS_TOTAL = ${ops.length};`);
      lines.push('export const OPS = [');
      for (let i = 0; i < 5000; i++) {
        const o = ops[i];
        const argsStr = o.args.map(a => typeof a === 'number' ? a : JSON.stringify(a)).join(',');
        lines.push(`  {op:${JSON.stringify(o.op)},args:[${argsStr}]},`);
      }
      lines.push('] as const;');
    } else {
      lines.push('export const OPS = [');
      for (const o of ops) {
        const argsStr = o.args.map(a => typeof a === 'number' ? a : JSON.stringify(a)).join(',');
        lines.push(`  {op:${JSON.stringify(o.op)},args:[${argsStr}]},`);
      }
      lines.push('] as const;');
    }
    sections.push(lines.join('\n'));
  }

  const header = [
    `// AUTO-GENERATED from ${relInput.replace(/\\/g, '/')} by extract-decomp-asm.mjs`,
    `// Do not edit manually — re-run \`npm run extract:decomp-asm\` to refresh.`,
    `//`,
    `// Source: ${absPath.replace(/\\/g, '/')}`,
    `// Generated: ${NOW}`,
    '',
  ].join('\n');

  return { header, body: sections.join('\n\n'), stats };
}

// ─── Path mirror & namespace ─────────────────────────────────────────────────

function getOutputPath(relInput) {
  const parts = relInput.split(/[\\/]/);
  const fileName = parts.pop();
  const stem = fileName.replace(/\.(s|inc)$/, '');
  return [...parts, `${stem}-data.ts`].join('/');
}

function getNamespaceName(relInput) {
  const noExt = relInput.replace(/\.(s|inc)$/, '');
  const parts = noExt.split(/[\\/_]/);
  return parts
    .filter(Boolean)
    .map((p, i) => i === 0 ? p.toLowerCase() : (p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log(`[extract-decomp-asm] Source: ${decompRoot}`);
console.log(`[extract-decomp-asm] Output: ${outRoot}`);

if (!existsSync(decompRoot)) {
  console.error(`[extract-decomp-asm] FATAL: decomp not found at ${decompRoot}`);
  process.exit(1);
}

if (existsSync(outRoot)) rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

const sFiles = globSync('data/**/*.s', { cwd: decompRoot });
const dataIncFiles = globSync('data/**/*.inc', { cwd: decompRoot });
const constantsIncFiles = globSync('constants/**/*.inc', { cwd: decompRoot });
const asmMacroFiles = globSync('asm/macros/**/*.inc', { cwd: decompRoot });
const asmInc = globSync('asm/*.inc', { cwd: decompRoot });
const allInputs = [...sFiles, ...dataIncFiles, ...constantsIncFiles, ...asmMacroFiles, ...asmInc];

console.log(`[extract-decomp-asm] Found: ${sFiles.length} data/.s + ${dataIncFiles.length} data/.inc + ${constantsIncFiles.length} constants/.inc + ${asmMacroFiles.length} asm/macros/.inc + ${asmInc.length} asm/.inc = ${allInputs.length}`);

let okCount = 0, skipCount = 0, errCount = 0;
const totalStats = {};
const indexEntries = [];
const usedNames = new Map();

const startTime = Date.now();

for (const relInput of allInputs) {
  const absPath = join(decompRoot, relInput);
  const outRel = getOutputPath(relInput);
  const outAbs = join(outRoot, outRel);

  let result;
  try {
    result = processFile(absPath, relInput);
  } catch (e) {
    errCount++;
    console.error(`[ERR] ${relInput}: ${e.message}`);
    continue;
  }

  if (!result) { skipCount++; continue; }

  let ns = getNamespaceName(relInput);
  if (usedNames.has(ns)) {
    const n = usedNames.get(ns) + 1;
    usedNames.set(ns, n);
    ns = `${ns}${n}`;
  } else {
    usedNames.set(ns, 1);
  }

  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, result.header + '\n' + result.body + '\n');

  okCount++;
  for (const [k, v] of Object.entries(result.stats)) {
    totalStats[k] = (totalStats[k] || 0) + v;
  }
  indexEntries.push({ ns, outRel: outRel.replace(/\.ts$/, '') });
}

// Build index
const indexLines = [
  `// AUTO-GENERATED by extract-decomp-asm.mjs — Generated: ${NOW}`,
  `// Re-export every per-file ASM module under a unique namespace.`,
  '',
];
indexEntries.sort((a, b) => a.outRel.localeCompare(b.outRel));
for (const e of indexEntries) {
  indexLines.push(`export * as ${e.ns} from './${e.outRel}';`);
}
indexLines.push('');
writeFileSync(join(outRoot, '_all-asm-index.ts'), indexLines.join('\n'));

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  inputCount: allInputs.length,
  okCount, skipCount, errCount,
  totalStats,
  durationMs: Date.now() - startTime,
}, null, 2));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[extract-decomp-asm] Done in ${elapsed}s`);
console.log(`  OK: ${okCount}  Skipped: ${skipCount}  Err: ${errCount}`);
console.log(`  Total exports across all files:`);
for (const [k, v] of Object.entries(totalStats).sort()) {
  console.log(`    ${k.padEnd(18)} ${v}`);
}
console.log(`  Output: ${outRoot.replace(/\\/g, '/')}`);
console.log(`  Index:  ${outRoot.replace(/\\/g, '/')}/_all-asm-index.ts`);

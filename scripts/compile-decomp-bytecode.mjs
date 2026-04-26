#!/usr/bin/env node
/**
 * compile-decomp-bytecode.mjs (Phase 2A)
 * --------------------------------------
 * Compile les OPS asm extraits (Phase 1.5) → bytecode binaire (Uint8Array)
 * via expansion des macros + résolution labels.
 *
 * Inputs (issus des phases précédentes) :
 *   - src/engine/decomp-data/auto/**\/*-data.ts     (#define constants)
 *   - src/engine/decomp-data/auto-asm/**\/*-data.ts (.equ + MACROS + OPS + LABELS + DATA)
 *
 * Output : src/engine/decomp-data/auto-asm-bytecode/<path>-bytecode.ts
 *   Pour chaque script file avec OPS/LABELS, un .ts avec :
 *     export const LABELS: Record<string, number>  // labelName → byteOffset
 *     export const BYTECODE: number[]              // raw bytes
 *     export const STATS: { ops, expanded, bytes, unknownOps, unresolvedSymbols }
 *
 * Approche :
 *   1. Master `constantsMap` : scrape `export const X = N` de tous les .ts
 *      Plus parsing spécial des `*_cmd_table.inc` (enum séquentiel SCR_OP_*, BATTLE_OP_*)
 *   2. Master `macroMap` : agrège tous les MACROS de auto-asm/asm/macros/
 *   3. Per script file (2 passes) :
 *      Pass 1 : simulate emit → labelName → byteOffset
 *      Pass 2 : actual emit avec labels résolus en forward refs
 *
 * Limitations MVP :
 *   - Skip silencieux .if/.else/.endif/.warning/.error/.elseif (prend tout le body)
 *     → conditionnels → bytecode "approximé", non strict pour ces cas
 *   - Args macro liés littéralement (pas d'évaluation d'expressions)
 *   - Symboles non résolus → 0 placeholder + warning
 *
 * Usage : node scripts/compile-decomp-bytecode.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const autoRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto');
const asmRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-asm');
const outRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-asm-bytecode');

const NOW = new Date().toISOString().slice(0, 10);

// ─── Phase A: master constants map ────────────────────────────────────────────

console.log('[bytecode] Phase A: building master constants map...');

/** Scrape "export const NAME = NUM;" from all .ts files. */
function scrapeConstants(rootDir) {
  const map = new Map();
  const files = globSync('**/*.ts', { cwd: rootDir });
  let count = 0;
  for (const rel of files) {
    if (rel.startsWith('_')) continue; // skip indexes
    const abs = join(rootDir, rel);
    const src = readFileSync(abs, 'utf8');
    // Match: export const NAME = number; (signed/hex OK)
    const re = /^export const (\w+)\s*=\s*(-?(?:0x[0-9a-fA-F]+|\d+));/gm;
    let m;
    while ((m = re.exec(src)) !== null) {
      const name = m[1];
      const v = m[2].startsWith('0x') || m[2].startsWith('-0x')
        ? parseInt(m[2], 16)
        : parseInt(m[2], 10);
      // First definition wins — important: we'll override below for cmd tables
      if (!map.has(name)) {
        map.set(name, v);
        count++;
      }
    }
  }
  console.log(`  Scraped ${count} constants from ${rootDir.replace(/\\/g, '/').split('/').pop()}/`);
  return map;
}

const constantsMap = new Map();
for (const [k, v] of scrapeConstants(autoRoot)) constantsMap.set(k, v);
for (const [k, v] of scrapeConstants(asmRoot)) {
  if (!constantsMap.has(k)) constantsMap.set(k, v);
}

/** Parse cmd_table.inc files to assign sequential opcode values.
 *  Pattern in pokeemerald: `script_cmd_table_entry SCR_OP_X ScrCmd_x` → SCR_OP_X = sequential.
 *  Same for battle_script_cmd_table.inc, contest_ai_script_cmd_table.inc, etc. */
function parseCmdTables() {
  const cmdTables = [
    { file: 'data/script_cmd_table.inc',           macro: 'script_cmd_table_entry' },
    { file: 'data/battle_script_cmd_table.inc',    macro: 'battle_script_cmd_table_entry' },
    { file: 'data/contest_ai_script_cmd_table.inc',macro: 'contest_ai_script_cmd_table_entry' },
    { file: 'data/battle_anim_script_cmd_table.inc',macro: 'battle_anim_script_cmd_table_entry' },
    { file: 'data/battle_ai_script_cmd_table.inc', macro: 'battle_ai_script_cmd_table_entry' },
    { file: 'data/mystery_event_script_cmd_table.s',macro: 'mystery_event_script_cmd_table_entry' },
  ];
  let totalAssigned = 0;
  for (const t of cmdTables) {
    const abs = join(decompRoot, t.file);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf8');
    // Strip @ comments
    const cleaned = src.split('\n').map(l => l.replace(/@.*$/, '')).join('\n');
    const re = new RegExp(`${t.macro}\\s+(\\w+)`, 'g');
    let m, idx = 0;
    while ((m = re.exec(cleaned)) !== null) {
      const name = m[1];
      // Cmd tables override existing constant assignment (sequential is canonical)
      constantsMap.set(name, idx);
      idx++;
      totalAssigned++;
    }
    console.log(`  ${t.file}: ${idx} opcode constants assigned`);
  }
  console.log(`  Total cmd table opcodes: ${totalAssigned}`);
}
parseCmdTables();

// Synthetic constants the asm uses but aren't .equ'd directly
constantsMap.set('TRUE', 1);
constantsMap.set('FALSE', 0);
constantsMap.set('NULL', 0);

console.log(`  Master constants map: ${constantsMap.size} entries`);

// ─── Phase B: master macro map ───────────────────────────────────────────────

console.log('[bytecode] Phase B: building master macro map...');

const macroMap = new Map();

/** Read auto-asm files and extract MACROS arrays via JS eval (the TS output
 *  is valid JS literal, which makes balanced-bracket parsing trivial). */
function loadMacros() {
  const macroFiles = globSync('asm/macros/**/*-data.ts', { cwd: asmRoot });
  let count = 0;
  for (const rel of macroFiles) {
    const abs = join(asmRoot, rel);
    const src = readFileSync(abs, 'utf8');
    const arrMatch = src.match(/export const MACROS\s*=\s*(\[[\s\S]*?\])\s*as const;/);
    if (!arrMatch) continue;
    let arr;
    try {
      // Eval the array literal — it's pure JS data we wrote ourselves
      arr = new Function('return ' + arrMatch[1])();
    } catch (e) {
      console.warn(`  [macros] failed to eval ${rel}: ${e.message}`);
      continue;
    }
    if (!Array.isArray(arr)) continue;
    for (const m of arr) {
      if (!m || typeof m.name !== 'string') continue;
      if (!macroMap.has(m.name)) {
        macroMap.set(m.name, {
          args: Array.isArray(m.args) ? m.args : [],
          body: Array.isArray(m.body) ? m.body : [],
        });
        count++;
      }
    }
  }
  console.log(`  Loaded ${count} unique macros`);
}

loadMacros();

// ─── Phase C: per-script bytecode compilation ────────────────────────────────

console.log('[bytecode] Phase C: compiling scripts...');

if (existsSync(outRoot)) rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

/** Resolve a value (string or number) to a number. */
function resolveValue(v, labelOffsets, warnings) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return 0;
  const s = v.trim();
  // Direct number?
  if (/^-?0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  // Strip macro arg backslash prefix if leftover (\foo → foo)
  const stripped = s.replace(/^\\/, '');
  // Label?
  if (labelOffsets && labelOffsets.has(stripped)) return labelOffsets.get(stripped);
  // Constant?
  if (constantsMap.has(stripped)) return constantsMap.get(stripped);
  // Try simple addition: A+B or A|B
  const addMatch = stripped.match(/^(\w+)\s*\+\s*(\w+)$/);
  if (addMatch) {
    const a = resolveValue(addMatch[1], labelOffsets, null); // null = silent
    const b = resolveValue(addMatch[2], labelOffsets, null);
    return (a + b) | 0;
  }
  const orMatch = stripped.match(/^(\w+)\s*\|\s*(\w+)$/);
  if (orMatch) {
    const a = resolveValue(orMatch[1], labelOffsets, null);
    const b = resolveValue(orMatch[2], labelOffsets, null);
    return (a | b) | 0;
  }
  // Stripped form starts with paren — try inner
  const parenMatch = stripped.match(/^\((.+)\)$/);
  if (parenMatch) return resolveValue(parenMatch[1], labelOffsets, warnings);
  // Unresolved
  if (warnings) warnings.add(stripped);
  return 0;
}

/** Substitute macro args (\name) in an op. */
function substituteArgs(op, bindings) {
  return {
    op: op.op,
    args: op.args.map(a => {
      if (typeof a !== 'string') return a;
      // \name → bindings[name]; preserves rest of string for compound expressions
      return a.replace(/\\(\w+)/g, (_, name) => bindings[name] !== undefined ? bindings[name] : `\\${name}`);
    }),
  };
}

/** Bind macro args. macro.args are like ['dest:req', 'val=TRUE']. */
function bindArgs(macroArgs, callArgs) {
  const bindings = {};
  for (let i = 0; i < macroArgs.length; i++) {
    const def = macroArgs[i];
    // Strip :req or = default
    let name = def, def2 = undefined;
    const colonIdx = def.indexOf(':');
    if (colonIdx !== -1) name = def.slice(0, colonIdx);
    const eqIdx = def.indexOf('=');
    if (eqIdx !== -1) { name = def.slice(0, eqIdx); def2 = def.slice(eqIdx + 1); }
    if (i < callArgs.length) {
      bindings[name] = String(callArgs[i]);
    } else if (def2 !== undefined) {
      bindings[name] = def2;
    } else {
      bindings[name] = ''; // unbound required arg
    }
  }
  return bindings;
}

/** Compute bytes emitted by a single op (recursive on macros).
 *  Returns array of bytes. */
function emitOp(op, labelOffsets, warnings, depth = 0) {
  if (depth > 12) return []; // recursion guard
  const opName = op.op;

  // Skip non-emitting directives
  if (opName === '.if' || opName === '.else' || opName === '.endif' ||
      opName === '.elseif' || opName === '.warning' || opName === '.error' ||
      opName === '.align' || opName === '.section' || opName === '.global' ||
      opName === '.extern' || opName === '.set' || opName === '.equ' ||
      opName === '.thumb' || opName === '.arm' || opName === '.text' ||
      opName === '.code' || opName === '.fn_align' || opName === '.cpu' ||
      opName === '.fpu' || opName === '.syntax' || opName === '.include' ||
      opName === '.macro' || opName === '.endm' || opName === '.purgem' ||
      opName === '.ifdef' || opName === '.ifndef') {
    return [];
  }

  // Data emit directives
  if (opName === '.byte') {
    return op.args.map(a => resolveValue(a, labelOffsets, warnings) & 0xFF);
  }
  if (opName === '.2byte' || opName === '.hword' || opName === '.short') {
    const out = [];
    for (const a of op.args) {
      const v = resolveValue(a, labelOffsets, warnings) & 0xFFFF;
      out.push(v & 0xFF, (v >> 8) & 0xFF);
    }
    return out;
  }
  if (opName === '.4byte' || opName === '.word' || opName === '.long') {
    const out = [];
    for (const a of op.args) {
      const v = resolveValue(a, labelOffsets, warnings) >>> 0;
      out.push(v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >>> 24) & 0xFF);
    }
    return out;
  }
  if (opName === '.string' || opName === '.asciz') {
    if (!op.args[0]) return [0];
    const str = unquoteAsmString(op.args[0]);
    const bytes = [];
    for (const ch of str) bytes.push(ch.charCodeAt(0) & 0xFF);
    bytes.push(0); // NUL terminate
    return bytes;
  }
  if (opName === '.ascii') {
    if (!op.args[0]) return [];
    const str = unquoteAsmString(op.args[0]);
    const bytes = [];
    for (const ch of str) bytes.push(ch.charCodeAt(0) & 0xFF);
    return bytes;
  }
  if (opName === '.space' || opName === '.skip') {
    const n = resolveValue(op.args[0], labelOffsets, warnings) | 0;
    const fill = op.args[1] !== undefined ? (resolveValue(op.args[1], labelOffsets, warnings) & 0xFF) : 0;
    return Array(Math.max(0, Math.min(n, 4096))).fill(fill);
  }

  // Macro invocation?
  const macro = macroMap.get(opName);
  if (macro) {
    const bindings = bindArgs(macro.args, op.args);
    const out = [];
    for (const inner of macro.body) {
      const subbed = substituteArgs(inner, bindings);
      out.push(...emitOp(subbed, labelOffsets, warnings, depth + 1));
    }
    return out;
  }

  // Unknown: skip + warn
  if (warnings && !opName.startsWith('.')) warnings.add(`unknown_op:${opName}`);
  return [];
}

/** Unquote asm string literal: "foo\nbar" → foo<LF>bar */
function unquoteAsmString(s) {
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') s = s.slice(1, -1);
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\0/g, '\0')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');
}

/** Process one script-data.ts file. Returns null if no OPS/LABELS. */
function processScript(absPath, relInput) {
  const src = readFileSync(absPath, 'utf8');

  // Extract OPS array via eval (valid JS literal)
  const opsMatch = src.match(/export const OPS\s*=\s*(\[[\s\S]*?\])\s*as const;/);
  if (!opsMatch) return null;
  let ops;
  try { ops = new Function('return ' + opsMatch[1])(); }
  catch { return null; }
  if (!Array.isArray(ops) || ops.length === 0) return null;

  // Extract LABELS array via eval
  let labels = [];
  const labelsMatch = src.match(/export const LABELS\s*=\s*(\[[\s\S]*?\])\s*as const;/);
  if (labelsMatch) {
    try { labels = new Function('return ' + labelsMatch[1])(); }
    catch { labels = []; }
    if (!Array.isArray(labels)) labels = [];
  }

  // Build instrIdx → labels[] mapping
  const instrIdxLabels = new Map();
  for (const l of labels) {
    if (!instrIdxLabels.has(l.instrIndex)) instrIdxLabels.set(l.instrIndex, []);
    instrIdxLabels.get(l.instrIndex).push(l);
  }

  // Pass 1: compute byteOffset per instr & per label
  let byteOffset = 0;
  const labelOffsetsP1 = new Map();
  const dummyWarnings = new Set();
  for (let i = 0; i < ops.length; i++) {
    if (instrIdxLabels.has(i)) {
      for (const l of instrIdxLabels.get(i)) labelOffsetsP1.set(l.name, byteOffset);
    }
    const bytes = emitOp(ops[i], labelOffsetsP1, dummyWarnings);
    byteOffset += bytes.length;
  }

  // Pass 2: actual emit
  const bytes = [];
  const warnings = new Set();
  for (let i = 0; i < ops.length; i++) {
    bytes.push(...emitOp(ops[i], labelOffsetsP1, warnings));
  }

  // Build label map (sorted by offset)
  const labelMap = {};
  for (const [name, off] of labelOffsetsP1) labelMap[name] = off;

  // Stats
  const unknownOps = [...warnings].filter(w => w.startsWith('unknown_op:')).length;
  const unresolvedSymbols = [...warnings].filter(w => !w.startsWith('unknown_op:')).length;

  return { bytes, labelMap, ops: ops.length, unknownOps, unresolvedSymbols };
}

// ─── Run compilation across all script-bearing files ─────────────────────────

const inputs = globSync('**/*-data.ts', { cwd: asmRoot })
  .filter(p => !p.startsWith('asm/macros/'))   // skip macro defs themselves
  .filter(p => !p.startsWith('_'));

console.log(`  Compiling ${inputs.length} candidate files...`);

let okCount = 0, skipCount = 0;
const totalStats = { ops: 0, bytes: 0, unknownOps: 0, unresolvedSymbols: 0, labels: 0 };
const indexEntries = [];
const startTime = Date.now();

for (const rel of inputs) {
  const absIn = join(asmRoot, rel);
  let result;
  try {
    result = processScript(absIn, rel);
  } catch (e) {
    console.error(`[ERR] ${rel}: ${e.message}`);
    continue;
  }
  if (!result || result.bytes.length === 0) { skipCount++; continue; }

  const outRel = rel.replace(/\\/g, '/').replace(/-data\.ts$/, '-bytecode.ts');
  const outAbs = join(outRoot, outRel);
  mkdirSync(dirname(outAbs), { recursive: true });

  // Build TS file
  const labelEntries = Object.entries(result.labelMap).sort((a, b) => a[1] - b[1]);
  const tsContent = [
    `// AUTO-GENERATED from ${rel.replace(/\\/g, '/')} by compile-decomp-bytecode.mjs`,
    `// Do not edit manually — re-run \`npm run extract:bytecode\` to refresh.`,
    `//`,
    `// Generated: ${NOW}`,
    `// Stats: ops=${result.ops}, bytes=${result.bytes.length}, labels=${labelEntries.length}, unknownOps=${result.unknownOps}, unresolvedSymbols=${result.unresolvedSymbols}`,
    '',
    `/** Label name → byte offset within BYTECODE. */`,
    `export const LABELS: Record<string, number> = {`,
    ...labelEntries.map(([n, o]) => `  ${JSON.stringify(n)}: ${o},`),
    `};`,
    '',
    `/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */`,
    `export const BYTECODE: readonly number[] = [${result.bytes.join(',')}] as const;`,
    '',
    `export const STATS = { ops: ${result.ops}, bytes: ${result.bytes.length}, labels: ${labelEntries.length}, unknownOps: ${result.unknownOps}, unresolvedSymbols: ${result.unresolvedSymbols} } as const;`,
    '',
  ].join('\n');

  writeFileSync(outAbs, tsContent);

  okCount++;
  totalStats.ops += result.ops;
  totalStats.bytes += result.bytes.length;
  totalStats.unknownOps += result.unknownOps;
  totalStats.unresolvedSymbols += result.unresolvedSymbols;
  totalStats.labels += labelEntries.length;
  indexEntries.push({ outRel: outRel.replace(/\.ts$/, ''), bytes: result.bytes.length, labels: labelEntries.length });
}

// Build index
const indexLines = [
  `// AUTO-GENERATED by compile-decomp-bytecode.mjs — Generated: ${NOW}`,
  `// Re-export every per-file bytecode module under a unique namespace.`,
  '',
];
indexEntries.sort((a, b) => a.outRel.localeCompare(b.outRel));
const usedNs = new Map();
for (const e of indexEntries) {
  // Build namespace: split on /, \, -, _ then camelCase
  const parts = e.outRel.split(/[\/\\\-_]+/).filter(Boolean);
  let ns = parts
    .map((p, i) => i === 0 ? p.toLowerCase() : (p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');
  // Avoid collisions
  if (usedNs.has(ns)) {
    const n = usedNs.get(ns) + 1;
    usedNs.set(ns, n);
    ns = `${ns}${n}`;
  } else usedNs.set(ns, 1);
  indexLines.push(`export * as ${ns} from './${e.outRel}';`);
}
indexLines.push('');
writeFileSync(join(outRoot, '_all-bytecode-index.ts'), indexLines.join('\n'));

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  inputCount: inputs.length,
  okCount, skipCount,
  totalStats,
  durationMs: Date.now() - startTime,
}, null, 2));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[bytecode] Done in ${elapsed}s`);
console.log(`  Compiled: ${okCount}  Skipped (no OPS): ${skipCount}`);
console.log(`  Totals:`);
console.log(`    OPS processed         ${totalStats.ops.toLocaleString()}`);
console.log(`    bytes emitted         ${totalStats.bytes.toLocaleString()}`);
console.log(`    labels resolved       ${totalStats.labels.toLocaleString()}`);
console.log(`    unknown ops           ${totalStats.unknownOps.toLocaleString()}`);
console.log(`    unresolved symbols    ${totalStats.unresolvedSymbols.toLocaleString()}`);
console.log(`  Output: ${outRoot.replace(/\\/g, '/')}`);

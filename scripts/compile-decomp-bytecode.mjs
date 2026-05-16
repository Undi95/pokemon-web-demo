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
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync, unlinkSync } from 'node:fs';
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

/** Scrape "export const NAME = NUM;" AND `export const ENUM_X = { KEY: NUM, ... };`
 *  from all .ts files. The auto-extractor emits enums as object literals (= named
 *  constants are NOT individual exports), so we must parse the object body too.
 *  Without this, all B_SCR_OP_* battle opcodes resolve to 0 (= every script's
 *  bytecode becomes a sea of 0x00 = attackcanceler infinite loops). */
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
    // Match: export const ENUM_NAME = { KEY1: NUM, KEY2: NUM, ... };
    // The auto extractor (= scripts/parse-c-decomp.mjs) emits enums this way.
    // We need each KEY = NUM as if it were `export const KEY = NUM;`.
    const enumRe = /^export const ENUM_\w+\s*=\s*(\{[\s\S]*?\})\s*as const;/gm;
    let em;
    while ((em = enumRe.exec(src)) !== null) {
      let obj;
      try {
        // The enum body is pure JS literal, safe to eval.
        obj = new Function('return ' + em[1])();
      } catch { continue; }
      if (!obj || typeof obj !== 'object') continue;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v !== 'number') continue;
        if (!map.has(k)) {
          map.set(k, v);
          count++;
        }
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

// macroMap stores ALL definitions per macro name. Each entry is an array of
// { context, args, body } records. Context = source asm file group :
//   'battle_script', 'battle_ai_script', 'battle_anim_script',
//   'contest_ai_script', 'event', 'mystery_event_script', 'common'.
// At lookup time, lookupMacro(name, context) returns the matching definition
// (= 1:1 décomp .include resolution : battle_scripts_*.s includes battle_script.inc,
// scripts/*.s includes event.inc, etc.).
const macroMap = new Map();

/** Map macro source file → context tag. */
function getMacroContext(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm.includes('battle_script-data.ts')) return 'battle_script';
  if (norm.includes('battle_ai_script-data.ts')) return 'battle_ai_script';
  if (norm.includes('battle_anim_script-data.ts')) return 'battle_anim_script';
  if (norm.includes('contest_ai_script-data.ts')) return 'contest_ai_script';
  if (norm.includes('event-data.ts')) return 'event';
  if (norm.includes('mystery_event_script-data.ts')) return 'mystery_event_script';
  return 'common'; // generic macros (.macros.inc, constants, etc.)
}

/** Read auto-asm files and extract MACROS arrays via JS eval (the TS output
 *  is valid JS literal, which makes balanced-bracket parsing trivial).
 *  Scans BOTH asm/macros/ AND data/ AND constants/ — macros can be defined
 *  anywhere, e.g. data/specials.inc has `def_special`, constants/m4a_constants.inc
 *  has `struct_begin`/`struct_field`. */
function loadMacros() {
  const macroFiles = [
    ...globSync('asm/macros/**/*-data.ts', { cwd: asmRoot }),
    ...globSync('data/**/*-data.ts', { cwd: asmRoot }),
    ...globSync('constants/**/*-data.ts', { cwd: asmRoot }),
  ];
  let count = 0;
  for (const rel of macroFiles) {
    const abs = join(asmRoot, rel);
    const src = readFileSync(abs, 'utf8');
    const arrMatch = src.match(/export const MACROS\s*=\s*(\[[\s\S]*?\])\s*as const;/);
    if (!arrMatch) continue;
    let arr;
    try {
      arr = new Function('return ' + arrMatch[1])();
    } catch (e) {
      console.warn(`  [macros] failed to eval ${rel}: ${e.message}`);
      continue;
    }
    if (!Array.isArray(arr)) continue;
    const context = getMacroContext(rel);
    for (const m of arr) {
      if (!m || typeof m.name !== 'string') continue;
      const def = {
        context,
        args: Array.isArray(m.args) ? m.args : [],
        body: Array.isArray(m.body) ? m.body : [],
      };
      if (!macroMap.has(m.name)) {
        macroMap.set(m.name, [def]);
        count++;
      } else {
        // Append additional definitions; lookupMacro picks by context.
        macroMap.get(m.name).push(def);
      }
    }
  }
  console.log(`  Loaded ${count} unique macros`);
  // Print conflicts (= names with multiple definitions in different contexts).
  let conflicts = 0;
  for (const [name, defs] of macroMap) {
    const ctxs = new Set(defs.map(d => d.context));
    if (ctxs.size > 1) conflicts++;
  }
  console.log(`  Macros with multiple-context definitions: ${conflicts}`);
}

/** Resolve a macro for a given script context, falling back to 'common'. */
function lookupMacro(name, scriptContext) {
  const defs = macroMap.get(name);
  if (!defs || defs.length === 0) return null;
  // Prefer same-context, else common, else first.
  let match = defs.find(d => d.context === scriptContext);
  if (!match) match = defs.find(d => d.context === 'common');
  if (!match) match = defs[0];
  return match;
}

loadMacros();

// ─── Phase B.2: meta-macro expansion ─────────────────────────────────────────
//
// Some asm files use a "meta-macro" pattern: a macro whose body contains a
// nested `.macro` definition. The outer macro is invoked at top-level with
// args that produce a NEW macro at runtime.
//
// Example (asm/macros/movement.inc):
//   .macro create_movement_action name:req, value:req
//     .macro \name
//       .byte \value
//     .endm
//   .endm
//
//   create_movement_action face_down, MOVEMENT_ACTION_FACE_DOWN
//   create_movement_action walk_up,   MOVEMENT_ACTION_WALK_UP
//   ... (76 movement actions defined this way)
//
// Without this pre-pass, all walk_*/face_*/delay_* opcodes appear as "unknown"
// because we never registered them. Here we walk the asm files for top-level
// invocations of meta-macros and synthesize the resulting macros.
//
// Heuristic: a macro M is a "meta-macro" if its body contains `.macro \X` for
// some arg name X. We then synthesize macroMap[<name-arg>] from the inner body.

console.log('[bytecode] Phase B.2: meta-macro expansion...');

/** Detect if a macro is a meta-macro and return the inner body template. */
function getMetaMacroInfo(macro) {
  // Look for .macro \X ... .endm in body
  let nameArgIdx = -1;
  for (let i = 0; i < macro.body.length; i++) {
    const op = macro.body[i];
    if (op.op === '.macro' && op.args.length >= 1) {
      // Inner .macro name should be \arg (a backslash-prefixed arg ref)
      const argRef = op.args[0];
      if (typeof argRef === 'string' && argRef.startsWith('\\')) {
        nameArgIdx = i;
        break;
      }
    }
  }
  if (nameArgIdx === -1) return null;
  // Find matching .endm
  let endIdx = -1, depth = 1;
  for (let i = nameArgIdx + 1; i < macro.body.length; i++) {
    if (macro.body[i].op === '.macro') depth++;
    else if (macro.body[i].op === '.endm') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return null;
  // The synthesized macro takes the name from nameRef arg, and has the inner body
  const nameRef = macro.body[nameArgIdx].args[0].slice(1); // strip leading \
  const innerArgs = macro.body[nameArgIdx].args.slice(1); // any additional args
  const innerBody = macro.body.slice(nameArgIdx + 1, endIdx);
  return { nameArg: nameRef, innerArgs, innerBody };
}

const metaMacros = new Map(); // metaName → { nameArg, innerArgs, innerBody }
for (const [name, defs] of macroMap) {
  // Meta-macros work the same regardless of context; use first definition.
  const m = defs[0];
  const info = getMetaMacroInfo(m);
  if (info) metaMacros.set(name, { outerArgs: m.args, ...info });
}
console.log(`  Detected ${metaMacros.size} meta-macros: ${[...metaMacros.keys()].join(', ')}`);

/** Scan asm files for top-level invocations of meta-macros & synthesize. */
function synthesizeFromMetaInvocations() {
  let synthCount = 0;
  // Walk all data/.s and asm/macros/.inc files looking for top-level meta-macro calls
  const targets = [
    ...globSync('asm/macros/**/*.inc', { cwd: decompRoot }),
    ...globSync('data/**/*.s', { cwd: decompRoot }),
    ...globSync('data/**/*.inc', { cwd: decompRoot }),
  ];
  for (const rel of targets) {
    const abs = join(decompRoot, rel);
    const src = readFileSync(abs, 'utf8');
    // Strip @ comments & block comments
    const lines = src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n');
    let inMacroDepth = 0;
    for (let line of lines) {
      line = line.replace(/@.*$/, '').trim();
      if (!line) continue;
      // Track .macro / .endm depth — only top-level invocations matter
      if (line.startsWith('.macro ')) { inMacroDepth++; continue; }
      if (line === '.endm' || line.startsWith('.endm ')) { inMacroDepth--; continue; }
      if (inMacroDepth > 0) continue;
      // Match: METAMACRO_NAME arg1, arg2, ...
      const m = line.match(/^([\w]+)(?:\s+(.+))?$/);
      if (!m) continue;
      const metaName = m[1];
      const meta = metaMacros.get(metaName);
      if (!meta) continue;
      // Parse args
      const argsStr = (m[2] || '').trim();
      const args = [];
      if (argsStr) {
        let cur = '', depth = 0, inStr = false;
        for (let i = 0; i < argsStr.length; i++) {
          const c = argsStr[i];
          if (c === '"' && argsStr[i - 1] !== '\\') inStr = !inStr;
          if (!inStr) {
            if (c === '(' || c === '[') depth++;
            else if (c === ')' || c === ']') depth--;
            else if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
          }
          cur += c;
        }
        if (cur.trim()) args.push(cur.trim());
      }
      // Bind outer args
      const bindings = bindArgs(meta.outerArgs, args);
      // The synthesized macro name is bindings[meta.nameArg]
      const synthName = bindings[meta.nameArg];
      if (!synthName || macroMap.has(synthName)) continue;
      // The body is inner body with bindings substituted
      const synthBody = meta.innerBody.map(op => substituteArgs(op, bindings));
      macroMap.set(synthName, [{
        context: 'common',
        args: meta.innerArgs.map(a => typeof a === 'string' && a.startsWith('\\') ? a.slice(1) : a),
        body: synthBody,
      }]);
      synthCount++;
    }
  }
  console.log(`  Synthesized ${synthCount} macros from meta-macro invocations`);
}
synthesizeFromMetaInvocations();

// ─── Phase C: per-script bytecode compilation ────────────────────────────────

console.log('[bytecode] Phase C: compiling scripts...');

// Wipe ONLY the auto-generated files (= *-bytecode.ts + _* index files).
// Preserve hand-curated additions in this tree like `data/battle_scripts_1-jump-table.ts`
// (= 1:1 décomp gBattleScriptsForMoveEffects table, NOT generated from asm OPS but
// from the C extracted JSON). Avoids cascade where each re-run kills hand-written deps.
function cleanGenerated(dir) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) { cleanGenerated(abs); continue; }
    const isGenerated = entry.endsWith('-bytecode.ts') || entry.startsWith('_');
    if (isGenerated) unlinkSync(abs);
  }
}
if (existsSync(outRoot)) {
  cleanGenerated(outRoot);
} else {
  mkdirSync(outRoot, { recursive: true });
}

// Phase 1.3 G : encode known battle memory symbols as `0xF0000000 | id` so
// the runtime memory-map can resolve them. Whitelist des ~28 vraies battle
// variables utilisées par les opcodes natifs (0x29-0x38) dans
// `data/battle_scripts_1.s` + `battle_scripts_2.s`.
const SYMBOL_MARKER = 0xF0000000;
const BATTLE_MEMORY_SYMBOLS = new Set([
  // gXxx prefix = globals battle ewram vars.
  'gHitMarker', 'gMoveResultFlags', 'gChosenMove', 'gBattleMoveDamage',
  'gBattleOutcome', 'gCritMultiplier', 'gBattleWeather', 'gBattleTypeFlags',
  'gBattlerTarget', 'gLastUsedItem', 'gTrainerBattleOpponent_A',
  'gNumSafariBalls', 'gBattleTextBuff1', 'gBattleCommunication',
  // sXxx prefix = gBattleScripting fields (battle.h:489-518).
  'sDMG_MULTIPLIER', 'sB_ANIM_TURN', 'sB_ANIM_TARGETS_HIT',
  'sTWOTURN_STRINGID', 'sMULTIHIT_EFFECT', 'sMULTIHIT_STRING',
  'sSTAT_ANIM_PLAYED', 'sTRIPLE_KICK_POWER', 'sGIVEEXP_STATE',
  'sLVLBOX_STATE', 'sLEARNMOVE_STATE', 'sBATTLE_STYLE', 'sBATTLER',
  // cXxx prefix = gBattleCommunication[X].
  'cMULTISTRING_CHOOSER', 'cMISS_TYPE', 'cEFFECTIVENESS',
]);
const symbolToId = new Map();  // name → id
const idToSymbol = [];          // id → name (= reverse lookup for exports)

function getSymbolId(name) {
  if (symbolToId.has(name)) return symbolToId.get(name);
  const id = idToSymbol.length;
  idToSymbol.push(name);
  symbolToId.set(name, id);
  return id;
}

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
  // Phase 1.3 G — battle memory var (whitelist) : encode as marker for runtime
  // memory-map resolution. Préserve seulement les ~28 vraies battle vars
  // utilisées par opcodes natifs (= éviter polluer avec sprite templates etc.).
  if (BATTLE_MEMORY_SYMBOLS.has(stripped)) {
    return (SYMBOL_MARKER | getSymbolId(stripped)) >>> 0;
  }
  // Unresolved.
  if (warnings) warnings.add(stripped);
  return 0;
}

/** Substitute macro args (\name) in an op — covers BOTH op.op AND op.args.
 *  Pattern asm meta-macros: `\jump \condition, \c` where \jump is itself
 *  bound to a macro name like `jumpifeq` chosen at invocation time. */
function substituteArgs(op, bindings) {
  const subStr = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(/\\(\w+)/g, (_, name) => bindings[name] !== undefined ? bindings[name] : `\\${name}`);
  };
  // op.op may itself be `\arg` or `\arg:` (label) — substitute too
  let newOp = subStr(op.op);
  // Strip trailing colon — it's a label declaration, but at runtime we just need
  // the label name in the form expected by labels[] tracking. For now, strip and
  // skip emit (labels are set by Pass 1 anyway, this is just an in-body label).
  let stripLabelColon = false;
  if (newOp.endsWith(':')) { newOp = newOp.slice(0, -1); stripLabelColon = true; }
  return {
    op: newOp,
    args: op.args.map(subStr),
    _isLabel: stripLabelColon,
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
 *  Returns array of bytes. fileUnknownCounts (optional Map opName→count)
 *  tracks unknown invocations across recursion depth.
 *  scriptContext = the source-file context to disambiguate same-name macros
 *  defined in different .inc files (= battle_script vs battle_ai vs event etc.) */
function emitOp(op, labelOffsets, warnings, depth = 0, fileUnknownCounts = null, scriptContext = 'common') {
  if (depth > 12) return []; // recursion guard
  // In-body label declaration (e.g. `\name:` inside meta-macro body) emits 0 bytes
  if (op._isLabel) return [];
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

  // Macro invocation? Resolve by context (= 1:1 décomp .include scoping).
  const macro = lookupMacro(opName, scriptContext);
  if (macro) {
    const bindings = bindArgs(macro.args, op.args);
    const out = [];
    for (const inner of macro.body) {
      const subbed = substituteArgs(inner, bindings);
      out.push(...emitOp(subbed, labelOffsets, warnings, depth + 1, fileUnknownCounts, scriptContext));
    }
    return out;
  }

  // C function-like macro invocation `FOO(BAR)` — these come from .inc files
  // that include C .h headers (e.g. constants/tms_hms.inc) and rely on the C
  // preprocessor to expand them. We don't do C preprocessing here; skip silently.
  if (/^[A-Z_]\w*\([^)]*\)$/.test(opName)) return [];

  // Unknown: skip + warn + count
  if (warnings && !opName.startsWith('.')) warnings.add(`unknown_op:${opName}`);
  if (fileUnknownCounts && !opName.startsWith('.')) {
    fileUnknownCounts.set(opName, (fileUnknownCounts.get(opName) || 0) + 1);
  }
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

/** Map script file path → macro context (= 1:1 décomp .include scoping). */
function getScriptContext(relInput) {
  const norm = relInput.replace(/\\/g, '/');
  if (norm.startsWith('data/battle_scripts')) return 'battle_script';
  if (norm.startsWith('data/battle_ai_scripts')) return 'battle_ai_script';
  if (norm.startsWith('data/battle_anim_scripts')) return 'battle_anim_script';
  if (norm.includes('battle_anim/')) return 'battle_anim_script';
  if (norm.startsWith('data/contest_ai_scripts')) return 'contest_ai_script';
  if (norm.startsWith('data/scripts')) return 'event';
  if (norm.includes('mystery_event')) return 'mystery_event_script';
  // Default : overworld event scripts (covers most data/maps/etc.).
  return 'event';
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

  const scriptContext = getScriptContext(relInput);

  // Pass 1: compute byteOffset per instr & per label
  let byteOffset = 0;
  const labelOffsetsP1 = new Map();
  const dummyWarnings = new Set();
  for (let i = 0; i < ops.length; i++) {
    if (instrIdxLabels.has(i)) {
      for (const l of instrIdxLabels.get(i)) labelOffsetsP1.set(l.name, byteOffset);
    }
    const bytes = emitOp(ops[i], labelOffsetsP1, dummyWarnings, 0, null, scriptContext);
    byteOffset += bytes.length;
  }

  // Pass 2: actual emit (warnings = Map opName → count occurrences this file)
  const bytes = [];
  const warnings = new Set();
  const fileUnknownCounts = new Map();
  for (let i = 0; i < ops.length; i++) {
    bytes.push(...emitOp(ops[i], labelOffsetsP1, warnings, 0, fileUnknownCounts, scriptContext));
  }
  for (const [k, v] of fileUnknownCounts) {
    unknownOpCounts.set(k, (unknownOpCounts.get(k) || 0) + v);
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
const unknownOpCounts = new Map(); // global tally
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

// Phase 1.3 G — export SYMBOLS_TABLE (= id → name mapping pour memory-map.ts).
const symbolsTableLines = [
  `// AUTO-GENERATED by compile-decomp-bytecode.mjs — Generated: ${NOW}`,
  `// Symbol table : maps id (= bytecode marker '0xF0000000 | id') to asm symbol name.`,
  `// Used by battle/memory-map.ts via bindSymbol(id, name).`,
  `// Phase 1.3 G : ${idToSymbol.length} symbols découverts.`,
  '',
  `export const SYMBOLS_TABLE: ReadonlyArray<{ id: number; name: string }> = [`,
  ...idToSymbol.map((name, id) => `  { id: ${id}, name: ${JSON.stringify(name)} },`),
  `];`,
  '',
  `export const SYMBOL_MARKER = 0xF0000000;`,
  `export const SYMBOL_MASK   = 0x0FFFFFFF;`,
  '',
];
writeFileSync(join(outRoot, '_symbols-table.ts'), symbolsTableLines.join('\n'));
console.log(`  Symbols table : ${idToSymbol.length} unique symbols → _symbols-table.ts`);

// All unknown ops (sorted desc)
const topUnknown = [...unknownOpCounts.entries()]
  .sort((a, b) => b[1] - a[1]);

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  inputCount: inputs.length,
  okCount, skipCount,
  totalStats,
  topUnknownOps: Object.fromEntries(topUnknown),
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

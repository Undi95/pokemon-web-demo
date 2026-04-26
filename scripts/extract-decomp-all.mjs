#!/usr/bin/env node
/**
 * extract-decomp-all.mjs
 * ----------------------
 * Pipeline EXHAUSTIF : parse TOUT le décomp pokeemeraude.
 *  - Tous les .c dans src/   → src/engine/decomp-data/auto/src/<name>-data.ts
 *  - Tous les .h dans include/ → src/engine/decomp-data/auto/include/<path>-data.ts
 *  - data/ et autres referenced via #include "data/..."
 *
 * Génère aussi _all-index.ts avec re-exports namespacés (no name conflicts).
 *
 * Patterns extraits par fichier (en plus de ceux de extract-decomp-scenes.mjs) :
 *   - Function pointer tables : static (T)(*const NAME[])(...) = { Func1, ... }
 *   - EWRAM_DATA / IWRAM_DATA / COMMON_DATA initial-value globals
 *   - Function declarations & definitions (name + return + arity)
 *   - Generic typed arrays : static const u8/u16/u32 NAME[] = { 1, 2, 3, ... }
 *   - OamData / SpriteTemplate / SpriteSheet / SpritePalette / AnimCmd structs
 *   - INCBIN_U8/U16/U32(path)
 *
 * Usage : node scripts/extract-decomp-all.mjs
 *
 * Volume attendu : ~500 .c + ~400 .h → ~900 fichiers générés.
 * Temps : 1-3 min sur SSD.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto');

const NOW = new Date().toISOString().slice(0, 10);

// ─── TS reserved keywords ─────────────────────────────────────────────────────
const TS_RESERVED = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete',
  'do','else','enum','export','extends','false','finally','for','function','if',
  'import','in','instanceof','new','null','return','super','switch','this','throw',
  'true','try','typeof','var','void','while','with','yield','as','async','await',
  'implements','interface','let','package','private','protected','public','static',
  'object','any','number','string','boolean','undefined','never','unknown','symbol',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseVal(s) {
  s = String(s).trim().replace(/[,;]$/, '').trim();
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^\(\s*-?\d+\s*\)$/.test(s)) return parseInt(s.replace(/[()]/g, ''), 10);
  if (s === 'TRUE') return 1;
  if (s === 'FALSE') return 0;
  if (s === 'NULL') return 0;
  return s;
}

function renderVal(v) {
  if (typeof v === 'number') return String(v);
  if (v === null || v === undefined) return '0';
  return JSON.stringify(String(v));
}

function isValidExportName(name) {
  if (!name) return false;
  if (TS_RESERVED.has(name)) return false;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function parseStructFields(body) {
  const fields = {};
  const re = /\.(\w+)\s*=\s*([^,}\n]+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    fields[m[1]] = parseVal(m[2]);
  }
  return fields;
}

function parseStructArray(body) {
  const items = [];
  let depth = 0, start = -1;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '{') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (body[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const inner = body.slice(start, i);
        const fields = parseStructFields(inner);
        if (Object.keys(fields).length > 0) items.push(fields);
        start = -1;
      }
    }
  }
  return items;
}

function extractTopLevelBraces(text, startIdx) {
  let depth = 0, i = startIdx;
  while (i < text.length) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(startIdx + 1, i);
    }
    i++;
  }
  return null;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

// Strip preprocessor directives (except #define) so they don't trip our regexes
function stripPpButKeepDefines(src) {
  return src.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') && !trimmed.startsWith('#define')) return '';
    return line;
  }).join('\n');
}

// ─── Pattern extractors (existing) ────────────────────────────────────────────

function extractDefines(src) {
  const defs = [];
  const seen = new Set();
  const re = /^[ \t]*#define[ \t]+(\w+)(?:[ \t]+([^\r\n]+))?[ \t]*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1].trim();
    if (!isValidExportName(name)) continue;
    if (seen.has(name)) continue;
    if (name.startsWith('GUARD_')) continue;
    let rawVal = (m[2] || '').trim()
      .replace(/\/\/.*$/, '')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
    if (!rawVal) continue;
    const fullMatch = m[0];
    if (/^[ \t]*#define[ \t]+\w+\(/m.test(fullMatch)) continue;
    const value = parseVal(rawVal);
    seen.add(name);
    defs.push({ name, rawVal, value });
  }
  return defs;
}

function extractEnums(src) {
  const enums = [];
  const re = /enum\s*(?:(\w+)\s*)?\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const enumName = m[1] || null;
    const body = m[2];
    const members = [];
    let idx = 0;
    for (const line of body.split(',')) {
      const part = line.trim().replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').trim();
      if (!part) continue;
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        const k = part.slice(0, eqIdx).trim();
        const v = parseVal(part.slice(eqIdx + 1).trim());
        if (typeof v === 'number') idx = v;
        if (k && isValidExportName(k)) members.push({ key: k, value: idx++ });
      } else if (part) {
        if (isValidExportName(part)) members.push({ key: part, value: idx++ });
        else idx++;
      }
    }
    if (members.length > 0) enums.push({ name: enumName, members });
  }
  return enums;
}

function extractTypedStructs(src, structName) {
  const result = {};
  const re = new RegExp(
    `(?:static\\s+)?(?:const\\s+)?struct\\s+${structName}\\s+(\\w+)(?:\\[[^\\]]*\\])?\\s*=\\s*\\{`,
    'g'
  );
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (!isValidExportName(name)) continue;
    const bodyStart = m.index + m[0].length - 1;
    const body = extractTopLevelBraces(src, bodyStart);
    if (!body) continue;
    const items = parseStructArray(body);
    if (items.length === 1) result[name] = items[0];
    else if (items.length > 1) result[name] = items;
    else {
      // Fallback: maybe single-struct (no inner braces)
      const fields = parseStructFields(body);
      if (Object.keys(fields).length > 0) result[name] = fields;
    }
  }
  return result;
}

function extractIncgfxRefs(src) {
  const result = [];
  const re = /(?:static\s+)?(?:const\s+)?(u\d+)\s+(\w+)\s*\[\s*\]\s*=\s*INCGFX_U\d+\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!isValidExportName(m[2])) continue;
    result.push({ type: m[1], name: m[2], path: m[3], ext: m[4] });
  }
  return result;
}

function extractInlinePalettes(src) {
  const result = {};
  const re = /(?:static\s+)?(?:const\s+)?u16\s+(\w+)\s*\[\s*\]\s*=\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (!isValidExportName(name)) continue;
    const body = m[2];
    if (!body.includes('RGB(') && !body.includes('RGB_BLACK') && !body.includes('RGB_WHITE')) continue;
    const colors = [];
    const tokenRe = /RGB\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)|RGB_BLACK|RGB_WHITE/g;
    let tk;
    while ((tk = tokenRe.exec(body)) !== null) {
      if (tk[0] === 'RGB_BLACK') colors.push({ r: 0, g: 0, b: 0 });
      else if (tk[0] === 'RGB_WHITE') colors.push({ r: 248, g: 248, b: 248 });
      else {
        const r = Math.min(255, parseInt(tk[1]) * 8);
        const g = Math.min(255, parseInt(tk[2]) * 8);
        const b = Math.min(255, parseInt(tk[3]) * 8);
        colors.push({ r, g, b });
      }
    }
    if (colors.length > 0) result[name] = colors;
  }
  return result;
}

function extractTextPointerArrays(src) {
  const result = {};
  const re = /(?:static\s+)?(?:const\s+)?u8\s*\*\s*(?:const\s+)?(\w+)\s*\[\s*[^\]]*\]\s*=\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (!isValidExportName(name)) continue;
    const body = m[2];
    if (!body.includes('gText_') && !body.includes('sText_')) continue;
    const ptrs = [];
    const itemRe = /\[\s*\w+\s*\]\s*=\s*(\w+)|(\w+)/g;
    let ir;
    while ((ir = itemRe.exec(body)) !== null) {
      const sym = (ir[1] || ir[2] || '').trim();
      if (sym.startsWith('gText_') || sym.startsWith('sText_')) ptrs.push(sym);
    }
    if (ptrs.length > 0) result[name] = ptrs;
  }
  return result;
}

function extractTaskNames(src) {
  const names = new Set();
  const re = /\b(?:static\s+)?void\s+(Task_\w+)\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) names.add(m[1]);
  return [...names].sort();
}

function extractCB2Names(src) {
  const names = new Set();
  const re = /\b(?:static\s+)?void\s+(CB2_\w+)\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) names.add(m[1]);
  return [...names].sort();
}

// ─── New pattern extractors ───────────────────────────────────────────────────

/** Function pointer tables — parses op-code dispatch tables.
 *  Pattern: (static)? T (*const)? NAME[]? = { Func1, Func2, ... };
 *  Captures function names and their order (= opcode index). */
function extractFuncPointerTables(src) {
  const result = {};
  // Match: (static)? returntype (*const)? identifier[(...)?]? = { ... };
  // Simplification: look for `*const NAME[])(` or `(*NAME[])(` pattern
  const re = /(?:static\s+)?(?:const\s+)?\w[\w\s*]*?\(\s*\*\s*(?:const\s+)?(\w+)\s*\[\s*\]\s*\)\s*\([^)]*\)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (!isValidExportName(name)) continue;
    const bodyStart = m.index + m[0].length - 1;
    const body = extractTopLevelBraces(src, bodyStart);
    if (!body) continue;
    // Parse function names: split by , and match identifier (skip [N] = prefix)
    const funcs = [];
    for (const part of body.split(',')) {
      const cleaned = part.trim()
        .replace(/\/\/.*$/, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\[\s*\w+\s*\]\s*=\s*/, '')
        .trim();
      if (!cleaned) continue;
      const fnMatch = cleaned.match(/^([A-Za-z_]\w*)/);
      if (fnMatch && fnMatch[1] !== 'NULL') funcs.push(fnMatch[1]);
      else if (cleaned.startsWith('NULL')) funcs.push(null);
    }
    if (funcs.length > 0) result[name] = funcs;
  }
  return result;
}

/** EWRAM/IWRAM/COMMON_DATA initialized variables */
function extractMemSegmentVars(src) {
  const result = [];
  const re = /(EWRAM_DATA|IWRAM_DATA|COMMON_DATA)\s+(?:static\s+)?(?:const\s+)?([\w\s*]+?)\s+(\w+)(\[[^\]]*\])?\s*=\s*([^;]+);/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const segment = m[1];
    const type = m[2].trim();
    const name = m[3];
    const arr = m[4] || '';
    let init = m[5].trim();
    if (!isValidExportName(name)) continue;
    // Truncate big initializers
    if (init.length > 200) init = init.slice(0, 200) + '...';
    result.push({ segment, type, name, isArray: !!arr, init });
  }
  return result;
}

/** Function declarations & definitions — captures all func names + return type + arity. */
function extractFunctions(src) {
  const result = [];
  const seen = new Set();
  // Match: (static)? returntype name(params) { OR (static)? returntype name(params);
  // returntype: starts with letter, may include u8/u16/u32/s8/s16/s32/void/bool8/etc + optional *
  const re = /\b(?:static\s+|inline\s+)*([A-Za-z_]\w*(?:\s*\*+)?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*[{;]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const ret = m[1].trim();
    const name = m[2];
    const params = m[3].trim();
    if (!isValidExportName(name)) continue;
    if (seen.has(name)) continue;
    // Skip control keywords misidentified as return type
    if (['if','for','while','switch','return','sizeof','case'].includes(ret)) continue;
    // Skip operators / common false positives
    if (name === 'main' && ret !== 'int') continue;
    seen.add(name);
    const arity = params === 'void' || params === '' ? 0 : params.split(',').length;
    result.push({ name, ret, arity, params });
  }
  return result;
}

/** Generic typed arrays of numeric literals.
 *  Pattern: static const u8/u16/u32 NAME[] = { 1, 2, 0x3, ... };
 *  Filters: keep only if all values are numeric (no identifiers). */
function extractNumericArrays(src) {
  const result = {};
  const re = /(?:static\s+)?(?:const\s+)?(u8|u16|u32|s8|s16|s32)\s+(\w+)\s*\[\s*\]\s*=\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const type = m[1];
    const name = m[2];
    if (!isValidExportName(name)) continue;
    const body = m[3];
    // Skip if contains RGB/INCGFX/identifier-only items
    if (body.includes('RGB(') || body.includes('INCGFX')) continue;
    const items = body.split(',').map(s => s.trim()).filter(Boolean);
    const nums = [];
    let allNumeric = true;
    for (const it of items) {
      const cleaned = it.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/, '').trim();
      if (!cleaned) continue;
      const v = parseVal(cleaned);
      if (typeof v !== 'number') { allNumeric = false; break; }
      nums.push(v);
    }
    if (allNumeric && nums.length > 0 && nums.length < 10000) {
      result[name] = { type, values: nums };
    }
  }
  return result;
}

/** INCBIN_U8/U16/U32 references */
function extractIncbinRefs(src) {
  const result = [];
  const re = /(?:static\s+)?(?:const\s+)?(u\d+)\s+(\w+)\s*\[\s*\]\s*=\s*INCBIN_U\d+\s*\(\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!isValidExportName(m[2])) continue;
    result.push({ type: m[1], name: m[2], path: m[3] });
  }
  return result;
}

/** #include directives — for dependency graph */
function extractIncludes(src) {
  const result = [];
  const re = /^[ \t]*#include\s+["<]([^">]+)[">]/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    result.push(m[1]);
  }
  return result;
}

// ─── TS code generators ──────────────────────────────────────────────────────

function renderDefines(defs) {
  if (!defs.length) return '';
  const lines = ['// ─── #define constants ──────────────────────────────────────────────────────'];
  const seen = new Set();
  for (const d of defs) {
    if (seen.has(d.name)) continue;
    seen.add(d.name);
    if (typeof d.value === 'number') {
      lines.push(`export const ${d.name} = ${d.value};`);
    } else {
      lines.push(`/** Raw expr: \`${String(d.value).replace(/`/g, '\\`')}\` */`);
      lines.push(`export const ${d.name}_EXPR = ${JSON.stringify(String(d.value))};`);
    }
  }
  return lines.join('\n');
}

function renderEnums(enums) {
  if (!enums.length) return '';
  const lines = ['// ─── Enums ───────────────────────────────────────────────────────────────────'];
  let unnamedIdx = 0;
  const seen = new Set();
  for (const e of enums) {
    let name = e.name ? `ENUM_${e.name}` : `ENUM_${e.members[0].key.split('_')[0] || 'X'}_${unnamedIdx++}`;
    while (seen.has(name)) name = `${name}_${unnamedIdx++}`;
    seen.add(name);
    if (!isValidExportName(name)) continue;
    lines.push(`export const ${name} = {`);
    const memberSeen = new Set();
    for (const member of e.members) {
      if (memberSeen.has(member.key)) continue;
      memberSeen.add(member.key);
      lines.push(`  ${member.key}: ${member.value},`);
    }
    lines.push('} as const;');
  }
  return lines.join('\n');
}

function renderObject(obj) {
  return '{ ' + Object.entries(obj).map(([k, v]) => `${k}: ${renderVal(v)}`).join(', ') + ' }';
}

function renderTypedStructs(structName, items) {
  if (!Object.keys(items).length) return '';
  const lines = [`// ─── ${structName} ─────────────────────────────────────────────────────────────`];
  for (const [name, val] of Object.entries(items)) {
    if (Array.isArray(val)) {
      lines.push(`export const ${name} = [`);
      for (const item of val) lines.push(`  ${renderObject(item)},`);
      lines.push('] as const;');
    } else {
      lines.push(`export const ${name} = ${renderObject(val)} as const;`);
    }
  }
  return lines.join('\n');
}

function renderGfxRefs(refs) {
  if (!refs.length) return '';
  const lines = [
    '// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────',
    'export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {',
  ];
  for (const g of refs) lines.push(`  '${g.name}': { path: '${g.path}', ext: '${g.ext}', type: '${g.type}' },`);
  lines.push('};');
  return lines.join('\n');
}

function renderIncbinRefs(refs) {
  if (!refs.length) return '';
  const lines = [
    '// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────',
    'export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {',
  ];
  for (const r of refs) lines.push(`  '${r.name}': { path: '${r.path}', type: '${r.type}' },`);
  lines.push('};');
  return lines.join('\n');
}

function renderInlinePalettes(pals) {
  if (!Object.keys(pals).length) return '';
  const lines = ['// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────'];
  for (const [name, colors] of Object.entries(pals)) {
    const arr = colors.map(c => `{r:${c.r},g:${c.g},b:${c.b}}`).join(', ');
    lines.push(`export const ${name}_COLORS = [${arr}] as const;`);
  }
  return lines.join('\n');
}

function renderTextPointerArrays(arrs) {
  if (!Object.keys(arrs).length) return '';
  const lines = ['// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────'];
  for (const [name, ptrs] of Object.entries(arrs)) {
    const arr = ptrs.map(p => `'${p}'`).join(', ');
    lines.push(`export const ${name} = [${arr}] as const;`);
  }
  return lines.join('\n');
}

function renderTaskNames(names) {
  if (!names.length) return '';
  return [
    '// ─── Task_* (state machine entry points) ────────────────────────────────────',
    'export const TASK_NAMES = [',
    ...names.map(n => `  '${n}',`),
    '] as const;',
  ].join('\n');
}

function renderCB2Names(names) {
  if (!names.length) return '';
  return [
    '// ─── CB2_* (callback / scene entry points) ──────────────────────────────────',
    'export const CB2_NAMES = [',
    ...names.map(n => `  '${n}',`),
    '] as const;',
  ].join('\n');
}

function renderFuncPointerTables(tables) {
  if (!Object.keys(tables).length) return '';
  const lines = ['// ─── Function pointer tables (opcode dispatch) ──────────────────────────────'];
  for (const [name, funcs] of Object.entries(tables)) {
    const arr = funcs.map(f => f === null ? 'null' : `'${f}'`).join(', ');
    lines.push(`export const ${name} = [${arr}] as const;`);
  }
  return lines.join('\n');
}

function renderMemSegmentVars(vars) {
  if (!vars.length) return '';
  const lines = ['// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────'];
  lines.push('export const SEGMENT_VARS = [');
  for (const v of vars) {
    lines.push(`  { segment: '${v.segment}', type: ${JSON.stringify(v.type)}, name: '${v.name}', isArray: ${v.isArray}, init: ${JSON.stringify(v.init)} },`);
  }
  lines.push('] as const;');
  return lines.join('\n');
}

function renderFunctions(funcs) {
  if (!funcs.length) return '';
  const lines = ['// ─── Functions (declarations + definitions) ─────────────────────────────────'];
  lines.push('export const FUNCTIONS = [');
  for (const f of funcs) {
    lines.push(`  { name: '${f.name}', ret: ${JSON.stringify(f.ret)}, arity: ${f.arity}, params: ${JSON.stringify(f.params)} },`);
  }
  lines.push('] as const;');
  return lines.join('\n');
}

function renderNumericArrays(arrs) {
  if (!Object.keys(arrs).length) return '';
  const lines = ['// ─── Numeric arrays (raw data tables) ───────────────────────────────────────'];
  for (const [name, info] of Object.entries(arrs)) {
    // For very long arrays, emit a summary + length
    if (info.values.length > 256) {
      lines.push(`/** ${info.type} array of ${info.values.length} values (truncated; first 256 shown) */`);
      lines.push(`export const ${name}: readonly number[] = [${info.values.slice(0, 256).join(',')}] as const;`);
      lines.push(`export const ${name}_LENGTH = ${info.values.length};`);
    } else {
      lines.push(`export const ${name}: readonly number[] = [${info.values.join(',')}] as const;`);
    }
  }
  return lines.join('\n');
}

function renderIncludes(includes) {
  if (!includes.length) return '';
  return [
    '// ─── #include directives (dependency graph) ─────────────────────────────────',
    'export const INCLUDES = [',
    ...includes.map(i => `  '${i}',`),
    '] as const;',
  ].join('\n');
}

// ─── Output path mirror (decomp file → TS path) ─────────────────────────────

function getOutputPath(relInput) {
  // relInput like "src/main.c" or "include/constants/songs.h"
  // → "src/main-data.ts" or "include/constants/songs-data.ts"
  const parts = relInput.split(/[\\/]/);
  const fileName = parts.pop();
  const stem = fileName.replace(/\.(c|h)$/, '');
  return [...parts, `${stem}-data.ts`].join('/');
}

/** Build a unique TS-safe namespace name from a path.
 *  "src/battle_anim.c" → "srcBattleAnim"
 *  "include/constants/songs.h" → "includeConstantsSongs" */
function getNamespaceName(relInput) {
  const noExt = relInput.replace(/\.(c|h)$/, '');
  const parts = noExt.split(/[\\/_]/);
  return parts
    .filter(Boolean)
    .map((p, i) => i === 0 ? p.toLowerCase() : (p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');
}

// ─── Per-file processor ──────────────────────────────────────────────────────

function processFile(absPath, relInput) {
  let rawSrc;
  try { rawSrc = readFileSync(absPath, 'utf8'); }
  catch { return null; }

  if (!rawSrc.trim()) return null;

  const src = stripComments(rawSrc);
  const srcNoPp = stripPpButKeepDefines(src);

  const sections = [];
  const exports = new Set();
  const stats = {};

  // 1. #defines (from raw source — preserves #define lines)
  try {
    const defs = extractDefines(rawSrc);
    if (defs.length) {
      sections.push(renderDefines(defs));
      stats.defines = defs.length;
      for (const d of defs) exports.add(typeof d.value === 'number' ? d.name : `${d.name}_EXPR`);
    }
  } catch (e) { /* swallow */ }

  // 2. Enums
  try {
    const enums = extractEnums(srcNoPp);
    if (enums.length) {
      const r = renderEnums(enums);
      sections.push(r);
      stats.enums = enums.length;
      const wrapperRe = /^export const (ENUM_\w+) = \{$/gm;
      let mw;
      while ((mw = wrapperRe.exec(r)) !== null) exports.add(mw[1]);
    }
  } catch (e) { /* swallow */ }

  // 3. Typed structs (multiple known struct types)
  for (const sname of [
    'WindowTemplate', 'BgTemplate', 'OamData', 'SpriteTemplate',
    'SpriteSheet', 'CompressedSpriteSheet', 'SpritePalette',
    'CompressedSpritePalette', 'SubspriteTable', 'AnimCmd',
    'MenuAction', 'WindowConfig',
  ]) {
    try {
      const items = extractTypedStructs(srcNoPp, sname);
      if (Object.keys(items).length) {
        sections.push(renderTypedStructs(sname, items));
        stats[sname] = Object.keys(items).length;
        for (const k of Object.keys(items)) exports.add(k);
      }
    } catch (e) { /* swallow */ }
  }

  // 4. INCGFX refs
  try {
    const refs = extractIncgfxRefs(srcNoPp);
    if (refs.length) {
      sections.push(renderGfxRefs(refs));
      stats.gfx = refs.length;
      exports.add('GFX_SOURCES');
    }
  } catch (e) { /* swallow */ }

  // 5. INCBIN refs
  try {
    const refs = extractIncbinRefs(srcNoPp);
    if (refs.length) {
      sections.push(renderIncbinRefs(refs));
      stats.incbin = refs.length;
      exports.add('INCBIN_SOURCES');
    }
  } catch (e) { /* swallow */ }

  // 6. Inline palettes
  try {
    const pals = extractInlinePalettes(srcNoPp);
    if (Object.keys(pals).length) {
      sections.push(renderInlinePalettes(pals));
      stats.palettes = Object.keys(pals).length;
      for (const k of Object.keys(pals)) exports.add(`${k}_COLORS`);
    }
  } catch (e) { /* swallow */ }

  // 7. Text pointer arrays
  try {
    const tpa = extractTextPointerArrays(srcNoPp);
    if (Object.keys(tpa).length) {
      sections.push(renderTextPointerArrays(tpa));
      stats.textArrays = Object.keys(tpa).length;
      for (const k of Object.keys(tpa)) exports.add(k);
    }
  } catch (e) { /* swallow */ }

  // 8. Numeric arrays
  try {
    const arrs = extractNumericArrays(srcNoPp);
    if (Object.keys(arrs).length) {
      sections.push(renderNumericArrays(arrs));
      stats.numericArrays = Object.keys(arrs).length;
      for (const k of Object.keys(arrs)) {
        exports.add(k);
        if (arrs[k].values.length > 256) exports.add(`${k}_LENGTH`);
      }
    }
  } catch (e) { /* swallow */ }

  // 9. Function pointer tables
  try {
    const tables = extractFuncPointerTables(srcNoPp);
    if (Object.keys(tables).length) {
      sections.push(renderFuncPointerTables(tables));
      stats.funcPtrTables = Object.keys(tables).length;
      for (const k of Object.keys(tables)) exports.add(k);
    }
  } catch (e) { /* swallow */ }

  // 10. EWRAM/IWRAM/COMMON_DATA segment vars
  try {
    const vars = extractMemSegmentVars(rawSrc);
    if (vars.length) {
      sections.push(renderMemSegmentVars(vars));
      stats.segmentVars = vars.length;
      exports.add('SEGMENT_VARS');
    }
  } catch (e) { /* swallow */ }

  // 11. Functions
  try {
    const funcs = extractFunctions(srcNoPp);
    if (funcs.length) {
      sections.push(renderFunctions(funcs));
      stats.functions = funcs.length;
      exports.add('FUNCTIONS');
    }
  } catch (e) { /* swallow */ }

  // 12. Task names
  try {
    const tasks = extractTaskNames(srcNoPp);
    if (tasks.length) {
      sections.push(renderTaskNames(tasks));
      stats.tasks = tasks.length;
      exports.add('TASK_NAMES');
    }
  } catch (e) { /* swallow */ }

  // 13. CB2 names
  try {
    const cb2s = extractCB2Names(srcNoPp);
    if (cb2s.length) {
      sections.push(renderCB2Names(cb2s));
      stats.cb2 = cb2s.length;
      exports.add('CB2_NAMES');
    }
  } catch (e) { /* swallow */ }

  // 14. #include graph
  try {
    const incs = extractIncludes(rawSrc);
    if (incs.length) {
      sections.push(renderIncludes(incs));
      stats.includes = incs.length;
      exports.add('INCLUDES');
    }
  } catch (e) { /* swallow */ }

  const body = sections.filter(Boolean).join('\n\n');
  if (!body.trim()) return null;

  const header = [
    `// AUTO-GENERATED from ${relInput.replace(/\\/g, '/')} by extract-decomp-all.mjs`,
    `// Do not edit manually — re-run \`npm run extract:decomp-all\` to refresh.`,
    `//`,
    `// Source: ${absPath.replace(/\\/g, '/')}`,
    `// Generated: ${NOW}`,
    '',
  ].join('\n');

  return { header, body, exports: [...exports], stats };
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log(`[extract-decomp-all] Source: ${decompRoot}`);
console.log(`[extract-decomp-all] Output: ${outRoot}`);

if (!existsSync(decompRoot)) {
  console.error(`[extract-decomp-all] FATAL: decomp not found at ${decompRoot}`);
  process.exit(1);
}

// Wipe & recreate output dir
if (existsSync(outRoot)) {
  rmSync(outRoot, { recursive: true, force: true });
}
mkdirSync(outRoot, { recursive: true });

// Discover inputs (use forward-slash for portability with Glob results)
const cFiles = globSync('src/**/*.c', { cwd: decompRoot });
const hFiles = globSync('include/**/*.h', { cwd: decompRoot });
const dataFiles = globSync('data/**/*.h', { cwd: decompRoot });
const allInputs = [...cFiles, ...hFiles, ...dataFiles];

console.log(`[extract-decomp-all] Found: ${cFiles.length} .c + ${hFiles.length} include .h + ${dataFiles.length} data .h = ${allInputs.length} files`);

let okCount = 0, skipCount = 0, errCount = 0;
const totalStats = {};
const indexEntries = []; // { ns, outRel, exportCount }
const usedNames = new Map(); // namespace name → counter

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

  // Build unique namespace name
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
  indexEntries.push({ ns, outRel: outRel.replace(/\.ts$/, ''), exportCount: result.exports.length });
}

// ─── Build _all-index.ts ─────────────────────────────────────────────────────

const indexLines = [
  `// AUTO-GENERATED by extract-decomp-all.mjs — Generated: ${NOW}`,
  `// Re-export every per-file module under a unique namespace.`,
  `// Usage: import { srcMain } from '@/engine/decomp-data/auto/_all-index'`,
  `//        srcMain.SCRIPT_CMD_TABLE; srcMain.FUNCTIONS; etc.`,
  '',
];
indexEntries.sort((a, b) => a.outRel.localeCompare(b.outRel));
for (const e of indexEntries) {
  indexLines.push(`export * as ${e.ns} from './${e.outRel}';`);
}
indexLines.push('');

writeFileSync(join(outRoot, '_all-index.ts'), indexLines.join('\n'));

// ─── Build _stats.json + _files.json ─────────────────────────────────────────

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  inputCount: allInputs.length,
  okCount, skipCount, errCount,
  totalStats,
  durationMs: Date.now() - startTime,
}, null, 2));

writeFileSync(join(outRoot, '_files.json'), JSON.stringify(
  indexEntries.map(e => ({ ns: e.ns, file: e.outRel, exports: e.exportCount })),
  null, 2
));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[extract-decomp-all] Done in ${elapsed}s`);
console.log(`  OK: ${okCount}  Skipped: ${skipCount}  Err: ${errCount}`);
console.log(`  Total exports across all files:`);
for (const [k, v] of Object.entries(totalStats).sort()) {
  console.log(`    ${k.padEnd(18)} ${v}`);
}
console.log(`  Output: ${outRoot.replace(/\\/g, '/')}`);
console.log(`  Index:  ${outRoot.replace(/\\/g, '/')}/_all-index.ts`);

#!/usr/bin/env node
/**
 * extract-decomp-scenes.mjs
 * --------------------------
 * Pipeline d'extraction : parse les .c "scène" du décomp et génère
 * src/engine/decomp-data/<scene>-data.ts pour chacun.
 *
 * Patterns extraits de chaque .c :
 *  1. static const struct WindowTemplate <name>[]  → WIN_TEMPLATES
 *  2. static const struct BgTemplate <name>[]      → BG_TEMPLATES
 *  3. INCGFX_U16(..., ".gbapal")                   → palette source paths
 *  4. INCGFX_U8(..., ".4bpp"|".lz")                → gfx source paths
 *  5. {RGB(r,g,b)...} inline palettes              → RGBA arrays
 *  6. #define NAME value                           → constantes
 *  7. enum { ... }                                 → enum objects
 *  8. static const u8 *const name[COUNT]           → text pointer arrays
 *  9. FillBgTilemapBufferRect calls                → FRAME_LAYOUT (top-level only)
 * 10. BeginNormalPaletteFade calls                 → FADES (top-level only)
 * 11. Task_* function names                        → task list
 * 12. CB2_* function names                         → callback list
 *
 * Usage : node scripts/extract-decomp-scenes.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data');
mkdirSync(outDir, { recursive: true });

const NOW = new Date().toISOString().slice(0, 10);

// ─── Scene definitions ────────────────────────────────────────────────────────
const SCENES = [
  { key: 'option-menu',    file: 'src/option_menu.c' },
  { key: 'main-menu',      file: 'src/main_menu.c' },
  { key: 'naming-screen',  file: 'src/naming_screen.c' },
  { key: 'start-menu',     file: 'src/start_menu.c' },
  { key: 'party-menu',     file: 'src/party_menu.c' },
  { key: 'save',           file: 'src/save.c' },
  // 'intro' retiré : intro.c relocalisé 1:1 dans src/intro.ts (constantes #define inline,
  // data tables inline, sprites relocalisés). Plus de decomp-data/intro-data.ts.
  // 'title-screen' retiré : title_screen.c #define inline dans src/title_screen.ts.
  { key: 'new-game',       file: 'src/new_game.c' },
  { key: 'text-window',    file: 'src/text_window.c' },
  { key: 'menu',           file: 'src/menu.c' },
  { key: 'text',           file: 'src/text.c' },
  { key: 'window',         file: 'src/window.c' },
  { key: 'credits',        file: 'src/credits.c' },
];

// TS reserved keywords + JS globals that should not be used as exports
const TS_RESERVED = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete',
  'do','else','enum','export','extends','false','finally','for','function','if',
  'import','in','instanceof','new','null','return','super','switch','this','throw',
  'true','try','typeof','var','void','while','with','yield','as','async','await',
  'implements','interface','let','package','private','protected','public','static',
  'object','any','number','string','boolean','undefined','never','unknown','symbol',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safe: parse a C value literal to JS number or string. */
function parseVal(s) {
  s = String(s).trim().replace(/[,;]$/, '').trim();
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^\(\s*-?\d+\s*\)$/.test(s)) return parseInt(s.replace(/[()]/g, ''), 10);
  if (s === 'TRUE') return 1;
  if (s === 'FALSE') return 0;
  return s; // identifier/expression
}

/** Render a value for inline use in a TS object literal.
 *  Numbers passed through; identifiers/expressions wrapped as a comment-quoted string. */
function renderVal(v) {
  if (typeof v === 'number') return String(v);
  if (v === null || v === undefined) return '0';
  // Quote any non-numeric expression to keep TS valid
  return JSON.stringify(String(v));
}

/** Validate identifier as exportable TS name. */
function isValidExportName(name) {
  if (!name) return false;
  if (TS_RESERVED.has(name)) return false;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** Parse struct fields from { .field = val, ... } body. */
function parseStructFields(body) {
  const fields = {};
  // Match .name = value where value goes up to , } or end of line
  const re = /\.(\w+)\s*=\s*([^,}\n]+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    fields[m[1]] = parseVal(m[2]);
  }
  return fields;
}

/** Parse a { ... } body that may contain nested structs → array. */
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

/** Extract the content of a top-level C array definition body. */
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

/** Strip C-style comments. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

/** Compute brace depth at a given index in source. */
function depthAt(src, idx) {
  let depth = 0;
  for (let i = 0; i < idx; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
  }
  return depth;
}

// ─── Pattern extractors ───────────────────────────────────────────────────────

function extractDefines(src) {
  const defs = [];
  const seen = new Set();
  // Use [ \t]+ instead of \s+ to avoid swallowing newlines
  const re = /^[ \t]*#define[ \t]+(\w+)(?:[ \t]+([^\r\n]+))?[ \t]*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1].trim();
    if (!isValidExportName(name)) continue;
    if (seen.has(name)) continue;          // first definition wins
    if (name.startsWith('GUARD_')) continue; // include guards
    let rawVal = (m[2] || '').trim()
      .replace(/\/\/.*$/, '')
      .replace(/\/\*.*?\*\//g, '')
      .trim();
    if (!rawVal) continue;                 // value-less define
    // Skip function-like macros (# define X(a, b) ...) — they look like X(a) value
    // Detect macro-with-args by checking the source line directly
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

function extractWindowTemplates(src) {
  const result = {};
  const re = /(?:static\s+)?(?:const\s+)?struct\s+WindowTemplate\s+(\w+)(?:\[[^\]]*\])?\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (!isValidExportName(name)) continue;
    const bodyStart = m.index + m[0].length - 1;
    const body = extractTopLevelBraces(src, bodyStart);
    if (!body) continue;
    const items = parseStructArray(body);
    // Filter DUMMY_WIN_TEMPLATE (bg=0xFF or empty)
    const filtered = items.filter(it => it.bg !== 0xFF && it.bg !== 255 && Object.keys(it).length > 0);
    if (filtered.length === 1) result[name] = filtered[0];
    else if (filtered.length > 1) result[name] = filtered;
  }
  return result;
}

function extractBgTemplates(src) {
  const result = {};
  const re = /(?:static\s+)?(?:const\s+)?struct\s+BgTemplate\s+(\w+)(?:\[[^\]]*\])?\s*=\s*\{/g;
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

/** Extract inline palette arrays: u16 name[] = { RGB(r,g,b), ... } */
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
    // Walk the body and pick up RGB() calls and RGB_BLACK/RGB_WHITE in order
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

/** Extract text pointer arrays: static const u8 *const name[N] = { gText_..., ... } */
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

/** Extract FillBgTilemapBufferRect calls — only at top level (struct/array initializers).
 *  Function-body calls have variables (template->bg, x+1) that aren't useful as data. */
function extractFillBgCalls(src) {
  const calls = [];
  const re = /FillBgTilemapBufferRect\s*\(\s*([^)]+)\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const args = m[1].split(',').map(a => a.trim());
    if (args.length < 7) continue;
    // Skip calls inside generic functions: any arg containing -> or non-trivial expressions
    const argsStr = args.join('|');
    if (argsStr.includes('->') || argsStr.includes('++')) continue;
    // Skip if any arg is just a function-local variable name we can't resolve
    // Heuristic: keep if x/y/w/h are numeric or a SCREAMING_SNAKE_CASE constant
    calls.push({
      bg: parseVal(args[0]),
      tile: parseVal(args[1]),
      x: parseVal(args[2]),
      y: parseVal(args[3]),
      w: parseVal(args[4]),
      h: parseVal(args[5]),
      palNum: parseVal(args[6]),
    });
  }
  return calls;
}

/** Extract BeginNormalPaletteFade calls — only top-level numeric ones. */
function extractPaletteFades(src) {
  const calls = [];
  const re = /BeginNormalPaletteFade\s*\(\s*([^)]+)\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const args = m[1].split(',').map(a => a.trim());
    if (args.length < 5) continue;
    calls.push({
      palettes: args[0],
      delay: parseVal(args[1]),
      startY: parseVal(args[2]),
      endY: parseVal(args[3]),
      color: args[4],
    });
  }
  return calls;
}

function extractTaskNames(src) {
  const names = new Set();
  // Match function declarations: static void Task_Foo(...) { or void Task_Foo(...) {
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

// ─── TS code generator ────────────────────────────────────────────────────────

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
      // String expression — emit as commented string literal so consumer can read intent
      lines.push(`/** Raw expr from .c (can't be evaluated): \`${d.value}\` */`);
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

function renderObject(obj, defineMap = null) {
  return '{ ' + Object.entries(obj).map(([k, v]) => {
    // If value is a string identifier and we have a numeric define for it, inline
    if (defineMap && typeof v === 'string' && Object.prototype.hasOwnProperty.call(defineMap, v)) {
      return `${k}: ${defineMap[v]}`;
    }
    return `${k}: ${renderVal(v)}`;
  }).join(', ') + ' }';
}

function renderWindowTemplates(templates, defineMap = null) {
  if (!Object.keys(templates).length) return '';
  const lines = ['// ─── WindowTemplates ─────────────────────────────────────────────────────────'];
  for (const [name, val] of Object.entries(templates)) {
    if (Array.isArray(val)) {
      lines.push(`export const ${name} = [`);
      for (const item of val) lines.push(`  ${renderObject(item, defineMap)},`);
      lines.push('] as const;');
    } else {
      lines.push(`export const ${name} = ${renderObject(val, defineMap)} as const;`);
    }
  }
  return lines.join('\n');
}

function renderBgTemplates(templates, defineMap = null) {
  if (!Object.keys(templates).length) return '';
  const lines = ['// ─── BgTemplates ─────────────────────────────────────────────────────────────'];
  for (const [name, val] of Object.entries(templates)) {
    if (Array.isArray(val)) {
      lines.push(`export const ${name} = [`);
      for (const item of val) lines.push(`  ${renderObject(item, defineMap)},`);
      lines.push('] as const;');
    } else {
      lines.push(`export const ${name} = ${renderObject(val, defineMap)} as const;`);
    }
  }
  return lines.join('\n');
}

function renderGfxRefs(refs) {
  if (!refs.length) return '';
  const lines = [
    '// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────',
    '// Use these paths at runtime to load assets from the decomp graphics directory.',
    `export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {`,
  ];
  for (const g of refs) {
    lines.push(`  '${g.name}': { path: '${g.path}', ext: '${g.ext}', type: '${g.type}' },`);
  }
  lines.push('};');
  return lines.join('\n');
}

function renderInlinePalettes(pals) {
  if (!Object.keys(pals).length) return '';
  const lines = ['// ─── Inline palettes (RGB(r,g,b) → RGB888 via ×8) ──────────────────────────'];
  for (const [name, colors] of Object.entries(pals)) {
    const arr = colors.map(c => `{r:${c.r},g:${c.g},b:${c.b}}`).join(', ');
    lines.push(`export const ${name}_COLORS = [${arr}] as const;`);
  }
  return lines.join('\n');
}

function renderTextPointerArrays(arrs) {
  if (!Object.keys(arrs).length) return '';
  const lines = ['// ─── Text pointer arrays (gText_* string keys) ──────────────────────────────'];
  for (const [name, ptrs] of Object.entries(arrs)) {
    const arr = ptrs.map(p => `'${p}'`).join(', ');
    lines.push(`export const ${name} = [${arr}] as const;`);
  }
  return lines.join('\n');
}

function renderFillCalls(calls) {
  if (!calls.length) return '';
  const lines = [
    '// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─',
    'export const FILL_BG_CALLS = [',
  ];
  for (const c of calls) {
    lines.push(`  { bg: ${renderVal(c.bg)}, tile: ${renderVal(c.tile)}, x: ${renderVal(c.x)}, y: ${renderVal(c.y)}, w: ${renderVal(c.w)}, h: ${renderVal(c.h)}, palNum: ${renderVal(c.palNum)} },`);
  }
  lines.push('] as const;');
  return lines.join('\n');
}

function renderFades(fades) {
  if (!fades.length) return '';
  const lines = [
    '// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────',
    'export const PALETTE_FADES = [',
  ];
  for (const f of fades) {
    lines.push(`  { palettes: ${JSON.stringify(String(f.palettes))}, delay: ${renderVal(f.delay)}, startY: ${renderVal(f.startY)}, endY: ${renderVal(f.endY)}, color: ${JSON.stringify(String(f.color))} },`);
  }
  lines.push('] as const;');
  return lines.join('\n');
}

function renderTaskNames(names) {
  if (!names.length) return '';
  const lines = [
    '// ─── Task_* functions (state machine steps) ─────────────────────────────────',
    '// Function bodies require manual transcription; these names identify each step.',
    'export const TASK_NAMES = [',
    ...names.map(n => `  '${n}',`),
    '] as const;',
  ];
  return lines.join('\n');
}

function renderCB2Names(names) {
  if (!names.length) return '';
  const lines = [
    '// ─── CB2_* (callback / scene entry points) ──────────────────────────────────',
    'export const CB2_NAMES = [',
    ...names.map(n => `  '${n}',`),
    '] as const;',
  ];
  return lines.join('\n');
}

// ─── Main per-file processor ──────────────────────────────────────────────────

function processScene(scene) {
  const absPath = join(decompRoot, scene.file);
  if (!existsSync(absPath)) {
    console.warn(`[extract-decomp-scenes] SKIP ${scene.file} — file not found`);
    return null;
  }

  const rawSrc = readFileSync(absPath, 'utf8');
  const src = stripComments(rawSrc);

  const sections = [];
  const exports = new Set();
  let exportCount = 0;

  const addExports = (names) => {
    for (const n of names) exports.add(n);
  };

  // 1. #define constants (use raw src so #define lines aren't damaged by comment stripping)
  // Build defineMap (numeric only) used to inline references in struct templates
  let defineMap = {};
  try {
    const defs = extractDefines(rawSrc);
    if (defs.length) {
      sections.push(renderDefines(defs));
      exportCount += defs.length;
      addExports(defs.map(d => typeof d.value === 'number' ? d.name : `${d.name}_EXPR`));
      for (const d of defs) {
        if (typeof d.value === 'number') defineMap[d.name] = d.value;
      }
    }
  } catch (e) { console.warn(`[${scene.key}] defines error:`, e.message); }

  // 2. Enums (track only the wrapper ENUM_X identifier, not member names)
  try {
    const enums = extractEnums(src);
    if (enums.length) {
      const rendered = renderEnums(enums);
      sections.push(rendered);
      exportCount += enums.length;
      // Track exported wrapper names: ENUM_X
      const wrapperRe = /^export const (ENUM_\w+) = \{$/gm;
      let mw;
      while ((mw = wrapperRe.exec(rendered)) !== null) exports.add(mw[1]);
    }
  } catch (e) { console.warn(`[${scene.key}] enums error:`, e.message); }

  // 3. WindowTemplates (resolve identifier references to numeric defines in same file)
  try {
    const wt = extractWindowTemplates(src);
    if (Object.keys(wt).length) {
      sections.push(renderWindowTemplates(wt, defineMap));
      exportCount += Object.keys(wt).length;
      addExports(Object.keys(wt));
    }
  } catch (e) { console.warn(`[${scene.key}] window templates error:`, e.message); }

  // 4. BgTemplates (same identifier resolution)
  try {
    const bt = extractBgTemplates(src);
    if (Object.keys(bt).length) {
      sections.push(renderBgTemplates(bt, defineMap));
      exportCount += Object.keys(bt).length;
      addExports(Object.keys(bt));
    }
  } catch (e) { console.warn(`[${scene.key}] bg templates error:`, e.message); }

  // 5. INCGFX refs
  try {
    const refs = extractIncgfxRefs(src);
    if (refs.length) {
      sections.push(renderGfxRefs(refs));
      exportCount++;
      exports.add('GFX_SOURCES');
    }
  } catch (e) { console.warn(`[${scene.key}] incgfx error:`, e.message); }

  // 6. Inline palettes
  try {
    const pals = extractInlinePalettes(src);
    if (Object.keys(pals).length) {
      sections.push(renderInlinePalettes(pals));
      exportCount += Object.keys(pals).length;
      addExports(Object.keys(pals).map(k => `${k}_COLORS`));
    }
  } catch (e) { console.warn(`[${scene.key}] inline palettes error:`, e.message); }

  // 7. Text pointer arrays
  try {
    const tpa = extractTextPointerArrays(src);
    if (Object.keys(tpa).length) {
      sections.push(renderTextPointerArrays(tpa));
      exportCount += Object.keys(tpa).length;
      addExports(Object.keys(tpa));
    }
  } catch (e) { console.warn(`[${scene.key}] text ptr arrays error:`, e.message); }

  // 8. FillBgTilemapBufferRect (top-level only)
  try {
    const fills = extractFillBgCalls(src);
    if (fills.length) {
      sections.push(renderFillCalls(fills));
      exportCount++;
      exports.add('FILL_BG_CALLS');
    }
  } catch (e) { console.warn(`[${scene.key}] fill bg calls error:`, e.message); }

  // 9. PaletteFades
  try {
    const fades = extractPaletteFades(src);
    if (fades.length) {
      sections.push(renderFades(fades));
      exportCount++;
      exports.add('PALETTE_FADES');
    }
  } catch (e) { console.warn(`[${scene.key}] palette fades error:`, e.message); }

  // 10. Task names
  try {
    const tasks = extractTaskNames(src);
    if (tasks.length) {
      sections.push(renderTaskNames(tasks));
      exportCount++;
      exports.add('TASK_NAMES');
    }
  } catch (e) { console.warn(`[${scene.key}] task names error:`, e.message); }

  // 11. CB2 names
  try {
    const cb2s = extractCB2Names(src);
    if (cb2s.length) {
      sections.push(renderCB2Names(cb2s));
      exportCount++;
      exports.add('CB2_NAMES');
    }
  } catch (e) { console.warn(`[${scene.key}] CB2 names error:`, e.message); }

  // Assemble file
  const header = [
    `// AUTO-GENERATED from ${scene.file} by extract-decomp-scenes.mjs`,
    `// Do not edit manually — re-run \`npm run extract:decomp-scenes\` to refresh.`,
    `//`,
    `// Source: ${absPath.replace(/\\/g, '/')}`,
    `// Generated: ${NOW}`,
    '',
  ].join('\n');

  const body = sections.filter(Boolean).join('\n\n');
  if (!body.trim()) {
    console.warn(`[${scene.key}] No exports extracted — skipping file`);
    return { key: scene.key, exportCount: 0, exports: [] };
  }

  const outFile = join(outDir, `${scene.key}-data.ts`);
  writeFileSync(outFile, header + '\n' + body + '\n');
  console.log(`[extract-decomp-scenes] OK ${scene.key}-data.ts (${exportCount} exports)`);
  return { key: scene.key, exportCount, exports: [...exports] };
}

// ─── _common-constants.ts (characters.h + rgb.h + songs.h) ──────────────────

function buildCommonConstants() {
  const sources = [
    'include/constants/characters.h',
    'include/constants/rgb.h',
    'include/constants/songs.h',
  ];

  const allDefs = [];
  const allEnums = [];
  const seenNames = new Set();
  const exports = new Set();

  for (const src of sources) {
    const absPath = join(decompRoot, src);
    if (!existsSync(absPath)) continue;
    const raw = readFileSync(absPath, 'utf8');
    const stripped = stripComments(raw);

    const defs = extractDefines(raw);
    for (const d of defs) {
      if (!seenNames.has(d.name)) {
        seenNames.add(d.name);
        allDefs.push({ ...d, fromFile: src });
      }
    }
    const enums = extractEnums(stripped);
    for (const e of enums) allEnums.push(e);
  }

  const header = [
    `// AUTO-GENERATED from constants/characters.h + rgb.h + songs.h by extract-decomp-scenes.mjs`,
    `// Do not edit manually — re-run \`npm run extract:decomp-scenes\` to refresh.`,
    `//`,
    `// Generated: ${NOW}`,
    '',
  ].join('\n');

  const sections = [];
  if (allDefs.length) {
    sections.push(renderDefines(allDefs));
    for (const d of allDefs) exports.add(typeof d.value === 'number' ? d.name : `${d.name}_EXPR`);
  }
  if (allEnums.length) {
    const rendered = renderEnums(allEnums);
    sections.push(rendered);
    const wrapperRe = /^export const (ENUM_\w+) = \{$/gm;
    let mw;
    while ((mw = wrapperRe.exec(rendered)) !== null) exports.add(mw[1]);
  }

  const body = sections.filter(Boolean).join('\n\n');
  if (!body.trim()) return { count: 0, exports: [] };

  const outFile = join(outDir, '_common-constants.ts');
  writeFileSync(outFile, header + '\n' + body + '\n');
  const exportCount = allDefs.length + allEnums.length;
  console.log(`[extract-decomp-scenes] OK _common-constants.ts (${exportCount} exports)`);
  return { count: exportCount, exports: [...exports] };
}

// ─── _index.ts (named re-exports to avoid name conflicts) ───────────────────

function buildIndex(commonExports, results) {
  const seen = new Set(commonExports);
  const lines = [
    `// AUTO-GENERATED by extract-decomp-scenes.mjs — Generated: ${NOW}`,
    `// Do not edit manually — re-run \`npm run extract:decomp-scenes\` to refresh.`,
    `// Each module re-exported with conflict-resolution: first-seen export wins.`,
    `// To use a conflicting export from a non-default module, import it directly.`,
    '',
    `export * from './_common-constants';`,
  ];
  for (const r of results) {
    if (!r || r.exportCount === 0) continue;
    const unique = r.exports.filter(n => !seen.has(n));
    if (unique.length === r.exports.length) {
      // No conflicts — wildcard re-export is safe
      lines.push(`export * from './${r.key}-data';`);
    } else if (unique.length > 0) {
      // Partial re-export
      lines.push(`export { ${unique.join(', ')} } from './${r.key}-data';`);
    } else {
      lines.push(`// ./${r.key}-data — all exports conflict, import directly to use`);
    }
    for (const n of r.exports) seen.add(n);
  }
  lines.push('');
  const outFile = join(outDir, '_index.ts');
  writeFileSync(outFile, lines.join('\n'));
  console.log(`[extract-decomp-scenes] OK _index.ts`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`[extract-decomp-scenes] Starting extraction → ${outDir}`);

const common = buildCommonConstants();

const results = [];
for (const scene of SCENES) {
  try {
    const r = processScene(scene);
    results.push(r);
  } catch (e) {
    console.error(`[extract-decomp-scenes] ERROR processing ${scene.key}:`, e.message);
    results.push({ key: scene.key, exportCount: 0, exports: [] });
  }
}

buildIndex(common.exports, results);

const generated = results.filter(r => r && r.exportCount > 0);
console.log(`\n[extract-decomp-scenes] Done: ${generated.length}/${SCENES.length} scene files + _common-constants + _index`);
console.log(`  Files in ${outDir.replace(/\\/g, '/')}`);

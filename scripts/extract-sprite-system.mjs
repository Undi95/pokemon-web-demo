#!/usr/bin/env node
/**
 * extract-sprite-system.mjs
 * --------------------------
 * Extrait TOUTE la déclaration sprite-system d'un set de fichiers .c du décomp :
 *
 *   1. sAnim_X[]              (union AnimCmd)        → SPRITE_ANIMS
 *   2. sAnims_X[]             (AnimCmd *const[])     → SPRITE_ANIM_TABLES
 *   3. sAffineAnim_X[]        (union AffineAnimCmd)  → SPRITE_AFFINE_ANIMS
 *   4. sAffineAnims_X[]       (AffineAnimCmd *const[]) → SPRITE_AFFINE_ANIM_TABLES
 *   5. struct SpriteTemplate  → SPRITE_TEMPLATES
 *   6. struct OamData         → OAM_DATAS
 *   7. struct SpritePalette[] → SPRITE_PALETTES
 *   8. struct CompressedSpriteSheet[] → SPRITE_SHEETS
 *   9. SpriteCB_*  bodyC      → SPRITE_CALLBACKS
 *  10. helper Create*Sprite*  bodyC → SPRITE_HELPERS
 *
 * Sortie : src/engine/decomp-data/auto/src/sprite-system.ts
 *
 * Principe : regex sur source nettoyée (no comments). Best-effort, on log
 * les warnings et on saute les entrées qui ne parsent pas.
 *
 * Usage :  node scripts/extract-sprite-system.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src');
const outFile = join(outDir, 'sprite-system.ts');

const SOURCES = [
  'src/intro.c',
  'src/intro_credits_graphics.c',  // Phase 1 Action 4 #2 : Brendan/May/Bicycle/Flygon Scene 2
  'src/title_screen.c',
  'src/main_menu.c',
  // Note: birch_speech.c does not exist in pokeemerald; use new_game.c per task spec
  'src/new_game.c',
  'src/naming_screen.c',
  'src/option_menu.c',
  'src/save_failed_screen.c',
  'src/credits.c',
  'src/start_menu.c',
  'src/save.c',
  'src/menu_helpers.c',
  'src/text_window.c',
  // Phase 5.5b : ChooseStarter sprite templates (sSpriteTemplate_Pokeball/Hand/StarterCircle).
  'src/starter_choose.c',
];

mkdirSync(outDir, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────────

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

/** Find matching closing brace from an open-brace position. */
function findMatchingBrace(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Iterate `static const TYPE NAME[]? = { ... };` blocks. Returns
 * { name, body, isArray, startIdx, endIdx }.
 */
function* iterDecls(src, declRe) {
  declRe.lastIndex = 0;
  let m;
  while ((m = declRe.exec(src)) !== null) {
    const name = m[1];
    const isArray = m[0].includes('[]');
    // find first { after match
    const openIdx = src.indexOf('{', m.index + m[0].length - 1);
    if (openIdx === -1) continue;
    const closeIdx = findMatchingBrace(src, openIdx);
    if (closeIdx === -1) continue;
    const body = src.slice(openIdx + 1, closeIdx);
    yield { name, body, isArray, startIdx: m.index, endIdx: closeIdx + 1 };
    declRe.lastIndex = closeIdx + 1;
  }
}

// Parse `.field = value,` from a struct body. Stops at next `.field` or `,` or end.
function parseFields(body) {
  const fields = {};
  // Split on `.<word>` ; capture value up to next `.<word>=` or end-of-body.
  const re = /\.(\w+)\s*=\s*([\s\S]*?)(?=,\s*\.\w+\s*=|,?\s*$)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const k = m[1];
    let v = m[2].trim();
    // strip trailing comma
    if (v.endsWith(',')) v = v.slice(0, -1).trim();
    fields[k] = v;
  }
  return fields;
}

// ─── 1. AnimCmd tables ──────────────────────────────────────────────────────

const RE_ANIM = /static\s+const\s+union\s+AnimCmd\s+(\w+)\s*\[\s*\]\s*=\s*/g;

function parseAnimCmd(name, body) {
  const frames = [];
  let terminator = null;
  let jumpTo = null;
  let loopCount = null;

  // Walk lines/tokens — match each cmd in source order
  const cmdRe = /(ANIMCMD_FRAME|ANIMCMD_END|ANIMCMD_JUMP|ANIMCMD_LOOP)\s*(?:\(\s*([^)]*)\s*\))?/g;
  let m;
  while ((m = cmdRe.exec(body)) !== null) {
    const op = m[1];
    const args = (m[2] || '').split(',').map(s => s.trim()).filter(s => s.length);
    if (op === 'ANIMCMD_FRAME') {
      // FRAME(tileNum, duration[, hflip, vflip])
      // Parse numeric — fall back to raw string for #define references.
      const parseNum = (s) => {
        const n = s.startsWith('0x') || s.startsWith('-0x') ? parseInt(s, 16) : parseInt(s);
        return Number.isNaN(n) ? s : n;
      };
      const tileNum = parseNum(args[0]);
      const duration = parseNum(args[1]);
      if (typeof tileNum !== 'number' || typeof duration !== 'number') {
        console.warn(`[anim ${name}] non-numeric ANIMCMD_FRAME args: ${args.join(',')} (kept as raw)`);
      }
      const f = { tileNum, duration };
      if (args[2] !== undefined) f.hflip = args[2];
      if (args[3] !== undefined) f.vflip = args[3];
      frames.push(f);
    } else if (op === 'ANIMCMD_END') {
      terminator = 'END';
    } else if (op === 'ANIMCMD_JUMP') {
      terminator = 'JUMP';
      jumpTo = parseInt(args[0]);
    } else if (op === 'ANIMCMD_LOOP') {
      terminator = 'LOOP';
      loopCount = parseInt(args[0]);
    }
  }
  if (frames.length === 0 && !terminator) return null;
  const out = { frames, terminator: terminator || 'END' };
  if (jumpTo !== null) out.jumpTo = jumpTo;
  if (loopCount !== null) out.loopCount = loopCount;
  return out;
}

// ─── 2. AnimCmd *const[] tables ────────────────────────────────────────────

// Session 124 fix Bug 6a : accept array sizes with C constant expressions
// (e.g. `[NUM_PRESS_START_FRAMES + NUM_COPYRIGHT_FRAMES]`). Avant, regex
// strict `\[\s*\]` ne match que les sizes vides → manquait l'extraction
// de `sStartCopyrightBannerAnimTable` (= title screen). Workaround patch
// manuel ajouté dans sprite-system.ts session 113. Avec ce fix l'extracteur
// le capture directement.
const RE_ANIMS_TABLE = /static\s+const\s+union\s+AnimCmd\s*\*\s*const\s+(\w+)\s*\[[^\]]*\]\s*=\s*/g;

function parseRefTable(body) {
  // Body contains comma-separated identifiers (sometimes [INDEX] = name).
  // Strip designator brackets first.
  const cleaned = body.replace(/\[[^\]]*\]\s*=\s*/g, '');
  const refs = cleaned.split(',').map(s => s.trim()).filter(s => s.length && /^[A-Za-z_]\w*$/.test(s));
  return refs;
}

// ─── 3. AffineAnimCmd tables ───────────────────────────────────────────────

const RE_AFFINE_ANIM = /static\s+const\s+union\s+AffineAnimCmd\s+(\w+)\s*\[\s*\]\s*=\s*/g;

function parseAffineAnimCmd(name, body) {
  const frames = [];
  let terminator = null;
  let jumpTo = null;
  let loopCount = null;

  const cmdRe = /(AFFINEANIMCMD_FRAME|AFFINEANIMCMD_END|AFFINEANIMCMD_JUMP|AFFINEANIMCMD_LOOP)\s*(?:\(\s*([^)]*)\s*\))?/g;
  let m;
  while ((m = cmdRe.exec(body)) !== null) {
    const op = m[1];
    const args = (m[2] || '').split(',').map(s => s.trim()).filter(s => s.length);
    if (op === 'AFFINEANIMCMD_FRAME') {
      // FRAME(xScale, yScale, rotation, duration)
      const parsed = args.map(a => {
        // hex like 0x80, decimal, possibly negative
        const n = a.startsWith('0x') || a.startsWith('-0x') ? parseInt(a, 16) : parseInt(a);
        return Number.isNaN(n) ? a : n;
      });
      if (parsed.length < 4) {
        console.warn(`[affineAnim ${name}] bad FRAME args: ${args.join(',')}`);
        continue;
      }
      frames.push({
        xScale: parsed[0],
        yScale: parsed[1],
        rotation: parsed[2],
        duration: parsed[3],
      });
    } else if (op === 'AFFINEANIMCMD_END') {
      terminator = 'END';
    } else if (op === 'AFFINEANIMCMD_JUMP') {
      terminator = 'JUMP';
      jumpTo = parseInt(args[0]);
    } else if (op === 'AFFINEANIMCMD_LOOP') {
      terminator = 'LOOP';
      loopCount = parseInt(args[0]);
    }
  }
  if (frames.length === 0 && !terminator) return null;
  const out = { frames, terminator: terminator || 'END' };
  if (jumpTo !== null) out.jumpTo = jumpTo;
  if (loopCount !== null) out.loopCount = loopCount;
  return out;
}

// ─── 4. AffineAnimCmd *const[] tables ──────────────────────────────────────

// Session 124 fix Bug 6a : accept array sizes with expressions (cf. RE_ANIMS_TABLE).
const RE_AFFINE_ANIMS_TABLE = /static\s+const\s+union\s+AffineAnimCmd\s*\*\s*const\s+(\w+)\s*\[[^\]]*\]\s*=\s*/g;

// ─── 5. SpriteTemplate ─────────────────────────────────────────────────────

const RE_SPRITE_TEMPLATE = /static\s+const\s+struct\s+SpriteTemplate\s+(\w+)\s*=\s*/g;

function parseSpriteTemplate(body) {
  const f = parseFields(body);
  // Resolve `&sOamData_X` → 'sOamData_X' (strip leading &)
  const stripAddr = v => (v && v.startsWith('&') ? v.slice(1).trim() : v);
  const out = {};
  if (f.tileTag !== undefined) out.tileTag = f.tileTag;
  if (f.paletteTag !== undefined) out.paletteTag = f.paletteTag;
  if (f.oam !== undefined) out.oam = stripAddr(f.oam);
  if (f.anims !== undefined) out.anims = f.anims;
  if (f.images !== undefined) out.images = f.images;
  if (f.affineAnims !== undefined) out.affineAnims = f.affineAnims;
  if (f.callback !== undefined) out.callback = f.callback;
  return out;
}

// ─── 6. OamData ────────────────────────────────────────────────────────────

const RE_OAM = /static\s+const\s+struct\s+OamData\s+(\w+)\s*=\s*/g;

function parseOamData(body) {
  const f = parseFields(body);
  // Parse SPRITE_SHAPE(WxH) and SPRITE_SIZE(WxH) → keep raw + parsed if possible
  const out = {};
  for (const [k, v] of Object.entries(f)) {
    out[k] = v;
  }
  // Add convenience parsed fields
  const shapeMatch = (f.shape || '').match(/SPRITE_SHAPE\s*\(\s*(\d+)x(\d+)\s*\)/);
  const sizeMatch  = (f.size  || '').match(/SPRITE_SIZE\s*\(\s*(\d+)x(\d+)\s*\)/);
  if (sizeMatch) out._sizeWH = [parseInt(sizeMatch[1]), parseInt(sizeMatch[2])];
  if (shapeMatch) out._shapeWH = [parseInt(shapeMatch[1]), parseInt(shapeMatch[2])];
  return out;
}

// ─── 7. SpritePalette[] ────────────────────────────────────────────────────

const RE_SPRITE_PALETTE = /static\s+const\s+struct\s+SpritePalette\s+(\w+)\s*\[\s*\]\s*=\s*/g;

function parseSpritePaletteArray(body) {
  // Body is e.g. "{sIntroDrops_Pal, PALTAG_DROPS}, {sIntroLogo_Pal, PALTAG_LOGO}, ...,"
  // Split on `},` after balancing braces.
  const entries = [];
  const inner = /\{\s*([^}]*?)\s*\}/g;
  let m;
  while ((m = inner.exec(body)) !== null) {
    const parts = m[1].split(',').map(s => s.trim()).filter(s => s.length);
    if (parts.length === 0) continue; // empty {} terminator
    if (parts.length === 1) {
      entries.push({ paletteName: parts[0], tag: null });
    } else {
      entries.push({ paletteName: parts[0], tag: parts[1] });
    }
  }
  return entries;
}

// ─── 8. CompressedSpriteSheet[] ────────────────────────────────────────────

const RE_SPRITE_SHEET = /static\s+const\s+struct\s+CompressedSpriteSheet\s+(\w+)\s*\[\s*\]\s*=\s*/g;

function parseSpriteSheetArray(body) {
  // Body is "{gIntroFlygonSilhouette_Gfx, 0x400, TAG_FLYGON_SILHOUETTE}, {},"
  const entries = [];
  const inner = /\{\s*([^}]*?)\s*\}/g;
  let m;
  while ((m = inner.exec(body)) !== null) {
    const parts = m[1].split(',').map(s => s.trim()).filter(s => s.length);
    if (parts.length === 0) continue; // empty {} terminator
    if (parts.length < 3) {
      // Tolerate partial — log but include null
      entries.push({
        gfxName: parts[0] || null,
        sizeBytes: parts[1] ? (parts[1].startsWith('0x') ? parseInt(parts[1], 16) : parseInt(parts[1])) : null,
        tag: parts[2] || null,
      });
    } else {
      const sz = parts[1].startsWith('0x') ? parseInt(parts[1], 16) : parseInt(parts[1]);
      entries.push({
        gfxName: parts[0],
        sizeBytes: Number.isNaN(sz) ? parts[1] : sz,
        tag: parts[2],
      });
    }
  }
  return entries;
}

// ─── 9. SpriteCB_* function bodies ─────────────────────────────────────────

function extractSpriteCallbacks(src) {
  const out = {};
  const re = /(?:static\s+)?void\s+(SpriteCB_\w+)\s*\(\s*struct\s+Sprite\s*\*\s*\w+\s*\)\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    if (out[name]) continue; // skip dup forward decls
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(src, openIdx);
    if (closeIdx === -1) continue;
    out[name] = src.slice(openIdx + 1, closeIdx).trim();
  }
  return out;
}

// ─── 11. static const <intType> sX[..] arrays (s8/u8/s16/u16/s32/u32) ─────
// Capture data tables consumed by sprite callbacks / helpers.
// Skip INCBIN/INCGFX (those are GFX_SOURCES, not data). Skip `sUnusedData`-style
// blobs by NOT skipping anything; we let unresolved expressions fall through
// as `raw` strings.

const RE_DATA_TABLE = /static\s+const\s+(s8|u8|s16|u16|s32|u32)\s+(\w+)\s*((?:\[[^\]]*\])+)\s*=\s*/g;

/**
 * Tokenize a `static const` array body into nested arrays of cells. Each cell
 * is either an int (resolved) or a string (raw expr).
 */
function parseDataTableBody(name, dims, body, ctx) {
  // dims is array of dimension expressions ('NUM_GF_LETTERS', '2', '', ...).
  const ndims = dims.length;
  // Single-dim flat list:
  //   { 0, 23, 49, ... }
  // Multi-dim:
  //   { {0,1}, {2,3}, ... }
  // We parse into nested arrays based on actual brace structure (dims hint
  // only used for sanity/log).
  const cells = [];
  // Walk body, balancing braces, splitting top-level by commas.
  let i = 0;
  function skipWS() { while (i < body.length && /\s/.test(body[i])) i++; }
  function readToken() {
    // either {...} group or atomic up to , or }
    skipWS();
    if (i >= body.length) return null;
    if (body[i] === '{') {
      // capture matching brace group's inner body
      let depth = 1;
      const start = ++i;
      while (i < body.length && depth > 0) {
        if (body[i] === '{') depth++;
        else if (body[i] === '}') depth--;
        if (depth === 0) break;
        i++;
      }
      const inner = body.slice(start, i);
      i++; // skip closing }
      // Parse inner recursively (nested)
      const sub = parseSubArray(inner, ctx);
      return sub;
    }
    // atomic token up to , or }
    let start = i;
    while (i < body.length && body[i] !== ',' && body[i] !== '}') i++;
    const tok = body.slice(start, i).trim();
    return resolveExpr(tok, ctx);
  }
  while (i < body.length) {
    skipWS();
    if (i >= body.length) break;
    if (body[i] === ',') { i++; continue; }
    if (body[i] === '}') { i++; continue; } // terminator
    const t = readToken();
    if (t === null) break;
    // Skip empty arrays (terminator like `{}`)
    if (Array.isArray(t) && t.length === 0) continue;
    cells.push(t);
  }
  return cells;
}

function parseSubArray(body, ctx) {
  const out = [];
  let i = 0;
  function skipWS() { while (i < body.length && /\s/.test(body[i])) i++; }
  while (i < body.length) {
    skipWS();
    if (i >= body.length) break;
    if (body[i] === ',') { i++; continue; }
    if (body[i] === '{') {
      // nested array
      let depth = 1;
      const start = ++i;
      while (i < body.length && depth > 0) {
        if (body[i] === '{') depth++;
        else if (body[i] === '}') depth--;
        if (depth === 0) break;
        i++;
      }
      const inner = body.slice(start, i);
      i++;
      const sub = parseSubArray(inner, ctx);
      if (!(Array.isArray(sub) && sub.length === 0)) out.push(sub);
      continue;
    }
    // atomic
    let start = i;
    while (i < body.length && body[i] !== ',' && body[i] !== '}') i++;
    const tok = body.slice(start, i).trim();
    if (tok.length) out.push(resolveExpr(tok, ctx));
  }
  return out;
}

/**
 * Resolve a single C expression token to a JS number when possible.
 * Falls back to the raw string. Substitutes #define / enum names from `ctx.macros`.
 */
function resolveExpr(tok, ctx) {
  if (!tok) return tok;
  // Strip cast prefixes like (s16) (u8)
  tok = tok.replace(/^\(\s*(?:s8|u8|s16|u16|s32|u32|int)\s*\)\s*/g, '');
  // Pure int literal (decimal / hex, optional sign)
  if (/^-?0x[0-9a-fA-F]+$/.test(tok)) return parseInt(tok, 16);
  if (/^-?\d+$/.test(tok)) return parseInt(tok, 10);
  // Substitute identifiers with #define / enum lookup, then attempt eval
  const substituted = tok.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (id) => {
    if (Object.prototype.hasOwnProperty.call(ctx.macros, id)) {
      return String(ctx.macros[id]);
    }
    return id; // unresolved
  });
  // If substituted is a pure arithmetic expression, eval it
  if (/^[\s\d+\-*/().x]+$/.test(substituted)) {
    try {
      // Function-eval is safe here: only digits/operators after the regex test
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict"; return (${substituted});`)();
      if (typeof v === 'number' && Number.isFinite(v)) return v;
    } catch { /* fall through */ }
  }
  // Unresolvable — keep as raw
  return { raw: tok };
}

/**
 * Build a macro/enum lookup from a C source.
 *   - #define NAME VALUE  (numeric only)
 *   - enum { A, B = 5, C, ... }   (auto-incrementing; respects = N)
 */
function buildMacroContext(src) {
  const macros = {};
  // 1. #define INTEGER constants
  const defRe = /#define\s+(\w+)\s+([^\n\r/]+?)(?:\s*\/\/|\s*$)/gm;
  let m;
  while ((m = defRe.exec(src)) !== null) {
    const name = m[1];
    const val = m[2].trim();
    // Only accept numeric / arithmetic on already-known macros
    if (/^[\s\d+\-*/().x]+$/.test(val)) {
      try {
        // eslint-disable-next-line no-new-func
        const n = Function(`"use strict"; return (${val});`)();
        if (typeof n === 'number' && Number.isFinite(n)) macros[name] = n;
      } catch { /* skip */ }
    } else if (/^-?0x[0-9a-fA-F]+$/.test(val) || /^-?\d+$/.test(val)) {
      macros[name] = val.startsWith('0x') || val.startsWith('-0x') ? parseInt(val, 16) : parseInt(val, 10);
    }
  }
  // 2. anonymous enum { A, B = 5, C, ... }
  const enumRe = /enum\s*\{([\s\S]*?)\}\s*;/g;
  while ((m = enumRe.exec(src)) !== null) {
    const body = m[1];
    let counter = 0;
    for (const part of body.split(',')) {
      const t = part.trim();
      if (!t) continue;
      const eq = t.match(/^(\w+)\s*=\s*(.+)$/);
      if (eq) {
        const name = eq[1];
        const exprRaw = eq[2].trim();
        // Substitute prior macros + try eval
        const sub = exprRaw.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (id) =>
          Object.prototype.hasOwnProperty.call(macros, id) ? String(macros[id]) : id
        );
        if (/^[\s\d+\-*/().x]+$/.test(sub)) {
          try {
            // eslint-disable-next-line no-new-func
            const v = Function(`"use strict"; return (${sub});`)();
            if (typeof v === 'number' && Number.isFinite(v)) {
              counter = v;
              macros[name] = counter;
              counter++;
              continue;
            }
          } catch { /* fall through */ }
        }
        // unresolvable initializer — bail this enum from this point
        break;
      }
      const name = t.match(/^(\w+)$/);
      if (name) {
        macros[name[1]] = counter++;
      }
    }
  }
  return macros;
}

function extractDataTables(src, ctx) {
  const out = {};
  RE_DATA_TABLE.lastIndex = 0;
  let m;
  while ((m = RE_DATA_TABLE.exec(src)) !== null) {
    const cType = m[1];
    const name = m[2];
    const dimSpec = m[3]; // e.g. "[NUM_GF_LETTERS][2]" or "[]"
    const dims = [...dimSpec.matchAll(/\[([^\]]*)\]/g)].map(mm => mm[1].trim());
    // Find the start of value definition. The match's index points to "static",
    // and m[0] ends right before `=`. We need the next char after `=`.
    const declEnd = m.index + m[0].length;
    // After `=`, skip whitespace; either `INCBIN(...)` / `INCGFX_*(...)` / `{...}`.
    let p = declEnd;
    while (p < src.length && /\s/.test(src[p])) p++;
    if (src.startsWith('INCBIN', p) || src.startsWith('INCGFX', p)) continue; // GFX_SOURCES territory
    // Expect a `{`
    if (src[p] !== '{') continue;
    const close = findMatchingBrace(src, p);
    if (close === -1) continue;
    const body = src.slice(p + 1, close);
    const values = parseDataTableBody(name, dims, body, ctx);
    out[name] = {
      type: `${cType}${dims.map(d => `[${d}]`).join('')}`,
      cType,
      dims,
      values,
    };
    RE_DATA_TABLE.lastIndex = close + 1;
  }
  return out;
}

// ─── 12. EXTERNAL palette/gfx INCGFX from supplemental headers ────────────
// Currently we only need gIntroGameFreakTextFade_Pal from
// src/data/graphics/intro_scene.h. Extracted as a small generic header scan.

const EXTERNAL_HEADERS = [
  'src/data/graphics/intro_scene.h',
];

function extractExternalPalettes(decompRoot) {
  const out = {};
  for (const rel of EXTERNAL_HEADERS) {
    const abs = join(decompRoot, rel);
    let raw;
    try { raw = readFileSync(abs, 'utf8'); } catch { continue; }
    const src = stripComments(raw);
    // Match: `[const|extern const] <type> NAME[..] = INCGFX_(U16|U32)("path", ".ext");`
    const re = /(?:^|\s)(?:extern\s+)?const\s+(u16|u32)\s+(\w+)\s*(?:\[[^\]]*\])+\s*=\s*INCGFX_(U16|U32)\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)\s*;/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const [, cType, name, /*incType*/, path, ext] = m;
      out[name] = { path, ext, type: cType, source: rel };
    }
  }
  return out;
}

// ─── 10. Helper Create*Sprite* / Create*Bg*Anim* / CreateWaterDrop ─────────

function extractHelperFunctions(src) {
  const out = {};
  // Heuristic name matchers:
  //   Create*Sprite*, Create*Drop*, Create*Logo*, Create*Bubble*, Create*Rock*
  //   Spawn*, Animate*Sprite*, etc.
  const re = /(?:static\s+)?(?:void|u8|s16|u16|s32|u32|int|bool8)\s+(Create\w*(?:Sprite|Drop|Logo|Bubble|Rock|Lightning|Letter|Banner|Anim|Lati|Volbeat|Torchic|Manectric|Sparkle|Flygon)\w*|Spawn\w+)\s*\(([^)]*)\)\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const params = m[2].trim();
    if (out[name]) continue; // skip forward decl
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(src, openIdx);
    if (closeIdx === -1) continue;
    out[name] = {
      params,
      bodyC: src.slice(openIdx + 1, closeIdx).trim(),
    };
  }
  return out;
}

// ─── Per-file processor ────────────────────────────────────────────────────

function processFile(absPath, relPath) {
  const raw = readFileSync(absPath, 'utf8');
  const src = stripComments(raw);
  // Build per-file macro/enum context BEFORE extracting data tables, so we
  // can resolve NUM_GF_LETTERS, GAMEFREAK_G, ... to ints.
  const macroCtx = { macros: buildMacroContext(src) };

  const result = {
    source: relPath,
    anims: {},
    animTables: {},
    affineAnims: {},
    affineAnimTables: {},
    spriteTemplates: {},
    oamDatas: {},
    spritePalettes: {},
    spriteSheets: {},
    spriteCallbacks: {},
    helpers: {},
    dataTables: {},
  };

  // 1. AnimCmd
  for (const d of iterDecls(src, RE_ANIM)) {
    const parsed = parseAnimCmd(d.name, d.body);
    if (parsed) result.anims[d.name] = parsed;
    else console.warn(`[${relPath}] skip anim ${d.name} (bad parse)`);
  }
  // 2. AnimCmd *const[]
  for (const d of iterDecls(src, RE_ANIMS_TABLE)) {
    const refs = parseRefTable(d.body);
    if (refs.length) result.animTables[d.name] = { anims: refs };
    else console.warn(`[${relPath}] skip animTable ${d.name} (empty)`);
  }
  // 3. AffineAnimCmd
  for (const d of iterDecls(src, RE_AFFINE_ANIM)) {
    const parsed = parseAffineAnimCmd(d.name, d.body);
    if (parsed) result.affineAnims[d.name] = parsed;
    else console.warn(`[${relPath}] skip affineAnim ${d.name} (bad parse)`);
  }
  // 4. AffineAnimCmd *const[]
  for (const d of iterDecls(src, RE_AFFINE_ANIMS_TABLE)) {
    const refs = parseRefTable(d.body);
    if (refs.length) result.affineAnimTables[d.name] = { affineAnims: refs };
    else console.warn(`[${relPath}] skip affineAnimTable ${d.name} (empty)`);
  }
  // 5. SpriteTemplate
  for (const d of iterDecls(src, RE_SPRITE_TEMPLATE)) {
    if (d.isArray) continue; // skip arrays of templates (rare)
    result.spriteTemplates[d.name] = parseSpriteTemplate(d.body);
  }
  // 6. OamData
  for (const d of iterDecls(src, RE_OAM)) {
    if (d.isArray) continue;
    result.oamDatas[d.name] = parseOamData(d.body);
  }
  // 7. SpritePalette[]
  for (const d of iterDecls(src, RE_SPRITE_PALETTE)) {
    const entries = parseSpritePaletteArray(d.body);
    if (entries.length) result.spritePalettes[d.name] = { entries };
    else console.warn(`[${relPath}] skip spritePalette ${d.name} (empty)`);
  }
  // 8. CompressedSpriteSheet[]
  for (const d of iterDecls(src, RE_SPRITE_SHEET)) {
    const entries = parseSpriteSheetArray(d.body);
    if (entries.length) result.spriteSheets[d.name] = { entries };
    else console.warn(`[${relPath}] skip spriteSheet ${d.name} (empty)`);
  }
  // 9. SpriteCB_*
  Object.assign(result.spriteCallbacks, extractSpriteCallbacks(src));
  // 10. Create*Sprite*
  Object.assign(result.helpers, extractHelperFunctions(src));
  // 11. static const <intType> sX[..] arrays (intro-data values)
  Object.assign(result.dataTables, extractDataTables(src, macroCtx));

  return result;
}

// ─── Merge results from multiple files ─────────────────────────────────────

const allResults = {};
for (const rel of SOURCES) {
  const abs = join(decompRoot, rel);
  if (!existsSync(abs)) {
    console.warn(`[sprite-system] SKIP ${rel} — file not found in decomp`);
    continue;
  }
  console.log(`[sprite-system] Processing ${rel}...`);
  try {
    const res = processFile(abs, rel);
    allResults[rel] = res;
    // Warn if file produced nothing
    const total = Object.keys(res.anims).length + Object.keys(res.animTables).length +
      Object.keys(res.affineAnims).length + Object.keys(res.affineAnimTables).length +
      Object.keys(res.spriteTemplates).length + Object.keys(res.oamDatas).length +
      Object.keys(res.spritePalettes).length + Object.keys(res.spriteSheets).length +
      Object.keys(res.spriteCallbacks).length + Object.keys(res.helpers).length +
      Object.keys(res.dataTables).length;
    if (total === 0) {
      console.warn(`[sprite-system] WARN ${rel} produced 0 extractions`);
    }
  } catch (e) {
    console.error(`[sprite-system] FAIL ${rel}: ${e.message}`);
  }
}

// ─── Emit TypeScript ───────────────────────────────────────────────────────

const merged = {
  anims: {},
  animTables: {},
  affineAnims: {},
  affineAnimTables: {},
  spriteTemplates: {},
  oamDatas: {},
  spritePalettes: {},
  spriteSheets: {},
  spriteCallbacks: {},
  helpers: {},
  dataTables: {},
  externalPalettes: extractExternalPalettes(decompRoot),
};
const sourceMap = {}; // entry name → source file

function tagSource(section, name, src) {
  sourceMap[`${section}:${name}`] = src;
}

for (const [src, res] of Object.entries(allResults)) {
  if (!res) continue;
  for (const [k, v] of Object.entries(res.anims))             { merged.anims[k] = v;             tagSource('anims', k, src); }
  for (const [k, v] of Object.entries(res.animTables))        { merged.animTables[k] = v;        tagSource('animTables', k, src); }
  for (const [k, v] of Object.entries(res.affineAnims))       { merged.affineAnims[k] = v;       tagSource('affineAnims', k, src); }
  for (const [k, v] of Object.entries(res.affineAnimTables))  { merged.affineAnimTables[k] = v;  tagSource('affineAnimTables', k, src); }
  for (const [k, v] of Object.entries(res.spriteTemplates))   { merged.spriteTemplates[k] = v;   tagSource('spriteTemplates', k, src); }
  for (const [k, v] of Object.entries(res.oamDatas))          { merged.oamDatas[k] = v;          tagSource('oamDatas', k, src); }
  for (const [k, v] of Object.entries(res.spritePalettes))    { merged.spritePalettes[k] = v;    tagSource('spritePalettes', k, src); }
  for (const [k, v] of Object.entries(res.spriteSheets))      { merged.spriteSheets[k] = v;      tagSource('spriteSheets', k, src); }
  for (const [k, v] of Object.entries(res.spriteCallbacks))   { merged.spriteCallbacks[k] = v;   tagSource('spriteCallbacks', k, src); }
  for (const [k, v] of Object.entries(res.helpers))           { merged.helpers[k] = v;           tagSource('helpers', k, src); }
  for (const [k, v] of Object.entries(res.dataTables))        { merged.dataTables[k] = v;        tagSource('dataTables', k, src); }
}
for (const k of Object.keys(merged.externalPalettes)) {
  tagSource('externalPalettes', k, merged.externalPalettes[k].source);
}

function renderConst(name, obj) {
  if (Object.keys(obj).length === 0) return `export const ${name} = {} as const;`;
  // Pretty-print with sorted keys for stable diffs
  const keys = Object.keys(obj).sort();
  const lines = [`export const ${name} = {`];
  for (const k of keys) {
    lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(obj[k])},`);
  }
  lines.push(`} as const;`);
  return lines.join('\n');
}

const NOW = new Date().toISOString().slice(0, 10);
const totalAnims = Object.keys(merged.anims).length;
const totalAnimTables = Object.keys(merged.animTables).length;
const totalAffineAnims = Object.keys(merged.affineAnims).length;
const totalAffineAnimTables = Object.keys(merged.affineAnimTables).length;
const totalSpriteTemplates = Object.keys(merged.spriteTemplates).length;
const totalOamDatas = Object.keys(merged.oamDatas).length;
const totalSpritePalettes = Object.keys(merged.spritePalettes).length;
const totalSpriteSheets = Object.keys(merged.spriteSheets).length;
const totalSpriteCallbacks = Object.keys(merged.spriteCallbacks).length;
const totalHelpers = Object.keys(merged.helpers).length;
const totalDataTables = Object.keys(merged.dataTables).length;
const totalExternalPalettes = Object.keys(merged.externalPalettes).length;

const header = [
  `// AUTO-GENERATED by scripts/extract-sprite-system.mjs`,
  `// Sources: ${SOURCES.join(', ')}`,
  `// Generated: ${NOW}`,
  `//`,
  `// Stats:`,
  `//   ${totalAnims}    sAnim_*[]              (union AnimCmd)`,
  `//   ${totalAnimTables}    sAnims_*[]             (AnimCmd *const[])`,
  `//   ${totalAffineAnims}    sAffineAnim_*[]        (union AffineAnimCmd)`,
  `//   ${totalAffineAnimTables}    sAffineAnims_*[]       (AffineAnimCmd *const[])`,
  `//   ${totalSpriteTemplates}    sSpriteTemplate_*       (struct SpriteTemplate)`,
  `//   ${totalOamDatas}    sOamData_*              (struct OamData)`,
  `//   ${totalSpritePalettes}    sSpritePalette(s)_*[]  (struct SpritePalette[])`,
  `//   ${totalSpriteSheets}    sSpriteSheet_*[]       (struct CompressedSpriteSheet[])`,
  `//   ${totalSpriteCallbacks}    SpriteCB_*              (function bodies)`,
  `//   ${totalHelpers}    Create*/Spawn* helpers   (function bodies)`,
  `//   ${totalDataTables}    static const sX[..]    (sprite data tables, e.g. sGameFreakLetterData)`,
  `//   ${totalExternalPalettes}    EXTERNAL_PALETTES      (INCGFX from src/data/graphics/*.h)`,
  ``,
  `/** Source map: "<section>:<name>" → relative .c path */`,
  `export const SPRITE_SYSTEM_SOURCES = ${JSON.stringify(sourceMap, null, 2)} as const;`,
  ``,
].join('\n');

const body = [
  renderConst('SPRITE_ANIMS', merged.anims),
  renderConst('SPRITE_ANIM_TABLES', merged.animTables),
  renderConst('SPRITE_AFFINE_ANIMS', merged.affineAnims),
  renderConst('SPRITE_AFFINE_ANIM_TABLES', merged.affineAnimTables),
  renderConst('SPRITE_TEMPLATES', merged.spriteTemplates),
  renderConst('OAM_DATAS', merged.oamDatas),
  renderConst('SPRITE_PALETTES', merged.spritePalettes),
  renderConst('SPRITE_SHEETS', merged.spriteSheets),
  renderConst('SPRITE_CALLBACKS', merged.spriteCallbacks),
  renderConst('SPRITE_HELPERS', merged.helpers),
  renderConst('SPRITE_DATA_TABLES', merged.dataTables),
  renderConst('EXTERNAL_PALETTES', merged.externalPalettes),
].join('\n\n');

writeFileSync(outFile, header + body + '\n');

// ─── Summary ───────────────────────────────────────────────────────────────

console.log(`\n[sprite-system] Output: ${outFile.replace(/\\/g, '/')}`);
console.log(`[sprite-system] Stats per section:`);
console.log(`  SPRITE_ANIMS                : ${totalAnims}`);
console.log(`  SPRITE_ANIM_TABLES          : ${totalAnimTables}`);
console.log(`  SPRITE_AFFINE_ANIMS         : ${totalAffineAnims}`);
console.log(`  SPRITE_AFFINE_ANIM_TABLES   : ${totalAffineAnimTables}`);
console.log(`  SPRITE_TEMPLATES            : ${totalSpriteTemplates}`);
console.log(`  OAM_DATAS                   : ${totalOamDatas}`);
console.log(`  SPRITE_PALETTES             : ${totalSpritePalettes}`);
console.log(`  SPRITE_SHEETS               : ${totalSpriteSheets}`);
console.log(`  SPRITE_CALLBACKS            : ${totalSpriteCallbacks}`);
console.log(`  SPRITE_HELPERS              : ${totalHelpers}`);
console.log(`  SPRITE_DATA_TABLES          : ${totalDataTables}`);
console.log(`  EXTERNAL_PALETTES           : ${totalExternalPalettes}`);
if (totalDataTables > 0) {
  console.log(`\n[sprite-system] Data table names: ${Object.keys(merged.dataTables).sort().join(', ')}`);
}
if (totalExternalPalettes > 0) {
  console.log(`[sprite-system] External palettes: ${Object.keys(merged.externalPalettes).sort().join(', ')}`);
}

// Sanity check known entries
console.log(`\n[sprite-system] Sanity checks:`);
const checks = [
  ['anims', 'sAnim_FlygonSilhouette'],
  ['spriteTemplates', 'sSpriteTemplate_GameFreakLogo'],
  ['oamDatas', 'sOamData_GameFreakLogo'],
  ['affineAnims', 'sAffineAnim_GameFreak_GrowAndShrink'],
  ['affineAnimTables', 'sAffineAnims_GameFreak'],
  ['spritePalettes', 'sSpritePalettes_Intro1'],
  ['spriteSheets', 'sSpriteSheet_FlygonSilhouette'],
  ['helpers', 'CreateWaterDrop'],
  ['helpers', 'CreateGameFreakLogoSprites'],
  ['dataTables', 'sGameFreakLetterData'],
  ['dataTables', 'sGameFreakLetterStartDelays'],
  ['dataTables', 'sGameFreakLettersMoveSpeed'],
  ['dataTables', 'sPresentsLetterData'],
  ['dataTables', 'sSparkleCoords'],
  ['dataTables', 'sGroudonRockData'],
  ['dataTables', 'sKyogreBubbleData'],
  ['externalPalettes', 'gIntroGameFreakTextFade_Pal'],
];
for (const [sec, key] of checks) {
  const v = merged[sec][key];
  if (v) console.log(`  OK  ${sec}.${key}: ${JSON.stringify(v).slice(0, 120)}${JSON.stringify(v).length > 120 ? '...' : ''}`);
  else   console.log(`  MISS ${sec}.${key}`);
}

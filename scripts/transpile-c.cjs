#!/usr/bin/env node
'use strict';
/*
 * transpile-c.cjs — transpiler C→TS pour le miroir 1:1 (docs/TRANSPILER-C-TO-TS.md).
 *
 * Usage :
 *   node scripts/transpile-c.cjs --file tv.c                # → src/tv.ts + rapport
 *   node scripts/transpile-c.cjs --file tv.c --stdout       # dry-run console
 *   node scripts/transpile-c.cjs --file tv.c --out src/x.ts # cible explicite
 *
 * Politique : transcrire fidèlement ce qui est SÛR, flagger le reste
 * (// TRANSPILER-TODO + rapport audit-reports/transpile/<nom>.md).
 * Refuse d'écraser un .ts existant sans --force (mode merge = à venir).
 */

const fs = require('fs');
const path = require('path');

const DECOMP = process.env.DECOMP_ROOT || 'D:/Projet 1/decomps/pokeemeraude';
const REPO = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(REPO, 'audit-reports', 'ts-symbol-index.json');
const REPORT_DIR = path.join(REPO, 'audit-reports', 'transpile');

// ─── CLI ─────────────────────────────────────────────────────────────────────
// --file x.c          : transpile un fichier → src/x.ts
// --batch a.c,b.c     : transpile plusieurs fichiers (DB construites une fois)
// --rank              : dry-run tous les .c à 0% porté (closure JSON) → classement
// --stdout / --dry    : pas d'écriture ; --force : écraser un .ts existant
const argv = process.argv.slice(2);
function argVal(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; }
const fileArg = argVal('--file');
const batchArg = argVal('--batch');
const rankMode = argv.includes('--rank');
const outArg = argVal('--out');
const toStdout = argv.includes('--stdout');
const dryRun = argv.includes('--dry') || rankMode;
const force = argv.includes('--force');
if (!fileArg && !batchArg && !rankMode) { console.error('usage: transpile-c.cjs --file <nom.c> | --batch a.c,b.c | --rank  [--out src/x.ts] [--stdout] [--dry] [--force]'); process.exit(1); }

// État PER-FICHIER (réinitialisé par resetFileState)
let cRel = '', cPath = '', baseName = '', outPath = '';
let report = null;
function flag(line, kind, detail) { report.flags.push({ line, kind, detail }); }
function resetFileState(fileRel, outOverride) {
  cRel = fileRel.startsWith('src/') ? fileRel : 'src/' + fileRel;
  cPath = path.join(DECOMP, cRel);
  baseName = path.basename(cRel, '.c');
  outPath = outOverride ? path.join(REPO, outOverride) : path.join(REPO, 'src', baseName + '.ts');
  report = { flags: [], unresolved: new Map(), gtext: [], ubfix: [], stats: {} };
  usedIdents.clear();
  localModuleNames.clear();
  fieldAliases.clear();
  bareAliases.clear();
  exprMacros.clear();
  neededImports.clear();
  neededTypeImports.clear();
  moduleDataTypes.clear();
  localConstMap = new Map();
  constsToInline.length = 0;
  SRC = '';
}

// ─── SECTION 1 : résolution préprocesseur (build vanilla FR) ─────────────────
// Valeurs connues (include/config.h + constantes numériques usuelles).
const PP_DEFINED = new Set(['NDEBUG', 'FRENCH', 'UNITS_METRIC']);
const PP_UNDEFINED = new Set(['BUGFIX', 'UBFIX', 'ENGLISH', 'UNITS_IMPERIAL', 'DEBUG', 'PORTABLE']);
const PP_VALUES = {
  MODERN: 0, LIBRFU_VERSION: 1026, __STDC_VERSION__: 199901,
  MOVES_COUNT: 355, OBJECT_EVENT_TEMPLATES_COUNT: 64, SPECIAL_LOCALIDS_START: 0xF0,
  RFU_USER_NAME_LENGTH: 8, PLAYER_NAME_LENGTH: 7,
};
function ppEval(expr, srcLine) {
  // évaluateur minimal : defined(X), identifiants, entiers, ops arith/log/cmp
  let js = expr
    .replace(/defined\s*\(\s*(\w+)\s*\)/g, (_, n) => (PP_DEFINED.has(n) ? '1' : PP_UNDEFINED.has(n) ? '0' : (n in PP_VALUES ? '1' : 'UNK')))
    .replace(/defined\s+(\w+)/g, (_, n) => (PP_DEFINED.has(n) ? '1' : PP_UNDEFINED.has(n) ? '0' : (n in PP_VALUES ? '1' : 'UNK')));
  js = js.replace(/\b[A-Za-z_]\w*\b/g, (n) => {
    if (n === 'UNK') return n;
    if (n in PP_VALUES) return String(PP_VALUES[n]);
    if (PP_DEFINED.has(n)) return '1';
    if (PP_UNDEFINED.has(n)) return '0';
    return 'UNK';
  });
  if (/UNK/.test(js)) { flag(srcLine, 'preproc-inconnu', expr.trim()); return true; } // garde la branche, flag
  js = js.replace(/[^0-9+\-*/%()<>=!&|^~ \tLxXa-fA-F]/g, ' ');
  try { return !!eval(js); } catch { flag(srcLine, 'preproc-eval', expr.trim()); return true; }
}
// SPRITE_SHAPE(NxM)/SPRITE_SIZE(NxM) → valeurs OAM (gba/sprites : shape, size)
const SPRITE_DIMS = {
  '8x8': [0, 0], '16x16': [0, 1], '32x32': [0, 2], '64x64': [0, 3],
  '16x8': [1, 0], '32x8': [1, 1], '32x16': [1, 2], '64x32': [1, 3],
  '8x16': [2, 0], '8x32': [2, 1], '16x32': [2, 2], '32x64': [2, 3],
};
function resolveSpriteDims(src) {
  return src
    .replace(/SPRITE_SHAPE\((\d+x\d+)\)/g, (m, d) => (SPRITE_DIMS[d] ? `${SPRITE_DIMS[d][0]} /* ${m} */` : m))
    .replace(/SPRITE_SIZE\((\d+x\d+)\)/g, (m, d) => (SPRITE_DIMS[d] ? `${SPRITE_DIMS[d][1]} /* ${m} */` : m))
    .replace(/\bALIGNED\(\d+\)\s*/g, '')                 // attribut alignement — sans objet en TS
    .replace(/\b__attribute__\(\([^)]*\)\)\s*/g, '')     // attributs GCC
    .replace(/\bUNUSED\s+/g, '')                         // macro UNUSED
    .replace(/\bEWRAM_DATA\s+/g, '')                     // attribut section EWRAM (data normale)
    .replace(/\bIWRAM_DATA\s+/g, '')                     // attribut section IWRAM
    .replace(/\bCOMMON_DATA\s+/g, '');                   // attribut section COMMON
}

// gSpecialVar_* → VarGet/VarSet (adaptation documentée : vars store byte-VM,
// mapping 1:1 event_data.c:10-27 + vars.h:283-304)
const SPECIAL_VARS = {
  gSpecialVar_0x8000: 0x8000, gSpecialVar_0x8001: 0x8001, gSpecialVar_0x8002: 0x8002,
  gSpecialVar_0x8003: 0x8003, gSpecialVar_0x8004: 0x8004, gSpecialVar_0x8005: 0x8005,
  gSpecialVar_0x8006: 0x8006, gSpecialVar_0x8007: 0x8007, gSpecialVar_0x8008: 0x8008,
  gSpecialVar_0x8009: 0x8009, gSpecialVar_0x800A: 0x800A, gSpecialVar_0x800B: 0x800B,
  gSpecialVar_Facing: 0x800C, gSpecialVar_Result: 0x800D, gSpecialVar_ItemId: 0x800E,
  gSpecialVar_LastTalked: 0x800F, gSpecialVar_ContestRank: 0x8010,
  gSpecialVar_ContestCategory: 0x8011, gSpecialVar_MonBoxId: 0x8012,
  gSpecialVar_MonBoxPos: 0x8013, gSpecialVar_Unused_0x8014: 0x8014,
};
function specialVarGet(name) {
  markUsed('VarGet');
  return `VarGet(0x${SPECIAL_VARS[name].toString(16).toUpperCase()}) /* ${name} */`;
}
function specialVarSet(name, valueStr) {
  markUsed('VarSet');
  // +() : coercition C-exacte (bool8 → 0/1 ; nombre inchangé)
  const v = /^[0-9]+$|^0x[0-9a-fA-F]+$/.test(valueStr.trim()) ? valueStr : `+(${valueStr})`;
  return `VarSet(0x${SPECIAL_VARS[name].toString(16).toUpperCase()} /* ${name} */, ${v})`;
}

function resolvePreproc(src) {
  const lines = src.split('\n');
  const out = [];
  // pile : {active: bool (branche courante gardée), taken: bool (une branche déjà prise), parentActive}
  const stack = [];
  const isActive = () => stack.every((s) => s.active);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^\s*#\s*(if|ifdef|ifndef|elif|else|endif)\b(.*)$/);
    if (!m) { out.push(isActive() ? line : ''); continue; }
    const [, dir, restRaw] = m;
    const rest = restRaw.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '').trim();
    if (dir === 'ifdef' || dir === 'ifndef') {
      const known = PP_DEFINED.has(rest) || rest in PP_VALUES ? true : PP_UNDEFINED.has(rest) ? false : null;
      let cond;
      if (known === null) { flag(i + 1, 'preproc-inconnu', `#${dir} ${rest}`); cond = dir === 'ifdef' ? false : true; }
      else cond = dir === 'ifdef' ? known : !known;
      const parentActive = isActive();
      stack.push({ active: parentActive && cond, taken: cond, parentActive });
      out.push('');
    } else if (dir === 'if') {
      const parentActive = isActive();
      const cond = ppEval(rest, i + 1);
      stack.push({ active: parentActive && cond, taken: cond, parentActive });
      out.push('');
    } else if (dir === 'elif') {
      const s = stack[stack.length - 1];
      if (!s) { out.push(''); continue; }
      const cond = !s.taken && ppEval(rest, i + 1);
      s.active = s.parentActive && cond;
      if (cond) s.taken = true;
      out.push('');
    } else if (dir === 'else') {
      const s = stack[stack.length - 1];
      if (!s) { out.push(''); continue; }
      s.active = s.parentActive && !s.taken;
      s.taken = true;
      out.push('');
    } else { // endif
      stack.pop();
      out.push('');
    }
  }
  return out.join('\n');
}

// ─── SECTION 2 : DB constantes (headers décomp, #define + enum numériques) ───
function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
function stripCComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, '');
}
const constDB = new Map(); // name → {value, file, line}
function cConstEval(expr, localMap) {
  // évalue une expression constante C (entiers, ops, identifiants connus)
  const cleaned = expr.trim();
  if (!cleaned) return null;
  let ok = true;
  const js = cleaned
    .replace(/\b(0[xX][0-9a-fA-F]+|\d+)[uUlL]*\b/g, '$1')
    .replace(/\b[A-Za-z_]\w*\b/g, (n) => {
      if (localMap && localMap.has(n)) return `(${localMap.get(n)})`;
      if (constDB.has(n)) return `(${constDB.get(n).value})`;
      ok = false; return '0';
    });
  if (!ok) return null;
  if (/[^0-9a-fA-FxX+\-*/%()<>=!&|^~? :.\t ]/.test(js)) return null;
  try {
    const v = eval(js);
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch { return null; }
}
function buildGeneratedConstants() {
  // constantes générées au build par jsonproc (pas de header dans l'arbre)
  // region_map_sections : enum ordre JSON, puis MAPSEC_NONE, MAPSEC_COUNT (cf. *.constants.json.txt)
  const rmsPath = path.join(DECOMP, 'src', 'data', 'region_map', 'region_map_sections.json');
  if (fs.existsSync(rmsPath)) {
    const j = JSON.parse(fs.readFileSync(rmsPath, 'utf8'));
    let i = 0;
    for (const s of j.map_sections) constDB.set(s.id, { value: i++, file: 'generated:region_map_sections', line: 0 });
    constDB.set('MAPSEC_NONE', { value: i, file: 'generated:region_map_sections', line: 0 });
    constDB.set('MAPSEC_COUNT', { value: i + 1, file: 'generated:region_map_sections', line: 0 });
    constDB.set('METLOC_SPECIAL_EGG', { value: 0xFD, file: 'generated:region_map_sections', line: 0 });
    constDB.set('METLOC_IN_GAME_TRADE', { value: 0xFE, file: 'generated:region_map_sections', line: 0 });
    constDB.set('METLOC_FATEFUL_ENCOUNTER', { value: 0xFF, file: 'generated:region_map_sections', line: 0 });
  }
  // heal_locations : enum 1-based (template heal_locations.constants.json.txt)
  const hlPath = path.join(DECOMP, 'src', 'data', 'heal_locations.json');
  if (fs.existsSync(hlPath)) {
    const j = JSON.parse(fs.readFileSync(hlPath, 'utf8'));
    let i = 1;
    for (const s of j.heal_locations || []) constDB.set(s.id, { value: i++, file: 'generated:heal_locations', line: 0 });
  }
  // LOCALID_* par map (mapjson) : local id = index 1-based dans object_events du map.json
  const mapsDir = path.join(DECOMP, 'data', 'maps');
  if (fs.existsSync(mapsDir)) {
    for (const e of fs.readdirSync(mapsDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const mj = path.join(mapsDir, e.name, 'map.json');
      if (!fs.existsSync(mj)) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync(mj, 'utf8')); } catch { continue; }
      const evts = j.object_events || [];
      for (let k = 0; k < evts.length; k++) {
        const lid = evts[k].local_id;
        if (typeof lid === 'string' && lid.startsWith('LOCALID_') && !constDB.has(lid))
          constDB.set(lid, { value: k + 1, file: `generated:maps/${e.name}`, line: 0 });
      }
    }
  }
}
const mapConstKeys = new Set(); // clés MAP_* du record MAP_CONSTANTS (convention repo)
function buildMapConstKeys() {
  const p = path.join(REPO, 'include', 'constants', 'map_groups.ts');
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  let m;
  const re = /(MAP_\w+):/g;
  while ((m = re.exec(text))) mapConstKeys.add(m[1]);
}
function buildConstDB() {
  buildGeneratedConstants();
  buildMapConstKeys();
  const headers = [
    ...walk(path.join(DECOMP, 'include', 'constants'), ['.h']),
    ...walk(path.join(DECOMP, 'include'), ['.h']).filter((p) => !p.includes('constants')),
    ...walk(path.join(DECOMP, 'src'), ['.h']),
    path.join(DECOMP, 'include', 'config.h'),
  ].filter(fs.existsSync);
  // 2 passes pour les dépendances inter-headers
  for (let pass = 0; pass < 3; pass++) {
    for (const p of headers) {
      const rel = path.relative(DECOMP, p).replace(/\\/g, '/');
      const text = stripCComments(fs.readFileSync(p, 'utf8'));
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const dm = lines[i].match(/^\s*#\s*define\s+([A-Za-z_]\w*)\s+(.+?)\s*$/);
        if (dm && !/\(/.test(dm[1])) {
          const [, name, val] = dm;
          if (constDB.has(name)) continue;
          if (/^\(?\s*(0[xX][0-9a-fA-F]+|\d)/.test(val) || /^[A-Z(]/.test(val)) {
            const v = cConstEval(val);
            if (v !== null) constDB.set(name, { value: v, file: rel, line: i + 1 });
          }
        }
      }
      // enums
      const enumRe = /enum\b[^{;]*\{([^}]*)\}/g;
      let em;
      while ((em = enumRe.exec(text))) {
        let next = 0;
        for (const entry of em[1].split(',')) {
          const t = entry.trim();
          if (!t) continue;
          const eqM = t.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
          if (eqM) {
            const v = cConstEval(eqM[2]);
            if (v === null) { next = NaN; continue; }
            next = v;
            if (!constDB.has(eqM[1])) constDB.set(eqM[1], { value: v, file: rel, line: 0 });
          } else if (/^[A-Za-z_]\w*$/.test(t)) {
            if (!Number.isNaN(next) && !constDB.has(t)) constDB.set(t, { value: next, file: rel, line: 0 });
          }
          next++;
        }
      }
    }
  }
}

// ─── SECTION 3 : DB structs (champs ordonnés, headers + local) ───────────────
const structDB = new Map(); // name → {fields: [{name, type, dims, bitfield}], file}
function parseStructBody(body, name, file) {
  const fields = [];
  let depth = 0, buf = '';
  const decls = [];
  for (const ch of body) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === ';' && depth === 0) { decls.push(buf); buf = ''; continue; }
    buf += ch;
  }
  for (const d of decls) {
    const t = d.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    // ex: "u8 name[16]" / "struct Foo *bar" / "u16 species:9" / "void (*cb)(void)"
    const fnPtr = t.match(/\(\s*\*\s*(?:const\s+)?([A-Za-z_]\w*)\s*(\[[^\]]*\])?\s*\)\s*\(/);
    if (fnPtr) { fields.push({ name: fnPtr[1], type: 'fnptr', dims: fnPtr[2] || '', bitfield: null, ptr: 0 }); continue; }
    const m = t.match(/^(.*?)\s*(\**)\s*([A-Za-z_]\w*)\s*((?:\[[^\]]*\])*)\s*(?::\s*(\d+))?$/);
    if (!m) continue;
    const names = t.includes(',') ? null : [m[3]]; // multi-champs par ligne
    if (!names) {
      // "u8 a, b, c;" → split
      const head = t.match(/^([A-Za-z_][\w ]*?[\s*]+)/);
      if (head) {
        for (const piece of t.slice(head[1].length).split(',')) {
          const pm = piece.trim().match(/^(\**)\s*([A-Za-z_]\w*)\s*((?:\[[^\]]*\])*)\s*(?::\s*(\d+))?$/);
          if (pm) fields.push({ name: pm[2], type: head[1].replace(/\*/g, '').trim(), dims: pm[3], bitfield: pm[4] || null, ptr: (pm[1] || '').length + ((head[1].match(/\*/g) || []).length) });
        }
      }
      continue;
    }
    fields.push({ name: m[3], type: m[1].replace(/\*/g, '').trim(), dims: m[4], bitfield: m[5] || null, ptr: (m[2] || '').length + ((m[1].match(/\*/g) || []).length) });
  }
  if (fields.length) structDB.set(name, { fields, file });
}
function buildStructDB() {
  const headers = [...walk(path.join(DECOMP, 'include'), ['.h']), ...walk(path.join(DECOMP, 'src'), ['.h'])];
  for (const p of headers) {
    const rel = path.relative(DECOMP, p).replace(/\\/g, '/');
    const text = stripCComments(fs.readFileSync(p, 'utf8'));
    const re = /(?:struct|union)\s+([A-Za-z_]\w*)\s*\{/g;
    let m;
    while ((m = re.exec(text))) {
      let depth = 0, j = m.index + m[0].length - 1;
      for (; j < text.length; j++) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') { depth--; if (depth === 0) break; }
      }
      if (!structDB.has(m[1])) parseStructBody(text.slice(m.index + m[0].length, j), m[1], rel);
    }
  }
}

// ─── SECTION 3b : carte des définitions décomp (symbole → fichier .c/.h) ─────
// Sert au résolveur d'imports : préférer src/<base-du-.c-décomp>.ts.
const decompDefFile = new Map(); // name → base sans extension ('event_data', …)
const scriptLabels = new Set();  // labels asm data/ (EventScript_… — byte-VM = réfs par STRING)
function buildDecompDefMap() {
  const FN_DEF = /^[A-Za-z_][A-Za-z0-9_ \t*]*[ \t*]([A-Za-z_]\w*)[ \t]*\(([^;{}]*?)\)[ \t]*\r?\n\{/gm;
  const DATA_DEF = /^(?!extern\b)[A-Za-z_][^;{}()=\n]*[ \t*]([gs][A-Z]\w*)((?:\[[^\]\n]*\])+)?[ \t]*[=;]/gm;
  for (const p of walk(path.join(DECOMP, 'src'), ['.c'])) {
    const base = path.basename(p, '.c');
    const text = stripCComments(fs.readFileSync(p, 'utf8'));
    let m;
    for (const re of [FN_DEF, DATA_DEF]) {
      re.lastIndex = 0;
      while ((m = re.exec(text))) if (!decompDefFile.has(m[1])) decompDefFile.set(m[1], base);
    }
  }
  const LABEL_DEF = /^([A-Za-z_]\w*)::?[ \t]*(?:@.*)?$/gm;
  for (const p of walk(path.join(DECOMP, 'data'), ['.s', '.inc'])) {
    const text = fs.readFileSync(p, 'utf8');
    let m;
    LABEL_DEF.lastIndex = 0;
    while ((m = LABEL_DEF.exec(text))) scriptLabels.add(m[1]);
  }
}

// ─── SECTION 4 : parse tree-sitter (parser mis en cache pour le mode batch) ──
let _parser = null;
async function parseC(src) {
  if (!_parser) {
    const { Parser, Language } = require(path.join(REPO, 'node_modules', 'web-tree-sitter', 'web-tree-sitter.cjs'));
    await Parser.init();
    const C = await Language.load(path.join(REPO, 'node_modules', 'tree-sitter-c', 'tree-sitter-c.wasm'));
    _parser = new Parser();
    _parser.setLanguage(C);
  }
  return _parser.parse(src);
}

// ─── SECTION 5 : mapping types ───────────────────────────────────────────────
let symbolIndex = {}; // chargé au début de main() depuis ts-symbol-index.json
const SCALARS = new Set(['u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'int', 'char', 'short', 'long', 'unsigned', 'signed', 'size_t', 'vu8', 'vu16', 'vu32']);
const BOOLS = new Set(['bool8', 'bool16', 'bool32', 'bool']);
const UNSIGNED = new Set(['u8', 'u16', 'u32', 'u64', 'vu8', 'vu16', 'vu32', 'unsigned', 'size_t']);
const TYPED_ARRAY = { u8: 'Uint8Array', s8: 'Int8Array', u16: 'Uint16Array', s16: 'Int16Array', u32: 'Uint32Array', s32: 'Int32Array', vu8: 'Uint8Array', vu16: 'Uint16Array', vu32: 'Uint32Array', int: 'Int32Array', char: 'Uint8Array' };
// types structs → types TS existants (curated ; sinon interface locale / any+flag)
const TYPE_MAP = {
  'struct Sprite': { ts: 'DecompSprite', from: '../harness/runtime/decomp-runtime', typeOnly: true },
  'struct Task': { ts: 'DecompTask', from: '../harness/runtime/decomp-runtime', typeOnly: true },
  'struct Pokemon': { ts: 'Pokemon', from: './engine/battle/party-storage', typeOnly: true },
  'struct BoxPokemon': { ts: 'BoxPokemon', from: './engine/battle/party-storage', typeOnly: true },
  'struct WindowTemplate': { ts: 'WindowTemplate', from: './window', typeOnly: true },
  'struct BgTemplate': { ts: 'BgTemplate', from: './window', typeOnly: true },
  'struct SpriteTemplate': { ts: 'SpriteTemplate', from: './sprite', typeOnly: true },
  'struct OamData': { ts: 'OamData', from: './sprite', typeOnly: true },
  'struct SpriteSheet': { ts: 'SpriteSheet', from: './sprite', typeOnly: true },
  'struct SpritePalette': { ts: 'SpritePalette', from: './sprite', typeOnly: true },
};
function tsNameForStruct(fullType) {
  const bare = fullType.replace(/^struct |^union |^enum /, '');
  const mapped = TYPE_MAP[fullType] || TYPE_MAP['struct ' + bare];
  if (mapped) {
    if (symbolIndex[mapped.ts]) { addTypeImport(mapped); return mapped.ts; }
    return 'any';
  }
  if (localModuleNames.has(bare)) return bare; // interface locale émise dans ce fichier
  const e = symbolIndex[bare];
  if (e && e.length) {
    const pick = e.find((x) => x.file.startsWith('src/')) || e[0];
    addTypeImport({ ts: bare, from: importPathFor(pick.file) });
    return bare;
  }
  return 'any';
}
function tsTypeFor(cType, ptr, dims) {
  const t = cType.replace(/\b(const|volatile|static|extern)\b/g, '').replace(/\s+/g, ' ').trim();
  if (dims) {
    const base = t.replace(/^struct |^union |^enum /, '');
    if (TYPED_ARRAY[base]) return { ts: TYPED_ARRAY[base], kind: 'typedarray', elem: base };
    return { ts: null, kind: 'array', elem: t };
  }
  if (ptr > 1) return { ts: 'any', kind: 'ptrptr' }; // pointeur double → revue (déref/arith flaggés)
  if (ptr > 0) {
    if (t === 'void') return { ts: 'any', kind: 'any' };
    if (SCALARS.has(t)) return { ts: t === 'u8' || t === 'char' ? 'Uint8Array' : TYPED_ARRAY[t] || 'any', kind: 'scalarptr', elem: t };
    if (BOOLS.has(t)) return { ts: 'any', kind: 'scalarptr', elem: t };
    return { ts: tsNameForStruct(t), kind: 'structptr', structName: t.replace(/^struct |^union |^enum /, '') };
  }
  if (t === 'void') return { ts: 'void', kind: 'void' };
  if (BOOLS.has(t)) return { ts: 'boolean', kind: 'bool' };
  if (SCALARS.has(t)) return { ts: 'number', kind: 'num', unsigned: UNSIGNED.has(t), base: t };
  const bare = t.replace(/^struct |^union |^enum /, '');
  if (structDB.has(bare) || TYPE_MAP[t] || TYPE_MAP['struct ' + bare]) return { ts: tsNameForStruct(t), kind: 'struct', local: bare };
  return { ts: 'number', kind: 'num' }; // typedef scalaire inconnu (mapsec_u8_t…)
}

// ─── SECTION 6 : contexte d'émission ─────────────────────────────────────────
const usedIdents = new Set();     // identifiants libres émis (pour imports)
const localModuleNames = new Set(); // défini dans CE fichier (fns, data, defines, interfaces)
const fieldAliases = new Map();   // alias #define tFoo data[N] (usage APRÈS un point)
const bareAliases = new Map();    // alias #define sTimer sprite->data[0] (usage identifiant nu)
const exprMacros = new Map();     // #define M(a,b) expr → émis en const fléchée
const neededImports = new Map();  // module → Set(noms)
const neededTypeImports = new Map();
function markUsed(name) { if (!localModuleNames.has(name)) usedIdents.add(name); }

// ─── helpers émission ────────────────────────────────────────────────────────
function line(node) { return node.startPosition.row + 1; }
function idText(n) { return n.text; }

let SRC = ''; // source résolue (préproc appliqué)

// commentaire C → TS tel quel
function emitComment(node) { return node.text; }

// ─── SECTION 7 : émetteur d'expressions ──────────────────────────────────────
// ctx = { types: Map(name→typeinfo), boxed: Set(name), fn: {...} }
function emitExpr(n, ctx) {
  switch (n.type) {
    case 'identifier': {
      const name = n.text;
      if (name === 'TRUE' || name === 'FALSE') {
        // en comparaison (x == TRUE) → 1/0 (C : TRUE=1 ; évite number vs boolean)
        const p = n.parent;
        if (p && p.type === 'binary_expression') return name === 'TRUE' ? '1' : '0';
        return name === 'TRUE' ? 'true' : 'false';
      }
      if (name === 'NULL') return 'null';
      if (ctx && ctx.boxed.has(name)) return name + '.v';
      if (bareAliases.has(name)) return bareAliases.get(name); // #define sTimer sprite->data[0]
      if (/^gText_|^gJPText_|^sText_/.test(name) && !localModuleNames.has(name)) {
        report.gtext.push({ line: line(n), name });
        markUsed('getString');
        return `getString('${name}')`;
      }
      // MAP_X → MAP_CONSTANTS.MAP_X (convention repo include/constants/map_groups.ts)
      if (mapConstKeys.has(name) && !localModuleNames.has(name) && !symbolIndex[name]) {
        markUsed('MAP_CONSTANTS');
        return `MAP_CONSTANTS.${name}`;
      }
      // gSpecialVar_X (lecture) → VarGet (adaptation vars store byte-VM)
      if (SPECIAL_VARS[name] !== undefined && !localModuleNames.has(name)) return specialVarGet(name);
      // label script asm (EventScript_… data/) → STRING (convention byte-VM)
      if (!localModuleNames.has(name) && !symbolIndex[name] && !(ctx && ctx.types.has(name))
        && scriptLabels.has(name) && !decompDefFile.has(name)) {
        return `'${name}'`;
      }
      if (!(ctx && (ctx.types.has(name)))) markUsed(name);
      return name;
    }
    case 'number_literal': {
      let t = n.text.replace(/[uUlL]+$/, '');
      return t;
    }
    case 'char_literal': {
      const inner = n.text.slice(1, -1);
      const map = { '\\0': 0, '\\n': 10, '\\t': 9, '\\r': 13, '\\\\': 92, "\\'": 39 };
      if (inner in map) return String(map[inner]);
      if (inner.length === 1) return `${inner.charCodeAt(0)} /* '${inner}' */`;
      flag(line(n), 'char-literal', n.text);
      return `0 /* TRANSPILER-TODO ${n.text} */`;
    }
    case 'string_literal':
      return n.text; // JS string littéral compatible
    case 'concatenated_string':
      return n.children.filter((c) => c.type === 'string_literal').map((c) => c.text).join(' + ');
    case 'true': case 'false': {
      // TRUE/FALSE (parsés en nœuds true/false par tree-sitter-c) :
      // - comparaison (x == TRUE) → 1/0 (C : TRUE=1)
      // - affectation dans data[i]/tableau → 1/0 (slots numériques)
      // - sinon true/false (params/retours bool8 → boolean, convention repo)
      const on = n.type === 'true' ? '1' : '0';
      const off = n.type === 'true' ? 'true' : 'false';
      const p = n.parent;
      if (p && p.type === 'binary_expression') {
        // sauf si l'autre opérande est un bool CONNU (static/local boolean) → true/false
        const sib = p.childForFieldName('left');
        if (sib && sib.type === 'identifier' && sib.startIndex !== n.startIndex) {
          const st = (ctx && ctx.types.get(sib.text)) || moduleDataTypes.get(sib.text);
          if (st && st.kind === 'bool') return off;
        }
        return on;
      }
      if (p && p.type === 'assignment_expression') {
        const valueN = p.childForFieldName('right');
        if (valueN && valueN.startIndex === n.startIndex) {
          const left = p.childForFieldName('left');
          if (left && (left.type === 'subscript_expression'
            || (left.type === 'identifier' && bareAliases.has(left.text)))) return on; // data[N]
          if (left && left.type === 'identifier') {
            const mt = moduleDataTypes.get(left.text);
            if (mt && mt.kind === 'num') return on;   // static numérique (bool8 émis number)
          }
        }
      }
      return off;
    }
    case 'null': return 'null';
    case 'parenthesized_expression':
      return '(' + emitExpr(n.namedChildren[0], ctx) + ')';
    case 'unary_expression': {
      const op = n.child(0).text;
      const arg = n.childForFieldName('argument');
      return op + emitExpr(arg, ctx);
    }
    case 'pointer_expression': {
      const op = n.child(0).text;
      const arg = n.childForFieldName('argument');
      if (op === '&') {
        // &x : struct/array → référence directe ; scalaire boxé → la box
        if (arg.type === 'identifier' && ctx && ctx.boxed.has(arg.text)) return arg.text;
        if (arg.type === 'subscript_expression') {
          // &arr[i] : élément struct → référence OK ; élément SCALAIRE (data[4]…)
          // → passage par valeur silencieusement FAUX → flag
          const base = arg.childForFieldName('argument');
          const bi = base && base.type === 'identifier' && ctx ? ctx.types.get(base.text) || moduleDataTypes.get(base.text) : null;
          const KNOWN_STRUCT_ARRAYS = new Set(['gObjectEvents', 'gPlayerParty', 'gEnemyParty', 'gTasks', 'gSprites', 'gBattleMons', 'gSaveBlock1Ptr']);
          const isStructArray = (bi && (bi.kind === 'array' || bi.kind === 'struct'))
            || (base && base.type === 'identifier' && KNOWN_STRUCT_ARRAYS.has(base.text));
          if (!isStructArray) {
            flag(line(n), 'adresse-element', n.text.slice(0, 60));
            return emitExpr(arg, ctx) + ' /* TRANSPILER-TODO &élément scalaire (out-param ?) */';
          }
          return emitExpr(arg, ctx);
        }
        if (arg.type === 'identifier' || arg.type === 'field_expression')
          return emitExpr(arg, ctx);
        flag(line(n), 'adresse', n.text.slice(0, 60));
        return emitExpr(arg, ctx) + ' /* TRANSPILER-TODO & */';
      }
      // *x : déréférencement
      if (arg.type === 'identifier') {
        const ti = ctx && ctx.types.get(arg.text);
        if (ctx && ctx.boxed.has(arg.text)) return arg.text + '.v';
        if (ti && ti.kind === 'scalarptr') return emitExpr(arg, ctx) + '[0] /* *ptr */';
        return emitExpr(arg, ctx) + ' /* TRANSPILER-TODO deref */';
      }
      flag(line(n), 'deref', n.text.slice(0, 60));
      return emitExpr(arg, ctx) + ' /* TRANSPILER-TODO deref */';
    }
    case 'binary_expression': {
      const l = n.childForFieldName('left'), r = n.childForFieldName('right');
      const op = n.childForFieldName('operator').text;
      const ls = emitExpr(l, ctx), rs = emitExpr(r, ctx);
      // fns booléennes connues comparées à 0/1 (C bool8) → forme booléenne
      if ((op === '==' || op === '!=') && /^(FlagGet|IsPlayerDefeated)\(/.test(ls) && (rs === '0' || rs === '1')) {
        const truthy = (rs === '1') === (op === '==');
        return truthy ? ls : `!${ls}`;
      }
      if (op === '/') return `Math.trunc(${ls} / ${rs})`;
      if (op === '>>') {
        // >>> si l'opérande gauche est non-signée connue
        const ti = l.type === 'identifier' && ctx ? ctx.types.get(l.text) : null;
        if (ti && ti.kind === 'num' && ti.unsigned && ti.base === 'u32') return `${ls} >>> ${rs}`;
      }
      return `${ls} ${op} ${rs}`;
    }
    case 'assignment_expression': {
      const l = n.childForFieldName('left'), r = n.childForFieldName('right');
      const op = n.childForFieldName('operator').text;
      let rs = emitExpr(r, ctx);
      // gSpecialVar_X = / += / |= … → VarSet (adaptation vars store byte-VM)
      if (l.type === 'identifier' && SPECIAL_VARS[l.text] !== undefined && !localModuleNames.has(l.text)) {
        const name = l.text;
        if (op === '=') return specialVarSet(name, rs);
        return specialVarSet(name, `${specialVarGet(name)} ${op.slice(0, -1)} ${rs}`);
      }
      // gTasks[i].func = TaskFn / task->func = TaskFn → wrapper (t)=>fn(t.taskId)
      if (op === '=' && l.type === 'field_expression' && l.childForFieldName('field')
        && l.childForFieldName('field').text === 'func' && r.type === 'identifier' && r.text !== 'NULL') {
        markUsed(r.text);
        return `${emitExpr(l, ctx)} = (t: { taskId: number }) => ${r.text}(t.taskId)`;
      }
      // bool8 → slot numérique (data[N] = goingUp) : coercition C-exacte +()
      const leftIsDataSlot = l.type === 'subscript_expression'
        || (l.type === 'identifier' && bareAliases.has(l.text));
      if (leftIsDataSlot && op === '=' && r.type === 'identifier' && ctx) {
        const rti = ctx.types.get(r.text);
        if (rti && rti.kind === 'bool') rs = `+(${rs})`;
      }
      const ls = emitExpr(l, ctx);
      // lvalue intranspilable (*p++ = v…) → statement neutralisé compilable + flag
      if (ls.includes('TRANSPILER-TODO')) {
        flag(line(n), 'assign-intranspilable', n.text.slice(0, 70));
        return `void 0 /* TRANSPILER-TODO ASSIGN: ${n.text.replace(/\*\//g, '* /').slice(0, 90)} */`;
      }
      if (op === '/=') return `${ls} = Math.trunc(${ls} / ${rs})`;
      return `${ls} ${op} ${rs}`;
    }
    case 'update_expression': {
      const arg = n.childForFieldName('argument');
      const opN = n.childForFieldName('operator') || n.children.find((c) => c.type === '++' || c.type === '--');
      const op = opN.text;
      // gSpecialVar_X++ / -- → VarSet(VarGet ± 1)
      if (arg.type === 'identifier' && SPECIAL_VARS[arg.text] !== undefined && !localModuleNames.has(arg.text)) {
        return specialVarSet(arg.text, `${specialVarGet(arg.text)} ${op === '++' ? '+' : '-'} 1`);
      }
      const isPrefix = n.child(0).type === '++' || n.child(0).type === '--';
      const as = emitExpr(arg, ctx);
      // ptr++ sur pointeur non-boxé = arithmétique de pointeur
      if (arg.type === 'identifier' && ctx) {
        const ti = ctx.types.get(arg.text);
        if (ti && (ti.kind === 'structptr' || ti.kind === 'scalarptr' || ti.kind === 'ptrptr') && !ctx.boxed.has(arg.text)) {
          flag(line(n), 'ptr-arith', n.text);
          return `${as}${op} /* TRANSPILER-TODO ptr-arith */`;
        }
      }
      return isPrefix ? op + as : as + op;
    }
    case 'call_expression': {
      const fn = n.childForFieldName('function');
      const args = n.childForFieldName('arguments');
      const argList = args.namedChildren.filter((c) => c.type !== 'comment').map((c) => emitExpr(c, ctx));
      // « (u8)(expr) » mal parsé en call : fn = (identifiant type scalaire) → CAST
      if (fn.type === 'parenthesized_expression' && fn.namedChildren.length === 1
        && fn.namedChildren[0].type === 'identifier'
        && (SCALARS.has(fn.namedChildren[0].text) || BOOLS.has(fn.namedChildren[0].text))) {
        const t = fn.namedChildren[0].text;
        const v = argList.join(', ');
        const CASTS = {
          u8: `((${v}) & 0xFF)`, s8: `(((${v}) << 24) >> 24)`,
          u16: `((${v}) & 0xFFFF)`, s16: `(((${v}) << 16) >> 16)`,
          u32: `((${v}) >>> 0)`, s32: `((${v}) | 0)`, int: `((${v}) | 0)`,
          bool8: `!!(${v})`, bool16: `!!(${v})`, bool32: `!!(${v})`, bool: `!!(${v})`,
        };
        if (CASTS[t]) return CASTS[t];
      }
      if (fn.type === 'identifier') {
        const name = fn.text;
        if (name === 'sizeof') return emitSizeof(n, ctx);
        if (name === '_' || name === '__') { markUsed('encodeOwText'); return `encodeOwText(${argList.join(', ')})`; }
        if (name === 'ARRAY_COUNT') return `${argList[0]}.length`;
        if (name === 'GetMonData' && argList.length === 3 && (argList[2] === '0' || argList[2] === 'null')) {
          markUsed('GetMonData');
          return `GetMonData(${argList[0]}, ${argList[1]})`; // 3e arg data=NULL (scalaires) — signature repo 2 args
        }
        if (name === 'SetCameraPanningCallback' && argList[0] === '0') {
          markUsed(name);
          return `${name}(null)`; // C passe 0 = pas de callback
        }
        if (name === 'DestroySprite') {
          // Convention repo : DestroySprite(spriteId) — décomp passe &gSprites[id]
          const a0 = args.namedChildren.filter((c) => c.type !== 'comment')[0];
          const inner = a0 && a0.type === 'pointer_expression' ? a0.childForFieldName('argument') : a0;
          if (inner && inner.type === 'subscript_expression'
            && inner.childForFieldName('argument').text === 'gSprites') {
            markUsed(name);
            return `${name}(${emitExpr(inner.childForFieldName('index'), ctx)})`;
          }
        }
        if (name === 'CreateTask' || name === 'CreateTaskAtEnd') {
          // Pattern runtime OBLIGATOIRE : func reçoit le TASK OBJECT → (t)=>fn(t.taskId)
          // (DestroyTask(objet) = no-op silencieux = task zombie, leçon payée).
          const a0 = args.namedChildren.filter((c) => c.type !== 'comment')[0];
          if (a0 && a0.type === 'identifier') {
            markUsed(name);
            markUsed(a0.text);
            return `${name}((t: { taskId: number }) => ${a0.text}(t.taskId), ${argList.slice(1).join(', ')})`;
          }
        }
        if (name === 'FREE_AND_SET_NULL' || name === 'TRY_FREE_AND_SET_NULL')
          return `${argList[0]} = null /* ${name} — GC */`;
        if (name === 'Free' || name === 'FreeIfNotNull') return `void ${argList[0]} /* ${name} — GC */`;
        if (name === 'Alloc' || name === 'AllocZeroed') {
          // Alloc(sizeof(struct X)) / Alloc(sizeof(*sPtr)) → objet zéro 1:1
          // (exemption malloc = GC côté TS)
          const rawArgs = args.namedChildren.filter((c) => c.type !== 'comment');
          const a0 = rawArgs[0];
          if (rawArgs.length === 1 && a0 && a0.type === 'sizeof_expression') {
            const typeN = a0.childForFieldName('type');
            if (typeN) {
              const bare = typeN.text.replace(/\s+/g, ' ').replace(/^const /, '').replace(/^struct |^union /, '').trim();
              const z = zeroObjectFor(bare);
              if (z) return `(${z}) /* ${name}(sizeof(${typeN.text.replace(/\s+/g, ' ')})) */`;
            }
            // sizeof(*sPtr) : struct pointée par une var connue
            const valN = a0.childForFieldName('value');
            const deref = valN && (valN.type === 'pointer_expression' ? valN
              : valN.type === 'parenthesized_expression' && valN.namedChildren[0] && valN.namedChildren[0].type === 'pointer_expression' ? valN.namedChildren[0] : null);
            if (deref && deref.child(0).text === '*') {
              const target = deref.childForFieldName('argument');
              if (target && target.type === 'identifier') {
                const ti = (ctx && ctx.types.get(target.text)) || moduleDataTypes.get(target.text);
                if (ti && ti.structName) {
                  const z = zeroObjectFor(ti.structName);
                  if (z) return `(${z}) /* ${name}(sizeof(*${target.text})) */`;
                }
              }
            }
          }
          flag(line(n), 'alloc', n.text.slice(0, 60));
          return `({} as any) /* TRANSPILER-TODO ${name} */`;
        }
        if (name === 'memset' && argList.length === 3) {
          const dst = args.namedChildren.filter((c) => c.type !== 'comment')[0];
          const ti = dst && dst.type === 'identifier' && ctx ? ctx.types.get(dst.text) || moduleDataTypes.get(dst.text) : null;
          if (ti && ti.kind === 'typedarray' && ti.ts === 'Uint8Array') return `${argList[0]}.fill(${argList[1]}, 0, ${argList[2]})`;
          if (argList[1] === '0' && /\.length( \* \d+)?$/.test(argList[2].trim())) return `${argList[0]}.fill(0)`;
          flag(line(n), 'memset', n.text.slice(0, 60));
          return `${name}(${argList.join(', ')}) /* TRANSPILER-TODO memset */`;
        }
        if (name === 'memcpy' && argList.length === 3) {
          // memcpy(dst, src, sizeof(src|dst)) sur typed arrays → dst.set(src)
          if (/\.length( \* \d+)?$/.test(argList[2].trim())) return `${argList[0]}.set(${argList[1]})`;
          flag(line(n), 'memcpy', n.text.slice(0, 60));
          return `${name}(${argList.join(', ')}) /* TRANSPILER-TODO memcpy */`;
        }
        markUsed(name);
        return `${name}(${argList.join(', ')})`;
      }
      return `${emitExpr(fn, ctx)}(${argList.join(', ')})`;
    }
    case 'sizeof_expression':
      return emitSizeof(n, ctx);
    case 'field_expression': {
      const arg = n.childForFieldName('argument');
      const field = n.childForFieldName('field').text;
      // modèle PLAT ObjectEvent (adaptation repo) : X.currentCoords.x → X.currentCoordsX
      if ((field === 'x' || field === 'y') && arg.type === 'field_expression') {
        const innerField = arg.childForFieldName('field');
        if (innerField && (innerField.text === 'currentCoords' || innerField.text === 'previousCoords')) {
          const base = emitExpr(arg.childForFieldName('argument'), ctx);
          return `${base}.${innerField.text}${field.toUpperCase()}`;
        }
      }
      let as = emitExpr(arg, ctx);
      // static pointeur NULL-init (EWRAM) : accès membre → sFoo! (flux 1:1 = alloué avant usage)
      if (arg.type === 'identifier' && !(ctx && ctx.types.has(arg.text))) {
        const mt = moduleDataTypes.get(arg.text);
        if (mt && mt.kind === 'structptr') as = as + '!';
      }
      if (fieldAliases.has(field)) return `${as}.${fieldAliases.get(field)}`;
      return `${as}.${field}`;
    }
    case 'subscript_expression': {
      const arg = n.childForFieldName('argument');
      const idx = n.childForFieldName('index');
      return `${emitExpr(arg, ctx)}[${emitExpr(idx, ctx)}]`;
    }
    case 'cast_expression': {
      const type = n.childForFieldName('type');
      const value = n.childForFieldName('value');
      const vs = emitExpr(value, ctx);
      const tTxt = type.text.replace(/\s+/g, ' ').trim();
      const CASTS = {
        u8: (v) => `(${v} & 0xFF)`, s8: (v) => `((${v} << 24) >> 24)`,
        u16: (v) => `(${v} & 0xFFFF)`, s16: (v) => `((${v} << 16) >> 16)`,
        u32: (v) => `(${v} >>> 0)`, s32: (v) => `(${v} | 0)`,
        int: (v) => `(${v} | 0)`, bool8: (v) => `!!(${v})`, bool32: (v) => `!!(${v})`,
      };
      if (CASTS[tTxt]) return CASTS[tTxt](vs);
      if (tTxt === 'void') return `void ${vs}`;
      // cast pointeur/struct → transparent (référence objet)
      return vs;
    }
    case 'conditional_expression': {
      const c = n.childForFieldName('condition'), t = n.childForFieldName('consequence'), f = n.childForFieldName('alternative');
      return `${emitExpr(c, ctx)} ? ${emitExpr(t, ctx)} : ${emitExpr(f, ctx)}`;
    }
    case 'comma_expression': {
      const l = n.childForFieldName('left'), r = n.childForFieldName('right');
      return `(${emitExpr(l, ctx)}, ${emitExpr(r, ctx)})`;
    }
    case 'initializer_list':
      return emitInitList(n, null, ctx);
    case 'compound_literal_expression':
      flag(line(n), 'compound-literal', n.text.slice(0, 60));
      return emitInitList(n.childForFieldName('value'), null, ctx) + ' /* TRANSPILER-TODO compound literal */';
    default:
      flag(line(n), 'expr-inconnue', `${n.type}: ${n.text.slice(0, 60)}`);
      return `/* TRANSPILER-TODO ${n.type} */ ${n.text}`;
  }
}

function emitSizeof(n, ctx) {
  // sizeof(expr) / sizeof(type)
  const valueN = n.childForFieldName('value');
  const typeN = n.childForFieldName('type');
  if (valueN) {
    const inner = valueN.type === 'parenthesized_expression' ? valueN.namedChildren[0] : valueN;
    if (inner && inner.type === 'identifier') {
      const name = inner.text;
      const ti = (ctx && ctx.types.get(name)) || moduleDataTypes.get(name);
      if (ti && ti.kind === 'typedarray') {
        markUsed(name);
        const mult = { Uint16Array: 2, Int16Array: 2, Uint32Array: 4, Int32Array: 4 }[ti.ts];
        return mult ? `${name}.length * ${mult}` : `${name}.length`;
      }
      if (ti && ti.kind === 'array') { markUsed(name); return `${name}.length /* TRANSPILER: sizeof struct[] = éléments */`; }
      markUsed(name);
      flag(line(n), 'sizeof', n.text);
      return `${name}.length /* TRANSPILER-TODO sizeof */`;
    }
  }
  if (typeN) {
    const t = typeN.text.replace(/\s+/g, ' ').trim();
    const KNOWN = { u8: 1, s8: 1, u16: 2, s16: 2, u32: 4, s32: 4, 'struct Pokemon': 100, 'struct BoxPokemon': 80 };
    if (KNOWN[t] !== undefined) return `${KNOWN[t]} /* sizeof(${t}) */`;
  }
  flag(line(n), 'sizeof', n.text);
  return `0 /* TRANSPILER-TODO ${n.text} */`;
}

// ─── SECTION 8 : émetteur de statements ──────────────────────────────────────
function indentOf(depth) { return '  '.repeat(depth); }

function emitStatement(n, ctx, depth) {
  const ind = indentOf(depth);
  switch (n.type) {
    case 'comment': return ind + n.text;
    case 'compound_statement': {
      const inner = n.namedChildren.length
        ? n.children.filter((c) => c.type !== '{' && c.type !== '}').map((c) => emitStatement(c, ctx, depth + 1)).filter((s) => s !== null).join('\n')
        : '';
      return ind + '{\n' + inner + (inner ? '\n' : '') + ind + '}';
    }
    case 'expression_statement': {
      if (!n.namedChildren.length) return ind + ';';
      return ind + emitExpr(n.namedChildren[0], ctx) + ';';
    }
    case 'declaration': return emitLocalDecl(n, ctx, depth);
    case 'if_statement': {
      const cond = n.childForFieldName('condition');
      const cons = n.childForFieldName('consequence');
      const alt = n.childForFieldName('alternative');
      let s = ind + `if ${emitExpr(cond, ctx)}\n` + emitBlockOrSingle(cons, ctx, depth);
      if (alt) {
        const altStmt = alt.namedChildren[0];
        if (altStmt && altStmt.type === 'if_statement')
          s += '\n' + ind + 'else ' + emitStatement(altStmt, ctx, depth).slice(ind.length);
        else if (altStmt)
          s += '\n' + ind + 'else\n' + emitBlockOrSingle(altStmt, ctx, depth);
      }
      return s;
    }
    case 'while_statement': {
      const cond = n.childForFieldName('condition');
      const body = n.childForFieldName('body');
      return ind + `while ${emitExpr(cond, ctx)}\n` + emitBlockOrSingle(body, ctx, depth);
    }
    case 'do_statement': {
      const body = n.childForFieldName('body');
      const cond = n.childForFieldName('condition');
      return ind + 'do\n' + emitBlockOrSingle(body, ctx, depth) + `\n${ind}while ${emitExpr(cond, ctx)};`;
    }
    case 'for_statement': {
      const init = n.childForFieldName('initializer');
      const cond = n.childForFieldName('condition');
      const upd = n.childForFieldName('update');
      const body = n.childForFieldName('body');
      let initS = '';
      if (init) {
        if (init.type === 'declaration') { initS = emitLocalDecl(init, ctx, 0).trim().replace(/;$/, ''); }
        else initS = emitExpr(init, ctx);
      }
      const condS = cond ? emitExpr(cond, ctx) : '';
      const updS = upd ? emitExpr(upd, ctx) : '';
      return ind + `for (${initS}; ${condS}; ${updS})\n` + emitBlockOrSingle(body, ctx, depth);
    }
    case 'switch_statement': {
      const cond = n.childForFieldName('condition');
      const body = n.childForFieldName('body');
      const cases = body.namedChildren.map((c) => {
        if (c.type === 'comment') return indentOf(depth + 1) + c.text;
        if (c.type !== 'case_statement') return indentOf(depth + 1) + `/* TRANSPILER-TODO ${c.type} */`;
        const valueN = c.childForFieldName('value');
        const label = valueN ? `case ${emitExpr(valueN, ctx)}:` : 'default:';
        const stmts = c.namedChildren
          .filter((s) => !valueN || s.startIndex !== valueN.startIndex)
          .map((s) => emitStatement(s, ctx, depth + 2))
          .filter((s) => s !== null);
        return indentOf(depth + 1) + label + (stmts.length ? '\n' + stmts.join('\n') : '');
      });
      return ind + `switch ${emitExpr(cond, ctx)} {\n` + cases.join('\n') + '\n' + ind + '}';
    }
    case 'break_statement': return ind + 'break;';
    case 'continue_statement': return ind + 'continue;';
    case 'return_statement': {
      if (!n.namedChildren.length) return ind + 'return;';
      let v = emitExpr(n.namedChildren[0], ctx);
      // bool8 : return 0/1 → false/true (cohérence type boolean)
      if (ctx.fn.returnsBool) {
        if (v === '0') v = 'false';
        else if (v === '1') v = 'true';
      }
      return ind + `return ${v};`;
    }
    case 'goto_statement':
      flag(line(n), 'goto', n.text);
      return ind + `/* TRANSPILER-TODO goto */ ${n.text}`;
    case 'labeled_statement': {
      flag(line(n), 'label', n.text.split('\n')[0]);
      const inner = n.namedChildren.filter((c) => c.type !== 'statement_identifier').map((c) => emitStatement(c, ctx, depth)).join('\n');
      return ind + `/* TRANSPILER-TODO label ${n.childForFieldName('label') ? n.childForFieldName('label').text : ''}: */\n` + inner;
    }
    case 'preproc_call': case 'preproc_def': case 'preproc_function_def': {
      if (/^\s*#\s*undef\b/.test(n.text)) return null; // #undef alias : scoping C, sans objet
      flag(line(n), 'preproc-in-fn', n.text.split('\n')[0]);
      return ind + `/* TRANSPILER-TODO ${n.text.split('\n')[0]} */`;
    }
    case ';': case '{': case '}': return null;
    default:
      if (!n.isNamed) return null;
      flag(line(n), 'stmt-inconnu', `${n.type}: ${n.text.slice(0, 60)}`);
      return ind + `/* TRANSPILER-TODO ${n.type} */ ${n.text}`;
  }
}
function emitBlockOrSingle(n, ctx, depth) {
  if (!n) return indentOf(depth) + '{}';
  if (n.type === 'compound_statement') return emitStatement(n, ctx, depth);
  const s = emitStatement(n, ctx, depth + 1);
  return s === null ? indentOf(depth + 1) + ';' : s;
}

// déclaration locale → let/const (+ boxing si &pris)
function emitLocalDecl(n, ctx, depth) {
  const ind = indentOf(depth);
  const typeN = n.childForFieldName('type');
  const baseType = typeN ? typeN.text : 'int';
  const outs = [];
  if (/^\s*static\b/.test(n.text)) flag(line(n), 'static-local', n.text.split('\n')[0].slice(0, 60));
  for (const d of n.namedChildren) {
    if ((typeN && d.startIndex === typeN.startIndex) || d.type === 'comment') { if (d.type === 'comment') outs.push(ind + d.text); continue; }
    const info = analyzeDeclarator(d, baseType);
    if (!info) continue;
    const { name, ptr, dims, initN } = info;
    if (info.fnptr) {
      ctx.types.set(name, { kind: 'fnptr', ts: '(...args: any[]) => any' });
      outs.push(ind + `let ${name}: ((...args: any[]) => any) | null = ${initN && initN.text !== 'NULL' ? emitExpr(initN, ctx) : 'null'};`);
      continue;
    }
    const ti = tsTypeFor(baseType, ptr, dims.length ? dims : null);
    ti.dims = dims;
    ctx.types.set(name, ti);
    if (ctx.boxed.has(name)) {
      const init = initN ? emitExpr(initN, ctx) : '0';
      outs.push(ind + `const ${name} = { v: ${init} }; // TRANSPILER: &${name} pris → box`);
      continue;
    }
    if (dims.length) {
      if (ti.kind === 'typedarray') {
        if (initN) outs.push(ind + `const ${name} = ${ti.ts}.from(${emitInitList(initN, null, ctx)});`);
        else {
          const dimExprs = dims.map((dn) => emitExpr(dn, ctx));
          const sizeS = dimExprs.length === 1 ? dimExprs[0] : dimExprs.join(' * ');
          outs.push(ind + `const ${name} = new ${ti.ts}(${sizeS});${dims.length > 1 ? ' // TRANSPILER-TODO multi-dim aplati' : ''}`);
          if (dims.length > 1) flag(line(n), 'multi-dim-local', name);
        }
      } else {
        // tableau de structs local
        if (initN) outs.push(ind + `const ${name} = ${emitInitList(initN, baseType, ctx)};`);
        else { outs.push(ind + `const ${name}: any[] = []; // TRANSPILER-TODO tableau de ${baseType} non initialisé`); flag(line(n), 'struct-array-local', name); }
      }
      continue;
    }
    if (initN) {
      let init = emitExpr(initN, ctx);
      if (ti.kind === 'bool' && init === '0') init = 'false';
      if (ti.kind === 'bool' && init === '1') init = 'true';
      outs.push(ind + `let ${name} = ${init};`);
    } else {
      if (ti.kind === 'num') outs.push(ind + `let ${name} = 0;`);
      else if (ti.kind === 'bool') outs.push(ind + `let ${name} = false;`);
      else if (ti.kind === 'structptr' || ti.kind === 'scalarptr' || ti.kind === 'any') outs.push(ind + `let ${name}: any = null;`);
      else if (ti.kind === 'struct') {
        const z = zeroObjectFor(ti.local || ti.ts);
        if (z) outs.push(ind + `const ${name} = ${z};`);
        else { outs.push(ind + `const ${name}: any = {}; // TRANSPILER-TODO struct locale ${baseType}`); flag(line(n), 'struct-local', `${baseType} ${name}`); }
      } else outs.push(ind + `let ${name}: any = null;`);
    }
  }
  return outs.length ? outs.join('\n') : null;
}
function zeroObjectFor(structName) {
  const sd = structDB.get(structName);
  if (!sd || sd.fields.length > 24) return null;
  const parts = [];
  for (const f of sd.fields) {
    const base = f.type.replace(/^const /, '').replace(/^struct |^union /, '');
    if (f.dims) {
      if (TYPED_ARRAY[base]) {
        const dimsV = [...f.dims.matchAll(/\[([^\]]*)\]/g)].map((m) => cConstEval(m[1]));
        if (dimsV.every((v) => v !== null)) { parts.push(`${f.name}: new ${TYPED_ARRAY[base]}(${dimsV.reduce((a, b) => a * b, 1)})`); continue; }
      }
      return null;
    }
    if (f.type === 'fnptr' || f.ptr) { parts.push(`${f.name}: null as any`); continue; }
    if (SCALARS.has(base) || f.bitfield) parts.push(`${f.name}: 0`);
    else if (BOOLS.has(base)) parts.push(`${f.name}: false`);
    else return null;
  }
  return '{ ' + parts.join(', ') + ' }';
}

// analyse un declarator (pointeurs, dims, init, pointeurs de fonction)
function analyzeDeclarator(d, baseType) {
  let node = d, ptr = 0, initN = null, fnptr = false;
  if (node.type === 'init_declarator') { initN = node.childForFieldName('value'); node = node.childForFieldName('declarator'); }
  const dims = [];
  while (node) {
    if (node.type === 'pointer_declarator') { ptr++; node = node.childForFieldName('declarator'); }
    else if (node.type === 'array_declarator') { const s = node.childForFieldName('size'); dims.push(s || { type: 'number_literal', text: '0', startPosition: node.startPosition, namedChildren: [] }); node = node.childForFieldName('declarator'); }
    else if (node.type === 'function_declarator') {
      const inner = node.childForFieldName('declarator');
      // `void (*sCb)(void)` / `void (*const sFuncs[])(u8)` → data fn-pointer, pas un prototype
      if (inner && (inner.type === 'parenthesized_declarator'
        || inner.type === 'pointer_declarator' || inner.type === 'array_declarator')) { fnptr = true; node = inner; }
      else return null; // prototype
    }
    else if (node.type === 'parenthesized_declarator') node = node.namedChildren[0];
    else if (node.type === 'identifier') return { name: node.text, ptr, dims: dims.reverse(), initN, fnptr };
    else if (node.type === 'attribute_declaration' || node.type === 'ms_declspec_modifier') node = node.nextNamedSibling;
    else return null;
  }
  return null;
}

// ─── SECTION 9 : initialisateurs de data ─────────────────────────────────────
const moduleDataTypes = new Map(); // nom data module → typeinfo
function emitInitList(n, structType, ctx, depth = 1) {
  if (!n) return 'null';
  if (n.type !== 'initializer_list') return emitExpr(n, ctx);
  const ind = '  '.repeat(depth);
  const indEnd = '  '.repeat(depth - 1);
  const children = n.children.filter((c) => c.isNamed || c.type === 'comment');
  // objet struct ? → si initialisateurs désignés .champ, ou si structType connu
  const hasFieldDesig = children.some((c) => c.type === 'initializer_pair' && c.childForFieldName('designator') && c.text.trim().startsWith('.'));
  const bare = structType ? structType.replace(/^const /, '').replace(/^struct |^union |^enum /, '').trim() : null;
  const sd = bare ? structDB.get(bare) : null;
  if (hasFieldDesig || (sd && !children.every((c) => c.type === 'initializer_list'))) {
    // struct → objet { champ: valeur }
    const parts = [];
    let fieldIdx = 0;
    for (const c of children) {
      if (c.type === 'comment') { parts.push(ind + c.text); continue; }
      if (c.type === 'initializer_pair') {
        const desigs = c.children.filter((x) => x.type === 'field_designator' || x.type === 'subscript_designator');
        const valN = c.childForFieldName('value');
        if (desigs.length === 1 && desigs[0].type === 'field_designator') {
          const fname = desigs[0].text.slice(1);
          const fInfo = sd ? sd.fields.find((f) => f.name === fname) : null;
          parts.push(ind + `${fname}: ${emitInitValue(valN, fInfo, ctx, depth)},${fInfo && fInfo.bitfield ? ` /* :${fInfo.bitfield} */` : ''}`);
          if (sd) fieldIdx = sd.fields.findIndex((f) => f.name === fname) + 1;
        } else {
          flag(line(c), 'designator', c.text.slice(0, 50));
          parts.push(ind + `/* TRANSPILER-TODO ${c.text.slice(0, 50)} */`);
        }
      } else {
        // positionnel dans une struct
        const fInfo = sd && sd.fields[fieldIdx];
        if (fInfo) { parts.push(ind + `${fInfo.name}: ${emitInitValue(c, fInfo, ctx, depth)},`); fieldIdx++; }
        else { flag(line(c), 'init-positionnel', c.text.slice(0, 40)); parts.push(ind + `/* TRANSPILER-TODO champ ? */ ${emitExpr(c, ctx)},`); }
      }
    }
    return '{\n' + parts.join('\n') + '\n' + indEnd + '}';
  }
  // tableau (désigné [X]= ou séquentiel)
  const hasIdxDesig = children.some((c) => c.type === 'initializer_pair' && c.children.some((x) => x.type === 'subscript_designator'));
  if (hasIdxDesig) {
    const entries = [];
    let maxIdx = -1;
    for (const c of children) {
      if (c.type === 'comment') { entries.push({ comment: c.text }); continue; }
      if (c.type !== 'initializer_pair') { entries.push({ idx: maxIdx + 1, val: c, label: null }); maxIdx++; continue; }
      const desig = c.children.find((x) => x.type === 'subscript_designator');
      const valN = c.childForFieldName('value');
      const idxExpr = desig.namedChildren[0];
      const idxV = cConstEval(idxExpr.text, localConstMap);
      if (idxV === null) { flag(line(c), 'index-designé-irrésolu', idxExpr.text); entries.push({ comment: `/* TRANSPILER-TODO [${idxExpr.text}] */` }); continue; }
      entries.push({ idx: idxV, val: valN, label: idxExpr.text });
      if (idxV > maxIdx) maxIdx = idxV;
    }
    const arr = [];
    for (const e of entries) if (e.idx !== undefined) arr[e.idx] = e;
    const parts = [];
    for (const e of entries) if (e.comment) parts.push(ind + e.comment);
    for (let i = 0; i <= maxIdx; i++) {
      const e = arr[i];
      if (!e) { parts.push(ind + `null as any, /* [${i}] absent */`); continue; }
      parts.push(ind + `${emitInitValue(e.val, null, ctx, depth, structType)},${e.label && !/^\d+$/.test(e.label) ? ` // [${e.label}]` : ''}`);
    }
    return '[\n' + parts.join('\n') + '\n' + indEnd + ']';
  }
  // séquentiel
  const parts = [];
  for (const c of children) {
    if (c.type === 'comment') { parts.push(ind + c.text); continue; }
    parts.push(ind + emitInitValue(c, null, ctx, depth, structType) + ',');
  }
  return '[\n' + parts.join('\n') + '\n' + indEnd + ']';
}
function emitInitValue(n, fieldInfo, ctx, depth, elemStructType) {
  if (!n) return '0';
  if (n.type === 'initializer_list') {
    // sous-init : struct champ, sous-tableau, ou élément de tableau de structs
    const t = fieldInfo ? fieldInfo.type : elemStructType || null;
    return emitInitList(n, t, ctx, depth + 1);
  }
  let v = emitExpr(n, ctx);
  if (fieldInfo && !fieldInfo.ptr && !fieldInfo.dims) {
    const base = fieldInfo.type.replace(/^const /, '').trim();
    // wrap C : littéral négatif stocké dans un champ non-signé (u16 flag = -1 → 0xFFFF)
    if (UNSIGNED.has(base) && /^-\d/.test(v.trim())) {
      const bits = base === 'u8' ? 0xFF : base === 'u16' ? 0xFFFF : null;
      v = bits !== null ? `(${v} & 0x${bits.toString(16).toUpperCase()}) /* wrap C ${base} */` : `((${v}) >>> 0) /* wrap C u32 */`;
    }
    // TRUE/FALSE dans un champ numérique → 1/0
    if (SCALARS.has(base) && (v === 'true' || v === 'false')) v = v === 'true' ? '1' : '0';
  }
  return v;
}
let localConstMap = new Map(); // #define locaux numériques (pour index désignés)

// ─── SECTION 10 : boxing — trouver les &scalaires ────────────────────────────
function collectBoxedLocals(fnBody, types) {
  const boxed = new Set();
  (function walkN(n) {
    if (n.type === 'pointer_expression' && n.child(0).text === '&') {
      const arg = n.childForFieldName('argument');
      if (arg && arg.type === 'identifier') {
        const ti = types.get(arg.text);
        if (ti && (ti.kind === 'num' || ti.kind === 'bool')) boxed.add(arg.text);
      }
    }
    for (let i = 0; i < n.childCount; i++) walkN(n.child(i));
  })(fnBody);
  return boxed;
}
// pré-scan des types de locaux (avant émission, pour boxing)
function prescanLocalTypes(fnBody, ctx) {
  (function walkN(n) {
    if (n.type === 'declaration') {
      const typeN = n.childForFieldName('type');
      const baseType = typeN ? typeN.text : 'int';
      for (const d of n.namedChildren) {
        if (typeN && d.startIndex === typeN.startIndex) continue;
        const info = analyzeDeclarator(d, baseType);
        if (info) {
          const ti = tsTypeFor(baseType, info.ptr, info.dims.length ? info.dims : null);
          ti.dims = info.dims;
          ctx.types.set(info.name, ti);
        }
      }
    }
    if (n.type === 'compound_statement' || n.type === 'declaration' || n.isNamed)
      for (let i = 0; i < n.childCount; i++) walkN(n.child(i));
  })(fnBody);
}

// ─── SECTION 11 : traitement top-level ───────────────────────────────────────
async function main() {
  if (!fs.existsSync(INDEX_PATH)) { console.error(`index manquant — lancer d'abord scripts/build-ts-symbol-index.cjs`); process.exit(1); }
  symbolIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')).symbols;
  buildConstDB();
  buildStructDB();
  buildDecompDefMap();
  console.log(`DB: ${constDB.size} constantes, ${structDB.size} structs, ${decompDefFile.size} défs décomp, ${Object.keys(symbolIndex).length} symboles TS`);

  let targets = [];
  if (rankMode) {
    const closure = path.join(REPO, 'audit-reports', 'callgraph-closure.json');
    if (!fs.existsSync(closure)) { console.error('closure JSON manquant — lancer scripts/audit-callgraph-closure.cjs'); process.exit(1); }
    const pf = JSON.parse(fs.readFileSync(closure, 'utf8')).perFile;
    targets = Object.entries(pf)
      .filter(([f, v]) => f.startsWith('src/') && f.endsWith('.c') && v.ported === 0 && v.total > 0)
      .map(([f]) => f);
    console.log(`--rank : ${targets.length} fichiers 0% porté\n`);
  } else if (batchArg) {
    targets = batchArg.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    targets = [fileArg];
  }

  const rankings = [];
  for (const t of targets) {
    try {
      const r = await transpileOne(t);
      if (r) rankings.push(r);
    } catch (e) {
      console.error(`  ✗ ${t} : ${e.message}`);
      rankings.push({ file: t, error: e.message });
    }
  }
  if (rankMode) {
    rankings.sort((a, b) => (a.unresolved ?? 999) - (b.unresolved ?? 999) || (b.fns ?? 0) - (a.fns ?? 0));
    console.log('\n=== CLASSEMENT (moins de trous d\'abord) ===');
    console.log('fichier                                   fns  data  flags  NON-RÉSOLUS');
    for (const r of rankings) {
      if (r.error) { console.log(`${r.file.padEnd(42)} ERREUR: ${r.error.slice(0, 60)}`); continue; }
      console.log(`${r.file.padEnd(42)} ${String(r.fns).padStart(4)} ${String(r.data).padStart(5)} ${String(r.flagCount).padStart(6)} ${String(r.unresolved).padStart(4)}  ${r.unresolvedNames.slice(0, 6).join(', ')}${r.unresolvedNames.length > 6 ? ` +${r.unresolvedNames.length - 6}` : ''}`);
    }
    const rankOut = path.join(REPORT_DIR, '_rank.json');
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    fs.writeFileSync(rankOut, JSON.stringify(rankings, null, 1));
    console.log(`\nJSON : ${rankOut}`);
  }
}

// ─── flat-union TVShow (round 7) ─────────────────────────────────────────────
// L'union TVShow (global.tv.h:6-493, 34 vues sur les mêmes 0x24 bytes) est
// aplatie PAR NOM chez nous (même adaptation actée que les coords plats
// d'ObjectEvent) : on supprime le segment de vue (`show.pokemonToday.kind` →
// `show.kind`). Sûr car le round-trip write/read passe par les mêmes noms
// (StorePlayerIdIn*Show ↔ lectures common.trainerId*). Garde-fous :
//  - `.common.` seulement devant les champs de TVShowCommon (générique sinon) ;
//  - `.frontier.` PAS après gSaveBlock2Ptr (frontier = struct save distincte).
// ⚠️ `.commonInit.data[j]` (reset byte-level) devient `.data[j]` → à corriger
// à la main en reset de slot (flag `flat-union-reset` émis pour le rapport).
const TVSHOW_COMMON_FIELDS = 'kind|active|data|srcTrainerId3Lo|srcTrainerId3Hi|srcTrainerId2Lo|srcTrainerId2Hi|srcTrainerIdLo|srcTrainerIdHi|trainerIdLo|trainerIdHi';
const TVSHOW_UNION_VIEWS = [
  'commonInit', 'fanclubLetter', 'recentHappenings', 'fanclubOpinions', 'dummy',
  'nameRaterShow', 'bravoTrainer', 'bravoTrainerTower', 'contestLiveUpdates',
  'threeCheers', 'battleUpdate', 'fanClubSpecial', 'contestLady', 'pokemonToday',
  'smartshopperShow', 'pokemonTodayFailed', 'pokemonAngler', 'worldOfMasters',
  'rivalTrainer', 'trendWatcher', 'treasureInvestigators', 'findThatGamer',
  'breakingNews', 'secretBaseVisit', 'lottoWinner', 'battleSeminar',
  'trainerFanClub', 'cuties', 'frontier', 'numberOne', 'secretBaseSecrets',
  'safariFanClub', 'massOutbreak',
];
function flattenTvShowUnions(text) {
  text = text.replace(new RegExp(`\\.common\\.(${TVSHOW_COMMON_FIELDS})\\b`, 'g'), '.$1');
  for (const view of TVSHOW_UNION_VIEWS) {
    if (view === 'frontier') {
      text = text.replace(/(?<!gSaveBlock2Ptr)\.frontier\./g, '.');
    } else {
      text = text.replace(new RegExp(`\\.${view}\\.`, 'g'), '.');
    }
  }
  return text;
}

async function transpileOne(fileRel) {
  resetFileState(fileRel, targetsSingle() ? outArg : null);
  if (!fs.existsSync(cPath)) throw new Error(`introuvable : ${cPath}`);
  if (!rankMode) console.log(`— transpile ${cRel} → ${path.relative(REPO, outPath)}`);
  if (fs.existsSync(outPath) && !force && !toStdout && !dryRun) {
    console.error(`  REFUS : ${outPath} existe déjà (--force pour écraser).`);
    return null;
  }

  const raw = fs.readFileSync(cPath, 'utf8');
  SRC = resolveSpriteDims(resolvePreproc(raw));
  const tree = await parseC(SRC);
  const root = tree.rootNode;

  const chunks = []; // morceaux de sortie top-level (ordre source)
  const fns = [];
  const interfaces = [];
  let nData = 0, nFns = 0, nDefines = 0;

  // pass 1 : noms module-level (pour markUsed) + macros locales
  for (let i = 0; i < root.childCount; i++) {
    const n = root.child(i);
    if (n.type === 'function_definition') {
      const decl = n.childForFieldName('declarator');
      const nameN = findFnName(decl);
      if (nameN) localModuleNames.add(nameN.text);
    } else if (n.type === 'declaration') {
      const typeN = n.childForFieldName('type');
      for (const d of n.namedChildren) {
        if (typeN && d.startIndex === typeN.startIndex) continue;
        const info = analyzeDeclarator(d, typeN ? typeN.text : 'int');
        if (info) localModuleNames.add(info.name);
      }
    } else if (n.type === 'preproc_def') {
      const nameN = n.childForFieldName('name');
      if (nameN) localModuleNames.add(nameN.text);
    } else if (n.type === 'preproc_function_def') {
      const nameN = n.childForFieldName('name');
      if (nameN) localModuleNames.add(nameN.text);
    } else if (n.type === 'type_definition' || n.type === 'struct_specifier' || n.type === 'union_specifier' || n.type === 'enum_specifier') {
      // types locaux : enregistrer le nom de struct tôt (refs interfaces croisées)
      const findStruct = (x) => (x.type === 'struct_specifier' || x.type === 'union_specifier') ? x : x.namedChildren.map(findStruct).find(Boolean);
      const st = findStruct(n);
      if (st && st.childForFieldName('body')) {
        const nameN = st.childForFieldName('name');
        if (nameN) localModuleNames.add(nameN.text);
      }
    }
  }

  // pass 1b : defines locaux → const/alias/macro
  for (let i = 0; i < root.childCount; i++) {
    const n = root.child(i);
    if (n.type === 'preproc_def') {
      const name = n.childForFieldName('name').text;
      const valN = n.childForFieldName('value');
      if (!valN) { localModuleNames.delete(name); continue; }
      const valTxt = valN.text.trim();
      // alias champ : #define tState data[1] → usage `gTasks[i].tState` (après un point)
      // ET usage nu `tState` (fns avec local `s16 *data = gTasks[taskId].data`)
      const aliasM = valTxt.match(/^data\[(\w+)\]$/);
      if (aliasM) {
        fieldAliases.set(name, `data[${aliasM[1]}] /* ${name} */`);
        bareAliases.set(name, `data[${aliasM[1]}] /* ${name} */`);
        localModuleNames.delete(name);
        continue;
      }
      // alias nu : #define sTimer sprite->data[0] / #define tX gTasks[taskId].data[2]
      const bareM = valTxt.match(/^(\w+(?:\[\w+\])?(?:->|\.)\w+(?:\[\w+\])*(?:(?:->|\.)\w+(?:\[\w+\])*)*)$/);
      if (bareM && /(->|\.)/.test(valTxt)) {
        bareAliases.set(name, `${valTxt.replace(/->/g, '.')} /* ${name} */`);
        localModuleNames.delete(name);
        continue;
      }
      const v = cConstEval(valTxt, localConstMap);
      if (v !== null) localConstMap.set(name, v);
    }
  }

  // pass 2 : émission dans l'ordre source
  for (let i = 0; i < root.childCount; i++) {
    const n = root.child(i);
    switch (n.type) {
      case 'comment':
        chunks.push(n.text);
        break;
      case 'preproc_include':
        break; // imports gérés par le résolveur
      case 'preproc_def': {
        const name = n.childForFieldName('name').text;
        const valN = n.childForFieldName('value');
        if (!valN) break;
        if (fieldAliases.has(name) || bareAliases.has(name)) { chunks.push(`// #define ${name} ${valN.text.trim()}  (alias — expansé aux usages)`); break; }
        const tsVal = emitDefineValue(valN.text.trim());
        chunks.push(`const ${name} = ${tsVal}; // 1:1 ${baseName}.c:${line(n)}`);
        nDefines++;
        break;
      }
      case 'preproc_function_def': {
        const name = n.childForFieldName('name').text;
        const params = n.childForFieldName('parameters');
        const valN = n.childForFieldName('value');
        if (!valN) break;
        const paramNames = params ? params.text.replace(/[()]/g, '').split(',').map((s) => s.trim()).filter(Boolean) : [];
        const body = emitDefineValue(valN.text.trim());
        chunks.push(`const ${name} = (${paramNames.map((p) => `${p}: number`).join(', ')}) => ${body}; // 1:1 macro ${baseName}.c:${line(n)}`);
        exprMacros.set(name, true);
        nDefines++;
        break;
      }
      case 'type_definition': case 'struct_specifier': case 'union_specifier': case 'enum_specifier': {
        const out = emitTypeDef(n);
        if (out) { chunks.push(out); if (out.startsWith('interface') || out.includes('\ninterface')) interfaces.push(out); }
        break;
      }
      case 'declaration': {
        const out = emitTopDecl(n);
        if (out !== null) { chunks.push(out); nData++; }
        break;
      }
      case 'function_definition': {
        const out = emitFunction(n);
        if (out) { chunks.push(out); fns.push(out); nFns++; }
        break;
      }
      case 'preproc_call':
        if (!/^\s*#\s*undef\b/.test(n.text)) flag(line(n), 'top-level-inconnu', n.text.split('\n')[0]);
        break;
      case 'ERROR':
        flag(line(n), 'parse-error', n.text.slice(0, 100));
        chunks.push(`/* TRANSPILER-TODO parse-error (${baseName}.c:${line(n)}) :\n${n.text.slice(0, 400)}\n*/`);
        break;
      case 'expression_statement': case ';':
        break;
      default:
        if (n.isNamed) flag(line(n), 'top-level-inconnu', `${n.type}: ${n.text.slice(0, 60)}`);
        break;
    }
  }

  // ─── imports ───────────────────────────────────────────────────────────────
  const importBlock = resolveImports();

  const header = `/**
 * ${baseName}.ts — miroir 1:1 de \`${DECOMP}/src/${baseName}.c\` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/${baseName}.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */
`;
  let body = header + '\n' + importBlock + '\n' + chunks.join('\n\n') + '\n';
  // flat-union TVShow : seulement si la source utilise le type (tv.c, battle_tv.c…).
  if (/\bTVShow\b/.test(SRC)) {
    body = flattenTvShowUnions(body);
    for (const m of body.matchAll(/^.*\.data\[[^\]]*\]\s*=\s*0.*$/gm)) {
      flag(0, 'flat-union-reset', m[0].trim().slice(0, 80));
    }
  }

  // ─── rapport ───────────────────────────────────────────────────────────────
  report.stats = { fns: nFns, data: nData, defines: nDefines, flags: report.flags.length, unresolved: report.unresolved.size, gtext: report.gtext.length };
  const ranking = {
    file: cRel, fns: nFns, data: nData, defines: nDefines, flagCount: report.flags.length,
    unresolved: report.unresolved.size, unresolvedNames: [...report.unresolved.keys()],
    flagKinds: [...new Set(report.flags.map((f) => f.kind))],
  };
  if (rankMode) return ranking;

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, baseName + '.md');
  const flagLines = report.flags.map((f) => `- :${f.line} **${f.kind}** — \`${(f.detail || '').replace(/`/g, "'")}\``);
  const unresolvedLines = [...report.unresolved.entries()].map(([n, lines]) => `- \`${n}\` (${lines.slice(0, 5).join(', ')}${lines.length > 5 ? '…' : ''})`);
  fs.writeFileSync(reportPath, `# transpile ${baseName}.c → ${path.relative(REPO, outPath)}

stats: ${JSON.stringify(report.stats)}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
${unresolvedLines.join('\n') || '(aucun)'}

## Flags TRANSPILER-TODO
${flagLines.join('\n') || '(aucun)'}

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
${report.gtext.map((g) => `- :${g.line} ${g.name}`).join('\n') || '(aucun)'}
`);

  if (toStdout) console.log(body);
  else if (!dryRun) { fs.writeFileSync(outPath, body); console.log(`  écrit : ${outPath}`); }
  console.log(`  ${nFns} fns · ${nData} data · ${nDefines} defines · ${report.flags.length} flags · ${report.unresolved.size} non-résolus`);
  console.log(`  rapport : ${reportPath}`);
  return ranking;
}
function targetsSingle() { return !!fileArg && !batchArg && !rankMode; }

function emitDefineValue(txt) {
  // valeur de #define → expression TS (heuristique légère : réutilise l'émetteur si parsable)
  return txt
    .replace(/\b(0[xX][0-9a-fA-F]+|\d+)[uUlL]+\b/g, '$1')
    .replace(/\bTRUE\b/g, 'true').replace(/\bFALSE\b/g, 'false').replace(/\bNULL\b/g, 'null');
}

function findFnName(decl) {
  let node = decl;
  while (node) {
    if (node.type === 'function_declarator') node = node.childForFieldName('declarator');
    else if (node.type === 'pointer_declarator') node = node.childForFieldName('declarator');
    else if (node.type === 'parenthesized_declarator') node = node.namedChildren[0];
    else if (node.type === 'identifier') return node;
    else return null;
  }
  return null;
}

// ─── types top-level ─────────────────────────────────────────────────────────
function emitTypeDef(n) {
  // struct locale → interface ; enum → consts
  const findStruct = (x) => x.type === 'struct_specifier' || x.type === 'union_specifier' ? x : x.namedChildren.map(findStruct).find(Boolean);
  const findEnum = (x) => x.type === 'enum_specifier' ? x : x.namedChildren.map(findEnum).find(Boolean);
  const en = findEnum(n);
  if (en && en.childForFieldName('body')) {
    const lines = [];
    let next = 0;
    for (const item of en.childForFieldName('body').namedChildren) {
      if (item.type === 'comment') { lines.push(item.text); continue; }
      if (item.type !== 'enumerator') continue;
      const name = item.childForFieldName('name').text;
      const valN = item.childForFieldName('value');
      let v;
      if (valN) { v = cConstEval(valN.text, localConstMap); if (v === null) { flag(line(item), 'enum-irrésolu', valN.text); v = valN.text; } }
      else v = next;
      if (typeof v === 'number') { next = v + 1; localConstMap.set(name, v); }
      lines.push(`const ${name} = ${typeof v === 'number' ? v : emitDefineValue(String(v))};`);
      localModuleNames.add(name);
    }
    return `// enum ${baseName}.c:${line(n)}\n` + lines.join('\n');
  }
  const st = findStruct(n);
  if (st && st.childForFieldName('body')) {
    const nameN = st.childForFieldName('name');
    const structName = nameN ? nameN.text : (n.type === 'type_definition' ? (n.childForFieldName('declarator') || {}).text : null);
    if (!structName) { flag(line(n), 'struct-anonyme', n.text.slice(0, 60)); return null; }
    parseStructBody(stripCComments(st.childForFieldName('body').text.slice(1, -1)), structName, cRel);
    const sd = structDB.get(structName);
    if (!sd) return null;
    localModuleNames.add(structName);
    const fieldLines = sd.fields.map((f) => {
      const base = f.type.replace(/^const /, '').replace(/volatile /, '').replace(/^struct |^union |^enum /, '').trim();
      let ts;
      if (f.type === 'fnptr') ts = '((...args: any[]) => any) | null';
      else if (f.ptr && (base === 'u8' || base === 'char')) ts = 'Uint8Array'; // pointeur texte/buffer
      else if (f.ptr && TYPED_ARRAY[base]) ts = TYPED_ARRAY[base];
      else if (f.ptr && structDB.has(base)) { const tn = tsNameForStruct('struct ' + base); ts = tn === 'any' ? 'any' : `${tn} | null`; }
      else if (f.ptr) ts = 'any';
      else if (f.dims && TYPED_ARRAY[base]) ts = TYPED_ARRAY[base];
      else if (f.dims) { const tn = structDB.has(base) ? tsNameForStruct('struct ' + base) : 'any'; ts = `${tn}[]`; }
      else if (BOOLS.has(base)) ts = 'boolean';
      else if (SCALARS.has(base) || f.bitfield) ts = 'number';
      else if (structDB.has(base)) ts = tsNameForStruct('struct ' + base);
      else ts = 'number';
      return `  ${f.name}: ${ts};${f.bitfield ? ` // :${f.bitfield}` : ''}`;
    });
    const uni = n.text.startsWith('union') || (st.type === 'union_specifier');
    if (uni) flag(line(n), 'union', structName);
    return `/** 1:1 \`${uni ? 'union' : 'struct'} ${structName}\` (${baseName}.c:${line(n)}). */\ninterface ${structName} {\n${fieldLines.join('\n')}\n}`;
  }
  return null;
}

// ─── data top-level ──────────────────────────────────────────────────────────
function emitTopDecl(n) {
  const typeN = n.childForFieldName('type');
  const baseType = typeN ? typeN.text : 'int';
  const txt = n.text;
  const isExtern = /^\s*extern\b/.test(txt);
  const isStatic = /^\s*static\b/.test(txt);
  const outs = [];
  for (const d of n.namedChildren) {
    if (typeN && d.startIndex === typeN.startIndex) continue;
    if (d.type === 'comment') { outs.push(d.text); continue; }
    const info = analyzeDeclarator(d, baseType);
    if (!info) {
      // prototype de fonction ?
      if (d.text.includes('(')) continue; // forward decl → skip (hoisting TS)
      continue;
    }
    const { name, ptr, dims, initN } = info;
    if (isExtern) { localModuleNames.delete(name); continue; } // résolu via imports
    const exportKw0 = isStatic ? '' : 'export ';
    // pointeur(s) de fonction (tables d'état, callbacks)
    if (info.fnptr) {
      const fnT = '(...args: any[]) => any';
      if (dims.length) {
        if (initN) outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw0}const ${name}: Array<${fnT}> = ${emitInitList(initN, null, null)};`);
        else { const dimsV = dims.map((x) => cConstEval(x.text, localConstMap) ?? 0); outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw0}const ${name}: Array<(${fnT}) | null> = Array.from({ length: ${dimsV[0] || 0} }, () => null);`); }
      } else {
        outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw0}let ${name}: (${fnT}) | null = ${initN && initN.text !== 'NULL' ? emitExpr(initN, null) : 'null'};`);
      }
      moduleDataTypes.set(name, { kind: 'fnptr', ts: fnT });
      continue;
    }
    // INCBIN / INCGFX ?
    if (initN && /^INC(BIN|GFX)/.test(initN.text)) {
      const m = initN.text.match(/\(\s*"([^"]+)"/);
      flag(line(d), 'incbin', `${name} ← ${m ? m[1] : initN.text.slice(0, 50)}`);
      outs.push(`// TRANSPILER-TODO INCGFX : ${name} ← ${m ? m[1] : ''} (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))\nlet ${name}: any = null;`);
      continue;
    }
    const exportKw = isStatic ? '' : 'export ';
    const ti = tsTypeFor(baseType, ptr, dims.length ? dims : null);
    moduleDataTypes.set(name, ti);
    const constV = /\bconst\b/.test(baseType) || /\bconst\b/.test(txt.split(name)[0] || '');
    if (dims.length && ti.kind === 'typedarray') {
      if (initN && initN.type !== 'initializer_list')
        outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name} = ${emitExpr(initN, null)};`);
      else if (initN && dims.length > 1) {
        // multi-dim scalaire → tableaux imbriqués (indexation [i][j] 1:1)
        moduleDataTypes.set(name, { kind: 'array', ts: 'number[][]' });
        outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name}: number[][] = ${emitInitList(initN, null, null)};`);
      }
      else if (initN) outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name} = ${ti.ts}.from(${emitInitList(initN, null, null)});`);
      else {
        const dimsV = dims.map((x) => cConstEval(x.text, localConstMap) ?? x.text);
        outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name} = new ${ti.ts}(${dimsV.join(' * ')});`);
      }
    } else if (dims.length) {
      // tableau de structs / de pointeurs / multi-dim non scalaire
      const elemT = ptr > 0 ? null : baseType;
      if (initN) outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name} = ${emitInitList(initN, elemT, null)};`);
      else {
        const dimsV = dims.map((x) => cConstEval(x.text, localConstMap) ?? 0);
        const z = elemT ? zeroObjectFor(elemT.replace(/^const /, '').replace(/^struct |^union /, '').trim()) : null;
        if (z && dimsV.length === 1 && typeof dimsV[0] === 'number')
          outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name} = Array.from({ length: ${dimsV[0]} }, () => (${z}));`);
        else { outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}const ${name}: any[] = []; // TRANSPILER-TODO init tableau ${baseType}`); flag(line(d), 'data-array', `${name}: ${baseType}[${dims.map((x) => x.text).join('][')}]`); }
      }
    } else if (initN) {
      let v = ptr > 0 && initN.text === 'NULL' ? 'null' : emitInitList(initN, ptr > 0 ? null : baseType, null);
      if (ti.kind === 'bool' && (v === '0' || v === '1')) v = v === '1' ? 'true' : 'false';
      if (ti.kind === 'num' || ti.kind === 'bool') moduleDataTypes.set(name, ti);
      const letKw = constV && !ptr ? 'const' : 'let';
      const typeAnn = ptr > 0 ? `: ${ti.ts === 'any' ? 'any' : ti.ts + ' | null'}` : '';
      outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}${letKw} ${name}${typeAnn} = ${v};`);
    } else {
      // scalaire/pointeur mutable non initialisé (EWRAM/IWRAM)
      if (ti.kind === 'num') { moduleDataTypes.set(name, ti); outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}let ${name} = 0;`); }
      else if (ti.kind === 'bool') { moduleDataTypes.set(name, ti); outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}let ${name} = false;`); }
      else if (ti.kind === 'struct') {
        const z = zeroObjectFor(ti.local || ti.ts);
        outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}${z ? `const ${name} = ${z};` : `let ${name}: any = {}; // TRANSPILER-TODO struct ${baseType}`}`);
        if (!z) flag(line(d), 'struct-globale', `${baseType} ${name}`);
      } else outs.push(`/** 1:1 (${baseName}.c:${line(d)}) */\n${exportKw}let ${name}: ${ti.ts === 'any' ? 'any' : ti.ts + ' | null'} = null;`);
    }
  }
  return outs.length ? outs.join('\n') : null;
}

// ─── fonctions ───────────────────────────────────────────────────────────────
function emitFunction(n) {
  const declN = n.childForFieldName('declarator');
  const typeN = n.childForFieldName('type');
  const body = n.childForFieldName('body');
  const nameN = findFnName(declN);
  if (!nameN || !body) { flag(line(n), 'fn-inparsable', n.text.slice(0, 60)); return null; }
  const name = nameN.text;
  const isStatic = /^static\b/.test(n.text);
  let retPtr = 0;
  {
    let d = declN;
    while (d && d.type === 'pointer_declarator') { retPtr++; d = d.childForFieldName('declarator'); }
  }
  const retType = typeN ? typeN.text : 'void';
  const retTi = tsTypeFor(retType, retPtr, null);

  // params
  const fnDecl = (function find(x) { if (x.type === 'function_declarator') return x; for (const c of x.namedChildren) { const r = find(c); if (r) return r; } return null; })(declN);
  const paramsN = fnDecl ? fnDecl.childForFieldName('parameters') : null;
  const ctx = { types: new Map(), boxed: new Set(), fn: { name, returnsBool: retTi.kind === 'bool' } };
  const params = []; // {name, ts, box: 'star'|null}
  if (paramsN) {
    for (const p of paramsN.namedChildren) {
      if (p.type === 'comment') continue;
      if (p.type === 'variadic_parameter') { params.push({ name: '...varargs', ts: 'any[]', box: null }); flag(line(p), 'varargs', name); continue; }
      if (p.text === 'void') continue;
      const pType = p.childForFieldName('type');
      const pDecl = p.childForFieldName('declarator');
      if (!pDecl) continue;
      const info = analyzeDeclarator(pDecl, pType ? pType.text : 'int');
      if (!info) { // pointeur fonction en param
        const nested = findFnName(pDecl);
        if (nested) { ctx.types.set(nested.text, { kind: 'any', ts: 'any' }); params.push({ name: nested.text, ts: '(...args: any[]) => any', box: null }); }
        continue;
      }
      const ti = tsTypeFor(pType ? pType.text : 'int', info.ptr, info.dims.length ? info.dims : null);
      ti.dims = info.dims;
      // param scalaire-pointeur écrit via *p → box {v} (out-param)
      if (info.ptr === 1 && ti.kind === 'scalarptr') {
        const writtenViaStar = new RegExp(`\\*\\s*${info.name}\\b`).test(body.text);
        if (writtenViaStar) { ctx.boxed.add(info.name); ctx.types.set(info.name, { kind: 'num', ts: 'number' }); params.push({ name: info.name, ts: '{ v: number }', box: 'param' }); continue; }
      }
      ctx.types.set(info.name, ti);
      params.push({ name: info.name, ts: ti.ts === 'void' ? 'any' : (info.fnptr ? '(...args: any[]) => any' : ti.ts) });
    }
  }
  prescanLocalTypes(body, ctx);
  for (const b of collectBoxedLocals(body, ctx.types)) ctx.boxed.add(b);

  // params scalaires dont l'adresse est prise (&param) → renommer + box en préambule
  const preamble = [];
  for (const p of params) {
    if (p.box || p.name.startsWith('...')) continue;
    if (ctx.boxed.has(p.name)) {
      preamble.push(`  const ${p.name} = { v: ${p.name}_ }; // TRANSPILER: &${p.name} pris → box`);
      p.name = p.name + '_';
    }
  }

  const sigC = SRC && n.text ? n.text.slice(0, n.text.indexOf(')') + 1).replace(/\s+/g, ' ') : name;
  const endLine = body.endPosition.row + 1;
  const retAnn = retTi.kind === 'void' ? 'void' : retTi.kind === 'bool' ? 'boolean' : retTi.kind === 'num' ? 'number' : (retTi.ts === 'any' ? 'any' : retTi.ts + ' | null');
  let bodyS = emitStatement(body, ctx, 0);
  if (preamble.length) bodyS = bodyS.replace('{', '{\n' + preamble.join('\n'));
  const paramStrs = params.map((p) => p.name.startsWith('...') ? `${p.name}: ${p.ts}` : `${p.name}: ${p.ts}`);
  return `/** 1:1 \`${sigC}\` (${baseName}.c:${line(n)}-${endLine}). */\n${isStatic ? '' : 'export '}function ${name}(${paramStrs.join(', ')}): ${retAnn} ${bodyS.replace(/^\{/, '{').trimStart()}`;
}

function addTypeImport(imp) {
  if (!neededTypeImports.has(imp.from)) neededTypeImports.set(imp.from, new Set());
  neededTypeImports.get(imp.from).add(imp.ts);
}

// ─── SECTION 12 : résolveur d'imports ────────────────────────────────────────
function resolveImports() {
  const index = symbolIndex;
  const JS_GLOBALS = new Set(['Math', 'Number', 'Array', 'Object', 'String', 'JSON', 'console', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array', 'undefined', 'globalThis', 'Boolean', 'parseInt', 'NaN', 'Infinity']);
  for (const name of usedIdents) {
    if (localModuleNames.has(name) || JS_GLOBALS.has(name) || fieldAliases.has(name)) continue;
    if (localConstMap.has(name) && !localModuleNames.has(name)) {
      // constante d'un header décomp connue mais non importable → const locale documentée
      continue;
    }
    const entries = index[name];
    if (entries && entries.length) {
      // préférence : src/<base-décomp>.ts (même fichier que la déf .c) > constantes include/
      // > src/ hors bridges > include/ > harness/
      const defBase = decompDefFile.get(name);
      const pick =
        (defBase && entries.find((e) => e.file === `src/${defBase}.ts`)) ||
        (/^[A-Z][A-Z0-9_]+$/.test(name) && entries.find((e) => e.file.startsWith('include/'))) ||
        entries.find((e) => e.file.startsWith('src/') && !e.file.includes('decomp-globals') && !e.file.includes('wire-bytecode')) ||
        entries.find((e) => e.file.startsWith('include/')) ||
        entries[0];
      const rel = importPathFor(pick.file);
      if (!neededImports.has(rel)) neededImports.set(rel, new Set());
      neededImports.get(rel).add(name);
      if (entries.length > 1 && new Set(entries.map((e) => e.file)).size > 1)
        flag(0, 'import-ambigu', `${name} ← ${entries.map((e) => e.file).join(' | ')} (choisi ${pick.file})`);
      continue;
    }
    // constante décomp connue → const locale
    if (constDB.has(name)) {
      const c = constDB.get(name);
      constsToInline.push(`const ${name} = ${c.value}; // 1:1 ${c.file}:${c.line} (à consolider dans include/)`);
      localModuleNames.add(name);
      continue;
    }
    // variantes historiques du repo : Name_Manual / _Name (conventions oracle)
    let variantHit = false;
    for (const v of [name + '_Manual', '_' + name]) {
      const ve = index[v];
      if (ve && ve.length) {
        const pick = ve.find((e) => e.file.startsWith('src/')) || ve[0];
        const rel = importPathFor(pick.file);
        if (!neededImports.has(rel)) neededImports.set(rel, new Set());
        neededImports.get(rel).add(v);
        constsToInline.push(`const ${name} = ${v}; // variante repo (${pick.file})`);
        localModuleNames.add(name);
        flag(0, 'variante-repo', `${name} → ${v}`);
        variantHit = true;
        break;
      }
    }
    if (variantHit) continue;
    if (!report.unresolved.has(name)) report.unresolved.set(name, []);
  }
  const lines = [];
  for (const [mod, names] of [...neededImports.entries()].sort()) {
    const arr = [...names].sort();
    lines.push(`import { ${arr.join(', ')} } from '${mod}';`);
  }
  for (const [mod, names] of [...neededTypeImports.entries()].sort()) {
    lines.push(`import type { ${[...names].sort().join(', ')} } from '${mod}';`);
  }
  if (constsToInline.length) lines.push('', '// ─── constantes décomp inlinées (headers pas encore dans include/) ───', ...constsToInline);
  return lines.join('\n') + '\n';
}
const constsToInline = [];
function importPathFor(file) {
  // outPath est src/<x>.ts → chemin relatif
  const from = path.dirname(outPath);
  let rel = path.relative(from, path.join(REPO, file)).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

main().catch((e) => { console.error(e); process.exit(1); });

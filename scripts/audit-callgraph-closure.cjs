#!/usr/bin/env node
'use strict';
/*
 * audit-callgraph-closure.cjs — Oracle de fermeture du call-graph 1:1.
 *
 * Croise TOUTES les définitions de la décomp (fonctions + data) avec notre
 * mirror TS et liste, pour chaque fonction portée, ses dépendances décomp
 * NON portées (« trous »). But : découvrir les zaps AVANT le symptôme en jeu
 * (classe de bugs SetBgAttribute / TryEnableObjectEventAnim / sound.c).
 *
 * Usage :
 *   node scripts/audit-callgraph-closure.cjs                     # gaps directs globaux
 *   node scripts/audit-callgraph-closure.cjs --file egg_hatch.c  # prépa chantier (transitif, depth 2)
 *   node scripts/audit-callgraph-closure.cjs --file egg_hatch.c --depth 4
 *   node scripts/audit-callgraph-closure.cjs --sym SetBgAttribute
 *   node scripts/audit-callgraph-closure.cjs --include-exempt
 *
 * Sorties : console (résumé) + audit-reports/callgraph-closure.json (complet).
 * NE PAS committer le JSON (comme les autres audit-reports).
 *
 * Conventions de nommage acceptées côté TS (statiques historiques) :
 *   Name (exact) · Name_Manual (port manuel, ex. CB2_ReturnToField_Manual)
 *   · _Name · _name (underscore + lowerFirst) → PORTÉ (drift noté, champ variant).
 *   name nu (lowerFirst sans underscore) → PAS compté porté, listé « suspect ».
 */

const fs = require('fs');
const path = require('path');

const DECOMP = process.env.DECOMP_ROOT || 'D:/Projet 1/decomps/pokeemeraude';
const REPO = path.resolve(__dirname, '..');
const OUT_JSON = path.join(REPO, 'audit-reports', 'callgraph-closure.json');

// Libs hardware exemptes (voir memory hardware-non-1to1-exemptions : save/RTC).
// src/m4a.c RETIRÉ (2026-07-11) : moteur son 1:1 transcrit (src/m4a.ts +
// src/m4a_1.ts), certifié sample-exact vs mGBA et câblé (chantier-son-m4a).
const EXEMPT_FILES = new Set([
  'src/agb_flash.c', 'src/agb_flash_1m.c', 'src/agb_flash_le.c',
  'src/agb_flash_mx.c', 'src/siirtc.c', 'src/libisagbprn.c',
  'src/malloc.c', // Alloc/Free = GC côté TS (exemption structurelle)
]);
const C_KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'return', 'sizeof', 'do', 'else', 'case', 'goto', 'defined', 'typedef',
  // types : une déf « static void (*GetGfxFunc(void))(void) » capture sinon « void »
  'void', 'int', 'char', 'short', 'long', 'unsigned', 'signed', 'float', 'double', 'bool',
  'u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'vu8', 'vu16', 'vu32', 'f32', 'size_t',
]);
const JS_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'constructor', 'super', 'new', 'typeof', 'await', 'yield', 'else', 'do', 'try', 'finally', 'throw', 'delete', 'in', 'of', 'instanceof']);

// Adaptations documentées : symboles décomp SANS équivalent nominal chez nous
// parce qu'un mécanisme équivalent vérifié les héberge. --strict pour les voir.
// gSpecialVar_* : le décomp les référence via sSpecialVars[] (event_data.c) ;
// notre byte-VM les stocke directement dans le vars store (VAR_RESULT 0x800D…).
const ADAPTATIONS = [
  { test: (n) => /^gSpecialVar_/.test(n), reason: 'vars store byte-VM (event_data sSpecialVars)' },
];

// --- CLI ---
const argv = process.argv.slice(2);
function argVal(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; }
const fileFilter = argVal('--file');
const symQuery = argVal('--sym');
const depthMax = parseInt(argVal('--depth') || '', 10) || (fileFilter ? 2 : 1);
const includeExempt = argv.includes('--include-exempt');
const strict = argv.includes('--strict');

// --- Helpers texte ---
function blank(m) { return m.replace(/[^\n]/g, ' '); }
function stripC(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank)
    .replace(/"(?:[^"\\\n]|\\.)*"/g, blank)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, blank);
}
function stripTs(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank)
    .replace(/`(?:[^`\\]|\\[\s\S])*`/g, blank)
    .replace(/"(?:[^"\\\n]|\\.)*"/g, blank)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, blank);
}
function makeLineLookup(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
  }
  return text.length - 1;
}
function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
function lowerFirst(s) { return s[0].toLowerCase() + s.slice(1); }
const ID_RE = /\b[A-Za-z_]\w*\b/g;

// --- Phase 1 : parse décomp (définitions fonctions + data) ---
if (!fs.existsSync(DECOMP)) { console.error(`Décomp introuvable : ${DECOMP}`); process.exit(1); }

// Déf de fonction pret : type(s) sur la même ligne, nom(args) puis { en colonne 0.
const FN_DEF = /^[A-Za-z_][A-Za-z0-9_ \t*]*[ \t*]([A-Za-z_]\w*)[ \t]*\(([^;{}]*?)\)[ \t]*\r?\n\{/gm;
// Data en colonne 0 : nom [gs]Maj, se terminant par = ou ; (pas de parenthèse = pas les protos)
const DATA_DEF = /^(?!extern\b)[A-Za-z_][^;{}()=\n]*[ \t*]([gs][A-Z]\w*)((?:\[[^\]\n]*\])+)?[ \t]*[=;]/gm;
// Tableaux/pointeurs de fonctions : static void (*const sFuncs[])(u8) = ...
const DATA_FNPTR = /^[A-Za-z_][^;{}=\n]*\(\*[ \t]*(?:const[ \t]+)?([gs][A-Z]\w*)((?:\[[^\]\n]*\])*)\)[ \t]*\(/gm;

const fileText = new Map();   // rel → texte strippé
const fnDefs = new Map();     // name → [{file, line, bodyStart, bodyEnd, static}]
const dataDefs = new Map();   // name → [{file, line}]
const macroDefs = new Map();  // name → [{file, line}]  (macros fonctionnelles include/)
const scriptDefs = new Map(); // name → [{file, line}]  (labels asm data/ : event/battle scripts)
const fnsByFile = new Map();  // rel → [fnDef]

// Macros fonctionnelles : #define Name(args) ... (feuilles — corps non traversés)
const MACRO_DEF = /^#[ \t]*define[ \t]+([A-Za-z_]\w*)\(/gm;
// Labels asm col 0 : Name: ou Name:: (feuilles)
const LABEL_DEF = /^([A-Za-z_]\w*)::?[ \t]*(?:@.*)?$/gm;

function parseCLike(p, rel) {
  const text = stripC(fs.readFileSync(p, 'utf8'));
  fileText.set(rel, text);
  const lineAt = makeLineLookup(text);
  const fns = [];
  let m;
  FN_DEF.lastIndex = 0;
  while ((m = FN_DEF.exec(text))) {
    const name = m[1];
    if (C_KEYWORDS.has(name)) continue;
    const bodyStart = m.index + m[0].length - 1;
    const bodyEnd = matchBrace(text, bodyStart);
    const def = { name, file: rel, line: lineAt(m.index), static: /^static\b/.test(m[0]), bodyStart, bodyEnd };
    fns.push(def);
    if (!fnDefs.has(name)) fnDefs.set(name, []);
    fnDefs.get(name).push(def);
  }
  fnsByFile.set(rel, fns);
  for (const re of [DATA_DEF, DATA_FNPTR]) {
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const name = m[1];
      if (!dataDefs.has(name)) dataDefs.set(name, []);
      dataDefs.get(name).push({ file: rel, line: lineAt(m.index) });
    }
  }
  return text;
}

// src/**/*.c + src/**/*.h (src/data/ = 146 headers de tables #includées dans les .c)
const decompFiles = walk(path.join(DECOMP, 'src'), ['.c']);
for (const p of decompFiles) parseCLike(p, path.relative(DECOMP, p).replace(/\\/g, '/'));
for (const p of walk(path.join(DECOMP, 'src'), ['.h'])) parseCLike(p, path.relative(DECOMP, p).replace(/\\/g, '/'));

// include/**/*.h : fonctions static inline (via FN_DEF) + macros fonctionnelles
for (const p of walk(path.join(DECOMP, 'include'), ['.h'])) {
  const rel = path.relative(DECOMP, p).replace(/\\/g, '/');
  const text = parseCLike(p, rel);
  const lineAt = makeLineLookup(text);
  let m;
  MACRO_DEF.lastIndex = 0;
  while ((m = MACRO_DEF.exec(text))) {
    const name = m[1];
    if (C_KEYWORDS.has(name)) continue;
    if (!macroDefs.has(name)) macroDefs.set(name, []);
    macroDefs.get(name).push({ file: rel, line: lineAt(m.index) });
  }
}

// data/**/*.s|.inc : labels de scripts (event/battle/anim/AI) référencés depuis le C
for (const p of walk(path.join(DECOMP, 'data'), ['.s', '.inc'])) {
  const rel = path.relative(DECOMP, p).replace(/\\/g, '/');
  const text = fs.readFileSync(p, 'utf8');
  const lineAt = makeLineLookup(text);
  let m;
  LABEL_DEF.lastIndex = 0;
  while ((m = LABEL_DEF.exec(text))) {
    const name = m[1];
    if (!scriptDefs.has(name)) scriptDefs.set(name, []);
    scriptDefs.get(name).push({ file: rel, line: lineAt(m.index) });
  }
}

// --- Phase 2 : parse notre TS (définitions) ---
// tsDefs = défs « fortes » (function/const/let/var/class/méthode de classe).
// tsProps = défs « propriété » (champ de classe, clé d'objet, assignation .name=) :
//   nos globals C vivent sur l'objet runtime (decomp-globals/decomp-runtime), pas
//   en const top-level → une propriété couvre une DATA, pas une fonction.
const tsDefs = new Map();  // name → [fichier]
const tsProps = new Map(); // name → [fichier]
const TS_DEF_RES = [
  /(?:^|[^\w$.])function[ \t]+([A-Za-z_$][\w$]*)/g,
  /(?:^|[^\w$.])(?:const|let|var)[ \t]+([A-Za-z_$][\w$]*)/g,
  /(?:^|[^\w$.])class[ \t]+([A-Za-z_$][\w$]*)/g,
];
// Méthode de classe : indentée, modifieurs optionnels, params sans accolade, puis {
const TS_METHOD_RE = /^[ \t]+(?:public[ \t]+|private[ \t]+|protected[ \t]+|static[ \t]+|async[ \t]+|readonly[ \t]+)*([A-Za-z_$][\w$]*)[ \t]*\(([^;{}]*?)\)[ \t]*(?::[^;{}]*)?\{/gm;
const TS_PROP_RES = [
  /^[ \t]+(?:public[ \t]+|private[ \t]+|protected[ \t]+|static[ \t]+|readonly[ \t]+)*([A-Za-z_$][\w$]*)\??[ \t]*[:=][^=]/gm, // champ/clé
  /[\w$)\]]\.[ \t]*([A-Za-z_$][\w$]*)[ \t]*=[^=]/g, // obj.name = ...
];
// tsStrings = identifiants apparaissant dans les LITTÉRAUX de chaînes TS : nos
// scripts byte-VM sont référencés par nom en string ('EventScript_...').
const tsStrings = new Set();
const TS_STR_RES = [/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g, /`((?:\\[\s\S]|[^`\\])*)`/g];
const tsFiles = [...walk(path.join(REPO, 'src'), ['.ts']), ...walk(path.join(REPO, 'harness'), ['.ts'])];
for (const p of tsFiles) {
  const rel = path.relative(REPO, p).replace(/\\/g, '/');
  const raw = fs.readFileSync(p, 'utf8');
  for (const re of TS_STR_RES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(raw))) {
      const content = m[2] !== undefined ? m[2] : m[1];
      let im;
      ID_RE.lastIndex = 0;
      while ((im = ID_RE.exec(content))) tsStrings.add(im[0]);
    }
  }
  const text = stripTs(raw);
  for (const [res, map, guard] of [[TS_DEF_RES.concat([TS_METHOD_RE]), tsDefs, JS_KEYWORDS], [TS_PROP_RES, tsProps, JS_KEYWORDS]]) {
    for (const re of res) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const name = m[1];
        if (guard.has(name)) continue;
        if (!map.has(name)) map.set(name, []);
        if (!map.get(name).includes(rel)) map.get(name).push(rel);
      }
    }
  }
}

// --- Statut « porté » d'un symbole décomp ---
const portedCache = new Map();
function findPorted(name, kind = 'fn') {
  const key = kind + ':' + name;
  if (portedCache.has(key)) return portedCache.get(key);
  let r = null;
  // Name_Manual = convention repo « port manuel » (CB2_ReturnToField_Manual…) ;
  // le variant matché est reporté tel quel dans le champ `variant` (JSON/console).
  for (const v of [name, name + '_Manual', '_' + name, '_' + lowerFirst(name)]) {
    if (tsDefs.has(v)) { r = { variant: v, exact: v === name, files: tsDefs.get(v) }; break; }
    // une DATA/macro/script peut vivre en propriété de l'objet runtime (decomp-globals/runtime)
    if (kind !== 'fn' && tsProps.has(v)) { r = { variant: v, exact: v === name, prop: true, files: tsProps.get(v) }; break; }
  }
  // lowerFirst nu = trop de collisions génériques → suspect, PAS compté porté
  if (!r && tsDefs.has(lowerFirst(name)) && lowerFirst(name) !== name) {
    r = { variant: lowerFirst(name), exact: false, suspect: true, files: tsDefs.get(lowerFirst(name)) };
  }
  portedCache.set(key, r);
  return r;
}
function isExemptSym(defs) { return defs.every((d) => EXEMPT_FILES.has(d.file)); }
let adaptationHits = 0;
function isCovered(name, defs, kind) {
  if (!includeExempt && isExemptSym(defs)) return true;
  if (!strict && ADAPTATIONS.some((a) => a.test(name))) { adaptationHits++; return true; }
  const p = findPorted(name, kind);
  if (p && !p.suspect) return true;
  // scripts byte-VM : référencés par nom en string dans nos TS
  if (kind === 'script' && tsStrings.has(name)) return true;
  return false;
}
// Univers de résolution, ordre de priorité en cas d'homonyme
const KINDS = [['fn', fnDefs], ['macro', macroDefs], ['data', dataDefs], ['script', scriptDefs]];

// --- Extraction des dépendances d'un corps de fonction ---
const calleeCache = new Map(); // def → Map(kind → Set(names))
function depsOf(def) {
  if (calleeCache.has(def)) return calleeCache.get(def);
  const body = fileText.get(def.file).slice(def.bodyStart, def.bodyEnd + 1);
  const r = new Map(KINDS.map(([k]) => [k, new Set()]));
  let m;
  ID_RE.lastIndex = 0;
  while ((m = ID_RE.exec(body))) {
    const id = m[0];
    if (id === def.name) continue;
    for (const [kind, defsMap] of KINDS) {
      if (defsMap.has(id)) { r.get(kind).add(id); break; }
    }
  }
  calleeCache.set(def, r);
  return r;
}
function defsFor(kind, name) { return KINDS.find(([k]) => k === kind)[1].get(name); }
function fmtDef(d) { return `${d.file.replace(/^src\//, '')}:${d.line}`; }

// --- Mode --sym : fiche d'un symbole ---
if (symQuery) {
  const found = KINDS.find(([, m]) => m.has(symQuery));
  if (!found) { console.log(`« ${symQuery} » : introuvable dans la décomp (fn/macro/data/script).`); process.exit(0); }
  const kind = found[0];
  const defs = found[1].get(symQuery);
  const p = findPorted(symQuery, kind);
  console.log(`=== ${symQuery} (${kind}) ===`);
  for (const d of defs) console.log(`  déf décomp : ${fmtDef(d)}${d.static ? ' (static)' : ''}`);
  if (!includeExempt && isExemptSym(defs)) console.log('  statut : EXEMPT (lib hardware)');
  if (p) console.log(`  TS : ${p.suspect ? 'SUSPECT' : p.exact ? 'PORTÉ (exact)' : 'PORTÉ (drift)'}${p.prop ? ' [propriété]' : ''} → ${p.variant} dans ${p.files.join(', ')}`);
  else if (kind === 'script' && tsStrings.has(symQuery)) console.log('  TS : COUVERT (référencé en string — pipeline byte-VM)');
  else console.log('  TS : ABSENT');
  const callers = [];
  for (const fns of fnsByFile.values())
    for (const f of fns) { const d = depsOf(f); if (d.get(kind).has(symQuery)) callers.push(f); }
  console.log(`  appelants décomp (${callers.length}) :`);
  for (const c of callers.slice(0, 30)) {
    const cp = findPorted(c.name);
    console.log(`    ${cp && !cp.suspect ? '✓porté' : '✗absent'}  ${c.name} (${fmtDef(c)})`);
  }
  if (callers.length > 30) console.log(`    … +${callers.length - 30}`);
  process.exit(0);
}

// --- Mode --file : prépa chantier avec fermeture transitive ---
if (fileFilter) {
  const rel = fileFilter.startsWith('src/') ? fileFilter : 'src/' + fileFilter;
  const roots = fnsByFile.get(rel);
  if (!roots) { console.error(`Fichier décomp introuvable : ${rel}`); process.exit(1); }
  console.log(`=== PRÉPA CHANTIER : ${rel} (fermeture depth ≤ ${depthMax}) ===\n`);
  let nPorted = 0;
  for (const f of roots) {
    const p = findPorted(f.name);
    const st = p && !p.suspect ? (p.exact ? '✓' : '≈') : p ? '?' : '✗';
    if (p && !p.suspect) nPorted++;
    console.log(`  [${st}] ${f.name} (:${f.line})${p ? ` → ${p.variant}` : ''}`);
  }
  console.log(`\n  ${nPorted}/${roots.length} fonctions portées (✓ exact, ≈ drift _nom, ? suspect, ✗ absent)\n`);

  // BFS à travers les fonctions MANQUANTES uniquement (le travail neuf)
  const missing = new Map(); // name → {kind, defs, depth, via:Set}
  const seen = new Set(roots.map((r) => r.name));
  let frontier = roots.slice();
  for (let depth = 1; depth <= depthMax && frontier.length; depth++) {
    const next = [];
    for (const f of frontier) {
      const d = depsOf(f);
      for (const [kind] of KINDS) {
        for (const name of d.get(kind)) {
          const defs = defsFor(kind, name);
          if (isCovered(name, defs, kind)) continue;
          if (!missing.has(name)) {
            missing.set(name, { kind, defs, depth, via: new Set() });
            if (kind === 'fn' && !seen.has(name)) { seen.add(name); next.push(defs[0]); }
          }
          missing.get(name).via.add(f.name);
        }
      }
    }
    frontier = next;
  }
  const KIND_TAG = { fn: '𝑓 ', data: '📦', macro: 'Ⓜ ', script: 'Ⓢ ' };
  const list = [...missing.entries()].sort((a, b) => a[1].depth - b[1].depth || b[1].via.size - a[1].via.size);
  console.log(`--- TROUS (${list.length} symboles non portés requis) ---`);
  for (const [name, info] of list) {
    const via = [...info.via].slice(0, 4).join(', ') + (info.via.size > 4 ? ` +${info.via.size - 4}` : '');
    console.log(`  d${info.depth} ${KIND_TAG[info.kind]} ${name} (${fmtDef(info.defs[0])}) ← ${via}`);
  }
  process.exit(0);
}

// --- Mode par défaut : gaps directs globaux ---
const missing = new Map(); // name → {kind, defs, requiredBy:[]}
let portedRoots = 0, exactRoots = 0;
const perFile = new Map();
for (const [rel, fns] of fnsByFile) {
  const exempt = !includeExempt && EXEMPT_FILES.has(rel);
  let ported = 0;
  for (const f of fns) {
    const p = findPorted(f.name);
    if (!p || p.suspect) continue;
    ported++;
    if (exempt) continue;
    portedRoots++;
    if (p.exact) exactRoots++;
    const d = depsOf(f);
    for (const [kind] of KINDS) {
      for (const name of d.get(kind)) {
        const defs = defsFor(kind, name);
        if (isCovered(name, defs, kind)) continue;
        if (!missing.has(name)) missing.set(name, { kind, defs, requiredBy: [] });
        missing.get(name).requiredBy.push(`${f.name} (${fmtDef(f)})`);
      }
    }
  }
  perFile.set(rel, { total: fns.length, ported });
}

const sorted = [...missing.entries()].sort((a, b) => b[1].requiredBy.length - a[1].requiredBy.length);
const core = sorted.filter(([, i]) => i.kind === 'fn' || i.kind === 'data');
const macros = sorted.filter(([, i]) => i.kind === 'macro');
const scripts = sorted.filter(([, i]) => i.kind === 'script');
const totalFns = [...fnDefs.values()].reduce((n, v) => n + v.length, 0);
console.log(`Décomp : ${decompFiles.length} .c (+headers src & include, data asm) · ${totalFns} fonctions · ${dataDefs.size} data · ${macroDefs.size} macros · ${scriptDefs.size} labels scripts`);
console.log(`Mirror : ${tsFiles.length} fichiers .ts · ${tsDefs.size} défs fortes · ${tsProps.size} propriétés`);
console.log(`Fonctions décomp portées : ${portedRoots} (${exactRoots} exactes, ${portedRoots - exactRoots} driftées _nom/_Manual)`);
console.log(`\n=== GAPS DIRECTS fn+data : ${core.length} symboles manquants requis par des fonctions portées ===\n`);
function printGap(name, info) {
  const req = info.requiredBy.slice(0, 5).join(', ') + (info.requiredBy.length > 5 ? ` +${info.requiredBy.length - 5}` : '');
  console.log(`  ${String(info.requiredBy.length).padStart(3)}× ${info.kind === 'data' ? '📦' : '𝑓 '} ${name} (${fmtDef(info.defs[0])})\n       ← ${req}`);
}
for (const [name, info] of core.slice(0, 40)) printGap(name, info);
if (core.length > 40) console.log(`  … +${core.length - 40} autres (JSON complet)`);
console.log(`\n=== MACROS manquantes : ${macros.length} (top 10, reste en JSON) ===`);
for (const [name, info] of macros.slice(0, 10)) console.log(`  ${String(info.requiredBy.length).padStart(3)}× Ⓜ ${name} (${fmtDef(info.defs[0])})`);
console.log(`\n=== SCRIPTS (labels asm) manquants : ${scripts.length} (top 10, reste en JSON) ===`);
for (const [name, info] of scripts.slice(0, 10)) console.log(`  ${String(info.requiredBy.length).padStart(3)}× Ⓢ ${name} (${fmtDef(info.defs[0])})`);
if (!strict && adaptationHits) console.log(`\n(${adaptationHits} réfs couvertes par adaptations documentées — gSpecialVar_* etc. ; --strict pour les inclure)`);

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({
  decomp: DECOMP,
  stats: { decompFiles: decompFiles.length, decompFns: totalFns, decompData: dataDefs.size, decompMacros: macroDefs.size, decompScripts: scriptDefs.size, tsFiles: tsFiles.length, portedRoots, exactRoots, gapsCore: core.length, gapsMacros: macros.length, gapsScripts: scripts.length },
  perFile: Object.fromEntries([...perFile.entries()].map(([k, v]) => [k, v])),
  missing: sorted.map(([name, info]) => ({ name, kind: info.kind, defs: info.defs.map(fmtDef), requiredBy: info.requiredBy })),
}, null, 1));
console.log(`\nJSON complet : ${OUT_JSON}`);

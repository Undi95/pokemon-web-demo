#!/usr/bin/env node
/* Audit READ-ONLY DURCI v3 — classe chaque OWN-DEF du decomp-bridge selon 4 signaux
 * pour identifier les vraiment morts (sweepables SANS rien casser) :
 *   1. extImporters    : # de .ts qui importent le symbole DEPUIS le bridge (nommé)
 *   2. internalCodeRefs: # d'usages du symbole DANS le code du bridge (hors décl),
 *                        comments + strings strippés (recursion comptée = KEEP, sûr)
 *   3. stringRefs      : # d'occurrences `'X'`/`"X"` dans tout le repo HORS manifestes
 *                        du bridge (= dispatch dynamique / globalThis string-keyed)
 *   4. (namespace import `import * as` = BÉNIN : ne nomme aucun symbole → ignoré)
 *
 * SAFE_TO_REMOVE = extImporters==0 && internalCodeRefs==0 && stringRefs==0.
 * tsc + boot restent les filets de sécurité (tsc attrape tout usage interne raté).
 * N'écrit RIEN dans les sources ; produit audit-reports/bridge-dead-owndefs.txt. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const ID = /^[A-Za-z_$][\w$]*$/;

// ── strip comments + string/template literals (remplace par espaces, garde offsets) ──
function stripCommentsAndStrings(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    if (c === '/' && c2 === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && c2 === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') {
          // template expression : garder le contenu (peut référencer un symbole)
          i += 2; let depth = 1;
          while (i < n && depth > 0) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; out += src[i]; i++; }
          continue;
        }
        i++;
      }
      out += ' ';
      continue;
    }
    out += c; i++;
  }
  return out;
}

// ── 1. own-defs du bridge ───────────────────────────────────────────────────
const bsrc = fs.readFileSync(BRIDGE, 'utf8');
const ownDefs = new Map(); // name -> {kind}
for (const m of bsrc.matchAll(/^\s*export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
  ownDefs.set(m[1], { kind: 'owndef' });
}
const reexportNames = new Set();
for (const m of bsrc.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
  for (const raw of m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').split(',')) {
    const p = raw.trim(); if (!p) continue;
    const mm = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
    const name = mm ? mm[2] : p.replace(/^type\s+/, '').replace(/\s+as\s+.*/, '').trim();
    if (ID.test(name)) reexportNames.add(name);
  }
}

// ── 2. localiser les manifestes (string literals à EXCLURE de stringRefs) ─────
// __bridgedHelpers__ / __notImplementedHelpers__ : new Set([ ... ]) ; getStaticTable.
const manifestRanges = [];
for (const mm of bsrc.matchAll(/(__bridgedHelpers__|__notImplementedHelpers__)\b[\s\S]*?new Set\(\[/g)) {
  const start = mm.index + mm[0].length;
  let i = start, depth = 1;
  while (i < bsrc.length && depth > 0) { if (bsrc[i] === '[') depth++; else if (bsrc[i] === ']') depth--; i++; }
  manifestRanges.push([start, i]);
}
function inManifest(idx) { return manifestRanges.some(([a, b]) => idx >= a && idx < b); }

// ── 3. internalCodeRefs : usages dans le code du bridge (strippé) ─────────────
const bcode = stripCommentsAndStrings(bsrc);
const internalCount = new Map();
for (const m of bcode.matchAll(/[A-Za-z_$][\w$]*/g)) {
  const w = m[0];
  if (ownDefs.has(w)) internalCount.set(w, (internalCount.get(w) || 0) + 1);
}
// décl count : chaque `export ... function/const/let/class X` compte 1 occurrence de X dans bcode.
// internalCodeRefs = total - declarations. On compte les déclarations par nom.
const declCount = new Map();
for (const m of bcode.matchAll(/\bexport\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) {
  declCount.set(m[1], (declCount.get(m[1]) || 0) + 1);
}

// ── 4. walk repo : extImporters (nommés depuis bridge) + stringRefs (hors manifeste) ──
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts')) files.push(p);
  }
})(ROOT);

const extImporters = new Map(); // name -> Set(files)
const stringRefs = new Map();   // name -> count (hors manifeste bridge)
const importBlock = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]*decomp-bridge)['"]/g;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const isBridge = (f === BRIDGE);
  // 4a. imports nommés depuis le bridge
  if (!isBridge) {
    for (const m of src.matchAll(importBlock)) {
      for (const raw of m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').split(',')) {
        const p = raw.trim(); if (!p) continue;
        const mm = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
        const name = mm ? mm[1] : p.replace(/^type\s+/, '').replace(/\s+as\s+.*/, '').trim();
        if (ownDefs.has(name)) {
          if (!extImporters.has(name)) extImporters.set(name, new Set());
          extImporters.get(name).add(path.relative(ROOT, f));
        }
      }
    }
  }
  // 4b. string literals 'X' / "X" (hors manifeste si c'est le bridge)
  for (const m of src.matchAll(/(['"])([A-Za-z_$][\w$]*)\1/g)) {
    const name = m[2];
    if (!ownDefs.has(name)) continue;
    if (isBridge && inManifest(m.index)) continue; // membership manifeste = bénin
    stringRefs.set(name, (stringRefs.get(name) || 0) + 1);
  }
}

// ── 5. classification ────────────────────────────────────────────────────────
const rows = [...ownDefs.keys()].map((s) => {
  const ext = extImporters.get(s)?.size || 0;
  const internal = (internalCount.get(s) || 0) - (declCount.get(s) || 0);
  const str = stringRefs.get(s) || 0;
  return { s, ext, internal: Math.max(0, internal), str };
});
const aliveExt = rows.filter((r) => r.ext > 0);
const internalUsed = rows.filter((r) => r.ext === 0 && r.internal > 0);
const stringRef = rows.filter((r) => r.ext === 0 && r.internal === 0 && r.str > 0);
const deadSafe = rows.filter((r) => r.ext === 0 && r.internal === 0 && r.str === 0);

console.log(`OWN-DEFS du bridge : ${ownDefs.size}`);
console.log(`  ALIVE (importé nommément hors bridge) : ${aliveExt.length}`);
console.log(`  INTERNAL_USED (0 ext, mais utilisé dans le code bridge) : ${internalUsed.length}`);
console.log(`  STRING_REF (0 ext, 0 interne, mais 'X' dynamique hors manifeste → REVIEW) : ${stringRef.length}`);
console.log(`  DEAD_SAFE (0 ext, 0 interne, 0 string → SWEEPABLE) : ${deadSafe.length}`);
console.log(`\n── STRING_REF (à revoir manuellement) ──`);
for (const r of stringRef.sort((a, b) => b.str - a.str)) console.log(`  str=${r.str}  ${r.s}`);

const OUT = path.join(ROOT, 'audit-reports/bridge-dead-owndefs.txt');
fs.writeFileSync(OUT, deadSafe.map((r) => r.s).sort().join('\n') + '\n');
console.log(`\n${deadSafe.length} DEAD_SAFE écrits dans audit-reports/bridge-dead-owndefs.txt`);

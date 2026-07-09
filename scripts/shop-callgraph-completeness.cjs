#!/usr/bin/env node
/**
 * shop-callgraph-completeness.cjs
 *
 * Static completeness checker (no emulator) for the Pokémart BUY MENU.
 *
 * (1) Parse decomps/pokeemeraude/src/shop.c, extract every function definition
 *     and its body, then build the static call-graph transitively reachable from
 *     the render roots CB2_InitBuyMenu / BuyMenuDrawGraphics.
 * (2) For each decomp render function, look for a ported equivalent in
 *     src/shop.ts (by name, transliterated: BuyMenuDrawObjectEvents ->
 *     _buyMenuDrawObjectEvents / _drawObjectEvents / drawObjectEvents ...).
 * (3) Emit the table {decomp fn -> ported? -> port name} and the NOT-PORTED list.
 *
 * Pure local-file analysis. Roots are render-focused (we do NOT chase the whole
 * purchase/quantity flow unless reachable from the render roots).
 */
'use strict';
const fs = require('fs');

const SHOP_C = 'D:/Projet 1/decomps/pokeemeraude/src/shop.c';
const SHOP_TS = 'D:/Projet 1/pokemon-web-demo/src/shop.ts';

// ── 1. Parse all function definitions in shop.c ──────────────────────────────
// A C function definition at file scope: a line that ends with `)` followed by
// `{` on the next non-blank, with a recognizable `name(` and a return type token
// before it. We grab the body by brace-matching.
function stripComments(src) {
  // Remove block comments and line comments but keep newlines for line numbers.
  let out = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const chunk = src.slice(i, end < 0 ? src.length : end + 2);
      out += chunk.replace(/[^\n]/g, ' ');
      i += chunk.length - 1;
    } else if (src[i] === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      const chunk = src.slice(i, nl < 0 ? src.length : nl);
      out += chunk.replace(/[^\n]/g, ' ');
      i += chunk.length - 1;
    } else {
      out += src[i];
    }
  }
  return out;
}

function lineOf(src, idx) {
  let line = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === '\n') line++;
  return line;
}

const rawC = fs.readFileSync(SHOP_C, 'utf8');
const codeC = stripComments(rawC);

// Find function definitions. Match  <stuff>name(<args>)\n{  at column 0-ish.
// We scan for `{` that opens a function body: the token sequence ` name ( ... ) {`
const funcDefRe = /(^|\n)[ \t]*(?:static\s+|EWRAM_DATA\s+)*(?:const\s+)?[A-Za-z_][A-Za-z0-9_ \t\*]*?\b([A-Za-z_][A-Za-z0-9_]*)\s*\(([^;{}]*)\)\s*\{/g;
// We need balanced parens inside args (function pointers). The regex above is
// approximate; refine by re-checking each candidate with brace matching.

const funcs = {}; // name -> {start, end, body, line, calls:Set}
let m;
while ((m = funcDefRe.exec(codeC)) !== null) {
  const name = m[2];
  // position of the opening brace
  const braceIdx = m.index + m[0].length - 1;
  // brace-match to find body end
  let depth = 0, j = braceIdx, end = -1;
  for (; j < codeC.length; j++) {
    if (codeC[j] === '{') depth++;
    else if (codeC[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end < 0) continue;
  const body = codeC.slice(braceIdx + 1, end);
  // skip control-flow keywords masquerading as functions
  if (['if', 'for', 'while', 'switch', 'do', 'return', 'sizeof', 'else'].includes(name)) continue;
  funcs[name] = { start: braceIdx, end, body, line: lineOf(codeC, m.index + (m[1] ? 1 : 0)), calls: new Set() };
}

// ── Extract callees from each body (identifier followed by `(`) ──────────────
const callRe = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const C_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'do', 'return', 'sizeof', 'else', 'case']);
for (const name of Object.keys(funcs)) {
  let c;
  callRe.lastIndex = 0;
  while ((c = callRe.exec(funcs[name].body)) !== null) {
    const callee = c[1];
    if (C_KEYWORDS.has(callee)) continue;
    funcs[name].calls.add(callee);
  }
}

// ── 2. Build transitive closure from the render roots ────────────────────────
const ROOTS = ['CB2_InitBuyMenu', 'BuyMenuDrawGraphics'];
// We restrict the reachable set to functions DEFINED in shop.c (static call-graph
// internal to the file); external funcs (engine helpers) are noted separately.
const reachableLocal = new Set();
const externalCalls = new Set();
const stack = [...ROOTS];
const edges = []; // [caller, callee]
while (stack.length) {
  const fn = stack.pop();
  if (reachableLocal.has(fn)) continue;
  reachableLocal.add(fn);
  const def = funcs[fn];
  if (!def) continue;
  for (const callee of def.calls) {
    edges.push([fn, callee]);
    if (funcs[callee]) {
      if (!reachableLocal.has(callee)) stack.push(callee);
    } else {
      externalCalls.add(callee);
    }
  }
}

// ── 3. Match each reachable local function to a port in shop.ts ──────────────
const tsSrc = fs.readFileSync(SHOP_TS, 'utf8');
const tsLines = tsSrc.split(/\r?\n/);

// Collect ported symbol declarations: function decls, const arrow fns, methods.
// name -> line
const tsDecls = {};
const declRe = /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/;
const arrowRe = /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*[:=]/;
tsLines.forEach((ln, i) => {
  let mm = declRe.exec(ln) || arrowRe.exec(ln);
  if (mm) tsDecls[mm[1]] = (tsDecls[mm[1]] || i + 1);
});
const tsNames = Object.keys(tsDecls);

// Transliteration: decomp CamelCase -> candidate port names.
// Strategy: generate normalized keys for both sides and compare.
// normalize: lowercase, strip leading underscores, strip a leading "buymenu"/"buy"
// prefix variants, collapse synonyms.
function norm(s) {
  return s.replace(/^_+/, '').toLowerCase();
}
function variants(decompName) {
  const base = decompName; // e.g. BuyMenuDrawObjectEvents
  const out = new Set();
  out.add(base);
  out.add('_' + base[0].toLowerCase() + base.slice(1)); // _buyMenuDrawObjectEvents
  out.add(base[0].toLowerCase() + base.slice(1));        // buyMenuDrawObjectEvents
  // strip BuyMenu prefix -> DrawObjectEvents / _drawObjectEvents
  const noBuyMenu = base.replace(/^BuyMenu/, '');
  if (noBuyMenu !== base && noBuyMenu) {
    out.add(noBuyMenu);
    out.add('_' + noBuyMenu[0].toLowerCase() + noBuyMenu.slice(1));
    out.add(noBuyMenu[0].toLowerCase() + noBuyMenu.slice(1));
  }
  // strip Buy prefix
  const noBuy = base.replace(/^Buy/, '');
  if (noBuy !== base && noBuy) {
    out.add('_' + noBuy[0].toLowerCase() + noBuy.slice(1));
  }
  // Task_X -> _x / Task_X kept
  return [...out];
}

// Build a normalized lookup of ts decls for fuzzy fallback.
const tsNormMap = {}; // normkey -> [names]
for (const n of tsNames) {
  const k = norm(n);
  (tsNormMap[k] = tsNormMap[k] || []).push(n);
}

// Ground-truth overrides established by reading shop.ts by hand (the regex
// matcher cannot see folded/renamed ports). value = port symbol or false (truly
// absent) with the shop.ts line, or '<folded into X>' string.
const MANUAL = {
  // ported under a renamed/folded symbol the matcher missed:
  BuyMenuBuildListMenuTemplate: { port: '_buildBuyList/_buildBuyListTemplate', line: 673, how: 'manual' },
  BuyMenuDecompressBgGraphics: { port: '_loadShopFrameToVram', line: 506, how: 'manual' },
  BuyMenuInitBgs: { port: '_initBuyMenuBgs', line: 460, how: 'manual' },
  BuyMenuCopyMenuBgToBg1TilemapBuffer: { port: '_buyMenuCopyMenuBgToBg1', line: 597, how: 'manual' },
  BuyMenuCheckForOverlapWithMenuBg: { port: '_checkOverlapWithMenuBg', line: 561, how: 'manual' },
  BuyMenuDrawMapGraphics: { port: '_buyMenuDrawGraphics (partial: map only, NPC calls dropped)', line: 621, how: 'manual-partial' },
  // truly NOT ported (confirmed absent in shop.ts):
  BuyMenuSetListEntry: false,                 // inlined item-name copy; decor branch absent
  BuyMenuAddScrollIndicatorArrows: false,     // no scroll arrows at all
  BuyMenuCollectObjectEventData: false,       // NPC viewport scan — ABSENT
  BuyMenuDrawObjectEvents: false,             // NPC sprites in shop view — ABSENT
  BuyMenuCheckIfObjectEventOverlapsMenuBg: false, // NPC overlap test — ABSENT (no NPCs)
};

function findPort(decompName) {
  if (Object.prototype.hasOwnProperty.call(MANUAL, decompName)) {
    const v = MANUAL[decompName];
    return v ? { port: v.port, line: v.line, how: v.how } : null;
  }
  // exact / variant match first
  for (const v of variants(decompName)) {
    if (tsDecls[v] !== undefined) return { port: v, line: tsDecls[v], how: 'name' };
  }
  // normalized match: norm(decomp variant) == norm(ts decl)
  for (const v of variants(decompName)) {
    const k = norm(v);
    if (tsNormMap[k]) return { port: tsNormMap[k][0], line: tsDecls[tsNormMap[k][0]], how: 'normalized' };
  }
  // substring fallback: decomp suffix (after BuyMenu) appears in a ts decl name
  const suffix = decompName.replace(/^BuyMenu/, '').replace(/^Buy/, '');
  if (suffix.length >= 4) {
    const lk = suffix.toLowerCase();
    for (const n of tsNames) {
      if (n.toLowerCase().includes(lk)) return { port: n, line: tsDecls[n], how: 'fuzzy-substr' };
    }
  }
  return null;
}

// ── Output ───────────────────────────────────────────────────────────────────
const sorted = [...reachableLocal].filter(f => funcs[f]).sort((a, b) => funcs[a].line - funcs[b].line);
const rows = [];
for (const fn of sorted) {
  const port = findPort(fn);
  rows.push({
    fn,
    cline: funcs[fn].line,
    ported: !!port,
    port: port ? port.port : '',
    tsline: port ? port.line : '',
    how: port ? port.how : '',
  });
}

console.log('=== BUY MENU RENDER CALL-GRAPH (roots: ' + ROOTS.join(', ') + ') ===');
console.log('decomp functions reachable (defined in shop.c): ' + rows.length + '\n');
const pad = (s, n) => String(s).padEnd(n);
console.log(pad('decomp fn (shop.c:line)', 48) + pad('ported?', 9) + 'port (shop.ts:line)');
console.log('-'.repeat(100));
for (const r of rows) {
  console.log(
    pad(`${r.fn} (shop.c:${r.cline})`, 48) +
    pad(r.ported ? 'YES' : 'NO', 9) +
    (r.ported ? `${r.port} (shop.ts:${r.tsline}) [${r.how}]` : '— MISSING —')
  );
}

const missing = rows.filter(r => !r.ported);
console.log('\n=== NOT-PORTED render functions (' + missing.length + ') ===');
for (const r of missing) console.log(`  ${r.fn}  (shop.c:${r.cline})`);

console.log('\n=== External (engine) calls referenced by the reachable set ===');
console.log([...externalCalls].sort().join(', '));

// JSON artifact
const out = {
  roots: ROOTS,
  reachableCount: rows.length,
  portedCount: rows.filter(r => r.ported).length,
  rows,
  notPorted: missing.map(r => ({ fn: r.fn, cLine: r.cline })),
  externalCalls: [...externalCalls].sort(),
};
fs.writeFileSync('D:/Projet 1/pokemon-web-demo/audit-reports/shop-buymenu-completeness.json', JSON.stringify(out, null, 2));
console.log('\nwrote audit-reports/shop-buymenu-completeness.json');

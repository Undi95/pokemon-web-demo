#!/usr/bin/env node
'use strict';
/*
 * build-ts-symbol-index.cjs — index { symbole exporté → [fichiers TS] } pour le
 * résolveur d'imports du transpiler C→TS (scripts/transpile-c.cjs).
 *
 * Scanne src/**, include/**, harness/** pour :
 *   export function|const|let|var|class|interface|type|enum NAME
 *   export { A, B as C } [from '...']
 *
 * Sortie : audit-reports/ts-symbol-index.json  (NE PAS committer — régénérable).
 * À relancer après chaque vague de transpilation.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'audit-reports', 'ts-symbol-index.json');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

function blank(m) { return m.replace(/[^\n]/g, ' '); }
function stripTs(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank)
    .replace(/`(?:[^`\\]|\\[\s\S])*`/g, blank)
    .replace(/"(?:[^"\\\n]|\\.)*"/g, blank)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, blank);
}

const DECL_RE = /(?:^|\n)[ \t]*export[ \t]+(?:declare[ \t]+)?(?:abstract[ \t]+)?(function|const|let|var|class|interface|type|enum|async[ \t]+function)[ \t]+([A-Za-z_$][\w$]*)/g;
const LIST_RE = /(?:^|\n)[ \t]*export[ \t]*\{([^}]*)\}/g;

const index = new Map(); // name → [{file, kind}]
function add(name, file, kind) {
  if (!index.has(name)) index.set(name, []);
  const arr = index.get(name);
  if (!arr.some((e) => e.file === file)) arr.push({ file, kind });
}

const roots = ['src', 'include', 'harness'].map((d) => path.join(REPO, d)).filter(fs.existsSync);
let nFiles = 0;
for (const root of roots) {
  for (const p of walk(root)) {
    nFiles++;
    const rel = path.relative(REPO, p).replace(/\\/g, '/');
    const text = stripTs(fs.readFileSync(p, 'utf8'));
    let m;
    DECL_RE.lastIndex = 0;
    while ((m = DECL_RE.exec(text))) add(m[2], rel, m[1].replace(/\s+/g, ' '));
    LIST_RE.lastIndex = 0;
    while ((m = LIST_RE.exec(text))) {
      for (const piece of m[1].split(',')) {
        const t = piece.trim();
        if (!t) continue;
        // `A as B` → exporté sous B ; `type A` → A
        const asM = t.match(/^(?:type[ \t]+)?([A-Za-z_$][\w$]*)(?:[ \t]+as[ \t]+([A-Za-z_$][\w$]*))?$/);
        if (asM) add(asM[2] || asM[1], rel, 'named');
      }
    }
  }
}

const obj = Object.fromEntries([...index.entries()].sort((a, b) => a[0].localeCompare(b[0])));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generated: null, files: nFiles, symbols: obj }, null, 1));
console.log(`${nFiles} fichiers scannés · ${index.size} symboles exportés → ${OUT}`);
const ambiguous = [...index.entries()].filter(([, v]) => v.length > 2);
console.log(`symboles exportés à ≥3 endroits (bridges probables) : ${ambiguous.length}`);

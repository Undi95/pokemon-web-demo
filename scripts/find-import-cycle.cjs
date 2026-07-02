#!/usr/bin/env node
'use strict';
// Trouve les chemins d'import decomp-globals → mail.ts (diagnostic TDZ MALE).
const fs = require('fs');
const path = require('path');
const REPO = 'D:/Projet 1/pokemon-web-demo';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}
const files = [...walk(path.join(REPO, 'src')), ...walk(path.join(REPO, 'harness')), ...walk(path.join(REPO, 'include'))];
const IMPORT_RE = /(?:^|\n)\s*import\s[^;]*?from\s+['"]([^'"]+)['"]|(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;
const TYPE_ONLY_RE = /import\s+type\s/;

function resolveImport(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const cand of [base + '.ts', path.join(base, 'index.ts'), base]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return path.normalize(cand);
  }
  return null;
}

const edges = new Map(); // file → [{to, typeOnly}]
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const list = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src))) {
    const spec = m[1] || m[2];
    const stmt = m[0];
    const to = resolveImport(f, spec);
    if (to) list.push({ to, typeOnly: TYPE_ONLY_RE.test(stmt) });
  }
  edges.set(path.normalize(f), list);
}

const SRC = path.normalize(path.join(REPO, process.argv[2] || 'harness/runtime/decomp-globals.ts'));
const DST = path.normalize(path.join(REPO, process.argv[3] || 'src/mail.ts'));

// BFS chemins (runtime imports only, pas type-only)
const prev = new Map();
const queue = [SRC];
prev.set(SRC, null);
while (queue.length) {
  const cur = queue.shift();
  if (cur === DST) break;
  for (const { to, typeOnly } of edges.get(cur) ?? []) {
    if (typeOnly || prev.has(to)) continue;
    prev.set(to, cur);
    queue.push(to);
  }
}
if (!prev.has(DST)) { console.log('AUCUN chemin runtime decomp-globals → mail.ts'); process.exit(0); }
const chain = [];
for (let n = DST; n; n = prev.get(n)) chain.unshift(path.relative(REPO, n));
console.log('CHEMIN (BFS le plus court) :\n  ' + chain.join('\n  → '));

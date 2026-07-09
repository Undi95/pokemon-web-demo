#!/usr/bin/env node
/* Audit des fichiers .ts JAMAIS atteints depuis le point d'entrée harness/main.ts.
 * BFS sur le graphe d'imports : import statiques, export-from, import() dynamiques.
 * Un fichier non atteint = candidat "mort" (à vérifier manuellement avant suppression). */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENTRY = path.join(ROOT, 'harness', 'main.ts');

// Répertoires de code source à considérer
const SRC_DIRS = ['src', 'harness', 'include'].map((d) => path.join(ROOT, d));

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(name)) acc.push(full);
  }
  return acc;
}

const allTs = [];
for (const d of SRC_DIRS) if (fs.existsSync(d)) walk(d, allTs);

// Extraction des specifiers d'import depuis un fichier
function extractSpecifiers(file) {
  const code = fs.readFileSync(file, 'utf-8');
  const specs = new Set();
  // import ... from '...'    /    export ... from '...'    /    import '...'
  const reFrom = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  // import('...')
  const reDyn = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = reFrom.exec(code))) specs.add(m[1]);
  while ((m = reDyn.exec(code))) specs.add(m[1]);
  return [...specs];
}

// Résout un specifier relatif vers un fichier réel
function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // bare import (node_modules) — ignoré
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    base + '.ts',
    base + '.tsx',
    base + '.js',
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
  ];
  for (const c of candidates) {
    // si le specifier finit en .js mais le fichier réel est .ts
    if (c.endsWith('.js')) {
      const tsv = c.replace(/\.js$/, '.ts');
      if (fs.existsSync(tsv) && fs.statSync(tsv).isFile()) return tsv;
    }
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

// BFS depuis l'entrée
const reachable = new Set();
const queue = [ENTRY];
const unresolved = []; // specifiers relatifs non résolus (signal de bug)
while (queue.length) {
  const file = queue.shift();
  if (reachable.has(file)) continue;
  reachable.add(file);
  for (const spec of extractSpecifiers(file)) {
    const r = resolveSpec(file, spec);
    if (r) {
      if (!reachable.has(r)) queue.push(r);
    } else if (spec.startsWith('.')) {
      unresolved.push({ from: path.relative(ROOT, file), spec });
    }
  }
}

const orphans = allTs.filter((f) => !reachable.has(f)).map((f) => path.relative(ROOT, f).replace(/\\/g, '/')).sort();

console.log(`Total .ts(x) dans src/ + harness/ : ${allTs.length}`);
console.log(`Atteignables depuis harness/main.ts : ${reachable.size}`);
console.log(`ORPHELINS (jamais atteints) : ${orphans.length}`);
console.log('');
console.log('=== ORPHELINS ===');
for (const o of orphans) console.log(o);

if (unresolved.length) {
  console.log('');
  console.log(`=== SPECIFIERS RELATIFS NON RÉSOLUS (${unresolved.length}) — vérifier (peut masquer un fichier vivant) ===`);
  const seen = new Set();
  for (const u of unresolved) {
    const key = u.from + ' -> ' + u.spec;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${u.from}  ->  ${u.spec}`);
  }
}

// Dump JSON pour traitement éventuel
const out = path.join(ROOT, 'audit-reports', 'unused-ts.json');
fs.writeFileSync(out, JSON.stringify({ total: allTs.length, reachable: reachable.size, orphans, unresolved }, null, 2));
console.log('');
console.log(`(JSON → ${path.relative(ROOT, out)})`);

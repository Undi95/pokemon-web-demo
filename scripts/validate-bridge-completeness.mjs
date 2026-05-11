#!/usr/bin/env node
/**
 * validate-bridge-completeness.mjs
 * ---------------------------------
 * Vérifie que tous les `globalThis.X` référencés dans le code (= auto-files,
 * scripts callbacks, etc.) ont une impl quelque part dans src/engine/.
 *
 * Heuristique :
 *   1. Scan tous .ts dans src/engine/ pour `globalThis.X` ou `(globalThis as ...).X`
 *      pattern (= reference to global symbol).
 *   2. Scan tous .ts pour `globalThis.X = Y` ou `;(globalThis as ...).X = Y`
 *      pattern (= installation of global symbol).
 *   3. Pour chaque referenced symbol, check qu'il y a un assignment.
 *   4. Skip les noms purement TypeScript (= globalThis as Record<X, Y> pas un symbol).
 *
 * Usage :
 *   node scripts/validate-bridge-completeness.mjs               # rapport stdout
 *   node scripts/validate-bridge-completeness.mjs --output=x.md # markdown
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcEngine = join(projectRoot, 'src', 'engine');

function walk(dir, results = []) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Include auto/ for reference scanning, but track separately
      walk(full, results);
    } else if (f.endsWith('.ts') && !f.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const tsFiles = walk(srcEngine);

// ─── Patterns ────────────────────────────────────────────────────────────────

// References: globalThis.X / (globalThis as X).Y / (globalThis as any).Z
const REF_RE1 = /\bglobalThis\.(\w+)/g;
const REF_RE2 = /\(globalThis\s+as\s+[^)]+\)\.(\w+)/g;
const REF_RE3 = /\(globalThis\s+as\s+[^)]+\)\[['"](\w+)['"]\]/g;

// Assignments : globalThis.X = ... or (globalThis ...)[X] =
const ASSIGN_RE1 = /\bglobalThis\.(\w+)\s*=\s*[^=]/g;
const ASSIGN_RE2 = /\(globalThis\s+as\s+[^)]+\)\.(\w+)\s*=\s*[^=]/g;
const ASSIGN_RE3 = /\(globalThis\s+as\s+[^)]+\)\[['"](\w+)['"]\]\s*=\s*[^=]/g;

const referenced = new Map(); // name → [{file, line}]
const assigned = new Map();    // name → [{file, line}]

function record(map, name, file, line) {
  if (!map.has(name)) map.set(name, []);
  map.get(name).push({ file, line });
}

for (const tsFile of tsFiles) {
  const content = readFileSync(tsFile, 'utf8');
  const rel = tsFile.replace(projectRoot, '').replace(/\\/g, '/');

  // Strip comments to reduce noise
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  for (const re of [REF_RE1, REF_RE2, REF_RE3]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(stripped))) {
      // We want to find the line in the original content, so search the prefix
      const lineNum = stripped.slice(0, m.index).split('\n').length;
      record(referenced, m[1], rel, lineNum);
    }
  }
  for (const re of [ASSIGN_RE1, ASSIGN_RE2, ASSIGN_RE3]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(stripped))) {
      const lineNum = stripped.slice(0, m.index).split('\n').length;
      record(assigned, m[1], rel, lineNum);
    }
  }
}

// ─── Compute missing (= referenced but never assigned) ───────────────────────

const missing = [];
for (const [name, refs] of referenced) {
  if (assigned.has(name)) continue;
  // Skip standard globals
  if (['window', 'document', 'console', 'Math', 'Date', 'JSON', 'String', 'Number',
       'Array', 'Object', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Symbol',
       'undefined', 'NaN', 'Infinity', 'globalThis', 'this', 'self',
       'fetch', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
       'requestAnimationFrame', 'cancelAnimationFrame',
       'btoa', 'atob', 'encodeURIComponent', 'decodeURIComponent',
       'parseInt', 'parseFloat', 'isNaN', 'isFinite',
       'Phaser',  // Phaser global
       'process', 'require', 'module', 'exports', 'global',  // Node
      ].includes(name)) continue;
  // Skip TS type-level globals
  if (/^[A-Z]+$/.test(name) && name.length <= 4) continue;
  missing.push({ name, references: refs });
}

missing.sort((a, b) => b.references.length - a.references.length);

// ─── Output ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outputArg = args.find(a => a.startsWith('--output='));
const outputFile = outputArg?.split('=')[1];

function fmtMd() {
  let out = '# Bridge completeness audit\n\n';
  out += `Generated : ${new Date().toISOString()}\n\n`;
  out += `Files scanned : ${tsFiles.length}\n\n`;
  out += `Total globalThis references : ${referenced.size} distinct symbols\n`;
  out += `Total globalThis assignments : ${assigned.size} distinct symbols\n`;
  out += `Referenced but NOT assigned : ${missing.length}\n\n`;

  out += '## Missing assignments (= globalThis.X referenced but never set)\n\n';
  out += 'Top 50 by reference count :\n\n';
  for (const m of missing.slice(0, 50)) {
    out += `### \`${m.name}\` — referenced ${m.references.length}× :\n`;
    for (const r of m.references.slice(0, 5)) out += `  - ${r.file}:${r.line}\n`;
    if (m.references.length > 5) out += `  - ... +${m.references.length - 5} more\n`;
    out += '\n';
  }
  return out;
}

if (outputFile?.endsWith('.md')) {
  writeFileSync(outputFile, fmtMd());
  console.error(`Report written to ${outputFile}`);
} else if (outputFile?.endsWith('.json')) {
  writeFileSync(outputFile, JSON.stringify({
    referenced: [...referenced.entries()],
    assigned: [...assigned.entries()],
    missing,
  }, null, 2));
  console.error(`Report written to ${outputFile}`);
} else {
  console.log(`Total globalThis references : ${referenced.size} distinct symbols`);
  console.log(`Total globalThis assignments : ${assigned.size} distinct symbols`);
  console.log(`Referenced but NOT assigned : ${missing.length}`);
  console.log('');
  console.log('=== Top missing ===');
  for (const m of missing.slice(0, 30)) {
    console.log(`  ${m.name} (${m.references.length}×): ${m.references.slice(0, 3).map(r => r.file).join(', ')}${m.references.length > 3 ? '...' : ''}`);
  }
}

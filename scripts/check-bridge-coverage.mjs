#!/usr/bin/env node
/**
 * check-bridge-coverage.mjs
 *
 * Computes bridge coverage stats for the auto-transpiled décomp modules.
 *
 *   - Parses `src/engine/decomp-bridge.ts` to extract `__bridgedHelpers__`
 *     and `__notImplementedHelpers__` sets.
 *   - Reads all `public/decomp/em/extracted-all/*.json` and accumulates
 *     callsTo per global helper name.
 *   - Counts each helper's total call frequency, marks which are bridged.
 *   - Filters callees that are also defined inside an auto-file
 *     (= no need to bridge a self-defined function).
 *   - Prints :
 *     1. Coverage % (= bridged / total unique callees)
 *     2. Top N still-unbridged helpers, sorted by frequency
 *     3. Top NotImplemented (= will throw at runtime)
 *
 * Usage : `node scripts/check-bridge-coverage.mjs [topN]`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const BRIDGE_PATH = path.join(ROOT, 'src/engine/decomp-bridge.ts');
const EXTRACTED_DIR = path.join(ROOT, 'public/decomp/em/extracted-all');

const topN = parseInt(process.argv[2] ?? '30', 10);

// 1) Parse bridge file for __bridgedHelpers__ + __notImplementedHelpers__.
const bridgeSrc = fs.readFileSync(BRIDGE_PATH, 'utf-8');

function parseSet(varName) {
  const re = new RegExp(
    `${varName}\\s*:\\s*ReadonlySet<string>\\s*=\\s*new Set\\(\\s*\\[([\\s\\S]*?)\\]\\s*\\)`,
    'm',
  );
  const m = bridgeSrc.match(re);
  if (!m) return new Set();
  const body = m[1];
  const set = new Set();
  for (const match of body.matchAll(/'([^']+)'|"([^"]+)"/g)) {
    set.add(match[1] ?? match[2]);
  }
  return set;
}

const bridged = parseSet('__bridgedHelpers__');
const notImpl = parseSet('__notImplementedHelpers__');

// 2) Iterate all extracted-all JSON files.
const callCounts = new Map(); // name → total count across all files
const definedNames = new Set(); // names defined as functions in some file

const files = fs
  .readdirSync(EXTRACTED_DIR)
  .filter((f) => f.endsWith('.json') && f !== '_summary.json');

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, file), 'utf-8'));
  if (!data.functions) continue;
  for (const [fname, info] of Object.entries(data.functions)) {
    definedNames.add(fname);
    if (Array.isArray(info.callsTo)) {
      for (const callee of info.callsTo) {
        callCounts.set(callee, (callCounts.get(callee) ?? 0) + 1);
      }
    }
  }
}

// 3) Build the unbridged list :
//    callees - bridged - notImpl - definedNames - common control keywords.
const KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'goto', 'sizeof', 'typedef', 'struct', 'union', 'enum',
  'const', 'static', 'extern', 'inline', 'register', 'volatile',
]);

const unbridged = [];
for (const [name, count] of callCounts.entries()) {
  if (bridged.has(name)) continue;
  if (notImpl.has(name)) continue; // tracked separately
  if (definedNames.has(name)) continue; // it's a sibling auto-fn
  if (KEYWORDS.has(name)) continue;
  unbridged.push({ name, count });
}

unbridged.sort((a, b) => b.count - a.count);

// 4) Stats summary.
const totalUniqueCallees = callCounts.size;
const totalDefinedSiblings = [...callCounts.keys()].filter((n) =>
  definedNames.has(n),
).length;
const externalCallees = totalUniqueCallees - totalDefinedSiblings;
const bridgedCount = [...callCounts.keys()].filter((n) => bridged.has(n)).length;
const notImplCount = [...callCounts.keys()].filter((n) => notImpl.has(n)).length;
const unbridgedCount = unbridged.length;
const coverage = ((bridgedCount + notImplCount) / externalCallees) * 100;
const realCoverage = (bridgedCount / externalCallees) * 100;

console.log('=== Bridge Coverage Report ===');
console.log(`Total unique callees in décomp : ${totalUniqueCallees}`);
console.log(`  - Defined as sibling auto-fn  : ${totalDefinedSiblings}`);
console.log(`  - External (need bridge)      : ${externalCallees}`);
console.log(`    - Bridged 1:1               : ${bridgedCount}`);
console.log(`    - NotImplemented stub       : ${notImplCount}`);
console.log(`    - UNBRIDGED (= undefined)   : ${unbridgedCount}`);
console.log(`Coverage (bridged + NotImpl) : ${coverage.toFixed(2)}%`);
console.log(`Real coverage (bridged 1:1)  : ${realCoverage.toFixed(2)}%`);
console.log('');

console.log(`=== Top ${topN} Unbridged Helpers (by call frequency) ===`);
for (const { name, count } of unbridged.slice(0, topN)) {
  console.log(`  ${count.toString().padStart(4)} × ${name}`);
}

console.log('');
console.log('=== NotImplemented helpers actually called ===');
for (const [name, count] of [...callCounts.entries()].filter(([n]) => notImpl.has(n)).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${count.toString().padStart(4)} × ${name}`);
}

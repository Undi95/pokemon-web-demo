#!/usr/bin/env node
/** Find specials used in map scripts but not registered in specials-registry.ts. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Collect used specials.
const usedDir = 'public/decomp/em/scripts';
const used = new Map();
for (const f of readdirSync(usedDir)) {
  if (!f.endsWith('.json') || f === '_common.json' || f === '_all.json') continue;
  try {
    const data = JSON.parse(readFileSync(join(usedDir, f), 'utf8'));
    for (const lines of Object.values(data.scripts ?? {})) {
      for (const line of lines) {
        const s = String(line).trim();
        const m = s.match(/^(?:special|specialvar)\s+(?:VAR_\w+\s*,\s*)?(\w+)/);
        if (m) used.set(m[1], (used.get(m[1]) ?? 0) + 1);
      }
    }
  } catch {}
}

// 2. Collect registered specials.
const registered = new Set();
const src = readFileSync('src/engine/specials-registry.ts', 'utf8');
const re = /registerSpecial\('([^']+)'/g;
let m;
while ((m = re.exec(src)) !== null) registered.add(m[1]);

const missing = [];
for (const [op, count] of used) {
  if (registered.has(op)) continue;
  missing.push([op, count]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`Total used: ${used.size}, registered: ${registered.size}, missing: ${missing.length}`);
console.log('\nTop missing (by usage):');
for (const [op, n] of missing.slice(0, 50)) {
  console.log(`${n}\t${op}`);
}

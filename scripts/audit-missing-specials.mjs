#!/usr/bin/env node
// Audit : list specials called from scripts that are NOT registered.
//
// Usage : node scripts/audit-missing-specials.mjs
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
const SPECIALS_FILE = 'src/engine/specials-registry.ts';

const counts = new Map();
const files = readdirSync(SCRIPTS_DIR);
for (const f of files) {
  if (!f.endsWith('.json')) continue;
  try {
    const j = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    if (!j.scripts) continue;
    for (const [_n, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const parts = line.split(/\s+/);
        // `special X` or `specialvar VAR_RESULT, X` (= 2nd arg for specialvar)
        if (parts[0] === 'special' && parts[1]) {
          counts.set(parts[1].replace(/,$/, ''), (counts.get(parts[1].replace(/,$/, '')) || 0) + 1);
        } else if (parts[0] === 'specialvar' && parts[2]) {
          const name = parts[2].replace(/,$/, '');
          counts.set(name, (counts.get(name) || 0) + 1);
        }
      }
    }
  } catch {}
}

const src = readFileSync(SPECIALS_FILE, 'utf8');
const re = /registerSpecial\(['"]([^'"]+)['"]/g;
const registered = new Set();
let m;
while ((m = re.exec(src))) registered.add(m[1]);

const missing = [];
for (const [op, n] of counts.entries()) {
  if (registered.has(op)) continue;
  missing.push([op, n]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`=== Missing specials (= called from scripts but not registered) ===`);
console.log(`Registered : ${registered.size} | Used : ${counts.size} | Missing : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 80)) {
  console.log(`  ${n.toString().padStart(5)}  ${op}`);
}

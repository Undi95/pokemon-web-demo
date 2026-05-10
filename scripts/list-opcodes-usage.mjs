#!/usr/bin/env node
/** List opcodes used across all extracted map scripts, sorted by frequency. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'public/decomp/em/scripts';
const opcodes = new Map();
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  try {
    const data = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const lines of Object.values(data.scripts ?? {})) {
      for (const line of lines) {
        const m = String(line).trim().match(/^(\w+)/);
        if (m) opcodes.set(m[1], (opcodes.get(m[1]) ?? 0) + 1);
      }
    }
  } catch {}
}
const sorted = [...opcodes.entries()].sort((a, b) => b[1] - a[1]);
console.log(`Total unique: ${opcodes.size}`);
for (const [op, n] of sorted) console.log(`${n}\t${op}`);

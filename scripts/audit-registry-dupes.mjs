#!/usr/bin/env node
/**
 * Futureproof : detect duplicate `register*('name', ...)` calls across all
 * registries in src/engine. Map.set() / Record key set / WeakMap silently
 * overwrite, so a duplicate registration replaces the previous handler with
 * NO error — was the root cause of the 2026-05-09 door bug
 * (commit df9c0d2a) where iter10 stubbed opendoor/closedoor with no-op.
 *
 * Run pre-commit or CI :
 *   node scripts/audit-registry-dupes.mjs
 *
 * Exit code 0 : all clean. Exit 1 : duplicates found (= caller should reject).
 */
import { readFileSync, existsSync } from 'fs';

const targets = [
  // (file path relative to repo root, register function name)
  { file: 'src/engine/script-opcodes.ts',                       fn: 'registerOpcode' },
  { file: 'src/engine/script-runtime.ts',                       fn: 'registerOpcode' },
  { file: 'src/engine/specials-registry.ts',                    fn: 'registerSpecial' },
  { file: 'src/engine/script-runner.ts',                        fn: 'registerSpecial' },
  { file: 'src/engine/object-event-graphics.ts',                fn: 'registerAnim' },
  { file: 'src/engine/object-event-graphics.ts',                fn: 'registerAnimTable' },
  { file: 'src/engine/trainer-pic-graphics.ts',                 fn: 'registerTrainerPic' },
  { file: 'src/engine/decomp-impls/sprite-affine-extras.ts',    fn: 'registerAffineAnim' },
  { file: 'src/engine/decomp-impls/sprite-affine-extras.ts',    fn: 'registerAffineAnimTable' },
];

let anyDupe = false;
let totalEntries = 0;

for (const t of targets) {
  if (!existsSync(t.file)) continue;
  const src = readFileSync(t.file, 'utf8');
  // Strip line comments to ignore `// registerOpcode(...)` inside doc blocks.
  const lines = src.split('\n').map(l => {
    const cmtIdx = l.indexOf('//');
    return cmtIdx >= 0 ? l.slice(0, cmtIdx) : l;
  });
  const re = new RegExp(`${t.fn}\\(\\s*['"]([^'"]+)['"]`, 'g');
  const seen = new Map();
  for (let i = 0; i < lines.length; i++) {
    let m;
    while ((m = re.exec(lines[i]))) {
      if (!seen.has(m[1])) seen.set(m[1], []);
      seen.get(m[1]).push(i + 1);
    }
  }
  totalEntries += [...seen.values()].reduce((a, v) => a + v.length, 0);
  const dups = [...seen.entries()].filter(([_k, v]) => v.length > 1);
  if (dups.length > 0) {
    anyDupe = true;
    console.error(`\n[DUPE] ${t.file} :: ${t.fn} — ${dups.length} duplicate name(s) :`);
    for (const [name, lineNums] of dups) {
      console.error(`  • '${name}' registered at lines : ${lineNums.join(', ')}`);
      console.error(`    ⚠️  Last register WINS (Map.set overwrites). Remove duplicates or rename.`);
    }
  } else {
    console.log(`✓ ${t.file} :: ${t.fn} — ${seen.size} unique, no dupes`);
  }
}

console.log(`\nTotal registrations scanned : ${totalEntries}`);
if (anyDupe) {
  console.error('\n❌ Duplicates found. Fix before commit.');
  process.exit(1);
} else {
  console.log('\n✅ All registries clean.');
  process.exit(0);
}

#!/usr/bin/env node
/**
 * inject-bridge-imports.mjs
 * --------------------------
 * Pour chaque `<file>-all-auto.ts` dans `src/engine/decomp-data/auto/src-all/`,
 * injecte au top un destructuring import depuis `decomp-bridge` qui pull
 * tous les callees du `__callsTo__` array.
 *
 * Pattern injecté :
 * ```ts
 * import * as _bridge from '../../../decomp-bridge';
 * const {
 *   LoadPalette, FaceDirection, ARRAY_COUNT, /* one entry per callsTo *\/
 * } = _bridge;
 * ```
 *
 * → Si un helper est bridgé : binding pointe vers l'impl bridge.
 * → Si pas bridgé : `undefined` → call throws "X is not a function" (= fail-fast).
 *
 * **Idempotent** : détecte si le bloc d'import est déjà présent et le remplace.
 *
 * Usage :
 *   node scripts/inject-bridge-imports.mjs           # tous les fichiers
 *   node scripts/inject-bridge-imports.mjs <file>    # juste ce fichier
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const inDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src-all');

const BEGIN_MARKER = '// ─── BRIDGE IMPORT (auto-injected by inject-bridge-imports.mjs) ───';
const END_MARKER = '// ─── END BRIDGE IMPORT ───';

/** Parse the `__callsTo__` array out of an auto file source. */
function extractCallsTo(src) {
  const m = src.match(/export const __callsTo__:\s*ReadonlyArray<string>\s*=\s*(\[[^\]]+\])/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn(`  WARN failed to parse __callsTo__: ${e.message}`);
    return null;
  }
}

/** Strip an existing bridge import block (= for idempotency). */
function stripExistingBridgeImport(src) {
  const beginIdx = src.indexOf(BEGIN_MARKER);
  const endIdx = src.indexOf(END_MARKER);
  if (beginIdx === -1 || endIdx === -1) return src;
  // Strip including the END marker line + trailing newline.
  const endLineEnd = src.indexOf('\n', endIdx) + 1;
  return src.slice(0, beginIdx) + src.slice(endLineEnd);
}

/** Generate the bridge import block. */
function generateImportBlock(callsTo) {
  if (!callsTo || callsTo.length === 0) return '';
  // Filter out callees that are obviously not from the bridge (= TypeScript reserved
  // words and things that would conflict). Conservative whitelist : start with
  // letter or underscore, no funky chars.
  const valid = callsTo.filter(name => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name));
  // Drop duplicates, sort.
  const sorted = [...new Set(valid)].sort();
  const lines = [];
  lines.push(BEGIN_MARKER);
  lines.push(`// Pull tous les callees ce module fait depuis le bridge unifié.`);
  lines.push(`// Si un helper est bridgé : binding actif. Sinon : undefined → throw au call.`);
  lines.push(`import * as _bridge from '../../../decomp-bridge';`);
  lines.push(`const {`);
  // Pack 4 per line for readability.
  for (let i = 0; i < sorted.length; i += 4) {
    const chunk = sorted.slice(i, i + 4);
    lines.push(`  ${chunk.join(', ')}${i + 4 < sorted.length ? ',' : ',  // 4-per-line for readability'}`);
  }
  lines.push(`} = _bridge;`);
  lines.push(END_MARKER);
  lines.push(``);
  return lines.join('\n');
}

/** Find the right insertion point : after the @ts-nocheck pragma. */
function findInsertionPoint(src) {
  // After /* eslint-disable */ + // @ts-nocheck.
  const tsNoCheckIdx = src.indexOf('// @ts-nocheck');
  if (tsNoCheckIdx === -1) return -1;
  // Skip to end of that line + skip following blank lines.
  let i = src.indexOf('\n', tsNoCheckIdx) + 1;
  while (i < src.length && (src[i] === '\n' || src[i] === '\r')) i++;
  return i;
}

function processFile(fpath) {
  const src = readFileSync(fpath, 'utf8');
  const callsTo = extractCallsTo(src);
  if (!callsTo) {
    return { fpath, status: 'no-callsTo', changed: false };
  }
  const stripped = stripExistingBridgeImport(src);
  const insertAt = findInsertionPoint(stripped);
  if (insertAt === -1) {
    return { fpath, status: 'no-insertion-point', changed: false };
  }
  const block = generateImportBlock(callsTo);
  if (!block) {
    return { fpath, status: 'empty-callsTo', changed: false };
  }
  const newSrc = stripped.slice(0, insertAt) + block + stripped.slice(insertAt);
  if (newSrc === src) {
    return { fpath, status: 'unchanged', changed: false };
  }
  writeFileSync(fpath, newSrc, 'utf8');
  return { fpath, status: 'updated', changed: true, calleesCount: callsTo.length };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let files;
if (args.length > 0) {
  files = args.map(a => resolve(a));
} else {
  files = readdirSync(inDir).filter(f => f.endsWith('-all-auto.ts')).map(f => join(inDir, f));
}

console.log(`[inject-bridge-imports] processing ${files.length} files`);

let updated = 0, unchanged = 0, errors = 0;
for (const fpath of files) {
  try {
    const r = processFile(fpath);
    if (r.changed) {
      updated++;
      // console.log(`  ${basename(r.fpath)}: ${r.calleesCount} callees`);
    } else {
      unchanged++;
    }
  } catch (e) {
    console.error(`  ERROR ${basename(fpath)}: ${e.message}`);
    errors++;
  }
}

console.log(`[inject-bridge-imports] DONE`);
console.log(`  Updated   : ${updated}`);
console.log(`  Unchanged : ${unchanged}`);
console.log(`  Errors    : ${errors}`);

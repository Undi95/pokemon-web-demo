#!/usr/bin/env node
/**
 * extract-movement-action-funcs.mjs
 * ----------------------------------
 * Parse `src/data/object_events/movement_action_func_tables.h` du décomp pour
 * extraire :
 *   1. Master table `gMovementActionFuncs[]` mapping MOVEMENT_ACTION_X → per-action table
 *   2. Per-action tables `gMovementActionFuncs_X[]` listant les step function names
 *
 * Output : `public/decomp/em/movement-action-funcs.json`
 *   {
 *     "master": { "MOVEMENT_ACTION_FACE_DOWN": "FaceDown", ... },
 *     "tables": { "FaceDown": ["MovementAction_FaceDown_Step0", "MovementAction_PauseSpriteAnim"], ... }
 *   }
 *
 * Le runtime peut utiliser ce JSON pour dispatcher action ID → step functions
 * sans hardcoder chaque case dans movement-system.ts.
 *
 * Cf. roadmap-session-124.md Plan B/C pour le contexte.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const headerPath = join(decompPath, 'src', 'data', 'object_events', 'movement_action_func_tables.h');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'movement-action-funcs.json');
mkdirSync(dirname(outPath), { recursive: true });

const src = readFileSync(headerPath, 'utf8');

// Strip block comments + line comments to simplify parsing.
const cleaned = src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');

// ─── 1. Master table : gMovementActionFuncs[] = { ... } ─────────────────────
const masterRe = /u8\s*\(\s*\*\s*const\s*\*\s*const\s+gMovementActionFuncs\s*\[\s*\]\s*\)\s*\([^)]*\)\s*=\s*\{([\s\S]*?)\n\}\s*;/;
const masterMatch = cleaned.match(masterRe);
if (!masterMatch) {
  console.error('[extract-movement-action-funcs] FAIL: master gMovementActionFuncs[] table not found');
  process.exit(1);
}
const masterBody = masterMatch[1];

const master = {};
const masterEntryRe = /\[\s*(MOVEMENT_ACTION_[A-Z0-9_]+)\s*\]\s*=\s*gMovementActionFuncs_([A-Za-z0-9_]+)/g;
let m;
while ((m = masterEntryRe.exec(masterBody)) !== null) {
  const [, action, tableName] = m;
  master[action] = tableName;
}

console.log(`[extract-movement-action-funcs] master table: ${Object.keys(master).length} actions`);

// ─── 2. Per-action tables : gMovementActionFuncs_X[] = { Step0, Step1, ... } ─
const tables = {};
const tableRe = /u8\s*\(\s*\*\s*const\s+gMovementActionFuncs_([A-Za-z0-9_]+)\s*\[\s*\]\s*\)\s*\([^)]*\)\s*=\s*\{([\s\S]*?)\n\}\s*;/g;
while ((m = tableRe.exec(cleaned)) !== null) {
  const [, name, body] = m;
  // Body: list of identifiers separated by commas + maybe trailing comma.
  const stepFns = [];
  const fnRe = /([A-Za-z_][A-Za-z0-9_]*)/g;
  let fn;
  while ((fn = fnRe.exec(body)) !== null) {
    stepFns.push(fn[1]);
  }
  tables[name] = stepFns;
}

console.log(`[extract-movement-action-funcs] per-action tables: ${Object.keys(tables).length}`);

// ─── 3. Sanity check : every master entry has a matching table ──────────────
const missing = [];
for (const [action, tableName] of Object.entries(master)) {
  if (!tables[tableName]) missing.push({ action, tableName });
}
if (missing.length > 0) {
  console.warn(`[extract-movement-action-funcs] WARNING: ${missing.length} actions reference missing tables:`);
  for (const x of missing.slice(0, 5)) console.warn(`  ${x.action} → gMovementActionFuncs_${x.tableName}`);
}

// ─── 4. Output JSON ─────────────────────────────────────────────────────────
const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'src/data/object_events/movement_action_func_tables.h',
  masterCount: Object.keys(master).length,
  tableCount: Object.keys(tables).length,
  master,
  tables,
};

writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`[extract-movement-action-funcs] output: ${outPath}`);
console.log(`[extract-movement-action-funcs] sample action: MOVEMENT_ACTION_FACE_DOWN → gMovementActionFuncs_${master.MOVEMENT_ACTION_FACE_DOWN}`);
console.log(`[extract-movement-action-funcs] sample table: gMovementActionFuncs_FaceDown = [${(tables.FaceDown ?? []).join(', ')}]`);

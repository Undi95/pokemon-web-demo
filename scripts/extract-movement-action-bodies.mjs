#!/usr/bin/env node
/**
 * extract-movement-action-bodies.mjs
 * -----------------------------------
 * Parse `src/event_object_movement.c` du décomp pour extraire le corps C de
 * chaque `bool8 MovementAction_X_StepN(struct ObjectEvent *, struct Sprite *)`.
 *
 * Use case :
 *   - Le runtime peut dispatcher action ID → step function via table générée
 *     par `extract-movement-action-funcs.mjs`.
 *   - Pour AUTO-PORT chaque step function, on a besoin de son body C que ce
 *     script extrait sous forme JSON pour transpilation ultérieure.
 *
 * Output : `public/decomp/em/movement-action-bodies.json`
 *   {
 *     "MovementAction_FaceDown_Step0": {
 *       "signature": "bool8 MovementAction_FaceDown_Step0(struct ObjectEvent *objectEvent, struct Sprite *sprite)",
 *       "body": "    FaceDirection(objectEvent, sprite, DIR_SOUTH);\n    sprite->sActionFuncId = 1;\n    return TRUE;",
 *       "callsTo": ["FaceDirection"],
 *       "isHelper": false
 *     },
 *     ...
 *   }
 *
 * Plan B / Phase suivante : transpile-callbacks.mjs ingère ce JSON pour
 * générer auto/event_object_movement-callbacks-auto.ts avec les ~250 step
 * functions transcrites.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const cPath = join(decompPath, 'src', 'event_object_movement.c');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'movement-action-bodies.json');
mkdirSync(dirname(outPath), { recursive: true });

const src = readFileSync(cPath, 'utf8');

// Strip block comments + line comments. (Conservative: in C, // can appear in
// strings but unlikely in this file.)
const cleaned = src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');

// ─── Find all bool8 MovementAction_X(...) function definitions ──────────────
// Signature pattern : `bool8 MovementAction_<NAME>(struct ObjectEvent *<x>, struct Sprite *<y>)`
// optionally preceded by `static` or other qualifiers. Followed by `{` body `}`.
const fnRe = /(?:static\s+|inline\s+)*bool8\s+(MovementAction_[A-Za-z0-9_]+)\s*\(\s*struct\s+ObjectEvent\s*\*\s*\w+\s*,\s*struct\s+Sprite\s*\*\s*\w+\s*\)\s*\{/g;

/** Find matching closing brace from an open-brace position. */
function findMatchingBrace(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const out = {};
let m;
while ((m = fnRe.exec(cleaned)) !== null) {
  const name = m[1];
  const sigStart = m.index;
  const openBrace = m.index + m[0].length - 1;
  const closeBrace = findMatchingBrace(cleaned, openBrace);
  if (closeBrace === -1) {
    console.warn(`[extract-movement-action-bodies] Unbalanced braces for ${name}`);
    continue;
  }
  const signature = cleaned.slice(sigStart, openBrace).trim();
  const body = cleaned.slice(openBrace + 1, closeBrace).trim();

  // Find function calls in body (best-effort, simple regex).
  const callsTo = new Set();
  const callRe = /\b([A-Z][A-Za-z0-9_]+)\s*\(/g;
  let c;
  while ((c = callRe.exec(body)) !== null) {
    const callName = c[1];
    // Skip macros / common types.
    if (['TRUE', 'FALSE', 'NULL', 'DIR_SOUTH', 'DIR_NORTH', 'DIR_WEST', 'DIR_EAST'].includes(callName)) continue;
    callsTo.add(callName);
  }

  // Heuristic : helpers (e.g. MovementAction_PauseSpriteAnim, MovementAction_FaceDirection_AnyHeldMovement)
  // are referenced from per-action tables but not gMovementActionFuncs[]. We
  // can't tell from just the .c file alone. Mark all as "step?" — reader of
  // this JSON should cross-reference with movement-action-funcs.json.

  out[name] = {
    signature,
    body,
    callsTo: [...callsTo].sort(),
  };
}

writeFileSync(outPath, JSON.stringify(out, null, 2));

const stats = {
  totalExtracted: Object.keys(out).length,
  avgBodyLen: Math.round(
    Object.values(out).reduce((acc, v) => acc + v.body.length, 0) / Object.keys(out).length
  ),
  callsToHistogram: {},
};
for (const v of Object.values(out)) {
  for (const callName of v.callsTo) {
    stats.callsToHistogram[callName] = (stats.callsToHistogram[callName] ?? 0) + 1;
  }
}
const topCalls = Object.entries(stats.callsToHistogram)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);

console.log(`[extract-movement-action-bodies] extracted: ${stats.totalExtracted} functions`);
console.log(`[extract-movement-action-bodies] avg body length: ${stats.avgBodyLen} chars`);
console.log(`[extract-movement-action-bodies] top 10 callsTo:`);
for (const [name, count] of topCalls) console.log(`  ${count}x ${name}`);
console.log(`[extract-movement-action-bodies] output: ${outPath}`);

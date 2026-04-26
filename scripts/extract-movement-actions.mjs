#!/usr/bin/env node
/**
 * Parse `asm/macros/movement.inc` du décomp pour extraire le mapping COMPLET
 * `script_name → MOVEMENT_ACTION_*` (160 actions au total).
 *
 * Aussi parse `include/constants/event_object_movement.h` pour récupérer la
 * VALEUR numérique de chaque MOVEMENT_ACTION_*.
 *
 * Sortie : `public/decomp/em/movement-actions.json`
 *   { "walk_up": { actionId: 9, dx: 0, dy: -1, facing: "up", kind: "walk", speedMs: 266 }, ... }
 *
 * Cf. DECOMP_ORIGIN_FILES.md section A. Movement.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'movement-actions.json');
mkdirSync(dirname(outPath), { recursive: true });

// ─── 1. Parse event_object_movement.h pour MOVEMENT_ACTION_* values ─────────
const constantsText = readFileSync(
  join(decompPath, 'include', 'constants', 'event_object_movement.h'),
  'utf8'
);

/** map MOVEMENT_ACTION_FACE_DOWN → 0x0 */
const actionValues = {};
const actionRe = /^#define\s+(MOVEMENT_ACTION_\w+)\s+(0x[0-9a-fA-F]+|\d+)/gm;
let m;
while ((m = actionRe.exec(constantsText)) !== null) {
  actionValues[m[1]] = parseInt(m[2]);
}

// ─── 2. Parse movement.inc pour script_name → MOVEMENT_ACTION_* ─────────────
const macroText = readFileSync(
  join(decompPath, 'asm', 'macros', 'movement.inc'),
  'utf8'
);

/** map "walk_up" → "MOVEMENT_ACTION_WALK_NORMAL_UP" */
const scriptToAction = {};
const macroRe = /create_movement_action\s+(\w+)\s*,\s*(MOVEMENT_ACTION_\w+)/g;
while ((m = macroRe.exec(macroText)) !== null) {
  scriptToAction[m[1]] = m[2];
}

// ─── 3. Dérive metadata (dx/dy/facing/kind/speedMs) depuis le name ──────────

// Vitesse en frames GBA (60 fps) → ms.
// Cf. event_object_movement.c : sMoveSpeedTimes[] = { 32, 16, 8, 4 } pour
// slow/normal/fast/faster (frames pour traverser 16 px = 1 tile).
const SPEED_FRAMES = {
  slow: 32,    // ~533ms
  slowest: 48, // ~800ms
  normal: 16,  // ~266ms
  fast: 8,     // ~133ms
  faster: 4,   // ~67ms
};
const FRAME_MS = 1000 / 60;
const speedMs = (frames) => Math.round(frames * FRAME_MS);

const DIR_DELTAS = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

function parseScriptName(name) {
  // delays
  const delayMatch = name.match(/^delay_(\d+)$/);
  if (delayMatch) {
    return { dx: 0, dy: 0, facing: null, kind: 'delay', speedMs: speedMs(Number(delayMatch[1])) };
  }
  // emotes (no movement, brief delay)
  if (name.startsWith('emote_')) {
    return { dx: 0, dy: 0, facing: null, kind: 'emote', speedMs: 200 };
  }
  // visibility
  if (name === 'set_invisible' || name === 'set_visible' ||
      name === 'lock_facing_direction' || name === 'unlock_facing_direction') {
    return { dx: 0, dy: 0, facing: null, kind: 'flag', speedMs: 1 };
  }
  // face_X, face_player, face_away_player
  if (name.startsWith('face_')) {
    const dir = name.slice(5);
    if (DIR_DELTAS[dir]) return { dx: 0, dy: 0, facing: dir, kind: 'face', speedMs: speedMs(2) };
    return { dx: 0, dy: 0, facing: null, kind: 'face_special', speedMs: speedMs(2) };
  }
  // walk_in_place_<speed?>_<dir> ou walk_in_place_<dir>
  if (name.startsWith('walk_in_place_')) {
    const rest = name.slice('walk_in_place_'.length);
    const parts = rest.split('_');
    let speed = 'normal', dir;
    if (parts.length === 2) { speed = parts[0]; dir = parts[1]; }
    else if (parts.length === 1) { dir = parts[0]; }
    if (DIR_DELTAS[dir]) {
      return { dx: 0, dy: 0, facing: dir, kind: 'walk_in_place', speedMs: speedMs(SPEED_FRAMES[speed] ?? 16) };
    }
  }
  // jog_in_place_<dir>
  if (name.startsWith('jog_in_place_')) {
    const dir = name.slice('jog_in_place_'.length);
    if (DIR_DELTAS[dir]) return { dx: 0, dy: 0, facing: dir, kind: 'jog_in_place', speedMs: speedMs(8) };
  }
  // run_in_place_<dir>
  if (name.startsWith('run_in_place_')) {
    const dir = name.slice('run_in_place_'.length);
    if (DIR_DELTAS[dir]) return { dx: 0, dy: 0, facing: dir, kind: 'run_in_place', speedMs: speedMs(4) };
  }
  // walk_slow_<dir>, walk_<dir>, walk_fast_<dir>, walk_faster_<dir>, walk_slowest_<dir>
  if (name.startsWith('walk_')) {
    const rest = name.slice('walk_'.length);
    const parts = rest.split('_');
    let speed = 'normal', dir;
    if (parts.length === 2 && DIR_DELTAS[parts[1]]) { speed = parts[0]; dir = parts[1]; }
    else if (parts.length === 1) { dir = parts[0]; }
    if (DIR_DELTAS[dir]) {
      const d = DIR_DELTAS[dir];
      return { ...d, facing: dir, kind: 'walk', speedMs: speedMs(SPEED_FRAMES[speed] ?? 16) };
    }
  }
  // run_<dir>
  if (name.startsWith('run_')) {
    const dir = name.slice(4);
    if (DIR_DELTAS[dir]) {
      const d = DIR_DELTAS[dir];
      return { ...d, facing: dir, kind: 'run', speedMs: speedMs(4) };
    }
  }
  // jump_<dir>, jump_2_<dir>, jump_in_place_<dir>
  if (name.startsWith('jump_in_place_')) {
    const dir = name.slice('jump_in_place_'.length);
    if (DIR_DELTAS[dir]) return { dx: 0, dy: 0, facing: dir, kind: 'jump_in_place', speedMs: speedMs(16) };
  }
  if (name.startsWith('jump_2_')) {
    const dir = name.slice('jump_2_'.length);
    if (DIR_DELTAS[dir]) {
      const d = DIR_DELTAS[dir];
      return { dx: d.dx * 2, dy: d.dy * 2, facing: dir, kind: 'jump_2', speedMs: speedMs(20) };
    }
  }
  if (name.startsWith('jump_')) {
    const dir = name.slice('jump_'.length);
    if (DIR_DELTAS[dir]) {
      const d = DIR_DELTAS[dir];
      return { ...d, facing: dir, kind: 'jump', speedMs: speedMs(16) };
    }
  }
  // slide_<dir>, slide_<speed?>_<dir>
  if (name.startsWith('slide_')) {
    const rest = name.slice('slide_'.length);
    const parts = rest.split('_');
    let dir;
    if (parts.length === 2 && DIR_DELTAS[parts[1]]) dir = parts[1];
    else if (parts.length === 1) dir = parts[0];
    if (DIR_DELTAS[dir]) {
      const d = DIR_DELTAS[dir];
      return { ...d, facing: dir, kind: 'slide', speedMs: speedMs(8) };
    }
  }
  // Catch-all : action inconnue/exotic, retourne metadata vide
  return { dx: 0, dy: 0, facing: null, kind: 'unknown', speedMs: speedMs(8) };
}

// ─── 4. Build le JSON final ─────────────────────────────────────────────────
const out = {};
for (const [scriptName, actionConst] of Object.entries(scriptToAction)) {
  const meta = parseScriptName(scriptName);
  out[scriptName] = {
    actionId: actionValues[actionConst] ?? -1,
    actionConst,
    ...meta,
  };
}

writeFileSync(outPath, JSON.stringify(out, null, 2));

// Stats
const byKind = {};
for (const v of Object.values(out)) byKind[v.kind] = (byKind[v.kind] || 0) + 1;
console.log('[movement-actions]', {
  total: Object.keys(out).length,
  by_kind: byKind,
  unknown_sample: Object.entries(out).filter(([_, v]) => v.kind === 'unknown').slice(0, 10).map(([k]) => k),
  output: outPath,
});

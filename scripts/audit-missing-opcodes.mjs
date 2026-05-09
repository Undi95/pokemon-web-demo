#!/usr/bin/env node
// Audit : list opcodes used by extracted scripts that are NOT registered
// in src/engine/script-opcodes.ts. Sort by frequency desc.
//
// Usage : node scripts/audit-missing-opcodes.mjs
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
const OPCODES_FILE = 'src/engine/script-opcodes.ts';

// 1. Tally all opcodes used in script JSON files
const counts = new Map();
const files = readdirSync(SCRIPTS_DIR);
for (const f of files) {
  if (!f.endsWith('.json')) continue;
  try {
    const j = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    if (!j.scripts) continue;
    for (const [_name, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const op = line.split(/\s+/)[0];
        if (op) counts.set(op, (counts.get(op) || 0) + 1);
      }
    }
  } catch {}
}

// 2. List registered opcodes
const opSrc = readFileSync(OPCODES_FILE, 'utf8');
const re = /registerOpcode\(['"]([^'"]+)['"]/g;
const registered = new Set();
let m;
while ((m = re.exec(opSrc))) registered.add(m[1]);

// 3. Pseudo-ops that aren't real script opcodes (= movement actions, table entries, etc.)
const pseudoOps = new Set([
  'def_special', 'script_cmd_table_entry', 'map_script', 'map_script_2',
  'step_end', 'walk_up', 'walk_down', 'walk_left', 'walk_right',
  'walk_fast_up', 'walk_fast_down', 'walk_fast_left', 'walk_fast_right',
  'walk_faster_up', 'walk_faster_down', 'walk_faster_left', 'walk_faster_right',
  'walk_slow_up', 'walk_slow_down', 'walk_slow_left', 'walk_slow_right',
  'walk_slowest_up', 'walk_slowest_down', 'walk_slowest_left', 'walk_slowest_right',
  'face_up', 'face_down', 'face_left', 'face_right', 'face_player',
  'walk_in_place_up', 'walk_in_place_down', 'walk_in_place_left', 'walk_in_place_right',
  'walk_in_place_faster_up', 'walk_in_place_faster_down',
  'walk_in_place_faster_left', 'walk_in_place_faster_right',
  'walk_in_place_fast_up', 'walk_in_place_fast_down',
  'walk_in_place_fast_left', 'walk_in_place_fast_right',
  'walk_in_place_normal_up', 'walk_in_place_normal_down',
  'walk_in_place_normal_left', 'walk_in_place_normal_right',
  'walk_in_place_slow_up', 'walk_in_place_slow_down',
  'walk_in_place_slow_left', 'walk_in_place_slow_right',
  'walk_in_place_slowest_up', 'walk_in_place_slowest_down',
  'walk_in_place_slowest_left', 'walk_in_place_slowest_right',
  'jump_2_up', 'jump_2_down', 'jump_2_left', 'jump_2_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_up_down', 'jump_in_place_down_up',
  'jump_in_place_left_right', 'jump_in_place_right_left',
  'delay_1', 'delay_2', 'delay_4', 'delay_8', 'delay_16',
  'lock_facing_direction', 'unlock_facing_direction',
  'set_invisible', 'set_visible', 'emote_exclamation_mark', 'emote_question_mark', 'emote_x', 'emote_double_exclamation_mark', 'emote_smile', 'emote_heart',
  'fly_up', 'fly_down', 'lunge_up', 'lunge_down',
  'set_my_state', 'spin_pal', 'lock_anim',
  'walk_left_affine', 'walk_right_affine',
  'fly_up_2', 'fly_down_2',
  'walk_run_down', 'walk_run_up', 'walk_run_left', 'walk_run_right',
]);
// Also pseudo : anything starting with "create_" or "if_" used as condition
// in event scripts and 'if_random_less_than' etc.
const isPseudo = (op) => pseudoOps.has(op) ||
  op.startsWith('createsprite') || op.startsWith('createvisualtask') ||
  op.startsWith('createvobject') ||
  op.startsWith('clearmonbg') || op.startsWith('monbg') ||
  op.startsWith('setalpha') || op.startsWith('blendcolor') ||
  op.startsWith('if_effect') || op.startsWith('if_random') ||
  op.startsWith('animation_started') ||
  op.startsWith('create_basic') ||
  op.startsWith('printstring') || op.startsWith('score');

// 4. Compute missing
const missing = [];
for (const [op, n] of counts.entries()) {
  if (registered.has(op)) continue;
  if (isPseudo(op)) continue;
  missing.push([op, n]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log('=== Missing script opcodes (most-used first) ===');
console.log(`Total registered : ${registered.size}`);
console.log(`Total used in scripts : ${counts.size}`);
console.log(`Missing real opcodes : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 80)) {
  console.log(`  ${n.toString().padStart(6)}  ${op}`);
}

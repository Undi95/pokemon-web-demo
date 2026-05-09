#!/usr/bin/env node
// Audit : list opcodes used by the EARLY-GAME scripts (= LittlerootTown,
// ProfessorBirchsLab, BrendansHouse, MaysHouse, Route 101-103).
// These are the scripts the user will actually hit first.

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
const OPCODES_FILE = 'src/engine/script-opcodes.ts';

const EARLY_GAME = [
  'LittlerootTown',
  'LittlerootTown_BrendansHouse_1F',
  'LittlerootTown_BrendansHouse_2F',
  'LittlerootTown_MaysHouse_1F',
  'LittlerootTown_MaysHouse_2F',
  'LittlerootTown_ProfessorBirchsLab',
  'OldaleTown',
  'OldaleTown_PokemonCenter_1F',
  'OldaleTown_PokemonCenter_2F',
  'OldaleTown_Mart',
  'PetalburgCity',
  'PetalburgCity_Gym',
  'PetalburgCity_Mart',
  'PetalburgCity_PokemonCenter_1F',
  'PetalburgCity_PokemonCenter_2F',
  'Route101',
  'Route102',
  'Route103',
  'Route104',
  'PetalburgWoods',
];

const counts = new Map();
for (const name of EARLY_GAME) {
  const f = join(SCRIPTS_DIR, name + '.json');
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    if (!j.scripts) continue;
    for (const [_n, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const op = line.split(/\s+/)[0];
        if (op) counts.set(op, (counts.get(op) || 0) + 1);
      }
    }
  } catch (e) {
    console.error('skip', name, e.message);
  }
}

const opSrc = readFileSync(OPCODES_FILE, 'utf8');
const re = /registerOpcode\(['"]([^'"]+)['"]/g;
const registered = new Set();
let m;
while ((m = re.exec(opSrc))) registered.add(m[1]);

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
  'jump_up', 'jump_down', 'jump_left', 'jump_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_up_down', 'jump_in_place_down_up',
  'jump_in_place_left_right', 'jump_in_place_right_left',
  'delay_1', 'delay_2', 'delay_4', 'delay_8', 'delay_16',
  'lock_facing_direction', 'unlock_facing_direction',
  'set_invisible', 'set_visible', 'emote_exclamation_mark', 'emote_question_mark',
  'emote_x', 'emote_double_exclamation_mark', 'emote_smile', 'emote_heart',
  'set_my_state',
  'walk_left_affine', 'walk_right_affine',
]);

const isPseudo = (op) => pseudoOps.has(op) ||
  op.startsWith('createsprite') || op.startsWith('createvisualtask') ||
  op.startsWith('createvobject');

const missing = [];
for (const [op, n] of counts.entries()) {
  if (registered.has(op)) continue;
  if (isPseudo(op)) continue;
  missing.push([op, n]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`=== Missing opcodes in EARLY-GAME (${EARLY_GAME.length} maps) ===`);
console.log(`Registered : ${registered.size} | Used : ${counts.size} | Missing : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 50)) {
  console.log(`  ${n.toString().padStart(4)}  ${op}`);
}

#!/usr/bin/env node
/** Find opcodes used in map scripts but not registered in script-opcodes.ts. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Collect used opcodes from extracted MAP scripts only (= per-map JSON files,
//    skip _common.json + _all.json which contain battle scripts mixed in).
const usedDir = 'public/decomp/em/scripts';
const used = new Map();
for (const f of readdirSync(usedDir)) {
  if (!f.endsWith('.json')) continue;
  // Skip aggregated common/all (= contiennent battle script opcodes mélangés
  // qui ne doivent pas tourner sur le map runtime).
  if (f === '_common.json' || f === '_all.json') continue;
  try {
    const data = JSON.parse(readFileSync(join(usedDir, f), 'utf8'));
    for (const lines of Object.values(data.scripts ?? {})) {
      for (const line of lines) {
        const m = String(line).trim().match(/^(\w+)/);
        if (m) used.set(m[1], (used.get(m[1]) ?? 0) + 1);
      }
    }
  } catch {}
}

// 2. Collect registered opcodes from script-opcodes.ts.
const registered = new Set();
const src = readFileSync('src/engine/script-opcodes.ts', 'utf8');
const re = /registerOpcode\('([^']+)'/g;
let m;
while ((m = re.exec(src)) !== null) registered.add(m[1]);

// 3. Filter common keywords that aren't opcodes (= movement actions, battle anim, std movement).
const movementActions = new Set([
  'walk_up','walk_down','walk_left','walk_right','step_end',
  'walk_fast_up','walk_fast_down','walk_fast_left','walk_fast_right',
  'walk_faster_up','walk_faster_down','walk_faster_left','walk_faster_right',
  'walk_fastest_up','walk_fastest_down','walk_fastest_left','walk_fastest_right',
  'walk_in_place_normal_up','walk_in_place_normal_down','walk_in_place_normal_left','walk_in_place_normal_right',
  'walk_in_place_fast_up','walk_in_place_fast_down','walk_in_place_fast_left','walk_in_place_fast_right',
  'walk_in_place_faster_up','walk_in_place_faster_down','walk_in_place_faster_left','walk_in_place_faster_right',
  'walk_in_place_slow_up','walk_in_place_slow_down','walk_in_place_slow_left','walk_in_place_slow_right',
  'face_up','face_down','face_left','face_right',
  'jump_in_place_up','jump_in_place_down','jump_in_place_left','jump_in_place_right',
  'jump_up','jump_down','jump_left','jump_right',
  'jump2_up','jump2_down','jump2_left','jump2_right',
  'slide_up','slide_down','slide_left','slide_right',
  'delay_1','delay_2','delay_4','delay_8','delay_16',
  'lock_facing_direction','unlock_facing_direction',
  'set_invisible','set_visible','disable_jump_landing_ground_effect','enable_jump_landing_ground_effect',
  'face_player','face_away_player',
  'jump_in_place_up_down','jump_in_place_down_up','jump_in_place_left_right','jump_in_place_right_left',
  'fly_up','fly_down','exit_pokeball','enter_pokeball','figure_8',
  'emote_question_mark','emote_exclamation_mark','emote_x','emote_double_exclamation_mark','emote_smile',
  'shake_head_or_walk_in_place','sleep_long_lay_down','sleep_long_floor_face_down',
]);
const battleScript = new Set([
  'case','if_effect','score','frontier_set','def_special','createsprite','createvisualtask',
  'waitforvisualfinish','loadspritegfx','clearmonbg','monbg','setalpha','blendoff',
  'create_basic_hitsplat_sprite','if_random_less_than','printstring','waitse','playse',
  'switch','printfromtable','playsewithpan',
]);
const mapScriptTags = new Set(['map_script','map_script_2','script_cmd_table_entry']);

// Skip movement actions and battle script commands.
const missing = [];
for (const [op, count] of used) {
  if (registered.has(op)) continue;
  if (movementActions.has(op)) continue;
  if (battleScript.has(op)) continue;
  if (mapScriptTags.has(op)) continue;
  if (op.startsWith('walk_') || op.startsWith('face_') || op.startsWith('jump_') ||
      op.startsWith('emote_') || op.startsWith('delay_')) continue;
  missing.push([op, count]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`Total used: ${used.size}, registered: ${registered.size}, missing: ${missing.length}`);
console.log('\nTop missing (by usage):');
for (const [op, n] of missing.slice(0, 50)) {
  console.log(`${n}\t${op}`);
}

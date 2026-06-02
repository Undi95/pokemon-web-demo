#!/usr/bin/env node
// Full main-story audit (= up to Hall of Fame, no post-game / battle frontier)
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
// Les opcodes OW sont enregistrés via registerOpcode() dans les fichiers
// src/engine/script/script-opcodes*.ts (le monolithe src/engine/script-opcodes.ts
// a été éclaté dans le dossier script/ lors d'un refactor — fix du chemin cassé).
const OPCODES_DIR = 'src/engine/script';

// Anything in scripts/ except the explicitly post-game ones
const POSTGAME_PATTERNS = [
  /^BattleFrontier/,
  /^Battle(?:Pyramid|Pike|Tower|Dome|Arena|Factory|Palace)/,
  /^TrainerHill/,
  /^MossdeepCity_(SpaceCenter|Steven)/,
  /^MtChimney/,
  /^MagmaHideout/,
  /^AquaHideout/,
  /^SkyPillar/,
  /^Sootopolis/,
  /^EverGrandeCity/,
  /^EliteFour/,
  /^PokemonLeague/,
  /^HallOfFame/,
  /^SealedChamber/,
  /^DesertRuins/,
  /^MarineCave/,
  /^TerraCave/,
  /^IslandCave/,
  /^AncientTomb/,
  /^MirageTower/,
  /^SafariZone/,
  /^Underwater/,
  /^Mossdeep/,
  /^Pacifidlog/,
  /^MtPyre/,
  /^ShoalCave/,
  /^SeafloorCavern/,
  /^FortreeCity/,
  /^LilycoveCity/,
  /^Slateport/,
  /^MauvilleCity_GameCorner/,
  /^MauvilleCity_/,
  /^MauvilleCity\.json/,
  /^VerdanturfTown/,
  /^FallarborTown/,
  /^Route1[1-9][0-9]/,  // Route 110+
  /^Route1[1-9][a-z]/,
  /^Route2[0-9]/,
  /^Route1[0-9][0-9]/,
  /^DewfordTown/,
  /^Faraway/,
  /^BirthIsland/,
  /^NavelRock/,
  /^SouthernIsland/,
  /^NewMauville/,
  /^InsideOfTruck/, // post-truck only
  /^MeteorFalls/,
  /^GraniteCave/,
  /^JaggedPass/,
  /^FieryPath/,
  /^Cycling/,
  /^InsideShip/,
  /^AbandonedShip/,
  /^ArtisanCave/,
];

const isPostGame = (name) => POSTGAME_PATTERNS.some(p => p.test(name));

// Exclude bundled common scripts that contain battle scripts (= different
// dispatcher). Only field scripts go through script-runtime.ts.
const EXCLUDED_BATTLE_BUNDLES = new Set(['_all', '_common', 'battle_anim_scripts']);

const counts = new Map();
const files = readdirSync(SCRIPTS_DIR);
let mapsScanned = 0;
for (const f of files) {
  if (!f.endsWith('.json')) continue;
  const name = f.replace(/\.json$/, '');
  if (isPostGame(name)) continue;
  if (EXCLUDED_BATTLE_BUNDLES.has(name)) continue;
  mapsScanned++;
  try {
    const j = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    if (!j.scripts) continue;
    for (const [_n, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const op = line.split(/\s+/)[0];
        if (op) counts.set(op, (counts.get(op) || 0) + 1);
      }
    }
  } catch {}
}

let opSrc = '';
for (const f of readdirSync(OPCODES_DIR)) {
  if (f.endsWith('.ts')) opSrc += readFileSync(join(OPCODES_DIR, f), 'utf8') + '\n';
}
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
  'disable_jump_landing_ground_effect',
  'lunge_up', 'lunge_down', 'lunge_left', 'lunge_right',
  'spin_pal',
  'fly_up', 'fly_down',
  'walk_slow_diag_northeast', 'walk_slow_diag_northwest',
  'walk_slow_diag_southeast', 'walk_slow_diag_southwest',
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

console.log(`=== Missing opcodes in MAIN-STORY (${mapsScanned} maps, post-game excluded) ===`);
console.log(`Registered : ${registered.size} | Used : ${counts.size} | Missing : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 30)) {
  console.log(`  ${n.toString().padStart(4)}  ${op}`);
}

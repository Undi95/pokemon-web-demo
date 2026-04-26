// AUTO-GENERATED from include/battle_transition.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_transition.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MUGSHOT_0 = {
  MUGSHOT_SIDNEY: 0,
  MUGSHOT_PHOEBE: 1,
  MUGSHOT_GLACIA: 2,
  MUGSHOT_DRAKE: 3,
  MUGSHOT_CHAMPION: 4,
  MUGSHOTS_COUNT: 5,
} as const;
export const ENUM_B_1 = {
  B_TRANSITION_BLUR: 0,
  B_TRANSITION_SWIRL: 1,
  B_TRANSITION_SHUFFLE: 2,
  B_TRANSITION_BIG_POKEBALL: 3,
  B_TRANSITION_POKEBALLS_TRAIL: 4,
  B_TRANSITION_CLOCKWISE_WIPE: 5,
  B_TRANSITION_RIPPLE: 6,
  B_TRANSITION_WAVE: 7,
  B_TRANSITION_SLICE: 8,
  B_TRANSITION_WHITE_BARS_FADE: 9,
  B_TRANSITION_GRID_SQUARES: 10,
  B_TRANSITION_ANGLED_WIPES: 11,
  B_TRANSITION_SIDNEY: 12,
  B_TRANSITION_PHOEBE: 13,
  B_TRANSITION_GLACIA: 14,
  B_TRANSITION_DRAKE: 15,
  B_TRANSITION_CHAMPION: 16,
  B_TRANSITION_AQUA: 17,
  B_TRANSITION_MAGMA: 18,
  B_TRANSITION_REGICE: 19,
  B_TRANSITION_REGISTEEL: 20,
  B_TRANSITION_REGIROCK: 21,
  B_TRANSITION_KYOGRE: 22,
  B_TRANSITION_GROUDON: 23,
  B_TRANSITION_RAYQUAZA: 24,
  B_TRANSITION_SHRED_SPLIT: 25,
  B_TRANSITION_BLACKHOLE: 26,
  B_TRANSITION_BLACKHOLE_PULSATE: 27,
  B_TRANSITION_RECTANGULAR_SPIRAL: 28,
  B_TRANSITION_FRONTIER_LOGO_WIGGLE: 29,
  B_TRANSITION_FRONTIER_LOGO_WAVE: 30,
  B_TRANSITION_FRONTIER_SQUARES: 31,
  B_TRANSITION_FRONTIER_SQUARES_SCROLL: 32,
  B_TRANSITION_FRONTIER_SQUARES_SPIRAL: 33,
  B_TRANSITION_FRONTIER_CIRCLES_MEET: 34,
  B_TRANSITION_FRONTIER_CIRCLES_CROSS: 35,
  B_TRANSITION_FRONTIER_CIRCLES_ASYMMETRIC_SPIRAL: 36,
  B_TRANSITION_FRONTIER_CIRCLES_SYMMETRIC_SPIRAL: 37,
  B_TRANSITION_FRONTIER_CIRCLES_MEET_IN_SEQ: 38,
  B_TRANSITION_FRONTIER_CIRCLES_CROSS_IN_SEQ: 39,
  B_TRANSITION_FRONTIER_CIRCLES_ASYMMETRIC_SPIRAL_IN_SEQ: 40,
  B_TRANSITION_FRONTIER_CIRCLES_SYMMETRIC_SPIRAL_IN_SEQ: 41,
  B_TRANSITION_COUNT: 42,
} as const;
export const ENUM_B_2 = {
  B_TRANSITION_GROUP_B_TOWER: 0,
  B_TRANSITION_GROUP_B_DOME: 3,
  B_TRANSITION_GROUP_B_PALACE: 4,
  B_TRANSITION_GROUP_B_ARENA: 5,
  B_TRANSITION_GROUP_B_FACTORY: 6,
  B_TRANSITION_GROUP_B_PIKE: 7,
  B_TRANSITION_GROUP_B_PYRAMID: 10,
  B_TRANSITION_GROUP_TRAINER_HILL: 11,
  B_TRANSITION_GROUP_SECRET_BASE: 12,
  B_TRANSITION_GROUP_E_READER: 13,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BattleTransition_StartOnField', ret: "void", arity: 1, params: "u8 transitionId" },
  { name: 'BattleTransition_Start', ret: "void", arity: 1, params: "u8 transitionId" },
  { name: 'IsBattleTransitionDone', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_PokeballTrail', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_BattleTransition_Intro', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetBg0TilesDst', ret: "void", arity: 2, params: "u16 **tilemap, u16 **tileset" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BattleTransition_Intro',
] as const;

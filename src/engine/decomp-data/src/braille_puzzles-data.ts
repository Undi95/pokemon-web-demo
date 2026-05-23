// AUTO-GENERATED from src/braille_puzzles.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/braille_puzzles.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[1]` */
export const tDelayCounter_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tShakeCounter_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tVerticalPan_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tDelay_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tNumShakes_EXPR = "data[6]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sIsRegisteelPuzzle', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_SealedChamberShakingEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'DoBrailleRegirockEffect', ret: "void", arity: 0, params: "void" },
  { name: 'DoBrailleRegisteelEffect', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleDigEffect', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoBrailleDigEffect', ret: "void", arity: 0, params: "void" },
  { name: 'CheckRelicanthWailord', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleRegirockEffectOld', ret: "void", arity: 0, params: "void" },
  { name: 'DoSealedChamberShakingEffect_Long', ret: "void", arity: 0, params: "void" },
  { name: 'DoSealedChamberShakingEffect_Short', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleRegirockEffect', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpPuzzleEffectRegirock', ret: "void", arity: 0, params: "void" },
  { name: 'UseRegirockHm_Callback', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleRegisteelEffect', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpPuzzleEffectRegisteel', ret: "void", arity: 0, params: "void" },
  { name: 'UseRegisteelHm_Callback', ret: "void", arity: 0, params: "void" },
  { name: 'DoBrailleWait', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'FldEff_UsePuzzleEffect', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleRegicePuzzle', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_SealedChamberShakingEffect',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'field_camera.h',
  'field_effect.h',
  'script.h',
  'sound.h',
  'task.h',
  'constants/field_effects.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
  'fieldmap.h',
  'party_menu.h',
  'fldeff.h',
] as const;

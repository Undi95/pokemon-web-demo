// AUTO-GENERATED from src/battle_anim_sound_tasks.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_sound_tasks.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[1]` */
export const tSpecies_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPan_EXPR = "data[2]";
/** Raw expr: `data[9]` */
export const tState_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tLastCry_EXPR = "data[10]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SoundTask_FireBlast_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_FireBlast_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_LoopSEAdjustPanning_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlayDoubleCry_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlayCryWithEcho_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_AdjustPanningVar_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_FireBlast', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_LoopSEAdjustPanning', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlayCryHighPitch', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyAnimVisualTask', ret: "else", arity: 1, params: "taskId" },
  { name: 'SoundTask_PlayDoubleCry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlayCry_ByMode', ret: "else", arity: 3, params: "species, pan, CRY_MODE_ROAR_1" },
  { name: 'SoundTask_WaitForCry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlayCryWithEcho', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlaySE1WithPanning', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_PlaySE2WithPanning', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SoundTask_AdjustPanningVar', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'contest.h',
  'sound.h',
  'task.h',
  'constants/battle_anim.h',
] as const;

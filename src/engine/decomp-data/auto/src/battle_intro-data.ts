// AUTO-GENERATED from src/battle_intro.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_intro.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tEnvironment_EXPR = "data[1]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sBgCnt', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BattleIntroSlide1', ret: "void", arity: 1, params: "u8" },
  { name: 'BattleIntroSlide2', ret: "void", arity: 1, params: "u8" },
  { name: 'BattleIntroSlide3', ret: "void", arity: 1, params: "u8" },
  { name: 'BattleIntroSlideLink', ret: "void", arity: 1, params: "u8" },
  { name: 'BattleIntroSlidePartner', ret: "void", arity: 1, params: "u8" },
  { name: 'SetAnimBgAttribute', ret: "void", arity: 3, params: "u8 bgId, u8 attributeId, u8 value" },
  { name: 'GetAnimBgAttribute', ret: "int", arity: 2, params: "u8 bgId, u8 attributeId" },
  { name: 'HandleIntroSlide', ret: "void", arity: 1, params: "u8 environment" },
  { name: 'BattleIntroSlideEnd', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DrawBattlerOnBg', ret: "void", arity: 8, params: "int bgId, u8 x, u8 y, u8 battlerPosition, u8 paletteId, u8 *tiles, u16 *tilemap, u16 tilesOffset" },
  { name: 'DrawBattlerOnBgDMA', ret: "UNUSED", arity: 8, params: "u8 x, u8 y, u8 battlerPosition, u8 arg3, u8 paletteId, u16 arg5, u8 arg6, u8 arg7" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_main.h',
  'battle_setup.h',
  'bg.h',
  'gpu_regs.h',
  'main.h',
  'scanline_effect.h',
  'task.h',
  'trig.h',
  'constants/trainers.h',
] as const;

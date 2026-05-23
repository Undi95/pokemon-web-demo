// AUTO-GENERATED from include/global.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/global.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `asm("")` */
export const BLOCK_CROSS_JUMP_EXPR = "asm(\"\")";
/** Raw expr: `__attribute__((naked))` */
export const NAKED_EXPR = "__attribute__((naked))";
/** Raw expr: `__asm__` */
export const asm_EXPR = "__asm__";
/** Raw expr: `INCBIN` */
export const INCBIN_U8_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCBIN_U16_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCBIN_U32_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCBIN_S8_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCBIN_S16_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCBIN_S32_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_U8_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_U16_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_U32_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_S8_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_S16_EXPR = "INCBIN";
/** Raw expr: `INCBIN` */
export const INCGFX_S32_EXPR = "INCBIN";
/** Raw expr: `ROUND_BITS_TO_BYTES(NUM_SPECIES)` */
export const NUM_DEX_FLAG_BYTES_EXPR = "ROUND_BITS_TO_BYTES(NUM_SPECIES)";
/** Raw expr: `ROUND_BITS_TO_BYTES(FLAGS_COUNT)` */
export const NUM_FLAG_BYTES_EXPR = "ROUND_BITS_TO_BYTES(FLAGS_COUNT)";
/** Raw expr: `ROUND_BITS_TO_BYTES(NUM_TRENDY_SAYINGS)` */
export const NUM_TRENDY_SAYING_BYTES_EXPR = "ROUND_BITS_TO_BYTES(NUM_TRENDY_SAYINGS)";
export const DOME_TOURNAMENT_TRAINERS_COUNT = 16;
export const BATTLE_TOWER_RECORD_COUNT = 5;
export const LINK_B_RECORDS_COUNT = 5;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'asm', ret: "BLOCK_CROSS_JUMP", arity: 1, params: "\"\"" },
  { name: '_', ret: "define", arity: 1, params: "x" },
  { name: '__', ret: "define", arity: 1, params: "x" },
  { name: 'INCBIN', ret: "define", arity: 1, params: "..." },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'string.h',
  'limits.h',
  'config.h',
  'gba/gba.h',
  'gametypes.h',
  'constants/global.h',
  'constants/flags.h',
  'constants/vars.h',
  'constants/species.h',
  'constants/pokedex.h',
  'constants/berry.h',
  'constants/maps.h',
  'constants/pokemon.h',
  'constants/easy_chat.h',
  'constants/trainer_hill.h',
  'constants/game_stat.h',
  'global.fieldmap.h',
  'global.berry.h',
  'global.tv.h',
  'pokemon.h',
] as const;

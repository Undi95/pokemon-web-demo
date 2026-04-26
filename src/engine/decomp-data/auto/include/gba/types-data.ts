// AUTO-GENERATED from include/gba/types.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/types.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ST_OAM_HFLIP = 8;
export const ST_OAM_VFLIP = 16;
export const ST_OAM_MNUM_FLIP_MASK = 24;
export const ST_OAM_OBJ_NORMAL = 0;
export const ST_OAM_OBJ_BLEND = 1;
export const ST_OAM_OBJ_WINDOW = 2;
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const ST_OAM_AFFINE_ERASE = 2;
export const ST_OAM_AFFINE_DOUBLE = 3;
export const ST_OAM_AFFINE_ON_MASK = 1;
export const ST_OAM_AFFINE_DOUBLE_MASK = 2;
export const ST_OAM_4BPP = 0;
export const ST_OAM_8BPP = 1;
export const ST_OAM_SQUARE = 0;
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;
export const ST_OAM_SIZE_0 = 0;
export const ST_OAM_SIZE_1 = 1;
export const ST_OAM_SIZE_2 = 2;
export const ST_OAM_SIZE_3 = 3;
/** Raw expr: `((ST_OAM_SIZE_0 << 2) | (ST_OAM_SQUARE))` */
export const SPRITE_SIZE_8x8_EXPR = "((ST_OAM_SIZE_0 << 2) | (ST_OAM_SQUARE))";
/** Raw expr: `((ST_OAM_SIZE_1 << 2) | (ST_OAM_SQUARE))` */
export const SPRITE_SIZE_16x16_EXPR = "((ST_OAM_SIZE_1 << 2) | (ST_OAM_SQUARE))";
/** Raw expr: `((ST_OAM_SIZE_2 << 2) | (ST_OAM_SQUARE))` */
export const SPRITE_SIZE_32x32_EXPR = "((ST_OAM_SIZE_2 << 2) | (ST_OAM_SQUARE))";
/** Raw expr: `((ST_OAM_SIZE_3 << 2) | (ST_OAM_SQUARE))` */
export const SPRITE_SIZE_64x64_EXPR = "((ST_OAM_SIZE_3 << 2) | (ST_OAM_SQUARE))";
/** Raw expr: `((ST_OAM_SIZE_0 << 2) | (ST_OAM_H_RECTANGLE))` */
export const SPRITE_SIZE_16x8_EXPR = "((ST_OAM_SIZE_0 << 2) | (ST_OAM_H_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_1 << 2) | (ST_OAM_H_RECTANGLE))` */
export const SPRITE_SIZE_32x8_EXPR = "((ST_OAM_SIZE_1 << 2) | (ST_OAM_H_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_2 << 2) | (ST_OAM_H_RECTANGLE))` */
export const SPRITE_SIZE_32x16_EXPR = "((ST_OAM_SIZE_2 << 2) | (ST_OAM_H_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_3 << 2) | (ST_OAM_H_RECTANGLE))` */
export const SPRITE_SIZE_64x32_EXPR = "((ST_OAM_SIZE_3 << 2) | (ST_OAM_H_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_0 << 2) | (ST_OAM_V_RECTANGLE))` */
export const SPRITE_SIZE_8x16_EXPR = "((ST_OAM_SIZE_0 << 2) | (ST_OAM_V_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_1 << 2) | (ST_OAM_V_RECTANGLE))` */
export const SPRITE_SIZE_8x32_EXPR = "((ST_OAM_SIZE_1 << 2) | (ST_OAM_V_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_2 << 2) | (ST_OAM_V_RECTANGLE))` */
export const SPRITE_SIZE_16x32_EXPR = "((ST_OAM_SIZE_2 << 2) | (ST_OAM_V_RECTANGLE))";
/** Raw expr: `((ST_OAM_SIZE_3 << 2) | (ST_OAM_V_RECTANGLE))` */
export const SPRITE_SIZE_32x64_EXPR = "((ST_OAM_SIZE_3 << 2) | (ST_OAM_V_RECTANGLE))";
export const ST_SIO_MULTI_MODE = 2;
export const ST_SIO_9600_BPS = 0;
export const ST_SIO_38400_BPS = 1;
export const ST_SIO_57600_BPS = 2;
export const ST_SIO_115200_BPS = 3;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'stdint.h',
] as const;

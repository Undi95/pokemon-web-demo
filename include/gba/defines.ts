// AUTO-GENERATED from include/gba/defines.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/defines.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TRUE = 1;
export const FALSE = 0;
/** Raw expr: `__attribute__((section("iwram_data")))` */
export const IWRAM_DATA_EXPR = "__attribute__((section(\"iwram_data\")))";
/** Raw expr: `__attribute__((section("ewram_data")))` */
export const EWRAM_DATA_EXPR = "__attribute__((section(\"ewram_data\")))";
/** Raw expr: `__attribute__((section("common_data")))` */
export const COMMON_DATA_EXPR = "__attribute__((section(\"common_data\")))";
/** Raw expr: `__attribute__((unused))` */
export const UNUSED_EXPR = "__attribute__((unused))";
/** Raw expr: `__attribute__((noinline))` */
export const NOINLINE_EXPR = "__attribute__((noinline))";
/** Raw expr: `(*(struct SoundInfo **)0x3007FF0)` */
export const SOUND_INFO_PTR_EXPR = "(*(struct SoundInfo **)0x3007FF0)";
/** Raw expr: `(*(u16 *)0x3007FF8)` */
export const INTR_CHECK_EXPR = "(*(u16 *)0x3007FF8)";
/** Raw expr: `(*(void **)0x3007FFC)` */
export const INTR_VECTOR_EXPR = "(*(void **)0x3007FFC)";
export const EWRAM_START = 33554432;
/** Raw expr: `(EWRAM_START + 0x40000)` */
export const EWRAM_END_EXPR = "(EWRAM_START + 0x40000)";
export const IWRAM_START = 50331648;
/** Raw expr: `(IWRAM_START + 0x8000)` */
export const IWRAM_END_EXPR = "(IWRAM_START + 0x8000)";
export const PLTT = 83886080;
/** Raw expr: `PLTT` */
export const BG_PLTT_EXPR = "PLTT";
export const BG_PLTT_SIZE = 512;
/** Raw expr: `(PLTT + BG_PLTT_SIZE)` */
export const OBJ_PLTT_EXPR = "(PLTT + BG_PLTT_SIZE)";
export const OBJ_PLTT_SIZE = 512;
/** Raw expr: `(BG_PLTT_SIZE + OBJ_PLTT_SIZE)` */
export const PLTT_SIZE_EXPR = "(BG_PLTT_SIZE + OBJ_PLTT_SIZE)";
export const VRAM = 100663296;
export const VRAM_SIZE = 98304;
/** Raw expr: `VRAM` */
export const BG_VRAM_EXPR = "VRAM";
export const BG_VRAM_SIZE = 65536;
export const BG_CHAR_SIZE = 16384;
export const BG_SCREEN_SIZE = 2048;
export const NUM_BACKGROUNDS = 4;
/** Raw expr: `(VRAM + 0x10000)` */
export const OBJ_VRAM0_EXPR = "(VRAM + 0x10000)";
export const OBJ_VRAM0_SIZE = 32768;
/** Raw expr: `(VRAM + 0x14000)` */
export const OBJ_VRAM1_EXPR = "(VRAM + 0x14000)";
export const OBJ_VRAM1_SIZE = 16384;
export const OAM = 117440512;
export const OAM_SIZE = 1024;
export const ROM_HEADER_SIZE = 192;
export const TILE_WIDTH = 8;
export const TILE_HEIGHT = 8;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
/** Raw expr: `(DISPLAY_WIDTH / TILE_WIDTH)` */
export const DISPLAY_TILE_WIDTH_EXPR = "(DISPLAY_WIDTH / TILE_WIDTH)";
/** Raw expr: `(DISPLAY_HEIGHT / TILE_HEIGHT)` */
export const DISPLAY_TILE_HEIGHT_EXPR = "(DISPLAY_HEIGHT / TILE_HEIGHT)";
/** Raw expr: `TILE_SIZE(1)` */
export const TILE_SIZE_1BPP_EXPR = "TILE_SIZE(1)";
/** Raw expr: `TILE_SIZE(4)` */
export const TILE_SIZE_4BPP_EXPR = "TILE_SIZE(4)";
/** Raw expr: `TILE_SIZE(8)` */
export const TILE_SIZE_8BPP_EXPR = "TILE_SIZE(8)";
export const TOTAL_OBJ_TILE_COUNT = 1024;
/** Raw expr: `PLTT_SIZEOF(16)` */
export const PLTT_SIZE_4BPP_EXPR = "PLTT_SIZEOF(16)";
/** Raw expr: `PLTT_SIZEOF(256)` */
export const PLTT_SIZE_8BPP_EXPR = "PLTT_SIZEOF(256)";

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'stddef.h',
] as const;

// ─── RGB macros 1:1 (gba/defines.h) — ajout unification (hotfix TDZ mail.ts) ──
// Leaf PUR (zéro import) : les tables top-level (sMailGraphics…) peuvent lire
// ces constantes quel que soit l'ordre d'éval ESM — decomp-helpers (harness,
// importe decomp-globals) les RÉ-EXPORTE pour ses importeurs historiques.
/** 1:1 décomp `RGB(r, g, b)` = r | g<<5 | b<<10. */
export function RGB(r: number, g: number, b: number): number {
  return (r | (g << 5) | (b << 10)) & 0xFFFF;
}
export const RGB_BLACK = 0;
export const RGB_WHITE = 0x7FFF;
export const RGB_WHITEALPHA = 0xFFFF;
/** 1:1 décomp `PLTT_SIZE_4BPP` = PLTT_SIZEOF(16) = 32 bytes. */
export const PLTT_SIZE_4BPP = 32;

// AUTO-GENERATED from src/save_failed_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/save_failed_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MSG_WIN_TOP = 12;
/** Raw expr: `(MSG_WIN_TOP - 4)` */
export const CLOCK_WIN_TOP_EXPR = "(MSG_WIN_TOP - 4)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CLOCK_0 = {
  CLOCK_RUNNING: 0,
  DEBUG_TIMER: 1,
} as const;
export const ENUM_TEXT_1 = {
  TEXT_WIN_ID: 0,
  CLOCK_WIN_ID: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_Text = { bg: 0, tilemapLeft: 1, tilemapTop: 13, width: 28, height: 6, paletteNum: 15, baseBlock: 1 } as const;
export const sWindowTemplate_Clock = { bg: 0, tilemapLeft: 14, tilemapTop: 9, width: 2, height: 2, paletteNum: 15, baseBlock: 169 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sClockOamData = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sSaveFailedClockPal': { path: 'graphics/misc/clock_small.png', ext: '.gbapal', type: 'u8' },
  'sSaveFailedClockGfx': { path: 'graphics/misc/clock_small.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sSaveFailedType', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sClockInfo', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnused1', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sWindowIds', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnused2', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_SaveFailedScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_WipeSave', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GameplayCannotBeContinued', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_FadeAndReturnToTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_UpdateClockGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'VerifySectorWipe', ret: "bool8", arity: 1, params: "u16 sector" },
  { name: 'WipeSectors', ret: "bool8", arity: 1, params: "u32" },
  { name: 'SaveFailedScreenTextPrint', ret: "void", arity: 3, params: "const u8 *text, u8 x, u8 y" },
  { name: 'DoSaveFailedScreen', ret: "void", arity: 1, params: "u8 saveType" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'WipeSector', ret: "bool8", arity: 1, params: "u16 sector" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_FadeAndReturnToTitleScreen',
  'CB2_GameplayCannotBeContinued',
  'CB2_ReturnToTitleScreen',
  'CB2_SaveFailedScreen',
  'CB2_WipeSave',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'text.h',
  'main.h',
  'palette.h',
  'graphics.h',
  'gpu_regs.h',
  'bg.h',
  'decompress.h',
  'task.h',
  'window.h',
  'menu.h',
  'save.h',
  'starter_choose.h',
  'gba/flash_internal.h',
  'text_window.h',
  'constants/rgb.h',
] as const;

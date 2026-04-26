// AUTO-GENERATED from src/pokedex_cry_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokedex_cry_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MIN_NEEDLE_POS = 32;
export const MAX_NEEDLE_POS = -32;
export const NEEDLE_MOVE_INCREMENT = 5;
export const WAVEFORM_WINDOW_HEIGHT = 56;
export const TAG_NEEDLE = 8192;
/** Raw expr: `(position >> 3)` */
export const PLAY_START_POS_EXPR = "(position >> 3)";
/** Raw expr: `(position & ((1 << 3) - 1))` */
export const PLAYHEAD_POS_EXPR = "(position & ((1 << 3) - 1))";
/** Raw expr: `(position & 1)` */
export const VERT_SLICE_EXPR = "(position & 1)";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_CryMeterNeedle = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sCryMeterNeedleSpriteTemplate = { tileTag: "TAG_NEEDLE", paletteTag: "TAG_NEEDLE", oam: "&sOamData_CryMeterNeedle", anims: "sSpriteAnimTable_CryMeterNeedle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CryMeterNeedle" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCryMeterNeedle_Pal': { path: 'graphics/pokedex/cry_meter_needle.png', ext: '.gbapal', type: 'u16' },
  'sCryMeterNeedle_Gfx': { path: 'graphics/pokedex/cry_meter_needle.png', ext: '.4bpp', type: 'u8' },
  'sCryScreenBg_Pal': { path: 'graphics/pokedex/cry_screen_bg.png', ext: '.gbapal', type: 'u16' },
  'sCryScreenBg_Gfx': { path: 'graphics/pokedex/cry_screen_bg.png', ext: '.4bpp', type: 'u8' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'gCryMeter_Tilemap': { path: 'graphics/pokedex/cry_meter_map.bin', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sWaveformTileDataNybbleMasks: readonly number[] = [240,15] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u8", name: 'gDexCryScreenState', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PlayCryScreenCry', ret: "void", arity: 1, params: "u16" },
  { name: 'BufferCryWaveformSegment', ret: "void", arity: 0, params: "void" },
  { name: 'DrawWaveformFlatline', ret: "void", arity: 0, params: "void" },
  { name: 'AdvancePlayhead', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawWaveformSegment', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DrawWaveformWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ShiftWaveformOver', ret: "void", arity: 3, params: "u8, s16, bool8" },
  { name: 'SpriteCB_CryMeterNeedle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetCryMeterNeedleTarget', ret: "void", arity: 1, params: "s8" },
  { name: 'LoadCryWaveformWindow', ret: "bool8", arity: 2, params: "struct CryScreenWindow *window, u8 windowId" },
  { name: 'UpdateCryWaveformWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'CryScreenPlayButton', ret: "void", arity: 1, params: "u16 species" },
  { name: 'LoadCryMeter', ret: "bool8", arity: 2, params: "struct CryScreenWindow *window, u8 windowId" },
  { name: 'FreeCryScreen', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'graphics.h',
  'm4a.h',
  'main.h',
  'malloc.h',
  'palette.h',
  'pokedex_cry_screen.h',
  'sound.h',
  'trig.h',
  'window.h',
] as const;

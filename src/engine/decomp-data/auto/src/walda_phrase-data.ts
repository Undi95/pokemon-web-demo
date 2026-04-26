// AUTO-GENERATED from src/walda_phrase.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/walda_phrase.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BITS_PER_LETTER = 5;
/** Raw expr: `data[0]` */
export const BG_COLOR_LO_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const BG_COLOR_HI_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const FG_COLOR_LO_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const FG_COLOR_HI_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const ICON_ID_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const PATTERN_ID_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const TID_CHECK_HI_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const TID_CHECK_LO_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const KEY_EXPR = "data[8]";
export const NUM_WALLPAPER_DATA_BYTES = 9;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PHRASE_0 = {
  PHRASE_CHANGED: 0,
  PHRASE_NO_CHANGE: 1,
  PHRASE_EMPTY: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_HandleGivenWaldaPhrase', ret: "void", arity: 0, params: "void" },
  { name: 'GetWaldaPhraseInputCase', ret: "u32", arity: 1, params: "u8 *" },
  { name: 'TryCalculateWallpaper', ret: "bool32", arity: 6, params: "u16 *, u16 *, u8 *, u8 *, u16, u8 *" },
  { name: 'SetWallpaperDataFromLetter', ret: "void", arity: 5, params: "u8 *, u8 *, u32, u32, u32" },
  { name: 'GetWallpaperDataBits', ret: "u32", arity: 3, params: "u8 *, u32, u32" },
  { name: 'RotateWallpaperDataLeft', ret: "void", arity: 3, params: "u8 *, s32, s32" },
  { name: 'MaskWallpaperData', ret: "void", arity: 3, params: "u8 *, u32, u8" },
  { name: 'TryBufferWaldaPhrase', ret: "u16", arity: 0, params: "void" },
  { name: 'DoWaldaNamingScreen', ret: "void", arity: 0, params: "void" },
  { name: 'TryGetWallpaperWithWaldaPhrase', ret: "u16", arity: 0, params: "void" },
  { name: 'GetLetterTableId', ret: "u8", arity: 1, params: "u8 letter" },
  { name: 'GetWallpaperDataBit', ret: "bool8", arity: 2, params: "u8 *data, u32 bitNum" },
  { name: 'SetWallpaperDataBit', ret: "void", arity: 2, params: "u8 *data, u32 bitNum" },
  { name: 'ClearWallpaperDataBit', ret: "void", arity: 2, params: "u8 *data, u32 bitNum" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_HandleGivenWaldaPhrase',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'walda_phrase.h',
  'string_util.h',
  'event_data.h',
  'naming_screen.h',
  'main.h',
  'text.h',
  'new_game.h',
  'overworld.h',
  'pokemon_storage_system.h',
  'field_screen_effect.h',
] as const;

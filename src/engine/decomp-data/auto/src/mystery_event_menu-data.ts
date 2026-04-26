// AUTO-GENERATED from src/mystery_event_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_event_menu.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_MSG: 0,
  WIN_LOADING: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 4, tilemapTop: 15, width: 22, height: 4, paletteNum: 14, baseBlock: 20 },
  { bg: 0, tilemapLeft: 7, tilemapTop: 6, width: 16, height: 4, paletteNum: 14, baseBlock: 108 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnused', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_MysteryEventMenu', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMysteryMenuText', ret: "void", arity: 5, params: "u8 windowId, const u8 *text, u8 x, u8 y, s32 speed" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'CheckLanguageMatch', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_InitMysteryEventMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GetEventLoadMessage', ret: "bool8", arity: 2, params: "u8 *dest, u32 status" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitMysteryEventMenu',
  'CB2_MysteryEventMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'mystery_event_menu.h',
  'link.h',
  'main.h',
  'menu.h',
  'mystery_event_script.h',
  'palette.h',
  'save.h',
  'constants/songs.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'bg.h',
  'window.h',
  'gpu_regs.h',
  'text_window.h',
  'decompress.h',
  'constants/rgb.h',
] as const;

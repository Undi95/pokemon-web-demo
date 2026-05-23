// AUTO-GENERATED from src/berry_powder.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry_powder.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_BERRY_POWDER = 99999;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBerryPowderVendorWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DecryptBerryPowder', ret: "u32", arity: 1, params: "u32 *powder" },
  { name: 'SetBerryPowder', ret: "void", arity: 2, params: "u32 *powder, u32 amount" },
  { name: 'ApplyNewEncryptionKeyToBerryPowder', ret: "void", arity: 1, params: "u32 encryptionKey" },
  { name: 'HasEnoughBerryPowder_', ret: "bool8", arity: 1, params: "u32 cost" },
  { name: 'HasEnoughBerryPowder', ret: "bool8", arity: 0, params: "void" },
  { name: 'GiveBerryPowder', ret: "bool8", arity: 1, params: "u32 amountToAdd" },
  { name: 'TakeBerryPowder_', ret: "UNUSED", arity: 1, params: "u32 cost" },
  { name: 'TakeBerryPowder', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetBerryPowder', ret: "u32", arity: 0, params: "void" },
  { name: 'PrintBerryPowderAmount', ret: "void", arity: 5, params: "u8 windowId, int amount, u8 x, u8 y, u8 speed" },
  { name: 'DrawPlayerPowderAmount', ret: "void", arity: 4, params: "u8 windowId, u16 baseTileOffset, u8 paletteNum, u32 amount" },
  { name: 'PrintPlayerBerryPowderAmount', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayBerryPowderVendorMenu', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveBerryPowderVendorMenu', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry_powder.h',
  'bg.h',
  'event_data.h',
  'load_save.h',
  'menu.h',
  'palette.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'text_window.h',
  'window.h',
] as const;

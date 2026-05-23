// AUTO-GENERATED from src/coins.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/coins.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCoinsWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PrintCoinsString', ret: "void", arity: 1, params: "u32 coinAmount" },
  { name: 'ShowCoinsWindow', ret: "void", arity: 3, params: "u32 coinAmount, u8 x, u8 y" },
  { name: 'HideCoinsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'GetCoins', ret: "u16", arity: 0, params: "void" },
  { name: 'SetCoins', ret: "void", arity: 1, params: "u16 coinAmount" },
  { name: 'AddCoins', ret: "bool8", arity: 1, params: "u16 toAdd" },
  { name: 'RemoveCoins', ret: "bool8", arity: 1, params: "u16 toSub" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'coins.h',
  'text.h',
  'window.h',
  'strings.h',
  'string_util.h',
  'menu.h',
  'international_string_util.h',
  'constants/coins.h',
] as const;

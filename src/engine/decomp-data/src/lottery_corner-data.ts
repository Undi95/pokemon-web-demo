// AUTO-GENERATED from src/lottery_corner.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/lottery_corner.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sWinNumberDigit', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sOtIdDigit', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMatchingDigits', ret: "u8", arity: 2, params: "u16, u16" },
  { name: 'ResetLotteryCorner', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomLotteryNumber', ret: "void", arity: 1, params: "u16 i" },
  { name: 'RetrieveLotteryNumber', ret: "void", arity: 0, params: "void" },
  { name: 'PickLotteryCornerTicket', ret: "void", arity: 0, params: "void" },
  { name: 'SetLotteryNumber', ret: "void", arity: 1, params: "u32 lotteryNum" },
  { name: 'GetLotteryNumber', ret: "u32", arity: 0, params: "void" },
  { name: 'SetLotteryNumber16_Unused', ret: "void", arity: 1, params: "u16 lotteryNum" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'lottery_corner.h',
  'event_data.h',
  'pokemon.h',
  'constants/items.h',
  'random.h',
  'string_util.h',
  'text.h',
  'pokemon_storage_system.h',
] as const;

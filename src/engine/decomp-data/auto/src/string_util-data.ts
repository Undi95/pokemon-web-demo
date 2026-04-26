// AUTO-GENERATED from src/string_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/string_util.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WAITING_0 = {
  WAITING_FOR_NONZERO_DIGIT: 0,
  WRITING_DIGITS: 1,
  WRITING_SPACES: 2,
} as const;
export const ENUM_WAITING_1 = {
  WAITING_FOR_NONZERO_DIGIT: 0,
  WRITING_DIGITS: 1,
  WRITING_SPACES: 2,
} as const;
export const ENUM_WAITING_2 = {
  WAITING_FOR_NONZERO_DIGIT: 0,
  WRITING_DIGITS: 1,
  WRITING_SPACES: 2,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sPowersOfTen: readonly number[] = [1,10,100,1000,10000,100000,1000000,10000000,100000000,1000000000] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gStringVar1', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gStringVar2', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gStringVar3', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gStringVar4', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnknownStringVar', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StringLength', ret: "u16", arity: 1, params: "const u8 *str" },
  { name: 'StringCompare', ret: "s32", arity: 2, params: "const u8 *str1, const u8 *str2" },
  { name: 'StringCompareN', ret: "s32", arity: 3, params: "const u8 *str1, const u8 *str2, u32 n" },
  { name: 'IsStringLengthAtLeast', ret: "bool8", arity: 2, params: "const u8 *str, s32 n" },
  { name: 'StringLength_Multibyte', ret: "u32", arity: 1, params: "const u8 *str" },
  { name: 'IsStringJapanese', ret: "bool32", arity: 1, params: "u8 *str" },
  { name: 'IsStringNJapanese', ret: "bool32", arity: 2, params: "u8 *str, s32 n" },
  { name: 'GetExtCtrlCodeLength', ret: "u8", arity: 1, params: "u8 code" },
  { name: 'StringCompareWithoutExtCtrlCodes', ret: "s32", arity: 2, params: "const u8 *str1, const u8 *str2" },
  { name: 'ConvertInternationalString', ret: "void", arity: 2, params: "u8 *s, u8 language" },
  { name: 'StripExtCtrlCodes', ret: "void", arity: 1, params: "u8 *str" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'string_util.h',
  'text.h',
  'strings.h',
] as const;

// AUTO-GENERATED from include/string_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/string_util.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_StringConvertMode = {
  STR_CONV_MODE_LEFT_ALIGN: 0,
  STR_CONV_MODE_RIGHT_ALIGN: 1,
  STR_CONV_MODE_LEADING_ZEROS: 2,
} as const;

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

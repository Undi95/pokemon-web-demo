// AUTO-GENERATED from include/digit_obj_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/digit_obj_util.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DigitObjUtil_Init', ret: "bool32", arity: 1, params: "u32 count" },
  { name: 'DigitObjUtil_Free', ret: "void", arity: 0, params: "void" },
  { name: 'DigitObjUtil_CreatePrinter', ret: "bool32", arity: 3, params: "u32 id, s32 num, const struct DigitObjUtilTemplate *template" },
  { name: 'DigitObjUtil_PrintNumOn', ret: "void", arity: 2, params: "u32 id, s32 num" },
  { name: 'DigitObjUtil_DeletePrinter', ret: "void", arity: 1, params: "u32 id" },
  { name: 'DigitObjUtil_HideOrShow', ret: "void", arity: 2, params: "u32 id, bool32 hide" },
  { name: 'GetTilesPerImage', ret: "u8", arity: 2, params: "u32 shape, u32 size" },
] as const;

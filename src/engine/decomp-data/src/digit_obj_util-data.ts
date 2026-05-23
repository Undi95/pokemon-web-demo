// AUTO-GENERATED from src/digit_obj_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/digit_obj_util.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetFirstOamId', ret: "u8", arity: 1, params: "u8 oamCount" },
  { name: 'CopyWorkToOam', ret: "void", arity: 1, params: "struct DigitPrinter *objWork" },
  { name: 'DrawNumObjsLeadingZeros', ret: "void", arity: 3, params: "struct DigitPrinter *objWork, s32 num, bool32 sign" },
  { name: 'DrawNumObjsMinusInFront', ret: "void", arity: 3, params: "struct DigitPrinter *objWork, s32 num, bool32 sign" },
  { name: 'DrawNumObjsMinusInBack', ret: "void", arity: 3, params: "struct DigitPrinter *objWork, s32 num, bool32 sign" },
  { name: 'SharesTileWithAnyActive', ret: "bool32", arity: 1, params: "u32 id" },
  { name: 'SharesPalWithAnyActive', ret: "bool32", arity: 1, params: "u32 id" },
  { name: 'DigitObjUtil_Init', ret: "bool32", arity: 1, params: "u32 count" },
  { name: 'DigitObjUtil_Free', ret: "void", arity: 0, params: "void" },
  { name: 'DigitObjUtil_CreatePrinter', ret: "bool32", arity: 3, params: "u32 id, s32 num, const struct DigitObjUtilTemplate *template" },
  { name: 'DigitObjUtil_PrintNumOn', ret: "void", arity: 2, params: "u32 id, s32 num" },
  { name: 'DigitObjUtil_DeletePrinter', ret: "void", arity: 1, params: "u32 id" },
  { name: 'DigitObjUtil_HideOrShow', ret: "void", arity: 2, params: "u32 id, bool32 hide" },
  { name: 'GetTilesPerImage', ret: "u8", arity: 2, params: "u32 shape, u32 size" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'digit_obj_util.h',
  'malloc.h',
  'decompress.h',
  'main.h',
  'battle_main.h',
] as const;

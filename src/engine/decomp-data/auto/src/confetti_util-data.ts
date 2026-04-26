// AUTO-GENERATED from src/confetti_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/confetti_util.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ConfettiUtil_Init', ret: "bool32", arity: 1, params: "u8 count" },
  { name: 'ConfettiUtil_Free', ret: "bool32", arity: 0, params: "void" },
  { name: 'ConfettiUtil_Update', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetAnimAndTileNum', ret: "bool32", arity: 2, params: "struct ConfettiUtil *structPtr, u8 animNum" },
  { name: 'ConfettiUtil_SetData', ret: "u8", arity: 3, params: "u8 id, u8 dataArrayId, s16 dataValue" },
  { name: 'ConfettiUtil_AddNew', ret: "u8", arity: 7, params: "const struct OamData *oam, u16 tileTag, u16 palTag, s16 x, s16 y, u8 animNum, u8 priority" },
  { name: 'ConfettiUtil_Remove', ret: "u8", arity: 1, params: "u8 id" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'confetti_util.h',
  'malloc.h',
  'main.h',
  'digit_obj_util.h',
] as const;

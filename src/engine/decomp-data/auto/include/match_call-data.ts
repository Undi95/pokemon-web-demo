// AUTO-GENERATED from include/match_call.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/match_call.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MATCH_0 = {
  MATCH_CALL_TYPE_NON_TRAINER: 0,
  MATCH_CALL_TYPE_TRAINER: 1,
  MATCH_CALL_TYPE_WALLY: 2,
  MATCH_CALL_TYPE_BIRCH: 3,
  MATCH_CALL_TYPE_MAY_BRENDAN: 4,
  MATCH_CALL_TYPE_GYMLEADER_ELITEFOUR: 5,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetRematchIdxByTrainerIdx', ret: "s32", arity: 1, params: "s32 trainerIdx" },
  { name: 'InitMatchCallCounters', ret: "void", arity: 0, params: "void" },
  { name: 'TryStartMatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsMatchCallTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'StartMatchCallFromScript', ret: "void", arity: 1, params: "const u8 *message" },
  { name: 'BufferPokedexRatingForMatchCall', ret: "void", arity: 1, params: "u8 *destStr" },
  { name: 'SelectMatchCallMessage', ret: "bool32", arity: 2, params: "int trainerId, u8 *str" },
  { name: 'LoadMatchCallWindowGfx', ret: "void", arity: 3, params: "u32 windowId, u32 destOffset, u32 paletteId" },
  { name: 'DrawMatchCallTextBoxBorder', ret: "void", arity: 3, params: "u32 windowId, u32 tileOffset, u32 paletteId" },
] as const;

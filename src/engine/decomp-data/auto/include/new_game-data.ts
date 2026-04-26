// AUTO-GENERATED from include/new_game.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/new_game.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetTrainerId', ret: "void", arity: 2, params: "u32 trainerId, u8 *dst" },
  { name: 'GetTrainerId', ret: "u32", arity: 1, params: "u8 *trainerId" },
  { name: 'CopyTrainerId', ret: "void", arity: 2, params: "u8 *dst, u8 *src" },
  { name: 'NewGameInitData', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMenuAndMonGlobals', ret: "void", arity: 0, params: "void" },
  { name: 'Sav2_ClearSetDefault', ret: "void", arity: 0, params: "void" },
] as const;

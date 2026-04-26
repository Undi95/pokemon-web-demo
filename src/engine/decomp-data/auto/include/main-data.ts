// AUTO-GENERATED from include/main.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/main.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GAME_CODE_LENGTH = 4;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AgbMain', ret: "void", arity: 0, params: "void" },
  { name: 'SetMainCallback2', ret: "void", arity: 1, params: "MainCallback callback" },
  { name: 'InitKeys', ret: "void", arity: 0, params: "void" },
  { name: 'SetVBlankCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetHBlankCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetVCountCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetSerialCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'InitFlashTimer', ret: "void", arity: 0, params: "void" },
  { name: 'SetTrainerHillVBlankCounter', ret: "void", arity: 1, params: "u32 *counter" },
  { name: 'ClearTrainerHillVBlankCounter', ret: "void", arity: 0, params: "void" },
  { name: 'DoSoftReset', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPokemonCrySongs', ret: "void", arity: 0, params: "void" },
  { name: 'RestoreSerialTimer3IntrHandlers', ret: "void", arity: 0, params: "void" },
  { name: 'StartTimer1', ret: "void", arity: 0, params: "void" },
  { name: 'SeedRngAndSetTrainerId', ret: "void", arity: 0, params: "void" },
  { name: 'GetGeneratedTrainerIdLower', ret: "u16", arity: 0, params: "void" },
] as const;

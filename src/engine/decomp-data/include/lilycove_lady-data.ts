// AUTO-GENERATED from include/lilycove_lady.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/lilycove_lady.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetLilycoveLadyId', ret: "u8", arity: 0, params: "void" },
  { name: 'InitLilycoveLady', ret: "void", arity: 0, params: "void" },
  { name: 'ResetLilycoveLadyForRecordMix', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCallback_FavorLadyEnableScriptContexts', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCallback_QuizLadyEnableScriptContexts', ret: "void", arity: 0, params: "void" },
  { name: 'QuizLadyClearQuestionForRecordMix', ret: "void", arity: 1, params: "const LilycoveLady *lilycoveLady" },
  { name: 'GivePokeblockToContestLady', ret: "bool8", arity: 1, params: "struct Pokeblock *pokeblock" },
  { name: 'BufferContestLadyMonName', ret: "void", arity: 2, params: "u8 *category, u8 *nickname" },
  { name: 'BufferContestLadyPlayerName', ret: "void", arity: 1, params: "u8 *dest" },
  { name: 'BufferContestLadyLanguage', ret: "void", arity: 1, params: "u8 *dest" },
  { name: 'BufferContestName', ret: "void", arity: 2, params: "u8 *dest, u8 category" },
  { name: 'GetContestLadyPokeblockState', ret: "u8", arity: 0, params: "void" },
] as const;

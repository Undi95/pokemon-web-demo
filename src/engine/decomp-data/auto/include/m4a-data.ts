// AUTO-GENERATED from include/m4a.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/m4a.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'm4aSoundVSync', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundVSyncOn', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundInit', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundMain', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSongNumStart', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumStartOrChange', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumStop', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aMPlayAllStop', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayContinue', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'm4aMPlayFadeOut', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayFadeOutTemporarily', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayFadeIn', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayImmInit', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/m4a_internal.h',
] as const;

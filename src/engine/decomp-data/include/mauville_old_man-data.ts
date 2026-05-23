// AUTO-GENERATED from include/mauville_old_man.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mauville_old_man.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetMauvilleOldMan', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentMauvilleOldMan', ret: "u8", arity: 0, params: "void" },
  { name: 'SetMauvilleOldManObjEventGfx', ret: "void", arity: 0, params: "void" },
  { name: 'SanitizeMauvilleOldManForRuby', ret: "void", arity: 1, params: "union OldMan *oldMan" },
  { name: 'SanitizeReceivedRubyOldMan', ret: "void", arity: 3, params: "union OldMan *oldMan, u32 version, u32 language" },
  { name: 'SanitizeReceivedEmeraldOldMan', ret: "void", arity: 3, params: "union OldMan *oldMan, u32 version, u32 language" },
  { name: 'ResetMauvilleOldManFlag', ret: "void", arity: 0, params: "void" },
] as const;

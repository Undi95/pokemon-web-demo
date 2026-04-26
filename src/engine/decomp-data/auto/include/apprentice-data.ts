// AUTO-GENERATED from include/apprentice.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/apprentice.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BufferApprenticeChallengeText', ret: "void", arity: 1, params: "u8 saveApprenticeId" },
  { name: 'Apprentice_ScriptContext_Enable', ret: "void", arity: 0, params: "void" },
  { name: 'ResetApprenticeStruct', ret: "void", arity: 1, params: "struct Apprentice *apprentice" },
  { name: 'ResetAllApprenticeData', ret: "void", arity: 0, params: "void" },
  { name: 'CallApprenticeFunction', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/apprentice.h',
] as const;

// AUTO-GENERATED from include/pokemon_jump.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokemon_jump.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StartPokemonJump', ret: "void", arity: 2, params: "u16 partyId, MainCallback exitCallback" },
  { name: 'IsSpeciesAllowedInPokemonJump', ret: "bool32", arity: 1, params: "u16 species" },
  { name: 'IsPokemonJumpSpeciesInParty', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokemonJumpRecords', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPokemonJumpRecords', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;

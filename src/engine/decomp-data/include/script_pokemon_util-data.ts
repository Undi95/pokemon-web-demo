// AUTO-GENERATED from include/script_pokemon_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/script_pokemon_util.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ScriptGiveMon', ret: "u8", arity: 6, params: "u16 species, u8 level, u16 item, u32 unused1, u32 unused2, u8 unused3" },
  { name: 'ScriptGiveEgg', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'CreateScriptedWildMon', ret: "void", arity: 3, params: "u16 species, u8 level, u16 item" },
  { name: 'ScriptSetMonMoveSlot', ret: "void", arity: 3, params: "u8 monIndex, u16 move, u8 slot" },
  { name: 'ReducePlayerPartyToSelectedMons', ret: "void", arity: 0, params: "void" },
  { name: 'HealPlayerParty', ret: "void", arity: 0, params: "void" },
] as const;

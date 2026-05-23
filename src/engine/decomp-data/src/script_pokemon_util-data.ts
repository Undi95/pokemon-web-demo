// AUTO-GENERATED from src/script_pokemon_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/script_pokemon_util.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_ReturnFromChooseHalfParty', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnFromChooseBattleFrontierParty', ret: "void", arity: 0, params: "void" },
  { name: 'HealPlayerParty', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptGiveMon', ret: "u8", arity: 6, params: "u16 species, u8 level, u16 item, u32 unused1, u32 unused2, u8 unused3" },
  { name: 'ScriptGiveEgg', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'HasEnoughMonsForDoubleBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CheckPartyMonHasHeldItem', ret: "bool8", arity: 1, params: "u16 item" },
  { name: 'DoesPartyHaveEnigmaBerry', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateScriptedWildMon', ret: "void", arity: 3, params: "u16 species, u8 level, u16 item" },
  { name: 'ScriptSetMonMoveSlot', ret: "void", arity: 3, params: "u8 monIndex, u16 move, u8 slot" },
  { name: 'ChooseHalfPartyForBattle', ret: "void", arity: 0, params: "void" },
  { name: 'ChoosePartyForBattleFrontier', ret: "void", arity: 0, params: "void" },
  { name: 'ReducePlayerPartyToSelectedMons', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ReturnFromChooseBattleFrontierParty',
  'CB2_ReturnFromChooseHalfParty',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_gfx_sfx_util.h',
  'berry.h',
  'data.h',
  'daycare.h',
  'decompress.h',
  'event_data.h',
  'international_string_util.h',
  'link.h',
  'link_rfu.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'pokedex.h',
  'pokemon.h',
  'random.h',
  'script.h',
  'sprite.h',
  'string_util.h',
  'tv.h',
  'constants/items.h',
  'constants/battle_frontier.h',
] as const;

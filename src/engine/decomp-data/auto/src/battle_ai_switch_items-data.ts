// AUTO-GENERATED from src/battle_ai_switch_items.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_ai_switch_items.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HasSuperEffectiveMoveAgainstOpponents', ret: "bool8", arity: 1, params: "bool8 noRng" },
  { name: 'FindMonWithFlagsAndSuperEffective', ret: "bool8", arity: 2, params: "u8 flags, u8 moduloPercent" },
  { name: 'ShouldUseItem', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldSwitchIfPerishSong', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldSwitchIfWonderGuard', ret: "bool8", arity: 0, params: "void" },
  { name: 'FindMonThatAbsorbsOpponentsMove', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldSwitchIfNaturalCure', ret: "bool8", arity: 0, params: "void" },
  { name: 'AreStatsRaised', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldSwitch', ret: "bool8", arity: 0, params: "void" },
  { name: 'AI_TrySwitchOrUseItem', ret: "void", arity: 0, params: "void" },
  { name: 'ModulateByTypeEffectiveness', ret: "void", arity: 4, params: "u8 atkType, u8 defType1, u8 defType2, u8 *var" },
  { name: 'GetMostSuitableMonToSwitchInto', ret: "u8", arity: 0, params: "void" },
  { name: 'GetAI_ItemType', ret: "u8", arity: 2, params: "u8 itemId, const u8 *itemEffect" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_main.h',
  'data.h',
  'pokemon.h',
  'random.h',
  'util.h',
  'constants/abilities.h',
  'constants/item_effects.h',
  'constants/items.h',
  'constants/moves.h',
] as const;

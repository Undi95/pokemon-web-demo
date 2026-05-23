// AUTO-GENERATED from src/battle_util2.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_util2.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AllocateBattleResources', ret: "void", arity: 0, params: "void" },
  { name: 'FreeBattleResources', ret: "void", arity: 0, params: "void" },
  { name: 'AdjustFriendshipOnBattleFaint', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'AdjustFriendship', ret: "else", arity: 2, params: "&gPlayerParty[gBattlerPartyIndexes[battler]], FRIENDSHIP_EVENT_FAINT_SMALL" },
  { name: 'SwitchPartyOrderInGameMulti', ret: "void", arity: 2, params: "u8 battler, u8 arg1" },
  { name: 'BattlePalace_TryEscapeStatus', ret: "u32", arity: 1, params: "u8 battler" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'malloc.h',
  'pokemon.h',
  'trainer_hill.h',
  'party_menu.h',
  'event_data.h',
  'constants/abilities.h',
  'random.h',
  'battle_scripts.h',
  'constants/battle_string_ids.h',
] as const;

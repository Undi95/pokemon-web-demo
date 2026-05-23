// AUTO-GENERATED from src/battle_ai_script_commands.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_ai_script_commands.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 0)` */
export const AI_ACTION_DONE_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const AI_ACTION_FLEE_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const AI_ACTION_WATCH_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const AI_ACTION_DO_NOT_ATTACK_EXPR = "(1 << 3)";
/** Raw expr: `((struct AI_ThinkingStruct *)(gBattleResources->ai))` */
export const AI_THINKING_STRUCT_EXPR = "((struct AI_ThinkingStruct *)(gBattleResources->ai))";
/** Raw expr: `((struct BattleHistory *)(gBattleResources->battleHistory))` */
export const BATTLE_HISTORY_EXPR = "((struct BattleHistory *)(gBattleResources->battleHistory))";
export const IGNORED_MOVES_END = 65535;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_AIState_0 = {
  AIState_SettingUp: 0,
  AIState_Processing: 1,
  AIState_FinishedProcessing: 2,
  AIState_DoNotProcess: 3,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattler_AI', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ChooseMoveOrAction_Singles', ret: "u8", arity: 0, params: "void" },
  { name: 'ChooseMoveOrAction_Doubles', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordLastUsedMoveByTarget', ret: "void", arity: 0, params: "void" },
  { name: 'BattleAI_DoAIProcessing', ret: "void", arity: 0, params: "void" },
  { name: 'AIStackPushVar', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'AIStackPop', ret: "bool8", arity: 0, params: "void" },
  { name: 'Cmd_if_random_less_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_random_greater_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_random_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_random_not_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_score', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_hp_less_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_hp_more_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_hp_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_hp_not_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_status', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_status', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_status2', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_status2', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_status3', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_status3', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_side_affecting', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_side_affecting', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_less_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_more_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_less_than_ptr', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_more_than_ptr', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_equal_ptr', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_equal_ptr', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_in_bytes', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_in_bytes', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_in_hwords', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_in_hwords', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_user_has_attacking_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_user_has_no_attacking_moves', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_turn_count', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_type', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_considered_move_power', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_how_powerful_move_is', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_last_used_battler_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_equal_', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_equal_', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_user_goes', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_user_doesnt_go', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_2A', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_2B', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_count_usable_party_mons', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_considered_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_considered_move_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_ability', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_highest_type_effectiveness', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_type_effectiveness', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_32', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_33', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_status_in_party', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_status_not_in_party', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_weather', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_not_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_stat_level_less_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_stat_level_more_than', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_stat_level_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_stat_level_not_equal', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_can_faint', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_cant_faint', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_has_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_doesnt_have_move', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_has_move_with_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_doesnt_have_move_with_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_any_move_disabled_or_encored', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_curr_move_disabled_or_encored', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_flee', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_random_safari_flee', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_watch', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_hold_effect', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_gender', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_is_first_turn_for', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_stockpile_count', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_is_double_battle', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_used_held_item', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_move_type_from_result', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_move_power_from_result', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_move_effect_from_result', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_get_protect_count', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_52', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_53', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_54', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_55', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_56', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop_57', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_call', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_goto', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_end', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_level_cond', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_target_taunted', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_target_not_taunted', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_check_ability', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_is_of_type', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_target_is_ally', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_flash_fired', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_if_holds_item', ret: "void", arity: 0, params: "void" },
  { name: 'BattleAI_HandleItemUseBeforeAISetup', ret: "void", arity: 1, params: "u8 defaultScoreMoves" },
  { name: 'BattleAI_SetupAIData', ret: "void", arity: 1, params: "u8 defaultScoreMoves" },
  { name: 'BattleAI_ChooseMoveOrAction', ret: "u8", arity: 0, params: "void" },
  { name: 'ClearBattlerMoveHistory', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'RecordAbilityBattle', ret: "void", arity: 2, params: "u8 battler, u8 abilityId" },
  { name: 'ClearBattlerAbilityHistory', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'RecordItemEffectBattle', ret: "void", arity: 2, params: "u8 battler, u8 itemEffect" },
  { name: 'ClearBattlerItemEffectHistory', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleAI_GetWantedBattler', ret: "u8", arity: 1, params: "u8 wantedBattler" },
  { name: 'AIStackPushVar_cursor', ret: "UNUSED", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_ai_script_commands.h',
  'battle_factory.h',
  'battle_setup.h',
  'data.h',
  'item.h',
  'pokemon.h',
  'random.h',
  'recorded_battle.h',
  'util.h',
  'constants/abilities.h',
  'constants/battle_ai.h',
  'constants/battle_move_effects.h',
  'constants/items.h',
  'constants/moves.h',
] as const;

// AUTO-GENERATED from include/battle.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_USE_ITEM = 1;
export const B_ACTION_SWITCH = 2;
export const B_ACTION_RUN = 3;
export const B_ACTION_SAFARI_WATCH_CAREFULLY = 4;
export const B_ACTION_SAFARI_BALL = 5;
export const B_ACTION_SAFARI_POKEBLOCK = 6;
export const B_ACTION_SAFARI_GO_NEAR = 7;
export const B_ACTION_SAFARI_RUN = 8;
export const B_ACTION_WALLY_THROW = 9;
export const B_ACTION_EXEC_SCRIPT = 10;
export const B_ACTION_TRY_FINISH = 11;
export const B_ACTION_FINISHED = 12;
export const B_ACTION_CANCEL_PARTNER = 12;
export const B_ACTION_NOTHING_FAINTED = 13;
export const B_ACTION_UNK_14 = 14;
export const B_ACTION_UNK_15 = 15;
export const B_ACTION_NONE = 255;
export const MOVE_TARGET_SELECTED = 0;
/** Raw expr: `(1 << 0)` */
export const MOVE_TARGET_DEPENDS_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const MOVE_TARGET_USER_OR_SELECTED_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const MOVE_TARGET_RANDOM_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const MOVE_TARGET_BOTH_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const MOVE_TARGET_USER_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const MOVE_TARGET_FOES_AND_ALLY_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const MOVE_TARGET_OPPONENTS_FIELD_EXPR = "(1 << 6)";
export const NO_TARGET_OVERRIDE = 0;
export const BATTLE_BUFFER_LINK_SIZE = 4096;
export const IGNORE_SHELL_BELL = 65535;
export const RESOURCE_FLAG_FLASH_FIRE = 1;
/** Raw expr: `((1 << 6) - 1)` */
export const DYNAMIC_TYPE_MASK_EXPR = "((1 << 6) - 1)";
/** Raw expr: `(1 << 6)` */
export const F_DYNAMIC_TYPE_IGNORE_PHYSICALITY_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const F_DYNAMIC_TYPE_SET_EXPR = "(1 << 7)";
/** Raw expr: `((gSpecialStatuses[gBattlerTarget].physicalDmg != 0 || gSpecialStatuses[gBattlerTarget].specialDmg != 0))` */
export const TARGET_TURN_DAMAGED_EXPR = "((gSpecialStatuses[gBattlerTarget].physicalDmg != 0 || gSpecialStatuses[gBattlerTarget].specialDmg != 0))";
export const STAT_BUFF_NEGATIVE = 128;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/battle.h',
  'battle_main.h',
  'battle_message.h',
  'battle_util.h',
  'battle_script_commands.h',
  'battle_ai_switch_items.h',
  'battle_gfx_sfx_util.h',
  'battle_util2.h',
  'battle_bg.h',
  'pokeball.h',
  'main.h',
  'sprite.h',
] as const;

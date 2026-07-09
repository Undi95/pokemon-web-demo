// EX-AUTO-GENERATED (générateur disparu — complété manuellement) from include/battle.h by extract-decomp-all.mjs
// Compléments manuels autorisés (aucun script ne régénère include/ depuis avril 2026).
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

// ─── Compléments (unification lot 7, 2026-07-10) — #define que l'ancien extracteur sautait (1<<N/composites), rapatriés de engine/battle/constants.ts ───
export const BATTLE_TYPE_DOUBLE              = 1 << 0;
export const BATTLE_TYPE_LINK                = 1 << 1;
export const BATTLE_TYPE_WILD                = 1 << 2;
export const BATTLE_TYPE_TRAINER             = 1 << 3;
export const BATTLE_TYPE_FIRST_BATTLE        = 1 << 4;
export const BATTLE_TYPE_LINK_IN_BATTLE      = 1 << 5;
export const BATTLE_TYPE_MULTI               = 1 << 6;
export const BATTLE_TYPE_SAFARI              = 1 << 7;
export const BATTLE_TYPE_BATTLE_TOWER        = 1 << 8;
export const BATTLE_TYPE_WALLY_TUTORIAL      = 1 << 9;
export const BATTLE_TYPE_ROAMER              = 1 << 10;
export const BATTLE_TYPE_EREADER_TRAINER     = 1 << 11;
export const BATTLE_TYPE_KYOGRE_GROUDON      = 1 << 12;
export const BATTLE_TYPE_LEGENDARY           = 1 << 13;
export const BATTLE_TYPE_REGI                = 1 << 14;
export const BATTLE_TYPE_TWO_OPPONENTS       = 1 << 15;
export const BATTLE_TYPE_DOME                = 1 << 16;
export const BATTLE_TYPE_PALACE              = 1 << 17;
export const BATTLE_TYPE_ARENA               = 1 << 18;
export const BATTLE_TYPE_FACTORY             = 1 << 19;
export const BATTLE_TYPE_PIKE                = 1 << 20;
export const BATTLE_TYPE_PYRAMID             = 1 << 21;
export const BATTLE_TYPE_INGAME_PARTNER      = 1 << 22;
export const BATTLE_TYPE_TOWER_LINK_MULTI    = 1 << 23;
export const BATTLE_TYPE_RECORDED            = 1 << 24;
export const BATTLE_TYPE_RECORDED_LINK       = 1 << 25;
export const BATTLE_TYPE_TRAINER_HILL        = 1 << 26;
export const BATTLE_TYPE_SECRET_BASE         = 1 << 27;
export const BATTLE_TYPE_GROUDON             = 1 << 28;
export const BATTLE_TYPE_KYOGRE              = 1 << 29;
export const BATTLE_TYPE_RAYQUAZA            = 1 << 30;
export const BATTLE_TYPE_RECORDED_IS_MASTER  = 1 << 31;
// 1:1 décomp battle.h:91 — inclut BATTLE_TOWER (audit fix : était manquant).
export const BATTLE_TYPE_FRONTIER            = BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE | BATTLE_TYPE_PYRAMID;
export const BATTLE_TYPE_FRONTIER_NO_PYRAMID = BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE;
export const STATUS1_SLEEP                  = 0x7;
export const STATUS1_POISON                 = 1 << 3;
export const STATUS1_BURN                   = 1 << 4;
export const STATUS1_FREEZE                 = 1 << 5;
export const STATUS1_PARALYSIS              = 1 << 6;
export const STATUS1_TOXIC_POISON           = 1 << 7;
export const STATUS2_CONFUSION              = 0x7;
export const STATUS2_FLINCHED               = 1 << 3;
export const STATUS2_UPROAR                 = 0x70;
export const STATUS2_BIDE                   = 0x300;
export const STATUS2_LOCK_CONFUSE           = 0xC00;
export const STATUS2_MULTIPLETURNS          = 1 << 12;
export const STATUS2_WRAPPED                = 0xE000;
export const STATUS2_INFATUATION            = 0xF0000;
export const STATUS2_FOCUS_ENERGY           = 1 << 20;
export const STATUS2_TRANSFORMED            = 1 << 21;
export const STATUS2_RECHARGE               = 1 << 22;
export const STATUS2_RAGE                   = 1 << 23;
export const STATUS2_SUBSTITUTE             = 1 << 24;
export const STATUS2_DESTINY_BOND           = 1 << 25;
export const STATUS2_ESCAPE_PREVENTION      = 1 << 26;
export const STATUS2_NIGHTMARE              = 1 << 27;
export const STATUS2_CURSED                 = 1 << 28;
export const STATUS2_FORESIGHT              = 1 << 29;
export const STATUS2_DEFENSE_CURL           = 1 << 30;
export const STATUS2_TORMENT                = 1 << 31;
export const STATUS3_LEECHSEED_BATTLER       = 0x3;
export const STATUS3_LEECHSEED               = 1 << 2;
export const STATUS3_ALWAYS_HITS             = (1 << 3) | (1 << 4);
export const STATUS3_PERISH_SONG             = 1 << 5;
export const STATUS3_ON_AIR                  = 1 << 6;
export const STATUS3_UNDERGROUND             = 1 << 7;
export const STATUS3_MINIMIZED               = 1 << 8;
export const STATUS3_CHARGED_UP              = 1 << 9;
export const STATUS3_ROOTED                  = 1 << 10;
export const STATUS3_YAWN                    = 0x1800;
export const STATUS3_IMPRISONED_OTHERS       = 1 << 13;
export const STATUS3_GRUDGE                  = 1 << 14;
export const STATUS3_CANT_SCORE_A_CRIT       = 1 << 15;
export const STATUS3_MUDSPORT                = 1 << 16;
export const STATUS3_WATERSPORT              = 1 << 17;
export const STATUS3_UNDERWATER              = 1 << 18;
export const STATUS3_INTIMIDATE_POKES        = 1 << 19;
export const STATUS3_TRACE                   = 1 << 20;
export const STATUS3_SEMI_INVULNERABLE       = STATUS3_UNDERGROUND | STATUS3_ON_AIR | STATUS3_UNDERWATER;
export const MOVE_RESULT_MISSED              = 1 << 0;
export const MOVE_RESULT_SUPER_EFFECTIVE     = 1 << 1;
export const MOVE_RESULT_NOT_VERY_EFFECTIVE  = 1 << 2;
export const MOVE_RESULT_DOESNT_AFFECT_FOE   = 1 << 3;
export const MOVE_RESULT_ONE_HIT_KO          = 1 << 4;
export const MOVE_RESULT_FAILED              = 1 << 5;
export const MOVE_RESULT_FOE_ENDURED         = 1 << 6;
export const MOVE_RESULT_FOE_HUNG_ON         = 1 << 7;
export const MOVE_RESULT_NO_EFFECT           = MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED;
export const B_WEATHER_RAIN_TEMPORARY        = 1 << 0;
export const B_WEATHER_RAIN_DOWNPOUR         = 1 << 1;
export const B_WEATHER_RAIN_PERMANENT        = 1 << 2;
export const B_WEATHER_RAIN                  = B_WEATHER_RAIN_TEMPORARY | B_WEATHER_RAIN_DOWNPOUR | B_WEATHER_RAIN_PERMANENT;
export const B_WEATHER_SANDSTORM_TEMPORARY   = 1 << 3;
export const B_WEATHER_SANDSTORM_PERMANENT   = 1 << 4;
export const B_WEATHER_SANDSTORM             = B_WEATHER_SANDSTORM_TEMPORARY | B_WEATHER_SANDSTORM_PERMANENT;
export const B_WEATHER_SUN_TEMPORARY         = 1 << 5;
export const B_WEATHER_SUN_PERMANENT         = 1 << 6;
export const B_WEATHER_SUN                   = B_WEATHER_SUN_TEMPORARY | B_WEATHER_SUN_PERMANENT;
export const B_WEATHER_HAIL_TEMPORARY        = 1 << 7;
export const B_WEATHER_HAIL                  = B_WEATHER_HAIL_TEMPORARY;
export const B_WEATHER_ANY                   = B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_SUN | B_WEATHER_HAIL;
export const MOVE_TARGET_DEPENDS          = 1 << 0;
export const MOVE_TARGET_USER_OR_SELECTED = 1 << 1;
export const MOVE_TARGET_RANDOM           = 1 << 2;
export const MOVE_TARGET_BOTH             = 1 << 3;
export const MOVE_TARGET_USER             = 1 << 4;
export const MOVE_TARGET_FOES_AND_ALLY    = 1 << 5;
export const MOVE_TARGET_OPPONENTS_FIELD  = 1 << 6;
export const SIDE_STATUS_REFLECT          = 1 << 0;
export const SIDE_STATUS_LIGHTSCREEN      = 1 << 1;
export const SIDE_STATUS_X4               = 1 << 2;
export const SIDE_STATUS_SPIKES           = 1 << 4;
export const SIDE_STATUS_SAFEGUARD        = 1 << 5;
export const SIDE_STATUS_FUTUREATTACK     = 1 << 6;
export const SIDE_STATUS_MIST             = 1 << 8;
export const SIDE_STATUS_SPIKES_DAMAGED   = 1 << 9;
/** 1:1 décomp battle.h:122 : `(1<<8|1<<9|1<<10|1<<11) = 0xF00`. */
export const STATUS1_TOXIC_COUNTER = 0xF00;
export const MOVE_LIMITATIONS_ALL       = 0xFF;
export const STAT_CHANGE_WORKED            = 0;
export const STAT_CHANGE_DIDNT_WORK        = 1;
export const STAT_CHANGE_ALLOW_PTR          = 1 << 0;
export const STAT_CHANGE_NOT_PROTECT_AFFECTED = 1 << 5;
export const MOVE_EFFECT_AFFECTS_USER       = 1 << 6;
export const MOVE_EFFECT_CERTAIN            = 1 << 7;
export const F_DYNAMIC_TYPE_IGNORE_PHYSICALITY = 1 << 6;
export const F_DYNAMIC_TYPE_SET                = 1 << 7;
export const STATUS3_LEECHSEED_BIT = 1 << 2;  // alias clarté

// EX-AUTO-GENERATED (générateur disparu — complété manuellement) from include/constants/battle.h by extract-decomp-all.mjs
// Compléments manuels autorisés (aucun script ne régénère include/ depuis avril 2026).
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const NUM_BATTLE_SIDES = 2;
export const B_FLANK_LEFT = 0;
export const B_FLANK_RIGHT = 1;
export const BIT_SIDE = 1;
export const BIT_FLANK = 2;
/** Raw expr: `(1 << 0)` */
export const BATTLE_TYPE_DOUBLE_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const BATTLE_TYPE_LINK_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const BATTLE_TYPE_IS_MASTER_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const BATTLE_TYPE_TRAINER_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const BATTLE_TYPE_FIRST_BATTLE_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const BATTLE_TYPE_LINK_IN_BATTLE_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const BATTLE_TYPE_MULTI_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const BATTLE_TYPE_SAFARI_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8)` */
export const BATTLE_TYPE_BATTLE_TOWER_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const BATTLE_TYPE_WALLY_TUTORIAL_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const BATTLE_TYPE_ROAMER_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const BATTLE_TYPE_EREADER_TRAINER_EXPR = "(1 << 11)";
/** Raw expr: `(1 << 12)` */
export const BATTLE_TYPE_KYOGRE_GROUDON_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const BATTLE_TYPE_LEGENDARY_EXPR = "(1 << 13)";
/** Raw expr: `(1 << 14)` */
export const BATTLE_TYPE_REGI_EXPR = "(1 << 14)";
/** Raw expr: `(1 << 15)` */
export const BATTLE_TYPE_TWO_OPPONENTS_EXPR = "(1 << 15)";
/** Raw expr: `(1 << 16)` */
export const BATTLE_TYPE_DOME_EXPR = "(1 << 16)";
/** Raw expr: `(1 << 17)` */
export const BATTLE_TYPE_PALACE_EXPR = "(1 << 17)";
/** Raw expr: `(1 << 18)` */
export const BATTLE_TYPE_ARENA_EXPR = "(1 << 18)";
/** Raw expr: `(1 << 19)` */
export const BATTLE_TYPE_FACTORY_EXPR = "(1 << 19)";
/** Raw expr: `(1 << 20)` */
export const BATTLE_TYPE_PIKE_EXPR = "(1 << 20)";
/** Raw expr: `(1 << 21)` */
export const BATTLE_TYPE_PYRAMID_EXPR = "(1 << 21)";
/** Raw expr: `(1 << 22)` */
export const BATTLE_TYPE_INGAME_PARTNER_EXPR = "(1 << 22)";
/** Raw expr: `(1 << 23)` */
export const BATTLE_TYPE_TOWER_LINK_MULTI_EXPR = "(1 << 23)";
/** Raw expr: `(1 << 24)` */
export const BATTLE_TYPE_RECORDED_EXPR = "(1 << 24)";
/** Raw expr: `(1 << 25)` */
export const BATTLE_TYPE_RECORDED_LINK_EXPR = "(1 << 25)";
/** Raw expr: `(1 << 26)` */
export const BATTLE_TYPE_TRAINER_HILL_EXPR = "(1 << 26)";
/** Raw expr: `(1 << 27)` */
export const BATTLE_TYPE_SECRET_BASE_EXPR = "(1 << 27)";
/** Raw expr: `(1 << 28)` */
export const BATTLE_TYPE_GROUDON_EXPR = "(1 << 28)";
/** Raw expr: `(1 << 29)` */
export const BATTLE_TYPE_KYOGRE_EXPR = "(1 << 29)";
/** Raw expr: `(1 << 30)` */
export const BATTLE_TYPE_RAYQUAZA_EXPR = "(1 << 30)";
/** Raw expr: `(1 << 31)` */
export const BATTLE_TYPE_RECORDED_IS_MASTER_EXPR = "(1 << 31)";
/** Raw expr: `(BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE | BATTLE_TYPE_PYRAMID)` */
export const BATTLE_TYPE_FRONTIER_EXPR = "(BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE | BATTLE_TYPE_PYRAMID)";
/** Raw expr: `(BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE)` */
export const BATTLE_TYPE_FRONTIER_NO_PYRAMID_EXPR = "(BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE)";
/** Raw expr: `((BATTLE_TYPE_LINK | BATTLE_TYPE_SAFARI | BATTLE_TYPE_FIRST_BATTLE                  \` */
export const BATTLE_TYPE_RECORDED_INVALID_EXPR = "((BATTLE_TYPE_LINK | BATTLE_TYPE_SAFARI | BATTLE_TYPE_FIRST_BATTLE                  \\";
export const B_OUTCOME_WON = 1;
export const B_OUTCOME_LOST = 2;
export const B_OUTCOME_DREW = 3;
export const B_OUTCOME_RAN = 4;
export const B_OUTCOME_PLAYER_TELEPORTED = 5;
export const B_OUTCOME_MON_FLED = 6;
export const B_OUTCOME_CAUGHT = 7;
export const B_OUTCOME_NO_SAFARI_BALLS = 8;
export const B_OUTCOME_FORFEITED = 9;
export const B_OUTCOME_MON_TELEPORTED = 10;
/** Raw expr: `(1 << 7)` */
export const B_OUTCOME_LINK_BATTLE_RAN_EXPR = "(1 << 7)";
export const STATUS1_NONE = 0;
/** Raw expr: `(1 << 0 | 1 << 1 | 1 << 2)` */
export const STATUS1_SLEEP_EXPR = "(1 << 0 | 1 << 1 | 1 << 2)";
/** Raw expr: `(1 << 3)` */
export const STATUS1_POISON_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const STATUS1_BURN_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const STATUS1_FREEZE_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const STATUS1_PARALYSIS_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const STATUS1_TOXIC_POISON_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8 | 1 << 9 | 1 << 10 | 1 << 11)` */
export const STATUS1_TOXIC_COUNTER_EXPR = "(1 << 8 | 1 << 9 | 1 << 10 | 1 << 11)";
/** Raw expr: `(STATUS1_POISON | STATUS1_TOXIC_POISON)` */
export const STATUS1_PSN_ANY_EXPR = "(STATUS1_POISON | STATUS1_TOXIC_POISON)";
/** Raw expr: `(STATUS1_SLEEP | STATUS1_POISON | STATUS1_BURN | STATUS1_FREEZE | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON)` */
export const STATUS1_ANY_EXPR = "(STATUS1_SLEEP | STATUS1_POISON | STATUS1_BURN | STATUS1_FREEZE | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON)";
/** Raw expr: `(1 << 0 | 1 << 1 | 1 << 2)` */
export const STATUS2_CONFUSION_EXPR = "(1 << 0 | 1 << 1 | 1 << 2)";
/** Raw expr: `(1 << 3)` */
export const STATUS2_FLINCHED_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4 | 1 << 5 | 1 << 6)` */
export const STATUS2_UPROAR_EXPR = "(1 << 4 | 1 << 5 | 1 << 6)";
/** Raw expr: `(1 << 7)` */
export const STATUS2_UNUSED_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8 | 1 << 9)` */
export const STATUS2_BIDE_EXPR = "(1 << 8 | 1 << 9)";
/** Raw expr: `(1 << 10 | 1 << 11)` */
export const STATUS2_LOCK_CONFUSE_EXPR = "(1 << 10 | 1 << 11)";
/** Raw expr: `(1 << 12)` */
export const STATUS2_MULTIPLETURNS_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13 | 1 << 14 | 1 << 15)` */
export const STATUS2_WRAPPED_EXPR = "(1 << 13 | 1 << 14 | 1 << 15)";
/** Raw expr: `(1 << 16 | 1 << 17 | 1 << 18 | 1 << 19)` */
export const STATUS2_INFATUATION_EXPR = "(1 << 16 | 1 << 17 | 1 << 18 | 1 << 19)";
/** Raw expr: `(1 << 20)` */
export const STATUS2_FOCUS_ENERGY_EXPR = "(1 << 20)";
/** Raw expr: `(1 << 21)` */
export const STATUS2_TRANSFORMED_EXPR = "(1 << 21)";
/** Raw expr: `(1 << 22)` */
export const STATUS2_RECHARGE_EXPR = "(1 << 22)";
/** Raw expr: `(1 << 23)` */
export const STATUS2_RAGE_EXPR = "(1 << 23)";
/** Raw expr: `(1 << 24)` */
export const STATUS2_SUBSTITUTE_EXPR = "(1 << 24)";
/** Raw expr: `(1 << 25)` */
export const STATUS2_DESTINY_BOND_EXPR = "(1 << 25)";
/** Raw expr: `(1 << 26)` */
export const STATUS2_ESCAPE_PREVENTION_EXPR = "(1 << 26)";
/** Raw expr: `(1 << 27)` */
export const STATUS2_NIGHTMARE_EXPR = "(1 << 27)";
/** Raw expr: `(1 << 28)` */
export const STATUS2_CURSED_EXPR = "(1 << 28)";
/** Raw expr: `(1 << 29)` */
export const STATUS2_FORESIGHT_EXPR = "(1 << 29)";
/** Raw expr: `(1 << 30)` */
export const STATUS2_DEFENSE_CURL_EXPR = "(1 << 30)";
/** Raw expr: `(1 << 31)` */
export const STATUS2_TORMENT_EXPR = "(1 << 31)";
/** Raw expr: `(1 << 0 | 1 << 1)` */
export const STATUS3_LEECHSEED_BATTLER_EXPR = "(1 << 0 | 1 << 1)";
/** Raw expr: `(1 << 2)` */
export const STATUS3_LEECHSEED_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3 | 1 << 4)` */
export const STATUS3_ALWAYS_HITS_EXPR = "(1 << 3 | 1 << 4)";
/** Raw expr: `(1 << 5)` */
export const STATUS3_PERISH_SONG_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const STATUS3_ON_AIR_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const STATUS3_UNDERGROUND_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8)` */
export const STATUS3_MINIMIZED_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const STATUS3_CHARGED_UP_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const STATUS3_ROOTED_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11 | 1 << 12)` */
export const STATUS3_YAWN_EXPR = "(1 << 11 | 1 << 12)";
/** Raw expr: `(1 << 13)` */
export const STATUS3_IMPRISONED_OTHERS_EXPR = "(1 << 13)";
/** Raw expr: `(1 << 14)` */
export const STATUS3_GRUDGE_EXPR = "(1 << 14)";
/** Raw expr: `(1 << 15)` */
export const STATUS3_CANT_SCORE_A_CRIT_EXPR = "(1 << 15)";
/** Raw expr: `(1 << 16)` */
export const STATUS3_MUDSPORT_EXPR = "(1 << 16)";
/** Raw expr: `(1 << 17)` */
export const STATUS3_WATERSPORT_EXPR = "(1 << 17)";
/** Raw expr: `(1 << 18)` */
export const STATUS3_UNDERWATER_EXPR = "(1 << 18)";
/** Raw expr: `(1 << 19)` */
export const STATUS3_INTIMIDATE_POKES_EXPR = "(1 << 19)";
/** Raw expr: `(1 << 20)` */
export const STATUS3_TRACE_EXPR = "(1 << 20)";
/** Raw expr: `(STATUS3_UNDERGROUND | STATUS3_ON_AIR | STATUS3_UNDERWATER)` */
export const STATUS3_SEMI_INVULNERABLE_EXPR = "(STATUS3_UNDERGROUND | STATUS3_ON_AIR | STATUS3_UNDERWATER)";
/** Raw expr: `(1 << 4)` */
export const HITMARKER_WAKE_UP_CLEAR_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const HITMARKER_IGNORE_BIDE_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const HITMARKER_DESTINYBOND_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const HITMARKER_NO_ANIMATIONS_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8)` */
export const HITMARKER_IGNORE_SUBSTITUTE_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const HITMARKER_NO_ATTACKSTRING_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const HITMARKER_ATTACKSTRING_PRINTED_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const HITMARKER_NO_PPDEDUCT_EXPR = "(1 << 11)";
/** Raw expr: `(1 << 12)` */
export const HITMARKER_SWAP_ATTACKER_TARGET_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const HITMARKER_STATUS_ABILITY_EFFECT_EXPR = "(1 << 13)";
/** Raw expr: `(1 << 14)` */
export const HITMARKER_SYNCHRONIZE_EFFECT_EXPR = "(1 << 14)";
/** Raw expr: `(1 << 15)` */
export const HITMARKER_RUN_EXPR = "(1 << 15)";
/** Raw expr: `(1 << 16)` */
export const HITMARKER_IGNORE_ON_AIR_EXPR = "(1 << 16)";
/** Raw expr: `(1 << 17)` */
export const HITMARKER_IGNORE_UNDERGROUND_EXPR = "(1 << 17)";
/** Raw expr: `(1 << 18)` */
export const HITMARKER_IGNORE_UNDERWATER_EXPR = "(1 << 18)";
/** Raw expr: `(1 << 19)` */
export const HITMARKER_UNABLE_TO_USE_MOVE_EXPR = "(1 << 19)";
/** Raw expr: `(1 << 20)` */
export const HITMARKER_PASSIVE_HP_UPDATE_EXPR = "(1 << 20)";
/** Raw expr: `(1 << 21)` */
export const HITMARKER_DISOBEDIENT_MOVE_EXPR = "(1 << 21)";
/** Raw expr: `(1 << 22)` */
export const HITMARKER_PLAYER_FAINTED_EXPR = "(1 << 22)";
/** Raw expr: `(1 << 23)` */
export const HITMARKER_ALLOW_NO_PP_EXPR = "(1 << 23)";
/** Raw expr: `(1 << 24)` */
export const HITMARKER_GRUDGE_EXPR = "(1 << 24)";
/** Raw expr: `(1 << 25)` */
export const HITMARKER_OBEYS_EXPR = "(1 << 25)";
/** Raw expr: `(1 << 26)` */
export const HITMARKER_NEVER_SET_EXPR = "(1 << 26)";
/** Raw expr: `(1 << 27)` */
export const HITMARKER_CHARGING_EXPR = "(1 << 27)";
/** Raw expr: `(1 << 0)` */
export const SIDE_STATUS_REFLECT_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const SIDE_STATUS_LIGHTSCREEN_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const SIDE_STATUS_X4_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 4)` */
export const SIDE_STATUS_SPIKES_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const SIDE_STATUS_SAFEGUARD_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const SIDE_STATUS_FUTUREATTACK_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 8)` */
export const SIDE_STATUS_MIST_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const SIDE_STATUS_SPIKES_DAMAGED_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 0)` */
export const MOVE_RESULT_MISSED_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const MOVE_RESULT_SUPER_EFFECTIVE_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const MOVE_RESULT_NOT_VERY_EFFECTIVE_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const MOVE_RESULT_DOESNT_AFFECT_FOE_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const MOVE_RESULT_ONE_HIT_KO_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const MOVE_RESULT_FAILED_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const MOVE_RESULT_FOE_ENDURED_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const MOVE_RESULT_FOE_HUNG_ON_EXPR = "(1 << 7)";
/** Raw expr: `(MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED)` */
export const MOVE_RESULT_NO_EFFECT_EXPR = "(MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED)";
/** Raw expr: `(1 << 0)` */
export const B_WEATHER_RAIN_TEMPORARY_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const B_WEATHER_RAIN_DOWNPOUR_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const B_WEATHER_RAIN_PERMANENT_EXPR = "(1 << 2)";
/** Raw expr: `(B_WEATHER_RAIN_TEMPORARY | B_WEATHER_RAIN_DOWNPOUR | B_WEATHER_RAIN_PERMANENT)` */
export const B_WEATHER_RAIN_EXPR = "(B_WEATHER_RAIN_TEMPORARY | B_WEATHER_RAIN_DOWNPOUR | B_WEATHER_RAIN_PERMANENT)";
/** Raw expr: `(1 << 3)` */
export const B_WEATHER_SANDSTORM_TEMPORARY_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const B_WEATHER_SANDSTORM_PERMANENT_EXPR = "(1 << 4)";
/** Raw expr: `(B_WEATHER_SANDSTORM_TEMPORARY | B_WEATHER_SANDSTORM_PERMANENT)` */
export const B_WEATHER_SANDSTORM_EXPR = "(B_WEATHER_SANDSTORM_TEMPORARY | B_WEATHER_SANDSTORM_PERMANENT)";
/** Raw expr: `(1 << 5)` */
export const B_WEATHER_SUN_TEMPORARY_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const B_WEATHER_SUN_PERMANENT_EXPR = "(1 << 6)";
/** Raw expr: `(B_WEATHER_SUN_TEMPORARY | B_WEATHER_SUN_PERMANENT)` */
export const B_WEATHER_SUN_EXPR = "(B_WEATHER_SUN_TEMPORARY | B_WEATHER_SUN_PERMANENT)";
/** Raw expr: `(1 << 7)` */
export const B_WEATHER_HAIL_TEMPORARY_EXPR = "(1 << 7)";
/** Raw expr: `(B_WEATHER_HAIL_TEMPORARY)` */
export const B_WEATHER_HAIL_EXPR = "(B_WEATHER_HAIL_TEMPORARY)";
/** Raw expr: `(B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_SUN | B_WEATHER_HAIL)` */
export const B_WEATHER_ANY_EXPR = "(B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_SUN | B_WEATHER_HAIL)";
export const MOVE_EFFECT_SLEEP = 1;
export const MOVE_EFFECT_POISON = 2;
export const MOVE_EFFECT_BURN = 3;
export const MOVE_EFFECT_FREEZE = 4;
export const MOVE_EFFECT_PARALYSIS = 5;
export const MOVE_EFFECT_TOXIC = 6;
/** Raw expr: `MOVE_EFFECT_TOXIC` */
export const PRIMARY_STATUS_MOVE_EFFECT_EXPR = "MOVE_EFFECT_TOXIC";
export const MOVE_EFFECT_CONFUSION = 7;
export const MOVE_EFFECT_FLINCH = 8;
export const MOVE_EFFECT_TRI_ATTACK = 9;
export const MOVE_EFFECT_UPROAR = 10;
export const MOVE_EFFECT_PAYDAY = 11;
export const MOVE_EFFECT_CHARGING = 12;
export const MOVE_EFFECT_WRAP = 13;
export const MOVE_EFFECT_RECOIL_25 = 14;
export const MOVE_EFFECT_ATK_PLUS_1 = 15;
export const MOVE_EFFECT_DEF_PLUS_1 = 16;
export const MOVE_EFFECT_SPD_PLUS_1 = 17;
export const MOVE_EFFECT_SP_ATK_PLUS_1 = 18;
export const MOVE_EFFECT_SP_DEF_PLUS_1 = 19;
export const MOVE_EFFECT_ACC_PLUS_1 = 20;
export const MOVE_EFFECT_EVS_PLUS_1 = 21;
export const MOVE_EFFECT_ATK_MINUS_1 = 22;
export const MOVE_EFFECT_DEF_MINUS_1 = 23;
export const MOVE_EFFECT_SPD_MINUS_1 = 24;
export const MOVE_EFFECT_SP_ATK_MINUS_1 = 25;
export const MOVE_EFFECT_SP_DEF_MINUS_1 = 26;
export const MOVE_EFFECT_ACC_MINUS_1 = 27;
export const MOVE_EFFECT_EVS_MINUS_1 = 28;
export const MOVE_EFFECT_RECHARGE = 29;
export const MOVE_EFFECT_RAGE = 30;
export const MOVE_EFFECT_STEAL_ITEM = 31;
export const MOVE_EFFECT_PREVENT_ESCAPE = 32;
export const MOVE_EFFECT_NIGHTMARE = 33;
export const MOVE_EFFECT_ALL_STATS_UP = 34;
export const MOVE_EFFECT_RAPIDSPIN = 35;
export const MOVE_EFFECT_REMOVE_PARALYSIS = 36;
export const MOVE_EFFECT_ATK_DEF_DOWN = 37;
export const MOVE_EFFECT_RECOIL_33 = 38;
export const MOVE_EFFECT_ATK_PLUS_2 = 39;
export const MOVE_EFFECT_DEF_PLUS_2 = 40;
export const MOVE_EFFECT_SPD_PLUS_2 = 41;
export const MOVE_EFFECT_SP_ATK_PLUS_2 = 42;
export const MOVE_EFFECT_SP_DEF_PLUS_2 = 43;
export const MOVE_EFFECT_ACC_PLUS_2 = 44;
export const MOVE_EFFECT_EVS_PLUS_2 = 45;
export const MOVE_EFFECT_ATK_MINUS_2 = 46;
export const MOVE_EFFECT_DEF_MINUS_2 = 47;
export const MOVE_EFFECT_SPD_MINUS_2 = 48;
export const MOVE_EFFECT_SP_ATK_MINUS_2 = 49;
export const MOVE_EFFECT_SP_DEF_MINUS_2 = 50;
export const MOVE_EFFECT_ACC_MINUS_2 = 51;
export const MOVE_EFFECT_EVS_MINUS_2 = 52;
export const MOVE_EFFECT_THRASH = 53;
export const MOVE_EFFECT_KNOCK_OFF = 54;
export const MOVE_EFFECT_NOTHING_37 = 55;
export const MOVE_EFFECT_NOTHING_38 = 56;
export const MOVE_EFFECT_NOTHING_39 = 57;
export const MOVE_EFFECT_NOTHING_3A = 58;
export const MOVE_EFFECT_SP_ATK_TWO_DOWN = 59;
export const NUM_MOVE_EFFECTS = 60;
/** Raw expr: `(1 << 6)` */
export const MOVE_EFFECT_AFFECTS_USER_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const MOVE_EFFECT_CERTAIN_EXPR = "(1 << 7)";
export const BATTLE_ENVIRONMENT_GRASS = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS = 1;
export const BATTLE_ENVIRONMENT_SAND = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER = 3;
export const BATTLE_ENVIRONMENT_WATER = 4;
export const BATTLE_ENVIRONMENT_POND = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN = 6;
export const BATTLE_ENVIRONMENT_CAVE = 7;
export const BATTLE_ENVIRONMENT_BUILDING = 8;
export const BATTLE_ENVIRONMENT_PLAIN = 9;
export const B_WAIT_TIME_LONG = 64;
export const B_WAIT_TIME_MED = 48;
export const B_WAIT_TIME_SHORT = 32;
export const CASTFORM_NORMAL = 0;
export const CASTFORM_FIRE = 1;
export const CASTFORM_WATER = 2;
export const CASTFORM_ICE = 3;
export const NUM_CASTFORM_FORMS = 4;
/** Raw expr: `(1 << 7)` */
export const CASTFORM_SUBSTITUTE_EXPR = "(1 << 7)";
export const FLEE_ITEM = 1;
export const FLEE_ABILITY = 2;
export const BATTLE_RUN_SUCCESS = 0;
export const BATTLE_RUN_FORBIDDEN = 1;
export const BATTLE_RUN_FAILURE = 2;
export const B_WIN_TYPE_NORMAL = 0;
export const B_WIN_TYPE_ARENA = 1;
export const B_WIN_MSG = 0;
export const B_WIN_ACTION_PROMPT = 1;
export const B_WIN_ACTION_MENU = 2;
export const B_WIN_MOVE_NAME_1 = 3;
export const B_WIN_MOVE_NAME_2 = 4;
export const B_WIN_MOVE_NAME_3 = 5;
export const B_WIN_MOVE_NAME_4 = 6;
export const B_WIN_PP = 7;
export const B_WIN_DUMMY = 8;
export const B_WIN_PP_REMAINING = 9;
export const B_WIN_MOVE_TYPE = 10;
export const B_WIN_SWITCH_PROMPT = 11;
export const B_WIN_YESNO = 12;
export const B_WIN_LEVEL_UP_BOX = 13;
export const B_WIN_LEVEL_UP_BANNER = 14;
export const B_WIN_VS_PLAYER = 15;
export const B_WIN_VS_OPPONENT = 16;
export const B_WIN_VS_MULTI_PLAYER_1 = 17;
export const B_WIN_VS_MULTI_PLAYER_2 = 18;
export const B_WIN_VS_MULTI_PLAYER_3 = 19;
export const B_WIN_VS_MULTI_PLAYER_4 = 20;
export const B_WIN_VS_OUTCOME_DRAW = 21;
export const B_WIN_VS_OUTCOME_LEFT = 22;
export const B_WIN_VS_OUTCOME_RIGHT = 23;
export const ARENA_WIN_PLAYER_NAME = 15;
export const ARENA_WIN_VS = 16;
export const ARENA_WIN_OPPONENT_NAME = 17;
export const ARENA_WIN_MIND = 18;
export const ARENA_WIN_SKILL = 19;
export const ARENA_WIN_BODY = 20;
export const ARENA_WIN_JUDGMENT_TITLE = 21;
export const ARENA_WIN_JUDGMENT_TEXT = 22;
/** Raw expr: `(1 << 7)` */
export const B_WIN_COPYTOVRAM_EXPR = "(1 << 7)";
export const HP_EMPTY_SLOT = 65535;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BattlerPosition = {
  B_POSITION_PLAYER_LEFT: 0,
  B_POSITION_OPPONENT_LEFT: 1,
  B_POSITION_PLAYER_RIGHT: 2,
  B_POSITION_OPPONENT_RIGHT: 3,
  MAX_POSITION_COUNT: 4,
} as const;
export const ENUM_BattlerId = {
  B_BATTLER_0: 0,
  B_BATTLER_1: 1,
  B_BATTLER_2: 2,
  B_BATTLER_3: 3,
  MAX_BATTLERS_COUNT: 4,
} as const;

// ─── Compléments (unification lot 7, 2026-07-10) — #define constants/que l'ancien extracteur sautait (1<<N/composites), rapatriés de engine/battle/constants.ts ───
// Audit session 134 N7 : ancien fichier avait PURSUIT_TRAP/IGNORE_SAFEGUARD/
// WAKE_UP_CLEAR à des bits faux. Vraies valeurs décomp :
export const HITMARKER_WAKE_UP_CLEAR         = 1 << 4;  // cleared waking up (never set/checked)
export const HITMARKER_IGNORE_BIDE           = 1 << 5;
export const HITMARKER_DESTINYBOND           = 1 << 6;
export const HITMARKER_NO_ANIMATIONS         = 1 << 7;
export const HITMARKER_IGNORE_SUBSTITUTE     = 1 << 8;
export const HITMARKER_NO_ATTACKSTRING       = 1 << 9;
export const HITMARKER_ATTACKSTRING_PRINTED  = 1 << 10;
export const HITMARKER_NO_PPDEDUCT           = 1 << 11;
export const HITMARKER_SWAP_ATTACKER_TARGET  = 1 << 12;
export const HITMARKER_STATUS_ABILITY_EFFECT = 1 << 13;
export const HITMARKER_SYNCHRONIZE_EFFECT    = 1 << 14;  // décomp orth. Z (pas S)
export const HITMARKER_RUN                   = 1 << 15;
export const HITMARKER_IGNORE_ON_AIR         = 1 << 16;
export const HITMARKER_IGNORE_UNDERGROUND    = 1 << 17;
export const HITMARKER_IGNORE_UNDERWATER     = 1 << 18;
export const HITMARKER_UNABLE_TO_USE_MOVE    = 1 << 19;
export const HITMARKER_PASSIVE_HP_UPDATE     = 1 << 20;
export const HITMARKER_DISOBEDIENT_MOVE      = 1 << 21;
export const HITMARKER_PLAYER_FAINTED        = 1 << 22;
export const HITMARKER_ALLOW_NO_PP           = 1 << 23;
export const HITMARKER_GRUDGE                = 1 << 24;
export const HITMARKER_OBEYS                 = 1 << 25;  // set after obedience check
export const HITMARKER_NEVER_SET             = 1 << 26;
export const HITMARKER_CHARGING              = 1 << 27;
import { STATUS1_SLEEP, STATUS1_POISON, STATUS1_BURN, STATUS1_FREEZE, STATUS1_PARALYSIS, STATUS1_TOXIC_POISON } from '../battle';
export const STATUS1_ANY = STATUS1_SLEEP | STATUS1_POISON | STATUS1_BURN | STATUS1_FREEZE | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON;
export const CASTFORM_SUBSTITUTE = 1 << 7;

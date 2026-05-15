/**
 * battle/constants.ts — 1:1 décomp `include/constants/battle.h` + `pokemon.h`
 * + `abilities.h` + `moves.h`. Toutes les valeurs strictement 1:1 vérifiées.
 *
 * Pourquoi ce fichier : éviter les bugs de copy des bit values dans chaque
 * opcode (= avant cette refacto, certains opcodes avaient des HITMARKER_*
 * avec valeurs random). Source unique de vérité.
 */

// ─── BATTLE_TYPE_* (battle.h:55-93) ─────────────────────────────────────────
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
export const BATTLE_TYPE_FRONTIER            = BATTLE_TYPE_DOME | BATTLE_TYPE_PALACE | BATTLE_TYPE_ARENA | BATTLE_TYPE_FACTORY | BATTLE_TYPE_PIKE | BATTLE_TYPE_PYRAMID;

// ─── STATUS1_* (battle.h:117-128) — bitmask u32 ─────────────────────────────
export const STATUS1_NONE                   = 0;
export const STATUS1_SLEEP                  = 0x7;
export const STATUS1_POISON                 = 1 << 3;
export const STATUS1_BURN                   = 1 << 4;
export const STATUS1_FREEZE                 = 1 << 5;
export const STATUS1_PARALYSIS              = 1 << 6;
export const STATUS1_TOXIC_POISON           = 1 << 7;

// ─── STATUS2_* (battle.h:130-158) ───────────────────────────────────────────
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

// ─── STATUS3_* (battle.h:160-185) ───────────────────────────────────────────
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

// ─── HITMARKER_* (constants/battle.h:181-205) — 1:1 décomp verified ────────
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
// HITMARKER_FAINTED2(b) = (1<<28)<<b — voir helper en bas du fichier.
// HITMARKER_FAINTED(b)  = gBitTable[b]<<28 — voir helper en bas du fichier.

// ─── MOVE_RESULT_* (battle.h:219-227) ───────────────────────────────────────
export const MOVE_RESULT_MISSED              = 1 << 0;
export const MOVE_RESULT_SUPER_EFFECTIVE     = 1 << 1;
export const MOVE_RESULT_NOT_VERY_EFFECTIVE  = 1 << 2;
export const MOVE_RESULT_DOESNT_AFFECT_FOE   = 1 << 3;
export const MOVE_RESULT_ONE_HIT_KO          = 1 << 4;
export const MOVE_RESULT_FAILED              = 1 << 5;
export const MOVE_RESULT_FOE_ENDURED         = 1 << 6;
export const MOVE_RESULT_FOE_HUNG_ON         = 1 << 7;
export const MOVE_RESULT_NO_EFFECT           = MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED;

// ─── B_WEATHER_* (battle.h:115) ─────────────────────────────────────────────
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

// ─── BS_* battler refs (battle_script_commands.h:304-318) — 1:1 décomp ─────
// ATTENTION : décomp inverse BS_TARGET=0 / BS_ATTACKER=1 (= la "natural" reading
// est l'inverse de ce qu'on attendrait).
export const BS_TARGET                  = 0;
export const BS_ATTACKER                = 1;
export const BS_EFFECT_BATTLER          = 2;
export const BS_FAINTED                 = 3;
export const BS_ATTACKER_WITH_PARTNER   = 4;
export const BS_FAINTED_LINK_MULTIPLE_1 = 5;
export const BS_FAINTED_LINK_MULTIPLE_2 = 6;
export const BS_BATTLER_0               = 7;
export const BS_ATTACKER_SIDE           = 8;
export const BS_NOT_ATTACKER_SIDE       = 9;
export const BS_SCRIPTING               = 10;
export const BS_PLAYER1                 = 11;
export const BS_OPPONENT1               = 12;
export const BS_PLAYER2                 = 13;
export const BS_OPPONENT2               = 14;

// ─── Accuracycheck special move codes (battle_script_commands.h:320-326) ───
export const NO_ACC_CALC                 = 0xFFFE;
export const NO_ACC_CALC_CHECK_LOCK_ON   = 0xFFFD;
export const ACC_CURR_MOVE               = 0;

// ─── CMP_* (battle_script_commands.h:326-331) — used by jumpifstat ──────────
export const CMP_EQUAL          = 0;
export const CMP_NOT_EQUAL      = 1;
export const CMP_GREATER_THAN   = 2;
export const CMP_LESS_THAN      = 3;
export const CMP_COMMON_BITS    = 4;
export const CMP_NO_COMMON_BITS = 5;

// ─── B_MSG_STAYED_AWAKE_USING (battle_string_ids.h, used by jumpifcantmakeasleep) ──
export const B_MSG_STAYED_AWAKE_USING = 1;

// ─── Stat indices (pokemon.h:81-92) ─────────────────────────────────────────
export const STAT_HP      = 0;
export const STAT_ATK     = 1;
export const STAT_DEF     = 2;
export const STAT_SPEED   = 3;
export const STAT_SPATK   = 4;
export const STAT_SPDEF   = 5;
export const STAT_ACC     = 6;
export const STAT_EVASION = 7;
export const NUM_BATTLE_STATS = 8;

export const MIN_STAT_STAGE     = 0;
export const DEFAULT_STAT_STAGE = 6;
export const MAX_STAT_STAGE     = 12;

/** 1:1 décomp `NUM_STATS` (constants/pokemon.h:80) — incl. STAT_HP (= 6 total). */
export const NUM_STATS = 6;

/** 1:1 décomp `SET_STATCHANGER(statId, stage, goesDown)` macro (battle.h:485).
 *  Returns le statChanger byte stocké dans gBattleScripting.statChanger. */
export function SET_STATCHANGER(statId: number, stage: number, goesDown: boolean): number {
  return (statId & 0xF) | ((stage & 7) << 4) | ((goesDown ? 1 : 0) << 7);
}

// ─── TYPE_* (pokemon.h:5-29) ────────────────────────────────────────────────
export const TYPE_NORMAL   = 0;
export const TYPE_FIGHTING = 1;
export const TYPE_FLYING   = 2;
export const TYPE_POISON   = 3;
export const TYPE_GROUND   = 4;
export const TYPE_ROCK     = 5;
export const TYPE_BUG      = 6;
export const TYPE_GHOST    = 7;
export const TYPE_STEEL    = 8;
export const TYPE_MYSTERY  = 9;
export const TYPE_FIRE     = 10;
export const TYPE_WATER    = 11;
export const TYPE_GRASS    = 12;
export const TYPE_ELECTRIC = 13;
export const TYPE_PSYCHIC  = 14;
export const TYPE_ICE      = 15;
export const TYPE_DRAGON   = 16;
export const TYPE_DARK     = 17;
export const NUMBER_OF_MON_TYPES = 18;

// ─── ABILITY_* (abilities.h:5-91) ───────────────────────────────────────────
export const ABILITY_NONE          = 0;
export const ABILITY_STENCH        = 1;
export const ABILITY_DRIZZLE       = 2;
export const ABILITY_SPEED_BOOST   = 3;
export const ABILITY_BATTLE_ARMOR  = 4;
export const ABILITY_STURDY        = 5;
export const ABILITY_DAMP          = 6;
export const ABILITY_LIMBER        = 7;
export const ABILITY_SAND_VEIL     = 8;
export const ABILITY_STATIC        = 9;
export const ABILITY_VOLT_ABSORB   = 10;
export const ABILITY_WATER_ABSORB  = 11;
export const ABILITY_OBLIVIOUS     = 12;
export const ABILITY_CLOUD_NINE    = 13;
export const ABILITY_COMPOUND_EYES = 14;
export const ABILITY_INSOMNIA      = 15;
export const ABILITY_COLOR_CHANGE  = 16;
export const ABILITY_IMMUNITY      = 17;
export const ABILITY_FLASH_FIRE    = 18;
export const ABILITY_SHIELD_DUST   = 19;
export const ABILITY_OWN_TEMPO     = 20;
export const ABILITY_SUCTION_CUPS  = 21;
export const ABILITY_INTIMIDATE    = 22;
export const ABILITY_SHADOW_TAG    = 23;
export const ABILITY_ROUGH_SKIN    = 24;
export const ABILITY_WONDER_GUARD  = 25;
export const ABILITY_LEVITATE      = 26;
export const ABILITY_EFFECT_SPORE  = 27;
export const ABILITY_SYNCHRONIZE   = 28;
export const ABILITY_CLEAR_BODY    = 29;
export const ABILITY_NATURAL_CURE  = 30;
export const ABILITY_LIGHTNING_ROD = 31;
export const ABILITY_SERENE_GRACE  = 32;
export const ABILITY_SWIFT_SWIM    = 33;
export const ABILITY_CHLOROPHYLL   = 34;
export const ABILITY_ILLUMINATE    = 35;
export const ABILITY_TRACE         = 36;
export const ABILITY_HUGE_POWER    = 37;
export const ABILITY_POISON_POINT  = 38;
export const ABILITY_INNER_FOCUS   = 39;
export const ABILITY_MAGMA_ARMOR   = 40;
export const ABILITY_WATER_VEIL    = 41;
export const ABILITY_MAGNET_PULL   = 42;
export const ABILITY_SOUNDPROOF    = 43;
export const ABILITY_RAIN_DISH     = 44;
export const ABILITY_SAND_STREAM   = 45;
export const ABILITY_PRESSURE      = 46;
export const ABILITY_THICK_FAT     = 47;
export const ABILITY_EARLY_BIRD    = 48;
export const ABILITY_FLAME_BODY    = 49;
export const ABILITY_RUN_AWAY      = 50;
export const ABILITY_KEEN_EYE      = 51;
export const ABILITY_HYPER_CUTTER  = 52;
export const ABILITY_PICKUP        = 53;
export const ABILITY_TRUANT        = 54;
export const ABILITY_HUSTLE        = 55;
export const ABILITY_CUTE_CHARM    = 56;
export const ABILITY_PLUS          = 57;
export const ABILITY_MINUS         = 58;
export const ABILITY_FORECAST      = 59;
export const ABILITY_STICKY_HOLD   = 60;
export const ABILITY_SHED_SKIN     = 61;
export const ABILITY_GUTS          = 62;
export const ABILITY_MARVEL_SCALE  = 63;
export const ABILITY_LIQUID_OOZE   = 64;
export const ABILITY_OVERGROW      = 65;
export const ABILITY_BLAZE         = 66;
export const ABILITY_TORRENT       = 67;
export const ABILITY_SWARM         = 68;
export const ABILITY_ROCK_HEAD     = 69;
export const ABILITY_DROUGHT       = 70;
export const ABILITY_ARENA_TRAP    = 71;
export const ABILITY_VITAL_SPIRIT  = 72;
export const ABILITY_WHITE_SMOKE   = 73;
export const ABILITY_PURE_POWER    = 74;
export const ABILITY_SHELL_ARMOR   = 75;
export const ABILITY_CACOPHONY     = 76;
export const ABILITY_AIR_LOCK      = 77;

// ─── HOLD_EFFECT_* (constants/hold_effects.h) — verified 1:1 décomp ─────────
export const HOLD_EFFECT_NONE              = 0;
export const HOLD_EFFECT_EVASION_UP        = 22;
export const HOLD_EFFECT_CHOICE_BAND       = 29;
export const HOLD_EFFECT_SOUL_DEW          = 34;
export const HOLD_EFFECT_DEEP_SEA_TOOTH    = 35;
export const HOLD_EFFECT_DEEP_SEA_SCALE    = 36;
export const HOLD_EFFECT_FOCUS_BAND        = 39;
export const HOLD_EFFECT_SCOPE_LENS        = 41;
export const HOLD_EFFECT_LIGHT_BALL        = 45;
export const HOLD_EFFECT_LUCKY_PUNCH       = 63;
export const HOLD_EFFECT_METAL_POWDER      = 64;
export const HOLD_EFFECT_THICK_CLUB        = 65;
export const HOLD_EFFECT_STICK             = 66;

// ─── EFFECT_* (battle_move_effects.h) — values verified 1:1 décomp ─────────
export const EFFECT_HIT               = 0;
export const EFFECT_SLEEP             = 1;
export const EFFECT_POISON_HIT        = 2;
export const EFFECT_ABSORB            = 3;
export const EFFECT_BURN_HIT          = 4;
export const EFFECT_EXPLOSION         = 7;
export const EFFECT_HIGH_CRITICAL     = 43;
export const EFFECT_SKY_ATTACK        = 75;
export const EFFECT_THAW_HIT          = 125;
export const EFFECT_BATON_PASS        = 127;
export const EFFECT_FALSE_SWIPE       = 101;
export const EFFECT_RETURN            = 121;  // friendship-based power
export const EFFECT_THUNDER           = 152;
export const EFFECT_BLAZE_KICK        = 200;
export const EFFECT_POISON_TAIL       = 209;

// ─── MAX_FRIENDSHIP (constants/pokemon.h:196) — 1:1 décomp ─────────────────
export const MAX_FRIENDSHIP = 255;

// ─── MOVE_* misc ────────────────────────────────────────────────────────────
export const MOVE_NONE          = 0;
export const MOVE_FLY           = 19;
export const MOVE_SOLAR_BEAM    = 76;
export const MOVE_DIG           = 91;
export const MOVE_MIRROR_MOVE   = 119;
export const MOVE_TRANSFORM     = 144;
export const MOVE_SUBSTITUTE    = 164;
export const MOVE_POUND         = 1;
export const MOVE_RAGE          = 99;
export const MOVE_BIDE          = 117;
export const MOVE_STRUGGLE      = 165;
export const MOVE_SKETCH        = 166;
export const MOVE_SNORE         = 173;
export const MOVE_BATON_PASS    = 226;
export const MOVE_ENCORE        = 227;
export const MOVE_DIVE          = 291;
export const MOVE_BOUNCE        = 340;
export const MOVE_UNAVAILABLE   = 0xFFFF;

// ─── MAX_MON_MOVES (constants/global.h:82) — 1:1 décomp ────────────────────
export const MAX_MON_MOVES = 4;

// ─── MOVE_TARGET_* (battle.h:46-53) — 1:1 décomp ────────────────────────────
export const MOVE_TARGET_SELECTED         = 0;
export const MOVE_TARGET_DEPENDS          = 1 << 0;
export const MOVE_TARGET_USER_OR_SELECTED = 1 << 1;
export const MOVE_TARGET_RANDOM           = 1 << 2;
export const MOVE_TARGET_BOTH             = 1 << 3;
export const MOVE_TARGET_USER             = 1 << 4;
export const MOVE_TARGET_FOES_AND_ALLY    = 1 << 5;
export const MOVE_TARGET_OPPONENTS_FIELD  = 1 << 6;

// ─── SPECIES_* misc ─────────────────────────────────────────────────────────
export const SPECIES_FARFETCHD = 83;
export const SPECIES_CHANSEY   = 113;

// ─── SIDE_STATUS_* (battle.h:209-216) — verified 1:1 décomp ────────────────
export const SIDE_STATUS_REFLECT          = 1 << 0;
export const SIDE_STATUS_LIGHTSCREEN      = 1 << 1;
export const SIDE_STATUS_X4               = 1 << 2;
export const SIDE_STATUS_SPIKES           = 1 << 4;
export const SIDE_STATUS_SAFEGUARD        = 1 << 5;
export const SIDE_STATUS_FUTUREATTACK     = 1 << 6;
export const SIDE_STATUS_MIST             = 1 << 8;
export const SIDE_STATUS_SPIKES_DAMAGED   = 1 << 9;

// ─── B_OUTCOME_* (battle.h) ─────────────────────────────────────────────────
export const B_OUTCOME_WON               = 1;
export const B_OUTCOME_LOST              = 2;
export const B_OUTCOME_DREW              = 3;
export const B_OUTCOME_RAN               = 4;
export const B_OUTCOME_PLAYER_TELEPORTED = 5;
export const B_OUTCOME_MON_TELEPORTED    = 10;

// ─── BATTLE_RUN_* (battle.h:337-338) — 1:1 décomp ─────────────────────────
export const BATTLE_RUN_SUCCESS = 0;
export const BATTLE_RUN_FAILURE = 1;

// ─── NO_TARGET_OVERRIDE (battle.h:56) — 1:1 décomp ────────────────────────
export const NO_TARGET_OVERRIDE = 0;

// ─── B_MSG_PREVENTS_ESCAPE (battle_string_ids.h:567) — 1:1 décomp ────────
export const B_MSG_PREVENTS_ESCAPE = 2;

// ─── B_MSG_* AtkCanceler (battle_string_ids.h:471-583) — 1:1 décomp ──────
export const B_MSG_WOKE_UP            = 0;
export const B_MSG_WOKE_UP_UPROAR     = 1;
export const B_MSG_LOAFING            = 0;
export const B_MSG_DEFROSTED          = 0;
export const B_MSG_DEFROSTED_BY_MOVE  = 1;

// ─── STATUS2_CONFUSION_TURN (battle.h:130) — 1:1 décomp ──────────────────
/** `(num) << 0` — la confusion counter occupe bits 0..2 (= STATUS2_CONFUSION mask 0x7). */
export function STATUS2_CONFUSION_TURN(num: number): number { return num << 0; }

// ─── DISOBEDIENCE_* (battle_util.c IsMonDisobedient retval) — 1:1 décomp ──
export const DISOBEDIENCE_OBEDIENT = 0;
export const DISOBEDIENCE_IGNORED  = 1;
export const DISOBEDIENCE_OTHER    = 2;

// ─── NUM_LOAF_STRINGS (battle_string_ids.h:545) ────────────────────────────
export const NUM_LOAF_STRINGS = 4;

// ─── MOVE_LIMITATIONS_ALL (battle.h) — full move limitation mask ──────────
export const MOVE_LIMITATIONS_ALL       = 0xFF;

// ─── BATTLE_ALIVE_* (constants/pokemon.h:277-279) — 1:1 décomp ────────────
export const BATTLE_ALIVE_EXCEPT_ACTIVE = 0;
export const BATTLE_ALIVE_ATK_SIDE      = 1;
export const BATTLE_ALIVE_DEF_SIDE      = 2;
export const B_OUTCOME_MON_FLED          = 6;
export const B_OUTCOME_CAUGHT            = 7;

// ─── BATTLE_COMMUNICATION_* indices (battle_script_commands.h:288-300) ──────
export const CURSOR_POSITION  = 1;
export const MOVE_EFFECT_BYTE = 3;
export const MISS_TYPE        = 6;
export const MSG_DISPLAY      = 7;

// ─── Battle window IDs (constants/battle.h:345-357) — 1:1 décomp ───────────
export const B_WIN_MSG   = 0;
export const B_WIN_YESNO = 12;

// ─── Battle window flags (battle_script_commands.h:7-8) — 1:1 décomp ──────
export const WINDOW_CLEAR = 1 << 0;
export const WINDOW_BG1   = 1 << 7;

// ─── YESNOBOX_X_Y (battle_script_commands.h:11) — 1:1 décomp ───────────────
// Macro expands to `23, 8, 29, 13` (= 4-arg list for HandleBattleWindow xStart yStart xEnd yEnd).
export const YESNOBOX_X_START = 23;
export const YESNOBOX_Y_START = 8;
export const YESNOBOX_X_END   = 29;
export const YESNOBOX_Y_END   = 13;

// ─── B_COMM_TO_CONTROLLER (battle_controllers.h:115, enum BattleBufferCommands) ──
export const B_COMM_TO_CONTROLLER = 0;

// ─── STRINGID_* (constants/battle_string_ids.h) — 1:1 décomp — subset N5 ───
export const STRINGID_USEDMOVE             = 4;
export const STRINGID_ATTACKMISSED         = 23;
export const STRINGID_PKMNPROTECTEDITSELF  = 24;
export const STRINGID_AVOIDEDDAMAGE        = 26;
export const STRINGID_ITDOESNTAFFECT       = 27;
export const STRINGID_PKMNENDUREDHIT       = 153;
export const STRINGID_CRITICALHIT          = 217;
export const STRINGID_ONEHITKO             = 218;
export const STRINGID_NOTVERYEFFECTIVE     = 221;
export const STRINGID_SUPEREFFECTIVE       = 222;
export const STRINGID_BUTITFAILED          = 229;
export const STRINGID_PKMNMAKESGROUNDMISS  = 332;
export const STRINGID_PKMNAVOIDEDATTACK    = 345;

// ─── SE_* battle (constants/songs.h:18-20) — 1:1 décomp ─────────────────────
export const SE_NOT_EFFECTIVE      = 12;
export const SE_EFFECTIVE          = 13;
export const SE_SUPER_EFFECTIVE    = 14;

// ─── REQUEST_* (battle_controllers.h:5-55 enum) — 1:1 décomp subset ────────
// L'enum a 41 entrées avant STATUS_BATTLE :
// 0:ALL, 1:SPECIES, 2:HELDITEM, 3:MOVES_PP, 4..7:MOVE1..4, 8:PP_DATA,
// 9..12:PPMOVE1..4, 13..16:UNUSED, 17:OTID, 18:EXP, 19..24:HP/ATK/DEF/SPEED/
// SPATK/SPDEF_EV, 25:FRIENDSHIP, 26:POKERUS, 27:MET_LOCATION, 28:MET_LEVEL,
// 29:MET_GAME, 30:POKEBALL, 31:ALL_IVS, 32..37:HP/ATK/DEF/SPEED/SPATK/SPDEF_IV,
// 38:PERSONALITY, 39:CHECKSUM, 40:STATUS_BATTLE.
export const REQUEST_ALL_BATTLE      = 0;
export const REQUEST_SPECIES_BATTLE  = 1;
export const REQUEST_HELDITEM_BATTLE = 2;
export const REQUEST_STATUS_BATTLE   = 40;
export const REQUEST_LEVEL_BATTLE    = 41;
export const REQUEST_HP_BATTLE       = 42;
export const REQUEST_MAX_HP_BATTLE   = 43;

// ─── B_MSG_* miss messages (battle_string_ids.h:409-413) — 1:1 décomp ───────
export const B_MSG_MISSED        = 0;
export const B_MSG_PROTECTED     = 1;
export const B_MSG_AVOIDED_ATK   = 2;
export const B_MSG_AVOIDED_DMG   = 3;
export const B_MSG_GROUND_MISS   = 4;

// ─── Stat change (battle.h:478-483, battle_script_commands.h:371-372) ──────
export const STAT_CHANGE_WORKED            = 0;
export const STAT_CHANGE_DIDNT_WORK        = 1;
export const STAT_CHANGE_ALLOW_PTR          = 1 << 0;
export const STAT_CHANGE_NOT_PROTECT_AFFECTED = 1 << 5;
export const MOVE_EFFECT_AFFECTS_USER       = 1 << 6;
export const MOVE_EFFECT_CERTAIN            = 1 << 7;
export const STAT_BUFF_NEGATIVE             = 0x80;

/** 1:1 décomp `GET_STAT_BUFF_ID(n)` (battle.h:478) — low 4 bits = stat index. */
export function GET_STAT_BUFF_ID(n: number): number { return n & 0xF; }
/** 1:1 décomp `GET_STAT_BUFF_VALUE(n)` (battle.h:480) — bits 4-6 = stage delta. */
export function GET_STAT_BUFF_VALUE(n: number): number { return (n >> 4) & 7; }
/** 1:1 décomp `SET_STAT_BUFF_VALUE(n)` (battle.h:483) — pack stage delta. */
export function SET_STAT_BUFF_VALUE(n: number): number { return (n << 4) & 0xF0; }

// ─── MULTISTRING_CHOOSER index (battle_script_commands.h:294) ──────────────
export const MULTISTRING_CHOOSER = 5;

// ─── B_MSG_* stat change (battle_string_ids.h:395-406) ──────────────────────
export const B_MSG_ATTACKER_STAT_ROSE  = 0;
export const B_MSG_DEFENDER_STAT_ROSE  = 1;
export const B_MSG_STAT_WONT_INCREASE  = 2;
export const B_MSG_STAT_ROSE_EMPTY     = 3;
export const B_MSG_STAT_ROSE_ITEM      = 4;
export const B_MSG_USED_DIRE_HIT       = 5;
export const B_MSG_ATTACKER_STAT_FELL  = 0;
export const B_MSG_DEFENDER_STAT_FELL  = 1;
export const B_MSG_STAT_WONT_DECREASE  = 2;
export const B_MSG_STAT_FELL_EMPTY     = 3;

// ─── MOVE_CURSE id (= moves.h, used in stat change protection check) ────────
export const MOVE_CURSE = 174;

// ─── Battle sides (battle.h:24-26) ──────────────────────────────────────────
export const B_SIDE_PLAYER   = 0;
export const B_SIDE_OPPONENT = 1;
export const BIT_SIDE        = 1;
export const BIT_FLANK       = 2;

// Note : B_POSITION_* sont définis dans util.ts (= legacy, à migrer ici).

// ─── Party sizes (constants/global.h) ───────────────────────────────────────
export const PARTY_SIZE_CONST = 6;
export const MULTI_PARTY_SIZE = 3;

/** 1:1 décomp `GET_BATTLER_SIDE(battler)` (battle.h:30). */
export function GET_BATTLER_SIDE(battler: number): number { return battler & BIT_SIDE; }

/** 1:1 décomp `BATTLE_OPPOSITE(id)` (battle.h:45). */
export function BATTLE_OPPOSITE(id: number): number { return id ^ BIT_SIDE; }

/** 1:1 décomp `IS_TYPE_PHYSICAL(moveType)` (battle.h:466). */
export function IS_TYPE_PHYSICAL(t: number): boolean { return t < TYPE_MYSTERY; }
/** 1:1 décomp `IS_TYPE_SPECIAL(moveType)` (battle.h:467). */
export function IS_TYPE_SPECIAL(t: number): boolean { return t > TYPE_MYSTERY; }

/** 1:1 décomp `HITMARKER_FAINTED(battler)` (battle.h:205). gBitTable[battler]<<28. */
export function HITMARKER_FAINTED(battler: number): number { return (1 << battler) << 28; }

/** 1:1 décomp `HITMARKER_FAINTED2(battler)` (battle.h:206). (1<<28)<<battler. */
export function HITMARKER_FAINTED2(battler: number): number { return (1 << 28) << battler; }

// ─── F_DYNAMIC_TYPE_* (battle.h:455-456) — 1:1 décomp ───────────────────────
export const F_DYNAMIC_TYPE_IGNORE_PHYSICALITY = 1 << 6;
export const F_DYNAMIC_TYPE_SET                = 1 << 7;

// ─── STATUS3 helpers ────────────────────────────────────────────────────────
/** 1:1 décomp `STATUS3_ALWAYS_HITS_TURN(num)` (constants/battle.h:161). */
export function STATUS3_ALWAYS_HITS_TURN(num: number): number {
  return (num << 3) & STATUS3_ALWAYS_HITS;
}

// ─── STATUS3_LEECHSEED (battle.h:153) — 1:1 décomp ─────────────────────────
export const STATUS3_LEECHSEED_BIT = 1 << 2;  // alias clarté

// ─── B_MSG_* N9 status strings (battle_string_ids.h:420-501) ───────────────
export const B_MSG_LEECH_SEED_SET       = 0;
export const B_MSG_LEECH_SEED_MISS      = 1;
export const B_MSG_LEECH_SEED_FAIL      = 2;
export const B_MSG_LEECH_SEED_DRAIN     = 3;
export const B_MSG_LEECH_SEED_OOZE      = 4;
export const B_MSG_GETTING_PUMPED       = 0;
export const B_MSG_FOCUS_ENERGY_FAILED  = 1;

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (battle.h:471). */
export function IS_BATTLER_OF_TYPE(t1: number, t2: number, type: number): boolean {
  return t1 === type || t2 === type;
}

// ─── B_MSG_* weather (battle_string_ids.h:437-442) — 1:1 décomp ────────────
export const B_MSG_STARTED_RAIN      = 0;
export const B_MSG_WEATHER_FAILED    = 2;
export const B_MSG_STARTED_SANDSTORM = 3;
export const B_MSG_STARTED_SUNLIGHT  = 4;
export const B_MSG_STARTED_HAIL      = 5;

// ─── B_MSG_* side status (battle_string_ids.h:454-459) — 1:1 décomp ────────
export const B_MSG_SIDE_STATUS_FAILED     = 0;
export const B_MSG_SET_REFLECT_SINGLE     = 1;
export const B_MSG_SET_REFLECT_DOUBLE     = 2;
export const B_MSG_SET_LIGHTSCREEN_SINGLE = 3;
export const B_MSG_SET_LIGHTSCREEN_DOUBLE = 4;
export const B_MSG_SET_SAFEGUARD          = 5;

// ─── B_MSG_* mist (battle_string_ids.h:496-497) — 1:1 décomp ───────────────
export const B_MSG_SET_MIST    = 0;
export const B_MSG_MIST_FAILED = 1;

// ─── B_MSG_* substitute (battle_string_ids.h:508-509) — 1:1 décomp ─────────
export const B_MSG_SET_SUBSTITUTE     = 0;
export const B_MSG_SUBSTITUTE_FAILED  = 1;

// ─── STATUS1_ANY (constants/battle.h:125) — 1:1 décomp ─────────────────────
export const STATUS1_ANY = STATUS1_SLEEP | STATUS1_POISON | STATUS1_BURN | STATUS1_FREEZE | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON;

/** 1:1 décomp `STATUS2_BIDE_TURN(num)` (battle.h:136). */
export function STATUS2_BIDE_TURN(num: number): number {
  return (num << 8) & STATUS2_BIDE;
}

/** 1:1 décomp `STATUS3_YAWN_TURN(num)` (battle.h:169). */
export function STATUS3_YAWN_TURN(num: number): number {
  return (num << 11) & STATUS3_YAWN;
}

// ─── MOVE_EFFECT_* (constants/battle.h:245-275) — 1:1 décomp subset ────────
export const MOVE_EFFECT_SLEEP        = 1;
export const MOVE_EFFECT_POISON       = 2;
export const MOVE_EFFECT_BURN         = 3;
export const MOVE_EFFECT_FREEZE       = 4;
export const MOVE_EFFECT_PARALYSIS    = 5;
export const MOVE_EFFECT_TOXIC        = 6;
export const MOVE_EFFECT_CONFUSION    = 7;
export const MOVE_EFFECT_FLINCH       = 8;
export const MOVE_EFFECT_TRI_ATTACK   = 9;
export const MOVE_EFFECT_UPROAR       = 10;
export const MOVE_EFFECT_PAYDAY       = 11;
export const MOVE_EFFECT_CHARGING     = 12;
export const MOVE_EFFECT_WRAP         = 13;
export const MOVE_EFFECT_RECOIL_25    = 14;
export const MOVE_EFFECT_ATK_PLUS_1   = 15;
export const MOVE_EFFECT_DEF_PLUS_1   = 16;
export const MOVE_EFFECT_SPD_PLUS_1   = 17;
export const MOVE_EFFECT_SP_ATK_PLUS_1 = 18;
export const MOVE_EFFECT_SP_DEF_PLUS_1 = 19;
export const MOVE_EFFECT_ACC_PLUS_1   = 20;
export const MOVE_EFFECT_EVS_PLUS_1   = 21;
export const MOVE_EFFECT_ATK_MINUS_1  = 22;
export const MOVE_EFFECT_DEF_MINUS_1  = 23;
export const MOVE_EFFECT_SPD_MINUS_1  = 24;
export const MOVE_EFFECT_SP_ATK_MINUS_1 = 25;
export const MOVE_EFFECT_SP_DEF_MINUS_1 = 26;
export const MOVE_EFFECT_ACC_MINUS_1  = 27;
export const MOVE_EFFECT_EVS_MINUS_1  = 28;
export const MOVE_EFFECT_RECHARGE     = 29;
export const MOVE_EFFECT_RAGE         = 30;
export const MOVE_EFFECT_STEAL_ITEM   = 31;
export const MOVE_EFFECT_THRASH       = 53;

// ─── MOVE_PROTECT/DETECT/ENDURE (constants/moves.h) — 1:1 décomp ──────────
export const MOVE_PROTECT = 182;
export const MOVE_DETECT  = 197;
export const MOVE_ENDURE  = 203;
export const MOVE_PURSUIT = 228;

// ─── B_ACTION_* (battle.h:27-38) — 1:1 décomp ──────────────────────────────
export const B_ACTION_USE_MOVE        = 0;
export const B_ACTION_USE_ITEM        = 1;
export const B_ACTION_SWITCH          = 2;
export const B_ACTION_RUN             = 3;
export const B_ACTION_SAFARI_WATCH_CAREFULLY = 4;
export const B_ACTION_SAFARI_BALL     = 5;
export const B_ACTION_SAFARI_POKEBLOCK = 6;
export const B_ACTION_SAFARI_GO_NEAR  = 7;
export const B_ACTION_SAFARI_RUN      = 8;
export const B_ACTION_WALLY_THROW     = 9;
export const B_ACTION_EXEC_SCRIPT     = 10;
export const B_ACTION_TRY_FINISH      = 11;
export const B_ACTION_FINISHED        = 12;
export const B_ACTION_NOTHING_FAINTED = 13;
export const B_ACTION_CANCEL_PARTNER  = 12;

/** 1:1 décomp `BATTLE_PARTNER(position)` (constants/battle.h). XOR 2 swap. */
export function BATTLE_PARTNER(position: number): number { return position ^ 2; }

// ─── REQUEST_PPMOVE1_BATTLE (battle_controllers.h:14) — 1:1 décomp ────────
export const REQUEST_PPMOVE1_BATTLE = 9;

// ─── B_ANIM_* (constants/battle_anim.h) — 1:1 décomp subset ───────────────
export const B_ANIM_CASTFORM_CHANGE = 0;

// ─── CASTFORM_SUBSTITUTE (constants/battle.h:331) — 1:1 décomp ────────────
export const CASTFORM_SUBSTITUTE = 1 << 7;

// ─── MOVE_* extra used for Mimic forbidden table — 1:1 décomp ─────────────
export const MOVE_METRONOME    = 118;
export const MOVE_MIMIC        = 102;
export const MOVE_COUNTER      = 68;
export const MOVE_MIRROR_COAT  = 243;
export const MOVE_DESTINY_BOND = 194;
export const MOVE_SLEEP_TALK   = 214;
export const MOVE_THIEF        = 168;
export const MOVE_FOLLOW_ME    = 266;
export const MOVE_HELPING_HAND = 270;
export const MOVE_COVET        = 343;
export const MOVE_TRICK        = 271;
export const MOVE_FOCUS_PUNCH  = 264;
export const MOVE_SNATCH       = 289;
export const MOVE_UPROAR       = 253;
export const MOVE_HEAL_BELL    = 215;

// ─── B_MSG_* heal bell (battle_string_ids.h:512-516) — 1:1 décomp ─────────
export const B_MSG_BELL                     = 0;
export const B_MSG_BELL_SOUNDPROOF_ATTACKER = 1;
export const B_MSG_BELL_SOUNDPROOF_PARTNER  = 2;
export const B_MSG_BELL_BOTH_SOUNDPROOF     = 3;
export const B_MSG_SOOTHING_AROMA           = 4;

// ─── sMovesForbiddenToCopy (battle_script_commands.c:725) — 1:1 décomp ────
/** Sentinels MIMIC_FORBIDDEN_END / METRONOME_FORBIDDEN_END divisent les two
 *  sublists : Mimic forbidden = before MIMIC_FORBIDDEN_END,
 *  Metronome forbidden = full list jusqu'à METRONOME_FORBIDDEN_END. */
export const MIMIC_FORBIDDEN_END     = 0xFFFE;
export const METRONOME_FORBIDDEN_END = 0xFFFF;

export const sMovesForbiddenToCopy: number[] = [
  MOVE_METRONOME, MOVE_STRUGGLE, MOVE_SKETCH, MOVE_MIMIC,
  MIMIC_FORBIDDEN_END,
  MOVE_COUNTER, MOVE_MIRROR_COAT, MOVE_PROTECT, MOVE_DETECT, MOVE_ENDURE,
  MOVE_DESTINY_BOND, MOVE_SLEEP_TALK, MOVE_THIEF, MOVE_FOLLOW_ME,
  MOVE_SNATCH, MOVE_HELPING_HAND, MOVE_COVET, MOVE_TRICK,
  MOVE_FOCUS_PUNCH,
  METRONOME_FORBIDDEN_END,
];

// ─── EFFECT_PROTECT / EFFECT_ENDURE (battle_move_effects.h) ───────────────
export const EFFECT_PROTECT = 111;
export const EFFECT_ENDURE  = 116;

// ─── B_MSG_* protect (battle_string_ids.h:462-464) — 1:1 décomp ────────────
export const B_MSG_PROTECTED_ITSELF = 0;
export const B_MSG_BRACED_ITSELF    = 1;
export const B_MSG_PROTECT_FAILED   = 2;

// ─── B_MSG_* OHKO / transform (battle_string_ids.h:492-505) — 1:1 décomp ──
export const B_MSG_KO_MISS         = 0;
export const B_MSG_KO_UNAFFECTED   = 1;
export const B_MSG_TRANSFORMED      = 0;
export const B_MSG_TRANSFORM_FAILED = 1;

// ─── RESET_* (battle_controllers.h:128-132) — 1:1 décomp ──────────────────
export const RESET_ACTION_MOVE_SELECTION = 0;
export const RESET_ACTION_SELECTION       = 1;
export const RESET_MOVE_SELECTION         = 2;

// ─── MOVE_DOOM_DESIRE/FUTURE_SIGHT + B_MSG (moves.h, battle_string_ids.h) ─
export const MOVE_DOOM_DESIRE  = 353;
export const MOVE_FUTURE_SIGHT = 248;
export const B_MSG_FUTURE_SIGHT = 0;
export const B_MSG_DOOM_DESIRE  = 1;

// ─── SWITCH_IGNORE_ESCAPE_PREVENTION (battle_script_commands.h:368) ───────
export const SWITCH_IGNORE_ESCAPE_PREVENTION = 1 << 7;

// ─── MON_GENDERLESS (constants/pokemon.h:171) — 1:1 décomp ────────────────
export const MON_GENDERLESS = 0xFF;
export const MON_MALE       = 0x00;
export const MON_FEMALE     = 0xFE;

// ─── MOVES_COUNT / ALL_MOVES_MASK (constants/moves.h, global.h) — 1:1 ─────
export const MOVES_COUNT     = 355;
export const ALL_MOVES_MASK  = (1 << 4) - 1;  // = MAX_MON_MOVES (4)

// ─── MOVE_LIMITATION_* (battle_util.h:5) — 1:1 décomp ─────────────────────
export const MOVE_LIMITATION_ZEROMOVE    = 1 << 0;
export const MOVE_LIMITATION_PP          = 1 << 1;
export const MOVE_LIMITATION_DISABLED    = 1 << 2;
export const MOVE_LIMITATION_TORMENTED   = 1 << 3;
export const MOVE_LIMITATION_TAUNT       = 1 << 4;
export const MOVE_LIMITATION_IMPRISON    = 1 << 5;

/** 1:1 décomp `STATUS2_INFATUATED_WITH(battler)` (battle.h:143).
 *  Encode battler id 0..3 dans bits 16..19 (= mask via gBitTable[battler]<<16). */
export function STATUS2_INFATUATED_WITH(battler: number): number {
  return (1 << battler) << 16;
}

/** 1:1 décomp `sNaturePowerMoves[]` (battle_script_commands.c:759).
 *  Indexé par BATTLE_ENVIRONMENT_*. Donne le move utilisé par Nature Power. */
export const sNaturePowerMoves: number[] = [
  /* GRASS       */ 78,   // MOVE_STUN_SPORE
  /* LONG_GRASS  */ 75,   // MOVE_RAZOR_LEAF
  /* SAND        */ 89,   // MOVE_EARTHQUAKE
  /* UNDERWATER  */ 56,   // MOVE_HYDRO_PUMP
  /* WATER       */ 57,   // MOVE_SURF
  /* POND        */ 61,   // MOVE_BUBBLE_BEAM
  /* MOUNTAIN    */ 157,  // MOVE_ROCK_SLIDE
  /* CAVE        */ 247,  // MOVE_SHADOW_BALL
  /* BUILDING    */ 129,  // MOVE_SWIFT
  /* PLAIN       */ 129,  // MOVE_SWIFT
];

// ─── B_MSG_* stockpile/swallow (battle_string_ids.h:484-489) — 1:1 décomp ─
export const B_MSG_STOCKPILED      = 0;
export const B_MSG_CANT_STOCKPILE  = 1;
export const B_MSG_SWALLOW_FAILED  = 0;
export const B_MSG_SWALLOW_FULL_HP = 1;

// ─── sProtectSuccessRates (battle_script_commands.c:719) — 1:1 décomp ─────
/** USHRT_MAX = 0xFFFF (= 65535). Décomp utilise USHRT_MAX, USHRT_MAX/2,
 *  USHRT_MAX/4, USHRT_MAX/8 pour les success rates de Protect/Detect/Endure
 *  selon le nombre d'usages consécutifs. */
export const sProtectSuccessRates: number[] = [
  0xFFFF,       // 1er usage : 100%
  0xFFFF >> 1,  // 2e : 50%
  0xFFFF >> 2,  // 3e : 25%
  0xFFFF >> 3,  // 4e : 12.5%
];

/** 1:1 décomp `STATUS1_SLEEP_TURN(num)` (constants/battle.h:116). */
export function STATUS1_SLEEP_TURN(num: number): number { return num << 0; }

/** 1:1 décomp `sEnvironmentToType[]` (battle_script_commands.c:826). */
export const sEnvironmentToType: number[] = [
  /* GRASS       */ 12, // TYPE_GRASS
  /* LONG_GRASS  */ 12, // TYPE_GRASS
  /* SAND        */ 4,  // TYPE_GROUND
  /* UNDERWATER  */ 11, // TYPE_WATER
  /* WATER       */ 11, // TYPE_WATER
  /* POND        */ 11, // TYPE_WATER
  /* MOUNTAIN    */ 5,  // TYPE_ROCK
  /* CAVE        */ 5,  // TYPE_ROCK
  /* BUILDING    */ 0,  // TYPE_NORMAL
  /* PLAIN       */ 0,  // TYPE_NORMAL
];

// ─── BATTLE_ENVIRONMENT_* (constants/battle.h:311-320) — 1:1 décomp ────────
export const BATTLE_ENVIRONMENT_GRASS       = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS  = 1;
export const BATTLE_ENVIRONMENT_SAND        = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER  = 3;
export const BATTLE_ENVIRONMENT_WATER       = 4;
export const BATTLE_ENVIRONMENT_POND        = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN    = 6;
export const BATTLE_ENVIRONMENT_CAVE        = 7;
export const BATTLE_ENVIRONMENT_BUILDING    = 8;
export const BATTLE_ENVIRONMENT_PLAIN       = 9;

// ─── EFFECT_MUD_SPORT / EFFECT_WATER_SPORT (battle_move_effects.h) ─────────
export const EFFECT_MUD_SPORT   = 201;
export const EFFECT_WATER_SPORT = 210;

// ─── B_MSG_* weaken (battle_string_ids.h:528-529) — 1:1 décomp ─────────────
export const B_MSG_WEAKEN_ELECTRIC = 0;
export const B_MSG_WEAKEN_FIRE     = 1;

// ─── FLAG_* move flags (constants/pokemon.h:208-213) — 1:1 décomp ──────────
export const FLAG_MAKES_CONTACT        = 1 << 0;
export const FLAG_PROTECT_AFFECTED     = 1 << 1;
export const FLAG_MAGIC_COAT_AFFECTED  = 1 << 2;
export const FLAG_SNATCH_AFFECTED      = 1 << 3;
export const FLAG_MIRROR_MOVE_AFFECTED = 1 << 4;
export const FLAG_KINGS_ROCK_AFFECTED  = 1 << 5;

// ─── IGNORE_SHELL_BELL (battle.h:61) — 1:1 décomp ──────────────────────────
export const IGNORE_SHELL_BELL = 0xFFFF;

// ─── INSTANT_HP_BAR_DROP (battle_controllers.h:149) — 1:1 décomp ───────────
export const INSTANT_HP_BAR_DROP = 0x7FFF;

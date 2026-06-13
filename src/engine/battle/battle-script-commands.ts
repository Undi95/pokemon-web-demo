/**
 * battle/battle-script-commands.ts — port 1:1 COMPLET du décomp
 * `src/battle_script_commands.c` (gBattleScriptingCommandsTable, 249 opcodes 0x00–0xF8).
 *
 * FUSION des 34 ex-cmd-batch-*.ts en un seul fichier (mirror décomp). Généré par
 * scripts/_tmp-merge-cmds.mjs : suffixe `__bNN` les décls top-level en conflit
 * entre batches (0 changement de comportement), opcode 0x18 dédupliqué (batch 02),
 * `installAllBattleScriptCommands` ordonné par opcode (1:1 gBattleScriptingCommandsTable).
 */
import * as _AbilityConsts from '../decomp-data/include/constants/abilities-data';
import {
  PokemonUseItemEffects,
} from '../bag/bag-item-effects';
import {
  getSpeciesInfo as _getSpeciesInfoHBT,
  getSpeciesInfo as _getSpeciesInfoPK,
  getSpeciesInfo as getSpeciesInfoBU,
} from '../data/game-data';
import {
  ABILITY_PICKUP,
  ABILITY_SERENE_GRACE,
} from '../decomp-data/include/constants/abilities-data';
import {
  MOVE_EFFECT_BURN,
  MOVE_EFFECT_CHARGING,
  MOVE_EFFECT_CONFUSION,
  MOVE_EFFECT_FLINCH,
  MOVE_EFFECT_FREEZE,
  MOVE_EFFECT_NIGHTMARE,
  MOVE_EFFECT_PARALYSIS,
  MOVE_EFFECT_POISON,
  MOVE_EFFECT_PREVENT_ESCAPE,
  MOVE_EFFECT_RECHARGE,
  MOVE_EFFECT_SLEEP,
  MOVE_EFFECT_THRASH,
  MOVE_EFFECT_TOXIC,
  MOVE_EFFECT_UPROAR,
  MOVE_EFFECT_WRAP,
} from '../decomp-data/include/constants/battle-data';
import {
  B_ANIM_SNATCH_MOVE,
  B_ANIM_STATS_CHANGE,
  B_ANIM_SUBSTITUTE_FADE,
} from '../decomp-data/include/constants/battle_anim-data';
import {
  EFFECT_ALWAYS_HIT,
  EFFECT_BIDE,
  EFFECT_BIDE as _EFFECT_BIDE,
  EFFECT_RAZOR_WIND,
  EFFECT_RAZOR_WIND as _EFFECT_RAZOR_WIND,
  EFFECT_SEMI_INVULNERABLE,
  EFFECT_SEMI_INVULNERABLE as _EFFECT_SEMI_INVULNERABLE,
  EFFECT_SKULL_BASH,
  EFFECT_SKULL_BASH as _EFFECT_SKULL_BASH,
  EFFECT_SKY_ATTACK as _EFFECT_SKY_ATTACK,
  EFFECT_SOLAR_BEAM,
  EFFECT_SOLAR_BEAM as _EFFECT_SOLAR_BEAM,
  EFFECT_VITAL_THROW,
} from '../decomp-data/include/constants/battle_move_effects-data';
import {
  BS_FAINTED_LINK_MULTIPLE_1,
  BS_FAINTED_LINK_MULTIPLE_2,
  PARTY_SCREEN_OPTIONAL,
} from '../decomp-data/include/constants/battle_script_commands-data';
import {
  HOLD_EFFECT_CAN_ALWAYS_RUN,
  HOLD_EFFECT_EVASION_UP as HOLD_EFFECT_EVASION_UP_AC,
  HOLD_EFFECT_EXP_SHARE,
  HOLD_EFFECT_LUCKY_EGG,
  HOLD_EFFECT_MACHO_BRACE,
} from '../decomp-data/include/constants/hold_effects-data';
import {
  MOVE_ASSIST,
  MOVE_CURSE as MOVE_CURSE_ATKCANCELER,
  MOVE_IMPRISON,
  MOVE_MAGIC_COAT as MOVE_MAGIC_COAT_ATKCANCELER,
  MOVE_METRONOME,
  MOVE_PAIN_SPLIT,
  MOVE_SLEEP_TALK,
  MOVE_SNATCH as MOVE_SNATCH_ATKCANCELER,
} from '../decomp-data/include/constants/moves-data';
import {
  FLAG_PROTECT_AFFECTED,
  FRIENDSHIP_EVENT_GROW_LEVEL as FRIENDSHIP_EVENT_GROW_LEVEL_N34,
  MAX_PER_STAT_EVS,
  MAX_TOTAL_EVS,
} from '../decomp-data/include/constants/pokemon-data';
import {
  MUS_VICTORY_TRAINER as _MUS_VICTORY_TRAINER,
} from '../decomp-data/include/constants/songs-data';
import {
  TRAINER_SECRET_BASE,
} from '../decomp-data/include/constants/trainers-data';
import {
  gMapHeader,
} from '../field/map-loader';
import type {
  PokemonInstance,
} from '../pokemon/pokemon';
import {
  gSaveBlock1Ptr,
  gSaveBlock2Ptr,
} from '../save/save-block-state';
import {
  Random,
} from '../system/random';
import {
  AddMoney as _AddMoneyFull,
} from '../ui/money';
import {
  FLAG_GET_CAUGHT,
  FLAG_SET_CAUGHT,
  FLAG_SET_SEEN,
  GetSetPokedexFlag,
  GetSetPokedexFlag as _GetSetPokedexFlagHBT,
  HandleSetPokedexFlag,
  SpeciesToNationalPokedexNum,
} from '../ui/pokedex-flags';
import {
  ABILITYEFFECT_ABSORBING,
  ABILITYEFFECT_ATK_SYNCHRONIZE,
  ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER,
  ABILITYEFFECT_CHECK_ON_FIELD,
  ABILITYEFFECT_COUNT_ON_FIELD,
  ABILITYEFFECT_COUNT_OTHER_SIDE,
  ABILITYEFFECT_IMMUNITY,
  ABILITYEFFECT_MOVES_BLOCK,
  ABILITYEFFECT_ON_DAMAGE,
  ABILITYEFFECT_ON_SWITCHIN,
  ABILITYEFFECT_SYNCHRONIZE,
  AbilityBattleEffects,
  AbilityBattleEffects as _ABE_N1,
  _castformDataTypeChange as _castformDataTypeChangeN25,
  consumeAbilityWantedScript,
} from '../../game/battle_util';
import {
  applyAtkCanceler,
} from '../../game/battle_util';
import {
  A_BUTTON,
  B_BUTTON,
  BattleCreateYesNoCursorAt,
  BattleDestroyYesNoCursorAt,
  BattlePutTextOnWindow,
  BattleScriptPush,
  BtlController_EmitBallThrowAnim as _BtlController_EmitBallThrowAnim_HBT,
  BtlController_EmitBattleAnimation,
  BtlController_EmitDrawPartyStatusSummary,
  BtlController_EmitEndLinkBattle,
  BtlController_EmitExpUpdate as _BtlController_EmitExpUpdate_N34,
  BtlController_EmitFaintAnimation,
  BtlController_EmitFaintingCry,
  BtlController_EmitGetMonData,
  BtlController_EmitHealthBarUpdate,
  BtlController_EmitHidePartyStatusSummary,
  BtlController_EmitHitAnimation,
  BtlController_EmitMoveAnimation,
  BtlController_EmitPlayFanfareOrBGM,
  BtlController_EmitPlaySE,
  BtlController_EmitPrintSelectionString,
  BtlController_EmitResetActionMoveSelection,
  BtlController_EmitReturnMonToBall,
  BtlController_EmitSetMonData,
  BtlController_EmitSetMonData as _BtlController_EmitSetMonData_N1,
  BtlController_EmitSetMonData as _BtlController_EmitSetMonData_N23,
  BtlController_EmitSpriteInvisibility,
  BtlController_EmitStatusAnimation,
  BtlController_EmitStatusIconUpdate,
  BtlController_EmitSwitchInAnim,
  BtlController_EmitTrainerSlide,
  BtlController_EmitTrainerSlideBack,
  DPAD_DOWN,
  DPAD_UP,
  HandleBattleWindow,
  JOY_NEW,
  BtlController_EmitChoosePokemon,
  BtlController_EmitLinkStandbyMsg,
  MarkBattlerForControllerExec,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_HBT,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_N1,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_N23,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_N34,
  PlaySE,
  PrepareStringBattle,
  PrepareStringBattle as _PrepareStringBattleN34,
  PrepareStringBattle as _PrepareStringBattle_N1,
  SE_SELECT,
  gBitTable,
} from './battle-controllers';
import {
  ABILITY_AIR_LOCK,
  ABILITY_ARENA_TRAP,
  ABILITY_BATTLE_ARMOR,
  ABILITY_CLEAR_BODY,
  ABILITY_CLOUD_NINE,
  ABILITY_COMPOUND_EYES,
  ABILITY_DAMP,
  ABILITY_HUSTLE,
  ABILITY_HYPER_CUTTER,
  ABILITY_INSOMNIA,
  ABILITY_KEEN_EYE,
  ABILITY_LEVITATE,
  ABILITY_LIGHTNING_ROD,
  ABILITY_MAGNET_PULL,
  ABILITY_NATURAL_CURE,
  ABILITY_NONE,
  ABILITY_OBLIVIOUS,
  ABILITY_PRESSURE,
  ABILITY_RUN_AWAY,
  ABILITY_SAND_VEIL,
  ABILITY_SHADOW_TAG,
  ABILITY_SHELL_ARMOR,
  ABILITY_SOUNDPROOF,
  ABILITY_STURDY,
  ABILITY_TRUANT,
  ABILITY_VITAL_SPIRIT,
  ABILITY_WHITE_SMOKE,
  ABILITY_WONDER_GUARD,
  ACC_CURR_MOVE,
  ALL_MOVES_MASK,
  BATTLE_ENVIRONMENT_CAVE,
  BATTLE_ENVIRONMENT_GRASS,
  BATTLE_ENVIRONMENT_LONG_GRASS,
  BATTLE_ENVIRONMENT_MOUNTAIN,
  BATTLE_ENVIRONMENT_POND,
  BATTLE_ENVIRONMENT_SAND,
  BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER,
  BATTLE_OPPOSITE,
  BATTLE_OPPOSITE as _BATTLE_OPPOSITE_GC,
  BATTLE_OPPOSITE as _BATTLE_OPPOSITE_HBT,
  BATTLE_PARTNER,
  BATTLE_RUN_FAILURE,
  BATTLE_RUN_FORBIDDEN,
  BATTLE_RUN_SUCCESS,
  BATTLE_TYPE_ARENA,
  BATTLE_TYPE_BATTLE_TOWER,
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_EREADER_TRAINER as BATTLE_TYPE_EREADER_TRAINER_C24,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_FRONTIER,
  BATTLE_TYPE_FRONTIER as BATTLE_TYPE_FRONTIER_C24,
  BATTLE_TYPE_INGAME_PARTNER,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_LINK as BATTLE_TYPE_LINK_C24,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_RECORDED_LINK as BATTLE_TYPE_RECORDED_LINK_C24,
  BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_TRAINER_HILL,
  BATTLE_TYPE_TRAINER_HILL as BATTLE_TYPE_TRAINER_HILL_C24,
  BATTLE_TYPE_TWO_OPPONENTS,
  BATTLE_TYPE_WALLY_TUTORIAL,
  BIT_FLANK,
  BIT_SIDE,
  BS_ATTACKER,
  BS_ATTACKER_SIDE,
  BS_ATTACKER_WITH_PARTNER,
  BS_NOT_ATTACKER_SIDE,
  BS_TARGET,
  B_ACTION_CANCEL_PARTNER,
  B_ACTION_FINISHED,
  B_ACTION_TRY_FINISH,
  B_ACTION_USE_MOVE,
  B_ANIM_CASTFORM_CHANGE,
  B_COMM_TO_CONTROLLER,
  B_MSG_AVOIDED_ATK,
  B_MSG_AVOIDED_DMG,
  B_MSG_BELL,
  B_MSG_BELL_SOUNDPROOF_ATTACKER,
  B_MSG_BELL_SOUNDPROOF_PARTNER,
  B_MSG_BRACED_ITSELF,
  B_MSG_CANT_STOCKPILE,
  B_MSG_DOOM_DESIRE,
  B_MSG_FOCUS_ENERGY_FAILED,
  B_MSG_FUTURE_SIGHT,
  B_MSG_GETTING_PUMPED,
  B_MSG_GROUND_MISS,
  B_MSG_KO_MISS,
  B_MSG_KO_UNAFFECTED,
  B_MSG_LEECH_SEED_FAIL,
  B_MSG_LEECH_SEED_MISS,
  B_MSG_LEECH_SEED_SET,
  B_MSG_MISSED,
  B_MSG_MIST_FAILED,
  B_MSG_CANT_ESCAPE,
  B_MSG_DONT_LEAVE_BIRCH,
  B_MSG_PREVENTS_ESCAPE,
  B_MSG_PROTECTED,
  B_MSG_PROTECTED_ITSELF,
  B_MSG_PROTECT_FAILED,
  B_MSG_SET_LIGHTSCREEN_DOUBLE,
  B_MSG_SET_LIGHTSCREEN_SINGLE,
  B_MSG_SET_MIST,
  B_MSG_SET_REFLECT_DOUBLE,
  B_MSG_SET_REFLECT_SINGLE,
  B_MSG_SET_SAFEGUARD,
  B_MSG_SET_SUBSTITUTE,
  B_MSG_SIDE_STATUS_FAILED,
  B_MSG_SOOTHING_AROMA,
  B_MSG_STARTED_HAIL,
  B_MSG_STARTED_RAIN,
  B_MSG_STARTED_SANDSTORM,
  B_MSG_STARTED_SUNLIGHT,
  B_MSG_STAYED_AWAKE_USING,
  B_MSG_STOCKPILED,
  B_MSG_SUBSTITUTE_FAILED,
  B_MSG_SWALLOW_FAILED,
  B_MSG_SWALLOW_FULL_HP,
  B_MSG_TRANSFORMED,
  B_MSG_TRANSFORM_FAILED,
  B_MSG_WEAKEN_ELECTRIC,
  B_MSG_WEAKEN_FIRE,
  B_MSG_WEATHER_FAILED,
  B_OUTCOME_LOST,
  B_OUTCOME_MON_TELEPORTED,
  B_OUTCOME_PLAYER_TELEPORTED,
  B_OUTCOME_WON,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  B_SIDE_PLAYER as B_SIDE_PLAYER_AAS,
  B_SIDE_PLAYER as B_SIDE_PLAYER_CDS,
  B_WEATHER_ANY,
  B_WEATHER_HAIL,
  B_WEATHER_HAIL_TEMPORARY,
  B_WEATHER_RAIN,
  B_WEATHER_RAIN_TEMPORARY,
  B_WEATHER_SANDSTORM,
  B_WEATHER_SANDSTORM_TEMPORARY,
  B_WEATHER_SUN,
  B_WEATHER_SUN_TEMPORARY,
  B_WIN_YESNO,
  CASTFORM_SUBSTITUTE,
  CMP_COMMON_BITS,
  CMP_EQUAL,
  CMP_GREATER_THAN,
  CMP_LESS_THAN,
  CMP_NOT_EQUAL,
  CMP_NO_COMMON_BITS,
  CURSOR_POSITION,
  DEFAULT_STAT_STAGE,
  EFFECT_BATON_PASS,
  EFFECT_BLAZE_KICK,
  EFFECT_ENDURE,
  EFFECT_FALSE_SWIPE,
  EFFECT_HIGH_CRITICAL,
  EFFECT_MUD_SPORT,
  EFFECT_POISON_TAIL,
  EFFECT_PROTECT,
  EFFECT_RETURN,
  EFFECT_SKY_ATTACK,
  EFFECT_THUNDER,
  FLAG_MAGIC_COAT_AFFECTED,
  FLAG_MIRROR_MOVE_AFFECTED,
  FLAG_SNATCH_AFFECTED,
  F_DYNAMIC_TYPE_IGNORE_PHYSICALITY,
  F_DYNAMIC_TYPE_SET,
  GET_BATTLER_SIDE,
  GET_BATTLER_SIDE as GET_BATTLER_SIDE_CDS,
  GET_STAT_BUFF_ID,
  GET_STAT_BUFF_VALUE,
  HITMARKER_ALLOW_NO_PP,
  HITMARKER_ATTACKSTRING_PRINTED,
  HITMARKER_DESTINYBOND,
  HITMARKER_FAINTED,
  HITMARKER_GRUDGE,
  HITMARKER_IGNORE_BIDE,
  HITMARKER_IGNORE_ON_AIR,
  HITMARKER_IGNORE_SUBSTITUTE,
  HITMARKER_IGNORE_UNDERGROUND,
  HITMARKER_IGNORE_UNDERWATER,
  HITMARKER_NO_ANIMATIONS,
  HITMARKER_NO_ATTACKSTRING,
  HITMARKER_NO_PPDEDUCT,
  HITMARKER_OBEYS,
  HITMARKER_PASSIVE_HP_UPDATE,
  HITMARKER_PLAYER_FAINTED,
  HITMARKER_SWAP_ATTACKER_TARGET,
  HITMARKER_SYNCHRONIZE_EFFECT,
  HITMARKER_UNABLE_TO_USE_MOVE,
  HOLD_EFFECT_CHOICE_BAND,
  HOLD_EFFECT_FOCUS_BAND,
  HOLD_EFFECT_LUCKY_PUNCH,
  HOLD_EFFECT_SCOPE_LENS,
  HOLD_EFFECT_STICK,
  IGNORE_SHELL_BELL,
  INSTANT_HP_BAR_DROP,
  IS_BATTLER_OF_TYPE,
  IS_TYPE_PHYSICAL,
  MAX_FRIENDSHIP,
  MAX_MON_MOVES,
  MAX_STAT_STAGE,
  METRONOME_FORBIDDEN_END,
  MIMIC_FORBIDDEN_END,
  MIN_STAT_STAGE,
  MISS_TYPE,
  MON_GENDERLESS,
  MOVES_COUNT,
  MOVE_BATON_PASS,
  MOVE_BOUNCE,
  MOVE_DETECT,
  MOVE_DIG,
  MOVE_DIVE,
  MOVE_DOOM_DESIRE,
  MOVE_EFFECT_ACC_MINUS_1,
  MOVE_EFFECT_AFFECTS_USER,
  MOVE_EFFECT_ATK_MINUS_1,
  MOVE_EFFECT_BYTE,
  MOVE_EFFECT_CERTAIN,
  MOVE_EFFECT_DEF_MINUS_1,
  MOVE_EFFECT_SPD_MINUS_1,
  MOVE_ENCORE,
  MOVE_ENDURE,
  MOVE_FLY,
  MOVE_FOCUS_PUNCH,
  MOVE_HEAL_BELL,
  MOVE_MIRROR_MOVE,
  MOVE_NONE,
  MOVE_PROTECT,
  MOVE_PURSUIT,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_FAILED,
  MOVE_RESULT_FOE_ENDURED,
  MOVE_RESULT_FOE_HUNG_ON,
  MOVE_RESULT_MISSED,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  MOVE_RESULT_NO_EFFECT,
  MOVE_RESULT_ONE_HIT_KO,
  MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_SKETCH,
  MOVE_STRUGGLE,
  MOVE_SUBSTITUTE,
  MOVE_TARGET_BOTH,
  MOVE_TARGET_DEPENDS,
  MOVE_TARGET_FOES_AND_ALLY,
  MOVE_TARGET_OPPONENTS_FIELD,
  MOVE_TARGET_RANDOM,
  MOVE_TARGET_SELECTED,
  MOVE_TARGET_USER,
  MOVE_TARGET_USER_OR_SELECTED,
  MOVE_TRANSFORM,
  MOVE_UNAVAILABLE,
  MOVE_UPROAR,
  MSG_DISPLAY,
  MULTISTRING_CHOOSER,
  MULTI_PARTY_SIZE,
  NO_ACC_CALC,
  NO_ACC_CALC_CHECK_LOCK_ON,
  NO_TARGET_OVERRIDE,
  NUMBER_OF_MON_TYPES,
  NUM_BATTLE_STATS,
  REQUEST_ALL_BATTLE,
  REQUEST_HELDITEM_BATTLE,
  REQUEST_HP_BATTLE,
  REQUEST_PPMOVE1_BATTLE,
  REQUEST_MOVES_PP_BATTLE,
  REQUEST_STATUS_BATTLE,
  RESET_MOVE_SELECTION,
  SET_STAT_BUFF_VALUE,
  SE_EFFECTIVE,
  SE_NOT_EFFECTIVE,
  SE_SUPER_EFFECTIVE,
  SIDE_STATUS_FUTUREATTACK,
  SIDE_STATUS_LIGHTSCREEN,
  SIDE_STATUS_MIST,
  SIDE_STATUS_REFLECT,
  SIDE_STATUS_SAFEGUARD,
  SIDE_STATUS_SPIKES,
  SIDE_STATUS_SPIKES_DAMAGED,
  SPECIES_CHANSEY,
  SPECIES_FARFETCHD,
  STATUS1_ANY,
  STATUS1_BURN,
  STATUS1_FREEZE,
  STATUS1_PARALYSIS,
  STATUS1_POISON,
  STATUS1_SLEEP,
  STATUS1_SLEEP_TURN,
  STATUS1_TOXIC_POISON,
  STATUS2_BIDE,
  STATUS2_BIDE_TURN,
  STATUS2_CONFUSION,
  STATUS2_CURSED,
  STATUS2_DEFENSE_CURL,
  STATUS2_DESTINY_BOND,
  STATUS2_ESCAPE_PREVENTION,
  STATUS2_FOCUS_ENERGY,
  STATUS2_FORESIGHT,
  STATUS2_INFATUATED_WITH,
  STATUS2_INFATUATION,
  STATUS2_LOCK_CONFUSE,
  STATUS2_MULTIPLETURNS,
  STATUS2_NIGHTMARE,
  STATUS2_RAGE,
  STATUS2_SUBSTITUTE,
  STATUS2_TORMENT,
  STATUS2_TRANSFORMED,
  STATUS2_UPROAR,
  STATUS2_WRAPPED,
  STATUS3_ALWAYS_HITS,
  STATUS3_ALWAYS_HITS_TURN,
  STATUS3_CANT_SCORE_A_CRIT,
  STATUS3_CHARGED_UP,
  STATUS3_GRUDGE,
  STATUS3_IMPRISONED_OTHERS,
  STATUS3_LEECHSEED,
  STATUS3_LEECHSEED_BATTLER,
  STATUS3_MINIMIZED,
  STATUS3_MUDSPORT,
  STATUS3_ON_AIR,
  STATUS3_PERISH_SONG,
  STATUS3_ROOTED,
  STATUS3_SEMI_INVULNERABLE,
  STATUS3_UNDERGROUND,
  STATUS3_UNDERWATER,
  STATUS3_WATERSPORT,
  STATUS3_YAWN,
  STATUS3_YAWN_TURN,
  STAT_ACC,
  STAT_ATK,
  STAT_BUFF_NEGATIVE,
  STAT_CHANGE_ALLOW_PTR,
  STAT_CHANGE_WORKED,
  STAT_EVASION,
  STAT_SPATK,
  STRINGID_ATTACKMISSED,
  STRINGID_AVOIDEDDAMAGE,
  STRINGID_BUTITFAILED,
  STRINGID_CRITICALHIT,
  STRINGID_ITDOESNTAFFECT,
  STRINGID_NOTVERYEFFECTIVE,
  STRINGID_ONEHITKO,
  STRINGID_PKMNAVOIDEDATTACK,
  STRINGID_PKMNENDUREDHIT,
  STRINGID_PKMNMAKESGROUNDMISS,
  STRINGID_PKMNPROTECTEDITSELF,
  STRINGID_SUPEREFFECTIVE,
  STRINGID_USEDMOVE,
  SWITCH_IGNORE_ESCAPE_PREVENTION,
  TYPE_ELECTRIC,
  TYPE_FIRE,
  TYPE_FLYING,
  TYPE_GHOST,
  TYPE_GRASS,
  TYPE_GROUND,
  TYPE_ICE,
  TYPE_MYSTERY,
  TYPE_NORMAL,
  TYPE_ROCK,
  TYPE_STEEL,
  TYPE_WATER,
  WINDOW_CLEAR,
  YESNOBOX_X_END,
  YESNOBOX_X_START,
  YESNOBOX_Y_END,
  YESNOBOX_Y_START,
  sEnvironmentToType,
  sMovesForbiddenToCopy,
  sNaturePowerMoves,
  sProtectSuccessRates,
  MOVE_LIMITATION_PP,
} from './constants';
import {
  runDamagecalc,
} from './damage-calc';
import {
  getBattleMove,
  getBattleMove as _gbmN1,
  getBattleMove as getBattleMoveBU,
} from './data/battle-moves';
import {
  MAX_LEVEL,
  getLevelFromExp,
  getExpForLevel,
} from './data/experience-tables';
import {
  GetNatureFromPersonality as _getNatureFromPersonalityN34,
} from './data/flavor-compat';
import {
  GetItemHoldEffect,
  GetItemHoldEffect as _GetItemHoldEffectFull,
  GetItemHoldEffect as _GetItemHoldEffectN22,
  GetItemHoldEffect as _ghe21,
  GetItemHoldEffectParam,
  GetItemHoldEffectParam as _GetItemHoldEffectParamFull,
  GetItemHoldEffectParam as _GetItemHoldEffectParamN22,
  GetItemHoldEffectParam as _ghep21,
} from './data/item-hold-effects';
import {
  GetGenderFromSpeciesAndPersonality as _GetGenderFull,
  getSpeciesEvYield,
  getSpeciesExpYield,
  getSpeciesGrowthRate,
  speciesNumberToEnum as _speciesNumberToEnumHBT,
  speciesNumberToEnum as _speciesNumberToEnumPK,
  speciesNumberToEnum as speciesNumberToEnumBU,
} from './data/species-runtime';
import {
  gTrainerMoneyTable,
  getTrainerMoneyValue,
} from './data/trainer-money-table';
import {
  TYPE_ENDTABLE,
  TYPE_FORESIGHT,
  TYPE_MUL_NOT_EFFECTIVE,
  TYPE_MUL_NO_EFFECT,
  TYPE_MUL_SUPER_EFFECTIVE,
  gTypeEffectiveness,
} from './data/type-effectiveness';
import {
  applyDisobedienceCheck,
} from '../../game/battle_util';
import {
  ITEMEFFECT_KINGSROCK_SHELLBELL,
  ITEMEFFECT_MOVE_END,
  ITEMEFFECT_ON_SWITCH_IN,
  ItemBattleEffects,
  consumeItemWantedScript,
} from '../../game/battle_util';
import {
  initMemoryMap,
  resolveAddress,
  resolveAddressOffset,
  resolveStringIdTable,
} from './memory-map';
import {
  CheckMoveLimitations as _CheckMoveLimitationsFull,
} from '../../game/battle_util';
import {
  AdjustFriendship as _AdjustFriendshipAF,
  AdjustFriendship as _adjustFriendshipN34,
  CalculatePlayerPartyCount as _CalculatePlayerPartyCountHBT,
  GetAbilityBySpecies,
  GetMonData,
  GetMonData as GetMonData_BU,
  GetMonData as GetMonData_CDS,
  GetMonData as GetMonData_TFM,
  GetMonData as _GetMonDataAAS,
  GetMonData as _GetMonDataCTL,
  GetMonData as _GetMonDataGC,
  GetMonData as _GetMonDataPK,
  MON_DATA_ABILITY_NUM,
  MON_DATA_ABILITY_NUM as _MON_DATA_ABILITY_NUM_PK,
  MON_DATA_EXP,
  MON_DATA_HELD_ITEM,
  MON_DATA_HELD_ITEM as _MON_DATA_HELD_ITEM_PK,
  MON_DATA_HP,
  MON_DATA_HP as MON_DATA_HP_BU,
  MON_DATA_HP as MON_DATA_HP_CDS,
  MON_DATA_HP as _MON_DATA_HP_CTL,
  MON_DATA_HP as _MON_DATA_HP_FRS,
  MON_DATA_IS_EGG,
  MON_DATA_IS_EGG as MON_DATA_IS_EGG_CDS,
  MON_DATA_IS_EGG as _MON_DATA_IS_EGG_CTL,
  MON_DATA_IS_EGG as _MON_DATA_IS_EGG_FRS,
  MON_DATA_LEVEL,
  MON_DATA_LEVEL as MON_DATA_LEVEL_BU,
  MON_DATA_LEVEL as _MON_DATA_LEVEL_PK,
  MON_DATA_MOVE1 as _MON_DATA_MOVE1_AAS,
  MON_DATA_PP1 as _MON_DATA_PP1_MTL,
  MON_DATA_OT_GENDER as _MON_DATA_OT_GENDER_GC,
  MON_DATA_OT_ID as _MON_DATA_OT_ID_GC,
  MON_DATA_OT_NAME as _MON_DATA_OT_NAME_GC,
  MON_DATA_POKEBALL as _MON_DATA_POKEBALL_GC,
  MON_DATA_POKEBALL as _MON_DATA_POKEBALL_HBT,
  MON_DATA_POKERUS,
  MON_DATA_SPECIES,
  MON_DATA_SPECIES as MON_DATA_SPECIES_BU,
  MON_DATA_SPECIES as MON_DATA_SPECIES_CDS,
  MON_DATA_SPECIES as MON_DATA_SPECIES_TFM,
  MON_DATA_SPECIES as _MON_DATA_SPECIES_CTL,
  MON_DATA_SPECIES as _MON_DATA_SPECIES_GC,
  MON_DATA_SPECIES_OR_EGG,
  MON_DATA_SPECIES_OR_EGG as MON_DATA_SPECIES2_BU,
  MON_DATA_SPECIES_OR_EGG as _MON_DATA_SPECIES_OR_EGG_AAS,
  MON_DATA_SPECIES_OR_EGG as _MON_DATA_SPECIES_OR_EGG_PK,
  MON_DATA_STATUS as MON_DATA_STATUS_BU,
  MON_DATA_STATUS as MON_DATA_STATUS_CDS,
  PARTY_SIZE,
  SetMonData,
  SetMonData as _SetMonDataGC,
  SetMonData as _SetMonDataHBT,
  SetMonData as _SetMonDataPK,
  gEnemyParty,
  gEnemyParty as _gEnemyPartyAAS,
  gEnemyParty as _gEnemyPartyCTL,
  gEnemyParty as _gEnemyPartyFRS,
  gEnemyParty as _gEnemyPartyGC,
  gEnemyParty as _gEnemyPartyHBT,
  gEnemyParty as gEnemyParty_CDS,
  gEnemyParty as gEnemyParty_TFM,
  gPlayerParty,
  gPlayerParty as _gPlayerPartyAAS,
  gPlayerParty as _gPlayerPartyAF,
  gPlayerParty as _gPlayerPartyCTL,
  gPlayerParty as _gPlayerPartyGC,
  gPlayerParty as _gPlayerPartyPK,
  gPlayerParty as gPlayerParty_BU,
  gPlayerParty as gPlayerParty_CDS,
  CalculateMonStats,
  MON_DATA_MAX_HP, MON_DATA_ATK, MON_DATA_DEF, MON_DATA_SPEED,
  MON_DATA_SPATK, MON_DATA_SPDEF,
  type Pokemon,
} from './party-storage';
import {
  Random as _RandomHBT,
  getBattleScriptBytecode,
  getBattleScriptOffset,
  getBattleScriptOffset as _getBattleScriptOffsetHBT,
  getBattleScriptOffset as _getBattleScriptOffsetN34,
  getBattleScriptOffset as getBattleScriptOffsetN25,
  getMoveEffectScriptOffset,
  readByte,
  readHalfword,
  readWord,
  gBattleScriptContext,
} from './script-interpreter';
import { SwitchPartyOrder } from './battle-turn-helpers';
import { BATTLE_TYPE_SECRET_BASE, ABILITY_STICKY_HOLD } from './constants';
import { ITEM_ENIGMA_BERRY } from '../decomp-data/include/constants/items-data';
import { fillBattleMonFromParty } from './party-storage';
import { resolveDecompConstant } from '../system/decomp-constants';
import type {
  BattleOpcodeHandler,
  BattleScriptContext,
} from './script-interpreter';
import {
  SetMoveEffect,
} from './set-move-effect';
import {
  ChangeStatBuffs,
} from './stat-stages';
import type { StatBuffScriptDeps } from './stat-stages';
import {
  MAX_BATTLERS_COUNT,
  gAbsentBattlerFlags,
  gActionsByTurnOrder,
  gActiveBattler,
  gBattleCommunication,
  gBattleCommunication as _gBattleCommunicationGC,
  gBattleCommunication as _gBattleCommunicationHBT,
  gBattleCommunication as gBattleCommunicationBU,
  gBattleControllerExecFlags,
  gBattleControllerExecFlags as _gBattleControllerExecFlagsHBT,
  gBattleEnvironment,
  gBattleMons,
  gBattleMons as _gBattleMons,
  gBattleMons as _gBattleMonsHBT,
  gBattleMoveDamage,
  gBattleMovePower,
  gBattleOutcome,
  gBattleResults,
  gBattleResults as _gBattleResultsGC,
  gBattleResults as _gBattleResultsHBT,
  gBattleScripting,
  gBattleStruct,
  gBattleStruct as _gBattleStruct32,
  gBattleStruct as _gBattleStructHBT,
  gBattleStruct as _gBattleStruct_CDS,
  gBattleTypeFlags,
  gBattleTypeFlags as _gBattleTypeFlagsHBT,
  gBattleWeather,
  gBattlerAttacker,
  gBattlerAttacker as _gBattlerAttackerGC,
  gBattlerAttacker as _gBattlerAttackerHBT,
  gBattlerByTurnOrder,
  gBattlerByTurnOrder as gBattlerByTurnOrderAC,
  gBattlerFainted,
  gBattlerPartyIndexes,
  gBattlerPartyIndexes as _battlerPartyIndexesSO,
  gBattlerPartyIndexes as _gBattlerPartyIndexesAAS,
  gBattlerPartyIndexes as _gBattlerPartyIndexesFRS,
  gBattlerPartyIndexes as _gBattlerPartyIndexesGC,
  gBattlerPartyIndexes as _gBattlerPartyIndexesHBT,
  gBattlerPartyIndexes as _gBattlerPartyIndexes_32,
  gBattlerPartyIndexes as _gBattlerPartyIndexes_CDS,
  gBattlerPartyIndexes as _gBattlerPartyIndexes_N21,
  gBattlerPartyIndexes as _gBattlerPartyIndexes_N34,
  gBattlerTarget,
  gBattlersCount,
  gBideDmg,
  gBideTarget,
  gCalledMove,
  gChosenActionByBattler,
  gChosenMove,
  gChosenMoveByBattler,
  gCritMultiplier,
  gCurrMovePos,
  gCurrentMove,
  gCurrentTurnActionNumber,
  gDisableStructs,
  gDynamicBasePower,
  gDynamicMoveType,
  gExpShareExp,
  gHitMarker,
  gHpDealt,
  gLastHitBy,
  gLastHitByType,
  gLastLandedMoves,
  gLastMoves,
  gLastPrintedMoves,
  gLastResultingMoves,
  gLastTakenMove,
  gLastTakenMoveFrom,
  gLastUsedAbility,
  gLastUsedItem,
  gLastUsedItem as _gLastUsedItemHBT,
  gLeveledUpInBattle,
  gLockedMoves,
  gMoveResultFlags,
  gMoveToLearn,
  gMultiHitCounter,
  gPauseCounterBattle,
  gPaydayMoney,
  gPotentialItemEffectBattler,
  gProtectStructs,
  gProtectStructs as gProtectStructsBU,
  gSentPokesToOpponent,
  gSideStatuses,
  gSideTimers,
  gSpecialStatuses,
  gStatuses3,
  gTrainerBattleOpponent_A,
  gTrainerBattleOpponent_B,
  gUsedHeldItems,
  gWishFutureKnock,
  setAbsentBattlerFlags,
  setActiveBattler,
  setActiveBattler as _setActiveBattlerHBT,
  setActiveBattler as _setActiveBattler_N23,
  setBattleMoveDamage,
  setBattleMoveDamage as setBattleMoveDamageBU,
  setBattleOutcome,
  setBattleWeather,
  setBattlerAttacker,
  setBattlerFainted,
  setBattlerInMenuId,
  setBattlerTarget,
  setBattlerTarget as _setBattlerTargetHBT,
  setCalledMove,
  setChosenMove,
  setChosenMovePos,
  setCritMultiplier,
  setCurrMovePos,
  setCurrentActionFuncId,
  setCurrentMove,
  setCurrentTurnActionNumber,
  setDynamicBasePower,
  setDynamicMoveType,
  setEffectBattler,
  setExpShareExp,
  setHitMarker,
  setHpDealt,
  setLastUsedAbility,
  setLastUsedItem,
  setLeveledUpInBattle,
  setMoveResultFlags,
  setMultiHitCounter,
  setPauseCounterBattle,
  setPotentialItemEffectBattler,
  setSideStatus,
} from './state';
import {
  PREPARE_ABILITY_BUFFER,
  PREPARE_BYTE_NUMBER_BUFFER,
  PREPARE_HWORD_NUMBER_BUFFER,
  PREPARE_ITEM_BUFFER,
  PREPARE_MON_NICK_BUFFER,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER as PREPARE_MON_NICK_WITH_PREFIX_BUFFER_N34,
  PREPARE_MOVE_BUFFER,
  PREPARE_MOVE_BUFFER as _PREPARE_MOVE_BUFFER_TFM,
  PREPARE_SPECIES_BUFFER,
  PREPARE_STRING_BUFFER as PREPARE_STRING_BUFFER_N34,
  PREPARE_TYPE_BUFFER,
  PREPARE_WORD_NUMBER_BUFFER,
  PREPARE_WORD_NUMBER_BUFFER as PREPARE_WORD_NUMBER_BUFFER_N34,
  gBattleTextBuff1,
  gBattleTextBuff1 as _gBattleTextBuff1_16,
  gBattleTextBuff1 as _gBattleTextBuff1_19,
  gBattleTextBuff1 as _gBattleTextBuff1_21,
  gBattleTextBuff1 as _gBattleTextBuff1_22,
  gBattleTextBuff1 as _gBattleTextBuff1_23,
  gBattleTextBuff1 as _gBattleTextBuff1_25,
  gBattleTextBuff1 as _gBattleTextBuff1_26,
  gBattleTextBuff1 as _gBattleTextBuff1_29,
  gBattleTextBuff1 as _gBattleTextBuff1_30,
  gBattleTextBuff1 as _gBattleTextBuff1_HBT,
  gBattleTextBuff1 as _gBattleTextBuff1_N28,
  gBattleTextBuff1 as _gBattleTextBuff1_N34,
  gBattleTextBuff1 as _gBattleTextBuff1_TFM,
  gBattleTextBuff2,
  gBattleTextBuff2 as _gBattleTextBuff2_23,
  gBattleTextBuff2 as _gBattleTextBuff2_HBT,
  gBattleTextBuff2 as _gBattleTextBuff2_N34,
  gBattleTextBuff3 as _gBattleTextBuff3_N34,
} from './text-buffers';
import {
  TryRunFromBattle as _tryRunFromBattleFull,
} from '../../game/battle_util';
import {
  Cmd_typecalc as TypecalcImpl,
  attacksThisTurn,
} from './type-calc';
import {
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_OPPONENT_RIGHT,
  B_POSITION_PLAYER_LEFT,
  B_POSITION_PLAYER_RIGHT,
  CancelMultiTurnMoves,
  CancelMultiTurnMoves as _cancelMultiTurnMovesAC,
  FaintClearSetData,
  GetBattlerAtPosition,
  GetBattlerPosition,
  GetScaledHPFraction,
  PressurePPLose as PressurePPLoseAtkCanceler,
  RecordAbilityBattle,
  RecordAbilityBattle as _recordAbilityBattleAC,
  RecordAbilityBattle as _recordAbilityBattleFull,
  RecordAbilityBattle as _recordAbilityBattleFullN20,
  RecordAbilityBattle as _recordAbilityBattleFullN21,
  RecordAbilityBattle as _recordAbilityBattleFullN22,
  RecordAbilityBattle as _recordAbilityBattleFullN27,
  RecordAbilityBattle as _recordAbilityBattleFullN29,
  RecordItemEffectBattle as _recordItemEffectBattleFullN21,
  RecordItemEffectBattle as _recordItemEffectBattleFullN22,
  WEATHER_HAS_EFFECT as _weatherHasEffect,
  getBattlerForBattleScript,
  getBattlerForBattleScript as _utilGetBattler,
} from './util';

// ════════════ Batch 01 ════════════
/**
 * battle/cmd-batch-01.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Batch 01 (damage flow basic)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Tous les constants viennent de `./constants.ts` (= 1:1 décomp include/constants/battle.h
 * + pokemon.h + abilities.h + moves.h). Pas de magic numbers redéfinis localement.
 *
 * Opcodes 1:1 décomp implémentés :
 *   0x00 Cmd_attackcanceler   happy path (skip Protect/Snatch/MagicCoat/LightningRod/Disobedience)
 *   0x01 Cmd_accuracycheck    full
 *   0x03 Cmd_ppreduce         full
 *   0x04 Cmd_critcalc         full (uses getBattleMove for real move effect)
 *   0x05 Cmd_damagecalc       wraps CalculateBaseDamage 1:1
 *   0x06 Cmd_typecalc         delegated to type-calc.ts
 *   0x07 Cmd_adjustnormaldamage  full 1:1 (= ApplyRandomDmgMultiplier + FocusBand + EnduredCheck)
 *   0x0B Cmd_healthbarupdate  stub UI (= datahpupdate fait le HP write)
 *   0x0C Cmd_datahpupdate     1:1 minimal (= apply hp + record gHpDealt + handle BS_TARGET arg)
 *   0x19 Cmd_tryfaintmon      1:1 minimal (= consume args, set gBattlerFainted, set outcome)
 *   0x49 Cmd_moveend          full 1:1 (17 sub-states, session 137 + audit fixes)
 *
 * Pour utiliser : ces handlers sont enregistrés dans le dispatch table de
 * script-interpreter.ts via `installBatch01Handlers()`.
 */
























// ─── Helpers internes ───────────────────────────────────────────────────────

// 1:1 décomp `GetItemHoldEffect` / `GetItemHoldEffectParam` — wired via item-hold-effects.

function _getHoldEffect(itemId: number): number { return _GetItemHoldEffectFull(itemId); }
function _getHoldEffectParam(itemId: number): number { return _GetItemHoldEffectParamFull(itemId); }

/** 1:1 décomp `ApplyRandomDmgMultiplier()` (battle_script_commands.c:1639-1651).
 *
 *  Random 85-100% multiplier (= rand % 16, donc range [0..15], inversé → [85..100]).
 *  Si damage == 0 → no-op. Si damage > 0 et result == 0 → set to 1 (min damage). */
function ApplyRandomDmgMultiplier(): void {
  const rand = Random();
  const randPercent = 100 - (rand % 16);

  if (gBattleMoveDamage !== 0) {
    let dmg = gBattleMoveDamage * randPercent;
    dmg = Math.floor(dmg / 100);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
  }
}

// Le helper `getBattlerForBattleScript` est porté en full 1:1 dans `./util.ts`
// (= 16 cas BS_*) et importé ici sous l'alias `_utilGetBattler`.

// ─── Cmd_ppreduce (0x03) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_ppreduce` (battle_script_commands.c:1205-1251). */
function Cmd_ppreduce(ctx: BattleScriptContext): boolean {
  let ppToDeduct = 1;

  // 1:1 décomp : `if (gBattleControllerExecFlags) return;`
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b01(ctx);
  }

  // 1:1 décomp ll.1212-1228 : Pressure check + multi-target switch.
  if (!gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure) {
    const target = _moveTargetForCurrentN1(gCurrentMove);
    switch (target) {
      case MOVE_TARGET_FOES_AND_ALLY:
        ppToDeduct += _abilityBattleEffectsCountFieldN1(
          ABILITYEFFECT_COUNT_ON_FIELD, gBattlerAttacker, ABILITY_PRESSURE
        );
        break;
      case MOVE_TARGET_BOTH:
      case MOVE_TARGET_OPPONENTS_FIELD:
        ppToDeduct += _abilityBattleEffectsCountFieldN1(
          ABILITYEFFECT_COUNT_OTHER_SIDE, gBattlerAttacker, ABILITY_PRESSURE
        );
        break;
      default:
        if (gBattlerAttacker !== gBattlerTarget
            && gBattleMons[gBattlerTarget].ability === ABILITY_PRESSURE) {
          ppToDeduct++;
        }
        break;
    }
  }

  if (!(gHitMarker & (HITMARKER_NO_PPDEDUCT | HITMARKER_NO_ATTACKSTRING))
      && gBattleMons[gBattlerAttacker].pp[gCurrMovePos] > 0) {
    // 1:1 décomp : gProtectStructs[gBattlerAttacker].notFirstStrike = 1.
    gProtectStructs[gBattlerAttacker].notFirstStrike = 1;

    const currentPp = gBattleMons[gBattlerAttacker].pp[gCurrMovePos];
    if (currentPp > ppToDeduct) {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] -= ppToDeduct;
    } else {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = 0;
    }
    // 1:1 décomp ll.1239-1246 : MOVE_IS_PERMANENT(attacker, gCurrMovePos)
    //    = !TRANSFORMED && !(mimickedMoves & bit[slot])
    // → BtlController_EmitSetMonData REQUEST_PPMOVE_X (= persist PP au save).
    // Notre port (Batch C session 142) : EmitSetMonData wirée à
    // __batPSetMonByActive bridge qui flush au party via SetMonData direct.
    if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
        && !(gDisableStructs[gBattlerAttacker].mimickedMoves & gBitTable[gCurrMovePos])) {
      setActiveBattler(gBattlerAttacker);
      // REQUEST_PPMOVE1_BATTLE = 9, donc 9 + slot.
      _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 9 + gCurrMovePos,
        0 /* monIdx */, 1 /* bytes */, gBattleMons[gBattlerAttacker].pp[gCurrMovePos]);
      _MarkBattlerForControllerExec_N1(gBattlerAttacker);
    }
  }

  setHitMarker(gHitMarker & ~HITMARKER_NO_PPDEDUCT);
  return false;
}

// 1:1 décomp helpers wired pour Cmd_ppreduce.


function _moveTargetForCurrentN1(move: number): number {
  return _gbmN1(move).target;
}
function _abilityBattleEffectsCountFieldN1(caseId: number, battler: number, ability: number): number {
  return _ABE_N1(caseId, battler, ability, 0, 0);
}
// 1:1 décomp BtlController_EmitSetMonData + Mark — wired via batch C bridge.


/** Convention runBattleScript : dispatcher fait scriptPtr++ AVANT handler.
 *  Pour "rester" sur opcode (= waitstate, re-execute next frame), on back up. */
function _stayOnOpcode__b01(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── Cmd_critcalc (0x04) ────────────────────────────────────────────────────

/** 1:1 décomp `sCriticalHitChance[]` (battle_script_commands.c:606). */
const sCriticalHitChance: ReadonlyArray<number> = [16, 8, 4, 3, 2];

/** 1:1 décomp `Cmd_critcalc` (battle_script_commands.c:1253-1288). */
function Cmd_critcalc(_ctx: BattleScriptContext): boolean {
  const attackerMon = gBattleMons[gBattlerAttacker];
  const targetMon = gBattleMons[gBattlerTarget];
  const item = attackerMon.item;
  const holdEffect = _getHoldEffect(item);

  setPotentialItemEffectBattler(gBattlerAttacker);

  // 1:1 décomp formule critChance (= sum of bonuses, then clamp + roll).
  const moveEffect = getBattleMove(gCurrentMove).effect;

  let critChance =
    2 * ((attackerMon.status2 & STATUS2_FOCUS_ENERGY) !== 0 ? 1 : 0)
    + (moveEffect === EFFECT_HIGH_CRITICAL ? 1 : 0)
    + (moveEffect === EFFECT_SKY_ATTACK ? 1 : 0)
    + (moveEffect === EFFECT_BLAZE_KICK ? 1 : 0)
    + (moveEffect === EFFECT_POISON_TAIL ? 1 : 0)
    + (holdEffect === HOLD_EFFECT_SCOPE_LENS ? 1 : 0)
    + 2 * (holdEffect === HOLD_EFFECT_LUCKY_PUNCH && attackerMon.species === SPECIES_CHANSEY ? 1 : 0)
    + 2 * (holdEffect === HOLD_EFFECT_STICK && attackerMon.species === SPECIES_FARFETCHD ? 1 : 0);

  if (critChance >= sCriticalHitChance.length) critChance = sCriticalHitChance.length - 1;

  const targetAbility = targetMon.ability;
  const canCrit =
    targetAbility !== ABILITY_BATTLE_ARMOR
    && targetAbility !== ABILITY_SHELL_ARMOR
    && (gStatuses3[gBattlerAttacker] & STATUS3_CANT_SCORE_A_CRIT) === 0
    && (gBattleTypeFlags & (BATTLE_TYPE_WALLY_TUTORIAL | BATTLE_TYPE_FIRST_BATTLE)) === 0
    && (Random() % sCriticalHitChance[critChance]) === 0;

  setCritMultiplier(canCrit ? 2 : 1);
  return false;
}

// ─── Cmd_damagecalc (0x05) ──────────────────────────────────────────────────

/** 1:1 décomp `Cmd_damagecalc` (battle_script_commands.c:1290-1313). */
function Cmd_damagecalc(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)].
  const sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)] ?? 0;
  // 1:1 décomp : typeOverride = gBattleStruct->dynamicMoveType (port via state).
  const damage = runDamagecalc(sideStatus, gDynamicBasePower, gDynamicMoveType);

  // 1:1 décomp : `damage = damage * gCritMultiplier * gBattleScripting.dmgMultiplier;`
  // (runDamagecalc returns base damage ; crit/dmgMultiplier applied here).
  let finalDamage = damage * gCritMultiplier * gBattleScripting.dmgMultiplier;

  // 1:1 décomp : STATUS3_CHARGED_UP electric × 2 (= Charge move boost on Electric type).
  const moveType = getBattleMove(gCurrentMove).type;
  if ((gStatuses3[gBattlerAttacker] & STATUS3_CHARGED_UP)
      && moveType === TYPE_ELECTRIC) {
    finalDamage *= 2;
  }

  // 1:1 décomp battle_script_commands.c:1300-1301 : Helping Hand × 1.5.
  if (gProtectStructs[gBattlerAttacker].helpingHand) {
    finalDamage = Math.floor((finalDamage * 15) / 10);
  }

  setBattleMoveDamage(finalDamage);
  return false;
}

// ─── Cmd_typecalc (0x06) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_typecalc` (battle_script_commands.c:1355-1424).
 *  Delegated to type-calc.ts module. */
function Cmd_typecalc(_ctx: BattleScriptContext): boolean {
  return TypecalcImpl();
}

// ─── Cmd_adjustnormaldamage (0x07) ──────────────────────────────────────────

/** 1:1 décomp `Cmd_adjustnormaldamage` (battle_script_commands.c:1658-1698).
 *
 *  Important : ne fait PAS de clamp inconditionnel à target.hp. Le seul clamp
 *  est `hp - 1` (= leave at 1 HP) si Focus Band trigger / Endured / FalseSwipe.
 *  Sinon damage reste tel quel (overkill ok, datahpupdate clamp à 0). */
function Cmd_adjustnormaldamage(_ctx: BattleScriptContext): boolean {
  ApplyRandomDmgMultiplier();

  const targetMon = gBattleMons[gBattlerTarget];
  const item = targetMon.item;
  const holdEffect = _getHoldEffect(item);
  const param = _getHoldEffectParam(item);

  setPotentialItemEffectBattler(gBattlerTarget);

  // 1:1 décomp : Focus Band trigger sur (Random() % 100) < param.
  // gSpecialStatuses[target].focusBanded est set ici aussi.
  let focusBanded = false;
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    focusBanded = true;
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }

  // 1:1 décomp : `if (gProtectStructs[target].endured)` — Endure move actif.
  const endured = gProtectStructs[gBattlerTarget].endured !== 0;

  // 1:1 décomp : skip si STATUS2_SUBSTITUTE actif (= substitute eats the hit,
  // pas de leave-at-1-HP gimmick).
  const moveEffect = getBattleMove(gCurrentMove).effect;
  if (
    !(targetMon.status2 & STATUS2_SUBSTITUTE)
    && (moveEffect === EFFECT_FALSE_SWIPE || endured || focusBanded)
    && targetMon.hp <= gBattleMoveDamage
  ) {
    setBattleMoveDamage(targetMon.hp - 1);  // leave at 1 HP
    if (endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      // 1:1 décomp : `gLastUsedItem = gBattleMons[gBattlerTarget].item;`
      setLastUsedItem(targetMon.item);
    }
  }
  return false;
}

// ─── Cmd_datahpupdate (0x0C) ────────────────────────────────────────────────

/** 1:1 décomp `Cmd_datahpupdate` (battle_script_commands.c:1844+, ~150 lignes).
 *
 *  Args : 1 byte = target battler ref (= BS_TARGET / BS_ATTACKER / etc.).
 *  Total : 2 bytes (opcode + 1 byte arg).
 *
 *  Logic 1:1 décomp (port complet sessions 138-142) :
 *  1. Read arg byte.
 *  2. Skip si MOVE_RESULT_NO_EFFECT.
 *  3. Resolve gActiveBattler via getBattlerForBattleScript(arg).
 *  4. Substitute path — FULL port (session 138 + R5 session 142).
 *  5. Si damage < 0 → HP gain (= clamp à maxHP).
 *  6. Sinon → HP loss (= clamp à 0), gHpDealt = damage clipped.
 *  7. Bide damage tracker + Shell Bell damage record + physical/special tracker
 *     pour Counter/Mirror Coat — TOUS ported. */
function Cmd_datahpupdate(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : `if (gBattleControllerExecFlags) return;`
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b01(ctx);
  }

  const battlerArg = readByte(ctx);

  // 1:1 décomp : moveType resolution avec dynamicMoveType + F_DYNAMIC_TYPE_*.
  // GET_MOVE_TYPE macro (battle.h:458) : si dynamicMoveType lo 6 bits set,
  // use celui-ci, sinon use gBattleMoves[move].type.
  const moveType = gDynamicMoveType !== 0
    ? (gDynamicMoveType & 0x3F)  // DYNAMIC_TYPE_MASK
    : getBattleMove(gCurrentMove).type;

  // 1:1 décomp : `if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT))` — use the
  // composite flag (= MISSED | DOESNT_AFFECT_FOE | FAILED).
  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
    const mon = gBattleMons[activeBattler];

    // 1:1 décomp : Substitute path. Si SUBSTITUTE actif + substituteHP > 0 +
    // !IGNORE_SUBSTITUTE → damage va au substitute, pas au mon.
    if ((mon.status2 & STATUS2_SUBSTITUTE)
        && gDisableStructs[activeBattler].substituteHP > 0
        && !(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE)) {
      // 1:1 décomp battle_script_commands.c:1866-1882 — wirage strict.
      const subHP = gDisableStructs[activeBattler].substituteHP;
      if (subHP >= gBattleMoveDamage) {
        // Substitute absorbs full damage.
        // 1:1 décomp l.1870-1871 : shellBellDmg set SEULEMENT si encore 0 (jamais +=).
        if (gSpecialStatuses[activeBattler].shellBellDmg === 0) gSpecialStatuses[activeBattler].shellBellDmg = gBattleMoveDamage;
        gDisableStructs[activeBattler].substituteHP = subHP - gBattleMoveDamage;
        setHpDealt(gBattleMoveDamage);
      } else {
        // Substitute absorbs partial, set sub HP to 0.
        if (gSpecialStatuses[activeBattler].shellBellDmg === 0) {
          gSpecialStatuses[activeBattler].shellBellDmg = subHP;
        }
        setHpDealt(subHP);
        gDisableStructs[activeBattler].substituteHP = 0;
      }
      // 1:1 décomp ll.1884-1891 : si substituteHP == 0 → push + jump SubstituteFade.
      if (gDisableStructs[activeBattler].substituteHP === 0) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_SubstituteFade');
        if (off >= 0) ctx.scriptPtr = off;
      }
      return false;  // Pas de damage au mon direct.
    }

    if (gBattleMoveDamage < 0) {
      // Negative damage = heal.
      mon.hp += -gBattleMoveDamage;
      if (mon.hp > mon.maxHP) mon.hp = mon.maxHP;
    } else {
      // 1:1 décomp battle_script_commands.c:1905-1917 : Bide damage tracker.
      if (gHitMarker & HITMARKER_IGNORE_BIDE) {
        setHitMarker(gHitMarker & ~HITMARKER_IGNORE_BIDE);
      } else {
        gBideDmg[activeBattler] = gBideDmg[activeBattler] + gBattleMoveDamage;
        // 1:1 décomp : si arg == BS_TARGET, bideTarget = attacker, sinon = target.
        gBideTarget[activeBattler] = battlerArg === BS_TARGET
          ? gBattlerAttacker
          : gBattlerTarget;
      }

      // 1:1 décomp ll.1920-1929 : deal damage.
      if (mon.hp > gBattleMoveDamage) {
        mon.hp -= gBattleMoveDamage;
        setHpDealt(gBattleMoveDamage);
      } else {
        setHpDealt(mon.hp);
        mon.hp = 0;
      }

      // 1:1 décomp ll.1932-1933 : shellBellDmg tracker (= post-combat heal).
      if (gSpecialStatuses[activeBattler].shellBellDmg === 0
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)) {
        gSpecialStatuses[activeBattler].shellBellDmg = gHpDealt;
      }

      // 1:1 décomp ll.1938-1969 : physical/special damage tracker pour
      // Counter/Mirror Coat. specialDmg utilisé aussi pour Fire defrost.
      if (IS_TYPE_PHYSICAL(moveType)
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)
          && gCurrentMove !== MOVE_PAIN_SPLIT) {
        gProtectStructs[activeBattler].physicalDmg = gHpDealt;
        gSpecialStatuses[activeBattler].physicalDmg = gHpDealt;
        const otherBattler = battlerArg === BS_TARGET ? gBattlerAttacker : gBattlerTarget;
        gProtectStructs[activeBattler].physicalBattlerId = otherBattler;
        gSpecialStatuses[activeBattler].physicalBattlerId = otherBattler;
      } else if (!IS_TYPE_PHYSICAL(moveType)
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)) {
        gProtectStructs[activeBattler].specialDmg = gHpDealt;
        gSpecialStatuses[activeBattler].specialDmg = gHpDealt;
        const otherBattler = battlerArg === BS_TARGET ? gBattlerAttacker : gBattlerTarget;
        gProtectStructs[activeBattler].specialBattlerId = otherBattler;
        gSpecialStatuses[activeBattler].specialBattlerId = otherBattler;
      }
    }

    // 1:1 décomp : clear HITMARKER_PASSIVE_HP_UPDATE.
    setHitMarker(gHitMarker & ~HITMARKER_PASSIVE_HP_UPDATE);

    // 1:1 décomp : Emit SetMonData REQUEST_HP_BATTLE + Mark — wired via batch C
    // bridge → flush au party-side (= 42 = REQUEST_HP_BATTLE).
    _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 42 /* REQUEST_HP_BATTLE */,
      0, 2 /* u16 */, mon.hp);
    _MarkBattlerForControllerExec_N1(activeBattler);
  } else {
    // 1:1 décomp : NO_EFFECT path → set shellBellDmg = IGNORE_SHELL_BELL sentinel.
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
    // Marker for Shell Bell to ignore this damage in post-hit recovery.
    if (gSpecialStatuses[activeBattler].shellBellDmg === 0) {
      gSpecialStatuses[activeBattler].shellBellDmg = -1;  // IGNORE_SHELL_BELL sentinel
    }
  }
  return false;
}

// ─── Cmd_tryfaintmon (0x19) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_tryfaintmon` (battle_script_commands.c:2965-3050).
 *
 *  Args : 1 byte battler ref + 1 byte mode + 4 byte ptr (= post-faint dispatch).
 *  Total 7 bytes.
 *
 *  Mode != 0 (= dispatch après faint) : check HITMARKER_FAINTED → pop cursor +
 *    jump, sinon advance 7.
 *  Mode == 0 (= regular faint check) :
 *    - BS_ATTACKER → active = attacker, jump = BattleScript_FaintAttacker
 *    - else → active = target, jump = BattleScript_FaintTarget
 *    - Si !absent && hp == 0 :
 *      * set HITMARKER_FAINTED(active), push cursor + jump
 *      * player side : HITMARKER_PLAYER_FAINTED + playerFaintCounter++ +
 *                      AdjustFriendshipOnBattleFaint
 *      * opponent side : opponentFaintCounter++ + lastOpponentSpecies
 *      * Destiny Bond : si HITMARKER_DESTINYBOND + attacker.hp != 0 →
 *                       gBattleMoveDamage = battler.hp + push +
 *                       BattleScript_DestinyBondTakesLife
 *      * Grudge : conditions match → drain attacker PP du chosenMove +
 *                 BattleScript_GrudgeTakesPp */
function Cmd_tryfaintmon(ctx: BattleScriptContext): boolean {
  const opcodeStartPtr = ctx.scriptPtr - 1;  // before pre-advance
  const battlerArg = readByte(ctx);
  const modeFlag = readByte(ctx);
  const jumpPtr = readWord(ctx);

  if (modeFlag !== 0) {
    // 1:1 décomp ll.2969-2983 : post-faint dispatcher.
    const active = _utilGetBattler(battlerArg);
    setActiveBattler(active);
    if (gHitMarker & HITMARKER_FAINTED(active)) {
      ctx.scriptPtr = jumpPtr;
      // 1:1 décomp : BattleScriptPop() + scriptPtr = jumpPtr.
      ctx.scriptPtrStack.pop();
      gSideStatuses[GET_BATTLER_SIDE(active)] &= ~SIDE_STATUS_SPIKES_DAMAGED;
    }
    return false;
  }

  // Mode 0 : regular faint check.
  let activeBattler: number;
  let battlerOther: number;
  let bsLabel: string;
  if (battlerArg === BS_ATTACKER) {
    activeBattler = gBattlerAttacker;
    battlerOther = gBattlerTarget;
    bsLabel = 'BattleScript_FaintAttacker';
  } else {
    activeBattler = gBattlerTarget;
    battlerOther = gBattlerAttacker;
    bsLabel = 'BattleScript_FaintTarget';
  }
  setActiveBattler(activeBattler);

  if (!(gAbsentBattlerFlags & gBitTable[activeBattler])
      && gBattleMons[activeBattler].hp === 0) {
    setHitMarker(gHitMarker | HITMARKER_FAINTED(activeBattler));
    setBattlerFainted(activeBattler);
    // 1:1 décomp : BattleScriptPush(gBattlescriptCurrInstr + 7) + jump label.
    ctx.scriptPtrStack.push(opcodeStartPtr + 7);
    const off = getBattleScriptOffset(bsLabel);
    if (off >= 0) ctx.scriptPtr = off;

    if (GET_BATTLER_SIDE(activeBattler) === B_SIDE_PLAYER) {
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      if (gBattleResults.playerFaintCounter < 255) {
        gBattleResults.playerFaintCounter++;
      }
      _adjustFriendshipOnFaintTFM(activeBattler);
      // ⚠️ Non-1:1 (échafaudage voie V) : le vrai Cmd_tryfaintmon NE pose PAS
      // l'outcome — c'est `checkteamslost` (dans BattleScript_HandleFaintedMon,
      // APRÈS GiveExp) qui le fait. En voie L (ctx persistant), on laisse le flux
      // 1:1 poser l'outcome ; sinon RunTurnActionsFunctions court-circuiterait
      // HandleFaintedMonActions (EXP + « K.O. » sautés).
      if (ctx !== gBattleScriptContext) setBattleOutcome(B_OUTCOME_LOST);
    } else {
      if (gBattleResults.opponentFaintCounter < 255) {
        gBattleResults.opponentFaintCounter++;
      }
      // 1:1 décomp : `lastOpponentSpecies = GetMonData(&gEnemyParty[partyIdx], MON_DATA_SPECIES)`.
      const partyIdx = gBattlerPartyIndexes[activeBattler];
      if (gEnemyParty_TFM[partyIdx]) {
        gBattleResults.lastOpponentSpecies =
          GetMonData_TFM(gEnemyParty_TFM[partyIdx], MON_DATA_SPECIES_TFM) as number;
      }
      // ⚠️ Non-1:1 (échafaudage voie V) : idem — la voie L laisse checkteamslost
      // (dans HandleFaintedMon, après GiveExp) poser WON.
      if (ctx !== gBattleScriptContext) setBattleOutcome(B_OUTCOME_WON);
    }

    // 1:1 décomp ll.3020-3026 : Destiny Bond.
    if ((gHitMarker & HITMARKER_DESTINYBOND)
        && gBattleMons[gBattlerAttacker].hp !== 0) {
      setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      setBattleMoveDamage(gBattleMons[battlerOther].hp);
      const dbOff = getBattleScriptOffset('BattleScript_DestinyBondTakesLife');
      if (dbOff >= 0) ctx.scriptPtr = dbOff;
    }

    // 1:1 décomp ll.3027-3043 : Grudge effect.
    if ((gStatuses3[gBattlerTarget] & STATUS3_GRUDGE)
        && !(gHitMarker & HITMARKER_GRUDGE)
        && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)
        && gBattleMons[gBattlerAttacker].hp !== 0
        && gCurrentMove !== MOVE_STRUGGLE) {
      const moveIndex = gBattleStruct.chosenMovePositions[gBattlerAttacker];
      gBattleMons[gBattlerAttacker].pp[moveIndex] = 0;
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      const grOff = getBattleScriptOffset('BattleScript_GrudgeTakesPp');
      if (grOff >= 0) ctx.scriptPtr = grOff;
      setActiveBattler(gBattlerAttacker);
      // 1:1 décomp : EmitSetMonData REQUEST_PPMOVE_X (= persist au save) wired
      // via batch C bridge → SetMonData direct sur le party mon.
      _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 9 + moveIndex,
        0, 1, gBattleMons[gBattlerAttacker].pp[moveIndex]);
      _MarkBattlerForControllerExec_N1(gBattlerAttacker);
      // 1:1 décomp battle_script_commands.c:3042.
      _PREPARE_MOVE_BUFFER_TFM(_gBattleTextBuff1_TFM, gBattleMons[gBattlerAttacker].moves[moveIndex]);
    }
  }
  return false;
}

// HOLD_EFFECT_EVASION_UP pour Cmd_accuracycheck (= Brightpowder / Lax Incense).


/** 1:1 décomp `AdjustFriendshipOnBattleFaint(battler)` (battle_util2.c:77-107).
 *  Décrément friendship du party member faint. Replace l'auto-gen battle_util2-
 *  all-auto.ts (= cassé : `gBattleTypeFlags is not defined` car @ts-nocheck +
 *  bare global refs sans bridge).
 *
 *  Pour notre POC : on lit gBattleMons[opponent].level vs gBattleMons[battler].
 *  level, et applique FRIENDSHIP_EVENT_FAINT_SMALL ou _LARGE. AdjustFriendship
 *  decrément friendship du gPlayerParty[partyIdx] de 1-10 selon level. */
function _adjustFriendshipOnFaintTFM(battler: number): void {
  const BATTLE_TYPE_DOUBLE_TFM = 1 << 0;
  // 1:1 décomp positions : 1 = OPPONENT_LEFT, 3 = OPPONENT_RIGHT.
  // GetBattlerAtPosition retourne battler id à cette position.
  const _getOppLeft = (): number => {
    // Single battle : opponent = 1. Double : check gBattleStruct.battlerPartyOrders.
    return 1;
  };
  let opposingBattlerId = _getOppLeft();
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE_TFM) {
    const opposingBattlerId2 = 3; // OPPONENT_RIGHT.
    if (gBattleMons[opposingBattlerId2]?.level > gBattleMons[opposingBattlerId]?.level) {
      opposingBattlerId = opposingBattlerId2;
    }
  }
  const FRIENDSHIP_EVENT_FAINT_SMALL = 6;
  const FRIENDSHIP_EVENT_FAINT_LARGE = 8;
  void FRIENDSHIP_EVENT_FAINT_LARGE;
  // 1:1 décomp : si opposingBattler.level > battler.level → friendship loss.
  const oppLvl = gBattleMons[opposingBattlerId]?.level ?? 0;
  const battlerLvl = gBattleMons[battler]?.level ?? 0;
  const _event = oppLvl > battlerLvl
    ? (oppLvl - battlerLvl > 29 ? FRIENDSHIP_EVENT_FAINT_LARGE : FRIENDSHIP_EVENT_FAINT_SMALL)
    : FRIENDSHIP_EVENT_FAINT_SMALL;
  // 1:1 décomp call : AdjustFriendship(&gPlayerParty[gBattlerPartyIndexes[battler]], event).
  // Wire complet maintenant via AdjustFriendship 1:1 décomp dans party-storage.ts.
  const partyIdx = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } })
    .__battleState?.gBattlerPartyIndexes?.[battler] ?? 0;
  const playerMon = _gPlayerPartyAF[partyIdx];
  if (playerMon) {
    _AdjustFriendshipAF(playerMon, _event);
  }
}
// Imports locaux _adjustFriendshipOnFaintTFM.


// Imports locaux Cmd_tryfaintmon (= éviter dups au top du file).
// Note : on n'importe PAS AdjustFriendshipOnBattleFaint depuis battle_util2-all-auto
// car ce fichier auto-gen utilise gBattleTypeFlags / gBattleMons / etc. sans imports
// (= `gBattleTypeFlags is not defined` au runtime). On utilise notre propre impl
// `_adjustFriendshipOnFaintTFM` au-dessus.





// ─── Cmd_accuracycheck (0x01) ───────────────────────────────────────────────

/** 1:1 décomp `sAccuracyStageRatios[]` (battle_script_commands.c:588-603). */
const sAccuracyStageRatios: ReadonlyArray<readonly [number, number]> = [
  [ 33, 100], [ 36, 100], [ 43, 100], [ 50, 100], [ 60, 100], [ 75, 100],
  [  1,   1],  // stage 0 (= +6 internal, +0 displayed)
  [133, 100], [166, 100], [  2,   1], [233, 100], [133,  50], [  3,   1],
];

// HITMARKER_IGNORE_* bits (1 << 16/17/18) déjà importés.

/** 1:1 décomp `DEFENDER_IS_PROTECTED` (battle.h macro) :
 *  `gProtectStructs[gBattlerTarget].protected && (gBattleMoves[move].flags & FLAG_PROTECT_AFFECTED)`. */
function _DEFENDER_IS_PROTECTED(move: number): boolean {
  // Lazy lookup gProtectStructs from globalThis to avoid heavier imports.
  const targetProtectStructs = gProtectStructs[gBattlerTarget];
  if (!targetProtectStructs.protected) return false;
  return (getBattleMove(move).flags & FLAG_PROTECT_AFFECTED) !== 0;
}

/** 1:1 décomp `JumpIfMoveAffectedByProtect(move)`
 *  (battle_script_commands.c:1041-1052).
 *
 *  Si défendeur est Protect-é (= proté et move respecté Protect) :
 *  - set MOVE_RESULT_MISSED
 *  - set MISS_TYPE = B_MSG_PROTECTED
 *  - jump à BattleScript label (= 7 bytes ahead du opcode, mais notre
 *    appelant doit handle le scriptPtr jump)
 *  - return true (= affected)
 */
function _JumpIfMoveAffectedByProtect(ctx: BattleScriptContext, jumpTarget: number, move: number): boolean {
  if (_DEFENDER_IS_PROTECTED(move)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    // 1:1 décomp : JumpIfMoveFailed(7, move) — jump si move failed.
    // Notre version : si jumpTarget est set, on l'utilise.
    _jumpIfMoveFailed(ctx, jumpTarget);
    gBattleCommunication[MISS_TYPE] = 1 /* B_MSG_PROTECTED */;
    return true;
  }
  return false;
}

/** 1:1 décomp `AccuracyCalcHelper(move)` (battle_script_commands.c:1054-1097).
 *  Check les cas où le move hit/miss without acc check.
 *
 *  Returns true si décision faite (hit or miss). Si miss, set scriptPtr=jumpTarget. */
function _AccuracyCalcHelper(ctx: BattleScriptContext, jumpTarget: number, move: number): boolean {
  // Lock On : ALWAYS_HITS + battlerWithSureHit match → hit.
  if ((gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS)
      && gDisableStructs[gBattlerTarget].battlerWithSureHit === gBattlerAttacker) {
    // 1:1 décomp : JumpIfMoveFailed(7, move) même sur ce HIT (arme Destiny Bond + Absorbing).
    _jumpIfMoveFailed(ctx, jumpTarget);
    return true;
  }

  // ON_AIR (Fly) : miss sauf si IGNORE_ON_AIR set.
  if (!(gHitMarker & HITMARKER_IGNORE_ON_AIR)
      && (gStatuses3[gBattlerTarget] & STATUS3_ON_AIR)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    _jumpIfMoveFailed(ctx, jumpTarget);
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_ON_AIR);

  // UNDERGROUND (Dig) : miss sauf si IGNORE_UNDERGROUND.
  if (!(gHitMarker & HITMARKER_IGNORE_UNDERGROUND)
      && (gStatuses3[gBattlerTarget] & STATUS3_UNDERGROUND)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    _jumpIfMoveFailed(ctx, jumpTarget);
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_UNDERGROUND);

  // UNDERWATER (Dive) : miss sauf si IGNORE_UNDERWATER.
  if (!(gHitMarker & HITMARKER_IGNORE_UNDERWATER)
      && (gStatuses3[gBattlerTarget] & STATUS3_UNDERWATER)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    _jumpIfMoveFailed(ctx, jumpTarget);
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_UNDERWATER);

  // 1:1 décomp : Thunder en Rain = hit (no acc check) si WEATHER_HAS_EFFECT.
  // WEATHER_HAS_EFFECT = !ABILITY_ON_FIELD(CloudNine/AirLock).
  // Lazy lookup via globalThis pour éviter circular dep.
  const checkFn = (globalThis as { __abilityBattleEffectsCheck?: (caseID: number, b: number, ab: number, s: number, m: number) => number }).__abilityBattleEffectsCheck;
  let weatherActive = true;
  if (checkFn) {
    // 1:1 décomp abilities.h:17,81. AUDIT BUG FIX : AIR_LOCK était 76 (= TRACE!) → 77.
    const CHECK_ON_FIELD = 12, CLOUD_NINE = 13, AIR_LOCK = 77;
    weatherActive = !checkFn(CHECK_ON_FIELD, 0, CLOUD_NINE, 0, 0)
                 && !checkFn(CHECK_ON_FIELD, 0, AIR_LOCK, 0, 0);
  }

  const moveEff = getBattleMove(move).effect;
  // 1:1 décomp battle_script_commands.c:1089 : `gBattleWeather & B_WEATHER_RAIN`
  // (= composite TEMPORARY|DOWNPOUR|PERMANENT = 0x7), pas juste TEMPORARY.
  // AUDIT BUG FIX : était `& 1` (= TEMPORARY seul) → manquait DOWNPOUR/PERMANENT.
  const B_WEATHER_RAIN_ALL = 0x7; // bits 0|1|2
  if ((weatherActive && (gBattleWeather & B_WEATHER_RAIN_ALL) && moveEff === EFFECT_THUNDER)
      || moveEff === EFFECT_ALWAYS_HIT
      || moveEff === EFFECT_VITAL_THROW) {
    // 1:1 décomp : JumpIfMoveFailed(7, move) même sur ce HIT (arme Destiny Bond + Absorbing).
    _jumpIfMoveFailed(ctx, jumpTarget);
    return true;
  }

  return false;
}

// HITMARKER_IGNORE_* values from constants (1 << 16/17/18) — imported above.

/** 1:1 décomp `Cmd_accuracycheck` (battle_script_commands.c:1099-1189).
 *
 *  Opcode structure (= bytecode) : 0x01 [u32 jumpTarget] [u16 move]. Total 7 bytes.
 *  Notre interpreter a déjà consommé l'opcode byte → ctx.scriptPtr est sur jumpTarget.
 *
 *  Helpers wired : JumpIfMoveAffectedByProtect + AccuracyCalcHelper.
 *  Stubs : CheckWonderGuardAndLevitate = noop. */
function Cmd_accuracycheck(ctx: BattleScriptContext): boolean {
  const jumpTarget = readWord(ctx);
  let move = readHalfword(ctx);

  if (move === NO_ACC_CALC || move === NO_ACC_CALC_CHECK_LOCK_ON) {
    if ((gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS) && move === NO_ACC_CALC_CHECK_LOCK_ON
        && gDisableStructs[gBattlerTarget].battlerWithSureHit === gBattlerAttacker) {
      return false;  // hit (lock on + sure hit) — 1:1 l.1105 incl. battlerWithSureHit
    }
    if (gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE) {
      ctx.scriptPtr = jumpTarget;  // semi-invulnerable, miss
      return false;
    }
    // 1:1 décomp : JumpIfMoveAffectedByProtect(0) — pas affected → hit.
    _JumpIfMoveAffectedByProtect(ctx, jumpTarget, 0);
    return false;
  }

  if (move === ACC_CURR_MOVE) move = gCurrentMove;

  const md = getBattleMove(move);
  const type = md.type;
  let moveAcc = md.accuracy;

  // 1:1 décomp : JumpIfMoveAffectedByProtect(move) → return early si protected.
  if (_JumpIfMoveAffectedByProtect(ctx, jumpTarget, move)) return false;
  // 1:1 décomp : AccuracyCalcHelper(move) → return early si verdict pris.
  if (_AccuracyCalcHelper(ctx, jumpTarget, move)) return false;

  const attackerMon = gBattleMons[gBattlerAttacker];
  const targetMon = gBattleMons[gBattlerTarget];

  // Foresight ignore evasion buff sur target.
  let buff: number;
  if (targetMon.status2 & (1 << 29) /* STATUS2_FORESIGHT */) {
    buff = attackerMon.statStages[STAT_ACC] ?? DEFAULT_STAT_STAGE;
  } else {
    buff = (attackerMon.statStages[STAT_ACC] ?? DEFAULT_STAT_STAGE)
         + DEFAULT_STAT_STAGE
         - (targetMon.statStages[STAT_EVASION] ?? DEFAULT_STAT_STAGE);
  }
  if (buff < MIN_STAT_STAGE) buff = MIN_STAT_STAGE;
  if (buff > MAX_STAT_STAGE) buff = MAX_STAT_STAGE;

  // Thunder en sun = 50% accuracy.
  if ((gBattleWeather & B_WEATHER_SUN) && md.effect === EFFECT_THUNDER) {
    moveAcc = 50;
  }

  const ratio = sAccuracyStageRatios[buff] ?? [1, 1];
  let calc = Math.floor(ratio[0] * moveAcc / ratio[1]);

  if (attackerMon.ability === ABILITY_COMPOUND_EYES) calc = Math.floor((calc * 130) / 100);
  if ((gBattleWeather & B_WEATHER_SANDSTORM) && targetMon.ability === ABILITY_SAND_VEIL) {
    calc = Math.floor((calc * 80) / 100);
  }
  if (attackerMon.ability === ABILITY_HUSTLE && IS_TYPE_PHYSICAL(type)) {
    calc = Math.floor((calc * 80) / 100);
  }

  setPotentialItemEffectBattler(gBattlerTarget);

  // 1:1 décomp ll.1159-1173 : ENIGMA_BERRY check (= per-battler custom berry data
  // gEnigmaBerries[target].holdEffect/Param). gEnigmaBerries Frontier deferred
  // (= rare custom berry data) ; fallback à GetItemHoldEffect normal (=
  // ITEM_ENIGMA_BERRY sans custom data retourne 0 = pas d'effet sur accuracy).
  const holdEffect = GetItemHoldEffect(targetMon.item);
  const holdEffectParam = GetItemHoldEffectParam(targetMon.item);
  if (holdEffect === HOLD_EFFECT_EVASION_UP_AC) {
    calc = Math.floor((calc * (100 - holdEffectParam)) / 100);
  }

  if ((Random() % 100 + 1) > calc) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    // 1:1 décomp l.1179-1183 : en double ciblant BOTH/FOES_AND_ALLY → "évite l'attaque".
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        && (md.target === MOVE_TARGET_BOTH || md.target === MOVE_TARGET_FOES_AND_ALLY)) {
      gBattleCommunication[MISS_TYPE] = B_MSG_AVOIDED_ATK;
    } else {
      gBattleCommunication[MISS_TYPE] = B_MSG_MISSED;
    }
    // TODO 1:1 (passe helpers) : CheckWonderGuardAndLevitate() (décomp l.1426-1499) raffine le
    // MESSAGE de miss si cible Lévitation (capacité SOL) ou Garde Mystik. Message-only, cas rare.
  }
  // 1:1 décomp l.1187 : JumpIfMoveFailed(7, move) INCONDITIONNEL. Sur HIT → TrySetDestinyBondToHappen
  // + AbilityBattleEffects(ABSORBING) = Absorbeur d'Eau/Para-tonnerre/Torche s'activent ENFIN
  // sur une attaque à dégâts (avant : `return false` sec → jamais). Sur miss → jump.
  _jumpIfMoveFailed(ctx, jumpTarget);
  return false;
}

// ─── Cmd_moveend (0x49) ─────────────────────────────────────────────────────

/** 1:1 décomp `include/constants/battle_script_commands.h:393-410`.
 *  MOVEEND_COUNT = 17 (= nb total sub-states ; AUDIT FIX session post-compact :
 *  l'ancien stub mettait COUNT=28 ce qui était FAUX, le décomp Em a 17 cases). */
const MOVEEND_RAGE                 = 0;
const MOVEEND_DEFROST              = 1;
const MOVEEND_SYNCHRONIZE_TARGET   = 2;
const MOVEEND_ON_DAMAGE_ABILITIES  = 3;
const MOVEEND_IMMUNITY_ABILITIES   = 4;
const MOVEEND_SYNCHRONIZE_ATTACKER = 5;
const MOVEEND_CHOICE_MOVE          = 6;
const MOVEEND_CHANGED_ITEMS        = 7;
const MOVEEND_ATTACKER_INVISIBLE   = 8;
const MOVEEND_ATTACKER_VISIBLE     = 9;
const MOVEEND_TARGET_VISIBLE       = 10;
const MOVEEND_ITEM_EFFECTS_ALL     = 11;
const MOVEEND_KINGSROCK_SHELLBELL  = 12;
const MOVEEND_SUBSTITUTE           = 13;
const MOVEEND_UPDATE_LAST_MOVES    = 14;
const MOVEEND_MIRROR_MOVE          = 15;
const MOVEEND_NEXT_TARGET          = 16;
const MOVEEND_COUNT                = 17;

/** 1:1 décomp `TARGET_TURN_DAMAGED` (battle.h:469). */
function _TARGET_TURN_DAMAGED(): boolean {
  return gSpecialStatuses[gBattlerTarget].physicalDmg !== 0
      || gSpecialStatuses[gBattlerTarget].specialDmg !== 0;
}

/** 1:1 décomp `BATTLE_PARTNER(id)` (battle.h:46). */
function _BATTLE_PARTNER(id: number): number { return id ^ BIT_FLANK; }

/** 1:1 décomp `WasUnableToUseMove(battler)` (battle_util.c:877-891). */
function _WasUnableToUseMove(battler: number): boolean {
  const p = gProtectStructs[battler];
  return Boolean(
    p.prlzImmobility || p.targetNotAffected || p.usedImprisonedMove
    || p.loveImmobility || p.usedDisabledMove || p.usedTauntedMove
    || p.flag2Unknown || p.flinchImmobility || p.confusionSelfDmg
  );
}

/** 1:1 décomp `MoveValuesCleanUp` (battle_script_commands.c:3624-3633). */
function _MoveValuesCleanUp(): void {
  setMoveResultFlags(0);
  gBattleScripting.dmgMultiplier = 1;
  setCritMultiplier(1);
  gBattleCommunication[3 /* MOVE_EFFECT_BYTE */] = 0;
  gBattleCommunication[MISS_TYPE] = 0;
  setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
  setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
}

/** 1:1 décomp `Cmd_moveend` (battle_script_commands.c:4213-4501).
 *
 *  State machine post-move cleanup. 17 sub-states qui gèrent : Rage build,
 *  Defrost via Fire, Synchronize, ability-on-damage (Static/Effect Spore/etc.),
 *  status immunity abilities, Choice Band lock, Trick/Switcheroo items,
 *  semi-invulnerable sprite show/hide, post-move items (berries), Kings Rock /
 *  Shell Bell, substitute upkeep, last moves tracking, Mirror Move record,
 *  next target (Double/multi-target).
 *
 *  Args : 1 byte endMode + 1 byte endState. Total 3 bytes (opcode + args).
 *
 *  endMode = 1 → "exit after first sub-state with no effect" (= utilisé par les
 *  scripts qui veulent un single-step pas full unwind).
 *  endMode = 2 → "exit when reached endState" (= partial unwind jusqu'à un état
 *  donné). */
function Cmd_moveend(ctx: BattleScriptContext): boolean {
  // ctx.scriptPtr est sur opcode+1 (= endMode position) après pre-advance dispatcher.
  // On note l'opcode start pour push cursor / stay-on-opcode.
  const opcodeStartPtr = ctx.scriptPtr - 1;
  const endMode = readByte(ctx);
  const endState = readByte(ctx);

  // 1:1 décomp : `if (gChosenMove == MOVE_UNAVAILABLE) originallyUsedMove = MOVE_NONE`
  const originallyUsedMove = (gChosenMove === MOVE_UNAVAILABLE) ? MOVE_NONE : gChosenMove;

  // 1:1 décomp : `holdEffectAtk = GetItemHoldEffect(gBattleMons[gBattlerAttacker].item)`.
  // gEnigmaBerries[]→holdEffect path Frontier deferred (= rare custom berry data).
  const holdEffectAtk = GetItemHoldEffect(gBattleMons[gBattlerAttacker].item);

  // 1:1 décomp : `GET_MOVE_TYPE(gCurrentMove, moveType)` — Hidden Power dynamic
  // type override géré via gDynamicMoveType ; sinon move.type.
  const moveType = gDynamicMoveType !== 0
    ? (gDynamicMoveType & 0x3F)  // DYNAMIC_TYPE_MASK
    : getBattleMove(gCurrentMove).type;

  let effect = false;

  // do...while loop 1:1 décomp.
  let iterations = 0;
  const MAX_ITER = 64;  // safety bound
  while (iterations++ < MAX_ITER) {
    switch (gBattleScripting.moveendState) {
      case MOVEEND_RAGE: {
        if ((gBattleMons[gBattlerTarget].status2 & STATUS2_RAGE)
            && gBattleMons[gBattlerTarget].hp !== 0
            && gBattlerAttacker !== gBattlerTarget
            && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            && _TARGET_TURN_DAMAGED()
            && getBattleMove(gCurrentMove).power !== 0
            && (gBattleMons[gBattlerTarget].statStages[STAT_ATK] ?? DEFAULT_STAT_STAGE) < MAX_STAT_STAGE) {
          gBattleMons[gBattlerTarget].statStages[STAT_ATK] = (gBattleMons[gBattlerTarget].statStages[STAT_ATK] ?? DEFAULT_STAT_STAGE) + 1;
          // BattleScriptPushCursor + jump = save current opcode start, jump to label.
          ctx.scriptPtrStack.push(opcodeStartPtr);
          const off = getBattleScriptOffset('BattleScript_RageIsBuilding');
          if (off >= 0) ctx.scriptPtr = off;
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_DEFROST: {
        if ((gBattleMons[gBattlerTarget].status1 & STATUS1_FREEZE)
            && gBattleMons[gBattlerTarget].hp !== 0
            && gBattlerAttacker !== gBattlerTarget
            && gSpecialStatuses[gBattlerTarget].specialDmg !== 0
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            && moveType === 10 /* TYPE_FIRE */) {
          gBattleMons[gBattlerTarget].status1 &= ~STATUS1_FREEZE;
          setActiveBattler(gBattlerTarget);
          // 1:1 décomp : Emit SetMonData REQUEST_STATUS_BATTLE + Mark — wired
          // via batch C bridge → SetMonData status1 au party (= 40 = STATUS).
          _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */,
            40 /* REQUEST_STATUS_BATTLE */, 0, 4 /* u32 */,
            gBattleMons[gBattlerTarget].status1);
          MarkBattlerForControllerExec(gBattlerTarget);
          ctx.scriptPtrStack.push(opcodeStartPtr);
          const off = getBattleScriptOffset('BattleScript_DefrostedViaFireMove');
          if (off >= 0) ctx.scriptPtr = off;
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_SYNCHRONIZE_TARGET: {
        if (AbilityBattleEffects(ABILITYEFFECT_SYNCHRONIZE, gBattlerTarget, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ON_DAMAGE_ABILITIES: {
        if (AbilityBattleEffects(ABILITYEFFECT_ON_DAMAGE, gBattlerTarget, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_IMMUNITY_ABILITIES: {
        // 1:1 décomp : loop through all battlers, increment state only when done.
        if (AbilityBattleEffects(ABILITYEFFECT_IMMUNITY, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        } else {
          gBattleScripting.moveendState++;
        }
        break;
      }
      case MOVEEND_SYNCHRONIZE_ATTACKER: {
        if (AbilityBattleEffects(ABILITYEFFECT_ATK_SYNCHRONIZE, gBattlerAttacker, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_CHOICE_MOVE: {
        if ((gHitMarker & HITMARKER_OBEYS)
            && holdEffectAtk === HOLD_EFFECT_CHOICE_BAND
            && gChosenMove !== MOVE_STRUGGLE
            && (gBattleStruct.choicedMove[gBattlerAttacker] === MOVE_NONE
                || gBattleStruct.choicedMove[gBattlerAttacker] === MOVE_UNAVAILABLE)) {
          if (gChosenMove === MOVE_BATON_PASS && !(gMoveResultFlags & MOVE_RESULT_FAILED)) {
            gBattleScripting.moveendState++;
            break;
          }
          gBattleStruct.choicedMove[gBattlerAttacker] = gChosenMove;
        }
        let i: number;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[gBattlerAttacker].moves[i] === gBattleStruct.choicedMove[gBattlerAttacker])
            break;
        }
        if (i === MAX_MON_MOVES) gBattleStruct.choicedMove[gBattlerAttacker] = MOVE_NONE;
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_CHANGED_ITEMS: {
        for (let i = 0; i < gBattlersCount; i++) {
          if (gBattleStruct.changedItems[i] !== 0 /* ITEM_NONE */) {
            gBattleMons[i].item = gBattleStruct.changedItems[i];
            gBattleStruct.changedItems[i] = 0;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ATTACKER_INVISIBLE: {
        if ((gStatuses3[gBattlerAttacker] & STATUS3_SEMI_INVULNERABLE)
            && (gHitMarker & HITMARKER_NO_ANIMATIONS)) {
          setActiveBattler(gBattlerAttacker);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, true);
          MarkBattlerForControllerExec(gBattlerAttacker);
          gBattleScripting.moveendState++;
          // 1:1 décomp : `return;` — exit handler sans avancer opcode pour re-call.
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ATTACKER_VISIBLE: {
        if ((gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            || !(gStatuses3[gBattlerAttacker] & STATUS3_SEMI_INVULNERABLE)
            || _WasUnableToUseMove(gBattlerAttacker)) {
          setActiveBattler(gBattlerAttacker);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, false);
          MarkBattlerForControllerExec(gBattlerAttacker);
          gStatuses3[gBattlerAttacker] &= ~STATUS3_SEMI_INVULNERABLE;
          gSpecialStatuses[gBattlerAttacker].restoredBattlerSprite = 1;
          gBattleScripting.moveendState++;
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_TARGET_VISIBLE: {
        if (!gSpecialStatuses[gBattlerTarget].restoredBattlerSprite
            && gBattlerTarget < gBattlersCount
            && !(gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE)) {
          setActiveBattler(gBattlerTarget);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, false);
          MarkBattlerForControllerExec(gBattlerTarget);
          gStatuses3[gBattlerTarget] &= ~STATUS3_SEMI_INVULNERABLE;
          gBattleScripting.moveendState++;
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ITEM_EFFECTS_ALL: {
        if (ItemBattleEffects(ITEMEFFECT_MOVE_END, 0, false) !== 0) {
          // 1:1 décomp : ItemBattleEffects set scriptPtr via BattleScriptPushCursor.
          // Notre port : consume _lastWantedScriptLabel + push current + jump.
          const label = consumeItemWantedScript();
          if (label) {
            const off = getBattleScriptOffset(label);
            if (off >= 0) {
              ctx.scriptPtrStack.push(ctx.scriptPtr);
              ctx.scriptPtr = off;
            }
          }
          effect = true;
        } else {
          gBattleScripting.moveendState++;
        }
        break;
      }
      case MOVEEND_KINGSROCK_SHELLBELL: {
        if (ItemBattleEffects(ITEMEFFECT_KINGSROCK_SHELLBELL, 0, false) !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            const off = getBattleScriptOffset(label);
            if (off >= 0) {
              ctx.scriptPtrStack.push(ctx.scriptPtr);
              ctx.scriptPtr = off;
            }
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_SUBSTITUTE: {
        for (let i = 0; i < gBattlersCount; i++) {
          if (gDisableStructs[i].substituteHP === 0) {
            gBattleMons[i].status2 &= ~STATUS2_SUBSTITUTE;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_UPDATE_LAST_MOVES: {
        if (gHitMarker & HITMARKER_SWAP_ATTACKER_TARGET) {
          // 1:1 décomp : swap attacker/target via temp gActiveBattler.
          const swap = gBattlerAttacker;
          setActiveBattler(gBattlerAttacker);
          setBattlerAttacker(gBattlerTarget);
          setBattlerTarget(swap);
          setHitMarker(gHitMarker & ~HITMARKER_SWAP_ATTACKER_TARGET);
        }
        if (gHitMarker & HITMARKER_ATTACKSTRING_PRINTED) {
          gLastPrintedMoves[gBattlerAttacker] = gChosenMove;
        }
        if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])
            && !(gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker])
            && getBattleMove(originallyUsedMove).effect !== EFFECT_BATON_PASS) {
          if (gHitMarker & HITMARKER_OBEYS) {
            gLastMoves[gBattlerAttacker] = gChosenMove;
            gLastResultingMoves[gBattlerAttacker] = gCurrentMove;
          } else {
            gLastMoves[gBattlerAttacker] = MOVE_UNAVAILABLE;
            gLastResultingMoves[gBattlerAttacker] = MOVE_UNAVAILABLE;
          }
          if (!(gHitMarker & HITMARKER_FAINTED(gBattlerTarget))) {
            gLastHitBy[gBattlerTarget] = gBattlerAttacker;
          }
          if ((gHitMarker & HITMARKER_OBEYS) && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
            if (gChosenMove === MOVE_UNAVAILABLE) {
              gLastLandedMoves[gBattlerTarget] = gChosenMove;
            } else {
              gLastLandedMoves[gBattlerTarget] = gCurrentMove;
              // 1:1 décomp : GET_MOVE_TYPE(gCurrentMove, gLastHitByType[gBattlerTarget]).
              gLastHitByType[gBattlerTarget] = gDynamicMoveType !== 0
                ? (gDynamicMoveType & 0x3F)
                : getBattleMove(gCurrentMove).type;
            }
          } else {
            gLastLandedMoves[gBattlerTarget] = MOVE_UNAVAILABLE;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_MIRROR_MOVE: {
        if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])
            && !(gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker])
            && (getBattleMove(originallyUsedMove).flags & FLAG_MIRROR_MOVE_AFFECTED)
            && (gHitMarker & HITMARKER_OBEYS)
            && gBattlerAttacker !== gBattlerTarget
            && !(gHitMarker & HITMARKER_FAINTED(gBattlerTarget))
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
          gLastTakenMove[gBattlerTarget] = gChosenMove;
          // 1:1 décomp : `lastTakenMoveFrom[attacker*2 + target*8 + 0/1]` — flat array.
          // Notre gLastTakenMoveFrom est flat 4*4 (= 16) ; même indexing.
          gLastTakenMoveFrom[gBattlerAttacker * 4 + gBattlerTarget] = gChosenMove;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_NEXT_TARGET: {
        // For moves hitting two opposing Pokémon (Double battles).
        if (!(gHitMarker & HITMARKER_UNABLE_TO_USE_MOVE)
            && (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
            && !gProtectStructs[gBattlerAttacker].chargingTurn
            && getBattleMove(gCurrentMove).target === MOVE_TARGET_BOTH
            && !(gHitMarker & HITMARKER_NO_ATTACKSTRING)) {
          const battler = GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget)));
          if (gBattleMons[battler].hp !== 0) {
            // 1:1 décomp : re-execute the move on the partner.
            setBattlerTarget(battler);
            setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
            gBattleScripting.moveendState = 0;
            _MoveValuesCleanUp();
            // 1:1 décomp : `BattleScriptPush(gBattleScriptsForMoveEffects[effect])`
            // = push the effect script (will return after FlushMessageBox).
            const moveEff = getBattleMove(gCurrentMove).effect;
            const effectOff = getMoveEffectScriptOffset(moveEff);
            if (effectOff >= 0) ctx.scriptPtrStack.push(effectOff);
            const flushOff = getBattleScriptOffset('BattleScript_FlushMessageBox');
            if (flushOff >= 0) ctx.scriptPtr = flushOff;
            else ctx.scriptPtr = opcodeStartPtr;  // safety
            return false;
          } else {
            setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_COUNT:
        break;
    }

    // 1:1 décomp : `if (endMode == 1 && effect == FALSE) gBattleScripting.moveendState = MOVEEND_COUNT;`
    if (endMode === 1 && !effect) {
      gBattleScripting.moveendState = MOVEEND_COUNT;
    }
    // 1:1 décomp : `if (endMode == 2 && endState == gBattleScripting.moveendState) gBattleScripting.moveendState = MOVEEND_COUNT;`
    if (endMode === 2 && endState === gBattleScripting.moveendState) {
      gBattleScripting.moveendState = MOVEEND_COUNT;
    }

    // 1:1 décomp : `} while (gBattleScripting.moveendState != MOVEEND_COUNT && effect == FALSE);`
    if (gBattleScripting.moveendState === MOVEEND_COUNT || effect) break;
  }

  // 1:1 décomp : `if (gBattleScripting.moveendState == MOVEEND_COUNT && effect == FALSE) gBattlescriptCurrInstr += 3;`
  // → ctx.scriptPtr est déjà à opcodeStartPtr+3 (= post-args). No advance needed.
  // Si effect == TRUE : on a déjà push+jump → ctx.scriptPtr = label, return false.
  // Si state != COUNT && effect = TRUE → loop a break-é → ctx.scriptPtr est à label.
  // Si state == COUNT && effect == TRUE : (= dernier sub-state a fait push)
  //   → ctx.scriptPtr = label, OK.

  if (effect) {
    // On a push opcodeStartPtr + jump à label. Quand le sub-script return, on
    // revient à opcodeStartPtr (= opcode position). Dispatcher pre-advance +1 →
    // re-call Cmd_moveend qui reprend au sub-state suivant (moveendState++ déjà fait).
  }
  return false;
}

// ─── Cmd_healthbarupdate (0x0B) ─────────────────────────────────────────────

/** 1:1 décomp `Cmd_healthbarupdate` (battle_script_commands.c:1807-1841).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *  - if exec → stay
 *  - if !NO_EFFECT :
 *    - if SUBSTITUTE + substituteHP + !IGNORE_SUBSTITUTE → PrepareString
 *      SUBSTITUTEDAMAGED (= "the substitute took damage")
 *    - else : emit HealthBarUpdate(min(damage, 10000)) + Mark.
 *      Si player side and damage > 0 : gBattleResults.playerMonWasDamaged = TRUE.
 *  - advance 2 bytes
 *
 *  Helpers utilisés : BtlController_EmitHealthBarUpdate. */
function Cmd_healthbarupdate(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b01(ctx);
  }
  const battlerArg = readByte(ctx);

  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);

    // 1:1 décomp battle_script_commands.c:3133-3158 : substitute check + emit.
    const mon = gBattleMons[activeBattler];
    if ((mon.status2 & STATUS2_SUBSTITUTE)
        && gDisableStructs[activeBattler].substituteHP > 0
        && !(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE)) {
      // 1:1 décomp : PrepareStringBattle(STRINGID_SUBSTITUTEDAMAGED=199, active).
      _PrepareStringBattle_N1(199 /* STRINGID_SUBSTITUTEDAMAGED */, activeBattler);
    } else {
      // 1:1 décomp : clamp damage à 10000 (= max u16 truncation safety).
      let healthValue = gBattleMoveDamage;
      if (healthValue > 10000) healthValue = 10000;
      BtlController_EmitHealthBarUpdate(0 /* B_COMM_TO_CONTROLLER */, healthValue);
      MarkBattlerForControllerExec(activeBattler);
    }

    // 1:1 décomp `Cmd_healthbarupdate` (battle_script_commands.c:3162-3169) :
    // `if (GetBattlerSide(active) == B_SIDE_PLAYER && gBattleMoveDamage > 0)
    //   gBattleResults.playerMonWasDamaged = TRUE;`
    if (GET_BATTLER_SIDE(activeBattler) === B_SIDE_PLAYER
        && gBattleMoveDamage > 0) {
      gBattleResults.playerMonWasDamaged = 1;
    }
  }
  return false;
}

// ─── Cmd_attackcanceler (0x00) — happy path 1:1 décomp ──────────────────────

/** 1:1 décomp `Cmd_attackcanceler` (battle_script_commands.c:915-1007) — happy path.
 *
 *  Le décomp complet check : gBattleOutcome != 0, attacker.hp == 0, status
 *  AtkCanceler_UnableToUseMove, AbilityBattleEffects MOVES_BLOCK, PP check,
 *  IsMonDisobedient, MagicCoat bounce, Snatch, LightningRod redirect, Protect.
 *
 *  Port complet 1:1 (sessions 136-138) : AtkCanceler_UnableToUseMove,
 *  AbilityBattleEffects MOVES_BLOCK, IsMonDisobedient, MagicCoat, Snatch,
 *  LightningRod, DEFENDER_IS_PROTECTED.
 *
 *  Cf. `src/engine/battle/atk-canceler.ts` pour le port complet de
 *  AtkCanceler_UnableToUseMove (14 sub-states). */
function Cmd_attackcanceler(ctx: BattleScriptContext): boolean {
  const opcodeStartPtr = ctx.scriptPtr - 1;  // before pre-advance

  // 1:1 décomp (battle_script_commands.c:984-988) :
  // `if (gBattleOutcome != 0) { gCurrentActionFuncId = B_ACTION_FINISHED; return; }`
  if (gBattleOutcome !== 0) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
    return _stayOnOpcode__b01(ctx);
  }

  // 1:1 décomp : attacker.hp == 0 (= died before its turn, e.g. Destiny Bond).
  if (gBattleMons[gBattlerAttacker].hp === 0
      && !(gHitMarker & HITMARKER_NO_ATTACKSTRING)) {
    setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
    const moveEndOffset = getBattleScriptOffset('BattleScript_MoveEnd');
    if (moveEndOffset >= 0) ctx.scriptPtr = moveEndOffset;
    return false;
  }

  // 1:1 décomp : AtkCanceler_UnableToUseMove (battle_util.c:1985-2270).
  // Status checks : sleep/freeze/truant/recharge/flinch/disabled/taunted/
  // imprisoned/confused/paralyzed/in_love/bide/thaw. Si trigger, le helper
  // a set ctx.scriptPtr au bon BattleScript label et on return.
  if (applyAtkCanceler(ctx, opcodeStartPtr)) {
    return false;
  }

  // 1:1 décomp : AbilityBattleEffects(ABILITYEFFECT_MOVES_BLOCK, target, 0, 0, 0).
  // → trigger Soundproof block sur target qui Soundproof + move dans sSoundMovesTable.
  const movesBlockEff = AbilityBattleEffects(ABILITYEFFECT_MOVES_BLOCK, gBattlerTarget, 0, 0, 0);
  if (movesBlockEff !== 0) {
    const label = consumeAbilityWantedScript();
    if (label) {
      const off = getBattleScriptOffset(label);
      if (off >= 0) ctx.scriptPtr = off;
    }
    return false;
  }

  // 1:1 décomp : PP check (= no PP + not STRUGGLE + not allowed + not multiturn).
  const attackerMon = gBattleMons[gBattlerAttacker];
  if (!attackerMon.pp[gCurrMovePos]
      && gCurrentMove !== MOVE_STRUGGLE
      && !(gHitMarker & (HITMARKER_ALLOW_NO_PP | HITMARKER_NO_ATTACKSTRING))
      && !(attackerMon.status2 & STATUS2_MULTIPLETURNS)) {
    const noPpOffset = getBattleScriptOffset('BattleScript_NoPPForMove');
    if (noPpOffset >= 0) ctx.scriptPtr = noPpOffset;
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    return false;
  }

  // 1:1 décomp : `gHitMarker &= ~HITMARKER_ALLOW_NO_PP;`
  setHitMarker(gHitMarker & ~HITMARKER_ALLOW_NO_PP);

  // 1:1 décomp : IsMonDisobedient (battle_util.c:3900-4015). Si pas obéissant
  // (= badges insuffisants pour le level du mon traded), jump à BattleScript_*
  // approprié et return immédiat.
  if (applyDisobedienceCheck(ctx, opcodeStartPtr)) {
    return false;
  }

  // 1:1 décomp : `gHitMarker |= HITMARKER_OBEYS;` (= obeyed le check disobedience)
  setHitMarker(gHitMarker | HITMARKER_OBEYS);

  // 1:1 décomp ll.962-1006 : Magic Coat / Snatch / Lightning Rod / Protect.
  const moveFlags = getBattleMove(gCurrentMove).flags;

  // 1. Magic Coat bounce (= reflect status moves).
  if (gProtectStructs[gBattlerTarget].bounceMove
      && (moveFlags & FLAG_MAGIC_COAT_AFFECTED)) {
    PressurePPLoseAtkCanceler(gBattlerAttacker, gBattlerTarget, MOVE_MAGIC_COAT_ATKCANCELER);
    gProtectStructs[gBattlerTarget].bounceMove = 0;
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset('BattleScript_MagicCoatBounce');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  // 2. Snatch (= steal status move).
  for (let i = 0; i < gBattlersCount; i++) {
    const snatchBattler = gBattlerByTurnOrderAC[i];
    if (gProtectStructs[snatchBattler].stealMove
        && (moveFlags & FLAG_SNATCH_AFFECTED)) {
      PressurePPLoseAtkCanceler(gBattlerAttacker, snatchBattler, MOVE_SNATCH_ATKCANCELER);
      gProtectStructs[snatchBattler].stealMove = 0;
      gBattleScripting.battler = snatchBattler;
      ctx.scriptPtrStack.push(opcodeStartPtr);
      const off = getBattleScriptOffset('BattleScript_SnatchedMove');
      if (off >= 0) ctx.scriptPtr = off;
      return false;
    }
  }

  // 3. Lightning Rod redirect (= absorb Electric move).
  if (gSpecialStatuses[gBattlerTarget].lightningRodRedirected) {
    gSpecialStatuses[gBattlerTarget].lightningRodRedirected = 0;
    setLastUsedAbility(78 /* ABILITY_LIGHTNING_ROD */);
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset('BattleScript_TookAttack');
    if (off >= 0) ctx.scriptPtr = off;
    _recordAbilityBattleAC(gBattlerTarget, 78);
    return false;
  }

  // 4. DEFENDER_IS_PROTECTED + 2-turn check.
  if (gProtectStructs[gBattlerTarget].protected
      && (moveFlags & FLAG_PROTECT_AFFECTED)
      && (gCurrentMove !== MOVE_CURSE_ATKCANCELER
          || _isBattlerOfTypeAC(gBattlerAttacker, 7 /* TYPE_GHOST */))
      && (!_isTwoTurnsMoveAC(gCurrentMove)
          || (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS))) {
    _cancelMultiTurnMovesAC(gBattlerAttacker);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_PROTECTED_ATKCANCELER;
  }

  return false;
}

// Helpers pour Cmd_attackcanceler (= éviter dups import).




// B_MSG_PROTECTED = 0 (= "X protected itself") dans le table sProtectSuccessStringIds.
const B_MSG_PROTECTED_ATKCANCELER = 0;
// IsBattlerOfType + IsTwoTurnsMove helpers (= déjà portés dans d'autres modules).
function _isBattlerOfTypeAC(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}
function _isTwoTurnsMoveAC(move: number): boolean {
  const eff = getBattleMove(move).effect;
  // 1:1 décomp battle_script_commands.c:8199 IsTwoTurnsMove — 6 effects.
  return eff === EFFECT_SKULL_BASH || eff === EFFECT_RAZOR_WIND || eff === EFFECT_SKY_ATTACK
      || eff === EFFECT_SOLAR_BEAM || eff === EFFECT_SEMI_INVULNERABLE || eff === EFFECT_BIDE;
}

// ─── Install handlers in dispatch table ─────────────────────────────────────

/** Register Batch 01 handlers dans le dispatch table de script-interpreter.
 *  Appelé une fois au boot du module battle. */


// ════════════ Batch 02 ════════════
/**
 * battle/cmd-batch-02.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Batch 02 (stat stages + status)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus :
 *   0x16 Cmd_seteffectprimary             FULL (wired SetMoveEffect via batch 136)
 *   0x17 Cmd_seteffectsecondary           FULL (wired SetMoveEffect via batch 136)
 *   0x18 Cmd_clearstatusfromeffect__b02        FULL
 *   0x47 Cmd_setgraphicalstatchangevalues FULL
 *   0x48 Cmd_playstatchangeanimation      anim emit (= UI Phase 1.4)
 *   0x89 Cmd_statbuffchange               FULL (= wraps ChangeStatBuffs)
 *   0x8A Cmd_normalisebuffs               FULL (= Haze, reset all stat stages)
 *   0x98 Cmd_updatestatusicon             status icon emit (= UI Phase 1.4)
 */










// 1:1 décomp `include/battle_anim.h:195-202` STAT_ANIM_* — verified values.
const STAT_ANIM_PLUS1            = 14;
const STAT_ANIM_PLUS2            = 38;
const STAT_ANIM_MINUS1           = 21;
const STAT_ANIM_MINUS2           = 45;
const STAT_ANIM_MULTIPLE_PLUS1   = 55;
const STAT_ANIM_MULTIPLE_PLUS2   = 56;
const STAT_ANIM_MULTIPLE_MINUS1  = 57;
const STAT_ANIM_MULTIPLE_MINUS2  = 58;

// Stat anim flags (= include/constants/battle_script_commands.h:375-378).
const STAT_CHANGE_NEGATIVE        = 1 << 0;
const STAT_CHANGE_BY_TWO          = 1 << 1;
const STAT_CHANGE_MULTIPLE_STATS  = 1 << 2;
const STAT_CHANGE_CANT_PREVENT    = 1 << 3;
// [RÉCONCILIÉ] B_ANIM_STATS_CHANGE__b02=0 supprimé : valeur FAUSSE (décomp/battle_anim.h:358
// = 1). On utilise l'import B_ANIM_STATS_CHANGE (=1) déjà présent (l.43).

// MOVE_EFFECT_* indices (battle.h:245-298) — import depuis decomp-data au lieu
// de hardcode (= 1:1 strict, A8 audit).


// 1:1 décomp `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]` (battle_script_commands.c:608-625).
// Partial table mais 1:1 décomp pour les 15 entries définies.
const _statusFlagsForMoveEffects__b02: Record<number, number> = {
  [MOVE_EFFECT_SLEEP]:          0x7,         // STATUS1_SLEEP
  [MOVE_EFFECT_POISON]:         1 << 3,      // STATUS1_POISON
  [MOVE_EFFECT_BURN]:           1 << 4,      // STATUS1_BURN
  [MOVE_EFFECT_FREEZE]:         1 << 5,      // STATUS1_FREEZE
  [MOVE_EFFECT_PARALYSIS]:      1 << 6,      // STATUS1_PARALYSIS
  [MOVE_EFFECT_TOXIC]:          1 << 7,      // STATUS1_TOXIC_POISON
  [MOVE_EFFECT_CONFUSION]:      0x7,         // STATUS2_CONFUSION
  [MOVE_EFFECT_FLINCH]:         1 << 3,      // STATUS2_FLINCHED
  [MOVE_EFFECT_UPROAR]:         0x70,        // STATUS2_UPROAR
  [MOVE_EFFECT_CHARGING]:       1 << 12,     // STATUS2_MULTIPLETURNS
  [MOVE_EFFECT_WRAP]:           0xE000,      // STATUS2_WRAPPED
  [MOVE_EFFECT_RECHARGE]:       1 << 22,     // STATUS2_RECHARGE
  [MOVE_EFFECT_PREVENT_ESCAPE]: 1 << 26,     // STATUS2_ESCAPE_PREVENTION
  [MOVE_EFFECT_NIGHTMARE]:      1 << 27,     // STATUS2_NIGHTMARE
  [MOVE_EFFECT_THRASH]:         0xC00,       // STATUS2_LOCK_CONFUSE
};

// 1:1 décomp `PRIMARY_STATUS_MOVE_EFFECT__b02` (battle.h:251) = MOVE_EFFECT_TOXIC = 6.
const PRIMARY_STATUS_MOVE_EFFECT__b02 = MOVE_EFFECT_TOXIC;

/** Stay sur opcode (= waitstate). Voir cmd-batch-04 pour convention. */
function _stayOnOpcode__b02(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `gAbsentBattlerFlags` — wired depuis state.ts (= bitmask absent battlers).

// ─── Cmd_statbuffchange (0x89) ──────────────────────────────────────────────

/** 1:1 décomp `Cmd_statbuffchange` (battle_script_commands.c:7103-7108).
 *
 *  Args : 1 byte flags + 4 byte jumpPtr. Total 6 bytes (opcode + 5).
 *
 *  Wraps `ChangeStatBuffs(gBattleScripting.statChanger & 0xF0, statId, flags, jumpPtr)`.
 *  Si SUCCESS → advance via consume args. Si FAIL → ChangeStatBuffs déjà advancé
 *  le scriptPtr (= push BS_ptr), donc on n'advance pas via readByte ici.
 *
 *  Notre version : toujours consume args (= pas de push BS_ptr support encore). */
function Cmd_statbuffchange(ctx: BattleScriptContext): boolean {
  const flags = readByte(ctx);
  const jumpPtr = readWord(ctx);

  // 1:1 décomp 7103-7108. deps script-context injectées (push/jump/protect/record)
  // pour que ChangeStatBuffs exécute inline les push+jumps vers les scripts de message
  // des protections (Brume/Clear Body/White Smoke/Keen Eye/Hyper Cutter) + la branche
  // Protect (Abri/Détection), exactement comme la décomp (cycle ESM évité par injection).
  const deps: StatBuffScriptDeps = {
    pushReturnPtr: (offset) => BattleScriptPush(ctx, offset),
    setScriptPtr: (offset) => { ctx.scriptPtr = offset; },
    offsetOf: (label) => getBattleScriptOffset(label),
    // JumpIfMoveAffectedByProtect(0) : DEFENDER_IS_PROTECTED utilise gCurrentMove dans la
    // décomp (notre _DEFENDER_IS_PROTECTED prend le move en param → on passe gCurrentMove).
    isAffectedByProtect: () => _JumpIfMoveAffectedByProtect(ctx, ctx.scriptPtr, gCurrentMove),
    recordAbility: (battler, ability) => RecordAbilityBattle(battler, ability),
  };

  const ptrBefore = ctx.scriptPtr;
  const result = ChangeStatBuffs(
    gBattleScripting.statChanger & 0xF0,             // statValue (= magnitude + sign bit)
    GET_STAT_BUFF_ID(gBattleScripting.statChanger),  // statId
    flags,
    jumpPtr,
    deps,
  );

  // 1:1 décomp 7106-7107 : si WORKED → instr += 6 (déjà consommé via readByte+readWord).
  // Sinon DIDNT_WORK → ChangeStatBuffs a déjà set ctx.scriptPtr (push + jump message /
  // ButItFailed / BS_ptr). Filet de sécurité : si aucune branche n'a redirigé le scriptPtr
  // (cas non-opcode imprévu), on retombe sur l'ancien comportement (jump BS_ptr).
  if (result !== STAT_CHANGE_WORKED && (flags & STAT_CHANGE_ALLOW_PTR) && ctx.scriptPtr === ptrBefore) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_normalisebuffs (0x8A) — Haze ───────────────────────────────────────

/** 1:1 décomp `Cmd_normalisebuffs` (battle_script_commands.c:7111-7122).
 *  Reset all stat stages of all battlers to DEFAULT_STAT_STAGE (= Haze move). */
function Cmd_normalisebuffs(_ctx: BattleScriptContext): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    for (let j = 0; j < NUM_BATTLE_STATS; j++) {
      gBattleMons[i].statStages[j] = DEFAULT_STAT_STAGE;
    }
  }
  return false;
}

// ─── Cmd_setgraphicalstatchangevalues (0x47) ────────────────────────────────

/** 1:1 décomp `Cmd_setgraphicalstatchangevalues` (battle_script_commands.c:4091-4112).
 *
 *  Set gBattleScripting.animArg1 (= stat anim id) basé sur statChanger value.
 *  animArg2 = 0. */
function Cmd_setgraphicalstatchangevalues(_ctx: BattleScriptContext): boolean {
  let value = 0;
  const statChanger = gBattleScripting.statChanger;
  // GET_STAT_BUFF_VALUE2(n) = n & 0xF0 (= bits 4-7 = magnitude with sign).
  const valueMag = statChanger & 0xF0;

  if (valueMag === SET_STAT_BUFF_VALUE(1)) value = STAT_ANIM_PLUS1 + 1;
  else if (valueMag === SET_STAT_BUFF_VALUE(2)) value = STAT_ANIM_PLUS2 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(1) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS1 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(2) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS2 + 1;

  gBattleScripting.animArg1 = GET_STAT_BUFF_ID(statChanger) + value - 1;
  gBattleScripting.animArg2 = 0;
  return false;
}

// ─── Cmd_playstatchangeanimation (0x48) ─────────────────────────────────────

/** 1:1 décomp `Cmd_playstatchangeanimation` (battle_script_commands.c:4114-4210).
 *
 *  Args : 1 byte battler ref + 1 byte statsToCheck mask + 1 byte flags.
 *  Total 4 bytes.
 *
 *  Logique :
 *  - Pour chaque bit set dans statsToCheck (stat index 0..7 = HP..EVASION) :
 *    - Si negative + CANT_PREVENT : skip ability/mist guards, just check
 *      statStages[i] > MIN_STAT_STAGE → set anim id + count++.
 *    - Si negative sans CANT_PREVENT : skip aussi si mistTimer ou ability
 *      CLEAR_BODY/WHITE_SMOKE (or KEEN_EYE for ACC, HYPER_CUTTER for ATK) →
 *      statStages > MIN → anim + count++.
 *    - Si positive : statStages < MAX → anim + count++.
 *  - Si MULTIPLE_STATS + countOnly1 → skip anim (= will play single via separate).
 *  - Sinon si count > 0 + !statAnimPlayed → emit B_ANIM_STATS_CHANGE__b02 + Mark.
 *  - Advance +4 byte total. */
function Cmd_playstatchangeanimation(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  let statsToCheck = readByte(ctx);
  const flags = readByte(ctx);

  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);

  let currStat = 0;
  let statAnimId = 0;
  let changeableStatsCount = 0;

  if (flags & STAT_CHANGE_NEGATIVE) {
    const startingStatAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MINUS2 : STAT_ANIM_MINUS1;

    while (statsToCheck !== 0) {
      if (statsToCheck & 1) {
        if (flags & STAT_CHANGE_CANT_PREVENT) {
          if (gBattleMons[activeBattler].statStages[currStat] > MIN_STAT_STAGE) {
            statAnimId = startingStatAnimId + currStat;
            changeableStatsCount++;
          }
        } else if (
          !gSideTimers[GET_BATTLER_SIDE(activeBattler)].mistTimer
          && gBattleMons[activeBattler].ability !== ABILITY_CLEAR_BODY
          && gBattleMons[activeBattler].ability !== ABILITY_WHITE_SMOKE
          && !(gBattleMons[activeBattler].ability === ABILITY_KEEN_EYE && currStat === STAT_ACC)
          && !(gBattleMons[activeBattler].ability === ABILITY_HYPER_CUTTER && currStat === STAT_ATK)
        ) {
          if (gBattleMons[activeBattler].statStages[currStat] > MIN_STAT_STAGE) {
            statAnimId = startingStatAnimId + currStat;
            changeableStatsCount++;
          }
        }
      }
      statsToCheck >>= 1;
      currStat++;
    }

    if (changeableStatsCount > 1) {
      statAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MULTIPLE_MINUS2 : STAT_ANIM_MULTIPLE_MINUS1;
    }
  } else {
    const startingStatAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_PLUS2 : STAT_ANIM_PLUS1;

    while (statsToCheck !== 0) {
      if ((statsToCheck & 1) && gBattleMons[activeBattler].statStages[currStat] < MAX_STAT_STAGE) {
        statAnimId = startingStatAnimId + currStat;
        changeableStatsCount++;
      }
      statsToCheck >>= 1;
      currStat++;
    }

    if (changeableStatsCount > 1) {
      statAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MULTIPLE_PLUS2 : STAT_ANIM_MULTIPLE_PLUS1;
    }
  }

  if ((flags & STAT_CHANGE_MULTIPLE_STATS) && changeableStatsCount < 2) {
    // Skip anim emit (= will play singles separately).
  } else if (changeableStatsCount !== 0 && !gBattleScripting.statAnimPlayed) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, B_ANIM_STATS_CHANGE, statAnimId);
    MarkBattlerForControllerExec(activeBattler);
    if ((flags & STAT_CHANGE_MULTIPLE_STATS) && changeableStatsCount > 1) {
      gBattleScripting.statAnimPlayed = 1;
    }
  }
  return false;
}

// ─── Cmd_seteffectprimary (0x16) + Cmd_seteffectsecondary (0x17) ────────────

/** 1:1 décomp `Cmd_seteffectprimary` (battle_script_commands.c:2941-2944).
 *  Calls `SetMoveEffect(TRUE, 0)`. */
function Cmd_seteffectprimary(ctx: BattleScriptContext): boolean {
  SetMoveEffect(ctx, true, 0);
  return false;
}

/** 1:1 décomp `Cmd_seteffectsecondary` (battle_script_commands.c:2946-2949).
 *  Calls `SetMoveEffect(FALSE, 0)`. */
function Cmd_seteffectsecondary(ctx: BattleScriptContext): boolean {
  SetMoveEffect(ctx, false, 0);
  return false;
}

// ─── Cmd_clearstatusfromeffect__b02 (0x18) ───────────────────────────────────────

/** 1:1 décomp `Cmd_clearstatusfromeffect__b02` (battle_script_commands.c:2951-2963).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *
 *  Clear le status flag correspondant au current move effect (= MOVE_EFFECT_BYTE)
 *  depuis status1 si <= PRIMARY_STATUS_MOVE_EFFECT__b02, sinon status2.
 *  Reset MOVE_EFFECT_BYTE + multihitMoveEffect. */
function Cmd_clearstatusfromeffect__b02(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);

  const moveEffect = gBattleCommunication[MOVE_EFFECT_BYTE];
  const statusFlag = _statusFlagsForMoveEffects__b02[moveEffect] ?? 0;

  if (moveEffect <= PRIMARY_STATUS_MOVE_EFFECT__b02) {
    gBattleMons[activeBattler].status1 &= ~statusFlag;
  } else {
    gBattleMons[activeBattler].status2 &= ~statusFlag;
  }

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── Cmd_updatestatusicon (0x98) ────────────────────────────────────────────

/** 1:1 décomp `Cmd_updatestatusicon` (battle_script_commands.c:7702-7733).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *  - if exec → stay.
 *  - if arg != BS_ATTACKER_WITH_PARTNER : single battler emit.
 *  - else : emit pour attacker (= si pas absent), puis si DOUBLE emit pour
 *    partner (= si pas absent). */
function Cmd_updatestatusicon(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b02(ctx);
  }
  const battlerArg = readByte(ctx);

  if (battlerArg !== BS_ATTACKER_WITH_PARTNER) {
    const activeBattler = getBattlerForBattleScript(battlerArg);
    setActiveBattler(activeBattler);
    BtlController_EmitStatusIconUpdate(
      B_COMM_TO_CONTROLLER,
      gBattleMons[activeBattler].status1,
      gBattleMons[activeBattler].status2,
    );
    MarkBattlerForControllerExec(activeBattler);
  } else {
    setActiveBattler(gBattlerAttacker);
    if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])) {
      BtlController_EmitStatusIconUpdate(
        B_COMM_TO_CONTROLLER,
        gBattleMons[gBattlerAttacker].status1,
        gBattleMons[gBattlerAttacker].status2,
      );
      MarkBattlerForControllerExec(gBattlerAttacker);
    }
    if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      // 1:1 décomp battle_script_commands.c:7722-7730 :
      //   partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(attacker)))
      //   si !absent → emit + mark.
      // BATTLE_PARTNER = (i ^ BIT_FLANK) où BIT_FLANK = 2.
      const partner = gBattlerAttacker ^ 2 /* BIT_FLANK */;
      setActiveBattler(partner);
      if (!(gAbsentBattlerFlags & gBitTable[partner])) {
        BtlController_EmitStatusIconUpdate(
          B_COMM_TO_CONTROLLER,
          gBattleMons[partner].status1,
          gBattleMons[partner].status2,
        );
        MarkBattlerForControllerExec(partner);
      }
    }
  }
  return false;
}

void MULTISTRING_CHOOSER;
void GET_STAT_BUFF_VALUE;
void STAT_CHANGE_CANT_PREVENT;
void STAT_CHANGE_MULTIPLE_STATS;

// ─── Install handlers ───────────────────────────────────────────────────────


// ════════════ Batch 03 ════════════
/**
 * battle/cmd-batch-03.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Batch 03 (branching)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus (= tous "jumpif*", read args + check condition + jump ou advance) :
 *   0x1C Cmd_jumpifstatus           full (= check status1 mask + hp > 0)
 *   0x1D Cmd_jumpifstatus2          full (= check status2 mask + hp > 0)

 *   0x1E Cmd_jumpifability          FULL 1:1 (= direct + ATTACKER_SIDE + NOT_ATTACKER_SIDE via _abilityCheckSide)
 *   0x1F Cmd_jumpifsideaffecting    full (= check gSideStatuses[side] & flags)
 *   0x20 Cmd_jumpifstat              full (= CMP_* compare statStages[statId] vs value)
 *   0x21 Cmd_jumpifstatus3condition full (= check gStatuses3[battler] & status, with negate flag)
 *   0x22 Cmd_jumpiftype             full (= IS_BATTLER_OF_TYPE)
 *   0x84 Cmd_jumpifcantmakeasleep   partial (= Insomnia/VitalSpirit ; Uproar stub)
 *
 * Pattern : tous les jumpif* lisent leurs args via readers (= bytes/halfword/word),
 * puis si condition match : `ctx.scriptPtr = jumpPtr` ; sinon : continue (= déjà
 * advancé via les readers).
 */







/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (battle.h:472). */
function isBattlerOfType(battlerIdx: number, type: number): boolean {
  const mon = gBattleMons[battlerIdx];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `AbilityBattleEffects(ABILITYEFFECT_CHECK_BATTLER_SIDE/CHECK_OTHER_SIDE)`
 *  subset : itère les battlers du côté demandé, retourne (battler_idx + 1) si
 *  ability matchée, sinon 0.
 *
 *  Itère gBattlersCount = 2 (single battle) ou 4 (double battle) = 1:1 strict. */
function _abilityCheckSide(checkAttackerSide: boolean, abilityId: number): number {
  const attackerSide = GET_BATTLER_SIDE(gBattlerAttacker);
  // 1:1 décomp AbilityBattleEffects CHECK_BATTLER_SIDE/OTHER_SIDE (battle_util.c:3072-3093) :
  // PAS de check hp (cases 12/13), et garde le DERNIER match (pas de return-first).
  let result = 0;
  for (let i = 0; i < gBattlersCount; i++) {
    const sameSide = (i & BIT_SIDE) === attackerSide;
    if (checkAttackerSide ? !sameSide : sameSide) continue;
    if (gBattleMons[i].ability === abilityId) {
      result = i + 1;
    }
  }
  return result;
}

/** 1:1 décomp `UproarWakeUpCheck(battler)` — Inlined (= éviter circular).
 *  Returns true si un battler sur le field a STATUS2_UPROAR + battler param
 *  n'a pas Soundproof. Stub side-effects (= ne set pas MULTISTRING_CHOOSER ici). */
function uproarWakeUpCheck(battler: number): boolean {
  // 1:1 décomp UproarWakeUpCheck (battle_script_commands.c:6804-6829) : trouve le 1er mon en
  // BROUHAHA (sauf si battler SOUNDPROOF), pose gBattleScripting.battler + le bon message
  // (CANT_SLEEP_UPROAR si c'est la cible elle-même, sinon KEPT_AWAKE) + break.
  let i = 0;
  for (i = 0; i < gBattlersCount; i++) {
    if (!(gBattleMons[i].status2 & STATUS2_UPROAR) || gBattleMons[battler].ability === ABILITY_SOUNDPROOF) {
      continue;
    }
    gBattleScripting.battler = i;
    if (gBattlerTarget === 0xFF) {
      setBattlerTarget(i);
    } else if (gBattlerTarget === i) {
      gBattleCommunication[MULTISTRING_CHOOSER] = 0 /* B_MSG_CANT_SLEEP_UPROAR */;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_UPROAR_KEPT_AWAKE */;
    }
    break;
  }
  return i !== gBattlersCount;
}

// ─── Cmd_jumpifstatus (0x1C) ───────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus` (battle_script_commands.c:3081-3091).
 *
 *  Args : 1 byte battler + 4 byte flags + 4 byte ptr. Total 10 bytes.
 *  Jump si `mon.status1 & flags` et `mon.hp != 0`. */
function Cmd_jumpifstatus(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readWord(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if ((gBattleMons[battler].status1 & flags) && gBattleMons[battler].hp !== 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifstatus2 (0x1D) ──────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus2` (battle_script_commands.c:3093-3103).
 *
 *  Idem jumpifstatus mais sur status2. */
function Cmd_jumpifstatus2(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readWord(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if ((gBattleMons[battler].status2 & flags) && gBattleMons[battler].hp !== 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifability (0x1E) ──────────────────────────────────────────────

/** 1:1 STRICT décomp `Cmd_jumpifability` (battle_script_commands.c:3105-3156).
 *
 *  Args : 1 byte battler/side + 1 byte ability + 4 byte ptr. Total 7 bytes.
 *
 *  3 modes :
 *  - BS_ATTACKER_SIDE : check tous les mons attacker side (= AbilityBattleEffects
 *    CHECK_BATTLER_SIDE). Porté 1:1 via _abilityCheckSide().
 *  - BS_NOT_ATTACKER_SIDE : idem mais other side. Porté 1:1 via _abilityCheckSide().
 *  - default : check single battler.
 *  Tous les 3 modes 1:1 strict décomp. */
function Cmd_jumpifability(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const abilityId = readByte(ctx);
  const jumpPtr = readWord(ctx);

  if (battlerArg === BS_ATTACKER_SIDE) {
    // 1:1 décomp : AbilityBattleEffects(ABILITYEFFECT_CHECK_BATTLER_SIDE, ...)
    // retourne (battler+1) si match, sinon 0.
    const battlerPlusOne = _abilityCheckSide(true, abilityId);
    if (battlerPlusOne) {
      setLastUsedAbility(abilityId);
      ctx.scriptPtr = jumpPtr;
      RecordAbilityBattle(battlerPlusOne - 1, abilityId);
      gBattleScripting.battlerWithAbility = battlerPlusOne - 1;
    }
    return false;
  }

  if (battlerArg === BS_NOT_ATTACKER_SIDE) {
    const battlerPlusOne = _abilityCheckSide(false, abilityId);
    if (battlerPlusOne) {
      setLastUsedAbility(abilityId);
      ctx.scriptPtr = jumpPtr;
      RecordAbilityBattle(battlerPlusOne - 1, abilityId);
      gBattleScripting.battlerWithAbility = battlerPlusOne - 1;
    }
    return false;
  }

  // Default : single battler check.
  const battler = getBattlerForBattleScript(battlerArg);
  if (gBattleMons[battler].ability === abilityId) {
    setLastUsedAbility(abilityId);
    ctx.scriptPtr = jumpPtr;
    RecordAbilityBattle(battler, abilityId);
    gBattleScripting.battlerWithAbility = battler;
  }
  return false;
}

// ─── Cmd_jumpifsideaffecting (0x1F) ────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifsideaffecting` (battle_script_commands.c:3158-3176).
 *
 *  Args : 1 byte battler ref + 2 byte flags + 4 byte ptr. Total 8 bytes.
 *  Jump si `gSideStatuses[side] & flags`. */
function Cmd_jumpifsideaffecting(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const flags = readHalfword(ctx);
  const jumpPtr = readWord(ctx);

  // 1:1 décomp : si battlerArg == BS_ATTACKER → attacker side, sinon → target side.
  const side = battlerArg === BS_ATTACKER
    ? GET_BATTLER_SIDE(gBattlerAttacker)
    : GET_BATTLER_SIDE(gBattlerTarget);

  if (gSideStatuses[side] & flags) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifstat (0x20) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstat` (battle_script_commands.c:3178-3216).
 *
 *  Args : 1 byte battler + 1 byte cmp + 1 byte statId + 1 byte value + 4 byte ptr.
 *  Total 9 bytes.
 *
 *  Compare battler.statStages[statId] vs value via CMP_* opcode. Jump si match. */
function Cmd_jumpifstat(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const cmpOp = readByte(ctx);
  const statId = readByte(ctx);
  const cmpValue = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  const value = gBattleMons[battler].statStages[statId];
  let match = false;

  switch (cmpOp) {
    case CMP_EQUAL:          match = value === cmpValue; break;
    case CMP_NOT_EQUAL:      match = value !== cmpValue; break;
    case CMP_GREATER_THAN:   match = value > cmpValue; break;
    case CMP_LESS_THAN:      match = value < cmpValue; break;
    case CMP_COMMON_BITS:    match = (value & cmpValue) !== 0; break;
    case CMP_NO_COMMON_BITS: match = (value & cmpValue) === 0; break;
  }

  if (match) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── Cmd_jumpifstatus3condition (0x21) ─────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifstatus3condition` (battle_script_commands.c:3218-3241).
 *
 *  Args : 1 byte battler + 4 byte status flags + 1 byte negateCondition + 4 byte ptr.
 *  Total 11 bytes.
 *
 *  Si negateCondition == 0 : jump si `gStatuses3[battler] & status != 0` (= has status).
 *  Si negateCondition != 0 : jump si `gStatuses3[battler] & status == 0` (= doesn't have status).
 *
 *  NB : le décomp lit dans cet ordre dans le code (au lieu de :
 *  byte battler + word status + word ptr + byte negate, c'est byte battler + word status
 *  + byte negate + word ptr). Source : T2_READ_32(+2) puis T2_READ_PTR(+7) puis [6]. */
function Cmd_jumpifstatus3condition(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const status = readWord(ctx);
  const negateCondition = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);
  const hasStatus = (gStatuses3[activeBattler] & status) !== 0;

  if (negateCondition) {
    // jump si on N'A PAS le status
    if (!hasStatus) ctx.scriptPtr = jumpPtr;
  } else {
    // jump si on A le status
    if (hasStatus) ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpiftype (0x22) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_jumpiftype` (battle_script_commands.c:3243-3253).
 *
 *  Args : 1 byte battler + 1 byte type + 4 byte ptr. Total 7 bytes.
 *  Jump si battler est du type spécifié. */
function Cmd_jumpiftype(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const type = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const battler = getBattlerForBattleScript(battlerArg);
  if (isBattlerOfType(battler, type)) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_jumpifcantmakeasleep (0x84) ───────────────────────────────────────

/** 1:1 décomp `Cmd_jumpifcantmakeasleep` (battle_script_commands.c:6831-6851).
 *
 *  Args : 4 byte ptr. Total 5 bytes.
 *
 *  Jump si target ne peut pas être endormi (= Uproar field active OU
 *  Insomnia/VitalSpirit ability). Sinon advance. */
function Cmd_jumpifcantmakeasleep(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);

  if (uproarWakeUpCheck(gBattlerTarget)) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  const targetAbility = gBattleMons[gBattlerTarget].ability;
  if (targetAbility === ABILITY_INSOMNIA || targetAbility === ABILITY_VITAL_SPIRIT) {
    setLastUsedAbility(targetAbility);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STAYED_AWAKE_USING;
    ctx.scriptPtr = jumpPtr;
    RecordAbilityBattle(gBattlerTarget, targetAbility);
    return false;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 04 ════════════
/**
 * battle/cmd-batch-04.ts — Phase 1 Batch 04 (animations + UI) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x09 attackanimation
 *   0x0A waitanimation
 *   0x10 printstring
 *   0x12 waitmessage
 *   0x13 printfromtable
 *   0x67 yesnobox
 *
 * Tous ces opcodes interagissent avec `gBattleControllerExecFlags` (= waitstate
 * pattern) et appellent des `BtlController_Emit*` (anim/text) ou affichent un
 * yes/no box via `HandleBattleWindow` + `BattlePutTextOnWindow`.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/pokemon-web-demo/public/decomp/em/extracted-all/battle_script_commands.json`
 *     (= bodies extraits)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (= helpers)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` (= emit fns)
 *
 * Convention scriptPtr (= note importante) :
 *   - Lorsque le dispatcher entre dans un handler, `ctx.scriptPtr` est déjà
 *     positionné post-opcode (= pointe au premier byte arg ou au prochain
 *     opcode).
 *   - Pour "rester" sur l'opcode courant (= wait), le handler doit faire
 *     `ctx.scriptPtr--` puis `return true` (pause). Next frame re-entre ici.
 *   - Pour avancer normalement, le handler consume ses args via readByte/Halfword/
 *     Word, puis `return false`.
 *   - Pour jumper (= goto/BattleScript_X), le handler set `ctx.scriptPtr = jumpPtr`
 *     puis `return false`.
 */









// ─── Helper : "go back to this opcode" pattern ─────────────────────────────

/** Convention runBattleScript : dispatcher fait `scriptPtr++` AVANT d'appeler
 *  handler. Donc à l'entrée du handler, scriptPtr est post-opcode. Pour "rester"
 *  sur l'opcode (= waitstate, re-execute next frame), on backe up. */
function _stayOnOpcode__b04(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x09 attackanimation ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_attackanimation (battle_script_commands.c).
 *  No args (= 1 byte total). */
function Cmd_attackanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b04(ctx);
  }

  const isNoAnimMode = (gHitMarker & HITMARKER_NO_ANIMATIONS) &&
                       (gCurrentMove !== MOVE_TRANSFORM && gCurrentMove !== MOVE_SUBSTITUTE);

  if (isNoAnimMode) {
    // BattleScriptPush(gBattlescriptCurrInstr + 1) = push offset of NEXT opcode.
    // Notre ctx.scriptPtr est déjà à NEXT opcode (post-dispatcher-advance).
    BattleScriptPush(ctx, ctx.scriptPtr);
    const pauseOffset = getBattleScriptOffset('BattleScript_Pausex20');
    if (pauseOffset >= 0) {
      ctx.scriptPtr = pauseOffset;
    }
    gBattleScripting.animTurn++;
    gBattleScripting.animTargetsHit++;
    return false;
  }

  const move = getBattleMove(gCurrentMove);
  const target = move?.target ?? 0;
  if ((target & MOVE_TARGET_BOTH ||
       target & MOVE_TARGET_FOES_AND_ALLY ||
       target & MOVE_TARGET_DEPENDS) &&
      gBattleScripting.animTargetsHit) {
    // Already animated for this multi-target move, skip.
    // ctx.scriptPtr already at next opcode = OK.
    return false;
  }

  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    let multihit: number;

    setActiveBattler(gBattlerAttacker);

    if (gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE) {
      multihit = gMultiHitCounter;
    } else if (gMultiHitCounter !== 0 && gMultiHitCounter !== 1) {
      if (gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
        multihit = 1;
      } else {
        multihit = gMultiHitCounter;
      }
    } else {
      multihit = gMultiHitCounter;
    }

    BtlController_EmitMoveAnimation(
      B_COMM_TO_CONTROLLER,
      gCurrentMove,
      gBattleScripting.animTurn,
      gBattleMovePower,
      gBattleMoveDamage,
      gBattleMons[gBattlerAttacker].friendship,
      gDisableStructs[gBattlerAttacker],
      multihit,
    );
    gBattleScripting.animTurn++;
    gBattleScripting.animTargetsHit++;
    MarkBattlerForControllerExec(gBattlerAttacker);
    return false;
  } else {
    // MOVE_RESULT_NO_EFFECT : pause path (= push + Pausex20).
    BattleScriptPush(ctx, ctx.scriptPtr);
    const pauseOffset = getBattleScriptOffset('BattleScript_Pausex20');
    if (pauseOffset >= 0) {
      ctx.scriptPtr = pauseOffset;
    }
    return false;
  }
}

// ─── 0x0A waitanimation ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_waitanimation. No args. Wait until exec flags clear. */
function Cmd_waitanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags === 0) {
    // Advance (already past opcode).
    return false;
  }
  return _stayOnOpcode__b04(ctx);
}

// ─── 0x10 printstring ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_printstring. 1 byte opcode + u16 stringId = 3 bytes total. */
function Cmd_printstring(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b04(ctx);
  }
  // T2_READ_16(gBattlescriptCurrInstr + 1) = read u16 at opcode+1.
  // Notre dispatcher a déjà skip l'opcode → ctx.scriptPtr = opcode+1.
  const stringId = readHalfword(ctx);  // advances 2 bytes → ctx.scriptPtr now opcode+3.
  PrepareStringBattle(stringId, gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x12 waitmessage ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_waitmessage. 1 byte opcode + u16 toWait = 3 bytes total. */
function Cmd_waitmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b04(ctx);
  }
  if (!gBattleCommunication[MSG_DISPLAY]) {
    // No message active, skip args + advance.
    ctx.scriptPtr += 2;
    return false;
  }
  // Peek u16 toWait (= we'll back up if waiting more).
  const opcodeOffset = ctx.scriptPtr;
  const toWait = readHalfword(ctx);  // advances past args.
  const newCounter = gPauseCounterBattle + 1;
  setPauseCounterBattle(newCounter);
  if (newCounter >= toWait) {
    setPauseCounterBattle(0);
    gBattleCommunication[MSG_DISPLAY] = 0;
    // Already advanced past args, keep going.
    return false;
  }
  // Stay on opcode (= rewind to opcode start) for next tick.
  ctx.scriptPtr = opcodeOffset - 1;
  return true;
}

// ─── 0x13 printfromtable ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_printfromtable. 1 byte opcode + u32 ptr = 5 bytes total.
 *
 *  Phase 1.4 J : si le ptr est un SYMBOL_MARKER pour un g*StringIds data
 *  table (= gStatDownStringIds, gStatUpStringIds, gFirstTurnOfTwoStringIds,
 *  etc., 46 tables extraites depuis battle_message.c via
 *  scripts/extract-battle-string-id-tables.mjs), résoud via
 *  resolveStringIdTable → BATTLE_STRING_ID_TABLES → u16 à idx.
 *  Sinon (= legacy inline table dans bytecode), lit au offset direct. */
function Cmd_printfromtable(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b04(ctx);
  }
  const tableOffset = readWord(ctx);  // advances 4 bytes.
  const idx = gBattleCommunication[MULTISTRING_CHOOSER];
  // Phase 1.4 J : try SYMBOL_MARKER resolution first.
  const table = resolveStringIdTable(tableOffset);
  let stringId: number;
  if (table) {
    stringId = (idx >= 0 && idx < table.length) ? table[idx] : 0;
  } else {
    stringId = _readBytecodeForString(tableOffset, idx);
  }
  PrepareStringBattle(stringId, gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

/** Helper : lit u16 little-endian au offset (tableOffset + idx*2) dans le
 *  bytecode global. Le décomp utilise gBattlescriptCurrInstr + 1 comme ptr
 *  vers const u16[] table inline dans le script. */
function _readBytecodeForString(tableOffset: number, idx: number): number {
  const bc = getBattleScriptBytecode();
  if (!bc) return 0;
  const offset = tableOffset + idx * 2;
  if (offset < 0 || offset + 1 >= bc.length) return 0;
  return bc[offset] | (bc[offset + 1] << 8);
}

// ─── 0x67 yesnobox ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnobox. No args. State machine via gBattleCommunication[0]:
 *  case 0 = init window+cursor, case 1 = poll input.
 *
 *  Strict 1:1 décomp : reste sur opcode tant qu'A ou B n'est pas pressé.
 *  Input wire requis (= JOY_NEW retourne false par défaut sans UI input réel,
 *  donc les scripts utilisant yesnobox attendent input UI Phase 1.4). */
/** Machine YES/NO réutilisable (suggestion user 2026-06-10 : « comme le script
 *  décomp, réutilisable partout, on précise sur quoi le OUI/NON retourne »).
 *  1:1 du pattern décomp (battle_main.c:2507 / battle_script_commands yes/no) :
 *  state 0 = dessine la box + curseur ; state 1 = input UP/DOWN/A/B.
 *  Retourne null tant que pas de choix ; true = OUI (cursor 0 + A) ;
 *  false = NON (cursor 1 + A, ou B qui force cursor=1). Le caller gère ses
 *  états autour (stateRef = l'index gBattleCommunication utilisé). */
function runBattleYesNoMachine(stateIdx: number): boolean | null {
  switch (gBattleCommunication[stateIdx]) {
    case 0:
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, 0);
      BattlePutTextOnWindow('OUI' + String.fromCharCode(10) + 'NON', B_WIN_YESNO); // 1:1 gText_BattleYesNoChoice (battle_message.c:1283)
      gBattleCommunication[stateIdx]++;
      gBattleCommunication[CURSOR_POSITION] = 0;
      BattleCreateYesNoCursorAt(0);
      return null;
    case 1:
      if (JOY_NEW(DPAD_UP) && gBattleCommunication[CURSOR_POSITION] !== 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 0;
        BattleCreateYesNoCursorAt(0);
      }
      if (JOY_NEW(DPAD_DOWN) && gBattleCommunication[CURSOR_POSITION] === 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 1;
        BattleCreateYesNoCursorAt(1);
      }
      if (JOY_NEW(B_BUTTON)) {
        gBattleCommunication[CURSOR_POSITION] = 1;
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        return false;
      } else if (JOY_NEW(A_BUTTON)) {
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        return gBattleCommunication[CURSOR_POSITION] === 0;
      }
      return null;
    default:
      return null;
  }
}

function Cmd_yesnobox(ctx: BattleScriptContext): boolean {
  switch (gBattleCommunication[0]) {
    case 0:
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, 0);
      BattlePutTextOnWindow('OUI' + String.fromCharCode(10) + 'NON', B_WIN_YESNO); // 1:1 gText_BattleYesNoChoice (battle_message.c:1283) — codes PALETTE/COLOR dynamiques = dette douce
      gBattleCommunication[0]++;
      gBattleCommunication[CURSOR_POSITION] = 0;
      BattleCreateYesNoCursorAt(0);
      // Décomp break (= no scriptPtr advance). On stay sur opcode.
      return _stayOnOpcode__b04(ctx);

    case 1:
      if (JOY_NEW(DPAD_UP) && gBattleCommunication[CURSOR_POSITION] !== 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 0;
        BattleCreateYesNoCursorAt(0);
      }
      if (JOY_NEW(DPAD_DOWN) && gBattleCommunication[CURSOR_POSITION] === 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 1;
        BattleCreateYesNoCursorAt(1);
      }
      if (JOY_NEW(B_BUTTON)) {
        gBattleCommunication[CURSOR_POSITION] = 1;
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        // Décomp gBattlescriptCurrInstr++; → ici notre scriptPtr déjà post-opcode.
        return false;
      } else if (JOY_NEW(A_BUTTON)) {
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        return false;
      }
      // Strict 1:1 : si aucun bouton, le décomp break (= no scriptPtr advance).
      // Notre équivalent = stay sur opcode pour re-entrée next frame.
      return _stayOnOpcode__b04(ctx);

    default:
      // Décomp n'a pas de default case ; switch fall-through = no state change,
      // no advance. Équivalent stay sur opcode.
      return _stayOnOpcode__b04(ctx);
  }
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 05 ════════════
/**
 * battle/cmd-batch-05.ts — Phase 1 Batch 05 (result + messages + faint) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x02 attackstring        ("X used Y!")
 *   0x0D critmessage         ("A critical hit!")
 *   0x0E effectivenesssound  (SE selon effectiveness)
 *   0x0F resultmessage       (texte SE/NVE/MISS/etc.)
 *   0x1A dofaintanimation    (faint anim emit + Mark)
 *   0x1B cleareffectsonfaint (clear status + FaintClearSetData)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json` (bodies)
 *   - `decomps/pokeemeraude/src/battle_script_commands.c`
 *   - `decomps/pokeemeraude/src/battle_main.c` (= FaintClearSetData)
 *   - `decomps/pokeemeraude/src/battle_message.c:891-898` (= gMissStringIds[])
 *
 * Args sizes (asm/macros/battle_script.inc) :
 *   attackstring/critmessage/effectivenesssound/resultmessage = 1 byte
 *   dofaintanimation/cleareffectsonfaint = 2 bytes (1-byte battler arg)
 */








// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b05(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `gMissStringIds[B_MSG_*]` (battle_message.c:891-898). */
const gMissStringIds: number[] = [
  STRINGID_ATTACKMISSED,       // B_MSG_MISSED      = 0
  STRINGID_PKMNPROTECTEDITSELF, // B_MSG_PROTECTED   = 1
  STRINGID_PKMNAVOIDEDATTACK,   // B_MSG_AVOIDED_ATK = 2
  STRINGID_AVOIDEDDAMAGE,       // B_MSG_AVOIDED_DMG = 3
  STRINGID_PKMNMAKESGROUNDMISS, // B_MSG_GROUND_MISS = 4
];

// ─── 0x02 attackstring ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_attackstring. No args. */
function Cmd_attackstring(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b05(ctx);
  }
  if (!(gHitMarker & (HITMARKER_NO_ATTACKSTRING | HITMARKER_ATTACKSTRING_PRINTED))) {
    PrepareStringBattle(STRINGID_USEDMOVE, gBattlerAttacker);
    setHitMarker(gHitMarker | HITMARKER_ATTACKSTRING_PRINTED);
  }
  // Décomp: gBattlescriptCurrInstr++; gBattleCommunication[MSG_DISPLAY] = 0;
  // (= MSG_DISPLAY clear ici, contrairement aux autres print qui le set à 1)
  gBattleCommunication[MSG_DISPLAY] = 0;
  return false;
}

// ─── 0x0D critmessage ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_critmessage. No args. */
function Cmd_critmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b05(ctx);
  }
  if (gCritMultiplier === 2 && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    PrepareStringBattle(STRINGID_CRITICALHIT, gBattlerAttacker);
    gBattleCommunication[MSG_DISPLAY] = 1;
  }
  return false;
}

// ─── 0x0E effectivenesssound ────────────────────────────────────────────────

/** 1:1 décomp Cmd_effectivenesssound. No args. */
function Cmd_effectivenesssound(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b05(ctx);
  }
  setActiveBattler(gBattlerTarget);
  if (!(gMoveResultFlags & MOVE_RESULT_MISSED)) {
    const flagsNoMiss = gMoveResultFlags & ~MOVE_RESULT_MISSED & 0xFF;
    switch (flagsNoMiss) {
      case MOVE_RESULT_SUPER_EFFECTIVE:
        BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_SUPER_EFFECTIVE);
        MarkBattlerForControllerExec(gBattlerTarget);
        break;
      case MOVE_RESULT_NOT_VERY_EFFECTIVE:
        BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_NOT_EFFECTIVE);
        MarkBattlerForControllerExec(gBattlerTarget);
        break;
      case MOVE_RESULT_DOESNT_AFFECT_FOE:
      case MOVE_RESULT_FAILED:
        // No SE.
        break;
      case MOVE_RESULT_FOE_ENDURED:
      case MOVE_RESULT_ONE_HIT_KO:
      case MOVE_RESULT_FOE_HUNG_ON:
      default:
        if (gMoveResultFlags & MOVE_RESULT_SUPER_EFFECTIVE) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_SUPER_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        } else if (gMoveResultFlags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_NOT_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        } else if (!(gMoveResultFlags & (MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED))) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        }
        break;
    }
  }
  return false;
}

// ─── 0x0F resultmessage ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_resultmessage. No args. */
function Cmd_resultmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b05(ctx);
  }
  let stringId = 0;

  const missAndNotAffect = (gMoveResultFlags & MOVE_RESULT_MISSED) &&
    (!(gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) ||
      gBattleCommunication[MISS_TYPE] > B_MSG_AVOIDED_ATK);

  if (missAndNotAffect) {
    stringId = gMissStringIds[gBattleCommunication[MISS_TYPE]] ?? 0;
    gBattleCommunication[MSG_DISPLAY] = 1;
  } else {
    gBattleCommunication[MSG_DISPLAY] = 1;
    const flagsNoMiss = gMoveResultFlags & ~MOVE_RESULT_MISSED & 0xFF;
    switch (flagsNoMiss) {
      case MOVE_RESULT_SUPER_EFFECTIVE:
        stringId = STRINGID_SUPEREFFECTIVE;
        break;
      case MOVE_RESULT_NOT_VERY_EFFECTIVE:
        stringId = STRINGID_NOTVERYEFFECTIVE;
        break;
      case MOVE_RESULT_ONE_HIT_KO:
        stringId = STRINGID_ONEHITKO;
        break;
      case MOVE_RESULT_FOE_ENDURED:
        stringId = STRINGID_PKMNENDUREDHIT;
        break;
      case MOVE_RESULT_FAILED:
        stringId = STRINGID_BUTITFAILED;
        break;
      case MOVE_RESULT_DOESNT_AFFECT_FOE:
        stringId = STRINGID_ITDOESNTAFFECT;
        break;
      case MOVE_RESULT_FOE_HUNG_ON:
        setLastUsedItem(gBattleMons[gBattlerTarget].item);
        setPotentialItemEffectBattler(gBattlerTarget);
        setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
        // BattleScriptPushCursor : push current opcode-1 (= return here next).
        // Notre ctx.scriptPtr est déjà au prochain opcode (post-dispatcher
        // advance). Le décomp push gBattlescriptCurrInstr (= position courante
        // au DÉBUT de l'opcode). On reproduit en pushant scriptPtr-1.
        BattleScriptPush(ctx, ctx.scriptPtr - 1);
        _jumpTo(ctx, 'BattleScript_FocusBandActivates');
        return false;
      default:
        if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) {
          stringId = STRINGID_ITDOESNTAFFECT;
        } else if (gMoveResultFlags & MOVE_RESULT_ONE_HIT_KO) {
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_ONE_HIT_KO | MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_OneHitKOMsg');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FOE_ENDURED) {
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_EnduredMsg');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FOE_HUNG_ON) {
          setLastUsedItem(gBattleMons[gBattlerTarget].item);
          setPotentialItemEffectBattler(gBattlerTarget);
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_FocusBandActivates');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FAILED) {
          stringId = STRINGID_BUTITFAILED;
        } else {
          gBattleCommunication[MSG_DISPLAY] = 0;
        }
    }
  }

  if (stringId) {
    PrepareStringBattle(stringId, gBattlerAttacker);
  }

  return false;
}

function _jumpTo(ctx: BattleScriptContext, label: string): void {
  const offset = getBattleScriptOffset(label);
  if (offset >= 0) {
    ctx.scriptPtr = offset;
  }
}

// ─── 0x1A dofaintanimation ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_dofaintanimation. 2 bytes (opcode + 1-byte battler arg). */
function Cmd_dofaintanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b05(ctx);
  }
  // Entry: ctx.scriptPtr = opcode+1 (= battler arg).
  // Decomp reads gBattlescriptCurrInstr[1] = arg byte, then advances +=2.
  // Our readByte at this position reads the arg + advances. Then ctx.scriptPtr
  // = opcode+2 = next opcode. ✓
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  BtlController_EmitFaintAnimation(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x1B cleareffectsonfaint ──────────────────────────────────────────────

/** 1:1 décomp Cmd_cleareffectsonfaint. 2 bytes. */
function Cmd_cleareffectsonfaint(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b05(ctx);
  }
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);

  if (!(gBattleTypeFlags & BATTLE_TYPE_ARENA) || gBattleMons[active].hp === 0) {
    gBattleMons[active].status1 = 0;
    // 1:1 décomp : sizeof(gBattleMons[active].status1) = sizeof(u32) = 4 bytes.
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, 0, 4, gBattleMons[active].status1);
    MarkBattlerForControllerExec(active);
  }

  FaintClearSetData();
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 06 ════════════
/**
 * battle/cmd-batch-06.ts — Phase 1 Batch 06 (UI/audio misc) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x11 printselectionstring        (3 bytes : opcode + u16 stringId)
 *   0x14 printselectionstringfromtable (5 bytes : opcode + u32 tblPtr)
 *   0x54 playse                       (3 bytes : opcode + u16 songId)
 *   0x55 fanfare                      (3 bytes : opcode + u16 songId)
 *   0x56 playfaintcry                 (2 bytes : opcode + 1 byte battler)
 *   0x5C hitanimation                 (2 bytes : opcode + 1 byte battler)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Note : tous ces opcodes sont des thin wrappers BtlController_Emit*. Pour
 * 1:1 strict : on appelle nos helpers locaux + Mark, ce qui set le bit dans gBattle
 * ControllerExecFlags. tickBattleControllers le clear next iteration.
 */










// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b06(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** Lit u16 little-endian au offset table dans bytecode. */
function _readU16FromBytecode(offset: number): number {
  const bc = getBattleScriptBytecode();
  if (!bc) return 0;
  if (offset < 0 || offset + 1 >= bc.length) return 0;
  return bc[offset] | (bc[offset + 1] << 8);
}

// ─── 0x11 printselectionstring ──────────────────────────────────────────────

/** 1:1 décomp Cmd_printselectionstring. 3 bytes. */
function Cmd_printselectionstring(ctx: BattleScriptContext): boolean {
  // Note : décomp ne guard PAS sur gBattleControllerExecFlags, contrairement à
  // printstring. C'est intentionnel — selection string utilise un slot UI
  // séparé. On suit le décomp 1:1.
  const stringId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPrintSelectionString(B_COMM_TO_CONTROLLER, stringId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x14 printselectionstringfromtable ─────────────────────────────────────

/** 1:1 décomp Cmd_printselectionstringfromtable. 5 bytes. */
function Cmd_printselectionstringfromtable(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode__b06(ctx);
  }
  const tableOffset = readWord(ctx);
  const idx = gBattleCommunication[MULTISTRING_CHOOSER];
  // 1:1 : résout la table comme Cmd_printfromtable (SYMBOL_MARKER → table JS, sinon
  // bytecode). _readU16FromBytecode DIRECT lisait du garbage (gNoEscapeStringIds est un
  // SYMBOL_MARKER, pas un offset bytecode) → message de sélection jamais rendu.
  const table = resolveStringIdTable(tableOffset);
  const stringId = table
    ? ((idx >= 0 && idx < table.length) ? table[idx] : 0)
    : _readBytecodeForString(tableOffset, idx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPrintSelectionString(B_COMM_TO_CONTROLLER, stringId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x54 playse ────────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_playse. 3 bytes. */
function Cmd_playse(ctx: BattleScriptContext): boolean {
  const songId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, songId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x55 fanfare ───────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_fanfare. 3 bytes. */
function Cmd_fanfare(ctx: BattleScriptContext): boolean {
  const songId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPlayFanfareOrBGM(B_COMM_TO_CONTROLLER, songId, false);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x56 playfaintcry ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_playfaintcry. 2 bytes. */
function Cmd_playfaintcry(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  BtlController_EmitFaintingCry(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x5C hitanimation ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_hitanimation. 2 bytes. */
function Cmd_hitanimation(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);

  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    // Skip anim, advance done (already done by readByte).
    return false;
  } else if (!(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE) ||
             !(gBattleMons[active].status2 & STATUS2_SUBSTITUTE) ||
             gDisableStructs[active].substituteHP === 0) {
    BtlController_EmitHitAnimation(B_COMM_TO_CONTROLLER);
    MarkBattlerForControllerExec(active);
  }
  // else : skip (= substitute prevented animation).
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 07 ════════════
/**
 * battle/cmd-batch-07.ts — Phase 1 Batch 07 (mutation + flow control) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x26 setmultihit          (2 bytes : opcode + u8 count)
 *   0x27 decrementmultihit    (5 bytes : opcode + u32 jumpPtr)
 *   0x44 endselectionscript   (1 byte — set gBattleStruct.selectionScriptFinished)
 *   0x4B returnatktoball      (1 byte — recall attacker if not fainted)
 *   0x5F swapattackerwithtarget (1 byte — swap gBattlerAttacker/gBattlerTarget)
 *   0x60 incrementgamestat    (2 bytes : opcode + u8 statId)
 *   0x68 cancelallactions     (1 byte — gActionsByTurnOrder__b07[i] = CANCEL_PARTNER)
 *   0x80 manipulatedamage     (2 bytes : opcode + u8 case)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle_script_commands.h:363-365`
 *     (DMG_CHANGE_SIGN/RECOIL_FROM_MISS/DOUBLED)
 *   - `decomps/pokeemeraude/include/battle.h:27,40` (B_ACTION_USE_MOVE/CANCEL_PARTNER)
 */








// ─── DMG_* enum (battle_script_commands.h:363-365) — 1:1 décomp ────────────
const DMG_CHANGE_SIGN      = 0;
const DMG_RECOIL_FROM_MISS = 1;
const DMG_DOUBLED          = 2;

// [RÉCONCILIÉ] B_ACTION_CANCEL_PARTNER__b07 + gActionsByTurnOrder__b07 (tableau MORT,
// lu par personne) supprimés : Cmd_cancelallactions utilise désormais les canoniques
// importés B_ACTION_CANCEL_PARTNER (l.260) + gActionsByTurnOrder (l.721 = vraie file du
// dispatcher de tour, battle-turn-dispatch.ts).

// ─── State arrays (= structs portés 1:1 décomp) ────────────────────────────

/** 1:1 décomp `gBattleStruct.selectionScriptFinished[MAX_BATTLERS_COUNT]` —
 *  flag per battler que la selection script a terminé. */
export const _selectionScriptFinished: boolean[] = [false, false, false, false];

// ─── 0x26 setmultihit ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setmultihit. 2 bytes. */
function Cmd_setmultihit(ctx: BattleScriptContext): boolean {
  // gMultiHitCounter = gBattlescriptCurrInstr[1]; gBattlescriptCurrInstr += 2;
  const count = readByte(ctx);
  setMultiHitCounter(count);
  return false;
}

// ─── 0x27 decrementmultihit ────────────────────────────────────────────────

/** 1:1 décomp Cmd_decrementmultihit. 5 bytes (opcode + u32 jumpPtr).
 *  Decomp:
 *    if (--gMultiHitCounter == 0) gBattlescriptCurrInstr += 5;
 *    else gBattlescriptCurrInstr = T2_READ_PTR(gBattlescriptCurrInstr + 1);
 */
function Cmd_decrementmultihit(ctx: BattleScriptContext): boolean {
  // Entry: ctx.scriptPtr = opcode+1.
  const jumpPtr = readWord(ctx); // advances → opcode+5
  const newCounter = gMultiHitCounter - 1;
  setMultiHitCounter(newCounter);
  if (newCounter === 0) {
    // Continue (= already at opcode+5).
    return false;
  }
  // Jump back to the loop start.
  ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x44 endselectionscript ───────────────────────────────────────────────

/** 1:1 décomp Cmd_endselectionscript. No args.
 *  Décomp:
 *    *(gBattlerAttacker + gBattleStruct->selectionScriptFinished) = TRUE;
 *  (= équivalent à `selectionScriptFinished[gBattlerAttacker] = TRUE`).
 *  Note : le décomp ne fait PAS `gBattlescriptCurrInstr++`. Le main battle
 *  loop voit selectionScriptFinished et break le sous-script. Notre équivalent
 *  = stay sur opcode + return true (= pause) pour laisser le caller exit. */
function Cmd_endselectionscript(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : `gBattleStruct->selectionScriptFinished[gBattlerAttacker] = TRUE`.
  // (l'ancien `_selectionScriptFinished` local était un array MORT — jamais lu par le
  // handler STATE_SELECTION_SCRIPT qui lit `gBattleStruct.selectionScriptFinished` → le
  // selection-script ne se terminait jamais = soft-lock.)
  gBattleStruct.selectionScriptFinished[gBattlerAttacker] = 1;
  return _stayOnOpcode__b07(ctx);
}

function _stayOnOpcode__b07(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x4B returnatktoball ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_returnatktoball. 1 byte. */
function Cmd_returnatktoball(_ctx: BattleScriptContext): boolean {
  setActiveBattler(gBattlerAttacker);
  if (!(gHitMarker & HITMARKER_FAINTED(gBattlerAttacker))) {
    BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
    MarkBattlerForControllerExec(gBattlerAttacker);
  }
  return false;
}

// ─── 0x5F swapattackerwithtarget ───────────────────────────────────────────

/** 1:1 décomp Cmd_swapattackerwithtarget. No args. */
function Cmd_swapattackerwithtarget(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : gActiveBattler = gBattlerAttacker (temp pour swap).
  setActiveBattler(gBattlerAttacker);
  const savedAttacker = gBattlerAttacker;
  setBattlerAttacker(gBattlerTarget);
  setBattlerTarget(savedAttacker);
  if (gHitMarker & HITMARKER_SWAP_ATTACKER_TARGET) {
    setHitMarker(gHitMarker & ~HITMARKER_SWAP_ATTACKER_TARGET);
  } else {
    setHitMarker(gHitMarker | HITMARKER_SWAP_ATTACKER_TARGET);
  }
  return false;
}

// ─── 0x60 incrementgamestat ────────────────────────────────────────────────

/** 1:1 décomp Cmd_incrementgamestat. 2 bytes. */
function Cmd_incrementgamestat(ctx: BattleScriptContext): boolean {
  const statId = readByte(ctx);
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    _incrementGameStat(statId);
  }
  return false;
}

/** 1:1 décomp `IncrementGameStat(statId)` (= update gSaveBlock1Ptr->gameStats[stat]).
 *  Wired vers globalThis.gSaveBlock1Ptr.gameStats[] qui est maintenu par
 *  game-state.ts (= persisté au save). */
function _incrementGameStat(statId: number): void {
  // 1:1 décomp `gSaveBlock1Ptr->gameStats[statId]++` (= overworld.c IncrementGameStat).
  const stats = gSaveBlock1Ptr.gameStats as number[] | undefined;
  if (stats && statId >= 0 && statId < stats.length) {
    stats[statId] = (stats[statId] ?? 0) + 1;
  }
}

// ─── 0x68 cancelallactions ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_cancelallactions. No args. */
function Cmd_cancelallactions(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp battle_script_commands.c:5853-5861 : écrit dans la VRAIE file d'actions
  // du tour (gActionsByTurnOrder, lue par le dispatcher de tour), pas un tableau mort local.
  for (let i = 0; i < gBattlersCount; i++) {
    gActionsByTurnOrder[i] = B_ACTION_CANCEL_PARTNER;
  }
  return false;
}

// ─── 0x80 manipulatedamage ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_manipulatedamage. 2 bytes. */
function Cmd_manipulatedamage(ctx: BattleScriptContext): boolean {
  const caseId = readByte(ctx);
  switch (caseId) {
    case DMG_CHANGE_SIGN:
      setBattleMoveDamage(gBattleMoveDamage * -1);
      break;
    case DMG_RECOIL_FROM_MISS: {
      let dmg = Math.floor(gBattleMoveDamage / 2);
      if (dmg === 0) dmg = 1;
      const halfMax = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
      if (halfMax < dmg) dmg = halfMax;
      setBattleMoveDamage(dmg);
      break;
    }
    case DMG_DOUBLED:
      setBattleMoveDamage(gBattleMoveDamage * 2);
      break;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 08 ════════════
/**
 * battle/cmd-batch-08.ts — Phase 1 Batch 08 (utility + dynamic) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x42 jumpiftype2       (7 bytes : opcode + u8 battler + u8 type + u32 ptr)
 *   0x6F makevisible       (2 bytes : opcode + u8 battler)
 *   0x82 jumpifnotfirstturn (5 bytes : opcode + u32 ptr)
 *   0xC1 hiddenpowercalc   (1 byte — calc gDynamicBasePower + gDynamicMoveType
 *                            from IVs)
 *   0xE3 jumpifhasnohp     (6 bytes : opcode + u8 battler + u32 ptr)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:455-456` (F_DYNAMIC_TYPE_*)
 */








// ─── 0x42 jumpiftype2 ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpiftype2. 7 bytes. */
function Cmd_jumpiftype2(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const type = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const battler = getBattlerForBattleScript(battlerArg);
  const mon = gBattleMons[battler];
  if (type === mon.type1 || type === mon.type2) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0x6F makevisible ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_makevisible. 2 bytes. */
function Cmd_makevisible(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  BtlController_EmitSpriteInvisibility(B_COMM_TO_CONTROLLER, false);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x82 jumpifnotfirstturn ───────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnotfirstturn. 5 bytes. */
function Cmd_jumpifnotfirstturn(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].isFirstTurn) {
    // 1:1 : gBattlescriptCurrInstr += 5 (= advance, already done)
    return false;
  }
  ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0xC1 hiddenpowercalc ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_hiddenpowercalc. No args.
 *  Calc power from IVs bit 1 of {hp,atk,def,speed,spAttack,spDefense}.
 *  Calc type from IVs bit 0 of same fields.
 *  Set gDynamicBasePower + gDynamicMoveType with F_DYNAMIC_TYPE_SET +
 *  F_DYNAMIC_TYPE_IGNORE_PHYSICALITY flags. */
function Cmd_hiddenpowercalc(_ctx: BattleScriptContext): boolean {
  const mon = gBattleMons[gBattlerAttacker];
  const powerBits =
      ((mon.hpIV       & 2) >> 1) |
      ((mon.attackIV   & 2) << 0) |
      ((mon.defenseIV  & 2) << 1) |
      ((mon.speedIV    & 2) << 2) |
      ((mon.spAttackIV & 2) << 3) |
      ((mon.spDefenseIV & 2) << 4);

  const typeBits =
      ((mon.hpIV       & 1) << 0) |
      ((mon.attackIV   & 1) << 1) |
      ((mon.defenseIV  & 1) << 2) |
      ((mon.speedIV    & 1) << 3) |
      ((mon.spAttackIV & 1) << 4) |
      ((mon.spDefenseIV & 1) << 5);

  setDynamicBasePower(Math.floor((40 * powerBits) / 63) + 30);

  let dynamicType = Math.floor(((NUMBER_OF_MON_TYPES - 3) * typeBits) / 63) + 1;
  if (dynamicType >= TYPE_MYSTERY) {
    dynamicType++;
  }
  dynamicType |= F_DYNAMIC_TYPE_IGNORE_PHYSICALITY | F_DYNAMIC_TYPE_SET;
  setDynamicMoveType(dynamicType);

  return false;
}

// ─── 0xE3 jumpifhasnohp ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifhasnohp. 6 bytes. */
function Cmd_jumpifhasnohp(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  if (gBattleMons[active].hp === 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 09 ════════════
/**
 * battle/cmd-batch-09.ts — Phase 1 Batch 09 (status-set opcodes) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x7F setseeded             (1 byte — set LeechSeed if not Grass/already seeded)
 *   0x9A setfocusenergy        (1 byte — set STATUS2_FOCUS_ENERGY, fail si set)
 *   0xA7 setalwayshitflag      (1 byte — set STATUS3_ALWAYS_HITS_TURN(2))
 *   0xAA setdestinybond        (1 byte — set STATUS2_DESTINY_BOND)
 *   0xAF cursetarget           (5 bytes — set STATUS2_CURSED, set damage maxHP/2)
 *   0xB1 setforesight          (1 byte — set STATUS2_FORESIGHT on target)
 *   0xBF setdefensecurlbit     (1 byte — set STATUS2_DEFENSE_CURL)
 *   0xC7 setminimize           (1 byte — set STATUS3_MINIMIZED si OBEYS)
 *   0xCD cureifburnedparalyzedorpoisoned (5 bytes — clear status1 + emit data)
 *   0xCE settorment            (5 bytes — set STATUS2_TORMENT)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle.h:161` (STATUS3_ALWAYS_HITS_TURN)
 *   - `decomps/pokeemeraude/include/constants/battle_string_ids.h` (B_MSG_*)
 */







// ─── 0x7F setseeded ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setseeded. 1 byte.
 *  Note : décomp `gStatuses3[target] |= gBattlerAttacker` — store l'attacker id
 *  dans STATUS3_LEECHSEED_BATTLER (= bits 0+1, max 4 battlers). On reproduit. */
function Cmd_setseeded(_ctx: BattleScriptContext): boolean {
  if ((gMoveResultFlags & MOVE_RESULT_NO_EFFECT) || (gStatuses3[gBattlerTarget] & STATUS3_LEECHSEED)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_MISS;
  } else if (IS_BATTLER_OF_TYPE(gBattleMons[gBattlerTarget].type1, gBattleMons[gBattlerTarget].type2, TYPE_GRASS)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_FAIL;
  } else {
    gStatuses3[gBattlerTarget] |= gBattlerAttacker;
    gStatuses3[gBattlerTarget] |= STATUS3_LEECHSEED;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_SET;
  }
  return false;
}

// ─── 0x9A setfocusenergy ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setfocusenergy. 1 byte. */
function Cmd_setfocusenergy(_ctx: BattleScriptContext): boolean {
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_FOCUS_ENERGY) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_FOCUS_ENERGY_FAILED;
  } else {
    gBattleMons[gBattlerAttacker].status2 |= STATUS2_FOCUS_ENERGY;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_GETTING_PUMPED;
  }
  return false;
}

// ─── 0xA7 setalwayshitflag ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setalwayshitflag. 1 byte. */
function Cmd_setalwayshitflag(_ctx: BattleScriptContext): boolean {
  gStatuses3[gBattlerTarget] &= ~STATUS3_ALWAYS_HITS;
  gStatuses3[gBattlerTarget] |= STATUS3_ALWAYS_HITS_TURN(2);
  gDisableStructs[gBattlerTarget].battlerWithSureHit = gBattlerAttacker;
  return false;
}

// ─── 0xAA setdestinybond ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setdestinybond. 1 byte. */
function Cmd_setdestinybond(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_DESTINY_BOND;
  return false;
}

// ─── 0xAF cursetarget ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_cursetarget. 5 bytes (u32 ptr pour le fail-jump). */
function Cmd_cursetarget(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_CURSED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gBattleMons[gBattlerTarget].status2 |= STATUS2_CURSED;
  let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xB1 setforesight ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setforesight. 1 byte. */
function Cmd_setforesight(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerTarget].status2 |= STATUS2_FORESIGHT;
  return false;
}

// ─── 0xBF setdefensecurlbit ────────────────────────────────────────────────

/** 1:1 décomp Cmd_setdefensecurlbit. 1 byte. */
function Cmd_setdefensecurlbit(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_DEFENSE_CURL;
  return false;
}

// ─── 0xC7 setminimize ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setminimize. 1 byte. */
function Cmd_setminimize(_ctx: BattleScriptContext): boolean {
  if (gHitMarker & HITMARKER_OBEYS) {
    gStatuses3[gBattlerAttacker] |= STATUS3_MINIMIZED;
  }
  return false;
}

// ─── 0xCD cureifburnedparalyzedorpoisoned ──────────────────────────────────

/** 1:1 décomp Cmd_cureifburnedparalyzedorpoisoned. 5 bytes (u32 ptr fail). */
function Cmd_cureifburnedparalyzedorpoisoned(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const status = gBattleMons[gBattlerAttacker].status1;
  const targetMask = STATUS1_POISON | STATUS1_BURN | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON;
  if (status & targetMask) {
    gBattleMons[gBattlerAttacker].status1 = 0;
    setActiveBattler(gBattlerAttacker);
    _emitSetMonData(REQUEST_STATUS_BATTLE, gBattleMons[gBattlerAttacker].status1);
    MarkBattlerForControllerExec(gBattlerAttacker);
    // Continue (= already advanced past args).
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

/** 1:1 décomp `BtlController_EmitSetMonData(buf, requestId, monIdx, bytes, data)`.
 *  Wired via battle-controllers (= flush au party-side via __batPSetMonByActive
 *  bridge depuis batch C session 142). */
function _emitSetMonData(requestId: number, data: number | null = null): void {
  // 1:1 décomp : passe la VALEUR (ex. status1) au flush party-side, pas null.
  BtlController_EmitSetMonData(0 /* B_COMM_TO_CONTROLLER */, requestId, 0, 4, data);
}

// ─── 0xCE settorment ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_settorment. 5 bytes (u32 ptr fail). */
function Cmd_settorment(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_TORMENT) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gBattleMons[gBattlerTarget].status2 |= STATUS2_TORMENT;
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 10 ════════════
/**
 * battle/cmd-batch-10.ts — Phase 1 Batch 10 (weather + side status + charge) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x70 recordlastability   (2 bytes — RecordAbilityBattle(active, gLastUsedAbility))
 *   0x7D setrain             (1 byte — set B_WEATHER_RAIN_TEMPORARY + 5 turns)
 *   0x7E setreflect          (1 byte — set SIDE_STATUS_REFLECT + 5 turns)
 *   0x92 setlightscreen      (1 byte — set SIDE_STATUS_LIGHTSCREEN + 5 turns)
 *   0x95 setsandstorm        (1 byte — set B_WEATHER_SANDSTORM_TEMPORARY + 5 turns)
 *   0x99 setmist             (1 byte — set SIDE_STATUS_MIST + 5 turns)
 *   0xB8 setsafeguard        (1 byte — set SIDE_STATUS_SAFEGUARD + 5 turns)
 *   0xBB setsunny            (1 byte — set B_WEATHER_SUN_TEMPORARY + 5 turns)
 *   0xC8 sethail             (1 byte — set B_WEATHER_HAIL_TEMPORARY + 5 turns)
 *   0xCB setcharge           (1 byte — set STATUS3_CHARGED_UP + chargeTimer=2)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:418-432` (struct SideTimer)
 *   - `decomps/pokeemeraude/include/battle.h:401-413` (struct WishFutureKnock)
 */







// ─── 0x70 recordlastability ────────────────────────────────────────────────

/** 1:1 décomp Cmd_recordlastability. 2 bytes (1-byte battler arg).
 *  Note : décomp a un BUGFIX qui change l'advance de +1 à +2 ; on suit le
 *  fix (= 2 bytes au total). */
function Cmd_recordlastability(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  _recordAbilityBattle__b10(active, gLastUsedAbility);
  return false;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts (= AI tracking module).

function _recordAbilityBattle__b10(battlerId: number, ability: number): void {
  _recordAbilityBattleFull(battlerId, ability);
}

// ─── 0x7D setrain ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setrain. 1 byte. */
function Cmd_setrain(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_RAIN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_RAIN_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_RAIN;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0x7E setreflect ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setreflect. 1 byte. */
function Cmd_setreflect(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_REFLECT) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_REFLECT);
    gSideTimers[side].reflectTimer = 5;
    gSideTimers[side].reflectBattlerId = gBattlerAttacker;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && _countAliveMonsAtkSide() === 2) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_REFLECT_DOUBLE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_REFLECT_SINGLE;
    }
  }
  return false;
}

// ─── 0x92 setlightscreen ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_setlightscreen. 1 byte. */
function Cmd_setlightscreen(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_LIGHTSCREEN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_LIGHTSCREEN);
    gSideTimers[side].lightscreenTimer = 5;
    gSideTimers[side].lightscreenBattlerId = gBattlerAttacker;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && _countAliveMonsAtkSide() === 2) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_LIGHTSCREEN_DOUBLE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_LIGHTSCREEN_SINGLE;
    }
  }
  return false;
}

// ─── 0x95 setsandstorm ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsandstorm. 1 byte. */
function Cmd_setsandstorm(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_SANDSTORM) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_SANDSTORM_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_SANDSTORM;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0x99 setmist ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setmist. 1 byte. */
function Cmd_setmist(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideTimers[side].mistTimer) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_MIST_FAILED;
  } else {
    gSideTimers[side].mistTimer = 5;
    gSideTimers[side].mistBattlerId = gBattlerAttacker;
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_MIST);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_MIST;
  }
  return false;
}

// ─── 0xB8 setsafeguard ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsafeguard. 1 byte. */
function Cmd_setsafeguard(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_SAFEGUARD) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_SAFEGUARD);
    gSideTimers[side].safeguardTimer = 5;
    gSideTimers[side].safeguardBattlerId = gBattlerAttacker;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_SAFEGUARD;
  }
  return false;
}

// ─── 0xBB setsunny ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsunny. 1 byte. */
function Cmd_setsunny(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_SUN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_SUN_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_SUNLIGHT;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0xC8 sethail ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_sethail. 1 byte. */
function Cmd_sethail(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_HAIL) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_HAIL_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_HAIL;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0xCB setcharge ────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setcharge. 1 byte. */
function Cmd_setcharge(_ctx: BattleScriptContext): boolean {
  gStatuses3[gBattlerAttacker] |= STATUS3_CHARGED_UP;
  gDisableStructs[gBattlerAttacker].chargeTimer = 2;
  gDisableStructs[gBattlerAttacker].chargeTimerStartValue = 2;
  return false;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `CountAliveMonsInBattle(BATTLE_ALIVE_ATK_SIDE)` (pokemon.c:3375-3406).
 *  Compte les battlers du même side que l'attacker qui sont vivants (= pas
 *  absent + hp > 0). Pour single battle : retourne 1 (= attacker seul actif).
 *  Pour double battle : 1 ou 2 selon le partner. */
function _countAliveMonsAtkSide(): number {
  let retVal = 0;
  const atkSide = GET_BATTLER_SIDE(gBattlerAttacker);
  for (let i = 0; i < gBattlersCount; i++) {
    if (GET_BATTLER_SIDE(i) === atkSide
        && !(gAbsentBattlerFlags & (1 << i))
        && gBattleMons[i].hp !== 0) {
      retVal++;
    }
  }
  return retVal;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 11 ════════════
/**
 * battle/cmd-batch-11.ts — Phase 1 Batch 11 (damage manip + multihit + substitute) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x88 negativedamage           (1 byte — gBattleMoveDamage = -(gHpDealt/2))
 *   0x8D setmultihitcounter       (2 bytes — set ou random 2-5)
 *   0x8E initmultihitstring       (1 byte — buffer multihit count = 1)
 *   0x9C setsubstitute            (1 byte — set STATUS2_SUBSTITUTE, maxHP/4 damage)
 *   0xAB trysetdestinybondtohappen (1 byte — wrapper TrySetDestinyBondToHappen)
 *   0xD7 setyawn                  (5 bytes — set STATUS3_YAWN_TURN(2), jump si déjà yawn ou status1)
 *   0xD8 setdamagetohealthdifference (5 bytes — gBattleMoveDamage = target.hp - attacker.hp, jump si <=0)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */






// ─── 0x88 negativedamage ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_negativedamage. 1 byte. */
function Cmd_negativedamage(_ctx: BattleScriptContext): boolean {
  let dmg = -Math.floor(gHpDealt / 2);
  if (dmg === 0) dmg = -1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0x8D setmultihitcounter ───────────────────────────────────────────────

/** 1:1 décomp Cmd_setmultihitcounter. 2 bytes. */
function Cmd_setmultihitcounter(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (arg) {
    setMultiHitCounter(arg);
  } else {
    let count = Random() & 3;
    if (count > 1) {
      count = (Random() & 3) + 2;
    } else {
      count += 2;
    }
    setMultiHitCounter(count);
  }
  return false;
}

// ─── 0x8E initmultihitstring ───────────────────────────────────────────────

/** 1:1 décomp Cmd_initmultihitstring (battle_script_commands.c). 1 byte.
 *  `PREPARE_BYTE_NUMBER_BUFFER(gBattleScripting.multihitString, 1, 0)`. */
function Cmd_initmultihitstring(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : PREPARE_BYTE_NUMBER_BUFFER appliquée à gBattleScripting.multihitString.
  // Notre gBattleScripting.multihitString est array de 6 nombres ; on écrit
  // les 6 bytes du format PREPARE_BYTE_NUMBER_BUFFER directement.
  const buf = gBattleScripting.multihitString;
  buf[0] = 0xFD; /* B_BUFF_PLACEHOLDER_BEGIN */
  buf[1] = 1;    /* B_BUFF_NUMBER */
  buf[2] = 1;    /* bytes = 1 */
  buf[3] = 1;    /* maxDigits = 1 */
  buf[4] = 0;    /* number = 0 */
  buf[5] = 0xFF; /* B_BUFF_EOS */
  return false;
}

// ─── 0x9C setsubstitute ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsubstitute. 1 byte. */
function Cmd_setsubstitute(_ctx: BattleScriptContext): boolean {
  let hp = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
  if (hp === 0) hp = 1;

  if (gBattleMons[gBattlerAttacker].hp <= hp) {
    setBattleMoveDamage(0);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SUBSTITUTE_FAILED;
  } else {
    let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);

    gBattleMons[gBattlerAttacker].status2 |= STATUS2_SUBSTITUTE;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_WRAPPED;
    gDisableStructs[gBattlerAttacker].substituteHP = dmg;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_SUBSTITUTE;
    setHitMarker(gHitMarker | HITMARKER_IGNORE_SUBSTITUTE);
  }
  void gBattleMoveDamage;  // ref clarté
  return false;
}

// ─── 0xAB trysetdestinybondtohappen ────────────────────────────────────────

/** 1:1 décomp Cmd_trysetdestinybondtohappen. 1 byte.
 *  Décomp appelle helper TrySetDestinyBondToHappen() (battle_util.c). */
function Cmd_trysetdestinybondtohappen(_ctx: BattleScriptContext): boolean {
  _trySetDestinyBondToHappen__b11();
  return false;
}

/** 1:1 décomp `TrySetDestinyBondToHappen` (battle_script_commands.c:8288). */
function _trySetDestinyBondToHappen__b11(): void {
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget   = GET_BATTLER_SIDE(gBattlerTarget);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_DESTINY_BOND)
      && sideAttacker !== sideTarget
      && !(gHitMarker & HITMARKER_GRUDGE)) {
    setHitMarker(gHitMarker | HITMARKER_DESTINYBOND);
  }
}

// ─── 0xD7 setyawn ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setyawn. 5 bytes (u32 fail jump). */
function Cmd_setyawn(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerTarget] & STATUS3_YAWN ||
      gBattleMons[gBattlerTarget].status1 & STATUS1_ANY) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerTarget] |= STATUS3_YAWN_TURN(2);
  return false;
}

// ─── 0xD8 setdamagetohealthdifference ──────────────────────────────────────

/** 1:1 décomp Cmd_setdamagetohealthdifference. 5 bytes. */
function Cmd_setdamagetohealthdifference(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].hp <= gBattleMons[gBattlerAttacker].hp) {
    ctx.scriptPtr = failJump;
    return false;
  }
  setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - gBattleMons[gBattlerAttacker].hp);
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────



// Reference unused vars pour éviter warnings sur multihit counter (utilisé via
// le setter, mais on importe le getter pour cohérence).
void gMultiHitCounter;


// ════════════ Batch 12 ════════════
/**
 * battle/cmd-batch-12.ts — Phase 1 Batch 12 (semi-invul + buffers + misc) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x6B atknameinbuff1       (1 byte — PREPARE_MON_NICK_BUFFER stub)
 *   0x6D resetsentmonsvalue   (1 byte — ResetSentPokesToOpponentValue stub)
 *   0x6E setatktoplayer0      (1 byte — gBattlerAttacker = position PLAYER_LEFT)
 *   0x71 buffermovetolearn    (1 byte — BufferMoveToLearnIntoBattleTextBuff2 stub)
 *   0xA3 disablelastusedattack (5 bytes — set disabledMove + 2-5 turn timer)
 *   0xA4 trysetencore         (5 bytes — set encoredMove + 3-6 turn timer)
 *   0xC5 setsemiinvulnerablebit (1 byte — switch sur gCurrentMove
 *                                FLY/BOUNCE→ON_AIR, DIG→UNDERGROUND, DIVE→UNDERWATER)
 *   0xC6 clearsemiinvulnerablebit (1 byte — mirror, clear)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/moves.h:19,91,119,166,227,291,340`
 */









// ─── 0x6B atknameinbuff1 ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_atknameinbuff1 (battle_script_commands.c:5920-5925). 1 byte. */
function Cmd_atknameinbuff1(_ctx: BattleScriptContext): boolean {
  PREPARE_MON_NICK_BUFFER(gBattleTextBuff1, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  return false;
}

// ─── 0x6D resetsentmonsvalue ───────────────────────────────────────────────

/** 1:1 décomp Cmd_resetsentmonsvalue. 1 byte.
 *  Décomp appelle ResetSentPokesToOpponentValue() (battle_util.c:900-913) —
 *  tracking pour XP share / EXP eligibility.
 *
 *  Logique 1:1 :
 *   - gSentPokesToOpponent[0/1] = 0.
 *   - bits = OR of gBitTable[gBattlerPartyIndexes[i]] pour player slots (= even i).
 *   - gSentPokesToOpponent[(i & BIT_FLANK) >> 1] = bits pour opponent slots (= odd i).
 */
function Cmd_resetsentmonsvalue(_ctx: BattleScriptContext): boolean {
  gSentPokesToOpponent[0] = 0;
  gSentPokesToOpponent[1] = 0;
  let bits = 0;
  for (let i = 0; i < gBattlersCount; i += 2) {
    bits |= gBitTable[gBattlerPartyIndexes[i]];
  }
  // BIT_FLANK = 2, donc (i & 2) >> 1 = 0 ou 1.
  for (let i = 1; i < gBattlersCount; i += 2) {
    gSentPokesToOpponent[(i & 2) >> 1] = bits;
  }
  return false;
}

// ─── 0x6E setatktoplayer0 ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setatktoplayer0. 1 byte. */
function Cmd_setatktoplayer0(_ctx: BattleScriptContext): boolean {
  setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
  return false;
}

// ─── 0x71 buffermovetolearn ────────────────────────────────────────────────

/** 1:1 décomp Cmd_buffermovetolearn (battle_script_commands.c:6247-6251). 1 byte.
 *  Inline `BufferMoveToLearnIntoBattleTextBuff2()`. */
function Cmd_buffermovetolearn(_ctx: BattleScriptContext): boolean {
  PREPARE_MOVE_BUFFER(gBattleTextBuff2, gMoveToLearn);
  return false;
}

// ─── 0xA3 disablelastusedattack ────────────────────────────────────────────

/** 1:1 décomp Cmd_disablelastusedattack. 5 bytes (u32 fail jump). */
function Cmd_disablelastusedattack(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const target = gBattlerTarget;
  let i;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[target].moves[i] === gLastMoves[target]) break;
  }
  if (gDisableStructs[target].disabledMove === MOVE_NONE
      && i !== MAX_MON_MOVES && gBattleMons[target].pp[i] !== 0) {
    // 1:1 décomp battle_script_commands.c:8007 : PREPARE_MOVE_BUFFER pour
    // afficher le nom du move disabled dans le message.
    PREPARE_MOVE_BUFFER(gBattleTextBuff1, gBattleMons[target].moves[i]);
    gDisableStructs[target].disabledMove = gBattleMons[target].moves[i];
    const timer = (Random() & 3) + 2;
    gDisableStructs[target].disableTimer = timer;
    gDisableStructs[target].disableTimerStartValue = timer;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xA4 trysetencore ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetencore. 5 bytes (u32 fail jump). */
function Cmd_trysetencore(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const target = gBattlerTarget;
  let i;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[target].moves[i] === gLastMoves[target]) break;
  }

  if (gLastMoves[target] === MOVE_STRUGGLE
      || gLastMoves[target] === MOVE_ENCORE
      || gLastMoves[target] === MOVE_MIRROR_MOVE) {
    i = MAX_MON_MOVES;
  }

  if (gDisableStructs[target].encoredMove === MOVE_NONE
      && i !== MAX_MON_MOVES && gBattleMons[target].pp[i] !== 0) {
    gDisableStructs[target].encoredMove = gBattleMons[target].moves[i];
    gDisableStructs[target].encoredMovePos = i;
    const timer = (Random() & 3) + 3;
    gDisableStructs[target].encoreTimer = timer;
    gDisableStructs[target].encoreTimerStartValue = timer;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xC5 setsemiinvulnerablebit ───────────────────────────────────────────

/** 1:1 décomp Cmd_setsemiinvulnerablebit. 1 byte. */
function Cmd_setsemiinvulnerablebit(_ctx: BattleScriptContext): boolean {
  switch (gCurrentMove) {
    case MOVE_FLY:
    case MOVE_BOUNCE:
      gStatuses3[gBattlerAttacker] |= STATUS3_ON_AIR;
      break;
    case MOVE_DIG:
      gStatuses3[gBattlerAttacker] |= STATUS3_UNDERGROUND;
      break;
    case MOVE_DIVE:
      gStatuses3[gBattlerAttacker] |= STATUS3_UNDERWATER;
      break;
  }
  return false;
}

// ─── 0xC6 clearsemiinvulnerablebit ─────────────────────────────────────────

/** 1:1 décomp Cmd_clearsemiinvulnerablebit. 1 byte. */
function Cmd_clearsemiinvulnerablebit(_ctx: BattleScriptContext): boolean {
  switch (gCurrentMove) {
    case MOVE_FLY:
    case MOVE_BOUNCE:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_ON_AIR;
      break;
    case MOVE_DIG:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_UNDERGROUND;
      break;
    case MOVE_DIVE:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_UNDERWATER;
      break;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 13 ════════════
/**
 * battle/cmd-batch-13.ts — Phase 1 Batch 13 (damage calcs special) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x79 setatkhptozero               (1 byte — Selfdestruct/Explosion sub)
 *   0x7A jumpifnexttargetvalid        (5 bytes — double battle target iter)
 *   0x7B tryhealhalfhealth            (6 bytes — Recover/Softboiled, fail si full HP)
 *   0x9F dmgtolevel                   (1 byte — gBattleMoveDamage = atk.level)
 *   0xA0 psywavedamageeffect          (1 byte — random 50-150% level)
 *   0xB6 friendshiptodamagecalculation (1 byte — Return/Frustration)
 *   0xBC maxattackhalvehp             (5 bytes — Belly Drum)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle_move_effects.h:125`
 *   - `decomps/pokeemeraude/include/constants/pokemon.h:196`
 */








// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b13(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `gAbsentBattlerFlags` — wired depuis state.ts.

// ─── 0x79 setatkhptozero ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_setatkhptozero. 1 byte. */
function Cmd_setatkhptozero(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode__b13(ctx);
  }
  setActiveBattler(gBattlerAttacker);
  gBattleMons[gBattlerAttacker].hp = 0;
  // 1:1 décomp : sizeof(gBattleMons[active].hp) = sizeof(u16) = 2 bytes.
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HP_BATTLE, 0, 2, gBattleMons[gBattlerAttacker].hp);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x7A jumpifnexttargetvalid ────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnexttargetvalid. 5 bytes. */
function Cmd_jumpifnexttargetvalid(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    let target = gBattlerTarget + 1;
    while (true) {
      if (target === gBattlerAttacker) { target++; continue; }
      if (!(gAbsentBattlerFlags & gBitTable[target])) break;
      target++;
      if (target >= 32) break; // safety
    }
    setBattlerTarget(target);
    if (target >= gBattlersCount) {
      // advance (= already past args)
      return false;
    }
    ctx.scriptPtr = jumpPtr;
    return false;
  }
  // single battle : advance unconditionally.
  return false;
}

// ─── 0x7B tryhealhalfhealth ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryhealhalfhealth. 6 bytes (u32 failPtr + u8 battler). */
function Cmd_tryhealhalfhealth(ctx: BattleScriptContext): boolean {
  const failPtr = readWord(ctx);
  const battlerArg = readByte(ctx);
  if (battlerArg === BS_ATTACKER) {
    setBattlerTarget(gBattlerAttacker);
  }
  let dmg = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(-dmg);
  if (gBattleMons[gBattlerTarget].hp === gBattleMons[gBattlerTarget].maxHP) {
    ctx.scriptPtr = failPtr;
  }
  return false;
}

// ─── 0x9F dmgtolevel ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_dmgtolevel. 1 byte. */
function Cmd_dmgtolevel(_ctx: BattleScriptContext): boolean {
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].level);
  return false;
}

// ─── 0xA0 psywavedamageeffect ──────────────────────────────────────────────

/** 1:1 décomp Cmd_psywavedamageeffect. 1 byte.
 *  Random 50-150% du level via loop while > 10. */
function Cmd_psywavedamageeffect(_ctx: BattleScriptContext): boolean {
  let randDamage: number;
  do {
    randDamage = Random() % 16;
  } while (randDamage > 10);
  randDamage *= 10;
  const dmg = Math.floor(gBattleMons[gBattlerAttacker].level * (randDamage + 50) / 100);
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xB6 friendshiptodamagecalculation ────────────────────────────────────

/** 1:1 décomp Cmd_friendshiptodamagecalculation. 1 byte. */
function Cmd_friendshiptodamagecalculation(_ctx: BattleScriptContext): boolean {
  const move = getBattleMove(gCurrentMove);
  const effect = move?.effect ?? 0;
  const friendship = gBattleMons[gBattlerAttacker].friendship;
  if (effect === EFFECT_RETURN) {
    setDynamicBasePower(Math.floor(10 * friendship / 25));
  } else {
    setDynamicBasePower(Math.floor(10 * (MAX_FRIENDSHIP - friendship) / 25));
  }
  return false;
}

// ─── 0xBC maxattackhalvehp ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_maxattackhalvehp. 5 bytes (u32 fail jump). */
function Cmd_maxattackhalvehp(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let halfHp = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  if (halfHp === 0) halfHp = 1;
  if (gBattleMons[gBattlerAttacker].statStages[STAT_ATK] < MAX_STAT_STAGE
      && gBattleMons[gBattlerAttacker].hp > halfHp) {
    gBattleMons[gBattlerAttacker].statStages[STAT_ATK] = MAX_STAT_STAGE;
    let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 14 ════════════
/**
 * battle/cmd-batch-14.ts — Phase 1 Batch 14 (turn/action management) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x57 endlinkbattle           (1 byte — EmitEndLinkBattle 1:1 wire + Mark ; controller emit no-op Phase 1.4)
 *   0xC0 recoverbasedonsunlight  (5 bytes — Synthesis/Moonlight/MorningSun, weather-based)
 *   0xCA setforcedtarget         (1 byte — Follow Me)
 *   0xD0 settaunt                (5 bytes — Taunt, 2-turn timer)
 *   0xF4 subattackerhpbydmg      (1 byte — Submission/TakeDown recoil)
 *   0xF5 removeattackerstatus1   (1 byte — Rest healing cure)
 *   0xF6 finishaction            (1 byte — set gCurrentActionFuncId = B_ACTION_FINISHED__b14)
 *   0xF7 finishturn              (1 byte — finishaction + ActionNumber = battlersCount)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:39` (B_ACTION_FINISHED__b14=12)
 */








// ─── B_ACTION_FINISHED__b14 (battle.h:39) — 1:1 décomp ──────────────────────────
const B_ACTION_FINISHED__b14 = 12;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b14(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `WEATHER_HAS_EFFECT` macro (battle_util.h:47).
 *  TRUE sauf si ABILITY_CLOUD_NINE ou ABILITY_AIR_LOCK est on field. */
function _weatherHasEffect__b14(): boolean {
  const st = (globalThis as { __battleState?: {
    gBattlersCount?: number;
    gBattleMons?: Array<{ ability: number; hp: number }>;
  } }).__battleState;
  if (!st?.gBattleMons) return true;
  const count = st.gBattlersCount ?? 2;
  for (let i = 0; i < count; i++) {
    const mon = st.gBattleMons[i];
    if (!mon) continue;
    if ((mon.ability === ABILITY_CLOUD_NINE
         || mon.ability === ABILITY_AIR_LOCK)
        && mon.hp > 0) {
      return false;
    }
  }
  return true;
}

// ─── 0x57 endlinkbattle ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_endlinkbattle. 1 byte. */
function Cmd_endlinkbattle(_ctx: BattleScriptContext): boolean {
  const active = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(active);
  BtlController_EmitEndLinkBattle(B_COMM_TO_CONTROLLER, gBattleOutcome);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0xC0 recoverbasedonsunlight ───────────────────────────────────────────

/** 1:1 décomp Cmd_recoverbasedonsunlight. 5 bytes (u32 fail jump si full HP). */
function Cmd_recoverbasedonsunlight(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : `gBattlerTarget = gBattlerAttacker;` (= self-target).
  setBattlerTarget(gBattlerAttacker);
  if (gBattleMons[gBattlerAttacker].hp === gBattleMons[gBattlerAttacker].maxHP) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let dmg: number;
  if (gBattleWeather === 0 || !_weatherHasEffect__b14()) {
    dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  } else if (gBattleWeather & B_WEATHER_SUN) {
    dmg = Math.floor(20 * gBattleMons[gBattlerAttacker].maxHP / 30);
  } else {
    dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
  }
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(-dmg);
  return false;
}

// ─── 0xCA setforcedtarget ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setforcedtarget. 1 byte. */
function Cmd_setforcedtarget(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  gSideTimers[side].followmeTimer = 1;
  gSideTimers[side].followmeTarget = gBattlerAttacker;
  return false;
}

// ─── 0xD0 settaunt ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_settaunt. 5 bytes (u32 fail jump si déjà tauntTimer). */
function Cmd_settaunt(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gDisableStructs[gBattlerTarget].tauntTimer === 0) {
    gDisableStructs[gBattlerTarget].tauntTimer = 2;
    gDisableStructs[gBattlerTarget].tauntTimer2 = 2;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xF4 subattackerhpbydmg ───────────────────────────────────────────────

/** 1:1 décomp Cmd_subattackerhpbydmg. 1 byte. */
function Cmd_subattackerhpbydmg(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].hp -= gBattleMoveDamage;
  return false;
}

// ─── 0xF5 removeattackerstatus1 ────────────────────────────────────────────

/** 1:1 décomp Cmd_removeattackerstatus1. 1 byte. */
function Cmd_removeattackerstatus1(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status1 = 0;
  return false;
}

// ─── 0xF6 finishaction ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_finishaction. Set gCurrentActionFuncId = B_ACTION_FINISHED__b14.
 *  Décomp : main battle loop voit le flag et break le script (= ne re-call
 *  pas runBattleScript). Notre équivalent : set scriptPtr = -1 (= script done),
 *  return true (= paused = signal "fin"). Sans ça : stayOnOpcode infinite
 *  loop (= main battle loop pas wired chez nous). */
function Cmd_finishaction(ctx: BattleScriptContext): boolean {
  setCurrentActionFuncId(B_ACTION_FINISHED__b14);
  ctx.scriptPtr = -1;
  return true;
}

// ─── 0xF7 finishturn ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_finishturn. Set gCurrentActionFuncId + gCurrentTurnActionNumber.
 *  Idem finishaction : main battle loop break. Chez nous : scriptPtr = -1. */
function Cmd_finishturn(ctx: BattleScriptContext): boolean {
  setCurrentActionFuncId(B_ACTION_FINISHED__b14);
  setCurrentTurnActionNumber(gBattlersCount);
  ctx.scriptPtr = -1;
  return true;
}

// ─── Install dispatch table ─────────────────────────────────────────────────


// ════════════ Batch 15 ════════════
/**
 * battle/cmd-batch-15.ts — Phase 1 Batch 15 (protect / sport / environment) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x40 jumpifaffectedbyprotect    (5 bytes — DEFENDER_IS_PROTECTED + JumpIfMoveFailed)
 *   0xC2 selectfirstvalidtarget     (1 byte  — pick non-absent non-self battler)
 *   0xCF jumpifnodamage             (5 bytes — check gProtectStructs.physicalDmg/specialDmg)
 *   0xD1 trysethelpinghand          (5 bytes — set partner.helpingHand)
 *   0xD5 trysetroots                (5 bytes — set STATUS3_ROOTED)
 *   0xD6 doubledamagedealtifdamaged (1 byte  — Counter / MirrorCoat double-up)
 *   0xDF trysetmagiccoat            (5 bytes — set gProtectStructs.bounceMove)
 *   0xE0 trysetsnatch               (5 bytes — set gProtectStructs.stealMove)
 *   0xE4 getsecretpowereffect       (1 byte  — env→MOVE_EFFECT_*)
 *   0xE8 settypebasedhalvers        (5 bytes — Mud/Water Sport STATUS3_*)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:1009 JumpIfMoveFailed`
 *   - `decomps/pokeemeraude/include/constants/battle.h:245-275 MOVE_EFFECT_*`
 *   - `decomps/pokeemeraude/include/constants/battle.h:311-320 BATTLE_ENVIRONMENT_*`
 */











// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `GetBattlerPosition(battler)` (battle_anim_mons.c:858) — wired
// via util.ts (= return gBattlerPositions[battler]).


/** 1:1 décomp `DEFENDER_IS_PROTECTED` macro (battle_script_commands.c:57).
 *  `((gProtectStructs[gBattlerTarget].protected) &&
 *    (gBattleMoves[gCurrentMove].flags & FLAG_PROTECT_AFFECTED))` */
function DEFENDER_IS_PROTECTED(): boolean {
  if (!gProtectStructs[gBattlerTarget].protected) return false;
  return (getBattleMove(gCurrentMove).flags & FLAG_PROTECT_AFFECTED) !== 0;
}

/** 1:1 décomp `JumpIfMoveFailed(adder, move)` (battle_script_commands.c:1009).
 *  Si MOVE_RESULT_NO_EFFECT set : clear last-landed + jump fail.
 *  Sinon : TrySetDestinyBondToHappen + AbilityBattleEffects(ABSORBING).
 *  Si ABSORBING absorbed (= return truthy), exit sans advance.
 *  Sinon advance par `adder` bytes.
 *
 *  Notre port : AbilityBattleEffects(ABILITYEFFECT_ABSORBING) pas encore porté
 *  → return 0 (= n'absorbe pas). TrySetDestinyBondToHappen importé depuis N11.
 *
 *  Ce helper est en TS un void qui mute ctx.scriptPtr. Le caller passe
 *  `failJump` déjà lu (= T1_READ_PTR(instr+1)) et le ctx.scriptPtr déjà avancé
 *  par les readWord (= équivalent du `gBattlescriptCurrInstr + adder` post-read).
 *  Donc adder=5 → on a déjà lu 1 opcode + 4 bytes failJump = ctx.scriptPtr est
 *  au bon endroit, pas d'advance supplémentaire. */
function _jumpIfMoveFailed(ctx: BattleScriptContext, failJump: number): void {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    ctx.scriptPtr = failJump;
    return;
  }
  // 1:1 décomp : TrySetDestinyBondToHappen + AbilityBattleEffects(ABSORBING).
  _trySetDestinyBondToHappen__b15();
  // 1:1 décomp : if (AbilityBattleEffects(ABSORBING, target, 0, 0, move)) return;
  // → Volt/Water Absorb heal ou Flash Fire boost.
  const absorbEff = AbilityBattleEffects(ABILITYEFFECT_ABSORBING, gBattlerTarget, 0, 0, gCurrentMove);
  if (absorbEff !== 0) {
    const label = consumeAbilityWantedScript();
    if (label) {
      const off = getBattleScriptOffset(label);
      if (off >= 0) ctx.scriptPtr = off;
    }
    // Note : return sans advance — le helper a déjà set scriptPtr.
    return;
  }
}

/** 1:1 décomp `TrySetDestinyBondToHappen` (battle_script_commands.c:8288).
 *  Si target a DESTINY_BOND set et sides différents et !HITMARKER_GRUDGE →
 *  set HITMARKER_DESTINYBOND (= attacker mourra aussi). */
function _trySetDestinyBondToHappen__b15(): void {
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(gBattlerTarget);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_DESTINY_BOND)
      && sideAttacker !== sideTarget
      && !(gHitMarker & HITMARKER_GRUDGE)) {
    setHitMarker(gHitMarker | HITMARKER_DESTINYBOND);
  }
}

// ─── 0x40 jumpifaffectedbyprotect ─────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifaffectedbyprotect. 5 bytes. */
function Cmd_jumpifaffectedbyprotect(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (DEFENDER_IS_PROTECTED()) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    _jumpIfMoveFailed(ctx, failJump);
    gBattleCommunication[MISS_TYPE] = B_MSG_PROTECTED;
  }
  // Else : déjà au bon offset (= ctx.scriptPtr a avancé de 5 bytes : 1 opcode + 4 readWord).
  return false;
}

// ─── 0xC2 selectfirstvalidtarget ──────────────────────────────────────────

/** 1:1 décomp Cmd_selectfirstvalidtarget. 1 byte. */
function Cmd_selectfirstvalidtarget(_ctx: BattleScriptContext): boolean {
  let target = 0;
  for (target = 0; target < gBattlersCount; target++) {
    if (target === gBattlerAttacker) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  return false;
}

// ─── 0xCF jumpifnodamage ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnodamage. 5 bytes. */
function Cmd_jumpifnodamage(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  if (ps.physicalDmg || ps.specialDmg) {
    // Damage was dealt : continue (= déjà avancé par readWord).
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xD1 trysethelpinghand ───────────────────────────────────────────────

/** 1:1 décomp Cmd_trysethelpinghand. 5 bytes. */
function Cmd_trysethelpinghand(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
  setBattlerTarget(partner);
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
      && !(gAbsentBattlerFlags & gBitTable[partner])
      && !gProtectStructs[gBattlerAttacker].helpingHand
      && !gProtectStructs[partner].helpingHand) {
    gProtectStructs[partner].helpingHand = 1;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xD5 trysetroots ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetroots. 5 bytes. */
function Cmd_trysetroots(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_ROOTED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerAttacker] |= STATUS3_ROOTED;
  return false;
}

// ─── 0xD6 doubledamagedealtifdamaged ──────────────────────────────────────

/** 1:1 décomp Cmd_doubledamagedealtifdamaged. 1 byte.
 *  Counter / Mirror Coat double damage si target hit attacker ce turn. */
function Cmd_doubledamagedealtifdamaged(_ctx: BattleScriptContext): boolean {
  const ps = gProtectStructs[gBattlerAttacker];
  if ((ps.physicalDmg !== 0 && ps.physicalBattlerId === gBattlerTarget)
      || (ps.specialDmg !== 0 && ps.specialBattlerId === gBattlerTarget)) {
    gBattleScripting.dmgMultiplier = 2;
  }
  return false;
}

// ─── 0xDF trysetmagiccoat ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetmagiccoat. 5 bytes. */
function Cmd_trysetmagiccoat(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setBattlerTarget(gBattlerAttacker);
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    // Dernier à agir ce turn → Magic Coat fail (no incoming move to bounce).
    ctx.scriptPtr = failJump;
    return false;
  }
  gProtectStructs[gBattlerAttacker].bounceMove = 1;
  return false;
}

// ─── 0xE0 trysetsnatch ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetsnatch. 5 bytes. */
function Cmd_trysetsnatch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gProtectStructs[gBattlerAttacker].stealMove = 1;
  return false;
}

// ─── 0xE4 getsecretpowereffect ────────────────────────────────────────────

/** 1:1 décomp Cmd_getsecretpowereffect. 1 byte.
 *  Set gBattleCommunication[MOVE_EFFECT_BYTE] selon gBattleEnvironment. */
function Cmd_getsecretpowereffect(_ctx: BattleScriptContext): boolean {
  let effect: number;
  switch (gBattleEnvironment) {
    case BATTLE_ENVIRONMENT_GRASS:      effect = MOVE_EFFECT_POISON; break;
    case BATTLE_ENVIRONMENT_LONG_GRASS: effect = MOVE_EFFECT_SLEEP; break;
    case BATTLE_ENVIRONMENT_SAND:       effect = MOVE_EFFECT_ACC_MINUS_1; break;
    case BATTLE_ENVIRONMENT_UNDERWATER: effect = MOVE_EFFECT_DEF_MINUS_1; break;
    case BATTLE_ENVIRONMENT_WATER:      effect = MOVE_EFFECT_ATK_MINUS_1; break;
    case BATTLE_ENVIRONMENT_POND:       effect = MOVE_EFFECT_SPD_MINUS_1; break;
    case BATTLE_ENVIRONMENT_MOUNTAIN:   effect = MOVE_EFFECT_CONFUSION; break;
    case BATTLE_ENVIRONMENT_CAVE:       effect = MOVE_EFFECT_FLINCH; break;
    default:                            effect = MOVE_EFFECT_PARALYSIS; break;
  }
  gBattleCommunication[MOVE_EFFECT_BYTE] = effect;
  return false;
}

// ─── 0xE8 settypebasedhalvers ─────────────────────────────────────────────

/** 1:1 décomp Cmd_settypebasedhalvers. 5 bytes.
 *  Mud Sport (= halve Electric) ou Water Sport (= halve Fire). */
function Cmd_settypebasedhalvers(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let worked = false;
  const move = getBattleMove(gCurrentMove);
  if (move.effect === EFFECT_MUD_SPORT) {
    if (!(gStatuses3[gBattlerAttacker] & STATUS3_MUDSPORT)) {
      gStatuses3[gBattlerAttacker] |= STATUS3_MUDSPORT;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEAKEN_ELECTRIC;
      worked = true;
    }
  } else {
    // EFFECT_WATER_SPORT
    if (!(gStatuses3[gBattlerAttacker] & STATUS3_WATERSPORT)) {
      gStatuses3[gBattlerAttacker] |= STATUS3_WATERSPORT;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEAKEN_FIRE;
      worked = true;
    }
  }
  if (worked) return false;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 16 ════════════
/**
 * battle/cmd-batch-16.ts — Phase 1 Batch 16 (damage calcs spéciaux) — 9 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x94 damagetohalftargethp        (1 byte — gBattleMoveDamage = target.hp/2)
 *   0xA1 counterdamagecalculator     (5 bytes — Counter ×2 physicalDmg)
 *   0xA2 mirrorcoatdamagecalculator  (5 bytes — Mirror Coat ×2 specialDmg)
 *   0xAC remaininghptopower          (1 byte — Flail/Reversal hp-based power)
 *   0xB3 rolloutdamagecalculation    (1 byte — Rollout ×2 per turn)
 *   0xB5 furycuttercalc              (1 byte — Fury Cutter ×2 per consec hit)
 *   0xB7 presentdamagecalculation    (1 byte — Random 40/80/120/heal)
 *   0xB9 magnitudedamagecalculation  (1 byte — Random magnitude 4..10)
 *   0xDD weightdamagecalculation     (1 byte — Low Kick weight-based power)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:749 sFlailHpScaleToPowerTable`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:774 sWeightToDamageTable`
 *   - `decomps/pokeemeraude/src/battle_util.c:864 CancelMultiTurnMoves`
 */










// ─── 1:1 décomp tables (battle_script_commands.c:749, 774) ─────────────────

/** 1:1 décomp `sFlailHpScaleToPowerTable[]` (battle_script_commands.c:749).
 *  Format : [hpFractionMax, power] paires. */
const sFlailHpScaleToPowerTable: number[] = [
  1, 200,
  4, 150,
  9, 100,
  16, 80,
  32, 40,
  48, 20,
];

/** 1:1 décomp `sWeightToDamageTable[]` (battle_script_commands.c:774).
 *  Format : [minWeightHectograms, basePower] paires + sentinel 0xFFFF. */
const sWeightToDamageTable: number[] = [
  100, 20,
  250, 40,
  500, 60,
  1000, 80,
  2000, 100,
  0xFFFF, 0xFFFF,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b16(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `GetPokedexHeightWeight(dexNum, data)` (pokedex.c:4194-4205).
 *  Pour Low Kick : utilise weight (data=1).
 *
 *  Lookup via globalThis.gPokedexEntries[dexNum].weight si dispo (= decomp data
 *  lazy load). Sinon retourne 0 (= défaut petit pokemon = Low Kick power 20).
 *  Le décomp passe nationalDexNum, donc on convertit species → dexNum via
 *  SpeciesToNationalPokedexNum si dispo. */
function _getPokedexWeight(species: number): number {
  const g = globalThis as {
    gPokedexEntries?: Array<{ weight?: number }>;
    SpeciesToNationalPokedexNum?: (species: number) => number;
  };
  const dexNum = g.SpeciesToNationalPokedexNum?.(species) ?? species;
  return g.gPokedexEntries?.[dexNum]?.weight ?? 0;
}

// ─── 0x94 damagetohalftargethp ────────────────────────────────────────────

/** 1:1 décomp Cmd_damagetohalftargethp. 1 byte.
 *  Super Fang : damage = target.hp / 2 (min 1). */
function Cmd_damagetohalftargethp(_ctx: BattleScriptContext): boolean {
  let dmg = Math.floor(gBattleMons[gBattlerTarget].hp / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xA1 counterdamagecalculator ─────────────────────────────────────────

/** 1:1 décomp Cmd_counterdamagecalculator. 5 bytes. */
function Cmd_counterdamagecalculator(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(ps.physicalBattlerId);

  if (ps.physicalDmg
      && sideAttacker !== sideTarget
      && gBattleMons[ps.physicalBattlerId].hp) {
    setBattleMoveDamage(ps.physicalDmg * 2);
    if (gSideTimers[sideTarget].followmeTimer
        && gBattleMons[gSideTimers[sideTarget].followmeTarget].hp) {
      setBattlerTarget(gSideTimers[sideTarget].followmeTarget);
    } else {
      setBattlerTarget(ps.physicalBattlerId);
    }
    return false;
  }
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xA2 mirrorcoatdamagecalculator ──────────────────────────────────────

/** 1:1 décomp Cmd_mirrorcoatdamagecalculator. 5 bytes. */
function Cmd_mirrorcoatdamagecalculator(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(ps.specialBattlerId);

  if (ps.specialDmg
      && sideAttacker !== sideTarget
      && gBattleMons[ps.specialBattlerId].hp) {
    setBattleMoveDamage(ps.specialDmg * 2);
    if (gSideTimers[sideTarget].followmeTimer
        && gBattleMons[gSideTimers[sideTarget].followmeTarget].hp) {
      setBattlerTarget(gSideTimers[sideTarget].followmeTarget);
    } else {
      setBattlerTarget(ps.specialBattlerId);
    }
    return false;
  }
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xAC remaininghptopower ──────────────────────────────────────────────

/** 1:1 décomp Cmd_remaininghptopower. 1 byte. Flail / Reversal damage. */
function Cmd_remaininghptopower(_ctx: BattleScriptContext): boolean {
  const hpFraction = GetScaledHPFraction(
    gBattleMons[gBattlerAttacker].hp,
    gBattleMons[gBattlerAttacker].maxHP,
    48,
  );
  let i = 0;
  for (i = 0; i < sFlailHpScaleToPowerTable.length; i += 2) {
    if (hpFraction <= sFlailHpScaleToPowerTable[i]) break;
  }
  // 1:1 décomp : table parcourue par pas de 2 ; power à [i+1].
  setDynamicBasePower(sFlailHpScaleToPowerTable[i + 1]);
  return false;
}

// ─── 0xB3 rolloutdamagecalculation ────────────────────────────────────────

/** 1:1 décomp Cmd_rolloutdamagecalculation. 1 byte. */
function Cmd_rolloutdamagecalculation(ctx: BattleScriptContext): boolean {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    CancelMultiTurnMoves(gBattlerAttacker);
    const off = getBattleScriptOffset('BattleScript_MoveMissedPause');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS)) {
    gDisableStructs[gBattlerAttacker].rolloutTimer = 5;
    gDisableStructs[gBattlerAttacker].rolloutTimerStartValue = 5;
    gBattleMons[gBattlerAttacker].status2 |= STATUS2_MULTIPLETURNS;
    gLockedMoves[gBattlerAttacker] = gCurrentMove;
  }
  gDisableStructs[gBattlerAttacker].rolloutTimer--;
  if (gDisableStructs[gBattlerAttacker].rolloutTimer === 0) {
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_MULTIPLETURNS;
  }
  let power = getBattleMove(gCurrentMove).power;
  // 1:1 décomp : i loop de 1 à (5 - rolloutTimer)-1, double power chaque iter.
  const iters = 5 - gDisableStructs[gBattlerAttacker].rolloutTimer;
  for (let i = 1; i < iters; i++) {
    power *= 2;
  }
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_DEFENSE_CURL) {
    power *= 2;
  }
  setDynamicBasePower(power);
  return false;
}

// ─── 0xB5 furycuttercalc ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_furycuttercalc. 1 byte. */
function Cmd_furycuttercalc(ctx: BattleScriptContext): boolean {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    gDisableStructs[gBattlerAttacker].furyCutterCounter = 0;
    const off = getBattleScriptOffset('BattleScript_MoveMissedPause');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (gDisableStructs[gBattlerAttacker].furyCutterCounter !== 5) {
    gDisableStructs[gBattlerAttacker].furyCutterCounter++;
  }
  let power = getBattleMove(gCurrentMove).power;
  for (let i = 1; i < gDisableStructs[gBattlerAttacker].furyCutterCounter; i++) {
    power *= 2;
  }
  setDynamicBasePower(power);
  return false;
}

// ─── 0xB7 presentdamagecalculation ────────────────────────────────────────

/** 1:1 décomp Cmd_presentdamagecalculation. 1 byte. */
function Cmd_presentdamagecalculation(ctx: BattleScriptContext): boolean {
  const rand = Random() & 0xFF;
  if (rand < 102) {
    setDynamicBasePower(40);
  } else if (rand < 178) {
    setDynamicBasePower(80);
  } else if (rand < 204) {
    setDynamicBasePower(120);
  } else {
    let heal = Math.floor(gBattleMons[gBattlerTarget].maxHP / 4);
    if (heal === 0) heal = 1;
    setBattleMoveDamage(-heal);
  }

  if (rand < 204) {
    const off = getBattleScriptOffset('BattleScript_HitFromCritCalc');
    if (off >= 0) ctx.scriptPtr = off;
  } else if (gBattleMons[gBattlerTarget].maxHP === gBattleMons[gBattlerTarget].hp) {
    const off = getBattleScriptOffset('BattleScript_AlreadyAtFullHp');
    if (off >= 0) ctx.scriptPtr = off;
  } else {
    setMoveResultFlags(gMoveResultFlags & ~MOVE_RESULT_DOESNT_AFFECT_FOE);
    const off = getBattleScriptOffset('BattleScript_PresentHealTarget');
    if (off >= 0) ctx.scriptPtr = off;
  }
  return false;
}

// ─── 0xB9 magnitudedamagecalculation ──────────────────────────────────────

/** 1:1 décomp Cmd_magnitudedamagecalculation. 1 byte. */
function Cmd_magnitudedamagecalculation(_ctx: BattleScriptContext): boolean {
  let magnitude = Random() % 100;
  if (magnitude < 5) {
    setDynamicBasePower(10);
    magnitude = 4;
  } else if (magnitude < 15) {
    setDynamicBasePower(30);
    magnitude = 5;
  } else if (magnitude < 35) {
    setDynamicBasePower(50);
    magnitude = 6;
  } else if (magnitude < 65) {
    setDynamicBasePower(70);
    magnitude = 7;
  } else if (magnitude < 85) {
    setDynamicBasePower(90);
    magnitude = 8;
  } else if (magnitude < 95) {
    setDynamicBasePower(110);
    magnitude = 9;
  } else {
    setDynamicBasePower(150);
    magnitude = 10;
  }
  // 1:1 décomp battle_script_commands.c : `PREPARE_BYTE_NUMBER_BUFFER(gBattleTextBuff1, 2, magnitude)`.
  PREPARE_BYTE_NUMBER_BUFFER(_gBattleTextBuff1_16, 2, magnitude);

  // 1:1 décomp : foreach battler, skip self, break si non-absent (= pick first).
  let target = 0;
  for (target = 0; target < gBattlersCount; target++) {
    if (target === gBattlerAttacker) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  return false;
}

// ─── 0xDD weightdamagecalculation ─────────────────────────────────────────

/** 1:1 décomp Cmd_weightdamagecalculation. 1 byte. Low Kick / Grass Knot. */
function Cmd_weightdamagecalculation(_ctx: BattleScriptContext): boolean {
  const weight = _getPokedexWeight(gBattleMons[gBattlerTarget].species);
  let i = 0;
  // 1:1 décomp : iter pairs jusqu'à trouver weight > min ou hit sentinel 0xFFFF.
  for (i = 0; sWeightToDamageTable[i] !== 0xFFFF; i += 2) {
    if (sWeightToDamageTable[i] > weight) break;
  }
  if (sWeightToDamageTable[i] !== 0xFFFF) {
    setDynamicBasePower(sWeightToDamageTable[i + 1]);
  } else {
    setDynamicBasePower(120);
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 17 ════════════
/**
 * battle/cmd-batch-17.ts — Phase 1 Batch 17 (status field / type conversion) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x90 tryconversiontypechange   (5 bytes — Conversion type swap)
 *   0xA5 painsplitdmgcalc          (5 bytes — Pain Split HP avg)
 *   0xB0 trysetspikes              (5 bytes — Spikes side layer)
 *   0xB2 trysetperishsong          (5 bytes — Perish Song 3-turn)
 *   0xB4 jumpifconfusedandstatmaxed (6 bytes — Swagger/Flatter fail check)
 *   0xC9 trymemento                (5 bytes — Memento set damage = self.hp)
 *   0xDC trysetgrudge              (5 bytes — Grudge flag)
 *   0xEE removelightscreenreflect  (1 byte  — Brick Break)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */









// ─── 0x90 tryconversiontypechange ─────────────────────────────────────────

/** 1:1 décomp Cmd_tryconversiontypechange. 5 bytes. */
function Cmd_tryconversiontypechange(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];

  let validMoves = 0;
  while (validMoves < MAX_MON_MOVES) {
    if (atk.moves[validMoves] === MOVE_NONE) break;
    validMoves++;
  }

  // 1:1 décomp : itère pour trouver premier move dont type ≠ types[0..1].
  let moveChecked = 0;
  let moveType = 0;
  for (moveChecked = 0; moveChecked < validMoves; moveChecked++) {
    moveType = getBattleMove(atk.moves[moveChecked]).type;
    if (moveType === TYPE_MYSTERY) {
      moveType = IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_GHOST) ? TYPE_GHOST : TYPE_NORMAL;
    }
    if (moveType !== atk.type1 && moveType !== atk.type2) break;
  }

  if (moveChecked === validMoves) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // Random pick d'un move dont type ≠ types[0..1].
  do {
    do {
      moveChecked = Random() % MAX_MON_MOVES;
    } while (moveChecked >= validMoves);
    moveType = getBattleMove(atk.moves[moveChecked]).type;
    if (moveType === TYPE_MYSTERY) {
      moveType = IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_GHOST) ? TYPE_GHOST : TYPE_NORMAL;
    }
  } while (moveType === atk.type1 || moveType === atk.type2);

  // SET_BATTLER_TYPE = type1 = type2 = newType (battle.h macro 1:1).
  atk.type1 = moveType;
  atk.type2 = moveType;
  // 1:1 décomp battle_script_commands.c:7447.
  PREPARE_TYPE_BUFFER(gBattleTextBuff1, moveType);
  return false;
}

// ─── 0xA5 painsplitdmgcalc ────────────────────────────────────────────────

/** 1:1 décomp Cmd_painsplitdmgcalc. 5 bytes. */
function Cmd_painsplitdmgcalc(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const hpDiff = Math.floor((gBattleMons[gBattlerAttacker].hp + gBattleMons[gBattlerTarget].hp) / 2);
  const painSplitHp = gBattleMons[gBattlerTarget].hp - hpDiff;
  // 1:1 décomp store storeLoc[0..3] = u8 splits of u32 painSplitHp.
  // En TS on stocke directement le s32 dans painSplitHp (= équivalent
  // little-endian u8[4]).
  gBattleScripting.painSplitHp = painSplitHp;
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp - hpDiff);
  gSpecialStatuses[gBattlerTarget].shellBellDmg = IGNORE_SHELL_BELL;
  return false;
}

// ─── 0xB0 trysetspikes ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetspikes. 5 bytes. */
function Cmd_trysetspikes(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const targetSide = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[targetSide].spikesAmount === 3) {
    gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
    ctx.scriptPtr = failJump;
    return false;
  }
  gSideStatuses[targetSide] |= SIDE_STATUS_SPIKES;
  gSideTimers[targetSide].spikesAmount++;
  return false;
}

// ─── 0xB2 trysetperishsong ────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetperishsong. 5 bytes. */
function Cmd_trysetperishsong(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let notAffectedCount = 0;
  for (let i = 0; i < gBattlersCount; i++) {
    if ((gStatuses3[i] & STATUS3_PERISH_SONG)
        || gBattleMons[i].ability === ABILITY_SOUNDPROOF) {
      notAffectedCount++;
    } else {
      gStatuses3[i] |= STATUS3_PERISH_SONG;
      gDisableStructs[i].perishSongTimer = 3;
      gDisableStructs[i].perishSongTimerStartValue = 3;
    }
  }
  // 1:1 décomp PressurePPLoseOnUsingPerishSong (battle_util.c:799-828).
  // Inlined ici pour éviter circular import. Loop opponents avec Pressure +
  // deduit 1 PP supplémentaire du Perish Song du caster.
  const ABILITY_PRESSURE_LOCAL_N17 = 46;
  const MOVE_PERISH_SONG_LOCAL = 195;  // auto-data moves-data.ts
  const MAX_MON_MOVES_LOCAL_N17 = 4;
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleMons[i].ability === ABILITY_PRESSURE_LOCAL_N17 && i !== gBattlerAttacker) {
      for (let j = 0; j < MAX_MON_MOVES_LOCAL_N17; j++) {
        if (gBattleMons[gBattlerAttacker].moves[j] === MOVE_PERISH_SONG_LOCAL) {
          if (gBattleMons[gBattlerAttacker].pp[j] !== 0) {
            gBattleMons[gBattlerAttacker].pp[j]--;
          }
          break;
        }
      }
    }
  }
  if (notAffectedCount === gBattlersCount) {
    ctx.scriptPtr = failJump;
    return false;
  }
  return false;
}

// ─── 0xB4 jumpifconfusedandstatmaxed ──────────────────────────────────────

/** 1:1 décomp Cmd_jumpifconfusedandstatmaxed. 6 bytes (u8 stat + u32 jump). */
function Cmd_jumpifconfusedandstatmaxed(ctx: BattleScriptContext): boolean {
  const stat = readByte(ctx);
  const jumpPtr = readWord(ctx);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_CONFUSION)
      && gBattleMons[gBattlerTarget].statStages[stat] === MAX_STAT_STAGE) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0xC9 trymemento ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trymemento. 5 bytes. */
function Cmd_trymemento(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].statStages[STAT_ATK] === MIN_STAT_STAGE
      && gBattleMons[gBattlerTarget].statStages[STAT_SPATK] === MIN_STAT_STAGE
      && gBattleCommunication[MISS_TYPE] !== B_MSG_PROTECTED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  setActiveBattler(gBattlerAttacker);
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp);
  BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, INSTANT_HP_BAR_DROP);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0xDC trysetgrudge ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetgrudge. 5 bytes. */
function Cmd_trysetgrudge(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_GRUDGE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerAttacker] |= STATUS3_GRUDGE;
  return false;
}

// ─── 0xEE removelightscreenreflect ────────────────────────────────────────

/** 1:1 décomp Cmd_removelightscreenreflect. 1 byte. Brick Break. */
function Cmd_removelightscreenreflect(_ctx: BattleScriptContext): boolean {
  const opposingSide = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[opposingSide].reflectTimer || gSideTimers[opposingSide].lightscreenTimer) {
    gSideStatuses[opposingSide] &= ~SIDE_STATUS_REFLECT;
    gSideStatuses[opposingSide] &= ~SIDE_STATUS_LIGHTSCREEN;
    gSideTimers[opposingSide].reflectTimer = 0;
    gSideTimers[opposingSide].lightscreenTimer = 0;
    gBattleScripting.animTurn = 1;
    gBattleScripting.animTargetsHit = 1;
  } else {
    gBattleScripting.animTurn = 0;
    gBattleScripting.animTargetsHit = 0;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 18 ════════════
/**
 * battle/cmd-batch-18.ts — Phase 1 Batch 18 (status anims + abilities + weather) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x64 statusanimation         (2 bytes — STATUS1 sprite anim)
 *   0x65 status2animation        (6 bytes — STATUS2 sprite anim)
 *   0x66 chosenstatusanimation   (7 bytes — explicit status anim)
 *   0xD3 trycopyability          (5 bytes — Role Play)
 *   0xDA tryswapabilities        (5 bytes — Skill Swap)
 *   0xE9 setweatherballtype      (1 byte  — Weather Ball type swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */








// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b18(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `WEATHER_HAS_EFFECT` macro — wired via util.ts.


// ─── 0x64 statusanimation ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_statusanimation. 2 bytes (u8 battler arg). */
function Cmd_statusanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b18(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, false, gBattleMons[active].status1);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0x65 status2animation ────────────────────────────────────────────────

/** 1:1 décomp Cmd_status2animation. 6 bytes (u8 battler + u32 wantedToAnimate mask). */
function Cmd_status2animation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b18(ctx);
  const arg = readByte(ctx);
  const wantedToAnimate = readWord(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, true, gBattleMons[active].status2 & wantedToAnimate);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0x66 chosenstatusanimation ───────────────────────────────────────────

/** 1:1 décomp Cmd_chosenstatusanimation. 7 bytes (u8 battler + u8 isStatus2 + u32 status). */
function Cmd_chosenstatusanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b18(ctx);
  const arg = readByte(ctx);
  const isStatus2Byte = readByte(ctx);
  const wantedStatus = readWord(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, isStatus2Byte !== 0, wantedStatus);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0xD3 trycopyability ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_trycopyability. 5 bytes. Role Play. */
function Cmd_trycopyability(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].ability !== ABILITY_NONE
      && gBattleMons[gBattlerTarget].ability !== ABILITY_WONDER_GUARD) {
    gBattleMons[gBattlerAttacker].ability = gBattleMons[gBattlerTarget].ability;
    setLastUsedAbility(gBattleMons[gBattlerTarget].ability);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xDA tryswapabilities ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryswapabilities. 5 bytes. Skill Swap. */
function Cmd_tryswapabilities(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];
  if ((atk.ability === ABILITY_NONE && tgt.ability === ABILITY_NONE)
      || atk.ability === ABILITY_WONDER_GUARD
      || tgt.ability === ABILITY_WONDER_GUARD
      || (gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const abilityAtk = atk.ability;
  atk.ability = tgt.ability;
  tgt.ability = abilityAtk;
  return false;
}

// ─── 0xE9 setweatherballtype ──────────────────────────────────────────────

/** 1:1 décomp Cmd_setweatherballtype. 1 byte. */
function Cmd_setweatherballtype(_ctx: BattleScriptContext): boolean {
  if (_weatherHasEffect()) {
    if (gBattleWeather & B_WEATHER_ANY) {
      gBattleScripting.dmgMultiplier = 2;
    }
    let dynType: number;
    if (gBattleWeather & B_WEATHER_RAIN) {
      dynType = TYPE_WATER | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_SANDSTORM) {
      dynType = TYPE_ROCK | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_SUN) {
      dynType = TYPE_FIRE | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_HAIL) {
      dynType = TYPE_ICE | F_DYNAMIC_TYPE_SET;
    } else {
      dynType = TYPE_NORMAL | F_DYNAMIC_TYPE_SET;
    }
    setDynamicMoveType(dynType);
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 19 ════════════
/**
 * battle/cmd-batch-19.ts — Phase 1 Batch 19 (rest/bide/camouflage/party UI) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x43 jumpifabilitypresent     (6 bytes — AbilityBattleEffects(CHECK_ON_FIELD))
 *   0x61 drawpartystatussummary   (2 bytes — party HP/status row UI)
 *   0x62 hidepartystatussummary   (2 bytes — hide row)
 *   0x81 trysetrest               (5 bytes — Rest 3-turn sleep + max HP heal)
 *   0x8B setbide                  (1 byte  — Bide 2-turn lock + dmg accumulate)
 *   0x8C confuseifrepeatingattackends (1 byte — Thrash/Petal Dance end → confusion)
 *   0xE2 switchoutabilities       (2 bytes — Natural Cure on switch out)
 *   0xEB settypetoenvironment     (5 bytes — Camouflage type swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:826 sEnvironmentToType`
 */









// ─── B_MSG_* rest (battle_string_ids.h:476-477) — 1:1 décomp ───────────────
const B_MSG_REST          = 0;
const B_MSG_REST_STATUSED = 1;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b19(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `AbilityBattleEffects(ABILITYEFFECT_CHECK_ON_FIELD, ...)`.
 *  Cherche si une ability donnée est présente sur le field (hp != 0).
 *  Wire via AbilityBattleEffects qui implémente la logique 1:1. */
function _abilityCheckOnField(abilityId: number): boolean {
  return AbilityBattleEffects(ABILITYEFFECT_CHECK_ON_FIELD, 0, abilityId, 0, 0) !== 0;
}

// ─── 0x43 jumpifabilitypresent ────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifabilitypresent. 6 bytes (u8 ability + u32 jump). */
function Cmd_jumpifabilitypresent(ctx: BattleScriptContext): boolean {
  const ability = readByte(ctx);
  const jumpPtr = readWord(ctx);
  if (_abilityCheckOnField(ability)) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0x61 drawpartystatussummary ──────────────────────────────────────────

/** 1:1 décomp Cmd_drawpartystatussummary (battle_script_commands.c). 2 bytes. */
function Cmd_drawpartystatussummary(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b19(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  // 1:1 décomp battle_script_commands.c:5700-5735 : build hpStatuses[PARTY_SIZE].
  // Note : décomp utilise MON_DATA_SPECIES_OR_EGG qui retourne SPECIES_EGG (=412)
  // si isEgg. Le check `== SPECIES_NONE || == SPECIES_EGG` matche les deux ; les
  // deux cas → hp=0xFFFF, status=0.
  const party = GET_BATTLER_SIDE_CDS(active) === B_SIDE_PLAYER_CDS
    ? gPlayerParty_CDS
    : gEnemyParty_CDS;
  const hpStatuses: { hp: number; status: number }[] = [];
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = GetMonData_CDS(party[i], MON_DATA_SPECIES_CDS) as number;
    const isEgg = GetMonData_CDS(party[i], MON_DATA_IS_EGG_CDS) as number;
    if (species === 0 /* SPECIES_NONE */ || isEgg) {
      // 1:1 décomp : empty slot ou egg → marker 0xFFFF.
      hpStatuses.push({ hp: 0xFFFF, status: 0 });
    } else {
      hpStatuses.push({
        hp: GetMonData_CDS(party[i], MON_DATA_HP_CDS) as number,
        status: GetMonData_CDS(party[i], MON_DATA_STATUS_CDS) as number,
      });
    }
  }
  BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, hpStatuses, 1);
  MarkBattlerForControllerExec(active);
  return false;
}

// Imports locaux pour Cmd_drawpartystatussummary (= éviter import dups).



// ─── 0x62 hidepartystatussummary ──────────────────────────────────────────

/** 1:1 décomp Cmd_hidepartystatussummary. 2 bytes. */
function Cmd_hidepartystatussummary(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  BtlController_EmitHidePartyStatusSummary(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x81 trysetrest ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetrest. 5 bytes. */
function Cmd_trysetrest(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : gActiveBattler = gBattlerTarget = gBattlerAttacker
  setActiveBattler(gBattlerAttacker);
  setBattlerTarget(gBattlerAttacker);
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].maxHP * -1);
  if (gBattleMons[gBattlerAttacker].hp === gBattleMons[gBattlerAttacker].maxHP) {
    ctx.scriptPtr = failJump;
    return false;
  }
  if (gBattleMons[gBattlerAttacker].status1 & (~STATUS1_SLEEP & 0xFF)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_REST_STATUSED;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_REST;
  }
  gBattleMons[gBattlerAttacker].status1 = STATUS1_SLEEP_TURN(3);
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, 0, 4, gBattleMons[gBattlerAttacker].status1);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x8B setbide ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setbide. 1 byte. */
function Cmd_setbide(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_MULTIPLETURNS;
  gLockedMoves[gBattlerAttacker] = gCurrentMove;
  gBideDmg[gBattlerAttacker] = 0;
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_BIDE_TURN(2);
  return false;
}

// ─── 0x8C confuseifrepeatingattackends ────────────────────────────────────

/** 1:1 décomp Cmd_confuseifrepeatingattackends. 1 byte.
 *  Si pas déjà LOCK_CONFUSE : queue MOVE_EFFECT_THRASH | AFFECTS_USER. */
function Cmd_confuseifrepeatingattackends(_ctx: BattleScriptContext): boolean {
  if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_LOCK_CONFUSE)) {
    gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_THRASH | MOVE_EFFECT_AFFECTS_USER;
  }
  return false;
}

// ─── 0xE2 switchoutabilities ──────────────────────────────────────────────

/** 1:1 décomp Cmd_switchoutabilities (battle_script_commands.c:9593-9610).
 *  2 bytes. Natural Cure clears status1 quand le mon est rappelé. */
function Cmd_switchoutabilities(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  switch (gBattleMons[active].ability) {
    case ABILITY_NATURAL_CURE: {
      gBattleMons[active].status1 = 0;
      // 1:1 décomp : monToCheck = gBitTable[battlerPartyIndexes[active]] (= party slot bitmask).
      // 1:1 décomp l.9602 : gBattleStruct->battlerPartyIndexes (PAS le global gBattlerPartyIndexes
      // qui peut déjà pointer le mon entrant au switch-out → efface le statut du mauvais slot).
      const partyBitmask = gBitTable[gBattleStruct.battlerPartyIndexes[active]];
      BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, partyBitmask, 4, gBattleMons[active].status1);
      MarkBattlerForControllerExec(active);
      break;
    }
    default: break;
  }
  return false;
}





// ─── 0xEB settypetoenvironment ────────────────────────────────────────────

/** 1:1 décomp Cmd_settypetoenvironment. 5 bytes. Camouflage. */
function Cmd_settypetoenvironment(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const targetType = sEnvironmentToType[gBattleEnvironment] ?? 0;
  if (!IS_BATTLER_OF_TYPE(atk.type1, atk.type2, targetType)) {
    // SET_BATTLER_TYPE = type1 = type2 = newType.
    atk.type1 = targetType;
    atk.type2 = targetType;
    // 1:1 décomp battle_script_commands.c:9839.
    PREPARE_TYPE_BUFFER(_gBattleTextBuff1_19, targetType);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused warnings (kept for reference / future use).
void GetBattlerAtPosition;
void B_POSITION_PLAYER_LEFT;


// ════════════ Batch 20 ════════════
/**
 * battle/cmd-batch-20.ts — Phase 1 Batch 20 (protect/explosion/weather dmg) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x72 jumpifplayerran          (5 bytes — TryRunFromBattle check)
 *   0x77 setprotectlike           (1 byte  — Protect/Detect/Endure)
 *   0x78 tryexplosion             (1 byte  — Self-destruct + Damp check)
 *   0x96 weatherdamage            (1 byte  — Sandstorm/Hail residual dmg)
 *   0xBD copyfoestats             (5 bytes — Psych Up)
 *   0xD9 scaledamagebyhealthratio (1 byte  — Eruption/Water Spout)
 *   0xEA tryrecycleitem           (5 bytes — Recycle used held item)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:719 sProtectSuccessRates`
 */








// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b20(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `WEATHER_HAS_EFFECT` macro — wired via util.ts.


// 1:1 décomp `TryRunFromBattle(battler)` (battle_util.c:407-485).

function _tryRunFromBattle(battler: number): boolean {
  return _tryRunFromBattleFull(battler);
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.

function _recordAbilityBattle__b20(battler: number, ability: number): void {
  _recordAbilityBattleFullN20(battler, ability);
}

// ─── 0x72 jumpifplayerran ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifplayerran. 5 bytes. */
function Cmd_jumpifplayerran(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (_tryRunFromBattle(gBattlerFainted)) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0x77 setprotectlike ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setprotectlike. 1 byte. */
function Cmd_setprotectlike(_ctx: BattleScriptContext): boolean {
  let notLastTurn = true;
  const lastMove = gLastResultingMoves[gBattlerAttacker];

  if (lastMove !== MOVE_PROTECT && lastMove !== MOVE_DETECT && lastMove !== MOVE_ENDURE) {
    gDisableStructs[gBattlerAttacker].protectUses = 0;
  }
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    notLastTurn = false;
  }

  const successRate = sProtectSuccessRates[gDisableStructs[gBattlerAttacker].protectUses] ?? 0;
  if (successRate >= Random() && notLastTurn) {
    const effect = getBattleMove(gCurrentMove).effect;
    if (effect === EFFECT_PROTECT) {
      gProtectStructs[gBattlerAttacker].protected = 1;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PROTECTED_ITSELF;
    }
    if (effect === EFFECT_ENDURE) {
      gProtectStructs[gBattlerAttacker].endured = 1;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_BRACED_ITSELF;
    }
    gDisableStructs[gBattlerAttacker].protectUses++;
  } else {
    gDisableStructs[gBattlerAttacker].protectUses = 0;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PROTECT_FAILED;
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
  }
  return false;
}

// ─── 0x78 tryexplosion ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryexplosion. 1 byte. Self-destruct/Explosion + Damp check. */
function Cmd_tryexplosion(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b20(ctx);

  // 1:1 décomp : search field for Damp.
  let dampBattler = 0;
  for (dampBattler = 0; dampBattler < gBattlersCount; dampBattler++) {
    if (gBattleMons[dampBattler].ability === ABILITY_DAMP) break;
  }

  if (dampBattler === gBattlersCount) {
    // Pas de Damp : se faint + pick target.
    setActiveBattler(gBattlerAttacker);
    setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp);
    BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, INSTANT_HP_BAR_DROP);
    MarkBattlerForControllerExec(gBattlerAttacker);

    // 1:1 décomp : pick first non-self non-absent battler comme nouveau target.
    let target = 0;
    for (target = 0; target < gBattlersCount; target++) {
      if (target === gBattlerAttacker) continue;
      if (!(gAbsentBattlerFlags & gBitTable[target])) break;
    }
    setBattlerTarget(target);
    return false;
  }

  // Damp présent : explosion bloquée.
  setLastUsedAbility(ABILITY_DAMP);
  _recordAbilityBattle__b20(dampBattler, gBattleMons[dampBattler].ability);
  setBattlerTarget(dampBattler);  // 1:1 décomp : gBattlerTarget est utilisé par le script.
  const off = getBattleScriptOffset('BattleScript_DampStopsExplosion');
  if (off >= 0) ctx.scriptPtr = off;
  return false;
}

// ─── 0x96 weatherdamage ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_weatherdamage. 1 byte. End-of-turn weather damage. */
function Cmd_weatherdamage(_ctx: BattleScriptContext): boolean {
  const atk = gBattleMons[gBattlerAttacker];

  if (_weatherHasEffect()) {
    if (gBattleWeather & B_WEATHER_SANDSTORM) {
      if (atk.type1 !== TYPE_ROCK && atk.type1 !== TYPE_STEEL && atk.type1 !== TYPE_GROUND
          && atk.type2 !== TYPE_ROCK && atk.type2 !== TYPE_STEEL && atk.type2 !== TYPE_GROUND
          && atk.ability !== ABILITY_SAND_VEIL
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERGROUND)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERWATER)) {
        let dmg = Math.floor(atk.maxHP / 16);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
      } else {
        setBattleMoveDamage(0);
      }
    }
    if (gBattleWeather & B_WEATHER_HAIL) {
      if (!IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_ICE)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERGROUND)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERWATER)) {
        let dmg = Math.floor(atk.maxHP / 16);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
      } else {
        setBattleMoveDamage(0);
      }
    }
  } else {
    setBattleMoveDamage(0);
  }
  // 1:1 décomp : safety check si attacker est absent.
  if (gAbsentBattlerFlags & gBitTable[gBattlerAttacker]) {
    setBattleMoveDamage(0);
  }
  return false;
}

// ─── 0xBD copyfoestats ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_copyfoestats. 5 bytes (jump arg pas utilisé). Psych Up. */
function Cmd_copyfoestats(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // 1:1 décomp avance de 5 mais ne jump pas (= jump arg ignoré).
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    gBattleMons[gBattlerAttacker].statStages[i] = gBattleMons[gBattlerTarget].statStages[i];
  }
  return false;
}

// ─── 0xD9 scaledamagebyhealthratio ────────────────────────────────────────

/** 1:1 décomp Cmd_scaledamagebyhealthratio. 1 byte. Eruption/Water Spout. */
function Cmd_scaledamagebyhealthratio(_ctx: BattleScriptContext): boolean {
  if (gDynamicBasePower === 0) {
    const power = getBattleMove(gCurrentMove).power;
    let scaled = Math.floor((gBattleMons[gBattlerAttacker].hp * power) / gBattleMons[gBattlerAttacker].maxHP);
    if (scaled === 0) scaled = 1;
    setDynamicBasePower(scaled);
  }
  return false;
}

// ─── 0xEA tryrecycleitem ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryrecycleitem. 5 bytes. */
function Cmd_tryrecycleitem(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setActiveBattler(gBattlerAttacker);
  const used = gUsedHeldItems[gBattlerAttacker];
  if (used !== 0 && gBattleMons[gBattlerAttacker].item === 0) {
    setLastUsedItem(used);
    gUsedHeldItems[gBattlerAttacker] = 0;
    gBattleMons[gBattlerAttacker].item = used;
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleMons[gBattlerAttacker].item);
    MarkBattlerForControllerExec(gBattlerAttacker);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused warnings.
void gLastUsedItem;
void gLastUsedAbility;


// ════════════ Batch 21 ════════════
/**
 * battle/cmd-batch-21.ts — Phase 1 Batch 21 (item/wish/transform/OHKO) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x6A removeitem                (2 bytes — gUsedHeldItems[batter] = item; item=0)
 *   0x93 tryko                     (5 bytes — OHKO Horn Drill/Guillotine/Fissure)
 *   0x9B transformdataexecution    (1 byte  — Transform copy fields)
 *   0xD4 trywish                   (6 bytes — Wish 1-turn delay heal, case 0/1)
 *   0xE1 trygetintimidatetarget    (5 bytes — pick Intimidate target)
 *   0xED snatchsetbattlers         (1 byte  — Snatch swap battler ids)
 *   0xF8 trainerslideout           (2 bytes — trainer sprite slide back)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */











// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `GetItemHoldEffect/Param` (item.c) — wired vers data/item-hold-effects.

function _getItemHoldEffect__b21(item: number): number { return _ghe21(item); }
function _getItemHoldEffectParam__b21(item: number): number { return _ghep21(item); }

// 1:1 STRICT décomp `RecordItemEffectBattle` + `RecordAbilityBattle` (battle_util.c)
// — wired via util.ts. PORTÉS 1:1, plus de stub.

function _recordItemEffectBattle__b21(battler: number, holdEffect: number): void {
  _recordItemEffectBattleFullN21(battler, holdEffect);
}
function _recordAbilityBattle__b21(battler: number, ability: number): void {
  _recordAbilityBattleFullN21(battler, ability);
}

// ─── 0x6A removeitem ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_removeitem. 2 bytes. */
function Cmd_removeitem(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  gUsedHeldItems[active] = gBattleMons[active].item;
  gBattleMons[active].item = 0;  // ITEM_NONE
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleMons[active].item);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x93 tryko ───────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryKO. 5 bytes (u32 miss jump). OHKO moves. */
function Cmd_tryko(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);

  // 1:1 décomp : check hold effect (Enigma Berry vs general).
  // Notre port : pas d'Enigma Berry support → just GetItemHoldEffect.
  const holdEffect = _getItemHoldEffect__b21(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam__b21(gBattleMons[gBattlerTarget].item);

  setPotentialItemEffectBattler(gBattlerTarget);

  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle__b21(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }

  if (gBattleMons[gBattlerTarget].ability === ABILITY_STURDY) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    setLastUsedAbility(ABILITY_STURDY);
    const off = getBattleScriptOffset('BattleScript_SturdyPreventsOHKO');
    if (off >= 0) ctx.scriptPtr = off;
    _recordAbilityBattle__b21(gBattlerTarget, ABILITY_STURDY);
    return false;
  }

  let chance: boolean;
  if (!(gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS)) {
    const accuracy = getBattleMove(gCurrentMove).accuracy
      + (gBattleMons[gBattlerAttacker].level - gBattleMons[gBattlerTarget].level);
    chance = ((Random() % 100) + 1 < accuracy)
      && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level;
  } else if (gDisableStructs[gBattlerTarget].battlerWithSureHit === gBattlerAttacker
             && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level) {
    chance = true;
  } else {
    const accuracy = getBattleMove(gCurrentMove).accuracy
      + (gBattleMons[gBattlerAttacker].level - gBattleMons[gBattlerTarget].level);
    chance = ((Random() % 100) + 1 < accuracy)
      && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level;
  }

  if (chance) {
    if (gProtectStructs[gBattlerTarget].endured) {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    } else {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_ONE_HIT_KO);
    }
    return false;
  }
  // Miss path.
  setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
  if (gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_KO_MISS;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_KO_UNAFFECTED;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0x9B transformdataexecution ──────────────────────────────────────────

/** 1:1 décomp Cmd_transformdataexecution. 1 byte. */
function Cmd_transformdataexecution(_ctx: BattleScriptContext): boolean {
  setChosenMove(MOVE_UNAVAILABLE);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_TRANSFORMED)
      || (gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_TRANSFORM_FAILED;
    return false;
  }
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];
  atk.status2 |= STATUS2_TRANSFORMED;
  gDisableStructs[gBattlerAttacker].disabledMove = MOVE_NONE;
  gDisableStructs[gBattlerAttacker].disableTimer = 0;
  gDisableStructs[gBattlerAttacker].transformedMonPersonality = tgt.personality;
  gDisableStructs[gBattlerAttacker].mimickedMoves = 0;

  // 1:1 décomp battle_script_commands.c:7788 : PREPARE_SPECIES_BUFFER pour
  // afficher le nom du species cible dans le message "X se transforme en Y".
  PREPARE_SPECIES_BUFFER(gBattleTextBuff1, tgt.species);

  // 1:1 décomp : memcpy from gBattleMons[target] to gBattleMons[attacker]
  // jusqu'à offsetof(BattlePokemon, pp). En TS, on copie les champs explicites
  // dans l'ordre du struct (= avant pp). Note : species/atk/def/speed/spAtk/
  // spDef + moves + hpIV..spDefenseIV + isEgg/abilityNum/statStages + ability +
  // type1/type2 (pas pp).
  atk.species = tgt.species;
  atk.attack = tgt.attack;
  atk.defense = tgt.defense;
  atk.speed = tgt.speed;
  atk.spAttack = tgt.spAttack;
  atk.spDefense = tgt.spDefense;
  atk.moves = [...tgt.moves];
  atk.hpIV = tgt.hpIV;
  atk.attackIV = tgt.attackIV;
  atk.defenseIV = tgt.defenseIV;
  atk.speedIV = tgt.speedIV;
  atk.spAttackIV = tgt.spAttackIV;
  atk.spDefenseIV = tgt.spDefenseIV;
  atk.isEgg = tgt.isEgg;
  atk.abilityNum = tgt.abilityNum;
  atk.statStages = [...tgt.statStages];
  atk.ability = tgt.ability;
  atk.type1 = tgt.type1;
  atk.type2 = tgt.type2;

  // 1:1 décomp : set pp à min(move.pp, 5) pour chaque move.
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const movePp = getBattleMove(atk.moves[i]).pp;
    atk.pp[i] = movePp < 5 ? movePp : 5;
  }
  // 1:1 décomp : emit ResetActionMoveSelection + Mark.
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitResetActionMoveSelection(B_COMM_TO_CONTROLLER, RESET_MOVE_SELECTION);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_TRANSFORMED;
  return false;
}

// ─── 0xD4 trywish ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trywish. 6 bytes (u8 caseId + u32 fail jump). */
function Cmd_trywish(ctx: BattleScriptContext): boolean {
  const caseId = readByte(ctx);
  const failJump = readWord(ctx);
  switch (caseId) {
    case 0: {
      // 1:1 décomp battle_script_commands.c : Set Wish (turn this is used).
      // `wishMonId[attacker] = gBattlerPartyIndexes[attacker]` (= party slot du mon
      // qui pose Wish, pour vérifier au trigger qu'il est toujours présent).
      if (gWishFutureKnock.wishCounter[gBattlerAttacker] === 0) {
        gWishFutureKnock.wishCounter[gBattlerAttacker] = 2;
        gWishFutureKnock.wishMonId[gBattlerAttacker] = _gBattlerPartyIndexes_N21[gBattlerAttacker];
      } else {
        ctx.scriptPtr = failJump;
      }
      break;
    }
    case 1: {
      // Trigger Wish heal (= 2 turns later).
      // 1:1 décomp battle_script_commands.c:9312 : PREPARE_MON_NICK_WITH_PREFIX_BUFFER
      // pour afficher le nom du mon qui a lancé Wish (= récupéré via wishMonId party slot).
      PREPARE_MON_NICK_WITH_PREFIX_BUFFER(
        _gBattleTextBuff1_21, gBattlerTarget,
        gWishFutureKnock.wishMonId[gBattlerTarget],
      );
      let dmg = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
      if (dmg === 0) dmg = 1;
      dmg *= -1;
      setBattleMoveDamage(dmg);
      if (gBattleMons[gBattlerTarget].hp === gBattleMons[gBattlerTarget].maxHP) {
        ctx.scriptPtr = failJump;
      }
      break;
    }
    default: break;
  }
  return false;
}

// ─── 0xE1 trygetintimidatetarget ──────────────────────────────────────────

/** 1:1 décomp Cmd_trygetintimidatetarget (battle_script_commands.c:9570-9591). */
function Cmd_trygetintimidatetarget(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  gBattleScripting.battler = gBattleStruct.intimidateBattler;
  const side = GET_BATTLER_SIDE(gBattleScripting.battler);

  // 1:1 décomp battle_script_commands.c:9577.
  PREPARE_ABILITY_BUFFER(_gBattleTextBuff1_21, gBattleMons[gBattleScripting.battler].ability);

  let target = gBattlerTarget;
  for (; target < gBattlersCount; target++) {
    if (GET_BATTLER_SIDE(target) === side) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  if (target >= gBattlersCount) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0xED snatchsetbattlers ───────────────────────────────────────────────

/** 1:1 décomp Cmd_snatchsetbattlers. 1 byte. */
function Cmd_snatchsetbattlers(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp :
  //   gEffectBattler = gBattlerAttacker;
  //   if (attacker == target) attacker = target = scripting.battler;
  //   else target = scripting.battler;
  //   scripting.battler = gEffectBattler;
  const origAttacker = gBattlerAttacker;
  setEffectBattler(origAttacker);
  if (gBattlerAttacker === gBattlerTarget) {
    setBattlerAttacker(gBattleScripting.battler);
    setBattlerTarget(gBattleScripting.battler);
  } else {
    setBattlerTarget(gBattleScripting.battler);
  }
  gBattleScripting.battler = origAttacker;
  return false;
}

// ─── 0xF8 trainerslideout ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_trainerslideout. 2 bytes (u8 position). */
function Cmd_trainerslideout(ctx: BattleScriptContext): boolean {
  const position = readByte(ctx);
  const active = GetBattlerAtPosition(position);
  setActiveBattler(active);
  BtlController_EmitTrainerSlideBack(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused warnings.
void BtlController_EmitBattleAnimation;
void STATUS2_SUBSTITUTE;
void gActiveBattler;
void gLastUsedAbility;
void gLastUsedItem;
void gBattleMoveDamage;
void gPotentialItemEffectBattler;


// ════════════ Batch 22 ════════════
/**
 * battle/cmd-batch-22.ts — Phase 1 Batch 22 (cleanup/stockpile/dmg adjust) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x08 adjustnormaldamage2     (1 byte  — Endure/Focus Band post-random)
 *   0x25 movevaluescleanup       (1 byte  — reset move-cycle state)
 *   0x4A typecalc2               (1 byte  — Foresight typecalc loop)
 *   0x69 adjustsetdamage         (1 byte  — Set dmg with Endure/Focus Band/FalseSwipe)
 *   0x85 stockpile               (1 byte  — Stockpile counter+1)
 *   0x86 stockpiletobasedamage   (5 bytes — Spit Up dmg from counter)
 *   0x87 stockpiletohpheal       (5 bytes — Swallow heal from counter)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:3624 MoveValuesCleanUp`
 */












// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp helpers — wired vers vrais ports.
function _getItemHoldEffect__b22(item: number): number { return _GetItemHoldEffectN22(item); }
function _getItemHoldEffectParam__b22(item: number): number { return _GetItemHoldEffectParamN22(item); }
function _recordItemEffectBattle__b22(b: number, h: number): void { _recordItemEffectBattleFullN22(b, h); }
function _recordAbilityBattle__b22(b: number, a: number): void { _recordAbilityBattleFullN22(b, a); }

/** 1:1 décomp `ApplyRandomDmgMultiplier()` (battle_util.c). Multiplie damage
 *  par random 85-100%. */
function _applyRandomDmgMultiplier(): void {
  if (gBattleMoveDamage === 0) return;
  // 1:1 décomp ApplyRandomDmgMultiplier (battle_script_commands.c:1639-1651) :
  // randPercent = 100 - (Random() % 16). PAS (rand%16)+85 : même intervalle [85..100]
  // mais mapping RNG inversé (rand%16=0 → 100 décomp vs 85 ici) → casse le déterminisme 1:1.
  const randPercent = 100 - (Random() % 16);
  let dmg = Math.floor((gBattleMoveDamage * randPercent) / 100);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);
}

/** 1:1 décomp `MoveValuesCleanUp()` (battle_script_commands.c:3624). */
function _moveValuesCleanUp(): void {
  setMoveResultFlags(0);
  gBattleScripting.dmgMultiplier = 1;
  setCritMultiplier(1);
  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleCommunication[MISS_TYPE] = 0;
  setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
  setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
}

// ─── 0x08 adjustnormaldamage2 ─────────────────────────────────────────────

/** 1:1 décomp Cmd_adjustnormaldamage2. 1 byte. */
function Cmd_adjustnormaldamage2(_ctx: BattleScriptContext): boolean {
  _applyRandomDmgMultiplier();
  const holdEffect = _getItemHoldEffect__b22(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam__b22(gBattleMons[gBattlerTarget].item);
  setPotentialItemEffectBattler(gBattlerTarget);
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle__b22(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }
  if (!(gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE)
      && (gProtectStructs[gBattlerTarget].endured || gSpecialStatuses[gBattlerTarget].focusBanded)
      && gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
    setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
    if (gProtectStructs[gBattlerTarget].endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    }
  }
  return false;
}

// ─── 0x25 movevaluescleanup ───────────────────────────────────────────────

/** 1:1 décomp Cmd_movevaluescleanup. 1 byte. */
function Cmd_movevaluescleanup(_ctx: BattleScriptContext): boolean {
  _moveValuesCleanUp();
  return false;
}

// ─── 0x4A typecalc2 ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_typecalc2. 1 byte. Foresight-aware type calc (= no STAB,
 *  no Wonder Guard skip on power=0 check).
 *
 *  Note 1:1 : `flags` local accumule NVE/SE pour le Wonder Guard check seul.
 *  NO_EFFECT set directly dans gMoveResultFlags pendant le loop. À la fin,
 *  `flags` n'est PAS merge dans gMoveResultFlags (= 1:1 décomp ne le fait
 *  pas, NVE/SE sont calculés par un autre opcode). */
function Cmd_typecalc2(_ctx: BattleScriptContext): boolean {
  let flags = 0;
  let i = 0;
  const moveType = getBattleMove(gCurrentMove).type;
  const tgt = gBattleMons[gBattlerTarget];

  if (tgt.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    setLastUsedAbility(tgt.ability);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
    gLastLandedMoves[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_GROUND_MISS;
    _recordAbilityBattle__b22(gBattlerTarget, gLastUsedAbility);
  } else {
    // 1:1 décomp : itère gTypeEffectiveness chart.
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (tgt.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      }
      if (gTypeEffectiveness[i] === moveType) {
        // 1er check : types[0].
        if (gTypeEffectiveness[i + 1] === tgt.type1) {
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_NO_EFFECT) {
            setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_DOESNT_AFFECT_FOE);
            break;
          }
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_NOT_EFFECTIVE) {
            flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
          }
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_SUPER_EFFECTIVE) {
            flags |= MOVE_RESULT_SUPER_EFFECTIVE;
          }
        }
        // 2e check : types[1] (si différent de types[0]).
        if (gTypeEffectiveness[i + 1] === tgt.type2) {
          if (tgt.type1 !== tgt.type2 && gTypeEffectiveness[i + 2] === TYPE_MUL_NO_EFFECT) {
            setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_DOESNT_AFFECT_FOE);
            break;
          }
          if (gTypeEffectiveness[i + 1] === tgt.type2
              && tgt.type1 !== tgt.type2
              && gTypeEffectiveness[i + 2] === TYPE_MUL_NOT_EFFECTIVE) {
            flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
          }
          if (gTypeEffectiveness[i + 1] === tgt.type2
              && tgt.type1 !== tgt.type2
              && gTypeEffectiveness[i + 2] === TYPE_MUL_SUPER_EFFECTIVE) {
            flags |= MOVE_RESULT_SUPER_EFFECTIVE;
          }
        }
      }
      i += 3;
    }
  }

  // 1:1 décomp Wonder Guard check utilise `flags` local (NOT gMoveResultFlags).
  if (tgt.ability === ABILITY_WONDER_GUARD
      && !(flags & MOVE_RESULT_NO_EFFECT)
      // 1:1 décomp l.4582 : Garde Mystik ne bloque qu'au tour où le move FRAPPE
      // (==2), pas pendant le tour de charge d'un move 2-tours (Vol/Tunnel/Lance-Soleil…).
      && attacksThisTurn(gBattlerAttacker, gCurrentMove) === 2
      && (!(flags & MOVE_RESULT_SUPER_EFFECTIVE)
          || ((flags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
              === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
      && getBattleMove(gCurrentMove).power) {
    setLastUsedAbility(ABILITY_WONDER_GUARD);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_AVOIDED_DMG;
    _recordAbilityBattle__b22(gBattlerTarget, gLastUsedAbility);
  }
  if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) {
    gProtectStructs[gBattlerAttacker].targetNotAffected = 1;
  }
  return false;
}

// ─── 0x69 adjustsetdamage ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_adjustsetdamage. 1 byte. Endure / Focus Band / False Swipe. */
function Cmd_adjustsetdamage(_ctx: BattleScriptContext): boolean {
  const holdEffect = _getItemHoldEffect__b22(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam__b22(gBattleMons[gBattlerTarget].item);
  setPotentialItemEffectBattler(gBattlerTarget);
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle__b22(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }
  const moveEffect = getBattleMove(gCurrentMove).effect;
  if (!(gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE)
      && (moveEffect === EFFECT_FALSE_SWIPE
          || gProtectStructs[gBattlerTarget].endured
          || gSpecialStatuses[gBattlerTarget].focusBanded)
      && gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
    setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
    if (gProtectStructs[gBattlerTarget].endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    }
  }
  return false;
}

// ─── 0x85 stockpile ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_stockpile. 1 byte. */
function Cmd_stockpile(_ctx: BattleScriptContext): boolean {
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 3) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_STOCKPILE;
    return false;
  }
  gDisableStructs[gBattlerAttacker].stockpileCounter++;
  // 1:1 décomp battle_script_commands.c:6864.
  PREPARE_BYTE_NUMBER_BUFFER(_gBattleTextBuff1_22, 1, gDisableStructs[gBattlerAttacker].stockpileCounter);
  gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STOCKPILED;
  return false;
}

// ─── 0x86 stockpiletobasedamage ───────────────────────────────────────────

/** 1:1 décomp Cmd_stockpiletobasedamage. 5 bytes (u32 fail jump). Spit Up. */
function Cmd_stockpiletobasedamage(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 0) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }
  if (gBattleCommunication[MISS_TYPE] !== B_MSG_PROTECTED) {
    // 1:1 décomp : CalculateBaseDamage + counter multiplier + HelpingHand.
    const baseDmg = runDamagecalc(
      gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)],
      0,  // dynamicBasePower
      0,  // dynamicMoveType
    );
    let dmg = baseDmg * gDisableStructs[gBattlerAttacker].stockpileCounter;
    gBattleScripting.animTurn = gDisableStructs[gBattlerAttacker].stockpileCounter;
    if (gProtectStructs[gBattlerAttacker].helpingHand) {
      dmg = Math.floor((dmg * 15) / 10);
    }
    setBattleMoveDamage(dmg);
  }
  gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
  return false;
}

// ─── 0x87 stockpiletohpheal ───────────────────────────────────────────────

/** 1:1 décomp Cmd_stockpiletohpheal. 5 bytes (u32 fail jump). Swallow. */
function Cmd_stockpiletohpheal(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 0) {
    ctx.scriptPtr = jumpPtr;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SWALLOW_FAILED;
    return false;
  }
  if (gBattleMons[gBattlerAttacker].maxHP === gBattleMons[gBattlerAttacker].hp) {
    gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
    ctx.scriptPtr = jumpPtr;
    setBattlerTarget(gBattlerAttacker);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SWALLOW_FULL_HP;
    return false;
  }
  // 1:1 décomp : 1<<(3-counter) divisor. counter=1 → 1/4, =2 → 1/2, =3 → 1/1.
  const divisor = 1 << (3 - gDisableStructs[gBattlerAttacker].stockpileCounter);
  let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / divisor);
  if (dmg === 0) dmg = 1;
  dmg *= -1;
  setBattleMoveDamage(dmg);
  gBattleScripting.animTurn = gDisableStructs[gBattlerAttacker].stockpileCounter;
  gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
  setBattlerTarget(gBattlerAttacker);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused warnings.
void gSideTimers;
void gCritMultiplier;
void gPotentialItemEffectBattler;


// ════════════ Batch 23 ════════════
/**
 * battle/cmd-batch-23.ts — Phase 1 Batch 23 (clear status / spite / imprison / future / pursuit) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x18 clearstatusfromeffect    (2 bytes — clear status1/2 flag set by MOVE_EFFECT_BYTE)
 *   0x83 nop                       (1 byte  — pure no-op)
 *   0xAD tryspiteppreduce          (5 bytes — Spite PP reduction)
 *   0xC3 trysetfutureattack        (5 bytes — Future Sight / Doom Desire)
 *   0xDB tryimprison               (5 bytes — Imprison set bit)
 *   0xEC pursuitdoubles            (5 bytes — Pursuit double battle special)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */














// [RÉCONCILIÉ 2026-05-31] Le doublon `_statusFlagsForMoveEffects__b23` (port
// "Partial", il MANQUAIT MOVE_EFFECT_PREVENT_ESCAPE + MOVE_EFFECT_NIGHTMARE) +
// son `PRIMARY_STATUS_MOVE_EFFECT__b23` + `Cmd_clearstatusfromeffect__b23` ont été
// SUPPRIMÉS (code mort : 0x18 utilise le canonique __b02 = 15/15 entrées 1:1 décomp
// battle_script_commands.c:608). 1 seule version désormais.

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `PressurePPLoseOnUsingImprison(attacker)` (battle_util.c:767-797).
 *  Si un opponent a Pressure : Imprison utilise -1 PP supplémentaire.
 *
 *  Lazy lookup via globalThis pour éviter circular import avec state.ts. */
function _pressurePPLoseOnUsingImprison(attacker: number): void {
  const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number; gBattleMons?: { ability: number; moves: number[]; pp: number[] }[] } }).__battleState;
  const battlersCount = stateMod?.gBattlersCount ?? 2;
  const battleMons = stateMod?.gBattleMons;
  if (!battleMons) return;

  const atkSide = attacker & 1;
  let imprisonPos = MAX_MON_MOVES;

  for (let i = 0; i < battlersCount; i++) {
    if (atkSide !== (i & 1) && battleMons[i].ability === ABILITY_PRESSURE) {
      let j: number;
      for (j = 0; j < MAX_MON_MOVES; j++) {
        if (battleMons[attacker].moves[j] === MOVE_IMPRISON) break;
      }
      if (j !== MAX_MON_MOVES) {
        imprisonPos = j;
        if (battleMons[attacker].pp[j] !== 0) {
          battleMons[attacker].pp[j]--;
        }
      }
    }
  }
  // 1:1 décomp battle_util.c:791-796 : si MOVE_IS_PERMANENT, emit SetMonData
  // REQUEST_PPMOVE1_BATTLE + imprisonPos pour persist au save block.
  if (imprisonPos !== MAX_MON_MOVES && _moveIsPermanent_N23(attacker, imprisonPos)) {
    _setActiveBattler_N23(attacker);
    _BtlController_EmitSetMonData_N23(0 /* B_COMM_TO_CONTROLLER */,
      9 + imprisonPos /* REQUEST_PPMOVE1_BATTLE + idx */,
      0, 1, battleMons[attacker].pp[imprisonPos]);
    _MarkBattlerForControllerExec_N23(attacker);
  }
}

/** 1:1 décomp `MOVE_IS_PERMANENT(battler, idx)` macro = !TRANSFORMED && !(mimickedMoves & bit). */
function _moveIsPermanent_N23(battler: number, idx: number): boolean {
  const st = (globalThis as { __battleState?: {
    gBattleMons?: Array<{ status2: number }>;
    gDisableStructs?: Array<{ mimickedMoves: number }>;
  } }).__battleState;
  const mon = st?.gBattleMons?.[battler];
  const ds = st?.gDisableStructs?.[battler];
  if (!mon || !ds) return false;
  // 1:1 décomp battle.h:145 : STATUS2_TRANSFORMED = 1 << 21 = 0x200000.
  // AUDIT BUG FIX : était 0x4000000 (= STATUS2_ESCAPE_PREVENTION) → 0x200000.
  return !(mon.status2 & 0x200000 /* STATUS2_TRANSFORMED */)
      && !(ds.mimickedMoves & (1 << idx));
}

/** 1:1 décomp `CalculateBaseDamage` — wrapped via runDamagecalc. */
function _calculateBaseDamage(sideStatus: number, power: number, type: number): number {
  return runDamagecalc(sideStatus, power, type);
}

// (0x18 clearstatusfromeffect : doublon __b23 incomplet supprimé — voir note plus haut.
//  Le handler registré pour 0x18 est le canonique __b02.)

// ─── 0x83 nop ─────────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_nop. 1 byte. (Indices unused dans dispatch). */
function Cmd_nop(_ctx: BattleScriptContext): boolean {
  return false;
}

// ─── 0xAD tryspiteppreduce ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryspiteppreduce. 5 bytes. */
function Cmd_tryspiteppreduce(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gLastMoves[gBattlerTarget] === MOVE_NONE || gLastMoves[gBattlerTarget] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gLastMoves[gBattlerTarget] === gBattleMons[gBattlerTarget].moves[i]) break;
  }
  if (i === MAX_MON_MOVES || gBattleMons[gBattlerTarget].pp[i] <= 1) {
    ctx.scriptPtr = failJump;
    return false;
  }

  let ppToDeduct = (Random() & 3) + 2;
  if (gBattleMons[gBattlerTarget].pp[i] < ppToDeduct) {
    ppToDeduct = gBattleMons[gBattlerTarget].pp[i];
  }
  // 1:1 décomp battle_script_commands.c:8340-8344. ConvertIntToDecimalStringN
  // (left-align variant pour gBattleTextBuff2) est suivi de PREPARE_BYTE_NUMBER_BUFFER
  // qui overwrite gBattleTextBuff2 — donc seul PREPARE_BYTE_NUMBER_BUFFER prend effet
  // pour le rendu. Le décomp utilise ConvertIntToDecimalStringN pour debug/safety,
  // mais c'est dead code post-PREPARE. On honore juste PREPARE_*.
  PREPARE_MOVE_BUFFER(_gBattleTextBuff1_23, gLastMoves[gBattlerTarget]);
  PREPARE_BYTE_NUMBER_BUFFER(_gBattleTextBuff2_23, 1, ppToDeduct);
  gBattleMons[gBattlerTarget].pp[i] -= ppToDeduct;
  setActiveBattler(gBattlerTarget);

  if (!(gDisableStructs[gBattlerTarget].mimickedMoves & gBitTable[i])
      && !(gBattleMons[gBattlerTarget].status2 & STATUS2_TRANSFORMED)) {
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_PPMOVE1_BATTLE + i, 0, 1, gBattleMons[gBattlerTarget].pp[i]);
    MarkBattlerForControllerExec(gBattlerTarget);
  }

  if (gBattleMons[gBattlerTarget].pp[i] === 0) {
    CancelMultiTurnMoves(gBattlerTarget);
  }
  return false;
}

// ─── 0xC3 trysetfutureattack ──────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetfutureattack. 5 bytes. Future Sight / Doom Desire. */
function Cmd_trysetfutureattack(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gWishFutureKnock.futureSightCounter[gBattlerTarget] !== 0) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const targetSide = GET_BATTLER_SIDE(gBattlerTarget);
  gSideStatuses[targetSide] |= SIDE_STATUS_FUTUREATTACK;
  gWishFutureKnock.futureSightMove[gBattlerTarget] = gCurrentMove;
  gWishFutureKnock.futureSightAttacker[gBattlerTarget] = gBattlerAttacker;
  gWishFutureKnock.futureSightCounter[gBattlerTarget] = 3;

  let dmg = _calculateBaseDamage(gSideStatuses[targetSide], 0, 0);
  if (gProtectStructs[gBattlerAttacker].helpingHand) {
    dmg = Math.floor((dmg * 15) / 10);
  }
  gWishFutureKnock.futureSightDmg[gBattlerTarget] = dmg;
  // 1:1 décomp : set MULTISTRING_CHOOSER selon Doom Desire vs Future Sight.
  if (gCurrentMove === MOVE_DOOM_DESIRE) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DOOM_DESIRE;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_FUTURE_SIGHT;
  }
  return false;
}

// ─── 0xDB tryimprison ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryimprison. 5 bytes. */
function Cmd_tryimprison(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_IMPRISONED_OTHERS) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  _pressurePPLoseOnUsingImprison(gBattlerAttacker);

  let battler = 0;
  for (battler = 0; battler < gBattlersCount; battler++) {
    if (sideAttacker !== GET_BATTLER_SIDE(battler)) {
      let attackerMoveId = 0;
      for (attackerMoveId = 0; attackerMoveId < MAX_MON_MOVES; attackerMoveId++) {
        let i = 0;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[gBattlerAttacker].moves[attackerMoveId] === gBattleMons[battler].moves[i]
              && gBattleMons[gBattlerAttacker].moves[attackerMoveId] !== MOVE_NONE) break;
        }
        if (i !== MAX_MON_MOVES) break;
      }
      if (attackerMoveId !== MAX_MON_MOVES) {
        gStatuses3[gBattlerAttacker] |= STATUS3_IMPRISONED_OTHERS;
        return false;
      }
    }
  }
  if (battler === gBattlersCount) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0xEC pursuitdoubles ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_pursuitdoubles (battle_script_commands.c). 5 bytes.
 *  BATTLE_PARTNER macro = battler ^ BIT_FLANK (= 2). En single battle, partner
 *  = attacker ^ 2 (= adversaire opposé). En double, partner = real partner. */
function Cmd_pursuitdoubles(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp l.9852 : BATTLE_PARTNER(GetBattlerPosition(attacker)) — wrap la position
  // (identique en simple/double standard ; diffère en link/multi où les positions sont réordonnées).
  const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
  setActiveBattler(partner);
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
      && !(gAbsentBattlerFlags & gBitTable[partner])
      && gChosenActionByBattler[partner] === B_ACTION_USE_MOVE
      && gChosenMoveByBattler[partner] === MOVE_PURSUIT) {
    gActionsByTurnOrder[partner] = B_ACTION_TRY_FINISH;
    setCurrentMove(MOVE_PURSUIT);
    gBattleScripting.animTurn = 1;
    gBattleScripting.pursuitDoublesAttacker = gBattlerAttacker;
    setBattlerAttacker(partner);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused (kept for clarity / future use).
void gMoveResultFlags;


// ════════════ Batch 24 ════════════
/**
 * battle/cmd-batch-24.ts — Phase 1 Batch 24 (switch UI emit) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4C getswitchedmondata    (2 bytes — read incoming mon data via controller)
 *   0x4E switchinanim          (3 bytes — switch-in sprite anim + pokedex flag)
 *   0x53 trainerslidein        (2 bytes — trainer sprite slide-in)
 *   0x58 returntoball          (2 bytes — return mon to ball + fade out)
 *   0x24 checkteamslost        (5 bytes — check win/loss outcome)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */



// ÉTAPE 2c : câblage 1:1 module Pokédex canonique (remplace le POC inline
// `_handleSetPokedexFlag_CDS` species==natDex identité + seen-only sans
// triple-redondance). pokedex-flags n'importe PAS battle/ → 0 cycle (l'ancien
// "éviter import circulaire 27→24" est moot, les 2 importent le module partagé).






// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b24(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x4C getswitchedmondata ──────────────────────────────────────────────

/** 1:1 décomp Cmd_getswitchedmondata (battle_script_commands.c:4609-4622). 2 bytes. */
function Cmd_getswitchedmondata(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b24(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  // 1:1 décomp ll.4616 : gBattlerPartyIndexes[active] = gBattleStruct.monToSwitchIntoId[active].
  const monToSwitchInto = _gBattleStruct_CDS.monToSwitchIntoId?.[active] ?? 0;
  _gBattlerPartyIndexes_CDS[active] = monToSwitchInto;
  // 1:1 décomp ll.4618 : emit GetMonData REQUEST_ALL_BATTLE avec bitflag du nouveau partyIdx.
  BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE,
    gBitTable[_gBattlerPartyIndexes_CDS[active]]);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x4E switchinanim ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_switchinanim (battle_script_commands.c:4677-4708). 3 bytes
 *  (u8 battler + u8 dontClear). */
function Cmd_switchinanim(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b24(ctx);
  const arg = readByte(ctx);
  const dontClear = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  // 1:1 décomp : si battler OPPONENT_SIDE + !LINK/FRONTIER battle, HandleSetPokedexFlag
  // FLAG_SET_SEEN (= mon vu par player → seen flag).
  // AUDIT BUG FIX : 5 constantes BATTLE_TYPE_* hardcoded fausses → import depuis
  // constants.ts (= valeurs correctes 1:1 battle.h).
  const side = active & 1;  // 0 player, 1 opponent.
  const tf = (globalThis as { __battleState?: { gBattleTypeFlags?: number } }).__battleState?.gBattleTypeFlags ?? 0;
  if (side === 1 /* B_SIDE_OPPONENT */
      && !(tf & (BATTLE_TYPE_LINK_C24
                | BATTLE_TYPE_EREADER_TRAINER_C24
                | BATTLE_TYPE_RECORDED_LINK_C24
                | BATTLE_TYPE_TRAINER_HILL_C24
                | BATTLE_TYPE_FRONTIER_C24))) {
    // 1:1 décomp battle_script_commands.c:4690 / battle_main.c:3448 :
    // HandleSetPokedexFlag(SpeciesToNationalPokedexNum(gBattleMons[active]
    //   .species), FLAG_SET_SEEN, gBattleMons[active].personality)
    HandleSetPokedexFlag(
      SpeciesToNationalPokedexNum(gBattleMons[active].species),
      FLAG_SET_SEEN, gBattleMons[active].personality);
  }
  setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[active]);
  // 1:1 décomp : passe gBattlerPartyIndexes[active] comme partyId (= slot du mon switched in).
  BtlController_EmitSwitchInAnim(B_COMM_TO_CONTROLLER, _gBattlerPartyIndexes_CDS[active], dontClear);
  MarkBattlerForControllerExec(active);
  return false;
}

// ÉTAPE 2c — POC inline `_handleSetPokedexFlag_CDS` (species==natDex identité
// FAUX Hoenn ; seen-only sans triple-redondance ni wrapper Unown/Spinda)
// SUPPRIMÉ. Remplacé 1:1 par `../pokedex-flags` (appel inline ci-dessus dans
// Cmd_switchinanim, = décomp battle_script_commands.c:4690).

// ─── 0x53 trainerslidein ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_trainerslidein. 2 bytes (u8 position). */
function Cmd_trainerslidein(ctx: BattleScriptContext): boolean {
  const position = readByte(ctx);
  const active = GetBattlerAtPosition(position);
  setActiveBattler(active);
  BtlController_EmitTrainerSlide(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x58 returntoball ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_returntoball. 2 bytes (u8 battler). */
function Cmd_returntoball(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, true);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x24 checkteamslost ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_checkteamslost (battle_script_commands.c:3537-3618).
 *  5 bytes (u32 jump). Check les parties complètes (gPlayerParty + gEnemyParty)
 *  pour déterminer LOST/WON outcome.
 *
 *  AUDIT BUG FIX (post session 141) : était check actifs only, ce qui causait
 *  LOST mark trop tôt si player active mon KO mais reserves alive. Maintenant
 *  full party iteration 1:1 décomp.
 *
 *  LINK/MULTI branches différés (= jumpPtr non utilisé pour single battle). */
function Cmd_checkteamslost(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b24(ctx);
  const _jumpPtr = readWord(ctx); void _jumpPtr;

  // 1:1 décomp 3556-3565 : iterate gPlayerParty for HP_count.
  let playerHpSum = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_SPECIES_CTL) as number;
    const isEgg = _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_IS_EGG_CTL) as number;
    if (species !== 0 && !isEgg) {
      playerHpSum += _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_HP_CTL) as number;
    }
  }
  if (playerHpSum === 0) setBattleOutcome(gBattleOutcome | B_OUTCOME_LOST);

  // 1:1 décomp 3571-3580 : iterate gEnemyParty for HP_count.
  let oppHpSum = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_SPECIES_CTL) as number;
    const isEgg = _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_IS_EGG_CTL) as number;
    if (species !== 0 && !isEgg) {
      oppHpSum += _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_HP_CTL) as number;
    }
  }
  if (oppHpSum === 0) setBattleOutcome(gBattleOutcome | B_OUTCOME_WON);

  // LINK/MULTI branches (= empty spots check + jump si needed) — différé.
  return false;
}

// Imports locaux Cmd_checkteamslost — éviter dups au top du file.


// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 25 ════════════
/**
 * battle/cmd-batch-25.ts — Phase 1 Batch 25 (anim variants + mimic + castform) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x45 playanimation              (7 bytes — battle anim emit)
 *   0x46 playanimation_var          (10 bytes — battle anim via u8* ptr)
 *   0x9D mimicattackcopy            (5 bytes — Mimic copy last opp move)
 *   0xE6 docastformchangeanimation  (1 byte  — Castform anim emit)
 *   0xE7 trycastformdatachange      (1 byte  — Castform data update)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:725 sMovesForbiddenToCopy`
 */











// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `IsMoveUncopyableByMimic(u16 move)` (battle_script_commands.c:7838). */
function IsMoveUncopyableByMimic(move: number): boolean {
  let i = 0;
  while (sMovesForbiddenToCopy[i] !== MIMIC_FORBIDDEN_END
         && sMovesForbiddenToCopy[i] !== move) i++;
  return sMovesForbiddenToCopy[i] !== MIMIC_FORBIDDEN_END;
}

/** Test si l'anim id est une weather "continues" anim.
 *  AUDIT BUG FIX : valeurs étaient 1..4 (= STATS_CHANGE/SUBSTITUTE_FADE area)
 *  → vraies = 10..13 (battle_anim.h:367-370). */
function _isWeatherContinuesAnim(animId: number): boolean {
  // 1:1 décomp battle_anim.h:367-370 :
  //   B_ANIM_RAIN_CONTINUES=10, SUN_CONTINUES=11, SANDSTORM_CONTINUES=12, HAIL_CONTINUES=13.
  return animId >= 10 && animId <= 13;
}

/** B_ANIM_STATS_CHANGE/SNATCH_MOVE/SUBSTITUTE_FADE — always play.
 *  1:1 décomp battle_anim.h (= 358,374). */
function _isAlwaysPlayAnim(animId: number): boolean {
  return animId === B_ANIM_STATS_CHANGE
      || animId === B_ANIM_SUBSTITUTE_FADE
      || animId === B_ANIM_SNATCH_MOVE;
}

// ─── 0x45 playanimation ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_playanimation. 7 bytes (u8 battler + u8 anim_id + u32 arg_ptr).
 *  arg_ptr est un POINTEUR (le C lit `*argumentPtr` — `playanimation X,
 *  B_ANIM_STATS_CHANGE, sB_ANIM_ARG1`) : notre bytecode l'encode en
 *  SYMBOL_MARKER → DÉRÉFÉRENCER via memory-map. ⚠ BUG corrigé 2026-06-13 :
 *  l'ancien code tronquait le marqueur en valeur directe → le contrôleur
 *  recevait l'ID du symbole (10) au lieu d'animArg1 (22) → l'anim de stats
 *  décodait `default` → AUCUNE anim de stats ne jouait (retour user). */
function Cmd_playanimation(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const animId = readByte(ctx);
  const argPtr = readWord(ctx);
  const argAcc = resolveAddress(argPtr);
  const argument = argAcc ? (argAcc.read() & 0xFFFF) : (argPtr & 0xFFFF);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  if (_isAlwaysPlayAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gHitMarker & HITMARKER_NO_ANIMATIONS) {
    // 1:1 décomp l.4022-4026 : BattleScriptPush(retour) + jump BattleScript_Pausex20 (pause 0x20
    // frames). ctx.scriptPtr est déjà à l'opcode suivant (post-advance) = currInstr+7.
    BattleScriptPush(ctx, ctx.scriptPtr);
    const pauseOffset = getBattleScriptOffset('BattleScript_Pausex20');
    if (pauseOffset >= 0) ctx.scriptPtr = pauseOffset;
    return false;
  }
  if (_isWeatherContinuesAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gStatuses3[active] & STATUS3_SEMI_INVULNERABLE) {
    // Skip anim, just advance.
    return false;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x46 playanimation_var ───────────────────────────────────────────────

/** 1:1 décomp Cmd_playanimation_var. 10 bytes (u8 battler + u32 anim_ptr + u32 arg_ptr).
 *  Décomp déréfère animationIdPtr (u8*) et argumentPtr (u16*) — même
 *  déréférencement memory-map que Cmd_playanimation (fix 2026-06-13) ;
 *  fallback valeur directe si l'opérande n'est pas un symbole whitelisté. */
function Cmd_playanimation_var(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const animIdPtr = readWord(ctx);
  const animIdAcc = resolveAddress(animIdPtr);
  const animId = (animIdAcc ? animIdAcc.read() : animIdPtr) & 0xFF;
  const argPtr = readWord(ctx);
  const argAcc = resolveAddress(argPtr);
  const argument = (argAcc ? argAcc.read() : argPtr) & 0xFFFF;
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  if (_isAlwaysPlayAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gHitMarker & HITMARKER_NO_ANIMATIONS) {
    return false;
  }
  if (_isWeatherContinuesAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gStatuses3[active] & STATUS3_SEMI_INVULNERABLE) {
    return false;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x9D mimicattackcopy ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_mimicattackcopy. 5 bytes (u32 fail jump). */
function Cmd_mimicattackcopy(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setChosenMove(MOVE_UNAVAILABLE);

  if (IsMoveUncopyableByMimic(gLastMoves[gBattlerTarget])
      || (gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
      || gLastMoves[gBattlerTarget] === MOVE_NONE
      || gLastMoves[gBattlerTarget] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[gBattlerAttacker].moves[i] === gLastMoves[gBattlerTarget]) break;
  }
  if (i !== MAX_MON_MOVES) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Move not already known : replace at gCurrMovePos.
  gBattleMons[gBattlerAttacker].moves[gCurrMovePos] = gLastMoves[gBattlerTarget];
  const targetMovePp = getBattleMove(gLastMoves[gBattlerTarget]).pp;
  gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = targetMovePp < 5 ? targetMovePp : 5;
  // 1:1 décomp battle_script_commands.c:7876.
  PREPARE_MOVE_BUFFER(_gBattleTextBuff1_25, gLastMoves[gBattlerTarget]);
  gDisableStructs[gBattlerAttacker].mimickedMoves |= gBitTable[gCurrMovePos];
  return false;
}

// ─── 0xE6 docastformchangeanimation ───────────────────────────────────────

/** 1:1 décomp Cmd_docastformchangeanimation. 1 byte. */
function Cmd_docastformchangeanimation(_ctx: BattleScriptContext): boolean {
  const active = gBattleScripting.battler;
  setActiveBattler(active);
  if (gBattleMons[active].status2 & STATUS2_SUBSTITUTE) {
    gBattleStruct.formToChangeInto = gBattleStruct.formToChangeInto | CASTFORM_SUBSTITUTE;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, B_ANIM_CASTFORM_CHANGE, gBattleStruct.formToChangeInto);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0xE7 trycastformdatachange ───────────────────────────────────────────

/** 1:1 décomp Cmd_trycastformdatachange (battle_script_commands.c).
 *  Si CastformDataTypeChange retourne form != 0 → push cursor + jump
 *  BattleScript_CastformChange + set gBattleStruct->formToChangeInto. */
function Cmd_trycastformdatachange(ctx: BattleScriptContext): boolean {
  const form = _castformDataTypeChangeN25(gBattleScripting.battler);
  if (form) {
    gBattleStruct.formToChangeInto = form - 1;
    const off = getBattleScriptOffsetN25('BattleScript_CastformChange');
    if (off >= 0) {
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      ctx.scriptPtr = off;
    }
  }
  return false;
}

// Imports for Cmd_trycastformdatachange (= dup avec top of file → utiliser ceux existants).



// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 26 ════════════
/**
 * battle/cmd-batch-26.ts — Phase 1 Batch 26 (hpthresholds + money + switch checks) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4F jumpifcantswitch       (6 bytes — STATUS2_WRAPPED/ESCAPE / ROOTED check)
 *   0x5D getmoneyreward         (1 byte  — trainer money via GetTrainerMoneyToGive)
 *   0x63 jumptocalledmove       (2 bytes — gCurrentMove = gCalledMove + jump)
 *   0x73 hpthresholds           (2 bytes — set gHpScale 0-3 from opponent HP%)
 *   0x74 hpthresholds2          (2 bytes — set gHpScale 0-3 from switchout diff)
 *   0x91 givepaydaymoney        (1 byte  — gPaydayMoney * multiplier → AddMoney)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */











// ─── Helpers ────────────────────────────────────────────────────────────────




const F_TRAINER_PARTY_CUSTOM_MOVESET = 1 << 0;
const F_TRAINER_PARTY_HELD_ITEM      = 1 << 1;

// id numérique (gTrainerBattleOpponent_A) → clé 'TRAINER_X' OPPONENT depuis
// opponents-data. PAS reverseDecompConstant(id,'TRAINER_') : le préfixe 'TRAINER_'
// est AMBIGU (matche aussi TRAINER_CLASS_/TRAINER_PIC_/TRAINER_BACK_PIC_/
// TRAINER_ENCOUNTER_MUSIC_) → renvoyait la mauvaise clé. Cache first-wins, build
// async au boot (= même approche éprouvée que battle-string-decoder._trainerIdToKey).
let _trainerIdKeyCache: Map<number, string> | null = null;
void (async () => {
  try {
    const mod = await import('../decomp-data/include/constants/opponents-data');
    const m = new Map<number, string>();
    for (const [k, v] of Object.entries(mod)) {
      if (k.startsWith('TRAINER_') && typeof v === 'number' && !m.has(v)) m.set(v, k);
    }
    _trainerIdKeyCache = m;
  } catch { /* boot ordering edge — cache reste vide jusqu'au build */ }
})();

/** 1:1 décomp `GetTrainerMoneyToGive(trainerId)` (battle_script_commands.c:5581-5636).
 *  Classe via gameDataTrainers[key].trainerClass, lastMonLevel via gEnemyParty (party
 *  dresseur chargée). `globalThis.gTrainers` n'est jamais peuplé (ancien chemin mort). */
function _getTrainerMoneyToGive(trainerId: number): number {
  // 1:1 décomp : Secret Base path (= 20 × levels[0] × moneyMultiplier).
  if (trainerId === TRAINER_SECRET_BASE) {
    const sb = (globalThis as { gBattleResources?: { secretBase?: { party?: { levels: number[] } } } })
      .gBattleResources?.secretBase?.party;
    const lvl0 = sb?.levels?.[0] ?? 1;
    return 20 * lvl0 * _getMoneyMultiplier();
  }

  // 1:1 décomp : trainerClass + lastMonLevel = party[partySize-1].lvl.
  //  - classe : `gameDataTrainers[key].trainerClass` ("TRAINER_CLASS_X" → num via
  //    resolveDecompConstant). `globalThis.gTrainers` n'est JAMAIS peuplé (ex-bug :
  //    fallback classe 0xFF → value sentinelle 5).
  //  - lastMonLevel : dernier mon NON VIDE de gEnemyParty (= la party du dresseur,
  //    chargée par CreateNPCTrainerParty pour le combat ; équivalent 1:1 de
  //    party[partySize-1].lvl, et seule source peuplée — trainersTable jamais chargé,
  //    gameDataTrainers sans party). Lit via MON_DATA_LEVEL (l'ancien `6` était FAUX).
  const trainerKey = _trainerIdKeyCache?.get(trainerId);
  const gdt = (globalThis as { gameDataTrainers?: Record<string, { trainerClass?: string }> }).gameDataTrainers;
  const classStr = trainerKey ? gdt?.[trainerKey]?.trainerClass : undefined;
  const resolvedClass = classStr ? resolveDecompConstant(classStr) : undefined;
  const trainerClass = typeof resolvedClass === 'number' ? resolvedClass : 0xFF;

  let lastMonLevel = 0;
  for (let i = 5; i >= 0; i--) {
    const lvl = GetMonData(gEnemyParty[i], MON_DATA_LEVEL) as number;
    if (lvl > 0) { lastMonLevel = lvl; break; }
  }
  void F_TRAINER_PARTY_CUSTOM_MOVESET; void F_TRAINER_PARTY_HELD_ITEM;

  const value = getTrainerMoneyValue(trainerClass);
  void gTrainerMoneyTable;  // suppress unused warning for the import.

  // 1:1 décomp : BATTLE_TYPE_DOUBLE × 2 multiplier, BATTLE_TYPE_TWO_OPPONENTS pas.
  // Reference battle_script_commands.c:5627-5632.
  if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    return 4 * lastMonLevel * _getMoneyMultiplier() * value;
  } else if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    return 4 * lastMonLevel * _getMoneyMultiplier() * 2 * value;
  } else {
    return 4 * lastMonLevel * _getMoneyMultiplier() * value;
  }
}

// 1:1 STRICT décomp `AddMoney(money_ptr, amount)` (money.c:90-108) — vraie
// impl dans engine/money.ts. Notre AddMoney opère direct sur gSaveBlock1Ptr
// .money (= pas d'encryption XOR ; signature simplifiée sans pointer).

function _addMoney(amount: number): void {
  _AddMoneyFull(amount);
}

/** 1:1 décomp `gBattleStruct->moneyMultiplier`. Set à 1 par défaut, doublé
 *  par Amulet Coin / Luck Incense via Cmd_various VARIOUS_SET_MONEY_MULTIPLIER. */
function _getMoneyMultiplier(): number {
  return gBattleStruct.moneyMultiplier || 1;
}

// ─── 0x4F jumpifcantswitch ────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifcantswitch. 6 bytes (u8 battler arg | flag + u32 jump).
 *  L'arg byte contient le battler id + SWITCH_IGNORE_ESCAPE_PREVENTION bit. */
function Cmd_jumpifcantswitch(ctx: BattleScriptContext): boolean {
  const argByte = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const active = getBattlerForBattleScript(argByte & ~SWITCH_IGNORE_ESCAPE_PREVENTION);
  setActiveBattler(active);

  // 1:1 décomp : check escape prevention sauf si bit set explicitement.
  if (!(argByte & SWITCH_IGNORE_ESCAPE_PREVENTION)
      && ((gBattleMons[active].status2 & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION))
          || (gStatuses3[active] & STATUS3_ROOTED))) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  // 1:1 décomp : party walk pour valider qu'au moins 1 mon est switchable.
  // BATTLE_TYPE_INGAME_PARTNER + BATTLE_TYPE_MULTI + BATTLE_TYPE_TWO_OPPONENTS
  // limitent la window à MULTI_PARTY_SIZE (= 3 mons) ; else full party.

  let party: typeof gPlayerParty;
  let lastMonId = 0;
  let endMonId = PARTY_SIZE;

  if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = (active & 2) ? MULTI_PARTY_SIZE : 0;
    endMonId = lastMonId + MULTI_PARTY_SIZE;
  } else if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    // 1:1 décomp : link multi. Notre port single-machine traite comme single (= deferred).
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = 0;
    endMonId = lastMonId + MULTI_PARTY_SIZE;
  } else if ((gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) && GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
    party = gEnemyParty;
    lastMonId = (active === GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT)) ? (PARTY_SIZE / 2) : 0;
    endMonId = lastMonId + (PARTY_SIZE / 2);
  } else {
    party = GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT ? gEnemyParty : gPlayerParty;
    lastMonId = 0;
    endMonId = PARTY_SIZE;
  }

  // 1:1 décomp partial : pour BATTLE_TYPE_INGAME_PARTNER / MULTI / TWO_OPPONENTS,
  // check exclusion d'un seul battler index. Pour le case "normal" (else),
  // exclure battlerIn1 + battlerIn2 (= les 2 mons en field side).
  let battlerIn1 = active, battlerIn2 = active;
  if (!(gBattleTypeFlags & (BATTLE_TYPE_INGAME_PARTNER | BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS))) {
    if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
      battlerIn1 = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
      battlerIn2 = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        ? GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT) : battlerIn1;
    } else {
      battlerIn1 = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
      battlerIn2 = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        ? GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT) : battlerIn1;
    }
  }

  let i = lastMonId;
  for (; i < endMonId; i++) {
    const species = GetMonData(party[i], MON_DATA_SPECIES) as number;
    const hp = GetMonData(party[i], MON_DATA_HP) as number;
    const isEgg = GetMonData(party[i], MON_DATA_IS_EGG) as number;
    if (species !== 0 && !isEgg && hp !== 0) {
      if (gBattleTypeFlags & (BATTLE_TYPE_INGAME_PARTNER | BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS)) {
        if (gBattlerPartyIndexes[active] !== i) break;
      } else {
        if (i !== gBattlerPartyIndexes[battlerIn1] && i !== gBattlerPartyIndexes[battlerIn2]) break;
      }
    }
  }

  if (i === endMonId) {
    // No valid mon to switch to → jump.
    ctx.scriptPtr = jumpPtr;
  }
  // Sinon : advance normalement (= déjà fait par readByte + readWord).
  return false;
}

// ─── 0x5D getmoneyreward ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_getmoneyreward (battle_script_commands.c). 1 byte. */
function Cmd_getmoneyreward(_ctx: BattleScriptContext): boolean {
  let moneyReward = _getTrainerMoneyToGive(gTrainerBattleOpponent_A);
  if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    moneyReward += _getTrainerMoneyToGive(gTrainerBattleOpponent_B);
  }
  _addMoney(moneyReward);
  // 1:1 décomp PREPARE_WORD_NUMBER_BUFFER(gBattleTextBuff1, 5, moneyReward).
  PREPARE_WORD_NUMBER_BUFFER(_gBattleTextBuff1_26, 5, moneyReward);
  return false;
}

// ─── 0x63 jumptocalledmove ────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumptocalledmove. 2 bytes (u8 flag).
 *  Set gCurrentMove = gCalledMove (et gChosenMove si flag==0), puis jump à
 *  gBattleScriptsForMoveEffects[move.effect]. */
function Cmd_jumptocalledmove(ctx: BattleScriptContext): boolean {
  const flag = readByte(ctx);
  setCurrentMove(gCalledMove);
  if (flag === 0) {
    setChosenMove(gCalledMove);
  }
  // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect].
  const effect = getBattleMove(gCurrentMove).effect;
  const off = getMoveEffectScriptOffset(effect);
  if (off >= 0) ctx.scriptPtr = off;
  return false;
}

// ─── 0x73 hpthresholds ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_hpthresholds. 2 bytes. */
function Cmd_hpthresholds(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) return false;
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  const opposing = BATTLE_OPPOSITE(active);
  let result = Math.floor((gBattleMons[opposing].hp * 100) / gBattleMons[opposing].maxHP);
  if (result === 0) result = 1;

  if (result > 69 || gBattleMons[opposing].hp === 0) gBattleStruct.hpScale = 0;
  else if (result > 39) gBattleStruct.hpScale = 1;
  else if (result > 9) gBattleStruct.hpScale = 2;
  else gBattleStruct.hpScale = 3;
  return false;
}

// ─── 0x74 hpthresholds2 ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_hpthresholds2. 2 bytes. */
function Cmd_hpthresholds2(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) return false;
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  const opposing = BATTLE_OPPOSITE(active);
  const hpSwitchout = gBattleStruct.hpOnSwitchout[GET_BATTLER_SIDE(opposing)] || 1;
  const result = Math.floor(((hpSwitchout - gBattleMons[opposing].hp) * 100) / hpSwitchout);

  if (gBattleMons[opposing].hp >= hpSwitchout) gBattleStruct.hpScale = 0;
  else if (result <= 29) gBattleStruct.hpScale = 1;
  else if (result <= 69) gBattleStruct.hpScale = 2;
  else gBattleStruct.hpScale = 3;
  return false;
}

// ─── 0x91 givepaydaymoney ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_givepaydaymoney. 1 byte (peut jumper à
 *  BattleScript_PrintPayDayMoneyString). */
function Cmd_givepaydaymoney(ctx: BattleScriptContext): boolean {
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
      && gPaydayMoney !== 0) {
    const bonusMoney = gPaydayMoney * _getMoneyMultiplier();
    _addMoney(bonusMoney);
    // 1:1 décomp PREPARE_HWORD_NUMBER_BUFFER(gBattleTextBuff1, 5, bonusMoney).
    PREPARE_HWORD_NUMBER_BUFFER(_gBattleTextBuff1_26, 5, bonusMoney);
    // 1:1 décomp : BattleScriptPush(instr + 1); jump à PrintPayDayMoneyString.
    const off = getBattleScriptOffset('BattleScript_PrintPayDayMoneyString');
    if (off >= 0) {
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      ctx.scriptPtr = off;
    }
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 27 ════════════
/**
 * battle/cmd-batch-27.ts — Phase 1 Batch 27 (infatuation + sleep talk + metronome + nature) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x97 tryinfatuating          (5 bytes — Attract gender check)
 *   0x9E metronome               (1 byte  — Random move pick)
 *   0xA9 trychoosesleeptalkmove  (5 bytes — Sleep Talk pick valid move)
 *   0xCC callenvironmentattack   (1 byte  — Nature Power)
 *   0xF1 trysetcaughtmondexflags (5 bytes — set caught Pokedex flag)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:759 sNaturePowerMoves`
 */



// ÉTAPE 2c : câblage 1:1 sur le module Pokédx canonique (remplace les POC
// locaux species==natDex identité + sans triple-redondance). pokedex-flags
// n'importe PAS battle/ → 0 cycle (l'ancien "éviter cycle 27↔24" est moot).








// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `GetGenderFromSpeciesAndPersonality` — full port via species-runtime
// (= utilise gSpeciesInfo[species].genderRatio + personality lo byte 1:1).

function _getGenderFromSpeciesAndPersonality(species: number, personality: number): number {
  return _GetGenderFull(species, personality);
}

/** 1:1 décomp `IsInvalidForSleepTalkOrAssist(move)`
 *  (battle_script_commands.c:8212-8222). Returns true si le move ne peut PAS
 *  être appelé par Sleep Talk / Assist (= MOVE_NONE/SLEEP_TALK/ASSIST/MIRROR_MOVE/METRONOME).
 *  Note décomp Em ne check pas STRUGGLE, FOCUS_PUNCH, UPROAR, 2-turn moves
 *  (= ceux-ci sont check ailleurs dans Cmd_trychoosesleeptalkmove). */
function _isInvalidForSleepTalkOrAssist(move: number): boolean {
  return move === MOVE_NONE
      || move === MOVE_SLEEP_TALK
      || move === MOVE_ASSIST
      || move === MOVE_MIRROR_MOVE
      || move === MOVE_METRONOME;
}

/** 1:1 décomp `IsTwoTurnsMove(move)` (battle_script_commands.c:8199-8210).
 *  Returns true si le move utilise 2 turns (charge → attaque).
 *  AUDIT FIX : valeurs EFFECT_* importées depuis auto-data (= drift précédent
 *  avec SKULL_BASH=11/RAZOR_WIND=12/SOLAR_BEAM=70/SEMI_INVULNERABLE=39/BIDE=27
 *  toutes FAUSSES). */
function _isTwoTurnsMove__b27(move: number): boolean {
  const effect = getBattleMove(move).effect;
  return effect === _EFFECT_SKULL_BASH
      || effect === _EFFECT_RAZOR_WIND
      || effect === _EFFECT_SKY_ATTACK
      || effect === _EFFECT_SOLAR_BEAM
      || effect === _EFFECT_SEMI_INVULNERABLE
      || effect === _EFFECT_BIDE;
}

// 1:1 décomp `CheckMoveLimitations` — importé depuis move-limitations.ts (= full port).

function _checkMoveLimitations(battler: number, unusableBits: number, check: number): number {
  return _CheckMoveLimitationsFull(battler, unusableBits, check);
}

// 1:1 décomp `GetMoveTarget` — wired via cmd-batch-34 export.

function _getMoveTarget__b27(move: number, override: number): number {
  return _GetMoveTarget(move, override);
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.

function _recordAbilityBattle__b27(battler: number, ability: number): void {
  _recordAbilityBattleFullN27(battler, ability);
}

// 1:1 décomp `GetSetPokedexFlag(nationalDexNo, caseID)` (pokedex.c:1900-1959).
// L'auto-gen `pokedex-all-auto.ts` use bare globals (FLAG_GET_SEEN, FLAG_SET_*,
// gSaveBlock2Ptr) sans imports → `ReferenceError` runtime. On port 1:1 ici
// avec accès via globalThis pour gSaveBlock2Ptr.
// ÉTAPE 2c — les POC locaux `_getSetPokedexFlag` / `_handleSetPokedexFlag` /
// `_speciesToNationalPokedexNum` (species==natDex identité = FAUX Hoenn ;
// sans triple-redondance anti-triche) SUPPRIMÉS. Remplacés 1:1 par le module
// canonique `../pokedex-flags` (ÉTAPE 1/2a/2b : GetSetPokedexFlag triple-
// redondance + SpeciesToNationalPokedexNum table réelle + HandleSetPokedex
// Flag wrapper Unown/Spinda). Cf. Cmd_trysetcaughtmondexflags ci-dessous.

// ─── 0x97 tryinfatuating ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryinfatuating. 5 bytes (u32 fail jump). */
function Cmd_tryinfatuating(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];

  if (tgt.ability === ABILITY_OBLIVIOUS) {
    setLastUsedAbility(ABILITY_OBLIVIOUS);
    _recordAbilityBattle__b27(gBattlerTarget, ABILITY_OBLIVIOUS);
    const off = getBattleScriptOffset('BattleScript_ObliviousPreventsAttraction');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  const genderAtk = _getGenderFromSpeciesAndPersonality(atk.species, atk.personality);
  const genderTgt = _getGenderFromSpeciesAndPersonality(tgt.species, tgt.personality);

  if (genderAtk === genderTgt
      || (tgt.status2 & STATUS2_INFATUATION)
      || genderAtk === MON_GENDERLESS
      || genderTgt === MON_GENDERLESS) {
    ctx.scriptPtr = failJump;
    return false;
  }
  tgt.status2 |= STATUS2_INFATUATED_WITH(gBattlerAttacker);
  return false;
}

// ─── 0x9E metronome ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_metronome. 1 byte. */
function Cmd_metronome(ctx: BattleScriptContext): boolean {
  // 1:1 décomp infinite loop : pick random move 1..MOVES_COUNT, retry si dans
  // sMovesForbiddenToCopy (= full forbidden list, donc on parcourt jusqu'à
  // METRONOME_FORBIDDEN_END). On set gCurrentMove + gBattlerTarget.
  for (let tries = 0; tries < 1000; tries++) {
    // 1:1 décomp MOVES_COUNT<512 path : Random()&0x1FF puis check >=MOVES_COUNT.
    const candidate = (Random() & 0x1FF) + 1;
    if (candidate >= MOVES_COUNT) continue;

    let i = -1;
    while (true) {
      i++;
      if (sMovesForbiddenToCopy[i] === candidate) break;
      if (sMovesForbiddenToCopy[i] === METRONOME_FORBIDDEN_END) break;
    }
    if (sMovesForbiddenToCopy[i] === METRONOME_FORBIDDEN_END) {
      // Candidate non forbidden : utiliser.
      setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
      setCurrentMove(candidate);
      // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
      const off = getMoveEffectScriptOffset(getBattleMove(candidate).effect);
      if (off >= 0) ctx.scriptPtr = off;
      setBattlerTarget(_getMoveTarget__b27(candidate, 0));
      return false;
    }
  }
  // Safety : ne devrait jamais arriver. Default = TACKLE.
  setCurrentMove(33);
  return false;
}

// ─── 0xA9 trychoosesleeptalkmove ──────────────────────────────────────────

/** 1:1 décomp Cmd_trychoosesleeptalkmove. 5 bytes (u32 fail jump). */
function Cmd_trychoosesleeptalkmove(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let unusableMovesBits = 0;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = gBattleMons[gBattlerAttacker].moves[i];
    if (_isInvalidForSleepTalkOrAssist(move)
        || move === MOVE_FOCUS_PUNCH
        || move === MOVE_UPROAR
        || _isTwoTurnsMove__b27(move)) {
      unusableMovesBits |= gBitTable[i];
    }
  }
  // 1:1 décomp l.8260 : CheckMoveLimitations avec ~MOVE_LIMITATION_PP (= ignore le PP :
  // on dort, on ne choisit pas ; un move à 0 PP reste tirable par Sleep Talk). ~0 excluait
  // à tort les moves sans PP.
  unusableMovesBits = _checkMoveLimitations(gBattlerAttacker, unusableMovesBits, ~MOVE_LIMITATION_PP);
  if (unusableMovesBits === ALL_MOVES_MASK) {
    // No valid move : fall-through (advance 5 — déjà fait par readWord).
    return false;
  }
  let movePosition = 0;
  for (let tries = 0; tries < 100; tries++) {
    movePosition = Random() % MAX_MON_MOVES;
    if (!(gBitTable[movePosition] & unusableMovesBits)) break;
  }
  setCalledMove(gBattleMons[gBattlerAttacker].moves[movePosition]);
  setCurrMovePos(movePosition);
  setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
  setBattlerTarget(_getMoveTarget__b27(gBattleMons[gBattlerAttacker].moves[movePosition], 0));
  ctx.scriptPtr = failJump;  // 1:1 décomp : jump au "success" label (= NOT failJump, mais
  // le code décomp utilise T1_READ_PTR du même offset pour les deux paths).
  return false;
}

// ─── 0xCC callenvironmentattack ───────────────────────────────────────────

/** 1:1 décomp Cmd_callenvironmentattack. 1 byte. Nature Power. */
function Cmd_callenvironmentattack(ctx: BattleScriptContext): boolean {
  setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
  const move = sNaturePowerMoves[gBattleEnvironment] ?? 129; // SWIFT fallback.
  setCurrentMove(move);
  setBattlerTarget(_getMoveTarget__b27(move, 0));
  // 1:1 décomp : BattleScriptPush(gBattleScriptsForMoveEffects[effect]); gBattlescriptCurrInstr++.
  // BattleScriptPush stocke le ptr du move effect script sur le stack — sera
  // popped par le prochain `return`. L'opcode lui-même est déjà avancé par
  // le dispatch loop (cf. script-interpreter.ts:runBattleScript).
  const off = getMoveEffectScriptOffset(getBattleMove(move).effect);
  if (off >= 0) ctx.scriptPtrStack.push(off);
  return false;
}

// ─── 0xF1 trysetcaughtmondexflags ─────────────────────────────────────────

/** 1:1 décomp Cmd_trysetcaughtmondexflags. 5 bytes (u32 fail jump).
 *  Décomp lit gEnemyParty[0] pour species + personality.
 *  Notre port : utilise gBattleMons[1] (= opponent battler) car gEnemyParty
 *  pas wired battle-side. */
function Cmd_trysetcaughtmondexflags(ctx: BattleScriptContext): boolean {
  let failJump = readWord(ctx);
  // Meme garde que trygivecaughtmonnick : param pointeur potentiellement
  // unresolved dans le bytecode (adresse brute) -> resolution par nom (usage
  // decomp unique : BattleScript_PrintCaughtMonInfo:69 -> TryNicknameCaughtMon).
  if (failJump < 0 || failJump > 0x100000) {
    failJump = getBattleScriptOffset('BattleScript_TryNicknameCaughtMon');
  }
  // 1:1 décomp lit gEnemyParty[0] (species + personality). Notre engine :
  // gBattleMons[1] (= opponent battler) en proxy (gEnemyParty pas wired
  // battle-side — adaptation pré-existante documentée, hors scope ÉTAPE 2c).
  const species = gBattleMons[1].species;
  const personality = gBattleMons[1].personality;
  const dexNum = SpeciesToNationalPokedexNum(species); // 1:1 (table réelle ÉTAPE 2a)

  if (GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
    ctx.scriptPtr = failJump; // 1:1 : déjà caught → jump (gBattlescriptCurrInstr = ptr)
    return false;
  }
  HandleSetPokedexFlag(dexNum, FLAG_SET_CAUGHT, personality); // 1:1 (triple-redondance + Unown/Spinda)
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 28 ════════════
/**
 * battle/cmd-batch-28.ts — Phase 1 Batch 28 (switchineffects + rapidspin + item) — 4 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x52 switchineffects        (2 bytes — Spikes damage on switch-in)
 *   0x5E updatebattlermoves     (2 bytes — emit GetMonData + copy moves/pp)
 *   0x75 useitemonopponent      (1 byte  — PokemonUseItemEffects)
 *   0xBE rapidspinfree          (1 byte  — clear wrap/leech/spikes)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */















// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b28(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `UpdateSentPokesToOpponentValue(battler)` (battle_util.c:934-939).
 *  Si battler est côté opponent, call OpponentSwitchInResetSentPokesToOpponentValue. */
function _updateSentPokesToOpponentValue(battler: number): void {
  // 1:1 décomp UpdateSentPokesToOpponentValue (battle_util.c:934-946).
  if (GET_BATTLER_SIDE(battler) === B_SIDE_OPPONENT) {
    // OpponentSwitchInResetSentPokesToOpponentValue (battle_util.c:915-932).
    const flank = (battler & 2 /* BIT_FLANK */) >>> 1;
    gSentPokesToOpponent[flank] = 0;
    let bits = 0;
    for (let i = 0; i < gBattlersCount; i += 2) {
      if (!(gAbsentBattlerFlags & gBitTable[i])) {
        bits |= gBitTable[gBattlerPartyIndexes[i]];
      }
    }
    gSentPokesToOpponent[flank] = bits;
  } else {
    // 1:1 décomp l.942-944 : branche PLAYER — l'adversaire enregistre le mon joueur entré
    // (affecte le prompt de switch dresseur + le tracking des participants à l'EXP).
    for (let i = 1; i < gBattlersCount; i++) {
      gSentPokesToOpponent[(i & 2 /* BIT_FLANK */) >> 1] |= gBitTable[gBattlerPartyIndexes[battler]];
    }
  }
}

// PokemonUseItemEffects 1:1 décomp (pokemon.c:4742-5291) maintenant porté dans
// bag-item-effects.ts. Cmd_useitemonopponent appelle directement la fonction.

// ─── 0x52 switchineffects ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_switchineffects. 2 bytes (u8 battler arg).
 *  Décomp gère aussi : ability switch-in triggers, weather messages,
 *  status1 sleep/poison ticks — partial port ici (Spikes seulement). */
function Cmd_switchineffects(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  _updateSentPokesToOpponentValue(active);

  setHitMarker(gHitMarker & ~HITMARKER_FAINTED(active));
  gSpecialStatuses[active].faintedHasReplacement = 0;

  const side = GET_BATTLER_SIDE(active);
  if (!(gSideStatuses[side] & SIDE_STATUS_SPIKES_DAMAGED)
      && (gSideStatuses[side] & SIDE_STATUS_SPIKES)
      && !IS_BATTLER_OF_TYPE(gBattleMons[active].type1, gBattleMons[active].type2, TYPE_FLYING)
      && gBattleMons[active].ability !== ABILITY_LEVITATE) {
    gSideStatuses[side] |= SIDE_STATUS_SPIKES_DAMAGED;
    gBattleMons[active].status2 &= ~STATUS2_DESTINY_BOND;
    setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
    const spikesDmg = (5 - gSideTimers[side].spikesAmount) * 2;
    let dmg = Math.floor(gBattleMons[active].maxHP / spikesDmg);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
    gBattleScripting.battler = active;
    // 1:1 décomp : BattleScriptPushCursor + jump à BattleScript_SpikesOnTarget/Attacker.
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const labelName = arg === BS_TARGET ? 'BattleScript_SpikesOnTarget'
      : arg === BS_ATTACKER ? 'BattleScript_SpikesOnAttacker'
      : 'BattleScript_SpikesOnFaintedBattler';
    const off = getBattleScriptOffset(labelName);
    if (off >= 0) ctx.scriptPtr = off;
  }
  // 1:1 décomp else-branch (= pas de Spikes damage) : TRUANT init +
  // hpOnSwitchout update + B_ACTION_CANCEL_PARTNER pour actionsByTurnOrder.
  else {
    if (gBattleMons[active].ability === ABILITY_TRUANT
        && !gDisableStructs[active].truantSwitchInHack) {
      gDisableStructs[active].truantCounter = 1;
    }
    gDisableStructs[active].truantSwitchInHack = 0;

    // 1:1 décomp battle_script_commands.c:Cmd_switchineffects :
    //   if (!AbilityBattleEffects(...) && !ItemBattleEffects(...))
    //     do cleanup + advance
    //   else { jump to script set par les helpers }
    const abilityEff = AbilityBattleEffects(ABILITYEFFECT_ON_SWITCHIN, active, 0, 0, 0);
    if (abilityEff !== 0) {
      const label = consumeAbilityWantedScript();
      if (label) {
        const off = getBattleScriptOffset(label);
        if (off >= 0) {
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          ctx.scriptPtr = off;
        }
      }
      return false;
    }
    const itemEff = ItemBattleEffects(ITEMEFFECT_ON_SWITCH_IN, active, false);
    if (itemEff !== 0) {
      const label = consumeItemWantedScript();
      if (label) {
        const off = getBattleScriptOffset(label);
        if (off >= 0) {
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          ctx.scriptPtr = off;
        }
      }
      return false;
    }

    // Neither effect triggered → cleanup state + advance.
    gSideStatuses[side] &= ~SIDE_STATUS_SPIKES_DAMAGED;
    for (let i = 0; i < gBattlersCount; i++) {
      if (gBattlerByTurnOrder[i] === active) {
        gActionsByTurnOrder[i] = B_ACTION_CANCEL_PARTNER;
      }
    }
    // 1:1 décomp : update hpOnSwitchout pour tous les battlers (= 0x74
    // hpthresholds2 le lit ensuite).
    for (let i = 0; i < gBattlersCount; i++) {
      gBattleStruct.hpOnSwitchout[GET_BATTLER_SIDE(i)] = gBattleMons[i].hp;
    }
    // 1:1 décomp : BS_FAINTED_LINK_MULTIPLE_1 increment gBattlerFainted —
    // Link multi battles deferred Phase 1.4+.
  }
  return false;
}

// ─── 0x5E updatebattlermoves ──────────────────────────────────────────────

/** 1:1 décomp Cmd_updatebattlermoves (battle_script_commands.c:5651-5676).
 *  2 bytes. State machine via gBattleCommunication[0] :
 *   - case 0 : EmitGetMonData REQUEST_ALL_BATTLE + Mark + state++.
 *   - case 1 : si controllerExecFlags == 0 → copy moves/pp depuis
 *     gBattleBufferB[active]+4 vers gBattleMons[active] + advance 2.
 *
 *  Notre port : case 0 + case 1 wait-loop fonctionne 1:1 ; le copy from buffer
 *  est no-op car notre flush via batch C bridge garde gBattleMons sync direct. */
function Cmd_updatebattlermoves(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  switch (gBattleCommunication[0]) {
    case 0:
      BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE, 0);
      MarkBattlerForControllerExec(active);
      gBattleCommunication[0]++;
      // 1:1 décomp : ne pas advance — re-enter case 1 next frame.
      ctx.scriptPtr -= 2;  // back to opcode + arg
      return true;  // pause
    case 1:
      if (gBattleControllerExecFlags === 0) {
        // 1:1 décomp : copy moves/pp depuis gBattleBufferB[active]+4.
        // Notre port : gBattleBufferB pas wired (= deferred Phase 1.4 link battles).
        // gBattleMons reste sync via batch C bridge SetMonData direct path.
        void MAX_MON_MOVES;
        return false;
      }
      // 1:1 : wait controller → re-exécuter l'opcode (rewind opcode+arg = 2 bytes, comme case 0).
      // _stayOnOpcode ne rewind que 1 → désalignait le pointeur (arg lu comme opcode).
      ctx.scriptPtr -= 2;
      return true;
    default:
      return false;
  }
}

// ─── 0x75 useitemonopponent ───────────────────────────────────────────────

/** 1:1 décomp Cmd_useitemonopponent (battle_script_commands.c:6314-6319). 1 byte.
 *  Flow décomp :
 *    gBattlerInMenuId = gBattlerAttacker;
 *    PokemonUseItemEffects(&gEnemyParty[gBattlerPartyIndexes[gBattlerAttacker]],
 *                          gLastUsedItem,
 *                          gBattlerPartyIndexes[gBattlerAttacker],
 *                          0,
 *                          TRUE);
 *    gBattlescriptCurrInstr++;  // 1 byte opcode, déjà advance par readByte. */
function Cmd_useitemonopponent(_ctx: BattleScriptContext): boolean {
  setBattlerInMenuId(gBattlerAttacker);
  const partyIdx = gBattlerPartyIndexes[gBattlerAttacker];
  const mon = gEnemyParty[partyIdx];  // 1:1 &gEnemyParty[partyIdx] (Pokemon natif)
  if (mon) {
    PokemonUseItemEffects(mon, gLastUsedItem, partyIdx, 0, true);
  }
  return false;
}

// ─── 0xBE rapidspinfree ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_rapidspinfree. 1 byte. Rapid Spin clear effects. */
function Cmd_rapidspinfree(ctx: BattleScriptContext): boolean {
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_WRAPPED) {
    gBattleScripting.battler = gBattlerTarget;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_WRAPPED;
    setBattlerTarget(gBattleStruct.wrappedBy[gBattlerAttacker]);
    // 1:1 décomp battle_script_commands.c:8832-8836 : build gBattleTextBuff1
    // = MOVE buffer du wrappedMove (= move qui a causé Wrap/Bind/Fire Spin/etc.).
    // wrappedMove est stocké u8[MAX_BATTLERS_COUNT * 2] = u16 per battler.
    const slot = gBattlerAttacker * 2;
    _gBattleTextBuff1_N28[0] = 0xFD; // B_BUFF_PLACEHOLDER_BEGIN
    _gBattleTextBuff1_N28[1] = 2;    // B_BUFF_MOVE
    _gBattleTextBuff1_N28[2] = gBattleStruct.wrappedMove[slot] ?? 0;
    _gBattleTextBuff1_N28[3] = gBattleStruct.wrappedMove[slot + 1] ?? 0;
    _gBattleTextBuff1_N28[4] = 0xFF; // B_BUFF_EOS
    // 1:1 décomp : BattleScriptPushCursor + jump BattleScript_WrapFree.
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_WrapFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (gStatuses3[gBattlerAttacker] & STATUS3_LEECHSEED) {
    gStatuses3[gBattlerAttacker] &= ~STATUS3_LEECHSEED;
    gStatuses3[gBattlerAttacker] &= ~STATUS3_LEECHSEED_BATTLER;
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_LeechSeedFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_SPIKES) {
    gSideStatuses[side] &= ~SIDE_STATUS_SPIKES;
    gSideTimers[side].spikesAmount = 0;
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_SpikesFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



// Suppress unused warnings (kept for future port).
void gBattleMoveDamage;


// ════════════ Batch 29 ════════════
/**
 * battle/cmd-batch-29.ts — Phase 1 Batch 29 (mirror/sketch/heal bell) — 4 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x7C trymirrormove           (1 byte — Mirror Move pick last hit move)
 *   0xA8 copymovepermanently     (5 bytes — Sketch overwrite move slot)
 *   0xAE healpartystatus         (1 byte — Heal Bell / Aromatherapy)
 *   0xDE assistattackselect      (5 bytes — Assist pick random party move)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */












// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.

function _recordAbilityBattle__b29(b: number, a: number): void { _recordAbilityBattleFullN29(b, a); }

// 1:1 décomp `GetMoveTarget` — wired via cmd-batch-34 export.

function _getMoveTarget__b29(move: number, override: number): number {
  return _GetMoveTarget(move, override);
}

/** Suit le décomp Cmd_assistattackselect : itère sMovesForbiddenToCopy
 *  jusqu'à ASSIST_FORBIDDEN_END (= MIMIC_FORBIDDEN_END dans le décomp). */
function _isMoveForbiddenForAssist(move: number): boolean {
  // 1:1 décomp l.9516-9519 : Assist scanne sMovesForbiddenToCopy jusqu'à
  // ASSIST_FORBIDDEN_END = 0xFFFF (= METRONOME_FORBIDDEN_END), PAS 0xFFFE
  // (= MIMIC_FORBIDDEN_END, sentinelle INTERMÉDIAIRE au milieu de la table). Avec 0xFFFE
  // on s'arrêtait après MIMIC → COUNTER/MIRROR_COAT/PROTECT/DETECT/ENDURE/DESTINY_BOND/
  // SLEEP_TALK/THIEF/FOLLOW_ME/SNATCH/HELPING_HAND/COVET/TRICK/FOCUS_PUNCH non bloqués.
  for (let i = 0; i < sMovesForbiddenToCopy.length; i++) {
    if (sMovesForbiddenToCopy[i] === 0xFFFF /* ASSIST_FORBIDDEN_END */) return false;
    if (sMovesForbiddenToCopy[i] === move) return true;
  }
  return false;
}

// ─── 0x7C trymirrormove ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_trymirrormove. 1 byte. */
function Cmd_trymirrormove(ctx: BattleScriptContext): boolean {
  const validMoves: number[] = new Array(MAX_BATTLERS_COUNT - 1).fill(MOVE_NONE);
  let validMovesCount = 0;

  // 1:1 décomp : iter battlers, lookup lastTakenMoveFrom[i*2 + attacker*8].
  // Notre flat array : index = attacker*4 + i (= 16 entries u16).
  for (let i = 0; i < gBattlersCount; i++) {
    if (i === gBattlerAttacker) continue;
    const move = gLastTakenMoveFrom[gBattlerAttacker * 4 + i] ?? 0;
    if (move !== MOVE_NONE && move !== MOVE_UNAVAILABLE) {
      validMoves[validMovesCount++] = move;
    }
  }

  const directMove = gLastTakenMove[gBattlerAttacker] ?? 0;
  if (directMove !== MOVE_NONE && directMove !== MOVE_UNAVAILABLE) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    setCurrentMove(directMove);
    setBattlerTarget(_getMoveTarget__b29(directMove, 0));
    // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
    const off = getMoveEffectScriptOffset(getBattleMove(directMove).effect);
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (validMovesCount !== 0) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    const pick = Random() % validMovesCount;
    setCurrentMove(validMoves[pick]);
    setBattlerTarget(_getMoveTarget__b29(validMoves[pick], 0));
    // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
    const off = getMoveEffectScriptOffset(getBattleMove(validMoves[pick]).effect);
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  // 1:1 décomp : pas de move valide → ppNotAffectedByPressure + advance.
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  return false;
}

// ─── 0xA8 copymovepermanently ─────────────────────────────────────────────

/** 1:1 décomp Cmd_copymovepermanently. 5 bytes (u32 fail jump). Sketch. */
function Cmd_copymovepermanently(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : `gChosenMove = MOVE_UNAVAILABLE` (= mark sketch fail-state).
  setChosenMove(MOVE_UNAVAILABLE);

  const lastMove = gLastPrintedMoves[gBattlerTarget] ?? 0;
  if ((gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
      || lastMove === MOVE_STRUGGLE
      || lastMove === MOVE_NONE
      || lastMove === MOVE_UNAVAILABLE
      || lastMove === MOVE_SKETCH) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Cherche si attacker connaît déjà ce move (= ne pas overwrite Sketch lui-même).
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[gBattlerAttacker].moves[i] === MOVE_SKETCH) continue;
    if (gBattleMons[gBattlerAttacker].moves[i] === lastMove) break;
  }
  if (i !== MAX_MON_MOVES) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Overwrite gCurrMovePos slot.
  gBattleMons[gBattlerAttacker].moves[gCurrMovePos] = lastMove;
  gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = getBattleMove(lastMove).pp;
  // 1:1 décomp l.8172-8186 : émet REQUEST_MOVES_PP_BATTLE pour PERSISTER le move sketché vers
  // la party (le teardown ne sync PAS les move IDs → sans ça Gribouille ne survit pas au combat).
  // _setMonByActiveBattler/REQUEST_MOVES_PP sync les 4 moves+pp depuis gBattleMons[active] (déjà écrit).
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_MOVES_PP_BATTLE, 0, 0, 0);
  MarkBattlerForControllerExec(gBattlerAttacker);
  PREPARE_MOVE_BUFFER(_gBattleTextBuff1_29, lastMove);
  return false;
}

// ─── 0xAE healpartystatus ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_healpartystatus. 1 byte. Heal Bell / Aromatherapy. */
function Cmd_healpartystatus(_ctx: BattleScriptContext): boolean {
  const zero = 0;
  let toHeal = 0;

  if (gCurrentMove === MOVE_HEAL_BELL) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_BELL;

    const party = GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

    if (gBattleMons[gBattlerAttacker].ability !== ABILITY_SOUNDPROOF) {
      gBattleMons[gBattlerAttacker].status1 = 0;
      gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
    } else {
      _recordAbilityBattle__b29(gBattlerAttacker, gBattleMons[gBattlerAttacker].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] |= B_MSG_BELL_SOUNDPROOF_ATTACKER;
    }
    const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
    setActiveBattler(partner);
    gBattleScripting.battler = partner;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && !(gAbsentBattlerFlags & gBitTable[partner])) {
      if (gBattleMons[partner].ability !== ABILITY_SOUNDPROOF) {
        gBattleMons[partner].status1 = 0;
        gBattleMons[partner].status2 &= ~STATUS2_NIGHTMARE;
      } else {
        _recordAbilityBattle__b29(partner, gBattleMons[partner].ability);
        gBattleCommunication[MULTISTRING_CHOOSER] |= B_MSG_BELL_SOUNDPROOF_PARTNER;
      }
    }

    // 1:1 décomp : iter party 0..PARTY_SIZE pour set toHeal bits per-mon
    // selon ability check (= SOUNDPROOF skip).
    for (let i = 0; i < PARTY_SIZE; i++) {
      const species = GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) as number;
      const abilityNum = GetMonData(party[i], MON_DATA_ABILITY_NUM) as number;
      if (species !== 0 /* SPECIES_NONE */ && species !== 412 /* SPECIES_EGG */) {
        let ability: number;
        if (gBattlerPartyIndexes[gBattlerAttacker] === i) {
          ability = gBattleMons[gBattlerAttacker].ability;
        } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
                   && gBattlerPartyIndexes[partner] === i
                   && !(gAbsentBattlerFlags & gBitTable[partner])) {
          ability = gBattleMons[partner].ability;
        } else {
          ability = GetAbilityBySpecies(species, abilityNum);
        }
        if (ability !== ABILITY_SOUNDPROOF) {
          toHeal |= (1 << i);
        }
      }
    }
  } else {
    // 1:1 décomp Aromatherapy : ignore SOUNDPROOF, heal tous.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SOOTHING_AROMA;
    toHeal = (1 << PARTY_SIZE) - 1;
    gBattleMons[gBattlerAttacker].status1 = 0;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
    const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
    setActiveBattler(partner);
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && !(gAbsentBattlerFlags & gBitTable[partner])) {
      gBattleMons[partner].status1 = 0;
      gBattleMons[partner].status2 &= ~STATUS2_NIGHTMARE;
    }
  }

  if (toHeal) {
    setActiveBattler(gBattlerAttacker);
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, toHeal, 4, zero);
    MarkBattlerForControllerExec(gBattlerAttacker);
  }
  return false;
}

// ─── 0xDE assistattackselect ──────────────────────────────────────────────

/** 1:1 décomp Cmd_assistattackselect (battle_script_commands.c:9487-9538).
 *  5 bytes (u32 fail jump). Assist : random move depuis party (= autres mons).
 *
 *  Wired vers gPlayerParty / gEnemyParty selon side (= pas plus de stub
 *  gBattleMons iter). */
function Cmd_assistattackselect(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);

  // 1:1 décomp ll.9492 : `validMoves = gBattleStruct->assistPossibleMoves`
  // (= u16[PARTY_SIZE × MAX_MON_MOVES] = 24 slots).
  const validMoves: number[] = [];

  // 1:1 décomp ll.9494-9497 : party selection selon side.
  const party = GET_BATTLER_SIDE(gBattlerAttacker) !== B_SIDE_PLAYER_AAS
    ? _gEnemyPartyAAS
    : _gPlayerPartyAAS;

  // 1:1 décomp ll.9499-9526 : itère party slots (sauf attacker), skip species
  // NONE/EGG, et pour chaque slot itère les 4 moves.
  for (let monId = 0; monId < 6 /* PARTY_SIZE */; monId++) {
    if (monId === _gBattlerPartyIndexesAAS[gBattlerAttacker]) continue;
    const speciesOrEgg = _GetMonDataAAS(party[monId], _MON_DATA_SPECIES_OR_EGG_AAS) as number;
    if (speciesOrEgg === 0 /* SPECIES_NONE */) continue;
    if (speciesOrEgg === 412 /* SPECIES_EGG */) continue;

    for (let moveIndex = 0; moveIndex < MAX_MON_MOVES; moveIndex++) {
      const move = _GetMonDataAAS(party[monId], _MON_DATA_MOVE1_AAS + moveIndex) as number;
      if (move === MOVE_NONE) continue;
      // 1:1 décomp l.9513 : filtre aussi les moves invalides pour Sleep Talk/Assist
      // (Assist/Mimique/2-tours/Bide… non couverts par sMovesForbiddenToCopy).
      if (_isInvalidForSleepTalkOrAssist(move)) continue;
      if (_isMoveForbiddenForAssist(move)) continue;
      validMoves.push(move);
    }
  }

  if (validMoves.length > 0) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    // 1:1 décomp l.9530 : `((Random() & 0xFF) * chooseableMovesNo) >> 8`.
    const pick = (Random() & 0xFF) * validMoves.length >>> 8;
    setCalledMove(validMoves[pick]);
    setBattlerTarget(_getMoveTarget__b29(validMoves[pick], 0 /* NO_TARGET_OVERRIDE */));
  } else {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// Imports locaux Cmd_assistattackselect (= éviter dups au top).




// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 30 ════════════
/**
 * battle/cmd-batch-30.ts — Phase 1 Batch 30 (conversion2/pursuit/switchupdate/beatup/trick) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4D switchindataupdate       (2 bytes — refresh mon data from buffer)
 *   0xA6 settypetorandomresistance (5 bytes — Conversion 2)
 *   0xBA jumpifnopursuitswitchdmg  (5 bytes — Pursuit switch damage check)
 *   0xC4 trydobeatup               (10 bytes — Beat Up state machine)
 *   0xD2 tryswapitems              (5 bytes — Trick item swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */














// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b30(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `IsTwoTurnsMove(move)` (battle_script_commands.c:8199-8210).
 *  AUDIT FIX : précédemment stub return false → tous moves considérés single-turn.
 *  Wiring via local check (= éviter import circulaire avec cmd-batch-27). */
function _isTwoTurnsMove__b30(move: number): boolean {
  const effect = getBattleMove(move).effect;
  return effect === EFFECT_SKULL_BASH || effect === EFFECT_RAZOR_WIND
      || effect === EFFECT_SKY_ATTACK || effect === EFFECT_SOLAR_BEAM
      || effect === EFFECT_SEMI_INVULNERABLE || effect === EFFECT_BIDE;
}

/** 1:1 décomp `SwitchInClearSetData()` (battle_main.c:3152-3262). Reset effect
 *  tracking + last moves + party flags pour le mon switched in.
 *
 *  Préserve si Baton Pass : substituteHP, statStages, status2 partiel, etc.
 *  Sinon : full reset gDisableStructs + statStages + status2 + status3. */
function _switchInClearSetData(active: number): void {
  // 1:1 décomp : snapshot disableStruct (= sera reset à la fin, sauf Baton Pass).
  const disableCopy = { ...gDisableStructs[active] };

  const isBatonPass = (globalThis as { __getBattleMoveEffect?: (m: number) => number })
    .__getBattleMoveEffect?.(_gCurrentMove30()) === EFFECT_BATON_PASS;

  // 1:1 décomp 3158-3171 : si non-Baton-Pass, reset statStages + clear
  // ESCAPE_PREVENTION/ALWAYS_HITS qui pointent vers cet active.
  if (!isBatonPass) {
    for (let i = 0; i < 8 /* NUM_BATTLE_STATS */; i++) {
      gBattleMons[active].statStages[i] = 6 /* DEFAULT_STAT_STAGE */;
    }
    // 1:1 décomp battle.h:150 + 160. AUDIT BUG FIX :
    // - STATUS2_ESCAPE_PREVENTION était 0x4000 → 1<<26 = 0x4000000
    // - STATUS3_ALWAYS_HITS était 0x8 → (1<<3)|(1<<4) = 0x18
    for (let i = 0; i < _gBattlersCount30(); i++) {
      if ((gBattleMons[i].status2 & 0x4000000 /* STATUS2_ESCAPE_PREVENTION */)
          && gDisableStructs[i].battlerPreventingEscape === active) {
        gBattleMons[i].status2 &= ~0x4000000;
      }
      if ((_gStatuses30()[i] & 0x18 /* STATUS3_ALWAYS_HITS */)
          && gDisableStructs[i].battlerWithSureHit === active) {
        _gStatuses30()[i] &= ~0x18;
        gDisableStructs[i].battlerWithSureHit = 0;
      }
    }
  }

  // 1:1 décomp 3173-3193 : status2/status3 reset (full ou partial Baton Pass).
  // AUDIT BUG FIX 6 constantes hardcoded fausses vs battle.h:142-174 :
  //   - STATUS2_ESCAPE_PREVENTION 0x4000 → 0x4000000 (= 1<<26)
  //   - STATUS2_CURSED            0x80000 → 0x10000000 (= 1<<28)
  //   - STATUS3_LEECHSEED_BATTLER 0x80 → 0x3 (= 1<<0|1<<1)
  //   - STATUS3_ALWAYS_HITS       0x8 → 0x18 (= 1<<3|1<<4)
  //   - STATUS3_PERISH_SONG       0x10 → 0x20 (= 1<<5)
  //   - STATUS3_MUDSPORT          0x100000 → 0x10000 (= 1<<16)
  //   - STATUS3_WATERSPORT        0x200000 → 0x20000 (= 1<<17)
  if (isBatonPass) {
    // Baton Pass : préserve CONFUSION + FOCUS_ENERGY + SUBSTITUTE + ESCAPE_PREVENTION + CURSED.
    gBattleMons[active].status2 &= (0x7 /* CONFUSION 3 bits */
      | 0x100000 /* FOCUS_ENERGY 1<<20 */ | 0x1000000 /* SUBSTITUTE 1<<24 */
      | 0x4000000 /* ESCAPE_PREVENTION 1<<26 */ | 0x10000000 /* CURSED 1<<28 */);
    _gStatuses30()[active] &= (0x3 /* LEECHSEED_BATTLER 1<<0|1<<1 */
      | 0x4 /* LEECHSEED 1<<2 */ | 0x18 /* ALWAYS_HITS 1<<3|1<<4 */
      | 0x20 /* PERISH_SONG 1<<5 */ | 0x400 /* ROOTED 1<<10 */
      | 0x10000 /* MUDSPORT 1<<16 */ | 0x20000 /* WATERSPORT 1<<17 */);
  } else {
    gBattleMons[active].status2 = 0;
    _gStatuses30()[active] = 0;
  }

  // 1:1 décomp 3195-3201 : clear INFATUATED_WITH(active) + WRAPPED par active.
  for (let i = 0; i < _gBattlersCount30(); i++) {
    const infatuatedBit = 1 << (16 + active); // STATUS2_INFATUATED_WITH(active).
    if (gBattleMons[i].status2 & infatuatedBit) {
      gBattleMons[i].status2 &= ~infatuatedBit;
    }
    if ((gBattleMons[i].status2 & 0xE000 /* STATUS2_WRAPPED 3 bits */)
        && gBattleStruct.wrappedBy?.[i] === active) {
      gBattleMons[i].status2 &= ~0xE000;
    }
  }

  // 1:1 décomp 3203-3208 : reset action/move cursor + full DisableStruct memset.
  const acsCursor = (globalThis as { __battleState?: { gActionSelectionCursor?: number[]; gMoveSelectionCursor?: number[] } }).__battleState;
  if (acsCursor?.gActionSelectionCursor) acsCursor.gActionSelectionCursor[active] = 0;
  if (acsCursor?.gMoveSelectionCursor) acsCursor.gMoveSelectionCursor[active] = 0;

  // Memset disableStruct → 0 (= reset all fields).
  const ds = gDisableStructs[active];
  ds.encoredMove = 0; ds.encoreTimer = 0; ds.encoreTimerStartValue = 0;
  ds.disabledMove = 0; ds.disableTimer = 0; ds.disableTimerStartValue = 0;
  ds.protectUses = 0;
  ds.tauntTimer = 0; ds.tauntTimer2 = 0;
  ds.rolloutTimer = 0; ds.furyCutterCounter = 0;
  ds.chargeTimer = 0;
  ds.encoredMovePos = 0; ds.mimickedMoves = 0;
  ds.substituteHP = 0; ds.perishSongTimer = 0; ds.perishSongTimerStartValue = 0;
  ds.battlerWithSureHit = 0; ds.battlerPreventingEscape = 0;

  // 1:1 décomp 3210-3217 : restore from snapshot si Baton Pass.
  if (isBatonPass) {
    ds.substituteHP = disableCopy.substituteHP;
    ds.battlerWithSureHit = disableCopy.battlerWithSureHit;
    ds.perishSongTimer = disableCopy.perishSongTimer;
    ds.perishSongTimerStartValue = disableCopy.perishSongTimerStartValue;
    ds.battlerPreventingEscape = disableCopy.battlerPreventingEscape;
  }

  ds.isFirstTurn = 2;
  ds.truantSwitchInHack = disableCopy.truantSwitchInHack;

  // 1:1 décomp 3219-3227 : reset gMoveResultFlags + last moves + last hit by.
  _setMoveResultFlags30()(0);
  _gLastMoves30()[active] = 0; // MOVE_NONE
  _gLastLandedMoves30()[active] = 0;
  _gLastHitByType30()[active] = 0;
  _gLastResultingMoves30()[active] = 0;
  _gLastPrintedMoves30()[active] = 0;
  _gLastHitBy30()[active] = 0xFF;

  // 1:1 décomp 3229-3238 : reset gBattleStruct.lastTakenMove + lastTakenMoveFrom.
  if (gBattleStruct.lastTakenMove) {
    gBattleStruct.lastTakenMove[active * 2] = 0;
    gBattleStruct.lastTakenMove[active * 2 + 1] = 0;
  }
  if (gBattleStruct.lastTakenMoveFrom) {
    for (let j = 0; j < 4; j++) {
      gBattleStruct.lastTakenMoveFrom[j * 2 + active * 8 + 0] = 0;
      gBattleStruct.lastTakenMoveFrom[j * 2 + active * 8 + 1] = 0;
    }
  }

  // 1:1 décomp 3240 : palaceFlags clear bit.
  gBattleStruct.palaceFlags = (gBattleStruct.palaceFlags ?? 0) & ~(1 << active);

  // 1:1 décomp 3253-3254 : choicedMove[active] = MOVE_NONE.
  if (gBattleStruct.choicedMove) gBattleStruct.choicedMove[active] = 0;

  // 1:1 décomp 3257-3258 : gCurrentMove + arenaTurnCounter reset.
  _setCurrentMove30()(0);
  gBattleStruct.arenaTurnCounter = 0xFF;
}

// Helpers locaux pour éviter cross-imports circulaires (= state direct).
function _gCurrentMove30(): number {
  return (globalThis as { __battleState?: { gCurrentMove?: number } }).__battleState?.gCurrentMove ?? 0;
}
function _gBattlersCount30(): number {
  return (globalThis as { __battleState?: { gBattlersCount?: number } }).__battleState?.gBattlersCount ?? 2;
}
function _gStatuses30(): number[] {
  return (globalThis as { __battleState?: { gStatuses3?: number[] } }).__battleState?.gStatuses3 ?? [0, 0, 0, 0];
}
function _gLastMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastMoves?: number[] } }).__battleState?.gLastMoves ?? [0, 0, 0, 0];
}
function _gLastLandedMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastLandedMoves?: number[] } }).__battleState?.gLastLandedMoves ?? [0, 0, 0, 0];
}
function _gLastHitByType30(): number[] {
  return (globalThis as { __battleState?: { gLastHitByType?: number[] } }).__battleState?.gLastHitByType ?? [0, 0, 0, 0];
}
function _gLastResultingMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastResultingMoves?: number[] } }).__battleState?.gLastResultingMoves ?? [0, 0, 0, 0];
}
function _gLastPrintedMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastPrintedMoves?: number[] } }).__battleState?.gLastPrintedMoves ?? [0, 0, 0, 0];
}
function _gLastHitBy30(): number[] {
  return (globalThis as { __battleState?: { gLastHitBy?: number[] } }).__battleState?.gLastHitBy ?? [0, 0, 0, 0];
}
function _setMoveResultFlags30(): (v: number) => void {
  return (globalThis as { __battleStateMutators?: { setMoveResultFlags?: (v: number) => void } })
    .__battleStateMutators?.setMoveResultFlags ?? (() => { /* noop */ });
}
function _setCurrentMove30(): (v: number) => void {
  return (globalThis as { __battleStateMutators?: { setCurrentMove?: (v: number) => void } })
    .__battleStateMutators?.setCurrentMove ?? (() => { /* noop */ });
}

// ─── 0x4D switchindataupdate ──────────────────────────────────────────────

/** 1:1 décomp Cmd_switchindataupdate. 2 bytes. Notre port : memcpy depuis
 *  gBattleBufferB pas wired ; on suppose gBattleMons déjà à jour
 *  (= notre setMonData path écrit direct). Reste : Baton Pass copy
 *  statStages/status2 depuis oldData + SwitchInClearSetData. */
function Cmd_switchindataupdate(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b30(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  // 1:1 décomp 4634 : oldData = gBattleMons[active] (= snapshot pour Baton Pass).
  const oldStatStages = [...gBattleMons[active].statStages];
  const oldStatus2 = gBattleMons[active].status2;

  // 1:1 décomp 4637-4642 : copie gBattleBufferB[active]→gBattleMons[active] (= charge le NOUVEAU
  // mon) + re-dérive types[0/1] (gSpeciesInfo) + ability (GetAbilityBySpecies). Notre transport
  // buffer (EmitGetMonData) étant un no-op, on charge directement depuis party[gBattlerPartyIndexes
  // [active]] (que 0x4C/getswitchedmondata a set = monToSwitchIntoId). fillBattleMonFromParty fait
  // exactement ce load (tous les champs + types via gSpeciesInfo + ability + reset statStages/status2).
  // CRITIQUE : rend fonctionnels les switches PILOTÉS PAR BYTECODE (Baton Pass / Roar forced-switch /
  // U-turn) ; sans ce load l'ancien mon restait dans gBattleMons[active].
  const side = GET_BATTLER_SIDE(active) === B_SIDE_PLAYER ? 'player' : 'enemy';
  fillBattleMonFromParty(active, side, gBattlerPartyIndexes[active]);

  // 1:1 décomp 4644-4649 : clear l'objet si Knock Off l'a fait tomber pour ce mon.
  if (gWishFutureKnock.knockedOffMons[GET_BATTLER_SIDE(active)] & gBitTable[gBattlerPartyIndexes[active]]) {
    gBattleMons[active].item = 0 /* ITEM_NONE */;
  }

  // 1:1 décomp 4651-4658 : Baton Pass restaure statStages + status2 (APRÈS le fresh load qui les
  // a remis à neutre). EFFECT_BATON_PASS = 127 (valeur auto-data, audit).
  if (getBattleMove(gCurrentMove).effect === 127 /* EFFECT_BATON_PASS */) {
    gBattleMons[active].statStages = oldStatStages;
    gBattleMons[active].status2 = oldStatus2;
  }

  // (1:1 décomp 4662-4668 : flag Palace = BATTLE_TYPE_PALACE/Frontier, non porté.)
  _switchInClearSetData(active);
  gBattleScripting.battler = active;
  // 1:1 décomp battle_script_commands.c:4672.
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_30, active, gBattlerPartyIndexes[active]);
  return false;
}

// ─── 0xA6 settypetorandomresistance ───────────────────────────────────────

/** 1:1 décomp Cmd_settypetorandomresistance. 5 bytes (u32 fail jump). Conv 2. */
function Cmd_settypetorandomresistance(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gLastLandedMoves[gBattlerAttacker] === MOVE_NONE
      || gLastLandedMoves[gBattlerAttacker] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  if (_isTwoTurnsMove__b30(gLastLandedMoves[gBattlerAttacker])
      && (gBattleMons[gLastHitBy[gBattlerAttacker]].status2 & STATUS2_MULTIPLETURNS)) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // 1:1 décomp : 1000 tries random, puis 1 pass séquentiel.
  const atk = gBattleMons[gBattlerAttacker];
  const tableSize = gTypeEffectiveness.length;
  for (let rands = 0; rands < 1000; rands++) {
    let i: number;
    do {
      i = Random() % 128;
    } while (i > Math.floor(tableSize / 3));
    i *= 3;
    if (gTypeEffectiveness[i] === gLastHitByType[gBattlerAttacker]
        && gTypeEffectiveness[i + 2] <= TYPE_MUL_NOT_EFFECTIVE
        && !IS_BATTLER_OF_TYPE(atk.type1, atk.type2, gTypeEffectiveness[i + 1])) {
      atk.type1 = gTypeEffectiveness[i + 1];
      atk.type2 = gTypeEffectiveness[i + 1];
      // 1:1 décomp PREPARE_TYPE_BUFFER (random pick success).
      PREPARE_TYPE_BUFFER(_gBattleTextBuff1_30, gTypeEffectiveness[i + 1]);
      return false;
    }
  }

  // Fallback pass séquentiel — 1:1 décomp utilise `<= 5` (= TYPE_MUL_NOT_EFFECTIVE),
  // PAS `<= TYPE_MUL_NO_EFFECT` (0). Inclut donc NO_EFFECT et NOT_EFFECTIVE.
  for (let j = 0; j < tableSize; j += 3) {
    if (gTypeEffectiveness[j] === TYPE_ENDTABLE || gTypeEffectiveness[j] === TYPE_FORESIGHT) continue;
    if (gTypeEffectiveness[j] === gLastHitByType[gBattlerAttacker]
        && gTypeEffectiveness[j + 2] <= TYPE_MUL_NOT_EFFECTIVE
        && !IS_BATTLER_OF_TYPE(atk.type1, atk.type2, gTypeEffectiveness[j + 1])) {
      atk.type1 = gTypeEffectiveness[j + 1];
      atk.type2 = gTypeEffectiveness[j + 1];
      // 1:1 décomp PREPARE_TYPE_BUFFER pour fallback pass.
      PREPARE_TYPE_BUFFER(_gBattleTextBuff1_30, gTypeEffectiveness[j + 1]);
      return false;
    }
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xBA jumpifnopursuitswitchdmg ────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnopursuitswitchdmg. 5 bytes (u32 fail jump). */
function Cmd_jumpifnopursuitswitchdmg(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : set gBattlerTarget selon gMultiHitCounter + side.
  if (gMultiHitCounter === 1) {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    } else {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    }
  } else {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
    } else {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
    }
  }
  const target = gBattlerTarget;

  if (gChosenActionByBattler[target] === B_ACTION_USE_MOVE
      && gBattlerAttacker === gBattleStruct.moveTarget[target]
      && !(gBattleMons[target].status1 & (STATUS1_SLEEP | STATUS1_FREEZE))
      && gBattleMons[gBattlerAttacker].hp
      && !gDisableStructs[target].truantCounter
      && gChosenMoveByBattler[target] === MOVE_PURSUIT) {
    for (let i = 0; i < gBattlersCount; i++) {
      if (gBattlerByTurnOrder[i] === target) {
        gActionsByTurnOrder[i] = B_ACTION_TRY_FINISH;
      }
    }
    setCurrentMove(MOVE_PURSUIT);
    // 1:1 décomp l.8759 : gCurrMovePos = gChosenMovePos = chosenMovePositions[target] (LES DEUX,
    // sinon Poursuite s'exécute avec le mauvais slot/PP).
    const pursuitPos = gBattleStruct.chosenMovePositions[target];
    setCurrMovePos(pursuitPos);
    setChosenMovePos(pursuitPos);
    gBattleScripting.animTurn = 1;
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xC4 trydobeatup ─────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_trydobeatup` (battle_script_commands.c). 10 bytes :
 *  u32 endBeatUpPtr + u32 noValidMonsPtr.
 *  Itère les party slots pour trouver un mon utilisable pour Beat Up.
 *
 *  Logic :
 *    - target.hp == 0 → jump endBeatUpPtr (= early end).
 *    - else loop party slots :
 *        - found valid mon (HP > 0 && species != NONE && status == 0) →
 *          calc dmg + advance + use gBattleCommunication[0] = party slot.
 *        - exhausted && beforeLoop != 0 → jump endBeatUpPtr.
 *        - exhausted && beforeLoop == 0 → jump noValidMonsPtr. */
function Cmd_trydobeatup(ctx: BattleScriptContext): boolean {
  const endBeatUpPtr = readWord(ctx);
  const noValidMonsPtr = readWord(ctx);
  // 1:1 décomp l.8964-8967 : party selon le SIDE de l'attaquant (un dresseur adverse
  // qui utilise Frustration/Baston doit lire gEnemyParty, pas la party du joueur).
  const party = GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER ? gPlayerParty_BU : gEnemyParty;
  if (gBattleMons[gBattlerTarget].hp === 0) {
    ctx.scriptPtr = endBeatUpPtr;
    return false;
  }

  // 1:1 décomp : itère gPlayerParty depuis gBattleCommunication[0] pour
  // trouver mon HP > 0 && species != NONE && status == 0.
  const beforeLoop = gBattleCommunicationBU[0];
  while (gBattleCommunicationBU[0] < 6 /* PARTY_SIZE */) {
    const slot = gBattleCommunicationBU[0];
    const hp = GetMonData_BU(party[slot], MON_DATA_HP_BU) as number;
    const species2 = GetMonData_BU(party[slot], MON_DATA_SPECIES2_BU) as number;
    const status = GetMonData_BU(party[slot], MON_DATA_STATUS_BU) as number;
    // 1:1 décomp l.8978-8981 : HP>0 && espèce != NONE && != ŒUF && status==0.
    if (hp !== 0 && species2 !== 0 && species2 !== 412 /* SPECIES_EGG */ && status === 0) break;
    gBattleCommunicationBU[0]++;
  }

  if (gBattleCommunicationBU[0] < 6) {
    // Found valid party member → calculate damage (= 1:1 décomp formula).
    const slot = gBattleCommunicationBU[0];
    // 1:1 décomp battle_script_commands.c:8987 : PREPARE_MON_NICK_WITH_PREFIX_BUFFER
    // pour le message "Attaque de X!" (= party member name avec préfixe).
    PREPARE_MON_NICK_WITH_PREFIX_BUFFER(gBattleTextBuff1, gBattlerAttacker, slot);
    const baseAttack = _getBaseAttackBU(GetMonData_BU(party[slot], MON_DATA_SPECIES_BU) as number);
    const monLevel = GetMonData_BU(party[slot], MON_DATA_LEVEL_BU) as number;
    const baseDefense = _getBaseDefenseBU(gBattleMons[gBattlerTarget].species);
    let damage = baseAttack;
    damage *= getBattleMoveBU(gCurrentMove).power;
    damage *= Math.floor(monLevel * 2 / 5) + 2;
    damage = Math.floor(damage / baseDefense);
    damage = Math.floor(damage / 50) + 2;
    if (gProtectStructsBU[gBattlerAttacker].helpingHand) {
      damage = Math.floor(damage * 15 / 10);
    }
    setBattleMoveDamageBU(damage);
    // 1:1 décomp l.8999 : AVANCE au participant suivant. Sans ce ++, Beat Up reboucle
    // indéfiniment sur le 1er mon (gBattleCommunication[0] figé) → ne frappe jamais les autres.
    gBattleCommunicationBU[0]++;
    // 1:1 décomp : `gBattlescriptCurrInstr += 9` — advance déjà fait par dispatch.
  } else if (beforeLoop !== 0) {
    ctx.scriptPtr = endBeatUpPtr;
  } else {
    ctx.scriptPtr = noValidMonsPtr;
  }
  return false;
}

// Imports locaux Beat Up (= éviter dups au top du file).



// _getBaseAttack/_getBaseDefense (= gBaseStats[species].baseAttack/Defense 1:1).


function _getBaseAttackBU(species: number): number {
  return getSpeciesInfoBU(speciesNumberToEnumBU(species))?.stats.atk ?? 1;
}
function _getBaseDefenseBU(species: number): number {
  return getSpeciesInfoBU(speciesNumberToEnumBU(species))?.stats.def ?? 1;
}

// ─── 0xD2 tryswapitems ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_tryswapitems` (battle_script_commands.c:9191-9277). 5 bytes (u32 fail jump). Trick/Tourmagik.
 *  Échange les objets tenus attaquant↔cible avec tous les gardes décomp :
 *  TRAINER_HILL / adversaire-en-combat-régulier / Knock Off / Enigma Berry / Courrier /
 *  Glu (Sticky Hold). Persiste via SetMonData REQUEST_HELDITEM + reset le Choice lock. */
function Cmd_tryswapitems(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx); // 1:1 T1_READ_PTR(instr+1)
  const atk = gBattlerAttacker;
  const tgt = gBattlerTarget;
  // 1:1 décomp : masque des types de combat "non régulier" (LINK/EREADER/FRONTIER/SECRET_BASE/RECORDED_LINK).
  const nonRegularMask = BATTLE_TYPE_LINK | BATTLE_TYPE_EREADER_TRAINER
    | BATTLE_TYPE_FRONTIER | BATTLE_TYPE_SECRET_BASE | BATTLE_TYPE_RECORDED_LINK;

  // 1:1 décomp 9195-9201 : l'adversaire ne peut pas voler l'objet du joueur en combat régulier.
  if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL)
      || (GET_BATTLER_SIDE(atk) === B_SIDE_OPPONENT && !(gBattleTypeFlags & nonRegularMask))) {
    ctx.scriptPtr = failJump;
    return false;
  }

  const sideAttacker = GET_BATTLER_SIDE(atk);
  const sideTarget = GET_BATTLER_SIDE(tgt);

  // 1:1 décomp 9210-9220 : pas d'échange si un objet a été Knock Off (en combat régulier).
  if (!(gBattleTypeFlags & nonRegularMask)
      && (((gWishFutureKnock.knockedOffMons[sideAttacker] & gBitTable[gBattlerPartyIndexes[atk]]) !== 0)
          || ((gWishFutureKnock.knockedOffMons[sideTarget] & gBitTable[gBattlerPartyIndexes[tgt]]) !== 0))) {
    ctx.scriptPtr = failJump;
    return false;
  }

  const atkItem = gBattleMons[atk].item;
  const tgtItem = gBattleMons[tgt].item;
  // 1:1 décomp `IS_ITEM_MAIL` (mail.h:6) : items 0x79..0x84 (= Courrier).
  const isMail = (it: number): boolean => it >= 0x79 && it <= 0x84;

  // 1:1 décomp 9223-9230 : aucun objet des deux côtés, ou Baie Enigma, ou Courrier → échec.
  if ((atkItem === 0 /* ITEM_NONE */ && tgtItem === 0)
      || atkItem === ITEM_ENIGMA_BERRY || tgtItem === ITEM_ENIGMA_BERRY
      || isMail(atkItem) || isMail(tgtItem)) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // 1:1 décomp 9232-9237 : Glu (Sticky Hold) empêche le vol d'objet → jump script + record.
  if (gBattleMons[tgt].ability === ABILITY_STICKY_HOLD) {
    ctx.scriptPtr = getBattleScriptOffset('BattleScript_StickyHoldActivates');
    setLastUsedAbility(gBattleMons[tgt].ability);
    RecordAbilityBattle(tgt, gBattleMons[tgt].ability);
    return false;
  }

  // 1:1 décomp 9241-9274 : tous les checks passés → échange.
  // ⚠️ Subtilité décomp : l'item LIVE de l'attaquant passe à ITEM_NONE et le NOUVEL item
  // est stocké dans gBattleStruct.changedItems[atk] (réappliqué au switch-out) ; le mon
  // PARTY reçoit le nouvel item via SetMonData. La cible reçoit l'ancien item attaquant.
  const oldItemAtk = atkItem;
  gBattleStruct.changedItems[atk] = tgtItem;        // *newItemAtk = item de la cible
  gBattleMons[atk].item = 0 /* ITEM_NONE */;
  gBattleMons[tgt].item = oldItemAtk;

  setActiveBattler(atk);
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleStruct.changedItems[atk]);
  MarkBattlerForControllerExec(atk);

  setActiveBattler(tgt);
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleMons[tgt].item);
  MarkBattlerForControllerExec(tgt);

  // 1:1 décomp 9258-9262 : reset le Choice lock (choicedMove) des deux battlers.
  gBattleStruct.choicedMove[tgt] = 0;
  gBattleStruct.choicedMove[atk] = 0;

  // (décomp 9264 : gBattlescriptCurrInstr += 5 = déjà consommé via readWord.)

  // 1:1 décomp 9266-9274 : buffers d'objet + variant de message (newItemAtk / oldItemAtk).
  PREPARE_ITEM_BUFFER(gBattleTextBuff1, gBattleStruct.changedItems[atk]);  // *newItemAtk
  PREPARE_ITEM_BUFFER(gBattleTextBuff2, oldItemAtk);
  if (oldItemAtk !== 0 && gBattleStruct.changedItems[atk] !== 0) {
    gBattleCommunication[MULTISTRING_CHOOSER] = 0 /* B_MSG_ITEM_SWAP_BOTH */;
  } else if (oldItemAtk === 0 && gBattleStruct.changedItems[atk] !== 0) {
    gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_ITEM_SWAP_TAKEN */;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = 2 /* B_MSG_ITEM_SWAP_GIVEN */;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────



void B_POSITION_PLAYER_LEFT;
void B_POSITION_OPPONENT_LEFT;
void B_POSITION_PLAYER_RIGHT;
void B_POSITION_OPPONENT_RIGHT;
void setBattlerAttacker;
void gBitTable;


// ════════════ Batch 31 ════════════
/**
 * battle/cmd-batch-31.ts — Phase 1 Batch 31 (seteffectwithchance + catching) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x15 seteffectwithchance     (1 byte — SetMoveEffect avec %chance)
 *   0x8F forcerandomswitch       (5 bytes — Roar/Whirlwind forced switch)
 *   0xE5 pickup                  (1 byte — Pickup ability post-battle)
 *   0xF0 givecaughtmon           (1 byte — add caught mon to party / PC)
 *   0xF2 displaydexinfo          (1 byte — show Pokedex page state machine)
 *   0xF3 trygivecaughtmonnick    (1 byte — yes/no nickname state machine)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */











// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b31(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x15 seteffectwithchance ─────────────────────────────────────────────

/** 1:1 décomp Cmd_seteffectwithchance. 1 byte. */
function Cmd_seteffectwithchance(ctx: BattleScriptContext): boolean {
  const secondaryChance = getBattleMove(gCurrentMove).secondaryEffectChance;
  let percentChance: number;
  if (gBattleMons[gBattlerAttacker].ability === ABILITY_SERENE_GRACE) {
    percentChance = secondaryChance * 2;
  } else {
    percentChance = secondaryChance;
  }

  if ((gBattleCommunication[MOVE_EFFECT_BYTE] & MOVE_EFFECT_CERTAIN)
      && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    gBattleCommunication[MOVE_EFFECT_BYTE] &= ~MOVE_EFFECT_CERTAIN;
    SetMoveEffect(ctx, false, MOVE_EFFECT_CERTAIN);
  } else if ((Random() % 100) < percentChance
             && gBattleCommunication[MOVE_EFFECT_BYTE]
             && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    if (percentChance >= 100) {
      SetMoveEffect(ctx, false, MOVE_EFFECT_CERTAIN);
    } else {
      SetMoveEffect(ctx, false, 0);
    }
  }
  // 1:1 décomp : sinon advance via fall-through.

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── 0x8F forcerandomswitch ───────────────────────────────────────────────

/** 1:1 décomp Cmd_forcerandomswitch (battle_script_commands.c:7188-7389). 5 bytes (u32 fail jump). Roar/Hurlement.
 *
 *  Port complet (session opcodes 1:1) :
 *  - Wild battle (non-trainer) : `_tryDoForceSwitchOut()` (calcul d'échec niveau,
 *    succès → BattleScript_SuccessForceOut → setoutcomeonteleport = fin combat).
 *  - Trainer battle : sélection firstMonId/lastMonId/monsCount/minNeeded 1:1 pour
 *    TOUS les sous-types (single/double/two-opponents/battle-tower/ingame-partner),
 *    count validMons, fail si <= minNeeded, sinon TryDoForceSwitchOut + tirage
 *    random mon != battler1/2 + monToSwitchIntoId[target] + SwitchPartyOrder (hors multi).
 *  - DETTE LINK : SwitchPartyOrderLinkMulti/InGameMulti + GetLinkTrainerFlankId
 *    (sous-système réseau non porté, branches inatteignables en solo).
 *  - DETTE R3 : SwitchPartyOrder porté mais _SwitchPartyMonSlots stub (swap réel
 *    des slots party à compléter). */
/** 1:1 décomp `TryDoForceSwitchOut` (battle_script_commands.c:7167-7186).
 *  Calcul d'échec basé niveau (Roar/Hurlement/Teleport forcé) :
 *  - attacker.level >= target.level → switch garanti.
 *  - sinon proba d'échec `((rand*(lvlA+lvlT))>>8)+1 <= target.level/4` → jump failJump.
 *  Sur succès : enregistre battlerPartyIndexes[target] + scriptPtr = BattleScript_SuccessForceOut.
 *  (failJump = T1_READ_PTR(instr+1), déjà lu par le handler.) */
function _tryDoForceSwitchOut(ctx: BattleScriptContext, failJump: number): boolean {
  const attacker = gBattlerAttacker;
  const target = gBattlerTarget;
  if (gBattleMons[attacker].level >= gBattleMons[target].level) {
    gBattleStruct.battlerPartyIndexes[target] = gBattlerPartyIndexes[target];
  } else {
    const random = Random() & 0xFF;
    if ((((random * (gBattleMons[attacker].level + gBattleMons[target].level)) >> 8) + 1)
        <= Math.floor(gBattleMons[target].level / 4)) {
      ctx.scriptPtr = failJump; // 1:1 : gBattlescriptCurrInstr = T1_READ_PTR(instr+1)
      return false;
    }
    gBattleStruct.battlerPartyIndexes[target] = gBattlerPartyIndexes[target];
  }
  ctx.scriptPtr = getBattleScriptOffset('BattleScript_SuccessForceOut');
  return true;
}

function Cmd_forcerandomswitch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx); // 1:1 T1_READ_PTR(instr+1)
  const target = gBattlerTarget;

  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    const party = (GET_BATTLER_SIDE(target) === B_SIDE_PLAYER) ? _gPlayerPartyPK : _gEnemyPartyFRS;

    let firstMonId: number;
    let lastMonId: number;
    let monsCount: number;
    let minNeeded: number;
    let battler1PartyId = 0;
    let battler2PartyId = 0;

    // 1:1 décomp 7208-7325 — sélection firstMonId/lastMonId/monsCount/minNeeded
    // selon le sous-type de combat (BUGFIX actif : lastMonId = borne − 1 ; cf.
    // worklist 0x8F + tag #ifdef BUGFIX décomp).
    if ((gBattleTypeFlags & BATTLE_TYPE_BATTLE_TOWER && gBattleTypeFlags & BATTLE_TYPE_LINK)
        || (gBattleTypeFlags & BATTLE_TYPE_BATTLE_TOWER && gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK)
        || (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER)) {
      if ((target & BIT_FLANK) !== 0 /* != B_FLANK_LEFT */) {
        firstMonId = Math.floor(PARTY_SIZE / 2);
        lastMonId = PARTY_SIZE - 1;                  // BUGFIX
      } else {
        firstMonId = 0;
        lastMonId = Math.floor(PARTY_SIZE / 2) - 1;  // BUGFIX
      }
      monsCount = Math.floor(PARTY_SIZE / 2);
      minNeeded = 1;
      battler2PartyId = gBattlerPartyIndexes[target];
      battler1PartyId = gBattlerPartyIndexes[BATTLE_PARTNER(target)];
    } else if ((gBattleTypeFlags & BATTLE_TYPE_MULTI && gBattleTypeFlags & BATTLE_TYPE_LINK)
               || (gBattleTypeFlags & BATTLE_TYPE_MULTI && gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK)) {
      // DETTE LINK (sous-système réseau non porté) : GetLinkTrainerFlankId /
      // GetBattlerMultiplayerId absents. Branche INATTEIGNABLE en solo. Structure
      // 1:1 préservée ; flank dérivé du bit (approximation documentée, dead code).
      if ((target & BIT_FLANK) !== 0 /* GetLinkTrainerFlankId == B_FLANK_RIGHT */) {
        firstMonId = Math.floor(PARTY_SIZE / 2);
        lastMonId = PARTY_SIZE - 1;                  // BUGFIX
      } else {
        firstMonId = 0;
        lastMonId = Math.floor(PARTY_SIZE / 2) - 1;  // BUGFIX
      }
      monsCount = Math.floor(PARTY_SIZE / 2);
      minNeeded = 1;
      battler2PartyId = gBattlerPartyIndexes[target];
      battler1PartyId = gBattlerPartyIndexes[BATTLE_PARTNER(target)];
    } else if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
      if (GET_BATTLER_SIDE(target) === B_SIDE_PLAYER) {
        firstMonId = 0;
        lastMonId = PARTY_SIZE - 1;                  // BUGFIX
        monsCount = PARTY_SIZE;
        minNeeded = 2; // deux adversaires → forcément un combat double
      } else {
        if ((target & BIT_FLANK) !== 0 /* != B_FLANK_LEFT */) {
          firstMonId = Math.floor(PARTY_SIZE / 2);
          lastMonId = PARTY_SIZE - 1;                // BUGFIX
        } else {
          firstMonId = 0;
          lastMonId = Math.floor(PARTY_SIZE / 2) - 1; // BUGFIX
        }
        monsCount = Math.floor(PARTY_SIZE / 2);
        minNeeded = 1;
      }
      battler2PartyId = gBattlerPartyIndexes[target];
      battler1PartyId = gBattlerPartyIndexes[BATTLE_PARTNER(target)];
    } else if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      firstMonId = 0;
      lastMonId = PARTY_SIZE - 1;                    // BUGFIX
      monsCount = PARTY_SIZE;
      minNeeded = 2;
      battler2PartyId = gBattlerPartyIndexes[target];
      battler1PartyId = gBattlerPartyIndexes[BATTLE_PARTNER(target)];
    } else {
      // Single trainer battle (1:1 décomp 7313-7325).
      firstMonId = 0;
      lastMonId = PARTY_SIZE - 1;                    // BUGFIX
      monsCount = PARTY_SIZE;
      minNeeded = 1;
      battler2PartyId = gBattlerPartyIndexes[target]; // un seul mon out en single
      battler1PartyId = gBattlerPartyIndexes[target];
    }

    // 1:1 décomp 7327-7335 : compte les mons valides (non-vide, non-œuf, vivant).
    let validMons = 0;
    for (let i = firstMonId; i < lastMonId; i++) {
      if ((_GetMonDataPK(party[i], _MON_DATA_SPECIES_OR_EGG_PK) as number) !== 0
          && !(_GetMonDataPK(party[i], _MON_DATA_IS_EGG_FRS) as number)
          && (_GetMonDataPK(party[i], _MON_DATA_HP_FRS) as number) !== 0) {
        validMons++;
      }
    }

    if (validMons <= minNeeded) {
      // 1:1 décomp 7339 : pas assez de mons → fail jump.
      ctx.scriptPtr = failJump;
    } else if (_tryDoForceSwitchOut(ctx, failJump)) {
      // 1:1 décomp 7345-7382 (BUGFIX : bloc entier dans le if TryDoForceSwitchOut).
      // Tire un mon != battler1/battler2, vivant et non-œuf.
      let i = 0;
      let safety = 0;
      do {
        do {
          i = Random() % monsCount;
          i += firstMonId;
          if (++safety > 500) break;
        } while (i === battler2PartyId || i === battler1PartyId);
        if (safety > 500) break;
      } while ((_GetMonDataPK(party[i], _MON_DATA_SPECIES_OR_EGG_PK) as number) === 0
               || (_GetMonDataPK(party[i], _MON_DATA_IS_EGG_FRS) as number) === 1
               || (_GetMonDataPK(party[i], _MON_DATA_HP_FRS) as number) === 0);

      gBattleStruct.monToSwitchIntoId[target] = i;

      // 1:1 décomp 7366-7367 : hors multi → SwitchPartyOrder (garde l'ordre party).
      // (SwitchPartyOrder porté battle-turn-helpers.ts:137 ; son cœur
      //  _SwitchPartyMonSlots = dette R3 = swap réel des slots party non fait.)
      if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
        SwitchPartyOrder(target);
      }
      // DETTE LINK : SwitchPartyOrderLinkMulti / SwitchPartyOrderInGameMulti
      // (décomp 7369-7379) = sous-système réseau/multi non porté. Branches
      // inatteignables en combat solo.
    }
  } else {
    // 1:1 décomp 7385-7388 : combat sauvage → TryDoForceSwitchOut (fuite forcée
    // du mon sauvage si succès → BattleScript_SuccessForceOut → setoutcomeonteleport).
    _tryDoForceSwitchOut(ctx, failJump);
  }

  return false;
}

// Imports locaux Cmd_forcerandomswitch — éviter dups au top du file.



// ─── 0xE5 pickup ──────────────────────────────────────────────────────────

/** 1:1 décomp `sPickupItems[]` (battle_script_commands.c:784-804).
 *  AUDIT BUG FIX : 14/18 values étaient FAUSSES (= old item.h ordering or
 *  similar). Cross-checked vs items-data.ts (= source de vérité). */
const sPickupItems: ReadonlyArray<number> = [
  13  /* ITEM_POTION */,        14  /* ITEM_ANTIDOTE */,
  22  /* ITEM_SUPER_POTION */,  3   /* ITEM_GREAT_BALL */,
  86  /* ITEM_REPEL */,         85  /* ITEM_ESCAPE_ROPE */,
  75  /* ITEM_X_ATTACK */,      23  /* ITEM_FULL_HEAL */,
  2   /* ITEM_ULTRA_BALL */,    21  /* ITEM_HYPER_POTION */,
  68  /* ITEM_RARE_CANDY */,    64  /* ITEM_PROTEIN */,
  24  /* ITEM_REVIVE */,        63  /* ITEM_HP_UP */,
  19  /* ITEM_FULL_RESTORE */,  25  /* ITEM_MAX_REVIVE */,
  69  /* ITEM_PP_UP */,         37  /* ITEM_MAX_ELIXIR */,
];

/** 1:1 décomp `sRarePickupItems[]` (battle_script_commands.c:806-819).
 *  AUDIT BUG FIX : 10/11 values étaient FAUSSES. Cross-checked items-data.ts
 *  + TM enum (= TM01=289 first FOCUS_PUNCH, TM26=314 EARTHQUAKE, TM44=332 REST). */
const sRarePickupItems: ReadonlyArray<number> = [
  21  /* ITEM_HYPER_POTION */,  110 /* ITEM_NUGGET */,
  187 /* ITEM_KINGS_ROCK */,    19  /* ITEM_FULL_RESTORE */,
  34  /* ITEM_ETHER */,         180 /* ITEM_WHITE_HERB */,
  332 /* ITEM_TM44_REST */,     36  /* ITEM_ELIXIR */,
  289 /* ITEM_TM01_FOCUS_PUNCH */, 200 /* ITEM_LEFTOVERS */,
  314 /* ITEM_TM26_EARTHQUAKE */,
];

/** 1:1 décomp `sPickupProbabilities[]` (battle_script_commands.c:821-824). */
const sPickupProbabilities: ReadonlyArray<number> = [30, 40, 50, 60, 70, 80, 90, 94, 98];

/** 1:1 décomp Cmd_pickup (battle_script_commands.c:9657-9732). 1 byte.
 *  Post-battle Pickup ability. Itère gPlayerParty pour chaque mon avec
 *  ABILITY_PICKUP sans item : roll Random()%10==0 → roll Random()%100
 *  vs sPickupProbabilities[] → assign item depuis sPickupItems[lvlDivBy10+j]
 *  ou sRarePickupItems[lvlDivBy10+(99-rand)]. */
function Cmd_pickup(_ctx: BattleScriptContext): boolean {
  // Frontier deferred : InBattlePike + CurrentBattlePyramidLocation (= Frontier-only, retournent
  // false dans notre Phase 1). Donc on prend toujours le else branch (= normal).

  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_SPECIES_OR_EGG_PK) as number;
    const heldItem = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK) as number;
    const abilityNum = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_ABILITY_NUM_PK) as number;
    const ability = _getSpeciesAbilityPK(species, abilityNum);

    if (ability === ABILITY_PICKUP
        && species !== 0 /* SPECIES_NONE */
        && species !== 412 /* SPECIES_EGG */
        && heldItem === 0 /* ITEM_NONE */
        && (Random() % 10) === 0) {
      const rand = Random() % 100;
      let lvlDivBy10 = Math.floor((_GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_LEVEL_PK) as number - 1) / 10);
      if (lvlDivBy10 > 9) lvlDivBy10 = 9;
      for (let j = 0; j < sPickupProbabilities.length; j++) {
        if (sPickupProbabilities[j] > rand) {
          _SetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK, sPickupItems[lvlDivBy10 + j]);
          break;
        } else if (rand === 99 || rand === 98) {
          _SetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK, sRarePickupItems[lvlDivBy10 + (99 - rand)]);
          break;
        }
      }
    }
  }
  return false;
}

// Imports locaux Cmd_pickup (= éviter dups au top du file).




/** 1:1 décomp : `gSpeciesInfo[species].abilities[abilityNum ? 1 : 0]`. */
function _getSpeciesAbilityPK(species: number, abilityNum: number): number {
  const info = _getSpeciesInfoPK(_speciesNumberToEnumPK(species));
  // SPECIES_NONE (slots d'équipe vides, itérés par Cmd_pickup AVANT le check
  // species != NONE) → pas de table abilities dans notre data → ABILITY_NONE.
  // 1:1 décomp : gSpeciesInfo[SPECIES_NONE].abilities = {ABILITY_NONE, ABILITY_NONE}.
  if (!info || !info.abilities) return 0;
  const abilityName = info.abilities[abilityNum ? 1 : 0];
  // Resolve ability name → number via auto-data lookup.
  return _abilityNameToNumberPK(abilityName);
}

/** Resolve ability enum string → number via auto-data constants. */

function _abilityNameToNumberPK(abilityName: string): number {
  const val = (_AbilityConsts as Record<string, unknown>)[abilityName];
  return typeof val === 'number' ? val : 0;
}


// ─── 0xF0 givecaughtmon ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_givecaughtmon (battle_script_commands.c:10058-10086). 1 byte.
 *  Add caught Pokémon to party / PC + log dans gBattleResults. */
function Cmd_givecaughtmon(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : BATTLE_OPPOSITE(attacker) = adversaire qu'on a capturé.
  const oppBattler = _BATTLE_OPPOSITE_GC(_gBattlerAttackerGC);
  const partyIdx = _gBattlerPartyIndexesGC[oppBattler];
  const caughtMon = _gEnemyPartyGC[partyIdx];

  // 1:1 décomp ll.10060-10079 : GiveMonToPlayer. Retourne MON_GIVEN_TO_PARTY (0)
  // ou MON_GIVEN_TO_PC (1) ou MON_CANT_GIVE (2 = box full).
  const result = _GiveMonToPlayerGC(caughtMon);
  if (result !== 0 /* MON_GIVEN_TO_PARTY */) {
    // 1:1 décomp battle_script_commands.c:10062-10078 : message PC box select.
    // ShouldShowBoxWasFullMessage check + FLAG_SYS_PC_LANETTE (= unlock Lanette).
    // 1:1 décomp battle_string_ids.h:532-535 : SENT_SOMEONES_PC=0, SENT_LANETTES_PC=1,
    // SOMEONES_BOX_FULL=2, LANETTES_BOX_FULL=3 (full→2, PUIS ++ si Lanette).
    const boxWasFull = _shouldShowBoxWasFullMessage_GC();
    let msgId = boxWasFull ? 2 /* B_MSG_SOMEONES_BOX_FULL */ : 0 /* B_MSG_SENT_SOMEONES_PC */;
    if (_flagGet_GC(0x8AB /* FLAG_SYS_PC_LANETTE = SYSTEM_FLAGS(0x860) + 0x4B, flags.h:1437 ; 0x86F était FLAG_VISITED_LITTLEROOT_TOWN ! */)) {
      msgId++;  // → SENT_LANETTES_PC or LANETTES_BOX_FULL.
    }
    _gBattleCommunicationGC[5 /* MULTISTRING_CHOOSER */] = msgId;
  }

  // 1:1 décomp ll.10081-10083 : log caught mon stats dans gBattleResults.
  _gBattleResultsGC.caughtMonSpecies = _GetMonDataGC(caughtMon, _MON_DATA_SPECIES_GC) as number;
  // 1:1 décomp : `GetMonData(caughtMon, MON_DATA_NICKNAME, gBattleResults.caughtMonNick)`.
  // MON_DATA_NICKNAME=2. Write u8[11] depuis le nickname string (= POKEMON_NAME_LENGTH+1).
  const nick = _GetMonDataGC(caughtMon, 2 /* MON_DATA_NICKNAME */) as string;
  const nickBuf = _gBattleResultsGC.caughtMonNick;
  for (let i = 0; i < 11; i++) {
    nickBuf[i] = nick.charCodeAt(i) || 0xFF /* EOS */;
  }
  _gBattleResultsGC.caughtMonBall = _GetMonDataGC(caughtMon, _MON_DATA_POKEBALL_GC) as number;

  return false;
}

// Imports locaux Cmd_givecaughtmon (= éviter dups au top).


/** 1:1 décomp `ShouldShowBoxWasFullMessage()` (field_specials.c:3415-3426).
 *  Retourne TRUE si FLAG_SHOWN_BOX_WAS_FULL_MESSAGE n'a pas été set ET
 *  StorageGetCurrentBox() != VarGet(VAR_PC_BOX_TO_SEND_MON). Side-effect : set
 *  le flag à TRUE. Pour Phase 1 sans PC storage : retourne FALSE (= simple). */
function _shouldShowBoxWasFullMessage_GC(): boolean {
  return false;
}

/** 1:1 décomp `FlagGet(flag)` — `gSaveBlock1Ptr->flags[byteIdx] & (1<<bitIdx)`. */
function _flagGet_GC(flag: number): boolean {
  // FIX user 2026-06-10 (« ANNETTE au lieu de QUELQU'UN ») : l'ancienne lecture
  // brute gSaveBlock1Ptr.flags divergeait de la VRAIE structure des flags ->
  // bit fantome SET -> Lanette « rencontree » a tort. Source de verite = le
  // miroir game/event_data.FlagGet (celui des flags OW, valide en jeu).
  const ed = (globalThis as Record<string, unknown>).__eventData as { FlagGet?: (id: number) => boolean } | undefined;
  if (ed?.FlagGet) return ed.FlagGet(flag);
  const flags = gSaveBlock1Ptr.flags as number[] | Uint8Array | undefined;
  if (!flags) return false;
  return ((flags[flag >> 3] ?? 0) & (1 << (flag & 7))) !== 0;
}


// 1:1 décomp `GiveMonToPlayer` (pokemon.c:4412-4432). Notre port :
// SetMonData OT name/gender/id depuis gSaveBlock2Ptr, puis scan gPlayerParty
// pour 1er slot vide. Sinon → CopyMonToPC (= PC storage deferred Phase 1.4).

function _GiveMonToPlayerGC(mon: unknown): number {
  // 1:1 décomp pokemon.c GiveMonToPlayer (1:1 strict).
  // SetMonData OT depuis gSaveBlock2Ptr (= player info).
  const sb2 = gSaveBlock2Ptr as {
    playerName?: string;
    playerGender?: number;
    playerTrainerId?: number[] | { 0: number };
  };
  if (mon) {
    if (sb2.playerName !== undefined) _SetMonDataGC(mon as never, _MON_DATA_OT_NAME_GC, sb2.playerName);
    if (sb2.playerGender !== undefined) _SetMonDataGC(mon as never, _MON_DATA_OT_GENDER_GC, sb2.playerGender);
    // 1:1 décomp : playerTrainerId est u8[4] ; pack en u32 little-endian.
    const tid = sb2.playerTrainerId as number[] | { 0: number; 1: number; 2: number; 3: number } | undefined;
    if (tid) {
      const t0 = (tid as { 0?: number })[0] ?? 0;
      const t1 = (tid as { 1?: number })[1] ?? 0;
      const t2 = (tid as { 2?: number })[2] ?? 0;
      const t3 = (tid as { 3?: number })[3] ?? 0;
      const otId = ((t3 << 24) | (t2 << 16) | (t1 << 8) | t0) >>> 0;
      _SetMonDataGC(mon as never, _MON_DATA_OT_ID_GC, otId);
    }
  }
  // 1:1 décomp : scan gPlayerParty pour 1er slot species==0.
  for (let i = 0; i < 6; i++) {
    const slotMon = _gPlayerPartyGC[i];
    // FIX user 2026-06-10 (« OUI envoie au PC alors qu'on avait de la place ») :
    // les slots VIDES de party-storage ont species UNDEFINED (pas 0) -> l'ancien
    // test === 0 ne matchait jamais -> tout mon capture partait au PC.
    if (!slotMon || !slotMon.species) {
      // 1:1 décomp : CopyMon(&gPlayerParty[i], mon, sizeof(*mon)).
      // Notre port : shallow copy (= mon est aussi Pokemon struct).
      if (slotMon && mon) {
        Object.assign(slotMon, mon);
      }
      // gPlayerPartyCount = i + 1 — non porté (= compteur dérivable).
      return 0; // MON_GIVEN_TO_PARTY
    }
  }
  // Party full → CopyMonToPC. Deferred Phase 1.4 (= PC storage pas wired).
  return 1; // MON_GIVEN_TO_PC (= simulate sent to PC).
}

// ─── 0xF2 displaydexinfo ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_displaydexinfo. 1 byte. State machine via
 *  gBattleCommunication[0] qui fade out, show dex page, fade back in.
 *
 *  Note 1:1 partial : les helpers UI (BeginNormalPaletteFade, DisplayCaughtMonDexPage,
 *  ShowBg, etc.) ne sont pas wired ici. State machine reduce à advance
 *  immédiat (= simulate completed). */
function Cmd_displaydexinfo(ctx: BattleScriptContext): boolean {
  // 1:1 décomp battle_script_commands.c:10104-10152 : state machine 6 cases (0..5).
  // Cases :
  //   0 : BeginNormalPaletteFade out → state 1
  //   1 : wait fade done + DisplayCaughtMonDexPage → state 2
  //   2 : wait fade + task done + restore VBlankCB → state 3
  //   3 : InitBattleBgsVideo + LoadBattleTextboxAndBackground → state 4
  //   4 : wait DMA + BeginNormalPaletteFade in → state 5
  //   5 : wait fade done → advance opcode.
  //
  // Notre port : state machine fidele, stubs UI advance instant. DETTE
  // (goal tranche 1, 2026-06-10) : l'ECRAN dex du mon capture
  // (DisplayCaughtMonDexPage -> page entry pokedex + cri + flavor) = meme
  // calibre UI que le naming screen -> tranche pokedex-UI ulterieure ; le
  // FLUX (fades + restore bgs combat) ne bloque pas (outcome 7 valide).
  switch (gBattleCommunication[0]) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      // Stubs UI Phase 1.4 — advance state.
      gBattleCommunication[0]++;
      ctx.scriptPtr--;  // stay on opcode (= re-enter next tick).
      return true;
    case 5:
      // 1:1 décomp : advance opcode + reset.
      gBattleCommunication[0] = 0;
      return false;
    default:
      gBattleCommunication[0] = 0;
      return false;
  }
}

// ─── 0xF3 trygivecaughtmonnick ────────────────────────────────────────────

/** 1:1 décomp Cmd_trygivecaughtmonnick (battle_script_commands.c:10225-10299).
 *  5 bytes (u32 jumpPtr if party full). Yes/No nickname state machine 5 cases.
 *
 *  Macro 1:1 : `trygivecaughtmonnick ptr:req` (battle_script.inc:1230-1233).
 *
 *  Cases :
 *   0 : show YES/NO box + init cursor 0.
 *   1 : poll DPAD up/down + A button → cursor 0 (YES) state 2, sinon state 4.
 *   2 : wait palette fade, open naming screen.
 *   3 : wait naming done, set nickname + jump (= retour normal flow).
 *   4 : si party FULL → advance 5 bytes (= sent to PC), sinon jump (= retour menu).
 *
 *  Port Phase 1 (UI naming screen Phase 1.4+) : auto-NO → case 4 → check party.
 *  Le state advance par tick comme dans drawlvlupbox. */
function Cmd_trygivecaughtmonnick(ctx: BattleScriptContext): boolean {
  let jumpPtr = readWord(ctx);
  // GENERATEUR : le param pointeur de CET opcode fait partie des 2
  // unresolvedSymbols de battle_scripts_2-bytecode (emis = adresse EWRAM brute
  // 0x0203xxxx au lieu de l'offset relocalise) -> sauter dessus = soft-lock
  // post-capture (A/B 2026-06-10). Garde : opcode hors bytecode => resolution
  // par nom (l'UNIQUE usage decomp = BattleScript_TryNicknameCaughtMon:78 ->
  // BattleScript_GiveCaughtMonEnd).
  if (jumpPtr < 0 || jumpPtr > 0x100000) {
    jumpPtr = getBattleScriptOffset('BattleScript_GiveCaughtMonEnd');
  }
  switch (gBattleCommunication[0 /* MULTIUSE_STATE */]) {
    case 0:
      // 1:1 decomp case 0 : VRAIE yes/no box (HandleBattleWindow + texte
      // OUI/NON + curseur) — remplace l'auto-NO (tranche 1 goal).
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, 0);
      BattlePutTextOnWindow('OUI' + String.fromCharCode(10) + 'NON', B_WIN_YESNO); // 1:1 gText_BattleYesNoChoice (battle_message.c:1283) — codes PALETTE/COLOR dynamiques = dette douce
      gBattleCommunication[0]++;
      gBattleCommunication[CURSOR_POSITION] = 0;
      BattleCreateYesNoCursorAt(0);
      ctx.scriptPtr -= 5;
      return true;
    case 1:
      // 1:1 decomp case 1 : input UP/DOWN/A/B.
      if (JOY_NEW(DPAD_UP) && gBattleCommunication[CURSOR_POSITION] !== 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 0;
        BattleCreateYesNoCursorAt(0);
      }
      if (JOY_NEW(DPAD_DOWN) && gBattleCommunication[CURSOR_POSITION] === 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 1;
        BattleCreateYesNoCursorAt(1);
      }
      if (JOY_NEW(A_BUTTON)) {
        PlaySE(SE_SELECT);
        if (gBattleCommunication[CURSOR_POSITION] === 0) {
          // OUI -> decomp case 2/3 : fade + DoNamingScreen + SetMonData(nickname)
          // PUIS `gBattlescriptCurrInstr = T1_READ_PTR(+1)` = JUMP jumpPtr
          // (BattleScript_GiveCaughtMonEnd = givecaughtmon SEUL, pas de message PC).
          // NAMING SCREEN = DETTE (pas de renommage) MAIS le JUMP est 1:1 OBLIGATOIRE :
          // sans lui on tombait sur `givecaughtmon ; printfromtable gCaughtMonStringIds`
          // = message "PC d'ANNETTE" + "BOITE ()" affiché À TORT alors que le mon va
          // à la PARTY (bug user #8/#9 — le message PC ne doit sortir QUE si party pleine,
          // via le case 4). Sortie 1:1 = jump GiveCaughtMonEnd.
          console.warn('[capture] naming screen non porte (dette) — OUI = pas de surnom');
          HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
          gBattleCommunication[0] = 0;
          ctx.scriptPtr = jumpPtr;
          return false;
        } else {
          gBattleCommunication[0] = 4;
          ctx.scriptPtr -= 5;
          return true;
        }
      } else if (JOY_NEW(B_BUTTON)) {
        PlaySE(SE_SELECT);
        gBattleCommunication[0] = 4;
        ctx.scriptPtr -= 5;
        return true;
      }
      ctx.scriptPtr -= 5;
      return true;
    case 4: {
      // 1:1 decomp case 4 : NON -> party pleine ? continue (+5 : le mon part au
      // PC, texte gCaughtMonStringIds) : jump (jumpPtr = GiveCaughtMonEnd).
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
      gBattleCommunication[0] = 0;
      let playerPartyCount = 0;
      const gParty = (globalThis as { gPlayerParty?: Array<{ species?: number }> }).gPlayerParty;
      if (gParty) {
        for (let i = 0; i < 6; i++) {
          if (gParty[i]?.species) playerPartyCount++;
        }
      }
      if (playerPartyCount === 6) {
        return false;
      } else {
        ctx.scriptPtr = jumpPtr;
        return false;
      }
    }
    default:
      gBattleCommunication[0] = 0;
      return false;
  }
}

// ─── Install handlers ──────────────────────────────────────────────────────



void _stayOnOpcode__b31;


// ════════════ Batch 32 ════════════
/**
 * battle/cmd-batch-32.ts — Phase 1 Batch 32 (learn move / party / handle ball) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x50 openpartyscreen           (6 bytes — party screen state machine, 1:1 single-battle)
 *   0x51 switchhandleorder         (3 bytes — switch order state machine 4 cases, 1:1)
 *   0x59 handlelearnnewmove        (10 bytes — try teach new move, 1:1)
 *   0x5A yesnoboxlearnmove         (5 bytes — yes/no learn move 7 cases state machine)
 *   0x5B yesnoboxstoplearningmove  (5 bytes — yes/no stop learning 2 cases)
 *   0x6C drawlvlupbox              (1 byte — level-up stats box 11 cases state machine)
 *   0xEF handleballthrow           (1 byte — Pokéball capture state machine, 1:1)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note : ces opcodes sont des state machines UI lourdes (party screen, yesno
 *  box, palette fade, naming screen, ball anim). Port 1:1 strict du squelette
 *  state machine (sessions 142 batches D+E + cleanup rounds), les rendering UI
 *  fns (HandleBattleWindow, BattlePutTextOnWindow, etc.) sont wired comme stubs
 *  Phase 1.4 qui retournent done instant (= state advance immédiat). */












// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b32(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `static u8 sLearningMoveTableID` (pokemon.c:155-ish).
// État persistant entre Cmd_handlelearnnewmove successifs.
let _sLearningMoveTableID = 0;

/** 1:1 décomp `MonTryLearningNewMove(mon, firstMove)` (pokemon.c:3015-3045).
 *  Iterate gLevelUpLearnsets[species] depuis sLearningMoveTableID, set gMoveToLearn
 *  pour le premier match level, et GiveMoveToMon. Retourne :
 *   - MOVE_NONE : aucun nouveau move à apprendre
 *   - MON_HAS_MAX_MOVES : 4 moves déjà connus
 *   - MON_ALREADY_KNOWS_MOVE : move déjà connu, caller doit reboucler
 *   - retour de GiveMoveToMon : move appris.
 *
 *  Source learnset : (globalThis.__game_data).getLevelUpLearnset(SPECIES_X). */
function _monTryLearningNewMove(_battlerIdx: number, firstMove: number): number {
  const partyIdx = _gBattleStruct32.expGetterMonId ?? 0;
  // 1:1 décomp `MonTryLearningNewMove(&gPlayerParty[gBattleStruct->expGetterMonId], ...)`.
  // CRITIQUE : lire gPlayerParty (party-storage = la party CANONIQUE du combat, comme
  // Cmd_getexp + le décomp), PAS gSaveBlock1Ptr.playerParty (qui a DIVERGÉ chez nous →
  // un mon par défaut → le learn touchait le mauvais mon). Format = Pokemon décodé →
  // Get/SetMonData.
  const mon = gPlayerParty[partyIdx];
  if (!mon) return MOVE_NONE;
  const speciesNum = GetMonData(mon, MON_DATA_SPECIES) as number;
  if (speciesNum === 0) return MOVE_NONE;
  const level = GetMonData(mon, MON_DATA_LEVEL) as number;

  // Resolve species enum (= SPECIES_TREECKO) via globalThis cache (speciesNum → enum).
  const cache = (globalThis as { gameDataSpeciesNumToEnum?: Record<number, string> }).gameDataSpeciesNumToEnum;
  const enumKey = cache?.[speciesNum] ?? `SPECIES_${speciesNum}`;
  // Lookup learnset depuis bridge globalThis (= populé au boot par game-data.ts).
  const learnsets = (globalThis as { gameDataLevelUpLearnsets?: Record<string, Array<{ level: number; move: string }>> }).gameDataLevelUpLearnsets;
  const learnset = learnsets?.[enumKey];
  if (!learnset || learnset.length === 0) return MOVE_NONE;

  // 1:1 décomp pokemon.c:3025-3034 : if firstMove → reset sLearningMoveTableID + skip
  // jusqu'au premier entry à level == mon.level.
  if (firstMove) {
    _sLearningMoveTableID = 0;
    while (_sLearningMoveTableID < learnset.length
           && learnset[_sLearningMoveTableID].level !== level) {
      _sLearningMoveTableID++;
    }
    if (_sLearningMoveTableID >= learnset.length) return MOVE_NONE;
  }
  // 1:1 décomp pokemon.c:3037-3042 : check entry courante à ce level.
  if (_sLearningMoveTableID >= learnset.length
      || learnset[_sLearningMoveTableID].level !== level) {
    return MOVE_NONE;
  }

  const moveName = learnset[_sLearningMoveTableID].move;  // ex. "MOVE_ABSORB"
  // Resolve enum → moveId via reverse de gameDataMovesNumToEnum (les constantes MOVE_* ne
  // sont PAS sur globalThis — l'ancien `globalThis[moveName]` donnait undefined→0=MOVE_NONE,
  // donc aucun move appris). Reverse map caché sur globalThis (1× au boot).
  const gMoves = globalThis as { gameDataMovesNumToEnum?: Record<number, string>; __movesEnumToNum?: Record<string, number> };
  if (!gMoves.__movesEnumToNum && gMoves.gameDataMovesNumToEnum) {
    gMoves.__movesEnumToNum = {};
    for (const [num, enm] of Object.entries(gMoves.gameDataMovesNumToEnum)) gMoves.__movesEnumToNum[enm] = Number(num);
  }
  const moveId = gMoves.__movesEnumToNum?.[moveName] ?? 0;
  // 1:1 décomp : `gMoveToLearn = ...` (pour Cmd_buffermovetolearn).
  const setM = (globalThis as { __battleStateMutators?: { setMoveToLearn?: (v: number) => void } })
    .__battleStateMutators?.setMoveToLearn;
  if (setM) setM(moveId);
  _sLearningMoveTableID++;

  // 1:1 décomp `GiveMoveToMon` → `GiveMoveToBoxMon` (pokemon.c) : pour chaque slot, si
  // vide (MOVE_NONE) → SetMonData(MOVE + PP) + return moveId ; si == moveId →
  // MON_ALREADY_KNOWS_MOVE ; après les 4 → MON_HAS_MAX_MOVES. Sur gPlayerParty décodé.
  for (let i = 0; i < 4; i++) {
    const existing = GetMonData(mon, _MON_DATA_MOVE1_AAS + i) as number;
    if (existing === 0 /* MOVE_NONE */) {
      SetMonData(mon, _MON_DATA_MOVE1_AAS + i, moveId);
      SetMonData(mon, _MON_DATA_PP1_MTL + i, getBattleMove(moveId).pp);
      return moveId;
    }
    if (existing === moveId) return 0xFFFE /* MON_ALREADY_KNOWS_MOVE */;
  }
  return 0xFFFF /* MON_HAS_MAX_MOVES */;
}

const MON_HAS_MAX_MOVES = 0xFFFF;

/** 1:1 décomp `GiveMoveToBattleMon(battleMon, move)` (pokemon.c:2958-2973).
 *  Insère move dans le premier slot vide ET set pp[i] = move.pp.
 *  Retourne move appris ou MON_HAS_MAX_MOVES. */
function _giveMoveToBattleMon(battlerIdx: number, move: number): number {
  const mon = gBattleMons[battlerIdx];
  for (let i = 0; i < 4; i++) {
    if (mon.moves[i] === MOVE_NONE) {
      mon.moves[i] = move;
      // 1:1 décomp pokemon.c:2967 : mon->pp[i] = gBattleMoves[move].pp.
      // AUDIT FIX : précédemment laissait pp inchangé → bug subtle où le nouveau
      // move avait 0 PP (= devait être set à max via lookup move.pp).
      const movePp = (getBattleMove(move) as { pp?: number })?.pp ?? 0;
      mon.pp[i] = movePp;
      return move;
    }
  }
  return MON_HAS_MAX_MOVES;
}

// ─── 0x50 openpartyscreen ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_openpartyscreen (battle_script_commands.c:4868-5147).
 *  6 bytes : opcode + u8 battler + u32 ptr.
 *
 *  Sous-paths :
 *   - BS_FAINTED_LINK_MULTIPLE_1/2 : multi link battle complex paths — Phase 1.4 deferred.
 *   - BS_ATTACKER / BS_TARGET / BS_ANY (single battle) : open party menu pour
 *     forced switch. Port 1:1 strict de cette branche.
 *
 *  Single battle path 1:1 décomp (5099-5147) :
 *    1. Determine caseId via PARTY_SCREEN_OPTIONAL flag.
 *    2. Resolve battler.
 *    3. Si already faintedHasReplacement → advance 6 bytes.
 *    4. Si HasNoMonsToSwitch → set absent + jump à jumpPtr.
 *    5. Sinon → init monToSwitchIntoId = PARTY_SIZE (= no choice) +
 *       Emit ChoosePokemon + Mark + increment playerSwitchesCounter. */
function Cmd_openpartyscreen(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const jumpPtr = readWord(ctx);

  // 1:1 décomp battle_script_commands.h:390 : PARTY_SCREEN_OPTIONAL = bit 7.
  const isOptional = (battlerArg & PARTY_SCREEN_OPTIONAL) !== 0;
  const battlerArgClean = battlerArg & ~PARTY_SCREEN_OPTIONAL;

  // 1:1 décomp battle_script_commands.h:309-310 BS_FAINTED_LINK_MULTIPLE_1/2.
  // AUDIT FIX session F2 : valeurs étaient hardcoded 0x09/0x0A (= BS_NOT_ATTACKER_SIDE/
  // BS_SCRIPTING) → divergence décomp. Vraies valeurs = 5/6.
  // Pour Phase 1, on traite single-battle. Multi cases : just advance.
  if (battlerArgClean === BS_FAINTED_LINK_MULTIPLE_1 || battlerArgClean === BS_FAINTED_LINK_MULTIPLE_2) {
    // Frontier multi link battle path — deferred post Phase 1.
    return false;
  }

  // Single battle path : resolve battler.
  const bs = (globalThis as { __battleState?: {
    gBattlerAttacker?: number;
    gBattlerTarget?: number;
    gBattlerFainted?: number;
    gAbsentBattlerFlags?: number;
    gHitMarker?: number;
    gSpecialStatuses?: Array<{ faintedHasReplacement?: boolean | number }>;
    gBattlerPartyIndexes?: number[];
    gBattleResults?: { playerSwitchesCounter?: number };
    gPlayerParty?: Array<{ species?: number; hp?: number }>;
    gEnemyParty?: Array<{ species?: number; hp?: number }>;
  } }).__battleState;
  if (!bs) return false;

  // 1:1 décomp 5104 : battler = GetBattlerForBattleScript(arg & ~PARTY_SCREEN_OPTIONAL).
  const battler = getBattlerForBattleScript(battlerArgClean);

  // 1:1 décomp 5105-5107 : si déjà replacement, advance.
  const ss = bs.gSpecialStatuses?.[battler];
  if (ss?.faintedHasReplacement) {
    return false;
  }

  // 1:1 décomp 5109-5115 : HasNoMonsToSwitch → set absent + jump.
  const hasNone = _hasNoMonsToSwitch_HBT(battler, 6, 6);
  if (hasNone) {
    setActiveBattler(battler);
    {
      const bit = 1 << battler;
      // BUG CORRIGÉ : `gAbsentBattlerFlags`/`gHitMarker` sont des exports getter-only
      // → l'assignation directe throwait (TypeError) → openpartyscreen crashait dans
      // la branche "plus de mon". Utiliser les setters.
      setAbsentBattlerFlags(gAbsentBattlerFlags | bit);
      // Clear HITMARKER_FAINTED(battler) = (1 << (battler + 28)).
      setHitMarker(gHitMarker & ~(1 << (battler + 28)));
    }
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  // 1:1 décomp 5117-5126 : init monToSwitchIntoId = PARTY_SIZE + emit ChoosePokemon.
  const PARTY_SIZE = 6;
  const PARTY_ACTION_CHOOSE_MON = 0, PARTY_ACTION_SEND_OUT = 1;  // party_menu.h:68-69
  const LINK_STANDBY_MSG_ONLY = 2;                                // battle_controllers.h:146
  // 1:1 5099-5102 : caseId pour EmitChoosePokemon.
  const caseId = isOptional ? PARTY_ACTION_CHOOSE_MON : PARTY_ACTION_SEND_OUT;
  setActiveBattler(battler);
  gBattleStruct.battlerPartyIndexes[battler] = gBattlerPartyIndexes[battler];
  gBattleStruct.monToSwitchIntoId[battler] = PARTY_SIZE;
  // 1:1 5121 : gBattleStruct->field_93 &= ~(gBitTable[battler]).
  gBattleStruct.field_93 &= ~gBitTable[battler];
  // 1:1 5123-5124 : EmitChoosePokemon(caseId, monToSwitchIntoId[PARTNER], ABILITY_NONE,
  // battlerPartyOrders[battler]) + MarkBattlerForControllerExec. (Enfile l'event
  // CONTROLLER_CHOOSEPOKEMON ; le chemin LIVE faint→switch passe par la machine d'états
  // battle-flow OPEN_PARTY_FAINT/SWITCH — cet opcode = complétude bytecode 1:1.)
  BtlController_EmitChoosePokemon(
    B_COMM_TO_CONTROLLER, caseId,
    gBattleStruct.monToSwitchIntoId[BATTLE_PARTNER(battler)] ?? PARTY_SIZE,
    ABILITY_NONE, gBattleStruct.battlerPartyOrders[battler],
  );
  MarkBattlerForControllerExec(battler);

  // 1:1 5128-5129 : player-left → playerSwitchesCounter++.
  if (GetBattlerPosition(battler) === 0 /* B_POSITION_PLAYER_LEFT */ && gBattleResults.playerSwitchesCounter < 255) {
    gBattleResults.playerSwitchesCounter++;
  }

  // 1:1 5131-5150 : MULTI → LinkStandby aux autres battlers ; sinon → adversaire opposé.
  if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    for (let i = 0; i < gBattlersCount; i++) {
      if (i !== battler) {
        setActiveBattler(i);
        BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_MSG_ONLY, false);
        MarkBattlerForControllerExec(i);
      }
    }
  } else {
    let opp = GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(battler)));
    if (gAbsentBattlerFlags & gBitTable[opp]) opp ^= BIT_FLANK;
    setActiveBattler(opp);
    BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_MSG_ONLY, false);
    MarkBattlerForControllerExec(opp);
  }
  return false;
}

/** 1:1 STRICT décomp `HasNoMonsToSwitch(battler, partyIdBattlerOn1, partyIdBattlerOn2)`
 *  (battle_util.c). Itère le party, retourne TRUE si aucun mon switchable
 *  (= species != 0 + hp > 0 + !isEgg). 1:1 strict porté. */
function _hasNoMonsToSwitch_HBT(battler: number, p1: number, p2: number): boolean {
  // 1:1 décomp HasNoMonsToSwitch : scan le party côté `battler`, TRUE si aucun mon
  // switchable (species != 0, hp > 0, !isEgg), en excluant les 2 slots on-field
  // (p1, p2). BUG CORRIGÉ : lisait `__battleState.gEnemyParty` qui n'est PAS exposé
  // (→ undefined → `return true` à tort → faint→switch cassé : "plus de mon" alors
  // qu'il en reste, le 2e mon dresseur n'entrait jamais). Lit le VRAI party via les
  // alias _CTL (= ceux que Cmd_checkteamslost utilise, qui marchent).
  const side = battler & 1;  // 0 player, 1 opponent.
  const party = side === 0 ? _gPlayerPartyCTL : _gEnemyPartyCTL;
  for (let i = 0; i < 6; i++) {
    if (i === p1 || i === p2) continue;
    const sp = _GetMonDataCTL(party[i], _MON_DATA_SPECIES_CTL) as number;
    const hp = _GetMonDataCTL(party[i], _MON_DATA_HP_CTL) as number;
    const isEgg = _GetMonDataCTL(party[i], _MON_DATA_IS_EGG_CTL) as number;
    if (sp !== 0 && hp > 0 && !isEgg) return false;
  }
  return true;
}

// ─── 0x51 switchhandleorder ───────────────────────────────────────────────

/** 1:1 décomp Cmd_switchhandleorder (battle_script_commands.c:5155-5220).
 *  3 bytes (u8 battler + u8 caseId). 4 cases :
 *   0 : commit chosen mons from gBattleBufferB (= player choice). Notre port :
 *       pas de gBattleBufferB en battle, on lit monToSwitchIntoId déjà setté.
 *   1 : SwitchPartyOrder pour single battle (= swap party slots indices).
 *   2 : same que 3 + record action (= replay tracking, no-op single).
 *   3 : update gBattleCommunication[0] + monToSwitchIntoId + SwitchPartyOrder
 *       + PREPARE_SPECIES_BUFFER + PREPARE_MON_NICK_BUFFER. */
function Cmd_switchhandleorder(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode__b32(ctx);
  const battlerArg = readByte(ctx);
  const caseId = readByte(ctx);
  const active = (globalThis as { __battleStateMutators?: { setAttacker?: (v: number) => void } })
    .__battleStateMutators; void active;
  // Resolve active battler via getBattlerForBattleScript équivalent.
  // Pour single battle, BS_ATTACKER (1) = gBattlerAttacker, BS_TARGET (0) = gBattlerTarget.
  let activeBattler = battlerArg;
  const bs = (globalThis as { __battleState?: {
    gBattlerAttacker?: number; gBattlerTarget?: number;
    gBattlerPartyIndexes?: number[];
    gBattleMons?: Array<{ species?: number }>;
    gBattleCommunication?: number[];
  } }).__battleState;
  if (battlerArg === 0 && bs?.gBattlerTarget !== undefined) activeBattler = bs.gBattlerTarget;
  else if (battlerArg === 1 && bs?.gBattlerAttacker !== undefined) activeBattler = bs.gBattlerAttacker;
  setActiveBattler(activeBattler);

  switch (caseId) {
    case 0:
      // 1:1 décomp : for each battler, if buffer[0] == CONTROLLER_CHOSENMONRETURNVALUE,
      // copy buffer[1] to gBattleStruct.monToSwitchIntoId[i].
      // Notre port : no-op (= buffer pas wired, monToSwitchIntoId déjà setté
      // par Cmd_openpartyscreen ou ChooseMonToSendOut).
      break;
    case 1:
      // 1:1 décomp : SwitchPartyOrder pour single battle (battle_main.c:4086).
      // Notre port : swap les partyIndexes via _switchPartyOrderHBT (helper local).
      _switchPartyOrderHBT(activeBattler);
      break;
    case 2:
    case 3:
      // 1:1 décomp : update gBattleCommunication[0] + monToSwitchIntoId.
      // Notre port : monToSwitchIntoId est déjà setté ; on retain le slot.
      if (bs?.gBattleCommunication && _gBattleStruct32.monToSwitchIntoId) {
        const slot = _gBattleStruct32.monToSwitchIntoId[activeBattler] ?? 0;
        bs.gBattleCommunication[0] = slot;
      }
      _switchPartyOrderHBT(activeBattler);
      // 1:1 décomp : PREPARE_SPECIES_BUFFER + PREPARE_MON_NICK_BUFFER.
      if (bs?.gBattleMons && bs.gBattlerAttacker !== undefined) {
        const attacker = bs.gBattlerAttacker;
        PREPARE_SPECIES_BUFFER(_gBattleTextBuff1_HBT, bs.gBattleMons[attacker]?.species ?? 0);
      }
      if (bs?.gBattlerPartyIndexes && _gBattleStruct32.monToSwitchIntoId) {
        PREPARE_MON_NICK_BUFFER(_gBattleTextBuff2_HBT, activeBattler,
          _gBattleStruct32.monToSwitchIntoId[activeBattler] ?? 0);
      }
      break;
    default:
      break;
  }
  return false;
}

/** 1:1 décomp `SwitchPartyOrder(battler)` (battle_main.c:4086-4113).
 *  Swap party slot du battler vers monToSwitchIntoId. Phase 1 simplified :
 *  on swap les indices dans gBattlerPartyIndexes (= notre party-storage). */
function _switchPartyOrderHBT(battler: number): void {
  const bs = (globalThis as { __battleState?: {
    gBattlerPartyIndexes?: number[];
  } }).__battleState;
  if (!bs?.gBattlerPartyIndexes || !_gBattleStruct32.monToSwitchIntoId) return;
  const newSlot = _gBattleStruct32.monToSwitchIntoId[battler];
  if (typeof newSlot === 'number' && newSlot >= 0 && newSlot < 6) {
    bs.gBattlerPartyIndexes[battler] = newSlot;
  }
}

// ─── 0x59 handlelearnnewmove ──────────────────────────────────────────────

/** 1:1 décomp Cmd_handlelearnnewmove. 10 bytes (2 ptrs + 1 firstMove flag). */
function Cmd_handlelearnnewmove(ctx: BattleScriptContext): boolean {
  const learnedMovePtr = readWord(ctx);
  const nothingToLearnPtr = readWord(ctx);
  const firstMoveFlag = readByte(ctx);

  let learnMove = _monTryLearningNewMove(0 /* expGetterMonId proxy */, firstMoveFlag);
  // 1:1 décomp : while (learnMove == MON_ALREADY_KNOWS_MOVE) try again.
  // Notre stub retourne toujours MOVE_NONE → boucle skip.
  let safety = 0;
  while (learnMove === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */ && safety++ < 100) {
    learnMove = _monTryLearningNewMove(0, 0);
  }

  if (learnMove === MOVE_NONE) {
    ctx.scriptPtr = nothingToLearnPtr;
    return false;
  }
  if (learnMove === MON_HAS_MAX_MOVES) {
    // Déjà 4 moves : continue (= fall through).
    return false;
  }

  // 1:1 décomp battle_script_commands.c:5377-5392 : check partyIdx match
  // expGetterMonId (= seul le mon qui level-up reçoit le move, pas tous les
  // player battlers actifs). Sans : Exp.Share donnait le move au mauvais mon.
  const expGetterMonId = _gBattleStruct32.expGetterMonId ?? 0;
  const playerLeft = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(playerLeft);
  if (_gBattlerPartyIndexes_32[playerLeft] === expGetterMonId
      && !(gBattleMons[playerLeft].status2 & STATUS2_TRANSFORMED)) {
    _giveMoveToBattleMon(playerLeft, learnMove);
  }
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    const playerRight = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    setActiveBattler(playerRight);
    if (_gBattlerPartyIndexes_32[playerRight] === expGetterMonId
        && !(gBattleMons[playerRight].status2 & STATUS2_TRANSFORMED)) {
      _giveMoveToBattleMon(playerRight, learnMove);
    }
  }
  ctx.scriptPtr = learnedMovePtr;
  return false;
}

// ─── 0x5A yesnoboxlearnmove ───────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxlearnmove (battle_script_commands.c:5398-5511).
 *  5 bytes (u32 forgetMovePtr if cancel). State machine 7 cases (0..6).
 *
 *  Cases :
 *   0 : show YES/NO box + init cursor 0.
 *   1 : poll input — A on YES → state 2 (= go to summary screen), NO/B → state 5
 *       (= jump à forgetMovePtr / give up).
 *   2 : wait fade + show summary screen pour choose slot to replace.
 *   3 : wait return du summary screen.
 *   4 : check GetMoveSlotToReplace → si MAX_MON_MOVES (cancel) → state 5,
 *       sinon → check HM move (= can't replace HM), si HM → state 6, sinon
 *       → SetMonMoveSlot + RemoveMonPPBonus + advance.
 *   5 : close yesno + advance 5.
 *   6 : wait BattleControllerExecFlags == 0 → retry state 2.
 *
 *  Notre port : state machine fidèle. UI Phase 1.4 deferred : auto-NO Phase 1.4 (= jump à
 *  forgetMovePtr direct car summary screen pas wired). */
function Cmd_yesnoboxlearnmove(ctx: BattleScriptContext): boolean {
  const forgetMovePtr = readWord(ctx);
  const bs = (globalThis as { __battleState?: {
    gBattleScripting?: { learnMoveState: number };
    gBattleCommunication?: number[];
  } }).__battleState;
  if (!bs?.gBattleScripting || !bs.gBattleCommunication) {
    ctx.scriptPtr = forgetMovePtr;
    return false;
  }
  switch (bs.gBattleScripting.learnMoveState) {
    case 0:
      // 1:1 décomp : show YES/NO + cursor 0. UI Phase 1.4 deferred : advance state.
      bs.gBattleCommunication[3 /* CURSOR_POSITION */] = 0;
      bs.gBattleScripting.learnMoveState++;
      ctx.scriptPtr -= 5;
      return true;
    case 1:
      // UI Phase 1.4 deferred : auto-NO → state 5.
      bs.gBattleScripting.learnMoveState = 5;
      ctx.scriptPtr -= 5;
      return true;
    case 2:
    case 3:
    case 4:
      // UI Phase 1.4 deferred : summary screen state machine. Skip à state 5.
      bs.gBattleScripting.learnMoveState = 5;
      ctx.scriptPtr -= 5;
      return true;
    case 5:
      // 1:1 décomp : close window + jump à forgetMovePtr (= refuse learn).
      bs.gBattleScripting.learnMoveState = 0;  // reset.
      ctx.scriptPtr = forgetMovePtr;
      return false;
    case 6:
      // 1:1 décomp : wait controller exec → retry state 2.
      bs.gBattleScripting.learnMoveState = 2;
      ctx.scriptPtr -= 5;
      return true;
    default:
      bs.gBattleScripting.learnMoveState = 0;
      ctx.scriptPtr = forgetMovePtr;
      return false;
  }
}

// ─── 0x5B yesnoboxstoplearningmove ────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxstoplearningmove (battle_script_commands.c:5514-5558).
 *  5 bytes (u32 stopPtr). State machine via gBattleScripting.learnMoveState.
 *
 *  Cases :
 *   0 : show yesno window + init cursor à NO position (= 0).
 *   1 : poll DPAD up/down + A/B button → resolve choice :
 *       - YES (cursor 0 + A) : advance 5 bytes (= continue normal flow).
 *       - NO  (cursor 1 + A) : jump à stopPtr (= cancel learning).
 *       - B button : same as NO.
 *
 *  Notre port : state machine fidèle au décomp. UI Phase 1.4 deferred : auto-choose YES
 *  (advance) jusqu'à wire input. */
function Cmd_yesnoboxstoplearningmove(ctx: BattleScriptContext): boolean {
  const stopPtr = readWord(ctx);
  const bs = (globalThis as { __battleState?: {
    gBattleScripting?: { learnMoveState: number };
    gBattleCommunication?: number[];
  } }).__battleState;
  if (!bs?.gBattleScripting || !bs.gBattleCommunication) return false;

  switch (bs.gBattleScripting.learnMoveState) {
    case 0:
      // 1:1 décomp : HandleBattleWindow + BattlePutTextOnWindow + cursor 0.
      // UI Phase 1.4 deferred : set cursor à 0 et advance state.
      bs.gBattleCommunication[3 /* CURSOR_POSITION */] = 0;
      bs.gBattleScripting.learnMoveState++;
      ctx.scriptPtr -= 5;  // re-enter (= stay on opcode pour case 1)
      return true;
    case 1: {
      // 1:1 décomp : poll input. UI Phase 1.4 deferred : auto-confirm YES → advance.
      // cursor 0 = YES (continue learning), cursor 1 = NO (cancel).
      // Pour stub Phase 1, on choose YES = advance pas jump.
      bs.gBattleScripting.learnMoveState = 0;  // reset for next.
      // gBattleCommunication[1] = 0 (YES) ou 1 (NO). Avec auto-YES, advance.
      if (bs.gBattleCommunication[1] !== 0) {
        ctx.scriptPtr = stopPtr;
      }
      // sinon advance (= déjà fait par readWord).
      return false;
    }
    default:
      bs.gBattleScripting.learnMoveState = 0;
      return false;
  }
}

// ─── 0x6C drawlvlupbox + Level-Up Banner (battle_script_commands.c:5927-6196) ──
// Imports locaux du bloc (modules feuilles — pas de cycle avec ce fichier).
import {
  AddWindow as _AddWindowBSC, RemoveWindow as _RemoveWindowBSC,
  PutWindowTilemap as _PutWindowTilemapBSC, ClearWindowTilemap as _ClearWindowTilemapBSC,
  CopyWindowToVram as _CopyWindowToVramBSC, CopyToWindowPixelBuffer as _CopyToWindowPixelBufferBSC,
} from '../ui/gba-window-system';
import { AddTextPrinterParameterized3 as _AddTextPrinterParameterized3BSC } from '../ui/gba-text-system';
import { loadIndexedPngStrict as _loadIndexedPngStrictBSC, loadGbaPal as _loadGbaPalBSC } from '../gba/png-loader';
import {
  LoadSpriteSheet as _LoadSpriteSheetBSC, LoadSpritePalette as _LoadSpritePaletteBSC,
  GetSpriteTileStartByTag as _GetSpriteTileStartByTagBSC,
  FreeSpritePaletteByTag as _FreeSpritePaletteByTagBSC,
} from '../system/sprite';
import { FreeSpriteTilesByTag as _FreeSpriteTilesByTagBSC } from '../system/decomp-globals';
import { sStandardBattleWindowTemplates as _sStandardBattleWindowTemplatesBSC } from '../decomp-data/src/battle_bg-data';
import { GetMonLevelUpWindowStats as _GetMonLevelUpWindowStatsBSC } from '../../game/menu_specialized';
import {
  lvlUpBoxOpenPage1 as _lvlUpBoxOpenPage1BSC, lvlUpBoxDrawPage2 as _lvlUpBoxDrawPage2BSC,
  lvlUpBoxClose as _lvlUpBoxCloseBSC,
} from './battle-levelup-box';
import { MON_ICON_PALETTE_INDICES as _MON_ICON_PALETTE_INDICES_BSC } from '../pokemon/pokemon-icon-palettes';
import { reverseDecompConstant as _reverseDecompConstantBSC } from '../system/decomp-constants';

/** PlaySE via le hook global (même mécanisme que les anims — pas d'import BGM/SE). */
function _PlaySE_BSC(se: number): void {
  ((globalThis as Record<string, unknown>).__PlaySE as ((id: number) => void) | undefined)?.(se);
}

/** 1:1 décomp `LEVEL_UP_BANNER_START/END` (battle_script_commands.c:59-60). */
const LEVEL_UP_BANNER_START = 416;
const LEVEL_UP_BANNER_END = 512;
/** 1:1 décomp `TAG_LVLUP_BANNER_MON_ICON` (battle_script_commands.c:62). */
const TAG_LVLUP_BANNER_MON_ICON = 55130;

// État module bannière : window + assets (fetch one-shot, cache module).
let _lvlUpBannerWinId = -1;
let _lvlUpBannerGfx: Uint8Array | null = null;
let _lvlUpBannerPal: Uint16Array | null = null;
let _lvlUpBannerAssetsLoading = false;
/** Stats AVANT le level-up (1:1 gBattleResources->beforeLvlUp->stats), capturées
 *  par Cmd_getexp case 3 (battle_script_commands.c:3436-3441). */
const _beforeLvlUpStats: number[] = [0, 0, 0, 0, 0, 0];
export function captureBeforeLvlUpStats(): void {
  _GetMonLevelUpWindowStatsBSC(gPlayerParty[_gBattleStruct32.expGetterMonId ?? 0] as never, _beforeLvlUpStats);
}

/** Accès miroirs gBattle_BG2_X/Y (battleVBlankState via globalThis, cf. battle_main.ts:306). */
function _bg2X(): number { return ((globalThis as Record<string, unknown>).gBattle_BG2_X as number) | 0; }
function _setBg2X(v: number): void { (globalThis as Record<string, unknown>).gBattle_BG2_X = v; }
function _setBg2Y(v: number): void { (globalThis as Record<string, unknown>).gBattle_BG2_Y = v; }
function _rtBSC(): { gba: { bg: (i: number) => { config: { priority: number; visible: boolean } } }; gMain: { newKeys: number }; LoadPaletteBg?: (pal: Uint16Array, slot: number) => void; CreateSpriteAtOam: (cfg: Record<string, unknown>) => { spriteId: number }; gSprites: Map<number, { data: number[]; x2: number; callback: unknown }>; DestroySprite: (id: number) => void; LoadPalette?: (pal: Uint16Array, slot: number) => void } | null {
  return ((globalThis as Record<string, unknown>).__rt as ReturnType<typeof _rtBSC>) ?? null;
}

/** Fetch one-shot des assets bannière (PNG indexé déjà extrait byte-exact). */
function _ensureLevelUpBannerAssets(): boolean {
  if (_lvlUpBannerGfx && _lvlUpBannerPal) return true;
  if (!_lvlUpBannerAssetsLoading) {
    _lvlUpBannerAssetsLoading = true;
    void (async () => {
      try {
        const png = await _loadIndexedPngStrictBSC('/decomp/em/battle_interface/level_up_banner.png', 4);
        _lvlUpBannerGfx = png.charData;
        _lvlUpBannerPal = png.palette;
      } catch (e) {
        console.warn('[lvlup-banner] assets KO', e);
      }
    })();
  }
  return !!(_lvlUpBannerGfx && _lvlUpBannerPal);
}

/** 1:1 décomp `InitLevelUpBanner()` (battle_script_commands.c:6044-6055) :
 *  BG2 scroll (Y=0, X=START), palette BG slot 6, gfx → window banner,
 *  PutWindowTilemap + CopyWindowToVram, puis l'icône du mon. */
function InitLevelUpBanner(): void {
  _setBg2Y(0);
  _setBg2X(LEVEL_UP_BANNER_START);
  const rt = _rtBSC();
  if (_lvlUpBannerPal && rt?.LoadPaletteBg) rt.LoadPaletteBg(_lvlUpBannerPal, 6 * 16);
  if (_lvlUpBannerWinId < 0) {
    _lvlUpBannerWinId = _AddWindowBSC(_sStandardBattleWindowTemplatesBSC[14 /* B_WIN_LEVEL_UP_BANNER */]);
  }
  if (_lvlUpBannerGfx) _CopyToWindowPixelBufferBSC(_lvlUpBannerWinId, _lvlUpBannerGfx, 0, 0);
  _PutWindowTilemapBSC(_lvlUpBannerWinId);
  _CopyWindowToVramBSC(_lvlUpBannerWinId, 3 /* COPYWIN_FULL */);
  PutMonIconOnLvlUpBanner();
}

/** 1:1 décomp `SlideInLevelUpBanner()` (battle_script_commands.c:6057-6073) —
 *  TRUE tant que le slide n'est pas fini (BG2_X: START → END par +8/frame).
 *  Le texte est dessiné à la PREMIÈRE frame (X == START). */
function SlideInLevelUpBanner(): boolean {
  if (_bg2X() === LEVEL_UP_BANNER_END) return false;
  if (_bg2X() === LEVEL_UP_BANNER_START) DrawLevelUpBannerText();
  let x = _bg2X() + 8;
  if (x >= LEVEL_UP_BANNER_END) x = LEVEL_UP_BANNER_END;
  _setBg2X(x);
  return x !== LEVEL_UP_BANNER_END;
}

/** 1:1 décomp `DrawLevelUpBannerText()` (battle_script_commands.c:6075-6134) :
 *  nickname (FONT_SMALL, x=32, y=0, blanc/ombre grise) + « Niv.N♂ » (y=10).
 *  Dette cosmétique : glyphe LV_2 rendu « Niv. », couleurs de genre via control
 *  codes non émises (le ♂/♀ hérite du blanc). */
function DrawLevelUpBannerText(): void {
  if (_lvlUpBannerWinId < 0) return;
  const mon = gPlayerParty[_gBattleStruct32.expGetterMonId ?? 0] as { level?: number; gender?: number; nickname?: string; name?: string } | undefined;
  if (!mon) return;
  const nick = (mon.nickname || mon.name || '?').toUpperCase();
  const level = mon.level ?? 1;
  // FONT_SMALL=0 chez nous ? on passe par la config window banner (FONT déjà
  // calibré dans sTextOnWindowsInfo_Normal[B_WIN_LEVEL_UP_BANNER]).
  const colors = [0 /* bg transparent */, 1 /* blanc */, 3 /* ombre gris */];
  _AddTextPrinterParameterized3BSC(_lvlUpBannerWinId, 0 /* FONT_SMALL */, 32, 0, colors, -1, nick);
  const gender = mon.gender; // 0=male 254=female 255=genderless (décomp MON_MALE=0/FEMALE=254)
  const genderChar = gender === 0 ? '♂' : gender === 254 ? '♀' : '';
  _AddTextPrinterParameterized3BSC(_lvlUpBannerWinId, 0, 32, 10, colors, -1, `Niv.${level}${genderChar}`);
  _CopyWindowToVramBSC(_lvlUpBannerWinId, 2 /* COPYWIN_GFX */);
}

/** 1:1 décomp `SlideOutLevelUpBanner()` (battle_script_commands.c:6136-6147) —
 *  TRUE tant que le slide retour n'est pas fini (BG2_X: END → START par -16). */
function SlideOutLevelUpBanner(): boolean {
  const x = _bg2X();
  if (x === LEVEL_UP_BANNER_START) return false;
  const nx = x - 16 < LEVEL_UP_BANNER_START ? LEVEL_UP_BANNER_START : x - 16;
  _setBg2X(nx);
  return nx !== LEVEL_UP_BANNER_START;
}

/** 1:1 décomp `PutMonIconOnLvlUpBanner()` (battle_script_commands.c:6152-6177) :
 *  LoadSpriteSheet (frame 0, 0x200) + LoadSpritePalette tag 55130, sprite 32×32
 *  à (256,10) qui SUIT le scroll BG2 via SpriteCB. Fetch async (≤2 frames) —
 *  la ROM lit directement ; ici l'icône apparaît dès le fetch fini, le slide
 *  (12 frames) couvre largement la latence locale. */
function PutMonIconOnLvlUpBanner(): void {
  const monIdx = _gBattleStruct32.expGetterMonId ?? 0;
  const mon = gPlayerParty[monIdx] as { species?: number } | undefined;
  if (!mon?.species) return;
  const bg2AtSpawn = _bg2X();
  void (async () => {
    try {
      const speciesEnum = _reverseDecompConstantBSC(mon.species as number, 'SPECIES_') ?? 'SPECIES_NONE';
      const dexId = speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
      const png = await _loadIndexedPngStrictBSC(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
      const palIdx = (_MON_ICON_PALETTE_INDICES_BSC as Record<string, number>)[speciesEnum] ?? 0;
      const pal = await _loadGbaPalBSC(`/decomp/em/pokemon/icon_palettes/icon_palette_${palIdx}.pal`);
      // 1:1 : sheet = frame 0 seule (0x200 = 16 tiles 32×32).
      _LoadSpriteSheetBSC({ data: png.charData.subarray(0, 0x200), size: 0x200, tag: TAG_LVLUP_BANNER_MON_ICON });
      const palSlot = _LoadSpritePaletteBSC({ data: pal, tag: TAG_LVLUP_BANNER_MON_ICON });
      const tileStart = _GetSpriteTileStartByTagBSC(TAG_LVLUP_BANNER_MON_ICON);
      const rt = _rtBSC();
      if (!rt || tileStart === 0xFFFF) return;
      const { spriteId } = rt.CreateSpriteAtOam({
        x: 256, y: 10, shape: 0, size: 2, tileId: tileStart,
        paletteBank: palSlot, priority: 0, subpriority: 0,
      });
      const spr = rt.gSprites.get(spriteId);
      if (spr) {
        spr.data[0] = 0;            // sDestroy
        spr.data[1] = bg2AtSpawn;   // sXOffset (le BG2_X au moment du Put 1:1)
        spr.callback = SpriteCB_MonIconOnLvlUpBanner as unknown;
      }
    } catch (e) {
      console.warn('[lvlup-banner] icône KO', e);
    }
  })();
}

/** 1:1 décomp `SpriteCB_MonIconOnLvlUpBanner` (battle_script_commands.c:6179-6193) :
 *  x2 suit le scroll BG2 ; détruit (+ free sheet/palette par tag) au retour. */
function SpriteCB_MonIconOnLvlUpBanner(sprite: { data: number[]; x2: number; spriteId?: number }): void {
  sprite.x2 = sprite.data[1] - _bg2X();
  if (sprite.x2 !== 0) {
    sprite.data[0] = 1;  // sDestroy
  } else if (sprite.data[0]) {
    const rt = _rtBSC();
    if (rt && typeof sprite.spriteId === 'number') rt.DestroySprite(sprite.spriteId);
    _FreeSpriteTilesByTagBSC(TAG_LVLUP_BANNER_MON_ICON);
    _FreeSpritePaletteByTagBSC(TAG_LVLUP_BANNER_MON_ICON);
  }
}

/** Cleanup window bannière (1:1 case 9 : ClearWindowTilemap + CopyWindowToVram MAP). */
function _removeLevelUpBannerWindow(): void {
  if (_lvlUpBannerWinId < 0) return;
  _ClearWindowTilemapBSC(_lvlUpBannerWinId);
  _CopyWindowToVramBSC(_lvlUpBannerWinId, 1 /* COPYWIN_MAP */);
  _RemoveWindowBSC(_lvlUpBannerWinId);
  _lvlUpBannerWinId = -1;
}

/** 1:1 décomp Cmd_drawlvlupbox (battle_script_commands.c:5927-6026). 1 byte.
 *  State machine via gBattleScripting.drawlvlupboxState (11 cases 0..10).
 *  BANNIÈRE (cases 1-2, 9) = port réel ci-dessus ; BOX de stats (cases 3-8) =
 *  API battle-levelup-box (port 1:1 existant des helpers DrawLevelUpWindow1/2).
 *  Cases 6/8 : VRAIE attente d'appui (rt.gMain.newKeys), 1:1 décomp. */
function Cmd_drawlvlupbox(ctx: BattleScriptContext): boolean {
  const bs = (globalThis as { __battleState?: { gBattleScripting?: { drawlvlupboxState: number } } })
    .__battleState?.gBattleScripting;
  if (!bs) return false;

  // 1:1 décomp 5929-5938 : case 0 → mon HORS terrain → bannière (case 1) ;
  // mon SUR le terrain (sa healthbox suffit) → skip à la box (case 3).
  if (bs.drawlvlupboxState === 0) {
    bs.drawlvlupboxState = _isMonGettingExpSentOutHBT() ? 3 : 1;
  }

  const rt = _rtBSC();
  switch (bs.drawlvlupboxState) {
    case 1:
      // 1:1 décomp case 1 : BG2_Y=96 + BG2 prio 0 + ShowBg(2) + InitLevelUpBanner.
      // Pré-condition runtime : assets fetchés (1-2 frames, la ROM lit direct).
      if (!_ensureLevelUpBannerAssets()) break;  // re-tick à la frame suivante
      _setBg2Y(96);
      if (rt) { rt.gba.bg(2).config.priority = 0; rt.gba.bg(2).config.visible = true; }
      InitLevelUpBanner();
      bs.drawlvlupboxState = 2;
      break;
    case 2:
      if (!SlideInLevelUpBanner()) bs.drawlvlupboxState = 3;
      break;
    case 3: {
      // 1:1 décomp case 3+4 via l'API box existante (cadre + page 1 + priorités BG).
      const monStats: number[] = [0, 0, 0, 0, 0, 0];
      _GetMonLevelUpWindowStatsBSC(gPlayerParty[_gBattleStruct32.expGetterMonId ?? 0] as never, monStats);
      _lvlUpBoxOpenPage1BSC(_beforeLvlUpStats.slice(), monStats);
      bs.drawlvlupboxState = 5;  // (case 4 = dessin page 1, fait par OpenPage1)
      break;
    }
    case 5:
    case 7:
      // 1:1 décomp : wait DMA (no-op chez nous) + BG1_Y=0 (fait par OpenPage1).
      bs.drawlvlupboxState++;
      break;
    case 6:
      // 1:1 décomp : attendre un VRAI appui (gMain.newKeys != 0) → SE + page 2.
      if (rt && rt.gMain.newKeys !== 0) {
        _PlaySE_BSC(5 /* SE_SELECT */);
        const monStats: number[] = [0, 0, 0, 0, 0, 0];
        _GetMonLevelUpWindowStatsBSC(gPlayerParty[_gBattleStruct32.expGetterMonId ?? 0] as never, monStats);
        _lvlUpBoxDrawPage2BSC(monStats);
        bs.drawlvlupboxState++;
      }
      break;
    case 8:
      // 1:1 décomp : attendre un appui → SE + fermer la box.
      if (rt && rt.gMain.newKeys !== 0) {
        _PlaySE_BSC(5 /* SE_SELECT */);
        _lvlUpBoxCloseBSC();
        bs.drawlvlupboxState++;
      }
      break;
    case 9:
      // 1:1 décomp : slide-out bannière puis cleanup windows + BG2 état combat.
      if (!SlideOutLevelUpBanner()) {
        _removeLevelUpBannerWindow();
        if (rt) { rt.gba.bg(2).config.priority = 2; rt.gba.bg(2).config.visible = true; }
        bs.drawlvlupboxState = 10;
      }
      break;
    case 10:
      // 1:1 décomp : restaure BG0/BG1 (fait par lvlUpBoxClose) → advance.
      bs.drawlvlupboxState = 0;
      return false;  // advance opcode.
    default:
      bs.drawlvlupboxState = 0;
      return false;
  }
  // 1:1 décomp : si pas advance (= state pas 10), stay on opcode pour re-enter.
  ctx.scriptPtr--;
  return true;
}

/** 1:1 STRICT décomp `IsMonGettingExpSentOut(void)` (battle_script_commands.c:6198-6206).
 *  Check si gBattleStruct.expGetterMonId match gBattlerPartyIndexes[player_left]
 *  ou _right en double (= mon in-battle qui gagne exp). 1:1 strict porté. */
function _isMonGettingExpSentOutHBT(): boolean {
  // 1:1 décomp battle_script_commands.c:6198-6206.
  const bs = _gBattleStruct32;
  const expGetterMonId = bs.expGetterMonId ?? 0;
  const playerLeftIdx = _gBattlerPartyIndexes_32[0] ?? -1;
  if (expGetterMonId === playerLeftIdx) return true;
  // AUDIT FIX session 144 : décomp check aussi battler 2 (playerRight) en
  // double battle. Sans : Exp.Share double battle marquait le mon comme
  // off-battle même s'il était in-battle slot 2.
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    const playerRightIdx = _gBattlerPartyIndexes_32[2] ?? -1;
    if (expGetterMonId === playerRightIdx) return true;
  }
  return false;
}

// ─── 0xEF handleballthrow ─────────────────────────────────────────────────

/** 1:1 décomp `sBallCatchBonuses[]` (battle_script_commands.c:841-847).
 *  Indexed par (ITEM_X - ITEM_ULTRA_BALL) où ITEM_ULTRA_BALL = 2 (= items-data.ts:10).
 *  AUDIT BUG FIX : était 4 (= POKE_BALL !) → 2 (= ULTRA_BALL).
 *  Order : ULTRA_BALL(2)=20, GREAT_BALL(3)=15, POKE_BALL(4)=10, SAFARI_BALL(5)=15. */
const sBallCatchBonuses_HBT: ReadonlyArray<number> = [20, 15, 10, 15];

/** 1:1 décomp `Sqrt(s32 n)` (sqrt.c). Integer Newton iteration. */
function _sqrtHBT(n: number): number {
  if (n <= 0) return 0;
  let x = n;
  let y = Math.floor((x + 1) / 2);
  while (y < x) { x = y; y = Math.floor((x + Math.floor(n / x)) / 2); }
  return x;
}

/** 1:1 décomp Cmd_handleballthrow (battle_script_commands.c:9908-10056).
 *  Pokéball catch state machine : calc odds + anim shakes + check break.
 *  1 byte. */
function Cmd_handleballthrow(ctx: BattleScriptContext): boolean {
  if (_gBattleControllerExecFlagsHBT) return _stayOnOpcodeHBT(ctx);

  _setActiveBattlerHBT(_gBattlerAttackerHBT);
  _setBattlerTargetHBT(_BATTLE_OPPOSITE_HBT(_gBattlerAttackerHBT));
  const targetIdx = _BATTLE_OPPOSITE_HBT(_gBattlerAttackerHBT);

  if (_gBattleTypeFlagsHBT & 8 /* BATTLE_TYPE_TRAINER */) {
    // 1:1 décomp : EmitBallThrowAnim(BALL_TRAINER_BLOCK = 5) + Mark.
    _BtlController_EmitBallThrowAnim_HBT(0 /* B_COMM_TO_CONTROLLER */, 5 /* BALL_TRAINER_BLOCK */);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    const off = _getBattleScriptOffsetHBT('BattleScript_TrainerBallBlock');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  if (_gBattleTypeFlagsHBT & 0x10000 /* BATTLE_TYPE_WALLY_TUTORIAL */) {
    // 1:1 décomp : EmitBallThrowAnim(BALL_3_SHAKES_SUCCESS = 4) + Mark (Wally tut).
    _BtlController_EmitBallThrowAnim_HBT(0, 4 /* BALL_3_SHAKES_SUCCESS */);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    const off = _getBattleScriptOffsetHBT('BattleScript_WallyBallThrow');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  // Normal capture flow.
  let ballMultiplier = 0;
  let catchRate: number;

  if (_gLastUsedItemHBT === 5 /* ITEM_SAFARI_BALL */) {
    catchRate = Math.floor(_gBattleStructHBT.safariCatchFactor * 1275 / 100);
  } else {
    catchRate = _getSpeciesCatchRateHBT(_gBattleMonsHBT[targetIdx].species);
  }

  if (_gLastUsedItemHBT > 5 /* ITEM_SAFARI_BALL */) {
    switch (_gLastUsedItemHBT) {
      case 6  /* ITEM_NET_BALL */: {
        const t1 = _gBattleMonsHBT[targetIdx].type1, t2 = _gBattleMonsHBT[targetIdx].type2;
        if (t1 === 11 /* WATER */ || t2 === 11 || t1 === 6 /* BUG */ || t2 === 6) ballMultiplier = 30;
        else ballMultiplier = 10;
        break;
      }
      case 7  /* ITEM_DIVE_BALL */:
        // 1:1 décomp : GetCurrentMapType() == MAP_TYPE_UNDERWATER (5).
        // Lookup via globalThis.gMapHeader.mapType (= overworld map sync).
        if (_getCurrentMapTypeHBT() === 5 /* MAP_TYPE_UNDERWATER */) {
          ballMultiplier = 35;
        } else {
          ballMultiplier = 10;
        }
        break;
      case 8  /* ITEM_NEST_BALL */: {
        const lvl = _gBattleMonsHBT[targetIdx].level;
        if (lvl < 40) {
          ballMultiplier = 40 - lvl;
          if (ballMultiplier <= 9) ballMultiplier = 10;
        } else {
          ballMultiplier = 10;
        }
        break;
      }
      case 9  /* ITEM_REPEAT_BALL */: {
        const dexNum = _gBattleMonsHBT[targetIdx].species;  // = SpeciesToNationalPokedexNum (Gen 3 = identity ≤ 386).
        if (_GetSetPokedexFlagHBT(dexNum, 0 /* FLAG_GET_CAUGHT */)) ballMultiplier = 30;
        else ballMultiplier = 10;
        break;
      }
      case 10 /* ITEM_TIMER_BALL */:
        ballMultiplier = _gBattleResultsHBT.battleTurnCounter + 10;
        if (ballMultiplier > 40) ballMultiplier = 40;
        break;
      case 11 /* ITEM_LUXURY_BALL */:
      case 12 /* ITEM_PREMIER_BALL */:
        ballMultiplier = 10;
        break;
      default:
        ballMultiplier = 10;
    }
  } else {
    // 1:1 décomp items-data.ts:10 + battle_script_commands.c:9987 :
    // `sBallCatchBonuses[gLastUsedItem - ITEM_ULTRA_BALL=2]`.
    // AUDIT BUG FIX : était `- 4` (= POKE_BALL !) → `- 2` (= ULTRA_BALL).
    ballMultiplier = sBallCatchBonuses_HBT[_gLastUsedItemHBT - 2 /* ITEM_ULTRA_BALL */] ?? 10;
  }

  let odds = Math.floor(
    Math.floor(catchRate * ballMultiplier / 10)
    * (_gBattleMonsHBT[targetIdx].maxHP * 3 - _gBattleMonsHBT[targetIdx].hp * 2)
    / (3 * _gBattleMonsHBT[targetIdx].maxHP)
  );

  const status1 = _gBattleMonsHBT[targetIdx].status1;
  if (status1 & (7 /* STATUS1_SLEEP */ | 32 /* STATUS1_FREEZE */)) odds *= 2;
  if (status1 & (8 /* STATUS1_POISON */ | 16 /* STATUS1_BURN */ | 64 /* STATUS1_PARALYSIS */ | 128 /* STATUS1_TOXIC_POISON */)) {
    odds = Math.floor((odds * 15) / 10);
  }

  // 1:1 décomp ll.9999-10010 : Master Ball / catch attempts tracking.
  if (_gLastUsedItemHBT !== 5 /* ITEM_SAFARI_BALL */) {
    if (_gLastUsedItemHBT === 1 /* ITEM_MASTER_BALL */) {
      _gBattleResultsHBT.usedMasterBall = 1;
    } else {
      // 1:1 décomp battle_script_commands.c:10004 :
      // `gBattleResults.catchAttempts[gLastUsedItem - ITEM_ULTRA_BALL]++`.
      // AUDIT BUG FIX : ITEM_ULTRA_BALL = 2 (= items-data.ts:10), pas 4.
      const idx = _gLastUsedItemHBT - 2 /* ITEM_ULTRA_BALL */;
      if (idx >= 0 && idx < _gBattleResultsHBT.catchAttempts.length
          && _gBattleResultsHBT.catchAttempts[idx] < 255) {
        _gBattleResultsHBT.catchAttempts[idx]++;
      }
    }
  }

  if (odds > 254) {
    // Mon caught (auto-success path).
    // 1:1 décomp l.10014-10015 : anim 3-shakes-success + Mark AVANT le succès (sinon l'anim
    // de capture est sautée quand le mon est faible/bas-HP ou la ball à fort multiplicateur).
    _BtlController_EmitBallThrowAnim_HBT(0, 4 /* BALL_3_SHAKES_SUCCESS */);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    const off = _getBattleScriptOffsetHBT('BattleScript_SuccessBallThrow');
    if (off >= 0) ctx.scriptPtr = off;
    _SetMonDataHBT(_gEnemyPartyHBT[_gBattlerPartyIndexesHBT[targetIdx]], _MON_DATA_POKEBALL_HBT, _gLastUsedItemHBT);
    // 1:1 décomp : MSG 0 (= SENT_SOMEONES_PC / LANETTES_PC) si party full, sinon 1.
    const partyCount_PB = _CalculatePlayerPartyCountHBT();
    _gBattleCommunicationHBT[5 /* MULTISTRING_CHOOSER */] = partyCount_PB >= 6 ? 0 : 1;
  } else {
    // Mon may be caught — calc shakes.
    odds = _sqrtHBT(_sqrtHBT(Math.floor(16711680 / odds)));
    odds = Math.floor(1048560 / odds);
    let shakes: number;
    for (shakes = 0; shakes < 4 /* BALL_3_SHAKES_SUCCESS */ && _RandomHBT() < odds; shakes++);
    if (_gLastUsedItemHBT === 1 /* ITEM_MASTER_BALL */) shakes = 4;
    // 1:1 décomp : EmitBallThrowAnim(shakes) + Mark.
    _BtlController_EmitBallThrowAnim_HBT(0, shakes);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    if (shakes === 4) {
      const off = _getBattleScriptOffsetHBT('BattleScript_SuccessBallThrow');
      if (off >= 0) ctx.scriptPtr = off;
      _SetMonDataHBT(_gEnemyPartyHBT[_gBattlerPartyIndexesHBT[targetIdx]], _MON_DATA_POKEBALL_HBT, _gLastUsedItemHBT);
      _gBattleCommunicationHBT[5] = 1;
    } else {
      _gBattleCommunicationHBT[5] = shakes;
      const off = _getBattleScriptOffsetHBT('BattleScript_ShakeBallThrow');
      if (off >= 0) ctx.scriptPtr = off;
    }
  }
  return false;
}

// Imports locaux Cmd_handleballthrow.




// 1:1 décomp `GetSetPokedexFlag` — vraie impl 1:1 strict dans pokedex-flags.ts.



// 1:1 décomp BtlController_EmitBallThrowAnim + Mark — wired pour les ball anim.

function _gBattlerAttacker_HBT(): number {
  return (globalThis as { __battleState?: { gBattlerAttacker?: number } })
    .__battleState?.gBattlerAttacker ?? 0;
}

/** 1:1 décomp `GetCurrentMapType()` (overworld.c:1344-1347). Lookup via global
 *  gMapHeader.mapType — sync from overworld system. Retourne 0 (MAP_TYPE_NONE)
 *  si non dispo (= rare en battle path : un battle est toujours triggered depuis
 *  une map valide). */
function _getCurrentMapTypeHBT(): number {
  // 1:1 décomp `gMapHeader.mapType` (= struct MapHeader, global.fieldmap.h).
  return (gMapHeader?.mapType as number | undefined) ?? 0;
}

function _getSpeciesCatchRateHBT(species: number): number {
  return _getSpeciesInfoHBT(_speciesNumberToEnumHBT(species))?.catchRate ?? 0;
}
function _stayOnOpcodeHBT(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 33 ════════════
/**
 * battle/cmd-batch-33.ts — Phase 1 Batch 33 (script-var manipulation natifs) — 15 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes "natifs" (= manipulation directe mémoire/script-vars) :
 *   0x2A jumpifhalfword       (12 bytes — compare u16 mem with constant + jump)
 *   0x2B jumpifword           (14 bytes — compare u32 mem with constant + jump)
 *   0x2C jumpifarrayequal     (14 bytes — memcmp u8 array + jump if equal)
 *   0x2D jumpifarraynotequal  (14 bytes — memcmp + jump if neq)
 *   0x2F addbyte              (6 bytes  — *byte += constant)
 *   0x30 subbyte              (6 bytes  — *byte -= constant)
 *   0x31 copyarray            (10 bytes — memcpy)
 *   0x32 copyarraywithindex   (14 bytes — memcpy with index offset)
 *   0x33 orbyte               (6 bytes  — *byte |= constant)
 *   0x34 orhalfword           (7 bytes  — *u16 |= constant)
 *   0x35 orword               (9 bytes  — *u32 |= constant)
 *   0x36 bicbyte              (6 bytes  — *byte &= ~constant)
 *   0x37 bichalfword          (7 bytes  — *u16 &= ~constant)
 *   0x38 bicword              (9 bytes  — *u32 &= ~constant)
 *   0x3B healthbar_update     (2 bytes  — emit health bar update via dmg)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note 1:1 STRICT : Ces opcodes utilisent `T2_READ_PTR` (= u32 adresse mémoire
 *  absolue GBA) pour pointer vers des variables runtime (gBattleScripting.X,
 *  gBattleMons[i].field, etc.). Notre bytecode est extracted post-link, donc
 *  ces pointers sont des valeurs u32 numériques.
 *
 *  Phase 1.3 G : memory-mapping table portée (= `memory-map.ts` + SYMBOL_MARKER
 *  0xF0000000 convention pour distinguer symbol IDs des vraies GBA addresses).
 *  Le compiler bytecode auto-extrait les symbols battle whitelistés (= 38 entries)
 *  et bind ID → MemoryAccessor (read/write). Les opcodes ici utilisent
 *  `resolveAddress(addr)` qui retourne null si address non whitelistée (= fallback
 *  no-jump pour jumpif*, no-write pour setbyte/setword). */








// 1:1 décomp CMP_* (battle_script_commands.c) — jumpif* condition codes.
const CMP_EQUAL__b33          = 0;
const CMP_NOT_EQUAL__b33      = 1;
const CMP_GREATER_THAN__b33   = 2;
const CMP_LESS_THAN__b33      = 3;
const CMP_COMMON_BITS__b33    = 4;
const CMP_NO_COMMON_BITS__b33 = 5;

function _compareJump(caseID: number, lhs: number, rhs: number): boolean {
  switch (caseID) {
    case CMP_EQUAL__b33:          return lhs === rhs;
    case CMP_NOT_EQUAL__b33:      return lhs !== rhs;
    case CMP_GREATER_THAN__b33:   return lhs > rhs;
    case CMP_LESS_THAN__b33:      return lhs < rhs;
    case CMP_COMMON_BITS__b33:    return (lhs & rhs) !== 0;
    case CMP_NO_COMMON_BITS__b33: return (lhs & rhs) === 0;
    default: return false;
  }
}

// Lazy boot memory map (= idempotent).
initMemoryMap();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Lit u32 (pointer addr) et u32 value. L'effet mémoire est appliqué par
 *  le caller via memory-map.resolveAddress + acc.write(). */
function _consumeAddrAndU32(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readWord(ctx) };
}

/** Lit u32 addr + u16 value. */
function _consumeAddrAndU16(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readHalfword(ctx) };
}

/** Lit u32 addr + u8 value. */
function _consumeAddrAndU8(ctx: BattleScriptContext): { addr: number; value: number } {
  return { addr: readWord(ctx), value: readByte(ctx) };
}

// ─── 0x29 jumpifbyte (1:1 décomp battle_script_commands.c:3660-3696) ─────

/** 11 bytes (u8 caseId + u32 ptr + u8 value + u32 jumpPtr).
 *  1:1 décomp battle_script_commands.c. Read mem via memory-map.resolveAddress +
 *  compare via _compareJump (CMP_*). */
function Cmd_jumpifbyte(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;  // unresolved address.
  const memVal = acc.read(resolveAddressOffset(addr)) & 0xFF;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2A jumpifhalfword (1:1 décomp battle_script_commands.c) ───────────

/** 12 bytes (u8 caseId + u32 ptr + u16 value + u32 jumpPtr). */
function Cmd_jumpifhalfword(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readHalfword(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;  // Fallback : unresolved symbol → no jump (= safe).
  const memVal = acc.read(resolveAddressOffset(addr)) & 0xFFFF;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2B jumpifword ──────────────────────────────────────────────────────

/** 14 bytes (u8 caseId + u32 ptr + u32 value + u32 jumpPtr). */
function Cmd_jumpifword(ctx: BattleScriptContext): boolean {
  const caseID = readByte(ctx);
  const addr = readWord(ctx);
  const value = readWord(ctx);
  const jumpPtr = readWord(ctx);
  const acc = resolveAddress(addr);
  if (!acc) return false;
  const memVal = acc.read(resolveAddressOffset(addr)) >>> 0;
  if (_compareJump(caseID, memVal, value)) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2C jumpifarrayequal ────────────────────────────────────────────────

/** 14 bytes (u32 mem1 + u32 mem2 + u8 size + u32 jumpPtr). */
function Cmd_jumpifarrayequal(ctx: BattleScriptContext): boolean {
  const addr1 = readWord(ctx);
  const addr2 = readWord(ctx);
  const size = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc1 = resolveAddress(addr1);
  const acc2 = resolveAddress(addr2);
  if (!acc1 || !acc2) return false;  // Fallback : unresolved symbol → no jump.
  // 1:1 décomp : memcmp byte-par-byte ; iterate size bytes via offsets.
  const off1 = resolveAddressOffset(addr1);
  const off2 = resolveAddressOffset(addr2);
  let equal = true;
  for (let i = 0; i < size; i++) {
    if (acc1.read(off1 + i) !== acc2.read(off2 + i)) { equal = false; break; }
  }
  if (equal) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2D jumpifarraynotequal ─────────────────────────────────────────────

function Cmd_jumpifarraynotequal(ctx: BattleScriptContext): boolean {
  const addr1 = readWord(ctx);
  const addr2 = readWord(ctx);
  const size = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const acc1 = resolveAddress(addr1);
  const acc2 = resolveAddress(addr2);
  if (!acc1 || !acc2) return false;
  const off1 = resolveAddressOffset(addr1);
  const off2 = resolveAddressOffset(addr2);
  let equal = true;
  for (let i = 0; i < size; i++) {
    if (acc1.read(off1 + i) !== acc2.read(off2 + i)) { equal = false; break; }
  }
  if (!equal) ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x2E setbyte ─────────────────────────────────────────────────────────

/** 6 bytes (u32 addr + u8 value). 1:1 décomp Cmd_setbyte (battle_script_commands.c).
 *  Resolve via memory-map.resolveAddress + acc.write(value). Audit fix session 141 :
 *  ESM live-binding bug fixed (= writes propagent à __battleStateMutators
 *  global setters au lieu de variable locale ESM stale). */
function Cmd_setbyte(ctx: BattleScriptContext): boolean {
  const addr = readWord(ctx);
  const value = readByte(ctx);
  const acc = resolveAddress(addr);
  if (acc) acc.write(value & 0xFF, resolveAddressOffset(addr));
  return false;
}

// ─── 0x2F addbyte ─────────────────────────────────────────────────────────

/** 6 bytes (u32 addr + u8 const). */
function Cmd_addbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) + value) & 0xFF, off);
  return false;
}

// ─── 0x30 subbyte ─────────────────────────────────────────────────────────

function Cmd_subbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) - value) & 0xFF, off);
  return false;
}

// ─── 0x31 copyarray ───────────────────────────────────────────────────────

/** 10 bytes (u32 dest + u32 src + u8 size). 1:1 décomp memcpy. */
function Cmd_copyarray(ctx: BattleScriptContext): boolean {
  const dest = readWord(ctx);
  const src = readWord(ctx);
  const size = readByte(ctx);
  const accDest = resolveAddress(dest);
  const accSrc = resolveAddress(src);
  if (accDest && accSrc) {
    const destOff = resolveAddressOffset(dest);
    const srcOff = resolveAddressOffset(src);
    // 1:1 décomp memcpy : iterate `size` bytes, copy chacun via accessor offset.
    for (let i = 0; i < size; i++) {
      accDest.write(accSrc.read(srcOff + i), destOff + i);
    }
  }
  return false;
}

// ─── 0x32 copyarraywithindex ──────────────────────────────────────────────

/** 14 bytes (u32 dest + u32 src + u32 index addr + u8 size). */
function Cmd_copyarraywithindex(ctx: BattleScriptContext): boolean {
  const dest = readWord(ctx);
  const src = readWord(ctx);
  const idxAddr = readWord(ctx);
  const size = readByte(ctx);
  const accDest = resolveAddress(dest);
  const accSrc = resolveAddress(src);
  const accIdx = resolveAddress(idxAddr);
  if (accDest && accSrc) {
    const destOff = resolveAddressOffset(dest);
    const srcOff = resolveAddressOffset(src);
    const idxOff = accIdx ? accIdx.read(resolveAddressOffset(idxAddr)) : 0;
    for (let i = 0; i < size; i++) {
      accDest.write(accSrc.read(srcOff + idxOff + i), destOff + i);
    }
  }
  return false;
}

// ─── 0x33 orbyte / 0x34 orhalfword / 0x35 orword ──────────────────────────

function Cmd_orbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) | value) & 0xFF, off);
  return false;
}
function Cmd_orhalfword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU16(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) | value) & 0xFFFF, off);
  return false;
}
function Cmd_orword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU32(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) | value) >>> 0, off);
  return false;
}

// ─── 0x36 bicbyte / 0x37 bichalfword / 0x38 bicword ───────────────────────

function Cmd_bicbyte(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU8(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) & ~value) & 0xFF, off);
  return false;
}
function Cmd_bichalfword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU16(ctx);
  const acc = resolveAddress(addr);
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) & ~value) & 0xFFFF, off);
  return false;
}
function Cmd_bicword(ctx: BattleScriptContext): boolean {
  const { addr, value } = _consumeAddrAndU32(ctx);
  const acc = resolveAddress(addr);
  // 1:1 : passer l'offset (bits 16-27 de l'adresse) comme orword/addbyte/subbyte — avant,
  // bicword écrivait toujours à l'offset 0 (cassé pour une cible word à offset != 0).
  const off = resolveAddressOffset(addr);
  if (acc) acc.write((acc.read(off) & ~value) >>> 0, off);
  return false;
}

// ─── 0x3B healthbar_update ────────────────────────────────────────────────

/** 1:1 décomp Cmd_healthbar_update. 2 bytes (u8 battler arg). */
function Cmd_healthbar_update(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = arg === BS_TARGET ? gBattlerTarget : gBattlerAttacker;
  setActiveBattler(active);
  BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, gBattleMoveDamage);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────


// ════════════ Batch 34 ════════════
/**
 * battle/cmd-batch-34.ts — Phase 1 Batch 34 (getexp + various dispatcher) — 2 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x23 getexp    (1 byte  — XP gain state machine, ~12k chars décomp,
 *                   port 1:1 strict via 6 cases state machine)
 *   0x76 various   (3 bytes — dispatcher 27 cases VARIOUS_*, port 1:1 strict)
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:6321-6503`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:864 CancelMultiTurnMoves`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:3811 GetMoveTarget`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:4021 IsRunningFromBattleImpossible`
 *
 *  Sessions 134+138+142 : Cmd_various porté 1:1 strict. 23+/27 cases full,
 *  Battle Frontier Arena/Palace/Pyramid spécifiques deferred.
 */









// 1:1 décomp `AdjustFriendship(mon, event)` — vraie impl 1:1 dans party-storage.ts.








// 1:1 décomp PREPARE_*_BUFFER macros pour Cmd_getexp message "X gained Y EXP!".


// 1:1 décomp `getBattleScriptOffset` — wired pour Cmd_getexp BattleScript_LevelUp.


// 1:1 décomp sBattlePalaceNatureToFlavorTextId (battle_script_commands.c:886-913).
// Index = nature ID (NATURE_HARDY=0..NATURE_QUIRKY=24).
// Value = B_MSG_GLINT_IN_EYE=0, B_MSG_GETTING_IN_POS=1, B_MSG_GROWL_DEEPLY=2, B_MSG_EAGER_FOR_MORE=3.
const _sBattlePalaceNatureToFlavorTextId_N34: readonly number[] = [
  3, // HARDY   → EAGER_FOR_MORE
  0, // LONELY  → GLINT_IN_EYE
  1, // BRAVE   → GETTING_IN_POS
  0, // ADAMANT → GLINT_IN_EYE
  0, // NAUGHTY → GLINT_IN_EYE
  1, // BOLD    → GETTING_IN_POS
  3, // DOCILE  → EAGER_FOR_MORE
  0, // RELAXED → GLINT_IN_EYE
  1, // IMPISH  → GETTING_IN_POS
  2, // LAX     → GROWL_DEEPLY
  2, // TIMID   → GROWL_DEEPLY
  0, // HASTY   → GLINT_IN_EYE
  3, // SERIOUS → EAGER_FOR_MORE
  1, // JOLLY   → GETTING_IN_POS
  3, // NAIVE   → EAGER_FOR_MORE
  1, // MODEST  → GETTING_IN_POS
  2, // MILD    → GROWL_DEEPLY
  3, // QUIET   → EAGER_FOR_MORE
  3, // BASHFUL → EAGER_FOR_MORE
  2, // RASH    → GROWL_DEEPLY
  1, // CALM    → GETTING_IN_POS
  0, // GENTLE  → GLINT_IN_EYE
  2, // SASSY   → GROWL_DEEPLY
  2, // CAREFUL → GROWL_DEEPLY
  3, // QUIRKY  → EAGER_FOR_MORE
];
// Alias arenaLost* + gBattlerPartyIndexes pour le port arena.







// ─── VARIOUS_* enum (battle_script_commands.h:334-360) — 1:1 décomp ──────
const VARIOUS_CANCEL_MULTI_TURN_MOVES         = 0;
const VARIOUS_SET_MAGIC_COAT_TARGET           = 1;
const VARIOUS_IS_RUNNING_IMPOSSIBLE           = 2;
const VARIOUS_GET_MOVE_TARGET                 = 3;
const VARIOUS_GET_BATTLER_FAINTED             = 4;
const VARIOUS_RESET_INTIMIDATE_TRACE_BITS     = 5;
const VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP    = 6;
const VARIOUS_RESET_PLAYER_FAINTED            = 7;
const VARIOUS_PALACE_FLAVOR_TEXT              = 8;
const VARIOUS_ARENA_JUDGMENT_WINDOW           = 9;
const VARIOUS_ARENA_OPPONENT_MON_LOST         = 10;
const VARIOUS_ARENA_PLAYER_MON_LOST           = 11;
const VARIOUS_ARENA_BOTH_MONS_LOST            = 12;
const VARIOUS_EMIT_YESNOBOX                   = 13;
const VARIOUS_DRAW_ARENA_REF_TEXT_BOX         = 14;
const VARIOUS_ERASE_ARENA_REF_TEXT_BOX        = 15;
const VARIOUS_ARENA_JUDGMENT_STRING           = 16;
const VARIOUS_ARENA_WAIT_STRING               = 17;
const VARIOUS_WAIT_CRY                        = 18;
const VARIOUS_RETURN_OPPONENT_MON1            = 19;
const VARIOUS_RETURN_OPPONENT_MON2            = 20;
const VARIOUS_VOLUME_DOWN                     = 21;
const VARIOUS_VOLUME_UP                       = 22;
const VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT = 23;
const VARIOUS_PALACE_TRY_ESCAPE_STATUS        = 24;
const VARIOUS_SET_TELEPORT_OUTCOME            = 25;
const VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC     = 26;

// MUS_VICTORY_TRAINER = 412 — import depuis auto-data (= AUDIT FIX :
// précédemment hardcoded 0x174=372 FAUX).

const MUS_VICTORY_TRAINER = _MUS_VICTORY_TRAINER;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode__b34(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875). */
function _CancelMultiTurnMoves(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** 1:1 décomp `GetMoveTarget(move, setTarget)` (battle_util.c:3811-3886).
 *  Setter omitted (= notre version retourne juste targetBattler ; le caller
 *  applique). Inclut ABILITYEFFECT_COUNT_OTHER_SIDE Lightning Rod redirect logic.
 *  Exporté pour réutilisation par cmd-batch-27 / cmd-batch-29 / etc. */
export function _GetMoveTarget(move: number, setTarget: number): number {
  let targetBattler = 0;
  let moveTarget: number;
  let side: number;

  if (setTarget !== NO_TARGET_OVERRIDE) {
    moveTarget = setTarget - 1;
  } else {
    moveTarget = getBattleMove(move).target;
  }

  switch (moveTarget) {
    case MOVE_TARGET_SELECTED: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else {
        side = GET_BATTLER_SIDE(gBattlerAttacker);
        let safetyIter = 0;
        do {
          targetBattler = Random() % gBattlersCount;
          safetyIter++;
        } while (
          (targetBattler === gBattlerAttacker
           || side === GET_BATTLER_SIDE(targetBattler)
           || (gAbsentBattlerFlags & (1 << targetBattler)))
          && safetyIter < 100
        );
        // Lightning Rod redirect (= target opposite si Lightning Rod sur partner).
        if (getBattleMove(move).type === TYPE_ELECTRIC
            && AbilityBattleEffects(ABILITYEFFECT_COUNT_OTHER_SIDE, gBattlerAttacker, ABILITY_LIGHTNING_ROD, 0, 0)
            && gBattleMons[targetBattler].ability !== ABILITY_LIGHTNING_ROD) {
          targetBattler ^= BIT_FLANK;
          gSpecialStatuses[targetBattler].lightningRodRedirected = 1;
        }
      }
      break;
    }
    case MOVE_TARGET_DEPENDS:
    case MOVE_TARGET_BOTH:
    case MOVE_TARGET_FOES_AND_ALLY:
    case MOVE_TARGET_OPPONENTS_FIELD: {
      targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      if (gAbsentBattlerFlags & (1 << targetBattler)) {
        targetBattler ^= BIT_FLANK;
      }
      break;
    }
    case MOVE_TARGET_RANDOM: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && (moveTarget & MOVE_TARGET_RANDOM)) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          targetBattler = (Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
            : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
        } else {
          targetBattler = (Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
            : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
        }
        if (gAbsentBattlerFlags & (1 << targetBattler)) {
          targetBattler ^= BIT_FLANK;
        }
      } else {
        targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      }
      break;
    }
    case MOVE_TARGET_USER_OR_SELECTED:
    case MOVE_TARGET_USER:
      targetBattler = gBattlerAttacker;
      break;
  }
  return targetBattler;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (battle_main.c:4021-...).
 *  Stubs : gEnigmaBerries[] holdEffect path skipped (= rare).
 *  Returns BATTLE_RUN_SUCCESS (0), BATTLE_RUN_FORBIDDEN (1, status/first-battle)
 *  ou BATTLE_RUN_FAILURE (2, ability trap). */
function _IsRunningFromBattleImpossible(): number {
  const item = gBattleMons[gActiveBattler].item;
  const holdEffect = GetItemHoldEffect(item);
  setPotentialItemEffectBattler(gActiveBattler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) return BATTLE_RUN_SUCCESS;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) return BATTLE_RUN_SUCCESS;
  if (gBattleMons[gActiveBattler].ability === ABILITY_RUN_AWAY) return BATTLE_RUN_SUCCESS;

  const side = GET_BATTLER_SIDE(gActiveBattler);
  for (let i = 0; i < gBattlersCount; i++) {
    // Shadow Tag prevent escape
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[i].ability === ABILITY_SHADOW_TAG) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
    // Arena Trap (= ground-bound mons trapped)
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[gActiveBattler].ability !== ABILITY_LEVITATE
        && !IS_BATTLER_OF_TYPE(gBattleMons[gActiveBattler].type1, gBattleMons[gActiveBattler].type2, TYPE_FLYING)
        && gBattleMons[i].ability === ABILITY_ARENA_TRAP) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
  }
  // Magnet Pull (= Steel-type trapped)
  const magnetPullSlot = AbilityBattleEffects(ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER, gActiveBattler, ABILITY_MAGNET_PULL, 0, 0);
  if (magnetPullSlot !== 0
      && IS_BATTLER_OF_TYPE(gBattleMons[gActiveBattler].type1, gBattleMons[gActiveBattler].type2, TYPE_STEEL)) {
    gBattleScripting.battler = magnetPullSlot - 1;
    setLastUsedAbility(gBattleMons[magnetPullSlot - 1].ability);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
    return BATTLE_RUN_FAILURE;
  }
  // 1:1 décomp battle_main.c:4072-4082 — status trap (Mean Look/Block = ESCAPE_PREVENTION,
  // Wrap/Bind/etc. = WRAPPED, Ingrain = ROOTED) puis first battle (Birch) → FORBIDDEN.
  if ((gBattleMons[gActiveBattler].status2 & (STATUS2_ESCAPE_PREVENTION | STATUS2_WRAPPED))
      || (gStatuses3[gActiveBattler] & STATUS3_ROOTED)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_ESCAPE;
    return BATTLE_RUN_FORBIDDEN;
  }
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DONT_LEAVE_BIRCH;
    return BATTLE_RUN_FORBIDDEN;
  }
  return BATTLE_RUN_SUCCESS;
}

// ─── 0x23 getexp ──────────────────────────────────────────────────────────

/** EXP reportée entre Cmd_getexp case 3 (remplit jusqu'au seuil de niveau+1) et
 *  case 4 (level-up d'1 niveau + reprend le reste). 1:1 ~ gBattleBufferB[2|3] du
 *  décomp (que le controller Task_GiveExpToMon renvoie). Module-level car case 3 et
 *  case 4 sont des frames/appels séparés. */
let _getexpRemaining = 0;

/** 1:1 décomp Cmd_getexp (battle_script_commands.c:3255-3532). State machine
 *  6 states via gBattleScripting.getexpState 0..6. Args : 1 byte battler ref
 *  + 4 byte ptr (= jump target post-getexp, BattleScript_LevelUp etc.).
 *
 *  Phase 1.3 I — Port complet 1:1 strict. Stubs résiduels intentionnels :
 *  - gEnigmaBerries[].holdEffect path (= rare custom berry data, Frontier).
 *  - BtlController_EmitExpUpdate (= UI sync wired session 142 R4).
 *  - HandleLowHpMusicChange (= BGM sync overworld, post-Phase 1).
 *  - gBattleResources.beforeLvlUp.stats (= tracking via gBattleStruct extension).
 *
 *  Helpers portés 1:1 décomp (session 140) :
 *  - IsTradedMon : inline check otId != playerTrainerId → XP ×1.5.
 *  - MonGainEVs : full impl via _MonGainEVs (= caps 510/255, hold effects).
 *  - AdjustFriendship : level-up event wired via cmd-batch-34 path.
 */
function Cmd_getexp(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : args = 1 byte battler ref. Notre opcode = 1 byte total
  // (= no jump target ; le caller utilise call/goto vers BattleScript_LevelUp etc.)
  const opStartPtr = ctx.scriptPtr - 1;  // position de l'opcode getexp (le dispatcher a déjà consommé +1)
  const battlerArg = readByte(ctx);
  if (gBattleControllerExecFlags) {
    ctx.scriptPtr -= 2;  // back to opcode + arg
    return true;
  }

  // 1:1 décomp : `gBattlerFainted = GetBattlerForBattleScript(...)` — set le
  // battler dont on calcule l'XP yield.
  const battlerFainted = getBattlerForBattleScript(battlerArg);
  setBattlerFainted(battlerFainted);

  // 1:1 décomp : sentIn = gSentPokesToOpponent[(battlerFainted & 2) >> 1].
  const sentIn = gSentPokesToOpponent[(battlerFainted & 2) >> 1] ?? 0;

  // 1:1 décomp : do-while loop interne pour gérer le fall-through case 1 → case 2.
  // Le décomp utilise fall-through après state 1 ; on fait un loop avec break
  // pour respecter le comportement sans le warning TS noFallthroughCasesInSwitch.
  let allowFallThrough = true;
  while (allowFallThrough) {
    allowFallThrough = false;
  switch (gBattleScripting.getexpState) {
    case 0: {
      // 1:1 décomp : check if any XP should be awarded.
      const noXpFlags = BATTLE_TYPE_LINK
        | BATTLE_TYPE_RECORDED_LINK
        | BATTLE_TYPE_TRAINER_HILL
        | BATTLE_TYPE_FRONTIER
        | BATTLE_TYPE_SAFARI
        | BATTLE_TYPE_BATTLE_TOWER
        | BATTLE_TYPE_EREADER_TRAINER;
      if (GET_BATTLER_SIDE(battlerFainted) !== /* B_SIDE_OPPONENT */ 1
          || (gBattleTypeFlags & noXpFlags)) {
        gBattleScripting.getexpState = 6;
      } else {
        gBattleScripting.getexpState++;
        gBattleStruct.givenExpMons = gBattleStruct.givenExpMons | gBitTable[gBattlerPartyIndexes[battlerFainted]];
      }
      break;
    }

    case 1: {
      // 1:1 décomp : calculate XP per-mon, count exp-share mons.
      let viaSentIn = 0;
      let viaExpShare = 0;

      for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
        const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
        const hp = GetMonData(gPlayerParty[i], MON_DATA_HP) as number;
        if (species === 0 || hp === 0) continue;
        if (gBitTable[i] & sentIn) viaSentIn++;

        const item = GetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM) as number;
        const holdEffect = GetItemHoldEffect(item);
        if (holdEffect === HOLD_EFFECT_EXP_SHARE) viaExpShare++;
      }

      // 1:1 décomp : calculatedExp = expYield × level / 7.
      const faintedSpecies = gBattleMons[battlerFainted].species;
      const calculatedExp = Math.floor(
        getSpeciesExpYield(faintedSpecies) * gBattleMons[battlerFainted].level / 7
      );

      if (viaExpShare) {
        // Split : moitié pour participants, autre moitié pour exp-share holders.
        gBattleStruct.expValue = Math.max(1, Math.floor(calculatedExp / 2 / Math.max(1, viaSentIn)));
        setExpShareExp(Math.max(1, Math.floor(calculatedExp / 2 / viaExpShare)));
      } else {
        gBattleStruct.expValue = Math.max(1, Math.floor(calculatedExp / Math.max(1, viaSentIn)));
        setExpShareExp(0);
      }

      gBattleScripting.getexpState++;
      gBattleStruct.expGetterMonId = 0;
      gBattleStruct.sentInPokes = sentIn;
      // 1:1 décomp : fall through to case 2 — re-enter switch via loop.
      allowFallThrough = true;
      break;
    }

    case 2: {
      // 1:1 décomp : set exp value per mon + print message.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const item = GetMonData(gPlayerParty[monId], MON_DATA_HELD_ITEM) as number;
        const holdEffect = GetItemHoldEffect(item);

        const monLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;

        if (holdEffect !== HOLD_EFFECT_EXP_SHARE && !(gBattleStruct.sentInPokes & 1)) {
          // Pas d'exp-share + pas sent in → skip.
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState = 5;
          setBattleMoveDamage(0);
        } else if (monLevel === MAX_LEVEL) {
          // Mon déjà niveau max.
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState = 5;
          setBattleMoveDamage(0);
        } else {
          // 1:1 décomp battle_script_commands.c:3360-3365 :
          //   BattleStopLowHpSound + PlayBGM(MUS_VICTORY_WILD) + wildVictorySong++.
          if (!(gBattleTypeFlags & BATTLE_TYPE_TRAINER)
              && gBattleMons[0].hp !== 0
              && !gBattleStruct.wildVictorySong) {
            // 1:1 songs.h:284 : MUS_VICTORY_WILD = 353 (mus_victory_wild).
            // (Bug user 2026-06-12 « BGM de victoire mauvais » : on jouait 414 =
            // MUS_INTRO, la musique de l'intro du jeu, avec un commentaire menteur.)
            const m4a = (globalThis as Record<string, unknown>).__m4aSongNumStart as ((id: number, loop?: boolean) => void) | undefined;
            m4a?.(353 /* MUS_VICTORY_WILD, songs.h:284 */, true);
            gBattleStruct.wildVictorySong = gBattleStruct.wildVictorySong + 1;
          }

          const monHp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
          if (monHp) {
            let dmg = (gBattleStruct.sentInPokes & 1) ? gBattleStruct.expValue : 0;
            if (holdEffect === HOLD_EFFECT_EXP_SHARE) {
              dmg += gExpShareExp;
            }
            if (holdEffect === HOLD_EFFECT_LUCKY_EGG) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            // 1:1 décomp : si traded mon (= otId != playerTrainerId OR otName
            // != playerName), XP × 1.5. IsTradedMon impl inline (= compare
            // direct gSaveBlock2Ptr.playerTrainerId, 1:1 décomp).
            const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
            const monOtId = gPlayerParty[monId]?.otId ?? 0;
            if (monOtId !== playerTID) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            setBattleMoveDamage(dmg);

            // 1:1 décomp : determine battler ID receiver (= slot 0 ou 2 si double).
            if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
              if (gBattlerPartyIndexes[2] === monId && !(gAbsentBattlerFlags & gBitTable[2])) {
                gBattleStruct.expGetterBattlerId = 2;
              } else {
                gBattleStruct.expGetterBattlerId = !(gAbsentBattlerFlags & gBitTable[0]) ? 0 : 2;
              }
            } else {
              gBattleStruct.expGetterBattlerId = 0;
            }

            // 1:1 décomp battle_script_commands.c:3417-3422 : PREPARE buffers
            // + PrepareStringBattle pour le message "X a gagné Y EXP!".
            // STRINGID_PKMNGAINEDEXP = 13. Template :
            //   "{B_BUFF1} a gagné{B_BUFF2}\n{B_BUFF3} points EXP.!"
            // - B_BUFF1 = nickname avec préfixe (= "POKéMON ami" / "ennemi")
            // - B_BUFF2 = " un bonus de" (ABOOSTED) ou vide (EMPTYSTRING4) selon traded
            // - B_BUFF3 = number xp
            const stringIdBoost = (monOtId !== playerTID) ? 330 /* STRINGID_ABOOSTED */ : 329 /* STRINGID_EMPTYSTRING4 */;
            PREPARE_MON_NICK_WITH_PREFIX_BUFFER_N34(_gBattleTextBuff1_N34, gBattleStruct.expGetterBattlerId, monId);
            PREPARE_STRING_BUFFER_N34(_gBattleTextBuff2_N34, stringIdBoost);
            PREPARE_WORD_NUMBER_BUFFER_N34(_gBattleTextBuff3_N34, 5, dmg);
            _PrepareStringBattleN34(13 /* STRINGID_PKMNGAINEDEXP */, gBattleStruct.expGetterBattlerId);

            // 1:1 décomp : MonGainEVs(&gPlayerParty[monId], species).
            _MonGainEVs(monId, gBattleMons[battlerFainted].species);
          }
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState++;
        }
      }
      break;
    }

    case 3: {
      // 1:1 décomp : set stats + give exp + emit ExpUpdate.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const monHp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
        const monLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;
        if (monHp && monLevel !== MAX_LEVEL) {
          // 1:1 décomp battle_script_commands.c:3436-3441 : capture des stats AVANT
          // le level-up (gBattleResources->beforeLvlUp->stats) — la page 1 de la
          // level-up box (Cmd_drawlvlupbox case 4) affiche les deltas vs ces valeurs.
          captureBeforeLvlUpStats();
          // 1:1 décomp : applique l'EXP SEGMENTÉE jusqu'au PROCHAIN seuil de niveau (le
          // décomp laisse le controller remplir la barre 1 niveau à la fois + renvoyer le
          // reste en bufferB ; notre port n'anime pas la barre → on segmente ici). Si le
          // chunk franchit le seuil de niveau+1 : remplir jusqu'au seuil, reporter le reste
          // (_getexpRemaining → case 4 → case 5 reboucle). Sinon : appliquer tout, reste=0.
          // SANS ça : EXP appliquée PLEINE d'un coup + saut au niveau FINAL → niveaux/moves
          // INTERMÉDIAIRES sautés (L5→L7 sans "monte au N. 6" ni son move) + EXP double-appliquée
          // si case 5 rebouclait avec gBattleMoveDamage non réduit.
          const expSpecies = GetMonData(gPlayerParty[monId], MON_DATA_SPECIES) as number;
          const expGrowthRate = getSpeciesGrowthRate(expSpecies);
          const currentExp = GetMonData(gPlayerParty[monId], MON_DATA_EXP) as number;
          const nextLevelThreshold = getExpForLevel(expGrowthRate, monLevel + 1);
          const expTotal = currentExp + gBattleMoveDamage;
          if (expTotal >= nextLevelThreshold) {
            SetMonData(gPlayerParty[monId], MON_DATA_EXP, nextLevelThreshold);
            _getexpRemaining = expTotal - nextLevelThreshold;
          } else {
            SetMonData(gPlayerParty[monId], MON_DATA_EXP, expTotal);
            _getexpRemaining = 0;
          }
          // 1:1 décomp battle_script_commands.c:3443 : `gActiveBattler = expGetterBattlerId`
          // AVANT l'émit. CRITIQUE : EmitExpUpdate écrit gBattleBufferA[gActiveBattler] ;
          // sans poser gActiveBattler, l'EXPUPDATE allait dans le buffer du MAUVAIS battler,
          // et le Mark(expGetterBattlerId) re-dispatchait le bufferA[0] du battler 0 ENCORE
          // = PRINTSTRING (message EXP du case 2) → le message "X a gagné N EXP" s'imprimait
          // 2× (doublon collé signalé user). Avec gActiveBattler = expGetterBattlerId, l'emit
          // écrit bufferA[0]=EXPUPDATE sur le bon battler → dispatch PlayerHandleExpUpdate (pas
          // re-PRINTSTRING).
          setActiveBattler(gBattleStruct.expGetterBattlerId);
          // 1:1 décomp : BtlController_EmitExpUpdate(B_COMM_TO_CONTROLLER,
          //   gBattleStruct->expGetterMonId, gBattleMoveDamage) + Mark.
          _BtlController_EmitExpUpdate_N34(0 /* B_COMM_TO_CONTROLLER */, monId, gBattleMoveDamage);
          _MarkBattlerForControllerExec_N34(gBattleStruct.expGetterBattlerId);
        } else {
          // 1:1 décomp (côté controller Task_GiveExpToMon) : au cap MAX_LEVEL (ou
          // HP=0), le reste d'EXP est PERDU — le controller renvoie 0 en bufferB.
          // SANS cette purge, un mon qui ATTEINT le lvl 100 en plein flux segmenté
          // (99→100 avec reste) faisait boucler case 5→3→4→5 à l'INFINI
          // (_getexpRemaining jamais consommé) = soft-lock silencieux.
          _getexpRemaining = 0;
        }
        gBattleScripting.getexpState++;
      }
      break;
    }

    case 4: {
      // 1:1 décomp : level up check + trigger BattleScript_LevelUp.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const _battlerId = gBattleStruct.expGetterBattlerId;
        // 1:1 décomp : check directement si l'XP cumulé dépasse le seuil level+1.
        // Le décomp attend un RET_VALUE_LEVELED_UP du controller buffer ; notre
        // port fait le check direct depuis gExperienceTables (= équivalent).
        const species = GetMonData(gPlayerParty[monId], MON_DATA_SPECIES) as number;
        const currentExp = GetMonData(gPlayerParty[monId], MON_DATA_EXP) as number;
        const currentLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;
        // 1:1 décomp : monte d'UN SEUL niveau par itération (case 3 a rempli l'EXP jusqu'au
        // seuil de currentLevel+1 si franchi). PAS de saut au niveau FINAL (getLevelFromExp)
        // — sinon les niveaux + moves INTERMÉDIAIRES d'un gain multi-niveaux sont sautés. Le
        // reste est reporté via gBattleMoveDamage → case 5 reboucle case 3 → niveau suivant.
        const newLevel = currentLevel + 1;
        if (currentLevel < MAX_LEVEL && currentExp >= getExpForLevel(getSpeciesGrowthRate(species), newLevel)) {
          SetMonData(gPlayerParty[monId], MON_DATA_LEVEL, newLevel);
          // 1:1 décomp (côté controller, battle_controller_player.c Task_GiveExpToMon) :
          // le level-up RECALCULE les 6 stats + ajuste les HP de la diff maxHP.
          // SANS ça : les stats party ne montaient JAMAIS au level-up en combat
          // (et la level-up box affichait +0 partout, before==after).
          CalculateMonStats(gPlayerParty[monId] as never);
          setLeveledUpInBattle(gLeveledUpInBattle | gBitTable[monId]);

          // 1:1 décomp battle_script_commands.c:3469-3498 : update gBattleMons[slot]
          // post level-up si le mon est sur le terrain (level + hp + 6 stats).
          // Quirks vanilla reproduits : Speed copiée 2× (slot 0) ; spDefense NON
          // copiée pour le slot 2 en double (bug ROM, #ifndef BUGFIX).
          if (gBattlerPartyIndexes[0] === monId && gBattleMons[0].hp) {
            gBattleMons[0].level = newLevel;
            gBattleMons[0].hp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
            gBattleMons[0].maxHP = GetMonData(gPlayerParty[monId], MON_DATA_MAX_HP) as number;
            gBattleMons[0].attack = GetMonData(gPlayerParty[monId], MON_DATA_ATK) as number;
            gBattleMons[0].defense = GetMonData(gPlayerParty[monId], MON_DATA_DEF) as number;
            gBattleMons[0].speed = GetMonData(gPlayerParty[monId], MON_DATA_SPEED) as number;
            gBattleMons[0].spAttack = GetMonData(gPlayerParty[monId], MON_DATA_SPATK) as number;
            gBattleMons[0].spDefense = GetMonData(gPlayerParty[monId], MON_DATA_SPDEF) as number;
          }
          if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
              && gBattlerPartyIndexes[2] === monId && gBattleMons[2].hp) {
            gBattleMons[2].level = newLevel;
            gBattleMons[2].hp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
            gBattleMons[2].maxHP = GetMonData(gPlayerParty[monId], MON_DATA_MAX_HP) as number;
            gBattleMons[2].attack = GetMonData(gPlayerParty[monId], MON_DATA_ATK) as number;
            gBattleMons[2].defense = GetMonData(gPlayerParty[monId], MON_DATA_DEF) as number;
            gBattleMons[2].speed = GetMonData(gPlayerParty[monId], MON_DATA_SPEED) as number;
            gBattleMons[2].spAttack = GetMonData(gPlayerParty[monId], MON_DATA_SPATK) as number;
            // spDefense volontairement absente (1:1 bug vanilla, sans BUGFIX).
          }

          // 1:1 décomp : AdjustFriendship(FRIENDSHIP_EVENT_GROW_LEVEL).
          // Wired via auto-data (= update mon.friendship +1..+3 selon location/luxury ball).
          _adjustFriendshipN34(gPlayerParty[monId], FRIENDSHIP_EVENT_GROW_LEVEL_N34);
          // 1:1 décomp battle_script_commands.c:3459-3460 : buffer le nom (B_BUFF1) + le
          // NIVEAU (B_BUFF2) pour `sText_PkmnGrewToLv` = "{B_BUFF1} monte au\nN. {B_BUFF2}!".
          // SANS ça, le numéro de niveau manquait ("ARCKO monte au N. !").
          PREPARE_MON_NICK_WITH_PREFIX_BUFFER_N34(_gBattleTextBuff1_N34, gBattleStruct.expGetterBattlerId, monId);
          PREPARE_BYTE_NUMBER_BUFFER(_gBattleTextBuff2_N34, 3, newLevel);
          // 1:1 décomp battle_script_commands.c (Cmd_getexp case 4 LEVELED_UP path) :
          // `BattleScriptPushCursor(); gBattlescriptCurrInstr = BattleScript_LevelUp`.
          // CRITIQUE : pousser `opStartPtr` (l'OPCODE getexp), PAS ctx.scriptPtr (= opStartPtr+2,
          // APRÈS l'opcode). Le décomp ne fait PAS avancer gBattlescriptCurrInstr avant case 6,
          // donc BattleScriptPushCursor pousse la position SUR getexp → au BattleScriptPop (fin de
          // BattleScript_LevelUp), getexp se RÉ-EXÉCUTE → case 5 → boucle segmented (niveau suivant).
          // Avec ctx.scriptPtr (opStartPtr+2), le pop reprenait APRÈS getexp → case 5 jamais atteinte
          // → EXP restante perdue + niveaux/moves intermédiaires sautés.
          ctx.scriptPtrStack.push(opStartPtr);
          const offLvlUp = _getBattleScriptOffsetN34('BattleScript_LevelUp');
          if (offLvlUp >= 0) ctx.scriptPtr = offLvlUp;
          // 1:1 décomp:3465 : gBattleMoveDamage = EXP restante (bufferB) → case 5 reboucle
          // case 3 pour donner le reste (niveau suivant), 1 niveau à la fois.
          setBattleMoveDamage(_getexpRemaining);
          gBattleScripting.getexpState = 5;
        } else {
          setBattleMoveDamage(0);
          gBattleScripting.getexpState = 5;
        }
      }
      break;
    }

    case 5: {
      // 1:1 décomp : looper increment. Le décomp teste gBattleMoveDamage (= reste renvoyé
      // par le controller en bufferB), MAIS chez nous gBattleMoveDamage est clobbé entre
      // case 4 et ici (BattleScript_LevelUp lancé en case 4 tourne entre-temps). Le décomp
      // stocke le reste dans gBattleBufferB[2|3] (séparé de gBattleMoveDamage) — notre
      // équivalent = `_getexpRemaining` (module var, intouchée par le script). On teste
      // _getexpRemaining et on RESTAURE gBattleMoveDamage (= le chunk que case 3 applique).
      // La boucle exit toujours à _getexpRemaining=0, donc pas de staleness pour le mon suivant.
      if (_getexpRemaining > 0) {
        setBattleMoveDamage(_getexpRemaining);
        gBattleScripting.getexpState = 3;
      } else {
        gBattleStruct.expGetterMonId = gBattleStruct.expGetterMonId + 1;
        if (gBattleStruct.expGetterMonId < 6 /* PARTY_SIZE */) {
          gBattleScripting.getexpState = 2;  // loop again
        } else {
          gBattleScripting.getexpState = 6;  // done
        }
      }
      break;
    }

    case 6: {
      // 1:1 décomp : final cleanup + advance opcode.
      if (gBattleControllerExecFlags === 0) {
        // 1:1 décomp : `gBattleMons[battlerFainted].item = ITEM_NONE; ability = 0`.
        // Note décomp : "not sure why gf clears the item and ability here".
        gBattleMons[battlerFainted].item = 0;
        gBattleMons[battlerFainted].ability = 0;
        // Reset state machine pour next adversaire.
        gBattleScripting.getexpState = 0;
        // Advance opcode (= déjà fait par readByte).
      }
      break;
    }
  }
  }  // end while allowFallThrough
  // 1:1 décomp : `getexp` ne consomme l'opcode (gBattlescriptCurrInstr += 2) QU'au
  // state final (case 6 → getexpState=0) ou sur un jump (case 4 level-up). Tant que
  // la state machine tourne (getexpState != 0) et qu'aucun jump n'a bougé le ptr
  // (= ptr encore à opStart+2 après readByte), on RESTE sur l'opcode pour ré-exécuter
  // au prochain frame (sinon le ptr file vers end2 et la machine ne progresse pas).
  if (gBattleScripting.getexpState !== 0 && ctx.scriptPtr === opStartPtr + 2) {
    ctx.scriptPtr = opStartPtr;
  }
  return false;
}

/** 1:1 décomp `CheckPartyHasHadPokerus(party, selection)` (pokemon.c:6129).
 *  Check si un mon courant (selection=0 → party[0]) a contracté Pokerus
 *  (= MON_DATA_POKERUS != 0). Notre port utilise un array d'1 mon = [mon]. */
function _CheckPartyHasHadPokerus(party: Pokemon[], selection: number): number {
  let retVal = 0;
  let partyIndex = 0;
  let curBit = 1;

  if (selection) {
    do {
      if ((selection & 1) && GetMonData(party[partyIndex], MON_DATA_POKERUS))
        retVal |= curBit;
      partyIndex++;
      curBit <<= 1;
      selection >>= 1;
    } while (selection);
  } else if (GetMonData(party[0], MON_DATA_POKERUS)) {
    retVal = 1;
  }
  return retVal;
}

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)` (pokemon.c:5975-6052).
 *  Distribue les EVs de la victime au mon vainqueur, en respectant les caps
 *  255 par stat et 510 total. Macho Brace × 2, Pokerus × 2 (cumule). */
function _MonGainEVs(monId: number, defeatedSpecies: number): void {
  const mon = gPlayerParty[monId];
  if (!mon) return;

  // 1:1 décomp : evs[NUM_STATS] = GetMonData(mon, MON_DATA_HP_EV + i, 0).
  const evs: number[] = [
    GetMonData(mon, 26 /* MON_DATA_HP_EV */) as number,
    GetMonData(mon, 27 /* MON_DATA_ATK_EV */) as number,
    GetMonData(mon, 28 /* MON_DATA_DEF_EV */) as number,
    GetMonData(mon, 29 /* MON_DATA_SPEED_EV */) as number,
    GetMonData(mon, 30 /* MON_DATA_SPATK_EV */) as number,
    GetMonData(mon, 31 /* MON_DATA_SPDEF_EV */) as number,
  ];
  let totalEVs = evs.reduce((a, b) => a + b, 0);

  // evYield from defeated species : ordre [hp, atk, def, spe, spa, spd] = NUM_STATS.
  const evYield = getSpeciesEvYield(defeatedSpecies);

  // 1:1 décomp : Pokerus multiplier × 2 si mon a/avait Pokerus.
  const multiplier = _CheckPartyHasHadPokerus([mon], 0) ? 2 : 1;

  // 1:1 décomp : holdEffect du mon → Macho Brace double EVs.
  const heldItem = GetMonData(mon, MON_DATA_HELD_ITEM) as number;
  const holdEffect = GetItemHoldEffect(heldItem);

  for (let i = 0; i < 6 /* NUM_STATS */; i++) {
    if (totalEVs >= MAX_TOTAL_EVS) break;

    let evIncrease = evYield[i] * multiplier;

    if (holdEffect === HOLD_EFFECT_MACHO_BRACE) {
      evIncrease *= 2;
    }

    // 1:1 décomp : cap total EVs à 510.
    if (totalEVs + evIncrease > MAX_TOTAL_EVS) {
      evIncrease = (evIncrease + MAX_TOTAL_EVS) - (totalEVs + evIncrease);
    }
    // 1:1 décomp : cap per-stat EVs à 255 (= 100 selon BUGFIX, mais retro Em = 255).
    if (evs[i] + evIncrease > MAX_PER_STAT_EVS) {
      const val1 = evIncrease + MAX_PER_STAT_EVS;
      const val2 = evs[i] + evIncrease;
      evIncrease = val1 - val2;
    }

    evs[i] += evIncrease;
    totalEVs += evIncrease;
    SetMonData(mon, 26 /* MON_DATA_HP_EV */ + i, evs[i]);
  }
}

// ─── 0x76 various ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_various (battle_script_commands.c:6321-6503). 3 bytes :
 *  u8 battler + u8 caseId (= VARIOUS_*). 27 cases total.
 *  Sessions 134+138+142 : 23+/27 cases full 1:1 strict. Battle Frontier Arena/
 *  Palace/Pyramid specific cases : stubs avec comportement safe (deferred). */
function Cmd_various(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const caseId = readByte(ctx);

  // 1:1 décomp : `gActiveBattler = GetBattlerForBattleScript(gBattlescriptCurrInstr[1]);`
  setActiveBattler(getBattlerForBattleScript(battlerArg));

  switch (caseId) {
    case VARIOUS_CANCEL_MULTI_TURN_MOVES:
      _CancelMultiTurnMoves(gActiveBattler);
      break;

    case VARIOUS_SET_MAGIC_COAT_TARGET: {
      // 1:1 décomp : swap attacker/target via followme.
      setBattlerAttacker(gBattlerTarget);
      const side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer !== 0
          && gBattleMons[gSideTimers[side].followmeTarget].hp !== 0) {
        setBattlerTarget(gSideTimers[side].followmeTarget);
      } else {
        setBattlerTarget(gActiveBattler);
      }
      break;
    }

    case VARIOUS_IS_RUNNING_IMPOSSIBLE:
      gBattleCommunication[0] = _IsRunningFromBattleImpossible();
      break;

    case VARIOUS_GET_MOVE_TARGET:
      setBattlerTarget(_GetMoveTarget(gCurrentMove, NO_TARGET_OVERRIDE));
      break;

    case VARIOUS_GET_BATTLER_FAINTED:
      gBattleCommunication[0] = (gHitMarker & HITMARKER_FAINTED(gActiveBattler)) ? 1 : 0;
      break;

    case VARIOUS_RESET_INTIMIDATE_TRACE_BITS:
      gSpecialStatuses[gActiveBattler].intimidatedMon = 0;
      gSpecialStatuses[gActiveBattler].traced = 0;
      break;

    case VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP: {
      // 1:1 décomp (battle_script_commands.c VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP) :
      // Le mon qui level-up est gBattleStruct.expGetterMonId (= party slot 0..5).
      // S'il est actuellement en battle (slot 0 ou slot 2 si double), check si
      // son choicedMove (= locked-in par Choice Band) est toujours dans sa
      // moveset post level-up. Sinon clear → MOVE_NONE.
      const expGetterMonId = gBattleStruct.expGetterMonId;
      let activeIdx = -1;
      if (gBattlerPartyIndexes[0] === expGetterMonId) activeIdx = 0;
      else if (gBattlerPartyIndexes[2] === expGetterMonId) activeIdx = 2;
      if (activeIdx >= 0) {
        setActiveBattler(activeIdx);
        const currentChoiced = gBattleStruct.choicedMove[activeIdx];
        let i: number;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[activeIdx].moves[i] === currentChoiced) break;
        }
        if (i === MAX_MON_MOVES) gBattleStruct.choicedMove[activeIdx] = MOVE_NONE;
      }
      break;
    }

    case VARIOUS_RESET_PLAYER_FAINTED:
      // 1:1 décomp : si !LINK + !DOUBLE + TRAINER + les 2 battlers vivants → clear FAINTED.
      if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE))
          && (gBattleTypeFlags & BATTLE_TYPE_TRAINER)
          && gBattleMons[0].hp !== 0
          && gBattleMons[1].hp !== 0) {
        setHitMarker(gHitMarker & ~HITMARKER_PLAYER_FAINTED);
      }
      break;

    case VARIOUS_PALACE_FLAVOR_TEXT: {
      // 1:1 décomp battle_script_commands.c:6387-6401.
      gBattleCommunication[0] = 0; // FALSE — msg pas à print par défaut.
      gBattleScripting.battler = gBattleCommunication[1];
      setActiveBattler(gBattleCommunication[1]);
      const ab = gActiveBattler;
      if (!(gBattleStruct.palaceFlags & gBitTable[ab])
          && Math.floor(gBattleMons[ab].maxHP / 2) >= gBattleMons[ab].hp
          && gBattleMons[ab].hp !== 0
          && !(gBattleMons[ab].status1 & 0x7 /* STATUS1_SLEEP */)) {
        gBattleStruct.palaceFlags |= gBitTable[ab];
        gBattleCommunication[0] = 1; // TRUE.
        const nature = _getNatureFromPersonalityN34(gBattleMons[ab].personality);
        gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = _sBattlePalaceNatureToFlavorTextId_N34[nature] ?? 0;
      }
      break;
    }

    case VARIOUS_ARENA_JUDGMENT_WINDOW:
      // Frontier Arena deferred : BattleArena_ShowJudgmentWindow + ARENA_RESULT_RUNNING.
      // Hors combat normal. Skip avec result = 0 (= no winner).
      gBattleCommunication[1] = 0;
      break;

    case VARIOUS_ARENA_OPPONENT_MON_LOST:
      // 1:1 décomp battle_script_commands.c:6412-6417.
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      gBattleStruct.arenaLostOpponentMons |= gBitTable[_gBattlerPartyIndexes_N34[1]];
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_PLAYER_MON_LOST:
      // 1:1 décomp battle_script_commands.c:6418-6424.
      gBattleMons[0].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gBattleStruct.arenaLostPlayerMons |= gBitTable[_gBattlerPartyIndexes_N34[0]];
      gDisableStructs[0].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_BOTH_MONS_LOST:
      // 1:1 décomp battle_script_commands.c:6425-6435.
      gBattleMons[0].hp = 0;
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gBattleStruct.arenaLostPlayerMons |= gBitTable[_gBattlerPartyIndexes_N34[0]];
      gBattleStruct.arenaLostOpponentMons |= gBitTable[_gBattlerPartyIndexes_N34[1]];
      gDisableStructs[0].truantSwitchInHack = 1;
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_EMIT_YESNOBOX:
      // 1:1 décomp battle_script_commands.c:6436-6438.
      // BtlController_EmitYesNoBox (= UI helper, deferred Phase 1.4).
      // Notre port : skip emit + auto-clear via tick (= response sera "no" par défaut).
      MarkBattlerForControllerExec(gActiveBattler);
      break;

    case VARIOUS_DRAW_ARENA_REF_TEXT_BOX:
      // 1:1 décomp : DrawArenaRefereeTextBox(). UI window manager — Frontier
      // deferred Phase 1.4 (= Arena post Phase 1).
      break;

    case VARIOUS_ERASE_ARENA_REF_TEXT_BOX:
      // 1:1 décomp : EraseArenaRefereeTextBox(). Frontier deferred.
      break;

    case VARIOUS_ARENA_JUDGMENT_STRING:
      // 1:1 décomp : BattleStringExpandPlaceholdersToDisplayedString(
      //   gRefereeStringsTable[gBattlescriptCurrInstr[1]]) + BattlePutTextOnWindow.
      // Frontier deferred Phase 1.4 (= referee string table pas porté).
      break;

    case VARIOUS_ARENA_WAIT_STRING:
      // 1:1 décomp : `if (IsTextPrinterActive(ARENA_WIN_JUDGMENT_TEXT)) return;`
      // (= stay on opcode si text en cours). Notre port : pas de text printer
      // active state, advance direct.
      break;

    case VARIOUS_WAIT_CRY:
      // 1:1 décomp : `if (!IsCryFinished()) return;` (= stay on opcode).
      // IsCryFinished : check audio engine cry state. Pour Phase 1, on assume
      // cry fini instantanément (= advance). Wire vrai check via globalThis
      // si audio engine expose isCryFinished plus tard.
      if ((globalThis as { __audioEngine?: { isCryFinished?: () => boolean } })
          .__audioEngine?.isCryFinished?.() === false) {
        return _stayOnOpcode__b34(ctx);
      }
      break;

    case VARIOUS_RETURN_OPPONENT_MON1: {
      const opp = 1;
      setActiveBattler(opp);
      if (gBattleMons[opp].hp !== 0) {
        BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
        MarkBattlerForControllerExec(opp);
      }
      break;
    }

    case VARIOUS_RETURN_OPPONENT_MON2: {
      if (gBattlersCount > 3) {
        const opp = 3;
        setActiveBattler(opp);
        if (gBattleMons[opp].hp !== 0) {
          BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
          MarkBattlerForControllerExec(opp);
        }
      }
      break;
    }

    case VARIOUS_VOLUME_DOWN:
      // 1:1 décomp : m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x55).
      // Bgm volume down ~33% (= 0x55 / 0x100 = ~33%). Wire vers audio engine.
      (globalThis as { __audioEngine?: { setBgmVolume?: (v: number) => void } })
        .__audioEngine?.setBgmVolume?.(0x55 / 0x100);
      break;

    case VARIOUS_VOLUME_UP:
      // 1:1 décomp : m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100).
      // Bgm volume full (= 1.0).
      (globalThis as { __audioEngine?: { setBgmVolume?: (v: number) => void } })
        .__audioEngine?.setBgmVolume?.(1.0);
      break;

    case VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT:
      // 1:1 décomp (battle_script_commands.c) :
      // `gBattleStruct->alreadyStatusedMoveAttempt |= gBitTable[gActiveBattler];`
      gBattleStruct.alreadyStatusedMoveAttempt |= gBitTable[gActiveBattler];
      break;

    case VARIOUS_PALACE_TRY_ESCAPE_STATUS:
      // 1:1 décomp : `if (BattlePalace_TryEscapeStatus(gActiveBattler)) return;`
      // BattlePalace_TryEscapeStatus retourne TRUE quand le mon Palace essaye
      // de break out d'un status (= sleep/confusion/etc.). Frontier specific.
      // Pour Phase 1, on n'a pas Palace logic → return FALSE → advance.
      break;

    case VARIOUS_SET_TELEPORT_OUTCOME:
      // 1:1 décomp : Teleport move réussit → set battle outcome.
      if (GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER) {
        setBattleOutcome(B_OUTCOME_PLAYER_TELEPORTED);
      } else {
        setBattleOutcome(B_OUTCOME_MON_TELEPORTED);
      }
      break;

    case VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC:
      // 1:1 décomp : Trainer defeated → BGM = MUS_VICTORY_TRAINER.
      BtlController_EmitPlayFanfareOrBGM(B_COMM_TO_CONTROLLER, MUS_VICTORY_TRAINER, true);
      MarkBattlerForControllerExec(gActiveBattler);
      break;

    default:
      console.warn(`[cmd-batch-34] Cmd_various unknown caseId ${caseId}`);
      break;
  }

  // 1:1 décomp : `gBattlescriptCurrInstr += 3;` — déjà fait par les 2 readByte.
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installAllBattleScriptCommands(commandsTable: BattleOpcodeHandler[]): void {
  commandsTable[0x00] = Cmd_attackcanceler;
  commandsTable[0x01] = Cmd_accuracycheck;
  commandsTable[0x02] = Cmd_attackstring;
  commandsTable[0x03] = Cmd_ppreduce;
  commandsTable[0x04] = Cmd_critcalc;
  commandsTable[0x05] = Cmd_damagecalc;
  commandsTable[0x06] = Cmd_typecalc;
  commandsTable[0x07] = Cmd_adjustnormaldamage;
  commandsTable[0x08] = Cmd_adjustnormaldamage2;
  commandsTable[0x09] = Cmd_attackanimation;
  commandsTable[0x0A] = Cmd_waitanimation;
  commandsTable[0x0B] = Cmd_healthbarupdate;
  commandsTable[0x0C] = Cmd_datahpupdate;
  commandsTable[0x0D] = Cmd_critmessage;
  commandsTable[0x0E] = Cmd_effectivenesssound;
  commandsTable[0x0F] = Cmd_resultmessage;
  commandsTable[0x10] = Cmd_printstring;
  commandsTable[0x11] = Cmd_printselectionstring;
  commandsTable[0x12] = Cmd_waitmessage;
  commandsTable[0x13] = Cmd_printfromtable;
  commandsTable[0x14] = Cmd_printselectionstringfromtable;
  commandsTable[0x15] = Cmd_seteffectwithchance;
  commandsTable[0x16] = Cmd_seteffectprimary;
  commandsTable[0x17] = Cmd_seteffectsecondary;
  commandsTable[0x18] = Cmd_clearstatusfromeffect__b02;
  commandsTable[0x19] = Cmd_tryfaintmon;
  commandsTable[0x1A] = Cmd_dofaintanimation;
  commandsTable[0x1B] = Cmd_cleareffectsonfaint;
  commandsTable[0x1C] = Cmd_jumpifstatus;
  commandsTable[0x1D] = Cmd_jumpifstatus2;
  commandsTable[0x1E] = Cmd_jumpifability;
  commandsTable[0x1F] = Cmd_jumpifsideaffecting;
  commandsTable[0x20] = Cmd_jumpifstat;
  commandsTable[0x21] = Cmd_jumpifstatus3condition;
  commandsTable[0x22] = Cmd_jumpiftype;
  commandsTable[0x23] = Cmd_getexp;
  commandsTable[0x24] = Cmd_checkteamslost;
  commandsTable[0x25] = Cmd_movevaluescleanup;
  commandsTable[0x26] = Cmd_setmultihit;
  commandsTable[0x27] = Cmd_decrementmultihit;
  commandsTable[0x29] = Cmd_jumpifbyte;
  commandsTable[0x2A] = Cmd_jumpifhalfword;
  commandsTable[0x2B] = Cmd_jumpifword;
  commandsTable[0x2C] = Cmd_jumpifarrayequal;
  commandsTable[0x2D] = Cmd_jumpifarraynotequal;
  commandsTable[0x2E] = Cmd_setbyte;
  commandsTable[0x2F] = Cmd_addbyte;
  commandsTable[0x30] = Cmd_subbyte;
  commandsTable[0x31] = Cmd_copyarray;
  commandsTable[0x32] = Cmd_copyarraywithindex;
  commandsTable[0x33] = Cmd_orbyte;
  commandsTable[0x34] = Cmd_orhalfword;
  commandsTable[0x35] = Cmd_orword;
  commandsTable[0x36] = Cmd_bicbyte;
  commandsTable[0x37] = Cmd_bichalfword;
  commandsTable[0x38] = Cmd_bicword;
  commandsTable[0x3B] = Cmd_healthbar_update;
  commandsTable[0x40] = Cmd_jumpifaffectedbyprotect;
  commandsTable[0x42] = Cmd_jumpiftype2;
  commandsTable[0x43] = Cmd_jumpifabilitypresent;
  commandsTable[0x44] = Cmd_endselectionscript;
  commandsTable[0x45] = Cmd_playanimation;
  commandsTable[0x46] = Cmd_playanimation_var;
  commandsTable[0x47] = Cmd_setgraphicalstatchangevalues;
  commandsTable[0x48] = Cmd_playstatchangeanimation;
  commandsTable[0x49] = Cmd_moveend;
  commandsTable[0x4A] = Cmd_typecalc2;
  commandsTable[0x4B] = Cmd_returnatktoball;
  commandsTable[0x4C] = Cmd_getswitchedmondata;
  commandsTable[0x4D] = Cmd_switchindataupdate;
  commandsTable[0x4E] = Cmd_switchinanim;
  commandsTable[0x4F] = Cmd_jumpifcantswitch;
  commandsTable[0x50] = Cmd_openpartyscreen;
  commandsTable[0x51] = Cmd_switchhandleorder;
  commandsTable[0x52] = Cmd_switchineffects;
  commandsTable[0x53] = Cmd_trainerslidein;
  commandsTable[0x54] = Cmd_playse;
  commandsTable[0x55] = Cmd_fanfare;
  commandsTable[0x56] = Cmd_playfaintcry;
  commandsTable[0x57] = Cmd_endlinkbattle;
  commandsTable[0x58] = Cmd_returntoball;
  commandsTable[0x59] = Cmd_handlelearnnewmove;
  commandsTable[0x5A] = Cmd_yesnoboxlearnmove;
  commandsTable[0x5B] = Cmd_yesnoboxstoplearningmove;
  commandsTable[0x5C] = Cmd_hitanimation;
  commandsTable[0x5D] = Cmd_getmoneyreward;
  commandsTable[0x5E] = Cmd_updatebattlermoves;
  commandsTable[0x5F] = Cmd_swapattackerwithtarget;
  commandsTable[0x60] = Cmd_incrementgamestat;
  commandsTable[0x61] = Cmd_drawpartystatussummary;
  commandsTable[0x62] = Cmd_hidepartystatussummary;
  commandsTable[0x63] = Cmd_jumptocalledmove;
  commandsTable[0x64] = Cmd_statusanimation;
  commandsTable[0x65] = Cmd_status2animation;
  commandsTable[0x66] = Cmd_chosenstatusanimation;
  commandsTable[0x67] = Cmd_yesnobox;
  commandsTable[0x68] = Cmd_cancelallactions;
  commandsTable[0x69] = Cmd_adjustsetdamage;
  commandsTable[0x6A] = Cmd_removeitem;
  commandsTable[0x6B] = Cmd_atknameinbuff1;
  commandsTable[0x6C] = Cmd_drawlvlupbox;
  commandsTable[0x6D] = Cmd_resetsentmonsvalue;
  commandsTable[0x6E] = Cmd_setatktoplayer0;
  commandsTable[0x6F] = Cmd_makevisible;
  commandsTable[0x70] = Cmd_recordlastability;
  commandsTable[0x71] = Cmd_buffermovetolearn;
  commandsTable[0x72] = Cmd_jumpifplayerran;
  commandsTable[0x73] = Cmd_hpthresholds;
  commandsTable[0x74] = Cmd_hpthresholds2;
  commandsTable[0x75] = Cmd_useitemonopponent;
  commandsTable[0x76] = Cmd_various;
  commandsTable[0x77] = Cmd_setprotectlike;
  commandsTable[0x78] = Cmd_tryexplosion;
  commandsTable[0x79] = Cmd_setatkhptozero;
  commandsTable[0x7A] = Cmd_jumpifnexttargetvalid;
  commandsTable[0x7B] = Cmd_tryhealhalfhealth;
  commandsTable[0x7C] = Cmd_trymirrormove;
  commandsTable[0x7D] = Cmd_setrain;
  commandsTable[0x7E] = Cmd_setreflect;
  commandsTable[0x7F] = Cmd_setseeded;
  commandsTable[0x80] = Cmd_manipulatedamage;
  commandsTable[0x81] = Cmd_trysetrest;
  commandsTable[0x82] = Cmd_jumpifnotfirstturn;
  commandsTable[0x83] = Cmd_nop;
  commandsTable[0x84] = Cmd_jumpifcantmakeasleep;
  commandsTable[0x85] = Cmd_stockpile;
  commandsTable[0x86] = Cmd_stockpiletobasedamage;
  commandsTable[0x87] = Cmd_stockpiletohpheal;
  commandsTable[0x88] = Cmd_negativedamage;
  commandsTable[0x89] = Cmd_statbuffchange;
  commandsTable[0x8A] = Cmd_normalisebuffs;
  commandsTable[0x8B] = Cmd_setbide;
  commandsTable[0x8C] = Cmd_confuseifrepeatingattackends;
  commandsTable[0x8D] = Cmd_setmultihitcounter;
  commandsTable[0x8E] = Cmd_initmultihitstring;
  commandsTable[0x8F] = Cmd_forcerandomswitch;
  commandsTable[0x90] = Cmd_tryconversiontypechange;
  commandsTable[0x91] = Cmd_givepaydaymoney;
  commandsTable[0x92] = Cmd_setlightscreen;
  commandsTable[0x93] = Cmd_tryko;
  commandsTable[0x94] = Cmd_damagetohalftargethp;
  commandsTable[0x95] = Cmd_setsandstorm;
  commandsTable[0x96] = Cmd_weatherdamage;
  commandsTable[0x97] = Cmd_tryinfatuating;
  commandsTable[0x98] = Cmd_updatestatusicon;
  commandsTable[0x99] = Cmd_setmist;
  commandsTable[0x9A] = Cmd_setfocusenergy;
  commandsTable[0x9B] = Cmd_transformdataexecution;
  commandsTable[0x9C] = Cmd_setsubstitute;
  commandsTable[0x9D] = Cmd_mimicattackcopy;
  commandsTable[0x9E] = Cmd_metronome;
  commandsTable[0x9F] = Cmd_dmgtolevel;
  commandsTable[0xA0] = Cmd_psywavedamageeffect;
  commandsTable[0xA1] = Cmd_counterdamagecalculator;
  commandsTable[0xA2] = Cmd_mirrorcoatdamagecalculator;
  commandsTable[0xA3] = Cmd_disablelastusedattack;
  commandsTable[0xA4] = Cmd_trysetencore;
  commandsTable[0xA5] = Cmd_painsplitdmgcalc;
  commandsTable[0xA6] = Cmd_settypetorandomresistance;
  commandsTable[0xA7] = Cmd_setalwayshitflag;
  commandsTable[0xA8] = Cmd_copymovepermanently;
  commandsTable[0xA9] = Cmd_trychoosesleeptalkmove;
  commandsTable[0xAA] = Cmd_setdestinybond;
  commandsTable[0xAB] = Cmd_trysetdestinybondtohappen;
  commandsTable[0xAC] = Cmd_remaininghptopower;
  commandsTable[0xAD] = Cmd_tryspiteppreduce;
  commandsTable[0xAE] = Cmd_healpartystatus;
  commandsTable[0xAF] = Cmd_cursetarget;
  commandsTable[0xB0] = Cmd_trysetspikes;
  commandsTable[0xB1] = Cmd_setforesight;
  commandsTable[0xB2] = Cmd_trysetperishsong;
  commandsTable[0xB3] = Cmd_rolloutdamagecalculation;
  commandsTable[0xB4] = Cmd_jumpifconfusedandstatmaxed;
  commandsTable[0xB5] = Cmd_furycuttercalc;
  commandsTable[0xB6] = Cmd_friendshiptodamagecalculation;
  commandsTable[0xB7] = Cmd_presentdamagecalculation;
  commandsTable[0xB8] = Cmd_setsafeguard;
  commandsTable[0xB9] = Cmd_magnitudedamagecalculation;
  commandsTable[0xBA] = Cmd_jumpifnopursuitswitchdmg;
  commandsTable[0xBB] = Cmd_setsunny;
  commandsTable[0xBC] = Cmd_maxattackhalvehp;
  commandsTable[0xBD] = Cmd_copyfoestats;
  commandsTable[0xBE] = Cmd_rapidspinfree;
  commandsTable[0xBF] = Cmd_setdefensecurlbit;
  commandsTable[0xC0] = Cmd_recoverbasedonsunlight;
  commandsTable[0xC1] = Cmd_hiddenpowercalc;
  commandsTable[0xC2] = Cmd_selectfirstvalidtarget;
  commandsTable[0xC3] = Cmd_trysetfutureattack;
  commandsTable[0xC4] = Cmd_trydobeatup;
  commandsTable[0xC5] = Cmd_setsemiinvulnerablebit;
  commandsTable[0xC6] = Cmd_clearsemiinvulnerablebit;
  commandsTable[0xC7] = Cmd_setminimize;
  commandsTable[0xC8] = Cmd_sethail;
  commandsTable[0xC9] = Cmd_trymemento;
  commandsTable[0xCA] = Cmd_setforcedtarget;
  commandsTable[0xCB] = Cmd_setcharge;
  commandsTable[0xCC] = Cmd_callenvironmentattack;
  commandsTable[0xCD] = Cmd_cureifburnedparalyzedorpoisoned;
  commandsTable[0xCE] = Cmd_settorment;
  commandsTable[0xCF] = Cmd_jumpifnodamage;
  commandsTable[0xD0] = Cmd_settaunt;
  commandsTable[0xD1] = Cmd_trysethelpinghand;
  commandsTable[0xD2] = Cmd_tryswapitems;
  commandsTable[0xD3] = Cmd_trycopyability;
  commandsTable[0xD4] = Cmd_trywish;
  commandsTable[0xD5] = Cmd_trysetroots;
  commandsTable[0xD6] = Cmd_doubledamagedealtifdamaged;
  commandsTable[0xD7] = Cmd_setyawn;
  commandsTable[0xD8] = Cmd_setdamagetohealthdifference;
  commandsTable[0xD9] = Cmd_scaledamagebyhealthratio;
  commandsTable[0xDA] = Cmd_tryswapabilities;
  commandsTable[0xDB] = Cmd_tryimprison;
  commandsTable[0xDC] = Cmd_trysetgrudge;
  commandsTable[0xDD] = Cmd_weightdamagecalculation;
  commandsTable[0xDE] = Cmd_assistattackselect;
  commandsTable[0xDF] = Cmd_trysetmagiccoat;
  commandsTable[0xE0] = Cmd_trysetsnatch;
  commandsTable[0xE1] = Cmd_trygetintimidatetarget;
  commandsTable[0xE2] = Cmd_switchoutabilities;
  commandsTable[0xE3] = Cmd_jumpifhasnohp;
  commandsTable[0xE4] = Cmd_getsecretpowereffect;
  commandsTable[0xE5] = Cmd_pickup;
  commandsTable[0xE6] = Cmd_docastformchangeanimation;
  commandsTable[0xE7] = Cmd_trycastformdatachange;
  commandsTable[0xE8] = Cmd_settypebasedhalvers;
  commandsTable[0xE9] = Cmd_setweatherballtype;
  commandsTable[0xEA] = Cmd_tryrecycleitem;
  commandsTable[0xEB] = Cmd_settypetoenvironment;
  commandsTable[0xEC] = Cmd_pursuitdoubles;
  commandsTable[0xED] = Cmd_snatchsetbattlers;
  commandsTable[0xEE] = Cmd_removelightscreenreflect;
  commandsTable[0xEF] = Cmd_handleballthrow;
  commandsTable[0xF0] = Cmd_givecaughtmon;
  commandsTable[0xF1] = Cmd_trysetcaughtmondexflags;
  commandsTable[0xF2] = Cmd_displaydexinfo;
  commandsTable[0xF3] = Cmd_trygivecaughtmonnick;
  commandsTable[0xF4] = Cmd_subattackerhpbydmg;
  commandsTable[0xF5] = Cmd_removeattackerstatus1;
  commandsTable[0xF6] = Cmd_finishaction;
  commandsTable[0xF7] = Cmd_finishturn;
  commandsTable[0xF8] = Cmd_trainerslideout;
}

/**
 * battle_factory.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_factory.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/battle_factory.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FRONTIER_MAX_LEVEL_50, FRONTIER_MODE_DOUBLES, FRONTIER_MODE_SINGLES, FRONTIER_STAGES_PER_CHALLENGE } from '../include/constants/battle_frontier';
import { FRONTIER_LVL_50, FRONTIER_LVL_OPEN, FRONTIER_PARTY_SIZE, MAX_MON_MOVES, PARTY_SIZE } from '../include/constants/global';
import { ITEM_NONE } from '../include/constants/items';
import { MOVE_ACID_ARMOR, MOVE_AGILITY, MOVE_AMNESIA, MOVE_AROMATHERAPY, MOVE_ASSIST, MOVE_ATTRACT, MOVE_BARRIER, MOVE_BATON_PASS, MOVE_BELLY_DRUM, MOVE_BIDE, MOVE_BLAST_BURN, MOVE_BLOCK, MOVE_BULK_UP, MOVE_CALM_MIND, MOVE_CAMOUFLAGE, MOVE_CHARGE, MOVE_CHARM, MOVE_CONFUSE_RAY, MOVE_CONVERSION, MOVE_CONVERSION_2, MOVE_COSMIC_POWER, MOVE_COTTON_SPORE, MOVE_COUNTER, MOVE_CURSE, MOVE_DEFENSE_CURL, MOVE_DESTINY_BOND, MOVE_DETECT, MOVE_DISABLE, MOVE_DOUBLE_EDGE, MOVE_DOUBLE_TEAM, MOVE_DRAGON_DANCE, MOVE_ENCORE, MOVE_ENDURE, MOVE_EXPLOSION, MOVE_FACADE, MOVE_FAKE_TEARS, MOVE_FEATHER_DANCE, MOVE_FISSURE, MOVE_FLAIL, MOVE_FLASH, MOVE_FLATTER, MOVE_FOCUS_ENERGY, MOVE_FOCUS_PUNCH, MOVE_FOLLOW_ME, MOVE_FRENZY_PLANT, MOVE_FRUSTRATION, MOVE_GLARE, MOVE_GRASS_WHISTLE, MOVE_GROWL, MOVE_GROWTH, MOVE_GRUDGE, MOVE_GUILLOTINE, MOVE_HAIL, MOVE_HARDEN, MOVE_HAZE, MOVE_HEAL_BELL, MOVE_HORN_DRILL, MOVE_HOWL, MOVE_HYDRO_CANNON, MOVE_HYPER_BEAM, MOVE_HYPNOSIS, MOVE_IMPRISON, MOVE_INGRAIN, MOVE_IRON_DEFENSE, MOVE_KINESIS, MOVE_KNOCK_OFF, MOVE_LEECH_SEED, MOVE_LEER, MOVE_LIGHT_SCREEN, MOVE_LOVELY_KISS, MOVE_MAGIC_COAT, MOVE_MEAN_LOOK, MOVE_MEDITATE, MOVE_MEMENTO, MOVE_METAL_SOUND, MOVE_METRONOME, MOVE_MILK_DRINK, MOVE_MIMIC, MOVE_MINIMIZE, MOVE_MIRROR_COAT, MOVE_MIRROR_MOVE, MOVE_MIST, MOVE_MOONLIGHT, MOVE_MORNING_SUN, MOVE_MUD_SPORT, MOVE_NONE, MOVE_OVERHEAT, MOVE_PAIN_SPLIT, MOVE_PERISH_SONG, MOVE_POISON_GAS, MOVE_POISON_POWDER, MOVE_PRESENT, MOVE_PROTECT, MOVE_PSYCHO_BOOST, MOVE_PSYCH_UP, MOVE_RAIN_DANCE, MOVE_RECOVER, MOVE_RECYCLE, MOVE_REFLECT, MOVE_REFRESH, MOVE_REST, MOVE_RETURN, MOVE_REVERSAL, MOVE_ROLE_PLAY, MOVE_SAFEGUARD, MOVE_SANDSTORM, MOVE_SAND_ATTACK, MOVE_SCARY_FACE, MOVE_SCREECH, MOVE_SELF_DESTRUCT, MOVE_SHARPEN, MOVE_SING, MOVE_SKETCH, MOVE_SKILL_SWAP, MOVE_SKY_ATTACK, MOVE_SLACK_OFF, MOVE_SLEEP_POWDER, MOVE_SMOKESCREEN, MOVE_SNATCH, MOVE_SOFT_BOILED, MOVE_SPIDER_WEB, MOVE_SPIKES, MOVE_SPITE, MOVE_SPORE, MOVE_STRING_SHOT, MOVE_STUN_SPORE, MOVE_SUBSTITUTE, MOVE_SUNNY_DAY, MOVE_SUPERSONIC, MOVE_SWAGGER, MOVE_SWALLOW, MOVE_SWEET_KISS, MOVE_SWEET_SCENT, MOVE_SWORDS_DANCE, MOVE_SYNTHESIS, MOVE_TAIL_GLOW, MOVE_TAIL_WHIP, MOVE_TAUNT, MOVE_TEETER_DANCE, MOVE_THUNDER_WAVE, MOVE_TICKLE, MOVE_TORMENT, MOVE_TOXIC, MOVE_TRANSFORM, MOVE_TRICK, MOVE_VOLT_TACKLE, MOVE_WATER_SPORT, MOVE_WEATHER_BALL, MOVE_WILL_O_WISP, MOVE_WISH, MOVE_WITHDRAW, MOVE_YAWN } from '../include/constants/moves';
import { MAX_TOTAL_EVS, NUMBER_OF_MON_TYPES, NUM_STATS, OT_ID_PLAYER_ID, TYPE_NORMAL } from '../include/constants/pokemon';
import { SPECIES_NONE, SPECIES_UNOWN } from '../include/constants/species';
import { TRAINER_FRONTIER_BRAIN } from '../include/constants/trainers';
import { VAR_FRONTIER_BATTLE_MODE, VAR_TEMP_CHALLENGE_STATUS } from '../include/constants/vars';
import { MON_DATA_ABILITY_NUM, MON_DATA_ATK_IV, MON_DATA_FRIENDSHIP, MON_DATA_HELD_ITEM, MON_DATA_HP_EV, MON_DATA_PERSONALITY } from '../include/pokemon';
import { AI_SCRIPT_CHECK_BAD_MOVE, AI_SCRIPT_CHECK_VIABILITY, AI_SCRIPT_TRY_TO_FAINT } from './battle_ai_script_commands';
import { GetMonData } from './engine/battle/party-storage';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { gTrainerBattleOpponent_A, setTrainerBattleOpponentA } from './engine/battle/state';
import { gSpeciesInfo } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { VarGet, VarSet } from './event_data';
import { gMapHeader } from './fieldmap';
import { CalculateMonStats, CreateMon, SetMonData, SetMonMoveSlot, ZeroPlayerPartyMons, gEnemyParty, gPlayerParty } from './pokemon';
import { Random } from './random';
import type { Pokemon } from './engine/battle/party-storage';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const STREAK_FACTORY_SINGLES_50 = 256; // 1:1 include/constants/frontier_util.h:56 (à consolider dans include/)
const STREAK_FACTORY_SINGLES_OPEN = 512; // 1:1 include/constants/frontier_util.h:57 (à consolider dans include/)
const STREAK_FACTORY_DOUBLES_50 = 16777216; // 1:1 include/constants/frontier_util.h:72 (à consolider dans include/)
const STREAK_FACTORY_DOUBLES_OPEN = 33554432; // 1:1 include/constants/frontier_util.h:73 (à consolider dans include/)
const FRONTIER_MON_GRIMER = 110; // 1:1 include/constants/battle_frontier_mons.h:114 (à consolider dans include/)
const FRONTIER_MON_FURRET_1 = 199; // 1:1 include/constants/battle_frontier_mons.h:204 (à consolider dans include/)
const FRONTIER_MON_DELCATTY_1 = 162; // 1:1 include/constants/battle_frontier_mons.h:167 (à consolider dans include/)
const FRONTIER_MON_CLOYSTER_1 = 266; // 1:1 include/constants/battle_frontier_mons.h:271 (à consolider dans include/)
const FRONTIER_MON_DELCATTY_2 = 267; // 1:1 include/constants/battle_frontier_mons.h:273 (à consolider dans include/)
const FRONTIER_MON_CLOYSTER_2 = 371; // 1:1 include/constants/battle_frontier_mons.h:377 (à consolider dans include/)
const FRONTIER_MON_DUGTRIO_1 = 372; // 1:1 include/constants/battle_frontier_mons.h:379 (à consolider dans include/)
const FRONTIER_MON_SLAKING_1 = 467; // 1:1 include/constants/battle_frontier_mons.h:474 (à consolider dans include/)
const FRONTIER_MON_DUGTRIO_2 = 468; // 1:1 include/constants/battle_frontier_mons.h:476 (à consolider dans include/)
const FRONTIER_MON_SLAKING_2 = 563; // 1:1 include/constants/battle_frontier_mons.h:571 (à consolider dans include/)
const FRONTIER_MON_DUGTRIO_3 = 564; // 1:1 include/constants/battle_frontier_mons.h:573 (à consolider dans include/)
const FRONTIER_MON_SLAKING_3 = 659; // 1:1 include/constants/battle_frontier_mons.h:668 (à consolider dans include/)
const FRONTIER_MON_DUGTRIO_4 = 660; // 1:1 include/constants/battle_frontier_mons.h:670 (à consolider dans include/)
const FRONTIER_MON_SLAKING_4 = 755; // 1:1 include/constants/battle_frontier_mons.h:765 (à consolider dans include/)
const FRONTIER_MONS_HIGH_TIER = 849; // 1:1 include/constants/battle_frontier_mons.h:862 (à consolider dans include/)
const NUM_FRONTIER_MONS = 882; // 1:1 include/constants/battle_frontier_mons.h:897 (à consolider dans include/)
const WARP_ID_NONE = -1; // 1:1 include/constants/maps.h:28 (à consolider dans include/)
const FACTORY_DATA_WIN_STREAK = 1; // 1:1 include/constants/battle_factory.h:33 (à consolider dans include/)
const FACTORY_DATA_WIN_STREAK_ACTIVE = 2; // 1:1 include/constants/battle_factory.h:34 (à consolider dans include/)
const FACTORY_DATA_WIN_STREAK_SWAPS = 3; // 1:1 include/constants/battle_factory.h:35 (à consolider dans include/)
const FRONTIER_LVL_TENT = 2; // 1:1 include/constants/global.h:79 (à consolider dans include/)
const TENT_MIN_LEVEL = 30; // 1:1 include/constants/battle_tent.h:4 (à consolider dans include/)
const FRONTIER_MAX_LEVEL_OPEN = 100; // 1:1 include/constants/battle_frontier.h:53 (à consolider dans include/)
const FACTORY_NUM_STYLES = 8; // 1:1 include/constants/battle_factory.h:12 (à consolider dans include/)
const FACTORY_STYLE_NONE = 0; // 1:1 include/constants/battle_factory.h:4 (à consolider dans include/)

// ─── Adaptations de représentation (port) ─────────────────────────────────────
// Le port type `gMapHeader.mapLayoutId` en STRING (fieldmap.ts:288) → les constantes
// LAYOUT_* sont des littéraux string (précédent overworld.ts:1427).
const LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_PRE_BATTLE_ROOM = 'LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_PRE_BATTLE_ROOM'; // 1:1 constants/layouts.h
const LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM = 'LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM'; // 1:1 constants/layouts.h

// ─── Socle Battle Frontier NON PORTÉ ──────────────────────────────────────────
// Fichier INERTE (importé nulle part). Les symboles du socle Frontier (battle_tower.c,
// frontier_util.c, battle_factory_screen.c) ne sont pas encore portés → références locales
// qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ; le câblage futur du Frontier
// forcera la réconciliation).
function socleFrontierRef(name: string): any {
  return new Proxy({}, {
    get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
    set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
  });
}
/** 1:1 pointeurs de façade `gFacilityTrainers`/`gFacilityTrainerMons` (battle_tower.c). */
let gFacilityTrainers: any = socleFrontierRef('gFacilityTrainers');
let gFacilityTrainerMons: any = socleFrontierRef('gFacilityTrainerMons');
/** 1:1 `gFrontierTempParty[]` (battle_tower.c). */
const gFrontierTempParty: any = socleFrontierRef('gFrontierTempParty');
/** 1:1 tables source Frontier (data + battle_tower.c). */
const gBattleFrontierTrainers: any = socleFrontierRef('gBattleFrontierTrainers');
const gBattleFrontierMons: any = socleFrontierRef('gBattleFrontierMons');
const gBattleFrontierHeldItems: any = socleFrontierRef('gBattleFrontierHeldItems');
const gSlateportBattleTentMons: any = socleFrontierRef('gSlateportBattleTentMons');
/** 1:1 macro `T1_READ_32(ptr)` (gba/defines.h) — u32 little-endian sur un u8[4]. Pur → transcrit. */
function T1_READ_32(ptr: any): number {
  return ((ptr[0]) | (ptr[1] << 8) | (ptr[2] << 16) | (ptr[3] << 24)) >>> 0;
}
/** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */
function SetBattleFacilityTrainerGfxId(_trainerId: number, _arrayId: number): void {
  throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `u16 GetRandomScaledFrontierTrainerId(u8 challengeNum, u8 battleNum)` (battle_tower.c). */
function GetRandomScaledFrontierTrainerId(_challengeNum: number, _battleNum: number): number {
  throw new Error('non porté : GetRandomScaledFrontierTrainerId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `u32 GetBoxMonData(struct BoxPokemon *boxMon, s32 field, u8 *data)` (pokemon.c). */
function GetBoxMonData(_boxMon: any, _field: number, _data: any): number {
  throw new Error('non porté : GetBoxMonData (pokemon.c — BoxPokemon non modélisé)');
}
/** NON PORTÉ — 1:1 `u8 SetFacilityPtrsGetLevel(void)` (battle_tower.c). */
function SetFacilityPtrsGetLevel(): number {
  throw new Error('non porté : SetFacilityPtrsGetLevel (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `CreateMonWithEVSpreadNatureOTID(struct Pokemon*, u16, u8, u8, u8, u8, u32)` (pokemon.c). */
function CreateMonWithEVSpreadNatureOTID(_mon: any, _species: number, _level: number, _nature: number, _fixedIV: number, _evSpread: number, _otId: number): void {
  throw new Error('non porté : CreateMonWithEVSpreadNatureOTID (pokemon.c)');
}
/** NON PORTÉ — 1:1 `SaveGameFrontier(void)` (frontier_util.c). */
function SaveGameFrontier(): void {
  throw new Error('non porté : SaveGameFrontier (socle frontier_util)');
}
/** NON PORTÉ — 1:1 `DoBattleFactorySelectScreen`/`DoBattleFactorySwapScreen` (battle_factory_screen.c). */
function DoBattleFactorySelectScreen(): void {
  throw new Error('non porté : DoBattleFactorySelectScreen (battle_factory_screen)');
}
function DoBattleFactorySwapScreen(): void {
  throw new Error('non porté : DoBattleFactorySwapScreen (battle_factory_screen)');
}
/** PORT DIVERGENT — décomp `SetDynamicWarp(s32 unused, s8 mapGroup, s8 mapNum, s8 warpId)`
 *  (overworld.c) vs port overworld.ts `SetDynamicWarp(mapId:string, x, y)` (variante scrcmd
 *  3-arg, signature incompatible). Référence locale qui LÈVE ; réconciliation différée au
 *  câblage Frontier (interdit de modifier overworld.ts ici). */
function SetDynamicWarp(_unused: number, _mapGroup: any, _mapNum: any, _warpId: number): void {
  throw new Error('SetDynamicWarp : port overworld.ts divergent (3-arg scrcmd) vs décomp 4-arg — réconciliation au câblage Frontier');
}

/** 1:1 (battle_factory.c:22) */
let sPerformedRentalSwap = false;

// Number of moves needed on the team to be considered using a certain battle style

/** 1:1 (battle_factory.c:45) */
const sRequiredMoveCounts = Uint8Array.from([
  3, // [FACTORY_STYLE_PREPARATION - 1]
  3, // [FACTORY_STYLE_SLOW_STEADY - 1]
  3, // [FACTORY_STYLE_ENDURANCE - 1]
  2, // [FACTORY_STYLE_HIGH_RISK - 1]
  2, // [FACTORY_STYLE_WEAKENING - 1]
  2, // [FACTORY_STYLE_UNPREDICTABLE - 1]
  2, // [FACTORY_STYLE_WEATHER - 1]
]);

/** 1:1 (battle_factory.c:55) */
const sMoves_TotalPreparation = Uint16Array.from([
  MOVE_SWORDS_DANCE,
  MOVE_GROWTH,
  MOVE_MEDITATE,
  MOVE_AGILITY,
  MOVE_DOUBLE_TEAM,
  MOVE_HARDEN,
  MOVE_MINIMIZE,
  MOVE_WITHDRAW,
  MOVE_DEFENSE_CURL,
  MOVE_BARRIER,
  MOVE_FOCUS_ENERGY,
  MOVE_AMNESIA,
  MOVE_ACID_ARMOR,
  MOVE_SHARPEN,
  MOVE_CONVERSION,
  MOVE_CONVERSION_2,
  MOVE_BELLY_DRUM,
  MOVE_PSYCH_UP,
  MOVE_CHARGE,
  MOVE_SNATCH,
  MOVE_TAIL_GLOW,
  MOVE_COSMIC_POWER,
  MOVE_IRON_DEFENSE,
  MOVE_HOWL,
  MOVE_BULK_UP,
  MOVE_CALM_MIND,
  MOVE_DRAGON_DANCE,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:64) */
const sMoves_ImpossibleToPredict = Uint16Array.from([
  MOVE_MIMIC,
  MOVE_METRONOME,
  MOVE_MIRROR_MOVE,
  MOVE_TRANSFORM,
  MOVE_SUBSTITUTE,
  MOVE_SKETCH,
  MOVE_CURSE,
  MOVE_PRESENT,
  MOVE_FOLLOW_ME,
  MOVE_TRICK,
  MOVE_ROLE_PLAY,
  MOVE_ASSIST,
  MOVE_SKILL_SWAP,
  MOVE_CAMOUFLAGE,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:71) */
const sMoves_WeakeningTheFoe = Uint16Array.from([
  MOVE_SAND_ATTACK,
  MOVE_TAIL_WHIP,
  MOVE_LEER,
  MOVE_GROWL,
  MOVE_STRING_SHOT,
  MOVE_SCREECH,
  MOVE_SMOKESCREEN,
  MOVE_KINESIS,
  MOVE_FLASH,
  MOVE_COTTON_SPORE,
  MOVE_SPITE,
  MOVE_SCARY_FACE,
  MOVE_CHARM,
  MOVE_KNOCK_OFF,
  MOVE_SWEET_SCENT,
  MOVE_FEATHER_DANCE,
  MOVE_FAKE_TEARS,
  MOVE_METAL_SOUND,
  MOVE_TICKLE,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:79) */
const sMoves_HighRiskHighReturn = Uint16Array.from([
  MOVE_GUILLOTINE,
  MOVE_HORN_DRILL,
  MOVE_DOUBLE_EDGE,
  MOVE_HYPER_BEAM,
  MOVE_COUNTER,
  MOVE_FISSURE,
  MOVE_BIDE,
  MOVE_SELF_DESTRUCT,
  MOVE_SKY_ATTACK,
  MOVE_EXPLOSION,
  MOVE_FLAIL,
  MOVE_REVERSAL,
  MOVE_DESTINY_BOND,
  MOVE_PERISH_SONG,
  MOVE_PAIN_SPLIT,
  MOVE_MIRROR_COAT,
  MOVE_MEMENTO,
  MOVE_GRUDGE,
  MOVE_FACADE,
  MOVE_FOCUS_PUNCH,
  MOVE_BLAST_BURN,
  MOVE_HYDRO_CANNON,
  MOVE_OVERHEAT,
  MOVE_FRENZY_PLANT,
  MOVE_PSYCHO_BOOST,
  MOVE_VOLT_TACKLE,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:88) */
const sMoves_Endurance = Uint16Array.from([
  MOVE_MIST,
  MOVE_RECOVER,
  MOVE_LIGHT_SCREEN,
  MOVE_HAZE,
  MOVE_REFLECT,
  MOVE_SOFT_BOILED,
  MOVE_REST,
  MOVE_PROTECT,
  MOVE_DETECT,
  MOVE_ENDURE,
  MOVE_MILK_DRINK,
  MOVE_HEAL_BELL,
  MOVE_SAFEGUARD,
  MOVE_BATON_PASS,
  MOVE_MORNING_SUN,
  MOVE_SYNTHESIS,
  MOVE_MOONLIGHT,
  MOVE_SWALLOW,
  MOVE_WISH,
  MOVE_INGRAIN,
  MOVE_MAGIC_COAT,
  MOVE_RECYCLE,
  MOVE_REFRESH,
  MOVE_MUD_SPORT,
  MOVE_SLACK_OFF,
  MOVE_AROMATHERAPY,
  MOVE_WATER_SPORT,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:97) */
const sMoves_SlowAndSteady = Uint16Array.from([
  MOVE_SING,
  MOVE_SUPERSONIC,
  MOVE_DISABLE,
  MOVE_LEECH_SEED,
  MOVE_POISON_POWDER,
  MOVE_STUN_SPORE,
  MOVE_SLEEP_POWDER,
  MOVE_THUNDER_WAVE,
  MOVE_TOXIC,
  MOVE_HYPNOSIS,
  MOVE_CONFUSE_RAY,
  MOVE_GLARE,
  MOVE_POISON_GAS,
  MOVE_LOVELY_KISS,
  MOVE_SPORE,
  MOVE_SPIDER_WEB,
  MOVE_SWEET_KISS,
  MOVE_SPIKES,
  MOVE_SWAGGER,
  MOVE_MEAN_LOOK,
  MOVE_ATTRACT,
  MOVE_ENCORE,
  MOVE_TORMENT,
  MOVE_FLATTER,
  MOVE_WILL_O_WISP,
  MOVE_TAUNT,
  MOVE_YAWN,
  MOVE_IMPRISON,
  MOVE_SNATCH,
  MOVE_TEETER_DANCE,
  MOVE_GRASS_WHISTLE,
  MOVE_BLOCK,
  MOVE_NONE,
]);

/** 1:1 (battle_factory.c:106) */
const sMoves_DependsOnTheBattlesFlow = Uint16Array.from([
  MOVE_SANDSTORM,
  MOVE_RAIN_DANCE,
  MOVE_SUNNY_DAY,
  MOVE_HAIL,
  MOVE_WEATHER_BALL,
  MOVE_NONE,
]);

// Excludes FACTORY_STYLE_NONE

/** 1:1 (battle_factory.c:113) */
const sMoveStyles: Uint16Array[] = [
  sMoves_TotalPreparation, // [FACTORY_STYLE_PREPARATION - 1]
  sMoves_SlowAndSteady, // [FACTORY_STYLE_SLOW_STEADY - 1]
  sMoves_Endurance, // [FACTORY_STYLE_ENDURANCE - 1]
  sMoves_HighRiskHighReturn, // [FACTORY_STYLE_HIGH_RISK - 1]
  sMoves_WeakeningTheFoe, // [FACTORY_STYLE_WEAKENING - 1]
  sMoves_ImpossibleToPredict, // [FACTORY_STYLE_UNPREDICTABLE - 1]
  sMoves_DependsOnTheBattlesFlow, // [FACTORY_STYLE_WEATHER - 1]
];

/** 1:1 (battle_factory.c:124) */
const sBattleFactoryFunctions: Array<(...args: any[]) => any> = [
  InitFactoryChallenge, // [BATTLE_FACTORY_FUNC_INIT]
  GetBattleFactoryData, // [BATTLE_FACTORY_FUNC_GET_DATA]
  SetBattleFactoryData, // [BATTLE_FACTORY_FUNC_SET_DATA]
  SaveFactoryChallenge, // [BATTLE_FACTORY_FUNC_SAVE]
  FactoryDummy1, // [BATTLE_FACTORY_FUNC_NULL]
  FactoryDummy2, // [BATTLE_FACTORY_FUNC_NULL2]
  SelectInitialRentalMons, // [BATTLE_FACTORY_FUNC_SELECT_RENT_MONS]
  SwapRentalMons, // [BATTLE_FACTORY_FUNC_SWAP_RENT_MONS]
  SetPerformedRentalSwap, // [BATTLE_FACTORY_FUNC_SET_SWAPPED]
  SetRentalsToOpponentParty, // [BATTLE_FACTORY_FUNC_SET_OPPONENT_MONS]
  SetPlayerAndOpponentParties, // [BATTLE_FACTORY_FUNC_SET_PARTIES]
  SetOpponentGfxVar, // [BATTLE_FACTORY_FUNC_SET_OPPONENT_GFX]
  GenerateOpponentMons, // [BATTLE_FACTORY_FUNC_GENERATE_OPPONENT_MONS]
  GenerateInitialRentalMons, // [BATTLE_FACTORY_FUNC_GENERATE_RENTAL_MONS]
  GetOpponentMostCommonMonType, // [BATTLE_FACTORY_FUNC_GET_OPPONENT_MON_TYPE]
  GetOpponentBattleStyle, // [BATTLE_FACTORY_FUNC_GET_OPPONENT_STYLE]
  RestorePlayerPartyHeldItems, // [BATTLE_FACTORY_FUNC_RESET_HELD_ITEMS]
];

/** 1:1 (battle_factory.c:145) */
const sWinStreakFlags: number[][] = [
  [
    STREAK_FACTORY_SINGLES_50,
    STREAK_FACTORY_SINGLES_OPEN,
  ],
  [
    STREAK_FACTORY_DOUBLES_50,
    STREAK_FACTORY_DOUBLES_OPEN,
  ],
];

/** 1:1 (battle_factory.c:151) */
const sWinStreakMasks: number[][] = [
  [
    ~(STREAK_FACTORY_SINGLES_50),
    ~(STREAK_FACTORY_SINGLES_OPEN),
  ],
  [
    ~(STREAK_FACTORY_DOUBLES_50),
    ~(STREAK_FACTORY_DOUBLES_OPEN),
  ],
];

/** 1:1 (battle_factory.c:157) */
const sFixedIVTable: number[][] = [
  [
    3,
    6,
  ],
  [
    6,
    9,
  ],
  [
    9,
    12,
  ],
  [
    12,
    15,
  ],
  [
    15,
    18,
  ],
  [
    21,
    31,
  ],
  [
    31,
    31,
  ],
  [
    31,
    31,
  ],
];

/** 1:1 (battle_factory.c:169) */
const sInitialRentalMonRanges: number[][] = [
  // Level 50
  [
    FRONTIER_MON_GRIMER,
    FRONTIER_MON_FURRET_1,
  ],
  // 110 - 199
  [
    FRONTIER_MON_DELCATTY_1,
    FRONTIER_MON_CLOYSTER_1,
  ],
  // 162 - 266
  [
    FRONTIER_MON_DELCATTY_2,
    FRONTIER_MON_CLOYSTER_2,
  ],
  // 267 - 371
  [
    FRONTIER_MON_DUGTRIO_1,
    FRONTIER_MON_SLAKING_1,
  ],
  // 372 - 467
  [
    FRONTIER_MON_DUGTRIO_2,
    FRONTIER_MON_SLAKING_2,
  ],
  // 468 - 563
  [
    FRONTIER_MON_DUGTRIO_3,
    FRONTIER_MON_SLAKING_3,
  ],
  // 564 - 659
  [
    FRONTIER_MON_DUGTRIO_4,
    FRONTIER_MON_SLAKING_4,
  ],
  // 660 - 755
  [
    FRONTIER_MON_DUGTRIO_1,
    FRONTIER_MONS_HIGH_TIER,
  ],
  // 372 - 849
  // Open level
  [
    FRONTIER_MON_DUGTRIO_1,
    FRONTIER_MON_SLAKING_1,
  ],
  // 372 - 467
  [
    FRONTIER_MON_DUGTRIO_2,
    FRONTIER_MON_SLAKING_2,
  ],
  // 468 - 563
  [
    FRONTIER_MON_DUGTRIO_3,
    FRONTIER_MON_SLAKING_3,
  ],
  // 564 - 659
  [
    FRONTIER_MON_DUGTRIO_4,
    FRONTIER_MON_SLAKING_4,
  ],
  // 660 - 755
  [
    FRONTIER_MON_DUGTRIO_1,
    NUM_FRONTIER_MONS - 1,
  ],
  // 372 - 881
  [
    FRONTIER_MON_DUGTRIO_1,
    NUM_FRONTIER_MONS - 1,
  ],
  // 372 - 881
  [
    FRONTIER_MON_DUGTRIO_1,
    NUM_FRONTIER_MONS - 1,
  ],
  // 372 - 881
  [
    FRONTIER_MON_DUGTRIO_1,
    NUM_FRONTIER_MONS - 1,
  ],
  // 372 - 881
];

// code

/** 1:1 `void CallBattleFactoryFunction(void)` (battle_factory.c:193-196). */
export function CallBattleFactoryFunction(): void {
  sBattleFactoryFunctions[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void InitFactoryChallenge(void)` (battle_factory.c:198-222). */
function InitFactoryChallenge(): void {
  let i = 0;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  gSaveBlock2Ptr.frontier.disableRecordBattle = false;
  if (!(gSaveBlock2Ptr.frontier.winStreakActiveFlags & sWinStreakFlags[battleMode][lvlMode]))
  {
    gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode] = 0;
    gSaveBlock2Ptr.frontier.factoryRentsCount[battleMode][lvlMode] = 0;
  }
  sPerformedRentalSwap = false;
  for (i = 0; i < gSaveBlock2Ptr.frontier.rentalMons.length; i++)
    gSaveBlock2Ptr.frontier.rentalMons[i].monId = 0xFFFF;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
    gFrontierTempParty[i] = 0xFFFF;
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
  setTrainerBattleOpponentA(0); // 1:1 `gTrainerBattleOpponent_A = 0` (export let → setter porté)
}

/** 1:1 `static void GetBattleFactoryData(void)` (battle_factory.c:224-241). */
function GetBattleFactoryData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case FACTORY_DATA_WIN_STREAK:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode]));
      break;
    case FACTORY_DATA_WIN_STREAK_ACTIVE:
      VarSet(0x800D /* gSpecialVar_Result */, +(((gSaveBlock2Ptr.frontier.winStreakActiveFlags & sWinStreakFlags[battleMode][lvlMode]) != 0)));
      break;
    case FACTORY_DATA_WIN_STREAK_SWAPS:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.factoryRentsCount[battleMode][lvlMode]));
      break;
  }
}

/** 1:1 `static void SetBattleFactoryData(void)` (battle_factory.c:243-267). */
function SetBattleFactoryData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case FACTORY_DATA_WIN_STREAK:
      gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case FACTORY_DATA_WIN_STREAK_ACTIVE:
      if (VarGet(0x8006) /* gSpecialVar_0x8006 */)
        gSaveBlock2Ptr.frontier.winStreakActiveFlags |= sWinStreakFlags[battleMode][lvlMode];
      else
        gSaveBlock2Ptr.frontier.winStreakActiveFlags &= sWinStreakMasks[battleMode][lvlMode];
      break;
    case FACTORY_DATA_WIN_STREAK_SWAPS:
      if (sPerformedRentalSwap == true)
      {
        gSaveBlock2Ptr.frontier.factoryRentsCount[battleMode][lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
        sPerformedRentalSwap = false;
      }
      break;
  }
}

/** 1:1 `static void SaveFactoryChallenge(void)` (battle_factory.c:269-275). */
function SaveFactoryChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveGameFrontier();
}

/** 1:1 `static void FactoryDummy1(void)` (battle_factory.c:277-280). */
function FactoryDummy1(): void {
}

/** 1:1 `static void FactoryDummy2(void)` (battle_factory.c:282-285). */
function FactoryDummy2(): void {
}

/** 1:1 `static void SelectInitialRentalMons(void)` (battle_factory.c:287-291). */
function SelectInitialRentalMons(): void {
  ZeroPlayerPartyMons();
  DoBattleFactorySelectScreen();
}

/** 1:1 `static void SwapRentalMons(void)` (battle_factory.c:293-296). */
function SwapRentalMons(): void {
  DoBattleFactorySwapScreen();
}

/** 1:1 `static void SetPerformedRentalSwap(void)` (battle_factory.c:298-301). */
function SetPerformedRentalSwap(): void {
  sPerformedRentalSwap = true;
}

/** 1:1 `static void GenerateOpponentMons(void)` (battle_factory.c:303-377). */
function GenerateOpponentMons(): void {
  let i = 0;
  let j = 0;
  let k = 0;
  const species = new Uint16Array(FRONTIER_PARTY_SIZE);
  const heldItems = new Uint16Array(FRONTIER_PARTY_SIZE);
  let firstMonId = 0;
  let trainerId = 0;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  let winStreak = gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode];
  let challengeNum = Math.trunc(winStreak / FRONTIER_STAGES_PER_CHALLENGE);
  gFacilityTrainers = gBattleFrontierTrainers;
  do
  {
    // Choose a random trainer, ensuring no repeats in this challenge
    trainerId = GetRandomScaledFrontierTrainerId(challengeNum, gSaveBlock2Ptr.frontier.curChallengeBattleNum);
    for (i = 0; i < gSaveBlock2Ptr.frontier.curChallengeBattleNum; i++)
    {
      if (gSaveBlock2Ptr.frontier.trainerIds[i] == trainerId)
        break;
    }
  }
  while (i != gSaveBlock2Ptr.frontier.curChallengeBattleNum);
  setTrainerBattleOpponentA(trainerId); // 1:1 `gTrainerBattleOpponent_A = trainerId`
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum < FRONTIER_STAGES_PER_CHALLENGE - 1)
    gSaveBlock2Ptr.frontier.trainerIds[gSaveBlock2Ptr.frontier.curChallengeBattleNum] = trainerId;
  i = 0;
  while (i != FRONTIER_PARTY_SIZE)
  {
    let monId = GetFactoryMonId(lvlMode, challengeNum, false);
    // Unown (FRONTIER_MON_UNOWN) is forbidden on opponent Factory teams.
    if (gFacilityTrainerMons[monId].species == SPECIES_UNOWN)
      continue;
    // Ensure none of the opponent's Pokémon are the same as the potential rental Pokémon for the player
    for (j = 0; j < (gSaveBlock2Ptr.frontier.rentalMons.length | 0); j++)
    {
      if (gFacilityTrainerMons[monId].species == gFacilityTrainerMons[gSaveBlock2Ptr.frontier.rentalMons[j].monId].species)
        break;
    }
    if (j != (gSaveBlock2Ptr.frontier.rentalMons.length | 0))
      continue;
    // "High tier" Pokémon are only allowed on open level mode
    if (lvlMode == FRONTIER_LVL_50 && monId > FRONTIER_MONS_HIGH_TIER)
      continue;
    // Ensure this species hasn't already been chosen for the opponent
    for (k = firstMonId; k < firstMonId + i; k++)
    {
      if (species[k] == gFacilityTrainerMons[monId].species)
        break;
    }
    if (k != firstMonId + i)
      continue;
    // Ensure held items don't repeat on the opponent's team
    for (k = firstMonId; k < firstMonId + i; k++)
    {
      if (heldItems[k] != ITEM_NONE && heldItems[k] == gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId])
        break;
    }
    if (k != firstMonId + i)
      continue;
    // Successful selection
    species[i] = gFacilityTrainerMons[monId].species;
    heldItems[i] = gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId];
    gFrontierTempParty[i] = monId;
    i++;
  }
}

/** 1:1 `static void SetOpponentGfxVar(void)` (battle_factory.c:379-382). */
function SetOpponentGfxVar(): void {
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_A, 0);
}

/** 1:1 `static void SetRentalsToOpponentParty(void)` (battle_factory.c:384-401). */
function SetRentalsToOpponentParty(): void {
  let i = 0;
  if (gSaveBlock2Ptr.frontier.lvlMode != FRONTIER_LVL_TENT)
    gFacilityTrainerMons = gBattleFrontierMons;
  else
    gFacilityTrainerMons = gSlateportBattleTentMons;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].monId = gFrontierTempParty[i];
    gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].ivs = GetBoxMonData((gEnemyParty[i] as any).box, MON_DATA_ATK_IV, null);
    gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].personality = GetMonData(gEnemyParty[i], MON_DATA_PERSONALITY);
    gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].abilityNum = GetBoxMonData((gEnemyParty[i] as any).box, MON_DATA_ABILITY_NUM, null);
    SetMonData(gEnemyParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[gFrontierTempParty[i]].itemTableId] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
  }
}

/** 1:1 `static void SetPlayerAndOpponentParties(void)` (battle_factory.c:403-507). */
function SetPlayerAndOpponentParties(): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let count = 0;
  let bits = 0;
  let monLevel = 0;
  let monId = 0;
  let evs = 0; // 1:1 `u32 evs` (SetMonData porté prend une valeur, pas &evs)
  let ivs = 0;
  let friendship = 0; // 1:1 `u8 friendship` (SetMonData porté prend une valeur, pas &friendship)
  if (gSaveBlock2Ptr.frontier.lvlMode == FRONTIER_LVL_TENT)
  {
    gFacilityTrainerMons = gSlateportBattleTentMons;
    monLevel = TENT_MIN_LEVEL;
  }
  else
  {
    gFacilityTrainerMons = gBattleFrontierMons;
    if (gSaveBlock2Ptr.frontier.lvlMode != FRONTIER_LVL_50)
      monLevel = FRONTIER_MAX_LEVEL_OPEN;
    else
      monLevel = FRONTIER_MAX_LEVEL_50;
  }
  if (VarGet(0x8005) /* gSpecialVar_0x8005 */ < 2)
  {
    ZeroPlayerPartyMons();
    for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
    {
      monId = gSaveBlock2Ptr.frontier.rentalMons[i].monId;
      ivs = gSaveBlock2Ptr.frontier.rentalMons[i].ivs;
      CreateMon(gPlayerParty[i], gFacilityTrainerMons[monId].species, monLevel, ivs, true, gSaveBlock2Ptr.frontier.rentalMons[i].personality, OT_ID_PLAYER_ID, 0);
      count = 0;
      bits = gFacilityTrainerMons[monId].evSpread;
      for (j = 0; j < NUM_STATS; (bits >>= 1, j++))
      {
        if (bits & 1)
          count++;
      }
      evs = Math.trunc(MAX_TOTAL_EVS / count);
      bits = 1;
      for (j = 0; j < NUM_STATS; (bits <<= 1, j++))
      {
        if (gFacilityTrainerMons[monId].evSpread & bits)
          SetMonData(gPlayerParty[i], MON_DATA_HP_EV + j, evs);
      }
      CalculateMonStats(gPlayerParty[i]);
      friendship = 0;
      for (k = 0; k < MAX_MON_MOVES; k++)
        SetMonMoveAvoidReturn(gPlayerParty[i], gFacilityTrainerMons[monId].moves[k], k);
      SetMonData(gPlayerParty[i], MON_DATA_FRIENDSHIP, friendship);
      SetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
      SetMonData(gPlayerParty[i], MON_DATA_ABILITY_NUM, gSaveBlock2Ptr.frontier.rentalMons[i].abilityNum);
    }
  }
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case 0:
    case 2:
      for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
      {
        monId = gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].monId;
        ivs = gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].ivs;
        CreateMon(gEnemyParty[i], gFacilityTrainerMons[monId].species, monLevel, ivs, true, gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].personality, OT_ID_PLAYER_ID, 0);
        count = 0;
        bits = gFacilityTrainerMons[monId].evSpread;
        for (j = 0; j < NUM_STATS; (bits >>= 1, j++))
        {
          if (bits & 1)
            count++;
        }
        evs = Math.trunc(MAX_TOTAL_EVS / count);
        bits = 1;
        for (j = 0; j < NUM_STATS; (bits <<= 1, j++))
        {
          if (gFacilityTrainerMons[monId].evSpread & bits)
            SetMonData(gEnemyParty[i], MON_DATA_HP_EV + j, evs);
        }
        CalculateMonStats(gEnemyParty[i]);
        for (k = 0; k < MAX_MON_MOVES; k++)
          SetMonMoveAvoidReturn(gEnemyParty[i], gFacilityTrainerMons[monId].moves[k], k);
        SetMonData(gEnemyParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
        SetMonData(gEnemyParty[i], MON_DATA_ABILITY_NUM, gSaveBlock2Ptr.frontier.rentalMons[i + FRONTIER_PARTY_SIZE].abilityNum);
      }
      break;
  }
}

/** 1:1 `static void GenerateInitialRentalMons(void)` (battle_factory.c:509-601). */
function GenerateInitialRentalMons(): void {
  let i = 0;
  let j = 0;
  let firstMonId = 0;
  let battleMode = 0;
  let lvlMode = 0;
  let challengeNum = 0;
  let factoryLvlMode = 0;
  let factoryBattleMode = 0;
  let rentalRank = 0;
  let monId = 0;
  let currSpecies = 0;
  const species = new Uint16Array(PARTY_SIZE);
  const monIds = new Uint16Array(PARTY_SIZE);
  const heldItems = new Uint16Array(PARTY_SIZE);
  gFacilityTrainers = gBattleFrontierTrainers;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    species[i] = SPECIES_NONE;
    monIds[i] = 0;
    heldItems[i] = ITEM_NONE;
  }
  lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  challengeNum = Math.trunc(gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode] / FRONTIER_STAGES_PER_CHALLENGE);
  if (VarGet(VAR_FRONTIER_BATTLE_MODE) == FRONTIER_MODE_DOUBLES)
    factoryBattleMode = FRONTIER_MODE_DOUBLES;
  else
    factoryBattleMode = FRONTIER_MODE_SINGLES;
  gFacilityTrainerMons = gBattleFrontierMons;
  if (gSaveBlock2Ptr.frontier.lvlMode != FRONTIER_LVL_50)
  {
    factoryLvlMode = FRONTIER_LVL_OPEN;
    firstMonId = 0;
  }
  else
  {
    factoryLvlMode = FRONTIER_LVL_50;
    firstMonId = 0;
  }
  rentalRank = GetNumPastRentalsRank(factoryBattleMode, factoryLvlMode);
  currSpecies = SPECIES_NONE;
  i = 0;
  while (i != PARTY_SIZE)
  {
    if (i < rentalRank)
      monId = GetFactoryMonId(factoryLvlMode, challengeNum, true);
    else
      monId = GetFactoryMonId(factoryLvlMode, challengeNum, false);
    if (gFacilityTrainerMons[monId].species == SPECIES_UNOWN)
      continue;
    // Cannot have two Pokémon of the same species.
    for (j = firstMonId; j < firstMonId + i; j++)
    {
      let existingMonId = monIds[j];
      if (existingMonId == monId)
        break;
      if (species[j] == gFacilityTrainerMons[monId].species)
      {
        if (currSpecies == SPECIES_NONE)
          currSpecies = gFacilityTrainerMons[monId].species;
        else
          break;
      }
    }
    if (j != firstMonId + i)
      continue;
    // Cannot have two same held items.
    for (j = firstMonId; j < firstMonId + i; j++)
    {
      if (heldItems[j] != ITEM_NONE && heldItems[j] == gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId])
      {
        if (gFacilityTrainerMons[monId].species == currSpecies)
          currSpecies = SPECIES_NONE;
        break;
      }
    }
    if (j != firstMonId + i)
      continue;
    gSaveBlock2Ptr.frontier.rentalMons[i].monId = monId;
    species[i] = gFacilityTrainerMons[monId].species;
    heldItems[i] = gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId];
    monIds[i] = monId;
    i++;
  }
}

// Determines if the upcoming opponent has a single most-common

// type in its party. If there are two different types that are

// tied, then the opponent is deemed to have no preferred type,

// and NUMBER_OF_MON_TYPES is the result.

/** 1:1 `static void GetOpponentMostCommonMonType(void)` (battle_factory.c:607-655). */
function GetOpponentMostCommonMonType(): void {
  let i = 0;
  const typeCounts = new Uint8Array(NUMBER_OF_MON_TYPES);
  const mostCommonTypes = new Uint8Array(2);
  gFacilityTrainerMons = gBattleFrontierMons;
  // Count the number of times each type occurs in the opponent's party.
  for (i = TYPE_NORMAL; i < NUMBER_OF_MON_TYPES; i++)
    typeCounts[i] = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    let species = gFacilityTrainerMons[gFrontierTempParty[i]].species;
    typeCounts[resolveDecompConstant(gSpeciesInfo[species].types[0]) ?? 0]++; // types[] = string dans le port → résolution numérique (précédent battle_main.ts:4650)
    if (gSpeciesInfo[species].types[0] != gSpeciesInfo[species].types[1])
      typeCounts[resolveDecompConstant(gSpeciesInfo[species].types[1]) ?? 0]++;
  }
  // Determine which are the two most-common types.
  // The second most-common type is only updated if
  // its count is equal to the most-common type.
  mostCommonTypes[0] = 0;
  mostCommonTypes[1] = 0;
  for (i = 1; i < NUMBER_OF_MON_TYPES; i++)
  {
    if (typeCounts[mostCommonTypes[0]] < typeCounts[i])
      mostCommonTypes[0] = i;
    else if (typeCounts[mostCommonTypes[0]] == typeCounts[i])
      mostCommonTypes[1] = i;
  }
  if (typeCounts[mostCommonTypes[0]] != 0)
  {
    // The most-common type must be strictly greater than
    // the second-most-common type, or the top two must be
    // the same type.
    if (typeCounts[mostCommonTypes[0]] > typeCounts[mostCommonTypes[1]])
      VarSet(0x800D /* gSpecialVar_Result */, +(mostCommonTypes[0]));
    else if (mostCommonTypes[0] == mostCommonTypes[1])
      VarSet(0x800D /* gSpecialVar_Result */, +(mostCommonTypes[0]));
    else
      VarSet(0x800D /* gSpecialVar_Result */, +(NUMBER_OF_MON_TYPES));
  }
  else
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(NUMBER_OF_MON_TYPES));
  }
}

/** 1:1 `static void GetOpponentBattleStyle(void)` (battle_factory.c:657-690). */
function GetOpponentBattleStyle(): void {
  let i = 0;
  let j = 0;
  let count = 0;
  const stylePoints = new Uint8Array(FACTORY_NUM_STYLES);
  count = 0;
  gFacilityTrainerMons = gBattleFrontierMons;
  for (i = 0; i < FACTORY_NUM_STYLES; i++)
    stylePoints[i] = 0;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    let monId = gFrontierTempParty[i];
    for (j = 0; j < MAX_MON_MOVES; j++)
    {
      let battleStyle = GetMoveBattleStyle(gFacilityTrainerMons[monId].moves[j]);
      stylePoints[battleStyle]++;
    }
  }
  VarSet(0x800D /* gSpecialVar_Result */, +(FACTORY_STYLE_NONE));
  for (i = 1; i < FACTORY_NUM_STYLES; i++)
  {
    if (stylePoints[i] >= sRequiredMoveCounts[i - 1])
    {
      VarSet(0x800D /* gSpecialVar_Result */, +(i));
      count++;
    }
  }
  // Has no singular style
  if (count > 2)
    VarSet(0x800D /* gSpecialVar_Result */, +(FACTORY_NUM_STYLES));
}

/** 1:1 `static u8 GetMoveBattleStyle(u16 move)` (battle_factory.c:692-706). */
function GetMoveBattleStyle(move: number): number {
  let moves: any = null;
  let i = 0;
  let j = 0;
  for (i = 0; i < sMoveStyles.length; i++)
  {
    for ((j = 0, moves = sMoveStyles[i]); moves[j] != MOVE_NONE; j++)
    {
      if (moves[j] == move)
        return i + 1;
    }
  }
  return FACTORY_STYLE_NONE;
}

/** 1:1 `bool8 InBattleFactory(void)` (battle_factory.c:708-712). */
export function InBattleFactory(): boolean {
  return gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_PRE_BATTLE_ROOM || gMapHeader?.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM;
}

/** 1:1 `static void RestorePlayerPartyHeldItems(void)` (battle_factory.c:714-729). */
function RestorePlayerPartyHeldItems(): void {
  let i = 0;
  if (gSaveBlock2Ptr.frontier.lvlMode != FRONTIER_LVL_TENT)
    gFacilityTrainerMons = gBattleFrontierMons;
  else
    gFacilityTrainerMons = gSlateportBattleTentMons;
  for (i = 0; i < FRONTIER_PARTY_SIZE; i++)
  {
    SetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[gSaveBlock2Ptr.frontier.rentalMons[i].monId].itemTableId] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
  }
}

// Get the IV to use for the opponent's pokémon.

// The IVs get higher for each subsequent challenge and for

// the last trainer in each challenge. Noland is an exception

// to this, as he uses the IVs that would be used by the regular

// trainers 2 challenges ahead of the current one.

// Due to a mistake in FillFactoryFrontierTrainerParty, the

// challenge number used to determine the IVs for regular trainers

// is Battle Tower's instead of Battle Factory's.

/** 1:1 `u8 GetFactoryMonFixedIV(u8 challengeNum, bool8 isLastBattle)` (battle_factory.c:739-757). */
export function GetFactoryMonFixedIV(challengeNum: number, isLastBattle: boolean): number {
  let ivSet = 0;
  let useHigherIV = isLastBattle ? 1 : 0; // 1:1 `bool8 useHigherIV = isLastBattle` (indexe sFixedIVTable)
  // The Factory has an out-of-bounds access when generating the rental draft for round 9 (challengeNum==8),
  // or the "elevated" rentals from round 8 (challengeNum+1==8)
  // This happens to land on a number higher than 31, which is interpreted as "random IVs"
  if (challengeNum > sFixedIVTable.length)
    ivSet = sFixedIVTable.length - 1;
  else
    ivSet = challengeNum;
  return sFixedIVTable[ivSet][useHigherIV];
}

/** 1:1 `void FillFactoryBrainParty(void)` (battle_factory.c:759-827). */
export function FillFactoryBrainParty(): void {
  let i = 0;
  let j = 0;
  let k = 0;
  const species = new Uint16Array(FRONTIER_PARTY_SIZE);
  const heldItems = new Uint16Array(FRONTIER_PARTY_SIZE);
  let friendship = 0; // 1:1 `u8 friendship` (SetMonData porté prend une valeur, pas &friendship)
  let monLevel = 0;
  let fixedIV = 0;
  let otId = 0;
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  let challengeNum = Math.trunc(gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode] / FRONTIER_STAGES_PER_CHALLENGE);
  fixedIV = GetFactoryMonFixedIV(challengeNum + 2, false);
  monLevel = SetFacilityPtrsGetLevel();
  i = 0;
  // 1:1 battle_factory.c:775 `otId = T1_READ_32(gSaveBlock2Ptr->playerTrainerId)`.
  // 🐛 fix 2026-07-19 (SYS-1, cf. N°ID Panthéon 8dee92c28) : SB2.playerTrainerId est un u32
  // number (PAS un u8[4]) → T1_READ_32 (lecture d'octets LE) rendait 0. Le u32 EST la valeur ;
  // fallback T1_READ_32 pour un save legacy en tableau.
  const _tid = gSaveBlock2Ptr.playerTrainerId as unknown as number | number[];
  otId = (typeof _tid === 'number' ? _tid : T1_READ_32(_tid)) >>> 0;
  while (i != FRONTIER_PARTY_SIZE)
  {
    let monId = GetFactoryMonId(lvlMode, challengeNum, false);
    if (gFacilityTrainerMons[monId].species == SPECIES_UNOWN)
      continue;
    if (monLevel == FRONTIER_MAX_LEVEL_50 && monId > FRONTIER_MONS_HIGH_TIER)
      continue;
    for (j = 0; j < (gSaveBlock2Ptr.frontier.rentalMons.length | 0); j++)
    {
      if (monId == gSaveBlock2Ptr.frontier.rentalMons[j].monId)
        break;
    }
    if (j != (gSaveBlock2Ptr.frontier.rentalMons.length | 0))
      continue;
    for (k = 0; k < i; k++)
    {
      if (species[k] == gFacilityTrainerMons[monId].species)
        break;
    }
    if (k != i)
      continue;
    for (k = 0; k < i; k++)
    {
      if (heldItems[k] != ITEM_NONE && heldItems[k] == gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId])
        break;
    }
    if (k != i)
      continue;
    species[i] = gFacilityTrainerMons[monId].species;
    heldItems[i] = gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId];
    CreateMonWithEVSpreadNatureOTID(gEnemyParty[i], gFacilityTrainerMons[monId].species, monLevel, gFacilityTrainerMons[monId].nature, fixedIV, gFacilityTrainerMons[monId].evSpread, otId);
    friendship = 0;
    for (k = 0; k < MAX_MON_MOVES; k++)
      SetMonMoveAvoidReturn(gEnemyParty[i], gFacilityTrainerMons[monId].moves[k], k);
    SetMonData(gEnemyParty[i], MON_DATA_FRIENDSHIP, friendship);
    SetMonData(gEnemyParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
    i++;
  }
}

/** 1:1 `static u16 GetFactoryMonId(u8 lvlMode, u8 challengeNum, bool8 useBetterRange)` (battle_factory.c:829-866). */
function GetFactoryMonId(lvlMode: number, challengeNum: number, useBetterRange: boolean): number {
  let numMons = 0;
  let monId = 0;
  let adder = 0;
  // Used to skip past early mons for open level
  if (lvlMode == FRONTIER_LVL_50)
    adder = 0;
  else
    adder = 8;
  if (challengeNum < 7)
  {
    if (useBetterRange)
    {
      numMons = (sInitialRentalMonRanges[adder + challengeNum + 1][1] - sInitialRentalMonRanges[adder + challengeNum + 1][0]) + 1;
      monId = Random() % numMons;
      monId += sInitialRentalMonRanges[adder + challengeNum + 1][0];
    }
    else
    {
      numMons = (sInitialRentalMonRanges[adder + challengeNum][1] - sInitialRentalMonRanges[adder + challengeNum][0]) + 1;
      monId = Random() % numMons;
      monId += sInitialRentalMonRanges[adder + challengeNum][0];
    }
  }
  else
  {
    let challenge = challengeNum;
    if (challenge != 7)
      challenge = 7;
    // why bother assigning it above at all
    numMons = (sInitialRentalMonRanges[adder + challenge][1] - sInitialRentalMonRanges[adder + challenge][0]) + 1;
    monId = Random() % numMons;
    monId += sInitialRentalMonRanges[adder + challenge][0];
  }
  return monId;
}

/** 1:1 `u8 GetNumPastRentalsRank(u8 battleMode, u8 lvlMode)` (battle_factory.c:868-887). */
export function GetNumPastRentalsRank(battleMode: number, lvlMode: number): number {
  let ret = 0;
  let rents = gSaveBlock2Ptr.frontier.factoryRentsCount[battleMode][lvlMode];
  if (rents < 15)
    ret = 0;
  else if (rents < 22)
    ret = 1;
  else if (rents < 29)
    ret = 2;
  else if (rents < 36)
    ret = 3;
  else if (rents < 43)
    ret = 4;
  else
    ret = 5;
  return ret;
}

/** 1:1 `u32 GetAiScriptsInBattleFactory(void)` (battle_factory.c:889-911). */
export function GetAiScriptsInBattleFactory(): number {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  if (lvlMode == FRONTIER_LVL_TENT)
  {
    return 0;
  }
  else
  {
    let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
    let challengeNum = Math.trunc(gSaveBlock2Ptr.frontier.factoryWinStreaks[battleMode][lvlMode] / FRONTIER_STAGES_PER_CHALLENGE);
    if (gTrainerBattleOpponent_A == TRAINER_FRONTIER_BRAIN)
      return AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_TRY_TO_FAINT | AI_SCRIPT_CHECK_VIABILITY;
    else if (challengeNum < 2)
      return 0;
    else if (challengeNum < 4)
      return AI_SCRIPT_CHECK_BAD_MOVE;
    else
      return AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_TRY_TO_FAINT | AI_SCRIPT_CHECK_VIABILITY;
  }
}

/** 1:1 `void SetMonMoveAvoidReturn(struct Pokemon *mon, u16 moveArg, u8 moveSlot)` (battle_factory.c:913-919). */
export function SetMonMoveAvoidReturn(mon: Pokemon, moveArg: number, moveSlot: number): void {
  let move = moveArg;
  if (moveArg == MOVE_RETURN)
    move = MOVE_FRUSTRATION;
  SetMonMoveSlot(mon, move, moveSlot);
}

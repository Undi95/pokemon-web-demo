// @ts-nocheck — transpilé brut (revue humaine faite sur le chemin critique SelectMatchCallMessage)
/**
 * match_call.ts — Port 1:1 STRICT (MIROIR partiel) de `src/match_call.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/match_call.c`.
 *
 * Périmètre porté : le SEEDING new-game (`InitMatchCallCounters`) + son état
 * module (`sMatchCallState` minutes/stepCounter, RAM non sauvée). Le système
 * d'appels Pokénav (TryStartMatchCall et la data des ~60 interlocuteurs)
 * = Palier 4 Pokénav.
 */

import { RtcCalcLocalTime, gLocalTime } from './rtc';
import type { Time } from './engine/save/save-blocks';

// 1:1 décomp match_call.c — `static struct { u32 minutes; ... } sMatchCallState`
// (champs consommés par InitMatchCallCounters/UpdateMatchCallMinutesCounter).
const sMatchCallState = { minutes: 0, trainerId: 0, stepCounter: 0, triggeredFromScript: false }; // 1:1 struct MatchCallState (match_call.c:93-99)

/** 1:1 décomp `static u32 GetCurrentTotalMinutes(struct Time *time)`
 *  (match_call.c:1036-1039). */
function GetCurrentTotalMinutes(time: Time): number {
  return time.days * 24 * 60 + time.hours * 60 + time.minutes;
}

/** 1:1 décomp `void InitMatchCallCounters(void)` (match_call.c:1029-1034) :
 *  prochain appel possible au plus tôt 10 minutes (RTC) après le new game. */
export function InitMatchCallCounters(): void {
  RtcCalcLocalTime();
  sMatchCallState.minutes = GetCurrentTotalMinutes(gLocalTime) + 10;
  sMatchCallState.stepCounter = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// MERGE transpile-c : fns/data manquantes de match_call.c (3 défs
// existantes préservées ci-dessus). Revue humaine OBLIGATOIRE avant commit —
// rapport audit-reports/transpile/match_call.md.
// ═══════════════════════════════════════════════════════════════════════════

import { FuncIsActiveTask, IsSEPlaying, LoadBgTiles, LoadPalette, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { ABILITY_LIGHTNING_ROD } from '../include/constants/abilities';
import { FRONTIER_FACILITY_ARENA, FRONTIER_FACILITY_DOME, FRONTIER_FACILITY_FACTORY, FRONTIER_FACILITY_PIKE, FRONTIER_FACILITY_PALACE, FRONTIER_FACILITY_PYRAMID, FRONTIER_FACILITY_TOWER, NUM_FRONTIER_FACILITIES } from '../include/constants/battle_frontier';
import { CHAR_PROMPT_CLEAR, EOS, TEXT_COLOR_BLUE, TEXT_DYNAMIC_COLOR_1, TEXT_DYNAMIC_COLOR_5 } from '../include/constants/characters';
import { LOCALID_PLAYER } from '../include/constants/event_objects';
import { FLAG_BADGE01_GET, FLAG_BADGE02_GET, FLAG_BADGE03_GET, FLAG_BADGE04_GET, FLAG_BADGE05_GET, FLAG_BADGE06_GET, FLAG_BADGE07_GET, FLAG_BADGE08_GET, FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, FLAG_HAS_MATCH_CALL, FLAG_HIDE_SOOTOPOLIS_CITY_RAYQUAZA, FLAG_MET_ARCHIE_METEOR_FALLS, FLAG_NEVER_SET_0x0DC, NUM_BADGES, TRAINER_REGISTERED_FLAGS_START } from '../include/constants/flags';
import { GAME_STAT_TRAINER_BATTLES } from '../include/constants/game_stat';
import { FRONTIER_LVL_MODE_COUNT } from '../include/constants/global';
import { MAP_GROUP } from '../include/constants/map_groups';
import { TRAINER_ABIGAIL_1, TRAINER_AMY_AND_LIV_1, TRAINER_ANDRES_1, TRAINER_ANNA_AND_MEG_1, TRAINER_BENJAMIN_1, TRAINER_BERNIE_1, TRAINER_BROOKE_1, TRAINER_CALVIN_1, TRAINER_CAMERON_1, TRAINER_CATHERINE_1, TRAINER_CINDY_1, TRAINER_CORY_1, TRAINER_CRISTIN_1, TRAINER_CYNDY_1, TRAINER_DALTON_1, TRAINER_DIANA_1, TRAINER_DUSTY_1, TRAINER_DYLAN_1, TRAINER_EDWIN_1, TRAINER_ELLIOT_1, TRAINER_ERNEST_1, TRAINER_ETHAN_1, TRAINER_FERNANDO_1, TRAINER_GABBY_AND_TY_1, TRAINER_GABRIELLE_1, TRAINER_HALEY_1, TRAINER_ISAAC_1, TRAINER_ISABEL_1, TRAINER_ISAIAH_1, TRAINER_JACKI_1, TRAINER_JACKSON_1, TRAINER_JAMES_1, TRAINER_JEFFREY_1, TRAINER_JENNY_1, TRAINER_JERRY_1, TRAINER_JESSICA_1, TRAINER_JOHN_AND_JAY_1, TRAINER_KAREN_1, TRAINER_KATELYN_1, TRAINER_KIRA_AND_DAN_1, TRAINER_KOJI_1, TRAINER_LAO_1, TRAINER_LILA_AND_ROY_1, TRAINER_LOLA_1, TRAINER_LYDIA_1, TRAINER_MADELINE_1, TRAINER_MARIA_1, TRAINER_MIGUEL_1, TRAINER_NICOLAS_1, TRAINER_NOB_1, TRAINER_PABLO_1, TRAINER_RICKY_1, TRAINER_ROBERT_1, TRAINER_ROSE_1, TRAINER_SAWYER_1, TRAINER_SHELBY_1, TRAINER_STEVE_1, TRAINER_THALIA_1, TRAINER_TIMOTHY_1, TRAINER_TONY_1, TRAINER_TRENT_1, TRAINER_VALERIE_1, TRAINER_WALTER_1, TRAINER_WILTON_1, TRAINER_WINSTON_1 } from '../include/constants/opponents';
import { MAPSEC_MT_CHIMNEY, MAPSEC_SAFARI_ZONE, MAPSEC_SOOTOPOLIS_CITY } from '../include/constants/region_map_sections';
import { SE_POKENAV_CALL, SE_POKENAV_HANG_UP } from '../include/constants/songs';
import { SPECIES_DEOXYS, SPECIES_JIRACHI } from '../include/constants/species';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { MON_DATA_SANITY_IS_EGG } from '../include/pokemon';
import { STR_CONV_MODE_LEFT_ALIGN } from '../include/string_util';
import { FONT_NORMAL } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { JOY_HELD, JOY_NEW, PlaySE } from './battle_controllers';
import { GetLastBeatenRematchTrainerId, HasTrainerBeenFought, UpdateRematchIfDefeated, gRematchTable } from './battle_setup';
import { PIXEL_FILL } from './window';
import { GetMonData } from './engine/battle/party-storage';
import { SpeciesToNationalPokedexNum, gSpeciesNames } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
// gTrainers = adaptateur vues-GBA sur la table JSON du bridge combat (trainerName en bytes GBA+EOS).
import { gTrainers } from './pokenav_match_call_data';
import { FLAG_GET_CAUGHT, FLAG_GET_SEEN } from '../include/pokedex';
import { GetHoennPokedexCount, GetNationalPokedexCount, GetSetPokedexFlag } from './pokedex';
import { FlagGet, IsNationalPokedexEnabled } from './event_data';
import { FreezeObjectEvents, GetObjectEventIdByLocalIdAndMap, ObjectEventClearHeldMovementIfFinished, UnfreezeObjectEvents, gObjectEvents } from './event_object_movement';
import { GetGameStat, PlayerFreeze, StopPlayerAvatar } from './field_player_avatar';
import { gMapHeader } from './fieldmap';
import { GetPlayerTextSpeedDelay, LoadMessageBoxAndBorderGfx } from './menu';
import { GetTrainerId } from './new_game';
import { Overworld_GetMapHeaderByGroupAndId, Overworld_MapTypeAllowsTeleportAndFly } from './overworld';
import { BG_PLTT_ID } from './palette';
import { GetMonAbility, gPlayerParty } from './pokemon';
import { Random } from './random';
import { GetMapName } from './region_map';
import { RtcGetLocalDayCount } from './rtc';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import { ConvertIntToDecimalStringN, StringCopy, StringExpandPlaceholders, gStringVar1, gStringVar2, gStringVar3, gStringVar4 } from './string_util';
import { CreateTask, DestroyTask, gTasks } from './task';
import { AddTextPrinter, IsTextPrinterActive, RunTextPrinters, encodeOwText, gTextFlags } from './text';
import { AddWindow, BG_ATTR_BASETILE, GetBgAttribute, COPYWIN_GFX, ChangeBgY, CopyBgTilemapBufferToVram, CopyWindowToVram, FillBgTilemapBufferRect_Palette0, FillWindowPixelBuffer, GetWindowAttribute, PutWindowTilemap, RemoveWindow, WINDOW_BG, WINDOW_HEIGHT, WINDOW_TILEMAP_LEFT, WINDOW_TILEMAP_TOP, WINDOW_WIDTH } from './window';
import type { MapHeader } from './fieldmap';
import type { TextPrinterTemplate } from './text';
import type { WindowTemplate } from './window';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const REMATCH_TABLE_ENTRIES = 78; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_SPECIAL_TRAINER_START = 64; // 1:1 include/constants/rematches.h:86 (à consolider dans include/)
const WINDOW_NONE = 255; // 1:1 include/window.h:43 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_ADD = 1; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_SUB = 2; // 1:1 include/bg.h:0 (à consolider dans include/)
const MAP_UNDEFINED = 65535; // 1:1 include/constants/maps.h:0 (à consolider dans include/)
const F_TRAINER_PARTY_CUSTOM_MOVESET = 1; // 1:1 include/constants/trainers.h:375 (à consolider dans include/)
const F_TRAINER_PARTY_HELD_ITEM = 2; // 1:1 include/constants/trainers.h:376 (à consolider dans include/)

// In this file only the values normally associated with Battle Pike and Factory are swapped.

// Note that this is *not* a bug, because they are properly swapped consistently in this file.

// There would only be an issue if anything in this file interacted with something expecting

// the usual value order, or vice versa.

const MATCH_CALL_FACTORY = FRONTIER_FACILITY_PIKE; // 1:1 match_call.c:40

const MATCH_CALL_PIKE = FRONTIER_FACILITY_FACTORY; // 1:1 match_call.c:41

// Each match call message has variables that can be populated randomly or

// dependent on the trainer. The below are IDs for how to populate the vars

// in a given message.

// Each message may have up to 3 vars in it

// enum match_call.c:47
const STR_TRAINER_NAME = 0;
const STR_MAP_NAME = 1;
const STR_SPECIES_IN_ROUTE = 2;
const STR_SPECIES_IN_PARTY = 3;
const STR_FACILITY_NAME = 4;
const STR_FRONTIER_STREAK = 5;
const STR_NONE = -1;

const STRS_NORMAL_MSG = [STR_TRAINER_NAME, STR_NONE,             STR_NONE]; // 1:1 match_call.c:56

const STRS_WILD_BATTLE = [STR_TRAINER_NAME, STR_SPECIES_IN_ROUTE, STR_NONE]; // 1:1 match_call.c:57

const STRS_BATTLE_NEGATIVE = [STR_TRAINER_NAME, STR_NONE,             STR_NONE]; // 1:1 match_call.c:58

const STRS_BATTLE_POSITIVE = [STR_TRAINER_NAME, STR_SPECIES_IN_PARTY, STR_NONE]; // 1:1 match_call.c:59

const STRS_BATTLE_REQUEST = [STR_TRAINER_NAME, STR_MAP_NAME,         STR_NONE]; // 1:1 match_call.c:60

const STRS_FRONTIER = [STR_TRAINER_NAME, STR_FACILITY_NAME,    STR_FRONTIER_STREAK]; // 1:1 match_call.c:61

const NUM_STRVARS_IN_MSG = 3; // 1:1 match_call.c:63

// Topic IDs for sMatchCallGeneralTopics

// enum match_call.c:66
const GEN_TOPIC_PERSONAL = 1;
const GEN_TOPIC_STREAK = 2;
const GEN_TOPIC_STREAK_RECORD = 3;
const GEN_TOPIC_B_DOME = 4;
const GEN_TOPIC_B_PIKE = 5;
const GEN_TOPIC_B_PYRAMID = 6;

// Topic IDs for sMatchCallBattleTopics

// enum match_call.c:76
const B_TOPIC_WILD = 1;
const B_TOPIC_NEGATIVE = 2;
const B_TOPIC_POSITIVE = 3;

// Each trainer has a text id for 1 of each of the 3 battle topics

// The msgId is the index into the respective topic's message table

// For all but 2 trainers this index is the same for each topic

// 1:1 macro match_call.c:85 — ARRAY de 3 text-ids (le transpileur produisait un bloc → undefined).
const BATTLE_TEXT_IDS = (msgId: number) => [TEXT_ID(B_TOPIC_WILD, msgId), TEXT_ID(B_TOPIC_NEGATIVE, msgId), TEXT_ID(B_TOPIC_POSITIVE, msgId)];

// Topic IDs for sMatchCallBattleRequestTopics

// enum match_call.c:88
const REQ_TOPIC_SAME_ROUTE = 1;
const REQ_TOPIC_DIFF_ROUTE = 2;

/** 1:1 `struct MatchCallState` (match_call.c:93). */
interface MatchCallState {
  minutes: number;
  trainerId: number;
  stepCounter: number;
  triggeredFromScript: boolean;
}

/** 1:1 `struct MatchCallTrainerTextInfo` (match_call.c:101). */
interface MatchCallTrainerTextInfo {
  trainerId: number;
  unused: number;
  battleTopicTextIds: Uint16Array;
  generalTextId: number;
  battleFrontierRecordStreakTextIndex: number;
  sameRouteMatchCallTextId: number;
  differentRouteMatchCallTextId: number;
}

/** 1:1 `struct MatchCallText` (match_call.c:112). */
interface MatchCallText {
  text: Uint8Array;
  stringVarFuncIds: Int8Array;
}

/** 1:1 `struct MultiTrainerMatchCallText` (match_call.c:118). */
interface MultiTrainerMatchCallText {
  trainerId: number;
  text: Uint8Array;
}

/** 1:1 `struct BattleFrontierStreakInfo` (match_call.c:124). */
interface BattleFrontierStreakInfo {
  facilityId: number;
  streak: number;
}

/** 1:1 (match_call.c:131) */
let sBattleFrontierStreakInfo = {
  facilityId: 0,
};

const TEXT_ID = (topic: number, id: number) => (((topic) << 8) | ((id) & 0xFF)); // 1:1 macro match_call.c:169

/** 1:1 (match_call.c:171) */
const sMatchCallTrainers = [
  {
    trainerId: TRAINER_ROSE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 3),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_ANDRES_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(12),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 62),
    battleFrontierRecordStreakTextIndex: 12,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 12),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 12),
  },
  {
    trainerId: TRAINER_DUSTY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(12),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 4),
    battleFrontierRecordStreakTextIndex: 12,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 12),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 12),
  },
  {
    trainerId: TRAINER_LOLA_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(2),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 5),
    battleFrontierRecordStreakTextIndex: 2,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 2),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 2),
  },
  {
    trainerId: TRAINER_RICKY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 6),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_LILA_AND_ROY_1,
    unused: 4,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 61),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_CRISTIN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(10),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 64),
    battleFrontierRecordStreakTextIndex: 10,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 10),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 10),
  },
  {
    trainerId: TRAINER_BROOKE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 8),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_WILTON_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(6),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 7),
    battleFrontierRecordStreakTextIndex: 6,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 6),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 6),
  },
  {
    trainerId: TRAINER_VALERIE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 9),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_CINDY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 10),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_THALIA_1,
    unused: 0,
    // Thalia and Sawyer are the only ones who use different msg ids for their battle topics
    battleTopicTextIds: [
      TEXT_ID(B_TOPIC_WILD, 8),
      TEXT_ID(B_TOPIC_NEGATIVE, 10),
      TEXT_ID(B_TOPIC_POSITIVE, 10),
    ],
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 14),
    battleFrontierRecordStreakTextIndex: 10,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 10),
  },
  {
    trainerId: TRAINER_JESSICA_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(10),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 11),
    battleFrontierRecordStreakTextIndex: 10,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 10),
  },
  {
    trainerId: TRAINER_WINSTON_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(4),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 12),
    battleFrontierRecordStreakTextIndex: 4,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 4),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 4),
  },
  {
    trainerId: TRAINER_STEVE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(7),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 13),
    battleFrontierRecordStreakTextIndex: 7,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 7),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 7),
  },
  {
    trainerId: TRAINER_TONY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 15),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_NOB_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 16),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_KOJI_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 59),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_FERNANDO_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(6),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 17),
    battleFrontierRecordStreakTextIndex: 6,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 6),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 6),
  },
  {
    trainerId: TRAINER_DALTON_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(4),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 18),
    battleFrontierRecordStreakTextIndex: 4,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 4),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 4),
  },
  {
    trainerId: TRAINER_BERNIE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(11),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 19),
    battleFrontierRecordStreakTextIndex: 11,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 11),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 11),
  },
  {
    trainerId: TRAINER_ETHAN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 20),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_JOHN_AND_JAY_1,
    unused: 3,
    battleTopicTextIds: BATTLE_TEXT_IDS(12),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 60),
    battleFrontierRecordStreakTextIndex: 12,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 12),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 12),
  },
  {
    trainerId: TRAINER_JEFFREY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(7),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 21),
    battleFrontierRecordStreakTextIndex: 7,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 7),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 7),
  },
  {
    trainerId: TRAINER_CAMERON_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(4),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 22),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 4),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 4),
  },
  {
    trainerId: TRAINER_JACKI_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 23),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_WALTER_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(12),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 24),
    battleFrontierRecordStreakTextIndex: 12,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 12),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 12),
  },
  {
    trainerId: TRAINER_KAREN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(2),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 26),
    battleFrontierRecordStreakTextIndex: 2,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 2),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 2),
  },
  {
    trainerId: TRAINER_JERRY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 25),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_ANNA_AND_MEG_1,
    unused: 6,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 27),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_ISABEL_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(14),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 29),
    battleFrontierRecordStreakTextIndex: 14,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 14),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 14),
  },
  {
    trainerId: TRAINER_MIGUEL_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(11),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 28),
    battleFrontierRecordStreakTextIndex: 11,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 11),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 11),
  },
  {
    trainerId: TRAINER_TIMOTHY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(12),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 30),
    battleFrontierRecordStreakTextIndex: 12,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 12),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 12),
  },
  {
    trainerId: TRAINER_SHELBY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(13),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 31),
    battleFrontierRecordStreakTextIndex: 13,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 13),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 13),
  },
  {
    trainerId: TRAINER_CALVIN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 32),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_ELLIOT_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 33),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_ISAIAH_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 38),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_MARIA_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 37),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_ABIGAIL_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 35),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_DYLAN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 36),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_KATELYN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 40),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_BENJAMIN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 34),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_PABLO_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 39),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_NICOLAS_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(4),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 41),
    battleFrontierRecordStreakTextIndex: 4,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 4),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 4),
  },
  {
    trainerId: TRAINER_ROBERT_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(6),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 42),
    battleFrontierRecordStreakTextIndex: 6,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 6),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 6),
  },
  {
    trainerId: TRAINER_LAO_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 43),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_CYNDY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 44),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_MADELINE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 45),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_JENNY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 46),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_DIANA_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(2),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 47),
    battleFrontierRecordStreakTextIndex: 2,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 2),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 2),
  },
  {
    trainerId: TRAINER_AMY_AND_LIV_1,
    unused: 2,
    battleTopicTextIds: BATTLE_TEXT_IDS(2),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 48),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 2),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 2),
  },
  {
    trainerId: TRAINER_ERNEST_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 49),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_CORY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 63),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_EDWIN_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(7),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 50),
    battleFrontierRecordStreakTextIndex: 7,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 7),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 7),
  },
  {
    trainerId: TRAINER_LYDIA_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 52),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_ISAAC_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 51),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_GABRIELLE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(8),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 2),
    battleFrontierRecordStreakTextIndex: 8,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 8),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 8),
  },
  {
    trainerId: TRAINER_CATHERINE_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 54),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
  {
    trainerId: TRAINER_JACKSON_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(5),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 53),
    battleFrontierRecordStreakTextIndex: 5,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 5),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 5),
  },
  {
    trainerId: TRAINER_HALEY_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(2),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 55),
    battleFrontierRecordStreakTextIndex: 2,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 2),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 2),
  },
  {
    trainerId: TRAINER_JAMES_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(1),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 56),
    battleFrontierRecordStreakTextIndex: 1,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 1),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 1),
  },
  {
    trainerId: TRAINER_TRENT_1,
    unused: 0,
    battleTopicTextIds: BATTLE_TEXT_IDS(3),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 57),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_SAWYER_1,
    unused: 0,
    // Thalia and Sawyer are the only ones who use different msg ids for their battle topics
    battleTopicTextIds: [
      TEXT_ID(B_TOPIC_WILD, 15),
      TEXT_ID(B_TOPIC_NEGATIVE, 3),
      TEXT_ID(B_TOPIC_POSITIVE, 3),
    ],
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 1),
    battleFrontierRecordStreakTextIndex: 3,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 3),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 3),
  },
  {
    trainerId: TRAINER_KIRA_AND_DAN_1,
    unused: 1,
    battleTopicTextIds: BATTLE_TEXT_IDS(9),
    generalTextId: TEXT_ID(GEN_TOPIC_PERSONAL, 58),
    battleFrontierRecordStreakTextIndex: 9,
    sameRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_SAME_ROUTE, 9),
    differentRouteMatchCallTextId: TEXT_ID(REQ_TOPIC_DIFF_ROUTE, 9),
  },
];

/** 1:1 (match_call.c:753) */
const sMatchCallWildBattleTexts = [
  {
    text: 'MatchCall_WildBattleText1',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText2',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText3',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText4',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText5',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText6',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText7',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText8',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText9',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText10',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText11',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText12',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText13',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText14',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
  {
    text: 'MatchCall_WildBattleText15',
    stringVarFuncIds: STRS_WILD_BATTLE,
  },
];

/** 1:1 (match_call.c:772) */
const sMatchCallNegativeBattleTexts = [
  {
    text: 'MatchCall_NegativeBattleText1',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText2',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText3',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText4',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText5',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText6',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText7',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText8',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText9',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText10',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText11',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText12',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText13',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
  {
    text: 'MatchCall_NegativeBattleText14',
    stringVarFuncIds: STRS_BATTLE_NEGATIVE,
  },
];

/** 1:1 (match_call.c:790) */
const sMatchCallPositiveBattleTexts = [
  {
    text: 'MatchCall_PositiveBattleText1',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText2',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText3',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText4',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText5',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText6',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText7',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText8',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText9',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText10',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText11',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText12',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText13',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
  {
    text: 'MatchCall_PositiveBattleText14',
    stringVarFuncIds: STRS_BATTLE_POSITIVE,
  },
];

/** 1:1 (match_call.c:808) */
const sMatchCallSameRouteBattleRequestTexts = [
  {
    text: 'MatchCall_SameRouteBattleRequestText1',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText2',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText3',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText4',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText5',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText6',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText7',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText8',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText9',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText10',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText11',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText12',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText13',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_SameRouteBattleRequestText14',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
];

/** 1:1 (match_call.c:826) */
const sMatchCallDifferentRouteBattleRequestTexts = [
  {
    text: 'MatchCall_DifferentRouteBattleRequestText1',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText2',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText3',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText4',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText5',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText6',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText7',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText8',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText9',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText10',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText11',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText12',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText13',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
  {
    text: 'MatchCall_DifferentRouteBattleRequestText14',
    stringVarFuncIds: STRS_BATTLE_REQUEST,
  },
];

/** 1:1 (match_call.c:844) */
const sMatchCallPersonalizedTexts = [
  {
    text: 'MatchCall_PersonalizedText1',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_MAP_NAME,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText2',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText3',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText4',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText5',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText6',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText7',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText8',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText9',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText10',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText11',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText12',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText13',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_ROUTE,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText14',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText15',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText16',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText17',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText18',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText19',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText20',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText21',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText22',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText23',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText24',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText25',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText26',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText27',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText28',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText29',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText30',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText31',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText32',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText33',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText34',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText35',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText36',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText37',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText38',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText39',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText40',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText41',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText42',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText43',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText44',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText45',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText46',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText47',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText48',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText49',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText50',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText51',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_MAP_NAME,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText52',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_SPECIES_IN_PARTY,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText53',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText54',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText55',
    stringVarFuncIds: [
      STR_TRAINER_NAME,
      STR_MAP_NAME,
      STR_NONE,
    ],
  },
  {
    text: 'MatchCall_PersonalizedText56',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText57',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText58',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText59',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText60',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText61',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText62',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText63',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
  {
    text: 'MatchCall_PersonalizedText64',
    stringVarFuncIds: STRS_NORMAL_MSG,
  },
];

/** 1:1 (match_call.c:912) */
const sMatchCallBattleFrontierStreakTexts = [
  {
    text: 'MatchCall_BattleFrontierStreakText1',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText2',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText3',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText4',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText5',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText6',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText7',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText8',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText9',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText10',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText11',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText12',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText13',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierStreakText14',
    stringVarFuncIds: STRS_FRONTIER,
  },
];

/** 1:1 (match_call.c:930) */
const sMatchCallBattleFrontierRecordStreakTexts = [
  {
    text: 'MatchCall_BattleFrontierRecordStreakText1',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText2',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText3',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText4',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText5',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText6',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText7',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText8',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText9',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText10',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText11',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText12',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText13',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleFrontierRecordStreakText14',
    stringVarFuncIds: STRS_FRONTIER,
  },
];

/** 1:1 (match_call.c:948) */
const sMatchCallBattleDomeTexts = [
  {
    text: 'MatchCall_BattleDomeText1',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText2',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText3',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText4',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText5',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText6',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText7',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText8',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText9',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText10',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText11',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText12',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText13',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattleDomeText14',
    stringVarFuncIds: STRS_FRONTIER,
  },
];

/** 1:1 (match_call.c:966) */
const sMatchCallBattlePikeTexts = [
  {
    text: 'MatchCall_BattlePikeText1',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText2',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText3',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText4',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText5',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText6',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText7',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText8',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText9',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText10',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText11',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText12',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText13',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePikeText14',
    stringVarFuncIds: STRS_FRONTIER,
  },
];

/** 1:1 (match_call.c:984) */
const sMatchCallBattlePyramidTexts = [
  {
    text: 'MatchCall_BattlePyramidText1',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText2',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText3',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText4',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText5',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText6',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText7',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText8',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText9',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText10',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText11',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText12',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText13',
    stringVarFuncIds: STRS_FRONTIER,
  },
  {
    text: 'MatchCall_BattlePyramidText14',
    stringVarFuncIds: STRS_FRONTIER,
  },
];

/** 1:1 (match_call.c:1002) */
const sMatchCallBattleTopics = [
  sMatchCallWildBattleTexts, // [B_TOPIC_WILD - 1]
  sMatchCallNegativeBattleTexts, // [B_TOPIC_NEGATIVE - 1]
  sMatchCallPositiveBattleTexts, // [B_TOPIC_POSITIVE - 1]
];

/** 1:1 (match_call.c:1009) */
const sMatchCallBattleRequestTopics = [
  sMatchCallSameRouteBattleRequestTexts, // [REQ_TOPIC_SAME_ROUTE - 1]
  sMatchCallDifferentRouteBattleRequestTexts, // [REQ_TOPIC_DIFF_ROUTE - 1]
];

/** 1:1 (match_call.c:1015) */
const sMatchCallGeneralTopics = [
  sMatchCallPersonalizedTexts, // [GEN_TOPIC_PERSONAL - 1]
  sMatchCallBattleFrontierStreakTexts, // [GEN_TOPIC_STREAK - 1]
  sMatchCallBattleFrontierRecordStreakTexts, // [GEN_TOPIC_STREAK_RECORD - 1]
  sMatchCallBattleDomeTexts, // [GEN_TOPIC_B_DOME - 1]
  sMatchCallBattlePikeTexts, // [GEN_TOPIC_B_PIKE - 1]
  sMatchCallBattlePyramidTexts, // [GEN_TOPIC_B_PYRAMID - 1]
];

/** 1:1 `static bool32 UpdateMatchCallMinutesCounter(void)` (match_call.c:1041-1053). */
function UpdateMatchCallMinutesCounter(): boolean {
  let curMinutes = 0;
  RtcCalcLocalTime();
  curMinutes = GetCurrentTotalMinutes(gLocalTime);
  if (sMatchCallState.minutes > curMinutes || curMinutes - sMatchCallState.minutes > 9)
  {
    sMatchCallState.minutes = curMinutes;
    return true;
  }
  return false;
}

/** 1:1 `static bool32 CheckMatchCallChance(void)` (match_call.c:1055-1065). */
function CheckMatchCallChance(): boolean {
  let callChance = 1;
  if (!GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG) && GetMonAbility(gPlayerParty[0]) == ABILITY_LIGHTNING_ROD)
    callChance = 2;
  if (Random() % 10 < callChance * 3)
    return true;
  else
    return false;
}

/** 1:1 `static bool32 MapAllowsMatchCall(void)` (match_call.c:1067-1083). */
function MapAllowsMatchCall(): boolean {
  if (!Overworld_MapTypeAllowsTeleportAndFly(gMapHeader.mapType) || gMapHeader.regionMapSectionId == MAPSEC_SAFARI_ZONE)
    return false;
  if (gMapHeader.regionMapSectionId == MAPSEC_SOOTOPOLIS_CITY && FlagGet(FLAG_HIDE_SOOTOPOLIS_CITY_RAYQUAZA) && !FlagGet(FLAG_NEVER_SET_0x0DC))
    return false;
  if (gMapHeader.regionMapSectionId == MAPSEC_MT_CHIMNEY && FlagGet(FLAG_MET_ARCHIE_METEOR_FALLS) && !FlagGet(FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY))
    return false;
  return true;
}

/** 1:1 `static bool32 UpdateMatchCallStepCounter(void)` (match_call.c:1085-1096). */
function UpdateMatchCallStepCounter(): boolean {
  if (++sMatchCallState.stepCounter >= 10)
  {
    sMatchCallState.stepCounter = 0;
    return true;
  }
  else
  {
    return false;
  }
}

/** 1:1 `static bool32 SelectMatchCallTrainer(void)` (match_call.c:1098-1115). */
function SelectMatchCallTrainer(): boolean {
  let matchCallId = 0;
  let numRegistered = GetNumRegisteredTrainers();
  if (numRegistered == 0)
    return false;
  sMatchCallState.trainerId = GetActiveMatchCallTrainerId(Random() % numRegistered);
  sMatchCallState.triggeredFromScript = false;
  if (sMatchCallState.trainerId == REMATCH_TABLE_ENTRIES)
    return false;
  matchCallId = GetTrainerMatchCallId(sMatchCallState.trainerId);
  if (GetRematchTrainerLocation(matchCallId) == gMapHeader.regionMapSectionId && !TrainerIsEligibleForRematch(matchCallId))
    return false;
  return true;
}

// Ignores registrable non-trainer NPCs, and special trainers like Wally and the gym leaders.

/** 1:1 `static u32 GetNumRegisteredTrainers(void)` (match_call.c:1118-1128). */
function GetNumRegisteredTrainers(): number {
  let i = 0;
  let count = 0;
  for ((i = 0, count = 0); i < REMATCH_SPECIAL_TRAINER_START; i++)
  {
    if (FlagGet(TRAINER_REGISTERED_FLAGS_START + i))
      count++;
  }
  return count;
}

/** 1:1 `static u32 GetActiveMatchCallTrainerId(u32 activeMatchCallId)` (match_call.c:1130-1145). */
function GetActiveMatchCallTrainerId(activeMatchCallId: number): number {
  let i = 0;
  for (i = 0; i < REMATCH_SPECIAL_TRAINER_START; i++)
  {
    if (FlagGet(TRAINER_REGISTERED_FLAGS_START + i))
    {
      if (!activeMatchCallId)
        return gRematchTable[i].trainerIds[0];
      activeMatchCallId--;
    }
  }
  return REMATCH_TABLE_ENTRIES;
}

/*
    From the function calls below, a call can only be triggered...
    - If the player has match call
    - Every 10th step
    - Every 10 minutes
    - 1/3 of the time (or 2/3 of the time, if the lead party Pokémon has Lightning Rod)
    - If in a valid outdoor map (not Safari Zone, not underwater, not Mt Chimney with Team Magma, not Sootopolis with legendaries)
    - If an eligible trainer to call the player is selected
*/

/** 1:1 `bool32 TryStartMatchCall(void)` (match_call.c:1156-1170). */
export function TryStartMatchCall(): boolean {
  if (FlagGet(FLAG_HAS_MATCH_CALL) && UpdateMatchCallStepCounter() && UpdateMatchCallMinutesCounter() && CheckMatchCallChance() && MapAllowsMatchCall() && SelectMatchCallTrainer())
  {
    StartMatchCall();
    return true;
  }
  return false;
}

/** 1:1 `void StartMatchCallFromScript(const u8 *message)` (match_call.c:1172-1176). */
export function StartMatchCallFromScript(message: Uint8Array): void {
  sMatchCallState.triggeredFromScript = true;
  StartMatchCall();
}

/** 1:1 `bool32 IsMatchCallTaskActive(void)` (match_call.c:1178-1181). */
export function IsMatchCallTaskActive(): boolean {
  return FuncIsActiveTask(ExecuteMatchCall);
}

/** 1:1 `static void StartMatchCall(void)` (match_call.c:1183-1195). */
function StartMatchCall(): void {
  if (!sMatchCallState.triggeredFromScript)
  {
    LockPlayerFieldControls();
    FreezeObjectEvents();
    PlayerFreeze();
    StopPlayerAvatar();
  }
  PlaySE(SE_POKENAV_CALL);
  CreateTask((t: { taskId: number }) => ExecuteMatchCall(t.taskId), 1);
}

// TRANSPILER-TODO INCGFX : sMatchCallWindow_Pal ← graphics/pokenav/match_call/window.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMatchCallWindow_Pal: any = null;

// TRANSPILER-TODO INCGFX : sMatchCallWindow_Gfx ← graphics/pokenav/match_call/window.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sMatchCallWindow_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sPokenavIcon_Pal ← graphics/pokenav/match_call/nav_icon.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavIcon_Pal: any = null;

// TRANSPILER-TODO INCGFX : sPokenavIcon_Gfx ← graphics/pokenav/match_call/nav_icon.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sPokenavIcon_Gfx: any = null;

/** 1:1 (match_call.c:1202) */
const sText_PokenavCallEllipsis = encodeOwText("………………\p");

// #define tState data[0]  (alias — expansé aux usages)

// #define tWindowId data[2]  (alias — expansé aux usages)

// #define tIconTaskId data[5]  (alias — expansé aux usages)

/** 1:1 (match_call.c:1208) */
const sMatchCallTaskFuncs: Array<(...args: any[]) => any> = [
  MatchCall_LoadGfx,
  MatchCall_DrawWindow,
  MatchCall_ReadyIntro,
  MatchCall_SlideWindowIn,
  MatchCall_PrintIntro,
  MatchCall_PrintMessage,
  MatchCall_SlideWindowOut,
  MatchCall_EndCall,
];

/** 1:1 `static void ExecuteMatchCall(u8 taskId)` (match_call.c:1220-1230). */
function ExecuteMatchCall(taskId: number): void {
  let data = gTasks[taskId].data;
  if (sMatchCallTaskFuncs[data[0] /* tState */](taskId))
  {
    data[0] /* tState */++;
    data[1] = 0;
    // Never read
    if ((data[0] /* tState */ & 0xFFFF) > 7)
      DestroyTask(taskId);
  }
}

/** 1:1 (match_call.c:1232) */
const sMatchCallTextWindow = {
  bg: 0,
  tilemapLeft: 1,
  tilemapTop: 15,
  width: 28,
  height: 4,
  paletteNum: 15,
  baseBlock: 0x200,
};

const TILE_MC_WINDOW = 0x270; // 1:1 match_call.c:1243

const TILE_POKENAV_ICON = 0x279; // 1:1 match_call.c:1244

/** 1:1 `static bool32 MatchCall_LoadGfx(u8 taskId)` (match_call.c:1246-1275). */
function MatchCall_LoadGfx(taskId: number): boolean {
  let data = gTasks[taskId].data;
  data[2] /* tWindowId */ = AddWindow(sMatchCallTextWindow);
  if (data[2] /* tWindowId */ == WINDOW_NONE)
  {
    DestroyTask(taskId);
    return false;
  }
  if (LoadBgTiles(0, sMatchCallWindow_Gfx, sMatchCallWindow_Gfx.length /* TRANSPILER-TODO sizeof */, TILE_MC_WINDOW) == 0xFFFF)
  {
    RemoveWindow(data[2] /* tWindowId */);
    DestroyTask(taskId);
    return false;
  }
  if (!DecompressAndCopyTileDataToVram(0, sPokenavIcon_Gfx, 0, TILE_POKENAV_ICON, 0))
  {
    RemoveWindow(data[2] /* tWindowId */);
    DestroyTask(taskId);
    return false;
  }
  FillWindowPixelBuffer(data[2] /* tWindowId */, PIXEL_FILL(8));
  LoadPalette(sMatchCallWindow_Pal, BG_PLTT_ID(14), sMatchCallWindow_Pal.length /* TRANSPILER-TODO sizeof */);
  LoadPalette(sPokenavIcon_Pal, BG_PLTT_ID(15), sPokenavIcon_Pal.length /* TRANSPILER-TODO sizeof */);
  ChangeBgY(0, -0x2000, BG_COORD_SET);
  return true;
}

/** 1:1 `static bool32 MatchCall_DrawWindow(u8 taskId)` (match_call.c:1277-1290). */
function MatchCall_DrawWindow(taskId: number): boolean {
  let data = gTasks[taskId].data;
  if (FreeTempTileDataBuffersIfPossible())
    return false;
  PutWindowTilemap(data[2] /* tWindowId */);
  DrawMatchCallTextBoxBorder_Internal(data[2] /* tWindowId */, TILE_MC_WINDOW, 14);
  WriteSequenceToBgTilemapBuffer(0, (0xF << 12) | TILE_POKENAV_ICON, 1, 15, 4, 4, 17, 1);
  data[5] /* tIconTaskId */ = CreateTask((t: { taskId: number }) => Task_SpinPokenavIcon(t.taskId), 10);
  CopyWindowToVram(data[2] /* tWindowId */, COPYWIN_GFX);
  CopyBgTilemapBufferToVram(0);
  return true;
}

/** 1:1 `static bool32 MatchCall_ReadyIntro(u8 taskId)` (match_call.c:1292-1303). */
function MatchCall_ReadyIntro(taskId: number): boolean {
  let data = gTasks[taskId].data;
  if (!IsDma3ManagerBusyWithBgCopy())
  {
    // Note that "..." is not printed yet, just readied
    InitMatchCallTextPrinter(data[2] /* tWindowId */, sText_PokenavCallEllipsis);
    return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_SlideWindowIn(u8 taskId)` (match_call.c:1305-1314). */
function MatchCall_SlideWindowIn(taskId: number): boolean {
  if (ChangeBgY(0, 0x600, BG_COORD_ADD) >= 0)
  {
    ChangeBgY(0, 0, BG_COORD_SET);
    return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_PrintIntro(u8 taskId)` (match_call.c:1316-1331). */
function MatchCall_PrintIntro(taskId: number): boolean {
  let data = gTasks[taskId].data;
  if (!RunMatchCallTextPrinter(data[2] /* tWindowId */))
  {
    FillWindowPixelBuffer(data[2] /* tWindowId */, PIXEL_FILL(8));
    // Ready the message
    if (!sMatchCallState.triggeredFromScript)
      SelectMatchCallMessage(sMatchCallState.trainerId, gStringVar4);
    InitMatchCallTextPrinter(data[2] /* tWindowId */, gStringVar4);
    return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_PrintMessage(u8 taskId)` (match_call.c:1333-1345). */
function MatchCall_PrintMessage(taskId: number): boolean {
  let data = gTasks[taskId].data;
  if (!RunMatchCallTextPrinter(data[2] /* tWindowId */) && !IsSEPlaying() && JOY_NEW(A_BUTTON | B_BUTTON))
  {
    FillWindowPixelBuffer(data[2] /* tWindowId */, PIXEL_FILL(8));
    CopyWindowToVram(data[2] /* tWindowId */, COPYWIN_GFX);
    PlaySE(SE_POKENAV_HANG_UP);
    return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_SlideWindowOut(u8 taskId)` (match_call.c:1347-1360). */
function MatchCall_SlideWindowOut(taskId: number): boolean {
  let data = gTasks[taskId].data;
  if (ChangeBgY(0, 0x600, BG_COORD_SUB) <= -0x2000)
  {
    FillBgTilemapBufferRect_Palette0(0, 0, 0, 14, 30, 6);
    DestroyTask(data[5] /* tIconTaskId */);
    RemoveWindow(data[2] /* tWindowId */);
    CopyBgTilemapBufferToVram(0);
    return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_EndCall(u8 taskId)` (match_call.c:1362-1382). */
function MatchCall_EndCall(taskId: number): boolean {
  let playerObjectId = 0;
  if (!IsDma3ManagerBusyWithBgCopy() && !IsSEPlaying())
  {
    ChangeBgY(0, 0, BG_COORD_SET);
    if (!sMatchCallState.triggeredFromScript)
    {
      LoadMessageBoxAndBorderGfx();
      playerObjectId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
      ObjectEventClearHeldMovementIfFinished(gObjectEvents[playerObjectId]);
      ScriptMovement_UnfreezeObjectEvents();
      UnfreezeObjectEvents();
      UnlockPlayerFieldControls();
    }
    return true;
  }
  return false;
}

/** 1:1 `static void DrawMatchCallTextBoxBorder_Internal(u32 windowId, u32 tileOffset, u32 paletteId)` (match_call.c:1384-1404). */
function DrawMatchCallTextBoxBorder_Internal(windowId: number, tileOffset: number, paletteId: number): void {
  let bg = 0;
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let tileNum = 0;
  bg = GetWindowAttribute(windowId, WINDOW_BG);
  x = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);
  y = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);
  width = GetWindowAttribute(windowId, WINDOW_WIDTH);
  height = GetWindowAttribute(windowId, WINDOW_HEIGHT);
  tileNum = tileOffset + GetBgAttribute(bg, BG_ATTR_BASETILE);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 0), x - 1, y - 1, 1, 1);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 1), x, y - 1, width, 1);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 2), x + width, y - 1, 1, 1);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 3), x - 1, y, 1, height);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 4), x + width, y, 1, height);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 5), x - 1, y + height, 1, 1);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 6), x, y + height, width, 1);
  FillBgTilemapBufferRect_Palette0(bg, ((paletteId << 12) & 0xF000) | (tileNum + 7), x + width, y + height, 1, 1);
}

/** 1:1 `static void InitMatchCallTextPrinter(int windowId, const u8 *str)` (match_call.c:1406-1425). */
function InitMatchCallTextPrinter(windowId: number, str: Uint8Array): void {
  const printerTemplate = { currentChar: null as any, windowId: 0, fontId: 0, x: 0, y: 0, currentX: 0, currentY: 0, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 0, bgColor: 0, shadowColor: 0 };
  printerTemplate.currentChar = str;
  printerTemplate.windowId = windowId;
  printerTemplate.fontId = FONT_NORMAL;
  printerTemplate.x = 32;
  printerTemplate.y = 1;
  printerTemplate.currentX = 32;
  printerTemplate.currentY = 1;
  printerTemplate.letterSpacing = 0;
  printerTemplate.lineSpacing = 0;
  printerTemplate.unk = 0;
  printerTemplate.fgColor = TEXT_DYNAMIC_COLOR_1;
  printerTemplate.bgColor = TEXT_COLOR_BLUE;
  printerTemplate.shadowColor = TEXT_DYNAMIC_COLOR_5;
  gTextFlags.useAlternateDownArrow = false;
  AddTextPrinter(printerTemplate, GetPlayerTextSpeedDelay(), null);
}

/** 1:1 `static bool32 RunMatchCallTextPrinter(int windowId)` (match_call.c:1427-1436). */
function RunMatchCallTextPrinter(windowId: number): boolean {
  if (JOY_HELD(A_BUTTON))
    gTextFlags.canABSpeedUpPrint = true;
  else
    gTextFlags.canABSpeedUpPrint = false;
  RunTextPrinters();
  return IsTextPrinterActive(windowId);
}

// #define tTimer data[0]  (alias — expansé aux usages)

// #define tSpinStage data[1]  (alias — expansé aux usages)

// #define tTileNum data[2]  (alias — expansé aux usages)

/** 1:1 `static void Task_SpinPokenavIcon(u8 taskId)` (match_call.c:1442-1455). */
function Task_SpinPokenavIcon(taskId: number): void {
  let data = gTasks[taskId].data;
  if (++data[0] /* tTimer */ > 8)
  {
    data[0] /* tTimer */ = 0;
    if (++data[1] /* tSpinStage */ > 7)
      data[1] /* tSpinStage */ = 0;
    data[2] /* tTileNum */ = (data[1] /* tSpinStage */ * 16) + TILE_POKENAV_ICON;
    WriteSequenceToBgTilemapBuffer(0, data[2] /* tTileNum */ | ~0xFFF, 1, 15, 4, 4, 17, 1);
    CopyBgTilemapBufferToVram(0);
  }
}

/** 1:1 `static bool32 TrainerIsEligibleForRematch(int matchCallId)` (match_call.c:1461-1464). */
function TrainerIsEligibleForRematch(matchCallId: number): boolean {
  return gSaveBlock1Ptr.trainerRematches[matchCallId] > 0;
}

/** 1:1 `static mapsec_u16_t GetRematchTrainerLocation(int matchCallId)` (match_call.c:1466-1470). */
function GetRematchTrainerLocation(matchCallId: number): number {
  let mapHeader = Overworld_GetMapHeaderByGroupAndId(gRematchTable[matchCallId].mapGroup, gRematchTable[matchCallId].mapNum);
  return mapHeader.regionMapSectionId;
}

/** 1:1 `static u32 GetNumRematchTrainersFought(void)` (match_call.c:1472-1482). */
function GetNumRematchTrainersFought(): number {
  let i = 0;
  let count = 0;
  for ((i = 0, count = 0); i < REMATCH_SPECIAL_TRAINER_START; i++)
  {
    if (HasTrainerBeenFought(gRematchTable[i].trainerIds[0]))
      count++;
  }
  return count;
}

// Look through the rematch table for trainers that have been defeated once before.

// Return the index into the rematch table of the nth defeated trainer,

// or REMATCH_TABLE_ENTRIES if fewer than n rematch trainers have been defeated.

/** 1:1 `static u32 GetNthRematchTrainerFought(int n)` (match_call.c:1487-1503). */
function GetNthRematchTrainerFought(n: number): number {
  let i = 0;
  let count = 0;
  for ((i = 0, count = 0); i < REMATCH_TABLE_ENTRIES; i++)
  {
    if (HasTrainerBeenFought(gRematchTable[i].trainerIds[0]))
    {
      if (count == n)
        return i;
      count++;
    }
  }
  return REMATCH_TABLE_ENTRIES;
}

/** 1:1 `bool32 SelectMatchCallMessage(int trainerId, u8 *str)` (match_call.c:1505-1543). */
export function SelectMatchCallMessage(trainerId: number, str: Uint8Array): boolean {
  let matchCallId = 0;
  let matchCallText: any = null;
  let newRematchRequest = false;
  matchCallId = GetTrainerMatchCallId(trainerId);
  sBattleFrontierStreakInfo.facilityId = 0;
  // If the player is on the same route as the trainer
  // and they can be rematched, they will always request a battle
  if (TrainerIsEligibleForRematch(matchCallId) && GetRematchTrainerLocation(matchCallId) == gMapHeader.regionMapSectionId)
  {
    matchCallText = GetSameRouteMatchCallText(matchCallId, str);
  }
  else if (ShouldTrainerRequestBattle(matchCallId))
  {
    matchCallText = GetDifferentRouteMatchCallText(matchCallId, str);
    newRematchRequest = true;
    UpdateRematchIfDefeated(matchCallId);
  }
  else if (Random() % 3)
  {
    // Message talking about a battle the NPC had
    matchCallText = GetBattleMatchCallText(matchCallId, str);
  }
  else
  {
    // Message talking about something else
    matchCallText = GetGeneralMatchCallText(matchCallId, str);
  }
  BuildMatchCallString(matchCallId, matchCallText, str);
  return newRematchRequest;
}

/** 1:1 `static int GetTrainerMatchCallId(int trainerId)` (match_call.c:1545-1555). */
function GetTrainerMatchCallId(trainerId: number): number {
  let i = 0;
  while (1)
  {
    if (sMatchCallTrainers[i].trainerId == trainerId)
      return i;
    else
      i++;
  }
}

/** 1:1 `static const struct MatchCallText *GetSameRouteMatchCallText(int matchCallId, u8 *str)` (match_call.c:1557-1564). */
function GetSameRouteMatchCallText(matchCallId: number, str: Uint8Array): MatchCallText | null {
  let textId = sMatchCallTrainers[matchCallId].sameRouteMatchCallTextId;
  let mask = 0xFF;
  let topic = (textId >> 8) - 1;
  let id = (textId & mask) - 1;
  return sMatchCallBattleRequestTopics[topic][id] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
}

/** 1:1 `static const struct MatchCallText *GetDifferentRouteMatchCallText(int matchCallId, u8 *str)` (match_call.c:1566-1573). */
function GetDifferentRouteMatchCallText(matchCallId: number, str: Uint8Array): MatchCallText | null {
  let textId = sMatchCallTrainers[matchCallId].differentRouteMatchCallTextId;
  let mask = 0xFF;
  let topic = (textId >> 8) - 1;
  let id = (textId & mask) - 1;
  return sMatchCallBattleRequestTopics[topic][id] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
}

/** 1:1 `static const struct MatchCallText *GetBattleMatchCallText(int matchCallId, u8 *str)` (match_call.c:1575-1589). */
function GetBattleMatchCallText(matchCallId: number, str: Uint8Array): MatchCallText | null {
  let mask = 0;
  let textId = 0;
  let topic = 0;
  let id = 0;
  topic = Random() % 3;
  textId = sMatchCallTrainers[matchCallId].battleTopicTextIds[topic];
  if (!textId)
    SpriteCallbackDummy(null);
  // leftover debugging ???
  mask = 0xFF;
  topic = (textId >>> 8) - 1;
  id = (textId & mask) - 1;
  return sMatchCallBattleTopics[topic][id] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
}

/** 1:1 `static const struct MatchCallText *GetGeneralMatchCallText(int matchCallId, u8 *str)` (match_call.c:1591-1634). */
function GetGeneralMatchCallText(matchCallId: number, str: Uint8Array): MatchCallText | null {
  let i = 0;
  let count = 0;
  const topic = { v: 0 }; // TRANSPILER: &topic pris → box
  let id = 0;
  let rand = 0;
  rand = Random();
  if (!(rand & 1))
  {
    // Count the number of facilities with a win streak
    for ((count = 0, i = 0); i < NUM_FRONTIER_FACILITIES; i++)
    {
      if (GetFrontierStreakInfo(i, topic) > 1)
        count++;
    }
    if (count)
    {
      // At least one facility with a win streak
      // Randomly choose one to have a call about
      count = Random() % count;
      for (i = 0; i < NUM_FRONTIER_FACILITIES; i++)
      {
        sBattleFrontierStreakInfo.streak = GetFrontierStreakInfo(i, topic);
        if (sBattleFrontierStreakInfo.streak < 2)
          continue;
        if (!count)
          break;
        count--;
      }
      sBattleFrontierStreakInfo.facilityId = i;
      id = sMatchCallTrainers[matchCallId].battleFrontierRecordStreakTextIndex - 1;
      return sMatchCallGeneralTopics[topic.v][id] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    }
  }
  topic.v = (sMatchCallTrainers[matchCallId].generalTextId >> 8) - 1;
  id = (sMatchCallTrainers[matchCallId].generalTextId & 0xFF) - 1;
  return sMatchCallGeneralTopics[topic.v][id] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
}

/** 1:1 `static void BuildMatchCallString(int matchCallId, const struct MatchCallText *matchCallText, u8 *str)` (match_call.c:1636-1640). */
function BuildMatchCallString(matchCallId: number, matchCallText: MatchCallText, str: Uint8Array): void {
  PopulateMatchCallStringVars(matchCallId, matchCallText.stringVarFuncIds);
  // `text` = clé décomp (data/text/match_call.inc extrait) → résoudre en texte FR.
  StringExpandPlaceholders(str, getString(matchCallText.text));
}

/** 1:1 (match_call.c:1642) */
// 1:1 match_call.c:1642 — tableau de POINTEURS u8* (le transpileur coerçait les buffers en nombres).
const sMatchCallTextStringVars = [gStringVar1, gStringVar2, gStringVar3];

/** 1:1 `static void PopulateMatchCallStringVars(int matchCallId, const s8 *stringVarFuncIds)` (match_call.c:1644-1652). */
function PopulateMatchCallStringVars(matchCallId: number, stringVarFuncIds: Int8Array): void {
  let i = 0;
  for (i = 0; i < NUM_STRVARS_IN_MSG; i++)
  {
    if (stringVarFuncIds[i] >= 0)
      PopulateMatchCallStringVar(matchCallId, stringVarFuncIds[i], sMatchCallTextStringVars[i]);
  }
}

/** 1:1 (match_call.c:1654) */
const sPopulateMatchCallStringVarFuncs: Array<(...args: any[]) => any> = [
  PopulateTrainerName, // [STR_TRAINER_NAME]
  PopulateMapName, // [STR_MAP_NAME]
  PopulateSpeciesFromTrainerLocation, // [STR_SPECIES_IN_ROUTE]
  PopulateSpeciesFromTrainerParty, // [STR_SPECIES_IN_PARTY]
  PopulateBattleFrontierFacilityName, // [STR_FACILITY_NAME]
  PopulateBattleFrontierStreak, // [STR_FRONTIER_STREAK]
];

/** 1:1 `static void PopulateMatchCallStringVar(int matchCallId, int funcId, u8 *destStr)` (match_call.c:1664-1667). */
function PopulateMatchCallStringVar(matchCallId: number, funcId: number, destStr: Uint8Array): void {
  sPopulateMatchCallStringVarFuncs[funcId](matchCallId, destStr);
}

/** 1:1 (match_call.c:1669) */
const sMultiTrainerMatchCallTexts = [
  {
    trainerId: TRAINER_KIRA_AND_DAN_1,
    text: getString('gText_Kira'),
  },
  {
    trainerId: TRAINER_AMY_AND_LIV_1,
    text: getString('gText_Amy'),
  },
  {
    trainerId: TRAINER_JOHN_AND_JAY_1,
    text: getString('gText_John'),
  },
  {
    trainerId: TRAINER_LILA_AND_ROY_1,
    text: getString('gText_Roy'),
  },
  {
    trainerId: TRAINER_GABBY_AND_TY_1,
    text: getString('gText_Gabby'),
  },
  {
    trainerId: TRAINER_ANNA_AND_MEG_1,
    text: getString('gText_Anna'),
  },
];

/** 1:1 `static void PopulateTrainerName(int matchCallId, u8 *destStr)` (match_call.c:1679-1693). */
function PopulateTrainerName(matchCallId: number, destStr: Uint8Array): void {
  let i = 0;
  let trainerId = sMatchCallTrainers[matchCallId].trainerId;
  for (i = 0; i < sMultiTrainerMatchCallTexts.length; i++)
  {
    if (sMultiTrainerMatchCallTexts[i].trainerId == trainerId)
    {
      StringCopy(destStr, sMultiTrainerMatchCallTexts[i].text);
      return;
    }
  }
  StringCopy(destStr, gTrainers[trainerId].trainerName);
}

/** 1:1 `static void PopulateMapName(int matchCallId, u8 *destStr)` (match_call.c:1695-1698). */
function PopulateMapName(matchCallId: number, destStr: Uint8Array): void {
  GetMapName(destStr, GetRematchTrainerLocation(matchCallId), 0);
}

/** 1:1 `static u8 GetLandEncounterSlot(void)` (match_call.c:1700-1727). */
function GetLandEncounterSlot(): number {
  let rand = Random() % 100;
  if (rand < 20)
    return 0;
  else if (rand >= 20 && rand < 40)
    return 1;
  else if (rand >= 40 && rand < 50)
    return 2;
  else if (rand >= 50 && rand < 60)
    return 3;
  else if (rand >= 60 && rand < 70)
    return 4;
  else if (rand >= 70 && rand < 80)
    return 5;
  else if (rand >= 80 && rand < 85)
    return 6;
  else if (rand >= 85 && rand < 90)
    return 7;
  else if (rand >= 90 && rand < 94)
    return 8;
  else if (rand >= 94 && rand < 98)
    return 9;
  else if (rand >= 98 && rand < 99)
    return 10;
  else
    return 11;
}

/** 1:1 `static u8 GetWaterEncounterSlot(void)` (match_call.c:1729-1742). */
function GetWaterEncounterSlot(): number {
  let rand = Random() % 100;
  if (rand < 60)
    return 0;
  else if (rand >= 60 && rand < 90)
    return 1;
  else if (rand >= 90 && rand < 95)
    return 2;
  else if (rand >= 95 && rand < 99)
    return 3;
  else
    return 4;
}

/** 1:1 `static void PopulateSpeciesFromTrainerLocation(int matchCallId, u8 *destStr)` (match_call.c:1744-1788). */
function PopulateSpeciesFromTrainerLocation(matchCallId: number, destStr: Uint8Array): void {
  const species = new Uint16Array(2);
  let numSpecies = 0;
  let slot = 0;
  let i = 0;
  if (gWildMonHeaders[i].mapGroup != MAP_GROUP(MAP_UNDEFINED))
  {
    while (gWildMonHeaders[i].mapGroup != MAP_GROUP(MAP_UNDEFINED))
    {
      if (gWildMonHeaders[i].mapGroup == gRematchTable[matchCallId].mapGroup && gWildMonHeaders[i].mapNum == gRematchTable[matchCallId].mapNum)
        break;
      i++;
    }
    if (gWildMonHeaders[i].mapGroup != MAP_GROUP(MAP_UNDEFINED))
    {
      numSpecies = 0;
      if (gWildMonHeaders[i].landMonsInfo)
      {
        slot = GetLandEncounterSlot();
        species[numSpecies] = gWildMonHeaders[i].landMonsInfo.wildPokemon[slot].species;
        numSpecies++;
      }
      if (gWildMonHeaders[i].waterMonsInfo)
      {
        slot = GetWaterEncounterSlot();
        species[numSpecies] = gWildMonHeaders[i].waterMonsInfo.wildPokemon[slot].species;
        numSpecies++;
      }
      if (numSpecies)
      {
        StringCopy(destStr, gSpeciesNames[species[Random() % numSpecies]]);
        return;
      }
    }
  }
  destStr[0] = EOS;
}

/** 1:1 `static void PopulateSpeciesFromTrainerParty(int matchCallId, u8 *destStr)` (match_call.c:1790-1819). */
function PopulateSpeciesFromTrainerParty(matchCallId: number, destStr: Uint8Array): void {
  let trainerId = 0;
  const party = { NoItemDefaultMoves: null as any, NoItemCustomMoves: null as any, ItemDefaultMoves: null as any, ItemCustomMoves: null as any };
  let monId = 0;
  let speciesName: any = null;
  trainerId = GetLastBeatenRematchTrainerId(sMatchCallTrainers[matchCallId].trainerId);
  party = gTrainers[trainerId].party;
  monId = Random() % gTrainers[trainerId].partySize;
  switch (gTrainers[trainerId].partyFlags) {
    case 0:
    default:
      speciesName = gSpeciesNames[party.NoItemDefaultMoves[monId].species];
      break;
    case F_TRAINER_PARTY_CUSTOM_MOVESET:
      speciesName = gSpeciesNames[party.NoItemCustomMoves[monId].species];
      break;
    case F_TRAINER_PARTY_HELD_ITEM:
      speciesName = gSpeciesNames[party.ItemDefaultMoves[monId].species];
      break;
    case F_TRAINER_PARTY_CUSTOM_MOVESET | F_TRAINER_PARTY_HELD_ITEM:
      speciesName = gSpeciesNames[party.ItemCustomMoves[monId].species];
      break;
  }
  StringCopy(destStr, speciesName);
}

/** 1:1 (match_call.c:1821) */
const sBattleFrontierFacilityNames = Uint8Array.from([
  getString('gText_BattleTower2'), // [FRONTIER_FACILITY_TOWER]
  getString('gText_BattleDome'), // [FRONTIER_FACILITY_DOME]
  getString('gText_BattlePalace'), // [FRONTIER_FACILITY_PALACE]
  getString('gText_BattleArena'), // [FRONTIER_FACILITY_ARENA]
  getString('gText_BattlePike'), // [MATCH_CALL_PIKE]
  getString('gText_BattleFactory'), // [MATCH_CALL_FACTORY]
  getString('gText_BattlePyramid'), // [FRONTIER_FACILITY_PYRAMID]
]);

/** 1:1 `static void PopulateBattleFrontierFacilityName(int matchCallId, u8 *destStr)` (match_call.c:1832-1835). */
function PopulateBattleFrontierFacilityName(matchCallId: number, destStr: Uint8Array): void {
  StringCopy(destStr, sBattleFrontierFacilityNames[sBattleFrontierStreakInfo.facilityId]);
}

/** 1:1 `static void PopulateBattleFrontierStreak(int matchCallId, u8 *destStr)` (match_call.c:1837-1848). */
function PopulateBattleFrontierStreak(matchCallId: number, destStr: Uint8Array): void {
  let i = 0;
  let streak = sBattleFrontierStreakInfo.streak;
  while (streak != 0)
  {
    streak = Math.trunc(streak / 10);
    i++;
  }
  ConvertIntToDecimalStringN(destStr, sBattleFrontierStreakInfo.streak, STR_CONV_MODE_LEFT_ALIGN, i);
}

/** 1:1 (match_call.c:1850) */
const sBadgeFlags = Uint16Array.from([
  FLAG_BADGE01_GET,
  FLAG_BADGE02_GET,
  FLAG_BADGE03_GET,
  FLAG_BADGE04_GET,
  FLAG_BADGE05_GET,
  FLAG_BADGE06_GET,
  FLAG_BADGE07_GET,
  FLAG_BADGE08_GET,
]);

/** 1:1 `static int GetNumOwnedBadges(void)` (match_call.c:1862-1873). */
function GetNumOwnedBadges(): number {
  let i = 0;
  for (i = 0; i < NUM_BADGES; i++)
  {
    if (!FlagGet(sBadgeFlags[i]))
      break;
  }
  return i;
}

// Whether or not a trainer calling the player from a different route should request a battle

/** 1:1 `static bool32 ShouldTrainerRequestBattle(int matchCallId)` (match_call.c:1876-1902). */
function ShouldTrainerRequestBattle(matchCallId: number): boolean {
  let dayCount = 0;
  let otId = 0;
  let dewfordRand = 0;
  let numRematchTrainersFought = 0;
  let max = 0;
  let rand = 0;
  let n = 0;
  if (GetNumOwnedBadges() < 5)
    return false;
  dayCount = RtcGetLocalDayCount();
  otId = GetTrainerId(gSaveBlock2Ptr.playerTrainerId) & 0xFFFF;
  dewfordRand = gSaveBlock1Ptr.dewfordTrends[0].rand;
  numRematchTrainersFought = GetNumRematchTrainersFought();
  max = Math.trunc((numRematchTrainersFought * 13) / 10);
  rand = ((dayCount ^ dewfordRand) + (dewfordRand ^ GetGameStat(GAME_STAT_TRAINER_BATTLES))) ^ otId;
  n = rand % max;
  if (n < numRematchTrainersFought)
  {
    if (GetNthRematchTrainerFought(n) == matchCallId)
      return true;
  }
  return false;
}

/** 1:1 `static u16 GetFrontierStreakInfo(u16 facilityId, u32 *topicTextId)` (match_call.c:1904-1983). */
function GetFrontierStreakInfo(facilityId: number, topicTextId: { v: number }): number {
  let i = 0;
  let j = 0;
  let streak = 0;
  switch (facilityId) {
    case FRONTIER_FACILITY_DOME:
      for (i = 0; i < (gSaveBlock2Ptr.frontier.domeRecordWinStreaks.length | 0); i++)
      {
        for (j = 0; j < FRONTIER_LVL_MODE_COUNT; j++)
        {
          if (streak < gSaveBlock2Ptr.frontier.domeRecordWinStreaks[i][j])
            streak = gSaveBlock2Ptr.frontier.domeRecordWinStreaks[i][j];
        }
      }
      topicTextId.v = GEN_TOPIC_B_DOME - 1;
      break;
    case MATCH_CALL_PIKE:
      for (i = 0; i < FRONTIER_LVL_MODE_COUNT; i++)
      {
        if (streak < gSaveBlock2Ptr.frontier.pikeRecordStreaks[i])
          streak = gSaveBlock2Ptr.frontier.pikeRecordStreaks[i];
      }
      topicTextId.v = GEN_TOPIC_B_PIKE - 1;
      break;
    case FRONTIER_FACILITY_TOWER:
      for (i = 0; i < (gSaveBlock2Ptr.frontier.towerRecordWinStreaks.length | 0); i++)
      {
        for (j = 0; j < FRONTIER_LVL_MODE_COUNT; j++)
        {
          if (streak < gSaveBlock2Ptr.frontier.towerRecordWinStreaks[i][j])
            streak = gSaveBlock2Ptr.frontier.towerRecordWinStreaks[i][j];
        }
      }
      topicTextId.v = GEN_TOPIC_STREAK_RECORD - 1;
      break;
    case FRONTIER_FACILITY_PALACE:
      for (i = 0; i < (gSaveBlock2Ptr.frontier.palaceRecordWinStreaks.length | 0); i++)
      {
        for (j = 0; j < FRONTIER_LVL_MODE_COUNT; j++)
        {
          if (streak < gSaveBlock2Ptr.frontier.palaceRecordWinStreaks[i][j])
            streak = gSaveBlock2Ptr.frontier.palaceRecordWinStreaks[i][j];
        }
      }
      topicTextId.v = GEN_TOPIC_STREAK_RECORD - 1;
      break;
    case MATCH_CALL_FACTORY:
      for (i = 0; i < (gSaveBlock2Ptr.frontier.factoryRecordWinStreaks.length | 0); i++)
      {
        for (j = 0; j < FRONTIER_LVL_MODE_COUNT; j++)
        {
          if (streak < gSaveBlock2Ptr.frontier.factoryRecordWinStreaks[i][j])
            streak = gSaveBlock2Ptr.frontier.factoryRecordWinStreaks[i][j];
        }
      }
      topicTextId.v = GEN_TOPIC_STREAK_RECORD - 1;
      break;
    case FRONTIER_FACILITY_ARENA:
      for (i = 0; i < FRONTIER_LVL_MODE_COUNT; i++)
      {
        if (streak < gSaveBlock2Ptr.frontier.arenaRecordStreaks[i])
          streak = gSaveBlock2Ptr.frontier.arenaRecordStreaks[i];
      }
      topicTextId.v = GEN_TOPIC_STREAK_RECORD - 1;
      break;
    case FRONTIER_FACILITY_PYRAMID:
      for (i = 0; i < FRONTIER_LVL_MODE_COUNT; i++)
      {
        if (streak < gSaveBlock2Ptr.frontier.pyramidRecordStreaks[i])
          streak = gSaveBlock2Ptr.frontier.pyramidRecordStreaks[i];
      }
      topicTextId.v = GEN_TOPIC_B_PYRAMID - 1;
      break;
  }
  return streak;
}

/** 1:1 `static u8 GetPokedexRatingLevel(u16 numSeen)` (match_call.c:1985-2037). */
function GetPokedexRatingLevel(numSeen: number): number {
  if (numSeen < 10)
    return 0;
  if (numSeen < 20)
    return 1;
  if (numSeen < 30)
    return 2;
  if (numSeen < 40)
    return 3;
  if (numSeen < 50)
    return 4;
  if (numSeen < 60)
    return 5;
  if (numSeen < 70)
    return 6;
  if (numSeen < 80)
    return 7;
  if (numSeen < 90)
    return 8;
  if (numSeen < 100)
    return 9;
  if (numSeen < 110)
    return 10;
  if (numSeen < 120)
    return 11;
  if (numSeen < 130)
    return 12;
  if (numSeen < 140)
    return 13;
  if (numSeen < 150)
    return 14;
  if (numSeen < 160)
    return 15;
  if (numSeen < 170)
    return 16;
  if (numSeen < 180)
    return 17;
  if (numSeen < 190)
    return 18;
  if (numSeen < 200)
    return 19;
  if (GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_DEOXYS), FLAG_GET_CAUGHT))
    numSeen--;
  if (GetSetPokedexFlag(SpeciesToNationalPokedexNum(SPECIES_JIRACHI), FLAG_GET_CAUGHT))
    numSeen--;
  if (numSeen < 200)
    return 19;
  else
    return 20;
}

/** 1:1 (match_call.c:2039) */
const sBirchDexRatingTexts = Uint8Array.from([
  'gBirchDexRatingText_LessThan10',
  'gBirchDexRatingText_LessThan20',
  'gBirchDexRatingText_LessThan30',
  'gBirchDexRatingText_LessThan40',
  'gBirchDexRatingText_LessThan50',
  'gBirchDexRatingText_LessThan60',
  'gBirchDexRatingText_LessThan70',
  'gBirchDexRatingText_LessThan80',
  'gBirchDexRatingText_LessThan90',
  'gBirchDexRatingText_LessThan100',
  'gBirchDexRatingText_LessThan110',
  'gBirchDexRatingText_LessThan120',
  'gBirchDexRatingText_LessThan130',
  'gBirchDexRatingText_LessThan140',
  'gBirchDexRatingText_LessThan150',
  'gBirchDexRatingText_LessThan160',
  'gBirchDexRatingText_LessThan170',
  'gBirchDexRatingText_LessThan180',
  'gBirchDexRatingText_LessThan190',
  'gBirchDexRatingText_LessThan200',
  'gBirchDexRatingText_DexCompleted',
]);

/** 1:1 `void BufferPokedexRatingForMatchCall(u8 *destStr)` (match_call.c:2064-2100). */
export function BufferPokedexRatingForMatchCall(destStr: Uint8Array): void {
  let numSeen = 0;
  let numCaught = 0;
  let str: any = null;
  let dexRatingLevel = 0;
  let buffer = ({} as any) /* TRANSPILER-TODO Alloc */;
  if (!buffer)
  {
    destStr[0] = EOS;
    return;
  }
  numSeen = GetHoennPokedexCount(FLAG_GET_SEEN);
  numCaught = GetHoennPokedexCount(FLAG_GET_CAUGHT);
  ConvertIntToDecimalStringN(gStringVar1, numSeen, STR_CONV_MODE_LEFT_ALIGN, 3);
  ConvertIntToDecimalStringN(gStringVar2, numCaught, STR_CONV_MODE_LEFT_ALIGN, 3);
  dexRatingLevel = GetPokedexRatingLevel(numCaught);
  str = StringCopy(buffer, 'gBirchDexRatingText_AreYouCurious');
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = CHAR_PROMPT_CLEAR */;
  str = StringCopy(str, 'gBirchDexRatingText_SoYouveSeenAndCaught');
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = CHAR_PROMPT_CLEAR */;
  StringCopy(str, sBirchDexRatingTexts[dexRatingLevel]);
  str = StringExpandPlaceholders(destStr, buffer);
  if (IsNationalPokedexEnabled())
  {
    void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = CHAR_PROMPT_CLEAR */;
    numSeen = GetNationalPokedexCount(FLAG_GET_SEEN);
    numCaught = GetNationalPokedexCount(FLAG_GET_CAUGHT);
    ConvertIntToDecimalStringN(gStringVar1, numSeen, STR_CONV_MODE_LEFT_ALIGN, 3);
    ConvertIntToDecimalStringN(gStringVar2, numCaught, STR_CONV_MODE_LEFT_ALIGN, 3);
    StringExpandPlaceholders(str, 'gBirchDexRatingText_OnANationwideBasis');
  }
  void buffer /* Free — GC */;
}

/** 1:1 `void LoadMatchCallWindowGfx(u32 windowId, u32 destOffset, u32 paletteId)` (match_call.c:2102-2107). */
export function LoadMatchCallWindowGfx(windowId: number, destOffset: number, paletteId: number): void {
  let bg = GetWindowAttribute(windowId, WINDOW_BG);
  LoadBgTiles(bg, sMatchCallWindow_Gfx, 0x100, destOffset);
  LoadPalette(sMatchCallWindow_Pal, BG_PLTT_ID(paletteId), sMatchCallWindow_Pal.length /* TRANSPILER-TODO sizeof */);
}

/** 1:1 `void DrawMatchCallTextBoxBorder(u32 windowId, u32 tileOffset, u32 paletteId)` (match_call.c:2109-2112). */
export function DrawMatchCallTextBoxBorder(windowId: number, tileOffset: number, paletteId: number): void {
  DrawMatchCallTextBoxBorder_Internal(windowId, tileOffset, paletteId);
}

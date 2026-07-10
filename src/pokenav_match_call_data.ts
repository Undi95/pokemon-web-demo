// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_match_call_data.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_data.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_match_call_data.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLAG_DEFEATED_DEWFORD_GYM, FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, FLAG_DEFEATED_LAVARIDGE_GYM, FLAG_DEFEATED_MOSSDEEP_GYM, FLAG_DEFEATED_PETALBURG_GYM, FLAG_DEFEATED_SOOTOPOLIS_GYM, FLAG_DEFEATED_WALLY_VICTORY_ROAD, FLAG_DELIVERED_DEVON_GOODS, FLAG_DELIVERED_STEVEN_LETTER, FLAG_ENABLE_BRAWLY_MATCH_CALL, FLAG_ENABLE_FLANNERY_MATCH_CALL, FLAG_ENABLE_JUAN_MATCH_CALL, FLAG_ENABLE_MOM_MATCH_CALL, FLAG_ENABLE_MR_STONE_POKENAV, FLAG_ENABLE_NORMAN_MATCH_CALL, FLAG_ENABLE_PROF_BIRCH_MATCH_CALL, FLAG_ENABLE_RIVAL_MATCH_CALL, FLAG_ENABLE_ROXANNE_MATCH_CALL, FLAG_ENABLE_SCOTT_MATCH_CALL, FLAG_ENABLE_TATE_AND_LIZA_MATCH_CALL, FLAG_ENABLE_WALLY_MATCH_CALL, FLAG_ENABLE_WATTSON_MATCH_CALL, FLAG_ENABLE_WINONA_MATCH_CALL, FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT, FLAG_HIDE_MAUVILLE_CITY_WALLY, FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY, FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, FLAG_MET_TEAM_AQUA_HARBOR, FLAG_RECEIVED_CASTFORM, FLAG_RECEIVED_EXP_SHARE, FLAG_RECEIVED_HM_STRENGTH, FLAG_RECEIVED_RED_OR_BLUE_ORB, FLAG_REGISTERED_STEVEN_POKENAV, FLAG_RUSTURF_TUNNEL_OPENED, FLAG_SYS_GAME_CLEAR, FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE, TRAINER_REGISTERED_FLAGS_START } from '../include/constants/flags';
import { FEMALE, MALE } from '../include/constants/global';
import { MAPSEC_DEWFORD_TOWN, MAPSEC_EVER_GRANDE_CITY, MAPSEC_FORTREE_CITY, MAPSEC_LAVARIDGE_TOWN, MAPSEC_LITTLEROOT_TOWN, MAPSEC_MAUVILLE_CITY, MAPSEC_MOSSDEEP_CITY, MAPSEC_NONE, MAPSEC_PETALBURG_CITY, MAPSEC_RUSTBORO_CITY, MAPSEC_SOOTOPOLIS_CITY, MAPSEC_VERDANTURF_TOWN, MAPSEC_VICTORY_ROAD } from '../include/constants/region_map_sections';
import { FACILITY_CLASS_BRENDAN, FACILITY_CLASS_MAY, FACILITY_CLASS_STEVEN } from '../include/constants/trainers';
import { CountBattledRematchTeams, gRematchTable } from './battle_setup';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
import { FlagGet, FlagSet, VarGet } from './event_data';
import { GetTrainerClassNameGenderSpecific } from './international_string_util';
import { StringExpandPlaceholders } from './string_util';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { __wireTodo } from './engine/wire-todo';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const Brendan: any = __wireTodo('Brendan');
const BufferPokedexRatingForMatchCall: any = __wireTodo('BufferPokedexRatingForMatchCall');
const MCFLAVOR: any = __wireTodo('MCFLAVOR');
const May: any = __wireTodo('May');
const gTrainers: any = __wireTodo('gTrainers');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const REMATCH_NORMAN = 69; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_WALLY_VR = 64; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_ROXANNE = 65; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_BRAWLY = 66; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_WATTSON = 67; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_FLANNERY = 68; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_WINONA = 70; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_TATE_AND_LIZA = 71; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_JUAN = 72; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const FLAG_REGISTERED_SIDNEY = 421; // 1:1 include/constants/flags.h:457 (à consolider dans include/)
const REMATCH_SIDNEY = 73; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const FLAG_REGISTERED_PHOEBE = 422; // 1:1 include/constants/flags.h:458 (à consolider dans include/)
const REMATCH_PHOEBE = 74; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const FLAG_REGISTERED_GLACIA = 423; // 1:1 include/constants/flags.h:459 (à consolider dans include/)
const REMATCH_GLACIA = 75; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const FLAG_REGISTERED_DRAKE = 424; // 1:1 include/constants/flags.h:460 (à consolider dans include/)
const REMATCH_DRAKE = 76; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const FLAG_REGISTERED_WALLACE = 425; // 1:1 include/constants/flags.h:461 (à consolider dans include/)
const REMATCH_WALLACE = 77; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const MC_HEADER_STEVEN = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MC_HEADER_BRENDAN = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MC_HEADER_MAY = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const REMATCH_TABLE_ENTRIES = 78; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_ELITE_FOUR_ENTRIES = 73; // 1:1 include/constants/rematches.h:87 (à consolider dans include/)

// NPC below means non-trainer character (no rematch or check page)

// Steven also uses this type but has a check page by using a MatchCallCheckPageOverride

// enum pokenav_match_call_data.c:18
const MC_TYPE_NPC = 0;
const MC_TYPE_TRAINER = 1;
const MC_TYPE_WALLY = 2;
const MC_TYPE_BIRCH = 3;
const MC_TYPE_RIVAL = 4;
const MC_TYPE_LEADER = 5;

// Static type declarations

/** 1:1 `struct MatchCallTextDataStruct` (pokenav_match_call_data.c:30). */
interface MatchCallTextDataStruct {
  text: Uint8Array;
  availabilityFlag: number;
  flagToSetOnCompletion: number;
}

/** 1:1 `struct MatchCallStructCommon` (pokenav_match_call_data.c:36). */
interface MatchCallStructCommon {
  type: number;
  mapSec: number;
  flag: number;
}

/** 1:1 `struct MatchCallStructNPC` (pokenav_match_call_data.c:42). */
interface MatchCallStructNPC {
  type: number;
  mapSec: number;
  flag: number;
  desc: Uint8Array;
  name: Uint8Array;
  textData: any;
}

// Shared by MC_TYPE_TRAINER and MC_TYPE_LEADER

/** 1:1 `struct MatchCallStructTrainer` (pokenav_match_call_data.c:52). */
interface MatchCallStructTrainer {
  type: number;
  mapSec: number;
  flag: number;
  rematchTableIdx: number;
  desc: Uint8Array;
  name: Uint8Array;
  textData: any;
}

/** 1:1 `struct MatchCallLocationOverride` (pokenav_match_call_data.c:62). */
interface MatchCallLocationOverride {
  flag: number;
  mapSec: number;
}

/** 1:1 `struct MatchCallWally` (pokenav_match_call_data.c:67). */
interface MatchCallWally {
  type: number;
  mapSec: number;
  flag: number;
  rematchTableIdx: number;
  desc: Uint8Array;
  textData: any;
  locationData: MatchCallLocationOverride | null;
}

/** 1:1 `struct MatchCallBirch` (pokenav_match_call_data.c:77). */
interface MatchCallBirch {
  type: number;
  mapSec: number;
  flag: number;
  desc: Uint8Array;
  name: Uint8Array;
}

/** 1:1 `struct MatchCallRival` (pokenav_match_call_data.c:85). */
interface MatchCallRival {
  type: number;
  playerGender: number;
  flag: number;
  desc: Uint8Array;
  name: Uint8Array;
  textData: any;
}

/** 1:1 `union match_call_t` (pokenav_match_call_data.c:94). */
interface match_call_t {
  common: MatchCallStructCommon | null;
  npc: MatchCallStructNPC | null;
  trainer: MatchCallStructTrainer | null;
  wally: MatchCallWally | null;
  birch: MatchCallBirch | null;
  rival: MatchCallRival | null;
  leader: MatchCallStructTrainer | null;
}

/** 1:1 `struct MatchCallCheckPageOverride` (pokenav_match_call_data.c:104). */
interface MatchCallCheckPageOverride {
  idx: number;
  facilityClass: number;
  flag: number;
  flavorTexts: Uint8Array;
}

// Static RAM declarations

// Static ROM declarations

// Special flag ID that indicates the start of a section of match calls

// related to a gym leader's rematch. It's expected that there will be

// exactly 3 calls after the call associated with this flag, with text

// that follows this format:

// - Call 1: A basic 'preparing for a rematch' call.

//           Remains active until the player beats the game (FLAG_SYS_GAME_CLEAR).

// - Call 2: Congratulating the player on their success, still preparing.

//           Remains active until the gym leader is ready for a rematch.

// - Call 3: Requesting the rematch. Active whenever the gym leader is ready.

// - Call 4: Expressing their admiration of the player. Active after defeating

//           them in a rematch and if they're not ready yet for another battle.

const REMATCH_CALL_START = 0xFFFE; // 1:1 pokenav_match_call_data.c:172

const ALWAYS_AVAILABLE = 0xFFFF; // 1:1 pokenav_match_call_data.c:174

const NO_FLAG_TO_SET = 0xFFFF; // 1:1 pokenav_match_call_data.c:175

const MATCH_CALL_TEXT_END = [null, ALWAYS_AVAILABLE, NO_FLAG_TO_SET] as const; /* struct init → tuple */ // 1:1 pokenav_match_call_data.c:176

// .rodata

/** 1:1 (pokenav_match_call_data.c:180) */
const sMrStoneTextScripts = [
  [
    'MatchCall_Text_MrStone1',
    ALWAYS_AVAILABLE,
    FLAG_ENABLE_MR_STONE_POKENAV,
  ],
  [
    'MatchCall_Text_MrStone2',
    FLAG_ENABLE_MR_STONE_POKENAV,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone3',
    FLAG_DELIVERED_STEVEN_LETTER,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone4',
    FLAG_RECEIVED_EXP_SHARE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone5',
    FLAG_RECEIVED_HM_STRENGTH,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone6',
    FLAG_DEFEATED_PETALBURG_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone7',
    FLAG_RECEIVED_CASTFORM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone8',
    FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone9',
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone10',
    FLAG_DEFEATED_SOOTOPOLIS_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_MrStone11',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:195) */
const sMrStoneMatchCallHeader = {
  type: MC_TYPE_NPC,
  mapSec: MAPSEC_RUSTBORO_CITY,
  flag: 0xFFFF,
  desc: getString('gText_MrStoneMatchCallDesc'),
  name: getString('gText_MrStoneMatchCallName'),
  textData: sMrStoneTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:205) */
const sNormanTextScripts = [
  [
    'MatchCall_Text_Norman1',
    FLAG_ENABLE_NORMAN_MATCH_CALL,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman2',
    FLAG_DEFEATED_DEWFORD_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman3',
    FLAG_DEFEATED_LAVARIDGE_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman4',
    FLAG_DEFEATED_PETALBURG_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman5',
    FLAG_RECEIVED_RED_OR_BLUE_ORB,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman_PreparingPostGame',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman_RematchReady',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Norman_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:218) */
const sNormanMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_PETALBURG_CITY,
  flag: FLAG_ENABLE_NORMAN_MATCH_CALL,
  rematchTableIdx: REMATCH_NORMAN,
  desc: getString('gText_NormanMatchCallDesc'),
  name: getString('gText_NormanMatchCallName'),
  textData: sNormanTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:229) */
const sProfBirchMatchCallHeader = {
  type: MC_TYPE_BIRCH,
  mapSec: 0,
  flag: FLAG_ENABLE_PROF_BIRCH_MATCH_CALL,
  desc: getString('gText_ProfBirchMatchCallDesc'),
  name: getString('gText_ProfBirchMatchCallName'),
};

/** 1:1 (pokenav_match_call_data.c:238) */
const sMomTextScripts = [
  [
    'MatchCall_Text_Mom1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Mom2',
    FLAG_DEFEATED_PETALBURG_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Mom3',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:245) */
const sMomMatchCallHeader = {
  type: MC_TYPE_NPC,
  mapSec: MAPSEC_LITTLEROOT_TOWN,
  flag: FLAG_ENABLE_MOM_MATCH_CALL,
  desc: getString('gText_MomMatchCallDesc'),
  name: getString('gText_MomMatchCallName'),
  textData: sMomTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:255) */
const sStevenTextScripts = [
  [
    'MatchCall_Text_Steven1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven2',
    FLAG_RUSTURF_TUNNEL_OPENED,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven3',
    FLAG_RECEIVED_RED_OR_BLUE_ORB,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven4',
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven5',
    FLAG_DEFEATED_MOSSDEEP_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven6',
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Steven7',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:266) */
const sStevenMatchCallHeader = {
  type: MC_TYPE_NPC,
  mapSec: MAPSEC_NONE,
  flag: FLAG_REGISTERED_STEVEN_POKENAV,
  desc: getString('gText_StevenMatchCallDesc'),
  name: getString('gText_StevenMatchCallName'),
  textData: sStevenTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:276) */
const sMayTextScripts = [
  [
    'MatchCall_Text_May1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May2',
    FLAG_DEFEATED_DEWFORD_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May3',
    FLAG_DELIVERED_DEVON_GOODS,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May4',
    FLAG_HIDE_MAUVILLE_CITY_WALLY,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May5',
    FLAG_RECEIVED_HM_STRENGTH,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May6',
    FLAG_DEFEATED_LAVARIDGE_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May7',
    FLAG_DEFEATED_PETALBURG_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May8',
    FLAG_RECEIVED_CASTFORM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May9',
    FLAG_RECEIVED_RED_OR_BLUE_ORB,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May10',
    FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May11',
    FLAG_MET_TEAM_AQUA_HARBOR,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May12',
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May13',
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May14',
    FLAG_DEFEATED_SOOTOPOLIS_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_May15',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:295) */
const sMayMatchCallHeader = {
  type: MC_TYPE_RIVAL,
  playerGender: MALE,
  flag: FLAG_ENABLE_RIVAL_MATCH_CALL,
  desc: getString('gText_MayMatchCallDesc'),
  //!< French Difference
  name: getString('gText_ExpandedPlaceholder_May'),
  textData: sMayTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:305) */
const sBrendanTextScripts = [
  [
    'MatchCall_Text_Brendan1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan2',
    FLAG_DEFEATED_DEWFORD_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan3',
    FLAG_DELIVERED_DEVON_GOODS,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan4',
    FLAG_HIDE_MAUVILLE_CITY_WALLY,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan5',
    FLAG_RECEIVED_HM_STRENGTH,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan6',
    FLAG_DEFEATED_LAVARIDGE_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan7',
    FLAG_DEFEATED_PETALBURG_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan8',
    FLAG_RECEIVED_CASTFORM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan9',
    FLAG_RECEIVED_RED_OR_BLUE_ORB,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan10',
    FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan11',
    FLAG_MET_TEAM_AQUA_HARBOR,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan12',
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan13',
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan14',
    FLAG_DEFEATED_SOOTOPOLIS_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brendan15',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:324) */
const sBrendanMatchCallHeader = {
  type: MC_TYPE_RIVAL,
  playerGender: FEMALE,
  flag: FLAG_ENABLE_RIVAL_MATCH_CALL,
  desc: getString('gText_BrendanMatchCallDesc'),
  //!< French Difference
  name: getString('gText_ExpandedPlaceholder_Brendan'),
  textData: sBrendanTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:334) */
const sWallyTextScripts = [
  [
    'MatchCall_Text_Wally1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally2',
    FLAG_RUSTURF_TUNNEL_OPENED,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally3',
    FLAG_DEFEATED_LAVARIDGE_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally4',
    FLAG_RECEIVED_CASTFORM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally5',
    FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally6',
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wally7',
    FLAG_DEFEATED_WALLY_VICTORY_ROAD,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:345) */
const sWallyLocationData = [
  {
    flag: FLAG_HIDE_MAUVILLE_CITY_WALLY,
    mapSec: MAPSEC_VERDANTURF_TOWN,
  },
  {
    flag: FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT,
    mapSec: MAPSEC_NONE,
  },
  {
    flag: FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY,
    mapSec: MAPSEC_VICTORY_ROAD,
  },
  {
    flag: 0xFFFF,
    mapSec: MAPSEC_NONE,
  },
];

/** 1:1 (pokenav_match_call_data.c:352) */
const sWallyMatchCallHeader = {
  type: MC_TYPE_WALLY,
  mapSec: 0,
  flag: FLAG_ENABLE_WALLY_MATCH_CALL,
  rematchTableIdx: REMATCH_WALLY_VR,
  desc: getString('gText_WallyMatchCallDesc'),
  textData: sWallyTextScripts,
  locationData: sWallyLocationData,
};

/** 1:1 (pokenav_match_call_data.c:363) */
const sScottTextScripts = [
  [
    'MatchCall_Text_Scott1',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott2',
    FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott3',
    FLAG_RECEIVED_CASTFORM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott4',
    FLAG_RECEIVED_RED_OR_BLUE_ORB,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott5',
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott6',
    FLAG_DEFEATED_SOOTOPOLIS_GYM,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Scott7',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:375) */
const sScottMatchCallHeader = {
  type: 0,
  mapSec: MAPSEC_NONE,
  flag: FLAG_ENABLE_SCOTT_MATCH_CALL,
  desc: getString('gText_ScottMatchCallDesc'),
  name: getString('gText_ScottMatchCallName'),
  textData: sScottTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:385) */
const sRoxanneTextScripts = [
  [
    'MatchCall_Text_Roxanne_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Roxanne_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Roxanne_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Roxanne_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:393) */
const sRoxanneMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_RUSTBORO_CITY,
  flag: FLAG_ENABLE_ROXANNE_MATCH_CALL,
  rematchTableIdx: REMATCH_ROXANNE,
  desc: getString('gText_RoxanneMatchCallDesc'),
  name: null,
  textData: sRoxanneTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:404) */
const sBrawlyTextScripts = [
  [
    'MatchCall_Text_Brawly_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brawly_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brawly_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Brawly_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:412) */
const sBrawlyMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_DEWFORD_TOWN,
  flag: FLAG_ENABLE_BRAWLY_MATCH_CALL,
  rematchTableIdx: REMATCH_BRAWLY,
  desc: getString('gText_BrawlyMatchCallDesc'),
  name: null,
  textData: sBrawlyTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:423) */
const sWattsonTextScripts = [
  [
    'MatchCall_Text_Wattson_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wattson_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wattson_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Wattson_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:431) */
const sWattsonMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_MAUVILLE_CITY,
  flag: FLAG_ENABLE_WATTSON_MATCH_CALL,
  rematchTableIdx: REMATCH_WATTSON,
  desc: getString('gText_WattsonMatchCallDesc'),
  name: null,
  textData: sWattsonTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:442) */
const sFlanneryTextScripts = [
  [
    'MatchCall_Text_Flannery_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Flannery_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Flannery_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Flannery_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:450) */
const sFlanneryMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_LAVARIDGE_TOWN,
  flag: FLAG_ENABLE_FLANNERY_MATCH_CALL,
  rematchTableIdx: REMATCH_FLANNERY,
  desc: getString('gText_FlanneryMatchCallDesc'),
  name: null,
  textData: sFlanneryTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:461) */
const sWinonaTextScripts = [
  [
    'MatchCall_Text_Winona_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Winona_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Winona_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Winona_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:469) */
const sWinonaMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_FORTREE_CITY,
  flag: FLAG_ENABLE_WINONA_MATCH_CALL,
  rematchTableIdx: REMATCH_WINONA,
  desc: getString('gText_WinonaMatchCallDesc'),
  name: null,
  textData: sWinonaTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:480) */
const sTateLizaTextScripts = [
  [
    'MatchCall_Text_TateLiza_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_TateLiza_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_TateLiza_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_TateLiza_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:488) */
const sTateLizaMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_MOSSDEEP_CITY,
  flag: FLAG_ENABLE_TATE_AND_LIZA_MATCH_CALL,
  rematchTableIdx: REMATCH_TATE_AND_LIZA,
  desc: getString('gText_TateLizaMatchCallDesc'),
  name: null,
  textData: sTateLizaTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:499) */
const sJuanTextScripts = [
  [
    'MatchCall_Text_Juan_Preparing',
    REMATCH_CALL_START,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Juan_PreparingPostGame',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Juan_RematchReady',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  [
    'MatchCall_Text_Juan_PostRematch',
    FLAG_SYS_GAME_CLEAR,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:507) */
const sJuanMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_SOOTOPOLIS_CITY,
  flag: FLAG_ENABLE_JUAN_MATCH_CALL,
  rematchTableIdx: REMATCH_JUAN,
  desc: getString('gText_JuanMatchCallDesc'),
  name: null,
  textData: sJuanTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:518) */
const sSidneyTextScripts = [
  [
    'MatchCall_Text_Sidney',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:523) */
const sSidneyMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_EVER_GRANDE_CITY,
  flag: FLAG_REGISTERED_SIDNEY,
  rematchTableIdx: REMATCH_SIDNEY,
  desc: getString('gText_EliteFourMatchCallDesc'),
  name: null,
  textData: sSidneyTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:534) */
const sPhoebeTextScripts = [
  [
    'MatchCall_Text_Phoebe',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:539) */
const sPhoebeMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_EVER_GRANDE_CITY,
  flag: FLAG_REGISTERED_PHOEBE,
  rematchTableIdx: REMATCH_PHOEBE,
  desc: getString('gText_EliteFourMatchCallDesc'),
  name: null,
  textData: sPhoebeTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:550) */
const sGlaciaTextScripts = [
  [
    'MatchCall_Text_Glacia',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:555) */
const sGlaciaMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_EVER_GRANDE_CITY,
  flag: FLAG_REGISTERED_GLACIA,
  rematchTableIdx: REMATCH_GLACIA,
  desc: getString('gText_EliteFourMatchCallDesc'),
  name: null,
  textData: sGlaciaTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:566) */
const sDrakeTextScripts = [
  [
    'MatchCall_Text_Drake',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:571) */
const sDrakeMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_EVER_GRANDE_CITY,
  flag: FLAG_REGISTERED_DRAKE,
  rematchTableIdx: REMATCH_DRAKE,
  desc: getString('gText_EliteFourMatchCallDesc'),
  name: null,
  textData: sDrakeTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:582) */
const sWallaceTextScripts = [
  [
    'MatchCall_Text_Wallace',
    ALWAYS_AVAILABLE,
    NO_FLAG_TO_SET,
  ],
  MATCH_CALL_TEXT_END,
];

/** 1:1 (pokenav_match_call_data.c:587) */
const sWallaceMatchCallHeader = {
  type: MC_TYPE_LEADER,
  mapSec: MAPSEC_EVER_GRANDE_CITY,
  flag: FLAG_REGISTERED_WALLACE,
  rematchTableIdx: REMATCH_WALLACE,
  desc: getString('gText_ChampionMatchCallDesc'),
  name: null,
  textData: sWallaceTextScripts,
};

/** 1:1 (pokenav_match_call_data.c:598) */
const sMatchCallHeaders = {
  /* TRANSPILER-TODO [MC_HEADER_MR_STONE]   = {.npc    = &sMrStoneMatch */
  /* TRANSPILER-TODO [MC_HEADER_PROF_BIRCH] = {.birch  = &sProfBirchMat */
  /* TRANSPILER-TODO [MC_HEADER_BRENDAN]    = {.rival  = &sBrendanMatch */
  /* TRANSPILER-TODO [MC_HEADER_MAY]        = {.rival  = &sMayMatchCall */
  /* TRANSPILER-TODO [MC_HEADER_WALLY]      = {.wally  = &sWallyMatchCa */
  /* TRANSPILER-TODO [MC_HEADER_NORMAN]     = {.leader = &sNormanMatchC */
  /* TRANSPILER-TODO [MC_HEADER_MOM]        = {.npc    = &sMomMatchCall */
  /* TRANSPILER-TODO [MC_HEADER_STEVEN]     = {.npc    = &sStevenMatchC */
  /* TRANSPILER-TODO [MC_HEADER_SCOTT]      = {.npc    = &sScottMatchCa */
  /* TRANSPILER-TODO [MC_HEADER_ROXANNE]    = {.leader = &sRoxanneMatch */
  /* TRANSPILER-TODO [MC_HEADER_BRAWLY]     = {.leader = &sBrawlyMatchC */
  /* TRANSPILER-TODO [MC_HEADER_WATTSON]    = {.leader = &sWattsonMatch */
  /* TRANSPILER-TODO [MC_HEADER_FLANNERY]   = {.leader = &sFlanneryMatc */
  /* TRANSPILER-TODO [MC_HEADER_WINONA]     = {.leader = &sWinonaMatchC */
  /* TRANSPILER-TODO [MC_HEADER_TATE_LIZA]  = {.leader = &sTateLizaMatc */
  /* TRANSPILER-TODO [MC_HEADER_JUAN]       = {.leader = &sJuanMatchCal */
  /* TRANSPILER-TODO [MC_HEADER_SIDNEY]     = {.leader = &sSidneyMatchC */
  /* TRANSPILER-TODO [MC_HEADER_PHOEBE]     = {.leader = &sPhoebeMatchC */
  /* TRANSPILER-TODO [MC_HEADER_GLACIA]     = {.leader = &sGlaciaMatchC */
  /* TRANSPILER-TODO [MC_HEADER_DRAKE]      = {.leader = &sDrakeMatchCa */
  /* TRANSPILER-TODO [MC_HEADER_WALLACE]    = {.leader = &sWallaceMatch */
};

/** 1:1 (pokenav_match_call_data.c:622) */
const sMatchCallGetEnabledFuncs: Array<(...args: any[]) => any> = [
  MatchCall_GetEnabled_NPC,
  MatchCall_GetEnabled_Trainer,
  MatchCall_GetEnabled_Wally,
  MatchCall_GetEnabled_Rival,
  MatchCall_GetEnabled_Birch,
];

/** 1:1 (pokenav_match_call_data.c:630) */
const sMatchCallGetMapSecFuncs: Array<(...args: any[]) => any> = [
  MatchCall_GetMapSec_NPC,
  MatchCall_GetMapSec_Trainer,
  MatchCall_GetMapSec_Wally,
  MatchCall_GetMapSec_Rival,
  MatchCall_GetMapSec_Birch,
];

/** 1:1 (pokenav_match_call_data.c:638) */
const sMatchCall_IsRematchableFunctions: Array<(...args: any[]) => any> = [
  MatchCall_IsRematchable_NPC,
  MatchCall_IsRematchable_Trainer,
  MatchCall_IsRematchable_Wally,
  MatchCall_IsRematchable_Rival,
  MatchCall_IsRematchable_Birch,
];

/** 1:1 (pokenav_match_call_data.c:646) */
const sMatchCall_HasCheckPageFunctions: Array<(...args: any[]) => any> = [
  MatchCall_HasCheckPage_NPC,
  MatchCall_HasCheckPage_Trainer,
  MatchCall_HasCheckPage_Wally,
  MatchCall_HasCheckPage_Rival,
  MatchCall_HasCheckPage_Birch,
];

/** 1:1 (pokenav_match_call_data.c:654) */
const sMatchCall_GetRematchTableIdxFunctions: Array<(...args: any[]) => any> = [
  MatchCall_GetRematchTableIdx_NPC,
  MatchCall_GetRematchTableIdx_Trainer,
  MatchCall_GetRematchTableIdx_Wally,
  MatchCall_GetRematchTableIdx_Rival,
  MatchCall_GetRematchTableIdx_Birch,
];

/** 1:1 (pokenav_match_call_data.c:662) */
const sMatchCall_GetMessageFunctions: Array<(...args: any[]) => any> = [
  MatchCall_GetMessage_NPC,
  MatchCall_GetMessage_Trainer,
  MatchCall_GetMessage_Wally,
  MatchCall_GetMessage_Rival,
  MatchCall_GetMessage_Birch,
];

/** 1:1 (pokenav_match_call_data.c:670) */
const sMatchCall_GetNameAndDescFunctions: Array<(...args: any[]) => any> = [
  MatchCall_GetNameAndDesc_NPC,
  MatchCall_GetNameAndDesc_Trainer,
  MatchCall_GetNameAndDesc_Wally,
  MatchCall_GetNameAndDesc_Rival,
  MatchCall_GetNameAndDesc_Birch,
];

/** 1:1 (pokenav_match_call_data.c:678) */
const sCheckPageOverrides = [
  {
    idx: MC_HEADER_STEVEN,
    facilityClass: FACILITY_CLASS_STEVEN,
    flag: 0xFFFF,
    flavorTexts: [
      getString('gText_MatchCallSteven_Strategy'), // [CHECK_PAGE_STRATEGY]
      getString('gText_MatchCallSteven_Pokemon'), // [CHECK_PAGE_POKEMON]
      getString('gText_MatchCallSteven_Intro1_BeforeMeteorFallsBattle'), // [CHECK_PAGE_INTRO_1]
      getString('gText_MatchCallSteven_Intro2_BeforeMeteorFallsBattle'), // [CHECK_PAGE_INTRO_2]
    ],
  },
  {
    idx: MC_HEADER_STEVEN,
    facilityClass: FACILITY_CLASS_STEVEN,
    flag: FLAG_DEFEATED_MOSSDEEP_GYM,
    flavorTexts: [
      getString('gText_MatchCallSteven_Strategy'), // [CHECK_PAGE_STRATEGY]
      getString('gText_MatchCallSteven_Pokemon'), // [CHECK_PAGE_POKEMON]
      getString('gText_MatchCallSteven_Intro1_AfterMeteorFallsBattle'), // [CHECK_PAGE_INTRO_1]
      getString('gText_MatchCallSteven_Intro2_AfterMeteorFallsBattle'), // [CHECK_PAGE_INTRO_2]
    ],
  },
  {
    idx: MC_HEADER_BRENDAN,
    facilityClass: FACILITY_CLASS_BRENDAN,
    flag: 0xFFFF,
    flavorTexts: MCFLAVOR(Brendan),
  },
  {
    idx: MC_HEADER_MAY,
    facilityClass: FACILITY_CLASS_MAY,
    flag: 0xFFFF,
    flavorTexts: MCFLAVOR(May),
  },
];

// .text

/** 1:1 `static u32 MatchCallGetFunctionIndex(match_call_t matchCall)` (pokenav_match_call_data.c:717-734). */
function MatchCallGetFunctionIndex(matchCall: match_call_t): number {
  switch (matchCall.common.type) {
    default:
    case MC_TYPE_NPC:
      return 0;
    case MC_TYPE_TRAINER:
    case MC_TYPE_LEADER:
      return 1;
    case MC_TYPE_WALLY:
      return 2;
    case MC_TYPE_RIVAL:
      return 3;
    case MC_TYPE_BIRCH:
      return 4;
  }
}

/** 1:1 `u32 GetTrainerIdxByRematchIdx(u32 rematchIdx)` (pokenav_match_call_data.c:736-739). */
export function GetTrainerIdxByRematchIdx(rematchIdx: number): number {
  return gRematchTable[rematchIdx].trainerIds[0];
}

/** 1:1 `s32 GetRematchIdxByTrainerIdx(s32 trainerIdx)` (pokenav_match_call_data.c:741-751). */
export function GetRematchIdxByTrainerIdx(trainerIdx: number): number {
  let rematchIdx = 0;
  for (rematchIdx = 0; rematchIdx < REMATCH_TABLE_ENTRIES; rematchIdx++)
  {
    if (gRematchTable[rematchIdx].trainerIds[0] == trainerIdx)
      return rematchIdx;
  }
  return -1;
}

/** 1:1 `bool32 MatchCall_GetEnabled(u32 idx)` (pokenav_match_call_data.c:753-763). */
export function MatchCall_GetEnabled(idx: number): boolean {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return false;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  return sMatchCallGetEnabledFuncs[i](matchCall);
}

/** 1:1 `static bool32 MatchCall_GetEnabled_NPC(match_call_t matchCall)` (pokenav_match_call_data.c:765-770). */
function MatchCall_GetEnabled_NPC(matchCall: match_call_t): boolean {
  if (matchCall.npc.flag == 0xFFFF)
    return true;
  return FlagGet(matchCall.npc.flag);
}

/** 1:1 `static bool32 MatchCall_GetEnabled_Trainer(match_call_t matchCall)` (pokenav_match_call_data.c:772-777). */
function MatchCall_GetEnabled_Trainer(matchCall: match_call_t): boolean {
  if (matchCall.trainer.flag == 0xFFFF)
    return true;
  return FlagGet(matchCall.trainer.flag);
}

/** 1:1 `static bool32 MatchCall_GetEnabled_Wally(match_call_t matchCall)` (pokenav_match_call_data.c:779-784). */
function MatchCall_GetEnabled_Wally(matchCall: match_call_t): boolean {
  if (matchCall.wally.flag == 0xFFFF)
    return true;
  return FlagGet(matchCall.wally.flag);
}

/** 1:1 `static bool32 MatchCall_GetEnabled_Rival(match_call_t matchCall)` (pokenav_match_call_data.c:786-793). */
function MatchCall_GetEnabled_Rival(matchCall: match_call_t): boolean {
  if (matchCall.rival.playerGender != gSaveBlock2Ptr.playerGender)
    return false;
  if (matchCall.rival.flag == 0xFFFF)
    return true;
  return FlagGet(matchCall.rival.flag);
}

/** 1:1 `static bool32 MatchCall_GetEnabled_Birch(match_call_t matchCall)` (pokenav_match_call_data.c:795-798). */
function MatchCall_GetEnabled_Birch(matchCall: match_call_t): boolean {
  return FlagGet(matchCall.birch.flag);
}

/** 1:1 `mapsec_u8_t MatchCall_GetMapSec(u32 idx)` (pokenav_match_call_data.c:800-810). */
export function MatchCall_GetMapSec(idx: number): number {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return 0;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  return sMatchCallGetMapSecFuncs[i](matchCall);
}

/** 1:1 `static mapsec_u8_t MatchCall_GetMapSec_NPC(match_call_t matchCall)` (pokenav_match_call_data.c:812-815). */
function MatchCall_GetMapSec_NPC(matchCall: match_call_t): number {
  return matchCall.npc.mapSec;
}

/** 1:1 `static mapsec_u8_t MatchCall_GetMapSec_Trainer(match_call_t matchCall)` (pokenav_match_call_data.c:817-820). */
function MatchCall_GetMapSec_Trainer(matchCall: match_call_t): number {
  return matchCall.trainer.mapSec;
}

/** 1:1 `static mapsec_u8_t MatchCall_GetMapSec_Wally(match_call_t matchCall)` (pokenav_match_call_data.c:822-832). */
function MatchCall_GetMapSec_Wally(matchCall: match_call_t): number {
  let i = 0;
  for (i = 0; matchCall.wally.locationData[i].flag != 0xFFFF; i++)
  {
    if (!FlagGet(matchCall.wally.locationData[i].flag))
      break;
  }
  return matchCall.wally.locationData[i].mapSec;
}

/** 1:1 `static mapsec_u8_t MatchCall_GetMapSec_Rival(match_call_t matchCall)` (pokenav_match_call_data.c:834-837). */
function MatchCall_GetMapSec_Rival(matchCall: match_call_t): number {
  return MAPSEC_NONE;
}

/** 1:1 `static mapsec_u8_t MatchCall_GetMapSec_Birch(match_call_t matchCall)` (pokenav_match_call_data.c:839-842). */
function MatchCall_GetMapSec_Birch(matchCall: match_call_t): number {
  return MAPSEC_NONE;
}

/** 1:1 `bool32 MatchCall_IsRematchable(u32 idx)` (pokenav_match_call_data.c:844-854). */
export function MatchCall_IsRematchable(idx: number): boolean {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return false;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  return sMatchCall_IsRematchableFunctions[i](matchCall);
}

/** 1:1 `static bool32 MatchCall_IsRematchable_NPC(match_call_t matchCall)` (pokenav_match_call_data.c:856-859). */
function MatchCall_IsRematchable_NPC(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `static bool32 MatchCall_IsRematchable_Trainer(match_call_t matchCall)` (pokenav_match_call_data.c:861-866). */
function MatchCall_IsRematchable_Trainer(matchCall: match_call_t): boolean {
  if (matchCall.trainer.rematchTableIdx >= REMATCH_ELITE_FOUR_ENTRIES)
    return false;
  return gSaveBlock1Ptr.trainerRematches[matchCall.trainer.rematchTableIdx] ? true : false;
}

/** 1:1 `static bool32 MatchCall_IsRematchable_Wally(match_call_t matchCall)` (pokenav_match_call_data.c:868-871). */
function MatchCall_IsRematchable_Wally(matchCall: match_call_t): boolean {
  return gSaveBlock1Ptr.trainerRematches[matchCall.wally.rematchTableIdx] ? true : false;
}

/** 1:1 `static bool32 MatchCall_IsRematchable_Rival(match_call_t matchCall)` (pokenav_match_call_data.c:873-876). */
function MatchCall_IsRematchable_Rival(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `static bool32 MatchCall_IsRematchable_Birch(match_call_t matchCall)` (pokenav_match_call_data.c:878-881). */
function MatchCall_IsRematchable_Birch(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `bool32 MatchCall_HasCheckPage(u32 idx)` (pokenav_match_call_data.c:883-900). */
export function MatchCall_HasCheckPage(idx: number): boolean {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return false;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  if (sMatchCall_HasCheckPageFunctions[i](matchCall))
    return true;
  for (i = 0; i < sCheckPageOverrides.length; i++)
  {
    if (sCheckPageOverrides[i].idx == idx)
      return true;
  }
  return false;
}

/** 1:1 `static bool32 MatchCall_HasCheckPage_NPC(match_call_t matchCall)` (pokenav_match_call_data.c:902-905). */
function MatchCall_HasCheckPage_NPC(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `static bool32 MatchCall_HasCheckPage_Trainer(match_call_t matchCall)` (pokenav_match_call_data.c:907-910). */
function MatchCall_HasCheckPage_Trainer(matchCall: match_call_t): boolean {
  return true;
}

/** 1:1 `static bool32 MatchCall_HasCheckPage_Wally(match_call_t matchCall)` (pokenav_match_call_data.c:912-915). */
function MatchCall_HasCheckPage_Wally(matchCall: match_call_t): boolean {
  return true;
}

/** 1:1 `static bool32 MatchCall_HasCheckPage_Rival(match_call_t matchCall)` (pokenav_match_call_data.c:917-920). */
function MatchCall_HasCheckPage_Rival(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `static bool32 MatchCall_HasCheckPage_Birch(match_call_t matchCall)` (pokenav_match_call_data.c:922-925). */
function MatchCall_HasCheckPage_Birch(matchCall: match_call_t): boolean {
  return false;
}

/** 1:1 `u32 MatchCall_GetRematchTableIdx(u32 idx)` (pokenav_match_call_data.c:927-937). */
export function MatchCall_GetRematchTableIdx(idx: number): number {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return REMATCH_TABLE_ENTRIES;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  return sMatchCall_GetRematchTableIdxFunctions[i](matchCall);
}

/** 1:1 `static u32 MatchCall_GetRematchTableIdx_NPC(match_call_t matchCall)` (pokenav_match_call_data.c:939-942). */
function MatchCall_GetRematchTableIdx_NPC(matchCall: match_call_t): number {
  return REMATCH_TABLE_ENTRIES;
}

/** 1:1 `static u32 MatchCall_GetRematchTableIdx_Trainer(match_call_t matchCall)` (pokenav_match_call_data.c:944-947). */
function MatchCall_GetRematchTableIdx_Trainer(matchCall: match_call_t): number {
  return matchCall.trainer.rematchTableIdx;
}

/** 1:1 `static u32 MatchCall_GetRematchTableIdx_Wally(match_call_t matchCall)` (pokenav_match_call_data.c:949-952). */
function MatchCall_GetRematchTableIdx_Wally(matchCall: match_call_t): number {
  return matchCall.wally.rematchTableIdx;
}

/** 1:1 `static u32 MatchCall_GetRematchTableIdx_Rival(match_call_t matchCall)` (pokenav_match_call_data.c:954-957). */
function MatchCall_GetRematchTableIdx_Rival(matchCall: match_call_t): number {
  return REMATCH_TABLE_ENTRIES;
}

/** 1:1 `static u32 MatchCall_GetRematchTableIdx_Birch(match_call_t matchCall)` (pokenav_match_call_data.c:959-962). */
function MatchCall_GetRematchTableIdx_Birch(matchCall: match_call_t): number {
  return REMATCH_TABLE_ENTRIES;
}

/** 1:1 `void MatchCall_GetMessage(u32 idx, u8 *dest)` (pokenav_match_call_data.c:964-974). */
export function MatchCall_GetMessage(idx: number, dest: Uint8Array): void {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  sMatchCall_GetMessageFunctions[i](matchCall, dest);
}

/** 1:1 `static void MatchCall_GetMessage_NPC(match_call_t matchCall, u8 *dest)` (pokenav_match_call_data.c:976-979). */
function MatchCall_GetMessage_NPC(matchCall: match_call_t, dest: Uint8Array): void {
  MatchCall_BufferCallMessageText(matchCall.npc.textData, dest);
}

// This is the one functional difference between MC_TYPE_TRAINER and MC_TYPE_LEADER

/** 1:1 `static void MatchCall_GetMessage_Trainer(match_call_t matchCall, u8 *dest)` (pokenav_match_call_data.c:982-988). */
function MatchCall_GetMessage_Trainer(matchCall: match_call_t, dest: Uint8Array): void {
  if (matchCall.common.type != MC_TYPE_LEADER)
    MatchCall_BufferCallMessageText(matchCall.trainer.textData, dest);
  else
    MatchCall_BufferCallMessageTextByRematchTeam(matchCall.leader.textData, matchCall.leader.rematchTableIdx, dest);
}

/** 1:1 `static void MatchCall_GetMessage_Wally(match_call_t matchCall, u8 *dest)` (pokenav_match_call_data.c:990-993). */
function MatchCall_GetMessage_Wally(matchCall: match_call_t, dest: Uint8Array): void {
  MatchCall_BufferCallMessageText(matchCall.wally.textData, dest);
}

/** 1:1 `static void MatchCall_GetMessage_Rival(match_call_t matchCall, u8 *dest)` (pokenav_match_call_data.c:995-998). */
function MatchCall_GetMessage_Rival(matchCall: match_call_t, dest: Uint8Array): void {
  MatchCall_BufferCallMessageText(matchCall.rival.textData, dest);
}

/** 1:1 `static void MatchCall_GetMessage_Birch(match_call_t matchCall, u8 *dest)` (pokenav_match_call_data.c:1000-1003). */
function MatchCall_GetMessage_Birch(matchCall: match_call_t, dest: Uint8Array): void {
  BufferPokedexRatingForMatchCall(dest);
}

/** 1:1 `static void MatchCall_BufferCallMessageText(const match_call_text_data_t *textData, u8 *dest)` (pokenav_match_call_data.c:1005-1021). */
function MatchCall_BufferCallMessageText(textData: any, dest: Uint8Array): void {
  let i = 0;
  for (i = 0; textData[i].text != null; i++)
    ;
  if (i)
    i--;
  while (i)
  {
    if (textData[i].availabilityFlag != ALWAYS_AVAILABLE && FlagGet(textData[i].availabilityFlag))
      break;
    i--;
  }
  if (textData[i].flagToSetOnCompletion != NO_FLAG_TO_SET)
    FlagSet(textData[i].flagToSetOnCompletion);
  StringExpandPlaceholders(dest, textData[i].text);
}

/** 1:1 `static void MatchCall_BufferCallMessageTextByRematchTeam(const match_call_text_data_t *textData, u16 idx, u8 *dest)` (pokenav_match_call_data.c:1023-1060). */
function MatchCall_BufferCallMessageTextByRematchTeam(textData: any, idx: number, dest: Uint8Array): void {
  let i = 0;
  for (i = 0; textData[i].text != null; i++)
  {
    if (textData[i].availabilityFlag == REMATCH_CALL_START)
      break;
    if (textData[i].availabilityFlag != ALWAYS_AVAILABLE && !FlagGet(textData[i].availabilityFlag))
      break;
  }
  if (textData[i].availabilityFlag != REMATCH_CALL_START)
  {
    if (i)
      i--;
    if (textData[i].flagToSetOnCompletion != NO_FLAG_TO_SET)
      FlagSet(textData[i].flagToSetOnCompletion);
    StringExpandPlaceholders(dest, textData[i].text);
  }
  else
  {
    if (FlagGet(FLAG_SYS_GAME_CLEAR))
    {
      do
      {
        // If the rematch is ready, advance to the rematch call.
        if (gSaveBlock1Ptr.trainerRematches[idx])
          i += 2;
        else if (CountBattledRematchTeams(idx) >= 2)
          i += 3;
        else
          i++;
      }
      while (0);
    }
    // If the game hasn't been cleared yet, the index remains on the basic "preparing for rematch" call.
    StringExpandPlaceholders(dest, textData[i].text);
  }
}

/** 1:1 `void MatchCall_GetNameAndDesc(u32 idx, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1062-1072). */
export function MatchCall_GetNameAndDesc(idx: number, desc: any, name: any): void {
  const matchCall = { common: null as any, npc: null as any, trainer: null as any, wally: null as any, birch: null as any, rival: null as any, leader: null as any };
  let i = 0;
  if (idx >= sMatchCallHeaders.length)
    return;
  matchCall = sMatchCallHeaders[idx];
  i = MatchCallGetFunctionIndex(matchCall);
  sMatchCall_GetNameAndDescFunctions[i](matchCall, desc, name);
}

/** 1:1 `static void MatchCall_GetNameAndDesc_NPC(match_call_t matchCall, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1074-1078). */
function MatchCall_GetNameAndDesc_NPC(matchCall: match_call_t, desc: any, name: any): void {
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = matchCall.npc->desc */;
  void 0 /* TRANSPILER-TODO ASSIGN: *name = matchCall.npc->name */;
}

/** 1:1 `static void MatchCall_GetNameAndDesc_Trainer(match_call_t matchCall, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1080-1088). */
function MatchCall_GetNameAndDesc_Trainer(matchCall: match_call_t, desc: any, name: any): void {
  let _matchCall = matchCall;
  if (_matchCall.trainer.name == null)
    MatchCall_GetNameAndDescByRematchIdx(_matchCall.trainer.rematchTableIdx, desc, name);
  else
    void 0 /* TRANSPILER-TODO ASSIGN: *name = _matchCall.trainer->name */;
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = _matchCall.trainer->desc */;
}

/** 1:1 `static void MatchCall_GetNameAndDesc_Wally(match_call_t matchCall, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1090-1094). */
function MatchCall_GetNameAndDesc_Wally(matchCall: match_call_t, desc: any, name: any): void {
  MatchCall_GetNameAndDescByRematchIdx(matchCall.wally.rematchTableIdx, desc, name);
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = matchCall.wally->desc */;
}

/** 1:1 `static void MatchCall_GetNameAndDesc_Rival(match_call_t matchCall, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1096-1100). */
function MatchCall_GetNameAndDesc_Rival(matchCall: match_call_t, desc: any, name: any): void {
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = matchCall.rival->desc */;
  void 0 /* TRANSPILER-TODO ASSIGN: *name = matchCall.rival->name */;
}

/** 1:1 `static void MatchCall_GetNameAndDesc_Birch(match_call_t matchCall, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1102-1106). */
function MatchCall_GetNameAndDesc_Birch(matchCall: match_call_t, desc: any, name: any): void {
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = matchCall.birch->desc */;
  void 0 /* TRANSPILER-TODO ASSIGN: *name = matchCall.birch->name */;
}

/**
 * French Difference
*/

/** 1:1 `static void MatchCall_GetNameAndDescByRematchIdx(u32 idx, const u8 **desc, const u8 **name)` (pokenav_match_call_data.c:1111-1116). */
function MatchCall_GetNameAndDescByRematchIdx(idx: number, desc: any, name: any): void {
  let trainer = gTrainers + GetTrainerIdxByRematchIdx(idx);
  void 0 /* TRANSPILER-TODO ASSIGN: *desc = GetTrainerClassNameGenderSpecific(trainer->trainerClass, trainer->encounterMusic_g */;
  void 0 /* TRANSPILER-TODO ASSIGN: *name = trainer->trainerName */;
}

/** 1:1 `const u8 *MatchCall_GetOverrideFlavorText(u32 idx, u32 offset)` (pokenav_match_call_data.c:1118-1133). */
export function MatchCall_GetOverrideFlavorText(idx: number, offset: number): Uint8Array | null {
  let i = 0;
  for (i = 0; i < sCheckPageOverrides.length; i++)
  {
    if (sCheckPageOverrides[i].idx == idx)
    {
      for (; i + 1 < sCheckPageOverrides.length && sCheckPageOverrides[i + 1].idx == idx && FlagGet(sCheckPageOverrides[i + 1].flag); i++)
        ;
      return sCheckPageOverrides[i].flavorTexts[offset];
    }
  }
  return null;
}

/** 1:1 `int MatchCall_GetOverrideFacilityClass(u32 idx)` (pokenav_match_call_data.c:1135-1145). */
export function MatchCall_GetOverrideFacilityClass(idx: number): number {
  let i = 0;
  for (i = 0; i < sCheckPageOverrides.length; i++)
  {
    if (sCheckPageOverrides[i].idx == idx)
      return sCheckPageOverrides[i].facilityClass;
  }
  return -1;
}

/** 1:1 `bool32 MatchCall_HasRematchId(u32 idx)` (pokenav_match_call_data.c:1147-1158). */
export function MatchCall_HasRematchId(idx: number): boolean {
  let i = 0;
  for (i = 0; i < (sMatchCallHeaders.length | 0); i++)
  {
    let id = MatchCall_GetRematchTableIdx(i);
    if (id != REMATCH_TABLE_ENTRIES && id == idx)
      return true;
  }
  return false;
}

/** 1:1 `void SetMatchCallRegisteredFlag(void)` (pokenav_match_call_data.c:1160-1165). */
export function SetMatchCallRegisteredFlag(): void {
  let index = GetRematchIdxByTrainerIdx(VarGet(0x8004) /* gSpecialVar_0x8004 */);
  if (index >= 0)
    FlagSet(TRAINER_REGISTERED_FLAGS_START + index);
}

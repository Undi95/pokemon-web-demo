/**
 * tv.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/tv.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/tv.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { B_OUTCOME_CAUGHT, B_OUTCOME_DREW, B_OUTCOME_LOST, B_OUTCOME_MON_FLED, B_OUTCOME_MON_TELEPORTED, B_OUTCOME_NO_SAFARI_BALLS, B_OUTCOME_PLAYER_TELEPORTED, B_OUTCOME_RAN, B_OUTCOME_WON } from '../include/constants/battle';
import { FRONTIER_MAX_LEVEL_50, FRONTIER_SHOW_ARENA, FRONTIER_SHOW_DOME_DOUBLES, FRONTIER_SHOW_DOME_SINGLES, FRONTIER_SHOW_FACTORY_DOUBLES, FRONTIER_SHOW_FACTORY_SINGLES, FRONTIER_SHOW_PALACE_DOUBLES, FRONTIER_SHOW_PALACE_SINGLES, FRONTIER_SHOW_PIKE, FRONTIER_SHOW_PYRAMID, FRONTIER_SHOW_TOWER_DOUBLES, FRONTIER_SHOW_TOWER_LINK_MULTIS, FRONTIER_SHOW_TOWER_MULTIS, FRONTIER_SHOW_TOWER_SINGLES, FRONTIER_STAGES_PER_CHALLENGE, NUM_FRONTIER_FACILITIES } from '../include/constants/battle_frontier';
import { EOS } from '../include/constants/characters';
import { DECOR_NONE } from '../include/constants/decorations';
import { FLAG_BADGE01_GET, FLAG_HIDE_BATTLE_TOWER_REPORTER, FLAG_LANDMARK_BATTLE_FRONTIER, FLAG_SYS_ARENA_GOLD, FLAG_SYS_ARENA_SILVER, FLAG_SYS_DOME_GOLD, FLAG_SYS_DOME_SILVER, FLAG_SYS_FACTORY_GOLD, FLAG_SYS_FACTORY_SILVER, FLAG_SYS_GAME_CLEAR, FLAG_SYS_PALACE_GOLD, FLAG_SYS_PALACE_SILVER, FLAG_SYS_PIKE_GOLD, FLAG_SYS_PIKE_SILVER, FLAG_SYS_PYRAMID_GOLD, FLAG_SYS_PYRAMID_SILVER, FLAG_SYS_TOWER_GOLD, FLAG_SYS_TOWER_SILVER, FLAG_SYS_TV_HOME, FLAG_SYS_TV_LATIAS_LATIOS, FLAG_SYS_TV_START, FLAG_SYS_TV_WATCH, FLAG_TEMP_SKIP_GABBY_INTERVIEW, NUM_BADGES } from '../include/constants/flags';
import { GAME_STAT_GOT_INTERVIEWED, GAME_STAT_STEPS } from '../include/constants/game_stat';
import { CONTEST_CATEGORY_BEAUTY, CONTEST_CATEGORY_COOL, CONTEST_CATEGORY_CUTE, CONTEST_CATEGORY_SMART, CONTEST_CATEGORY_TOUGH, DECOR_MAX_SECRET_BASE, FRONTIER_LVL_50, LANGUAGE_JAPANESE, MALE, MAX_MON_MOVES, PARTY_SIZE, POKEMON_NAME_LENGTH, POKE_NEWS_COUNT, VERSION_EMERALD, VERSION_RUBY, VERSION_SAPPHIRE } from '../include/constants/global';
import { ITEM_MASTER_BALL, ITEM_NONE } from '../include/constants/items';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';
import { MB_TELEVISION } from '../include/constants/metatile_behaviors';
import { METATILE_Building_TV_Off, METATILE_Building_TV_On } from '../include/constants/metatile_labels';
import { MOVE_ATTRACT, MOVE_BIDE, MOVE_FRUSTRATION, MOVE_GIGA_DRAIN, MOVE_GROWL, MOVE_GROWTH, MOVE_HARDEN, MOVE_LEECH_SEED, MOVE_NATURE_POWER, MOVE_NONE, MOVE_SOLAR_BEAM, MOVE_TACKLE, MOVE_TAIL_WHIP } from '../include/constants/moves';
import { ARTIST_RIBBON, BEAUTY_RIBBON_HYPER, BEAUTY_RIBBON_MASTER, BEAUTY_RIBBON_NORMAL, BEAUTY_RIBBON_SUPER, CHAMPION_RIBBON, COOL_RIBBON_HYPER, COOL_RIBBON_MASTER, COOL_RIBBON_NORMAL, COOL_RIBBON_SUPER, COUNTRY_RIBBON, CUTE_RIBBON_HYPER, CUTE_RIBBON_MASTER, CUTE_RIBBON_NORMAL, CUTE_RIBBON_SUPER, EARTH_RIBBON, EFFORT_RIBBON, LAND_RIBBON, MARINE_RIBBON, NATIONAL_RIBBON, SKY_RIBBON, SMART_RIBBON_HYPER, SMART_RIBBON_MASTER, SMART_RIBBON_NORMAL, SMART_RIBBON_SUPER, TOUGH_RIBBON_HYPER, TOUGH_RIBBON_MASTER, TOUGH_RIBBON_NORMAL, TOUGH_RIBBON_SUPER, VICTORY_RIBBON, WINNING_RIBBON, WORLD_RIBBON } from '../include/constants/pokemon';
import { KANTO_MAPSEC_START, MAPSEC_DYNAMIC, MAPSEC_SECRET_BASE } from '../include/constants/region_map_sections';
import { STDSTRING_BEAUTY, STDSTRING_COOL, STDSTRING_CUTE, STDSTRING_HYPER, STDSTRING_MASTER, STDSTRING_NORMAL, STDSTRING_SMART, STDSTRING_SUPER, STDSTRING_TOUGH } from '../include/constants/script_menu';
import { SPECIES_NONE, SPECIES_NUZLEAF, SPECIES_SEEDOT, SPECIES_SKITTY } from '../include/constants/species';
import { BRAVOTOWER_STATE_INTRO, BRAVOTOWER_STATE_LOST, BRAVOTOWER_STATE_LOST_FINAL, BRAVOTOWER_STATE_NEW_RECORD, BRAVOTOWER_STATE_OUTRO, BRAVOTOWER_STATE_RESPONSE, BRAVOTOWER_STATE_RESPONSE_SATISFIED, BRAVOTOWER_STATE_RESPONSE_UNSATISFIED, BRAVOTOWER_STATE_SATISFIED, BRAVOTOWER_STATE_UNSATISFIED, BRAVOTOWER_STATE_UNUSED_1, BRAVOTOWER_STATE_UNUSED_2, BRAVOTOWER_STATE_UNUSED_3, BRAVOTOWER_STATE_UNUSED_4, BRAVOTOWER_STATE_WON, CONTESTLADYLIVE_STATE_INTRO, CONTESTLADYLIVE_STATE_LOST, CONTESTLADYLIVE_STATE_LOST_BADLY, CONTESTLADYLIVE_STATE_WON, CONTESTLIVE_STATE_BEAUTIFUL, CONTESTLIVE_STATE_BETTER_ROUND1, CONTESTLIVE_STATE_BETTER_ROUND2, CONTESTLIVE_STATE_COOL, CONTESTLIVE_STATE_CUTE, CONTESTLIVE_STATE_EQUAL_ROUNDS, CONTESTLIVE_STATE_EXCITING_APPEAL, CONTESTLIVE_STATE_GOT_NERVOUS, CONTESTLIVE_STATE_GOT_STARTLED, CONTESTLIVE_STATE_INTRO, CONTESTLIVE_STATE_LAST_BOTH, CONTESTLIVE_STATE_LOST, CONTESTLIVE_STATE_LOST_AFTER_ROUND1_WIN, CONTESTLIVE_STATE_LOST_SMALL_MARGIN, CONTESTLIVE_STATE_NOT_EXCITING_ENOUGH, CONTESTLIVE_STATE_NO_APPEALS, CONTESTLIVE_STATE_NO_EXCITING_APPEALS, CONTESTLIVE_STATE_OUTRO, CONTESTLIVE_STATE_REPEATED_APPEALS, CONTESTLIVE_STATE_SMART, CONTESTLIVE_STATE_STARTLED_OTHER, CONTESTLIVE_STATE_TALK_ABOUT_LOSER, CONTESTLIVE_STATE_TOOK_BREAK, CONTESTLIVE_STATE_TOUGH, CONTESTLIVE_STATE_USED_COMBO, CONTESTLIVE_STATE_USED_MOVE, CONTESTLIVE_STATE_VERY_BEAUTIFUL, CONTESTLIVE_STATE_VERY_COOL, CONTESTLIVE_STATE_VERY_CUTE, CONTESTLIVE_STATE_VERY_EXCITING_APPEAL, CONTESTLIVE_STATE_VERY_SMART, CONTESTLIVE_STATE_VERY_TOUGH, CONTESTLIVE_STATE_WON_BOTH_ROUNDS, NUM_NORMAL_TVSHOW_SLOTS, NUM_POKENEWS_TYPES, NUM_SECRET_BASE_FLAGS, PLAYERS_HOUSE_TV_LATI, PLAYERS_HOUSE_TV_MOVIE, PLAYERS_HOUSE_TV_NONE, POKENEWS_BLENDMASTER, POKENEWS_COUNTDOWN, POKENEWS_LILYCOVE, POKENEWS_NONE, POKENEWS_SLATEPORT, POKENEWS_STATE_ACTIVE, POKENEWS_STATE_INACTIVE, POKENEWS_STATE_UPCOMING, SBSECRETS_NUM_STATES, SBSECRETS_STATE_BASE_INTEREST_HIGH, SBSECRETS_STATE_BASE_INTEREST_LOW, SBSECRETS_STATE_BASE_INTEREST_MED, SBSECRETS_STATE_BATTLED_DRAW, SBSECRETS_STATE_BATTLED_LOST, SBSECRETS_STATE_BATTLED_WON, SBSECRETS_STATE_DECLINED_BATTLE, SBSECRETS_STATE_DECLINED_SLIDE, SBSECRETS_STATE_DO_NEXT1, SBSECRETS_STATE_DO_NEXT2, SBSECRETS_STATE_HIT_CUSHION, SBSECRETS_STATE_HUGGED_CUSHION, SBSECRETS_STATE_INTRO, SBSECRETS_STATE_NOTHING_USED1, SBSECRETS_STATE_NOTHING_USED2, SBSECRETS_STATE_OUTRO, SBSECRETS_STATE_TOOK_X_STEPS, SBSECRETS_STATE_USED_BAG, SBSECRETS_STATE_USED_BALLOON, SBSECRETS_STATE_USED_BREAKABLE_DOOR, SBSECRETS_STATE_USED_BRICK, SBSECRETS_STATE_USED_CHAIR, SBSECRETS_STATE_USED_CUSHION, SBSECRETS_STATE_USED_DESK, SBSECRETS_STATE_USED_DOLL, SBSECRETS_STATE_USED_FENCE, SBSECRETS_STATE_USED_GLASS_ORNAMENT, SBSECRETS_STATE_USED_GLITTER_MAT, SBSECRETS_STATE_USED_GOLD_SHIELD, SBSECRETS_STATE_USED_JUMP_MAT, SBSECRETS_STATE_USED_MUD_BALL, SBSECRETS_STATE_USED_NOTE_MAT, SBSECRETS_STATE_USED_PLANT, SBSECRETS_STATE_USED_POSTER, SBSECRETS_STATE_USED_SAND_ORNAMENT, SBSECRETS_STATE_USED_SILVER_SHIELD, SBSECRETS_STATE_USED_SLIDE, SBSECRETS_STATE_USED_SOLID_BOARD, SBSECRETS_STATE_USED_SPIN_MAT, SBSECRETS_STATE_USED_STAND, SBSECRETS_STATE_USED_TENT, SBSECRETS_STATE_USED_TIRE, SBSECRETS_STATE_USED_TV, SMARTSHOPPER_NUM_ITEMS, SMARTSHOPPER_STATE_CLERK_MAX, SMARTSHOPPER_STATE_CLERK_NORMAL, SMARTSHOPPER_STATE_DURING_SALE, SMARTSHOPPER_STATE_INTRO, SMARTSHOPPER_STATE_IS_VIP, SMARTSHOPPER_STATE_OUTRO_MAX, SMARTSHOPPER_STATE_OUTRO_NORMAL, SMARTSHOPPER_STATE_RAND_COMMENT_1, SMARTSHOPPER_STATE_RAND_COMMENT_2, SMARTSHOPPER_STATE_RAND_COMMENT_3, SMARTSHOPPER_STATE_RAND_COMMENT_4, SMARTSHOPPER_STATE_SECOND_ITEM, SMARTSHOPPER_STATE_THIRD_ITEM, SPOTCUTIES_STATE_INTRO, SPOTCUTIES_STATE_OUTRO, SPOTCUTIES_STATE_RIBBONS_HIGH, SPOTCUTIES_STATE_RIBBONS_LOW, SPOTCUTIES_STATE_RIBBONS_MID, SPOTCUTIES_STATE_RIBBON_ARTIST, SPOTCUTIES_STATE_RIBBON_BEAUTY, SPOTCUTIES_STATE_RIBBON_CHAMPION, SPOTCUTIES_STATE_RIBBON_COOL, SPOTCUTIES_STATE_RIBBON_CUTE, SPOTCUTIES_STATE_RIBBON_EFFORT, SPOTCUTIES_STATE_RIBBON_INTRO, SPOTCUTIES_STATE_RIBBON_SMART, SPOTCUTIES_STATE_RIBBON_TOUGH, SPOTCUTIES_STATE_RIBBON_VICTORY, SPOTCUTIES_STATE_RIBBON_WINNING, TRENDWATCHER_STATE_BIGGER_FEMALE, TRENDWATCHER_STATE_BIGGER_MALE, TRENDWATCHER_STATE_INTRO, TRENDWATCHER_STATE_OUTRO, TRENDWATCHER_STATE_PHRASE_HOPELESS, TRENDWATCHER_STATE_TAUGHT_FEMALE, TRENDWATCHER_STATE_TAUGHT_MALE, TVGROUP_NORMAL_END, TVGROUP_NORMAL_START, TVGROUP_OUTBREAK_END, TVGROUP_OUTBREAK_START, TVGROUP_RECORD_MIX_END, TVGROUP_RECORD_MIX_START, TVSHOW_3_CHEERS_FOR_POKEBLOCKS, TVSHOW_BATTLE_SEMINAR, TVSHOW_BATTLE_UPDATE, TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE, TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE, TVSHOW_BREAKING_NEWS, TVSHOW_CONTEST_LIVE_UPDATES, TVSHOW_CUTIES, TVSHOW_DUMMY, TVSHOW_FAN_CLUB_LETTER, TVSHOW_FAN_CLUB_SPECIAL, TVSHOW_FIND_THAT_GAMER, TVSHOW_FISHING_ADVICE, TVSHOW_FRONTIER, TVSHOW_LILYCOVE_CONTEST_LADY, TVSHOW_LOTTO_WINNER, TVSHOW_MASS_OUTBREAK, TVSHOW_NAME_RATER_SHOW, TVSHOW_NUMBER_ONE, TVSHOW_OFF_AIR, TVSHOW_PKMN_FAN_CLUB_OPINIONS, TVSHOW_POKEMON_TODAY_CAUGHT, TVSHOW_POKEMON_TODAY_FAILED, TVSHOW_RECENT_HAPPENINGS, TVSHOW_SAFARI_FAN_CLUB, TVSHOW_SECRET_BASE_SECRETS, TVSHOW_SECRET_BASE_VISIT, TVSHOW_SMART_SHOPPER, TVSHOW_TODAYS_RIVAL_TRAINER, TVSHOW_TRAINER_FAN_CLUB, TVSHOW_TREASURE_INVESTIGATORS, TVSHOW_TREND_WATCHER, TVSHOW_WORLD_OF_MASTERS } from '../include/constants/tv';
import { VAR_BRAVO_TRAINER_BATTLE_TOWER_ON, VAR_CURRENT_SECRET_BASE, VAR_DAILY_BLENDER, VAR_DAILY_BP, VAR_DAILY_PICKED_BERRIES, VAR_DAILY_PLANTED_BERRIES, VAR_DAILY_ROULETTE, VAR_DAILY_SLOTS, VAR_DAILY_WILDS, VAR_SECRET_BASE_HIGH_TV_FLAGS, VAR_SECRET_BASE_LAST_ITEM_USED, VAR_SECRET_BASE_LOW_TV_FLAGS, VAR_SECRET_BASE_STEP_COUNTER, VAR_TEMP_3 } from '../include/constants/vars';
import { POKEBALL_COUNT } from '../include/pokeball';
import { MON_DATA_ARTIST_RIBBON, MON_DATA_BEAUTY_RIBBON, MON_DATA_CHAMPION_RIBBON, MON_DATA_COOL_RIBBON, MON_DATA_COUNTRY_RIBBON, MON_DATA_CUTE_RIBBON, MON_DATA_EARTH_RIBBON, MON_DATA_EFFORT_RIBBON, MON_DATA_FRIENDSHIP, MON_DATA_IS_EGG, MON_DATA_LAND_RIBBON, MON_DATA_LANGUAGE, MON_DATA_LEVEL, MON_DATA_MARINE_RIBBON, MON_DATA_MOVE1, MON_DATA_MOVE2, MON_DATA_MOVE3, MON_DATA_MOVE4, MON_DATA_NATIONAL_RIBBON, MON_DATA_NICKNAME, MON_DATA_OT_ID, MON_DATA_PERSONALITY, MON_DATA_SKY_RIBBON, MON_DATA_SMART_RIBBON, MON_DATA_SPECIES, MON_DATA_TOUGH_RIBBON, MON_DATA_VICTORY_RIBBON, MON_DATA_WINNING_RIBBON, MON_DATA_WORLD_RIBBON } from '../include/pokemon';
import { STR_CONV_MODE_LEFT_ALIGN } from '../include/string_util';
import { gDecorations } from './data/decoration/header';
import { ConvertEasyChatWordsToString, CopyEasyChatWord, EC_EMPTY_WORD, InitializeEasyChatWordArray } from './easy_chat';
import { BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI } from './engine/battle/constants';
import { GetMonData } from './engine/battle/party-storage';
import { gBattleOutcome, gBattleResults, gBattleTypeFlags, gLastUsedItem } from './engine/battle/state';
import { SpeciesToNationalPokedexNum, gMoveNames, gSpeciesNames } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { PokeNews, TVShow, TV_SHOWS_COUNT } from './engine/save/save-blocks';
import { getString } from '../harness/runtime/decomp-strings';
import { GetHoennPokedexCount, GetNationalPokedexCount, GetSetPokedexFlag } from './pokedex';
import { FLAG_GET_CAUGHT, FLAG_GET_SEEN } from '../include/pokedex';
import { FlagClear, FlagGet, FlagSet, IsNationalPokedexEnabled, VarGet, VarSet } from './event_data';
import { DrawWholeMapView } from './field_camera';
import { CB2_ReturnToFieldContinueScript_Manual } from './overworld';
import { ShowFieldMessage } from './field_message_box';
import { GetGameStat, IncrementGameStat } from './field_player_avatar';
import { GetLeadMonIndex } from './field_specials';
import { MAPGRID_COLLISION_MASK, MAP_OFFSET, MapGridGetMetatileBehaviorAt, MapGridSetMetatileIdAt, gBackupMapLayout, gMapHeader } from './fieldmap';
import { GetNicknameLanguage, TVShowConvertInternationalString } from './international_string_util';
import { GetCurrentBattleTowerWinStreak } from './battle_tower';
import { gMartPurchaseHistory } from './shop';
import { gStdStrings } from './data/script_menu';
import { GetBoxedMonPtr, SetBoxMonNickAt } from './pokemon_storage_system';
import { RemoveObjectEventByLocalIdAndMap } from './event_object_movement';
import { decodeOwBytes, encodeOwText } from './text';
import { getText } from './script';
import { GetItemName, GetItemPrice } from './item';
import { NUM_SPECIES } from './mail_data';
import { SetMainCallback2, gGameLanguage } from './main';
import { DoNamingScreen } from './naming_screen';
import { GetBoxMonGender, GetMonGender, SetMonData, gPlayerParty } from './pokemon';
import { Random } from './random';
import { GetMapName } from './region_map';
import { gLocalTime } from './rtc';
import { ConvertIntToDecimalStringN, ConvertInternationalString, IsStringJapanese, StringCompare, StringCopy, StringGet_Nickname, StringLength, StripExtCtrlCodes, gStringVar1, gStringVar2, gStringVar3, gStringVar4 } from './string_util';
import type { Pokemon } from './engine/battle/party-storage';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const LOCALID_ROUTE111_GABBY_1 = 14; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE111_TY_1 = 13; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE118_GABBY_1 = 5; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const LOCALID_ROUTE118_TY_1 = 6; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const LOCALID_ROUTE120_GABBY_1 = 18; // 1:1 generated:maps/Route120:0 (à consolider dans include/)
const LOCALID_ROUTE120_TY_1 = 17; // 1:1 generated:maps/Route120:0 (à consolider dans include/)
const LOCALID_ROUTE111_GABBY_2 = 21; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE111_TY_2 = 22; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE118_GABBY_2 = 8; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const LOCALID_ROUTE118_TY_2 = 9; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const LOCALID_ROUTE120_GABBY_2 = 19; // 1:1 generated:maps/Route120:0 (à consolider dans include/)
const LOCALID_ROUTE120_TY_2 = 20; // 1:1 generated:maps/Route120:0 (à consolider dans include/)
const LOCALID_ROUTE111_GABBY_3 = 23; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE111_TY_3 = 24; // 1:1 generated:maps/Route111:0 (à consolider dans include/)
const LOCALID_ROUTE118_GABBY_3 = 10; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const LOCALID_ROUTE118_TY_3 = 11; // 1:1 generated:maps/Route118:0 (à consolider dans include/)
const FRONTIER_MAX_LEVEL_OPEN = 100; // 1:1 include/constants/battle_frontier.h:53 (à consolider dans include/)
const GAME_LANGUAGE = 3; // 1:1 include/constants/global.h:30 (à consolider dans include/)
const LOCALID_SLATEPORT_ENERGY_GURU = 25; // 1:1 generated:maps/SlateportCity:0 (à consolider dans include/)
const CONTEST_RANK_NORMAL = 0; // 1:1 include/constants/contest.h:15 (à consolider dans include/)
const CONTEST_RANK_SUPER = 1; // 1:1 include/constants/contest.h:16 (à consolider dans include/)
const CONTEST_RANK_HYPER = 2; // 1:1 include/constants/contest.h:17 (à consolider dans include/)
const CONTEST_RANK_MASTER = 3; // 1:1 include/constants/contest.h:18 (à consolider dans include/)
const NAMING_SCREEN_NICKNAME = 3; // 1:1 include/naming_screen.h:0 (à consolider dans include/)
const LOCALID_TOWER_LOBBY_REPORTER = 5; // 1:1 generated:maps/BattleFrontier_BattleTowerLobby:0 (à consolider dans include/)
const MAX_LINK_PLAYERS = 4; // 1:1 include/link.h:4 (à consolider dans include/)
const CONTESTLIVE_FLAG_EXCITING_APPEAL = 1; // 1:1 include/constants/tv.h:209 (à consolider dans include/)
const CONTESTLIVE_FLAG_GOT_NERVOUS = 2; // 1:1 include/constants/tv.h:210 (à consolider dans include/)
const CONTESTLIVE_FLAG_MAXED_EXCITEMENT = 4; // 1:1 include/constants/tv.h:211 (à consolider dans include/)
const CONTESTLIVE_FLAG_USED_COMBO = 8; // 1:1 include/constants/tv.h:212 (à consolider dans include/)
const CONTESTLIVE_FLAG_STARTLED_OTHER = 16; // 1:1 include/constants/tv.h:213 (à consolider dans include/)
const CONTESTLIVE_FLAG_SKIPPED_TURN = 32; // 1:1 include/constants/tv.h:214 (à consolider dans include/)
const CONTESTLIVE_FLAG_GOT_STARTLED = 64; // 1:1 include/constants/tv.h:215 (à consolider dans include/)
const CONTESTLIVE_FLAG_MADE_APPEAL = 128; // 1:1 include/constants/tv.h:216 (à consolider dans include/)
const CONTESTLIVE_FLAG_LOST = 1; // 1:1 include/constants/tv.h:219 (à consolider dans include/)
const CONTESTLIVE_FLAG_REPEATED_MOVE = 2; // 1:1 include/constants/tv.h:220 (à consolider dans include/)
const CONTESTLIVE_FLAG_LOST_SMALL_MARGIN = 4; // 1:1 include/constants/tv.h:221 (à consolider dans include/)
const CONTESTLIVE_FLAG_NO_EXCITEMENT = 8; // 1:1 include/constants/tv.h:222 (à consolider dans include/)
const CONTESTLIVE_FLAG_BLEW_LEAD = 16; // 1:1 include/constants/tv.h:223 (à consolider dans include/)
const CONTESTLIVE_FLAG_MISSED_EXCITEMENT = 32; // 1:1 include/constants/tv.h:224 (à consolider dans include/)
const CONTESTLIVE_FLAG_LAST_BOTH_ROUNDS = 64; // 1:1 include/constants/tv.h:225 (à consolider dans include/)
const CONTESTLIVE_FLAG_NO_APPEALS = 128; // 1:1 include/constants/tv.h:226 (à consolider dans include/)
const CONTEST_LADY_GOOD = 1; // 1:1 include/constants/lilycove_lady.h:27 (à consolider dans include/)
const CONTEST_LADY_NORMAL = 0; // 1:1 include/constants/lilycove_lady.h:26 (à consolider dans include/)

// ─── layouts (mapLayoutId = STRING chez nous, cf. fieldmap.ts:288 json.layout) ─
const LAYOUT_SS_TIDAL_CORRIDOR = 'LAYOUT_SS_TIDAL_CORRIDOR';
const LAYOUT_SS_TIDAL_LOWER_DECK = 'LAYOUT_SS_TIDAL_LOWER_DECK';
const LAYOUT_SS_TIDAL_ROOMS = 'LAYOUT_SS_TIDAL_ROOMS';

// ─── DETTES tracées (substrats pas encore portés) ────────────────────────────
// CONTEST (contest.c / contest_util.c / lilycove_lady.c) : les shows concours ne
// peuvent PAS se déclencher (leurs entry points — SaveGameFrontier/contest —
// n'existent pas encore) ; stubs typés à remplacer au chantier CONTEST.
const gContestMons: Array<{ nickname: string; trainerName: string; species: number }> = [];
const gContestMonPartyIndex = 0;
const gNumLinkContestPlayers = 0;
// Lilycove Ladies — CÂBLÉ (vague lilycove) : délégations pont __lilycoveLady
// (posé par lilycove_lady.ts ; anti-cycle : tv ↛ lilycove_lady en import statique).
type _LilycoveLadyBridge = {
  BufferContestLadyLanguage(dest: { v: number }): void;
  BufferContestLadyPlayerName(dest: Uint8Array): void;
  BufferContestLadyMonName(cat: { v: number }, nick: Uint8Array): void;
  GetContestLadyPokeblockState(): number;
  BufferContestName(dest: Uint8Array, category: number): void;
};
function _lilycoveBridge(): _LilycoveLadyBridge | undefined {
  return (globalThis as { __lilycoveLady?: _LilycoveLadyBridge }).__lilycoveLady;
}
function BufferContestLadyLanguage(dest: { v: number }): void { _lilycoveBridge()?.BufferContestLadyLanguage(dest); }
function BufferContestLadyPlayerName(dest: Uint8Array): void { _lilycoveBridge()?.BufferContestLadyPlayerName(dest); }
function BufferContestLadyMonName(cat: { v: number }, nick: Uint8Array): void { _lilycoveBridge()?.BufferContestLadyMonName(cat, nick); }
function GetContestLadyPokeblockState(): number { return _lilycoveBridge()?.GetContestLadyPokeblockState() ?? 0; }
function BufferContestName(dest: Uint8Array, category: number): void { _lilycoveBridge()?.BufferContestName(dest, category); }
// SECRET BASE (secret_base.c partiel) :
function CopyCurSecretBaseOwnerName_StrVar1(): void { /* DETTE secret_base.c */ }
// LINK (exemption hardware — record mixing inerte en solo) :
const gLinkPlayers: Array<{ version: number; trainerId: number; language: number; name: string }> = [];
function GetLinkPlayerCount(): number { return 1; /* link.c EXTRACT_PLAYER_COUNT — solo */ }
function GetLinkPlayerTrainerId(i: number): number { return gLinkPlayers[i]?.trainerId ?? 0; }

/** Helper foyer : gStdStrings[i] = clé gText_* → bytes charmap pour StringCopy. */
const stdString = (i: number): Uint8Array => encodeOwText(getString(gStdStrings[i] ?? ''));

/** Frontière charmap→save : normalise une source StringCopy (string JS, bytes
 *  charmap Uint8Array, ou u8[] décomp) en string JS pour les champs TVShow. */
function tvStr(src: string | Uint8Array | number[]): string {
  if (typeof src === 'string') return src;
  return decodeOwBytes(src instanceof Uint8Array ? src : Uint8Array.from(src));
}

const LAST_TVSHOW_IDX = (TV_SHOWS_COUNT - 1); // 1:1 tv.c:49

const rbernoulli = (num: number, den: number) => BernoulliTrial(0xFFFF * (num) / (den)); // 1:1 macro tv.c:51

// enum tv.c:53
const TVGROUP_NONE = 0;
const TVGROUP_UNUSED = 1;
const TVGROUP_NORMAL = 2;
const TVGROUP_RECORD_MIX = 3;
const TVGROUP_OUTBREAK = 4;

// enum tv.c:61
const SLOT_MACHINE = 0;
const ROULETTE = 1;

/** 1:1 (tv.c:66) */
export let sCurTVShowSlot = 0;

/** 1:1 `COMMON_DATA u16 sTV_SecretBaseVisitMovesTemp[8] = {0};` (tv.c:67) */
export const sTV_SecretBaseVisitMovesTemp = new Uint16Array(8);

/** 1:1 `COMMON_DATA u8 sTV_DecorationsBuffer[DECOR_MAX_SECRET_BASE] = {0};` (tv.c:68) */
export const sTV_DecorationsBuffer = new Uint8Array(DECOR_MAX_SECRET_BASE);

/** 1:1 `COMMON_DATA struct { u8 level; u16 species; u16 move; } sTV_SecretBaseVisitMonsTemp[10] = {0};` (tv.c:69-73) */
export const sTV_SecretBaseVisitMonsTemp = Array.from({ length: 10 }, () => ({ level: 0, species: 0, move: 0 }));

/** 1:1 (tv.c:75) */
let sTVShowMixingNumPlayers = 0;

/** 1:1 (tv.c:76) */
let sTVShowNewsMixingNumPlayers = 0;

/** 1:1 (tv.c:77) */
let sTVShowMixingCurSlot = 0;

/** 1:1 (tv.c:79) */
let sPokemonAnglerSpecies = 0;

/** 1:1 (tv.c:80) */
let sPokemonAnglerAttemptCounters = 0;

/** 1:1 (tv.c:81) */
let sFindThatGamerCoinsSpent = 0;

/** 1:1 (tv.c:82) */
let sFindThatGamerWhichGame = SLOT_MACHINE;

/** 1:1 (tv.c:83) */
let sRecordMixingPartnersWithoutShowsToShare = 0;

/** 1:1 (tv.c:84) */
let sTVShowState = 0;

/** 1:1 (tv.c:85) */
const sTVSecretBaseSecretsRandomValues = Uint8Array.from([

]);

/** 1:1 (tv.c:197) */
const sPokeOutbreakSpeciesList = [
  {
    species: SPECIES_SEEDOT,
    moves: [
      MOVE_BIDE,
      MOVE_HARDEN,
      MOVE_LEECH_SEED,
    ],
    level: 3,
    location: MAP_NUM(MAP_CONSTANTS.MAP_ROUTE102),
  },
  {
    species: SPECIES_NUZLEAF,
    moves: [
      MOVE_HARDEN,
      MOVE_GROWTH,
      MOVE_NATURE_POWER,
      MOVE_LEECH_SEED,
    ],
    level: 15,
    location: MAP_NUM(MAP_CONSTANTS.MAP_ROUTE114),
  },
  {
    species: SPECIES_SEEDOT,
    moves: [
      MOVE_HARDEN,
      MOVE_GROWTH,
      MOVE_NATURE_POWER,
      MOVE_LEECH_SEED,
    ],
    level: 13,
    location: MAP_NUM(MAP_CONSTANTS.MAP_ROUTE117),
  },
  {
    species: SPECIES_SEEDOT,
    moves: [
      MOVE_GIGA_DRAIN,
      MOVE_FRUSTRATION,
      MOVE_SOLAR_BEAM,
      MOVE_LEECH_SEED,
    ],
    level: 25,
    location: MAP_NUM(MAP_CONSTANTS.MAP_ROUTE120),
  },
  {
    species: SPECIES_SKITTY,
    moves: [
      MOVE_GROWL,
      MOVE_TACKLE,
      MOVE_TAIL_WHIP,
      MOVE_ATTRACT,
    ],
    level: 8,
    location: MAP_NUM(MAP_CONSTANTS.MAP_ROUTE116),
  },
];

/** 1:1 (tv.c:230) */
const sGoldSymbolFlags = Uint16Array.from([
  FLAG_SYS_TOWER_GOLD, // [FRONTIER_FACILITY_TOWER]
  FLAG_SYS_DOME_GOLD, // [FRONTIER_FACILITY_DOME]
  FLAG_SYS_PALACE_GOLD, // [FRONTIER_FACILITY_PALACE]
  FLAG_SYS_ARENA_GOLD, // [FRONTIER_FACILITY_ARENA]
  FLAG_SYS_FACTORY_GOLD, // [FRONTIER_FACILITY_FACTORY]
  FLAG_SYS_PIKE_GOLD, // [FRONTIER_FACILITY_PIKE]
  FLAG_SYS_PYRAMID_GOLD, // [FRONTIER_FACILITY_PYRAMID]
]);

/** 1:1 (tv.c:240) */
const sSilverSymbolFlags = Uint16Array.from([
  FLAG_SYS_TOWER_SILVER, // [FRONTIER_FACILITY_TOWER]
  FLAG_SYS_DOME_SILVER, // [FRONTIER_FACILITY_DOME]
  FLAG_SYS_PALACE_SILVER, // [FRONTIER_FACILITY_PALACE]
  FLAG_SYS_ARENA_SILVER, // [FRONTIER_FACILITY_ARENA]
  FLAG_SYS_FACTORY_SILVER, // [FRONTIER_FACILITY_FACTORY]
  FLAG_SYS_PIKE_SILVER, // [FRONTIER_FACILITY_PIKE]
  FLAG_SYS_PYRAMID_SILVER, // [FRONTIER_FACILITY_PYRAMID]
]);

/** 1:1 (tv.c:250) */
const sNumberOneVarsAndThresholds: number[][] = [
  [
    VAR_DAILY_SLOTS,
    100,
  ],
  [
    VAR_DAILY_ROULETTE,
    50,
  ],
  [
    VAR_DAILY_WILDS,
    100,
  ],
  [
    VAR_DAILY_BLENDER,
    20,
  ],
  [
    VAR_DAILY_PLANTED_BERRIES,
    20,
  ],
  [
    VAR_DAILY_PICKED_BERRIES,
    20,
  ],
  [
    VAR_DAILY_BP,
    30,
  ],
];

/** 1:1 (tv.c:260) */
const sPokeNewsTextGroup_Upcoming: (string | null)[] = [
  null, // [POKENEWS_NONE]
  'gPokeNewsTextSlateport_Upcoming', // [POKENEWS_SLATEPORT]
  'gPokeNewsTextGameCorner_Upcoming', // [POKENEWS_GAME_CORNER]
  'gPokeNewsTextLilycove_Upcoming', // [POKENEWS_LILYCOVE]
  'gPokeNewsTextBlendMaster_Upcoming', // [POKENEWS_BLENDMASTER]
];

/** 1:1 (tv.c:268) */
const sPokeNewsTextGroup_Ongoing: (string | null)[] = [
  null, // [POKENEWS_NONE]
  'gPokeNewsTextSlateport_Ongoing', // [POKENEWS_SLATEPORT]
  'gPokeNewsTextGameCorner_Ongoing', // [POKENEWS_GAME_CORNER]
  'gPokeNewsTextLilycove_Ongoing', // [POKENEWS_LILYCOVE]
  'gPokeNewsTextBlendMaster_Ongoing', // [POKENEWS_BLENDMASTER]
];

/** 1:1 (tv.c:276) */
const sPokeNewsTextGroup_Ending: (string | null)[] = [
  null, // [POKENEWS_NONE]
  'gPokeNewsTextSlateport_Ending', // [POKENEWS_SLATEPORT]
  'gPokeNewsTextGameCorner_Ending', // [POKENEWS_GAME_CORNER]
  'gPokeNewsTextLilycove_Ending', // [POKENEWS_LILYCOVE]
  'gPokeNewsTextBlendMaster_Ending', // [POKENEWS_BLENDMASTER]
];

/** 1:1 (tv.c:284) */
// 1:1 `static u8 *const gTVStringVarPtrs[] = { gStringVar1, gStringVar2, gStringVar3 }` (tv.c:83)
// — tableau de POINTEURS vers les buffers (pas un Uint8Array de valeurs).
export const gTVStringVarPtrs: Uint8Array[] = [
  gStringVar1,
  gStringVar2,
  gStringVar3,
];

/** 1:1 (tv.c:290) */
const sTVFanClubTextGroup : string[] = [
  'gTVFanClubText00',
  'gTVFanClubText01',
  'gTVFanClubText02',
  'gTVFanClubText03',
  'gTVFanClubText04',
  'gTVFanClubText05',
  'gTVFanClubText06',
  'gTVFanClubText07',
];

/** 1:1 (tv.c:301) */
const sTVRecentHappeninssTextGroup : string[] = [
  'gTVRecentHappeningsText00',
  'gTVRecentHappeningsText01',
  'gTVRecentHappeningsText02',
  'gTVRecentHappeningsText03',
  'gTVRecentHappeningsText04',
  'gTVRecentHappeningsText05',
];

/** 1:1 (tv.c:310) */
const sTVFanClubOpinionsTextGroup : string[] = [
  'gTVFanClubOpinionsText00',
  'gTVFanClubOpinionsText01',
  'gTVFanClubOpinionsText02',
  'gTVFanClubOpinionsText03',
  'gTVFanClubOpinionsText04',
];

/** 1:1 (tv.c:318) */
const sTVMassOutbreakTextGroup : string[] = [
  'gTVMassOutbreakText00',
];

/** 1:1 (tv.c:322) */
const sTVPokemonTodaySuccessfulTextGroup : string[] = [
  'gTVPokemonTodaySuccessfulText00',
  'gTVPokemonTodaySuccessfulText01',
  'gTVPokemonTodaySuccessfulText02',
  'gTVPokemonTodaySuccessfulText03',
  'gTVPokemonTodaySuccessfulText04',
  'gTVPokemonTodaySuccessfulText05',
  'gTVPokemonTodaySuccessfulText06',
  'gTVPokemonTodaySuccessfulText07',
  'gTVPokemonTodaySuccessfulText08',
  'gTVPokemonTodaySuccessfulText09',
  'gTVPokemonTodaySuccessfulText10',
  'gTVPokemonTodaySuccessfulText11',
];

/** 1:1 (tv.c:337) */
const sTVTodaysSmartShopperTextGroup : string[] = [
  'SmartShopper_Text_Intro', // [SMARTSHOPPER_STATE_INTRO]
  'SmartShopper_Text_ClerkNormal', // [SMARTSHOPPER_STATE_CLERK_NORMAL]
  'SmartShopper_Text_RandomComment1', // [SMARTSHOPPER_STATE_RAND_COMMENT_1]
  'SmartShopper_Text_RandomComment2', // [SMARTSHOPPER_STATE_RAND_COMMENT_2]
  'SmartShopper_Text_RandomComment3', // [SMARTSHOPPER_STATE_RAND_COMMENT_3]
  'SmartShopper_Text_RandomComment4', // [SMARTSHOPPER_STATE_RAND_COMMENT_4]
  'SmartShopper_Text_SecondItem', // [SMARTSHOPPER_STATE_SECOND_ITEM]
  'SmartShopper_Text_ThirdItem', // [SMARTSHOPPER_STATE_THIRD_ITEM]
  'SmartShopper_Text_DuringSale', // [SMARTSHOPPER_STATE_DURING_SALE]
  'SmartShopper_Text_OutroNormal', // [SMARTSHOPPER_STATE_OUTRO_NORMAL]
  'SmartShopper_Text_IsVIP', // [SMARTSHOPPER_STATE_IS_VIP]
  'SmartShopper_Text_ClerkMax', // [SMARTSHOPPER_STATE_CLERK_MAX]
  'SmartShopper_Text_OutroMax', // [SMARTSHOPPER_STATE_OUTRO_MAX]
];

/** 1:1 (tv.c:353) */
const sTVBravoTrainerTextGroup : string[] = [
  'gTVBravoTrainerText00',
  'gTVBravoTrainerText01',
  'gTVBravoTrainerText02',
  'gTVBravoTrainerText03',
  'gTVBravoTrainerText04',
  'gTVBravoTrainerText05',
  'gTVBravoTrainerText06',
  'gTVBravoTrainerText07',
  'gTVBravoTrainerText08',
];

/** 1:1 (tv.c:365) */
const sTV3CheersForPokeblocksTextGroup : string[] = [
  'gTV3CheersForPokeblocksText00',
  'gTV3CheersForPokeblocksText01',
  'gTV3CheersForPokeblocksText02',
  'gTV3CheersForPokeblocksText03',
  'gTV3CheersForPokeblocksText04',
  'gTV3CheersForPokeblocksText05',
];

/** 1:1 (tv.c:374) */
const sTVBravoTrainerBattleTowerTextGroup : string[] = [
  'BravoTrainerBattleTower_Text_Intro', // [BRAVOTOWER_STATE_INTRO]
  'BravoTrainerBattleTower_Text_NewRecord', // [BRAVOTOWER_STATE_NEW_RECORD]
  'BravoTrainerBattleTower_Text_Lost', // [BRAVOTOWER_STATE_LOST]
  'BravoTrainerBattleTower_Text_Won', // [BRAVOTOWER_STATE_WON]
  'BravoTrainerBattleTower_Text_LostFinal', // [BRAVOTOWER_STATE_LOST_FINAL]
  'BravoTrainerBattleTower_Text_Satisfied', // [BRAVOTOWER_STATE_SATISFIED]
  'BravoTrainerBattleTower_Text_Unsatisfied', // [BRAVOTOWER_STATE_UNSATISFIED]
  'BravoTrainerBattleTower_Text_None1', // [BRAVOTOWER_STATE_UNUSED_1]
  'BravoTrainerBattleTower_Text_None2', // [BRAVOTOWER_STATE_UNUSED_2]
  'BravoTrainerBattleTower_Text_None3', // [BRAVOTOWER_STATE_UNUSED_3]
  'BravoTrainerBattleTower_Text_None4', // [BRAVOTOWER_STATE_UNUSED_4]
  'BravoTrainerBattleTower_Text_Response', // [BRAVOTOWER_STATE_RESPONSE]
  'BravoTrainerBattleTower_Text_ResponseSatisfied', // [BRAVOTOWER_STATE_RESPONSE_SATISFIED]
  'BravoTrainerBattleTower_Text_ResponseUnsatisfied', // [BRAVOTOWER_STATE_RESPONSE_UNSATISFIED]
  'BravoTrainerBattleTower_Text_Outro', // [BRAVOTOWER_STATE_OUTRO]
];

/** 1:1 (tv.c:392) */
const sTVContestLiveUpdatesTextGroup : string[] = [
  'ContestLiveUpdates_Text_Intro', // [CONTESTLIVE_STATE_INTRO]
  'ContestLiveUpdates_Text_WonBothRounds', // [CONTESTLIVE_STATE_WON_BOTH_ROUNDS]
  'ContestLiveUpdates_Text_BetterRound2', // [CONTESTLIVE_STATE_BETTER_ROUND2]
  'ContestLiveUpdates_Text_EqualRounds', // [CONTESTLIVE_STATE_EQUAL_ROUNDS]
  'ContestLiveUpdates_Text_BetterRound1', // [CONTESTLIVE_STATE_BETTER_ROUND1]
  'ContestLiveUpdates_Text_GotNervous', // [CONTESTLIVE_STATE_GOT_NERVOUS]
  'ContestLiveUpdates_Text_StartledFoes', // [CONTESTLIVE_STATE_STARTLED_OTHER]
  'ContestLiveUpdates_Text_UsedCombo', // [CONTESTLIVE_STATE_USED_COMBO]
  'ContestLiveUpdates_Text_ExcitingAppeal', // [CONTESTLIVE_STATE_EXCITING_APPEAL]
  'ContestLiveUpdates_Text_WasCool', // [CONTESTLIVE_STATE_COOL]
  'ContestLiveUpdates_Text_WasBeautiful', // [CONTESTLIVE_STATE_BEAUTIFUL]
  'ContestLiveUpdates_Text_WasCute', // [CONTESTLIVE_STATE_CUTE]
  'ContestLiveUpdates_Text_WasSmart', // [CONTESTLIVE_STATE_SMART]
  'ContestLiveUpdates_Text_WasTough', // [CONTESTLIVE_STATE_TOUGH]
  'ContestLiveUpdates_Text_VeryExcitingAppeal', // [CONTESTLIVE_STATE_VERY_EXCITING_APPEAL]
  'ContestLiveUpdates_Text_VeryCool', // [CONTESTLIVE_STATE_VERY_COOL]
  'ContestLiveUpdates_Text_VeryBeautiful', // [CONTESTLIVE_STATE_VERY_BEAUTIFUL]
  'ContestLiveUpdates_Text_VeryCute', // [CONTESTLIVE_STATE_VERY_CUTE]
  'ContestLiveUpdates_Text_VerySmart', // [CONTESTLIVE_STATE_VERY_SMART]
  'ContestLiveUpdates_Text_VeryTough', // [CONTESTLIVE_STATE_VERY_TOUGH]
  'ContestLiveUpdates_Text_TookBreak', // [CONTESTLIVE_STATE_TOOK_BREAK]
  'ContestLiveUpdates_Text_GotStartled', // [CONTESTLIVE_STATE_GOT_STARTLED]
  'ContestLiveUpdates_Text_MoveWonderful', // [CONTESTLIVE_STATE_USED_MOVE]
  'ContestLiveUpdates_Text_TalkAboutAnotherMon', // [CONTESTLIVE_STATE_TALK_ABOUT_LOSER]
  'ContestLiveUpdates_Text_FailedToAppeal', // [CONTESTLIVE_STATE_NO_APPEALS]
  'ContestLiveUpdates_Text_LastInBothRounds', // [CONTESTLIVE_STATE_LAST_BOTH]
  'ContestLiveUpdates_Text_NotExcitingEnough', // [CONTESTLIVE_STATE_NOT_EXCITING_ENOUGH]
  'ContestLiveUpdates_Text_LostAfterWinningRound1', // [CONTESTLIVE_STATE_LOST_AFTER_ROUND1_WIN]
  'ContestLiveUpdates_Text_NeverExciting', // [CONTESTLIVE_STATE_NO_EXCITING_APPEALS]
  'ContestLiveUpdates_Text_LostBySmallMargin', // [CONTESTLIVE_STATE_LOST_SMALL_MARGIN]
  'ContestLiveUpdates_Text_RepeatedAppeals', // [CONTESTLIVE_STATE_REPEATED_APPEALS]
  'ContestLiveUpdates_Text_ValiantEffortButLost', // [CONTESTLIVE_STATE_LOST]
  'ContestLiveUpdates_Text_Outro', // [CONTESTLIVE_STATE_OUTRO]
];

/** 1:1 (tv.c:428) */
const sTVPokemonBattleUpdateTextGroup : string[] = [
  'gTVPokemonBattleUpdateText00',
  'gTVPokemonBattleUpdateText01',
  'gTVPokemonBattleUpdateText02',
  'gTVPokemonBattleUpdateText03',
  'gTVPokemonBattleUpdateText04',
  'gTVPokemonBattleUpdateText05',
  'gTVPokemonBattleUpdateText06',
  'gTVPokemonBattleUpdateText07',
];

/** 1:1 (tv.c:439) */
const sTVTrainerFanClubSpecialTextGroup : string[] = [
  'gTVTrainerFanClubSpecialText00',
  'gTVTrainerFanClubSpecialText01',
  'gTVTrainerFanClubSpecialText02',
  'gTVTrainerFanClubSpecialText03',
  'gTVTrainerFanClubSpecialText04',
  'gTVTrainerFanClubSpecialText05',
];

/** 1:1 (tv.c:448) */
const sTVNameRaterTextGroup : string[] = [
  'gTVNameRaterText00',
  'gTVNameRaterText01',
  'gTVNameRaterText02',
  'gTVNameRaterText03',
  'gTVNameRaterText04',
  'gTVNameRaterText05',
  'gTVNameRaterText06',
  'gTVNameRaterText07',
  'gTVNameRaterText08',
  'gTVNameRaterText09',
  'gTVNameRaterText10',
  'gTVNameRaterText11',
  'gTVNameRaterText12',
  'gTVNameRaterText13',
  'gTVNameRaterText14',
  'gTVNameRaterText15',
  'gTVNameRaterText16',
  'gTVNameRaterText17',
  'gTVNameRaterText18',
];

/** 1:1 (tv.c:470) */
const sTVLilycoveContestLadyTextGroup : string[] = [
  'ContestLadyShow_Text_Intro', // [CONTESTLADYLIVE_STATE_INTRO]
  'ContestLadyShow_Text_Won', // [CONTESTLADYLIVE_STATE_WON]
  'ContestLadyShow_Text_Lost', // [CONTESTLADYLIVE_STATE_LOST]
  'ContestLadyShow_Text_LostBadly', // [CONTESTLADYLIVE_STATE_LOST_BADLY]
];

/** 1:1 (tv.c:477) */
const sTVPokemonTodayFailedTextGroup : string[] = [
  'gTVPokemonTodayFailedText00',
  'gTVPokemonTodayFailedText01',
  'gTVPokemonTodayFailedText02',
  'gTVPokemonTodayFailedText03',
  'gTVPokemonTodayFailedText04',
  'gTVPokemonTodayFailedText05',
  'gTVPokemonTodayFailedText06',
];

/** 1:1 (tv.c:487) */
const sTVPokemonAnglerTextGroup : string[] = [
  'gTVPokemonAnglerText00',
  'gTVPokemonAnglerText01',
];

/** 1:1 (tv.c:492) */
const sTVWorldOfMastersTextGroup : string[] = [
  'gTVWorldOfMastersText00',
  'gTVWorldOfMastersText01',
  'gTVWorldOfMastersText02',
];

/** 1:1 (tv.c:498) */
const sTVTodaysRivalTrainerTextGroup : string[] = [
  'gTVTodaysRivalTrainerText00',
  'gTVTodaysRivalTrainerText01',
  'gTVTodaysRivalTrainerText02',
  'gTVTodaysRivalTrainerText03',
  'gTVTodaysRivalTrainerText04',
  'gTVTodaysRivalTrainerText05',
  'gTVTodaysRivalTrainerText06',
  'gTVTodaysRivalTrainerText07',
  'gTVTodaysRivalTrainerText08',
  'gTVTodaysRivalTrainerText09',
  'gTVTodaysRivalTrainerText10',
];

/** 1:1 (tv.c:512) */
const sTVDewfordTrendWatcherNetworkTextGroup : string[] = [
  'TrendWatcher_Text_Intro', // [TRENDWATCHER_STATE_INTRO]
  'TrendWatcher_Text_MaleTaughtMePhrase', // [TRENDWATCHER_STATE_TAUGHT_MALE]
  'TrendWatcher_Text_FemaleTaughtMePhrase', // [TRENDWATCHER_STATE_TAUGHT_FEMALE]
  'TrendWatcher_Text_PhraseWasHopeless', // [TRENDWATCHER_STATE_PHRASE_HOPELESS]
  'TrendWatcher_Text_MaleTellMeBigger', // [TRENDWATCHER_STATE_BIGGER_MALE]
  'TrendWatcher_Text_FemaleTellMeBigger', // [TRENDWATCHER_STATE_BIGGER_FEMALE]
  'TrendWatcher_Text_Outro', // [TRENDWATCHER_STATE_OUTRO]
];

/** 1:1 (tv.c:522) */
const sTVHoennTreasureInvestisatorsTextGroup : string[] = [
  'gTVHoennTreasureInvestigatorsText00',
  'gTVHoennTreasureInvestigatorsText01',
  'gTVHoennTreasureInvestigatorsText02',
];

/** 1:1 (tv.c:528) */
const sTVFindThatGamerTextGroup : string[] = [
  'gTVFindThatGamerText00',
  'gTVFindThatGamerText01',
  'gTVFindThatGamerText02',
  'gTVFindThatGamerText03',
];

/** 1:1 (tv.c:535) */
const sTVBreakingNewsTextGroup : string[] = [
  'gTVBreakingNewsText00',
  'gTVBreakingNewsText01',
  'gTVBreakingNewsText02',
  'gTVBreakingNewsText03',
  'gTVBreakingNewsText04',
  'gTVBreakingNewsText05',
  'gTVBreakingNewsText06',
  'gTVBreakingNewsText07',
  'gTVBreakingNewsText08',
  'gTVBreakingNewsText09',
  'gTVBreakingNewsText10',
  'gTVBreakingNewsText11',
  'gTVBreakingNewsText12',
];

/** 1:1 (tv.c:551) */
const sTVSecretBaseVisitTextGroup : string[] = [
  'gTVSecretBaseVisitText00',
  'gTVSecretBaseVisitText01',
  'gTVSecretBaseVisitText02',
  'gTVSecretBaseVisitText03',
  'gTVSecretBaseVisitText04',
  'gTVSecretBaseVisitText05',
  'gTVSecretBaseVisitText06',
  'gTVSecretBaseVisitText07',
  'gTVSecretBaseVisitText08',
  'gTVSecretBaseVisitText09',
  'gTVSecretBaseVisitText10',
  'gTVSecretBaseVisitText11',
  'gTVSecretBaseVisitText12',
  'gTVSecretBaseVisitText13',
];

/** 1:1 (tv.c:568) */
const sTVPokemonLotteryWinnerFlashReportTextGroup : string[] = [
  'gTVPokemonLotteryWinnerFlashReportText00',
];

/** 1:1 (tv.c:572) */
const sTVThePokemonBattleSeminarTextGroup : string[] = [
  'gTVThePokemonBattleSeminarText00',
  'gTVThePokemonBattleSeminarText01',
  'gTVThePokemonBattleSeminarText02',
  'gTVThePokemonBattleSeminarText03',
  'gTVThePokemonBattleSeminarText04',
  'gTVThePokemonBattleSeminarText05',
  'gTVThePokemonBattleSeminarText06',
];

/** 1:1 (tv.c:582) */
const sTVTrainerFanClubTextGroup : string[] = [
  'gTVTrainerFanClubText00',
  'gTVTrainerFanClubText01',
  'gTVTrainerFanClubText02',
  'gTVTrainerFanClubText03',
  'gTVTrainerFanClubText04',
  'gTVTrainerFanClubText05',
  'gTVTrainerFanClubText06',
  'gTVTrainerFanClubText07',
  'gTVTrainerFanClubText08',
  'gTVTrainerFanClubText09',
  'gTVTrainerFanClubText10',
  'gTVTrainerFanClubText11',
];

/** 1:1 (tv.c:597) */
const sTVCutiesTextGroup : string[] = [
  'TVSpotTheCuties_Text_Intro', // [SPOTCUTIES_STATE_INTRO]
  'TVSpotTheCuties_Text_RibbonsLow', // [SPOTCUTIES_STATE_RIBBONS_LOW]
  'TVSpotTheCuties_Text_RibbonsMid', // [SPOTCUTIES_STATE_RIBBONS_MID]
  'TVSpotTheCuties_Text_RibbonsHigh', // [SPOTCUTIES_STATE_RIBBONS_HIGH]
  'TVSpotTheCuties_Text_RibbonIntro', // [SPOTCUTIES_STATE_RIBBON_INTRO]
  'TVSpotTheCuties_Text_RibbonChampion', // [SPOTCUTIES_STATE_RIBBON_CHAMPION]
  'TVSpotTheCuties_Text_RibbonCool', // [SPOTCUTIES_STATE_RIBBON_COOL]
  'TVSpotTheCuties_Text_RibbonBeauty', // [SPOTCUTIES_STATE_RIBBON_BEAUTY]
  'TVSpotTheCuties_Text_RibbonCute', // [SPOTCUTIES_STATE_RIBBON_CUTE]
  'TVSpotTheCuties_Text_RibbonSmart', // [SPOTCUTIES_STATE_RIBBON_SMART]
  'TVSpotTheCuties_Text_RibbonTough', // [SPOTCUTIES_STATE_RIBBON_TOUGH]
  'TVSpotTheCuties_Text_RibbonWinning', // [SPOTCUTIES_STATE_RIBBON_WINNING]
  'TVSpotTheCuties_Text_RibbonVictory', // [SPOTCUTIES_STATE_RIBBON_VICTORY]
  'TVSpotTheCuties_Text_RibbonArtist', // [SPOTCUTIES_STATE_RIBBON_ARTIST]
  'TVSpotTheCuties_Text_RibbonEffort', // [SPOTCUTIES_STATE_RIBBON_EFFORT]
  'TVSpotTheCuties_Text_Outro', // [SPOTCUTIES_STATE_OUTRO]
];

/** 1:1 (tv.c:616) */
const sTVPokemonNewsBattleFrontierTextGroup : string[] = [
  'gTVPokemonNewsBattleFrontierText00',
  'gTVPokemonNewsBattleFrontierText01',
  'gTVPokemonNewsBattleFrontierText02',
  'gTVPokemonNewsBattleFrontierText03',
  'gTVPokemonNewsBattleFrontierText04',
  'gTVPokemonNewsBattleFrontierText05',
  'gTVPokemonNewsBattleFrontierText06',
  'gTVPokemonNewsBattleFrontierText07',
  'gTVPokemonNewsBattleFrontierText08',
  'gTVPokemonNewsBattleFrontierText09',
  'gTVPokemonNewsBattleFrontierText10',
  'gTVPokemonNewsBattleFrontierText11',
  'gTVPokemonNewsBattleFrontierText12',
  'gTVPokemonNewsBattleFrontierText13',
  'gTVPokemonNewsBattleFrontierText14',
  'gTVPokemonNewsBattleFrontierText15',
  'gTVPokemonNewsBattleFrontierText16',
  'gTVPokemonNewsBattleFrontierText17',
  'gTVPokemonNewsBattleFrontierText18',
];

/** 1:1 (tv.c:638) */
const sTVWhatsNo1InHoennTodayTextGroup : string[] = [
  'gTVWhatsNo1InHoennTodayText00',
  'gTVWhatsNo1InHoennTodayText01',
  'gTVWhatsNo1InHoennTodayText02',
  'gTVWhatsNo1InHoennTodayText03',
  'gTVWhatsNo1InHoennTodayText04',
  'gTVWhatsNo1InHoennTodayText05',
  'gTVWhatsNo1InHoennTodayText06',
  'gTVWhatsNo1InHoennTodayText07',
  'gTVWhatsNo1InHoennTodayText08',
];

/** 1:1 (tv.c:650) */
const sTVSecretBaseSecretsTextGroup : string[] = [
  'TVSecretBaseSecrets_Text_Intro', // [SBSECRETS_STATE_INTRO]
  'TVSecretBaseSecrets_Text_WhatWillPlayerDoNext1', // [SBSECRETS_STATE_DO_NEXT1]
  'TVSecretBaseSecrets_Text_WhatWillPlayerDoNext2', // [SBSECRETS_STATE_DO_NEXT2]
  'TVSecretBaseSecrets_Text_TookXStepsBeforeLeaving', // [SBSECRETS_STATE_TOOK_X_STEPS]
  'TVSecretBaseSecrets_Text_BaseFailedToInterestPlayer', // [SBSECRETS_STATE_BASE_INTEREST_LOW]
  'TVSecretBaseSecrets_Text_PlayerEnjoyedBase', // [SBSECRETS_STATE_BASE_INTEREST_MED]
  'TVSecretBaseSecrets_Text_PlayerHugeFanOfBase', // [SBSECRETS_STATE_BASE_INTEREST_HIGH]
  'TVSecretBaseSecrets_Text_Outro', // [SBSECRETS_STATE_OUTRO]
  'TVSecretBaseSecrets_Text_StoppedMoving1', // [SBSECRETS_STATE_NOTHING_USED1]
  'TVSecretBaseSecrets_Text_StoppedMoving2', // [SBSECRETS_STATE_NOTHING_USED2]
  'TVSecretBaseSecrets_Text_UsedChair', // [SBSECRETS_STATE_USED_CHAIR]
  'TVSecretBaseSecrets_Text_UsedBalloon', // [SBSECRETS_STATE_USED_BALLOON]
  'TVSecretBaseSecrets_Text_UsedTent', // [SBSECRETS_STATE_USED_TENT]
  'TVSecretBaseSecrets_Text_UsedPlant', // [SBSECRETS_STATE_USED_PLANT]
  'TVSecretBaseSecrets_Text_UsedGoldShield', // [SBSECRETS_STATE_USED_GOLD_SHIELD]
  'TVSecretBaseSecrets_Text_UsedSilverShield', // [SBSECRETS_STATE_USED_SILVER_SHIELD]
  'TVSecretBaseSecrets_Text_UsedGlassOrnament', // [SBSECRETS_STATE_USED_GLASS_ORNAMENT]
  'TVSecretBaseSecrets_Text_UsedTV', // [SBSECRETS_STATE_USED_TV]
  'TVSecretBaseSecrets_Text_UsedMudBall', // [SBSECRETS_STATE_USED_MUD_BALL]
  'TVSecretBaseSecrets_Text_UsedBag', // [SBSECRETS_STATE_USED_BAG]
  'TVSecretBaseSecrets_Text_UsedCushion', // [SBSECRETS_STATE_USED_CUSHION]
  'TVSecretBaseSecrets_Text_HitCushion', // [SBSECRETS_STATE_HIT_CUSHION]
  'TVSecretBaseSecrets_Text_HuggedCushion', // [SBSECRETS_STATE_HUGGED_CUSHION]
  'TVSecretBaseSecrets_Text_BattledWon', // [SBSECRETS_STATE_BATTLED_WON]
  'TVSecretBaseSecrets_Text_BattledLost', // [SBSECRETS_STATE_BATTLED_LOST]
  'TVSecretBaseSecrets_Text_DeclinedBattle', // [SBSECRETS_STATE_DECLINED_BATTLE]
  'TVSecretBaseSecrets_Text_UsedPoster', // [SBSECRETS_STATE_USED_POSTER]
  'TVSecretBaseSecrets_Text_UsedNoteMat', // [SBSECRETS_STATE_USED_NOTE_MAT]
  'TVSecretBaseSecrets_Text_BattledDraw', // [SBSECRETS_STATE_BATTLED_DRAW]
  'TVSecretBaseSecrets_Text_UsedSpinMat', // [SBSECRETS_STATE_USED_SPIN_MAT]
  'TVSecretBaseSecrets_Text_UsedSandOrnament', // [SBSECRETS_STATE_USED_SAND_ORNAMENT]
  'TVSecretBaseSecrets_Text_UsedDesk', // [SBSECRETS_STATE_USED_DESK]
  'TVSecretBaseSecrets_Text_UsedBrick', // [SBSECRETS_STATE_USED_BRICK]
  'TVSecretBaseSecrets_Text_UsedSolidBoard', // [SBSECRETS_STATE_USED_SOLID_BOARD]
  'TVSecretBaseSecrets_Text_UsedFence', // [SBSECRETS_STATE_USED_FENCE]
  'TVSecretBaseSecrets_Text_UsedGlitterMat', // [SBSECRETS_STATE_USED_GLITTER_MAT]
  'TVSecretBaseSecrets_Text_UsedTire', // [SBSECRETS_STATE_USED_TIRE]
  'TVSecretBaseSecrets_Text_UsedStand', // [SBSECRETS_STATE_USED_STAND]
  'TVSecretBaseSecrets_Text_BrokeDoor', // [SBSECRETS_STATE_USED_BREAKABLE_DOOR]
  'TVSecretBaseSecrets_Text_UsedDoll', // [SBSECRETS_STATE_USED_DOLL]
  'TVSecretBaseSecrets_Text_UsedSlide', // [SBSECRETS_STATE_USED_SLIDE]
  'TVSecretBaseSecrets_Text_UsedSlideButDidntGoDown', // [SBSECRETS_STATE_DECLINED_SLIDE]
  'TVSecretBaseSecrets_Text_UsedJumpMat', // [SBSECRETS_STATE_USED_JUMP_MAT]
];

/** 1:1 (tv.c:697) */
const sTVSafariFanClubTextGroup : string[] = [
  'gTVSafariFanClubText00',
  'gTVSafariFanClubText01',
  'gTVSafariFanClubText02',
  'gTVSafariFanClubText03',
  'gTVSafariFanClubText04',
  'gTVSafariFanClubText05',
  'gTVSafariFanClubText06',
  'gTVSafariFanClubText07',
  'gTVSafariFanClubText08',
  'gTVSafariFanClubText09',
  'gTVSafariFanClubText10',
];

/** 1:1 (tv.c:711) */
const sTVInSearchOfTrainersTextGroup : string[] = [
  'gTVInSearchOfTrainersText00',
  'gTVInSearchOfTrainersText01',
  'gTVInSearchOfTrainersText02',
  'gTVInSearchOfTrainersText03',
  'gTVInSearchOfTrainersText04',
  'gTVInSearchOfTrainersText05',
  'gTVInSearchOfTrainersText06',
  'gTVInSearchOfTrainersText07',
  'gTVInSearchOfTrainersText08',
];

// Secret Base Secrets TV Show states for actions that can be taken in a secret base

// The flags that determine whether or not the action was taken are commented

/** 1:1 (tv.c:725) */
const sTVSecretBaseSecretsActions = Uint8Array.from([
  SBSECRETS_STATE_USED_CHAIR,
  // SECRET_BASE_USED_CHAIR
  SBSECRETS_STATE_USED_BALLOON,
  // SECRET_BASE_USED_BALLOON
  SBSECRETS_STATE_USED_TENT,
  // SECRET_BASE_USED_TENT
  SBSECRETS_STATE_USED_PLANT,
  // SECRET_BASE_USED_PLANT
  SBSECRETS_STATE_USED_GOLD_SHIELD,
  // SECRET_BASE_USED_GOLD_SHIELD
  SBSECRETS_STATE_USED_SILVER_SHIELD,
  // SECRET_BASE_USED_SILVER_SHIELD
  SBSECRETS_STATE_USED_GLASS_ORNAMENT,
  // SECRET_BASE_USED_GLASS_ORNAMENT
  SBSECRETS_STATE_USED_TV,
  // SECRET_BASE_USED_TV
  SBSECRETS_STATE_USED_MUD_BALL,
  // SECRET_BASE_USED_MUD_BALL
  SBSECRETS_STATE_USED_BAG,
  // SECRET_BASE_USED_BAG
  SBSECRETS_STATE_USED_CUSHION,
  // SECRET_BASE_USED_CUSHION
  SBSECRETS_STATE_BATTLED_WON,
  // SECRET_BASE_BATTLED_WON
  SBSECRETS_STATE_BATTLED_LOST,
  // SECRET_BASE_BATTLED_LOST
  SBSECRETS_STATE_DECLINED_BATTLE,
  // SECRET_BASE_DECLINED_BATTLE
  SBSECRETS_STATE_USED_POSTER,
  // SECRET_BASE_USED_POSTER
  SBSECRETS_STATE_USED_NOTE_MAT,
  // SECRET_BASE_USED_NOTE_MAT
  SBSECRETS_STATE_BATTLED_DRAW,
  // SECRET_BASE_BATTLED_DRAW
  SBSECRETS_STATE_USED_SPIN_MAT,
  // SECRET_BASE_USED_SPIN_MAT
  SBSECRETS_STATE_USED_SAND_ORNAMENT,
  // SECRET_BASE_USED_SAND_ORNAMENT
  SBSECRETS_STATE_USED_DESK,
  // SECRET_BASE_USED_DESK
  SBSECRETS_STATE_USED_BRICK,
  // SECRET_BASE_USED_BRICK
  SBSECRETS_STATE_USED_SOLID_BOARD,
  // SECRET_BASE_USED_SOLID_BOARD
  SBSECRETS_STATE_USED_FENCE,
  // SECRET_BASE_USED_FENCE
  SBSECRETS_STATE_USED_GLITTER_MAT,
  // SECRET_BASE_USED_GLITTER_MAT
  SBSECRETS_STATE_USED_TIRE,
  // SECRET_BASE_USED_TIRE
  SBSECRETS_STATE_USED_STAND,
  // SECRET_BASE_USED_STAND
  SBSECRETS_STATE_USED_BREAKABLE_DOOR,
  // SECRET_BASE_USED_BREAKABLE_DOOR
  SBSECRETS_STATE_USED_DOLL,
  // SECRET_BASE_USED_DOLL
  SBSECRETS_STATE_USED_SLIDE,
  // SECRET_BASE_USED_SLIDE
  SBSECRETS_STATE_DECLINED_SLIDE,
  // SECRET_BASE_DECLINED_SLIDE
  SBSECRETS_STATE_USED_JUMP_MAT,
  // SECRET_BASE_USED_JUMP_MAT
  SBSECRETS_NUM_STATES,
  // SECRET_BASE_UNUSED_FLAG. Odd that this is included, if it were used it would overflow sTVSecretBaseSecretsTextGroup
]);

/** Reset 1:1 d'un slot TVShow (équivalent `commonInit.{kind,active,data[34]=0}`) :
 *  remplace l'objet par {kind, active} vierge — tout le payload variant disparaît,
 *  comme le memset du C (union aplatie). */
function ClearTVShowSlot(shows: TVShow[], idx: number, kind: number): void {
  shows[idx] = { kind, active: 0 };
}

/** 1:1 `void ClearTVShowData(void)` (tv.c:761-773). */
export function ClearTVShowData(): void {
  let i = 0;
  for (i = 0; i < gSaveBlock1Ptr.tvShows.length; i++)
  {
    // 1:1 `commonInit.kind/active = 0` + boucle `commonInit.data[j] = 0`.
    ClearTVShowSlot(gSaveBlock1Ptr.tvShows, i, 0);
  }
  ClearPokeNews();
}

/** 1:1 `u8 GetRandomActiveShowIdx(void)` (tv.c:775-811). */
export function GetRandomActiveShowIdx(): number {
  let i = 0;
  let j = 0;
  let selIdx = 0;
  let show: any = null;
  // Include all normal TV shows, and up through any present Record Mix shows
  for (i = NUM_NORMAL_TVSHOW_SLOTS; i < LAST_TVSHOW_IDX; i++)
  {
    if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_OFF_AIR)
      break;
  }
  j = Random() % i;
  selIdx = j;
  do
  {
    if (GetTVGroupByShowId(gSaveBlock1Ptr.tvShows[j].kind) != TVGROUP_OUTBREAK)
    {
      if (gSaveBlock1Ptr.tvShows[j].active == 1)
        return j;
    }
    else
    {
      show = gSaveBlock1Ptr.tvShows[j] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
      if (show.daysLeft == 0 && show.active == 1)
        return j;
    }
    if (j == 0)
      j = gSaveBlock1Ptr.tvShows.length - 2;
    else
      j--;
  }
  while (j != selIdx);
  return 0xFF;
}

/** 1:1 `u8 FindAnyTVShowOnTheAir(void)` (tv.c:813-824). */
export function FindAnyTVShowOnTheAir(): number {
  let slot = GetRandomActiveShowIdx();
  if (slot == 0xFF)
    return 0xFF;
  if (gSaveBlock1Ptr.outbreakPokemonSpecies != SPECIES_NONE && gSaveBlock1Ptr.tvShows[slot].kind == TVSHOW_MASS_OUTBREAK)
    return FindFirstActiveTVShowThatIsNotAMassOutbreak();
  return slot;
}

/** 1:1 `void UpdateTVScreensOnMap(int width, int height)` (tv.c:826-852). */
export function UpdateTVScreensOnMap(width: number, height: number): void {
  FlagSet(FLAG_SYS_TV_WATCH);
  switch (CheckForPlayersHouseNews()) {
    case PLAYERS_HOUSE_TV_LATI:
      SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
      break;
    case PLAYERS_HOUSE_TV_MOVIE:
      // Don't flash TV for movie text in player's house
      break;
    //  case PLAYERS_HOUSE_TV_NONE:
    default:
      if (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_1F) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_1F))
      {
        // NPC in Lilycove Hotel is always watching TV
        SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
      }
      else if (FlagGet(FLAG_SYS_TV_START) && (FindAnyTVShowOnTheAir() != 0xFF || FindAnyPokeNewsOnTheAir() != 0xFF || IsGabbyAndTyShowOnTheAir()))
      {
        FlagClear(FLAG_SYS_TV_WATCH);
        SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
      }
      break;
  }
}

/** 1:1 `static void SetTVMetatilesOnMap(int width, int height, u16 metatileId)` (tv.c:854-867). */
function SetTVMetatilesOnMap(width: number, height: number, metatileId: number): void {
  let x = 0;
  let y = 0;
  for (y = 0; y < height; y++)
  {
    for (x = 0; x < width; x++)
    {
      // Adaptation vérifiée en jeu (ancien tv.ts) : nos helpers MapGrid* attendent
      // les coords INTERNES (buffer gBackupMapLayout wrappé) → + MAP_OFFSET.
      if (MapGridGetMetatileBehaviorAt(x + MAP_OFFSET, y + MAP_OFFSET) == MB_TELEVISION)
        MapGridSetMetatileIdAt(x + MAP_OFFSET, y + MAP_OFFSET, metatileId | MAPGRID_COLLISION_MASK);
    }
  }
}

/** 1:1 `void TurnOffTVScreen(void)` (tv.c:869-873). */
export function TurnOffTVScreen(): void {
  SetTVMetatilesOnMap(gBackupMapLayout.width, gBackupMapLayout.height, METATILE_Building_TV_Off);
  DrawWholeMapView();
}

/** 1:1 `void TurnOnTVScreen(void)` (tv.c:875-879). */
export function TurnOnTVScreen(): void {
  SetTVMetatilesOnMap(gBackupMapLayout.width, gBackupMapLayout.height, METATILE_Building_TV_On);
  DrawWholeMapView();
}

// gSpecialVar_0x8004 here is set from GetRandomActiveShowIdx in EventScript_TryDoTVShow

/** 1:1 `u8 GetSelectedTVShow(void)` (tv.c:882-885). */
export function GetSelectedTVShow(): number {
  return gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */].kind;
}

/** 1:1 `static u8 FindFirstActiveTVShowThatIsNotAMassOutbreak(void)` (tv.c:887-899). */
function FindFirstActiveTVShowThatIsNotAMassOutbreak(): number {
  let i = 0;
  for (i = 0; i < gSaveBlock1Ptr.tvShows.length - 1; i++)
  {
    if (gSaveBlock1Ptr.tvShows[i].kind != TVSHOW_OFF_AIR && gSaveBlock1Ptr.tvShows[i].kind != TVSHOW_MASS_OUTBREAK && gSaveBlock1Ptr.tvShows[i].active == 1)
      return i;
  }
  return 0xFF;
}

/** 1:1 `u8 GetNextActiveShowIfMassOutbreak(void)` (tv.c:901-910). */
export function GetNextActiveShowIfMassOutbreak(): number {
  let tvShow: any = null;
  tvShow = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (tvShow.kind == TVSHOW_MASS_OUTBREAK && gSaveBlock1Ptr.outbreakPokemonSpecies != SPECIES_NONE)
    return FindFirstActiveTVShowThatIsNotAMassOutbreak();
  return VarGet(0x8004) /* gSpecialVar_0x8004 */;
}

// IN SEARCH OF TRAINERS

/** 1:1 `void ResetGabbyAndTy(void)` (tv.c:914-933). */
export function ResetGabbyAndTy(): void {
  gSaveBlock1Ptr.gabbyAndTyData.mon1 = SPECIES_NONE;
  gSaveBlock1Ptr.gabbyAndTyData.mon2 = SPECIES_NONE;
  gSaveBlock1Ptr.gabbyAndTyData.lastMove = MOVE_NONE;
  gSaveBlock1Ptr.gabbyAndTyData.quote[0] = 0xFFFF; // 1:1 quote[0] = -1 (u16 wrap = EC_EMPTY_WORD)
  gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall = 0;
  gSaveBlock1Ptr.gabbyAndTyData.onAir = 0;
  gSaveBlock1Ptr.gabbyAndTyData.valA_5 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn2 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon2 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem2 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall2 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.valB_4 = 0;
  gSaveBlock1Ptr.gabbyAndTyData.mapnum = 0;
  gSaveBlock1Ptr.gabbyAndTyData.battleNum = 0;
}

/** 1:1 `void GabbyAndTyBeforeInterview(void)` (tv.c:935-977). */
export function GabbyAndTyBeforeInterview(): void {
  let i = 0;
  gSaveBlock1Ptr.gabbyAndTyData.mon1 = gBattleResults.playerMon1Species;
  gSaveBlock1Ptr.gabbyAndTyData.mon2 = gBattleResults.playerMon2Species;
  gSaveBlock1Ptr.gabbyAndTyData.lastMove = gBattleResults.lastUsedMovePlayer;
  if (gSaveBlock1Ptr.gabbyAndTyData.battleNum != 0xFF)
    gSaveBlock1Ptr.gabbyAndTyData.battleNum++;
  gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn = gBattleResults.playerMonWasDamaged;
  if (gBattleResults.playerFaintCounter != 0)
    gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon = true;
  else
    gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon = false;
  if (gBattleResults.numHealingItemsUsed != 0)
    gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem = true;
  else
    gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem = false;
  if (!gBattleResults.usedMasterBall)
  {
    for (i = 0; i < POKEBALL_COUNT - 1; i++)
    {
      if (gBattleResults.catchAttempts[i])
      {
        gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall = true;
        break;
      }
    }
  }
  else
  {
    // Player threw a Master Ball at Gabby and Ty
    gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall = true;
  }
  TakeGabbyAndTyOffTheAir();
  if (gSaveBlock1Ptr.gabbyAndTyData.lastMove == MOVE_NONE)
    FlagSet(FLAG_TEMP_SKIP_GABBY_INTERVIEW);
}

/** 1:1 `void GabbyAndTyAfterInterview(void)` (tv.c:979-988). */
export function GabbyAndTyAfterInterview(): void {
  gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn2 = gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn;
  gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon2 = gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon;
  gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem2 = gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem;
  gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall2 = gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall;
  gSaveBlock1Ptr.gabbyAndTyData.onAir = true;
  gSaveBlock1Ptr.gabbyAndTyData.mapnum = gMapHeader!.regionMapSectionId;
  IncrementGameStat(GAME_STAT_GOT_INTERVIEWED);
}

/** 1:1 `static void TakeGabbyAndTyOffTheAir(void)` (tv.c:990-993). */
function TakeGabbyAndTyOffTheAir(): void {
  gSaveBlock1Ptr.gabbyAndTyData.onAir = false;
}

// See gabby_and_ty.inc for details

/** 1:1 `u8 GabbyAndTyGetBattleNum(void)` (tv.c:996-1002). */
export function GabbyAndTyGetBattleNum(): number {
  if (gSaveBlock1Ptr.gabbyAndTyData.battleNum > 5)
    return (gSaveBlock1Ptr.gabbyAndTyData.battleNum % 3) + 6;
  return gSaveBlock1Ptr.gabbyAndTyData.battleNum;
}

/** 1:1 `bool8 IsGabbyAndTyShowOnTheAir(void)` (tv.c:1004-1007). */
export function IsGabbyAndTyShowOnTheAir(): boolean {
  return gSaveBlock1Ptr.gabbyAndTyData.onAir;
}

/** 1:1 `bool8 GabbyAndTyGetLastQuote(void)` (tv.c:1009-1018). */
export function GabbyAndTyGetLastQuote(): boolean {
  if (gSaveBlock1Ptr.gabbyAndTyData.quote[0] == EC_EMPTY_WORD)
  {
    return false;
  }
  CopyEasyChatWord(gStringVar1, gSaveBlock1Ptr.gabbyAndTyData.quote[0]);
  gSaveBlock1Ptr.gabbyAndTyData.quote[0] = -1;
  return true;
}

/** 1:1 `u8 GabbyAndTyGetLastBattleTrivia(void)` (tv.c:1020-1035). */
export function GabbyAndTyGetLastBattleTrivia(): number {
  if (!gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn2)
    return 1;
  if (gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall2)
    return 2;
  if (gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem2)
    return 3;
  if (gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon2)
    return 4;
  return 0;
}

// See gabby_and_ty.inc for details

/** 1:1 `void GetGabbyAndTyLocalIds(void)` (tv.c:1038-1075). */
export function GetGabbyAndTyLocalIds(): void {
  switch (GabbyAndTyGetBattleNum()) {
    case 1:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE111_GABBY_1));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE111_TY_1));
      break;
    case 2:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE118_GABBY_1));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE118_TY_1));
      break;
    case 3:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE120_GABBY_1));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE120_TY_1));
      break;
    case 4:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE111_GABBY_2));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE111_TY_2));
      break;
    case 5:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE118_GABBY_2));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE118_TY_2));
      break;
    case 6:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE120_GABBY_2));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE120_TY_2));
      break;
    case 7:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE111_GABBY_3));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE111_TY_3));
      break;
    case 8:
      VarSet(0x8004 /* gSpecialVar_0x8004 */, +(LOCALID_ROUTE118_GABBY_3));
      VarSet(0x8005 /* gSpecialVar_0x8005 */, +(LOCALID_ROUTE118_TY_3));
      break;
  }
}

/** 1:1 `void InterviewAfter(void)` (tv.c:1077-1103). */
export function InterviewAfter(): void {
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case TVSHOW_FAN_CLUB_LETTER:
      InterviewAfter_FanClubLetter();
      break;
    case TVSHOW_RECENT_HAPPENINGS:
      InterviewAfter_RecentHappenings();
      break;
    case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
      InterviewAfter_PkmnFanClubOpinions();
      break;
    case TVSHOW_DUMMY:
      InterviewAfter_Dummy();
      break;
    case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
      InterviewAfter_BravoTrainerPokemonProfile();
      break;
    case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
      InterviewAfter_BravoTrainerBattleTowerProfile();
      break;
    case TVSHOW_CONTEST_LIVE_UPDATES:
      InterviewAfter_ContestLiveUpdates();
      break;
  }
}

/** 1:1 `void TryPutPokemonTodayOnAir(void)` (tv.c:1105-1166). */
export function TryPutPokemonTodayOnAir(): void {
  let i = 0;
  let ballsUsed = 0;
  let show: any = null;
  let language2 = 0;
  let itemLastUsed = 0;
  ballsUsed = 0;
  TryPutRandomPokeNewsOnAir();
  TryStartRandomMassOutbreak();
  // Try either the Failed or Caught version of the show
  if (gBattleResults.caughtMonSpecies == SPECIES_NONE)
  {
    TryPutPokemonTodayFailedOnTheAir();
  }
  else
  {
    InitWorldOfMastersShowAttempt();
    if (!rbernoulli(1, 1) && StringCompare(encodeOwText(gSpeciesNames[gBattleResults.caughtMonSpecies]), Uint8Array.from(gBattleResults.caughtMonNick)))
    {
      sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
      if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_POKEMON_TODAY_CAUGHT, false) != true)
      {
        for (i = 0; i < POKEBALL_COUNT - 1; i++)
          ballsUsed += gBattleResults.catchAttempts[i];
        if (ballsUsed != 0 || gBattleResults.usedMasterBall)
        {
          ballsUsed = 0;
          show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
          show.kind = TVSHOW_POKEMON_TODAY_CAUGHT;
          show.active = false;
          // NOTE: Show is not active until passed via Record Mix.
          if (gBattleResults.usedMasterBall)
          {
            ballsUsed = 1;
            itemLastUsed = ITEM_MASTER_BALL;
          }
          else
          {
            for (i = 0; i < POKEBALL_COUNT - 1; i++)
              ballsUsed += gBattleResults.catchAttempts[i];
            if (ballsUsed > 255)
              ballsUsed = 255;
            itemLastUsed = gLastUsedItem;
          }
          show.nBallsUsed = ballsUsed;
          show.ball = itemLastUsed;
          show.playerName = tvStr(gSaveBlock2Ptr.playerName);
          show.nickname = tvStr(gBattleResults.caughtMonNick);
          language2 = GetNicknameLanguage(show.nickname);
          // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
          show.species = gBattleResults.caughtMonSpecies;
          StorePlayerIdInRecordMixShow(show);
          show.language = gGameLanguage;
          show.language2 = language2;
        }
      }
    }
  }
}

// Show is initialized in last slot and updated there until it's

// either triggered or deleted at the end of the day by ResolveWorldOfMastersShow

/** 1:1 `static void InitWorldOfMastersShowAttempt(void)` (tv.c:1170-1183). */
function InitWorldOfMastersShowAttempt(): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (show.kind != TVSHOW_WORLD_OF_MASTERS)
  {
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
    show.steps = GetGameStat(GAME_STAT_STEPS);
    show.kind = TVSHOW_WORLD_OF_MASTERS;
  }
  show.numPokeCaught++;
  show.caughtPoke = gBattleResults.caughtMonSpecies;
  show.species = gBattleResults.playerMon1Species;
  show.location = gMapHeader!.regionMapSectionId;
}

/** 1:1 `static void TryPutPokemonTodayFailedOnTheAir(void)` (tv.c:1185-1217). */
function TryPutPokemonTodayFailedOnTheAir(): void {
  let ballsUsed = 0;
  let i = 0;
  let show: any = null;
  if (!rbernoulli(1, 1))
  {
    for ((i = 0, ballsUsed = 0); i < POKEBALL_COUNT - 1; i++)
      ballsUsed += gBattleResults.catchAttempts[i];
    if (ballsUsed > 255)
      ballsUsed = 255;
    if (ballsUsed > 2 && (gBattleOutcome == B_OUTCOME_MON_FLED || gBattleOutcome == B_OUTCOME_WON))
    {
      sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
      if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_POKEMON_TODAY_FAILED, false) != true)
      {
        show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        show.kind = TVSHOW_POKEMON_TODAY_FAILED;
        show.active = false;
        // NOTE: Show is not active until passed via Record Mix.
        show.species = gBattleResults.playerMon1Species;
        show.species2 = gBattleResults.lastOpponentSpecies;
        show.nBallsUsed = ballsUsed;
        show.outcome = gBattleOutcome;
        show.location = gMapHeader!.regionMapSectionId;
        show.playerName = tvStr(gSaveBlock2Ptr.playerName);
        StorePlayerIdInRecordMixShow(show);
        show.language = gGameLanguage;
      }
    }
  }
}

/** 1:1 `static void StorePlayerIdInRecordMixShow(TVShow *show)` (tv.c:1219-1228). */
function StorePlayerIdInRecordMixShow(show: TVShow): void {
  let id = GetPlayerIDAsU32();
  show.srcTrainerId2Lo = id;
  show.srcTrainerId2Hi = id >>> 8;
  show.srcTrainerIdLo = id;
  show.srcTrainerIdHi = id >>> 8;
  show.trainerIdLo = id;
  show.trainerIdHi = id >>> 8;
}

/** 1:1 `static void StorePlayerIdInNormalShow(TVShow *show)` (tv.c:1230-1237). */
function StorePlayerIdInNormalShow(show: TVShow): void {
  let id = GetPlayerIDAsU32();
  show.srcTrainerIdLo = id;
  show.srcTrainerIdHi = id >>> 8;
  show.trainerIdLo = id;
  show.trainerIdHi = id >>> 8;
}

/** 1:1 `static void InterviewAfter_ContestLiveUpdates(void)` (tv.c:1239-1265). */
function InterviewAfter_ContestLiveUpdates(): void {
  let show: any = null;
  let show2: any = null;
  show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (show.kind == TVSHOW_CONTEST_LIVE_UPDATES)
  {
    show2 = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show2.kind = TVSHOW_CONTEST_LIVE_UPDATES;
    show2.active = true;
    show2.winningTrainerName = tvStr(gSaveBlock2Ptr.playerName);
    // Show only begins running if player won, so always load players name
    show2.category = VarGet(0x8011) /* gSpecialVar_ContestCategory */;
    show2.winningSpecies = GetMonData(gPlayerParty[gContestMonPartyIndex], MON_DATA_SPECIES);
    show2.losingSpecies = show.losingSpecies;
    show2.loserAppealFlag = show.loserAppealFlag;
    show2.round1Placing = show.round1Placing;
    show2.round2Placing = show.round2Placing;
    show2.move = show.move;
    show2.winnerAppealFlag = show.winnerAppealFlag;
    show2.losingTrainerName = tvStr(show.losingTrainerName);
    StorePlayerIdInNormalShow(show2);
    show2.winningTrainerLanguage = gGameLanguage;
    show2.losingTrainerLanguage = show.losingTrainerLanguage;
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
  }
}

/** 1:1 `void PutBattleUpdateOnTheAir(u8 opponentLinkPlayerId, u16 move, u16 speciesPlayer, u16 speciesOpponent)` (tv.c:1267-1304). */
export function PutBattleUpdateOnTheAir(opponentLinkPlayerId: number, move: number, speciesPlayer: number, speciesOpponent: number): void {
  let show: any = null;
  const name = new Uint8Array(32);
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    TryReplaceOldTVShowOfKind(TVSHOW_BATTLE_UPDATE);
    if (VarGet(0x800D) /* gSpecialVar_Result */ != 1)
    {
      show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
      show.kind = TVSHOW_BATTLE_UPDATE;
      show.active = true;
      show.playerName = tvStr(gSaveBlock2Ptr.playerName);
      if (gBattleTypeFlags & BATTLE_TYPE_MULTI)
        show.battleType = 2;
      else if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        show.battleType = 1;
      else
        show.battleType = 0;
      show.move = move;
      show.speciesPlayer = speciesPlayer;
      show.speciesOpponent = speciesOpponent;
      StringCopy(name, encodeOwText(gLinkPlayers[opponentLinkPlayerId].name));
      StripExtCtrlCodes(name);
      show.linkOpponentName = tvStr(name);
      StorePlayerIdInNormalShow(show);
      show.language = gGameLanguage;
      if (show.language == LANGUAGE_JAPANESE || gLinkPlayers[opponentLinkPlayerId].language == LANGUAGE_JAPANESE)
        show.linkOpponentLanguage = LANGUAGE_JAPANESE;
      else
        show.linkOpponentLanguage = gLinkPlayers[opponentLinkPlayerId].language;
    }
  }
}

/** 1:1 `bool8 Put3CheersForPokeblocksOnTheAir(const u8 *partnersName, u8 flavor, u8 color, u8 sheen, u8 language)` (tv.c:1306-1336). */
export function Put3CheersForPokeblocksOnTheAir(partnersName: Uint8Array, flavor: number, color: number, sheen: number, language: number): boolean {
  let show: any = null;
  const name = new Uint8Array(32);
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot == -1)
    return false;
  TryReplaceOldTVShowOfKind(TVSHOW_3_CHEERS_FOR_POKEBLOCKS);
  if (VarGet(0x800D) /* gSpecialVar_Result */ == 1)
    return false;
  // Old show is still active
  show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.kind = TVSHOW_3_CHEERS_FOR_POKEBLOCKS;
  show.active = true;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  StringCopy(name, partnersName);
  StripExtCtrlCodes(name);
  show.worstBlenderName = tvStr(name);
  show.flavor = flavor;
  show.color = color;
  show.sheen = sheen;
  StorePlayerIdInNormalShow(show);
  show.language = gGameLanguage;
  if (show.language == LANGUAGE_JAPANESE || language == LANGUAGE_JAPANESE)
    show.worstBlenderLanguage = LANGUAGE_JAPANESE;
  else
    show.worstBlenderLanguage = language;
  return true;
}

/** 1:1 `void PutFanClubSpecialOnTheAir(void)` (tv.c:1338-1361). */
export function PutFanClubSpecialOnTheAir(): void {
  let show: any = null;
  const name = new Uint8Array(32);
  let id = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8006) /* gSpecialVar_0x8006 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.score = VarGet(0x8005) /* gSpecialVar_0x8005 */ * 10;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  show.kind = TVSHOW_FAN_CLUB_SPECIAL;
  show.active = true;
  id = GetPlayerIDAsU32();
  show.idLo = id;
  show.idHi = id >>> 8;
  StringCopy(name, gStringVar1);
  StripExtCtrlCodes(name);
  show.idolName = tvStr(name);
  StorePlayerIdInNormalShow(show);
  show.language = gGameLanguage;
  if (show.language == LANGUAGE_JAPANESE || gSaveBlock1Ptr.linkBattleRecords.languages[0] == LANGUAGE_JAPANESE)
    show.idolNameLanguage = LANGUAGE_JAPANESE;
  else
    show.idolNameLanguage = gSaveBlock1Ptr.linkBattleRecords.languages[0];
}

/** 1:1 `void ContestLiveUpdates_Init(u8 round1Placing)` (tv.c:1363-1375). */
export function ContestLiveUpdates_Init(round1Placing: number): void {
  let show: any = null;
  DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.round1Placing = round1Placing;
    show.kind = TVSHOW_CONTEST_LIVE_UPDATES;
  }
}

/** 1:1 `void ContestLiveUpdates_SetRound2Placing(u8 round2Placing)` (tv.c:1377-1383). */
export function ContestLiveUpdates_SetRound2Placing(round2Placing: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
    show.round2Placing = round2Placing;
}

/** 1:1 `void ContestLiveUpdates_SetWinnerAppealFlag(u8 flag)` (tv.c:1385-1391). */
export function ContestLiveUpdates_SetWinnerAppealFlag(flag: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
    show.winnerAppealFlag = flag;
}

/** 1:1 `void ContestLiveUpdates_SetWinnerMoveUsed(u16 move)` (tv.c:1393-1399). */
export function ContestLiveUpdates_SetWinnerMoveUsed(move: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
    show.move = move;
}

/** 1:1 `void ContestLiveUpdates_SetLoserData(u8 flag, u8 loser)` (tv.c:1401-1419). */
export function ContestLiveUpdates_SetLoserData(flag: number, loser: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show.losingSpecies = gContestMons[loser].species;
    show.losingTrainerName = tvStr(gContestMons[loser].trainerName);
    // 1:1 StripExtCtrlCodes(show.losingTrainerName) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
    show.loserAppealFlag = flag;
    if (loser + 1 > gNumLinkContestPlayers)
      show.losingTrainerLanguage = gLinkPlayers[0].language;
    else if ((gGameLanguage as number) == LANGUAGE_JAPANESE || gLinkPlayers[loser].language == LANGUAGE_JAPANESE)
      show.losingTrainerLanguage = LANGUAGE_JAPANESE;
    else
      show.losingTrainerLanguage = gLinkPlayers[loser].language;
  }
}

/** 1:1 `static void InterviewAfter_BravoTrainerPokemonProfile(void)` (tv.c:1421-1448). */
function InterviewAfter_BravoTrainerPokemonProfile(): void {
  let show: any = null;
  let show2: any = null;
  show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (show.kind == TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE)
  {
    show2 = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show2.kind = TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE;
    show2.active = true;
    show2.species = show.species;
    show2.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show2.pokemonNickname = tvStr(show.pokemonNickname);
    show2.contestCategory = show.contestCategory;
    show2.contestRank = show.contestRank;
    show2.move = show.move;
    show2.contestResult = show.contestResult;
    show2.contestCategory = show.contestCategory;
    StorePlayerIdInNormalShow(show2);
    show2.language = gGameLanguage;
    if (show2.language == LANGUAGE_JAPANESE || show.pokemonNameLanguage == LANGUAGE_JAPANESE)
      show2.pokemonNameLanguage = LANGUAGE_JAPANESE;
    else
      show2.pokemonNameLanguage = show.pokemonNameLanguage;
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
  }
}

/** 1:1 `void BravoTrainerPokemonProfile_BeforeInterview1(u16 move)` (tv.c:1450-1461). */
export function BravoTrainerPokemonProfile_BeforeInterview1(move: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  InterviewBefore_BravoTrainerPkmnProfile();
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
    show.move = move;
    show.kind = TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE;
  }
}

/** 1:1 `void BravoTrainerPokemonProfile_BeforeInterview2(u8 contestStandingPlace)` (tv.c:1463-1477). */
export function BravoTrainerPokemonProfile_BeforeInterview2(contestStandingPlace: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show.contestResult = contestStandingPlace;
    show.contestCategory = VarGet(0x8011) /* gSpecialVar_ContestCategory */;
    show.contestRank = VarGet(0x8010) /* gSpecialVar_ContestRank */;
    show.species = (GetMonData(gPlayerParty[gContestMonPartyIndex], MON_DATA_SPECIES) as number);
    show.pokemonNickname = GetMonData(gPlayerParty[gContestMonPartyIndex], MON_DATA_NICKNAME) as string;
    // 1:1 StripExtCtrlCodes(show.pokemonNickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
    show.pokemonNameLanguage = GetMonData(gPlayerParty[gContestMonPartyIndex], MON_DATA_LANGUAGE);
  }
}

/** 1:1 `static void InterviewAfter_BravoTrainerBattleTowerProfile(void)` (tv.c:1479-1501). */
function InterviewAfter_BravoTrainerBattleTowerProfile(): void {
  let show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.kind = TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE;
  show.active = true;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  show.opponentName = tvStr(gSaveBlock2Ptr.frontier.towerInterview.opponentName);
  show.species = gSaveBlock2Ptr.frontier.towerInterview.playerSpecies;
  show.defeatedSpecies = gSaveBlock2Ptr.frontier.towerInterview.opponentSpecies;
  show.numFights = GetCurrentBattleTowerWinStreak(gSaveBlock2Ptr.frontier.towerLvlMode, 0);
  show.wonTheChallenge = gSaveBlock2Ptr.frontier.towerBattleOutcome;
  if (gSaveBlock2Ptr.frontier.towerLvlMode == FRONTIER_LVL_50)
    show.btLevel = FRONTIER_MAX_LEVEL_50;
  else
    show.btLevel = FRONTIER_MAX_LEVEL_OPEN;
  show.interviewResponse = VarGet(0x8004) /* gSpecialVar_0x8004 */;
  StorePlayerIdInNormalShow(show);
  show.playerLanguage = gGameLanguage;
  if (show.playerLanguage == LANGUAGE_JAPANESE || gSaveBlock2Ptr.frontier.towerInterview.opponentLanguage == LANGUAGE_JAPANESE)
    show.opponentLanguage = LANGUAGE_JAPANESE;
  else
    show.opponentLanguage = gSaveBlock2Ptr.frontier.towerInterview.opponentLanguage;
}

/** 1:1 `void TryPutSmartShopperOnAir(void)` (tv.c:1503-1534). */
export function TryPutSmartShopperOnAir(): void {
  let show: any = null;
  let i = 0;
  if (!(gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_TRAINER_HILL_ENTRANCE) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_TRAINER_HILL_ENTRANCE)) && !(gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_BATTLE_FRONTIER_MART) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_BATTLE_FRONTIER_MART)) && !rbernoulli(1, 3))
  {
    sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
    if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_SMART_SHOPPER, false) != true)
    {
      SortPurchasesByQuantity();
      if (gMartPurchaseHistory[0].quantity >= 20)
      {
        show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        show.kind = TVSHOW_SMART_SHOPPER;
        show.active = false;
        // NOTE: Show is not active until passed via Record Mix.
        show.shopLocation = gMapHeader!.regionMapSectionId;
        for (i = 0; i < SMARTSHOPPER_NUM_ITEMS; i++)
        {
          show.itemIds[i] = gMartPurchaseHistory[i].itemId;
          show.itemAmounts[i] = gMartPurchaseHistory[i].quantity;
        }
        show.priceReduced = IsPokeNewsActive(POKENEWS_SLATEPORT);
        show.playerName = tvStr(gSaveBlock2Ptr.playerName);
        StorePlayerIdInRecordMixShow(show);
        show.language = gGameLanguage;
      }
    }
  }
}

/** 1:1 `void PutNameRaterShowOnTheAir(void)` (tv.c:1536-1561). */
export function PutNameRaterShowOnTheAir(): void {
  let show: any = null;
  InterviewBefore_NameRater();
  if (VarGet(0x800D) /* gSpecialVar_Result */ != 1)
  {
    StringCopy(gStringVar1, encodeOwText(GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_NICKNAME) as string));
    if (StringLength(gSaveBlock2Ptr.playerName) > 1 && StringLength(gStringVar1) > 1)
    {
      show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
      show.kind = TVSHOW_NAME_RATER_SHOW;
      show.active = true;
      show.species = (GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_SPECIES) as number);
      show.random = Random() % 3;
      show.random2 = Random() % 2;
      show.randomSpecies = GetRandomDifferentSpeciesSeenByPlayer(show.species);
      show.trainerName = tvStr(gSaveBlock2Ptr.playerName);
      show.pokemonName = GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_NICKNAME) as string;
      // 1:1 StripExtCtrlCodes(show.pokemonName) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
      StorePlayerIdInNormalShow(show);
      show.language = gGameLanguage;
      show.pokemonNameLanguage = GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_LANGUAGE);
    }
  }
}

/** 1:1 `void StartMassOutbreak(void)` (tv.c:1563-1579). */
export function StartMassOutbreak(): void {
  let show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  gSaveBlock1Ptr.outbreakPokemonSpecies = show.species;
  gSaveBlock1Ptr.outbreakLocationMapNum = show.locationMapNum;
  gSaveBlock1Ptr.outbreakLocationMapGroup = show.locationMapGroup;
  gSaveBlock1Ptr.outbreakPokemonLevel = show.level;
  gSaveBlock1Ptr.outbreakUnused1 = show.unused1;
  gSaveBlock1Ptr.outbreakUnused2 = show.unused2;
  gSaveBlock1Ptr.outbreakPokemonMoves[0] = show.moves[0];
  gSaveBlock1Ptr.outbreakPokemonMoves[1] = show.moves[1];
  gSaveBlock1Ptr.outbreakPokemonMoves[2] = show.moves[2];
  gSaveBlock1Ptr.outbreakPokemonMoves[3] = show.moves[3];
  gSaveBlock1Ptr.outbreakUnused3 = show.unused3;
  gSaveBlock1Ptr.outbreakPokemonProbability = show.probability;
  gSaveBlock1Ptr.outbreakDaysLeft = 2;
}

/** 1:1 `void PutLilycoveContestLadyShowOnTheAir(void)` (tv.c:1581-1598). */
export function PutLilycoveContestLadyShowOnTheAir(): void {
  let show: any = null;
  Script_FindFirstEmptyNormalTVShowSlot();
  if (VarGet(0x800D) /* gSpecialVar_Result */ != 1)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot];
    // 1:1 : les Buffer* du foyer lilycove_lady.ts sont OUT-params C (u8*) —
    // boxes/buffers temporaires + recopie dans le show (champs save string/number).
    const langBox = { v: 0 };
    BufferContestLadyLanguage(langBox);
    show.language = langBox.v;
    show.pokemonNameLanguage = GAME_LANGUAGE;
    show.kind = TVSHOW_LILYCOVE_CONTEST_LADY;
    show.active = true;
    const nameBuf = new Uint8Array(16);
    BufferContestLadyPlayerName(nameBuf);
    show.playerName = tvStr(nameBuf);
    const catBox = { v: 0 };
    const nickBuf = new Uint8Array(16);
    BufferContestLadyMonName(catBox, nickBuf);
    show.contestCategory = catBox.v;
    show.nickname = tvStr(nickBuf);
    show.pokeblockState = GetContestLadyPokeblockState();
    StorePlayerIdInNormalShow(show);
  }
}

/** 1:1 `static void InterviewAfter_FanClubLetter(void)` (tv.c:1600-1609). */
function InterviewAfter_FanClubLetter(): void {
  let show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.kind = TVSHOW_FAN_CLUB_LETTER;
  show.active = true;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  show.species = (GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES) as number);
  StorePlayerIdInNormalShow(show);
  show.language = gGameLanguage;
}

/** 1:1 `static void InterviewAfter_RecentHappenings(void)` (tv.c:1611-1620). */
function InterviewAfter_RecentHappenings(): void {
  let show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.kind = TVSHOW_RECENT_HAPPENINGS;
  show.active = true;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  show.species = SPECIES_NONE;
  StorePlayerIdInNormalShow(show);
  show.language = gGameLanguage;
}

/** 1:1 `static void InterviewAfter_PkmnFanClubOpinions(void)` (tv.c:1622-1639). */
function InterviewAfter_PkmnFanClubOpinions(): void {
  let show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  show.kind = TVSHOW_PKMN_FAN_CLUB_OPINIONS;
  show.active = true;
  show.friendshipHighNybble = (GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_FRIENDSHIP) as number) >> 4;
  show.questionAsked = VarGet(0x8007) /* gSpecialVar_0x8007 */;
  show.playerName = tvStr(gSaveBlock2Ptr.playerName);
  show.nickname = GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_NICKNAME) as string;
  // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
  show.species = (GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES) as number);
  StorePlayerIdInNormalShow(show);
  show.language = gGameLanguage;
  if ((gGameLanguage as number) == LANGUAGE_JAPANESE || GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_LANGUAGE) == LANGUAGE_JAPANESE)
    show.pokemonNameLanguage = LANGUAGE_JAPANESE;
  else
    show.pokemonNameLanguage = GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_LANGUAGE);
}

/** 1:1 `static void InterviewAfter_Dummy(void)` (tv.c:1641-1644). */
function InterviewAfter_Dummy(): void {
  let show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
}

/** 1:1 `static void TryStartRandomMassOutbreak(void)` (tv.c:1646-1688). */
function TryStartRandomMassOutbreak(): void {
  let i = 0;
  let outbreakIdx = 0;
  let show: any = null;
  if (FlagGet(FLAG_SYS_GAME_CLEAR))
  {
    for (i = 0; i < LAST_TVSHOW_IDX; i++)
    {
      if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_MASS_OUTBREAK)
        return;
    }
    if (!rbernoulli(1, 200))
    {
      sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
      if (sCurTVShowSlot != -1)
      {
        outbreakIdx = Random() % sPokeOutbreakSpeciesList.length;
        show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        show.kind = TVSHOW_MASS_OUTBREAK;
        show.active = true;
        show.level = sPokeOutbreakSpeciesList[outbreakIdx].level;
        show.unused1 = 0;
        show.unused3 = 0;
        show.species = sPokeOutbreakSpeciesList[outbreakIdx].species;
        show.unused2 = 0;
        show.moves[0] = sPokeOutbreakSpeciesList[outbreakIdx].moves[0];
        show.moves[1] = sPokeOutbreakSpeciesList[outbreakIdx].moves[1];
        show.moves[2] = sPokeOutbreakSpeciesList[outbreakIdx].moves[2];
        show.moves[3] = sPokeOutbreakSpeciesList[outbreakIdx].moves[3];
        show.locationMapNum = sPokeOutbreakSpeciesList[outbreakIdx].location;
        show.locationMapGroup = 0;
        show.unused4 = 0;
        show.probability = 50;
        show.unused5 = 0;
        show.daysLeft = 1;
        StorePlayerIdInNormalShow(show);
        show.language = gGameLanguage;
      }
    }
  }
}

/** 1:1 `void EndMassOutbreak(void)` (tv.c:1690-1705). */
export function EndMassOutbreak(): void {
  gSaveBlock1Ptr.outbreakPokemonSpecies = SPECIES_NONE;
  gSaveBlock1Ptr.outbreakLocationMapNum = 0;
  gSaveBlock1Ptr.outbreakLocationMapGroup = 0;
  gSaveBlock1Ptr.outbreakPokemonLevel = 0;
  gSaveBlock1Ptr.outbreakUnused1 = 0;
  gSaveBlock1Ptr.outbreakUnused2 = 0;
  gSaveBlock1Ptr.outbreakPokemonMoves[0] = MOVE_NONE;
  gSaveBlock1Ptr.outbreakPokemonMoves[1] = MOVE_NONE;
  gSaveBlock1Ptr.outbreakPokemonMoves[2] = MOVE_NONE;
  gSaveBlock1Ptr.outbreakPokemonMoves[3] = MOVE_NONE;
  gSaveBlock1Ptr.outbreakUnused3 = 0;
  gSaveBlock1Ptr.outbreakPokemonProbability = 0;
  gSaveBlock1Ptr.outbreakDaysLeft = 0;
}

/** 1:1 `void UpdateTVShowsPerDay(u16 days)` (tv.c:1707-1714). */
export function UpdateTVShowsPerDay(days: number): void {
  UpdateMassOutbreakTimeLeft(days);
  TryEndMassOutbreak(days);
  UpdatePokeNewsCountdown(days);
  ResolveWorldOfMastersShow(days);
  ResolveNumberOneShow(days);
}

/** 1:1 `static void UpdateMassOutbreakTimeLeft(u16 days)` (tv.c:1716-1737). */
function UpdateMassOutbreakTimeLeft(days: number): void {
  let i = 0;
  let show: any = null;
  if (gSaveBlock1Ptr.outbreakPokemonSpecies == SPECIES_NONE)
  {
    for (i = 0; i < LAST_TVSHOW_IDX; i++)
    {
      if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_MASS_OUTBREAK && gSaveBlock1Ptr.tvShows[i].active == 1)
      {
        show = gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        if (show.daysLeft < days)
          show.daysLeft = 0;
        else
          show.daysLeft -= days;
        break;
      }
    }
  }
}

/** 1:1 `static void TryEndMassOutbreak(u16 days)` (tv.c:1739-1745). */
function TryEndMassOutbreak(days: number): void {
  if (gSaveBlock1Ptr.outbreakDaysLeft <= days)
    EndMassOutbreak();
  else
    gSaveBlock1Ptr.outbreakDaysLeft -= days;
}

/** 1:1 `void RecordFishingAttemptForTV(bool8 caughtFish)` (tv.c:1747-1767). */
export function RecordFishingAttemptForTV(caughtFish: boolean): void {
  if (caughtFish)
  {
    if (sPokemonAnglerAttemptCounters >> 8 > 4)
      TryPutFishingAdviceOnAir();
    sPokemonAnglerAttemptCounters &= 0xFF;
    if (sPokemonAnglerAttemptCounters != 0xFF)
      sPokemonAnglerAttemptCounters += 0x01;
  }
  else
  {
    if ((sPokemonAnglerAttemptCounters & 0xFF) > 4)
      TryPutFishingAdviceOnAir();
    sPokemonAnglerAttemptCounters &= 0xFF00;
    if (sPokemonAnglerAttemptCounters >> 8 != 0xFF)
      sPokemonAnglerAttemptCounters += 0x0100;
  }
}

/** 1:1 `static void TryPutFishingAdviceOnAir(void)` (tv.c:1769-1786). */
function TryPutFishingAdviceOnAir(): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_FISHING_ADVICE, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_FISHING_ADVICE;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.nBites = sPokemonAnglerAttemptCounters;
    show.nFails = sPokemonAnglerAttemptCounters >> 8;
    show.species = sPokemonAnglerSpecies;
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void SetPokemonAnglerSpecies(u16 species)` (tv.c:1788-1791). */
export function SetPokemonAnglerSpecies(species: number): void {
  sPokemonAnglerSpecies = species;
}

// World of Masters is initialized in the last slot by InitWorldOfMastersShowAttempt

// If enough Pokémon were caught during the day the show can be put on air (and will

// be moved out of the last slot).

// Either way the temporary version of the show in the last slot is deleted.

/** 1:1 `static void ResolveWorldOfMastersShow(u16 days)` (tv.c:1797-1807). */
function ResolveWorldOfMastersShow(days: number): void {
  let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (show.kind == TVSHOW_WORLD_OF_MASTERS)
  {
    if (show.numPokeCaught >= 20)
      TryPutWorldOfMastersOnAir();
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
  }
}

/** 1:1 `static void TryPutWorldOfMastersOnAir(void)` (tv.c:1809-1834). */
function TryPutWorldOfMastersOnAir(): void {
  let show: any = null;
  let show2: any = null;
  show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  if (!rbernoulli(1, 1))
  {
    sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
    if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_WORLD_OF_MASTERS, false) != true)
    {
      show2 = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
      show2.kind = TVSHOW_WORLD_OF_MASTERS;
      show2.active = false;
      // NOTE: Show is not active until passed via Record Mix.
      show2.numPokeCaught = show.numPokeCaught;
      show2.steps = GetGameStat(GAME_STAT_STEPS) - show.steps;
      show2.caughtPoke = show.caughtPoke;
      show2.species = show.species;
      show2.location = show.location;
      show2.playerName = tvStr(gSaveBlock2Ptr.playerName);
      StorePlayerIdInRecordMixShow(show2);
      show2.language = gGameLanguage;
      DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, LAST_TVSHOW_IDX);
    }
  }
}

/** 1:1 `void TryPutTodaysRivalTrainerOnAir(void)` (tv.c:1836-1876). */
export function TryPutTodaysRivalTrainerOnAir(): void {
  let show: any = null;
  let i = 0;
  let nBadges = 0;
  IsRecordMixShowAlreadySpawned(TVSHOW_TODAYS_RIVAL_TRAINER, true);
  // Delete old version of show
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_TODAYS_RIVAL_TRAINER;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    for ((i = FLAG_BADGE01_GET, nBadges = 0); i < FLAG_BADGE01_GET + NUM_BADGES; i++)
    {
      if (FlagGet(i))
        nBadges++;
    }
    show.badgeCount = nBadges;
    if (IsNationalPokedexEnabled())
      show.dexCount = GetNationalPokedexCount(FLAG_GET_CAUGHT);
    else
      show.dexCount = GetHoennPokedexCount(FLAG_GET_CAUGHT);
    show.location = gMapHeader!.regionMapSectionId;
    show.mapLayoutId = gMapHeader!.mapLayoutId;
    show.nSilverSymbols = 0;
    show.nGoldSymbols = 0;
    for (i = 0; i < NUM_FRONTIER_FACILITIES; i++)
    {
      if (FlagGet(sSilverSymbolFlags[i]))
        show.nSilverSymbols++;
      if (FlagGet(sGoldSymbolFlags[i]))
        show.nGoldSymbols++;
    }
    show.battlePoints = gSaveBlock2Ptr.frontier.battlePoints;
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutTrendWatcherOnAir(const u16 *words)` (tv.c:1878-1895). */
export function TryPutTrendWatcherOnAir(words: Uint16Array): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_TREND_WATCHER, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_TREND_WATCHER;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.gender = gSaveBlock2Ptr.playerGender;
    show.words[0] = words[0];
    show.words[1] = words[1];
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutTreasureInvestigatorsOnAir(void)` (tv.c:1897-1914). */
export function TryPutTreasureInvestigatorsOnAir(): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_TREASURE_INVESTIGATORS, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_TREASURE_INVESTIGATORS;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.item = VarGet(0x8005) /* gSpecialVar_0x8005 */;
    show.location = gMapHeader!.regionMapSectionId;
    show.mapLayoutId = gMapHeader!.mapLayoutId;
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutFindThatGamerOnAir(u16 nCoinsPaidOut)` (tv.c:1916-1967). */
export function TryPutFindThatGamerOnAir(nCoinsPaidOut: number): void {
  let show: any = null;
  let flag = false;
  let nCoinsWon = 0;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_FIND_THAT_GAMER, false) != true)
  {
    flag = false;
    switch (sFindThatGamerWhichGame) {
      case SLOT_MACHINE:
        if (nCoinsPaidOut >= sFindThatGamerCoinsSpent + 200)
        {
          flag = true;
          nCoinsWon = nCoinsPaidOut - sFindThatGamerCoinsSpent;
          break;
        }
        if (sFindThatGamerCoinsSpent >= 100 && nCoinsPaidOut <= sFindThatGamerCoinsSpent - 100)
        {
          nCoinsWon = sFindThatGamerCoinsSpent - nCoinsPaidOut;
          break;
        }
        return;
      case ROULETTE:
        if (nCoinsPaidOut >= sFindThatGamerCoinsSpent + 50)
        {
          flag = true;
          nCoinsWon = nCoinsPaidOut - sFindThatGamerCoinsSpent;
          break;
        }
        if (sFindThatGamerCoinsSpent >= 50 && nCoinsPaidOut <= sFindThatGamerCoinsSpent - 50)
        {
          nCoinsWon = sFindThatGamerCoinsSpent - nCoinsPaidOut;
          break;
        }
        return;
      default:
        return;
    }
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_FIND_THAT_GAMER;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.nCoins = nCoinsWon;
    show.whichGame = sFindThatGamerWhichGame;
    show.won = flag;
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void AlertTVThatPlayerPlayedSlotMachine(u16 nCoinsSpent)` (tv.c:1969-1973). */
export function AlertTVThatPlayerPlayedSlotMachine(nCoinsSpent: number): void {
  sFindThatGamerWhichGame = SLOT_MACHINE;
  sFindThatGamerCoinsSpent = nCoinsSpent;
}

/** 1:1 `void AlertTVThatPlayerPlayedRoulette(u16 nCoinsSpent)` (tv.c:1975-1979). */
export function AlertTVThatPlayerPlayedRoulette(nCoinsSpent: number): void {
  sFindThatGamerWhichGame = ROULETTE;
  sFindThatGamerCoinsSpent = nCoinsSpent;
}

/** 1:1 `static void SecretBaseVisit_CalculateDecorationData(TVShow *show)` (tv.c:1981-2042). */
function SecretBaseVisit_CalculateDecorationData(show: TVShow): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let n = 0;
  let decoration = 0;
  for (i = 0; i < DECOR_MAX_SECRET_BASE; i++)
    sTV_DecorationsBuffer[i] = DECOR_NONE;
  // Count (and save) the unique decorations in the base
  for ((i = 0, n = 0); i < DECOR_MAX_SECRET_BASE; i++)
  {
    decoration = gSaveBlock1Ptr.secretBases[0].decorations[i];
    if (decoration != DECOR_NONE)
    {
      // Search for an empty spot to save decoration
      for (j = 0; j < DECOR_MAX_SECRET_BASE; j++)
      {
        if (sTV_DecorationsBuffer[j] == DECOR_NONE)
        {
          // Save and count new unique decoration
          sTV_DecorationsBuffer[j] = decoration;
          n++;
          break;
        }
        // Decoration has already been saved, skip and move on to the next base decoration
        if (sTV_DecorationsBuffer[j] == decoration)
          break;
      }
    }
  }
  // Cap the number of unique decorations to the number the TV show will talk about
  if (n > show.decorations.length)
    show.numDecorations = show.decorations.length;
  else
    show.numDecorations = n;
  switch (show.numDecorations) {
    case 0:
      break;
    case 1:
      show.decorations[0] = sTV_DecorationsBuffer[0];
      break;
    default:
      // More than 1 decoration, randomize the full list
      for (k = 0; k < n * n; k++)
      {
        decoration = Random() % n;
        j = Random() % n;
        [sTV_DecorationsBuffer[decoration], sTV_DecorationsBuffer[j]] = [sTV_DecorationsBuffer[j], sTV_DecorationsBuffer[decoration]]; // 1:1 SWAP(a,b,temp)
      }
      // Pick the first decorations in the randomized list to talk about on the show
      for (i = 0; i < show.numDecorations; i++)
        show.decorations[i] = sTV_DecorationsBuffer[i];
      break;
  }
}

/** 1:1 `static void SecretBaseVisit_CalculatePartyData(TVShow *show)` (tv.c:2044-2100). */
function SecretBaseVisit_CalculatePartyData(show: TVShow): void {
  let i = 0;
  let move = 0;
  let j = 0;
  let numMoves = 0;
  let numPokemon = 0;
  let sum = 0;
  for ((i = 0, numPokemon = 0); i < PARTY_SIZE; i++)
  {
    if (GetMonData(gPlayerParty[i], MON_DATA_SPECIES) != SPECIES_NONE && !GetMonData(gPlayerParty[i], MON_DATA_IS_EGG))
    {
      sTV_SecretBaseVisitMonsTemp[numPokemon].level = (GetMonData(gPlayerParty[i], MON_DATA_LEVEL) as number);
      sTV_SecretBaseVisitMonsTemp[numPokemon].species = (GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number);
      // Check all the Pokémon's moves, then randomly select one to save
      numMoves = 0;
      move = GetMonData(gPlayerParty[i], MON_DATA_MOVE1) as number;
      if (move != MOVE_NONE)
      {
        sTV_SecretBaseVisitMovesTemp[numMoves] = move;
        numMoves++;
      }
      move = GetMonData(gPlayerParty[i], MON_DATA_MOVE2) as number;
      if (move != MOVE_NONE)
      {
        sTV_SecretBaseVisitMovesTemp[numMoves] = move;
        numMoves++;
      }
      move = GetMonData(gPlayerParty[i], MON_DATA_MOVE3) as number;
      if (move != MOVE_NONE)
      {
        sTV_SecretBaseVisitMovesTemp[numMoves] = move;
        numMoves++;
      }
      move = GetMonData(gPlayerParty[i], MON_DATA_MOVE4) as number;
      if (move != MOVE_NONE)
      {
        sTV_SecretBaseVisitMovesTemp[numMoves] = move;
        numMoves++;
      }
      sTV_SecretBaseVisitMonsTemp[numPokemon].move = sTV_SecretBaseVisitMovesTemp[Random() % numMoves];
      numPokemon++;
    }
  }
  for ((i = 0, sum = 0); i < numPokemon; i++)
    sum += sTV_SecretBaseVisitMonsTemp[i].level;
  // Using the data calculated above, save the data to talk about on the show
  // (average level, and one randomly selected species / move)
  show.avgLevel = Math.trunc(sum / numPokemon);
  j = Random() % numPokemon;
  show.species = sTV_SecretBaseVisitMonsTemp[j].species;
  show.move = sTV_SecretBaseVisitMonsTemp[j].move;
}

/** 1:1 `void TryPutSecretBaseVisitOnAir(void)` (tv.c:2102-2119). */
export function TryPutSecretBaseVisitOnAir(): void {
  let show: any = null;
  IsRecordMixShowAlreadySpawned(TVSHOW_SECRET_BASE_VISIT, true);
  // Delete old version of show
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_SECRET_BASE_VISIT;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    SecretBaseVisit_CalculateDecorationData(show);
    SecretBaseVisit_CalculatePartyData(show);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutBreakingNewsOnAir(void)` (tv.c:2121-2184). */
export function TryPutBreakingNewsOnAir(): void {
  let show: any = null;
  let i = 0;
  let balls = 0;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_BREAKING_NEWS, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_BREAKING_NEWS;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    balls = 0;
    for (i = 0; i < POKEBALL_COUNT - 1; i++)
      balls += gBattleResults.catchAttempts[i];
    if (gBattleResults.usedMasterBall)
      balls++;
    show.location = gMapHeader!.regionMapSectionId;
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.poke1Species = gBattleResults.playerMon1Species;
    switch (gBattleOutcome) {
      case B_OUTCOME_LOST:
      case B_OUTCOME_DREW:
        show.kind = TVSHOW_OFF_AIR;
        return;
      case B_OUTCOME_CAUGHT:
        show.outcome = 0;
        break;
      case B_OUTCOME_WON:
        show.outcome = 1;
        break;
      case B_OUTCOME_RAN:
      case B_OUTCOME_PLAYER_TELEPORTED:
      case B_OUTCOME_NO_SAFARI_BALLS:
        show.outcome = 2;
        break;
      case B_OUTCOME_MON_FLED:
      case B_OUTCOME_MON_TELEPORTED:
        show.outcome = 3;
        break;
    }
    show.lastOpponentSpecies = gBattleResults.lastOpponentSpecies;
    switch (show.outcome) {
      case 0:
        if (gBattleResults.usedMasterBall)
          show.caughtMonBall = ITEM_MASTER_BALL;
        else
          show.caughtMonBall = gBattleResults.caughtMonBall;
        show.balls = balls;
        break;
      case 1:
        show.lastUsedMove = gBattleResults.lastUsedMovePlayer;
        break;
      case 2:
      case 3:
        break;
    }
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutLotteryWinnerReportOnAir(void)` (tv.c:2186-2202). */
export function TryPutLotteryWinnerReportOnAir(): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_LOTTO_WINNER, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_LOTTO_WINNER;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.whichPrize = 4 - VarGet(0x8004) /* gSpecialVar_0x8004 */;
    show.item = VarGet(0x8005) /* gSpecialVar_0x8005 */;
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutBattleSeminarOnAir(u16 foeSpecies, u16 species, u8 moveIndex, const u16 *movePtr, u16 betterMove)` (tv.c:2204-2233). */
export function TryPutBattleSeminarOnAir(foeSpecies: number, species: number, moveIndex: number, movePtr: Uint16Array | number[], betterMove: number): void {
  let show: any = null;
  let i = 0;
  let j = 0;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_BATTLE_SEMINAR, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_BATTLE_SEMINAR;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.foeSpecies = foeSpecies;
    show.species = species;
    show.move = movePtr[moveIndex];
    for ((i = 0, j = 0); i < MAX_MON_MOVES; i++)
    {
      if (i != moveIndex && movePtr[i])
      {
        show.otherMoves[j] = movePtr[i];
        j++;
      }
    }
    show.nOtherMoves = j;
    show.betterMove = betterMove;
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutSafariFanClubOnAir(u8 monsCaught, u8 pokeblocksUsed)` (tv.c:2235-2251). */
export function TryPutSafariFanClubOnAir(monsCaught: number, pokeblocksUsed: number): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_SAFARI_FAN_CLUB, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_SAFARI_FAN_CLUB;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.monsCaught = monsCaught;
    show.pokeblocksUsed = pokeblocksUsed;
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutSpotTheCutiesOnAir(struct Pokemon *pokemon, u8 ribbonMonDataIdx)` (tv.c:2253-2275). */
export function TryPutSpotTheCutiesOnAir(pokemon: Pokemon, ribbonMonDataIdx: number): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_CUTIES, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_CUTIES;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.nickname = GetMonData(pokemon, MON_DATA_NICKNAME) as string;
    // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decodeOwBytes).
    show.nRibbons = GetRibbonCount(pokemon);
    show.selectedRibbon = MonDataIdxToRibbon(ribbonMonDataIdx);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
    if (show.language == LANGUAGE_JAPANESE || GetMonData(pokemon, MON_DATA_LANGUAGE) == LANGUAGE_JAPANESE)
      show.pokemonNameLanguage = LANGUAGE_JAPANESE;
    else
      show.pokemonNameLanguage = GetMonData(pokemon, MON_DATA_LANGUAGE);
  }
}

/** 1:1 `u8 GetRibbonCount(struct Pokemon *pokemon)` (tv.c:2277-2300). */
export function GetRibbonCount(pokemon: Pokemon): number {
  let nRibbons = 0;
  nRibbons = 0;
  nRibbons += GetMonData(pokemon, MON_DATA_COOL_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_BEAUTY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_CUTE_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_SMART_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_TOUGH_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_CHAMPION_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_WINNING_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_VICTORY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_ARTIST_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_EFFORT_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_MARINE_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_LAND_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_SKY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_COUNTRY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_NATIONAL_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_EARTH_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_WORLD_RIBBON) as number;
  return nRibbons;
}

/** 1:1 `static u8 MonDataIdxToRibbon(u8 monDataIdx)` (tv.c:2302-2322). */
function MonDataIdxToRibbon(monDataIdx: number): number {
  if (monDataIdx == MON_DATA_CHAMPION_RIBBON)
    return CHAMPION_RIBBON;
  if (monDataIdx == MON_DATA_COOL_RIBBON)
    return COOL_RIBBON_NORMAL;
  if (monDataIdx == MON_DATA_BEAUTY_RIBBON)
    return BEAUTY_RIBBON_NORMAL;
  if (monDataIdx == MON_DATA_CUTE_RIBBON)
    return CUTE_RIBBON_NORMAL;
  if (monDataIdx == MON_DATA_SMART_RIBBON)
    return SMART_RIBBON_NORMAL;
  if (monDataIdx == MON_DATA_TOUGH_RIBBON)
    return TOUGH_RIBBON_NORMAL;
  if (monDataIdx == MON_DATA_WINNING_RIBBON)
    return WINNING_RIBBON;
  if (monDataIdx == MON_DATA_VICTORY_RIBBON)
    return VICTORY_RIBBON;
  if (monDataIdx == MON_DATA_ARTIST_RIBBON)
    return ARTIST_RIBBON;
  if (monDataIdx == MON_DATA_EFFORT_RIBBON)
    return EFFORT_RIBBON;
  if (monDataIdx == MON_DATA_MARINE_RIBBON)
    return MARINE_RIBBON;
  if (monDataIdx == MON_DATA_LAND_RIBBON)
    return LAND_RIBBON;
  if (monDataIdx == MON_DATA_SKY_RIBBON)
    return SKY_RIBBON;
  if (monDataIdx == MON_DATA_COUNTRY_RIBBON)
    return COUNTRY_RIBBON;
  if (monDataIdx == MON_DATA_NATIONAL_RIBBON)
    return NATIONAL_RIBBON;
  if (monDataIdx == MON_DATA_EARTH_RIBBON)
    return EARTH_RIBBON;
  if (monDataIdx == MON_DATA_WORLD_RIBBON)
    return WORLD_RIBBON;
  return CHAMPION_RIBBON;
}

/** 1:1 `void TryPutTrainerFanClubOnAir(void)` (tv.c:2324-2340). */
export function TryPutTrainerFanClubOnAir(): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1 && IsRecordMixShowAlreadySpawned(TVSHOW_TRAINER_FAN_CLUB, false) != true)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_TRAINER_FAN_CLUB;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.words[0] = gSaveBlock1Ptr.easyChatProfile[0];
    show.words[1] = gSaveBlock1Ptr.easyChatProfile[1];
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `bool8 ShouldHideFanClubInterviewer(void)` (tv.c:2342-2356). */
export function ShouldHideFanClubInterviewer(): boolean {
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot == -1)
    return true;
  TryReplaceOldTVShowOfKind(TVSHOW_FAN_CLUB_SPECIAL);
  if (VarGet(0x800D) /* gSpecialVar_Result */ == 1)
    return true;
  if (gSaveBlock1Ptr.linkBattleRecords.entries[0].name[0] == EOS)
    return true;
  return false;
}

/** 1:1 `bool8 ShouldAirFrontierTVShow(void)` (tv.c:2358-2383). */
export function ShouldAirFrontierTVShow(): boolean {
  let playerId = 0;
  let showIdx = 0;
  let shows: any = null;
  if (IsRecordMixShowAlreadySpawned(TVSHOW_FRONTIER, false) == true)
  {
    shows = gSaveBlock1Ptr.tvShows;
    playerId = GetPlayerIDAsU32();
    for (showIdx = NUM_NORMAL_TVSHOW_SLOTS; showIdx < LAST_TVSHOW_IDX; showIdx++)
    {
      if (shows[showIdx].kind == TVSHOW_FRONTIER && (playerId & 0xFF) == shows[showIdx].trainerIdLo && ((playerId >>> 8) & 0xFF) == shows[showIdx].trainerIdHi)
      {
        DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, showIdx);
        CompactTVShowArray(gSaveBlock1Ptr.tvShows);
        return true;
      }
    }
  }
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot == -1)
    return false;
  return true;
}

/** 1:1 `void TryPutFrontierTVShowOnAir(u16 winStreak, u8 facilityAndMode)` (tv.c:2385-2432). */
export function TryPutFrontierTVShowOnAir(winStreak: number, facilityAndMode: number): void {
  let show: any = null;
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_FRONTIER;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.winStreak = winStreak;
    show.facilityAndMode = facilityAndMode;
    switch (facilityAndMode) {
      case FRONTIER_SHOW_TOWER_SINGLES:
      case FRONTIER_SHOW_DOME_SINGLES:
      case FRONTIER_SHOW_DOME_DOUBLES:
      case FRONTIER_SHOW_FACTORY_SINGLES:
      case FRONTIER_SHOW_FACTORY_DOUBLES:
      case FRONTIER_SHOW_PIKE:
      case FRONTIER_SHOW_ARENA:
      case FRONTIER_SHOW_PALACE_SINGLES:
      case FRONTIER_SHOW_PALACE_DOUBLES:
      case FRONTIER_SHOW_PYRAMID:
        show.species1 = GetMonData(gPlayerParty[0], MON_DATA_SPECIES);
        show.species2 = GetMonData(gPlayerParty[1], MON_DATA_SPECIES);
        show.species3 = GetMonData(gPlayerParty[2], MON_DATA_SPECIES);
        break;
      case FRONTIER_SHOW_TOWER_DOUBLES:
        show.species1 = GetMonData(gPlayerParty[0], MON_DATA_SPECIES);
        show.species2 = GetMonData(gPlayerParty[1], MON_DATA_SPECIES);
        show.species3 = GetMonData(gPlayerParty[2], MON_DATA_SPECIES);
        show.species4 = GetMonData(gPlayerParty[3], MON_DATA_SPECIES);
        break;
      case FRONTIER_SHOW_TOWER_MULTIS:
        show.species1 = GetMonData(gPlayerParty[0], MON_DATA_SPECIES);
        show.species2 = GetMonData(gPlayerParty[1], MON_DATA_SPECIES);
        break;
      case FRONTIER_SHOW_TOWER_LINK_MULTIS:
        show.species1 = GetMonData(gSaveBlock1Ptr.playerParty[gSaveBlock2Ptr.frontier.selectedPartyMons[0] - 1] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, MON_DATA_SPECIES);
        show.species2 = GetMonData(gSaveBlock1Ptr.playerParty[gSaveBlock2Ptr.frontier.selectedPartyMons[1] - 1] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, MON_DATA_SPECIES);
        break;
    }
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void TryPutSecretBaseSecretsOnAir(void)` (tv.c:2434-2463). */
export function TryPutSecretBaseSecretsOnAir(): void {
  let show: any = null;
  const strbuf = new Uint8Array(32);
  if (IsRecordMixShowAlreadySpawned(TVSHOW_SECRET_BASE_SECRETS, false) != true)
  {
    sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
    if (sCurTVShowSlot != -1)
    {
      show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
      show.kind = TVSHOW_SECRET_BASE_SECRETS;
      show.active = false;
      // NOTE: Show is not active until passed via Record Mix.
      show.playerName = tvStr(gSaveBlock2Ptr.playerName);
      show.stepsInBase = VarGet(VAR_SECRET_BASE_STEP_COUNTER);
      CopyCurSecretBaseOwnerName_StrVar1();
      StringCopy(strbuf, gStringVar1);
      StripExtCtrlCodes(strbuf);
      show.baseOwnersName = tvStr(strbuf);
      show.item = VarGet(VAR_SECRET_BASE_LAST_ITEM_USED);
      show.flags = VarGet(VAR_SECRET_BASE_LOW_TV_FLAGS) + (VarGet(VAR_SECRET_BASE_HIGH_TV_FLAGS) << 16);
      StorePlayerIdInRecordMixShow(show);
      show.language = gGameLanguage;
      if (show.language == LANGUAGE_JAPANESE || gSaveBlock1Ptr.secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].language == LANGUAGE_JAPANESE)
        show.baseOwnersNameLanguage = LANGUAGE_JAPANESE;
      else
        show.baseOwnersNameLanguage = gSaveBlock1Ptr.secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].language;
    }
  }
}

// Check var thresholds required to trigger the Number One show

// The vars are reset afterwards regardless

/** 1:1 `static void ResolveNumberOneShow(u16 days)` (tv.c:2467-2482). */
function ResolveNumberOneShow(days: number): void {
  let i = 0;
  for (i = 0; i < sNumberOneVarsAndThresholds.length; i++)
  {
    if (VarGet(sNumberOneVarsAndThresholds[i][0]) >= sNumberOneVarsAndThresholds[i][1])
    {
      TryPutNumberOneOnAir(i);
      break;
    }
  }
  for (i = 0; i < sNumberOneVarsAndThresholds.length; i++)
    VarSet(sNumberOneVarsAndThresholds[i][0], 0);
}

/** 1:1 `static void TryPutNumberOneOnAir(u8 actionIdx)` (tv.c:2484-2501). */
function TryPutNumberOneOnAir(actionIdx: number): void {
  let show: any = null;
  IsRecordMixShowAlreadySpawned(TVSHOW_NUMBER_ONE, true);
  // Delete old version of show
  sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(gSaveBlock1Ptr.tvShows);
  if (sCurTVShowSlot != -1)
  {
    show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    show.kind = TVSHOW_NUMBER_ONE;
    show.active = false;
    // NOTE: Show is not active until passed via Record Mix.
    show.playerName = tvStr(gSaveBlock2Ptr.playerName);
    show.actionIdx = actionIdx;
    show.count = VarGet(sNumberOneVarsAndThresholds[actionIdx][0]);
    StorePlayerIdInRecordMixShow(show);
    show.language = gGameLanguage;
  }
}

/** 1:1 `void IncrementDailySlotsUses(void)` (tv.c:2503-2506). */
export function IncrementDailySlotsUses(): void {
  VarSet(VAR_DAILY_SLOTS, VarGet(VAR_DAILY_SLOTS) + 1);
}

/** 1:1 `void IncrementDailyRouletteUses(void)` (tv.c:2508-2511). */
export function IncrementDailyRouletteUses(): void {
  VarSet(VAR_DAILY_ROULETTE, VarGet(VAR_DAILY_ROULETTE) + 1);
}

/** 1:1 `void IncrementDailyWildBattles(void)` (tv.c:2513-2516). */
export function IncrementDailyWildBattles(): void {
  VarSet(VAR_DAILY_WILDS, VarGet(VAR_DAILY_WILDS) + 1);
}

/** 1:1 `void IncrementDailyBerryBlender(void)` (tv.c:2518-2521). */
export function IncrementDailyBerryBlender(): void {
  VarSet(VAR_DAILY_BLENDER, VarGet(VAR_DAILY_BLENDER) + 1);
}

/** 1:1 `void IncrementDailyPlantedBerries(void)` (tv.c:2523-2526). */
export function IncrementDailyPlantedBerries(): void {
  VarSet(VAR_DAILY_PLANTED_BERRIES, VarGet(VAR_DAILY_PLANTED_BERRIES) + 1);
}

/** 1:1 `void IncrementDailyPickedBerries(void)` (tv.c:2528-2531). */
export function IncrementDailyPickedBerries(): void {
  VarSet(VAR_DAILY_PICKED_BERRIES, VarGet(VAR_DAILY_PICKED_BERRIES) + VarGet(0x8006) /* gSpecialVar_0x8006 */);
}

/** 1:1 `void IncrementDailyBattlePoints(u16 delta)` (tv.c:2533-2536). */
export function IncrementDailyBattlePoints(delta: number): void {
  VarSet(VAR_DAILY_BP, VarGet(VAR_DAILY_BP) + delta);
}

// PokeNews

/** 1:1 `static void TryPutRandomPokeNewsOnAir(void)` (tv.c:2540-2556). */
function TryPutRandomPokeNewsOnAir(): void {
  if (FlagGet(FLAG_SYS_GAME_CLEAR))
  {
    sCurTVShowSlot = GetFirstEmptyPokeNewsSlot(gSaveBlock1Ptr.pokeNews);
    if (sCurTVShowSlot != -1 && rbernoulli(1, 100) != true)
    {
      let newsKind = (Random() % NUM_POKENEWS_TYPES) + 1;
      // +1 to skip over POKENEWS_NONE
      if (IsAddingPokeNewsDisallowed(newsKind) != true)
      {
        gSaveBlock1Ptr.pokeNews[sCurTVShowSlot].kind = newsKind;
        gSaveBlock1Ptr.pokeNews[sCurTVShowSlot].dayCountdown = POKENEWS_COUNTDOWN;
        gSaveBlock1Ptr.pokeNews[sCurTVShowSlot].state = POKENEWS_STATE_UPCOMING;
      }
    }
  }
}

/** 1:1 `static s8 GetFirstEmptyPokeNewsSlot(PokeNews *pokeNews)` (tv.c:2558-2568). */
function GetFirstEmptyPokeNewsSlot(pokeNews: PokeNews[]): number {
  let i = 0;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (pokeNews[i].kind == POKENEWS_NONE)
      return i;
  }
  return -1;
}

/** 1:1 `static void ClearPokeNews(void)` (tv.c:2570-2576). */
function ClearPokeNews(): void {
  let i = 0;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
    ClearPokeNewsBySlot(i);
}

/** 1:1 `static void ClearPokeNewsBySlot(u8 i)` (tv.c:2578-2583). */
function ClearPokeNewsBySlot(i: number): void {
  gSaveBlock1Ptr.pokeNews[i].kind = POKENEWS_NONE;
  gSaveBlock1Ptr.pokeNews[i].state = POKENEWS_STATE_INACTIVE;
  gSaveBlock1Ptr.pokeNews[i].dayCountdown = 0;
}

/** 1:1 `static void CompactPokeNews(void)` (tv.c:2585-2605). */
function CompactPokeNews(): void {
  let i = 0;
  let j = 0;
  for (i = 0; i < POKE_NEWS_COUNT - 1; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind == POKENEWS_NONE)
    {
      for (j = i + 1; j < POKE_NEWS_COUNT; j++)
      {
        if (gSaveBlock1Ptr.pokeNews[j].kind != POKENEWS_NONE)
        {
          gSaveBlock1Ptr.pokeNews[i] = gSaveBlock1Ptr.pokeNews[j];
          ClearPokeNewsBySlot(j);
          break;
        }
      }
    }
  }
}

/** 1:1 `static u8 FindAnyPokeNewsOnTheAir(void)` (tv.c:2607-2619). */
function FindAnyPokeNewsOnTheAir(): number {
  let i = 0;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind != POKENEWS_NONE && gSaveBlock1Ptr.pokeNews[i].state == POKENEWS_STATE_UPCOMING && gSaveBlock1Ptr.pokeNews[i].dayCountdown < POKENEWS_COUNTDOWN - 1)
      return i;
  }
  return 0xFF;
}

/** 1:1 `void DoPokeNews(void)` (tv.c:2621-2652). */
export function DoPokeNews(): void {
  let i = FindAnyPokeNewsOnTheAir();
  if (i == 0xFF)
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  }
  else
  {
    if (gSaveBlock1Ptr.pokeNews[i].dayCountdown == 0)
    {
      // News event is occurring, make comment depending on how much time is left
      gSaveBlock1Ptr.pokeNews[i].state = POKENEWS_STATE_ACTIVE;
      if (gLocalTime.hours < 20)
        ShowFieldMessage(getText(sPokeNewsTextGroup_Ongoing[gSaveBlock1Ptr.pokeNews[i].kind]!)!);
      else
        ShowFieldMessage(getText(sPokeNewsTextGroup_Ending[gSaveBlock1Ptr.pokeNews[i].kind]!)!);
    }
    else
    {
      // News event is upcoming, make comment about countdown to event
      let dayCountdown = gSaveBlock1Ptr.pokeNews[i].dayCountdown;
      ConvertIntToDecimalStringN(gStringVar1, dayCountdown, STR_CONV_MODE_LEFT_ALIGN, 1);
      // Mark as inactive so the countdown TV airing doesn't repeat
      // Will be flagged as "upcoming" again by UpdatePokeNewsCountdown
      gSaveBlock1Ptr.pokeNews[i].state = POKENEWS_STATE_INACTIVE;
      ShowFieldMessage(getText(sPokeNewsTextGroup_Upcoming[gSaveBlock1Ptr.pokeNews[i].kind]!)!);
    }
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  }
}

/** 1:1 `bool8 IsPokeNewsActive(u8 newsKind)` (tv.c:2654-2672). */
export function IsPokeNewsActive(newsKind: number): boolean {
  let i = 0;
  if (newsKind == POKENEWS_NONE)
    return false;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind == newsKind)
    {
      if (gSaveBlock1Ptr.pokeNews[i].state == POKENEWS_STATE_ACTIVE && ShouldApplyPokeNewsEffect(newsKind))
        return true;
      return false;
    }
  }
  return false;
}

// Returns TRUE if the effects of the given PokeNews should be applied.

// For POKENEWS_SLATEPORT / POKENEWS_LILYCOVE, only apply the effect if

// the player is talking to the Energy Guru / at the Dept Store Rooftop.

// For any other type of PokeNews this is always TRUE.

/** 1:1 `static bool8 ShouldApplyPokeNewsEffect(u8 newsKind)` (tv.c:2678-2695). */
function ShouldApplyPokeNewsEffect(newsKind: number): boolean {
  switch (newsKind) {
    case POKENEWS_SLATEPORT:
      if (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_SLATEPORT_CITY) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_SLATEPORT_CITY) && VarGet(0x800F) /* gSpecialVar_LastTalked */ == LOCALID_SLATEPORT_ENERGY_GURU)
        return true;
      return false;
    case POKENEWS_LILYCOVE:
      if (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ROOFTOP) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ROOFTOP))
        return true;
      return false;
  }
  return true;
}

/** 1:1 `static bool8 IsAddingPokeNewsDisallowed(u8 newsKind)` (tv.c:2697-2710). */
function IsAddingPokeNewsDisallowed(newsKind: number): boolean {
  let i = 0;
  if (newsKind == POKENEWS_NONE)
    return true;
  // Check if this type of news is already active
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind == newsKind)
      return true;
  }
  return false;
}

/** 1:1 `static void UpdatePokeNewsCountdown(u16 days)` (tv.c:2712-2736). */
function UpdatePokeNewsCountdown(days: number): void {
  let i = 0;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind != POKENEWS_NONE)
    {
      if (gSaveBlock1Ptr.pokeNews[i].dayCountdown < days)
      {
        // News event has elapsed, clear it from list
        ClearPokeNewsBySlot(i);
      }
      else
      {
        // Progress countdown to news event
        if (gSaveBlock1Ptr.pokeNews[i].state == POKENEWS_STATE_INACTIVE && FlagGet(FLAG_SYS_GAME_CLEAR))
          gSaveBlock1Ptr.pokeNews[i].state = POKENEWS_STATE_UPCOMING;
        gSaveBlock1Ptr.pokeNews[i].dayCountdown -= days;
      }
    }
  }
  CompactPokeNews();
}

/** 1:1 `void CopyContestRankToStringVar(u8 varIdx, u8 rank)` (tv.c:2738-2755). */
export function CopyContestRankToStringVar(varIdx: number, rank: number): void {
  switch (rank) {
    case CONTEST_RANK_NORMAL:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_NORMAL));
      break;
    case CONTEST_RANK_SUPER:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_SUPER));
      break;
    case CONTEST_RANK_HYPER:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_HYPER));
      break;
    case CONTEST_RANK_MASTER:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_MASTER));
      break;
  }
}

/** 1:1 `void CopyContestCategoryToStringVar(u8 varIdx, u8 category)` (tv.c:2757-2777). */
export function CopyContestCategoryToStringVar(varIdx: number, category: number): void {
  switch (category) {
    case CONTEST_CATEGORY_COOL:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_COOL));
      break;
    case CONTEST_CATEGORY_BEAUTY:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_BEAUTY));
      break;
    case CONTEST_CATEGORY_CUTE:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_CUTE));
      break;
    case CONTEST_CATEGORY_SMART:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_SMART));
      break;
    case CONTEST_CATEGORY_TOUGH:
      StringCopy(gTVStringVarPtrs[varIdx], stdString(STDSTRING_TOUGH));
      break;
  }
}

/** 1:1 `void SetContestCategoryStringVarForInterview(void)` (tv.c:2779-2783). */
export function SetContestCategoryStringVarForInterview(): void {
  let show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  CopyContestCategoryToStringVar(1, show.contestCategory);
}

/** 1:1 `void ConvertIntToDecimalString(u8 varIdx, int value)` (tv.c:2785-2789). */
export function ConvertIntToDecimalString(varIdx: number, value: number): void {
  let nDigits = CountDigits(value);
  ConvertIntToDecimalStringN(gTVStringVarPtrs[varIdx], value, STR_CONV_MODE_LEFT_ALIGN, nDigits);
}

/** 1:1 `size_t CountDigits(int value)` (tv.c:2791-2803). */
export function CountDigits(value: number): number {
  if (Math.trunc(value / 10) == 0)
    return 1;
  if (Math.trunc(value / 100) == 0)
    return 2;
  if (Math.trunc(value / 1000) == 0)
    return 3;
  if (Math.trunc(value / 10000) == 0)
    return 4;
  if (Math.trunc(value / 100000) == 0)
    return 5;
  if (Math.trunc(value / 1000000) == 0)
    return 6;
  if (Math.trunc(value / 10000000) == 0)
    return 7;
  if (Math.trunc(value / 100000000) == 0)
    return 8;
  return 1;
}

/** 1:1 `static void SmartShopper_BufferPurchaseTotal(u8 varIdx, TVShow *show)` (tv.c:2805-2819). */
function SmartShopper_BufferPurchaseTotal(varIdx: number, show: TVShow): void {
  let i = 0;
  let price = 0;
  for (i = 0; i < SMARTSHOPPER_NUM_ITEMS; i++)
  {
    if (show.itemIds[i] != ITEM_NONE)
      price += GetItemPrice(show.itemIds[i]) * show.itemAmounts[i];
  }
  if (show.priceReduced == 1)
    ConvertIntToDecimalString(varIdx, price >> 1);
  else
    ConvertIntToDecimalString(varIdx, price);
}

/** 1:1 `static bool8 IsRecordMixShowAlreadySpawned(u8 kind, bool8 delete)` (tv.c:2821-2844).
 *  `delete` = mot réservé TS → `delete_`. */
function IsRecordMixShowAlreadySpawned(kind: number, delete_: boolean): boolean {
  let playerId = 0;
  let shows: any = null;
  let i = 0;
  shows = gSaveBlock1Ptr.tvShows;
  playerId = GetPlayerIDAsU32();
  for (i = NUM_NORMAL_TVSHOW_SLOTS; i < LAST_TVSHOW_IDX; i++)
  {
    if (shows[i].kind == kind && (playerId & 0xFF) == shows[i].trainerIdLo && ((playerId >>> 8) & 0xFF) == shows[i].trainerIdHi)
    {
      if (delete_ == true)
      {
        DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, i);
        CompactTVShowArray(gSaveBlock1Ptr.tvShows);
      }
      return true;
    }
  }
  return false;
}

/** 1:1 `static void SortPurchasesByQuantity(void)` (tv.c:2846-2865). */
function SortPurchasesByQuantity(): void {
  let i = 0;
  let j = 0;
  for (i = 0; i < SMARTSHOPPER_NUM_ITEMS - 1; i++)
  {
    for (j = i + 1; j < SMARTSHOPPER_NUM_ITEMS; j++)
    {
      if (gMartPurchaseHistory[i].quantity < gMartPurchaseHistory[j].quantity)
      {
        let tempItemId = gMartPurchaseHistory[i].itemId;
        let tempQuantity = gMartPurchaseHistory[i].quantity;
        gMartPurchaseHistory[i].itemId = gMartPurchaseHistory[j].itemId;
        gMartPurchaseHistory[i].quantity = gMartPurchaseHistory[j].quantity;
        gMartPurchaseHistory[j].itemId = tempItemId;
        gMartPurchaseHistory[j].quantity = tempQuantity;
      }
    }
  }
}

/** 1:1 `static void TryReplaceOldTVShowOfKind(u8 kind)` (tv.c:2867-2892). */
function TryReplaceOldTVShowOfKind(kind: number): void {
  let i = 0;
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS; i++)
  {
    if (gSaveBlock1Ptr.tvShows[i].kind == kind)
    {
      if (gSaveBlock1Ptr.tvShows[i].active == 1)
      {
        // Old TV show is still active, don't replace
        VarSet(0x800D /* gSpecialVar_Result */, +(true));
      }
      else
      {
        // Old TV show is inactive, replace it and get new slot
        DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, i);
        CompactTVShowArray(gSaveBlock1Ptr.tvShows);
        Script_FindFirstEmptyNormalTVShowSlot();
      }
      return;
    }
  }
  // Old TV show doesn't exist, just get new slot
  Script_FindFirstEmptyNormalTVShowSlot();
}

/** 1:1 `void InterviewBefore(void)` (tv.c:2894-2930). */
export function InterviewBefore(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case TVSHOW_FAN_CLUB_LETTER:
      InterviewBefore_FanClubLetter();
      break;
    case TVSHOW_RECENT_HAPPENINGS:
      InterviewBefore_RecentHappenings();
      break;
    case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
      InterviewBefore_PkmnFanClubOpinions();
      break;
    case TVSHOW_DUMMY:
      InterviewBefore_Dummy();
      break;
    case TVSHOW_NAME_RATER_SHOW:
      InterviewBefore_NameRater();
      break;
    case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
      InterviewBefore_BravoTrainerPkmnProfile();
      break;
    case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
      InterviewBefore_BravoTrainerBTProfile();
      break;
    case TVSHOW_CONTEST_LIVE_UPDATES:
      InterviewBefore_ContestLiveUpdates();
      break;
    case TVSHOW_3_CHEERS_FOR_POKEBLOCKS:
      InterviewBefore_3CheersForPokeblocks();
      break;
    case TVSHOW_FAN_CLUB_SPECIAL:
      InterviewBefore_FanClubSpecial();
      break;
  }
}

/** 1:1 `static void InterviewBefore_FanClubLetter(void)` (tv.c:2932-2941). */
function InterviewBefore_FanClubLetter(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_FAN_CLUB_LETTER);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
  {
    StringCopy(gStringVar1, encodeOwText(gSpeciesNames[GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES) as number]));
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[6] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(6), 6);
  }
}

/** 1:1 `static void InterviewBefore_RecentHappenings(void)` (tv.c:2943-2951). */
function InterviewBefore_RecentHappenings(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_RECENT_HAPPENINGS);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
  {
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[6] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(6), 6);
  }
}

/** 1:1 `static void InterviewBefore_PkmnFanClubOpinions(void)` (tv.c:2953-2964). */
function InterviewBefore_PkmnFanClubOpinions(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_PKMN_FAN_CLUB_OPINIONS);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
  {
    StringCopy(gStringVar1, encodeOwText(gSpeciesNames[GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES) as number]));
    StringCopy(gStringVar2, encodeOwText(GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_NICKNAME) as string));
    StringGet_Nickname(gStringVar2);
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[2] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(2), 2);
  }
}

/** 1:1 `static void InterviewBefore_Dummy(void)` (tv.c:2966-2969). */
function InterviewBefore_Dummy(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(true));
}

/** 1:1 `static void InterviewBefore_NameRater(void)` (tv.c:2971-2974). */
function InterviewBefore_NameRater(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_NAME_RATER_SHOW);
}

/** 1:1 `static void InterviewBefore_BravoTrainerPkmnProfile(void)` (tv.c:2976-2982). */
function InterviewBefore_BravoTrainerPkmnProfile(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[2] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(2), 2);
}

/** 1:1 `static void InterviewBefore_ContestLiveUpdates(void)` (tv.c:2984-2987). */
function InterviewBefore_ContestLiveUpdates(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_CONTEST_LIVE_UPDATES);
}

/** 1:1 `static void InterviewBefore_3CheersForPokeblocks(void)` (tv.c:2989-2992). */
function InterviewBefore_3CheersForPokeblocks(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_3_CHEERS_FOR_POKEBLOCKS);
}

/** 1:1 `static void InterviewBefore_BravoTrainerBTProfile(void)` (tv.c:2994-3000). */
function InterviewBefore_BravoTrainerBTProfile(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[1] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(1), 1);
}

/** 1:1 `static void InterviewBefore_FanClubSpecial(void)` (tv.c:3002-3008). */
function InterviewBefore_FanClubSpecial(): void {
  TryReplaceOldTVShowOfKind(TVSHOW_FAN_CLUB_SPECIAL);
  if (!VarGet(0x800D) /* gSpecialVar_Result */)
    // 1:1 InitializeEasyChatWordArray(show.<variant>.words, ARRAY_COUNT) — union aplatie : words[1] alloué au vol.
    InitializeEasyChatWordArray(gSaveBlock1Ptr.tvShows[sCurTVShowSlot].words = new Array(1), 1);
}

/** 1:1 `static bool8 IsPartyMonNicknamedOrNotEnglish(u8 monIdx)` (tv.c:3010-3022). */
function IsPartyMonNicknamedOrNotEnglish(monIdx: number): boolean {
  let pokemon: any = null;
  const language = { v: 0 }; // TRANSPILER: &language pris → box
  pokemon = gPlayerParty[monIdx];
  StringCopy(gStringVar1, encodeOwText(GetMonData(pokemon, MON_DATA_NICKNAME) as string));
  language.v = GetMonData(pokemon, MON_DATA_LANGUAGE) as number;
  if (language.v == GAME_LANGUAGE && !StringCompare(encodeOwText(gSpeciesNames[GetMonData(pokemon, MON_DATA_SPECIES) as number]), gStringVar1))
    return false;
  return true;
}

/** 1:1 `bool8 IsLeadMonNicknamedOrNotEnglish(void)` (tv.c:3024-3027). */
export function IsLeadMonNicknamedOrNotEnglish(): boolean {
  return IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex());
}

/** 1:1 `static void DeleteTVShowInArrayByIdx(TVShow *shows, u8 idx)` (tv.c:3029-3037) —
 *  `commonInit.{kind=OFF_AIR, active=FALSE, data[]=0}` → slot vierge (union aplatie). */
function DeleteTVShowInArrayByIdx(shows: TVShow[], idx: number): void {
  ClearTVShowSlot(shows, idx, TVSHOW_OFF_AIR);
  shows[idx].active = false;
}

/** 1:1 `static void CompactTVShowArray(TVShow *shows)` (tv.c:3039-3077). */
function CompactTVShowArray(shows: TVShow[]): void {
  let i = 0;
  let j = 0;
  // Compact normal TV shows
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS - 1; i++)
  {
    if (shows[i].kind == TVSHOW_OFF_AIR)
    {
      for (j = i + 1; j < NUM_NORMAL_TVSHOW_SLOTS; j++)
      {
        if (shows[j].kind != TVSHOW_OFF_AIR)
        {
          shows[i] = shows[j];
          DeleteTVShowInArrayByIdx(shows, j);
          break;
        }
      }
    }
  }
  // Compact Record Mix TV shows
  for (i = NUM_NORMAL_TVSHOW_SLOTS; i < LAST_TVSHOW_IDX; i++)
  {
    if (shows[i].kind == TVSHOW_OFF_AIR)
    {
      for (j = i + 1; j < LAST_TVSHOW_IDX; j++)
      {
        if (shows[j].kind != TVSHOW_OFF_AIR)
        {
          shows[i] = shows[j];
          DeleteTVShowInArrayByIdx(shows, j);
          break;
        }
      }
    }
  }
}

/** 1:1 `static u16 GetRandomDifferentSpeciesAndNameSeenByPlayer(u8 varIdx, u16 excludedSpecies)` (tv.c:3079-3084). */
function GetRandomDifferentSpeciesAndNameSeenByPlayer(varIdx: number, excludedSpecies: number): number {
  let species = GetRandomDifferentSpeciesSeenByPlayer(excludedSpecies);
  StringCopy(gTVStringVarPtrs[varIdx], encodeOwText(gSpeciesNames[species]));
  return species;
}

/** 1:1 `static u16 GetRandomDifferentSpeciesSeenByPlayer(u16 excludedSpecies)` (tv.c:3086-3106). */
function GetRandomDifferentSpeciesSeenByPlayer(excludedSpecies: number): number {
  let species = Random() % (NUM_SPECIES - 1) + 1;
  let initSpecies = species;
  while (GetSetPokedexFlag(SpeciesToNationalPokedexNum(species), FLAG_GET_SEEN) != 1 || species == excludedSpecies)
  {
    if (species == SPECIES_NONE + 1)
      species = NUM_SPECIES - 1;
    else
      species--;
    if (species == initSpecies)
    {
      // Looped back to initial species (only Pokémon seen), must choose excluded species
      species = excludedSpecies;
      return species;
    }
  }
  ;
  return species;
}

/** 1:1 `static void Script_FindFirstEmptyNormalTVShowSlot(void)` (tv.c:3108-3116). */
function Script_FindFirstEmptyNormalTVShowSlot(): void {
  sCurTVShowSlot = FindFirstEmptyNormalTVShowSlot(gSaveBlock1Ptr.tvShows);
  VarSet(0x8006 /* gSpecialVar_0x8006 */, +(sCurTVShowSlot));
  if (sCurTVShowSlot == -1)
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  else
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  // Found empty slot
}

/** 1:1 `static s8 FindFirstEmptyNormalTVShowSlot(TVShow *shows)` (tv.c:3118-3128). */
function FindFirstEmptyNormalTVShowSlot(shows: TVShow): number {
  let i = 0;
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS; i++)
  {
    if (shows[i].kind == TVSHOW_OFF_AIR)
      return i;
  }
  return -1;
}

/** 1:1 `static s8 FindFirstEmptyRecordMixTVShowSlot(TVShow *shows)` (tv.c:3130-3140). */
function FindFirstEmptyRecordMixTVShowSlot(shows: TVShow[]): number {
  let i = 0;
  for (i = NUM_NORMAL_TVSHOW_SLOTS; i < LAST_TVSHOW_IDX; i++)
  {
    if (shows[i].kind == TVSHOW_OFF_AIR)
      return i;
  }
  return -1;
}

/** 1:1 `static bool8 BernoulliTrial(u16 ratio)` (tv.c:3142-3148). */
function BernoulliTrial(ratio: number): boolean {
  if (Random() <= ratio)
    return false;
  return true;
}

// For TVSHOW_FAN_CLUB_LETTER / TVSHOW_RECENT_HAPPENINGS

// Both are assumed to have the same struct layout

/** 1:1 `static void GetRandomWordFromShow(TVShow *show)` (tv.c:3152-3169). */
function GetRandomWordFromShow(show: TVShow): void {
  let i = 0;
  i = Random() % show.words.length;
  // From random point, get first non-empty word
  while (true)
  {
    if (i == show.words.length)
      i = 0;
    if (show.words[i] != EC_EMPTY_WORD)
      break;
    i++;
  }
  CopyEasyChatWord(gStringVar3, show.words[i]);
}

/** 1:1 `static u8 GetRandomNameRaterStateFromName(TVShow *show)` (tv.c:3171-3185). */
function GetRandomNameRaterStateFromName(show: TVShow): number {
  let i = 0;
  let nameSum = 0;
  nameSum = 0;
  for (i = 0; i < POKEMON_NAME_LENGTH + 1; i++)
  {
    if (show.pokemonName[i] == EOS)
      break;
    nameSum += show.pokemonName[i];
  }
  return nameSum & 7;
}

/** 1:1 `static void GetNicknameSubstring(u8 varIdx, u8 whichPosition, u8 charParam, u16 whichString, u16 species, TVShow *show)` (tv.c:3187-3265). */
function GetNicknameSubstring(varIdx: number, whichPosition: number, charParam: number, whichString: number, species: number, show: TVShow): void {
  const buff = new Uint8Array(16);
  let i = 0;
  let strlen = 0;
  let nameBytes: Uint8Array = new Uint8Array(0); // frontière charmap (noms show/species = string JS)
  for (i = 0; i < 3; i++)
    buff[i] = EOS;
  if (whichString == 0)
  {
    strlen = StringLength(nameBytes = encodeOwText(show.trainerName)); // frontière charmap (nom = string JS)
    if (charParam == 0)
    {
      buff[0] = nameBytes[whichPosition];
    }
    else if (charParam == 1)
    {
      buff[0] = nameBytes[strlen - whichPosition];
    }
    else if (charParam == 2)
    {
      buff[0] = nameBytes[whichPosition];
      buff[1] = nameBytes[whichPosition + 1];
    }
    else
    {
      buff[0] = nameBytes[strlen - (whichPosition + 2)];
      buff[1] = nameBytes[strlen - (whichPosition + 1)];
    }
    ConvertInternationalString(buff, show.language);
  }
  else if (whichString == 1)
  {
    strlen = StringLength(nameBytes = encodeOwText(show.pokemonName)); // frontière charmap
    if (charParam == 0)
    {
      buff[0] = nameBytes[whichPosition];
    }
    else if (charParam == 1)
    {
      buff[0] = nameBytes[strlen - whichPosition];
    }
    else if (charParam == 2)
    {
      buff[0] = nameBytes[whichPosition];
      buff[1] = nameBytes[whichPosition + 1];
    }
    else
    {
      buff[0] = nameBytes[strlen - (whichPosition + 2)];
      buff[1] = nameBytes[strlen - (whichPosition + 1)];
    }
    ConvertInternationalString(buff, show.pokemonNameLanguage);
  }
  else
  {
    strlen = StringLength(nameBytes = encodeOwText(gSpeciesNames[species])); // frontière charmap
    if (charParam == 0)
    {
      buff[0] = nameBytes[whichPosition];
    }
    else if (charParam == 1)
    {
      buff[0] = nameBytes[strlen - whichPosition];
    }
    else if (charParam == 2)
    {
      buff[0] = nameBytes[whichPosition];
      buff[1] = nameBytes[whichPosition + 1];
    }
    else
    {
      buff[0] = nameBytes[strlen - (whichPosition + 2)];
      buff[1] = nameBytes[strlen - (whichPosition + 1)];
    }
  }
  StringCopy(gTVStringVarPtrs[varIdx], buff);
}

// Unused script special

/** 1:1 `bool8 IsTVShowAlreadyInQueue(void)` (tv.c:3268-3278). */
export function IsTVShowAlreadyInQueue(): boolean {
  let i = 0;
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS; i++)
  {
    if (gSaveBlock1Ptr.tvShows[i].kind == VarGet(0x8004) /* gSpecialVar_0x8004 */)
      return true;
  }
  return false;
}

/** 1:1 `bool8 TryPutNameRaterShowOnTheAir(void)` (tv.c:3280-3290). */
export function TryPutNameRaterShowOnTheAir(): boolean {
  StringCopy(gStringVar1, encodeOwText(GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_NICKNAME) as string));
  // Nickname wasnt changed
  if (!StringCompare(gStringVar3, gStringVar1))
    return false;
  PutNameRaterShowOnTheAir();
  return true;
}

// Buffer DoNamingScreen (charCodes JS, pattern egg_hatch _nicknameBuffer) —
// le C écrit directement dans gStringVar2 ; chez nous DoNamingScreen prend un
// number[] muté, et gStringVar2/3 (bytes charmap) restent alimentés pour la
// comparaison cross-script (TryPutNameRaterShowOnTheAir).
const sNicknameBuffer: number[] = [];

function _fillNicknameBuffer(nick: string): void {
  sNicknameBuffer.length = 0;
  for (const c of nick) sNicknameBuffer.push(c.charCodeAt(0));
}

function _readNicknameBuffer(): string | null {
  return sNicknameBuffer.length ? String.fromCharCode(...sNicknameBuffer) : null;
}

/** 1:1 `void ChangePokemonNickname(void)` (tv.c:3292-3299). */
export function ChangePokemonNickname(): void {
  const mon = gPlayerParty[+VarGet(0x8004) /* gSpecialVar_0x8004 */];
  const nick = GetMonData(mon, MON_DATA_NICKNAME) as string;
  StringCopy(gStringVar3, encodeOwText(nick));
  StringCopy(gStringVar2, encodeOwText(nick));
  _fillNicknameBuffer(nick);
  DoNamingScreen(NAMING_SCREEN_NICKNAME, sNicknameBuffer, GetMonData(mon, MON_DATA_SPECIES) as number, GetMonGender(mon), GetMonData(mon, MON_DATA_PERSONALITY) as number, ChangePokemonNickname_CB);
}

/** 1:1 `void ChangePokemonNickname_CB(void)` (tv.c:3301-3305).
 *  CB2_ReturnToFieldContinueScriptPlayMapMusic → variante repo _Manual
 *  (chaîne musique = dette tracée, convention safari_zone). */
export function ChangePokemonNickname_CB(): void {
  const name = _readNicknameBuffer();
  if (name) {
    SetMonData(gPlayerParty[+VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_NICKNAME, name);
    StringCopy(gStringVar2, encodeOwText(name));
  }
  SetMainCallback2(CB2_ReturnToFieldContinueScript_Manual);
}

/** 1:1 `void ChangeBoxPokemonNickname(void)` (tv.c:3307-3315). GetBoxMonData =
 *  GetMonData (modèle unifié Pokemon == BoxPokemon). */
export function ChangeBoxPokemonNickname(): void {
  const boxMon = GetBoxedMonPtr(+VarGet(0x8012) /* gSpecialVar_MonBoxId */, +VarGet(0x8013) /* gSpecialVar_MonBoxPos */);
  if (!boxMon) return;
  const nick = GetMonData(boxMon, MON_DATA_NICKNAME) as string;
  StringCopy(gStringVar3, encodeOwText(nick));
  StringCopy(gStringVar2, encodeOwText(nick));
  _fillNicknameBuffer(nick);
  DoNamingScreen(NAMING_SCREEN_NICKNAME, sNicknameBuffer, GetMonData(boxMon, MON_DATA_SPECIES) as number, GetBoxMonGender(boxMon), GetMonData(boxMon, MON_DATA_PERSONALITY) as number, ChangeBoxPokemonNickname_CB);
}

/** 1:1 `static void ChangeBoxPokemonNickname_CB(void)` (tv.c:3317-3321). */
function ChangeBoxPokemonNickname_CB(): void {
  const name = _readNicknameBuffer();
  if (name) SetBoxMonNickAt(+VarGet(0x8012) /* gSpecialVar_MonBoxId */, +VarGet(0x8013) /* gSpecialVar_MonBoxPos */, name);
  SetMainCallback2(CB2_ReturnToFieldContinueScript_Manual);
}

/** 1:1 `void BufferMonNickname(void)` (tv.c:3323-3327). */
export function BufferMonNickname(): void {
  StringCopy(gStringVar1, encodeOwText(GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_NICKNAME) as string));
  StringGet_Nickname(gStringVar1);
}

/** 1:1 `void IsMonOTIDNotPlayers(void)` (tv.c:3329-3335). */
export function IsMonOTIDNotPlayers(): void {
  if (GetPlayerIDAsU32() == GetMonData(gPlayerParty[VarGet(0x8004) /* gSpecialVar_0x8004 */], MON_DATA_OT_ID))
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  else
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
}

/** 1:1 `static u8 GetTVGroupByShowId(u8 kind)` (tv.c:3337-3352). */
function GetTVGroupByShowId(kind: number): number {
  if (kind == TVSHOW_OFF_AIR)
    return TVGROUP_NONE;
  if (kind >= TVGROUP_NORMAL_START && kind <= TVGROUP_NORMAL_END)
    return TVGROUP_NORMAL;
  if (kind >= TVGROUP_RECORD_MIX_START && kind <= TVGROUP_RECORD_MIX_END)
    return TVGROUP_RECORD_MIX;
  if (kind >= TVGROUP_OUTBREAK_START && kind <= TVGROUP_OUTBREAK_END)
    return TVGROUP_OUTBREAK;
  return TVGROUP_NONE;
}

/** 1:1 `u32 GetPlayerIDAsU32(void)` (tv.c:3354-3357) :
 *  `(playerTrainerId[3]<<24)|([2]<<16)|([1]<<8)|[0]` = reconstruit le u32 LE.
 *  🐛 fix 2026-07-19 (SYS-1, cf. N°ID Panthéon 8dee92c28) : notre SB2.playerTrainerId
 *  EST déjà ce u32 (number ; new_game.ts:InitPlayerTrainerId) → l'accès `[i]` rendait
 *  `undefined` (⇒ 0). Fallback array = défensif (save legacy u8[4]). */
export function GetPlayerIDAsU32(): number {
  const tid = gSaveBlock2Ptr.playerTrainerId as unknown as number | number[];
  return (typeof tid === 'number'
    ? tid
    : ((tid?.[0] ?? 0) | ((tid?.[1] ?? 0) << 8) | ((tid?.[2] ?? 0) << 16) | ((tid?.[3] ?? 0) << 24))) >>> 0;
}

/** 1:1 `u8 CheckForPlayersHouseNews(void)` (tv.c:3359-3384). */
export function CheckForPlayersHouseNews(): number {
  // Check if not in Littleroot house map group
  if (gSaveBlock1Ptr.location.mapGroup != MAP_GROUP(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F))
    return PLAYERS_HOUSE_TV_NONE;
  // Check if not in player's house (dependent on gender)
  if (gSaveBlock2Ptr.playerGender == MALE)
  {
    if (gSaveBlock1Ptr.location.mapNum != MAP_NUM(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F))
      return PLAYERS_HOUSE_TV_NONE;
  }
  else
  {
    if (gSaveBlock1Ptr.location.mapNum != MAP_NUM(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F))
      return PLAYERS_HOUSE_TV_NONE;
  }
  if (FlagGet(FLAG_SYS_TV_LATIAS_LATIOS))
    return PLAYERS_HOUSE_TV_LATI;
  if (FlagGet(FLAG_SYS_TV_HOME))
    return PLAYERS_HOUSE_TV_MOVIE;
  return PLAYERS_HOUSE_TV_LATI;
}

/** 1:1 `void GetMomOrDadStringForTVMessage(void)` (tv.c:3386-3440). */
export function GetMomOrDadStringForTVMessage(): void {
  // If the player is checking the TV in their house it will only refer to their Mom.
  if (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F))
  {
    if (gSaveBlock2Ptr.playerGender == MALE)
    {
      if (gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F))
      {
        StringCopy(gStringVar1, encodeOwText(getString('gText_Mom')));
        VarSet(VAR_TEMP_3, 1);
      }
    }
    else
    {
      if (gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F))
      {
        StringCopy(gStringVar1, encodeOwText(getString('gText_Mom')));
        VarSet(VAR_TEMP_3, 1);
      }
    }
  }
  if (VarGet(VAR_TEMP_3) == 1)
  {
    StringCopy(gStringVar1, encodeOwText(getString('gText_Mom')));
  }
  else if (VarGet(VAR_TEMP_3) == 2)
  {
    StringCopy(gStringVar1, encodeOwText(getString('gText_Dad')));
  }
  else if (VarGet(VAR_TEMP_3) > 2)
  {
    // Should only happen if VAR_TEMP_3 is already in use by something else.
    if (VarGet(VAR_TEMP_3) % 2 == 0)
      StringCopy(gStringVar1, encodeOwText(getString('gText_Mom')));
    else
      StringCopy(gStringVar1, encodeOwText(getString('gText_Dad')));
  }
  else
  {
    // Randomly choose whether to refer to Mom or Dad.
    // NOTE: Because of this, any map that has a TV in it shouldn't rely on VAR_TEMP_3.
    //       If its value is 0, checking the TV will set it to 1 or 2.
    if (Random() % 2 != 0)
    {
      StringCopy(gStringVar1, encodeOwText(getString('gText_Mom')));
      VarSet(VAR_TEMP_3, 1);
    }
    else
    {
      StringCopy(gStringVar1, encodeOwText(getString('gText_Dad')));
      VarSet(VAR_TEMP_3, 2);
    }
  }
}

/** 1:1 `void HideBattleTowerReporter(void)` (tv.c:3442-3447). */
export function HideBattleTowerReporter(): void {
  VarSet(VAR_BRAVO_TRAINER_BATTLE_TOWER_ON, 0);
  RemoveObjectEventByLocalIdAndMap(LOCALID_TOWER_LOBBY_REPORTER, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup);
  FlagSet(FLAG_HIDE_BATTLE_TOWER_REPORTER);
}

/** 1:1 `void ReceiveTvShowsData(void *src, u32 size, u8 playersLinkId)` (tv.c:3449-3496).
 *  Harness : le record mixing JS passera `src` = TVShow[MAX_LINK_PLAYERS][TV_SHOWS_COUNT]
 *  (le C memcpy depuis le buffer série link) — deep-copy locale = rmBuffer. */
export function ReceiveTvShowsData(src: TVShow[][], _size: number, playersLinkId: number): void {
  let i = 0;
  let version = 0;
  const rmBuffer: TVShow[][] = Array.from({ length: MAX_LINK_PLAYERS }, (_v, pi) =>
    Array.from({ length: TV_SHOWS_COUNT }, (_w, sj) => ({ ...(src?.[pi]?.[sj] ?? { kind: 0, active: 0 }) })));
  {
    for (i = 0; i < GetLinkPlayerCount(); i++)
    {
      version = (gLinkPlayers[i].version & 0xFF);
      if (version == VERSION_RUBY || version == VERSION_SAPPHIRE)
        TranslateRubyShows(rmBuffer[i]);
      else if (version == VERSION_EMERALD && gLinkPlayers[i].language == LANGUAGE_JAPANESE)
        TranslateJapaneseEmeraldShows(rmBuffer[i]);
    }
    // Position player's TV shows in argument list depending on link id
    switch (playersLinkId) {
      case 0:
        SetMixedTVShows(gSaveBlock1Ptr.tvShows, rmBuffer[1], rmBuffer[2], rmBuffer[3]);
        break;
      case 1:
        SetMixedTVShows(rmBuffer[0], gSaveBlock1Ptr.tvShows, rmBuffer[2], rmBuffer[3]);
        break;
      case 2:
        SetMixedTVShows(rmBuffer[0], rmBuffer[1], gSaveBlock1Ptr.tvShows, rmBuffer[3]);
        break;
      case 3:
        SetMixedTVShows(rmBuffer[0], rmBuffer[1], rmBuffer[2], gSaveBlock1Ptr.tvShows);
        break;
    }
    CompactTVShowArray(gSaveBlock1Ptr.tvShows);
    DeleteExcessMixedShows();
    CompactTVShowArray(gSaveBlock1Ptr.tvShows);
    DeactivateShowsWithUnseenSpecies();
    DeactivateGameCompleteShowsIfNotUnlocked();
  }
}

/** Copie 1:1 `*dest = *src` d'un TVShow (union aplatie) : vide dest puis copie
 *  toutes les clés — l'objet référencé est remplacé contenu-complet. */
function copyTVShow(dest: TVShow, src: TVShow): void {
  for (const k of Object.keys(dest)) delete (dest as Record<string, unknown>)[k];
  Object.assign(dest, src);
}

/** 1:1 `static void SetMixedTVShows(TVShow player1[TV_SHOWS_COUNT], TVShow player2[TV_SHOWS_COUNT], TVShow player3[TV_SHOWS_COUNT], TVShow player4[TV_SHOWS_COUNT])` (tv.c:3498-3537).
 *  C : `TVShow (*tvShows[4])[TV_SHOWS_COUNT]` — tableau de pointeurs ; `tvShows[i][0]`
 *  = déréférence vers le tableau → chez nous les tableaux directement. */
function SetMixedTVShows(player1: TVShow[], player2: TVShow[], player3: TVShow[], player4: TVShow[]): void {
  let i = 0;
  let j = 0;
  const tvShows: TVShow[][] = [];
  tvShows[0] = player1;
  tvShows[1] = player2;
  tvShows[2] = player3;
  tvShows[3] = player4;
  sTVShowMixingNumPlayers = GetLinkPlayerCount();
  while (1)
  {
    for (i = 0; i < sTVShowMixingNumPlayers; i++)
    {
      if (i == 0)
        sRecordMixingPartnersWithoutShowsToShare = 0;
      sTVShowMixingCurSlot = FindInactiveShowInArray(tvShows[i]);
      if (sTVShowMixingCurSlot == -1)
      {
        sRecordMixingPartnersWithoutShowsToShare++;
        if (sRecordMixingPartnersWithoutShowsToShare == sTVShowMixingNumPlayers)
          return;
      }
      else
      {
        for (j = 0; j < sTVShowMixingNumPlayers - 1; j++)
        {
          sCurTVShowSlot = FindFirstEmptyRecordMixTVShowSlot(tvShows[(i + j + 1) % sTVShowMixingNumPlayers]);
          if (sCurTVShowSlot != -1 && TryMixTVShow(tvShows[(i + j + 1) % sTVShowMixingNumPlayers], tvShows[i], (i + j + 1) % sTVShowMixingNumPlayers) == true)
            break;
        }
        if (j == sTVShowMixingNumPlayers - 1)
          DeleteTVShowInArrayByIdx(tvShows[i], sTVShowMixingCurSlot);
      }
    }
  }
}

/** 1:1 `static bool8 TryMixTVShow(TVShow *dest[TV_SHOWS_COUNT], TVShow *src[TV_SHOWS_COUNT], u8 idx)` (tv.c:3539-3568). */
function TryMixTVShow(dest: TVShow[], src: TVShow[], idx: number): boolean {
  let success = false;
  let type = 0;
  const tv1 = dest;
  const tv2 = src;
  success = false;
  type = GetTVGroupByShowId(tv2[sTVShowMixingCurSlot].kind);
  switch (type) {
    case TVGROUP_NORMAL:
      success = TryMixNormalTVShow(tv1[sCurTVShowSlot], tv2[sTVShowMixingCurSlot], idx);
      break;
    case TVGROUP_RECORD_MIX:
      success = TryMixRecordMixTVShow(tv1[sCurTVShowSlot], tv2[sTVShowMixingCurSlot], idx);
      break;
    case TVGROUP_OUTBREAK:
      success = TryMixOutbreakTVShow(tv1[sCurTVShowSlot], tv2[sTVShowMixingCurSlot], idx);
      break;
  }
  // Show was mixed, delete from array
  if (success == true)
  {
    DeleteTVShowInArrayByIdx(tv2, sTVShowMixingCurSlot);
    return true;
  }
  return false;
}

/** 1:1 `static bool8 TryMixNormalTVShow(TVShow *dest, TVShow *src, u8 idx)` (tv.c:3570-3585). */
function TryMixNormalTVShow(dest: TVShow, src: TVShow, idx: number): boolean {
  let linkTrainerId = GetLinkPlayerTrainerId(idx);
  if ((linkTrainerId & 0xFF) == src.trainerIdLo && ((linkTrainerId >>> 8) & 0xFF) == src.trainerIdHi)
    return false;
  src.trainerIdLo = src.srcTrainerIdLo;
  src.trainerIdHi = src.srcTrainerIdHi;
  src.srcTrainerIdLo = linkTrainerId & 0xFF;
  src.srcTrainerIdHi = linkTrainerId >>> 8;
  copyTVShow(dest, src); // 1:1 `*dest = *src`
  dest.active = true;
  return true;
}

/** 1:1 `static bool8 TryMixRecordMixTVShow(TVShow *dest, TVShow *src, u8 idx)` (tv.c:3587-3606). */
function TryMixRecordMixTVShow(dest: TVShow, src: TVShow, idx: number): boolean {
  let linkTrainerId = GetLinkPlayerTrainerId(idx);
  if ((linkTrainerId & 0xFF) == src.srcTrainerIdLo && ((linkTrainerId >>> 8) & 0xFF) == src.srcTrainerIdHi)
    return false;
  if ((linkTrainerId & 0xFF) == src.trainerIdLo && ((linkTrainerId >>> 8) & 0xFF) == src.trainerIdHi)
    return false;
  src.srcTrainerIdLo = src.srcTrainerId2Lo;
  src.srcTrainerIdHi = src.srcTrainerId2Hi;
  src.srcTrainerId2Lo = linkTrainerId & 0xFF;
  src.srcTrainerId2Hi = linkTrainerId >>> 8;
  copyTVShow(dest, src); // 1:1 `*dest = *src`
  dest.active = true;
  return true;
}

/** 1:1 `static bool8 TryMixOutbreakTVShow(TVShow *dest, TVShow *src, u8 idx)` (tv.c:3608-3624). */
function TryMixOutbreakTVShow(dest: TVShow, src: TVShow, idx: number): boolean {
  let linkTrainerId = GetLinkPlayerTrainerId(idx);
  if ((linkTrainerId & 0xFF) == src.trainerIdLo && ((linkTrainerId >>> 8) & 0xFF) == src.trainerIdHi)
    return false;
  src.trainerIdLo = src.srcTrainerIdLo;
  src.trainerIdHi = src.srcTrainerIdHi;
  src.srcTrainerIdLo = linkTrainerId & 0xFF;
  src.srcTrainerIdHi = linkTrainerId >>> 8;
  copyTVShow(dest, src); // 1:1 `*dest = *src`
  dest.active = true;
  dest.daysLeft = 1;
  return true;
}

/** 1:1 `static s8 FindInactiveShowInArray(TVShow *tvShows)` (tv.c:3626-3637). */
function FindInactiveShowInArray(tvShows: TVShow[]): number {
  let i = 0;
  for (i = 0; i < LAST_TVSHOW_IDX; i++)
  {
    // Second check is to make sure its a valid show (not too high, not TVSHOW_OFF_AIR)
    if (tvShows[i].active == 0 && ((tvShows[i].kind - 1) & 0xFF) < TVGROUP_OUTBREAK_END)
      return i;
  }
  return -1;
}

/** 1:1 `static void DeactivateShowsWithUnseenSpecies(void)` (tv.c:3639-3781). */
function DeactivateShowsWithUnseenSpecies(): void {
  let i = 0;
  let species = 0;
  for (i = 0; i < LAST_TVSHOW_IDX; i++)
  {
    switch (gSaveBlock1Ptr.tvShows[i].kind) {
      case TVSHOW_CONTEST_LIVE_UPDATES:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).winningSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).losingSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_BATTLE_UPDATE:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).speciesPlayer;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).speciesOpponent;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_FAN_CLUB_LETTER:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_DUMMY:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_NAME_RATER_SHOW:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).randomSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).defeatedSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_POKEMON_TODAY_CAUGHT:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_POKEMON_TODAY_FAILED:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species2;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_FISHING_ADVICE:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_WORLD_OF_MASTERS:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).caughtPoke;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_BREAKING_NEWS:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).lastOpponentSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).poke1Species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_SECRET_BASE_VISIT:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_BATTLE_SEMINAR:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).foeSpecies;
        DeactivateShowIfNotSeenSpecies(species, i);
        break;
      case TVSHOW_FRONTIER:
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species1;
        DeactivateShowIfNotSeenSpecies(species, i);
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species2;
        DeactivateShowIfNotSeenSpecies(species, i);
        // Species var re-used here
        species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).facilityAndMode;
        switch (species) {
          case FRONTIER_SHOW_TOWER_MULTIS:
          case FRONTIER_SHOW_TOWER_LINK_MULTIS:
            break;
          case FRONTIER_SHOW_TOWER_SINGLES:
          case FRONTIER_SHOW_DOME_SINGLES:
          case FRONTIER_SHOW_DOME_DOUBLES:
          case FRONTIER_SHOW_FACTORY_SINGLES:
          case FRONTIER_SHOW_FACTORY_DOUBLES:
          case FRONTIER_SHOW_PIKE:
          case FRONTIER_SHOW_ARENA:
          case FRONTIER_SHOW_PALACE_SINGLES:
          case FRONTIER_SHOW_PALACE_DOUBLES:
          case FRONTIER_SHOW_PYRAMID:
            species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species3;
            DeactivateShowIfNotSeenSpecies(species, i);
            break;
          case FRONTIER_SHOW_TOWER_DOUBLES:
            species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species3;
            DeactivateShowIfNotSeenSpecies(species, i);
            species = (gSaveBlock1Ptr.tvShows[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */).species4;
            DeactivateShowIfNotSeenSpecies(species, i);
            break;
        }
        break;
      // Shows with no species
      case TVSHOW_OFF_AIR:
      case TVSHOW_RECENT_HAPPENINGS:
      case TVSHOW_3_CHEERS_FOR_POKEBLOCKS:
      case TVSHOW_TODAYS_RIVAL_TRAINER:
      case TVSHOW_TREND_WATCHER:
      case TVSHOW_TREASURE_INVESTIGATORS:
      case TVSHOW_FIND_THAT_GAMER:
      case TVSHOW_TRAINER_FAN_CLUB:
      case TVSHOW_CUTIES:
      case TVSHOW_SMART_SHOPPER:
      case TVSHOW_FAN_CLUB_SPECIAL:
      case TVSHOW_LILYCOVE_CONTEST_LADY:
      case TVSHOW_LOTTO_WINNER:
      case TVSHOW_NUMBER_ONE:
      case TVSHOW_SECRET_BASE_SECRETS:
      case TVSHOW_SAFARI_FAN_CLUB:
      case TVSHOW_MASS_OUTBREAK:
        break;
      default:
        DeactivateShow(i);
        break;
    }
  }
}

/** 1:1 `static void DeactivateShow(u8 showIdx)` (tv.c:3783-3786). */
function DeactivateShow(showIdx: number): void {
  gSaveBlock1Ptr.tvShows[showIdx].active = false;
}

/** 1:1 `static void DeactivateShowIfNotSeenSpecies(u16 species, u8 showIdx)` (tv.c:3788-3792). */
function DeactivateShowIfNotSeenSpecies(species: number, showIdx: number): void {
  if (!GetSetPokedexFlag(SpeciesToNationalPokedexNum(species), FLAG_GET_SEEN))
    gSaveBlock1Ptr.tvShows[showIdx].active = false;
}

/** 1:1 `static void DeactivateGameCompleteShowsIfNotUnlocked(void)` (tv.c:3794-3808). */
function DeactivateGameCompleteShowsIfNotUnlocked(): void {
  let i = 0;
  if (!FlagGet(FLAG_SYS_GAME_CLEAR))
  {
    for (i = 0; i < LAST_TVSHOW_IDX; i++)
    {
      if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE)
        gSaveBlock1Ptr.tvShows[i].active = false;
      else if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_MASS_OUTBREAK)
        gSaveBlock1Ptr.tvShows[i].active = false;
    }
  }
}

/** 1:1 `void DeactivateAllNormalTVShows(void)` (tv.c:3810-3819). */
export function DeactivateAllNormalTVShows(): void {
  let i = 0;
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS; i++)
  {
    if (GetTVGroupByShowId(gSaveBlock1Ptr.tvShows[i].kind) == TVGROUP_NORMAL)
      gSaveBlock1Ptr.tvShows[i].active = false;
  }
}

// Ensures a minimum of 5 empty record mixed show slots

/** 1:1 `static void DeleteExcessMixedShows(void)` (tv.c:3822-3833). */
function DeleteExcessMixedShows(): void {
  let i = 0;
  let numEmptyMixSlots = 0;
  for (i = NUM_NORMAL_TVSHOW_SLOTS; i < LAST_TVSHOW_IDX; i++)
  {
    if (gSaveBlock1Ptr.tvShows[i].kind == TVSHOW_OFF_AIR)
      numEmptyMixSlots++;
  }
  for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS - numEmptyMixSlots; i++)
    DeleteTVShowInArrayByIdx(gSaveBlock1Ptr.tvShows, i + NUM_NORMAL_TVSHOW_SLOTS);
}

/** 1:1 `void ReceivePokeNewsData(void *src, u32 size, u8 playersLinkId)` (tv.c:3835-3869).
 *  Harness : `src` = PokeNews[MAX_LINK_PLAYERS][POKE_NEWS_COUNT] JS (cf. ReceiveTvShowsData). */
export function ReceivePokeNewsData(src: PokeNews[][], _size: number, playersLinkId: number): void {
  const rmBuffer: PokeNews[][] = Array.from({ length: MAX_LINK_PLAYERS }, (_v, pi) =>
    Array.from({ length: POKE_NEWS_COUNT }, (_w, sj) => ({ ...(src?.[pi]?.[sj] ?? { kind: 0, state: 0, dayCountdown: 0 }) })));
  {
    // Position player's PokeNews in argument list depending on link id
    switch (playersLinkId) {
      case 0:
        SetMixedPokeNews(gSaveBlock1Ptr.pokeNews, rmBuffer[1], rmBuffer[2], rmBuffer[3]);
        break;
      case 1:
        SetMixedPokeNews(rmBuffer[0], gSaveBlock1Ptr.pokeNews, rmBuffer[2], rmBuffer[3]);
        break;
      case 2:
        SetMixedPokeNews(rmBuffer[0], rmBuffer[1], gSaveBlock1Ptr.pokeNews, rmBuffer[3]);
        break;
      case 3:
        SetMixedPokeNews(rmBuffer[0], rmBuffer[1], rmBuffer[2], gSaveBlock1Ptr.pokeNews);
        break;
    }
    ClearInvalidPokeNews();
    ClearPokeNewsIfGameNotComplete();
  }
}

/** 1:1 `static void SetMixedPokeNews(PokeNews player1[POKE_NEWS_COUNT], PokeNews player2[POKE_NEWS_COUNT], PokeNews player3[POKE_NEWS_COUNT], PokeNews player4[POKE_NEWS_COUNT])` (tv.c:3871-3897). */
function SetMixedPokeNews(player1: PokeNews[], player2: PokeNews[], player3: PokeNews[], player4: PokeNews[]): void {
  let i = 0;
  let j = 0;
  let k = 0;
  const pokeNews: PokeNews[][] = [];
  pokeNews[0] = player1;
  pokeNews[1] = player2;
  pokeNews[2] = player3;
  pokeNews[3] = player4;
  sTVShowNewsMixingNumPlayers = GetLinkPlayerCount();
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    for (j = 0; j < sTVShowNewsMixingNumPlayers; j++)
    {
      sTVShowMixingCurSlot = GetPokeNewsSlotIfActive(pokeNews[j], i);
      if (sTVShowMixingCurSlot != -1)
      {
        for (k = 0; k < sTVShowNewsMixingNumPlayers - 1; k++)
        {
          sCurTVShowSlot = GetFirstEmptyPokeNewsSlot(pokeNews[(j + k + 1) % sTVShowNewsMixingNumPlayers]);
          if (sCurTVShowSlot != -1)
            InitTryMixPokeNewsShow(pokeNews[(j + k + 1) % sTVShowNewsMixingNumPlayers], pokeNews[j]);
        }
      }
    }
  }
}

/** 1:1 `static void InitTryMixPokeNewsShow(PokeNews *dest[POKE_NEWS_COUNT], PokeNews *src[POKE_NEWS_COUNT])` (tv.c:3899-3905).
 *  C : ptr2 += slot puis TryMixPokeNewsShow(ptr1, ptr2, …) — chez nous l'élément direct. */
function InitTryMixPokeNewsShow(dest: PokeNews[], src: PokeNews[]): void {
  const ptr1 = dest;
  const ptr2 = src[sTVShowMixingCurSlot];
  TryMixPokeNewsShow(ptr1, ptr2, sCurTVShowSlot);
}

/** 1:1 `static bool8 TryMixPokeNewsShow(PokeNews *dest, PokeNews *src, s8 slot)` (tv.c:3907-3923) —
 *  `dest` = base du tableau (indexé dest[i]/dest[slot] dans le C). */
function TryMixPokeNewsShow(dest: PokeNews[], src: PokeNews, slot: number): boolean {
  let i = 0;
  if (src.kind == POKENEWS_NONE)
    return false;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (dest[i].kind == src.kind)
      return false;
  }
  dest[slot].kind = src.kind;
  dest[slot].state = POKENEWS_STATE_UPCOMING;
  dest[slot].dayCountdown = src.dayCountdown;
  return true;
}

/** 1:1 `static s8 GetPokeNewsSlotIfActive(PokeNews *pokeNews, u8 idx)` (tv.c:3925-3931). */
function GetPokeNewsSlotIfActive(pokeNews: PokeNews[], idx: number): number {
  if (pokeNews[idx].kind == POKENEWS_NONE)
    return -1;
  return idx;
}

/** 1:1 `static void ClearInvalidPokeNews(void)` (tv.c:3933-3943). */
function ClearInvalidPokeNews(): void {
  let i = 0;
  for (i = 0; i < POKE_NEWS_COUNT; i++)
  {
    if (gSaveBlock1Ptr.pokeNews[i].kind > POKENEWS_BLENDMASTER)
      ClearPokeNewsBySlot(i);
  }
  CompactPokeNews();
}

/** 1:1 `static void ClearPokeNewsIfGameNotComplete(void)` (tv.c:3945-3954). */
function ClearPokeNewsIfGameNotComplete(): void {
  let i = 0;
  if (!FlagGet(FLAG_SYS_GAME_CLEAR))
  {
    for (i = 0; i < POKE_NEWS_COUNT; i++)
      gSaveBlock1Ptr.pokeNews[i].state = POKENEWS_STATE_INACTIVE;
  }
}

// 1:1 macro tv.c:3956 `SetStrLanguage(strptr, langptr, langfix)` — écrit langptr
// (out-param) ; chez nous : RETOURNE la langue, les sites font `x.lang = SetStrLanguage(...)`.
const SetStrLanguage = (strptr: Uint8Array | string, langfix: number): number =>
  IsStringJapanese(strptr as never) ? LANGUAGE_JAPANESE : langfix;

/** 1:1 `static void TranslateShowNames(TVShow *show, u32 language)` (tv.c:3966-4029). */
function TranslateShowNames(show: TVShow, language: number): void {
  let i = 0;
  let shows: any = null;
  shows = ({} as any) /* TRANSPILER-TODO AllocZeroed */;
  for (i = 0; i < LAST_TVSHOW_IDX; i++)
  {
    switch (show[i].kind) {
      case TVSHOW_FAN_CLUB_LETTER:
      case TVSHOW_RECENT_HAPPENINGS:
        // NOTE: These two shows are assumed to have the same struct layout
        shows[0] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[0].language = SetStrLanguage(shows[0].playerName, language);
        break;
      case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
        shows[1] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[1].language = SetStrLanguage(shows[1].playerName, language);
        shows[1].pokemonNameLanguage = SetStrLanguage(shows[1].nickname, language);
        break;
      case TVSHOW_POKEMON_TODAY_CAUGHT:
        shows[6] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[6].language = SetStrLanguage(shows[6].playerName, language);
        shows[6].language2 = SetStrLanguage(shows[6].nickname, language);
        break;
      case TVSHOW_SMART_SHOPPER:
        shows[7] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[7].language = SetStrLanguage(shows[7].playerName, language);
        break;
      case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
        shows[5] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[5].playerLanguage = SetStrLanguage(shows[5].playerName, language);
        shows[5].opponentLanguage = SetStrLanguage(shows[5].opponentName, language);
        break;
      case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
        shows[4] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[4].language = SetStrLanguage(shows[4].playerName, language);
        shows[4].pokemonNameLanguage = SetStrLanguage(shows[4].pokemonNickname, language);
        break;
      case TVSHOW_NAME_RATER_SHOW:
        shows[3] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[3].language = SetStrLanguage(shows[3].trainerName, language);
        shows[3].pokemonNameLanguage = SetStrLanguage(shows[3].pokemonName, language);
        break;
      case TVSHOW_POKEMON_TODAY_FAILED:
        shows[2] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[2].language = SetStrLanguage(shows[2].playerName, language);
        break;
      case TVSHOW_FISHING_ADVICE:
        shows[8] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[8].language = SetStrLanguage(shows[8].playerName, language);
        break;
      case TVSHOW_WORLD_OF_MASTERS:
        shows[9] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[9].language = SetStrLanguage(shows[9].playerName, language);
        break;
      case TVSHOW_MASS_OUTBREAK:
        shows[10] = show[i] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
        shows[10].language = language;
        break;
    }
  }
  void shows /* Free — GC */;
}

/** 1:1 `void SanitizeTVShowsForRuby(TVShow *shows)` (tv.c:4031-4045). */
export function SanitizeTVShowsForRuby(shows: TVShow[]): void {
  let curShow: any = null;
  SanitizeTVShowLocationsForRuby(shows);
  for (let ci = 0; ci < LAST_TVSHOW_IDX; ci++) if ((curShow = shows[ci]) || true) // 1:1 `for (curShow = shows; curShow < shows + LAST_TVSHOW_IDX; curShow++)`
  {
    if (curShow.kind == TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE)
    {
      if ((curShow.playerLanguage == LANGUAGE_JAPANESE && curShow.opponentLanguage != LANGUAGE_JAPANESE) || (curShow.playerLanguage != LANGUAGE_JAPANESE && curShow.opponentLanguage == LANGUAGE_JAPANESE))
        copyTVShow(curShow, { kind: 0, active: 0 }); // 1:1 `memset(curShow, 0, sizeof(TVShow))`
    }
  }
}

/** 1:1 `static void TranslateRubyShows(TVShow *shows)` (tv.c:4047-4061). */
function TranslateRubyShows(shows: TVShow[]): void {
  let curShow: any = null;
  for (let ci = 0; ci < LAST_TVSHOW_IDX; ci++) if ((curShow = shows[ci]) || true) // 1:1 `for (curShow = shows; curShow < shows + LAST_TVSHOW_IDX; curShow++)`
  {
    if (curShow.kind == TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE)
    {
      if (IsStringJapanese(curShow.opponentName))
        curShow.opponentLanguage = LANGUAGE_JAPANESE;
      else
        curShow.opponentLanguage = GAME_LANGUAGE;
    }
  }
}

/** 1:1 `static u8 GetStringLanguage(u8 *str)` (tv.c:4063-4066). */
function GetStringLanguage(str: Uint8Array): number {
  return IsStringJapanese(str) ? LANGUAGE_JAPANESE : GAME_LANGUAGE;
}

/** 1:1 `static void TranslateJapaneseEmeraldShows(TVShow *shows)` (tv.c:4068-4175). */
function TranslateJapaneseEmeraldShows(shows: TVShow[]): void {
  let curShow: any = null;
  for (let ci = 0; ci < LAST_TVSHOW_IDX; ci++) if ((curShow = shows[ci]) || true) // 1:1 `for (curShow = shows; curShow < shows + LAST_TVSHOW_IDX; curShow++)`
  {
    switch (curShow.kind) {
      case TVSHOW_FAN_CLUB_LETTER:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_RECENT_HAPPENINGS:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.pokemonNameLanguage = GetStringLanguage(curShow.nickname);
        break;
      case TVSHOW_DUMMY:
        curShow.language = GetStringLanguage(curShow.name);
        break;
      case TVSHOW_NAME_RATER_SHOW:
        curShow.language = GetStringLanguage(curShow.trainerName);
        curShow.pokemonNameLanguage = GetStringLanguage(curShow.pokemonName);
        break;
      case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.pokemonNameLanguage = GetStringLanguage(curShow.pokemonNickname);
        break;
      case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
        curShow.playerLanguage = GetStringLanguage(curShow.playerName);
        curShow.opponentLanguage = GetStringLanguage(curShow.opponentName);
        break;
      case TVSHOW_CONTEST_LIVE_UPDATES:
        curShow.winningTrainerLanguage = GetStringLanguage(curShow.winningTrainerName);
        curShow.losingTrainerLanguage = GetStringLanguage(curShow.losingTrainerName);
        break;
      case TVSHOW_3_CHEERS_FOR_POKEBLOCKS:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.worstBlenderLanguage = GetStringLanguage(curShow.worstBlenderName);
        break;
      case TVSHOW_BATTLE_UPDATE:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.linkOpponentLanguage = GetStringLanguage(curShow.linkOpponentName);
        break;
      case TVSHOW_FAN_CLUB_SPECIAL:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.idolNameLanguage = GetStringLanguage(curShow.idolName);
        break;
      case TVSHOW_LILYCOVE_CONTEST_LADY:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.pokemonNameLanguage = GetStringLanguage(curShow.nickname);
        break;
      case TVSHOW_POKEMON_TODAY_CAUGHT:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.language2 = GetStringLanguage(curShow.nickname);
        break;
      case TVSHOW_SMART_SHOPPER:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_POKEMON_TODAY_FAILED:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_FISHING_ADVICE:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_WORLD_OF_MASTERS:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_TREND_WATCHER:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_BREAKING_NEWS:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_BATTLE_SEMINAR:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_FIND_THAT_GAMER:
      case TVSHOW_TRAINER_FAN_CLUB:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_CUTIES:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.pokemonNameLanguage = GetStringLanguage(curShow.nickname);
        break;
      case TVSHOW_TODAYS_RIVAL_TRAINER:
      case TVSHOW_SECRET_BASE_VISIT:
      case TVSHOW_FRONTIER:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_TREASURE_INVESTIGATORS:
      case TVSHOW_LOTTO_WINNER:
      case TVSHOW_NUMBER_ONE:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_SECRET_BASE_SECRETS:
        curShow.language = GetStringLanguage(curShow.playerName);
        curShow.baseOwnersNameLanguage = GetStringLanguage(curShow.baseOwnersName);
        break;
      case TVSHOW_SAFARI_FAN_CLUB:
        curShow.language = GetStringLanguage(curShow.playerName);
        break;
      case TVSHOW_MASS_OUTBREAK:
        break;
    }
  }
}

/** 1:1 `void SanitizeTVShowLocationsForRuby(TVShow *shows)` (tv.c:4177-4195). */
export function SanitizeTVShowLocationsForRuby(shows: TVShow[]): void {
  let i = 0;
  for (i = 0; i < LAST_TVSHOW_IDX; i++)
  {
    switch (shows[i].kind) {
      case TVSHOW_WORLD_OF_MASTERS:
        if (shows[i].location > KANTO_MAPSEC_START)
          ClearTVShowSlot(shows, i, 0); // 1:1 memset(&shows[i], 0, sizeof(TVShow))
        break;
      case TVSHOW_POKEMON_TODAY_FAILED:
        if (shows[i].location > KANTO_MAPSEC_START)
          ClearTVShowSlot(shows, i, 0); // 1:1 memset(&shows[i], 0, sizeof(TVShow))
        break;
    }
  }
}

// gSpecialVar_0x8004 here is set from GetRandomActiveShowIdx in EventScript_TryDoTVShow

/** 1:1 `void DoTVShow(void)` (tv.c:4198-4302). */
export function DoTVShow(): void {
  if (gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */].active)
  {
    switch (gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */].kind) {
      case TVSHOW_FAN_CLUB_LETTER:
        DoTVShowPokemonFanClubLetter();
        break;
      case TVSHOW_RECENT_HAPPENINGS:
        DoTVShowRecentHappenings();
        break;
      case TVSHOW_PKMN_FAN_CLUB_OPINIONS:
        DoTVShowPokemonFanClubOpinions();
        break;
      case TVSHOW_DUMMY:
        DoTVShowDummiedOut();
        break;
      case TVSHOW_MASS_OUTBREAK:
        DoTVShowPokemonNewsMassOutbreak();
        break;
      case TVSHOW_BRAVO_TRAINER_POKEMON_PROFILE:
        DoTVShowBravoTrainerPokemonProfile();
        break;
      case TVSHOW_BRAVO_TRAINER_BATTLE_TOWER_PROFILE:
        DoTVShowBravoTrainerBattleTower();
        break;
      case TVSHOW_POKEMON_TODAY_CAUGHT:
        DoTVShowPokemonTodaySuccessfulCapture();
        break;
      case TVSHOW_SMART_SHOPPER:
        DoTVShowTodaysSmartShopper();
        break;
      case TVSHOW_NAME_RATER_SHOW:
        DoTVShowTheNameRaterShow();
        break;
      case TVSHOW_CONTEST_LIVE_UPDATES:
        DoTVShowPokemonContestLiveUpdates();
        break;
      case TVSHOW_BATTLE_UPDATE:
        DoTVShowPokemonBattleUpdate();
        break;
      case TVSHOW_3_CHEERS_FOR_POKEBLOCKS:
        DoTVShow3CheersForPokeblocks();
        break;
      case TVSHOW_POKEMON_TODAY_FAILED:
        DoTVShowPokemonTodayFailedCapture();
        break;
      case TVSHOW_FISHING_ADVICE:
        DoTVShowPokemonAngler();
        break;
      case TVSHOW_WORLD_OF_MASTERS:
        DoTVShowTheWorldOfMasters();
        break;
      case TVSHOW_TODAYS_RIVAL_TRAINER:
        DoTVShowTodaysRivalTrainer();
        break;
      case TVSHOW_TREND_WATCHER:
        DoTVShowDewfordTrendWatcherNetwork();
        break;
      case TVSHOW_TREASURE_INVESTIGATORS:
        DoTVShowHoennTreasureInvestigators();
        break;
      case TVSHOW_FIND_THAT_GAMER:
        DoTVShowFindThatGamer();
        break;
      case TVSHOW_BREAKING_NEWS:
        DoTVShowBreakingNewsTV();
        break;
      case TVSHOW_SECRET_BASE_VISIT:
        DoTVShowSecretBaseVisit();
        break;
      case TVSHOW_LOTTO_WINNER:
        DoTVShowPokemonLotteryWinnerFlashReport();
        break;
      case TVSHOW_BATTLE_SEMINAR:
        DoTVShowThePokemonBattleSeminar();
        break;
      case TVSHOW_FAN_CLUB_SPECIAL:
        DoTVShowTrainerFanClubSpecial();
        break;
      case TVSHOW_TRAINER_FAN_CLUB:
        DoTVShowTrainerFanClub();
        break;
      case TVSHOW_CUTIES:
        DoTVShowSpotTheCuties();
        break;
      case TVSHOW_FRONTIER:
        DoTVShowPokemonNewsBattleFrontier();
        break;
      case TVSHOW_NUMBER_ONE:
        DoTVShowWhatsNo1InHoennToday();
        break;
      case TVSHOW_SECRET_BASE_SECRETS:
        DoTVShowSecretBaseSecrets();
        break;
      case TVSHOW_SAFARI_FAN_CLUB:
        DoTVShowSafariFanClub();
        break;
      case TVSHOW_LILYCOVE_CONTEST_LADY:
        DoTVShowLilycoveContestLady();
        break;
    }
  }
}

/** 1:1 `static void DoTVShowBravoTrainerPokemonProfile(void)` (tv.c:4304-4374). */
function DoTVShowBravoTrainerPokemonProfile(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyContestCategoryToStringVar(1, show.contestCategory);
      CopyContestRankToStringVar(2, show.contestRank);
      if (!StringCompare(encodeOwText(gSpeciesNames[show.species]), encodeOwText(show.pokemonNickname)))
        sTVShowState = 8;
      else
        sTVShowState = 1;
      break;
    case 1:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar2, show.pokemonNickname, show.pokemonNameLanguage);
      CopyContestCategoryToStringVar(2, show.contestCategory);
      sTVShowState = 2;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      if (show.contestResult == 0)
        sTVShowState = 3;
      else
        sTVShowState = 4;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyEasyChatWord(gStringVar2, show.words[0]);
      ConvertIntToDecimalString(2, show.contestResult + 1);
      sTVShowState = 5;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyEasyChatWord(gStringVar2, show.words[0]);
      ConvertIntToDecimalString(2, show.contestResult + 1);
      sTVShowState = 5;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyContestCategoryToStringVar(1, show.contestCategory);
      CopyEasyChatWord(gStringVar3, show.words[1]);
      if (show.move)
        sTVShowState = 6;
      else
        sTVShowState = 7;
      break;
    case 6:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      StringCopy(gStringVar2, encodeOwText(gMoveNames[show.move]));
      CopyEasyChatWord(gStringVar3, show.words[1]);
      sTVShowState = 7;
      break;
    case 7:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowDone();
      break;
    case 8:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      sTVShowState = 2;
      break;
  }
  ShowFieldMessage(getText(sTVBravoTrainerTextGroup[state])!);
}

// This is the TV show triggered by accepting the reporter's interview in the lobby of Battle Tower.

// The reporter had asked the player if they were satisfied or not with the challenge, and then asked

// for a one word Easy Chat description of their feelings about the challenge.

/** 1:1 `static void DoTVShowBravoTrainerBattleTower(void)` (tv.c:4379-4472). */
function DoTVShowBravoTrainerBattleTower(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case BRAVOTOWER_STATE_INTRO:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.playerLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      if (show.numFights >= FRONTIER_STAGES_PER_CHALLENGE)
        sTVShowState = BRAVOTOWER_STATE_NEW_RECORD;
      else
        sTVShowState = BRAVOTOWER_STATE_LOST;
      break;
    case BRAVOTOWER_STATE_NEW_RECORD:
      // The TV show states a "new record" was achieved as long as all the battles in the challenge were attempted,
      // regardless of any previous records or whether the final battle was won or lost.
      if (show.btLevel == FRONTIER_MAX_LEVEL_50)
        StringCopy(gStringVar1, encodeOwText(getString('gText_Lv50')));
      else
        StringCopy(gStringVar1, encodeOwText(getString('gText_OpenLevel')));
      ConvertIntToDecimalString(1, show.numFights);
      if (show.wonTheChallenge == 1)
        sTVShowState = BRAVOTOWER_STATE_WON;
      else
        sTVShowState = BRAVOTOWER_STATE_LOST_FINAL;
      break;
    case BRAVOTOWER_STATE_LOST:
      TVShowConvertInternationalString(gStringVar1, show.opponentName, show.opponentLanguage);
      ConvertIntToDecimalString(1, show.numFights + 1);
      if (show.interviewResponse == 0)
        sTVShowState = BRAVOTOWER_STATE_SATISFIED;
      else
        sTVShowState = BRAVOTOWER_STATE_UNSATISFIED;
      break;
    case BRAVOTOWER_STATE_WON:
      TVShowConvertInternationalString(gStringVar1, show.opponentName, show.opponentLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.defeatedSpecies]));
      if (show.interviewResponse == 0)
        sTVShowState = BRAVOTOWER_STATE_SATISFIED;
      else
        sTVShowState = BRAVOTOWER_STATE_UNSATISFIED;
      break;
    case BRAVOTOWER_STATE_LOST_FINAL:
      TVShowConvertInternationalString(gStringVar1, show.opponentName, show.opponentLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.defeatedSpecies]));
      if (show.interviewResponse == 0)
        sTVShowState = BRAVOTOWER_STATE_SATISFIED;
      else
        sTVShowState = BRAVOTOWER_STATE_UNSATISFIED;
      break;
    case BRAVOTOWER_STATE_SATISFIED:
      TVShowConvertInternationalString(gStringVar1, show.opponentName, show.opponentLanguage);
      sTVShowState = BRAVOTOWER_STATE_RESPONSE;
      break;
    case BRAVOTOWER_STATE_UNSATISFIED:
      TVShowConvertInternationalString(gStringVar1, show.opponentName, show.opponentLanguage);
      sTVShowState = BRAVOTOWER_STATE_RESPONSE;
      break;
    case BRAVOTOWER_STATE_UNUSED_1:
      sTVShowState = BRAVOTOWER_STATE_RESPONSE;
      break;
    case BRAVOTOWER_STATE_UNUSED_2:
    case BRAVOTOWER_STATE_UNUSED_3:
    case BRAVOTOWER_STATE_UNUSED_4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.playerLanguage);
      sTVShowState = BRAVOTOWER_STATE_RESPONSE;
      break;
    case BRAVOTOWER_STATE_RESPONSE:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      if (show.interviewResponse == 0)
        sTVShowState = BRAVOTOWER_STATE_RESPONSE_SATISFIED;
      else
        sTVShowState = BRAVOTOWER_STATE_RESPONSE_UNSATISFIED;
      break;
    case BRAVOTOWER_STATE_RESPONSE_SATISFIED:
    case BRAVOTOWER_STATE_RESPONSE_UNSATISFIED:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.playerLanguage);
      TVShowConvertInternationalString(gStringVar3, show.opponentName, show.opponentLanguage);
      sTVShowState = BRAVOTOWER_STATE_OUTRO;
      break;
    case BRAVOTOWER_STATE_OUTRO:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.playerLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVBravoTrainerBattleTowerTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTodaysSmartShopper(void)` (tv.c:4474-4568). */
function DoTVShowTodaysSmartShopper(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case SMARTSHOPPER_STATE_INTRO:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetMapName(gStringVar2, show.shopLocation, 0);
      if (show.itemAmounts[0] >= 255)
        sTVShowState = SMARTSHOPPER_STATE_CLERK_MAX;
      else
        sTVShowState = SMARTSHOPPER_STATE_CLERK_NORMAL;
      break;
    case SMARTSHOPPER_STATE_CLERK_NORMAL:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.itemIds[0])));
      ConvertIntToDecimalString(2, show.itemAmounts[0]);
      // Pick a random comment (SMARTSHOPPER_STATE_RAND_COMMENT_#)
      sTVShowState += SMARTSHOPPER_STATE_CLERK_NORMAL + (Random() % (SMARTSHOPPER_STATE_RAND_COMMENT_4 - SMARTSHOPPER_STATE_RAND_COMMENT_1 + 1));
      break;
    case SMARTSHOPPER_STATE_RAND_COMMENT_1:
    case SMARTSHOPPER_STATE_RAND_COMMENT_3:
    case SMARTSHOPPER_STATE_RAND_COMMENT_4:
      if (show.itemIds[1] != ITEM_NONE)
        sTVShowState = SMARTSHOPPER_STATE_SECOND_ITEM;
      else
        sTVShowState = SMARTSHOPPER_STATE_IS_VIP;
      break;
    case SMARTSHOPPER_STATE_RAND_COMMENT_2:
      ConvertIntToDecimalString(2, show.itemAmounts[0] + 1);
      if (show.itemIds[1] != ITEM_NONE)
        sTVShowState = SMARTSHOPPER_STATE_SECOND_ITEM;
      else
        sTVShowState = SMARTSHOPPER_STATE_IS_VIP;
      break;
    case SMARTSHOPPER_STATE_SECOND_ITEM:
      // Clerk describes 2nd type of item player purchased
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.itemIds[1])));
      ConvertIntToDecimalString(2, show.itemAmounts[1]);
      if (show.itemIds[2] != ITEM_NONE)
        sTVShowState = SMARTSHOPPER_STATE_THIRD_ITEM;
      else if (show.priceReduced == 1)
        sTVShowState = SMARTSHOPPER_STATE_DURING_SALE;
      else
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_NORMAL;
      break;
    case SMARTSHOPPER_STATE_THIRD_ITEM:
      // Clerk describes 3rd type of item player purchased
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.itemIds[2])));
      ConvertIntToDecimalString(2, show.itemAmounts[2]);
      if (show.priceReduced == 1)
        sTVShowState = SMARTSHOPPER_STATE_DURING_SALE;
      else
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_NORMAL;
      break;
    case SMARTSHOPPER_STATE_DURING_SALE:
      if (show.itemAmounts[0] >= 255)
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_MAX;
      else
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_NORMAL;
      break;
    case SMARTSHOPPER_STATE_OUTRO_NORMAL:
      SmartShopper_BufferPurchaseTotal(1, show);
      TVShowDone();
      break;
    case SMARTSHOPPER_STATE_IS_VIP:
      // Clerk says customer is a VIP
      // Said if player only purchased one type of item
      if (show.priceReduced == 1)
        sTVShowState = SMARTSHOPPER_STATE_DURING_SALE;
      else
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_NORMAL;
      break;
    case SMARTSHOPPER_STATE_CLERK_MAX:
      // Clerk's comments if player purchased maximum number of 1st item
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.itemIds[0])));
      if (show.priceReduced == 1)
        sTVShowState = SMARTSHOPPER_STATE_DURING_SALE;
      else
        sTVShowState = SMARTSHOPPER_STATE_OUTRO_MAX;
      break;
    case SMARTSHOPPER_STATE_OUTRO_MAX:
      // Outro comments if player purchased maximum number of 1st item
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVTodaysSmartShopperTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTheNameRaterShow(void)` (tv.c:4570-4654). */
function DoTVShowTheNameRaterShow(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.trainerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar3, show.pokemonName, show.pokemonNameLanguage);
      sTVShowState = GetRandomNameRaterStateFromName(show) + 1;
      break;
    case 1:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      if (show.random == 0)
        sTVShowState = 9;
      else if (show.random == 1)
        sTVShowState = 10;
      else if (show.random == 2)
        sTVShowState = 11;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.trainerName, show.language);
      if (show.random == 0)
        sTVShowState = 9;
      else if (show.random == 1)
        sTVShowState = 10;
      else if (show.random == 2)
        sTVShowState = 11;
      break;
    case 9:
    case 10:
    case 11:
      TVShowConvertInternationalString(gStringVar1, show.pokemonName, show.pokemonNameLanguage);
      GetNicknameSubstring(1, 0, 0, 1, 0, show);
      GetNicknameSubstring(2, 1, 0, 1, 0, show);
      sTVShowState = 12;
      break;
    case 13:
      TVShowConvertInternationalString(gStringVar1, show.trainerName, show.language);
      GetNicknameSubstring(1, 0, 2, 0, 0, show);
      GetNicknameSubstring(2, 0, 3, 1, 0, show);
      sTVShowState = 14;
      break;
    case 14:
      GetNicknameSubstring(1, 0, 2, 1, 0, show);
      GetNicknameSubstring(2, 0, 3, 0, 0, show);
      sTVShowState = 18;
      break;
    case 15:
      GetNicknameSubstring(0, 0, 2, 1, 0, show);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      GetNicknameSubstring(2, 0, 3, 2, show.species, show);
      sTVShowState = 16;
      break;
    case 16:
      GetNicknameSubstring(0, 0, 2, 2, show.species, show);
      GetNicknameSubstring(2, 0, 3, 1, 0, show);
      sTVShowState = 17;
      break;
    case 17:
      GetNicknameSubstring(0, 0, 2, 1, 0, show);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.randomSpecies]));
      GetNicknameSubstring(2, 0, 3, 2, show.randomSpecies, show);
      sTVShowState = 18;
      break;
    case 12:
      state = 18;
      sTVShowState = 18;
    case 18:
      TVShowConvertInternationalString(gStringVar1, show.pokemonName, show.pokemonNameLanguage);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVNameRaterTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonTodaySuccessfulCapture(void)` (tv.c:4656-4724). */
function DoTVShowPokemonTodaySuccessfulCapture(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar3, show.nickname, show.language2);
      if (show.ball == ITEM_MASTER_BALL)
        sTVShowState = 5;
      else
        sTVShowState = 1;
      break;
    case 1:
      sTVShowState = 2;
      break;
    case 2:
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.ball)));
      ConvertIntToDecimalString(2, show.nBallsUsed);
      if (show.nBallsUsed < 4)
        sTVShowState = 3;
      else
        sTVShowState = 4;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar3, show.nickname, show.language2);
      sTVShowState = 6;
      break;
    case 4:
      sTVShowState = 6;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      sTVShowState = 6;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar3, show.nickname, show.language2);
      sTVShowState += 1 + (Random() % 4);
      break;
    case 7:
    case 8:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.language2);
      GetRandomDifferentSpeciesAndNameSeenByPlayer(2, show.species);
      sTVShowState = 11;
      break;
    case 9:
    case 10:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.language2);
      sTVShowState = 11;
      break;
    case 11:
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVPokemonTodaySuccessfulTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonTodayFailedCapture(void)` (tv.c:4726-4769). */
function DoTVShowPokemonTodayFailedCapture(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      sTVShowState = 1;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetMapName(gStringVar2, show.location, 0);
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.species2]));
      if (show.outcome == 1)
        sTVShowState = 3;
      else
        sTVShowState = 2;
      break;
    case 2:
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.nBallsUsed);
      if (Random() % 3 == 0)
        sTVShowState = 5;
      else
        sTVShowState = 4;
      break;
    case 4:
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      sTVShowState = 6;
      break;
    case 6:
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVPokemonTodayFailedTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonFanClubLetter(void)` (tv.c:4771-4823). */
function DoTVShowPokemonFanClubLetter(): void {
  let show: any = null;
  let state = 0;
  let rval = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      sTVShowState = 50;
      break;
    case 1:
      rval = (Random() % 4) + 1;
      if (rval == 1)
        sTVShowState = 2;
      else
        sTVShowState = rval + 2;
      break;
    case 2:
      sTVShowState = 51;
      break;
    case 3:
      sTVShowState += (Random() % 3) + 1;
      break;
    case 4:
    case 5:
    case 6:
      GetRandomWordFromShow(show);
      sTVShowState = 7;
      break;
    case 7:
      rval = (Random() % 0x1f) + 0x46;
      ConvertIntToDecimalString(2, rval);
      TVShowDone();
      break;
    case 50:
      ConvertEasyChatWordsToString(gStringVar4, show.words, 2, 2);
      ShowFieldMessage(gStringVar4);
      sTVShowState = 1;
      return;
    case 51:
      ConvertEasyChatWordsToString(gStringVar4, show.words, 2, 2);
      ShowFieldMessage(gStringVar4);
      sTVShowState = 3;
      return;
  }
  ShowFieldMessage(getText(sTVFanClubTextGroup[state])!);
}

/** 1:1 `static void DoTVShowRecentHappenings(void)` (tv.c:4825-4858). */
function DoTVShowRecentHappenings(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetRandomWordFromShow(show);
      sTVShowState = 50;
      break;
    case 1:
      sTVShowState += 1 + (Random() % 3);
      break;
    case 2:
    case 3:
    case 4:
      sTVShowState = 5;
      break;
    case 5:
      TVShowDone();
      break;
    case 50:
      ConvertEasyChatWordsToString(gStringVar4, show.words, 2, 2);
      ShowFieldMessage(gStringVar4);
      sTVShowState = 1;
      return;
  }
  ShowFieldMessage(getText(sTVRecentHappeninssTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonFanClubOpinions(void)` (tv.c:4860-4891). */
function DoTVShowPokemonFanClubOpinions(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      TVShowConvertInternationalString(gStringVar3, show.nickname, show.pokemonNameLanguage);
      sTVShowState = show.questionAsked + 1;
      break;
    case 1:
    case 2:
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      CopyEasyChatWord(gStringVar3, show.words[0]);
      sTVShowState = 4;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyEasyChatWord(gStringVar3, show.words[1]);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVFanClubOpinionsTextGroup[state])!);
}

/** 1:1 `static void DoTVShowDummiedOut(void)` (tv.c:4893-4896). */
function DoTVShowDummiedOut(): void {
}

/** 1:1 `static void DoTVShowPokemonNewsMassOutbreak(void)` (tv.c:4898-4908). */
function DoTVShowPokemonNewsMassOutbreak(): void {
  let show: any = null;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  GetMapName(gStringVar1, show.locationMapNum, 0);
  StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
  TVShowDone();
  StartMassOutbreak();
  ShowFieldMessage(getText(sTVMassOutbreakTextGroup[sTVShowState])!);
}

// TV Show that plays after a Link Contest.

// First talks about the winner and something they did, then about a losing player and something they did

// The show is only generated when the player wins, but can be record mixed to other games

// Each state buffers any needed data for a message to print from sTVContestLiveUpdatesTextGroup

// Many cases in this function are identical, and its size can be reduced a good deal by collapsing them

// Can't get this to match while collapsing them though

/** 1:1 `static void DoTVShowPokemonContestLiveUpdates(void)` (tv.c:4916-5256). */
function DoTVShowPokemonContestLiveUpdates(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case CONTESTLIVE_STATE_INTRO:
      BufferContestName(gStringVar1, show.category);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      TVShowConvertInternationalString(gStringVar3, show.winningTrainerName, show.winningTrainerLanguage);
      if (show.round1Placing == show.round2Placing)
      {
        if (show.round1Placing == 0)
          sTVShowState = CONTESTLIVE_STATE_WON_BOTH_ROUNDS;
        else
          sTVShowState = CONTESTLIVE_STATE_EQUAL_ROUNDS;
      }
      else if (show.round1Placing > show.round2Placing)
      {
        sTVShowState = CONTESTLIVE_STATE_BETTER_ROUND2;
      }
      else
      {
        sTVShowState = CONTESTLIVE_STATE_BETTER_ROUND1;
      }
      break;
    case CONTESTLIVE_STATE_WON_BOTH_ROUNDS:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      switch (show.winnerAppealFlag) {
        case CONTESTLIVE_FLAG_EXCITING_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_GOT_NERVOUS:
          sTVShowState = CONTESTLIVE_STATE_GOT_NERVOUS;
          break;
        case CONTESTLIVE_FLAG_MAXED_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_VERY_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_USED_COMBO:
          sTVShowState = CONTESTLIVE_STATE_USED_COMBO;
          break;
        case CONTESTLIVE_FLAG_STARTLED_OTHER:
          sTVShowState = CONTESTLIVE_STATE_STARTLED_OTHER;
          break;
        case CONTESTLIVE_FLAG_SKIPPED_TURN:
          sTVShowState = CONTESTLIVE_STATE_TOOK_BREAK;
          break;
        case CONTESTLIVE_FLAG_GOT_STARTLED:
          sTVShowState = CONTESTLIVE_STATE_GOT_STARTLED;
          break;
        case CONTESTLIVE_FLAG_MADE_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_USED_MOVE;
          break;
      }
      break;
    case CONTESTLIVE_STATE_BETTER_ROUND2:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      switch (show.winnerAppealFlag) {
        case CONTESTLIVE_FLAG_EXCITING_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_GOT_NERVOUS:
          sTVShowState = CONTESTLIVE_STATE_GOT_NERVOUS;
          break;
        case CONTESTLIVE_FLAG_MAXED_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_VERY_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_USED_COMBO:
          sTVShowState = CONTESTLIVE_STATE_USED_COMBO;
          break;
        case CONTESTLIVE_FLAG_STARTLED_OTHER:
          sTVShowState = CONTESTLIVE_STATE_STARTLED_OTHER;
          break;
        case CONTESTLIVE_FLAG_SKIPPED_TURN:
          sTVShowState = CONTESTLIVE_STATE_TOOK_BREAK;
          break;
        case CONTESTLIVE_FLAG_GOT_STARTLED:
          sTVShowState = CONTESTLIVE_STATE_GOT_STARTLED;
          break;
        case CONTESTLIVE_FLAG_MADE_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_USED_MOVE;
          break;
      }
      break;
    case CONTESTLIVE_STATE_EQUAL_ROUNDS:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      TVShowConvertInternationalString(gStringVar3, show.winningTrainerName, show.winningTrainerLanguage);
      switch (show.winnerAppealFlag) {
        case CONTESTLIVE_FLAG_EXCITING_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_GOT_NERVOUS:
          sTVShowState = CONTESTLIVE_STATE_GOT_NERVOUS;
          break;
        case CONTESTLIVE_FLAG_MAXED_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_VERY_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_USED_COMBO:
          sTVShowState = CONTESTLIVE_STATE_USED_COMBO;
          break;
        case CONTESTLIVE_FLAG_STARTLED_OTHER:
          sTVShowState = CONTESTLIVE_STATE_STARTLED_OTHER;
          break;
        case CONTESTLIVE_FLAG_SKIPPED_TURN:
          sTVShowState = CONTESTLIVE_STATE_TOOK_BREAK;
          break;
        case CONTESTLIVE_FLAG_GOT_STARTLED:
          sTVShowState = CONTESTLIVE_STATE_GOT_STARTLED;
          break;
        case CONTESTLIVE_FLAG_MADE_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_USED_MOVE;
          break;
      }
      break;
    case CONTESTLIVE_STATE_BETTER_ROUND1:
      switch (show.category) {
        case CONTEST_CATEGORY_COOL:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Cool')));
          break;
        case CONTEST_CATEGORY_BEAUTY:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Beauty')));
          break;
        case CONTEST_CATEGORY_CUTE:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Cute')));
          break;
        case CONTEST_CATEGORY_SMART:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Smart')));
          break;
        case CONTEST_CATEGORY_TOUGH:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Tough')));
          break;
      }
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      switch (show.winnerAppealFlag) {
        case CONTESTLIVE_FLAG_EXCITING_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_GOT_NERVOUS:
          sTVShowState = CONTESTLIVE_STATE_GOT_NERVOUS;
          break;
        case CONTESTLIVE_FLAG_MAXED_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_VERY_EXCITING_APPEAL;
          break;
        case CONTESTLIVE_FLAG_USED_COMBO:
          sTVShowState = CONTESTLIVE_STATE_USED_COMBO;
          break;
        case CONTESTLIVE_FLAG_STARTLED_OTHER:
          sTVShowState = CONTESTLIVE_STATE_STARTLED_OTHER;
          break;
        case CONTESTLIVE_FLAG_SKIPPED_TURN:
          sTVShowState = CONTESTLIVE_STATE_TOOK_BREAK;
          break;
        case CONTESTLIVE_FLAG_GOT_STARTLED:
          sTVShowState = CONTESTLIVE_STATE_GOT_STARTLED;
          break;
        case CONTESTLIVE_FLAG_MADE_APPEAL:
          sTVShowState = CONTESTLIVE_STATE_USED_MOVE;
          break;
      }
      break;
    case CONTESTLIVE_STATE_GOT_NERVOUS:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_STARTLED_OTHER:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_USED_COMBO:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_EXCITING_APPEAL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      switch (show.category) {
        case CONTEST_CATEGORY_COOL:
          sTVShowState = CONTESTLIVE_STATE_COOL;
          break;
        case CONTEST_CATEGORY_BEAUTY:
          sTVShowState = CONTESTLIVE_STATE_BEAUTIFUL;
          break;
        case CONTEST_CATEGORY_CUTE:
          sTVShowState = CONTESTLIVE_STATE_CUTE;
          break;
        case CONTEST_CATEGORY_SMART:
          sTVShowState = CONTESTLIVE_STATE_SMART;
          break;
        case CONTEST_CATEGORY_TOUGH:
          sTVShowState = CONTESTLIVE_STATE_TOUGH;
          break;
      }
      break;
    case CONTESTLIVE_STATE_COOL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_BEAUTIFUL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_CUTE:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_SMART:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_TOUGH:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_VERY_EXCITING_APPEAL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      switch (show.category) {
        case CONTEST_CATEGORY_COOL:
          sTVShowState = CONTESTLIVE_STATE_VERY_COOL;
          break;
        case CONTEST_CATEGORY_BEAUTY:
          sTVShowState = CONTESTLIVE_STATE_VERY_BEAUTIFUL;
          break;
        case CONTEST_CATEGORY_CUTE:
          sTVShowState = CONTESTLIVE_STATE_VERY_CUTE;
          break;
        case CONTEST_CATEGORY_SMART:
          sTVShowState = CONTESTLIVE_STATE_VERY_SMART;
          break;
        case CONTEST_CATEGORY_TOUGH:
          sTVShowState = CONTESTLIVE_STATE_VERY_TOUGH;
          break;
      }
      break;
    case CONTESTLIVE_STATE_VERY_COOL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_VERY_BEAUTIFUL:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_VERY_CUTE:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_VERY_SMART:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_VERY_TOUGH:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_TOOK_BREAK:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_GOT_STARTLED:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_USED_MOVE:
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.move]));
      sTVShowState = CONTESTLIVE_STATE_TALK_ABOUT_LOSER;
      break;
    case CONTESTLIVE_STATE_TALK_ABOUT_LOSER:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.winningSpecies]));
      TVShowConvertInternationalString(gStringVar2, show.losingTrainerName, show.losingTrainerLanguage);
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.losingSpecies]));
      switch (show.loserAppealFlag) {
        case CONTESTLIVE_FLAG_LOST:
          sTVShowState = CONTESTLIVE_STATE_LOST;
          break;
        case CONTESTLIVE_FLAG_REPEATED_MOVE:
          sTVShowState = CONTESTLIVE_STATE_REPEATED_APPEALS;
          break;
        case CONTESTLIVE_FLAG_LOST_SMALL_MARGIN:
          sTVShowState = CONTESTLIVE_STATE_LOST_SMALL_MARGIN;
          break;
        case CONTESTLIVE_FLAG_NO_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_NO_EXCITING_APPEALS;
          break;
        case CONTESTLIVE_FLAG_BLEW_LEAD:
          sTVShowState = CONTESTLIVE_STATE_LOST_AFTER_ROUND1_WIN;
          break;
        case CONTESTLIVE_FLAG_MISSED_EXCITEMENT:
          sTVShowState = CONTESTLIVE_STATE_NOT_EXCITING_ENOUGH;
          break;
        case CONTESTLIVE_FLAG_LAST_BOTH_ROUNDS:
          sTVShowState = CONTESTLIVE_STATE_LAST_BOTH;
          break;
        case CONTESTLIVE_FLAG_NO_APPEALS:
          sTVShowState = CONTESTLIVE_STATE_NO_APPEALS;
          break;
      }
      break;
    case CONTESTLIVE_STATE_NO_APPEALS:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.losingSpecies]));
      sTVShowState = CONTESTLIVE_STATE_OUTRO;
      break;
    case CONTESTLIVE_STATE_LAST_BOTH:
      TVShowConvertInternationalString(gStringVar1, show.losingTrainerName, show.losingTrainerLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.losingSpecies]));
      sTVShowState = CONTESTLIVE_STATE_OUTRO;
      break;
    case CONTESTLIVE_STATE_NO_EXCITING_APPEALS:
      sTVShowState = CONTESTLIVE_STATE_OUTRO;
      break;
    case CONTESTLIVE_STATE_LOST_SMALL_MARGIN:
      TVShowConvertInternationalString(gStringVar1, show.winningTrainerName, show.winningTrainerLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      TVShowConvertInternationalString(gStringVar3, show.losingTrainerName, show.losingTrainerLanguage);
      sTVShowState = CONTESTLIVE_STATE_OUTRO;
      break;
    case CONTESTLIVE_STATE_NOT_EXCITING_ENOUGH:
    case CONTESTLIVE_STATE_LOST_AFTER_ROUND1_WIN:
    case CONTESTLIVE_STATE_REPEATED_APPEALS:
    case CONTESTLIVE_STATE_LOST:
      TVShowConvertInternationalString(gStringVar1, show.losingTrainerName, show.losingTrainerLanguage);
      sTVShowState = CONTESTLIVE_STATE_OUTRO;
      break;
    case CONTESTLIVE_STATE_OUTRO:
      TVShowConvertInternationalString(gStringVar1, show.winningTrainerName, show.winningTrainerLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.winningSpecies]));
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVContestLiveUpdatesTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonBattleUpdate(void)` (tv.c:5258-5328). */
function DoTVShowPokemonBattleUpdate(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      switch (show.battleType) {
        case 0:
        case 1:
          sTVShowState = 1;
          break;
        case 2:
          sTVShowState = 5;
          break;
      }
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.linkOpponentName, show.linkOpponentLanguage);
      if (show.battleType == 0)
      {
        StringCopy(gStringVar3, encodeOwText(getString('gText_Single')));
      }
      else
      {
        StringCopy(gStringVar3, encodeOwText(getString('gText_Double')));
      }
      sTVShowState = 2;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.speciesPlayer]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.move]));
      sTVShowState = 3;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.linkOpponentName, show.linkOpponentLanguage);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.speciesOpponent]));
      sTVShowState = 4;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.linkOpponentName, show.linkOpponentLanguage);
      TVShowDone();
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.linkOpponentName, show.linkOpponentLanguage);
      sTVShowState = 6;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.speciesPlayer]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.move]));
      sTVShowState = 7;
      break;
    case 7:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.linkOpponentName, show.linkOpponentLanguage);
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.speciesOpponent]));
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVPokemonBattleUpdateTextGroup[state])!);
}

/** 1:1 `static void DoTVShow3CheersForPokeblocks(void)` (tv.c:5330-5425). */
function DoTVShow3CheersForPokeblocks(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      if (show.sheen > 20)
        sTVShowState = 1;
      else
        sTVShowState = 3;
      break;
    case 1:
      switch (show.flavor) {
        case 0:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Spicy2')));
          break;
        case 1:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Dry2')));
          break;
        case 2:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Sweet2')));
          break;
        case 3:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Bitter2')));
          break;
        case 4:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Sour2')));
          break;
      }
      if (show.sheen > 24)
      {
        StringCopy(gStringVar2, encodeOwText(getString('gText_Excellent')));
      }
      else if (show.sheen > 22)
      {
        StringCopy(gStringVar2, encodeOwText(getString('gText_VeryGood')));
      }
      else
      {
        StringCopy(gStringVar2, encodeOwText(getString('gText_Good')));
      }
      TVShowConvertInternationalString(gStringVar3, show.playerName, show.language);
      sTVShowState = 2;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.worstBlenderName, show.worstBlenderLanguage);
      sTVShowState = 5;
      break;
    case 3:
      switch (show.flavor) {
        case 0:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Spicy2')));
          break;
        case 1:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Dry2')));
          break;
        case 2:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Sweet2')));
          break;
        case 3:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Bitter2')));
          break;
        case 4:
          StringCopy(gStringVar1, encodeOwText(getString('gText_Sour2')));
          break;
      }
      if (show.sheen > 16)
        StringCopy(gStringVar2, encodeOwText(getString('gText_SoSo')));
      else if (show.sheen > 13)
        StringCopy(gStringVar2, encodeOwText(getString('gText_Bad')));
      else
        StringCopy(gStringVar2, encodeOwText(getString('gText_TheWorst')));
      TVShowConvertInternationalString(gStringVar3, show.playerName, show.language);
      sTVShowState = 4;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.worstBlenderName, show.worstBlenderLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      sTVShowState = 5;
      break;
    case 5:
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTV3CheersForPokeblocksTextGroup[state])!);
}

/** 1:1 `void DoTVShowInSearchOfTrainers(void)` (tv.c:5427-5479). */
export function DoTVShowInSearchOfTrainers(): void {
  let state = 0;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      GetMapName(gStringVar1, gSaveBlock1Ptr.gabbyAndTyData.mapnum, 0);
      if (gSaveBlock1Ptr.gabbyAndTyData.battleNum > 1)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 1:
      sTVShowState = 2;
      break;
    case 2:
      if (!gSaveBlock1Ptr.gabbyAndTyData.battleTookMoreThanOneTurn)
        sTVShowState = 4;
      else if (gSaveBlock1Ptr.gabbyAndTyData.playerThrewABall)
        sTVShowState = 5;
      else if (gSaveBlock1Ptr.gabbyAndTyData.playerUsedHealingItem)
        sTVShowState = 6;
      else if (gSaveBlock1Ptr.gabbyAndTyData.playerLostAMon)
        sTVShowState = 7;
      else
        sTVShowState = 3;
      break;
    case 3:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[gSaveBlock1Ptr.gabbyAndTyData.mon1]));
      StringCopy(gStringVar2, encodeOwText(gMoveNames[gSaveBlock1Ptr.gabbyAndTyData.lastMove]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[gSaveBlock1Ptr.gabbyAndTyData.mon2]));
      sTVShowState = 8;
      break;
    case 4:
    case 5:
    case 6:
    case 7:
      sTVShowState = 8;
      break;
    case 8:
      CopyEasyChatWord(gStringVar1, gSaveBlock1Ptr.gabbyAndTyData.quote[0]);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[gSaveBlock1Ptr.gabbyAndTyData.mon1]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[gSaveBlock1Ptr.gabbyAndTyData.mon2]));
      VarSet(0x800D /* gSpecialVar_Result */, +(true));
      sTVShowState = 0;
      TakeGabbyAndTyOffTheAir();
      break;
  }
  ShowFieldMessage(getText(sTVInSearchOfTrainersTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonAngler(void)` (tv.c:5481-5509). */
function DoTVShowPokemonAngler(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  if (show.nBites < show.nFails)
    sTVShowState = 0;
  else
    sTVShowState = 1;
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      ConvertIntToDecimalString(2, show.nFails);
      TVShowDone();
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      ConvertIntToDecimalString(2, show.nBites);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVPokemonAnglerTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTheWorldOfMasters(void)` (tv.c:5511-5539). */
function DoTVShowTheWorldOfMasters(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.steps);
      ConvertIntToDecimalString(2, show.numPokeCaught);
      sTVShowState = 1;
      break;
    case 1:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      sTVShowState = 2;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetMapName(gStringVar2, show.location, 0);
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.caughtPoke]));
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVWorldOfMastersTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTodaysRivalTrainer(void)` (tv.c:5541-5658). */
function DoTVShowTodaysRivalTrainer(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      switch (show.location) {
        default:
          sTVShowState = 7;
          break;
        case MAPSEC_SECRET_BASE:
          sTVShowState = 8;
          break;
        case MAPSEC_DYNAMIC:
          switch (show.mapLayoutId) {
            case LAYOUT_SS_TIDAL_CORRIDOR:
            case LAYOUT_SS_TIDAL_LOWER_DECK:
            case LAYOUT_SS_TIDAL_ROOMS:
              sTVShowState = 10;
              break;
            default:
              sTVShowState = 9;
              break;
          }
          break;
      }
      break;
    case 7:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.dexCount);
      GetMapName(gStringVar3, show.location, 0);
      if (show.badgeCount != 0)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 8:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.dexCount);
      if (show.badgeCount != 0)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 9:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.dexCount);
      if (show.badgeCount != 0)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 10:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.dexCount);
      if (show.badgeCount != 0)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 1:
      ConvertIntToDecimalString(0, show.badgeCount);
      if (FlagGet(FLAG_LANDMARK_BATTLE_FRONTIER))
      {
        if (show.nSilverSymbols || show.nGoldSymbols)
          sTVShowState = 4;
        else
          sTVShowState = 3;
      }
      else
      {
        sTVShowState = 6;
      }
      break;
    case 2:
      if (FlagGet(FLAG_LANDMARK_BATTLE_FRONTIER))
      {
        if (show.nSilverSymbols || show.nGoldSymbols)
          sTVShowState = 4;
        else
          sTVShowState = 3;
      }
      else
      {
        sTVShowState = 6;
      }
      break;
    case 3:
      if (show.battlePoints == 0)
        sTVShowState = 6;
      else
        sTVShowState = 5;
      break;
    case 4:
      ConvertIntToDecimalString(0, show.nGoldSymbols);
      ConvertIntToDecimalString(1, show.nSilverSymbols);
      if (show.battlePoints == 0)
        sTVShowState = 6;
      else
        sTVShowState = 5;
      break;
    case 5:
      ConvertIntToDecimalString(0, show.battlePoints);
      sTVShowState = 6;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowDone();
  }
  ShowFieldMessage(getText(sTVTodaysRivalTrainerTextGroup[state])!);
}

/** 1:1 `static void DoTVShowDewfordTrendWatcherNetwork(void)` (tv.c:5660-5706). */
function DoTVShowDewfordTrendWatcherNetwork(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case TRENDWATCHER_STATE_INTRO:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      CopyEasyChatWord(gStringVar2, show.words[1]);
      if (show.gender == MALE)
        sTVShowState = TRENDWATCHER_STATE_TAUGHT_MALE;
      else
        sTVShowState = TRENDWATCHER_STATE_TAUGHT_FEMALE;
      break;
    case TRENDWATCHER_STATE_TAUGHT_MALE:
    case TRENDWATCHER_STATE_TAUGHT_FEMALE:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      CopyEasyChatWord(gStringVar2, show.words[1]);
      TVShowConvertInternationalString(gStringVar3, show.playerName, show.language);
      sTVShowState = TRENDWATCHER_STATE_PHRASE_HOPELESS;
      break;
    case TRENDWATCHER_STATE_PHRASE_HOPELESS:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      CopyEasyChatWord(gStringVar2, show.words[1]);
      if (show.gender == MALE)
        sTVShowState = TRENDWATCHER_STATE_BIGGER_MALE;
      else
        sTVShowState = TRENDWATCHER_STATE_BIGGER_FEMALE;
      break;
    case TRENDWATCHER_STATE_BIGGER_MALE:
    case TRENDWATCHER_STATE_BIGGER_FEMALE:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      CopyEasyChatWord(gStringVar2, show.words[1]);
      TVShowConvertInternationalString(gStringVar3, show.playerName, show.language);
      sTVShowState = TRENDWATCHER_STATE_OUTRO;
      break;
    case TRENDWATCHER_STATE_OUTRO:
      CopyEasyChatWord(gStringVar1, show.words[0]);
      CopyEasyChatWord(gStringVar2, show.words[1]);
      TVShowDone();
  }
  ShowFieldMessage(getText(sTVDewfordTrendWatcherNetworkTextGroup[state])!);
}

/** 1:1 `static void DoTVShowHoennTreasureInvestigators(void)` (tv.c:5708-5752). */
function DoTVShowHoennTreasureInvestigators(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      StringCopy(gStringVar1, encodeOwText(GetItemName(show.item)));
      if (show.location == MAPSEC_DYNAMIC)
      {
        switch (show.mapLayoutId) {
          case LAYOUT_SS_TIDAL_CORRIDOR:
          case LAYOUT_SS_TIDAL_LOWER_DECK:
          case LAYOUT_SS_TIDAL_ROOMS:
            sTVShowState = 2;
            break;
          default:
            sTVShowState = 1;
            break;
        }
      }
      else
      {
        sTVShowState = 1;
      }
      break;
    case 1:
      StringCopy(gStringVar1, encodeOwText(GetItemName(show.item)));
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      GetMapName(gStringVar3, show.location, 0);
      TVShowDone();
      break;
    case 2:
      StringCopy(gStringVar1, encodeOwText(GetItemName(show.item)));
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVHoennTreasureInvestisatorsTextGroup[state])!);
}

/** 1:1 `static void DoTVShowFindThatGamer(void)` (tv.c:5754-5822). */
function DoTVShowFindThatGamer(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      switch (show.whichGame) {
        case 0:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Slots')));
          break;
        case 1:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Roulette')));
          break;
      }
      if (show.won == 1)
        sTVShowState = 1;
      else
        sTVShowState = 2;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      switch (show.whichGame) {
        case 0:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Slots')));
          break;
        case 1:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Roulette')));
          break;
      }
      ConvertIntToDecimalString(2, show.nCoins);
      TVShowDone();
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      switch (show.whichGame) {
        case 0:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Slots')));
          break;
        case 1:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Roulette')));
          break;
      }
      ConvertIntToDecimalString(2, show.nCoins);
      sTVShowState = 3;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      switch (show.whichGame) {
        case 0:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Roulette')));
          break;
        case 1:
          StringCopy(gStringVar2, encodeOwText(getString('gText_Slots')));
          break;
      }
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVFindThatGamerTextGroup[state])!);
}

/** 1:1 `static void DoTVShowBreakingNewsTV(void)` (tv.c:5824-5917). */
function DoTVShowBreakingNewsTV(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      if (show.outcome == 0)
        sTVShowState = 1;
      else
        sTVShowState = 5;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      GetMapName(gStringVar3, show.location, 0);
      sTVShowState = 2;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.poke1Species]));
      sTVShowState = 3;
      break;
    case 3:
      ConvertIntToDecimalString(0, show.balls);
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.caughtMonBall)));
      sTVShowState = 4;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetMapName(gStringVar2, show.location, 0);
      TVShowDone();
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      GetMapName(gStringVar3, show.location, 0);
      sTVShowState = 6;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.poke1Species]));
      switch (show.outcome) {
        case 1:
          if (show.lastUsedMove == MOVE_NONE)
            sTVShowState = 12;
          else
            sTVShowState = 7;
          break;
        case 2:
          sTVShowState = 9;
          break;
        case 3:
          sTVShowState = 10;
          break;
      }
      break;
    case 7:
      StringCopy(gStringVar1, encodeOwText(gMoveNames[show.lastUsedMove]));
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.poke1Species]));
      sTVShowState = 8;
      break;
    case 12:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.poke1Species]));
      sTVShowState = 8;
      break;
    case 8:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      GetMapName(gStringVar2, show.location, 0);
      sTVShowState = 11;
      break;
    case 9:
    case 10:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.lastOpponentSpecies]));
      GetMapName(gStringVar3, show.location, 0);
      sTVShowState = 11;
      break;
    case 11:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVBreakingNewsTextGroup[state])!);
}

/** 1:1 `static void DoTVShowSecretBaseVisit(void)` (tv.c:5919-5997). */
function DoTVShowSecretBaseVisit(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      if (show.numDecorations == 0)
        sTVShowState = 2;
      else
        sTVShowState = 1;
      break;
    case 1:
      StringCopy(gStringVar2, encodeOwText(gDecorations[show.decorations[0]].name));
      if (show.numDecorations == 1)
        sTVShowState = 4;
      else
        sTVShowState = 3;
      break;
    case 3:
      StringCopy(gStringVar2, encodeOwText(gDecorations[show.decorations[1]].name));
      switch (show.numDecorations) {
        case 2:
          sTVShowState = 7;
          break;
        case 3:
          sTVShowState = 6;
          break;
        case 4:
          sTVShowState = 5;
          break;
      }
      break;
    case 5:
      StringCopy(gStringVar2, encodeOwText(gDecorations[show.decorations[2]].name));
      StringCopy(gStringVar3, encodeOwText(gDecorations[show.decorations[3]].name));
      sTVShowState = 8;
      break;
    case 6:
      StringCopy(gStringVar2, encodeOwText(gDecorations[show.decorations[2]].name));
      sTVShowState = 8;
      break;
    case 2:
    case 4:
    case 7:
      sTVShowState = 8;
      break;
    case 8:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      if (show.avgLevel < 25)
        sTVShowState = 12;
      else if (show.avgLevel < 50)
        sTVShowState = 11;
      else if (show.avgLevel < 70)
        sTVShowState = 10;
      else
        sTVShowState = 9;
      break;
    case 9:
    case 10:
    case 11:
    case 12:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.move]));
      sTVShowState = 13;
      break;
    case 13:
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVSecretBaseVisitTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonLotteryWinnerFlashReport(void)` (tv.c:5999-6019). */
function DoTVShowPokemonLotteryWinnerFlashReport(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
  if (show.whichPrize == 0)
    StringCopy(gStringVar2, encodeOwText(getString('gText_Jackpot')));
  else if (show.whichPrize == 1)
    StringCopy(gStringVar2, encodeOwText(getString('gText_First')));
  else if (show.whichPrize == 2)
    StringCopy(gStringVar2, encodeOwText(getString('gText_Second')));
  else
    StringCopy(gStringVar2, encodeOwText(getString('gText_Third')));
  StringCopy(gStringVar3, encodeOwText(GetItemName(show.item)));
  TVShowDone();
  ShowFieldMessage(getText(sTVPokemonLotteryWinnerFlashReportTextGroup[state])!);
}

/** 1:1 `static void DoTVShowThePokemonBattleSeminar(void)` (tv.c:6021-6083). */
function DoTVShowThePokemonBattleSeminar(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.foeSpecies]));
      sTVShowState = 1;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.foeSpecies]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.move]));
      sTVShowState = 2;
      break;
    case 2:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species]));
      switch (show.nOtherMoves) {
        case 1:
          sTVShowState = 5;
          break;
        case 2:
          sTVShowState = 4;
          break;
        case 3:
          sTVShowState = 3;
          break;
        default:
          sTVShowState = 6;
          break;
      }
      break;
    case 3:
      StringCopy(gStringVar1, encodeOwText(gMoveNames[show.otherMoves[0]]));
      StringCopy(gStringVar2, encodeOwText(gMoveNames[show.otherMoves[1]]));
      StringCopy(gStringVar3, encodeOwText(gMoveNames[show.otherMoves[2]]));
      sTVShowState = 6;
      break;
    case 4:
      StringCopy(gStringVar1, encodeOwText(gMoveNames[show.otherMoves[0]]));
      StringCopy(gStringVar2, encodeOwText(gMoveNames[show.otherMoves[1]]));
      sTVShowState = 6;
      break;
    case 5:
      StringCopy(gStringVar2, encodeOwText(gMoveNames[show.otherMoves[0]]));
      sTVShowState = 6;
      break;
    case 6:
      StringCopy(gStringVar1, encodeOwText(gMoveNames[show.betterMove]));
      StringCopy(gStringVar2, encodeOwText(gMoveNames[show.move]));
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVThePokemonBattleSeminarTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTrainerFanClubSpecial(void)` (tv.c:6085-6140). */
function DoTVShowTrainerFanClubSpecial(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      CopyEasyChatWord(gStringVar3, show.words[0]);
      if (show.score >= 90)
        sTVShowState = 1;
      else if (show.score >= 70)
        sTVShowState = 2;
      else if (show.score >= 30)
        sTVShowState = 3;
      else
        sTVShowState = 4;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      ConvertIntToDecimalString(2, show.score);
      sTVShowState = 5;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      ConvertIntToDecimalString(2, show.score);
      sTVShowState = 5;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      ConvertIntToDecimalString(2, show.score);
      sTVShowState = 5;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      ConvertIntToDecimalString(2, show.score);
      sTVShowState = 5;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.idolName, show.idolNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      CopyEasyChatWord(gStringVar3, show.words[0]);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVTrainerFanClubSpecialTextGroup[state])!);
}

/** 1:1 `static void DoTVShowTrainerFanClub(void)` (tv.c:6142-6228). */
function DoTVShowTrainerFanClub(): void {
  let show: any = null;
  let state = 0;
  let playerId = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      playerId = ((show.trainerIdHi << 8) + show.trainerIdLo);
      switch (playerId % 10) {
        case 0:
          sTVShowState = 1;
          break;
        case 1:
          sTVShowState = 2;
          break;
        case 2:
          sTVShowState = 3;
          break;
        case 3:
          sTVShowState = 4;
          break;
        case 4:
          sTVShowState = 5;
          break;
        case 5:
          sTVShowState = 6;
          break;
        case 6:
          sTVShowState = 7;
          break;
        case 7:
          sTVShowState = 8;
          break;
        case 8:
          sTVShowState = 9;
          break;
        case 9:
          sTVShowState = 10;
          break;
      }
      break;
    case 1:
      sTVShowState = 11;
      break;
    case 2:
      sTVShowState = 11;
      break;
    case 3:
      sTVShowState = 11;
      break;
    case 4:
      sTVShowState = 11;
      break;
    case 5:
      sTVShowState = 11;
      break;
    case 6:
      sTVShowState = 11;
      break;
    case 7:
      sTVShowState = 11;
      break;
    case 8:
      sTVShowState = 11;
      break;
    case 9:
      sTVShowState = 11;
      break;
    case 10:
      sTVShowState = 11;
      break;
    case 11:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      CopyEasyChatWord(gStringVar2, show.words[0]);
      CopyEasyChatWord(gStringVar3, show.words[1]);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVTrainerFanClubTextGroup[state])!);
}

/** 1:1 `static void DoTVShowSpotTheCuties(void)` (tv.c:6230-6334). */
function DoTVShowSpotTheCuties(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  // For each state, in addition to the switch a message
  // is printed from the table at the bottom
  state = sTVShowState;
  switch (state) {
    case SPOTCUTIES_STATE_INTRO:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.pokemonNameLanguage);
      // Comments following the intro depend on how many ribbons the Pokémon has
      if (show.nRibbons < 10)
        sTVShowState = SPOTCUTIES_STATE_RIBBONS_LOW;
      else if (show.nRibbons < 20)
        sTVShowState = SPOTCUTIES_STATE_RIBBONS_MID;
      else
        sTVShowState = SPOTCUTIES_STATE_RIBBONS_HIGH;
      break;
    case SPOTCUTIES_STATE_RIBBONS_LOW:
    case SPOTCUTIES_STATE_RIBBONS_MID:
    case SPOTCUTIES_STATE_RIBBONS_HIGH:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.pokemonNameLanguage);
      ConvertIntToDecimalString(2, show.nRibbons);
      sTVShowState = SPOTCUTIES_STATE_RIBBON_INTRO;
      break;
    case SPOTCUTIES_STATE_RIBBON_INTRO:
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.pokemonNameLanguage);
      switch (show.selectedRibbon) {
        case CHAMPION_RIBBON:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_CHAMPION;
          break;
        case COOL_RIBBON_NORMAL:
        case COOL_RIBBON_SUPER:
        case COOL_RIBBON_HYPER:
        case COOL_RIBBON_MASTER:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_COOL;
          break;
        case BEAUTY_RIBBON_NORMAL:
        case BEAUTY_RIBBON_SUPER:
        case BEAUTY_RIBBON_HYPER:
        case BEAUTY_RIBBON_MASTER:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_BEAUTY;
          break;
        case CUTE_RIBBON_NORMAL:
        case CUTE_RIBBON_SUPER:
        case CUTE_RIBBON_HYPER:
        case CUTE_RIBBON_MASTER:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_CUTE;
          break;
        case SMART_RIBBON_NORMAL:
        case SMART_RIBBON_SUPER:
        case SMART_RIBBON_HYPER:
        case SMART_RIBBON_MASTER:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_SMART;
          break;
        case TOUGH_RIBBON_NORMAL:
        case TOUGH_RIBBON_SUPER:
        case TOUGH_RIBBON_HYPER:
        case TOUGH_RIBBON_MASTER:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_TOUGH;
          break;
        case WINNING_RIBBON:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_WINNING;
          break;
        case VICTORY_RIBBON:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_VICTORY;
          break;
        case ARTIST_RIBBON:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_ARTIST;
          break;
        case EFFORT_RIBBON:
          sTVShowState = SPOTCUTIES_STATE_RIBBON_EFFORT;
          break;
        // No comment is made for any of the gift ribbons.
        // If the show is created for a gift ribbon
        // then this state will repeat indefinitely
      }
      break;
    case SPOTCUTIES_STATE_RIBBON_CHAMPION:
    case SPOTCUTIES_STATE_RIBBON_COOL:
    case SPOTCUTIES_STATE_RIBBON_BEAUTY:
    case SPOTCUTIES_STATE_RIBBON_CUTE:
    case SPOTCUTIES_STATE_RIBBON_SMART:
    case SPOTCUTIES_STATE_RIBBON_TOUGH:
    case SPOTCUTIES_STATE_RIBBON_WINNING:
    case SPOTCUTIES_STATE_RIBBON_VICTORY:
    case SPOTCUTIES_STATE_RIBBON_ARTIST:
    case SPOTCUTIES_STATE_RIBBON_EFFORT:
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.pokemonNameLanguage);
      sTVShowState = SPOTCUTIES_STATE_OUTRO;
      break;
    case SPOTCUTIES_STATE_OUTRO:
      TVShowDone();
  }
  ShowFieldMessage(getText(sTVCutiesTextGroup[state])!);
}

/** 1:1 `static void DoTVShowPokemonNewsBattleFrontier(void)` (tv.c:6336-6482). */
function DoTVShowPokemonNewsBattleFrontier(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      switch (show.facilityAndMode) {
        case 1:
          sTVShowState = 1;
          break;
        case 2:
          sTVShowState = 2;
          break;
        case 3:
          sTVShowState = 3;
          break;
        case 4:
          sTVShowState = 4;
          break;
        case 5:
          sTVShowState = 5;
          break;
        case 6:
          sTVShowState = 6;
          break;
        case 7:
          sTVShowState = 7;
          break;
        case 8:
          sTVShowState = 8;
          break;
        case 9:
          sTVShowState = 9;
          break;
        case 10:
          sTVShowState = 10;
          break;
        case 11:
          sTVShowState = 11;
          break;
        case 12:
          sTVShowState = 12;
          break;
        case 13:
          sTVShowState = 13;
          break;
      }
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 16;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 15;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 15;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 7:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 8:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 9:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 10:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 11:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 12:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 13:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.winStreak);
      sTVShowState = 14;
      break;
    case 14:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species1]));
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species2]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.species3]));
      sTVShowState = 18;
      break;
    case 15:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species1]));
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species2]));
      sTVShowState = 18;
      break;
    case 16:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species1]));
      StringCopy(gStringVar2, encodeOwText(gSpeciesNames[show.species2]));
      StringCopy(gStringVar3, encodeOwText(gSpeciesNames[show.species3]));
      sTVShowState = 17;
      break;
    case 17:
      StringCopy(gStringVar1, encodeOwText(gSpeciesNames[show.species4]));
      sTVShowState = 18;
      break;
    case 18:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVPokemonNewsBattleFrontierTextGroup[state])!);
}

/** 1:1 `static void DoTVShowWhatsNo1InHoennToday(void)` (tv.c:6484-6562). */
function DoTVShowWhatsNo1InHoennToday(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      switch (show.actionIdx) {
        case 0:
          sTVShowState = 1;
          break;
        case 1:
          sTVShowState = 2;
          break;
        case 2:
          sTVShowState = 3;
          break;
        case 3:
          sTVShowState = 4;
          break;
        case 4:
          sTVShowState = 5;
          break;
        case 5:
          sTVShowState = 6;
          break;
        case 6:
          sTVShowState = 7;
          break;
      }
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 2:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 3:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 7:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.count);
      sTVShowState = 8;
      break;
    case 8:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVWhatsNo1InHoennTodayTextGroup[state])!);
}

/** 1:1 `u8 SecretBaseSecrets_GetNumActionsTaken(TVShow *show)` (tv.c:6564-6575). */
export function SecretBaseSecrets_GetNumActionsTaken(show: TVShow): number {
  let i = 0;
  let flagsSet = 0;
  for ((i = 0, flagsSet = 0); i < NUM_SECRET_BASE_FLAGS; i++)
  {
    if ((show.flags >> i) & 1)
      flagsSet++;
  }
  return flagsSet;
}

/** 1:1 `static u8 SecretBaseSecrets_GetStateByFlagNumber(TVShow *show, u8 flagId)` (tv.c:6577-6593). */
function SecretBaseSecrets_GetStateByFlagNumber(show: TVShow, flagId: number): number {
  let i = 0;
  let flagsSet = 0;
  for ((i = 0, flagsSet = 0); i < NUM_SECRET_BASE_FLAGS; i++)
  {
    if ((show.flags >> i) & 1)
    {
      if (flagsSet == flagId)
        return sTVSecretBaseSecretsActions[i];
      flagsSet++;
    }
  }
  return 0;
}

/** 1:1 `static void DoTVShowSecretBaseSecrets(void)` (tv.c:6595-6715). */
function DoTVShowSecretBaseSecrets(): void {
  let show: any = null;
  let state = 0;
  let numActions = 0;
  let i = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case SBSECRETS_STATE_INTRO:
      TVShowConvertInternationalString(gStringVar1, show.baseOwnersName, show.baseOwnersNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      numActions = SecretBaseSecrets_GetNumActionsTaken(show);
      if (numActions == 0)
      {
        sTVShowState = SBSECRETS_STATE_NOTHING_USED1;
      }
      else
      {
        show.savedState = SBSECRETS_STATE_DO_NEXT1;
        sTVSecretBaseSecretsRandomValues[0] = Random() % numActions;
        sTVShowState = SecretBaseSecrets_GetStateByFlagNumber(show, sTVSecretBaseSecretsRandomValues[0]);
      }
      break;
    case SBSECRETS_STATE_DO_NEXT1:
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      numActions = SecretBaseSecrets_GetNumActionsTaken(show);
      switch (numActions) {
        case 1:
          sTVShowState = SBSECRETS_STATE_NOTHING_USED2;
          break;
        case 2:
          show.savedState = SBSECRETS_STATE_DO_NEXT2;
          if (sTVSecretBaseSecretsRandomValues[0] == 0)
            sTVShowState = SecretBaseSecrets_GetStateByFlagNumber(show, 1);
          else
            sTVShowState = SecretBaseSecrets_GetStateByFlagNumber(show, 0);
          break;
        default:
          for (i = 0; i < 0xFFFF; i++)
          {
            sTVSecretBaseSecretsRandomValues[1] = Random() % numActions;
            if (sTVSecretBaseSecretsRandomValues[1] != sTVSecretBaseSecretsRandomValues[0])
              break;
          }
          show.savedState = SBSECRETS_STATE_DO_NEXT2;
          sTVShowState = SecretBaseSecrets_GetStateByFlagNumber(show, sTVSecretBaseSecretsRandomValues[1]);
          break;
      }
      break;
    case SBSECRETS_STATE_DO_NEXT2:
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      numActions = SecretBaseSecrets_GetNumActionsTaken(show);
      if (numActions == 2)
      {
        sTVShowState = SBSECRETS_STATE_NOTHING_USED2;
      }
      else
      {
        for (i = 0; i < 0xFFFF; i++)
        {
          sTVSecretBaseSecretsRandomValues[2] = Random() % numActions;
          if (sTVSecretBaseSecretsRandomValues[2] != sTVSecretBaseSecretsRandomValues[0] && sTVSecretBaseSecretsRandomValues[2] != sTVSecretBaseSecretsRandomValues[1])
            break;
        }
        show.savedState = SBSECRETS_STATE_TOOK_X_STEPS;
        sTVShowState = SecretBaseSecrets_GetStateByFlagNumber(show, sTVSecretBaseSecretsRandomValues[2]);
      }
      break;
    case SBSECRETS_STATE_TOOK_X_STEPS:
      TVShowConvertInternationalString(gStringVar1, show.baseOwnersName, show.baseOwnersNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      ConvertIntToDecimalString(2, show.stepsInBase);
      if (show.stepsInBase <= 30)
        sTVShowState = SBSECRETS_STATE_BASE_INTEREST_LOW;
      else if (show.stepsInBase <= 100)
        sTVShowState = SBSECRETS_STATE_BASE_INTEREST_MED;
      else
        sTVShowState = SBSECRETS_STATE_BASE_INTEREST_HIGH;
      break;
    // 1:1 `case SBSECRETS_STATE_BASE_INTEREST_LOW ... SBSECRETS_STATE_BASE_INTEREST_HIGH:` (range GCC déroulé)
    case SBSECRETS_STATE_BASE_INTEREST_LOW: case SBSECRETS_STATE_BASE_INTEREST_MED: case SBSECRETS_STATE_BASE_INTEREST_HIGH:
      TVShowConvertInternationalString(gStringVar1, show.baseOwnersName, show.baseOwnersNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      sTVShowState = SBSECRETS_STATE_OUTRO;
      break;
    case SBSECRETS_STATE_OUTRO:
      TVShowConvertInternationalString(gStringVar1, show.baseOwnersName, show.baseOwnersNameLanguage);
      TVShowConvertInternationalString(gStringVar2, show.playerName, show.language);
      TVShowDone();
      break;
    // All below states are descriptions of what the player interacted with while in the secret base
    case SBSECRETS_STATE_NOTHING_USED1:
      sTVShowState = SBSECRETS_STATE_TOOK_X_STEPS;
      break;
    case SBSECRETS_STATE_NOTHING_USED2:
      sTVShowState = SBSECRETS_STATE_TOOK_X_STEPS;
      break;
    // 1:1 `case SBSECRETS_STATE_USED_CHAIR ... SBSECRETS_STATE_USED_MUD_BALL:` (range GCC déroulé, 10..18)
    case SBSECRETS_STATE_USED_CHAIR: case SBSECRETS_STATE_USED_BALLOON: case SBSECRETS_STATE_USED_TENT:
    case SBSECRETS_STATE_USED_PLANT: case SBSECRETS_STATE_USED_GOLD_SHIELD: case SBSECRETS_STATE_USED_SILVER_SHIELD:
    case SBSECRETS_STATE_USED_GLASS_ORNAMENT: case SBSECRETS_STATE_USED_TV: case SBSECRETS_STATE_USED_MUD_BALL:
      sTVShowState = show.savedState;
      break;
    case SBSECRETS_STATE_USED_BAG:
      StringCopy(gStringVar2, encodeOwText(GetItemName(show.item)));
      sTVShowState = show.savedState;
      break;
    case SBSECRETS_STATE_USED_CUSHION:
      // Randomly decide based on trainer ID if the player hugged or hit the cushion
      if (show.trainerIdLo & 1)
        sTVShowState = SBSECRETS_STATE_HUGGED_CUSHION;
      else
        sTVShowState = SBSECRETS_STATE_HIT_CUSHION;
      break;
    // 1:1 `case SBSECRETS_STATE_HIT_CUSHION ... SBSECRETS_NUM_STATES:` (range GCC déroulé, 21..43)
    case SBSECRETS_STATE_HIT_CUSHION: case SBSECRETS_STATE_HUGGED_CUSHION: case SBSECRETS_STATE_BATTLED_WON:
    case SBSECRETS_STATE_BATTLED_LOST: case SBSECRETS_STATE_DECLINED_BATTLE: case SBSECRETS_STATE_USED_POSTER:
    case SBSECRETS_STATE_USED_NOTE_MAT: case SBSECRETS_STATE_BATTLED_DRAW: case SBSECRETS_STATE_USED_SPIN_MAT:
    case SBSECRETS_STATE_USED_SAND_ORNAMENT: case SBSECRETS_STATE_USED_DESK: case SBSECRETS_STATE_USED_BRICK:
    case SBSECRETS_STATE_USED_SOLID_BOARD: case SBSECRETS_STATE_USED_FENCE: case SBSECRETS_STATE_USED_GLITTER_MAT:
    case SBSECRETS_STATE_USED_TIRE: case SBSECRETS_STATE_USED_STAND: case SBSECRETS_STATE_USED_BREAKABLE_DOOR:
    case SBSECRETS_STATE_USED_DOLL: case SBSECRETS_STATE_USED_SLIDE: case SBSECRETS_STATE_DECLINED_SLIDE:
    case SBSECRETS_STATE_USED_JUMP_MAT: case SBSECRETS_NUM_STATES:
      sTVShowState = show.savedState;
      break;
  }
  ShowFieldMessage(getText(sTVSecretBaseSecretsTextGroup[state])!);
}

/** 1:1 `static void DoTVShowSafariFanClub(void)` (tv.c:6717-6785). */
function DoTVShowSafariFanClub(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case 0:
      if (show.monsCaught == 0)
        sTVShowState = 6;
      else if (show.monsCaught < 4)
        sTVShowState = 5;
      else
        sTVShowState = 1;
      break;
    case 1:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.monsCaught);
      if (show.pokeblocksUsed == 0)
        sTVShowState = 3;
      else
        sTVShowState = 2;
      break;
    case 2:
      ConvertIntToDecimalString(1, show.pokeblocksUsed);
      sTVShowState = 4;
      break;
    case 3:
      sTVShowState = 4;
      break;
    case 4:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      sTVShowState = 10;
      break;
    case 5:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      ConvertIntToDecimalString(1, show.monsCaught);
      if (show.pokeblocksUsed == 0)
        sTVShowState = 8;
      else
        sTVShowState = 7;
      break;
    case 6:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      if (show.pokeblocksUsed == 0)
        sTVShowState = 8;
      else
        sTVShowState = 7;
      break;
    case 7:
      ConvertIntToDecimalString(1, show.pokeblocksUsed);
      sTVShowState = 9;
      break;
    case 8:
      sTVShowState = 9;
      break;
    case 9:
      TVShowConvertInternationalString(gStringVar1, show.playerName, show.language);
      sTVShowState = 10;
      break;
    case 10:
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVSafariFanClubTextGroup[state])!);
}

// This show is a version of Contest Live Updates for the Lilycove Contest Lady

/** 1:1 `static void DoTVShowLilycoveContestLady(void)` (tv.c:6788-6816). */
function DoTVShowLilycoveContestLady(): void {
  let show: any = null;
  let state = 0;
  show = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
  VarSet(0x800D /* gSpecialVar_Result */, +(false));
  state = sTVShowState;
  switch (state) {
    case CONTESTLADYLIVE_STATE_INTRO:
      BufferContestName(gStringVar1, show.contestCategory);
      if (show.pokeblockState == CONTEST_LADY_GOOD)
        sTVShowState = CONTESTLADYLIVE_STATE_WON;
      else if (show.pokeblockState == CONTEST_LADY_NORMAL)
        sTVShowState = CONTESTLADYLIVE_STATE_LOST;
      else
        // CONTEST_LADY_BAD
      break;
    case CONTESTLADYLIVE_STATE_WON:
    case CONTESTLADYLIVE_STATE_LOST:
      TVShowConvertInternationalString(gStringVar3, show.playerName, show.language);
    case CONTESTLADYLIVE_STATE_LOST_BADLY:
      TVShowConvertInternationalString(gStringVar2, show.nickname, show.pokemonNameLanguage);
      TVShowDone();
      break;
  }
  ShowFieldMessage(getText(sTVLilycoveContestLadyTextGroup[state])!);
}

/** 1:1 `static void TVShowDone(void)` (tv.c:6818-6823). */
function TVShowDone(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(true));
  sTVShowState = 0;
  gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */].active = false;
}

/** 1:1 `void ResetTVShowState(void)` (tv.c:6825-6828). */
export function ResetTVShowState(): void {
  sTVShowState = 0;
}

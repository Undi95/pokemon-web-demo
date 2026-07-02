/**
 * new_game.ts — Port 1:1 STRICT (MIROIR) de `src/new_game.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/new_game.c`.
 *
 * `NewGameInitData` (:149-207) = LE seeding complet d'une nouvelle partie,
 * dans l'ORDRE EXACT de la décomp. Chaque appel vise le foyer miroir 1:1 du
 * fichier .c correspondant.
 *
 * Adaptations documentées (plateforme, cf. [[fieldmap-1to1-adaptations]]) :
 *  - `WarpToTruck` : SetWarpDestination(INSIDE_OF_TRUCK, WARP_ID_NONE, -1, -1)
 *    + WarpIntoMap → chez nous SetCurrentMapLocation('MAP_INSIDE_OF_TRUCK', 2, 2)
 *    (coords centre-map 5×5 = (2,2), A/B testé contre ROM session 124) ; le
 *    chargement effectif de la map est fait par le boot harness (boot-mode.ts).
 *  - `RunScriptImmediately(EventScript_ResetAllMapFlags)` : réel via byte-VM —
 *    le boot DOIT avoir chargé l'image bytecode avant (TestOverworldScene
 *    await loadByteVmEngine() avant decideBootMode).
 *  - SB2.playerTrainerId = u32 number (le décomp écrit 4 octets LE via
 *    SetTrainerId ; les helpers byte-array servent aux OTHER trainer ids).
 */

import { gSaveBlock1Ptr, gSaveBlock2Ptr, SetSaveBlock2 } from './engine/save/save-block-state';
import { emptyBattleFrontier, emptySaveBlock2 } from './engine/save/save-blocks';
import { GetSaveFileStatus, SAVE_STATUS_EMPTY, SAVE_STATUS_CORRUPT, ResetPokemonStorageSystem } from './save';
import { RtcReset } from './rtc';
import { Random } from './random';
import { GetGeneratedTrainerIdLower } from './main';
import { ZeroPlayerPartyMons, ZeroEnemyPartyMons } from './pokemon';
import { ResetPokedex, ResetPokedexScrollPositions } from './pokedex';
import { ClearSav1, SetCurrentMapLocation } from './load_save';
import { ClearAllMail } from './mail_data';
import { PlayTimeCounter_Reset } from './play_time';
import { InitEventData } from './event_data';
import { ClearTVShowData, ResetGabbyAndTy } from './tv';
import { ClearSecretBases } from './secret_base';
import { ClearBerryTrees } from './berry';
import { SetMoney } from './money';
import { SetCoins } from './coins';
import {
  ResetLinkContestBoolean, ClearContestWinnerPicsInContestHall, ResetContestLinkResults,
} from './contest';
import { ResetGameStats } from './field_player_avatar';
import { ClearPlayerLinkBattleRecords } from './battle_records';
import { InitSeedotSizeRecord, InitLotadSizeRecord } from './pokemon_size_record';
import { ClearRoamerData, ClearRoamerLocationData } from './roamer';
import { ClearBag } from './engine/bag/bag';
import { NewGameInitPCItems } from './engine/pokemon/pc-items';
import { ClearPokeblocks, ResetPokeblockScrollPositions } from './pokeblock';
import { ClearDecorationInventories } from './decoration_inventory';
import { InitEasyChatPhrases } from './easy_chat';
import { SetMauvilleOldMan } from './mauville_old_man';
import { InitDewfordTrend } from './dewford_trend';
import { ResetFanClub } from './field_specials';
import { ResetLotteryCorner } from './lottery_corner';
import { RunScriptImmediately } from './script';
import { ResetPokemonJumpRecords } from './pokemon_jump';
import { SetBerryPowder } from './berry_powder';
import { InitUnionRoomChatRegisteredTexts } from './union_room_chat';
import { InitLilycoveLady } from './lilycove_lady';
import { ResetAllApprenticeData } from './apprentice';
import { ClearRankingHallRecords } from './frontier_util';
import { InitMatchCallCounters } from './match_call';
import { ClearMysteryGift } from './mystery_gift';
import { WipeTrainerNameRecords } from './link_rfu_3';
import { ResetTrainerHillResults } from './trainer_hill';
import { ResetBagScrollPositions } from './item_menu';
import { ITEM_NONE } from '../include/constants/items';
import { TRAINER_ID_LENGTH, NUM_CONTEST_WINNERS } from '../include/constants/global';
import { MUSEUM_CONTEST_WINNERS_START } from './contest';
import type { ContestWinner } from './engine/save/save-blocks';

/** 1:1 décomp `EWRAM_DATA bool8 gDifferentSaveFile` (new_game.c:55). */
export let gDifferentSaveFile = false;

/** 1:1 décomp `sContestWinnerPicDummy` (new_game.c:58-62) : monName/trainerName vides. */
const sContestWinnerPicDummy: ContestWinner = {
  personality: 0, trainerId: 0, species: 0, contestCategory: 0,
  monName: '', trainerName: '', contestRank: 0,
};

/** 1:1 décomp `void SetTrainerId(u32 trainerId, u8 *dst)` (new_game.c:64-70) :
 *  écrit le u32 en 4 octets little-endian. */
export function SetTrainerId(trainerId: number, dst: number[]): void {
  dst[0] = trainerId & 0xFF;
  dst[1] = (trainerId >>> 8) & 0xFF;
  dst[2] = (trainerId >>> 16) & 0xFF;
  dst[3] = (trainerId >>> 24) & 0xFF;
}

/** 1:1 décomp `u32 GetTrainerId(u8 *trainerId)` (new_game.c:72-75). */
export function GetTrainerId(trainerId: number[]): number {
  return ((trainerId[3] << 24) | (trainerId[2] << 16) | (trainerId[1] << 8) | trainerId[0]) >>> 0;
}

/** 1:1 décomp `void CopyTrainerId(u8 *dst, u8 *src)` (new_game.c:77-82). */
export function CopyTrainerId(dst: number[], src: number[]): void {
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) dst[i] = src[i];
}

/** 1:1 décomp `static void InitPlayerTrainerId(void)` (new_game.c:84-88) :
 *  trainerId = (Random() << 16) | GetGeneratedTrainerIdLower(). Notre
 *  SB2.playerTrainerId = u32 number direct (adaptation documentée en tête). */
function InitPlayerTrainerId(): void {
  const trainerId = (((Random() << 16) >>> 0) | GetGeneratedTrainerIdLower()) >>> 0;
  gSaveBlock2Ptr.playerTrainerId = trainerId;
}

// L=A isnt set here for some reason. (commentaire décomp new_game.c:90)
/** 1:1 décomp `static void SetDefaultOptions(void)` (new_game.c:91-99). */
function SetDefaultOptions(): void {
  gSaveBlock2Ptr.optionsTextSpeed = 1;        // OPTIONS_TEXT_SPEED_MID
  gSaveBlock2Ptr.optionsWindowFrameType = 0;
  gSaveBlock2Ptr.optionsSound = 0;            // OPTIONS_SOUND_MONO
  gSaveBlock2Ptr.optionsBattleStyle = 0;      // OPTIONS_BATTLE_STYLE_SHIFT
  gSaveBlock2Ptr.optionsBattleSceneOff = 0;   // FALSE
  gSaveBlock2Ptr.regionMapZoom = 0;           // FALSE
}

/** 1:1 décomp `static void ClearPokedexFlags(void)` (new_game.c:101-106) :
 *  gUnusedPokedexU8 = 0 (global UNUSED hébergé pokedex.ts, remis à 0 par
 *  ResetPokedex appelé plus haut dans NewGameInitData — un binding importé
 *  n'est pas assignable en ESM, 0 lecteur, même état final) + owned/seen à 0. */
function ClearPokedexFlags(): void {
  gSaveBlock2Ptr.pokedex.owned.fill(0);
  gSaveBlock2Ptr.pokedex.seen.fill(0);
}

/** 1:1 décomp `void ClearAllContestWinnerPics(void)` (new_game.c:108-117) :
 *  repose les tableaux du hall + vide les peintures du musée (slots 8..12). */
export function ClearAllContestWinnerPics(): void {
  ClearContestWinnerPicsInContestHall();
  // Clear Museum paintings (commentaire décomp :114)
  for (let i = MUSEUM_CONTEST_WINNERS_START; i < NUM_CONTEST_WINNERS; i++)
    gSaveBlock1Ptr.contestWinners[i] = { ...sContestWinnerPicDummy };
}

/** 1:1 décomp `static void ClearFrontierRecord(void)` (new_game.c:119-125) :
 *  CpuFill32(0, &SB2.frontier, sizeof) + opponentNames[0/1][0] = EOS —
 *  la factory zéro couvre les deux (noms = ''). */
function ClearFrontierRecord(): void {
  gSaveBlock2Ptr.frontier = emptyBattleFrontier();
}

/** 1:1 décomp `static void WarpToTruck(void)` (new_game.c:127-131) :
 *  SetWarpDestination(MAP_INSIDE_OF_TRUCK, WARP_ID_NONE, -1, -1) + WarpIntoMap.
 *  Adaptation (en-tête) : coords centre-map (2,2), chargement par le boot. */
function WarpToTruck(): void {
  SetCurrentMapLocation('MAP_INSIDE_OF_TRUCK', 2, 2);
}

/** 1:1 décomp `void Sav2_ClearSetDefault(void)` (new_game.c:133-137) :
 *  ClearSav2 (load_save.c:59 = CpuFill16(0, &gSaveblock2, sizeof) → factory
 *  zéro) + SetDefaultOptions. NB : emptySaveBlock2 pose DÉJÀ les défauts —
 *  SetDefaultOptions ré-écrit les mêmes valeurs, 1:1 sans effet de plus. */
export function Sav2_ClearSetDefault(): void {
  SetSaveBlock2(emptySaveBlock2());
  SetDefaultOptions();
}

/** 1:1 décomp `void ResetMenuAndMonGlobals(void)` (new_game.c:139-147). */
export function ResetMenuAndMonGlobals(): void {
  gDifferentSaveFile = false;
  ResetPokedexScrollPositions();
  ZeroPlayerPartyMons();
  ZeroEnemyPartyMons();
  ResetBagScrollPositions();
  ResetPokeblockScrollPositions();
}

/** 1:1 décomp `void NewGameInitData(void)` (new_game.c:149-207) — ORDRE EXACT. */
export function NewGameInitData(): void {
  const saveFileStatus = GetSaveFileStatus();
  if (saveFileStatus === SAVE_STATUS_EMPTY || saveFileStatus === SAVE_STATUS_CORRUPT)
    RtcReset();

  gDifferentSaveFile = true;
  gSaveBlock2Ptr.encryptionKey = 0;
  ZeroPlayerPartyMons();
  ZeroEnemyPartyMons();
  ResetPokedex();
  ClearFrontierRecord();
  ClearSav1();
  ClearAllMail();
  gSaveBlock2Ptr.specialSaveWarpFlags = 0;
  gSaveBlock2Ptr.gcnLinkFlags = 0;
  InitPlayerTrainerId();
  PlayTimeCounter_Reset();
  ClearPokedexFlags();
  InitEventData();
  ClearTVShowData();
  ResetGabbyAndTy();
  ClearSecretBases();
  ClearBerryTrees();
  SetMoney(3000);                          // 1:1 SetMoney(&SB1->money, 3000)
  SetCoins(0);
  ResetLinkContestBoolean();
  ResetGameStats();
  ClearAllContestWinnerPics();
  ClearPlayerLinkBattleRecords();
  InitSeedotSizeRecord();
  InitLotadSizeRecord();
  gSaveBlock1Ptr.playerPartyCount = 0;     // 1:1 gPlayerPartyCount = 0
  ZeroPlayerPartyMons();                   // 1:1 (double appel présent dans la décomp)
  ResetPokemonStorageSystem();
  ClearRoamerData();
  ClearRoamerLocationData();
  gSaveBlock1Ptr.registeredItem = ITEM_NONE;
  // Bridge web du registeredItem (clé string) — pas de `delete` : le Proxy
  // gSaveBlock1Ptr n'a pas de trap deleteProperty (save-block-state.ts:72).
  gSaveBlock1Ptr.__registeredItemKey = undefined;
  ClearBag();
  NewGameInitPCItems();
  ClearPokeblocks();
  ClearDecorationInventories();
  InitEasyChatPhrases();
  SetMauvilleOldMan();
  InitDewfordTrend();
  ResetFanClub();
  ResetLotteryCorner();
  WarpToTruck();
  RunScriptImmediately('EventScript_ResetAllMapFlags');
  ResetMiniGamesRecords();
  InitUnionRoomChatRegisteredTexts();
  InitLilycoveLady();
  ResetAllApprenticeData();
  ClearRankingHallRecords();
  InitMatchCallCounters();
  ClearMysteryGift();
  WipeTrainerNameRecords();
  ResetTrainerHillResults();
  ResetContestLinkResults();
}

/** 1:1 décomp `static void ResetMiniGamesRecords(void)` (new_game.c:209-215) :
 *  CpuFill16(0, &berryCrush, sizeof) + SetBerryPowder(0) +
 *  ResetPokemonJumpRecords + CpuFill16(0, &berryPick, sizeof). */
function ResetMiniGamesRecords(): void {
  const bc = gSaveBlock2Ptr.berryCrush;
  bc.pressingSpeeds.fill(0);
  bc.berryPowderAmount = 0;
  bc.unk = 0;
  SetBerryPowder(0);
  ResetPokemonJumpRecords();
  const bp = gSaveBlock2Ptr.berryPick;
  bp.bestScore = 0; bp.berriesPicked = 0; bp.berriesPickedInRow = 0;
  bp.field_8 = 0; bp.field_9 = 0; bp.field_A = 0; bp.field_B = 0;
  bp.field_C = 0; bp.field_D = 0; bp.field_E = 0; bp.field_F = 0;
}

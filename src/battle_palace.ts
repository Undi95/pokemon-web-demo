/**
 * battle_palace.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_palace.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/battle_palace.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { MAX_STREAK } from '../include/constants/battle_frontier';
import { ITEM_BRIGHT_POWDER, ITEM_CALCIUM, ITEM_CARBOS, ITEM_CHOICE_BAND, ITEM_FOCUS_BAND, ITEM_HP_UP, ITEM_IRON, ITEM_KINGS_ROCK, ITEM_LEFTOVERS, ITEM_MENTAL_HERB, ITEM_PROTEIN, ITEM_QUICK_CLAW, ITEM_SCOPE_LENS, ITEM_WHITE_HERB, ITEM_ZINC } from '../include/constants/items';
import { VAR_FRONTIER_BATTLE_MODE, VAR_TEMP_CHALLENGE_STATUS } from '../include/constants/vars';
import { AddBagItem } from './engine/bag/bag';
import { gTrainerBattleOpponent_A, setTrainerBattleOpponentA } from './engine/battle/state';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { VarGet, VarSet } from './event_data';
import { Random } from './random';
import { gStringVar1 } from './string_util';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const STREAK_PALACE_SINGLES_50 = 16; // 1:1 include/constants/frontier_util.h:52 (à consolider dans include/)
const STREAK_PALACE_SINGLES_OPEN = 32; // 1:1 include/constants/frontier_util.h:53 (à consolider dans include/)
const STREAK_PALACE_DOUBLES_50 = 4194304; // 1:1 include/constants/frontier_util.h:70 (à consolider dans include/)
const STREAK_PALACE_DOUBLES_OPEN = 8388608; // 1:1 include/constants/frontier_util.h:71 (à consolider dans include/)
const WARP_ID_NONE = -1; // 1:1 include/constants/maps.h:28 (à consolider dans include/)
const PALACE_DATA_PRIZE = 0; // 1:1 include/constants/battle_palace.h:15 (à consolider dans include/)
const PALACE_DATA_WIN_STREAK = 1; // 1:1 include/constants/battle_palace.h:16 (à consolider dans include/)
const PALACE_DATA_WIN_STREAK_ACTIVE = 2; // 1:1 include/constants/battle_palace.h:17 (à consolider dans include/)
const FRONTIER_TRAINERS_COUNT = 300; // 1:1 include/constants/battle_frontier_trainers.h:305 (à consolider dans include/)

// ─── Socle Battle Frontier NON PORTÉ ──────────────────────────────────────────
// Fichier INERTE (importé nulle part). Les symboles du socle Frontier (battle_tower.c,
// frontier_util.c) et CopyItemName (item.c, non exporté en commun) ne sont pas encore
// portés → références locales qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ;
// le câblage futur du Frontier forcera la réconciliation).
function socleFrontierRef(name: string): any {
  return new Proxy({}, {
    get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
    set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); },
  });
}
/** 1:1 `gFacilityTrainers` (battle_tower.c) — pointeur de façade, non porté. */
const gFacilityTrainers: any = socleFrontierRef('gFacilityTrainers');
/** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */
function SetBattleFacilityTrainerGfxId(_trainerId: number, _arrayId: number): void {
  throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `FrontierSpeechToString(const u16 *words)` (battle_tower.c). */
function FrontierSpeechToString(_words: any): void {
  throw new Error('non porté : FrontierSpeechToString (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `SaveGameFrontier(void)` (frontier_util.c). */
function SaveGameFrontier(): void {
  throw new Error('non porté : SaveGameFrontier (socle frontier_util)');
}
/** NON PORTÉ — 1:1 `CopyItemName(u16 itemId, u8 *dst)` (item.c). Variante locale non
 *  partagée (item_menu.ts:989 → retourne string) : stub 2-arg décomp, INERTE. */
function CopyItemName(_itemId: number, _dst: any): void {
  throw new Error('non porté : CopyItemName (item.c, non exporté en commun)');
}
/** PORT DIVERGENT — décomp `SetDynamicWarp(s32 unused, s8 mapGroup, s8 mapNum, s8 warpId)`
 *  (overworld.c) vs port overworld.ts `SetDynamicWarp(mapId:string, x, y)` (variante scrcmd
 *  3-arg, signature incompatible). Référence locale qui LÈVE ; réconciliation différée au
 *  câblage Frontier (interdit de modifier overworld.ts ici). */
function SetDynamicWarp(_unused: number, _mapGroup: any, _mapNum: any, _warpId: number): void {
  throw new Error('SetDynamicWarp : port overworld.ts divergent (3-arg scrcmd) vs décomp 4-arg — réconciliation au câblage Frontier');
}

// This file's functions.

// Const rom data.

/** 1:1 (battle_palace.c:29) */
const sBattlePalaceFunctions: Array<(...args: any[]) => any> = [
  InitPalaceChallenge, // [BATTLE_PALACE_FUNC_INIT]
  GetPalaceData, // [BATTLE_PALACE_FUNC_GET_DATA]
  SetPalaceData, // [BATTLE_PALACE_FUNC_SET_DATA]
  GetPalaceCommentId, // [BATTLE_PALACE_FUNC_GET_COMMENT_ID]
  SetPalaceOpponent, // [BATTLE_PALACE_FUNC_SET_OPPONENT]
  BufferOpponentIntroSpeech, // [BATTLE_PALACE_FUNC_GET_OPPONENT_INTRO]
  IncrementPalaceStreak, // [BATTLE_PALACE_FUNC_INCREMENT_STREAK]
  SavePalaceChallenge, // [BATTLE_PALACE_FUNC_SAVE]
  SetRandomPalacePrize, // [BATTLE_PALACE_FUNC_SET_PRIZE]
  GivePalacePrize, // [BATTLE_PALACE_FUNC_GIVE_PRIZE]
];

/** 1:1 (battle_palace.c:43) */
const sBattlePalaceEarlyPrizes = Uint16Array.from([
  ITEM_HP_UP,
  ITEM_PROTEIN,
  ITEM_IRON,
  ITEM_CALCIUM,
  ITEM_CARBOS,
  ITEM_ZINC,
]);

/** 1:1 (battle_palace.c:53) */
const sBattlePalaceLatePrizes = Uint16Array.from([
  ITEM_BRIGHT_POWDER,
  ITEM_WHITE_HERB,
  ITEM_QUICK_CLAW,
  ITEM_LEFTOVERS,
  ITEM_MENTAL_HERB,
  ITEM_KINGS_ROCK,
  ITEM_FOCUS_BAND,
  ITEM_SCOPE_LENS,
  ITEM_CHOICE_BAND,
]);

/** 1:1 (battle_palace.c:66) */
const sWinStreakFlags: number[][] = [
  [
    STREAK_PALACE_SINGLES_50,
    STREAK_PALACE_SINGLES_OPEN,
  ],
  [
    STREAK_PALACE_DOUBLES_50,
    STREAK_PALACE_DOUBLES_OPEN,
  ],
];

/** 1:1 (battle_palace.c:72) */
const sWinStreakMasks: number[][] = [
  [
    ~(STREAK_PALACE_SINGLES_50),
    ~(STREAK_PALACE_SINGLES_OPEN),
  ],
  [
    ~(STREAK_PALACE_DOUBLES_50),
    ~(STREAK_PALACE_DOUBLES_OPEN),
  ],
];

// code

/** 1:1 `void CallBattlePalaceFunction(void)` (battle_palace.c:79-82). */
export function CallBattlePalaceFunction(): void {
  sBattlePalaceFunctions[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void InitPalaceChallenge(void)` (battle_palace.c:84-98). */
function InitPalaceChallenge(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  gSaveBlock2Ptr.frontier.disableRecordBattle = false;
  if (!(gSaveBlock2Ptr.frontier.winStreakActiveFlags & sWinStreakFlags[battleMode][lvlMode]))
    gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] = 0;
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
  setTrainerBattleOpponentA(0); // 1:1 `gTrainerBattleOpponent_A = 0` (export let → setter porté)
}

/** 1:1 `static void GetPalaceData(void)` (battle_palace.c:100-117). */
function GetPalaceData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case PALACE_DATA_PRIZE:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.palacePrize));
      break;
    case PALACE_DATA_WIN_STREAK:
      VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode]));
      break;
    case PALACE_DATA_WIN_STREAK_ACTIVE:
      VarSet(0x800D /* gSpecialVar_Result */, +(((gSaveBlock2Ptr.frontier.winStreakActiveFlags & sWinStreakFlags[battleMode][lvlMode]) != 0)));
      break;
  }
}

/** 1:1 `static void SetPalaceData(void)` (battle_palace.c:119-139). */
function SetPalaceData(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  switch (VarGet(0x8005) /* gSpecialVar_0x8005 */) {
    case PALACE_DATA_PRIZE:
      gSaveBlock2Ptr.frontier.palacePrize = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PALACE_DATA_WIN_STREAK:
      gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] = VarGet(0x8006) /* gSpecialVar_0x8006 */;
      break;
    case PALACE_DATA_WIN_STREAK_ACTIVE:
      if (VarGet(0x8006) /* gSpecialVar_0x8006 */)
        gSaveBlock2Ptr.frontier.winStreakActiveFlags |= sWinStreakFlags[battleMode][lvlMode];
      else
        gSaveBlock2Ptr.frontier.winStreakActiveFlags &= sWinStreakMasks[battleMode][lvlMode];
      break;
  }
}

/** 1:1 `static void GetPalaceCommentId(void)` (battle_palace.c:141-152). */
function GetPalaceCommentId(): void {
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  if (gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] < 50)
    VarSet(0x800D /* gSpecialVar_Result */, +(Random() % 3));
  else if (gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] < 99)
    VarSet(0x800D /* gSpecialVar_Result */, 3);
  else
    VarSet(0x800D /* gSpecialVar_Result */, 4);
}

/** 1:1 `static void SetPalaceOpponent(void)` (battle_palace.c:154-158). */
function SetPalaceOpponent(): void {
  setTrainerBattleOpponentA(Math.trunc(5 * (Random() % 255) / 64)); // 1:1 `gTrainerBattleOpponent_A = 5*(Random()%255)/64u`
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_A, 0);
}

/** 1:1 `static void BufferOpponentIntroSpeech(void)` (battle_palace.c:160-164). */
function BufferOpponentIntroSpeech(): void {
  if (gTrainerBattleOpponent_A < FRONTIER_TRAINERS_COUNT)
    FrontierSpeechToString(gFacilityTrainers[gTrainerBattleOpponent_A].speechBefore);
}

/** 1:1 `static void IncrementPalaceStreak(void)` (battle_palace.c:166-179). */
function IncrementPalaceStreak(): void {
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  if (gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] < MAX_STREAK)
  {
    gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode]++;
    // Whatever GF planned to do here, they messed up big time.
    if (gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][(lvlMode > gSaveBlock2Ptr.frontier.palaceRecordWinStreaks[battleMode][lvlMode]) ? 1 : 0])
      gSaveBlock2Ptr.frontier.palaceRecordWinStreaks[battleMode][lvlMode] = gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode];
  }
}

/** 1:1 `static void SavePalaceChallenge(void)` (battle_palace.c:181-187). */
function SavePalaceChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveGameFrontier();
}

/** 1:1 `static void SetRandomPalacePrize(void)` (battle_palace.c:189-198). */
function SetRandomPalacePrize(): void {
  let battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
  let lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  if (gSaveBlock2Ptr.frontier.palaceWinStreaks[battleMode][lvlMode] > 41)
    gSaveBlock2Ptr.frontier.palacePrize = sBattlePalaceLatePrizes[Random() % sBattlePalaceLatePrizes.length];
  else
    gSaveBlock2Ptr.frontier.palacePrize = sBattlePalaceEarlyPrizes[Random() % sBattlePalaceEarlyPrizes.length];
}

/** 1:1 `static void GivePalacePrize(void)` (battle_palace.c:200-212). */
function GivePalacePrize(): void {
  if (AddBagItem(gSaveBlock2Ptr.frontier.palacePrize, 1) == true) // 1:1 `== TRUE` (AddBagItem porté → boolean)
  {
    CopyItemName(gSaveBlock2Ptr.frontier.palacePrize, gStringVar1);
    gSaveBlock2Ptr.frontier.palacePrize = 0;
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  }
  else
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  }
}

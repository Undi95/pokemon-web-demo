/**
 * battle_tent.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_tent.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/battle_tent.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FRONTIER_PARTY_SIZE, PARTY_SIZE } from '../include/constants/global';
import { ITEM_FULL_HEAL, ITEM_HYPER_POTION, ITEM_NEST_BALL, ITEM_NONE } from '../include/constants/items';
import { SPECIES_NONE } from '../include/constants/species';
import { VAR_TEMP_CHALLENGE_STATUS } from '../include/constants/vars';
import { AddBagItem } from './engine/bag/bag';
import { gTrainerBattleOpponent_A, setTrainerBattleOpponentA } from './engine/battle/state';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { VarGet, VarSet } from './event_data';
import { gMapHeader } from './fieldmap';
import { ZeroPlayerPartyMons } from './pokemon';
import { Random } from './random';
import { gStringVar1 } from './string_util';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const WARP_ID_NONE = -1; // 1:1 include/constants/maps.h:28 (à consolider dans include/)
const FRONTIER_TRAINERS_COUNT = 300; // 1:1 include/constants/battle_frontier_trainers.h:305 (à consolider dans include/)
const NUM_SLATEPORT_TENT_MONS = 70; // 1:1 include/constants/battle_tent_mons.h:75 (à consolider dans include/)
const NUM_BATTLE_TENT_TRAINERS = 30; // 1:1 include/constants/battle_tent_trainers.h:97 (à consolider dans include/)
const TENT_STAGES_PER_CHALLENGE = 3; // 1:1 include/constants/battle_tent.h:8 (à consolider dans include/)

// ─── Adaptations de représentation (port) ─────────────────────────────────────
// Le port typé `gMapHeader.regionMapSectionId`/`mapLayoutId` en STRING (fieldmap.ts:288)
// → les constantes MAPSEC_*/LAYOUT_* sont des littéraux string (précédent overworld.ts:1427).
const MAPSEC_SLATEPORT_CITY = 'MAPSEC_SLATEPORT_CITY'; // 1:1 constants/region_map_sections.h
const LAYOUT_BATTLE_TENT_CORRIDOR = 'LAYOUT_BATTLE_TENT_CORRIDOR'; // 1:1 constants/layouts.h
const LAYOUT_BATTLE_TENT_BATTLE_ROOM = 'LAYOUT_BATTLE_TENT_BATTLE_ROOM'; // 1:1 constants/layouts.h

// ─── Socle Battle Frontier NON PORTÉ ──────────────────────────────────────────
// Fichier INERTE (importé nulle part). Les symboles du socle Frontier (battle_tower.c,
// frontier_util.c, battle_factory_screen.c) et CopyItemName (item.c, non exporté en commun)
// ne sont pas encore portés → références locales qui LÈVENT à tout accès/appel (Règle 3 :
// pas de stub muet ; le câblage futur du Frontier forcera la réconciliation).
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
/** 1:1 tables source `gBattleFrontierHeldItems`/`gSlateportBattleTent*` (data + battle_tower.c). */
const gBattleFrontierHeldItems: any = socleFrontierRef('gBattleFrontierHeldItems');
const gSlateportBattleTentTrainers: any = socleFrontierRef('gSlateportBattleTentTrainers');
const gSlateportBattleTentMons: any = socleFrontierRef('gSlateportBattleTentMons');
/** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */
function SetBattleFacilityTrainerGfxId(_trainerId: number, _arrayId: number): void {
  throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `FrontierSpeechToString(const u16 *words)` (battle_tower.c). */
function FrontierSpeechToString(_words: any): void {
  throw new Error('non porté : FrontierSpeechToString (socle battle_tower)');
}
/** NON PORTÉ — 1:1 `GetFrontierTrainerName(u8 *dst, u16 trainerId)` (battle_tower.c). */
function GetFrontierTrainerName(_dst: any, _trainerId: number): void {
  throw new Error('non porté : GetFrontierTrainerName (socle battle_tower)');
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

/*
 * Battle Tents are mini versions of particular Battle Frontier facilities
 * As such they each share some scripts and functions with their counterpart
 *
 * Verdanturf Battle Tent: Battle Palace
 * Fallarbor Battle Tent:  Battle Arena
 * Slateport Battle Tent:  Battle Factory
 *
 */

/** 1:1 (battle_tent.c:59) */
let sRandMonId = 0;

/** 1:1 (battle_tent.c:61) */
export const sVerdanturfTentFuncs: Array<(...args: any[]) => any> = [
  InitVerdanturfTentChallenge, // [VERDANTURF_TENT_FUNC_INIT]
  GetVerdanturfTentPrize, // [VERDANTURF_TENT_FUNC_GET_PRIZE]
  SetVerdanturfTentPrize, // [VERDANTURF_TENT_FUNC_SET_PRIZE]
  SetVerdanturfTentTrainerGfx, // [VERDANTURF_TENT_FUNC_SET_OPPONENT_GFX]
  BufferVerdanturfTentTrainerIntro, // [VERDANTURF_TENT_FUNC_GET_OPPONENT_INTRO]
  SaveVerdanturfTentChallenge, // [VERDANTURF_TENT_FUNC_SAVE]
  SetRandomVerdanturfTentPrize, // [VERDANTURF_TENT_FUNC_SET_RANDOM_PRIZE]
  GiveVerdanturfTentPrize, // [VERDANTURF_TENT_FUNC_GIVE_PRIZE]
];

/** 1:1 (battle_tent.c:73) */
const sVerdanturfTentRewards = Uint16Array.from([
  ITEM_NEST_BALL,
]);

/** 1:1 (battle_tent.c:75) */
export const sFallarborTentFuncs: Array<(...args: any[]) => any> = [
  InitFallarborTentChallenge, // [FALLARBOR_TENT_FUNC_INIT]
  GetFallarborTentPrize, // [FALLARBOR_TENT_FUNC_GET_PRIZE]
  SetFallarborTentPrize, // [FALLARBOR_TENT_FUNC_SET_PRIZE]
  SaveFallarborTentChallenge, // [FALLARBOR_TENT_FUNC_SAVE]
  SetRandomFallarborTentPrize, // [FALLARBOR_TENT_FUNC_SET_RANDOM_PRIZE]
  GiveFallarborTentPrize, // [FALLARBOR_TENT_FUNC_GIVE_PRIZE]
  BufferFallarborTentTrainerName, // [FALLARBOR_TENT_FUNC_GET_OPPONENT_NAME]
];

/** 1:1 (battle_tent.c:86) */
const sFallarborTentRewards = Uint16Array.from([
  ITEM_HYPER_POTION,
]);

/** 1:1 (battle_tent.c:88) */
export const sSlateportTentFuncs: Array<(...args: any[]) => any> = [
  InitSlateportTentChallenge, // [SLATEPORT_TENT_FUNC_INIT]
  GetSlateportTentPrize, // [SLATEPORT_TENT_FUNC_GET_PRIZE]
  SetSlateportTentPrize, // [SLATEPORT_TENT_FUNC_SET_PRIZE]
  SaveSlateportTentChallenge, // [SLATEPORT_TENT_FUNC_SAVE]
  SetRandomSlateportTentPrize, // [SLATEPORT_TENT_FUNC_SET_RANDOM_PRIZE]
  GiveSlateportTentPrize, // [SLATEPORT_TENT_FUNC_GIVE_PRIZE]
  SelectInitialRentalMons, // [SLATEPORT_TENT_FUNC_SELECT_RENT_MONS]
  SwapRentalMons, // [SLATEPORT_TENT_FUNC_SWAP_RENT_MONS]
  GenerateOpponentMons, // [SLATEPORT_TENT_FUNC_GENERATE_OPPONENT_MONS]
  GenerateInitialRentalMons, // [SLATEPORT_TENT_FUNC_GENERATE_RENTAL_MONS]
];

/** 1:1 (battle_tent.c:102) */
const sSlateportTentRewards = Uint16Array.from([
  ITEM_FULL_HEAL,
]);

// code

/** 1:1 `void CallVerdanturfTentFunction(void)` (battle_tent.c:105-108). */
export function CallVerdanturfTentFunction(): void {
  sVerdanturfTentFuncs[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void InitVerdanturfTentChallenge(void)` (battle_tent.c:110-116). */
function InitVerdanturfTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
}

/** 1:1 `static void GetVerdanturfTentPrize(void)` (battle_tent.c:118-121). */
function GetVerdanturfTentPrize(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.verdanturfTentPrize));
}

/** 1:1 `static void SetVerdanturfTentPrize(void)` (battle_tent.c:123-126). */
function SetVerdanturfTentPrize(): void {
  gSaveBlock2Ptr.frontier.verdanturfTentPrize = VarGet(0x8006) /* gSpecialVar_0x8006 */;
}

/** 1:1 `static void SetVerdanturfTentTrainerGfx(void)` (battle_tent.c:128-132). */
function SetVerdanturfTentTrainerGfx(): void {
  setTrainerBattleOpponentA(Math.trunc((((Random() % 255) * 5) >>> 0) / 64)); // 1:1 `gTrainerBattleOpponent_A = (u32)((Random()%255)*5)/64`
  SetBattleFacilityTrainerGfxId(gTrainerBattleOpponent_A, 0);
}

/** 1:1 `static void BufferVerdanturfTentTrainerIntro(void)` (battle_tent.c:134-138). */
function BufferVerdanturfTentTrainerIntro(): void {
  if (gTrainerBattleOpponent_A < FRONTIER_TRAINERS_COUNT)
    FrontierSpeechToString(gFacilityTrainers[gTrainerBattleOpponent_A].speechBefore);
}

/** 1:1 `static void SaveVerdanturfTentChallenge(void)` (battle_tent.c:140-146). */
function SaveVerdanturfTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveGameFrontier();
}

/** 1:1 `static void SetRandomVerdanturfTentPrize(void)` (battle_tent.c:148-151). */
function SetRandomVerdanturfTentPrize(): void {
  gSaveBlock2Ptr.frontier.verdanturfTentPrize = sVerdanturfTentRewards[Random() % sVerdanturfTentRewards.length];
}

/** 1:1 `static void GiveVerdanturfTentPrize(void)` (battle_tent.c:153-165). */
function GiveVerdanturfTentPrize(): void {
  if (AddBagItem(gSaveBlock2Ptr.frontier.verdanturfTentPrize, 1) == true) // 1:1 `== TRUE`
  {
    CopyItemName(gSaveBlock2Ptr.frontier.verdanturfTentPrize, gStringVar1);
    gSaveBlock2Ptr.frontier.verdanturfTentPrize = ITEM_NONE;
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  }
  else
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  }
}

/** 1:1 `void CallFallarborTentFunction(void)` (battle_tent.c:167-170). */
export function CallFallarborTentFunction(): void {
  sFallarborTentFuncs[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void InitFallarborTentChallenge(void)` (battle_tent.c:172-178). */
function InitFallarborTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
}

/** 1:1 `static void GetFallarborTentPrize(void)` (battle_tent.c:180-183). */
function GetFallarborTentPrize(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.fallarborTentPrize));
}

/** 1:1 `static void SetFallarborTentPrize(void)` (battle_tent.c:185-188). */
function SetFallarborTentPrize(): void {
  gSaveBlock2Ptr.frontier.fallarborTentPrize = VarGet(0x8006) /* gSpecialVar_0x8006 */;
}

/** 1:1 `static void SaveFallarborTentChallenge(void)` (battle_tent.c:190-196). */
function SaveFallarborTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveGameFrontier();
}

/** 1:1 `static void SetRandomFallarborTentPrize(void)` (battle_tent.c:198-201). */
function SetRandomFallarborTentPrize(): void {
  gSaveBlock2Ptr.frontier.fallarborTentPrize = sFallarborTentRewards[Random() % sFallarborTentRewards.length];
}

/** 1:1 `static void GiveFallarborTentPrize(void)` (battle_tent.c:203-215). */
function GiveFallarborTentPrize(): void {
  if (AddBagItem(gSaveBlock2Ptr.frontier.fallarborTentPrize, 1) == true) // 1:1 `== TRUE`
  {
    CopyItemName(gSaveBlock2Ptr.frontier.fallarborTentPrize, gStringVar1);
    gSaveBlock2Ptr.frontier.fallarborTentPrize = ITEM_NONE;
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  }
  else
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  }
}

/** 1:1 `static void BufferFallarborTentTrainerName(void)` (battle_tent.c:217-220). */
function BufferFallarborTentTrainerName(): void {
  GetFrontierTrainerName(gStringVar1, gTrainerBattleOpponent_A);
}

/** 1:1 `void CallSlateportTentFunction(void)` (battle_tent.c:222-225). */
export function CallSlateportTentFunction(): void {
  sSlateportTentFuncs[VarGet(0x8004) /* gSpecialVar_0x8004 */]();
}

/** 1:1 `static void InitSlateportTentChallenge(void)` (battle_tent.c:227-233). */
function InitSlateportTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = 0;
  gSaveBlock2Ptr.frontier.curChallengeBattleNum = 0;
  gSaveBlock2Ptr.frontier.challengePaused = false;
  SetDynamicWarp(0, gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE);
}

/** 1:1 `static void GetSlateportTentPrize(void)` (battle_tent.c:235-238). */
function GetSlateportTentPrize(): void {
  VarSet(0x800D /* gSpecialVar_Result */, +(gSaveBlock2Ptr.frontier.slateportTentPrize));
}

/** 1:1 `static void SetSlateportTentPrize(void)` (battle_tent.c:240-243). */
function SetSlateportTentPrize(): void {
  gSaveBlock2Ptr.frontier.slateportTentPrize = VarGet(0x8006) /* gSpecialVar_0x8006 */;
}

/** 1:1 `static void SaveSlateportTentChallenge(void)` (battle_tent.c:245-251). */
function SaveSlateportTentChallenge(): void {
  gSaveBlock2Ptr.frontier.challengeStatus = VarGet(0x8005) /* gSpecialVar_0x8005 */;
  VarSet(VAR_TEMP_CHALLENGE_STATUS, 0);
  gSaveBlock2Ptr.frontier.challengePaused = true;
  SaveGameFrontier();
}

/** 1:1 `static void SetRandomSlateportTentPrize(void)` (battle_tent.c:253-256). */
function SetRandomSlateportTentPrize(): void {
  gSaveBlock2Ptr.frontier.slateportTentPrize = sSlateportTentRewards[Random() % sSlateportTentRewards.length];
}

/** 1:1 `static void GiveSlateportTentPrize(void)` (battle_tent.c:258-270). */
function GiveSlateportTentPrize(): void {
  if (AddBagItem(gSaveBlock2Ptr.frontier.slateportTentPrize, 1) == true) // 1:1 `== TRUE`
  {
    CopyItemName(gSaveBlock2Ptr.frontier.slateportTentPrize, gStringVar1);
    gSaveBlock2Ptr.frontier.slateportTentPrize = ITEM_NONE;
    VarSet(0x800D /* gSpecialVar_Result */, +(true));
  }
  else
  {
    VarSet(0x800D /* gSpecialVar_Result */, +(false));
  }
}

/** 1:1 `static void SelectInitialRentalMons(void)` (battle_tent.c:272-276). */
function SelectInitialRentalMons(): void {
  ZeroPlayerPartyMons();
  DoBattleFactorySelectScreen();
}

/** 1:1 `static void SwapRentalMons(void)` (battle_tent.c:278-281). */
function SwapRentalMons(): void {
  DoBattleFactorySwapScreen();
}

/** 1:1 `bool8 InSlateportBattleTent(void)` (battle_tent.c:283-287). */
export function InSlateportBattleTent(): boolean {
  return gMapHeader?.regionMapSectionId == MAPSEC_SLATEPORT_CITY && (gMapHeader?.mapLayoutId == LAYOUT_BATTLE_TENT_CORRIDOR || gMapHeader?.mapLayoutId == LAYOUT_BATTLE_TENT_BATTLE_ROOM);
}

/** 1:1 `static void GenerateInitialRentalMons(void)` (battle_tent.c:289-350). */
function GenerateInitialRentalMons(): void {
  let i = 0;
  let j = 0;
  let firstMonId = 0;
  let monSetId = 0;
  let currSpecies = 0;
  const species = new Uint16Array(PARTY_SIZE);
  const monIds = new Uint16Array(PARTY_SIZE);
  const heldItems = new Uint16Array(PARTY_SIZE);
  firstMonId = 0;
  gFacilityTrainers = gSlateportBattleTentTrainers;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    species[i] = 0;
    monIds[i] = 0;
    heldItems[i] = 0;
  }
  gFacilityTrainerMons = gSlateportBattleTentMons;
  currSpecies = SPECIES_NONE;
  i = 0;
  while (i != PARTY_SIZE)
  {
    // Cannot have two Pokémon of the same species.
    monSetId = Random() % NUM_SLATEPORT_TENT_MONS;
    for (j = firstMonId; j < firstMonId + i; j++)
    {
      //!< French Difference ? Or is it just because this is an old repo ?
      let monId = monIds[j];
      if (monIds[j] == monSetId)
        break;
      if (species[j] == gFacilityTrainerMons[monSetId].species)
      {
        if (currSpecies == SPECIES_NONE)
          currSpecies = gFacilityTrainerMons[monSetId].species;
        else
          break;
      }
    }
    if (j != i + firstMonId)
      continue;
    // Cannot have two same held items.
    for (j = firstMonId; j < i + firstMonId; j++)
    {
      if (heldItems[j] != 0 && heldItems[j] == gBattleFrontierHeldItems[gFacilityTrainerMons[monSetId].itemTableId])
      {
        if (gFacilityTrainerMons[monSetId].species == currSpecies)
          currSpecies = SPECIES_NONE;
        break;
      }
    }
    if (j != i + firstMonId)
      continue;
    gSaveBlock2Ptr.frontier.rentalMons[i].monId = monSetId;
    species[i] = gFacilityTrainerMons[monSetId].species;
    heldItems[i] = gBattleFrontierHeldItems[gFacilityTrainerMons[monSetId].itemTableId];
    monIds[i] = monSetId;
    i++;
  }
}

/** 1:1 `static void GenerateOpponentMons(void)` (battle_tent.c:352-428). */
function GenerateOpponentMons(): void {
  let trainerId = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let monSet: any = null;
  const species = new Uint16Array(FRONTIER_PARTY_SIZE);
  const heldItems = new Uint16Array(FRONTIER_PARTY_SIZE);
  let numMons = 0;
  gFacilityTrainers = gSlateportBattleTentTrainers;
  gFacilityTrainerMons = gSlateportBattleTentMons;
  while (1)
  {
    do
    {
      // Choose a random trainer, ensuring no repeats in this challenge
      trainerId = Random() % NUM_BATTLE_TENT_TRAINERS;
      for (i = 0; i < gSaveBlock2Ptr.frontier.curChallengeBattleNum; i++)
      {
        if (gSaveBlock2Ptr.frontier.trainerIds[i] == trainerId)
          break;
      }
    }
    while (i != gSaveBlock2Ptr.frontier.curChallengeBattleNum);
    setTrainerBattleOpponentA(trainerId); // 1:1 `gTrainerBattleOpponent_A = trainerId`
    monSet = gFacilityTrainers[gTrainerBattleOpponent_A].monSet;
    while (monSet[numMons] != 0xFFFF)
      numMons++;
    if (numMons > 8)
      break;
    numMons = 0;
  }
  if (gSaveBlock2Ptr.frontier.curChallengeBattleNum < TENT_STAGES_PER_CHALLENGE - 1)
    gSaveBlock2Ptr.frontier.trainerIds[gSaveBlock2Ptr.frontier.curChallengeBattleNum] = gTrainerBattleOpponent_A;
  monSet = gFacilityTrainers[gTrainerBattleOpponent_A].monSet;
  i = 0;
  while (i != FRONTIER_PARTY_SIZE)
  {
    sRandMonId = monSet[Random() % numMons];
    // Ensure none of the opponent's Pokémon are the same as the potential rental Pokémon for the player
    for (j = 0; j < (gSaveBlock2Ptr.frontier.rentalMons.length | 0); j++)
    {
      if (gFacilityTrainerMons[sRandMonId].species == gFacilityTrainerMons[gSaveBlock2Ptr.frontier.rentalMons[j].monId].species)
        break;
    }
    if (j != (gSaveBlock2Ptr.frontier.rentalMons.length | 0))
      continue;
    // Ensure this species hasn't already been chosen for the opponent
    for (k = 0; k < i; k++)
    {
      if (species[k] == gFacilityTrainerMons[sRandMonId].species)
        break;
    }
    if (k != i)
      continue;
    // Ensure held items don't repeat on the opponent's team
    for (k = 0; k < i; k++)
    {
      if (heldItems[k] != ITEM_NONE && heldItems[k] == gBattleFrontierHeldItems[gFacilityTrainerMons[sRandMonId].itemTableId])
        break;
    }
    if (k != i)
      continue;
    // Successful selection
    species[i] = gFacilityTrainerMons[sRandMonId].species;
    heldItems[i] = gBattleFrontierHeldItems[gFacilityTrainerMons[sRandMonId].itemTableId];
    gFrontierTempParty[i] = sRandMonId;
    i++;
  }
}

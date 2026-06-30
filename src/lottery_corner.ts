/**
 * lottery_corner.ts — miroir 1:1 de `src/lottery_corner.c` (la Loterie de
 * Clémenti-Ville / Lilycove : tirage quotidien + matching d'ID de dresseur).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/lottery_corner.c`.
 *
 * Concept :
 *   La Loterie tire chaque jour un nombre 32-bit, stocké en deux vars u16
 *   (VAR_POKELOT_RND1 = 16 bits bas, VAR_POKELOT_RND2 = 16 bits hauts).
 *   `SetRandomLotteryNumber(days)` est appelée par `UpdatePerDay` (clock.c:54) :
 *   elle repart de `Random()` puis applique `ISO_RANDOMIZE2` `days` fois.
 *   `PickLotteryCornerTicket` compare l'OT_ID de chaque POKéMON (party + boîtes PC)
 *   au nombre (digits LSB→MSB) ; ≥ 2 digits matchant → prix.
 *
 * 1:1 : les 8 fonctions de lottery_corner.c vivent ICI (foyer miroir). Les
 * specials réels (`RetrieveLotteryNumber`/`PickLotteryCornerTicket` ; ainsi que
 * `ResetLotteryCorner`, appelé hors-script) sont enregistrés depuis
 * specials-registry.ts (= table gSpecials) qui importe ces fns.
 *
 * Adaptation ASSUMÉE : `sLotteryPrizes[]` (décomp = u16 item ids résolus à la
 * compilation) → clés string résolues à l'exécution via resolveDecompConstant.
 */

import { VarGet, VarSet, gSpecialVar } from './engine/script/script-vars';
import { Random } from './random';
import { ISO_RANDOMIZE2 } from '../include/random';
import {
  gPlayerParty, GetMonData as _GetMonData,
  MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_OT_ID, MON_DATA_NICKNAME,
} from './engine/battle/party-storage';
import { GetPokemonStorage } from './save';
import { setStringVar } from '../include/text';
import { PARTY_SIZE } from '../include/constants/global';
import { gSpeciesNames } from './engine/data/game-data';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';

const VAR_POKELOT_RND1 = 'VAR_POKELOT_RND1';  // 16 bits BAS du nombre.
const VAR_POKELOT_RND2 = 'VAR_POKELOT_RND2';  // 16 bits HAUTS du nombre.

/** 1:1 décomp `sLotteryPrizes[]` (lottery_corner.c:14-20). 4 prix indexés par
 *  (digits matchant - 1) : 2/3/4/5 digits → PP_UP/EXP_SHARE/MAX_REVIVE/MASTER_BALL. */
const sLotteryPrizes = ['ITEM_PP_UP', 'ITEM_EXP_SHARE', 'ITEM_MAX_REVIVE', 'ITEM_MASTER_BALL'] as const;

/** 1:1 décomp `ResetLotteryCorner(void)` (lottery_corner.c:24-30) :
 *    u16 rand = Random();
 *    SetLotteryNumber((Random() << 16) | rand);
 *    VarSet(VAR_POKELOT_PRIZE_ITEM, 0); */
export function ResetLotteryCorner(): void {
  const rand = Random() & 0xFFFF;
  SetLotteryNumber((((Random() & 0xFFFF) << 16) | rand) >>> 0);
  VarSet('VAR_POKELOT_PRIZE_ITEM', 0);
}

/** 1:1 décomp `SetRandomLotteryNumber(u16 i)` (lottery_corner.c:32-40) :
 *    u32 var = Random();
 *    while (--i != 0xFFFF) var = ISO_RANDOMIZE2(var);
 *    SetLotteryNumber(var);
 *  Appelée par UpdatePerDay(daysSince). `--i` est en u16 (underflow → 0xFFFF stoppe). */
export function SetRandomLotteryNumber(i: number): void {
  let v = Random() >>> 0;
  i = i & 0xFFFF;
  while (true) {
    i = (i - 1) & 0xFFFF;
    if (i === 0xFFFF) break;
    v = ISO_RANDOMIZE2(v);
  }
  SetLotteryNumber(v);
}

/** 1:1 décomp `RetrieveLotteryNumber(void)` (lottery_corner.c:42-46) :
 *    u16 lottoNumber = GetLotteryNumber();
 *    gSpecialVar_Result = lottoNumber;
 *  (GetLotteryNumber renvoie u32 mais affecté à u16 → tronqué = VAR_POKELOT_RND1.) */
export function RetrieveLotteryNumber(): number {
  const lottoNumber = GetLotteryNumber() & 0xFFFF;
  gSpecialVar.Result = lottoNumber;
  return lottoNumber;
}

/** 1:1 décomp `PickLotteryCornerTicket(void)` (lottery_corner.c:48-120).
 *
 *  Itère la party + toutes les boîtes PC pour trouver le mon avec le plus de
 *  digits matchant le lotto number (max 5). Si ≥ 2 digits → prix = sLotteryPrizes
 *  [matching - 1] + buffer nickname.
 *
 *  Output via gSpecialVar :
 *    Result = lotto number
 *    0x8004 = matching digits - 1 (= prize index 0..3, 0 = perdu)
 *    0x8005 = sLotteryPrizes[idx] (= itemId du prix)
 *    0x8006 = 0 (party) | 1 (PC)
 *    StringVar1 = nickname du mon gagnant */
export function PickLotteryCornerTicket(): void {
  // 1:1 :44 : lotto number = GetLotteryNumber() & 0xFFFF (= u16).
  const highNum = VarGet(VAR_POKELOT_RND1);
  const lowNum = VarGet(VAR_POKELOT_RND2);
  const lottoNumber = ((((lowNum & 0xFFFF) << 16) | (highNum & 0xFFFF)) & 0xFFFF) >>> 0;

  let bestMatching = 0;
  let bestSlot = 0;
  let bestBox = 0;  // 0 = party, TOTAL_BOXES_COUNT = party marker dans décomp
  const TOTAL_BOXES_COUNT = 14;
  const IN_BOX_COUNT = 30;

  // 1:1 :58-82 : loop party (break au premier SPECIES_NONE).
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if ((_GetMonData(mon, MON_DATA_SPECIES) as number) === 0) break;
    // skip eggs (= 1:1 :65-77).
    if (_GetMonData(mon, MON_DATA_IS_EGG) as number) continue;
    const otId = (_GetMonData(mon, MON_DATA_OT_ID) as number) >>> 0;
    const matching = GetMatchingDigits(lottoNumber, otId & 0xFFFF);
    if (matching > bestMatching && matching > 1) {
      bestMatching = matching - 1;
      bestBox = TOTAL_BOXES_COUNT;  // = party marker
      bestSlot = i;
    }
  }

  // 1:1 :84-102 : loop boîtes PC. Slots = `PokemonInstance | null` (speciesId 0 =
  // SPECIES_NONE, isEgg flag). Partage `bestMatching` avec la party (= gSpecialVar
  // _0x8004 dans la décomp ; comparaison `matching > bestMatching` où bestMatching
  // tient déjà `prevMatching - 1` → ties vont au mon plus tardif, 1:1 strict).
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const slot = boxes[i]?.[j];
      if (slot && slot.speciesId && !slot.isEgg) {
        const otId = (slot.otId ?? 0) >>> 0;
        const matching = GetMatchingDigits(lottoNumber, otId & 0xFFFF);
        if (matching > bestMatching && matching > 1) {
          bestMatching = matching - 1;
          bestBox = i;  // index de boîte (0..13, != TOTAL_BOXES_COUNT)
          bestSlot = j;
        }
      }
    }
  }

  gSpecialVar.Result = lottoNumber;
  VarSet('VAR_0x8004', bestMatching);
  if (bestMatching !== 0) {
    // 1:1 :106 : prix = sLotteryPrizes[matching-1].
    const prizeKey = sLotteryPrizes[bestMatching - 1];
    const prizeId = resolveDecompConstant(prizeKey) ?? 0;
    VarSet('VAR_0x8005', prizeId);
    // 1:1 :108-117 : box marker + nickname buffer.
    if (bestBox === TOTAL_BOXES_COUNT) {
      VarSet('VAR_0x8006', 0);  // party
      const winner = gPlayerParty[bestSlot];
      setStringVar(1, (_GetMonData(winner, MON_DATA_NICKNAME) as string)
        || (gSpeciesNames[_GetMonData(winner, MON_DATA_SPECIES) as number] ?? ''));
    } else {
      VarSet('VAR_0x8006', 1);  // PC
      const winner = boxes[bestBox]?.[bestSlot];
      setStringVar(1, (winner?.nickname)
        || (gSpeciesNames[(winner?.speciesId ?? 0)] ?? ''));
    }
  }
}

/** 1:1 décomp `GetMatchingDigits(u16 winNumber, u16 otId)` (lottery_corner.c:122-144) :
 *  compte les digits LSB → MSB jusqu'au premier mismatch (= max 5). */
export function GetMatchingDigits(winNumber: number, otId: number): number {
  let matchingDigits = 0;
  for (let i = 0; i < 5; i++) {
    const winNumberDigit = winNumber % 10;
    const otIdDigit = otId % 10;
    if (winNumberDigit === otIdDigit) {
      winNumber = Math.floor(winNumber / 10);
      otId = Math.floor(otId / 10);
      matchingDigits++;
    } else {
      break;
    }
  }
  return matchingDigits;
}

/** 1:1 décomp `SetLotteryNumber(u32 lotteryNum)` (lottery_corner.c:147-154) :
 *    u16 lowNum = lotteryNum >> 16; u16 highNum = lotteryNum;
 *    VarSet(VAR_POKELOT_RND1, highNum); VarSet(VAR_POKELOT_RND2, lowNum); */
export function SetLotteryNumber(lotteryNum: number): void {
  const lowNum = (lotteryNum >>> 16) & 0xFFFF;
  const highNum = lotteryNum & 0xFFFF;
  VarSet(VAR_POKELOT_RND1, highNum);
  VarSet(VAR_POKELOT_RND2, lowNum);
}

/** 1:1 décomp `GetLotteryNumber(void)` (lottery_corner.c:156-162) :
 *    u16 highNum = VarGet(VAR_POKELOT_RND1); u16 lowNum = VarGet(VAR_POKELOT_RND2);
 *    return (lowNum << 16) | highNum;
 *  (noms décomp inversés ; RND1 = 16 bits bas, RND2 = 16 bits hauts). */
export function GetLotteryNumber(): number {
  const highNum = VarGet(VAR_POKELOT_RND1);
  const lowNum = VarGet(VAR_POKELOT_RND2);
  return (((lowNum & 0xFFFF) << 16) | (highNum & 0xFFFF)) >>> 0;
}

/** 1:1 décomp `SetLotteryNumber16_Unused(u16 lotteryNum)` (lottery_corner.c:165-168).
 *  Inutilisé dans la décomp (vestige d'une transition 16→32 bits inachevée). */
export function SetLotteryNumber16_Unused(lotteryNum: number): void {
  SetLotteryNumber(lotteryNum & 0xFFFF);
}

// Exposition dev (sondes déterministes), sans effet sur le jeu.
{
  const _g = globalThis as Record<string, unknown>;
  _g.__SetRandomLotteryNumber = SetRandomLotteryNumber;
  _g.__GetLotteryNumber = GetLotteryNumber;
  _g.__SetLotteryNumber = SetLotteryNumber;
  _g.__pickLotteryCornerTicket = PickLotteryCornerTicket;
}

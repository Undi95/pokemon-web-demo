/**
 * lottery_corner.ts — miroir 1:1 PARTIEL de `src/lottery_corner.c` (le nombre de
 * loterie : stockage + tirage quotidien).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/lottery_corner.c`.
 *
 * Concept :
 *   La Loterie de Clémenti-Ville (Lilycove) tire chaque jour un nombre 32-bit, stocké
 *   en deux vars u16 (VAR_POKELOT_RND1 = 16 bits bas, VAR_POKELOT_RND2 = 16 bits hauts).
 *   `SetRandomLotteryNumber(days)` est appelée par `UpdatePerDay` (clock.c:54) : elle
 *   repart de `Random()` puis applique `ISO_RANDOMIZE2` `days` fois. Le joueur compare
 *   ensuite l'ID de dresseur de ses POKéMON au nombre (PickLotteryCornerTicket).
 *
 *  Avant : le tirage n'était PAS câblé (faux special spurious lisant VAR_0x8004 +
 *  inline RNG buggé) → le nombre ne changeait jamais. Ici : foyer 1:1 propre + wire.
 *
 *  Note : `PickLotteryCornerTicket` (le matching de prix) + `ResetLotteryCorner` /
 *  `RetrieveLotteryNumber` restent côté specials-registry (specials réels) ; ils
 *  utilisent désormais `SetLotteryNumber`/`GetLotteryNumber` d'ici (dédup).
 */

import { VarGet, VarSet } from './engine/script/script-vars';
import { Random } from './random';
import { ISO_RANDOMIZE2 } from '../include/random';

const VAR_POKELOT_RND1 = 'VAR_POKELOT_RND1';  // 16 bits BAS du nombre.
const VAR_POKELOT_RND2 = 'VAR_POKELOT_RND2';  // 16 bits HAUTS du nombre.

/** 1:1 décomp `GetLotteryNumber(void)` (lottery_corner.c:156) :
 *    u16 highNum = VarGet(VAR_POKELOT_RND1); u16 lowNum = VarGet(VAR_POKELOT_RND2);
 *    return (lowNum << 16) | highNum;
 *  (noms décomp inversés ; RND1 = 16 bits bas, RND2 = 16 bits hauts). */
export function GetLotteryNumber(): number {
  const highNum = VarGet(VAR_POKELOT_RND1);
  const lowNum = VarGet(VAR_POKELOT_RND2);
  return ((lowNum << 16) | highNum) >>> 0;
}

/** 1:1 décomp `SetLotteryNumber(u32 lotteryNum)` (lottery_corner.c:147) :
 *    u16 lowNum = lotteryNum >> 16; u16 highNum = lotteryNum;
 *    VarSet(VAR_POKELOT_RND1, highNum); VarSet(VAR_POKELOT_RND2, lowNum); */
export function SetLotteryNumber(lotteryNum: number): void {
  const lowNum = (lotteryNum >>> 16) & 0xFFFF;
  const highNum = lotteryNum & 0xFFFF;
  VarSet(VAR_POKELOT_RND1, highNum);
  VarSet(VAR_POKELOT_RND2, lowNum);
}

/** 1:1 décomp `SetRandomLotteryNumber(u16 i)` (lottery_corner.c:32) :
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

// Exposition dev (sonde déterministe), sans effet sur le jeu.
{
  const _g = globalThis as Record<string, unknown>;
  _g.__SetRandomLotteryNumber = SetRandomLotteryNumber;
  _g.__GetLotteryNumber = GetLotteryNumber;
  _g.__SetLotteryNumber = SetLotteryNumber;
}

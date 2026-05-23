/**
 * money.ts — Port 1:1 STRICT de `D:/Projet 1/decomps/pokeemeraude/src/money.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) : `decomps/pokeemeraude/src/money.c`
 *
 * Adaptation modèle TS : le décomp utilise des pointeurs `u32 *moneyPtr` car
 * `gSaveBlock1Ptr->money` est encodé XOR avec `gSaveBlock2Ptr->encryptionKey`.
 * Chez nous, `gSaveBlock1Ptr.money` est un number direct (= simplification web,
 * pas de XOR encryption). Donc les fonctions GetMoney/SetMoney prennent un
 * "money holder" object/setter au lieu d'un pointeur. AddMoney/RemoveMoney
 * opèrent directement sur `gSaveBlock1Ptr.money` (= signature simplifiée
 * `(toAdd | toSub)` au lieu de `(moneyPtr, toAdd|toSub)`, équivalent strict
 * pour notre modèle).
 *
 * Décomp comportement préservé :
 *   - MAX_MONEY = 999999 (= cap absolu)
 *   - AddMoney : check overflow → MAX_MONEY
 *   - RemoveMoney : check underflow → 0
 *   - IsEnoughMoney : compare avec coût
 */

import { gSaveBlock1Ptr } from './save-block-state';

/** 1:1 décomp `#define MAX_MONEY 999999` (money.c:13). */
export const MAX_MONEY = 999999;

/** 1:1 décomp `u32 GetMoney(u32 *moneyPtr)` (money.c:72-75) :
 *  ```c
 *  return *moneyPtr ^ gSaveBlock2Ptr->encryptionKey;
 *  ```
 *  Notre modèle : pas d'encryption XOR (= gSaveBlock1Ptr.money est number
 *  direct). Signature simplifiée sans pointer. */
export function GetMoney(): number {
  return gSaveBlock1Ptr.money;
}

/** 1:1 décomp `void SetMoney(u32 *moneyPtr, u32 newValue)` (money.c:77-80). */
export function SetMoney(newValue: number): void {
  gSaveBlock1Ptr.money = newValue;
}

/** 1:1 décomp `bool8 IsEnoughMoney(u32 *moneyPtr, u32 cost)` (money.c:82-88). */
export function IsEnoughMoney(cost: number): boolean {
  return GetMoney() >= cost;
}

/** 1:1 décomp `void AddMoney(u32 *moneyPtr, u32 toAdd)` (money.c:90-108) :
 *  ```c
 *  u32 toSet = GetMoney(moneyPtr);
 *  if (toSet + toAdd > MAX_MONEY) {
 *      toSet = MAX_MONEY;
 *  } else {
 *      toSet += toAdd;
 *      if (toSet < GetMoney(moneyPtr))  // overflow check
 *          toSet = MAX_MONEY;
 *  }
 *  SetMoney(moneyPtr, toSet);
 *  ```
 */
export function AddMoney(toAdd: number): void {
  const current = GetMoney();
  let toSet: number;
  if (current + toAdd > MAX_MONEY) {
    toSet = MAX_MONEY;
  } else {
    toSet = current + toAdd;
    // 1:1 :103 check overflow (= u32 wrap dans le décomp). JS number n'overflow
    // pas mais on garde la check pour préserver la sémantique.
    if (toSet < current) toSet = MAX_MONEY;
  }
  SetMoney(toSet);
}

/** 1:1 décomp `void RemoveMoney(u32 *moneyPtr, u32 toSub)` (money.c:110-118). */
export function RemoveMoney(toSub: number): void {
  const current = GetMoney();
  let toSet: number;
  if (current < toSub) {
    toSet = 0;
  } else {
    toSet = current - toSub;
  }
  SetMoney(toSet);
}

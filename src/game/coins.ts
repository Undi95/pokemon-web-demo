/**
 * coins.ts — Port 1:1 STRICT de `D:/Projet 1/decomps/pokeemeraude/src/coins.c`
 * (accesseurs LOGIQUES uniquement ; les fonctions UI `PrintCoinsString` /
 * `ShowCoinsWindow` / `HideCoinsWindow` sont visuelles → côté UI séparément).
 *
 * Source de vérité (= ne JAMAIS diverger) : `decomps/pokeemeraude/src/coins.c`
 * + `include/constants/coins.h`.
 *
 * Adaptation modèle TS (identique à money.ts) : le décomp encode
 * `gSaveBlock1Ptr->coins` en XOR avec `gSaveBlock2Ptr->encryptionKey`. Chez nous
 * `gSaveBlock1Ptr.coins` est un number direct (`encryptionKey` est toujours 0
 * dans notre runtime web) → Get/SetCoins n'appliquent pas le XOR (équivalent
 * strict : `coins ^ 0 === coins`). Cf. la même décision documentée dans money.ts.
 */

import { gSaveBlock1Ptr } from '../engine/save/save-block-state';

/** 1:1 décomp `#define MAX_COINS 9999` (constants/coins.h:4). */
export const MAX_COINS = 9999;

/** 1:1 décomp `u16 GetCoins(void)` (coins.c:47-50) :
 *  ```c
 *  return gSaveBlock1Ptr->coins ^ gSaveBlock2Ptr->encryptionKey;
 *  ```
 *  (encryptionKey=0 chez nous → lecture directe). */
export function GetCoins(): number {
  return gSaveBlock1Ptr.coins ?? 0;
}

/** 1:1 décomp `void SetCoins(u16 coinAmount)` (coins.c:52-55). */
export function SetCoins(coinAmount: number): void {
  gSaveBlock1Ptr.coins = coinAmount;
}

/** 1:1 décomp `bool8 AddCoins(u16 toAdd)` (coins.c:57-77) :
 *  ```c
 *  u16 ownedCoins = GetCoins();
 *  if (ownedCoins >= MAX_COINS)
 *      return FALSE;
 *  if (ownedCoins > ownedCoins + toAdd)   // check overflow u16
 *      newAmount = MAX_COINS;
 *  else {
 *      ownedCoins += toAdd;
 *      if (ownedCoins > MAX_COINS) ownedCoins = MAX_COINS;
 *      newAmount = ownedCoins;
 *  }
 *  SetCoins(newAmount);
 *  return TRUE;
 *  ```
 */
export function AddCoins(toAdd: number): boolean {
  const ownedCoins = GetCoins();
  if (ownedCoins >= MAX_COINS) return false;
  let newAmount: number;
  // 1:1 coins.c:64 — check overflow u16 (= wrap dans le décomp). JS number
  // n'overflow pas, mais on conserve la check pour la sémantique stricte.
  if (ownedCoins > ownedCoins + toAdd) {
    newAmount = MAX_COINS;
  } else {
    let v = ownedCoins + toAdd;
    if (v > MAX_COINS) v = MAX_COINS;
    newAmount = v;
  }
  SetCoins(newAmount);
  return true;
}

/** 1:1 décomp `bool8 RemoveCoins(u16 toSub)` (coins.c:79-88) :
 *  ```c
 *  u16 ownedCoins = GetCoins();
 *  if (ownedCoins >= toSub) { SetCoins(ownedCoins - toSub); return TRUE; }
 *  return FALSE;
 *  ```
 */
export function RemoveCoins(toSub: number): boolean {
  const ownedCoins = GetCoins();
  if (ownedCoins >= toSub) {
    SetCoins(ownedCoins - toSub);
    return true;
  }
  return false;
}

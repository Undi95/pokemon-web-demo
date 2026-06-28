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

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ClearStdWindowAndFrame, DrawStdFrameWithCustomTileAndPalette,
  type WindowTemplate,
} from './window';
import { AddTextPrinterParameterized3 } from './menu';

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

// ─── Coins box UI — 1:1 décomp coins.c:22-44 ─────────────────────────────────
// Fenêtre coins 8×2 affichée en haut pendant le casino. "PIÈCES <count>" right-aligned.
const FONT_SMALL = 1;
const COLOR_BG_FG_SHADOW: [number, number, number] = [1, 2, 3];

let _coinsBoxWindowId = -1;

/** 1:1 décomp `ShowCoinsWindow(coinAmount, x, y)` (coins.c:33). */
export function ShowCoinsWindow(coinAmount: number, x: number, y: number): void {
  if (_coinsBoxWindowId >= 0) {
    PrintCoinsString(coinAmount);
    return;
  }
  const tmpl: WindowTemplate = {
    bg: 0, tilemapLeft: x + 1, tilemapTop: y + 1,
    width: 8, height: 2, paletteNum: 15, baseBlock: 0x8,
  };
  _coinsBoxWindowId = AddWindow(tmpl);
  if (_coinsBoxWindowId < 0) return;
  DrawStdFrameWithCustomTileAndPalette(_coinsBoxWindowId, false, 0x214, 14);
  FillWindowPixelBuffer(_coinsBoxWindowId, 0x11);
  PutWindowTilemap(_coinsBoxWindowId);
  PrintCoinsString(coinAmount);
  CopyWindowToVram(_coinsBoxWindowId, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `HideCoinsWindow` (coins.c:44). */
export function HideCoinsWindow(): void {
  if (_coinsBoxWindowId < 0) return;
  ClearStdWindowAndFrame(_coinsBoxWindowId, true);
  RemoveWindow(_coinsBoxWindowId);
  _coinsBoxWindowId = -1;
}

/** 1:1 décomp `PrintCoinsString(coinAmount)` (coins.c:22). Format "PIÈCES <count>"
 *  right-aligned (décomp : gText_CoinsVar1 = "PIÈCES {STR_VAR_1}"). */
export function PrintCoinsString(coinAmount: number): void {
  if (_coinsBoxWindowId < 0) return;
  FillWindowPixelBuffer(_coinsBoxWindowId, 0x11);
  const text = `PIÈCES ${coinAmount}`;
  AddTextPrinterParameterized3(
    _coinsBoxWindowId, FONT_SMALL, 4, 1, COLOR_BG_FG_SHADOW, 0, text,
  );
  CopyWindowToVram(_coinsBoxWindowId, 2 /* COPYWIN_GFX */);
}

// Enregistre les helpers coins box sur globalThis.__moneyBoxUI (lus par les opcodes
// coins-box de scrcmd.ts, accès LAZY). `??=` + assign → coexiste avec money.ts.
{
  const api = ((globalThis as Record<string, unknown>).__moneyBoxUI ??= {}) as Record<string, unknown>;
  api.ShowCoinsWindow = ShowCoinsWindow;
  api.HideCoinsWindow = HideCoinsWindow;
  api.PrintCoinsString = PrintCoinsString;
  api._getCoins = GetCoins;
}

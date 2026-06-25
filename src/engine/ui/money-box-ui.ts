/**
 * money-box-ui.ts — Money/Coins box UI 1:1 décomp `src/money.c` + `src/coins.c`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/money.c:DrawMoneyBox / HideMoneyBox /
 *     ChangeAmountInMoneyBox / PrintMoneyAmountInMoneyBoxWithBorder`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/coins.c:ShowCoinsWindow / HideCoinsWindow /
 *     PrintCoinsString`
 *
 * Concept :
 *   Affiche une fenêtre money/coins en haut de l'écran pendant les transactions
 *   shop / casino. Fenêtre 10x2 tiles, palette 12 (= std menu), frame border.
 *
 *   Money box : "ARGENT 123456¥" avec label (= sprite) + frame border.
 *   Coins box : "PIÈCES 1234" sans sprite label.
 *
 *   Notre port : utilise AddWindow + DrawStdFrameWithCustomTileAndPalette +
 *   AddTextPrinterParameterized3 — pattern identique au bag/start-menu existant.
 */

import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ClearStdWindowAndFrame, DrawStdFrameWithCustomTileAndPalette,
  type WindowTemplate,
} from './gba-window-system';
import { AddTextPrinterParameterized3, CHAR_SPACER_STR } from './gba-text-system';
// 1:1 décomp `gSaveBlock1Ptr->money/coins` (= struct SaveBlock1 fields). Foundation
// `save-block-state` permet l'import direct (= élimine pattern globalThis non-1:1).
import { gSaveBlock1Ptr } from '../save/save-block-state';

// 1:1 décomp `text.h` enum FontIds : FONT_SMALL=0, FONT_NORMAL=1.
// BUG racine du « font de l'argent » : FONT_NORMAL valait 0 (= FONT_SMALL) → la money box
// imprimait le montant en petit font, et le CHAR_SPACER demi-largeur du petit font ratait
// l'alignement à droite. `PrintMoneyAmount` (money.c:138) utilise FONT_NORMAL (=1).
const FONT_NORMAL = 1;
const FONT_SMALL = 1;  // (casino coins, hors-scope mart — séparé)
const COLOR_BG_FG_SHADOW: [number, number, number] = [1, 2, 3];

// ─── Money box state ────────────────────────────────────────────────────────

let _moneyBoxWindowId = -1;

function _getMoney(): number {
  return (gSaveBlock1Ptr.money as number) ?? 0;
}

/** 1:1 décomp `DrawMoneyBox(amount, x, y)` (money.c:117).
 *  Add window 10×2 à (x+1, y+1), fill, draw frame border, print amount with ₽. */
export function DrawMoneyBox(amount: number, x: number, y: number): void {
  if (_moneyBoxWindowId >= 0) {
    // Already shown, just refresh content.
    ChangeAmountInMoneyBox(amount);
    return;
  }
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: x + 1,
    tilemapTop: y + 1,
    width: 10,
    height: 2,
    paletteNum: 15,  // std menu palette
    baseBlock: 0x8,
  };
  _moneyBoxWindowId = AddWindow(tmpl);
  if (_moneyBoxWindowId < 0) return;
  // 1:1 décomp PrintMoneyAmountInMoneyBoxWithBorder :
  //   DrawStdFrameWithCustomTileAndPalette(wid, FALSE, 0x214, 14);
  //   PrintMoneyAmountInMoneyBox(wid, amount, 0);
  DrawStdFrameWithCustomTileAndPalette(_moneyBoxWindowId, false, 0x214, 14);
  FillWindowPixelBuffer(_moneyBoxWindowId, 0x11);
  PutWindowTilemap(_moneyBoxWindowId);
  _printAmountInMoneyBox(amount);
  CopyWindowToVram(_moneyBoxWindowId, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `HideMoneyBox` (money.c:130). */
export function HideMoneyBox(): void {
  if (_moneyBoxWindowId < 0) return;
  ClearStdWindowAndFrame(_moneyBoxWindowId, true);
  RemoveWindow(_moneyBoxWindowId);
  _moneyBoxWindowId = -1;
}

/** 1:1 décomp `ChangeAmountInMoneyBox(amount)` (money.c:112). */
export function ChangeAmountInMoneyBox(amount: number): void {
  if (_moneyBoxWindowId < 0) return;
  FillWindowPixelBuffer(_moneyBoxWindowId, 0x11);
  _printAmountInMoneyBox(amount);
  CopyWindowToVram(_moneyBoxWindowId, 2 /* COPYWIN_GFX */);
}

/** 1:1 décomp `PrintMoneyAmount(windowId, x, y, amount, speed)` (money.c:138) :
 *  ConvertIntToDecimalStringN(LEFT_ALIGN, 6) → pad `CHAR_SPACER` à gauche (champ 6
 *  large = alignement à droite) → StringExpandPlaceholders(gText_PokedollarVar1 =
 *  "{STR_VAR_1}¥"). Le symbole monnaie est **¥** (charmap décomp, = même glyphe que
 *  shop.ts/trainer_card), PAS `₽` (Unicode non mappé par notre font → signe invisible). */
function _printAmountInMoneyBox(amount: number): void {
  if (_moneyBoxWindowId < 0) return;
  const numStr = String(amount >>> 0);
  const pad = Math.max(0, 6 - numStr.length);
  const text = CHAR_SPACER_STR.repeat(pad) + numStr + '¥';
  AddTextPrinterParameterized3(
    _moneyBoxWindowId, FONT_NORMAL, 38, 1, COLOR_BG_FG_SHADOW, 0, text,
  );
}

// ─── Coins box state ────────────────────────────────────────────────────────

let _coinsBoxWindowId = -1;

function _getCoins(): number {
  return (gSaveBlock1Ptr.coins as number) ?? 0;
}

/** 1:1 décomp `ShowCoinsWindow(coinAmount, x, y)` (coins.c:33). */
export function ShowCoinsWindow(coinAmount: number, x: number, y: number): void {
  if (_coinsBoxWindowId >= 0) {
    PrintCoinsString(coinAmount);
    return;
  }
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: x + 1,
    tilemapTop: y + 1,
    width: 8,
    height: 2,
    paletteNum: 15,
    baseBlock: 0x8,
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

/** 1:1 décomp `PrintCoinsString(coinAmount)` (coins.c:22). */
export function PrintCoinsString(coinAmount: number): void {
  if (_coinsBoxWindowId < 0) return;
  FillWindowPixelBuffer(_coinsBoxWindowId, 0x11);
  // Format : "PIÈCES <count>" right-aligned. Décomp utilise gText_CoinsVar1
  // placeholder qui expand en "PIÈCES {STR_VAR_1}".
  const text = `PIÈCES ${coinAmount}`;
  AddTextPrinterParameterized3(
    _coinsBoxWindowId, FONT_SMALL, 4, 1, COLOR_BG_FG_SHADOW, 0, text,
  );
  CopyWindowToVram(_coinsBoxWindowId, 2 /* COPYWIN_GFX */);
}

// ─── Auto-register helpers used par opcodes via globalThis ──────────────────

(globalThis as Record<string, unknown>).__moneyBoxUI = {
  DrawMoneyBox, HideMoneyBox, ChangeAmountInMoneyBox,
  ShowCoinsWindow, HideCoinsWindow, PrintCoinsString,
  _getMoney, _getCoins,
};

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

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { getRuntime, assetCache, LoadCompressedSpriteSheet, LoadSpritePalette, FreeSpriteTilesByTag } from '../harness/runtime/decomp-globals';
import { FreeSpritePaletteByTag, DestroySprite, IndexOfSpritePaletteTag, GetSpriteTileStartByTag } from './sprite';
import { loadTileBin, extractPngPlte } from '../harness/gba/png-loader';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ClearStdWindowAndFrame, DrawStdFrameWithCustomTileAndPalette,
  type WindowTemplate,
} from './window';
import { CHAR_SPACER_STR } from './text';
import { AddTextPrinterParameterized3 } from './menu';

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

// ─── Money box UI — 1:1 décomp money.c:112-178 ──────────────────────────────
// Fenêtre money 10×2 affichée en haut pendant les transactions shop. Notre port :
// AddWindow + DrawStdFrameWithCustomTileAndPalette + AddTextPrinterParameterized3.

// 1:1 décomp `text.h` enum FontIds : FONT_NORMAL=1. (BUG racine « font de l'argent » :
// si FONT_NORMAL valait 0 = FONT_SMALL, le montant s'imprime en petit + le CHAR_SPACER
// demi-largeur rate l'alignement à droite. PrintMoneyAmount (money.c:138) → FONT_NORMAL.)
const FONT_NORMAL = 1;
const COLOR_BG_FG_SHADOW: [number, number, number] = [1, 2, 3];

let _moneyBoxWindowId = -1;

/** 1:1 décomp `DrawMoneyBox(amount, x, y)` (money.c:117).
 *  Add window 10×2 à (x+1, y+1), fill, draw frame border, print amount avec ¥. */
export function DrawMoneyBox(amount: number, x: number, y: number): void {
  if (_moneyBoxWindowId >= 0) {
    // Already shown, just refresh content.
    ChangeAmountInMoneyBox(amount);
    return;
  }
  const tmpl: WindowTemplate = {
    bg: 0, tilemapLeft: x + 1, tilemapTop: y + 1,
    width: 10, height: 2, paletteNum: 15 /* std menu */, baseBlock: 0x8,
  };
  _moneyBoxWindowId = AddWindow(tmpl);
  if (_moneyBoxWindowId < 0) return;
  // 1:1 décomp PrintMoneyAmountInMoneyBoxWithBorder : DrawStdFrame(wid, FALSE, 0x214, 14)
  // + PrintMoneyAmountInMoneyBox(wid, amount, 0).
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
 *  ConvertIntToDecimalStringN(LEFT_ALIGN, 6) → pad `CHAR_SPACER` à gauche (champ 6 large
 *  = alignement à droite) → StringExpandPlaceholders(gText_PokedollarVar1 = "{STR_VAR_1}¥").
 *  Le symbole monnaie est **¥** (charmap décomp), PAS `₽` (Unicode non mappé).
 *
 *  Opère sur un `windowId` DONNÉ (1:1) : le shop l'appelle sur sa fenêtre WIN_MONEY ; la
 *  money box overworld passe `_moneyBoxWindowId`. */
export function PrintMoneyAmount(windowId: number, x: number, y: number, amount: number, speed: number): void {
  if (windowId < 0) return;
  const numStr = String(amount >>> 0);
  const pad = Math.max(0, 6 - numStr.length);
  const text = CHAR_SPACER_STR.repeat(pad) + numStr + '¥';
  AddTextPrinterParameterized3(windowId, FONT_NORMAL, x, y, COLOR_BG_FG_SHADOW, speed, text);
}

/** 1:1 décomp `PrintMoneyAmountInMoneyBox(windowId, amount, speed)` (money.c:133). */
export function PrintMoneyAmountInMoneyBox(windowId: number, amount: number, speed: number): void {
  PrintMoneyAmount(windowId, 38, 1, amount, speed);
}

/** 1:1 décomp `PrintMoneyAmountInMoneyBoxWithBorder(windowId, tileStart, pallete, amount)`
 *  (money.c:155). C'est CETTE fonction (tile/palette PARAMÉTRÉS) que le buy-menu appelle
 *  avec (1, 13) sur sa propre fenêtre WIN_MONEY. */
export function PrintMoneyAmountInMoneyBoxWithBorder(windowId: number, tileStart: number, pallete: number, amount: number): void {
  DrawStdFrameWithCustomTileAndPalette(windowId, false, tileStart, pallete);
  PrintMoneyAmountInMoneyBox(windowId, amount, 0);
}

/** Money box overworld (= _moneyBoxWindowId) — applique `PrintMoneyAmountInMoneyBox`. */
function _printAmountInMoneyBox(amount: number): void {
  PrintMoneyAmountInMoneyBox(_moneyBoxWindowId, amount, 0);
}

// ─── Label "ARGENT" (sprite) — 1:1 décomp money.c:187-197 ────────────────────
// gSpriteSheet_MoneyLabel = graphics/interface/money.png (WIDE 32×16, 4bpp), tag
// TAG_MONEY (= 2120 chez nous). Asset chargé async (PNG) + mis en cache module.
const TAG_MONEY_LABEL = 2120;
let sMoneyLabelSpriteId = -1;            // 1:1 décomp money.c `sMoneyLabelSpriteId`
let _moneyLabelTiles: Uint8Array | null = null;
let _moneyLabelPal: Uint16Array | null = null;
let _moneyLabelLoading = false;

/** Précharge l'asset du label ARGENT (money.png). Idempotent, mis en cache. À
 *  appeler avant le 1er AddMoneyLabelObject (shop : au load assets ; sac : à
 *  l'entrée mode vente). */
export async function PreloadMoneyLabelAsset(): Promise<void> {
  if (_moneyLabelTiles || _moneyLabelLoading) return;
  _moneyLabelLoading = true;
  try {
    const [tiles, pal] = await Promise.all([
      loadTileBin('/decomp/em/shop/money.png', 4),
      extractPngPlte('/decomp/em/shop/money.png'),
    ]);
    _moneyLabelTiles = tiles;
    _moneyLabelPal = pal ?? new Uint16Array(16);
  } finally {
    _moneyLabelLoading = false;
  }
}

/** 1:1 décomp `void AddMoneyLabelObject(u16 x, u16 y)` (money.c:187) :
 *  ```c
 *  LoadCompressedSpriteSheet(&sSpriteSheet_MoneyLabel);
 *  LoadCompressedSpritePalette(&sSpritePalette_MoneyLabel);
 *  sMoneyLabelSpriteId = CreateSprite(&sSpriteTemplate_MoneyLabel, x, y, 0);
 *  ```
 *  Sprite WIDE 32×16 (shape 1 size 2), priority 0. Si l'asset n'est pas encore
 *  chargé, on déclenche le préchargement (sprite au prochain appel). */
export function AddMoneyLabelObject(x: number, y: number): void {
  RemoveMoneyLabelObject();
  if (!_moneyLabelTiles || !_moneyLabelPal) { void PreloadMoneyLabelAsset(); return; }
  const tilesKey = `__moneyLabelTiles_${TAG_MONEY_LABEL}`;
  const palKey = `__moneyLabelPal_${TAG_MONEY_LABEL}`;
  assetCache.set(tilesKey, _moneyLabelTiles);
  assetCache.set(palKey, _moneyLabelPal);
  LoadCompressedSpriteSheet({ data: tilesKey, size: _moneyLabelTiles.length, tag: TAG_MONEY_LABEL });
  LoadSpritePalette({ data: palKey, tag: TAG_MONEY_LABEL });
  const tileStartRaw = GetSpriteTileStartByTag(TAG_MONEY_LABEL);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankRaw = IndexOfSpritePaletteTag(TAG_MONEY_LABEL);
  const palBank = palBankRaw === 0xFF ? 0 : palBankRaw;
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    gSprites?: Array<{ oamIndex: number } | undefined>;
    gba?: { oam?: Array<{ priority: number }> };
  } | null;
  if (!rt) return;
  // sOamData_MoneyLabel : shape H_RECTANGLE(1) size 2 = 32×16, 4bpp, priority 0.
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: palBank, x, y, shape: 1, size: 2, priority: 0, subpriority: 0,
  });
  sMoneyLabelSpriteId = spriteId;
  const spr = rt.gSprites?.[spriteId];
  if (spr) { const o = rt.gba?.oam?.[spr.oamIndex]; if (o) o.priority = 0; }
}

/** 1:1 décomp `void RemoveMoneyLabelObject(void)` (money.c:194). */
export function RemoveMoneyLabelObject(): void {
  if (sMoneyLabelSpriteId < 0) return;
  FreeSpriteTilesByTag(TAG_MONEY_LABEL);
  FreeSpritePaletteByTag(TAG_MONEY_LABEL);
  DestroySprite(sMoneyLabelSpriteId);
  sMoneyLabelSpriteId = -1;
}

// Enregistre les helpers money box sur globalThis.__moneyBoxUI : lus par les opcodes
// money-box de scrcmd.ts via un accès globalThis LAZY (pattern anti-cycle scrcmd↔money).
// `??=` + assign → coexiste avec la registration coins (coins.ts), ordre indifférent.
{
  const api = ((globalThis as Record<string, unknown>).__moneyBoxUI ??= {}) as Record<string, unknown>;
  api.DrawMoneyBox = DrawMoneyBox;
  api.HideMoneyBox = HideMoneyBox;
  api.ChangeAmountInMoneyBox = ChangeAmountInMoneyBox;
  api._getMoney = GetMoney;
}

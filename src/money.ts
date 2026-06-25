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

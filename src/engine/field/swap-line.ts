/**
 * swap-line.ts — 1:1 décomp `src/menu_helpers.c:393-453`
 * ============================================================================
 * Sprite "swap line" — barre grise horizontale avec flèche ▶ rouge à gauche,
 * affichée pendant que le user re-ordonne des items (bag SELECT swap, PC item
 * storage, Pokéblock). Le décomp instancie 8 sprites SIZE(16x16) côte à côte :
 *  - sprite[0]   : anim 0 = ▶ rouge (sSpriteAnim_SwapLine_RightArrow, tile 0)
 *  - sprite[1+]  : anim 1 = barre grise (sSpriteAnim_SwapLine_Line, tile 4)
 *
 * Assets décomp : `graphics/interface/swap_line.png` 4bpp 0x100 octets (= 8
 * tiles), palette dédiée. Tag VRAM partagé : TAG_SWAP_LINE = 109.
 *
 * Helpers exposés (= sous-system shareable bag/PC/pokeblock) :
 *  - preloadSwapLineAssets()    : load .4bpp.bin + .gbapal dans assetCache
 *  - LoadListMenuSwapLineGfx()  : tag → tileStart/palBank via decomp-globals
 *  - CreateSwapLineSprites(ids, count)         : alloue les N sprites
 *  - DestroySwapLineSprites(ids, count)        : free
 *  - SetSwapLineSpritesInvisibility(ids, count, invisible)
 *  - UpdateSwapLineSpritesPos(ids, count, x, y) : count peut être OR
 *    SWAP_LINE_HAS_MARGIN (= 0x80) → dernier sprite décalé -8 px pour rester
 *    dans la marge droite de la liste.
 */
import {
  assetCache, getRuntime, LoadCompressedSpriteSheet, LoadSpritePalette,
} from '../../../harness/runtime/decomp-globals';
import { DestroySprite } from '../../sprite';
import { loadTileBin, loadGbaPal } from '../../../harness/gba/png-loader';
import { IndexOfSpritePaletteTag, GetSpriteTileStartByTag, setSpriteAnims } from '../../sprite';

// 1:1 décomp menu_helpers.c:20 — TAG_SWAP_LINE 109.
const TAG_SWAP_LINE = 109;
// 1:1 décomp menu_helpers.h:10 — bit flag posable sur `count` pour décaler
// le dernier sprite (= côté liste avec marge droite).
export const SWAP_LINE_HAS_MARGIN = 1 << 7;

const SPRITE_NONE = 0xFF;
// MAX_SPRITES = 64 (decomp include/sprite.h).
// Migré vers import decomp-data sprite-data.ts (cleanup B7).
import { MAX_SPRITES } from '../../../include/sprite';

// 1:1 décomp menu_helpers.c:47-69 — anims du swap line sprite.
const ANIM_TABLE_NAME = 'sAnims_SwapLine';
const ANIM_RIGHT_ARROW = 0; // sAnim_SwapLine_RightArrow : ANIMCMD_FRAME(0, 0)
const ANIM_LINE        = 1; // sAnim_SwapLine_Line       : ANIMCMD_FRAME(4, 0)
// ANIM_LEFT_ARROW (= 2, hFlip=TRUE) non utilisé par le bag — défini pour PC
// item storage qui utilise StartSpriteAnim(..., 2). Activable plus tard.

let _swapLineAnimsRegistered = false;
function _registerSwapLineAnimsIfNeeded(): void {
  if (_swapLineAnimsRegistered) return;
  const rt = getRuntime() as unknown as {
    registerExtraAnim: (n: string, def: { frames: ReadonlyArray<{ tileNum: number; duration: number }>; terminator: 'END' | 'JUMP'; jumpTo?: number }) => void;
    registerExtraAnimTable: (n: string, t: { anims: ReadonlyArray<string> }) => void;
  } | null;
  if (!rt) return;
  _swapLineAnimsRegistered = true;
  rt.registerExtraAnim('sAnim_SwapLine_RightArrow', {
    frames: [{ tileNum: 0, duration: 0 }],
    terminator: 'END',
  });
  rt.registerExtraAnim('sAnim_SwapLine_Line', {
    frames: [{ tileNum: 4, duration: 0 }],
    terminator: 'END',
  });
  rt.registerExtraAnimTable(ANIM_TABLE_NAME, {
    anims: ['sAnim_SwapLine_RightArrow', 'sAnim_SwapLine_Line'],
  });
}

/** Précharge les assets dans assetCache (= clés `__swapLineTiles` / Pal).
 *  À appeler une fois au setup d'une scène qui utilise le swap line. */
export async function preloadSwapLineAssets(): Promise<void> {
  if (assetCache.has('__swapLineTiles') && assetCache.has('__swapLinePal')) return;
  try {
    const [tiles, pal] = await Promise.all([
      loadTileBin('/decomp/em/interface/swap_line.4bpp.bin', 4),
      loadGbaPal('/decomp/em/interface/swap_line.gbapal'),
    ]);
    assetCache.set('__swapLineTiles', tiles);
    assetCache.set('__swapLinePal', pal);
  } catch (e) {
    console.warn('[swap-line] preload failed', e);
  }
}

/** 1:1 décomp `LoadListMenuSwapLineGfx` (menu_helpers.c:393).
 *  LoadCompressedSpriteSheet + LoadCompressedSpritePalette pour TAG_SWAP_LINE.
 *  À appeler une fois après preloadSwapLineAssets, avant CreateSwapLineSprites. */
export function LoadListMenuSwapLineGfx(): void {
  LoadCompressedSpriteSheet({ data: '__swapLineTiles', size: 0x100, tag: TAG_SWAP_LINE });
  LoadSpritePalette({ data: '__swapLinePal', tag: TAG_SWAP_LINE });
}

/** 1:1 décomp `CreateSwapLineSprites` (menu_helpers.c:399).
 *  Alloue N sprites SIZE(16x16) à positions (i*16, 0), avec anim 1 sauf le
 *  1er (anim 0 = ▶ rouge), tous invisibles à la création.
 *  `baseIdx` simule l'arithmétique pointer du décomp : `&spriteIds[baseIdx]`
 *  → écrit dans spriteIds[baseIdx + i] (= 1:1 sémantique slot dans gBagMenu
 *  .spriteIds[ITEMMENUSPRITE_SWAP_LINE..]). */
export function CreateSwapLineSprites(spriteIds: number[], baseIdx: number, count: number): void {
  _registerSwapLineAnimsIfNeeded();
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    setSpriteInvisible: (id: number, invisible: boolean) => void;
  } | null;
  if (!rt) return;
  // 1:1 STRICT lookups via array primary (sprite.c:1542 + :1637).
  const tileStartRaw = GetSpriteTileStartByTag(TAG_SWAP_LINE);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankRaw = IndexOfSpritePaletteTag(TAG_SWAP_LINE);
  const palBank = palBankRaw === 0xFF ? 0 : palBankRaw;
  for (let i = 0; i < count; i++) {
    const r = rt.CreateSpriteAtOam({
      tileId: tileStart, paletteBank: palBank,
      x: i * 16, y: 0, shape: 0, size: 1, priority: 0, subpriority: 0,
    });
    spriteIds[baseIdx + i] = r.spriteId;
    if (r.spriteId === MAX_SPRITES) continue;
    // 1:1 :406-407 — i != 0 → StartSpriteAnim(.., 1) = anim Line.
    // i == 0 → reste sur anim 0 (RightArrow = ▶).
    // CONVERGENCE 1:1 : sprite.anims (inline) au lieu de spriteAnimStates (legacy), modèle sheet.
    setSpriteAnims(getRuntime(), spriteIds[baseIdx + i], ANIM_TABLE_NAME, i === 0 ? ANIM_RIGHT_ARROW : ANIM_LINE, tileStart);
    if (i !== 0) getRuntime().StartSpriteAnim(spriteIds[baseIdx + i], ANIM_LINE);
    // 1:1 :409 — invisible à la création.
    rt.setSpriteInvisible(spriteIds[baseIdx + i], true);
  }
}

/** 1:1 décomp `DestroySwapLineSprites` (menu_helpers.c:413). */
export function DestroySwapLineSprites(spriteIds: number[], baseIdx: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const id = spriteIds[baseIdx + i];
    if (id !== SPRITE_NONE && id !== MAX_SPRITES) {
      DestroySprite(id);
      spriteIds[baseIdx + i] = SPRITE_NONE;
    }
  }
}

/** 1:1 décomp `SetSwapLineSpritesInvisibility` (menu_helpers.c:426). */
export function SetSwapLineSpritesInvisibility(spriteIds: number[], baseIdx: number, count: number, invisible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  const n = count & ~SWAP_LINE_HAS_MARGIN;
  for (let i = 0; i < n; i++) {
    const id = spriteIds[baseIdx + i];
    if (id !== SPRITE_NONE && id !== MAX_SPRITES) {
      rt.setSpriteInvisible(id, invisible);
    }
  }
}

/** 1:1 décomp `UpdateSwapLineSpritesPos` (menu_helpers.c:434).
 *  `count` peut être OR avec SWAP_LINE_HAS_MARGIN (= 0x80) → le DERNIER sprite
 *  se positionne à `x - 8` au lieu de `x` (= reste dans la marge droite).
 *  sprite.x2 = additif, sprite.y = absolu (+1 px pour alignement pixel décomp). */
export function UpdateSwapLineSpritesPos(spriteIds: number[], baseIdx: number, count: number, x: number, y: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const hasMargin = (count & SWAP_LINE_HAS_MARGIN) !== 0;
  const n = count & ~SWAP_LINE_HAS_MARGIN;
  for (let i = 0; i < n; i++) {
    const spr = rt.gSprites[spriteIds[baseIdx + i]];
    if (!spr) continue;
    // 1:1 :446-449 — last sprite avec margin → x-8 ; sinon x.
    spr.x2 = (i === n - 1 && hasMargin) ? x - 8 : x;
    spr.y = 1 + y; // 1:1 :451.
  }
}

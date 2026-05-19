/**
 * bag-menu-icons.ts — 1:1 décomp `src/item_menu_icons.c` (sous-ensemble sac)
 * ============================================================================
 * Couche fine au-dessus de `item-icon.ts` (AddItemIconSprite 1:1). Gère le
 * double-buffer d'icône objet du sac (2 slots TAG_ITEM_ICON+0/+1 = anti-
 * flicker décomp) + bookkeeping `gBagMenu->spriteIds`.
 *
 * Cycle-safe : `gBagMenu` (export `let` de bag-menu.ts) lu UNIQUEMENT en
 * corps de fonction (live binding ESM résolu à l'appel, pas au module-eval)
 * → pas de TDZ malgré l'arête bag-menu ↔ bag-menu-icons (cf. leçon
 * feedback-map-loader-var-tdz : le danger = usage AU TOP-LEVEL d'un hub).
 */
import { AddItemIconSprite, MAX_SPRITES } from './item-icon';
import { gBagMenu } from './bag-menu';
import { getRuntime, FreeSpriteTilesByTag as _rtFreeSpriteTilesByTag } from './decomp-globals';
import { DestroySprite } from './decomp-bridge';
import { getItemKeyById } from './data-tables';
import { ENUM_ITEMMENUSPRITE_2 } from './decomp-data/auto/include/item_menu-data';
import { ITEM_LIST_END } from './decomp-data/auto/include/constants/items-data';

// 1:1 décomp `SPRITE_NONE` (sprite.h:6 TAIL_SENTINEL 0xFF).
const SPRITE_NONE = 0xFF;
// 1:1 décomp `ITEMMENUSPRITE_ITEM` (item_menu.h) — base slot des 2 icônes
// objet dans gBagMenu->spriteIds (double-buffer id^1).
const ITEMMENUSPRITE_ITEM = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_ITEM;
// 1:1 décomp `#define TAG_ITEM_ICON 5557` (item_menu_icons.c) — GFXTAG/
// PALTAG de base ; les 2 slots = TAG_ITEM_ICON + id (id ∈ {0,1}). Valeur
// = clé unique de spriteSheetTagToTileStart/paletteTagToSlot (substrat).
const TAG_ITEM_ICON = 5557;

/** 1:1 décomp `FreeSpriteTilesByTag(tag)` (sprite.c) — libère l'enregistrement
 *  tag→tileStart pour que LoadCompressedSpriteSheet ré-alloue au reload (le
 *  reload même tag est sinon ignoré, decomp-globals:1774). Pattern prouvé
 *  list-menu.ts:1101. (Le curseur VRAM est monotone — pas de rembobinage :
 *  limitation substrat documentée, raffinage Phase 3 ; fonctionnel ici.) */
function FreeSpriteTilesByTag(tag: number): void {
  _rtFreeSpriteTilesByTag(tag); // reclaim VRAM 1:1 (≠ simple Map.delete)
}
/** 1:1 décomp `FreeSpritePaletteByTag(tag)` (sprite.c). */
function FreeSpritePaletteByTag(tag: number): void {
  const rt = getRuntime() as unknown as { paletteTagToSlot?: Map<string, number> } | null;
  rt?.paletteTagToSlot?.delete(String(tag));
}

/** 1:1 décomp `RemoveBagSprite(id)` (item_menu_icons.c:425) :
 *  `if (spriteIds[id] != SPRITE_NONE){ DestroySprite(&gSprites[id]);
 *   spriteIds[id] = SPRITE_NONE; }`. */
export function RemoveBagSprite(id: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  if (bm.spriteIds[id] !== SPRITE_NONE) {
    DestroySprite(bm.spriteIds[id]);
    bm.spriteIds[id] = SPRITE_NONE;
  }
}

/** 1:1 décomp `AddBagItemIconSprite(itemId, id)` (item_menu_icons.c:535) :
 *  slot = &gBagMenu->spriteIds[id + ITEMMENUSPRITE_ITEM] ; si SPRITE_NONE :
 *  FreeSpriteTilesByTag/FreeSpritePaletteByTag(id+TAG_ITEM_ICON) ;
 *  iconSpriteId = AddItemIconSprite(id+TAG_ITEM_ICON, id+TAG_ITEM_ICON,
 *  itemId) ; si != MAX_SPRITES : *slot = iconSpriteId ; gSprites[id].x2=24 ;
 *  y2=88. `itemId` numérique (call-site 1:1) → itemKey string CONFINÉ ici
 *  (getItemKeyById ; ITEM_LIST_END → flèche retour, item_icon.c:157). */
export function AddBagItemIconSprite(itemId: number, id: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  const itemKey = itemId === ITEM_LIST_END ? 'ITEM_LIST_END' : getItemKeyById(itemId);
  const slot = id + ITEMMENUSPRITE_ITEM;
  if (bm.spriteIds[slot] === SPRITE_NONE) {
    FreeSpriteTilesByTag(id + TAG_ITEM_ICON);
    FreeSpritePaletteByTag(id + TAG_ITEM_ICON);
    const iconSpriteId = AddItemIconSprite(id + TAG_ITEM_ICON, id + TAG_ITEM_ICON, itemKey);
    if (iconSpriteId !== MAX_SPRITES) {
      bm.spriteIds[slot] = iconSpriteId;
      // 1:1 :549-550 gSprites[iconSpriteId].x2 = 24 ; .y2 = 88 (case gauche).
      const rt = getRuntime() as unknown as { gSprites?: Map<number, { x2: number; y2: number }> } | null;
      const spr = rt?.gSprites?.get(iconSpriteId);
      if (spr) { spr.x2 = 24; spr.y2 = 88; }
    }
  }
}

/** 1:1 décomp `RemoveBagItemIconSprite(id)` (item_menu_icons.c:555, branche
 *  non-BUGFIX) : `RemoveBagSprite(id + ITEMMENUSPRITE_ITEM)`. */
export function RemoveBagItemIconSprite(id: number): void {
  RemoveBagSprite(id + ITEMMENUSPRITE_ITEM);
}

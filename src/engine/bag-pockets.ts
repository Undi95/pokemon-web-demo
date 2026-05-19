/**
 * bag-pockets.ts — adaptateur `gBagPockets` 1:1 (option (b), validée user)
 * ============================================================================
 * La décomp `struct BagPocket gBagPockets[5]` = `{ struct ItemSlot{u16
 * itemId,u16 quantity} itemSlots[]; u8 capacity }`. Notre persistance
 * (`gameState.bag`, bag.ts) stocke les poches en `ItemSlot{itemKey:string,
 * quantity}[]` (clé string, '' = vide). Cette couche **matérialise la
 * shape décomp 1:1** au-dessus du stockage string : `bag-menu.ts` (SPINE)
 * lit/ports `itemSlots[i].itemId` / `capacity` EXACTEMENT comme la décomp,
 * zéro adaptation dans le port ; la seule traduction (itemKey↔itemId
 * canonique) est CONFINÉE ici. itemId canonique = `getItemId(itemKey)`
 * (data-tables.ts, table items.h 1:1). Sert aussi PC/shop/pyramide.
 *
 * 1:1-sémantique assumé : la décomp `GetBagItemQuantity(&slot.quantity)`
 * dé-XOR la quantité (encryptionKey). Notre modèle stocke la quantité EN
 * CLAIR (simplification modèle-large déjà actée bag.ts) → `_qty(slot) =
 * slot.quantity`. Comportement identique (0 = slot vide).
 */
import { gameState } from './game-state';
import { getItemId } from './data-tables';
import { sTMHMMoves } from './tmhm-moves';
import type { ItemSlot } from './bag';
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET,
} from './decomp-data/auto/include/constants/item-data';

/** pocketId décomp (0..4) → tableau live `ItemSlot[]` de gameState.bag.
 *  1:1 `&gBagPockets[pocketId]` (mutations écrites en place = décomp). */
export function getBagPocketSlots(pocketId: number): ItemSlot[] {
  switch (pocketId) {
    case ITEMS_POCKET: return gameState.bag.items;
    case BALLS_POCKET: return gameState.bag.pokeBalls;
    case TMHM_POCKET: return gameState.bag.tmHm;
    case BERRIES_POCKET: return gameState.bag.berries;
    case KEYITEMS_POCKET: return gameState.bag.keyItems;
    default: return gameState.bag.items;
  }
}

/** capacity 1:1 `gBagPockets[pocketId].capacity` (= taille fixe du
 *  tableau de poche, emptyBag/migrateBag garantissent BAG_*_COUNT). */
export function getBagPocketCapacity(pocketId: number): number {
  return getBagPocketSlots(pocketId).length;
}

/** itemId canonique 1:1 d'un slot (`slot->itemId`). '' → ITEM_NONE(0).
 *  CT/CS : notre modèle stocke les TM/HM move-named (`ITEM_TM_FOCUS_PUNCH`)
 *  mais l'enum item décomp = numéroté (`ITEM_TM01..50`/`ITEM_HM01..08`,
 *  exposés par constants.items). On normalise via l'ordre 1:1 sTMHMMoves
 *  (tms_hms.h FOREACH : 50 TM idx0-49 puis 8 HM idx50-57) → l'itemId
 *  canonique. Traduction CONFINÉE ici (couche (b), modèle itemKey-string). */
export function slotItemId(slot: ItemSlot): number {
  const k = slot.itemKey;
  if (!k) return 0;
  if (k.startsWith('ITEM_TM_') || k.startsWith('ITEM_HM_')) {
    const moveKey = 'MOVE_' + k.slice(8); // après "ITEM_TM_" / "ITEM_HM_"
    const idx = sTMHMMoves.indexOf(moveKey);
    if (idx >= 0) {
      const numbered = idx < 50
        ? `ITEM_TM${String(idx + 1).padStart(2, '0')}`
        : `ITEM_HM${String(idx - 50 + 1).padStart(2, '0')}`;
      return getItemId(numbered);
    }
  }
  return getItemId(k);
}

/** 1:1-sém `GetBagItemQuantity(&slot.quantity)` (quantité en clair chez
 *  nous, cf. en-tête). 0 = slot vide. */
function _qty(slot: ItemSlot): number {
  return slot.quantity;
}

/** 1:1 décomp `SwapItemSlots` (item.c:600) : SWAP(*a,*b,temp). Échange
 *  le CONTENU des 2 slots (itemKey+quantity) dans le tableau live. */
function SwapItemSlots(slots: ItemSlot[], a: number, b: number): void {
  const tKey = slots[a].itemKey, tQty = slots[a].quantity;
  slots[a].itemKey = slots[b].itemKey; slots[a].quantity = slots[b].quantity;
  slots[b].itemKey = tKey; slots[b].quantity = tQty;
}

/** 1:1 décomp `CompactItemsInBagPocket` (item.c:606-618) : pousse les
 *  slots vides (quantity 0) en fin de poche (bubble O(n²) exact). */
export function CompactItemsInBagPocket(pocketId: number): void {
  const slots = getBagPocketSlots(pocketId);
  const capacity = slots.length;
  let i: number, j: number;
  for (i = 0; i < capacity - 1; i++) {
    for (j = i + 1; j < capacity; j++) {
      if (_qty(slots[i]) === 0)
        SwapItemSlots(slots, i, j);
    }
  }
}

/** 1:1 décomp `SortBerriesOrTMHMs` (item.c:620-638) : tri par itemId
 *  croissant des slots non-vides + vides en fin (sélection O(n²) exact). */
export function SortBerriesOrTMHMs(pocketId: number): void {
  const slots = getBagPocketSlots(pocketId);
  const capacity = slots.length;
  let i: number, j: number;
  for (i = 0; i < capacity - 1; i++) {
    for (j = i + 1; j < capacity; j++) {
      if (_qty(slots[i]) !== 0) {
        if (_qty(slots[j]) === 0)
          continue;
        if (slotItemId(slots[i]) <= slotItemId(slots[j]))
          continue;
      }
      SwapItemSlots(slots, i, j);
    }
  }
}

/** 1:1 décomp `BagGetItemIdByPocketPosition` (item.c:590) :
 *    return gBagPockets[pocketId - 1].itemSlots[pocketPos].itemId;
 *  Appelé avec `gBagPosition.pocket + 1` → `pocketId - 1` = poche 0-based
 *  (= notre `getBagPocketSlots`). Retour = itemId canonique (slotItemId). */
export function BagGetItemIdByPocketPosition(pocketId: number, pocketPos: number): number {
  return slotItemId(getBagPocketSlots(pocketId - 1)[pocketPos]);
}

/** 1:1 décomp `BagGetQuantityByPocketPosition` (item.c:595) :
 *    return GetBagItemQuantity(&gBagPockets[pocketId - 1].itemSlots[pocketPos].quantity);
 *  `GetBagItemQuantity` = 1:1-sém `_qty` (quantité en clair chez nous,
 *  cf. en-tête module). */
export function BagGetQuantityByPocketPosition(pocketId: number, pocketPos: number): number {
  return _qty(getBagPocketSlots(pocketId - 1)[pocketPos]);
}

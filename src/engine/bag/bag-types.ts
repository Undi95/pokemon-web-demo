/**
 * bag-types.ts — Foundation pure : types + constants + pure functions du bag.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/global.h`
 *     BAG_ITEMS_COUNT=30, BAG_POKEBALLS_COUNT=16, BAG_TMHM_COUNT=64,
 *     BAG_BERRIES_COUNT=46, BAG_KEYITEMS_COUNT=30.
 *
 * ⚠️ Foundation module : ZÉRO import (= permet d'être tiré par save-system /
 * save-blocks / bag.ts sans cycle ESM). Les fonctions runtime (AddBagItem, etc.)
 * qui nécessitent gSaveBlock1Ptr restent dans `bag.ts`.
 */

/** 1:1 décomp `struct ItemSlot { u16 itemId; u16 quantity; }`. itemKey vide = ITEM_NONE. */
export interface ItemSlot {
  itemKey: string;
  quantity: number;
}

/** 1:1 décomp `struct BagPocket` (= 5 instances dans gBagPockets[]). */
export interface Bag {
  items: ItemSlot[];      // POCKET_ITEMS — 30 slots, max 99/slot
  pokeBalls: ItemSlot[];  // POCKET_POKE_BALLS — 16 slots, max 99/slot
  tmHm: ItemSlot[];       // POCKET_TM_HM — 64 slots, max 99/slot, no dup
  berries: ItemSlot[];    // POCKET_BERRIES — 46 slots, max 999/slot, no dup
  keyItems: ItemSlot[];   // POCKET_KEY_ITEMS — 30 slots, max 1/slot
}

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const BAG_ITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 16;
export const BAG_TMHM_COUNT = 64;
export const BAG_BERRIES_COUNT = 46;
export const BAG_KEYITEMS_COUNT = 30;

/** 1:1 décomp `include/constants/item.h:12-17` pocket IDs. */
export const ITEMS_POCKET = 0;
export const BALLS_POCKET = 1;
export const TMHM_POCKET = 2;
export const BERRIES_POCKET = 3;
export const KEYITEMS_POCKET = 4;
export const POCKETS_COUNT = 5;

/** 1:1 décomp `struct BagPocket` (= item.h:21-24) :
 *    struct BagPocket { struct ItemSlot *itemSlots; u8 capacity; };
 *  `gBagPockets[POCKETS_COUNT]` est un EWRAM array global pointing vers les
 *  `gSaveBlock1Ptr->bagPocket_*` arrays. Wire fait par `SetBagItemsPointers()`. */
export interface BagPocket {
  itemSlots: ItemSlot[];
  capacity: number;
}

// ─── Helpers Foundation ──────────────────────────────────────────────────────

/** Helper : crée un array de N empty ItemSlots. */
export function emptyItemSlots(n: number): ItemSlot[] {
  return Array.from({ length: n }, () => ({ itemKey: '', quantity: 0 }));
}

/** Construit un bag vide aux capacités décomp (= toutes les slots itemKey:''). */
export function emptyBag(): Bag {
  return {
    items: emptyItemSlots(BAG_ITEMS_COUNT),
    pokeBalls: emptyItemSlots(BAG_POKEBALLS_COUNT),
    tmHm: emptyItemSlots(BAG_TMHM_COUNT),
    berries: emptyItemSlots(BAG_BERRIES_COUNT),
    keyItems: emptyItemSlots(BAG_KEYITEMS_COUNT),
  };
}

/** Migration : merge un bag existant (potentiellement ancien) avec emptyBag(). */
export function migrateBag(existing: Partial<Bag> | undefined): Bag {
  const empty = emptyBag();
  if (!existing) return empty;
  const fix = (cur: ItemSlot[] | undefined, n: number): ItemSlot[] => {
    const arr = (cur ?? []).map(s => ({ itemKey: s.itemKey ?? '', quantity: s.quantity ?? 0 }));
    while (arr.length < n) arr.push({ itemKey: '', quantity: 0 });
    return arr.slice(0, n);
  };
  return {
    items: fix(existing.items, BAG_ITEMS_COUNT),
    pokeBalls: fix(existing.pokeBalls, BAG_POKEBALLS_COUNT),
    tmHm: fix(existing.tmHm, BAG_TMHM_COUNT),
    berries: fix(existing.berries, BAG_BERRIES_COUNT),
    keyItems: fix(existing.keyItems, BAG_KEYITEMS_COUNT),
  };
}

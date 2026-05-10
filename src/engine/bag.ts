/**
 * bag.ts — 5 pockets ItemSlot[] 1:1 décomp `struct BagPocket gBagPockets[]`.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item.c`
 *     - `AddBagItem(u16 itemId, u16 count)` (item.c:243+).
 *     - `RemoveBagItem` / `CheckBagHasItem` / `GetBagItemQuantity`.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/global.h`
 *     - BAG_ITEMS_COUNT=30, BAG_POKEBALLS_COUNT=16, BAG_TMHM_COUNT=64,
 *       BAG_BERRIES_COUNT=46, BAG_KEYITEMS_COUNT=30.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/items.h`
 *     - MAX_BAG_ITEM_CAPACITY=99, MAX_BERRY_CAPACITY=999.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/item.h`
 *     - POCKET_NONE=0..POCKET_KEY_ITEMS=5.
 *
 * Storage : on stocke les slots dans `gameState.data.bag` (= persisté localStorage).
 * Chaque slot = { itemKey: 'ITEM_POKE_BALL', quantity: 5 }. itemKey vide = slot
 * libre (= 1:1 décomp ITEM_NONE = 0).
 *
 * Le pocket pour un itemId vient de `getItem(itemKey).pocket` (= items.json,
 * extrait de items.h `.pocket = POCKET_X` par scripts/extract-items.mjs).
 */
import { gameState } from './game-state';
import { getItem } from './data-tables';

// ─── Types ──────────────────────────────────────────────────────────────────

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

const MAX_BAG_ITEM_CAPACITY = 99;
const MAX_BERRY_CAPACITY = 999;

const POCKET_CAPACITIES: Record<string, number> = {
  POCKET_ITEMS: BAG_ITEMS_COUNT,
  POCKET_POKE_BALLS: BAG_POKEBALLS_COUNT,
  POCKET_TM_HM: BAG_TMHM_COUNT,
  POCKET_BERRIES: BAG_BERRIES_COUNT,
  POCKET_KEY_ITEMS: BAG_KEYITEMS_COUNT,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Construit un bag vide aux capacités décomp (= toutes les slots itemKey:''). */
export function emptyBag(): Bag {
  const empty = (n: number): ItemSlot[] =>
    Array.from({ length: n }, () => ({ itemKey: '', quantity: 0 }));
  return {
    items: empty(BAG_ITEMS_COUNT),
    pokeBalls: empty(BAG_POKEBALLS_COUNT),
    tmHm: empty(BAG_TMHM_COUNT),
    berries: empty(BAG_BERRIES_COUNT),
    keyItems: empty(BAG_KEYITEMS_COUNT),
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

/** Récupère le nom de pocket pour un itemKey (= 'POCKET_X' ou null si POCKET_NONE). */
function getPocketName(itemKey: string): string | null {
  if (!itemKey) return null;
  const item = getItem(itemKey);
  if (!item || !item.pocket || item.pocket === 'POCKET_NONE') return null;
  return item.pocket;
}

/** Retourne l'array de slots du pocket donné (= référence directe pour mutation). */
function pocketArrayFor(bag: Bag, pocketName: string): ItemSlot[] | null {
  switch (pocketName) {
    case 'POCKET_ITEMS': return bag.items;
    case 'POCKET_POKE_BALLS': return bag.pokeBalls;
    case 'POCKET_TM_HM': return bag.tmHm;
    case 'POCKET_BERRIES': return bag.berries;
    case 'POCKET_KEY_ITEMS': return bag.keyItems;
  }
  return null;
}

/** Slot capacity max pour un pocket (= 999 berries, 99 autres). */
function getSlotCapacity(pocketName: string): number {
  return pocketName === 'POCKET_BERRIES' ? MAX_BERRY_CAPACITY : MAX_BAG_ITEM_CAPACITY;
}

// ─── 1:1 décomp API ──────────────────────────────────────────────────────────

/** 1:1 décomp `GetBagItemQuantity` : somme tous les slots du même itemId. */
export function GetBagItemQuantity(itemKey: string): number {
  const p = getPocketName(itemKey);
  if (!p) return 0;
  const arr = pocketArrayFor(gameState.bag, p);
  if (!arr) return 0;
  let total = 0;
  for (const slot of arr) {
    if (slot.itemKey === itemKey) total += slot.quantity;
  }
  return total;
}

/** 1:1 décomp `CheckBagHasItem` : true si bag contient au moins `count` du item. */
export function CheckBagHasItem(itemKey: string, count: number): boolean {
  return GetBagItemQuantity(itemKey) >= count;
}

/** 1:1 décomp `AddBagItem` (= item.c:243).
 *  - Cherche un slot existant du même item, augmente quantity (caps slotCapacity).
 *  - Si overflow ou pas trouvé, alloue un nouveau slot.
 *  - TM/HM + Berries : pas de duplicate (= 1 slot par itemId max).
 *  - Return false si capacity totale insuffisante (= bag full).
 */
export function AddBagItem(itemKey: string, count: number): boolean {
  const p = getPocketName(itemKey);
  if (!p) return false;
  const arr = pocketArrayFor(gameState.bag, p);
  if (!arr) return false;
  const slotCap = getSlotCapacity(p);
  const noDup = (p === 'POCKET_TM_HM' || p === 'POCKET_BERRIES');

  let remaining = count;

  // Pass 1 : remplir les slots existants du même item (1:1 décomp ll.270-307).
  for (const slot of arr) {
    if (remaining === 0) break;
    if (slot.itemKey === itemKey && slot.quantity > 0) {
      const room = slotCap - slot.quantity;
      if (room >= remaining) {
        slot.quantity += remaining;
        remaining = 0;
        break;
      } else {
        if (noDup) return false; // TM/HM + Berries ne peuvent pas overflow vers un nouveau slot
        slot.quantity = slotCap;
        remaining -= room;
      }
    }
  }

  // Pass 2 : créer de nouveaux slots si reste à placer (1:1 décomp ll.310-336).
  if (remaining > 0) {
    for (const slot of arr) {
      if (remaining === 0) break;
      if (!slot.itemKey || slot.quantity === 0) {
        slot.itemKey = itemKey;
        if (remaining > slotCap) {
          if (noDup) return false;
          slot.quantity = slotCap;
          remaining -= slotCap;
        } else {
          slot.quantity = remaining;
          remaining = 0;
          break;
        }
      }
    }
  }

  if (remaining > 0) return false; // No more slots, bag full
  return true;
}

/** 1:1 décomp `RemoveBagItem` : retire `count` du item ; renvoie false si pas assez. */
export function RemoveBagItem(itemKey: string, count: number): boolean {
  if (!CheckBagHasItem(itemKey, count)) return false;
  const p = getPocketName(itemKey);
  if (!p) return false;
  const arr = pocketArrayFor(gameState.bag, p);
  if (!arr) return false;
  let remaining = count;
  for (const slot of arr) {
    if (remaining === 0) break;
    if (slot.itemKey === itemKey && slot.quantity > 0) {
      const take = Math.min(slot.quantity, remaining);
      slot.quantity -= take;
      remaining -= take;
      if (slot.quantity === 0) slot.itemKey = '';
    }
  }
  return true;
}

/** DEV/DEBUG ONLY : agrandit toutes les pockets pour qu'elles puissent contenir
 *  jusqu'à N slots chacune. Utile pour `?debug` qui veut afficher TOUS les items
 *  du jeu (= POCKET_ITEMS a 207 items mais BAG_ITEMS_COUNT cap à 30).
 *
 *  ⚠️ NON 1:1 décomp — réservé au mode debug. Le décomp ROM utilise les caps
 *  fixes BAG_*_COUNT. */
export function DEBUG_ExpandBagToFit(maxPerPocket = 256): void {
  const grow = (arr: ItemSlot[]) => {
    while (arr.length < maxPerPocket) arr.push({ itemKey: '', quantity: 0 });
  };
  grow(gameState.bag.items);
  grow(gameState.bag.pokeBalls);
  grow(gameState.bag.tmHm);
  grow(gameState.bag.berries);
  grow(gameState.bag.keyItems);
}

/** 1:1 décomp item.c:CompactItemsInBagPocket : remove gaps (= empty slots) en
 *  shiftant les non-empty au début. Préserve l'ordre. */
function compactPocket(arr: ItemSlot[]): void {
  const valid = arr.filter(s => s.itemKey && s.quantity > 0);
  for (let i = 0; i < arr.length; i++) {
    if (i < valid.length) {
      arr[i].itemKey = valid[i].itemKey;
      arr[i].quantity = valid[i].quantity;
    } else {
      arr[i].itemKey = '';
      arr[i].quantity = 0;
    }
  }
}

/** 1:1 décomp item.c:SortBerriesOrTMHMs : sort par itemId croissant + remove gaps.
 *  Notre items.json est en ordre de définition donc on trie par index ITEM_X
 *  dans la table (= proxy pour itemId du décomp). */
function sortPocketByItemId(arr: ItemSlot[]): void {
  const valid = arr.filter(s => s.itemKey && s.quantity > 0);
  // Sort by itemKey alphabetique pour stable ordering (= proxy pour itemId).
  // Le décomp utilise gItems[i].itemId mais on n'a pas la table runtime ici.
  valid.sort((a, b) => a.itemKey.localeCompare(b.itemKey));
  for (let i = 0; i < arr.length; i++) {
    if (i < valid.length) {
      arr[i].itemKey = valid[i].itemKey;
      arr[i].quantity = valid[i].quantity;
    } else {
      arr[i].itemKey = '';
      arr[i].quantity = 0;
    }
  }
}

/** 1:1 décomp item_menu.c:UpdatePocketItemList(pocketId). Appelé après chaque
 *  modification (= AddBagItem / RemoveBagItem / DoItemSwap) pour normaliser le
 *  pocket. TMHM + Berries → sort by itemId. Autres → compact (remove gaps). */
export function UpdatePocketItemList(pocketKey: 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems'): void {
  const arr = gameState.bag[pocketKey];
  if (pocketKey === 'tmHm' || pocketKey === 'berries') sortPocketByItemId(arr);
  else compactPocket(arr);
}

/** 1:1 décomp `ClearBag` : reset complet à empty. */
export function ClearBag(): void {
  const empty = emptyBag();
  gameState.bag.items = empty.items;
  gameState.bag.pokeBalls = empty.pokeBalls;
  gameState.bag.tmHm = empty.tmHm;
  gameState.bag.berries = empty.berries;
  gameState.bag.keyItems = empty.keyItems;
}

/** Debug helper : list non-empty slots across all pockets. */
export function bagContents(): Array<{ pocket: string; itemKey: string; quantity: number }> {
  const result: Array<{ pocket: string; itemKey: string; quantity: number }> = [];
  const all: Array<[string, ItemSlot[]]> = [
    ['POCKET_ITEMS', gameState.bag.items],
    ['POCKET_POKE_BALLS', gameState.bag.pokeBalls],
    ['POCKET_TM_HM', gameState.bag.tmHm],
    ['POCKET_BERRIES', gameState.bag.berries],
    ['POCKET_KEY_ITEMS', gameState.bag.keyItems],
  ];
  for (const [pocket, arr] of all) {
    for (const slot of arr) {
      if (slot.itemKey && slot.quantity > 0) {
        result.push({ pocket, itemKey: slot.itemKey, quantity: slot.quantity });
      }
    }
  }
  return result;
}

// ─── Debug exposure (= window.bag) ──────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).bag = {
    add: AddBagItem,
    remove: RemoveBagItem,
    has: CheckBagHasItem,
    qty: GetBagItemQuantity,
    list: bagContents,
    clear: ClearBag,
  };
}

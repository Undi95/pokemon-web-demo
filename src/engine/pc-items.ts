/**
 * pc-items.ts — Port 1:1 décomp PC items inventory (= gSaveBlock1Ptr->pcItems).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item.c` (= AddPCItem, RemovePCItem,
 *     CountUsedPCItemSlots, CheckPCHasItem, FindFreePCItemSlot, CompactPCItems,
 *     ClearItemSlots)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/player_pc.c:358-371` (=
 *     NewGameInitPCItems + sNewGamePCItems table)
 *
 * PC items = 50 slots avec max 999/slot (= MAX_PC_ITEM_CAPACITY). Le PC est
 * accessible via le metatile PC dans la maison du joueur (BedroomPC) ou les
 * PC Joueur des Pokemon Centers (PlayerPC).
 *
 * Différence avec bag :
 *   - PC pas de pockets (= flat list 50 slots)
 *   - Max quantity 999 (vs 99 pour bag)
 *   - No encryption key (= quantity stored cleartext, vs bag XOR'd)
 *
 * Notre `ItemSlot.itemKey` est une string ('ITEM_POTION') au lieu de u16. On
 * traite la chaîne vide '' comme ITEM_NONE.
 */

import { gSaveBlock1Ptr } from './save/save-block-state';
import type { ItemSlot } from './bag/bag';

/** 1:1 décomp `include/constants/global.h:PC_ITEMS_COUNT`. */
export const PC_ITEMS_COUNT = 50;

/** 1:1 décomp `include/constants/items.h:MAX_PC_ITEM_CAPACITY`. */
export const MAX_PC_ITEM_CAPACITY = 999;

/** 1:1 décomp `static u16 GetPCItemQuantity(u16 *quantity)`. Pas d'XOR pour le PC. */
function _getPCItemQuantity(slot: ItemSlot): number {
  return slot.quantity;
}

/** 1:1 décomp `static void SetPCItemQuantity(u16 *quantity, u16 newValue)`. */
function _setPCItemQuantity(slot: ItemSlot, value: number): void {
  slot.quantity = value;
}

/** 1:1 décomp `static s32 FindFreePCItemSlot(void)` (item.c:454-464) :
 *    for (i = 0; i < PC_ITEMS_COUNT; i++)
 *        if (gSaveBlock1Ptr->pcItems[i].itemId == ITEM_NONE)
 *            return i;
 *    return -1;
 */
function _findFreePCItemSlot(): number {
  const pcItems = gSaveBlock1Ptr.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (!pcItems[i].itemKey) return i;
  }
  return -1;
}

/** 1:1 décomp `u8 CountUsedPCItemSlots(void)` (item.c:466-477). */
export function CountUsedPCItemSlots(): number {
  const pcItems = gSaveBlock1Ptr.pcItems;
  let used = 0;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (pcItems[i].itemKey) used++;
  }
  return used;
}

/** 1:1 décomp `bool8 CheckPCHasItem(u16 itemId, u16 count)` (item.c:479-489). */
export function CheckPCHasItem(itemKey: string, count: number): boolean {
  const pcItems = gSaveBlock1Ptr.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (pcItems[i].itemKey === itemKey && _getPCItemQuantity(pcItems[i]) >= count) {
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `bool8 AddPCItem(u16 itemId, u16 count)` (item.c:491-546).
 *
 *  Algorithme :
 *    1. Copie temporaire des pcItems (= newItems)
 *    2. Pour chaque slot avec ce itemId : add count jusqu'à MAX_PC_ITEM_CAPACITY,
 *       déborde au slot suivant
 *    3. Si count > 0 après, trouve un slot vide et y met le remaining
 *    4. Si pas de slot vide → return FALSE (= échec)
 *    5. Commit la copie temporaire vers pcItems et return TRUE
 *
 *  Notre port utilise itemKey (string) au lieu de u16 itemId. Empty string = ITEM_NONE.
 */
export function AddPCItem(itemKey: string, count: number): boolean {
  // 1:1 décomp : AllocZeroed + memcpy pour stage la modif. En TS on stage
  // dans un array local + commit à la fin.
  const newItems: ItemSlot[] = gSaveBlock1Ptr.pcItems.map((s: ItemSlot) => ({
    itemKey: s.itemKey,
    quantity: s.quantity,
  }));

  // Use any item slots that already contain this item.
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (newItems[i].itemKey === itemKey) {
      const ownedCount = _getPCItemQuantity(newItems[i]);
      if (ownedCount + count <= MAX_PC_ITEM_CAPACITY) {
        _setPCItemQuantity(newItems[i], ownedCount + count);
        _commitPCItems(newItems);
        return true;
      }
      count += ownedCount - MAX_PC_ITEM_CAPACITY;
      _setPCItemQuantity(newItems[i], MAX_PC_ITEM_CAPACITY);
      if (count === 0) {
        _commitPCItems(newItems);
        return true;
      }
    }
  }

  // Put any remaining items into a new item slot.
  if (count > 0) {
    // Trouver via newItems (= stage), pas via gameState (= avant commit).
    let freeSlot = -1;
    for (let i = 0; i < PC_ITEMS_COUNT; i++) {
      if (!newItems[i].itemKey) { freeSlot = i; break; }
    }
    if (freeSlot === -1) {
      // 1:1 décomp : Free(newItems) + return FALSE — pas de slot libre.
      return false;
    }
    newItems[freeSlot].itemKey = itemKey;
    _setPCItemQuantity(newItems[freeSlot], count);
  }

  _commitPCItems(newItems);
  return true;
}

/** 1:1 décomp `void RemovePCItem(u8 index, u16 count)` (item.c:548-556). */
export function RemovePCItem(index: number, count: number): void {
  const pcItems = gSaveBlock1Ptr.pcItems;
  pcItems[index].quantity -= count;
  if (pcItems[index].quantity === 0) {
    pcItems[index].itemKey = '';  // = ITEM_NONE
    CompactPCItems();
  }
}

/** 1:1 décomp `void CompactPCItems(void)` (item.c:558-575). Compacte les slots
 *  en poussant les ITEM_NONE à la fin. */
export function CompactPCItems(): void {
  const pcItems = gSaveBlock1Ptr.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT - 1; i++) {
    for (let j = i + 1; j < PC_ITEMS_COUNT; j++) {
      if (!pcItems[i].itemKey) {
        const temp = pcItems[i];
        pcItems[i] = pcItems[j];
        pcItems[j] = temp;
      }
    }
  }
}

/** 1:1 décomp `void ClearItemSlots(struct ItemSlot *itemSlots, u8 itemCount)`
 *  (item.c:443-452). */
export function ClearPCItems(): void {
  const pcItems = gSaveBlock1Ptr.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    pcItems[i].itemKey = '';
    pcItems[i].quantity = 0;
  }
}

/** 1:1 décomp `static const u16 sNewGamePCItems[][2]` (player_pc.c:225-229) :
 *    { ITEM_POTION, 1 },
 *    { ITEM_NONE, 0 } */
const sNewGamePCItems: ReadonlyArray<readonly [string, number]> = [
  ['ITEM_POTION', 1],
];

/** 1:1 décomp `void NewGameInitPCItems(void)` (player_pc.c:358-371) :
 *    ClearItemSlots(gSaveBlock1Ptr->pcItems, PC_ITEMS_COUNT);
 *    while (TRUE) {
 *        if (sNewGamePCItems[i][0] == ITEM_NONE || sNewGamePCItems[i][1] == 0)
 *            break;
 *        if (AddPCItem(sNewGamePCItems[i][0], sNewGamePCItems[i][1]) != TRUE)
 *            break;
 *        i++;
 *    }
 *  Appelé par NewGameInitData (new_game.c:187). */
export function NewGameInitPCItems(): void {
  ClearPCItems();
  for (let i = 0; i < sNewGamePCItems.length; i++) {
    const [itemKey, qty] = sNewGamePCItems[i];
    if (!itemKey || qty === 0) break;
    if (!AddPCItem(itemKey, qty)) break;
  }
}

/** Helper internal : commit staging array → gSaveBlock1Ptr.pcItems. */
function _commitPCItems(newItems: ItemSlot[]): void {
  const pcItems = gSaveBlock1Ptr.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    pcItems[i].itemKey = newItems[i].itemKey;
    pcItems[i].quantity = newItems[i].quantity;
  }
}

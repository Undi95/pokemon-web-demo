/**
 * bag.ts — 5 pockets ItemSlot[] 1:1 STRICT décomp `src/item.c` + `include/constants/item.h`.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item.c:21` :
 *     `EWRAM_DATA struct BagPocket gBagPockets[POCKETS_COUNT] = {0};`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item.c:61-77 SetBagItemsPointers` :
 *     wire `gBagPockets[i].itemSlots = gSaveBlock1Ptr->bagPocket_*` au LoadGameSave.
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item.c:243-348 AddBagItem` :
 *     opère sur `gBagPockets[pocket].itemSlots[i]` direct.
 *   - `D:/Projet 1/decomps/pokeemeraude/src/load_save.c:80` : appelle
 *     `SetBagItemsPointers()` post-LoadGameSave.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/global.h:1012-1016` :
 *     SaveBlock1 contient 5 fields séparés `bagPocket_Items, bagPocket_KeyItems,
 *     bagPocket_PokeBalls, bagPocket_TMHM, bagPocket_Berries`.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/item.h:12-17` :
 *     POCKET IDs (= ITEMS_POCKET=0, BALLS_POCKET=1, TMHM_POCKET=2,
 *     BERRIES_POCKET=3, KEYITEMS_POCKET=4, POCKETS_COUNT=5).
 *
 * Pattern 1:1 strict :
 *   - SaveBlock1 contient les 5 arrays ItemSlot[] séparés (= source de stockage
 *     persistée save).
 *   - `gBagPockets[5]` est un EWRAM-style array global avec
 *     `{ itemSlots, capacity }` qui pointe vers les arrays SaveBlock1.
 *   - `SetBagItemsPointers()` wire au boot + post-LoadGameSave.
 *   - Toutes les fonctions (AddBagItem, RemoveBagItem, etc.) opèrent sur
 *     `gBagPockets[pocketId].itemSlots[i]`, jamais sur `gSaveBlock1Ptr->bagPocket_*`
 *     direct (= 1:1 décomp).
 *
 * Le pocket pour un itemId vient de `getItem(itemKey).pocket` (= items.json,
 * extrait de items.h `.pocket = POCKET_X` par scripts/extract-items.mjs). On
 * convertit 'POCKET_X' string → pocketId number via `_pocketNameToId`.
 */
// Side-effect import : charge bagFix.ts (= shim ESM technique, juste pour
// préserver la chaîne ESM eager save-system → bag → bagFix qui est essentielle
// au boot. Sans, boot stall silencieux après decomp-constants.
// Cause root non identifiée — investigation déférée. Voir bagFix.ts pour
// détails complets de la dette.
import '../bagFix';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { getItem } from '../system/data-tables';
import {
  type ItemSlot,
  type BagPocket,
  emptyItemSlots,
  BAG_ITEMS_COUNT, BAG_POKEBALLS_COUNT, BAG_TMHM_COUNT, BAG_BERRIES_COUNT, BAG_KEYITEMS_COUNT,
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT,
} from './bag-types';

// Re-export types/constants pour les callers existants (= compat).
export type { ItemSlot, Bag, BagPocket } from './bag-types';
export {
  emptyBag, migrateBag,
  BAG_ITEMS_COUNT, BAG_POKEBALLS_COUNT, BAG_TMHM_COUNT, BAG_BERRIES_COUNT, BAG_KEYITEMS_COUNT,
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT,
} from './bag-types';

// ─── 1:1 décomp `EWRAM_DATA struct BagPocket gBagPockets[POCKETS_COUNT]` ─────
// item.c:21. Initialisé zero-filled au boot, wire par SetBagItemsPointers().

export const gBagPockets: BagPocket[] = [
  { itemSlots: [], capacity: BAG_ITEMS_COUNT },
  { itemSlots: [], capacity: BAG_POKEBALLS_COUNT },
  { itemSlots: [], capacity: BAG_TMHM_COUNT },
  { itemSlots: [], capacity: BAG_BERRIES_COUNT },
  { itemSlots: [], capacity: BAG_KEYITEMS_COUNT },
];

// ─── 1:1 décomp `SetBagItemsPointers` (item.c:61-77) ─────────────────────────

/** 1:1 décomp `void SetBagItemsPointers(void)` (item.c:61) :
 *    gBagPockets[ITEMS_POCKET].itemSlots = gSaveBlock1Ptr->bagPocket_Items;
 *    gBagPockets[ITEMS_POCKET].capacity = BAG_ITEMS_COUNT;
 *    ... idem 4 autres pockets ...
 *
 *  Appelé par `LoadGameSave` (load_save.c:80) après que gSaveBlock1Ptr ait été
 *  swap vers le bloc fraichement chargé. Aussi appelé au boot init quand
 *  gSaveBlock1Ptr est lazy-init via `GetSaveBlock1()` (= save-block-state.ts). */
export function SetBagItemsPointers(): void {
  // 1:1 décomp item.c:63-76 — wire les 5 pointers vers les fields SaveBlock1.
  gBagPockets[ITEMS_POCKET].itemSlots = gSaveBlock1Ptr.bagPocket_Items as ItemSlot[];
  gBagPockets[ITEMS_POCKET].capacity = BAG_ITEMS_COUNT;
  gBagPockets[KEYITEMS_POCKET].itemSlots = gSaveBlock1Ptr.bagPocket_KeyItems as ItemSlot[];
  gBagPockets[KEYITEMS_POCKET].capacity = BAG_KEYITEMS_COUNT;
  gBagPockets[BALLS_POCKET].itemSlots = gSaveBlock1Ptr.bagPocket_PokeBalls as ItemSlot[];
  gBagPockets[BALLS_POCKET].capacity = BAG_POKEBALLS_COUNT;
  gBagPockets[TMHM_POCKET].itemSlots = gSaveBlock1Ptr.bagPocket_TMHM as ItemSlot[];
  gBagPockets[TMHM_POCKET].capacity = BAG_TMHM_COUNT;
  gBagPockets[BERRIES_POCKET].itemSlots = gSaveBlock1Ptr.bagPocket_Berries as ItemSlot[];
  gBagPockets[BERRIES_POCKET].capacity = BAG_BERRIES_COUNT;
}

// ─── Migration backward-compat (ancien composite `block1.bag`) ──────────────

/** Migre un SaveBlock1 chargé depuis localStorage : convertit l'ancien
 *  `block1.bag = { items, pokeBalls, tmHm, berries, keyItems }` composite vers
 *  les 5 fields séparés `bagPocket_*` (= 1:1 décomp global.h:1012-1016).
 *
 *  Appelé par `LoadGameSave` après `TryLoadSaveSlot`. Idempotent : si les
 *  fields séparés existent déjà, no-op. */
export function migrateBlock1BagFormat(block1: unknown): unknown {
  if (!block1 || typeof block1 !== 'object') return block1;
  const b = block1 as Record<string, unknown>;
  const fixSlots = (cur: unknown, n: number): ItemSlot[] => {
    const inputArr = Array.isArray(cur) ? cur as Array<Partial<ItemSlot>> : [];
    const arr = inputArr.map(s => ({ itemKey: s?.itemKey ?? '', quantity: s?.quantity ?? 0 }));
    while (arr.length < n) arr.push({ itemKey: '', quantity: 0 });
    return arr.slice(0, n);
  };
  // Si format ancien : block1.bag existe et fields séparés absents → migrer.
  const hasOldFormat = !!b.bag && typeof b.bag === 'object';
  const hasNewFormat = !!b.bagPocket_Items && Array.isArray(b.bagPocket_Items);
  if (hasOldFormat && !hasNewFormat) {
    const oldBag = b.bag as Record<string, unknown>;
    b.bagPocket_Items = fixSlots(oldBag.items, BAG_ITEMS_COUNT);
    b.bagPocket_KeyItems = fixSlots(oldBag.keyItems, BAG_KEYITEMS_COUNT);
    b.bagPocket_PokeBalls = fixSlots(oldBag.pokeBalls, BAG_POKEBALLS_COUNT);
    b.bagPocket_TMHM = fixSlots(oldBag.tmHm, BAG_TMHM_COUNT);
    b.bagPocket_Berries = fixSlots(oldBag.berries, BAG_BERRIES_COUNT);
    delete b.bag;
    console.log('[bag] migrated old composite block1.bag → 5 separate bagPocket_* fields (1:1 décomp)');
  } else if (!hasNewFormat) {
    // Format vide (= fresh init) : init les 5 fields séparés.
    b.bagPocket_Items = fixSlots(null, BAG_ITEMS_COUNT);
    b.bagPocket_KeyItems = fixSlots(null, BAG_KEYITEMS_COUNT);
    b.bagPocket_PokeBalls = fixSlots(null, BAG_POKEBALLS_COUNT);
    b.bagPocket_TMHM = fixSlots(null, BAG_TMHM_COUNT);
    b.bagPocket_Berries = fixSlots(null, BAG_BERRIES_COUNT);
  } else {
    // Format nouveau présent : just ensure capacity (en cas de save partiel).
    b.bagPocket_Items = fixSlots(b.bagPocket_Items, BAG_ITEMS_COUNT);
    b.bagPocket_KeyItems = fixSlots(b.bagPocket_KeyItems, BAG_KEYITEMS_COUNT);
    b.bagPocket_PokeBalls = fixSlots(b.bagPocket_PokeBalls, BAG_POKEBALLS_COUNT);
    b.bagPocket_TMHM = fixSlots(b.bagPocket_TMHM, BAG_TMHM_COUNT);
    b.bagPocket_Berries = fixSlots(b.bagPocket_Berries, BAG_BERRIES_COUNT);
  }
  return b;
}

// ─── Pocket name (items.json) → pocketId (1:1 décomp) ──────────────────────

/** 1:1 décomp `enum Pocket` (item.h:11-18). Mapping 'POCKET_X' string
 *  (= items.json extract) → pocketId number (0..4). */
function _pocketNameToId(pocketName: string): number {
  switch (pocketName) {
    case 'POCKET_ITEMS': return ITEMS_POCKET;
    case 'POCKET_POKE_BALLS': return BALLS_POCKET;
    case 'POCKET_TM_HM': return TMHM_POCKET;
    case 'POCKET_BERRIES': return BERRIES_POCKET;
    case 'POCKET_KEY_ITEMS': return KEYITEMS_POCKET;
  }
  return -1;
}

/** Pour un itemKey, retourne le pocketId (= ITEMS_POCKET..KEYITEMS_POCKET) ou -1. */
function _getPocketIdForItem(itemKey: string): number {
  if (!itemKey) return -1;
  const item = getItem(itemKey);
  if (!item || !item.pocket || item.pocket === 'POCKET_NONE') return -1;
  return _pocketNameToId(item.pocket);
}

// ─── Constants 1:1 décomp `include/constants/items.h:14-15` ──────────────────

/** 1:1 décomp `MAX_BAG_ITEM_CAPACITY` (= 99). */
const MAX_BAG_ITEM_CAPACITY = 99;
/** 1:1 décomp `MAX_BERRY_CAPACITY` (= 999). */
const MAX_BERRY_CAPACITY = 999;

/** 1:1 décomp `GetBagItemQuantity` (item.c:26-33) :
 *    static u16 GetBagItemQuantity(u16 *quantity)
 *      { return *quantity ^ gSaveBlock2Ptr->encryptionKey; }
 *  Notre port stocke quantity EN CLAIR (= simplification déjà actée).
 *  Slot capacity max : 999 pour berries, 99 autres (= 1:1 items.h). */
function _slotCapacity(pocketId: number): number {
  return pocketId === BERRIES_POCKET ? MAX_BERRY_CAPACITY : MAX_BAG_ITEM_CAPACITY;
}

// ─── 1:1 décomp API ──────────────────────────────────────────────────────────

/** 1:1 décomp `u16 CountTotalItemQuantityInBag(u16 itemId)` (item.c:120-132) :
 *    Itère le pocket de l'item, accumule les quantités du même itemId.
 *  Notre signature simplifiée : prend itemKey + retourne total directement. */
export function GetBagItemQuantity(itemKey: string): number {
  const pocketId = _getPocketIdForItem(itemKey);
  if (pocketId < 0) return 0;
  const pocket = gBagPockets[pocketId];
  let total = 0;
  for (let i = 0; i < pocket.capacity; i++) {
    const slot = pocket.itemSlots[i];
    if (slot && slot.itemKey === itemKey) total += slot.quantity;
  }
  return total;
}

/** 1:1 décomp `bool8 CheckBagHasItem(u16 itemId, u16 count)` (item.c:134-155). */
export function CheckBagHasItem(itemKey: string, count: number): boolean {
  return GetBagItemQuantity(itemKey) >= count;
}

/** 1:1 décomp `bool8 AddBagItem(u16 itemId, u16 count)` (item.c:243-348).
 *
 *  Algorithme :
 *    1. Si pocket TMHM/Berries : check duplicate slot existant ; sinon parcours
 *       les slots du même itemId et fill jusqu'à slot cap.
 *    2. Si remaining > 0 après pass 1 : allouer un nouveau slot (= itemId vide).
 *    3. Return false si capacity insuffisante.
 *
 *  1:1 décomp ROLLBACK-SAFE (item.c:262-340) : le décomp travaille sur une COPIE
 *  (`newItems = AllocZeroed` + memcpy), et ne COMMIT (memcpy vers itemSlots) QU'EN
 *  CAS DE SUCCÈS. Si le sac est plein (échec), il `Free(newItems)` SANS commit →
 *  le sac reste INCHANGÉ (atomicité all-or-nothing). On reproduit ça via une copie
 *  `work` + commit final. (Avant : mutation directe → des items partiels restaient
 *  ajoutés même en cas d'échec = perte/dup d'item au cas-limite.) */
export function AddBagItem(itemKey: string, count: number): boolean {
  const pocketId = _getPocketIdForItem(itemKey);
  if (pocketId < 0) return false;
  const pocket = gBagPockets[pocketId];
  const slotCap = _slotCapacity(pocketId);
  const noDup = (pocketId === TMHM_POCKET || pocketId === BERRIES_POCKET);

  // 1:1 décomp : copie de travail (= newItems). Toutes les modifs se font dessus ;
  // on ne commit vers pocket.itemSlots qu'au succès (les `return false` = rollback).
  const work = pocket.itemSlots.map(s => (s ? { itemKey: s.itemKey, quantity: s.quantity } : s));
  let remaining = count;

  // Pass 1 : remplir les slots existants du même item (= 1:1 décomp ll.270-307).
  for (let i = 0; i < pocket.capacity; i++) {
    if (remaining === 0) break;
    const slot = work[i];
    if (!slot) continue;
    if (slot.itemKey === itemKey && slot.quantity > 0) {
      const room = slotCap - slot.quantity;
      if (room >= remaining) {
        slot.quantity += remaining;
        remaining = 0;
        break;
      } else {
        if (noDup) return false; // TM/HM + Berries ne peuvent pas overflow (rollback : work non commité)
        slot.quantity = slotCap;
        remaining -= room;
      }
    }
  }

  // Pass 2 : créer de nouveaux slots si reste à placer (= 1:1 décomp ll.310-336).
  if (remaining > 0) {
    for (let i = 0; i < pocket.capacity; i++) {
      if (remaining === 0) break;
      const slot = work[i];
      if (!slot) continue;
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

  if (remaining > 0) return false; // sac plein → PAS de commit (rollback 1:1, sac inchangé).

  // Succès : commit la copie de travail (= 1:1 décomp `memcpy(itemPocket->itemSlots, newItems)`).
  for (let i = 0; i < pocket.capacity; i++) {
    const dst = pocket.itemSlots[i];
    const src = work[i];
    if (dst && src) { dst.itemKey = src.itemKey; dst.quantity = src.quantity; }
  }
  return true;
}

/** 1:1 décomp `bool8 CheckBagHasSpace(u16 itemId, u16 count)` (item.c:179-241).
 *
 *  Vérifie sans muter si le bag peut accueillir `count` items du type `itemKey`.
 *  Returns true si OK, false si pas assez de place. */
export function CheckBagHasSpace(itemKey: string, count: number): boolean {
  if (!itemKey) return false;
  const pocketId = _getPocketIdForItem(itemKey);
  if (pocketId < 0) return false;
  // 1:1 décomp :189-191 : if (Pyramid bag mode) return CheckPyramidBagHasSpace.
  // Pyramid bag U-tier (Battle Pyramid subsystem) — skip ici. Dette R3 documentée.
  const pocket = gBagPockets[pocketId];
  const slotCap = _slotCapacity(pocketId);
  const noDup = (pocketId === TMHM_POCKET || pocketId === BERRIES_POCKET);
  let remaining = count;
  // 1:1 :200-214 : check space dans slots existants du même item.
  for (let i = 0; i < pocket.capacity; i++) {
    const slot = pocket.itemSlots[i];
    if (!slot) continue;
    if (slot.itemKey === itemKey && slot.quantity > 0) {
      const ownedCount = slot.quantity;
      if (ownedCount + remaining <= slotCap) return true;
      if (noDup) return false;
      remaining -= (slotCap - ownedCount);
      if (remaining === 0) break;  // :212 (= should be return TRUE but matches décomp)
    }
  }
  // 1:1 :217-237 : check space dans empty slots.
  if (remaining > 0) {
    for (let i = 0; i < pocket.capacity; i++) {
      const slot = pocket.itemSlots[i];
      if (!slot) continue;
      if (!slot.itemKey || slot.quantity === 0) {
        if (remaining > slotCap) {
          if (noDup) return false;
          remaining -= slotCap;
        } else {
          remaining = 0;
          break;
        }
      }
    }
    if (remaining > 0) return false;  // :237 bag full.
  }
  return true;
}

/** 1:1 décomp `bool8 RemoveBagItem(u16 itemId, u16 count)` (item.c:350-441). */
export function RemoveBagItem(itemKey: string, count: number): boolean {
  if (!CheckBagHasItem(itemKey, count)) return false;
  const pocketId = _getPocketIdForItem(itemKey);
  if (pocketId < 0) return false;
  const pocket = gBagPockets[pocketId];
  let remaining = count;
  for (let i = 0; i < pocket.capacity; i++) {
    if (remaining === 0) break;
    const slot = pocket.itemSlots[i];
    if (!slot) continue;
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
  for (let pocketId = 0; pocketId < POCKETS_COUNT; pocketId++) {
    const pocket = gBagPockets[pocketId];
    while (pocket.itemSlots.length < maxPerPocket) {
      pocket.itemSlots.push({ itemKey: '', quantity: 0 });
    }
    pocket.capacity = pocket.itemSlots.length;
  }
}

/** 1:1 décomp `void CompactItemsInBagPocket(struct BagPocket *pocket)`
 *  (item.c:606-618) : remove gaps (= empty slots) en shiftant les non-empty
 *  au début. Préserve l'ordre. */
function _compactPocket(pocket: BagPocket): void {
  const valid = pocket.itemSlots.filter(s => s && s.itemKey && s.quantity > 0);
  for (let i = 0; i < pocket.capacity; i++) {
    if (i < valid.length) {
      pocket.itemSlots[i].itemKey = valid[i].itemKey;
      pocket.itemSlots[i].quantity = valid[i].quantity;
    } else {
      pocket.itemSlots[i].itemKey = '';
      pocket.itemSlots[i].quantity = 0;
    }
  }
}

/** 1:1 décomp `void SortBerriesOrTMHMs(struct BagPocket *bagPocket)`
 *  (item.c:620-638) : sort par itemId croissant + remove gaps.
 *  Notre items.json est en ordre de définition donc on trie par itemKey
 *  alphabétique (= proxy pour itemId du décomp). */
function _sortPocketByItemId(pocket: BagPocket): void {
  const valid = pocket.itemSlots.filter(s => s && s.itemKey && s.quantity > 0);
  valid.sort((a, b) => a.itemKey.localeCompare(b.itemKey));
  for (let i = 0; i < pocket.capacity; i++) {
    if (i < valid.length) {
      pocket.itemSlots[i].itemKey = valid[i].itemKey;
      pocket.itemSlots[i].quantity = valid[i].quantity;
    } else {
      pocket.itemSlots[i].itemKey = '';
      pocket.itemSlots[i].quantity = 0;
    }
  }
}

/** 1:1 décomp `void SortAndCompactBagPocket(u8 pocketId)` (item_menu.c).
 *  Appelé après chaque modification (= AddBagItem / RemoveBagItem / DoItemSwap)
 *  pour normaliser le pocket. TMHM + Berries → sort by itemId. Autres → compact
 *  (remove gaps). */
export function UpdatePocketItemList(pocketKey: 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems'): void {
  let pocketId: number;
  switch (pocketKey) {
    case 'items': pocketId = ITEMS_POCKET; break;
    case 'pokeBalls': pocketId = BALLS_POCKET; break;
    case 'tmHm': pocketId = TMHM_POCKET; break;
    case 'berries': pocketId = BERRIES_POCKET; break;
    case 'keyItems': pocketId = KEYITEMS_POCKET; break;
    default: return;
  }
  const pocket = gBagPockets[pocketId];
  if (pocketId === TMHM_POCKET || pocketId === BERRIES_POCKET) _sortPocketByItemId(pocket);
  else _compactPocket(pocket);
}

/** 1:1 décomp `ClearBag()` (item.c) : reset complet à empty.
 *  Iterate les 5 pockets via gBagPockets, set tous les slots à empty. */
export function ClearBag(): void {
  for (let pocketId = 0; pocketId < POCKETS_COUNT; pocketId++) {
    const pocket = gBagPockets[pocketId];
    for (let i = 0; i < pocket.capacity; i++) {
      if (pocket.itemSlots[i]) {
        pocket.itemSlots[i].itemKey = '';
        pocket.itemSlots[i].quantity = 0;
      }
    }
  }
}

/** Debug helper : list non-empty slots across all pockets. */
export function bagContents(): Array<{ pocket: string; itemKey: string; quantity: number }> {
  const result: Array<{ pocket: string; itemKey: string; quantity: number }> = [];
  const pocketNames = ['POCKET_ITEMS', 'POCKET_POKE_BALLS', 'POCKET_TM_HM', 'POCKET_BERRIES', 'POCKET_KEY_ITEMS'];
  for (let pocketId = 0; pocketId < POCKETS_COUNT; pocketId++) {
    const pocket = gBagPockets[pocketId];
    for (let i = 0; i < pocket.capacity; i++) {
      const slot = pocket.itemSlots[i];
      if (slot && slot.itemKey && slot.quantity > 0) {
        result.push({ pocket: pocketNames[pocketId], itemKey: slot.itemKey, quantity: slot.quantity });
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

// Note : on évite `emptyItemSlots` unused warning car réexporté ici sans
// utilisation interne (= used in save-blocks.ts emptySaveBlock1).
void emptyItemSlots;

// ─── Init early : wire gBagPockets dès le top-level (= 1:1 décomp boot) ─────
//
// `GetSaveBlock1()` lazy-init via emptySaveBlock1 qui contient déjà les 5
// fields séparés bagPocket_*. SetBagItemsPointers les wire vers gBagPockets.
// Appelé aussi par LoadGameSave + ResetSaveBlocks (= save-system.ts) après
// chaque swap.
SetBagItemsPointers();

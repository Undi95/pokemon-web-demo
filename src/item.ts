// src/item.ts — foyer 1:1 décomp `src/item.c` (accesseurs gItems).
// Décyclé depuis decomp-bridge.ts (spine-decycle, périphériques) : ces accesseurs
// lisent la data-table items FR (data-tables.ts) ; le bridge n'était qu'un relais.
import {
  getItemNameFr as _getItemNameFr,
  getItem as _getItem,
  getItemDescriptionFr as _getItemDescFr,
  getItemKeyById as _getItemKeyById,
} from '../harness/runtime/data-tables';
import { resolveDecompConstant as _resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { sTMHMMoves as _sTMHMMoves } from './data/party_menu';

/** items.json key d'un itemId numérique (= modèle move-named du projet :
 *  "ITEM_TM_FOCUS_PUNCH" pour TM01, "ITEM_HM_CUT" pour HM01) — miroir de
 *  bag-pockets.slotItemId qui fait le sens inverse. getItemKeyById fait
 *  numéric → enum-numbered ("ITEM_TM01") via constants.items reverse ;
 *  on convertit ensuite en move-named via sTMHMMoves (= clé items.json).
 *  Sans ça, getItem("ITEM_TM01") rate (items.json n'a que "ITEM_TM_…").
 *  Exposé sous `GetBagItemKey` pour RemoveBagItem/AddBagItem/CheckBagHasItem
 *  qui attendent la CLÉ items.json (⚠️ getItemKeyById brut renvoie
 *  "ITEM_TM01" → CheckBagHasItem rate → RemoveBagItem no-op silencieux). */
function _itemKeyForLookup(itemId: number): string {
  const enumKey = _getItemKeyById(itemId);
  if (enumKey.startsWith('ITEM_TM') && /^\d+$/.test(enumKey.slice(7))) {
    const tmIdx = parseInt(enumKey.slice(7), 10) - 1; // ITEM_TM01 → 0
    const move = _sTMHMMoves[tmIdx];
    if (move) return 'ITEM_TM_' + move.slice(5); // "MOVE_FOCUS_PUNCH" → "ITEM_TM_FOCUS_PUNCH"
  } else if (enumKey.startsWith('ITEM_HM') && /^\d+$/.test(enumKey.slice(7))) {
    const hmIdx = 50 + parseInt(enumKey.slice(7), 10) - 1; // ITEM_HM01 → 50
    const move = _sTMHMMoves[hmIdx];
    if (move) return 'ITEM_HM_' + move.slice(5);
  }
  return enumKey;
}

/** Clé items.json (= clé SAC) d'un itemId numérique — `_itemKeyForLookup`
 *  exposé (TM/HM enum-numbered → move-named). À utiliser pour RemoveBagItem/
 *  AddBagItem/CheckBagHasItem (leçon : CheckBagHasItem attend une CLÉ). */
export function GetBagItemKey(itemId: number): string {
  return _itemKeyForLookup(itemId);
}

/** 1:1 décomp `src/item.c:879 GetItemName(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].name;
 *
 *  Notre data table contient les noms FR. itemId numérique → itemKey via
 *  `_itemKeyForLookup` (= miroir GetItemDescription, normalise TM/HM
 *  enum-numbered → move-named, gère les autres items via getItemKeyById).
 *  Ancien `ITEM_${id}` ne matchait AUCUNE clé items.json → retournait l'enum
 *  string brut (= "13 est sélectionné." au lieu de "POTION est sélectionné."). */
export function GetItemName(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItemNameFr(itemKey);
}

/** 1:1 décomp `src/item.c:905 GetItemDescription(itemId)`. AVANT : `ITEM_${id}`
 *  produisait "ITEM_331" → getItem rate (items.json clés = enum-name, pas
 *  numéric stringifié) → desc vide. Pour TM/HM : items.json utilise des
 *  clés move-named ("ITEM_TM_FOCUS_PUNCH") ≠ enum décomp ("ITEM_TM01") →
 *  conversion via _itemKeyForLookup (= miroir slotItemId, 1:1-faithful). */
export function GetItemDescription(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  const item = _getItem(itemKey);
  if (!item) return '';
  return _getItemDescFr(item.descriptionLabel ?? '');
}

/** 1:1 décomp `src/item.c:910 GetItemImportance(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].importance;
 *  Posé à 1 pour tous les KEY ITEMS + les 8 HM (= "objets uniques à usage
 *  infini" — pas de quantité affichée, jamais jetables, peuvent être
 *  registered au SELECT). Items.json normalisé via _itemKeyForLookup
 *  (= TM/HM enum-numbered → move-named, miroir GetItemDescription). */
export function GetItemImportance(itemId: number | string): number {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.importance ?? 0;
}

/** 1:1 décomp `src/item.c GetItemFieldFunc(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].fieldUseFunc;
 *  Notre TS retourne le NOM du handler (= string depuis items.json) — le
 *  dispatcher `ItemMenu_UseOutOfBattle` route ensuite vers l'impl TS. */
export function GetItemFieldFunc(itemId: number | string): string | null {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.fieldUseFunc ?? null;
}

/** 1:1 décomp `src/item.c GetItemType(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].type;
 *  Notre TS retourne le NOM du type (= string `ITEM_USE_PARTY_MENU` etc.). */
export function GetItemType(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.type ?? '';
}

/** 1:1 décomp `src/item.c GetItemSecondaryId(itemId)`. */
export function GetItemSecondaryId(itemId: number | string): string | null {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.secondaryId ?? null;
}

/** 1:1 décomp `src/item.c GetItemPrice(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].price;
 *  Prix d'achat de base (le Pokémart le shift `>> IsPokeNewsActive(SLATEPORT)`).
 *  La donnée vient de items.json (`price`), miroir de `gItems[].price`. */
export function GetItemPrice(itemId: number | string): number {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.price ?? 0;
}

/** 1:1 décomp `src/item.c GetItemPocket(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].pocket;
 *  La décomp renvoie un u8 (enum POCKET_*) ; notre data table stocke le NOM
 *  ("POCKET_ITEMS", "POCKET_TM_HM"…) → on renvoie la string (le shop compare
 *  `=== 'POCKET_TM_HM'` pour afficher le nom du capacité de la CT/CS). */
export function GetItemPocket(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.pocket ?? '';
}

// ─── Hold effects 1:1 (item.c:895-905) — ex-`engine/battle/data/item-hold-effects` ──
// Équivalent `gItems[].holdEffect`/`holdEffectParam` : arrays précalculés
// indexés par u16 itemId (hot path combat — GetItemHoldEffect est appelé à
// chaque check d'objet tenu), peuplés une fois au boot depuis items.json
// (= data/items.h extrait) par `loadItemHoldEffects` (harness/main.ts).

interface _RawItemHoldData {
  holdEffect?: string;
  holdEffectParam?: number;
}

let _holdEffects: number[] = [];
let _holdEffectParams: number[] = [];
let _holdEffectsLoaded = false;

/** 1:1 décomp `u8 GetItemHoldEffect(u16 itemId)` (item.c:895) :
 *    return gItems[SanitizeItemId(itemId)].holdEffect; */
export function GetItemHoldEffect(itemId: number): number {
  return _holdEffects[itemId] ?? 0;
}

/** 1:1 décomp `u8 GetItemHoldEffectParam(u16 itemId)` (item.c:~900) :
 *    return gItems[SanitizeItemId(itemId)].holdEffectParam; */
export function GetItemHoldEffectParam(itemId: number): number {
  return _holdEffectParams[itemId] ?? 0;
}

/** Peuple les arrays holdEffect/holdEffectParam depuis public/decomp/em/items.json
 *  (HOLD_EFFECT_* résolus via decomp-constants). Appelé au boot (harness/main.ts). */
export async function loadItemHoldEffects(): Promise<void> {
  if (_holdEffectsLoaded) return;
  try {
    const resp = await fetch('/decomp/em/items.json');
    if (!resp.ok) {
      console.warn(`[item-hold-effects] fetch failed : ${resp.status}`);
      return;
    }
    const raw = await resp.json() as Record<string, _RawItemHoldData>;
    const maxId = 378; // ITEM_ENIGMA_BERRY est l'un des derniers, marge.
    _holdEffects = new Array(maxId).fill(0);
    _holdEffectParams = new Array(maxId).fill(0);
    for (const [itemName, data] of Object.entries(raw)) {
      const id = _resolveDecompConstant(itemName);
      if (typeof id !== 'number' || id < 0 || id >= maxId) continue;
      if (data.holdEffect) {
        const eff = _resolveDecompConstant(data.holdEffect);
        if (typeof eff === 'number') _holdEffects[id] = eff;
      }
      if (data.holdEffectParam !== undefined) {
        _holdEffectParams[id] = data.holdEffectParam;
      }
    }
    _holdEffectsLoaded = true;
    console.log(`[item-hold-effects] loaded ${Object.keys(raw).length} items`);
  } catch (e) {
    console.error('[item-hold-effects] load failed', e);
  }
}

/** Expose pour devtools. */
(globalThis as Record<string, unknown>).__itemHoldEffectsData = {
  get: (itemId: number) => ({
    holdEffect: GetItemHoldEffect(itemId),
    holdEffectParam: GetItemHoldEffectParam(itemId),
  }),
  isLoaded: () => _holdEffectsLoaded,
};

// ─── Poches du sac 1:1 (item.c:590-640) — ex-`engine/bag/bag-pockets.ts` ────
// Adaptateur `gBagPockets` 1:1 (option (b), validée user) : la décomp
// `struct BagPocket gBagPockets[5]` = `{ ItemSlot{u16 itemId,u16 quantity}
// itemSlots[]; u8 capacity }`. Notre persistance (gSaveBlock1Ptr.bag, bag.ts)
// stocke les poches en `ItemSlot{itemKey:string, quantity}[]` ('' = vide).
// Cette section matérialise la shape décomp : item_menu lit `itemSlots[i]` /
// `capacity` EXACTEMENT comme la décomp ; la traduction itemKey↔itemId est
// CONFINÉE ici (slotItemId = sens inverse de GetBagItemKey ci-dessus).
// 1:1-sém assumé : `GetBagItemQuantity` dé-XOR (encryptionKey) ; notre modèle
// stocke la quantité EN CLAIR (acté bag.ts) → `_qty(slot) = slot.quantity`.
import { gBagPockets, ITEMS_POCKET } from './engine/bag/bag';
import { getItemId as _getItemId } from '../harness/runtime/data-tables';
import type { ItemSlot } from './engine/bag/bag';

/** pocketId décomp (0..4) → tableau live `ItemSlot[]` du pocket. 1:1 strict
 *  `&gBagPockets[pocketId].itemSlots` (mutations en place = persistées). */
export function getBagPocketSlots(pocketId: number): ItemSlot[] {
  const idx = (pocketId >= 0 && pocketId < 5) ? pocketId : ITEMS_POCKET;
  return gBagPockets[idx].itemSlots;
}

/** capacity 1:1 `gBagPockets[pocketId].capacity`. */
export function getBagPocketCapacity(pocketId: number): number {
  return getBagPocketSlots(pocketId).length;
}

/** itemId canonique 1:1 d'un slot (`slot->itemId`). '' → ITEM_NONE(0).
 *  TM/HM move-named (`ITEM_TM_FOCUS_PUNCH`) → enum numéroté via l'ordre 1:1
 *  sTMHMMoves (50 TM puis 8 HM) → itemId canonique. */
export function slotItemId(slot: ItemSlot): number {
  const k = slot.itemKey;
  if (!k) return 0;
  if (k.startsWith('ITEM_TM_') || k.startsWith('ITEM_HM_')) {
    const moveKey = 'MOVE_' + k.slice(8); // après "ITEM_TM_" / "ITEM_HM_"
    const idx = _sTMHMMoves.indexOf(moveKey);
    if (idx >= 0) {
      const numbered = idx < 50
        ? `ITEM_TM${String(idx + 1).padStart(2, '0')}`
        : `ITEM_HM${String(idx - 50 + 1).padStart(2, '0')}`;
      return _getItemId(numbered);
    }
  }
  return _getItemId(k);
}

/** 1:1-sém `GetBagItemQuantity(&slot.quantity)` (quantité en clair). */
function _qty(slot: ItemSlot): number {
  return slot.quantity;
}

/** 1:1 décomp `MoveItemSlotInList(itemSlots, from, to)` (item.c:640) :
 *  save firstSlot ; si to>from → to-- puis shift gauche ; sinon shift droite ;
 *  slots[to]=firstSlot. Utilisé par item_menu / player_pc (swap SELECT). */
export function MoveItemSlotInList(slots: ItemSlot[], from: number, to_: number): void {
  let to = to_;
  if (from === to) return;
  const firstSlot: ItemSlot = { itemKey: slots[from].itemKey, quantity: slots[from].quantity };
  if (to > from) {
    to--;
    for (let i = from; i < to; i++) {
      slots[i].itemKey = slots[i + 1].itemKey;
      slots[i].quantity = slots[i + 1].quantity;
    }
  } else {
    for (let i = from; i > to; i--) {
      slots[i].itemKey = slots[i - 1].itemKey;
      slots[i].quantity = slots[i - 1].quantity;
    }
  }
  slots[to].itemKey = firstSlot.itemKey;
  slots[to].quantity = firstSlot.quantity;
}

/** 1:1 décomp `SwapItemSlots` (item.c:600) : SWAP(*a,*b,temp). */
function SwapItemSlots(slots: ItemSlot[], a: number, b: number): void {
  const tKey = slots[a].itemKey, tQty = slots[a].quantity;
  slots[a].itemKey = slots[b].itemKey; slots[a].quantity = slots[b].quantity;
  slots[b].itemKey = tKey; slots[b].quantity = tQty;
}

/** 1:1 décomp `CompactItemsInBagPocket` (item.c:606-618) : slots vides en fin
 *  de poche (bubble O(n²) exact). */
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

/** 1:1 décomp `SortBerriesOrTMHMs` (item.c:620-638) : tri par itemId croissant
 *  des slots non-vides + vides en fin (sélection O(n²) exact). */
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
 *  `return gBagPockets[pocketId - 1].itemSlots[pocketPos].itemId;`. */
export function BagGetItemIdByPocketPosition(pocketId: number, pocketPos: number): number {
  return slotItemId(getBagPocketSlots(pocketId - 1)[pocketPos]);
}

/** 1:1 décomp `BagGetQuantityByPocketPosition` (item.c:595). */
export function BagGetQuantityByPocketPosition(pocketId: number, pocketPos: number): number {
  return _qty(getBagPocketSlots(pocketId - 1)[pocketPos]);
}


// ─── PC items 1:1 (item.c:443-558) — ex-engine/pokemon/pc-items.ts (lot 11c) ──
// gSaveBlock1Ptr->pcItems : 50 slots, max 999/slot, flat (pas de pockets),
// quantité en clair. itemKey string = ITEM_NONE quand ''.
import { gSaveBlock1Ptr as _gSaveBlock1Ptr_PCI } from './engine/save/save-block-state';

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
 *        if (_gSaveBlock1Ptr_PCI->pcItems[i].itemId == ITEM_NONE)
 *            return i;
 *    return -1;
 */
function _findFreePCItemSlot(): number {
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (!pcItems[i].itemKey) return i;
  }
  return -1;
}

/** 1:1 décomp `u8 CountUsedPCItemSlots(void)` (item.c:466-477). */
export function CountUsedPCItemSlots(): number {
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
  let used = 0;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    if (pcItems[i].itemKey) used++;
  }
  return used;
}

/** 1:1 décomp `bool8 CheckPCHasItem(u16 itemId, u16 count)` (item.c:479-489). */
export function CheckPCHasItem(itemKey: string, count: number): boolean {
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
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
  const newItems: ItemSlot[] = _gSaveBlock1Ptr_PCI.pcItems.map((s: ItemSlot) => ({
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
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
  pcItems[index].quantity -= count;
  if (pcItems[index].quantity === 0) {
    pcItems[index].itemKey = '';  // = ITEM_NONE
    CompactPCItems();
  }
}

/** 1:1 décomp `void CompactPCItems(void)` (item.c:558-575). Compacte les slots
 *  en poussant les ITEM_NONE à la fin. */
export function CompactPCItems(): void {
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
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
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    pcItems[i].itemKey = '';
    pcItems[i].quantity = 0;
  }
}

/** Helper internal : commit staging array → _gSaveBlock1Ptr_PCI.pcItems. */
function _commitPCItems(newItems: ItemSlot[]): void {
  const pcItems = _gSaveBlock1Ptr_PCI.pcItems;
  for (let i = 0; i < PC_ITEMS_COUNT; i++) {
    pcItems[i].itemKey = newItems[i].itemKey;
    pcItems[i].quantity = newItems[i].quantity;
  }
}

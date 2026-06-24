// src/item.ts — foyer 1:1 décomp `src/item.c` (accesseurs gItems).
// Décyclé depuis decomp-bridge.ts (spine-decycle, périphériques) : ces accesseurs
// lisent la data-table items FR (data-tables.ts) ; le bridge n'était qu'un relais.
import {
  getItemNameFr as _getItemNameFr,
  getItem as _getItem,
  getItemDescriptionFr as _getItemDescFr,
  getItemKeyById as _getItemKeyById,
} from '../harness/runtime/data-tables';
import { sTMHMMoves as _sTMHMMoves } from './engine/pokemon/tmhm-moves';

/** items.json key d'un itemId numérique (= modèle move-named du projet :
 *  "ITEM_TM_FOCUS_PUNCH" pour TM01, "ITEM_HM_CUT" pour HM01) — miroir de
 *  bag-pockets.slotItemId qui fait le sens inverse. getItemKeyById fait
 *  numéric → enum-numbered ("ITEM_TM01") via constants.items reverse ;
 *  on convertit ensuite en move-named via sTMHMMoves (= clé items.json).
 *  Sans ça, getItem("ITEM_TM01") rate (items.json n'a que "ITEM_TM_…"). */
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

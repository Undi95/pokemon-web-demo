/**
 * decoration_inventory.ts — Port 1:1 STRICT du décomp `src/decoration_inventory.c` (159 lignes).
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/decoration_inventory.c` (159l)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/decoration_inventory.h`
 *     `struct DecorationInventory { u8 *items; u8 size; };`
 *     `extern struct DecorationInventory gDecorationInventories[];`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/decoration.h`
 *     `enum DecorationCategory { DECORCAT_DESK, ..., DECORCAT_COUNT };`
 *     `struct Decoration { u8 id; u8 name[16]; u8 permission; u8 shape;
 *                          u8 category; u16 price; const u8 *description;
 *                          const u16 *tiles; };`
 *     `extern const struct Decoration gDecorations[];`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/decorations.h`
 *     `DECOR_NONE = 0`, `NUM_DECORATIONS = DECOR_REGISTEEL_DOLL = 120`.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h:1033-1040` (SaveBlock1) :
 *     `decorationDesks[10], decorationChairs[10], decorationPlants[10],
 *      decorationOrnaments[30], decorationMats[30], decorationPosters[10],
 *      decorationDolls[40], decorationCushions[10]`.
 *
 * Pattern 1:1 strict :
 *   - `gDecorationInventories[DECORCAT_COUNT]` est un EWRAM-style array global de
 *     `{ items, size }`. Initialisé zero-filled au boot ; wire par
 *     `SetDecorationInventoriesPointers()`.
 *   - `items` pointe directement vers `gSaveBlock1Ptr->decoration*` (= référence
 *     d'array partagée, pas une copie) — comme en C avec `u8 *items = ptr`.
 *     Toute mutation `items[i] = X` écrit dans le SaveBlock1. 1:1 décomp.
 *   - Toutes les fonctions (Add/Remove/Check/Condense/etc.) opèrent sur
 *     `gDecorationInventories[category].items[i]`, jamais sur
 *     `gSaveBlock1Ptr->decoration*` direct (= 1:1 décomp).
 *
 * Notes 1:1 :
 *   - `gDecorations[]` table (= 121 entries dans décomp `src/data/decoration/header.h`)
 *     est portée 1:1 strict dans `decoration-data.ts` (import direct ci-dessous).
 *     Chaque entrée a id/name/permission/shape/category/price/description/tiles.
 *     `description` et `tiles` = string identifiers (résolvables via getString /
 *     asset loader). Voir `decoration-data.ts` pour les détails.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { DECOR_NONE } from '../include/constants/decorations';
import {
  ENUM_DecorationCategory,
} from '../include/decoration';
import { gDecorations } from './engine/ui/decoration-data';
export { gDecorations };
export type { Decoration } from './engine/ui/decoration-data';

// ─── 1:1 décomp enum DecorationCategory (= decoration.h) ─────────────────────

export const DECORCAT_DESK = ENUM_DecorationCategory.DECORCAT_DESK;       // 0
export const DECORCAT_CHAIR = ENUM_DecorationCategory.DECORCAT_CHAIR;     // 1
export const DECORCAT_PLANT = ENUM_DecorationCategory.DECORCAT_PLANT;     // 2
export const DECORCAT_ORNAMENT = ENUM_DecorationCategory.DECORCAT_ORNAMENT; // 3
export const DECORCAT_MAT = ENUM_DecorationCategory.DECORCAT_MAT;         // 4
export const DECORCAT_POSTER = ENUM_DecorationCategory.DECORCAT_POSTER;   // 5
export const DECORCAT_DOLL = ENUM_DecorationCategory.DECORCAT_DOLL;       // 6
export const DECORCAT_CUSHION = ENUM_DecorationCategory.DECORCAT_CUSHION; // 7
export const DECORCAT_COUNT = ENUM_DecorationCategory.DECORCAT_COUNT;     // 8

// ─── 1:1 décomp `struct DecorationInventory` (decoration_inventory.h:4-8) ────

/** `struct DecorationInventory { u8 *items; u8 size; };`
 *  `items` = référence directe vers `gSaveBlock1Ptr->decoration*` array
 *  (= partage de pointer C). Mutation in-place visible dans SaveBlock1. */
export interface DecorationInventory {
  items: number[];
  size: number;
}

// ─── 1:1 décomp `EWRAM_DATA struct DecorationInventory gDecorationInventories[DECORCAT_COUNT]` ──
// decoration_inventory.c:6. Initialisé zero-filled au boot (items=[], size=0),
// wire par `SetDecorationInventoriesPointers()` (= équivaut au pointer-init
// post-LoadGameSave en C).

export const gDecorationInventories: DecorationInventory[] = (() => {
  const arr: DecorationInventory[] = [];
  for (let i = 0; i < DECORCAT_COUNT; i++) {
    arr.push({ items: [], size: 0 });
  }
  return arr;
})();

// `gDecorations[]` est exporté depuis `decoration-data.ts` (re-exporté en tête
// de ce fichier pour préserver la compat des consommateurs).

// ─── Helpers internes 1:1 ────────────────────────────────────────────────────
//
// 1:1 décomp macro `SET_DECOR_INV(i, ptr)` (decoration_inventory.c:8-11) :
//    gDecorationInventories[i].items = ptr;
//    gDecorationInventories[i].size = ARRAY_COUNT(ptr);
// En TS : assigne la référence d'array SaveBlock1 directement (= partage pointer).

function _SET_DECOR_INV(i: number, ptr: number[]): void {
  gDecorationInventories[i].items = ptr;
  gDecorationInventories[i].size = ptr.length;
}

// ─── Forward-decl 1:1 décomp `InitDecorationContextItems` ────────────────────
// decoration.c (PAS encore porté). Quand le port arrivera, importer + appeler.
// Pour l'instant : stub no-op, marqué TODO.
// 1:1 TODO : import InitDecorationContextItems from decoration.c when ported.

function InitDecorationContextItems(): void {
  // No-op tant que decoration.c n'est pas porté.
}

// ─── 1:1 décomp public API ───────────────────────────────────────────────────

/** 1:1 décomp `SetDecorationInventoriesPointers` (decoration_inventory.c:13-24).
 *  Wire chaque `gDecorationInventories[category].items` vers le SaveBlock1 array
 *  correspondant. Appelé post-LoadGameSave / au boot. */
export function SetDecorationInventoriesPointers(): void {
  _SET_DECOR_INV(DECORCAT_DESK,     gSaveBlock1Ptr.decorationDesks as number[]);
  _SET_DECOR_INV(DECORCAT_CHAIR,    gSaveBlock1Ptr.decorationChairs as number[]);
  _SET_DECOR_INV(DECORCAT_PLANT,    gSaveBlock1Ptr.decorationPlants as number[]);
  _SET_DECOR_INV(DECORCAT_ORNAMENT, gSaveBlock1Ptr.decorationOrnaments as number[]);
  _SET_DECOR_INV(DECORCAT_MAT,      gSaveBlock1Ptr.decorationMats as number[]);
  _SET_DECOR_INV(DECORCAT_POSTER,   gSaveBlock1Ptr.decorationPosters as number[]);
  _SET_DECOR_INV(DECORCAT_DOLL,     gSaveBlock1Ptr.decorationDolls as number[]);
  _SET_DECOR_INV(DECORCAT_CUSHION,  gSaveBlock1Ptr.decorationCushions as number[]);
  InitDecorationContextItems();
}

/** 1:1 décomp `static void ClearDecorationInventory(u8 category)`
 *  (decoration_inventory.c:26-31). Reset une catégorie à DECOR_NONE. */
function ClearDecorationInventory(category: number): void {
  let i: number;
  for (i = 0; i < gDecorationInventories[category].size; i++)
    gDecorationInventories[category].items[i] = DECOR_NONE;
}

/** 1:1 décomp `ClearDecorationInventories` (decoration_inventory.c:33-38).
 *  Reset toutes les 8 catégories. */
export function ClearDecorationInventories(): void {
  let category: number;
  for (category = 0; category < DECORCAT_COUNT; category++)
    ClearDecorationInventory(category);
}

/** 1:1 décomp `GetFirstEmptyDecorSlot` (decoration_inventory.c:40-50).
 *  Renvoie le premier slot vide (= DECOR_NONE) dans la catégorie, ou -1. */
export function GetFirstEmptyDecorSlot(category: number): number {
  let i: number;
  for (i = 0; i < gDecorationInventories[category].size; i++) {
    if (gDecorationInventories[category].items[i] === DECOR_NONE)
      return i;
  }
  return -1;
}

/** 1:1 décomp `CheckHasDecoration` (decoration_inventory.c:52-65).
 *  TRUE si la décoration est déjà dans l'inventaire de sa catégorie. */
export function CheckHasDecoration(decor: number): boolean {
  let i: number;
  let category: number;

  category = gDecorations[decor].category;
  for (i = 0; i < gDecorationInventories[category].size; i++) {
    if (gDecorationInventories[category].items[i] === decor)
      return true;
  }
  return false;
}

/** 1:1 décomp `DecorationAdd` (decoration_inventory.c:67-80).
 *  Ajoute la décoration au premier slot vide. FALSE si DECOR_NONE ou plein. */
export function DecorationAdd(decor: number): boolean {
  let category: number;
  let idx: number;

  if (decor === DECOR_NONE)
    return false;
  category = gDecorations[decor].category;
  idx = GetFirstEmptyDecorSlot(category);
  if (idx === -1)
    return false;
  gDecorationInventories[category].items[idx] = decor;
  return true;
}

/** 1:1 décomp `DecorationCheckSpace` (decoration_inventory.c:82-89).
 *  TRUE si y'a un slot libre dans la catégorie de la décoration. */
export function DecorationCheckSpace(decor: number): boolean {
  if (decor === DECOR_NONE)
    return false;
  if (GetFirstEmptyDecorSlot(gDecorations[decor].category) === -1)
    return false;
  return true;
}

/** 1:1 décomp `DecorationRemove` (decoration_inventory.c:91-112).
 *  Trouve + supprime la décoration, puis CondenseDecorationsInCategory.
 *  Renvoie 1 si trouvée+supprimée, 0 sinon (= s8 ret du décomp). */
export function DecorationRemove(decor: number): number {
  let i: number;
  let category: number;

  i = 0;
  if (decor === DECOR_NONE)
    return 0;

  for (i = 0; i < gDecorationInventories[gDecorations[decor].category].size; i++) {
    category = gDecorations[decor].category;
    if (gDecorationInventories[category].items[i] === decor) {
      gDecorationInventories[category].items[i] = DECOR_NONE;
      CondenseDecorationsInCategory(category);
      return 1;
    }
  }

  return 0;
}

/** 1:1 décomp `CondenseDecorationsInCategory` (decoration_inventory.c:114-132).
 *  Tri par insertion-style : items non-DECOR_NONE migrés au début, triés croissant.
 *  Algorithme = O(n²) bubble-style 1:1 du décomp. */
export function CondenseDecorationsInCategory(category: number): void {
  let i: number;
  let j: number;
  let tmp: number;

  for (i = 0; i < gDecorationInventories[category].size; i++) {
    for (j = i + 1; j < gDecorationInventories[category].size; j++) {
      if (gDecorationInventories[category].items[j] !== DECOR_NONE
        && (gDecorationInventories[category].items[i] === DECOR_NONE
          || gDecorationInventories[category].items[i] > gDecorationInventories[category].items[j])) {
        tmp = gDecorationInventories[category].items[i];
        gDecorationInventories[category].items[i] = gDecorationInventories[category].items[j];
        gDecorationInventories[category].items[j] = tmp;
      }
    }
  }
}

/** 1:1 décomp `GetNumOwnedDecorationsInCategory` (decoration_inventory.c:134-147).
 *  Compte les slots non-DECOR_NONE dans la catégorie. */
export function GetNumOwnedDecorationsInCategory(category: number): number {
  let i: number;
  let ct: number;

  ct = 0;
  for (i = 0; i < gDecorationInventories[category].size; i++) {
    if (gDecorationInventories[category].items[i] !== DECOR_NONE)
      ct++;
  }

  return ct;
}

/** 1:1 décomp `GetNumOwnedDecorations` (decoration_inventory.c:149-159).
 *  Somme du compte de chaque catégorie. */
export function GetNumOwnedDecorations(): number {
  let category: number;
  let count: number;

  count = 0;
  for (category = 0; category < DECORCAT_COUNT; category++)
    count += GetNumOwnedDecorationsInCategory(category);

  return count;
}

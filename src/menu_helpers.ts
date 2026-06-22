/**
 * menu_helpers.ts — miroir 1:1 de `decomp/src/menu_helpers.c` (sous-ensemble
 * autonome : logique de liste/curseur, input L/R + quantité, checks d'items).
 *
 * Sous-système PARTAGÉ (bag, PC, shop, party, list menus). Ce module est LA
 * maison 1:1 (↔ menu_helpers.c) ; les anciens fichiers engine re-exportent.
 *
 * Sémantique pointeur 1:1 : la décomp prend des `u16 *`/`s16 *` (mutés en place).
 * JS n'a pas de pointeur → objets `ListPos { scroll, cursor }` / `IntRef { value }`
 * mutés en place (= pattern déjà établi, cf. list-menu.ts pour `u16 *`).
 *
 * HORS-SCOPE (frontières, PAS de la dette) :
 *  - HW (regs VRAM/OAM/BG, sprites de swap-line, tasks YesNo, DisplayMessage…) =
 *    fourni par engine ; non porté ici.
 *  - link/union (link.c/union_room.c) = single-player FR post-camion → inactif
 *    (conditions toujours fausses). Maps Trade Center / Union Room injoignables.
 */
import { getRuntime, PlaySE } from '../harness/runtime/decomp-globals';
import { SE_SELECT } from './engine/decomp-data/_common-constants';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
// OPTIONS_BUTTON_MODE_LR = 1:1 `include/constants/global.h` (constante) — importée
// de sa source décomp-data, PAS de gba-menu-system (évite le cycle menu→menu_helpers
// →gba-menu-system→menu qui cassait l'init quand menu.ts est devenu foundational).
import { OPTIONS_BUTTON_MODE_LR } from '../include/constants/global';
import { ItemIsMail } from './mail_data';

// ─── Constantes 1:1 ──────────────────────────────────────────────────────────

/** 1:1 décomp `include/menu_helpers.h:7-8`. */
export const MENU_L_PRESSED = 1;
export const MENU_R_PRESSED = 2;

// 1:1 décomp `include/gba/io_reg.h:703-713` (bits de touches GBA). À consolider à
// terme dans `src/game/include/gba/io_reg.ts` (couche HW) ; locaux ici pour l'instant.
const DPAD_RIGHT = 0x0010;
const DPAD_LEFT = 0x0020;
const DPAD_UP = 0x0040;
const DPAD_DOWN = 0x0080;
const DPAD_ANY = DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN;
const R_BUTTON = 0x0100;
const L_BUTTON = 0x0200;

/** 1:1 `#define ITEM_NONE 0` (constants/items.h). */
const ITEM_NONE = 0;

// ─── Input (1:1 JOY_NEW / JOY_REPEAT, global.h:134/137) ──────────────────────
// JOY_NEW(b)    = gMain.newKeys & b ; JOY_REPEAT(b) = gMain.newAndRepeatedKeys & b
// (TEST_BUTTON = `(field) & (button)`). Lecture du runtime (= gMain global décomp).

function _joyNew(): number {
  const rt = getRuntime();
  return rt ? (rt.gMain.newKeys | 0) : 0;
}
function _joyRepeat(): number {
  const rt = getRuntime();
  if (!rt) return 0;
  const m = rt.gMain as unknown as { newAndRepeatedKeys?: number; newKeys: number };
  return (m.newAndRepeatedKeys ?? m.newKeys) | 0;
}

// ─── Réfs mutables 1:1-sémantiques (pointeurs décomp) ────────────────────────

/** Réf de `(u16 *scrollOffset, u16 *cursorPos)`. */
export interface ListPos { scroll: number; cursor: number; }
/** Réf d'un `s16 *` (ex. `*quantity`). */
export interface IntRef { value: number; }

// ─── Quantité (1:1 menu_helpers.c:180) ───────────────────────────────────────

/** 1:1 décomp `AdjustQuantityAccordingToDPadInput(s16 *quantity, u16 max)`.
 *  UP +1 (wrap→1), DOWN −1 (wrap→max), RIGHT +10 (clamp max), LEFT −10 (clamp 1).
 *  PlaySE(SE_SELECT) + retourne TRUE si la valeur a changé. `quantity.value` muté. */
export function AdjustQuantityAccordingToDPadInput(quantity: IntRef, max: number): boolean {
  const valBefore = quantity.value;
  const dpad = _joyRepeat() & DPAD_ANY;

  if (dpad === DPAD_UP) {
    quantity.value++;
    if (quantity.value > max) quantity.value = 1;
  } else if (dpad === DPAD_DOWN) {
    quantity.value--;
    if (quantity.value <= 0) quantity.value = max;
  } else if (dpad === DPAD_RIGHT) {
    quantity.value += 10;
    if (quantity.value > max) quantity.value = max;
  } else if (dpad === DPAD_LEFT) {
    quantity.value -= 10;
    if (quantity.value <= 0) quantity.value = 1;
  } else {
    return false;
  }

  if (quantity.value === valBefore) return false;
  PlaySE(SE_SELECT);
  return true;
}

// ─── Touches L/R (1:1 menu_helpers.c:252/265) ────────────────────────────────

/** 1:1 décomp `GetLRKeysPressed(void)` : MENU_L/R_PRESSED si optionsButtonMode==LR. */
export function GetLRKeysPressed(): number {
  if ((gSaveBlock2Ptr.optionsButtonMode as number | undefined) === OPTIONS_BUTTON_MODE_LR) {
    const k = _joyNew();
    if (k & L_BUTTON) return MENU_L_PRESSED;
    if (k & R_BUTTON) return MENU_R_PRESSED;
  }
  return 0;
}

/** 1:1 décomp `GetLRKeysPressedAndHeld(void)` : idem mais JOY_REPEAT (hold). */
export function GetLRKeysPressedAndHeld(): number {
  if ((gSaveBlock2Ptr.optionsButtonMode as number | undefined) === OPTIONS_BUTTON_MODE_LR) {
    const k = _joyRepeat();
    if (k & L_BUTTON) return MENU_L_PRESSED;
    if (k & R_BUTTON) return MENU_R_PRESSED;
  }
  return 0;
}

// ─── Checks d'items (1:1 menu_helpers.c:278/290) ─────────────────────────────

/** 1:1 décomp `IsHoldingItemAllowed(u16 itemId)` : Enigma Berry interdite en zone
 *  link (Trade Center / Union Room). Single-player FR → ces conditions sont
 *  toujours FAUSSES (maps link injoignables + InUnionRoom()=false) → l'AND est
 *  faux quel que soit l'item → TRUE. */
export function IsHoldingItemAllowed(_itemId: number): boolean {
  return true;
}

/** 1:1 décomp `IsWritingMailAllowed(u16 itemId)` : interdit d'écrire du courrier en
 *  zone link. Single-player → link inactif → TRUE (ItemIsMail gardé pour la
 *  fidélité de la condition). */
export function IsWritingMailAllowed(itemId: number): boolean {
  // (IsOverworldLinkActive() || InUnionRoom()) == false en single-player.
  if (false && ItemIsMail(itemId)) return false;
  return true;
}

// ─── Link (1:1 menu_helpers.c:298/314) — single-player → inactif ─────────────

/** 1:1 décomp `MenuHelpers_IsLinkActive(void)`. Single-player FR → false
 *  (IsOverworldLinkActive() || gReceivedRemoteLinkPlayers==1 = false). */
export function MenuHelpers_IsLinkActive(): boolean {
  return false;
}

/** 1:1 décomp `MenuHelpers_ShouldWaitForLinkRecv(void)`. Single-player → false. */
export function MenuHelpers_ShouldWaitForLinkRecv(): boolean {
  return false;
}

// ─── Listes / curseur (1:1 menu_helpers.c:322/343/357) ───────────────────────

/** 1:1 décomp `SetItemListPerPageCount(struct ItemSlot *slots, u8 slotsCount,
 *  u8 *pageItems, u8 *totalItems, u8 maxPerPage)`. Compte les slots non vides
 *  (+1 pour « ANNULER ») et clamp à maxPerPage. Retourne `{ pageItems, totalItems }`
 *  (= les 2 out-params `u8 *`). */
export function SetItemListPerPageCount(
  slots: ReadonlyArray<{ itemId: number }>, slotsCount: number, maxPerPage: number,
): { pageItems: number; totalItems: number } {
  let totalItems = 0;
  for (let i = 0; i < slotsCount; i++) {
    if (slots[i] && slots[i].itemId !== ITEM_NONE) totalItems++;
  }
  totalItems++; // + 1 pour « ANNULER »
  const pageItems = totalItems > maxPerPage ? maxPerPage : totalItems;
  return { pageItems, totalItems };
}

/** 1:1 décomp `SetCursorWithinListBounds(u16 *scrollOffset, u16 *cursorPos,
 *  u8 maxShownItems, u8 totalItems)`. Clampe scroll+curseur dans [0, totalItems). */
export function SetCursorWithinListBounds(pos: ListPos, maxShownItems: number, totalItems: number): void {
  if (pos.scroll !== 0 && pos.scroll + maxShownItems > totalItems)
    pos.scroll = totalItems - maxShownItems;

  if (pos.scroll + pos.cursor >= totalItems) {
    if (totalItems === 0)
      pos.cursor = 0;
    else
      pos.cursor = totalItems - 1;
  }
}

/** 1:1 décomp `SetCursorScrollWithinListBounds(u16 *scrollOffset, u16 *cursorPos,
 *  u8 shownItems, u8 totalItems, u8 maxShownItems)`. Recentre le curseur ~milieu
 *  de la fenêtre visible (parité de maxShownItems = 2 branches strictement 1:1). */
export function SetCursorScrollWithinListBounds(
  pos: ListPos, shownItems: number, totalItems: number, maxShownItems: number,
): void {
  let i: number;
  if (maxShownItems % 2 !== 0) {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2)) {
      for (i = 0; i < pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems) break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  } else {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2) + 1) {
      for (i = 0; i <= pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems) break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  }
}

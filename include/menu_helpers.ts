/**
 * include/menu_helpers.ts — surface « header » 1:1 de `decomp/include/menu_helpers.h`.
 * Constantes MENU_L/R_PRESSED + re-export des fonctions publiques de l'impl miroir.
 */
// Constantes menu_helpers.h DÉFINIES ICI en littéraux (= leaf 1:1, absorbé
// 2026-06-29 depuis decomp-data/include/menu_helpers-data.ts). Leaf SANS dép
// src/menu_helpers → item_menu/menu peuvent les importer malgré le cycle
// src/menu_helpers→menu→include/menu_helpers→src/menu_helpers. 🚩 WART dedup
// différé (cf include/text.ts) : src/menu_helpers garde sa propre copie (usage
// interne GetLRKeysPressed) ; valeurs IDENTIQUES (menu_helpers.h:7-8).
/** 1:1 décomp `#define MENU_L_PRESSED 1` (menu_helpers.h:7). */
export const MENU_L_PRESSED = 1;
/** 1:1 décomp `#define MENU_R_PRESSED 2` (menu_helpers.h:8). */
export const MENU_R_PRESSED = 2;

// Fonctions menu_helpers.c (re-export depuis src/menu_helpers — APRÈS les
// littéraux ci-dessus pour l'ordre d'eval sûr si cycle via les fonctions).
export {
  AdjustQuantityAccordingToDPadInput,
  GetLRKeysPressed, GetLRKeysPressedAndHeld,
  IsHoldingItemAllowed, IsWritingMailAllowed,
  MenuHelpers_IsLinkActive, MenuHelpers_ShouldWaitForLinkRecv,
  SetItemListPerPageCount, SetCursorWithinListBounds, SetCursorScrollWithinListBounds,
  type ListPos, type IntRef,
} from '../src/menu_helpers';

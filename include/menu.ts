/**
 * include/menu.ts — surface « header » 1:1 de `decomp/include/menu.h` (partielle).
 * Constantes menu.h DÉFINIES ICI en littéraux + re-export des fonctions portées.
 */

// ─── menu.h #define constants (DÉFINIES ICI = leaf 1:1, absorbé 2026-06-29 depuis
// decomp-data/include/menu-data.ts). Littéraux SANS dép src/menu → item_menu/menu/
// menu_helpers peuvent les importer malgré le cycle src/menu↔consommateurs (avant :
// ils lisaient le leaf menu-data EXPRÈS, anti-cycle). 🚩 WART dedup différé (cf
// include/text.ts) : src/menu peut garder ses copies internes ; valeurs 1:1 menu.h.
/** 1:1 décomp `#define MENU_NOTHING_CHOSEN -2` (menu.h). */
export const MENU_NOTHING_CHOSEN = -2;
/** 1:1 décomp `#define MENU_B_PRESSED -1` (menu.h). */
export const MENU_B_PRESSED = -1;
/** 1:1 décomp `#define MENU_CURSOR_DELTA_*` (menu.h). */
export const MENU_CURSOR_DELTA_NONE = 0;
export const MENU_CURSOR_DELTA_UP = -1;
export const MENU_CURSOR_DELTA_DOWN = 1;
export const MENU_CURSOR_DELTA_LEFT = -1;
export const MENU_CURSOR_DELTA_RIGHT = 1;

// Fonctions menu.c (re-export depuis src/menu — APRÈS les littéraux pour l'ordre eval sûr).
export {
  GetPlayerTextSpeed, GetPlayerTextSpeedDelay, RunTextPrintersAndIsPrinter0Active,
} from '../src/menu';

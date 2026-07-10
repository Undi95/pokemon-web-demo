/**
 * include/window.ts — miroir 1:1 de `include/window.h` (constantes/types de header).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/include/window.h`.
 *
 * LEAF sans import (anti-cycle/TDZ, pattern lot 17a) : les données top-level de
 * modules pris dans un cycle ESM (ex. sStandardBattleWindowTemplates de
 * battle_bg.ts, dans le cycle window → decomp-globals → … → battle_bg → window)
 * doivent lire leurs constantes de header depuis un leaf toujours évalué en premier.
 *
 * Les FONCTIONS de window.c (InitWindows, AddWindow, …) restent dans `src/window.ts`,
 * qui re-exporte aussi ces symboles de header (compat importeurs existants).
 * Restent dans src/window.ts (rangement futur si besoin) : les enums d'attributs
 * WINDOW_BG..WINDOW_TILE_DATA (window.h:8-17), COPYWIN_* (window.h:20-25) et
 * WINDOW_NONE (window.h:43) — consts numériques historiquement hébergées là.
 */

/** 1:1 décomp window.h:6 `#define PIXEL_FILL(num) ((num) | ((num) << 4))` —
 *  octet de remplissage 4bpp (même index de palette nibble haut + bas). */
export function PIXEL_FILL(num: number): number { return (num | (num << 4)) & 0xFF; }

/** 1:1 décomp `struct WindowTemplate` (window.h:27-36). */
export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

/** 1:1 décomp window.h:38-41 `DUMMY_WIN_TEMPLATE` = `{ .bg = 0xFF }` (le reste = 0).
 *  Sentinelle de fin de tableau de templates : InitWindows arrête l'allocation
 *  au premier template avec `bg == 0xFF`. */
export const DUMMY_WIN_TEMPLATE: WindowTemplate = {
  bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0,
};

/**
 * field_screen_effect.ts — miroir 1:1 décomp `src/field_screen_effect.c` (1267 l, 77 fn).
 *
 * ⚠️ AMORCE : seule `sFlashLevelToRadius` est portée ici pour l'instant (le reste du fichier
 * = TODO restructure/complétion 1:1). D'autres fn de field_screen_effect.c vivent encore
 * dispersées (ex. quelques-unes dans `harness/runtime/decomp-globals.ts`) → à consolider ici.
 */

/** 1:1 décomp `sFlashLevelToRadius` (field_screen_effect.c:53) — rayon (px) du cercle de
 *  pénombre de grotte par niveau de flash (index 0 = pleine vue, 8 = noir total).
 *  `static const u16` dans la décomp ; exporté ici car la post-process flash du harness
 *  (adaptation compositeur, cf. `harness/gba/flash-mask.ts`) le lit. */
export const sFlashLevelToRadius: readonly number[] = [200, 72, 64, 56, 48, 40, 32, 24, 0];

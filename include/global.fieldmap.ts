/**
 * global.fieldmap.ts — miroir 1:1 décomp `include/global.fieldmap.h` (partiel).
 *
 * `enum Direction` (global.fieldmap.h:308). Rapatrié de
 * `engine/field/direction-coords.ts` (unification miroir) : dans le décomp ces
 * constantes vivent dans le HEADER, pas dans event_object_movement.c — leaf pur,
 * zéro import, aucun risque de cycle pour les consommateurs de constantes.
 */

// ─── enum Direction 1:1 décomp (global.fieldmap.h:308) ──────────────────────

export const DIR_NONE      = 0;
export const DIR_SOUTH     = 1;
export const DIR_NORTH     = 2;
export const DIR_WEST      = 3;
export const DIR_EAST      = 4;
export const DIR_SOUTHWEST = 5;
export const DIR_SOUTHEAST = 6;
export const DIR_NORTHWEST = 7;
export const DIR_NORTHEAST = 8;

/**
 * base_oam.ts — Port 1:1 STRICT décomp `base_oam.h`.
 *
 * Source unique de vérité (= ne JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/base_oam.h
 *
 * Les 8 templates `gObjectEventBaseOam_*` (struct OamData const). Le décomp les
 * référence via `graphicsInfo->oam` ; au CreateSprite `sprite->oam = *template->oam`
 * (= struct copy en C). Notre port doit faire pareil (= shallow copy, pas partager
 * la reference).
 *
 * `struct OamData` + ST_OAM_SQUARE/H_RECTANGLE/V_RECTANGLE = include/gba/types.ts
 * (= leur vrai foyer décomp include/gba/types.h).
 */

import { type OamData, ST_OAM_SQUARE, ST_OAM_H_RECTANGLE, ST_OAM_V_RECTANGLE } from '../../../include/gba/types';

/** Default values pour les fields non-initialisés explicitement dans base_oam.h.
 *  1:1 STRICT C aggregate init : tout field non-listé dans `{ .shape = ..., .size
 *  = ..., .priority = ... }` est zero-initialisé. */
const _BASE_DEFAULTS = {
  y: 0,
  affineMode: 0 as 0 | 1 | 2 | 3,    // ST_OAM_AFFINE_OFF
  objMode: 0 as 0 | 1 | 2,           // ST_OAM_OBJ_NORMAL
  mosaic: 0 as 0 | 1,
  bpp: 0 as 0 | 1,                   // ST_OAM_4BPP
  x: 0,
  matrixNum: 0,
  tileNum: 0,
  paletteNum: 0,
  affineParam: 0,
} as const;

/** 1:1 décomp `gObjectEventBaseOam_8x8` (base_oam.h:1-5). */
export const gObjectEventBaseOam_8x8: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(8x8) = 0
  size: 0,                 // SPRITE_SIZE(8x8) = 0
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x8` (base_oam.h:7-11). */
export const gObjectEventBaseOam_16x8: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(16x8) = 1
  size: 0,                    // SPRITE_SIZE(16x8) = 0
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x16` (base_oam.h:13-17). */
export const gObjectEventBaseOam_16x16: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(16x16) = 0
  size: 1,                 // SPRITE_SIZE(16x16) = 1
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_32x8` (base_oam.h:19-23). */
export const gObjectEventBaseOam_32x8: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(32x8) = 1
  size: 1,                    // SPRITE_SIZE(32x8) = 1
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_64x32` (base_oam.h:25-29). */
export const gObjectEventBaseOam_64x32: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(64x32) = 1
  size: 3,                    // SPRITE_SIZE(64x32) = 3
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x32` (base_oam.h:31-35).
 *  USED BY : MOM + plupart NPCs people 16x32 (= sprite walking 16×32). */
export const gObjectEventBaseOam_16x32: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_V_RECTANGLE,  // SPRITE_SHAPE(16x32) = 2
  size: 2,                    // SPRITE_SIZE(16x32) = 2
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_32x32` (base_oam.h:37-41).
 *  USED BY : Vigoroth carrying box, Latios, Latias, sprites Pokémon 32x32. */
export const gObjectEventBaseOam_32x32: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(32x32) = 0
  size: 2,                 // SPRITE_SIZE(32x32) = 2
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_64x64` (base_oam.h:43-47).
 *  USED BY : Truck (= 48x48 utilise subspriteTables, mais base sprite est
 *  parfois 64x64 OamData primary). */
export const gObjectEventBaseOam_64x64: Readonly<OamData> = Object.freeze({
  ..._BASE_DEFAULTS,
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(64x64) = 0
  size: 3,                 // SPRITE_SIZE(64x64) = 3
  priority: 2,
});

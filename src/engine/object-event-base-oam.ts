/**
 * object-event-base-oam.ts — Port 1:1 STRICT décomp `base_oam.h`.
 *
 * Source unique de vérité (= ne JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/base_oam.h
 *
 * Types portés 1:1 :
 *   struct OamData {
 *     u16 y, affineMode, objMode, mosaic, bpp, shape;
 *     u16 x, matrixNum, size;
 *     u16 tileNum, priority, paletteNum, affineParam;
 *   };
 *
 * Constants SPRITE_SHAPE / SPRITE_SIZE 1:1 décomp `include/gba/defines.h` :
 *   SPRITE_SHAPE(8x8|16x16|32x32|64x64) = 0 (ST_OAM_SQUARE)
 *   SPRITE_SHAPE(16x8|32x8|32x16|64x32) = 1 (ST_OAM_H_RECTANGLE)
 *   SPRITE_SHAPE(8x16|8x32|16x32|32x64) = 2 (ST_OAM_V_RECTANGLE)
 *   SPRITE_SIZE per shape/dims : 0|1|2|3 (= encoding GBA hardware).
 *
 * Le décomp utilise un graphicsInfo->oam = pointer vers une de ces structures.
 * Au CreateSprite, `sprite->oam = *template->oam` copie shape/size/priority dans
 * le sprite. Aucune branche hardcoded sur dimensions PNG (= ce que notre port
 * actuel fait dans _spawnSingleNpcFromTemplate, divergence 1:1 strict).
 */

/** 1:1 décomp `struct OamData` (include/gba/types.h) — fields utilisés par les
 *  graphicsInfo OAM templates. Le décomp utilise une struct complète mais
 *  les `base_oam.h` templates ne définissent que shape/size/priority (= autres
 *  fields = 0 par défaut, set au runtime via CreateSpriteAt).
 *
 *  Notre type local n'est PAS le full struct GBA — c'est juste le subset que
 *  les templates exposent. Le full OamData runtime est dans `gba/types.ts:OamEntry`. */
export interface OamTemplate {
  shape: 0 | 1 | 2;
  size: 0 | 1 | 2 | 3;
  priority: number;
  /** Optional : la plupart des base_oam templates laissent paletteNum=0 default. */
  paletteNum?: number;
}

// ─── Constants SPRITE_SHAPE / SPRITE_SIZE 1:1 décomp ───────────────────────

export const ST_OAM_SQUARE = 0;        // 1:1 décomp
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;

// Encoding GBA hardware : (shape, size) → pixel dimensions :
//   shape=SQUARE      : size 0=8x8,    1=16x16,  2=32x32,  3=64x64
//   shape=H_RECTANGLE : size 0=16x8,   1=32x8,   2=32x16,  3=64x32
//   shape=V_RECTANGLE : size 0=8x16,   1=8x32,   2=16x32,  3=32x64

// ─── Base OAM templates 1:1 décomp base_oam.h ──────────────────────────────
// Note : structures const, jamais mutées au runtime. Le décomp copie via
// `sprite->oam = *template->oam` (= struct copy en C). Notre port doit faire
// pareil (= shallow copy au lieu de partager la reference).

/** 1:1 décomp `gObjectEventBaseOam_8x8` (base_oam.h:1-5). */
export const gObjectEventBaseOam_8x8: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(8x8) = 0
  size: 0,                 // SPRITE_SIZE(8x8) = 0
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x8` (base_oam.h:7-11). */
export const gObjectEventBaseOam_16x8: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(16x8) = 1
  size: 0,                    // SPRITE_SIZE(16x8) = 0
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x16` (base_oam.h:13-17). */
export const gObjectEventBaseOam_16x16: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(16x16) = 0
  size: 1,                 // SPRITE_SIZE(16x16) = 1
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_32x8` (base_oam.h:19-23). */
export const gObjectEventBaseOam_32x8: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(32x8) = 1
  size: 1,                    // SPRITE_SIZE(32x8) = 1
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_64x32` (base_oam.h:25-29). */
export const gObjectEventBaseOam_64x32: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_H_RECTANGLE,  // SPRITE_SHAPE(64x32) = 1
  size: 3,                    // SPRITE_SIZE(64x32) = 3
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_16x32` (base_oam.h:31-35).
 *  USED BY : MOM + plupart NPCs people 16x32 (= sprite walking 16×32). */
export const gObjectEventBaseOam_16x32: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_V_RECTANGLE,  // SPRITE_SHAPE(16x32) = 2
  size: 2,                    // SPRITE_SIZE(16x32) = 2
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_32x32` (base_oam.h:37-41).
 *  USED BY : Vigoroth carrying box, Latios, Latias, sprites Pokémon 32x32. */
export const gObjectEventBaseOam_32x32: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(32x32) = 0
  size: 2,                 // SPRITE_SIZE(32x32) = 2
  priority: 2,
});

/** 1:1 décomp `gObjectEventBaseOam_64x64` (base_oam.h:43-47).
 *  USED BY : Truck (= 48x48 utilise subspriteTables, mais base sprite est
 *  parfois 64x64 OamData primary). */
export const gObjectEventBaseOam_64x64: Readonly<OamTemplate> = Object.freeze({
  shape: ST_OAM_SQUARE,    // SPRITE_SHAPE(64x64) = 0
  size: 3,                 // SPRITE_SIZE(64x64) = 3
  priority: 2,
});

// ─── Helper : lookup base oam par dimensions ───────────────────────────────

/** Mappe (frameWidth, frameHeight) → base OAM template 1:1 décomp.
 *  Le décomp ne fait PAS ce mapping (= chaque graphicsInfo référence son
 *  oam explicit). Notre port dérive depuis le catalog JSON qui ne contient
 *  pas le `oam` field — on infère via dimensions. C'est une déviation
 *  documentée mais fonctionnellement équivalente (= mêmes shape/size que
 *  les graphicsInfo décomp pour les NPCs standard). */
export function GetBaseOamForDimensions(frameWidth: number, frameHeight: number): Readonly<OamTemplate> {
  if (frameWidth === 8 && frameHeight === 8) return gObjectEventBaseOam_8x8;
  if (frameWidth === 16 && frameHeight === 8) return gObjectEventBaseOam_16x8;
  if (frameWidth === 16 && frameHeight === 16) return gObjectEventBaseOam_16x16;
  if (frameWidth === 32 && frameHeight === 8) return gObjectEventBaseOam_32x8;
  if (frameWidth === 64 && frameHeight === 32) return gObjectEventBaseOam_64x32;
  if (frameWidth === 16 && frameHeight === 32) return gObjectEventBaseOam_16x32;
  if (frameWidth === 32 && frameHeight === 32) return gObjectEventBaseOam_32x32;
  if (frameWidth === 64 && frameHeight === 64) return gObjectEventBaseOam_64x64;
  // Cas 48x48 (Truck) : utilise subspriteTables + primary sprite 16x32 hidden.
  // Le décomp utilise gObjectEventBaseOam_16x32 pour le primary (cf.
  // gObjectEventGraphicsInfo_Truck). Notre port fait pareil.
  if (frameWidth === 48 && frameHeight === 48) return gObjectEventBaseOam_16x32;
  return gObjectEventBaseOam_16x32;  // fallback
}

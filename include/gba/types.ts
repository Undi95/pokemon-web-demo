/**
 * types.ts — Port 1:1 STRICT décomp `include/gba/types.h` (sous-ensemble).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/include/gba/types.h.
 *
 * Pour l'instant : `struct OamData` (types.h:55-72) + les constantes de shape
 * ST_OAM_SQUARE/H_RECTANGLE/V_RECTANGLE (types.h:93-95). À étendre au fur et à
 * mesure (les autres types GBA arrivent quand leurs consommateurs sont portés).
 *
 * NB : `OamEntry` (harness/gba/types.ts) est une représentation HARDWARE packée
 * DISTINCTE (= buffer OAM live, 8 bytes bitfield). `OamData` ici = la struct
 * non-packée utilisée par les templates `base_oam.h` + `graphicsInfo->oam`.
 */

/** 1:1 STRICT décomp `struct OamData` (include/gba/types.h:55-72).
 *  Tous les fields encodés tels qu'ils existent dans le hardware GBA OAM
 *  (= 8 bytes par sprite, bitfield-packed). Les `base_oam.h` templates
 *  initialisent shape/size/priority + laissent les autres à 0 (= default
 *  C aggregate init).
 *
 *  Notre TS représente la struct comme un objet avec tous les fields explicites
 *  (= pas de bitfield-packing TS, l'engine GPU rendering désérialise depuis
 *  les valeurs JS). Field ranges 1:1 décomp via les bitfield widths :
 *    y:8       → 0..255
 *    affineMode:2 → 0..3
 *    objMode:2 → 0..3
 *    mosaic:1  → 0|1
 *    bpp:1     → 0|1
 *    shape:2   → 0|1|2 (3 réservé)
 *    x:9       → 0..511
 *    matrixNum:5 → 0..31 (ou flip bits hors affine)
 *    size:2    → 0..3
 *    tileNum:10 → 0..1023
 *    priority:2 → 0..3
 *    paletteNum:4 → 0..15
 *    affineParam:16 → 0..65535 */
export interface OamData {
  /*0x00*/ y: number;             // u32:8
  /*0x01*/ affineMode: 0 | 1 | 2 | 3;  // u32:2 — ST_OAM_AFFINE_OFF/NORMAL/HIDDEN/DOUBLE
           objMode: 0 | 1 | 2;          // u32:2 — ST_OAM_OBJ_NORMAL/BLEND/WINDOW
           mosaic: 0 | 1;               // u32:1
           bpp: 0 | 1;                  // u32:1 — ST_OAM_4BPP / ST_OAM_8BPP
           shape: 0 | 1 | 2;            // u32:2 — ST_OAM_SQUARE/H_RECTANGLE/V_RECTANGLE
  /*0x02*/ x: number;             // u32:9
           matrixNum: number;     // u32:5 (= bit 3-4 = h/v flip si !affineMode)
           size: 0 | 1 | 2 | 3;   // u32:2
  /*0x04*/ tileNum: number;       // u16:10
           priority: 0 | 1 | 2 | 3;  // u16:2
           paletteNum: number;    // u16:4 — 0..15
  /*0x06*/ affineParam: number;   // u16:16
}

// ─── Constants SPRITE_SHAPE / SPRITE_SIZE 1:1 décomp types.h:93-95 ──────────

export const ST_OAM_SQUARE = 0;        // 1:1 décomp
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;

// Encoding GBA hardware : (shape, size) → pixel dimensions :
//   shape=SQUARE      : size 0=8x8,    1=16x16,  2=32x32,  3=64x64
//   shape=H_RECTANGLE : size 0=16x8,   1=32x8,   2=32x16,  3=64x32
//   shape=V_RECTANGLE : size 0=8x16,   1=8x32,   2=16x32,  3=32x64

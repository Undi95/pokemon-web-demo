/**
 * object-event-subsprites-data.ts — Port 1:1 STRICT décomp.
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_subsprites.h (1530 lignes)
 *
 * Auto-port — tous les sOamTable_* + sOamTables_* groupes.
 *
 * SPRITE_SHAPE/SPRITE_SIZE résolus déterministiquement depuis le mapping
 * shape+pixel_size → indice OAM 2-bit (cf. gba/types.h GBATEK).
 *
 * Mapping SPRITE_SHAPE :
 *   - SQUARE     = 0 : 8x8, 16x16, 32x32, 64x64
 *   - H_RECTANGLE = 1 : 16x8, 32x8, 32x16, 64x32
 *   - V_RECTANGLE = 2 : 8x16, 8x32, 16x32, 32x64
 *
 * Mapping SPRITE_SIZE (par shape, indice 2-bit ST_OAM_SIZE_*) :
 *   - SQUARE     : 8x8=0, 16x16=1, 32x32=2, 64x64=3
 *   - H_RECTANGLE: 16x8=0, 32x8=1, 32x16=2, 64x32=3
 *   - V_RECTANGLE: 8x16=0, 8x32=1, 16x32=2, 32x64=3
 */

/** 1:1 décomp `struct Subsprite` (sprite.h:159-167). */
export interface Subsprite {
  readonly x: number;
  readonly y: number;
  readonly shape: 0 | 1 | 2;
  readonly size: 0 | 1 | 2 | 3;
  readonly tileOffset: number;
  readonly priority: 0 | 1 | 2 | 3;
}

/** 1:1 décomp `struct SubspriteTable` (sprite.h:169-173). */
export interface SubspriteTable {
  readonly subspriteCount: number;
  readonly subsprites: ReadonlyArray<Subsprite>;
}

// =============================================================================
// 16x16 family
// =============================================================================

/** 1:1 décomp `sOamTable_16x16_0` (object_event_subsprites.h:1-10). */
export const sOamTable_16x16_0: ReadonlyArray<Subsprite> = [
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_16x16_1` (object_event_subsprites.h:12-21). */
export const sOamTable_16x16_1: ReadonlyArray<Subsprite> = [
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 1 },
];

/** 1:1 décomp `sOamTable_16x16_2` (object_event_subsprites.h:23-40). */
export const sOamTable_16x16_2: ReadonlyArray<Subsprite> = [
  { x: -8, y: -8, shape: 1, size: 0, tileOffset: 0, priority: 2 },
  { x: -8, y:  0, shape: 1, size: 0, tileOffset: 2, priority: 3 },
];

/** 1:1 décomp `sOamTable_16x16_3` (object_event_subsprites.h:42-59). */
export const sOamTable_16x16_3: ReadonlyArray<Subsprite> = [
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 2 },
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 3 },
];

/** 1:1 décomp `sOamTable_16x16_4` (object_event_subsprites.h:61-78). */
export const sOamTable_16x16_4: ReadonlyArray<Subsprite> = [
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 1 },
  { x: -8, y: -8, shape: 0, size: 1, tileOffset: 0, priority: 3 },
];

/** 1:1 décomp `sOamTables_16x16` (object_event_subsprites.h:80-87). */
export const sOamTables_16x16: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp
  { subspriteCount: sOamTable_16x16_0.length, subsprites: sOamTable_16x16_0 },
  { subspriteCount: sOamTable_16x16_1.length, subsprites: sOamTable_16x16_1 },
  { subspriteCount: sOamTable_16x16_2.length, subsprites: sOamTable_16x16_2 },
  { subspriteCount: sOamTable_16x16_3.length, subsprites: sOamTable_16x16_3 },
  { subspriteCount: sOamTable_16x16_4.length, subsprites: sOamTable_16x16_4 },
];

// =============================================================================
// 16x32 family
// =============================================================================

/** 1:1 décomp `sOamTable_16x32_0` (object_event_subsprites.h:89-98). */
export const sOamTable_16x32_0: ReadonlyArray<Subsprite> = [
  { x: -8, y: -16, shape: 2, size: 2, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_16x32_1` (object_event_subsprites.h:100-109). */
export const sOamTable_16x32_1: ReadonlyArray<Subsprite> = [
  { x: -8, y: -16, shape: 2, size: 2, tileOffset: 0, priority: 1 },
];

/** 1:1 décomp `sOamTable_16x32_2` (object_event_subsprites.h:111-136). */
export const sOamTable_16x32_2: ReadonlyArray<Subsprite> = [
  { x: -8, y: -16, shape: 0, size: 1, tileOffset: 0, priority: 2 },
  { x: -8, y:   0, shape: 1, size: 0, tileOffset: 4, priority: 2 },
  { x: -8, y:   8, shape: 1, size: 0, tileOffset: 6, priority: 3 },
];

/** 1:1 décomp `sOamTable_16x32_3` (object_event_subsprites.h:138-155). */
export const sOamTable_16x32_3: ReadonlyArray<Subsprite> = [
  { x: -8, y: -16, shape: 0, size: 1, tileOffset: 0, priority: 2 },
  { x: -8, y:   0, shape: 0, size: 1, tileOffset: 4, priority: 3 },
];

/** 1:1 décomp `sOamTable_16x32_4` (object_event_subsprites.h:157-174). */
export const sOamTable_16x32_4: ReadonlyArray<Subsprite> = [
  { x: -8, y: -16, shape: 0, size: 1, tileOffset: 0, priority: 1 },
  { x: -8, y:   0, shape: 0, size: 1, tileOffset: 4, priority: 3 },
];

/** 1:1 décomp `sOamTables_16x32` (object_event_subsprites.h:176-183). */
export const sOamTables_16x32: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp
  { subspriteCount: sOamTable_16x32_0.length, subsprites: sOamTable_16x32_0 },
  { subspriteCount: sOamTable_16x32_1.length, subsprites: sOamTable_16x32_1 },
  { subspriteCount: sOamTable_16x32_2.length, subsprites: sOamTable_16x32_2 },
  { subspriteCount: sOamTable_16x32_3.length, subsprites: sOamTable_16x32_3 },
  { subspriteCount: sOamTable_16x32_4.length, subsprites: sOamTable_16x32_4 },
];

// =============================================================================
// 32x32 family
// =============================================================================

/** 1:1 décomp `sOamTable_32x32_0` (object_event_subsprites.h:185-194). */
export const sOamTable_32x32_0: ReadonlyArray<Subsprite> = [
  { x: -16, y: -16, shape: 0, size: 2, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_32x32_1` (object_event_subsprites.h:196-205). */
export const sOamTable_32x32_1: ReadonlyArray<Subsprite> = [
  { x: -16, y: -16, shape: 0, size: 2, tileOffset: 0, priority: 1 },
];

/** 1:1 décomp `sOamTable_32x32_2` (object_event_subsprites.h:207-232). */
export const sOamTable_32x32_2: ReadonlyArray<Subsprite> = [
  { x: -16, y: -16, shape: 1, size: 2, tileOffset:  0, priority: 2 },
  { x: -16, y:   0, shape: 1, size: 1, tileOffset:  8, priority: 2 },
  { x: -16, y:   8, shape: 1, size: 1, tileOffset: 12, priority: 3 },
];

/** 1:1 décomp `sOamTable_32x32_3` (object_event_subsprites.h:234-251). */
export const sOamTable_32x32_3: ReadonlyArray<Subsprite> = [
  { x: -16, y: -16, shape: 1, size: 2, tileOffset: 0, priority: 2 },
  { x: -16, y:   0, shape: 1, size: 2, tileOffset: 8, priority: 3 },
];

/** 1:1 décomp `sOamTable_32x32_4` (object_event_subsprites.h:253-270). */
export const sOamTable_32x32_4: ReadonlyArray<Subsprite> = [
  { x: -16, y: -16, shape: 1, size: 2, tileOffset: 0, priority: 1 },
  { x: -16, y:   0, shape: 1, size: 2, tileOffset: 8, priority: 3 },
];

/** 1:1 décomp `sOamTables_32x32` (object_event_subsprites.h:272-279). */
export const sOamTables_32x32: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp
  { subspriteCount: sOamTable_32x32_0.length, subsprites: sOamTable_32x32_0 },
  { subspriteCount: sOamTable_32x32_1.length, subsprites: sOamTable_32x32_1 },
  { subspriteCount: sOamTable_32x32_2.length, subsprites: sOamTable_32x32_2 },
  { subspriteCount: sOamTable_32x32_3.length, subsprites: sOamTable_32x32_3 },
  { subspriteCount: sOamTable_32x32_4.length, subsprites: sOamTable_32x32_4 },
];

// =============================================================================
// 48x48 family
// =============================================================================

/** 1:1 décomp `sOamTable_48x48` (object_event_subsprites.h:281-378). */
export const sOamTable_48x48: ReadonlyArray<Subsprite> = [
  { x: -24, y: -24, shape: 1, size: 1, tileOffset:  0, priority: 2 },
  { x:   8, y: -24, shape: 1, size: 0, tileOffset:  4, priority: 2 },
  { x: -24, y: -16, shape: 1, size: 1, tileOffset:  6, priority: 2 },
  { x:   8, y: -16, shape: 1, size: 0, tileOffset: 10, priority: 2 },
  { x: -24, y:  -8, shape: 1, size: 1, tileOffset: 12, priority: 2 },
  { x:   8, y:  -8, shape: 1, size: 0, tileOffset: 16, priority: 2 },
  { x: -24, y:   0, shape: 1, size: 1, tileOffset: 18, priority: 2 },
  { x:   8, y:   0, shape: 1, size: 0, tileOffset: 22, priority: 2 },
  { x: -24, y:   8, shape: 1, size: 1, tileOffset: 24, priority: 2 },
  { x:   8, y:   8, shape: 1, size: 0, tileOffset: 28, priority: 2 },
  { x: -24, y:  16, shape: 1, size: 1, tileOffset: 30, priority: 2 },
  { x:   8, y:  16, shape: 1, size: 0, tileOffset: 34, priority: 2 },
];

/** 1:1 décomp `sOamTables_48x48` (object_event_subsprites.h:380-387). */
export const sOamTables_48x48: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
  { subspriteCount: sOamTable_48x48.length, subsprites: sOamTable_48x48 },
];

// =============================================================================
// 64x32 family (Unused per décomp comment)
// =============================================================================

/** 1:1 décomp `sOamTable_64x32_0` (object_event_subsprites.h:389-398). */
export const sOamTable_64x32_0: ReadonlyArray<Subsprite> = [
  { x: -32, y: -16, shape: 1, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_64x32_1` (object_event_subsprites.h:400-409). */
export const sOamTable_64x32_1: ReadonlyArray<Subsprite> = [
  { x: -32, y: -16, shape: 1, size: 3, tileOffset: 0, priority: 1 },
];

/** 1:1 décomp `sOamTable_64x32_2` (object_event_subsprites.h:411-420). */
export const sOamTable_64x32_2: ReadonlyArray<Subsprite> = [
  { x: -32, y: -16, shape: 1, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_64x32_3` (object_event_subsprites.h:422-431). */
export const sOamTable_64x32_3: ReadonlyArray<Subsprite> = [
  { x: -32, y: -16, shape: 1, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTables_64x32` (object_event_subsprites.h:433-441). Unused. */
export const sOamTables_64x32: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp
  { subspriteCount: sOamTable_64x32_0.length, subsprites: sOamTable_64x32_0 },
  { subspriteCount: sOamTable_64x32_1.length, subsprites: sOamTable_64x32_1 },
  { subspriteCount: sOamTable_64x32_2.length, subsprites: sOamTable_64x32_2 },
  { subspriteCount: sOamTable_64x32_3.length, subsprites: sOamTable_64x32_3 },
  { subspriteCount: sOamTable_64x32_3.length, subsprites: sOamTable_64x32_3 },
];

// =============================================================================
// 64x64 family
// =============================================================================

/** 1:1 décomp `sOamTable_64x64_0` (object_event_subsprites.h:443-452). */
export const sOamTable_64x64_0: ReadonlyArray<Subsprite> = [
  { x: -32, y: -32, shape: 0, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_64x64_1` (object_event_subsprites.h:454-463). */
export const sOamTable_64x64_1: ReadonlyArray<Subsprite> = [
  { x: -32, y: -32, shape: 0, size: 3, tileOffset: 0, priority: 1 },
];

/** 1:1 décomp `sOamTable_64x64_2` (object_event_subsprites.h:465-474). */
export const sOamTable_64x64_2: ReadonlyArray<Subsprite> = [
  { x: -32, y: -32, shape: 0, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTable_64x64_3` (object_event_subsprites.h:476-485). */
export const sOamTable_64x64_3: ReadonlyArray<Subsprite> = [
  { x: -32, y: -32, shape: 0, size: 3, tileOffset: 0, priority: 2 },
];

/** 1:1 décomp `sOamTables_64x64` (object_event_subsprites.h:487-494). */
export const sOamTables_64x64: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp
  { subspriteCount: sOamTable_64x64_0.length, subsprites: sOamTable_64x64_0 },
  { subspriteCount: sOamTable_64x64_1.length, subsprites: sOamTable_64x64_1 },
  { subspriteCount: sOamTable_64x64_2.length, subsprites: sOamTable_64x64_2 },
  { subspriteCount: sOamTable_64x64_3.length, subsprites: sOamTable_64x64_3 },
  { subspriteCount: sOamTable_64x64_3.length, subsprites: sOamTable_64x64_3 },
];

// =============================================================================
// 96x40 family (Used by SS Tidal)
// =============================================================================

/** 1:1 décomp `sOamTable_96x40_0` (object_event_subsprites.h:496-617). */
export const sOamTable_96x40_0: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 2 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 2 },
  { x:  16, y: -20, shape: 1, size: 1, tileOffset:  8, priority: 2 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 12, priority: 2 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 16, priority: 2 },
  { x:  16, y: -12, shape: 1, size: 1, tileOffset: 20, priority: 2 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 24, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 28, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 1, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 36, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 40, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 1, tileOffset: 44, priority: 2 },
  { x: -48, y:  12, shape: 1, size: 1, tileOffset: 48, priority: 2 },
  { x: -16, y:  12, shape: 1, size: 1, tileOffset: 52, priority: 2 },
  { x:  16, y:  12, shape: 1, size: 1, tileOffset: 56, priority: 2 },
];

/** 1:1 décomp `sOamTable_96x40_1` (object_event_subsprites.h:619-740). */
export const sOamTable_96x40_1: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 1 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 1 },
  { x:  16, y: -20, shape: 1, size: 1, tileOffset:  8, priority: 1 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 12, priority: 1 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 16, priority: 1 },
  { x:  16, y: -12, shape: 1, size: 1, tileOffset: 20, priority: 1 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 24, priority: 1 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 28, priority: 1 },
  { x:  16, y:  -4, shape: 1, size: 1, tileOffset: 32, priority: 1 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 36, priority: 1 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 40, priority: 1 },
  { x:  16, y:   4, shape: 1, size: 1, tileOffset: 44, priority: 1 },
  { x: -48, y:  12, shape: 1, size: 1, tileOffset: 48, priority: 1 },
  { x: -16, y:  12, shape: 1, size: 1, tileOffset: 52, priority: 1 },
  { x:  16, y:  12, shape: 1, size: 1, tileOffset: 56, priority: 1 },
];

/** 1:1 décomp `sOamTable_96x40_2` (object_event_subsprites.h:742-863). */
export const sOamTable_96x40_2: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 2 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 2 },
  { x:  16, y: -20, shape: 1, size: 1, tileOffset:  8, priority: 2 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 12, priority: 2 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 16, priority: 2 },
  { x:  16, y: -12, shape: 1, size: 1, tileOffset: 20, priority: 2 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 24, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 28, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 1, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 36, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 40, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 1, tileOffset: 44, priority: 2 },
  { x: -48, y:  12, shape: 1, size: 1, tileOffset: 48, priority: 2 },
  { x: -16, y:  12, shape: 1, size: 1, tileOffset: 52, priority: 2 },
  { x:  16, y:  12, shape: 1, size: 1, tileOffset: 56, priority: 2 },
];

/** 1:1 décomp `sOamTable_96x40_3` (object_event_subsprites.h:865-986). */
export const sOamTable_96x40_3: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 1 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 1 },
  { x:  16, y: -20, shape: 1, size: 1, tileOffset:  8, priority: 1 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 12, priority: 1 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 16, priority: 1 },
  { x:  16, y: -12, shape: 1, size: 1, tileOffset: 20, priority: 1 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 24, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 28, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 1, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 36, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 40, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 1, tileOffset: 44, priority: 2 },
  { x: -48, y:  12, shape: 1, size: 1, tileOffset: 48, priority: 2 },
  { x: -16, y:  12, shape: 1, size: 1, tileOffset: 52, priority: 2 },
  { x:  16, y:  12, shape: 1, size: 1, tileOffset: 56, priority: 2 },
];

/** 1:1 décomp `sOamTables_96x40` (object_event_subsprites.h:988-996). Used by SS Tidal. */
export const sOamTables_96x40: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: sOamTable_96x40_0.length, subsprites: sOamTable_96x40_0 },
  { subspriteCount: sOamTable_96x40_0.length, subsprites: sOamTable_96x40_0 },
  { subspriteCount: sOamTable_96x40_1.length, subsprites: sOamTable_96x40_1 },
  { subspriteCount: sOamTable_96x40_2.length, subsprites: sOamTable_96x40_2 },
  { subspriteCount: sOamTable_96x40_3.length, subsprites: sOamTable_96x40_3 },
  { subspriteCount: sOamTable_96x40_3.length, subsprites: sOamTable_96x40_3 },
];

// =============================================================================
// 88x32 family (Used by Submarine Shadow)
// =============================================================================

/** 1:1 décomp `sOamTable_88x32_0` (object_event_subsprites.h:998-1127). */
export const sOamTable_88x32_0: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 2 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 2 },
  { x:  16, y: -20, shape: 1, size: 0, tileOffset:  8, priority: 2 },
  { x:  32, y: -20, shape: 0, size: 0, tileOffset: 10, priority: 2 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 11, priority: 2 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 15, priority: 2 },
  { x:  16, y: -12, shape: 1, size: 0, tileOffset: 19, priority: 2 },
  { x:  32, y: -12, shape: 0, size: 0, tileOffset: 21, priority: 2 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 22, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 26, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 0, tileOffset: 30, priority: 2 },
  { x:  32, y:  -4, shape: 0, size: 0, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 33, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 37, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 0, tileOffset: 41, priority: 2 },
  { x:  32, y:   4, shape: 0, size: 0, tileOffset: 43, priority: 2 },
];

/** 1:1 décomp `sOamTable_88x32_1` (object_event_subsprites.h:1129-1258). */
export const sOamTable_88x32_1: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 1 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 1 },
  { x:  16, y: -20, shape: 1, size: 0, tileOffset:  8, priority: 1 },
  { x:  32, y: -20, shape: 0, size: 0, tileOffset: 10, priority: 1 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 11, priority: 1 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 15, priority: 1 },
  { x:  16, y: -12, shape: 1, size: 0, tileOffset: 19, priority: 1 },
  { x:  32, y: -12, shape: 0, size: 0, tileOffset: 21, priority: 1 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 22, priority: 1 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 26, priority: 1 },
  { x:  16, y:  -4, shape: 1, size: 0, tileOffset: 30, priority: 1 },
  { x:  32, y:  -4, shape: 0, size: 0, tileOffset: 32, priority: 1 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 33, priority: 1 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 37, priority: 1 },
  { x:  16, y:   4, shape: 1, size: 0, tileOffset: 41, priority: 1 },
  { x:  32, y:   4, shape: 0, size: 0, tileOffset: 43, priority: 1 },
];

/** 1:1 décomp `sOamTable_88x32_2` (object_event_subsprites.h:1260-1389). */
export const sOamTable_88x32_2: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 2 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 2 },
  { x:  16, y: -20, shape: 1, size: 0, tileOffset:  8, priority: 2 },
  { x:  32, y: -20, shape: 0, size: 0, tileOffset: 10, priority: 2 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 11, priority: 2 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 15, priority: 2 },
  { x:  16, y: -12, shape: 1, size: 0, tileOffset: 19, priority: 2 },
  { x:  32, y: -12, shape: 0, size: 0, tileOffset: 21, priority: 2 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 22, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 26, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 0, tileOffset: 30, priority: 2 },
  { x:  32, y:  -4, shape: 0, size: 0, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 33, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 37, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 0, tileOffset: 41, priority: 2 },
  { x:  32, y:   4, shape: 0, size: 0, tileOffset: 43, priority: 2 },
];

/** 1:1 décomp `sOamTable_88x32_3` (object_event_subsprites.h:1391-1520). */
export const sOamTable_88x32_3: ReadonlyArray<Subsprite> = [
  { x: -48, y: -20, shape: 1, size: 1, tileOffset:  0, priority: 1 },
  { x: -16, y: -20, shape: 1, size: 1, tileOffset:  4, priority: 1 },
  { x:  16, y: -20, shape: 1, size: 0, tileOffset:  8, priority: 1 },
  { x:  32, y: -20, shape: 0, size: 0, tileOffset: 10, priority: 1 },
  { x: -48, y: -12, shape: 1, size: 1, tileOffset: 11, priority: 1 },
  { x: -16, y: -12, shape: 1, size: 1, tileOffset: 15, priority: 1 },
  { x:  16, y: -12, shape: 1, size: 0, tileOffset: 19, priority: 1 },
  { x:  32, y: -12, shape: 0, size: 0, tileOffset: 21, priority: 1 },
  { x: -48, y:  -4, shape: 1, size: 1, tileOffset: 22, priority: 2 },
  { x: -16, y:  -4, shape: 1, size: 1, tileOffset: 26, priority: 2 },
  { x:  16, y:  -4, shape: 1, size: 0, tileOffset: 30, priority: 2 },
  { x:  32, y:  -4, shape: 0, size: 0, tileOffset: 32, priority: 2 },
  { x: -48, y:   4, shape: 1, size: 1, tileOffset: 33, priority: 2 },
  { x: -16, y:   4, shape: 1, size: 1, tileOffset: 37, priority: 2 },
  { x:  16, y:   4, shape: 1, size: 0, tileOffset: 41, priority: 2 },
  { x:  32, y:   4, shape: 0, size: 0, tileOffset: 43, priority: 2 },
];

/** 1:1 décomp `sOamTables_88x32` (object_event_subsprites.h:1522-1530). Used by Submarine Shadow. */
export const sOamTables_88x32: ReadonlyArray<SubspriteTable> = [
  { subspriteCount: sOamTable_88x32_0.length, subsprites: sOamTable_88x32_0 },
  { subspriteCount: sOamTable_88x32_0.length, subsprites: sOamTable_88x32_0 },
  { subspriteCount: sOamTable_88x32_1.length, subsprites: sOamTable_88x32_1 },
  { subspriteCount: sOamTable_88x32_2.length, subsprites: sOamTable_88x32_2 },
  { subspriteCount: sOamTable_88x32_3.length, subsprites: sOamTable_88x32_3 },
  { subspriteCount: sOamTable_88x32_3.length, subsprites: sOamTable_88x32_3 },
];

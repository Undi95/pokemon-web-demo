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

// ─── struct ObjectEventGraphicsInfo (1:1 global.fieldmap.h:257-275) ──────────
// Rapatrié de engine/field/object-event-graphics-info.ts (unification lot 17a).

import type { OamData } from './gba/types';
import type { SpriteFrameImage } from './sprite';

/** 1:1 décomp `struct ObjectEventGraphicsInfo` (global.fieldmap.h:257-275).
 *  Une instance par graphicsId (les ~245 records de
 *  src/data/object_events/object_event_graphics_info.ts). Référencée via
 *  `gObjectEventGraphicsInfoPointers[graphicsId]`, lookup
 *  `GetObjectEventGraphicsInfo(graphicsId)` (event_object_movement.ts). */
export interface ObjectEventGraphicsInfo {
  /*0x00*/ tileTag: number;            // u16, généralement TAG_NONE (= 0xFFFF)
  /*0x02*/ paletteTag: number;         // u16, OBJ_EVENT_PAL_TAG_*
  /*0x04*/ reflectionPaletteTag: number;  // u16
  /*0x06*/ size: number;               // u16 — bytes par frame (= overworld_frame size)
  /*0x08*/ width: number;              // s16 — pixels (16, 32, 48, 64)
  /*0x0A*/ height: number;             // s16 — pixels
  /*0x0C*/ paletteSlot: number;        // u8:4 — 0..15, PALSLOT_*
           shadowSize: number;         // u8:2 — 0..3, SHADOW_SIZE_*
           inanimate: 0 | 1;           // u8:1
           disableReflectionPaletteLoad: 0 | 1;  // u8:1
  /*0x0D*/ tracks: number;             // u8 — TRACKS_*
  /*0x10*/ oam: OamData;               // struct OamData *
  /*0x14*/ subspriteTables: unknown[] | null;   // struct SubspriteTable *
  /*0x18*/ anims: unknown[] | null;             // union AnimCmd *const *
  /*0x1C*/ images: SpriteFrameImage[];          // struct SpriteFrameImage *
  /*0x20*/ affineAnims: unknown[] | null;       // union AffineAnimCmd *const *
}

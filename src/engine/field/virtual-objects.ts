/**
 * virtual-objects.ts — 1:1 décomp `src/event_object_movement.c:CreateVirtualObject`
 * + `TurnVirtualObject`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c:CreateVirtualObject`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/event_object_movement.h:VOBJ_ID_*`
 *
 * Concept :
 *   Virtual objects = sprites décoratifs non-interactifs. Utilisés dans :
 *   - Cutscenes (= May running in Birch lab, Twin NPCs dancing)
 *   - Animated decorations (= Pokémon waving from a window)
 *   - Birch field intro sprites
 *
 *   API :
 *     - createvobject GFX_ID, VOBJ_ID, x, y, elevation, direction
 *     - turnvobject VOBJ_ID, direction
 *
 *   Décomp : utilise `gObjectEventGraphicsInfoPointers[]` (= même gfx info que
 *   NPCs) + alloue OAM via `sVirtualObjectSpriteTemplate`. SpriteCB met à jour
 *   x/y selon gSpriteCoordOffsetX/Y (camera).
 *
 *   Notre port : utilise `CreateObjectGraphicsSprite` (= déjà gère gfx load).
 *   Map tile coords convertis en screen coords via offset standard. Sprites
 *   ne sont pas auto-camera-tracked (= simplification, suffit pour cutscenes
 *   stationnaires comme dance/wave).
 */

import { CreateObjectGraphicsSprite, loadObjectEventGraphicsInfo } from './object-event-graphics';
import { getRuntime } from '../../../harness/runtime/decomp-globals';
import { DestroySprite } from '../../sprite';
import { gFieldCamera } from '../../field_camera';

// ─── Directions → anim index (1:1 décomp sAnimTable_Standard) ───────────────
// Migré vers imports decomp-data global-data.ts (cleanup B7).
import { DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from '../decomp-data/include/constants/global-data';

/** 1:1 décomp `sFaceDirectionAnimNums` (event_object_movement.c). */
function _directionToAnimIdx(direction: number): number {
  // ANIM_STD_FACE_SOUTH = 0, NORTH = 1, WEST = 2, EAST = 3.
  switch (direction) {
    case DIR_SOUTH: return 0;
    case DIR_NORTH: return 1;
    case DIR_WEST: return 2;
    case DIR_EAST: return 3;
    default: return 0;
  }
}

// ─── Virtual object state ────────────────────────────────────────────────────

interface VirtualObject {
  spriteId: number;
  graphicsId: number;
  mapX: number;
  mapY: number;
  elevation: number;
  direction: number;
}

const _gVirtualObjects: Map<number, VirtualObject> = new Map();

const TILE_SIZE = 16;

/** Convert map tile coords → screen pixel coords using current camera offset.
 *  1:1 décomp `gSpriteCoordOffsetX/Y` = camera tile offset in pixels. */
function _mapToScreenX(mapX: number): number {
  return (mapX - gFieldCamera.x) * TILE_SIZE + TILE_SIZE / 2;
}

function _mapToScreenY(mapY: number): number {
  return (mapY - gFieldCamera.y) * TILE_SIZE + TILE_SIZE / 2;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** 1:1 décomp `CreateVirtualObject` (event_object_movement.c) :
 *    spriteId = CreateSprite(template, x, y, 0) ;
 *    sprite->subspriteTableNum = elevation < 16 ? elevation : 0 ;
 *    StartSpriteAnim(sprite, sFacingDirection[direction]) ;
 *    sVirtualObjectIds[virtualObjId] = spriteId ;
 *  Async wrapper qui gère le load gfx si pas déjà loaded. */
export async function CreateVirtualObject(
  graphicsId: number,
  virtualObjId: number,
  mapX: number,
  mapY: number,
  elevation: number,
  direction: number,
): Promise<number> {
  const rt = getRuntime();
  if (!rt) return -1;
  // Cleanup existing vobj at this id (= 1:1 décomp behavior, ré-create override).
  RemoveVirtualObject(virtualObjId);
  // Load gfx async si pas déjà loaded.
  await loadObjectEventGraphicsInfo(rt, graphicsId);
  const screenX = _mapToScreenX(mapX);
  const screenY = _mapToScreenY(mapY);
  const animIdx = _directionToAnimIdx(direction);
  const spriteId = CreateObjectGraphicsSprite(
    graphicsId, null, screenX, screenY,
    2 /* subPriority middle */, animIdx,
  );
  if (spriteId < 0) return -1;
  _gVirtualObjects.set(virtualObjId, {
    spriteId, graphicsId, mapX, mapY, elevation, direction,
  });
  // Expose pour debug
  (globalThis as Record<string, unknown>).gVirtualObjects = _gVirtualObjects;
  return spriteId;
}

/** 1:1 décomp `TurnVirtualObject(virtualObjId, direction)` :
 *    spriteId = sVirtualObjectIds[virtualObjId] ;
 *    StartSpriteAnim(&gSprites[spriteId], sFacingDirection[direction]) ;
 */
export function TurnVirtualObject(virtualObjId: number, direction: number): void {
  const vobj = _gVirtualObjects.get(virtualObjId);
  if (!vobj) return;
  vobj.direction = direction;
  const rt = getRuntime();
  if (!rt) return;
  const animIdx = _directionToAnimIdx(direction);
  // 1:1 décomp StartSpriteAnim : update sprite anim state.
  rt.StartSpriteAnim?.(vobj.spriteId, animIdx);
}

/** Remove a virtual object (= cleanup le sprite). Appelé au map switch ou par
 *  `removeobject` opcode si vobj id matché. */
export function RemoveVirtualObject(virtualObjId: number): void {
  const vobj = _gVirtualObjects.get(virtualObjId);
  if (!vobj) return;
  const rt = getRuntime();
  if (rt && vobj.spriteId >= 0) {
    DestroySprite(rt, vobj.spriteId);
  }
  _gVirtualObjects.delete(virtualObjId);
}

/** Clear tous les vobjs. Appelé au map switch. */
export function ClearAllVirtualObjects(): void {
  for (const [id] of _gVirtualObjects) {
    RemoveVirtualObject(id);
  }
}

// Auto-register sur globalThis pour script-opcodes.
(globalThis as { __virtualObjects?: Record<string, unknown> }).__virtualObjects = {
  CreateVirtualObject, TurnVirtualObject, RemoveVirtualObject, ClearAllVirtualObjects,
};

/**
 * field-globals.ts — Foundation pour échanges TYPE-SAFE entre player-avatar
 * ↔ object-events sans circular import via `globalThis.__X`.
 *
 * Avant : player-avatar.ts faisait
 *   `(globalThis as any).__gObjectEvents` pour collision check
 *   `(globalThis as any).__updateNpcSpriteFrame` pour interact face
 *   `(globalThis as any).__UnfreezeAllNpcs` pour walk-resume
 *
 * Le pattern globalThis.__X :
 *   - n'est pas type-safe (= cast `any`)
 *   - peut être undefined si l'ordre d'init est wrong
 *   - rend le refactor risqué (= TS ne signale pas une rename)
 *
 * Cette foundation expose les références à travers une `getter` registry qui
 * est setup une fois par object-events.ts au load. player-avatar.ts (et autres
 * consumers) lookup via les helpers exportés ici.
 *
 * Avantages :
 *   - Type-safe : signatures claires
 *   - Détection au compile-time si non-set au runtime
 *   - Découplage maintenu (= pas de circular import)
 */

import type { ObjectEvent } from '../../game/event_object_movement';

// ─── Internal registry ─────────────────────────────────────────────────────

interface FieldGlobals {
  /** Référence vers gObjectEvents[] depuis object-events.ts */
  gObjectEvents: ReadonlyArray<ObjectEvent>;
  /** Force update sprite frame d'un NPC (= pour interact face-toward-player). */
  updateNpcSpriteFrame: ((rt: unknown, npc: ObjectEvent) => void) | null;
  /** Un-freeze tous les NPCs (= player walk away from interact). */
  unfreezeAllNpcs: (() => void) | null;
  /** 1:1 décomp `UpdateObjectEventsForCameraUpdate(s16, s16)` (event_object_movement.c:2217).
   *  Orchestrator appelé par CameraUpdate au tile boundary. Rt passé pour
   *  TrySpawn + RemoveOutsideView qui ont besoin du runtime. */
  updateObjectEventsForCameraUpdate: ((rt: unknown, deltaX: number, deltaY: number) => void) | null;
  /** 1:1 décomp `AddCameraObject(u8 followSpriteId)` (event_object_movement.c:2227).
   *  Crée le sprite caméra invisible qui suit `followSpriteId`. Appelé par
   *  `InitCameraUpdateCallback` (field-camera.ts) → bridge anti-cycle. */
  addCameraObject: ((followSpriteId: number) => number) | null;
  /** 1:1 décomp `CameraObjectReset(void)` (event_object_movement.c:2286). */
  cameraObjectReset: (() => void) | null;
}

const _registry: FieldGlobals = {
  gObjectEvents: [],
  updateNpcSpriteFrame: null,
  unfreezeAllNpcs: null,
  updateObjectEventsForCameraUpdate: null,
  addCameraObject: null,
  cameraObjectReset: null,
};

// ─── Setup (= called by object-events.ts module init) ──────────────────────

/** Register le gObjectEvents array. À call par object-events.ts au module-level. */
export function _registerGObjectEvents(arr: ReadonlyArray<ObjectEvent>): void {
  _registry.gObjectEvents = arr;
}

/** Register les NPC sprite/freeze helpers. À call par object-events.ts. */
export function _registerNpcHelpers(
  updateNpcSpriteFrame: (rt: unknown, npc: ObjectEvent) => void,
  unfreezeAllNpcs: () => void,
): void {
  _registry.updateNpcSpriteFrame = updateNpcSpriteFrame;
  _registry.unfreezeAllNpcs = unfreezeAllNpcs;
}

// ─── Public accessors ──────────────────────────────────────────────────────

/** Get le gObjectEvents array (= read-only).
 *  Utilisé par player-avatar collision check + warp-system + scripts. */
export function getGObjectEvents(): ReadonlyArray<ObjectEvent> {
  return _registry.gObjectEvents;
}

/** Force update sprite frame d'un NPC (= scripts opcodes + interact). */
export function callUpdateNpcSpriteFrame(rt: unknown, npc: ObjectEvent): void {
  _registry.updateNpcSpriteFrame?.(rt, npc);
}

/** Un-freeze tous les NPCs (= release/releaseall opcodes). */
export function callUnfreezeAllNpcs(): void {
  _registry.unfreezeAllNpcs?.();
}

/** Register UpdateObjectEventsForCameraUpdate orchestrator. À call par
 *  object-events.ts au module-level. */
export function _registerUpdateObjectEventsForCameraUpdate(
  fn: (rt: unknown, deltaX: number, deltaY: number) => void,
): void {
  _registry.updateObjectEventsForCameraUpdate = fn;
}

/** Call orchestrator depuis CameraUpdate (field-camera.ts) au tile boundary.
 *  No-op si pas registered yet (= boot). */
export function callUpdateObjectEventsForCameraUpdate(rt: unknown, deltaX: number, deltaY: number): void {
  _registry.updateObjectEventsForCameraUpdate?.(rt, deltaX, deltaY);
}

/** Register les helpers CameraObject (AddCameraObject + CameraObjectReset).
 *  À call par object-events.ts au module-level. */
export function _registerCameraObjectHelpers(
  addCameraObject: (followSpriteId: number) => number,
  cameraObjectReset: () => void,
): void {
  _registry.addCameraObject = addCameraObject;
  _registry.cameraObjectReset = cameraObjectReset;
}

/** Call `AddCameraObject(followSpriteId)` depuis field-camera.ts (InitCameraUpdateCallback).
 *  Retourne MAX_SPRITES(64) si pas registered (= boot) ou échec création. */
export function callAddCameraObject(followSpriteId: number): number {
  return _registry.addCameraObject?.(followSpriteId) ?? 64;
}

/** Call `CameraObjectReset()` depuis l'overworld (spawn player). No-op si pas registered. */
export function callCameraObjectReset(): void {
  _registry.cameraObjectReset?.();
}

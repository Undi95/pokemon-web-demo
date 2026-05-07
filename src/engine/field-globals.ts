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

import type { ObjectEvent } from './object-events';

// ─── Internal registry ─────────────────────────────────────────────────────

interface FieldGlobals {
  /** Référence vers gObjectEvents[] depuis object-events.ts */
  gObjectEvents: ReadonlyArray<ObjectEvent>;
  /** Force update sprite frame d'un NPC (= pour interact face-toward-player). */
  updateNpcSpriteFrame: ((rt: unknown, npc: ObjectEvent) => void) | null;
  /** Un-freeze tous les NPCs (= player walk away from interact). */
  unfreezeAllNpcs: (() => void) | null;
}

const _registry: FieldGlobals = {
  gObjectEvents: [],
  updateNpcSpriteFrame: null,
  unfreezeAllNpcs: null,
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

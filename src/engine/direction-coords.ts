/**
 * direction-coords.ts — Foundation 1:1 décomp `event_object_movement.c`.
 *
 * Source unique pour les directions overworld + leurs vecteurs (dx/dy) +
 * inverses + helpers `MoveCoords`. Avant cet unification, ces tables étaient
 * dupliquées dans player-avatar.ts, object-events.ts, script-opcodes.ts —
 * risque de divergence lors d'updates futurs.
 *
 * Source de vérité décomp :
 *   - `event_object_movement.c:907` `sDirectionToVectors[]`
 *   - `include/global.fieldmap.h` `enum Direction`
 *   - `event_object_movement.c:GetOppositeDirection`
 */

// ─── Direction enum 1:1 décomp `enum Direction` (global.fieldmap.h:308) ────

export const DIR_NONE      = 0;
export const DIR_SOUTH     = 1;
export const DIR_NORTH     = 2;
export const DIR_WEST      = 3;
export const DIR_EAST      = 4;
export const DIR_SOUTHWEST = 5;
export const DIR_SOUTHEAST = 6;
export const DIR_NORTHWEST = 7;
export const DIR_NORTHEAST = 8;

// ─── Direction → vecteur (dx, dy) — 1:1 décomp `sDirectionToVectors` ────────

/** dx par direction. 1:1 décomp `sDirectionToVectors[N].x` (event_object_movement.c:907). */
export const DIR_TO_DX: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  0,
  /* DIR_NORTH     */  0,
  /* DIR_WEST      */ -1,
  /* DIR_EAST      */  1,
  /* DIR_SOUTHWEST */ -1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */  1,
];

/** dy par direction. 1:1 décomp `sDirectionToVectors[N].y` (event_object_movement.c:907). */
export const DIR_TO_DY: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  1,
  /* DIR_NORTH     */ -1,
  /* DIR_WEST      */  0,
  /* DIR_EAST      */  0,
  /* DIR_SOUTHWEST */  1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */ -1,
];

// ─── Direction opposée — 1:1 décomp `GetOppositeDirection` ─────────────────

/** Direction opposée. 1:1 décomp `GetOppositeDirection` :
 *    SOUTH ↔ NORTH, WEST ↔ EAST. Diagonales : flip both axes.
 *  Utilisé par object-events (= NPC turn 180° via `OPPOSITE_DIR[npc.facing]`)
 *  et script-opcodes (= turnobject opcode). */
export const OPPOSITE_DIR: readonly number[] = [
  /* DIR_NONE      */ DIR_NONE,
  /* DIR_SOUTH     */ DIR_NORTH,
  /* DIR_NORTH     */ DIR_SOUTH,
  /* DIR_WEST      */ DIR_EAST,
  /* DIR_EAST      */ DIR_WEST,
  /* DIR_SOUTHWEST */ DIR_NORTHEAST,
  /* DIR_SOUTHEAST */ DIR_NORTHWEST,
  /* DIR_NORTHWEST */ DIR_SOUTHEAST,
  /* DIR_NORTHEAST */ DIR_SOUTHWEST,
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** 1:1 décomp `MoveCoords(direction, x, y)` (event_object_movement.c).
 *  Modifie x, y selon la direction donnée. */
export function MoveCoords(direction: number, x: number, y: number): { x: number; y: number } {
  return {
    x: x + (DIR_TO_DX[direction] ?? 0),
    y: y + (DIR_TO_DY[direction] ?? 0),
  };
}

/** Camera speed delta vector pour une direction donnée (1 px/frame movement).
 *  Player walks vers la direction donnée → camera scrolle dans la même direction.
 *  Utilisé par player-avatar.PlayerStep + ExitTask walks. */
export function dirToCameraSpeed(direction: number): { x: number; y: number } {
  return {
    x: DIR_TO_DX[direction] ?? 0,
    y: DIR_TO_DY[direction] ?? 0,
  };
}

/** Convertit GBA keys → direction (priority order : down/up/left/right comme décomp).
 *  GBA keys : DOWN=0x80, UP=0x40, LEFT=0x20, RIGHT=0x10.
 *  1:1 décomp `GetPlayerMovementDirection` priority order. */
export function getInputDirection(heldKeys: number): number {
  if (heldKeys & 0x80) return DIR_SOUTH;
  if (heldKeys & 0x40) return DIR_NORTH;
  if (heldKeys & 0x20) return DIR_WEST;
  if (heldKeys & 0x10) return DIR_EAST;
  return DIR_NONE;
}

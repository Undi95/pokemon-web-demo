/**
 * movement-system.ts — applymovement + waitmovement runtime 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (= MovementAction_X_Step0/1, NpcTakeStep, sStepXFuncs tables)
 *   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/movement.inc`
 *     (= mapping movement_action_string → MOVEMENT_ACTION_X)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/event_object_movement.h`
 *     (= MOVEMENT_ACTION_X enum values)
 *
 * Concept :
 *   Quand un script appelle `applymovement LOCALID_X, MovementLabel`, on enqueue
 *   les actions du movement (= array de strings comme 'jump_right', 'walk_down',
 *   'delay_16') sur l'ObjectEvent ciblé. Le tick per-frame avance la state
 *   machine : pour chaque ObjectEvent avec une queue, on tick l'action courante,
 *   et quand done on pop + start la suivante.
 *
 *   `waitmovement 0` (= 0 = "wait all") bloque le script jusqu'à ce que TOUTES
 *   les queues actives soient vides. Le tick script-runtime check ça via
 *   `isAllMovementsDone()`.
 *
 * LOCALID_PLAYER (= 255) cible gPlayerAvatar. Autres LOCALID_X ciblent un
 *   ObjectEvent matching `localIdRaw === LOCALID_X`.
 *
 * Phase 4.10 first cut : impl actions critiques pour démo (= jump, walk_X,
 *   walk_in_place_*, face_X, delay_X, step_end). Autres actions (acro bike,
 *   surf, ride water, slide, etc.) à étendre si besoin.
 */

import type { DecompRuntime } from './decomp-runtime';
import { gPlayerAvatar } from './player-avatar';
import { gObjectEvents, type ObjectEvent } from './object-events';
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_TO_DX, DIR_TO_DY, MoveCoords,
} from './direction-coords';
import { gFieldCamera } from './field-camera';

// ─── Types ───────────────────────────────────────────────────────────────────

/** State per-target : queue d'actions + frame counter pour action courante. */
interface MovementQueue {
  /** Sequence d'actions strings (e.g. ['jump_right', 'delay_16', 'step_end']).
   *  Le 'step_end' termine la queue : quand le tick l'atteint, queue done. */
  actions: string[];
  /** Index de l'action courante dans actions[]. */
  currentIdx: number;
  /** Frames passées dans l'action courante. Reset à 0 au start de chaque action. */
  actionFrame: number;
  /** True si la queue est vide / terminée (= 'step_end' atteint ou consumé). */
  done: boolean;
}

const _queues = new Map<string, MovementQueue>();  // key = localIdRaw or "PLAYER"
let _activeRt: DecompRuntime | null = null;  // rt captured at tick start pour sprite access

/** Reset all queues — call au map switch / scene reset. */
export function resetMovementQueues(): void {
  _queues.clear();
}

/** Debug : expose le queue map sur globalThis. Used par dev tools/eval. */
export function _getQueuesDebug(): Map<string, MovementQueue> { return _queues; }
(globalThis as Record<string, unknown>).__mvQueues = _queues;
(globalThis as Record<string, unknown>).__mvApply = (target: string, actions: string[] | string) => {
  // dynamic import here to avoid circular at module top.
  applyMovement(target, actions);
};

// ─── Movement label resolver ─────────────────────────────────────────────────

/** Hook pour lookup movement action sequence par label (e.g.
 *  'LittlerootTown_Movement_PlayerStepOffTruck' → ['jump_right', 'delay_16', ...]).
 *  Set par script-runtime au load des map scripts. */
let _resolveMovementLabel: ((label: string) => string[] | null) | null = null;

export function setMovementLabelResolver(fn: (label: string) => string[] | null): void {
  _resolveMovementLabel = fn;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Enqueue movements pour un target localId. Si déjà active queue, override.
 *
 *  @param targetLocalId LOCALID_PLAYER, LOCALID_X, ou string from script.
 *  @param movementLabel Label (e.g. 'LittlerootTown_Movement_PlayerStepOffTruck')
 *                       OU tableau d'actions résolu directement.
 */
export function applyMovement(targetLocalId: string, movementLabelOrActions: string | string[]): void {
  let actions: string[] | null = null;
  if (Array.isArray(movementLabelOrActions)) {
    actions = movementLabelOrActions;
  } else if (_resolveMovementLabel) {
    actions = _resolveMovementLabel(movementLabelOrActions);
  }
  if (!actions || actions.length === 0) {
    console.warn(`[movement-system] applyMovement : label ${movementLabelOrActions} unresolved or empty`);
    return;
  }
  _queues.set(_queueKey(targetLocalId), {
    actions: [...actions],
    currentIdx: 0,
    actionFrame: 0,
    done: false,
  });
}

/** True si la queue pour targetLocalId est done. Si pas de queue → true (= no-op). */
export function isMovementDone(targetLocalId: string): boolean {
  const q = _queues.get(_queueKey(targetLocalId));
  return !q || q.done;
}

/** True si TOUTES les queues sont done. Used par waitmovement 0. */
export function isAllMovementsDone(): boolean {
  for (const q of _queues.values()) {
    if (!q.done) return false;
  }
  return true;
}

// ─── Queue key helper ────────────────────────────────────────────────────────

function _queueKey(targetLocalId: string): string {
  // LOCALID_PLAYER → "PLAYER" canonical key.
  if (targetLocalId === 'LOCALID_PLAYER' || targetLocalId === '255') return 'PLAYER';
  return targetLocalId;
}

// ─── Tick per frame ──────────────────────────────────────────────────────────

/** Tick all active movement queues. À call chaque frame depuis MainCB2_Overworld
 *  AVANT TickObjectEventMovements (= pour que les script-driven movements
 *  aient priorité sur les wander state machines). */
export function tickMovementQueues(rt: DecompRuntime): void {
  _activeRt = rt;  // Capture for sprite access in action handlers.
  for (const [key, q] of _queues.entries()) {
    if (q.done) continue;
    if (q.currentIdx >= q.actions.length) {
      q.done = true;
      _onQueueDone(key);
      continue;
    }
    const action = q.actions[q.currentIdx];

    // Resolve target ObjectEvent ou player.
    const target = _resolveTarget(key);
    if (!target) {
      // Target invisible / not spawned : skip silently for now.
      q.currentIdx++;
      q.actionFrame = 0;
      continue;
    }

    const advance = _tickAction(action, target, q.actionFrame, rt);
    if (advance) {
      // Action done. Pop + advance.
      q.currentIdx++;
      q.actionFrame = 0;
      // Si action == 'step_end' OR currentIdx hors bounds → queue done.
      if (action === 'step_end' || q.currentIdx >= q.actions.length) {
        q.done = true;
        _onQueueDone(key);
      }
    } else {
      q.actionFrame++;
    }
  }
}

/** Quand une queue devient done, reset le movementSpeed pour le player (= stop
 *  le BG scroll). 1:1 décomp `MovementAction_FinishedMovement` qui set sprite
 *  speed = 0 quand action done. */
function _onQueueDone(key: string): void {
  if (key === 'PLAYER') {
    gFieldCamera.movementSpeedX = 0;
    gFieldCamera.movementSpeedY = 0;
  }
}

// ─── Target resolver ─────────────────────────────────────────────────────────

interface MovementTarget {
  isPlayer: boolean;
  npc?: ObjectEvent;
}

function _resolveTarget(key: string): MovementTarget | null {
  if (key === 'PLAYER') return { isPlayer: true };
  // Find NPC by localIdRaw match.
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.localIdRaw === key) return { isPlayer: false, npc };
  }
  return null;
}

// ─── Action handlers ─────────────────────────────────────────────────────────

/** Returns true if action is done (= advance to next). False if still ticking.
 *
 *  Each action sets up state on its first tick (frame=0) and continues advancing.
 *  For multi-frame actions (= walk, jump), the frame counter is checked against
 *  the action's duration. */
function _tickAction(action: string, target: MovementTarget, frame: number, rt: DecompRuntime): boolean {
  // ─── Instant actions (= 1 frame each) ────────────────────────────────────
  if (action === 'step_end') {
    // Queue terminator. Done immediately.
    return true;
  }
  if (action === 'face_down')  { _setFacing(target, DIR_SOUTH); return true; }
  if (action === 'face_up')    { _setFacing(target, DIR_NORTH); return true; }
  if (action === 'face_left')  { _setFacing(target, DIR_WEST);  return true; }
  if (action === 'face_right') { _setFacing(target, DIR_EAST);  return true; }
  if (action === 'set_invisible') { _setInvisible(target, true, rt); return true; }
  if (action === 'set_visible')   { _setInvisible(target, false, rt); return true; }
  if (action === 'lock_facing_direction')   { return true; /* TODO future : flag */ }
  if (action === 'unlock_facing_direction') { return true; }

  // ─── Delay actions (= N frames idle) ─────────────────────────────────────
  if (action === 'delay_1')  return frame >= 1;
  if (action === 'delay_2')  return frame >= 2;
  if (action === 'delay_4')  return frame >= 4;
  if (action === 'delay_8')  return frame >= 8;
  if (action === 'delay_16') return frame >= 16;

  // ─── Walk actions (= 16 frames at 1 px/frame, 1:1 décomp WalkNormal) ─────
  if (action === 'walk_down')  return _tickWalk(target, DIR_SOUTH, frame, 16, 1);
  if (action === 'walk_up')    return _tickWalk(target, DIR_NORTH, frame, 16, 1);
  if (action === 'walk_left')  return _tickWalk(target, DIR_WEST,  frame, 16, 1);
  if (action === 'walk_right') return _tickWalk(target, DIR_EAST,  frame, 16, 1);

  // ─── Walk slow (= 32 frames at 0.5 px/frame = 1 px / 2 frames) ───────────
  if (action === 'walk_slow_down')  return _tickWalk(target, DIR_SOUTH, frame, 32, 0.5);
  if (action === 'walk_slow_up')    return _tickWalk(target, DIR_NORTH, frame, 32, 0.5);
  if (action === 'walk_slow_left')  return _tickWalk(target, DIR_WEST,  frame, 32, 0.5);
  if (action === 'walk_slow_right') return _tickWalk(target, DIR_EAST,  frame, 32, 0.5);

  // ─── Walk fast (= 8 frames at 2 px/frame) ────────────────────────────────
  if (action === 'walk_fast_down')  return _tickWalk(target, DIR_SOUTH, frame, 8, 2);
  if (action === 'walk_fast_up')    return _tickWalk(target, DIR_NORTH, frame, 8, 2);
  if (action === 'walk_fast_left')  return _tickWalk(target, DIR_WEST,  frame, 8, 2);
  if (action === 'walk_fast_right') return _tickWalk(target, DIR_EAST,  frame, 8, 2);

  // ─── Walk faster (= 8 frames at 2 px/frame, alias of walk_fast for now) ──
  if (action === 'walk_faster_down')  return _tickWalk(target, DIR_SOUTH, frame, 8, 2);
  if (action === 'walk_faster_up')    return _tickWalk(target, DIR_NORTH, frame, 8, 2);
  if (action === 'walk_faster_left')  return _tickWalk(target, DIR_WEST,  frame, 8, 2);
  if (action === 'walk_faster_right') return _tickWalk(target, DIR_EAST,  frame, 8, 2);

  // ─── Walk in place (= face anim sans bouger, durations variées) ──────────
  if (action.startsWith('walk_in_place_')) {
    return _tickWalkInPlace(action, target, frame);
  }

  // ─── Jump actions (= 32 frames sur 2 tiles avec sJumpY_High curve) ───────
  if (action === 'jump_2_down')  return _tickJump(target, DIR_SOUTH, frame, 2);
  if (action === 'jump_2_up')    return _tickJump(target, DIR_NORTH, frame, 2);
  if (action === 'jump_2_left')  return _tickJump(target, DIR_WEST,  frame, 2);
  if (action === 'jump_2_right') return _tickJump(target, DIR_EAST,  frame, 2);
  if (action === 'jump_down')    return _tickJump(target, DIR_SOUTH, frame, 1);
  if (action === 'jump_up')      return _tickJump(target, DIR_NORTH, frame, 1);
  if (action === 'jump_left')    return _tickJump(target, DIR_WEST,  frame, 1);
  if (action === 'jump_right')   return _tickJump(target, DIR_EAST,  frame, 1);

  // ─── Jump in place (= 16 frames hop without moving) ──────────────────────
  if (action.startsWith('jump_in_place_')) {
    return _tickJumpInPlace(action, target, frame);
  }

  // ─── Player run (= 8 frames at 2px/frame, dash anim) ─────────────────────
  if (action === 'player_run_down')  return _tickWalk(target, DIR_SOUTH, frame, 8, 2);
  if (action === 'player_run_up')    return _tickWalk(target, DIR_NORTH, frame, 8, 2);
  if (action === 'player_run_left')  return _tickWalk(target, DIR_WEST,  frame, 8, 2);
  if (action === 'player_run_right') return _tickWalk(target, DIR_EAST,  frame, 8, 2);

  // ─── Unknown action : log warning + skip. ────────────────────────────────
  if (frame === 0) {
    console.warn(`[movement-system] unknown action '${action}' (skipping)`);
  }
  return true;  // skip immediately
}

// ─── Action implementations ──────────────────────────────────────────────────

function _setFacing(target: MovementTarget, dir: number): void {
  if (target.isPlayer) {
    gPlayerAvatar.facing = dir;
  } else if (target.npc) {
    target.npc.facingDirection = dir;
  }
}

function _setInvisible(target: MovementTarget, invisible: boolean, rt: DecompRuntime): void {
  if (target.isPlayer) {
    if (gPlayerAvatar.spriteId >= 0) {
      const s = rt.gSprites.get(gPlayerAvatar.spriteId);
      if (s) s.invisible = invisible;
    }
  } else if (target.npc) {
    target.npc.invisible = invisible;
    if (target.npc.spriteId >= 0) {
      const s = rt.gSprites.get(target.npc.spriteId);
      if (s) s.invisible = invisible;
    }
  }
}

/** Walk N tiles in direction. duration = total frames, pixelsPerFrame = velocity.
 *  Example : walk_normal = 16 frames × 1 px = 16 px = 1 tile. */
function _tickWalk(
  target: MovementTarget, dir: number, frame: number,
  duration: number, pxPerFrame: number,
): boolean {
  if (frame === 0) {
    // Init walk : set direction, advance logical coords.
    _setFacing(target, dir);
    _initWalk(target, dir);
  }

  // Tick : advance worldX/Y by pxPerFrame * direction.
  const dx = (DIR_TO_DX[dir] ?? 0) * pxPerFrame;
  const dy = (DIR_TO_DY[dir] ?? 0) * pxPerFrame;
  if (target.isPlayer) {
    // Player visual position is fixed at SCREEN_CENTER. Camera does the scrolling
    // via gFieldCamera.movementSpeedX/Y. So we drive the camera here, and let
    // CameraUpdate handle the BG scrolling.
    gFieldCamera.movementSpeedX = dx;
    gFieldCamera.movementSpeedY = dy;
  } else if (target.npc) {
    target.npc.worldX += dx;
    target.npc.worldY += dy;
  }

  // Done when frame == duration.
  if (frame >= duration - 1) {
    if (target.isPlayer) {
      // Step end : finalize player position. NB : ne PAS reset speedX/Y = 0
      // ici (= CameraUpdate runs après, ferait perdre le dernier décrément).
      // Reset géré à la fin de tickMovementQueues quand queue done.
      const { x: nx, y: ny } = MoveCoords(dir, gPlayerAvatar.x, gPlayerAvatar.y);
      gPlayerAvatar.x = nx;
      gPlayerAvatar.y = ny;
    } else if (target.npc) {
      // 1:1 décomp ShiftStillObjectEventCoords : previous = current.
      target.npc.previousCoordsX = target.npc.currentCoordsX;
      target.npc.previousCoordsY = target.npc.currentCoordsY;
      target.npc.walkFramesLeft = 0;
      target.npc.walkDirection = DIR_NONE;
      target.npc.walkAnimAlt = (target.npc.walkAnimAlt ^ 1) as 0 | 1;
    }
    return true;
  }
  return false;
}

/** Init walk : 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081).
 *  Set walkDirection + walkFramesLeft + ShiftObjectEventCoords (= currentCoords
 *  passe à TARGET, previousCoords reste à SOURCE).
 *
 *  NB pour player : on ne set PAS runningState/stepFramesLeft pour éviter
 *  l'interférence avec PlayerStep's locked path qui ferait tick double. On
 *  drive juste gFieldCamera.movementSpeedX/Y (= read par CameraUpdate pour
 *  scroll BG). gPlayerAvatar.x/y est mis à jour à la fin du _tickWalk. */
function _initWalk(target: MovementTarget, dir: number): void {
  if (target.isPlayer) {
    // No state machinery; direct drive via gFieldCamera.movementSpeedX/Y.
    return;
  }
  if (target.npc) {
    const dx = DIR_TO_DX[dir] ?? 0;
    const dy = DIR_TO_DY[dir] ?? 0;
    target.npc.previousCoordsX = target.npc.currentCoordsX;
    target.npc.previousCoordsY = target.npc.currentCoordsY;
    target.npc.currentCoordsX += dx;
    target.npc.currentCoordsY += dy;
    target.npc.walkDirection = dir;
    target.npc.walkFramesLeft = 16;
  }
}

/** Walk in place : 16 frames anim sans bouger logical coords. Frame counter
 *  drive un walkFramesLeft virtuel (= NPC sprite shows walk anim). */
function _tickWalkInPlace(action: string, target: MovementTarget, frame: number): boolean {
  // Determine direction + duration from action name.
  let dir = DIR_SOUTH;
  if (action.endsWith('_down'))  dir = DIR_SOUTH;
  else if (action.endsWith('_up'))    dir = DIR_NORTH;
  else if (action.endsWith('_left'))  dir = DIR_WEST;
  else if (action.endsWith('_right')) dir = DIR_EAST;

  // Faster = 8 frames, fast = 16, normal = 32, slow = 64. (1:1 décomp speeds.)
  let duration = 32;
  if (action.includes('faster_')) duration = 8;
  else if (action.includes('fast_')) duration = 16;
  else if (action.includes('slow_')) duration = 64;

  if (frame === 0) {
    _setFacing(target, dir);
    if (!target.isPlayer && target.npc) {
      target.npc.walkFramesLeft = duration;
      target.npc.walkDirection = dir;
    }
  }
  if (frame >= duration - 1) {
    if (!target.isPlayer && target.npc) {
      target.npc.walkFramesLeft = 0;
      target.npc.walkDirection = DIR_NONE;
      target.npc.walkAnimAlt = (target.npc.walkAnimAlt ^ 1) as 0 | 1;
    }
    return true;
  }
  return false;
}

/** 1:1 décomp `sJumpY_High` (event_object_movement.c:8426-8429). Curve y2
 *  offset pour jump arc visuel. 16 entries. Negative = sprite va vers HAUT. */
const sJumpY_High_local: ReadonlyArray<number> = [
  -4, -6, -8, -10, -11, -12, -12, -12,
  -11, -10, -9, -8, -6, -4, 0, 0,
];

/** Jump avec sJumpY_High curve.
 *  distance = 1 (= JUMP_DISTANCE_NORMAL, 16 frames, shift=0)
 *           = 2 (= JUMP_DISTANCE_FAR, 32 frames, shift=1)
 *  1:1 décomp `DoJumpSpriteMovement` (event_object_movement.c). */
function _tickJump(target: MovementTarget, dir: number, frame: number, distance: 1 | 2): boolean {
  const totalFrames = distance === 2 ? 32 : 16;
  const shift = distance === 2 ? 1 : 0;
  const totalPx = distance * 16;
  const pxPerFrame = totalPx / totalFrames;

  if (frame === 0) {
    _setFacing(target, dir);
    // NB : ne PAS set gPlayerAvatar.runningState = MOVING ni stepFramesLeft.
    // PlayerStep en locked path verrait MOVING + stepFramesLeft > 0 et tickerait
    // sa propre step machinery (= override our movement). Au lieu, on drive le
    // BG scroll via gFieldCamera.movementSpeedX/Y et on update gPlayerAvatar.x/y
    // directement à la fin du jump.
    if (!target.isPlayer && target.npc) {
      target.npc.previousCoordsX = target.npc.currentCoordsX;
      target.npc.previousCoordsY = target.npc.currentCoordsY;
      target.npc.currentCoordsX += (DIR_TO_DX[dir] ?? 0) * distance;
      target.npc.currentCoordsY += (DIR_TO_DY[dir] ?? 0) * distance;
      target.npc.walkDirection = dir;
      target.npc.walkFramesLeft = totalFrames;
    }
  }

  // Apply jump curve y2 offset directly on sprite (= 1:1 décomp `sprite->y2`).
  const idx = Math.min(15, Math.max(0, frame >> shift));
  const jumpY = sJumpY_High_local[idx];
  const spriteId = target.isPlayer ? gPlayerAvatar.spriteId : target.npc?.spriteId ?? -1;
  if (spriteId >= 0) {
    // rt is needed pour gSprites — captured via _activeRt set au tick level.
    const sprite = _activeRt?.gSprites.get(spriteId);
    if (sprite) sprite.y2 = jumpY;
  }

  // Advance camera or worldX/Y.
  const dx = (DIR_TO_DX[dir] ?? 0) * pxPerFrame;
  const dy = (DIR_TO_DY[dir] ?? 0) * pxPerFrame;
  if (target.isPlayer) {
    gFieldCamera.movementSpeedX = dx;
    gFieldCamera.movementSpeedY = dy;
  } else if (target.npc) {
    target.npc.worldX += dx;
    target.npc.worldY += dy;
  }

  if (frame >= totalFrames - 1) {
    // Action done : finalize logical position. NB : ne PAS reset
    // gFieldCamera.movementSpeedX/Y = 0 ici car CameraUpdate runs APRÈS notre
    // tick et ferait perdre le dernier décrément (= 1 px drift par jump).
    // Le reset speedX/Y se fait à la fin de tickMovementQueues quand la queue
    // devient vide (= équivalent au transition NOT_MOVING dans PlayerStep).
    if (spriteId >= 0) {
      const sprite = _activeRt?.gSprites.get(spriteId);
      if (sprite) sprite.y2 = 0;
    }
    if (target.isPlayer) {
      const { x: nx, y: ny } = MoveCoords(dir, gPlayerAvatar.x, gPlayerAvatar.y);
      gPlayerAvatar.x = nx;
      gPlayerAvatar.y = ny;
      if (distance === 2) {
        const { x: nx2, y: ny2 } = MoveCoords(dir, gPlayerAvatar.x, gPlayerAvatar.y);
        gPlayerAvatar.x = nx2;
        gPlayerAvatar.y = ny2;
      }
    } else if (target.npc) {
      target.npc.previousCoordsX = target.npc.currentCoordsX;
      target.npc.previousCoordsY = target.npc.currentCoordsY;
      target.npc.walkFramesLeft = 0;
      target.npc.walkDirection = DIR_NONE;
    }
    return true;
  }
  return false;
}

/** Jump in place : 16 frames hop sans bouger. Just face direction + animate. */
function _tickJumpInPlace(action: string, target: MovementTarget, frame: number): boolean {
  let dir = DIR_SOUTH;
  if (action.includes('_down')) dir = DIR_SOUTH;
  else if (action.includes('_up')) dir = DIR_NORTH;
  else if (action.includes('_left')) dir = DIR_WEST;
  else if (action.includes('_right')) dir = DIR_EAST;

  if (frame === 0) {
    _setFacing(target, dir);
    if (target.isPlayer) {
      gPlayerAvatar.jumpFramesLeft = 16;
    }
  }

  if (target.isPlayer && gPlayerAvatar.jumpFramesLeft > 0) {
    gPlayerAvatar.jumpFramesLeft--;
  }

  return frame >= 15;
}

// Future : rt is passed but currently only used for sprite visibility. Future
// extensions (emote_X, sprite anim triggers) will use rt more.

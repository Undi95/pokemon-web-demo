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

import type { DecompRuntime } from '../system/decomp-runtime';
import { gPlayerAvatar } from './player-avatar';
import { SpawnJumpLandingDust } from '../field/field-effect-jump-dust';
import { CreateShadowSprite, DestroyShadowSprite } from '../field/field-effect-shadow';
import { gObjectEvents, type ObjectEvent, ObjectEventUpdateMetatileBehaviors, SetObjectEventDirection, ShiftStillObjectEventCoords, ShiftObjectEventCoords } from './object-events';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { VarGet } from '../script/script-vars';
import { MAP_OFFSET } from './map-loader';
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_TO_DX, DIR_TO_DY, MoveCoords,
} from './direction-coords';
import { gFieldCamera } from '../field/field-camera';

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
  /** 1:1 décomp fix : flag qui retarde `_onQueueDone` d'1 frame après l'action
   *  finale. Cause root : le scripted walk_down (= e.g. door exit) tick set
   *  `gFieldCamera.movementSpeedX/Y = ±1` à chaque frame, dont la dernière (=
   *  `frame === duration - 1`). Si `_onQueueDone` reset speed=0 dans la MÊME
   *  frame, CameraUpdate (= appelé APRÈS tickMovementQueues dans MainCB2_Overworld)
   *  voit speed=0 et NE FAIT PAS le wrap final `gFieldCamera.y % 16 = 0`.
   *  → fcY reste à 15 (= post-frame 14 d'un walk_down). Le bug Nintendo dormant
   *  `field_camera.c:400-406` (= copy-paste deltaX au lieu de deltaY) fire alors
   *  au prochain step UP/DOWN quand `fcY == -speedY` match transitoirement, mute
   *  pos.x. ROM ne déclenche pas car face_direction action (queued par
   *  PlayerNotOnBikeNotMoving) set sprite.sCamera_Move=0 au FRAME D'APRÈS via
   *  CameraUpdateCallback → fcY wrap correct happens dans la dernière walk frame.
   *  Fix : `pendingFinish = true` sur dernière action, `_onQueueDone` fire au
   *  PROCHAIN tick → 1 frame de latence pour wrap. */
  pendingFinish?: boolean;
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
    // 1:1 décomp fix fcY=15 stuck (cf. interface MovementQueue.pendingFinish) :
    // si pendingFinish set frame précédente, on consomme MAINTENANT le
    // `_onQueueDone` (= speed reset 0). CameraUpdate de la frame précédente a
    // déjà processé le wrap final fcY → 0 avec speed != 0 set.
    if (q.pendingFinish && !q.done) {
      q.done = true;
      q.pendingFinish = false;
      _onQueueDone(key);
      continue;
    }
    if (q.done) continue;
    if (q.currentIdx >= q.actions.length) {
      // Empty queue (e.g. action 'step_end' consumed at the very first idx) :
      // skip 1-frame delay (= rien à finaliser, speed déjà 0 par init).
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
      // 1:1 décomp fix : on marque `pendingFinish` au lieu de fire
      // `_onQueueDone` immédiatement. Le speed reset (= via _onQueueDone)
      // sera consommé au PROCHAIN tick → 1 frame de latence laisse
      // CameraUpdate de CETTE frame voir speed != 0 et faire le wrap final
      // fcY % 16 → 0. Sans ça, fcY reste à 15 (= post frame 14 d'un walk_down)
      // et déclenche le bug Nintendo l.400-406 au prochain step UP/DOWN.
      if (action === 'step_end' || q.currentIdx >= q.actions.length) {
        q.pendingFinish = true;
      }
    } else {
      q.actionFrame++;
    }
  }
}

/** Quand une queue devient done, reset le movementSpeed pour le player (= stop
 *  le BG scroll). 1:1 décomp `MovementAction_FinishedMovement` qui set sprite
 *  speed = 0 quand action done.
 *
 *  Note 1:1 strict : pas de SyncPlayerObjectEvent ici. Slot 0 est synced
 *  IMMEDIATEMENT au Step0 (= _initWalk / _tickJump frame 0 update slot 0
 *  currentCoords + previousCoords + ObjectEventUpdateMetatileBehaviors).
 *  ShiftStillObjectEventCoords (= previousCoords = currentCoords) fire au
 *  step end. Match exactement le pattern décomp `MovementAction_*_Step0`. */
function _onQueueDone(key: string): void {
  if (key === 'PLAYER' || key === 'LOCALID_PLAYER' || key === '255') {
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
  if (key === 'PLAYER' || key === 'LOCALID_PLAYER' || key === '255') return { isPlayer: true };
  // 1:1 décomp : si VAR_*, lire la value (= un number qui matche localId).
  if (key.startsWith('VAR_')) {
    const n = VarGet(key);
    // 255 = LOCALID_PLAYER (= 1:1 décomp).
    if (n === 255) return { isPlayer: true };
    // Match by localId number.
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return { isPlayer: false, npc };
    }
    return null;
  }
  // Find NPC by localIdRaw match (= LOCALID_X string).
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.localIdRaw === key) return { isPlayer: false, npc };
  }
  // Fallback : match by numeric localId si key est un nombre.
  const n = parseInt(key, 10);
  if (!Number.isNaN(n)) {
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return { isPlayer: false, npc };
    }
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
  // Phase 4.10 bug fix : reset gFieldCamera.movementSpeedX/Y au DÉBUT de chaque
  // action pour éviter le "plane à droite à l'infini" bug.
  //
  // Symptôme : après `jump_right` (ou n'importe quelle action de mouvement),
  // sa dernière frame set speedX = dx (= 1 px/frame). On laisse comme ça pour
  // que CameraUpdate consomme le dernier décrément. Mais le frame d'après, la
  // queue avance à `delay_16` qui ne touche PAS speedX → CameraUpdate continue
  // à drainer 1 px/frame pendant 48 frames = 48 px de drift.
  //
  // Fix : reset speedX/Y = 0 au frame=0 de chaque action. Les actions de
  // mouvement (jump/walk) re-setteront speedX dans le même tick juste après,
  // donc le reset n'a effet QUE sur les actions stationnaires (delay, face, etc).
  if (frame === 0 && target.isPlayer) {
    gFieldCamera.movementSpeedX = 0;
    gFieldCamera.movementSpeedY = 0;
  }

  // ─── Instant actions (= 1 frame each) ────────────────────────────────────
  if (action === 'step_end') {
    // Queue terminator. Done immediately.
    return true;
  }
  if (action === 'face_down')  { _setFacing(target, DIR_SOUTH); return true; }
  if (action === 'face_up')    { _setFacing(target, DIR_NORTH); return true; }
  if (action === 'face_left')  { _setFacing(target, DIR_WEST);  return true; }
  if (action === 'face_right') { _setFacing(target, DIR_EAST);  return true; }

  // face_player : 1:1 décomp `MovementAction_FacePlayer_Step0` — calcule la
  // direction relative depuis le NPC vers le player et set la facing.
  // Post R3 refactor : npc.currentCoords INTERNAL → convertir pa.x/y LOGICAL.
  if (action === 'face_player' || action === 'face_away_player') {
    if (target.npc) {
      const dx = (gSaveBlock1Ptr.pos.x + MAP_OFFSET) - target.npc.currentCoordsX;
      const dy = (gSaveBlock1Ptr.pos.y + MAP_OFFSET) - target.npc.currentCoordsY;
      let dir = DIR_SOUTH;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? DIR_EAST : DIR_WEST;
      } else {
        dir = dy > 0 ? DIR_SOUTH : DIR_NORTH;
      }
      // face_away_player : opposite direction.
      if (action === 'face_away_player') {
        const oppositeDir: Record<number, number> = {
          [DIR_NORTH]: DIR_SOUTH, [DIR_SOUTH]: DIR_NORTH,
          [DIR_EAST]: DIR_WEST,   [DIR_WEST]: DIR_EAST,
        };
        dir = oppositeDir[dir] ?? dir;
      }
      _setFacing(target, dir);
    }
    return true;
  }
  // face_originally_facing_direction / face_original_direction : revert à
  // template.movementType-based facing. MVP : no-op (= NPC garde current).
  if (action === 'face_originally_facing_direction' || action === 'face_original_direction') {
    return true;
  }
  // emote_X : afficher un emoticon (= ! ? love etc) au-dessus du NPC.
  // 1:1 décomp event_object_movement.c:6479-6501 `MovementAction_Emote*_Step0` :
  //     ObjectEventGetLocalIdAndMap(objectEvent, ...);
  //     FieldEffectStart(FLDEFF_EXCLAMATION_MARK_ICON / QUESTION_MARK_ICON / HEART_ICON);
  //     sprite->sActionFuncId = 1;
  //     return TRUE;     ← action terminée IMMÉDIATEMENT, sprite vit indépendamment ~60 frames.
  // (cf. field-effect-emotes.ts pour le port complet bounce + auto-destroy 1:1
  //  trainer_see.c:SpriteCB_TrainerIcons.)
  if (action === 'emote_exclamation_mark' || action === 'emote_question_mark' ||
      action === 'emote_heart') {
    if (rt) {
      // Lookup le NPC : target = { isPlayer, npc }. Pour player, on utilise
      // `LOCALID_PLAYER`. Pour NPC, on lit `target.npc.localIdRaw`.
      const npcLocalIdRaw = target.isPlayer ? 'LOCALID_PLAYER' : (target.npc?.localIdRaw ?? '');
      if (npcLocalIdRaw) {
        void import('../field/field-effect-emotes').then(({ SpawnEmoteSprite }) => {
          const emoteType = action === 'emote_exclamation_mark' ? 'exclamation'
                          : action === 'emote_question_mark'    ? 'question'
                          : 'heart';
          SpawnEmoteSprite(rt, npcLocalIdRaw, emoteType);
        });
      }
    }
    return true;  // 1:1 décomp : action terminée immédiatement (sprite vit indép).
  }
  // emote_x / emote_double_exclamation / emote_happy : pas dans décomp Emerald
  // standard, custom additions (= no-op safe).
  if (action === 'emote_x' || action === 'emote_double_exclamation' ||
      action === 'emote_happy') {
    return true;
  }
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

  // ─── Walk faster (= 1:1 décomp `MOVE_SPEED_FASTER` = 4 frames × 4px/frame) ─
  // Avant : 8 frames × 2 px = 16 px (= alias de walk_fast). Bug : 2× plus lent
  // que la ROM. Décomp `event_object_movement.c:8274-8278 sStep4Funcs` use 4
  // frames @ 4px = 16px en 4 frames. Per Audit Opus BIG section 2.1.
  if (action === 'walk_faster_down')  return _tickWalk(target, DIR_SOUTH, frame, 4, 4);
  if (action === 'walk_faster_up')    return _tickWalk(target, DIR_NORTH, frame, 4, 4);
  if (action === 'walk_faster_left')  return _tickWalk(target, DIR_WEST,  frame, 4, 4);
  if (action === 'walk_faster_right') return _tickWalk(target, DIR_EAST,  frame, 4, 4);

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

  // ─── Slide actions (= glide ice tile via InitMovementNormal MOVE_SPEED_FASTEST) ─
  // 1:1 STRICT décomp `MovementAction_SlideDown_Step0` (event_object_movement.c:5956)
  // → InitMovementNormal(..., MOVE_SPEED_FASTEST). sStep8Funcs = 2 frames × 8 px.
  if (action === 'slide_down')  return _tickWalk(target, DIR_SOUTH, frame, 2, 8);
  if (action === 'slide_up')    return _tickWalk(target, DIR_NORTH, frame, 2, 8);
  if (action === 'slide_left')  return _tickWalk(target, DIR_WEST,  frame, 2, 8);
  if (action === 'slide_right') return _tickWalk(target, DIR_EAST,  frame, 2, 8);
  // DETTE : slide_slow_/fast_ pas dans décomp Emerald (= notre extension custom
  // pour scripts hors-démo). Pas 1:1 strict — laisser tel quel sans wire-up
  // dans la démo. À supprimer ou porter si un script Emerald les requiert.
  if (action === 'slide_slow_down')  return _tickWalk(target, DIR_SOUTH, frame, 16, 1);
  if (action === 'slide_slow_up')    return _tickWalk(target, DIR_NORTH, frame, 16, 1);
  if (action === 'slide_slow_left')  return _tickWalk(target, DIR_WEST,  frame, 16, 1);
  if (action === 'slide_slow_right') return _tickWalk(target, DIR_EAST,  frame, 16, 1);
  if (action === 'slide_fast_down')  return _tickWalk(target, DIR_SOUTH, frame, 4, 4);
  if (action === 'slide_fast_up')    return _tickWalk(target, DIR_NORTH, frame, 4, 4);
  if (action === 'slide_fast_left')  return _tickWalk(target, DIR_WEST,  frame, 4, 4);
  if (action === 'slide_fast_right') return _tickWalk(target, DIR_EAST,  frame, 4, 4);

  // ─── Walk diagonale slow (= 32 frames, used pour Lavaridge ash + Mossdeep) ──
  // DETTE 1:1 décomp `MovementAction_WalkSlowDiagonalUpLeft_Step0` etc.
  // (event_object_movement.c:5162-5232) → InitNpcForWalkSlow avec
  // DIR_NORTHWEST/NORTHEAST/SOUTHWEST/SOUTHEAST.
  // Notre TS skip le composant horizontal → NPC marche tout droit verticalement.
  // À porter via un _tickWalkDiag helper (= 0.5 px x + 0.5 px y / 2 frames pour
  // matcher WalkSlow rate). Pas dans la démo Littleroot → bug latent OK.
  if (action === 'walk_slow_diag_northeast' || action === 'walk_slow_diag_northwest'
   || action === 'walk_slow_diag_southeast' || action === 'walk_slow_diag_southwest') {
    const dir = action.includes('north') ? DIR_NORTH : DIR_SOUTH;
    return _tickWalk(target, dir, frame, 32, 0.5);
  }

  // ─── Phase 5.3c : Auto-dispatch fallback via event_object_movement-all-auto.
  // Si l'action a un MovementAction_X_Step0/1 dans le décomp auto-porté, on
  // tente de l'appeler. Si ça throw (= helper/data manquant), on tombe sur
  // le warning + skip. Ça permet d'activer les actions auto-portées sans
  // breaker celles déjà gérées.
  const autoResult = _tryAutoDispatch(action, target, frame);
  if (autoResult !== null) return autoResult;

  // ─── Unknown action : log warning + skip. ────────────────────────────────
  if (frame === 0) {
    console.warn(`[movement-system] unknown action '${action}' (skipping)`);
  }
  return true;  // skip immediately
}

/** Tracks per-target sActionFuncId for the auto dispatch.
 *  Décomp utilise sprite->data[2] mais nous on utilise un Map externe pour
 *  éviter de polluer ObjectEvent struct. Reset à 0 quand action change. */
const _autoDispatchState = new WeakMap<object, { action: string; sActionFuncId: number; sprite: any }>();

/** Try to dispatch an action via the auto-ported MovementAction_*_StepN funcs.
 *  Returns:
 *  - null     : dispatch not bridged (= caller falls through to warn+skip)
 *  - true     : action complete, advance queue
 *  - false    : action still ticking */
function _tryAutoDispatch(action: string, target: MovementTarget, frame: number): boolean | null {
  // Lazy-import to avoid circular dependency.
  let dispatchMod: any;
  try {
    dispatchMod = (globalThis as any).__movementDispatchMod;
    if (!dispatchMod) return null;
  } catch { return null; }
  if (!dispatchMod.isAutoBridged(action)) return null;
  // Build/reuse per-target state.
  const targetKey = (target.npc ?? gPlayerAvatar) as object;
  let state = _autoDispatchState.get(targetKey);
  if (!state || state.action !== action) {
    state = {
      action,
      sActionFuncId: 0,
      sprite: { sActionFuncId: 0, data: new Array(16).fill(0), animPaused: false },
    };
    _autoDispatchState.set(targetKey, state);
  }
  // ObjectEvent : utiliser le NPC ou un wrapper pour player.
  const objectEvent = target.npc ?? gPlayerAvatar;
  // Sync sActionFuncId.
  state.sprite.sActionFuncId = state.sActionFuncId;
  state.sprite.data[2] = state.sActionFuncId;
  // Try dispatch.
  const r = dispatchMod.tryDispatch(action, objectEvent, state.sprite);
  if (!r.handled) return null;
  if (r.threw && frame === 0) {
    // Log once per action+target.
    console.warn(`[movement-system] auto-dispatch '${action}' threw : ${r.threw}`);
  }
  // Advance sActionFuncId : dans le décomp, c'est incremented manually par
  // les Step bodies (= state.sprite.sActionFuncId est mis à jour pendant l'exec).
  state.sActionFuncId = state.sprite.sActionFuncId ?? state.sActionFuncId;
  return r.done;
}

// ─── Action implementations ──────────────────────────────────────────────────

function _setFacing(target: MovementTarget, dir: number): void {
  if (target.isPlayer) {
    // 1:1 décomp : pa.facing n'existe PAS dans struct PlayerAvatar — source
    // unique = slot.facingDirection via SetObjectEventDirection (= maintient
    // l'invariant previousMovementDirection + lock check).
    SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], dir);
  } else if (target.npc) {
    target.npc.facingDirection = dir;
    // 1:1 décomp Audit BIG #2.2 fix : pour les NPCs en MOVEMENT_TYPE_LOOK_AROUND,
    // WANDER_AROUND, etc., le movementStep peut être à 4 (= "pick random
    // direction" prochain tick). Si on set facing ici (= via face_player ou autre
    // movement action) puis le NPC unfreeze, tickLookAround.case 4 écraserait
    // le facing avec un random direction immédiatement.
    // Fix : reset movementStep à 1 + reset movementDelay (= "wait full delay
    // before next random") pour que le facing soit respecté ≥1 cycle complet.
    // 1:1 décomp `FaceDirection` (event_object_movement.c:5048) appelle aussi
    // `ShiftStillObjectEventCoords` qui resync les coords + step machinery.
    if (target.npc.movementStep === 4) {
      target.npc.movementStep = 1;
      target.npc.movementDelay = 0;  // recompute delay au prochain step 0/1
    }
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
    // Session 124 fix : drive `stepFramesLeft` countdown pour que le sprite
    // render walk anim frames pendant le scripted movement (= cf. user
    // feedback "Le sprite du player ne marche pas lors d'une animation
    // (suivre mom)"). PlayerStep ne décrémentera PAS car runningState reste
    // NOT_MOVING (= notre scripted movement ne touche pas runningState).
    // updateSpriteFrame check `stepFramesLeft >= halfStep` (= 8) pour render
    // walk_a/walk_b alternant via walkAnimAlt, sinon face. Avec countdown
    // duration→0, premier ~halfStep frames = walk, reste = face.
    gPlayerAvatar.stepFramesLeft = duration - frame;
  } else if (target.npc) {
    target.npc.worldX += dx;
    target.npc.worldY += dy;
    // C4 fix (DEMO-AUDIT-FINDINGS) : décrément walkFramesLeft pour driver le
    // cycle walk1/face/walk2/face dans updateNpcSpriteFrame. Sans ça,
    // walkFramesLeft restait à 16 (= toujours >= 8) → NPC affiche walk1 ou
    // walk2 TOUTE la durée du step (jamais face). Bug user-flag : "PNJ qui
    // marche en 2 frames et pas 3" = walk1+walk2+walk1+... sans pose entre.
    //
    // 1:1 décomp `event_object_movement.c:1858 MovementType_WalkNormal_Step1`
    // décrémente directionTimer (= équivalent walkFramesLeft) chaque frame.
    // sAnim_GoSouth/North/West/East (object_event_anims.h:202-236) =
    // FRAME(walk1,8) FRAME(face,8) FRAME(walk2,8) FRAME(face,8) JUMP(0) →
    // sur 1 step de 16 frames, walkFramesLeft 16→9 affiche walk_alt (walk1
    // si alt=0, walk2 si alt=1), 8→1 affiche face. Step suivant : alt flip
    // → walk2 puis face. Cycle 32 frames = 2 steps consécutifs.
    target.npc.walkFramesLeft = duration - frame;
  }

  // Done when frame == duration.
  if (frame >= duration - 1) {
    if (target.isPlayer) {
      // 1:1 décomp `UpdateMovementNormal` (event_object_movement.c:5116-5126) :
      //   if (NpcTakeStep(sprite)) {
      //       ShiftStillObjectEventCoords(objectEvent);  ← previous = current (= post-step)
      //       objectEvent->triggerGroundEffectsOnStop = TRUE;
      //       sprite->animPaused = TRUE;
      //       return TRUE;
      //   }
      // Le décomp fait pareil pour player et NPC. Notre TS skip historiquement
      // pour player (= laissait previousCoords à pre-step). Fix 1:1 strict.
      const playerSlot = gPlayerAvatar.objectEventId;
      const slot = gObjectEvents[playerSlot];
      if (slot && slot.active && slot.isPlayer) {
        // 1:1 STRICT décomp event_object_movement.c:5120 :
        //   ShiftStillObjectEventCoords(objectEvent);  ← previous = current
        ShiftStillObjectEventCoords(slot);
        slot.previousMovementDirection = slot.movementDirection;
        slot.triggerGroundEffectsOnStop = true;
        // 1:1 décomp `GetAllGroundEffectFlags_OnFinishStep` (event_object_movement.c
        // :7415) appelle `ObjectEventUpdateMetatileBehaviors(objEvent)` au step end.
        ObjectEventUpdateMetatileBehaviors(slot);
      }
      // Reset stepFramesLeft + flip walkAnimAlt (= 1:1 PlayerStep end behavior
      // pour next walk anim alterne).
      gPlayerAvatar.stepFramesLeft = 0;
      gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
    } else if (target.npc) {
      // 1:1 STRICT décomp event_object_movement.c:5120 ShiftStillObjectEventCoords :
      //   previous = current → NPC stable, plus de collision sur la source cell.
      ShiftStillObjectEventCoords(target.npc);
      target.npc.walkFramesLeft = 0;
      target.npc.walkDirection = DIR_NONE;
      target.npc.walkAnimAlt = (target.npc.walkAnimAlt ^ 1) as 0 | 1;
      // 1:1 décomp `previousMovementDirection = movementDirection` (= save direction
      // pour PlayerAllowForcedMovementIfMovingSameDirection check, even for NPCs).
      target.npc.previousMovementDirection = target.npc.movementDirection;
      // 1:1 décomp `GetAllGroundEffectFlags_OnFinishStep` (event_object_movement.c
      // :7415) appelle `ObjectEventUpdateMetatileBehaviors(objEvent)` au step end
      // pour update `currentMetatileBehavior` + `previousMetatileBehavior` cached.
      // Used par ground effects + HideShowWarpArrow + collision dispatch.
      ObjectEventUpdateMetatileBehaviors(target.npc);
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
  const dx = DIR_TO_DX[dir] ?? 0;
  const dy = DIR_TO_DY[dir] ?? 0;
  // 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081) :
  //   x = objectEvent->currentCoords.x;
  //   y = objectEvent->currentCoords.y;
  //   SetObjectEventDirection(objectEvent, direction);
  //   MoveCoords(direction, &x, &y);
  //   ShiftObjectEventCoords(objectEvent, x, y);   ← previous=current, current=post-step
  //   ...
  // Le décomp fait pareil pour player et NPC (= MovementAction_* Step0 call
  // InitNpcForMovement avec objectEvent = player slot ou NPC slot). Notre TS
  // historiquement skip pour player (= drove gFieldCamera only) — divergence
  // 1:1 qui causait slot 0 désync user-flag 2026-05-22 post warp + TV event.
  //
  // Fix 1:1 strict path identique : update slot 0 directement IMMEDIATEMENT
  // au Step0, comme NPCs. CameraMove continue à drive pos (= camera focus
  // mirror) via gFieldCamera.movementSpeedX/Y au tick suivant.
  if (target.isPlayer) {
    const playerSlot = gPlayerAvatar.objectEventId;
    const slot = gObjectEvents[playerSlot];
    if (slot && slot.active && slot.isPlayer) {
      // 1:1 STRICT décomp InitNpcForMovement (5081-5097) : ShiftObjectEventCoords
      // avec (currentX + dx, currentY + dy). Maintien previous=ancien current.
      ShiftObjectEventCoords(slot, slot.currentCoordsX + dx, slot.currentCoordsY + dy);
      slot.movementDirection = dir;
      slot.facingDirection = dir;
      ObjectEventUpdateMetatileBehaviors(slot);
    }
    return;
  }
  if (target.npc) {
    // 1:1 STRICT décomp ShiftObjectEventCoords (= previous=current, current+=d).
    ShiftObjectEventCoords(target.npc, target.npc.currentCoordsX + dx, target.npc.currentCoordsY + dy);
    target.npc.walkDirection = dir;
    target.npc.walkFramesLeft = 16;
    // 1:1 décomp `InitMoveInDirection` (event_object_movement.c:5444) :
    //   objectEvent->movementDirection = direction;
    //   objectEvent->facingDirection = direction;
    // Used par HideShowWarpArrow + PlayerAllowForcedMovement check.
    target.npc.movementDirection = dir;
    target.npc.facingDirection = dir;
    // 1:1 décomp `GetAllGroundEffectFlags_OnBeginStep` (event_object_movement.c
    // :7401) appelle `ObjectEventUpdateMetatileBehaviors(objEvent)` au step
    // start pour refresh `currentMetatileBehavior` après ShiftObjectEventCoords.
    ObjectEventUpdateMetatileBehaviors(target.npc);
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

  // 1:1 décomp `event_object_movement.c:5732-5826 InitMoveInPlace` :
  // walk_in_place_normal = 16 frames, slow = 32, fast = 8, faster = 4.
  // Bug fix session 124 (= Audit Opus BIG section 2.1) : avant ce fix les
  // durations étaient 2× trop longues (32, 64, 16, 8) → toute scripted
  // face-anim 2× plus lente que la ROM.
  let duration = 16;
  if (action.includes('faster_')) duration = 4;
  else if (action.includes('fast_')) duration = 8;
  else if (action.includes('slow_')) duration = 32;

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
    // 1:1 décomp `InitJumpRegular` (event_object_movement.c:5450) :
    //   ShiftObjectEventCoords(objectEvent, objectEvent->currentCoords.x + x*dist, ...);
    //   SetJumpSpriteData(sprite, direction, distance, type);
    //   objectEvent->triggerGroundEffectsOnMove = TRUE;
    // Le décomp fait pareil pour player et NPC. Notre TS update slot 0
    // currentCoords IMMEDIATEMENT au Step0 (= 1:1 strict path).
    const dxLogical = (DIR_TO_DX[dir] ?? 0) * distance;
    const dyLogical = (DIR_TO_DY[dir] ?? 0) * distance;
    if (target.isPlayer) {
      const playerSlot = gPlayerAvatar.objectEventId;
      const slot = gObjectEvents[playerSlot];
      if (slot && slot.active && slot.isPlayer) {
        // 1:1 STRICT décomp event_object_movement.c:5450 InitJumpRegular →
        //   ShiftObjectEventCoords(objectEvent, currentX + dx*dist, currentY + dy*dist)
        ShiftObjectEventCoords(slot, slot.currentCoordsX + dxLogical, slot.currentCoordsY + dyLogical);
        slot.movementDirection = dir;
        slot.facingDirection = dir;
        slot.triggerGroundEffectsOnMove = true;
        slot.disableJumpLandingGroundEffect = false;
        ObjectEventUpdateMetatileBehaviors(slot);
      }
      // Bug user-flag 2026-05-21 : "Le joueur saute du camion sans le bon
      // sprite ni l'ombre en dessous". 1:1 décomp `InitJumpRegular` :
      //   - jumpFramesLeft drive sprite y2 arc + walk anim frame
      //   - DoShadowFieldEffect → CreateShadowSprite sous player
      gPlayerAvatar.jumpFramesLeft = totalFrames;
      gPlayerAvatar.stepFramesLeft = totalFrames;
      if (_activeRt) CreateShadowSprite(_activeRt);
    } else if (target.npc) {
      // 1:1 STRICT décomp ShiftObjectEventCoords (= previous=current, current+=d*dist).
      ShiftObjectEventCoords(target.npc, target.npc.currentCoordsX + dxLogical, target.npc.currentCoordsY + dyLogical);
      target.npc.walkDirection = dir;
      target.npc.walkFramesLeft = totalFrames;
    }
  }

  // Player : drive countdown stepFramesLeft for sprite anim + jumpFramesLeft for arc.
  if (target.isPlayer) {
    gPlayerAvatar.stepFramesLeft = totalFrames - frame;
    if (gPlayerAvatar.jumpFramesLeft > 0) gPlayerAvatar.jumpFramesLeft--;
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
      // 1:1 décomp `MovementAction_Jump*_Step1` end (event_object_movement.c:5535) :
      //   objectEvent->hasShadow = FALSE;
      //   ShiftStillObjectEventCoords(objectEvent);   ← previous = current (= post-jump)
      //   sActionFuncId = 2;
      // Le décomp pareil pour player et NPC. Notre TS sync slot 0 pour player.
      const playerSlot = gPlayerAvatar.objectEventId;
      const slot = gObjectEvents[playerSlot];
      if (slot && slot.active && slot.isPlayer) {
        slot.previousCoordsX = slot.currentCoordsX;
        slot.previousCoordsY = slot.currentCoordsY;
        slot.previousMovementDirection = slot.movementDirection;
        slot.hasShadow = false;
        slot.triggerGroundEffectsOnStop = true;
        ObjectEventUpdateMetatileBehaviors(slot);
      }
      // Cleanup jump state : sprite frame reset à face + shadow destroyed +
      // walkAnimAlt flipped pour next step start avec l'autre walk frame.
      gPlayerAvatar.jumpFramesLeft = 0;
      gPlayerAvatar.stepFramesLeft = 0;
      gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
      if (_activeRt) DestroyShadowSprite(_activeRt);
      // 1:1 décomp `GroundEffect_JumpLandingDust` (event_object_movement.c).
      // Spawn dust cloud à landing position si on a un rt.
      // Player jump landing : pas de flag disable côté player (= toujours dust).
      if (_activeRt) SpawnJumpLandingDust(_activeRt, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
    } else if (target.npc) {
      target.npc.previousCoordsX = target.npc.currentCoordsX;
      target.npc.previousCoordsY = target.npc.currentCoordsY;
      target.npc.walkFramesLeft = 0;
      target.npc.walkDirection = DIR_NONE;
      // Dust at NPC landing position — sauf si flag disableJumpLandingGroundEffect
      // set par script opcode `disable_jump_landing_ground_effect`. 1:1 décomp
      // event_object_movement.c:DoLandingEffect skip si flag set.
      const flag = (target.npc as unknown as { disableJumpLandingGroundEffect?: boolean }).disableJumpLandingGroundEffect;
      if (_activeRt && !flag) {
        // SpawnJumpLandingDust signature attend LOGICAL coords. Post R3 refactor :
        // npc.currentCoords INTERNAL → convertir.
        SpawnJumpLandingDust(_activeRt, target.npc.currentCoordsX - MAP_OFFSET, target.npc.currentCoordsY - MAP_OFFSET);
      }
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

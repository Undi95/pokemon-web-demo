/**
 * event_object_lock.ts — miroir 1:1 de `src/event_object_lock.c` (209l).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/event_object_lock.c`.
 *
 * Système FREEZE des scripts : gèle le joueur + les object events pendant l'exécution d'un
 * script (opcodes `lock`/`lockall`/`release`/`releaseall`/`faceplayer`), puis les dégèle.
 *   - `lockall`   → FreezeObjects_WaitForPlayer + attend IsFreezePlayerFinished.
 *   - `lock`      → FreezeObjects_WaitForPlayerAndSelected + attend IsFreezeSelectedObjectAndPlayerFinished.
 *   - `release(all)` → ScriptUnfreezeObjectEvents.
 *   - `faceplayer` → Script_FacePlayer.
 *
 * Chaîne freeze 1:1 RÉELLE (fix bug « steps ») : le joueur TERMINE son pas en cours
 * (Task_FreezePlayer poll IsPlayerStandingStill), PUIS `PlayerFreeze()` FORCE le held
 * FACE_X (pose neutre pieds joints), et à la fin `StopPlayerAvatar()` (npc_clear_strange_bits
 * + SetObjectEventDirection + bike) débloque le script.
 *
 * DIFFÉRÉS (deps absentes, cf. notes) :
 *  - `FreezeForApproachingTrainers`/`Task_FreezeObjectAndPlayer`/`IsFreezeObjectAndPlayerFinished`
 *    (aggro dresseurs — GetChosenApproachingTrainerObjectEventId/trainer_see.c + gNoOfApproachingTrainers,
 *    chantier P2.3) ;
 *  - `UnionRoom_UnlockPlayerAndChatPartner` (Union Room / link non porté).
 */
import { getSelectedNpc, OPPOSITE_DIR, isPlayerStepFinished } from './engine/script/script-opcodes-helpers';
import { gSelectedObjectEvent } from './engine/script/script-vars';
import {
  FreezeObjectEvent, UnfreezeObjectEvent, ObjectEventClearHeldMovementIfFinished,
  ObjectEventClearHeldMovementIfActive, ObjectEventSetHeldMovement, gObjectEvents,
  FreezeObjectEvents, FreezeObjectEventsExceptOne,
} from './event_object_movement';
import {
  GetPlayerFacingDirection, gPlayerAvatar, PlayerFreeze, StopPlayerAvatar,
  DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
} from './field_player_avatar';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import { CreateTask, DestroyTask } from './task';
import { FuncIsActiveTask, GetTask } from '../harness/runtime/decomp-globals';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
} from '../include/constants/event_object_movement';

/** 1:1 décomp `GetFaceDirectionMovementAction(dir)` (table) : dir → MOVEMENT_ACTION_FACE_X. */
function faceAction(dir: number): number {
  switch (dir) {
    case DIR_SOUTH: return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_NORTH: return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST:  return MOVEMENT_ACTION_FACE_LEFT;
    case DIR_EAST:  return MOVEMENT_ACTION_FACE_RIGHT;
    default:        return MOVEMENT_ACTION_FACE_DOWN;
  }
}

/** 1:1 décomp `IsPlayerStandingStill` (event_object_lock.c:11) :
 *    return gPlayerAvatar.tileTransitionState != T_TILE_TRANSITION.
 *  Adaptation ASSUMÉE : notre gate `isPlayerStepFinished()` = tileTransitionState
 *  != T_TILE_TRANSITION + gate `forceMovement === 0` (stand-in du door-walk — NE PAS
 *  régresser les portes). */
export function IsPlayerStandingStill(): boolean {
  return isPlayerStepFinished();
}

/** 1:1 décomp `Task_FreezePlayer` (event_object_lock.c:20) :
 *    // Freeze player once their movement is finished
 *    if (IsPlayerStandingStill()) { PlayerFreeze(); DestroyTask(taskId); }
 *  ⚠️ Passée DIRECTEMENT à CreateTask (identité requise par FuncIsActiveTask). */
function Task_FreezePlayer(task: DecompTask): void {
  if (IsPlayerStandingStill()) {
    PlayerFreeze();
    DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `IsFreezePlayerFinished` (event_object_lock.c:29) :
 *    if (FuncIsActiveTask(Task_FreezePlayer)) return FALSE;
 *    else { StopPlayerAvatar(); return TRUE; } */
export function IsFreezePlayerFinished(): boolean {
  if (FuncIsActiveTask(Task_FreezePlayer)) {
    return false;
  } else {
    StopPlayerAvatar();
    return true;
  }
}

/** 1:1 décomp `FreezeObjects_WaitForPlayer` (event_object_lock.c:43) :
 *    FreezeObjectEvents(); CreateTask(Task_FreezePlayer, 80);
 *  → gèle TOUS les object events (sauf joueur) immédiatement ; le joueur est figé une
 *  fois son pas terminé (Task_FreezePlayer), le script attend via IsFreezePlayerFinished. */
export function FreezeObjects_WaitForPlayer(): void {
  FreezeObjectEvents();
  CreateTask(Task_FreezePlayer, 80);
}

// #define tPlayerFrozen data[0]
// #define tObjectFrozen data[1]

/** 1:1 décomp `Task_FreezeSelectedObjectAndPlayer` (event_object_lock.c:54) :
 *    // Freeze selected object and player once their movement is finished
 *    if (!tPlayerFrozen && IsPlayerStandingStill() == TRUE) { PlayerFreeze(); tPlayerFrozen = TRUE; }
 *    if (!tObjectFrozen && !gObjectEvents[gSelectedObjectEvent].singleMovementActive)
 *        { FreezeObjectEvent(selected); tObjectFrozen = TRUE; }
 *    if (tPlayerFrozen && tObjectFrozen) DestroyTask(taskId);
 *  ⚠️ Passée DIRECTEMENT à CreateTask (identité requise par FuncIsActiveTask). */
function Task_FreezeSelectedObjectAndPlayer(task: DecompTask): void {
  if (!task.data[0] && IsPlayerStandingStill() === true) {
    PlayerFreeze();
    task.data[0] = 1;  // tPlayerFrozen = TRUE
  }
  if (!task.data[1] && !gObjectEvents[gSelectedObjectEvent.index].singleMovementActive) {
    FreezeObjectEvent(gObjectEvents[gSelectedObjectEvent.index]);
    task.data[1] = 1;  // tObjectFrozen = TRUE
  }
  if (task.data[0] && task.data[1])
    DestroyTask(task.taskId);
}

/** 1:1 décomp `IsFreezeSelectedObjectAndPlayerFinished` (event_object_lock.c:72) :
 *    if (FuncIsActiveTask(Task_FreezeSelectedObjectAndPlayer)) return FALSE;
 *    else { StopPlayerAvatar(); return TRUE; } */
export function IsFreezeSelectedObjectAndPlayerFinished(): boolean {
  if (FuncIsActiveTask(Task_FreezeSelectedObjectAndPlayer)) {
    return false;
  } else {
    StopPlayerAvatar();
    return true;
  }
}

/** 1:1 décomp `FreezeObjects_WaitForPlayerAndSelected` (event_object_lock.c:87) :
 *    // Freeze all objects immediately except the selected object and the player.
 *    // The selected object and player are frozen once their movement is finished.
 *    FreezeObjectEventsExceptOne(gSelectedObjectEvent);
 *    taskId = CreateTask(Task_FreezeSelectedObjectAndPlayer, 80);
 *    if (!gObjectEvents[gSelectedObjectEvent].singleMovementActive)
 *        { FreezeObjectEvent(selected); gTasks[taskId].tObjectFrozen = TRUE; } */
export function FreezeObjects_WaitForPlayerAndSelected(): void {
  FreezeObjectEventsExceptOne(gSelectedObjectEvent.index);
  const taskId = CreateTask(Task_FreezeSelectedObjectAndPlayer, 80);
  if (!gObjectEvents[gSelectedObjectEvent.index].singleMovementActive) {
    FreezeObjectEvent(gObjectEvents[gSelectedObjectEvent.index]);
    const task = GetTask(taskId);
    if (task) task.data[1] = 1;  // gTasks[taskId].tObjectFrozen = TRUE
  }
}

/** 1:1 décomp `ScriptUnfreezeObjectEvents` (event_object_lock.c:99) :
 *    playerObjectId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
 *    ObjectEventClearHeldMovementIfFinished(&gObjectEvents[playerObjectId]);
 *    ScriptMovement_UnfreezeObjectEvents();
 *    UnfreezeObjectEvents();
 *  → libère le held movement du joueur + dégèle les scripts de mouvement + dégèle tous les objets.
 *  Adaptation : playerObjectId via gPlayerAvatar.objectEventId (= slot LOCALID_PLAYER). */
export function ScriptUnfreezeObjectEvents(): void {
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
}

/** 1:1 décomp `Script_FacePlayer` (event_object_lock.c:119) :
 *    ObjectEventFaceOppositeDirection(&gObjectEvents[gSelectedObjectEvent], gSpecialVar_Facing);
 *  → le NPC sélectionné se tourne vers le joueur (= direction opposée au facing du joueur).
 *  Adaptation : `ObjectEventSetHeldMovement(npc, faceAction(opposite(playerFacing)))` (équiv. net). */
export function Script_FacePlayer(): void {
  const npc = getSelectedNpc();
  if (!npc) return;
  const opp = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  ObjectEventSetHeldMovement(npc, faceAction(opp));
}

/** 1:1 décomp `Script_ClearHeldMovement` (event_object_lock.c:124) :
 *    ObjectEventClearHeldMovementIfActive(&gObjectEvents[gSelectedObjectEvent]);
 *  Enregistrée comme special dans specials-registry.ts. */
export function Script_ClearHeldMovement(): void {
  ObjectEventClearHeldMovementIfActive(gObjectEvents[gSelectedObjectEvent.index]);
}

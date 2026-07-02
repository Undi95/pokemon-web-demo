/**
 * scrcmd_trainer.ts — logique partagée (voie A) des opcodes trainer-approach
 * `selectapproachingtrainer` / `lockfortrainer` (scrcmd.c:2186-2208).
 *
 * P2.3 aggro dresseurs : ce module porte 1:1 la chaîne de FREEZE d'event_object_lock.c
 * (FreezeForApproachingTrainers / Task_FreezeObjectAndPlayer / IsFreezeObjectAndPlayerFinished)
 * — placée ici (et non dans event_object_lock.ts) car le chantier P2.3 est cantonné à ce
 * fichier ; sémantique identique.
 *
 * `GetCurrentApproachingTrainerObjectEventId` route désormais vers trainer_see.ts (module
 * propriétaire de gApproachingTrainers), via le pont globalThis.__trainerSee (le cycle ESM
 * scrcmd_trainer↔trainer_see est évité — trainer_see n'importe pas ce module).
 */

import {
  gObjectEvents, FreezeObjectEvent, FreezeObjectEventsExceptOne, FreezeObjectEventsExceptTwo,
} from './event_object_movement';
import { PlayerFreeze, StopPlayerAvatar } from './field_player_avatar';
import { IsPlayerStandingStill } from './event_object_lock';
import { CreateTask, DestroyTask } from './task';
import { FuncIsActiveTask, getRuntime } from '../harness/runtime/decomp-globals';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

/** Pont trainer_see (posé par trainer_see.ts au load). */
interface TrainerSeeBridge {
  GetNoOfApproachingTrainers?: () => number;
  GetCurrentApproachingTrainerObjectEventId?: () => number;
  GetChosenApproachingTrainerObjectEventId?: (arrayId: number) => number;
}
function _trainerSee(): TrainerSeeBridge | undefined {
  return (globalThis as { __trainerSee?: TrainerSeeBridge }).__trainerSee;
}

/** 1:1 décomp `gApproachingTrainers[gApproachingTrainerId].objectEventId`
 *  (trainer_see.c:770, GetCurrentApproachingTrainerObjectEventId). Route vers
 *  trainer_see (P2.3) ; 0 avant tout peuplement. */
export function GetCurrentApproachingTrainerObjectEventId(): number {
  return _trainerSee()?.GetCurrentApproachingTrainerObjectEventId?.() ?? 0;
}
/** Compat (ancien setter — inutilisé désormais, trainer_see est source de vérité). */
export function SetCurrentApproachingTrainerObjectEventId(_id: number): void { /* no-op */ }

/** 1:1 décomp `GetChosenApproachingTrainerObjectEventId(arrayId)` (trainer_see.c:784). */
function GetChosenApproachingTrainerObjectEventId(arrayId: number): number {
  return _trainerSee()?.GetChosenApproachingTrainerObjectEventId?.(arrayId) ?? 0;
}
/** 1:1 décomp `gNoOfApproachingTrainers` (trainer_see.c). */
function gNoOfApproachingTrainers(): number {
  return _trainerSee()?.GetNoOfApproachingTrainers?.() ?? 0;
}

/** 1:1 décomp `IsOverworldLinkActive` (overworld.c) : TRUE si Union Room (link
 *  battle). Port web : pas de mode link → toujours FALSE. */
export function IsOverworldLinkActive(): boolean {
  return false;
}

// ─── FreezeForApproachingTrainers chain (1:1 event_object_lock.c:151-204) ──────
// task data[] : tPlayerFrozen=data[0] tObjectFrozen=data[1] tObjectId=data[2]

/** 1:1 décomp `Task_FreezeObjectAndPlayer` (event_object_lock.c:130). Passée
 *  DIRECTEMENT à CreateTask (identité requise par FuncIsActiveTask). */
function Task_FreezeObjectAndPlayer(task: DecompTask): void {
  const objectEventId = task.data[2]; // tObjectId

  if (!task.data[0] /* tPlayerFrozen */ && IsPlayerStandingStill() === true) {
    PlayerFreeze();
    task.data[0] = 1;
  }
  if (!task.data[1] /* tObjectFrozen */ && !gObjectEvents[objectEventId]?.singleMovementActive) {
    FreezeObjectEvent(gObjectEvents[objectEventId]);
    task.data[1] = 1;
  }
  if (task.data[0] && task.data[1]) {
    DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `FreezeForApproachingTrainers(void)` (event_object_lock.c:151). */
function FreezeForApproachingTrainers(): void {
  const trainerObjectId1 = GetChosenApproachingTrainerObjectEventId(0);

  if (gNoOfApproachingTrainers() === 2) {
    // Get second trainer, freeze all other objects
    const trainerObjectId2 = GetChosenApproachingTrainerObjectEventId(1);
    FreezeObjectEventsExceptTwo(trainerObjectId1, trainerObjectId2);

    // Start task to freeze trainer 1 (and player) after movement
    let taskId = CreateTask(Task_FreezeObjectAndPlayer, 80);
    getRuntime().gTasks[taskId].data[2] = trainerObjectId1; // tObjectId
    if (!gObjectEvents[trainerObjectId1]?.singleMovementActive) {
      FreezeObjectEvent(gObjectEvents[trainerObjectId1]);
      getRuntime().gTasks[taskId].data[1] = 1; // tObjectFrozen
    }

    // Start task to freeze trainer 2 after movement
    taskId = CreateTask(Task_FreezeObjectAndPlayer, 81);
    getRuntime().gTasks[taskId].data[2] = trainerObjectId2;
    if (!gObjectEvents[trainerObjectId2]?.singleMovementActive) {
      FreezeObjectEvent(gObjectEvents[trainerObjectId2]);
      getRuntime().gTasks[taskId].data[1] = 1;
    }
  } else {
    FreezeObjectEventsExceptOne(trainerObjectId1);
    const taskId = CreateTask(Task_FreezeObjectAndPlayer, 80);
    getRuntime().gTasks[taskId].data[2] = trainerObjectId1;
    if (!gObjectEvents[trainerObjectId1]?.singleMovementActive) {
      FreezeObjectEvent(gObjectEvents[trainerObjectId1]);
      getRuntime().gTasks[taskId].data[1] = 1;
    }
  }
}

/** 1:1 décomp `IsFreezeObjectAndPlayerFinished(void)` (event_object_lock.c:192). */
function IsFreezeObjectAndPlayerFinished(): boolean {
  if (FuncIsActiveTask(Task_FreezeObjectAndPlayer)) {
    return false;
  } else {
    StopPlayerAvatar();
    return true;
  }
}

/** Logique partagée de `ScrCmd_lockfortrainer` (scrcmd.c:2192-2208), 1:1 :
 *    if (IsOverworldLinkActive()) return FALSE;
 *    if (gObjectEvents[gSelectedObjectEvent].active) {
 *      FreezeForApproachingTrainers();
 *      SetupNativeScript(ctx, IsFreezeObjectAndPlayerFinished);
 *    }
 *    return TRUE;
 *  Retour : `null` → link actif (handler renvoie false) ; sinon le poll
 *  (handler fait SetupNativeScript + renvoie true). Quand le NPC est inactif, le
 *  décomp renvoie TRUE sans native script → on renvoie un poll qui termine
 *  immédiatement (= le script reprend la frame d'après, comportement observable). */
export function doLockForTrainer(selectedIndex: number): (() => boolean) | null {
  if (IsOverworldLinkActive()) return null;
  const npc = gObjectEvents[selectedIndex];
  if (!npc || !npc.active) return () => true; // 1:1 : return TRUE sans native script
  FreezeForApproachingTrainers();
  return IsFreezeObjectAndPlayerFinished;
}

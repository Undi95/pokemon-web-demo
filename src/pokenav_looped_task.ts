// src/pokenav_looped_task.ts — 1:1 décomp `src/pokenav.c` : système LoopedTask (socle Pokénav L1).
//
// Module LEAF : n'importe QUE task.ts + le check link → pas de cycle d'import. Sera importé par
// pokenav.ts (orchestrateur Task_Pokenav) ET par les subscreens Pokénav (qui stubent aujourd'hui
// CreateLoopedTask/IsLoopedTaskActive via __wireTodo = les « sentinelles » à recâbler).
//
// Un « LoopedTask » = une petite state-machine coopérative : à chaque tick la fn reçoit l'état
// courant (data[0]) et renvoie une action LT_* (avancer/pauser/finir/set-state). Task_RunLoopedTask
// est la vraie task moteur qui la pilote.
//
// ── ADAPTATIONS MOTEUR (documentées, le reste est 1:1 strict) ─────────────────
//  1. Le runtime appelle une task func avec l'OBJET task (`t.func(t)`, decomp-runtime.ts:1741),
//     pas avec `taskId`. Donc Task_RunLoopedTask reçoit `task` et en extrait `task.taskId`
//     (au lieu de la signature décomp `(u8 taskId)`). Passée NOMMÉE à CreateTask → stockée par
//     référence (vérifié live : `gTasks[id].func === la fn`) → `.func ===` marche.
//  2. La décomp empile le POINTEUR de la fn `loopedTask` via SetWordTaskArg(taskId,1,(u32)fn),
//     relu par GetWordTaskArg. Côté web une fonction n'est pas un entier → on stocke la vraie fn
//     dans une Map keyée par taskId (même principe que SetTaskFuncWithFollowupFunc runtime).
import { gTasks, CreateTask, DestroyTask } from './task';
import { IsOverworldLinkActive } from './scrcmd_trainer';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

/** 1:1 : signature d'une LoopedTask (reçoit l'état, renvoie une action LT_*). */
export type LoopedTask = (state: number) => number;

// Valeurs de retour des LoopedTask (1:1 include/pokenav.h:58-63).
export const LT_INC_AND_PAUSE = 0;
export const LT_INC_AND_CONTINUE = 1;
export const LT_PAUSE = 2;
export const LT_CONTINUE = 3;
export const LT_FINISH = 4;
/** 1:1 `#define LT_SET_STATE(newState) (newState + 5)` (pokenav.h:63). */
export const LT_SET_STATE = (newState: number): number => newState + 5;

// Macros 1:1 (pokenav.c:11-15).
const LOOPED_TASK_DECODE_STATE = (action: number): number => action - 5;
const LOOPED_TASK_ID = (primary: number, secondary: number): number => (((secondary << 16) | primary) >>> 0);
const LOOPED_TASK_PRIMARY_ID = (taskId: number): number => taskId & 0xFFFF;
const LOOPED_TASK_SECONDARY_ID = (taskId: number): number => taskId >>> 16;

/** 1:1 `NUM_TASKS` : taille de gTasks. */
const NUM_TASKS = 16;

/** 1:1 `EWRAM_DATA u8 gNextLoopedTaskId = 0;` (pokenav.c:206). */
let gNextLoopedTaskId = 0;

/** ADAPTATION 2 : la vraie fn loopedTask, keyée par taskId (≠ pointeur packé dans data[1]). */
const _loopedTaskFns = new Map<number, LoopedTask>();

/** 1:1 `Overworld_IsRecvQueueAtMax()` — file link saturée ; solo = link inactif → jamais. */
function Overworld_IsRecvQueueAtMax(): boolean { return false; }

/** 1:1 décomp `Task_RunLoopedTask(taskId)` (pokenav.c:251). Reçoit l'objet task (adaptation 1). */
export function Task_RunLoopedTask(task: DecompTask): void {
  const taskId = task.taskId;
  const loopedTask = _loopedTaskFns.get(taskId);
  if (!loopedTask) return; // garde moteur : fn absente
  // 1:1 : `bool32 exitLoop = FALSE; while (!exitLoop)` — exitLoop n'est JAMAIS mis à true
  // (vestige décomp) → boucle qui ne sort que par return / DestroyTask.
  for (;;) {
    const action = loopedTask(task.data[0]);
    switch (action) {
      case LT_INC_AND_CONTINUE: task.data[0]++; break;
      case LT_INC_AND_PAUSE: task.data[0]++; return;
      case LT_FINISH: _loopedTaskFns.delete(taskId); DestroyTask(taskId); return;
      case LT_CONTINUE: break;
      case LT_PAUSE: return;
      default: task.data[0] = LOOPED_TASK_DECODE_STATE(action); break; // LT_SET_STATE
    }
  }
}

/** 1:1 décomp `Task_RunLoopedTask_LinkMode` (pokenav.c:284) — chaque « Continue » pause. */
export function Task_RunLoopedTask_LinkMode(task: DecompTask): void {
  if (Overworld_IsRecvQueueAtMax()) return;
  const taskId = task.taskId;
  const loopedTask = _loopedTaskFns.get(taskId);
  if (!loopedTask) return;
  const action = loopedTask(task.data[0]);
  switch (action) {
    case LT_INC_AND_PAUSE:
    case LT_INC_AND_CONTINUE: task.data[0]++; break;
    case LT_FINISH: _loopedTaskFns.delete(taskId); DestroyTask(taskId); break;
    case LT_PAUSE:
    case LT_CONTINUE: break;
    default: task.data[0] = LOOPED_TASK_DECODE_STATE(action); break;
  }
}

/** 1:1 décomp `CreateLoopedTask(loopedTask, priority)` (pokenav.c:210). */
export function CreateLoopedTask(loopedTask: LoopedTask, priority: number): number {
  let taskId: number;
  if (!IsOverworldLinkActive())
    taskId = CreateTask(Task_RunLoopedTask, priority);
  else
    taskId = CreateTask(Task_RunLoopedTask_LinkMode, priority);

  _loopedTaskFns.set(taskId, loopedTask); // ADAPTATION 2 (≠ SetWordTaskArg(taskId, 1, (u32)fn))

  gTasks[taskId].data[3] = gNextLoopedTaskId;
  return LOOPED_TASK_ID(taskId, gNextLoopedTaskId++);
}

/** 1:1 décomp `IsLoopedTaskActive(taskId)` (pokenav.c:225). */
export function IsLoopedTaskActive(taskId: number): boolean {
  const primaryId = LOOPED_TASK_PRIMARY_ID(taskId);
  const secondaryId = LOOPED_TASK_SECONDARY_ID(taskId);
  const t = gTasks[primaryId];
  return !!(t && t.isActive
    && (t.func === Task_RunLoopedTask || t.func === Task_RunLoopedTask_LinkMode)
    && t.data[3] === secondaryId);
}

/** 1:1 décomp `FuncIsActiveLoopedTask(func)` (pokenav.c:238). */
export function FuncIsActiveLoopedTask(func: LoopedTask): boolean {
  for (let i = 0; i < NUM_TASKS; i++) {
    const t = gTasks[i];
    if (t && t.isActive
      && (t.func === Task_RunLoopedTask || t.func === Task_RunLoopedTask_LinkMode)
      && _loopedTaskFns.get(i) === func) // ADAPTATION 2 (≠ GetWordTaskArg(i, 1))
      return true;
  }
  return false;
}

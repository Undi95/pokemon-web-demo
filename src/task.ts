// src/task.ts — foyer 1:1 décomp `src/task.c` (API tâches, no-rt).
// Décyclé depuis decomp-bridge.ts (spine-decycle, Phase G). NB : l'ORDONNANCEUR
// (gTasks, insertion par priorité) vit sur le substrat runtime (DecompRuntime) ;
// ces fonctions sont l'API 1:1-nommée publique (signature décomp sans `rt`), qui
// injecte le runtime via getRuntime(). Le port-1:1 de l'ordonnanceur lui-même
// (liste chaînée task.c vs Map runtime) est un chantier séparé (cf. mémoire).
import { getRuntime } from '../harness/runtime/decomp-globals';
import { runtimeProxy } from '../harness/runtime/runtime-proxy';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

/** 1:1 décomp `gTasks[NUM_TASKS]` (task.c:12) — proxy paresseux vers l'état
 *  runtime (rt.gTasks). Permet au code miroir/transpilé d'écrire
 *  `gTasks[taskId].data[0]` exactement comme la décomp. */
export const gTasks = runtimeProxy<DecompTask[]>('gTasks');

/** 1:1 décomp `src/task.c:27 CreateTask(func, priority)` — alloue un task slot. */
export function CreateTask(func: any, priority: number): number {
  return getRuntime().CreateTask(func, priority);
}

/** 1:1 décomp `src/task.c:84 DestroyTask(taskId)` — free un task slot. */
export function DestroyTask(taskId: number): void {
  getRuntime().DestroyTask(taskId);
}

/** 1:1 décomp `src/task.c:139 SetTaskFuncWithFollowupFunc(taskId, func, followupFunc)`.
 *  Reroute la task vers `func`, en mémorisant `followupFunc` pour un futur
 *  `SwitchTaskToFollowupFunc(taskId)` (impl. dédiée 1:1 sémantique sur le runtime :
 *  pas de cast pointer→s16 cassé). */
export function SetTaskFuncWithFollowupFunc(taskId: number, func: any, followupFunc: any): void {
  getRuntime().SetTaskFuncWithFollowupFunc(taskId, func, followupFunc);
}

/** 1:1 décomp `src/task.c:148 SwitchTaskToFollowupFunc(taskId)`.
 *  Restaure la task vers le `followupFunc` mémorisé. */
export function SwitchTaskToFollowupFunc(taskId: number): void {
  getRuntime().SwitchTaskToFollowupFunc(taskId);
}

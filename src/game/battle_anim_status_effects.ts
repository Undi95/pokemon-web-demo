/**
 * battle_anim_status_effects.ts — miroir PARTIEL de `src/battle_anim_status_effects.c`
 * (décomp pokeemeraude) : le lancement des anims de STATUT (poison/brûlure/
 * sommeil/paralysie/gel/confusion/attraction) depuis les tables bytecode.
 *
 * Porté (goal T3 2026-06-10) :
 *   - LaunchStatusAnimation (:543) + Task_DoStatusAnimation (:554) — la task
 *     TICK gAnimScriptCallback() elle-même (1:1 : les anims de statut ne sont
 *     PAS tickées par le CB2 anim, mais par cette task dédiée).
 *
 * Dettes explicites :
 *   - Le reste du fichier .c (sprites templates des effets, AnimTask_* locales)
 *     = avec le chantier anims de move (T4+, registry createsprite).
 */
import { CreateTask, DestroyTask } from '../engine/system/decomp-bridge';
import {
  LaunchBattleAnimation, isAnimScriptActive, tickAnimScript,
  setBattleAnimAttackerTarget,
} from '../engine/battle/battle-anim-interpreter';
import { setStatusAnimActive } from '../engine/battle/battle-sprites-data';

/** 1:1 décomp `LaunchStatusAnimation(battler, statusAnimId)`
 *  (battle_anim_status_effects.c:543-553). */
export function LaunchStatusAnimation(battler: number, statusAnimId: number): void {
  setBattleAnimAttackerTarget(battler, battler);
  LaunchBattleAnimation('gBattleAnims_StatusConditions', statusAnimId, false);
  const taskId = CreateTask(Task_DoStatusAnimation, 10);
  const t = (globalThis as { __rt?: { gTasks?: Map<number, { data: number[] }> } }).__rt?.gTasks?.get(taskId);
  if (t) t.data[0] = battler;
}

/** 1:1 décomp `Task_DoStatusAnimation(taskId)` (:554-562). */
function Task_DoStatusAnimation(task: { data: number[]; taskId: number }): void {
  tickAnimScript();
  if (!isAnimScriptActive()) {
    setStatusAnimActive(task.data[0], false);
    DestroyTask(task.taskId);
  }
}

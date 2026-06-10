/**
 * battle_anim_sound_tasks.ts — miroir PARTIEL de `src/battle_anim_sound_tasks.c`
 * (décomp pokeemeraude), goal T4 2026-06-11 : les SoundTasks de GROWL.
 *
 * Porté (net-effect — infra CRIS sensible, pattern __playCry validé) :
 *   - SoundTask_PlayDoubleCry : cri du battler (args[0]=ANIM_ATTACKER/TARGET,
 *     args[1]=DOUBLE_CRY_GROWL) x2 (le 2e a ~+20 frames) puis destroy.
 *   - SoundTask_WaitForCry : ~30 frames (net : IsCryFinished) puis destroy.
 */
import { registerAnimTasks } from '../engine/battle/battle-anim-registry';

type AnimTask = { taskId: number; data: number[]; func?: (t: AnimTask) => void };

function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _playCryOf(battler: number): void {
  const bs = (globalThis as Record<string, unknown>).__battleState as { gBattleMons?: Array<{ species?: number }> } | undefined;
  const species = bs?.gBattleMons?.[battler]?.species;
  const playCry = (globalThis as Record<string, unknown>).__playCry as ((sp: number, pan?: number) => void) | undefined;
  if (species && playCry) playCry(species);
}

function SoundTask_PlayDoubleCry(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 0];
  const battler = args[0] === 1 ? (_itf().getTarget?.() ?? 1) : (_itf().getAttacker?.() ?? 0);
  task.data[0] = battler;
  task.data[7] = 0;
  _playCryOf(battler);
  task.func = _DoubleCry_Step;
}
function _DoubleCry_Step(task: AnimTask): void {
  task.data[7]++;
  if (task.data[7] === 20) _playCryOf(task.data[0]);
  if (task.data[7] >= 24) _itf().DestroyAnimVisualTask?.(task.taskId);
}

function SoundTask_WaitForCry(task: AnimTask): void {
  task.data[7] = (task.data[7] ?? 0) + 1;
  if (task.data[7] >= 30) _itf().DestroyAnimVisualTask?.(task.taskId);
}

registerAnimTasks({
  SoundTask_PlayDoubleCry: SoundTask_PlayDoubleCry as never,
  SoundTask_WaitForCry: SoundTask_WaitForCry as never,
});

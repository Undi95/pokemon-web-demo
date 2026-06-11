/**
 * battle_anim_utility_funcs.ts — miroir PARTIEL de `src/battle_anim_utility_funcs.c`
 * (décomp pokeemeraude), vague 2e 2026-06-11.
 * AnimTask_BlendBattleAnimPal 1:1 — LE géant du top createvisualtask
 * (89 usages dans les scripts : tous les flashs/teintes de palettes).
 * Chaîne : UnpackSelectedBattlePalettes + GetBattleMonSpritePalettesMask →
 * StartBlendAnimSpriteColor → Step2 (BlendPalette par palette du masque,
 * blend start→target par pas de 1 tous les delay frames).
 */
import { registerAnimTasks } from '../engine/battle/battle-anim-registry';
import { BlendPalette } from '../engine/system/decomp-globals';

type AnimTask = { taskId: number; data: number[]; func?: (t: AnimTask) => void };
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 `GetBattlePalettesMask` (battle_anim_mons.c) — single battle (pas de
 *  partners visibles ; anim1/anim2 = palettes d'anim chargées, net : skip). */
function GetBattlePalettesMask(bg: boolean, attacker: boolean, target: boolean, atkPartner: boolean, tgtPartner: boolean, _anim1: boolean, _anim2: boolean): number {
  let sel = 0;
  const atk = _itf().getAttacker?.() ?? 0;
  const tgt = _itf().getTarget?.() ?? 1;
  if (bg) sel = 0xE; // palettes BG 1, 2, 3 (1:1 non-contest)
  if (attacker) sel |= 1 << (atk + 16);
  if (target) sel |= 1 << (tgt + 16);
  void atkPartner; void tgtPartner; // doubles non exercés (hors-scope single)
  return sel >>> 0;
}

/** 1:1 `UnpackSelectedBattlePalettes` (battle_anim_mons.c). */
function UnpackSelectedBattlePalettes(selector: number): number {
  return GetBattlePalettesMask(
    !!(selector & 1), !!((selector >> 1) & 1), !!((selector >> 2) & 1),
    !!((selector >> 3) & 1), !!((selector >> 4) & 1),
    !!((selector >> 5) & 1), !!((selector >> 6) & 1),
  );
}

/** 1:1 `AnimTask_BlendBattleAnimPal` (utility_funcs.c:48) : args
 *  [masque, delay, startBlend, targetBlend, couleur RGB15]. */
function AnimTask_BlendBattleAnimPal(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [1, 1, 0, 4, 0];
  let selected = UnpackSelectedBattlePalettes(args[0] | 0);
  selected |= GetBattlePalettesMask(false,
    !!((args[0] >> 7) & 1), !!((args[0] >> 8) & 1),
    !!((args[0] >> 9) & 1), !!((args[0] >> 10) & 1), false, false);
  _StartBlendAnimSpriteColor(task, selected >>> 0);
}

/** 1:1 `StartBlendAnimSpriteColor` : data[0..1]=masque, [2]=delay, [4]=target,
 *  [5]=couleur, [10]=blend courant (start). */
function _StartBlendAnimSpriteColor(task: AnimTask, selectedPalettes: number): void {
  const args = _itf().getArgs?.() ?? [0, 1, 0, 4, 0];
  task.data[0] = selectedPalettes & 0xFFFF;
  task.data[1] = (selectedPalettes >>> 16) & 0xFFFF;
  task.data[2] = args[1] | 0;  // delay
  task.data[4] = args[3] | 0;  // target blend
  task.data[5] = args[4] | 0;  // couleur RGB15
  task.data[9] = 0;            // delay counter
  task.data[10] = args[2] | 0; // blend courant
  task.func = _BlendSpriteColor_Step2;
  _BlendSpriteColor_Step2(task);
}

/** 1:1 `AnimTask_BlendSpriteColor_Step2`. */
function _BlendSpriteColor_Step2(task: AnimTask): void {
  if (task.data[9] === task.data[2]) {
    task.data[9] = 0;
    let selected = (task.data[0] | (task.data[1] << 16)) >>> 0;
    let palOffset = 0;
    while (selected !== 0) {
      if (selected & 1) BlendPalette(palOffset, 16, task.data[10], task.data[5]);
      palOffset += 16;
      selected >>>= 1;
    }
    if (task.data[10] < task.data[4]) task.data[10]++;
    else if (task.data[10] > task.data[4]) task.data[10]--;
    else _itf().DestroyAnimVisualTask?.(task.taskId);
  } else {
    task.data[9]++;
  }
}

registerAnimTasks({
  AnimTask_BlendBattleAnimPal: AnimTask_BlendBattleAnimPal as never,
});

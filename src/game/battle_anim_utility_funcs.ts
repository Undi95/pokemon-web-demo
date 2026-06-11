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
  // CLAMP 0..16 (1:1 : le C borne le coeff en u8 — un target hors-borne
  // (script a layout variant) rendait la condition === inatteignable ->
  // task zombie infinie -> cascade garde-fou sur les moves suivants).
  task.data[4] = Math.min(Math.max(args[3] | 0, 0), 16);  // target blend
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

/** 1:1 `AnimTask_BlendColorCycle` (battle_anim_normal.c:447 — placement noté
 *  dette douce : l'infra blend vit ici). args (selector, delay, numBlends,
 *  initialY, targetY, color). Cycle aller-retour ×numBlends via BlendPalette
 *  progressif (net-effect de BeginNormalPaletteFade). 13+12 usages. */
function AnimTask_BlendColorCycle(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [1, 0, 2, 0, 14, 0];
  task.data[0] = args[0];  // selector
  task.data[1] = args[1];  // delay
  task.data[2] = args[2];  // numBlends
  task.data[3] = Math.min(Math.max(args[3] | 0, 0), 16);  // initialY (clamp 0..16)
  task.data[4] = Math.min(Math.max(args[4] | 0, 0), 16);  // targetY (clamp 0..16)
  task.data[5] = args[5];  // color
  task.data[6] = 0;        // restoreBlend
  task.data[10] = task.data[3]; // blend courant
  task.data[9] = 0;        // delay counter
  task.func = _BlendColorCycle_Step;
}
function _BlendColorCycle_Step(task: AnimTask): void {
  if (task.data[9] < task.data[1]) { task.data[9]++; return; }
  task.data[9] = 0;
  const target = !task.data[6] ? task.data[4] : (task.data[2] === 1 ? 0 : task.data[3]);
  // appliquer le blend courant sur le masque
  let selected = UnpackSelectedBattlePalettes(task.data[0]) >>> 0;
  let palOffset = 0;
  while (selected !== 0) {
    if (selected & 1) BlendPalette(palOffset, 16, task.data[10], task.data[5]);
    palOffset += 16;
    selected >>>= 1;
  }
  if (task.data[10] < target) task.data[10]++;
  else if (task.data[10] > target) task.data[10]--;
  else {
    // palier atteint : inverser ou finir
    task.data[6] ^= 1;
    if (task.data[6] === 0) {
      // un cycle complet (aller-retour) fini
      if (--task.data[2] <= 0) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
    }
  }
}
/** 1:1 `AnimTask_BlendBattleAnimPalExclude` (utility_funcs.c) — net : comme
 *  BlendBattleAnimPal mais exclut attaquant/cible du masque (les anims qui
 *  teintent TOUT sauf les mons). */
function AnimTask_BlendBattleAnimPalExclude(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 1, 0, 4, 0];
  // selector 0/1 → bg+fond sans mons (net) : masque BG 0-3
  let selected = UnpackSelectedBattlePalettes(args[0] | 0) >>> 0;
  // retirer les palettes OBJ des battlers (slots 16+battler)
  const itf2 = _itf();
  const atk = (itf2.getAttacker?.() ?? 0) as number;
  const tgt = (itf2.getTarget?.() ?? 1) as number;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { oamIndex: number }>; gba?: { oam: Array<{ paletteNum: number }> } } | undefined;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  for (const b of [atk, tgt]) {
    const sid = co?.getBattlerMonSpriteId?.(b);
    const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.get(sid) : undefined;
    const pal = sp ? rt?.gba?.oam[sp.oamIndex]?.paletteNum : undefined;
    if (pal !== undefined) selected &= ~(1 << (16 + pal));
  }
  _StartBlendAnimSpriteColor(task, selected >>> 0);
}

/** 1:1 `AnimTask_StartSlidingBg` (utility_funcs.c, 9 hits sweep) : scroll BG3
 *  fixed-point 8.8 continu, stoppé quand args[7] == data[3] (le sentinel
 *  `setarg 7, 0xFFFF` des scripts). UpdateAnimBg3ScreenSize = net no-op
 *  (le wrap 256 suffit à notre compositor — dette douce si visuel 512). */
function AnimTask_StartSlidingBg(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [];
  const rt = (globalThis as Record<string, unknown>).__rt as { CreateTask?: (fn: unknown, p: number) => number; gTasks?: Map<number, { data: number[] }> } | undefined;
  const newTaskId = rt?.CreateTask?.(_UpdateSlidingBg, 5) ?? -1;
  const atk = (_itf().getAttacker?.() ?? 0) as number;
  if (args[2] && (atk & 1) !== 0) { args[0] = -args[0]; args[1] = -args[1]; }
  const nt = newTaskId >= 0 ? rt?.gTasks?.get(newTaskId) : undefined;
  if (nt) {
    nt.data[1] = args[0];
    nt.data[2] = args[1];
    nt.data[3] = args[3];
    nt.data[0]++;
  }
  _itf().DestroyAnimVisualTask?.(task.taskId);
}
function _UpdateSlidingBg(task: AnimTask): void {
  const g = globalThis as Record<string, unknown>;
  task.data[10] += task.data[1];
  task.data[11] += task.data[2];
  g.gBattle_BG3_X = (((g.gBattle_BG3_X as number) ?? 0) + (task.data[10] >> 8)) & 0xFFFF;
  g.gBattle_BG3_Y = (((g.gBattle_BG3_Y as number) ?? 0) + (task.data[11] >> 8)) & 0xFFFF;
  task.data[10] &= 0xFF;
  task.data[11] &= 0xFF;
  const args = _itf().getArgs?.() ?? [];
  if ((args[7] & 0xFFFF) === (task.data[3] & 0xFFFF)) {
    g.gBattle_BG3_X = 0;
    g.gBattle_BG3_Y = 0;
    const rt = (globalThis as Record<string, unknown>).__rt as { DestroyTask?: (id: number) => void } | undefined;
    rt?.DestroyTask?.(task.taskId);
  }
}

/** 1:1 `AnimTask_TraceMonBlended` (utility_funcs.c, 7 hits — afterimages) :
 *  spawn data[4] clones blend, un toutes data[2] frames, vie data[3] frames. */
function AnimTask_TraceMonBlended(task: AnimTask): void {
  const a = _itf().getArgs?.() ?? [];
  task.data[0] = a[0];
  task.data[1] = 0;
  task.data[2] = a[1];
  task.data[3] = a[2];
  task.data[4] = a[3];
  task.data[5] = 0;
  task.func = _TraceMonBlended_Step;
}
function _TraceMonBlended_Step(task: AnimTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { data: number[]; callback: unknown; oamIndex: number }>; gba?: { oam: Array<{ priority: number }> } } | undefined;
  if (task.data[4]) {
    if (task.data[1]) {
      task.data[1]--;
    } else {
      const cloneId = _ufClone(task.data[0]);
      if (cloneId >= 0) {
        const c = rt?.gSprites?.get(cloneId);
        const oam = c ? rt?.gba?.oam[c.oamIndex] : undefined;
        if (oam) oam.priority = task.data[0] ? 1 : 2;
        if (c) {
          c.data = c.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
          c.data[0] = task.data[3];
          c.data[1] = task.taskId;
          c.data[2] = 5;
          c.callback = _AnimMonTrace;
        }
        task.data[5]++;
      }
      task.data[4]--;
      task.data[1] = task.data[2];
    }
  } else if (task.data[5] === 0) {
    _itf().DestroyAnimVisualTask?.(task.taskId);
  }
}
function _AnimMonTrace(sprite: { data: number[] }): void {
  if (sprite.data[0]) {
    sprite.data[0]--;
  } else {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
    const t = rt?.gTasks?.get(sprite.data[1]);
    if (t) t.data[sprite.data[2]]--;
    _ufDestroyActive(sprite);
  }
}
import { CloneBattlerSpriteWithBlend as _ufClone, DestroySpriteWithActiveSheet as _ufDestroyActive } from './battle_anim_mons';

registerAnimTasks({
  AnimTask_TraceMonBlended: AnimTask_TraceMonBlended as never,
  AnimTask_StartSlidingBg: AnimTask_StartSlidingBg as never,
  AnimTask_BlendBattleAnimPal: AnimTask_BlendBattleAnimPal as never,
  AnimTask_BlendColorCycle: AnimTask_BlendColorCycle as never,
  AnimTask_BlendBattleAnimPalExclude: AnimTask_BlendBattleAnimPalExclude as never,
});

// ─── VAGUE F1 : les booléens de branchement (ARG_RET_ID=7) ──────────────────
// Les scripts font `createvisualtask AnimTask_X` puis `jumpargeq 7, N, label` —
// sans ces tasks, les branches étaient aléatoires (args[7] périmé).
function _ufItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
/** 1:1 `AnimTask_GetAttackerSide` (utility_funcs.c:780). */
function AnimTask_GetAttackerSide(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = (itf.getAttacker?.() ?? 0) & 1; // GetBattlerSide
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_IsContest` (utility_funcs.c:1039) — jamais contest chez nous. */
function AnimTask_IsContest(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = 0;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_IsTargetSameSide` (utility_funcs.c:1056). */
function AnimTask_IsTargetSameSide(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = (((itf.getAttacker?.() ?? 0) & 1) === ((itf.getTarget?.() ?? 1) & 1)) ? 1 : 0;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _ufRegTasks } from '../engine/battle/battle-anim-registry';
_ufRegTasks({
  AnimTask_GetAttackerSide: AnimTask_GetAttackerSide as never,
  AnimTask_IsContest: AnimTask_IsContest as never,
  AnimTask_IsTargetSameSide: AnimTask_IsTargetSameSide as never,
});

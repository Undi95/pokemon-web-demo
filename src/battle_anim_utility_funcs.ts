/**
 * battle_anim_utility_funcs.ts — miroir PARTIEL de `src/battle_anim_utility_funcs.c`
 * (décomp pokeemeraude), vague 2e 2026-06-11.
 * AnimTask_BlendBattleAnimPal 1:1 — LE géant du top createvisualtask
 * (89 usages dans les scripts : tous les flashs/teintes de palettes).
 * Chaîne : UnpackSelectedBattlePalettes + GetBattleMonSpritePalettesMask →
 * StartBlendAnimSpriteColor → Step2 (BlendPalette par palette du masque,
 * blend start→target par pas de 1 tous les delay frames).
 */
import { registerAnimTasks } from './engine/battle/battle-anim-registry';
import { DestroySprite } from './sprite';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { BlendPalette } from '../harness/runtime/decomp-globals';

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

/** 1:1 `AnimTask_BlendBattleAnimPal` (battle_anim_utility_funcs.c.c:48) : args
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
    // 1:1 AnimTask_BlendColorCycleLoop (battle_anim_normal.c:476) : un palier
    // atteint = UN BlendColorCycle fini (= 1 BeginNormalPaletteFade). tNumBlends
    // compte les DEMI-blends, PAS les allers-retours : Mist numBlends=2 →
    // fade 0→14 PUIS 14→0 = 2 demi-cycles. (Bug : l'ancien `if (data[6]===0)`
    // ne décrémentait qu'aux paliers PAIRS → 4 demi-cycles = 2× trop long, le
    // mon brillait des secondes après la fin des nuages, désync signalé user.)
    if (--task.data[2] <= 0) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
    task.data[6] ^= 1;
  }
}
/** 1:1 `AnimTask_BlendBattleAnimPalExclude` (battle_anim_utility_funcs.c.c) — net : comme
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
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ oamIndex: number } | undefined>; gba?: { oam: Array<{ paletteBank: number }> } } | undefined;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  for (const b of [atk, tgt]) {
    const sid = co?.getBattlerMonSpriteId?.(b);
    const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
    const pal = sp ? rt?.gba?.oam[sp.oamIndex]?.paletteBank : undefined;
    if (pal !== undefined) selected &= ~(1 << (16 + pal));
  }
  _StartBlendAnimSpriteColor(task, selected >>> 0);
}

/** 1:1 `AnimTask_StartSlidingBg` (battle_anim_utility_funcs.c.c, 9 hits sweep) : scroll BG3
 *  fixed-point 8.8 continu, stoppé quand args[7] == data[3] (le sentinel
 *  `setarg 7, 0xFFFF` des scripts). UpdateAnimBg3ScreenSize = net no-op
 *  (le wrap 256 suffit à notre compositor — dette douce si visuel 512). */
function AnimTask_StartSlidingBg(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [];
  const rt = (globalThis as Record<string, unknown>).__rt as { CreateTask?: (fn: unknown, p: number) => number; gTasks?: Map<number, { data: number[] }> } | undefined;
  const newTaskId = rt?.CreateTask?.(AnimTask_UpdateSlidingBg, 5) ?? -1;
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
function AnimTask_UpdateSlidingBg(task: AnimTask): void {
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

/** 1:1 `AnimTask_TraceMonBlended` (battle_anim_utility_funcs.c.c, 7 hits — afterimages) :
 *  spawn data[4] clones blend, un toutes data[2] frames, vie data[3] frames. */
function AnimTask_TraceMonBlended(task: AnimTask): void {
  const a = _itf().getArgs?.() ?? [];
  task.data[0] = a[0];
  task.data[1] = 0;
  task.data[2] = a[1];
  task.data[3] = a[2];
  task.data[4] = a[3];
  task.data[5] = 0;
  task.func = AnimTask_TraceMonBlended_Step;
}
function AnimTask_TraceMonBlended_Step(task: AnimTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number } | undefined>; gba?: { oam: Array<{ priority: number }> } } | undefined;
  if (task.data[4]) {
    if (task.data[1]) {
      task.data[1]--;
    } else {
      const cloneId = _ufClone(task.data[0]);
      if (cloneId >= 0) {
        const c = rt?.gSprites?.[cloneId];
        const oam = c ? rt?.gba?.oam[c.oamIndex] : undefined;
        if (oam) oam.priority = task.data[0] ? 1 : 2;
        if (c) {
          c.data = c.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
          c.data[0] = task.data[3];
          c.data[1] = task.taskId;
          c.data[2] = 5;
          c.callback = AnimMonTrace;
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
function AnimMonTrace(sprite: { data: number[] }): void {
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
/** 1:1 `AnimTask_GetAttackerSide` (battle_anim_utility_funcs.c.c:780). */
function AnimTask_GetAttackerSide(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = (itf.getAttacker?.() ?? 0) & 1; // GetBattlerSide
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_IsContest` (battle_anim_utility_funcs.c.c:1039) — jamais contest chez nous. */
function AnimTask_IsContest(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = 0;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_IsTargetSameSide` (battle_anim_utility_funcs.c.c:1056). */
function AnimTask_IsTargetSameSide(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = (((itf.getAttacker?.() ?? 0) & 1) === ((itf.getTarget?.() ?? 1) & 1)) ? 1 : 0;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _ufRegTasks } from './engine/battle/battle-anim-registry';
/** 1:1 `AnimTask_GetTargetSide` : args[7] = side de la cible. */
function AnimTask_GetTargetSide(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = (itf.getTarget?.() ?? 1) & 1;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_GetTargetIsAttackerPartner` : single → toujours 0. */
function AnimTask_GetTargetIsAttackerPartner(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  if (args) args[7] = 0;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_GetBattleEnvironment` : args[0] = gBattleEnvironment. */
function AnimTask_GetBattleEnvironment(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  const env = ((globalThis as Record<string, unknown>).__battleState as { gBattleEnvironment?: number } | undefined)?.gBattleEnvironment
    ?? ((globalThis as Record<string, unknown>).__forceBattleEnvironment as number | undefined) ?? 0;
  if (args) args[0] = env;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_GetWeather` (battle_anim_effects_3.c.c:5497 — placement net ici) :
 *  args[7] = ANIM_WEATHER_* depuis gWeatherMoveAnim. */
function AnimTask_GetWeather(task: { taskId: number }): void {
  const itf = _ufItf();
  const args = itf.getArgs?.();
  const w = ((globalThis as Record<string, unknown>).__gWeatherMoveAnim as number) ?? 0;
  let r = 0; // NONE
  if (w & 0x60) r = 1;        // SUN (B_WEATHER_SUN)
  else if (w & 0x6) r = 2;    // RAIN
  else if (w & 0x18) r = 3;   // SANDSTORM? (net mapping)
  else if (w & 0x80) r = 4;   // HAIL
  if (args) args[7] = r;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_SetAttackerInvisibleWaitForSignal` (utility:1079, 2 hits) :
 *  task de FOND (vtc--) qui cache l attaquant jusqu au signal args[7]==0x1000. */
function AnimTask_SetAttackerInvisibleWaitForSignal(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _ufItf() as { getAttacker?: () => number; decVisualTaskCount?: () => void };
  const attacker = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(attacker) ?? 0xFF;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ invisible?: boolean } | undefined> } | undefined;
  const sp = sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
  if (!sp) { (_ufItf() as { DestroyAnimVisualTask?: (id: number) => void }).DestroyAnimVisualTask?.(task.taskId); return; }
  // 1:1 .c:1087 : data[0] = battlerData[attacker].invisible — le FLAG LOGIQUE
  // (PAS sprite->invisible !). Bug Rayquaza-disparaît-après-ExtremeSpeed
  // (user 2026-06-12) : on sauvait sprite.invisible (TRUE à cet instant, posé
  // par AttackerStretchAndDisappear) → quand cette task fantôme tirait enfin
  // (un ret-task pose args[7]=0x1000 par hasard, quirk vanilla : le script
  // envoie 0xFFFF qui ne matche jamais), elle « restaurait » INVISIBLE et
  // écrasait le invisible=false du Reappear. Le .c sauve battlerData (false,
  // jamais touché par l'anim) → restauration toujours inoffensive.
  const sd = (globalThis as Record<string, unknown>).__battleSpritesData as {
    isBattlerDataInvisible?: (b: number) => boolean; setBattlerDataInvisible?: (b: number, v: boolean) => void;
  } | undefined;
  task.data[0] = sd?.isBattlerDataInvisible?.(attacker) ? 1 : 0;
  task.data[14] = attacker;
  task.data[15] = sid;
  // 1:1 .c:1088 : battlerData.invisible = TRUE (+ le sprite pour l'effet
  // immédiat — notre rendu lit le sprite ; le .c synchronise via
  // CopyBattleSpriteInvisibility ailleurs).
  sd?.setBattlerDataInvisible?.(attacker, true);
  sp.invisible = true;
  (itf as { decVisualTaskCount?: () => void }).decVisualTaskCount?.();
  task.func = AnimTask_WaitAndRestoreVisibility;
}
function AnimTask_WaitAndRestoreVisibility(task: { taskId: number; data: number[] }): void {
  const args = _ufItf().getArgs?.() ?? [];
  if (args[7] === 0x1000) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ invisible?: boolean } | undefined>; DestroyTask?: (id: number) => void } | undefined;
    const sd = (globalThis as Record<string, unknown>).__battleSpritesData as {
      setBattlerDataInvisible?: (b: number, v: boolean) => void;
    } | undefined;
    const restored = (task.data[0] & 1) === 1;
    // 1:1 .c:1098 : battlerData.invisible = data[0] & 1 (+ miroir sprite).
    sd?.setBattlerDataInvisible?.(task.data[14], restored);
    const sp = rt?.gSprites?.[task.data[15]];
    if (sp) sp.invisible = restored;
    rt?.DestroyTask?.(task.taskId);
  }
}
/** 1:1 `AnimTask_SetCamouflageBlend` (utility:109, 2 hits) : la couleur du
 *  TERRAIN (gBattleEnvironment) injectée en args[4] puis blend standard. */
const _camouflageColors: Record<number, number> = {
  0: 12 | (24 << 5) | (2 << 10),   // GRASS
  1: 0 | (15 << 5) | (2 << 10),    // LONG_GRASS
  2: 30 | (24 << 5) | (11 << 10),  // SAND
  3: 0 | (0 << 5) | (18 << 10),    // UNDERWATER
  4: 11 | (22 << 5) | (31 << 10),  // WATER
  5: 11 | (22 << 5) | (31 << 10),  // POND (1:1 même RGB que WATER)
  6: 22 | (16 << 5) | (10 << 10),  // MOUNTAIN
  7: 14 | (9 << 5) | (3 << 10),    // CAVE
  8: 0x7FFF,                        // BUILDING
  9: 0x7FFF,                        // PLAIN
};
function AnimTask_SetCamouflageBlend(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [];
  const env = ((globalThis as Record<string, unknown>).__battleState as { gBattleEnvironment?: number } | undefined)?.gBattleEnvironment
    ?? ((globalThis as Record<string, unknown>).__forceBattleEnvironment as number | undefined) ?? 0;
  args[4] = _camouflageColors[env] ?? 0x7FFF;
  const selected = UnpackSelectedBattlePalettes(args[0] | 0) >>> 0;
  _StartBlendAnimSpriteColor(task, selected);
}
/** 1:1 `AnimTask_BlendParticle` (utility:149, 4 hits) : blend la palette OBJ
 *  du TAG donné (args[0] = ANIM_TAG). */
function AnimTask_BlendParticle(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [];
  const sp = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  const palIdx = sp?.IndexOfSpritePaletteTag?.(args[0] | 0) ?? 0xFF;
  if (palIdx === 0xFF) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
  // ATTENTION layout : BlendParticle utilise args[1..4]=(delay,start,target,
  // color) MAIS _StartBlendAnimSpriteColor lit args[1..4] pareil ✓ 1:1.
  _StartBlendAnimSpriteColor(task, (1 << (palIdx + 16)) >>> 0);
}
/** 1:1 `AnimTask_HardwarePaletteFade` (utility:199, 4 hits) : délégué au
 *  helper HW-fade de l interpreter (déjà 1:1 pour Task_FadeToBg). */
function AnimTask_HardwarePaletteFade(task: AnimTask): void {
  const itf = _itf() as { beginHardwarePaletteFade?: (b: number, d: number, y: number, t: number, r: number) => void; paletteFadeActive?: () => boolean; DestroyAnimVisualTask?: (id: number) => void };
  const a = _itf().getArgs?.() ?? [];
  itf.beginHardwarePaletteFade?.(a[0], a[1], a[2], a[3], a[4]);
  task.func = _HWFade_Step;
}
function _HWFade_Step(task: AnimTask): void {
  const itf = _itf() as { paletteFadeActive?: () => boolean; DestroyAnimVisualTask?: (id: number) => void };
  if (!itf.paletteFadeActive?.()) itf.DestroyAnimVisualTask?.(task.taskId);
}
_ufRegTasks({
  AnimTask_SetCamouflageBlend: AnimTask_SetCamouflageBlend as never,
  AnimTask_BlendParticle: AnimTask_BlendParticle as never,
  AnimTask_HardwarePaletteFade: AnimTask_HardwarePaletteFade as never,
  AnimTask_SetAttackerInvisibleWaitForSignal: AnimTask_SetAttackerInvisibleWaitForSignal as never,
  AnimTask_GetTargetSide: AnimTask_GetTargetSide as never,
  AnimTask_GetTargetIsAttackerPartner: AnimTask_GetTargetIsAttackerPartner as never,
  AnimTask_GetBattleEnvironment: AnimTask_GetBattleEnvironment as never,
  AnimTask_GetWeather: AnimTask_GetWeather as never,
  AnimTask_GetAttackerSide: AnimTask_GetAttackerSide as never,
  AnimTask_IsContest: AnimTask_IsContest as never,
  AnimTask_IsTargetSameSide: AnimTask_IsTargetSameSide as never,
});

// ─── VAGUE F40 : SetPalettesToColor + AnimTask_Flash (battle_anim_utility_funcs.c.c:649-723) ─
// Flash : mons → NOIR, fond → BLANC une fraction de seconde, puis re-blend
// progressif 16→0 vers les couleurs normales (BlendPalette).
import { gSineTable as _flUnused } from './trig'; // (aucun usage — garde l'ordre des imports stable)
void _flUnused;

function _flMons(): {
  GetBattlePalettesMask?: (a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean) => number;
  GetBattleMonSpritePalettesMask?: (a: number, b: number, c: number, d: number) => number;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimMons as never) ?? {};
}
function _flItf(): { DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _flPf(): { set?: (i: number, v: number) => void } | undefined {
  return ((globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { set?: (i: number, v: number) => void } } | undefined)?.gPlttBufferFaded;
}
/** 1:1 `SetPalettesToColor` (battle_anim_utility_funcs.c.c:704) : bits 0-15 = BG, 16-31 = OBJ. */
function _SetPalettesToColor(selectedPalettes: number, color: number): void {
  const pf = _flPf();
  if (!pf?.set) return;
  let sel = selectedPalettes >>> 0;
  for (let i = 0; i < 32; i++) {
    if (sel & 1) {
      const base = i * 16; // PLTT_ID(i) : i<16 = BG, i>=16 = OBJ (256+)
      for (let k = 0; k < 16; k++) pf.set(base + k, color);
    }
    sel >>>= 1;
  }
}
const _FL_RGB_BLACK = 0;
const _FL_RGB_WHITEALPHA = 0xFFFF; // RGB_WHITEALPHA (bit 15 posé, 1:1)

/** 1:1 `AnimTask_Flash` (battle_anim_utility_funcs.c.c:649). */
function AnimTask_Flash(task: { taskId: number; data: number[]; func?: unknown }): void {
  const m = _flMons();
  let selected = (m.GetBattleMonSpritePalettesMask?.(1, 1, 1, 1) ?? 0) >>> 0;
  _SetPalettesToColor(selected, _FL_RGB_BLACK);
  task.data[14] = selected >>> 16;

  selected = ((m.GetBattlePalettesMask?.(true, false, false, false, false, false, false) ?? 0) & 0xFFFF) >>> 0;
  _SetPalettesToColor(selected, _FL_RGB_WHITEALPHA);
  task.data[15] = selected;

  task.data[0] = 0;
  task.data[1] = 0;
  task.func = _Flash_Step;
}
/** 1:1 `AnimTask_Flash_Step` (battle_anim_utility_funcs.c.c:664). */
function _Flash_Step(task: { taskId: number; data: number[] }): void {
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 6) {
        task.data[1] = 0;
        task.data[2] = 16;
        task.data[0]++;
      }
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        task.data[2]--;
        for (let i = 0; i < 16; i++) {
          if ((task.data[15] >> i) & 1) BlendPalette(i * 16, 16, task.data[2], 0xFFFF);
          if ((task.data[14] >> i) & 1) BlendPalette(256 + i * 16, 16, task.data[2], 0);
        }
        if (task.data[2] === 0) task.data[0]++;
      }
      break;
    case 2:
      _flItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
registerAnimTasks({ AnimTask_Flash: AnimTask_Flash as never });

// ─── VAGUE F40b : AnimTask_BlendNonAttackerPalettes (battle_anim_utility_funcs.c.c:725) ────
/** 1:1 : mask de TOUS les battlers ≠ attaquant (bits 16+), args décalés
 *  [1..5]=[0..4], puis StartBlendAnimSpriteColor (déjà porté). */
function AnimTask_BlendNonAttackerPalettes(task: AnimTask): void {
  const itf = _itf() as { getAttacker?: () => number; getArgs?: () => number[] };
  const attacker = itf.getAttacker?.() ?? 0;
  let selectedPalettes = 0;
  for (let battler = 0; battler < 4; battler++) {
    if (attacker !== battler) selectedPalettes |= 1 << (battler + 16);
  }
  const args = itf.getArgs?.();
  if (args) for (let j = 5; j !== 0; j--) args[j] = args[j - 1];
  _StartBlendAnimSpriteColor(task, selectedPalettes >>> 0);
}
registerAnimTasks({ AnimTask_BlendNonAttackerPalettes: AnimTask_BlendNonAttackerPalettes as never });

// ─── VAGUE F40c : AnimTask_SetAllNonAttackersInvisiblity (battle_anim_utility_funcs.c.c:799) ─
/** 1:1 : invisible = args[0] pour tous les battlers ≠ attaquant visibles. */
function AnimTask_SetAllNonAttackersInvisiblity(task: AnimTask): void {
  const itf = _itf() as { getAttacker?: () => number; getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const attacker = itf.getAttacker?.() ?? 0;
  const args = itf.getArgs?.() ?? [0];
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ invisible?: boolean; inUse?: boolean } | undefined> } | undefined;
  for (let battler = 0; battler < 4; battler++) {
    if (battler === attacker) continue;
    const sid = co?.getBattlerMonSpriteId?.(battler);
    if (sid === undefined || sid === 0xFF) continue;
    const sp = rt?.gSprites?.[sid];
    if (sp && sp.inUse !== false) sp.invisible = !!args[0];
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
registerAnimTasks({ AnimTask_SetAllNonAttackersInvisiblity: AnimTask_SetAllNonAttackersInvisiblity as never });

// ─── VAGUE F41 : le PAL-BUFFER (battle_anim_utility_funcs.c.c:946-1037, 5 tasks) ──────────
// gMonSpritesGfxPtr->buffer = zone de sauvegarde de palettes pendant une anim
// (Memento/SkillSwap/Conversion…). Side-buffer module 1:1-net (0x2000 bytes).
let _palBackup: Uint16Array | null = null;
function _pbIndex(args: number[]): number {
  // 1:1 : args[0]==0 → le bit le plus bas du mask battle-BG (=1) ; 1 → atk+16 ; 2 → tgt+16.
  const itf = _itf() as { getAttacker?: () => number; getTarget?: () => number };
  if (args[0] === 1) return (itf.getAttacker?.() ?? 0) + 16;
  if (args[0] === 2) return (itf.getTarget?.() ?? 1) + 16;
  let selected = (_flMons().GetBattlePalettesMask?.(true, false, false, false, false, false, false) ?? 0xE) >>> 0;
  let paletteIndex = 0;
  while ((selected & 1) === 0) { selected >>>= 1; paletteIndex++; }
  return paletteIndex;
}
function _pbBufs(): {
  gPlttBufferUnfaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
  gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function AnimTask_AllocBackupPalBuffer(task: AnimTask): void {
  _palBackup = new Uint16Array(0x1000); // AllocZeroed(MON_PIC_SIZE*MAX_MON_PIC_FRAMES)/2
  (_itf() as { DestroyAnimVisualTask?: (id: number) => void }).DestroyAnimVisualTask?.(task.taskId);
}
function AnimTask_FreeBackupPalBuffer(task: AnimTask): void {
  _palBackup = null; // FREE_AND_SET_NULL
  (_itf() as { DestroyAnimVisualTask?: (id: number) => void }).DestroyAnimVisualTask?.(task.taskId);
}
function AnimTask_CopyPalUnfadedToBackup(task: AnimTask): void {
  const itf = _itf() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const args = itf.getArgs?.() ?? [0, 0];
  const idx = _pbIndex(args);
  const un = _pbBufs().gPlttBufferUnfaded;
  if (_palBackup && un?.get) {
    for (let k = 0; k < 16; k++) _palBackup[(args[1] | 0) * 16 + k] = un.get(idx * 16 + k);
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
function AnimTask_CopyPalUnfadedFromBackup(task: AnimTask): void {
  const itf = _itf() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const args = itf.getArgs?.() ?? [0, 0];
  const idx = _pbIndex(args);
  const bufs = _pbBufs();
  if (_palBackup && bufs.gPlttBufferUnfaded?.set) {
    for (let k = 0; k < 16; k++) {
      bufs.gPlttBufferUnfaded.set(idx * 16 + k, _palBackup[(args[1] | 0) * 16 + k]);
      // Unfaded aliase Faded chez nous : le set ci-dessus restaure le visible (1:1-net).
    }
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
function AnimTask_CopyPalFadedToUnfaded(task: AnimTask): void {
  const itf = _itf() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const args = itf.getArgs?.() ?? [0];
  const idx = _pbIndex(args);
  const bufs = _pbBufs();
  // 1:1 memcpy(Unfaded[idx], Faded[idx]) — alias chez nous → no-op net (documenté).
  if (bufs.gPlttBufferUnfaded?.set && bufs.gPlttBufferFaded?.get) {
    for (let k = 0; k < 16; k++) bufs.gPlttBufferUnfaded.set(idx * 16 + k, bufs.gPlttBufferFaded.get(idx * 16 + k));
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
registerAnimTasks({
  AnimTask_AllocBackupPalBuffer: AnimTask_AllocBackupPalBuffer as never,
  AnimTask_FreeBackupPalBuffer: AnimTask_FreeBackupPalBuffer as never,
  AnimTask_CopyPalUnfadedToBackup: AnimTask_CopyPalUnfadedToBackup as never,
  AnimTask_CopyPalUnfadedFromBackup: AnimTask_CopyPalUnfadedFromBackup as never,
  AnimTask_CopyPalFadedToUnfaded: AnimTask_CopyPalFadedToUnfaded as never,
});

// --- VAGUE F71 : StartMonScrollingBgMask (battle_anim_utility_funcs.c.c:813-940) ----------
// LE systeme BG-mask : le BG1 (image metallique/bulles) n'est visible QU'A
// TRAVERS la silhouette OBJ-window du mon (clone objMode=2). WINOUT sans BG1
// + WINOBJ avec BG1 + DISPCNT_OBJWIN. ~22 usages (MetallicShine/StatusCleared/
// spotlights/Memento/Curse).
import {
  GetBattleAnimBg1Data as _smskBgData,
  AnimLoadCompressedBgGfx as _smskLoadGfx,
  AnimLoadCompressedBgTilemap as _smskLoadMap,
  LoadAnimBgPalette as _smskLoadPal,
  ResetBattleAnimBg as _smskResetBg,
} from './engine/battle/battle-anim-interpreter';

type _SmskTask = { taskId: number; data: number[]; func?: unknown };
function _smskRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  GetGpuReg?: (o: number) => number;
  DestroySprite?: (i: number) => void;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number } }; windows?: { winObjEnabled: boolean } };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _smskItf(): { DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _smskSetWin(x: number, y: number): void {
  const g = globalThis as Record<string, unknown>;
  g.gBattle_WIN0H = x;
  g.gBattle_WIN0V = y;
}

/** 1:1 StartMonScrollingBgMask(taskId, _, scrollSpeed, battler, includePartner
 *  [single: false], numFadeSteps, fadeStepDelay, duration, gfxSym, mapSym, palSym). */
export function StartMonScrollingBgMask(
  task: _SmskTask, scrollSpeed: number, battler: number,
  numFadeSteps: number, fadeStepDelay: number, duration: number,
  gfxSym: string, mapSym: string, palSym: string,
): void {
  const rt = _smskRt();
  _smskSetWin(0, 0);
  // WININ : tout+CLR pour WIN0/WIN1 (0x3F3F)
  rt.SetGpuReg?.(0x48, 0x3F3F);
  // WINOUT 1:1 : BG0|BG2|BG3|OBJ|CLR (PAS BG1 !) + WINOBJ tout+CLR
  rt.SetGpuReg?.(0x4A, (0x3F << 8) | 0x3D);
  // DISPCNT |= OBJWIN_ON
  if (rt.gba?.windows) rt.gba.windows.winObjEnabled = true;
  rt.SetGpuReg?.(0x50, 0x3F42); // BLDCNT TGT1_BG1 | TGT2_ALL | EFFECT_BLEND
  rt.SetGpuReg?.(0x52, 0 | (16 << 8));
  const bg1 = rt.gba?.bg(1)?.config;
  if (bg1) {
    bg1.priority = 0;
    bg1.screenSize = 0;
    bg1.charBaseIndex = 1;
  }
  // clone OBJ-window du mon
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const monSpriteId = co?.getBattlerMonSpriteId?.(battler) ?? 0xFF;
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as { CreateInvisibleSpriteCopy?: (b: number, s: number, sp: number) => number } | undefined;
  const spriteId = monSpriteId !== 0xFF ? (mons?.CreateInvisibleSpriteCopy?.(battler, monSpriteId, 0) ?? -1) : -1;
  // assets en BG1 anim
  const animBg = _smskBgData();
  _smskLoadMap(animBg.bgId, mapSym);
  _smskLoadGfx(animBg.bgId, gfxSym, animBg.tilesOffset);
  _smskLoadPal(palSym, animBg.paletteId);
  const g = globalThis as Record<string, unknown>;
  g.gBattle_BG1_X = 0;
  g.gBattle_BG1_Y = 0;
  task.data[1] = scrollSpeed;
  task.data[4] = numFadeSteps;
  task.data[5] = duration;
  task.data[6] = fadeStepDelay;
  task.data[0] = spriteId;
  task.data[2] = 0; // includePartner (single)
  task.data[3] = -1;
  task.data[10] = 0;
  task.data[11] = 0;
  task.data[12] = 0;
  task.data[13] = 0;
  task.data[15] = 0;
  task.func = _UpdateMonScrollingBgMask;
}
/** 1:1 UpdateMonScrollingBgMask (battle_anim_utility_funcs.c.c:879-938). */
function _UpdateMonScrollingBgMask(task: _SmskTask): void {
  const rt = _smskRt();
  const g = globalThis as Record<string, unknown>;
  task.data[13] += task.data[1] < 0 ? -task.data[1] : task.data[1];
  const dy = task.data[13] >> 8;
  if (task.data[1] < 0) g.gBattle_BG1_Y = (((g.gBattle_BG1_Y as number) | 0) - dy) & 0xFFFF;
  else g.gBattle_BG1_Y = (((g.gBattle_BG1_Y as number) | 0) + dy) & 0xFFFF;
  task.data[13] &= 0xFF;
  switch (task.data[15]) {
    case 0:
      if (task.data[11]++ >= task.data[6]) {
        task.data[11] = 0;
        task.data[12]++;
        rt.SetGpuReg?.(0x52, (task.data[12] & 0xFF) | ((16 - task.data[12]) << 8));
        if (task.data[12] === task.data[4]) task.data[15]++;
      }
      break;
    case 1:
      if (++task.data[10] === task.data[5]) task.data[15]++;
      break;
    case 2:
      if (task.data[11]++ >= task.data[6]) {
        task.data[11] = 0;
        task.data[12]--;
        rt.SetGpuReg?.(0x52, (task.data[12] & 0xFF) | ((16 - task.data[12]) << 8));
        if (task.data[12] === 0) {
          _smskResetBg(false);
          _smskSetWin(0, 0);
          rt.SetGpuReg?.(0x48, 0x3F3F);
          rt.SetGpuReg?.(0x4A, 0x3F3F); // WINOUT all (teardown 1:1)
          const bg1 = rt.gba?.bg(1)?.config;
          if (bg1) bg1.charBaseIndex = 0;
          if (rt.gba?.windows) rt.gba.windows.winObjEnabled = false; // DISPCNT ^= OBJWIN
          rt.SetGpuReg?.(0x50, 0);
          rt.SetGpuReg?.(0x52, 0);
          if (task.data[0] >= 0) DestroySprite(getRuntime(), task.data[0]);
          _smskItf().DestroyAnimVisualTask?.(task.taskId);
        }
      }
      break;
  }
}
{
  // surface : les clients (effects_3 StatusCleared, MetallicShine...) consomment
  (globalThis as Record<string, unknown>).__startMonScrollingBgMask = StartMonScrollingBgMask;
}

// --- VAGUE F80 : variantes BlendColorCycle (battle_anim_normal.c:509/:595) --
// Même flip-flop que AnimTask_BlendColorCycle, masque PRÉCALCULÉ stocké en
// data[13] (hi 16 bits) / data[14] (lo) — 1:1 tPalSelectorHi/Lo du C.
function _BlendColorCycleMask_Step(task: AnimTask): void {
  if (task.data[9] < task.data[1]) { task.data[9]++; return; }
  task.data[9] = 0;
  const target = !task.data[6] ? task.data[4] : (task.data[2] === 1 ? 0 : task.data[3]);
  let selected = (((task.data[13] & 0xFFFF) << 16) | (task.data[14] & 0xFFFF)) >>> 0;
  let palOffset = 0;
  while (selected !== 0) {
    if (selected & 1) BlendPalette(palOffset, 16, task.data[10], task.data[5]);
    palOffset += 16;
    selected >>>= 1;
  }
  if (task.data[10] < target) task.data[10]++;
  else if (task.data[10] > target) task.data[10]--;
  else {
    // 1:1 AnimTask_BlendColorCycleLoop : numBlends = DEMI-blends (cf.
    // _BlendColorCycle_Step) — décrément à CHAQUE palier, pas aux pairs.
    if (--task.data[2] <= 0) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
    task.data[6] ^= 1;
  }
}
function _initBlendCycleMask(task: AnimTask, args: number[], mask: number): void {
  task.data[1] = args[1] | 0;  // delay
  task.data[2] = args[2] | 0;  // numBlends
  task.data[3] = Math.min(Math.max(args[3] | 0, 0), 16);
  task.data[4] = Math.min(Math.max(args[4] | 0, 0), 16);
  task.data[5] = args[5] | 0;  // color
  task.data[6] = 0;
  task.data[9] = 0;
  task.data[10] = task.data[3];
  task.data[13] = (mask >>> 16) & 0xFFFF;
  task.data[14] = mask & 0xFFFF;
  task.func = _BlendColorCycleMask_Step;
}
/** 1:1 AnimTask_BlendColorCycleExclude (battle_anim_normal.c.c:509) : tous les battlers SAUF
 *  attacker/cible (+ BG 0xE si args[0]==1). En single le masque OBJ est vide. */
function AnimTask_BlendColorCycleExclude(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 0, 2, 0, 14, 0];
  const itf2 = _itf();
  const atk = itf2.getAttacker?.() ?? 0;
  const tgt = itf2.getTarget?.() ?? 1;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ oamIndex: number } | undefined>; gba?: { oam: Array<{ paletteBank: number }> } } | undefined;
  let selected = 0;
  for (let b = 0; b < 4; b++) {
    if (b === atk || b === tgt) continue;
    const sid = co?.getBattlerMonSpriteId?.(b);
    const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
    const pal = sp ? rt?.gba?.oam[sp.oamIndex]?.paletteBank : undefined;
    if (pal !== undefined) selected |= 1 << (16 + pal);
  }
  if ((args[0] | 0) === 1) selected |= 0xE;
  _initBlendCycleMask(task, args, selected >>> 0);
}
/** 1:1 AnimTask_BlendColorCycleByTag (battle_anim_normal.c.c:595) : la palette du tag. */
function AnimTask_BlendColorCycleByTag(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 0, 2, 0, 14, 0];
  const spApi = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  const slot = spApi?.IndexOfSpritePaletteTag?.(args[0] | 0) ?? 0xFF;
  if (slot === 0xFF) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
  _initBlendCycleMask(task, args, (1 << (16 + slot)) >>> 0);
}
registerAnimTasks({
  AnimTask_BlendColorCycleExclude: AnimTask_BlendColorCycleExclude as never,
  AnimTask_BlendColorCycleByTag: AnimTask_BlendColorCycleByTag as never,
});

// ═════════════════════════════════════════════════════════════════════════════
// CHAÎNE StatsChange (battle_anim_utility_funcs.c:415-648) — l'anim stat ±1/±2
// (les flèches qui défilent sur le mon, découpé à sa silhouette par la fenêtre
// OBJ). Lancée par AnimTask_StatsChange (battle_anim_status_effects.c:482,
// décodeur animArg) → InitStatsChangeAnimation → Step1 (regs fenêtre/blend +
// species) → Step2 (copie OBJWIN + BG1 tiles/tilemap/palette + SE) → Step3
// (scroll BG1_Y + fade in/wait/fade out/reset).
// Assets : scripts/extract-stat-change-assets.cjs → backgrounds/stat_change*
// (symboles gStatAnim_* dans anim-bg-symbols.json).
// ═════════════════════════════════════════════════════════════════════════════
import {
  GetBattleAnimBg1Data as _scBgData,
  AnimLoadCompressedBgGfx as _scLoadGfx,
  AnimLoadCompressedBgTilemap as _scLoadTilemap,
  ClearBattleAnimBg as _scClearAnimBg,
  LoadAnimBgPalette as _scLoadPal,
  ResetBattleAnimBg as _scResetBg,
} from './engine/battle/battle-anim-interpreter';
import { ENUM_STAT_3 as _SC_PAL } from '../include/battle_anim';
import { resolveDecompConstant as _scSE } from '../harness/runtime/decomp-constants';
import { gBattlerPartyIndexes as _scPartyIdx } from './engine/battle/state';
import {
  gPlayerParty as _scPlayerParty, gEnemyParty as _scEnemyParty,
  GetMonData as _scGetMonData, MON_DATA_SPECIES as _SC_MON_SPECIES,
} from './engine/battle/party-storage';

/** = struct AnimStatsChangeData (alloué par Init, libéré par Step3 case 3).
 *  data[0]=aDecrease, [1]=aAnimStatId, [2]=aIsTarget, [3]=aMultipleBattlers,
 *  [4]=aSharply. */
let sAnimStatsChangeData: {
  data: number[]; battler1: number; battler2: number;
  species: number; hidBattler2: boolean;
} | null = null;

type _ScRt = {
  SetGpuReg?: (off: number, v: number) => void;
  GetGpuReg?: (off: number) => number;
  DestroySprite?: (id: number) => void;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number; visible: boolean } } };
};
function _scRt(): _ScRt {
  return ((globalThis as Record<string, unknown>).__rt as _ScRt) ?? {};
}
function _scMonSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(battler) ?? -1;
}

/** 1:1 `InitStatsChangeAnimation` (battle_anim_utility_funcs.c:415). */
export function InitStatsChangeAnimation(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [];
  sAnimStatsChangeData = { data: [], battler1: 0, battler2: 0, species: 0, hidBattler2: false };
  for (let i = 0; i < 8; i++) sAnimStatsChangeData.data[i] = args[i] | 0;
  task.func = StatsChangeAnimation_Step1;
}

/** 1:1 `StatsChangeAnimation_Step1` (battle_anim_utility_funcs.c:426). */
function StatsChangeAnimation_Step1(task: AnimTask): void {
  const sc = sAnimStatsChangeData;
  if (!sc) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
  const itf = _itf();
  sc.battler1 = !sc.data[2] ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  sc.battler2 = sc.battler1 ^ 2; // BATTLE_PARTNER
  // 1:1 :434 — runtime SINGLES : IsBattlerSpriteVisible(partner) = false →
  // aMultipleBattlers retombe à FALSE.
  if (sc.data[3]) sc.data[3] = 0;
  const g = globalThis as Record<string, unknown>;
  g.gBattle_WIN0H = 0;
  g.gBattle_WIN0V = 0;
  const rt = _scRt();
  rt.SetGpuReg?.(0x48 /* WININ */, 0x3F3F /* WININ_WIN0_ALL | WININ_WIN1_ALL */);
  rt.SetGpuReg?.(0x4A /* WINOUT */, 0x3F3D /* (WINOUT_WIN01_ALL & ~BG1) | WINOUT_WINOBJ_ALL */);
  rt.SetGpuReg?.(0x00 /* DISPCNT */, (rt.GetGpuReg?.(0x00) ?? 0) | 0x8000 /* DISPCNT_OBJWIN_ON */);
  rt.SetGpuReg?.(0x50 /* BLDCNT */, 0x3F42 /* TGT1_BG1 | TGT2_ALL | EFFECT_BLEND */);
  rt.SetGpuReg?.(0x52 /* BLDALPHA */, (16 << 8) | 0 /* BLDALPHA_BLEND(0, 16) */);
  // 1:1 :444-447 SetAnimBgAttribute(1, PRIORITY 0, SCREEN_SIZE 0, CHAR_BASE 1)
  const cfg = rt.gba?.bg(1)?.config;
  if (cfg) { cfg.priority = 0; cfg.screenSize = 0; cfg.charBaseIndex = 1; }
  // :449-462 doubles (pousser battler2 hors anim) — hors-scope single, hidBattler2 reste false.
  // :470-473 species du battler1 (party réelle, par side).
  const idx = _scPartyIdx[sc.battler1] ?? 0;
  const mon = (sc.battler1 & 1) !== 0 ? _scEnemyParty[idx] : _scPlayerParty[idx];
  sc.species = (_scGetMonData(mon as never, _SC_MON_SPECIES) as number) || 0;
  task.func = StatsChangeAnimation_Step2;
}

/** 1:1 `StatsChangeAnimation_Step2` (battle_anim_utility_funcs.c:479).
 *  Slots task (les #define t* du C) : [0]=tAnimSpriteId1, [1]=tVelocity,
 *  [2]=tMultipleBattlers, [3]=tAnimSpriteId2, [4]=tTargetBlend, [5]=tWaitTime,
 *  [6]=tHidBattler2, [7]=tBattler2SpriteId, [10]=tState, [11]=tFadeTimer,
 *  [12]=tBlend, [13]=tWaitTimer. */
function StatsChangeAnimation_Step2(task: AnimTask): void {
  const sc = sAnimStatsChangeData;
  if (!sc) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    CreateInvisibleSpriteCopy?: (battler: number, spriteId: number, species: number) => number;
  } | undefined;
  const spriteId2 = 0; // aMultipleBattlers = false en single (:488-492 non exercé)
  const battlerSpriteId = _scMonSpriteId(sc.battler1);
  const spriteId = battlerSpriteId >= 0
    ? (mons?.CreateInvisibleSpriteCopy?.(sc.battler1, battlerSpriteId, sc.species) ?? -1)
    : -1;
  const bgData = _scBgData();
  _scLoadTilemap(bgData.bgId, !sc.data[0] ? 'gStatAnim_Increase_Tilemap' : 'gStatAnim_Decrease_Tilemap');
  _scLoadGfx(bgData.bgId, 'gStatAnim_Gfx', bgData.tilesOffset);
  switch (sc.data[1]) {
    case _SC_PAL.STAT_ANIM_PAL_ATK: _scLoadPal('gStatAnim_Attack_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_DEF: _scLoadPal('gStatAnim_Defense_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_ACC: _scLoadPal('gStatAnim_Accuracy_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_SPEED: _scLoadPal('gStatAnim_Speed_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_EVASION: _scLoadPal('gStatAnim_Evasion_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_SPATK: _scLoadPal('gStatAnim_SpAttack_Pal', bgData.paletteId); break;
    case _SC_PAL.STAT_ANIM_PAL_SPDEF: _scLoadPal('gStatAnim_SpDefense_Pal', bgData.paletteId); break;
    default /* STAT_ANIM_PAL_MULTIPLE */: _scLoadPal('gStatAnim_Multiple_Pal', bgData.paletteId); break;
  }
  const g = globalThis as Record<string, unknown>;
  g.gBattle_BG1_X = 0;
  g.gBattle_BG1_Y = 0;
  if (sc.data[0] === 1) {
    g.gBattle_BG1_X = 64;
    task.data[1] = -3;
  } else {
    task.data[1] = 3;
  }
  if (!sc.data[4]) {
    task.data[4] = 10;
    task.data[5] = 20;
  } else {
    task.data[4] = 13;
    task.data[5] = 30;
  }
  task.data[0] = spriteId;
  task.data[2] = sc.data[3];
  task.data[3] = spriteId2;
  task.data[6] = sc.hidBattler2 ? 1 : 0;
  task.data[7] = _scMonSpriteId(sc.battler2);
  task.data[10] = 0; task.data[11] = 0; task.data[12] = 0; task.data[13] = 0;
  task.func = StatsChangeAnimation_Step3;
  // 1:1 :561-564 — SE up/down (pan = dette douce infra SE mono, pattern repo).
  const se = _scSE(!sc.data[0] ? 'SE_M_STAT_INCREASE' : 'SE_M_STAT_DECREASE') ?? 0;
  if (se) ((globalThis as Record<string, unknown>).__PlaySE as ((id: number) => void) | undefined)?.(se);
}

/** 1:1 `StatsChangeAnimation_Step3` (battle_anim_utility_funcs.c:567). */
function StatsChangeAnimation_Step3(task: AnimTask): void {
  const g = globalThis as Record<string, unknown>;
  g.gBattle_BG1_Y = (((g.gBattle_BG1_Y as number) | 0) + task.data[1]) & 0xFFFF;
  const rt = _scRt();
  switch (task.data[10]) {
    case 0: // fade in
      if (task.data[11]++ > 0) {
        task.data[11] = 0;
        task.data[12]++;
        rt.SetGpuReg?.(0x52, ((16 - task.data[12]) << 8) | task.data[12]);
        if (task.data[12] === task.data[4]) task.data[10]++;
      }
      break;
    case 1: // wait
      if (++task.data[13] === task.data[5]) task.data[10]++;
      break;
    case 2: // fade out
      if (task.data[11]++ > 0) {
        task.data[11] = 0;
        task.data[12]--;
        rt.SetGpuReg?.(0x52, ((16 - task.data[12]) << 8) | task.data[12]);
        if (task.data[12] === 0) {
          _scResetBg(false);
          task.data[10]++;
        }
      }
      break;
    case 3: { // reset
      g.gBattle_WIN0H = 0;
      g.gBattle_WIN0V = 0;
      rt.SetGpuReg?.(0x48 /* WININ */, 0x3F3F);
      rt.SetGpuReg?.(0x4A /* WINOUT */, 0x3F3F /* WIN01_ALL | OBJ_ALL */);
      const cfg = rt.gba?.bg(1)?.config;
      if (cfg) cfg.charBaseIndex = 0; // :611 SetAnimBgAttribute(1, CHAR_BASE, 0)
      rt.SetGpuReg?.(0x00, (rt.GetGpuReg?.(0x00) ?? 0) ^ 0x8000 /* DISPCNT ^ OBJWIN_ON */);
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      if (task.data[0] >= 0) DestroySprite(getRuntime(), task.data[0]);
      if (task.data[2] && task.data[3] >= 0) DestroySprite(getRuntime(), task.data[3]);
      // :622-623 restaure la priorité du battler2 — hors-scope single (tHidBattler2=0).
      sAnimStatsChangeData = null; // FREE_AND_SET_NULL
      _itf().DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
}

registerAnimTasks({ InitStatsChangeAnimation: InitStatsChangeAnimation as never });

// ─── Retargets anim attacker/target (battle_anim_utility_funcs.c:1049-1078) ──
// Posent gBattleAnimAttacker/Target depuis l'état du tour (gBattlerTarget /
// gEffectBattler / gBattlerAttacker) — utilisés par les scripts d'effets
// secondaires (l'anim joue sur le mon AFFECTÉ par l'effet).
import { gBattlerAttacker as _rtgAtk, gBattlerTarget as _rtgTgt, gEffectBattler as _rtgEff } from './engine/battle/state';

function _rtgItf(): {
  getAttacker?: () => number; getTarget?: () => number;
  setBattleAnimAttackerTarget?: (a: number, t: number) => void;
  DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 `AnimTask_SetAnimAttackerAndTargetForEffectTgt` (:1049) :
 *  attacker = gBattlerTarget, target = gEffectBattler. */
function AnimTask_SetAnimAttackerAndTargetForEffectTgt(task: AnimTask): void {
  _rtgItf().setBattleAnimAttackerTarget?.(_rtgTgt, _rtgEff);
  _rtgItf().DestroyAnimVisualTask?.(task.taskId);
}

/** 1:1 `AnimTask_SetAnimTargetToBattlerTarget` (:1066) : target = gBattlerTarget. */
function AnimTask_SetAnimTargetToBattlerTarget(task: AnimTask): void {
  const itf = _rtgItf();
  itf.setBattleAnimAttackerTarget?.(itf.getAttacker?.() ?? 0, _rtgTgt);
  itf.DestroyAnimVisualTask?.(task.taskId);
}

/** 1:1 `AnimTask_SetAnimAttackerAndTargetForEffectAtk` (:1072) :
 *  attacker = gBattlerAttacker, target = gEffectBattler. */
function AnimTask_SetAnimAttackerAndTargetForEffectAtk(task: AnimTask): void {
  _rtgItf().setBattleAnimAttackerTarget?.(_rtgAtk, _rtgEff);
  _rtgItf().DestroyAnimVisualTask?.(task.taskId);
}

registerAnimTasks({
  AnimTask_SetAnimAttackerAndTargetForEffectTgt: AnimTask_SetAnimAttackerAndTargetForEffectTgt as never,
  AnimTask_SetAnimTargetToBattlerTarget: AnimTask_SetAnimTargetToBattlerTarget as never,
  AnimTask_SetAnimAttackerAndTargetForEffectAtk: AnimTask_SetAnimAttackerAndTargetForEffectAtk as never,
});

// ─── FALLING WHITE LINES (battle_anim_utility_funcs.c:278-414) ───────────────
// Les lignes blanches qui tombent sur l'ATTAQUANT (masque Curse réutilisé,
// fenêtre OBJWIN + copie invisible — la même infra que StatsChange ci-dessus).

/** 1:1 `AnimTask_DrawFallingWhiteLinesOnAttacker` (.c:278-346). */
function AnimTask_DrawFallingWhiteLinesOnAttacker(task: AnimTask): void {
  const rt = _scRtLines();
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const g = globalThis as Record<string, unknown>;
  const var0 = 0; // IsDoubleBattle() : partner-priority — single = 0 (doubles dette)
  g.gBattle_WIN0H = 0;
  g.gBattle_WIN0V = 0;
  rt.SetGpuReg?.(0x48, 0x3F3F); // WININ all+CLR ×2 (1:1 :290)
  rt.SetGpuReg?.(0x4A, (0x3F << 8) | 0x3D); // WINOUT BG0|BG2|BG3|OBJ|CLR + WINOBJ all (1:1 :292)
  const disp = rt.GetGpuReg?.(0x00) ?? 0;
  rt.SetGpuReg?.(0x00, disp | 0x8000); // DISPCNT |= OBJWIN_ON
  rt.SetGpuReg?.(0x50, 0x3F42); // BLDCNT TGT1_BG1 | TGT2_ALL | BLEND (1:1 :294)
  rt.SetGpuReg?.(0x52, 8 | (12 << 8)); // BLDALPHA (8,12) (1:1 :295)
  // bg1Cnt : priority 0, screenSize 0, charBase 1 (1:1 :296-305 — déjà la
  // convention du BG1 anim chez nous, posée par l'infra _scBgData/monbg).
  const bg1 = (rt as { gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number } } } }).gba?.bg(1)?.config;
  if (bg1) { bg1.priority = 0; bg1.screenSize = 0; bg1.charBaseIndex = 1; }
  // species du battler attaquant (party-storage par side, 1:1 :323-333)
  const idx0 = _scPartyIdx[atk] ?? 0;
  const mon0 = (atk & 1) !== 0 ? _scEnemyParty[idx0] : _scPlayerParty[idx0];
  const species = (_scGetMonData(mon0 as never, _SC_MON_SPECIES) as number) || 0;
  const monSpriteId = _scMonSpriteId(atk);
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    CreateInvisibleSpriteCopy?: (battler: number, spriteId: number, species: number) => number;
  } | undefined;
  const newSpriteId = monSpriteId >= 0 ? (mons?.CreateInvisibleSpriteCopy?.(atk, monSpriteId, species) ?? -1) : -1;
  const bgData = _scBgData();
  _scLoadTilemap(bgData.bgId, 'gBattleAnimMaskTilemap_Curse');
  _scLoadGfx(bgData.bgId, 'gBattleAnimMaskImage_Curse', bgData.tilesOffset);
  // LoadPalette(sCurseLinesPalette = {RGB_WHITE}, BG_PLTT_ID(palId)+1, 1 couleur) (1:1 :339)
  const pf = (rt as { gPlttBufferUnfaded?: { set?: (i: number, v: number) => void }; gPlttBufferFaded?: { set?: (i: number, v: number) => void } });
  pf.gPlttBufferUnfaded?.set?.(bgData.paletteId * 16 + 1, 0x7FFF);
  pf.gPlttBufferFaded?.set?.(bgData.paletteId * 16 + 1, 0x7FFF);
  const sp = (rt as { gSprites?: Array<{ x: number; y: number } | undefined> }).gSprites?.[monSpriteId];
  g.gBattle_BG1_X = (-(sp?.x ?? 120) + 32) & 0xFFFF;
  g.gBattle_BG1_Y = (-(sp?.y ?? 80) + 32) & 0xFFFF;
  task.data[0] = newSpriteId;
  task.data[6] = var0;
  task.func = AnimTask_DrawFallingWhiteLinesOnAttacker_Step;
}

/** 1:1 `AnimTask_DrawFallingWhiteLinesOnAttacker_Step` (.c:348-392) — scroll
 *  BG1_Y −4/frame par paquets de 64, ×4 cycles puis teardown complet. */
function AnimTask_DrawFallingWhiteLinesOnAttacker_Step(task: AnimTask): void {
  const rt = _scRtLines();
  const g = globalThis as Record<string, unknown>;
  task.data[10] += 4;
  g.gBattle_BG1_Y = (((g.gBattle_BG1_Y as number) | 0) - 4) & 0xFFFF;
  if (task.data[10] === 64) {
    task.data[10] = 0;
    g.gBattle_BG1_Y = (((g.gBattle_BG1_Y as number) | 0) + 64) & 0xFFFF;
    if (++task.data[11] === 4) {
      _smskResetBg(false);
      g.gBattle_WIN0H = 0;
      g.gBattle_WIN0V = 0;
      rt.SetGpuReg?.(0x48, 0x3F3F);
      rt.SetGpuReg?.(0x4A, 0x3F3F); // WINOUT all (teardown 1:1 :367)
      const bg1 = (rt as { gba?: { bg: (i: number) => { config: { charBaseIndex: number } } } }).gba?.bg(1)?.config;
      if (bg1) bg1.charBaseIndex = 0;
      const disp = rt.GetGpuReg?.(0x00) ?? 0;
      rt.SetGpuReg?.(0x00, disp ^ 0x8000); // DISPCNT ^= OBJWIN_ON
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      const sid = task.data[0];
      const rt2 = rt as { DestroySprite?: (i: number) => void; gSprites?: Array<unknown | undefined> };
      if (sid >= 0) { DestroySprite(getRuntime(), sid); if (rt2.gSprites) rt2.gSprites[sid] = undefined; }
      const bgData = _scBgData();
      _scClearAnimBg(bgData.bgId);
      g.gBattle_BG1_Y = 0;
      _itf().DestroyAnimVisualTask?.(task.taskId);
    }
  }
}

function _scRtLines(): {
  SetGpuReg?: (o: number, v: number) => void; GetGpuReg?: (o: number) => number;
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}

registerAnimTasks({ AnimTask_DrawFallingWhiteLinesOnAttacker: AnimTask_DrawFallingWhiteLinesOnAttacker as never });

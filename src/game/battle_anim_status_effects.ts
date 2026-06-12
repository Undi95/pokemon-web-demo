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

// --- VAGUE F54 : AnimTask_FrozenIceCube (battle_anim_status_effects.c.c:381-479) ----------
// Le cube de glace : fondu BLDALPHA in (0..9), 2 cycles de rotation des
// couleurs 13..15 de la palette ICE_CUBE, fondu out, destroy a 37/39f.
// Dette douce : sFrozenIceCubeSubspriteTable non composee (cube 64x64 simple).
const _FIC_TAG_ICE_CUBE = 10141; // ANIM_TAG_ICE_CUBE

type _FicTask = { taskId: number; data: number[]; func?: unknown };
function _ficItf(): { getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _ficRt(): {
  gSprites?: Map<number, { invisible?: boolean; oamIndex: number }>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  DestroySprite?: (i: number) => void;
  SetGpuReg?: (o: number, v: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
  gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
import { GetBattlerSpriteCoord as _ficCoord, BATTLER_COORD_X_2 as _FIC_X2, BATTLER_COORD_Y_PIC_OFFSET as _FIC_YPIC } from './battle_anim_mons';
function _ficSpriteApi(): { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } {
  return ((globalThis as Record<string, unknown>).__sprite as never) ?? {};
}

/** 1:1 AnimTask_FrozenIceCube (battle_anim_status_effects.c.c:381). */
function AnimTask_FrozenIceCube(task: _FicTask): void {
  const itf = _ficItf();
  const tgt = itf.getTarget?.() ?? 1;
  const x = _ficCoord(tgt, _FIC_X2) - 32;
  const y = _ficCoord(tgt, _FIC_YPIC) - 36;
  const rt = _ficRt();
  rt.SetGpuReg?.(0x50, 0x3F40); // BLDCNT_EFFECT_BLEND | TGT2_ALL
  rt.SetGpuReg?.(0x52, 0 | (16 << 8));
  const api = _ficSpriteApi();
  const tileStart = api.GetSpriteTileStartByTag?.(_FIC_TAG_ICE_CUBE) ?? 0xFFFF;
  // (la sheet ICE_CUBE est chargee par le loadspritegfx du script — 1:1)
  const sid = rt.CreateSpriteInline?.({ oam: { shape: 0, size: 3, priority: 2, objMode: 1 }, images: [] } as never, x + 32, y + 32, 4) ?? -1;
  if (sid >= 0) {
    const sp = rt.gSprites?.get(sid);
    const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart;
      const pal = api.IndexOfSpritePaletteTag?.(_FIC_TAG_ICE_CUBE) ?? 0xFF;
      if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
    }
    if (sp && tileStart === 0xFFFF) sp.invisible = true; // 1:1
  }
  task.data[15] = sid;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = 0;
  task.data[4] = 0;
  task.func = _FrozenIceCube_Step1;
}
function _FrozenIceCube_Step1(task: _FicTask): void {
  task.data[1]++;
  if (task.data[1] === 10) {
    task.func = _FrozenIceCube_Step2;
    task.data[1] = 0;
  } else {
    const v = task.data[1];
    _ficRt().SetGpuReg?.(0x52, (v & 0xFF) | ((16 - v) << 8));
  }
}
function _FrozenIceCube_Step2(task: _FicTask): void {
  const palIndex = _ficSpriteApi().IndexOfSpritePaletteTag?.(_FIC_TAG_ICE_CUBE) ?? 0xFF;
  if (task.data[1]++ > 13) {
    task.data[2]++;
    if (task.data[2] === 3) {
      const rt = _ficRt();
      const pf = rt.gPlttBufferFaded;
      if (palIndex !== 0xFF && pf?.get && pf.set) {
        const base = 256 + palIndex * 16;
        const temp = pf.get(base + 13);
        pf.set(base + 13, pf.get(base + 14));
        pf.set(base + 14, pf.get(base + 15));
        pf.set(base + 15, temp);
      }
      task.data[2] = 0;
      task.data[3]++;
      if (task.data[3] === 3) {
        task.data[3] = 0;
        task.data[1] = 0;
        task.data[4]++;
        if (task.data[4] === 2) {
          task.data[1] = 9;
          task.func = _FrozenIceCube_Step3;
        }
      }
    }
  }
}
function _FrozenIceCube_Step3(task: _FicTask): void {
  task.data[1]--;
  if (task.data[1] === -1) {
    task.func = _FrozenIceCube_Step4;
    task.data[1] = 0;
  } else {
    const v = task.data[1];
    _ficRt().SetGpuReg?.(0x52, (v & 0xFF) | ((16 - v) << 8));
  }
}
function _FrozenIceCube_Step4(task: _FicTask): void {
  task.data[1]++;
  const rt = _ficRt();
  if (task.data[1] === 37) {
    rt.DestroySprite?.(task.data[15]);
  } else if (task.data[1] === 39) {
    rt.SetGpuReg?.(0x50, 0);
    rt.SetGpuReg?.(0x52, 0);
    _ficItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
import { registerAnimTasks as _ficRegT } from '../engine/battle/battle-anim-registry';
_ficRegT({ AnimTask_FrozenIceCube: AnimTask_FrozenIceCube as never });

/**
 * fldeff_misc.ts — Port 1:1 STRICT (MIROIR partiel) de `src/fldeff_misc.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/fldeff_misc.c`.
 *
 * Ce module ne porte (pour l'instant) que la CHAÎNE des effets visuels de base
 * secrète appelés par `SecretBasePerStepCallback` (secret_base.ts) :
 *   - `PopSecretBaseBalloon` (fldeff_misc.c:850) + `Task_PopSecretBaseBalloon`
 *   - `ShatterSecretBaseBreakableDoor` (fldeff_misc.c:936) +
 *     `Task_ShatterSecretBaseBreakableDoor` + `DoSecretBaseBreakableDoorEffect`
 * Le reste de fldeff_misc.c (autres FldEff_*) = chantier séparé.
 *
 * Ces effets sont 100% pilotés par metatiles (pas de sprite dédié) → portables
 * 1:1. Seul l'audio (DoBalloonSoundEffect / PlaySE) est SKIP (hors périmètre).
 */

import { CreateTask, DestroyTask } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

import { GetTaskData } from '../harness/runtime/decomp-globals';
import { MapGridSetMetatileIdAt } from './fieldmap';
import { CurrentMapDrawMetatileAt, GetCameraTopLeftCoords } from './field_camera';
import { GetPlayerFacingDirection, DIR_SOUTH, DIR_NORTH } from './field_player_avatar';
import {
  METATILE_SecretBase_BreakableDoor_BottomOpen,
  METATILE_SecretBase_BreakableDoor_TopOpen,
} from '../include/constants/metatile_labels';

/** 1:1 STRICT décomp `EWRAM_DATA struct MapPosition gPlayerFacingPosition = {0}` (fldeff_misc.c:27).
 *  Posée par `CreateFieldMoveTask` (GetXYCoordsOneStepInFrontOfPlayer) ; lue par les field moves qui
 *  agissent sur la tuile DEVANT le joueur (Cut grass/hyper-cutter…). Coords INTERNAL (= +MAP_OFFSET). */
export const gPlayerFacingPosition: { x: number; y: number; elevation: number } = { x: 0, y: 0, elevation: 0 };

// Adaptateur 1:1 : `CurrentMapDrawMetatileAt(x, y)` décomp (sFieldCameraOffset
// global) → notre signature 4-args (position caméra explicite).
function _drawMapMetatileAt(x: number, y: number): void {
  const cam = GetCameraTopLeftCoords();
  CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
}

// ─── 1:1 décomp `PopSecretBaseBalloon` (fldeff_misc.c:850-859) ──────────────
// data[0]=metatileId, data[1]=x, data[2]=y, data[3]=timer, data[4]=frameStep.
export function PopSecretBaseBalloon(metatileId: number, x: number, y: number): void {
  const taskId = CreateTask(Task_PopSecretBaseBalloon, 0);
  const data = GetTaskData(taskId);
  if (!data) return;
  data[0] = metatileId;
  data[1] = x;
  data[2] = y;
  data[3] = 0;
  data[4] = 1;
}

// 1:1 décomp `Task_PopSecretBaseBalloon` (fldeff_misc.c:861-883). Anime le ballon
// qui éclate via la séquence de metatiles (metatileId + frameStep), 1 frame / 7 ticks.
function Task_PopSecretBaseBalloon(task: DecompTask): void {
  const data = task.data;

  if (data[3] === 6) data[3] = 0;
  else data[3]++;

  if (data[3] === 0) {
    // 1:1 : `if (data[4] == 2) DoBalloonSoundEffect(data[0])` — SKIP audio.
    MapGridSetMetatileIdAt(data[1], data[2], data[0] + data[4]);
    _drawMapMetatileAt(data[1], data[2]);

    if (data[4] === 3) DestroyTask(task.taskId);
    else data[4]++;
  }
}

// ─── 1:1 décomp `DoSecretBaseBreakableDoorEffect` (fldeff_misc.c:914-921) ────
function DoSecretBaseBreakableDoorEffect(x: number, y: number): void {
  // PlaySE(SE_BREAKABLE_DOOR) — SKIP audio.
  MapGridSetMetatileIdAt(x, y, METATILE_SecretBase_BreakableDoor_BottomOpen);
  MapGridSetMetatileIdAt(x, y - 1, METATILE_SecretBase_BreakableDoor_TopOpen);
  _drawMapMetatileAt(x, y);
  _drawMapMetatileAt(x, y - 1);
}

// 1:1 décomp `Task_ShatterSecretBaseBreakableDoor` (fldeff_misc.c:923-934).
function Task_ShatterSecretBaseBreakableDoor(task: DecompTask): void {
  const data = task.data;
  if (data[0] === 7) {
    DoSecretBaseBreakableDoorEffect(data[1], data[2]);
    DestroyTask(task.taskId);
  } else {
    data[0]++;
  }
}

// ─── 1:1 décomp `ShatterSecretBaseBreakableDoor` (fldeff_misc.c:936-951) ─────
// Si le joueur regarde au sud, casse la porte immédiatement ; au nord, via une
// task à délai (la porte est au-dessus, on attend que le joueur ait avancé).
export function ShatterSecretBaseBreakableDoor(x: number, y: number): void {
  const dir = GetPlayerFacingDirection();
  if (dir === DIR_SOUTH) {
    DoSecretBaseBreakableDoorEffect(x, y);
  } else if (dir === DIR_NORTH) {
    const taskId = CreateTask(Task_ShatterSecretBaseBreakableDoor, 5);
    const data = GetTaskData(taskId);
    if (data) {
      data[0] = 0;
      data[1] = x;
      data[2] = y;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — ComputerScreenEffect (fldeff_misc.c:311-481) : effet « écran CRT »
// à l'ouverture/fermeture du PC (storage + Hall of Fame). WIN0 hardware (compositor OK).
// task data 1:1 (:332-340) : tState=0 tHorzIncrement=1 tVertIncrement=2 tWinLeft=3
// tWinRight=4 tWinTop=5 tWinBottom=6 tBlendCnt=7 tBlendY=8.
// ═══════════════════════════════════════════════════════════════════════════
import { getRuntime, BlendPalettes } from '../harness/runtime/decomp-globals';

const REG_DISPCNT = 0x0, REG_WIN0H = 0x40, REG_WIN0V = 0x44, REG_WININ = 0x48, REG_WINOUT = 0x4A;
const REG_BLDCNT = 0x50, REG_BLDY = 0x54;
const DISPCNT_WIN0_ON = 1 << 13;
const WININ_WIN0_ALL = 0x3F;                       // BG_ALL | OBJ | CLR
const BLDCNT_TGT1_ALL_LIGHTEN = 0x3F | (2 << 6);   // BLDCNT_TGT1_ALL | BLDCNT_EFFECT_LIGHTEN
const DISPLAY_WIDTH = 240, DISPLAY_HEIGHT = 160;
const WIN_RANGE = (a: number, b: number) => ((a & 0xFF) << 8) | (b & 0xFF);

/** 1:1 `void ComputerScreenOpenEffect(u16 increment, u16 unused, u8 priority)` (:312). */
export function ComputerScreenOpenEffect(increment: number, unused: number, priority: number): void {
  CreateComputerScreenEffectTask(Task_ComputerScreenOpenEffect, increment, unused, priority);
}
/** 1:1 `void ComputerScreenCloseEffect(...)` (:317). */
export function ComputerScreenCloseEffect(increment: number, unused: number, priority: number): void {
  CreateComputerScreenEffectTask(Task_ComputerScreenCloseEffect, increment, unused, priority);
}
/** 1:1 `bool8 IsComputerScreenOpenEffectActive(void)` (:322) — FuncIsActiveTask par marqueur. */
export function IsComputerScreenOpenEffectActive(): boolean {
  const rt = getRuntime();
  return !!rt && rt.gTasks.some((t: unknown) => (t as { inUse?: boolean; __csFx?: string })?.inUse && (t as { __csFx?: string }).__csFx === 'open');
}
/** 1:1 `bool8 IsComputerScreenCloseEffectActive(void)` (:327). */
export function IsComputerScreenCloseEffectActive(): boolean {
  const rt = getRuntime();
  return !!rt && rt.gTasks.some((t: unknown) => (t as { inUse?: boolean; __csFx?: string })?.inUse && (t as { __csFx?: string }).__csFx === 'close');
}

/** 1:1 `static void CreateComputerScreenEffectTask(func, increment, unused, priority)` (:342). */
function CreateComputerScreenEffectTask(func: (taskId: number) => void, increment: number, _unused: number, priority: number): void {
  const rt = getRuntime(); if (!rt) return;
  const taskId = rt.CreateTask((t: { taskId: number }) => func(t.taskId), priority);
  const task = rt.gTasks[taskId];
  (task as { __csFx?: string }).__csFx = func === Task_ComputerScreenOpenEffect ? 'open' : 'close';
  task.data[0] = 0;
  task.data[1] = increment === 0 ? 16 : increment;
  task.data[2] = increment === 0 ? 20 : increment;
  func(taskId);
}

/** 1:1 `static void Task_ComputerScreenOpenEffect(u8 taskId)` (:352). */
function Task_ComputerScreenOpenEffect(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const task = rt.gTasks[taskId];
  const d = task.data;
  switch (d[0]) {
    case 0:
      d[3] = DISPLAY_WIDTH / 2;
      d[4] = DISPLAY_WIDTH / 2;
      d[5] = DISPLAY_HEIGHT / 2;
      d[6] = DISPLAY_HEIGHT / 2 + 1;
      rt.SetGpuReg(REG_DISPCNT, rt.GetGpuReg(REG_DISPCNT) | DISPCNT_WIN0_ON);
      rt.SetGpuReg(REG_WIN0H, WIN_RANGE(d[3], d[4]));
      rt.SetGpuReg(REG_WIN0V, WIN_RANGE(d[5], d[6]));
      rt.SetGpuReg(REG_WININ, WININ_WIN0_ALL);
      rt.SetGpuReg(REG_WINOUT, 0);
      break;
    case 1:
      d[7] = rt.GetGpuReg(REG_BLDCNT);
      d[8] = rt.GetGpuReg(REG_BLDY);
      rt.SetGpuReg(REG_BLDCNT, BLDCNT_TGT1_ALL_LIGHTEN);
      rt.SetGpuReg(REG_BLDY, 16);
      break;
    case 2:
      d[3] -= d[1];
      d[4] += d[1];
      if (d[3] < 1 || d[4] > DISPLAY_WIDTH - 1) {
        d[3] = 0;
        d[4] = DISPLAY_WIDTH;
        rt.SetGpuReg(REG_BLDY, 0);
        rt.SetGpuReg(REG_BLDCNT, d[7]);
        BlendPalettes(0xFFFFFFFF, 0, 0);
        rt.gPlttBufferFaded.set(0, 0);
      }
      rt.SetGpuReg(REG_WIN0H, WIN_RANGE(d[3], d[4]));
      if (d[3] !== 0) return;
      break;
    case 3:
      d[5] -= d[2];
      d[6] += d[2];
      if (d[5] < 1 || d[6] > DISPLAY_HEIGHT - 1) {
        d[5] = 0;
        d[6] = DISPLAY_HEIGHT;
        rt.SetGpuReg(REG_DISPCNT, rt.GetGpuReg(REG_DISPCNT) & ~DISPCNT_WIN0_ON);
      }
      rt.SetGpuReg(REG_WIN0V, WIN_RANGE(d[5], d[6]));
      if (d[5] !== 0) return;
      break;
    default:
      rt.SetGpuReg(REG_BLDCNT, d[7]);
      rt.DestroyTask(taskId);
      return;
  }
  d[0]++;
}

/** 1:1 `static void Task_ComputerScreenCloseEffect(u8 taskId)` (:420). */
function Task_ComputerScreenCloseEffect(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const task = rt.gTasks[taskId];
  const d = task.data;
  switch (d[0]) {
    case 0:
      rt.gPlttBufferFaded.set(0, 0);
      break;
    case 1:
      d[3] = 0;
      d[4] = DISPLAY_WIDTH;
      d[5] = 0;
      d[6] = DISPLAY_HEIGHT;
      rt.SetGpuReg(REG_DISPCNT, rt.GetGpuReg(REG_DISPCNT) | DISPCNT_WIN0_ON);
      rt.SetGpuReg(REG_WIN0H, WIN_RANGE(d[3], d[4]));
      rt.SetGpuReg(REG_WIN0V, WIN_RANGE(d[5], d[6]));
      rt.SetGpuReg(REG_WININ, WININ_WIN0_ALL);
      rt.SetGpuReg(REG_WINOUT, 0);
      break;
    case 2:
      d[5] += d[2];
      d[6] -= d[2];
      if (d[5] >= DISPLAY_HEIGHT / 2 || d[6] <= DISPLAY_HEIGHT / 2 + 1) {
        d[5] = DISPLAY_HEIGHT / 2;
        d[6] = DISPLAY_HEIGHT / 2 + 1;
        rt.SetGpuReg(REG_BLDCNT, BLDCNT_TGT1_ALL_LIGHTEN);
        rt.SetGpuReg(REG_BLDY, 16);
      }
      rt.SetGpuReg(REG_WIN0V, WIN_RANGE(d[5], d[6]));
      if (d[5] !== DISPLAY_HEIGHT / 2) return;
      break;
    case 3:
      d[3] += d[1];
      d[4] -= d[1];
      if (d[3] >= DISPLAY_WIDTH / 2 || d[4] <= DISPLAY_WIDTH / 2) {
        d[3] = DISPLAY_WIDTH / 2;
        d[4] = DISPLAY_WIDTH / 2;
        BlendPalettes(0xFFFFFFFF, 16, 0);
        rt.gPlttBufferFaded.set(0, 0);
      }
      rt.SetGpuReg(REG_WIN0H, WIN_RANGE(d[3], d[4]));
      if (d[3] !== DISPLAY_WIDTH / 2) return;
      break;
    default:
      rt.SetGpuReg(REG_DISPCNT, rt.GetGpuReg(REG_DISPCNT) & ~DISPCNT_WIN0_ON);
      rt.SetGpuReg(REG_BLDY, 0);
      rt.SetGpuReg(REG_BLDCNT, 0);
      rt.DestroyTask(taskId);
      return;
  }
  d[0]++;
}

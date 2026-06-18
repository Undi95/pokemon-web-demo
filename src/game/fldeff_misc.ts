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

import type { DecompTask } from '../engine/system/decomp-runtime';
import { CreateTask, DestroyTask } from '../engine/system/decomp-bridge';
import { GetTaskData } from '../engine/system/decomp-globals';
import { MapGridSetMetatileIdAt } from './fieldmap';
import { CurrentMapDrawMetatileAt, GetCameraTopLeftCoords } from '../engine/field/field-camera';
import { GetPlayerFacingDirection, DIR_SOUTH, DIR_NORTH } from './field_player_avatar';
import {
  METATILE_SecretBase_BreakableDoor_BottomOpen,
  METATILE_SecretBase_BreakableDoor_TopOpen,
} from '../engine/decomp-data/include/constants/metatile_labels-data';

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

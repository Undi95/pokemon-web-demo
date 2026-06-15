/**
 * field_tasks.ts — Port 1:1 STRICT (MIROIR) de `src/field_tasks.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_tasks.c`.
 *
 * Ce fichier gère les "persistent tasks" de l'overworld. Cible de ce module :
 * le SOUS-SYSTÈME per-step callback (`sPerStepCallbacks` + `Task_RunPerStepCallback`
 * + `SetUpFieldTasks` + `ActivatePerStepCallback` + `ResetFieldTasksArgs`).
 *
 * Modèle décomp (≠ l'ancien `step-callbacks.ts` kebab qui appelait un
 * `DoPerStepCallback()` inventé une fois par pas) :
 *   `SetUpFieldTasks()` crée UNE task `Task_RunPerStepCallback` (priorité 80) qui
 *   tourne CHAQUE FRAME via `RunTasks()`. Elle dispatch `sPerStepCallbacks[tCallbackId]`.
 *   Chaque callback lit son état dans `gTasks[taskId].data[]` et détecte le
 *   mouvement en comparant `PlayerGetDestCoords()` à sa position précédente.
 *   `ActivatePerStepCallback(id)` (= opcode `setstepcallback`) trouve la task,
 *   zéroie son `data[]` et set `tCallbackId = id`.
 *
 * État de ce port (staged, 1 callback = 1 commit avec A/B sur sa map) :
 *   ✅ infra dispatch + `AshGrassPerStepCallback` (Route 113, A/B vérifié).
 *   ⏳ `FortreeBridgePerStepCallback` / `PacifidlogBridgePerStepCallback` /
 *      `SootopolisGymIcePerStepCallback` / `CrackedFloorPerStepCallback` :
 *      slots encore sur `DummyPerStepCallback` (placeholders documentés), à porter
 *      ensuite (ils ont besoin de `CurrentMapDrawMetatileAt`).
 *   ⏳ `EndTruckSequence` (STEP_CB_TRUCK, field_special_scene.c → truck-cinematic.ts,
 *      déjà porté) / `SecretBasePerStepCallback` (STEP_CB_SECRET_BASE, secret_base.c
 *      non porté) : à câbler.
 *   ⏳ `Task_MuddySlope` (follow-up) + `Task_RunTimeBasedEvents` (entremêlé avec
 *      `UpdateAmbientCry` = AUDIO hors périmètre ; `DoTimeBasedEvents` est déjà
 *      câblé au map-load 1:1).
 */

import type { DecompTask } from '../engine/system/decomp-runtime';
import { CreateTask } from '../engine/system/decomp-bridge';
import {
  FindTaskIdByFunc,
  FuncIsActiveTask,
  GetTaskData,
  TASK_NONE,
} from '../engine/system/decomp-globals';
import { PlayerGetDestCoords } from '../engine/field/player-avatar';
import { MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt, MapGridSetMetatileIdAt } from '../engine/field/map-loader';
import { CurrentMapDrawMetatileAt, GetCameraTopLeftCoords } from '../engine/field/field-camera';
import {
  MetatileBehavior_IsAshGrass,
  MetatileBehavior_IsCrackedFloor,
  MetatileBehavior_IsCrackedFloorHole,
} from './metatile_behavior';
import { StartAshFieldEffect } from './field_effect_helpers';
import { CheckBagHasItem } from '../engine/bag/bag';
import { GetPlayerSpeed, PLAYER_SPEED_FASTEST } from '../engine/field/field-control-avatar';
import { VarGet, VarSet } from './event_data';
import {
  METATILE_Fallarbor_AshGrass,
  METATILE_Fallarbor_NormalGrass,
  METATILE_Lavaridge_NormalGrass,
  METATILE_Cave_CrackedFloor,
  METATILE_Cave_CrackedFloor_Hole,
  METATILE_Pacifidlog_SkyPillar_CrackedFloor_Hole,
} from '../engine/decomp-data/include/constants/metatile_labels-data';
import { VAR_ASH_GATHER_COUNT, VAR_ICE_STEP_COUNT } from './include/constants/vars';

// ─── 1:1 décomp constants/field_tasks.h (STEP_CB_* 0..7) ────────────────────
export const STEP_CB_DUMMY = 0;
export const STEP_CB_ASH = 1;
export const STEP_CB_FORTREE_BRIDGE = 2;
export const STEP_CB_PACIFIDLOG_BRIDGE = 3;
export const STEP_CB_SOOTOPOLIS_ICE = 4;
export const STEP_CB_TRUCK = 5;
export const STEP_CB_SECRET_BASE = 6;
export const STEP_CB_CRACKED_FLOOR = 7;

// 1:1 décomp `NUM_TASK_DATA` (task.h) = taille de gTasks[].data (= Int16Array(16)).
const NUM_TASK_DATA = 16;

// ─── 1:1 décomp `sPerStepCallbacks[]` (field_tasks.c:59-69) ─────────────────
// Table de TaskFunc indexée par STEP_CB_*. Les slots non encore portés pointent
// sur DummyPerStepCallback (placeholder documenté) en attendant leur commit dédié.
const sPerStepCallbacks: ReadonlyArray<(task: DecompTask) => void> = [
  /* [STEP_CB_DUMMY]             */ DummyPerStepCallback,
  /* [STEP_CB_ASH]               */ AshGrassPerStepCallback,
  /* [STEP_CB_FORTREE_BRIDGE]    */ DummyPerStepCallback,  // TODO port FortreeBridgePerStepCallback (field_tasks.c:490)
  /* [STEP_CB_PACIFIDLOG_BRIDGE] */ DummyPerStepCallback,  // TODO port PacifidlogBridgePerStepCallback (field_tasks.c:366)
  /* [STEP_CB_SOOTOPOLIS_ICE]    */ DummyPerStepCallback,  // TODO port SootopolisGymIcePerStepCallback (field_tasks.c:659)
  /* [STEP_CB_TRUCK]             */ DummyPerStepCallback,  // TODO câbler EndTruckSequence (field_special_scene.c → truck-cinematic.ts)
  /* [STEP_CB_SECRET_BASE]       */ DummyPerStepCallback,  // TODO port SecretBasePerStepCallback (secret_base.c, non porté)
  /* [STEP_CB_CRACKED_FLOOR]     */ CrackedFloorPerStepCallback,
];

// ─── 1:1 décomp `Task_RunPerStepCallback` (field_tasks.c:138-142) ───────────
// #define tCallbackId data[0]
//   int idx = gTasks[taskId].tCallbackId;
//   sPerStepCallbacks[idx](taskId);
// Note : notre runtime passe l'OBJET task (pas le taskId) ; on dispatch avec.
function Task_RunPerStepCallback(task: DecompTask): void {
  const idx = task.data[0]; // tCallbackId
  sPerStepCallbacks[idx](task);
}

// ─── 1:1 décomp `SetUpFieldTasks(void)` (field_tasks.c:181-194) ─────────────
export function SetUpFieldTasks(): void {
  if (!FuncIsActiveTask(Task_RunPerStepCallback)) {
    const taskId = CreateTask(Task_RunPerStepCallback, 80);
    const data = GetTaskData(taskId);
    if (data) data[0] = STEP_CB_DUMMY; // tCallbackId
  }

  // 1:1 décomp : la décomp crée AUSSI Task_MuddySlope + Task_RunTimeBasedEvents
  // ici. Différés (port staged) :
  //   - Task_MuddySlope : follow-up (anim metatile pente boueuse).
  //   - Task_RunTimeBasedEvents : entremêlé avec UpdateAmbientCry (= AUDIO, hors
  //     périmètre) ; DoTimeBasedEvents est déjà câblé au map-load (1:1).
}

// ─── 1:1 décomp `ActivatePerStepCallback(u8 callbackId)` (field_tasks.c:196-212) ──
export function ActivatePerStepCallback(callbackId: number): void {
  const taskId = FindTaskIdByFunc(Task_RunPerStepCallback);
  if (taskId !== TASK_NONE) {
    const data = GetTaskData(taskId);
    if (!data) return;
    for (let i = 0; i < NUM_TASK_DATA; i++) data[i] = 0;
    if (callbackId >= sPerStepCallbacks.length) data[0] = STEP_CB_DUMMY; // tCallbackId
    else data[0] = callbackId; // tCallbackId
  }
}

// ─── 1:1 décomp `ResetFieldTasksArgs(void)` (field_tasks.c:214-230) ─────────
// Reset les args ambient-cry de Task_RunTimeBasedEvents. Cette task étant différée
// (audio), FindTaskIdByFunc renvoie TASK_NONE → no-op pour l'instant. Structure
// conservée 1:1 ; le reset des données ambient-cry sera câblé avec le port de
// Task_RunTimeBasedEvents.
export function ResetFieldTasksArgs(): void {
  // 1:1 : la décomp lit gTasks[FindTaskIdByFunc(Task_RunPerStepCallback)].data
  // mais ne s'en sert pas (dead code). On conserve l'intention sans l'effet.
  void FindTaskIdByFunc(Task_RunPerStepCallback);
  // (reset ambient-cry de Task_RunTimeBasedEvents : différé, voir SetUpFieldTasks)
}

// ─── 1:1 décomp `DummyPerStepCallback(u8 taskId)` (field_tasks.c:235-238) ───
function DummyPerStepCallback(_task: DecompTask): void {
  // no-op (= STEP_CB_DUMMY, défaut).
}

// ─── 1:1 décomp `AshGrassPerStepCallback(u8 taskId)` (field_tasks.c:748-777) ──
// #define tPrevX data[1]
// #define tPrevY data[2]
// Retire la cendre de l'ash-grass que le joueur foule (révèle la tuile + spawn
// FldEff_Ash) et collecte la cendre dans le Soot Sack si présent.
function AshGrassPerStepCallback(task: DecompTask): void {
  const data = task.data;
  const { x, y } = PlayerGetDestCoords();

  // End if player hasn't moved.
  if (x === data[1] && y === data[2]) return; // tPrevX / tPrevY

  data[1] = x; // tPrevX
  data[2] = y; // tPrevY
  if (MetatileBehavior_IsAshGrass(MapGridGetMetatileBehaviorAt(x, y))) {
    // Remove ash from grass.
    if (MapGridGetMetatileIdAt(x, y) === METATILE_Fallarbor_AshGrass)
      StartAshFieldEffect(x, y, METATILE_Fallarbor_NormalGrass, 4);
    else
      StartAshFieldEffect(x, y, METATILE_Lavaridge_NormalGrass, 4);

    // Try to gather ash.
    // 1:1 décomp : `ashGatherCount = GetVarPointer(VAR_ASH_GATHER_COUNT);
    //               if (*ashGatherCount < 9999) (*ashGatherCount)++;`
    // GetVarPointer (event_data.c) → équivalent sémantique VarGet/VarSet.
    if (CheckBagHasItem('ITEM_SOOT_SACK', 1)) {
      const ashGatherCount = VarGet(VAR_ASH_GATHER_COUNT);
      if (ashGatherCount < 9999) VarSet(VAR_ASH_GATHER_COUNT, ashGatherCount + 1);
    }
  }
}

// ─── 1:1 décomp `SetCrackedFloorHoleMetatile(s16 x, s16 y)` (field_tasks.c:785-790) ──
// Utilise les constantes de gTileset_Cave mais les autres tilesets avec le callback
// CrackedFloorPerStepCallback réutilisent les mêmes numéros (gTileset_MirageTower…).
function SetCrackedFloorHoleMetatile(x: number, y: number): void {
  const metatileId = MapGridGetMetatileIdAt(x, y) === METATILE_Cave_CrackedFloor
    ? METATILE_Cave_CrackedFloor_Hole
    : METATILE_Pacifidlog_SkyPillar_CrackedFloor_Hole;
  MapGridSetMetatileIdAt(x, y, metatileId);
  const cam = GetCameraTopLeftCoords();
  CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
}

// ─── 1:1 décomp `CrackedFloorPerStepCallback(u8 taskId)` (field_tasks.c:801-842) ──
// #define tPrevX       data[2]
// #define tPrevY       data[3]
// #define tFloor1Delay data[4]
// #define tFloor1X     data[5]
// #define tFloor1Y     data[6]
// #define tFloor2Delay data[7]
// #define tFloor2X     data[8]
// #define tFloor2Y     data[9]
// Casse les sols fissurés (cracked floor → hole) après un délai ; suit jusqu'à 2
// cases en parallèle. VAR_ICE_STEP_COUNT fait "double duty" (réutilisé ici).
function CrackedFloorPerStepCallback(task: DecompTask): void {
  const data = task.data;
  const { x, y } = PlayerGetDestCoords();
  const behavior = MapGridGetMetatileBehaviorAt(x, y);

  // Update up to 2 previous cracked floor spaces.
  if (data[4] !== 0 && (--data[4]) === 0) SetCrackedFloorHoleMetatile(data[5], data[6]); // tFloor1*
  if (data[7] !== 0 && (--data[7]) === 0) SetCrackedFloorHoleMetatile(data[8], data[9]); // tFloor2*

  if (MetatileBehavior_IsCrackedFloorHole(behavior))
    VarSet(VAR_ICE_STEP_COUNT, 0); // this var does double duty

  // End if player hasn't moved.
  if (x === data[2] && y === data[3]) return; // tPrevX / tPrevY

  data[2] = x; // tPrevX
  data[3] = y; // tPrevY
  if (MetatileBehavior_IsCrackedFloor(behavior)) {
    if (GetPlayerSpeed() !== PLAYER_SPEED_FASTEST)
      VarSet(VAR_ICE_STEP_COUNT, 0); // this var does double duty

    if (data[4] === 0) { // tFloor1Delay
      data[4] = 3;
      data[5] = x; // tFloor1X
      data[6] = y; // tFloor1Y
    } else if (data[7] === 0) { // tFloor2Delay
      data[7] = 3;
      data[8] = x; // tFloor2X
      data[9] = y; // tFloor2Y
    }
  }
}

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
 *   ✅ infra dispatch + LES 5 callbacks IN-FILE (A/B réel vérifié sur leur map) :
 *      `AshGrassPerStepCallback` (Route 113), `CrackedFloorPerStepCallback` (Sky
 *      Pillar), `SootopolisGymIcePerStepCallback` (Sootopolis Gym),
 *      `FortreeBridgePerStepCallback` (Fortree City), `PacifidlogBridgePerStepCallback`
 *      (Pacifidlog).
 *   ✅ `EndTruckSequence` (STEP_CB_TRUCK) câblé depuis truck-cinematic.ts.
 *   ✅ `SecretBasePerStepCallback` (STEP_CB_SECRET_BASE) porté dans secret_base.ts
 *      (+ sa chaîne PopSecretBaseBalloon/ShatterSecretBaseBreakableDoor dans fldeff_misc.ts).
 *      → TABLE sPerStepCallbacks 100% 1:1 (8/8 slots = vraies fonctions décomp).
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
import { PlayerGetDestCoords, PlayerGetElevation } from '../engine/field/player-avatar';
import { MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt, MapGridSetMetatileIdAt, MAP_OFFSET, gMapHeader, gCamera } from '../engine/field/map-loader';
import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { CurrentMapDrawMetatileAt, GetCameraTopLeftCoords } from '../engine/field/field-camera';
import {
  MetatileBehavior_IsAshGrass,
  MetatileBehavior_IsCrackedFloor,
  MetatileBehavior_IsCrackedFloorHole,
  MetatileBehavior_IsThinIce,
  MetatileBehavior_IsCrackedIce,
  MetatileBehavior_IsFortreeBridge,
  MetatileBehavior_IsPacifidlogVerticalLogTop,
  MetatileBehavior_IsPacifidlogVerticalLogBottom,
  MetatileBehavior_IsPacifidlogHorizontalLogLeft,
  MetatileBehavior_IsPacifidlogHorizontalLogRight,
  MetatileBehavior_IsMuddySlope,
} from './metatile_behavior';
import { StartAshFieldEffect } from './field_effect_helpers';
import { CheckBagHasItem } from '../engine/bag/bag';
import { GetPlayerSpeed, PLAYER_SPEED_FASTEST } from '../engine/field/field-control-avatar';
import { EndTruckSequence } from '../engine/field/truck-cinematic';
import { SecretBasePerStepCallback } from './secret_base';
import { VarGet, VarSet } from './event_data';
import {
  METATILE_Fallarbor_AshGrass,
  METATILE_Fallarbor_NormalGrass,
  METATILE_Lavaridge_NormalGrass,
  METATILE_Cave_CrackedFloor,
  METATILE_Cave_CrackedFloor_Hole,
  METATILE_Pacifidlog_SkyPillar_CrackedFloor_Hole,
  METATILE_SootopolisGym_Ice_Cracked,
  METATILE_SootopolisGym_Ice_Broken,
  METATILE_Fortree_BridgeOverGrass_Raised,
  METATILE_Fortree_BridgeOverGrass_Lowered,
  METATILE_Fortree_BridgeOverTrees_Raised,
  METATILE_Fortree_BridgeOverTrees_Lowered,
  METATILE_Pacifidlog_HalfSubmergedLogs_VerticalTop,
  METATILE_Pacifidlog_HalfSubmergedLogs_VerticalBottom,
  METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalLeft,
  METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalRight,
  METATILE_Pacifidlog_SubmergedLogs_VerticalTop,
  METATILE_Pacifidlog_SubmergedLogs_VerticalBottom,
  METATILE_Pacifidlog_SubmergedLogs_HorizontalLeft,
  METATILE_Pacifidlog_SubmergedLogs_HorizontalRight,
  METATILE_Pacifidlog_FloatingLogs_VerticalTop,
  METATILE_Pacifidlog_FloatingLogs_VerticalBottom,
  METATILE_Pacifidlog_FloatingLogs_HorizontalLeft,
  METATILE_Pacifidlog_FloatingLogs_HorizontalRight,
  METATILE_General_MuddySlope_Frame0,
  METATILE_General_MuddySlope_Frame1,
  METATILE_General_MuddySlope_Frame2,
  METATILE_General_MuddySlope_Frame3,
} from '../engine/decomp-data/include/constants/metatile_labels-data';
import {
  VAR_ASH_GATHER_COUNT,
  VAR_ICE_STEP_COUNT,
  VAR_TEMP_1, VAR_TEMP_2, VAR_TEMP_3, VAR_TEMP_4, VAR_TEMP_5,
  VAR_TEMP_6, VAR_TEMP_7, VAR_TEMP_8, VAR_TEMP_9, VAR_TEMP_A,
} from './include/constants/vars';

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
  /* [STEP_CB_FORTREE_BRIDGE]    */ FortreeBridgePerStepCallback,
  /* [STEP_CB_PACIFIDLOG_BRIDGE] */ PacifidlogBridgePerStepCallback,
  /* [STEP_CB_SOOTOPOLIS_ICE]    */ SootopolisGymIcePerStepCallback,
  /* [STEP_CB_TRUCK]             */ EndTruckSequence,  // field_special_scene.c (truck-cinematic.ts)
  /* [STEP_CB_SECRET_BASE]       */ SecretBasePerStepCallback,  // secret_base.c (secret_base.ts)
  /* [STEP_CB_CRACKED_FLOOR]     */ CrackedFloorPerStepCallback,
];

// Adaptateur 1:1 : la décomp `CurrentMapDrawMetatileAt(x, y)` lit le
// `sFieldCameraOffset` global ; notre signature 4-args prend la position caméra
// explicite (= GetCameraTopLeftCoords()).
function _drawMapMetatileAt(x: number, y: number): void {
  const cam = GetCameraTopLeftCoords();
  CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
}

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

  // 1:1 décomp `if (!FuncIsActiveTask(Task_MuddySlope)) CreateTask(Task_MuddySlope, 80);`
  if (!FuncIsActiveTask(Task_MuddySlope)) CreateTask(Task_MuddySlope, 80);

  // 1:1 décomp : la décomp crée AUSSI Task_RunTimeBasedEvents ici. Différé :
  // entremêlé avec UpdateAmbientCry (= AUDIO, hors périmètre) ; DoTimeBasedEvents
  // est déjà câblé au map-load (1:1).
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

// ════════════════════════════════════════════════════════════════════════════
// Sootopolis Gym — puzzle de glace (field_tasks.c:599-736)
// ════════════════════════════════════════════════════════════════════════════

// Boundaries of the ice puzzle in Sootopolis Gym (field_tasks.c:600-606).
const ICE_PUZZLE_L = 3;
const ICE_PUZZLE_R = 13;
const ICE_PUZZLE_T = 6;
const ICE_PUZZLE_B = 19;
const ICE_PUZZLE_WIDTH = ICE_PUZZLE_R - ICE_PUZZLE_L + 1;  // 11
const ICE_PUZZLE_HEIGHT = ICE_PUZZLE_B - ICE_PUZZLE_T + 1; // 14

// 1:1 décomp `sSootopolisGymIceRowVars[]` (field_tasks.c:106-134). Chaque élément
// correspond à une ROW y de Sootopolis Gym 1F. Les rows avec de la glace ont un
// VAR_TEMP_* qui track les pas (1 bit par x depuis le bord gauche). Casse si le
// puzzle fait > 16 cases de large.
const sSootopolisGymIceRowVars: ReadonlyArray<number> = [
  0, 0, 0, 0, 0, 0,
  VAR_TEMP_1, VAR_TEMP_2, VAR_TEMP_3, VAR_TEMP_4,
  0, 0,
  VAR_TEMP_5, VAR_TEMP_6, VAR_TEMP_7,
  0, 0,
  VAR_TEMP_8, VAR_TEMP_9, VAR_TEMP_A,
  0, 0, 0, 0, 0, 0,
];

// 1:1 décomp `CoordInIcePuzzleRegion(s16 x, s16 y)` (field_tasks.c:608-616).
// `(u16)(coord - min) < extent` = check de range non-signé (émulé via & 0xFFFF).
function CoordInIcePuzzleRegion(x: number, y: number): boolean {
  return (((x - ICE_PUZZLE_L) & 0xFFFF) < ICE_PUZZLE_WIDTH
       && ((y - ICE_PUZZLE_T) & 0xFFFF) < ICE_PUZZLE_HEIGHT
       && sSootopolisGymIceRowVars[y] !== 0);
}

// 1:1 décomp `MarkIcePuzzleCoordVisited(s16 x, s16 y)` (field_tasks.c:618-622).
// `*GetVarPointer(var) |= bit` → VarGet/VarSet (GetVarPointer du bridge throw).
function MarkIcePuzzleCoordVisited(x: number, y: number): void {
  if (CoordInIcePuzzleRegion(x, y)) {
    const varId = sSootopolisGymIceRowVars[y];
    VarSet(varId, VarGet(varId) | (1 << (x - ICE_PUZZLE_L)));
  }
}

// 1:1 décomp `IsIcePuzzleCoordVisited(s16 x, s16 y)` (field_tasks.c:624-635).
function IsIcePuzzleCoordVisited(x: number, y: number): boolean {
  if (!CoordInIcePuzzleRegion(x, y)) return false;
  const v = VarGet(sSootopolisGymIceRowVars[y]);
  return (v & (1 << (x - ICE_PUZZLE_L))) !== 0;
}

// 1:1 décomp `SetSootopolisGymCrackedIceMetatiles(void)` (field_tasks.c:637-650).
// Restaure les tuiles de glace fissurée déjà visitées au chargement du gym.
export function SetSootopolisGymCrackedIceMetatiles(): void {
  if (!gMapHeader?.mapLayout) return;
  const width = gMapHeader.mapLayout.width;
  const height = gMapHeader.mapLayout.height;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (IsIcePuzzleCoordVisited(x, y))
        MapGridSetMetatileIdAt(x + MAP_OFFSET, y + MAP_OFFSET, METATILE_SootopolisGym_Ice_Cracked);
    }
  }
}

// 1:1 décomp `SootopolisGymIcePerStepCallback(u8 taskId)` (field_tasks.c:652-736).
// #define tState data[1]
// #define tPrevX data[2]
// #define tPrevY data[3]
// #define tIceX  data[4]
// #define tIceY  data[5]
// #define tDelay data[6]
// Thin ice → cracked (après délai 4) → broken (après délai 4). PlaySE SKIP (audio).
function SootopolisGymIcePerStepCallback(task: DecompTask): void {
  const data = task.data;
  switch (data[1]) { // tState
    case 0: {
      const { x, y } = PlayerGetDestCoords();
      data[2] = x; // tPrevX
      data[3] = y; // tPrevY
      data[1] = 1; // tState
      break;
    }
    case 1: {
      const { x, y } = PlayerGetDestCoords();
      // End if player hasn't moved.
      if (x === data[2] && y === data[3]) return; // tPrevX / tPrevY
      data[2] = x;
      data[3] = y;
      const tileBehavior = MapGridGetMetatileBehaviorAt(x, y);
      if (MetatileBehavior_IsThinIce(tileBehavior)) {
        // Thin ice, set it to cracked ice.
        VarSet(VAR_ICE_STEP_COUNT, VarGet(VAR_ICE_STEP_COUNT) + 1);
        data[6] = 4; // tDelay
        data[1] = 2; // tState
        data[4] = x; // tIceX
        data[5] = y; // tIceY
      } else if (MetatileBehavior_IsCrackedIce(tileBehavior)) {
        // Cracked ice, set it to broken ice.
        VarSet(VAR_ICE_STEP_COUNT, 0);
        data[6] = 4; // tDelay
        data[1] = 3; // tState
        data[4] = x;
        data[5] = y;
      }
      break;
    }
    case 2: {
      if (data[6] !== 0) { // tDelay
        data[6]--;
      } else {
        // Crack ice.
        const x = data[4], y = data[5]; // tIceX / tIceY
        // PlaySE(SE_ICE_CRACK) — SKIP audio (1:1 contrat).
        MapGridSetMetatileIdAt(x, y, METATILE_SootopolisGym_Ice_Cracked);
        const cam = GetCameraTopLeftCoords();
        CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
        MarkIcePuzzleCoordVisited(x - MAP_OFFSET, y - MAP_OFFSET);
        data[1] = 1; // tState
      }
      break;
    }
    case 3: {
      if (data[6] !== 0) { // tDelay
        data[6]--;
      } else {
        // Break ice.
        const x = data[4], y = data[5];
        // PlaySE(SE_ICE_BREAK) — SKIP audio (1:1 contrat).
        MapGridSetMetatileIdAt(x, y, METATILE_SootopolisGym_Ice_Broken);
        const cam = GetCameraTopLeftCoords();
        CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
        data[1] = 1; // tState
      }
      break;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Fortree City — ponts en rondins qui s'abaissent (field_tasks.c:449-590)
// ════════════════════════════════════════════════════════════════════════════

// 1:1 décomp `TryLowerFortreeBridge(s16 x, s16 y)` (field_tasks.c:449-464).
// N'abaisse que si l'élévation joueur est paire (= sur le pont, pas dessous).
function TryLowerFortreeBridge(x: number, y: number): void {
  const elevation = PlayerGetElevation();
  if ((elevation & 1) === 0) {
    switch (MapGridGetMetatileIdAt(x, y)) {
      case METATILE_Fortree_BridgeOverGrass_Raised:
        MapGridSetMetatileIdAt(x, y, METATILE_Fortree_BridgeOverGrass_Lowered);
        break;
      case METATILE_Fortree_BridgeOverTrees_Raised:
        MapGridSetMetatileIdAt(x, y, METATILE_Fortree_BridgeOverTrees_Lowered);
        break;
    }
  }
}

// 1:1 décomp `TryRaiseFortreeBridge(s16 x, s16 y)` (field_tasks.c:466-481).
function TryRaiseFortreeBridge(x: number, y: number): void {
  const elevation = PlayerGetElevation();
  if ((elevation & 1) === 0) {
    switch (MapGridGetMetatileIdAt(x, y)) {
      case METATILE_Fortree_BridgeOverGrass_Lowered:
        MapGridSetMetatileIdAt(x, y, METATILE_Fortree_BridgeOverGrass_Raised);
        break;
      case METATILE_Fortree_BridgeOverTrees_Lowered:
        MapGridSetMetatileIdAt(x, y, METATILE_Fortree_BridgeOverTrees_Raised);
        break;
    }
  }
}

// 1:1 décomp `FortreeBridgePerStepCallback` case 2 (field_tasks.c:564-588).
// Extrait dans un helper : le décomp tombe (fallthrough) de case 1 vers case 2
// pour exécuter ce corps UNE fois dans la même frame → on l'appelle explicitement
// (TS interdit le fallthrough non-vide). tBounceTime = data[6], tOldBridge* = data[4]/[5].
function _fortreeBridgeBounce(data: number[]): void {
  data[6]--; // tBounceTime
  const prevX = data[4]; // tOldBridgeX
  const prevY = data[5]; // tOldBridgeY
  // 1:1 décomp switch(tBounceTime % 7) avec fallthrough :
  //   case 0 → draw seul ; case 4 → lower+draw+raise ; autres → rien.
  switch (data[6] % 7) {
    case 0:
      _drawMapMetatileAt(prevX, prevY);
      break;
    case 4:
      // Bounce bridge section that player has stepped off of.
      TryLowerFortreeBridge(prevX, prevY);
      _drawMapMetatileAt(prevX, prevY);
      TryRaiseFortreeBridge(prevX, prevY);
      break;
    default:
      break;
  }
  if (data[6] === 0) data[1] = 1; // tState
}

// 1:1 décomp `FortreeBridgePerStepCallback(u8 taskId)` (field_tasks.c:490-590).
// #define tState      data[1]
// #define tPrevX      data[2]
// #define tPrevY      data[3]
// #define tOldBridgeX data[4]
// #define tOldBridgeY data[5]
// #define tBounceTime data[6]
// Abaisse la section de pont foulée, relève la précédente, puis joue un rebond
// (state 2). ⚠️ Chemin NON-BUGFIX (config.h: `//#define BUGFIX` commenté = ROM) :
// `if (isFortreeBridgePrev)` seul → les sections ne s'abaissent pas en y entrant
// depuis autre chose qu'un pont (quirk d'origine répliqué).
function FortreeBridgePerStepCallback(task: DecompTask): void {
  const data = task.data;
  const { x, y } = PlayerGetDestCoords();
  switch (data[1]) { // tState
    default:
      break;
    case 0:
      data[2] = x; // tPrevX
      data[3] = y; // tPrevY
      // Si déjà sur le pont à l'activation du callback, abaisse-le tout de suite.
      if (MetatileBehavior_IsFortreeBridge(MapGridGetMetatileBehaviorAt(x, y))) {
        TryLowerFortreeBridge(x, y);
        _drawMapMetatileAt(x, y);
      }
      data[1] = 1; // tState
      break;
    case 1: {
      const prevX = data[2]; // tPrevX
      const prevY = data[3]; // tPrevY
      // Skip if player hasn't moved.
      if (x === prevX && y === prevY) break;

      // isFortreeBridgeCur n'est lu que par le gate PlaySE(SE_BRIDGE_WALK) — SKIP audio.
      const isFortreeBridgePrev = MetatileBehavior_IsFortreeBridge(MapGridGetMetatileBehaviorAt(prevX, prevY));

      // 1:1 décomp : `elevation`/`onBridgeElevation` ne servent qu'au gate
      // PlaySE(SE_BRIDGE_WALK) → calcul omis (audio hors périmètre).

      // Non-BUGFIX (ROM) : `if (isFortreeBridgePrev)`.
      if (isFortreeBridgePrev) {
        // Raise old bridge.
        TryRaiseFortreeBridge(prevX, prevY);
        _drawMapMetatileAt(prevX, prevY);
        // Lower new bridge.
        TryLowerFortreeBridge(x, y);
        _drawMapMetatileAt(x, y);
      }

      data[4] = prevX; // tOldBridgeX
      data[5] = prevY; // tOldBridgeY
      data[2] = x; // tPrevX
      data[3] = y; // tPrevY
      if (!isFortreeBridgePrev) break;

      data[6] = 16; // tBounceTime
      data[1] = 2;  // tState
      // 1:1 décomp : fallthrough vers case 2 (exécute le rebond une fois).
      _fortreeBridgeBounce(data);
      break;
    }
    case 2:
      _fortreeBridgeBounce(data);
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Pacifidlog Town — ponts en rondins qui s'enfoncent (field_tasks.c:240-447)
// ════════════════════════════════════════════════════════════════════════════

// 1:1 décomp `struct PacifidlogMetatileOffsets` (field_tasks.c:44-49).
interface PacifidlogMetatileOffsets { x: number; y: number; metatileId: number; }

// 1:1 décomp : chaque table = 4 paires (8 entrées). Une paire = les 2 metatiles
// d'un rondin + leur position relative. Les 4 paires :
//   0: joueur sur le HAUT d'un rondin vertical
//   1: joueur sur le BAS d'un rondin vertical
//   2: joueur sur la GAUCHE d'un rondin horizontal
//   3: joueur sur la DROITE d'un rondin horizontal
// (l'élément à offset 0,0 = celui où se tient le joueur.)
const sHalfSubmergedBridgeMetatileOffsets: ReadonlyArray<PacifidlogMetatileOffsets> = [
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_VerticalTop }, { x: 0, y: 1, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_VerticalBottom },
  { x: 0, y: -1, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_VerticalTop }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_VerticalBottom },
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalLeft }, { x: 1, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalRight },
  { x: -1, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalLeft }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_HalfSubmergedLogs_HorizontalRight },
];

const sFullySubmergedBridgeMetatileOffsets: ReadonlyArray<PacifidlogMetatileOffsets> = [
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_VerticalTop }, { x: 0, y: 1, metatileId: METATILE_Pacifidlog_SubmergedLogs_VerticalBottom },
  { x: 0, y: -1, metatileId: METATILE_Pacifidlog_SubmergedLogs_VerticalTop }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_VerticalBottom },
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_HorizontalLeft }, { x: 1, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_HorizontalRight },
  { x: -1, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_HorizontalLeft }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_SubmergedLogs_HorizontalRight },
];

const sFloatingBridgeMetatileOffsets: ReadonlyArray<PacifidlogMetatileOffsets> = [
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_VerticalTop }, { x: 0, y: 1, metatileId: METATILE_Pacifidlog_FloatingLogs_VerticalBottom },
  { x: 0, y: -1, metatileId: METATILE_Pacifidlog_FloatingLogs_VerticalTop }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_VerticalBottom },
  { x: 0, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_HorizontalLeft }, { x: 1, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_HorizontalRight },
  { x: -1, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_HorizontalLeft }, { x: 0, y: 0, metatileId: METATILE_Pacifidlog_FloatingLogs_HorizontalRight },
];

// 1:1 décomp `GetPacifidlogBridgeMetatileOffsets` (field_tasks.c:240-252).
// Retourne l'INDEX de base de la paire (0/2/4/6) selon le type de rondin, ou -1
// (= NULL décomp, position pas un rondin).
function GetPacifidlogBridgeMetatileOffsets(metatileBehavior: number): number {
  if (MetatileBehavior_IsPacifidlogVerticalLogTop(metatileBehavior)) return 0 * 2;
  else if (MetatileBehavior_IsPacifidlogVerticalLogBottom(metatileBehavior)) return 1 * 2;
  else if (MetatileBehavior_IsPacifidlogHorizontalLogLeft(metatileBehavior)) return 2 * 2;
  else if (MetatileBehavior_IsPacifidlogHorizontalLogRight(metatileBehavior)) return 3 * 2;
  else return -1;
}

// 1:1 décomp `TrySetPacifidlogBridgeMetatiles` (field_tasks.c:254-270).
function TrySetPacifidlogBridgeMetatiles(
  table: ReadonlyArray<PacifidlogMetatileOffsets>, x: number, y: number, redrawMap: boolean,
): void {
  const base = GetPacifidlogBridgeMetatileOffsets(MapGridGetMetatileBehaviorAt(x, y));
  // Si base < 0, position pas un rondin (ne rien set).
  if (base >= 0) {
    const o0 = table[base], o1 = table[base + 1];
    MapGridSetMetatileIdAt(x + o0.x, y + o0.y, o0.metatileId);
    if (redrawMap) _drawMapMetatileAt(x + o0.x, y + o0.y);
    MapGridSetMetatileIdAt(x + o1.x, y + o1.y, o1.metatileId);
    if (redrawMap) _drawMapMetatileAt(x + o1.x, y + o1.y);
  }
}

// 1:1 décomp TrySetLogBridge{HalfSubmerged,FullySubmerged,Floating} (field_tasks.c:272-285).
function TrySetLogBridgeHalfSubmerged(x: number, y: number, redrawMap: boolean): void {
  TrySetPacifidlogBridgeMetatiles(sHalfSubmergedBridgeMetatileOffsets, x, y, redrawMap);
}
function TrySetLogBridgeFullySubmerged(x: number, y: number, redrawMap: boolean): void {
  TrySetPacifidlogBridgeMetatiles(sFullySubmergedBridgeMetatileOffsets, x, y, redrawMap);
}
function TrySetLogBridgeFloating(x: number, y: number, redrawMap: boolean): void {
  TrySetPacifidlogBridgeMetatiles(sFloatingBridgeMetatileOffsets, x, y, redrawMap);
}

// 1:1 décomp `ShouldRaisePacifidlogLogs` (field_tasks.c:287-320). FALSE si le joueur
// a bougé d'un bout du rondin à l'autre (le rondin reste submergé).
function ShouldRaisePacifidlogLogs(newX: number, newY: number, oldX: number, oldY: number): boolean {
  const oldBehavior = MapGridGetMetatileBehaviorAt(oldX, oldY);
  if (MetatileBehavior_IsPacifidlogVerticalLogTop(oldBehavior)) {
    if (newY > oldY) return false;
  } else if (MetatileBehavior_IsPacifidlogVerticalLogBottom(oldBehavior)) {
    if (newY < oldY) return false;
  } else if (MetatileBehavior_IsPacifidlogHorizontalLogLeft(oldBehavior)) {
    if (newX > oldX) return false;
  } else if (MetatileBehavior_IsPacifidlogHorizontalLogRight(oldBehavior)) {
    if (newX < oldX) return false;
  }
  return true;
}

// 1:1 décomp `ShouldSinkPacifidlogLogs` (field_tasks.c:328-357).
function ShouldSinkPacifidlogLogs(newX: number, newY: number, oldX: number, oldY: number): boolean {
  const newBehavior = MapGridGetMetatileBehaviorAt(newX, newY);
  if (MetatileBehavior_IsPacifidlogVerticalLogTop(newBehavior)) {
    if (newY < oldY) return false;
  } else if (MetatileBehavior_IsPacifidlogVerticalLogBottom(newBehavior)) {
    if (newY > oldY) return false;
  } else if (MetatileBehavior_IsPacifidlogHorizontalLogLeft(newBehavior)) {
    if (newX < oldX) return false;
  } else if (MetatileBehavior_IsPacifidlogHorizontalLogRight(newBehavior)) {
    if (newX > oldX) return false;
  }
  return true;
}

// 1:1 décomp `PacifidlogBridgePerStepCallback(u8 taskId)` (field_tasks.c:366-440).
// #define tState    data[1]
// #define tPrevX    data[2]
// #define tPrevY    data[3]
// #define tToRaiseX data[4]
// #define tToRaiseY data[5]
// #define tDelay    data[6]
// Le rondin foulé s'enfonce ; le précédent remonte à la surface (avec délai).
function PacifidlogBridgePerStepCallback(task: DecompTask): void {
  const data = task.data;
  const { x, y } = PlayerGetDestCoords();
  switch (data[1]) { // tState
    case 0:
      data[2] = x; // tPrevX
      data[3] = y; // tPrevY
      // Si le joueur est déjà sur un rondin à l'activation, l'enfonce tout de suite.
      TrySetLogBridgeFullySubmerged(x, y, true);
      data[1] = 1; // tState
      break;
    case 1: {
      // Skip if player hasn't moved.
      if (x === data[2] && y === data[3]) return; // tPrevX / tPrevY

      if (ShouldRaisePacifidlogLogs(x, y, data[2], data[3])) {
        // Position précédente pas l'autre bout d'un rondin courant → remonte (surface).
        // Le metatile flottant est mis en file (set sans draw) ; inutile car state 2
        // le gère en entier, mais 1:1 décomp.
        TrySetLogBridgeHalfSubmerged(data[2], data[3], true);
        TrySetLogBridgeFloating(data[2], data[3], false);
        data[4] = data[2]; // tToRaiseX = tPrevX
        data[5] = data[3]; // tToRaiseY = tPrevY
        data[1] = 2; // tState
        data[6] = 8; // tDelay
      } else {
        // A bougé mais reste sur la même section de pont → reste submergé.
        data[4] = -1; // tToRaiseX
        data[5] = -1; // tToRaiseY
      }

      if (ShouldSinkPacifidlogLogs(x, y, data[2], data[3])) {
        // Position courante pas l'autre bout d'un rondin précédent → enfonce (sinking).
        TrySetLogBridgeHalfSubmerged(x, y, true);
        data[1] = 2; // tState
        data[6] = 8; // tDelay
      }

      data[2] = x; // tPrevX
      data[3] = y; // tPrevY

      // 1:1 décomp : `if (IsPacifidlogLog(beh)) PlaySE(SE_PUDDLE)` — gate audio
      // uniquement → omis (audio hors périmètre).
      break;
    }
    case 2:
      if ((--data[6]) === 0) { // tDelay
        // Si position courante = rondin, enfonce-le complètement.
        TrySetLogBridgeFullySubmerged(x, y, true);
        // Position précédente pas l'autre bout d'un rondin courant → remonte.
        if (data[4] !== -1 && data[5] !== -1) // tToRaiseX / tToRaiseY
          TrySetLogBridgeFloating(data[4], data[5], true);
        data[1] = 1; // tState
      }
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Pentes boueuses — anim metatile au passage (field_tasks.c:853-957)
// ════════════════════════════════════════════════════════════════════════════
// #define tMapId data[0]
// #define tState data[1]
// #define tPrevX data[2]
// #define tPrevY data[3]
// data[4..15] = jusqu'à 4 pentes en cours d'animation, par triplets (time, x, y).
const SLOPE_TIME = 0;
const SLOPE_X = 1;
const SLOPE_Y = 2;
const SLOPE_DATA_SIZE = 3;
const SLOPE_DATA_START = 4;
const SLOPE_DATA_END = 3 * SLOPE_DATA_SIZE + SLOPE_DATA_START; // 13

// 1:1 décomp `sMuddySlopeMetatiles[]` (field_tasks.c:870-875). Ordre : 0,3,2,1.
const sMuddySlopeMetatiles: ReadonlyArray<number> = [
  METATILE_General_MuddySlope_Frame0,
  METATILE_General_MuddySlope_Frame3,
  METATILE_General_MuddySlope_Frame2,
  METATILE_General_MuddySlope_Frame1,
];

const SLOPE_ANIM_TIME = 32;
const SLOPE_ANIM_STEP_TIME = (SLOPE_ANIM_TIME / sMuddySlopeMetatiles.length) | 0; // 8

// 1:1 décomp `SetMuddySlopeMetatile(s16 *data, s16 x, s16 y)` (field_tasks.c:880-891).
// La décomp passe `&data[i + SLOPE_TIME]` → on passe (data, timeIdx) à la place.
function SetMuddySlopeMetatile(data: number[], timeIdx: number, x: number, y: number): void {
  let metatileId: number;
  if ((--data[timeIdx]) === 0)
    metatileId = METATILE_General_MuddySlope_Frame0;
  else
    metatileId = sMuddySlopeMetatiles[(data[timeIdx] / SLOPE_ANIM_STEP_TIME) | 0];

  MapGridSetMetatileIdAt(x, y, metatileId);
  _drawMapMetatileAt(x, y);
  // 1:1 décomp : remet immédiatement Frame0 dans la grille (l'anim n'est que dessinée).
  MapGridSetMetatileIdAt(x, y, METATILE_General_MuddySlope_Frame0);
}

// 1:1 décomp `Task_MuddySlope(u8 taskId)` (field_tasks.c:893-957).
function Task_MuddySlope(task: DecompTask): void {
  const data = task.data;
  const { x, y } = PlayerGetDestCoords();
  const mapId = ((gSaveBlock1Ptr.location?.mapGroup ?? 0) << 8) | (gSaveBlock1Ptr.location?.mapNum ?? 0);
  switch (data[1]) { // tState
    case 0:
      data[0] = mapId; // tMapId
      data[2] = x; // tPrevX
      data[3] = y; // tPrevY
      data[1] = 1; // tState
      data[SLOPE_DATA_START + 0 * SLOPE_DATA_SIZE] = 0; // tSlopeAnimTime(0) = data[4]
      data[SLOPE_DATA_START + 1 * SLOPE_DATA_SIZE] = 0; // data[7]
      data[SLOPE_DATA_START + 2 * SLOPE_DATA_SIZE] = 0; // data[10]
      data[SLOPE_DATA_START + 3 * SLOPE_DATA_SIZE] = 0; // data[13]
      break;
    case 1:
      // Skip if player hasn't moved.
      if (data[2] === x && data[3] === y) break; // tPrevX / tPrevY
      data[2] = x;
      data[3] = y;
      if (MetatileBehavior_IsMuddySlope(MapGridGetMetatileBehaviorAt(x, y))) {
        for (let i = SLOPE_DATA_START; i <= SLOPE_DATA_END; i += SLOPE_DATA_SIZE) {
          if (data[i] === 0) {
            data[i + SLOPE_TIME] = SLOPE_ANIM_TIME;
            data[i + SLOPE_X] = x;
            data[i + SLOPE_Y] = y;
            break;
          }
        }
      }
      break;
  }

  let cameraOffsetX: number, cameraOffsetY: number;
  if (gCamera.active && mapId !== data[0]) { // tMapId
    data[0] = mapId;
    cameraOffsetX = gCamera.x;
    cameraOffsetY = gCamera.y;
  } else {
    cameraOffsetX = 0;
    cameraOffsetY = 0;
  }

  for (let i = SLOPE_DATA_START; i <= SLOPE_DATA_END; i += SLOPE_DATA_SIZE) {
    if (data[i + SLOPE_TIME]) {
      data[i + SLOPE_X] -= cameraOffsetX;
      data[i + SLOPE_Y] -= cameraOffsetY;
      SetMuddySlopeMetatile(data, i + SLOPE_TIME, data[i + SLOPE_X], data[i + SLOPE_Y]);
    }
  }
}

/**
 * field_special_scene.ts — Port 1:1 STRICT décomp `field_special_scene.c`
 * (= partie séquence camion d'intro, src/field_special_scene.c:22-279).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_special_scene.c`
 * lignes 22-279.
 *
 * Architecture décomp (= 4 tasks indépendantes, chacune tick à 60fps) :
 *   - Task_HandleTruckSequence (master state machine 0-5)
 *     - state 0 : wait 90 frames → SetCameraPanningCallback(NULL) +
 *                 CreateTask(Task_Truck1) + state 1 + PlaySE(SE_TRUCK_MOVE)
 *     - state 1 : wait 150 frames → FadeInFromBlack + state 2
 *     - state 2 : wait !gPaletteFade.active && tTimer > 300 → DestroyTask(Task_Truck1)
 *                 + CreateTask(Task_Truck2) + state 3 + PlaySE(SE_TRUCK_STOP)
 *     - state 3 : wait !gTasks[tTaskId2].isActive → InstallCameraPanAheadCallback
 *                 + state 4
 *     - state 4 : wait 90 frames → PlaySE(SE_TRUCK_UNLOAD) + state 5
 *     - state 5 : wait 120 frames → 3 metatile changes (door open) +
 *                 DrawWholeMapView + PlaySE(SE_TRUCK_DOOR) + DestroyTask(master) +
 *                 UnlockPlayerFieldControls
 *
 *   - Task_Truck1 (= camera Y bob + box bouncing, tick durant master state 1+2) :
 *       yBox1 = GetTruckBoxYMovement(tTimer + 30) * 4   // PRE
 *       Set box1 pos                                     // PRE
 *       yBox2 = GetTruckBoxYMovement(tTimer) * 2         // PRE
 *       Set box2 pos                                     // PRE
 *       yBox3 = GetTruckBoxYMovement(tTimer) * 4         // PRE
 *       Set box3 pos                                     // PRE
 *       if (++tTimer == 30000) tTimer = 0                // POST-increment
 *       SetCameraPanning(0, GetTruckCameraBobbingY(tTimer))  // POST value
 *
 *   - Task_Truck2 (= camera X table iteration + Y bob + box bouncing,
 *                  tick durant master state 3 jusqu'à xpan==2) :
 *       tTimerHorizontal++; tTimerVertical++;            // PRE both
 *       if (tTimerHorizontal > 5) { tTimerHorizontal=0; tMoveStep++; }
 *       if (tMoveStep === 19) DestroyTask (never reached)
 *       else :
 *         if (table[tMoveStep] == 2) task.func = Task_Truck3 (= SWAP PERMANENT)
 *         xpan = table[tMoveStep]
 *         ypan = GetTruckCameraBobbingY(tTimerVertical)
 *         SetCameraPanning + box bouncing avec same tTimerVertical
 *
 *   - Task_Truck3 (= remplace Task_Truck2 après swap, no Y bob, no box bouncing)
 *       tTimerHorizontal++;                              // PRE
 *       if (tTimerHorizontal > 5) { tTimerHorizontal=0; tMoveStep++; }
 *       if (tMoveStep === 19) DestroyTask (= actual termination)
 *       else :
 *         xpan = table[tMoveStep]
 *         ypan = 0
 *         SetCameraPanning(xpan, 0)
 *         Set 3 boxes à (BOX_X_OFFSET - xpan, BOX_Y_OFFSET + 0)
 *
 *   - EndTruckSequence(taskId) : appelée comme per-step callback STEP_CB_TRUCK
 *       (field_tasks.c:66). Si master Task_HandleTruckSequence n'est plus actif,
 *       reset les 3 boxes à leurs offsets default.
 *
 * IMPORTANT : task.data est un Int16Array dans notre runtime (= s16 1:1 décomp).
 * `++tTimer == 30000` wrap correctement parce que 30000 fits dans s16.
 */
import type { DecompRuntime, DecompTask } from '../harness/runtime/decomp-runtime';
import { PlaySE, FuncIsActiveTask } from '../harness/runtime/decomp-globals';
import { stopPrerenderedSE, preloadPrerenderedSEs } from '../harness/m4a/se-noise-prerendered';
import {
  SE_TRUCK_MOVE,
  SE_TRUCK_STOP,
  SE_TRUCK_UNLOAD,
  SE_TRUCK_DOOR,
} from './engine/decomp-data/include/constants/songs-data';
import {
  METATILE_InsideOfTruck_DoorClosedFloor_Top,
  METATILE_InsideOfTruck_DoorClosedFloor_Mid,
  METATILE_InsideOfTruck_DoorClosedFloor_Bottom,
  METATILE_InsideOfTruck_ExitLight_Top,
  METATILE_InsideOfTruck_ExitLight_Mid,
  METATILE_InsideOfTruck_ExitLight_Bottom,
} from './engine/decomp-data/include/constants/metatile_labels-data';
import { MAP_OFFSET, MapGridSetMetatileIdAt } from './fieldmap';
import { DrawWholeMapView, SetCameraPanning, SetCameraPanningCallback, InstallCameraPanAheadCallback } from './field_camera';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';
import { SetObjectEventSpritePosByLocalIdAndMap } from './event_object_movement';

// ─── 1:1 décomp box offsets (field_special_scene.c:27-34) ───────────────────
// "Most of the boxes in the moving truck are map tiles, with the exception of
// three boxes that are map events that jostle around while the truck is driving.
// In addition, their sprite's placement is slightly offset to make them look
// less perfectly stacked."
const BOX1_X_OFFSET = 3;    // LOCALID_TRUCK_BOX_TOP
const BOX1_Y_OFFSET = 3;
const BOX2_X_OFFSET = 0;    // LOCALID_TRUCK_BOX_BOTTOM_L
const BOX2_Y_OFFSET = -3;
const BOX3_X_OFFSET = -3;   // LOCALID_TRUCK_BOX_BOTTOM_R
const BOX3_Y_OFFSET = 0;

// ─── 1:1 décomp `sTruckCamera_HorizontalTable[]` (field_special_scene.c:45) ──
const sTruckCamera_HorizontalTable: ReadonlyArray<number> = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, -1, -1, -1, 0,
];

// ─── 1:1 décomp `GetTruckCameraBobbingY(int time)` (field_special_scene.c:61) ─
function GetTruckCameraBobbingY(time: number): number {
  if (time % 120 === 0) return -1;
  if (time % 10 <= 4) return 1;
  return 0;
}

// ─── 1:1 décomp `GetTruckBoxYMovement(int time)` (field_special_scene.c:79) ──
function GetTruckBoxYMovement(time: number): number {
  if ((time + 120) % 180 === 0) return -1;
  return 0;
}

// ─── 1:1 décomp `Task_Truck1` (field_special_scene.c:89-108) ────────────────
//   #define tTimer data[0]
//   yBox1 = GetTruckBoxYMovement(tTimer + 30) * 4    // PRE-increment value
//   SetObjectEventSpritePosByLocalIdAndMap(TOP,    BOX1_X_OFFSET - 0, BOX1_Y_OFFSET + yBox1)
//   yBox2 = GetTruckBoxYMovement(tTimer) * 2
//   SetObjectEventSpritePosByLocalIdAndMap(BOT_L, BOX2_X_OFFSET - 0, BOX2_Y_OFFSET + yBox2)
//   yBox3 = GetTruckBoxYMovement(tTimer) * 4
//   SetObjectEventSpritePosByLocalIdAndMap(BOT_R, BOX3_X_OFFSET - 0, BOX3_Y_OFFSET + yBox3)
//   if (++tTimer == 30000) tTimer = 0                // POST-increment
//   cameraYpan = GetTruckCameraBobbingY(tTimer)      // POST-increment value
//   SetCameraPanning(0, cameraYpan)
function Task_Truck1(task: DecompTask): void {
  const data = task.data;
  const cameraXpan = 0;
  // 1:1 décomp variables locales (cameraXpan stays 0)
  const yBox1 = GetTruckBoxYMovement(data[0] + 30) * 4;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET - cameraXpan, BOX1_Y_OFFSET + yBox1);
  const yBox2 = GetTruckBoxYMovement(data[0]) * 2;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET - cameraXpan, BOX2_Y_OFFSET + yBox2);
  const yBox3 = GetTruckBoxYMovement(data[0]) * 4;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET - cameraXpan, BOX3_Y_OFFSET + yBox3);

  // ++tTimer (= POST-increment, value used AFTER for camera)
  if (++data[0] === 30000) data[0] = 0;

  const cameraYpan = GetTruckCameraBobbingY(data[0]);
  SetCameraPanning(cameraXpan, cameraYpan);
}

// ─── 1:1 décomp `Task_Truck2` (field_special_scene.c:116-150) ───────────────
//   #define tTimerHorizontal data[0]
//   #define tMoveStep        data[1]
//   #define tTimerVertical   data[2]
//   tTimerHorizontal++;                                 // PRE both
//   tTimerVertical++;
//   if (tTimerHorizontal > 5) { tTimerHorizontal = 0; tMoveStep++; }
//   if (tMoveStep == ARRAY_COUNT(sTruckCamera_HorizontalTable)) DestroyTask(taskId)
//   else :
//     if (sTruckCamera_HorizontalTable[tMoveStep] == 2)
//         gTasks[taskId].func = Task_Truck3;            // PERMANENT swap
//     cameraXpan = sTruckCamera_HorizontalTable[tMoveStep]
//     cameraYpan = GetTruckCameraBobbingY(tTimerVertical)
//     SetCameraPanning + 3 box pos avec yBox = GetTruckBoxYMovement(...)
function Task_Truck2(task: DecompTask): void {
  const data = task.data;
  data[0]++;  // tTimerHorizontal++
  data[2]++;  // tTimerVertical++

  if (data[0] > 5) {
    data[0] = 0;
    data[1]++;  // tMoveStep++
  }

  if (data[1] === sTruckCamera_HorizontalTable.length) {
    // "Never reached, the task function is changed below before finishing the table"
    _rtRef?.DestroyTask(task.taskId);
  } else {
    if (sTruckCamera_HorizontalTable[data[1]] === 2) {
      task.func = Task_Truck3;
    }
    const cameraXpan = sTruckCamera_HorizontalTable[data[1]];
    const cameraYpan = GetTruckCameraBobbingY(data[2]);
    SetCameraPanning(cameraXpan, cameraYpan);
    const yBox1 = GetTruckBoxYMovement(data[2] + 30) * 4;
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET - cameraXpan, BOX1_Y_OFFSET + yBox1);
    const yBox2 = GetTruckBoxYMovement(data[2]) * 2;
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET - cameraXpan, BOX2_Y_OFFSET + yBox2);
    const yBox3 = GetTruckBoxYMovement(data[2]) * 4;
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET - cameraXpan, BOX3_Y_OFFSET + yBox3);
  }
}

// ─── 1:1 décomp `Task_Truck3` (field_special_scene.c:152-178) ───────────────
//   tTimerHorizontal++;
//   if (tTimerHorizontal > 5) { tTimerHorizontal = 0; tMoveStep++; }
//   if (tMoveStep == ARRAY_COUNT(...)) DestroyTask(taskId)
//   else :
//     cameraXpan = sTruckCamera_HorizontalTable[tMoveStep]
//     cameraYpan = 0
//     SetCameraPanning + box pos avec yBox = cameraYpan = 0 (= no Y bob)
function Task_Truck3(task: DecompTask): void {
  const data = task.data;
  data[0]++;  // tTimerHorizontal++

  if (data[0] > 5) {
    data[0] = 0;
    data[1]++;  // tMoveStep++
  }

  if (data[1] === sTruckCamera_HorizontalTable.length) {
    _rtRef?.DestroyTask(task.taskId);
  } else {
    const cameraXpan = sTruckCamera_HorizontalTable[data[1]];
    const cameraYpan = 0;
    SetCameraPanning(cameraXpan, cameraYpan);
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET - cameraXpan, BOX1_Y_OFFSET + cameraYpan);
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET - cameraXpan, BOX2_Y_OFFSET + cameraYpan);
    SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET - cameraXpan, BOX3_Y_OFFSET + cameraYpan);
  }
}

// ─── 1:1 décomp `Task_HandleTruckSequence` (field_special_scene.c:189-258) ──
//   #define tState   data[0]
//   #define tTimer   data[1]
//   #define tTaskId1 data[2]
//   #define tTaskId2 data[3]
//
// IMPORTANT : la décomp utilise CreateTask depuis le master, ce qui crée des
// sub-tasks qui tick INDÉPENDAMMENT à 60fps. Notre runtime supporte ce pattern.
function Task_HandleTruckSequence(task: DecompTask): void {
  const data = task.data;
  const rt = _rtRef;
  if (!rt) return;

  switch (data[0]) {
    case 0:
      data[1]++;  // tTimer++
      if (data[1] === 90) {
        SetCameraPanningCallback(null);
        data[1] = 0;
        data[2] = rt.CreateTask(Task_Truck1, 0xA);  // tTaskId1 = CreateTask
        data[0] = 1;
        PlaySE(SE_TRUCK_MOVE);
      }
      break;
    case 1:
      data[1]++;
      if (data[1] === 150) {
        // 1:1 décomp `FadeInFromBlack()` = BeginNormalPaletteFade PALETTES_ALL 0 16 0 RGB_BLACK.
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
        data[1] = 0;
        data[0] = 2;
      }
      break;
    case 2:
      data[1]++;
      if (!rt.gPaletteFade.active && data[1] > 300) {
        data[1] = 0;
        rt.DestroyTask(data[2]);  // DestroyTask(tTaskId1)
        // Task_Truck2 sera créée fresh → data Int16Array(16) init à 0.
        data[3] = rt.CreateTask(Task_Truck2, 0xA);  // tTaskId2 = CreateTask
        data[0] = 3;
        PlaySE(SE_TRUCK_STOP);
      }
      break;
    case 3:
      // 1:1 décomp : `if (!gTasks[tTaskId2].isActive)` = task destroyed (Task_Truck3
      // self-destroyed en fin de table).
      if (!rt.gTasks.has(data[3])) {
        InstallCameraPanAheadCallback();
        data[1] = 0;
        data[0] = 4;
      }
      break;
    case 4:
      data[1]++;
      if (data[1] === 90) {
        PlaySE(SE_TRUCK_UNLOAD);
        data[1] = 0;
        data[0] = 5;
      }
      break;
    case 5:
      data[1]++;
      if (data[1] === 120) {
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Top);
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Mid);
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Bottom);
        DrawWholeMapView();
        PlaySE(SE_TRUCK_DOOR);
        rt.DestroyTask(task.taskId);
        UnlockPlayerFieldControls();
        // Session F G1 : reset global guard (= HMR-safe).
        _truckGlobal.active = false;
        _truckGlobal.taskId = -1;
      }
      break;
  }
}

// ─── HMR-safe guard (= survit HMR Vite, évite double execution) ─────────────
type TruckGlobalState = {
  active: boolean;
  taskId: number;
};
const _truckGlobal = ((): TruckGlobalState => {
  const g = globalThis as { __truckCinematic?: TruckGlobalState };
  if (!g.__truckCinematic) {
    g.__truckCinematic = { active: false, taskId: -1 };
  }
  return g.__truckCinematic;
})();

// Reference vers le runtime, set par ExecuteTruckSequence et utilisée par les
// sub-tasks. 1:1 décomp les sub-tasks accèdent gTasks/PlaySE comme globaux ;
// notre TS doit passer la ref runtime.
let _rtRef: DecompRuntime | null = null;

/** 1:1 décomp `ExecuteTruckSequence(void)` (field_special_scene.c:260-269). */
export function ExecuteTruckSequence(rt: DecompRuntime): void {
  // Session 124 fix : si une cinematic était déjà active (= HMR sans full
  // reload), kill l'ancienne task + stop tous les SE en cours.
  if (_truckGlobal.active) {
    console.warn('[truck-cinematic] previous run still active — killing it (HMR safe)');
    if (_truckGlobal.taskId >= 0) {
      try { rt.DestroyTask(_truckGlobal.taskId); } catch { /* ignore */ }
    }
    stopPrerenderedSE('se1');
    stopPrerenderedSE('se2');
    _truckGlobal.active = false;
    _truckGlobal.taskId = -1;
  }
  _truckGlobal.active = true;
  _rtRef = rt;

  // Session 124 Bug 2 : pre-load tous les SE truck pour qu'ils soient cachés
  // en mémoire AVANT que les state transitions les jouent.
  void preloadPrerenderedSEs(['se_truck_move', 'se_truck_stop', 'se_truck_unload', 'se_truck_door']);

  // 1:1 décomp lines 262-264 : 3 metatile changes pour mettre la door en
  // "closed floor" (= cinematic démarre avec porte fermée).
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Top);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Mid);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Bottom);
  // 1:1 décomp ligne 265 : DrawWholeMapView() = no args (lit gMapHeader internally).
  DrawWholeMapView();
  // 1:1 décomp ligne 266.
  LockPlayerFieldControls();
  // 1:1 décomp ligne 267 : `CpuFastFill(0, gPlttBufferFaded, PLTT_SIZE)` =
  // screen instantly black. Notre équivalent : BeginNormalPaletteFade target
  // startY=16 endY=16 (= déjà au max black, no transition).
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 16, 'RGB_BLACK');
  // 1:1 décomp ligne 268 : CreateTask(Task_HandleTruckSequence, 0xA).
  const taskId = rt.CreateTask(Task_HandleTruckSequence, 0xA);
  _truckGlobal.taskId = taskId;
}

/** 1:1 décomp `EndTruckSequence(u8 taskId)` (field_special_scene.c:271-279).
 *  Appelée comme STEP_CB_TRUCK per-step callback (field_tasks.c:66) = à chaque
 *  pas du player après la cinematic. Reset les 3 box positions à leurs offsets
 *  default SI le master Task_HandleTruckSequence n'est plus active.
 *
 *  1:1 décomp `FuncIsActiveTask(Task_HandleTruckSequence)`. Le `task` arg (= taskId
 *  décomp) est ignoré comme dans la décomp. */
export function EndTruckSequence(_task?: DecompTask): void {
  if (FuncIsActiveTask(Task_HandleTruckSequence)) return;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET, BOX1_Y_OFFSET);
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET, BOX2_Y_OFFSET);
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET, BOX3_Y_OFFSET);
}

/**
 * truck-cinematic.ts — 1:1 décomp `field_special_scene.c` (`ExecuteTruckSequence`
 * + `Task_HandleTruckSequence` + `Task_Truck1/2/3`).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_special_scene.c`
 * lignes 22-269.
 *
 * Architecture : décomp split la logique en 4 tasks :
 *   - `Task_HandleTruckSequence` : state machine principale (= SE + tile + spawn child)
 *   - `Task_Truck1` : run pendant state 1+2, camera Y bob + box anim
 *   - `Task_Truck2` : run pendant state 3, camera X table + Y bob + box anim
 *   - `Task_Truck3` : run pendant state 3 fin, camera X seulement (= func swap depuis Task_Truck2)
 *
 * Notre impl simplifiée : on inline les 3 child tasks dans Task_HandleTruckSequence
 * (= 1 task au total). Plus simple à debug, même résultat visuel + audio.
 *
 * 1:1 décomp préservé :
 *   - Durations 90/150/300/90/120 frames (= match exact).
 *   - SE order MOVE → STOP → UNLOAD → DOOR.
 *   - GetTruckCameraBobbingY pattern (= -1 every 120, +1 if t%10 <= 4, else 0).
 *   - sTruckCamera_HorizontalTable iter every 6 frames (= 19 entries × 6 = 114 frames).
 *   - Door tile changes en fin (= DoorClosedFloor → ExitLight).
 *   - LockPlayerFieldControls au début, UnlockPlayerFieldControls à la fin.
 *
 * Non implémenté (= acceptable degradation) :
 *   - Box bouncing (= GetTruckBoxYMovement + SetObjectEventSpritePosByLocalIdAndMap).
 *     Les caisses LOCALID_TRUCK_BOX_TOP/BOTTOM_L/R sont statiques. Le camera shake
 *     les fait visuellement bouger avec le reste de la scène.
 */
import type { DecompRuntime, DecompTask } from './decomp-runtime';
import { PlaySE } from './decomp-globals';
import { stopPrerenderedSE } from './m4a/se-noise-prerendered';
import {
  SE_TRUCK_MOVE,
  SE_TRUCK_STOP,
  SE_TRUCK_UNLOAD,
  SE_TRUCK_DOOR,
} from './decomp-data/auto/include/constants/songs-data';
import {
  METATILE_InsideOfTruck_DoorClosedFloor_Top,
  METATILE_InsideOfTruck_DoorClosedFloor_Mid,
  METATILE_InsideOfTruck_DoorClosedFloor_Bottom,
  METATILE_InsideOfTruck_ExitLight_Top,
  METATILE_InsideOfTruck_ExitLight_Mid,
  METATILE_InsideOfTruck_ExitLight_Bottom,
} from './decomp-data/auto/include/constants/metatile_labels-data';
import { MAP_OFFSET, MapGridSetMetatileIdAt, gMapHeader } from './map-loader';
import { DrawWholeMapView, SetCameraPanning } from './field-camera';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script-runtime';
import { gPlayerAvatar } from './player-avatar';
import { SetObjectEventSpritePosByLocalIdAndMap } from './object-events';

/** 1:1 décomp `static const s8 sTruckCamera_HorizontalTable[]`
 *  (field_special_scene.c:45). 19 entries iterated every 6 frames pendant
 *  l'horizontal jolt. */
const sTruckCamera_HorizontalTable: ReadonlyArray<number> = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, -1, -1, -1, 0,
];
const HORIZONTAL_TABLE_FRAMES = sTruckCamera_HorizontalTable.length * 6; // 19 * 6 = 114

/** 1:1 décomp `GetTruckCameraBobbingY(int time)` (field_special_scene.c:61). */
function GetTruckCameraBobbingY(time: number): number {
  if (time % 120 === 0) return -1;
  if (time % 10 <= 4) return 1;
  return 0;
}

/** 1:1 décomp `GetTruckBoxYMovement(int time)` (field_special_scene.c:79).
 *  Returns -1 quand box doit jump (= every 180 frames at offset 60), 0 sinon.
 *  Multiplied par scale factor (4, 2, 4) pour les 3 boxes. */
function GetTruckBoxYMovement(time: number): number {
  if ((time + 120) % 180 === 0) return -1;
  return 0;
}

/** 1:1 décomp box X/Y offsets (field_special_scene.c:27-34) :
 *  les 3 boxes ont des spawn screen offsets pour qu'elles paraissent
 *  pas parfaitement empilées. */
const BOX1_X_OFFSET = 3;   // LOCALID_TRUCK_BOX_TOP
const BOX1_Y_OFFSET = 3;
const BOX2_X_OFFSET = 0;   // LOCALID_TRUCK_BOX_BOTTOM_L
const BOX2_Y_OFFSET = -3;
const BOX3_X_OFFSET = -3;  // LOCALID_TRUCK_BOX_BOTTOM_R
const BOX3_Y_OFFSET = 0;

/** Apply box bouncing 1:1 décomp `Task_Truck1` (field_special_scene.c:89-108).
 *  Box1/3 multiplier 4, box2 multiplier 2 (= box2 jumps lower). Box1 timer
 *  shifted +30 (= jumps earlier que box2/3). */
function _applyBoxBouncing(time: number, cameraXpan: number): void {
  const yBox1 = GetTruckBoxYMovement(time + 30) * 4;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET - cameraXpan, BOX1_Y_OFFSET + yBox1);
  const yBox2 = GetTruckBoxYMovement(time) * 2;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET - cameraXpan, BOX2_Y_OFFSET + yBox2);
  const yBox3 = GetTruckBoxYMovement(time) * 4;
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET - cameraXpan, BOX3_Y_OFFSET + yBox3);
}

/** Reset box visual offsets à leurs spawn-time defaults (= post-cinematic).
 *  1:1 décomp implicit via Task_Truck3 finale qui appelle SetObjectEventSpritePos
 *  avec yBox=0. */
function _resetBoxOffsets(): void {
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_TOP',      BOX1_X_OFFSET, BOX1_Y_OFFSET);
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_L', BOX2_X_OFFSET, BOX2_Y_OFFSET);
  SetObjectEventSpritePosByLocalIdAndMap('LOCALID_TRUCK_BOX_BOTTOM_R', BOX3_X_OFFSET, BOX3_Y_OFFSET);
}

/** Guard global : empêche double-call `ExecuteTruckSequence`. */
let _truckSequenceActive = false;

/** 1:1 décomp `ExecuteTruckSequence()` (field_special_scene.c:260-269). */
export function ExecuteTruckSequence(rt: DecompRuntime): void {
  if (_truckSequenceActive) {
    console.warn('[truck-cinematic] ExecuteTruckSequence already running, skip duplicate');
    return;
  }
  _truckSequenceActive = true;
  // 1:1 décomp : 3 metatile changes pour mettre la door en "closed floor".
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Top);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Mid);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Bottom);
  if (gMapHeader) DrawWholeMapView(gPlayerAvatar.x, gPlayerAvatar.y, gMapHeader.mapLayout);
  LockPlayerFieldControls();
  // 1:1 décomp `CpuFastFill(0, gPlttBufferFaded, PLTT_SIZE)` : screen instantly
  // black. Notre équivalent : BeginNormalPaletteFade target startY=16 endY=16.
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 16, 'RGB_BLACK');
  rt.CreateTask((task: DecompTask) => Task_HandleTruckSequence(task, rt), 0xA);
  console.log('[truck-cinematic] ExecuteTruckSequence : black palette fill + task started');
}

// ─── Task data layout ────────────────────────────────────────────────────────
// data[0] = tState (= 0..5)
// data[1] = tTimer (frame counter du state)
// data[2] = bobTimer (timer continu pour GetTruckCameraBobbingY) — used state 1+2+3
// data[3] = horizMoveStep (index dans sTruckCamera_HorizontalTable) — used state 3

/** 1:1 décomp `Task_HandleTruckSequence` (field_special_scene.c:189-258).
 *  Inline Task_Truck1/2/3 logic dans la même state machine pour simplicité. */
const Task_HandleTruckSequence = function (task: DecompTask, rt: DecompRuntime): void {
  const data = task.data;
  switch (data[0]) {
    case 0:
      // Wait 90 frames silently (= player vois truck immobile).
      data[1]++;
      if (data[1] === 90) {
        data[1] = 0;
        data[0] = 1;
        PlaySE(SE_TRUCK_MOVE);
        console.log('[truck-cinematic] state 0→1 : SE_TRUCK_MOVE played');
      }
      break;
    case 1:
      // Truck rolling : Task_Truck1 logic = camera Y bob via bobTimer + box bouncing.
      // Durée : 150 frames. À fin → FadeInFromBlack + state 2.
      // 1:1 décomp ordering (field_special_scene.c:89-108 Task_Truck1) :
      //   yBox1 = GetTruckBoxYMovement(tTimer + 30) * 4   ← PRE-increment tTimer
      //   SetObjectEventSpritePosByLocalIdAndMap(...)
      //   ...
      //   if (++tTimer == 30000) tTimer = 0;              ← POST-increment
      //   cameraYpan = GetTruckCameraBobbingY(tTimer);    ← POST-increment value
      // Donc box bouncing = pre, camera Y = post (= +1 frame offset).
      _applyBoxBouncing(data[2], 0);                       // PRE-increment
      data[2]++;                                            // ++tTimer
      data[1]++;
      SetCameraPanning(0, GetTruckCameraBobbingY(data[2]));// POST-increment
      if (data[1] === 150) {
        // 1:1 décomp : FadeInFromBlack (= fade screen FROM black TO color).
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
        data[1] = 0;
        data[0] = 2;
      }
      break;
    case 2:
      // Continue Task_Truck1 logic. Wait until !gPaletteFade.active && tTimer > 300.
      // Same PRE/POST increment ordering que state 1 (= 1:1 décomp Task_Truck1).
      _applyBoxBouncing(data[2], 0);                       // PRE-increment
      data[2]++;
      data[1]++;
      SetCameraPanning(0, GetTruckCameraBobbingY(data[2]));// POST-increment
      if (!rt.gPaletteFade.active && data[1] > 300) {
        // 1:1 décomp : DestroyTask(Task_Truck1) → CreateTask(Task_Truck2)
        //   → PlaySE(SE_TRUCK_STOP) → tState=3.
        // CRITIQUE : décomp Task_Truck2 est une NEW task allouée fresh →
        //   `tTimerVertical = 0`. Notre impl partage `data[2]` → si on ne
        //   reset pas, on entre en state 3 avec data[2]≈450 → la phase de
        //   GetTruckBoxYMovement / GetTruckCameraBobbingY est complètement
        //   différente vs ROM (= bug user A.3 box positioning).
        data[1] = 0;
        data[2] = 0;  // ← FIX : reset bobTimer (= mimic fresh Task_Truck2)
        data[0] = 3;
        data[3] = 0;  // reset horizontal step
        // Stop le SE_TRUCK_MOVE explicit pour que SE_TRUCK_STOP soit séquentiel.
        stopPrerenderedSE('se1');
        stopPrerenderedSE('se2');
        PlaySE(SE_TRUCK_STOP);
        console.log('[truck-cinematic] state 2→3 : SE_TRUCK_STOP played (MOVE stopped, bobTimer reset 1:1 décomp)');
      }
      break;
    case 3:
      // Task_Truck2 → Task_Truck3 logic : iter sTruckCamera_HorizontalTable
      // every 6 frames. data[1] = step timer (= 0..5), data[3] = move step index.
      // Camera Y bob continue jusqu'à table[step] === 2 (= Task_Truck3 swap).
      // 1:1 décomp Task_Truck2 (field_special_scene.c:116-150) ordering :
      //   ++tTimerHorizontal; ++tTimerVertical;  ← PRE-increment des deux
      //   ... yBox = GetTruckBoxYMovement(tTimerVertical + 30) * 4 ; ...
      // Donc icic box & camera utilisent même valeur (= post-increment).
      data[1]++;
      data[2]++;
      if (data[1] > 5) {
        data[1] = 0;
        data[3]++;
      }
      if (data[3] >= sTruckCamera_HorizontalTable.length) {
        // Table done → state 4.
        SetCameraPanning(0, 0);
        // 1:1 décomp : reset box visual offsets vers spawn (post-shake settle).
        _resetBoxOffsets();
        data[1] = 0;
        data[0] = 4;
      } else {
        const xpan = sTruckCamera_HorizontalTable[data[3]];
        // 1:1 décomp : si table[step] === 2 → Task_Truck3 (= Y bob stops).
        // Sinon Task_Truck2 (= Y bob continue + box bouncing).
        if (xpan === 2) {
          // Task_Truck3 : X seulement, no Y bob, no box bouncing.
          SetCameraPanning(xpan, 0);
        } else {
          // Task_Truck2 : X + Y bob + box bouncing.
          SetCameraPanning(xpan, GetTruckCameraBobbingY(data[2]));
          _applyBoxBouncing(data[2], xpan);
        }
      }
      break;
    case 4:
      // Wait 90 frames, then SE_TRUCK_UNLOAD.
      data[1]++;
      if (data[1] === 90) {
        PlaySE(SE_TRUCK_UNLOAD);
        data[1] = 0;
        data[0] = 5;
        console.log('[truck-cinematic] state 4→5 : SE_TRUCK_UNLOAD played');
      }
      break;
    case 5:
      // Wait 120 frames, then open door + SE_TRUCK_DOOR + unlock controls.
      data[1]++;
      if (data[1] === 120) {
        // 1:1 décomp : remplace les 3 door tiles par ExitLight (= door open).
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Top);
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Mid);
        MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_ExitLight_Bottom);
        if (gMapHeader) DrawWholeMapView(gPlayerAvatar.x, gPlayerAvatar.y, gMapHeader.mapLayout);
        PlaySE(SE_TRUCK_DOOR);
        rt.DestroyTask(task.taskId);
        UnlockPlayerFieldControls();
        // Reset camera panning (= safety).
        SetCameraPanning(0, 0);
        _truckSequenceActive = false;
        console.log('[truck-cinematic] state 5 done : SE_TRUCK_DOOR played + controls unlocked');
      }
      break;
  }
};

// Suppress unused warning - HORIZONTAL_TABLE_FRAMES is exported for testing.
void HORIZONTAL_TABLE_FRAMES;

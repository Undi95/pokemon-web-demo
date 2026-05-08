/**
 * truck-cinematic.ts — 1:1 décomp `field_special_scene.c` (`ExecuteTruckSequence`
 * + `Task_HandleTruckSequence` + `Task_Truck1/2/3`).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_special_scene.c`
 * lignes 22-269.
 *
 * 1:1 décomp préservé :
 *   - Les durations 90/150/300/90/120 frames (= match exact).
 *   - Les SE dans le bon ordre (= MOVE → STOP → UNLOAD → DOOR).
 *   - GetTruckCameraBobbingY pattern (= -1 every 120, +1 if t%10 <= 4, else 0).
 *   - sTruckCamera_HorizontalTable [0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,-1,-1,-1,0]
 *     stepped tous les 6 frames pendant Task_Truck2/3.
 *   - Door tile changes en fin (= DoorClosedFloor → ExitLight).
 *   - LockPlayerFieldControls au début, UnlockPlayerFieldControls à la fin.
 *
 * Non implémenté (= acceptable degradation, boxes statiques) :
 *   - GetTruckBoxYMovement bouncing des LOCALID_TRUCK_BOX_TOP/BOTTOM_L/R via
 *     SetObjectEventSpritePosByLocalIdAndMap. Les caisses bougent pas verticalement
 *     pendant le truck — mais le camera shake les fait visuellement bouger avec
 *     le reste de la scène.
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

/** 1:1 décomp `static const s8 sTruckCamera_HorizontalTable[]`
 *  (field_special_scene.c:45). 19 entries iterated every 6 frames. */
const sTruckCamera_HorizontalTable: ReadonlyArray<number> = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, -1, -1, -1, 0,
];

/** 1:1 décomp `GetTruckCameraBobbingY(int time)` (field_special_scene.c:61). */
function GetTruckCameraBobbingY(time: number): number {
  if (time % 120 === 0) return -1;
  if (time % 10 <= 4) return 1;
  return 0;
}

/** Guard global : true tant qu'une cinematic est active. Empêche un double
 *  appel à `ExecuteTruckSequence` (= e.g. HMR re-trigger, scene re-create
 *  pendant fade load) de créer 2 tasks simultanées qui jouent les SE en
 *  doublon (= "deux bruits de camion décalés" reporté par l'utilisateur). */
let _truckSequenceActive = false;

/** 1:1 décomp `ExecuteTruckSequence()` (field_special_scene.c:260-269).
 *  Setup the door tile state + lock controls + start the cinematic task.
 *  À call APRÈS que la map est loaded + visible. */
export function ExecuteTruckSequence(rt: DecompRuntime): void {
  // Guard contre double-call (= cf. _truckSequenceActive comment ci-dessus).
  if (_truckSequenceActive) {
    console.warn('[truck-cinematic] ExecuteTruckSequence already running, skip duplicate');
    return;
  }
  _truckSequenceActive = true;
  // 1:1 décomp : 3 metatile changes pour mettre la door en "closed floor"
  // (= le joueur ne peut PAS sortir tant que la cinematic n'est pas finie).
  // Coords (4, 1), (4, 2), (4, 3) en map-local + MAP_OFFSET (= 7).
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Top);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Mid);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Bottom);
  if (gMapHeader) DrawWholeMapView(gPlayerAvatar.x, gPlayerAvatar.y, gMapHeader.mapLayout);
  // 1:1 décomp : Lock player input pendant toute la cinematic.
  LockPlayerFieldControls();
  // 1:1 décomp `field_special_scene.c:267 CpuFastFill(0, gPlttBufferFaded, PLTT_SIZE)` :
  // fill all faded palette colors to 0 (= screen instantly black). Notre équivalent :
  // BeginNormalPaletteFade target startY=16 endY=16 (= stays at fully faded black).
  // Le state 1 de Task_HandleTruckSequence fait FadeInFromBlack ~150 frames après
  // SE_TRUCK_MOVE → matches le pattern décomp.
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 16, 'RGB_BLACK');
  // Capture rt par closure (= 1:1 pattern auto-callbacks `(t) => Task_X(t, rt)`).
  rt.CreateTask((task: DecompTask) => Task_HandleTruckSequence(task, rt), 0xA);
  console.log('[truck-cinematic] ExecuteTruckSequence : black palette fill + task started');
}

// ─── Task slots data layout (= 1:1 décomp tState/tTimer/tTaskId1/tTaskId2) ───
// data[0] = tState (= 0..5)
// data[1] = tTimer
// data[2] = tTaskId1 (= Task_Truck1 id, alive durant state 1)
// data[3] = tTaskId2 (= Task_Truck2/3 id, alive durant state 2-3)

/** 1:1 décomp `Task_Truck1(taskId)` (field_special_scene.c:89-108).
 *  Box bouncing (= NON impl, boxes statiques) + camera vertical bobbing.
 *  Run pendant state 1 (= 150 frames truck rolling). */
function Task_Truck1(task: DecompTask): void {
  const data = task.data;
  // tTimer = data[0] dans le child task (= scope local, pas tState).
  data[0]++;
  // 1:1 décomp wrap à 30000.
  if (data[0] === 30000) data[0] = 0;
  const cameraYpan = GetTruckCameraBobbingY(data[0]);
  SetCameraPanning(0, cameraYpan);
}

/** 1:1 décomp `Task_Truck2(taskId)` (field_special_scene.c:116-150).
 *  Camera horizontal table iter every 6 frames + vertical bobbing + box anim
 *  (= NON impl). Quand table value == 2 → switch func to Task_Truck3.
 *  Run pendant state 2-3. */
function Task_Truck2(task: DecompTask): void {
  const data = task.data;
  // data[0]=tTimerHorizontal, data[1]=tMoveStep, data[2]=tTimerVertical
  data[0]++;
  data[2]++;
  if (data[0] > 5) {
    data[0] = 0;
    data[1]++;
  }
  if (data[1] === sTruckCamera_HorizontalTable.length) {
    // Never reached per décomp (= func swap to Task_Truck3 avant). Safety.
    return;
  }
  const tableVal = sTruckCamera_HorizontalTable[data[1]];
  if (tableVal === 2) {
    // 1:1 décomp : `gTasks[taskId].func = Task_Truck3` — swap callback.
    task.func = Task_Truck3;
  }
  const cameraYpan = GetTruckCameraBobbingY(data[2]);
  SetCameraPanning(tableVal, cameraYpan);
}

/** 1:1 décomp `Task_Truck3(taskId)` (field_special_scene.c:152-178).
 *  Continue table iter, NO vertical bobbing, NO box anim. Quand table done →
 *  DestroyTask. */
function Task_Truck3(task: DecompTask): void {
  const data = task.data;
  data[0]++;
  if (data[0] > 5) {
    data[0] = 0;
    data[1]++;
  }
  if (data[1] === sTruckCamera_HorizontalTable.length) {
    // 1:1 décomp : DestroyTask. Reset camera + signal complete via func=null.
    SetCameraPanning(0, 0);
    task.isActive = false;
    return;
  }
  const tableVal = sTruckCamera_HorizontalTable[data[1]];
  SetCameraPanning(tableVal, 0);
}

/** 1:1 décomp `Task_HandleTruckSequence` (field_special_scene.c:189-258).
 *  State machine 6 états (0..5) qui drive sons + tiles + tasks Task_Truck1/2/3
 *  + unlock. */
const Task_HandleTruckSequence = function (task: DecompTask, rt: DecompRuntime): void {
  const data = task.data;
  switch (data[0]) {
    case 0:
      // Wait 90 frames silently (= player vois truck immobile).
      data[1]++;
      if (data[1] === 90) {
        // 1:1 décomp : SetCameraPanningCallback(NULL) + start Task_Truck1
        // + PlaySE(SE_TRUCK_MOVE) + tState=1.
        data[1] = 0;
        data[0] = 1;
        const child1 = rt.CreateTask(Task_Truck1, 0xA);
        data[2] = child1;
        PlaySE(SE_TRUCK_MOVE);
        console.log('[truck-cinematic] state 0→1 : SE_TRUCK_MOVE played + Task_Truck1 started');
      }
      break;
    case 1:
      // Truck rolling : Task_Truck1 handle camera bob. State 1 = 150 frames.
      // 1:1 décomp tick 1 : FadeInFromBlack.
      data[1]++;
      if (data[1] === 150) {
        // 1:1 décomp Task_HandleTruckSequence:210 FadeInFromBlack.
        rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
        data[1] = 0;
        data[0] = 2;
      }
      break;
    case 2:
      // Truck still rolling : Task_Truck1 continue camera bob. Wait until
      // !gPaletteFade.active && tTimer > 300. Décomp condition exact.
      data[1]++;
      if (!rt.gPaletteFade.active && data[1] > 300) {
        // 1:1 décomp : DestroyTask(tTaskId1) → CreateTask(Task_Truck2)
        // → PlaySE(SE_TRUCK_STOP) → tState=3.
        data[1] = 0;
        data[0] = 3;
        rt.DestroyTask(data[2]);  // kill Task_Truck1
        // Reset child task data slots avant Task_Truck2 (= it uses data[0..2]).
        const child2 = rt.CreateTask(Task_Truck2, 0xA);
        data[3] = child2;
        // 1:1 décomp comportement attendu : SE_TRUCK_MOVE doit être STOPPÉ
        // avant SE_TRUCK_STOP (= les 2 SE séquentiels, pas simultanés).
        // Notre PlaySE alterne se1/se2 → MOVE est sur se1, STOP irait sur se2.
        // Stop explicit MOVE sur se1 + se2 pour être safe avant le STOP.
        stopPrerenderedSE('se1');
        stopPrerenderedSE('se2');
        PlaySE(SE_TRUCK_STOP);
        console.log('[truck-cinematic] state 2→3 : SE_TRUCK_STOP played (MOVE stopped)');
      }
      break;
    case 3:
      // 1:1 décomp : if (!gTasks[tTaskId2].isActive) → tState=4. Task_Truck2/3
      // se DestroyTask self quand horizontal table done.
      // Notre Task_Truck3 set task.isActive=false en fin de table.
      // Avec rt.gTasks store, on peut aussi check via rt.gTasks.
      // Lookup task by id:
      {
        // task.taskId pas le bon — on veut le child task tTaskId2 = data[3].
        // Notre DecompRuntime gTasks est indexed by taskId. Check si le child
        // task est encore actif.
        const childId = data[3];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childTask = (rt as any).gTasks?.[childId];
        if (!childTask || !childTask.isActive) {
          // Task_Truck2/3 a fini son horizontal table → state 4.
          // 1:1 décomp : InstallCameraPanAheadCallback() pour reset le panning.
          SetCameraPanning(0, 0);
          data[1] = 0;
          data[0] = 4;
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
        // Clear guard pour que le prochain newgame puisse re-trigger.
        _truckSequenceActive = false;
        console.log('[truck-cinematic] state 5 done : SE_TRUCK_DOOR played + controls unlocked');
      }
      break;
  }
};

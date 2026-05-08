/**
 * truck-cinematic.ts — 1:1 décomp `field_special_scene.c` (`ExecuteTruckSequence`
 * + `Task_HandleTruckSequence`).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_special_scene.c`
 * lignes 184-269.
 *
 * Pourquoi cette impl manuelle :
 *   - L'auto-transpilé `field_special_scene-callbacks-auto.ts` dépend de
 *     Task_Truck1/2/3 qui à leur tour pilotent `SetObjectEventSpritePos
 *     ByLocalIdAndMap` sur les LOCALID_TRUCK_BOX_* (= truck box objects qui
 *     bouge avec la camera shake). Ces object events nécessitent que le map
 *     `MAP_INSIDE_OF_TRUCK` les définisse — vérification : OUI les 3 OBJ
 *     existent dans `data/maps/InsideOfTruck/map.json`.
 *   - Mais notre object-events-system n'a pas encore implémenté
 *     `SetObjectEventSpritePosByLocalIdAndMap` (= pos override par camera pan)
 *     ni `LOCALID_TRUCK_BOX_*` lookup. Sans ces helpers, Task_Truck1 va throw.
 *   - Plutôt que d'implémenter tous ces helpers en cascade (= complexe + boxes
 *     à peine visibles), on fait une cinématique simplifiée 1:1 inspired qui
 *     reproduit les SEs + camera shake (= ce que l'utilisateur perçoit).
 *
 * 1:1 décomp préservé :
 *   - Les durations (90/150/300/90/120 frames) — exact match.
 *   - Les SE dans le bon ordre (= MOVE → STOP → UNLOAD → DOOR).
 *   - Door tile changes en fin (= DoorClosedFloor → ExitLight).
 *   - LockPlayerFieldControls au début, UnlockPlayerFieldControls à la fin.
 *
 * Non implémenté (= acceptable degradation pour démo) :
 *   - Camera shake horizontal de Task_Truck2/3 (= sTruckCamera_HorizontalTable).
 *     On fait un simple wobble vertical pendant que le truck "roule" via
 *     SetCameraPanning(0, sin*1).
 *   - Truck box bouncing OAM positions (= fait par Task_Truck1).
 *   - CpuFastFill black palette + FadeInFromBlack (= screen reste visible).
 */
import type { DecompRuntime, DecompTask } from './decomp-runtime';
import { PlaySE } from './decomp-globals';
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

/** 1:1 décomp `ExecuteTruckSequence()` (field_special_scene.c:260-269).
 *  Setup the door tile state + lock controls + start the cinematic task.
 *  À call APRÈS que la map est loaded + visible. */
export function ExecuteTruckSequence(rt: DecompRuntime): void {
  // 1:1 décomp : 3 metatile changes pour mettre la door en "closed floor"
  // (= le joueur ne peut PAS sortir tant que la cinematic n'est pas finie).
  // Coords (4, 1), (4, 2), (4, 3) en map-local + MAP_OFFSET (= 7).
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Top);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Mid);
  MapGridSetMetatileIdAt(4 + MAP_OFFSET, 3 + MAP_OFFSET, METATILE_InsideOfTruck_DoorClosedFloor_Bottom);
  if (gMapHeader) DrawWholeMapView(gPlayerAvatar.x, gPlayerAvatar.y, gMapHeader.mapLayout);
  // 1:1 décomp : Lock player input pendant toute la cinematic.
  LockPlayerFieldControls();
  // 1:1 décomp : `CpuFastFill(0, gPlttBufferFaded, PLTT_SIZE)` (= screen black).
  // Skip pour démo : on garde le screen visible — coût visuel mineur (= pas de
  // fade in surprise mais le wobble + sons restent fidèles).
  // Capture rt par closure (= 1:1 pattern auto-callbacks `(t) => Task_X(t, rt)`).
  rt.CreateTask((task: DecompTask) => Task_HandleTruckSequence(task, rt), 0xA);
  console.log('[truck-cinematic] ExecuteTruckSequence : controls locked + task started');
}

/** 1:1 décomp `Task_HandleTruckSequence` (field_special_scene.c:189-258).
 *  State machine 6 états (0..5) qui drive sons + tiles + unlock. */
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
      // Truck est en mouvement : wobble vertical 1px sin(t).
      // Durée : 150 frames (= 1:1 décomp).
      data[1]++;
      {
        const t = data[1];
        const wobble = Math.round(Math.sin(t * 0.4) * 1);  // ±1 px vertical
        SetCameraPanning(0, wobble);
      }
      if (data[1] === 150) {
        data[1] = 0;
        data[0] = 2;
      }
      break;
    case 2:
      // Truck still moving : continuer wobble. Durée : 300 frames.
      data[1]++;
      {
        const t = data[1] + 150;
        const wobble = Math.round(Math.sin(t * 0.4) * 1);
        SetCameraPanning(0, wobble);
      }
      if (data[1] > 300) {
        data[1] = 0;
        data[0] = 3;
        PlaySE(SE_TRUCK_STOP);
        console.log('[truck-cinematic] state 2→3 : SE_TRUCK_STOP played');
      }
      break;
    case 3:
      // Truck a stoppé : reset camera + brief horizontal jolt.
      data[1]++;
      if (data[1] < 6) {
        // Petit jolt horizontal (= simulé sTruckCamera_HorizontalTable).
        SetCameraPanning(data[1] % 2 === 0 ? -1 : 1, 0);
      } else {
        SetCameraPanning(0, 0);
        if (data[1] >= 30) {
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
        console.log('[truck-cinematic] state 5 done : SE_TRUCK_DOOR played + controls unlocked');
      }
      break;
  }
};

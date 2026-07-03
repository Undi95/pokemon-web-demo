/**
 * fldeff_escalator.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/fldeff_escalator.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/fldeff_escalator.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { METATILE_PokemonCenter_Escalator1F_Tile0_Frame0, METATILE_PokemonCenter_Escalator1F_Tile0_Frame1, METATILE_PokemonCenter_Escalator1F_Tile0_Frame2, METATILE_PokemonCenter_Escalator1F_Tile1_Frame0, METATILE_PokemonCenter_Escalator1F_Tile1_Frame1, METATILE_PokemonCenter_Escalator1F_Tile1_Frame2, METATILE_PokemonCenter_Escalator1F_Tile2_Frame0, METATILE_PokemonCenter_Escalator1F_Tile2_Frame1, METATILE_PokemonCenter_Escalator1F_Tile2_Frame2, METATILE_PokemonCenter_Escalator1F_Tile3_Frame0, METATILE_PokemonCenter_Escalator1F_Tile3_Frame1, METATILE_PokemonCenter_Escalator1F_Tile3_Frame2, METATILE_PokemonCenter_Escalator2F_Tile0_Frame0, METATILE_PokemonCenter_Escalator2F_Tile0_Frame1, METATILE_PokemonCenter_Escalator2F_Tile0_Frame2, METATILE_PokemonCenter_Escalator2F_Tile1_Frame0, METATILE_PokemonCenter_Escalator2F_Tile1_Frame1, METATILE_PokemonCenter_Escalator2F_Tile1_Frame2, METATILE_PokemonCenter_Escalator2F_Tile2_Frame0, METATILE_PokemonCenter_Escalator2F_Tile2_Frame1, METATILE_PokemonCenter_Escalator2F_Tile2_Frame2 } from '../include/constants/metatile_labels';
import { DrawWholeMapView } from './field_camera';
import { PlayerGetDestCoords } from './field_player_avatar';
import { MAPGRID_IMPASSABLE, MapGridGetMetatileIdAt, MapGridSetMetatileIdAt } from './fieldmap';
import { CreateTask, DestroyTask, gTasks } from './task';

/** 1:1 (fldeff_escalator.c:9) */
let sEscalatorAnim_TaskId = 0;

const ESCALATOR_STAGES = 3; // 1:1 fldeff_escalator.c:14

const LAST_ESCALATOR_STAGE = (ESCALATOR_STAGES - 1); // 1:1 fldeff_escalator.c:15

/** 1:1 (fldeff_escalator.c:17) */
const sEscalatorMetatiles_1F_0 = Int16Array.from([
  METATILE_PokemonCenter_Escalator1F_Tile0_Frame2,
  METATILE_PokemonCenter_Escalator1F_Tile0_Frame1,
  METATILE_PokemonCenter_Escalator1F_Tile0_Frame0,
]);

/** 1:1 (fldeff_escalator.c:23) */
const sEscalatorMetatiles_1F_1 = Int16Array.from([
  METATILE_PokemonCenter_Escalator1F_Tile1_Frame2,
  METATILE_PokemonCenter_Escalator1F_Tile1_Frame1,
  METATILE_PokemonCenter_Escalator1F_Tile1_Frame0,
]);

/** 1:1 (fldeff_escalator.c:29) */
const sEscalatorMetatiles_1F_2 = Int16Array.from([
  METATILE_PokemonCenter_Escalator1F_Tile2_Frame2,
  METATILE_PokemonCenter_Escalator1F_Tile2_Frame1,
  METATILE_PokemonCenter_Escalator1F_Tile2_Frame0,
]);

/** 1:1 (fldeff_escalator.c:35) */
const sEscalatorMetatiles_1F_3 = Int16Array.from([
  METATILE_PokemonCenter_Escalator1F_Tile3_Frame2,
  METATILE_PokemonCenter_Escalator1F_Tile3_Frame1,
  METATILE_PokemonCenter_Escalator1F_Tile3_Frame0,
]);

/** 1:1 (fldeff_escalator.c:41) */
const sEscalatorMetatiles_2F_0 = Int16Array.from([
  METATILE_PokemonCenter_Escalator2F_Tile0_Frame0,
  METATILE_PokemonCenter_Escalator2F_Tile0_Frame1,
  METATILE_PokemonCenter_Escalator2F_Tile0_Frame2,
]);

/** 1:1 (fldeff_escalator.c:47) */
const sEscalatorMetatiles_2F_1 = Int16Array.from([
  METATILE_PokemonCenter_Escalator2F_Tile1_Frame0,
  METATILE_PokemonCenter_Escalator2F_Tile1_Frame1,
  METATILE_PokemonCenter_Escalator2F_Tile1_Frame2,
]);

/** 1:1 (fldeff_escalator.c:53) */
const sEscalatorMetatiles_2F_2 = Int16Array.from([
  METATILE_PokemonCenter_Escalator2F_Tile2_Frame0,
  METATILE_PokemonCenter_Escalator2F_Tile2_Frame1,
  METATILE_PokemonCenter_Escalator2F_Tile2_Frame2,
]);

// #define tState data[0]  (alias — expansé aux usages)

// #define tTransitionStage data[1]  (alias — expansé aux usages)

// #define tGoingUp data[2]  (alias — expansé aux usages)

// #define tDrawingEscalator data[3]  (alias — expansé aux usages)

// #define tPlayerX data[4]  (alias — expansé aux usages)

// #define tPlayerY data[5]  (alias — expansé aux usages)

/** 1:1 `static void SetEscalatorMetatile(u8 taskId, const s16 *metatileIds, u16 metatileMasks)` (fldeff_escalator.c:66-111). */
function SetEscalatorMetatile(taskId: number, metatileIds: Int16Array, metatileMasks: number): void {
  let x = gTasks[taskId].data[4] /* tPlayerX */ - 1;
  let y = gTasks[taskId].data[5] /* tPlayerY */ - 1;
  let transitionStage = gTasks[taskId].data[1] /* tTransitionStage */;
  let i = 0;
  let j = 0;
  // Check all the escalator sections and only progress the selected one to the next stage
  if (!gTasks[taskId].data[2] /* tGoingUp */)
  {
    for (i = 0; i < 3; i++)
    {
      for (j = 0; j < 3; j++)
      {
        let metatileId = MapGridGetMetatileIdAt(x + j, y + i);
        if (metatileIds[transitionStage] == metatileId)
        {
          if (transitionStage != LAST_ESCALATOR_STAGE)
            MapGridSetMetatileIdAt(x + j, y + i, metatileMasks | metatileIds[transitionStage + 1]);
          else
            MapGridSetMetatileIdAt(x + j, y + i, metatileMasks | metatileIds[0]);
        }
      }
    }
  }
  else
  {
    for (i = 0; i < 3; i++)
    {
      for (j = 0; j < 3; j++)
      {
        let metatileId = MapGridGetMetatileIdAt(x + j, y + i);
        if (metatileIds[LAST_ESCALATOR_STAGE - transitionStage] == metatileId)
        {
          if (transitionStage != LAST_ESCALATOR_STAGE)
            MapGridSetMetatileIdAt(x + j, y + i, metatileMasks | metatileIds[1 - transitionStage]);
          else
            MapGridSetMetatileIdAt(x + j, y + i, metatileMasks | metatileIds[LAST_ESCALATOR_STAGE]);
        }
      }
    }
  }
}

/** 1:1 `static void Task_DrawEscalator(u8 taskId)` (fldeff_escalator.c:113-154). */
function Task_DrawEscalator(taskId: number): void {
  let data = gTasks[taskId].data;
  data[3] /* tDrawingEscalator */ = 1;
  // Set tile for each section of the escalator in sequence for current transition stage
  switch (data[0] /* tState */) {
    case 0:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_0, 0);
      break;
    case 1:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_1, 0);
      break;
    case 2:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_2, MAPGRID_IMPASSABLE);
      break;
    case 3:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_3, 0);
      break;
    case 4:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_0, MAPGRID_IMPASSABLE);
      break;
    case 5:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_1, 0);
      break;
    case 6:
      SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_2, 0);
      break;
  }
  data[0] /* tState */ = (data[0] /* tState */ + 1) & 7;
  // If all metatiles of the escalator have been set, draw map and progress to next stage
  if (data[0] /* tState */ == 0)
  {
    DrawWholeMapView();
    data[1] /* tTransitionStage */ = (data[1] /* tTransitionStage */ + 1) % ESCALATOR_STAGES;
    data[3] /* tDrawingEscalator */ = 0;
  }
}

/** 1:1 `static u8 CreateEscalatorTask(bool16 goingUp)` (fldeff_escalator.c:156-167).
 *  Revue transpiler : `PlayerGetDestCoords(&tPlayerX, &tPlayerY)` (out-params C)
 *  → notre port retourne {x, y}. */
function CreateEscalatorTask(goingUp: boolean): number {
  let taskId = CreateTask(Task_DrawEscalator, 0);
  let data = gTasks[taskId].data;
  const dest = PlayerGetDestCoords();
  data[4] /* tPlayerX */ = dest.x;
  data[5] /* tPlayerY */ = dest.y;
  data[0] /* tState */ = 0;
  data[1] /* tTransitionStage */ = 0;
  data[2] /* tGoingUp */ = +(goingUp);
  Task_DrawEscalator(taskId);
  return taskId;
}

/** 1:1 `void StartEscalator(bool8 goingUp)` (fldeff_escalator.c:169-172). */
export function StartEscalator(goingUp: boolean): void {
  sEscalatorAnim_TaskId = CreateEscalatorTask(goingUp);
}

/** 1:1 `void StopEscalator(void)` (fldeff_escalator.c:174-177). */
export function StopEscalator(): void {
  DestroyTask(sEscalatorAnim_TaskId);
}

/** 1:1 `bool8 IsEscalatorMoving(void)` (fldeff_escalator.c:179-186). */
export function IsEscalatorMoving(): boolean {
  if (gTasks[sEscalatorAnim_TaskId].data[3] /* tDrawingEscalator */ == 0 && gTasks[sEscalatorAnim_TaskId].data[1] /* tTransitionStage */ == LAST_ESCALATOR_STAGE)
    return false;
  else
    return true;
}

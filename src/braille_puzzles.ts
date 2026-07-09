/**
 * braille_puzzles.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/braille_puzzles.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/braille_puzzles.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLDEFF_USE_TOMB_PUZZLE_EFFECT } from '../include/constants/field_effects';
import { FLAG_SYS_BRAILLE_DIG, FLAG_SYS_BRAILLE_REGICE_COMPLETED, FLAG_SYS_REGIROCK_PUZZLE_COMPLETED, FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED, FLAG_TEMP_REGICE_PUZZLE_FAILED, FLAG_TEMP_REGICE_PUZZLE_STARTED } from '../include/constants/flags';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';
import { METATILE_Cave_SealedChamberEntrance_BottomLeft, METATILE_Cave_SealedChamberEntrance_BottomMid, METATILE_Cave_SealedChamberEntrance_BottomRight, METATILE_Cave_SealedChamberEntrance_TopLeft, METATILE_Cave_SealedChamberEntrance_TopMid, METATILE_Cave_SealedChamberEntrance_TopRight } from '../include/constants/metatile_labels';
import { SE_BANG } from '../include/constants/songs';
import { SPECIES_RELICANTH, SPECIES_WAILORD } from '../include/constants/species';
import { VAR_REGICE_STEPS_1, VAR_REGICE_STEPS_2, VAR_REGICE_STEPS_3 } from '../include/constants/vars';
import { MAP_OFFSET } from '../include/fieldmap';
import { MON_DATA_SPECIES_OR_EGG } from '../include/pokemon';
import { PlaySE } from './battle_controllers';
import { GetMonData } from './engine/battle/party-storage';
import { FieldEffectActiveListRemove } from './field_effect';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FlagClear, FlagGet, FlagSet, VarGet, VarSet } from './event_data';
import { DrawWholeMapView, InstallCameraPanAheadCallback, SetCameraPanning, SetCameraPanningCallback } from './field_camera';
import { FieldEffectStart, gFieldEffectArguments } from './field_effect';
import { CreateFieldMoveTask } from './field_effect_helpers';
import { MAPGRID_IMPASSABLE, MapGridSetMetatileIdAt } from './fieldmap';
import { GetCursorSelectionMonId } from './party_menu';
import { CalculatePlayerPartyCount, gPlayerParty, gPlayerPartyCount } from './pokemon';
import { ScriptContext_Enable, UnlockPlayerFieldControls } from './script';
import { CreateTask, DestroyTask, gTasks } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

/** 1:1 (braille_puzzles.c:15) */
let sIsRegisteelPuzzle = false;

/** 1:1 (braille_puzzles.c:17) */
const sRegicePathCoords: number[][] = [
  [
    4,
    21,
  ],
  [
    5,
    21,
  ],
  [
    6,
    21,
  ],
  [
    7,
    21,
  ],
  [
    8,
    21,
  ],
  [
    9,
    21,
  ],
  [
    10,
    21,
  ],
  [
    11,
    21,
  ],
  [
    12,
    21,
  ],
  [
    12,
    22,
  ],
  [
    12,
    23,
  ],
  [
    13,
    23,
  ],
  [
    13,
    24,
  ],
  [
    13,
    25,
  ],
  [
    13,
    26,
  ],
  [
    13,
    27,
  ],
  [
    12,
    27,
  ],
  [
    12,
    28,
  ],
  [
    4,
    29,
  ],
  [
    5,
    29,
  ],
  [
    6,
    29,
  ],
  [
    7,
    29,
  ],
  [
    8,
    29,
  ],
  [
    9,
    29,
  ],
  [
    10,
    29,
  ],
  [
    11,
    29,
  ],
  [
    12,
    29,
  ],
  [
    4,
    28,
  ],
  [
    4,
    27,
  ],
  [
    3,
    27,
  ],
  [
    3,
    26,
  ],
  [
    3,
    25,
  ],
  [
    3,
    24,
  ],
  [
    3,
    23,
  ],
  [
    4,
    23,
  ],
  [
    4,
    22,
  ],
];

/** 1:1 `bool8 ShouldDoBrailleDigEffect(void)` (braille_puzzles.c:61-76). */
export function ShouldDoBrailleDigEffect(): boolean {
  if (!FlagGet(FLAG_SYS_BRAILLE_DIG) && (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_SEALED_CHAMBER_OUTER_ROOM) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_SEALED_CHAMBER_OUTER_ROOM)))
  {
    if (gSaveBlock1Ptr.pos.x == 10 && gSaveBlock1Ptr.pos.y == 3)
      return true;
    if (gSaveBlock1Ptr.pos.x == 9 && gSaveBlock1Ptr.pos.y == 3)
      return true;
    if (gSaveBlock1Ptr.pos.x == 11 && gSaveBlock1Ptr.pos.y == 3)
      return true;
  }
  return false;
}

/** 1:1 `void DoBrailleDigEffect(void)` (braille_puzzles.c:78-90). */
export function DoBrailleDigEffect(): void {
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopLeft);
  MapGridSetMetatileIdAt(10 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopMid);
  MapGridSetMetatileIdAt(11 + MAP_OFFSET, 1 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopRight);
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomLeft | MAPGRID_IMPASSABLE);
  MapGridSetMetatileIdAt(10 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomMid);
  MapGridSetMetatileIdAt(11 + MAP_OFFSET, 2 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomRight | MAPGRID_IMPASSABLE);
  DrawWholeMapView();
  PlaySE(SE_BANG);
  FlagSet(FLAG_SYS_BRAILLE_DIG);
  UnlockPlayerFieldControls();
}

/** 1:1 `bool8 CheckRelicanthWailord(void)` (braille_puzzles.c:92-104). */
export function CheckRelicanthWailord(): boolean {
  // Emerald change: why did they flip it?
  // First comes Wailord
  if (GetMonData(gPlayerParty[0], MON_DATA_SPECIES_OR_EGG) == SPECIES_WAILORD)
  {
    CalculatePlayerPartyCount();
    // Last comes Relicanth
    if (GetMonData(gPlayerParty[gPlayerPartyCount - 1], MON_DATA_SPECIES_OR_EGG) == SPECIES_RELICANTH)
      return true;
  }
  return false;
}

// THEORY: this was caused by block commenting out all of the older R/S braille functions but leaving the call to it itself, which creates the nullsub.

/** 1:1 `void ShouldDoBrailleRegirockEffectOld(void)` (braille_puzzles.c:107-109). */
export function ShouldDoBrailleRegirockEffectOld(): void {
}

// #define tDelayCounter data[1]  (alias — expansé aux usages)

// #define tShakeCounter data[2]  (alias — expansé aux usages)

// #define tVerticalPan data[4]  (alias — expansé aux usages)

// #define tDelay data[5]  (alias — expansé aux usages)

// #define tNumShakes data[6]  (alias — expansé aux usages)

/** 1:1 `void DoSealedChamberShakingEffect_Long(void)` (braille_puzzles.c:117-127). */
export function DoSealedChamberShakingEffect_Long(): void {
  // Revue transpiler : pattern task runtime OBLIGATOIRE (t)=>fn(t.taskId).
  let taskId = CreateTask((t: { taskId: number }) => Task_SealedChamberShakingEffect(t.taskId), 9);
  gTasks[taskId].data[1] /* tDelayCounter */ = 0;
  gTasks[taskId].data[2] /* tShakeCounter */ = 0;
  gTasks[taskId].data[4] /* tVerticalPan */ = 2;
  gTasks[taskId].data[5] /* tDelay */ = 5;
  gTasks[taskId].data[6] /* tNumShakes */ = 50;
  SetCameraPanningCallback(null);
}

/** 1:1 `void DoSealedChamberShakingEffect_Short(void)` (braille_puzzles.c:129-139). */
export function DoSealedChamberShakingEffect_Short(): void {
  // Revue transpiler : pattern task runtime OBLIGATOIRE (t)=>fn(t.taskId).
  let taskId = CreateTask((t: { taskId: number }) => Task_SealedChamberShakingEffect(t.taskId), 9);
  gTasks[taskId].data[1] /* tDelayCounter */ = 0;
  gTasks[taskId].data[2] /* tShakeCounter */ = 0;
  gTasks[taskId].data[4] /* tVerticalPan */ = 3;
  gTasks[taskId].data[5] /* tDelay */ = 5;
  gTasks[taskId].data[6] /* tNumShakes */ = 2;
  SetCameraPanningCallback(null);
}

/** 1:1 `static void Task_SealedChamberShakingEffect(u8 taskId)` (braille_puzzles.c:141-159). */
function Task_SealedChamberShakingEffect(taskId: number): void {
  let task = gTasks[taskId];
  task.data[1] /* tDelayCounter */++;
  if (task.data[1] /* tDelayCounter */ % task.data[5] /* tDelay */ == 0)
  {
    task.data[1] /* tDelayCounter */ = 0;
    task.data[2] /* tShakeCounter */++;
    task.data[4] /* tVerticalPan */ = -task.data[4] /* tVerticalPan */;
    SetCameraPanning(0, task.data[4] /* tVerticalPan */);
    if (task.data[2] /* tShakeCounter */ == task.data[6] /* tNumShakes */)
    {
      DestroyTask(taskId);
      ScriptContext_Enable();
      // Revue transpiler : specials waitstate=1 — notre waitstate byte-VM attend
      // SignalWaitState (pattern trainer_see Task_EndTrainerApproach).
      (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState?.();
      InstallCameraPanAheadCallback();
    }
  }
}

/** 1:1 `bool8 ShouldDoBrailleRegirockEffect(void)` (braille_puzzles.c:167-191). */
export function ShouldDoBrailleRegirockEffect(): boolean {
  if (!FlagGet(FLAG_SYS_REGIROCK_PUZZLE_COMPLETED) && gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_DESERT_RUINS) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_DESERT_RUINS))
  {
    if (gSaveBlock1Ptr.pos.x == 6 && gSaveBlock1Ptr.pos.y == 23)
    {
      sIsRegisteelPuzzle = false;
      return true;
    }
    else if (gSaveBlock1Ptr.pos.x == 5 && gSaveBlock1Ptr.pos.y == 23)
    {
      sIsRegisteelPuzzle = false;
      return true;
    }
    else if (gSaveBlock1Ptr.pos.x == 7 && gSaveBlock1Ptr.pos.y == 23)
    {
      sIsRegisteelPuzzle = false;
      return true;
    }
  }
  return false;
}

/** 1:1 `void SetUpPuzzleEffectRegirock(void)` (braille_puzzles.c:193-197). */
export function SetUpPuzzleEffectRegirock(): void {
  gFieldEffectArguments[0] = GetCursorSelectionMonId();
  FieldEffectStart(FLDEFF_USE_TOMB_PUZZLE_EFFECT);
}

/** 1:1 `void UseRegirockHm_Callback(void)` (braille_puzzles.c:199-203). */
export function UseRegirockHm_Callback(): void {
  FieldEffectActiveListRemove(FLDEFF_USE_TOMB_PUZZLE_EFFECT);
  DoBrailleRegirockEffect();
}

/** 1:1 `static void DoBrailleRegirockEffect(void)` (braille_puzzles.c:205-217). */
function DoBrailleRegirockEffect(): void {
  MapGridSetMetatileIdAt(7 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopLeft);
  MapGridSetMetatileIdAt(8 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopMid);
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopRight);
  MapGridSetMetatileIdAt(7 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomLeft | MAPGRID_IMPASSABLE);
  MapGridSetMetatileIdAt(8 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomMid);
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomRight | MAPGRID_IMPASSABLE);
  DrawWholeMapView();
  PlaySE(SE_BANG);
  FlagSet(FLAG_SYS_REGIROCK_PUZZLE_COMPLETED);
  UnlockPlayerFieldControls();
}

/** 1:1 `bool8 ShouldDoBrailleRegisteelEffect(void)` (braille_puzzles.c:219-230). */
export function ShouldDoBrailleRegisteelEffect(): boolean {
  if (!FlagGet(FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED) && (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_ANCIENT_TOMB) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_ANCIENT_TOMB)))
  {
    if (gSaveBlock1Ptr.pos.x == 8 && gSaveBlock1Ptr.pos.y == 25)
    {
      sIsRegisteelPuzzle = true;
      return true;
    }
  }
  return false;
}

/** 1:1 `void SetUpPuzzleEffectRegisteel(void)` (braille_puzzles.c:232-236). */
export function SetUpPuzzleEffectRegisteel(): void {
  gFieldEffectArguments[0] = GetCursorSelectionMonId();
  FieldEffectStart(FLDEFF_USE_TOMB_PUZZLE_EFFECT);
}

/** 1:1 `void UseRegisteelHm_Callback(void)` (braille_puzzles.c:238-242). */
export function UseRegisteelHm_Callback(): void {
  FieldEffectActiveListRemove(FLDEFF_USE_TOMB_PUZZLE_EFFECT);
  DoBrailleRegisteelEffect();
}

/** 1:1 `static void DoBrailleRegisteelEffect(void)` (braille_puzzles.c:244-256). */
function DoBrailleRegisteelEffect(): void {
  MapGridSetMetatileIdAt(7 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopLeft);
  MapGridSetMetatileIdAt(8 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopMid);
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 19 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_TopRight);
  MapGridSetMetatileIdAt(7 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomLeft | MAPGRID_IMPASSABLE);
  MapGridSetMetatileIdAt(8 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomMid);
  MapGridSetMetatileIdAt(9 + MAP_OFFSET, 20 + MAP_OFFSET, METATILE_Cave_SealedChamberEntrance_BottomRight | MAPGRID_IMPASSABLE);
  DrawWholeMapView();
  PlaySE(SE_BANG);
  FlagSet(FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED);
  UnlockPlayerFieldControls();
}

// theory: another commented out DoBrailleWait and Task_BrailleWait.

/** 1:1 `static void DoBrailleWait(void)` (braille_puzzles.c:259-261). */
function DoBrailleWait(): void {
}

// this used to be FldEff_UseFlyAncientTomb . why did GF merge the 2 functions?

/** 1:1 `bool8 FldEff_UsePuzzleEffect(void)` (braille_puzzles.c:264-279).
 *  Revue transpiler : la décomp splitte le POINTEUR de callback dans
 *  data[8]/data[9] (u32 → 2×s16) ; convention repo (fldeff_rocksmash & co) :
 *  `CreateFieldMoveTask(cb)` reçoit le callback directement. */
export function FldEff_UsePuzzleEffect(): boolean {
  let taskId: number;
  if (sIsRegisteelPuzzle == true)
    taskId = CreateFieldMoveTask(UseRegisteelHm_Callback);
  else
    taskId = CreateFieldMoveTask(UseRegirockHm_Callback);
  void taskId;
  return false;
}

// The puzzle to unlock Regice's cave requires the player to interact with the braille message on the back wall,

// step on every space on the perimeter of the cave (and only those spaces) then return to the back wall.

/** 1:1 `bool8 ShouldDoBrailleRegicePuzzle(void)` (braille_puzzles.c:283-343). */
export function ShouldDoBrailleRegicePuzzle(): boolean {
  let i = 0;
  if (gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_ISLAND_CAVE) && gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_ISLAND_CAVE))
  {
    if (FlagGet(FLAG_SYS_BRAILLE_REGICE_COMPLETED))
      return false;
    // Set when the player interacts with the braille message
    if (!FlagGet(FLAG_TEMP_REGICE_PUZZLE_STARTED))
      return false;
    // Cleared when the player interacts with the braille message
    if (FlagGet(FLAG_TEMP_REGICE_PUZZLE_FAILED))
      return false;
    for (i = 0; i < sRegicePathCoords.length; i++)
    {
      let xPos = sRegicePathCoords[i][0];
      let yPos = sRegicePathCoords[i][1];
      if (gSaveBlock1Ptr.pos.x == xPos && gSaveBlock1Ptr.pos.y == yPos)
      {
        // Player is standing on a correct space, set the corresponding bit
        if (i < 16)
        {
          let val = VarGet(VAR_REGICE_STEPS_1);
          val |= 1 << i;
          VarSet(VAR_REGICE_STEPS_1, val);
        }
        else if (i < 32)
        {
          let val = VarGet(VAR_REGICE_STEPS_2);
          val |= 1 << (i - 16);
          VarSet(VAR_REGICE_STEPS_2, val);
        }
        else
        {
          let val = VarGet(VAR_REGICE_STEPS_3);
          val |= 1 << (i - 32);
          VarSet(VAR_REGICE_STEPS_3, val);
        }
        // Make sure a full lap has been completed. There are 36 steps in a lap, so 16+16+4 bits to check across the 3 vars.
        if (VarGet(VAR_REGICE_STEPS_1) != 0xFFFF || VarGet(VAR_REGICE_STEPS_2) != 0xFFFF || VarGet(VAR_REGICE_STEPS_3) != 0xF)
          return false;
        // A lap has been completed, the puzzle is complete when the player returns to the braille message.
        if (gSaveBlock1Ptr.pos.x == 8 && gSaveBlock1Ptr.pos.y == 21)
          return true;
        else
          return false;
      }
    }
    // Player stepped on an incorrect space, puzzle failed.
    FlagSet(FLAG_TEMP_REGICE_PUZZLE_FAILED);
    FlagClear(FLAG_TEMP_REGICE_PUZZLE_STARTED);
  }
  return false;
}

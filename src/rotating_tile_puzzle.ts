/**
 * rotating_tile_puzzle.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/rotating_tile_puzzle.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/rotating_tile_puzzle.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_LOCK_ANIM, MOVEMENT_ACTION_STEP_END, MOVEMENT_ACTION_UNLOCK_ANIM, MOVEMENT_ACTION_WALK_NORMAL_DOWN, MOVEMENT_ACTION_WALK_NORMAL_LEFT, MOVEMENT_ACTION_WALK_NORMAL_RIGHT, MOVEMENT_ACTION_WALK_NORMAL_UP, MOVEMENT_TYPE_FACE_DOWN, MOVEMENT_TYPE_FACE_LEFT, MOVEMENT_TYPE_FACE_RIGHT, MOVEMENT_TYPE_FACE_UP } from '../include/constants/event_object_movement';
import { LOCALID_NONE, LOCALID_PLAYER } from '../include/constants/event_objects';
import { DIR_EAST, DIR_NORTH, DIR_SOUTH, DIR_WEST, OBJECT_EVENTS_COUNT, OBJECT_EVENT_TEMPLATES_COUNT } from '../include/constants/global';
import { METATILE_MossdeepGym_YellowArrow_Right, METATILE_TrickHousePuzzle_Arrow_YellowOnWhite_Right } from '../include/constants/metatile_labels';
import { MAP_OFFSET } from '../include/fieldmap';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { GetObjectEventIdByLocalIdAndMap, ObjectEventClearHeldMovementIfFinished, gObjectEvents } from './event_object_movement';
import { MapGridGetMetatileIdAt } from './fieldmap';
import { ScriptMovement_StartObjectMovementScript, ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import type { ObjectEventTemplate } from './engine/save/save-blocks';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const METATILE_ROW_WIDTH = 8; // 1:1 include/global.fieldmap.h:60 (à consolider dans include/)

const ROTATE_COUNTERCLOCKWISE = 0; // 1:1 rotating_tile_puzzle.c:11

const ROTATE_CLOCKWISE = 1; // 1:1 rotating_tile_puzzle.c:12

const ROTATE_NONE = 2; // 1:1 rotating_tile_puzzle.c:13

/** 1:1 `struct RotatingTileObject` (rotating_tile_puzzle.c:15). */
interface RotatingTileObject {
  prevPuzzleTileNum: number;
  eventTemplateId: number;
}

/** 1:1 `struct RotatingTilePuzzle` (rotating_tile_puzzle.c:21). */
interface RotatingTilePuzzle {
  objects: RotatingTileObject[];
  numObjects: number;
  isTrickHouse: boolean;
}

/** 1:1 (rotating_tile_puzzle.c:28) */
const sMovement_ShiftRight = Uint8Array.from([
  MOVEMENT_ACTION_LOCK_ANIM,
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:36) */
const sMovement_ShiftDown = Uint8Array.from([
  MOVEMENT_ACTION_LOCK_ANIM,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:44) */
const sMovement_ShiftLeft = Uint8Array.from([
  MOVEMENT_ACTION_LOCK_ANIM,
  MOVEMENT_ACTION_WALK_NORMAL_LEFT,
  MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:52) */
const sMovement_ShiftUp = Uint8Array.from([
  MOVEMENT_ACTION_LOCK_ANIM,
  MOVEMENT_ACTION_WALK_NORMAL_UP,
  MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:60) */
const sMovement_FaceRight = Uint8Array.from([
  MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:66) */
const sMovement_FaceDown = Uint8Array.from([
  MOVEMENT_ACTION_FACE_DOWN,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:72) */
const sMovement_FaceLeft = Uint8Array.from([
  MOVEMENT_ACTION_FACE_LEFT,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:78) */
const sMovement_FaceUp = Uint8Array.from([
  MOVEMENT_ACTION_FACE_UP,
  MOVEMENT_ACTION_STEP_END,
]);

/** 1:1 (rotating_tile_puzzle.c:87) */
export let struct = 0;

/** 1:1 (rotating_tile_puzzle.c:87) */
export let sRotatingTilePuzzle: RotatingTilePuzzle | null = null;

/** 1:1 `void InitRotatingTilePuzzle(bool8 isTrickHouse)` (rotating_tile_puzzle.c:89-95). */
export function InitRotatingTilePuzzle(isTrickHouse: boolean): void {
  if (sRotatingTilePuzzle == null)
    sRotatingTilePuzzle = ({} as any) /* TRANSPILER-TODO AllocZeroed */;
  sRotatingTilePuzzle!.isTrickHouse = isTrickHouse;
}

/** 1:1 `void FreeRotatingTilePuzzle(void)` (rotating_tile_puzzle.c:97-106). */
export function FreeRotatingTilePuzzle(): void {
  let id = 0;
  sRotatingTilePuzzle = null /* TRY_FREE_AND_SET_NULL — GC */;
  id = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
  ObjectEventClearHeldMovementIfFinished(gObjectEvents[id]);
  ScriptMovement_UnfreezeObjectEvents();
}

/** 1:1 `u16 MoveRotatingTileObjects(u8 puzzleNumber)` (rotating_tile_puzzle.c:108-188). */
export function MoveRotatingTileObjects(puzzleNumber: number): number {
  let i = 0;
  let objectEvents = gSaveBlock1Ptr.objectEventTemplates;
  let localId = LOCALID_NONE;
  for (i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++)
  {
    let puzzleTileStart = 0;
    let puzzleTileNum = 0;
    let x = objectEvents[i].x + MAP_OFFSET;
    let y = objectEvents[i].y + MAP_OFFSET;
    let metatile = MapGridGetMetatileIdAt(x, y);
    if (!sRotatingTilePuzzle!.isTrickHouse)
      puzzleTileStart = METATILE_MossdeepGym_YellowArrow_Right;
    else
      puzzleTileStart = METATILE_TrickHousePuzzle_Arrow_YellowOnWhite_Right;
    // Object is on a metatile before the puzzle tile section
    // UB: Because this is not if (metatile < puzzleTileStart), for the trick house (metatile - puzzleTileStart) below can result in casting a negative value to u8
    if (metatile < METATILE_MossdeepGym_YellowArrow_Right)
      continue;
    // Object is on a metatile after the puzzle tile section (never occurs, in both cases the puzzle tiles are last)
    if (((Math.trunc((metatile - puzzleTileStart) / METATILE_ROW_WIDTH)) & 0xFF) >= 5)
      continue;
    // Object is on a metatile in puzzle tile section, but not one of the currently rotating color
    if (((Math.trunc((metatile - puzzleTileStart) / METATILE_ROW_WIDTH)) & 0xFF) != puzzleNumber)
      continue;
    puzzleTileNum = (((metatile - puzzleTileStart) % METATILE_ROW_WIDTH) & 0xFF);
    // First 4 puzzle tiles are the colored arrows
    if (puzzleTileNum < 4)
    {
      let x = 0;
      let y = 0;
      let movementScript: any = null;
      switch (puzzleTileNum) {
        case 0:
          // Right Arrow
          movementScript = sMovement_ShiftRight;
          x = 1;
          break;
        case 1:
          // Down Arrow
          movementScript = sMovement_ShiftDown;
          y = 1;
          break;
        case 2:
          // Left Arrow
          movementScript = sMovement_ShiftLeft;
          x = -1;
          break;
        case 3:
          // Up Arrow
          movementScript = sMovement_ShiftUp;
          y = -1;
          break;
        default:
          continue;
      }
      objectEvents[i].x += x;
      objectEvents[i].y += y;
      if (GetObjectEventIdByLocalIdAndMap(objectEvents[i].localId, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup) != OBJECT_EVENTS_COUNT)
      {
        SaveRotatingTileObject(i, puzzleTileNum);
        localId = objectEvents[i].localId;
        ScriptMovement_StartObjectMovementScript(localId, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, movementScript);
      }
      else
      {
        TurnUnsavedRotatingTileObject(i, puzzleTileNum);
      }
    }
  }
  return localId;
}

/** 1:1 `void TurnRotatingTileObjects(void)` (rotating_tile_puzzle.c:190-304). */
export function TurnRotatingTileObjects(): void {
  let i = 0;
  let puzzleTileStart = 0;
  let objectEvents: any = null;
  if (sRotatingTilePuzzle == null)
    return;
  if (!sRotatingTilePuzzle!.isTrickHouse)
    puzzleTileStart = METATILE_MossdeepGym_YellowArrow_Right;
  else
    puzzleTileStart = METATILE_TrickHousePuzzle_Arrow_YellowOnWhite_Right;
  objectEvents = gSaveBlock1Ptr.objectEventTemplates;
  for (i = 0; i < sRotatingTilePuzzle!.numObjects; i++)
  {
    let rotation = 0;
    let tileDifference = 0;
    let objectEventId = 0;
    let x = objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].x + MAP_OFFSET;
    let y = objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].y + MAP_OFFSET;
    let metatile = MapGridGetMetatileIdAt(x, y);
    // NOTE: The following 2 assignments and if else could all be replaced with rotation = ROTATE_COUNTERCLOCKWISE
    // For an object to be saved in sRotatingTilePuzzle->objects, it must have been on a colored arrow tile
    // After the first assignment, tileDifference will always be a number [0-3] representing which arrow tile the object is on now (0: right, 1: down, 2: left, 3: up)
    // prevPuzzleTileNum will similarly be a number [0-3] representing the arrow tile the object just moved from
    // All the puzzles are oriented counter-clockwise and can only move 1 step at a time, so the difference between the current tile and the previous tile will always either be -1 or 3 (0-1, 1-2, 2-3, 3-0)
    // Which means tileDifference will always either be -1 or 3 after the below subtraction, and rotation will always be ROTATE_COUNTERCLOCKWISE after the following conditionals
    tileDifference = (((metatile - puzzleTileStart) % METATILE_ROW_WIDTH) & 0xFF);
    tileDifference -= (sRotatingTilePuzzle!.objects[i].prevPuzzleTileNum);
    // Always true, see above
    if (tileDifference < 0 || tileDifference == 3)
    {
      // Always false, see above
      if (tileDifference == -3)
        rotation = ROTATE_CLOCKWISE;
      else
        rotation = ROTATE_COUNTERCLOCKWISE;
    }
    else
    {
      if (tileDifference > 0)
        rotation = ROTATE_CLOCKWISE;
      else
        rotation = ROTATE_NONE;
    }
    objectEventId = GetObjectEventIdByLocalIdAndMap(objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].localId, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup);
    if (objectEventId != OBJECT_EVENTS_COUNT)
    {
      let movementScript: any = null;
      let direction = gObjectEvents[objectEventId].facingDirection;
      if (rotation == ROTATE_COUNTERCLOCKWISE)
      {
        switch (direction) {
          case DIR_EAST:
            movementScript = sMovement_FaceUp;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_UP;
            break;
          case DIR_SOUTH:
            movementScript = sMovement_FaceRight;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_RIGHT;
            break;
          case DIR_WEST:
            movementScript = sMovement_FaceDown;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_DOWN;
            break;
          case DIR_NORTH:
            movementScript = sMovement_FaceLeft;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_LEFT;
            break;
          default:
            continue;
        }
        ScriptMovement_StartObjectMovementScript(objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].localId, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, movementScript);
      }
      else if (rotation == ROTATE_CLOCKWISE)
      {
        switch (direction) {
          case DIR_EAST:
            movementScript = sMovement_FaceDown;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_DOWN;
            break;
          case DIR_SOUTH:
            movementScript = sMovement_FaceLeft;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_LEFT;
            break;
          case DIR_WEST:
            movementScript = sMovement_FaceUp;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_UP;
            break;
          case DIR_NORTH:
            movementScript = sMovement_FaceRight;
            objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].movementType = MOVEMENT_TYPE_FACE_RIGHT;
            break;
          default:
            continue;
        }
        ScriptMovement_StartObjectMovementScript(objectEvents[sRotatingTilePuzzle!.objects[i].eventTemplateId].localId, gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup, movementScript);
      }
    }
  }
}

/** 1:1 `static void SaveRotatingTileObject(u8 eventTemplateId, u8 puzzleTileNum)` (rotating_tile_puzzle.c:306-311). */
function SaveRotatingTileObject(eventTemplateId: number, puzzleTileNum: number): void {
  sRotatingTilePuzzle!.objects[sRotatingTilePuzzle!.numObjects].eventTemplateId = eventTemplateId;
  sRotatingTilePuzzle!.objects[sRotatingTilePuzzle!.numObjects].prevPuzzleTileNum = puzzleTileNum;
  sRotatingTilePuzzle!.numObjects++;
}

// Functionally unused

/** 1:1 `static void TurnUnsavedRotatingTileObject(u8 eventTemplateId, u8 puzzleTileNum)` (rotating_tile_puzzle.c:314-381). */
function TurnUnsavedRotatingTileObject(eventTemplateId: number, puzzleTileNum: number): void {
  let tileDifference = 0;
  let rotation = 0;
  let puzzleTileStart = 0;
  let movementType = 0;
  let objectEvents = gSaveBlock1Ptr.objectEventTemplates;
  let x = objectEvents[eventTemplateId].x + MAP_OFFSET;
  let y = objectEvents[eventTemplateId].y + MAP_OFFSET;
  let metatile = MapGridGetMetatileIdAt(x, y);
  if (!sRotatingTilePuzzle!.isTrickHouse)
    puzzleTileStart = METATILE_MossdeepGym_YellowArrow_Right;
  else
    puzzleTileStart = METATILE_TrickHousePuzzle_Arrow_YellowOnWhite_Right;
  tileDifference = (((metatile - puzzleTileStart) % METATILE_ROW_WIDTH) & 0xFF);
  tileDifference -= puzzleTileNum;
  if (tileDifference < 0 || tileDifference == 3)
    rotation = ROTATE_COUNTERCLOCKWISE;
  else if (tileDifference > 0 || tileDifference == -3)
    rotation = ROTATE_CLOCKWISE;
  else
    rotation = ROTATE_NONE;
  movementType = objectEvents[eventTemplateId].movementType;
  if (rotation == ROTATE_COUNTERCLOCKWISE)
  {
    switch (movementType) {
      case MOVEMENT_TYPE_FACE_RIGHT:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_UP;
        break;
      case MOVEMENT_TYPE_FACE_DOWN:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_RIGHT;
        break;
      case MOVEMENT_TYPE_FACE_LEFT:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_DOWN;
        break;
      case MOVEMENT_TYPE_FACE_UP:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_LEFT;
        break;
      default:
        break;
    }
  }
  else if (rotation == ROTATE_CLOCKWISE)
  {
    switch (movementType) {
      case MOVEMENT_TYPE_FACE_RIGHT:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_DOWN;
        break;
      case MOVEMENT_TYPE_FACE_DOWN:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_LEFT;
        break;
      case MOVEMENT_TYPE_FACE_LEFT:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_UP;
        break;
      case MOVEMENT_TYPE_FACE_UP:
        objectEvents[eventTemplateId].movementType = MOVEMENT_TYPE_FACE_RIGHT;
        break;
      default:
        break;
    }
  }
}

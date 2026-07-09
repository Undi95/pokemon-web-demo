/**
 * rotating_gate.ts — miroir 1:1 de `src/rotating_gate.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/rotating_gate.c`
 *
 * Rotating gates puzzle = Fortree City Gym + Trick House Puzzle 6.
 * Port 1:1 strict de la LOGIQUE (collision, rotation, arm layout, push). La part
 * VISUELLE (LoadRotatingGatePics, CreateGate, SpriteCallback, AffineAnim tables)
 * = dette explicite, à porter quand Fortree/Trick House seront câblés (besoin
 * sprites Phaser + affine anims). PAS #100% (visuel manquant).
 */

import { gMapHeader, MapGridGetCollisionAt, MAP_OFFSET } from './fieldmap';
import { DIR_NORTH, DIR_SOUTH, DIR_WEST, DIR_EAST } from '../include/global.fieldmap';

// ─── Constants 1:1 décomp rotating_gate.c ──────────────────────────────────

/** 1:1 décomp `ROTATING_GATE_PUZZLE_MAX` (rotating_gate.c:12). */
const ROTATING_GATE_PUZZLE_MAX = 12;

/** 1:1 décomp `GATE_ARM_MAX_LENGTH` (rotating_gate.c:13). */
const GATE_ARM_MAX_LENGTH = 2;

/** 1:1 décomp `GATE_ROT_NONE = 255` (rotating_gate.c:19). */
const GATE_ROT_NONE = 255;

/** MAX_SPRITES sentinel (= rotating_gate.c:621 sRotatingGate_GateSpriteIds default).
 *  Notre impl : valeur sentinel "pas de sprite" pour gateSpriteIds.
 *  Migré vers import decomp-data sprite-data.ts (cleanup B7). */
import { MAX_SPRITES } from '../include/sprite';

/** 1:1 décomp `enum` (rotating_gate.c:25-121) GATE_SHAPE_*. */
const GATE_SHAPE_L1           = 0;
const GATE_SHAPE_L2           = 1;
const GATE_SHAPE_L3           = 2;
const GATE_SHAPE_L4           = 3;
const GATE_SHAPE_T1           = 4;
const GATE_SHAPE_T2           = 5;
const GATE_SHAPE_T3           = 6;
const GATE_SHAPE_T4           = 7;
// GATE_SHAPE_UNUSED_T1..T4 = 8..11 (= existent dans sRotatingGate_ArmLayout
// mais non référencés par les puzzleConfigs).

/** 1:1 décomp `enum` (rotating_gate.c:123-156) GATE_ORIENTATION_*. */
const GATE_ORIENTATION_0      = 0;
const GATE_ORIENTATION_90     = 1;
const GATE_ORIENTATION_180    = 2;
const GATE_ORIENTATION_270    = 3;
const GATE_ORIENTATION_MAX    = 4;

/** 1:1 décomp `enum` (rotating_gate.c:160-166) GATE_ARM_*. */
const GATE_ARM_NORTH          = 0;
const GATE_ARM_EAST           = 1;
const GATE_ARM_SOUTH          = 2;
const GATE_ARM_WEST           = 3;

/** 1:1 décomp `enum` (rotating_gate.c:168-173) ROTATE_*. */
const ROTATE_NONE             = 0;
const ROTATE_ANTICLOCKWISE    = 1;
const ROTATE_CLOCKWISE        = 2;

/** 1:1 décomp `enum` (rotating_gate.c:175-180) PUZZLE_*. */
export const PUZZLE_NONE                       = 0;
export const PUZZLE_FORTREE_CITY_GYM           = 1;
export const PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6 = 2;

/** 1:1 décomp `GATE_ROT(rotationDirection, arm, longArm)`
 *  (rotating_gate.c:15-16). Encode rotation info en u8 :
 *  bits 4-7 = rotationDirection (0/1/2 = NONE/ACW/CW)
 *  bits 1-3 = arm (0-7)
 *  bit 0    = longArm flag (0 ou 1) */
function GATE_ROT(rotationDirection: number, arm: number, longArm: number): number {
  return (((rotationDirection & 15) << 4) | ((arm & 7) << 1) | (longArm & 1)) & 0xFF;
}
function GATE_ROT_CW(arm: number, longArm: number): number {
  return GATE_ROT(ROTATE_CLOCKWISE, arm, longArm);
}
function GATE_ROT_ACW(arm: number, longArm: number): number {
  return GATE_ROT(ROTATE_ANTICLOCKWISE, arm, longArm);
}

// ─── Puzzle configs 1:1 décomp ────────────────────────────────────────────

interface RotatingGatePuzzle {
  x: number;
  y: number;
  shape: number;
  orientation: number;
}

/** 1:1 décomp `sRotatingGate_FortreePuzzleConfig` (rotating_gate.c:191-201). */
const sRotatingGate_FortreePuzzleConfig: RotatingGatePuzzle[] = [
  { x:  6, y:  7, shape: GATE_SHAPE_T2, orientation: GATE_ORIENTATION_90 },
  { x:  9, y: 15, shape: GATE_SHAPE_T2, orientation: GATE_ORIENTATION_180 },
  { x:  3, y: 19, shape: GATE_SHAPE_T2, orientation: GATE_ORIENTATION_90 },
  { x:  2, y:  6, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_90 },
  { x:  9, y: 12, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_0 },
  { x:  6, y: 23, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_0 },
  { x: 12, y: 22, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_0 },
  { x:  6, y:  3, shape: GATE_SHAPE_L4, orientation: GATE_ORIENTATION_180 },
];

/** 1:1 décomp `sRotatingGate_TrickHousePuzzleConfig` (rotating_gate.c:204-217). */
const sRotatingGate_TrickHousePuzzleConfig: RotatingGatePuzzle[] = [
  { x: 14, y:  5, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_90 },
  { x: 10, y:  6, shape: GATE_SHAPE_L2, orientation: GATE_ORIENTATION_180 },
  { x:  6, y:  6, shape: GATE_SHAPE_L4, orientation: GATE_ORIENTATION_90 },
  { x: 14, y:  8, shape: GATE_SHAPE_T1, orientation: GATE_ORIENTATION_90 },
  { x:  3, y: 10, shape: GATE_SHAPE_L3, orientation: GATE_ORIENTATION_270 },
  { x:  9, y: 14, shape: GATE_SHAPE_L1, orientation: GATE_ORIENTATION_90 },
  { x:  3, y: 15, shape: GATE_SHAPE_T3, orientation: GATE_ORIENTATION_0 },
  { x:  2, y: 17, shape: GATE_SHAPE_L2, orientation: GATE_ORIENTATION_180 },
  { x: 12, y: 18, shape: GATE_SHAPE_T3, orientation: GATE_ORIENTATION_270 },
  { x:  5, y: 18, shape: GATE_SHAPE_L4, orientation: GATE_ORIENTATION_90 },
  { x: 10, y: 19, shape: GATE_SHAPE_L3, orientation: GATE_ORIENTATION_180 },
];

// ─── Rotation info tables 1:1 décomp ──────────────────────────────────────

/** 1:1 décomp `sRotatingGate_RotationInfoNorth[4 * 4]` (rotating_gate.c:494-500). */
const sRotatingGate_RotationInfoNorth: number[] = [
  GATE_ROT_NONE,                  GATE_ROT_NONE,                  GATE_ROT_NONE,                   GATE_ROT_NONE,
  GATE_ROT_CW(GATE_ARM_WEST, 1),  GATE_ROT_CW(GATE_ARM_WEST, 0),  GATE_ROT_ACW(GATE_ARM_EAST, 0),  GATE_ROT_ACW(GATE_ARM_EAST, 1),
  GATE_ROT_NONE,                  GATE_ROT_NONE,                  GATE_ROT_NONE,                   GATE_ROT_NONE,
  GATE_ROT_NONE,                  GATE_ROT_NONE,                  GATE_ROT_NONE,                   GATE_ROT_NONE,
];

/** 1:1 décomp `sRotatingGate_RotationInfoSouth[4 * 4]` (rotating_gate.c:502-508). */
const sRotatingGate_RotationInfoSouth: number[] = [
  GATE_ROT_NONE,                   GATE_ROT_NONE,                   GATE_ROT_NONE,                  GATE_ROT_NONE,
  GATE_ROT_NONE,                   GATE_ROT_NONE,                   GATE_ROT_NONE,                  GATE_ROT_NONE,
  GATE_ROT_ACW(GATE_ARM_WEST, 1),  GATE_ROT_ACW(GATE_ARM_WEST, 0),  GATE_ROT_CW(GATE_ARM_EAST, 0),  GATE_ROT_CW(GATE_ARM_EAST, 1),
  GATE_ROT_NONE,                   GATE_ROT_NONE,                   GATE_ROT_NONE,                  GATE_ROT_NONE,
];

/** 1:1 décomp `sRotatingGate_RotationInfoWest[4 * 4]` (rotating_gate.c:510-516). */
const sRotatingGate_RotationInfoWest: number[] = [
  GATE_ROT_NONE,  GATE_ROT_ACW(GATE_ARM_NORTH, 1),  GATE_ROT_NONE,  GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_ACW(GATE_ARM_NORTH, 0),  GATE_ROT_NONE,  GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_CW(GATE_ARM_SOUTH, 0),   GATE_ROT_NONE,  GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_CW(GATE_ARM_SOUTH, 1),   GATE_ROT_NONE,  GATE_ROT_NONE,
];

/** 1:1 décomp `sRotatingGate_RotationInfoEast[4 * 4]` (rotating_gate.c:518-524). */
const sRotatingGate_RotationInfoEast: number[] = [
  GATE_ROT_NONE,  GATE_ROT_NONE,  GATE_ROT_CW(GATE_ARM_NORTH, 1),   GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_NONE,  GATE_ROT_CW(GATE_ARM_NORTH, 0),   GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_NONE,  GATE_ROT_ACW(GATE_ARM_SOUTH, 0),  GATE_ROT_NONE,
  GATE_ROT_NONE,  GATE_ROT_NONE,  GATE_ROT_ACW(GATE_ARM_SOUTH, 1),  GATE_ROT_NONE,
];

// ─── Arm position tables 1:1 décomp ───────────────────────────────────────

interface Coords8 {
  x: number;
  y: number;
}

/** 1:1 décomp `sRotatingGate_ArmPositionsClockwiseRotation[]` (rotating_gate.c:528-530). */
const sRotatingGate_ArmPositionsClockwiseRotation: Coords8[] = [
  { x:  0, y: -1 }, { x:  1, y: -2 }, { x:  0, y:  0 }, { x:  1, y:  0 },
  { x: -1, y:  0 }, { x: -1, y:  1 }, { x: -1, y: -1 }, { x: -2, y: -1 },
];

/** 1:1 décomp `sRotatingGate_ArmPositionsAntiClockwiseRotation[]` (rotating_gate.c:532-534). */
const sRotatingGate_ArmPositionsAntiClockwiseRotation: Coords8[] = [
  { x: -1, y: -1 }, { x: -1, y: -2 }, { x:  0, y: -1 }, { x:  1, y: -1 },
  { x:  0, y:  0 }, { x:  0, y:  1 }, { x: -1, y:  0 }, { x: -2, y:  0 },
];

/** 1:1 décomp `sRotatingGate_ArmLayout[][4 * 2]` (rotating_gate.c:538-619).
 *  12 shapes × 8 bytes (= 4 arms × {short, long} = 8 entries).
 *  Order : L1, L2, L3, L4, T1, T2, T3, T4, UNUSED_T1..T4. */
const sRotatingGate_ArmLayout: number[][] = [
  // L-shape gates (shapes 0-3)
  [ 1, 0,  1, 0,  0, 0,  0, 0 ],  // L1
  [ 1, 1,  1, 0,  0, 0,  0, 0 ],  // L2
  [ 1, 0,  1, 1,  0, 0,  0, 0 ],  // L3
  [ 1, 1,  1, 1,  0, 0,  0, 0 ],  // L4
  // T-shape gates (shapes 4-7)
  [ 1, 0,  1, 0,  1, 0,  0, 0 ],  // T1
  [ 1, 1,  1, 0,  1, 0,  0, 0 ],  // T2
  [ 1, 0,  1, 1,  1, 0,  0, 0 ],  // T3
  [ 1, 0,  1, 0,  1, 1,  0, 0 ],  // T4
  // Unused T-shape gates (shapes 8-11)
  [ 1, 1,  1, 1,  1, 0,  0, 0 ],
  [ 1, 1,  1, 0,  1, 1,  0, 0 ],
  [ 1, 0,  1, 1,  1, 1,  0, 0 ],
  [ 1, 1,  1, 1,  1, 1,  0, 0 ],
];

// ─── State (= 1:1 décomp static EWRAM_DATA) ───────────────────────────────

/** 1:1 décomp `static EWRAM_DATA u8 sRotatingGate_GateSpriteIds[ROTATING_GATE_PUZZLE_MAX]`
 *  (rotating_gate.c:621). Sprite IDs des gates ou MAX_SPRITES si pas créé.
 *  R4 dette : sprites Phaser non portés → tous restent MAX_SPRITES. */
const sRotatingGate_GateSpriteIds: number[] = new Array(ROTATING_GATE_PUZZLE_MAX).fill(MAX_SPRITES);

/** 1:1 décomp `static EWRAM_DATA const struct RotatingGatePuzzle *sRotatingGate_PuzzleConfig`
 *  (rotating_gate.c:622). Pointer vers le config courant. */
let sRotatingGate_PuzzleConfig: RotatingGatePuzzle[] | null = null;

/** 1:1 décomp `static EWRAM_DATA u8 sRotatingGate_PuzzleCount` (rotating_gate.c:623). */
let sRotatingGate_PuzzleCount = 0;

/** Notre impl : VAR_TEMP_0 byte array remplacé par buffer local 32 bytes.
 *  1:1 décomp utilise `GetVarPointer(VAR_TEMP_0)` qui retourne `u16 *` cast en
 *  `u8 *` pour byte-level access (= 16 vars × 2 bytes = 32 bytes). On stocke
 *  les orientations gate ici. STATIC_ASSERT garantit MAX_GATES <= 32.
 *  Reset au map enter via `RotatingGate_ResetAllGateOrientations`. */
const sGateOrientationsBuffer: Uint8Array = new Uint8Array(32);

// ─── 1:1 décomp public + static functions ─────────────────────────────────

/** 1:1 décomp `GetCurrentMapRotatingGatePuzzleType(void)` (rotating_gate.c:625-640).
 *  Check current map vs Fortree Gym / Trick House Puzzle 6 via gMapHeader.id.
 *  Returns PUZZLE_NONE pour démo maps (= early-return path). */
export function GetCurrentMapRotatingGatePuzzleType(): number {
  const mapId = gMapHeader?.id;
  if (mapId === 'FortreeCity_Gym') return PUZZLE_FORTREE_CITY_GYM;
  if (mapId === 'Route110_TrickHousePuzzle6') return PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6;
  return PUZZLE_NONE;
}

/** 1:1 décomp `RotatingGate_ResetAllGateOrientations(void)` (rotating_gate.c:642-649).
 *  Init le buffer VAR_TEMP_0 byte array avec les orientations initiales du
 *  puzzle config. */
function RotatingGate_ResetAllGateOrientations(): void {
  if (!sRotatingGate_PuzzleConfig) return;
  for (let i = 0; i < sRotatingGate_PuzzleCount; i++) {
    sGateOrientationsBuffer[i] = sRotatingGate_PuzzleConfig[i].orientation;
  }
}

/** 1:1 décomp `RotatingGate_GetGateOrientation(u8 gateId)` (rotating_gate.c:651-654). */
function RotatingGate_GetGateOrientation(gateId: number): number {
  return sGateOrientationsBuffer[gateId];
}

/** 1:1 décomp `RotatingGate_SetGateOrientation(u8 gateId, u8 orientation)` (rotating_gate.c:656-659). */
function RotatingGate_SetGateOrientation(gateId: number, orientation: number): void {
  sGateOrientationsBuffer[gateId] = orientation;
}

/** 1:1 décomp `RotatingGate_RotateInDirection(u8 gateId, u32 rotationDirection)`
 *  (rotating_gate.c:661-678). Increment/decrement orientation modulo
 *  GATE_ORIENTATION_MAX = 4. */
function RotatingGate_RotateInDirection(gateId: number, rotationDirection: number): void {
  let orientation = RotatingGate_GetGateOrientation(gateId);
  if (rotationDirection === ROTATE_ANTICLOCKWISE) {
    if (orientation) orientation--;
    else orientation = GATE_ORIENTATION_270;
  } else {
    orientation++;
    orientation = orientation % GATE_ORIENTATION_MAX;
  }
  RotatingGate_SetGateOrientation(gateId, orientation);
}

/** 1:1 décomp `RotatingGate_LoadPuzzleConfig(void)` (rotating_gate.c:680-702).
 *  Set sRotatingGate_PuzzleConfig + sRotatingGate_PuzzleCount selon puzzle type
 *  + reset gateSpriteIds à MAX_SPRITES. */
function RotatingGate_LoadPuzzleConfig(): void {
  const puzzleType = GetCurrentMapRotatingGatePuzzleType();
  switch (puzzleType) {
    case PUZZLE_FORTREE_CITY_GYM:
      sRotatingGate_PuzzleConfig = sRotatingGate_FortreePuzzleConfig;
      sRotatingGate_PuzzleCount = sRotatingGate_FortreePuzzleConfig.length;
      break;
    case PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6:
      sRotatingGate_PuzzleConfig = sRotatingGate_TrickHousePuzzleConfig;
      sRotatingGate_PuzzleCount = sRotatingGate_TrickHousePuzzleConfig.length;
      break;
    case PUZZLE_NONE:
    default:
      return;
  }
  for (let i = 0; i < ROTATING_GATE_PUZZLE_MAX - 1; i++) {
    sRotatingGate_GateSpriteIds[i] = MAX_SPRITES;
  }
}

/** 1:1 décomp `RotatingGate_CanRotate(u8 gateId, s32 rotationDirection)`
 *  (rotating_gate.c:850-893). Vérifie qu'aucun arm du gate ne collide avec
 *  une tile impassable map après rotation. BUGFIX décomp pris (= collision
 *  range 0-3, any value != 0 is impassable). */
function RotatingGate_CanRotate(gateId: number, rotationDirection: number): boolean {
  if (!sRotatingGate_PuzzleConfig) return false;
  let armPos: Coords8[];
  if (rotationDirection === ROTATE_ANTICLOCKWISE)
    armPos = sRotatingGate_ArmPositionsAntiClockwiseRotation;
  else if (rotationDirection === ROTATE_CLOCKWISE)
    armPos = sRotatingGate_ArmPositionsClockwiseRotation;
  else return false;

  const orientation = RotatingGate_GetGateOrientation(gateId);
  const shape = sRotatingGate_PuzzleConfig[gateId].shape;
  const x = sRotatingGate_PuzzleConfig[gateId].x + MAP_OFFSET;
  const y = sRotatingGate_PuzzleConfig[gateId].y + MAP_OFFSET;

  // Loop through the gate's "arms" clockwise (north, south, east, west).
  for (let i = GATE_ARM_NORTH; i <= GATE_ARM_WEST; i++) {
    for (let j = 0; j < GATE_ARM_MAX_LENGTH; j++) {
      const armIndex = 2 * ((orientation + i) % 4) + j;
      if (sRotatingGate_ArmLayout[shape][2 * i + j]) {
        // BUGFIX décomp : any non-zero collision = impassable.
        if (MapGridGetCollisionAt(x + armPos[armIndex].x, y + armPos[armIndex].y) !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/** 1:1 décomp `RotatingGate_HasArm(u8 gateId, u8 armInfo)` (rotating_gate.c:895-903).
 *  Decode armInfo (= arm number + longArm flag) et check si le gate a un arm
 *  à cette position selon son shape + orientation. */
function RotatingGate_HasArm(gateId: number, armInfo: number): number {
  if (!sRotatingGate_PuzzleConfig) return 0;
  const arm = (armInfo / 2) | 0;
  const isLongArm = armInfo % 2;
  const armOrientation = ((arm - RotatingGate_GetGateOrientation(gateId) + 4) % 4);
  const shape = sRotatingGate_PuzzleConfig[gateId].shape;
  return sRotatingGate_ArmLayout[shape][armOrientation * 2 + isLongArm];
}

/** 1:1 décomp `RotatingGate_TriggerRotationAnimation(u8 gateId, s32 rotationDirection)`
 *  (rotating_gate.c:905-913). Trigger l'anim du gate sprite via setting
 *  sprite.data[1/2]. R4 dette : sprites non portés → fonction no-op si pas
 *  de sprite (= MAX_SPRITES sentinel). */
function RotatingGate_TriggerRotationAnimation(gateId: number, rotationDirection: number): void {
  if (sRotatingGate_GateSpriteIds[gateId] !== MAX_SPRITES) {
    // R4 dette : sprite data[1/2] update non porté (= Phaser sprites pas créés).
    void rotationDirection;
  }
}

/** 1:1 décomp `RotatingGate_GetRotationInfo(u8 direction, s16 x, s16 y)`
 *  (rotating_gate.c:915-931). Lookup la table direction-specific selon
 *  position (x, y) dans une grid 4x4 centrée sur le gate. Returns
 *  rotation info encoded ou GATE_ROT_NONE si pas de rotation. */
function RotatingGate_GetRotationInfo(direction: number, x: number, y: number): number {
  let ptr: number[];
  if (direction === DIR_NORTH) ptr = sRotatingGate_RotationInfoNorth;
  else if (direction === DIR_SOUTH) ptr = sRotatingGate_RotationInfoSouth;
  else if (direction === DIR_WEST) ptr = sRotatingGate_RotationInfoWest;
  else if (direction === DIR_EAST) ptr = sRotatingGate_RotationInfoEast;
  else return GATE_ROT_NONE;
  return ptr[y * 4 + x];
}

/** 1:1 décomp `RotatingGate_InitPuzzle(void)` (rotating_gate.c:933-940).
 *  Call au map enter (= ResumeMap / LoadMapInStepsLocal). Init config +
 *  reset orientations si current map a un rotating gate puzzle. */
export function RotatingGate_InitPuzzle(): void {
  if (GetCurrentMapRotatingGatePuzzleType()) {
    RotatingGate_LoadPuzzleConfig();
    RotatingGate_ResetAllGateOrientations();
  }
}

/** 1:1 décomp `RotatingGatePuzzleCameraUpdate(s16 deltaX, s16 deltaY)`
 *  (rotating_gate.c:942-949). Call à chaque camera update pour create/destroy
 *  gates entrant/sortant du viewport. R4 dette : sprites Phaser non portés
 *  → no-op. */
export function RotatingGatePuzzleCameraUpdate(_deltaX: number, _deltaY: number): void {
  if (GetCurrentMapRotatingGatePuzzleType()) {
    // R4 dette : RotatingGate_CreateGatesWithinViewport +
    // RotatingGate_DestroyGatesOutsideViewport non portés (= sprites Phaser).
  }
}

/** 1:1 décomp `RotatingGate_InitPuzzleAndGraphics(void)` (rotating_gate.c:951-959).
 *  Call à load map graphics. Init config + load sprites. R4 dette : sprites
 *  non portés → load config seulement. */
export function RotatingGate_InitPuzzleAndGraphics(): void {
  if (GetCurrentMapRotatingGatePuzzleType()) {
    // R4 dette : LoadRotatingGatePics + RotatingGate_CreateGatesWithinViewport(0, 0)
    // non portés (= sprites Phaser).
    RotatingGate_LoadPuzzleConfig();
  }
}

/** 1:1 décomp `CheckForRotatingGatePuzzleCollision(u8 direction, s16 x, s16 y)`
 *  (rotating_gate.c:961-997). Full check : si player tente walker dans
 *  direction depuis (x, y), et un gate est à proximité, soit rotate le gate
 *  (= return FALSE = no collision) soit return TRUE = blocked.
 *
 *  x, y = INTERNAL coords (= +MAP_OFFSET déjà). */
export function CheckForRotatingGatePuzzleCollision(
  direction: number, x: number, y: number,
): boolean {
  if (!GetCurrentMapRotatingGatePuzzleType()) return false;
  if (!sRotatingGate_PuzzleConfig) return false;
  for (let i = 0; i < sRotatingGate_PuzzleCount; i++) {
    const gateX = sRotatingGate_PuzzleConfig[i].x + MAP_OFFSET;
    const gateY = sRotatingGate_PuzzleConfig[i].y + MAP_OFFSET;
    if (gateX - 2 <= x && x <= gateX + 1 && gateY - 2 <= y && y <= gateY + 1) {
      const centerX = x - gateX + 2;
      const centerY = y - gateY + 2;
      const rotationInfo = RotatingGate_GetRotationInfo(direction, centerX, centerY);
      if (rotationInfo !== GATE_ROT_NONE) {
        const rotationDirection = (rotationInfo & 0xF0) >> 4;
        const armInfo = rotationInfo & 0xF;
        if (RotatingGate_HasArm(i, armInfo)) {
          if (RotatingGate_CanRotate(i, rotationDirection)) {
            RotatingGate_TriggerRotationAnimation(i, rotationDirection);
            RotatingGate_RotateInDirection(i, rotationDirection);
            return false;
          }
          return true;
        }
      }
    }
  }
  return false;
}

/** 1:1 décomp `CheckForRotatingGatePuzzleCollisionWithoutAnimation(u8 direction, s16 x, s16 y)`
 *  (rotating_gate.c:999-1035). Variant "static" : pas d'anim trigger ni
 *  d'orientation update. Used par trainer line-of-sight. */
export function CheckForRotatingGatePuzzleCollisionWithoutAnimation(
  direction: number, x: number, y: number,
): boolean {
  if (!GetCurrentMapRotatingGatePuzzleType()) return false;
  if (!sRotatingGate_PuzzleConfig) return false;
  for (let i = 0; i < sRotatingGate_PuzzleCount; i++) {
    const gateX = sRotatingGate_PuzzleConfig[i].x + MAP_OFFSET;
    const gateY = sRotatingGate_PuzzleConfig[i].y + MAP_OFFSET;
    if (gateX - 2 <= x && x <= gateX + 1 && gateY - 2 <= y && y <= gateY + 1) {
      const centerX = x - gateX + 2;
      const centerY = y - gateY + 2;
      const rotationInfo = RotatingGate_GetRotationInfo(direction, centerX, centerY);
      if (rotationInfo !== GATE_ROT_NONE) {
        const armInfo = rotationInfo & 0xF;
        const rotationDirection = (rotationInfo & 0xF0) >> 4;
        if (RotatingGate_HasArm(i, armInfo)) {
          if (!RotatingGate_CanRotate(i, rotationDirection)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// ─── R4 dette explicite (= sprites Phaser non portés) ──────────────────────
// LoadRotatingGatePics — load sprite tiles tags 0x1300+shape.
// RotatingGate_CreateGate — create sprite for gate at viewport position.
// RotatingGate_CreateGatesWithinViewport — iterate puzzle + create visible gates.
// RotatingGate_DestroyGatesOutsideViewport — destroy gates outside viewport.
// SpriteCallback_RotatingGate — per-frame sprite animation/visibility update.
// RotatingGate_HideGatesOutsideViewport — sprite visible/invisible toggle.
//
// À porter quand Fortree Gym / Trick House Puzzle 6 ajoutés à la démo. Le port
// requiert : Phaser sprite create/destroy + affine anim tables (= 20 anims),
// tile loading (4bpp), MapCoordsFromSpritePos. Pas trivial mais isolé : la
// LOGIQUE collision/rotation/orientation est 100% portée ci-dessus, fonctionne
// sans sprites visuels.

// ROTATE_NONE used implicitly by GATE_ROT_NONE encoding (= rotationDirection=0).
void ROTATE_NONE;

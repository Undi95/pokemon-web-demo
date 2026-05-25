/**
 * player-avatar.ts — moteur du player avatar overworld 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_player_avatar.c` (= state
 *     machine PlayerStep + MovePlayerNotOnBike + PlayerWalkNormal etc.)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (= struct
 *     PlayerAvatar fields + enums NOT_MOVING/TURN_DIRECTION/MOVING)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c` (= step
 *     timings, sprite anim cycles)
 *
 * Phase 4.3 MVP — simplifications :
 *   - Pas de bike (= MovePlayerOnBike skip)
 *   - Pas de surf / underwater
 *   - Pas de forced movement (= escalators, ice, etc.)
 *   - Pas de ledge jumping
 *   - Pas de running (= no B button speed boost) — Phase 4.3+ ajoutera
 *   - Pas d'object event collision (= NPCs, Phase 4.4)
 *
 * Implémenté :
 *   - Walk normal (= 16 frames per metatile à speed 1 = 1:1 ROM walk speed)
 *   - 4 directions (down/up/left/right) + face/turn/walk states
 *   - Collision via MapGridGetCollisionAt (= map block collision bits)
 *   - Camera follow (= gFieldCamera.movementSpeedX/Y set during walk)
 *   - Sprite anim cycle (= 3 frames par direction, alternate walk1/walk2)
 *
 * Sprite layout :
 *   - walking.png 144×32 = 18×4 tiles (= 9 frames × 8 tiles each en 16×32 OBJ)
 *   - 9 frames PNG :
 *     0=face_down, 1=walk_down1, 2=walk_down2,
 *     3=face_up, 4=walk_up1, 5=walk_up2,
 *     6=face_right, 7=walk_right1, 8=walk_right2 (= mirror H pour left)
 *   - Loaded en OBJ 1D map mode (= 8 tiles sequential per frame)
 */
import type { DecompRuntime } from './decomp-runtime';
import { loadIndexedPngStrict, extractPngPlte } from './gba/png-loader';
import {
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  MapGridGetElevationAt,
  MAP_OFFSET,
} from './map-loader';
import { MB_TALL_GRASS } from './tilemap-loader';
import { SpawnTallGrassEffect } from './field/field-effect-grass';
import { SpawnJumpLandingDust } from './field/field-effect-jump-dust';
import { CreateShadowSprite, DestroyShadowSprite } from './field/field-effect-shadow';
import {
  InitPlayerObjectEvent, PLAYER_OBJECT_EVENT_SLOT, SyncPlayerObjectEvent, gObjectEvents,
  ObjectEventUpdateMetatileBehaviors,
  GetCollisionAtCoords as _GetCollisionAtCoords,
  GetObjectEventIdByXY,
  GetObjectEventIdByPosition,
  SetObjectEventDirection,
  OBJECT_EVENTS_COUNT,
  ELEVATION_DEFAULT,
} from './object-events';
import {
  gFieldCamera,
  SetCameraTopLeftCoords,
  GetCameraTopLeftCoords,
  GetCameraPanX,
  GetCameraPanY,
} from './field/field-camera';
import {
  ArePlayerFieldControlsLocked,
  TryRunCoordEventScript,
  LockPlayerFieldControls,
} from './script-runtime';
import { FlagGet } from './script-vars';
import { B_BUTTON } from './gba-menu-system';
import { IsRunningDisallowed } from './metatile-behavior-helpers';
import {
  MetatileBehavior_IsBumpySlope,
  MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsIsolatedHorizontalRail,
  MetatileBehavior_IsVerticalRail,
  MetatileBehavior_IsHorizontalRail,
  MetatileBehavior_IsNonAnimDoor,
} from './metatile-behavior';
import {
  CheckForRotatingGatePuzzleCollision,
  CheckForRotatingGatePuzzleCollisionWithoutAnimation,
} from './rotating-gate';
import { PlaySE } from './decomp-globals';
import {
  LoadSpriteSheet, LoadSpritePalette,
  setReservedSpriteTileCount,
  setReservedSpritePaletteCount as setReservedSpritePaletteCount_helper,
} from './sprite';
import { SE_WALL_HIT, SE_LEDGE } from './decomp-data/include/constants/songs-data';
import {
  getWarpAtPlayerPos,
  findWarpEventAt,
  setPendingWarp,
  getWarpKindFor,
  isArrowWarpMetatileBehavior,
} from './warp-system';
import {
  DIR_NONE as _DIR_NONE,
  DIR_SOUTH as _DIR_SOUTH,
  DIR_NORTH as _DIR_NORTH,
  DIR_WEST as _DIR_WEST,
  DIR_EAST as _DIR_EAST,
  DIR_TO_DX,
  DIR_TO_DY,
  MoveCoords,
  dirToCameraSpeed as _dirToCameraSpeed,
  getInputDirection as _getInputDirection,
} from './direction-coords';
import {
  IsMetatileDirectionallyImpassable,
  ShouldJumpLedge,
} from './metatile-behavior-helpers';
// 1:1 décomp `include/constants/game_stat.h` enum values.
import { GAME_STAT_JUMPED_DOWN_LEDGES } from './decomp-data/include/constants/game_stat-data';
import { OBJ_EVENT_GFX_PUSHABLE_BOULDER } from './decomp-data/include/constants/event_objects-data';
import { NUM_ACRO_BIKE_COLLISIONS } from './decomp-data/src/field_player_avatar-data';
// 1:1 décomp `gSaveBlock1/2Ptr` (= pointers EWRAM, global.h:990). Source unique
// dans le module Foundation `save-block-state.ts` (= permet l'import direct
// depuis player-avatar sans tirer la chaîne lourde de gba-menu-system).
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save-block-state';
// 1:1 décomp `field_control_avatar.c` interaction chain. ESM cycle safe :
// field-control-avatar importe player-avatar (gPlayerAvatar/GetXY...) au top-level,
// nous l'importons ici aussi mais ses fonctions sont appelées uniquement DANS
// les bodies (= au runtime A button frame), donc tous les modules sont init avant l'usage.
import {
  TryStartInteractionScript,
  GetInFrontOfPlayerPosition,
  type MapPosition,
} from './field/field-control-avatar';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** Direction enum re-exporté depuis direction-coords (= source unique).
 *  Maintenu ici pour back-compat avec les call-sites existants. */
export const DIR_NONE  = _DIR_NONE;
export const DIR_SOUTH = _DIR_SOUTH;
export const DIR_NORTH = _DIR_NORTH;
export const DIR_WEST  = _DIR_WEST;
export const DIR_EAST  = _DIR_EAST;

/** 1:1 décomp `enum running states` (global.fieldmap.h:328-331). */
export const NOT_MOVING     = 0;
export const TURN_DIRECTION = 1;
export const MOVING         = 2;

/** 1:1 décomp `enum tile transition states` (global.fieldmap.h:336-340). */
export const T_NOT_MOVING      = 0;
export const T_TILE_TRANSITION = 1;
export const T_TILE_CENTER     = 2;

/** 1:1 décomp `MOVE_SPEED_NORMAL` = 16 frames per tile = walk speed.
 *  Notre engine : speed 1 px/frame = 16 frames per metatile (= 16 px). */
const WALK_SPEED_PX_PER_FRAME = 1;

/** Sprite anim frames 1:1 décomp `object_event_anims.h` :
 *
 *  sAnim_FaceSouth: FRAME(0, 16)   // face = 0
 *  sAnim_FaceNorth: FRAME(1, 16)   // face = 1
 *  sAnim_FaceWest:  FRAME(2, 16)   // face = 2
 *  sAnim_FaceEast:  FRAME(2, 16, hFlip)  // face = 2 + flip
 *
 *  sAnim_GoSouth: FRAME(3,8) → FRAME(0,8) → FRAME(4,8) → FRAME(0,8)
 *  sAnim_GoNorth: FRAME(5,8) → FRAME(1,8) → FRAME(6,8) → FRAME(1,8)
 *  sAnim_GoWest:  FRAME(7,8) → FRAME(2,8) → FRAME(8,8) → FRAME(2,8)
 *  sAnim_GoEast:  pareil avec hFlip
 *
 *  PNG layout 9 frames :
 *    0=face_S, 1=face_N, 2=face_W,
 *    3=walk_S_a, 4=walk_S_b, 5=walk_N_a, 6=walk_N_b, 7=walk_W_a, 8=walk_W_b
 *
 *  Cycle walk : walk_a → face → walk_b → face (= NOT face first!).
 *  Pour 16-frame step : walk (8 frames) → face (8 frames). */
const SPRITE_FRAMES = {
  [DIR_SOUTH]: { face: 0, walk1: 3, walk2: 4, hFlip: false },
  [DIR_NORTH]: { face: 1, walk1: 5, walk2: 6, hFlip: false },
  [DIR_WEST]:  { face: 2, walk1: 7, walk2: 8, hFlip: false },
  [DIR_EAST]:  { face: 2, walk1: 7, walk2: 8, hFlip: true },  // mirror west
} as const;

// ─── Player Avatar struct (= simplified gPlayerAvatar) ──────────────────────

interface PlayerAvatar {
  /** 1:1 décomp `gPlayerAvatar.flags` (= PLAYER_AVATAR_FLAG_* bitmask).
   *  Bit 0 = ON_FOOT, bit 1 = MACH_BIKE, bit 2 = ACRO_BIKE, bit 3 = SURFING,
   *  bit 4 = UNDERWATER, bit 5 = CONTROLLABLE, bit 6 = FORCED_MOVE, bit 7 = DASH. */
  flags: number;
  /** 1:1 décomp `gPlayerAvatar.transitionFlags`. Used pendant les transitions
   *  entre states (= e.g. surfing → walking transition). */
  transitionFlags: number;
  /** 1:1 décomp `gPlayerAvatar.objectEventId`. Index dans gObjectEvents[] du
   *  player ObjectEvent. Set au `InitPlayerAvatar` via `SpawnSpecialObjectEvent`
   *  retour. Permet à HideShowWarpArrow + ground effects + autres code décomp
   *  de read `gObjectEvents[gPlayerAvatar.objectEventId].currentMetatileBehavior`
   *  etc. */
  objectEventId: number;
  /** 1:1 décomp `gPlayerAvatar.preventStep`. TRUE = block keypad input dans
   *  PlayerStep (= used pendant scripted movements + warp transitions). */
  preventStep: boolean;
  /** 1:1 décomp gPlayerAvatar.runningState (NOT_MOVING / TURN_DIRECTION / MOVING). */
  runningState: number;
  /** 1:1 décomp gPlayerAvatar.tileTransitionState. */
  tileTransitionState: number;
  /** Frames remaining in current step (= 0..15 décrémente). 0 = pas de step actif. */
  stepFramesLeft: number;
  /** Direction de la step en cours (utilisé pour cleanup). */
  stepDirection: number;
  /** Frames remaining in current turn-in-place (= 8..0 décrémente). 1:1 décomp
   *  `PlayerTurnInPlace` (= TURN_DIRECTION lasts 8 frames). Évite wiggle rapide. */
  turnFramesLeft: number;
  /** 1:1 décomp `PlayerNotOnBikeCollide` → `WalkInPlaceSlow` (= 32 frames cycle).
   *  Anim ralentie (sprite alterne walk_a/walk_b sur 32 frames au lieu de 16) +
   *  pas de movement physique. SE_WALL_HIT joué à chaque cycle complet tant que
   *  user tient direction vers wall. 0 = pas de collision en cours. */
  collideFramesLeft: number;
  /** 1:1 décomp `ObjectEventSetHeldMovement(MOVEMENT_ACTION_WALK_NORMAL_*)`
   *  utilisé par Task_DoDoorWarp + Task_ExitDoor + Task_ExitNonAnimDoor pour
   *  forcer le player à walk dans une direction sans input keypad.
   *
   *  Workflow : la scene set forceMovement = DIR_X avant le warp/exit task.
   *  PlayerStep (block lock controls) start un step dans cette dir. Step done
   *  → forceMovement reset à DIR_NONE. La scene attend forceMovement === DIR_NONE
   *  pour passer au step suivant.
   *
   *  DIR_NONE (0) = pas de force. DIR_SOUTH/NORTH/etc. = force dans cette dir. */
  forceMovement: number;
  /** 1:1 décomp `ObjectEvent.currentElevation` (= bits 12-15 du map block).
   *  Utilisé par `IsElevationMismatchAt` pour empêcher player de traverser
   *  d'une elevation à l'autre (= ponts). Set au map load via metatile bits
   *  + au step end via target tile elevation. */
  currentElevation: number;
  /** Sprite ID dans rt.gSprites. */
  spriteId: number;
  /** Walk anim : alternate walk1/walk2 sur step suivant. */
  walkAnimAlt: 0 | 1;
  /** Player gender ('MALE' = Brendan, 'FEMALE' = May). */
  gender: 'MALE' | 'FEMALE';
  /** 1:1 décomp `PLAYER_AVATAR_FLAG_DASH`. Set quand player run via B held +
   *  FLAG_SYS_B_DASH set + IsRunningDisallowed=false (= field_player_avatar.c:641-647).
   *  Utilisé par updateSpriteFrame (= dash anim) + step duration (= 8 frames au
   *  lieu de 16) + movementSpeed (= 2× normal). */
  dashing: boolean;
  /** 1:1 décomp ledge jump anim (= MovementAction_Jump2_*). Frames count down
   *  de 32 → 0 (= JUMP_DISTANCE_FAR durée 32 frames). Pendant ce step, sprite
   *  y2 offset suit la courbe sJumpY_High[i/2] pour effet visuel d'arc. */
  jumpFramesLeft: number;
  /** 1:1 décomp `gPlayerAvatar.acroBikeState`. 0=normal, 1=turning, 2=standing
   *  wheelie, 3=hopping wheelie. */
  acroBikeState: number;
  /** 1:1 décomp `gPlayerAvatar.newDirBackup`. Bike movement direction backup. */
  newDirBackup: number;
  /** 1:1 décomp `gPlayerAvatar.bikeFrameCounter`. */
  bikeFrameCounter: number;
  /** 1:1 décomp `gPlayerAvatar.bikeSpeed`. */
  bikeSpeed: number;
  /** 1:1 décomp `gPlayerAvatar.directionHistory`. Acro bike up/down/left/right
   *  history stored in each nibble of u32. */
  directionHistory: number;
  /** 1:1 décomp `gPlayerAvatar.abStartSelectHistory`. Same but pour A+B+Start+Select. */
  abStartSelectHistory: number;
  /** 1:1 décomp `gPlayerAvatar.dirTimerHistory[8]`. Acro bike timer history.
   *  Index 0 = active timer. Chaque update backup [N] → [N+1]. */
  dirTimerHistory: number[];
  /** 1:1 décomp `gPlayerAvatar.abStartSelectTimerHistory[8]`. */
  abStartSelectTimerHistory: number[];
}

/** 1:1 décomp `EWRAM_DATA struct PlayerAvatar gPlayerAvatar` (global.fieldmap.h:374).
 *
 *  ATTENTION 1:1 STRICT — `struct PlayerAvatar` décomp NE CONTIENT PAS `x/y`
 *  (cf. global.fieldmap.h:342-362). La position du joueur dans le décomp est
 *  stockée dans `gSaveBlock1Ptr->pos` (= Coords16, global.h:992) — source
 *  unique partagée avec `_camPos` (= field-camera.ts).
 *
 *  Pour préserver les call-sites TS existants (`gSaveBlock1Ptr.pos.x = ...`), `x` et
 *  `y` sont implémentés en getter/setter qui délèguent à `gSaveBlock1Ptr.pos`.
 *  Élimine le désync historique `cam.x ≠ player.x` user-flag 2026-05-22.
 *
 *  IMPORTANT : ne JAMAIS réassigner `gSaveBlock1Ptr.pos = {...}` ailleurs, sinon
 *  l'alias `_camPos` (field-camera) devient stale. Seulement muter `.x` / `.y`. */
const _gPlayerAvatarBase = {
  flags: 0x21,  // 1:1 décomp PLAYER_AVATAR_FLAG_ON_FOOT (1<<0) | _CONTROLLABLE (1<<5)
  transitionFlags: 0,
  objectEventId: 0,  // 1:1 décomp : set au InitPlayerAvatar via SpawnSpecialObjectEvent retour
  preventStep: false,
  runningState: NOT_MOVING,
  tileTransitionState: T_NOT_MOVING,
  stepFramesLeft: 0,
  stepDirection: DIR_NONE,
  turnFramesLeft: 0,
  collideFramesLeft: 0,
  forceMovement: DIR_NONE,
  currentElevation: 3,  // = elevation neutre (1:1 décomp default)
  spriteId: -1,
  walkAnimAlt: 0,
  gender: 'MALE' as 'MALE' | 'FEMALE',
  dashing: false,
  jumpFramesLeft: 0,
  acroBikeState: 0,
  newDirBackup: 0,
  bikeFrameCounter: 0,
  bikeSpeed: 0,
  directionHistory: 0,
  abStartSelectHistory: 0,
  dirTimerHistory: [0, 0, 0, 0, 0, 0, 0, 0],
  abStartSelectTimerHistory: [0, 0, 0, 0, 0, 0, 0, 0],
} as PlayerAvatar;

export const gPlayerAvatar: PlayerAvatar = _gPlayerAvatarBase;

/** 1:1 STRICT décomp `ClearPlayerAvatarInfo(void)` (field_player_avatar.c:1320-1323) :
 *    memset(&gPlayerAvatar, 0, sizeof(struct PlayerAvatar));
 *
 *  Reset COMPLET gPlayerAvatar fields. Appelé par SpawnObjectEventsOnReturnToField
 *  AVANT de re-spawn les NPCs (= 1:1 décomp event_object_movement.c:1719).
 *  Le décomp réinit gPlayerAvatar.objectEventId/spriteId via
 *  SetPlayerAvatarObjectEventIdAndObjectId dans SpawnObjectEventOnReturnToField
 *  juste après.
 *
 *  Notre archi : le player ObjectEvent slot 0 est préservé (= InitPlayerAvatar
 *  délégué à l'appel ReturnToField scene). Donc nous appelons ClearPlayerAvatarInfo
 *  mais SKIP les fields critiques (objectEventId, spriteId) pour ne pas casser
 *  notre flow scene Phaser. */
export function ClearPlayerAvatarInfo(): void {
  // 1:1 décomp memset 0 — preserve les fields critiques notre archi.
  const savedObjectEventId = gPlayerAvatar.objectEventId;
  const savedSpriteId = gPlayerAvatar.spriteId;
  gPlayerAvatar.flags = 0;
  gPlayerAvatar.transitionFlags = 0;
  gPlayerAvatar.preventStep = false;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
  gPlayerAvatar.stepDirection = DIR_NONE;
  gPlayerAvatar.turnFramesLeft = 0;
  gPlayerAvatar.collideFramesLeft = 0;
  gPlayerAvatar.forceMovement = DIR_NONE;
  gPlayerAvatar.currentElevation = 3;
  gPlayerAvatar.walkAnimAlt = 0;
  gPlayerAvatar.dashing = false;
  gPlayerAvatar.jumpFramesLeft = 0;
  gPlayerAvatar.acroBikeState = 0;
  gPlayerAvatar.newDirBackup = 0;
  gPlayerAvatar.bikeFrameCounter = 0;
  gPlayerAvatar.bikeSpeed = 0;
  gPlayerAvatar.directionHistory = 0;
  gPlayerAvatar.abStartSelectHistory = 0;
  gPlayerAvatar.dirTimerHistory = [0, 0, 0, 0, 0, 0, 0, 0];
  gPlayerAvatar.abStartSelectTimerHistory = [0, 0, 0, 0, 0, 0, 0, 0];
  // Preserve objectEventId/spriteId (= notre archi délègue re-init à InitPlayerAvatar).
  gPlayerAvatar.objectEventId = savedObjectEventId;
  gPlayerAvatar.spriteId = savedSpriteId;
}

// ─── 1:1 décomp helpers `field_player_avatar.c` ─────────────────────────────

/** 1:1 décomp `GetPlayerFacingDirection` (field_player_avatar.c:1165-1168) :
 *    return gObjectEvents[gPlayerAvatar.objectEventId].facingDirection;
 *
 *  Notre impl : lit depuis `gObjectEvents[playerSlot].facingDirection` qui est
 *  synced via `SyncPlayerObjectEvent` ou via le step start. Si player objectEvent
 *  pas encore init (= boot early), fallback DIR_SOUTH (= safety, le décomp ferait
 *  UB undefined behavior si objectEventId pointe slot inactif). */
export function GetPlayerFacingDirection(): number {
  const slot = gPlayerAvatar.objectEventId;
  const obj = gObjectEvents[slot];
  if (obj && obj.active && obj.isPlayer) return obj.facingDirection;
  return DIR_SOUTH;
}

/** 1:1 décomp `GetPlayerMovementDirection` (field_player_avatar.c:1170-1173) :
 *    return gObjectEvents[gPlayerAvatar.objectEventId].movementDirection;
 *
 *  Différent de `GetPlayerFacingDirection` : movementDirection = direction de
 *  la dernière action de mouvement (= peut différer de facing si facing locked). */
export function GetPlayerMovementDirection(): number {
  const slot = gPlayerAvatar.objectEventId;
  const obj = gObjectEvents[slot];
  if (obj && obj.active && obj.isPlayer) return obj.movementDirection;
  return DIR_SOUTH;
}

/** 1:1 décomp `PlayerGetElevation` (field_player_avatar.c:1175-1178).
 *
 *  Body décomp : `return gObjectEvents[gPlayerAvatar.objectEventId].previousElevation;`
 *
 *  Returns PREVIOUS elevation (= avant le step en cours). Used par
 *  `GetInFrontOfPlayerPosition` pour décider si tile devant a même elevation. */
export function PlayerGetElevation(): number {
  const slot = gPlayerAvatar.objectEventId;
  const obj = gObjectEvents[slot];
  if (obj && obj.active && obj.isPlayer) return obj.previousElevation;
  return gPlayerAvatar.currentElevation;
}

/** 1:1 décomp `PlayerGetDestCoords` (field_player_avatar.c:1124-1128).
 *
 *  Body décomp :
 *  ```c
 *  *x = gObjectEvents[gPlayerAvatar.objectEventId].currentCoords.x;
 *  *y = gObjectEvents[gPlayerAvatar.objectEventId].currentCoords.y;
 *  ```
 *
 *  Returns INTERNAL coords (= +MAP_OFFSET dans décomp). Post R3 refactor :
 *  notre `currentCoordsX/Y` aussi en INTERNAL → 1:1 strict path identique. */
export function PlayerGetDestCoords(): { x: number; y: number } {
  const slot = gPlayerAvatar.objectEventId;
  const obj = gObjectEvents[slot];
  if (obj && obj.active && obj.isPlayer) {
    return { x: obj.currentCoordsX, y: obj.currentCoordsY };
  }
  // Fallback : pa.x/y LOGICAL → convertir INTERNAL.
  return { x: gSaveBlock1Ptr.pos.x + MAP_OFFSET, y: gSaveBlock1Ptr.pos.y + MAP_OFFSET };
}

/** 1:1 décomp `GetXYCoordsOneStepInFrontOfPlayer` (field_player_avatar.c:1117-1122) :
 *    *x = gObjectEvents[gPlayerAvatar.objectEventId].currentCoords.x;
 *    *y = gObjectEvents[gPlayerAvatar.objectEventId].currentCoords.y;
 *    MoveCoords(GetPlayerFacingDirection(), x, y);
 *
 *  Returns position 1 tile devant le player (= dans la direction de son facing).
 *  Used par `GetInFrontOfPlayerPosition` + `TryStartInteractionScript` pour
 *  l'A-button interact target. */
export function GetXYCoordsOneStepInFrontOfPlayer(): { x: number; y: number } {
  const pos = PlayerGetDestCoords();
  return MoveCoords(GetPlayerFacingDirection(), pos.x, pos.y);
}

// ─── OBJ VRAM allocation (= player sprite occupe les 1ères tiles) ──────────

/** Player sprite occupe OBJ tiles 0..143 (= 18 frames × 8 tiles).
 *  1:1 décomp `sPicTable_BrendanNormal[18]` (object_event_pic_tables.h:1) :
 *    indices 0..8 = `gObjectEventPic_BrendanNormal` (= walking.png frames)
 *    indices 9..17 = `gObjectEventPic_BrendanRunning` (= running.png frames)
 *  Walking + running concatenés permet à updateSpriteFrame d'utiliser
 *  `frameIdx + (dashing ? 9 : 0)` comme offset = 1:1 sAnim_GoSouth vs sAnim_RunSouth
 *  pointent vers le même SpriteFrameImage table.
 *
 *  Décomp utilise dynamic spriteImageAlloc (= 8 tiles VRAM avec frame swap
 *  per-frame). Notre impl preload les 18 frames en VRAM (= 144 tiles) au boot
 *  pour éviter la complexité du dynamic alloc. Functionally identique. */
const PLAYER_OBJ_TILE_START = 0;
const TILES_PER_FRAME = 8;  // 16x32 sprite = 2x4 tiles 4bpp
const NUM_WALK_FRAMES = 9;  // = 1:1 décomp gObjectEventPic_BrendanNormal frame count
const RUN_FRAME_OFFSET = 9;  // = 1:1 décomp sPicTable_BrendanNormal[9..17] offset
const TOTAL_PLAYER_FRAMES = 18;  // = walking + running
const PLAYER_PALETTE_BANK = 0;

// ─── Async loader : sprite + palette ────────────────────────────────────────

/** Reorganise PNG charData (= row-major par tile sur 18×4 grid) en OBJ 1D
 *  layout (= 8 tiles sequential par sprite frame).
 *
 *  PNG layout : tiles 0..71 row-major (= row 0: tiles 0..17, row 1: tiles 18..35, etc.)
 *  Frame F (0..8) occupe PNG tile cols 2F, 2F+1 sur 4 rows = 8 tiles :
 *    PNG tile indices: 2F, 2F+1, 18+2F, 19+2F, 36+2F, 37+2F, 54+2F, 55+2F
 *  OBJ 1D layout : frame F starts at OBJ tile (F*8). Sequential 8 tiles. */
function pngTo1dObjLayout(pngCharData: Uint8Array, numFrames: number, pngWidthTiles: number): Uint8Array {
  const TILE_BYTES = 32;  // 4bpp 8x8
  const out = new Uint8Array(numFrames * TILES_PER_FRAME * TILE_BYTES);
  const FRAME_W_TILES = 2;
  const FRAME_H_TILES = 4;
  for (let f = 0; f < numFrames; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        // PNG tile index (row-major sur 18 cols)
        const pngTileIdx = row * pngWidthTiles + (f * FRAME_W_TILES) + col;
        // OBJ 1D tile index dans frame
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES
        );
      }
    }
  }
  return out;
}

/** 1:1 décomp `InitPlayerAvatar(x, y, direction, gender)` (field_player_avatar.c:1364).
 *  Charge le sprite walking.png → OBJ VRAM, charge la palette → OBJ palette bank,
 *  crée le sprite OAM au centre de l'écran, init gPlayerAvatar struct.
 *
 *  @param mapX     Player position en map coord X (= 0-indexed)
 *  @param mapY     Player position en map coord Y
 *  @param direction Initial facing direction (DIR_*)
 *  @param gender   'MALE' = Brendan, 'FEMALE' = May
 *  @param rt       DecompRuntime (= for OAM allocation + palette)
 */
export async function InitPlayerAvatar(
  mapX: number, mapY: number, direction: number,
  gender: 'MALE' | 'FEMALE',
  rt: DecompRuntime,
): Promise<void> {
  // 1:1 décomp `InitPlayerAvatar` (field_player_avatar.c:1364-1394) :
  // pas d'écriture `gSaveBlock1Ptr.pos.x/y/facing` (= ces fields n'existent PAS
  // dans struct PlayerAvatar décomp). La position LOGICAL est dans
  // `gSaveBlock1Ptr->pos` (= updated par CameraMove + LoadSavedMapView).
  // La direction est set par `ObjectEventTurn(slot, direction)` post-spawn
  // (= ligne 1386 décomp). Notre `InitPlayerObjectEvent` ci-dessous set
  // déjà `slot.facingDirection = direction` au spawn (= 1:1 équivalent).
  gSaveBlock1Ptr.pos.x = mapX;
  gSaveBlock1Ptr.pos.y = mapY;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
  gPlayerAvatar.stepDirection = DIR_NONE;
  gPlayerAvatar.turnFramesLeft = 0;
  gPlayerAvatar.collideFramesLeft = 0;
  gPlayerAvatar.forceMovement = DIR_NONE;
  gPlayerAvatar.currentElevation = 3;  // reset à elevation neutre default
  gPlayerAvatar.gender = gender;
  gPlayerAvatar.walkAnimAlt = 0;

  // 1:1 décomp `InitPlayerAvatar` (field_player_avatar.c:1382-1385) :
  // ```c
  // objectEventId = SpawnSpecialObjectEvent(&playerObjEventTemplate);
  // objectEvent = &gObjectEvents[objectEventId];
  // objectEvent->isPlayer = TRUE;
  // ...
  // gPlayerAvatar.objectEventId = objectEventId;
  // ```
  // Notre impl : réserver `gObjectEvents[PLAYER_OBJECT_EVENT_SLOT=0]` comme
  // player slot fixe. NPCs spawn (= via findIndex(!active)) skip naturellement
  // ce slot car `InitPlayerObjectEvent` set `active=true`.
  //
  // Cette init DOIT être avant `SpawnObjectEventsOnMap` (= TestOverworldScene
  // l.836) sinon NPCs spawn dans slot 0 → écrasent player.
  const playerGraphicsKey = gender === 'FEMALE' ? 'May' : 'Brendan';
  InitPlayerObjectEvent(mapX, mapY, direction, playerGraphicsKey);
  // 1:1 décomp `gPlayerAvatar.objectEventId = objectEventId` (= 0 chez nous,
  // slot réservé). HideShowWarpArrow + autres helpers décomp peuvent maintenant
  // lire `gObjectEvents[gPlayerAvatar.objectEventId]` directement.
  gPlayerAvatar.objectEventId = PLAYER_OBJECT_EVENT_SLOT;

  // 1:1 décomp `sPicTable_BrendanNormal[18]` : load walking.png + running.png
  // en parallèle, concaténer en single VRAM block (= 18 frames). updateSpriteFrame
  // utilise `frameIdx + (dashing ? 9 : 0)` comme offset.
  const name = gender === 'FEMALE' ? 'may' : 'brendan';
  const [walkingPng, runningPng] = await Promise.all([
    loadIndexedPngStrict(`/decomp/em/object_events/people/${name}/walking.png`, 4),
    loadIndexedPngStrict(`/decomp/em/object_events/people/${name}/running.png`, 4),
  ]);
  const walkingReordered = pngTo1dObjLayout(walkingPng.charData, NUM_WALK_FRAMES, walkingPng.widthTiles);
  const runningReordered = pngTo1dObjLayout(runningPng.charData, NUM_WALK_FRAMES, runningPng.widthTiles);
  // Concaténation 1:1 décomp sPicTable[0..8 walking, 9..17 running].
  const combined = new Uint8Array(walkingReordered.length + runningReordered.length);
  combined.set(walkingReordered, 0);
  combined.set(runningReordered, walkingReordered.length);

  // 1:1 STRICT décomp pattern `ResetScreenForMapLoad` + `InitObjectEventsLocal` :
  //  1. ResetSpriteData (= clear all sprite sheets + tile alloc state)
  //  2. FreeAllSpritePalettes (= clear all OBJ palette tags)
  //  3. LoadSpriteSheet(player) + LoadSpritePalette(player) → alloue slot 0
  //  4. Set reserved counts pour protéger
  //
  // CRITIQUE : aussi clear sSpriteTileAllocBitmap + sSpritePaletteTags arrays
  // (= 1:1 décomp EWRAM static storage). Sans ça, AllocSpriteTiles bitmap scan
  // saute la zone "libre" précédente (= 0..143 si bag avait alloué) et alloue
  // player à offset ≠ 0 → sprite OAM tileId=0 lit ancien bag sprite → NOIR.
  rt.freedSpriteTileRanges.length = 0;
  setReservedSpriteTileCount(0);
  setReservedSpritePaletteCount_helper(0);
  // 1:1 STRICT clear arrays primary storage + bitmap (= ce que ResetSpriteData
  // décomp fait via FreeSpriteTileRanges + AllocSpriteTiles(0) + FreeAllSpritePalettes).
  const spriteGlobal = (globalThis as Record<string, unknown>).__sprite as {
    sSpritePaletteTags?: Uint16Array;
    sSpriteTileRangeTags?: Uint16Array;
    sSpriteTileRanges?: Uint16Array;
    sSpriteTileAllocBitmap?: Uint8Array;
  } | undefined;
  if (spriteGlobal?.sSpritePaletteTags) spriteGlobal.sSpritePaletteTags.fill(0xFFFF);
  if (spriteGlobal?.sSpriteTileRangeTags) spriteGlobal.sSpriteTileRangeTags.fill(0xFFFF);
  if (spriteGlobal?.sSpriteTileRanges) spriteGlobal.sSpriteTileRanges.fill(0);
  if (spriteGlobal?.sSpriteTileAllocBitmap) spriteGlobal.sSpriteTileAllocBitmap.fill(0);
  // 1:1 décomp src/sprite.c:1486 LoadSpriteSheet : écrit OBJ VRAM + marker tag.
  const tileStart = LoadSpriteSheet({
    data: combined, size: combined.length, tag: 'PLAYER_AVATAR_GFX',
  });
  if (tileStart !== PLAYER_OBJ_TILE_START) {
    console.error(`[InitPlayerAvatar] LoadSpriteSheet returned tileStart=${tileStart}, expected ${PLAYER_OBJ_TILE_START}`);
  }
  // 1:1 décomp src/sprite.c:1589 LoadSpritePalette : écrit gPlttBufferUnfaded/Faded
  // + marker tag. walking + running partagent la même palette (= shared player).
  const palette = walkingPng.palette;
  void runningPng;  // palette identique
  const palSlot = LoadSpritePalette({ data: palette, tag: 'PLAYER_AVATAR_PAL' });
  if (palSlot !== PLAYER_PALETTE_BANK) {
    console.error(`[InitPlayerAvatar] LoadSpritePalette returned palSlot=${palSlot}, expected ${PLAYER_PALETTE_BANK}`);
  }
  // 1:1 STRICT décomp InitObjectEventPalettes : réserve la zone player (=
  // tiles + palette bank) pour que les UI menus suivants alloue STRICTEMENT
  // après. ResetSpriteData (= bag boot) reset ces values à 0 → bag écrase →
  // au close, loadAndInitMap → InitPlayerAvatar re-set → cycle complet 1:1.
  setReservedSpriteTileCount(combined.length / 32);
  setReservedSpritePaletteCount_helper(palSlot + 1);
  // 1:1 décomp : NE PAS flushTo inline ici. Le décomp `LoadSpritePalette` ne flush
  // pas non plus — c'est `TransferPlttBuffer()` au prochain VBlank qui copie
  // gPlttBufferFaded → PLTT register. Notre auto-flushTo (decomp-runtime tickFixed)
  // fait pareil et respecte `gPaletteFade.bufferTransferDisabled` → permet de gater
  // le palette transfer pendant un warp load (= sinon le player palette pousse les
  // NEW colors du tileset à PaletteBanks → flash visible avant fade-in).

  // Create OAM sprite at SCREEN CENTER. Le player visuel reste fixe au centre
  // de l'écran ; le BG scroll donne l'illusion de movement.
  //
  // ⚠️ cfg.x/y passés à CreateSpriteAtOam = sprite CENTER (= 1:1 décomp
  // convention sprite engine). syncSpritesToOam applique centerToCornerVec
  // (= -8, -16 pour 16×32) chaque frame → final OAM x = center.x - 8,
  // OAM y = center.y - 16.
  //
  // 1:1 décomp convention : player drawn at view (7, 7) (= MAP_OFFSET, MAP_OFFSET).
  // BG_VOFS = sVerticalCameraPan + yPixelOffset + 8 = 32 + 0 + 8 = 40.
  // Player tile (= view row 7) world y = 7 * 16 = 112. Screen y = 112 - 40 = 72.
  // Sprite top at screen y = 72 (= matches old convention's visible position).
  // Sprite center y = 72 + 16 = 88.
  const SCREEN_CENTER_X = 7 * 16 + 8;        // = 120 (view col 7 + mid-tile)
  const SCREEN_CENTER_Y = 6 * 16 + 16 - 40;  // = 72 (view row 7 top - BG_VOFS=40)
  const initialFrame = SPRITE_FRAMES[direction as keyof typeof SPRITE_FRAMES];

  const result = rt.CreateSpriteAtOam({
    tileId: PLAYER_OBJ_TILE_START + initialFrame.face * TILES_PER_FRAME,
    paletteBank: PLAYER_PALETTE_BANK,
    x: SCREEN_CENTER_X,
    y: SCREEN_CENTER_Y,
    shape: 2,    // tall
    size: 2,     // 16×32
    priority: 2, // entre BG2 (priority 2) et BG3 (priority 3)
    paletteMode: 0,  // 4bpp
    affineMode: 0,
  });
  gPlayerAvatar.spriteId = result.spriteId;

  // Apply initial flip selon direction (= west = mirror right).
  // Set sur sprite state (= survives syncSpritesToOam).
  if (gPlayerAvatar.spriteId >= 0) {
    const sprite = rt.gSprites.get(gPlayerAvatar.spriteId);
    if (sprite) sprite.hFlip = initialFrame.hFlip;
    rt.gba.oam[result.oamIndex].flipH = initialFrame.hFlip;
  }

  // Set camera focus = player position. 1:1 décomp `gSaveBlock1Ptr->pos = (mapX, mapY)`
  // en LOGICAL coords. Player drawn at view (7, 7) (= MAP_OFFSET, MAP_OFFSET) avec
  // BG_VOFS=40 (= sVerticalCameraPan=32 + 8) → visible window starts at metatile row 2.5,
  // player visible at row 4.5 (= centered). 1:1 décomp.
  SetCameraTopLeftCoords(mapX, mapY);
}

// ─── Direction → (dx, dy) helpers depuis direction-coords (= source unique) ─
//
// Avant : DIR_TO_DX/DY locaux dupliquaient la table 1:1 décomp `sDirectionToVectors`.
// Migrate vers direction-coords.ts pour une source unique partagée avec
// object-events.ts + script-opcodes.ts (= éviter divergence future).
//
// `dirToCameraSpeed` re-exporté ici via alias pour back-compat.
const dirToCameraSpeed = _dirToCameraSpeed;

// ─── 1:1 décomp jump anim (event_object_movement.c:8426-8444) ──────────────

/** 1:1 décomp `sJumpY_High[]` (event_object_movement.c:8426).
 *  Y offsets pour la courbe de saut "high" (= ledge jump JUMP_TYPE_HIGH).
 *  16 entries → 32-frame jump (= JUMP_DISTANCE_FAR), each entry covers 2 frames
 *  via `sJumpY_High[timer / 2]`. Negative = sprite va vers le HAUT. */
const sJumpY_High: ReadonlyArray<number> = [
  -4, -6, -8, -10, -11, -12, -12, -12,
  -11, -10, -9, -8, -6, -4, 0, 0,
];

/** Compute jump y offset based on timer (= 0..31, 32-frame ledge jump).
 *  Décomp utilise `GetJumpY(timer/2, JUMP_TYPE_HIGH)`. */
function getJumpYOffset(timer: number): number {
  const idx = Math.min(15, Math.max(0, timer >> 1));
  return sJumpY_High[idx];
}

/** Flag interne : true pendant un ledge jump pour appliquer 2-tiles move au
 *  step end. Set true quand collision = LEDGE_JUMP, cleared après step end. */
let _pendingLedgeJump = false;

// ─── Sprite frame update ─────────────────────────────────────────────────────

/** Set la sprite frame courante (face/walk1/walk2) selon direction + state. */
function updateSpriteFrame(rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;
  const sprite = rt.gSprites.get(gPlayerAvatar.spriteId);
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const cfg = SPRITE_FRAMES[GetPlayerFacingDirection() as keyof typeof SPRITE_FRAMES];
  if (!cfg) return;

  let frameIdx: number;
  // Session 124 fix : gate étendu pour scripted movement (= applymovement
  // LOCALID_PLAYER walk_*). Le scripted movement set `stepFramesLeft` mais
  // PAS `runningState = MOVING` (= éviter double-tick PlayerStep). Donc on
  // accept aussi `stepFramesLeft > 0` standalone pour render walk anim.
  // User feedback : "Mon perso glide toujours" → cause = condition trop
  // stricte qui rejetait le scripted movement.
  if (gPlayerAvatar.stepFramesLeft > 0) {
    // Walk anim 1:1 décomp `sAnim_GoSouth` (object_event_anims.h) :
    //   ANIMCMD_FRAME(walk_a, 8)
    //   ANIMCMD_FRAME(face, 8)
    //   ANIMCMD_FRAME(walk_b, 8)
    //   ANIMCMD_FRAME(face, 8)
    //   ANIMCMD_JUMP(0)
    // Cycle = 32 game-frames = 2 metatile steps.
    //
    // Walk : step 16 frames → walk_a/b (8) + face (8). Threshold = 8.
    // Dash : step 8 frames → walk_a/b (4) + face (4). Threshold = 4 (= /2).
    //   Phase 4.9 first cut : utilise walk frames pour dash. Task (1) ajoutera
    //   les vraies dash frames (= sprite course distinct) via running.png.
    const halfStep = gPlayerAvatar.dashing ? 4 : 8;
    if (gPlayerAvatar.stepFramesLeft >= halfStep) {
      frameIdx = gPlayerAvatar.walkAnimAlt === 0 ? cfg.walk1 : cfg.walk2;
    } else {
      frameIdx = cfg.face;
    }
  } else if (gPlayerAvatar.collideFramesLeft > 0) {
    // 1:1 décomp `WalkInPlaceSlow` : anim ralentie sur 32 frames (= 2× normal).
    // Cycle 32 frames : walk (16 render frames) → face (16 render frames).
    // collideFramesLeft DECREMENTS de 32→1.
    // Frames 32-17 : walk_a OR walk_b (= bump ralenti)
    // Frames 16-1 : face (= reset position pour next bump)
    // walkAnimAlt switche entre cycles (= alternance walk_a/walk_b).
    if (gPlayerAvatar.collideFramesLeft >= 16) {
      frameIdx = gPlayerAvatar.walkAnimAlt === 0 ? cfg.walk1 : cfg.walk2;
    } else {
      frameIdx = cfg.face;
    }
  } else {
    frameIdx = cfg.face;
  }

  // 1:1 décomp `sPicTable_BrendanNormal` : frames 0..8 = walking, 9..17 = running.
  // Quand dashing pendant un step actif : shift frameIdx de RUN_FRAME_OFFSET (= 9)
  // → utilise running pic. Hors step actif (= idle face / collide / turn), revient
  // aux walking frames même si dashing reste true. 1:1 décomp `npc_clear_strange_bits`
  // (field_player_avatar.c:390) clear le flag PLAYER_AVATAR_FLAG_DASH chaque frame
  // avant keypad logic ; notre impl gate le visual sur runningState=MOVING + step.
  const inActiveDashStep = gPlayerAvatar.dashing
    && gPlayerAvatar.runningState === MOVING
    && gPlayerAvatar.stepFramesLeft > 0;
  const dashOffset = inActiveDashStep ? RUN_FRAME_OFFSET : 0;
  oam.tileId = PLAYER_OBJ_TILE_START + (frameIdx + dashOffset) * TILES_PER_FRAME;
  // Set hFlip sur le SPRITE state (= source of truth pour syncSpritesToOam,
  // appelé chaque frame dans tickFixed). Setter oam.flipH directement serait
  // overridden au prochain syncSpritesToOam.
  sprite.hFlip = cfg.hFlip;
  oam.flipH = cfg.hFlip;
  // 1:1 décomp ledge jump : sprite y2 offset suit sJumpY_High[timer/2] curve.
  // Le sprite OAM y est SCREEN_CENTER_Y + jumpYOffset. jumpYOffset négatif =
  // sprite vers le HAUT (= effet d'arc de saut). À 0 = sprite à position normale.
  const jumpY = gPlayerAvatar.jumpFramesLeft > 0
    ? getJumpYOffset(32 - gPlayerAvatar.jumpFramesLeft)
    : 0;
  // sprite.y stocké au CENTER (= 72 baseline + jumpY).
  // 1:1 décomp `gSpriteCoordOffsetX/Y` (field_camera.c:461-462) :
  //   gSpriteCoordOffsetX = gTotalCameraPixelOffsetX - sHorizontalCameraPan;
  //   gSpriteCoordOffsetY = gTotalCameraPixelOffsetY - sVerticalCameraPan - 8;
  // Sprite shift INVERSE du camera pan (= si camera shifts RIGHT via pan +1,
  // BG_HOFS +1 → BG scrolls LEFT visually → sprite must shift LEFT to follow
  // BG = sprite.x -= 1).
  // Constants inline : SCREEN_CENTER_X = 120, SCREEN_CENTER_Y = 72.
  const panX = GetCameraPanX();
  const panY = GetCameraPanY();
  sprite.x = 120 - panX;
  sprite.y = 72 + jumpY - panY;
}

// ─── Collision check ────────────────────────────────────────────────────────

/** Alias pour `MoveCoords` du module direction-coords (= back-compat). */
const moveCoords = MoveCoords;

/** Constants de collision 1:1 décomp `enum Collision` (global.fieldmap.h:309-323).
 *  Valeurs 1:1 strict — re-déclarées local pour éviter cycle ESM avec
 *  object-events (= player-avatar ↔ object-events s'importent mutuellement). */
const COLLISION_NONE                       = 0;
const COLLISION_IMPASSABLE                 = 2;
const COLLISION_ELEVATION_MISMATCH         = 3;
const COLLISION_OBJECT_EVENT               = 4;
const COLLISION_STOP_SURFING               = 5;
export const COLLISION_LEDGE_JUMP          = 6;
const COLLISION_PUSHED_BOULDER             = 7;
const COLLISION_ROTATING_GATE              = 8;
const COLLISION_WHEELIE_HOP                = 9;
const COLLISION_ISOLATED_VERTICAL_RAIL     = 10;
const COLLISION_ISOLATED_HORIZONTAL_RAIL   = 11;
const COLLISION_VERTICAL_RAIL              = 12;
const COLLISION_HORIZONTAL_RAIL            = 13;

/** 1:1 décomp `PLAYER_AVATAR_FLAG_SURFING = (1 << 3)` (global.fieldmap.h:51). */
const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;

// 1:1 décomp `OBJ_EVENT_GFX_PUSHABLE_BOULDER = 87` (include/constants/event_objects.h:99).
// Migré vers import decomp-data event_objects-data.ts (cleanup B7).

// 1:1 décomp `NUM_ACRO_BIKE_COLLISIONS = 5` (field_player_avatar.c:34).
// Migré vers import decomp-data field_player_avatar-data.ts (cleanup B7).

/** 1:1 décomp `sAcroBikeTrickMetatiles[NUM_ACRO_BIKE_COLLISIONS]`
 *  (field_player_avatar.c:197-204). Functions appliquées au metatileBehavior
 *  pour détecter les tiles trick Acro Bike (= bumpy slope + rails). */
const sAcroBikeTrickMetatiles: Array<(mb: number) => boolean> = [
  MetatileBehavior_IsBumpySlope,
  MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsIsolatedHorizontalRail,
  MetatileBehavior_IsVerticalRail,
  MetatileBehavior_IsHorizontalRail,
];

/** 1:1 décomp `sAcroBikeTrickCollisionTypes[NUM_ACRO_BIKE_COLLISIONS]`
 *  (field_player_avatar.c:206-212). Collision codes correspondant aux tables
 *  metatiles ci-dessus. Used par `CheckAcroBikeCollision` pour override le
 *  collision returned par GetCollisionAtCoords. */
const sAcroBikeTrickCollisionTypes: number[] = [
  COLLISION_WHEELIE_HOP,
  COLLISION_ISOLATED_VERTICAL_RAIL,
  COLLISION_ISOLATED_HORIZONTAL_RAIL,
  COLLISION_VERTICAL_RAIL,
  COLLISION_HORIZONTAL_RAIL,
];

// ─── Side-effects R4 dette explicite (= hors démo Brendan house) ───────────

/** 1:1 décomp `CreateStopSurfingTask(u8 direction)` (field_player_avatar.c:1630-1644).
 *
 *  ```c
 *  LockPlayerFieldControls();
 *  Overworld_ClearSavedMusic();
 *  Overworld_ChangeMusicToDefault();
 *  gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;
 *  gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_ON_FOOT;
 *  gPlayerAvatar.preventStep = TRUE;
 *  taskId = CreateTask(Task_StopSurfingInit, 0xFF);
 *  gTasks[taskId].data[0] = direction;
 *  Task_StopSurfingInit(taskId);
 *  ```
 *
 *  Port partiel 1:1 strict :
 *  - flags / preventStep / lock : portés.
 *  - Overworld music change : R4 dette (= Surf BGM hors démo).
 *  - Task_StopSurfingInit (= jump anim surf→land + sprite swap + UnlockPlayerFieldControls)
 *    : R4 dette (= gTasks Phaser + ObjectEventSetGraphicsId visuel hors démo).
 *
 *  Note : utilisé uniquement par `CanStopSurfing` qui early-returns false si
 *  PLAYER_AVATAR_FLAG_SURFING non set (= jamais en démo). */
function CreateStopSurfingTask(direction: number): void {
  LockPlayerFieldControls();
  // R4 dette : Overworld_ClearSavedMusic + Overworld_ChangeMusicToDefault non
  // portés (= Surf BGM hors démo, MUSIQUE = ne pas toucher sans demande user).
  gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;
  gPlayerAvatar.flags |= 1 << 0;  // PLAYER_AVATAR_FLAG_ON_FOOT = (1 << 0)
  gPlayerAvatar.preventStep = true;
  // R4 dette : Task_StopSurfingInit (= jump anim Surf→land + sprite swap Brendan
  // Normal + DestroySprite blob + UnlockPlayerFieldControls) non porté.
  // À porter avec Surf subsystem (= besoin gTasks Phaser + ObjectEventSetGraphicsId).
  console.warn('[player-avatar] R4 partiel: CreateStopSurfingTask(' + direction
    + ') — flags/lock OK, Task_StopSurfingInit (anim + sprite swap) non porté.');
}

/** 1:1 décomp `StartStrengthAnim(u8 objectEventId, u8 direction)`
 *  (field_player_avatar.c:1796-1804).
 *
 *  ```c
 *  u8 taskId = CreateTask(Task_PushBoulder, 0xFF);
 *  gTasks[taskId].data[1] = objectEventId;
 *  gTasks[taskId].data[2] = direction;
 *  Task_PushBoulder(taskId);
 *  ```
 *
 *  Task_PushBoulder lock controls + setup ObjectEventSetHeldMovement (=
 *  walk_slow direction) sur le boulder + play SE_PUSH_BOULDER.
 *
 *  R4 dette : Task_PushBoulder + SE_PUSH_BOULDER + boulder movement non
 *  portés (= HM Strength subsystem hors démo). Utilisé uniquement par
 *  `TryPushBoulder` qui early-returns false si FLAG_SYS_USE_STRENGTH non set
 *  (= jamais en démo). */
function StartStrengthAnim(objectEventId: number, direction: number): void {
  // R4 dette : Task_PushBoulder non porté. Signature 1:1 conservée pour wire
  // future. À porter avec HM Strength subsystem.
  console.warn('[player-avatar] R4 TODO: StartStrengthAnim(' + objectEventId + ', '
    + direction + ') — Task_PushBoulder non porté (hors démo).');
}

/** 1:1 décomp `IncrementGameStat(u8 index)` (overworld.c:433-445).
 *
 *  ```c
 *  if (index < NUM_USED_GAME_STATS) {
 *      u32 statVal = GetGameStat(index);
 *      if (statVal < 0xFFFFFF) statVal++;
 *      else statVal = 0xFFFFFF;
 *      SetGameStat(index, statVal);
 *  }
 *  ```
 *
 *  NUM_USED_GAME_STATS = 52 (= game_stat.h:57). gSaveBlock1Ptr.gameStats[]
 *  est XOR'd avec gSaveBlock2Ptr.encryptionKey (= save protection).
 *  Cap 0xFFFFFF (16M) car compteur 24-bit dans le save format. */
function IncrementGameStat(index: number): void {
  const NUM_USED_GAME_STATS_LOCAL = 52;
  if (index < NUM_USED_GAME_STATS_LOCAL) {
    let statVal = GetGameStat(index);
    if (statVal < 0xFFFFFF) statVal++;
    else statVal = 0xFFFFFF;
    SetGameStat(index, statVal);
  }
}

/** 1:1 décomp `GetGameStat(u8 index)` (overworld.c:447-453). */
function GetGameStat(index: number): number {
  const NUM_USED_GAME_STATS_LOCAL = 52;
  if (index >= NUM_USED_GAME_STATS_LOCAL) return 0;
  const stats = (gSaveBlock1Ptr.gameStats as number[]) || [];
  const key = (gSaveBlock2Ptr.encryptionKey as number) | 0;
  return (stats[index] | 0) ^ key;
}

/** 1:1 décomp `SetGameStat(u8 index, u32 value)` (overworld.c:455-459). */
function SetGameStat(index: number, value: number): void {
  const NUM_USED_GAME_STATS_LOCAL = 52;
  if (index < NUM_USED_GAME_STATS_LOCAL) {
    const stats = (gSaveBlock1Ptr.gameStats as number[]) || [];
    const key = (gSaveBlock2Ptr.encryptionKey as number) | 0;
    stats[index] = (value | 0) ^ key;
  }
}

// ─── 1:1 décomp `CheckForObjectEventCollision` subsystems ──────────────────

/** 1:1 décomp `CanStopSurfing(s16 x, s16 y, u8 direction)`
 *  (field_player_avatar.c:712-725).
 *
 *  ```c
 *  if ((gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
 *      && MapGridGetElevationAt(x, y) == ELEVATION_DEFAULT
 *      && GetObjectEventIdByPosition(x, y, ELEVATION_DEFAULT) == OBJECT_EVENTS_COUNT)
 *  {
 *      CreateStopSurfingTask(direction);
 *      return TRUE;
 *  }
 *  return FALSE;
 *  ```
 *
 *  Si player surfe + tile target = land (ELEVATION_DEFAULT=3) + pas d'NPC dessus
 *  → start surf-exit task. Return TRUE pour signal override COLLISION_ELEVATION
 *  _MISMATCH en COLLISION_STOP_SURFING. */
function CanStopSurfing(x: number, y: number, direction: number): boolean {
  if ((gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
      && MapGridGetElevationAt(x, y) === ELEVATION_DEFAULT
      && GetObjectEventIdByPosition(x, y, ELEVATION_DEFAULT) === OBJECT_EVENTS_COUNT) {
    CreateStopSurfingTask(direction);
    return true;
  }
  return false;
}

/** 1:1 décomp `TryPushBoulder(s16 x, s16 y, u8 direction)`
 *  (field_player_avatar.c:735-755).
 *
 *  ```c
 *  if (FlagGet(FLAG_SYS_USE_STRENGTH)) {
 *      u8 objectEventId = GetObjectEventIdByXY(x, y);
 *      if (objectEventId != OBJECT_EVENTS_COUNT
 *          && gObjectEvents[objectEventId].graphicsId == OBJ_EVENT_GFX_PUSHABLE_BOULDER) {
 *          // compute target = boulder pos + direction.
 *          MoveCoords(direction, &x, &y);
 *          if (GetCollisionAtCoords(boulderObj, x, y, direction) == COLLISION_NONE
 *              && !MetatileBehavior_IsNonAnimDoor(MapGridGetMetatileBehaviorAt(x, y))) {
 *              StartStrengthAnim(objectEventId, direction);
 *              return TRUE;
 *          }
 *      }
 *  }
 *  return FALSE;
 *  ```
 *
 *  Si player a HM Strength used + tile target = boulder + boulder peut bouger
 *  dans la direction → start push anim. Return TRUE pour override
 *  COLLISION_OBJECT_EVENT en COLLISION_PUSHED_BOULDER.
 *
 *  x, y = INTERNAL coords (= +MAP_OFFSET déjà). */
function TryPushBoulder(x: number, y: number, direction: number): boolean {
  if (FlagGet('FLAG_SYS_USE_STRENGTH')) {
    const objectEventId = GetObjectEventIdByXY(x, y);
    if (objectEventId !== OBJECT_EVENTS_COUNT
        && gObjectEvents[objectEventId].graphicsId === String(OBJ_EVENT_GFX_PUSHABLE_BOULDER)) {
      // 1:1 décomp : boulder pos + direction = new target.
      const bx = gObjectEvents[objectEventId].currentCoordsX;
      const by = gObjectEvents[objectEventId].currentCoordsY;
      const { x: newX, y: newY } = moveCoords(direction, bx, by);
      if (_GetCollisionAtCoords(gObjectEvents[objectEventId], newX, newY, direction) === COLLISION_NONE
          && !MetatileBehavior_IsNonAnimDoor(MapGridGetMetatileBehaviorAt(newX, newY))) {
        StartStrengthAnim(objectEventId, direction);
        return true;
      }
    }
  }
  return false;
}

/** 1:1 décomp `CheckAcroBikeCollision(s16 x, s16 y, u8 metatileBehavior, u8 *collision)`
 *  (field_player_avatar.c:757-769).
 *
 *  ```c
 *  for (i = 0; i < NUM_ACRO_BIKE_COLLISIONS; i++) {
 *      if (sAcroBikeTrickMetatiles[i](metatileBehavior)) {
 *          *collision = sAcroBikeTrickCollisionTypes[i];
 *          return;
 *      }
 *  }
 *  ```
 *
 *  Si target tile est un trick Acro Bike (bumpy slope / rail), override le
 *  collision en COLLISION_WHEELIE_HOP / VERTICAL_RAIL / etc. Sinon no-op.
 *
 *  C-pattern `u8 *collision` modifié in-place → TS retourne le nouveau collision
 *  (= caller assigne `collision = CheckAcroBikeCollision(...)`). */
function CheckAcroBikeCollision(
  _x: number, _y: number, metatileBehavior: number, collision: number,
): number {
  for (let i = 0; i < NUM_ACRO_BIKE_COLLISIONS; i++) {
    if (sAcroBikeTrickMetatiles[i](metatileBehavior)) {
      return sAcroBikeTrickCollisionTypes[i];
    }
  }
  return collision;
}

// ─── 1:1 décomp `CheckForObjectEventCollision` (main dispatcher) ───────────

/** 1:1 décomp `CheckForObjectEventCollision(struct ObjectEvent *objectEvent, s16 x, s16 y, u8 direction, u8 metatileBehavior)`
 *  (field_player_avatar.c:676-697).
 *
 *  ```c
 *  u8 collision = GetCollisionAtCoords(objectEvent, x, y, direction);
 *  if (collision == COLLISION_ELEVATION_MISMATCH && CanStopSurfing(x, y, direction))
 *      return COLLISION_STOP_SURFING;
 *  if (ShouldJumpLedge(x, y, direction)) {
 *      IncrementGameStat(GAME_STAT_JUMPED_DOWN_LEDGES);
 *      return COLLISION_LEDGE_JUMP;
 *  }
 *  if (collision == COLLISION_OBJECT_EVENT && TryPushBoulder(x, y, direction))
 *      return COLLISION_PUSHED_BOULDER;
 *  if (collision == COLLISION_NONE) {
 *      if (CheckForRotatingGatePuzzleCollision(direction, x, y))
 *          return COLLISION_ROTATING_GATE;
 *      CheckAcroBikeCollision(x, y, metatileBehavior, &collision);
 *  }
 *  return collision;
 *  ```
 *
 *  ShouldJumpLedge utilise notre helper port qui prend `targetBehavior` au lieu
 *  de `(x, y, direction)`. Fonctionnellement équivalent à l'override décomp.
 *
 *  x, y = INTERNAL coords (= +MAP_OFFSET déjà). */
export function CheckForObjectEventCollision(
  objectEvent: Parameters<typeof _GetCollisionAtCoords>[0],
  x: number, y: number, direction: number, metatileBehavior: number,
): number {
  let collision = _GetCollisionAtCoords(objectEvent, x, y, direction);
  if (collision === COLLISION_ELEVATION_MISMATCH && CanStopSurfing(x, y, direction))
    return COLLISION_STOP_SURFING;
  if (ShouldJumpLedge(metatileBehavior, direction)) {
    IncrementGameStat(GAME_STAT_JUMPED_DOWN_LEDGES);
    return COLLISION_LEDGE_JUMP;
  }
  if (collision === COLLISION_OBJECT_EVENT && TryPushBoulder(x, y, direction))
    return COLLISION_PUSHED_BOULDER;
  if (collision === COLLISION_NONE) {
    if (CheckForRotatingGatePuzzleCollision(direction, x, y))
      return COLLISION_ROTATING_GATE;
    collision = CheckAcroBikeCollision(x, y, metatileBehavior, collision);
  }
  return collision;
}

/** 1:1 décomp `CheckForObjectEventStaticCollision(struct ObjectEvent *objectEvent, s16 x, s16 y, u8 direction, u8 metatileBehavior)`
 *  (field_player_avatar.c:699-710). Variante "static" : pas de side-effects
 *  (= pas de StartStrengthAnim, pas de CreateStopSurfingTask). Used par
 *  trainer line-of-sight check. */
export function CheckForObjectEventStaticCollision(
  objectEvent: Parameters<typeof _GetCollisionAtCoords>[0],
  x: number, y: number, direction: number, metatileBehavior: number,
): number {
  let collision = _GetCollisionAtCoords(objectEvent, x, y, direction);
  if (collision === COLLISION_NONE) {
    if (CheckForRotatingGatePuzzleCollisionWithoutAnimation(direction, x, y))
      return COLLISION_ROTATING_GATE;
    collision = CheckAcroBikeCollision(x, y, metatileBehavior, collision);
  }
  return collision;
}

/** 1:1 décomp `CheckForPlayerAvatarCollision(u8 direction)`
 *  (field_player_avatar.c:654-663).
 *
 *  ```c
 *  s16 x, y;
 *  struct ObjectEvent *playerObjEvent = &gObjectEvents[gPlayerAvatar.objectEventId];
 *  x = playerObjEvent->currentCoords.x;
 *  y = playerObjEvent->currentCoords.y;
 *  MoveCoords(direction, &x, &y);
 *  return CheckForObjectEventCollision(playerObjEvent, x, y, direction,
 *                                       MapGridGetMetatileBehaviorAt(x, y));
 *  ```
 *
 *  Post R3 refactor : `gObjectEvents[playerSlot].currentCoords` est INTERNAL
 *  (= +MAP_OFFSET, 1:1 décomp). Pass direct à GetCollisionAtCoords + helpers.
 *  Fallback inline si slot 0 pas init utilise pa.x/y (LOGICAL) → convert. */
export function CheckForPlayerAvatarCollision(direction: number): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  const useSlot = playerObjEvent && playerObjEvent.active && playerObjEvent.isPlayer;
  let sx: number, sy: number;  // INTERNAL coords (1:1 décomp).
  let obj: Parameters<typeof _GetCollisionAtCoords>[0];
  if (useSlot) {
    sx = playerObjEvent.currentCoordsX;
    sy = playerObjEvent.currentCoordsY;
    obj = playerObjEvent;
  } else {
    // Fallback : convertir pa.x/y (LOGICAL) → INTERNAL pour rester 1:1 décomp.
    sx = gSaveBlock1Ptr.pos.x + MAP_OFFSET;
    sy = gSaveBlock1Ptr.pos.y + MAP_OFFSET;
    const playerBehavior = MapGridGetMetatileBehaviorAt(sx, sy);
    obj = {
      active: false, trackedByCamera: false,
      currentMetatileBehavior: playerBehavior,
      currentElevation: gPlayerAvatar.currentElevation,
      currentCoordsX: sx, currentCoordsY: sy,
      previousCoordsX: sx, previousCoordsY: sy,
      movementRangeX: 0, movementRangeY: 0,
      initialCoordsX: sx, initialCoordsY: sy,
    } as unknown as Parameters<typeof _GetCollisionAtCoords>[0];
  }
  const { x: tx, y: ty } = moveCoords(direction, sx, sy);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(tx, ty);
  return CheckForObjectEventCollision(obj, tx, ty, direction, metatileBehavior);
}

/** 1:1 décomp `CheckForPlayerAvatarStaticCollision(u8 direction)`
 *  (field_player_avatar.c:665-674). Variante "static" : pas de side-effects.
 *  Post R3 refactor : slot 0 currentCoords INTERNAL, 1:1 décomp direct path. */
export function CheckForPlayerAvatarStaticCollision(direction: number): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  const useSlot = playerObjEvent && playerObjEvent.active && playerObjEvent.isPlayer;
  let sx: number, sy: number;
  let obj: Parameters<typeof _GetCollisionAtCoords>[0];
  if (useSlot) {
    sx = playerObjEvent.currentCoordsX;
    sy = playerObjEvent.currentCoordsY;
    obj = playerObjEvent;
  } else {
    sx = gSaveBlock1Ptr.pos.x + MAP_OFFSET;
    sy = gSaveBlock1Ptr.pos.y + MAP_OFFSET;
    const playerBehavior = MapGridGetMetatileBehaviorAt(sx, sy);
    obj = {
      active: false, trackedByCamera: false,
      currentMetatileBehavior: playerBehavior,
      currentElevation: gPlayerAvatar.currentElevation,
      currentCoordsX: sx, currentCoordsY: sy,
      previousCoordsX: sx, previousCoordsY: sy,
      movementRangeX: 0, movementRangeY: 0,
      initialCoordsX: sx, initialCoordsY: sy,
    } as unknown as Parameters<typeof _GetCollisionAtCoords>[0];
  }
  const { x: tx, y: ty } = moveCoords(direction, sx, sy);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(tx, ty);
  return CheckForObjectEventStaticCollision(obj, tx, ty, direction, metatileBehavior);
}

/** Wrapper local : `checkPlayerCollision(direction)` = noclip dev + delegate à
 *  `CheckForPlayerAvatarCollision` 1:1 strict. Used par PlayerStep + autres
 *  call-sites internes du module. */
function checkPlayerCollision(direction: number): number {
  // Dev-only noclip (= devmenu touche « " » toggle ; cf. DebugOverlayScene).
  // Bypass tous les checks → player marche à travers murs/NPCs/ledges/elevation.
  if ((globalThis as unknown as { __devNoclip?: boolean }).__devNoclip) {
    return COLLISION_NONE;
  }
  return CheckForPlayerAvatarCollision(direction);
}

/** 1:1 STRICT décomp `PlayCollisionSoundIfNotFacingWarp(direction)`
 *  (field_player_avatar.c:1098-1115) :
 *    metatileBehavior = gObjectEvents[gPlayerAvatar.objectEventId].currentMetatileBehavior;
 *    if (!sArrowWarpMetatileBehaviorChecks[direction-1](metatileBehavior)) {
 *        if (direction == DIR_NORTH) {
 *            PlayerGetDestCoords(&x, &y);
 *            MoveCoords(direction, &x, &y);
 *            if (IsWarpDoor(MapGridGetMetatileBehaviorAt(x, y))) return;
 *        }
 *        PlaySE(SE_WALL_HIT);
 *    }
 */
function PlayCollisionSoundIfNotFacingWarp(direction: number): void {
  // 1:1 STRICT décomp : utilise cached `currentMetatileBehavior` du player slot.
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  const useSlot = slot && slot.active && slot.isPlayer;
  const playerBehavior = useSlot
    ? slot.currentMetatileBehavior
    : MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
  // 1:1 décomp `sArrowWarpMetatileBehaviorChecks[direction-1]` (field_player_avatar.c:226).
  if (isArrowWarpMetatileBehavior(playerBehavior, direction)) return;
  // 1:1 décomp : check warp door au north uniquement.
  if (direction === DIR_NORTH) {
    const pos = PlayerGetDestCoords();  // INTERNAL coords (= 1:1 décomp).
    const { x: tx, y: ty } = MoveCoords(direction, pos.x, pos.y);
    if (getWarpKindFor(MapGridGetMetatileBehaviorAt(tx, ty)) === 'door') return;
  }
  PlaySE(SE_WALL_HIT);
}

/** 1:1 STRICT décomp `ShouldJumpLedge(x, y, direction)` (field_player_avatar.c:727-733) :
 *    if (GetLedgeJumpDirection(x, y, direction) != DIR_NONE) return TRUE;
 *  Returns TRUE si le tile target = MB_JUMP_X et direction = X (= ledge drop).
 *  Helper public pour PlayerNotOnBikeMoving qui check ShouldJumpLedge AVANT
 *  CheckForPlayerAvatarCollision pour permettre le jump anim (sinon le tile
 *  serait blocked par MapGridGetCollisionAt = 1). */
function checkLedgeJump(direction: number): boolean {
  const pos = PlayerGetDestCoords();  // INTERNAL coords 1:1 décomp.
  const { x: tx, y: ty } = MoveCoords(direction, pos.x, pos.y);
  const targetBehavior = MapGridGetMetatileBehaviorAt(tx, ty);
  return ShouldJumpLedge(targetBehavior, direction);
}

// ─── PlayerStep state machine ────────────────────────────────────────────────

/** Alias vers `getInputDirection` du module direction-coords (= source unique). */
const getInputDirection = _getInputDirection;

/** 1:1 décomp `PlayerStep(direction, newKeys, heldKeys)` (field_player_avatar.c:332).
 *  À call une fois par frame depuis le main loop overworld. Drive toute la
 *  logique : input → state machine → camera + sprite update.
 *
 *  @param heldKeys  Touches actuellement maintenues
 *  @param newKeys   Touches qui viennent d'être pressées (= front montant)
 *  @param rt        DecompRuntime
 */
/** GBA A button mask. 1:1 décomp `A_BUTTON` (gba/io_reg.h). Import depuis
 *  decomp-data (= A8 audit). */
import { A_BUTTON } from './decomp-data/include/gba/io_reg-data';

/** 1:1 décomp `ProcessPlayerFieldInput` snippet lines 170-173 :
 *  ```c
 *  GetInFrontOfPlayerPosition(&position);
 *  metatileBehavior = MapGridGetMetatileBehaviorAt(position.x, position.y);
 *  if (input->pressedAButton && TryStartInteractionScript(&position, metatileBehavior, playerDirection) == TRUE)
 *      return TRUE;
 *  ```
 *
 *  Délégué à `field-control-avatar.TryStartInteractionScript` qui implémente
 *  le port 1:1 strict de la chaîne `GetInteractedObjectEventScript` →
 *  `GetInteractedBackgroundEventScript` → `GetInteractedMetatileScript`.
 *
 *  ScriptContext_SetupScript appelle LockPlayerFieldControls() qui fait que
 *  PlayerStep skip son keypad logic la frame suivante. Les opcodes lock /
 *  faceplayer / msgbox / release gèrent eux-mêmes l'état NPC frozen. */
function tryInteractWithFacingNPC(): void {
  const position: MapPosition = { x: 0, y: 0, elevation: 0 };
  GetInFrontOfPlayerPosition(position);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(position.x, position.y);
  TryStartInteractionScript(position, metatileBehavior, GetPlayerFacingDirection());
}

export function PlayerStep(heldKeys: number, newKeys: number, rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;

  // 1:1 décomp `field_player_avatar.c:PlayerAvatarTransition_*` : si controls
  // sont locked (= un script tourne, dialogue ouvert, etc.), pas d'input. Le
  // sprite reste en NOT_MOVING tant que UnlockPlayerFieldControls n'est pas
  // call par release/releaseall. Si le player était en plein step, on laisse
  // finir sa step (= tile-bound) puis on freeze.
  if (ArePlayerFieldControlsLocked()) {
    // Phase 4.6 : forceMovement priority. 1:1 décomp `Task_DoDoorWarp` /
    // `Task_ExitDoor` / `Task_ExitNonAnimDoor` qui call `ObjectEventSetHeldMovement`
    // pour walk player UP/DOWN automatiquement avant/après warp. Si pas de
    // step actif + forceMovement set → start un step dans cette dir.
    if (gPlayerAvatar.runningState !== MOVING && gPlayerAvatar.forceMovement !== DIR_NONE) {
      // 1:1 décomp : facing via SetObjectEventDirection (= slot source unique).
      SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], gPlayerAvatar.forceMovement);
      gPlayerAvatar.runningState = MOVING;
      gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
      gPlayerAvatar.stepFramesLeft = 16;
      gPlayerAvatar.stepDirection = gPlayerAvatar.forceMovement;
      const speed = dirToCameraSpeed(gPlayerAvatar.forceMovement);
      gFieldCamera.movementSpeedX = speed.x * WALK_SPEED_PX_PER_FRAME;
      gFieldCamera.movementSpeedY = speed.y * WALK_SPEED_PX_PER_FRAME;
      // CRITICAL : `else if` ci-dessous (et NON pas un 2ème `if` indépendant)
      // pour que le dec ne s'exécute PAS sur la frame de setup. Sinon on perd
      // 1 tick de CameraUpdate par step (= step locked tournerait sur 16
      // CameraUpdate calls dont la dernière a speed=0 → seulement 15 ticks de
      // speed=1 appliqués → gFieldCamera.y stuck à 15 au lieu de wrap à 0).
      // Avec else-if, locked path = 17 frames de CameraUpdate (= match unlocked
      // path timing), 16 ticks de speed=1, gFieldCamera.y wrap proprement à 0.
    } else if (gPlayerAvatar.runningState === MOVING && gPlayerAvatar.stepFramesLeft > 0) {
      // Finish current step (= 1:1 décomp player can't be locked mid-step,
      // OU step forced via forceMovement qui vient de démarrer ci-dessus).
      gPlayerAvatar.stepFramesLeft--;
      if (gPlayerAvatar.stepFramesLeft === 0) {
        // 1:1 STRICT décomp `field_player_avatar.c` : PlayerStep ne touche
        // JAMAIS `gSaveBlock1Ptr->pos`. Seul `CameraMove` (= fieldmap.c:649) mute
        // pos via CameraUpdate au tile boundary. À ce point, pos = post-step
        // car CameraMove a déjà été appelée durant les frames du step.
        gPlayerAvatar.runningState = NOT_MOVING;
        gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
        gPlayerAvatar.stepDirection = DIR_NONE;
        gFieldCamera.movementSpeedX = 0;
        gFieldCamera.movementSpeedY = 0;
        gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
        // Clear forceMovement après step done → la scene attend ça pour next phase.
        gPlayerAvatar.forceMovement = DIR_NONE;
      }
    } else if (gPlayerAvatar.forceMovement === DIR_NONE) {
      // Pas de step + pas de force → freeze player.
      gPlayerAvatar.runningState = NOT_MOVING;
      gPlayerAvatar.collideFramesLeft = 0;  // = pas de bump anim pendant lock
    }
    updateSpriteFrame(rt);
    return;
  }

  const inputDir = getInputDirection(heldKeys);

  // Phase 4.4.e : A button interaction. Only when not MOVING (= 1:1 décomp).
  if ((newKeys & A_BUTTON) && gPlayerAvatar.runningState !== MOVING && gPlayerAvatar.turnFramesLeft === 0) {
    tryInteractWithFacingNPC();
    // Don't return — laisse le PlayerStep continuer (= input direction
    // toujours géré). Le décomp wire ensuite vers script-runner.
  }

  // 1:1 décomp `PlayerNotOnBikeCollide` (field_player_avatar.c:994) :
  //   PlayCollisionSoundIfNotFacingWarp(direction);  // = SE_WALL_HIT
  //   PlayerSetAnimId(GetWalkInPlaceSlowMovementAction(direction), COPY_MOVE_WALK);
  //
  // WalkInPlaceSlow = 32 frames cycle (= InitMoveInPlace duration=32). Anim
  // ralentie : sprite alterne walk_a → face → walk_b → face mais sur 32 frames
  // au lieu de 16 (= effet "bump" visual). Position physique inchangée.
  //
  // Tant que user tient direction vers wall + collision encore active, le cycle
  // 32-frame se relance + SE re-played (= re-tap audio à chaque cycle).
  // Le mecanism décomp : `TryInterruptObjectEventSpecialAnim` returns FALSE
  // quand override done → keypad runs → re-collision check → re-PlayerNotOnBikeCollide.
  if (gPlayerAvatar.collideFramesLeft > 0) {
    gPlayerAvatar.collideFramesLeft--;
    if (gPlayerAvatar.collideFramesLeft === 0) {
      // Cycle done. Check if still colliding same direction → re-trigger.
      const inputDir = getInputDirection(heldKeys);
      if (inputDir !== DIR_NONE && inputDir === GetPlayerFacingDirection()) {
        const collision = checkPlayerCollision(inputDir);
        if (collision !== 0) {
          // Re-trigger : SE + new 32 frames + flip walkAnimAlt.
          // 1:1 décomp `PlayerNotOnBikeCollide` (field_player_avatar.c:994) call
          // `PlayCollisionSoundIfNotFacingWarp` qui skip SE si arrow warp / door.
          PlayCollisionSoundIfNotFacingWarp(inputDir);
          gPlayerAvatar.collideFramesLeft = 32;
          gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
          updateSpriteFrame(rt);
          return;
        }
      }
      // Not colliding anymore → fall through to keypad logic (= dispatch new
      // step or NOT_MOVING). runningState reste NOT_MOVING (= jamais set à
      // MOVING pendant collide).
    } else {
      updateSpriteFrame(rt);
      return;  // collide en cours → skip keypad
    }
  }

  // Si une step walk est en cours : tick frames, advance, et finir au tile boundary.
  if (gPlayerAvatar.runningState === MOVING && gPlayerAvatar.stepFramesLeft > 0) {
    gPlayerAvatar.stepFramesLeft--;
    // 1:1 décomp ledge jump : decrement jumpFramesLeft pour suivre la curve
    // sJumpY_High dans updateSpriteFrame.
    if (gPlayerAvatar.jumpFramesLeft > 0) gPlayerAvatar.jumpFramesLeft--;
    if (gPlayerAvatar.stepFramesLeft === 0) {
      // Step complete : update player position en map coords, stop camera.
      // 1:1 décomp `field_player_avatar.c:588-596 CheckMovementInputNotOnBike` :
      // `runningState` n'est PAS reset à NOT_MOVING en fin de step. Il reste
      // MOVING (= état conservé entre frames) jusqu'au prochain keypad check
      // qui le décidera : DIR_NONE → NOT_MOVING, dir != current && !MOVING →
      // TURN_DIRECTION (mais MOVING ici donc skip), else → MOVING (= continuous
      // walk dans nouvelle direction sans pause).
      // → Mid-walk turn = 0 frame de turn anim, walk continu dans new dir.
      // C'est ce qui donne le feel "tournera et continuera a marcher sans pause"
      // de la GBA réelle (cf. user testing session 100).
      // Capture stepDirection AVANT reset à DIR_NONE — utilisé pour
      // `isArrowWarpMetatileBehavior(behavior, direction)` check ci-dessous.
      // Sinon : reset → DIR_NONE → IsArrowWarpMetatileBehavior(SOUTH_ARROW, NONE)
      // = false → walk DOWN sur carpette ne TP pas (= player bloqué).
      const stepDirAtEnd = gPlayerAvatar.stepDirection;
      // 1:1 STRICT décomp `field_player_avatar.c` : PlayerStep ne touche JAMAIS
      // `gSaveBlock1Ptr->pos`. Seul `CameraMove` (= fieldmap.c) mute pos au tile
      // boundary du CameraUpdate. À ce point, pos = post-step (= via CameraMove
      // appliquée durant les 16 frames du step).
      //
      // CRITICAL : lire pos DIRECT depuis `gSaveBlock1Ptr.pos` (= source updated
      // par CameraMove), NON via `gSaveBlock1Ptr.pos.x` getter (= lit slot 0 stale
      // pré-step → circular sync au write). Le slot 0 doit être SYNCED à new
      // pos = post-step value via SyncPlayerObjectEvent ci-dessous.
      const nx = gSaveBlock1Ptr.pos.x;
      const ny = gSaveBlock1Ptr.pos.y;
      // 1:1 décomp ledge jump = 2 tiles total. Step est 32 frames → CameraMove
      // est appelée 2 fois (= 2 tile boundaries) qui appliquent chacune `pos +=
      // delta`. pos est déjà à old + 2 — pas de re-apply ici.
      if (_pendingLedgeJump) {
        _pendingLedgeJump = false;
        // 1:1 décomp `GroundEffect_JumpLandingDust` (event_object_movement.c:7997) :
        // spawn dust cloud à la position d'atterrissage.
        SpawnJumpLandingDust(rt, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
        // 1:1 décomp `MovementAction_Jump2Down_Step1:5535` : `objectEvent->hasShadow
        // = FALSE` au jump end → UpdateShadowFieldEffect détruit le sprite.
        // Notre impl : destroy direct.
        DestroyShadowSprite(rt);
      }
      gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
      gPlayerAvatar.stepDirection = DIR_NONE;
      gFieldCamera.movementSpeedX = 0;
      gFieldCamera.movementSpeedY = 0;
      // Audit session 126 C7 : update currentElevation au step end (= 1:1
      // décomp ObjectEventUpdateElevation appelé après chaque step). Sans
      // ça, currentElevation reste à 3 (= default neutre) → IsElevationMismatchAt
      // ne fire jamais → ledges/staircases pas 1:1.
      const newElev = MapGridGetElevationAt(
        gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
      if (newElev !== 0) gPlayerAvatar.currentElevation = newElev;
      // 1:1 décomp `GetAllGroundEffectFlags_OnFinishStep` (event_object_movement.c
      // :7415) : ObjectEventUpdateMetatileBehaviors(playerObjEvent) au step end
      // pour refresh `currentMetatileBehavior` + `previousMetatileBehavior`.
      // Notre `SyncPlayerObjectEvent` shift coords + update behaviors 1:1.
      SyncPlayerObjectEvent(nx, ny, GetPlayerFacingDirection(), stepDirAtEnd, true);
      // Switch walk anim alt for next step (= alternate walk1/walk2).
      gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
      // 1:1 décomp `RunOnSteppedCallback` (overworld.c:1930) : dispatch
      // active per-step callback at end of each tile step. Triggers ash piles
      // (Route 113), sinking bridges (Fortree/Pacifidlog), ice cracks (Sootopolis),
      // step counter increment + daily flag thresholds.
      void import('./step-callbacks').then(({ DoPerStepCallback }) => {
        DoPerStepCallback();
      });
      // 1:1 décomp `GroundEffect_StepOnTallGrass` (event_object_movement.c:7815) :
      // si player step ON tall grass tile → spawn rustle anim. Trigger au step
      // end (= player vient d'arriver sur la new tile).
      const newTileBehavior = MapGridGetMetatileBehaviorAt(nx + MAP_OFFSET, ny + MAP_OFFSET);
      if (newTileBehavior === MB_TALL_GRASS) {
        SpawnTallGrassEffect(rt, nx, ny);
      }
      // Phase 4.6 : check warp tile au step end. 1:1 décomp `field_control_avatar.c
      // ProcessPlayerFieldInput → TryStartWarpEventScript` qui run après le step.
      // Si player vient de finir step ON un warp tile → set pending warp + freeze.
      // La scene détecte _gPendingWarp dans MainCB2_Overworld et lance la
      // transition asynchrone (= fade + load + spawn). PlayerStep skip son
      // input via `ArePlayerFieldControlsLocked` pendant la transition.
      const warp = getWarpAtPlayerPos();
      if (warp) {
        // 1:1 décomp `TryStartWarpEventScript` (field_control_avatar.c:702) +
        // `IsWarpMetatileBehavior` (line 751) : SEULEMENT door/ladder/escalator/
        // non_anim_door/lavaridge/aqua_hideout/mt_pyre_hole/mossdeep_gym
        // triggent un warp INSTANT à step end. Les ARROW_WARP ne sont PAS dans
        // cette liste → ne triggent PAS au step end.
        //
        // Pour ARROW_WARP, le warp se déclenche via `TryArrowWarp` AU FRAME
        // suivant (= pre-step check au-dessus, ligne ~770), quand player est
        // STILL ON la tile + heldDirection match arrow direction.
        //
        // Cas couvert : player walks DOWN onto carpet (= step end on
        // MB_SOUTH_ARROW_WARP). Step-end check ne trigger PAS (kind='arrow' →
        // skip). Player s'arrête sur la carpette. Pour TP, user doit ré-appuyer
        // DOWN (= TryArrowWarp pre-step check trigger au prochain frame).
        const playerBehavior = MapGridGetMetatileBehaviorAt(
          gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
        const kind = getWarpKindFor(playerBehavior);
        // Skip 'arrow' kind here : géré par pre-step TryArrowWarp.
        if (kind && kind !== 'arrow') {
          console.log(`[player-avatar] stepped onto warp tile (${warp.x},${warp.y}) kind=${kind} stepDir=${stepDirAtEnd} → ${warp.destMap}#${warp.warpId}`);
          setPendingWarp(warp, kind);
          gPlayerAvatar.runningState = NOT_MOVING;  // freeze player
          updateSpriteFrame(rt);
          return;  // skip keypad : don't start new step
        }
        // 'arrow' kind : let player land on tile, TryArrowWarp handles next frame.
      }
      // Phase 4.10 : check coord triggers (= 1:1 décomp `TryRunCoordEventScript`,
      // field_control_avatar.c:733). Si player step end on a coord_event tile
      // qui match VAR_X = value, run le script. Used par truck SetIntroFlags.
      if (TryRunCoordEventScript(gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y)) {
        // Script triggered : freeze player + return (= no keypad).
        updateSpriteFrame(rt);
        return;
      }
      // ↓ NOTE : pas de `return` — fall through au keypad logic ci-dessous.
      // Si direction held → start new step (= continuous walk).
      // Si DIR_NONE → keypad set runningState = NOT_MOVING (= step graceful end).
    } else {
      updateSpriteFrame(rt);
      return;  // step pas fini → skip keypad
    }
  }

  // 1:1 décomp `TryInterruptObjectEventSpecialAnim` (field_player_avatar.c:353) :
  // Pendant une anim WalkInPlaceFast (= TURN_DIRECTION), le keypad logic est
  // BLOQUÉ. Le user voit le sprite tourner pendant 8 frames sans pouvoir
  // walker pendant ce temps. C'est ce qui permet le "tap-to-turn" :
  //   - Tap nouvelle direction → 8 frames de turn anim, puis NOT_MOVING.
  //   - Hold nouvelle direction → 8 frames turn anim, puis MOVING.
  //   - Hold/tap MÊME direction → MOVING immédiat (pas de turn anim).
  if (gPlayerAvatar.runningState === TURN_DIRECTION && gPlayerAvatar.turnFramesLeft > 0) {
    gPlayerAvatar.turnFramesLeft--;
    if (gPlayerAvatar.turnFramesLeft === 0) {
      // Anim done MAINTENANT (= 1:1 décomp ObjectEventClearHeldMovementIfFinished
      // returns TRUE et TryInterrupt returns FALSE same-frame). Fall through
      // au keypad logic : si input tjrs held même direction → MOVING dans
      // CETTE frame. Avant on returnait ici → 1 frame de delay extra.
      gPlayerAvatar.runningState = NOT_MOVING;
      updateSpriteFrame(rt);
      // Ne pas return, continue au keypad check ci-dessous.
    } else {
      updateSpriteFrame(rt);
      return;  // skip keypad pendant l'anim
    }
  }

  // 1:1 décomp `CheckMovementInputNotOnBike` (field_player_avatar.c:588-596) :
  //   if (direction == DIR_NONE) → NOT_MOVING
  //   else if (direction != currentDir && runningState != MOVING) → TURN_DIRECTION
  //   else → MOVING
  //
  // Le check `runningState != MOVING` est CRUCIAL : si on vient de finir un
  // step (= runningState reste MOVING via le bloc step ci-dessus), on tombe
  // direct sur MOVING dans la nouvelle direction → continuous walk sans turn anim.
  // Sinon (NOT_MOVING ou TURN_DIRECTION), on fait l'anim TURN_DIRECTION 8 frames.

  if (inputDir === DIR_NONE) {
    gPlayerAvatar.runningState = NOT_MOVING;
    updateSpriteFrame(rt);
    return;
  }

  if (inputDir !== GetPlayerFacingDirection() && gPlayerAvatar.runningState !== MOVING) {
    // 1:1 décomp `PlayerNotOnBikeTurningInPlace` → `PlayerTurnInPlace` →
    // `GetWalkInPlaceFastMovementAction` (= 8-frame anim).
    // Pendant 8 frames : user voit sprite tourner, keypad bloqué (cf.
    // TryInterruptObjectEventSpecialAnim qui returns TRUE car heldMovementId
    // n'est PAS dans la slow range = 0x19..0x1C).
    // Si user release → reste turné. Si user hold même direction → MOVING
    // après les 8 frames.
    SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], inputDir);
    gPlayerAvatar.runningState = TURN_DIRECTION;
    gPlayerAvatar.turnFramesLeft = 8;  // 1:1 décomp WalkInPlaceFast duration
    updateSpriteFrame(rt);
    return;
  }

  // 1:1 décomp `TryArrowWarp` (field_control_avatar.c:688) — check BEFORE walk
  // step. Si player on MB_*_ARROW_WARP tile + intended direction matches arrow
  // direction → trigger warp INSTEAD of walking.
  //
  // Cas couvert : player on carpet faces UP, presses DOWN. Turn 8 frames done,
  // facing now SOUTH. Sans ce check, walk step DOWN se lance → player walks
  // off carpet → step end check trigger pas (= player no longer on warp tile).
  // Avec ce check, warp triggers BEFORE walking, player still on carpet.
  //
  // Décomp note : TryArrowWarp s'exécute dans ProcessPlayerFieldInput chaque
  // frame, AVANT le step movement. C'est ici l'équivalent.
  {
    const playerBehavior = MapGridGetMetatileBehaviorAt(
      gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
    if (isArrowWarpMetatileBehavior(playerBehavior, inputDir)) {
      const warp = findWarpEventAt(gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
      if (warp) {
        console.log(`[player-avatar] TryArrowWarp at (${gSaveBlock1Ptr.pos.x},${gSaveBlock1Ptr.pos.y}) dir=${inputDir} → ${warp.destMap}#${warp.warpId}`);
        setPendingWarp(warp, 'arrow');
        SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], inputDir);
        gPlayerAvatar.runningState = NOT_MOVING;
        updateSpriteFrame(rt);
        return;
      }
    }
  }

  // MOVING dispatch : facing match (= réactif) OR mid-walk turn (= continuous).
  // 1:1 décomp `PlayerNotOnBikeMoving` : update facing first, puis check collision.
  SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], inputDir);
  const collision = checkPlayerCollision(inputDir);
  if (collision !== COLLISION_NONE) {
    // 1:1 décomp `PlayerNotOnBikeMoving` line 614-618 : COLLISION_LEDGE_JUMP →
    // PlayerJumpLedge(direction) (= SE_LEDGE + jump anim 16 frames). Check
    // AVANT le bump car le ledge tile a `MapGridGetCollisionAt > 0` mais le
    // ShouldJumpLedge return TRUE → COLLISION_LEDGE_JUMP override.
    if (collision === COLLISION_LEDGE_JUMP) {
      // 1:1 décomp `PlayerJumpLedge` (field_player_avatar.c:1015) :
      //   PlaySE(SE_LEDGE);
      //   PlayerSetAnimId(GetJump2MovementAction(direction), COPY_MOVE_JUMP2);
      // Le MovementAction_Jump2_X (= event_object_movement.c:5525) utilise
      // InitJumpRegular(JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH) → 32-frame anim avec
      // sJumpY_High curve (= peak -12 px à mid-jump). Walks 2 tiles dans la dir.
      // Notre impl : stepFramesLeft = 32 (= durée jump), jumpFramesLeft = 32
      // (= sync compteur pour sprite y2 arc via getJumpYOffset dans updateSpriteFrame).
      PlaySE(SE_LEDGE);
      gPlayerAvatar.runningState = MOVING;
      gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
      gPlayerAvatar.stepFramesLeft = 32;
      gPlayerAvatar.jumpFramesLeft = 32;  // = sJumpY_High curve over 32 frames
      gPlayerAvatar.stepDirection = inputDir;
      _pendingLedgeJump = true;  // = step end appliquera 2nd moveCoords (= 2 tiles)
      // 1:1 décomp `InitJumpRegular` → `DoShadowFieldEffect` (event_object_movement.c:5450) :
      // spawn shadow sous player AU START du jump. Shadow tracks player x,y mais
      // sans le jumpYOffset → reste au sol pendant l'arc visuel.
      CreateShadowSprite(rt);
      const jumpSpeed = dirToCameraSpeed(inputDir);
      // Speed × 2 pour 2 tiles en 32 frames (= 1 tile per 16 frames standard).
      gFieldCamera.movementSpeedX = jumpSpeed.x * WALK_SPEED_PX_PER_FRAME;
      gFieldCamera.movementSpeedY = jumpSpeed.y * WALK_SPEED_PX_PER_FRAME;
      updateSpriteFrame(rt);
      return;
    }

    // 1:1 décomp `TryDoorWarp` (field_control_avatar.c:833) : si player face
    // NORTH + tile en face = MB_ANIMATED_DOOR + warp event match → DoDoorWarp.
    // Check AVANT le bump anim car le door tile est marqué impassable mais
    // le push UP doit warp pas bump.
    if (inputDir === DIR_NORTH) {
      const { x: dx, y: dy } = moveCoords(inputDir, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
      const behavior = MapGridGetMetatileBehaviorAt(dx + MAP_OFFSET, dy + MAP_OFFSET);
      const kind = getWarpKindFor(behavior);
      if (kind === 'door') {
        const doorWarp = findWarpEventAt(dx, dy);
        if (doorWarp) {
          console.log(`[player-avatar] door warp at (${dx},${dy}) → ${doorWarp.destMap}#${doorWarp.warpId}`);
          setPendingWarp(doorWarp, kind);
          gPlayerAvatar.runningState = NOT_MOVING;
          updateSpriteFrame(rt);
          return;
        }
      }
    }

    // 1:1 décomp `PlayerNotOnBikeCollide` (field_player_avatar.c:994) :
    //   1. PlayCollisionSoundIfNotFacingWarp(direction) → PlaySE(SE_WALL_HIT)
    //      sauf si direction face une warp door OU player sur arrow warp.
    //   2. PlayerSetAnimId(GetWalkInPlaceSlowMovementAction) → 32-frame slow
    //      walk-in-place anim (= "bump" visual avec sprite alternance ralentie).
    //
    // Position physique inchangée (= player reste sur sa cellule). Le user voit
    // sprite jolt vers le mur puis reset, et entend SE_WALL_HIT à chaque cycle
    // (sauf si arrow warp / door où no SE = comportement 1:1 décomp).
    PlayCollisionSoundIfNotFacingWarp(inputDir);
    gPlayerAvatar.runningState = NOT_MOVING;
    gPlayerAvatar.collideFramesLeft = 32;
    updateSpriteFrame(rt);
    return;
  }

  // 1:1 décomp `PlayerWalkNormal` / `PlayerRun` (field_player_avatar.c:641-651) :
  //   if (!UNDERWATER && (heldKeys & B_BUTTON) && FlagGet(FLAG_SYS_B_DASH)
  //       && !IsRunningDisallowed(metatileBehavior))
  //       PlayerRun(direction);  // = MOVEMENT_ACTION_PLAYER_RUN_* = 8-frame step à 2 px/frame
  //   else
  //       PlayerWalkNormal(direction);  // = MOVEMENT_ACTION_WALK_NORMAL_* = 16-frame step à 1 px/frame
  const playerBehavior = MapGridGetMetatileBehaviorAt(
    gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
  const wantDash = (heldKeys & B_BUTTON) !== 0
                && FlagGet('FLAG_SYS_B_DASH')
                && !IsRunningDisallowed(playerBehavior);
  gPlayerAvatar.dashing = wantDash;
  // 1:1 décomp `sPicTable_BrendanNormal[0..8 walk, 9..17 run]` preloaded au boot.
  // updateSpriteFrame applique `RUN_FRAME_OFFSET` quand dashing=true → utilise
  // les running frames (= sprite course distinct). Pas de VRAM swap nécessaire.
  gPlayerAvatar.runningState = MOVING;
  gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
  // Dash : 8 frames step à 2 px/frame = 16 px = 1 metatile (= 2× plus rapide).
  // Walk : 16 frames step à 1 px/frame = 16 px = 1 metatile.
  gPlayerAvatar.stepFramesLeft = wantDash ? 8 : 16;
  gPlayerAvatar.stepDirection = inputDir;
  // 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081) appelée
  // par `MovementAction_WalkNormal*_Step0` au start du player walk :
  //   x = objEvent->currentCoords.x; y = objEvent->currentCoords.y;
  //   SetObjectEventDirection(objEvent, dir);  ← facing + movementDirection
  //   MoveCoords(direction, &x, &y);            ← x,y = post-step
  //   ShiftObjectEventCoords(objEvent, x, y);  ← previousCoords=current, current=post-step
  //   ...
  //   objectEvent->triggerGroundEffectsOnMove = TRUE;
  //
  // Le décomp update slot 0 currentCoords IMMEDIATEMENT au step start. Pas
  // mid-step. Notre TS port 1:1 strict : pareil. Sans ça, mid-step lectures
  // de slot 0 (= collision, events, scripts) voient pre-step → divergent
  // décomp. Aussi : event scripts firing mid-step (= coordEvents trigger
  // quand player walk sur tile) attendent slot 0 = new tile dès Step0.
  {
    const playerSlot = gPlayerAvatar.objectEventId;
    const slot = gObjectEvents[playerSlot];
    if (slot && slot.active && slot.isPlayer) {
      const stepDx = (inputDir === DIR_WEST ? -1 : inputDir === DIR_EAST ? 1 : 0);
      const stepDy = (inputDir === DIR_NORTH ? -1 : inputDir === DIR_SOUTH ? 1 : 0);
      slot.previousCoordsX = slot.currentCoordsX;
      slot.previousCoordsY = slot.currentCoordsY;
      slot.currentCoordsX += stepDx;
      slot.currentCoordsY += stepDy;
      slot.movementDirection = inputDir;
      slot.facingDirection = inputDir;
      slot.triggerGroundEffectsOnMove = true;
      ObjectEventUpdateMetatileBehaviors(slot);
    }
  }
  const speed = dirToCameraSpeed(inputDir);
  const speedMult = wantDash ? 2 : 1;
  gFieldCamera.movementSpeedX = speed.x * WALK_SPEED_PX_PER_FRAME * speedMult;
  gFieldCamera.movementSpeedY = speed.y * WALK_SPEED_PX_PER_FRAME * speedMult;
  updateSpriteFrame(rt);
}

/** Reset le player avatar (= cleanup OAM + state). À call lors d'un map switch.
 *  Phase 4.6 (warps) wirera ça. */
export function DestroyPlayerAvatar(rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;
  const sprite = rt.gSprites.get(gPlayerAvatar.spriteId);
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  gPlayerAvatar.spriteId = -1;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
}

/** 1:1 décomp `SetPlayerVisibility` (field_player_avatar.c).
 *  Utilisé par Task_ExitDoor / Task_ExitNonAnimDoor pour cacher le sprite player
 *  pendant fade-in (= sprite respawné post-warp avec son default facing avant
 *  que le walk-down dispatch ne prenne effet). Appelé `false` avant fade-in,
 *  `true` après fade-in done juste avant le walk-down forceMovement. */
export function SetPlayerVisibility(rt: DecompRuntime, visible: boolean): void {
  if (gPlayerAvatar.spriteId < 0) return;
  rt.setSpriteInvisible(gPlayerAvatar.spriteId, !visible);
}

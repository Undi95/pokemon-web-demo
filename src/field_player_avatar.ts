/**
 * field_player_avatar.ts — moteur du player avatar overworld, miroir 1:1 de
 * `field_player_avatar.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_player_avatar.c`
 *     (PlayerStep + MovePlayerNotOnBike + ForcedMovement_* + leaf actions +
 *      DoPlayerAvatarTransition + surf/Strength/Task_Fishing)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h`
 *     (struct PlayerAvatar + enums NOT_MOVING/TURN_DIRECTION/MOVING)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (timings de pas, cycles d'anim sprite)
 *
 * Couches portées 1:1 (détail : docs/FIELD-PLAYER-AVATAR-1TO1-PLAN.md) :
 * input/mouvement (PlayerStep, TryInterruptObjectEventSpecialAnim,
 * MovePlayerNotOnBike), forced movement (glace/courants/slides/pente),
 * transitions d'état (DoPlayerAvatarTransition), features (montée/démontage
 * surf, boulder Strength, pêche complète, keystone ObjectEventSetGraphicsId).
 *
 * ⚠️ Déviations M3 ASSUMÉES (= pourquoi ce fichier n'est PAS `#100% done` et
 * ne le sera jamais) : le sprite joueur est UNIFIÉ au slot object-event
 * (positionné en coords-monde par UpdateObjectEvents, animé par le système
 * partagé) au lieu du DMA-par-frame GBA. Adaptateurs harness localisés :
 * chargement VRAM async (InitPlayerAvatar + pngTo1dObjLayout + snapshot/restore
 * gfx), cycle de vie sprite (DestroyPlayerAvatar / SetPlayerVisibility).
 */
import type { DecompRuntime, DecompTask } from '../harness/runtime/decomp-runtime';
import { loadIndexedPngStrict, extractPngPlte } from '../harness/gba/png-loader';
import {
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  MapGridGetElevationAt,
  MAP_OFFSET,
} from './fieldmap';
import { MB_TALL_GRASS } from './engine/field/tilemap-loader';
import {
  type ObjectEvent,
  InitPlayerObjectEvent, PLAYER_OBJECT_EVENT_SLOT, SyncPlayerObjectEvent, gObjectEvents,
  ObjectEventSetHeldMovement,
  ObjectEventClearHeldMovementIfActive,
  ObjectEventClearHeldMovementIfFinished,
  ObjectEventClearHeldMovement,
  ObjectEventGetHeldMovementActionId,
  ObjectEventCheckHeldMovementStatus,
  ObjectEventForceSetHeldMovement,
  CameraObjectFreeze,
  CameraObjectReset,
  ObjectEventIsHeldMovementActive,
  ObjectEventIsMovementOverridden,
  GetWalkNormalMovementAction,
  GetWalkFastMovementAction,
  GetRideWaterCurrentMovementAction,
  GetPlayerRunMovementAction,
  GetJump2MovementAction,
  GetJumpSpecialMovementAction,
  GetWalkInPlaceFastMovementAction,
  GetWalkInPlaceSlowMovementAction,
  GetWalkInPlaceNormalMovementAction,
  GetWalkFasterMovementAction,
  GetJumpInPlaceTurnAroundMovementAction,
  GetAcroWheelieFaceDirectionMovementAction,
  GetAcroPopWheelieFaceDirectionMovementAction,
  GetAcroEndWheelieFaceDirectionMovementAction,
  GetAcroWheelieHopFaceDirectionMovementAction,
  GetAcroWheelieHopDirectionMovementAction,
  GetAcroWheelieJumpDirectionMovementAction,
  GetAcroWheelieInPlaceDirectionMovementAction,
  GetAcroPopWheelieMoveDirectionMovementAction,
  GetAcroWheelieMoveDirectionMovementAction,
  GetAcroEndWheelieMoveDirectionMovementAction,
  ObjectEventSetGraphicsId,
  PreloadObjectEventGraphics,
  _setPlayerNormalGfxSnapshot,
  GetFishingDirectionAnimNum,
  GetFishingBiteDirectionAnimNum,
  GetFishingNoCatchDirectionAnimNum,
  ObjectEventTurn,
  FreezeObjectEvents,
  UnfreezeObjectEvents,
  GetCollisionAtCoords as _GetCollisionAtCoords,
  GetObjectEventIdByXY,
  GetObjectEventIdByPosition,
  SetObjectEventDirection,
  DoShadowFieldEffect,
  OBJECT_EVENTS_COUNT,
  ELEVATION_DEFAULT,
  IsMetatileDirectionallyImpassable,
} from './event_object_movement';
import {
  gFieldCamera,
  SetCameraTopLeftCoords,
  GetCameraTopLeftCoords,
  GetCameraPanX,
  GetCameraPanY,
  SetSpritePosToMapCoords,
  gTotalCamera,
} from './field_camera';
import {
  ArePlayerFieldControlsLocked,
  LockPlayerFieldControls,
  UnlockPlayerFieldControls,
} from './engine/script/script-runtime';
// Musique surf (stop) : on PILOTE la lecture existante, on ne modifie pas l'engine son.
import { Overworld_ClearSavedMusic, Overworld_PlaySpecialMapMusic } from './overworld';
import { FlagGet } from './engine/script/script-vars';
import { B_BUTTON } from './engine/ui/gba-menu-system';
import { GetFaceDirectionAnimNum, GetAcroWheelieDirectionAnimNum } from './engine/field/direction-coords';
import {
  GetPlayerSpeed, Bike_UpdateBikeCounterSpeed, Bike_TryAcroBikeHistoryUpdate,
  BikeClearState, Bike_HandleBumpySlopeJump, MovePlayerOnBike, GetOnOffBike,
} from './bike';
// Re-export pour le sac (bag-menu-ctx précharge la gfx vélo via _playerAvatarMod avant GetOnOffBike).
export { PreloadObjectEventGraphics };
import { build_sPicTable_BrendanNormal, build_sPicTable_MayNormal } from './engine/field/object-event-graphics-info-data';
import { sAnimTable_BrendanMayNormal } from './engine/field/object-event-anims-data';
import {
  COPY_MOVE_WALK, COPY_MOVE_FACE, COPY_MOVE_JUMP2,
  MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_WALK_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,
  MOVEMENT_ACTION_DELAY_1, MOVEMENT_ACTION_DELAY_16,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT,
  ANIM_FIELD_MOVE,
} from './engine/decomp-data/include/constants/event_object_movement-data';
import {
  GetFaceDirectionMovementAction,
  CreateTask, DestroyTask,
  GetWalkSlowMovementAction,
} from '../harness/runtime/decomp-bridge';
import { FindTaskIdByFunc, GetTask, getRuntime, FuncIsActiveTask } from '../harness/runtime/decomp-globals';
import { FieldEffectStart, gFieldEffectArguments, FLDEFF_DUST } from './field_effect';
import {
  SetSurfBlob_BobState, SetSurfBlob_PlayerOffset,
  preloadWarpArrowEffect,
  CreateWarpArrowSprite as _CreateWarpArrowSprite,
  ShowWarpArrowSprite as _ShowWarpArrowSprite,
  SetSpriteInvisible as _SetSpriteInvisible,
} from './field_effect_helpers';
import { gPlayerParty, GetMonData, MonKnowsMove, MON_DATA_SPECIES, MON_DATA_SANITY_IS_EGG } from './engine/battle/party-storage';
import { MOVE_SURF } from './engine/decomp-data/include/constants/moves-data';
// ─── Pêche (Task_Fishing) : combat + texte/fenêtre + anim ───
import { DoesCurrentMapHaveFishingMons, FishingWildEncounter } from './wild_encounter';
import {
  AddWindow, ClearDialogWindowAndFrame, DrawDialogueFrame, FillWindowPixelBuffer,
  CopyWindowToVram, PutWindowTilemap, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
} from './engine/ui/gba-window-system';
import { LoadMessageBoxGfx } from './text_window';
import {
  AddTextPrinterParameterized, AddTextPrinterParameterized2, RunTextPrinters, IsTextPrinterActive,
} from './engine/ui/gba-text-system';
import { getString } from './engine/ui/gba-strings';
import { Random as _RandomFishing } from './random';
import {
  FONT_NORMAL, PIXEL_FILL, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY,
} from './engine/battle/battle-windows';
import { IsRunningDisallowed } from './bike';
import {
  MetatileBehavior_IsBumpySlope,
  MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsIsolatedHorizontalRail,
  MetatileBehavior_IsVerticalRail,
  MetatileBehavior_IsHorizontalRail,
  MetatileBehavior_IsNonAnimDoor,
  // 1:1 décomp `sForcedMovementTestFuncs[]` (field_player_avatar.c:144) — étape 3.
  MetatileBehavior_IsTrickHouseSlipperyFloor,
  MetatileBehavior_IsIce_2,
  MetatileBehavior_IsWalkSouth,
  MetatileBehavior_IsWalkNorth,
  MetatileBehavior_IsWalkWest,
  MetatileBehavior_IsWalkEast,
  MetatileBehavior_IsSouthwardCurrent,
  MetatileBehavior_IsNorthwardCurrent,
  MetatileBehavior_IsWestwardCurrent,
  MetatileBehavior_IsEastwardCurrent,
  MetatileBehavior_IsSlideSouth,
  MetatileBehavior_IsSlideNorth,
  MetatileBehavior_IsSlideWest,
  MetatileBehavior_IsSlideEast,
  MetatileBehavior_IsWaterfall,
  MetatileBehavior_IsSecretBaseJumpMat,
  MetatileBehavior_IsSecretBaseSpinMat,
  MetatileBehavior_IsMuddySlope,
  MetatileBehavior_IsSurfableFishableWater,
  MetatileBehavior_IsSurfableWaterOrUnderwater,
  MetatileBehavior_IsBridgeOverWaterNoEdge,
  MetatileBehavior_IsJumpSouth, MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpWest, MetatileBehavior_IsJumpEast,
  // 1:1 décomp `sArrowWarpMetatileBehaviorChecks2[]` (field_player_avatar.c:294) — HideShowWarpArrow.
  MetatileBehavior_IsSouthArrowWarp, MetatileBehavior_IsNorthArrowWarp,
  MetatileBehavior_IsWestArrowWarp, MetatileBehavior_IsEastArrowWarp,
} from './metatile_behavior';
import { CheckStandardWildEncounter } from './wild_encounter';
import {
  CheckForRotatingGatePuzzleCollision,
  CheckForRotatingGatePuzzleCollisionWithoutAnimation,
} from './rotating_gate';
import { PlaySE } from '../harness/runtime/decomp-globals';
import {
  LoadSpriteSheet, LoadSpritePalette,
  setReservedSpriteTileCount,
  setReservedSpritePaletteCount as setReservedSpritePaletteCount_helper,
  DestroySprite,
} from './sprite';
import { SE_WALL_HIT, SE_LEDGE, SE_BIKE_HOP } from './engine/decomp-data/include/constants/songs-data';
import {
  getWarpKindFor,
  isArrowWarpMetatileBehavior,
} from './engine/field/warp-system';
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
} from './engine/field/direction-coords';
// 1:1 décomp `include/constants/game_stat.h` enum values.
import { GAME_STAT_JUMPED_DOWN_LEDGES, NUM_USED_GAME_STATS } from './engine/decomp-data/include/constants/game_stat-data';
import {
  OBJ_EVENT_GFX_PUSHABLE_BOULDER,
  OBJ_EVENT_GFX_BRENDAN_NORMAL, OBJ_EVENT_GFX_BRENDAN_MACH_BIKE, OBJ_EVENT_GFX_BRENDAN_ACRO_BIKE,
  OBJ_EVENT_GFX_BRENDAN_SURFING, OBJ_EVENT_GFX_BRENDAN_UNDERWATER,
  OBJ_EVENT_GFX_MAY_NORMAL, OBJ_EVENT_GFX_MAY_MACH_BIKE, OBJ_EVENT_GFX_MAY_ACRO_BIKE,
  OBJ_EVENT_GFX_MAY_SURFING, OBJ_EVENT_GFX_MAY_UNDERWATER,
} from './engine/decomp-data/include/constants/event_objects-data';
import { NUM_ACRO_BIKE_COLLISIONS } from './engine/decomp-data/src/field_player_avatar-data';
// 1:1 décomp `gSaveBlock1/2Ptr` (= pointers EWRAM, global.h:990). Source unique
// dans le module Foundation `save-block-state.ts` (= permet l'import direct
// depuis player-avatar sans tirer la chaîne lourde de gba-menu-system).
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
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

/** 1:1 STRICT décomp `IsPlayerSurfingNorth` (field_player_avatar.c) :
 *    if (GetPlayerMovementDirection() == DIR_NORTH && TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING))
 *        return TRUE;
 *    else
 *        return FALSE;
 *
 *  Gate de l'entrée HM Cascade : on grimpe une cascade uniquement en surfant VERS LE NORD
 *  (face à la tuile MB_WATERFALL). Utilisé par `GetInteractedWaterScript`. */
export function IsPlayerSurfingNorth(): boolean {
  return GetPlayerMovementDirection() === DIR_NORTH
    && TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING) !== 0;
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

/** 1:1 STRICT décomp `PartyHasMonWithSurf` (field_player_avatar.c:1280) :
 *    if (!TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING))
 *        for (i = 0; i < PARTY_SIZE; i++) {
 *            if (GetMonData(&gPlayerParty[i], MON_DATA_SPECIES) == SPECIES_NONE) break;
 *            if (MonKnowsMove(&gPlayerParty[i], MOVE_SURF)) return TRUE;
 *        }
 *    return FALSE;
 *  Gate de l'entrée HM Surf (cf. GetInteractedWaterScript). */
export function PartyHasMonWithSurf(): boolean {
  if (!(gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)) {
    for (let i = 0; i < 6; i++) {  // PARTY_SIZE
      if (!GetMonData(gPlayerParty[i], MON_DATA_SPECIES)) break;  // SPECIES_NONE = fin party
      if (MonKnowsMove(gPlayerParty[i], MOVE_SURF)) return true;
    }
  }
  return false;
}

/** 1:1 STRICT décomp `IsPlayerFacingSurfableFishableWater` (field_player_avatar.c:1305) :
 *    p = &gObjectEvents[gPlayerAvatar.objectEventId]; x = p->currentCoords.x; y = p->currentCoords.y;
 *    MoveCoords(p->facingDirection, &x, &y);
 *    if (GetCollisionAtCoords(p, x, y, p->facingDirection) == COLLISION_ELEVATION_MISMATCH
 *     && PlayerGetElevation() == ELEVATION_DEFAULT
 *     && MetatileBehavior_IsSurfableFishableWater(MapGridGetMetatileBehaviorAt(x, y))) return TRUE;
 *    return FALSE; */
export function IsPlayerFacingSurfableFishableWater(): boolean {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  const { x, y } = MoveCoords(playerObjEvent.facingDirection, playerObjEvent.currentCoordsX, playerObjEvent.currentCoordsY);
  return _GetCollisionAtCoords(playerObjEvent, x, y, playerObjEvent.facingDirection) === COLLISION_ELEVATION_MISMATCH
    && PlayerGetElevation() === ELEVATION_DEFAULT
    && MetatileBehavior_IsSurfableFishableWater(MapGridGetMetatileBehaviorAt(x, y));
}

/** 1:1 STRICT décomp `GetPlayerAvatarSpriteId(void)` (field_player_avatar.c) :
 *    return gPlayerAvatar.spriteId; */
export function GetPlayerAvatarSpriteId(): number {
  return gPlayerAvatar.spriteId;
}

// Dev hooks (A/B entrée HM surf : les 2 portes de GetInteractedWaterScript).
(globalThis as Record<string, unknown>).__PartyHasMonWithSurf = PartyHasMonWithSurf;
(globalThis as Record<string, unknown>).__IsPlayerFacingSurfableFishableWater = IsPlayerFacingSurfableFishableWater;
(globalThis as Record<string, unknown>).__CanFish = () => CanFish();
// Lu par le party-menu (DisplayCantUseSurfMessage) sans import statique (anti-cycle ESM).
(globalThis as Record<string, unknown>).__TestPlayerAvatarFlags = (f: number) => TestPlayerAvatarFlags(f);

/** 1:1 STRICT décomp `CanFish(void)` (item_use.c:236) : peut-on pêcher là où on regarde ?
 *    GetXYCoordsOneStepInFrontOfPlayer(&x, &y); tileBehavior = MapGridGetMetatileBehaviorAt(x, y);
 *    if (IsWaterfall) return FALSE;
 *    if (UNDERWATER) return FALSE;
 *    if (!SURFING) { if (IsPlayerFacingSurfableFishableWater()) return TRUE; }
 *    else { if (IsSurfableWaterOrUnderwater && MapGridGetCollisionAt==0) return TRUE; if (IsBridgeOverWaterNoEdge) return TRUE; }
 *    return FALSE;
 *  Gate de `ItemUseOutOfBattle_Rod` (canne → StartFishing). */
export function CanFish(): boolean {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  const tileBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MetatileBehavior_IsWaterfall(tileBehavior)) return false;
  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_UNDERWATER) return false;
  if (!(gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)) {
    if (IsPlayerFacingSurfableFishableWater()) return true;
  } else {
    if (MetatileBehavior_IsSurfableWaterOrUnderwater(tileBehavior) && MapGridGetCollisionAt(x, y) === 0) return true;
    if (MetatileBehavior_IsBridgeOverWaterNoEdge(tileBehavior)) return true;
  }
  return false;
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
  // 1:1 décomp : `preventStep` est reset à FALSE au map-load par `ClearPlayerAvatarInfo`
  // (event_object_movement.c ResetObjectEvents). Le port n'appelle pas ClearPlayerAvatarInfo
  // sur les warps inter-map → on le reset ICI, où InitPlayerAvatar fait déjà les autres
  // resets transitoires de ClearPlayerAvatarInfo (runningState/tileTransitionState/stepFramesLeft…).
  // Sans ça, un warp déclenché alors que preventStep=TRUE (= HM Dive : DiveFieldEffect_Init le
  // pose) laissait le joueur GELÉ à l'arrivée (ProcessPlayerFieldInput tournait mais PlayerStep
  // bloqué). Vérifié en jeu : dive → underwater → émersion, joueur re-mobile aux 2 bouts.
  gPlayerAvatar.preventStep = false;
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

  // ─── [M3] Unification sprite joueur ↔ slot object-event (vrai 1:1 décomp) ───
  // 1:1 décomp `InitPlayerAvatar` (field_player_avatar.c:1391) :
  //   `gPlayerAvatar.spriteId = objectEvent->spriteId;`
  // = le sprite joueur EST le sprite du slot (gObjectEvents[objectEventId]). On câble
  // donc `images`+`anims`+`usingSheet=FALSE` (= flow 1:1 strict CreateSprite/TrySetupObjectEventSprite)
  // et on rend le SLOT propriétaire (`slot.spriteId = gPlayerAvatar.spriteId`). À partir de là :
  //   - `UpdateObjectEvents` positionne le sprite (sprite.x=worldX) — comme tout NPC ;
  //   - `tickSpriteAnims`→`AnimateSprite` anime via les MovementActions (held WalkNormal/PlayerRun/
  //     Jump2/WalkInPlace posés par PlayerStep) + DMA frame→tiles 0-7 ;
  //   - l'arc de saut sort de `_DoJumpSpriteMovement` (sprite.y2), plus de updateSpriteFrame.
  // Le sprite garde sa VRAM préchargée (18 frames, tiles 0-143) ; AnimateSprite recopie la
  // frame courante dans les tiles 0-7 (tileBase=0) → oam.tileId reste 0. La réservation VRAM/
  // palette (bag/menu) est INCHANGÉE.
  const playerImages = gender === 'FEMALE'
    ? build_sPicTable_MayNormal(walkingReordered, runningReordered)
    : build_sPicTable_BrendanNormal(walkingReordered, runningReordered);
  if (gPlayerAvatar.spriteId >= 0) {
    const sprite = rt.gSprites[gPlayerAvatar.spriteId];
    if (sprite) {
      // 1:1 décomp TrySetupObjectEventSprite : sprite->images = graphicsInfo->images ;
      // sprite->anims = template->anims ; usingSheet = FALSE.
      sprite.images = playerImages as unknown as typeof sprite.images;
      sprite.anims = sAnimTable_BrendanMayNormal as unknown as typeof sprite.anims;
      sprite.usingSheet = false;
      sprite.sheetTileStart = 0;
      sprite.tileBase = PLAYER_OBJ_TILE_START;
      // 1:1 décomp : centerToCornerVec depuis graphicsInfo (16×32 → -8,-16). Déjà posé par
      // CreateSpriteAtOam (CalcCenterToCornerVec) mais explicite pour parité NPC.
      sprite.centerToCornerVecX = -(16 >> 1);
      sprite.centerToCornerVecY = -(32 >> 1);
      // 1:1 décomp event_object_movement.c:1470-1471 : StartSpriteAnim(GetFaceDirectionAnimNum).
      sprite.animNum = GetFaceDirectionAnimNum(direction);
      sprite.animBeginning = true;
      sprite.animEnded = false;
      sprite.animCmdIndex = 0;
      sprite.animDelayCounter = 0;
      sprite.animPaused = false;
      // oam.tileId = tileBase (= 0) : AnimateSprite DMA la frame courante dans les tiles 0-7.
      rt.gba.oam[result.oamIndex].tileId = PLAYER_OBJ_TILE_START;
      // [Déviation M3] Snapshot de l'état de rendu NORMAL (feuille combinée walking+running réservée)
      // pour que `ObjectEventSetGraphicsId(player, NORMAL)` (= démontage surf/vélo/...) RESTAURE le joueur
      // sans réallouer (les tiles 0..143 sont réservées, jamais libérées). 1:1 décomp : ObjectEventSetGraphicsId
      // repointe sprite->images vers la table ROM du gfx ; ici NORMAL = la feuille combinée → repoint depuis ce snapshot.
      _setPlayerNormalGfxSnapshot({
        graphicsId: GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_STATE_NORMAL, gender),
        images: sprite.images,
        anims: sprite.anims,
        palette: walkingPng.palette,
        tileBase: PLAYER_OBJ_TILE_START,
        shape: 2, size: 2,             // 16×32 (tall)
        priority: 2,
        centerToCornerVecX: -(16 >> 1),
        centerToCornerVecY: -(32 >> 1),
        y2: sprite.y2,
      });
    }
  }
  // 1:1 décomp `gPlayerAvatar.spriteId = objectEvent->spriteId` → ici le slot POSSÈDE le
  // sprite (lien inverse). UpdateObjectEvents (skip si spriteId<0) gère désormais le joueur.
  gObjectEvents[gPlayerAvatar.objectEventId].spriteId = result.spriteId;

  // Set camera focus = player position. 1:1 décomp `gSaveBlock1Ptr->pos = (mapX, mapY)`
  // en LOGICAL coords. Player drawn at view (7, 7) (= MAP_OFFSET, MAP_OFFSET) avec
  // BG_VOFS=40 (= sVerticalCameraPan=32 + 8) → visible window starts at metatile row 2.5,
  // player visible at row 4.5 (= centered). 1:1 décomp.
  SetCameraTopLeftCoords(mapX, mapY);

  // [M3-C2] Init player worldX/Y comme un object event (1:1 décomp : le player
  // object event est pose par SetSpritePosToMapCoords au spawn, comme tout NPC).
  // Le sprite suit ensuite la camera via coordOffsetEnabled (updateSpriteFrame),
  // et worldX/Y avancent de dx/dy au walk (movement-system). Convention NPC :
  // worldX = destX + 8 (demi-tuile), worldY = destY. Au spawn (offX=0, fcX=0)
  // -> worldX=120, worldY=112 -> oam 112/56 = position centree identique.
  const playerSlot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (playerSlot) {
    const sp = SetSpritePosToMapCoords(playerSlot.currentCoordsX, playerSlot.currentCoordsY);
    playerSlot.worldX = sp.x + 8;
    playerSlot.worldY = sp.y;
    // [M3-C3.2] Positionne le SPRITE en coords-monde DÈS le spawn (1:1 décomp
    // event_object_movement.c:1850 `SetSpritePosToMapCoords(..., &sprite->x, &sprite->y)`),
    // AVANT que SetCameraToTrackPlayer ne crée le CameraObject. Sans ça, le sprite garde
    // sa y de création (= SCREEN_CENTER_Y=72, écran-ancré legacy) jusqu'au 1er
    // updateSpriteFrame, et CameraObject_Init s'aligne sur cette valeur STALE (72). Quand
    // updateSpriteFrame corrige ensuite sprite.y=worldY (112), le CameraObject mesure ce
    // saut de +40 → la caméra scrolle de 40px → joueur 40px trop haut en permanence
    // après chaque warp (bug oam.y=16 au lieu de 56). En posant sprite.x/y=worldX/Y ici,
    // le CameraObject s'aligne sur la bonne position dès l'Init (delta=0, pas de lurch).
    const sprite = rt.gSprites[gPlayerAvatar.spriteId];
    if (sprite) {
      sprite.coordOffsetEnabled = true;
      sprite.x = playerSlot.worldX;
      sprite.y = playerSlot.worldY;
    }
  }
}

// ─── Direction → (dx, dy) helpers depuis direction-coords (= source unique) ─
//
// Avant : DIR_TO_DX/DY locaux dupliquaient la table 1:1 décomp `sDirectionToVectors`.
// Migrate vers direction-coords.ts pour une source unique partagée avec
// object-events.ts + script-opcodes.ts (= éviter divergence future).
//
// `dirToCameraSpeed` re-exporté ici via alias pour back-compat.
const dirToCameraSpeed = _dirToCameraSpeed;

// [M3] Le rendu du sprite joueur est UNIFIÉ avec son slot object-event (cf.
// InitPlayerAvatar) : position par UpdateObjectEvents, anim/tile par AnimateSprite
// (MovementActions), arc de saut par _DoJumpSpriteMovement. L'ancien rendu manuel
// (updateSpriteFrame + pont GetHeldMovementVisual + courbe sJumpY_High locale) est
// retiré — le sprite s'anime comme tout NPC.

// [M3-C3.2c] Le pont AdvancePlayerSpriteWorldPos est SUPPRIMÉ. Le forced movement
// (door warp) passe maintenant par un held WALK_NORMAL (PlayerStep forced path →
// ObjectEventSetHeldMovement, 1:1 décomp Task_ExitDoor/Task_DoDoorWarp) → worldX/Y
// avancé par _NpcTakeStep dans TickObjectEventMovements → le CameraObject suit. Plus
// aucun mouvement joueur inline ni driver caméra : worldX est la source unique.

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

/** 1:1 décomp `PLAYER_AVATAR_FLAG_*` (global.fieldmap.h:49-56). Bitmask de l'état
 *  du joueur, lu/écrit par la machine de mouvement (npc_clear_strange_bits clear
 *  DASH au début de chaque pas, PlayerNotOnBikeMoving set DASH, etc.). */
export const PLAYER_AVATAR_FLAG_ON_FOOT     = 1 << 0;
export const PLAYER_AVATAR_FLAG_MACH_BIKE   = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE   = 1 << 2;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;
export const PLAYER_AVATAR_FLAG_UNDERWATER  = 1 << 4;
const PLAYER_AVATAR_FLAG_CONTROLLABLE = 1 << 5;
const PLAYER_AVATAR_FLAG_FORCED_MOVE = 1 << 6;
export const PLAYER_AVATAR_FLAG_DASH        = 1 << 7;

/** 1:1 décomp `enum` (bike.h:21-24). `PLAYER_SPEED_FASTEST = 4` (STANDING=0, NORMAL=1,
 *  FAST=2, FASTER=3, FASTEST=4). Lue par `ForcedMovement_MuddySlope` : à pied GetPlayerSpeed
 *  renvoie NORMAL(1) < FASTEST(4) → glisse ; seul le mach bike à pleine vitesse atteint FASTEST. */
const PLAYER_SPEED_FASTEST = 4;

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

// ─── 1:1 décomp `field_player_avatar.c` /* Surf */ — démontage de surf (StopSurfing) ─────────
// Déclenché par `CanStopSurfing` (collision ELEVATION_MISMATCH face à la terre, en surfant) :
// le joueur SAUTE du blob (jump special) vers la terre → swap gfx SURFING→NORMAL → le blob disparaît.
// `BOB_JUST_MON` = le blob ne bobbe plus que le mon (le joueur s'en détache).

/** 1:1 décomp `BOB_JUST_MON` (field_effect_helpers.c — enum sBobbingState). Const locale (le module
 *  source ne l'exporte pas ; cycle ESM → on n'importe pas la valeur, juste la fonction au runtime). */
const BOB_JUST_MON = 2;

/** 1:1 STRICT décomp `CreateStopSurfingTask(u8 direction)` (field_player_avatar.c:1630) :
 *    LockPlayerFieldControls(); Overworld_ClearSavedMusic(); Overworld_ChangeMusicToDefault();
 *    gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING; gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_ON_FOOT;
 *    gPlayerAvatar.preventStep = TRUE; taskId = CreateTask(Task_StopSurfingInit, 0xFF);
 *    gTasks[taskId].data[0] = direction; Task_StopSurfingInit(taskId);
 *  (Overworld_ClearSavedMusic/ChangeMusicToDefault = AUDIO → skip 1:1 strict, on ne touche pas au son.) */
function CreateStopSurfingTask(direction: number): void {
  LockPlayerFieldControls();
  // 1:1 décomp : Overworld_ClearSavedMusic() + Overworld_ChangeMusicToDefault() (= rétablit la
  // musique de map). On PILOTE la lecture existante (pas de modif engine son). NB : la résolution
  // de la musique de map par défaut (GetCurrLocationDefaultMusic) appartient au chantier sound.c
  // non porté → PlaySpecialMapMusic est best-effort (même limite que le vélo), à compléter avec sound.c.
  Overworld_ClearSavedMusic();
  Overworld_PlaySpecialMapMusic();
  gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;
  gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_ON_FOOT;
  gPlayerAvatar.preventStep = true;
  const taskId = CreateTask(Task_StopSurfingInit, 0xFF);
  const task = GetTask(taskId);
  if (!task) return;
  task.data[0] = direction;
  Task_StopSurfingInit(task);  // 1:1 appel synchrone immédiat
}

/** 1:1 STRICT décomp `Task_StopSurfingInit(u8 taskId)` (field_player_avatar.c:1645) : attend la fin
 *  d'un éventuel mouvement override, met le blob en BOB_JUST_MON, lance le SAUT du joueur hors du blob
 *  (jump special dans `direction`), puis bascule sur `Task_WaitStopSurfing`. */
function Task_StopSurfingInit(task: DecompTask): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (ObjectEventIsMovementOverridden(playerObjEvent)) {
    if (!ObjectEventClearHeldMovementIfFinished(playerObjEvent))
      return;
  }
  SetSurfBlob_BobState(getRuntime(), playerObjEvent.fieldEffectSpriteId, BOB_JUST_MON);
  ObjectEventSetHeldMovement(playerObjEvent, GetJumpSpecialMovementAction(task.data[0] & 0xFF));
  task.func = Task_WaitStopSurfing;
}

/** 1:1 STRICT décomp `Task_WaitStopSurfing(u8 taskId)` (field_player_avatar.c:1659) : quand le saut
 *  est fini → swap gfx vers NORMAL (restaure la feuille combinée réservée), pose face direction,
 *  preventStep=FALSE, déverrouille, DÉTRUIT le sprite du blob, et (BUGFIX) ré-arme les ground effects. */
function Task_WaitStopSurfing(task: DecompTask): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (ObjectEventClearHeldMovementIfFinished(playerObjEvent)) {
    ObjectEventSetGraphicsId(playerObjEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_NORMAL));
    ObjectEventSetHeldMovement(playerObjEvent, GetFaceDirectionMovementAction(playerObjEvent.facingDirection));
    gPlayerAvatar.preventStep = false;
    UnlockPlayerFieldControls();
    DestroySprite(getRuntime(), playerObjEvent.fieldEffectSpriteId);
    // #ifdef BUGFIX : sans ça, en marchant dans l'herbe depuis le surf, le joueur apparaît AU-DESSUS
    // de l'herbe au lieu de DEDANS → on ré-arme triggerGroundEffectsOnMove.
    playerObjEvent.triggerGroundEffectsOnMove = true;
    DestroyTask(task.taskId);
  }
}

// Dev hook (A/B démontage surf : force-trigge depuis la console après un mount forcé).
(globalThis as Record<string, unknown>).__CreateStopSurfingTask = CreateStopSurfingTask;

// Dev hooks vélo (A/B : monter/descendre depuis la console). 'mach' (défaut) | 'acro'.
(globalThis as Record<string, unknown>).__GetOnOffBike = async (kind: string = 'mach') => {
  const flag = kind === 'acro' ? PLAYER_AVATAR_FLAG_ACRO_BIKE : PLAYER_AVATAR_FLAG_MACH_BIKE;
  const state = kind === 'acro' ? PLAYER_AVATAR_STATE_ACRO_BIKE : PLAYER_AVATAR_STATE_MACH_BIKE;
  // précharge la gfx vélo avant le swap (keystone), seulement au MONTAGE (le démontage restaure NORMAL).
  if (!(gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)))
    await PreloadObjectEventGraphics(GetPlayerAvatarGraphicsIdByStateId(state));
  GetOnOffBike(flag);
  return 'flags=0x' + gPlayerAvatar.flags.toString(16) + ' bikeSpeed=' + gPlayerAvatar.bikeSpeed
    + ' bikeFrameCounter=' + gPlayerAvatar.bikeFrameCounter + ' acroState=' + gPlayerAvatar.acroBikeState;
};

// ─── 1:1 décomp `field_player_avatar.c` /* Strength */ — poussée de rocher (HM Strength) ──
// tState = data[0], tBoulderObjId = data[1], tDirection = data[2].
// Déclenché par `TryPushBoulder` (collision OBJECT_EVENT sur un OBJ_EVENT_GFX_PUSHABLE_BOULDER
// avec FLAG_SYS_USE_STRENGTH) → le joueur marche-sur-place pendant que le rocher glisse d'une
// tuile (held WalkSlow) + nuage de poussière (FLDEFF_DUST).

/** 1:1 STRICT décomp `PushBoulder_Start` (field_player_avatar.c:1473). Lock + preventStep. */
function PushBoulder_Start(task: DecompTask, _player: ObjectEvent, _boulder: ObjectEvent): boolean {
  LockPlayerFieldControls();
  gPlayerAvatar.preventStep = true;
  task.data[0]++;  // tState++
  return false;
}

/** 1:1 STRICT décomp `PushBoulder_Move` (field_player_avatar.c:1481). Quand joueur ET rocher
 *  ne bougent plus : pose le held du joueur (WalkInPlaceNormal) + du rocher (WalkSlow), lance
 *  FLDEFF_DUST sur le rocher. (PlaySE(SE_M_STRENGTH) = audio → skip.) */
function PushBoulder_Move(task: DecompTask, player: ObjectEvent, boulder: ObjectEvent): boolean {
  if (ObjectEventIsHeldMovementActive(player))
    ObjectEventClearHeldMovementIfFinished(player);
  if (ObjectEventIsHeldMovementActive(boulder))
    ObjectEventClearHeldMovementIfFinished(boulder);

  if (!ObjectEventIsMovementOverridden(player)
   && !ObjectEventIsMovementOverridden(boulder)) {
    ObjectEventClearHeldMovementIfFinished(player);
    ObjectEventClearHeldMovementIfFinished(boulder);
    ObjectEventSetHeldMovement(player, GetWalkInPlaceNormalMovementAction(task.data[2] & 0xFF));
    ObjectEventSetHeldMovement(boulder, GetWalkSlowMovementAction(task.data[2] & 0xFF));
    // 1:1 décomp : FLDEFF_DUST sur le rocher (args INTERNAL = currentCoords + elevation + priority OAM).
    const rt = getRuntime();
    const bSprite = boulder.spriteId >= 0 ? rt.gSprites[boulder.spriteId] : null;
    const priority = bSprite && bSprite.oamIndex >= 0 ? (rt.gba.oam[bSprite.oamIndex].priority ?? 2) : 2;
    gFieldEffectArguments[0] = boulder.currentCoordsX;
    gFieldEffectArguments[1] = boulder.currentCoordsY;
    gFieldEffectArguments[2] = boulder.previousElevation;
    gFieldEffectArguments[3] = priority;
    FieldEffectStart(FLDEFF_DUST);
    // PlaySE(SE_M_STRENGTH) — audio (skip 1:1 strict : on ne touche pas au son).
    task.data[0]++;  // tState++
  }
  return false;
}

/** 1:1 STRICT décomp `PushBoulder_End` (field_player_avatar.c:1507). Quand les deux held sont
 *  finis : clear, preventStep=FALSE, déverrouille, détruit la task. */
function PushBoulder_End(task: DecompTask, player: ObjectEvent, boulder: ObjectEvent): boolean {
  void task;
  if (ObjectEventCheckHeldMovementStatus(player)
   && ObjectEventCheckHeldMovementStatus(boulder)) {
    ObjectEventClearHeldMovementIfFinished(player);
    ObjectEventClearHeldMovementIfFinished(boulder);
    gPlayerAvatar.preventStep = false;
    UnlockPlayerFieldControls();
    DestroyTask(FindTaskIdByFunc(Task_PushBoulder));
  }
  return false;
}

/** 1:1 STRICT décomp `sPushBoulderFuncs[]` (field_player_avatar.c:302). */
const sPushBoulderFuncs: ReadonlyArray<(task: DecompTask, player: ObjectEvent, boulder: ObjectEvent) => boolean> = [
  PushBoulder_Start,
  PushBoulder_Move,
  PushBoulder_End,
];

/** 1:1 STRICT décomp `Task_PushBoulder` (field_player_avatar.c:1465) :
 *    while (sPushBoulderFuncs[tState](&task, &player, &boulder));
 *  Tické chaque frame par le runtime ; boucle les step-funcs tant qu'elles retournent TRUE
 *  (ici toutes retournent FALSE → 1 step/frame). */
function Task_PushBoulder(task: DecompTask): void {
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  const boulder = gObjectEvents[task.data[1]];  // tBoulderObjId
  while (sPushBoulderFuncs[task.data[0]](task, player, boulder));
}

/** 1:1 STRICT décomp `StartStrengthAnim(u8 objectEventId, u8 direction)` (field_player_avatar.c:1456) :
 *    taskId = CreateTask(Task_PushBoulder, 0xFF); gTasks[taskId].data[1]=objId; data[2]=dir;
 *    Task_PushBoulder(taskId);  // 1er appel synchrone (state 0 = PushBoulder_Start) */
function StartStrengthAnim(objectEventId: number, direction: number): void {
  const taskId = CreateTask(Task_PushBoulder, 0xFF);
  const task = GetTask(taskId);
  if (!task) return;
  task.data[1] = objectEventId;  // tBoulderObjId
  task.data[2] = direction;      // tDirection
  Task_PushBoulder(task);        // 1:1 appel synchrone immédiat
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
 *  Cap 0xFFFFFF (16M) car compteur 24-bit dans le save format.
 *  ⚠️ DETTE 1:1 (placement) : IncrementGameStat/GetGameStat/SetGameStat vivent en
 *  décomp dans overworld.c (≈l.433-459) → à relocaliser dans game/overworld.ts.
 *  DÉFÉRÉ : un importeur est field_weather_effect.ts (UpdateRainCounter), fichier
 *  INTERDIT de commit → relocaliser casserait le build committé tant qu'on n'a pas
 *  traité ce fichier. Exporté ici (home temporaire) en attendant. */
export function IncrementGameStat(index: number): void {
  if (index < NUM_USED_GAME_STATS) {
    let statVal = GetGameStat(index);
    if (statVal < 0xFFFFFF) statVal++;
    else statVal = 0xFFFFFF;
    SetGameStat(index, statVal);
  }
}

/** 1:1 décomp `GetGameStat(u8 index)` (overworld.c:447-453). */
function GetGameStat(index: number): number {
  if (index >= NUM_USED_GAME_STATS) return 0;
  const stats = (gSaveBlock1Ptr.gameStats as number[]) || [];
  const key = (gSaveBlock2Ptr.encryptionKey as number) | 0;
  return (stats[index] | 0) ^ key;
}

/** 1:1 décomp `SetGameStat(u8 index, u32 value)` (overworld.c:455-459). */
function SetGameStat(index: number, value: number): void {
  if (index < NUM_USED_GAME_STATS) {
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
    // 1:1 décomp `gObjectEvents[objectEventId].graphicsId == OBJ_EVENT_GFX_PUSHABLE_BOULDER`.
    // Notre port stocke le `graphicsId` d'un NPC comme le NOM du constant décomp (= graphicsIdRaw
    // du template), pas le u8 numérique → on compare au nom (même convention que le check
    // `=== 'OBJ_EVENT_GFX_BERRY_TREE'` ailleurs). L'ancienne comparaison `String(87)` était un
    // bug latent (jamais atteint car StartStrengthAnim était stubbé).
    if (objectEventId !== OBJECT_EVENTS_COUNT
        && gObjectEvents[objectEventId].graphicsId === 'OBJ_EVENT_GFX_PUSHABLE_BOULDER') {
      void OBJ_EVENT_GFX_PUSHABLE_BOULDER;  // (constant numérique = doc de l'identité décomp)
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
  // Dev-only noclip (= devmenu touche « " » toggle ; cf. DebugOverlayScene) — hook NON décomp.
  // Bypass tous les checks → le joueur marche à travers murs/NPCs/ledges/elevation. Placé ici
  // (et non dans un wrapper) car `PlayerNotOnBikeMoving` appelle `CheckForPlayerAvatarCollision`
  // directement (1:1 décomp). N'affecte PAS la variante "static" (le bump n'existe pas en noclip).
  if ((globalThis as unknown as { __devNoclip?: boolean }).__devNoclip) {
    return COLLISION_NONE;
  }
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

// ─── 1:1 décomp `ShouldJumpLedge` (field_player_avatar.c:727) ───────────────
// (Rapatrié de l'ex-`metatile-behavior-helpers.ts`, sa vraie maison décomp.)
/** Lookup ledge (jump) direction → check function. Indexé par direction-1. */
const sJumpFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsJumpSouth, MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpWest, MetatileBehavior_IsJumpEast,
];
/** 1:1 décomp `ShouldJumpLedge` (field_player_avatar.c:727). TRUE si le tile target
 *  = MB_JUMP_X et direction = X (= ledge drop). direction = DIR_SOUTH/NORTH/WEST/EAST. */
function ShouldJumpLedge(targetBehavior: number, direction: number): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sJumpFuncs[idx](targetBehavior);
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
import { A_BUTTON } from './engine/decomp-data/include/gba/io_reg-data';

// ─── 1:1 décomp `field_player_avatar.c` — fonctions feuilles d'action ────────
// [chantier INPUT joueur, étape 1a] Ces wrappers SONT le call-graph décomp pour
// poser le held movement du joueur. `PlayerStep` (ci-dessous) les appelle au lieu
// d'`ObjectEventSetHeldMovement(GetXxx)` inline (graphe d'appels 1:1). Cf.
// docs/FIELD-PLAYER-AVATAR-1TO1-PLAN.md + [[next-chantier-field-player-avatar]].
//
// ⚠️ Étape 1a : `PlayerSetAnimId` GUARD sur `!PlayerIsAnimActive()` (1:1 strict, ne
// clear PAS). Le clear du held « fini mais actif » vient de `TryInterruptObjectEventSpecialAnim`
// dans la décomp ; pas encore porté → PlayerStep garde un `ObjectEventClearHeldMovementIfActive`
// explicite avant ces appels (stand-in du clear de TryInterrupt, retiré à l'étape 1b).

/** 1:1 décomp `PlayerSetCopyableMovement` (field_player_avatar.c:934). */
function PlayerSetCopyableMovement(movement: number): void {
  gObjectEvents[gPlayerAvatar.objectEventId].playerCopyableMovement = movement;
}

/** 1:1 décomp `PlayerIsAnimActive` (field_player_avatar.c:1052). */
function PlayerIsAnimActive(): boolean {
  return ObjectEventIsMovementOverridden(gObjectEvents[gPlayerAvatar.objectEventId]);
}

/** 1:1 décomp `PlayerCheckIfAnimFinishedOrInactive` (field_player_avatar.c:931) :
 *    return ObjectEventCheckHeldMovementStatus(&gObjectEvents[player]);
 *  Retourne le status brut (0 = actif&pas fini, 1 = fini, 16 = pas actif). */
function PlayerCheckIfAnimFinishedOrInactive(): number {
  return ObjectEventCheckHeldMovementStatus(gObjectEvents[gPlayerAvatar.objectEventId]);
}

/** 1:1 décomp `PlayerAnimIsMultiFrameStationary` (field_player_avatar.c:902) :
 *  true si le movementActionId est une anim stationnaire multi-frame (face,
 *  delays, walk-in-place, acro wheelie/in-place) — par opposition à un vrai pas
 *  qui translate. Sert à distinguer "centré sur la tuile" (T_TILE_CENTER) d'un
 *  "pas en cours" (T_TILE_TRANSITION) dans UpdatePlayerAvatarTransitionState. */
function PlayerAnimIsMultiFrameStationary(): boolean {
  const movementActionId = gObjectEvents[gPlayerAvatar.objectEventId].movementActionId;
  if (movementActionId <= MOVEMENT_ACTION_FACE_RIGHT
   || (movementActionId >= MOVEMENT_ACTION_DELAY_1 && movementActionId <= MOVEMENT_ACTION_DELAY_16)
   || (movementActionId >= MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN && movementActionId <= MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT)
   || (movementActionId >= MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN && movementActionId <= MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT)
   || (movementActionId >= MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN && movementActionId <= MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT))
    return true;
  return false;
}

/** 1:1 décomp `PlayerAnimIsMultiFrameStationaryAndStateNotTurning` (field_player_avatar.c:916). */
function PlayerAnimIsMultiFrameStationaryAndStateNotTurning(): boolean {
  return PlayerAnimIsMultiFrameStationary() && gPlayerAvatar.runningState !== TURN_DIRECTION;
}

/** 1:1 décomp `PlayerSetAnimId` (field_player_avatar.c:949) :
 *    if (!PlayerIsAnimActive()) { PlayerSetCopyableMovement(c); ObjectEventSetHeldMovement(player, id); } */
export function PlayerSetAnimId(movementActionId: number, copyableMovement: number): void {
  if (!PlayerIsAnimActive()) {
    PlayerSetCopyableMovement(copyableMovement);
    ObjectEventSetHeldMovement(gObjectEvents[gPlayerAvatar.objectEventId], movementActionId);
  }
}

/** 1:1 décomp `PlayerWalkNormal` (field_player_avatar.c:958). */
export function PlayerWalkNormal(direction: number): void {
  PlayerSetAnimId(GetWalkNormalMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerRun` (field_player_avatar.c:978). */
function PlayerRun(direction: number): void {
  PlayerSetAnimId(GetPlayerRunMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerNotOnBikeCollide` (field_player_avatar.c:994) :
 *    PlayCollisionSoundIfNotFacingWarp(dir); PlayerSetAnimId(GetWalkInPlaceSlow..., COPY_MOVE_WALK); */
function PlayerNotOnBikeCollide(direction: number): void {
  PlayCollisionSoundIfNotFacingWarp(direction);
  PlayerSetAnimId(GetWalkInPlaceSlowMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerTurnInPlace` (field_player_avatar.c:1010). */
export function PlayerTurnInPlace(direction: number): void {
  PlayerSetAnimId(GetWalkInPlaceFastMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerJumpLedge` (field_player_avatar.c:1015) :
 *    PlaySE(SE_LEDGE); PlayerSetAnimId(GetJump2MovementAction(dir), COPY_MOVE_JUMP2); */
export function PlayerJumpLedge(direction: number): void {
  PlaySE(SE_LEDGE);
  PlayerSetAnimId(GetJump2MovementAction(direction), COPY_MOVE_JUMP2);
}

/** 1:1 décomp `PlayerFaceDirection` (field_player_avatar.c:1007) :
 *    PlayerSetAnimId(GetFaceDirectionMovementAction(direction), COPY_MOVE_FACE); */
export function PlayerFaceDirection(direction: number): void {
  PlayerSetAnimId(GetFaceDirectionMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 STRICT décomp `PlayerNotOnBikeNotMoving` (field_player_avatar.c:598) :
 *    static void PlayerNotOnBikeNotMoving(u8 direction, u16 heldKeys) {
 *        PlayerFaceDirection(GetPlayerFacingDirection());
 *    }
 *  Appelé chaque frame quand le joueur est à l'arrêt (input DIR_NONE) → re-pose un held
 *  FACE (stationnaire) → le sprite revient à la frame de face de sa direction. Le held FACE
 *  fini du frame précédent est clear par `TryInterruptObjectEventSpecialAnim`
 *  (→ ObjectEventClearHeldMovementIfFinished) AVANT cet appel dans PlayerStep, ce qui ouvre
 *  le guard `!PlayerIsAnimActive()` de PlayerSetAnimId pour re-poser. */
function PlayerNotOnBikeNotMoving(_direction: number, _heldKeys: number): void {
  PlayerFaceDirection(GetPlayerFacingDirection());
}

/** 1:1 décomp `UpdatePlayerAvatarTransitionState` (field_player_avatar.c:884).
 *
 *  Dérive `gPlayerAvatar.tileTransitionState` de l'état du held movement du slot
 *  joueur — appelée chaque frame en TÊTE de `DoCB1_Overworld` (overworld.c:1442),
 *  AVANT `FieldGetPlayerInput`/`PlayerStep`. C'est LE writer 1:1 unique de
 *  tileTransitionState : T_NOT_MOVING (aucune anim active), T_TILE_TRANSITION
 *  (pas qui translate, en cours), T_TILE_CENTER (pile centré sur la tuile, 1 frame —
 *  c'est cette valeur que `FieldGetPlayerInput` attend pour lire l'input aux
 *  frontières de tuile). Remplace les sets crus dispersés dans PlayerStep. */
export function UpdatePlayerAvatarTransitionState(): void {
  gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  if (PlayerIsAnimActive()) {
    if (!PlayerCheckIfAnimFinishedOrInactive()) {
      if (!PlayerAnimIsMultiFrameStationary())
        gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
    } else {
      if (!PlayerAnimIsMultiFrameStationaryAndStateNotTurning())
        gPlayerAvatar.tileTransitionState = T_TILE_CENTER;
    }
  }
}

// ─── 1:1 décomp `field_player_avatar.c` — machine de mouvement à pied (étape 1b-iii) ──
// Remplacement de la machine MAISON à compteurs (stepFramesLeft/turnFramesLeft/
// collideFramesLeft) par le call-graph décomp PUR. Le pas AVANCE via le held movement
// (TickObjectEventMovements, indépendant de PlayerStep) ; le GATE est
// `TryInterruptObjectEventSpecialAnim` (clear le held fini → ouvre le gate en fin de pas) ;
// l'input→action passe par `MovePlayerNotOnBike`. Les warps/rencontres/coord/interactions
// sont SORTIS de PlayerStep → `ProcessPlayerFieldInput` (field-control-avatar.ts, étape 2),
// gaté par `tileTransitionState` (T_TILE_CENTER). Cf. docs/FIELD-PLAYER-AVATAR-1TO1-PLAN.md.

/** 1:1 décomp `PlayerWalkFast` (field_player_avatar.c:968) :
 *    PlayerSetAnimId(GetWalkFastMovementAction(direction), COPY_MOVE_WALK);
 *  Vitesse surf (= même que run). Branche SURFING de `PlayerNotOnBikeMoving` ET moveFunc des
 *  `ForcedMovement_Slip`/`ForcedMovement_Slide*` (glace/slides — atteint à pied). Câblé 1:1. */
export function PlayerWalkFast(direction: number): void {
  PlayerSetAnimId(GetWalkFastMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerRideWaterCurrent` (field_player_avatar.c:968) :
 *    PlayerSetAnimId(GetRideWaterCurrentMovementAction(direction), COPY_MOVE_WALK);
 *  moveFunc des `ForcedMovement_Pushed*ByCurrent` (courants d'eau). S'active quand le
 *  joueur surfe sur une tuile *Current — le surf est porté à l'étape 5 ; ce chemin est
 *  câblé 1:1 et opérationnel dès que SURFING entre en jeu. */
export function PlayerRideWaterCurrent(direction: number): void {
  PlayerSetAnimId(GetRideWaterCurrentMovementAction(direction), COPY_MOVE_WALK);
}

// `GetPlayerSpeed` / `Bike_UpdateBikeCounterSpeed` / `Bike_TryAcroBikeHistoryUpdate` sont des
// fonctions de bike.c → vivent maintenant dans `game/bike.ts` (source unique 1:1). Importées
// ci-dessus. (Le `GetPlayerSpeed` correct utilise sMachBikeSpeeds[bikeFrameCounter] ∈ {NORMAL,
// FAST, FASTEST} pour le mach bike, FASTER pour l'acro — vs l'ancienne approximation FAST.)

/** 1:1 décomp `PlayerWalkFaster` (field_player_avatar.c:973) — mach bike vitesse max. */
export function PlayerWalkFaster(direction: number): void {
  PlayerSetAnimId(GetWalkFasterMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerOnBikeCollide` (field_player_avatar.c:983) :
 *    PlayCollisionSoundIfNotFacingWarp(dir); PlayerSetAnimId(GetWalkInPlaceNormal..., COPY_MOVE_WALK); */
export function PlayerOnBikeCollide(direction: number): void {
  PlayCollisionSoundIfNotFacingWarp(direction);
  PlayerSetAnimId(GetWalkInPlaceNormalMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerOnBikeCollideWithFarawayIslandMew` (field_player_avatar.c:989). */
export function PlayerOnBikeCollideWithFarawayIslandMew(direction: number): void {
  PlayerSetAnimId(GetWalkInPlaceNormalMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `IsPlayerCollidingWithFarawayIslandMew` (faraway_island.c). Faraway Island
 *  (le Mew fuyant) n'est pas portée → toujours FALSE (= jamais ce cas spécial de collision). */
export function IsPlayerCollidingWithFarawayIslandMew(_direction: number): boolean {
  return false;
}

// ─── 1:1 décomp `field_player_avatar.c` — Player* wheelie (acro bike) ──────────
// Chaque fonction pose un held movement wheelie via PlayerSetAnimId(GetAcro*MovementAction(dir)).
// Les movement actions Acro (step funcs + anims) sont déjà dans event_object_movement.ts.

/** 1:1 décomp `PlayerIdleWheelie` (field_player_avatar.c:1032) — wheelie idle. */
export function PlayerIdleWheelie(direction: number): void {
  PlayerSetAnimId(GetAcroWheelieFaceDirectionMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerStartWheelie` (field_player_avatar.c:1038) — normal → wheelie. */
export function PlayerStartWheelie(direction: number): void {
  PlayerSetAnimId(GetAcroPopWheelieFaceDirectionMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerEndWheelie` (field_player_avatar.c:1044) — wheelie → normal. */
export function PlayerEndWheelie(direction: number): void {
  PlayerSetAnimId(GetAcroEndWheelieFaceDirectionMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerStandingHoppingWheelie` (field_player_avatar.c:1050) — bunny hop sur place. */
export function PlayerStandingHoppingWheelie(direction: number): void {
  PlaySE(SE_BIKE_HOP);
  PlayerSetAnimId(GetAcroWheelieHopFaceDirectionMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerMovingHoppingWheelie` (field_player_avatar.c:1057) — hop wheelie en mouvement. */
export function PlayerMovingHoppingWheelie(direction: number): void {
  PlaySE(SE_BIKE_HOP);
  PlayerSetAnimId(GetAcroWheelieHopDirectionMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerLedgeHoppingWheelie` (field_player_avatar.c:1064) — saut ledge en wheelie. */
export function PlayerLedgeHoppingWheelie(direction: number): void {
  PlaySE(SE_BIKE_HOP);
  PlayerSetAnimId(GetAcroWheelieJumpDirectionMovementAction(direction), COPY_MOVE_JUMP2);
}

/** 1:1 décomp `PlayerAcroTurnJump` (field_player_avatar.c:1071) — turn jump (demi-tour sauté). */
export function PlayerAcroTurnJump(direction: number): void {
  PlaySE(SE_BIKE_HOP);
  PlayerSetAnimId(GetJumpInPlaceTurnAroundMovementAction(direction), COPY_MOVE_FACE);
}

/** 1:1 décomp `PlayerWheelieInPlace` (field_player_avatar.c:1077) — wheelie sur place (mur). */
export function PlayerWheelieInPlace(direction: number): void {
  PlaySE(SE_WALL_HIT);
  PlayerSetAnimId(GetAcroWheelieInPlaceDirectionMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerPopWheelieWhileMoving` (field_player_avatar.c:1083) — lever le wheelie en roulant. */
export function PlayerPopWheelieWhileMoving(direction: number): void {
  PlayerSetAnimId(GetAcroPopWheelieMoveDirectionMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerWheelieMove` (field_player_avatar.c:1088) — rouler en wheelie. */
export function PlayerWheelieMove(direction: number): void {
  PlayerSetAnimId(GetAcroWheelieMoveDirectionMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerEndWheelieWhileMoving` (field_player_avatar.c:1093) — baisser le wheelie en roulant. */
export function PlayerEndWheelieWhileMoving(direction: number): void {
  PlayerSetAnimId(GetAcroEndWheelieMoveDirectionMovementAction(direction), COPY_MOVE_WALK);
}

/** 1:1 décomp `PlayerUseAcroBikeOnBumpySlope` (field_player_avatar.c:1415) — pose la gfx acro
 *  + anim wheelie (bumpy slope mount). */
export function PlayerUseAcroBikeOnBumpySlope(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  ObjectEventSetGraphicsId(playerObjEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_ACRO_BIKE));
  const rt = getRuntime();
  rt.StartSpriteAnim(gPlayerAvatar.spriteId, GetAcroWheelieDirectionAnimNum(direction));
  rt.SeekSpriteAnim(gPlayerAvatar.spriteId, 1);
}

// ─── 1:1 décomp `field_player_avatar.c` — TRANSITION D'ÉTAT JOUEUR (étape 4) ───
// Machine d'état du player avatar (à pied / mach bike / acro bike / surf / plongée).
// `transitionFlags` (set par SetPlayerAvatarTransitionFlags / SetPlayerAvatarExtraStateTransition)
// est consommé bit-à-bit par DoPlayerAvatarTransition → sPlayerAvatarTransitionFuncs[i].
// ⚠️ Les transitions GRAPHIQUES (Normal gfx, bike/surf/underwater) appellent
// `ObjectEventSetGraphicsId`/`ObjectEventTurn`/`FieldEffectStart` = sous-système graphics-id +
// surf/bike (étape 5, PAS encore porté). Ici on porte la part FLAGS (SetPlayerAvatarStateMask) +
// ReturnToField (CONTROLLABLE) qui n'ont AUCUNE dépendance graphique ; la part gfx est élidée
// pour le cas À PIED où elle est idempotente (le joueur a déjà le gfx Normal + le bon facing —
// preuve : slot préservé), et explicitement stagée pour les états vélo/surf.

/** 1:1 décomp `enum PLAYER_AVATAR_STATE_*` (global.fieldmap.h) — index de sPlayerAvatarTransitionFuncs. */
const PLAYER_AVATAR_STATE_NORMAL     = 0;
export const PLAYER_AVATAR_STATE_MACH_BIKE  = 1;
export const PLAYER_AVATAR_STATE_ACRO_BIKE  = 2;
export const PLAYER_AVATAR_STATE_SURFING = 3;
const PLAYER_AVATAR_STATE_UNDERWATER = 4;
const PLAYER_AVATAR_STATE_FIELD_MOVE = 5;
export const PLAYER_AVATAR_STATE_FISHING    = 6;
const PLAYER_AVATAR_STATE_WATERING   = 7;

/** 1:1 STRICT décomp `sPlayerAvatarGfxToStateFlag[GENDER_COUNT][5]` (field_player_avatar.c:270).
 *  Map graphicsId → flag d'état. Indexé par genre (notre `gPlayerAvatar.gender` = string). */
const sPlayerAvatarGfxToStateFlag: Record<'MALE' | 'FEMALE', ReadonlyArray<{ graphicsId: number; playerFlag: number }>> = {
  MALE: [
    { graphicsId: OBJ_EVENT_GFX_BRENDAN_NORMAL,     playerFlag: PLAYER_AVATAR_FLAG_ON_FOOT },
    { graphicsId: OBJ_EVENT_GFX_BRENDAN_MACH_BIKE,  playerFlag: PLAYER_AVATAR_FLAG_MACH_BIKE },
    { graphicsId: OBJ_EVENT_GFX_BRENDAN_ACRO_BIKE,  playerFlag: PLAYER_AVATAR_FLAG_ACRO_BIKE },
    { graphicsId: OBJ_EVENT_GFX_BRENDAN_SURFING,    playerFlag: PLAYER_AVATAR_FLAG_SURFING },
    { graphicsId: OBJ_EVENT_GFX_BRENDAN_UNDERWATER, playerFlag: PLAYER_AVATAR_FLAG_UNDERWATER },
  ],
  FEMALE: [
    { graphicsId: OBJ_EVENT_GFX_MAY_NORMAL,         playerFlag: PLAYER_AVATAR_FLAG_ON_FOOT },
    { graphicsId: OBJ_EVENT_GFX_MAY_MACH_BIKE,      playerFlag: PLAYER_AVATAR_FLAG_MACH_BIKE },
    { graphicsId: OBJ_EVENT_GFX_MAY_ACRO_BIKE,      playerFlag: PLAYER_AVATAR_FLAG_ACRO_BIKE },
    { graphicsId: OBJ_EVENT_GFX_MAY_SURFING,        playerFlag: PLAYER_AVATAR_FLAG_SURFING },
    { graphicsId: OBJ_EVENT_GFX_MAY_UNDERWATER,     playerFlag: PLAYER_AVATAR_FLAG_UNDERWATER },
  ],
};

/** 1:1 STRICT décomp `GetPlayerAvatarStateTransitionByGraphicsId` (field_player_avatar.c:1331).
 *  Cherche le flag d'état pour un graphicsId ; DÉFAUT `PLAYER_AVATAR_FLAG_ON_FOOT` si pas trouvé
 *  (= notre slot joueur a un gfx aliasé non-numérique → tombe sur le défaut = correct à pied). */
function GetPlayerAvatarStateTransitionByGraphicsId(graphicsId: number | string, gender: 'MALE' | 'FEMALE'): number {
  // !< notre `ObjectEvent.graphicsId` du slot joueur est une STRING aliasée ('Brendan'/'May'),
  // pas le u8 numérique du décomp → la comparaison numérique échoue volontairement → on tombe
  // sur le défaut ON_FOOT (1:1 décomp pour un gfx non-listé). Câblé pour les vrais gfx étape 5.
  const table = sPlayerAvatarGfxToStateFlag[gender];
  for (let i = 0; i < table.length; i++) {
    if (table[i].graphicsId === graphicsId)
      return table[i].playerFlag;
  }
  return PLAYER_AVATAR_FLAG_ON_FOOT;
}

/** 1:1 STRICT décomp `sPlayerAvatarGfxIds[][GENDER_COUNT]` (field_player_avatar.c:246).
 *  Map (état joueur, genre) → graphicsId. Le décomp utilise le u8 numérique ; notre port
 *  identifie un gfx par le NOM du constant décomp (= clé du catalogue object-event-graphics.json
 *  ET valeur de `ObjectEvent.graphicsId`). Le catalogue CONTIENT bien les sprites d'état joueur
 *  (`OBJ_EVENT_GFX_BRENDAN_SURFING` → people/brendan/surfing.png, etc.) → `ObjectEventSetGraphicsId`
 *  les charge via le chemin gfx partagé (seul NORMAL = cas spécial = feuille combinée walking+running). */
const sPlayerAvatarGfxIds: Record<'MALE' | 'FEMALE', readonly string[]> = {
  // index = PLAYER_AVATAR_STATE_* (NORMAL..WATERING)
  MALE: [
    'OBJ_EVENT_GFX_BRENDAN_NORMAL',     // STATE_NORMAL
    'OBJ_EVENT_GFX_BRENDAN_MACH_BIKE',  // STATE_MACH_BIKE
    'OBJ_EVENT_GFX_BRENDAN_ACRO_BIKE',  // STATE_ACRO_BIKE
    'OBJ_EVENT_GFX_BRENDAN_SURFING',    // STATE_SURFING
    'OBJ_EVENT_GFX_BRENDAN_UNDERWATER', // STATE_UNDERWATER
    'OBJ_EVENT_GFX_BRENDAN_FIELD_MOVE', // STATE_FIELD_MOVE
    'OBJ_EVENT_GFX_BRENDAN_FISHING',    // STATE_FISHING
    'OBJ_EVENT_GFX_BRENDAN_WATERING',   // STATE_WATERING
  ],
  FEMALE: [
    'OBJ_EVENT_GFX_MAY_NORMAL',
    'OBJ_EVENT_GFX_MAY_MACH_BIKE',
    'OBJ_EVENT_GFX_MAY_ACRO_BIKE',
    'OBJ_EVENT_GFX_MAY_SURFING',
    'OBJ_EVENT_GFX_MAY_UNDERWATER',
    'OBJ_EVENT_GFX_MAY_FIELD_MOVE',
    'OBJ_EVENT_GFX_MAY_FISHING',
    'OBJ_EVENT_GFX_MAY_WATERING',
  ],
};

/** 1:1 STRICT décomp `GetPlayerAvatarGraphicsIdByStateIdAndGender` (field_player_avatar.c:1224) :
 *    return sPlayerAvatarGfxIds[state][gender]; */
export function GetPlayerAvatarGraphicsIdByStateIdAndGender(state: number, gender: 'MALE' | 'FEMALE'): string {
  return sPlayerAvatarGfxIds[gender][state];
}

/** 1:1 STRICT décomp `GetPlayerAvatarGraphicsIdByStateId` (field_player_avatar.c:1239) :
 *    return GetPlayerAvatarGraphicsIdByStateIdAndGender(state, gPlayerAvatar.gender); */
export function GetPlayerAvatarGraphicsIdByStateId(state: number): string {
  return GetPlayerAvatarGraphicsIdByStateIdAndGender(state, gPlayerAvatar.gender);
}

/** 1:1 STRICT décomp `GetPlayerAvatarGraphicsIdByCurrentState` (field_player_avatar.c:1244) :
 *    for (i) if (sPlayerAvatarGfxToStateFlag[gender][i].playerFlag & flags) return graphicsId; return 0;
 *  Le gfx correspondant à l'état COURANT du joueur (selon ses flags). Utilisé pour RESTAURER le
 *  sprite après une pose field-move (`CreateFieldMoveTask` → Task_DoFieldMove_WaitForMon).
 *  Port : `sPlayerAvatarGfxToStateFlag` et `sPlayerAvatarGfxIds` sont PARALLÈLES (index i = STATE i)
 *  → on retourne le NOM string `sPlayerAvatarGfxIds[gender][i]` (convention port) au lieu du u8. */
export function GetPlayerAvatarGraphicsIdByCurrentState(): string {
  const flags = gPlayerAvatar.flags;
  const flagTable = sPlayerAvatarGfxToStateFlag[gPlayerAvatar.gender];
  for (let i = 0; i < flagTable.length; i++) {
    if (flagTable[i].playerFlag & flags) {
      return sPlayerAvatarGfxIds[gPlayerAvatar.gender][i];
    }
  }
  return sPlayerAvatarGfxIds[gPlayerAvatar.gender][0];  // 1:1 décomp return 0 = gfx NORMAL
}

/** 1:1 STRICT décomp `SetPlayerAvatarFieldMove` (field_player_avatar.c:1403) :
 *    ObjectEventSetGraphicsId(player, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FIELD_MOVE));
 *    StartSpriteAnim(&gSprites[gPlayerAvatar.spriteId], ANIM_FIELD_MOVE);
 *  Swap le sprite joueur vers la pose « field move » (main levée) + lance l'anim de pose.
 *  Utilisé par `SurfFieldEffect_FieldMovePose` (et les autres HM field moves). Le gfx FIELD_MOVE
 *  doit être préchargé (`PreloadObjectEventGraphics`). */
export function SetPlayerAvatarFieldMove(): void {
  ObjectEventSetGraphicsId(gObjectEvents[gPlayerAvatar.objectEventId], GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FIELD_MOVE));
  // 1:1 décomp `StartSpriteAnim(&gSprites[gPlayerAvatar.spriteId], ANIM_FIELD_MOVE)` — l'API runtime
  // par id délègue à la `StartSpriteAnim` 1:1 strict de sprite-animation (decomp-runtime.ts:2256).
  getRuntime().StartSpriteAnim(gPlayerAvatar.spriteId, ANIM_FIELD_MOVE);
}

/** 1:1 STRICT décomp `SetPlayerAvatarFishing(u8 direction)` (field_player_avatar.c:1409) :
 *    ObjectEventSetGraphicsId(player, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FISHING));
 *    StartSpriteAnim(&gSprites[gPlayerAvatar.spriteId], GetFishingDirectionAnimNum(direction));
 *  Swap le sprite joueur vers le gfx « pêche » (BRENDAN/MAY_FISHING) + lance l'anim « sortir la canne »
 *  (ANIM_TAKE_OUT_ROD_* selon la direction). Le gfx FISHING doit être préchargé (PreloadObjectEventGraphics).
 *  Utilisé par `Fishing_GetRodOut` (state 1 de Task_Fishing). */
function SetPlayerAvatarFishing(direction: number): void {
  ObjectEventSetGraphicsId(gObjectEvents[gPlayerAvatar.objectEventId], GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FISHING));
  getRuntime().StartSpriteAnim(gPlayerAvatar.spriteId, GetFishingDirectionAnimNum(direction));
}

// Dev hook (A/B pêche : précharge le gfx FISHING + force la pose « sortir la canne »).
(globalThis as Record<string, unknown>).__SetPlayerAvatarFishing = async (dir = 1) => {
  await PreloadObjectEventGraphics(GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FISHING));
  SetPlayerAvatarFishing(dir);
  return 'fishing pose ' + dir;
};

// ════════════════════════════════════════════════════════════════════════════════════════════
// 1:1 STRICT décomp `field_player_avatar.c` /* Fishing */ — StartFishing + Task_Fishing (16 états)
// Déclenché par `ItemUseOutOfBattle_Rod` (sac) → `StartFishing(rod)`. Sort la canne (gfx FISHING via
// keystone), minigame de points (window dialogue), check morsure (DoesCurrentMapHaveFishingMons),
// puis `FishingWildEncounter` (combat) ou « Rien de rien… ». Macros data 1:1 (field_player_avatar.c:1678).
// ════════════════════════════════════════════════════════════════════════════════════════════

// Macros data — accès typé sur task.data (number[]).
const T_FISH_STEP = 0;            // tStep
const T_FISH_FRAME_COUNTER = 1;   // tFrameCounter
const T_FISH_NUM_DOTS = 2;        // tNumDots
const T_FISH_DOTS_REQUIRED = 3;   // tDotsRequired
const T_FISH_ROUNDS_PLAYED = 12;  // tRoundsPlayed
const T_FISH_MIN_ROUNDS = 13;     // tMinRoundsRequired
const T_FISH_ROD = 15;            // tFishingRod
// tPlayerGfxId (data[14]) = u8 dans le décomp, mais notre graphicsId joueur est une STRING → stocké
// dans un module-var (un seul joueur, une pêche à la fois).
let sFishingPlayerGfxId = '';

// états sautés directement (field_player_avatar.c:1688).
const FISHING_START_ROUND = 3, FISHING_GOT_BITE = 6, FISHING_ON_HOOK = 9;
const FISHING_NO_BITE = 11, FISHING_GOT_AWAY = 12, FISHING_SHOW_RESULT = 13;

// Fenêtre dialogue pêche (= window 0 décomp). Template standard text box (cf. field-message-box).
const sFishingTextBoxTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 0x194,
} as const;
let sFishingWindowId = -1;

/** 1:1 décomp `LoadMessageBoxAndFrameGfx(0, TRUE)` (Fishing_InitDots) : charge les tiles/palette du
 *  message box + dessine le cadre dialogue sur la fenêtre pêche. */
function _fishingLoadMessageBoxAndFrameGfx(): void {
  if (sFishingWindowId < 0) sFishingWindowId = AddWindow(sFishingTextBoxTemplate);
  LoadMessageBoxGfx(sFishingWindowId, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sFishingWindowId, true);
}

/** 1:1 STRICT décomp `AlignFishingAnimationFrames(void)` (field_player_avatar.c:2028) : avance l'anim
 *  de pêche du sprite joueur (seul driver pendant la pêche — le spine n'anime que les `inanimate`) et
 *  pose l'offset x2/y2 selon la frame courante (`.type` = imageValue de l'AnimCmd : 1/2/3 → x2=±8,
 *  5 → y2=-8, 10/11 → y2=8). */
function AlignFishingAnimationFrames(): void {
  const rt = getRuntime();
  const playerSprite = gPlayerAvatar.spriteId >= 0 ? rt.gSprites[gPlayerAvatar.spriteId] : null;
  if (!playerSprite) return;
  rt.AnimateSprite(gPlayerAvatar.spriteId);
  playerSprite.x2 = 0;
  playerSprite.y2 = 0;
  // `.type` 1:1 : frame → imageValue, end → -1 (union AnimCmd décomp).
  const anims = playerSprite.anims;
  const cmdType = (i: number): number => {
    const cmd = anims && anims[playerSprite.animNum] ? (anims[playerSprite.animNum] as ReadonlyArray<{ kind?: string; imageValue?: number }>)[i] : undefined;
    if (!cmd) return -1;
    if (cmd.kind === 'end') return -1;
    if (cmd.kind === 'frame') return cmd.imageValue ?? 0;
    return cmd.kind === 'jump' ? -2 : -3;
  };
  let animCmdIndex = playerSprite.animCmdIndex;
  if (cmdType(animCmdIndex) === -1) {
    animCmdIndex--;
  } else {
    playerSprite.animDelayCounter++;
    if (cmdType(animCmdIndex) === -1)
      animCmdIndex--;
  }
  const animType = cmdType(animCmdIndex);
  if (animType === 1 || animType === 2 || animType === 3) {
    playerSprite.x2 = 8;
    if (GetPlayerFacingDirection() === 3)  // DIR_WEST
      playerSprite.x2 = -8;
  }
  if (animType === 5)
    playerSprite.y2 = -8;
  if (animType === 10 || animType === 11)
    playerSprite.y2 = 8;
  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
    SetSurfBlob_PlayerOffset(rt, gObjectEvents[gPlayerAvatar.objectEventId].fieldEffectSpriteId, true, playerSprite.y2);
}

/** 1:1 STRICT décomp `void StartFishing(u8 rod)` (field_player_avatar.c:1715). */
export function StartFishing(rod: number): void {
  const taskId = CreateTask(Task_Fishing, 0xFF);
  const task = GetTask(taskId);
  if (!task) return;
  task.data[T_FISH_ROD] = rod;
  Task_Fishing(task);  // 1:1 appel synchrone immédiat
}

/** 1:1 STRICT décomp `Task_Fishing(u8 taskId)` (field_player_avatar.c:1723) :
 *    while (sFishingStateFuncs[tStep](&gTasks[taskId])) ;
 *  + tick du texte 1×/frame : le décomp s'appuie sur le `RunTextPrinters()` global de la boucle
 *  overworld (que NOTRE overworld ne tick pas) → on le tick ici (scope pêche, effet identique). */
function Task_Fishing(task: DecompTask): void {
  if (sFishingWindowId >= 0) {
    RunTextPrinters();
    CopyWindowToVram(sFishingWindowId, 2);  // COPYWIN_GFX
  }
  while (sFishingStateFuncs[task.data[T_FISH_STEP]](task));
}

function Fishing_Init(task: DecompTask): boolean {
  LockPlayerFieldControls();
  gPlayerAvatar.preventStep = true;
  task.data[T_FISH_STEP]++;
  return false;
}

function Fishing_GetRodOut(task: DecompTask): boolean {
  // 1:1 minRounds1/minRounds2 (field_player_avatar.c:1740) : OLD/GOOD/SUPER.
  const minRounds1 = [1, 1, 1];          // [OLD, GOOD, SUPER]
  const minRounds2 = [1, 3, 6];
  const rod = task.data[T_FISH_ROD];
  task.data[T_FISH_ROUNDS_PLAYED] = 0;
  task.data[T_FISH_MIN_ROUNDS] = minRounds1[rod] + (_RandomFishing() % minRounds2[rod]);
  // tPlayerGfxId = graphicsId du joueur avant la pêche (restauré à la fin par ObjectEventSetGraphicsId).
  // ⚠️ Déviation port : le slot joueur NORMAL porte l'alias 'Brendan'/'May' (pas le nom catalogue) que
  // le keystone ne sait pas restaurer → on le normalise vers le gfx NORMAL d'état. (Surf/vélo gardent
  // leur vrai nom catalogue, restaurable tel quel.)
  let gfxBefore = gObjectEvents[gPlayerAvatar.objectEventId].graphicsId;
  if (gfxBefore === 'Brendan' || gfxBefore === 'May')
    gfxBefore = GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_NORMAL);
  sFishingPlayerGfxId = gfxBefore;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  ObjectEventClearHeldMovementIfActive(playerObjEvent);
  playerObjEvent.enableAnim = true;
  SetPlayerAvatarFishing(playerObjEvent.facingDirection);
  task.data[T_FISH_STEP]++;
  return false;
}

function Fishing_WaitBeforeDots(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  // attend 1 seconde
  task.data[T_FISH_FRAME_COUNTER]++;
  if (task.data[T_FISH_FRAME_COUNTER] >= 60)
    task.data[T_FISH_STEP]++;
  return false;
}

function Fishing_InitDots(task: DecompTask): boolean {
  _fishingLoadMessageBoxAndFrameGfx();  // 1:1 LoadMessageBoxAndFrameGfx(0, TRUE)
  task.data[T_FISH_STEP]++;
  task.data[T_FISH_FRAME_COUNTER] = 0;
  task.data[T_FISH_NUM_DOTS] = 0;
  let randVal = _RandomFishing();
  randVal %= 10;
  task.data[T_FISH_DOTS_REQUIRED] = randVal + 1;
  if (task.data[T_FISH_ROUNDS_PLAYED] === 0)
    task.data[T_FISH_DOTS_REQUIRED] = randVal + 4;
  if (task.data[T_FISH_DOTS_REQUIRED] >= 10)
    task.data[T_FISH_DOTS_REQUIRED] = 10;
  return true;
}

function Fishing_ShowDots(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  task.data[T_FISH_FRAME_COUNTER]++;
  if (getRuntime().gMain.newKeys & A_BUTTON) {
    task.data[T_FISH_STEP] = FISHING_NO_BITE;
    if (task.data[T_FISH_ROUNDS_PLAYED] !== 0)
      task.data[T_FISH_STEP] = FISHING_GOT_AWAY;
    return true;
  } else {
    if (task.data[T_FISH_FRAME_COUNTER] >= 20) {
      task.data[T_FISH_FRAME_COUNTER] = 0;
      if (task.data[T_FISH_NUM_DOTS] >= task.data[T_FISH_DOTS_REQUIRED]) {
        task.data[T_FISH_STEP]++;
        if (task.data[T_FISH_ROUNDS_PLAYED] !== 0)
          task.data[T_FISH_STEP]++;
        task.data[T_FISH_ROUNDS_PLAYED]++;
      } else {
        // 1:1 AddTextPrinterParameterized(0, FONT_NORMAL, dot, numDots*8, 1, 0, NULL) — un point "·".
        AddTextPrinterParameterized(sFishingWindowId, FONT_NORMAL, '·', task.data[T_FISH_NUM_DOTS] * 8, 1, 0, null);
        task.data[T_FISH_NUM_DOTS]++;
      }
    }
    return false;
  }
}

function Fishing_CheckForBite(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  task.data[T_FISH_STEP]++;
  let bite = false;
  if (!DoesCurrentMapHaveFishingMons()) {
    task.data[T_FISH_STEP] = FISHING_NO_BITE;
  } else {
    // 1:1 : bonus de morsure Suction Cups / Sticky Hold (GetMonAbility) — dette R3 (GetMonAbility non
    // porté, comme dans wild_encounter). Le chemin de morsure normal (50%) s'applique.
    if (!bite) {
      if (_RandomFishing() & 1)
        task.data[T_FISH_STEP] = FISHING_NO_BITE;
      else
        bite = true;
    }
    if (bite === true)
      getRuntime().StartSpriteAnim(gPlayerAvatar.spriteId, GetFishingBiteDirectionAnimNum(GetPlayerFacingDirection()));
  }
  return true;
}

function Fishing_GotBite(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  // 1:1 AddTextPrinterParameterized(0, FONT_NORMAL, gText_OhABite, 0, 17, 0, NULL).
  AddTextPrinterParameterized(sFishingWindowId, FONT_NORMAL, getString('gText_OhABite'), 0, 17, 0, null);
  task.data[T_FISH_STEP]++;
  task.data[T_FISH_FRAME_COUNTER] = 0;
  return false;
}

function Fishing_WaitForA(task: DecompTask): boolean {
  // 1:1 reelTimeouts : OLD 36 / GOOD 33 / SUPER 30.
  const reelTimeouts = [36, 33, 30];
  AlignFishingAnimationFrames();
  task.data[T_FISH_FRAME_COUNTER]++;
  if (task.data[T_FISH_FRAME_COUNTER] >= reelTimeouts[task.data[T_FISH_ROD]])
    task.data[T_FISH_STEP] = FISHING_GOT_AWAY;
  else if (getRuntime().gMain.newKeys & A_BUTTON)
    task.data[T_FISH_STEP]++;
  return false;
}

function Fishing_CheckMoreDots(task: DecompTask): boolean {
  // 1:1 moreDotsChance[rod][round] : OLD {0,0} / GOOD {40,10} / SUPER {70,30}.
  const moreDotsChance = [[0, 0], [40, 10], [70, 30]];
  AlignFishingAnimationFrames();
  task.data[T_FISH_STEP]++;
  if (task.data[T_FISH_ROUNDS_PLAYED] < task.data[T_FISH_MIN_ROUNDS]) {
    task.data[T_FISH_STEP] = FISHING_START_ROUND;
  } else if (task.data[T_FISH_ROUNDS_PLAYED] < 2) {
    const probability = _RandomFishing() % 100;
    if (moreDotsChance[task.data[T_FISH_ROD]][task.data[T_FISH_ROUNDS_PLAYED]] > probability)
      task.data[T_FISH_STEP] = FISHING_START_ROUND;
  }
  return false;
}

function Fishing_MonOnHook(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  FillWindowPixelBuffer(sFishingWindowId, PIXEL_FILL(1));
  AddTextPrinterParameterized2(sFishingWindowId, FONT_NORMAL, getString('gText_PokemonOnHook'), 1, null,
    TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  task.data[T_FISH_STEP]++;
  task.data[T_FISH_FRAME_COUNTER] = 0;
  return false;
}

function Fishing_StartEncounter(task: DecompTask): boolean {
  if (task.data[T_FISH_FRAME_COUNTER] === 0)
    AlignFishingAnimationFrames();
  RunTextPrinters();
  if (task.data[T_FISH_FRAME_COUNTER] === 0) {
    if (!IsTextPrinterActive(sFishingWindowId)) {
      const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
      ObjectEventSetGraphicsId(playerObjEvent, sFishingPlayerGfxId);
      ObjectEventTurn(playerObjEvent, playerObjEvent.movementDirection);
      if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
        SetSurfBlob_PlayerOffset(getRuntime(), playerObjEvent.fieldEffectSpriteId, false, 0);
      const sp = getRuntime().gSprites[gPlayerAvatar.spriteId];
      if (sp) { sp.x2 = 0; sp.y2 = 0; }
      ClearDialogWindowAndFrame(sFishingWindowId, true);
      task.data[T_FISH_FRAME_COUNTER]++;
      return false;
    }
  }
  if (task.data[T_FISH_FRAME_COUNTER] !== 0) {
    gPlayerAvatar.preventStep = false;
    UnlockPlayerFieldControls();
    FishingWildEncounter(task.data[T_FISH_ROD]);
    // RecordFishingAttemptForTV(TRUE) — TV, dette R3 (skip).
    DestroyTask(FindTaskIdByFunc(Task_Fishing));
  }
  return false;
}

function Fishing_NotEvenNibble(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  getRuntime().StartSpriteAnim(gPlayerAvatar.spriteId, GetFishingNoCatchDirectionAnimNum(GetPlayerFacingDirection()));
  FillWindowPixelBuffer(sFishingWindowId, PIXEL_FILL(1));
  AddTextPrinterParameterized2(sFishingWindowId, FONT_NORMAL, getString('gText_NotEvenANibble'), 1, null,
    TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  task.data[T_FISH_STEP] = FISHING_SHOW_RESULT;
  return true;
}

function Fishing_GotAway(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  getRuntime().StartSpriteAnim(gPlayerAvatar.spriteId, GetFishingNoCatchDirectionAnimNum(GetPlayerFacingDirection()));
  FillWindowPixelBuffer(sFishingWindowId, PIXEL_FILL(1));
  AddTextPrinterParameterized2(sFishingWindowId, FONT_NORMAL, getString('gText_ItGotAway'), 1, null,
    TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  task.data[T_FISH_STEP]++;
  return true;
}

function Fishing_NoMon(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  task.data[T_FISH_STEP]++;
  return false;
}

function Fishing_PutRodAway(task: DecompTask): boolean {
  AlignFishingAnimationFrames();
  const sp = getRuntime().gSprites[gPlayerAvatar.spriteId];
  if (sp && sp.animEnded) {
    const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
    ObjectEventSetGraphicsId(playerObjEvent, sFishingPlayerGfxId);
    ObjectEventTurn(playerObjEvent, playerObjEvent.movementDirection);
    if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
      SetSurfBlob_PlayerOffset(getRuntime(), playerObjEvent.fieldEffectSpriteId, false, 0);
    sp.x2 = 0; sp.y2 = 0;
    task.data[T_FISH_STEP]++;
  }
  return false;
}

function Fishing_EndNoMon(task: DecompTask): boolean {
  void task;
  RunTextPrinters();
  if (!IsTextPrinterActive(sFishingWindowId)) {
    gPlayerAvatar.preventStep = false;
    UnlockPlayerFieldControls();
    UnfreezeObjectEvents();
    ClearDialogWindowAndFrame(sFishingWindowId, true);
    // RecordFishingAttemptForTV(FALSE) — TV, dette R3 (skip).
    DestroyTask(FindTaskIdByFunc(Task_Fishing));
  }
  return false;
}

/** 1:1 STRICT décomp `sFishingStateFuncs[]` (field_player_avatar.c:1695). */
const sFishingStateFuncs: ReadonlyArray<(task: DecompTask) => boolean> = [
  Fishing_Init,
  Fishing_GetRodOut,
  Fishing_WaitBeforeDots,
  Fishing_InitDots,       // FISHING_START_ROUND
  Fishing_ShowDots,
  Fishing_CheckForBite,
  Fishing_GotBite,        // FISHING_GOT_BITE
  Fishing_WaitForA,
  Fishing_CheckMoreDots,
  Fishing_MonOnHook,      // FISHING_ON_HOOK
  Fishing_StartEncounter,
  Fishing_NotEvenNibble,  // FISHING_NO_BITE
  Fishing_GotAway,        // FISHING_GOT_AWAY
  Fishing_NoMon,          // FISHING_SHOW_RESULT
  Fishing_PutRodAway,
  Fishing_EndNoMon,
];

// Dev hook (A/B pêche : force StartFishing après préchargement du gfx canne).
(globalThis as Record<string, unknown>).__StartFishing = async (rod = 2) => {
  await PreloadObjectEventGraphics(GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_FISHING));
  StartFishing(rod);
  return 'StartFishing rod=' + rod;
};

/** 1:1 STRICT décomp `TestPlayerAvatarFlags` (field_player_avatar.c:1330) :
 *    return gPlayerAvatar.flags & flags; */
export function TestPlayerAvatarFlags(flags: number): number {
  return gPlayerAvatar.flags & flags;
}

/** 1:1 STRICT décomp `SetPlayerAvatarStateMask` (field_player_avatar.c:1325) :
 *    flags &= (DASH | FORCED_MOVE | CONTROLLABLE); flags |= flags_param;
 *  Préserve les 3 bits transverses (dash/forced/controllable), reset les bits d'ÉTAT
 *  (ON_FOOT/MACH/ACRO/SURF/UNDERWATER), pose le nouvel état. */
export function SetPlayerAvatarStateMask(flags: number): void {
  gPlayerAvatar.flags &= (PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_FORCED_MOVE | PLAYER_AVATAR_FLAG_CONTROLLABLE);
  gPlayerAvatar.flags |= flags;
}

/** 1:1 STRICT décomp `SetPlayerAvatarTransitionFlags` (field_player_avatar.c:805) :
 *    gPlayerAvatar.transitionFlags |= transitionFlags; DoPlayerAvatarTransition(); */
export function SetPlayerAvatarTransitionFlags(transitionFlags: number): void {
  gPlayerAvatar.transitionFlags |= transitionFlags;
  DoPlayerAvatarTransition();
}

/** 1:1 STRICT décomp `SetPlayerAvatarExtraStateTransition` (field_player_avatar.c:1356) :
 *    stateFlag = GetPlayerAvatarStateTransitionByGraphicsId(graphicsId, gender);
 *    transitionFlags |= stateFlag | transitionFlag; DoPlayerAvatarTransition();
 *  Appelé par `SetPlayerAvatarObjectEventIdAndObjectId` au spawn du player object event
 *  (= au chargement de map / ReturnToField) avec transitionFlag=CONTROLLABLE → ré-établit
 *  flags = ÉTAT_du_gfx | CONTROLLABLE (à pied : ON_FOOT | CONTROLLABLE). */
export function SetPlayerAvatarExtraStateTransition(graphicsId: number | string, transitionFlag: number): void {
  const stateFlag = GetPlayerAvatarStateTransitionByGraphicsId(graphicsId, gPlayerAvatar.gender);
  gPlayerAvatar.transitionFlags |= stateFlag | transitionFlag;
  DoPlayerAvatarTransition();
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_Normal` (field_player_avatar.c:832) :
 *    ObjectEventSetGraphicsId(Normal) + ObjectEventTurn(movementDir) + StateMask(ON_FOOT).
 *  La part gfx RESTAURE la feuille NORMAL réservée (keystone `_restorePlayerNormalGfx`, idempotent
 *  à pied) — indispensable au DÉMONTAGE vélo/surf (retour pied via SetPlayerAvatarTransitionFlags(ON_FOOT)). */
function PlayerAvatarTransition_Normal(objEvent: ObjectEvent): void {
  ObjectEventSetGraphicsId(objEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_NORMAL));
  ObjectEventTurn(objEvent, objEvent.movementDirection);
  SetPlayerAvatarStateMask(PLAYER_AVATAR_FLAG_ON_FOOT);
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_MachBike` (fpa.c:839) :
 *    ObjectEventSetGraphicsId(MachBike) + ObjectEventTurn + StateMask(MACH_BIKE) + BikeClearState(0,0). */
function PlayerAvatarTransition_MachBike(objEvent: ObjectEvent): void {
  ObjectEventSetGraphicsId(objEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_MACH_BIKE));
  ObjectEventTurn(objEvent, objEvent.movementDirection);
  SetPlayerAvatarStateMask(PLAYER_AVATAR_FLAG_MACH_BIKE);
  BikeClearState(0, 0);
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_AcroBike` (fpa.c:847) :
 *    ObjectEventSetGraphicsId(AcroBike) + ObjectEventTurn + StateMask(ACRO_BIKE) + BikeClearState(0,0)
 *    + Bike_HandleBumpySlopeJump(). */
function PlayerAvatarTransition_AcroBike(objEvent: ObjectEvent): void {
  ObjectEventSetGraphicsId(objEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_ACRO_BIKE));
  ObjectEventTurn(objEvent, objEvent.movementDirection);
  SetPlayerAvatarStateMask(PLAYER_AVATAR_FLAG_ACRO_BIKE);
  BikeClearState(0, 0);
  Bike_HandleBumpySlopeJump();
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_Surfing` (fpa.c:856). Part flags portée ; gfx +
 *  FieldEffectStart(FLDEFF_SURF_BLOB) + SetSurfBlob_BobState = sous-système surf (étape 5). */
function PlayerAvatarTransition_Surfing(_objEvent: ObjectEvent): void {
  SetPlayerAvatarStateMask(PLAYER_AVATAR_FLAG_SURFING);
  // ObjectEventSetGraphicsId(Surfing) + ObjectEventTurn + FieldEffectStart(FLDEFF_SURF_BLOB) — étape 5 (surf)
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_Underwater` (fpa.c:871). Part flags portée ;
 *  gfx + StartUnderwaterSurfBlobBobbing = sous-système plongée (étape 5). */
function PlayerAvatarTransition_Underwater(_objEvent: ObjectEvent): void {
  SetPlayerAvatarStateMask(PLAYER_AVATAR_FLAG_UNDERWATER);
  // ObjectEventSetGraphicsId(Underwater) + ObjectEventTurn + StartUnderwaterSurfBlobBobbing — étape 5
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_ReturnToField` (field_player_avatar.c:879) :
 *    gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_CONTROLLABLE;
 *  Re-set CONTROLLABLE (= suppression du forced movement pour le 1er cycle après une transition /
 *  un chargement de map). AUCUNE dépendance graphique → porté en entier. */
function PlayerAvatarTransition_ReturnToField(_objEvent: ObjectEvent): void {
  gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_CONTROLLABLE;
}

/** 1:1 STRICT décomp `PlayerAvatarTransition_Dummy` (field_player_avatar.c:827) — fishing/watering, no-op. */
function PlayerAvatarTransition_Dummy(_objEvent: ObjectEvent): void {
  // no-op (décomp)
}

/** 1:1 STRICT décomp `sPlayerAvatarTransitionFuncs[]` (field_player_avatar.c:214).
 *  Indexé par PLAYER_AVATAR_STATE_* (= position du bit dans transitionFlags). */
const sPlayerAvatarTransitionFuncs: ReadonlyArray<(objEvent: ObjectEvent) => void> = [
  PlayerAvatarTransition_Normal,        // [PLAYER_AVATAR_STATE_NORMAL]
  PlayerAvatarTransition_MachBike,      // [PLAYER_AVATAR_STATE_MACH_BIKE]
  PlayerAvatarTransition_AcroBike,      // [PLAYER_AVATAR_STATE_ACRO_BIKE]
  PlayerAvatarTransition_Surfing,       // [PLAYER_AVATAR_STATE_SURFING]
  PlayerAvatarTransition_Underwater,    // [PLAYER_AVATAR_STATE_UNDERWATER]
  PlayerAvatarTransition_ReturnToField, // [PLAYER_AVATAR_STATE_FIELD_MOVE]
  PlayerAvatarTransition_Dummy,         // [PLAYER_AVATAR_STATE_FISHING]
  PlayerAvatarTransition_Dummy,         // [PLAYER_AVATAR_STATE_WATERING]
];

/** 1:1 STRICT décomp `DoPlayerAvatarTransition` (field_player_avatar.c:811).
 *  Consomme `transitionFlags` bit-à-bit : pour chaque bit i set, exécute
 *  sPlayerAvatarTransitionFuncs[i] (state i), puis remet transitionFlags à 0.
 *  Appelée chaque frame en tête de PlayerStep (no-op si transitionFlags==0). */
function DoPlayerAvatarTransition(): void {
  let flags = gPlayerAvatar.transitionFlags;
  if (flags !== 0) {
    for (let i = 0; i < sPlayerAvatarTransitionFuncs.length; i++, flags >>= 1) {
      if (flags & 1)
        sPlayerAvatarTransitionFuncs[i](gObjectEvents[gPlayerAvatar.objectEventId]);
    }
    gPlayerAvatar.transitionFlags = 0;
  }
}

// ─── 1:1 décomp `field_player_avatar.c` — FORCED MOVEMENT (étape 3) ───────────
// Mouvement imposé par le terrain : glace (Slip), tuiles de marche forcée (Walk*),
// courants d'eau (Pushed*ByCurrent), slides (Slide*), pente boueuse (MuddySlope),
// tapis secret base (MatJump/MatSpin). Gate par PLAYER_AVATAR_FLAG_CONTROLLABLE :
// après le 1er pas, `PlayerAllowForcedMovementIfMovingSameDirection` clear CONTROLLABLE,
// ce qui ARME le check forced movement à chaque tuile suivante (re-set CONTROLLABLE =
// suppression d'un cycle, via PlayerAvatarTransition_ReturnToField — étape 4).

/** 1:1 STRICT décomp `ForcedMovement_None` (field_player_avatar.c:429).
 *  Sort de l'état forced (FORCED_MOVE) : ré-active l'anim + déverrouille la face. return FALSE
 *  (= 0 → PlayerStep procède à l'input normal). Aussi appelé par `CancelPlayerForcedMovement`. */
function ForcedMovement_None(): number {
  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED_MOVE) {
    const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
    playerObjEvent.facingDirectionLocked = false;
    playerObjEvent.enableAnim = true;
    SetObjectEventDirection(playerObjEvent, playerObjEvent.facingDirection);
    gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_FORCED_MOVE;
  }
  return 0;  // FALSE
}

/** 1:1 STRICT décomp `DoForcedMovement` (field_player_avatar.c:443).
 *  Set FORCED_MOVE, teste la collision dans `direction` : collision NONE → moveFunc(dir) +
 *  runningState=MOVING + return TRUE ; collision < STOP_SURFING (mur) → ForcedMovement_None +
 *  return FALSE (= bloqué) ; sinon (LEDGE_JUMP→PlayerJumpLedge, etc.) → MOVING + return TRUE. */
function DoForcedMovement(direction: number, moveFunc: (dir: number) => void): number {
  const playerAvatar = gPlayerAvatar;
  const collision = CheckForPlayerAvatarCollision(direction);

  playerAvatar.flags |= PLAYER_AVATAR_FLAG_FORCED_MOVE;
  if (collision) {
    ForcedMovement_None();
    if (collision < COLLISION_STOP_SURFING) {
      return 0;  // FALSE — mur : forced movement bloqué.
    } else {
      if (collision === COLLISION_LEDGE_JUMP)
        PlayerJumpLedge(direction);
      playerAvatar.flags |= PLAYER_AVATAR_FLAG_FORCED_MOVE;
      playerAvatar.runningState = MOVING;
      return 1;  // TRUE
    }
  } else {
    playerAvatar.runningState = MOVING;
    moveFunc(direction);
    return 1;  // TRUE
  }
}

/** 1:1 STRICT décomp `DoForcedMovementInCurrentDirection` (field_player_avatar.c:473).
 *  disableAnim=TRUE (l'anim de marche est gelée → glisse sans bouger les jambes), puis
 *  DoForcedMovement dans la `movementDirection` courante. Utilisé par `ForcedMovement_Slip`. */
function DoForcedMovementInCurrentDirection(moveFunc: (dir: number) => void): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  playerObjEvent.disableAnim = true;
  return DoForcedMovement(playerObjEvent.movementDirection, moveFunc);
}

/** 1:1 STRICT décomp `ForcedMovement_Slip` (field_player_avatar.c:481) — glace : glisse vite
 *  dans la direction courante, anim gelée. */
function ForcedMovement_Slip(): number {
  return DoForcedMovementInCurrentDirection(PlayerWalkFast);
}

/** 1:1 STRICT décomp `ForcedMovement_Walk*` (field_player_avatar.c:486-504) — tuiles de
 *  marche forcée (escalator-like) : marche normale dans une direction imposée. */
function ForcedMovement_WalkSouth(): number { return DoForcedMovement(DIR_SOUTH, PlayerWalkNormal); }
function ForcedMovement_WalkNorth(): number { return DoForcedMovement(DIR_NORTH, PlayerWalkNormal); }
function ForcedMovement_WalkWest(): number  { return DoForcedMovement(DIR_WEST,  PlayerWalkNormal); }
function ForcedMovement_WalkEast(): number  { return DoForcedMovement(DIR_EAST,  PlayerWalkNormal); }

/** 1:1 STRICT décomp `ForcedMovement_Pushed*ByCurrent` (field_player_avatar.c:506-524) —
 *  courants d'eau (en surf) : poussé vite (RideWaterCurrent) dans la direction du courant. */
function ForcedMovement_PushedSouthByCurrent(): number { return DoForcedMovement(DIR_SOUTH, PlayerRideWaterCurrent); }
function ForcedMovement_PushedNorthByCurrent(): number { return DoForcedMovement(DIR_NORTH, PlayerRideWaterCurrent); }
function ForcedMovement_PushedWestByCurrent(): number  { return DoForcedMovement(DIR_WEST,  PlayerRideWaterCurrent); }
function ForcedMovement_PushedEastByCurrent(): number  { return DoForcedMovement(DIR_EAST,  PlayerRideWaterCurrent); }

/** 1:1 STRICT décomp `ForcedMovement_Slide` (field_player_avatar.c:526) — slides (ice puzzles) :
 *  disableAnim + facingDirectionLocked (glisse sans tourner ni animer), direction imposée. */
function ForcedMovement_Slide(direction: number, moveFunc: (dir: number) => void): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  playerObjEvent.disableAnim = true;
  playerObjEvent.facingDirectionLocked = true;
  return DoForcedMovement(direction, moveFunc);
}

function ForcedMovement_SlideSouth(): number { return ForcedMovement_Slide(DIR_SOUTH, PlayerWalkFast); }
function ForcedMovement_SlideNorth(): number { return ForcedMovement_Slide(DIR_NORTH, PlayerWalkFast); }
function ForcedMovement_SlideWest(): number  { return ForcedMovement_Slide(DIR_WEST,  PlayerWalkFast); }
function ForcedMovement_SlideEast(): number  { return ForcedMovement_Slide(DIR_EAST,  PlayerWalkFast); }

/** 1:1 STRICT décomp `ForcedMovement_MatJump`/`ForcedMovement_MatSpin` (field_player_avatar.c:555).
 *  Tapis de saut/rotation des bases secrètes. La machine à tâches (`DoPlayerMatJump`/
 *  `DoPlayerMatSpin`) est la feature SECRET BASE (étape 5) ; le test (IsSecretBaseJumpMat/
 *  SpinMat) est câblé 1:1 dans la table → le dispatch s'active dès que l'étape 5 porte les
 *  tâches. return TRUE (= forced movement déclenché). */
function ForcedMovement_MatJump(): number { DoPlayerMatJump(); return 1; }
function ForcedMovement_MatSpin(): number { DoPlayerMatSpin(); return 1; }

/** 1:1 STRICT décomp `ForcedMovement_MuddySlope` (field_player_avatar.c:567) — pente boueuse :
 *  si on ne monte pas (movementDirection != NORD) OU qu'on n'est pas à vitesse FASTEST (mach
 *  bike) → on est repoussé vers le SUD (glisse en bas). À pied GetPlayerSpeed=NORMAL<FASTEST
 *  → toujours repoussé. Sinon (mach bike plein gaz vers le nord) → FALSE (on franchit). */
function ForcedMovement_MuddySlope(): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (playerObjEvent.movementDirection !== DIR_NORTH || GetPlayerSpeed() < PLAYER_SPEED_FASTEST) {
    Bike_UpdateBikeCounterSpeed(0);
    playerObjEvent.facingDirectionLocked = true;
    return DoForcedMovement(DIR_SOUTH, PlayerWalkFast);
  } else {
    return 0;  // FALSE
  }
}

/** 1:1 STRICT décomp `sForcedMovementTestFuncs[NUM_FORCED_MOVEMENTS]` (field_player_avatar.c:144).
 *  Index i → si le test passe, `GetForcedMovementByMetatileBehavior` retourne i+1. */
const sForcedMovementTestFuncs: ReadonlyArray<(mb: number) => boolean> = [
  MetatileBehavior_IsTrickHouseSlipperyFloor,
  MetatileBehavior_IsIce_2,
  MetatileBehavior_IsWalkSouth,
  MetatileBehavior_IsWalkNorth,
  MetatileBehavior_IsWalkWest,
  MetatileBehavior_IsWalkEast,
  MetatileBehavior_IsSouthwardCurrent,
  MetatileBehavior_IsNorthwardCurrent,
  MetatileBehavior_IsWestwardCurrent,
  MetatileBehavior_IsEastwardCurrent,
  MetatileBehavior_IsSlideSouth,
  MetatileBehavior_IsSlideNorth,
  MetatileBehavior_IsSlideWest,
  MetatileBehavior_IsSlideEast,
  MetatileBehavior_IsWaterfall,
  MetatileBehavior_IsSecretBaseJumpMat,
  MetatileBehavior_IsSecretBaseSpinMat,
  MetatileBehavior_IsMuddySlope,
];

/** 1:1 STRICT décomp `sForcedMovementFuncs[NUM_FORCED_MOVEMENTS + 1]` (field_player_avatar.c:167).
 *  Index 0 = ForcedMovement_None ; index i+1 = handler du test i. Note décomp : TrickHouse +
 *  Ice_2 partagent ForcedMovement_Slip, Waterfall partage ForcedMovement_PushedSouthByCurrent. */
const sForcedMovementFuncs: ReadonlyArray<() => number> = [
  ForcedMovement_None,
  ForcedMovement_Slip,                    // TrickHouseSlipperyFloor
  ForcedMovement_Slip,                    // Ice_2
  ForcedMovement_WalkSouth,
  ForcedMovement_WalkNorth,
  ForcedMovement_WalkWest,
  ForcedMovement_WalkEast,
  ForcedMovement_PushedSouthByCurrent,
  ForcedMovement_PushedNorthByCurrent,
  ForcedMovement_PushedWestByCurrent,
  ForcedMovement_PushedEastByCurrent,
  ForcedMovement_SlideSouth,
  ForcedMovement_SlideNorth,
  ForcedMovement_SlideWest,
  ForcedMovement_SlideEast,
  ForcedMovement_PushedSouthByCurrent,    // Waterfall
  ForcedMovement_MatJump,
  ForcedMovement_MatSpin,
  ForcedMovement_MuddySlope,
];

/** 1:1 STRICT décomp `GetForcedMovementByMetatileBehavior` (field_player_avatar.c:412).
 *  UNIQUEMENT si CONTROLLABLE est CLEAR (= forced movement armé après le 1er pas) : scanne les
 *  18 tests sur le `currentMetatileBehavior` du joueur, retourne i+1 au premier match, sinon 0. */
function GetForcedMovementByMetatileBehavior(): number {
  if (!(gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_CONTROLLABLE)) {
    const metatileBehavior = gObjectEvents[gPlayerAvatar.objectEventId].currentMetatileBehavior;
    for (let i = 0; i < sForcedMovementTestFuncs.length; i++) {
      if (sForcedMovementTestFuncs[i](metatileBehavior))
        return i + 1;
    }
  }
  return 0;
}

/** 1:1 STRICT décomp `TryDoMetatileBehaviorForcedMovement` (field_player_avatar.c:407) :
 *    return sForcedMovementFuncs[GetForcedMovementByMetatileBehavior()]();
 *  Appelé par PlayerStep AVANT l'input clavier : si non-zéro (forced movement déclenché),
 *  PlayerStep SAUTE MovePlayerAvatarUsingKeypadInput (le terrain a la priorité). */
function TryDoMetatileBehaviorForcedMovement(): number {
  return sForcedMovementFuncs[GetForcedMovementByMetatileBehavior()]();
}

/** 1:1 STRICT décomp `DoPlayerMatJump` (field_player_avatar.c:1527) — tapis de saut des bases
 *  secrètes. Machine à tâches (CreateTask + sPlayerAvatarSecretBaseMatJump) = feature SECRET
 *  BASE, portée à l'étape 5. Le test IsSecretBaseJumpMat est câblé → s'active dès l'étape 5. */
function DoPlayerMatJump(): void {
  // étape 5 (secret base — tâche DoPlayerAvatarSecretBaseMatJump) — non encore portée.
}

/** 1:1 STRICT décomp `DoPlayerMatSpin` (field_player_avatar.c:1559) — tapis de rotation des
 *  bases secrètes. Machine à tâches 5-étapes = feature SECRET BASE, portée à l'étape 5. */
function DoPlayerMatSpin(): void {
  // étape 5 (secret base — tâche PlayerAvatar_DoSecretBaseMatSpin) — non encore portée.
}

// ═══════════════════════════════════════════════════════════════════════════
// Warp spin (DoPlayerSpinEntrance/Exit) — 1:1 décomp field_player_avatar.c:2063-2226.
// Le joueur tourne sur lui-même (cycle facing S→W→E→N via face-direction held
// movements) en montant (exit, sort de l'écran) / descendant (entrance, retombe
// au sol). Utilisé par les warps "spin" (Teleport, salles spéciales).
// Task data (1:1 #define :2077-2085) : [0]=tState [1]=tSpinDelayTimer [2]=tSpeed
// [3]=tCurY [4]=tDestY [5]=tStartDir [6]=tPriority [7]=tSubpriority [8]=tGroundTimer.
//
// ⚠️ PORT EN COURS — NON ENCORE CÂBLÉ À UN WARP (fonctions dormantes). État :
//   ✅ logique 1:1 + tâches tickées (signature `(task: DecompTask)`).
//   ✅ arc vertical adapté M3 : le décomp manipule `sprite->y` mais notre sprite
//      joueur est resync chaque frame par UpdateObjectEvents (slot→sprite) → on
//      passe par `sprite.y2` (offset additif, comme _tickJump). A/B : y2 -117→0. ✔
//   ❌ DETTE M3 : la ROTATION (face-cycle via `ObjectEventForceSetHeldMovement`)
//      ne tourne PAS — le held movement forcé du joueur n'est jamais EXÉCUTÉ
//      (seul `ScriptMovement_MoveObjects` tick les held movements, par registration ;
//      le décomp les exécute via le tick object-event général). À résoudre :
//      exécuter le held movement forcé du joueur chaque frame (fix M3 réutilisable
//      pour d'autres features player-movement) → PUIS câbler à EventScript_UseTeleport
//      + warps spin (MB_*), A/B sur tiles spin.
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `sSpinStartFacingDir` (field_player_avatar.c) — DIR_NONE par défaut. */
let sSpinStartFacingDir = DIR_NONE;

/** 1:1 décomp `SetSpinStartFacingDir` (field_player_avatar.c:2063). */
export function SetSpinStartFacingDir(direction: number): void {
  sSpinStartFacingDir = direction;
}

/** 1:1 décomp `GetSpinStartFacingDir` (field_player_avatar.c:2068). */
function GetSpinStartFacingDir(): number {
  if (sSpinStartFacingDir === DIR_NONE) return DIR_SOUTH;
  return sSpinStartFacingDir;
}

/** 1:1 décomp `sSpinDirections[]` (field_player_avatar.c:2150). */
const sSpinDirections: ReadonlyArray<number> = [DIR_SOUTH, DIR_WEST, DIR_EAST, DIR_NORTH, DIR_SOUTH];

/** 1:1 décomp `TrySpinPlayerForWarp` (field_player_avatar.c:2215). Tous les 8 frames,
 *  avance la facing d'un cran dans sSpinDirections (held movement face-direction) →
 *  l'effet "spin". `data[delayIdx]` = &tSpinDelayTimer. Retourne la facing courante/nouvelle. */
function TrySpinPlayerForWarp(object: ObjectEvent, data: number[], delayIdx: number): number {
  if (data[delayIdx] < 8 && ++data[delayIdx] < 8)
    return object.facingDirection;
  if (!ObjectEventCheckHeldMovementStatus(object))
    return object.facingDirection;
  ObjectEventForceSetHeldMovement(object, GetFaceDirectionMovementAction(sSpinDirections[object.facingDirection]));
  data[delayIdx] = 0;
  return sSpinDirections[object.facingDirection];
}

/** 1:1 décomp `Task_DoPlayerSpinExit` (field_player_avatar.c:2087) — spin en montant hors écran. */
function Task_DoPlayerSpinExit(task: DecompTask): void {
  const rt = getRuntime();
  const object = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!object) return;
  const sprite = rt.gSprites[object.spriteId];
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const data = task.data;
  // case 0 (Init) — 1:1 décomp : fallthrough vers case 1 (même frame).
  if (data[0] === 0) {
    if (!ObjectEventClearHeldMovementIfFinished(object)) return;
    SetSpinStartFacingDir(object.facingDirection);
    data[1] = 0;
    data[2] = 1;
    data[3] = ((sprite.y + sprite.y2) & 0xFFFF) << 4;
    data[4] = sprite.y;  // [M3] base resting y (cf. note y2 ci-dessous)
    sprite.y2 = 0;
    CameraObjectFreeze();
    object.fixedPriority = true;
    oam.priority = 0;
    sprite.subpriority = 0;
    sprite.subspriteMode = 'off';  // SUBSPRITES_OFF
    data[0] = 1;
  }
  switch (data[0]) {
    case 1:  // Spin while rising
      TrySpinPlayerForWarp(object, data, 1);
      data[3] -= data[2];
      data[2] += 3;
      // [M3] sprite.y est resync chaque frame par UpdateObjectEvents (slot→sprite) →
      // on applique l'arc vertical via sprite.y2 (offset additif qui survit, comme
      // _tickJump). data[4] = base resting y ; l'arc absolu décomp = data[3]>>4.
      sprite.y2 = (data[3] >> 4) - data[4];
      if ((data[3] >> 4) + (gTotalCamera.pixelOffsetY | 0) < -32)
        data[0] = 2;
      break;
    case 2:
      DestroyTask(task.taskId);
      break;
  }
}

/** 1:1 décomp `Task_DoPlayerSpinEntrance` (field_player_avatar.c:2152) — spin en retombant au sol. */
function Task_DoPlayerSpinEntrance(task: DecompTask): void {
  const rt = getRuntime();
  const object = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!object) return;
  const sprite = rt.gSprites[object.spriteId];
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const data = task.data;
  // case 0 (Init) — 1:1 décomp : fallthrough vers case 1 (même frame).
  if (data[0] === 0) {
    // 1:1 décomp : la facing de départ n'étant jamais set pour ce type de warp,
    // le joueur ressort toujours face au SUD (comportement ROM, peut-être voulu).
    data[5] = GetSpinStartFacingDir();
    ObjectEventForceSetHeldMovement(object, GetFaceDirectionMovementAction(sSpinDirections[data[5]]));
    data[1] = 0;
    data[2] = 116;
    data[4] = sprite.y;
    data[6] = oam.priority ?? 2;
    data[7] = sprite.subpriority;
    data[3] = -(((sprite.y2 & 0xFFFF)) + 32) * 16;
    sprite.y2 = 0;
    CameraObjectFreeze();
    object.fixedPriority = true;
    oam.priority = 1;
    sprite.subpriority = 0;
    sprite.subspriteMode = 'off';
    data[0] = 1;
  }
  switch (data[0]) {
    case 1:  // Spin while descending
      TrySpinPlayerForWarp(object, data, 1);
      data[3] += data[2];
      data[2] -= 3;
      if (data[2] < 4) data[2] = 4;
      // [M3] arc vertical via sprite.y2 (sprite.y resync par UpdateObjectEvents) ;
      // data[4] = tDestY = base resting y. y2 = arc absolu décomp - base.
      sprite.y2 = (data[3] >> 4) - data[4];
      if ((data[3] >> 4) >= data[4]) {
        sprite.y2 = 0;
        data[8] = 0;
        data[0]++;
      }
      break;
    case 2:  // Spin on ground
      TrySpinPlayerForWarp(object, data, 1);
      if (++data[8] > 8) data[0]++;
      break;
    case 3:  // Spin until facing original direction
      if (data[5] === TrySpinPlayerForWarp(object, data, 1)) {
        object.fixedPriority = false;
        oam.priority = data[6];
        sprite.subpriority = data[7];
        CameraObjectReset();
        DestroyTask(task.taskId);
      }
      break;
  }
}

/** 1:1 décomp `DoPlayerSpinEntrance` (field_player_avatar.c:2130). */
export function DoPlayerSpinEntrance(): void {
  const task = GetTask(CreateTask(Task_DoPlayerSpinEntrance, 0));
  if (task) Task_DoPlayerSpinEntrance(task);
}

/** 1:1 décomp `IsPlayerSpinEntranceActive` (field_player_avatar.c:2135). */
export function IsPlayerSpinEntranceActive(): boolean {
  return FuncIsActiveTask(Task_DoPlayerSpinEntrance);
}

/** 1:1 décomp `DoPlayerSpinExit` (field_player_avatar.c:2140). */
export function DoPlayerSpinExit(): void {
  const task = GetTask(CreateTask(Task_DoPlayerSpinExit, 0));
  if (task) Task_DoPlayerSpinExit(task);
}

/** 1:1 décomp `IsPlayerSpinExitActive` (field_player_avatar.c:2145). */
export function IsPlayerSpinExitActive(): boolean {
  return FuncIsActiveTask(Task_DoPlayerSpinExit);
}

/** 1:1 STRICT décomp `CancelPlayerForcedMovement` (field_player_avatar.c:1201) :
 *    ForcedMovement_None();
 *  Sort le joueur de l'état forced (utilisé par les scripts/warps). */
export function CancelPlayerForcedMovement(): void {
  ForcedMovement_None();
}

/** 1:1 STRICT décomp `TryInterruptObjectEventSpecialAnim` (field_player_avatar.c:355).
 *  LE GATE de PlayerStep (remplace les compteurs maison). Si un held movement est en cours ET
 *  PAS fini → return TRUE (PlayerStep ne fait RIEN ce frame ; le pas avance tout seul via
 *  TickObjectEventMovements). `ObjectEventClearHeldMovementIfFinished` clear le held quand il
 *  est FINI et retourne truthy → le `&&` court-circuite → return FALSE → gate ouvert : c'est
 *  ÇA qui ouvre le gate en fin de pas (et permet à PlayerSetAnimId de re-poser via son guard
 *  `!PlayerIsAnimActive()`). Exception interruptible : WALK_IN_PLACE_SLOW (collide bump, id ∈
 *  ]WALK_FAST_RIGHT, WALK_IN_PLACE_NORMAL_DOWN[ = 0x19..0x1C) → si on change de direction ou
 *  que le mur a disparu (static collision NONE), on interrompt le bump (clear + return FALSE). */
function TryInterruptObjectEventSpecialAnim(playerObjEvent: ObjectEvent, direction: number): number {
  if (ObjectEventIsMovementOverridden(playerObjEvent)
   && !ObjectEventClearHeldMovementIfFinished(playerObjEvent)) {
    const heldMovementActionId = ObjectEventGetHeldMovementActionId(playerObjEvent);
    if (heldMovementActionId > MOVEMENT_ACTION_WALK_FAST_RIGHT
     && heldMovementActionId < MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN) {
      if (direction === DIR_NONE) {
        return 1;  // TRUE
      }
      if (playerObjEvent.movementDirection !== direction) {
        ObjectEventClearHeldMovement(playerObjEvent);
        return 0;  // FALSE
      }
      if (CheckForPlayerAvatarStaticCollision(direction) === COLLISION_NONE) {
        ObjectEventClearHeldMovement(playerObjEvent);
        return 0;  // FALSE
      }
    }
    return 1;  // TRUE — gate : held en cours → PlayerStep ne fait rien ce frame.
  }
  return 0;  // FALSE — held fini (cleared) OU aucun → on procède.
}

/** 1:1 STRICT décomp `npc_clear_strange_bits` (field_player_avatar.c:380) :
 *    objEvent->inanimate = FALSE; objEvent->disableAnim = FALSE;
 *    objEvent->facingDirectionLocked = FALSE; gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_DASH; */
function npc_clear_strange_bits(objEvent: ObjectEvent): void {
  objEvent.inanimate = false;
  objEvent.disableAnim = false;
  objEvent.facingDirectionLocked = false;
  gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_DASH;
  gPlayerAvatar.dashing = false;  // miroir de DASH pour GetPlayerSpeed (re-set par PlayerNotOnBikeMoving).
}

/** 1:1 STRICT décomp `MovePlayerAvatarUsingKeypadInput` (field_player_avatar.c:559) :
 *    if (flags & (MACH_BIKE | ACRO_BIKE)) MovePlayerOnBike(...); else MovePlayerNotOnBike(...); */
function MovePlayerAvatarUsingKeypadInput(direction: number, newKeys: number, heldKeys: number): void {
  if (gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
    MovePlayerOnBike(direction, newKeys, heldKeys);
  else
    MovePlayerNotOnBike(direction, heldKeys);
}

/** 1:1 STRICT décomp `PlayerAllowForcedMovementIfMovingSameDirection` (field_player_avatar.c:570) :
 *    if (gPlayerAvatar.runningState == MOVING) gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_CONTROLLABLE; */
function PlayerAllowForcedMovementIfMovingSameDirection(): void {
  if (gPlayerAvatar.runningState === MOVING) {
    gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_CONTROLLABLE;
  }
}

/** 1:1 STRICT décomp `CheckMovementInputNotOnBike` (field_player_avatar.c:589) :
 *  ÉCRIT gPlayerAvatar.runningState ET le retourne. DIR_NONE → NOT_MOVING ;
 *  dir != GetPlayerMovementDirection() && runningState != MOVING → TURN_DIRECTION ; else MOVING. */
function CheckMovementInputNotOnBike(direction: number): number {
  if (direction === DIR_NONE) {
    return gPlayerAvatar.runningState = NOT_MOVING;
  } else if (direction !== GetPlayerMovementDirection() && gPlayerAvatar.runningState !== MOVING) {
    return gPlayerAvatar.runningState = TURN_DIRECTION;
  } else {
    return gPlayerAvatar.runningState = MOVING;
  }
}

/** 1:1 STRICT décomp `PlayerNotOnBikeTurningInPlace` (field_player_avatar.c:603) :
 *    PlayerTurnInPlace(direction); */
function PlayerNotOnBikeTurningInPlace(direction: number, _heldKeys: number): void {
  PlayerTurnInPlace(direction);
}

/** 1:1 STRICT décomp `PlayerNotOnBikeMoving` (field_player_avatar.c:608).
 *  collision = CheckForPlayerAvatarCollision(dir) ; LEDGE_JUMP→PlayerJumpLedge ; (faraway Mew
 *  skip) ; sinon `(u8)(collision - COLLISION_STOP_SURFING) > 3`→PlayerNotOnBikeCollide ;
 *  SURFING→PlayerWalkFast ; (B & FLAG_SYS_B_DASH & !IsRunningDisallowed)→PlayerRun+DASH ;
 *  else→PlayerWalkNormal. ⚠️ Le `> 3` est en arithmétique u8 (wraparound) : pour un mur normal
 *  (collision 2 ou 4), `(2-5)&0xFF = 253 > 3` → bump ; pour 5/6/7/8 (stop-surf/ledge/boulder/
 *  rotating-gate) → pas de bump (gérés ailleurs). Le `& 0xFF` réplique le u8 décomp. */
function PlayerNotOnBikeMoving(direction: number, heldKeys: number): void {
  const collision = CheckForPlayerAvatarCollision(direction);

  if (collision) {
    if (collision === COLLISION_LEDGE_JUMP) {
      PlayerJumpLedge(direction);
      return;
    } else {
      // Faraway Island Mew (collision spéciale fuite) — porté avec Faraway Island ; ailleurs no-op.
      const adjustedCollision = (collision - COLLISION_STOP_SURFING) & 0xFF;
      if (adjustedCollision > 3) {
        PlayerNotOnBikeCollide(direction);
      }
      return;
    }
  }

  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING) {
    // même vitesse que run
    PlayerWalkFast(direction);
    return;
  }

  if (!(gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_UNDERWATER)
   && (heldKeys & B_BUTTON) && FlagGet('FLAG_SYS_B_DASH')
   && !IsRunningDisallowed(gObjectEvents[gPlayerAvatar.objectEventId].currentMetatileBehavior)) {
    PlayerRun(direction);
    gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_DASH;
    gPlayerAvatar.dashing = true;  // miroir DASH pour GetPlayerSpeed.
    return;
  } else {
    PlayerWalkNormal(direction);
  }
}

/** 1:1 STRICT décomp `sPlayerNotOnBikeFuncs[]` (field_player_avatar.c) — indexé par
 *  le retour de `CheckMovementInputNotOnBike` (NOT_MOVING/TURN_DIRECTION/MOVING). */
const sPlayerNotOnBikeFuncs: ReadonlyArray<(direction: number, heldKeys: number) => void> = [
  PlayerNotOnBikeNotMoving,       // [NOT_MOVING]
  PlayerNotOnBikeTurningInPlace,  // [TURN_DIRECTION]
  PlayerNotOnBikeMoving,          // [MOVING]
];

/** 1:1 STRICT décomp `MovePlayerNotOnBike` (field_player_avatar.c:583) :
 *    sPlayerNotOnBikeFuncs[CheckMovementInputNotOnBike(direction)](direction, heldKeys); */
function MovePlayerNotOnBike(direction: number, heldKeys: number): void {
  sPlayerNotOnBikeFuncs[CheckMovementInputNotOnBike(direction)](direction, heldKeys);
}

/** 1:1 STRICT décomp `PlayerStep` (field_player_avatar.c:332). Machine de MOUVEMENT pure :
 *  aucun warp/rencontre/coord/interaction ici (ils vivent dans ProcessPlayerFieldInput, qui
 *  tourne AVANT PlayerStep dans DoCB1_Overworld). `direction` = inputStruct.dpadDirection. */
export function PlayerStep(direction: number, newKeys: number, heldKeys: number): void {
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
    // ⚠️ Gate = `stepFramesLeft === 0` (= aucun pas EN COURS), PAS `runningState !== MOVING`.
    // BUG porte (2026-06-21) : si on tourne vers une porte PILE quand un pas latéral finit, le
    // pas se termine (stepFramesLeft→0) mais runningState reste MOVING (le reset n'a pas eu lieu
    // avant que le door-warp lock engage). Avec l'ancien proxy `runningState !== MOVING`, la
    // branche 1 (lancer le pas forcé) ne firait JAMAIS → forceMovement jamais consommé ni cleared
    // → la tâche door-warp poll forceMovement===DIR_NONE à l'infini → joueur FIGÉ. `stepFramesLeft
    // === 0` est le vrai discriminant « pas de pas en cours » (le cas normal rs=NOT_MOVING marche
    // pareil : sfl y vaut 0). Repro : marche gauche → presser haut vers la porte du Centre Po.
    if (gPlayerAvatar.forceMovement !== DIR_NONE && gPlayerAvatar.stepFramesLeft === 0) {
      // 1:1 décomp : facing via SetObjectEventDirection (= slot source unique).
      SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], gPlayerAvatar.forceMovement);
      gPlayerAvatar.runningState = MOVING;
      // tileTransitionState dérivé 1:1 par UpdatePlayerAvatarTransitionState (du held).
      gPlayerAvatar.stepFramesLeft = 16;
      gPlayerAvatar.stepDirection = gPlayerAvatar.forceMovement;
      // [M3-C3.2c] 1:1 décomp `Task_ExitDoor` case 1 (field_screen_effect.c:338) /
      // `Task_ExitNonAnimDoor` case 1 (386) : le forced walk avance worldX/Y via un
      // held WALK_NORMAL (ObjectEventSetHeldMovement), exécuté par TickObjectEventMovements
      // → _NpcTakeStep → le CameraObject suit. Remplace l'ancien driver caméra manuel
      // (mort : overwritten par CameraUpdateCallback) + le pont AdvancePlayerSpriteWorldPos
      // (supprimé). gPlayerAvatar.stepFramesLeft (ci-dessus) reste pour rendre l'anim de
      // marche (sprite joueur découplé du slot → updateSpriteFrame lit gPlayerAvatar).
      {
        const fmSlot = gObjectEvents[gPlayerAvatar.objectEventId];
        if (fmSlot && fmSlot.active && fmSlot.isPlayer) {
          ObjectEventClearHeldMovementIfActive(fmSlot);
          ObjectEventSetHeldMovement(fmSlot, GetWalkNormalMovementAction(gPlayerAvatar.forceMovement));
        }
      }
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
        // tileTransitionState dérivé 1:1 par UpdatePlayerAvatarTransitionState (du held).
        gPlayerAvatar.stepDirection = DIR_NONE;
        gPlayerAvatar.walkAnimAlt = (gPlayerAvatar.walkAnimAlt ^ 1) as 0 | 1;
        // Clear forceMovement après step done → la scene attend ça pour next phase.
        gPlayerAvatar.forceMovement = DIR_NONE;
      }
    } else if (
      gPlayerAvatar.forceMovement === DIR_NONE
      && gObjectEvents[gPlayerAvatar.objectEventId]
      && ObjectEventIsHeldMovementActive(gObjectEvents[gPlayerAvatar.objectEventId])
      && !gObjectEvents[gPlayerAvatar.objectEventId].heldMovementFinished
    ) {
      // [M3-C3.4] Mouvement scripté actif sur le slot joueur (1:1 script_movement.c) :
      // la position avance via TickObjectEventMovements (held movement) → le CameraObject
      // suit le sprite. On reflète "en mouvement" sur gPlayerAvatar pour skip le check
      // défensif cam↔player de MainCB2_Overworld (qui ne vise QUE le désync à l'arrêt :
      // runningState=NOT_MOVING). L'anim de marche/saut est rendue par updateSpriteFrame
      // (lit GetHeldMovementVisual du slot). Le held fini-mais-non-cleared (door warp
      // terminé, ou frame de transition entre 2 actions) ne match pas (heldMovementFinished).
      gPlayerAvatar.runningState = MOVING;
      gPlayerAvatar.collideFramesLeft = 0;
    } else if (gPlayerAvatar.forceMovement === DIR_NONE) {
      // Pas de step + pas de force + pas de scripté → freeze player.
      gPlayerAvatar.runningState = NOT_MOVING;
      gPlayerAvatar.collideFramesLeft = 0;  // = pas de bump anim pendant lock
    }
    return;
  }

  // [étape 1b-iii] Machine de mouvement à pied PURE (1:1 décomp field_player_avatar.c:332).
  // Le pas avance via le held movement (TickObjectEventMovements, indépendant) ; le gate =
  // TryInterruptObjectEventSpecialAnim (clear le held fini → ouvre le gate en fin de pas).
  // Aucun warp/rencontre/coord/interaction ici : ils vivent dans ProcessPlayerFieldInput
  // (field-control-avatar.ts), qui tourne AVANT PlayerStep dans DoCB1_Overworld, gaté par
  // tileTransitionState. Les compteurs stepFramesLeft/turnFramesLeft/collideFramesLeft ne sont
  // plus utilisés sur ce chemin (la branche lock ci-dessus les garde pour le forced door-walk).
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!playerObjEvent || !playerObjEvent.active || !playerObjEvent.isPlayer) return;
  // HideShowWarpArrow(playerObjEvent) : piloté par la scène (TestOverworldScene), status quo.
  if (gPlayerAvatar.preventStep === false) {
    Bike_TryAcroBikeHistoryUpdate(newKeys, heldKeys);
    if (TryInterruptObjectEventSpecialAnim(playerObjEvent, direction) === 0) {
      npc_clear_strange_bits(playerObjEvent);
      DoPlayerAvatarTransition();
      if (TryDoMetatileBehaviorForcedMovement() === 0) {
        MovePlayerAvatarUsingKeypadInput(direction, newKeys, heldKeys);
        PlayerAllowForcedMovementIfMovingSameDirection();
      }
    }
  }
}

/** Reset le player avatar (= cleanup OAM + state). À call lors d'un map switch.
 *  Phase 4.6 (warps) wirera ça. */
export function DestroyPlayerAvatar(rt: DecompRuntime): void {
  if (gPlayerAvatar.spriteId < 0) return;
  const sprite = rt.gSprites[gPlayerAvatar.spriteId];
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  // [M3] Le slot joueur POSSÈDE le sprite (unifié) → clear aussi son lien pour ne pas
  // laisser un spriteId détruit (sinon destroyAllNpcSprites/UpdateObjectEvents le relirait).
  const playerSlot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (playerSlot) playerSlot.spriteId = -1;
  gPlayerAvatar.spriteId = -1;
  gPlayerAvatar.runningState = NOT_MOVING;
  gPlayerAvatar.stepFramesLeft = 0;
}

/** 1:1 STRICT décomp `SetPlayerInvisibility(bool8 invisible)` (field_player_avatar.c) :
 *    gObjectEvents[gPlayerAvatar.objectEventId].invisible = invisible;
 *
 *  Utilisé par Task_DoDoorWarp (cacher le joueur DANS la porte avant la fermeture)
 *  et Task_ExitDoor / Task_ExitNonAnimDoor (cacher pendant fade-in). Appelé `false`
 *  (= invisible) avant la fermeture/fade, `true` après juste avant le walk forceMovement.
 *
 *  ⚠️ FIX : on set le flag du SLOT object-event, PAS le sprite directement. Depuis
 *  l'unification M3, le sprite joueur appartient au slot et `UpdateObjectEvents`
 *  resynchronise `slot.invisible → sprite.invisible` CHAQUE frame. L'ancien
 *  `rt.setSpriteInvisible(...)` était donc écrasé au frame suivant (slot.invisible
 *  restait false) → le sprite joueur RÉAPPARAISSAIT pendant la fermeture de porte
 *  (« on ne disparait pas quand elle s'ouvre »). Set le slot = 1:1 + la sync s'en charge. */
export function SetPlayerVisibility(_rt: DecompRuntime, visible: boolean): void {
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!slot) return;
  slot.invisible = !visible;
}

// ═══════════════════════════════════════════════════════════════════════════
// Warp arrow driver `HideShowWarpArrow` — 1:1 décomp field_player_avatar.c:1428
// (ex-engine/field/field-effect-arrow.ts, fusionné ici = son vrai .c). Les FldEff
// arrow (CreateWarpArrowSprite:175/ShowWarpArrowSprite:193/SetSpriteInvisible:188)
// vivent dans field_effect_helpers.c (importés _aliasés) ; les prédicats
// MetatileBehavior_Is*ArrowWarp dans metatile_behavior.c (importés).
// ═══════════════════════════════════════════════════════════════════════════

const MAX_SPRITES = 64;

/** spriteId de la flèche (1:1 décomp : objectEvent->warpArrowSpriteId ; notre driver
 *  le garde en module-global, créé au map load). MAX_SPRITES = aucun. */
let _arrowSpriteId = MAX_SPRITES;

// Reset hook : clear au ResetSpriteData (1:1 décomp : tous sprite.inUse=FALSE).
// Notre _arrowSpriteId externe n'a pas cette propagation auto → sans ce hook, après
// un reset (bag/menu/warp) il reste STALE et un DestroyWarpArrowSprite écraserait un
// AUTRE sprite (slot réutilisé par un NPC respawné). Cf. bug "moitié de maman".
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _arrowSpriteId = MAX_SPRITES; });
  g.__spriteResetCallbacks = callbacks;
})();

/** Debug helper exposé sur globalThis (devtools console). */
export function getArrowState(): { spriteId: number } | null {
  return _arrowSpriteId === MAX_SPRITES ? null : { spriteId: _arrowSpriteId };
}
(globalThis as Record<string, unknown>).getArrowState = getArrowState;

/** 1:1 décomp `CreateWarpArrowSprite` (field_effect_helpers.c:175) — wrapper : précharge
 *  l'asset (concern plateforme) puis crée le sprite via le miroir. À appeler au map load. */
export async function CreateWarpArrowSprite(rt: DecompRuntime): Promise<number> {
  if (_arrowSpriteId !== MAX_SPRITES) DestroyWarpArrowSprite(rt);
  await preloadWarpArrowEffect(rt);
  _arrowSpriteId = _CreateWarpArrowSprite(rt);
  return _arrowSpriteId;
}

/** Cleanup au map switch (= 1:1 DestroyWarpArrowSprite). */
export function DestroyWarpArrowSprite(rt: DecompRuntime): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  const sprite = rt.gSprites[_arrowSpriteId];
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  _arrowSpriteId = MAX_SPRITES;
}

/** Direction → check fn 1:1 décomp `sArrowWarpMetatileBehaviorChecks2`
 *  (field_player_avatar.c:294-300). */
const ARROW_CHECKS: Record<number, (b: number) => boolean> = {
  [_DIR_SOUTH]: MetatileBehavior_IsSouthArrowWarp,
  [_DIR_NORTH]: MetatileBehavior_IsNorthArrowWarp,
  [_DIR_WEST]:  MetatileBehavior_IsWestArrowWarp,
  [_DIR_EAST]:  MetatileBehavior_IsEastArrowWarp,
};

/** 1:1 décomp `HideShowWarpArrow` (field_player_avatar.c:1428). Wrapper coords/dir
 *  séparées (= notre TestOverworldScene actuel ; playerX/Y LOGICAL → INTERNAL). */
export function HideShowWarpArrow(
  rt: DecompRuntime, playerX: number, playerY: number, movementDir: number,
): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  const internalX = playerX + MAP_OFFSET;
  const internalY = playerY + MAP_OFFSET;
  const metatileBehavior = MapGridGetMetatileBehaviorAt(internalX, internalY);
  // 1:1 décomp loop : test chaque dir ; si la tuile a le ARROW_WARP behavior matchant
  // cette dir ET movementDirection == cette dir → show arrow sur la tuile adjacente.
  for (const dir of [_DIR_SOUTH, _DIR_NORTH, _DIR_WEST, _DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === movementDir) {
      const target = MoveCoords(dir, internalX, internalY);
      _ShowWarpArrowSprite(rt, _arrowSpriteId, dir, target.x, target.y);
      return;
    }
  }
  _SetSpriteInvisible(rt, _arrowSpriteId);
}

/** 1:1 STRICT décomp signature `HideShowWarpArrow(struct ObjectEvent *objectEvent)`
 *  (field_player_avatar.c:1428). Lit currentMetatileBehavior + movementDirection +
 *  currentCoords directement (INTERNAL). */
export function HideShowWarpArrowFromObjectEvent(
  rt: DecompRuntime,
  objectEvent: {
    currentCoordsX: number;
    currentCoordsY: number;
    currentMetatileBehavior: number;
    movementDirection: number;
    active: boolean;
    isPlayer: boolean;
  },
): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  if (!objectEvent.active || !objectEvent.isPlayer) {
    _SetSpriteInvisible(rt, _arrowSpriteId);
    return;
  }
  const metatileBehavior = objectEvent.currentMetatileBehavior;
  const internalX = objectEvent.currentCoordsX;
  const internalY = objectEvent.currentCoordsY;
  for (const dir of [_DIR_SOUTH, _DIR_NORTH, _DIR_WEST, _DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === objectEvent.movementDirection) {
      const target = MoveCoords(dir, internalX, internalY);
      _ShowWarpArrowSprite(rt, _arrowSpriteId, dir, target.x, target.y);
      return;
    }
  }
  _SetSpriteInvisible(rt, _arrowSpriteId);
}

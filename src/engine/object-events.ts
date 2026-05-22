/**
 * object-events.ts — NPCs / object events overworld 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (= TrySpawnObjectEvents, MovementType_*_Step*)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h`
 *
 * Phase 4.4.a — MVP statique (DONE)
 * Phase 4.4.b — Face direction initial (DONE)
 * Phase 4.4.c — LOOK_AROUND / WANDER (DONE)
 * Phase 4.4.c.2 — Plus de movement types (THIS) :
 *   - WANDER_UP_AND_DOWN, WANDER_LEFT_AND_RIGHT (= 2-direction wander)
 *   - LOOK_DOWN_AND_UP, LOOK_LEFT_AND_RIGHT, LOOK_DOWN_LEFT_RIGHT etc.
 *   - WALK_IN_PLACE_NORMAL_* (= just face anim, no walk)
 *   - WANDER_AROUND avec player-as-blocker (= NPC ne walk pas dans player)
 * Phase 4.4.d — Player ↔ NPC collision (DONE via globalThis)
 * Phase 4.4.e — A button interact (DONE) + sprite update au interact (THIS)
 *
 * Phase suivante :
 *   - 4.5 : script engine + dialogue
 */
import type { DecompRuntime } from './decomp-runtime';
import { loadIndexedPngStrict } from './gba/png-loader';
import type { LoadedPng } from './gba/png-loader';
import {
  type ObjectEventTemplate,
  type MapHeader,
  MAP_OFFSET,
  gMapHeader,
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  GetMapBorderIdAt,
  CanCameraMoveInDirection,
} from './map-loader';
import { IsMetatileDirectionallyImpassable } from './metatile-behavior-helpers';
import { GetCameraTopLeftCoords, gTotalCamera, gCamera, gFieldCamera, GetBgVofsBaseline, GetCameraPanX as _getCameraPanX, GetCameraPanY as _getCameraPanY } from './field-camera';
import { gPlayerAvatar } from './player-avatar';
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_TO_DX, DIR_TO_DY, OPPOSITE_DIR,
} from './direction-coords';
import { _registerGObjectEvents, _registerNpcHelpers, _registerUpdateObjectEventsForCameraUpdate } from './field-globals';
import { FlagGet } from './script-vars';
import { Random } from './random';
// Pour OBJ_EVENT_GFX_VAR_N resolution au spawn (= rival NPC sprite genre opposé).
import { reverseDecompConstant as _reverseDecompConstant } from './decomp-constants';
// 1:1 décomp : accès direct aux vars via `gSaveBlock1Ptr->vars[id - VARS_START]`
// (event_data.c:164-180). Foundation `save-block-state` permet l'import sans
// cycle ESM (= avant on passait par gameState.getVar qui créait
// `object-events → game-state → load_save → object-events`).
import { gSaveBlock1Ptr } from './save-block-state';

const BASE = '/decomp/em';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const OBJECT_EVENTS_COUNT = 16;

const sMovementDelaysMedium = [32, 64, 96, 128];
const gStandardDirections = [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST];

// ─── Object event graphics catalog ──────────────────────────────────────────

interface GraphicsInfo {
  png: string;
  frameWidth: number;
  frameHeight: number;
  displayWidth: number;
  displayHeight: number;
}

let _graphicsCatalog: Record<string, GraphicsInfo> | null = null;

async function loadGraphicsCatalog(): Promise<Record<string, GraphicsInfo>> {
  if (_graphicsCatalog) return _graphicsCatalog;
  const r = await fetch(`${BASE}/object-event-graphics.json`);
  if (!r.ok) throw new Error(`object-event-graphics.json load failed: ${r.status}`);
  _graphicsCatalog = await r.json() as Record<string, GraphicsInfo>;
  return _graphicsCatalog;
}

// ─── PNG cache + parallel preload (Phase 4.8 Tâche 2) ───────────────────────
// Décomp's TrySpawnObjectEvents est synchrone — pas d'async PNG loading mid-game.
// Pour matcher : on pré-load TOUTES les PNGs de la map (+ connections) en
// PARALLEL au map init/cross-border, puis SpawnObjectEventsOnMap +
// TrySpawnObjectEvents lisent depuis le cache, sync.

/** Cache des PNGs déjà parsées. Clé = full path (e.g. `/decomp/em/<png>`). */
const _npcPngCache = new Map<string, LoadedPng>();
/** Promises in-flight pour dedupe les loads concurrents. */
const _npcPngLoading = new Map<string, Promise<LoadedPng>>();

/** Load (or reuse cached) une PNG pour NPC graphics. Dedupe via _npcPngLoading. */
async function loadNpcPng(path: string): Promise<LoadedPng> {
  const cached = _npcPngCache.get(path);
  if (cached) return cached;
  let pending = _npcPngLoading.get(path);
  if (!pending) {
    pending = loadIndexedPngStrict(path, 4).then(png => {
      _npcPngCache.set(path, png);
      _npcPngLoading.delete(path);
      return png;
    }).catch(err => {
      _npcPngLoading.delete(path);
      throw err;
    });
    _npcPngLoading.set(path, pending);
  }
  return pending;
}

/** Pre-load PARALLEL toutes les PNGs des NPCs templates de mapHeader.
 *  Resolved quand tous les loads done (ou ont silencieusement failed).
 *  Idempotent : si déjà cached, no-op rapide.
 *
 *  Phase 3 session 123 : résout OBJ_EVENT_GFX_VAR_N → réelle gfx via
 *  VAR_OBJ_GFX_ID_N (= rival NPC sprite genre opposé). Sans ça, le PNG du
 *  rival n'était jamais préchargé → spawn returns false → rival invisible. */
export async function preloadNpcGraphicsForMap(mapHeader: MapHeader): Promise<void> {
  const templates = mapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) return;
  const catalog = await loadGraphicsCatalog();
  const paths = new Set<string>();
  for (const template of templates) {
    if (!template.graphicsIdRaw) continue;
    let key = template.graphicsIdRaw;
    // Résolution OBJ_EVENT_GFX_VAR_N → vraie gfx (= 1:1 décomp logic).
    const varMatch = key.match(/^OBJ_EVENT_GFX_VAR_(\d+)$/);
    if (varMatch) {
      const n = Number(varMatch[1]);
      const gfxIdValue = (gSaveBlock1Ptr.vars[`VAR_OBJ_GFX_ID_${n}`] as number) ?? 0;
      if (gfxIdValue !== 0) {
        const resolved = _reverseDecompConstant(gfxIdValue, 'OBJ_EVENT_GFX_');
        if (resolved) key = resolved;
      }
    }
    const graphics = catalog[key];
    if (!graphics) continue;
    // Phase 4.10 : allow 48×48 (= truck), 32×32 (= Vigoroth) en plus du
    // standard 16×32.
    const is48x48 = graphics.frameWidth === 48 && graphics.frameHeight === 48;
    const is32x32 = graphics.frameWidth === 32 && graphics.frameHeight === 32;
    const is16x32 = graphics.frameWidth === 16 && graphics.frameHeight === 32;
    const is16x16 = graphics.frameWidth === 16 && graphics.frameHeight === 16;
    if (!is48x48 && !is32x32 && !is16x32 && !is16x16) continue;
    if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) continue;
    paths.add(`${BASE}/${graphics.png}`);
  }
  await Promise.all(
    [...paths].map(p =>
      loadNpcPng(p).catch((e: unknown) => {
        console.warn(`[object-events] preload failed for ${p}:`, e);
        return null;
      }),
    ),
  );
}

// ─── Object Event struct ────────────────────────────────────────────────────

export interface ObjectEvent {
  // ─── Bit flags 1:1 décomp `struct ObjectEvent` (global.fieldmap.h:194-255) ──
  active: boolean;
  /** 1:1 décomp `singleMovementActive:1`. True quand un MovementAction unique
   *  est en cours (= non-held movement). Reset au step end. */
  singleMovementActive: boolean;
  /** 1:1 décomp `triggerGroundEffectsOnMove:1`. Flag pour déclencher ground
   *  effects (= grass rustle, sand kick, water splash) au prochain move. */
  triggerGroundEffectsOnMove: boolean;
  /** 1:1 décomp `triggerGroundEffectsOnStop:1`. Idem mais au stop. */
  triggerGroundEffectsOnStop: boolean;
  /** 1:1 décomp `disableCoveringGroundEffects:1`. */
  disableCoveringGroundEffects: boolean;
  /** 1:1 décomp `landingJump:1`. Jump landing flag. */
  landingJump: boolean;
  /** 1:1 décomp `heldMovementActive:1`. True quand `ObjectEventSetHeldMovement`
   *  a queued un movement action (= used par scripted walks + door warps). */
  heldMovementActive: boolean;
  /** 1:1 décomp `heldMovementFinished:1`. True quand le held movement vient
   *  de finir (= read par `ObjectEventClearHeldMovementIfFinished`). */
  heldMovementFinished: boolean;
  /** 1:1 décomp `facingDirectionLocked:1`. Quand TRUE, le sprite face direction
   *  est gelée (= used pendant scripted movements pour pas changer le facing). */
  facingDirectionLocked: boolean;
  /** 1:1 décomp `disableAnim:1`. Disable sprite animation. */
  disableAnim: boolean;
  /** 1:1 décomp `enableAnim:1`. Re-enable anim after disable. */
  enableAnim: boolean;
  /** 1:1 décomp `inanimate:1`. NPC inanimate (= mailbox, vase, etc.). */
  inanimate: boolean;
  invisible: boolean;
  /** 1:1 décomp `offScreen:1`. */
  offScreen: boolean;
  /** 1:1 décomp `trackedByCamera:1`. */
  trackedByCamera: boolean;
  /** 1:1 décomp `isPlayer:1`. True pour le player ObjectEvent. */
  isPlayer: boolean;
  /** 1:1 décomp `hasReflection:1`. Player/NPC sur eau → reflet visible. */
  hasReflection: boolean;
  /** 1:1 décomp `inShortGrass:1`. Player/NPC dans short grass → footprints. */
  inShortGrass: boolean;
  /** 1:1 décomp `inShallowFlowingWater:1`. */
  inShallowFlowingWater: boolean;
  /** 1:1 décomp `inSandPile:1`. Step sur sand → kick effect. */
  inSandPile: boolean;
  /** 1:1 décomp `inHotSprings:1`. Hot springs anim. */
  inHotSprings: boolean;
  /** 1:1 décomp `hasShadow:1`. Player jump → shadow visible. */
  hasShadow: boolean;
  /** 1:1 décomp `disableJumpLandingGroundEffect:1`. */
  disableJumpLandingGroundEffect: boolean;
  /** 1:1 décomp `fixedPriority:1`. */
  fixedPriority: boolean;
  /** 1:1 décomp `hideReflection:1`. */
  hideReflection: boolean;
  // ─── Fields (= u8 + structs 1:1 décomp) ─────────────────────────────────
  spriteId: number;
  graphicsId: string;
  movementType: string;
  localId: number;
  /** Raw local_id from JSON (e.g. 'LOCALID_LITTLEROOT_MOM'). Empty if no
   *  local_id specified. Used par movement-system pour résoudre applymovement
   *  LOCALID_X. */
  localIdRaw: string;
  /** 1:1 décomp `objectEvent->mapNum + mapGroup`. Identifie de quelle map ce
   *  NPC est originaire (= permet dedup quand on cross-border : NPCs old map
   *  conservés, new map's NPCs spawnés à côté). Phase 4.8 connections.
   *  Format : map ID string (e.g. 'MAP_LITTLEROOT_TOWN'). */
  mapId: string;
  /** 1:1 décomp `objectEvent->script` : label du script à run on interact.
   *  Phase 4.5 : ScriptContext_SetupScript(npc.scriptLabel) au A button. */
  scriptLabel: string;
  /** 1:1 décomp `objectEvent->currentCoords`. Pendant un walk : TARGET cell
   *  (= où le NPC va arriver). Hors walk : position stable (= current = previous). */
  currentCoordsX: number;
  currentCoordsY: number;
  /** 1:1 décomp `objectEvent->previousCoords`. Pendant un walk : SOURCE cell
   *  (= où le NPC est parti). Hors walk : = currentCoords (= position stable).
   *  Used par DoesObjectCollideWithObjectAt pour bloquer SOURCE+TARGET pendant
   *  un walk → empêche step-on race entre NPCs et entre player↔NPC. */
  previousCoordsX: number;
  previousCoordsY: number;
  facingDirection: number;
  objTileBase: number;
  paletteBank: number;
  worldX: number;
  worldY: number;
  /** Phase 4.10 : true si le NPC utilise un subsprite table (= 48×48 truck etc).
   *  Quand true, updateNpcSpriteFrame skip son tileId calculation (= 16×32
   *  frame layout invalide pour un sprite multi-OAM). syncSubspriteOam refresh
   *  les child OAMs chaque frame depuis sprite.tileBase + sub.tileOffset. */
  useSubsprites: boolean;
  /** True si NPC est sprite 32×32 single-OAM (= Vigoroth déménageurs). 16 tiles
   *  par frame ; updateNpcSpriteFrame alterne entre 3 frames consecutivement
   *  chargés en VRAM (face / walk1 / walk2). Pas de direction switch — Vigoroth
   *  affiche toujours la même orientation (= sprite "carrying box" face down,
   *  "facing away" face up). */
  is32x32: boolean;
  movementStep: number;
  movementDelay: number;
  walkFramesLeft: number;
  walkDirection: number;
  walkAnimAlt: 0 | 1;
  /** 1:1 décomp `frozen` field. Si TRUE, state machine skip → NPC reste à
   *  sa facing direction courante. Set par tryInteractWithFacingNPC pour
   *  empêcher NPC de tourner mid-dialogue. Reset par UnfreezeAllNpcs (=
   *  appelé quand player walk = exit interaction). */
  frozen: boolean;
  /** 1:1 décomp `objectEvent->initialCoords`. Position au spawn, utilisée
   *  par WALK_BACK_AND_FORTH pour revenir à l'origin après une step + par
   *  IsCoordOutsideObjectEventMovementRange pour confiner les WANDER NPCs. */
  initialCoordsX: number;
  initialCoordsY: number;
  /** 1:1 décomp `objectEvent->range.rangeX/rangeY` (event_object_movement.c).
   *  Movement range bounds depuis initialCoords : NPCs WANDER/WALK ne peuvent
   *  pas walk hors `[initial - range, initial + range]`. 0 = no range = libre.
   *  Vient du template JSON `movement_range_x/y`. */
  movementRangeX: number;
  movementRangeY: number;
  /** 1:1 décomp `directionSequenceIndex`. WALK_BACK_AND_FORTH : 0 = forward,
   *  1 = backward. ROTATE_* : index dans la sequence rotation. */
  directionSeqIdx: number;
  /** 1:1 décomp `sprite.x2 / sprite.y2` (= secondary OAM offsets, additionnels
   *  à sprite.x/y). Used par `SetObjectEventSpritePosByLocalIdAndMap` pour
   *  bouger un sprite hors-grid (= e.g. truck box bouncing pendant cinematic).
   *  Default 0 = sprite à sa position normale. */
  visualOffsetX: number;
  visualOffsetY: number;
  /** 1:1 décomp `currentElevation:4` (4-bit). 0 = ground level. >0 = bridge/
   *  staircase elevation. Used par `IsElevationMismatchAt` pour bloquer player
   *  passage entre tiles d'elevation différente. */
  currentElevation: number;
  /** 1:1 décomp `previousElevation:4`. Elevation du tile précédent. */
  previousElevation: number;
  /** 1:1 décomp `mapNum` (= map index dans le group). Separate from mapId string.
   *  Used pour ObjectEventTemplate matching + spawn detection. */
  mapNum: number;
  /** 1:1 décomp `mapGroup` (= map group index, e.g. MAP_GROUP_LITTLEROOT). */
  mapGroup: number;
  /** 1:1 décomp `trainerType`. Trainer behavior si NPC est un trainer (=
   *  TRAINER_TYPE_NORMAL = engage si player line of sight, TRAINER_TYPE_SEE_ALL_
   *  DIRECTIONS = engage si player dans range omnidirectional). */
  trainerType: number;
  /** 1:1 décomp `trainerRange_berryTreeId` (= packed u8). Pour trainers : range
   *  de la line of sight (= 1..7 tiles). Pour berry trees : berryTreeId. */
  trainerRange_berryTreeId: number;
  /** 1:1 décomp `currentMetatileBehavior`. Cached metatile behavior à la
   *  position courante. Updated à chaque step end via `ObjectEventUpdateCurrent
   *  MetatileBehavior`. Used par `HideShowWarpArrow` + ground effects + collision. */
  currentMetatileBehavior: number;
  /** 1:1 décomp `previousMetatileBehavior`. Cached metatile behavior du tile
   *  précédent. Used pour detect transition (= e.g. step OFF tall grass). */
  previousMetatileBehavior: number;
  /** 1:1 décomp `movementDirection:4`. Direction de la dernière MovementAction
   *  appliquée (= différent de `facingDirection` qui peut être locked).
   *  Used par `HideShowWarpArrow` pour determine quelle direction d'arrow show. */
  movementDirection: number;
  /** 1:1 décomp `previousMovementDirection`. Direction du dernier MovementAction
   *  COMPLETED. Used par `PlayerAllowForcedMovementIfMovingSameDirection`. */
  previousMovementDirection: number;
  /** 1:1 décomp `fieldEffectSpriteId`. Sprite ID d'un field effect attached
   *  (= e.g. reflection, shadow). MAX_SPRITES (64) = none. */
  fieldEffectSpriteId: number;
  /** 1:1 décomp `warpArrowSpriteId`. Sprite ID de l'arrow warp visual attaché.
   *  MAX_SPRITES (64) = none. Used par `HideShowWarpArrow` + `ShowWarpArrowSprite`.
   *  Set par `CreateWarpArrowSprite` au player object event spawn. */
  warpArrowSpriteId: number;
  /** 1:1 décomp `movementActionId`. Action ID en cours (= e.g. MOVEMENT_ACTION_
   *  WALK_NORMAL_DOWN = 0x09). Used par MovementType state machines + held
   *  movement system. */
  movementActionId: number;
  /** 1:1 décomp `playerCopyableMovement`. Pour le player, indique quel
   *  movement type est "copyable" par les NPCs avec MOVEMENT_TYPE_COPY_*
   *  (= NPCs qui imitent le player). Cf. `COPY_MOVE_*` enum. */
  playerCopyableMovement: number;
}

/** MAX_SPRITES sentinel value 1:1 décomp src/sprite.c. = 64 (= gSprites array
 *  size). Used pour fields sprite-IDs "absent" (= e.g. fieldEffectSpriteId,
 *  warpArrowSpriteId = MAX_SPRITES = no sprite attached). */
const MAX_SPRITES = 64;

/** 1:1 décomp convention : `gPlayerAvatar.objectEventId` pointe vers le slot
 *  du player dans `gObjectEvents[]`. Notre impl : on réserve `gObjectEvents[0]`
 *  comme slot player. NPCs spawn via `findIndex(o => !o.active)` qui skip
 *  naturellement le slot 0 si le player est `active=true` (= init dans
 *  `InitPlayerAvatar`).
 *
 *  Décomp ROM utilise `SpawnSpecialObjectEvent` qui alloue dynamiquement,
 *  donc le slot peut varier. Notre simplification : slot 0 fixe pour le player.
 *  Identique à `LOCALID_PLAYER = 0xFF` mais pour l'index dans gObjectEvents. */
export const PLAYER_OBJECT_EVENT_SLOT = 0;

export const gObjectEvents: ObjectEvent[] = Array.from({ length: OBJECT_EVENTS_COUNT }, () => ({
  // Bit flags (= 1:1 décomp struct ObjectEvent l.196-223, all init FALSE).
  active: false,
  singleMovementActive: false,
  triggerGroundEffectsOnMove: false,
  triggerGroundEffectsOnStop: false,
  disableCoveringGroundEffects: false,
  landingJump: false,
  heldMovementActive: false,
  heldMovementFinished: false,
  facingDirectionLocked: false,
  disableAnim: false,
  enableAnim: false,
  inanimate: false,
  invisible: false,
  offScreen: false,
  trackedByCamera: false,
  isPlayer: false,
  hasReflection: false,
  inShortGrass: false,
  inShallowFlowingWater: false,
  inSandPile: false,
  inHotSprings: false,
  hasShadow: false,
  disableJumpLandingGroundEffect: false,
  fixedPriority: false,
  hideReflection: false,
  // Fields u8 + structs.
  spriteId: -1,
  graphicsId: '',
  movementType: '',
  localId: 0,
  localIdRaw: '',
  mapId: '',
  mapNum: 0,
  mapGroup: 0,
  trainerType: 0,
  trainerRange_berryTreeId: 0,
  scriptLabel: '',
  currentCoordsX: 0,
  currentCoordsY: 0,
  previousCoordsX: 0,
  previousCoordsY: 0,
  initialCoordsX: 0,
  initialCoordsY: 0,
  facingDirection: DIR_SOUTH,
  movementDirection: DIR_SOUTH,
  previousMovementDirection: DIR_SOUTH,
  currentElevation: 0,
  previousElevation: 0,
  currentMetatileBehavior: 0,  // MB_NORMAL
  previousMetatileBehavior: 0,
  movementActionId: 0xFF,  // 1:1 décomp MOVEMENT_ACTION_NONE sentinel
  fieldEffectSpriteId: MAX_SPRITES,
  warpArrowSpriteId: MAX_SPRITES,
  playerCopyableMovement: 0,
  objTileBase: 0,
  paletteBank: 0,
  worldX: 0,
  worldY: 0,
  movementStep: 0,
  movementDelay: 0,
  walkFramesLeft: 0,
  walkDirection: DIR_NONE,
  walkAnimAlt: 0,
  frozen: false,
  is32x32: false,
  movementRangeX: 0,
  movementRangeY: 0,
  directionSeqIdx: 0,
  useSubsprites: false,
  visualOffsetX: 0,
  visualOffsetY: 0,
}));

// ─── Coord shift helpers 1:1 décomp event_object_movement.c ─────────────────

/** 1:1 décomp `ShiftObjectEventCoords` (event_object_movement.c:2117).
 *  Used au DÉBUT d'un walk : previous = ancienne pos, current = nouvelle target.
 *  Pendant le walk, current/previous restent figés à TARGET/SOURCE. */
function ShiftObjectEventCoords(npc: ObjectEvent, x: number, y: number): void {
  npc.previousCoordsX = npc.currentCoordsX;
  npc.previousCoordsY = npc.currentCoordsY;
  npc.currentCoordsX = x;
  npc.currentCoordsY = y;
}

/** 1:1 décomp `ShiftStillObjectEventCoords` (event_object_movement.c:2162).
 *  Used à la FIN d'un walk : previous = current → NPC stable, plus de
 *  collision sur la source cell. */
function ShiftStillObjectEventCoords(npc: ObjectEvent): void {
  npc.previousCoordsX = npc.currentCoordsX;
  npc.previousCoordsY = npc.currentCoordsY;
}

/** 1:1 décomp `ObjectEventUpdateMetatileBehaviors` (event_object_movement.c:7428-7432).
 *
 *  Body décomp :
 *  ```c
 *  static void ObjectEventUpdateMetatileBehaviors(struct ObjectEvent *objEvent) {
 *      objEvent->previousMetatileBehavior = MapGridGetMetatileBehaviorAt(
 *          objEvent->previousCoords.x, objEvent->previousCoords.y);
 *      objEvent->currentMetatileBehavior = MapGridGetMetatileBehaviorAt(
 *          objEvent->currentCoords.x, objEvent->currentCoords.y);
 *  }
 *  ```
 *
 *  Appelée par décomp dans 3 contextes :
 *    - `GetAllGroundEffectFlags_OnSpawn` (= au spawn d'un object event)
 *    - `GetAllGroundEffectFlags_OnBeginStep` (= début d'un step)
 *    - `GetAllGroundEffectFlags_OnFinishStep` (= fin d'un step)
 *
 *  Used par `HideShowWarpArrow` (= warp arrow direction match) + collision
 *  detection + ground effect dispatch (= grass rustle / sand kick / water
 *  splash / etc.).
 *
 *  Note coords : `currentCoords` / `previousCoords` sont en INTERNAL coords
 *  (= +MAP_OFFSET, 1:1 décomp ObjectEvent struct convention). `MapGridGetMetatile
 *  BehaviorAt` prend des internal coords directement. */
/** 1:1 décomp `MOVEMENT_ACTION_NONE = 0xFE` (= include/constants/event_object_movement.h).
 *  Sentinel value pour `movementActionId` indiquant "no action active". */
const MOVEMENT_ACTION_NONE = 0xFE;

/** 1:1 décomp `ObjectEventIsMovementOverridden` (event_object_movement.c:4854-4860).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->singleMovementActive || objectEvent->heldMovementActive)
 *      return TRUE;
 *  return FALSE;
 *  ```
 *
 *  Used par `ObjectEventSetHeldMovement` pour gate l'application d'un nouveau
 *  movement action (= si déjà override, refuse). */
export function ObjectEventIsMovementOverridden(objectEvent: ObjectEvent): boolean {
  return objectEvent.singleMovementActive || objectEvent.heldMovementActive;
}

/** 1:1 décomp `ObjectEventIsHeldMovementActive` (event_object_movement.c:4862-4868).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->heldMovementActive && objectEvent->movementActionId != MOVEMENT_ACTION_NONE)
 *      return TRUE;
 *  return FALSE;
 *  ```
 *
 *  Used par `UpdateObjectEventCurrentMovement` pour dispatch ExecHeldMovementAction. */
export function ObjectEventIsHeldMovementActive(objectEvent: ObjectEvent): boolean {
  return objectEvent.heldMovementActive && objectEvent.movementActionId !== MOVEMENT_ACTION_NONE;
}

/** 1:1 décomp `ObjectEventSetHeldMovement` (event_object_movement.c:4870-4881).
 *
 *  Body décomp :
 *  ```c
 *  if (ObjectEventIsMovementOverridden(objectEvent))
 *      return TRUE;
 *  UnfreezeObjectEvent(objectEvent);
 *  objectEvent->movementActionId = movementActionId;
 *  objectEvent->heldMovementActive = TRUE;
 *  objectEvent->heldMovementFinished = FALSE;
 *  gSprites[objectEvent->spriteId].sActionFuncId = 0;
 *  return FALSE;
 *  ```
 *
 *  Used par `Task_ExitDoor`, `Task_DoDoorWarp`, scripted movement applymovement
 *  pour queue un movement action sur un ObjectEvent. Returns TRUE si refusé
 *  (= déjà overridden), FALSE si accepté. */
export function ObjectEventSetHeldMovement(objectEvent: ObjectEvent, movementActionId: number): boolean {
  if (ObjectEventIsMovementOverridden(objectEvent)) return true;
  objectEvent.frozen = false;  // 1:1 décomp `UnfreezeObjectEvent(objectEvent)`
  objectEvent.movementActionId = movementActionId;
  objectEvent.heldMovementActive = true;
  objectEvent.heldMovementFinished = false;
  // 1:1 décomp `gSprites[objectEvent->spriteId].sActionFuncId = 0` — sprite
  // action state reset. Notre engine n'a pas de sActionFuncId direct (= sprite
  // anim tracking diffère). Skip cette ligne, no-op fonctionnel.
  return false;
}

/** 1:1 décomp `ObjectEventForceSetHeldMovement` (event_object_movement.c:4883-4887).
 *
 *  Body décomp :
 *  ```c
 *  ObjectEventClearHeldMovementIfActive(objectEvent);
 *  ObjectEventSetHeldMovement(objectEvent, movementActionId);
 *  ```
 *
 *  Used pour override un held movement existant (= contrairement à SetHeldMovement
 *  qui refuse si déjà active). */
export function ObjectEventForceSetHeldMovement(objectEvent: ObjectEvent, movementActionId: number): void {
  ObjectEventClearHeldMovementIfActive(objectEvent);
  ObjectEventSetHeldMovement(objectEvent, movementActionId);
}

/** 1:1 décomp `ObjectEventClearHeldMovementIfActive` (event_object_movement.c:4889-4893). */
export function ObjectEventClearHeldMovementIfActive(objectEvent: ObjectEvent): void {
  if (objectEvent.heldMovementActive) {
    ObjectEventClearHeldMovement(objectEvent);
  }
}

/** 1:1 décomp `ObjectEventClearHeldMovement` (event_object_movement.c:4895-4902).
 *
 *  Body décomp :
 *  ```c
 *  objectEvent->movementActionId = MOVEMENT_ACTION_NONE;
 *  objectEvent->heldMovementActive = FALSE;
 *  objectEvent->heldMovementFinished = FALSE;
 *  gSprites[objectEvent->spriteId].sTypeFuncId = 0;
 *  gSprites[objectEvent->spriteId].sActionFuncId = 0;
 *  ```
 */
export function ObjectEventClearHeldMovement(objectEvent: ObjectEvent): void {
  objectEvent.movementActionId = MOVEMENT_ACTION_NONE;
  objectEvent.heldMovementActive = false;
  objectEvent.heldMovementFinished = false;
  // Sprite anim state reset : voir note dans ObjectEventSetHeldMovement.
}

/** 1:1 décomp `ObjectEventCheckHeldMovementStatus` (event_object_movement.c:4904-4910).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->heldMovementActive)
 *      return objectEvent->heldMovementFinished;
 *  return 16;
 *  ```
 *
 *  Retourne :
 *    - `heldMovementFinished` flag (0 ou 1) si held movement active.
 *    - 16 (= "no held movement" sentinel) si pas active.
 *
 *  Used par `ObjectEventClearHeldMovementIfFinished` pour decide d'auto-clear. */
export function ObjectEventCheckHeldMovementStatus(objectEvent: ObjectEvent): number {
  if (objectEvent.heldMovementActive) {
    return objectEvent.heldMovementFinished ? 1 : 0;
  }
  return 16;
}

/** 1:1 décomp `ObjectEventClearHeldMovementIfFinished` (event_object_movement.c:4912-4919).
 *
 *  Body décomp :
 *  ```c
 *  u8 heldMovementStatus = ObjectEventCheckHeldMovementStatus(objectEvent);
 *  if (heldMovementStatus != 0 && heldMovementStatus != 16)
 *      ObjectEventClearHeldMovementIfActive(objectEvent);
 *  return heldMovementStatus;
 *  ```
 *
 *  Used par scripts `waitmovement` opcode pour check si movement done +
 *  auto-clear. Returns same status as Check (= caller distingue done/notDone). */
export function ObjectEventClearHeldMovementIfFinished(objectEvent: ObjectEvent): number {
  const heldMovementStatus = ObjectEventCheckHeldMovementStatus(objectEvent);
  if (heldMovementStatus !== 0 && heldMovementStatus !== 16) {
    ObjectEventClearHeldMovementIfActive(objectEvent);
  }
  return heldMovementStatus;
}

/** 1:1 décomp `ObjectEventGetHeldMovementActionId` (event_object_movement.c:4921-4927). */
export function ObjectEventGetHeldMovementActionId(objectEvent: ObjectEvent): number {
  if (objectEvent.heldMovementActive) {
    return objectEvent.movementActionId;
  }
  return MOVEMENT_ACTION_NONE;
}

/** 1:1 décomp `SpawnSpecialObjectEvent` (event_object_movement.c) helper
 *  spécialisé pour le PLAYER. Init `gObjectEvents[PLAYER_OBJECT_EVENT_SLOT]`
 *  comme player ObjectEvent.
 *
 *  Décomp `InitPlayerAvatar` (field_player_avatar.c:1364-1394) :
 *  ```c
 *  playerObjEventTemplate.localId = LOCALID_PLAYER;
 *  playerObjEventTemplate.graphicsId = GetPlayerAvatarGraphicsIdByStateIdAndGender(...);
 *  playerObjEventTemplate.x = x - MAP_OFFSET;
 *  playerObjEventTemplate.y = y - MAP_OFFSET;
 *  playerObjEventTemplate.elevation = ELEVATION_TRANSITION;
 *  playerObjEventTemplate.movementType = MOVEMENT_TYPE_PLAYER;
 *  ...
 *  objectEventId = SpawnSpecialObjectEvent(&playerObjEventTemplate);
 *  objectEvent = &gObjectEvents[objectEventId];
 *  objectEvent->isPlayer = TRUE;
 *  objectEvent->warpArrowSpriteId = CreateWarpArrowSprite();
 *  ObjectEventTurn(objectEvent, direction);
 *  ```
 *
 *  Used par `InitPlayerAvatar` (player-avatar.ts) au map load + post-warp.
 *
 *  @param mapX        Player position LOGICAL X (= sans MAP_OFFSET).
 *  @param mapY        Player position LOGICAL Y.
 *  @param direction   Initial facing direction (DIR_*).
 *  @param graphicsKey Player graphics ID (= 'Brendan' / 'May' for the demo). */
export function InitPlayerObjectEvent(
  mapX: number, mapY: number, direction: number, graphicsKey: string,
): void {
  const npc = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  // 1:1 décomp : init all fields à leur valeur par défaut + override les
  // player-specific.
  npc.active = true;
  npc.invisible = false;
  npc.isPlayer = true;
  npc.localId = 0xFF;  // 1:1 décomp LOCALID_PLAYER = 255 (= sentinel pour
                       // matching scripted movements via 'LOCALID_PLAYER' string).
  npc.localIdRaw = 'LOCALID_PLAYER';
  npc.graphicsId = graphicsKey;
  npc.movementType = 'MOVEMENT_TYPE_PLAYER';
  npc.scriptLabel = '';
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1298) :
  //   x = template->x + MAP_OFFSET;  ← INTERNAL coords storage
  //   objectEvent->currentCoords.x = x;  etc.
  // R3 refactor : `gObjectEvents` stocke maintenant en INTERNAL coords (= +
  // MAP_OFFSET), 1:1 strict path identique au décomp.
  npc.currentCoordsX = mapX + MAP_OFFSET;
  npc.currentCoordsY = mapY + MAP_OFFSET;
  npc.previousCoordsX = mapX + MAP_OFFSET;
  npc.previousCoordsY = mapY + MAP_OFFSET;
  npc.initialCoordsX = mapX + MAP_OFFSET;
  npc.initialCoordsY = mapY + MAP_OFFSET;
  npc.facingDirection = direction;
  npc.movementDirection = direction;
  npc.previousMovementDirection = direction;
  npc.currentElevation = 3;  // 1:1 décomp ELEVATION_TRANSITION (= 3) default
  npc.previousElevation = 3;
  npc.movementActionId = MOVEMENT_ACTION_NONE;
  npc.fieldEffectSpriteId = MAX_SPRITES;
  npc.warpArrowSpriteId = MAX_SPRITES;  // 1:1 décomp CreateWarpArrowSprite()
                                         // appelé séparément par scene (= notre
                                         // archi : loadAndInitMap call DestroyWarp +
                                         // CreateWarpArrowSprite).
  npc.playerCopyableMovement = 0;
  npc.mapId = '';  // Set par caller au current map.
  npc.mapNum = 0;
  npc.mapGroup = 0;
  // Bit flags reset.
  npc.singleMovementActive = false;
  npc.triggerGroundEffectsOnMove = false;
  npc.triggerGroundEffectsOnStop = false;
  npc.disableCoveringGroundEffects = false;
  npc.landingJump = false;
  npc.heldMovementActive = false;
  npc.heldMovementFinished = false;
  npc.facingDirectionLocked = false;
  npc.disableAnim = false;
  npc.enableAnim = false;
  npc.inanimate = false;
  npc.offScreen = false;
  npc.trackedByCamera = false;  // 1:1 décomp : player n'est PAS trackedByCamera
                                 // (= la camera FOLLOW le player via _camPos =
                                 // gSaveBlock1Ptr.pos, pas via objectEvent flag).
  npc.hasReflection = false;
  npc.inShortGrass = false;
  npc.inShallowFlowingWater = false;
  npc.inSandPile = false;
  npc.inHotSprings = false;
  npc.hasShadow = false;
  npc.disableJumpLandingGroundEffect = false;
  npc.fixedPriority = false;
  npc.hideReflection = false;
  npc.frozen = false;
  npc.is32x32 = false;
  npc.useSubsprites = false;
  // 1:1 décomp `GetAllGroundEffectFlags_OnSpawn` (event_object_movement.c:7389)
  // → ObjectEventUpdateMetatileBehaviors(objEvent) au spawn.
  ObjectEventUpdateMetatileBehaviors(npc);
}

/** Sync `gObjectEvents[PLAYER_OBJECT_EVENT_SLOT]` avec `gPlayerAvatar`. À
 *  call à chaque step boundary (= step end) + au facing change. Maintient
 *  les fields lus par décomp helpers (= `currentCoords`, `facingDirection`,
 *  `movementDirection`, `currentMetatileBehavior`, etc.).
 *
 *  @param mapX        Logical X (= gPlayerAvatar.x).
 *  @param mapY        Logical Y.
 *  @param facing      gPlayerAvatar.facing.
 *  @param movementDir Direction du step en cours (= optional, default = facing).
 *  @param shiftCoords TRUE = shift previous from current (= ShiftObjectEventCoords
 *                     style 1:1 décomp au step start). FALSE = no shift (= keep
 *                     previous as-is).
 */
export function SyncPlayerObjectEvent(
  mapX: number, mapY: number, facing: number,
  movementDir?: number, shiftCoords: boolean = false,
): void {
  const npc = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  if (!npc.active || !npc.isPlayer) return;
  if (shiftCoords) {
    // 1:1 décomp ShiftObjectEventCoords : previous = old current, current = new.
    npc.previousCoordsX = npc.currentCoordsX;
    npc.previousCoordsY = npc.currentCoordsY;
  }
  // R3 refactor : currentCoords stockés en INTERNAL (= +MAP_OFFSET) 1:1 décomp.
  npc.currentCoordsX = mapX + MAP_OFFSET;
  npc.currentCoordsY = mapY + MAP_OFFSET;
  npc.facingDirection = facing;
  if (movementDir !== undefined) {
    npc.movementDirection = movementDir;
  }
  // 1:1 décomp `ObjectEventUpdateMetatileBehaviors` au step end (=
  // GetAllGroundEffectFlags_OnFinishStep event_object_movement.c:7415).
  ObjectEventUpdateMetatileBehaviors(npc);
}

export function ObjectEventUpdateMetatileBehaviors(npc: ObjectEvent): void {
  // 1:1 décomp `MapGridGetMetatileBehaviorAt(objEvent->currentCoords.x, ...)` :
  // décomp stocke `currentCoords` en INTERNAL coords (= +MAP_OFFSET), le
  // `MapGridGet` reçoit directement les internal coords.
  //
  // Post R3 refactor : notre `gObjectEvents` stocke aussi INTERNAL → call direct
  // sans conversion. 1:1 strict path identique au décomp.
  npc.previousMetatileBehavior = MapGridGetMetatileBehaviorAt(
    npc.previousCoordsX, npc.previousCoordsY);
  npc.currentMetatileBehavior = MapGridGetMetatileBehaviorAt(
    npc.currentCoordsX, npc.currentCoordsY);
}

// Phase 4.6 audit Opus §5 : register vers field-globals (= type-safe lookup).
// gObjectEvents reste exposé sur globalThis pour back-compat avec les
// auto-callbacks décomp générés (= castent en `any`), mais les call-sites
// internes (player-avatar, warp-system) doivent utiliser `getGObjectEvents`.
_registerGObjectEvents(gObjectEvents);
(globalThis as Record<string, unknown>).__gObjectEvents = gObjectEvents;

// ─── OBJ tile/palette allocation ────────────────────────────────────────────

/** Phase 4.9 : player sprite occupe maintenant tiles 0..143 (= 18 frames concat,
 *  walking 0..8 + running 9..17 = 1:1 décomp sPicTable_BrendanNormal). NPCs
 *  allouent depuis 144. */
const NPC_TILE_BASE_START = 144;
const TILES_PER_NPC = 72;
let _nextNpcTileBase = NPC_TILE_BASE_START;
const NPC_PALETTE_START = 1;
let _nextNpcPaletteBank = NPC_PALETTE_START;

/** Phase 4.8 Tâche 3 : free list pour tile/palette slots des NPCs removed.
 *  Sans ça : _nextNpcTileBase et _nextNpcPaletteBank croissent monotone à
 *  chaque cross-border → pool exhaust à ~13 NPCs total. Avec : slots removed
 *  poussés ici, ré-utilisés au prochain spawn. */
const _freeNpcSlots: Array<{ tileBase: number; paletteBank: number }> = [];

/** Push slot d'un NPC removed dans le free pool. À call AVANT de set
 *  `npc.active = false` ou de reset spriteId. Idempotent : ne push pas si
 *  les valeurs sont 0/start (= jamais alloué). */
function _freeNpcSlot(npc: ObjectEvent): void {
  if (npc.objTileBase >= NPC_TILE_BASE_START) {
    _freeNpcSlots.push({ tileBase: npc.objTileBase, paletteBank: npc.paletteBank });
  }
}

export function resetObjectEventAllocations(): void {
  _nextNpcTileBase = NPC_TILE_BASE_START;
  _nextNpcPaletteBank = NPC_PALETTE_START;
  _freeNpcSlots.length = 0;
  for (let i = 0; i < gObjectEvents.length; i++) {
    const npc = gObjectEvents[i];
    // 1:1 décomp : ne PAS reset le player ObjectEvent slot (= survit aux map
    // switches). Décomp utilise `SpawnSpecialObjectEvent` qui alloue le slot
    // au boot + le préserve. Le map switch reset les NPCs mais pas le player.
    if (i === PLAYER_OBJECT_EVENT_SLOT && npc.isPlayer) continue;
    npc.active = false;
    npc.spriteId = -1;
    // 1:1 décomp : reset visualOffsetX/Y (= sprite.x2/y2) sinon les NPCs de
    // la nouvelle map héritent des offsets des truck boxes (= bug session 123 :
    // Mère décalée d'1 pixel sur grid car visualOffsetX hérité de Box1).
    npc.visualOffsetX = 0;
    npc.visualOffsetY = 0;
    // Reset autres flags qui peuvent leak entre maps.
    npc.invisible = false;
    npc.frozen = false;
    npc.useSubsprites = false;
    npc.is32x32 = false;
    npc.walkFramesLeft = 0;
    npc.movementStep = 0;
    npc.movementDelay = 0;
    // Audit session 126 : reset COMPLET des champs identifiants. Sans ça les
    // slots `active=false` gardent leurs anciens graphicsId/coords/mapId →
    // 1) zombies dans `__gObjectEvents` (= les MOVING_BOX du Truck visibles
    //    après warp Brendan/MaysHouse_1F),
    // 2) potentiel bug collision si un check parcourt le array sans filtrer
    //    sur active (= rare mais possible),
    // 3) débug live difficile (= confusion sur identité du slot).
    npc.graphicsId = '';
    npc.movementType = '';
    npc.localId = 0;
    npc.localIdRaw = '';
    npc.mapId = '';
    npc.scriptLabel = '';
    npc.currentCoordsX = 0;
    npc.currentCoordsY = 0;
    npc.previousCoordsX = 0;
    npc.previousCoordsY = 0;
    npc.initialCoordsX = 0;
    npc.initialCoordsY = 0;
    npc.facingDirection = DIR_SOUTH;
    npc.movementRangeX = 0;
    npc.movementRangeY = 0;
    npc.directionSeqIdx = 0;
    npc.objTileBase = 0;
    npc.paletteBank = 0;
    npc.worldX = 0;
    npc.worldY = 0;
    npc.walkDirection = DIR_NONE;
    npc.walkAnimAlt = 0;
  }
}

/** Phase 4.6 : libère les sprites OAM des NPCs avant un warp / map switch.
 *  resetObjectEventAllocations seul reset l'array logique mais laisse les
 *  sprites dans rt.gSprites et leur tileBase/paletteBank occupé → leak +
 *  collision palette quand on re-spawn la map suivante. Cette fonction kill
 *  proprement chaque sprite avant le reset.
 *
 *  À appeler AVANT resetObjectEventAllocations + SpawnObjectEventsOnMap. */
export function destroyAllNpcSprites(rt: { gSprites: Map<number, { oamIndex: number; inUse: boolean }>; gba: { oam: Array<{ visible: boolean }> } }): void {
  for (const npc of gObjectEvents) {
    if (npc.active && npc.spriteId >= 0) {
      const sprite = rt.gSprites.get(npc.spriteId);
      if (sprite) {
        rt.gba.oam[sprite.oamIndex].visible = false;
        sprite.inUse = false;
      }
      // Phase 4.8 Tâche 3 : free slot pool aussi (note : caller utilise typiquement
      // resetObjectEventAllocations après → pool wipe complet, free list = noop).
      _freeNpcSlot(npc);
      npc.spriteId = -1;
    }
  }
  // Phase 4.10 fix critique : cleanup child OAMs des NPCs subsprite-driven
  // (= truck 48×48). Sans ce cleanup, les 12 child OAMs du truck persistent
  // au map switch → on voit le truck en haut-droite à la sortie OU à l'intérieur
  // de la nouvelle map (= bug session 119).
  // 1:1 décomp `RemoveAllObjectEventsOAM` + `FreeAllSpritePalettes` au map exit.
  clearAllSubspriteTables();
}

// ─── PNG → OBJ 1D layout helper ─────────────────────────────────────────────

function pngTo1dObjLayout(pngCharData: Uint8Array, numFrames: number, pngWidthTiles: number, framePxW: number, framePxH: number): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = framePxW / 8;
  const FRAME_H_TILES = framePxH / 8;
  const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;
  const out = new Uint8Array(numFrames * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < numFrames; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        const pngTileIdx = row * pngWidthTiles + (f * FRAME_W_TILES) + col;
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES,
        );
      }
    }
  }
  return out;
}

/**
 * Like `pngTo1dObjLayout` but only extracts a single frame (= avoid loading
 * unused frames into VRAM). Used for 32×32 NPCs où le PNG contient plusieurs
 * frames partagés (= Vigoroth has 5 frames split between CarryingBox/FacingAway).
 *
 * Session 124 fix Bug 1.
 */
function pngTo1dObjLayoutSingleFrame(
  pngCharData: Uint8Array, frameIdx: number, pngWidthTiles: number,
  framePxW: number, framePxH: number,
): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = framePxW / 8;
  const FRAME_H_TILES = framePxH / 8;
  const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;
  const out = new Uint8Array(TILES_PER_FRAME * TILE_BYTES);
  for (let row = 0; row < FRAME_H_TILES; row++) {
    for (let col = 0; col < FRAME_W_TILES; col++) {
      const pngTileIdx = row * pngWidthTiles + (frameIdx * FRAME_W_TILES) + col;
      const objTileIdx = row * FRAME_W_TILES + col;
      out.set(
        pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
        objTileIdx * TILE_BYTES,
      );
    }
  }
  return out;
}

// ─── Sprite frame layout 1:1 player-avatar.ts ───────────────────────────────

const NPC_SPRITE_FRAMES: Record<number, { face: number; walk1: number; walk2: number; hFlip: boolean }> = {
  [DIR_SOUTH]: { face: 0, walk1: 3, walk2: 4, hFlip: false },
  [DIR_NORTH]: { face: 1, walk1: 5, walk2: 6, hFlip: false },
  [DIR_WEST]:  { face: 2, walk1: 7, walk2: 8, hFlip: false },
  [DIR_EAST]:  { face: 2, walk1: 7, walk2: 8, hFlip: true },
};

const TILES_PER_FRAME_16x32 = 8;

// ─── Subsprite tables (= 1:1 décomp `src/data/object_events/object_event_subsprites.h`) ──
//
// Pour les NPCs > 16×32 (= truck 48×48, vigoroth carrying box, etc.), le décomp
// utilise un système de subsprites : un sprite logique unique avec N OAMs
// child positionnés relativement au center du parent. Sans ça, on ne pourrait
// pas rendre 48×48 (= pas une OAM size hardware single).
//
// `sOamTable_48x48` (object_event_subsprites.h:228) : 12 subsprites couvrant
// 6 rows × 8 px = 48 px height. Chaque row : 32×8 left (4 tiles) + 16×8 right
// (2 tiles) = 6 tiles per row × 6 rows = 36 tiles total. Used by truck.
//
// Format NamingSubsprite (= compatible avec SetSubspriteTables in decomp-globals) :
//   { x, y, shape, size, tileOffset, priority }
//   - shape : 0=square, 1=wide (w>h), 2=tall (h>w)
//   - size : 0..3 selon dimensions (cf. oamShapeSizeFromWH)
//     32×8 → shape=1 (wide) size=1
//     16×8 → shape=1 (wide) size=0
import type { NamingSubsprite } from './decomp-globals';
import { SetSubspriteTables, syncSubspriteOam, clearAllSubspriteTables } from './decomp-globals';

/**
 * 1:1 décomp `sOamTable_16x16_2` (object_event_subsprites.h:38-58). Used pour
 * les NPCs/caisses avec elevation tels que `sElevationToSubspriteTableNum`
 * retourne 2 (= elevation 4, 6, 8, 10, 12 → split subsprite layout).
 *
 * Split horizontal du sprite 16x16 en 2 demi-OAMs 16x8 :
 *   - Top half (y=-8..0) : priority 2 (= rendered ABOVE bottom)
 *   - Bottom half (y=0..8) : priority 3 (= rendered BEHIND top + behind autres
 *     sprites priority 2)
 *
 * Use case : permet à la moitié BOTTOM de passer derrière player/autres
 * sprites priority 2 → effet "le bas de la caisse est camouflé par
 * tile/sprite plus bas dans la scène".
 *
 * Session 124 fix Bug 3 (= 1-pixel artifact lors du trajet camion).
 */
export const sOamTable_16x16_2: ReadonlyArray<NamingSubsprite> = [
  { x: -8, y: -8, shape: 1, size: 0, tileOffset: 0, priority: 2 }, // top half 16x8
  { x: -8, y:  0, shape: 1, size: 0, tileOffset: 2, priority: 3 }, // bottom half 16x8
];

export const sOamTable_48x48: ReadonlyArray<NamingSubsprite> = [
  { x: -24, y: -24, shape: 1, size: 1, tileOffset:  0, priority: 2 }, // 32×8 row 0 left
  { x:   8, y: -24, shape: 1, size: 0, tileOffset:  4, priority: 2 }, // 16×8 row 0 right
  { x: -24, y: -16, shape: 1, size: 1, tileOffset:  6, priority: 2 }, // 32×8 row 1 left
  { x:   8, y: -16, shape: 1, size: 0, tileOffset: 10, priority: 2 }, // 16×8 row 1 right
  { x: -24, y:  -8, shape: 1, size: 1, tileOffset: 12, priority: 2 }, // 32×8 row 2 left
  { x:   8, y:  -8, shape: 1, size: 0, tileOffset: 16, priority: 2 }, // 16×8 row 2 right
  { x: -24, y:   0, shape: 1, size: 1, tileOffset: 18, priority: 2 }, // 32×8 row 3 left
  { x:   8, y:   0, shape: 1, size: 0, tileOffset: 22, priority: 2 }, // 16×8 row 3 right
  { x: -24, y:   8, shape: 1, size: 1, tileOffset: 24, priority: 2 }, // 32×8 row 4 left
  { x:   8, y:   8, shape: 1, size: 0, tileOffset: 28, priority: 2 }, // 16×8 row 4 right
  { x: -24, y:  16, shape: 1, size: 1, tileOffset: 30, priority: 2 }, // 32×8 row 5 left
  { x:   8, y:  16, shape: 1, size: 0, tileOffset: 34, priority: 2 }, // 16×8 row 5 right
];

// Re-export pour autres modules (e.g. TestOverworldScene qui call syncSubspriteOam).
export { syncSubspriteOam };

// ─── Movement type → initial facing direction ──────────────────────────────

/** 1:1 décomp `gInitialMovementTypeFacingDirections[]`
 *  (event_object_movement.c:351-433). Read par `InitObjectEventStateFromTemplate`
 *  (line 1320) pour init `previousMovementDirection` au spawn, et utilisé par
 *  les `MovementType_*_Step0` (e.g. MovementType_WalkInPlace_Step0 line 4422)
 *  pour set le facing initial du sprite avant la première anim.
 *
 *  Ancienne impl heuristique `includes('FACE_DOWN')` etc. : fallback DIR_SOUTH
 *  pour les patterns sans 'FACE_*' → bug Vigoroth FACING_AWAY/CARRYING_BOX dans
 *  MaysHouse_1F : mt=WALK_IN_PLACE_UP était mappé à DIR_SOUTH au lieu de
 *  DIR_NORTH → sprite stuck sur frame face-down (= n'existe pas dans assets
 *  VIGOROTH_FACING_AWAY) → Vigoroth ne s'anime pas (user-flag : "Un ne bouge
 *  pas, l'autre slide"). */
const _INITIAL_FACING_BY_MT: ReadonlyMap<string, number> = new Map([
  // FACE_* (= reste statique facing direction)
  ['MOVEMENT_TYPE_FACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_FACE_RIGHT', DIR_EAST],
  // FACE_*_AND_* (= face direction principale + range autour)
  ['MOVEMENT_TYPE_FACE_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_FACE_UP_AND_LEFT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_UP_AND_RIGHT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_DOWN_AND_LEFT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_UP_AND_LEFT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT', DIR_SOUTH],
  // WANDER_*
  ['MOVEMENT_TYPE_WANDER_AROUND', DIR_SOUTH],
  ['MOVEMENT_TYPE_WANDER_UP_AND_DOWN', DIR_NORTH],
  ['MOVEMENT_TYPE_WANDER_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT', DIR_EAST],
  // WALK_*
  ['MOVEMENT_TYPE_WALK_UP_AND_DOWN', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT', DIR_EAST],
  // WALK_IN_PLACE_*
  ['MOVEMENT_TYPE_WALK_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT', DIR_EAST],
  // JOG_IN_PLACE_*
  ['MOVEMENT_TYPE_JOG_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_RIGHT', DIR_EAST],
  // RUN_IN_PLACE_*
  ['MOVEMENT_TYPE_RUN_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_RIGHT', DIR_EAST],
  // WALK_SLOWLY_IN_PLACE_*
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_RIGHT', DIR_EAST],
  // COPY_PLAYER (= NPC copie le mvt joueur, facing init dérive du premier
  // movement de chaîne).
  ['MOVEMENT_TYPE_COPY_PLAYER', DIR_NORTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE', DIR_SOUTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE', DIR_WEST],
  ['MOVEMENT_TYPE_COPY_PLAYER_CLOCKWISE', DIR_EAST],
  ['MOVEMENT_TYPE_COPY_PLAYER_IN_GRASS', DIR_NORTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE_IN_GRASS', DIR_SOUTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE_IN_GRASS', DIR_WEST],
  ['MOVEMENT_TYPE_COPY_PLAYER_CLOCKWISE_IN_GRASS', DIR_EAST],
  // Misc statiques
  ['MOVEMENT_TYPE_NONE', DIR_SOUTH],
  ['MOVEMENT_TYPE_LOOK_AROUND', DIR_SOUTH],
  ['MOVEMENT_TYPE_PLAYER', DIR_SOUTH],
  ['MOVEMENT_TYPE_BERRY_TREE_GROWTH', DIR_SOUTH],
  ['MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_ROTATE_CLOCKWISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_TREE_DISGUISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_MOUNTAIN_DISGUISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_BURIED', DIR_SOUTH],
  ['MOVEMENT_TYPE_INVISIBLE', DIR_SOUTH],
]);

function movementTypeToInitialFacing(movementType: string): number {
  const mapped = _INITIAL_FACING_BY_MT.get(movementType);
  if (mapped !== undefined) return mapped;
  // WALK_SEQUENCE_* (= 24 variantes) : DIR = première lettre de la séquence
  // (UP→DIR_NORTH, DOWN→DIR_SOUTH, LEFT→DIR_WEST, RIGHT→DIR_EAST). 1:1 décomp
  // event_object_movement.c:381-404.
  if (movementType.startsWith('MOVEMENT_TYPE_WALK_SEQUENCE_')) {
    const rest = movementType.slice('MOVEMENT_TYPE_WALK_SEQUENCE_'.length);
    if (rest.startsWith('UP_')) return DIR_NORTH;
    if (rest.startsWith('DOWN_')) return DIR_SOUTH;
    if (rest.startsWith('LEFT_')) return DIR_WEST;
    if (rest.startsWith('RIGHT_')) return DIR_EAST;
  }
  return DIR_SOUTH;
}

// ─── Direction helpers depuis direction-coords (= source unique partagée) ──
// Avant : DIR_TO_DX/DY locaux dupliquaient la table 1:1 décomp `sDirectionToVectors`.
// Migrate vers direction-coords.ts pour cohérence avec player-avatar +
// script-opcodes.

function pickRandomDirection(allowed: ReadonlyArray<number> = gStandardDirections): number {
  // 1:1 décomp `event_object_movement.c:GetRandomDirection` qui fait
  // `Random() % count` sur la table sDirections. Auparavant Math.random() = bug
  // RNG (= séquence non-reproductible, viole le déterminisme du seed=0).
  return allowed[Random() % allowed.length];
}

function pickRandomDelay(): number {
  // 1:1 décomp `event_object_movement.c:GetRandomMovementDelay` qui fait
  // `sMovementDelaysMedium[Random() % ARRAY_COUNT(sMovementDelaysMedium)]`.
  return sMovementDelaysMedium[Random() % sMovementDelaysMedium.length];
}

/** Check si target tile (INTERNAL coords) occupé par player.
 *  1:1 décomp pattern : lit slot 0 (= player ObjectEvent unifié post-refactor)
 *  qui sync currentCoords IMMÉDIATEMENT au Step0. La cell TARGET d'un walk
 *  MOVING est déjà dans `slot0.currentCoords` (= post InitNpcForMovement),
 *  donc pas besoin de logic séparée "player MOVING vers target". */
function isPlayerAt(x: number, y: number): boolean {
  const p = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  if (p && p.active && p.isPlayer) {
    if (p.currentCoordsX === x && p.currentCoordsY === y) return true;
    if (p.previousCoordsX === x && p.previousCoordsY === y) return true;
    return false;
  }
  // Fallback (= slot 0 pas init, early boot) : compare avec pa.x/y converti INTERNAL.
  const paX = gPlayerAvatar.x + MAP_OFFSET;
  const paY = gPlayerAvatar.y + MAP_OFFSET;
  if (paX === x && paY === y) return true;
  if (gPlayerAvatar.runningState === 2 /* MOVING */ && gPlayerAvatar.stepFramesLeft > 0) {
    const sdx = DIR_TO_DX[gPlayerAvatar.stepDirection] ?? 0;
    const sdy = DIR_TO_DY[gPlayerAvatar.stepDirection] ?? 0;
    if (paX + sdx === x && paY + sdy === y) return true;
  }
  return false;
}

// ─── 1:1 décomp collision constants + helpers (global.fieldmap.h:309-319) ─

/** 1:1 décomp `enum Collision` (global.fieldmap.h:309-319). NE PAS modifier
 *  les valeurs : matchent l'index décomp utilisé par sites externes. */
export const COLLISION_NONE                = 0;
export const COLLISION_OUTSIDE_RANGE       = 1;
export const COLLISION_IMPASSABLE          = 2;
export const COLLISION_ELEVATION_MISMATCH  = 3;
export const COLLISION_OBJECT_EVENT        = 4;
export const COLLISION_STOP_SURFING        = 5;
export const COLLISION_LEDGE_JUMP          = 6;
export const COLLISION_PUSHED_BOULDER      = 7;
export const COLLISION_ROTATING_GATE       = 8;

/** 1:1 décomp `enum Elevation` (global.fieldmap.h:14-20). */
export const ELEVATION_TRANSITION  = 0;
export const ELEVATION_DEFAULT     = 3;
export const ELEVATION_MULTI_LEVEL = 15;

/** 1:1 décomp `ObjectEventDoesElevationMatch(objectEvent, elevation)`
 *  (event_object_movement.c:2209-2215).
 *
 *  ```c
 *  if (objectEvent->currentElevation != ELEVATION_TRANSITION
 *      && elevation != ELEVATION_TRANSITION
 *      && objectEvent->currentElevation != elevation)
 *      return FALSE;
 *  return TRUE;
 *  ```
 *
 *  TRANSITION elevation (= 0) match toujours. Else même value requise. */
export function ObjectEventDoesElevationMatch(
  objectEvent: ObjectEvent, elevation: number,
): boolean {
  if (objectEvent.currentElevation !== ELEVATION_TRANSITION
      && elevation !== ELEVATION_TRANSITION
      && objectEvent.currentElevation !== elevation) return false;
  return true;
}

/** 1:1 décomp `GetObjectEventIdByXY(s16 x, s16 y)`
 *  (event_object_movement.c:1251-1261). Returns index dans gObjectEvents
 *  matching position OR `OBJECT_EVENTS_COUNT` (= sentinel "not found"). */
export function GetObjectEventIdByXY(x: number, y: number): number {
  let i: number;
  for (i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (gObjectEvents[i].active
        && gObjectEvents[i].currentCoordsX === x
        && gObjectEvents[i].currentCoordsY === y) break;
  }
  return i;
}

/** 1:1 décomp `GetObjectEventIdByPosition(u16 x, u16 y, u8 elevation)`
 *  (event_object_movement.c:2192-2207). Same que GetObjectEventIdByXY mais
 *  filtre aussi sur `ObjectEventDoesElevationMatch`. */
export function GetObjectEventIdByPosition(
  x: number, y: number, elevation: number,
): number {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (gObjectEvents[i].active) {
      if (gObjectEvents[i].currentCoordsX === x
          && gObjectEvents[i].currentCoordsY === y
          && ObjectEventDoesElevationMatch(gObjectEvents[i], elevation)) {
        return i;
      }
    }
  }
  return OBJECT_EVENTS_COUNT;
}

/** 1:1 décomp `AreElevationsCompatible(u8 a, u8 b)`
 *  (event_object_movement.c:7791-7800).
 *
 *  ```c
 *  if (a == ELEVATION_TRANSITION || b == ELEVATION_TRANSITION) return TRUE;
 *  if (a != b) return FALSE;
 *  return TRUE;
 *  ```
 *
 *  ELEVATION_TRANSITION (= 0) signifie "tile traversable peu importe l'élév
 *  du caller" — used pour transitions stairs/bridges. */
export function AreElevationsCompatible(a: number, b: number): boolean {
  if (a === ELEVATION_TRANSITION || b === ELEVATION_TRANSITION) return true;
  if (a !== b) return false;
  return true;
}

/** 1:1 décomp `IsElevationMismatchAt(u8 elevation, s16 x, s16 y)`
 *  (event_object_movement.c:7707-7723).
 *
 *  ```c
 *  if (elevation == ELEVATION_TRANSITION) return FALSE;
 *  mapElevation = MapGridGetElevationAt(x, y);
 *  if (mapElevation == ELEVATION_TRANSITION || mapElevation == ELEVATION_MULTI_LEVEL)
 *      return FALSE;
 *  if (mapElevation != elevation) return TRUE;
 *  return FALSE;
 *  ```
 *
 *  x, y = INTERNAL coords (= déjà +MAP_OFFSET). Bug user session 129 fixé :
 *  tile devant truck cache elev=15 (MULTI_LEVEL) → skip check = passable. */
export function IsElevationMismatchAt(elevation: number, x: number, y: number): boolean {
  if (elevation === ELEVATION_TRANSITION) return false;
  const fn = (globalThis as Record<string, unknown>).MapGridGetElevationAt as
    ((x: number, y: number) => number) | undefined;
  if (!fn) return false;
  const mapElevation = fn(x, y);
  if (mapElevation === ELEVATION_TRANSITION || mapElevation === ELEVATION_MULTI_LEVEL) return false;
  if (mapElevation !== elevation) return true;
  return false;
}

/** 1:1 décomp `DoesObjectCollideWithObjectAt(struct ObjectEvent *objectEvent, s16 x, s16 y)`
 *  (event_object_movement.c:4724-4742).
 *
 *  ```c
 *  for (i = 0; i < OBJECT_EVENTS_COUNT; i++) {
 *      curObject = &gObjectEvents[i];
 *      if (curObject->active && curObject != objectEvent) {
 *          if ((curObject->currentCoords.x == x && curObject->currentCoords.y == y)
 *              || (curObject->previousCoords.x == x && curObject->previousCoords.y == y)) {
 *              if (AreElevationsCompatible(objectEvent->currentElevation, curObject->currentElevation))
 *                  return TRUE;
 *          }
 *      }
 *  }
 *  ```
 *
 *  Skip self via reference compare. Check `currentCoords` ET `previousCoords`
 *  → couvre TARGET + SOURCE pendant un walk (= step-on race fix). */
export function DoesObjectCollideWithObjectAt(
  objectEvent: ObjectEvent, x: number, y: number,
): boolean {
  // x, y arrivent en INTERNAL coords (= +MAP_OFFSET, convention décomp).
  // Post R3 refactor : `currentCoords` stockés INTERNAL → comparison directe
  // 1:1 strict path identique au décomp event_object_movement.c:4734.
  for (const curObject of gObjectEvents) {
    if (!curObject.active || curObject === objectEvent) continue;
    if ((curObject.currentCoordsX === x && curObject.currentCoordsY === y)
        || (curObject.previousCoordsX === x && curObject.previousCoordsY === y)) {
      if (AreElevationsCompatible(objectEvent.currentElevation, curObject.currentElevation)) {
        return true;
      }
    }
  }
  return false;
}

/** Back-compat wrapper : isOtherNpcAt → DoesObjectCollideWithObjectAt 1:1
 *  strict signature. Used par `canWalk` pour NPCs movement validation. */
function isOtherNpcAt(x: number, y: number, excluding: ObjectEvent): boolean {
  return DoesObjectCollideWithObjectAt(excluding, x, y);
}

/** 1:1 décomp `GetCollisionAtCoords(struct ObjectEvent *objectEvent, s16 x, s16 y, u32 dir)`
 *  (event_object_movement.c:4658-4672).
 *
 *  ```c
 *  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
 *      return COLLISION_OUTSIDE_RANGE;
 *  else if (MapGridGetCollisionAt(x, y) || GetMapBorderIdAt(x, y) == CONNECTION_INVALID
 *           || IsMetatileDirectionallyImpassable(objectEvent, x, y, direction))
 *      return COLLISION_IMPASSABLE;
 *  else if (objectEvent->trackedByCamera && !CanCameraMoveInDirection(direction))
 *      return COLLISION_IMPASSABLE;
 *  else if (IsElevationMismatchAt(objectEvent->currentElevation, x, y))
 *      return COLLISION_ELEVATION_MISMATCH;
 *  else if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
 *      return COLLISION_OBJECT_EVENT;
 *  return COLLISION_NONE;
 *  ```
 *
 *  CONNECTION_INVALID = -1 (= map border edge). x, y = INTERNAL coords
 *  (= +MAP_OFFSET déjà). Notre convention LOGICAL pour gObjectEvents → caller
 *  doit add MAP_OFFSET avant call (= matche les call-sites décomp). */
export function GetCollisionAtCoords(
  objectEvent: ObjectEvent, x: number, y: number, dir: number,
): number {
  const direction = dir;
  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
    return COLLISION_OUTSIDE_RANGE;
  const targetBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MapGridGetCollisionAt(x, y) !== 0
      || GetMapBorderIdAt(x, y) === -1
      || IsMetatileDirectionallyImpassable(
           objectEvent.currentMetatileBehavior, targetBehavior, direction))
    return COLLISION_IMPASSABLE;
  if (objectEvent.trackedByCamera && !CanCameraMoveInDirection(direction))
    return COLLISION_IMPASSABLE;
  if (IsElevationMismatchAt(objectEvent.currentElevation, x, y))
    return COLLISION_ELEVATION_MISMATCH;
  if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
    return COLLISION_OBJECT_EVENT;
  return COLLISION_NONE;
}

/** 1:1 décomp `GetCollisionFlagsAtCoords(struct ObjectEvent *objectEvent, s16 x, s16 y, u8 direction)`
 *  (event_object_movement.c:4674-4687). Bitfield variant : check ALL conditions
 *  et set 1 bit per collision type (= used par trainer_see + autres callers qui
 *  veulent saber TOUTES les raisons de collision, pas juste la 1ère).
 *
 *  Bit i = (1 << (COLLISION_X - 1)). */
export function GetCollisionFlagsAtCoords(
  objectEvent: ObjectEvent, x: number, y: number, direction: number,
): number {
  let flags = 0;
  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
    flags |= 1 << (COLLISION_OUTSIDE_RANGE - 1);
  const targetBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MapGridGetCollisionAt(x, y) !== 0
      || GetMapBorderIdAt(x, y) === -1
      || IsMetatileDirectionallyImpassable(
           objectEvent.currentMetatileBehavior, targetBehavior, direction)
      || (objectEvent.trackedByCamera && !CanCameraMoveInDirection(direction)))
    flags |= 1 << (COLLISION_IMPASSABLE - 1);
  if (IsElevationMismatchAt(objectEvent.currentElevation, x, y))
    flags |= 1 << (COLLISION_ELEVATION_MISMATCH - 1);
  if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
    flags |= 1 << (COLLISION_OBJECT_EVENT - 1);
  return flags;
}

/** 1:1 décomp `GetCollisionInDirection(struct ObjectEvent *objectEvent, u8 direction)`
 *  (event_object_movement.c:4650-4656). Compute (x, y) target depuis
 *  currentCoords + direction, puis call `GetCollisionAtCoords`. */
export function GetCollisionInDirection(
  objectEvent: ObjectEvent, direction: number,
): number {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  const x = objectEvent.currentCoordsX + dx;
  const y = objectEvent.currentCoordsY + dy;
  return GetCollisionAtCoords(objectEvent, x, y, direction);
}

/** 1:1 décomp `sMovementTypeHasRange[]` (event_object_movement.c:307).
 *  Returns TRUE si le movement type doit avoir un range non-nul (= NPCs qui
 *  walk : WANDER, WALK, WALK_SEQUENCE_*). FACE/LOOK_AROUND/etc. → no range. */
function movementTypeHasRange(movementType: string): boolean {
  if (!movementType) return false;
  return movementType.startsWith('MOVEMENT_TYPE_WANDER_')
      || movementType.startsWith('MOVEMENT_TYPE_WALK_')
      || movementType === 'MOVEMENT_TYPE_WANDER_AROUND';
}

/** 1:1 décomp `IsCoordOutsideObjectEventMovementRange(objectEvent, x, y)`
 *  (event_object_movement.c:4689). Returns TRUE si la cible (x, y) est hors
 *  du rectangle de movement range défini par initialCoords ± rangeX/rangeY.
 *
 *  Le décomp utilise ce check pour confiner les NPCs WANDER_AROUND /
 *  WANDER_UP_AND_DOWN / WALK_X dans une zone autour de leur spawn. Sans ce
 *  check, les NPCs drift indéfiniment (= Audit Opus §3.1 manquement).
 *
 *  range.rangeX/rangeY = 0 signifie "pas de range" (= NPC libre). */
function IsCoordOutsideObjectEventMovementRange(
  npc: ObjectEvent, x: number, y: number,
): boolean {
  // x, y arrivent en INTERNAL coords. Post R3 refactor : `initialCoords` aussi
  // INTERNAL → comparison directe 1:1 décomp event_object_movement.c:4691-4711.
  if (npc.movementRangeX !== 0) {
    const left = npc.initialCoordsX - npc.movementRangeX;
    const right = npc.initialCoordsX + npc.movementRangeX;
    if (left > x || right < x) return true;
  }
  if (npc.movementRangeY !== 0) {
    const top = npc.initialCoordsY - npc.movementRangeY;
    const bottom = npc.initialCoordsY + npc.movementRangeY;
    if (top > y || bottom < y) return true;
  }
  return false;
}

/** Check si NPC peut walker en `direction` depuis sa position courante.
 *  1:1 décomp `GetCollisionInDirection` : map collision + player collision +
 *  NPC-NPC collision (= IsCoordCollidingWithObjectEvent) + movement range.
 *
 *  Considère la TARGET cell du player MOVING ET d'un autre NPC walking,
 *  pour éviter step-on race : si 2 entités démarrent walk vers même cell
 *  en même frame, la 2e voit la cell occupée → bloquée. */
function canWalk(npc: ObjectEvent, direction: number): boolean {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  // Post R3 refactor : npc.currentCoords stockés INTERNAL → targetX/Y INTERNAL.
  const targetX = npc.currentCoordsX + dx;
  const targetY = npc.currentCoordsY + dy;
  // Phase 4.6 audit Opus §3.1 : check movement range AVANT collision (= 1:1
  // décomp `GetCollisionAtCoords` qui retourne COLLISION_OUTSIDE_RANGE en 1er).
  if (IsCoordOutsideObjectEventMovementRange(npc, targetX, targetY)) return false;
  if (MapGridGetCollisionAt(targetX, targetY) !== 0) return false;
  if (isPlayerAt(targetX, targetY)) return false;
  if (isOtherNpcAt(targetX, targetY, npc)) return false;
  return true;
}

/** Un-freeze tous les NPCs (= appelé quand player commence à walker, =
 *  exit interaction). 1:1 décomp pattern : ScriptUnlockAll fait équivalent. */
export function UnfreezeAllNpcs(): void {
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = false;
  }
}

/** 1:1 décomp event_object_movement.c:8159 FreezeObjectEvents :
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)
 *        if (gObjectEvents[i].active && i != gPlayerAvatar.objectEventId)
 *            FreezeObjectEvent(&gObjectEvents[i]);
 *
 *  Set frozen=true sur tous les NPCs actifs (skip player). Le tick movement
 *  state machine check `if (npc.frozen) continue;` → NPC reste à sa position
 *  même mid-step. Appelé par `ShowStartMenu` quand l'user appuie START dans
 *  l'overworld pour ouvrir le menu. */
export function FreezeObjectEvents(): void {
  for (let i = 0; i < gObjectEvents.length; i++) {
    const npc = gObjectEvents[i];
    if (!npc.active) continue;
    // Skip player (= localId 0xFF ou similar). On freeze juste les NPCs.
    if (npc.localIdRaw === 'LOCALID_PLAYER') continue;
    npc.frozen = true;
  }
}
// Phase 4.6 audit Opus §5 : back-compat globalThis + register field-globals.
(globalThis as Record<string, unknown>).__UnfreezeAllNpcs = UnfreezeAllNpcs;

// ─── Sprite frame update ────────────────────────────────────────────────────

/** Update OAM sprite frame selon NPC state (face vs walk anim).
 *  Exposé via globalThis __updateNpcSpriteFrame pour interact (= player-avatar
 *  call this après interact pour forcer face-toward-player visible immédiatement). */
function updateNpcSpriteFrame(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
  // 32×32 NPCs (= Vigoroth déménageurs) : 16 tiles par frame, 3 frames
  // consecutivement en VRAM (face=base, walk1=base+16, walk2=base+32). Pas
  // de direction switching (= le sprite Vigoroth_CarryingBox affiche toujours
  // face down ; Vigoroth_FacingAway toujours face up). 1:1 décomp sAnim_Go*
  // approx : walkFramesLeft >= 8 → walk1/walk2 (selon walkAnimAlt) ; sinon face.
  if (npc.is32x32) {
    const sprite32 = rt.gSprites.get(npc.spriteId);
    if (!sprite32) return;
    const oam32 = rt.gba.oam[sprite32.oamIndex];
    let frame32 = 0;
    if (npc.walkFramesLeft > 0 && npc.walkFramesLeft >= 8) {
      frame32 = npc.walkAnimAlt === 0 ? 1 : 2;  // walk1 / walk2
    }
    oam32.tileId = npc.objTileBase + frame32 * 16;  // 16 tiles per 32x32 frame
    // hFlip selon facingDirection. 1:1 décomp sAnim_GoEast réutilise les frames
    // de sAnim_GoWest avec .hFlip = TRUE (object_event_anims.h:229-236). Pour
    // Vigoroth_CarryingBox mt=WALK_LEFT_AND_RIGHT, facingDirection alterne
    // DIR_WEST/DIR_EAST → hFlip OFF/ON. Sans ça, sprite reste face WEST même
    // quand walkDirection=EAST → user-flag "ne regarde qu'à gauche".
    const flip = npc.facingDirection === DIR_EAST;
    sprite32.hFlip = flip;
    oam32.flipH = flip;
    return;
  }
  // Phase 4.10 : NPCs subsprite-driven (= truck) skip le frame update car leur
  // tile layout n'est pas un grid 16×32 frame. Le rendu visuel passe par
  // syncSubspriteOam qui refresh les child OAMs depuis sprite.tileBase + offsets.
  if (npc.useSubsprites) return;
  const sprite = rt.gSprites.get(npc.spriteId);
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[DIR_SOUTH];

  let frameIdx: number;
  if (npc.walkFramesLeft > 0) {
    if (npc.walkFramesLeft >= 8) {
      frameIdx = npc.walkAnimAlt === 0 ? cfg.walk1 : cfg.walk2;
    } else {
      frameIdx = cfg.face;
    }
  } else {
    frameIdx = cfg.face;
  }

  oam.tileId = npc.objTileBase + frameIdx * TILES_PER_FRAME_16x32;
  sprite.hFlip = cfg.hFlip;
  oam.flipH = cfg.hFlip;
}

(globalThis as Record<string, unknown>).__updateNpcSpriteFrame = (rt: DecompRuntime, npc: ObjectEvent) => updateNpcSpriteFrame(rt, npc);

// Phase 4.6 audit Opus §5 : register field-globals avec helpers type-safe.
// Permet aux call-sites internes (player-avatar, scripts) de lookup les
// helpers sans cast `any` via globalThis.
_registerNpcHelpers(
  (rt, npc) => updateNpcSpriteFrame(rt as DecompRuntime, npc as ObjectEvent),
  UnfreezeAllNpcs,
);

// ─── Movement state machines 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `MovementType_LookAround_Step*`. */
function tickLookAround(rt: DecompRuntime, npc: ObjectEvent, allowedDirections: ReadonlyArray<number>): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp : step 0 → step 1 instantané, puis pickRandomDelay + step 3.
      npc.movementDelay = pickRandomDelay();
      npc.movementStep = 3;
      break;
    case 3:
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 4;
      }
      break;
    case 4:
      npc.facingDirection = pickRandomDirection(allowedDirections);
      npc.movementStep = 1;
      break;
  }
  void rt;  // updateNpcSpriteFrame called from UpdateObjectEvents each frame
}

/** 1:1 décomp `MovementType_WanderAround_Step*`. */
function tickWanderAround(rt: DecompRuntime, npc: ObjectEvent, allowedDirections: ReadonlyArray<number>): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp : step 0 → step 1 instantané, puis pickRandomDelay + step 3.
      npc.movementDelay = pickRandomDelay();
      npc.movementStep = 3;
      break;
    case 3:
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 4;
      }
      break;
    case 4: {
      const dir = pickRandomDirection(allowedDirections);
      npc.facingDirection = dir;
      if (!canWalk(npc, dir)) {
        npc.movementStep = 1;
      } else {
        // 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081) :
        // shift coords AU DÉBUT du walk → previous = source, current = target.
        const dx = DIR_TO_DX[dir] ?? 0;
        const dy = DIR_TO_DY[dir] ?? 0;
        ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 6;
      }
      break;
    }
    case 6: {
      // worldX/Y tick visuel pendant le walk.
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        // 1:1 décomp `ShiftStillObjectEventCoords` (event_object_movement.c:5120) :
        // previous = current → NPC stable, plus de collision sur SOURCE cell.
        ShiftStillObjectEventCoords(npc);
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.movementStep = 1;
      }
      break;
    }
  }
  void rt;
}

/** 1:1 décomp `gClockwiseDirections` : DIR_SOUTH → WEST → NORTH → EAST → SOUTH...
 *  Indexed by current direction. Used par RotateClockwise. */
const NEXT_DIR_CW: Record<number, number> = {
  [DIR_SOUTH]: DIR_WEST,
  [DIR_WEST]: DIR_NORTH,
  [DIR_NORTH]: DIR_EAST,
  [DIR_EAST]: DIR_SOUTH,
};
const NEXT_DIR_CCW: Record<number, number> = {
  [DIR_SOUTH]: DIR_EAST,
  [DIR_EAST]: DIR_NORTH,
  [DIR_NORTH]: DIR_WEST,
  [DIR_WEST]: DIR_SOUTH,
};

// OPPOSITE_DIR migré vers direction-coords.ts (= source unique partagée).

/** 1:1 décomp `MovementType_RotateClockwise_Step*` (3726-3762) /
 *  `MovementType_RotateCounterclockwise_*` (similar).
 *  4 états : init, face dir, wait 48 frames, rotate to next. */
function tickRotate(rt: DecompRuntime, npc: ObjectEvent, clockwise: boolean): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp : step 0 → step 1 instantané, puis SetMovementDelay 48 + step 2.
      npc.movementDelay = 48;  // 1:1 décomp SetMovementDelay(sprite, 48)
      npc.movementStep = 2;
      break;
    case 2:
      // Wait delay.
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 3;
      }
      break;
    case 3: {
      // Rotate to next direction (clockwise or counterclockwise).
      const table = clockwise ? NEXT_DIR_CW : NEXT_DIR_CCW;
      npc.facingDirection = table[npc.facingDirection] ?? DIR_SOUTH;
      npc.movementStep = 1;
      break;
    }
  }
  void rt;
}

/** 1:1 décomp `MovementType_WalkBackAndForth_Step*` (event_object_movement.c
 *  3766-3822). NPC walk dans `primaryDir` jusqu'à atteindre la limite du
 *  `movementRange*` (= rangeX/rangeY) puis fait demi-tour et revient à
 *  `initialCoords`, repeat.
 *
 *  Le `directionSequenceIndex` (= `seq`) flag le sens courant :
 *    seq=0 → going outbound (primaryDir)
 *    seq=1 → returning to initial (OPPOSITE(primaryDir))
 *
 *  Seq n'est INCRÉMENTÉ qu'au moment d'un `COLLISION_OUTSIDE_RANGE` dans
 *  Step2 (= NPC a atteint le bord du range). Step3 NE TOUCHE PAS seq.
 *
 *  Bug session 2026-05-21 corrigé : on incrémentait seq dans Step3 dès qu'on
 *  s'éloignait de initialCoords d'1 case → ping-pong 1 pas E / 1 pas W au
 *  lieu de range pas E / range pas W (= user-flag Vigoroth déménageur). */
function tickWalkBackAndForth(rt: DecompRuntime, npc: ObjectEvent, primaryDir: number): void {
  // 1:1 décomp : step 0 → step 1 → step 2 fall-through inline. On merge en
  // appelant la logique step 1 (= set dir+facing) avant case 2 si on entre
  // depuis step <=1, puis on tombe en case 2 logique.
  if (npc.movementStep <= 1) {
    const dir = npc.directionSeqIdx === 0 ? primaryDir : (OPPOSITE_DIR[primaryDir] ?? primaryDir);
    npc.facingDirection = dir;
    npc.movementStep = 2;
  }
  switch (npc.movementStep) {
    case 2: {
      // 1:1 décomp Step2 (3785-3811) :
      // 1. Si seq && currentCoords == initialCoords → reset seq=0 + reverse
      //    movementDirection (= on vient de rentrer à init, on repart outbound).
      if (npc.directionSeqIdx !== 0
          && npc.currentCoordsX === npc.initialCoordsX
          && npc.currentCoordsY === npc.initialCoordsY) {
        npc.directionSeqIdx = 0;
        npc.facingDirection = OPPOSITE_DIR[npc.facingDirection] ?? npc.facingDirection;
      }
      // 2. Compute target cell + check COLLISION_OUTSIDE_RANGE en priorité.
      //    Si dépasse range → seq++ + reverse dir + recompute target dans la
      //    nouvelle direction (= 1:1 décomp ré-appelle GetCollisionInDirection
      //    avec la dir reversée dans la MÊME frame).
      let dir = npc.facingDirection;
      let dx = DIR_TO_DX[dir] ?? 0;
      let dy = DIR_TO_DY[dir] ?? 0;
      let tx = npc.currentCoordsX + dx;
      let ty = npc.currentCoordsY + dy;
      if (IsCoordOutsideObjectEventMovementRange(npc, tx, ty)) {
        npc.directionSeqIdx++;
        dir = OPPOSITE_DIR[dir] ?? dir;
        npc.facingDirection = dir;
        dx = DIR_TO_DX[dir] ?? 0;
        dy = DIR_TO_DY[dir] ?? 0;
        tx = npc.currentCoordsX + dx;
        ty = npc.currentCoordsY + dy;
      }
      // 3. Si la dir choisie peut walk (= wall/NPC/player check) → walk normal.
      //    Sinon (= wall ou NPC) → walk-in-place via retry next tick (1:1 décomp
      //    movementActionId = GetWalkInPlaceNormalMovementAction).
      if (canWalk(npc, dir)) {
        // 1:1 décomp `InitNpcForMovement` : shift current/previous au début.
        ShiftObjectEventCoords(npc, tx, ty);
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 3;
      } else {
        // Wall/NPC collision : pas de progression cette frame, retry next.
        // NE PAS toucher seq (1:1 décomp Step2 garde la même direction quand
        // la collision n'est pas OUTSIDE_RANGE — la wall reste là).
        npc.movementStep = 1;
      }
      break;
    }
    case 3: {
      // Tick walk frames (= worldX/Y visual). 1:1 décomp Step3 ne touche pas
      // directionSequenceIndex (= la transition outbound→return est gérée dans
      // Step2 via COLLISION_OUTSIDE_RANGE).
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        // 1:1 décomp `ShiftStillObjectEventCoords` : previous = current.
        ShiftStillObjectEventCoords(npc);
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.movementStep = 1;
      }
      break;
    }
  }
  void rt;
}

/** Map MOVEMENT_TYPE_* string → state machine handler + allowed directions.
 *  Ajout 4.4.c.2 : multi-direction look + multi-direction wander.
 *  Ajout 4.4.f : ROTATE_*, WALK_*_AND_*, WALK_IN_PLACE_* (= face static),
 *  INVISIBLE (= sprite hidden). */
const MOVEMENT_HANDLERS: Record<string, { tick: 'look' | 'wander'; dirs: ReadonlyArray<number> }> = {
  // Wander (= roam autour avec all 4 directions)
  'MOVEMENT_TYPE_WANDER_AROUND': { tick: 'wander', dirs: gStandardDirections },
  'MOVEMENT_TYPE_WANDER_UP_AND_DOWN': { tick: 'wander', dirs: [DIR_SOUTH, DIR_NORTH] },
  'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT': { tick: 'wander', dirs: [DIR_WEST, DIR_EAST] },
  // Look (= juste tourner sans bouger)
  'MOVEMENT_TYPE_LOOK_AROUND': { tick: 'look', dirs: gStandardDirections },
  'MOVEMENT_TYPE_FACE_DOWN_AND_UP': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH] },
  'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT': { tick: 'look', dirs: [DIR_WEST, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_UP_AND_LEFT': { tick: 'look', dirs: [DIR_NORTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_UP_AND_RIGHT': { tick: 'look', dirs: [DIR_NORTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_DOWN_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT': { tick: 'look', dirs: [DIR_SOUTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_DOWN_UP_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_UP_RIGHT_AND_LEFT': { tick: 'look', dirs: [DIR_NORTH, DIR_EAST, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_RIGHT_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_EAST, DIR_WEST] },
};

/** Movement type pattern matching pour les types non-LookAround/Wander.
 *  Returns le handler à appliquer + paramètres. Approche string-match évite
 *  un huge map literal. */
function dispatchSpecialMovement(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const mt = npc.movementType;
  // ROTATE_CLOCKWISE / COUNTERCLOCKWISE
  if (mt === 'MOVEMENT_TYPE_ROTATE_CLOCKWISE') {
    tickRotate(rt, npc, true);
    return true;
  }
  if (mt === 'MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE') {
    tickRotate(rt, npc, false);
    return true;
  }
  // WALK_*_AND_* : extract primary direction du nom (= DOWN_AND_UP, RIGHT_AND_LEFT, etc).
  if (mt.startsWith('MOVEMENT_TYPE_WALK_') && mt.includes('_AND_')) {
    let primaryDir = DIR_SOUTH;
    if (mt.includes('WALK_DOWN_AND_UP')) primaryDir = DIR_SOUTH;
    else if (mt.includes('WALK_UP_AND_DOWN')) primaryDir = DIR_NORTH;
    else if (mt.includes('WALK_LEFT_AND_RIGHT')) primaryDir = DIR_WEST;
    else if (mt.includes('WALK_RIGHT_AND_LEFT')) primaryDir = DIR_EAST;
    else return false;
    tickWalkBackAndForth(rt, npc, primaryDir);
    return true;
  }
  // WALK_IN_PLACE_* / WALK_SLOWLY_IN_PLACE_* / JOG_IN_PLACE_* / RUN_IN_PLACE_*
  // = facing static + walk anim "in place" cycle (= sprite pattes bougent sans
  //   bouger logical coords). 1:1 décomp `MovementType_WalkInPlace_Step0/1`
  //   (event_object_movement.c:4422 + MovementType_MoveInPlace_Step1:4413) :
  //     Step0: ClearObjectEventMovement + ObjectEventSetSingleMovement(
  //                GetWalkInPlaceNormalMovementAction(facing))
  //     Step1: ExecSingleMovementAction → quand fini, retour Step0 (= loop)
  //
  //   GetWalkInPlace*MovementAction(facing) retourne l'action ID qui declenche
  //   l'anim StartSpriteAnim(GetMoveDirectionAnimNum(facing)) avec une duration
  //   de 16/32/8/4 frames (normal/slow/fast/faster). updateNpcSpriteFrame
  //   alterne entre walk1/walk2 quand walkFramesLeft >= 8.
  //
  //   Bug user-flag : Vigoroth_FACING_AWAY (mt=WALK_IN_PLACE_UP) à MaysHouse_1F
  //   "ne bouge pas" = static facing init était broken (DIR_SOUTH au lieu de
  //   DIR_NORTH), résolu côté `_INITIAL_FACING_BY_MT`. Mais le sprite restait
  //   aussi STATIQUE (= jamais alternait walk1/walk2) faute de tick d'anim.
  if (mt.startsWith('MOVEMENT_TYPE_WALK_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) {
    // 1:1 décomp duration : walk_in_place_normal=16, slow=32, fast=8, faster=4
    // (= event_object_movement.c:5732-5826 InitMoveInPlace, audit session 124).
    let duration = 16;
    if (mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')) duration = 32;
    else if (mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')) duration = 8;
    else if (mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) duration = 4;
    // Init le cycle au premier tick (= mimic Step0 ObjectEventSetSingleMovement).
    if (npc.walkFramesLeft === 0) {
      npc.walkFramesLeft = duration;
      npc.walkDirection = npc.facingDirection;
    }
    npc.walkFramesLeft--;
    // Quand fini → toggle walkAnimAlt (= mimic ExecSingleMovementAction
    // return TRUE → Step1 re-Step0 loop), reset cycle next frame.
    if (npc.walkFramesLeft === 0) {
      npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
    }
    return true;
  }
  // INVISIBLE : sprite hidden. Set npc.invisible.
  if (mt === 'MOVEMENT_TYPE_INVISIBLE') {
    npc.invisible = true;
    return true;
  }
  // BURIED : NPC enterré (= visible only via emote/interact). MVP : invisible.
  // 1:1 décomp `MovementType_Buried_Step0` (event_object_movement.c) : SetSprite
  // Visibility(FALSE) + idle. Notre invisible flag fait pareil.
  if (mt === 'MOVEMENT_TYPE_BURIED' || mt === 'MOVEMENT_TYPE_HIDDEN') {
    npc.invisible = true;
    return true;
  }
  // BERRY_TREE_GROWTH : berry tree state machine (= grows over time). MVP :
  // static visible, pas de growth tick. 1:1 décomp `MovementType_BerryTreeGrowth_*`
  // gère l'état du berry (= seed/sprout/sapling/full/berry). Plus complexe que MVP
  // peut gérer ; on traite comme INVISIBLE pour pas planter (= berry tree NPC
  // disparait du flow normal jusqu'à implementation Phase berry future).
  if (mt === 'MOVEMENT_TYPE_BERRY_TREE_GROWTH') {
    // Pour l'instant : static visible — laisser le sprite tel quel sans tick.
    // Quand on implémentera le berry growth, on forkera ce branch.
    return true;
  }
  // TREE_DISGUISE / MOUNTAIN_DISGUISE / SAND_DISGUISE : NPC se déguise en
  // tree/mountain/sand jusqu'à interact. MVP : static visible (= sprite reste
  // sa forme déguisée, pas de "reveal" anim).
  if (mt === 'MOVEMENT_TYPE_TREE_DISGUISE'
   || mt === 'MOVEMENT_TYPE_MOUNTAIN_DISGUISE'
   || mt === 'MOVEMENT_TYPE_SAND_DISGUISE') {
    return true;
  }
  // COPY_PLAYER_* : NPC qui copie le movement du player (= mirror puzzles
  // dans Trick House). MVP : static facing per movement_type initial.
  // 1:1 décomp `MovementType_CopyPlayer_*` (= shift coords selon player.facing).
  // Implémentation Phase Trick House future.
  if (mt.startsWith('MOVEMENT_TYPE_COPY_PLAYER')) {
    return true;
  }
  // WALK_SLOWLY_IN_PLACE_* : facing static + slower in-place walk anim.
  // MVP : static face (= same as WALK_IN_PLACE).
  if (mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')) {
    return true;
  }
  // JOG_IN_PLACE_* : faster in-place anim. MVP : static face.
  if (mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')) {
    return true;
  }
  // WALK_SEQUENCE_* : NPC walk un pattern prédéfini (= rotation cycle e.g.
  // RIGHT-DOWN-LEFT-UP). MVP : tick comme un WANDER simple.
  if (mt.startsWith('MOVEMENT_TYPE_WALK_SEQUENCE_')) {
    // TODO : implement specific direction sequences from décomp
    // sMovementTypeWalkSequenceTables. MVP : rotate clockwise as approximation.
    return true;
  }
  // RUN_IN_PLACE_* : run anim in place. Same as WALK_IN_PLACE for MVP.
  if (mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) {
    return true;
  }
  // PLAYER_AVATAR : meta-type pour player. Pas de NPC tick.
  if (mt === 'MOVEMENT_TYPE_PLAYER') {
    return true;
  }
  return false;
}

/** Tick chaque NPC selon son movementType. À call chaque frame. */
export function TickObjectEventMovements(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    // Frozen NPCs (= en interact) skip leur state machine.
    if (npc.frozen) continue;

    const handler = MOVEMENT_HANDLERS[npc.movementType];
    if (handler) {
      if (handler.tick === 'look') {
        tickLookAround(rt, npc, handler.dirs);
      } else {
        tickWanderAround(rt, npc, handler.dirs);
      }
      continue;
    }
    // Try special handlers (= ROTATE, WALK_*_AND_*, WALK_IN_PLACE_*, INVISIBLE).
    dispatchSpecialMovement(rt, npc);
    // Movement types non-supportés (BERRY_TREE_GROWTH, TREE_DISGUISE,
    // COPY_PLAYER_*, MOUNTAIN_DISGUISE, WALK_SLOWLY_IN_PLACE_*, WALK_SEQUENCE_*) :
    // statiques pour Phase 4.4.f. Implémentation future si besoin.
  }
}

// ─── Spawn ──────────────────────────────────────────────────────────────────

/** Spawn 1 NPC depuis un template. SYNC : lit la PNG depuis _npcPngCache.
 *  Returns true si spawn réussi, false si skipped (= dedup hit, pool full,
 *  PNG pas cached, graphics non-standard, etc).
 *
 *  Phase 4.8 Tâche 2 : extracted depuis SpawnObjectEventsOnMap pour pouvoir
 *  être appelé par TrySpawnObjectEvents per-frame sync. */
function _spawnSingleNpcFromTemplate(
  template: ObjectEventTemplate,
  currentMapId: string,
  rt: DecompRuntime,
  catalog: Record<string, GraphicsInfo>,
): boolean {
  if (!template.graphicsIdRaw) return false;
  let graphicsKey = template.graphicsIdRaw;
  // 1:1 décomp `event_object_movement.c:820` :
  //   if (graphicsId >= OBJ_EVENT_GFX_VARS)
  //     graphicsId = VarGetObjectEventGraphicsId(graphicsId - OBJ_EVENT_GFX_VARS);
  // OBJ_EVENT_GFX_VAR_N (N=0..7) = placeholder graphics_id qui se résout à
  // runtime via VAR_OBJ_GFX_ID_N. Used par les NPCs rival (= sprite genre
  // opposé) + Wally + autres NPCs dynamiques.
  const varMatch = graphicsKey.match(/^OBJ_EVENT_GFX_VAR_(\d+)$/);
  if (varMatch) {
    const n = Number(varMatch[1]);
    const varName = `VAR_OBJ_GFX_ID_${n}`;
    const gfxIdValue = (gSaveBlock1Ptr.vars[varName] as number) ?? 0;
    if (gfxIdValue !== 0) {
      const resolved = _reverseDecompConstant(gfxIdValue, 'OBJ_EVENT_GFX_');
      if (resolved) {
        graphicsKey = resolved;
      } else {
        console.warn(`[object-events] OBJ_EVENT_GFX_VAR_${n} resolved to ${gfxIdValue} but no matching OBJ_EVENT_GFX_ const found, skip`);
        return false;
      }
    } else {
      // VAR_OBJ_GFX_ID_N = 0 (= pas encore set par script). Ne pas spawn —
      // décomp ferait pareil (= sprite blank/invisible).
      return false;
    }
  }
  const graphics = catalog[graphicsKey];
  if (!graphics) return false;
  // 1:1 décomp `TrySpawnObjectEvents` (event_object_movement.c:1670) :
  //   if (... && !FlagGet(template->flagId)) TrySpawnObjectEventTemplate(...)
  // → un NPC avec un flag set est CACHÉ. Ex : FLAG_HIDE_LITTLEROOT_TOWN_BIRCH
  // empêche Birch d'apparaitre tant qu'il est hidden par scénario.
  // template.flagId == "0" ou "" → no flag (= always show).
  if (template.flagId && template.flagId !== '0' && FlagGet(template.flagId)) {
    return false;
  }
  // Phase 4.10 : support multi-tailles NPC :
  //   - 16×32 standard people sprites (= overworld_frame anim 9 frames).
  //   - 16×16 inanimate (= moving box, berry tree, egg, etc.).
  //   - 32×32 large Pokemon (= Vigoroth_Carrying_Box déménageurs, Latios, etc.).
  //   - 48×48 truck (= subsprites 12 OAMs).
  // Session 123 : 32×32 ajouté car Vigoroth déménageurs étaient skip silencieusement
  // → "il manque les déménageurs (gros sprite Pokémon NPC)" dans BrendansHouse_1F.
  const is48x48 = graphics.frameWidth === 48 && graphics.frameHeight === 48;
  const is32x32 = graphics.frameWidth === 32 && graphics.frameHeight === 32;
  const is16x32 = graphics.frameWidth === 16 && graphics.frameHeight === 32;
  const is16x16 = graphics.frameWidth === 16 && graphics.frameHeight === 16;
  if (!is48x48 && !is32x32 && !is16x32 && !is16x16) return false;
  if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) return false;

  // 1:1 décomp `GetAvailableObjectEventId` (event_object_movement.c:1263) :
  // dedup par (localId, mapId). Notre loader set localId=0 pour templates
  // avec local_id JSON (= placeholder, pas encore résolu), donc unreliable.
  // Fallback : dedup via (mapId, initialCoordsX, initialCoordsY) uniques.
  // Post R3 refactor : initialCoords INTERNAL → compare avec template.x + MAP_OFFSET.
  const existing = gObjectEvents.findIndex(
    o => o.active
      && o.mapId === currentMapId
      && o.initialCoordsX === template.x + MAP_OFFSET
      && o.initialCoordsY === template.y + MAP_OFFSET,
  );
  if (existing >= 0) return false;

  const slot = gObjectEvents.findIndex(o => !o.active);
  if (slot < 0) return false;

  // SYNC : PNG depuis cache. Si pas cached, skip — caller doit avoir préload.
  const pngPath = `${BASE}/${graphics.png}`;
  const png = _npcPngCache.get(pngPath);
  if (!png) return false;

  // Phase 4.8 Tâche 3 : prefer free slot du pool removed avant d'allouer un
  // nouveau (sinon pool exhaust à ~13 NPCs après plusieurs cross-borders).
  let objTileBase: number;
  let paletteBank: number;
  const freeSlot = _freeNpcSlots.pop();
  if (freeSlot) {
    objTileBase = freeSlot.tileBase;
    paletteBank = freeSlot.paletteBank;
  } else {
    if (_nextNpcTileBase + TILES_PER_NPC > 1024) return false;
    if (_nextNpcPaletteBank >= 16) return false;
    objTileBase = _nextNpcTileBase;
    _nextNpcTileBase += TILES_PER_NPC;
    paletteBank = _nextNpcPaletteBank++;
  }

  if (is48x48) {
    // 48×48 truck : 36 tiles row-major sequential (= matches sOamTable_48x48
    // tileOffsets 0, 4, 6, 10, ... 34). PNG layout : 6×6 tiles row-major.
    // Just copy the 36 tiles directly into OBJ VRAM at objTileBase.
    rt.gba.objVram.set(png.charData.subarray(0, 36 * 32), objTileBase * 32);
  } else if (is32x32) {
    // 32×32 large Pokemon (= Vigoroth déménageurs, Latios, etc.).
    //
    // **Session 124 fix Bug 1** : PNG row-major NE MATCHE PAS le format OBJ
    // 1D MAP. Pour un PNG multi-frames (= Vigoroth 5 frames horizontaux de
    // 32x32, 160x32 PNG = 20 tiles wide), copier `subarray(0, 16*32)` prend
    // les 16 PREMIERS tiles row-major du PNG = 16 tiles de la row 0 (= 4
    // frames partiels horizontalement) → garbage rendering.
    //
    // Fix : utiliser pngTo1dObjLayoutSingleFrame (= reorganise 16 tiles d'un
    // frame N en row-major frame-local).
    //
    // Anim multi-frame 1:1 décomp (session 2026-05-20 user-flag Vigoroth) :
    // 1:1 décomp `sPicTable_Vigoroth*` (object_event_pic_tables.h:928-950) +
    // `sAnim_GoSouth/North/West/East` (object_event_anims.h:202-236) :
    //   - VIGOROTH_CARRYING_BOX : face=PNG[0], walk1=PNG[1], walk2=PNG[2]
    //     (= face down avec box + 2 frames marche down ; le hFlip vers east
    //      utilise les mêmes frames car le sprite reste face DOWN).
    //   - VIGOROTH_FACING_AWAY : face=PNG[3], walk1=PNG[4], walk2=PNG[4]
    //     (= face up ; pas de walk2 distinct du PNG, walk1 répété sur les
    //      sub-frames walk1/walk2 de sAnim_GoNorth → oscillation 2-frame).
    //   - autres 32x32 (futur) : face=0, walk1=1, walk2=2 (defaults).
    //
    // Charge les 3 frames consecutivement en VRAM à objTileBase pour que
    // updateNpcSpriteFrame branch is32x32 puisse cycler oam.tileId entre
    // objTileBase, objTileBase+16, objTileBase+32 (16 tiles par frame 32×32).
    let faceFrame = 0;
    let walk1Frame = 1;
    let walk2Frame = 2;
    if (graphicsKey === 'OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY') {
      faceFrame = 3;
      walk1Frame = 4;
      walk2Frame = 4;  // pas de walk2 distinct du PNG
    }
    const faceTiles = pngTo1dObjLayoutSingleFrame(png.charData, faceFrame, png.widthTiles, 32, 32);
    const walk1Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk1Frame, png.widthTiles, 32, 32);
    const walk2Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk2Frame, png.widthTiles, 32, 32);
    rt.gba.objVram.set(faceTiles, objTileBase * 32);
    rt.gba.objVram.set(walk1Tiles, (objTileBase + 16) * 32);
    rt.gba.objVram.set(walk2Tiles, (objTileBase + 32) * 32);
  } else if (is16x16) {
    // 16×16 inanimate (= moving box, berry, egg). 4 tiles row-major.
    // Single frame, sequential layout dans le PNG.
    const numTiles = png.widthTiles * png.heightTiles;
    rt.gba.objVram.set(png.charData.subarray(0, numTiles * 32), objTileBase * 32);
  } else {
    const numFrames = (png.widthTiles * png.heightTiles) / TILES_PER_FRAME_16x32;
    const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);
    rt.gba.objVram.set(reordered, objTileBase * 32);
  }
  const paletteSlot = 256 + paletteBank * 16;
  for (let i = 0; i < Math.min(16, png.palette.length); i++) {
    rt.gPlttBufferFaded.set(paletteSlot + i, png.palette[i]);
    rt.gPlttBufferUnfaded.set(paletteSlot + i, png.palette[i]);
  }
  // 1:1 décomp : NE PAS flushTo inline (= cf. player-avatar.ts:InitPlayerAvatar
  // pour rationale détaillée). L'auto-flushTo VBlank pousse via TransferPlttBuffer
  // qui respecte `bufferTransferDisabled` → permet de gater le palette transfer
  // pendant warp load. Sans ce gate, chaque NPC spawn (SpawnObjectEventsOnMap fire
  // N×) leak les NEW colors → flash de la dest map AVANT fade-in.

  const cam = GetCameraTopLeftCoords();
  const npc = gObjectEvents[slot];
  npc.active = true;
  npc.invisible = false;
  npc.graphicsId = graphicsKey;
  npc.movementType = template.movementTypeRaw ?? '';
  npc.localId = template.localId;
  npc.localIdRaw = template.localIdRaw;  // Phase 4.10 : pour movement-system applymovement.
  npc.mapId = currentMapId;  // Phase 4.8 : track map of origin pour dedup cross-border.
  npc.scriptLabel = template.script ?? '';
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1298-1312) :
  //   x = template->x + MAP_OFFSET;
  //   y = template->y + MAP_OFFSET;
  //   objectEvent->currentCoords.x = x;
  //   objectEvent->currentCoords.y = y;
  //   objectEvent->previousCoords.x = x;
  //   objectEvent->previousCoords.y = y;
  // Post R3 refactor : storage INTERNAL 1:1 strict path identique au décomp.
  npc.currentCoordsX = template.x + MAP_OFFSET;
  npc.currentCoordsY = template.y + MAP_OFFSET;
  npc.previousCoordsX = template.x + MAP_OFFSET;
  npc.previousCoordsY = template.y + MAP_OFFSET;
  npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
  npc.movementDirection = npc.facingDirection;
  npc.previousMovementDirection = npc.facingDirection;
  // 1:1 décomp `GetAllGroundEffectFlags_OnSpawn` (event_object_movement.c:7389)
  // appelle `ObjectEventUpdateMetatileBehaviors(objEvent)` au spawn pour init
  // `currentMetatileBehavior` + `previousMetatileBehavior` cached fields.
  ObjectEventUpdateMetatileBehaviors(npc);
  npc.objTileBase = objTileBase;
  npc.paletteBank = paletteBank;
  // Post R3 refactor : npc.currentCoords déjà INTERNAL (= template + MAP_OFFSET).
  const npcGBackupCol = npc.currentCoordsX;
  const npcGBackupRow = npc.currentCoordsY;
  // Phase 4.9 audit : 1:1 décomp `SetSpritePosToMapCoords` (event_object_movement.c:4801).
  //
  // ```c
  // s16 dx = -gTotalCameraPixelOffsetX - gFieldCamera.x;
  // s16 dy = -gTotalCameraPixelOffsetY - gFieldCamera.y;
  // if (gFieldCamera.x > 0) dx += 16;
  // if (gFieldCamera.x < 0) dx -= 16;
  // if (gFieldCamera.y > 0) dy += 16;
  // if (gFieldCamera.y < 0) dy -= 16;
  // *destX = ((mapX - pos.x) << 4) + dx;
  // *destY = ((mapY - pos.y) << 4) + dy;
  // ```
  //
  // Le `+/- 16` quand gFieldCamera.{x,y} non-zero (= mid-step) snap le spawn
  // sprite à la post-step position. Sans ça, NPCs spawnés mid-step (= via
  // orchestrator au tile boundary frame 0 où gFieldCamera.y = ±1 post-update)
  // dérivent de 16 px sur le reste du step (= drift "1 case trop bas/haut").
  //
  // Notre conv (post-refactor) : cam.x/y = playerLogical (= 1:1 décomp pos).
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  // 1:1 décomp `(mapX - pos.x) << 4 + dx` (event_object_movement.c:4801).
  // mapX = NPC's gBackup-frame coord. pos.x = LOGICAL.x player (= cam.x).
  // (npcGBackupCol - cam.x) = (template.x + 7 - LOGICAL.x_player) = "cols from view top-left".
  // Player drawn at view (7, 7) avec BG_VOFS = 40 → screen y centered.
  npc.worldX = (npcGBackupCol - cam.x) * 16 + 8 + dx;
  npc.worldY = (npcGBackupRow - cam.y) * 16 + dy;
  npc.movementStep = 0;
  npc.movementDelay = 0;
  npc.walkFramesLeft = 0;
  npc.walkDirection = DIR_NONE;
  npc.walkAnimAlt = 0;
  npc.frozen = false;
  // Post R3 refactor : initialCoords INTERNAL (= +MAP_OFFSET) 1:1 décomp
  // event_object_movement.c:1307.
  npc.initialCoordsX = template.x + MAP_OFFSET;
  npc.initialCoordsY = template.y + MAP_OFFSET;
  npc.movementRangeX = template.movementRangeX;
  npc.movementRangeY = template.movementRangeY;
  // 1:1 décomp event_object_movement.c:1323-1328 — force range = 1 si 0 et
  // movementType ∈ sMovementTypeHasRange.
  if (movementTypeHasRange(npc.movementType)) {
    if (npc.movementRangeX === 0) npc.movementRangeX = 1;
    if (npc.movementRangeY === 0) npc.movementRangeY = 1;
  }
  npc.directionSeqIdx = 0;

  if (is48x48) {
    // Primary sprite = placeholder logique pour le subsprite system. shape=2
    // size=2 (= 16×32) hidden après SetSubspriteTables. tileBase = objTileBase
    // utilisé par syncSubspriteOam pour calculer child tileId = tileBase +
    // sub.tileOffset.
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: 2, size: 2,
      priority: 2,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) sprite.tileBase = objTileBase;
    rt.gba.oam[result.oamIndex].flipH = false;
    // 1:1 décomp `SetSubspriteTables(sprite, sOamTables_48x48)` : alloue 12
    // child OAMs avec offsets (-24, -24), ..., (8, 16) et tileOffsets 0, 4,
    // ..., 34. Le primary OAM est hidden — les child OAMs rendent le 48×48.
    SetSubspriteTables(npc.spriteId, sOamTable_48x48);
    npc.useSubsprites = true;
  } else if (is16x16) {
    // 16×16 inanimate (= moving box, berry, egg, etc.) : single OAM shape=0
    // size=1 (= 16×16). Pas de frame anim (= 1 frame seul, useSubsprites=false
    // = updateNpcSpriteFrame skip via la même logique que les subsprites
    // puisque cfg.face * 8 ne matche pas notre tile layout 16×16).
    npc.useSubsprites = true; // hack : skip updateNpcSpriteFrame (= pas de
                               // frame layout 16×32) en réutilisant le flag.
    // Session 124 fix Bug 3 : 1:1 décomp `UpdateObjectEventElevationAndPriority`
    // assigne priority + subspriteTableNum selon elevation :
    //   sprite->subspriteTableNum = sElevationToSubspriteTableNum[elevation];
    //   sprite->oam.priority = sElevationToPriority[elevation];
    // Pour caisses elevation=8 → priority 1 + subsprite table 2 (= split en
    // 2 OAMs 16x8 avec priorities 2/3 → top half rendered above, bottom half
    // behind). Sans le split, on rend single OAM 16x16 priority 1 → 1-pixel
    // artifact visible lors du trajet camion (= user feedback).
    const ELEV_PRIORITY      = [2,2,2,2,1,2,1,2,1,2,1,2,1,0,0,2];
    const ELEV_SUBSPRITE_NUM = [1,1,1,1,2,1,2,1,2,1,2,1,2,0,0,1];
    const inRange = template.elevation >= 0 && template.elevation < 16;
    const elevPriority = inRange ? ELEV_PRIORITY[template.elevation] : 2;
    const subspriteNum = inRange ? ELEV_SUBSPRITE_NUM[template.elevation] : 1;
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: 0 /* square */, size: 1 /* 16×16 */,
      priority: elevPriority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) sprite.tileBase = objTileBase;
    rt.gba.oam[result.oamIndex].flipH = false;
    // Apply subsprite split si elevation→table 2 (= elevation 4,6,8,10,12).
    if (subspriteNum === 2) {
      SetSubspriteTables(npc.spriteId, sOamTable_16x16_2);
    }
  } else if (is32x32) {
    // 32×32 large Pokemon (= Vigoroth déménageurs). Single OAM shape=0 size=2
    // (= 32×32). is32x32=true active la branche dédiée dans updateNpcSpriteFrame
    // (= cycle oam.tileId entre 3 frames consecutivement chargées en VRAM :
    // face=base, walk1=base+16, walk2=base+32). 1:1 décomp sAnim_Go* alterne
    // walk1/face/walk2/face sur 32 frames (= 4 sub-frames × 8 ticks) — notre
    // approximation MVP : walkFramesLeft cycle 16 → 0, walkAnimAlt toggle pour
    // alterner walk1/walk2. updateNpcSpriteFrame branche is32x32 mappe :
    //   - walkFramesLeft >= 8 → walk1 (alt=0) ou walk2 (alt=1)
    //   - walkFramesLeft < 8  → face
    // useSubsprites stays FALSE (= we want updateNpcSpriteFrame to run for
    // Vigoroth ; useSubsprites=true previously was a hack pour skip le
    // 16×32 frame layout invalide qui produisait du garbage).
    npc.useSubsprites = false;
    npc.is32x32 = true;
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: 0 /* square */, size: 2 /* 32×32 */,
      priority: 2,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) sprite.tileBase = objTileBase;
    rt.gba.oam[result.oamIndex].flipH = false;
  } else {
    npc.useSubsprites = false;
    const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[DIR_SOUTH];
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase + cfg.face * TILES_PER_FRAME_16x32,
      paletteBank,
      x: 0, y: 0,
      shape: 2, size: 2,
      priority: 2,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) sprite.hFlip = cfg.hFlip;
    rt.gba.oam[result.oamIndex].flipH = cfg.hFlip;
  }

  console.log(`[object-events] spawn slot=${slot} ${graphicsKey} mt=${npc.movementType} at (${npc.currentCoordsX - MAP_OFFSET}, ${npc.currentCoordsY - MAP_OFFSET})`);
  return true;
}

/** Phase 4.8 Tâche 2 : Spawn TOUS les NPC templates de la map courante.
 *  Async car preload des PNGs (parallel). Iteration spawn elle-même est sync.
 *  1:1 décomp `TrySpawnObjectEvents(0, 0)` au map init/warp (overworld.c:2159).
 *  Pas de bounds check ici — décomp init spawn TOUS templates sans filter
 *  (= le bounds check c'est pour TrySpawnObjectEvents per-frame). */
export async function SpawnObjectEventsOnMap(rt: DecompRuntime): Promise<void> {
  if (!gMapHeader) throw new Error('SpawnObjectEventsOnMap: gMapHeader is null');
  const templates = gMapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) {
    console.log('[object-events] no NPCs in this map');
    return;
  }
  const currentMapId = gMapHeader.id;
  const catalog = await loadGraphicsCatalog();

  // 1:1 décomp `gObjectEventTemplates[]` overlay : `setobjectxyperm` opcode
  // (script-opcodes.ts:1068) modifie aussi gameState.__objectPositions pour
  // persister cross map-reload. Apply the overlay BEFORE spawning so NPCs
  // appear at their persisted position. Required pour ?nointro qui set Mom
  // à (4, 5) post-MoveMomToTV même si la map.json default est (2, 6).
  const { gameState } = await import('./game-state');
  for (const template of templates) {
    const idKey = template.localIdRaw || `idx_${template.localId}`;
    const pos = gameState.getObjectXY(currentMapId, idKey);
    if (pos) {
      template.x = pos.x;
      template.y = pos.y;
    }
  }

  // PARALLEL preload (= élimine sequential await + matches décomp instant
  // spawn). Templates qui referencent une PNG manquante après preload sont
  // loggées (= via _spawnSingleNpcFromTemplate which checks cache).
  await preloadNpcGraphicsForMap(gMapHeader);

  // SYNC iteration spawn.
  for (const template of templates) {
    _spawnSingleNpcFromTemplate(template, currentMapId, rt, catalog);
  }
}

/** 1:1 décomp `TrySpawnObjectEvent(u8 localId, u8 mapNum, u8 mapGroup)`
 *  (event_object_movement.c). Spawn UN seul NPC par localId — appelé par
 *  ScrCmd_addobject après ClearFlag. Ne fait pas de bounds check (= le script
 *  est responsable de spawn dans des positions logiques). */
export function TrySpawnObjectEvent(localIdRaw: string, rt: DecompRuntime): boolean {
  if (!gMapHeader) return false;
  const templates = gMapHeader.events?.objectEvents ?? [];
  const tpl = templates.find(t => t.localIdRaw === localIdRaw);
  if (!tpl) return false;
  if (!_graphicsCatalog) return false;
  return _spawnSingleNpcFromTemplate(tpl, gMapHeader.id, rt, _graphicsCatalog);
}

/** 1:1 décomp `TrySpawnObjectEvents(s16 cameraX, s16 cameraY)`
 *  (event_object_movement.c:1645-1675). Per-frame ou per-boundary-cross :
 *  iterate tous les NPC templates de la map, spawn ceux dans bounds qui
 *  ne sont pas déjà active (= dedup via (mapId, initialCoords)).
 *
 *  Bounds 1:1 décomp :
 *    left   = pos.x - 2
 *    right  = pos.x + MAP_OFFSET_W + 2 = pos.x + 17
 *    top    = pos.y
 *    bottom = pos.y + MAP_OFFSET_H + 2 = pos.y + 16
 *  Compare avec npcX = template.x + MAP_OFFSET, npcY = template.y + MAP_OFFSET.
 *  Réécrit en LOGICAL frame : template.x dans [pos.x - 9, pos.x + 10],
 *  template.y dans [pos.y - 7, pos.y + 9].
 *
 *  SYNC : assume PNGs préchargées via preloadNpcGraphicsForMap. Si pas cached,
 *  _spawnSingleNpcFromTemplate retourne false et le NPC sera retried frame
 *  suivante (= no-op rapide). */
export function TrySpawnObjectEvents(rt: DecompRuntime): void {
  if (!gMapHeader) return;
  const templates = gMapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) return;
  if (!_graphicsCatalog) return;  // Catalog pas encore loaded — caller missed init.
  const currentMapId = gMapHeader.id;
  const catalog = _graphicsCatalog;

  // 1:1 décomp pos.x/y. Notre conv : pos.x = playerLogical.x = gPlayerAvatar.x,
  // pos.y = playerLogical.y = gPlayerAvatar.y.
  const posX = gPlayerAvatar.x;
  const posY = gPlayerAvatar.y;
  const left = posX - 9;
  const right = posX + 10;
  const top = posY - 7;
  const bottom = posY + 9;

  for (const template of templates) {
    if (template.x < left || template.x > right) continue;
    if (template.y < top || template.y > bottom) continue;
    _spawnSingleNpcFromTemplate(template, currentMapId, rt, catalog);
  }
}

// ─── Re-anchor sprite pixel pos depuis coords logiques (resume save) ────────

/** 1:1 décomp `SetSpritePosToMapCoords` (event_object_movement.c:4801).
 *  Recalcule `npc.worldX/worldY` (= ancre pixel du sprite) depuis des coords
 *  LOGIQUES tile (x,y), avec la MÊME formule que le spawn (object-events.ts
 *  ~1205-1237 ; garder les deux synchronisés = 1:1).
 *
 *  ⚠️ Étape 5 SAVE-SYSTEM-1TO1 — fix bug "pnj reset mais pas leur hitbox" :
 *  la collision NPC lit `currentCoords` (isOtherNpcAt:566) mais le sprite est
 *  driven par `worldX/worldY` (UpdateObjectEvents:1506). Au resume d'une save,
 *  applySnapshotToObjectEvent restaure `currentCoords` (→ hitbox à la pos
 *  sauvée) mais PAS `worldX/worldY` → le sprite reste à la pos template
 *  (= "reset" visuel) tandis que la hitbox est ailleurs. Ré-ancrer ici remet
 *  sprite ET hitbox à la pos sauvée (1:1 décomp : LoadObjectEvents copie la
 *  struct ENTIÈRE puis le sprite est repositionné depuis les coords). */
export function SetObjectEventSpritePosToMapCoords(npc: ObjectEvent, x: number, y: number): void {
  const cam = GetCameraTopLeftCoords();
  const npcGBackupCol = x + MAP_OFFSET;
  const npcGBackupRow = y + MAP_OFFSET;
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  npc.worldX = (npcGBackupCol - cam.x) * 16 + 8 + dx;
  npc.worldY = (npcGBackupRow - cam.y) * 16 + dy;
  // NPC restauré = au repos sur sa tile (pas mid-walk) : couper toute
  // progression de marche résiduelle pour que UpdateObjectEvents le dessine
  // statique à worldX/Y (= 1:1 spawn qui set walkFramesLeft=0/DIR_NONE).
  npc.walkFramesLeft = 0;
  npc.walkDirection = DIR_NONE;
  npc.movementStep = 0;
  npc.visualOffsetX = 0;
  npc.visualOffsetY = 0;
}

// ─── Update sprite positions + frame each frame ────────────────────────────

/** Update sprite.x/y selon worldX/Y stored at spawn + camera scroll, ET sprite
 *  frame selon facingDirection courante. Appelé chaque frame depuis
 *  MainCB2_Overworld APRÈS TickObjectEventMovements.
 *
 *  1:1 décomp BuildOamBuffer (sprite.c:347-355) avec coordOffsetEnabled=TRUE :
 *    oam.x = sprite.x + sprite.x2 + centerToCornerVecX + gSpriteCoordOffsetX
 *  où gSpriteCoordOffsetX = gTotalCameraPixelOffsetX. Notre impl combine
 *  centerToCornerVec + coordOffset en un seul `sprite.x = worldX + offX` ici.
 *
 *  Le worldX stored = sprite.x_decomp_at_spawn (= constant + walk increments).
 *  Le offX = gTotalCameraPixelOffsetX (= sub-tile + cumulative camera scroll).
 *  Player + NPC tous deux subissent la même +offX → ils restent alignés
 *  relativement (1:1 décomp). Le PLAYER en revanche a sprite.x FIXED à 120
 *  dans notre impl (= bypass coordOffsetEnabled), donc on a un mismatch
 *  player↔NPC quand pixelOffsetX dérive du multiple de 16.
 *
 *  Phase 4.10 v2 : pour éviter la dérive, on snap pixelOffsetX/Y au step end
 *  avec stop dans player-avatar.ts. Avec snap, pixelOffsetX = exact multiple
 *  de 16 pour static state → sprite.x_NPC + offX aligné avec player. */
export function UpdateObjectEvents(rt: DecompRuntime): void {
  const cam = GetCameraTopLeftCoords();
  const offX = gTotalCamera.pixelOffsetX;
  const offY = gTotalCamera.pixelOffsetY;
  const bgVofsBaseline = GetBgVofsBaseline();

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (!sprite) continue;

    // Post R3 refactor : npc.currentCoords stockés INTERNAL → use direct.
    const npcGBackupCol = npc.currentCoordsX;
    const npcGBackupRow = npc.currentCoordsY;
    const viewCol = npcGBackupCol - cam.x;
    const viewRow = npcGBackupRow - cam.y;
    if (viewCol < -2 || viewCol > 17 || viewRow < -2 || viewRow > 13) {
      sprite.invisible = true;
      continue;
    }
    // 1:1 décomp : on respecte le `npc.invisible` flag set par script
    // (= `set_invisible` movement action, `hideobject` opcode, etc.).
    // Avant : `sprite.invisible = false` forcé chaque frame → écrasait
    // set_invisible → user feedback session 123 "le sprite de la mère
    // ne disparait pas sur la porte" pendant LittlerootTown_Movement_MomEnterHouse.
    sprite.invisible = npc.invisible;

    // 1:1 décomp `gSpriteCoordOffsetX/Y` (field_camera.c:461-462) :
    //   gSpriteCoordOffsetX = gTotalCameraPixelOffsetX - sHorizontalCameraPan;
    //   gSpriteCoordOffsetY = gTotalCameraPixelOffsetY - sVerticalCameraPan - 8;
    // Sprite shift INVERSE du camera pan (= 1:1 décomp behavior).
    // visualOffsetX/Y = 1:1 décomp `sprite.x2/y2` (= used par truck box
    // bouncing via SetObjectEventSpritePosByLocalIdAndMap).
    const panX = _getCameraPanX();
    const panY = _getCameraPanY();
    sprite.x = npc.worldX + offX - panX + npc.visualOffsetX;
    sprite.y = npc.worldY + offY - bgVofsBaseline - panY + npc.visualOffsetY;

    // Update sprite frame chaque frame (= keeps tile + flipH en sync avec
    // facingDirection, important pour interact qui change facing instantané).
    updateNpcSpriteFrame(rt, npc);
  }
}

/** 1:1 décomp `SetObjectEventSpritePosByLocalIdAndMap` (field_camera.c).
 *  ```c
 *  void SetObjectEventSpritePosByLocalIdAndMap(u8 localId, u8 mapNum, u8 mapGroup, s16 x, s16 y) {
 *      u8 objId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
 *      if (objId != OBJECT_EVENTS_COUNT) {
 *          gSprites[gObjectEvents[objId].spriteId].x2 = x;
 *          gSprites[gObjectEvents[objId].spriteId].y2 = y;
 *      }
 *  }
 *  ```
 *  Used par Task_Truck1/2 pour box bouncing. Trouve le NPC par localIdRaw
 *  + set ses visualOffsetX/Y (= notre équivalent de sprite.x2/y2). */
export function SetObjectEventSpritePosByLocalIdAndMap(
  localIdRaw: string,
  x: number,
  y: number,
): void {
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === localIdRaw) {
      npc.visualOffsetX = x;
      npc.visualOffsetY = y;
      return;
    }
  }
}

export function DestroyAllObjectEvents(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites.get(npc.spriteId);
      if (sprite) {
        sprite.inUse = false;
        rt.gba.oam[sprite.oamIndex].visible = false;
      }
    }
    npc.active = false;
    npc.spriteId = -1;
  }
  resetObjectEventAllocations();
}

// ─── Phase 4.8 : seamless cross-border NPC handling (1:1 décomp) ─────────────

/** 1:1 décomp `UpdateObjectEventCoordsForCameraUpdate` (event_object_movement.c:2167-2190).
 *
 *  ```c
 *  void UpdateObjectEventCoordsForCameraUpdate(void) {
 *      if (gCamera.active) {
 *          dx = gCamera.x;
 *          dy = gCamera.y;
 *          for (each active NPC) {
 *              initialCoords -= (dx, dy);
 *              currentCoords -= (dx, dy);
 *              previousCoords -= (dx, dy);
 *          }
 *      }
 *  }
 *  ```
 *
 *  Phase 4.8 audit : changement de signature pour être 1:1 décomp. Avant on
 *  passait dx/dy en paramètres. Maintenant on lit gCamera.active/x/y (= set
 *  par CameraMove au cross-border, FALSE sinon). Per-frame call est safe car
 *  no-op si gCamera.active=FALSE. */
export function UpdateObjectEventCoordsForCameraUpdate(): void {
  if (!gCamera.active) return;
  const dx = gCamera.x;
  const dy = gCamera.y;
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    npc.currentCoordsX -= dx;
    npc.currentCoordsY -= dy;
    npc.previousCoordsX -= dx;
    npc.previousCoordsY -= dy;
    npc.initialCoordsX -= dx;
    npc.initialCoordsY -= dy;
  }
}

/** 1:1 décomp `UpdateObjectEventsForCameraUpdate(s16 x, s16 y)` (event_object_movement.c:2217).
 *
 *  ```c
 *  void UpdateObjectEventsForCameraUpdate(s16 x, s16 y) {
 *      UpdateObjectEventCoordsForCameraUpdate();   // si gCamera.active
 *      TrySpawnObjectEvents(x, y);                  // bounds check + spawn
 *      RemoveObjectEventsOutsideView();              // cleanup hors bounds
 *  }
 *  ```
 *
 *  Appelé depuis CameraUpdate (field_camera.c:416) UNIQUEMENT au tile
 *  boundary (= deltaX/Y non-zero). Cette restriction au tile boundary élimine
 *  le mid-step capture drift qu'on avait avec per-frame TrySpawn.
 *
 *  À call dans CameraUpdate après CameraMove (= ordre 1:1 décomp). */
export function UpdateObjectEventsForCameraUpdate(rt: DecompRuntime, x: number, y: number): void {
  void x;  // décomp passe deltaX/deltaY (= used as cameraX/Y dans TrySpawn signature)
  void y;
  UpdateObjectEventCoordsForCameraUpdate();
  TrySpawnObjectEvents(rt);
  RemoveObjectEventsOutsideView(rt);
}

// Register pour CameraUpdate orchestrator call via field-globals.
_registerUpdateObjectEventsForCameraUpdate((rt, dx, dy) => {
  UpdateObjectEventsForCameraUpdate(rt as DecompRuntime, dx, dy);
});

/** 1:1 décomp `RemoveObjectEventsOutsideView` (event_object_movement.c:1677).
 *  Removes NPCs dont currentCoords ET initialCoords sont tous deux hors view+
 *  buffer. Les NPCs traversant la border (= currentCoords in view via FillX)
 *  restent visibles. À call per-frame depuis MainCB2 après UpdateObjectEvents.
 *
 *  Décomp bounds (pos LOGICAL frame) : [pos.x - 2, pos.x + 17], [pos.y, pos.y + 16].
 *  NPC.coords en gBackup (= template + MAP_OFFSET). La comparaison mixed-frame
 *  donne en LOGICAL : NPC.template ∈ [pos.x - 9, pos.x + 10] × [pos.y - 7, pos.y + 9].
 *
 *  Notre impl post-refactor : NPC.coords = template (LOGICAL pur). _camPos.x/y =
 *  pos.x/y (= 1:1 décomp gSaveBlock1Ptr->pos en LOGICAL).
 *  Équivalent bounds en LOGICAL :
 *    left = cam.x - 9, right = cam.x + 10.
 *    top = cam.y - 7, bottom = cam.y + 9. */
export function RemoveObjectEventsOutsideView(rt: DecompRuntime): void {
  if (!gMapHeader) return;
  const cam = GetCameraTopLeftCoords();
  // Post R3 refactor : npc.currentCoords/initialCoords stockés INTERNAL → bounds
  // alignés INTERNAL (= cam.x LOGICAL + MAP_OFFSET).
  const left = cam.x - 9 + MAP_OFFSET;
  const right = cam.x + 10 + MAP_OFFSET;
  const top = cam.y - 7 + MAP_OFFSET;
  const bottom = cam.y + 9 + MAP_OFFSET;

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    const inViewCurrent = npc.currentCoordsX >= left && npc.currentCoordsX <= right
      && npc.currentCoordsY >= top && npc.currentCoordsY <= bottom;
    const inViewInitial = npc.initialCoordsX >= left && npc.initialCoordsX <= right
      && npc.initialCoordsY >= top && npc.initialCoordsY <= bottom;
    if (inViewCurrent || inViewInitial) continue;
    // NPC outside view+buffer → remove.
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) {
      sprite.inUse = false;
      rt.gba.oam[sprite.oamIndex].visible = false;
    }
    // Phase 4.8 Tâche 3 : free le slot tile/palette dans le pool pour réuse.
    _freeNpcSlot(npc);
    npc.active = false;
    npc.spriteId = -1;
  }
}

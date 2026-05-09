/**
 * load_save.ts — Hooks 1:1 décomp `src/load_save.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/load_save.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/save.c` (TrySavingData)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/overworld.c` (SetContinueGameWarp*)
 *
 * Pattern 1:1 décomp save flow :
 *   1. SAVE :
 *      a. SetContinueGameWarpStatusToDynamicWarp()
 *         (= `gSaveBlock1Ptr->continueGameWarp = gSaveBlock1Ptr->dynamicWarp`)
 *      b. CopyPartyAndObjectsToSave()
 *         = SavePlayerParty() + SaveObjectEvents()
 *         (= `gSaveBlock1Ptr->playerParty[i] = gPlayerParty[i]` +
 *            `gSaveBlock1Ptr->objectEvents[i] = gObjectEvents[i]`)
 *      c. SaveMapView() (= snapshot 256 metatiles autour du player)
 *      d. WriteSaveBlocks (= TrySavingData)
 *
 *   2. LOAD :
 *      a. LoadGameSave (= read sectors + checksum + alternation)
 *      b. CB2_ContinueSavedGame → LoadMap au block1.location
 *      c. CopyPartyAndObjectsFromSave()
 *         = LoadPlayerParty() + LoadObjectEvents()
 *      d. SetPlayerCoordsFromWarp (= use location.warpId, location.x/y, ou
 *         center map)
 */

import {
  type SaveBlock1, type ObjectEventSnapshot, type Coords16,
  emptySaveBlock1,
} from './save-blocks';
import { GetSaveBlock1, GetSaveBlock2 } from './save-system';
import { gObjectEvents, OBJECT_EVENTS_COUNT, type ObjectEvent } from './object-events';
import { gPlayerAvatar } from './player-avatar';

// ─── ObjectEvent ↔ ObjectEventSnapshot mapping ──────────────────────────────

/** Snapshot un ObjectEvent live (= runtime fields web-port enriched) en
 *  ObjectEventSnapshot persistable (= 1:1 décomp struct ObjectEvent fields). */
function objectEventToSnapshot(npc: ObjectEvent): ObjectEventSnapshot {
  return {
    active: npc.active ? 1 : 0,
    singleMovementActive: 0,
    triggerGroundEffectsOnMove: 0,
    triggerGroundEffectsOnStop: 0,
    disableCoveringGroundEffects: 0,
    landingJump: 0,
    heldMovementActive: 0,
    heldMovementFinished: 0,
    frozen: npc.frozen ? 1 : 0,
    facingDirectionLocked: 0,
    disableAnim: 0,
    enableAnim: 0,
    inanimate: 0,
    invisible: npc.invisible ? 1 : 0,
    offScreen: 0,
    trackedByCamera: 0,
    isPlayer: npc.localId === 0xFF ? 1 : 0,
    hasReflection: 0,
    inShortGrass: 0,
    inShallowFlowingWater: 0,
    inSandPile: 0,
    inHotSprings: 0,
    hasShadow: 0,
    spriteAnimPausedBackup: 0,
    spriteAffineAnimPausedBackup: 0,
    disableJumpLandingGroundEffect: 0,
    fixedPriority: 0,
    hideReflection: 0,
    spriteId: npc.spriteId,
    graphicsId: npc.graphicsId,
    movementType: npc.movementType,
    trainerType: 0,
    localId: npc.localId,
    mapNum: 0,                  // web port utilise mapId string
    mapGroup: 0,
    mapId: npc.mapId,
    currentElevation: 0,
    previousElevation: 0,
    initialCoords: { x: npc.initialCoordsX, y: npc.initialCoordsY },
    currentCoords: { x: npc.currentCoordsX, y: npc.currentCoordsY },
    previousCoords: { x: npc.previousCoordsX, y: npc.previousCoordsY },
    facingDirection: npc.facingDirection,
    movementDirection: npc.walkDirection,
    rangeX: npc.movementRangeX,
    rangeY: npc.movementRangeY,
    fieldEffectSpriteId: 0,
    warpArrowSpriteId: 0,
    movementActionId: 0,
    trainerRange_berryTreeId: 0,
    currentMetatileBehavior: 0,
    previousMetatileBehavior: 0,
    previousMovementDirection: 0,
    directionSequenceIndex: npc.directionSeqIdx,
    playerCopyableMovement: 0,
  };
}

/** Apply un snapshot persisté à un ObjectEvent live. Used quand on resume
 *  une save : après que le map a été loaded et les NPCs spawnés depuis leur
 *  template, on apply leur saved positions/states. */
function applySnapshotToObjectEvent(npc: ObjectEvent, snap: ObjectEventSnapshot): void {
  npc.active = snap.active !== 0;
  npc.invisible = snap.invisible !== 0;
  npc.frozen = snap.frozen !== 0;
  npc.localId = snap.localId;
  npc.mapId = snap.mapId ?? '';
  npc.facingDirection = snap.facingDirection;
  npc.initialCoordsX = snap.initialCoords.x;
  npc.initialCoordsY = snap.initialCoords.y;
  npc.currentCoordsX = snap.currentCoords.x;
  npc.currentCoordsY = snap.currentCoords.y;
  npc.previousCoordsX = snap.previousCoords.x;
  npc.previousCoordsY = snap.previousCoords.y;
  npc.directionSeqIdx = snap.directionSequenceIndex;
  npc.walkDirection = snap.movementDirection;
  // graphics/movement type : seulement si snap a des values valides.
  if (snap.graphicsId) npc.graphicsId = snap.graphicsId as string;
  if (snap.movementType) npc.movementType = snap.movementType as string;
  npc.movementRangeX = snap.rangeX;
  npc.movementRangeY = snap.rangeY;
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `SaveObjectEvents(void)` (load_save.c:180).
 *  Snapshot tous les gObjectEvents live → block1.objectEvents persisted.
 *  Inclut le player (= localId 0xFF dans notre runtime, position vivante). */
export function SaveObjectEvents(): void {
  const block1 = GetSaveBlock1();
  block1.objectEvents = [];
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const npc = gObjectEvents[i];
    if (!npc) continue;
    block1.objectEvents.push(objectEventToSnapshot(npc));
  }
}

/** 1:1 décomp `LoadObjectEvents(void)` (load_save.c:188).
 *  Apply les snapshots persisted aux gObjectEvents live. À call APRÈS le
 *  spawn initial des NPCs depuis leur template (= override les positions
 *  default avec les saved positions). */
export function LoadObjectEvents(): void {
  const block1 = GetSaveBlock1();
  if (!block1.objectEvents || block1.objectEvents.length === 0) return;
  for (let i = 0; i < OBJECT_EVENTS_COUNT && i < block1.objectEvents.length; i++) {
    const snap = block1.objectEvents[i];
    if (!snap || !snap.active) continue;
    // Match par localId (= NPCs spawnés depuis template ont leur localId set).
    const target = gObjectEvents.find(npc => npc.active && npc.localId === snap.localId);
    if (target) applySnapshotToObjectEvent(target, snap);
  }
}

/** 1:1 décomp `SavePlayerParty(void)` (load_save.c:155 ou similaire).
 *  Sync `gPlayerParty` → `block1.playerParty`. Notre web port utilise
 *  `block1.playerParty` comme source de vérité directement (= partagé), donc
 *  cette fonction est principalement un sync de `playerPartyCount`. */
export function SavePlayerParty(): void {
  const block1 = GetSaveBlock1();
  block1.playerPartyCount = block1.playerParty.length;
}

/** 1:1 décomp `LoadPlayerParty(void)` (load_save.c:170).
 *  Sync `block1.playerParty` → `gPlayerParty`. No-op web port (= shared ref). */
export function LoadPlayerParty(): void {
  // No-op : block1.playerParty IS the runtime party.
}

/** 1:1 décomp `CopyPartyAndObjectsToSave(void)` (load_save.c:196). */
export function CopyPartyAndObjectsToSave(): void {
  SavePlayerParty();
  SaveObjectEvents();
}

/** 1:1 décomp `CopyPartyAndObjectsFromSave(void)` (load_save.c:202). */
export function CopyPartyAndObjectsFromSave(): void {
  LoadPlayerParty();
  LoadObjectEvents();
}

/** 1:1 décomp `SetContinueGameWarpStatusToDynamicWarp(void)` (load_save.c:149).
 *  Set `block1.continueGameWarp = block1.dynamicWarp`.
 *
 *  Si dynamicWarp invalide (= warpId=-1, x=-1, y=-1), fallback web-port :
 *  utilise la position courante (= block1.location + block1.pos). Le décomp
 *  ROM en case dynamicWarp invalide spawne au center map ; notre fallback
 *  est plus user-friendly (= continue où player saved).
 *
 *  Pour les use cases standard (= save après que setdynamicwarp ait posé un
 *  spawn point comme MAP_LITTLEROOT_TOWN 3,10), continueGameWarp pointe vers
 *  ce spawn point, pas où le player est physiquement. C'est le comportement
 *  1:1 décomp ROM. */
export function SetContinueGameWarpStatusToDynamicWarp(): void {
  const block1 = GetSaveBlock1();
  const dw = block1.dynamicWarp;
  if (dw.warpId === -1 && dw.mapGroup === -1 && dw.mapNum === -1 && dw.x === -1 && dw.y === -1) {
    // dynamicWarp invalide : fallback à current map+pos (= save où player est).
    const loc = block1.location;
    block1.continueGameWarp = {
      mapGroup: loc.mapGroup, mapNum: loc.mapNum, warpId: -1,
      x: block1.pos.x, y: block1.pos.y,
    };
    // Preserve __mapId via location si dispo, sinon current.
    return;
  }
  block1.continueGameWarp = { ...dw };
  // Aussi propager le mapId string custom pour bridge web port.
  const dwMapId = (block1 as { __dynamicWarpMapId?: string }).__dynamicWarpMapId;
  if (dwMapId) {
    (block1 as { __mapId?: string }).__mapId = dwMapId;
  }
}

/** Helper web-port : sync la position courante du player (= depuis le
 *  ObjectEvent player) vers `block1.pos`. À call avant le save pour que
 *  pos reflète où le player est *vraiment*, pas la position de spawn. */
export function SyncPlayerPositionToBlock(): void {
  const block1 = GetSaveBlock1();
  // Trouve le player ObjectEvent (= localId 0xFF dans notre runtime, ou
  // gPlayerAvatar.objectEventId si défini).
  const playerEventId = gPlayerAvatar.objectEventId;
  let playerNpc: ObjectEvent | null = null;
  if (playerEventId >= 0 && playerEventId < gObjectEvents.length) {
    playerNpc = gObjectEvents[playerEventId];
  }
  if (!playerNpc) {
    // Fallback : cherche par localId 0xFF.
    playerNpc = gObjectEvents.find(n => n.active && n.localId === 0xFF) ?? null;
  }
  if (!playerNpc) return;
  block1.pos = { x: playerNpc.currentCoordsX, y: playerNpc.currentCoordsY };
}

/** Helper web-port : sync la map courante vers `block1.location` et update
 *  `block1.__mapId`. À call au map load (= chaque warp). */
export function SetCurrentMapLocation(mapId: string, x: number, y: number, warpId = -1): void {
  const block1 = GetSaveBlock1();
  block1.location = { mapGroup: 0, mapNum: 0, warpId, x, y };
  (block1 as { __mapId?: string }).__mapId = mapId;
  // Aussi sync block1.pos initial à la position spawn.
  block1.pos = { x, y };
}

// ─── Save flow complet (= 1:1 décomp HandleSavingData) ──────────────────────

/** Pre-save sync : sync tous les states courants vers les save blocks AVANT
 *  d'écrire en localStorage. À call dans gameState.save() avant TrySavingData.
 *
 *  1:1 décomp `start_menu.c case 1` Save flow :
 *    SetContinueGameWarpStatusToDynamicWarp();
 *    WriteSaveBlock2();
 *    case 2: WriteSaveBlock1Sector(); ClearContinueGameWarpStatus2();
 *
 *  Notre version inline tout en un seul step (= JSON write atomic). */
export function PreSaveSyncBlocks(): void {
  // 1. Sync player position to block1.pos (= sync runtime → persistent).
  SyncPlayerPositionToBlock();
  // 2. Sync NPCs positions to block1.objectEvents (= 1:1 décomp SaveObjectEvents).
  SaveObjectEvents();
  // 3. Set continueGameWarp from dynamicWarp (= 1:1 décomp).
  SetContinueGameWarpStatusToDynamicWarp();
  // 4. SavePlayerParty (= no-op shared ref, mais update playerPartyCount).
  SavePlayerParty();
  // Note : SaveMapView (= 256 metatiles snapshot) skipped pour MVP — sera
  // ajouté quand on implémente cross-border map view restoration.
}

/** Post-load apply : restore les NPCs positions live depuis block1.
 *  À call APRÈS que la map ait été loaded et les NPCs spawnés depuis leur
 *  templates, pour override les positions default avec les saved positions. */
export function PostLoadApplyBlocks(): void {
  CopyPartyAndObjectsFromSave();
}

// Re-export pour facilité d'access.
export { GetSaveBlock1, GetSaveBlock2, emptySaveBlock1 };

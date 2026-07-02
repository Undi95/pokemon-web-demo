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
} from './engine/save/save-blocks';
import { GetSaveBlock1, GetSaveBlock2 } from './save';
import { RefreshPlayerPartyViews, gPlayerParty, createEmptyPokemon, PARTY_SIZE } from './engine/battle/party-storage';
import {
  gObjectEvents, OBJECT_EVENTS_COUNT, type ObjectEvent,
  SetObjectEventSpritePosToMapCoords,
} from './event_object_movement';
import { GetPlayerFacingDirection } from './field_player_avatar';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { GetCameraTopLeftCoords } from './field_camera';
import { SaveMapView, MAP_OFFSET } from './fieldmap';

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
  // FIX bug "pnj reset mais pas leur hitbox" : la collision lit currentCoords
  // (restauré ci-dessus) mais le sprite est driven par worldX/Y → ré-ancrer
  // le sprite à la pos restaurée (1:1 décomp SetSpritePosToMapCoords ; sinon
  // sprite au template ≠ hitbox à la pos sauvée). Doit être APRÈS currentCoords
  // + walkDirection (le helper coupe la marche résiduelle = NPC au repos).
  // Post R3 refactor : currentCoords INTERNAL → convertir LOGICAL pour la
  // signature de SetObjectEventSpritePosToMapCoords qui attend LOGICAL.
  SetObjectEventSpritePosToMapCoords(npc, npc.currentCoordsX - MAP_OFFSET, npc.currentCoordsY - MAP_OFFSET);
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
  // Audit session 126 fix : ne PAS appliquer les snaps qui ne sont pas de la
  // map courante. Sans ce check, après un warp Truck → MaysHouse_1F, les snaps
  // MOVING_BOX (= NPCs du Truck) qui ont localId 1,2,3 matchaient les NEW NPCs
  // MaysHouse (= Mom/Vigoroth/Vigoroth aussi localId 1,2,3) → applySnapshot
  // ÉCRASE les nouveaux NPCs avec MOVING_BOX → 1) zombies visuels, 2) bloque
  // le player car (2,3) devient un MOVING_BOX collidable.
  // Le décomp 1:1 n'a pas ce problème car les NPC indexes (= sObjectEvents[i])
  // sont stables intra-map ET les saves contiennent des snaps mapId-tagged.
  // Notre runtime spawn dynamiquement → match par localId seul est ambigu
  // entre maps. Ajout du check mapId.
  const currentMapId = (block1 as { __mapId?: string }).__mapId ?? '';
  for (let i = 0; i < OBJECT_EVENTS_COUNT && i < block1.objectEvents.length; i++) {
    const snap = block1.objectEvents[i];
    if (!snap || !snap.active) continue;
    // Skip les snaps d'une autre map (= NPCs persisted depuis une session/map
    // précédente). Si snap.mapId est vide (= ancien snap sans mapId), apply
    // par compat (= ancienne save format).
    if (snap.mapId && currentMapId && snap.mapId !== currentMapId) continue;
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

/** 1:1 décomp `LoadPlayerParty(void)` (load_save.c:170) : `gPlayerParty[i] = block1.playerParty[i]`.
 *  block1.playerParty (désérialisé du save = Pokemon NUMÉRIQUES plats, compact) → copié dans les
 *  slots gPlayerParty (la source de vérité), padding empty au-delà. Puis RefreshPlayerPartyViews
 *  re-pose block1.playerParty = refs aux slots. (Ex-conversion PokemonInstance retirée :
 *  calque de vues effondré 2026-07-02.) */
export function LoadPlayerParty(): void {
  const block1 = GetSaveBlock1();
  const saved = block1.playerParty;  // Pokemon[] (compact, du save)
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (i < saved.length && saved[i]) Object.assign(gPlayerParty[i], saved[i]);
    else Object.assign(gPlayerParty[i], createEmptyPokemon());
  }
  RefreshPlayerPartyViews();  // block1.playerParty ← refs numériques aux slots gPlayerParty
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

/** 1:1 décomp `ClearContinueGameWarpStatus(void)` (load_save.c:139) :
 *  `gSaveBlock2Ptr->specialSaveWarpFlags &= ~CONTINUE_GAME_WARP`. */
export function ClearContinueGameWarpStatus(): void {
  GetSaveBlock2().specialSaveWarpFlags &= ~0x4;
}

/** 1:1 décomp `SetContinueGameWarpStatus(void)` (load_save.c:144) :
 *  `gSaveBlock2Ptr->specialSaveWarpFlags |= CONTINUE_GAME_WARP`.
 *  Appelé par GameClear (post_battle_event_funcs.c) → au Continue, le boot
 *  doit warper vers `continueGameWarp` (chambre du joueur) au lieu de la
 *  position sauvée. */
export function SetContinueGameWarpStatus(): void {
  GetSaveBlock2().specialSaveWarpFlags |= 0x4;  // CONTINUE_GAME_WARP = 0x4
}

/** 1:1 décomp `SetContinueGameWarpStatusToDynamicWarp(void)` (load_save.c:149).
 *  Set `block1.continueGameWarp = block1.dynamicWarp` + flag CONTINUE_GAME_WARP.
 *
 *  ⚠️ **NE PAS APPELER au save normal** : analyse binaire d'un vrai .sav ROM
 *  Émeraude (= save in truck) montre que `specialSaveWarpFlags = 0` et
 *  `continueGameWarp = zeros`. Le décomp `start_menu.c` SET le flag puis le
 *  CLEAR via ClearContinueGameWarpStatus2 dans le même save flow (= timing
 *  async / write incremental over frames), résultat persisted = flag CLEAR.
 *
 *  Cette fn est gardée pour les cas spéciaux où on veut explicitly forcer
 *  un warp au Continue (= post-Battle Frontier, contest, link-trade exit). */
export function SetContinueGameWarpStatusToDynamicWarp(): void {
  const block1 = GetSaveBlock1();
  block1.continueGameWarp = { ...block1.dynamicWarp };
  // Aussi propager le mapId string custom pour bridge web port.
  const dwMapId = (block1 as { __dynamicWarpMapId?: string }).__dynamicWarpMapId;
  if (dwMapId) {
    (block1 as { __mapId?: string }).__mapId = dwMapId;
  }
  // Set CONTINUE_GAME_WARP bit dans specialSaveWarpFlags.
  const block2 = GetSaveBlock2();
  block2.specialSaveWarpFlags |= 0x4;  // CONTINUE_GAME_WARP = 0x4
}

/** 1:1 décomp `ClearContinueGameWarpStatus2(void)` (load_save.c:155). */
export function ClearContinueGameWarpStatus2(): void {
  const block2 = GetSaveBlock2();
  block2.specialSaveWarpFlags &= ~0x4;
}

/** 1:1 décomp `UseContinueGameWarp(void)` (load_save.c:134).
 *  Returns true si flag CONTINUE_GAME_WARP set dans specialSaveWarpFlags. */
export function UseContinueGameWarp(): boolean {
  return (GetSaveBlock2().specialSaveWarpFlags & 0x4) !== 0;
}

/** Helper web-port : sync la position courante du player vers `block1.pos`.
 *  À call avant le save pour que pos reflète où le player est *vraiment*.
 *
 *  ⚠️ Source de vérité : `gPlayerAvatar.x/y` est updated à chaque step
 *  player (= player-avatar.ts:706 dans CameraUpdate). C'est la position
 *  LOGIQUE du player. `_camPos` (field-camera.ts) peut diverger au-delà
 *  des bornes de la map (= small maps avec camera scroll), donc moins
 *  fiable comme source pour la save.
 *
 *  Préserve aussi le `__facing` pour spawn direction au resume. */
export function SyncPlayerPositionToBlock(): void {
  const block1 = GetSaveBlock1();
  // gPlayerAvatar est la source primaire (= updated à chaque step).
  // Si gPlayerAvatar non initialisé (= boot pre-1er-map-load), fallback
  // au _camPos (= field-camera).
  const gpaX = gSaveBlock1Ptr.pos.x;
  const gpaY = gSaveBlock1Ptr.pos.y;
  const cp = GetCameraTopLeftCoords();
  let x = gpaX;
  let y = gpaY;
  if (x === 0 && y === 0) {
    if (cp.x >= 0 && cp.y >= 0 && (cp.x !== 0 || cp.y !== 0)) {
      x = cp.x;
      y = cp.y;
    }
  }
  // Sanitize : reject negative values (= invalid map coord).
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  block1.pos = { x, y };
  (block1 as { __facing?: number }).__facing = GetPlayerFacingDirection();
  // Debug log : aide à diagnostiquer pourquoi pos est (0,0) au save.
  console.log(`[SyncPlayerPositionToBlock] gSaveBlock1Ptr.pos=(${gpaX},${gpaY}) camPos=(${cp.x},${cp.y}) → block1.pos=(${x},${y}) facing=${GetPlayerFacingDirection()}`);
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

// ─── ObjectEventTemplate coords (= 1:1 décomp `setobjectxyperm` opcode) ──────

/** 1:1 décomp `void SetObjEventTemplateCoords(u8 localId, s16 x, s16 y)`
 *  (overworld.c:490) :
 *    struct ObjectEventTemplate *savObjTemplates = gSaveBlock1Ptr->objectEventTemplates;
 *    for (i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++)
 *        if (savObjTemplates[i].localId == localId)
 *            { savObjTemplates[i].x = x; y = y; return; }
 *
 *  Web-port extension : ajoute un `mapId` field pour identifier le template
 *  cross-map (le décomp ROM reload `objectEventTemplates[]` depuis mapHeader
 *  à chaque map switch via `LoadObjectEvents` ; notre port persiste cross-
 *  map via le `mapId` field pour les mods `?nointro`). Si pas de template
 *  match, en ajoute un nouveau (= comportement non-1:1 mais nécessaire pour
 *  notre flow boot-mode preset).
 *
 *  Appelé par `setobjectxyperm` scrcmd.c:1093 + via boot-mode preset hack. */
export function SetObjEventTemplateCoords(mapId: string, localId: number | string, x: number, y: number): void {
  const block1 = GetSaveBlock1();
  const templates = block1.objectEventTemplates;
  const localIdNum = typeof localId === 'number' ? localId : 0; // string localId = web-port; numeric = décomp
  for (const t of templates) {
    const idMatch = typeof localId === 'string'
      ? (t as { localIdRaw?: string }).localIdRaw === localId
      : t.localId === localIdNum;
    if (idMatch && (!t.mapId || t.mapId === mapId)) {
      t.x = x;
      t.y = y;
      t.mapId = mapId;
      return;
    }
  }
  // No template found : append new (= web-port persistence helper).
  templates.push({
    localId: localIdNum,
    graphicsId: 0,
    kind: 0,
    x, y,
    elevation: 0,
    movementType: 0,
    movementRangeX: 0,
    movementRangeY: 0,
    trainerType: 0,
    trainerRange_berryTreeId: 0,
    script: '',
    flagId: 0,
    mapId,
    ...(typeof localId === 'string' ? { localIdRaw: localId } : {}),
  } as never);
}

/** Web-port helper : lookup coords override pour un (mapId, localId).
 *  Retourne undefined si pas d'override = template doit utiliser default
 *  mapHeader coords. */
export function GetObjEventTemplateCoords(mapId: string, localId: number | string): { x: number; y: number } | undefined {
  const block1 = GetSaveBlock1();
  for (const t of block1.objectEventTemplates) {
    if (t.mapId !== mapId) continue;
    const idMatch = typeof localId === 'string'
      ? (t as { localIdRaw?: string }).localIdRaw === localId
      : t.localId === localId;
    if (idMatch) return { x: t.x, y: t.y };
  }
  return undefined;
}

// ─── 1:1 STRICT décomp `LoadObjEventTemplatesFromHeader` (overworld.c:469-478) ──
/**
 *  void LoadObjEventTemplatesFromHeader(void)
 *  {
 *      // Clear map object templates
 *      CpuFill32(0, gSaveBlock1Ptr->objectEventTemplates,
 *                sizeof(gSaveBlock1Ptr->objectEventTemplates));
 *
 *      // Copy map header events to save block
 *      CpuCopy32(gMapHeader.events->objectEvents,
 *                gSaveBlock1Ptr->objectEventTemplates,
 *                gMapHeader.events->objectEventCount * sizeof(struct ObjectEventTemplate));
 *  }
 *
 *  Appelé par `LoadMapFromCameraTransition` (overworld.c:796) ET
 *  `LoadMapFromWarp` (overworld.c:840) — donc à CHAQUE map switch normal
 *  (cross-border ou warp). Le décomp WIPE le saveblock templates puis copy
 *  depuis mapHeader → les setobjectxyperm précédents SONT PERDUS au map
 *  switch. C'est intentionnel : OnTransition fire ensuite et re-applique
 *  les setobjectxyperm selon l'état actuel des vars.
 *
 *  Notre port avait l'inverse (= overlay persistent cross-map) → bug user
 *  2026-05-24 "MOM revient devant TV au sortir/rentrer maison". Fix 1:1
 *  strict : wipe saveblock au map switch.
 */
export function LoadObjEventTemplatesFromHeader(mapId: string, headerTemplates: ReadonlyArray<{ localId: number; localIdRaw?: string; graphicsId: number | string; graphicsIdRaw?: string; kind: number; x: number; y: number; elevation: number; movementType: number | string; movementTypeRaw?: string; movementRangeX: number; movementRangeY: number; trainerType: number; trainerRange_berryTreeId: number; script: string; flagId: number | string }>): void {
  const block1 = GetSaveBlock1();
  // 1:1 décomp CpuFill32 : clear all templates.
  // Notre port : remove tous les templates pour ce mapId (= cleanup overlay).
  // Note divergence : décomp wipe l'array global de 64 entries pour tous les
  // maps. Notre port garde un mapId field → wipe seulement les entries de ce
  // map. Comportementalement équivalent : au prochain spawn cette map, le
  // saveblock contient juste les templates fresh from mapHeader (no overlay).
  block1.objectEventTemplates = block1.objectEventTemplates.filter(
    (t: { mapId?: string }) => t.mapId !== mapId,
  );
  // 1:1 décomp CpuCopy32 : copy mapHeader events → saveblock.
  // A10 : copier aussi les fields *Raw (graphicsIdRaw, localIdRaw, movementTypeRaw)
  // pour que SpawnObjectEventsOnMap puisse iterer le saveblock direct
  // (= 1:1 décomp event_object_movement.c:1666 lit saveblock, pas mapHeader).
  for (const ht of headerTemplates) {
    block1.objectEventTemplates.push({
      localId: ht.localId,
      localIdRaw: ht.localIdRaw,
      graphicsId: ht.graphicsId,
      graphicsIdRaw: ht.graphicsIdRaw,
      kind: ht.kind,
      x: ht.x,
      y: ht.y,
      elevation: ht.elevation,
      movementType: ht.movementType,
      movementTypeRaw: ht.movementTypeRaw,
      movementRangeX: ht.movementRangeX,
      movementRangeY: ht.movementRangeY,
      trainerType: ht.trainerType,
      trainerRange_berryTreeId: ht.trainerRange_berryTreeId,
      script: ht.script,
      flagId: ht.flagId,
      mapId,
    } as never);
  }
}

// ─── Map courante helpers (= 1:1 décomp `gSaveBlock1Ptr->location` + `pos`) ──

/** 1:1 décomp accessor : composite `{ name, x, y, facing? }` depuis
 *  `gSaveBlock1Ptr->location` + `gSaveBlock1Ptr->pos` + `__mapId/__facing`
 *  overlay (= notre web port stocke le mapId string et facing en plus). */
export function GetCurrentMap(): { name: string; x: number; y: number; facing?: number } | undefined {
  const block1 = GetSaveBlock1();
  const loc = block1.location;
  const mapId = (block1 as { __mapId?: string }).__mapId;
  // location invalid sentinel : (-1, -1, -1, -1, -1) après emptySaveBlock1
  // OR (0, 0, 0, 0, 0) pré-WarpIntoMap.
  const isDummy = (loc.mapGroup === -1 && loc.mapNum === -1)
               || (loc.mapGroup === 0 && loc.mapNum === 0 && !mapId);
  if (isDummy || !mapId) return undefined;
  // 1:1 décomp : pos est la position courante du player (= updated par
  // CameraMove). Si pos invalide (= 0, 0 initial), fallback à location.x/y.
  const px = (block1.pos.x === 0 && block1.pos.y === 0 && loc.x >= 0) ? loc.x : block1.pos.x;
  const py = (block1.pos.x === 0 && block1.pos.y === 0 && loc.y >= 0) ? loc.y : block1.pos.y;
  return { name: mapId, x: px, y: py, facing: (block1 as { __facing?: number }).__facing };
}

/** 1:1 strict setter : update `gSaveBlock1Ptr->location` + `pos` + overlay
 *  `__mapId/__facing` selon le composite. v=undefined → clear (= sentinel). */
export function SetCurrentMap(v: { name: string; x: number; y: number; facing?: number } | undefined): void {
  const block1 = GetSaveBlock1();
  if (!v) {
    // Clear → reset location + pos to invalid sentinel.
    block1.location = { mapGroup: -1, mapNum: -1, warpId: -1, x: -1, y: -1 };
    block1.pos = { x: 0, y: 0 };
    delete (block1 as { __mapId?: string }).__mapId;
    delete (block1 as { __facing?: number }).__facing;
    return;
  }
  // 1:1 décomp `WarpIntoMap` flow : location = current map info (= warp dest),
  // pos = spawn coords (= depuis SetPlayerCoordsFromWarp).
  block1.location = { mapGroup: 0, mapNum: 0, warpId: -1, x: -1, y: -1 };
  block1.pos = { x: v.x, y: v.y };
  (block1 as { __mapId?: string }).__mapId = v.name;
  (block1 as { __facing?: number }).__facing = v.facing;
}

// ─── Save flow complet (= 1:1 décomp HandleSavingData) ──────────────────────
//
// `PreSaveSyncBlocks` + `PostLoadApplyBlocks` wrappers SUPPRIMÉS (= task #3
// élimination). Le décomp utilise directement `CopyPartyAndObjectsToSave/
// FromSave` + `SaveMapView` + `SyncPlayerPositionToBlock`. Les callers
// appellent maintenant ces helpers individuels 1:1 décomp directement :
//
//   - `save-system.ts:SaveGame()` → SyncPlayerPositionToBlock +
//     SaveMapView + CopyPartyAndObjectsToSave (= 1:1 HandleSavingData).
//   - `TestOverworldScene.ts` post-load → CopyPartyAndObjectsFromSave
//     (= 1:1 décomp call direct).

// Re-export pour facilité d'access.
export { GetSaveBlock1, GetSaveBlock2, emptySaveBlock1 };

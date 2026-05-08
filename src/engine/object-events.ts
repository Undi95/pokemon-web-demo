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
} from './map-loader';
import { GetCameraTopLeftCoords, gTotalCamera, gCamera, gFieldCamera, GetBgVofsBaseline } from './field-camera';
import { gPlayerAvatar } from './player-avatar';
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_TO_DX, DIR_TO_DY, OPPOSITE_DIR,
} from './direction-coords';
import { _registerGObjectEvents, _registerNpcHelpers, _registerUpdateObjectEventsForCameraUpdate } from './field-globals';

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
 *  Idempotent : si déjà cached, no-op rapide. */
export async function preloadNpcGraphicsForMap(mapHeader: MapHeader): Promise<void> {
  const templates = mapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) return;
  const catalog = await loadGraphicsCatalog();
  const paths = new Set<string>();
  for (const template of templates) {
    if (!template.graphicsIdRaw) continue;
    const graphics = catalog[template.graphicsIdRaw];
    if (!graphics) continue;
    if (graphics.frameWidth !== 16 || graphics.frameHeight !== 32) continue;
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
  active: boolean;
  invisible: boolean;
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
}

export const gObjectEvents: ObjectEvent[] = Array.from({ length: OBJECT_EVENTS_COUNT }, () => ({
  active: false,
  invisible: false,
  spriteId: -1,
  graphicsId: '',
  movementType: '',
  localId: 0,
  localIdRaw: '',
  mapId: '',
  scriptLabel: '',
  currentCoordsX: 0,
  currentCoordsY: 0,
  previousCoordsX: 0,
  previousCoordsY: 0,
  facingDirection: DIR_SOUTH,
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
  initialCoordsX: 0,
  initialCoordsY: 0,
  movementRangeX: 0,
  movementRangeY: 0,
  directionSeqIdx: 0,
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
  for (const npc of gObjectEvents) {
    npc.active = false;
    npc.spriteId = -1;
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

// ─── Sprite frame layout 1:1 player-avatar.ts ───────────────────────────────

const NPC_SPRITE_FRAMES: Record<number, { face: number; walk1: number; walk2: number; hFlip: boolean }> = {
  [DIR_SOUTH]: { face: 0, walk1: 3, walk2: 4, hFlip: false },
  [DIR_NORTH]: { face: 1, walk1: 5, walk2: 6, hFlip: false },
  [DIR_WEST]:  { face: 2, walk1: 7, walk2: 8, hFlip: false },
  [DIR_EAST]:  { face: 2, walk1: 7, walk2: 8, hFlip: true },
};

const TILES_PER_FRAME_16x32 = 8;

// ─── Movement type → initial facing direction ──────────────────────────────

function movementTypeToInitialFacing(movementType: string): number {
  if (movementType.includes('FACE_DOWN')) return DIR_SOUTH;
  if (movementType.includes('FACE_UP')) return DIR_NORTH;
  if (movementType.includes('FACE_LEFT')) return DIR_WEST;
  if (movementType.includes('FACE_RIGHT')) return DIR_EAST;
  return DIR_SOUTH;
}

// ─── Direction helpers depuis direction-coords (= source unique partagée) ──
// Avant : DIR_TO_DX/DY locaux dupliquaient la table 1:1 décomp `sDirectionToVectors`.
// Migrate vers direction-coords.ts pour cohérence avec player-avatar +
// script-opcodes.

function pickRandomDirection(allowed: ReadonlyArray<number> = gStandardDirections): number {
  return allowed[Math.floor(Math.random() * allowed.length)];
}

function pickRandomDelay(): number {
  return sMovementDelaysMedium[Math.floor(Math.random() * sMovementDelaysMedium.length)];
}

/** Check si target tile occupé par player.
 *  Considère AUSSI la player's destination cell quand player est MOVING (=
 *  évite que NPC walk vers la cell où player s'apprête à aller).
 *  gPlayerAvatar.x/y sont en ORIGINAL map coords (= no MAP_OFFSET). */
function isPlayerAt(x: number, y: number): boolean {
  if (gPlayerAvatar.x === x && gPlayerAvatar.y === y) return true;
  // Player MOVING : sa cible est gPlayerAvatar.x + DIR_TO_DX[stepDirection].
  if (gPlayerAvatar.runningState === 2 /* MOVING */ && gPlayerAvatar.stepFramesLeft > 0) {
    const sdx = DIR_TO_DX[gPlayerAvatar.stepDirection] ?? 0;
    const sdy = DIR_TO_DY[gPlayerAvatar.stepDirection] ?? 0;
    if (gPlayerAvatar.x + sdx === x && gPlayerAvatar.y + sdy === y) return true;
  }
  return false;
}

/** 1:1 décomp `DoesObjectCollideWithObjectAt` (event_object_movement.c:4724).
 *  Scan gObjectEvents, exclus self. Décomp check `currentCoords` ET
 *  `previousCoords` → couvre TARGET + SOURCE pendant un walk.
 *  Pas de check d'élévation pour MVP (= AreElevationsCompatible). */
function isOtherNpcAt(x: number, y: number, excluding: ObjectEvent): boolean {
  for (const other of gObjectEvents) {
    if (other === excluding) continue;
    if (!other.active || other.invisible) continue;
    if (other.currentCoordsX === x && other.currentCoordsY === y) return true;
    if (other.previousCoordsX === x && other.previousCoordsY === y) return true;
  }
  return false;
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
  const targetX = npc.currentCoordsX + dx;
  const targetY = npc.currentCoordsY + dy;
  // Phase 4.6 audit Opus §3.1 : check movement range AVANT collision (= 1:1
  // décomp `GetCollisionAtCoords` qui retourne COLLISION_OUTSIDE_RANGE en 1er).
  if (IsCoordOutsideObjectEventMovementRange(npc, targetX, targetY)) return false;
  const targetGBackupCol = targetX + MAP_OFFSET;
  const targetGBackupRow = targetY + MAP_OFFSET;
  if (MapGridGetCollisionAt(targetGBackupCol, targetGBackupRow) !== 0) return false;
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
// Phase 4.6 audit Opus §5 : back-compat globalThis + register field-globals.
(globalThis as Record<string, unknown>).__UnfreezeAllNpcs = UnfreezeAllNpcs;

// ─── Sprite frame update ────────────────────────────────────────────────────

/** Update OAM sprite frame selon NPC state (face vs walk anim).
 *  Exposé via globalThis __updateNpcSpriteFrame pour interact (= player-avatar
 *  call this après interact pour forcer face-toward-player visible immédiatement). */
function updateNpcSpriteFrame(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
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
      npc.movementStep = 1;
      // fallthrough
    case 1:
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
      npc.movementStep = 1;
      // fallthrough
    case 1:
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
      npc.movementStep = 1;
      // fallthrough
    case 1:
      // Face direction (instantaneous in our impl).
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

/** 1:1 décomp `MovementType_WalkBackAndForth_Step*` (3766-3822).
 *  NPC walk 1 metatile in initial dir, then back to initialCoords, repeat.
 *  Si collision (= bord ou wall), turn around et walk autre côté. */
function tickWalkBackAndForth(rt: DecompRuntime, npc: ObjectEvent, primaryDir: number): void {
  switch (npc.movementStep) {
    case 0:
      npc.movementStep = 1;
      // fallthrough
    case 1: {
      // Determine direction : primaryDir si seq=0, opposite si seq=1.
      const dir = npc.directionSeqIdx === 0 ? primaryDir : (OPPOSITE_DIR[primaryDir] ?? primaryDir);
      npc.facingDirection = dir;
      npc.movementStep = 2;
      // fallthrough
    }
    // eslint-disable-next-line no-fallthrough
    case 2: {
      // Check collision in walk direction.
      // 1:1 décomp : si returned to initialCoords avec seq=1, reset seq=0.
      if (npc.directionSeqIdx === 1
          && npc.currentCoordsX === npc.initialCoordsX
          && npc.currentCoordsY === npc.initialCoordsY) {
        npc.directionSeqIdx = 0;
        npc.facingDirection = primaryDir;
      }
      const dir = npc.facingDirection;
      if (canWalk(npc, dir)) {
        // 1:1 décomp `InitNpcForMovement` : shift current/previous au début.
        const dx = DIR_TO_DX[dir] ?? 0;
        const dy = DIR_TO_DY[dir] ?? 0;
        ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 3;
      } else {
        // Collision : flip seq + retry next tick.
        npc.directionSeqIdx = npc.directionSeqIdx === 0 ? 1 : 0;
        npc.movementStep = 1;
      }
      break;
    }
    case 3: {
      // Tick walk frames (= worldX/Y visual).
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
        // Si arrived 1 step from initialCoords, increment seq → backward.
        // Si returned to initialCoords, decrement seq → forward (case 2).
        if (npc.directionSeqIdx === 0
            && (npc.currentCoordsX !== npc.initialCoordsX || npc.currentCoordsY !== npc.initialCoordsY)) {
          npc.directionSeqIdx = 1;  // Now we go back.
        }
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
  // WALK_IN_PLACE_* = face static avec walk anim "in place" cycle.
  // MVP : juste static face, pas d'anim cycle (ajout futur si désiré).
  if (mt.startsWith('MOVEMENT_TYPE_WALK_IN_PLACE_')) {
    // Static face : facing direction déjà set au spawn par initialFacing.
    // Aucun tick nécessaire.
    return true;
  }
  // INVISIBLE : sprite hidden. Set npc.invisible.
  if (mt === 'MOVEMENT_TYPE_INVISIBLE') {
    npc.invisible = true;
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
  const graphicsKey = template.graphicsIdRaw;
  const graphics = catalog[graphicsKey];
  if (!graphics) return false;
  if (graphics.frameWidth !== 16 || graphics.frameHeight !== 32) return false;
  if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) return false;

  // 1:1 décomp `GetAvailableObjectEventId` (event_object_movement.c:1263) :
  // dedup par (localId, mapId). Notre loader set localId=0 pour templates
  // avec local_id JSON (= placeholder, pas encore résolu), donc unreliable.
  // Fallback : dedup via (mapId, initialCoordsX, initialCoordsY) uniques.
  const existing = gObjectEvents.findIndex(
    o => o.active
      && o.mapId === currentMapId
      && o.initialCoordsX === template.x
      && o.initialCoordsY === template.y,
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

  const numFrames = (png.widthTiles * png.heightTiles) / TILES_PER_FRAME_16x32;
  const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);
  rt.gba.objVram.set(reordered, objTileBase * 32);
  const paletteSlot = 256 + paletteBank * 16;
  for (let i = 0; i < Math.min(16, png.palette.length); i++) {
    rt.gPlttBufferFaded.set(paletteSlot + i, png.palette[i]);
    rt.gPlttBufferUnfaded.set(paletteSlot + i, png.palette[i]);
  }
  rt.gPlttBufferFaded.flushTo();

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
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1309) :
  // currentCoords = previousCoords = template position au spawn.
  npc.currentCoordsX = template.x;
  npc.currentCoordsY = template.y;
  npc.previousCoordsX = template.x;
  npc.previousCoordsY = template.y;
  npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
  npc.objTileBase = objTileBase;
  npc.paletteBank = paletteBank;
  const npcGBackupCol = template.x + MAP_OFFSET;
  const npcGBackupRow = template.y + MAP_OFFSET;
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
  npc.initialCoordsX = template.x;
  npc.initialCoordsY = template.y;
  npc.movementRangeX = template.movementRangeX;
  npc.movementRangeY = template.movementRangeY;
  // 1:1 décomp event_object_movement.c:1323-1328 — force range = 1 si 0 et
  // movementType ∈ sMovementTypeHasRange.
  if (movementTypeHasRange(npc.movementType)) {
    if (npc.movementRangeX === 0) npc.movementRangeX = 1;
    if (npc.movementRangeY === 0) npc.movementRangeY = 1;
  }
  npc.directionSeqIdx = 0;

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

  console.log(`[object-events] spawn slot=${slot} ${graphicsKey} mt=${npc.movementType} at (${npc.currentCoordsX}, ${npc.currentCoordsY})`);
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

  // PARALLEL preload (= élimine sequential await + matches décomp instant
  // spawn). Templates qui referencent une PNG manquante après preload sont
  // loggées (= via _spawnSingleNpcFromTemplate which checks cache).
  await preloadNpcGraphicsForMap(gMapHeader);

  // SYNC iteration spawn.
  for (const template of templates) {
    _spawnSingleNpcFromTemplate(template, currentMapId, rt, catalog);
  }
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

    const npcGBackupCol = npc.currentCoordsX + MAP_OFFSET;
    const npcGBackupRow = npc.currentCoordsY + MAP_OFFSET;
    const viewCol = npcGBackupCol - cam.x;
    const viewRow = npcGBackupRow - cam.y;
    if (viewCol < -2 || viewCol > 17 || viewRow < -2 || viewRow > 13) {
      sprite.invisible = true;
      continue;
    }
    sprite.invisible = false;

    // 1:1 décomp : sprite.x_NPC stays at spawn-time computed value + walk
    // increments via tick state machine. Per-frame coordOffsetEnabled adds
    // pixelOffsetX. Net effect : NPCs slide with BG as player walks.
    sprite.x = npc.worldX + offX;
    sprite.y = npc.worldY + offY - bgVofsBaseline;

    // Update sprite frame chaque frame (= keeps tile + flipH en sync avec
    // facingDirection, important pour interact qui change facing instantané).
    updateNpcSpriteFrame(rt, npc);
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
  const left = cam.x - 9;
  const right = cam.x + 10;
  const top = cam.y - 7;
  const bottom = cam.y + 9;

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

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
import {
  type ObjectEventTemplate,
  MAP_OFFSET,
  gMapHeader,
  MapGridGetCollisionAt,
} from './map-loader';
import { GetCameraTopLeftCoords, gTotalCamera } from './field-camera';
import { DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST, gPlayerAvatar } from './player-avatar';

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

// ─── Object Event struct ────────────────────────────────────────────────────

export interface ObjectEvent {
  active: boolean;
  invisible: boolean;
  spriteId: number;
  graphicsId: string;
  movementType: string;
  localId: number;
  currentCoordsX: number;
  currentCoordsY: number;
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
}

export const gObjectEvents: ObjectEvent[] = Array.from({ length: OBJECT_EVENTS_COUNT }, () => ({
  active: false,
  invisible: false,
  spriteId: -1,
  graphicsId: '',
  movementType: '',
  localId: 0,
  currentCoordsX: 0,
  currentCoordsY: 0,
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
}));

// Expose pour collision check player (= évite circular import).
(globalThis as Record<string, unknown>).__gObjectEvents = gObjectEvents;

// ─── OBJ tile/palette allocation ────────────────────────────────────────────

const NPC_TILE_BASE_START = 72;
const TILES_PER_NPC = 72;
let _nextNpcTileBase = NPC_TILE_BASE_START;
const NPC_PALETTE_START = 1;
let _nextNpcPaletteBank = NPC_PALETTE_START;

export function resetObjectEventAllocations(): void {
  _nextNpcTileBase = NPC_TILE_BASE_START;
  _nextNpcPaletteBank = NPC_PALETTE_START;
  for (const npc of gObjectEvents) {
    npc.active = false;
    npc.spriteId = -1;
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

// ─── Direction helpers ──────────────────────────────────────────────────────

const DIR_TO_DX: Record<number, number> = {
  [DIR_SOUTH]: 0, [DIR_NORTH]: 0, [DIR_WEST]: -1, [DIR_EAST]: 1,
};
const DIR_TO_DY: Record<number, number> = {
  [DIR_SOUTH]: 1, [DIR_NORTH]: -1, [DIR_WEST]: 0, [DIR_EAST]: 0,
};

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

/** Check si NPC peut walker en `direction` depuis sa position courante.
 *  1:1 décomp `GetCollisionInDirection` : map collision + player collision +
 *  NPC-NPC collision (4.4.f, simplifié pour MVP : skip).
 *
 *  Considère la TARGET cell du player MOVING, pour éviter step-on race :
 *  si NPC démarre walk vers cell C ET player démarre walk vers cell C en
 *  même temps, le NPC voit player.target = C → bloqué. Fix bug 4.4.d. */
function canWalk(npc: ObjectEvent, direction: number): boolean {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  const targetX = npc.currentCoordsX + dx;
  const targetY = npc.currentCoordsY + dy;
  const targetGBackupCol = targetX + MAP_OFFSET;
  const targetGBackupRow = targetY + MAP_OFFSET;
  if (MapGridGetCollisionAt(targetGBackupCol, targetGBackupRow) !== 0) return false;
  if (isPlayerAt(targetX, targetY)) return false;
  return true;
}

/** Un-freeze tous les NPCs (= appelé quand player commence à walker, =
 *  exit interaction). 1:1 décomp pattern : ScriptUnlockAll fait équivalent. */
export function UnfreezeAllNpcs(): void {
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = false;
  }
}
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
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 6;
      }
      break;
    }
    case 6: {
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        npc.currentCoordsX += speedX;
        npc.currentCoordsY += speedY;
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
 *  Ajout 4.4.c.2 : multi-direction look + multi-direction wander. */
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

/** Tick chaque NPC selon son movementType. À call chaque frame. */
export function TickObjectEventMovements(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    // Frozen NPCs (= en interact) skip leur state machine. Reste à
    // facingDirection courante. Un-freeze quand player walk.
    if (npc.frozen) continue;

    const handler = MOVEMENT_HANDLERS[npc.movementType];
    if (handler) {
      if (handler.tick === 'look') {
        tickLookAround(rt, npc, handler.dirs);
      } else {
        tickWanderAround(rt, npc, handler.dirs);
      }
    }
  }
}

// ─── Spawn ──────────────────────────────────────────────────────────────────

export async function SpawnObjectEventsOnMap(rt: DecompRuntime): Promise<void> {
  if (!gMapHeader) throw new Error('SpawnObjectEventsOnMap: gMapHeader is null');
  const templates = gMapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) {
    console.log('[object-events] no NPCs in this map');
    return;
  }

  const catalog = await loadGraphicsCatalog();

  for (const template of templates) {
    if (!template.graphicsIdRaw) continue;
    const graphicsKey = template.graphicsIdRaw;
    const graphics = catalog[graphicsKey];
    if (!graphics) {
      if (!graphicsKey.startsWith('OBJ_EVENT_GFX_VAR_')) {
        console.warn(`[object-events] no graphics for ${graphicsKey}, skipping`);
      }
      continue;
    }
    if (graphics.frameWidth !== 16 || graphics.frameHeight !== 32) {
      console.warn(`[object-events] ${graphicsKey} non-standard ${graphics.frameWidth}×${graphics.frameHeight}, skipping`);
      continue;
    }
    if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) {
      console.warn(`[object-events] ${graphicsKey} multi-frame composite, skipping`);
      continue;
    }

    const slot = gObjectEvents.findIndex(o => !o.active);
    if (slot < 0) continue;
    if (_nextNpcTileBase + TILES_PER_NPC > 1024) continue;
    if (_nextNpcPaletteBank >= 16) continue;

    const png = await loadIndexedPngStrict(`${BASE}/${graphics.png}`, 4);
    const numFrames = (png.widthTiles * png.heightTiles) / TILES_PER_FRAME_16x32;
    const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);

    const objTileBase = _nextNpcTileBase;
    rt.gba.objVram.set(reordered, objTileBase * 32);
    _nextNpcTileBase += TILES_PER_NPC;

    const paletteBank = _nextNpcPaletteBank++;
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
    npc.currentCoordsX = template.x;
    npc.currentCoordsY = template.y;
    npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
    npc.objTileBase = objTileBase;
    npc.paletteBank = paletteBank;
    const npcGBackupCol = template.x + MAP_OFFSET;
    const npcGBackupRow = template.y + MAP_OFFSET;
    npc.worldX = (npcGBackupCol - cam.x) * 16 + 8;
    npc.worldY = (npcGBackupRow - cam.y) * 16;
    npc.movementStep = 0;
    npc.movementDelay = 0;
    npc.walkFramesLeft = 0;
    npc.walkDirection = DIR_NONE;
    npc.walkAnimAlt = 0;

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
  }
}

// ─── Update sprite positions + frame each frame ────────────────────────────

/** Update sprite.x/y selon worldX/Y + camera scroll, ET sprite frame selon
 *  facingDirection courante. Appelé chaque frame depuis MainCB2_Overworld
 *  APRÈS TickObjectEventMovements. */
export function UpdateObjectEvents(rt: DecompRuntime): void {
  const cam = GetCameraTopLeftCoords();
  const offX = gTotalCamera.pixelOffsetX;
  const offY = gTotalCamera.pixelOffsetY;

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

    sprite.x = npc.worldX + offX;
    sprite.y = npc.worldY + offY;

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

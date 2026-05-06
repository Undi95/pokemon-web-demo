/**
 * object-events.ts — NPCs / object events overworld 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (= TrySpawnObjectEvents, MovementType_LookAround_*, MovementType_WanderAround_*)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h`
 *     (= struct ObjectEvent)
 *   - `/decomp/em/object-event-graphics.json` (= mapping OBJ_EVENT_GFX_* → png path)
 *
 * Phase 4.4.a — MVP statique (DONE) :
 *   - gObjectEvents[16] array (= 1:1 décomp OBJECT_EVENTS_COUNT)
 *   - SpawnObjectEventsOnMap : load graphics/palette, create OAM sprite
 *   - UpdateObjectEvents : sprite.x = worldX + gTotalCamera.pixelOffsetX (smooth scroll)
 *
 * Phase 4.4.b — Face direction initial (DONE) :
 *   - movementTypeToInitialFacing → set facing au spawn
 *
 * Phase 4.4.c — LOOK_AROUND / WANDER (THIS) :
 *   - Per-NPC state machine 1:1 décomp (Step0..Step6)
 *   - LookAround : 5 états, change face direction every 32-128 frames random
 *   - WanderAround : 7 états, idem + walk 1 metatile if no collision
 *   - Walk anim cycle (face → walk_a → face → walk_b) 1:1 player avatar
 *   - TickObjectEventMovements appelé chaque frame depuis MainCB2_Overworld
 *
 * Phases suivantes :
 *   - 4.4.d : Player ↔ NPC collision (= block player movement onto NPC)
 *   - 4.4.e : A button → trigger script
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
import { DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './player-avatar';

const BASE = '/decomp/em';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** 1:1 décomp `OBJECT_EVENTS_COUNT` (event_object_movement.h:7).
 *  16 NPCs max simultanés à l'écran. */
export const OBJECT_EVENTS_COUNT = 16;

/** 1:1 décomp `sMovementDelaysMedium` (event_object_movement.c:709).
 *  Delay frames entre direction changes pour LOOK_AROUND / WANDER. */
const sMovementDelaysMedium = [32, 64, 96, 128];

/** 1:1 décomp `gStandardDirections` (event_object_movement.c).
 *  4 directions cardinales pour Random() & 3 lookup. */
const gStandardDirections = [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST];

// ─── Object event graphics catalog (= cached after first load) ───────────────

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

// ─── Object Event struct (= simplifié 1:1 décomp ObjectEvent) ───────────────

/** 1:1 décomp `struct ObjectEvent` (global.fieldmap.h:194-255). Phase 4.4
 *  expose les champs minimaux pour movement state machine. */
export interface ObjectEvent {
  active: boolean;
  invisible: boolean;
  /** OAM sprite id (= rt.gSprites key). -1 if no sprite. */
  spriteId: number;
  graphicsId: string;
  movementType: string;
  localId: number;
  /** Position en ORIGINAL map coords (= no MAP_OFFSET). Mis à jour à la fin
   *  de chaque step walk dans WANDER. */
  currentCoordsX: number;
  currentCoordsY: number;
  facingDirection: number;
  /** OBJ tile slot (8 tiles per frame, 9 frames per NPC = 72 tiles each). */
  objTileBase: number;
  /** Palette bank dans gPlttBufferFaded OBJ section. */
  paletteBank: number;
  /** World position en pixels (= sprite center). Update sprite.x = worldX +
   *  gTotalCamera.pixelOffsetX (= 1:1 décomp gSpriteCoordOffsetX pattern). */
  worldX: number;
  worldY: number;

  // ─── State machine 1:1 décomp `MovementType_*` (Phase 4.4.c) ─────────────
  /** Current step ID dans la state machine (= 1:1 décomp `sprite->sTypeFuncId`).
   *  0 = init. Cycle 1..N selon movement type. */
  movementStep: number;
  /** Frames remaining dans le delay courant (= 1:1 décomp `SetMovementDelay`).
   *  Counted down chaque frame. 0 = delay expiré. */
  movementDelay: number;
  /** Pour WANDER : frames remaining dans le walk step (16..0). */
  walkFramesLeft: number;
  /** Direction du walk en cours (DIR_NONE si pas de walk actif). */
  walkDirection: number;
  /** Walk anim alternation : 0 = walk_a, 1 = walk_b (cycle alterné par step). */
  walkAnimAlt: 0 | 1;
}

/** 1:1 décomp `EWRAM_DATA struct ObjectEvent gObjectEvents[OBJECT_EVENTS_COUNT]`
 *  (event_object_movement.c:166). Allocated global state. */
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
}));

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

// ─── Sprite frame layout 1:1 player-avatar.ts SPRITE_FRAMES ─────────────────

/** 9 frames per NPC PNG (= identique au player walking.png 144×32) :
 *    0=face_S, 1=face_N, 2=face_W (= flip pour east),
 *    3=walk_S_a, 4=walk_S_b, 5=walk_N_a, 6=walk_N_b, 7=walk_W_a, 8=walk_W_b. */
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

/** 1:1 décomp `Random() % 4` : pick random direction. */
function pickRandomDirection(): number {
  return gStandardDirections[Math.floor(Math.random() * 4)];
}

/** 1:1 décomp `sMovementDelaysMedium[Random() % 4]`. */
function pickRandomDelay(): number {
  return sMovementDelaysMedium[Math.floor(Math.random() * sMovementDelaysMedium.length)];
}

/** Check si NPC peut walker en `direction` depuis sa position courante.
 *  1:1 décomp `GetCollisionInDirection` (= just MapGridGetCollisionAt for now,
 *  Phase 4.4.d ajoutera NPC-NPC collision). */
function canWalk(npc: ObjectEvent, direction: number): boolean {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  const targetGBackupCol = npc.currentCoordsX + MAP_OFFSET + dx;
  const targetGBackupRow = npc.currentCoordsY + MAP_OFFSET + dy;
  // MapGridGetCollisionAt > 0 = blocked (= wall, ledge, etc).
  return MapGridGetCollisionAt(targetGBackupCol, targetGBackupRow) === 0;
}

// ─── Sprite frame update ────────────────────────────────────────────────────

/** Update OAM sprite frame selon NPC state (face vs walk anim). */
function updateNpcSpriteFrame(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites.get(npc.spriteId);
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[DIR_SOUTH];

  let frameIdx: number;
  if (npc.walkFramesLeft > 0) {
    // Walk anim 1:1 player avatar : walk_a → face → walk_b → face per step.
    // 16 frames per metatile : walk (8 frames) → face (8 frames).
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

// ─── Movement state machines 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `MovementType_LookAround_Step*` (event_object_movement.c:2846-2893).
 *  5 états :
 *   0 → init (= clear movement state, → 1)
 *   1 → set face anim (= face current direction, → 2)
 *   2 → wait face anim done, set delay 32-128 random (→ 3)
 *   3 → wait delay (→ 4)
 *   4 → pick random direction, → 1
 *
 *  Notre impl : Step 1+2 collapsed (= face anim instant). */
function tickLookAround(rt: DecompRuntime, npc: ObjectEvent): void {
  switch (npc.movementStep) {
    case 0:
      // Init : start the cycle.
      npc.movementStep = 1;
      // fallthrough
    case 1:
      // Set face anim → face direction (instant). Pick delay.
      updateNpcSpriteFrame(rt, npc);
      npc.movementDelay = pickRandomDelay();
      npc.movementStep = 3;
      break;
    case 3:
      // Wait delay.
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 4;
      }
      break;
    case 4:
      // Pick random direction. → step 1.
      npc.facingDirection = pickRandomDirection();
      npc.movementStep = 1;
      break;
  }
}

/** 1:1 décomp `MovementType_WanderAround_Step*` (event_object_movement.c:2566-2630).
 *  7 états :
 *   0 → init
 *   1 → set face anim
 *   2 → wait face anim done, set delay
 *   3 → wait delay
 *   4 → pick random direction. If collision → step 1 else step 5
 *   5 → set walk anim (= start walk, single movement active)
 *   6 → wait walk anim done (= 16 frames). update currentCoords. → step 1.
 */
function tickWanderAround(rt: DecompRuntime, npc: ObjectEvent): void {
  switch (npc.movementStep) {
    case 0:
      npc.movementStep = 1;
      // fallthrough
    case 1:
      updateNpcSpriteFrame(rt, npc);
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
      const dir = pickRandomDirection();
      npc.facingDirection = dir;
      if (!canWalk(npc, dir)) {
        // Collision : just face that direction, restart cycle.
        npc.movementStep = 1;
      } else {
        // Start walking 1 metatile in `dir`.
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 6;
      }
      updateNpcSpriteFrame(rt, npc);
      break;
    }
    case 6: {
      // Walk in progress : tick frames + advance worldX/Y.
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        // Step done. Update currentCoords (= one metatile in walkDirection).
        npc.currentCoordsX += speedX;
        npc.currentCoordsY += speedY;
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.movementStep = 1;
      }
      updateNpcSpriteFrame(rt, npc);
      break;
    }
  }
}

/** Tick chaque NPC selon son movementType. À call chaque frame depuis
 *  MainCB2_Overworld. */
export function TickObjectEventMovements(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;

    if (npc.movementType.includes('LOOK_AROUND')) {
      tickLookAround(rt, npc);
    } else if (npc.movementType.includes('WANDER_AROUND')) {
      tickWanderAround(rt, npc);
    }
    // FACE_* movement types = static (no tick).
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
      console.warn(`[object-events] ${graphicsKey} non-standard ${graphics.frameWidth}×${graphics.frameHeight}, skipping in 4.4.a`);
      continue;
    }
    if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) {
      console.warn(`[object-events] ${graphicsKey} multi-frame composite, skipping in 4.4.a`);
      continue;
    }

    const slot = gObjectEvents.findIndex(o => !o.active);
    if (slot < 0) {
      console.warn(`[object-events] no free gObjectEvents slot, skipping`);
      continue;
    }
    if (_nextNpcTileBase + TILES_PER_NPC > 1024) {
      console.warn(`[object-events] OBJ VRAM full, skipping ${graphicsKey}`);
      continue;
    }
    if (_nextNpcPaletteBank >= 16) {
      console.warn(`[object-events] OBJ palette banks exhausted, skipping ${graphicsKey}`);
      continue;
    }

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

// ─── Update sprite positions each frame ─────────────────────────────────────

export function UpdateObjectEvents(rt: DecompRuntime): void {
  const cam = GetCameraTopLeftCoords();
  const offX = gTotalCamera.pixelOffsetX;
  const offY = gTotalCamera.pixelOffsetY;

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (!sprite) continue;

    // Cull si très loin de la view.
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

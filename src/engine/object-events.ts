/**
 * object-events.ts — NPCs / object events overworld 1:1 décomp.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (= TrySpawnObjectEvents, TrySpawnObjectEventTemplate, etc.)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h`
 *     (= struct ObjectEvent)
 *   - `/decomp/em/object-event-graphics.json` (= mapping OBJ_EVENT_GFX_* → png path)
 *
 * Phase 4.4.a — MVP statique :
 *   - gObjectEvents[16] array (= 1:1 décomp OBJECT_EVENTS_COUNT)
 *   - SpawnObjectEventsOnMap : iterate gMapHeader.events.objectEvents,
 *     load graphics/palette, create OAM sprite at NPC's map position.
 *   - Update sprites each frame : reposition selon camera scroll
 *     (= UpdateObjectEvents called from MainCB2_Overworld).
 *   - Pas de movement, pas d'anim (= juste face direction par défaut SOUTH).
 *
 * Phases suivantes :
 *   - 4.4.b : MOVEMENT_TYPE_FACE_* (face direction explicite)
 *   - 4.4.c : MOVEMENT_TYPE_LOOK_AROUND / WANDER
 *   - 4.4.d : Player ↔ NPC collision
 *   - 4.4.e : A button → trigger script
 */
import type { DecompRuntime } from './decomp-runtime';
import { loadIndexedPngStrict } from './gba/png-loader';
import {
  type ObjectEventTemplate,
  MAP_OFFSET,
  gMapHeader,
} from './map-loader';
import { GetCameraTopLeftCoords, GetCameraOffsetState } from './field-camera';
import { DIR_SOUTH } from './player-avatar';

const BASE = '/decomp/em';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** 1:1 décomp `OBJECT_EVENTS_COUNT` (event_object_movement.h:7).
 *  16 NPCs max simultanés à l'écran. */
export const OBJECT_EVENTS_COUNT = 16;

// ─── Object event graphics catalog (= cached after first load) ───────────────

interface GraphicsInfo {
  png: string;          // path relative to BASE
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

/** 1:1 décomp `struct ObjectEvent` (global.fieldmap.h:194-255). Phase 4.4.a
 *  expose les champs minimaux pour spawn statique + position update. */
export interface ObjectEvent {
  /** Slot used. 0 = empty, 1 = active. */
  active: boolean;
  /** Sprite hidden (= obstacle invisible, e.g. trainer waiting offscreen). */
  invisible: boolean;
  /** OAM sprite id (= rt.gSprites key). -1 if no sprite. */
  spriteId: number;
  /** OBJ_EVENT_GFX_* string (raw, pas encore mappé en u8 via constants). */
  graphicsId: string;
  /** MOVEMENT_TYPE_* string. */
  movementType: string;
  /** Local id (= unique per-map identifier from ObjectEventTemplate). */
  localId: number;
  /** Current position en ORIGINAL map coords (= no MAP_OFFSET). */
  currentCoordsX: number;
  currentCoordsY: number;
  /** Direction the sprite is facing (DIR_*). */
  facingDirection: number;
  /** Sprite frame en cours (0=face_S, 1=face_N, 2=face_W, 2+hFlip=face_E). */
  frameIdx: number;
  /** OBJ tile slot (8 tiles per frame, 9 frames per NPC = 72 tiles each). */
  objTileBase: number;
  /** Palette bank dans gPlttBufferFaded OBJ section. */
  paletteBank: number;
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
  frameIdx: 0,
  objTileBase: 0,
  paletteBank: 0,
}));

// ─── OBJ tile/palette allocation ────────────────────────────────────────────

/** Player avatar uses tiles 0..71 + palette bank 0. NPCs allocate from
 *  tile 72 onwards. Each NPC takes 72 tiles (= 9 frames × 8 tiles 16×32 4bpp).
 *  Total OBJ VRAM = 32 KB = 1024 tiles → 1024-72=952 tiles for NPCs → 13 NPCs.
 *
 *  Phase 4.4.a : alloue séquentiellement, pas de cache palette tag (= un NPC
 *  identique 2× duplique les tiles+palette). Phase 4.4.c+ pourra dédupliquer
 *  via paletteTag + tileTag (= 1:1 décomp `struct ObjectEventGraphicsInfo`). */
const NPC_TILE_BASE_START = 72;
const TILES_PER_NPC = 72;
let _nextNpcTileBase = NPC_TILE_BASE_START;

/** OBJ palette banks. Player uses bank 0 → NPCs depuis bank 1. */
const NPC_PALETTE_START = 1;
let _nextNpcPaletteBank = NPC_PALETTE_START;

/** Reset allocation state. Appelé au map switch (Phase 4.6 warp). */
export function resetObjectEventAllocations(): void {
  _nextNpcTileBase = NPC_TILE_BASE_START;
  _nextNpcPaletteBank = NPC_PALETTE_START;
  for (const npc of gObjectEvents) {
    npc.active = false;
    npc.spriteId = -1;
  }
}

// ─── PNG → OBJ 1D layout helper (= partagé avec player-avatar.ts) ───────────

/** Reorganise PNG charData (= row-major par tile sur 18×4 grid) en OBJ 1D
 *  layout (= 8 tiles sequential par sprite frame). Réutilisé pour les NPCs
 *  ayant le même layout 144×32 PNG = 9 frames 16×32. */
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

// ─── Sprite frame layout (= 1:1 décomp object_event_anims.h, partagé avec player) ──

/** Sprite frame indices dans le PNG 144×32 (= 9 frames). Identique au player.
 *  cf. player-avatar.ts SPRITE_FRAMES. */
const NPC_SPRITE_FRAMES: Record<number, { face: number; hFlip: boolean }> = {
  1 /* DIR_SOUTH */: { face: 0, hFlip: false },
  2 /* DIR_NORTH */: { face: 1, hFlip: false },
  3 /* DIR_WEST  */: { face: 2, hFlip: false },
  4 /* DIR_EAST  */: { face: 2, hFlip: true },
};

const TILES_PER_FRAME_16x32 = 8;  // = 2 × 4 tiles (16×32 / 8×8)
const PNG_W_TILES_144x32 = 18;     // = 144 / 8

// ─── Movement type → initial facing direction ──────────────────────────────

/** Décode `MOVEMENT_TYPE_FACE_DOWN` etc. en initial facing direction.
 *  Phase 4.4.a : lookup-only. Phase 4.4.b implémentera le movement actif. */
function movementTypeToInitialFacing(movementType: string): number {
  if (movementType.includes('FACE_DOWN')) return 1; // DIR_SOUTH
  if (movementType.includes('FACE_UP')) return 2;   // DIR_NORTH
  if (movementType.includes('FACE_LEFT')) return 3; // DIR_WEST
  if (movementType.includes('FACE_RIGHT')) return 4; // DIR_EAST
  return 1; // default = south
}

// ─── Spawn ──────────────────────────────────────────────────────────────────

/** 1:1 décomp `TrySpawnObjectEvents` (event_object_movement.c:1645). Phase
 *  4.4.a : iterate ALL templates (= pas de view-range filter pour simplifier ;
 *  4.4 plus tard ajoutera RemoveObjectEventsOutsideView).
 *
 *  Pour chaque template : load graphics PNG, write to OBJ VRAM, load palette,
 *  create OAM sprite. Stocke dans gObjectEvents[next free slot]. */
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
      // VAR_0..F sont des graphics_id résolus runtime via VirtualObject system
      // (= cf. décomp event_object_movement.c GetVarObjectGraphicsId). Phase 4.4.a
      // skip silencieusement (4.4.c+ implémentera).
      if (!graphicsKey.startsWith('OBJ_EVENT_GFX_VAR_')) {
        console.warn(`[object-events] no graphics for ${graphicsKey}, skipping`);
      }
      continue;
    }
    if (graphics.frameWidth !== 16 || graphics.frameHeight !== 32) {
      // Phase 4.4.a : on supporte uniquement 16×32 (= la grande majorité des
      // NPCs people). 16×16 (= ninja_boy, pokemons), 32×32 (= bikes, surfing),
      // 48×48 (= truck) viendront plus tard.
      console.warn(`[object-events] ${graphicsKey} has frame ${graphics.frameWidth}×${graphics.frameHeight} display ${graphics.displayWidth}×${graphics.displayHeight}, only standard 16×32 supported in 4.4.a — skipping`);
      continue;
    }
    // Vérif additionnelle : si le display ne match pas le frame (= TRUCK qui
    // a frame 16×32 mais display 48×48), c'est un sprite multi-frame spécial.
    // Skip pour 4.4.a.
    if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) {
      console.warn(`[object-events] ${graphicsKey} multi-frame composite (display ${graphics.displayWidth}×${graphics.displayHeight} != frame ${graphics.frameWidth}×${graphics.frameHeight}), skipping in 4.4.a`);
      continue;
    }

    // Find free slot.
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

    // Load PNG.
    const png = await loadIndexedPngStrict(`${BASE}/${graphics.png}`, 4);
    const numFrames = (png.widthTiles * png.heightTiles) / (TILES_PER_FRAME_16x32);
    const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);

    // Write to OBJ VRAM at allocated tile base.
    const objTileBase = _nextNpcTileBase;
    rt.gba.objVram.set(reordered, objTileBase * 32);
    _nextNpcTileBase += TILES_PER_NPC;

    // Load palette.
    const paletteBank = _nextNpcPaletteBank++;
    const paletteSlot = 256 + paletteBank * 16; // OBJ palette starts at slot 256
    for (let i = 0; i < Math.min(16, png.palette.length); i++) {
      rt.gPlttBufferFaded.set(paletteSlot + i, png.palette[i]);
      rt.gPlttBufferUnfaded.set(paletteSlot + i, png.palette[i]);
    }
    rt.gPlttBufferFaded.flushTo();

    // Init ObjectEvent state.
    const npc = gObjectEvents[slot];
    npc.active = true;
    npc.invisible = false;
    npc.graphicsId = graphicsKey;
    npc.movementType = template.movementTypeRaw ?? '';
    npc.localId = template.localId;
    npc.currentCoordsX = template.x;
    npc.currentCoordsY = template.y;
    npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
    npc.frameIdx = 0;
    npc.objTileBase = objTileBase;
    npc.paletteBank = paletteBank;

    // Create sprite (= initial position calculée par UpdateObjectEvents au
    // prochain frame, mais on init à 0 pour éviter flash off-screen).
    const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[1];
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase + cfg.face * TILES_PER_FRAME_16x32,
      paletteBank,
      x: 0, y: 0,
      shape: 2, size: 2, // 16×32
      priority: 2,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (sprite) sprite.hFlip = cfg.hFlip;
    rt.gba.oam[result.oamIndex].flipH = cfg.hFlip;

    console.log(`[object-events] spawn slot=${slot} ${graphicsKey} at (${npc.currentCoordsX}, ${npc.currentCoordsY}) tileBase=${objTileBase} pal=${paletteBank}`);
  }
}

// ─── Update sprite positions each frame ─────────────────────────────────────

/** À call chaque frame depuis MainCB2_Overworld. Met à jour sprite.x/y de
 *  chaque NPC selon son currentCoords + camera state.
 *
 *  Formule (cf. analyse Phase 4.4.a) :
 *    spriteCenterX = (npcGBackupCol - _camPos.x) * 16 + 8 - (xPixelOffset mod 16)
 *    spriteCenterY = (npcGBackupRow - _camPos.y) * 16 - (yPixelOffset mod 16)
 *
 *  Où npcGBackupCol = npc.currentCoordsX + MAP_OFFSET. */
export function UpdateObjectEvents(rt: DecompRuntime): void {
  const cam = GetCameraTopLeftCoords();
  const camOff = GetCameraOffsetState();

  // Sub-tile offset (= 0..15). xPixelOffset peut être grand (= cumulative).
  // Mod 16 normalisé positif (= JS `%` retourne signed).
  const subX = ((camOff.xPixelOffset % 16) + 16) % 16;
  const subY = ((camOff.yPixelOffset % 16) + 16) % 16;

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    const sprite = rt.gSprites.get(npc.spriteId);
    if (!sprite) continue;

    const npcGBackupCol = npc.currentCoordsX + MAP_OFFSET;
    const npcGBackupRow = npc.currentCoordsY + MAP_OFFSET;
    const viewCol = npcGBackupCol - cam.x;
    const viewRow = npcGBackupRow - cam.y;

    // Cull si très loin de la view (= éviter writes inutiles à OAM hors écran).
    // View visible : cols 0..14, rows 0..9. Buffer +1 chaque côté.
    if (viewCol < -2 || viewCol > 17 || viewRow < -2 || viewRow > 13) {
      // Hide via x out-of-range. GBA OAM x is 9-bit, hors range = invisible.
      sprite.invisible = true;
      continue;
    }
    sprite.invisible = false;

    sprite.x = viewCol * 16 + 8 - subX;
    sprite.y = viewRow * 16 - subY;
  }
}

/** Cleanup tous les NPCs actifs (= map switch / scene shutdown). */
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

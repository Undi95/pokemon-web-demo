/**
 * field-effect-long-grass.ts — 1:1 décomp `FldEff_LongGrass` + `UpdateLongGrassFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:613-645` (sPicTable_LongGrass +
 *     sAnim_LongGrass + gFieldEffectObjectTemplate_LongGrass)
 *   - `src/field_effect_helpers.c:395` (FldEff_LongGrass)
 *   - `src/field_effect_helpers.c:420` (UpdateLongGrassFieldEffect)
 *   - `src/event_object_movement.c:7825/7837` (GroundEffect_Spawn/StepOnLongGrass)
 *
 * Comportement 1:1 : un object event (player ou NPC) sur une tuile MB_LONG_GRASS laisse
 * un overlay 16×16 qui anime (rustle) puis HOLD la dernière frame ; despawn quand l'owner
 * a quitté la tuile (sObjectMoved) ET l'anim finie, OU si la tuile n'est plus long grass.
 * Frère de field-effect-grass.ts (tall grass) — fonction décomp DISTINCTE (anim/priority/
 * despawn différents), donc module miroir séparé (pas une dup de la même fonction).
 *
 * Différences vs tall grass : 4 frames (pas 5), anim 7 cmds, priority = ElevationToPriority
 * (pas 2 fixe), spawn-statique = SeekSpriteAnim(6) (skip à la dernière frame avant END),
 * UpdateGrassFieldEffectSubpriority subprio offset TOUJOURS 0, check MB_LONG_GRASS.
 *
 * Asset : long_grass.png (64×16 = 4 frames 16×16 4bpp). Palette : general_1.pal.
 * Trigger (spine) hors démo (Route 119/120) → vérif mécanisme par force-spawn.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';
import { MAP_OFFSET, MapGridGetMetatileBehaviorAt } from './map-loader';
import { gObjectEvents, type ObjectEvent, TryGetObjectEventIdByLocalIdAndMap, UpdateGrassFieldEffectSubpriority, ElevationToPriority } from './object-events';
import { MetatileBehavior_IsLongGrass } from '../../game/metatile_behavior';

const LOCALID_PLAYER = 0xFF;
const LONG_GRASS_PNG = '/decomp/em/field_effects/long_grass.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';
const TAG_LONG_GRASS_GFX = 'FIELD_EFFECT_LONG_GRASS_GFX';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';

const TILES_PER_FRAME = 4;  // 16×16
const NUM_FRAMES = 4;
let _longGrassTileStart = -1;
let _longGrassPalSlot = -1;

/** 1:1 décomp `sAnim_LongGrass` (field_effect_objects.h:620) : (frameIdx, durée). END après.
 *  cmd index 6 = dernière frame (0) → cible de SeekSpriteAnim(6) pour le spawn statique. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 1, duration: 3 },
  { frameIdx: 2, duration: 3 },
  { frameIdx: 0, duration: 4 },
  { frameIdx: 3, duration: 4 },
  { frameIdx: 0, duration: 4 },
  { frameIdx: 3, duration: 4 },
  { frameIdx: 0, duration: 4 },
];
// Ticks au début de cmd 6 (= SeekSpriteAnim(6), overlay statique au spawn).
const SEEK_FRAME_6_TICKS = ANIM_SEQUENCE.slice(0, 6).reduce((a, s) => a + s.duration, 0); // 22

interface LongGrassState {
  spriteId: number; oamIndex: number; ticks: number;
  tileX: number; tileY: number; objectMoved: boolean;
  localId: number; mapNum: number; mapGroup: number; elevation: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: LongGrassState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 64×16 = 8×2 tiles row-major. Frame F (16×16) = cols 2F,2F+1 sur 2 rows = 4 tiles. */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const PNG_WIDTH_TILES = 8;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const pngTileIdx = row * PNG_WIDTH_TILES + (f * 2) + col;
        const objTileIdx = f * TILES_PER_FRAME + row * 2 + col;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadLongGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_LONG_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(LONG_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _longGrassTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_LONG_GRASS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _longGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, tileX: 0, tileY: 0, objectMoved: false, localId: LOCALID_PLAYER, mapNum: 0, mapGroup: 0, elevation: 3, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_LongGrass` (field_effect_helpers.c:395). mapX/mapY = LOGICAL. */
export function SpawnLongGrassEffect(
  rt: DecompRuntime, mapX: number, mapY: number, spawnStatic = false,
  localId: number = LOCALID_PLAYER, mapNum = 0, mapGroup = 0, elevation = 3,
): void {
  if (!_initialized) return;
  const tileX = mapX + MAP_OFFSET, tileY = mapY + MAP_OFFSET;
  for (const e of _pool) if (e.active && e.tileX === tileX && e.tileY === tileY) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  // 1:1 décomp `SetSpritePosToOffsetMapCoords(&x, &y, 8, 8)` → coords MONDE + coordOffsetEnabled.
  const world = SetSpritePosToOffsetMapCoords(tileX, tileY, 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _longGrassTileStart,
    paletteBank: _longGrassPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 décomp `sprite->oam.priority = ElevationToPriority(gFieldEffectArguments[2])`.
    priority: Math.max(0, Math.min(3, ElevationToPriority(elevation))) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) { sprite.x = world.x; sprite.y = world.y; sprite.coordOffsetEnabled = true; }
  const state = _pool[slot];
  state.spriteId = result.spriteId;
  state.oamIndex = result.oamIndex;
  // 1:1 : if (gFieldEffectArguments[7]) SeekSpriteAnim(sprite, 6) → overlay statique au spawn.
  state.ticks = spawnStatic ? SEEK_FRAME_6_TICKS : 0;
  state.tileX = tileX; state.tileY = tileY;
  state.objectMoved = false;
  state.localId = localId; state.mapNum = mapNum; state.mapGroup = mapGroup;
  state.elevation = elevation;
  state.active = true;
}

/** 1:1 décomp `UpdateLongGrassFieldEffect` (field_effect_helpers.c:420). À call/frame. */
export function UpdateLongGrassEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  const lastFrame = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    // Anim : joue une fois puis HOLD la dernière frame (= ANIMCMD_END).
    let acc = 0;
    let frameIdx = lastFrame;
    let animEnded = true;
    for (let i = 0; i < ANIM_SEQUENCE.length; i++) {
      acc += ANIM_SEQUENCE[i].duration;
      if (s.ticks < acc) { frameIdx = ANIM_SEQUENCE[i].frameIdx; animEnded = false; break; }
    }
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _longGrassTileStart + frameIdx * TILES_PER_FRAME;
    s.ticks++;
    // 1:1 décomp despawn : owner introuvable, OU plus sur long grass, OU (objectMoved && animEnded).
    const tileBehavior = MapGridGetMetatileBehaviorAt(s.tileX, s.tileY);
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound || !MetatileBehavior_IsLongGrass(tileBehavior) || (s.objectMoved && animEnded)) {
      sprite.inUse = false; oam.visible = false; rt.gSprites.delete(s.spriteId);
      oam.tileId = 0; oam.flipH = false; oam.flipV = false;
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
    } else {
      const objEvent: ObjectEvent = gObjectEvents[objectEventId];
      if ((objEvent.currentCoordsX !== s.tileX || objEvent.currentCoordsY !== s.tileY)
       && (objEvent.previousCoordsX !== s.tileX || objEvent.previousCoordsY !== s.tileY))
        s.objectMoved = true;
      // 1:1 décomp : UpdateGrassFieldEffectSubpriority(sprite, sElevation, 0) (offset toujours 0).
      UpdateGrassFieldEffectSubpriority(rt, sprite, s.elevation, 0);
    }
  }
}

export function DestroyAllLongGrassEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

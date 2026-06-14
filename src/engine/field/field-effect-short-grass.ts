/**
 * field-effect-short-grass.ts — 1:1 décomp `FldEff_ShortGrass` + `UpdateShortGrassFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:1075-1100` (sPicTable/sAnim/Template ShortGrass)
 *   - `src/field_effect_helpers.c:492` (FldEff_ShortGrass)
 *   - `src/field_effect_helpers.c:511` (UpdateShortGrassFieldEffect)
 *   - `src/event_object_movement.c` (GroundEffect_ShortGrass → StartFieldEffectForObjectEvent)
 *
 * Comportement 1:1 : touffe d'herbe basse (Route 110, etc.) qui SUIT le sprite du parent
 * (player/NPC) en continu (≠ tall/long grass tuile-fixe) — petit sway 2 frames qui REJOUE
 * quand le parent bouge, tenu sinon. Positionnée sur le sprite parent (x/y), y2 = height/2-8
 * (mi-corps), subpriority = parent-1 (devant le parent), priority = parent. Despawn quand
 * l'owner n'est plus inShortGrass (= flag posé par GetGroundEffectFlags_ShortGrass).
 *
 * Asset : short_grass.png (32×16 = 2 frames 16×16). Palette : general_1.pal.
 * Trigger (spine) hors démo → vérif mécanisme par force-spawn / inspection.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap, TryGetObjectEventIdByLocalIdAndMap,
  GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from './object-events';

const SHORT_GRASS_PNG = '/decomp/em/field_effects/short_grass.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';
const TAG_SHORT_GRASS_GFX = 'FIELD_EFFECT_SHORT_GRASS_GFX';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';
const OBJECT_EVENTS_COUNT = 16;

const TILES_PER_FRAME = 4;  // 16×16
const NUM_FRAMES = 2;
let _shortGrassTileStart = -1;
let _shortGrassPalSlot = -1;

/** 1:1 décomp `sAnim_ShortGrass` : (0,4)(1,4) END → sway 2 frames (8 game frames) puis HOLD. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 4 },
  { frameIdx: 1, duration: 4 },
];

interface ShortGrassState {
  spriteId: number; oamIndex: number; ticks: number;
  localId: number; mapNum: number; mapGroup: number;
  prevX: number; prevY: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: ShortGrassState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 32×16 = 4×2 tiles row-major. Frame F (16×16) = cols 2F,2F+1 sur 2 rows = 4 tiles. */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const PNG_WIDTH_TILES = 4;
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
export function preloadShortGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SHORT_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(SHORT_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _shortGrassTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SHORT_GRASS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _shortGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, localId: 0xFF, mapNum: 0, mapGroup: 0, prevX: 0, prevY: 0, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_ShortGrass` (field_effect_helpers.c:492). args[0..2] = localId/mapNum/
 *  mapGroup de l'owner (posés par StartFieldEffectForObjectEvent). */
export function SpawnShortGrassEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): void {
  if (!_initialized) return;
  // 1:1 : éviter doublon — un seul short grass par owner.
  for (const e of _pool) if (e.active && e.localId === localId && e.mapNum === mapNum && e.mapGroup === mapGroup) return;
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return;
  const parent = gObjectEvents[objectEventId];
  const parentSpriteId = GetObjectEventMainSpriteId(parent);
  const parentSprite = parentSpriteId >= 0 ? rt.gSprites.get(parentSpriteId) : undefined;
  if (!parentSprite) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  const pOam = rt.gba.oam[parentSprite.oamIndex];
  const result = rt.CreateSpriteAtOam({
    tileId: _shortGrassTileStart,
    paletteBank: _shortGrassPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority.
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = parentSprite.x; sprite.y = parentSprite.y;
    // 1:1 : coordOffsetEnabled = TRUE (décomp). Nos parents sont écran-positionnés → matcher
    // le parent pour suivre exactement (l'Update copie x/y du parent chaque frame).
    sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  }
  const state = _pool[slot];
  state.spriteId = result.spriteId; state.oamIndex = result.oamIndex; state.ticks = 0;
  state.localId = localId; state.mapNum = mapNum; state.mapGroup = mapGroup;
  // 1:1 : sprite->sPrevX/Y = gSprites[objectEvent->spriteId].x/y.
  state.prevX = parentSprite.x; state.prevY = parentSprite.y;
  state.active = true;
}

/** 1:1 décomp `UpdateShortGrassFieldEffect` (field_effect_helpers.c:511). À call/frame. */
export function UpdateShortGrassEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  const totalAnim = ANIM_SEQUENCE.reduce((a, s) => a + s.duration, 0);
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound || !gObjectEvents[objectEventId].inShortGrass) {
      // 1:1 FieldEffectStop → DestroySprite.
      sprite.inUse = false; oam.visible = false; rt.gSprites.delete(s.spriteId);
      oam.tileId = 0; oam.flipH = false; oam.flipV = false;
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
      continue;
    }
    const objEvent: ObjectEvent = gObjectEvents[objectEventId];
    const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
    const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
    if (!linked) continue;
    const lOam = rt.gba.oam[linked.oamIndex];
    const parentX = linked.x, parentY = linked.y;
    // 1:1 : si le parent a bougé, restart l'anim (si finie).
    let animEnded = s.ticks >= totalAnim;
    if (parentX !== s.prevX || parentY !== s.prevY) {
      s.prevX = parentX; s.prevY = parentY;
      if (animEnded) { s.ticks = 0; animEnded = false; }
    }
    // Frame courante (hold dernière si finie).
    let acc = 0;
    let frameIdx = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
    for (let i = 0; i < ANIM_SEQUENCE.length; i++) {
      acc += ANIM_SEQUENCE[i].duration;
      if (s.ticks < acc) { frameIdx = ANIM_SEQUENCE[i].frameIdx; break; }
    }
    oam.tileId = _shortGrassTileStart + frameIdx * TILES_PER_FRAME;
    s.ticks++;
    // 1:1 : suit le parent + offset mi-corps + z-order devant le parent.
    sprite.x = parentX; sprite.y = parentY;
    sprite.y2 = (GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) - 8;
    sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
    sprite.subpriority = (linked.subpriority - 1) & 0xFF;
    if (lOam) oam.priority = lOam.priority;
    sprite.invisible = linked.invisible;
  }
}

export function DestroyAllShortGrassEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

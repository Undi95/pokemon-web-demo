/**
 * field-effect-hot-springs.ts — 1:1 décomp `FldEff_HotSpringsWater` + `UpdateHotSpringsWaterFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:1102-1125` (sPicTable/sAnim/Template HotSpringsWater)
 *   - `src/field_effect_helpers.c:800` (FldEff_HotSpringsWater)
 *   - `src/field_effect_helpers.c:820` (UpdateHotSpringsWaterFieldEffect)
 *   - `src/event_object_movement.c` (GroundEffect_HotSprings → StartFieldEffectForObjectEvent,
 *     GetGroundEffectFlags_HotSprings → inHotSprings, sur tuiles hot springs Lavaridge)
 *
 * Comportement 1:1 : nappe d'eau chaude (16×16, frame statique) qui SUIT le sprite du parent
 * assis dans les sources de Lavaridge. L'eau lape DEVANT le joueur (subpriority = parent-1) et
 * couvre le bas du corps (y = height/2 + parentY - 8). Pas d'anim (FRAME(0,4) END = frame 0 tenue).
 * Despawn quand l'owner n'est plus inHotSprings (flag posé par GetGroundEffectFlags_HotSprings).
 *
 * Asset : hot_springs_water.png (16×16 = 4 tiles 2×2, frame unique). Palette : general_1.pal.
 */

import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap, TryGetObjectEventIdByLocalIdAndMap,
  GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from './object-events';

const HOT_SPRINGS_PNG = '/decomp/em/field_effects/hot_springs_water.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';
const TAG_HOT_SPRINGS_GFX = 'FIELD_EFFECT_HOT_SPRINGS_WATER_GFX';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';
const OBJECT_EVENTS_COUNT = 16;
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

let _hotSpringsTileStart = -1;
let _hotSpringsPalSlot = -1;

interface HotSpringsState {
  spriteId: number; oamIndex: number;
  localId: number; mapNum: number; mapGroup: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: HotSpringsState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

let _initPromise: Promise<void> | null = null;
export function preloadHotSpringsEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_HOT_SPRINGS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    // PNG 16×16 = 4 tiles 2×2 → ordre PNG brut (row-major) = ordre obj (TL,TR,BL,BR). Frame
    // unique, pas de reorder (≠ short grass/sand pile qui ont plusieurs frames côte à côte).
    const png = await loadIndexedPngStrict(HOT_SPRINGS_PNG, 4);
    _hotSpringsTileStart = LoadSpriteSheet({ data: png.charData, size: png.charData.length, tag: TAG_HOT_SPRINGS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _hotSpringsPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, localId: 0xFF, mapNum: 0, mapGroup: 0, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `UpdateObjectEventSpriteInvisibility(sprite, FALSE)` (event_object_movement.c:8562) :
 *  visible, sauf si le sprite est hors-écran (culling). */
function updateSpriteInvisibilityOffscreen(rt: DecompRuntime, sprite: DecompSprite): void {
  sprite.invisible = false;
  const offX = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetX : 0;
  const offY = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetY : 0;
  const x = (sprite.x + sprite.x2 + sprite.centerToCornerVecX + offX) << 16 >> 16;
  const y = (sprite.y + sprite.y2 + sprite.centerToCornerVecY + offY) << 16 >> 16;
  const x2 = x - (sprite.centerToCornerVecX >> 1);
  const y2 = y - (sprite.centerToCornerVecY >> 1);
  if (x >= DISPLAY_WIDTH + 16 || x2 < -16) sprite.invisible = true;
  if (y >= DISPLAY_HEIGHT + 16 || y2 < -16) sprite.invisible = true;
}

/** 1:1 décomp `FldEff_HotSpringsWater` (field_effect_helpers.c:800). args[0..2] = localId/mapNum/
 *  mapGroup de l'owner (posés par StartFieldEffectForObjectEvent). */
export function SpawnHotSpringsEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): void {
  if (!_initialized) return;
  // 1:1 : un seul hot springs par owner (l'Update despawn quand !inHotSprings).
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
    tileId: _hotSpringsTileStart,
    paletteBank: _hotSpringsPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority (posée 1× au spawn).
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = parentSprite.x; sprite.y = parentSprite.y;
    // 1:1 : sprite->coordOffsetEnabled = TRUE. Nos parents sont écran-positionnés → matcher
    // le parent pour suivre exactement (l'Update repositionne chaque frame).
    sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  }
  const state = _pool[slot];
  state.spriteId = result.spriteId; state.oamIndex = result.oamIndex;
  state.localId = localId; state.mapNum = mapNum; state.mapGroup = mapGroup;
  state.active = true;
}

/** 1:1 décomp `UpdateHotSpringsWaterFieldEffect` (field_effect_helpers.c:820). À call/frame. */
export function UpdateHotSpringsEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound || !gObjectEvents[objectEventId].inHotSprings) {
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
    // 1:1 : sprite->x = linkedSprite->x ; y = (height>>1) + linkedSprite->y - 8 (couvre le bas du
    // corps). Encodé dans y (≠ sand pile qui met height/2-2 dans y2). subpriority = parent-1 (DEVANT).
    sprite.x = linked.x;
    sprite.y = (GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) + linked.y - 8;
    sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
    sprite.subpriority = (linked.subpriority - 1) & 0xFF;
    // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE). (oam.tileId reste frame 0, pas d'anim.)
    oam.tileId = _hotSpringsTileStart;
    updateSpriteInvisibilityOffscreen(rt, sprite);
  }
}

export function DestroyAllHotSpringsEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

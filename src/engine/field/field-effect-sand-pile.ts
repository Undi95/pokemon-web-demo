/**
 * field-effect-sand-pile.ts — 1:1 décomp `FldEff_SandPile` + `UpdateSandPileFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:787-815` (sPicTable/sAnim/Template SandPile)
 *   - `src/field_effect_helpers.c:1204` (FldEff_SandPile)
 *   - `src/field_effect_helpers.c:1227` (UpdateSandPileFieldEffect)
 *   - `src/event_object_movement.c` (GroundEffect_SandHeap → StartFieldEffectForObjectEvent,
 *     GetGroundEffectFlags_SandPile → inSandPile, sur deep sand)
 *
 * Comportement 1:1 : petit monticule de sable remué (16×8) qui SUIT le sprite du parent
 * (player/NPC) marchant sur du sable profond (MB_DEEP_SAND). Anim 3 frames (0,1,2) @ 4
 * game-frames ; au spawn `SeekSpriteAnim(2)` (démarre sur la frame finale = sable retombé),
 * et REJOUE depuis la frame 0 quand le parent bouge (si l'anim est finie). Positionné sur le
 * sprite parent (x/y), y2 = height/2 - 2 (aux pieds), subpriority = parent (même plan, ≠ short
 * grass qui passe devant), priority = parent (posée une seule fois au spawn). Despawn quand
 * l'owner n'est plus inSandPile (flag posé par GetGroundEffectFlags_SandPile).
 *
 * Asset : sand_pile.png (48×8 = 6 tiles en ligne = 3 frames 16×8). Palette : general_0.pal.
 */

import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap, TryGetObjectEventIdByLocalIdAndMap,
  GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from './object-events';

const SAND_PILE_PNG = '/decomp/em/field_effects/sand_pile.png';
const GENERAL_0_PAL = '/decomp/em/field_effects/general_0.pal';
const TAG_SAND_PILE_GFX = 'FIELD_EFFECT_SAND_PILE_GFX';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';
const OBJECT_EVENTS_COUNT = 16;
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

const TILES_PER_FRAME = 2;  // 16×8 = 2×1 tiles
const NUM_FRAMES = 3;
let _sandPileTileStart = -1;
let _sandPilePalSlot = -1;

/** 1:1 décomp `sAnim_SandPile` : (0,4)(1,4)(2,4) END → 3 frames de 4 game-frames puis HOLD. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 4 },
  { frameIdx: 1, duration: 4 },
  { frameIdx: 2, duration: 4 },
];
const ANIM_TOTAL = ANIM_SEQUENCE.reduce((a, s) => a + s.duration, 0); // 12
// 1:1 `SeekSpriteAnim(sprite, 2)` au spawn : démarre sur la frame 2 (avant-dernier cmd, 4
// game-frames restants avant ANIMCMD_END) → ticks initial = début de la fenêtre frame 2.
const SEEK_TO_FRAME2_TICKS = ANIM_SEQUENCE[0].duration + ANIM_SEQUENCE[1].duration; // 8

interface SandPileState {
  spriteId: number; oamIndex: number; ticks: number;
  localId: number; mapNum: number; mapGroup: number;
  prevX: number; prevY: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: SandPileState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

let _initPromise: Promise<void> | null = null;
export function preloadSandPileEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SAND_PILE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    // PNG 48×8 = 6 tiles en UNE rangée → ordre PNG brut = ordre frame (frame F = tiles 2F,2F+1
    // contigus). Pas de reorder nécessaire (≠ short grass dont le PNG fait 2 rangées).
    const png = await loadIndexedPngStrict(SAND_PILE_PNG, 4);
    _sandPileTileStart = LoadSpriteSheet({ data: png.charData, size: png.charData.length, tag: TAG_SAND_PILE_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _sandPilePalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
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

/** 1:1 décomp `UpdateObjectEventSpriteInvisibility(sprite, FALSE)` (event_object_movement.c:8562) :
 *  visible, sauf si le sprite est hors-écran (culling). */
function updateSpriteInvisibilityOffscreen(rt: DecompRuntime, sprite: DecompSprite): void {
  sprite.invisible = false;
  const offX = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetX : 0;
  const offY = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetY : 0;
  const x = (sprite.x + sprite.x2 + sprite.centerToCornerVecX + offX) & 0xFFFF;
  const y = (sprite.y + sprite.y2 + sprite.centerToCornerVecY + offY) & 0xFFFF;
  const x2 = (x << 16 >> 16) - (sprite.centerToCornerVecX >> 1);
  const y2 = (y << 16 >> 16) - (sprite.centerToCornerVecY >> 1);
  if ((x << 16 >> 16) >= DISPLAY_WIDTH + 16 || x2 < -16) sprite.invisible = true;
  if ((y << 16 >> 16) >= DISPLAY_HEIGHT + 16 || y2 < -16) sprite.invisible = true;
}

/** 1:1 décomp `FldEff_SandPile` (field_effect_helpers.c:1204). args[0..2] = localId/mapNum/
 *  mapGroup de l'owner (posés par StartFieldEffectForObjectEvent). */
export function SpawnSandPileEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): void {
  if (!_initialized) return;
  // 1:1 : un seul sand pile par owner (l'Update despawn quand !inSandPile, donc pas de doublon).
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
    tileId: _sandPileTileStart,
    paletteBank: _sandPilePalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 1, size: 0,  // 16×8 (horizontal)
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority (posée 1× au spawn).
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = parentSprite.x; sprite.y = parentSprite.y;
    // 1:1 : sprite->coordOffsetEnabled = TRUE. Nos parents sont écran-positionnés → matcher
    // le parent pour suivre exactement (l'Update copie x/y du parent chaque frame).
    sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
    // 1:1 : sprite->y2 = (graphicsInfo->height >> 1) - 2.
    sprite.y2 = (GetObjectEventGfxHeight(parent.graphicsId) >> 1) - 2;
  }
  const state = _pool[slot];
  state.spriteId = result.spriteId; state.oamIndex = result.oamIndex;
  // 1:1 : SeekSpriteAnim(sprite, 2) → démarre sur la frame 2.
  state.ticks = SEEK_TO_FRAME2_TICKS;
  state.localId = localId; state.mapNum = mapNum; state.mapGroup = mapGroup;
  // 1:1 : sprite->sPrevX/Y = gSprites[objectEvent->spriteId].x/y.
  state.prevX = parentSprite.x; state.prevY = parentSprite.y;
  state.active = true;
}

/** 1:1 décomp `UpdateSandPileFieldEffect` (field_effect_helpers.c:1227). À call/frame. */
export function UpdateSandPileEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound || !gObjectEvents[objectEventId].inSandPile) {
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
    const parentX = linked.x, parentY = linked.y;
    // 1:1 : si le parent a bougé, restart l'anim depuis frame 0 (si finie).
    let animEnded = s.ticks >= ANIM_TOTAL;
    if (parentX !== s.prevX || parentY !== s.prevY) {
      s.prevX = parentX; s.prevY = parentY;
      if (animEnded) { s.ticks = 0; animEnded = false; }
    }
    // Frame courante (hold dernière frame quand l'anim est finie).
    let acc = 0;
    let frameIdx = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
    for (let i = 0; i < ANIM_SEQUENCE.length; i++) {
      acc += ANIM_SEQUENCE[i].duration;
      if (s.ticks < acc) { frameIdx = ANIM_SEQUENCE[i].frameIdx; break; }
    }
    oam.tileId = _sandPileTileStart + frameIdx * TILES_PER_FRAME;
    if (s.ticks < ANIM_TOTAL) s.ticks++;
    // 1:1 : sprite->x/y = parent x/y ; subpriority = parent subpriority (même plan).
    sprite.x = parentX; sprite.y = parentY;
    sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
    sprite.subpriority = linked.subpriority & 0xFF;
    // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE).
    updateSpriteInvisibilityOffscreen(rt, sprite);
  }
}

export function DestroyAllSandPileEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

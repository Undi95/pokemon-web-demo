/**
 * field-effect-splash.ts — 1:1 décomp `FldEff_Splash` + `FldEff_FeetInFlowingWater`
 * (+ leurs Update). Les deux partagent le MÊME template FLDEFFOBJ_SPLASH (splash.png, 2 anims) :
 *   - anim 0 = éclaboussure one-shot (UpdateSplashFieldEffect, despawn sur animEnded).
 *   - anim 1 = pieds dans l'eau qui coule, boucle (UpdateFeetInFlowingWaterFieldEffect,
 *     despawn quand l'owner n'est plus inShallowFlowingWater).
 *
 * Sources (1:1 décomp) : field_effect_helpers.c:642 (FldEff_Splash) / :664 (UpdateSplash) /
 * :725 (FldEff_FeetInFlowingWater) / :748 (UpdateFeetInFlowingWater) ; data/field_effects/
 * field_effect_objects.h:543-582 (sPicTable/sAnim_Splash_0/_1/Template). Les deux SUIVENT le
 * sprite du parent (x/y) + y2 = height/2-4. Palette general_0.
 *
 * Audit : la décomp joue PlaySE(SE_PUDDLE) au spawn (Splash) et au changement de tuile (Feet) —
 * SKIPPÉ ici (contrat « jamais l'audio »).
 *
 * Trigger (spine) = eau peu profonde (GroundEffect_Splash/FlowingWater) — hors démo → vérif différée.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import {
  gObjectEvents, GetObjectEventIdByLocalIdAndMap, TryGetObjectEventIdByLocalIdAndMap,
  GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from './object-events';

// 1:1 constants/field_effects.h — LOCALES (rompt le cycle ESM field-effect ↔ splash, cf. TDZ jump-impact).
const FLDEFF_SPLASH = 15;
const FLDEFF_FEET_IN_FLOWING_WATER = 34;

const SPLASH_PNG = '/decomp/em/field_effects/splash.png';
const GENERAL_0_PAL = '/decomp/em/field_effects/general_0.pal';
const TAG_SPLASH_GFX = 'FIELD_EFFECT_SPLASH_GFX';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';
const OBJECT_EVENTS_COUNT = 16;

const TILES_PER_FRAME = 2;  // 16×8 = 2×1 tiles
const NUM_FRAMES = 2;
let _splashTileStart = -1;
let _splashPalSlot = -1;

/** 1:1 sAnim_Splash_0 (one-shot) : (frame, durée). */
const ANIM_0: ReadonlyArray<readonly [number, number]> = [[0, 4], [1, 4]];
/** 1:1 sAnim_Splash_1 (loop, JUMP(0)) : pieds dans l'eau. */
const ANIM_1: ReadonlyArray<readonly [number, number]> = [[0, 4], [1, 4], [0, 6], [1, 6], [0, 8], [1, 8], [0, 6], [1, 6]];

interface SplashState {
  spriteId: number; oamIndex: number; ticks: number;
  fldeff: number; localId: number; mapNum: number; mapGroup: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: SplashState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 32×8 = 4×1 tiles. Frame F (16×8) = cols 2F,2F+1 row 0 (2 tiles). */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let t = 0; t < TILES_PER_FRAME; t++) {
      const pngTileIdx = f * TILES_PER_FRAME + t;
      out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), (f * TILES_PER_FRAME + t) * TILE_BYTES);
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadSplashEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SPLASH_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(SPLASH_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _splashTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SPLASH_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _splashPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
    for (let i = 0; i < POOL_SIZE; i++) _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, fldeff: 0, localId: 0xFF, mapNum: 0, mapGroup: 0, active: false };
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_Splash` (642) / `FldEff_FeetInFlowingWater` (725). fldeff distingue
 *  l'anim + le callback. args[0..2] = localId/mapNum/mapGroup de l'owner. */
export function SpawnSplashEffect(rt: DecompRuntime, fldeff: number, localId: number, mapNum: number, mapGroup: number): void {
  if (!_initialized) return;
  for (const e of _pool) if (e.active && e.fldeff === fldeff && e.localId === localId && e.mapNum === mapNum && e.mapGroup === mapGroup) return;
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
    tileId: _splashTileStart, paletteBank: _splashPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 1, size: 0,  // 16×8
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = parentSprite.x; sprite.y = parentSprite.y;
    sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
    // 1:1 : sprite->y2 = (graphicsInfo->height >> 1) - 4.
    sprite.y2 = (GetObjectEventGfxHeight(parent.graphicsId) >> 1) - 4;
  }
  const st = _pool[slot];
  st.spriteId = result.spriteId; st.oamIndex = result.oamIndex; st.ticks = 0;
  st.fldeff = fldeff; st.localId = localId; st.mapNum = mapNum; st.mapGroup = mapGroup; st.active = true;
}

/** Tick des effets splash + feet-in-water. À call/frame. */
export function UpdateSplashEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const isFeet = s.fldeff === FLDEFF_FEET_IN_FLOWING_WATER;
    const anim = isFeet ? ANIM_1 : ANIM_0;
    const total = anim.reduce((a, [, d]) => a + d, 0);
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    // 1:1 despawn : Splash = animEnded || owner-gone ; Feet = owner-gone || !inShallowFlowingWater.
    const animEnded = !isFeet && s.ticks >= total;
    const despawn = notFound
      || animEnded
      || (isFeet && !gObjectEvents[objectEventId].inShallowFlowingWater);
    if (despawn) {
      sprite.inUse = false; oam.visible = false; rt.gSprites.delete(s.spriteId);
      oam.tileId = 0; oam.flipH = false; oam.flipV = false;
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
      continue;
    }
    // Frame (loop pour feet via mod, one-shot pour splash).
    const t = isFeet ? (s.ticks % total) : s.ticks;
    let acc = 0;
    let frameIdx = anim[anim.length - 1][0];
    for (const [fr, d] of anim) { acc += d; if (t < acc) { frameIdx = fr; break; } }
    oam.tileId = _splashTileStart + frameIdx * TILES_PER_FRAME;
    s.ticks++;
    // Suit le parent (1:1 : sprite->x/y = linkedSprite->x/y).
    const objEvent = gObjectEvents[objectEventId];
    const linkedId = GetObjectEventMainSpriteId(objEvent);
    const linked = linkedId >= 0 ? rt.gSprites.get(linkedId) : undefined;
    if (linked) {
      sprite.x = linked.x; sprite.y = linked.y;
      sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
      // 1:1 Feet : sprite->subpriority = linkedSprite->subpriority. (Splash ne touche pas la subprio.)
      if (isFeet) sprite.subpriority = linked.subpriority & 0xFF;
      sprite.invisible = linked.invisible;
    }
  }
}

export function DestroyAllSplashEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

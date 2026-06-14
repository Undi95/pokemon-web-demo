/**
 * field-effect-footprints.ts — 1:1 décomp empreintes/traces partageant
 * `UpdateFootprintsTireTracksFieldEffect` (field_effect_helpers.c:610) : sand footprints,
 * deep sand footprints, bike tire tracks. Laissées au sol quand un object event marche/roule
 * sur sable (TRACKS_FOOT) ou en vélo (TRACKS_BIKE_TIRE) — via DoTracksGroundEffect_* (spine).
 *
 * Sources (1:1 décomp) : field_effect_helpers.c:554 FldEff_SandFootprints / :571 DeepSand /
 * :588 BikeTireTracks / :610-631 UpdateFootprintsTireTracks + FadeFootprintsTireTracks_Step0/1.
 * data/field_effects/field_effect_objects.h:338-508 (templates + anims par direction).
 *
 * Mécanisme NOUVEAU (fade) : l'empreinte est STATIQUE (1 frame + flip selon la direction =
 * l'index d'anim args[4]) ; Step0 attend 40 frames, Step1 clignote (invisible ^= 1) puis
 * despawn à 56 frames. Tuile-fixe (SetSpritePosToOffsetMapCoords + coordOffsetEnabled).
 *
 * Trigger (spine) = marche/vélo sur sable (hors démo) → vérif différée. Palette general_0.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';

// 1:1 constants/field_effects.h — LOCALES (rompt le cycle ESM, cf. piège TDZ jump-impact).
const FLDEFF_SAND_FOOTPRINTS = 13;
const FLDEFF_DEEP_SAND_FOOTPRINTS = 24;
const FLDEFF_BIKE_TIRE_TRACKS = 35;

const BASE = '/decomp/em/field_effects';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';
const TILES_PER_FRAME = 4;  // 16×16

/** [frameIdx, hFlip, vFlip] par index d'anim (= direction/virage, args[4]). */
type AnimDef = readonly [number, 0 | 1, 0 | 1];
interface FpCfg { tag: string; png: string; pngWidthTiles: number; anims: ReadonlyArray<AnimDef>; }

/** 1:1 sAnimTable_* (field_effect_objects.h). */
const CFG: Record<number, FpCfg> = {
  // Sand/Deep : [South vF, South vF, North, West, East hF].
  [FLDEFF_SAND_FOOTPRINTS]: {
    tag: 'FE_SAND_FOOTPRINTS', png: `${BASE}/sand_footprints.png`, pngWidthTiles: 4,
    anims: [[0, 0, 1], [0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 1, 0]],
  },
  [FLDEFF_DEEP_SAND_FOOTPRINTS]: {
    tag: 'FE_DEEP_SAND_FOOTPRINTS', png: `${BASE}/deep_sand_footprints.png`, pngWidthTiles: 4,
    anims: [[0, 0, 1], [0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 1, 0]],
  },
  // Bike : [S, S, N, W, E, SE, SW hF, NW hF, NE].
  [FLDEFF_BIKE_TIRE_TRACKS]: {
    tag: 'FE_BIKE_TIRE_TRACKS', png: `${BASE}/bike_tire_tracks.png`, pngWidthTiles: 8,
    anims: [[2, 0, 0], [2, 0, 0], [2, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, 0], [0, 1, 0], [3, 1, 0], [3, 0, 0]],
  },
};

const _tileStart = new Map<number, number>();
const _numFrames = new Map<number, number>();
let _palG0 = -1;

interface FpState {
  spriteId: number; oamIndex: number; fldeff: number;
  state: number; timer: number; invisible: boolean; active: boolean;
}
const POOL_SIZE = 8;  // les empreintes vivent ~56f et se déposent à chaque pas → plusieurs actives.
const _pool: FpState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG (pngWidthTiles wide) → OBJ 1D frame-major. Frame F (16×16) = cols 2F,2F+1 sur 2 rows. */
function reorderSheet(charData: Uint8Array, pngWidthTiles: number, frames: number): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(frames * TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < frames; f++) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const srcTileIdx = r * pngWidthTiles + (f * 2) + c;
        const srcOff = srcTileIdx * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadFootprintsEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(CFG[FLDEFF_SAND_FOOTPRINTS].tag) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    try { _palG0 = LoadSpritePalette({ data: await loadGbaPal(`${BASE}/general_0.pal`), tag: TAG_GENERAL_0_PAL }); } catch { _palG0 = 0; }
    for (const key of Object.keys(CFG)) {
      const fldeff = Number(key);
      const cfg = CFG[fldeff];
      const png = await loadIndexedPngStrict(cfg.png, 4);
      const frames = (png.charData.length / 32 / TILES_PER_FRAME) | 0;
      const reordered = reorderSheet(png.charData, cfg.pngWidthTiles, frames);
      _tileStart.set(fldeff, LoadSpriteSheet({ data: reordered, size: reordered.length, tag: cfg.tag }));
      _numFrames.set(fldeff, frames);
    }
    for (let i = 0; i < POOL_SIZE; i++) _pool[i] = { spriteId: -1, oamIndex: -1, fldeff: 0, state: 0, timer: 0, invisible: false, active: false };
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_{Sand,DeepSand}Footprints` / `FldEff_BikeTireTracks`. internalX/Y =
 *  gFieldEffectArguments[0/1] (previousCoords, déjà +MAP_OFFSET) ; subpriority=args[2],
 *  priority=args[3], animIdx=args[4] (direction → frame + flip via StartSpriteAnim). */
export function SpawnFootprintsEffect(
  rt: DecompRuntime, fldeff: number, internalX: number, internalY: number,
  subpriority: number, priority: number, animIdx: number,
): void {
  if (!_initialized) return;
  const cfg = CFG[fldeff];
  const tileStart = _tileStart.get(fldeff);
  if (!cfg || tileStart === undefined) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  const def = cfg.anims[animIdx] ?? cfg.anims[0];
  const world = SetSpritePosToOffsetMapCoords(internalX, internalY, 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart + def[0] * TILES_PER_FRAME,
    paletteBank: _palG0,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: Math.max(0, Math.min(3, priority | 0)) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = world.x; sprite.y = world.y; sprite.coordOffsetEnabled = true;
    sprite.subpriority = subpriority & 0xFF;
    sprite.hFlip = def[1] === 1;
    sprite.vFlip = def[2] === 1;
  }
  const oam = rt.gba.oam[result.oamIndex];
  if (oam) oam.subpriority = subpriority & 0xFF;
  const st = _pool[slot];
  st.spriteId = result.spriteId; st.oamIndex = result.oamIndex; st.fldeff = fldeff;
  st.state = 0; st.timer = 0; st.invisible = false; st.active = true;
}

/** 1:1 décomp `UpdateFootprintsTireTracksFieldEffect` (610) + FadeFootprintsTireTracks_Step0/1. */
export function UpdateFootprintsEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    if (s.state === 0) {
      // Step0 : attend 40 frames avant le clignotement.
      if (++s.timer > 40) s.state = 1;
      if (oam) oam.visible = !sprite.invisible;
    } else {
      // Step1 : clignote (invisible ^= 1) puis despawn à 56.
      s.invisible = !s.invisible;
      sprite.invisible = s.invisible;
      s.timer++;
      if (oam) oam.visible = !s.invisible;
      if (s.timer > 56) {
        sprite.inUse = false;
        if (oam) { oam.visible = false; oam.tileId = 0; oam.flipH = false; oam.flipV = false; }
        rt.gSprites.delete(s.spriteId);
        s.active = false; s.spriteId = -1; s.oamIndex = -1;
      }
    }
  }
}

export function DestroyAllFootprintsEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

/**
 * field-effect-jump-impact.ts — 1:1 décomp des effets d'impact de SAUT partageant
 * `UpdateJumpImpactEffect` (field_effect_helpers.c:1641) : jump tall/long grass + jump
 * small/big splash. Spawnés quand un object event SAUTE (rebord) et atterrit sur herbe/eau
 * (GroundEffect_JumpOn* via GetGroundEffectFlags_JumpLanding).
 *
 * Sources (1:1 décomp) :
 *   - field_effect_helpers.c:359 FldEff_JumpTallGrass / :468 FldEff_JumpLongGrass /
 *     :684 FldEff_JumpSmallSplash / :701 FldEff_JumpBigSplash / :1641 UpdateJumpImpactEffect.
 *   - data/field_effects/field_effect_objects.h (sPicTable/sAnim/Template Jump*).
 *
 * Comportement 1:1 : sprite tuile-fixe (SetSpritePosToOffsetMapCoords + coordOffsetEnabled),
 * priority = args[3], sJumpElevation = args[2]. UpdateJumpImpactEffect : anim joue UNE fois
 * puis despawn (animEnded) ; sinon SetObjectSubpriorityByElevation(sJumpElevation, sprite, 0).
 *
 * Module générique config-driven (4 effets ≈ identiques : seuls asset/anim/palette/offset/
 * dimensions varient) → pas de dup. Trigger (saut sur rebord) = ad-hoc côté player (landingJump
 * non posé) → hors démo, vérif différée / force-spawn.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';
import { SetObjectSubpriorityByElevation } from './object-events';
// 1:1 décomp constants/field_effects.h. Définis LOCALEMENT (pas importés de field-effect.ts)
// pour rompre le cycle ESM field-effect ↔ jump-impact : CFG les utilise comme clés au
// module-init → TDZ si importés (« Cannot access FLDEFF_JUMP_TALL_GRASS before initialization »).
const FLDEFF_JUMP_TALL_GRASS = 12;
const FLDEFF_JUMP_BIG_SPLASH = 14;
const FLDEFF_JUMP_SMALL_SPLASH = 16;
const FLDEFF_JUMP_LONG_GRASS = 18;

const BASE = '/decomp/em/field_effects';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';

interface JumpCfg {
  tag: string; png: string; pngWidthTiles: number;
  frameWtiles: number; frameHtiles: number;
  shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3;
  /** Index de frame PNG pour chaque slot de sheet (long grass saute le PNG-frame 5). */
  sheetFrames: number[];
  /** sAnim : (slot de sheet, durée game frames). END après → despawn. */
  anim: ReadonlyArray<readonly [number, number]>;
  pal: 'g0' | 'g1';
  dx: number; dy: number;
}

/** 1:1 templates field_effect_objects.h. */
const CFG: Record<number, JumpCfg> = {
  [FLDEFF_JUMP_TALL_GRASS]: {
    tag: 'FE_JUMP_TALL_GRASS', png: `${BASE}/jump_tall_grass.png`, pngWidthTiles: 8,
    frameWtiles: 2, frameHtiles: 1, shape: 1, size: 0,
    sheetFrames: [0, 1, 2, 3], anim: [[0, 8], [1, 8], [2, 8], [3, 8]], pal: 'g1', dx: 8, dy: 12,
  },
  [FLDEFF_JUMP_LONG_GRASS]: {
    tag: 'FE_JUMP_LONG_GRASS', png: `${BASE}/jump_long_grass.png`, pngWidthTiles: 14,
    frameWtiles: 2, frameHtiles: 2, shape: 0, size: 1,
    sheetFrames: [0, 1, 2, 3, 4, 6], anim: [[0, 4], [1, 4], [2, 8], [3, 8], [4, 8], [5, 8]], pal: 'g1', dx: 8, dy: 8,
  },
  [FLDEFF_JUMP_SMALL_SPLASH]: {
    tag: 'FE_JUMP_SMALL_SPLASH', png: `${BASE}/jump_small_splash.png`, pngWidthTiles: 6,
    frameWtiles: 2, frameHtiles: 1, shape: 1, size: 0,
    sheetFrames: [0, 1, 2], anim: [[0, 4], [1, 4], [2, 4]], pal: 'g0', dx: 8, dy: 12,
  },
  [FLDEFF_JUMP_BIG_SPLASH]: {
    tag: 'FE_JUMP_BIG_SPLASH', png: `${BASE}/jump_big_splash.png`, pngWidthTiles: 8,
    frameWtiles: 2, frameHtiles: 2, shape: 0, size: 1,
    sheetFrames: [0, 1, 2, 3], anim: [[0, 8], [1, 8], [2, 8], [3, 8]], pal: 'g0', dx: 8, dy: 8,
  },
};

const _tileStart = new Map<number, number>();   // fldeff → sheet tile start
const _tilesPerFrame = new Map<number, number>(); // fldeff → tiles/frame
let _palG0 = -1, _palG1 = -1;

interface JumpState {
  spriteId: number; oamIndex: number; ticks: number;
  fldeff: number; elevation: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: JumpState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** Reorder PNG row-major → OBJ 1D frame-major, en suivant sheetFrames (PNG frame par slot). */
function reorderSheet(charData: Uint8Array, cfg: JumpCfg): Uint8Array {
  const TILE_BYTES = 32;
  const tpf = cfg.frameWtiles * cfg.frameHtiles;
  const out = new Uint8Array(cfg.sheetFrames.length * tpf * TILE_BYTES);
  let dst = 0;
  for (const pngFrame of cfg.sheetFrames) {
    const colStart = pngFrame * cfg.frameWtiles;
    for (let r = 0; r < cfg.frameHtiles; r++) {
      for (let c = 0; c < cfg.frameWtiles; c++) {
        const srcTileIdx = r * cfg.pngWidthTiles + (colStart + c);
        const srcOff = srcTileIdx * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadJumpImpactEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(CFG[FLDEFF_JUMP_TALL_GRASS].tag) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    try { _palG0 = LoadSpritePalette({ data: await loadGbaPal(`${BASE}/general_0.pal`), tag: TAG_GENERAL_0_PAL }); } catch { _palG0 = 0; }
    try { _palG1 = LoadSpritePalette({ data: await loadGbaPal(`${BASE}/general_1.pal`), tag: TAG_GENERAL_1_PAL }); } catch { _palG1 = 0; }
    for (const key of Object.keys(CFG)) {
      const fldeff = Number(key);
      const cfg = CFG[fldeff];
      const png = await loadIndexedPngStrict(cfg.png, 4);
      const reordered = reorderSheet(png.charData, cfg);
      _tileStart.set(fldeff, LoadSpriteSheet({ data: reordered, size: reordered.length, tag: cfg.tag }));
      _tilesPerFrame.set(fldeff, cfg.frameWtiles * cfg.frameHtiles);
    }
    for (let i = 0; i < POOL_SIZE; i++) _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, fldeff: 0, elevation: 0, active: false };
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_Jump*` : spawn tuile-fixe (coords INTERNAL args[0/1]) + coordOffsetEnabled.
 *  internalX/internalY = gFieldEffectArguments[0/1] (= currentCoords, déjà +MAP_OFFSET). */
export function SpawnJumpImpactEffect(
  rt: DecompRuntime, fldeff: number, internalX: number, internalY: number, elevation: number, priority: number,
): void {
  if (!_initialized) return;
  const cfg = CFG[fldeff];
  const tileStart = _tileStart.get(fldeff);
  if (!cfg || tileStart === undefined) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  const world = SetSpritePosToOffsetMapCoords(internalX, internalY, cfg.dx, cfg.dy);
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank: cfg.pal === 'g0' ? _palG0 : _palG1,
    x: world.x, y: world.y,
    shape: cfg.shape, size: cfg.size,
    priority: Math.max(0, Math.min(3, priority | 0)) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) { sprite.x = world.x; sprite.y = world.y; sprite.coordOffsetEnabled = true; }
  const st = _pool[slot];
  st.spriteId = result.spriteId; st.oamIndex = result.oamIndex; st.ticks = 0;
  st.fldeff = fldeff; st.elevation = elevation; st.active = true;
}

/** 1:1 décomp `UpdateJumpImpactEffect` (field_effect_helpers.c:1641) : anim une fois → despawn ;
 *  sinon SetObjectSubpriorityByElevation(sJumpElevation, sprite, 0). À call/frame. */
export function UpdateJumpImpactEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    const cfg = CFG[s.fldeff];
    const tileStart = _tileStart.get(s.fldeff) ?? 0;
    const tpf = _tilesPerFrame.get(s.fldeff) ?? 1;
    const total = cfg.anim.reduce((a, [, d]) => a + d, 0);
    const oam = rt.gba.oam[s.oamIndex];
    if (s.ticks >= total) {
      // animEnded → FieldEffectStop.
      sprite.inUse = false; oam.visible = false; rt.gSprites.delete(s.spriteId);
      oam.tileId = 0; oam.flipH = false; oam.flipV = false;
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
      continue;
    }
    let acc = 0;
    let slotIdx = cfg.anim[cfg.anim.length - 1][0];
    for (const [sl, d] of cfg.anim) { acc += d; if (s.ticks < acc) { slotIdx = sl; break; } }
    oam.tileId = tileStart + slotIdx * tpf;
    s.ticks++;
    SetObjectSubpriorityByElevation(rt, s.elevation, sprite, 0);
  }
}

export function DestroyAllJumpImpactEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

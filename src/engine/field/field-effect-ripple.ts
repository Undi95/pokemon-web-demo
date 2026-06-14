/**
 * field-effect-ripple.ts — 1:1 décomp `FldEff_Ripple` + `WaitFieldEffectSpriteAnim`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/field_effect_helpers.c:780` (FldEff_Ripple)
 *   - `src/field_effect_helpers.c:1654` (WaitFieldEffectSpriteAnim — despawn fin d'anim)
 *   - `src/event_object_movement.c:8779` (DoRippleFieldEffect — déclenche FLDEFF_RIPPLE)
 *   - `src/data/field_effects/field_effect_objects.h:104-138` (sPicTable_Ripple +
 *     sAnim_Ripple + gFieldEffectObjectTemplate_Ripple)
 *
 * Comportement 1:1 décomp : quand un object event est sur une tuile à ondulations
 * (MetatileBehavior_HasRipples → GetGroundEffectFlags_Ripple), DoRippleFieldEffect
 * spawne une ondulation 16×16 sous l'objet. Anim 8 cmds (frames 0,1,2,3,0,1,2,4 ;
 * durées 12,9,9,9,9,9,11,11 = 79 game frames) puis ANIMCMD_END → auto-despawn
 * (= WaitFieldEffectSpriteAnim attend `animEnded`).
 *
 * Asset : ripple.png (80×16 = 5 frames 16×16 4bpp). Palette : general_1.pal
 * (= FLDEFF_PAL_TAG_GENERAL_1).
 *
 * Archi : `coordOffsetEnabled = TRUE` (sprite MONDE suivant la caméra via
 * gSpriteCoordOffset). Nos NPCs sont ÉCRAN-positionnés → DoRippleFieldEffect
 * convertit la position écran de l'objet en MONDE (screen - gSpriteCoordOffset)
 * avant le spawn (cf. object-events.ts), comme l'inverse de SetSpritePosToOffsetMapCoords.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, IndexOfSpriteTileTag, LoadSpritePalette } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';

const RIPPLE_PNG = '/decomp/em/field_effects/ripple.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';

const TAG_RIPPLE_GFX = 'FIELD_EFFECT_RIPPLE_GFX';
// 1:1 décomp FLDEFF_PAL_TAG_GENERAL_1 — palette partagée des field effects general_1.
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';

const NUM_FRAMES = 5;
const TILES_PER_FRAME = 4;  // 16×16 = 2×2 tiles 4bpp
let _rippleTileStart = -1;
let _ripplePalSlot = 0;

/** 1:1 décomp `sAnim_Ripple` (field_effect_objects.h:112) : frames + durées (game frames).
 *  ANIMCMD_END après → WaitFieldEffectSpriteAnim despawn. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 12 },
  { frameIdx: 1, duration: 9 },
  { frameIdx: 2, duration: 9 },
  { frameIdx: 3, duration: 9 },
  { frameIdx: 0, duration: 9 },
  { frameIdx: 1, duration: 9 },
  { frameIdx: 2, duration: 11 },
  { frameIdx: 4, duration: 11 },
];
const TOTAL_FRAMES = ANIM_SEQUENCE.reduce((a, s) => a + s.duration, 0);  // 79

interface RippleEffectState {
  spriteId: number;
  oamIndex: number;
  ticks: number;
  active: boolean;
}

const POOL_SIZE = 4;  // = plusieurs ondulations simultanées (objets multiples sur l'eau)
const _pool: RippleEffectState[] = [];
let _initialized = false;

// ─── Reset hook : clear _pool au ResetSpriteData (cf. field-effect-jump-dust) ──
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 80×16 = 10×2 tiles row-major. Frame F (16×16) = tiles (row0: 2F,2F+1 ;
 *  row1: 10+2F,10+2F+1) → 1D OBJ frame-major (4 tiles/frame consécutifs). */
function pngTo1dObjLayoutRipple(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const SHEET_TILE_W = 10;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < NUM_FRAMES; f++) {
    const colStart = f * 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const srcTileIdx = r * SHEET_TILE_W + (colStart + c);
        const srcOff = srcTileIdx * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) {
          out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        }
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;

export function preloadRippleEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_RIPPLE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(RIPPLE_PNG, 4);
    const reordered = pngTo1dObjLayoutRipple(png.charData);
    _rippleTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_RIPPLE_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _ripplePalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_Ripple` (field_effect_helpers.c:780). Spawn une ondulation
 *  16×16 à la position MONDE (worldX, worldY) avec subpriority + priority donnés.
 *  worldX/worldY = déjà en coords MONDE (DoRippleFieldEffect a converti écran→monde). */
export function SpawnRippleEffect(
  rt: DecompRuntime, worldX: number, worldY: number, subpriority: number, priority: number,
): void {
  if (!_initialized) return;
  const slot = findFreeSlot();
  if (slot < 0) return;

  const result = rt.CreateSpriteAtOam({
    tileId: _rippleTileStart,
    paletteBank: _ripplePalSlot,
    x: worldX, y: worldY,
    shape: 0, size: 1,  // 16×16 (SQUARE, SMALL)
    priority: Math.max(0, Math.min(3, priority | 0)) as 0 | 1 | 2 | 3,
    paletteMode: 0,
    affineMode: 0,
  });
  // 1:1 décomp `sprite->coordOffsetEnabled = TRUE` (field_effect_helpers.c:786).
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = worldX; sprite.y = worldY;
    sprite.coordOffsetEnabled = true;
    sprite.subpriority = subpriority & 0xFF;
  }
  const oam = rt.gba.oam[result.oamIndex];
  if (oam) oam.subpriority = subpriority & 0xFF;

  const state = _pool[slot];
  state.spriteId = result.spriteId;
  state.oamIndex = result.oamIndex;
  state.ticks = 0;
  state.active = true;
}

/** 1:1 décomp `WaitFieldEffectSpriteAnim` (field_effect_helpers.c:1654) : tick l'anim ;
 *  despawn quand l'anim atteint ANIMCMD_END. À call chaque frame depuis l'overworld. */
export function UpdateRippleEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; s.spriteId = -1; continue; }
    // Frame courante depuis la table d'anim (durées cumulées).
    let acc = 0;
    let frameIdx = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
    for (const step of ANIM_SEQUENCE) {
      acc += step.duration;
      if (s.ticks < acc) { frameIdx = step.frameIdx; break; }
    }
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _rippleTileStart + frameIdx * TILES_PER_FRAME;
    s.ticks++;
    if (s.ticks >= TOTAL_FRAMES) {
      // animEnded → FieldEffectStop (despawn).
      sprite.inUse = false;
      oam.visible = false;
      oam.tileId = 0;
      rt.gSprites.delete(s.spriteId);
      s.active = false;
      s.spriteId = -1;
      s.oamIndex = -1;
    }
  }
}

export function DestroyAllRippleEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false;
    s.spriteId = -1;
  }
}

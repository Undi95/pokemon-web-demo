/**
 * field-effect-bubbles.ts — 1:1 décomp `FldEff_Bubbles` + `UpdateBubblesFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:1197-1230` (sPicTable/sAnim/Template Bubbles)
 *   - `src/field_effect_helpers.c:1258` (FldEff_Bubbles)
 *   - `src/field_effect_helpers.c:1273` (UpdateBubblesFieldEffect)
 *   - `src/event_object_movement.c:8016` (GroundEffect_Seaweed → args=currentCoords + FldEff_Bubbles)
 *
 * Comportement 1:1 : colonne de bulles (16×32) qui apparaît quand un object event marche sur
 * des algues (seaweed) en plongée. Spawn aux coords MAP de l'objet (offset 8,0), priority 1,
 * subpriority 82. Anim 8 frames (durées 4,4,4,6,6,4,4,4) puis ANIMCMD_END → despawn quand
 * l'anim finit OU que le sprite sort de l'écran.
 *
 * ⚠️ BUG 1:1 RÉPLIQUÉ (Game Freak) : le commentaire décomp dit « Move up 1 every other frame »
 * mais le masque est `sY &= (1 << 8)` (= 256) au lieu de `& 0xFF` → l'accumulateur fractionnaire
 * est effacé chaque frame, `sY >> 8` vaut TOUJOURS 0, donc les bulles NE MONTENT JAMAIS. On
 * réplique l'arithmétique exacte (pas de « correction ») — cf. [[feedback-suis-la-decomp-pas-approximer]].
 *
 * Asset : bubbles.png (128×32 = 8 frames 16×32 côte à côte). Palette : general_0.pal.
 */

import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';

const BUBBLES_PNG = '/decomp/em/field_effects/bubbles.png';
const GENERAL_0_PAL = '/decomp/em/field_effects/general_0.pal';
const TAG_BUBBLES_GFX = 'FIELD_EFFECT_BUBBLES_GFX';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

const NUM_FRAMES = 8;
const FRAME_W_TILES = 2;   // 16px
const FRAME_H_TILES = 4;   // 32px
const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;  // 8 (16×32)
const PNG_W_TILES = 16;    // 128px
let _bubblesTileStart = -1;
let _bubblesPalSlot = -1;

/** 1:1 décomp `sAnim_Bubbles` : 8 frames, durées 4,4,4,6,6,4,4,4, ANIMCMD_END → one-shot. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 4 }, { frameIdx: 1, duration: 4 }, { frameIdx: 2, duration: 4 },
  { frameIdx: 3, duration: 6 }, { frameIdx: 4, duration: 6 }, { frameIdx: 5, duration: 4 },
  { frameIdx: 6, duration: 4 }, { frameIdx: 7, duration: 4 },
];
const ANIM_TOTAL = ANIM_SEQUENCE.reduce((a, s) => a + s.duration, 0); // 36

interface BubblesState {
  spriteId: number; oamIndex: number; ticks: number; sY: number; active: boolean;
}
const POOL_SIZE = 4;
const _pool: BubblesState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 128×32 = 16×4 tiles row-major. Frame F (16×32 = 2×4 tiles) = colonnes 2F,2F+1 sur 4
 *  rows → 1D OBJ frame-major (8 tiles/frame consécutifs, ordre row-major dans la frame). */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let r = 0; r < FRAME_H_TILES; r++) {
      for (let c = 0; c < FRAME_W_TILES; c++) {
        const pngTileIdx = r * PNG_W_TILES + (f * FRAME_W_TILES + c);
        const objTileIdx = f * TILES_PER_FRAME + r * FRAME_W_TILES + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadBubblesEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_BUBBLES_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(BUBBLES_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _bubblesTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_BUBBLES_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _bubblesPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, ticks: 0, sY: 0, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `UpdateObjectEventSpriteInvisibility(sprite, FALSE)` (event_object_movement.c:8562). */
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

/** 1:1 décomp `FldEff_Bubbles` (field_effect_helpers.c:1258). mapX/mapY = coords MAP de l'objet
 *  (GroundEffect_Seaweed → currentCoords). */
export function SpawnBubblesEffect(rt: DecompRuntime, mapX: number, mapY: number): void {
  if (!_initialized) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  // 1:1 : SetSpritePosToOffsetMapCoords(&args[0], &args[1], 8, 0) → coords MONDE.
  const world = SetSpritePosToOffsetMapCoords(mapX, mapY, 8, 0);
  const result = rt.CreateSpriteAtOam({
    tileId: _bubblesTileStart,
    paletteBank: _bubblesPalSlot,
    x: world.x, y: world.y,
    shape: 2, size: 2,  // 16×32 (tall)
    priority: 1,        // 1:1 : sprite->oam.priority = 1.
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = world.x; sprite.y = world.y;
    // 1:1 : sprite->coordOffsetEnabled = TRUE.
    sprite.coordOffsetEnabled = true;
    sprite.subpriority = 82 & 0xFF;  // 1:1 : CreateSpriteAtEnd(..., 82).
  }
  const oam = rt.gba.oam[result.oamIndex];
  if (oam) oam.subpriority = 82 & 0xFF;
  const state = _pool[slot];
  state.spriteId = result.spriteId; state.oamIndex = result.oamIndex;
  state.ticks = 0; state.sY = 0; state.active = true;
}

/** 1:1 décomp `UpdateBubblesFieldEffect` (field_effect_helpers.c:1273). À call/frame. */
export function UpdateBubblesEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; s.spriteId = -1; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    // 1:1 BUG : sY += 128 ; sY &= 256 (→ toujours 0) ; y -= sY>>8 (→ toujours 0). Pas de montée.
    s.sY = (s.sY + ((1 << 8) / 2)) & (1 << 8);
    sprite.y -= s.sY >> 8;
    // Frame courante depuis la table d'anim (durées cumulées).
    let acc = 0;
    let frameIdx = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
    for (const step of ANIM_SEQUENCE) {
      acc += step.duration;
      if (s.ticks < acc) { frameIdx = step.frameIdx; break; }
    }
    oam.tileId = _bubblesTileStart + frameIdx * TILES_PER_FRAME;
    s.ticks++;
    const animEnded = s.ticks >= ANIM_TOTAL;
    // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE).
    updateSpriteInvisibilityOffscreen(rt, sprite);
    if (sprite.invisible) oam.visible = false;
    // 1:1 : if (sprite->invisible || sprite->animEnded) FieldEffectStop.
    if (sprite.invisible || animEnded) {
      sprite.inUse = false; oam.visible = false; oam.tileId = 0;
      rt.gSprites.delete(s.spriteId);
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
    }
  }
}

export function DestroyAllBubblesEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

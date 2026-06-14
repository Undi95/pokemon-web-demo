/**
 * field-effect-sparkle.ts — 1:1 décomp FLDEFF_BERRY_TREE_GROWTH_SPARKLE.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/field_effect_helpers.c:1288` FldEff_BerryTreeGrowthSparkle
 *   - `src/field_effect_helpers.c:1654` WaitFieldEffectSpriteAnim (despawn à animEnded)
 *   - `src/data/field_effects/field_effect_objects.h:893` sPicTable_Sparkle (6 frames 16×16)
 *   - `src/data/field_effects/field_effect_objects.h:902` sAnim_Sparkle (FRAME/LOOP/END)
 *   - template gFieldEffectObjectTemplate_Sparkle : oam 16×16, callback WaitFieldEffectSpriteAnim
 *
 * Comportement 1:1 : au passage de stade d'un berry tree (croissance), une étoile
 * scintille au-dessus de l'arbre puis disparaît quand son anim se termine.
 *
 * Note archi (identique à field-effect-grass.ts / arrow / emote) : notre
 * BuildOamBuffer n'applique pas `coordOffsetEnabled` → tracking caméra MANUEL
 * (recompute la position chaque frame depuis la tuile + l'offset caméra). L'anim
 * (sAnim_Sparkle) est jouée par un schedule plat 1:1 (frame, durée) au lieu du
 * système d'anim sprite, pour la même raison.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag, IndexOfSpritePaletteTag } from '../system/sprite';
import { loadIndexedPngStrict } from '../gba/png-loader';
import { GetCameraTopLeftCoords, gTotalCamera, GetBgVofsBaseline } from './field-camera';

const SPARKLE_PNG = '/decomp/em/field_effects/sparkle.png';
const TAG_SPARKLE_GFX = 'FIELD_EFFECT_SPARKLE_GFX';
/** Palette : sparkle.png == palette dirt_pile == slot NPC_2 (= berry palette slot 3,
 *  vérifié à l'octet près). On réutilise le tag SLOT_3 des berry trees → bank borné
 *  partagé (1:1 décomp : sparkle oam.paletteNum pointe un slot NPC partagé). */
const TAG_SPARKLE_PAL = 'NPC_PAL_BERRY_SLOT_3';

const TILE_BYTES = 32;
const TILES_PER_FRAME = 4;   // 16×16 = 2×2 tiles 4bpp
const NUM_FRAMES = 6;

let _sparkleTileStart = -1;
let _sparklePalSlot = -1;
let _initialized = false;
let _initPromise: Promise<void> | null = null;

// ─── Anim 1:1 décomp sAnim_Sparkle (field_effect_objects.h:902) ─────────────
// Bloc1 : FRAME(0..5, 8) ; LOOP(0) (= 0 répétition → bloc joué 1×).
// Bloc2 : FRAME(0..5, 4) ; LOOP(3) (= bloc joué 4× au total).
// Bloc3 : FRAME(0..5, 8) ; END.  Total = 48 + 96 + 48 = 192 ticks.
const SPARKLE_ANIM: ReadonlyArray<{ frame: number; dur: number }> = (() => {
  const a: { frame: number; dur: number }[] = [];
  for (let f = 0; f < NUM_FRAMES; f++) a.push({ frame: f, dur: 8 });
  for (let pass = 0; pass < 4; pass++) for (let f = 0; f < NUM_FRAMES; f++) a.push({ frame: f, dur: 4 });
  for (let f = 0; f < NUM_FRAMES; f++) a.push({ frame: f, dur: 8 });
  return a;
})();
const SPARKLE_TOTAL_TICKS = SPARKLE_ANIM.reduce((s, e) => s + e.dur, 0);

// ─── Pool (overlap possible si plusieurs arbres poussent en même temps) ─────
interface SparkleState {
  spriteId: number;
  oamIndex: number;
  worldX: number;
  worldY: number;
  offsetXAtShow: number;
  offsetYAtShow: number;
  ticks: number;
  active: boolean;
}
const POOL_SIZE = 4;
const _pool: SparkleState[] = [];

// Reset hook (= 1:1 grass : clear pool au ResetSpriteData ; NE PAS reset _initialized
// — les assets sont re-chargés au map load via preloadSparkleEffect/`stillAlloc`).
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

// ─── PNG loader (= 6 frames concaténés en OBJ 1D layout) ────────────────────
/** sparkle.png = 96×16 = 12×2 tiles row-major. Frame F = cols 2F,2F+1 sur 2 rows. */
function pngTo1dObjLayoutSparkle(charData: Uint8Array): Uint8Array {
  const PNG_W_TILES = 12, FW = 2, FH = 2;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let row = 0; row < FH; row++) {
      for (let col = 0; col < FW; col++) {
        const pngTileIdx = row * PNG_W_TILES + f * FW + col;
        const objTileIdx = f * TILES_PER_FRAME + row * FW + col;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

export function preloadSparkleEffect(): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SPARKLE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(SPARKLE_PNG, 4);
    const reordered = pngTo1dObjLayoutSparkle(png.charData);
    _sparkleTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SPARKLE_GFX });
    // Palette partagée slot 3 (= dirt) : réutilise si déjà chargée par un berry tree.
    const existing = IndexOfSpritePaletteTag(TAG_SPARKLE_PAL);
    _sparklePalSlot = existing !== 0xFF ? existing : LoadSpritePalette({ data: png.palette, tag: TAG_SPARKLE_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, worldX: 0, worldY: 0, offsetXAtShow: 0, offsetYAtShow: 0, ticks: 0, active: false };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `FldEff_BerryTreeGrowthSparkle` (field_effect_helpers.c:1288).
 *  args[0]=mapX, args[1]=mapY (LOGICAL), args[2]=subpriority, args[3]=oam.priority.
 *  Spawn l'étoile au-dessus de l'arbre ; despawn à la fin de son anim. */
export function FldEff_BerryTreeGrowthSparkle(rt: DecompRuntime, args: ReadonlyArray<number>): number {
  if (!_initialized) { void preloadSparkleEffect(); return 64; }
  const slot = findFreeSlot();
  if (slot < 0) return 64;
  // 1:1 décomp `SetSpritePosToOffsetMapCoords(&x, &y, 8, 4)` : tuile + (8,4) px.
  // args[0/1] = currentCoords du berry tree, déjà en INTERNAL (= +MAP_OFFSET, comme
  // la décomp), tout comme cam.x/y (GetCameraTopLeftCoords) → pas de re-offset.
  const cam = GetCameraTopLeftCoords();
  const worldX = ((args[0] ?? 0) - cam.x) * 16 + 8;
  const worldY = ((args[1] ?? 0) - cam.y) * 16 + 4;
  const result = rt.CreateSpriteAtOam({
    tileId: _sparkleTileStart,
    paletteBank: _sparklePalSlot,
    x: 0, y: 0,
    shape: 0, size: 1,           // 16×16 (SQUARE / SMALL)
    priority: args[3] ?? 1,      // 1:1 décomp sprite->oam.priority = gFieldEffectArguments[3]
    paletteMode: 0,
    affineMode: 0,
    fromEnd: true,               // 1:1 CreateSpriteAtEnd
  });
  const s = _pool[slot];
  s.spriteId = result.spriteId;
  s.oamIndex = result.oamIndex;
  s.worldX = worldX;
  s.worldY = worldY;
  s.offsetXAtShow = gTotalCamera.pixelOffsetX;
  s.offsetYAtShow = gTotalCamera.pixelOffsetY;
  s.ticks = 0;
  s.active = true;
  return 64;
}

/** À call chaque frame depuis MainCB2_Overworld (= tick anim + tracking caméra +
 *  despawn). 1:1 WaitFieldEffectSpriteAnim : despawn quand l'anim se termine. */
export function UpdateSparkleEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    // Frame courant depuis ticks (schedule plat 1:1 sAnim_Sparkle).
    let acc = 0, frameIdx = 0;
    for (const step of SPARKLE_ANIM) {
      acc += step.dur;
      if (s.ticks < acc) { frameIdx = step.frame; break; }
    }
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _sparkleTileStart + frameIdx * TILES_PER_FRAME;
    // Tracking caméra (= coordOffsetEnabled manuel).
    sprite.x = s.worldX + (gTotalCamera.pixelOffsetX - s.offsetXAtShow);
    sprite.y = s.worldY + (gTotalCamera.pixelOffsetY - s.offsetYAtShow) - GetBgVofsBaseline();
    s.ticks++;
    // 1:1 WaitFieldEffectSpriteAnim : animEnded → FieldEffectStop (despawn).
    if (s.ticks >= SPARKLE_TOTAL_TICKS) {
      sprite.inUse = false;
      oam.visible = false;
      rt.gSprites.delete(s.spriteId);
      oam.tileId = 0; oam.flipH = false; oam.flipV = false;
      s.active = false; s.spriteId = -1; s.oamIndex = -1;
    }
  }
}

export function DestroyAllSparkleEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

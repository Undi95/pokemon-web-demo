/**
 * field-effect-ash.ts — 1:1 décomp `StartAshFieldEffect` + `FldEff_Ash` + `UpdateAshFieldEffect`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h` (sPicTable/sAnim/Template Ash)
 *   - `src/field_effect_helpers.c:915` (StartAshFieldEffect)
 *   - `src/field_effect_helpers.c:926` (FldEff_Ash)
 *   - `src/field_effect_helpers.c:945` (UpdateAshFieldEffect + _Wait/_Show/_End)
 *   - `src/field_tasks.c:765` (trigger : pas sur ashgrass Fallarbor/Lavaridge — port séparé)
 *
 * Comportement 1:1 : quand le joueur marche sur de l'herbe à cendre (Route 113, Fallarbor),
 * un nuage de cendre 16×16 apparaît + la tuile « ashgrass » est REMPLACÉE par l'herbe normale
 * (révèle le sol). Machine à 3 états :
 *   - Wait : invisible, anim en pause, décrémente sDelay → état Show quand 0.
 *   - Show : visible, anim repart ; MapGridSetMetatileIdAt + CurrentMapDrawMetatileAt (révèle la
 *     tuile) + pose triggerGroundEffectsOnMove sur le joueur ; → état End.
 *   - End  : UpdateObjectEventSpriteInvisibility ; despawn quand l'anim finit.
 *
 * Asset : ash.png (80×16 = 5 frames 16×16, layout = ripple). Palette : general_1.pal.
 */

import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../gba/png-loader';
import {
  SetSpritePosToOffsetMapCoords, GetCameraTopLeftCoords, CurrentMapDrawMetatileAt,
} from './field-camera';
import { MapGridSetMetatileIdAt } from './map-loader';
import { gObjectEvents } from './object-events';
import { gPlayerAvatar } from './player-avatar';

const ASH_PNG = '/decomp/em/field_effects/ash.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';
const TAG_ASH_GFX = 'FIELD_EFFECT_ASH_GFX';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

const NUM_FRAMES = 5;
const TILES_PER_FRAME = 4;   // 16×16
const PNG_W_TILES = 10;      // 80px
let _ashTileStart = -1;
let _ashPalSlot = -1;

/** 1:1 décomp `sAnim_Ash` : 5 frames, durées 12,12,8,12,12, ANIMCMD_END → one-shot. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 12 }, { frameIdx: 1, duration: 12 }, { frameIdx: 2, duration: 8 },
  { frameIdx: 3, duration: 12 }, { frameIdx: 4, duration: 12 },
];
const ANIM_TOTAL = ANIM_SEQUENCE.reduce((a, s) => a + s.duration, 0); // 56

// États (1:1 gAshFieldEffectFuncs[]).
const STATE_WAIT = 0, STATE_SHOW = 1, STATE_END = 2;

interface AshState {
  spriteId: number; oamIndex: number; active: boolean;
  sState: number; sX: number; sY: number; sMetatileId: number; sDelay: number;
  animTicks: number; animPaused: boolean;
}
const POOL_SIZE = 4;
const _pool: AshState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 80×16 = 10×2 tiles row-major. Frame F (16×16) = tiles (row0: 2F,2F+1 ; row1: 10+2F,
 *  10+2F+1) → 1D OBJ frame-major (4 tiles/frame). (= reorder ripple.) */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < NUM_FRAMES; f++) {
    const colStart = f * 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const srcTileIdx = r * PNG_W_TILES + (colStart + c);
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
export function preloadAshEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_ASH_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(ASH_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _ashTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_ASH_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _ashPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, active: false, sState: 0, sX: 0, sY: 0, sMetatileId: 0, sDelay: 0, animTicks: 0, animPaused: true };
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

/** 1:1 décomp `StartAshFieldEffect(x, y, metatileId, delay)` (field_effect_helpers.c:915). x/y =
 *  coords MAP (avec MAP_OFFSET). Entrée appelée par field_tasks.c (ashgrass) — exportée pour
 *  ce port futur ; ici on passe par FieldEffectStart(FLDEFF_ASH) via les mêmes args. */
export function StartAshFieldEffect(rt: DecompRuntime, x: number, y: number, metatileId: number, delay: number): void {
  SpawnAshEffect(rt, x, y, 82, 1, metatileId, delay);
}

/** 1:1 décomp `FldEff_Ash` (field_effect_helpers.c:926). args[0/1]=x/y (map), [2]=subprio,
 *  [3]=priority, [4]=metatileId, [5]=delay. */
export function SpawnAshEffect(rt: DecompRuntime, x: number, y: number, subpriority: number, priority: number, metatileId: number, delay: number): void {
  if (!_initialized) return;
  const slot = findFreeSlot();
  if (slot < 0) return;
  // 1:1 : SetSpritePosToOffsetMapCoords(&x, &y, 8, 8) (x/y modifiés en place → coords MONDE).
  const world = SetSpritePosToOffsetMapCoords(x, y, 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _ashTileStart,
    paletteBank: _ashPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: Math.max(0, Math.min(3, priority | 0)) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = world.x; sprite.y = world.y;
    sprite.coordOffsetEnabled = true;  // 1:1 décomp.
    sprite.subpriority = subpriority & 0xFF;
    sprite.invisible = true;           // état Wait commence invisible.
  }
  const oam = rt.gba.oam[result.oamIndex];
  if (oam) { oam.subpriority = subpriority & 0xFF; oam.visible = false; }
  const s = _pool[slot];
  s.spriteId = result.spriteId; s.oamIndex = result.oamIndex; s.active = true;
  s.sState = STATE_WAIT; s.sX = x; s.sY = y; s.sMetatileId = metatileId; s.sDelay = delay;
  s.animTicks = 0; s.animPaused = true;
}

/** 1:1 décomp `UpdateAshFieldEffect` (field_effect_helpers.c:945). À call/frame. */
export function UpdateAshEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; s.spriteId = -1; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    // ── État (1:1 gAshFieldEffectFuncs[sState]) ──
    if (s.sState === STATE_WAIT) {
      // 1:1 UpdateAshFieldEffect_Wait : invisible + animPaused, décrémente sDelay.
      sprite.invisible = true; oam.visible = false; s.animPaused = true;
      if (--s.sDelay === 0) s.sState = STATE_SHOW;
    } else if (s.sState === STATE_SHOW) {
      // 1:1 UpdateAshFieldEffect_Show : visible, anim repart, révèle la tuile, trigger joueur.
      sprite.invisible = false; s.animPaused = false;
      MapGridSetMetatileIdAt(s.sX, s.sY, s.sMetatileId);
      const cam = GetCameraTopLeftCoords();
      CurrentMapDrawMetatileAt(cam.x, cam.y, s.sX, s.sY);
      const player = gObjectEvents[gPlayerAvatar.objectEventId];
      if (player) player.triggerGroundEffectsOnMove = true;
      s.sState = STATE_END;
    } else {
      // 1:1 UpdateAshFieldEffect_End : invis offscreen ; despawn quand l'anim finit.
      updateSpriteInvisibilityOffscreen(rt, sprite);
      if (s.animTicks >= ANIM_TOTAL) {
        sprite.inUse = false; oam.visible = false; oam.tileId = 0;
        rt.gSprites.delete(s.spriteId);
        s.active = false; s.spriteId = -1; s.oamIndex = -1;
        continue;
      }
    }
    // ── Anim (1:1 AnimateSprite, avance seulement si !animPaused) ──
    if (!s.animPaused) {
      let acc = 0;
      let frameIdx = ANIM_SEQUENCE[ANIM_SEQUENCE.length - 1].frameIdx;
      for (const step of ANIM_SEQUENCE) {
        acc += step.duration;
        if (s.animTicks < acc) { frameIdx = step.frameIdx; break; }
      }
      oam.tileId = _ashTileStart + frameIdx * TILES_PER_FRAME;
      if (s.animTicks < ANIM_TOTAL) s.animTicks++;
    }
    oam.visible = !sprite.invisible;
  }
}

export function DestroyAllAshEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}

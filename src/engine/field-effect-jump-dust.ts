/**
 * field-effect-jump-dust.ts — 1:1 décomp ledge landing dust cloud anim.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/event_object_movement.c:7997` (GroundEffect_JumpLandingDust)
 *   - `src/data/field_effects/field_effect_objects.h:278-300` (sPicTable_GroundImpactDust + sAnim + Template)
 *   - `src/field_effect_helpers.c` (FldEff_Dust)
 *
 * Comportement 1:1 décomp :
 *   - Quand player atterrit après ledge jump (= GROUND_EFFECT_FLAG_LAND_ON_NORMAL_GROUND
 *     trigger), spawn un sprite 16×8 dust cloud.
 *   - Anim : 3 frames × 8 game frames = 24 total (~0.4s).
 *
 * Asset : ground_impact_dust.png (= 48×8 = 3 frames 16×8 4bpp).
 * Palette : general_0.pal (= déjà chargée par field-effect-arrow).
 */

import type { DecompRuntime } from './decomp-runtime';
import { LoadSpriteSheet } from './sprite';
import { loadIndexedPngStrict } from './gba/png-loader';
import { GetCameraTopLeftCoords, gTotalCamera, GetBgVofsBaseline } from './field-camera';
import { MAP_OFFSET } from './map-loader';

const DUST_PNG = '/decomp/em/field_effects/ground_impact_dust.png';

/** 1:1 STRICT décomp LoadSpriteSheet auto-alloue tileStart APRÈS reserved zone.
 *  Palette = bank 0 (= shared with player) car 1:1 décomp `FLDEFF_PAL_TAG_GENERAL_0`
 *  partagée. paletteBank=0 (= PLAYER_PALETTE_BANK) intentionnel. */
const TAG_DUST_GFX = 'FIELD_EFFECT_JUMP_DUST_GFX';
let _dustTileStart = -1;
const TILES_PER_FRAME = 2;  // 16×8 = 2x1 tiles 4bpp
const NUM_FRAMES = 3;
const DUST_PALETTE_BANK = 0;  // 1:1 décomp shared with player

/** sAnim_GroundImpactDust : 3 frames × 8 game frames each. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 0, duration: 8 },
  { frameIdx: 1, duration: 8 },
  { frameIdx: 2, duration: 8 },
];
const TOTAL_FRAMES = 24;

interface DustEffectState {
  spriteId: number;
  oamIndex: number;
  worldX: number;
  worldY: number;
  offsetXAtShow: number;
  offsetYAtShow: number;
  ticks: number;
  active: boolean;
}

const POOL_SIZE = 2;  // = max 2 dust simultanés (= rare, jump séquentiel)
const _pool: DustEffectState[] = [];
let _initialized = false;

/** PNG layout 48×8 = 6×1 tiles. Each frame = 2×1 tiles consecutive.
 *  Frame F (= 0..2) → PNG tiles 2F, 2F+1. */
function pngTo1dObjLayoutDust(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let t = 0; t < TILES_PER_FRAME; t++) {
      const pngTileIdx = f * TILES_PER_FRAME + t;
      const objTileIdx = f * TILES_PER_FRAME + t;
      out.set(
        charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
        objTileIdx * TILE_BYTES,
      );
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;

export function preloadJumpDustEffect(rt: DecompRuntime): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(DUST_PNG, 4);
    const reordered = pngTo1dObjLayoutDust(png.charData);
    _dustTileStart = LoadSpriteSheet({
      data: reordered, size: reordered.length, tag: TAG_DUST_GFX,
    });
    // Palette : shared with player (= bank 0). Pas de re-upload nécessaire.
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = {
        spriteId: -1, oamIndex: -1, worldX: 0, worldY: 0,
        offsetXAtShow: 0, offsetYAtShow: 0, ticks: 0, active: false,
      };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}

/** 1:1 décomp `GroundEffect_JumpLandingDust` (event_object_movement.c:7997).
 *  Spawn un dust cloud 16×8 à la position du player APRÈS ledge jump landing. */
export function SpawnJumpLandingDust(rt: DecompRuntime, mapX: number, mapY: number): void {
  if (!_initialized) return;
  const slot = findFreeSlot();
  if (slot < 0) return;

  const cam = GetCameraTopLeftCoords();
  const npcGBackupCol = mapX + MAP_OFFSET;
  const npcGBackupRow = mapY + MAP_OFFSET;
  // Dust 16×8 → place à tile center horizontalement + tile bottom verticalement
  // (= au pied du player, simulating impact at ground).
  const worldX = (npcGBackupCol - cam.x) * 16 + 8;
  const worldY = (npcGBackupRow - cam.y) * 16 + 12;  // = près du bas de tile (= sol)

  const result = rt.CreateSpriteAtOam({
    tileId: _dustTileStart,
    paletteBank: DUST_PALETTE_BANK,
    x: 0, y: 0,
    shape: 1, size: 0,  // 16×8 (= shape WIDE, size SMALL)
    priority: 1,         // = player priority 2 → dust derrière player (sol)
    paletteMode: 0,
    affineMode: 0,
  });

  const state = _pool[slot];
  state.spriteId = result.spriteId;
  state.oamIndex = result.oamIndex;
  state.worldX = worldX;
  state.worldY = worldY;
  state.offsetXAtShow = gTotalCamera.pixelOffsetX;
  state.offsetYAtShow = gTotalCamera.pixelOffsetY;
  state.ticks = 0;
  state.active = true;
}

/** À call chaque frame APRÈS PlayerStep depuis MainCB2_Overworld. */
export function UpdateJumpDustEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    let acc = 0;
    let frameIdx = 0;
    for (const step of ANIM_SEQUENCE) {
      acc += step.duration;
      if (s.ticks < acc) { frameIdx = step.frameIdx; break; }
    }
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _dustTileStart + frameIdx * TILES_PER_FRAME;
    sprite.x = s.worldX + (gTotalCamera.pixelOffsetX - s.offsetXAtShow);
    sprite.y = s.worldY + (gTotalCamera.pixelOffsetY - s.offsetYAtShow) - GetBgVofsBaseline();
    s.ticks++;
    if (s.ticks >= TOTAL_FRAMES) {
      sprite.inUse = false;
      oam.visible = false;
      rt.gSprites.delete(s.spriteId);
      oam.tileId = 0;
      s.active = false;
      s.spriteId = -1;
      s.oamIndex = -1;
    }
  }
}

export function DestroyAllJumpDustEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) {
      sprite.inUse = false;
      rt.gba.oam[s.oamIndex].visible = false;
    }
    s.active = false;
    s.spriteId = -1;
  }
}

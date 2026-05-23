/**
 * field-effect-grass.ts — 1:1 décomp tall grass rustle anim.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h:71-100` (sPicTable_TallGrass + sAnim_TallGrass + gFieldEffectObjectTemplate_TallGrass)
 *   - `src/event_object_movement.c:7815` (GroundEffect_StepOnTallGrass)
 *   - `src/field_effect_helpers.c:291` (FldEff_TallGrass)
 *
 * Comportement 1:1 décomp :
 *   - Player walks INTO tile MB_TALL_GRASS → sprite 16×16 anime 5 frames
 *     (= rustle effect) puis disparaît.
 *   - Sprite tracks player tile (= reste visible tant que player sur tile,
 *     mais Phase 4.10 first cut : auto-destruct après 50 game frames).
 *
 * Anim 1:1 décomp `sAnim_TallGrass` (field_effect_objects.h:81-89) :
 *   ANIMCMD_FRAME(1, 10), ANIMCMD_FRAME(2, 10), ANIMCMD_FRAME(3, 10),
 *   ANIMCMD_FRAME(4, 10), ANIMCMD_FRAME(0, 10), ANIMCMD_END.
 *   Total = 50 game frames @ 60fps ≈ 0.83 sec.
 *
 * PNG layout : tall_grass.png = 80×16 = 5 frames × 16×16. 4 tiles per frame.
 * Total = 20 tiles. Allocate at OBJ tile 952..971 (= just before warp arrow 992).
 *
 * Phase 4.10 simplification (vs décomp) :
 *   - Pas de tracking par-NPC (= décomp tracks via objEvent localId/mapNum).
 *     Notre impl : sprite spawn + anim + auto-destroy par timer.
 *   - Pas de SeekSpriteAnim "skip to end" pour spawn cases.
 *   - Multi-instance : pool de 4 sprites pour permettre overlap (= player walks
 *     fast through grass, plusieurs effects actifs simultanément).
 */

import type { DecompRuntime } from './decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette } from './sprite';
import { loadIndexedPngStrict } from './gba/png-loader';
import { GetCameraTopLeftCoords, gTotalCamera, GetBgVofsBaseline } from './field-camera';
import { MAP_OFFSET } from './map-loader';

const TALL_GRASS_PNG = '/decomp/em/field_effects/tall_grass.png';
const GENERAL_1_PAL  = '/decomp/em/field_effects/general_1.pal';

// ─── OBJ allocation (= 20 tiles avant warp arrow 992) ──────────────────────

/** 1:1 STRICT décomp LoadSpriteSheet + LoadSpritePalette. tileStart + palSlot
 *  alloués dynamiquement via tag system → safe vs reserved player zone. */
const TAG_TALL_GRASS_GFX = 'FIELD_EFFECT_TALL_GRASS_GFX';
const TAG_TALL_GRASS_PAL = 'FIELD_EFFECT_TALL_GRASS_PAL';
let _tallGrassTileStart = -1;
let _tallGrassPalSlot = -1;
const TILES_PER_FRAME = 4;  // 16×16 = 2x2 tiles 4bpp
const NUM_FRAMES = 5;

// ─── Anim spec 1:1 décomp ──────────────────────────────────────────────────

/** sAnim_TallGrass : (frameIdx, gameFramesDuration) sequence. */
const ANIM_SEQUENCE: ReadonlyArray<{ frameIdx: number; duration: number }> = [
  { frameIdx: 1, duration: 10 },
  { frameIdx: 2, duration: 10 },
  { frameIdx: 3, duration: 10 },
  { frameIdx: 4, duration: 10 },
  { frameIdx: 0, duration: 10 },
];

// ─── Module state ─────────────────────────────────────────────────────────

interface GrassEffectState {
  spriteId: number;
  oamIndex: number;
  /** Pixel-space world position relative à cam AT SHOW TIME (= same pattern
   *  qu'arrow). sprite.x = worldX + (gTotalCamera.offX - offsetXAtShow). */
  worldX: number;
  worldY: number;
  offsetXAtShow: number;
  offsetYAtShow: number;
  /** Game frame counter : 0..49 (= 5 frames × 10). Free quand >= 50. */
  ticks: number;
  active: boolean;
}

/** Pool de 4 effects (= overlap quand player run dans grass). */
const POOL_SIZE = 4;
const _pool: GrassEffectState[] = [];
let _initialized = false;

// ─── PNG loader (= 5 frames concaténés en OBJ 1D layout) ──────────────────

/** PNG layout 80×16 = 10×2 tiles row-major. Each frame F (= 0..4) occupe
 *  PNG cols 2F, 2F+1 sur 2 rows = 4 tiles. */
function pngTo1dObjLayoutGrass(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = 2;
  const FRAME_H_TILES = 2;
  const PNG_WIDTH_TILES = 10;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        const pngTileIdx = row * PNG_WIDTH_TILES + (f * FRAME_W_TILES) + col;
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES,
        );
      }
    }
  }
  return out;
}

/** Parse une .pal file format JASC 16 colors → Uint16Array RGB15. */
async function loadGeneralPal1(): Promise<Uint16Array> {
  const text = await fetch(GENERAL_1_PAL).then(r => r.text());
  const lines = text.split(/\r?\n/);
  // JASC-PAL lines 4..19 = 16 colors "R G B" 0-255.
  const out = new Uint16Array(16);
  for (let i = 0; i < 16; i++) {
    const line = lines[3 + i] ?? '';
    const m = line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)/);
    if (!m) continue;
    const r = Number(m[1]) >> 3;
    const g = Number(m[2]) >> 3;
    const b = Number(m[3]) >> 3;
    out[i] = r | (g << 5) | (b << 10);
  }
  return out;
}

// ─── Init ──────────────────────────────────────────────────────────────────

let _initPromise: Promise<void> | null = null;

export function preloadTallGrassEffect(rt: DecompRuntime): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(TALL_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayoutGrass(png.charData);
    // 1:1 STRICT décomp `LoadSpriteSheet(sFieldEffectObjectGfxInfo_TallGrass)` :
    // tag system honore gReservedSpriteTileCount → safe vs player.
    _tallGrassTileStart = LoadSpriteSheet({
      data: reordered, size: reordered.length, tag: TAG_TALL_GRASS_GFX,
    });

    // Load palette : prefer general_1.pal (= 1:1 décomp). Fallback PNG palette.
    let palette: Uint16Array;
    try {
      palette = await loadGeneralPal1();
    } catch {
      palette = png.palette;
    }
    // 1:1 STRICT décomp `LoadSpritePalette(FLDEFF_PAL_TAG_GENERAL_1)`.
    _tallGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_TALL_GRASS_PAL });
    // 1:1 décomp : NE PAS flushTo inline (= cf. player-avatar.ts:InitPlayerAvatar
    // pour rationale détaillée). Auto-flushTo VBlank (= TransferPlttBuffer) gere
    // ça en respectant `bufferTransferDisabled` pour gater le palette transfer
    // pendant un warp load. Sans gate, preloadTallGrassEffect leak les NEW grass
    // colors qui contribuent au flash visible avant fade-in dest map.

    // Init pool : tous slots à -1 (= libre).
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

// ─── Spawn ─────────────────────────────────────────────────────────────────

/** Trouve un slot libre dans le pool. -1 si pool full. */
function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) {
    if (!_pool[i].active) return i;
  }
  return -1;
}

/** 1:1 décomp `FldEff_TallGrass` (field_effect_helpers.c:291).
 *  Spawn un sprite tall grass effect à la position LOGICAL (mapX, mapY).
 *  Auto-destroy après 50 game frames (= anim cycle complet).
 *  Caller (= player-avatar) passe gPlayerAvatar.x/y pour éviter circular import. */
export function SpawnTallGrassEffect(rt: DecompRuntime, mapX: number, mapY: number): void {
  if (!_initialized) return;
  const slot = findFreeSlot();
  if (slot < 0) return;  // pool full = silently drop (= no overflow)

  // Compute world position (= tile au pixel coords).
  // 1:1 décomp `SetSpritePosToOffsetMapCoords(&x, &y, 8, 8)` : tile center + 8
  // dans les 2 axes. Notre formula : (gBackupRow - cam.y) * 16 = tile TOP, +8
  // = tile MID (= center vertical du tile = niveau corps du player).
  const cam = GetCameraTopLeftCoords();
  const npcGBackupCol = mapX + MAP_OFFSET;
  const npcGBackupRow = mapY + MAP_OFFSET;
  const worldX = (npcGBackupCol - cam.x) * 16 + 8;
  const worldY = (npcGBackupRow - cam.y) * 16 + 8;  // = tile mid (= corps player)

  const result = rt.CreateSpriteAtOam({
    tileId: _tallGrassTileStart + 1 * TILES_PER_FRAME,  // start at frame 1
    paletteBank: _tallGrassPalSlot,
    x: 0, y: 0,
    shape: 0, size: 1,  // 16x16 (= shape SQUARE, size SMALL)
    priority: 2,         // = behind player (player priority 2 too, but tall grass derrière BG2)
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

// ─── Update (= per-frame anim + position tracking) ─────────────────────────

/** À call chaque frame APRÈS PlayerStep depuis MainCB2_Overworld. */
export function UpdateTallGrassEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; continue; }
    // Find current anim frame from ticks.
    let acc = 0;
    let frameIdx = 1;
    for (const step of ANIM_SEQUENCE) {
      acc += step.duration;
      if (s.ticks < acc) { frameIdx = step.frameIdx; break; }
    }
    // Update sprite tile + position.
    const oam = rt.gba.oam[s.oamIndex];
    oam.tileId = _tallGrassTileStart + frameIdx * TILES_PER_FRAME;
    sprite.x = s.worldX + (gTotalCamera.pixelOffsetX - s.offsetXAtShow);
    sprite.y = s.worldY + (gTotalCamera.pixelOffsetY - s.offsetYAtShow) - GetBgVofsBaseline();
    s.ticks++;
    // Check anim done. Cleanup complet pour éviter résidus visuels.
    if (s.ticks >= 50) {
      sprite.inUse = false;
      oam.visible = false;
      // Hard-delete du Map pour pas que syncSpritesToOam le ressuscite par
      // erreur. + reset oam fields pour clean slate au cas où le slot est
      // réutilisé par d'autres sprites plus tard.
      rt.gSprites.delete(s.spriteId);
      oam.tileId = 0;
      oam.flipH = false;
      oam.flipV = false;
      s.active = false;
      s.spriteId = -1;
      s.oamIndex = -1;
    }
  }
}

/** Cleanup au map switch. */
export function DestroyAllTallGrassEffects(rt: DecompRuntime): void {
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

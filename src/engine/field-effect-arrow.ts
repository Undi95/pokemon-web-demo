/**
 * field-effect-arrow.ts — Phase 4.7 1:1 décomp warp arrow sprite system.
 *
 * Implémente :
 *   - `CreateWarpArrowSprite` (1:1 décomp `field_effect_helpers.c:175`) : crée 1
 *     sprite OAM 16x16 invisible au map load. paletteTag = TAG_NONE, paletteBank
 *     dédié pour ce sprite. tile gfx = `arrow.png` (8 frames × 4 tiles each).
 *   - `ShowWarpArrowSprite` (1:1 décomp `field_effect_helpers.c:193`) : show
 *     l'arrow at (x, y) facing direction. Triggers anim.
 *   - `HideShowWarpArrow` (1:1 décomp `field_player_avatar.c:1428`) : per-frame
 *     check : si player sur metatile MB_*_ARROW_WARP + walking direction match
 *     → show arrow at adjacent tile pointing direction. Sinon hide.
 *
 * Anim 1:1 décomp `sAnimTable_Arrow` (data/field_effects/field_effect_objects.h:260) :
 *   - sArrowAnim_South : ANIMCMD_FRAME(3, 32), ANIMCMD_FRAME(7, 32), JUMP(0)
 *   - sArrowAnim_North : 0, 4
 *   - sArrowAnim_West  : 1, 5
 *   - sArrowAnim_East  : 2, 6
 *   → 2 frames per dir, 32 game frames each (= ~0.5s blink).
 *
 * PNG layout (= 128x16 = 16x2 tiles = 32 tiles total) :
 *   - 8 frames × 4 tiles each (= 16x16 sprite = 2x2 tiles)
 *   - Frame layout : [N0, W0, E0, S0, N1, W1, E1, S1] (= columns of 2 tiles each)
 *
 * Palette : `general_0.pal` (= 1:1 décomp `gFieldEffectObjectPalette0`,
 * FLDEFF_PAL_TAG_GENERAL_0). 16 colors RGB15.
 */

import type { DecompRuntime } from './decomp-runtime';
import { loadTileBin } from './gba/png-loader';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './map-loader';
import { MoveCoords, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './direction-coords';
import { GetCameraTopLeftCoords, gTotalCamera, GetBgVofsBaseline } from './field-camera';
import { ENUM_MB_0 as MB } from './decomp-data/auto/include/constants/metatile_behaviors-data';

// ─── Asset paths ────────────────────────────────────────────────────────────

const ARROW_PNG_URL = '/decomp/em/field_effects/arrow.png';

// ─── OBJ tile + palette allocation ──────────────────────────────────────────

/** Arrow sprite : 8 frames × 4 tiles each = 32 tiles total.
 *  Allouons les tiles 992..1023 (= 32 tiles à la fin du OBJ VRAM). Réservé. */
const ARROW_OBJ_TILE_START = 992;
const TILES_PER_FRAME = 4;  // 16x16 = 2x2 = 4 tiles 4bpp

/** Palette bank de l'arrow.
 *  1:1 décomp : `gFieldEffectObjectTemplate_Arrow.paletteTag = TAG_NONE` →
 *  CreateSpriteAtEnd ne load PAS la palette spéciale. Le sprite hérite donc
 *  paletteNum 0 (= valeur par défaut de gObjectEventBaseOam_16x16, qui n'overide
 *  pas paletteNum). En pratique → bank 0 = palette du player (Brendan/May).
 *
 *  L'arrow PNG était authored pour utiliser ces mêmes indices que le player
 *  → couleurs (vert/blanc/rouge/etc.) viennent de la palette player.
 *
 *  Sans ça (= si on load general_0.pal dans une bank dédiée), couleurs wrong
 *  (= white/tan/peach/yellow au lieu de green/red/white). */
const ARROW_PALETTE_BANK = 0;

// ─── Anim frames mapping 1:1 décomp ─────────────────────────────────────────

/** PNG frame index par direction.
 *  Frame 0 = visible "off" state (= 1ere frame d'anim).
 *  Frame 1 = visible "on" state (= 2eme frame d'anim, blink).
 *
 *  Layout PNG (= 128x16 = 16 tiles wide × 2 tall = 32 tiles total).
 *  Chaque sprite frame = 2x2 tiles = 4 tiles consecutive en OBJ 1D layout.
 *  PNG colonnes (en frames de 2x2 tiles, = 8 frames horizontaux) :
 *    col 0 = N (frame 0), col 1 = W (frame 0), col 2 = E (frame 0), col 3 = S (frame 0),
 *    col 4 = N (frame 1), col 5 = W (frame 1), col 6 = E (frame 1), col 7 = S (frame 1).
 *
 *  Donc frame index décomp 0,1,2,3,4,5,6,7 mappe vers PNG col 0,1,2,3,4,5,6,7. */
const FRAME_INDEX = {
  [DIR_NORTH]: { off: 0, on: 4 },
  [DIR_WEST]:  { off: 1, on: 5 },
  [DIR_EAST]:  { off: 2, on: 6 },
  [DIR_SOUTH]: { off: 3, on: 7 },
} as const;

/** 32 game frames per anim frame (= 1:1 décomp ANIMCMD_FRAME(N, 32)). */
const ANIM_FRAME_DURATION = 32;

// ─── Loader async ──────────────────────────────────────────────────────────

let _arrowTilesCached: Uint8Array | null = null;

/** Async load arrow tiles (PNG raw 4bpp). Cached.
 *  1:1 décomp : pas de palette load (= TAG_NONE), juste tiles. */
async function loadArrowAssets(): Promise<{ tiles: Uint8Array }> {
  if (_arrowTilesCached) return { tiles: _arrowTilesCached };
  const tiles = await loadTileBin(ARROW_PNG_URL, 4);
  _arrowTilesCached = tiles;
  return { tiles };
}

// ─── PNG layout reorder (= row-major par row → 1D OBJ layout par frame) ─────

/** Reorganise PNG charData (row-major par tile sur 16×2 grid) en OBJ 1D layout
 *  où frame F (0..7) occupe 4 tiles consecutifs (= 2x2 tiles).
 *
 *  PNG : tile 0 = (col 0, row 0), tile 1 = (col 1, row 0), ..., tile 15 = (col 15, row 0),
 *        tile 16 = (col 0, row 1), ...
 *  Each frame = 2 cols × 2 rows = 4 tiles : (col 2F, row 0), (col 2F+1, row 0),
 *  (col 2F, row 1), (col 2F+1, row 1) → PNG indices 2F, 2F+1, 16+2F, 17+2F. */
function pngTo1dObjLayoutArrow(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const NUM_FRAMES = 8;
  const FRAME_W_TILES = 2;
  const FRAME_H_TILES = 2;
  const PNG_WIDTH_TILES = 16;
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

// ─── State machine ─────────────────────────────────────────────────────────

/** Per-instance state d'un warp arrow. Décomp = champs `data[0..1] = sPrevX/Y`
 *  + sprite invisible flag. */
interface WarpArrowState {
  spriteId: number;
  oamIndex: number;
  prevX: number;
  prevY: number;
  direction: number;
  /** Anim frame counter : 0..31 = "off" frame, 32..63 = "on" frame. Wraps. */
  animTicks: number;
  /** Tracks last invisible state pour détecter changement (= 1:1 décomp Show check). */
  invisible: boolean;
  /** Pixel-space world position relative à cam AT SHOW TIME.
   *  Formula : (internalCol - cam.x_at_show) * 16 + 8.
   *  Per-frame sprite.x = worldX + (gTotalCamera.pixelOffsetX - offsetAtShow).
   *  → idle : sprite.x = worldX (= correct at show position).
   *  → walking : sprite.x changes par delta offset (= smooth scroll).
   *
   *  Différent du pattern NPCs (= spawn au map load, offsetAtShow == 0). Arrow
   *  spawn DYNAMIQUEMENT (= heldDirection match), donc offset accumulé au show. */
  worldX: number;
  worldY: number;
  /** gTotalCamera.pixelOffsetX au moment du show. Sert à computer le delta
   *  scroll depuis show (= sprite.x = worldX + (offX_now - offX_at_show)). */
  offsetXAtShow: number;
  offsetYAtShow: number;
}

// Module-level state (= 1 arrow per player typically, simplified).
let _arrowState: WarpArrowState | null = null;
let _arrowInitialized = false;

/** Debug helper exposé sur globalThis. À call dans devtools console pour voir
 *  l'état arrow + position du player + camera. */
export function getArrowState(): WarpArrowState | null { return _arrowState; }
(globalThis as Record<string, unknown>).getArrowState = getArrowState;

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `CreateWarpArrowSprite` (field_effect_helpers.c:175).
 *  Crée 1 sprite OAM 16x16 invisible. À appeler au map load (= boot ou warp).
 *  Charge les assets si pas déjà cached. */
export async function CreateWarpArrowSprite(rt: DecompRuntime): Promise<number> {
  // Cleanup ancien sprite si re-init (= warp).
  if (_arrowState) {
    DestroyWarpArrowSprite(rt);
  }

  const { tiles: rawTiles } = await loadArrowAssets();

  // Réorganise en OBJ 1D layout.
  const reordered = pngTo1dObjLayoutArrow(rawTiles);

  // Write to OBJ VRAM at ARROW_OBJ_TILE_START.
  // 1:1 décomp : pas de LoadSpritePalette (= paletteTag = TAG_NONE). L'arrow
  // hérite la palette de bank 0 (= player Brendan/May) — c'est ce qui donne
  // les couleurs vert/blanc qu'on voit dans le décomp original. Si on charge
  // general_0.pal dans un bank dédié → couleurs wrong.
  const objVram = rt.gba.objVram;
  if (!_arrowInitialized) {
    objVram.set(reordered, ARROW_OBJ_TILE_START * 32);
    _arrowInitialized = true;
  }

  // Create sprite OAM. 16x16 = shape 0, size 1.
  const result = rt.CreateSpriteAtOam({
    tileId: ARROW_OBJ_TILE_START + FRAME_INDEX[DIR_SOUTH].off * TILES_PER_FRAME,
    paletteBank: ARROW_PALETTE_BANK,
    x: 0,
    y: 0,
    shape: 0,    // square
    size: 1,     // 16x16
    priority: 1, // au-dessus de BG2 (= player + carpet warp visible)
    paletteMode: 0,
    affineMode: 0,
  });

  // Initially invisible.
  rt.setSpriteInvisible(result.spriteId, true);

  _arrowState = {
    spriteId: result.spriteId,
    oamIndex: result.oamIndex,
    prevX: -1,
    prevY: -1,
    direction: DIR_SOUTH,
    animTicks: 0,
    invisible: true,
    worldX: 0,
    worldY: 0,
    offsetXAtShow: 0,
    offsetYAtShow: 0,
  };

  return result.spriteId;
}

/** 1:1 décomp `DestroyWarpArrowSprite` (= cleanup au map switch). */
export function DestroyWarpArrowSprite(rt: DecompRuntime): void {
  if (!_arrowState) return;
  const sprite = rt.gSprites.get(_arrowState.spriteId);
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  _arrowState = null;
}

/** 1:1 décomp `ShowWarpArrowSprite` (field_effect_helpers.c:193).
 *  Show l'arrow at (x, y) facing direction (= map coords WITHOUT MAP_OFFSET).
 *  Triggers anim restart si direction ou position change. */
function showWarpArrowSprite(rt: DecompRuntime, direction: number, mapX: number, mapY: number): void {
  if (!_arrowState) return;
  const state = _arrowState;
  // 1:1 décomp : if invisible || prevX != x || prevY != y → re-show + StartSpriteAnim.
  if (state.invisible || state.prevX !== mapX || state.prevY !== mapY) {
    state.prevX = mapX;
    state.prevY = mapY;
    state.direction = direction;
    state.animTicks = 0;  // restart anim
    state.invisible = false;
    // Save world position + offset AT SHOW TIME. Per-frame sprite.x =
    // worldX + (offX_now - offX_at_show). Au show idle, delta = 0 → sprite at
    // worldX (= correct position). Au scroll, delta change → smooth.
    const cam = GetCameraTopLeftCoords();
    const internalCol = mapX + MAP_OFFSET;
    const internalRow = mapY + MAP_OFFSET;
    state.worldX = (internalCol - cam.x) * 16 + 8;
    // Subtract sVerticalCameraPan via GetBgVofsBaseline()-8 (= sVerticalCameraPan)
    // pour compenser BG_VOFS additionnel post-refactor cam convention 1:1 décomp.
    state.worldY = (internalRow - cam.y) * 16 - (GetBgVofsBaseline() - 8);
    state.offsetXAtShow = gTotalCamera.pixelOffsetX;
    state.offsetYAtShow = gTotalCamera.pixelOffsetY;
    rt.setSpriteInvisible(state.spriteId, false);
  } else if (state.direction !== direction) {
    // Direction changed but same tile : just update direction + reset anim.
    state.direction = direction;
    state.animTicks = 0;
  }
}

/** 1:1 décomp `SetSpriteInvisible` (field_effect_helpers.c:188). */
function setArrowInvisible(rt: DecompRuntime): void {
  if (!_arrowState) return;
  if (!_arrowState.invisible) {
    _arrowState.invisible = true;
    rt.setSpriteInvisible(_arrowState.spriteId, true);
  }
}

/** 1:1 décomp `MetatileBehavior_IsSouthArrowWarp` (metatile_behavior.c:313).
 *  Includes `MB_WATER_SOUTH_ARROW_WARP` and `MB_SHOAL_CAVE_ENTRANCE`. */
function isSouthArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_SOUTH_ARROW_WARP
      || behavior === MB.MB_WATER_SOUTH_ARROW_WARP
      || behavior === MB.MB_SHOAL_CAVE_ENTRANCE;
}
/** 1:1 décomp `MetatileBehavior_IsNorthArrowWarp` (metatile_behavior.c:304).
 *  Includes `MB_STAIRS_OUTSIDE_ABANDONED_SHIP`. */
function isNorthArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_NORTH_ARROW_WARP
      || behavior === MB.MB_STAIRS_OUTSIDE_ABANDONED_SHIP;
}
/** 1:1 décomp `MetatileBehavior_IsWestArrowWarp` (metatile_behavior.c:296). */
function isWestArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_WEST_ARROW_WARP;
}
/** 1:1 décomp `MetatileBehavior_IsEastArrowWarp` (metatile_behavior.c:288). */
function isEastArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_EAST_ARROW_WARP;
}

/** Direction → check fn 1:1 décomp `sArrowWarpMetatileBehaviorChecks2`
 *  (field_player_avatar.c:294-300). */
const ARROW_CHECKS: Record<number, (b: number) => boolean> = {
  [DIR_SOUTH]: isSouthArrowWarp,
  [DIR_NORTH]: isNorthArrowWarp,
  [DIR_WEST]:  isWestArrowWarp,
  [DIR_EAST]:  isEastArrowWarp,
};

/** 1:1 décomp `HideShowWarpArrow` (field_player_avatar.c:1428).
 *  Per-frame. Si player on ARROW_WARP tile + walking direction matches → show
 *  arrow at adjacent tile pointing direction. Sinon hide.
 *
 *  @param rt           DecompRuntime
 *  @param playerX      Map coord X (= without MAP_OFFSET)
 *  @param playerY      Map coord Y
 *  @param movementDir  Current player movement direction (DIR_*)
 */
export function HideShowWarpArrow(
  rt: DecompRuntime, playerX: number, playerY: number, movementDir: number,
): void {
  if (!_arrowState) return;

  // 1:1 décomp : metatileBehavior at player current tile.
  const metatileBehavior = MapGridGetMetatileBehaviorAt(playerX + MAP_OFFSET, playerY + MAP_OFFSET);

  // Loop over 4 directions (SOUTH=1, NORTH=2, WEST=3, EAST=4) :
  //   if (sArrowWarpMetatileBehaviorChecks2[i](behavior) && direction == movementDirection)
  //     show arrow at adjacent (movement direction) tile.
  for (const dir of [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === movementDir) {
      const target = MoveCoords(dir, playerX, playerY);
      showWarpArrowSprite(rt, dir, target.x, target.y);
      return;
    }
  }
  // No match : hide arrow.
  setArrowInvisible(rt);
}

/** Tick anim + sync sprite OAM position (= camera offset + map coord).
 *  Appelé chaque frame depuis MainCB2 après HideShowWarpArrow. */
export function UpdateWarpArrowSprite(rt: DecompRuntime): void {
  if (!_arrowState) return;
  const state = _arrowState;
  const sprite = rt.gSprites.get(state.spriteId);
  if (!sprite) return;

  // Tick anim : 32 frames per state, 64 total cycle.
  if (!state.invisible) {
    state.animTicks = (state.animTicks + 1) % (ANIM_FRAME_DURATION * 2);
    const isOnFrame = state.animTicks >= ANIM_FRAME_DURATION;
    const frameIdx = isOnFrame
      ? FRAME_INDEX[state.direction as keyof typeof FRAME_INDEX].on
      : FRAME_INDEX[state.direction as keyof typeof FRAME_INDEX].off;
    const oam = rt.gba.oam[sprite.oamIndex];
    oam.tileId = ARROW_OBJ_TILE_START + frameIdx * TILES_PER_FRAME;

    // Position : worldX + (offX_now - offsetXAtShow).
    // - Idle après show : delta = 0 → sprite.x = worldX (= correct screen pos).
    // - Scroll : delta change → sprite.x suit le scroll camera (= smooth).
    //
    // Bug évité : sans `- offsetXAtShow`, l'offX accumulé depuis MAP LOAD
    // (= avant le show) est compté en double → arrow décalé de la valeur
    // d'offset au show (= 16 px par tile walked depuis map load).
    sprite.x = state.worldX + (gTotalCamera.pixelOffsetX - state.offsetXAtShow);
    sprite.y = state.worldY + (gTotalCamera.pixelOffsetY - state.offsetYAtShow);
  }
}

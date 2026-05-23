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
import { LoadSpriteSheet, IndexOfSpriteTileTag } from './sprite';
import { loadTileBin } from './gba/png-loader';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './map-loader';
import { MoveCoords, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './direction-coords';
import { gTotalCamera, gFieldCamera, gSpriteCoordOffset } from './field-camera';
import { gSaveBlock1Ptr } from './gba-menu-system';
import { ENUM_MB_0 as MB } from './decomp-data/include/constants/metatile_behaviors-data';

// ─── Asset paths ────────────────────────────────────────────────────────────

const ARROW_PNG_URL = '/decomp/em/field_effects/arrow.png';

// ─── OBJ tile + palette allocation ──────────────────────────────────────────

/** 1:1 STRICT décomp `LoadSpriteSheet(sFieldEffectObjectGfxInfo_Arrow)` :
 *  AllocSpriteTiles bitmap-based alloue 32 tiles n'importe où après reserved.
 *  Pas de LoadSpritePalette (= paletteTag = TAG_NONE → bank 0 shared player). */
const TAG_ARROW_GFX = 'FIELD_EFFECT_ARROW_GFX';
let _arrowTileStart = -1;
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

/** Per-instance state d'un warp arrow. 1:1 décomp `struct Sprite` champs
 *  utilisés pour l'arrow + ses `data[0..1] = sPrevX/Y` + `invisible` flag. */
interface WarpArrowState {
  spriteId: number;
  oamIndex: number;
  /** 1:1 décomp `sprite->data[0] = sPrevX`. Map INTERNAL X au dernier show. */
  prevX: number;
  /** 1:1 décomp `sprite->data[1] = sPrevY`. Map INTERNAL Y au dernier show. */
  prevY: number;
  direction: number;
  /** Anim frame counter : 0..31 = "off" frame, 32..63 = "on" frame. Wraps.
   *  1:1 décomp `sprite->animDelayCounter` + `animCmdIndex` (= union AnimCmd). */
  animTicks: number;
  /** 1:1 décomp `sprite->invisible`. Tracks last invisible state. */
  invisible: boolean;
  /** 1:1 décomp `sprite->x/y` (= sprite-space reference position, fixée AT SHOW
   *  via `SetSpritePosToMapCoords` + 8).
   *
   *  Per-frame OAM rendering ajoute `gSpriteCoordOffset.x/y` (= 1:1 décomp
   *  `coordOffsetEnabled = TRUE` + engine `BuildOamBuffer` qui add `gSpriteCoord
   *  OffsetX/Y` à l'OAM x/y). Notre engine n'a pas de support natif coordOffset
   *  Enabled → on apply le offset manuellement dans `UpdateWarpArrowSprite`. */
  spriteX: number;
  spriteY: number;
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

  // 1:1 STRICT décomp `LoadSpriteSheet(sFieldEffectObjectGfxInfo_Arrow)`.
  // Pas de LoadSpritePalette (= paletteTag = TAG_NONE) : l'arrow hérite la
  // palette de bank 0 (= player Brendan/May), couleurs vert/blanc du décomp.
  // AllocSpriteTiles bitmap-based honore gReservedSpriteTileCount → alloué
  // APRÈS player tiles.
  // 1:1 STRICT : check tag présent ; sinon re-load (= ResetSpriteData a clear).
  const stillAlloc = _arrowInitialized && IndexOfSpriteTileTag(TAG_ARROW_GFX) !== 0xFF;
  if (!stillAlloc) {
    _arrowTileStart = LoadSpriteSheet({
      data: reordered, size: reordered.length, tag: TAG_ARROW_GFX,
    });
    _arrowInitialized = true;
  }

  // Create sprite OAM. 16x16 = shape 0, size 1.
  const result = rt.CreateSpriteAtOam({
    tileId: _arrowTileStart + FRAME_INDEX[DIR_SOUTH].off * TILES_PER_FRAME,
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
    spriteX: 0,
    spriteY: 0,
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

/** 1:1 décomp `SetSpritePosToMapCoords` (event_object_movement.c:4801).
 *  Convertit des MAP INTERNAL coords (= +MAP_OFFSET) en sprite-space pixel
 *  position (= `sprite->x/y` reference, qui sera ensuite combinée avec
 *  `gSpriteCoordOffset.x/y` per-frame via `coordOffsetEnabled`).
 *
 *  Décomp body :
 *  ```c
 *  void SetSpritePosToMapCoords(s16 mapX, s16 mapY, s16 *destX, s16 *destY) {
 *      s16 dx = -gTotalCameraPixelOffsetX - gFieldCamera.x;
 *      s16 dy = -gTotalCameraPixelOffsetY - gFieldCamera.y;
 *      if (gFieldCamera.x > 0) dx += 16;
 *      if (gFieldCamera.x < 0) dx -= 16;
 *      if (gFieldCamera.y > 0) dy += 16;
 *      if (gFieldCamera.y < 0) dy -= 16;
 *      *destX = ((mapX - gSaveBlock1Ptr->pos.x) << 4) + dx;
 *      *destY = ((mapY - gSaveBlock1Ptr->pos.y) << 4) + dy;
 *  }
 *  ```
 */
function setSpritePosToMapCoords(mapX: number, mapY: number): { x: number; y: number } {
  const pos = gSaveBlock1Ptr.pos;
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  return {
    x: ((mapX - pos.x) << 4) + dx,
    y: ((mapY - pos.y) << 4) + dy,
  };
}

/** 1:1 décomp `ShowWarpArrowSprite` (field_effect_helpers.c:193).
 *
 *  Body décomp :
 *  ```c
 *  void ShowWarpArrowSprite(u8 spriteId, u8 direction, s16 x, s16 y) {
 *      struct Sprite *sprite = &gSprites[spriteId];
 *      if (sprite->invisible || sprite->sPrevX != x || sprite->sPrevY != y) {
 *          s16 x2, y2;
 *          SetSpritePosToMapCoords(x, y, &x2, &y2);
 *          sprite->x = x2 + 8;
 *          sprite->y = y2 + 8;
 *          sprite->invisible = FALSE;
 *          sprite->sPrevX = x;
 *          sprite->sPrevY = y;
 *          StartSpriteAnim(sprite, direction - 1);
 *      }
 *  }
 *  ```
 *
 *  @param mapX  INTERNAL X (= logical + MAP_OFFSET, 1:1 décomp). C'est l'API
 *               décomp = `objectEvent->currentCoords.x` qui est interne.
 *  @param mapY  INTERNAL Y.
 */
function showWarpArrowSprite(rt: DecompRuntime, direction: number, mapX: number, mapY: number): void {
  if (!_arrowState) return;
  const state = _arrowState;
  // 1:1 décomp : if invisible || prevX != x || prevY != y → re-position + show + StartSpriteAnim.
  if (state.invisible || state.prevX !== mapX || state.prevY !== mapY) {
    const tilePos = setSpritePosToMapCoords(mapX, mapY);
    // 1:1 décomp `sprite->x = x2 + 8; sprite->y = y2 + 8`. Le +8 cale le
    // sprite sur le CENTER de la tile (= 1:1 décomp interprétation : sprite.x
    // est le centre, l'engine compute oam.x = sprite.x + x2 + centerToCornerVec).
    // Pour 16x16 sprite + gObjectEventBaseOam_16x16, CalcCenterToCornerVec
    // (= décomp src/sprite.c) retourne centerToCornerVec = (-8, -8).
    // Donc : oam.x = (sprite_center.x) + 0 + (-8) = top-left de la tile. ✓
    state.spriteX = tilePos.x + 8;
    state.spriteY = tilePos.y + 8;
    state.prevX = mapX;
    state.prevY = mapY;
    state.direction = direction;
    state.animTicks = 0;  // restart anim (= 1:1 décomp StartSpriteAnim)
    state.invisible = false;
    rt.setSpriteInvisible(state.spriteId, false);
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
 *
 *  Body décomp :
 *  ```c
 *  static void HideShowWarpArrow(struct ObjectEvent *objectEvent) {
 *      s16 x, y;
 *      u8 direction;
 *      u8 metatileBehavior = objectEvent->currentMetatileBehavior;
 *      for (x = 0, direction = DIR_SOUTH; x < 4; x++, direction++) {
 *          if (sArrowWarpMetatileBehaviorChecks2[x](metatileBehavior)
 *              && direction == objectEvent->movementDirection) {
 *              x = objectEvent->currentCoords.x;
 *              y = objectEvent->currentCoords.y;
 *              MoveCoords(direction, &x, &y);
 *              ShowWarpArrowSprite(objectEvent->warpArrowSpriteId, direction, x, y);
 *              return;
 *          }
 *      }
 *      SetSpriteInvisible(objectEvent->warpArrowSpriteId);
 *  }
 *  ```
 *
 *  Notre wrapper TS prend des LOGICAL coords (= sans MAP_OFFSET) en input
 *  parce que `gPlayerAvatar.x/y` sont logical. On convertit en INTERNAL pour
 *  matcher l'API décomp (= `objectEvent->currentCoords` est interne).
 *
 *  @param playerX     LOGICAL X du player (= gPlayerAvatar.x).
 *  @param playerY     LOGICAL Y du player.
 *  @param movementDir Direction du dernier mouvement (= 1:1 décomp
 *                     `objectEvent->movementDirection`). C'est la direction
 *                     dans laquelle le player a fait son dernier step ou
 *                     turn. Maintenu par PlayerStep keypad logic + scripted
 *                     movement actions.
 */
export function HideShowWarpArrow(
  rt: DecompRuntime, playerX: number, playerY: number, movementDir: number,
): void {
  if (!_arrowState) return;

  // 1:1 décomp `objectEvent->currentMetatileBehavior` (= cached behavior).
  // Notre impl : query frais via MapGridGetMetatileBehaviorAt à chaque appel.
  // C'est équivalent car le cached behavior dans l'ObjectEvent est aussi
  // refresh chaque step end via ObjectEventUpdateCurrentMetatileBehavior.
  const internalX = playerX + MAP_OFFSET;
  const internalY = playerY + MAP_OFFSET;
  const metatileBehavior = MapGridGetMetatileBehaviorAt(internalX, internalY);

  // 1:1 décomp loop : `for (x = 0, direction = DIR_SOUTH; x < 4; x++, direction++)`.
  // Test chaque direction (SOUTH=1, NORTH=2, WEST=3, EAST=4) : si la tile
  // courante a le ARROW_WARP behavior matchant cette direction ET le player
  // movementDirection == cette direction → show arrow at adjacent tile.
  for (const dir of [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === movementDir) {
      // 1:1 décomp : `x = objectEvent->currentCoords.x; y = ...; MoveCoords(direction, &x, &y);`
      // Use INTERNAL coords (= 1:1 décomp `currentCoords` est interne).
      const target = MoveCoords(dir, internalX, internalY);
      showWarpArrowSprite(rt, dir, target.x, target.y);
      return;
    }
  }
  // 1:1 décomp `SetSpriteInvisible(objectEvent->warpArrowSpriteId)`.
  setArrowInvisible(rt);
}

/** 1:1 STRICT décomp signature `HideShowWarpArrow(struct ObjectEvent *objectEvent)`
 *  (field_player_avatar.c:1428-1448).
 *
 *  Lit `objectEvent->currentMetatileBehavior` + `objectEvent->movementDirection`
 *  + `objectEvent->currentCoords.x/y` directement depuis l'ObjectEvent (= 1:1
 *  décomp). Used quand le caller a accès au player ObjectEvent (=
 *  `gObjectEvents[gPlayerAvatar.objectEventId]`).
 *
 *  Wrapper `HideShowWarpArrow(rt, playerX, playerY, movementDir)` reste
 *  disponible pour compat avec call-sites qui passent les coords/dir séparées
 *  (= notre TestOverworldScene actuel).
 */
export function HideShowWarpArrowFromObjectEvent(
  rt: DecompRuntime,
  objectEvent: {
    currentCoordsX: number;
    currentCoordsY: number;
    currentMetatileBehavior: number;
    movementDirection: number;
    active: boolean;
    isPlayer: boolean;
  },
): void {
  if (!_arrowState) return;
  if (!objectEvent.active || !objectEvent.isPlayer) {
    setArrowInvisible(rt);
    return;
  }
  // 1:1 décomp : metatileBehavior cached depuis objectEvent (= updated par
  // ObjectEventUpdateMetatileBehaviors au step end). Post R3 refactor :
  // currentCoordsX/Y INTERNAL → use direct (1:1 strict path).
  const metatileBehavior = objectEvent.currentMetatileBehavior;
  const internalX = objectEvent.currentCoordsX;
  const internalY = objectEvent.currentCoordsY;
  for (const dir of [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === objectEvent.movementDirection) {
      const target = MoveCoords(dir, internalX, internalY);
      showWarpArrowSprite(rt, dir, target.x, target.y);
      return;
    }
  }
  setArrowInvisible(rt);
}

/** Tick anim + sync sprite OAM position. Appelé chaque frame depuis MainCB2_
 *  Overworld après HideShowWarpArrow.
 *
 *  L'engine décomp gère `coordOffsetEnabled = TRUE` en ajoutant
 *  `gSpriteCoordOffset.x/y` à l'OAM x/y chaque frame dans `BuildOamBuffer`.
 *  Notre engine TS n'a pas ce mécanisme natif → on apply ici manuellement.
 *
 *  Tick anim 1:1 décomp `sAnimTable_Arrow` (data/field_effects/field_effect_
 *  objects.h:260) : 2 frames (off/on) à 32 ticks chacun, loop infini. */
export function UpdateWarpArrowSprite(rt: DecompRuntime): void {
  if (!_arrowState) return;
  const state = _arrowState;
  const sprite = rt.gSprites.get(state.spriteId);
  if (!sprite) return;

  if (!state.invisible) {
    // 1:1 décomp anim tick : sArrowAnim_X = ANIMCMD_FRAME(N, 32), ANIMCMD_FRAME(M, 32), JUMP(0).
    state.animTicks = (state.animTicks + 1) % (ANIM_FRAME_DURATION * 2);
    const isOnFrame = state.animTicks >= ANIM_FRAME_DURATION;
    const frameIdx = isOnFrame
      ? FRAME_INDEX[state.direction as keyof typeof FRAME_INDEX].on
      : FRAME_INDEX[state.direction as keyof typeof FRAME_INDEX].off;
    const oam = rt.gba.oam[sprite.oamIndex];
    oam.tileId = _arrowTileStart + frameIdx * TILES_PER_FRAME;

    // 1:1 décomp `coordOffsetEnabled = TRUE` (= field_effect_helpers.c:182).
    // L'engine décomp `BuildOamBuffer` (sprite.c:UpdateOamCoords) fait :
    //   oam.x = sprite->x + sprite->x2 + centerToCornerVecX + gSpriteCoordOffsetX
    //   oam.y = sprite->y + sprite->y2 + centerToCornerVecY + gSpriteCoordOffsetY
    //
    // Notre `syncSpritesToOam` (= decomp-runtime.ts:2175-2176) NE FAIT PAS le
    // `+ gSpriteCoordOffset` automatiquement (= pas de support natif
    // `coordOffsetEnabled` dans notre engine).
    //
    // Workaround 1:1 strict : on add `gSpriteCoordOffset` à `sprite.x` ici
    // chaque frame. Notre `syncSpritesToOam` add ensuite `centerToCornerVec`
    // (= -8 pour 16x16) automatiquement → résultat OAM x identique au décomp.
    //
    // À long terme : porter `coordOffsetEnabled` dans `syncSpritesToOam` =
    // dette engine documentée (= virtual-objects.ts, object-events.ts utilisent
    // déjà des patterns similaires).
    sprite.x = state.spriteX + gSpriteCoordOffset.x;
    sprite.y = state.spriteY + gSpriteCoordOffset.y;
  }
}

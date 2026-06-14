/**
 * field-effect-surf-blob.ts — 1:1 décomp `FldEff_SurfBlob` + setters/getters SurfBlob +
 * `UpdateSurfBlobFieldEffect` (+ SynchronizeSurfAnim/Position, UpdateBobbingEffect) +
 * `StartUnderwaterSurfBlobBobbing` + `SpriteCB_UnderwaterSurfBlob`.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h` (sPicTable/sAnimTable/Template SurfBlob)
 *   - `src/field_effect_helpers.c:999-1175` (tout le bloc surf blob)
 *   - `include/field_effect_helpers.h:5` (enum BOB_NONE/PLAYER_AND_MON/JUST_MON)
 *
 * Comportement 1:1 : la « monture » d'eau (32×32) sur laquelle le joueur surfe. Suit le sprite
 * joueur (sprite.x = player.x, sprite.y = player.y+8) et synchronise un bobbing vertical (y2)
 * partagé joueur+monture. L'anim choisit une frame statique selon la direction du joueur
 * (S=0, N=1, W=2, E=2+hFlip). subpriority 150 (derrière le joueur). Les setters SetSurfBlob_*
 * sont appelés par le code de surf (field_player_avatar.c, port futur) ; sans BOB state ≠ NONE,
 * pas de bobbing ni de sync joueur (état initial).
 *
 * ⚠️ Archi : le joueur est ÉCRAN-positionné (coordOffsetEnabled=false). On copie sa position
 * écran + on matche son coordOffsetEnabled (≠ décomp où le joueur est monde-positionné).
 * Le slot object-event joueur a spriteId=-1 → résoudre le VRAI sprite via GetObjectEventMainSpriteId.
 *
 * Asset : surf_blob.png (96×32 = 3 frames 32×32). Palette : embarquée (oam.paletteNum=0 décomp).
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict } from '../gba/png-loader';
import { SetSpritePosToOffsetMapCoords } from './field-camera';
import { MoveCoords } from './direction-coords';
import { MapGridGetElevationAt } from './map-loader';
import { FieldEffectActiveListRemove } from './field-effect-active-list';
import {
  gObjectEvents, GetObjectEventMainSpriteId, ELEVATION_DEFAULT,
} from './object-events';

const SURF_BLOB_PNG = '/decomp/em/field_effects/surf_blob.png';
const TAG_SURF_BLOB_GFX = 'FIELD_EFFECT_SURF_BLOB_GFX';
const TAG_SURF_BLOB_PAL = 'FIELD_EFFECT_SURF_BLOB_PAL';
const FLDEFF_SURF_BLOB = 8;   // 1:1 const LOCALE (cycle ESM field-effect↔module = TDZ).

// 1:1 enum (field_effect_helpers.h).
const BOB_NONE = 0, BOB_PLAYER_AND_MON = 1, BOB_JUST_MON = 2;
// 1:1 DIR_* (direction-coords) : NONE=0, SOUTH=1, NORTH=2, WEST=3, EAST=4.
const DIR_SOUTH = 1, DIR_EAST = 4;

const NUM_FRAMES = 3;
const FRAME_W_TILES = 4, FRAME_H_TILES = 4;
const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;  // 16 (32×32)
const PNG_W_TILES = 12;  // 96px
let _surfBlobTileStart = -1;
let _surfBlobPalSlot = -1;

/** 1:1 `surfBlobDirectionAnims[]` (SynchronizeSurfAnim) : movementDirection → index anim. */
const SURF_BLOB_DIRECTION_ANIMS = [0, 0, 1, 2, 3, 0, 0, 1, 1];
/** Index anim → frame statique + hFlip (sSurfBlobAnim_Face* : S=0, N=1, W=2, E=2 hFlip). */
const ANIM_FRAME: ReadonlyArray<{ frame: number; hFlip: boolean }> = [
  { frame: 0, hFlip: false }, { frame: 1, hFlip: false },
  { frame: 2, hFlip: false }, { frame: 2, hFlip: true },
];

interface SurfBlobState {
  spriteId: number; oamIndex: number; active: boolean;
  // data[] 1:1 : bitfield/playerOffset/playerObjId/velocity/timer/intervalIdx/prevX/prevY.
  bitfield: number; playerOffset: number; playerObjId: number;
  velocity: number; timer: number; intervalIdx: number; prevX: number; prevY: number;
  curAnimIdx: number;
}
const POOL_SIZE = 2;
const _pool: SurfBlobState[] = [];

interface UnderwaterBobState { active: boolean; blobSpriteId: number; bobY: number; timer: number; }
const _underwaterPool: UnderwaterBobState[] = [];

let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; _underwaterPool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 96×32 = 12×4 tiles row-major. Frame F (32×32 = 4×4 tiles) = colonnes 4F..4F+3, rows
 *  0..3 → 1D OBJ frame-major (16 tiles/frame, ordre row-major dans la frame). */
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
export function preloadSurfBlobEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && IndexOfSpriteTileTag(TAG_SURF_BLOB_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    const png = await loadIndexedPngStrict(SURF_BLOB_PNG, 4);
    const reordered = pngTo1dObjLayout(png.charData);
    _surfBlobTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SURF_BLOB_GFX });
    // 1:1 décomp oam.paletteNum=0 (palette partagée). Adaptation : on charge la palette embarquée
    // du PNG dans un slot dédié → couleurs correctes du blob sans dépendre du slot 0 partagé.
    _surfBlobPalSlot = LoadSpritePalette({ data: png.palette as Uint16Array, tag: TAG_SURF_BLOB_PAL });
    _pool.length = 0; _underwaterPool.length = 0;
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, active: false, bitfield: 0, playerOffset: 0, playerObjId: 0, velocity: -1, timer: 0, intervalIdx: 0, prevX: -1, prevY: -1, curAnimIdx: -1 };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}
function findBySpriteId(spriteId: number): SurfBlobState | undefined {
  for (const e of _pool) if (e.active && e.spriteId === spriteId) return e;
  return undefined;
}

/** 1:1 décomp `FldEff_SurfBlob` (field_effect_helpers.c:999). args[0/1]=x/y map, [2]=playerObjId.
 *  Retourne le spriteId du blob (le code de surf en a besoin). */
export function SpawnSurfBlobEffect(rt: DecompRuntime, mapX: number, mapY: number, playerObjId: number): number {
  if (!_initialized) return 64;
  const slot = findFreeSlot();
  if (slot < 0) return 64;
  const world = SetSpritePosToOffsetMapCoords(mapX, mapY, 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _surfBlobTileStart,
    paletteBank: _surfBlobPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 2,  // 32×32
    priority: 2, paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) {
    sprite.x = world.x; sprite.y = world.y;
    sprite.coordOffsetEnabled = true;  // 1:1 (snappé sur le joueur dès le 1er bobbing).
    sprite.subpriority = 150 & 0xFF;   // 1:1 CreateSpriteAtEnd(..., 150).
  }
  const oam = rt.gba.oam[result.oamIndex];
  if (oam) oam.subpriority = 150 & 0xFF;
  const s = _pool[slot];
  s.spriteId = result.spriteId; s.oamIndex = result.oamIndex; s.active = true;
  // 1:1 : sPlayerObjId=args[2], sVelocity=-1, sPrevX=-1, sPrevY=-1 ; bitfield/timer/intervalIdx=0.
  s.bitfield = 0; s.playerOffset = 0; s.playerObjId = playerObjId;
  s.velocity = -1; s.timer = 0; s.intervalIdx = 0; s.prevX = -1; s.prevY = -1; s.curAnimIdx = -1;
  // 1:1 décomp : FieldEffectActiveListRemove(FLDEFF_SURF_BLOB).
  FieldEffectActiveListRemove(FLDEFF_SURF_BLOB);
  return result.spriteId;
}

// ── Setters/getters (1:1 décomp, manipulent le bitfield data[0]) ──
export function SetSurfBlob_BobState(spriteId: number, state: number): void {
  const e = findBySpriteId(spriteId); if (e) e.bitfield = (e.bitfield & ~0xF) | (state & 0xF);
}
export function SetSurfBlob_DontSyncAnim(spriteId: number, dontSync: boolean): void {
  const e = findBySpriteId(spriteId); if (e) e.bitfield = (e.bitfield & ~0xF0) | (((dontSync ? 1 : 0) & 0xF) << 4);
}
export function SetSurfBlob_PlayerOffset(spriteId: number, hasOffset: boolean, offset: number): void {
  const e = findBySpriteId(spriteId); if (!e) return;
  e.bitfield = (e.bitfield & ~0xF00) | (((hasOffset ? 1 : 0) & 0xF) << 8);
  e.playerOffset = offset;
}
function getBobState(e: SurfBlobState): number { return e.bitfield & 0xF; }
function getDontSyncAnim(e: SurfBlobState): number { return (e.bitfield & 0xF0) >> 4; }
function getHasPlayerOffset(e: SurfBlobState): number { return (e.bitfield & 0xF00) >> 8; }

/** 1:1 décomp `UpdateSurfBlobFieldEffect` (+ Synchronize/Bobbing). À call/frame. */
export function UpdateSurfBlobEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; s.spriteId = -1; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const playerObj = gObjectEvents[s.playerObjId];
    if (!playerObj) continue;
    const playerSpriteId = GetObjectEventMainSpriteId(playerObj);
    const playerSprite = playerSpriteId >= 0 ? rt.gSprites.get(playerSpriteId) : undefined;
    if (!playerSprite) continue;
    const pOam = rt.gba.oam[playerSprite.oamIndex];

    // ── SynchronizeSurfAnim ──
    if (!getDontSyncAnim(s)) {
      const animIdx = SURF_BLOB_DIRECTION_ANIMS[playerObj.movementDirection] ?? 0;
      if (animIdx !== s.curAnimIdx) {  // 1:1 StartSpriteAnimIfDifferent
        s.curAnimIdx = animIdx;
        const af = ANIM_FRAME[animIdx];
        oam.tileId = _surfBlobTileStart + af.frame * TILES_PER_FRAME;
        oam.flipH = af.hFlip; sprite.hFlip = af.hFlip;
      }
    }

    // ── SynchronizeSurfPosition ──
    const px = playerObj.currentCoordsX, py = playerObj.currentCoordsY;
    if (sprite.y2 === 0 && (px !== s.prevX || py !== s.prevY)) {
      s.intervalIdx = 0; s.prevX = px; s.prevY = py;
      for (let i = DIR_SOUTH; i <= DIR_EAST; i++) {
        const m = MoveCoords(i, s.prevX, s.prevY);
        if (MapGridGetElevationAt(m.x, m.y) === ELEVATION_DEFAULT) {
          // En train de descendre de la monture → bobbing plus lent.
          s.intervalIdx++;
          break;
        }
      }
    }

    // ── UpdateBobbingEffect ──
    const intervals = [0x3, 0x7];
    const bobState = getBobState(s);
    if (bobState !== BOB_NONE) {
      s.timer = (s.timer + 1) & 0xFFFF;
      if ((s.timer & intervals[s.intervalIdx]) === 0) sprite.y2 += s.velocity;
      if ((s.timer & 15) === 0) s.velocity = -s.velocity;
      if (bobState !== BOB_JUST_MON) {
        playerSprite.y2 = getHasPlayerOffset(s) ? (s.playerOffset + sprite.y2) : sprite.y2;
        sprite.x = playerSprite.x; sprite.y = playerSprite.y + 8;
        sprite.coordOffsetEnabled = playerSprite.coordOffsetEnabled;  // archi : matcher le joueur écran.
      }
    }
    // 1:1 : sprite->oam.priority = playerSprite->oam.priority.
    if (pOam) oam.priority = pOam.priority;
  }
}

/** 1:1 décomp `StartUnderwaterSurfBlobBobbing` (field_effect_helpers.c:1157) : un « sprite »
 *  dummy invisible qui fait bober le blob underwater (Dive). Modélisé en pool (timer-carrier). */
export function StartUnderwaterSurfBlobBobbing(blobSpriteId: number): number {
  for (let i = 0; i < _underwaterPool.length; i++) {
    if (!_underwaterPool[i].active) { _underwaterPool[i] = { active: true, blobSpriteId, bobY: 1, timer: 0 }; return i; }
  }
  _underwaterPool.push({ active: true, blobSpriteId, bobY: 1, timer: 0 });
  return _underwaterPool.length - 1;
}

/** 1:1 décomp `SpriteCB_UnderwaterSurfBlob` (field_effect_helpers.c:1170). À call/frame. */
export function UpdateUnderwaterSurfBlobEffects(rt: DecompRuntime): void {
  for (const u of _underwaterPool) {
    if (!u.active) continue;
    const blob = rt.gSprites.get(u.blobSpriteId);
    if (!blob) { u.active = false; continue; }
    if (((u.timer++) & 3) === 0) blob.y2 += u.bobY;
    if ((u.timer & 15) === 0) u.bobY = -u.bobY;
  }
}

export function DestroyAllSurfBlobEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
  for (const u of _underwaterPool) u.active = false;
}

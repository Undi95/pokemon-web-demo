/**
 * pokemon-anim-funcs.ts
 * ─────────────────────
 * 1:1 décomp `src/pokemon_animation.c` — per-species front-pic anim functions.
 *
 * The decomp registers ~150 anim functions in `sMonAnimFunctions[]`
 * (pokemon_animation.c:631-783). Each species maps to ONE anim id via
 * `sMonFrontAnimIdsTable[species - 1]` (pokemon.c:1406+). When a mon front
 * sprite is shown, `LaunchAnimationTaskForFrontSprite` sets
 * `sprite->callback = sMonAnimFunctions[animId]`. The callback runs each frame,
 * applying scale/rotation deltas via SetAffineData → ObjAffineSet → gOamMatrices.
 *
 * Implemented :
 *   - Anim_VerticalSquishBounce       (pokemon_animation.c:1834-1876)
 *     = Lotad, Lombre, Oddish, Marill, Skitty, Wurmple, ... (50+ species)
 *   - Anim_VerticalSquishBounce_Slow  (pokemon_animation.c:3654-3675)
 *     = Gloom, Slowpoke, Dewgong, Lickitung, Chansey, Moltres, ...
 *
 * TODO future :
 *   - Other ~145 anim functions (pokemon_animation.c)
 *   - sMonFrontAnimIdsTable extraction (currently inline minimal map)
 *   - sMonAnimationDelayTable per-species delay before idle anim starts
 *   - Non-square shape handling in centerToCornerVec (currently SQUARE-only)
 *
 * Foundational : every Pokemon front-pic display (party menu, summary, evo,
 * trade, Pokedex, battle, egg hatch) uses these anims.
 */

import type { DecompRuntime, DecompSprite } from './decomp-runtime';
import { Sin } from './decomp-helpers';

// ─── ANIM_* constants (1:1 décomp include/pokemon_animation.h) ──────────────
export const ANIM_V_SQUISH_AND_BOUNCE = 0;
export const ANIM_CIRCULAR_STRETCH_TWICE = 1;
export const ANIM_H_VIBRATE = 2;
export const ANIM_H_SLIDE = 3;
export const ANIM_V_SLIDE = 4;
export const ANIM_BOUNCE_ROTATE_TO_SIDES = 5;
export const ANIM_V_JUMPS_H_JUMPS = 6;
export const ANIM_GROW_VIBRATE = 9;
export const ANIM_H_SHAKE = 15;
export const ANIM_V_SHAKE = 16;
export const ANIM_TWIST = 18;
export const ANIM_SHRINK_GROW = 19;
export const ANIM_H_STRETCH = 22;
export const ANIM_V_STRETCH = 23;
export const ANIM_V_SHAKE_TWICE = 25;
export const ANIM_V_JUMPS_BIG = 30;
export const ANIM_V_SQUISH_AND_BOUNCE_SLOW = 69;
export const ANIM_H_SLIDE_SLOW = 70;
export const ANIM_V_SLIDE_SLOW = 71;
export const ANIM_V_JUMPS_SMALL = 82;

// ─── sMonFrontAnimIdsTable (1:1 décomp pokemon.c:1406-1791) ─────────────────
// Map SPECIES_X → ANIM_*. Currently minimal. Full extraction = TODO.
export const SPECIES_LOTAD = 295;
export const SPECIES_LOMBRE = 296;
export const SPECIES_LUDICOLO = 297;

const _sMonFrontAnimIds = new Map<number, number>([
  [SPECIES_LOTAD, ANIM_V_SQUISH_AND_BOUNCE],
  [SPECIES_LOMBRE, ANIM_V_SQUISH_AND_BOUNCE],
  [SPECIES_LUDICOLO, ANIM_V_SQUISH_AND_BOUNCE],
]);

/** Front anim id for a species, defaults to ANIM_V_SQUISH_AND_BOUNCE. */
export function getMonFrontAnimId(species: number): number {
  return _sMonFrontAnimIds.get(species) ?? ANIM_V_SQUISH_AND_BOUNCE;
}

// ─── Helpers (1:1 décomp pokemon_animation.c:984-1085) ──────────────────────

const ST_OAM_AFFINE_NORMAL = 1;
const ST_OAM_AFFINE_DOUBLE = 3;

// 1:1 décomp src/sprite.c CalcCenterToCornerVec — half-extents per shape × size.
// SQUARE only for now (mon front pic is shape=0). H_RECT/V_RECT will be needed
// for other UI sprites — TODO when those scenes land.
const CENTER_OFFSETS_SQUARE: ReadonlyArray<readonly [number, number]> = [
  [-4, -4], [-8, -8], [-16, -16], [-32, -32],
];

/** 1:1 décomp pokemon_animation.c:984 SetAffineData. Computes pa/pb/pc/pd from
 *  xScale/yScale/rotation (Q.8 fixed-point, 256 = identity) via ObjAffineSet
 *  inline math, writes to gOamMatrices[matrixNum].
 *  Slot 0 reserved as identity for AFFINE_OFF — skip writes there. */
function setAffineData(rt: DecompRuntime, sprite: DecompSprite, xScale: number, yScale: number, rotation: number): void {
  const matrixNum = sprite.matrixNum;
  if (matrixNum <= 0 || matrixNum >= 32) return;

  const rot = rotation & 0xFFFF;
  const sin = Sin(rot, 256);
  const cos = Sin(rot + 64, 256);
  const pa =  (xScale * cos) >> 8;
  const pb = -(xScale * sin) >> 8;
  const pc =  (yScale * sin) >> 8;
  const pd =  (yScale * cos) >> 8;

  const m = rt.gba.affineParams[matrixNum];
  if (m) { m.pa = pa; m.pb = pb; m.pc = pc; m.pd = pd; }
}

/** 1:1 décomp pokemon_animation.c:1020 HandleSetAffineData. Inverts xScale +
 *  rotation if NOT sDontFlip (= summary screen). data[1] = sDontFlip. */
function handleSetAffineData(rt: DecompRuntime, sprite: DecompSprite, xScale: number, yScale: number, rotation: number): void {
  const sDontFlip = !!sprite.data[1];
  const xs = sDontFlip ? xScale : -xScale;
  const rot = sDontFlip ? rotation : -rotation;
  setAffineData(rt, sprite, xs, yScale, rot);
}

/** 1:1 décomp pokemon_animation.c:1003 HandleStartAffineAnim.
 *  Switches to AFFINE_DOUBLE (= 2× bbox), updates centerToCornerVec, pauses
 *  affine anim system (= we drive matrix directly). */
function handleStartAffineAnim(rt: DecompRuntime, sprite: DecompSprite): void {
  sprite.affineMode = ST_OAM_AFFINE_DOUBLE as 0 | 1 | 2 | 3;
  const [baseX, baseY] = CENTER_OFFSETS_SQUARE[sprite.size & 3] ?? [0, 0];
  sprite.centerToCornerVecX = baseX * 2;
  sprite.centerToCornerVecY = baseY * 2;
  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) {
    oam.affineMode = ST_OAM_AFFINE_DOUBLE;
    oam.affineParamIndex = sprite.matrixNum;
  }
  sprite.affineAnimPaused = true;
}

/** 1:1 décomp pokemon_animation.c:1031 TryFlipX. data[1] = sDontFlip. */
function tryFlipX(sprite: DecompSprite): void {
  if (!sprite.data[1]) sprite.x2 *= -1;
}

/** 1:1 décomp pokemon_animation.c:1061 ResetSpriteAfterAnim. Back to
 *  AFFINE_NORMAL bbox, restore default centerToCornerVec. */
function resetSpriteAfterAnim(rt: DecompRuntime, sprite: DecompSprite): void {
  sprite.affineMode = ST_OAM_AFFINE_NORMAL as 0 | 1 | 2 | 3;
  const [baseX, baseY] = CENTER_OFFSETS_SQUARE[sprite.size & 3] ?? [0, 0];
  sprite.centerToCornerVecX = baseX;
  sprite.centerToCornerVecY = baseY;
  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) {
    oam.affineMode = ST_OAM_AFFINE_NORMAL;
    oam.affineParamIndex = sprite.matrixNum;
  }
}

/** 1:1 décomp pokemon_animation.c:5540 WaitAnimEnd. Sets callback to dummy
 *  when sprite.animEnded fires. */
function waitAnimEnd(_rt: DecompRuntime, sprite: DecompSprite, dummyCallback: (s: DecompSprite, r: DecompRuntime) => void): void {
  if (sprite.animEnded) sprite.callback = dummyCallback;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIM_V_SQUISH_AND_BOUNCE (Lotad, Lombre, Oddish, Marill, ...)
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp pokemon_animation.c:1834-1876.
//
// data[] : [0]=duration param (16 normal, 8 slow), [1]=sDontFlip,
//          [2]=frame counter (0→data[0]*3), [3]=y bounce phase, [4]=scale phase
//
// Visual : squish vertically (~16 frames), bounce up while expanding (~16),
// settle to scale 256 (~16). Total ~48 frames @ 60 Hz = 0.8s.

/** 1:1 décomp pokemon_animation.c:1834 VerticalSquishBounce. One frame per call. */
export function VerticalSquishBounce(rt: DecompRuntime, sprite: DecompSprite, dummyCallback: (s: DecompSprite, r: DecompRuntime) => void): void {
  let posY = 0;

  if (sprite.data[2] === 0) {
    handleStartAffineAnim(rt, sprite);
    sprite.data[3] = 0;
  }

  tryFlipX(sprite);

  if (sprite.data[2] > sprite.data[0] * 3) {
    handleSetAffineData(rt, sprite, 256, 256, 0);
    sprite.y2 = 0;
    resetSpriteAfterAnim(rt, sprite);
    sprite.callback = (s, r) => waitAnimEnd(r, s, dummyCallback);
  } else {
    const yScale = Sin(sprite.data[4], 32) + 256;

    if (sprite.data[2] > sprite.data[0] && sprite.data[2] < sprite.data[0] * 2) {
      sprite.data[3] += (128 / sprite.data[0]) | 0;
    }
    if (yScale > 256) {
      posY = ((256 - yScale) / 8) | 0;
    }

    sprite.y2 = -(Sin(sprite.data[3], 10)) - posY;
    handleSetAffineData(rt, sprite, 256 - Sin(sprite.data[4], 32), yScale, 0);
    sprite.data[2]++;
    sprite.data[4] = (sprite.data[4] + ((128 / sprite.data[0]) | 0)) & 0xFF;
  }

  tryFlipX(sprite);
}

/** 1:1 décomp pokemon_animation.c:1871 Anim_VerticalSquishBounce. Initialiser. */
export function Anim_VerticalSquishBounce(rt: DecompRuntime, sprite: DecompSprite, dummyCallback: (s: DecompSprite, r: DecompRuntime) => void): void {
  sprite.data[0] = 16;
  VerticalSquishBounce(rt, sprite, dummyCallback);
  sprite.callback = (s, r) => VerticalSquishBounce(r, s, dummyCallback);
}

/** 1:1 décomp pokemon_animation.c:3658 Anim_VerticalSquishBounce_Slow.
 *  data[0] = 8 → faster phase transitions, half-duration cycle. */
export function Anim_VerticalSquishBounce_Slow(rt: DecompRuntime, sprite: DecompSprite, dummyCallback: (s: DecompSprite, r: DecompRuntime) => void): void {
  sprite.data[0] = 8;
  VerticalSquishBounce(rt, sprite, dummyCallback);
  sprite.callback = (s, r) => VerticalSquishBounce(r, s, dummyCallback);
}

// ═══════════════════════════════════════════════════════════════════════════
// sMonAnimFunctions[] — registry indexed by ANIM_*
// ═══════════════════════════════════════════════════════════════════════════
// 1:1 décomp pokemon_animation.c:631-783. Sparse : only implemented anims
// registered. Unmapped ids fall through to ANIM_V_SQUISH_AND_BOUNCE (= the
// most-used anim, also Lotad's). Adding more anim functions = register here.

export type MonAnimFunc = (rt: DecompRuntime, sprite: DecompSprite, dummyCallback: (s: DecompSprite, r: DecompRuntime) => void) => void;

const _sMonAnimFunctions = new Map<number, MonAnimFunc>([
  [ANIM_V_SQUISH_AND_BOUNCE, Anim_VerticalSquishBounce],
  [ANIM_V_SQUISH_AND_BOUNCE_SLOW, Anim_VerticalSquishBounce_Slow],
]);

/** Look up the anim function for an ANIM_* id. Falls back to
 *  Anim_VerticalSquishBounce for unmapped ids. */
export function getMonAnimFunc(animId: number): MonAnimFunc {
  return _sMonAnimFunctions.get(animId) ?? Anim_VerticalSquishBounce;
}

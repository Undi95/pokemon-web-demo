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
// Map SPECIES_X → ANIM_*. Two sources :
//   1) Hardcoded minimal fallback (= 3 entries, ensures Lotad squish marche
//      même sans extraction tournée).
//   2) Generated data from `scripts/extract-mon-anim-tables.mjs` (= 387 species
//      mapping extracted depuis pokemon.c). Run le script pour populate.
//
// Hardcoded fallbacks utilisés sauf override par generated data (= si user
// run l'extraction, les 387 entries écrasent les 3 fallbacks).

export const SPECIES_LOTAD = 295;
export const SPECIES_LOMBRE = 296;
export const SPECIES_LUDICOLO = 297;

const _sMonFrontAnimIds = new Map<number, number>([
  [SPECIES_LOTAD, ANIM_V_SQUISH_AND_BOUNCE],
  [SPECIES_LOMBRE, ANIM_V_SQUISH_AND_BOUNCE],
  [SPECIES_LUDICOLO, ANIM_V_SQUISH_AND_BOUNCE],
]);

const _sMonAnimDelays = new Map<number, number>();
const _sMonHasTwoFrames = new Map<number, boolean>();

/** ANIM_* identifier → numerical constant lookup. Used to resolve string
 *  keys from the extracted data file at module load. */
const ANIM_NAME_TO_ID: Readonly<Record<string, number>> = {
  ANIM_V_SQUISH_AND_BOUNCE,
  ANIM_CIRCULAR_STRETCH_TWICE,
  ANIM_H_VIBRATE,
  ANIM_H_SLIDE,
  ANIM_V_SLIDE,
  ANIM_BOUNCE_ROTATE_TO_SIDES,
  ANIM_V_JUMPS_H_JUMPS,
  ANIM_GROW_VIBRATE,
  ANIM_H_SHAKE,
  ANIM_V_SHAKE,
  ANIM_TWIST,
  ANIM_SHRINK_GROW,
  ANIM_H_STRETCH,
  ANIM_V_STRETCH,
  ANIM_V_SHAKE_TWICE,
  ANIM_V_JUMPS_BIG,
  ANIM_V_SQUISH_AND_BOUNCE_SLOW,
  ANIM_H_SLIDE_SLOW,
  ANIM_V_SLIDE_SLOW,
  ANIM_V_JUMPS_SMALL,
};

/** Bridge from extracted data file (= SPECIES_X / ANIM_Y / 0/1 string keys)
 *  → numerical Maps used at runtime. Lazy : called once at module load.
 *  Resolves SPECIES_* via species-data.ts dynamic import (= 387 entries). */
async function _hydrateFromGeneratedData(): Promise<void> {
  try {
    const [tablesMod, speciesMod] = await Promise.all([
      import('./decomp-data/src/mon-anim-tables-data'),
      import('./decomp-data/include/constants/species-data'),
    ]);
    const speciesNameToId = speciesMod as unknown as Record<string, number>;
    // Front anim ids
    for (const [speciesName, animName] of tablesMod.RAW_MON_FRONT_ANIM_IDS) {
      const speciesId = speciesNameToId[speciesName];
      const animId = ANIM_NAME_TO_ID[animName];
      if (typeof speciesId === 'number' && typeof animId === 'number') {
        _sMonFrontAnimIds.set(speciesId, animId);
      }
    }
    // Delays (= raw int values in C, e.g. `[SPECIES_X - 1] = 0,` → string "0")
    for (const [speciesName, delayStr] of tablesMod.RAW_MON_ANIM_DELAYS) {
      const speciesId = speciesNameToId[speciesName];
      const delay = parseInt(delayStr, 10);
      if (typeof speciesId === 'number' && Number.isFinite(delay)) {
        _sMonAnimDelays.set(speciesId, delay);
      }
    }
    // Has two frames (= TRUE/FALSE in C)
    for (const [speciesName, boolStr] of tablesMod.RAW_MON_HAS_TWO_FRAMES) {
      const speciesId = speciesNameToId[speciesName];
      if (typeof speciesId === 'number') {
        _sMonHasTwoFrames.set(speciesId, /TRUE|1/i.test(boolStr));
      }
    }
    if (tablesMod.RAW_MON_FRONT_ANIM_IDS.length > 0) {
      console.log(`[pokemon-anim-funcs] hydrated ${tablesMod.RAW_MON_FRONT_ANIM_IDS.length} species → anim mappings from extracted data`);
    }
  } catch {
    // Generated file missing / empty / malformed → graceful fallback to
    // hardcoded minimal Map (= Lotad triplet). Pas de log spammy.
  }
}
// Fire-and-forget hydration au module load. Async OK : 1ère utilisation
// arrive bien après le boot async.
void _hydrateFromGeneratedData();

/** Front anim id for a species, defaults to ANIM_V_SQUISH_AND_BOUNCE.
 *  Lit depuis la Map hybride (hardcoded triplet + generated 387 entries
 *  une fois le script extraction tourné). */
export function getMonFrontAnimId(species: number): number {
  return _sMonFrontAnimIds.get(species) ?? ANIM_V_SQUISH_AND_BOUNCE;
}

/** Per-species delay frames before idle anim launch. Default 0 (= immediate). */
export function getMonAnimDelay(species: number): number {
  return _sMonAnimDelays.get(species) ?? 0;
}

/** True if species has 2-frame anim_front sheet (= drives StartSpriteAnim 1).
 *  Default true (= most Gen 3 mons have 2-frame animation). */
export function hasTwoFramesAnimation(species: number): boolean {
  return _sMonHasTwoFrames.get(species) ?? true;
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

/** 1:1 décomp pokemon_animation.c:984 SetAffineData → BIOS ObjAffineSet.
 *  Le BIOS GBA INVERSE le scale : matrice pa/pd = trig / scale, pas trig × scale.
 *  Convention : xScale > 256 → stretch (sprite bigger), xScale < 256 → shrink.
 *  Le rendu OAM applique matrix × screenCoord = textureCoord. Pour stretcher
 *  le sprite, il faut que screen pixel ↦ smaller texture pixel → pa < 256.
 *  Donc pa = cos × 256 / xScale (= inverse).
 *
 *  Bug session 96 : avant on faisait `(xScale * cos) >> 8` (= direct, pas
 *  inverse) → effet visuellement INVERSÉ : décomp dit "stretch" notre impl
 *  "shrink", et vice-versa. User feedback "Lotad squish effet moindre / pas
 *  visible comme sur GBA" venait de cette inversion.
 *
 *  Slot 0 reserved as identity for AFFINE_OFF — skip writes there. */
function setAffineData(rt: DecompRuntime, sprite: DecompSprite, xScale: number, yScale: number, rotation: number): void {
  const matrixNum = sprite.matrixNum;
  if (matrixNum <= 0 || matrixNum >= 32) return;
  if (xScale === 0 || yScale === 0) return;  // safety vs div-zero

  const rot = rotation & 0xFFFF;
  const sin = Sin(rot, 256);
  const cos = Sin(rot + 64, 256);
  // 1:1 BIOS ObjAffineSet : pa/pb scale par xScale^-1, pc/pd par yScale^-1.
  const pa =  ((cos << 8) / xScale) | 0;
  const pb = -((sin << 8) / xScale) | 0;
  const pc =  ((sin << 8) / yScale) | 0;
  const pd =  ((cos << 8) / yScale) | 0;

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
    // User feedback session 96 : Lotad doit revenir sur frame BASE (= 0) après
    // la squish anim, pas rester sur frame 1 (= alt pose). Le décomp laisse
    // sprite anim 1 (= StartSpriteAnim(sprite, 1) au début, jamais reset),
    // mais visuellement la ROM affiche frame 0. Cause probable : sprite
    // animation system continue de cycle entre les 2 frames du anim_front.png
    // une fois la squish terminée. Pour matcher la ROM observable, on switch
    // explicitement à anim 0 + write oam.tileId direct (= StartSpriteAnim
    // no-op pour sprites créés via CreateSpriteAtOam, donc fallback direct).
    rt.StartSpriteAnim(sprite.spriteId, 0);
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.tileId = sprite.tileBase || 0;
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

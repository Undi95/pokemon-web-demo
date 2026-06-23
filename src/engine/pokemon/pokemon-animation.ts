/**
 * pokemon-animation.ts
 * --------------------
 * Shared 1:1 décomp `src/pokemon.c` + `src/pokemon_animation.c` mon-sprite
 * animation infrastructure. Used by every scene displaying a Pokemon front
 * pic with idle animation: Birch intro, battle send-out, egg hatch, evolution,
 * trade, summary screen, storage, Pokedex.
 *
 * Réunit MAINTENANT les fonctions d'anim per-species (anciennement
 * `pokemon-anim-funcs.ts`, fusionné — la décomp n'a qu'UN fichier
 * `pokemon_animation.c` : registre sMonAnimFunctions[] + tables front-anim
 * id/delay/has-two-frames + helpers affine, en bas de ce fichier).
 *
 * Decomp refs:
 *   - DoMonFrontSpriteAnimation         pokemon.c:6779
 *   - LaunchAnimationTaskForFrontSprite pokemon_animation.c:941
 *   - HasTwoFramesAnimation             pokemon.c (sMonHasTwoFramesAnimationTable)
 *   - gAnims_MonPic                     data.c:269-299
 *   - sMonFrontAnimIdsTable             data/pokemon_graphics/front_pic_anims.h
 *
 * SpriteCallbackDummy_2 vs SpriteCallbackDummy : pokemon.c:6822 sets
 * `sprite->callback = SpriteCallbackDummy_2` (= same body, distinct reference).
 * Tasks waiting for mon anim end check `callback != SpriteCallbackDummy` —
 * which stays TRUE because the callback is _Dummy_2. Confusing them was a
 * known bug. We expose both sentinels.
 */

import type { DecompRuntime, DecompSprite } from '../../../harness/runtime/decomp-runtime';
import { Sin } from '../../../harness/runtime/decomp-helpers';

// ─── Sentinel callbacks ─────────────────────────────────────────────────────
// 1:1 décomp src/sprite.c SpriteCallbackDummy / SpriteCallbackDummy_2.
export function SpriteCallbackDummy(_sprite: DecompSprite, _rt: DecompRuntime): void { /* no-op */ }
export function SpriteCallbackDummy_2(_sprite: DecompSprite, _rt: DecompRuntime): void { /* no-op */ }

// ─── HasTwoFramesAnimation 1:1 décomp src/pokemon.c ─────────────────────────
// TODO foundational : extract sMonHasTwoFramesAnimationTable. Most Gen 3 mons
// have 2-frame anim, default TRUE is safe for now (Lotad species 270 confirmed).
export function HasTwoFramesAnimation(_species: number): boolean {
  return true;
}

// ─── gAnims_MonPic — 1:1 décomp src/data.c:269-299 ─────────────────────────
// Per-frame cycle for mon front pic. 4 anims, each frame i with duration 0
// (= "stay on this frame indefinitely"). Animation timing driven by per-species
// front anim function (= sMonAnimFunctions[]).
export interface MonPicAnim {
  frames: ReadonlyArray<{ tile: number, duration: number }>;
  terminator: 'END';
}
export const gAnims_MonPic: ReadonlyArray<MonPicAnim> = [
  { frames: [{ tile: 0, duration: 0 }], terminator: 'END' },
  { frames: [{ tile: 1, duration: 0 }], terminator: 'END' },
  { frames: [{ tile: 2, duration: 0 }], terminator: 'END' },
  { frames: [{ tile: 3, duration: 0 }], terminator: 'END' },
];

// ─── MonAnimController — tracks active mon idle anims ──────────────────────

export interface MonAnimController {
  spriteId: number;
  animId: number;
  /** Frame counter for the 2-frame breathing fallback. */
  counter: number;
  active: boolean;
  /** Tiles per anim frame, derived from OAM shape/size. */
  tilesPerFrame: number;
  /** Initial tile offset (= sprite.tileBase, captured at launch). */
  tileBase: number;
}

const _activeMonAnims: Map<number, MonAnimController> = new Map();

/** Tiles per anim frame derived from OAM shape/size. 1:1 décomp GBA OAM size
 *  matrix (= include/gba/types.h ST_OAM_SQUARE/H_RECTANGLE/V_RECTANGLE × size 0-3).
 *  Mon front pic = shape=0 size=3 (64×64 = 64 tiles). */
function _tilesPerMonPicFrame(shape: number, size: number): number {
  const SQUARE: ReadonlyArray<[number, number]> = [[8, 8], [16, 16], [32, 32], [64, 64]];
  const H_RECT: ReadonlyArray<[number, number]> = [[16, 8], [32, 8], [32, 16], [64, 32]];
  const V_RECT: ReadonlyArray<[number, number]> = [[8, 16], [8, 32], [16, 32], [32, 64]];
  const table = shape === 0 ? SQUARE : shape === 1 ? H_RECT : V_RECT;
  const [w, h] = table[size & 3] ?? [8, 8];
  return (w / 8) * (h / 8);
}

// ─── LaunchAnimationTaskForFrontSprite 1:1 décomp pokemon_animation.c:941 ──
// Decomp:
//   void LaunchAnimationTaskForFrontSprite(struct Sprite *sprite, u8 frontAnimId)
//   {
//       u8 taskId = CreateTask(Task_HandleMonAnimation, 128);
//       gTasks[taskId].tPtrHi = (u32)(sprite) >> 16;
//       gTasks[taskId].tPtrLo = (u32)(sprite);
//       gTasks[taskId].tAnimId = frontAnimId;
//   }
//
// Task_HandleMonAnimation (décomp pokemon_animation.c:893-938) :
//   case 0: sets sprite->sDontFlip=TRUE, sprite->data[0]=0, data[2..]=0,
//           sprite->callback = sMonAnimFunctions[tAnimId]. tState++.
//   case 1: when sprite->callback==SpriteCallbackDummy → DestroyTask.
//
// Notre impl : on collapse le task en direct callback swap (= équivalent
// fonctionnel ; aucune scene en dépend du task ID). Le sprite anim function
// (= sMonAnimFunctions[animId]) tourne ensuite via le sprite-callback runner
// du compositor.
//
// IMPORTANT — Session 95 fix bug "Lotad clignote sans cesse" :
// Avant on ajoutait une 2nd task qui togglait tileId 0↔1 toutes les 30 frames,
// pensant que c'était le "2-frame cycling" du décomp. FAUX : le décomp ne fait
// PAS de cycling continu. `HasTwoFramesAnimation(species)` cause juste UN seul
// `StartSpriteAnim(sprite, 1)` (= switch to frame 1 = pose alternative), puis
// l'affine anim (squish/bounce) tourne UNE fois et se termine. Le sprite reste
// sur la frame 1 indéfiniment après. Cf. pokemon.c:6803-6808.

export function LaunchAnimationTaskForFrontSprite(rt: DecompRuntime, sprite: DecompSprite, frontAnimId: number): void {
  const tilesPerFrame = _tilesPerMonPicFrame(sprite.shape, sprite.size);
  const tileBase = sprite.tileBase || 0;

  _activeMonAnims.set(sprite.spriteId, {
    spriteId: sprite.spriteId,
    animId: frontAnimId,
    counter: 0,
    active: true,
    tilesPerFrame,
    tileBase,
  });

  // 1:1 décomp Task_HandleMonAnimation case 0 : sDontFlip=TRUE, data[0]=0,
  // data[2..]=0. data[1]=sDontFlip MUST be set BEFORE animFunc runs car les
  // anim functions le testent (= Anim_VerticalSquishBounce le check pour
  // décider de flip horizontalement la matrix).
  sprite.data[1] = 1;
  sprite.data[0] = 0;
  for (let i = 2; i < sprite.data.length; i++) sprite.data[i] = 0;

  // 1:1 décomp `sprite->callback = sMonAnimFunctions[gTasks[taskId].tAnimId]`.
  // Pour Lotad species 270, frontAnimId = 0x07 (FRONT_ANIM_VERTICAL_SQUISH_AND_BOUNCE)
  // → callback = Anim_VerticalSquishBounce. Tourne ~48 frames puis sprite->callback
  // = SpriteCallbackDummy (= self-destructs via Task_HandleMonAnimation case 1).
  getMonAnimFunc(frontAnimId)(rt, sprite, SpriteCallbackDummy);
}

/** Stop the idle anim for a given sprite (e.g. on DESTROY or scene exit).
 *  1:1 décomp pattern : sprite.callback = SpriteCallbackDummy. */
export function StopMonFrontSpriteAnimation(rt: DecompRuntime, spriteId: number): void {
  const ctrl = _activeMonAnims.get(spriteId);
  if (ctrl) ctrl.active = false;
  _activeMonAnims.delete(spriteId);
  const sprite = rt.gSprites[spriteId];
  if (sprite) sprite.callback = SpriteCallbackDummy;
}

/** Reset all active mon anims (= ResetSpriteData / scene transitions). */
export function ResetAllMonAnimations(): void {
  _activeMonAnims.clear();
}

// ─── DoMonFrontSpriteAnimation 1:1 décomp pokemon.c:6779 ────────────────────
// Pan: panMode 0 = -25, 1 = +25, 2+ = 0. Bit 7 (SKIP_FRONT_ANIM) skips the anim.
// Flow: PlayCry → StartSpriteAnim(sprite,1) if 2-frame → Launch idle anim →
//       sprite.callback = SpriteCallbackDummy_2.
// Foundational: called by Birch (arc end), battle send-out, egg hatch, evo,
// trade, Pokedex. Single source of truth.

export const SKIP_FRONT_ANIM = 0x80;

export function DoMonFrontSpriteAnimation(
  rt: DecompRuntime,
  sprite: DecompSprite,
  species: number,
  noCry: boolean,
  panModeAnimFlag: number,
  playCryFn: (species: number, pan: number) => void,
  /** Optional override. If unset (= -1 sentinel), looked up via
   *  getMonFrontAnimId(species) (= 1:1 décomp pokemon.c:6820 :
   *  LaunchAnimationTaskForFrontSprite(sprite, sMonFrontAnimIdsTable[species - 1])). */
  frontAnimIdOverride: number = -1,
): void {
  const skipAnim = !!(panModeAnimFlag & SKIP_FRONT_ANIM);
  const panMode = panModeAnimFlag & ~SKIP_FRONT_ANIM;
  const pan = panMode === 0 ? -25 : panMode === 1 ? 25 : 0;

  if (skipAnim) {
    if (!noCry) playCryFn(species, pan);
    sprite.callback = SpriteCallbackDummy;
    return;
  }

  if (!noCry) {
    playCryFn(species, pan);
    if (HasTwoFramesAnimation(species)) {
      // 1:1 décomp StartSpriteAnim(sprite, 1) + (Session 91) direct oam.tileId
      // write so the switch is visible immediately for sprites NOT in
      // spriteAnimStates (= CreateSpriteAtOam path, where StartSpriteAnim no-ops).
      rt.StartSpriteAnim(sprite.spriteId, 1);
      const tilesPerFrame = _tilesPerMonPicFrame(sprite.shape, sprite.size);
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.tileId = (sprite.tileBase || 0) + tilesPerFrame;
    }
  }

  // 1:1 décomp pokemon.c:6820 — frontAnimId résolu via sMonFrontAnimIdsTable[species - 1].
  // Si caller a passé un override explicite, on l'utilise (= flexibilité pour
  // testing). Sinon, lookup via la table extraite (= 387 species).
  const frontAnimId = frontAnimIdOverride >= 0 ? frontAnimIdOverride : getMonFrontAnimId(species);

  // 1:1 décomp pokemon.c:6809-6815 — sMonAnimationDelayTable. Most species 0.
  // TODO future: delay path requires sMonAnimationDelayTable extraction.
  LaunchAnimationTaskForFrontSprite(rt, sprite, frontAnimId);

  // Décomp pokemon.c:6822 sets sprite.callback = SpriteCallbackDummy_2 here,
  // overwriting the anim function — because decomp drives the anim via the
  // launched TASK, not the callback. Our impl uses the callback directly, so
  // we skip this overwrite. Callers checking `callback != SpriteCallbackDummy`
  // still pass (= the anim function is also != SpriteCallbackDummy).
  // SpriteCallbackDummy_2 is exported for callers that need the explicit ref.
}

// ═══════════════════════════════════════════════════════════════════════════
// PER-SPECIES FRONT-PIC ANIM FUNCTIONS — 1:1 décomp `src/pokemon_animation.c`
// (anciennement pokemon-anim-funcs.ts, fusionné : la décomp n'a qu'UN fichier
// pokemon_animation.c). Registre `sMonAnimFunctions[]` + tables front-anim id /
// delay / has-two-frames + helpers affine (SetAffineData/ObjAffineSet).
// ═══════════════════════════════════════════════════════════════════════════

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
      import('../decomp-data/src/mon-anim-tables-data'),
      import('../../../include/constants/species'),
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
      console.log(`[pokemon-animation] hydrated ${tablesMod.RAW_MON_FRONT_ANIM_IDS.length} species → anim mappings from extracted data`);
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

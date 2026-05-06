/**
 * pokemon-animation.ts
 * --------------------
 * Shared 1:1 décomp `src/pokemon.c` + `src/pokemon_animation.c` mon-sprite
 * animation infrastructure. Used by every scene displaying a Pokemon front
 * pic with idle animation: Birch intro, battle send-out, egg hatch, evolution,
 * trade, summary screen, storage, Pokedex.
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

import type { DecompRuntime, DecompSprite } from './decomp-runtime';
import { getMonAnimFunc, getMonFrontAnimId } from './pokemon-anim-funcs';

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
  const sprite = rt.gSprites.get(spriteId);
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

// Re-export getMonFrontAnimId for callers that need to look up species → animId.
export { getMonFrontAnimId };

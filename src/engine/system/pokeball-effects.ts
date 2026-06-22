/**
 * Shared infrastructure for poke-ball release/return visual effects.
 * Used by EVERY scene that releases a Pokemon from a ball:
 *   - Birch intro speech (NewGameBirchSpeech_*)
 *   - Battles : send-out, switch-in (pokeball.c:SpriteCB_ReleaseMonFromBall)
 *   - Egg hatch (egg_hatch.c:858 StartSpriteAffineAnim BATTLER_AFFINE_EMERGE)
 *   - Evolution scenes
 *   - Trade scenes
 *
 * All three primitives below are 1:1 transcriptions from the decomp
 * `src/battle_anim_throw.c` and `src/pokeball.c`. Implementing them here as
 * standalone, reusable helpers means future scenes don't reinvent the wheel.
 *
 * Decomp references :
 *   - LaunchBallFadeMonTask    : src/battle_anim_throw.c:2033 (palette flash)
 *   - AnimateBallOpenParticles : src/battle_anim_throw.c:1577 (sparkles spawn)
 *   - PokeBallOpenParticleAnimation : src/battle_anim_throw.c:1599 (per-frame spawn loop)
 *   - PokeBallOpenParticleAnimation_Step1/Step2 : :1643/:1651 (sparkle motion)
 *   - sBallParticleSpriteSheets : src/battle_anim_throw.c:143 (gfx tag table)
 *   - gBallOpenFadeColors      : src/battle_anim_throw.c:371 (per-ball flash color)
 *   - sAffineAnim_Battler_Emerge : src/data.c:144 (scale 0x28 → 0x100 over 12f)
 *   - SetUpForReleaseAffineAnim  : (this file) — helper to wire a mon sprite
 *     for affine emerge/return (= alloc matrixNum + set affineMode + table).
 */

import type { DecompRuntime, DecompSprite } from './decomp-runtime';
import { ST_OAM_AFFINE_NORMAL, ST_OAM_AFFINE_OFF } from './decomp-helpers';
import {
  MarkObjTilesAllocated, MarkObjPaletteAllocated,
  IndexOfSpritePaletteTag, GetSpriteTileStartByTag, AllocSpriteTileRange,
  DestroySprite, AllocOamMatrix, FreeOamMatrix,
} from '../../game/sprite';

// ─── Ball IDs (1:1 décomp include/constants/items.h) ────────────────────────
export const BALL_POKE = 0;
export const BALL_GREAT = 1;
export const BALL_SAFARI = 2;
export const BALL_ULTRA = 3;
export const BALL_MASTER = 4;
export const BALL_NET = 5;
export const BALL_DIVE = 6;
export const BALL_NEST = 7;
export const BALL_REPEAT = 8;
export const BALL_TIMER = 9;
export const BALL_LUXURY = 10;
export const BALL_PREMIER = 11;
export const POKEBALL_COUNT = 12;

// 1:1 décomp src/battle_anim_throw.c:371 — per-ball-type RGB15 flash blend
// color. The mon's OBJ palette is BlendPalette()'d toward this color over 16
// frames, then back. (= pink-purple for Poké Ball, blue for Great, etc.)
//   RGB(31, 22, 30) = (30 << 10) | (22 << 5) | 31 = 0x7AD7? recompute :
//   RGB macro = (b << 10) | (g << 5) | r → (30<<10)|(22<<5)|31 = 30720|704|31 = 31455 = 0x7ADF.
function _RGB(r: number, g: number, b: number): number {
  return ((b & 0x1F) << 10) | ((g & 0x1F) << 5) | (r & 0x1F);
}

export const gBallOpenFadeColors: ReadonlyArray<number> = [
  _RGB(31, 22, 30),  // BALL_POKE
  _RGB(16, 23, 30),  // BALL_GREAT
  _RGB(23, 30, 20),  // BALL_SAFARI
  _RGB(31, 31, 15),  // BALL_ULTRA
  _RGB(23, 20, 28),  // BALL_MASTER
  _RGB(21, 31, 25),  // BALL_NET
  _RGB(12, 25, 30),  // BALL_DIVE
  _RGB(30, 27, 10),  // BALL_NEST
  _RGB(31, 24, 16),  // BALL_REPEAT
  _RGB(29, 30, 30),  // BALL_TIMER
  _RGB(31, 17, 10),  // BALL_LUXURY
  _RGB(31,  9, 10),  // BALL_PREMIER
];

// ============================================================================
// SetUpForReleaseAffineAnim — wire a mon sprite for `BATTLER_AFFINE_EMERGE`
// ============================================================================
//
// Mon sprites in our engine are created via `CreateSpriteAtOam` which sets
// `affineMode=0` (= AFFINE_OFF) and `affineAnimsTableName=null`. Decomp mon
// sprites use the `gBattlerPicTable_*` template which sets
// `affineAnims = gAffineAnims_BattleSpritePlayerSide` (or OpponentSide). To
// get `StartSpriteAffineAnim(BATTLER_AFFINE_EMERGE)` to actually animate, we
// must replicate that template state on our sprite.
//
// 1:1 décomp : when a battler sprite is created via CreateSprite from
// gBattlerPicTable_* template, the affine anim table is auto-attached. Our
// non-battler creators (NewGameBirchSpeech_CreateLotadSprite et al) skip this
// because they use plain CreateSpriteAtOam. This helper bridges that gap.
//
// `side` defaults to PLAYER (= same anims for non-battle scenes — emerge is
// identical between player/opponent/contest tables, only the rest differ).

export type BattlerAffineSide = 'player' | 'opponent' | 'contest';

const BATTLER_AFFINE_TABLE_NAMES: Record<BattlerAffineSide, string> = {
  player:   'gAffineAnims_BattleSpritePlayerSide',
  opponent: 'gAffineAnims_BattleSpriteOpponentSide',
  contest:  'gAffineAnims_BattleSpriteContest',
};

/** Wire `monSpriteId` so that `StartSpriteAffineAnim(monSpriteId, BATTLER_AFFINE_EMERGE)`
 *  actually plays (= alloc matrix slot, set affineMode=AFFINE_NORMAL, attach
 *  the affineAnimsTableName).
 *
 *  Idempotent : repeated calls reuse the same matrix slot.
 *  Returns the allocated matrixNum, or -1 on failure. */
export function SetUpForReleaseAffineAnim(rt: DecompRuntime, monSpriteId: number, side: BattlerAffineSide = 'player'): number {
  const sprite = rt.gSprites[monSpriteId];
  if (!sprite) return -1;

  // Allocate a matrix slot if the sprite doesn't already own one (= matrixNum > 0).
  // matrixNum == 0 means "not yet allocated" (slot 0 is the default identity).
  if (sprite.matrixNum <= 0) {
    const slot = AllocOamMatrix();
    if (slot < 0) return -1;
    sprite.matrixNum = slot;
  }

  sprite.affineAnimsTableName = BATTLER_AFFINE_TABLE_NAMES[side];
  sprite.affineMode = ST_OAM_AFFINE_NORMAL as 0 | 1 | 2 | 3;

  // Sync OAM affine state — the compositor uses oam.affineMode and
  // oam.affineParamIndex. tickAllAffineAnims also reads from oam.
  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) {
    oam.affineMode = ST_OAM_AFFINE_NORMAL;
    oam.affineParamIndex = sprite.matrixNum;
  }

  return sprite.matrixNum;
}

/** Tear down the affine state once the release/emerge anim is complete.
 *  1:1 décomp pattern : `gSprites[id].oam.affineMode = ST_OAM_AFFINE_OFF` +
 *  `FreeOamMatrix(matrixNum)` (cf. main_menu.c:Task_NewGameBirchSpeechSub_WaitForLotad). */
export function TearDownReleaseAffineAnim(rt: DecompRuntime, monSpriteId: number): void {
  const sprite = rt.gSprites[monSpriteId];
  if (!sprite) return;

  if (sprite.matrixNum > 0) {
    FreeOamMatrix(sprite.matrixNum);
    sprite.matrixNum = 0;
  }
  sprite.affineMode = ST_OAM_AFFINE_OFF as 0 | 1 | 2 | 3;
  sprite.affineAnimsTableName = null;

  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) {
    oam.affineMode = ST_OAM_AFFINE_OFF;
    oam.affineParamIndex = 0;
  }
}

// ============================================================================
// LaunchBallFadeMonTask — palette flash effect (white flash + restore)
// ============================================================================
//
// 1:1 décomp src/battle_anim_throw.c:2033 :
//   u8 LaunchBallFadeMonTask(bool8 unfadeLater, u8 spritePalNum, u32 selectedPalettes, u8 ballId)
//   {
//       u8 taskId = CreateTask(Task_FadeMon_ToBallColor, 5);
//       gTasks[taskId].tBallId = ballId;
//       gTasks[taskId].tPalOffset = spritePalNum;
//       gTasks[taskId].tPaletteLo = selectedPalettes;
//       gTasks[taskId].tPaletteHi = selectedPalettes >> 16;
//       if (!unfadeLater) {
//           BlendPalette(OBJ_PLTT_ID(spritePalNum), 16, 0, gBallOpenFadeColors[ballId]);
//           gTasks[taskId].tdCoeff = 1;
//       } else {
//           BlendPalette(OBJ_PLTT_ID(spritePalNum), 16, 16, gBallOpenFadeColors[ballId]);
//           gTasks[taskId].tCoeff = 16;
//           gTasks[taskId].tdCoeff = -1;
//           gTasks[taskId].func = Task_FadeMon_ToNormal;
//       }
//       BeginNormalPaletteFade(selectedPalettes, 0, 0, 16, RGB_WHITE);
//       return taskId;
//   }
//
// Effect when `unfadeLater = TRUE` (release case, called from
// SpriteCB_ReleaseMonFromBall) :
//   1) Pre-blend the mon's palette FULLY toward the ball color (coeff=16).
//   2) Trigger BeginNormalPaletteFade to white (= flashy ball-open burst).
//   3) Tick the task : ramp coeff from 16 down to 0 over ~16 frames (= fades
//      the ball-tint AWAY, revealing the original mon palette).
//   4) When done : trigger another BeginNormalPaletteFade back from white to
//      normal — completing the "white flash" effect.

export function LaunchBallFadeMonTask(rt: DecompRuntime, unfadeLater: boolean, spritePalNum: number, selectedPalettes: number, ballId: number): number {
  // OBJ_PLTT_ID(n) in décomp is `(n + 16) * 16` because PLTT register puts
  // OBJ palettes at offset 256 (= 16 BG palettes × 16 colors). Our PaletteBuffer
  // is one flat 512-entry buffer where OBJ starts at index 256 — same indexing.
  const PLTT_OFFSET = (spritePalNum + 16) * 16;  // = OBJ_PLTT_ID
  const RGB_WHITE = 0x7FFF;
  const fadeColor = gBallOpenFadeColors[ballId] ?? gBallOpenFadeColors[BALL_POKE];

  const { BlendPalette } = _bp();

  // Debug : enable via `window.__BIRCH_FADE_DEBUG = true` in console.
  const _dbg = (globalThis as Record<string, unknown>).__BIRCH_FADE_DEBUG === true;
  if (_dbg) {
    console.log(`[BirchFade] LaunchBallFadeMonTask unfadeLater=${unfadeLater} palNum=${spritePalNum} (PLTT_OFFSET=${PLTT_OFFSET}) selPalettes=${selectedPalettes.toString(16)} ballId=${ballId} fadeColor=0x${fadeColor.toString(16).padStart(4, '0')}`);
  }

  if (!unfadeLater) {
    BlendPalette(PLTT_OFFSET, 16, 0, fadeColor);
  } else {
    BlendPalette(PLTT_OFFSET, 16, 16, fadeColor);
  }

  // 1:1 décomp battle_anim_throw.c:2056 :
  //   BeginNormalPaletteFade(selectedPalettes, 0, 0, 16, RGB_WHITE);
  // Bug session 89 : avant cette ligne, BlendPalette tintait le mon ball-pink
  // mais la phase fade-to-white ne s'enclenchait jamais (= user feedback :
  // "couleur du lotad qui change mais pas raccord avec le flash"). Le fade
  // engine ramp BLDY 0→16 vers blanc sur 16 frames (= le flash visuel).
  rt.BeginNormalPaletteFade(selectedPalettes, 0, 0, 16, RGB_WHITE);

  // Spawn the fade-tick task. The task ramps coeff over 16 frames and then
  // triggers a second BeginNormalPaletteFade (white → normal).
  const taskId = rt.CreateTask((task) => {
    // task.data : [tCoeff, tdCoeff, tTimer, tPalOffset, tPaletteLo, tPaletteHi, tBallId, _state]
    // 1:1 décomp src/battle_anim_throw.c:2060 Task_FadeMon_ToBallColor /
    // :2078 Task_FadeMon_ToNormal — implemented as a single state machine
    // here for compactness (the original splits via task.func reassignment).
    const state = task.data[7];  // 0=ToBallColor, 1=ToNormalWait, 2=ToNormalStep
    if (state === 0) {
      if (task.data[2] <= 16) {
        BlendPalette(task.data[3], 16, task.data[0], fadeColor);
        task.data[0] += task.data[1];  // tCoeff += tdCoeff
        task.data[2]++;                // tTimer++
      } else if (!rt.gPaletteFade.active) {
        const sel = (task.data[4] & 0xFFFF) | ((task.data[5] & 0xFFFF) << 16);
        if (unfadeLater) {
          rt.BeginNormalPaletteFade(sel, 0, 16, 0, RGB_WHITE);
          task.data[7] = 1;
        } else {
          rt.BeginNormalPaletteFade(sel, 0, 16, 0, RGB_WHITE);
          rt.DestroyTask(task.taskId);
        }
      }
    } else if (state === 1) {
      if (!rt.gPaletteFade.active) {
        const sel = (task.data[4] & 0xFFFF) | ((task.data[5] & 0xFFFF) << 16);
        rt.BeginNormalPaletteFade(sel, 0, 16, 0, RGB_WHITE);
        task.data[7] = 2;
        task.data[2] = 0;
      }
    } else if (state === 2) {
      if (task.data[2] <= 16) {
        BlendPalette(task.data[3], 16, task.data[0], fadeColor);
        task.data[0] += task.data[1];
        task.data[2]++;
      } else {
        rt.DestroyTask(task.taskId);
      }
    }
  }, 5);

  const task = rt.gTasks.get(taskId);
  if (task) {
    if (!unfadeLater) {
      // 1:1 décomp battle_anim_throw.c:2046 : tCoeff=1, tdCoeff=1, state=ToBallColor
      task.data[0] = 1;    // tCoeff
      task.data[1] = 1;    // tdCoeff
      task.data[7] = 0;    // state = ToBallColor
    } else {
      // 1:1 décomp battle_anim_throw.c:2050-2053 : tCoeff=16, tdCoeff=-1,
      // task.func = Task_FadeMon_ToNormal (skips ToBallColor entirely).
      task.data[0] = 16;
      task.data[1] = -1;
      task.data[7] = 1;    // state = ToNormal
    }
    task.data[2] = 0;        // tTimer
    task.data[3] = PLTT_OFFSET; // tPalOffset
    task.data[4] = selectedPalettes & 0xFFFF;          // tPaletteLo
    task.data[5] = (selectedPalettes >>> 16) & 0xFFFF; // tPaletteHi
    task.data[6] = ballId;   // tBallId
  }

  // Session 91 fix : the previous (V2) impl had a SECOND `BeginNormalPaletteFade`
  // call here, which was a duplicate of the one at line 204 above. The decomp
  // (`battle_anim_throw.c:2056`) only calls it ONCE. The duplicate was harmless
  // (= second call returns early because `gPaletteFade.active === true` after
  // the first), but it created subtle confusion when reading the code and
  // would silently mask a bug if the first call was ever skipped or moved.
  // Single-call now, exactly 1:1 décomp.

  return taskId;
}

// Lazy-loaded BlendPalette — circular dep guard with decomp-globals.
type BlendPaletteFn = (palOffset: number, numEntries: number, coeff: number, blendColor: number) => void;
let _blendPaletteFn: BlendPaletteFn | null = null;
function _bp(): { BlendPalette: BlendPaletteFn } {
  if (!_blendPaletteFn) {
    // Resolved via globalThis — decomp-globals.ts attaches BlendPalette there
    // at module load time (= side-effect of importing decomp-globals from
    // GameScene). Calling _bp before that bridge is set is a usage error.
    const fn = (globalThis as Record<string, unknown>).BlendPalette;
    if (typeof fn === 'function') {
      _blendPaletteFn = fn as unknown as BlendPaletteFn;
    } else {
      // No-op fallback (= sparkle anim still works visually, just no flash).
      _blendPaletteFn = () => { /* no-op until decomp-globals loaded */ };
    }
  }
  return { BlendPalette: _blendPaletteFn };
}

// ============================================================================
// AnimateBallOpenParticles — sparkle spawn task
// ============================================================================
//
// ⚠ DETTE PLACEMENT (2026-06-12) : cette version simplifiée (BALL_POKE-only,
// cycle d'anim inline, un seul tag) ne sert PLUS QUE le chemin Birch/OW
// (decomp-globals SpriteCB release Lotad = pokeball.c
// AnimateBallOpenParticlesForPokeball, hors combat). TOUS les chemins COMBAT
// (send-out, capture, switch-out) passent par le miroir 1:1 complet :
// src/game/battle_anim_throw.ts AnimateBallOpenParticles (12 types de balls,
// tables sBallParticle*, numBallParticles, libération des tags). À absorber
// dans le miroir quand le chemin Birch sera migré.
//
// 1:1 décomp src/battle_anim_throw.c:1577 :
//   u8 AnimateBallOpenParticles(u8 x, u8 y, u8 priority, u8 subpriority, u8 ballId)
//   {
//       LoadBallParticleGfx(ballId);
//       taskId = CreateTask(sBallParticleAnimationFuncs[ballId], 5);
//       gTasks[taskId].data[1] = x;
//       gTasks[taskId].data[2] = y;
//       gTasks[taskId].data[3] = priority;
//       gTasks[taskId].data[4] = subpriority;
//       gTasks[taskId].data[15] = ballId;
//       PlaySE(SE_BALL_OPEN);
//       return taskId;
//   }
//
// For BALL_POKE the tick func is PokeBallOpenParticleAnimation (battle_anim_throw.c:1599),
// which spawns ONE sprite per frame for 16 frames :
//   spawnedSprite.data[0] = ((data[0] >= 8 ? data[0] - 8 : data[0]) * 32);
//   spawnedSprite.callback = PokeBallOpenParticleAnimation_Step1;
//   ... + sBallParticleAnimNums[ballId] for the sprite frame anim.
//
// PokeBallOpenParticleAnimation_Step1/Step2 (lines :1643/:1651) :
//   step1 : if (data[1] == 0) goto step2; else data[1]--;  (delay 0 frames)
//   step2 : x2 = Sin(data[0], data[1]);
//           y2 = Cos(data[0], data[1]);
//           data[1] += 2;
//           if (data[1] == 50) DestroyBallOpenAnimationParticle(sprite);
//
// data[0] = angle (0..255), data[1] = radius. So each sparkle starts at
// (x, y - 5), with a fixed angle (i*32), radius starting at 0, growing by
// 2/frame until it reaches 50 → particle destroyed.

const PARTICLES_TILE_TAG = 'TAG_PARTICLES_POKEBALL';
const PARTICLES_PAL_TAG = 0xD8FF;  // unique slot for ball-particle palette

export function AnimateBallOpenParticles(rt: DecompRuntime, x: number, y: number, priority: number, _subpriority: number, ballId: number = BALL_POKE): number {
  // 1:1 décomp battle_anim_throw.c:1568 LoadBallParticleGfx(ballId) — load
  // the particle sprite sheet + palette into OBJ VRAM. Idempotent (the
  // engine's LoadCompressedSpriteSheet skips if the tag already exists).
  loadParticlesAssets(rt, ballId);

  // 1:1 STRICT décomp lookup via array primary (sprite.c:1542 + :1637).
  const tileBaseRaw = GetSpriteTileStartByTag(PARTICLES_TILE_TAG);
  const palSlotRaw = IndexOfSpritePaletteTag(PARTICLES_PAL_TAG);
  const tileBase = tileBaseRaw === 0xFFFF ? 0 : tileBaseRaw;
  const palSlot = palSlotRaw === 0xFF ? 0 : palSlotRaw;

  const taskId = rt.CreateTask((task) => {
    // task.data[0] = spawn frame counter (= the décomp `data[0]` in
    // PokeBallOpenParticleAnimation). Spawn 16 sparkles total, one per frame.
    if (task.data[0] >= 16) {
      rt.DestroyTask(task.taskId);
      return;
    }
    spawnSparkle(rt, task.data[1], task.data[2], task.data[3], tileBase, palSlot, task.data[0]);
    task.data[0]++;
  }, 5);

  const task = rt.gTasks.get(taskId);
  if (task) {
    task.data[0] = 0;
    task.data[1] = x;
    task.data[2] = y;
    task.data[3] = priority;
    task.data[4] = 0;  // subpriority (not currently used)
    task.data[15] = ballId;
  }

  // SE_BALL_OPEN is played by the caller (= 1:1 décomp puts PlaySE inside
  // AnimateBallOpenParticles, but our existing CreatePokeballSpriteToReleaseMon
  // already plays it; to avoid double-play we leave PlaySE to the caller).

  return taskId;
}

// ─── Spawn ONE sparkle (1:1 décomp PokeBallOpenParticleAnimation body) ─────
// 1:1 décomp battle_anim_throw.c:175 sAnim_RegularBall (BALL_POKE/Great/Safari):
//   ANIMCMD_FRAME(0, 1), ANIMCMD_FRAME(1, 1), ANIMCMD_FRAME(2, 1),
//   ANIMCMD_FRAME(0, 1, hFlip=TRUE), ANIMCMD_FRAME(2, 1), ANIMCMD_FRAME(1, 1),
//   ANIMCMD_JUMP(0)  — looping cycle of 6 frames.
// Each entry = { tileOffset, hFlip }. Duration = 1 game frame each.
// TODO 1:1 propre : enregistrer dans SPRITE_ANIMS/SPRITE_ANIM_TABLES (=
// sprite-anim-extras.ts à créer) + utiliser StartSpriteAnim. Pour l'instant
// cycle inline dans la sprite callback car sAnim_RegularBall pas encore
// transpilé dans sprite-system.ts (= bug auto-générateur sur battle_anim_throw.c).
const _RegularBallAnimFrames: ReadonlyArray<{ tile: number, hFlip: boolean }> = [
  { tile: 0, hFlip: false },
  { tile: 1, hFlip: false },
  { tile: 2, hFlip: false },
  { tile: 0, hFlip: true },
  { tile: 2, hFlip: false },
  { tile: 1, hFlip: false },
];

/** 1:1 decomp MakeCaptureStars support : cree UN sprite etoile de capture
 *  (sheet particles, sAnim_MasterBall = ANIMCMD_FRAME(3,1) -> tile 3 statique,
 *  sBallParticleAnimNums[BALL_MASTER]=1). Le caller (battle-anim-throw)
 *  pose data/arc/callback flicker. Retourne le spriteId (-1 si echec). */
export function CreateCaptureStarSprite(rt: DecompRuntime, x: number, y: number, priority: number): number {
  loadParticlesAssets(rt, 4 /* BALL_MASTER */);
  const tileBaseRaw = GetSpriteTileStartByTag(PARTICLES_TILE_TAG);
  const palSlotRaw = IndexOfSpritePaletteTag(PARTICLES_PAL_TAG);
  const tileBase = tileBaseRaw === 0xFFFF ? 0 : tileBaseRaw;
  const palSlot = palSlotRaw === 0xFF ? 0 : palSlotRaw;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase + 3, paletteBank: palSlot, x, y,
    shape: 0, size: 0, priority,
  });
  return spriteId ?? -1;
}

function spawnSparkle(rt: DecompRuntime, x: number, y: number, priority: number, tileBase: number, palSlot: number, spawnIdx: number): void {
  // 1:1 décomp battle_anim_throw.c:1623 :
  //   var0 = (u8)gTasks[taskId].data[0];
  //   if (var0 >= 8) var0 -= 8;
  //   gSprites[spriteId].data[0] = var0 * 32;
  // → angle = (idx % 8) * 32 → 8 distinct directions, second wave reuses the same.
  const angleIdx = (spawnIdx >= 8 ? spawnIdx - 8 : spawnIdx) * 32;

  // Spawn 8x8 sprite at (x, y) with shape=square size=0 (= 8x8).
  // 1:1 décomp sBallParticleSpriteTemplates[BALL_POKE] uses
  // gOamData_AffineOff_ObjNormal_8x8 (= shape 0, size 0).
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase, paletteBank: palSlot, x, y,
    shape: 0, size: 0, priority,
  });
  if (spriteId < 0) return;
  const sprite = rt.gSprites[spriteId];
  if (!sprite) return;

  sprite.data[0] = angleIdx;
  sprite.data[1] = 0;  // radius (= will grow to 50 then destroy)
  sprite.data[2] = 0;  // anim frame index (0..5, cycles)

  // 1:1 décomp PokeBallOpenParticleAnimation_Step1 + _Step2 (battle_anim_throw.c:1643/:1651).
  // Step1 is a no-delay passthrough (data[1]==0 → goto step2 immediately).
  // We collapse to step2 directly since data[1] starts at 0.
  sprite.callback = (s: DecompSprite) => {
    // 1:1 décomp PokeBallOpenParticleAnimation_Step2 :
    s.x2 = _sin(s.data[0], s.data[1]);
    s.y2 = _cos(s.data[0], s.data[1]);
    s.data[1] += 2;
    // Cycle anim frame (= 1:1 décomp sAnim_RegularBall pattern).
    s.data[2] = (s.data[2] + 1) % _RegularBallAnimFrames.length;
    const frame = _RegularBallAnimFrames[s.data[2]];
    const oam = rt.gba.oam[s.oamIndex];
    if (oam) {
      oam.tileId = tileBase + frame.tile;
      oam.flipH = frame.hFlip;
    }
    if (s.data[1] >= 50) {
      // 1:1 décomp DestroyBallOpenAnimationParticle : free the sprite.
      DestroySprite(rt, s.spriteId);
    }
  };
}

// 1:1 décomp src/trig.c Sin(idx, amplitude) = (gSineTable[idx & 0xFF] * amplitude) >> 8
function _sin(idx: number, amplitude: number): number {
  const G = (globalThis as Record<string, unknown>).G_SINE_TABLE as number[] | undefined;
  if (G && G.length === 256) return (G[idx & 0xFF] * amplitude) >> 8;
  // Fallback : use Math.sin if for some reason the table isn't on globalThis.
  return Math.round(Math.sin((idx & 0xFF) * 2 * Math.PI / 256) * 256) * amplitude >> 8;
}
function _cos(idx: number, amplitude: number): number {
  return _sin(idx + 64, amplitude);
}

// ─── Particles asset loading — 1:1 décomp LoadBallParticleGfx (battle_anim_throw.c:1568) ──
// IDEMPOTENT PAR TAG, sans flag persistant : on (re)charge uniquement si le tag
// n'est PAS présent (GetSpriteTileStartByTag == 0xFFFF / IndexOfSpritePaletteTag == 0xFF).
// Le reset VRAM du combat suivant (ResetSpriteData → FreeSpriteTileRanges +
// FreeAllSpritePalettes au LOAD_ASSETS) libère les tags → ce load les recrée → les
// étincelles reviennent à CHAQUE combat (avant : un flag `_particlesLoaded` figé à true
// court-circuitait le reload → plus d'étincelles dès le 2ᵉ combat).
function loadParticlesAssets(rt: DecompRuntime, ballId: number): void {
  // LoadCompressedSpriteSheet looks up assetCache['gBattleAnimSpriteGfx_Particles']
  // which must have been preloaded by intro-asset-loader. Pal goes via the
  // same symbol (the 4bpp PNG includes its palette).
  void ballId;  // currently only BALL_POKE is supported; future ball types
  // will need extra asset entries (each ball type has its own sprite sheet).

  // Use globals for LoadSpritePalette + LoadCompressedSpriteSheet via runtime fields directly.
  const charData = (globalThis as Record<string, unknown>).__getAssetForParticles as ((sym: string) => Uint8Array | Uint16Array | null) | undefined;
  // NB : we go through the global via decomp-globals' getAsset because
  // pokeball-effects intentionally avoids importing decomp-globals (circular).
  // The bridge is set by decomp-globals at module load time.
  const gfx = charData ? charData('gBattleAnimSpriteGfx_Particles') : null;
  const pal = charData ? charData('gBattleAnimSpritePal_Particles') : null;

  // 1:1 STRICT décomp src/sprite.c:1486-1500 LoadSpriteSheet :
  //   tileStart = AllocSpriteTiles(sheet->size / TILE_SIZE_4BPP);
  //   if (tileStart < 0) return 0;
  //   AllocSpriteTileRange(tag, tileStart, size / TILE_SIZE_4BPP);
  //   CpuCopy16(data, OBJ_VRAM0 + TILE_SIZE_4BPP * tileStart, size);
  if (gfx && GetSpriteTileStartByTag(PARTICLES_TILE_TAG) === 0xFFFF) {
    const bytes = gfx instanceof Uint16Array ? new Uint8Array(gfx.buffer, gfx.byteOffset, gfx.byteLength) : gfx;
    const tileCount = bytes.length >> 5;
    const sp = (globalThis as Record<string, unknown>).__sprite as {
      AllocSpriteTiles?: (count: number) => number;
    } | undefined;
    const tileStart = sp?.AllocSpriteTiles?.(tileCount) ?? -1;
    if (tileStart >= 0) {
      const byteOffset = tileStart << 5;
      const copySize = Math.min(bytes.length, rt.gba.objVram.length - byteOffset);
      if (copySize > 0) {
        rt.gba.objVram.set(bytes.subarray(0, copySize), byteOffset);
      }
      AllocSpriteTileRange(PARTICLES_TILE_TAG, tileStart, tileCount);
    }
  }
  // 1:1 STRICT décomp src/sprite.c:1589 LoadSpritePalette : scan first-free
  // sSpritePaletteTags array primary + DoLoadSpritePalette + sync auto Map.
  if (pal && IndexOfSpritePaletteTag(PARTICLES_PAL_TAG) === 0xFF) {
    const u16 = pal instanceof Uint16Array
      ? pal
      : new Uint16Array(pal.buffer, pal.byteOffset, Math.floor(pal.byteLength / 2));
    const reserved = ((globalThis as Record<string, unknown>).gReservedSpritePaletteCount as number) ?? 0;
    // Scan first-free via array primary (= sSpritePaletteTags), comme IndexOf
    // SpritePaletteTag(TAG_NONE) (sprite.c:1637-1645).
    const sp = (globalThis as Record<string, unknown>).__sprite as { sSpritePaletteTags?: Uint16Array } | undefined;
    let slot = -1;
    if (sp?.sSpritePaletteTags) {
      for (let i = reserved; i < 16; i++) {
        if (sp.sSpritePaletteTags[i] === 0xFFFF) { slot = i; break; }
      }
    }
    if (slot < 0) {
      console.warn(`[pokeball-effects] OBJ palette saturated (16/16), cannot load PARTICLES_PAL_TAG`);
    } else {
      for (let i = 0; i < Math.min(16, u16.length); i++) {
        rt.gPlttBufferUnfaded.set(256 + slot * 16 + i, u16[i]);
        rt.gPlttBufferFaded.set(256 + slot * 16 + i, u16[i]);
      }
      // Sync array primary + Map secondary via helper 1:1.
      MarkObjPaletteAllocated(slot, PARTICLES_PAL_TAG);
    }
  }
}

/**
 * Transcription LITTÉRALE en TS du système d'affine animation décomp src/sprite.c.
 *
 * Source : auto-engine/src/sprite-engine.ts ENGINE_FUNCTIONS bodyC pour :
 *   - StartSpriteAffineAnim, ChangeSpriteAffineAnim
 *   - BeginAffineAnim, ContinueAffineAnim
 *   - AffineAnimDelay, AffineAnimStateReset, AffineAnimStateRestartAnim, AffineAnimStateStartAnim
 *   - AllocOamMatrix, FreeOamMatrix
 *   - InitSpriteAffineAnim
 *   - ApplyAffineAnimFrame, ApplyAffineAnimFrameRelativeAndUpdateMatrix
 *   - GetAffineAnimFrame, DecrementAffineAnimDelayCounter
 *   - JumpToTopOfAffineAnimLoop, BeginAffineAnimLoop, ContinueAffineAnimLoop
 *
 * Différences vs décomp :
 *   - Pas de sAffineAnimStates[32] global indexé par matrixNum — l'état est stocké
 *     directement dans DecompSprite (affineAnimNum, affineAnimCmdIndex, etc.)
 *   - sprite->affineAnims pointer → notre version : affineAnimsTableName (string lookup
 *     dans SPRITE_AFFINE_ANIM_TABLES + SPRITE_AFFINE_ANIMS).
 *   - Type cmd : décomp utilise s16 type avec valeurs spéciales 32765 (LOOP), 32766 (JUMP),
 *     32767 (END). Notre extracteur a normalisé : terminator string 'END'/'LOOP'/'JUMP'.
 */
import { DecompRuntime, type DecompSprite } from '../decomp-runtime';
import { SetOamMatrix, ST_OAM_AFFINE_ON_MASK, gSineTable } from '../decomp-helpers';
import {
  SPRITE_AFFINE_ANIM_TABLES, SPRITE_AFFINE_ANIMS,
} from '../decomp-data/auto/src/sprite-system';

interface AffineAnimFrameCmd {
  xScale: number;
  yScale: number;
  rotation: number;
  duration: number;
}

/** Lookup affine anim entries depuis sprite-system tables. */
function getAffineAnim(sprite: DecompSprite): { frames: ReadonlyArray<AffineAnimFrameCmd>, terminator: string } | null {
  if (!sprite.affineAnimsTableName) return null;
  const table = (SPRITE_AFFINE_ANIM_TABLES as Record<string, { affineAnims: ReadonlyArray<string> }>)[sprite.affineAnimsTableName];
  if (!table) return null;
  const animName = table.affineAnims[sprite.affineAnimNum];
  if (!animName) return null;
  const anim = (SPRITE_AFFINE_ANIMS as Record<string, { frames: ReadonlyArray<AffineAnimFrameCmd>, terminator: string }>)[animName];
  return anim ?? null;
}

/** 1:1 décomp AffineAnimStateReset(matrixNum). État stocké dans sprite. */
export function AffineAnimStateReset(sprite: DecompSprite): void {
  sprite.affineAnimNum = 0;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.xScale = 0x0100;
  sprite.yScale = 0x0100;
  sprite.rotation = 0;
}

/** 1:1 décomp AffineAnimStateStartAnim(matrixNum, animNum). */
export function AffineAnimStateStartAnim(sprite: DecompSprite, animNum: number): void {
  sprite.affineAnimNum = animNum;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.xScale = 0x0100;
  sprite.yScale = 0x0100;
  sprite.rotation = 0;
}

/** 1:1 décomp StartSpriteAffineAnim(sprite, animNum) :
 *    u8 matrixNum = GetSpriteMatrixNum(sprite);
 *    AffineAnimStateStartAnim(matrixNum, animNum);
 *    sprite->affineAnimBeginning = TRUE;
 *    sprite->affineAnimEnded = FALSE;
 */
export function StartSpriteAffineAnim(sprite: DecompSprite, animNum: number): void {
  AffineAnimStateStartAnim(sprite, animNum);
  sprite.affineAnimBeginning = true;
  sprite.affineAnimEnded = false;
}

/** 1:1 décomp src/sprite.c:ObjAffineSet — calcule la matrix OAM depuis xScale, yScale, rotation.
 *  Formule (cf. ObjAffineSet équivalent inline) :
 *    sin = gSineTable[rot & 0xFF]              // s16 in [-256, 256]
 *    cos = gSineTable[(rot + 64) & 0xFF]       // s16
 *    pa =  (xScale * cos) >> 8
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 *
 *  Identity (xScale=yScale=256, rotation=0) → pa=256, pb=0, pc=0, pd=256.
 *  xScale=128 (= half) → pa=128 → sprite affiché 2× plus grand visuellement
 *  (= sample 0.5 px par pixel screen).
 */
function applyMatrixFromAffineState(sprite: DecompSprite, rt: DecompRuntime): void {
  const sin = gSineTable(sprite.rotation & 0xFF);
  const cos = gSineTable((sprite.rotation + 64) & 0xFF);
  const pa =  (sprite.xScale * cos) >> 8;
  const pb = -(sprite.xScale * sin) >> 8;
  const pc =  (sprite.yScale * sin) >> 8;
  const pd =  (sprite.yScale * cos) >> 8;
  SetOamMatrix(rt.gba, sprite.matrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp src/sprite.c:ApplyAffineAnimFrame :
 *    if (frameCmd->xScale != 0) sAffineAnimStates[matrixNum].xScale = frameCmd->xScale;
 *    if (frameCmd->yScale != 0) sAffineAnimStates[matrixNum].yScale = frameCmd->yScale;
 *    sAffineAnimStates[matrixNum].rotation += frameCmd->rotation;  // ACCUMULATE
 *    update matrix.
 *  ⚠️ xScale/yScale = SET only if non-zero (= preserve previous if frame.xScale==0).
 *    rotation = ACCUMULATE.
 */
export function ApplyAffineAnimFrame(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  if (frame.xScale !== 0) sprite.xScale = frame.xScale;
  if (frame.yScale !== 0) sprite.yScale = frame.yScale;
  sprite.rotation += frame.rotation;
  applyMatrixFromAffineState(sprite, rt);
}

/** 1:1 décomp ApplyAffineAnimFrameRelativeAndUpdateMatrix : accumule (= +=)
 *  les deltas xScale/yScale/rotation, puis update matrix.
 *  Note : les frames non-initiales ont des deltas (incréments) au lieu de valeurs
 *  absolues. Ex: sAffineAnim_GameFreak_GrowAndShrink frames = [(128,128,0,0), (16,16,0,16), (-16,-16,0,8)]
 *  → frame 0 = init scale 128, frames 1+ = delta +16 par frame pendant 16 frames. */
export function ApplyAffineAnimFrameRelative(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  sprite.xScale += frame.xScale;
  sprite.yScale += frame.yScale;
  sprite.rotation += frame.rotation;
  applyMatrixFromAffineState(sprite, rt);
}

/** 1:1 décomp BeginAffineAnim(sprite) : appelé quand affineAnimBeginning=TRUE.
 *  Reset state + applique frame 0 (= init absolu) + start delay counter. */
export function BeginAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  if (!(sprite.affineMode & ST_OAM_AFFINE_ON_MASK)) return;
  const anim = getAffineAnim(sprite);
  if (!anim || anim.frames.length === 0) return;
  // AffineAnimStateRestartAnim : reset cmdIndex/delayCounter/loopCounter
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimBeginning = false;
  sprite.affineAnimEnded = false;
  // Apply frame 0 absolute
  const frame0 = anim.frames[0];
  ApplyAffineAnimFrame(sprite, frame0, rt);
  sprite.affineAnimDelayCounter = frame0.duration;
}

/** 1:1 décomp ContinueAffineAnim(sprite). Tick chaque frame. */
export function ContinueAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  if (!(sprite.affineMode & ST_OAM_AFFINE_ON_MASK)) return;

  if (sprite.affineAnimDelayCounter > 0) {
    // AffineAnimDelay : délai en cours, applique le frame relative en attendant
    sprite.affineAnimDelayCounter--;
    const anim = getAffineAnim(sprite);
    if (anim && sprite.affineAnimCmdIndex < anim.frames.length) {
      const frame = anim.frames[sprite.affineAnimCmdIndex];
      // Apply relative delta chaque frame
      ApplyAffineAnimFrameRelative(sprite, frame, rt);
    }
    return;
  }

  if (sprite.affineAnimPaused) return;

  // Advance to next cmd
  sprite.affineAnimCmdIndex++;
  const anim = getAffineAnim(sprite);
  if (!anim) return;

  if (sprite.affineAnimCmdIndex >= anim.frames.length) {
    // Hit end of frames — process terminator
    if (anim.terminator === 'END') {
      sprite.affineAnimEnded = true;
      return;
    }
    if (anim.terminator === 'LOOP' || anim.terminator === 'JUMP') {
      sprite.affineAnimCmdIndex = 0;
    }
  }

  // Start the new frame
  const frame = anim.frames[sprite.affineAnimCmdIndex];
  if (frame) {
    ApplyAffineAnimFrame(sprite, frame, rt);
    sprite.affineAnimDelayCounter = frame.duration;
  }
}

/** Tick à appeler chaque frame depuis runtime.tickFixed.
 *  Pour chaque sprite avec affine anim active, advance la frame. */
export function tickAllAffineAnims(rt: DecompRuntime): void {
  for (const sprite of rt.gSprites.values()) {
    if (!sprite.affineAnimsTableName) continue;
    if (!(sprite.affineMode & ST_OAM_AFFINE_ON_MASK)) continue;
    if (sprite.affineAnimBeginning) {
      BeginAffineAnim(sprite, rt);
    } else if (!sprite.affineAnimEnded) {
      ContinueAffineAnim(sprite, rt);
    }
  }
}

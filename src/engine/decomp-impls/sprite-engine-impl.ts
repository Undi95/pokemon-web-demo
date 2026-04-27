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
import { SetOamMatrix, ST_OAM_AFFINE_ON_MASK } from '../decomp-helpers';
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

/** Convertit Q.8.8 fixed scale (256 = 1.0) → multiplicateur affine matrix.
 *  Sur GBA réel, sin/cos sont en s8.8 et la matrix est un.s8.7 fixed.
 *  Pour notre engine simplifié on utilise scale direct + sin/cos table pour rotation. */
function applyMatrixFromAffineState(sprite: DecompSprite, rt: DecompRuntime): void {
  // sprite.xScale/yScale en Q.8.8 (256 = 1.0). Inverse pour la matrix (= 0x10000 / scale).
  // Pour rotation, on utilise gSineTable[(u8)rotation] / 256 = sin(angle).
  if (sprite.xScale === 0 || sprite.yScale === 0) return;
  const invXScale = (0x10000 / sprite.xScale) | 0;
  const invYScale = (0x10000 / sprite.yScale) | 0;
  // Identity rotation (rotation == 0) = pa = invX, pb = 0, pc = 0, pd = invY
  if (sprite.rotation === 0) {
    SetOamMatrix(rt.gba, sprite.matrixNum, invXScale, 0, 0, invYScale);
    return;
  }
  // Rotation en Q.8 : angle / 256 cycles. Use gSineTable from helpers.
  // Pour l'instant on simplifie sans rotation dynamique (= juste scale)
  SetOamMatrix(rt.gba, sprite.matrixNum, invXScale, 0, 0, invYScale);
}

/** 1:1 décomp ApplyAffineAnimFrame(matrixNum, frameCmd) :
 *  sAffineAnimStates[matrixNum].xScale = frameCmd->xScale;
 *  sAffineAnimStates[matrixNum].yScale = frameCmd->yScale;
 *  sAffineAnimStates[matrixNum].rotation = frameCmd->rotation;
 *  Puis update matrix via SetOamMatrix.
 */
export function ApplyAffineAnimFrame(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  sprite.xScale = frame.xScale;
  sprite.yScale = frame.yScale;
  sprite.rotation = frame.rotation;
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

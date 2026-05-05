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

/** 1:1 décomp src/sprite.c:ConvertScaleParam (l.1316-1320) :
 *    s16 ConvertScaleParam(s16 scale) { return SAFE_DIV(0x10000, scale); }
 *  Inverse le scale pour le passer à ObjAffineSet (= sprite affine = inverse
 *  du visual scale). Sans ça, AFFINEANIMCMD_FRAME(128, 128, ...) zoom AU LIEU
 *  de shrink (= GameFreak letters intro inversées).
 */
function convertScaleParam(scale: number): number {
  if (scale === 0) return 0x7FFF;  // SAFE_DIV : avoid /0
  // Sign extend : decomp s16. JS bit ops keep 32-bit, donc on simulate via clamp.
  const result = (0x10000 / scale) | 0;
  if (result > 0x7FFF) return 0x7FFF;
  if (result < -0x8000) return -0x8000;
  return result;
}

/** 1:1 décomp src/sprite.c:ObjAffineSet — calcule la matrix OAM depuis xScale, yScale, rotation.
 *  IMPORTANT : xScale/yScale ici sont les paramètres POST `ConvertScaleParam`
 *  (= 0x10000 / state.xScale). Donc state.xScale=128 → param=512 → matrix pa=512
 *  → sprite affiché 0.5× (= shrink). State.xScale=512 → param=128 → matrix pa=128
 *  → sprite affiché 2× (= zoom).
 *  Formule (cf. ObjAffineSet équivalent inline) :
 *    sin = gSineTable[rot & 0xFF]              // s16 in [-256, 256]
 *    cos = gSineTable[(rot + 64) & 0xFF]       // s16
 *    pa =  (xScale * cos) >> 8
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 */
function applyMatrixFromAffineState(sprite: DecompSprite, rt: DecompRuntime): void {
  const sin = gSineTable(sprite.rotation & 0xFF);
  const cos = gSineTable((sprite.rotation + 64) & 0xFF);
  // Apply ConvertScaleParam avant matrix calc (1:1 décomp sprite.c:1309-1310).
  const xScale = convertScaleParam(sprite.xScale);
  const yScale = convertScaleParam(sprite.yScale);
  const pa =  (xScale * cos) >> 8;
  const pb = -(xScale * sin) >> 8;
  const pc =  (yScale * sin) >> 8;
  const pd =  (yScale * cos) >> 8;
  SetOamMatrix(rt.gba, sprite.matrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp src/sprite.c:ApplyAffineAnimFrame :
 *    if (frameCmd->duration)
 *        frameCmd->duration--, ApplyAffineAnimFrameRelativeAndUpdateMatrix(frameCmd);
 *    else
 *        ApplyAffineAnimFrameAbsolute(frameCmd), ApplyAffineAnimFrameRelativeAndUpdateMatrix(dummy);
 *  Quand duration != 0 : on applique le delta immédiatement (1er tick) et le
 *  compteur de délai est décrémenté. Quand duration == 0 : set absolu + dummy.
 */
export function ApplyAffineAnimFrame(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  if (frame.duration !== 0) {
    ApplyAffineAnimFrameRelative(sprite, frame, rt);
  } else {
    sprite.xScale = frame.xScale;
    sprite.yScale = frame.yScale;
    sprite.rotation = (frame.rotation << 8) & ~0xFF;
    applyMatrixFromAffineState(sprite, rt);
  }
}

/** 1:1 décomp ApplyAffineAnimFrameRelativeAndUpdateMatrix : accumule (= +=)
 *  les deltas xScale/yScale/rotation, puis update matrix.
 *  Les valeurs frame.xScale/yScale/rotation sont des DELTAS ajoutés chaque tick. */
export function ApplyAffineAnimFrameRelative(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  sprite.xScale += frame.xScale;
  sprite.yScale += frame.yScale;
  sprite.rotation = (sprite.rotation + (frame.rotation << 8)) & ~0xFF;
  applyMatrixFromAffineState(sprite, rt);
}

/** 1:1 décomp BeginAffineAnim(sprite) : appelé quand affineAnimBeginning=TRUE.
 *  Reset state + applique frame 0 + start delay counter. */
export function BeginAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  // 1:1 décomp : check sprite.oam.affineMode. Notre split → OR avec sprite.affineMode.
  const oam = rt.gba.oam[sprite.oamIndex];
  const effective = (oam?.affineMode ?? 0) | sprite.affineMode;
  if (!(effective & ST_OAM_AFFINE_ON_MASK)) return;
  const anim = getAffineAnim(sprite);
  if (!anim || anim.frames.length === 0) return;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimBeginning = false;
  sprite.affineAnimEnded = false;
  const frame0 = anim.frames[0];
  ApplyAffineAnimFrame(sprite, frame0, rt);
  sprite.affineAnimDelayCounter = frame0.duration > 0 ? frame0.duration - 1 : 0;
}

/** 1:1 décomp ContinueAffineAnim(sprite). Tick chaque frame. */
export function ContinueAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  const oam = rt.gba.oam[sprite.oamIndex];
  const effective = (oam?.affineMode ?? 0) | sprite.affineMode;
  if (!(effective & ST_OAM_AFFINE_ON_MASK)) return;

  if (sprite.affineAnimDelayCounter > 0) {
    sprite.affineAnimDelayCounter--;
    const anim = getAffineAnim(sprite);
    if (anim && sprite.affineAnimCmdIndex < anim.frames.length) {
      const frame = anim.frames[sprite.affineAnimCmdIndex];
      ApplyAffineAnimFrameRelative(sprite, frame, rt);
    }
    return;
  }

  if (sprite.affineAnimPaused) return;

  sprite.affineAnimCmdIndex++;
  const anim = getAffineAnim(sprite);
  if (!anim) return;

  if (sprite.affineAnimCmdIndex >= anim.frames.length) {
    if (anim.terminator === 'END') {
      sprite.affineAnimEnded = true;
      return;
    }
    if (anim.terminator === 'LOOP' || anim.terminator === 'JUMP') {
      sprite.affineAnimCmdIndex = 0;
    }
  }

  const frame = anim.frames[sprite.affineAnimCmdIndex];
  if (frame) {
    ApplyAffineAnimFrame(sprite, frame, rt);
    sprite.affineAnimDelayCounter = frame.duration > 0 ? frame.duration - 1 : 0;
  }
}

/** Tick à appeler chaque frame depuis runtime.tickFixed.
 *  Pour chaque sprite avec affine anim active, advance la frame.
 *
 *  1:1 décomp : check `oam.affineMode` (= source of truth, le décomp set
 *  `gSprites[id].oam.affineMode = ST_OAM_AFFINE_NORMAL` directement quand
 *  il déclenche une affine anim, e.g. main_menu.c:1108 player shrink).
 *  Notre split sprite.affineMode/oam.affineMode → on prend le OR pour
 *  couvrir les deux call patterns (= callbacks transcrits qui set oam
 *  uniquement, ET impl manuels qui set sprite.affineMode). */
export function tickAllAffineAnims(rt: DecompRuntime): void {
  for (const sprite of rt.gSprites.values()) {
    if (!sprite.affineAnimsTableName) continue;
    const oam = rt.gba.oam[sprite.oamIndex];
    const effectiveAffineMode = (oam?.affineMode ?? 0) | sprite.affineMode;
    if (!(effectiveAffineMode & ST_OAM_AFFINE_ON_MASK)) continue;
    // Sync sprite.affineMode from OAM si l'OAM a été set externe (= auto callback).
    if ((oam?.affineMode ?? 0) !== sprite.affineMode) {
      sprite.affineMode = (oam?.affineMode ?? 0) as 0 | 1 | 2 | 3;
    }
    if (sprite.affineAnimBeginning) {
      BeginAffineAnim(sprite, rt);
    } else if (!sprite.affineAnimEnded) {
      ContinueAffineAnim(sprite, rt);
    }
  }
}

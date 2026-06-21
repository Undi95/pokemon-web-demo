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
import { DecompRuntime, MAX_SPRITES, type DecompSprite } from '../system/decomp-runtime';
import { SetOamMatrix, ST_OAM_AFFINE_ON_MASK, gSineTable } from '../system/decomp-helpers';
import {
  SPRITE_AFFINE_ANIM_TABLES, SPRITE_AFFINE_ANIMS,
} from '../decomp-data/src/sprite-system';
import {
  getExtraAffineAnim, getExtraAffineAnimTable,
} from './sprite-affine-extras';

interface AffineAnimFrameCmd {
  xScale: number;
  yScale: number;
  rotation: number;
  duration: number;
}

/** Lookup affine anim entries — checks the EXTRA registry first
 *  (= sprite-affine-extras.ts, holds battler/release/etc.), falls back to the
 *  auto-generated `SPRITE_AFFINE_ANIM_TABLES` / `SPRITE_AFFINE_ANIMS`. */
function getAffineAnim(sprite: DecompSprite): { frames: ReadonlyArray<AffineAnimFrameCmd>, terminator: string } | null {
  if (!sprite.affineAnimsTableName) return null;
  const table = getExtraAffineAnimTable(sprite.affineAnimsTableName)
    ?? (SPRITE_AFFINE_ANIM_TABLES as Record<string, { affineAnims: ReadonlyArray<string> }>)[sprite.affineAnimsTableName];
  if (!table) return null;
  const animName = table.affineAnims[sprite.affineAnimNum];
  if (!animName) return null;
  const anim = getExtraAffineAnim(animName)
    ?? (SPRITE_AFFINE_ANIMS as Record<string, { frames: ReadonlyArray<AffineAnimFrameCmd>, terminator: string }>)[animName];
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
  // Sprite SANS table affine (affineAnimsTableName absent) : le ticker
  // (tickAllAffineAnims:353) le skippe -> ended ne serait JAMAIS pose ->
  // soft-lock des gates affineAnimEnded (capture Release_Wait, send-out
  // HandleBallAnimEnd). Semantique plateforme : anim no-op = finie immediatement
  // (le mon emerge sans l effet grow, comme le send-out valide A/B).
  sprite.affineAnimEnded = !sprite.affineAnimsTableName;
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
/** Wrap signed 16-bit (= sign-extend bits 0..15). Le décomp stocke
 *  `sAffineAnimStates.rotation` en s16 → overflow wrap. JS number =
 *  float64 sans wrap natif → l'accumulation `+= 0xFE00` (= -512 en s16)
 *  diverge sans cet wrap (visible = BagShake/RotatingBall ne tournent pas). */
function _wrapS16(n: number): number { return (n << 16) >> 16; }

function applyMatrixFromAffineState(sprite: DecompSprite, rt: DecompRuntime): void {
  // 1:1 convention BIOS ObjAffineSet (libagbsyscall) : rotation s16 stocké
  // « shifté << 8 » → index 8-bit dans gSineTable = `(rotation >> 8) & 0xFF`.
  // Notre ancien code lisait `rotation & 0xFF` = 0 (low byte est clear par
  // `& ~0xFF` dans ApplyAffineAnimFrameRelative) → sin/cos figés à 0/256
  // → rotation jamais appliquée (bug latent jusque-là ; toutes les anims
  // précedentes avaient rotation=0).
  const rotIdx = (sprite.rotation >> 8) & 0xFF;
  const sin = gSineTable(rotIdx);
  const cos = gSineTable((rotIdx + 64) & 0xFF);
  // Apply ConvertScaleParam avant matrix calc (1:1 décomp sprite.c:1309-1310).
  const xScale = convertScaleParam(sprite.xScale);
  const yScale = convertScaleParam(sprite.yScale);
  const pa =  (xScale * cos) >> 8;
  const pb = -(xScale * sin) >> 8;
  const pc =  (yScale * sin) >> 8;
  const pd =  (yScale * cos) >> 8;
  SetOamMatrix(rt.gba, sprite.matrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp src/sprite.c:ApplyAffineAnimFrame (l.1330-1344) :
 *    if (frameCmd->duration)
 *        frameCmd->duration--, ApplyAffineAnimFrameRelativeAndUpdateMatrix(frameCmd);
 *    else
 *        ApplyAffineAnimFrameAbsolute(frameCmd), ApplyAffineAnimFrameRelativeAndUpdateMatrix(dummy);
 *
 *  Quand duration != 0 : on applique le delta immédiatement (1er tick) et le
 *  caller utilise duration-1 pour delayCounter. Quand duration == 0 : set
 *  absolu + dummy relative (= juste re-write matrix).
 *
 *  ⚠️ Audit V2 fix : ApplyAffineAnimFrameAbsolute dans le décomp (l.1282-1287)
 *  fait `state.rotation = frameCmd->rotation << 8` SANS `& ~0xFF`. Le `& ~0xFF`
 *  est appliqué UNIQUEMENT par ApplyAffineAnimFrameRelativeAndUpdateMatrix
 *  (l.1308) qui fait `state.rotation = (state.rotation + (frame.rotation << 8)) & ~0xFF`.
 *  Avant on appliquait le mask sur le path absolu aussi → drift de bits low-byte
 *  dans state.rotation pour des rotations non-zero. Pour EMERGE/NORMAL (rot=0)
 *  pas d'impact, mais pour SwingConcave/SpinShrink/etc qui rotate, oui. Fix en
 *  séparant les deux paths.
 *
 *  Le `ApplyAffineAnimFrameRelativeAndUpdateMatrix(dummy)` après absolute set
 *  re-écrit la matrix sans modifier state (= dummy frame add 0,0,0,0). Ça
 *  garantit que applyMatrixFromAffineState s'exécute (= matrix update). */
export function ApplyAffineAnimFrame(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  // 1:1 décomp ApplyAffineAnimFrame (sprite.c:1330) : teste la duration ORIGINALE et
  // décrémente DEDANS. ⚠️ FIX 2026-06-01 : avant, les callers (Begin/ContinueAffineAnim)
  // pré-décrémentaient (`if (duration!==0) duration--`) AVANT cet appel, qui re-testait
  // `duration !== 0` → une frame duration=1 devenait 0 et tombait dans la branche ABSOLUE
  // au lieu de RELATIVE → les anims de rotation à duration=1 (sAffineAnim_BallRotate_4 =
  // FRAME(0,0,25,1)) restaient FIGÉES à l'angle absolu 25 au lieu d'accumuler +25/frame
  // (la ball ne tournait pas). Les anims existantes (Emerge/Return = duration 0/12/15/18)
  // sont INCHANGÉES : duration 0 → absolu, duration ≥2 → relatif (idem qu'avant).
  if (frame.duration !== 0) {
    // 1:1 décomp 1336-1337 : duration-- puis relative add + update matrix. Le caller lit
    // `frame.duration` APRÈS (post-décrément, muté en place) pour delayCounter.
    frame.duration--;
    ApplyAffineAnimFrameRelative(sprite, frame, rt);
  } else {
    // 1:1 décomp 1341-1342 : ApplyAffineAnimFrameAbsolute (rotation = frame.rotation<<8,
    // SANS mask l.1286) PUIS ApplyAffineAnimFrameRelativeAndUpdateMatrix(dummy={0}) qui
    // applique le `& ~0xFF` sur rotation (l.1308) + ré-écrit la matrice (ObjAffineSet).
    sprite.xScale = frame.xScale;
    sprite.yScale = frame.yScale;
    // Wrap s16 : `frame.rotation << 8` peut dépasser s16 (ex. 0x80 << 8 = 0x8000).
    sprite.rotation = _wrapS16(frame.rotation << 8);
    // Dummy relative ({0,0,0,0}) = 1:1 décomp 1342 : +0 partout, mask rotation, update matrix.
    ApplyAffineAnimFrameRelative(sprite, { xScale: 0, yScale: 0, rotation: 0, duration: 0 }, rt);
  }
}

/** 1:1 décomp ApplyAffineAnimFrameRelativeAndUpdateMatrix : accumule (= +=)
 *  les deltas xScale/yScale/rotation, puis update matrix.
 *  Les valeurs frame.xScale/yScale/rotation sont des DELTAS ajoutés chaque tick. */
export function ApplyAffineAnimFrameRelative(sprite: DecompSprite, frame: AffineAnimFrameCmd, rt: DecompRuntime): void {
  sprite.xScale += frame.xScale;
  sprite.yScale += frame.yScale;
  // Wrap s16 : sans ça, `BagShake` (= ±0x200 par tick) accumule en float64
  // au lieu d'osciller. Cf. _wrapS16 ci-dessus.
  sprite.rotation = _wrapS16((sprite.rotation + (frame.rotation << 8)) & ~0xFF);
  applyMatrixFromAffineState(sprite, rt);
}

/** 1:1 décomp BeginAffineAnim(sprite) (l.1067-1082) : appelé quand
 *  affineAnimBeginning=TRUE.
 *
 *  Décomp flow :
 *    1. Check oam.affineMode & ST_OAM_AFFINE_ON_MASK + affineAnims[0][0].type != 32767 (END terminator on first cmd = no anim).
 *    2. matrixNum = GetSpriteMatrixNum(sprite).
 *    3. AffineAnimStateRestartAnim(matrixNum) : cmdIndex=0, delayCounter=0, loopCounter=0.
 *    4. GetAffineAnimFrame(matrixNum, sprite, &frameCmd) : copy frame at cmdIndex into frameCmd.
 *    5. sprite.affineAnimBeginning = FALSE; sprite.affineAnimEnded = FALSE.
 *    6. ApplyAffineAnimFrame(matrixNum, &frameCmd) : applies frame 0 to matrix.
 *       → If frameCmd.duration was > 0, frameCmd.duration is now duration-1.
 *    7. sAffineAnimStates[matrixNum].delayCounter = frameCmd.duration  (= POST-decrement value).
 *
 *  Audit V2 fix : avant on faisait `delayCounter = frame.duration - 1` UNIQUEMENT
 *  si duration > 0. Le décomp utilise frameCmd.duration POST-ApplyAffineAnimFrame
 *  (qui décrémente seulement si duration > 0). Donc :
 *    - duration > 0 : ApplyAffineAnimFrame fait `frameCmd.duration--`, on lit duration-1.
 *    - duration == 0 : ApplyAffineAnimFrame ne décrémente pas, on lit duration=0.
 *  Notre ancien code : duration > 0 ? duration-1 : 0 → équivalent NUMÉRIQUE.
 *  Mais l'idiome est plus clair en simulant le pattern décomp. */
export function BeginAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  // 1:1 décomp : check sprite.oam.affineMode. Notre split → OR avec sprite.affineMode.
  const oam = rt.gba.oam[sprite.oamIndex];
  const effective = (oam?.affineMode ?? 0) | sprite.affineMode;
  if (!(effective & ST_OAM_AFFINE_ON_MASK)) return;
  const anim = getAffineAnim(sprite);
  if (!anim || anim.frames.length === 0) return;
  // 1:1 décomp AffineAnimStateRestartAnim (l.1253-1258) : reset cmdIndex,
  // delayCounter, loopCounter. NB: animNum NOT reset here (differs from
  // AffineAnimStateStartAnim used by StartSpriteAffineAnim).
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimBeginning = false;
  sprite.affineAnimEnded = false;
  // Local copy of frame 0 (= frameCmd in decomp). ApplyAffineAnimFrame decrements
  // duration in place if > 0.
  const frame0 = anim.frames[0];
  // 1:1 décomp BeginAffineAnim (sprite.c:1067) : GetAffineAnimFrame copie la frame ;
  // ApplyAffineAnimFrame la décrémente DEDANS (si duration>0) — PAS de pré-décrément ici.
  const frameCmd: AffineAnimFrameCmd = {
    xScale: frame0.xScale,
    yScale: frame0.yScale,
    rotation: frame0.rotation,
    duration: frame0.duration,
  };
  ApplyAffineAnimFrame(sprite, frameCmd, rt);
  // 1:1 décomp l.1078 : delayCounter = frameCmd.duration (post-décrément par ApplyAffineAnimFrame).
  sprite.affineAnimDelayCounter = frameCmd.duration;
}

/** 1:1 décomp ContinueAffineAnim(sprite) (l.1084-1112).
 *
 *  Décomp flow :
 *    if (oam.affineMode & ST_OAM_AFFINE_ON_MASK) {
 *      matrixNum = GetSpriteMatrixNum(sprite);
 *      if (sAffineAnimStates[matrixNum].delayCounter)
 *        AffineAnimDelay(matrixNum, sprite);              // delay branch
 *      else if (sprite.affineAnimPaused) return;
 *      else {
 *        sAffineAnimStates[matrixNum].animCmdIndex++;
 *        type = ...affineAnims[animNum][cmdIndex].type;
 *        sAffineAnimCmdFuncs[funcIndex](matrixNum, sprite); // dispatch loop/jump/end/frame
 *      }
 *    }
 *
 *  AffineAnimDelay (l.1114-1122) :
 *    if (!DecrementAffineAnimDelayCounter(sprite, matrixNum)) {
 *      // = if !affineAnimPaused, since DecrementAffineAnimDelayCounter does
 *      //   `if (!affineAnimPaused) --delayCounter; return affineAnimPaused;`
 *      GetAffineAnimFrame(matrixNum, sprite, &frameCmd);
 *      ApplyAffineAnimFrameRelativeAndUpdateMatrix(matrixNum, &frameCmd);
 *    }
 *
 *  ⚠️ Audit V2 fix : DecrementAffineAnimDelayCounter only decrements if NOT paused.
 *  Avant on décrémentait toujours. Conséquence : si affineAnimPaused devient true
 *  mid-anim, notre impl avance quand même, divergeant du décomp.
 *
 *  ⚠️ Audit V2 fix : décomp (l.1090) check `delayCounter != 0` (= signed s8 in decomp,
 *  but `if (delay)` est truthy si != 0). Notre `delayCounter > 0` est équivalent
 *  pour valeurs positives mais diverge si delayCounter devient négatif (= bug
 *  potentiel). Match exact : `!= 0` (= delayCounter !== 0). */
export function ContinueAffineAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  const oam = rt.gba.oam[sprite.oamIndex];
  const effective = (oam?.affineMode ?? 0) | sprite.affineMode;
  if (!(effective & ST_OAM_AFFINE_ON_MASK)) return;

  // 1:1 décomp l.1090 : `if (delayCounter)` = if delayCounter != 0.
  if (sprite.affineAnimDelayCounter !== 0) {
    // 1:1 décomp AffineAnimDelay (l.1114-1122) :
    //   DecrementAffineAnimDelayCounter sets affineAnimPaused return value AND
    //   only decrements if !paused. Then if !paused, re-applies frame relative.
    if (!sprite.affineAnimPaused) {
      sprite.affineAnimDelayCounter--;
      const anim = getAffineAnim(sprite);
      if (anim && sprite.affineAnimCmdIndex < anim.frames.length) {
        const frame = anim.frames[sprite.affineAnimCmdIndex];
        ApplyAffineAnimFrameRelative(sprite, frame, rt);
      }
    }
    return;
  }

  // delayCounter == 0 path (l.1094-1107)
  if (sprite.affineAnimPaused) return;

  sprite.affineAnimCmdIndex++;
  const anim = getAffineAnim(sprite);
  if (!anim) return;

  if (sprite.affineAnimCmdIndex >= anim.frames.length) {
    if (anim.terminator === 'END') {
      // 1:1 décomp AffineAnimCmd_end (l.1172-1178) :
      //   sprite.affineAnimEnded = TRUE;
      //   sAffineAnimStates[matrixNum].animCmdIndex--;     // back up to last frame
      //   ApplyAffineAnimFrameRelativeAndUpdateMatrix(matrixNum, &dummyFrameCmd);
      sprite.affineAnimEnded = true;
      sprite.affineAnimCmdIndex--;
      // Apply dummy frame relative (= just re-write matrix). State unchanged.
      const dummy: AffineAnimFrameCmd = { xScale: 0, yScale: 0, rotation: 0, duration: 0 };
      ApplyAffineAnimFrameRelative(sprite, dummy, rt);
      return;
    }
    if (anim.terminator === 'LOOP' || anim.terminator === 'JUMP') {
      sprite.affineAnimCmdIndex = 0;
    }
  }

  const frame = anim.frames[sprite.affineAnimCmdIndex];
  if (frame) {
    // 1:1 décomp AffineAnimCmd_frame/jump (sprite.c:1180/1163) : GetAffineAnimFrame +
    // ApplyAffineAnimFrame (décrémente la duration DEDANS) + delayCounter = duration post.
    const frameCmd: AffineAnimFrameCmd = {
      xScale: frame.xScale,
      yScale: frame.yScale,
      rotation: frame.rotation,
      duration: frame.duration,
    };
    ApplyAffineAnimFrame(sprite, frameCmd, rt);
    sprite.affineAnimDelayCounter = frameCmd.duration;
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
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = rt.gSprites[i];
    if (sprite === undefined) continue;
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

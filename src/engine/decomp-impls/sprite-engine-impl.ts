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
import { DecompRuntime, MAX_SPRITES, type DecompSprite } from '../../../harness/runtime/decomp-runtime';
import { SetOamMatrix, ST_OAM_AFFINE_ON_MASK, gSineTable } from '../../../harness/runtime/decomp-helpers';
import {
  getExtraAffineAnim, getExtraAffineAnimTable,
  type AffineAnim, type AffineAnimCmd,
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
function getAffineAnim(sprite: DecompSprite): AffineAnim | null {
  if (!sprite.affineAnimsTableName) return null;
  // Registre EXTRA = source UNIQUE (sprite-system.ts SPRITE_AFFINE_* dissous : tous les
  // consommateurs — battler/ballrotate/bag/starter/gamefreak/playershrink — enregistrent en extra).
  const table = getExtraAffineAnimTable(sprite.affineAnimsTableName);
  if (!table) return null;
  const animName = table.affineAnims[sprite.affineAnimNum];
  if (!animName) return null;
  const anim = getExtraAffineAnim(animName);
  return anim ?? null;
}

/** 1:1 décomp AffineAnimStateReset(matrixNum) (sprite.c:1271-1280). État stocké dans sprite. */
export function AffineAnimStateReset(sprite: DecompSprite): void {
  sprite.affineAnimNum = 0;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimLoopCounter = 0;  // 1:1 décomp l.1276 : loopCounter = 0.
  sprite.xScale = 0x0100;
  sprite.yScale = 0x0100;
  sprite.rotation = 0;
}

/** 1:1 décomp AffineAnimStateStartAnim(matrixNum, animNum) (sprite.c:1260-1269). */
export function AffineAnimStateStartAnim(sprite: DecompSprite, animNum: number): void {
  sprite.affineAnimNum = animNum;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimLoopCounter = 0;  // 1:1 décomp l.1265 : loopCounter = 0.
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

/** 1:1 décomp ChangeSpriteAffineAnim(sprite, animNum) (sprite.c:1352-1358) :
 *  pose SEULEMENT animNum + beginning — ≠ StartSpriteAffineAnim : les
 *  xScale/yScale/ROTATION accumulés PERSISTENT (BeginAffineAnim au tick suivant
 *  fait RestartAnim = cmdIndex/delay seuls). C'est ce qui rend le wobble de la
 *  Pokéball CONTINU (l'angle penché se déroule au pivot au lieu de sauter à 0 —
 *  « bobbing 2 frames au lieu de 3 », verdict user 2026-07-03). */
export function ChangeSpriteAffineAnim(sprite: DecompSprite, animNum: number): void {
  sprite.affineAnimNum = animNum;
  sprite.affineAnimBeginning = true;
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

// ═══════════════════════════════════════════════════════════════════════════════
// ANCHOR-MATRIX (sprite.c:1206-1244) — décale x2/y2 pendant le scaling affine pour
// que le sprite reste ancré à un coin (utilisé UNIQUEMENT par minigame_countdown.c:448
// SetSpriteMatrixAnchor(sprite, NO_ANCHOR, 26) → les chiffres 3/2/1 ne glissent pas en
// se compressant). Inerte pour tout sprite non-ancré (anchored ≠ true).
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp include/sprite.h:10 `#define NO_ANCHOR 0x800`. */
export const NO_ANCHOR = 0x800;

/** 1:1 décomp src/sprite.c:220-243 `sOamDimensions32[3][4]` : {width, height} en px
 *  par [shape][size]. Utilisée UNIQUEMENT par UpdateSpriteMatrixAnchorPos. */
const sOamDimensions32: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // ST_OAM_SQUARE
  [[8, 8], [16, 16], [32, 32], [64, 64]],
  // ST_OAM_H_RECTANGLE
  [[16, 8], [32, 8], [32, 16], [64, 32]],
  // ST_OAM_V_RECTANGLE
  [[8, 16], [8, 32], [16, 32], [32, 64]],
];

/** 1:1 décomp src/sprite.c:1213-1223 :
 *  ```c
 *  static s32 GetAnchorCoord(s32 a0, s32 a1, s32 coord) {
 *      s32 subResult = a1 - a0, var1;
 *      if (subResult < 0) var1 = -(subResult) >> 9;
 *      else               var1 = -(subResult >> 9);
 *      return coord - ((u32)(coord * a1) / (u32)(a0) + var1);
 *  }
 *  ```
 *  `Math.imul` + `>>> 0` reproduit `(u32)(coord * a1)` (produit s32 tronqué puis u32) ;
 *  `a0 >>> 0` = `(u32)a0`. Division entière non-signée = Math.floor. */
function GetAnchorCoord(a0: number, a1: number, coord: number): number {
  const subResult = (a1 - a0) | 0;
  let var1: number;
  if (subResult < 0) var1 = (-subResult) >> 9;   // -(subResult) >> 9
  else               var1 = -(subResult >> 9);   // -(subResult >> 9)
  const prod = Math.imul(coord, a1) >>> 0;        // (u32)(coord * a1)
  const div = Math.floor(prod / (a0 >>> 0));      // / (u32)a0
  return (coord - (div + var1)) | 0;
}

/** 1:1 décomp src/sprite.c:1225-1244 `UpdateSpriteMatrixAnchorPos(sprite, x, y)`.
 *  Décale sprite.x2/y2 selon le scale courant (gOamMatrices[matrixNum].a/.d = pa/pd).
 *  x/y = coords d'ancrage (data[6]/data[7]) ; NO_ANCHOR skippe l'axe. Division signée
 *  `(dimension << 16) / pa` → Math.trunc (pa/pd toujours >0 pour un scale pur). */
export function UpdateSpriteMatrixAnchorPos(sprite: DecompSprite, x: number, y: number, rt: DecompRuntime): void {
  const matrixNum = sprite.matrixNum;
  const m = rt.gba.affineParams[matrixNum];
  if (!m) return;
  if (x !== NO_ANCHOR) {
    const dimension = sOamDimensions32[sprite.shape & 3]?.[sprite.size & 3]?.[0] ?? 0;
    const var1 = (dimension << 8);
    const var2 = Math.trunc((dimension << 16) / m.pa);
    sprite.x2 = GetAnchorCoord(var1, var2, x);
  }
  if (y !== NO_ANCHOR) {
    const dimension = sOamDimensions32[sprite.shape & 3]?.[sprite.size & 3]?.[1] ?? 0;
    const var1 = (dimension << 8);
    const var2 = Math.trunc((dimension << 16) / m.pd);
    sprite.y2 = GetAnchorCoord(var1, var2, y);
  }
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
  if (!anim) return;
  // Chemin command-array complet (LOOP(0)/LOOP(n) intercalés) si l'anim fournit `cmds`.
  // 1:1 décomp check l.1069 : affineAnims[0][0].type != END (anim non vide). INERTE.
  if (anim.cmds) {
    if (anim.cmds.length === 0 || anim.cmds[0]?.kind === 'end') return;
    beginAffineAnimCmds(sprite, anim, rt);
    return;
  }
  if (anim.frames.length === 0) return;
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
  // 1:1 décomp l.1079-1080 : if (anchored) UpdateSpriteMatrixAnchorPos(sprite, sAnchorX, sAnchorY).
  // sAnchorX/Y = data[6]/data[7] (sprite.c:8-9). Inerte si non-ancré.
  if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
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

  const anim = getAffineAnim(sprite);
  // Chemin command-array complet (LOOP(0)/LOOP(n) intercalés) si l'anim fournit `cmds`. INERTE.
  // Tolère anim null (optional chaining) → le reste conserve les null-guards par-branche du legacy.
  if (anim?.cmds) { continueAffineAnimCmds(sprite, anim, rt); return; }

  // 1:1 décomp l.1090 : `if (delayCounter)` = if delayCounter != 0.
  if (sprite.affineAnimDelayCounter !== 0) {
    // 1:1 décomp AffineAnimDelay (l.1114-1122) :
    //   DecrementAffineAnimDelayCounter sets affineAnimPaused return value AND
    //   only decrements if !paused. Then if !paused, re-applies frame relative.
    if (!sprite.affineAnimPaused) {
      sprite.affineAnimDelayCounter--;
      if (anim && sprite.affineAnimCmdIndex < anim.frames.length) {
        const frame = anim.frames[sprite.affineAnimCmdIndex];
        ApplyAffineAnimFrameRelative(sprite, frame, rt);
      }
    }
    // 1:1 décomp l.1109-1110 : anchor APRÈS la branche delay (jamais après le return paused).
    if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
    return;
  }

  // delayCounter == 0 path (l.1094-1107)
  if (sprite.affineAnimPaused) return;  // 1:1 décomp l.1096 : return SANS anchor.

  sprite.affineAnimCmdIndex++;
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
      if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
      return;
    }
    if (anim.terminator === 'JUMP') {
      // 1:1 décomp AffineAnimCmd_jump (sprite.c:1163-1170) : cmdIndex = jump.target
      // (target ≠ 0 supporté ; défaut 0 = ancien comportement). La cible indexe frames[].
      sprite.affineAnimCmdIndex = anim.jumpTarget ?? 0;
    } else if (anim.terminator === 'LOOP') {
      // 1:1 décomp AffineAnimCmd_loop (sprite.c:1124) : compteur de boucle. Modèle normalisé
      // (frames[] seul, top = index 0 = comportement décomp du loop SANS marqueur préc.) :
      // boucle loopCount fois puis fall-through END. Les anims à MARQUEURS LOOP(0)/LOOP(n)
      // intercalés passent par le chemin `cmds` (aucune anim 'LOOP' enregistrée → inerte).
      if ((sprite.affineAnimLoopCounter ?? 0) === 0) {
        sprite.affineAnimLoopCounter = anim.loopCount ?? 0;   // BeginAffineAnimLoop (l.1134)
      } else {
        sprite.affineAnimLoopCounter = (sprite.affineAnimLoopCounter ?? 0) - 1;  // ContinueAffineAnimLoop (l.1141)
      }
      if ((sprite.affineAnimLoopCounter ?? 0) !== 0) {
        sprite.affineAnimCmdIndex = 0;                        // JumpToTopOfAffineAnimLoop → top
      } else {
        sprite.affineAnimEnded = true;                        // compteur épuisé → END
        sprite.affineAnimCmdIndex--;
        ApplyAffineAnimFrameRelative(sprite, { xScale: 0, yScale: 0, rotation: 0, duration: 0 }, rt);
        if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
        return;
      }
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
  // 1:1 décomp l.1109-1110 : anchor après le dispatch frame/jump/loop.
  if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHEMIN COMMAND-ARRAY 1:1 (anim.cmds présent) — transcription LITTÉRALE de
// sprite.c:1084-1186 : ContinueAffineAnim + AffineAnimCmd_{loop,jump,end,frame} +
// BeginAffineAnimLoop + ContinueAffineAnimLoop + JumpToTopOfAffineAnimLoop, avec le
// compteur de boucle (sprite.affineAnimLoopCounter) et les marqueurs LOOP intercalés.
// INERTE tant qu'aucune anim n'enregistre `cmds` (toutes les anims actuelles = modèle
// legacy frames[]+terminator) → dette : non exercé en jeu, à valider au 1er consommateur.
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp GetAffineAnimFrame (sprite.c:1322-1328) pour un cmd command-array. */
function getAffineAnimFrameFromCmd(cmd: AffineAnimCmd | undefined): AffineAnimFrameCmd {
  if (cmd && cmd.kind === 'frame') {
    return { xScale: cmd.xScale, yScale: cmd.yScale, rotation: cmd.rotation, duration: cmd.duration };
  }
  return { xScale: 0, yScale: 0, rotation: 0, duration: 0 };
}

/** 1:1 décomp JumpToTopOfAffineAnimLoop (sprite.c:1146-1161) : rembobine cmdIndex au cmd
 *  suivant le marqueur LOOP précédent (kind==='loop'), uniquement si loopCounter != 0. */
function jumpToTopOfAffineAnimLoopCmds(sprite: DecompSprite, cmds: ReadonlyArray<AffineAnimCmd>): void {
  if ((sprite.affineAnimLoopCounter ?? 0) !== 0) {
    sprite.affineAnimCmdIndex--;
    while (cmds[sprite.affineAnimCmdIndex - 1]?.kind !== 'loop') {
      if (sprite.affineAnimCmdIndex === 0) break;
      sprite.affineAnimCmdIndex--;
    }
    sprite.affineAnimCmdIndex--;
  }
}

/** 1:1 décomp AffineAnimCmd_loop (sprite.c:1124-1130) + Begin/ContinueAffineAnimLoop
 *  (l.1132-1144) : Begin pose loopCounter = LOOP.count, Continue le décrémente ; les
 *  deux rembobinent au top puis re-dispatchent ContinueAffineAnim (récursion 1:1). */
function affineAnimCmdLoopCmds(sprite: DecompSprite, anim: AffineAnim, rt: DecompRuntime): void {
  const cmds = anim.cmds as ReadonlyArray<AffineAnimCmd>;
  const cmd = cmds[sprite.affineAnimCmdIndex];
  if ((sprite.affineAnimLoopCounter ?? 0) !== 0) {
    sprite.affineAnimLoopCounter = (sprite.affineAnimLoopCounter ?? 0) - 1;  // ContinueAffineAnimLoop
  } else {
    sprite.affineAnimLoopCounter = (cmd && cmd.kind === 'loop') ? cmd.count : 0;  // BeginAffineAnimLoop
  }
  jumpToTopOfAffineAnimLoopCmds(sprite, cmds);
  continueAffineAnimCmds(sprite, anim, rt);
}

/** 1:1 décomp BeginAffineAnim (sprite.c:1067-1082) pour le modèle command-array. */
function beginAffineAnimCmds(sprite: DecompSprite, anim: AffineAnim, rt: DecompRuntime): void {
  const cmds = anim.cmds as ReadonlyArray<AffineAnimCmd>;
  // AffineAnimStateRestartAnim (l.1253-1258) : cmdIndex/delay/loop = 0.
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.affineAnimLoopCounter = 0;
  sprite.affineAnimBeginning = false;
  sprite.affineAnimEnded = false;
  const frameCmd = getAffineAnimFrameFromCmd(cmds[0]);
  ApplyAffineAnimFrame(sprite, frameCmd, rt);
  sprite.affineAnimDelayCounter = frameCmd.duration;
  if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
}

/** 1:1 décomp ContinueAffineAnim (sprite.c:1084-1112) pour le modèle command-array. */
function continueAffineAnimCmds(sprite: DecompSprite, anim: AffineAnim, rt: DecompRuntime): void {
  const cmds = anim.cmds as ReadonlyArray<AffineAnimCmd>;
  if (sprite.affineAnimDelayCounter !== 0) {
    // AffineAnimDelay (l.1114-1122)
    if (!sprite.affineAnimPaused) {
      sprite.affineAnimDelayCounter--;
      const frameCmd = getAffineAnimFrameFromCmd(cmds[sprite.affineAnimCmdIndex]);
      ApplyAffineAnimFrameRelative(sprite, frameCmd, rt);
    }
  } else if (sprite.affineAnimPaused) {
    return;  // 1:1 décomp l.1096 : return SANS anchor.
  } else {
    sprite.affineAnimCmdIndex++;
    const cmd = cmds[sprite.affineAnimCmdIndex];
    const kind = cmd?.kind ?? 'end';
    if (kind === 'loop') {
      affineAnimCmdLoopCmds(sprite, anim, rt);
      return;  // le loop re-dispatch (récursif) gère déjà l'anchor.
    } else if (kind === 'jump') {
      // AffineAnimCmd_jump (l.1163-1170)
      sprite.affineAnimCmdIndex = (cmd && cmd.kind === 'jump') ? cmd.target : 0;
      const frameCmd = getAffineAnimFrameFromCmd(cmds[sprite.affineAnimCmdIndex]);
      ApplyAffineAnimFrame(sprite, frameCmd, rt);
      sprite.affineAnimDelayCounter = frameCmd.duration;
    } else if (kind === 'end') {
      // AffineAnimCmd_end (l.1172-1178)
      sprite.affineAnimEnded = true;
      sprite.affineAnimCmdIndex--;
      ApplyAffineAnimFrameRelative(sprite, { xScale: 0, yScale: 0, rotation: 0, duration: 0 }, rt);
    } else {
      // AffineAnimCmd_frame (l.1180-1186)
      const frameCmd = getAffineAnimFrameFromCmd(cmd);
      ApplyAffineAnimFrame(sprite, frameCmd, rt);
      sprite.affineAnimDelayCounter = frameCmd.duration;
    }
  }
  // 1:1 décomp l.1109-1110 : anchor après delay OU dispatch.
  if (sprite.anchored) UpdateSpriteMatrixAnchorPos(sprite, sprite.data[6], sprite.data[7], rt);
}

/** 1:1 décomp `EWRAM_DATA bool8 gAffineAnimsDisabled = FALSE` (sprite.c:292). Quand TRUE,
 *  AnimateSprite (sprite.c:905) NE tick PAS les anims affines → elles gèlent (posé pendant
 *  le link trade, hors solo). Modélisé sur globalThis (même substrat que gOamMatrixAllocBitmap)
 *  pour que ResetAffineAnimData/ResetSpriteData (sprite.ts) le remette FALSE sans nouvelle
 *  arête d'import (évite un cycle TDZ sprite.ts → engine). */
export function AreAffineAnimsDisabled(): boolean {
  return !!(globalThis as Record<string, unknown>).gAffineAnimsDisabled;
}
export function SetAffineAnimsDisabled(v: boolean): void {
  (globalThis as Record<string, unknown>).gAffineAnimsDisabled = v;
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
  // 1:1 décomp AnimateSprite (sprite.c:905) : `if (!gAffineAnimsDisabled)` gèle l'affine tick.
  if ((globalThis as Record<string, unknown>).gAffineAnimsDisabled) return;
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = rt.gSprites[i];
    if (sprite === undefined) continue;
    if (!sprite.affineAnimsTableName) continue;
    // Source de vérité UNIQUE (item 6) : sprite.affineMode = miroir du champ C
    // `sprite->oam.affineMode` ; l'OAM hardware est une sortie pure du sync
    // (syncSpritesToOam) et ne participe plus au gate. (L'ancien OR oam|sprite +
    // recopie oam→sprite rallumait toute affine éteinte 1:1 côté sprite : l'OAM
    // shadow résiduel de la frame N-1 gagnait toujours — bug payé : sous-menus
    // CONDITION chevauchés. Les allumeurs OAM-only ont été convertis pour poser
    // sprite.affineMode, cf. intro/main_menu/storage/SetBattlerSpriteAffineMode.)
    if (!(sprite.affineMode & ST_OAM_AFFINE_ON_MASK)) continue;
    if (sprite.affineAnimBeginning) {
      BeginAffineAnim(sprite, rt);
    } else if (!sprite.affineAnimEnded) {
      ContinueAffineAnim(sprite, rt);
    }
  }
}

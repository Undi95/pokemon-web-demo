/**
 * battle_anim_flying.ts — miroir PARTIEL de src/battle_anim_flying.c
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Callbacks portés (avec leurs _Step) : AnimEllipticalGust (Gust),
 * AnimGustToTarget, AnimAirWaveCrescent (Air Cutter/Aeroblast),
 * AnimFlyBallUp + AnimFlyBallAttack (Fly — paire charge/unleash : le
 * `invisible=TRUE` posé sur l'attaquant par FlyBallUp n'est restauré QUE par
 * FlyBallAttack_Step → portés ensemble), AnimFallingFeather (Feather Dance,
 * struct FeatherDanceData overlay bit-packé 1:1 sur sprite->data[0..7]),
 * AnimWhirlwindLine (Whirlwind), DestroyAnimSpriteAfterTimer (battle_anim_flying.c.c:539).
 *
 * Invités hors battle_anim_flying.c.c (lot orchestrateur, enregistrés ici par NOM C — à
 * re-loger si leurs fichiers miroirs naissent) :
 *  - AnimRazorWindTornado  — src/battle_anim_effects_2.c:1885 (Razor Wind).
 *  - AnimFlyingSandCrescent — src/battle_anim_rock.c:513 (Sandstorm strip
 *    64x16 via SetSubspriteTables).
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  InitAnimLinearTranslation, AnimTranslateLinear, StartAnimLinearTranslation,
  StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { Sin, Cos, gSineTable } from './trig';
import { SetOamMatrix } from '../engine/system/sprite';
import { SeekSpriteAnim } from '../engine/system/sprite-animation';
import {
  getRuntime, SetSubspriteTables, clearSubspriteTable, type NamingSubsprite,
} from '../engine/system/decomp-globals';
import { GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT } from '../engine/battle/util';
import { gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';

type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; callback: unknown;
  spriteId?: number; oamIndex?: number;
  matrixNum?: number; affineMode?: number;
  hFlip?: boolean; vFlip?: boolean;
  subpriority?: number; tileBase?: number;
  anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean;
  affineAnimEnded?: boolean;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
type _RtOam = { tileId?: number; priority?: number; paletteBank?: number; affineMode?: number };
type _Rt = {
  gSprites?: Map<number, _VSprite>;
  gba?: { oam?: _RtOam[] };
  AllocOamMatrix?: () => number;
  GetGpuReg?: (off: number) => number;
};
function _rt(): _Rt | undefined {
  return (globalThis as Record<string, unknown>).__rt as _Rt | undefined;
}

// 1:1 include/gba/defines.h
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;
// 1:1 include/constants/battle_anim.h : ANIM_ATTACKER 0 / ANIM_TARGET 1.
const ANIM_ATTACKER = 0;
const ANIM_TARGET = 1;

// ─── helpers privés (transcriptions locales, pas dans battle_anim_mons.ts) ──

/** Stored-callback nominal « DestroyAnimSprite » (= passer &DestroyAnimSprite en C). */
const _DestroyAnimSpriteCb = (s: unknown): void => { _vItf().DestroyAnimSprite?.(s); };

/** 1:1 `IsContest()` : pas de concours dans ce runtime web → toujours false
 *  (les branches contest sont conservées telles quelles). */
function _IsContest(): boolean { return false; }

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _VSprite): void {
  if (sprite.affineAnimEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `TranslateSpriteInCircle` (battle_anim_mons.c:449) : data[0]=phase,
 *  data[1]=amplitude (Sin ET Cos), data[2]=vitesse, data[3]=durée → enchaîne
 *  sur le callback stocké en data6. */
function _TranslateSpriteInCircle(sprite: _VSprite): void {
  if (sprite.data[3]) {
    sprite.x2 = Sin(sprite.data[0] & 0xFF, sprite.data[1]);
    sprite.y2 = Cos(sprite.data[0] & 0xFF, sprite.data[1]);
    sprite.data[0] += sprite.data[2];
    if (sprite.data[0] >= 0x100) sprite.data[0] -= 0x100;
    else if (sprite.data[0] < 0) sprite.data[0] += 0x100;
    sprite.data[3]--;
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}

// 1:1 decomp battle_util.c — IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function _IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) : position moyenne
 *  battler+partenaire (simple → battler seul). Retourne {x,y} (le C écrit via
 *  pointeurs s16*). */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  const xCoordType = !respectMonPicOffsets ? BATTLER_COORD_X : BATTLER_COORD_X_2;
  const yCoordType = !respectMonPicOffsets ? BATTLER_COORD_Y : BATTLER_COORD_Y_PIC_OFFSET;
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  let partnerX: number;
  let partnerY: number;
  if (_IsDoubleBattle()) {
    partnerX = GetBattlerSpriteCoord(battler ^ 2 /* BATTLE_PARTNER */, xCoordType);
    partnerY = GetBattlerSpriteCoord(battler ^ 2, yCoordType);
  } else {
    partnerX = battlerX;
    partnerY = battlerY;
  }
  return { x: ((battlerX + partnerX) / 2) | 0, y: ((battlerY + partnerY) / 2) | 0 };
}

/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) :
 *  GetAnimBgAttribute(bg2|bg1, BG_ANIM_PRIORITY) = BGxCNT & 3 selon la
 *  position (pattern battle_anim_fight.ts). */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = GetBattlerPosition(battler);
  if (_IsContest())
    return 2;
  else if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_RIGHT)
    return (_rt()?.GetGpuReg?.(0x00C /* REG_OFFSET_BG2CNT */) ?? 0) & 3;
  else
    return (_rt()?.GetGpuReg?.(0x00A /* REG_OFFSET_BG1CNT */) ?? 0) & 3;
}

/** OAM live du sprite (miroir `sprite->oam.*`). */
function _getOam(sprite: _VSprite): _RtOam | undefined {
  return _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
}

/** `GetAnimBattlerSpriteId(animBattler)` (battle_anim_mons.c:373) → spriteId du
 *  mon via la surface __battleControllerOpponent (pattern battle_anim_electric). */
function _getBattlerMonSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  return co?.getBattlerMonSpriteId?.(battler) ?? -1;
}

/** Garantit une matrice OAM PROPRE au sprite (≠ slot 0 partagé identité).
 *  En C les oam AffineNormal_* ont une matrice allouée à la création
 *  (InitSpriteAffineAnim) ; ici le bridge filtre les affine DUMMY
 *  (gDummySpriteAffineAnimTable → pas d'alloc → matrixNum=0). Écrire la
 *  matrice 0 = déformer TOUS les sprites non-affine (leçon Wailord 2026-06-11)
 *  → alloc via rt.AllocOamMatrix + affineMode=1 posé AUSSI dans l'OAM (point
 *  de vérité, leçon interpreter). */
function _ensureOwnMatrix(sprite: _VSprite): number {
  let m = sprite.matrixNum ?? 0;
  if (m <= 0) {
    m = _rt()?.AllocOamMatrix?.() ?? 0;
    if (m > 0) {
      sprite.matrixNum = m;
      sprite.affineMode = 1; // ST_OAM_AFFINE_NORMAL
      const oam = _getOam(sprite);
      if (oam) oam.affineMode = 1;
    }
  }
  return m;
}

/** Pose anim de table (pattern repo) — équivaut à `StartSpriteAnim(sprite, n)`. */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** Pose affine de table (pattern repo) — équivaut à `StartSpriteAffineAnim(sprite, n)`. */
function _StartSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n; spF.affineAnimBeginning = true; spF.affineAnimEnded = false;
}

/** 1:1 `SeekSpriteAnim` (sprite.c:1359) via le moteur de tables plateforme
 *  (src/engine/system/sprite-animation.ts) : positionne animCmdIndex et
 *  applique immédiatement la frame. */
function _SeekSpriteAnim(sprite: _VSprite, animCmdIndex: number): void {
  const r = getRuntime() as unknown;
  if (r && sprite.anims) SeekSpriteAnim(r as never, sprite as never, animCmdIndex | 0);
}

/** 1:1 `DestroyAnimSpriteAfterTimer` (battle_anim_flying.c:539) : data[0]-- <= 0
 *  → FreeOamMatrix + DestroySprite + gAnimVisualTaskCount-- (= exactement ce
 *  que fait DestroyAnimSprite de l'interpréteur). */
function DestroyAnimSpriteAfterTimer(sprite: _VSprite): void {
  if (sprite.data[0]-- <= 0) _vItf().DestroyAnimSprite?.(sprite);
}

// ════════════════════════════════════════════════════════════════════════════
// Callbacks 1:1 (ordre du .c)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimEllipticalGust` (battle_anim_flying.c:353) : tornade de Gust posée
 *  sur la cible (+20 en y), ellipse Sin(32)/Cos(8) phase 191. */
function AnimEllipticalGust(sprite: _VSprite): void {
  InitSpritePosToAnimTarget(sprite as never, false);
  sprite.y += 20;
  sprite.data[1] = 191;
  sprite.invisible = false;
  sprite.callback = _AnimEllipticalGust_Step;
  _AnimEllipticalGust_Step(sprite); // 1:1 sprite->callback(sprite)
}

/** 1:1 `AnimEllipticalGust_Step` (battle_anim_flying.c:362). */
function _AnimEllipticalGust_Step(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[1], 32);
  sprite.y2 = Cos(sprite.data[1], 8);
  sprite.data[1] += 5;
  sprite.data[1] &= 0xFF;
  if (++sprite.data[0] === 71)
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimGustToTarget` (battle_anim_flying.c:408) : tornade qui s'étire
 *  (affine sAffineAnims_GustToTarget, 24 fr.) PUIS file vers la cible. args
 *  [x, y, xCible(miroir côté), yCible, durée]. */
function AnimGustToTarget(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [-25, 0, 0, 0, 20];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  let arg2 = args[2] | 0;
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */)
    arg2 = -arg2;

  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + arg2;
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + (args[3] | 0);
  InitAnimLinearTranslation(sprite as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _AnimGustToTarget_Step as never);
}

/** 1:1 `AnimGustToTarget_Step` (battle_anim_flying.c:424). */
function _AnimGustToTarget_Step(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never))
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimAirWaveCrescent` (battle_anim_flying.c:430) : croissant d'Air
 *  Cutter/Aeroblast. args [x, y, xCible, yCible, durée, seekAnim, moyenner?]
 *  (args 0-3 négativés côté adverse). Translation attacker→target puis destroy. */
function AnimAirWaveCrescent(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [14, -12, 0, -12, 15, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  let a0 = args[0] | 0;
  let a1 = args[1] | 0;
  let a2 = args[2] | 0;
  let a3 = args[3] | 0;
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
    a0 = -a0;
    a1 = -a1;
    a2 = -a2;
    a3 = -a3;
  }
  if (_IsContest()) {
    a1 = -a1;
    a3 = -a3;
  }

  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.x += a0;
  sprite.y += a1;
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;

  if ((args[6] | 0) === 0) {
    sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  } else {
    const avg = _SetAverageBattlerPositions(tgt, true);
    sprite.data[2] = avg.x;
    sprite.data[4] = avg.y;
  }

  sprite.data[2] = sprite.data[2] + a2;
  sprite.data[4] = sprite.data[4] + a3;
  sprite.callback = StartAnimLinearTranslation as never;

  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  _SeekSpriteAnim(sprite, args[5] | 0);
}

/** 1:1 `AnimFlyBallUp` (battle_anim_flying.c:470) : Fly tour de charge — la
 *  « boule » monte (accél data[1]/256 px·fr⁻²) après data[0] frames d'attente ;
 *  l'ATTAQUANT devient INVISIBLE (restauré par AnimFlyBallAttack_Step au tour
 *  d'attaque). args [x, y, attente, accélération]. */
function AnimFlyBallUp(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 13, 336];
  const atk = _vItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.callback = _AnimFlyBallUp_Step;
  // gSprites[GetAnimBattlerSpriteId(ANIM_ATTACKER)].invisible = TRUE;
  const monId = _getBattlerMonSpriteId(atk);
  const mon = monId >= 0 ? _rt()?.gSprites?.get(monId) : undefined;
  if (mon) mon.invisible = true;
}

/** 1:1 `AnimFlyBallUp_Step` (battle_anim_flying.c:479). */
function _AnimFlyBallUp_Step(sprite: _VSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
  } else {
    sprite.data[2] = ((sprite.data[2] + sprite.data[1]) << 16) >> 16; // s16 wrap 1:1
    sprite.y2 -= (sprite.data[2] >> 8);
  }

  if (sprite.y + sprite.y2 < -32)
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimFlyBallAttack` (battle_anim_flying.c:495) : Fly tour d'attaque —
 *  la boule plonge du coin de l'écran vers la cible (affine 1 = rotation
 *  miroir côté adverse) et RESTAURE la visibilité de l'attaquant en sortant
 *  de l'écran. args [durée]. */
function AnimFlyBallAttack(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [20];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
    sprite.x = DISPLAY_WIDTH + 32;
    sprite.y = -32;
    _StartSpriteAffineAnim(sprite, 1);
  } else {
    sprite.x = -32;
    sprite.y = -32;
  }

  sprite.invisible = false;
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);

  InitAnimLinearTranslation(sprite as never);
  sprite.callback = _AnimFlyBallAttack_Step;
}

/** 1:1 `AnimFlyBallAttack_Step` (battle_anim_flying.c:519). */
function _AnimFlyBallAttack_Step(sprite: _VSprite): void {
  sprite.data[0] = 1;
  AnimTranslateLinear(sprite as never);
  if (((sprite.data[3] & 0xFFFF) >>> 8) > 200) { // ((u16)data[3] >> 8) > 200
    sprite.x += sprite.x2;
    sprite.x2 = 0;
    sprite.data[3] &= 0xFF;
  }

  if (sprite.x + sprite.x2 < -32
    || sprite.x + sprite.x2 > DISPLAY_WIDTH + 32
    || sprite.y + sprite.y2 > DISPLAY_HEIGHT) {
    // gSprites[GetAnimBattlerSpriteId(ANIM_ATTACKER)].invisible = FALSE;
    const monId = _getBattlerMonSpriteId(_vItf().getAttacker?.() ?? 0);
    const mon = monId >= 0 ? _rt()?.gSprites?.get(monId) : undefined;
    if (mon) mon.invisible = false;
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Feather Dance — struct FeatherDanceData (battle_anim_flying.c.c:556-571) bit-packé 1:1
// dans sprite->data[0..7] (overlay C exact : `(struct FeatherDanceData *)
// sprite->data`). data[0]=unk0 (0a|0b|0c|0d|unk0_1:4|unk1:8), data[1]=unk2,
// data[2]=unk4(s16), data[3]=unk6, data[4]=unk8, data[5]=unkA,
// data[6]=unkC[2] (LE), data[7]=unkE_0|unkE_1:15. Le `sprite->data[0] = 0`
// final écrase bien tout le mot unk0 — exactement comme en C.
// ════════════════════════════════════════════════════════════════════════════

function _fd0a(d: number[]): number { return d[0] & 1; }
function _fdSet0a(d: number[], v: number): void { d[0] = (d[0] & ~0x0001) | (v & 1); }
function _fd0b(d: number[]): number { return (d[0] >> 1) & 1; }
function _fdSet0b(d: number[], v: number): void { d[0] = (d[0] & ~0x0002) | ((v & 1) << 1); }
function _fd0c(d: number[]): number { return (d[0] >> 2) & 1; }
function _fdSet0c(d: number[], v: number): void { d[0] = (d[0] & ~0x0004) | ((v & 1) << 2); }
function _fd0d(d: number[]): number { return (d[0] >> 3) & 1; }
function _fdSet0d(d: number[], v: number): void { d[0] = (d[0] & ~0x0008) | ((v & 1) << 3); }
function _fd01(d: number[]): number { return (d[0] >> 4) & 0xF; }
function _fdSet01(d: number[], v: number): void { d[0] = (d[0] & ~0x00F0) | ((v & 0xF) << 4); }
function _fdUnk1(d: number[]): number { return (d[0] >> 8) & 0xFF; }
function _fdSetUnk1(d: number[], v: number): void { d[0] = (d[0] & 0x00FF) | ((v & 0xFF) << 8); }
function _fdUnk2(d: number[]): number { return d[1] & 0xFFFF; }
function _fdSetUnk2(d: number[], v: number): void { d[1] = v & 0xFFFF; }
function _fdUnk6(d: number[]): number { return d[3] & 0xFFFF; }
function _fdUnk8(d: number[]): number { return d[4] & 0xFFFF; }
function _fdSetUnk8(d: number[], v: number): void { d[4] = v & 0xFFFF; }
function _fdUnkA(d: number[]): number { return d[5] & 0xFFFF; }
function _fdC0(d: number[]): number { return d[6] & 0xFF; }
function _fdC1(d: number[]): number { return (d[6] >> 8) & 0xFF; }
function _fdE0(d: number[]): number { return d[7] & 1; }
function _fdSetE0(d: number[], v: number): void { d[7] = (d[7] & ~0x0001) | (v & 1); }
function _fdE1(d: number[]): number { return (d[7] >> 1) & 0x7FFF; }
function _fdSetE1(d: number[], v: number): void { d[7] = (d[7] & 0x0001) | ((v & 0x7FFF) << 1); }

/** Miroir des écritures gOamMatrices de la plume (battle_anim_flying.c.c:636-643 / 871-877) :
 *  sinIndex = (u8)((-x2 >> 1) + unkA) ; a=d=gSineTable[sinIndex+64] (cos),
 *  b=sin, c=-sin. Matrice PROPRE via _ensureOwnMatrix (template en affine
 *  DUMMY → pas d'alloc bridge). */
function _FeatherDance_WriteOamMatrix(sprite: _VSprite, d: number[]): void {
  const m = _ensureOwnMatrix(sprite);
  const sinIndex = ((-sprite.x2 >> 1) + _fdUnkA(d)) & 0xFF; // u8 sinIndex
  const sinVal = gSineTable[sinIndex] | 0;
  const cosVal = gSineTable[sinIndex + 64] | 0;
  if (m > 0) SetOamMatrix(m, cosVal, sinVal, -sinVal, cosVal);
}

/** Bloc répété ×4 dans le C (battle_anim_flying.c.c:678-712, identique dans les 4 cases du
 *  switch de AnimFallingFeather_Step) : toggle hFlip+animNum (re-begin anim),
 *  et si unk0_0c → bascule oam.priority (non-contest) / subpriority (contest),
 *  toggle unkE_0, clear unk0_0d. */
function _FeatherDance_FlipAndTogglePriority(sprite: _VSprite, d: number[]): void {
  sprite.hFlip = !sprite.hFlip;
  sprite.animNum = sprite.hFlip ? 1 : 0;
  sprite.animBeginning = true;
  sprite.animEnded = false;
  if (_fd0c(d)) {
    if (!_IsContest()) {
      const oam = _getOam(sprite);
      if (oam) {
        if (!_fdE0(d)) oam.priority = (oam.priority ?? 2) - 1;
        else oam.priority = (oam.priority ?? 2) + 1;
      }
      _fdSetE0(d, _fdE0(d) ^ 1);
    } else {
      if (!_fdE0(d)) sprite.subpriority = (sprite.subpriority ?? 0) - 12;
      else sprite.subpriority = (sprite.subpriority ?? 0) + 12;
      _fdSetE0(d, _fdE0(d) ^ 1);
    }
  }
  _fdSet0d(d, 0);
}

/** 1:1 `AnimFallingFeather` (battle_anim_flying.c:572) : plume de Feather
 *  Dance. args [x, y, phase|sinAmpIdx<<8 (unk2/unkA), vitessePhase (unk4,
 *  bit15=sens), vitesseChute 8.8 (unk6), amplitudes X (unkC lo/hi), ySol
 *  (unkE_1 = monY + arg6), arg7&0x100 → attacker.
 *  NOTE décomp : utilise GetBattlerSpriteCoord avec BATTLER_COORD_ATTR_HEIGHT/
 *  WIDTH (= 0/1 = BATTLER_COORD_X/Y — quirk d'enum du C, miroir tel quel). */
function AnimFallingFeather(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, -16, 64, 2, 104, 11304, 32, 1];
  const d = sprite.data;

  let battler: number;
  if ((args[7] | 0) & 0x100)
    battler = _vItf().getAttacker?.() ?? 0;
  else
    battler = _vItf().getTarget?.() ?? 1;

  let arg0 = args[0] | 0;
  if ((battler & 1) === 0 /* GetBattlerSide == B_SIDE_PLAYER */)
    arg0 = -arg0;

  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X /* BATTLER_COORD_ATTR_HEIGHT == 0 */) + arg0;
  const spriteCoord = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y /* BATTLER_COORD_ATTR_WIDTH == 1 */);
  sprite.y = spriteCoord + (args[1] | 0);
  sprite.invisible = false;

  _fdSetUnk8(d, sprite.y << 8);                       // data->unk8 = sprite->y << 8;
  _fdSetE1(d, spriteCoord + (args[6] | 0));           // data->unkE_1 = spriteCoord + args[6];
  _fdSet0c(d, 1);                                     // data->unk0_0c = 1;
  _fdSetUnk2(d, (args[2] | 0) & 0xFF);                // data->unk2 = args[2] & 0xFF;
  d[5] = ((args[2] | 0) >> 8) & 0xFF;                 // data->unkA = (args[2] >> 8) & 0xFF;
  d[2] = args[3] | 0;                                 // data->unk4 = args[3]; (s16)
  d[3] = (args[4] | 0) & 0xFFFF;                      // data->unk6 = args[4]; (u16)
  d[6] = (args[5] | 0) & 0xFFFF;                      // *(u16 *)(data->unkC) = args[5];

  const oam = _getOam(sprite);
  if (_fdUnk2(d) >= 64 && _fdUnk2(d) <= 191) {
    if (!_IsContest()) {
      if (oam) oam.priority = _GetBattlerSpriteBGPriority(battler) + 1;
    } else {
      if (oam) oam.priority = _GetBattlerSpriteBGPriority(battler);
    }
    _fdSetE0(d, 0);

    if (!(d[2] & 0x8000)) {
      sprite.hFlip = !sprite.hFlip;                   // sprite->hFlip ^= 1;
      sprite.animNum = sprite.hFlip ? 1 : 0;          // sprite->animNum = sprite->hFlip;
      sprite.animBeginning = true;
      sprite.animEnded = false;
    }
  } else {
    if (oam) oam.priority = _GetBattlerSpriteBGPriority(battler);
    _fdSetE0(d, 1);

    if (d[2] & 0x8000) {
      sprite.hFlip = !sprite.hFlip;
      sprite.animNum = sprite.hFlip ? 1 : 0;
      sprite.animBeginning = true;
      sprite.animEnded = false;
    }
  }

  _fdSet01(d, _fdUnk2(d) >> 6);                       // data->unk0_1 = data->unk2 >> 6;
  sprite.x2 = (gSineTable[_fdUnk2(d)] * _fdC0(d)) >> 8;
  _FeatherDance_WriteOamMatrix(sprite, d);

  sprite.callback = _AnimFallingFeather_Step;
}

/** 1:1 `AnimFallingFeather_Step` (battle_anim_flying.c:647) : balancier de la
 *  plume — switch sur le quadrant (unk2/64), flips hFlip aux croisements,
 *  pause 1 frame (unk0_0a), oscillation X = unkC[unk0_0b]·sin(unk2), rotation
 *  OAM continue, descente unk8 += unk6 ; au sol (unkE_1) → data[0]=0 +
 *  DestroyAnimSpriteAfterTimer. */
function _AnimFallingFeather_Step(sprite: _VSprite): void {
  const d = sprite.data;
  if (_fd0a(d)) {
    // if (data->unk1-- % 256 == 0) { unk0_0a = 0; unk1 = 0; }
    const old = _fdUnk1(d);
    _fdSetUnk1(d, (old - 1) & 0xFF);
    if (old % 256 === 0) {
      _fdSet0a(d, 0);
      _fdSetUnk1(d, 0);
    }
  } else {
    switch ((_fdUnk2(d) / 64) | 0) {
      case 0:
        if (_fd01(d) === 1) { // (u8) casts du C : champs 4-bit déjà 0..15
          _fdSet0d(d, 1);
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd01(d) === 3) {
          _fdSet0b(d, _fd0b(d) ^ 1);
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd0d(d)) {
          _FeatherDance_FlipAndTogglePriority(sprite, d);
        }
        _fdSet01(d, 0);
        break;
      case 1:
        if (_fd01(d) === 0) {
          _fdSet0d(d, 1);
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd01(d) === 2) {
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd0d(d)) {
          _FeatherDance_FlipAndTogglePriority(sprite, d);
        }
        _fdSet01(d, 1);
        break;
      case 2:
        if (_fd01(d) === 3) {
          _fdSet0d(d, 1);
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd01(d) === 1) {
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd0d(d)) {
          _FeatherDance_FlipAndTogglePriority(sprite, d);
        }
        _fdSet01(d, 2);
        break;
      case 3:
        if (_fd01(d) === 2) {
          _fdSet0d(d, 1); // (1:1 : PAS de unk0_0a/unk1 ici, contrairement aux autres cases)
        } else if (_fd01(d) === 0) {
          _fdSet0b(d, _fd0b(d) ^ 1);
          _fdSet0a(d, 1);
          _fdSetUnk1(d, 0);
        } else if (_fd0d(d)) {
          _FeatherDance_FlipAndTogglePriority(sprite, d);
        }
        _fdSet01(d, 3);
        break;
    }

    sprite.x2 = ((_fd0b(d) ? _fdC1(d) : _fdC0(d)) * gSineTable[_fdUnk2(d)]) >> 8;
    _FeatherDance_WriteOamMatrix(sprite, d);

    _fdSetUnk8(d, _fdUnk8(d) + _fdUnk6(d));           // data->unk8 += data->unk6; (u16)
    sprite.y = _fdUnk8(d) >> 8;                       // sprite->y = data->unk8 >> 8;
    if (d[2] & 0x8000)
      _fdSetUnk2(d, (_fdUnk2(d) - (d[2] & 0x7FFF)) & 0xFF);
    else
      _fdSetUnk2(d, (_fdUnk2(d) + (d[2] & 0x7FFF)) & 0xFF);

    if (sprite.y + sprite.y2 >= _fdE1(d)) {
      sprite.data[0] = 0;                             // écrase le mot unk0 — 1:1
      sprite.callback = DestroyAnimSpriteAfterTimer;
    }
  }
}

/** 1:1 `AnimWhirlwindLine` (battle_anim_flying.c:903) : une ligne de
 *  Whirlwind/Razor Wind charge. args [x, y, anchor(0=attacker/1=target),
 *  durée, seek 0-4]. La ligne balaye +12px/fr et se recale toutes les 6 fr. */
function AnimWhirlwindLine(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, -8, 1, 60, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;

  if ((args[2] | 0) === ANIM_ATTACKER)
    InitSpritePosToAnimAttacker(sprite as never, false);
  else
    InitSpritePosToAnimTarget(sprite as never, false);

  if (((args[2] | 0) === ANIM_ATTACKER && (atk & 1) === 0 /* B_SIDE_PLAYER */)
    || ((args[2] | 0) === ANIM_TARGET && (tgt & 1) === 0)) {
    sprite.x += 8;
  }

  _SeekSpriteAnim(sprite, args[4] | 0);
  sprite.x -= 32;
  sprite.data[1] = 0x0ccc;
  sprite.invisible = false;

  const offset = (args[4] | 0) & 0xFFFF; // u16 offset
  const mult = 12;                       // u8 mult
  sprite.x2 += mult * offset;
  sprite.data[0] = offset;
  sprite.data[7] = args[3] | 0;
  sprite.callback = _AnimWhirlwindLine_Step;
}

/** 1:1 `AnimWhirlwindLine_Step` (battle_anim_flying.c:931). */
function _AnimWhirlwindLine_Step(sprite: _VSprite): void {
  sprite.x2 += sprite.data[1] >> 8;

  if (++sprite.data[0] === 6) {
    sprite.data[0] = 0;
    sprite.x2 = 0;
    _StartSpriteAnim(sprite, 0);
  }

  if (--sprite.data[7] === -1)
    _vItf().DestroyAnimSprite?.(sprite);
}

// ════════════════════════════════════════════════════════════════════════════
// Invités hors battle_anim_flying.c.c (lot orchestrateur — voir en-tête).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimRazorWindTornado` (battle_anim_effects_2.c:1885) : tornade de
 *  charge de Razor Wind. args [x, y, amplitude, unused(data[4]), phase init,
 *  vitesse, durée] → cercle Sin/Cos autour de l'attaquant (+16 y côté joueur). */
function AnimRazorWindTornado(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [32, 0, 16, 16, 0, 7, 40];
  const atk = _vItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, false);
  if ((atk & 1) === 0 /* GetBattlerSide == B_SIDE_PLAYER */)
    sprite.y += 16;

  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[1] = args[2] | 0;
  sprite.data[2] = args[5] | 0;
  sprite.data[3] = args[6] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.callback = _TranslateSpriteInCircle;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  _TranslateSpriteInCircle(sprite); // 1:1 sprite->callback(sprite)
}

// 1:1 `sFlyingSandSubsprites` (battle_anim_rock.c:134) : 2 pièces 32x16 côte à
// côte (strip 64x16). shape=1 (SPRITE_SHAPE(32x16) horizontal), size=2.
const _sFlyingSandSubspriteTable: ReadonlyArray<NamingSubsprite> = [
  { x: -16, y: 0, shape: 1, size: 2, tileOffset: 0, priority: 1 },
  { x: 16, y: 0, shape: 1, size: 2, tileOffset: 8, priority: 1 },
];

/** Glue plateforme : DestroyAnimSprite + libération des child OAM subsprites
 *  (en C, DestroySprite reset sprite->subspriteTables ; notre registre
 *  _spriteSubsprites est séparé → clearSubspriteTable explicite, sinon les
 *  pièces 32x16 restent affichées orphelines). */
function _FlyingSandCrescent_Destroy(sprite: _VSprite): void {
  if (typeof sprite.spriteId === 'number') clearSubspriteTable(sprite.spriteId);
  _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimFlyingSandCrescent` (battle_anim_rock.c:513) : croissant de sable
 *  de Sandstorm. args [y, vx 8.8, vy 8.8, miroir?]. State machine sur data[0] :
 *  frame 0 = setup (entrée hors écran ±64, SetSubspriteTables strip 64x16,
 *  hFlip côté adverse = `oam.matrixNum = ST_OAM_HFLIP` affine-off), ensuite
 *  translation fractionnaire (data[3]/data[4] &= 0xFF chaque frame) jusqu'à
 *  sortir de l'écran (±32) → destroy. */
function AnimFlyingSandCrescent(sprite: _VSprite): void {
  if (sprite.data[0] === 0) { // sState
    const args = _vItf().getArgs?.() ?? [10, 2304, 96, 1];
    const atk = _vItf().getAttacker?.() ?? 0;
    let arg1 = args[1] | 0;
    if ((args[3] | 0) !== 0 && (atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
      sprite.x = DISPLAY_WIDTH + 64;
      arg1 = -arg1;                  // gBattleAnimArgs[1] = -gBattleAnimArgs[1];
      sprite.data[5] = 1;            // sMirroredX
      sprite.hFlip = true;           // sprite->oam.matrixNum = ST_OAM_HFLIP (affine off)
    } else {
      sprite.x = -64;
    }

    sprite.y = args[0] | 0;
    sprite.invisible = false;
    // SetSubspriteTables(sprite, sFlyingSandSubspriteTable). Le template est en
    // gDummySpriteAnimTable → l'interpréteur ne pose pas tileBase : on le seed
    // depuis l'OAM live (tuile de la sheet ANIM_TAG_FLYING_DIRT) pour que les
    // child OAM résolvent tileOffset 0/8 correctement.
    if (typeof sprite.spriteId === 'number') {
      if (typeof sprite.tileBase !== 'number') {
        const oam = _getOam(sprite);
        if (oam && typeof oam.tileId === 'number') sprite.tileBase = oam.tileId;
      }
      SetSubspriteTables(sprite.spriteId, _sFlyingSandSubspriteTable as NamingSubsprite[]);
    }
    sprite.data[1] = arg1;           // sVelocityX
    sprite.data[2] = args[2] | 0;    // sVelocityY
    sprite.data[0]++;                // sState++
  } else {
    sprite.data[3] += sprite.data[1];          // sFractionalX += sVelocityX;
    sprite.data[4] += sprite.data[2];          // sFractionalY += sVelocityY;
    sprite.x2 += sprite.data[3] >> 8;
    sprite.y2 += sprite.data[4] >> 8;
    sprite.data[3] &= 0xFF;
    sprite.data[4] &= 0xFF;

    if (sprite.data[5] === 0) {
      if (sprite.x + sprite.x2 > DISPLAY_WIDTH + 32) {
        sprite.callback = _FlyingSandCrescent_Destroy; // = DestroyAnimSprite (+ glue subsprites)
      }
    } else if (sprite.x + sprite.x2 < -32) {
      sprite.callback = _FlyingSandCrescent_Destroy;
    }
  }
}

registerAnimCallbacks({
  AnimEllipticalGust: AnimEllipticalGust as never,
  AnimGustToTarget: AnimGustToTarget as never,
  AnimAirWaveCrescent: AnimAirWaveCrescent as never,
  AnimFlyBallUp: AnimFlyBallUp as never,
  AnimFlyBallAttack: AnimFlyBallAttack as never,
  AnimFallingFeather: AnimFallingFeather as never,
  AnimWhirlwindLine: AnimWhirlwindLine as never,
  AnimRazorWindTornado: AnimRazorWindTornado as never,
  AnimFlyingSandCrescent: AnimFlyingSandCrescent as never,
});

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « orbes » (goal 2026-06-11) — AnimBounceBallShrink
// (battle_anim_flying.c:969).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimBounceBallShrink` (battle_anim_flying.c:969) : Rebond (Bounce)
 *  tour de charge — la « boule » se pose sur l'attaquant et joue l'affine du
 *  template (sAffineAnims_BounceBallShrink = rétrécissement) pendant que
 *  l'ATTAQUANT devient INVISIBLE (restauré par AnimBounceBallLand au tour
 *  d'attaque) ; fin d'affine → DestroyAnimSprite. Self-stepper (switch data[0]). */
function AnimBounceBallShrink(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  switch (sprite.data[0]) {
    case 0: {
      InitSpritePosToAnimAttacker(sprite as never, true);
      sprite.invisible = false;
      // gSprites[GetAnimBattlerSpriteId(ANIM_ATTACKER)].invisible = TRUE;
      const monId = _getBattlerMonSpriteId(atk);
      const mon = monId >= 0 ? _rt()?.gSprites?.get(monId) : undefined;
      if (mon) mon.invisible = true;
      ++sprite.data[0];
      break;
    }
    case 1:
      if (sprite.affineAnimEnded) _vItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

registerAnimCallbacks({ AnimBounceBallShrink: AnimBounceBallShrink as never });

// ─── VAGUE F12 : AnimTask_AnimateGustTornadoPalette (battle_anim_flying.c.c, 3 hits) ──────
// Rotation des couleurs 1-8 de la palette GUST toutes args[0] frames pendant
// args[1] frames (le tourbillon qui scintille).
function _flItf(): { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_AnimateGustTornadoPalette(task: { taskId: number; data: number[]; func?: unknown }): void {
  const a = _flItf().getArgs?.() ?? [];
  task.data[0] = a[1]; // durée
  task.data[1] = a[0]; // intervalle
  const sp = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  task.data[2] = sp?.IndexOfSpritePaletteTag?.(10008 /* ANIM_TAG_GUST */) ?? 0xFF;
  task.data[10] = 0;
  task.data[11] = 0;
  task.func = AnimTask_AnimateGustTornadoPalette_Step;
}
/** 1:1 `AnimTask_AnimateGustTornadoPalette_Step` (battle_anim_flying.c:381). */
function AnimTask_AnimateGustTornadoPalette_Step(task: { taskId: number; data: number[] }): void {
  const itf = _flItf();
  if (task.data[2] === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  if (task.data[10]++ === task.data[1]) {
    task.data[10] = 0;
    const rt = (globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void } } | undefined;
    const pf = rt?.gPlttBufferFaded;
    if (pf?.get && pf.set) {
      const base = 256 + task.data[2] * 16;
      const temp = pf.get(base + 8);
      for (let i = 7; i > 0; i--) pf.set(base + 1 + i, pf.get(base + i));
      pf.set(base + 1, temp);
    }
  }
  if (++task.data[11] >= task.data[0]) itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _flRegT } from '../engine/battle/battle-anim-registry';
_flRegT({ AnimTask_AnimateGustTornadoPalette: AnimTask_AnimateGustTornadoPalette as never });

// ─── AnimSkyAttackBird (battle_anim_flying.c:1187-1222) — Sky Attack ─────────
// L'oiseau lumineux part de l'attaquant et TRAVERSE l'écran en passant par la
// position posée par createsprite (cible + offsets), orienté bec-en-avant
// (ArcTan2Neg − 90°), vitesse fixe : la traversée dure 12 frames jusqu'à la
// cible puis continue jusqu'à sortir de l'écran (destroy + libère la matrice).
import { TrySetSpriteRotScale as _skTryRotScale, DestroySpriteAndMatrix as _skDestroyMatrix } from './battle_anim_mons';
import { ArcTan2 as _skArcTan2 } from '../engine/system/decomp-bridge';

/** 1:1 `ArcTan2Neg(x, y)` (battle_anim_mons.c:1368), copie locale pattern repo. */
function _ArcTan2Neg(x: number, y: number): number {
  return (-_skArcTan2(x, y)) & 0xFFFF;
}

/** 1:1 `AnimSkyAttackBird` (battle_anim_flying.c:1187). */
function AnimSkyAttackBird(sprite: _VSprite): void {
  const posx = sprite.x | 0;   // position posée par createsprite (cible + offsets)
  const posy = sprite.y | 0;
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[4] = sprite.x << 4;
  sprite.data[5] = sprite.y << 4;
  sprite.data[6] = Math.trunc(((posx - sprite.x) << 4) / 12);
  sprite.data[7] = Math.trunc(((posy - sprite.y) << 4) / 12);
  let rotation = _ArcTan2Neg(posx - sprite.x, posy - sprite.y);
  rotation = (rotation - 16384) & 0xFFFF;
  _skTryRotScale((sprite as { spriteId?: number }).spriteId ?? -1, true, 0x100, 0x100, rotation);
  sprite.invisible = false;
  sprite.callback = AnimSkyAttackBird_Step;
}

/** 1:1 `AnimSkyAttackBird_Step` (battle_anim_flying.c:1210). */
function AnimSkyAttackBird_Step(sprite: _VSprite): void {
  sprite.data[4] += sprite.data[6];
  sprite.data[5] += sprite.data[7];
  sprite.x = sprite.data[4] >> 4;
  sprite.y = sprite.data[5] >> 4;
  if (sprite.x > DISPLAY_WIDTH + 45 || sprite.x < -45
   || sprite.y > 157 || sprite.y < -45)
    _skDestroyMatrix(sprite as never);
}

registerAnimCallbacks({
  AnimSkyAttackBird: AnimSkyAttackBird as never,
  AnimSkyAttackBird_Step: AnimSkyAttackBird_Step as never,
});

// --- VAGUE F49 : AnimTask_DrillPeckHitSplats (battle_anim_flying.c.c) ---------------------
// 8 hitsplats clignotants en cercle (Sin/Cos -13) toutes les 32 unites de
// phase. Reutilise AnimFlashingHitSplat via __animCallbackRegistry.
function _dpItf(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void; incVisualTaskCount?: () => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
/** 1:1 AnimTask_DrillPeckHitSplats. */
function AnimTask_DrillPeckHitSplats(task: { taskId: number; data: number[] }): void {
  const itf = _dpItf();
  if (!(task.data[0] % 32)) {
    itf.incVisualTaskCount?.(); // 1:1 gAnimVisualTaskCount++ (le splat compte)
    const args = itf.getArgs?.();
    if (args) {
      args[0] = Sin(task.data[0] & 0xFF, -13);
      args[1] = Cos(task.data[0] & 0xFF, -13);
      args[2] = 1;
      args[3] = 3;
    }
    const rt = (globalThis as Record<string, unknown>).__rt as {
      gSprites?: Map<number, { data: number[]; callback: unknown; oamIndex: number }>;
      CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
      gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
    } | undefined;
    const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
    const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
    const tpl = bridge?.lookupGeneratedTemplateTags?.('gFlashingHitSplatSpriteTemplate');
    const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
    const tgt = itf.getTarget?.() ?? 1;
    const x = GetBattlerSpriteCoord(tgt, 2);
    const y = GetBattlerSpriteCoord(tgt, 3);
    const sid = rt?.CreateSpriteInline?.({ oam: { shape: 0, size: 2, priority: 2 }, images: [] } as never, x, y, 3) ?? -1;
    if (sid >= 0) {
      const sp = rt?.gSprites?.get(sid);
      const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
      if (oam && tileStart !== 0xFFFF) {
        oam.tileId = tileStart;
        const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
        if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
      }
      // CreateSpriteAndAnimate 1:1 : le callback du template tourne a la creation.
      const reg = (globalThis as Record<string, unknown>).__animCallbackRegistry as Map<string, (s: unknown) => void> | undefined;
      const cb = reg?.get('AnimFlashingHitSplat');
      if (sp && cb) {
        sp.callback = cb as never;
        cb(sp);
      }
    }
  }
  task.data[0] += 8;
  if (task.data[0] > 255) itf.DestroyAnimVisualTask?.(task.taskId);
}
_flRegT({ AnimTask_DrillPeckHitSplats: AnimTask_DrillPeckHitSplats as never });

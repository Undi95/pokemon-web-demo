/**
 * battle_anim_rock.ts — miroir PARTIEL de `src/battle_anim_rock.c`
 * (décomp pokeemeraude), vague 2c 2026-06-11.
 * AnimParticleInVortex(+Step) 1:1 (:363) — 3 templates générés (sandstorm,
 * whirlpool, fire spin particles...) : montée fixed-point + onde Sin X.
 * Vague 3 : AnimFallingRock(+Step :297/:320), AnimRockFragment (:336),
 * AnimRockTomb(+Step :767/:780), AnimRockBlastRock (:800),
 * AnimRockScatter(+Step :808/:823) — Rock Slide/Blast/Tomb/Smash.
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  GetBattlerSpriteCoord, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  TranslateSpriteLinearFixedPoint, TranslateAnimSpriteToTargetMonLocation, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _vItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 `AnimParticleInVortex` (rock.c:363) : args [x, y, yVel, durée, dPhase,
 *  amplitude, anchor]. La particule MONTE (y2 négatif) en spiralant. */
function AnimParticleInVortex(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 64, 30, 4, 8, 0];
  if ((args[6] | 0) === 0) InitSpritePosToAnimAttacker(sprite as never, false);
  else InitSpritePosToAnimTarget(sprite as never, false);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.data[1] = args[2] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
  sprite.callback = _ParticleInVortex_Step;
}
function _ParticleInVortex_Step(sprite: _VSprite): void {
  sprite.data[4] = (sprite.data[4] + sprite.data[1]) & 0xFFFF;
  sprite.y2 = -((sprite.data[4] << 16 >> 16) >> 8);
  sprite.x2 = Sin(sprite.data[5] & 0xFF, sprite.data[3]);
  sprite.data[5] = (sprite.data[5] + sprite.data[2]) & 0xFF;
  if (--sprite.data[0] === -1) {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Vague 3 — Rock Slide / Rock Blast / Rock Tomb / Rock Smash / Scatter.
// ════════════════════════════════════════════════════════════════════════════

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

// 1:1 decomp battle_util.c — IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function _IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) : position moyenne
 *  battler+partenaire (simple → battler seul ; IsContest()=false dans ce port).
 *  Retourne {x,y} (le C écrit via pointeurs s16*). */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  const xCoordType = !respectMonPicOffsets ? 0 /* BATTLER_COORD_X */ : 2 /* BATTLER_COORD_X_2 */;
  const yCoordType = !respectMonPicOffsets ? 1 /* BATTLER_COORD_Y */ : 3 /* BATTLER_COORD_Y_PIC_OFFSET */;
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

/** 1:1 `TranslateSpriteInEllipse` (battle_anim_mons.c:516) : data[0]=phase,
 *  data[1]=amplitude X (Sin), data[4]=amplitude Y (Cos), data[2]=vitesse,
 *  data[3]=durée → enchaîne sur le callback stocké en data6. */
function _TranslateSpriteInEllipse(sprite: _VSprite): void {
  if (sprite.data[3]) {
    sprite.x2 = Sin(sprite.data[0] & 0xFF, sprite.data[1]);
    sprite.y2 = Cos(sprite.data[0] & 0xFF, sprite.data[4]);
    sprite.data[0] += sprite.data[2];
    if (sprite.data[0] >= 0x100) sprite.data[0] -= 0x100;
    else if (sprite.data[0] < 0) sprite.data[0] += 0x100;
    sprite.data[3]--;
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}

/** 1:1 `InitSpriteDataForLinearTranslation` (battle_anim_mons.c:1055) : deltas
 *  8.8 fixed-point en s16 (wrap C) divisés par la durée data[0]. */
function _InitSpriteDataForLinearTranslation(sprite: _VSprite): void {
  const x = (((sprite.data[2] - sprite.data[1]) << 8) << 16) >> 16; // s16 wrap 1:1
  const y = (((sprite.data[4] - sprite.data[3]) << 8) << 16) >> 16; // s16 wrap 1:1
  sprite.data[1] = (x / sprite.data[0]) | 0;
  sprite.data[2] = (y / sprite.data[0]) | 0;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}

/** 1:1 `AnimFallingRock` (battle_anim_rock.c:297) : rocher de Rock Slide. args
 *  [xOff, animNum, dériveX, moyennerSurCible?]. Ellipse (chute Cos -70, 16 fr.)
 *  → _Step (rebond) → destroy. */
function AnimFallingRock(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0];
  if ((args[3] | 0) !== 0) {
    const tgt = _vItf().getTarget?.() ?? 1;
    const avg = _SetAverageBattlerPositions(tgt, false);
    sprite.x = avg.x;
    sprite.y = avg.y;
  }
  sprite.x += args[0] | 0;
  sprite.y += 14;
  _StartSpriteAnim(sprite, args[1] | 0);
  // AnimateSprite(sprite) : le moteur de tables anime via animBeginning (cf. effects_3).
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 4;
  sprite.data[3] = 16;
  sprite.data[4] = -70;
  sprite.data[5] = args[2] | 0;
  StoreSpriteCallbackInData6(sprite as never, _AnimFallingRock_Step as never);
  sprite.callback = _TranslateSpriteInEllipse;
  _TranslateSpriteInEllipse(sprite);
}

/** 1:1 `AnimFallingRock_Step` (battle_anim_rock.c:320) : 2e ellipse (rebond,
 *  phase 192, amplitude Y -24, 32 fr.) → DestroySpriteAndMatrix. */
function _AnimFallingRock_Step(sprite: _VSprite): void {
  sprite.x += sprite.data[5];
  sprite.data[0] = 192;
  sprite.data[1] = sprite.data[5];
  sprite.data[2] = 4;
  sprite.data[3] = 32;
  sprite.data[4] = -24;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _TranslateSpriteInEllipse;
  _TranslateSpriteInEllipse(sprite);
}

/** 1:1 `AnimRockFragment` (battle_anim_rock.c:336) : éclats d'impact Rock
 *  Blast/Rock Smash. args [x(miroir côté), y, dx, dy, durée, animNum] →
 *  translation fixed-point → destroy. */
function AnimRockFragment(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 20, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  _StartSpriteAnim(sprite, args[5] | 0);
  // AnimateSprite(sprite) : moteur de tables.
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) sprite.x -= args[0] | 0;
  else sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + (args[2] | 0);
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + (args[3] | 0);
  _InitSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.callback = TranslateSpriteLinearFixedPoint as never;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
}

/** 1:1 `AnimRockTomb` (battle_anim_rock.c:767) : rocher de Rock Tomb. args
 *  [x2, y2Base, distChute, duréeAttente, animNum]. INVISIBLE au setup (1:1
 *  décomp : `sprite->invisible = TRUE`), le _Step le révèle dès la frame 1. */
function AnimRockTomb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 12, 30, 0];
  _StartSpriteAnim(sprite, args[4] | 0);
  sprite.x2 = args[0] | 0;
  sprite.data[2] = args[1] | 0;
  sprite.data[3] = (sprite.data[3] | 0) - (args[2] | 0);
  sprite.data[0] = 3;
  sprite.data[1] = args[3] | 0;
  sprite.callback = _AnimRockTomb_Step;
  sprite.invisible = true;
}

/** 1:1 `AnimRockTomb_Step` (battle_anim_rock.c:780) : chute accélérée
 *  (incrément data[0]++ par frame, clamp y2≤data[2]) puis attente data[1]
 *  frames → DestroyAnimSprite. */
function _AnimRockTomb_Step(sprite: _VSprite): void {
  sprite.invisible = false;
  if (sprite.data[3] !== 0) {
    sprite.y2 = sprite.data[2] + sprite.data[3];
    sprite.data[3] += sprite.data[0];
    sprite.data[0]++;
    if (sprite.data[3] > 0) sprite.data[3] = 0;
  } else {
    if (--sprite.data[1] === 0) _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimRockBlastRock` (battle_anim_rock.c:800) : projectile Rock Blast —
 *  affine 1 (spin miroir) si attaquant côté adverse + translation vers la cible
 *  (TranslateAnimSpriteToTargetMonLocation gère args/position/destroy). */
function AnimRockBlastRock(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((atk & 1) === 1 /* GetBattlerSide == B_SIDE_OPPONENT */) _StartSpriteAffineAnim(sprite, 1);
  TranslateAnimSpriteToTargetMonLocation(sprite as never);
}

/** 1:1 `AnimRockScatter` (battle_anim_rock.c:808) : débris projetés depuis la
 *  cible. args [xOff, yOff, amplitudeSin, animNum]. */
function AnimRockScatter(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 2, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, 0 /* BATTLER_COORD_X */);
  sprite.y = GetBattlerSpriteCoord(tgt, 1 /* BATTLER_COORD_Y */);
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.data[1] = args[0] | 0;
  sprite.data[2] = args[1] | 0;
  sprite.data[5] = args[2] | 0;
  _StartSpriteAnim(sprite, args[3] | 0);
  sprite.invisible = false;
  sprite.callback = _AnimRockScatter_Step;
}

/** 1:1 `AnimRockScatter_Step` (battle_anim_rock.c:823) : dérive X cumulée /40
 *  (division C tronquée) + arche Sin en Y ; destroy quand data[0] > 140. */
function _AnimRockScatter_Step(sprite: _VSprite): void {
  sprite.data[0] += 8;
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 += (((sprite.data[3] << 16) >> 16) / 40) | 0;
  sprite.y2 -= Sin(sprite.data[0] & 0xFF, sprite.data[5]);
  if (sprite.data[0] > 140) _vItf().DestroyAnimSprite?.(sprite);
}

registerAnimCallbacks({
  AnimParticleInVortex: AnimParticleInVortex as never,
  AnimFallingRock: AnimFallingRock as never,
  AnimRockFragment: AnimRockFragment as never,
  AnimRockTomb: AnimRockTomb as never,
  AnimRockBlastRock: AnimRockBlastRock as never,
  AnimRockScatter: AnimRockScatter as never,
});

// ─── VAGUE F34 : Seismic Toss (rock.c:836-887) ──────────────────────────────
// Le fond défile (la « terre tourne ») : scroll BG3_Y décéléré (MoveSeismicTossBg)
// puis ré-accéléré en Cos à l'impact (BgAccelerateDownAtEnd) ; bascule du
// screen-size BG3 512x256 → 256x256 (UpdateAnimBg3ScreenSize) pour le wrap.
import { registerAnimTasks as _stRegT } from '../engine/battle/battle-anim-registry';
import { Cos as _stCos } from './trig';

type _StTask = { taskId: number; data: number[]; func?: unknown };
function _stItf(): { getArgs?: () => number[]; getAnimMoveDmg?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _stBg3Y(): number {
  return ((globalThis as Record<string, unknown>).gBattle_BG3_Y as number) | 0;
}
function _stSetBg3Y(v: number): void {
  (globalThis as Record<string, unknown>).gBattle_BG3_Y = v;
}

/** 1:1 `UpdateAnimBg3ScreenSize(largeScreenSize)` (battle_anim_mons.c:1032) :
 *  SetAnimBgAttribute(3, SCREEN_SIZE, 0|1) — AREA_OVERFLOW_MODE est ignoré par
 *  le matériel en mode text (BG3 combat = text) → no-op réel chez nous aussi. */
function _UpdateAnimBg3ScreenSize(largeScreenSize: boolean): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { bg: (i: number) => { config: { screenSize: number } } } } | undefined;
  const cfg = rt?.gba?.bg(3)?.config;
  if (!cfg) return;
  // IsContest() = false (post-camion).
  cfg.screenSize = largeScreenSize ? 1 : 0;
}

/** 1:1 `AnimTask_GetSeismicTossDamageLevel` (rock.c:836) → gBattleAnimArgs[7]. */
function AnimTask_GetSeismicTossDamageLevel(task: _StTask): void {
  const itf = _stItf();
  const args = itf.getArgs?.();
  const dmg = itf.getAnimMoveDmg?.() ?? 0;
  if (args) {
    if (dmg < 33) args[7] = 0;
    if (dmg - 33 >= 0 && dmg - 33 < 33) args[7] = 1;  // (u32)dmg-33 < 33
    if (dmg > 65) args[7] = 2;
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}

/** 1:1 `AnimTask_MoveSeismicTossBg` (rock.c:848). */
function AnimTask_MoveSeismicTossBg(task: _StTask): void {
  if (task.data[0] === 0) {
    _UpdateAnimBg3ScreenSize(false);
    task.data[1] = 200;
  }
  _stSetBg3Y(_stBg3Y() + Math.trunc(task.data[1] / 10));
  task.data[1] -= 3;
  if (task.data[0] === 120) {
    _UpdateAnimBg3ScreenSize(true);
    _stItf().DestroyAnimVisualTask?.(task.taskId);
  }
  task.data[0]++;
}

/** 1:1 `AnimTask_SeismicTossBgAccelerateDownAtEnd` (rock.c:868). */
function AnimTask_SeismicTossBgAccelerateDownAtEnd(task: _StTask): void {
  const itf = _stItf();
  if (task.data[0] === 0) {
    _UpdateAnimBg3ScreenSize(false);
    task.data[0]++;
    task.data[2] = _stBg3Y();
  }
  task.data[1] += 80;
  task.data[1] &= 0xFF;
  _stSetBg3Y(task.data[2] + _stCos(4, task.data[1]));
  const args = itf.getArgs?.();
  if (args && args[7] === 0xFFF) {
    _stSetBg3Y(0);
    _UpdateAnimBg3ScreenSize(true);
    itf.DestroyAnimVisualTask?.(task.taskId);
  }
}

_stRegT({
  AnimTask_GetSeismicTossDamageLevel: AnimTask_GetSeismicTossDamageLevel as never,
  AnimTask_MoveSeismicTossBg: AnimTask_MoveSeismicTossBg as never,
  AnimTask_SeismicTossBgAccelerateDownAtEnd: AnimTask_SeismicTossBgAccelerateDownAtEnd as never,
});

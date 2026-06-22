/**
 * battle_anim_rock.ts — miroir PARTIEL de `src/battle_anim_rock.c`
 * (décomp pokeemeraude), vague 2c 2026-06-11.
 * AnimParticleInVortex(+Step) 1:1 (:363) — 3 templates générés (sandstorm,
 * whirlpool, fire spin particles...) : montée fixed-point + onde Sin X.
 * Vague 3 : AnimFallingRock(+Step :297/:320), AnimRockFragment (:336),
 * AnimRockTomb(+Step :767/:780), AnimRockBlastRock (:800),
 * AnimRockScatter(+Step :808/:823) — Rock Slide/Blast/Tomb/Smash.
 */
import { CreateSprite } from '../engine/system/decomp-bridge';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { DestroySprite } from './sprite';
import { getRuntime } from '../engine/system/decomp-globals';
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

/** 1:1 `AnimParticleInVortex` (battle_anim_rock.c.c:363) : args [x, y, yVel, durée, dPhase,
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

// ─── VAGUE F34 : Seismic Toss (battle_anim_rock.c.c:836-887) ──────────────────────────────
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

/** 1:1 `AnimTask_GetSeismicTossDamageLevel` (battle_anim_rock.c.c:836) → gBattleAnimArgs[7]. */
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

/** 1:1 `AnimTask_MoveSeismicTossBg` (battle_anim_rock.c.c:848). */
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

/** 1:1 `AnimTask_SeismicTossBgAccelerateDownAtEnd` (battle_anim_rock.c.c:868). */
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

// --- VAGUE F60 : AnimTask_LoadSandstormBackground (battle_anim_rock.c.c:396-492) ----------
// Le fond de sable defilant (BG1 anim) : charge sandstorm_brew + palette
// FlyingDirt (slot BG 8), scroll -6/+6 X et -1 Y par frame, fondu 0..7,
// 101f plein, fondu inverse, demonte. tBlendTimer=d10, tBlend=d11, tState=d12.
import {
  GetBattleAnimBg1Data as _ssbBgData,
  AnimLoadCompressedBgGfx as _ssbLoadGfx,
  AnimLoadCompressedBgTilemap as _ssbLoadMap,
  ClearBattleAnimBg as _ssbClearBg,
} from '../engine/battle/battle-anim-interpreter';

type _SsbTask = { taskId: number; data: number[]; func?: unknown };
function _ssbItf(): { getArgs?: () => number[]; getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _ssbRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number } } };
  gPlttBufferFaded?: { set?: (i: number, v: number) => void };
  gPlttBufferUnfaded?: { set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _ssbSetBg1XY(x: number | null, y: number | null): void {
  const g = globalThis as Record<string, unknown>;
  if (x !== null) g.gBattle_BG1_X = x;
  if (y !== null) g.gBattle_BG1_Y = y;
}
function _ssbBg1X(): number { return ((globalThis as Record<string, unknown>).gBattle_BG1_X as number) | 0; }
function _ssbBg1Y(): number { return ((globalThis as Record<string, unknown>).gBattle_BG1_Y as number) | 0; }
let _ssbPalFetching = false;
function _ssbLoadFlyingDirtPal(paletteId: number): void {
  // gBattleAnimSpritePal_FlyingDirt = la palette du tag sprite FLYING_DIRT
  // (manifest sprites) -> slot BG paletteId (1:1 LoadCompressedPalette).
  const cache = (globalThis as Record<string, unknown>).__assetCache as Map<string, unknown> | undefined;
  const cached = cache?.get('gAnimPalTag_10261');
  const apply = (p16: Uint16Array): void => {
    const rt = _ssbRt();
    for (let k = 0; k < 16 && k < p16.length; k++) {
      rt.gPlttBufferUnfaded?.set?.(paletteId * 16 + k, p16[k]);
      rt.gPlttBufferFaded?.set?.(paletteId * 16 + k, p16[k]);
    }
  };
  if (cached instanceof Uint16Array) { apply(cached); return; }
  if (_ssbPalFetching) return;
  _ssbPalFetching = true;
  void fetch('/decomp/em/battle_anims/sprites/flying_dirt.gbapal').then((r) => r.arrayBuffer()).then((b) => {
    const p = new Uint16Array(b);
    cache?.set('gAnimPalTag_10261', p);
    apply(p);
    _ssbPalFetching = false;
  }).catch(() => { _ssbPalFetching = false; });
}

/** 1:1 AnimTask_LoadSandstormBackground (battle_anim_rock.c.c:396). */
function AnimTask_LoadSandstormBackground(task: _SsbTask): void {
  const itf = _ssbItf();
  const args = itf.getArgs?.() ?? [0];
  let var0 = 0;
  const rt = _ssbRt();
  rt.SetGpuReg?.(0x50, 0x3F42); // TGT1_BG1 | TGT2_ALL | EFFECT_BLEND
  rt.SetGpuReg?.(0x52, 0 | (16 << 8));
  const bg1 = rt.gba?.bg(1)?.config;
  if (bg1) {
    bg1.priority = 1;       // SetAnimBgAttribute(1, PRIORITY, 1)
    bg1.screenSize = 0;     // SCREEN_SIZE 0
    bg1.charBaseIndex = 1;  // CHAR_BASE_BLOCK 1 (non-contest)
  }
  _ssbSetBg1XY(0, 0);
  const animBg = _ssbBgData();
  _ssbLoadGfx(animBg.bgId, 'gBattleAnimBgImage_Sandstorm', animBg.tilesOffset);
  _ssbLoadMap(animBg.bgId, 'gBattleAnimBgTilemap_Sandstorm');
  _ssbLoadFlyingDirtPal(animBg.paletteId);
  if (args[0] && (((itf.getAttacker?.() ?? 0) & 1) !== 0)) var0 = 1;
  task.data[0] = var0;
  task.data[10] = 0;
  task.data[11] = 0;
  task.data[12] = 0;
  task.func = _LoadSandstormBackground_Step;
}
function _LoadSandstormBackground_Step(task: _SsbTask): void {
  const rt = _ssbRt();
  if (task.data[0] === 0) _ssbSetBg1XY(_ssbBg1X() - 6, null);
  else _ssbSetBg1XY(_ssbBg1X() + 6, null);
  _ssbSetBg1XY(null, _ssbBg1Y() - 1);
  switch (task.data[12]) {
    case 0:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        task.data[11]++;
        rt.SetGpuReg?.(0x52, (task.data[11] & 0xFF) | ((16 - task.data[11]) << 8));
        if (task.data[11] === 7) {
          task.data[12]++;
          task.data[11] = 0; // tFullAlphaTimer (meme champ, 1:1)
        }
      }
      break;
    case 1:
      if (++task.data[11] === 101) {
        task.data[11] = 7; // tBlend repositionne (1:1)
        task.data[12]++;
      }
      break;
    case 2:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        task.data[11]--;
        rt.SetGpuReg?.(0x52, (task.data[11] & 0xFF) | ((16 - task.data[11]) << 8));
        if (task.data[11] === 0) {
          task.data[12]++;
          task.data[11] = 0;
        }
      }
      break;
    case 3: {
      const animBg = _ssbBgData();
      _ssbClearBg(animBg.bgId);
      task.data[12]++;
      break;
    }
    case 4: {
      const bg1 = rt.gba?.bg(1)?.config;
      if (bg1) bg1.charBaseIndex = 0; // CHAR_BASE_BLOCK 0 (non-contest)
      _ssbSetBg1XY(0, 0);
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      if (bg1) bg1.priority = 1;
      _ssbItf().DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
}
_stRegT({ AnimTask_LoadSandstormBackground: AnimTask_LoadSandstormBackground as never });

// --- VAGUE F64 : AnimTask_Rollout (battle_anim_rock.c.c:584-741) --------------------------
// Recul (10f), pause 20f, charge vers la cible (data 8.3) en semant des
// particules boue/roche en arc (tileOffset par compteur Rollout 1..5),
// vie des particules par la translation + decrement via scan-par-func.
import { InitAnimArcTranslation as _roArcInit, TranslateAnimHorizontalArc as _roArcRun } from './battle_anim_mons';
import { MAX_SPRITES } from '../engine/system/decomp-runtime';

type _RoTask = { taskId: number; data: number[]; func?: unknown };
function _roItf(): { getAttacker?: () => number; getTarget?: () => number; getDisableStruct?: () => { rolloutTimerStartValue?: number; rolloutTimer?: number } | null; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _roRt(): {
  gSprites?: Array<{ x2: number; y2: number; data: number[]; callback: unknown; oamIndex: number } | undefined>;
  gTasks?: Map<number, { data: number[]; func?: unknown }>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  DestroySprite?: (i: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _roAtkSpriteId(): number {
  const b = _roItf().getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
/** 1:1 GetRolloutCounter (battle_anim_rock.c.c) : startValue - timer, hors 1..5 -> 1. */
function _GetRolloutCounter(): number {
  const ds = _roItf().getDisableStruct?.();
  const retVal = (((ds?.rolloutTimerStartValue ?? 0) - (ds?.rolloutTimer ?? 0)) & 0xFF);
  return ((retVal - 1) & 0xFF) > 4 ? 1 : retVal;
}

/** 1:1 AnimTask_Rollout (battle_anim_rock.c.c:584). */
function AnimTask_Rollout(task: _RoTask): void {
  const itf = _roItf();
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  const var0 = GetBattlerSpriteCoord(atk, 2) & 0xFFFF;
  const var1 = (GetBattlerSpriteCoord(atk, 1) + 24) & 0xFFFF;
  const var2 = GetBattlerSpriteCoord(tgt, 2) & 0xFFFF;
  const var3 = (GetBattlerSpriteCoord(tgt, 1) + 24) & 0xFFFF;
  const rolloutCounter = _GetRolloutCounter();
  task.data[8] = rolloutCounter === 1 ? 32 : 48 - rolloutCounter * 8;
  task.data[0] = 0;
  task.data[11] = 0;
  task.data[9] = 0;
  task.data[12] = 1;
  task.data[10] = Math.trunc(task.data[8] / 8) - 1;
  task.data[2] = var0 * 8;
  task.data[3] = var1 * 8;
  task.data[4] = Math.trunc(((var2 - var0) * 8) / task.data[8]);
  task.data[5] = Math.trunc(((var3 - var1) * 8) / task.data[8]);
  task.data[6] = 0;
  task.data[7] = 0;
  task.data[1] = rolloutCounter;
  task.data[15] = _roAtkSpriteId();
  task.func = _Rollout_Step;
}
function _Rollout_Step(task: _RoTask): void {
  const rt = _roRt();
  const sp = rt.gSprites?.[task.data[15]];
  switch (task.data[0]) {
    case 0:
      task.data[6] -= task.data[4];
      task.data[7] -= task.data[5];
      if (sp) {
        sp.x2 = task.data[6] >> 3;
        sp.y2 = task.data[7] >> 3;
      }
      if (++task.data[9] === 10) {
        task.data[11] = 20;
        task.data[0]++;
      }
      (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(38 /* SE_M_HEADBUTT */);
      break;
    case 1:
      if (--task.data[11] === 0) task.data[0]++;
      break;
    case 2:
      if (--task.data[9] !== 0) {
        task.data[6] += task.data[4];
        task.data[7] += task.data[5];
      } else {
        task.data[6] = 0;
        task.data[7] = 0;
        task.data[0]++;
      }
      if (sp) {
        sp.x2 = task.data[6] >> 3;
        sp.y2 = task.data[7] >> 3;
      }
      break;
    case 3:
      task.data[2] += task.data[4];
      task.data[3] += task.data[5];
      if (++task.data[9] >= task.data[10]) {
        task.data[9] = 0;
        _CreateRolloutDirtSprite(task);
        (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(37 /* SE_M_DIG */);
      }
      if (--task.data[8] === 0) task.data[0]++;
      break;
    case 4:
      if (task.data[11] === 0) _roItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 CreateRolloutDirtSprite (battle_anim_rock.c.c:697). */
function _CreateRolloutDirtSprite(task: _RoTask): void {
  let tplName: string;
  let tileOffset: number;
  switch (task.data[1]) {
    case 1: tplName = 'gRolloutMudSpriteTemplate'; tileOffset = 0; break;
    case 2:
    case 3: tplName = 'gRolloutRockSpriteTemplate'; tileOffset = 80; break;
    case 4: tplName = 'gRolloutRockSpriteTemplate'; tileOffset = 64; break;
    case 5: tplName = 'gRolloutRockSpriteTemplate'; tileOffset = 48; break;
    default: return;
  }
  let x = (task.data[2] >> 3) & 0xFFFF;
  const y = (task.data[3] >> 3) & 0xFFFF;
  x = (x + task.data[12] * 4) & 0xFFFF;
  const rt = _roRt();
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.(tplName);
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = CreateSprite({ oam: { shape: 0, size: 1, priority: 2 }, images: [] } as never, x, y, 35) ?? -1;
  if (sid >= 0) {
    const dirt = rt.gSprites?.[sid];
    const oam = dirt ? rt.gba?.oam[dirt.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart + tileOffset;
      const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
      if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
    }
    if (dirt) {
      dirt.data[0] = 18;
      dirt.data[2] = ((task.data[12] * 20) + x + (task.data[1] * 3)) & 0xFFFF;
      dirt.data[4] = y;
      dirt.data[5] = -16 - task.data[1] * 2;
      _roArcInit(dirt as never);
      dirt.callback = _AnimRolloutParticle as never;
      task.data[11]++;
    }
  }
  task.data[12] *= -1;
}
/** 1:1 AnimRolloutParticle : arc puis decremente LA task Rollout (scan par func). */
function _AnimRolloutParticle(sprite: { data: number[] }): void {
  if (_roArcRun(sprite as never)) {
    const rt = _roRt();
    for (const t of rt.gTasks?.values() ?? []) {
      if (t.func === _Rollout_Step) t.data[11]--;
    }
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
_stRegT({ AnimTask_Rollout: AnimTask_Rollout as never });

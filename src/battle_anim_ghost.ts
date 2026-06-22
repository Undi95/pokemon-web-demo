/**
 * battle_anim_ghost.ts — miroir PARTIEL de `src/battle_anim_ghost.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Portés 1:1 :
 *  - AnimConfuseRayBallBounce (+_Step1/_Step2/UpdateConfuseRayBallBlend) (:220-311)
 *  - AnimConfuseRayBallSpiral (+_Step) (:313-336)
 *  - AnimShadowBall (+_Step) (:400-460)
 *  - AnimLick (+_Step) (:462-513)
 *  - AnimCurseNail (+_Step1/_Step2/_End) (:1036-1125)
 *  - AnimGhostStatusSprite (+_Step) (:1127-1174) — partagé Curse ghost / Nightmare devil
 *  - AnimDevil — ⚠ vit dans `src/battle_anim_effects_2.c:3578` (décomp), porté ici
 *    sur ordre de lot ; DETTE placement : à déplacer dans
 *    `src/game/battle_anim_effects_2.ts` quand ce miroir-là sera créé.
 *
 * Conventions repo : accès interpréteur LAZY par surface globale (zéro import
 * statique de l'interpréteur — cycle ESM), helpers communs importés de
 * battle_anim_mons.ts, GBA regs via __rt.SetGpuReg (pattern battle_anim_throw).
 */
import { CreateSprite } from '../harness/runtime/decomp-bridge';
import { registerAnimCallbacks } from './engine/battle/battle-anim-generated-bridge';
import { DestroySprite } from './sprite';
import { getRuntime } from '../harness/runtime/decomp-globals';
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  InitAnimLinearTranslation, AnimTranslateLinear, StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { GetBattlerPosition } from './engine/battle/util';

type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; callback: unknown;
  oamIndex?: number; subpriority?: number; hFlip?: boolean; animEnded?: boolean;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _rt(): {
  SetGpuReg?: (off: number, v: number) => void;
  gba?: { oam?: Array<{ tileId?: number; priority?: number }> };
} | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
/** Entrée OAM réelle du sprite (rt.gba.oam[oamIndex]) — pour oam.priority / oam.tileNum. */
function _oam(sprite: _VSprite): { tileId?: number; priority?: number } | undefined {
  return _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
}
function _PlaySE(seId: number): void {
  ((globalThis as { __PlaySE?: (id: number) => void }).__PlaySE)?.(seId);
}
/** Réinterprète les 16 bits bas en s16 signé (= cast (s16) décomp). */
function _s16(v: number): number { return (v << 16) >> 16; }

const SE_M_CONFUSE_RAY = 196;            // songs.h:203
const REG_OFFSET_BLDCNT = 0x50;          // io_reg.h
const REG_OFFSET_BLDALPHA = 0x52;
const BLDCNT_BLEND_TGT2ALL = 0x3F40;     // BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL
/** 1:1 io_reg.h `BLDALPHA_BLEND(eva, evb)` = eva | (evb << 8). */
function _BLDALPHA_BLEND(eva: number, evb: number): number {
  return ((eva & 0xFFFF) | ((evb & 0xFF) << 8)) & 0xFFFF;
}
/** 1:1 macro `StartSpriteAnim(sprite, n)` — pattern repo (moteur de tables anims). */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

// ─── Helpers battle_anim_mons.c absents du miroir TS — transcrits localement ──

/** 1:1 `InitAnimLinearTranslationWithSpeed` (battle_anim_mons.c:1155) :
 *  data[0] = vitesse → converti en nb de frames = (abs(destX-startX)<<8)/vitesse. */
function _InitAnimLinearTranslationWithSpeed(sprite: _VSprite): void {
  const v1 = Math.abs(_s16(sprite.data[2]) - _s16(sprite.data[1])) << 8;
  sprite.data[0] = _s16(Math.trunc(v1 / _s16(sprite.data[0])));
  InitAnimLinearTranslation(sprite as never);
}

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décompte data[0] puis
 *  restaure le callback stocké en data6. */
function _WaitAnimForDuration(sprite: _VSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `DestroyAnimSpriteAndDisableBlend` (battle_anim_mons.c:741). */
function _DestroyAnimSpriteAndDisableBlend(sprite: _VSprite): void {
  const rt = _rt();
  rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
  rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
  _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `GetBattlerSpriteSubpriority` (battle_anim_mons.c:2035, hors contest) :
 *  PLAYER_LEFT=30, OPPONENT_LEFT=40, PLAYER_RIGHT=20, OPPONENT_RIGHT=50. */
function _GetBattlerSpriteSubpriority(battler: number): number {
  switch (GetBattlerPosition(battler) & 3) {
    case 0: return 30;   // B_POSITION_PLAYER_LEFT
    case 1: return 40;   // B_POSITION_OPPONENT_LEFT
    case 2: return 20;   // B_POSITION_PLAYER_RIGHT
    default: return 50;  // B_POSITION_OPPONENT_RIGHT
  }
}

// ─── CONFUSE RAY ──────────────────────────────────────────────────────────────

/** 1:1 `AnimConfuseRayBallBounce` (battle_anim_ghost.c:220) : la boule part de
 *  l'attaquant vers la cible à vitesse args[2] (288), blend OBJ 16/0, rebond
 *  Sin/Cos via data[5] dans les steps. args [xOff, yOff, vitesse]. */
function AnimConfuseRayBallBounce(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [28, 0, 288];
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* BATTLER_COORD_X_2 */);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3 /* BATTLER_COORD_Y_PIC_OFFSET */);
  _InitAnimLinearTranslationWithSpeed(sprite);
  sprite.callback = AnimConfuseRayBallBounce_Step1;
  sprite.data[6] = 16;
  const rt = _rt();
  rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
  rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, sprite.data[6]);
}

/** 1:1 `AnimConfuseRayBallBounce_Step1` (:235) : translation + oscillation
 *  Sin(d5,10)/Cos(d5,15), SE périodique au wrap de data[5]. */
function AnimConfuseRayBallBounce_Step1(sprite: _VSprite): void {
  UpdateConfuseRayBallBlend(sprite);
  if (AnimTranslateLinear(sprite as never)) {
    sprite.callback = AnimConfuseRayBallBounce_Step2;
    return;
  }
  sprite.x2 += Sin(sprite.data[5] & 0xFF, 10);
  sprite.y2 += Cos(sprite.data[5] & 0xFF, 15);
  const r2 = _s16(sprite.data[5]);
  sprite.data[5] = (sprite.data[5] + 5) & 0xFF;
  const r0 = _s16(sprite.data[5]);
  if (r2 !== 0 && r2 <= 196) return;
  if (r0 <= 0) return;
  // 1:1 PlaySE12WithPanning(SE_M_CONFUSE_RAY, gAnimCustomPanning) — panning non porté (infra __PlaySE).
  _PlaySE(SE_M_CONFUSE_RAY);
}

/** 1:1 `AnimConfuseRayBallBounce_Step2` (:258) : continue l'oscillation sur
 *  place (data[0]=1) jusqu'à la fin du cycle de blend (data[6]==0) → destroy. */
function AnimConfuseRayBallBounce_Step2(sprite: _VSprite): void {
  sprite.data[0] = 1;
  AnimTranslateLinear(sprite as never);
  sprite.x2 += Sin(sprite.data[5] & 0xFF, 10);
  sprite.y2 += Cos(sprite.data[5] & 0xFF, 15);
  const r2 = _s16(sprite.data[5]);
  sprite.data[5] = (sprite.data[5] + 5) & 0xFF;
  const r0 = _s16(sprite.data[5]);
  if (r2 === 0 || r2 > 196) {
    if (r0 > 0) _PlaySE(SE_M_CONFUSE_RAY); // 1:1 PlaySE(SE_M_CONFUSE_RAY)
  }
  if (sprite.data[6] === 0) {
    sprite.invisible = true;
    sprite.callback = _DestroyAnimSpriteAndDisableBlend;
  } else {
    UpdateConfuseRayBallBlend(sprite);
  }
}

/** 1:1 `UpdateConfuseRayBallBlend` (:288) : pulse BLDALPHA eva 16↔0 (pause de
 *  13 frames encodée data[6]=0x100..0x10C, direction = bit 0x100 de data[7]). */
function UpdateConfuseRayBallBlend(sprite: _VSprite): void {
  if (sprite.data[6] > 0xFF) {
    if (++sprite.data[6] === 0x10d) sprite.data[6] = 0;
    return;
  }
  const old7 = sprite.data[7];                       // (sprite->data[7]++ & 0xFF) == 0
  sprite.data[7] = _s16(old7 + 1);
  if ((old7 & 0xFF) === 0) {
    sprite.data[7] = _s16(sprite.data[7] & 0xff00);
    if ((sprite.data[7] & 0x100) !== 0) sprite.data[6]++;
    else sprite.data[6]--;
    _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[6], 16 - sprite.data[6]));
    if (sprite.data[6] === 0 || sprite.data[6] === 16) sprite.data[7] ^= 0x100;
    if (sprite.data[6] === 0) sprite.data[6] = 0x100;
  }
}

/** 1:1 `AnimConfuseRayBallSpiral` (:313) : pose sur la cible (args [x, y]) puis
 *  step immédiat (= sprite->callback(sprite) du C). */
function AnimConfuseRayBallSpiral(sprite: _VSprite): void {
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.callback = AnimConfuseRayBallSpiral_Step;
  AnimConfuseRayBallSpiral_Step(sprite);
}

/** 1:1 `AnimConfuseRayBallSpiral_Step` (:320) : spirale Sin(32)/Cos(8) qui
 *  descend (data[2]+=80 → y2 += d2>>8), oam.priority 2 derrière le mon sur la
 *  moitié basse du cycle (u16 d0-65 <= 130), destroy à 61 frames. */
function AnimConfuseRayBallSpiral_Step(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[0] & 0xFF, 32);
  sprite.y2 = Cos(sprite.data[0] & 0xFF, 8);
  const temp1 = (sprite.data[0] - 65) & 0xFFFF;      // u16 temp1 = data[0] - 65
  const oam = _oam(sprite);
  if (temp1 <= 130) { if (oam) oam.priority = 2; }
  else { if (oam) oam.priority = 1; }
  sprite.data[0] = (sprite.data[0] + 19) & 0xFF;
  sprite.data[2] = _s16(sprite.data[2] + 80);
  sprite.y2 += sprite.data[2] >> 8;
  sprite.data[7] += 1;
  if (sprite.data[7] === 61) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── SHADOW BALL ──────────────────────────────────────────────────────────────

/** 1:1 `AnimShadowBall` (battle_anim_ghost.c:400) : args [durée1 (attaquant→
 *  mi-chemin, demi-vitesse), durée2 (spin sur place), durée3 (→ cible)].
 *  Fixed-point <<4 dans data[4]/data[5], deltas data[6]/data[7]. */
function AnimShadowBall(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [16, 16, 8];
  const atk = _vItf().getAttacker?.() ?? 0;
  const oldPosX = _s16(sprite.x);
  const oldPosY = _s16(sprite.y);
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* BATTLER_COORD_X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* BATTLER_COORD_Y_PIC_OFFSET */);
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = args[0] | 0;
  sprite.data[2] = args[1] | 0;
  sprite.data[3] = args[2] | 0;
  sprite.data[4] = sprite.x << 4;
  sprite.data[5] = sprite.y << 4;
  sprite.data[6] = Math.trunc(((oldPosX - sprite.x) << 4) / ((args[0] | 0) << 1));
  sprite.data[7] = Math.trunc(((oldPosY - sprite.y) << 4) / ((args[0] | 0) << 1));
  sprite.callback = AnimShadowBall_Step;
}

/** 1:1 `AnimShadowBall_Step` (:418) : 0=dérive demi-vitesse, 1=spin puis calc
 *  deltas vers cible, 2=translation, 3=DestroySpriteAndMatrix. */
function AnimShadowBall_Step(sprite: _VSprite): void {
  const tgt = _vItf().getTarget?.() ?? 1;
  switch (sprite.data[0]) {
    case 0:
      sprite.data[4] += sprite.data[6];
      sprite.data[5] += sprite.data[7];
      sprite.x = sprite.data[4] >> 4;
      sprite.y = sprite.data[5] >> 4;
      sprite.data[1] -= 1;
      if (sprite.data[1] > 0) break;
      sprite.data[0] += 1;
      break;
    case 1:
      sprite.data[2] -= 1;
      if (sprite.data[2] > 0) break;
      sprite.data[1] = GetBattlerSpriteCoord(tgt, 2 /* X_2 */);
      sprite.data[2] = GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */);
      sprite.data[4] = sprite.x << 4;
      sprite.data[5] = sprite.y << 4;
      sprite.data[6] = Math.trunc(((sprite.data[1] - sprite.x) << 4) / sprite.data[3]);
      sprite.data[7] = Math.trunc(((sprite.data[2] - sprite.y) << 4) / sprite.data[3]);
      sprite.data[0] += 1;
      break;
    case 2:
      sprite.data[4] += sprite.data[6];
      sprite.data[5] += sprite.data[7];
      sprite.x = sprite.data[4] >> 4;
      sprite.y = sprite.data[5] >> 4;
      sprite.data[3] -= 1;
      if (sprite.data[3] > 0) break;
      sprite.x = GetBattlerSpriteCoord(tgt, 2);
      sprite.y = GetBattlerSpriteCoord(tgt, 3);
      sprite.data[0] += 1;
      break;
    case 3:
      DestroySpriteAndMatrix(sprite);
      break;
  }
}

// ─── LICK ─────────────────────────────────────────────────────────────────────

/** 1:1 `AnimLick` (battle_anim_ghost.c:462) : langue posée sur la cible
 *  (args [x, y]), table sAnims_Lick (5 frames), puis flicker en _Step. */
function AnimLick(sprite: _VSprite): void {
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.callback = AnimLick_Step;
}

/** 1:1 `AnimLick_Step` (:468) : après animEnded, 2 phases de clignotement
 *  (période 3 puis 5 frames, 5 flashes chacune) puis destroy. */
function AnimLick_Step(sprite: _VSprite): void {
  let r5 = false;
  let r6 = false;
  if (sprite.animEnded) {
    if (!sprite.invisible) sprite.invisible = true;
    switch (sprite.data[0]) {
      default: r6 = true; break;
      case 0: if (sprite.data[1] === 2) r5 = true; break;
      case 1: if (sprite.data[1] === 4) r5 = true; break;
    }
    if (r5) {
      sprite.invisible = !sprite.invisible;          // sprite->invisible ^= 1
      sprite.data[2]++;
      sprite.data[1] = 0;
      if (sprite.data[2] === 5) {
        sprite.data[2] = 0;
        sprite.data[0]++;
      }
    } else if (r6) {
      _vItf().DestroyAnimSprite?.(sprite);
    } else {
      sprite.data[1]++;
    }
  }
}

// ─── DEVIL (Nightmare) ────────────────────────────────────────────────────────

/** 1:1 `AnimDevil` (battle_anim_effects_2.c:3578 — ⚠ PAS battle_anim_ghost.c ;
 *  porté ici sur ordre de lot, dette placement → battle_anim_effects_2.ts) :
 *  diablotin en orbite Cos/Sin rétrécissante au-dessus de la cible (args [x, y]),
 *  flicker d'entrée (<10) et de sortie (>80), destroy à 91 frames. */
function AnimDevil(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, -24];
  const tgt = _vItf().getTarget?.() ?? 1;
  if (sprite.data[3] === 0) {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    _StartSpriteAnim(sprite, 0);
    sprite.subpriority = _GetBattlerSpriteSubpriority(tgt) - 1;
    sprite.data[2] = 1;
  }
  sprite.data[0] += sprite.data[2];
  sprite.data[1] = (sprite.data[0] * 4) % 256;       // % C (tronqué) = % JS
  if (sprite.data[1] < 0) sprite.data[1] = 0;
  sprite.x2 = Cos(sprite.data[1] & 0xFF, 30 - Math.trunc(sprite.data[0] / 4));
  sprite.y2 = Sin(sprite.data[1] & 0xFF, 10 - Math.trunc(sprite.data[0] / 8));
  if (sprite.data[1] > 128 && sprite.data[2] > 0) sprite.data[2] = -1;
  if (sprite.data[1] === 0 && sprite.data[2] < 0) sprite.data[2] = 1;
  sprite.data[3]++;
  if (sprite.data[3] < 10 || sprite.data[3] > 80)
    sprite.invisible = (sprite.data[0] % 2) !== 0;   // bitfield :1 ← data[0] % 2
  else
    sprite.invisible = false;
  if (sprite.data[3] > 90) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── CURSE ────────────────────────────────────────────────────────────────────

/** 1:1 `AnimCurseNail` (battle_anim_ghost.c:1036) : clou posé sur l'attaquant
 *  (+24 côté joueur avec hflip / -24 côté ennemi), 60 frames d'attente puis
 *  enfoncement par crans (_Step1). Pas d'args dans le script (createsprite nu). */
function AnimCurseNail(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  let xDelta: number;
  let xDelta2: number;
  InitSpritePosToAnimAttacker(sprite as never, true);
  if ((atk & 1) === 0 /* B_SIDE_PLAYER */) {
    xDelta = 24;
    xDelta2 = -2;
    // 1:1 sprite->oam.matrixNum = ST_OAM_HFLIP (sprite non-affine : bits flip OAM).
    sprite.hFlip = true;
  } else {
    xDelta = -24;
    xDelta2 = 2;
  }
  sprite.x += xDelta;
  sprite.data[1] = xDelta2;
  sprite.data[0] = 60;
  sprite.invisible = false;
  sprite.callback = AnimCurseNail_Step1;
}

/** 1:1 `AnimCurseNail_Step1` (:1060) : pousse x2 de ±2/frame ; au-delà de ±7
 *  (u16 x2+7 > 14) fige la position, avance la gfx d'un cran (oam.tileNum += 8),
 *  3 crans → pause 30 frames (WaitAnimForDuration) puis _Step2. */
function AnimCurseNail_Step1(sprite: _VSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
  } else {
    sprite.x2 += sprite.data[1];
    const var0 = (sprite.x2 + 7) & 0xFFFF;           // u16 var0 = x2 + 7
    if (var0 > 14) {
      sprite.x += sprite.x2;
      sprite.x2 = 0;
      const oam = _oam(sprite);
      if (oam && typeof oam.tileId === 'number') oam.tileId += 8; // 1:1 oam.tileNum += 8
      if (++sprite.data[2] === 3) {
        sprite.data[0] = 30;
        sprite.callback = _WaitAnimForDuration;
        StoreSpriteCallbackInData6(sprite as never, AnimCurseNail_Step2 as never);
      } else {
        sprite.data[0] = 40;
      }
    }
  }
}

/** 1:1 `AnimCurseNail_Step2` (:1091) : installe le blend (16,0) puis fade
 *  eva 16→0 / evb 0→16 par pas de 1 toutes les 3 frames → invisible → _End. */
function AnimCurseNail_Step2(sprite: _VSprite): void {
  if (sprite.data[0] === 0) {
    const rt = _rt();
    rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
    rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(16, 0));
    sprite.data[0]++;
    sprite.data[1] = 0;
    sprite.data[2] = 0;
  } else if (sprite.data[1] < 2) {
    sprite.data[1]++;
  } else {
    sprite.data[1] = 0;
    sprite.data[2]++;
    _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, ((16 - sprite.data[2]) | (sprite.data[2] << 8)) & 0xFFFF);
    if (sprite.data[2] === 16) {
      sprite.invisible = true;
      sprite.callback = AnimCurseNail_End;
    }
  }
}

/** 1:1 `AnimCurseNail_End` (:1118) : reset BLDCNT/BLDALPHA + gBattle_WIN0H/V=0
 *  (accesseurs globaux posés par game/battle_main.ts) puis destroy. */
function AnimCurseNail_End(sprite: _VSprite): void {
  const rt = _rt();
  rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
  rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
  (globalThis as Record<string, unknown>).gBattle_WIN0H = 0;
  (globalThis as Record<string, unknown>).gBattle_WIN0V = 0;
  _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimGhostStatusSprite` (battle_anim_ghost.c:1127) : l'esprit ondule en
 *  X (Sin d0, miroir côté ennemi) et monte (d1 fixed-point) ; frame 1 = pose le
 *  blend (eva 11, evb 5), après 30 frames fondu eva→0/evb→16 → invisible → _Step.
 *  Partagé par gCurseGhostSpriteTemplate ET gNightmareDevilSpriteTemplate. */
function AnimGhostStatusSprite(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.x2 = Sin(sprite.data[0] & 0xFF, 12);
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) sprite.x2 = -sprite.x2;
  sprite.data[0] = (sprite.data[0] + 6) & 0xFF;
  sprite.data[1] = _s16(sprite.data[1] + 0x100);
  sprite.y2 = -(sprite.data[1] >> 8);
  sprite.data[7]++;
  if (sprite.data[7] === 1) {
    sprite.data[6] = 0x050B;                         // BLDALPHA_BLEND(11, 5)
    sprite.invisible = false;                        // setup-visibilité (le C naît visible)
    const rt = _rt();
    rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
    rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, sprite.data[6]);
  } else if (sprite.data[7] > 30) {
    sprite.data[2]++;
    let coeffB = sprite.data[6] >> 8;
    let coeffA = sprite.data[6] & 0xFF;
    if (++coeffB > 16) coeffB = 16;
    --coeffA;
    if (coeffA < 0) coeffA = 0;                      // 1:1 (s16)coeffA < 0
    _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(coeffA, coeffB));
    sprite.data[6] = _BLDALPHA_BLEND(coeffA, coeffB);
    if (coeffB === 16 && coeffA === 0) {
      sprite.invisible = true;
      sprite.callback = AnimGhostStatusSprite_Step;
    }
  }
}

/** 1:1 `AnimGhostStatusSprite_Step` (:1169) : reset blend + destroy. */
function AnimGhostStatusSprite_Step(sprite: _VSprite): void {
  const rt = _rt();
  rt?.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
  rt?.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
  _vItf().DestroyAnimSprite?.(sprite);
}

registerAnimCallbacks({
  AnimConfuseRayBallBounce: AnimConfuseRayBallBounce as never,
  AnimConfuseRayBallSpiral: AnimConfuseRayBallSpiral as never,
  AnimShadowBall: AnimShadowBall as never,
  AnimLick: AnimLick as never,
  AnimDevil: AnimDevil as never,
  AnimCurseNail: AnimCurseNail as never,
  AnimGhostStatusSprite: AnimGhostStatusSprite as never,
});

// ─── VAGUE F36 : NightShadeClone + NightmareClone (battle_anim_ghost.c.c:339-585) ─────────
import {
  PrepareBattlerSpriteForRotScale as _f36Prep,
  SetSpriteRotScale as _f36SetRS,
  ResetSpriteRotScale as _f36ResetRS,
  CloneBattlerSpriteWithBlend as _f36Clone,
  DestroySpriteWithActiveSheet as _f36DestroySheet,
  TranslateSpriteLinearFixedPoint as _f36TransFP,
  StoreSpriteCallbackInData6 as _f36Store6,
} from './battle_anim_mons';

type _F36Task = { taskId: number; data: number[]; func?: unknown };
function _f36Itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
type _F36Sprite = { data: number[]; x2: number; invisible?: boolean; callback: unknown; oamIndex: number };
function _f36Rt(): {
  gSprites?: Array<_F36Sprite | undefined>;
  SetGpuReg?: (off: number, v: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _f36AtkSpriteId(): number {
  const b = _f36Itf().getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
const _F36_BLDCNT = 0x50, _F36_BLDALPHA = 0x52;
function _f36Blend(eva: number, evb: number): number { return (eva & 0xFFFF) | ((evb & 0xFFFF) << 8); }

/** 1:1 `AnimTask_NightShadeClone` (battle_anim_ghost.c.c:339) : l'attaquant rétréci 128 en
 *  blend qui regrandit jusqu'à 256. arg0 = délai avant le regrossissement. */
function AnimTask_NightShadeClone(task: _F36Task): void {
  const rt = _f36Rt();
  rt.SetGpuReg?.(_F36_BLDCNT, 0x3F40);          // BLDCNT_EFFECT_BLEND | TGT2_ALL
  rt.SetGpuReg?.(_F36_BLDALPHA, _f36Blend(0, 0x10));
  const spriteId = _f36AtkSpriteId();
  if (spriteId === 0xFF) { _f36Itf().DestroyAnimVisualTask?.(task.taskId); return; }
  _f36Prep(spriteId, 1 /* ST_OAM_OBJ_BLEND */);
  _f36SetRS(spriteId, 128, 128, 0);
  const sp = rt.gSprites?.[spriteId];
  if (sp) sp.invisible = false;
  task.data[0] = 128;
  task.data[1] = (_f36Itf().getArgs?.() ?? [0])[0] | 0;  // *gBattleAnimArgs
  task.data[2] = 0;
  task.data[3] = 16;
  task.func = AnimTask_NightShadeClone_Step1;
}
function AnimTask_NightShadeClone_Step1(task: _F36Task): void {
  task.data[10] += 1;
  if (task.data[10] === 3) {
    task.data[10] = 0;
    task.data[2] += 1;
    task.data[3] -= 1;
    _f36Rt().SetGpuReg?.(_F36_BLDALPHA, _f36Blend(task.data[2], task.data[3]));
    if (task.data[2] !== 9) return;
    task.func = AnimTask_NightShadeClone_Step2;
  }
}
function AnimTask_NightShadeClone_Step2(task: _F36Task): void {
  if (task.data[1] > 0) {
    task.data[1] -= 1;
    return;
  }
  const spriteId = _f36AtkSpriteId();
  task.data[0] += 8;
  if (task.data[0] <= 0xFF) {
    _f36SetRS(spriteId, task.data[0], task.data[0], 0);
  } else {
    _f36ResetRS(spriteId);
    _f36Itf().DestroyAnimVisualTask?.(task.taskId);
    const rt = _f36Rt();
    rt.SetGpuReg?.(_F36_BLDCNT, 0);
    rt.SetGpuReg?.(_F36_BLDALPHA, 0);
  }
}

/** 1:1 `AnimTask_NightmareClone` (battle_anim_ghost.c.c:516) : clone blend du TARGET qui
 *  s'éloigne en s'estompant (15→0 / 2→16). */
function AnimTask_NightmareClone(task: _F36Task): void {
  const itf = _f36Itf();
  task.data[0] = _f36Clone(1 /* ANIM_TARGET */);
  if (task.data[0] < 0) {
    itf.DestroyAnimVisualTask?.(task.taskId);
    return;
  }
  task.data[1] = 0;
  task.data[2] = 15;
  task.data[3] = 2;
  task.data[4] = 0;
  const rt = _f36Rt();
  rt.SetGpuReg?.(_F36_BLDCNT, 0x3F40);
  rt.SetGpuReg?.(_F36_BLDALPHA, _f36Blend(task.data[2], task.data[3]));
  const clone = rt.gSprites?.[task.data[0]];
  if (clone) {
    clone.data[0] = 80;
    const targetSide = (itf.getTarget?.() ?? 1) & 1;
    if (targetSide === 0 /* B_SIDE_PLAYER */) {
      clone.data[1] = -144;
      clone.data[2] = 112;
    } else {
      clone.data[1] = 144;
      clone.data[2] = -112;
    }
    clone.data[3] = 0;
    clone.data[4] = 0;
    _f36Store6(clone as never, (() => { /* SpriteCallbackDummy */ }) as never);
    clone.callback = _f36TransFP as never;
  }
  task.func = AnimTask_NightmareClone_Step;
}
function AnimTask_NightmareClone_Step(task: _F36Task): void {
  const rt = _f36Rt();
  switch (task.data[4]) {
    case 0: {
      task.data[1] += 1;
      task.data[5] = task.data[1] & 3;
      if (task.data[5] === 1 && task.data[2] > 0) task.data[2] -= 1;
      if (task.data[5] === 3 && task.data[3] <= 15) task.data[3] += 1;
      rt.SetGpuReg?.(_F36_BLDALPHA, _f36Blend(task.data[2], task.data[3]));
      if (task.data[3] !== 16 || task.data[2] !== 0) break;
      if (task.data[1] <= 80) break;
      _f36DestroySheet(task.data[0]);
      task.data[4] = 1;
      break;
    }
    case 1:
      if (++task.data[6] <= 1) break;
      rt.SetGpuReg?.(_F36_BLDCNT, 0);
      rt.SetGpuReg?.(_F36_BLDALPHA, 0);
      task.data[4] += 1;
      break;
    case 2:
      _f36Itf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}

import { registerAnimTasks as _f36RegT } from './engine/battle/battle-anim-registry';
_f36RegT({
  AnimTask_NightShadeClone: AnimTask_NightShadeClone as never,
  AnimTask_NightmareClone: AnimTask_NightmareClone as never,
});

// --- VAGUE F55 : AnimTask_GrudgeFlames (battle_anim_ghost.c.c:1176-1307) ------------------
// 6 flammes en orbite Sin autour de l'attaquant (priorite alternee devant/
// derriere par phase), fondu BLDALPHA 14/4 puis extinction signalee data[8].
import { GetBattlerElevation as _gfElev, GetBattlerSpriteSubpriority as _gfSubprio } from './battle_anim_mons';
import { gBattlerPartyIndexes as _gfPartyIdx } from './engine/battle/state';
import { gEnemyParty as _gfEnemyParty, gPlayerParty as _gfPlayerParty, GetMonData as _gfGetMon, MON_DATA_SPECIES as _gfSpeciesK } from './engine/battle/party-storage';
import { reverseDecompConstant as _gfRevConst } from '../harness/runtime/decomp-constants';
import { getMonFrontPicCoords as _gfFrontCoords, getMonBackPicCoords as _gfBackCoords } from './data/mon_pic_coords';
import { Sin as _gfSin } from './trig';

type _GfTask = { taskId: number; data: number[]; func?: unknown };
function _gfItf2(): { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
type _GfSprite = { x2: number; y2: number; data: number[]; callback: unknown; oamIndex: number };
function _gfRt(): {
  gSprites?: Array<_GfSprite | undefined>;
  gTasks?: Map<number, { data: number[] }>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  DestroySprite?: (i: number) => void;
  SetGpuReg?: (o: number, v: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number; priority: number }>; bg: (i: number) => { config: { priority: number } } };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _gfYCoordWithElevation(battler: number): number {
  let y = GetBattlerSpriteCoord(battler, 1 /* BATTLER_COORD_Y */);
  if ((battler & 1) !== 0) {
    const species = _gfGetMon(_gfEnemyParty[_gfPartyIdx[battler]] as never, _gfSpeciesK) as number;
    y -= _gfElev(battler, species);
  }
  return y;
}
function _gfPicWidth(battler: number): number {
  const party = (battler & 1) !== 0 ? _gfEnemyParty : _gfPlayerParty;
  const species = _gfGetMon(party[_gfPartyIdx[battler]] as never, _gfSpeciesK) as number;
  const name = _gfRevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = (battler & 1) === 0 ? _gfBackCoords(name) : _gfFrontCoords(name);
  return coords.w;
}
function _gfBgPriority(battler: number): number {
  const pos = battler & 3;
  const bgId = (pos === 0 || pos === 3) ? 2 : 1;
  return _gfRt().gba?.bg(bgId)?.config?.priority ?? 2;
}

/** 1:1 AnimTask_GrudgeFlames (battle_anim_ghost.c.c:1176). */
function AnimTask_GrudgeFlames(task: _GfTask): void {
  const atk = _gfItf2().getAttacker?.() ?? 0;
  task.data[0] = 0;
  task.data[1] = 16;
  task.data[9] = GetBattlerSpriteCoord(atk, 2 /* BATTLER_COORD_X_2 */);
  task.data[10] = _gfYCoordWithElevation(atk);
  task.data[11] = Math.trunc(_gfPicWidth(atk) / 2) + 8;
  task.data[7] = 0;
  task.data[5] = _gfBgPriority(atk);
  task.data[6] = _gfSubprio(atk) - 2;
  task.data[3] = 0;
  task.data[4] = 16;
  const rt = _gfRt();
  rt.SetGpuReg?.(0x50, 0x3F40);
  rt.SetGpuReg?.(0x52, 0 | (0x10 << 8));
  task.data[8] = 0;
  task.func = AnimTask_GrudgeFlames_Step;
}
function AnimTask_GrudgeFlames_Step(task: _GfTask): void {
  const rt = _gfRt();
  switch (task.data[0]) {
    case 0: {
      const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
      const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
      const tpl = bridge?.lookupGeneratedTemplateTags?.('gGrudgeFlameSpriteTemplate');
      const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
      const atkSide = ((_gfItf2().getAttacker?.() ?? 0) & 1) === 0 ? 1 : 0;
      for (let i = 0; i < 6; i++) {
        const sid = CreateSprite({ oam: { shape: 0, size: 1, priority: 2 }, images: [] } as never, task.data[9], task.data[10], task.data[6]) ?? -1;
        if (sid >= 0) {
          const sp = rt.gSprites?.[sid];
          const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
          if (oam && tileStart !== 0xFFFF) {
            oam.tileId = tileStart;
            const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
            if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
          }
          if (sp) {
            sp.data[0] = task.taskId;
            sp.data[1] = atkSide;
            sp.data[2] = (i * 42) & 0xFF;
            sp.data[3] = task.data[11];
            sp.data[5] = i * 6;
            sp.callback = _AnimGrudgeFlame as never;
            task.data[7]++;
          }
        }
      }
      task.data[0]++;
      break;
    }
    case 1:
      if (++task.data[1] & 1) {
        if (task.data[3] < 14) task.data[3]++;
      } else {
        if (task.data[4] > 4) task.data[4]--;
      }
      if (task.data[3] === 14 && task.data[4] === 4) {
        task.data[1] = 0;
        task.data[0]++;
      }
      rt.SetGpuReg?.(0x52, (task.data[3] & 0xFF) | ((task.data[4] & 0xFF) << 8));
      break;
    case 2:
      if (++task.data[1] > 30) {
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 3:
      if (++task.data[1] & 1) {
        if (task.data[3] > 0) task.data[3]--;
      } else {
        if (task.data[4] < 16) task.data[4]++;
      }
      if (task.data[3] === 0 && task.data[4] === 16) {
        task.data[8] = 1;
        task.data[0]++;
      }
      rt.SetGpuReg?.(0x52, (task.data[3] & 0xFF) | ((task.data[4] & 0xFF) << 8));
      break;
    case 4:
      if (task.data[7] === 0) task.data[0]++;
      break;
    case 5:
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      _gfItf2().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 AnimGrudgeFlame : orbite Sin + priorite alternee + bob vertical. */
function _AnimGrudgeFlame(sprite: _GfSprite): void {
  const rt = _gfRt();
  const t = rt.gTasks?.get(sprite.data[0]);
  if (!t) return;
  if (sprite.data[1] === 0) sprite.data[2] += 2;
  else sprite.data[2] -= 2;
  sprite.data[2] &= 0xFF;
  sprite.x2 = _gfSin(sprite.data[2], sprite.data[3]);
  const index = (sprite.data[2] - 65) & 0xFFFF;
  const oam = rt.gba?.oam[sprite.oamIndex];
  if (oam) oam.priority = index < 127 ? t.data[5] + 1 : t.data[5];
  sprite.data[5]++;
  sprite.data[6] = (sprite.data[5] * 8) & 0xFF;
  sprite.y2 = _gfSin(sprite.data[6], 7);
  if (t.data[8]) {
    t.data[7]--;
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
_f36RegT({ AnimTask_GrudgeFlames: AnimTask_GrudgeFlames as never });

// --- VAGUE F66 : DestinyBondWhiteShadow (battle_anim_ghost.c.c) ---------------------------
// L'ombre blanche glisse de l'attaquant vers chaque ennemi visible (16.4),
// fondu in 24 demi-pas (8/9 alternes), tenue arg0 frames, fondu out, destroy.
function _dbPicBottom(battler: number): number {
  const party = (battler & 1) !== 0 ? _gfEnemyParty : _gfPlayerParty;
  const species = _gfGetMon(party[_gfPartyIdx[battler]] as never, _gfSpeciesK) as number;
  const name = _gfRevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = (battler & 1) === 0 ? _gfBackCoords(name) : _gfFrontCoords(name);
  return GetBattlerSpriteCoord(battler, 3 /* Y_PIC_OFFSET */) + ((coords.h / 2) | 0);
}

type _DbTask = { taskId: number; data: number[]; func?: unknown };
function _dbItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 AnimTask_DestinyBondWhiteShadow (single : 1 ennemi = la cible). */
function AnimTask_DestinyBondWhiteShadow(task: _DbTask): void {
  const itf = _dbItf();
  const args = itf.getArgs?.() ?? [40, 48];
  const rt = _gfRt() as unknown as {
    gSprites?: Array<{ x: number; y: number; data: number[]; callback: unknown; oamIndex: number } | undefined>;
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    DestroySprite?: (i: number) => void;
    SetGpuReg?: (o: number, v: number) => void;
    gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
  };
  rt.SetGpuReg?.(0x50, 0x3F40);
  rt.SetGpuReg?.(0x52, 0 | (0x10 << 8));
  task.data[5] = 0;
  task.data[6] = 0;
  task.data[7] = 0;
  task.data[8] = 0;
  task.data[9] = 16;
  task.data[10] = args[0] | 0;
  task.data[12] = 0;
  const atk = itf.getAttacker?.() ?? 0;
  const baseX = GetBattlerSpriteCoord(atk, 2);
  const baseY = _dbPicBottom(atk);
  const battler = itf.getTarget?.() ?? 1; // single : seul ennemi visible
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.('gDestinyBondWhiteShadowSpriteTemplate');
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = CreateSprite({ oam: { shape: 1, size: 2, priority: 2, objMode: 1 }, images: [] } as never, baseX, baseY, 55) ?? -1;
  if (sid >= 0) {
    const sp = rt.gSprites?.[sid];
    const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart;
      const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
      if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
    }
    if (sp) {
      const x = GetBattlerSpriteCoord(battler, 2);
      const y = _dbPicBottom(battler);
      sp.data[0] = baseX << 4;
      sp.data[1] = baseY << 4;
      sp.data[2] = Math.trunc(((x - baseX) << 4) / (args[1] | 1));
      sp.data[3] = Math.trunc(((y - baseY) << 4) / (args[1] | 1));
      sp.data[4] = args[1] | 0;
      sp.data[5] = x;
      sp.data[6] = y;
      sp.callback = AnimDestinyBondWhiteShadow_Step as never;
      task.data[task.data[12] + 13] = sid;
      task.data[12]++;
    }
  }
  task.func = AnimTask_DestinyBondWhiteShadow_Step;
}
function AnimTask_DestinyBondWhiteShadow_Step(task: _DbTask): void {
  const rt = _gfRt() as unknown as { SetGpuReg?: (o: number, v: number) => void; DestroySprite?: (i: number) => void };
  switch (task.data[0]) {
    case 0:
      if (task.data[6] === 0) {
        if (++task.data[5] > 1) {
          task.data[5] = 0;
          task.data[7]++;
          if (task.data[7] & 1) {
            if (task.data[8] < 16) task.data[8]++;
          } else {
            if (task.data[9]) task.data[9]--;
          }
          rt.SetGpuReg?.(0x52, (task.data[8] & 0xFF) | ((task.data[9] & 0xFF) << 8));
          if (task.data[7] >= 24) {
            task.data[7] = 0;
            task.data[6] = 1;
          }
        }
      }
      if (task.data[10]) task.data[10]--;
      else if (task.data[6]) task.data[0]++;
      break;
    case 1:
      if (++task.data[5] > 1) {
        task.data[5] = 0;
        task.data[7]++;
        if (task.data[7] & 1) {
          if (task.data[8]) task.data[8]--;
        } else {
          if (task.data[9] < 16) task.data[9]++;
        }
        rt.SetGpuReg?.(0x52, (task.data[8] & 0xFF) | ((task.data[9] & 0xFF) << 8));
        if (task.data[8] === 0 && task.data[9] === 16) {
          for (let i = 0; i < task.data[12]; i++) DestroySprite(getRuntime(), task.data[i + 13]);
          task.data[0]++;
        }
      }
      break;
    case 2:
      if (++task.data[5] > 0) task.data[0]++;
      break;
    case 3:
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      _dbItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 AnimDestinyBondWhiteShadow_Step (le sprite glisse 16.4). */
function AnimDestinyBondWhiteShadow_Step(sprite: { x: number; y: number; data: number[] }): void {
  if (sprite.data[4]) {
    sprite.data[0] += sprite.data[2];
    sprite.data[1] += sprite.data[3];
    sprite.x = sprite.data[0] >> 4;
    sprite.y = sprite.data[1] >> 4;
    if (--sprite.data[4] === 0) sprite.data[0] = 0;
  }
}
_f36RegT({ AnimTask_DestinyBondWhiteShadow: AnimTask_DestinyBondWhiteShadow as never });

// --- VAGUE F67 : SpiteTargetShadow (battle_anim_ghost.c.c:589-744) ------------------------
// L'ombre violette de Spite : clone normal palette violette (blend 10 vers
// RGB(13,0,15)) + ONDE ScanlineEffect_InitWave (freq 2, ampl 6) sur le BG du
// mon + fondu Sin/18 alterne 128 pas, demontage complet.
import { ScanlineEffect_InitWave as _spwInitWave, gScanlineEffect as _spwScan, SCANLINE_EFFECT_REG_BG1HOFS as _spwRegBg1H, SCANLINE_EFFECT_REG_BG2HOFS as _spwRegBg2H } from './scanline_effect';
import { GetBattlerSpriteBGPriorityRank as _spwBgRank } from './battle_anim_mons';
import { gSineTable as _spwSine } from './trig';
import { BlendPalette as _spwBlend } from '../harness/runtime/decomp-globals';

type _SpwTask = { taskId: number; data: number[]; func?: unknown };
function _spwItf(): { getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _spwRt(): {
  gSprites?: Array<{ y: number; y2: number; invisible?: boolean; oamIndex: number; data: number[]; callback: unknown } | undefined>;
  SetGpuReg?: (o: number, v: number) => void;
  DestroyTask?: (id: number) => void;
  gba?: { oam: Array<{ paletteBank: number; objMode: number; priority: number }>; bg: (i: number) => { config: { visible: boolean } } };
  gPlttBufferUnfaded?: { get?: (i: number) => number };
  gPlttBufferFaded?: { set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _spwTgtSpriteId(): number {
  const b = _spwItf().getTarget?.() ?? 1;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
const _SPW_VIOLET = 13 | (0 << 5) | (15 << 10); // RGB(13,0,15)

/** 1:1 AnimTask_SpiteTargetShadow (+ appel immediat). */
function AnimTask_SpiteTargetShadow(task: _SpwTask): void {
  task.data[15] = 0;
  task.func = AnimTask_SpiteTargetShadow_Step1;
  AnimTask_SpiteTargetShadow_Step1(task);
}
function AnimTask_SpiteTargetShadow_Step1(task: _SpwTask): void {
  const itf = _spwItf();
  const tgt = itf.getTarget?.() ?? 1;
  const position = _spwBgRank(tgt);
  const rt = _spwRt();
  switch (task.data[15]) {
    case 0: {
      const spApi = (globalThis as Record<string, unknown>).__sprite as { AllocSpritePalette?: (t: number) => number; FreeSpritePaletteByTag?: (t: number) => void } | undefined;
      task.data[14] = spApi?.AllocSpritePalette?.(10097) ?? 0xFF;
      if (task.data[14] === 0xFF || task.data[14] === 0xF) {
        itf.DestroyAnimVisualTask?.(task.taskId);
        break;
      }
      const mons = (globalThis as Record<string, unknown>).__battleAnimMons as { CloneBattlerSpriteWithBlend?: (a: number) => number } | undefined;
      task.data[0] = mons?.CloneBattlerSpriteWithBlend?.(1) ?? -1;
      if (task.data[0] < 0) {
        spApi?.FreeSpritePaletteByTag?.(10097);
        itf.DestroyAnimVisualTask?.(task.taskId);
        break;
      }
      const clone = rt.gSprites?.[task.data[0]];
      const cloneOam = clone ? rt.gba?.oam[clone.oamIndex] : undefined;
      if (cloneOam) {
        cloneOam.paletteBank = task.data[14];
        cloneOam.objMode = 0; // ST_OAM_OBJ_NORMAL
        cloneOam.priority = 3;
      }
      if (clone) {
        // ⚠ classe sync-écrase : syncSpritesToOam ré-écrit oam.objMode (et
        // oam.visible depuis sprite.invisible) CHAQUE frame → poser les champs
        // SPRITE. Le clone arrive en BLEND (objMode=1, CloneBattlerSpriteWith
        // Blend) ; le C l'écrase en NORMAL (.c:625).
        (clone as { objMode?: number }).objMode = 0;
        // 1:1 :627 — l'ombre hérite du flag LOGIQUE d'invisibilité de la cible
        // (battlerData[target].invisible, PAS sprite.invisible).
        const sd = (globalThis as Record<string, unknown>).__battleSpritesData as { isBattlerDataInvisible?: (b: number) => boolean } | undefined;
        clone.invisible = !!sd?.isBattlerDataInvisible?.(tgt);
      }
      task.data[1] = 0;
      task.data[2] = 0;
      task.data[3] = 16;
      task.data[13] = _spwTgtSpriteId();
      const tgtSp = rt.gSprites?.[task.data[13]];
      const tgtOam = tgtSp ? rt.gba?.oam[tgtSp.oamIndex] : undefined;
      task.data[4] = 256 + (tgtOam?.paletteBank ?? 0) * 16; // OBJ_PLTT_ID2
      const cfg = rt.gba?.bg(position === 1 ? 1 : 2)?.config;
      if (cfg) cfg.visible = false; // ClearGpuRegBits DISPCNT BGn_ON
      task.data[15]++;
      break;
    }
    case 1: {
      task.data[14] = 256 + task.data[14] * 16;
      const un = rt.gPlttBufferUnfaded;
      const fd = rt.gPlttBufferFaded;
      if (un?.get && fd?.set) {
        for (let k = 0; k < 16; k++) fd.set(task.data[14] + k, un.get(task.data[4] + k));
      }
      _spwBlend(task.data[4], 16, 10, _SPW_VIOLET);
      task.data[15]++;
      break;
    }
    case 2: {
      const tgtSp = rt.gSprites?.[task.data[13]];
      let startLine = (tgtSp ? tgtSp.y + tgtSp.y2 : 56) - 32;
      if (startLine < 0) startLine = 0;
      task.data[10] = _spwInitWave(startLine, startLine + 64, 2, 6, 0, position === 1 ? _spwRegBg1H : _spwRegBg2H, true);
      task.data[15]++;
      break;
    }
    case 3:
      rt.SetGpuReg?.(0x50, position === 1 ? 0x3F42 : 0x3F44);
      rt.SetGpuReg?.(0x52, 0 | (0x10 << 8));
      task.data[15]++;
      break;
    case 4: {
      const cfg = rt.gba?.bg(position === 1 ? 1 : 2)?.config;
      if (cfg) cfg.visible = true; // SetGpuRegBits
      task.func = AnimTask_SpiteTargetShadow_Step2;
      task.data[15]++;
      break;
    }
    default:
      task.data[15]++;
      break;
  }
}
function AnimTask_SpiteTargetShadow_Step2(task: _SpwTask): void {
  const rt = _spwRt();
  task.data[1]++;
  task.data[5] = task.data[1] & 1;
  if (task.data[5] === 0) task.data[2] = Math.trunc((_spwSine[task.data[1]] ?? 0) / 18);
  if (task.data[5] === 1) task.data[3] = 16 - Math.trunc((_spwSine[task.data[1]] ?? 0) / 18);
  rt.SetGpuReg?.(0x52, (task.data[2] & 0xFF) | ((task.data[3] & 0xFF) << 8));
  if (task.data[1] === 128) {
    task.data[15] = 0;
    task.func = AnimTask_SpiteTargetShadow_Step3;
    AnimTask_SpiteTargetShadow_Step3(task);
  }
}
function AnimTask_SpiteTargetShadow_Step3(task: _SpwTask): void {
  const itf = _spwItf();
  const rank = _spwBgRank(itf.getTarget?.() ?? 1);
  const rt = _spwRt();
  switch (task.data[15]) {
    case 0: {
      _spwScan.state = 3;
      task.data[14] = _spwTgtSpriteId();
      const cfg = rt.gba?.bg(rank === 1 ? 1 : 2)?.config;
      if (cfg) cfg.visible = false;
      break;
    }
    case 1:
      _spwBlend(task.data[4], 16, 0, _SPW_VIOLET);
      break;
    case 2: {
      const tgtSp = rt.gSprites?.[task.data[14]];
      if (tgtSp) tgtSp.invisible = true;
      const mons = (globalThis as Record<string, unknown>).__battleAnimMons as { DestroySpriteWithActiveSheet?: (id: number) => void } | undefined;
      mons?.DestroySpriteWithActiveSheet?.(task.data[0]);
      const spApi = (globalThis as Record<string, unknown>).__sprite as { FreeSpritePaletteByTag?: (t: number) => void } | undefined;
      spApi?.FreeSpritePaletteByTag?.(10097);
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      const cfg = rt.gba?.bg(rank === 1 ? 1 : 2)?.config;
      if (cfg) cfg.visible = true;
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
  task.data[15]++;
}
_f36RegT({ AnimTask_SpiteTargetShadow: AnimTask_SpiteTargetShadow as never });

// --- VAGUE F76 : AnimTask_CurseStretchingBlackBg(+Step1/Step2) --------------
// (battle_anim_ghost.c.c:945-1030) — le NOIR de Curse (utilisateur Ghost) : une fenêtre WIN0
// part d'un point côté attaquant (x=200 joueur / 40 ennemi, y=40) et s'étire
// en 16 pas jusqu'à 240x112 ; DANS la fenêtre le DARKEN (BLDCNT TGT1_BG3 +
// BLDY 16) noircit le décor ; à 16 pas, fade des palettes BG vers noir puis
// teardown complet quand gPaletteFade.active retombe.
import { BeginNormalPaletteFade as _csBeginFade } from '../harness/runtime/decomp-bridge';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';

const _CS_REG_WININ = 0x48;
const _CS_REG_WINOUT = 0x4A;
const _CS_REG_BLDCNT = 0x50;
const _CS_REG_BLDY = 0x54;

type _CsTask = { taskId: number; data: number[]; func?: unknown };
function _csRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  gPaletteFade?: { active?: boolean };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _csSetG(name: string, v: number): void {
  (globalThis as Record<string, unknown>)[name] = v;
}
function _csWinRange(a: number, b: number): number { return ((a & 0xFF) << 8) | (b & 0xFF); }

/** 1:1 AnimTask_CurseStretchingBlackBg (battle_anim_ghost.c.c:945). */
function AnimTask_CurseStretchingBlackBg(task: _CsTask): void {
  const rt = _csRt();
  _csSetG('gBattle_WIN0H', 0);
  _csSetG('gBattle_WIN0V', 0);
  rt.SetGpuReg?.(_CS_REG_WININ, 0x3F3F);
  // WINOUT : WIN01 BG_ALL|OBJ (SANS CLR) | WINOBJ all+CLR
  rt.SetGpuReg?.(_CS_REG_WINOUT, (0x3F << 8) | 0x1F);
  rt.SetGpuReg?.(_CS_REG_BLDCNT, 0xC8); // BLDCNT_TGT1_BG3 | BLDCNT_EFFECT_DARKEN
  rt.SetGpuReg?.(_CS_REG_BLDY, 16);
  const atk = _dbItf().getAttacker?.() ?? 0;
  const startX = (atk & 1) !== 0 ? 40 : 200; // != B_SIDE_PLAYER ? 40 : 200
  _csSetG('gBattle_WIN0H', _csWinRange(startX, startX));
  const startY = 40;
  _csSetG('gBattle_WIN0V', _csWinRange(startY, startY));
  task.data[1] = startX;        // leftDistance
  task.data[2] = 240 - startX;  // rightDistance
  task.data[3] = startY;        // topDistance
  task.data[4] = 72;            // bottomDistance
  task.data[5] = startX;
  task.data[6] = startY;
  task.func = _CurseStretchingBlackBg_Step1;
}
/** 1:1 AnimTask_CurseStretchingBlackBg_Step1 (:982) — interpolation 16 pas
 *  (arithmétique FLOAT du C reproduite : (dist * 0.0625) * step, tronquée). */
function _CurseStretchingBlackBg_Step1(task: _CsTask): void {
  const step = task.data[0];
  task.data[0]++;
  const leftDistance = task.data[1], rightDistance = task.data[2];
  const topDistance = task.data[3], bottomDistance = task.data[4];
  const startX = task.data[5], startY = task.data[6];
  let left: number, right: number, top: number, bottom: number;
  if (step < 16) {
    left = (startX - (leftDistance * 0.0625) * step) | 0;
    right = (startX + (rightDistance * 0.0625) * step) | 0;
    top = (startY - (topDistance * 0.0625) * step) | 0;
    bottom = (startY + (bottomDistance * 0.0625) * step) | 0;
  } else {
    left = 0;
    right = 240;
    top = 0;
    bottom = 112;
    const mons = (globalThis as Record<string, unknown>).__battleAnimMons as { GetBattlePalettesMask?: (bg: boolean, a: boolean, t: boolean, ap: boolean, tp: boolean, a1: boolean, a2: boolean) => number } | undefined;
    const selectedPalettes = mons?.GetBattlePalettesMask?.(true, false, false, false, false, false, false) ?? 0xE;
    _csBeginFade(selectedPalettes >>> 0, 0, 16, 16, 0 /* RGB_BLACK */);
    task.func = _CurseStretchingBlackBg_Step2;
  }
  _csSetG('gBattle_WIN0H', _csWinRange(left, right));
  _csSetG('gBattle_WIN0V', _csWinRange(top, bottom));
}
/** 1:1 AnimTask_CurseStretchingBlackBg_Step2 (:1017) : teardown post-fade. */
function _CurseStretchingBlackBg_Step2(task: _CsTask): void {
  const rt = _csRt();
  if (!rt.gPaletteFade?.active) {
    _csSetG('gBattle_WIN0H', 0);
    _csSetG('gBattle_WIN0V', 0);
    rt.SetGpuReg?.(_CS_REG_WININ, 0x3F3F);
    rt.SetGpuReg?.(_CS_REG_WINOUT, 0x3F3F);
    rt.SetGpuReg?.(_CS_REG_BLDCNT, 0);
    rt.SetGpuReg?.(_CS_REG_BLDY, 0);
    _dbItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
_f36RegT({ AnimTask_CurseStretchingBlackBg: AnimTask_CurseStretchingBlackBg as never });

// ─── AnimMonMoveCircular (battle_anim_ghost.c:1309-1340) — Curse (non-ghost) ─
// Sprite-pilote invisible : fait décrire un cercle (Sin/Cos rayon 10) au mon
// ATTAQUANT pendant args[1] frames (pas angulaire args[0]), mon décalé y+8
// pendant l'effet puis restauré.
type _McSprite = { invisible?: boolean; data: number[]; callback: unknown };
function _mcAtkSpriteId(): number {
  const itf = _f36Itf() as { getAttacker?: () => number };
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(itf.getAttacker?.() ?? 0) ?? -1;
}

/** 1:1 `AnimMonMoveCircular` (battle_anim_ghost.c:1309). */
function AnimMonMoveCircular(sprite: _McSprite): void {
  const itf = _f36Itf() as { getArgs?: () => number[] };
  const args = itf.getArgs?.() ?? [4, 30];
  sprite.invisible = true;
  sprite.data[5] = _mcAtkSpriteId();
  sprite.data[0] = 128;
  sprite.data[1] = 10;
  sprite.data[2] = args[0] | 0;
  sprite.data[3] = args[1] | 0;
  sprite.callback = AnimMonMoveCircular_Step;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ y: number } | undefined> } | undefined;
  const mon = sprite.data[5] >= 0 ? rt?.gSprites?.[sprite.data[5]] : undefined;
  if (mon) mon.y += 8;
}

/** 1:1 `AnimMonMoveCircular_Step` (battle_anim_ghost.c:1322). */
function AnimMonMoveCircular_Step(sprite: _McSprite): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x2: number; y2: number; y: number } | undefined> } | undefined;
  const mon = sprite.data[5] >= 0 ? rt?.gSprites?.[sprite.data[5]] : undefined;
  if (sprite.data[3]) {
    sprite.data[3]--;
    if (mon) {
      mon.x2 = Sin(sprite.data[0], sprite.data[1]);
      mon.y2 = Cos(sprite.data[0], sprite.data[1]);
    }
    sprite.data[0] += sprite.data[2];
    if (sprite.data[0] > 255) sprite.data[0] -= 256;
  } else {
    if (mon) {
      mon.x2 = 0;
      mon.y2 = 0;
      mon.y -= 8;
    }
    sprite.callback = ((s: unknown) => {
      ((globalThis as Record<string, unknown>).__battleAnimInterpreter as { DestroyAnimSprite?: (x: unknown) => void } | undefined)?.DestroyAnimSprite?.(s);
    }) as never; // DestroySpriteAndMatrix (matrice : sprite-pilote sans affine → destroy simple)
  }
}

registerAnimCallbacks({
  AnimMonMoveCircular: AnimMonMoveCircular as never,
  AnimMonMoveCircular_Step: AnimMonMoveCircular_Step as never,
});

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
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  InitAnimLinearTranslation, AnimTranslateLinear, StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { GetBattlerPosition } from '../engine/battle/util';

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

/**
 * battle_anim_effects_2.ts — miroir PARTIEL de `src/battle_anim_effects_2.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Portés (callbacks sprites, mêmes noms C, ordre du .c) :
 *   - AnimAngerMark (:2283)                       — marque de colère (Swagger/Taunt)
 *   - AnimBlendThinRing (:2553)                   — anneau fin blendé (Hyper Voice…)
 *   - AnimHyperVoiceRing (+_WaitEnd, :2593/:2584) — anneau Hyper Voice translaté
 *   - AnimUproarRing (:2678)                      — anneau Uproar (BlendPalette THIN_RING)
 *   - AnimSoftBoiledEgg (+Step1..4+callbacks, :2691-:2786) — œuf Soft-Boiled complet
 *   - AnimMagentaHeart (:3069)                    — cœur magenta (Charm)
 *   - AnimRedHeartProjectile (+_Step, :3175)      — cœur projectile (Attract)
 *   - AnimRedHeartRising (+_Step, :3222)          — cœur montant du bas d'écran
 *   - AnimOrbitFast (+_Step, :3415)               — orbe en orbite (Hidden Power)
 *   - AnimOrbitScatter (+_Step, :3466)            — dispersion des orbes
 *   - AnimSpitUpOrb (+_Step, :3492/:3484)         — orbe Spit Up
 *   - AnimEyeSparkle (+_Step, :3508/:3502)        — étincelle d'œil (Sweet Kiss…)
 *   - AnimAngel (:3514)                           — ange (Sweet Kiss)
 *   - AnimPinkHeart (+_Step, :3552/:3539)         — cœur rose (Sweet Kiss/Charm)
 *   - AnimMovementWaves (+_Step, :3622)           — ondes de mouvement (Uproar…)
 *   - AnimJaggedMusicNote (+_Step, :3678)         — note de musique dentelée (Uproar)
 *   - AnimPerishSongMusicNote (+_Step1/2, :3722)  — notes Perish Song (vol + chute)
 *   - AnimPerishSongMusicNote2 (:3707)            — note grise différée Perish Song
 *   - AnimGuardRing (:3798)                       — anneau Safeguard
 *
 * Helpers C transcrits localement (absents des exports battle_anim_mons.ts,
 * préfixés _) : _WaitAnimForDuration, _RunStoredCallbackWhenAffineAnimEnds,
 * _GetBattlerSpriteSubpriority, _SetAverageBattlerPositions,
 * _SetGrayscaleOrOriginalPalette (battle_anim_mons.c:1374), _oamTileNumAdd,
 * _SetGpuReg/_BLDALPHA_BLEND, _FreeSpriteOamMatrix.
 *
 * Dettes douces documentées :
 *   - Runtime SINGLES : IsBattlerSpriteVisible(BATTLE_PARTNER(x)) = false →
 *     les branches doubles (BlendThinRing/HyperVoiceRing/GuardRing) sont
 *     transcrites mais mortes (1:1 du else C).
 *   - `gSprites[gBattlerSpriteIds[b]].subpriority` (HyperVoiceRing) lu via
 *     _GetBattlerSpriteSubpriority(b) = la valeur de création du sprite mon
 *     (battle_anim_mons.c:2035) — identique tant que rien ne la réécrit.
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
  InitSpritePosToAnimAttacker,
  StartAnimLinearTranslation, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  InitAnimLinearTranslation, AnimTranslateLinear,
  SetSpritePrimaryCoordsFromSecondaryCoords,
  DestroySpriteAndMatrix, AnimSpriteOnMonPos, TranslateSpriteLinearFixedPoint,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { Random2 } from './random';
import { gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';
import { GetBattlerPosition } from '../engine/battle/util';
import { IndexOfSpritePaletteTag, OBJ_PLTT_ID, BlendPalette } from '../engine/system/decomp-globals';

type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; callback: unknown;
  subpriority?: number;
  animEnded?: boolean; affineAnimEnded?: boolean; affineAnimPaused?: boolean;
  oamIndex?: number; tileBase?: number; sheetTileStart?: number; matrixNum?: number;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
type _RtOam = { tileId?: number; paletteBank?: number };
type _Rt = {
  gba?: { oam?: _RtOam[] };
  SetGpuReg?: (off: number, v: number) => void;
  FreeOamMatrix?: (m: number) => void;
  gPlttBufferUnfaded?: { get: (i: number) => number };
  gPlttBufferFaded?: { get: (i: number) => number; set: (i: number, v: number) => void };
};
function _rt(): _Rt | undefined {
  return (globalThis as Record<string, unknown>).__rt as _Rt | undefined;
}

// ─── Constantes décomp ───────────────────────────────────────────────────────
const DISPLAY_WIDTH = 240;  // include/gba/defines.h
const DISPLAY_HEIGHT = 160;
const B_SIDE_PLAYER = 0;    // constants/battle.h
const B_SIDE_OPPONENT = 1;
const REG_OFFSET_BLDCNT = 0x50;   // gba/io_reg.h
const REG_OFFSET_BLDALPHA = 0x52;
const BLDCNT_TGT2_ALL = 0x3F00;   // gba/io_reg.h (tous targets 2)
const BLDCNT_EFFECT_BLEND = 0x40;
// constants/battle_anim.h : ANIM_SPRITES_START(10000) + 203
const ANIM_TAG_THIN_RING = 10203;

// ─── Petits helpers 1:1 locaux ──────────────────────────────────────────────

/** gBattleAnimArgs via la surface lazy (anti-cycle ESM) — relu LIVE à chaque tick. */
function _args(): number[] {
  return _vItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
}

/** Réinterprète les 16 bits bas en s16 signé (= cast/stockage s16 data[] décomp). */
function _toS16(v: number): number { return (v << 16) >> 16; }

/** 1:1 `GetBattlerSide(battler)` = GetBattlerPosition(battler) & BIT_SIDE (0 = B_SIDE_PLAYER). */
function _GetBattlerSide(battler: number): number { return GetBattlerPosition(battler) & 1; }

/** 1:1 `IsContest()` (battle_anim.c) — pas de mode contest dans ce jeu → false. */
function _IsContest(): boolean { return false; }

/** 1:1 battle_util.c `IsDoubleBattle()` = gBattleTypeFlags & BATTLE_TYPE_DOUBLE. */
function _IsDoubleBattle(): boolean { return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0; }

/** 1:1 macro battle.h `BATTLE_PARTNER(battler)` = battler ^ BIT_FLANK (2). */
function _BATTLE_PARTNER(battler: number): number { return battler ^ 2; }

/** `IsBattlerSpriteVisible(BATTLE_PARTNER(x))` — runtime SINGLES : le partenaire
 *  n'existe jamais → false (les branches doubles retombent sur le else du C). */
function _IsBattlerSpriteVisible(_battler: number): boolean { return false; }

/** 1:1 sprite.c `StartSpriteAnim(sprite, n)` : champs PLATS du runtime. */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** 1:1 sprite.c `StartSpriteAffineAnim(sprite, n)` : champs PLATS du runtime. */
function _StartSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** `DestroyAnimSprite` utilisé comme VALEUR de callback (stocké en data6 / assigné). */
function _destroyAnimSpriteCb(sprite: unknown): void { _vItf().DestroyAnimSprite?.(sprite); }

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décompte data[0] → data6. */
function _WaitAnimForDuration(sprite: _VSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _VSprite): void {
  if (sprite.affineAnimEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `GetBattlerSpriteSubpriority` (battle_anim_mons.c:2035, hors contest).
 *  Singles : GetBattlerPosition(b) = b → 0:30, 2:20, 1:40, sinon 50. */
function _GetBattlerSpriteSubpriority(battler: number): number {
  const position = GetBattlerPosition(battler);
  if (position === 0) return 30;      // B_POSITION_PLAYER_LEFT
  else if (position === 2) return 20; // B_POSITION_PLAYER_RIGHT
  else if (position === 1) return 40; // B_POSITION_OPPONENT_LEFT
  return 50;                          // B_POSITION_OPPONENT_RIGHT
}

/** 1:1 `SetAverageBattlerPositions(battler, respectMonPicOffsets, *x, *y)`
 *  (battle_anim_mons.c:2289) : moyenne battler + partenaire (lui-même hors
 *  double). Out-pointeurs C → retour {x, y}. */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  let xCoordType: number, yCoordType: number;
  if (!respectMonPicOffsets) {
    xCoordType = BATTLER_COORD_X;
    yCoordType = BATTLER_COORD_Y;
  } else {
    xCoordType = BATTLER_COORD_X_2;
    yCoordType = BATTLER_COORD_Y_PIC_OFFSET;
  }
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  let partnerX: number, partnerY: number;
  if (_IsDoubleBattle() && !_IsContest()) {
    partnerX = GetBattlerSpriteCoord(_BATTLE_PARTNER(battler), xCoordType);
    partnerY = GetBattlerSpriteCoord(_BATTLE_PARTNER(battler), yCoordType);
  } else {
    partnerX = battlerX;
    partnerY = battlerY;
  }
  return { x: Math.trunc((battlerX + partnerX) / 2), y: Math.trunc((battlerY + partnerY) / 2) };
}

/** 1:1 `SetGpuReg(reg, value)` via runtime (pattern battle_anim_bug.ts:124). */
function _SetGpuReg(reg: number, value: number): void {
  _rt()?.SetGpuReg?.(reg, value & 0xFFFF);
}

/** 1:1 macro io_reg.h `BLDALPHA_BLEND(target1, target2)` = (target2 << 8) | target1. */
function _BLDALPHA_BLEND(target1: number, target2: number): number {
  return (target1 | (target2 << 8)) & 0xFFFF;
}

/** Miroir `sprite->oam.tileNum += n` : bump la tile OAM live + les bases
 *  (tileBase/sheetTileStart) — pattern battle_anim_electric.ts:81. */
function _oamTileNumAdd(sprite: _VSprite, n: number): void {
  if (!n) return;
  const oam = _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam && typeof oam.tileId === 'number') oam.tileId += n;
  if (typeof sprite.tileBase === 'number') sprite.tileBase += n;
  if (typeof sprite.sheetTileStart === 'number') sprite.sheetTileStart += n;
}

/** 1:1 `FreeSpriteOamMatrix(sprite)` (sprite.c) : libère le slot matrice affine
 *  du sprite via rt.FreeOamMatrix (slot 0 = identité partagée → jamais libéré). */
function _FreeSpriteOamMatrix(sprite: _VSprite): void {
  const m = sprite.matrixNum ?? 0;
  if (m > 0) {
    _rt()?.FreeOamMatrix?.(m);
    sprite.matrixNum = 0;
  }
}

/** 1:1 `SetGrayscaleOrOriginalPalette` (battle_anim_mons.c:1374) : moyenne
 *  r+g+b /3 de la palette UNFADED écrite dans la FADED (restore = recopie). */
function _SetGrayscaleOrOriginalPalette(paletteNum: number, restoreOriginalColor: boolean): void {
  const r = _rt();
  const unfaded = r?.gPlttBufferUnfaded;
  const faded = r?.gPlttBufferFaded;
  if (!unfaded || !faded) return;
  const paletteOffset = paletteNum * 16; // PLTT_ID(paletteNum)
  if (!restoreOriginalColor) {
    for (let i = 0; i < 16; i++) {
      const original = unfaded.get(paletteOffset + i) ?? 0;
      const average = Math.trunc(((original & 0x1F) + ((original >> 5) & 0x1F) + ((original >> 10) & 0x1F)) / 3);
      const dest = faded.get(paletteOffset + i) ?? 0;
      // C : destColor->r/g/b = average (bit 15 du faded conservé).
      faded.set(paletteOffset + i, (dest & 0x8000) | (average << 10) | (average << 5) | average);
    }
  } else {
    // C : CpuCopy32(&gPlttBufferUnfaded[off], &gPlttBufferFaded[off], PLTT_SIZE_4BPP).
    for (let i = 0; i < 16; i++) faded.set(paletteOffset + i, unfaded.get(paletteOffset + i) ?? 0);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Callbacks 1:1 (ordre du .c)
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimAngerMark` (battle_anim_effects_2.c:2283) : marque de colère posée
 *  sur attacker/target (args[0]) à (±args[1], args[2]), clamp y ≥ 8, détruite
 *  à la fin de l'affine anim. */
function AnimAngerMark(sprite: _VSprite): void {
  const args = _args();
  let battler: number;
  if (!args[0]) battler = _vItf().getAttacker?.() ?? 0;
  else battler = _vItf().getTarget?.() ?? 1;

  if (_GetBattlerSide(battler) === B_SIDE_OPPONENT) args[1] *= -1; // miroir de côté (mutation in-place 1:1)

  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + args[1];
  sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) + args[2];
  if (sprite.y < 8) sprite.y = 8;

  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimBlendThinRing` (battle_anim_effects_2.c:2553) : anneau fin blendé —
 *  recale args[0] en double (positions moyennes) puis délègue à AnimSpriteOnMonPos. */
function AnimBlendThinRing(sprite: _VSprite): void {
  const args = _args();
  let battler = 0;
  let x = 0;
  let r4: number;

  if ((args[2] | 0) === 0) battler = _vItf().getAttacker?.() ?? 0;
  else battler = _vItf().getTarget?.() ?? 1;

  r4 = (args[3] ^ 1) & 0xFF;
  if (_IsDoubleBattle() && _IsBattlerSpriteVisible(_BATTLE_PARTNER(battler))) {
    // Branche DOUBLE (morte en singles — transcrite 1:1).
    const avg = _SetAverageBattlerPositions(battler, r4 !== 0); // C : &x, &y (y jamais relu)
    x = avg.x;
    if (r4 === 0) r4 = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);
    else r4 = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2);

    if (_GetBattlerSide(battler) !== B_SIDE_PLAYER)
      args[0] -= (x - r4) - args[0]; // "This is weird." (commentaire décomp)
    else
      args[0] = x - r4;
  }

  sprite.callback = AnimSpriteOnMonPos as never;
  AnimSpriteOnMonPos(sprite as never);
}

/** 1:1 `AnimHyperVoiceRing_WaitEnd` (battle_anim_effects_2.c:2584). */
function AnimHyperVoiceRing_WaitEnd(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    _FreeSpriteOamMatrix(sprite);
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimHyperVoiceRing` (battle_anim_effects_2.c:2593) : anneau translaté
 *  battler1 → battler2 (sens inversé par args[5]) ; coords X/Y vs X_2/PIC_OFFSET
 *  selon args[6] ; subpriority sous le sprite du battler d'arrivée. */
function AnimHyperVoiceRing(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  let startX = 0;
  let startY = 0;
  let x = 0;
  let y = 0;
  let yCoordType: number;
  let battler1: number;
  let battler2: number;
  let xCoordType: number;

  if ((args[5] | 0) === 0) {
    battler1 = attacker;
    battler2 = target;
  } else {
    battler1 = target;
    battler2 = attacker;
  }

  if (!args[6]) {
    xCoordType = BATTLER_COORD_X;
    yCoordType = BATTLER_COORD_Y;
  } else {
    xCoordType = BATTLER_COORD_X_2;
    yCoordType = BATTLER_COORD_Y_PIC_OFFSET;
  }

  if (_GetBattlerSide(battler1) !== B_SIDE_PLAYER) {
    startX = (GetBattlerSpriteCoord(battler1, xCoordType) + args[0]) & 0xFFFF; // u16
    // C : gSprites[gBattlerSpriteIds[...]].subpriority — valeur de création
    // = GetBattlerSpriteSubpriority (cf. dette douce en tête de fichier).
    if (_IsBattlerSpriteVisible(_BATTLE_PARTNER(battler2)))
      sprite.subpriority = _GetBattlerSpriteSubpriority(_BATTLE_PARTNER(battler2)) - 1;
    else
      sprite.subpriority = _GetBattlerSpriteSubpriority(battler2) - 1;
  } else {
    startX = (GetBattlerSpriteCoord(battler1, xCoordType) - args[0]) & 0xFFFF; // u16
    // C double (partner visible) : compare gSprites[..].x pour choisir ±1 —
    // branche morte en singles (_IsBattlerSpriteVisible=false) → else du C :
    sprite.subpriority = _GetBattlerSpriteSubpriority(battler1) - 1;
  }

  startY = (GetBattlerSpriteCoord(battler1, yCoordType) + args[1]) & 0xFFFF; // u16
  if (!_IsContest() && _IsBattlerSpriteVisible(_BATTLE_PARTNER(battler2))) {
    const avg = _SetAverageBattlerPositions(battler2, (args[6] | 0) !== 0);
    x = avg.x;
    y = avg.y;
  } else {
    x = GetBattlerSpriteCoord(battler2, xCoordType);
    y = GetBattlerSpriteCoord(battler2, yCoordType);
  }

  if (_GetBattlerSide(battler2)) x += args[3];
  else x -= args[3];

  y += args[4];
  sprite.x = sprite.data[1] = startX;
  sprite.y = sprite.data[3] = startY;
  sprite.data[2] = x;
  sprite.data[4] = y;
  sprite.data[0] = args[0] | 0;
  sprite.invisible = false;
  InitAnimLinearTranslation(sprite as never);
  sprite.callback = AnimHyperVoiceRing_WaitEnd;
  AnimHyperVoiceRing_WaitEnd(sprite);
}

/** 1:1 `AnimUproarRing` (battle_anim_effects_2.c:2678) : blende la palette
 *  THIN_RING (couleurs 1-15) avec args[4]/args[5], affine anim 1, puis
 *  délègue à AnimSpriteOnMonPos. */
function AnimUproarRing(sprite: _VSprite): void {
  const args = _args();
  let index = IndexOfSpritePaletteTag(ANIM_TAG_THIN_RING);
  if (index === 0xFF) index = IndexOfSpritePaletteTag('ANIM_TAG_THIN_RING');
  if (index !== 0xFF) {
    BlendPalette(OBJ_PLTT_ID(index) + 1, 15, args[5] | 0, args[4] | 0);
  }

  _StartSpriteAffineAnim(sprite, 1);
  sprite.callback = AnimSpriteOnMonPos as never;
  AnimSpriteOnMonPos(sprite as never);
}

/** 1:1 `AnimSoftBoiledEgg` (battle_anim_effects_2.c:2691) : œuf lancé en
 *  cloche depuis l'attaquant (vitesse verticale 0x380 décroissante, dérive X
 *  ±160 fixed-point 8.8 selon le côté). data[7] = args[2] (variante). */
function AnimSoftBoiledEgg(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, false);
  const r1 = _GetBattlerSide(attacker) !== B_SIDE_PLAYER ? -160 : 160;
  sprite.data[0] = 0x380;
  sprite.data[1] = r1;
  sprite.data[7] = args[2] | 0;
  sprite.invisible = false;
  sprite.callback = AnimSoftBoiledEgg_Step1;
}

/** 1:1 `AnimSoftBoiledEgg_Step1` (battle_anim_effects_2.c:2702) : montée puis
 *  retombée (data[0] -= 32/frame) ; à l'atterrissage (y2 > 0) consolide la
 *  position et lance l'affine anim 1 (squash). */
function AnimSoftBoiledEgg_Step1(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;
  sprite.y2 -= sprite.data[0] >> 8;
  sprite.x2 = sprite.data[1] >> 8;
  sprite.data[0] -= 32;
  const add = _GetBattlerSide(attacker) !== B_SIDE_PLAYER ? -160 : 160;
  sprite.data[1] += add;
  if (sprite.y2 > 0) {
    sprite.y += sprite.y2;
    sprite.x += sprite.x2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[0] = 0;
    _StartSpriteAffineAnim(sprite, 1);
    sprite.callback = AnimSoftBoiledEgg_Step2;
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step2` (battle_anim_effects_2.c:2722) : attend 20
 *  frames puis affine anim 2 (craquement). */
function AnimSoftBoiledEgg_Step2(sprite: _VSprite): void {
  if (sprite.data[0]++ > 19) {
    _StartSpriteAffineAnim(sprite, 2);
    sprite.callback = AnimSoftBoiledEgg_Step3;
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step3` (battle_anim_effects_2.c:2731) : à la fin de
 *  l'affine, avance la gfx (tileNum += 16 ou 32 selon data[7]) → coquille
 *  ouverte ; variante 0 part en fade (Callback1), sinon attente Step4. */
function AnimSoftBoiledEgg_Step3(sprite: _VSprite): void {
  if (sprite.affineAnimEnded) {
    _StartSpriteAffineAnim(sprite, 1);
    sprite.data[0] = 0;
    if (sprite.data[7] === 0) {
      _oamTileNumAdd(sprite, 16);
      sprite.callback = AnimSoftBoiledEgg_Step3_Callback1;
    } else {
      _oamTileNumAdd(sprite, 32);
      sprite.callback = AnimSoftBoiledEgg_Step4;
    }
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step3_Callback1` (battle_anim_effects_2.c:2750) :
 *  monte de 2px/frame 9 frames, puis arme le blend OBJ (BLDCNT TGT2_ALL). */
function AnimSoftBoiledEgg_Step3_Callback1(sprite: _VSprite): void {
  sprite.y2 -= 2;
  if (++sprite.data[0] === 9) {
    sprite.data[0] = 16;
    sprite.data[1] = 0;
    _SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
    _SetGpuReg(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[0] & 0xFFFF, 0));
    sprite.callback = AnimSoftBoiledEgg_Step3_Callback2;
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step3_Callback2` (battle_anim_effects_2.c:2763) :
 *  fade-out 16→0 (1 cran / 3 frames) puis Step4. */
function AnimSoftBoiledEgg_Step3_Callback2(sprite: _VSprite): void {
  if (sprite.data[1]++ % 3 === 0) {
    sprite.data[0]--;
    _SetGpuReg(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[0], 16 - sprite.data[0]));
    if (sprite.data[0] === 0) sprite.callback = AnimSoftBoiledEgg_Step4;
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step4` (battle_anim_effects_2.c:2774) : attend que le
 *  script pose gBattleAnimArgs[7] = -1 (setarg) → cache et détruit (variante 0
 *  remet d'abord les regs blend à 0 via le callback). */
function AnimSoftBoiledEgg_Step4(sprite: _VSprite): void {
  if (((_args()[7] | 0) & 0xFFFF) === 0xFFFF) { // (u16)gBattleAnimArgs[7] == 0xFFFF
    sprite.invisible = true;
    if (sprite.data[7] === 0) sprite.callback = AnimSoftBoiledEgg_Step4_Callback;
    else sprite.callback = _destroyAnimSpriteCb;
  }
}

/** 1:1 `AnimSoftBoiledEgg_Step4_Callback` (battle_anim_effects_2.c:2786) :
 *  remet BLDCNT/BLDALPHA à 0 puis détruit. */
function AnimSoftBoiledEgg_Step4_Callback(sprite: _VSprite): void {
  _SetGpuReg(REG_OFFSET_BLDCNT, 0);
  _SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimMagentaHeart` (battle_anim_effects_2.c:3069) : cœur de Charm —
 *  monte en fixed-point (data[2] -= 0x80) en oscillant Sin(±8), 60 frames. */
function AnimMagentaHeart(sprite: _VSprite): void {
  if (++sprite.data[0] === 1) {
    InitSpritePosToAnimAttacker(sprite as never, false);
    sprite.invisible = false;
  }

  sprite.x2 = Sin(sprite.data[1] & 0xFF, 8);
  sprite.y2 = sprite.data[2] >> 8;
  sprite.data[1] = (sprite.data[1] + 7) & 0xFF;
  sprite.data[2] -= 0x80;
  if (sprite.data[0] === 60) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimRedHeartProjectile` (battle_anim_effects_2.c:3175) : cœur d'Attract
 *  translaté vers la cible en 95 frames avec ondulation Sin(14). */
function AnimRedHeartProjectile(sprite: _VSprite): void {
  const target = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.data[0] = 95;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  InitAnimLinearTranslation(sprite as never);
  sprite.callback = AnimRedHeartProjectile_Step;
}

/** 1:1 `AnimRedHeartProjectile_Step` (battle_anim_effects_2.c:3187). */
function AnimRedHeartProjectile_Step(sprite: _VSprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.y2 += Sin(sprite.data[5] & 0xFF, 14);
    sprite.data[5] = (sprite.data[5] + 4) & 0xFF;
  } else {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimRedHeartRising` (battle_anim_effects_2.c:3222) : cœur qui part du
 *  bas de l'écran (x = args[0]) après args[2] frames d'attente. */
function AnimRedHeartRising(sprite: _VSprite): void {
  const args = _args();
  sprite.x = args[0] | 0;
  sprite.y = DISPLAY_HEIGHT;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[1] | 0;
  sprite.invisible = false;
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, AnimRedHeartRising_Step as never);
}

/** 1:1 `AnimRedHeartRising_Step` (battle_anim_effects_2.c:3232) : montée
 *  fixed-point u16 (data[2] += vitesse) + onde Sin(4) ; clignote sous y=72,
 *  détruit sous y=64. */
function AnimRedHeartRising_Step(sprite: _VSprite): void {
  sprite.data[2] = _toS16(sprite.data[2] + sprite.data[1]);
  sprite.y2 = -((sprite.data[2] & 0xFFFF) >> 8); // -((u16)data[2] >> 8)
  sprite.x2 = Sin(sprite.data[3] & 0xFF, 4);
  sprite.data[3] = (sprite.data[3] + 3) & 0xFF;
  const y = _toS16(sprite.y + sprite.y2); // s16 y
  if (y <= 72) {
    sprite.invisible = (sprite.data[3] % 2) !== 0;
    if (y <= 64) _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimOrbitFast` (battle_anim_effects_2.c:3415) : orbe Hidden Power en
 *  orbite autour de l'attaquant — args [période grow/shrink, phase initiale]. */
function AnimOrbitFast(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.affineAnimPaused = true; // sprite->affineAnimPaused = 1
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = args[1] | 0;
  sprite.data[7] = _GetBattlerSpriteSubpriority(attacker);
  sprite.invisible = false;
  sprite.callback = AnimOrbitFast_Step;
  AnimOrbitFast_Step(sprite);
}

/** 1:1 `AnimOrbitFast_Step` (battle_anim_effects_2.c:3427) : ellipse Sin/Cos
 *  (rayons 8.8 en data[2]/data[3], wrap s16 1:1), passe devant/derrière le mon
 *  selon la phase ; grow (case 0) puis shrink (case 1) ; détruit quand le
 *  script pose args[7] = -1. */
function AnimOrbitFast_Step(sprite: _VSprite): void {
  if (sprite.data[1] >= 64 && sprite.data[1] <= 191) sprite.subpriority = sprite.data[7] + 1;
  else sprite.subpriority = sprite.data[7] - 1;

  sprite.x2 = Sin(sprite.data[1] & 0xFF, _toS16(sprite.data[2]) >> 8);
  sprite.y2 = Cos(sprite.data[1] & 0xFF, _toS16(sprite.data[3]) >> 8);
  sprite.data[1] = (sprite.data[1] + 9) & 0xFF;
  switch (sprite.data[5]) {
    case 1:
      sprite.data[2] = _toS16(sprite.data[2] - 0x400);
      sprite.data[3] = _toS16(sprite.data[3] - 0x100);
      if (++sprite.data[4] === sprite.data[0]) {
        sprite.data[5] = 2;
        return;
      }
      break;
    case 0:
      sprite.data[2] = _toS16(sprite.data[2] + 0x400);
      sprite.data[3] = _toS16(sprite.data[3] + 0x100);
      if (++sprite.data[4] === sprite.data[0]) {
        sprite.data[4] = 0;
        sprite.data[5] = 1;
      }
      break;
  }

  if (((_args()[7] | 0) & 0xFFFF) === 0xFFFF) // (u16)gBattleAnimArgs[7] == 0xFFFF
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimOrbitScatter` (battle_anim_effects_2.c:3466) : éjecte l'orbe selon
 *  sa position d'orbite — arg 0 = phase initiale (Hidden Power). */
function AnimOrbitScatter(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[0] = Sin(args[0] & 0xFF, 10);
  sprite.data[1] = Cos(args[0] & 0xFF, 7);
  sprite.invisible = false;
  sprite.callback = AnimOrbitScatter_Step;
}

/** 1:1 `AnimOrbitScatter_Step` (battle_anim_effects_2.c:3475) : dérive
 *  constante ; le test X est en u32 (x+x2+16 négatif → wrap → destroy, 1:1). */
function AnimOrbitScatter_Step(sprite: _VSprite): void {
  sprite.x2 += sprite.data[0];
  sprite.y2 += sprite.data[1];
  if (((sprite.x + sprite.x2 + 16) >>> 0) > DISPLAY_WIDTH + 32
    || sprite.y + sprite.y2 > DISPLAY_HEIGHT || sprite.y + sprite.y2 < -16)
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSpitUpOrb_Step` (battle_anim_effects_2.c:3484). */
function AnimSpitUpOrb_Step(sprite: _VSprite): void {
  sprite.x2 += sprite.data[0];
  sprite.y2 += sprite.data[1];
  if (sprite.data[3]++ >= sprite.data[2]) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSpitUpOrb` (battle_anim_effects_2.c:3492) : orbe éjecté de
 *  l'attaquant selon la phase args[0], durée args[1]. */
function AnimSpitUpOrb(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[0] = Sin(args[0] & 0xFF, 10);
  sprite.data[1] = Cos(args[0] & 0xFF, 7);
  sprite.data[2] = args[1] | 0;
  sprite.invisible = false;
  sprite.callback = AnimSpitUpOrb_Step;
}

/** 1:1 `AnimEyeSparkle_Step` (battle_anim_effects_2.c:3502). */
function AnimEyeSparkle_Step(sprite: _VSprite): void {
  if (sprite.animEnded) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimEyeSparkle` (battle_anim_effects_2.c:3508) : étincelle posée sur
 *  l'attaquant, détruite à la fin de son anim de table. */
function AnimEyeSparkle(sprite: _VSprite): void {
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.callback = AnimEyeSparkle_Step;
}

/** 1:1 `AnimAngel` (battle_anim_effects_2.c:3514) : ange de Sweet Kiss —
 *  flottement Sin/Cos >> 8 + descente lente, dérive gauche après 90 frames,
 *  détruit après 100. */
function AnimAngel(sprite: _VSprite): void {
  if (!sprite.data[0]) {
    const args = _args();
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.invisible = false;
  }

  sprite.data[0]++;
  const var0 = (sprite.data[0] * 10) & 0xFF;
  sprite.x2 = Sin(var0, 80) >> 8;
  if (sprite.data[0] < 80)
    sprite.y2 = Math.trunc(sprite.data[0] / 2) + (Cos(var0, 80) >> 8);

  if (sprite.data[0] > 90) {
    sprite.data[2]++;
    sprite.x2 -= Math.trunc(sprite.data[2] / 2);
  }

  if (sprite.data[0] > 100) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimPinkHeart_Step` (battle_anim_effects_2.c:3539) : retombée du cœur
 *  (y2 = data[5]/2) avec oscillation Sin(5) ; clignote après 20, détruit à 30. */
function AnimPinkHeart_Step(sprite: _VSprite): void {
  sprite.data[5]++;
  sprite.x2 = Sin(sprite.data[3] & 0xFF, 5);
  sprite.y2 = Math.trunc(sprite.data[5] / 2);
  sprite.data[3] = (sprite.data[3] + 3) & 0xFF;
  if (sprite.data[5] > 20) sprite.invisible = (sprite.data[5] % 2) !== 0;

  if (sprite.data[5] > 30) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimPinkHeart` (battle_anim_effects_2.c:3552) : cœur rose — dérive X
 *  fixed-point (args[0]) + onde Sin(args[1]) jusqu'à data[3] > 70, puis
 *  consolide la position et part en retombée (_Step, phase Random2() % 180). */
function AnimPinkHeart(sprite: _VSprite): void {
  if (sprite.data[0] === 0) {
    const args = _args();
    sprite.data[1] = args[0] | 0;
    sprite.data[2] = args[1] | 0;
    sprite.data[0]++;
    sprite.invisible = false;
  } else {
    sprite.data[4] = _toS16(sprite.data[4] + sprite.data[1]);
    sprite.x2 = sprite.data[4] >> 8;
    sprite.y2 = Sin(sprite.data[3] & 0xFF, sprite.data[2]);
    sprite.data[3] = (sprite.data[3] + 3) & 0xFF;
    if (sprite.data[3] > 70) {
      sprite.callback = AnimPinkHeart_Step;
      sprite.x += sprite.x2;
      sprite.y += sprite.y2;
      sprite.x2 = 0;
      sprite.y2 = 0;
      sprite.data[3] = Random2() % 180;
    }
  }
}

/** 1:1 `AnimMovementWaves` (battle_anim_effects_2.c:3622) : onde posée à
 *  ±32px du battler (args[0]=cible?, args[1]=côté/anim, args[2]=répétitions) —
 *  rejoue son anim args[2] fois puis se détruit. */
function AnimMovementWaves(sprite: _VSprite): void {
  const args = _args();
  if (!args[2]) {
    _vItf().DestroyAnimSprite?.(sprite);
  } else {
    if (!args[0]) {
      const attacker = _vItf().getAttacker?.() ?? 0;
      sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2);
      sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET);
    } else {
      const target = _vItf().getTarget?.() ?? 1;
      sprite.x = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
      sprite.y = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);
    }

    if (!args[1]) sprite.x += 32;
    else sprite.x -= 32;

    sprite.data[0] = args[2] | 0;
    sprite.data[1] = args[1] | 0;
    _StartSpriteAnim(sprite, sprite.data[1]);
    sprite.invisible = false;
    sprite.callback = AnimMovementWaves_Step;
  }
}

/** 1:1 `AnimMovementWaves_Step` (battle_anim_effects_2.c:3653). */
function AnimMovementWaves_Step(sprite: _VSprite): void {
  if (sprite.animEnded) {
    if (--sprite.data[0]) _StartSpriteAnim(sprite, sprite.data[1]);
    else _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimJaggedMusicNote` (battle_anim_effects_2.c:3678) : note dentelée
 *  d'Uproar — position 13.3 fixed-point (x<<3), vitesse (args<<3)/8, gfx
 *  décalée de args[3]*16 tiles ; vole 16 frames. */
function AnimJaggedMusicNote(sprite: _VSprite): void {
  const args = _args();
  const battler = !args[0] ? (_vItf().getAttacker?.() ?? 0) : (_vItf().getTarget?.() ?? 1);

  if (_GetBattlerSide(battler) === B_SIDE_OPPONENT) args[1] *= -1; // miroir de côté (mutation in-place 1:1)

  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + args[1];
  sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) + args[2];
  sprite.data[0] = 0;
  sprite.data[1] = _toS16((sprite.x & 0xFFFF) << 3); // (u16)x << 3 stocké s16
  sprite.data[2] = _toS16((sprite.y & 0xFFFF) << 3);
  sprite.data[3] = Math.trunc((args[1] << 3) / 8);
  sprite.data[4] = Math.trunc((args[2] << 3) / 8);

  _oamTileNumAdd(sprite, (args[3] | 0) * 16); // sprite->oam.tileNum += args[3] * 16
  sprite.invisible = false;
  sprite.callback = AnimJaggedMusicNote_Step;
}

/** 1:1 `AnimJaggedMusicNote_Step` (battle_anim_effects_2.c:3697). */
function AnimJaggedMusicNote_Step(sprite: _VSprite): void {
  sprite.data[1] = _toS16(sprite.data[1] + sprite.data[3]);
  sprite.data[2] = _toS16(sprite.data[2] + sprite.data[4]);
  sprite.x = sprite.data[1] >> 3;
  sprite.y = sprite.data[2] >> 3;
  if (++sprite.data[0] > 16) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimPerishSongMusicNote2` (battle_anim_effects_2.c:3707) : note
 *  INVISIBLE qui, à la frame 120-args[0], passe sa palette OBJ en niveaux de
 *  gris (SetGrayscaleOrOriginalPalette) puis se détruit 80 frames après. */
function AnimPerishSongMusicNote2(sprite: _VSprite): void {
  if (!sprite.data[0]) {
    const args = _args();
    sprite.data[1] = 120 - (args[0] | 0);
    sprite.invisible = true;
  }

  if (++sprite.data[0] === sprite.data[1]) {
    // C : SetGrayscaleOrOriginalPalette(sprite->oam.paletteNum + 16, FALSE)
    const oam = _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
    if (oam && typeof oam.paletteBank === 'number')
      _SetGrayscaleOrOriginalPalette(oam.paletteBank + 16, false);
  }

  if (sprite.data[0] === sprite.data[1] + 80) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimPerishSongMusicNote` (battle_anim_effects_2.c:3722) : note de
 *  Perish Song — grande ellipse Cos(100)/Sin(10) + tremblement Cos(4) en
 *  descendant (data[1] = frame/2) pendant 120 frames, puis pause (Step1) et
 *  chute avec rebonds (Step2). */
function AnimPerishSongMusicNote(sprite: _VSprite): void {
  if (!sprite.data[0]) {
    const args = _args();
    sprite.x = 120;
    // C : (args[0] + ((u16)args[0] >> 31)) / 2 - 15 (idiome /2 du compilateur ; (u16)x>>31 = 0)
    sprite.y = Math.trunc(((args[0] | 0) + ((args[0] & 0xFFFF) >>> 31)) / 2) - 15;

    _StartSpriteAnim(sprite, args[1] | 0);

    sprite.data[5] = 120;
    sprite.data[3] = args[2] | 0;
    sprite.invisible = false;
  }

  sprite.data[0]++;

  // C : (data[0] + ((u16)data[0] >> 31)) / 2 (même idiome)
  sprite.data[1] = Math.trunc((sprite.data[0] + ((sprite.data[0] & 0xFFFF) >>> 31)) / 2);
  let index = (sprite.data[0] * 3) + (sprite.data[3] & 0xFFFF); // + (u16)data[3]
  const var2 = 0xFF;
  sprite.data[6] = (sprite.data[6] + 10) & 0xFF;

  index &= var2;
  sprite.x2 = Cos(index, 100);

  sprite.y2 = sprite.data[1] + Sin(index, 10) + Cos(sprite.data[6], 4);

  if (sprite.data[0] > sprite.data[5]) {
    sprite.callback = AnimPerishSongMusicNote_Step1;

    sprite.data[0] = 0;
    SetSpritePrimaryCoordsFromSecondaryCoords(sprite as never);
    sprite.data[2] = 5;
    sprite.data[4] = 0;
    sprite.data[3] = 0;

    _StartSpriteAffineAnim(sprite, 1);
  }
}

/** 1:1 `AnimPerishSongMusicNote_Step1` (battle_anim_effects_2.c:3764). */
function AnimPerishSongMusicNote_Step1(sprite: _VSprite): void {
  if (++sprite.data[0] > 10) {
    sprite.data[0] = 0;
    sprite.callback = AnimPerishSongMusicNote_Step2;
  }
}

/** 1:1 `AnimPerishSongMusicNote_Step2` (battle_anim_effects_2.c:3773) : chute
 *  accélérée (data[2]++) avec rebonds (data[2] = data[4]-5 quand y2 > 48) ;
 *  après 4 rebonds → destroy. */
function AnimPerishSongMusicNote_Step2(sprite: _VSprite): void {
  sprite.data[3] += sprite.data[2];
  sprite.y2 = sprite.data[3];

  sprite.data[2]++;

  if (sprite.data[3] > 48 && sprite.data[2] > 0) {
    sprite.data[2] = sprite.data[4] - 5;
    sprite.data[4]++;
  }

  if (sprite.data[4] > 3) {
    sprite.invisible = (sprite.data[2] % 2) !== 0;
    _vItf().DestroyAnimSprite?.(sprite);
    // C : DestroySprite memset le sprite → data[4]=0 → le `if (data[4] == 4)
    // DestroyAnimSprite` qui suit dans le .c ne refire JAMAIS (transcrit en return).
    return;
  }

  if (sprite.data[4] === 4) {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimGuardRing` (battle_anim_effects_2.c:3798) : anneau Safeguard posé
 *  sous l'attaquant (y+40) qui monte de 72px en 13 frames puis se détruit
 *  (double : position moyenne + affine anim 1, branche morte en singles). */
function AnimGuardRing(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0 && _IsBattlerSpriteVisible(_BATTLE_PARTNER(attacker))) {
    const avg = _SetAverageBattlerPositions(attacker, false); // C : &sprite->x, &sprite->y
    sprite.x = avg.x;
    sprite.y = avg.y;
    sprite.y += 40;

    _StartSpriteAffineAnim(sprite, 1);
  } else {
    sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X);
    sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y) + 40;
  }

  sprite.data[0] = 13;
  sprite.data[2] = sprite.x;
  sprite.data[4] = sprite.y - 72;

  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
}

// ═════════════════════════════════════════════════════════════════════════════
// Enregistrement par nom C exact (templates générés → bridge).
// ═════════════════════════════════════════════════════════════════════════════
registerAnimCallbacks({
  AnimAngerMark: AnimAngerMark as never,
  AnimBlendThinRing: AnimBlendThinRing as never,
  AnimHyperVoiceRing: AnimHyperVoiceRing as never,
  AnimUproarRing: AnimUproarRing as never,
  AnimSoftBoiledEgg: AnimSoftBoiledEgg as never,
  AnimMagentaHeart: AnimMagentaHeart as never,
  AnimRedHeartProjectile: AnimRedHeartProjectile as never,
  AnimRedHeartRising: AnimRedHeartRising as never,
  AnimOrbitFast: AnimOrbitFast as never,
  AnimOrbitScatter: AnimOrbitScatter as never,
  AnimSpitUpOrb: AnimSpitUpOrb as never,
  AnimEyeSparkle: AnimEyeSparkle as never,
  AnimAngel: AnimAngel as never,
  AnimPinkHeart: AnimPinkHeart as never,
  AnimMovementWaves: AnimMovementWaves as never,
  AnimJaggedMusicNote: AnimJaggedMusicNote as never,
  AnimPerishSongMusicNote: AnimPerishSongMusicNote as never,
  AnimPerishSongMusicNote2: AnimPerishSongMusicNote2 as never,
  AnimGuardRing: AnimGuardRing as never,
});

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « orbes » (goal 2026-06-11) — AnimBreathPuff (battle_anim_effects_2.c:2255).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimBreathPuff` (battle_anim_effects_2.c:2255) : petit souffle du mon
 *  (Vantardise/Gonflette). Côté joueur : anim 0, X_2+32, vitesse +64 ; côté
 *  adverse : anim 1, X_2−32, −64. 52 frames de translation fixed-point
 *  (TranslateSpriteLinearFixedPoint) → DestroyAnimSprite. No args. */
function AnimBreathPuff(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  if (_GetBattlerSide(atk) === B_SIDE_PLAYER) {
    _StartSpriteAnim(sprite, 0);
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) + 32;
    sprite.data[1] = 64;
  } else {
    _StartSpriteAnim(sprite, 1);
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) - 32;
    sprite.data[1] = -64;
  }

  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  sprite.data[0] = 52;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
  sprite.callback = TranslateSpriteLinearFixedPoint as never;
}

registerAnimCallbacks({ AnimBreathPuff: AnimBreathPuff as never });

// ════════════════════════════════════════════════════════════════════════════
// Vague PAY DAY / BULLET SEED / HEAL BELL (2026-06-11, append-only) :
// AnimCoinThrow (:1778), AnimFallingCoin (+_Step :1801/:1808), AnimBulletSeed
// (+_Step1/_Step2 :1826/:1837/:1859), AnimHealBellMusicNote (:3055,
// +_SetMusicNotePalette :3048 + sMusicNotePaletteTagsTable :885).
// ════════════════════════════════════════════════════════════════════════════
import { AnimTranslateLinear_WithFollowup, TrySetSpriteRotScale } from './battle_anim_mons';

/** 1:1 BIOS `ArcTan2` + `ArcTan2Neg` (battle_anim_mons.c:1368) — même formule
 *  que battle_anim_effects_1b.ts:99 / battle_anim_effects_3.ts:351. */
function _ArcTan2Neg(x: number, y: number): number {
  const a = ((Math.atan2(y, x) / (2 * Math.PI)) * 65536) | 0;
  return (-a) & 0xFFFF;
}

/** 1:1 `InitAnimLinearTranslationWithSpeed` (battle_anim_mons.c:1155) :
 *  data[0] = VITESSE → convertie en durée ((|Δx|<<8)/vitesse), puis chaîne
 *  linéaire 8.8 standard. */
function _InitAnimLinearTranslationWithSpeed(sprite: _VSprite): void {
  const v1 = Math.abs(_toS16(sprite.data[2]) - _toS16(sprite.data[1])) << 8;
  sprite.data[0] = Math.trunc(v1 / _toS16(sprite.data[0]));
  InitAnimLinearTranslation(sprite as never);
}

/** 1:1 `InitAnimLinearTranslationWithSpeedAndPos` (battle_anim_mons.c:1162). */
function _InitAnimLinearTranslationWithSpeedAndPos(sprite: _VSprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  _InitAnimLinearTranslationWithSpeed(sprite);
  sprite.callback = AnimTranslateLinear_WithFollowup as never;
  AnimTranslateLinear_WithFollowup(sprite as never);
}

/** 1:1 `PlaySE12WithPanning` — route vers le SE runtime (pattern
 *  battle_anim_effects_3.ts:360) ; le pan (BattleAnimAdjustPanning) est ignoré
 *  par le wrapper __PlaySE. */
function _PlaySE12WithPanning(songId: number, _pan: number): void {
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(songId);
}
const SE_M_HORN_ATTACK = 166;       // include/constants/songs.h:173
const SOUND_PAN_TARGET_E2 = 63;     // include/battle_anim.h

/** 1:1 `AnimCoinThrow` (battle_anim_effects_2.c:1778) : la pièce de Pay Day —
 *  part de l'attaquant (args [x, y, tgtXOff(miroir côté), tgtYOff, vitesse]),
 *  rotation posée vers la cible (ArcTan2Neg + 0xC000), translation à vitesse
 *  constante (InitAnimLinearTranslationWithSpeedAndPos) → destroy. */
function AnimCoinThrow(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  let r6 = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  const r7 = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + (args[3] | 0);
  let arg2 = args[2] | 0;
  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) arg2 = -arg2; // C : gBattleAnimArgs[2] = -gBattleAnimArgs[2]
  r6 += arg2;
  const rot = (_ArcTan2Neg(r6 - sprite.x, r7 - sprite.y) + 0xC000) & 0xFFFF; // var += 0xC000
  const sid = (sprite as { spriteId?: number }).spriteId;
  if (sid !== undefined) TrySetSpriteRotScale(sid, false, 0x100, 0x100, rot);
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = r6;
  sprite.data[4] = r7;
  sprite.callback = _InitAnimLinearTranslationWithSpeedAndPos;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
}

/** 1:1 `AnimFallingCoin` (battle_anim_effects_2.c:1801) : pièce qui retombe —
 *  dérive X 0.5px/frame (miroir côté joueur) + 2 rebonds Sin d'amplitude
 *  divisée par 2 → destroy. */
function AnimFallingCoin(sprite: _VSprite): void {
  sprite.data[2] = -16;
  sprite.y += 8;
  sprite.invisible = false;
  sprite.callback = _AnimFallingCoin_Step;
}
/** 1:1 `AnimFallingCoin_Step` (:1808). */
function _AnimFallingCoin_Step(sprite: _VSprite): void {
  sprite.data[0] = _toS16(sprite.data[0] + 0x80);
  sprite.x2 = sprite.data[0] >> 8;
  if (_GetBattlerSide(_vItf().getAttacker?.() ?? 0) === B_SIDE_PLAYER)
    sprite.x2 = -sprite.x2;
  sprite.y2 = Sin(sprite.data[1] & 0xFF, sprite.data[2]);
  sprite.data[1] += 5;
  if (sprite.data[1] > 126) {
    sprite.data[1] = 0;
    sprite.data[2] = Math.trunc(sprite.data[2] / 2); // s16 /= 2 (troncature C)
    if (++sprite.data[3] === 2) _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimBulletSeed` (battle_anim_effects_2.c:1826) : graine Bullet Seed —
 *  translation attaquant→cible en 20 frames (affine en pause pendant le vol),
 *  puis rebond aléatoire (_Step1). */
function AnimBulletSeed(sprite: _VSprite): void {
  const target = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = 20;
  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.callback = StartAnimLinearTranslation as never;
  sprite.affineAnimPaused = true; // C : sprite->affineAnimPaused = 1
  StoreSpriteCallbackInData6(sprite as never, _AnimBulletSeed_Step1 as never);
}
/** 1:1 `AnimBulletSeed_Step1` (:1837) : SE corne + repose la position, zère
 *  data[0..7] (C : ptr[i-7]=0 sur &data[7]), tire l'amplitude data[6] =
 *  -12-(rand&7) et la vitesse data[7] = (rand%0xA0)+0xA0 (bit 0 = direction),
 *  relance l'affine. */
function _AnimBulletSeed_Step1(sprite: _VSprite): void {
  _PlaySE12WithPanning(SE_M_HORN_ATTACK, SOUND_PAN_TARGET_E2); // C : BattleAnimAdjustPanning(SOUND_PAN_TARGET)
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;
  for (let i = 0; i < 8; i++) sprite.data[i] = 0;
  let rand = Random2();
  sprite.data[6] = _toS16(0xFFF4 - (rand & 7));
  rand = Random2();
  sprite.data[7] = (rand % 0xA0) + 0xA0;
  sprite.callback = _AnimBulletSeed_Step2;
  sprite.affineAnimPaused = false;
}
/** 1:1 `AnimBulletSeed_Step2` (:1859) : zigzag horizontal 8.8 (bit 0 de data[7]
 *  = direction) + arche Sin (amplitude data[6] négative) ; destroy au bout
 *  d'une arche (data[3] == 1). */
function _AnimBulletSeed_Step2(sprite: _VSprite): void {
  sprite.data[0] = _toS16(sprite.data[0] + sprite.data[7]);
  sprite.x2 = sprite.data[0] >> 8;
  if (sprite.data[7] & 1) sprite.x2 = -sprite.x2;
  sprite.y2 = Sin(sprite.data[1] & 0xFF, sprite.data[6]);
  sprite.data[1] += 8;
  if (sprite.data[1] > 126) {
    sprite.data[1] = 0;
    sprite.data[2] = Math.trunc(sprite.data[2] / 2); // s16 /= 2 (troncature C)
    if (++sprite.data[3] === 1) _vItf().DestroyAnimSprite?.(sprite);
  }
}

// 1:1 `sMusicNotePaletteTagsTable` (battle_anim_effects_2.c:885) :
// [ANIM_TAG_MUSIC_NOTES_2, ANIM_SPRITES_START-1, ANIM_SPRITES_START-2] — les
// 2 derniers tags = palettes blend chargées par AnimTask_HealBellMusicNotePalettes
// (:3019, non porté).
const ANIM_TAG_MUSIC_NOTES_2 = 10206; // ANIM_SPRITES_START + 206
const sMusicNotePaletteTagsTable: ReadonlyArray<number> = [ANIM_TAG_MUSIC_NOTES_2, 9999, 9998];

/** 1:1 `SetMusicNotePalette` (battle_anim_effects_2.c:3048) : frame (tileNum +=
 *  32 si b impair, + a<<2) et palette (tag sMusicNotePaletteTagsTable[b>>1]).
 *  Dette douce : tags 9999/9998 non chargés (task non portée) →
 *  IndexOfSpritePaletteTag = 0xFF → palette non écrite (le C écrirait 15). */
function _SetMusicNotePalette(sprite: _VSprite, a: number, b: number): void {
  const tile = (b & 1) ? 32 : 0;
  _oamTileNumAdd(sprite, tile + (a << 2));
  let index = IndexOfSpritePaletteTag(sMusicNotePaletteTagsTable[b >> 1]);
  if (index === 0xFF && (b >> 1) === 0) index = IndexOfSpritePaletteTag('ANIM_TAG_MUSIC_NOTES_2');
  if (index !== 0xFF) {
    const oam = _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
    if (oam) oam.paletteBank = index & 0xF;
  }
}

/** 1:1 `AnimHealBellMusicNote` (battle_anim_effects_2.c:3055) : note de Heal
 *  Bell — part de l'attaquant (args [x, y, tgtXOff(miroir côté), tgtYOff,
 *  durée, frame a, palette b]), translation linéaire → destroy. */
function AnimHealBellMusicNote(sprite: _VSprite): void {
  const args = _args();
  const attacker = _vItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, false);
  let arg2 = args[2] | 0;
  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) arg2 = -arg2; // C : gBattleAnimArgs[2] = -gBattleAnimArgs[2]
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X) + arg2;
  sprite.data[4] = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y) + (args[3] | 0);
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
  _SetMusicNotePalette(sprite, args[5] | 0, args[6] | 0);
}

registerAnimCallbacks({
  AnimCoinThrow: AnimCoinThrow as never,
  AnimFallingCoin: AnimFallingCoin as never,
  AnimBulletSeed: AnimBulletSeed as never,
  AnimHealBellMusicNote: AnimHealBellMusicNote as never,
});

// ════════════════════════════════════════════════════════════════════════════
// AnimParticleBurst (battle_anim_effects_2.c:3200, PUBLIC dans le .c) —
// gRedHeartBurstSpriteTemplate (Attract) + sUnusedStarBurstSpriteTemplate.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimParticleBurst` (battle_anim_effects_2.c:3200) : particule éjectée —
 *  dérive X fixed-point (data[4] s16, >>8) + onde Sin(data[3], args[1]) en Y ;
 *  scintille (invisible = data[3] % 2) après data[3] > 100, destroy à > 120.
 *  args [vitesseX (8.8), amplitude onde]. data[0] = latch d'init (1er tick). */
function AnimParticleBurst(sprite: _VSprite): void {
  if (sprite.data[0] === 0) {
    sprite.data[1] = _args()[0] | 0;
    sprite.data[2] = _args()[1] | 0;
    sprite.invisible = false; // setup visible (pattern repo — le C n'y touche pas)
    sprite.data[0]++;
  } else {
    sprite.data[4] = _toS16(sprite.data[4] + sprite.data[1]); // s16 += s16 (wrap 1:1)
    sprite.x2 = sprite.data[4] >> 8;
    sprite.y2 = Sin(sprite.data[3] & 0xFF, sprite.data[2]);
    sprite.data[3] = (sprite.data[3] + 3) & 0xFF;
    if (sprite.data[3] > 100)
      sprite.invisible = (sprite.data[3] % 2) !== 0;

    if (sprite.data[3] > 120)
      _vItf().DestroyAnimSprite?.(sprite);
  }
}

registerAnimCallbacks({ AnimParticleBurst: AnimParticleBurst as never });

// ─── AnimTask_Splash 1:1 (effects_2.c:2161-2231) — la riposte du Wailord ! ──
// Le mon s'écrase/rebondit N fois (args: battler, count). Affine par task-data
// (PrepareAffineAnimInTaskData) + montée y2 progressive puis retour.
import {
  PrepareAffineAnimInTaskData as _spPrep, RunAffineAnimFromTaskData as _spRun,
} from './battle_anim_mons';
import { BATTLE_ANIM_AFFINE_ANIMS as _spTables } from '../engine/decomp-data/auto/src/battle-anim-sprites';

type _SpTask = { taskId: number; data: number[]; func?: unknown };
function _spItf2(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
// 1:1 GetAnimBattlerSpriteId local (le stub surface rend -1 — pattern mon_movement)
function _spBattlerSpriteId(animBattler: number): number {
  const itf = _spItf2();
  const b = animBattler === 0 ? (itf.getAttacker?.() ?? 0) : animBattler === 1 ? (itf.getTarget?.() ?? 1) : -1;
  if (b < 0) return 0xFF;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
function AnimTask_Splash(task: _SpTask): void {
  const itf = _spItf2();
  const args = itf.getArgs?.() ?? [0, 0];
  if (!args[1]) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const spriteId = _spBattlerSpriteId(args[0]);
  if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = args[1];
  task.data[3] = 0;
  task.data[4] = 0;
  _spPrep(task, spriteId, (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gSplashEffectAffineAnimCmds']);
  task.func = AnimTask_Splash_Step;
  AnimTask_Splash_Step(task);
}
function AnimTask_Splash_Step(task: _SpTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites: Map<number, { y2: number }> } | undefined;
  const sprite = rt?.gSprites?.get(task.data[0]);
  if (!sprite) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[1]) {
    case 0:
      _spRun(task);
      task.data[4] += 3;
      sprite.y2 += task.data[4];
      if (++task.data[3] > 7) { task.data[3] = 0; task.data[1]++; }
      break;
    case 1:
      _spRun(task);
      sprite.y2 += task.data[4];
      if (++task.data[3] > 7) { task.data[3] = 0; task.data[1]++; }
      break;
    case 2:
      if (task.data[4] !== 0) { sprite.y2 -= 2; task.data[4] -= 2; }
      else task.data[1]++;
      break;
    case 3:
      if (!_spRun(task)) {
        if (--task.data[2] === 0) {
          sprite.y2 = 0;
          _spItf2().DestroyAnimVisualTask?.(task.taskId);
        } else {
          _spPrep(task, task.data[0], (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gSplashEffectAffineAnimCmds']);
          task.data[1] = 0;
        }
      }
      break;
  }
}
import { registerAnimTasks as _regTasks } from '../engine/battle/battle-anim-registry';
/** 1:1 `AnimTask_GrowAndShrink` (effects_2.c — Swords Dance/Howl…, 2 hits) :
 *  l attaquant grossit puis revient (table affine task-data). */
function AnimTask_GrowAndShrink(task: _SpTask): void {
  const spriteId = _spBattlerSpriteId(0 /* ANIM_ATTACKER */);
  if (spriteId === 0xFF) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  _spPrep(task, spriteId, (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gGrowAndShrinkAffineAnimCmds']);
  task.func = _GrowAndShrink_Step;
}
function _GrowAndShrink_Step(task: _SpTask): void {
  if (!_spRun(task)) _spItf2().DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_StretchTargetUp`/`StretchAttackerUp` (effects_2.c, 3+1 hits) :
 *  le mon s'étire vers le haut (table affine) en tremblant x2 ±4. */
function _StretchUp(task: _SpTask, animBattler: number): void {
  const spriteId = _spBattlerSpriteId(animBattler);
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number; y2: number }> } | undefined;
  const sp = rt?.gSprites?.get(spriteId);
  if (!sp || spriteId === 0xFF) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  if (++task.data[0] === 1) {
    _spPrep(task, spriteId, (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['sAffineAnims_StretchBattlerUp']);
    sp.x2 = 4;
  } else {
    sp.x2 = -sp.x2;
    if (!_spRun(task)) {
      sp.x2 = 0;
      sp.y2 = 0;
      _spItf2().DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
function AnimTask_StretchTargetUp(task: _SpTask): void { _StretchUp(task, 1); }
function AnimTask_StretchAttackerUp(task: _SpTask): void { _StretchUp(task, 0); }
/** 1:1 `AnimTask_UproarDistortion` (effects_2.c, 3 hits) : distorsion
 *  rot-scale oscillante du mon (8 steps). */
function AnimTask_UproarDistortion(task: _SpTask): void {
  const spriteId = _spBattlerSpriteId(0);
  if (spriteId === 0xFF) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  _spPrep(task, spriteId, (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['sAffineAnims_UproarDistortion'] ?? (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gUproarAffineAnimCmds']);
  task.func = _Uproar_Step;
}
function _Uproar_Step(task: _SpTask): void {
  if (!_spRun(task)) _spItf2().DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_ThrashMoveMonHorizontal` (effects_2.c:2304 — Thrash) :
 *  table affine gThrashMoveMonAffineAnimCmds. */
function AnimTask_ThrashMoveMonHorizontal(task: _SpTask): void {
  const spriteId = _spBattlerSpriteId(0);
  if (spriteId === 0xFF) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = spriteId;
  task.data[1] = 0;
  _spPrep(task, spriteId, (_spTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gThrashMoveMonAffineAnimCmds']);
  task.func = _ThrashH_Step;
}
function _ThrashH_Step(task: _SpTask): void {
  if (!_spRun(task)) _spItf2().DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_ThrashMoveMonVertical` : zigzag x ±4 (3 phases ×3 reps) +
 *  bob y ±2 toutes les 3 frames. ATTENTION : modifie x/y ABSOLUS du mon (1:1). */
function AnimTask_ThrashMoveMonVertical(task: _SpTask): void {
  const spriteId = _spBattlerSpriteId(0);
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x: number; y: number }> } | undefined;
  const sp = rt?.gSprites?.get(spriteId);
  if (!sp || spriteId === 0xFF) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = 4;
  task.data[3] = 7;
  task.data[4] = 3;
  task.data[5] = sp.x;
  task.data[6] = sp.y;
  task.data[7] = 0;
  task.data[8] = 0;
  task.data[9] = 2;
  const itf = _spItf2() as { getAttacker?: () => number };
  if (((itf.getAttacker?.() ?? 0) & 1) === 1) task.data[2] *= -1;
  task.func = _ThrashV_Step;
}
function _ThrashV_Step(task: _SpTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x: number; y: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[0]);
  if (!sp) { _spItf2().DestroyAnimVisualTask?.(task.taskId); return; }
  if (++task.data[7] > 2) {
    task.data[7] = 0;
    task.data[8]++;
    if (task.data[8] & 1) sp.y += task.data[9];
    else sp.y -= task.data[9];
  }
  switch (task.data[1]) {
    case 0:
      sp.x += task.data[2];
      if (--task.data[3] === 0) { task.data[3] = 14; task.data[1] = 1; }
      break;
    case 1:
      sp.x -= task.data[2];
      if (--task.data[3] === 0) { task.data[3] = 7; task.data[1] = 2; }
      break;
    case 2:
      sp.x += task.data[2];
      if (--task.data[3] === 0) {
        if (--task.data[4] !== 0) { task.data[3] = 7; task.data[1] = 0; }
        else {
          if ((task.data[8] & 1) !== 0) sp.y -= task.data[9];
          _spItf2().DestroyAnimVisualTask?.(task.taskId);
        }
      }
      break;
  }
}
_regTasks({
  AnimTask_ThrashMoveMonHorizontal: AnimTask_ThrashMoveMonHorizontal as never,
  AnimTask_ThrashMoveMonVertical: AnimTask_ThrashMoveMonVertical as never,
  AnimTask_Splash: AnimTask_Splash as never,
  AnimTask_GrowAndShrink: AnimTask_GrowAndShrink as never,
  AnimTask_StretchTargetUp: AnimTask_StretchTargetUp as never,
  AnimTask_StretchAttackerUp: AnimTask_StretchAttackerUp as never,
  AnimTask_UproarDistortion: AnimTask_UproarDistortion as never,
});

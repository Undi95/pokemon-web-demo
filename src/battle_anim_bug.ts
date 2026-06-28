/**
 * battle_anim_bug.ts — miroir PARTIEL de `src/battle_anim_bug.c` (décomp
 * pokeemeraude), port massif 2026-06-11.
 *
 * Portés (callbacks sprites, mêmes noms C) :
 *   - AnimMegahornHorn (:199)            — corne Mégacorne (translation linéaire)
 *   - AnimLeechLifeNeedle (:229)         — aiguille Vampirisme
 *   - AnimTranslateWebThread (+_Step, :258) — fil Sécrétion/Toile (vitesse + onde Sin)
 *   - AnimStringWrap (+_Step, :298)      — ficelle phase 2 (clignote 51 frames)
 *   - AnimSpiderWeb (+_Step/_End, :329)  — toile pleine en blend OBJ → fade-out
 *   - AnimTranslateStinger (:366)        — dard linéaire à rotation initiale
 *   - AnimMissileArc (+_Step, :414)      — missile en arc + rotation lookahead
 *
 * AnimTailGlowOrb (:470) — porté (vague orbes 2026-06-11, en fin de fichier).
 *
 * Helpers C transcrits localement (absents de battle_anim_mons.ts, préfixés _) :
 *   _GetBattlerSpriteCoord2, _SetAverageBattlerPositions,
 *   _InitAnimLinearTranslationWithSpeed, _ArcTan2Neg (cf. docstrings).
 */
import { registerAnimCallbacks } from './battle_anim';
import {
  GetBattlerSpriteCoord,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
  InitSpritePosToAnimAttacker,
  StartAnimLinearTranslation, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  InitAnimLinearTranslation, AnimTranslateLinear,
  InitAnimArcTranslation, TranslateAnimHorizontalArc,
  TrySetSpriteRotScale, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Sin } from './trig';
import { ArcTan2 } from '../harness/runtime/decomp-bridge';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT } from './engine/battle/util';
import { gBattleTypeFlags } from './engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from './engine/battle/constants';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _vItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

// ─── Petits helpers 1:1 locaux ──────────────────────────────────────────────

/** Réinterprète les 16 bits bas en s16 signé (= cast (s16) décomp). */
function _toS16(v: number): number { return (v << 16) >> 16; }

/** 1:1 `IsContest()` (battle_anim.c) = !gMain.inBattle — pas de mode contest
 *  dans ce jeu (post-camion) → toujours false (même modèle que battle_anim_mons.ts:244). */
function _IsContest(): boolean { return false; }

/** 1:1 `GetBattlerSide(battler)` = GetBattlerPosition(battler) & BIT_SIDE (0 = B_SIDE_PLAYER). */
function _GetBattlerSide(battler: number): number { return GetBattlerPosition(battler) & 1; }

/** 1:1 battle_util.c `IsDoubleBattle()` = gBattleTypeFlags & BATTLE_TYPE_DOUBLE. */
function _IsDoubleBattle(): boolean { return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0; }

/** 1:1 macro battle.h `BATTLE_PARTNER(battler)` = battler ^ BIT_FLANK (2). */
function _BATTLE_PARTNER(battler: number): number { return battler ^ 2; }

/** 1:1 `GetBattlerSpriteCoord2(battler, coordType)` (battle_anim_mons.c:294) :
 *  identique à GetBattlerSpriteCoord SAUF la source de species pour
 *  Y_PIC_OFFSET(_DEFAULT) : gAnimBattlerSpecies[battler] (snapshot au lancement
 *  de l'anim) au lieu de la party live. Notre interpreter ne remplit PAS
 *  gAnimBattlerSpecies (fill commenté, battle-anim-interpreter.ts:446) et
 *  Transform/Contest ne sont pas modélisés → valeur strictement identique via
 *  délégation (dette douce documentée). */
function _GetBattlerSpriteCoord2(battler: number, coordType: number): number {
  return GetBattlerSpriteCoord(battler, coordType);
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

/** 1:1 `InitAnimLinearTranslationWithSpeed(sprite)` (battle_anim_mons.c:1155) :
 *  data[0] = VITESSE → recalculé en nb de frames (|destX-startX|<<8 / vitesse),
 *  puis InitAnimLinearTranslation. */
function _InitAnimLinearTranslationWithSpeed(sprite: _VSprite): void {
  const v1 = Math.abs(_toS16(sprite.data[2]) - _toS16(sprite.data[1])) << 8;   // int v1 = abs(data[2]-data[1]) << 8;
  sprite.data[0] = _toS16(Math.trunc(v1 / _toS16(sprite.data[0]))) ;           // data[0] = v1 / data[0]; (s16)
  InitAnimLinearTranslation(sprite as never);
}

/** 1:1 `ArcTan2Neg(x, y)` (battle_anim_mons.c:1368) : u16 var = ArcTan2(x,y) ; return -var. */
function _ArcTan2Neg(x: number, y: number): number {
  return (-ArcTan2(x, y)) & 0xFFFF;
}

/** 1:1 sprite.c `StartSpriteAffineAnim(sprite, n)` : champs PLATS du runtime. */
function _StartSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** `DestroyAnimSprite` via la surface lazy (anti-cycle ESM). */
function _DestroyAnimSprite(sprite: unknown): void {
  _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `SetGpuReg(reg, value)` via runtime (pattern battle_anim_throw.ts:950). */
function _SetGpuReg(reg: number, value: number): void {
  getRuntime()?.SetGpuReg?.(reg, value & 0xFFFF);
}

/** 1:1 macro io_reg.h `BLDALPHA_BLEND(target1, target2)` = (target2 << 8) | target1. */
function _BLDALPHA_BLEND(target1: number, target2: number): number {
  return (target1 | (target2 << 8)) & 0xFFFF;
}

/** spriteId du sprite anim (posé par l'interpreter à la création — :987). */
function _spriteIdOf(sprite: unknown): number {
  return (sprite as { spriteId?: number }).spriteId ?? -1;
}

// ─── Callbacks 1:1 ──────────────────────────────────────────────────────────

/** 1:1 `AnimMegahornHorn` (battle_anim_bug.c:199) : corne Mégacorne — pose près
 *  de la CIBLE (X_2/Y_PIC_OFFSET + x1,y1), translation linéaire vers (x2,y2) ;
 *  affine 1 + miroir des 4 offsets si cible côté joueur.
 *  args [x1, y1, x2, y2, duration]. */
function AnimMegahornHorn(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 6];
  const target = _vItf().getTarget?.() ?? 1;
  if (_IsContest()) {
    _StartSpriteAffineAnim(sprite, 2);
    args[2] = -args[2];   // cmd->x2 = -cmd->x2;
    args[0] = -args[0];   // cmd->x1 = -cmd->x1;
  } else if (_GetBattlerSide(target) === 0 /* B_SIDE_PLAYER */) {
    _StartSpriteAffineAnim(sprite, 1);
    args[1] = -args[1];   // cmd->y1 = -cmd->y1;
    args[2] = -args[2];   // cmd->x2 = -cmd->x2;
    args[3] = -args[3];   // cmd->y2 = -cmd->y2;
    args[0] = -args[0];   // cmd->x1 = -cmd->x1;
  }

  sprite.x = _GetBattlerSpriteCoord2(target, BATTLER_COORD_X_2) + args[0];
  sprite.y = _GetBattlerSpriteCoord2(target, BATTLER_COORD_Y_PIC_OFFSET) + args[1];
  sprite.data[0] = args[4];

  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2) + args[2];
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];

  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimLeechLifeNeedle` (battle_anim_bug.c:229) : aiguille Vampirisme —
 *  part de (cible + x,y), translation linéaire vers le centre cible.
 *  args [x, y, duration]. */
function AnimLeechLifeNeedle(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 6];
  const target = _vItf().getTarget?.() ?? 1;
  if (_IsContest()) {
    args[0] = -args[0];   // cmd->x = -cmd->x;
    _StartSpriteAffineAnim(sprite, 2);
  } else if (_GetBattlerSide(target) === 0 /* B_SIDE_PLAYER */) {
    args[1] = -args[1];   // cmd->y = -cmd->y;
    args[0] = -args[0];   // cmd->x = -cmd->x;
  }

  sprite.x = _GetBattlerSpriteCoord2(target, BATTLER_COORD_X_2) + args[0];
  sprite.y = _GetBattlerSpriteCoord2(target, BATTLER_COORD_Y_PIC_OFFSET) + args[1];
  sprite.data[0] = args[2];

  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);

  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimTranslateWebThread` (battle_anim_bug.c:258) : fil de toile
 *  attaquant→cible (Sécrétion/Toile phase 1). args [x, y, unk2(vitesse),
 *  amplitude, targetsBoth]. */
function AnimTranslateWebThread(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 20, 10, 0];
  const target = _vItf().getTarget?.() ?? 1;
  if (_IsContest()) args[2] = Math.trunc(args[2] / 2);   // cmd->unk2 /= 2;

  InitSpritePosToAnimAttacker(sprite, true);
  sprite.data[0] = args[2];
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;

  if (!args[4]) {
    sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);
  } else {
    const avg = _SetAverageBattlerPositions(target, true);
    sprite.data[2] = avg.x;
    sprite.data[4] = avg.y;
  }

  _InitAnimLinearTranslationWithSpeed(sprite);
  sprite.data[5] = args[3];
  sprite.invisible = false;
  sprite.callback = AnimTranslateWebThread_Step;
}

/** 1:1 `AnimTranslateWebThread_Step` (battle_anim_bug.c:285) : translation +
 *  onde Sin(data[6], data[5]) sur x2, pas de phase +13. */
function AnimTranslateWebThread_Step(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    _DestroyAnimSprite(sprite);
    return;
  }

  sprite.x2 += Sin(sprite.data[6] & 0xFF, sprite.data[5]);
  sprite.data[6] = (sprite.data[6] + 13) & 0xFF;
}

/** 1:1 `AnimStringWrap` (battle_anim_bug.c:298) : ficelle (Sécrétion phase 2)
 *  posée sur la position MOYENNE des cibles (+8 si côté joueur). args [x, y]. */
function AnimStringWrap(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;

  const avg = _SetAverageBattlerPositions(target, false);
  sprite.x = avg.x;
  sprite.y = avg.y;
  if (_GetBattlerSide(attacker) !== 0) sprite.x -= args[0];
  else sprite.x += args[0];

  sprite.y += args[1];
  if (_GetBattlerSide(target) === 0 /* B_SIDE_PLAYER */) sprite.y += 8;

  sprite.invisible = false;
  sprite.callback = AnimStringWrap_Step;
}

/** 1:1 `AnimStringWrap_Step` (battle_anim_bug.c:315) : toggle invisible toutes
 *  les 3 frames ; destroy à la frame 51. */
function AnimStringWrap_Step(sprite: _VSprite): void {
  if (++sprite.data[0] === 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;   // sprite->invisible ^= 1;
  }

  if (++sprite.data[1] === 51) {
    _DestroyAnimSprite(sprite);
  }
}

/** 1:1 `AnimSpiderWeb` (battle_anim_bug.c:329) : toile — blend OBJ sur tout
 *  (BLDCNT = TGT2_ALL | EFFECT_BLEND, alpha 16/0), puis fade-out par étapes. */
function AnimSpiderWeb(sprite: _VSprite): void {
  _SetGpuReg(0x50 /* REG_OFFSET_BLDCNT */, 0x3F00 | 0x40 /* BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND */);
  _SetGpuReg(0x52 /* REG_OFFSET_BLDALPHA */, _BLDALPHA_BLEND(16, 0));

  sprite.data[0] = 16;
  sprite.invisible = false;
  sprite.callback = AnimSpiderWeb_Step;
}

/** 1:1 `AnimSpiderWeb_Step` (battle_anim_bug.c:338) : 20 frames pleines puis
 *  décrément alpha 1 frame sur 2 → invisible → End. */
function AnimSpiderWeb_Step(sprite: _VSprite): void {
  if (sprite.data[2] < 20) {
    sprite.data[2]++;
  } else if (sprite.data[1]++ & 1) {
    sprite.data[0]--;
    _SetGpuReg(0x52 /* REG_OFFSET_BLDALPHA */, _BLDALPHA_BLEND(sprite.data[0], 16 - sprite.data[0]));

    if (sprite.data[0] === 0) {
      sprite.invisible = true;
      sprite.callback = AnimSpiderWeb_End;
    }
  }
}

/** 1:1 `AnimSpiderWeb_End` (battle_anim_bug.c:357) : reset BLDCNT/BLDALPHA + destroy. */
function AnimSpiderWeb_End(sprite: _VSprite): void {
  _SetGpuReg(0x50 /* REG_OFFSET_BLDCNT */, 0);
  _SetGpuReg(0x52 /* REG_OFFSET_BLDALPHA */, 0);
  _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimTranslateStinger` (battle_anim_bug.c:366) : dard (Dard-Venin & co)
 *  translaté linéairement — rotation initiale ArcTan2Neg(Δ) + 0xC000 pour
 *  paraître voler droit. args [initialX, intialY, targetX, targetY, duration]. */
function AnimTranslateStinger(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 6];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;

  if (_IsContest()) {
    args[2] = -args[2];   // cmd->targetX = -cmd->targetX;
  } else {
    if (_GetBattlerSide(attacker) !== 0) {
      args[2] = -args[2];   // cmd->targetX = -cmd->targetX;
      args[1] = -args[1];   // cmd->intialY = -cmd->intialY;
      args[3] = -args[3];   // cmd->targetY = -cmd->targetY;
    }
  }

  if (!_IsContest() && _GetBattlerSide(attacker) === _GetBattlerSide(target)) {
    if (GetBattlerPosition(target) === B_POSITION_PLAYER_LEFT
     || GetBattlerPosition(target) === B_POSITION_OPPONENT_LEFT) {
      args[2] *= -1;   // cmd->targetX *= -1;
      args[0] *= -1;   // cmd->initialX *= -1;
    }
  }

  InitSpritePosToAnimAttacker(sprite, true);

  const lVarX = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2) + args[2];
  const lVarY = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];
  let rot = _ArcTan2Neg(lVarX - sprite.x, lVarY - sprite.y);
  rot = (rot + 0xC000) & 0xFFFF;
  TrySetSpriteRotScale(_spriteIdOf(sprite), false, 0x100, 0x100, rot);

  sprite.data[0] = args[4];
  sprite.data[2] = lVarX;
  sprite.data[4] = lVarY;

  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimMissileArc` (battle_anim_bug.c:414) : missile en arc (Pin Missile /
 *  Icicle Spear) — arc horizontal + rotation continue dans _Step.
 *  args [initialX, intialY, targetX, targetY, duration, waveAmplitude]. */
function AnimMissileArc(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 30, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;

  InitSpritePosToAnimAttacker(sprite, true);

  if (_GetBattlerSide(attacker) !== 0) args[2] = -args[2];   // cmd->targetX = -cmd->targetX;

  sprite.data[0] = args[4];
  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2) + args[2];
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];
  sprite.data[5] = args[5];
  InitAnimArcTranslation(sprite as never);

  sprite.callback = AnimMissileArc_Step;
  sprite.invisible = true;   // 1:1 : invisible la 1re frame, _Step le rend visible.
}

/** 1:1 `AnimMissileArc_Step` (battle_anim_bug.c:433) : avance l'arc ; oriente le
 *  sprite via un pas de LOOKAHEAD (sauve data[0..7], avance encore, ArcTan2Neg
 *  du delta + 0xC000, restaure data — x2/y2 du lookahead CONSERVÉS, comme la
 *  décomp qui ne les restaure pas). */
function AnimMissileArc_Step(sprite: _VSprite): void {
  sprite.invisible = false;

  if (TranslateAnimHorizontalArc(sprite as never)) {
    _DestroyAnimSprite(sprite);
  } else {
    const tempData: number[] = new Array(8);
    const data = sprite.data;
    const x1 = sprite.x;      // u16 x1 = sprite->x;
    let x2 = sprite.x2;       // s16 x2 = sprite->x2;
    const y1 = sprite.y;      // u16 y1 = sprite->y;
    let y2 = sprite.y2;       // s16 y2 = sprite->y2;

    for (let i = 0; i < 8; i++) tempData[i] = data[i];

    x2 += x1;
    y2 += y1;

    if (!TranslateAnimHorizontalArc(sprite as never)) {
      let rotation = _ArcTan2Neg(sprite.x + sprite.x2 - x2, sprite.y + sprite.y2 - y2);
      rotation = (rotation + 0xC000) & 0xFFFF;
      TrySetSpriteRotScale(_spriteIdOf(sprite), false, 0x100, 0x100, rotation);

      for (let i = 0; i < 8; i++) data[i] = tempData[i];
    }
  }
}

registerAnimCallbacks({
  AnimMegahornHorn: AnimMegahornHorn as never,
  AnimLeechLifeNeedle: AnimLeechLifeNeedle as never,
  AnimTranslateWebThread: AnimTranslateWebThread as never,
  AnimStringWrap: AnimStringWrap as never,
  AnimSpiderWeb: AnimSpiderWeb as never,
  AnimTranslateStinger: AnimTranslateStinger as never,
  AnimMissileArc: AnimMissileArc as never,
});

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « orbes » (goal 2026-06-11) — AnimTailGlowOrb (battle_anim_bug.c:470).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729).
 *  Adaptation repo : pas de table affine → ended immédiat (leçon « affine sans
 *  table », pattern battle_anim_ice.ts:135). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _VSprite): void {
  const spF = sprite as { affineAnimEnded?: boolean; affineAnimsTableName?: string | null };
  if (spF.affineAnimEnded || !spF.affineAnimsTableName) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `AnimTailGlowOrb` (battle_anim_bug.c:470) : l'orbe de Lumiqueue se pose
 *  sur le battler choisi (arg 0 = relativeTo : 0 attaquant / 1 cible) à
 *  Y_PIC_OFFSET+18 ; l'affine du template (sAffineAnims_TailGlowOrb — grossit
 *  puis pulse) se joue → fin d'affine → DestroySpriteAndMatrix. */
function AnimTailGlowOrb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0 /* cmd->relativeTo == ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) + 18;
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + 18;
  }
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

registerAnimCallbacks({ AnimTailGlowOrb: AnimTailGlowOrb as never });

/**
 * battle_anim_ice.ts — miroir PARTIEL de `src/battle_anim_ice.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Callbacks portés 1:1 (+ steps statiques privés) :
 *   - AnimIcePunchSwirlingParticle (:592) — cristaux tournoyants Ice Punch
 *   - AnimIceBeamParticle          (:610) — particules du rayon Ice Beam
 *   - AnimIceEffectParticle        (:631) + AnimFlickerIceEffectParticle (:651)
 *   - AnimSwirlingSnowball         (:666) + _Step1 (:723) + _Step2 (:742) + _End (:766)
 *   - InitSwirlingFogAnim          (:904) + AnimSwirlingFogAnim (:972) — Mist/Smog
 *   - InitIceBallAnim             (:1538) + AnimThrowIceBall (:1563) — Ice Ball
 *   - InitIceBallParticle         (:1574) + AnimIceBallParticle (:1593)
 *
 * Helpers battle_anim_mons.c absents de src/game/battle_anim_mons.ts →
 * transcrits localement (préfixe _, mêmes corps, références de ligne) :
 *   _TranslateSpriteInGrowingCircle (:468), _RunStoredCallbackWhenAffineAnimEnds
 *   (:729), _RunStoredCallbackWhenAnimEnds (:735), _InitAnimFastLinearTranslation
 *   (:1171), _AnimFastTranslateLinear (:1208), _AnimFastTranslateLinearWaitEnd
 *   (:1237), _InitAnimFastLinearTranslationWithSpeed (:1244),
 *   _InitAnimFastLinearTranslationWithSpeedAndPos (:1251),
 *   _GetBattlerSpriteBGPriority (:2063), _SetAverageBattlerPositions (:2289).
 *
 * Adaptations documentées (dettes douces) :
 *   - gAnimDisableStructPtr (décomp : DisableStruct de l'attaquant copié dans
 *     gBattleBufferA[..][16] par les controllers) → gDisableStructs[attacker]
 *     (même donnée source côté TS).
 *   - GetAnimBgAttribute(N, BG_ANIM_PRIORITY) → constantes 1 (BG1) / 2 (BG2),
 *     celles que pose le setup anim du runtime (_setAnimBgAttribute) = vanilla.
 *   - sprite->oam.priority / oam.tileNum → écriture OAM brute via oamIndex
 *     (précédent : battle_anim_effects_3.ts).
 *   - IsContest() = false (pas de concours dans ce runtime).
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord,
  InitSpritePosToAnimAttacker,
  InitSpritePosToAnimTarget,
  StartAnimLinearTranslation,
  InitAnimLinearTranslation,
  AnimTranslateLinear,
  InitAnimArcTranslation,
  TranslateAnimHorizontalArc,
  StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6,
  DestroySpriteAndMatrix,
  BATTLER_COORD_X,
  BATTLER_COORD_Y,
  BATTLER_COORD_X_2,
  BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { Random2 } from './random';
import { gBattleTypeFlags, gDisableStructs } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE, BIT_FLANK } from '../engine/battle/constants';
import { GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT } from '../engine/battle/util';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _vItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** Réinterprète les 16 bits bas en s16 signé (= cast (s16) décomp). */
function _s16(v: number): number {
  return (v << 16) >> 16;
}

/** Wrapper nommé : DestroyAnimSprite stockable en data6 (décomp passe le ptr fonction). */
function _DestroyAnimSpriteCb(sprite: _VSprite): void {
  _vItf().DestroyAnimSprite?.(sprite);
}

/** Helper IsDoubleBattle (1:1 décomp battle_util) : gBattleTypeFlags & BATTLE_TYPE_DOUBLE. */
function _IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

/** StartSpriteAnim (pattern repo) : pose animNum/animBeginning sur la table du sprite. */
function _StartSpriteAnim(sprite: _VSprite, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) {
    spA.animNum = n;
    spA.animBeginning = true;
    spA.animEnded = false;
  }
}

/** StartSpriteAffineAnim (pattern repo) : pose affineAnimNum/affineAnimBeginning. */
function _StartSpriteAffineAnim(sprite: _VSprite, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** Écrit la priorité OBJ dans l'OAM brute (= sprite->oam.priority décomp). */
function _setSpriteOamPriority(sprite: _VSprite, priority: number): void {
  const oamIndex = (sprite as { oamIndex?: number }).oamIndex;
  if (oamIndex === undefined) return;
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ priority?: number }> } } | undefined;
  const oam = rt?.gba?.oam?.[oamIndex];
  if (oam) oam.priority = priority & 3;
}

/** Décale le tile de base dans l'OAM brute (= sprite->oam.tileNum += n décomp).
 *  Précédent repo : battle_anim_effects_3.ts (_applyNoiseFrame). */
function _addSpriteOamTileNum(sprite: _VSprite, n: number): void {
  const oamIndex = (sprite as { oamIndex?: number }).oamIndex;
  if (oamIndex === undefined) return;
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ tileId?: number }> } } | undefined;
  const oam = rt?.gba?.oam?.[oamIndex];
  if (oam && oam.tileId !== undefined) oam.tileId += n;
}

// ─── Helpers battle_anim_mons.c transcrits localement ───────────────────────

/** 1:1 `TranslateSpriteInGrowingCircle` (battle_anim_mons.c:468) : cercle dont
 *  l'amplitude évolue. data[0]=pos cercle, data[1]=amplitude, data[2]=vitesse
 *  cercle, data[3]=durée, data[4]=vitesse d'amplitude, data[5]=delta amplitude. */
function _TranslateSpriteInGrowingCircle(sprite: _VSprite): void {
  if (sprite.data[3]) {
    sprite.x2 = Sin(sprite.data[0] & 0xFF, (_s16(sprite.data[5]) >> 8) + _s16(sprite.data[1]));
    sprite.y2 = Cos(sprite.data[0] & 0xFF, (_s16(sprite.data[5]) >> 8) + _s16(sprite.data[1]));
    sprite.data[0] += sprite.data[2];
    sprite.data[5] = _s16(sprite.data[5] + sprite.data[4]);
    if (sprite.data[0] >= 0x100) sprite.data[0] -= 0x100;
    else if (sprite.data[0] < 0) sprite.data[0] += 0x100;
    sprite.data[3]--;
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729).
 *  Adaptation : pas de table affine → ended immédiat (convention runtime). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _VSprite): void {
  const spF = sprite as { affineAnimEnded?: boolean; affineAnimsTableName?: string | null };
  if (spF.affineAnimEnded || !spF.affineAnimsTableName) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735).
 *  Adaptation : pas de table anims → ended immédiat (anti-leak, même convention). */
function _RunStoredCallbackWhenAnimEnds(sprite: _VSprite): void {
  const spA = sprite as { animEnded?: boolean; anims?: unknown };
  if (spA.animEnded || spA.anims === undefined) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `InitAnimFastLinearTranslation` (battle_anim_mons.c:1171) : deltas
 *  fixed-point x16 (u16, bit 0 = signe), data[1]/data[2]=deltas, data[3]=data[4]=0. */
function _InitAnimFastLinearTranslation(sprite: _VSprite): void {
  const xDiff = _s16(sprite.data[2]) - _s16(sprite.data[1]);
  const yDiff = _s16(sprite.data[4]) - _s16(sprite.data[3]);
  const xSign = xDiff < 0;
  const ySign = yDiff < 0;
  let x2 = (Math.abs(xDiff) << 4) & 0xFFFF;
  let y2 = (Math.abs(yDiff) << 4) & 0xFFFF;
  // C : u16 /= s16 (div entière ; data[0]=0 → UB décomp, ici |0 → 0).
  x2 = (x2 / _s16(sprite.data[0])) | 0;
  y2 = (y2 / _s16(sprite.data[0])) | 0;
  if (xSign) x2 |= 1;
  else x2 &= ~1;
  if (ySign) y2 |= 1;
  else y2 &= ~1;
  sprite.data[1] = x2 & 0xFFFF;
  sprite.data[2] = y2 & 0xFFFF;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}

/** 1:1 `AnimFastTranslateLinear` (battle_anim_mons.c:1208) : avance d'un pas
 *  fixed-point x16 ; TRUE quand data[0] (frames restantes) épuisé. */
function _AnimFastTranslateLinear(sprite: _VSprite): boolean {
  if (!sprite.data[0]) return true;
  const v1 = sprite.data[1] & 0xFFFF;
  const v2 = sprite.data[2] & 0xFFFF;
  let x = sprite.data[3] & 0xFFFF;
  let y = sprite.data[4] & 0xFFFF;
  x = (x + v1) & 0xFFFF;
  y = (y + v2) & 0xFFFF;
  if (v1 & 1) sprite.x2 = -(x >> 4);
  else sprite.x2 = x >> 4;
  if (v2 & 1) sprite.y2 = -(y >> 4);
  else sprite.y2 = y >> 4;
  sprite.data[3] = x;
  sprite.data[4] = y;
  sprite.data[0]--;
  return false;
}

/** 1:1 `AnimFastTranslateLinearWaitEnd` (battle_anim_mons.c:1237). */
function _AnimFastTranslateLinearWaitEnd(sprite: _VSprite): void {
  if (_AnimFastTranslateLinear(sprite)) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `InitAnimFastLinearTranslationWithSpeed` (battle_anim_mons.c:1244) :
 *  data[0] = vitesse → durée dérivée de la distance X. */
function _InitAnimFastLinearTranslationWithSpeed(sprite: _VSprite): void {
  const xDiff = Math.abs(_s16(sprite.data[2]) - _s16(sprite.data[1])) << 4;
  sprite.data[0] = (xDiff / _s16(sprite.data[0])) | 0;
  _InitAnimFastLinearTranslation(sprite);
}

/** 1:1 `InitAnimFastLinearTranslationWithSpeedAndPos` (battle_anim_mons.c:1251). */
function _InitAnimFastLinearTranslationWithSpeedAndPos(sprite: _VSprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  _InitAnimFastLinearTranslationWithSpeed(sprite);
  sprite.callback = _AnimFastTranslateLinearWaitEnd;
  _AnimFastTranslateLinearWaitEnd(sprite);
}

/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063).
 *  IsContest()=false ; GetAnimBgAttribute(2/1, BG_ANIM_PRIORITY) → 2/1 (valeurs
 *  posées par le setup anim du runtime = vanilla combat). */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = GetBattlerPosition(battler);
  if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_RIGHT)
    return 2; // GetAnimBgAttribute(2, BG_ANIM_PRIORITY)
  else
    return 1; // GetAnimBgAttribute(1, BG_ANIM_PRIORITY)
}

/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) — out-params C
 *  (&x,&y) → retour [x, y]. Moyenne battler+partenaire en double, sinon battler. */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): [number, number] {
  const xCoordType = !respectMonPicOffsets ? BATTLER_COORD_X : BATTLER_COORD_X_2;
  const yCoordType = !respectMonPicOffsets ? BATTLER_COORD_Y : BATTLER_COORD_Y_PIC_OFFSET;
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  let partnerX: number;
  let partnerY: number;
  if (_IsDoubleBattle()) { // && !IsContest() (toujours vrai ici)
    partnerX = GetBattlerSpriteCoord(battler ^ BIT_FLANK, xCoordType); // BATTLE_PARTNER
    partnerY = GetBattlerSpriteCoord(battler ^ BIT_FLANK, yCoordType);
  } else {
    partnerX = battlerX;
    partnerY = battlerY;
  }
  return [((battlerX + partnerX) / 2) | 0, ((battlerY + partnerY) / 2) | 0];
}

// ─── Callbacks battle_anim_ice.c ─────────────────────────────────────────────

/** 1:1 `AnimIcePunchSwirlingParticle` (battle_anim_ice.c:592) : cristaux
 *  tournoyants d'Ice Punch. arg 0 = angle initial (0-256) ; cercle r=60 qui
 *  rétrécit (vitesse d'amplitude -512), 30 frames, puis destroy. */
function AnimIcePunchSwirlingParticle(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  sprite.invisible = false;
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = 60;
  sprite.data[2] = 9;
  sprite.data[3] = 30;
  sprite.data[4] = -512;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  sprite.callback = _TranslateSpriteInGrowingCircle;
  _TranslateSpriteInGrowingCircle(sprite);
}

/** 1:1 `AnimIceBeamParticle` (battle_anim_ice.c:610) : particule du rayon Ice
 *  Beam. args [x, y, targetX, targetY, durée] ; translation linéaire attaquant
 *  → cible (offset X miroir de côté), puis destroy. */
function AnimIceBeamParticle(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  sprite.invisible = false;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  if ((attacker & 1) !== 0) // GetBattlerSide(attacker) != B_SIDE_PLAYER
    sprite.data[2] -= args[2];
  else
    sprite.data[2] += args[2];
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];
  sprite.data[0] = args[4] | 0;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  sprite.callback = StartAnimLinearTranslation;
}

/** 1:1 `AnimIceEffectParticle` (battle_anim_ice.c:631) : cristal d'impact (Ice
 *  Punch/Beam, Tri Attack, Blizzard, Powder Snow…). args [x, y, moyennePos?] ;
 *  affine scale-in puis flicker 20 frames et destroy. */
function AnimIceEffectParticle(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  sprite.invisible = false;
  if ((args[2] | 0) === 0) {
    InitSpritePosToAnimTarget(sprite as never, true);
  } else {
    const [ax, ay] = _SetAverageBattlerPositions(target, true);
    sprite.x = ax;
    sprite.y = ay;
    if ((attacker & 1) !== 0) // GetBattlerSide(attacker) != B_SIDE_PLAYER
      args[0] = -args[0]; // 1:1 : mutation de gBattleAnimArgs[0]
    sprite.x += args[0];
    sprite.y += args[1];
  }
  StoreSpriteCallbackInData6(sprite as never, _AnimFlickerIceEffectParticle as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimFlickerIceEffectParticle` (battle_anim_ice.c:651) : clignote
 *  (invisible ^= 1) 20 frames puis DestroySpriteAndMatrix. */
function _AnimFlickerIceEffectParticle(sprite: _VSprite): void {
  sprite.invisible = !sprite.invisible;
  sprite.data[0] += 1;
  if (sprite.data[0] === 20) DestroySpriteAndMatrix(sprite as never);
}

/** 1:1 `AnimSwirlingSnowball` (battle_anim_ice.c:666) : petites boules de neige
 *  de Blizzard/Icy Wind. args [x, y, targetX, targetY, vitesse, multiCibles?].
 *  Recule la particule hors écran (deltas inversés via bit de signe), puis
 *  traverse l'écran au travers de la cible. */
function AnimSwirlingSnowball(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 1, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  const tempDataHolder: number[] = [];

  sprite.invisible = false;
  InitSpritePosToAnimAttacker(sprite as never, true);

  sprite.data[0] = args[4] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;

  if (!args[5]) {
    sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];
  } else {
    const [ax, ay] = _SetAverageBattlerPositions(target, true);
    sprite.data[2] = ax;
    sprite.data[4] = ay;
  }

  if ((attacker & 1) !== 0) // GetBattlerSide(attacker) != B_SIDE_PLAYER
    sprite.data[2] -= args[2];
  else
    sprite.data[2] += args[2];

  for (let i = 0; i < 8; i++) tempDataHolder[i] = sprite.data[i];

  _InitAnimFastLinearTranslationWithSpeed(sprite);
  sprite.data[1] ^= 1; // inverse le bit de signe des deltas → recule
  sprite.data[2] ^= 1;

  // C : while (1) — termine dès que la particule sort de l'écran. Garde JS
  // anti-boucle infinie (cas dégénéré deltas nuls = UB décomp).
  let guard = 4096;
  while (guard--) {
    sprite.data[0] = 1;
    _AnimFastTranslateLinear(sprite);
    if (sprite.x + sprite.x2 > 240 + 16 // DISPLAY_WIDTH + 16
     || sprite.x + sprite.x2 < -16
     || sprite.y + sprite.y2 > 160 // DISPLAY_HEIGHT
     || sprite.y + sprite.y2 < -16)
      break;
  }

  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;

  for (let i = 0; i < 8; i++) sprite.data[i] = tempDataHolder[i];

  sprite.callback = _InitAnimFastLinearTranslationWithSpeedAndPos;
  StoreSpriteCallbackInData6(sprite as never, _AnimSwirlingSnowball_Step1 as never);
}

/** 1:1 `AnimSwirlingSnowball_Step1` (battle_anim_ice.c:723) : fige la position,
 *  initialise la spirale (Sin/Cos depuis l'angle 128). */
function _AnimSwirlingSnowball_Step1(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;

  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;
  sprite.data[0] = 128;

  const tempVar = (attacker & 1) !== 0 ? 20 : -20; // GetBattlerSide != B_SIDE_PLAYER

  sprite.data[3] = Sin(sprite.data[0] & 0xFF, tempVar);
  sprite.data[4] = Cos(sprite.data[0] & 0xFF, 0xF);
  sprite.data[5] = 0;
  sprite.callback = _AnimSwirlingSnowball_Step2;
  _AnimSwirlingSnowball_Step2(sprite);
}

/** 1:1 `AnimSwirlingSnowball_Step2` (battle_anim_ice.c:742) : 32 frames de
 *  spirale (pas d'angle 16), puis fige et passe à _End. */
function _AnimSwirlingSnowball_Step2(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;
  const tempVar = (attacker & 1) !== 0 ? 20 : -20;

  if (sprite.data[5] <= 31) {
    sprite.x2 = Sin(sprite.data[0] & 0xFF, tempVar) - sprite.data[3];
    sprite.y2 = Cos(sprite.data[0] & 0xFF, 15) - sprite.data[4];
    sprite.data[0] = (sprite.data[0] + 16) & 0xFF;
    sprite.data[5] += 1;
  } else {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[4] = 0;
    sprite.data[3] = 0;
    sprite.callback = _AnimSwirlingSnowball_End;
  }
}

/** 1:1 `AnimSwirlingSnowball_End` (battle_anim_ice.c:766) : poursuit la
 *  translation rapide jusqu'à sortir de l'écran (bornes littérales 256 du C). */
function _AnimSwirlingSnowball_End(sprite: _VSprite): void {
  sprite.data[0] = 1;
  _AnimFastTranslateLinear(sprite);

  if (sprite.x + sprite.x2 > 256
   || sprite.x + sprite.x2 < -16
   || sprite.y + sprite.y2 > 256
   || sprite.y + sprite.y2 < -16)
    _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `InitSwirlingFogAnim` (battle_anim_ice.c:904) : brouillard qui tourne
 *  autour du mon (Mist/Smog). args [x, y, dY/rotation, durée, surCible?,
 *  moyennePos?]. data[6]=amplitude (0x20 simple / 0x40 double), data[7]=battler. */
function InitSwirlingFogAnim(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 30, 0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  let battler: number;

  sprite.invisible = false;
  if ((args[4] | 0) === 0) {
    if ((args[5] | 0) === 0) {
      InitSpritePosToAnimAttacker(sprite as never, false);
    } else {
      const [ax, ay] = _SetAverageBattlerPositions(attacker, false);
      sprite.x = ax;
      sprite.y = ay;
      if ((attacker & 1) !== 0) // GetBattlerSide(attacker) != B_SIDE_PLAYER
        sprite.x -= args[0];
      else
        sprite.x += args[0];
      sprite.y += args[1];
    }
    battler = attacker;
  } else {
    if ((args[5] | 0) === 0) {
      InitSpritePosToAnimTarget(sprite as never, false);
    } else {
      const [tx, ty] = _SetAverageBattlerPositions(target, false);
      sprite.x = tx;
      sprite.y = ty;
      if ((target & 1) !== 0) // GetBattlerSide(target) != B_SIDE_PLAYER
        sprite.x -= args[0];
      else
        sprite.x += args[0];
      sprite.y += args[1];
    }
    battler = target;
  }

  sprite.data[7] = battler;
  const tempVar = ((args[5] | 0) === 0 || !_IsDoubleBattle()) ? 0x20 : 0x40;
  sprite.data[6] = tempVar;
  if ((target & 1) === 0) // GetBattlerSide(target) == B_SIDE_PLAYER
    sprite.y += 8;

  sprite.data[0] = args[3] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + args[2];

  InitAnimLinearTranslation(sprite as never);

  sprite.data[5] = 64;
  sprite.callback = _AnimSwirlingFogAnim;
  _AnimSwirlingFogAnim(sprite);
}

/** 1:1 `AnimSwirlingFogAnim` (battle_anim_ice.c:972) : swirl Sin/Cos par-dessus
 *  la translation linéaire ; bascule la priorité OBJ (devant/derrière le mon)
 *  selon la moitié du cercle ; destroy à la fin de la translation. */
function _AnimSwirlingFogAnim(sprite: _VSprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.x2 += Sin(sprite.data[5] & 0xFF, sprite.data[6]);
    sprite.y2 += Cos(sprite.data[5] & 0xFF, -6);

    if (((sprite.data[5] - 64) & 0xFFFF) <= 0x7F) // (u16)(data[5]-64) <= 0x7F
      _setSpriteOamPriority(sprite, _GetBattlerSpriteBGPriority(sprite.data[7]));
    else
      _setSpriteOamPriority(sprite, _GetBattlerSpriteBGPriority(sprite.data[7]) + 1);

    sprite.data[5] = (sprite.data[5] + 3) & 0xFF;
  } else {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `InitIceBallAnim` (battle_anim_ice.c:1538) : lancer d'Ice Ball. args
 *  [x, y, targetX, targetY, durée, hauteurArc(nég)]. Variante affine = nb de
 *  hits consécutifs (rolloutTimerStartValue - rolloutTimer - 1, clampé à 4). */
function InitIceBallAnim(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  const target = _vItf().getTarget?.() ?? 1;
  // gAnimDisableStructPtr (décomp = DisableStruct de l'attaquant copié dans le
  // buffer controller) → gDisableStructs[attacker], même donnée source.
  const ds = gDisableStructs[attacker] as { rolloutTimerStartValue?: number; rolloutTimer?: number } | undefined;
  let animNum = ((ds?.rolloutTimerStartValue ?? 0) - (ds?.rolloutTimer ?? 0) - 1) & 0xFF; // u8
  if (animNum > 4) animNum = 4;

  _StartSpriteAffineAnim(sprite, animNum);
  sprite.invisible = false;
  InitSpritePosToAnimAttacker(sprite as never, true);

  sprite.data[0] = args[4] | 0;

  if ((attacker & 1) !== 0) // GetBattlerSide(attacker) != B_SIDE_PLAYER
    args[2] = -args[2]; // 1:1 : mutation de gBattleAnimArgs[2]

  sprite.data[2] = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2) + args[2];
  sprite.data[4] = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET) + args[3];
  sprite.data[5] = args[5] | 0;

  InitAnimArcTranslation(sprite as never);

  sprite.callback = _AnimThrowIceBall;
}

/** 1:1 `AnimThrowIceBall` (battle_anim_ice.c:1563) : arc jusqu'à la cible, puis
 *  anim 1 (éclat) et destroy à la fin de l'anim. */
function _AnimThrowIceBall(sprite: _VSprite): void {
  if (!TranslateAnimHorizontalArc(sprite as never)) return;

  _StartSpriteAnim(sprite, 1);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
}

/** 1:1 `InitIceBallParticle` (battle_anim_ice.c:1574) : éclats dispersés à la
 *  fin d'Ice Ball. oam.tileNum += 8 (frame éclat), vitesses aléatoires Random2. */
function InitIceBallParticle(sprite: _VSprite): void {
  sprite.invisible = false;
  _addSpriteOamTileNum(sprite, 8); // sprite->oam.tileNum += 8
  InitSpritePosToAnimTarget(sprite as never, true);

  const randA = (Random2() & 0xFF) + 256;
  let randB = Random2() & 0x1FF;
  if (randB > 0xFF) randB = 256 - randB;

  sprite.data[1] = randA;
  sprite.data[2] = randB;
  sprite.callback = _AnimIceBallParticle;
}

/** 1:1 `AnimIceBallParticle` (battle_anim_ice.c:1593) : dérive fixed-point
 *  (accumulateurs >> 8, bit 0 de data[1] = signe X), destroy à 21 frames. */
function _AnimIceBallParticle(sprite: _VSprite): void {
  sprite.data[3] = _s16(sprite.data[3] + sprite.data[1]);
  sprite.data[4] = _s16(sprite.data[4] + sprite.data[2]);

  if (sprite.data[1] & 1) sprite.x2 = -(sprite.data[3] >> 8);
  else sprite.x2 = sprite.data[3] >> 8;

  sprite.y2 = sprite.data[4] >> 8;

  if (++sprite.data[0] === 21) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── Enregistrement registry (noms C exacts) ─────────────────────────────────
registerAnimCallbacks({
  AnimIcePunchSwirlingParticle: AnimIcePunchSwirlingParticle as never,
  AnimIceBeamParticle: AnimIceBeamParticle as never,
  AnimIceEffectParticle: AnimIceEffectParticle as never,
  AnimSwirlingSnowball: AnimSwirlingSnowball as never,
  InitSwirlingFogAnim: InitSwirlingFogAnim as never,
  InitIceBallAnim: InitIceBallAnim as never,
  InitIceBallParticle: InitIceBallParticle as never,
});

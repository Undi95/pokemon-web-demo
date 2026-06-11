/**
 * battle_anim_effects_1b.ts — miroir PARTIEL de src/battle_anim_effects_1.c
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Lot porté (callbacks d'entrée + leurs steps/helpers statiques) :
 *   - AnimWavyMusicNotes (+_CalcVelocity/_Step :5297/5328/5344)
 *   - AnimFlyingMusicNotes (+_Step :5377/5396)
 *   - AnimSlowFlyingMusicNotes (+_Step :5437/5461)
 *   - AnimBellyDrumHand (:5415)
 *   - AnimThoughtBubble (+_Step :5490/5510)
 *   - AnimMetronomeFinger (+_Step :5520/5536)
 *   - AnimFollowMeFinger (+_Step1/_Step2 :5546/5570/5576)
 *   - AnimTauntFinger (+_Step1/_Step2 :5606/5631/5642)
 *   - AnimIngrainRoot (+AnimRootFlickerOut :2871/2918)
 *   - AnimIngrainOrb (:2927)
 *   - AnimPresent / AnimItemSteal (+InitItemBagData/moveAlongLinearPath/_Step1/_Step2/_Step3
 *     :3016/3105/2948/2958/2998/2988/3133)
 *   - AnimTrickBag (+_Step1/_Step2/_Step3 + gTrickBagCoordinates :3156/3186/3216/3246/873)
 *   - AnimNeedleArmSpike (+_Step :3623/3681)
 *   - AnimCirclingMusicNote (+_Step :3887/3905)
 *   - SetSpriteNextToMonHead (:5480, symbole public décomp)
 *
 * Conventions du repo (cf. battle_anim_rock.ts / battle_anim_dragon.ts) :
 *   - PAS d'import statique de l'interpréteur (cycle ESM) → surface lazy
 *     `__battleAnimInterpreter`.
 *   - IsContest() == false partout (pas de concours web) → branches contest élidées,
 *     commentées sur place.
 *   - s16/u16 décomp : wrap explicite `& 0xFFFF` + `_toS16` quand le C dépend du wrap.
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  SetSpriteCoordsToAnimAttackerCoords,
  InitAnimLinearTranslation, AnimTranslateLinear,
  StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  DestroySpriteAndMatrix, TrySetSpriteRotScale,
} from './battle_anim_mons';
import { Sin, Cos, gSineTable } from './trig';
import { IndexOfSpritePaletteTag } from '../engine/system/decomp-globals';
import { gBattlerPartyIndexes } from '../engine/battle/state';
import { gPlayerParty, gEnemyParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import { reverseDecompConstant } from '../engine/system/decomp-constants';
import { getMonFrontPicCoords, getMonBackPicCoords } from './data/mon_pic_coords';

// ─── Surface sprite + interpréteur (lazy, anti-cycle ESM) ────────────────────
type _ESprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; subpriority?: number;
  spriteId?: number; oamIndex?: number;
  hFlip?: boolean;
  animEnded?: boolean; affineAnimEnded?: boolean;
  callback: unknown;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;
/** Réinterprète les 16 bits bas en s16 signé (= cast (s16) décomp). */
function _toS16(v: number): number { return (v << 16) >> 16; }
/** 1:1 GetBattlerSide(b) — 0 = B_SIDE_PLAYER, 1 = B_SIDE_OPPONENT. */
function _side(b: number): number { return b & 1; }

/** 1:1 `StartSpriteAnim` (sprite.c) — pattern repo (battle_anim_dragon.ts). */
function _StartSpriteAnim(sprite: _ESprite, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}
/** 1:1 `StartSpriteAffineAnim` (sprite.c) — pattern repo. */
function _StartSpriteAffineAnim(sprite: _ESprite, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n; spF.affineAnimBeginning = true; spF.affineAnimEnded = false;
}
/** Wrapper `DestroyAnimSprite` — utilisable direct ET comme callback stocké data[6]. */
function _DestroyAnimSprite(sprite: _ESprite): void {
  _vItf().DestroyAnimSprite?.(sprite);
}
/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : data[0] frames puis cb stocké. */
function _WaitAnimForDuration(sprite: _ESprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _ESprite): void {
  if (sprite.affineAnimEnded) SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735). */
function _RunStoredCallbackWhenAnimEnds(sprite: _ESprite): void {
  if (sprite.animEnded) SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 BIOS `ArcTan2` (syscall, u16 0-65535) + `ArcTan2Neg` (battle_anim_mons.c:1368).
 *  Même formule que l'approx du repo (decomp-bridge.ts:2451). */
function _ArcTan2Neg(x: number, y: number): number {
  const a = ((Math.atan2(y, x) / (2 * Math.PI)) * 65536) | 0;
  return (-a) & 0xFFFF;
}
/** 1:1 `PlaySE12WithPanning` — route vers le SE runtime (pattern battle_anim_throw.ts).
 *  Le pan est ignoré par le wrapper runtime (= comportement de l'interpréteur). */
function _PlaySE12WithPanning(songId: number, _pan: number): void {
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(songId);
}
const SE_M_BUBBLE2 = 125;          // include/constants/songs.h:132
const SOUND_PAN_ATTACKER = -64;    // include/battle_anim.h
const SOUND_PAN_TARGET = 63;

// species du battler via gEnemyParty/gPlayerParty[gBattlerPartyIndexes] (même
// dette douce que battle_anim_mons.ts:_battlerSpecies : transformSpecies/illusion
// non modélisés).
function _battlerSpeciesName(battler: number): string {
  const party = _side(battler) !== 0 ? gEnemyParty : gPlayerParty;
  const species = GetMonData(party[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
  return reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
}
// 1:1 battle_anim_mons.c:2151 `GetBattlerSpriteCoordAttr` — cases utilisées par ce
// fichier (HEIGHT/WIDTH/LEFT/RIGHT/TOP). coords = front pic (adverse) / back pic
// (joueur). Dette douce : Unown/Castform formes + transformSpecies non modélisés
// (= branche !transformSpecies, espèce de base).
const BATTLER_COORD_ATTR_HEIGHT = 0;
const BATTLER_COORD_ATTR_WIDTH = 1;
const BATTLER_COORD_ATTR_TOP = 2;
const BATTLER_COORD_ATTR_RIGHT = 4;
const BATTLER_COORD_ATTR_LEFT = 5;
function _GetBattlerSpriteCoordAttr(battler: number, attr: number): number {
  const name = _battlerSpeciesName(battler);
  const coords = _side(battler) === 0 ? getMonBackPicCoords(name) : getMonFrontPicCoords(name);
  const w = coords.w, h = coords.h;
  switch (attr) {
    case BATTLER_COORD_ATTR_HEIGHT: return h;
    case BATTLER_COORD_ATTR_WIDTH: return w;
    case BATTLER_COORD_ATTR_LEFT:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) - ((w / 2) | 0);
    case BATTLER_COORD_ATTR_RIGHT:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + ((w / 2) | 0);
    case BATTLER_COORD_ATTR_TOP:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) - ((h / 2) | 0);
    default: return 0;
  }
}

// ─── gParticlesColorBlendTable (:1973) — tags + 5 couleurs RGB555 par ligne ──
function _RGB(r: number, g: number, b: number): number { return r | (g << 5) | (b << 10); }
const RGB_WHITE = _RGB(31, 31, 31);
const ANIM_TAG_MUSIC_NOTES = 10072;
const ANIM_TAG_BENT_SPOON = 10097;
const ANIM_TAG_LARGE_FRESH_EGG = 10175;
const ANIM_TAG_SPHERE_TO_CUBE = 10185;
/** 1:1 `gParticlesColorBlendTable` (battle_anim_effects_1.c:1973). */
const gParticlesColorBlendTable: ReadonlyArray<ReadonlyArray<number>> = [
  [ANIM_TAG_MUSIC_NOTES, RGB_WHITE, _RGB(31, 26, 28), _RGB(31, 22, 26), _RGB(31, 17, 24), _RGB(31, 13, 22)],
  [ANIM_TAG_BENT_SPOON, RGB_WHITE, _RGB(25, 31, 26), _RGB(20, 31, 21), _RGB(15, 31, 16), _RGB(10, 31, 12)],
  [ANIM_TAG_SPHERE_TO_CUBE, RGB_WHITE, _RGB(31, 31, 24), _RGB(31, 31, 17), _RGB(31, 31, 10), _RGB(31, 31, 3)],
  [ANIM_TAG_LARGE_FRESH_EGG, RGB_WHITE, _RGB(26, 28, 31), _RGB(21, 26, 31), _RGB(16, 24, 31), _RGB(12, 22, 31)],
];
/** 1:1 `sprite->oam.paletteNum = index` : écrit le paletteBank OAM du sprite.
 *  No-op tant que les palettes rainbow (AnimTask_MusicNotesRainbowBlend, non
 *  porté) ne sont pas chargées — IndexOfSpritePaletteTag renvoie 0xFF avant. */
function _setOamPaletteNum(sprite: _ESprite, index: number): void {
  const rt = (globalThis as Record<string, unknown>).__rt as
    { gba?: { oam?: Array<{ paletteBank?: number }> } } | undefined;
  const oam = sprite.oamIndex !== undefined ? rt?.gba?.oam?.[sprite.oamIndex] : undefined;
  if (oam) oam.paletteBank = index;
}

// ═══════════════════════════════ INGRAIN ════════════════════════════════════

/** 1:1 `AnimIngrainRoot` (battle_anim_effects_1.c:2871) : racine posée sur
 *  l'attaquant (args [offsetX, offsetY, subpriority-30, animation, durée]),
 *  clamp bas d'écran 120, puis flicker-out. */
function AnimIngrainRoot(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 30];
  const atk = _vItf().getAttacker?.() ?? 0;
  if (!sprite.data[0]) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y);
    sprite.x2 = args[0] | 0;
    sprite.y2 = args[1] | 0;
    sprite.subpriority = (args[2] | 0) + 30;
    _StartSpriteAnim(sprite, args[3] | 0);
    sprite.data[2] = args[4] | 0;
    sprite.data[0]++;
    if (sprite.y + sprite.y2 > 120)
      sprite.y += sprite.y2 + sprite.y - 120;
    sprite.invisible = false;
  }
  sprite.callback = _AnimRootFlickerOut;
}

/** 1:1 `AnimRootFlickerOut` (:2918) : clignote sur les 10 dernières frames de
 *  data[2], puis destroy. (Partagé décomp avec AnimFrenzyPlantRoot, non porté.) */
function _AnimRootFlickerOut(sprite: _ESprite): void {
  if (++sprite.data[0] > sprite.data[2] - 10)
    sprite.invisible = sprite.data[0] % 2 !== 0;
  if (sprite.data[0] > sprite.data[2])
    _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimIngrainOrb` (:2927) : orbe en chemin ondulé rapide depuis
 *  l'attaquant — args [initialX, initialY, velocityX, amplitude, durée].
 *  Reste son propre callback (init 1 frame via data[0]). */
function AnimIngrainOrb(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 1, 8, 30];
  const atk = _vItf().getAttacker?.() ?? 0;
  if (!sprite.data[0]) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) + (args[0] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y) + (args[1] | 0);
    sprite.data[1] = args[2] | 0;
    sprite.data[2] = args[3] | 0;
    sprite.data[3] = args[4] | 0;
    sprite.invisible = false;
  }
  sprite.data[0]++;
  sprite.x2 = sprite.data[1] * sprite.data[0];
  sprite.y2 = Sin((sprite.data[0] * 20) & 0xFF, sprite.data[2]);
  if (sprite.data[0] > sprite.data[3])
    _DestroyAnimSprite(sprite);
}

// ═══════════════════════ PRESENT / ITEM STEAL / TRICK ═══════════════════════

/** 1:1 `InitItemBagData` (:2948) : packe start (x,y) dans data[5], dest dans
 *  data[6], (totalTime<<8) dans data[7] — slots s16 → wrap & 0xFFFF. */
function _InitItemBagData(sprite: _ESprite, c: number): void {
  const a = (sprite.x << 8) | sprite.y;
  const b = (sprite.data[6] << 8) | sprite.data[7];
  sprite.data[5] = a & 0xFFFF;
  sprite.data[6] = b & 0xFFFF;
  sprite.data[7] = (c << 8) & 0xFFFF;
}

/** 1:1 `moveAlongLinearPath` (:2958) : interpolation linéaire start→end packée
 *  u8 dans data[5..7] ; xEndPos 0 → -32, 255 → DISPLAY_WIDTH+32. TRUE à l'arrivée. */
function _moveAlongLinearPath(sprite: _ESprite): boolean {
  const xStartPos = (sprite.data[5] >>> 8) & 0xFF;
  const yStartPos = sprite.data[5] & 0xFF;
  let xEndPos = (sprite.data[6] >>> 8) & 0xFF;
  const yEndPos = sprite.data[6] & 0xFF;
  const totalTime = _toS16(sprite.data[7]) >> 8;
  let currentTime = sprite.data[7] & 0xFF;

  if (xEndPos === 0) xEndPos = -32;
  else if (xEndPos === 255) xEndPos = DISPLAY_WIDTH + 32;

  const yEndPos_2 = yEndPos - yStartPos;
  const r0 = xEndPos - xStartPos;
  const var1 = Math.trunc((r0 * currentTime) / totalTime);
  const vaxEndPos = Math.trunc((yEndPos_2 * currentTime) / totalTime);
  sprite.x = var1 + xStartPos;
  sprite.y = vaxEndPos + yStartPos;
  if (++currentTime === totalTime)
    return true;

  sprite.data[7] = ((totalTime << 8) | currentTime) & 0xFFFF;
  return false;
}

/** 1:1 `AnimItemSteal_Step2` (:2988) : squish affine 1 à t=10, destroy à t>50. */
function _AnimItemSteal_Step2(sprite: _ESprite): void {
  if (sprite.data[0] === 10)
    _StartSpriteAffineAnim(sprite, 1);
  sprite.data[0]++;
  if (sprite.data[0] > 50)
    _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimItemSteal_Step1` (:2998) : rebonds Sin amortis (30 - bounce*8) le
 *  long du chemin linéaire packé. */
function _AnimItemSteal_Step1(sprite: _ESprite): void {
  sprite.data[0] += Math.trunc((sprite.data[3] * 128) / sprite.data[4]);
  if (sprite.data[0] >= 128) {
    sprite.data[1]++;
    sprite.data[0] = 0;
  }
  sprite.y2 = Sin((sprite.data[0] + 128) & 0xFF, 30 - sprite.data[1] * 8);
  if (_moveAlongLinearPath(sprite)) {
    sprite.y2 = 0;
    sprite.data[0] = 0;
    sprite.callback = _AnimItemSteal_Step2;
  }
}

/** 1:1 `AnimPresent` (:3016) : le cadeau part de l'attaquant et rebondit
 *  jusqu'à la cible (cible+10 en Y) ; 1 rebond si partenaire, 3 sinon. */
function AnimPresent(sprite: _ESprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, false);
  const targetX = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X);
  const targetY = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y);
  if ((atk ^ 2) === tgt) {  // BATTLE_PARTNER(gBattleAnimAttacker) == gBattleAnimTarget
    sprite.data[6] = targetX;
    sprite.data[7] = targetY + 10;
    _InitItemBagData(sprite, 60);
    sprite.data[3] = 1;
  } else {
    sprite.data[6] = targetX;
    sprite.data[7] = targetY + 10;
    _InitItemBagData(sprite, 60);
    sprite.data[3] = 3;
  }
  sprite.data[4] = 60;
  sprite.invisible = false;
  sprite.callback = _AnimItemSteal_Step1;
}

/** 1:1 `AnimItemSteal` (:3105) : le sac part de la CIBLE et rebondit jusqu'à
 *  l'ATTAQUANT (vol d'objet) — miroir exact d'AnimPresent. */
function AnimItemSteal(sprite: _ESprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimTarget(sprite as never, false);
  const attackerX = GetBattlerSpriteCoord(atk, BATTLER_COORD_X);
  const attackerY = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y);
  if ((tgt ^ 2) === atk) {  // BATTLE_PARTNER(gBattleAnimTarget) == gBattleAnimAttacker
    sprite.data[6] = attackerX;
    sprite.data[7] = attackerY + 10;
    _InitItemBagData(sprite, 60);
    sprite.data[3] = 1;
  } else {
    sprite.data[6] = attackerX;
    sprite.data[7] = attackerY + 10;
    _InitItemBagData(sprite, 60);
    sprite.data[3] = 3;
  }
  sprite.data[4] = 60;
  sprite.invisible = false;
  sprite.callback = _AnimItemSteal_Step3;
}

/** 1:1 `AnimItemSteal_Step3` (:3133) : comme Step1 + SE bulle au point bas
 *  (y2==0) et à l'arrivée. */
function _AnimItemSteal_Step3(sprite: _ESprite): void {
  sprite.data[0] += Math.trunc((sprite.data[3] * 128) / sprite.data[4]);
  if (sprite.data[0] > 127) {
    sprite.data[1]++;
    sprite.data[0] = 0;
  }
  sprite.y2 = Sin((sprite.data[0] + 0x80) & 0xFF, 30 - sprite.data[1] * 8);
  if (sprite.y2 === 0)
    _PlaySE12WithPanning(SE_M_BUBBLE2, SOUND_PAN_TARGET);
  if (_moveAlongLinearPath(sprite)) {
    sprite.y2 = 0;
    sprite.data[0] = 0;
    sprite.callback = _AnimItemSteal_Step2;
    _PlaySE12WithPanning(SE_M_BUBBLE2, SOUND_PAN_ATTACKER);
  }
}

/** 1:1 `gTrickBagCoordinates` (:873) — [dPhase, durée, multiplicateur(127=fin)]. */
const gTrickBagCoordinates: ReadonlyArray<readonly [number, number, number]> = [
  [5, 24, 1],
  [0, 4, 0],
  [8, 16, -1],
  [0, 2, 0],
  [8, 16, 1],
  [0, 2, 0],
  [8, 16, 1],
  [0, 2, 0],
  [8, 16, 1],
  [0, 16, 0],
  [0, 0, 127],
];

/** 1:1 `AnimTrickBag` (:3156) : sac de Tour de Magie — orbite Cos/Sin autour de
 *  x=120 (non-contest), args [initialY, waveOffset]. */
function AnimTrickBag(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [80, 0];
  if (!sprite.data[0]) {
    // IsContest() == false → branche non-contest uniquement (x=70 élidé).
    sprite.data[1] = args[1] | 0;
    sprite.x = 120;
    sprite.y = args[0] | 0;
    sprite.data[2] = args[0] | 0;
    sprite.data[4] = 20;
    sprite.x2 = Cos(sprite.data[1] & 0xFF, 60);
    sprite.y2 = Sin(sprite.data[1] & 0xFF, 20);
    sprite.invisible = false;
    sprite.callback = _AnimTrickBag_Step1;
    if (sprite.data[1] > 0 && sprite.data[1] < 192)
      sprite.subpriority = 31;
    else
      sprite.subpriority = 29;
  }
}

/** 1:1 `AnimTrickBag_Step1` (:3186) : descente accélérée (data[4]/10) jusqu'à
 *  y>78, puis affine anim 1 (squish), puis Step2. */
function _AnimTrickBag_Step1(sprite: _ESprite): void {
  switch (sprite.data[3]) {
    case 0:
      if (sprite.data[2] > 78) {
        sprite.data[3] = 1;
        _StartSpriteAffineAnim(sprite, 1);
        break;
      } else {
        sprite.data[2] += Math.trunc(sprite.data[4] / 10);
        sprite.data[4] += 3;
        sprite.y = sprite.data[2];
        break;
      }
    case 1: {
      // 1:1 `if (sprite->data[3] && sprite->affineAnimEnded)` — la lecture passe
      // par un local pour éviter le narrowing TS (data[3]===1 garanti ici).
      const d3: number = sprite.data[3];
      if (d3 !== 0 && sprite.affineAnimEnded) {
        sprite.data[0] = 0;
        sprite.data[2] = 0;
        sprite.callback = _AnimTrickBag_Step2;
      }
      break;
    }
  }
}

/** 1:1 `AnimTrickBag_Step2` (:3216) : parcourt gTrickBagCoordinates — phase
 *  data[1] avance de dPhase*mult par frame, subpriority selon le quadrant. */
function _AnimTrickBag_Step2(sprite: _ESprite): void {
  if (sprite.data[2] === gTrickBagCoordinates[sprite.data[0]][1]) {
    if (gTrickBagCoordinates[sprite.data[0]][2] === 127) {
      sprite.data[0] = 0;
      sprite.callback = _AnimTrickBag_Step3;
    }
    sprite.data[2] = 0;
    sprite.data[0]++;
  } else {
    sprite.data[2]++;
    sprite.data[1] = (gTrickBagCoordinates[sprite.data[0]][0] * gTrickBagCoordinates[sprite.data[0]][2] + sprite.data[1]) & 0xFF;
    // IsContest() == false → maj subpriority active.
    if (((sprite.data[1] - 1) & 0xFFFF) < 191)
      sprite.subpriority = 31;
    else
      sprite.subpriority = 29;
    sprite.x2 = Cos(sprite.data[1], 60);
    sprite.y2 = Sin(sprite.data[1], 20);
  }
}

/** 1:1 `AnimTrickBag_Step3` (:3246) : flicker 20 frames puis destroy. */
function _AnimTrickBag_Step3(sprite: _ESprite): void {
  if (sprite.data[0] > 20)
    _DestroyAnimSprite(sprite);
  sprite.invisible = sprite.data[0] % 2 !== 0;
  sprite.data[0]++;
}

// ═══════════════════════════ NEEDLE ARM ═════════════════════════════════════

/** 1:1 `AnimNeedleArmSpike` (:3623) : pic qui converge vers (ou diverge de)
 *  l'ancre — args [ancre atk/tgt, direction, offsetX, offsetY, durée]. Rotation
 *  posée via ArcTan2Neg + TrySetSpriteRotScale. */
function AnimNeedleArmSpike(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[4] | 0) === 0) {
    _DestroyAnimSprite(sprite);
  } else {
    let a: number, b: number;
    if ((args[0] | 0) === 0) {
      a = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) & 0xFF;
      b = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) & 0xFF;
    } else {
      a = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) & 0xFF;
      b = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) & 0xFF;
    }
    sprite.data[0] = args[4] | 0;
    if ((args[1] | 0) === 0) {
      sprite.x = (args[2] | 0) + a;
      sprite.y = (args[3] | 0) + b;
      sprite.data[5] = a;
      sprite.data[6] = b;
    } else {
      sprite.x = a;
      sprite.y = b;
      sprite.data[5] = (args[2] | 0) + a;
      sprite.data[6] = (args[3] | 0) + b;
    }
    const x = sprite.x;
    sprite.data[1] = x * 16;
    const y = sprite.y;
    sprite.data[2] = y * 16;
    sprite.data[3] = Math.trunc(((sprite.data[5] - sprite.x) * 16) / (args[4] | 0));
    sprite.data[4] = Math.trunc(((sprite.data[6] - sprite.y) * 16) / (args[4] | 0));
    const c = _ArcTan2Neg(sprite.data[5] - x, sprite.data[6] - y);
    // IsContest() == false → pas de c -= 0x8000.
    if (sprite.spriteId !== undefined)
      TrySetSpriteRotScale(sprite.spriteId, false, 0x100, 0x100, c);
    sprite.invisible = false;
    sprite.callback = _AnimNeedleArmSpike_Step;
  }
}

/** 1:1 `AnimNeedleArmSpike_Step` (:3681) : translation fixed-point /16,
 *  data[0] frames, puis DestroySpriteAndMatrix. */
function _AnimNeedleArmSpike_Step(sprite: _ESprite): void {
  if (sprite.data[0]) {
    sprite.data[1] += sprite.data[3];
    sprite.data[2] += sprite.data[4];
    sprite.x = sprite.data[1] >> 4;
    sprite.y = sprite.data[2] >> 4;
    sprite.data[0]--;
  } else {
    DestroySpriteAndMatrix(sprite);
  }
}

// ═══════════════════════ MUSIC NOTES (4 variantes) ══════════════════════════

/** 1:1 `AnimCirclingMusicNote` (:3887) : note en orbite Cos(d0,100)/Sin(d0,20)
 *  qui retombe (gravité data[5]+=130>>8) — args [x, y, phase0, dPhase, durée, anim].
 *  Callback assigné PUIS appelé immédiatement (1:1). */
function AnimCirclingMusicNote(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 2, 48, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.data[0] = args[2] | 0;
  if (_side(atk) !== 0)  // GetBattlerSide(attacker) != B_SIDE_PLAYER
    sprite.x -= args[0] | 0;
  else
    sprite.x += args[0] | 0;
  _StartSpriteAnim(sprite, args[5] | 0);
  sprite.data[1] = -(args[3] | 0);
  sprite.y += args[1] | 0;
  sprite.data[3] = args[4] | 0;
  sprite.invisible = false;
  sprite.callback = _AnimCirclingMusicNote_Step;
  (sprite.callback as (s: _ESprite) => void)(sprite);
}

/** 1:1 `AnimCirclingMusicNote_Step` (:3905). data[5] = vitesse de chute s16. */
function _AnimCirclingMusicNote_Step(sprite: _ESprite): void {
  sprite.x2 = Cos(sprite.data[0] & 0xFF, 100);
  sprite.y2 = Sin(sprite.data[0] & 0xFF, 20);
  if (sprite.data[0] < 128)
    sprite.subpriority = 0;
  else
    sprite.subpriority = 14;
  sprite.data[0] = (sprite.data[0] + sprite.data[1]) & 0xFF;
  sprite.data[5] = (sprite.data[5] + 130) & 0xFFFF;
  sprite.y2 += _toS16(sprite.data[5]) >> 8;
  sprite.data[2]++;
  if (sprite.data[2] === sprite.data[3])
    _DestroyAnimSprite(sprite);
}

// defines décomp (:5288) : sMoveTimer=d0, sBlendTableIdx=d1, sBlendTimer=d2,
// sBlendCycleTime=d3, sX=d4, sY=d5, sVelocX=d6, sVelocY=d7.

/** 1:1 `AnimWavyMusicNotes_CalcVelocity` (:5328) : vélocité Q8 vers la cible,
 *  vitesse X bornée par xSpeedFactor. Retourne [velocX, velocY] — écritures
 *  `*velocX`/`*velocY` s16 en C → wrap signé _toS16. */
function _AnimWavyMusicNotes_CalcVelocity(x: number, y: number, xSpeedFactor: number): [number, number] {
  if (x < 0) xSpeedFactor = -xSpeedFactor;
  const x2 = x * 256;
  let time = Math.trunc(x2 / xSpeedFactor);
  if (time === 0) time = 1;
  return [_toS16(Math.trunc(x2 / time)), _toS16(Math.trunc((y * 256) / time))];
}

/** 1:1 `AnimWavyMusicNotes` (:5297) : note qui ondule (Sin ±15) en filant vers
 *  la cible — args [anim, blendTableIdx, blendCycleTime]. Le swap de palette
 *  rainbow ne s'applique que si AnimTask_MusicNotesRainbowBlend a chargé les
 *  palettes (sinon IndexOfSpritePaletteTag → 0xFF, no-op, 1:1). */
function AnimWavyMusicNotes(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  SetSpriteCoordsToAnimAttackerCoords(sprite as never);
  _StartSpriteAnim(sprite, args[0] | 0);
  const index = IndexOfSpritePaletteTag(gParticlesColorBlendTable[args[1] | 0][0]);
  if (index !== 0xFF)
    _setOamPaletteNum(sprite, index);

  sprite.data[1] = args[1] | 0;   // sBlendTableIdx
  sprite.data[2] = 0;             // sBlendTimer
  sprite.data[3] = args[2] | 0;   // sBlendCycleTime
  // IsContest() == false → coords cible réelles (x=48/y=40 contest élidés).
  const x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) & 0xFF;
  const y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) & 0xFF;

  sprite.data[4] = sprite.x << 4; // sX
  sprite.data[5] = sprite.y << 4; // sY
  const [velocX, velocY] = _AnimWavyMusicNotes_CalcVelocity(x - sprite.x, y - sprite.y, 40);
  sprite.data[6] = velocX;
  sprite.data[7] = velocY;
  sprite.invisible = false;
  sprite.callback = _AnimWavyMusicNotes_Step;
}

/** 1:1 `AnimWavyMusicNotes_Step` (:5344) : avance Q4, onde Sin(t*5, 15),
 *  destroy hors écran, cycle de palette rainbow optionnel. */
function _AnimWavyMusicNotes_Step(sprite: _ESprite): void {
  sprite.data[0]++;
  const trigIdx = (sprite.data[0] * 5) % 256;
  sprite.data[4] += sprite.data[6];
  sprite.data[5] += sprite.data[7];
  sprite.x = sprite.data[4] >> 4;
  sprite.y = sprite.data[5] >> 4;
  sprite.y2 = Sin(trigIdx, 15);

  const y = sprite.y;
  if (sprite.x < -16 || sprite.x > DISPLAY_WIDTH + 16 || y < -16 || y > DISPLAY_HEIGHT - 32) {
    DestroySpriteAndMatrix(sprite);
  } else {
    if (sprite.data[3] && ++sprite.data[2] > sprite.data[3]) {
      sprite.data[2] = 0;
      if (++sprite.data[1] > gParticlesColorBlendTable.length - 1)
        sprite.data[1] = 0;
      const index = IndexOfSpritePaletteTag(gParticlesColorBlendTable[sprite.data[1]][0]);
      if (index !== 0xFF)
        _setOamPaletteNum(sprite, index);
    }
  }
}

/** 1:1 `AnimFlyingMusicNotes` (:5377) : note éjectée de l'attaquant (vélocité
 *  Q4 = offset/5) avec boucle circulaire Cos/Sin(18) après 5 frames —
 *  args [anim, offsetX, offsetY]. NB : args[1] est NÉGATIVÉ in place côté
 *  adversaire (1:1 cmd->unk1 *= -1 sur gBattleAnimArgs). */
function AnimFlyingMusicNotes(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if (_side(atk) === 1)  // B_SIDE_OPPONENT
    args[1] *= -1;

  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) + (args[1] | 0);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) + (args[2] | 0);
  _StartSpriteAnim(sprite, args[0] | 0);
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = sprite.x << 4;
  sprite.data[5] = sprite.y << 4;
  sprite.data[6] = Math.trunc(((args[1] | 0) << 4) / 5);
  sprite.data[7] = Math.trunc(((args[2] | 0) << 7) / 5);
  sprite.invisible = false;
  sprite.callback = _AnimFlyingMusicNotes_Step;
}

/** 1:1 `AnimFlyingMusicNotes_Step` (:5396) : 48 frames puis destroy. */
function _AnimFlyingMusicNotes_Step(sprite: _ESprite): void {
  sprite.data[4] += sprite.data[6];
  sprite.data[5] += sprite.data[7];
  sprite.x = sprite.data[4] >> 4;
  sprite.y = sprite.data[5] >> 4;
  if (sprite.data[0] > 5 && sprite.data[3] === 0) {
    sprite.data[2] = (sprite.data[2] + 16) & 0xFF;
    sprite.x2 = Cos(sprite.data[2], 18);
    sprite.y2 = Sin(sprite.data[2], 18);
    if (sprite.data[2] === 0)
      sprite.data[3] = 1;
  }
  if (++sprite.data[0] === 48)
    DestroySpriteAndMatrix(sprite);
}

/** 1:1 `AnimBellyDrumHand` (:5415) : main qui frappe le ventre, gauche/droite
 *  selon args[0] (1 → flip H + x+16) ; 8 frames puis destroy. */
function AnimBellyDrumHand(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const atk = _vItf().getAttacker?.() ?? 0;
  let a: number;
  if ((args[0] | 0) === 1) {
    // 1:1 sprite->oam.matrixNum = ST_OAM_HFLIP (sprite non-affine → bit de flip H).
    sprite.hFlip = true;
    a = 16;
  } else {
    a = -16;
  }
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) + a;
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) + 8;
  sprite.data[0] = 8;
  sprite.invisible = false;
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimSlowFlyingMusicNotes` (:5437) : note qui monte de 40px en diagonale
 *  (±32 X) en ondulant — args [direction, anim, blendTableIdx, phase0]. */
function AnimSlowFlyingMusicNotes(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0];
  SetSpriteCoordsToAnimAttackerCoords(sprite as never);
  sprite.y += 8;
  _StartSpriteAnim(sprite, args[1] | 0);
  const index = IndexOfSpritePaletteTag(gParticlesColorBlendTable[args[2] | 0][0]);
  if (index !== 0xFF)
    _setOamPaletteNum(sprite, index);

  const xDiff = (args[0] | 0) === 0 ? -32 : 32;
  sprite.data[0] = 40;
  sprite.data[1] = sprite.x;
  sprite.data[2] = xDiff + sprite.data[1];
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.data[3] - 40;
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = args[3] | 0;
  sprite.invisible = false;
  sprite.callback = _AnimSlowFlyingMusicNotes_Step;
}

/** 1:1 `AnimSlowFlyingMusicNotes_Step` (:5461) : onde Sin(8/4) par-dessus la
 *  translation linéaire, destroy à l'arrivée. */
function _AnimSlowFlyingMusicNotes_Step(sprite: _ESprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    let xDiff = Sin(sprite.data[5], 8);
    if (sprite.x2 < 0)
      xDiff = -xDiff;
    sprite.x2 += xDiff;
    sprite.y2 += Sin(sprite.data[5], 4);
    sprite.data[5] = (sprite.data[5] + 8) & 0xFF;
  } else {
    _DestroyAnimSprite(sprite);
  }
}

// ═══════════════ THOUGHT BUBBLE / FINGERS (Metronome & co) ══════════════════

/** 1:1 `SetSpriteNextToMonHead` (battle_anim_effects_1.c:5480) : place le
 *  sprite à côté de la tête du mon (droite côté joueur, gauche côté adverse). */
export function SetSpriteNextToMonHead(battler: number, sprite: _ESprite): void {
  if (_side(battler) === 0)  // B_SIDE_PLAYER
    sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_RIGHT) + 8;
  else
    sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_LEFT) - 8;
  sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET)
    - Math.trunc(_GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_HEIGHT) / 4);
}

/** 1:1 `AnimThoughtBubble` (:5490) : bulle de pensée (anim 0/1 ouverture selon
 *  le côté), args [battler atk/tgt, durée], puis anim fermeture (n+2) et destroy. */
function AnimThoughtBubble(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0, 60];
  const battler = (args[0] | 0) === 0 ? (_vItf().getAttacker?.() ?? 0) : (_vItf().getTarget?.() ?? 1);
  SetSpriteNextToMonHead(battler, sprite);
  const animNum = _side(battler) === 0 ? 0 : 1;
  sprite.data[0] = args[1] | 0;
  sprite.data[1] = animNum + 2;
  _StartSpriteAnim(sprite, animNum);
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _AnimThoughtBubble_Step as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** 1:1 `AnimThoughtBubble_Step` (:5510). */
function _AnimThoughtBubble_Step(sprite: _ESprite): void {
  if (--sprite.data[0] === 0) {
    StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
    _StartSpriteAnim(sprite, sprite.data[1]);
    sprite.callback = _RunStoredCallbackWhenAnimEnds;
  }
}

/** 1:1 `AnimMetronomeFinger` (:5520) : doigt du Métronome à côté de la tête,
 *  args [battler atk/tgt] ; affine d'apparition puis (Step) affine 1 et destroy. */
function AnimMetronomeFinger(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const battler = (args[0] | 0) === 0 ? (_vItf().getAttacker?.() ?? 0) : (_vItf().getTarget?.() ?? 1);
  SetSpriteNextToMonHead(battler, sprite);
  sprite.data[0] = 0;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _AnimMetronomeFinger_Step as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimMetronomeFinger_Step` (:5536) — partagé avec AnimFollowMeFinger. */
function _AnimMetronomeFinger_Step(sprite: _ESprite): void {
  if (++sprite.data[0] > 16) {
    _StartSpriteAffineAnim(sprite, 1);
    StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
    sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
  }
}

/** 1:1 `AnimFollowMeFinger` (:5546) : doigt « Par Ici » au-dessus du mon
 *  (ATTR_TOP, min y=10), args [battler atk/tgt] ; balayage horizontal sinusoïdal. */
function AnimFollowMeFinger(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const battler = (args[0] | 0) === 0 ? (_vItf().getAttacker?.() ?? 0) : (_vItf().getTarget?.() ?? 1);
  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);
  sprite.y = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_TOP);
  if (sprite.y <= 9)
    sprite.y = 10;
  sprite.data[0] = 1;
  sprite.data[1] = 0;
  sprite.data[2] = sprite.subpriority ?? 0;
  sprite.data[3] = (sprite.subpriority ?? 0) + 4;
  sprite.data[4] = 0;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _AnimFollowMeFinger_Step1 as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimFollowMeFinger_Step1` (:5570). */
function _AnimFollowMeFinger_Step1(sprite: _ESprite): void {
  if (++sprite.data[4] > 12)
    sprite.callback = _AnimFollowMeFinger_Step2;
}

/** 1:1 `AnimFollowMeFinger_Step2` (:5576) : x2 = gSineTable[d1]*3/16 (forme
 *  exacte (x1>>3)+((x1>>3)>>1)), subpriority bascule selon la phase ; data[0]
 *  tours puis bascule sur AnimMetronomeFinger_Step. */
function _AnimFollowMeFinger_Step2(sprite: _ESprite): void {
  sprite.data[1] += 4;
  if (sprite.data[1] > 254) {
    if (--sprite.data[0] === 0) {
      sprite.x2 = 0;
      sprite.callback = _AnimMetronomeFinger_Step;
      return;
    } else {
      sprite.data[1] &= 0xFF;
    }
  }
  if (sprite.data[1] > 0x4F)
    sprite.subpriority = sprite.data[3];
  if (sprite.data[1] > 0x9F)
    sprite.subpriority = sprite.data[2];
  const x1 = gSineTable[sprite.data[1]];
  const x2 = x1 >> 3;
  sprite.x2 = (x1 >> 3) + (x2 >> 1);
}

/** 1:1 `AnimTauntFinger` (:5606) : doigt moqueur — anim 0/1 (pointage) selon le
 *  côté puis anim 2/3 (wag) ; args [battler atk/tgt]. */
function AnimTauntFinger(sprite: _ESprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const battler = (args[0] | 0) === 0 ? (_vItf().getAttacker?.() ?? 0) : (_vItf().getTarget?.() ?? 1);
  SetSpriteNextToMonHead(battler, sprite);
  if (_side(battler) === 0) {  // B_SIDE_PLAYER
    _StartSpriteAnim(sprite, 0);
    sprite.data[0] = 2;
  } else {
    _StartSpriteAnim(sprite, 1);
    sprite.data[0] = 3;
  }
  sprite.invisible = false;
  sprite.callback = _AnimTauntFinger_Step1;
}

/** 1:1 `AnimTauntFinger_Step1` (:5631). */
function _AnimTauntFinger_Step1(sprite: _ESprite): void {
  if (++sprite.data[1] > 10) {
    sprite.data[1] = 0;
    _StartSpriteAnim(sprite, sprite.data[0]);
    StoreSpriteCallbackInData6(sprite as never, _AnimTauntFinger_Step2 as never);
    sprite.callback = _RunStoredCallbackWhenAnimEnds;
  }
}

/** 1:1 `AnimTauntFinger_Step2` (:5642). */
function _AnimTauntFinger_Step2(sprite: _ESprite): void {
  if (++sprite.data[1] > 5)
    _DestroyAnimSprite(sprite);
}

// ─── Enregistrement par nom C exact (templates générés → callbacks portés) ───
registerAnimCallbacks({
  AnimWavyMusicNotes: AnimWavyMusicNotes as never,
  AnimFlyingMusicNotes: AnimFlyingMusicNotes as never,
  AnimSlowFlyingMusicNotes: AnimSlowFlyingMusicNotes as never,
  AnimBellyDrumHand: AnimBellyDrumHand as never,
  AnimThoughtBubble: AnimThoughtBubble as never,
  AnimMetronomeFinger: AnimMetronomeFinger as never,
  AnimFollowMeFinger: AnimFollowMeFinger as never,
  AnimTauntFinger: AnimTauntFinger as never,
  AnimIngrainRoot: AnimIngrainRoot as never,
  AnimIngrainOrb: AnimIngrainOrb as never,
  AnimPresent: AnimPresent as never,
  AnimTrickBag: AnimTrickBag as never,
  AnimNeedleArmSpike: AnimNeedleArmSpike as never,
  AnimItemSteal: AnimItemSteal as never,
  AnimCirclingMusicNote: AnimCirclingMusicNote as never,
});

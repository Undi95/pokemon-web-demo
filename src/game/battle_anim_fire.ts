/**
 * battle_anim_fire.ts — miroir PARTIEL de `src/battle_anim_fire.c`
 * (décomp pokeemeraude) : EMBER/Flammèche, goal T4 2026-06-11.
 *
 * Porté 1:1 :
 *   - gEmberSpriteTemplate (:240) + gEmberFlareSpriteTemplate (:251) —
 *     ANIM_TAG_SMALL_EMBER (10029), OAM 32x32.
 *   - callback = TranslateAnimSpriteToTargetMonLocation (battle_anim_mons.c) :
 *     LE HELPER PROJECTILE générique (vague Translate* du goal) — départ sur
 *     l'attaquant + offsets[0..1], arrivée cible + offsets[2..3], durée
 *     args[4], chaîne InitAnimLinearTranslation/AnimTranslateLinear 1:1
 *     (fixed-point avec bits de signe |1) → DestroyAnimSprite.
 *
 * GFX : small_ember.png 32x160 (5 frames) → 2560B byte-exact + gbapal.
 * VAGUE 2026-06-11 (bas de fichier) : AnimLargeFlame(+_Step)/AnimFirePlume/
 * AnimFireRing(+Steps)/AnimFireCross/AnimFireSpiralInward/AnimFireSpiralOutward
 * (+Steps)/AnimFireSpread/AnimWillOWispOrb(+_Step)/AnimWillOWispFire/
 * AnimEruptionFallingRock(+_Step) + AnimOverheatFlame(+_Step, dragon.c:425).
 * Dettes : AnimUnusedSmallEmber, AnimSunlight, AnimEmberFlare/AnimBurnFlame,
 * AnimTask_EruptionLaunchRocks(+rocks), AnimTask_MoveHeatWaveTargets.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';

export const ANIM_TAG_SMALL_EMBER = 10029; // ANIM_SPRITES_START + 29

const sSheet = { data: 'gAnimGfx_SmallEmber', size: 2560, tag: ANIM_TAG_SMALL_EMBER };
const sPal = { data: 'gAnimPal_SmallEmber', tag: ANIM_TAG_SMALL_EMBER };
export function LoadAnimSmallEmberGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_SMALL_EMBER) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

import { TranslateAnimSpriteToTargetMonLocation } from './battle_anim_mons';

registerAnimTemplates([
  { name: 'gEmberSpriteTemplate', tileTag: ANIM_TAG_SMALL_EMBER, paletteTag: ANIM_TAG_SMALL_EMBER, oam: { shape: 0, size: 2 }, load: LoadAnimSmallEmberGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
  // 1:1 gEmberFlareSpriteTemplate : même gfx, callback AnimEmberFlare (flammes
  // au point d'impact) — net-effect : même projectile court (dette douce :
  // l'oscillation flare).
  { name: 'gEmberFlareSpriteTemplate', tileTag: ANIM_TAG_SMALL_EMBER, paletteTag: ANIM_TAG_SMALL_EMBER, oam: { shape: 0, size: 2 }, load: LoadAnimSmallEmberGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
]);

// ════════════════════════════════════════════════════════════════════════════
// VAGUE FLAMMES 2026-06-11 — callbacks 1:1 de battle_anim_fire.c, + Overheat
// (battle_anim_dragon.c:425, noté « dette douce » dans battle_anim_dragon.ts).
// Pattern repo (battle_anim_rock.ts) : interface LAZY __battleAnimInterpreter
// (zéro import statique de l'interpréteur — cycle ESM) ; helpers communs
// importés de battle_anim_mons.ts ; transcriptions locales _-préfixées pour
// ceux pas encore exportés (TranslateSpriteInGrowingCircle, TranslateSpriteLinear,
// WaitAnimForDuration, InitAnimLinearTranslationWithSpeed).
// ════════════════════════════════════════════════════════════════════════════
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, SetAnimSpriteInitialXOffset,
  SetSpriteCoordsToAnimAttackerCoords, InitAnimLinearTranslation, AnimTranslateLinear,
  TranslateSpriteLinearFixedPoint, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  DestroySpriteAndMatrix, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; oamIndex?: number; callback: unknown };
function _vItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
/** Wrapper NOMMÉ stockable en data6 : 1:1 `DestroyAnimSprite` via l'interface lazy. */
function _DestroyAnimSpriteCb(sprite: unknown): void { _vItf().DestroyAnimSprite?.(sprite); }
/** Accès OAM réel du sprite (pattern battle_anim_effects_3.ts:_applyFrame) :
 *  champs plats via gba.oam[oamIndex] — pour `sprite->oam.priority/tileNum` du C. */
function _spriteOam(sprite: _VSprite): { tileId: number; priority: number } | undefined {
  if (sprite.oamIndex === undefined) return undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ tileId: number; priority: number }> } } | undefined;
  return rt?.gba?.oam?.[sprite.oamIndex];
}
/** 1:1 `StartSpriteAnim` (sprite.c) — pose animNum/animBeginning sur la table `anims`. */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}
/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) — APPROX DOCUMENTÉE :
 *  le C lit BG1CNT/BG2CNT live (GetAnimBgAttribute) selon la position ; notre
 *  runtime ne modélise pas les BG d'anim (pas de monbg) → constante 2 = la
 *  priorité OAM standard des sprites de mon en combat (battle_anim.c:1832). */
function _GetBattlerSpriteBGPriority(_battler: number): number { return 2; }

// ─── Transcriptions locales 1:1 de battle_anim_mons.c (pas encore exportées) ───

/** 1:1 `TranslateSpriteInGrowingCircle` (battle_anim_mons.c:468) : cercle dont
 *  l'amplitude évolue — data[0]=angle, [1]=ampl, [2]=vitesse angulaire, [3]=durée,
 *  [4]=vitesse d'amplitude (8.8 signée), [5]=accumulateur → stored callback. */
function _TranslateSpriteInGrowingCircle(sprite: _VSprite): void {
  if (sprite.data[3]) {
    sprite.x2 = Sin(sprite.data[0] & 0xFF, ((sprite.data[5] << 16 >> 16) >> 8) + sprite.data[1]);
    sprite.y2 = Cos(sprite.data[0] & 0xFF, ((sprite.data[5] << 16 >> 16) >> 8) + sprite.data[1]);
    sprite.data[0] += sprite.data[2];
    sprite.data[5] = (sprite.data[5] + sprite.data[4]) << 16 >> 16;
    if (sprite.data[0] >= 0x100) sprite.data[0] -= 0x100;
    else if (sprite.data[0] < 0) sprite.data[0] += 0x100;
    sprite.data[3]--;
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}
/** 1:1 `TranslateSpriteLinear` (battle_anim_mons.c:593) : x2/y2 += data[1]/data[2]
 *  (pixels ENTIERS, pas 8.8) pendant data[0] frames → stored callback. */
function _TranslateSpriteLinear(sprite: _VSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.x2 += sprite.data[1];
    sprite.y2 += sprite.data[2];
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}
/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : attend data[0] frames
 *  → stored callback. */
function _WaitAnimForDuration(sprite: _VSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 `InitAnimLinearTranslationWithSpeed` (battle_anim_mons.c:1155) :
 *  data[0]=vitesse 8.8/frame → convertie en durée (abs(dx)<<8 / vitesse),
 *  puis InitAnimLinearTranslation standard. */
function _InitAnimLinearTranslationWithSpeed(sprite: _VSprite): void {
  const v1 = Math.abs(sprite.data[2] - sprite.data[1]) << 8;
  sprite.data[0] = (v1 / sprite.data[0]) | 0; // division entière C
  InitAnimLinearTranslation(sprite as never);
}

// ─── Callbacks 1:1 ───

/** 1:1 `AnimFireSpiralInward` (battle_anim_fire.c:466) : 1ère phase de Fire
 *  Punch — spirale qui SE RESSERRE autour de l'attaquant (ampl. 60, -2 px/frame
 *  via data[4]=-512 en 8.8), 9 crans d'angle/frame, 30 frames. args [angle0]. */
function AnimFireSpiralInward(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = 0x3C;
  sprite.data[2] = 0x9;
  sprite.data[3] = 0x1E;
  sprite.data[4] = 0xFE00 << 16 >> 16; // s16 = -512 : l'amplitude DÉCROÎT
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  sprite.callback = _TranslateSpriteInGrowingCircle;
  _TranslateSpriteInGrowingCircle(sprite); // = sprite->callback(sprite) immédiat
}

/** 1:1 `AnimFireSpread` (battle_anim_fire.c:481) : éclats d'impact (Blaze Kick /
 *  Fire Punch) — offset X miroir de côté, translation 8.8 vx=args[2] vy=args[3]
 *  pendant args[4] frames → destroy. */
function AnimFireSpread(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  SetAnimSpriteInitialXOffset(sprite as never, args[0] | 0);
  sprite.y += args[1] | 0;
  sprite.data[0] = args[4] | 0;
  sprite.data[1] = args[2] | 0;
  sprite.data[2] = args[3] | 0;
  sprite.invisible = false;
  sprite.callback = TranslateSpriteLinearFixedPoint;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
}

/** 1:1 `AnimFirePlume` (battle_anim_fire.c:494) : colonne de feu ancrée sur
 *  l'attaquant — args [x, y, durée, fenêtreMvt, vx, vy] ; vx NÉGATIF côté
 *  ennemi (sens inverse d'AnimLargeFlame, 1:1 C). Chaîne AnimLargeFlame_Step. */
function AnimFirePlume(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
    sprite.x -= args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[2] = -(args[4] | 0);
  } else {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[2] = args[4] | 0;
  }
  sprite.data[1] = args[2] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.invisible = false;
  sprite.callback = AnimLargeFlame_Step;
}

/** 1:1 `AnimLargeFlame` (battle_anim_fire.c:518) : grande flamme (Flamethrower,
 *  Heat Wave…) — args [x, y, durée, fenêtreMvt, vx, vy] ; vx POSITIF côté
 *  ennemi (miroir C exact, inverse de FirePlume). */
function AnimLargeFlame(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((atk & 1) !== 0) {
    sprite.x -= args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[2] = args[4] | 0;
  } else {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[2] = -(args[4] | 0);
  }
  sprite.data[1] = args[2] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.invisible = false;
  sprite.callback = AnimLargeFlame_Step;
}
/** 1:1 `AnimLargeFlame_Step` (battle_anim_fire.c:540) : dérive x2/y2 de
 *  data[2]/data[3] tant que data[0] < data[4] ; destroy à data[0] == data[1]. */
function AnimLargeFlame_Step(sprite: _VSprite): void {
  if (++sprite.data[0] < sprite.data[4]) {
    sprite.x2 += sprite.data[2];
    sprite.y2 += sprite.data[3];
  }
  if (sprite.data[0] === sprite.data[1]) DestroySpriteAndMatrix(sprite);
}

/** 1:1 `AnimFireRing` (battle_anim_fire.c:651) : Fire Blast 1ère moitié —
 *  cercle r=28 autour de l'attaquant (18 f.), translation vers la cible en
 *  tournant, puis cercle autour de la cible (31 f.). args [x, y, angle0]. */
function AnimFireRing(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.data[7] = args[2] | 0;
  sprite.data[0] = 0;
  sprite.invisible = false;
  sprite.callback = AnimFireRing_Step1;
}
/** 1:1 `AnimFireRing_Step1` (battle_anim_fire.c:661) : cercle 18 frames puis
 *  init translation linéaire (durée 25) vers la cible. */
function AnimFireRing_Step1(sprite: _VSprite): void {
  UpdateFireRingCircleOffset(sprite);
  if (++sprite.data[0] === 0x12) {
    const tgt = _vItf().getTarget?.() ?? 1;
    sprite.data[0] = 0x19;
    sprite.data[1] = sprite.x;
    sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.data[3] = sprite.y;
    sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
    InitAnimLinearTranslation(sprite as never);
    sprite.callback = AnimFireRing_Step2;
  }
}
/** 1:1 `AnimFireRing_Step2` (battle_anim_fire.c:679) : translate en spiralant
 *  (x2/y2 += Sin/Cos r28) ; arrivé → recale sur la cible et passe au Step3. */
function AnimFireRing_Step2(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    const tgt = _vItf().getTarget?.() ?? 1;
    sprite.data[0] = 0;
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.callback = AnimFireRing_Step3;
    AnimFireRing_Step3(sprite); // = sprite->callback(sprite) immédiat
  } else {
    sprite.x2 += Sin(sprite.data[7] & 0xFF, 28);
    sprite.y2 += Cos(sprite.data[7] & 0xFF, 28);
    sprite.data[7] = (sprite.data[7] + 20) & 0xFF;
  }
}
/** 1:1 `AnimFireRing_Step3` (battle_anim_fire.c:702) : cercle autour de la
 *  cible, destroy à la frame 31. */
function AnimFireRing_Step3(sprite: _VSprite): void {
  UpdateFireRingCircleOffset(sprite);
  if (++sprite.data[0] === 0x1F) _vItf().DestroyAnimSprite?.(sprite);
}
/** 1:1 `UpdateFireRingCircleOffset` (battle_anim_fire.c:710) : offset circulaire
 *  r=28, +20 crans d'angle/frame (data[7]). */
function UpdateFireRingCircleOffset(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[7] & 0xFF, 28);
  sprite.y2 = Cos(sprite.data[7] & 0xFF, 28);
  sprite.data[7] = (sprite.data[7] + 20) & 0xFF;
}

/** 1:1 `AnimFireCross` (battle_anim_fire.c:724) : Fire Blast — les 4 branches
 *  de la croix : départ offset [args0,args1], translation linéaire ENTIÈRE
 *  vx=args[3] vy=args[4] pendant args[2] frames → destroy. */
function AnimFireCross(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  sprite.callback = _TranslateSpriteLinear;
}

/** 1:1 `AnimFireSpiralOutward` (battle_anim_fire.c:738) : Fire Spin — attend
 *  args[3] frames INVISIBLE (1:1) puis spirale qui S'ÉLARGIT depuis l'attaquant
 *  (+0xD0/frame en 8.8, +10 crans d'angle/frame) pendant args[2] frames. */
function AnimFireSpiralOutward(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0];
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.data[1] = args[2] | 0;
  sprite.data[0] = args[3] | 0;
  sprite.invisible = true; // 1:1 : caché pendant le délai
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, AnimFireSpiralOutward_Step1 as never);
}
/** 1:1 `AnimFireSpiralOutward_Step1` (battle_anim_fire.c:751). */
function AnimFireSpiralOutward_Step1(sprite: _VSprite): void {
  sprite.invisible = false;
  sprite.data[0] = sprite.data[1];
  sprite.data[1] = 0;
  sprite.callback = AnimFireSpiralOutward_Step2;
  AnimFireSpiralOutward_Step2(sprite); // = sprite->callback(sprite) immédiat
}
/** 1:1 `AnimFireSpiralOutward_Step2` (battle_anim_fire.c:762). */
function AnimFireSpiralOutward_Step2(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[1] & 0xFF, (sprite.data[2] << 16 >> 16) >> 8);
  sprite.y2 = Cos(sprite.data[1] & 0xFF, (sprite.data[2] << 16 >> 16) >> 8);
  sprite.data[1] = (sprite.data[1] + 10) & 0xFF;
  sprite.data[2] = (sprite.data[2] + 0xD0) << 16 >> 16;
  if (--sprite.data[0] === -1) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimEruptionFallingRock` (battle_anim_fire.c:1039) : rocher d'Éruption
 *  — position ABSOLUE écran [args0,args1], délai args[2], chute +8 px/frame
 *  jusqu'à y=args[3], rebond ±3 (16 f.) → destroy. args[4] = variante de tile
 *  (`oam.tileNum += args[4]*16`, 1:1 via gba.oam). */
function AnimEruptionFallingRock(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  sprite.x = args[0] | 0;
  sprite.y = args[1] | 0;
  sprite.data[0] = 0; // sState
  sprite.data[1] = 0; // sBounceTimer
  sprite.data[2] = 0; // sBounceDir
  sprite.data[6] = args[2] | 0; // sFallDelay
  sprite.data[7] = args[3] | 0; // sTargetY
  const oam = _spriteOam(sprite);
  if (oam) oam.tileId += (args[4] | 0) * 16;
  sprite.invisible = false;
  sprite.callback = AnimEruptionFallingRock_Step;
}
/** 1:1 `AnimEruptionFallingRock_Step` (battle_anim_fire.c:1054). */
function AnimEruptionFallingRock_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
  case 0:
    // Attend le début de la chute.
    if (sprite.data[6] !== 0) {
      sprite.data[6]--;
      return;
    }
    sprite.data[0]++;
    // 1:1 C `// fall through` → ré-entrée immédiate (état 1 la MÊME frame).
    AnimEruptionFallingRock_Step(sprite);
    return;
  case 1:
    // Le rocher tombe.
    sprite.y += 8;
    if (sprite.y >= sprite.data[7]) {
      sprite.y = sprite.data[7];
      sprite.data[0]++;
    }
    break;
  case 2:
    // Rebondit sur le point d'atterrissage.
    if (++sprite.data[1] > 1) {
      sprite.data[1] = 0;
      if (((++sprite.data[2]) & 1) !== 0) sprite.y2 = -3;
      else sprite.y2 = 3;
    }
    if (++sprite.data[3] > 16) _vItf().DestroyAnimSprite?.(sprite);
    break;
  }
}

/** 1:1 `AnimWillOWispOrb` (battle_anim_fire.c:1101) : orbe Feu Follet — monte
 *  (192/frame 8.8 ; vers le HAUT côté ennemi), oscille Sin ±4 (32 f.), puis
 *  translation vers la cible à vitesse 256 (8.8). args [x, y, animNum]. */
function AnimWillOWispOrb(sprite: _VSprite): void {
  switch (sprite.data[0]) {
  case 0: {
    const args = _vItf().getArgs?.() ?? [0, 0, 0];
    const atk = _vItf().getAttacker?.() ?? 0;
    InitSpritePosToAnimAttacker(sprite as never, false);
    _StartSpriteAnim(sprite, args[2] | 0);
    sprite.data[7] = args[2] | 0;
    if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) sprite.data[4] = 4;
    else sprite.data[4] = -4;
    {
      const oam = _spriteOam(sprite);
      if (oam) oam.priority = _GetBattlerSpriteBGPriority(_vItf().getTarget?.() ?? 1);
    }
    sprite.invisible = false;
    sprite.data[0]++;
    break;
  }
  case 1: {
    const atk = _vItf().getAttacker?.() ?? 0;
    sprite.data[1] = (sprite.data[1] + 192) << 16 >> 16;
    if ((atk & 1) !== 0) sprite.y2 = -(sprite.data[1] >> 8);
    else sprite.y2 = sprite.data[1] >> 8;
    sprite.x2 = Sin(sprite.data[2] & 0xFF, sprite.data[4]);
    sprite.data[2] = (sprite.data[2] + 4) & 0xFF;
    if (++sprite.data[3] === 1) {
      sprite.data[3] = 0;
      sprite.data[0]++;
    }
    break;
  }
  case 2: {
    sprite.x2 = Sin(sprite.data[2] & 0xFF, sprite.data[4]);
    sprite.data[2] = (sprite.data[2] + 4) & 0xFF;
    if (++sprite.data[3] === 31) {
      const tgt = _vItf().getTarget?.() ?? 1;
      sprite.x += sprite.x2;
      sprite.y += sprite.y2;
      sprite.y2 = 0;
      sprite.x2 = 0;
      sprite.data[0] = 256;
      sprite.data[1] = sprite.x;
      sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
      sprite.data[3] = sprite.y;
      sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
      _InitAnimLinearTranslationWithSpeed(sprite);
      sprite.callback = AnimWillOWispOrb_Step;
    }
    break;
  }
  }
}
/** 1:1 `AnimWillOWispOrb_Step` (battle_anim_fire.c:1166) : translation + onde
 *  Sin ±16 ; le SE périodique du C (SE_M_FLAME_WHEEL au passage de phase) est
 *  OMIS — règle repo « pas toucher BGM/SE » + non exposé par l'interface anim.
 *  La condition 1:1 est conservée (structure visible). */
function AnimWillOWispOrb_Step(sprite: _VSprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.x2 += Sin(sprite.data[5] & 0xFF, 16);
    const initialData5 = sprite.data[5] << 16 >> 16;
    sprite.data[5] = (sprite.data[5] + 4) & 0xFF;
    const newData5 = sprite.data[5] << 16 >> 16;
    if ((initialData5 === 0 || initialData5 > 196) && newData5 > 0 && sprite.data[7] === 0) {
      // C : PlaySE12WithPanning(SE_M_FLAME_WHEEL, gAnimCustomPanning) — omis (SE).
    }
  } else {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimWillOWispFire` (battle_anim_fire.c:1189) : flamme qui orbite la
 *  cible (ellipse 8.8 croissante : +0x180 X / +0xA0 Y par frame, +7 crans
 *  d'angle), passe devant/derrière (priorité OAM, approx _GetBattlerSpriteBG-
 *  Priority), clignote après 20 frames, destroy à 30. args [angle0].
 *  Branche IsContest() omise (pas de concours dans ce runtime). */
function AnimWillOWispFire(sprite: _VSprite): void {
  if (!sprite.data[0]) {
    const args = _vItf().getArgs?.() ?? [0];
    sprite.data[1] = args[0] | 0;
    sprite.data[0] += 1;
    sprite.invisible = false; // le runtime crée invisible ; le C crée visible
  }
  sprite.data[3] = (sprite.data[3] + 0xC0 * 2) << 16 >> 16;
  sprite.data[4] = (sprite.data[4] + 0xA0) << 16 >> 16;
  sprite.x2 = Sin(sprite.data[1] & 0xFF, sprite.data[3] >> 8);
  sprite.y2 = Cos(sprite.data[1] & 0xFF, sprite.data[4] >> 8);
  sprite.data[1] = (sprite.data[1] + 7) & 0xFF;
  {
    const oam = _spriteOam(sprite);
    if (oam) {
      const tgt = _vItf().getTarget?.() ?? 1;
      if (sprite.data[1] < 64 || sprite.data[1] > 195) oam.priority = _GetBattlerSpriteBGPriority(tgt);
      else oam.priority = _GetBattlerSpriteBGPriority(tgt) + 1;
    }
  }
  if (++sprite.data[2] > 0x14) sprite.invisible = !sprite.invisible; // ^= 1
  if (sprite.data[2] === 0x1E) _vItf().DestroyAnimSprite?.(sprite);
}

// 1:1 EWRAM `sUnusedOverheatData[7]` (battle_anim_dragon.c:19) — écrit, jamais lu.
const _sUnusedOverheatData: number[] = [0, 0, 0, 0, 0, 0, 0];
/** 1:1 `AnimOverheatFlame` (battle_anim_dragon.c:425 — Surchauffe ;
 *  gOverheatFlameSpriteTemplate, ANIM_TAG_SMALL_EMBER) : part du centre de
 *  l'attaquant + yOffset args[4], vélocité radiale [Cos(args[1])×args[2],
 *  Sin(args[1])×(args[2]·3/5)], avancée de args[0] crans au départ, vit
 *  args[3] frames. CMD_ARGS(speed, angle, ampl, durée, y). */
function AnimOverheatFlame(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const yAmplitude = (((args[2] | 0) * 3) / 5) | 0; // int C (troncature)
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) + (args[4] | 0);
  sprite.data[1] = Cos((args[1] | 0) & 0xFF, args[2] | 0);
  sprite.data[2] = Sin((args[1] | 0) & 0xFF, yAmplitude);
  sprite.x += sprite.data[1] * (args[0] | 0);
  sprite.y += sprite.data[2] * (args[0] | 0);
  sprite.data[3] = args[3] | 0;
  sprite.invisible = false;
  sprite.callback = AnimOverheatFlame_Step;
  for (let i = 0; i < 7; i++) _sUnusedOverheatData[i] = sprite.data[i];
}
/** 1:1 `AnimOverheatFlame_Step` (battle_anim_dragon.c:443) : dérive accumulée
 *  /10 (vélocité ≈ ×0.1 px/frame, troncature C), destroy après data[3] frames. */
function AnimOverheatFlame_Step(sprite: _VSprite): void {
  sprite.data[4] = (sprite.data[4] + sprite.data[1]) << 16 >> 16;
  sprite.data[5] = (sprite.data[5] + sprite.data[2]) << 16 >> 16;
  sprite.x2 = Math.trunc(sprite.data[4] / 10);
  sprite.y2 = Math.trunc(sprite.data[5] / 10);
  if (++sprite.data[0] > sprite.data[3]) _vItf().DestroyAnimSprite?.(sprite);
}

registerAnimCallbacks({
  AnimLargeFlame: AnimLargeFlame as never,
  AnimFirePlume: AnimFirePlume as never,
  AnimFireRing: AnimFireRing as never,
  AnimFireCross: AnimFireCross as never,
  AnimFireSpiralInward: AnimFireSpiralInward as never,
  AnimFireSpiralOutward: AnimFireSpiralOutward as never,
  AnimFireSpread: AnimFireSpread as never,
  AnimWillOWispOrb: AnimWillOWispOrb as never,
  AnimWillOWispFire: AnimWillOWispFire as never,
  AnimEruptionFallingRock: AnimEruptionFallingRock as never,
  AnimOverheatFlame: AnimOverheatFlame as never,
});

// ════════════════════════════════════════════════════════════════════════════
// SUNNY DAY (2026-06-11, append-only) — AnimSunlight (battle_anim_fire.c:604,
// gSunlightRaySpriteTemplate). La dette « AnimSunlight » du header est levée.
// ════════════════════════════════════════════════════════════════════════════
import { StartAnimLinearTranslation } from './battle_anim_mons';

/** 1:1 `AnimSunlight` (battle_anim_fire.c:604) : rayon de soleil (Sunny Day /
 *  météo soleil) — part du coin écran (0,0) et translate vers (140,80) en 60
 *  frames (chaîne linéaire 8.8) → destroy. */
function AnimSunlight(sprite: _VSprite): void {
  sprite.x = 0;
  sprite.y = 0;
  sprite.invisible = false;
  sprite.data[0] = 60;
  sprite.data[2] = 140;
  sprite.data[4] = 80;
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
}

registerAnimCallbacks({ AnimSunlight: AnimSunlight as never });

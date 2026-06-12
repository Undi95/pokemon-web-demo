/**
 * battle_anim_effects_1.ts — miroir PARTIEL de `src/battle_anim_effects_1.c`
 * (décomp pokeemeraude) : ABSORB orbs, goal T4 2026-06-11.
 * gAbsorptionOrbSpriteTemplate (:359, ANIM_TAG_ORBS 10147, OAM 16x16) —
 * 1:1 AnimAbsorptionOrb = projectile INVERSE (cible → attaquant, le drain).
 * GFX : orbs.png 16x48 byte-exact.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
  BlendPalettes, LoadPalette, IndexOfSpritePaletteTag, OBJ_PLTT_ID, gPlttBufferUnfaded,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, StartAnimLinearTranslation, StoreSpriteCallbackInData6, InitAnimArcTranslation, TranslateAnimHorizontalArc } from './battle_anim_mons';
import { Cos } from './trig';
import { AnimTranslateLinear, InitSpritePosToAnimTarget, InitAnimLinearTranslation, TranslateAnimHorizontalArc as ArcT, SetSpriteCoordsToAnimAttackerCoords, TranslateSpriteLinearFixedPoint, SetAnimSpriteInitialXOffset } from './battle_anim_mons';
import { SetCallbackToStoredInData6, TrySetSpriteRotScale } from './battle_anim_mons';
import { Random2 } from './random';
import { Sin } from './trig';

export const ANIM_TAG_ORBS = 10147;
const sSheet = { data: 'gAnimGfx_Orbs', size: 384, tag: ANIM_TAG_ORBS };
const sPal = { data: 'gAnimPal_Orbs', tag: ANIM_TAG_ORBS };
export function LoadAnimOrbsGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_ORBS) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean;
  callback: ((s: AnimSprite) => void) | null;
  _storedCb6?: ((s: AnimSprite) => void) | null;
};
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _battlerSprite(battler: number): AnimSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, AnimSprite> } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? rt?.gSprites?.get(id) : undefined;
}

/** 1:1 `AnimAbsorptionOrb` (battle_anim_effects_1.c) : orbe qui part de la
 *  CIBLE (+offsets args[0..1]) vers l ATTAQUANT (le drain), durée args[2].
 *  Réutilise la chaîne linéaire de battle_anim_fire (inverse). */
function AnimAbsorptionOrb(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 20];
  const tgt = _itf().getTarget?.() ?? 1;
  const atk = _itf().getAttacker?.() ?? 0;
  const monT = _battlerSprite(tgt);
  if (monT) {
    sprite.x = monT.x + (monT.x2 ?? 0) + args[0];
    sprite.y = monT.y + (monT.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  const monA = _battlerSprite(atk);
  const destX = monA ? monA.x + (monA.x2 ?? 0) : 60;
  const destY = monA ? monA.y + (monA.y2 ?? 0) : 100;
  const dur = Math.max(1, args[2] || 20);
  sprite.data[0] = dur;
  sprite.data[1] = Math.trunc(((destX - sprite.x) * 256) / dur);
  sprite.data[2] = Math.trunc(((destY - sprite.y) * 256) / dur);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.callback = _AbsorptionOrb_Step;
}
function _AbsorptionOrb_Step(sprite: AnimSprite): void {
  if (sprite.data[0] <= 0) {
    _itf().DestroyAnimSprite?.(sprite);
    return;
  }
  sprite.data[0]--;
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = (sprite.data[3] / 256) | 0;
  sprite.y2 = (sprite.data[4] / 256) | 0;
}

registerAnimTemplates([
  { name: 'gAbsorptionOrbSpriteTemplate', tileTag: ANIM_TAG_ORBS, paletteTag: ANIM_TAG_ORBS, oam: { shape: 0, size: 1 }, load: LoadAnimOrbsGfx, callback: AnimAbsorptionOrb as never },
]);

// ─── VAGUE 2b : AnimMovePowderParticle (3 tpl : poudres) + AnimFlyingParticle (5 tpl) ───
type _PSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; oamIndex?: number; callback: unknown };
function _pItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
/** 1:1 `AnimMovePowderParticle` (battle_anim_effects_1.c.c:2195) : args [x, y, durée,
 *  yVel, amplitude, vitesse] — descente + onde X. */
function AnimMovePowderParticle(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 30, 64, 10, 4];
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = 0;
  sprite.data[3] = (atk & 1) !== 0 ? -(args[4] | 0) : (args[4] | 0);
  sprite.data[4] = args[5] | 0;
  sprite.data[5] = 0;
  sprite.callback = _MovePowderParticle_Step;
}
function _MovePowderParticle_Step(sprite: _PSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.y2 = (sprite.data[2] << 16 >> 16) >> 8;
    sprite.data[2] = (sprite.data[2] + sprite.data[1]) & 0xFFFF;
    sprite.x2 = Sin(sprite.data[5] & 0xFF, sprite.data[3]);
    sprite.data[5] = (sprite.data[5] + sprite.data[4]) & 0xFF;
  } else {
    _pItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimFlyingParticle` (battle_anim_effects_1.c.c:3517) : particule qui traverse
 *  l'écran (gust/razor wind...) — args [y0, amplY, phase0, vX, dPhase, mode, anchor]. */
function AnimFlyingParticle(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0];
  const battler = !args[6] ? (_pItf().getAttacker?.() ?? 0) : (_pItf().getTarget?.() ?? 1);
  if ((battler & 1) !== 0 /* != B_SIDE_PLAYER */) {
    sprite.data[4] = 0;
    sprite.data[2] = args[3] | 0;
    sprite.x = -16;
  } else {
    sprite.data[4] = 1;
    sprite.data[2] = -(args[3] | 0);
    sprite.x = 240 + 16;
  }
  sprite.invisible = false;
  sprite.data[1] = args[1] | 0;
  sprite.data[0] = args[2] | 0;
  sprite.data[3] = args[4] | 0;
  const mode = args[5] | 0;
  if (mode === 2 || mode === 3) {
    const ref = mode === 3 ? (_pItf().getTarget?.() ?? 1) : battler;
    sprite.y = GetBattlerSpriteCoord(ref, 3 /* Y_PIC_OFFSET */) + (args[0] | 0);
  } else {
    sprite.y = args[0] | 0;
  }
  sprite.data[7] = 0;
  sprite.callback = _FlyingParticle_Step;
}
function _FlyingParticle_Step(sprite: _PSprite): void {
  const a = sprite.data[7];
  sprite.data[7]++;
  const sineTable = ((globalThis as Record<string, unknown>).__gSineTable as Int16Array | undefined);
  const sinv = sineTable ? sineTable[sprite.data[0] & 0xFF] : Math.round(Math.sin(((sprite.data[0] & 0xFF) / 256) * 2 * Math.PI) * 256);
  sprite.y2 = (sprite.data[1] * sinv) >> 8;
  sprite.x2 = sprite.data[2] * a;
  sprite.data[0] = (sprite.data[3] * a) & 0xFF;
  if (!sprite.data[4]) {
    if (sprite.x2 + sprite.x < 240 + 8) return;
  } else {
    if (sprite.x2 + sprite.x > -16) return;
  }
  _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimPowerAbsorptionOrb` (battle_anim_effects_1.c.c) : args [x, y, durée] — l'orbe
 *  converge vers le CENTRE de l'attaquant (charge type Meteor Mash/Giga Drain). */
function AnimPowerAbsorptionOrb(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 20];
  const atk = _pItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[2] = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
  sprite.data[4] = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
  StoreSpriteCallbackInData6(sprite as never, ((sp: unknown) => { _pItf().DestroyAnimSprite?.(sp); }) as never);
  // 1:1 : sprite->callback = StartAnimLinearTranslation (qui chaine WithFollowup).
  StartAnimLinearTranslation(sprite as never);
}

/** 1:1 `AnimTranslateLinearSingleSineWave` (battle_anim_effects_1.c.c, 2 tpl) : projectile
 *  en arc-sinus simple, clignote/détruit en fin (Mud-Slap, Octazooka...). */
function AnimTranslateLinearSingleSineWave(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, 20, 16, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  let tx = args[2] | 0;
  if ((atk & 1) !== 0) tx = -tx;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = (GetBattlerSpriteCoord(tgt, 2) + tx) & 0xFFFF;
  sprite.data[4] = (GetBattlerSpriteCoord(tgt, 3) + (args[3] | 0)) & 0xFFFF;
  sprite.data[5] = args[5] | 0;
  InitAnimArcTranslation(sprite as never);
  if ((atk & 1) === (tgt & 1)) sprite.data[0] = 1;
  (sprite as { _affineParam?: number })._affineParam = 0;
  sprite.callback = _TranslateLinearSingleSineWave_Step;
}
function _TranslateLinearSingleSineWave_Step(sprite: _PSprite): void {
  let destroy = false;
  const a = sprite.data[0];
  const b = sprite.data[7];
  sprite.data[0] = 1;
  TranslateAnimHorizontalArc(sprite as never);
  const r0 = sprite.data[7];
  sprite.data[0] = a;
  const spx = sprite as _PSprite & { _affineParam?: number; invisible?: boolean };
  if (b > 200 && r0 < 56 && (spx._affineParam ?? 0) === 0) spx._affineParam = (spx._affineParam ?? 0) + 1;
  if ((spx._affineParam ?? 0) && sprite.data[0]) {
    spx.invisible = !spx.invisible;
    spx._affineParam = (spx._affineParam ?? 0) + 1;
    if (spx._affineParam === 30) destroy = true;
  }
  if (sprite.x + sprite.x2 > 240 + 16 || sprite.x + sprite.x2 < -16
   || sprite.y + sprite.y2 > 160 || sprite.y + sprite.y2 < -16) destroy = true;
  if (destroy) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimMoveTwisterParticle` (battle_anim_effects_1.c.c, 2 tpl) : la particule de
 *  tornade (Cos X / Sin Y, montée, priorité alternée). */
function AnimMoveTwisterParticle(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [40, 48, 4, 20, 10];
  sprite.y += 32;
  sprite.invisible = false;
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = args[1] | 0;
  sprite.data[2] = args[2] | 0;
  sprite.data[3] = args[3] | 0;
  sprite.data[4] = args[4] | 0;
  sprite.data[5] = 0;
  sprite.callback = _MoveTwisterParticle_Step;
}
function _MoveTwisterParticle_Step(sprite: _PSprite): void {
  if (sprite.data[1] === 0xFF) {
    sprite.y -= 2;
  } else if (sprite.data[1] > 0) {
    sprite.y -= 2;
    sprite.data[1] -= 2;
  }
  sprite.data[5] += sprite.data[2];
  if (sprite.data[0] < sprite.data[4]) sprite.data[5] += sprite.data[2];
  sprite.data[5] &= 0xFF;
  sprite.x2 = Cos(sprite.data[5], sprite.data[3]);
  sprite.y2 = SinT(sprite.data[5], 5);
  if (--sprite.data[0] === 0) _pItf().DestroyAnimSprite?.(sprite);
}
function SinT(i: number, a: number): number { return Sin(i & 0xFF, a); }

/** 1:1 `AnimSolarBeamBigOrb` (battle_anim_effects_1.c.c) : orbe attaquant->cible, anim
 *  variante args[3], lineaire -> destroy. */
function AnimSolarBeamBigOrb(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 20, 0];
  const tgt = _pItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && (args[3] | 0) > 0) { spA.animNum = args[3] | 0; spA.animBeginning = true; spA.animEnded = false; }
  sprite.data[0] = args[2] | 0;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2);
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3);
  StoreSpriteCallbackInData6(sprite as never, ((sp: unknown) => { _pItf().DestroyAnimSprite?.(sp); }) as never);
  StartAnimLinearTranslation(sprite as never);
}

/** 1:1 `AnimSolarBeamSmallOrb`(+Step) : la petite orbe qui spirale autour
 *  des grosses (Sin/Cos additifs + subpriorite alternee). */
function AnimSolarBeamSmallOrb(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 20, 0];
  const tgt = _pItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3);
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = args[3] | 0;
  sprite.callback = _SolarBeamSmallOrb_Step;
  _SolarBeamSmallOrb_Step(sprite);
}
function _SolarBeamSmallOrb_Step(sprite: _PSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    _pItf().DestroyAnimSprite?.(sprite);
  } else {
    sprite.x2 += Sin(sprite.data[5] & 0xFF, 5);
    sprite.y2 += Cos(sprite.data[5] & 0xFF, 14);
    sprite.data[5] = (sprite.data[5] + 15) & 0xFF;
  }
}

/** 1:1 `AnimSporeParticle`(+Step) : la spore qui tournoie en descendant. */
function AnimSporeParticle(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 60, 0];
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.data[1] = args[2] | 0;
  sprite.data[2] = 0;
  sprite.callback = _SporeParticle_Step;
  _SporeParticle_Step(sprite);
}
function _SporeParticle_Step(sprite: _PSprite): void {
  sprite.x2 = Sin(sprite.data[1] & 0xFF, 32);
  sprite.data[2] += 24;
  sprite.y2 = Cos(sprite.data[1] & 0xFF, -3) + ((sprite.data[2] << 16 >> 16) >> 8);
  sprite.data[1] = (sprite.data[1] + 2) & 0xFF;
  if (--sprite.data[0] === -1) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimRazorLeafParticle`(+Step1/2) : la feuille monte (durée) puis
 *  oscille Sin x25 en retombant lentement ; destroy à data[1]>80. */
function AnimRazorLeafParticle(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, -4, 10];
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2);
  sprite.y = GetBattlerSpriteCoord(atk, 3);
  sprite.invisible = false;
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = args[1] | 0;
  sprite.data[2] = args[2] | 0;
  sprite.callback = _RazorLeaf_Step1;
}
function _RazorLeaf_Step1(sprite: _PSprite): void {
  if (!sprite.data[2]) {
    if (sprite.data[1] & 1) {
      sprite.data[0] = 0x80;
    } else {
      sprite.data[0] = 0;
    }
    sprite.data[1] = 0;
    sprite.data[2] = 0;
    sprite.callback = _RazorLeaf_Step2;
  } else {
    sprite.data[2]--;
    sprite.x += sprite.data[0];
    sprite.y += sprite.data[1];
  }
}
function _RazorLeaf_Step2(sprite: _PSprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  if ((atk & 1) !== 0) sprite.x2 = -Sin(sprite.data[0] & 0xFF, 25);
  else sprite.x2 = Sin(sprite.data[0] & 0xFF, 25);
  sprite.data[0] = (sprite.data[0] + 2) & 0xFF;
  sprite.data[1]++;
  if (!(sprite.data[1] & 1)) sprite.y2++;
  if (sprite.data[1] > 80) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimLeechSeed`(+Step+Sprouts) : la graine en arc, atterrit, attend 10f
 *  invisible, GERME (anim 1) 60 frames, destroy. */
function AnimLeechSeed(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, 30, 30];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  let tx = args[2] | 0;
  if ((atk & 1) !== 0) tx = -tx;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = (GetBattlerSpriteCoord(tgt, 0) + tx) & 0xFFFF;
  sprite.data[4] = (GetBattlerSpriteCoord(tgt, 1) + (args[3] | 0)) & 0xFFFF;
  sprite.data[5] = args[5] | 0;
  InitAnimArcTranslation(sprite as never);
  sprite.callback = _LeechSeed_Step;
}
function _LeechSeed_Step(sprite: _PSprite): void {
  if (ArcT(sprite as never)) {
    (sprite as { invisible?: boolean }).invisible = true;
    sprite.data[0] = 10;
    sprite.data[7] = 0;
    sprite.callback = _LeechSeed_Wait;
  }
}
function _LeechSeed_Wait(sprite: _PSprite): void {
  if (--sprite.data[0] <= 0) _LeechSeedSprouts(sprite);
}
function _LeechSeedSprouts(sprite: _PSprite): void {
  (sprite as { invisible?: boolean }).invisible = false;
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims) { spA.animNum = 1; spA.animBeginning = true; spA.animEnded = false; }
  sprite.data[0] = 60;
  sprite.callback = _LeechSeed_FinalWait;
}
function _LeechSeed_FinalWait(sprite: _PSprite): void {
  if (--sprite.data[0] <= 0) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSlidingHit` : position offset (miroir cote) puis attendre la
 *  fin de l'anim de table -> destroy. */
function AnimSlidingHit(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  if ((atk & 1) !== 0) { sprite.x -= args[0] | 0; sprite.y += args[1] | 0; }
  else { sprite.x += args[0] | 0; sprite.y += args[1] | 0; }
  sprite.invisible = false;
  sprite.callback = _WaitTableAnimEnd_Destroy;
}
function _WaitTableAnimEnd_Destroy(sprite: _PSprite): void {
  if ((sprite as { animEnded?: boolean }).animEnded) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimWhipHit` : anim 1 cote joueur, offset X signe, attendre fin. */
function AnimWhipHit(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if ((atk & 1) === 0 && spA.anims) { spA.animNum = 1; spA.animBeginning = true; spA.animEnded = false; }
  sprite.invisible = false;
  // SetAnimSpriteInitialXOffset inline (signe attaquant->cible)
  const tgt = _pItf().getTarget?.() ?? 1;
  const ax = GetBattlerSpriteCoord(atk, 0), tx = GetBattlerSpriteCoord(tgt, 0);
  if (ax > tx) sprite.x -= args[0] | 0;
  else if (ax < tx) sprite.x += args[0] | 0;
  else if ((atk & 1) !== 0) sprite.x -= args[0] | 0;
  else sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.callback = _WaitTableAnimEnd_Destroy;
}

/** 1:1 `AnimCuttingSlice`(+AnimSlice_Step) : la lame qui traverse en
 *  decrochant (data1 +/-0x18, data2 -0x18), 20 frames + 3 -> destroy. */
function AnimCuttingSlice(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0];
  const tgt = _pItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, 0);
  sprite.y = GetBattlerSpriteCoord(tgt, 1);
  if ((tgt & 1) === 0) sprite.y += 8;
  sprite.invisible = false;
  if ((args[2] | 0) === 0) {
    sprite.x += args[0] | 0;
  } else {
    sprite.x -= args[0] | 0;
    (sprite as { hFlip?: boolean }).hFlip = true;
  }
  sprite.y += args[1] | 0;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = args[2] | 0;
  sprite.callback = _Slice_Step;
}
function _Slice_Step(sprite: _PSprite): void {
  sprite.data[3] = (sprite.data[3] + sprite.data[1]) & 0xFFFF;
  sprite.data[4] = (sprite.data[4] + sprite.data[2]) & 0xFFFF;
  if (sprite.data[5] === 0) sprite.data[1] += 0x18;
  else sprite.data[1] -= 0x18;
  sprite.data[2] -= 0x18;
  sprite.x2 = (sprite.data[3] << 16 >> 16) >> 8;
  sprite.y2 = (sprite.data[4] << 16 >> 16) >> 8;
  sprite.data[0]++;
  if (sprite.data[0] === 20) {
    sprite.data[0] = 3;
    sprite.callback = _Slice_FinalWait;
  }
}
function _Slice_FinalWait(sprite: _PSprite): void {
  if (--sprite.data[0] <= 0) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimBubbleBurst`(+Step) : la bulle qui eclate — 30f sur place (anim
 *  table), puis monte en oscillant ; destroy a animEnded. */
function AnimBubbleBurst(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  sprite.invisible = false;
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if ((atk & 1) === 0) {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
  } else {
    sprite.x -= args[0] | 0;
    sprite.y += args[1] | 0;
    if (spA.anims) { spA.animNum = 1; spA.animBeginning = true; spA.animEnded = false; }
  }
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.callback = _BubbleBurst_Step;
}
function _BubbleBurst_Step(sprite: _PSprite): void {
  if (++sprite.data[0] > 30) {
    sprite.y2 = Math.trunc((30 - sprite.data[0]) / 3);
    sprite.x2 = Sin((sprite.data[1] * 4) & 0xFF, 3);
    sprite.data[1]++;
  }
  if ((sprite as { animEnded?: boolean }).animEnded) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSleepLetterZ`(+Step) : le Z qui monte en derivant (cote miroir). */
function AnimSleepLetterZ(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  sprite.invisible = false;
  if ((atk & 1) === 0) {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[3] = 1;
  } else {
    sprite.x -= args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[3] = -1;
    const spA = sprite as unknown as { affineAnimsTableName?: string; affineMode?: number };
    void spA; // StartSpriteAffineAnim(1) : variante affine cote adverse (table generee)
  }
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[4] = 0;
  sprite.callback = _SleepLetterZ_Step;
}
function _SleepLetterZ_Step(sprite: _PSprite): void {
  sprite.y2 = -Math.trunc(sprite.data[0] / 0x28);
  sprite.x2 = Math.trunc(sprite.data[4] / 10);
  sprite.data[4] += sprite.data[3] * 2;
  sprite.data[0] += sprite.data[1];
  if (++sprite.data[1] > 60) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimGrantingStars` : etoiles de stat-up — args [x, y, anchor, velX, velY, duree]. */
function AnimGrantingStars(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, -48, 24];
  if (!(args[2] | 0)) SetSpriteCoordsToAnimAttackerCoords(sprite);
  sprite.invisible = false;
  SetAnimSpriteInitialXOffset(sprite as never, args[0] | 0);
  sprite.y += args[1] | 0;
  sprite.data[0] = args[5] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  StoreSpriteCallbackInData6(sprite as never, ((sp: unknown) => { _pItf().DestroyAnimSprite?.(sp); }) as never);
  sprite.callback = TranslateSpriteLinearFixedPoint as never;
}

/** 1:1 `AnimSparklingStars` (single battle) : etoiles scintillantes —
 *  args [x, y, anchor, velX, velY, duree, coordType]. */
function AnimSparklingStars(sprite: _PSprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, 0, 30, 0];
  const battler = !(args[2] | 0) ? (_pItf().getAttacker?.() ?? 0) : (_pItf().getTarget?.() ?? 1);
  sprite.invisible = false;
  if (!(args[6] | 0)) {
    sprite.x = GetBattlerSpriteCoord(battler, 0);
    sprite.y = GetBattlerSpriteCoord(battler, 1) + (args[1] | 0);
  } else {
    sprite.x = GetBattlerSpriteCoord(battler, 2);
    sprite.y = GetBattlerSpriteCoord(battler, 3) + (args[1] | 0);
  }
  SetAnimSpriteInitialXOffset(sprite as never, args[0] | 0);
  sprite.data[0] = args[5] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  StoreSpriteCallbackInData6(sprite as never, ((sp: unknown) => { _pItf().DestroyAnimSprite?.(sp); }) as never);
  sprite.callback = TranslateSpriteLinearFixedPoint as never;
}

registerAnimCallbacks({
  AnimMovePowderParticle: AnimMovePowderParticle as never,
  AnimFlyingParticle: AnimFlyingParticle as never,
  AnimPowerAbsorptionOrb: AnimPowerAbsorptionOrb as never,
  AnimTranslateLinearSingleSineWave: AnimTranslateLinearSingleSineWave as never,
  AnimMoveTwisterParticle: AnimMoveTwisterParticle as never,
  AnimSolarBeamBigOrb: AnimSolarBeamBigOrb as never,
  AnimSolarBeamSmallOrb: AnimSolarBeamSmallOrb as never,
  AnimSporeParticle: AnimSporeParticle as never,
  AnimRazorLeafParticle: AnimRazorLeafParticle as never,
  AnimLeechSeed: AnimLeechSeed as never,
  AnimSlidingHit: AnimSlidingHit as never,
  AnimWhipHit: AnimWhipHit as never,
  AnimCuttingSlice: AnimCuttingSlice as never,
  AnimAirCutterSlice: AnimCuttingSlice as never, // 1:1 : meme Slice_Step (position avg cible — net)
  AnimBubbleBurst: AnimBubbleBurst as never,
  AnimSleepLetterZ: AnimSleepLetterZ as never,
  AnimGrantingStars: AnimGrantingStars as never,
  AnimSparklingStars: AnimSparklingStars as never,
});

// ═════════════════════════════════════════════════════════════════════════════
// VAGUE 3 (2026-06-11) : 18 callbacks miroir battle_anim_effects_1.c —
// constrict/mimic/petal dance/lock-on/horn/slices/endure/sharpen/conversion/
// moon/moonlight/super fang/hyper beam. Corps C transcrits VERBATIM (mêmes
// data[], mêmes formules fixed-point) ; GetBattlerSide(b) = (b & 1) ;
// IsContest() = false (pas de concours web).
// ═════════════════════════════════════════════════════════════════════════════
type _ESprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; subpriority?: number;
  hFlip?: boolean; vFlip?: boolean;
  animEnded?: boolean; animPaused?: boolean;
  affineAnimEnded?: boolean; affineAnimPaused?: boolean;
  shape?: number; size?: number;
  callback: unknown;
};

// constants/battle_anim.h:324-325
const SOUND_PAN_ATTACKER = -64;
const SOUND_PAN_TARGET = 63;
// constants/songs.h
const SE_M_LEER = 192;
const SE_M_SWAGGER2 = 194;
const SE_M_LOCK_ON = 210;
// constants/rgb.h : RGB(31,31,31)
const RGB_WHITE = 0x7FFF;
// constants/battle_anim.h : ANIM_SPRITES_START(10000) + 14
const ANIM_TAG_LOCK_ON = 10014;

/** 1:1 `gInclineMonCoordTable` (battle_anim_effects_1.c.c:1545, s8[][2]). */
const gInclineMonCoordTable: ReadonlyArray<readonly [number, number]> = [
  [64, 64],
  [0, -64],
  [-64, 64],
  [32, -32],
];

/** 1:1 `DestroyAnimSprite` utilisé comme VALEUR de callback (stocké en data6). */
function _destroyAnimSpriteCb(sprite: unknown): void { _pItf().DestroyAnimSprite?.(sprite); }

// ─── Helpers battle_anim_mons.c non encore exportés (transcrits localement) ───

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décompte data[0] → data6. */
function _WaitAnimForDuration(sprite: _ESprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735). */
function _RunStoredCallbackWhenAnimEnds(sprite: _ESprite): void {
  if (sprite.animEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `TranslateSpriteLinear` (battle_anim_mons.c:593) : data[0] steps,
 *  x2 += data[1], y2 += data[2] → data6. */
function _TranslateSpriteLinear(sprite: _ESprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.x2 += sprite.data[1];
    sprite.y2 += sprite.data[2];
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}

/** 1:1 `InitAnimFastLinearTranslation` (battle_anim_mons.c:1171) : vitesses
 *  u16 <<4 avec bit0 = signe. */
function _InitAnimFastLinearTranslation(sprite: _ESprite): void {
  const xDiff = sprite.data[2] - sprite.data[1];
  const yDiff = sprite.data[4] - sprite.data[3];
  const xSign = xDiff < 0;
  const ySign = yDiff < 0;
  let x2 = (Math.abs(xDiff) << 4) & 0xFFFF;
  let y2 = (Math.abs(yDiff) << 4) & 0xFFFF;
  x2 = Math.trunc(x2 / sprite.data[0]) & 0xFFFF;
  y2 = Math.trunc(y2 / sprite.data[0]) & 0xFFFF;
  if (xSign) x2 |= 1; else x2 &= ~1;
  if (ySign) y2 |= 1; else y2 &= ~1;
  sprite.data[1] = x2;
  sprite.data[2] = y2;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}

/** 1:1 `AnimFastTranslateLinear` (battle_anim_mons.c:1208) — true = arrivé. */
function _AnimFastTranslateLinear(sprite: _ESprite): boolean {
  if (!sprite.data[0]) return true;
  const v1 = sprite.data[1] & 0xFFFF;
  const v2 = sprite.data[2] & 0xFFFF;
  const x = (sprite.data[3] + v1) & 0xFFFF;
  const y = (sprite.data[4] + v2) & 0xFFFF;
  if (v1 & 1) sprite.x2 = -(x >> 4);
  else sprite.x2 = x >> 4;
  if (v2 & 1) sprite.y2 = -(y >> 4);
  else sprite.y2 = y >> 4;
  sprite.data[3] = x;
  sprite.data[4] = y;
  sprite.data[0]--;
  return false;
}

/** 1:1 `AnimFastTranslateLinearWaitEnd` (battle_anim_mons.c:1239). */
function _AnimFastTranslateLinearWaitEnd(sprite: _ESprite): void {
  if (_AnimFastTranslateLinear(sprite)) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `InitAnimFastLinearTranslationWithSpeed` (battle_anim_mons.c:1244) :
 *  data[0] = vitesse → nb de steps. */
function _InitAnimFastLinearTranslationWithSpeed(sprite: _ESprite): void {
  const xDiff = Math.abs(sprite.data[2] - sprite.data[1]) << 4;
  sprite.data[0] = Math.trunc(xDiff / sprite.data[0]);
  _InitAnimFastLinearTranslation(sprite);
}

/** 1:1 `InitAndRunAnimFastLinearTranslation` (battle_anim_mons.c:1199). */
function _InitAndRunAnimFastLinearTranslation(sprite: _ESprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  _InitAnimFastLinearTranslation(sprite);
  sprite.callback = _AnimFastTranslateLinearWaitEnd;
  _AnimFastTranslateLinearWaitEnd(sprite);
}

/** 1:1 `GetBattlerSpriteSubpriority` (battle_anim_mons.c:2035, hors contest).
 *  Single battle : GetBattlerPosition(b) = b → 0:30, 2:20, 1:40, sinon 50. */
function _GetBattlerSpriteSubpriority(battler: number): number {
  const position = battler;
  if (position === 0) return 30;      // B_POSITION_PLAYER_LEFT
  else if (position === 2) return 20; // B_POSITION_PLAYER_RIGHT
  else if (position === 1) return 40; // B_POSITION_OPPONENT_LEFT
  return 50;                          // B_POSITION_OPPONENT_RIGHT
}

/** 1:1 `StartSpriteAnim` (sprite.c:1346). */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** 1:1 `StartSpriteAffineAnim` (sprite.c:1373). */
function _StartSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** 1:1 `ChangeSpriteAffineAnim` (sprite.c:1388) — même effet au niveau de
 *  notre modèle (animNum + beginning + ended=false). */
function _ChangeSpriteAffineAnim(sprite: unknown, n: number): void {
  _StartSpriteAffineAnim(sprite, n);
}

/** 1:1 `PlaySE12WithPanning` — pattern repo (battle_controller_player.ts) :
 *  __PlaySE simple, pan stéréo non câblé. */
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}

/** 1:1 `BattleAnimAdjustPanning` (battle_anim.c:1263) hors contest ;
 *  healthBoxesData[].statusAnimActive non exposé → branche false. */
function _BattleAnimAdjustPanning(pan: number): number {
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  if ((atk & 1) === 0 /* B_SIDE_PLAYER */) {
    if ((tgt & 1) === 0) {
      if (pan === SOUND_PAN_TARGET) pan = SOUND_PAN_ATTACKER;
      else if (pan !== SOUND_PAN_ATTACKER) pan = -pan;
    }
  } else if ((tgt & 1) === 1 /* B_SIDE_OPPONENT */) {
    if (pan === SOUND_PAN_ATTACKER) pan = SOUND_PAN_TARGET;
  } else {
    pan = -pan;
  }
  if (pan > SOUND_PAN_TARGET) pan = SOUND_PAN_TARGET;
  else if (pan < SOUND_PAN_ATTACKER) pan = SOUND_PAN_ATTACKER;
  return pan;
}

/** 1:1 `GetBattlePalettesMask` (battle_anim_mons.c:1402, hors contest).
 *  anim1/anim2 (palettes ANIM_TAG allouées) non câblés — toujours appelés
 *  FALSE ici. Partner visible ≈ IsBattlerSpriteVisible (sprite existe et
 *  pas invisible) ; single battle → partenaire absent → bit non posé. */
function _GetBattlePalettesMask(battleBackground: boolean, attacker: boolean, target: boolean,
  attackerPartner: boolean, targetPartner: boolean, _anim1: boolean, _anim2: boolean): number {
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  let selectedPalettes = 0;
  if (battleBackground) selectedPalettes = 0xE; // palettes BG 1, 2, 3
  if (attacker) selectedPalettes |= 1 << (atk + 16);
  if (target) selectedPalettes |= 1 << (tgt + 16);
  if (attackerPartner) {
    const p = atk ^ 2; // BATTLE_PARTNER
    const ps = _battlerSprite(p);
    if (ps && !ps.invisible) selectedPalettes |= 1 << (p + 16);
  }
  if (targetPartner) {
    const p = tgt ^ 2;
    const ps = _battlerSprite(p);
    if (ps && !ps.invisible) selectedPalettes |= 1 << (p + 16);
  }
  return selectedPalettes >>> 0;
}

// ─── Callbacks portés ─────────────────────────────────────────────────────────

/** 1:1 `AnimHyperBeamOrb` (battle_anim_effects_1.c.c:2336) : orbe du faisceau — anim random
 *  %8, départ X_2/Y_PIC attaquant ±20 (miroir côté), translation RAPIDE vitesse
 *  random (64..95), oscillation Cos + subpriority alternée. */
function AnimHyperBeamOrb(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  const animNum = Random2();
  _StartSpriteAnim(sprite, animNum % 8);
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) sprite.x -= 20;
  else sprite.x += 20;
  const speed = Random2();
  sprite.data[0] = (speed & 31) + 64;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3);
  _InitAnimFastLinearTranslationWithSpeed(sprite);
  sprite.data[5] = Random2() & 0xFF;
  sprite.data[6] = sprite.subpriority ?? 0;
  sprite.invisible = false;
  sprite.callback = AnimHyperBeamOrb_Step;
  AnimHyperBeamOrb_Step(sprite);
}

/** 1:1 `AnimHyperBeamOrb_Step` (battle_anim_effects_1.c.c:2362). */
function AnimHyperBeamOrb_Step(sprite: _ESprite): void {
  if (_AnimFastTranslateLinear(sprite)) {
    _pItf().DestroyAnimSprite?.(sprite);
  } else {
    sprite.y2 += Cos(sprite.data[5] & 0xFF, 12);
    if (sprite.data[5] < 0x7F) sprite.subpriority = sprite.data[6];
    else sprite.subpriority = sprite.data[6] + 1;
    sprite.data[5] += 24;
    sprite.data[5] &= 0xFF;
  }
}

/** 1:1 `AnimPetalDanceBigFlower` (battle_anim_effects_1.c.c:2482) : grande fleur — descente
 *  linéaire (durée args[3]) + grand cercle Sin(32)/Cos(-5), subpriority
 *  alternée autour de l'attaquant. */
function AnimPetalDanceBigFlower(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, false);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;  // duration
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(atk, 3) + (args[2] | 0); // targetY
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = 0x40;
  sprite.callback = AnimPetalDanceBigFlower_Step;
  AnimPetalDanceBigFlower_Step(sprite);
}

/** 1:1 `AnimPetalDanceBigFlower_Step` (battle_anim_effects_1.c.c:2499). */
function AnimPetalDanceBigFlower_Step(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.x2 += Sin(sprite.data[5] & 0xFF, 32);
    sprite.y2 += Cos(sprite.data[5] & 0xFF, -5);
    if (((sprite.data[5] - 0x40) & 0xFFFF) < 0x80)
      sprite.subpriority = _GetBattlerSpriteSubpriority(atk) - 1;
    else
      sprite.subpriority = _GetBattlerSpriteSubpriority(atk) + 1;
    sprite.data[5] = (sprite.data[5] + 5) & 0xFF;
  } else {
    _pItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimPetalDanceSmallFlower` (battle_anim_effects_1.c.c:2518) : petite fleur — descente
 *  lente + balancement Sin(8), flip H aux extrêmes (data5≈59/187). */
function AnimPetalDanceSmallFlower(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;  // duration
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(atk, 3) + (args[2] | 0); // targetY
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = 0x40;
  sprite.callback = AnimPetalDanceSmallFlower_Step;
  AnimPetalDanceSmallFlower_Step(sprite);
}

/** 1:1 `AnimPetalDanceSmallFlower_Step` (battle_anim_effects_1.c.c:2535). */
function AnimPetalDanceSmallFlower_Step(sprite: _ESprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.x2 += Sin(sprite.data[5] & 0xFF, 8);
    if (((sprite.data[5] - 59) & 0xFFFF) < 5 || ((sprite.data[5] - 187) & 0xFFFF) < 5)
      sprite.hFlip = !sprite.hFlip; // 1:1 oam.matrixNum ^= ST_OAM_HFLIP
    sprite.data[5] += 5;
    sprite.data[5] &= 0xFF;
  } else {
    _pItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimConstrictBinding` (battle_anim_effects_1.c.c:2719) : corde qui SERRE la cible —
 *  affine anim args[2] (en pause), relancée args[3] fois au signal scripté
 *  gBattleAnimArgs[7] == 0xFFFF. */
function AnimConstrictBinding(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 2];
  InitSpritePosToAnimTarget(sprite as never, false);
  sprite.invisible = false;
  sprite.affineAnimPaused = true;
  _StartSpriteAffineAnim(sprite, args[2] | 0);
  sprite.data[6] = args[2] | 0;  // affineAnimation
  sprite.data[7] = args[3] | 0;  // squeezes
  sprite.callback = AnimConstrictBinding_Step1;
}

/** 1:1 `AnimConstrictBinding_Step1` (battle_anim_effects_1.c.c:2731) : attend le signal
 *  scripté args[7] == 0xFFFF (setarg) → dépause l'affine, data[0]=0x100. */
function AnimConstrictBinding_Step1(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [];
  if (((args[7] ?? 0) & 0xFFFF) === 0xFFFF) {
    sprite.affineAnimPaused = false;
    sprite.data[0] = 0x100;
    sprite.callback = AnimConstrictBinding_Step2;
  }
}

/** 1:1 `AnimConstrictBinding_Step2` (battle_anim_effects_1.c.c:2744) : ±11 sur data[0]
 *  (alternance 6 frames) ; à chaque fin d'affine → resqueeze ou destroy. */
function AnimConstrictBinding_Step2(sprite: _ESprite): void {
  if (!sprite.data[2]) sprite.data[0] += 11;
  else sprite.data[0] -= 11;
  if (++sprite.data[1] === 6) {
    sprite.data[1] = 0;
    sprite.data[2] ^= 1;
  }
  if (sprite.affineAnimEnded) {
    if (--sprite.data[7] > 0) _StartSpriteAffineAnim(sprite, sprite.data[6]);
    else _pItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimMimicOrb` (battle_anim_effects_1.c.c:2840) : orbe cible → attaquant. case 0 :
 *  pos cible+args (miroir X si cible côté joueur — MUTE args[0] comme le C),
 *  invisible ; case 1 : visible, fin d'affine → ChangeSpriteAffineAnim(1) +
 *  translation rapide (25) vers l'attaquant → destroy. */
function AnimMimicOrb(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  switch (sprite.data[0]) {
    case 0:
      if ((tgt & 1) === 0 /* B_SIDE_PLAYER */) args[0] = -(args[0] | 0);
      sprite.x = GetBattlerSpriteCoord(tgt, 0) + (args[0] | 0);
      sprite.y = GetBattlerSpriteCoord(tgt, 1) + (args[1] | 0);
      sprite.invisible = true;
      sprite.data[0]++;
      break;
    case 1:
      sprite.invisible = false;
      if (sprite.affineAnimEnded) {
        _ChangeSpriteAffineAnim(sprite, 1);
        sprite.data[0] = 25;
        sprite.data[2] = GetBattlerSpriteCoord(atk, 2);
        sprite.data[4] = GetBattlerSpriteCoord(atk, 3);
        sprite.callback = _InitAndRunAnimFastLinearTranslation;
        StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
        break;
      }
  }
}

/** 1:1 `AnimLockOnTarget` (battle_anim_effects_1.c.c:4219) : réticule Lock-On — départ
 *  (-32,-32) du centre, 20 frames, puis cascade Step1..6 (4 bonds inclinés +
 *  flash blanc + flicker final). */
function AnimLockOnTarget(sprite: _ESprite): void {
  sprite.x -= 32;
  sprite.y -= 32;
  sprite.invisible = false;
  sprite.data[0] = 20;
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step1 as never);
}

/** 1:1 `AnimLockOnTarget_Step1` (battle_anim_effects_1.c.c:4228) : alternance pause 1 frame /
 *  bond 8 frames vers gInclineMonCoordTable[data5>>8] (+SE_M_LOCK_ON). */
function AnimLockOnTarget_Step1(sprite: _ESprite): void {
  switch (sprite.data[5] & 1) {
    case 0:
      sprite.data[0] = 1;
      sprite.callback = _WaitAnimForDuration;
      StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step1 as never);
      break;
    case 1:
      sprite.x += sprite.x2;
      sprite.y += sprite.y2;
      sprite.y2 = 0;
      sprite.x2 = 0;
      sprite.data[0] = 8;
      sprite.data[2] = sprite.x + gInclineMonCoordTable[sprite.data[5] >> 8][0];
      sprite.data[4] = sprite.y + gInclineMonCoordTable[sprite.data[5] >> 8][1];
      sprite.callback = StartAnimLinearTranslation as never;
      StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step2 as never);
      sprite.data[5] += 0x100;
      _PlaySE12WithPanning(SE_M_LOCK_ON, _BattleAnimAdjustPanning(SOUND_PAN_TARGET));
      break;
  }
  sprite.data[5] ^= 1;
}

/** 1:1 `AnimLockOnTarget_Step2` (battle_anim_effects_1.c.c:4255) : 4 bonds faits → pause 10
 *  puis Step3, sinon re-Step1. */
function AnimLockOnTarget_Step2(sprite: _ESprite): void {
  if ((sprite.data[5] >> 8) === 4) {
    sprite.data[0] = 10;
    sprite.callback = _WaitAnimForDuration;
    StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step3 as never);
  } else {
    sprite.callback = AnimLockOnTarget_Step1;
  }
}

/** 1:1 `AnimLockOnTarget_Step3` (battle_anim_effects_1.c.c:4269) : réticule principal
 *  (affineParam 0) → flash blanc Step4 ; coin (1..4) → file vers son coin
 *  (±8,±8) en 6 frames puis Step5. (oam.affineParam modélisé `_affineParam`.) */
function AnimLockOnTarget_Step3(sprite: _ESprite): void {
  const spx = sprite as _ESprite & { _affineParam?: number };
  if ((spx._affineParam ?? 0) === 0) {
    sprite.data[0] = 3;
    sprite.data[1] = 0;
    sprite.data[2] = 0;
    sprite.callback = _WaitAnimForDuration;
    StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step4 as never);
  } else {
    const tgt = _pItf().getTarget?.() ?? 1;
    let a: number;
    let b: number;
    switch (spx._affineParam) {
      case 1: a = -8; b = -8; break;
      case 2: a = -8; b = 8; break;
      case 3: a = 8; b = -8; break;
      default: a = 8; b = 8; break;
    }
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[0] = 6;
    sprite.data[2] = GetBattlerSpriteCoord(tgt, 2) + a;
    sprite.data[4] = GetBattlerSpriteCoord(tgt, 3) + b;
    sprite.callback = StartAnimLinearTranslation as never;
    StoreSpriteCallbackInData6(sprite as never, AnimLockOnTarget_Step5 as never);
  }
}

/** 1:1 `AnimLockOnTarget_Step4` (battle_anim_effects_1.c.c:4315) : flash BLANC des palettes
 *  combat (BlendPalettes ±3/frame jusqu'à 16 puis redescente), au pic :
 *  recolore le réticule (couleurs 8..9 → 1..2 de sa palette OBJ — slot via
 *  tag ANIM_TAG_LOCK_ON ≡ oam.paletteNum décomp) + SE_M_LEER. */
function AnimLockOnTarget_Step4(sprite: _ESprite): void {
  if (sprite.data[2] === 0) {
    if ((sprite.data[1] += 3) > 16) sprite.data[1] = 16;
  } else if ((sprite.data[1] -= 3) < 0) {
    sprite.data[1] = 0;
  }
  BlendPalettes(_GetBattlePalettesMask(true, true, true, true, true, false, false), sprite.data[1], RGB_WHITE);
  if (sprite.data[1] === 16) {
    sprite.data[2]++;
    let pal = IndexOfSpritePaletteTag(ANIM_TAG_LOCK_ON);
    if (pal === 0xFF) pal = IndexOfSpritePaletteTag('ANIM_TAG_LOCK_ON');
    if (pal !== 0xFF) {
      const base = OBJ_PLTT_ID(pal);
      const src = new Uint16Array([gPlttBufferUnfaded[base + 8], gPlttBufferUnfaded[base + 9]]);
      LoadPalette(src, base + 1, 4 /* PLTT_SIZEOF(2) */);
    }
    _PlaySE12WithPanning(SE_M_LEER, _BattleAnimAdjustPanning(SOUND_PAN_TARGET));
  } else if (sprite.data[1] === 0) {
    sprite.callback = AnimLockOnTarget_Step5;
  }
}

/** 1:1 `AnimLockOnTarget_Step5` (battle_anim_effects_1.c.c:4342) : attend le signal scripté
 *  args[7] == 0xFFFF → flicker final. */
function AnimLockOnTarget_Step5(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [];
  if (((args[7] ?? 0) & 0xFFFF) === 0xFFFF) {
    sprite.data[1] = 0;
    sprite.data[0] = 0;
    sprite.callback = AnimLockOnTarget_Step6;
  }
}

/** 1:1 `AnimLockOnTarget_Step6` (battle_anim_effects_1.c.c:4353) : flicker toutes les 3
 *  frames ×8 → destroy. */
function AnimLockOnTarget_Step6(sprite: _ESprite): void {
  if (sprite.data[0] % 3 === 0) {
    sprite.data[1]++;
    sprite.invisible = !sprite.invisible;
  }
  sprite.data[0]++;
  if (sprite.data[1] === 8) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimLockOnMoveTarget` (battle_anim_effects_1.c.c:4366) : coin du réticule — args[0]
 *  1..4 = coin (offsets ±0x18 + flips OAM), tile +16 (partie coin de la sheet
 *  LOCK_ON), puis chaîne AnimLockOnTarget. */
function AnimLockOnMoveTarget(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0];
  const spx = sprite as _ESprite & { _affineParam?: number; tileBase?: number; sheetTileStart?: number };
  spx._affineParam = args[0] | 0; // 1:1 sprite->oam.affineParam = cmd->unk0
  if ((args[0] | 0) === 1) {
    sprite.x -= 0x18;
    sprite.y -= 0x18;
  } else if ((args[0] | 0) === 2) {
    sprite.x -= 0x18;
    sprite.y += 0x18;
    sprite.vFlip = true;  // 1:1 oam.matrixNum = ST_OAM_VFLIP
  } else if ((args[0] | 0) === 3) {
    sprite.x += 0x18;
    sprite.y -= 0x18;
    sprite.hFlip = true;  // 1:1 oam.matrixNum = ST_OAM_HFLIP
  } else {
    sprite.x += 0x18;
    sprite.y += 0x18;
    sprite.hFlip = true;  // 1:1 oam.matrixNum = ST_OAM_HFLIP | ST_OAM_VFLIP
    sprite.vFlip = true;
  }
  // 1:1 sprite->oam.tileNum += 16 : la sheet LOCK_ON = réticule 32x32
  // (16 tiles) puis coin 16x16 ; le runtime recalcule oam.tileNum depuis la
  // base → on décale les DEUX bases modélisées.
  if (typeof spx.tileBase === 'number') spx.tileBase += 16;
  if (typeof spx.sheetTileStart === 'number') spx.sheetTileStart += 16;
  sprite.callback = AnimLockOnTarget as never;
  AnimLockOnTarget(sprite);
}

/** 1:1 `AnimSlashSlice` (battle_anim_effects_1.c.c:4696) : entaille sur attaquant (args[0]=0)
 *  ou cible (X_2/Y_PIC + args[1..2]), anim de table → flicker Step3 → destroy. */
function AnimSlashSlice(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [1, 0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0) {
    sprite.x = GetBattlerSpriteCoord(atk, 2) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, 3) + (args[2] | 0);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, 2) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(tgt, 3) + (args[2] | 0);
  }
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  StoreSpriteCallbackInData6(sprite as never, AnimFalseSwipeSlice_Step3 as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** 1:1 `AnimFalseSwipeSlice` (battle_anim_effects_1.c.c:4717) : entaille à -48px (0xFFD0 s16)
 *  de la cible, anim de table → Step1 (glisse) → flicker → destroy. */
function AnimFalseSwipeSlice(sprite: _ESprite): void {
  const tgt = _pItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, 2) - 48; // + 0xFFD0 (s16)
  sprite.y = GetBattlerSpriteCoord(tgt, 3);
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, AnimFalseSwipeSlice_Step1 as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** 1:1 `AnimFalseSwipePositionedSlice` (battle_anim_effects_1.c.c:4725) : entaille positionnée
 *  -48+args[0], anim 1, flicker Step3 direct. */
function AnimFalseSwipePositionedSlice(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0];
  const tgt = _pItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, 2) - 48 + (args[0] | 0);
  sprite.y = GetBattlerSpriteCoord(tgt, 3);
  sprite.invisible = false;
  _StartSpriteAnim(sprite, 1);
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.callback = AnimFalseSwipeSlice_Step3;
}

/** 1:1 `AnimFalseSwipeSlice_Step1` (battle_anim_effects_1.c.c:4737) : 8 frames puis glisse
 *  linéaire (12 steps de +8 en X). */
function AnimFalseSwipeSlice_Step1(sprite: _ESprite): void {
  if (++sprite.data[0] > 8) {
    sprite.data[0] = 12;
    sprite.data[1] = 8;
    sprite.data[2] = 0;
    StoreSpriteCallbackInData6(sprite as never, AnimFalseSwipeSlice_Step2 as never);
    sprite.callback = _TranslateSpriteLinear;
  }
}

/** 1:1 `AnimFalseSwipeSlice_Step2` (battle_anim_effects_1.c.c:4749). */
function AnimFalseSwipeSlice_Step2(sprite: _ESprite): void {
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.callback = AnimFalseSwipeSlice_Step3;
}

/** 1:1 `AnimFalseSwipeSlice_Step3` (battle_anim_effects_1.c.c:4756) : flicker 1 frame sur 2,
 *  ×8 → destroy. */
function AnimFalseSwipeSlice_Step3(sprite: _ESprite): void {
  if (++sprite.data[0] > 1) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
    if (++sprite.data[1] > 8) _pItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimEndureEnergy` (battle_anim_effects_1.c.c:4767) : flamme d'Endure sur attaquant
 *  (args[0]=0) ou cible (COORD_X/Y + args[1..2]) — monte par paliers
 *  (data[0] cycle 0..args[3]). */
function AnimEndureEnergy(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 2];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0) {
    sprite.x = GetBattlerSpriteCoord(atk, 0) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, 1) + (args[2] | 0);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, 0) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(tgt, 1) + (args[2] | 0);
  }
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = args[3] | 0;
  sprite.callback = AnimEndureEnergy_Step;
}

/** 1:1 `AnimEndureEnergy_Step` (battle_anim_effects_1.c.c:4787) — `y -= data[0]` VERBATIM
 *  (:4795, montée accélérée par paliers) ; destroy à animEnded. */
function AnimEndureEnergy_Step(sprite: _ESprite): void {
  if (++sprite.data[0] > sprite.data[1]) {
    sprite.data[0] = 0;
    sprite.y--;
  }
  sprite.y -= sprite.data[0];
  if (sprite.animEnded) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSharpenSphere` (battle_anim_effects_1.c.c:4800) : sphère Sharpen au-dessus de
 *  l'attaquant (Y_PIC-12), flicker s'élargissant + SE_M_SWAGGER2 un cycle
 *  visible sur deux → destroy (animEnded & data[1]>16 & invisible). */
function AnimSharpenSphere(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2);
  sprite.y = GetBattlerSpriteCoord(atk, 3) - 12;
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 2;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = _BattleAnimAdjustPanning(SOUND_PAN_ATTACKER);
  sprite.callback = AnimSharpenSphere_Step;
}

/** 1:1 `AnimSharpenSphere_Step` (battle_anim_effects_1.c.c:4813). */
function AnimSharpenSphere_Step(sprite: _ESprite): void {
  if (++sprite.data[0] >= sprite.data[1]) {
    sprite.invisible = !sprite.invisible;
    if (!sprite.invisible) {
      sprite.data[4]++;
      if (!(sprite.data[4] & 1)) _PlaySE12WithPanning(SE_M_SWAGGER2, sprite.data[5]);
    }
    sprite.data[0] = 0;
    if (++sprite.data[2] > 1) {
      sprite.data[2] = 0;
      sprite.data[1]++;
    }
  }
  if (sprite.animEnded && sprite.data[1] > 16 && sprite.invisible)
    _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimConversion` (battle_anim_effects_1.c.c:4837) : carré Conversion sur l'attaquant
 *  (COORD_X/Y + args[0..1]), détruit au signal scripté args[7] == 0xFFFF
 *  (posé par AnimTask_ConversionAlphaBlend). */
function AnimConversion(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  if (sprite.data[0] === 0) {
    sprite.x = GetBattlerSpriteCoord(atk, 0) + (args[0] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, 1) + (args[1] | 0);
    sprite.invisible = false;
    // IsContest() → y += 10 : pas de concours web.
    sprite.data[0]++;
  }
  if (((args[7] ?? 0) & 0xFFFF) === 0xFFFF) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimConversion2` (battle_anim_effects_1.c.c:4881) : carré sur la CIBLE, anim en
 *  pause args[2] frames puis file vers l'attaquant (30 frames) → destroy. */
function AnimConversion2(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0];
  InitSpritePosToAnimTarget(sprite as never, false);
  sprite.invisible = false;
  sprite.animPaused = true;
  sprite.data[0] = args[2] | 0;
  sprite.callback = AnimConversion2_Step;
}

/** 1:1 `AnimConversion2_Step` (battle_anim_effects_1.c.c:4891). */
function AnimConversion2_Step(sprite: _ESprite): void {
  if (sprite.data[0]) {
    sprite.data[0]--;
  } else {
    const atk = _pItf().getAttacker?.() ?? 0;
    sprite.animPaused = false;
    sprite.data[0] = 30;
    sprite.data[2] = GetBattlerSpriteCoord(atk, 2);
    sprite.data[4] = GetBattlerSpriteCoord(atk, 3);
    sprite.callback = StartAnimLinearTranslation as never;
    StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
  }
}

/** 1:1 `AnimMoon` (battle_anim_effects_1.c.c:4946) : la lune de Moonlight (64x64, position
 *  args[0..1]) — reste affichée jusqu'au signal data[0] (posé par
 *  AnimTask_MoonlightEndFade, non porté → cleanup fin d'anim). */
function AnimMoon(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [120, 56];
  // IsContest() → (48,40) : pas de concours web.
  sprite.x = args[0] | 0;
  sprite.y = args[1] | 0;
  sprite.invisible = false;
  sprite.shape = 0; // 1:1 oam.shape = SPRITE_SHAPE(64x64)
  sprite.size = 3;  // 1:1 oam.size = SPRITE_SIZE(64x64)
  sprite.data[0] = 0;
  sprite.callback = AnimMoon_Step;
}

/** 1:1 `AnimMoon_Step` (battle_anim_effects_1.c.c:4967). */
function AnimMoon_Step(sprite: _ESprite): void {
  if (sprite.data[0]) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimMoonlightSparkle` (battle_anim_effects_1.c.c:4973) : étincelle de Moonlight —
 *  descend 1px / 2 frames (120 max) jusqu'au signal data[0]. */
function AnimMoonlightSparkle(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2) + (args[0] | 0);
  sprite.y = args[1] | 0;
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 1;
  sprite.callback = AnimMoonlightSparkle_Step;
}

/** 1:1 `AnimMoonlightSparkle_Step` (battle_anim_effects_1.c.c:4987). */
function AnimMoonlightSparkle_Step(sprite: _ESprite): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    if (sprite.data[2] < 120) {
      sprite.y++;
      sprite.data[2]++;
    }
  }
  if (sprite.data[0]) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimHornHit` (battle_anim_effects_1.c.c:5108) : la corne file vers le point d'impact
 *  cible+args[0..1] en args[2] frames (fixed-point <<7, clamp 2..0x7F — MUTE
 *  args[2] comme le C), flips côté adverse ; snap au point d'impact à
 *  data[1]==1 → destroy. */
function AnimHornHit(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 8];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  if ((args[2] | 0) < 2) args[2] = 2;
  if ((args[2] | 0) > 0x7F) args[2] = 0x7F;
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = args[2] | 0;
  sprite.x = GetBattlerSpriteCoord(tgt, 2) + (args[0] | 0);
  sprite.y = GetBattlerSpriteCoord(tgt, 3) + (args[1] | 0);
  sprite.data[6] = sprite.x;
  sprite.data[7] = sprite.y;
  if ((atk & 1) === 0 /* B_SIDE_PLAYER */) {
    sprite.x -= 40;
    sprite.y += 20;
    sprite.data[2] = sprite.x << 7;
    sprite.data[3] = Math.trunc(0x1400 / sprite.data[1]);
    sprite.data[4] = sprite.y << 7;
    sprite.data[5] = Math.trunc(-0xA00 / sprite.data[1]);
  } else {
    sprite.x += 40;
    sprite.y -= 20;
    sprite.data[2] = sprite.x << 7;
    sprite.data[3] = Math.trunc(-0x1400 / sprite.data[1]);
    sprite.data[4] = sprite.y << 7;
    sprite.data[5] = Math.trunc(0xA00 / sprite.data[1]);
    sprite.hFlip = true; // 1:1 oam.matrixNum = ST_OAM_HFLIP | ST_OAM_VFLIP
    sprite.vFlip = true;
  }
  sprite.callback = AnimHornHit_Step;
}

/** 1:1 `AnimHornHit_Step` (battle_anim_effects_1.c.c:5157). */
function AnimHornHit_Step(sprite: _ESprite): void {
  sprite.data[2] += sprite.data[3];
  sprite.data[4] += sprite.data[5];
  sprite.x = sprite.data[2] >> 7;
  sprite.y = sprite.data[4] >> 7;
  if (--sprite.data[1] === 1) {
    sprite.x = sprite.data[6];
    sprite.y = sprite.data[7];
  }
  if (sprite.data[1] === 0) _pItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSuperFang` (battle_anim_effects_1.c.c:5245) : anim de table → destroy à la fin. */
function AnimSuperFang(sprite: _ESprite): void {
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

registerAnimCallbacks({
  AnimConstrictBinding: AnimConstrictBinding as never,
  AnimMimicOrb: AnimMimicOrb as never,
  AnimPetalDanceBigFlower: AnimPetalDanceBigFlower as never,
  AnimPetalDanceSmallFlower: AnimPetalDanceSmallFlower as never,
  AnimLockOnTarget: AnimLockOnTarget as never,
  AnimLockOnMoveTarget: AnimLockOnMoveTarget as never,
  AnimHornHit: AnimHornHit as never,
  AnimSlashSlice: AnimSlashSlice as never,
  AnimFalseSwipeSlice: AnimFalseSwipeSlice as never,
  AnimFalseSwipePositionedSlice: AnimFalseSwipePositionedSlice as never,
  AnimEndureEnergy: AnimEndureEnergy as never,
  AnimSharpenSphere: AnimSharpenSphere as never,
  AnimConversion: AnimConversion as never,
  AnimConversion2: AnimConversion2 as never,
  AnimMoon: AnimMoon as never,
  AnimMoonlightSparkle: AnimMoonlightSparkle as never,
  AnimSuperFang: AnimSuperFang as never,
  AnimHyperBeamOrb: AnimHyperBeamOrb as never,
});

// ═════════════════════════════════════════════════════════════════════════════
// VAGUE 3bis (2026-06-11) : 3 callbacks dont le corps C vit dans
// `battle_anim_effects_2.c` (binning du lot orchestrateur). Transcrits VERBATIM
// depuis ce fichier-là. DETTE DOUCE placement : à déplacer dans un futur miroir
// src/game/battle_anim_effects_2.ts quand il existera.
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _ESprite): void {
  if (sprite.affineAnimEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 BIOS `ArcTan2` (syscall, u16 0-65535) + `ArcTan2Neg` (battle_anim_mons.c:1368).
 *  Même approx que le repo (battle_anim_effects_1b.ts / decomp-bridge.ts). */
function _ArcTan2Neg(x: number, y: number): number {
  const a = ((Math.atan2(y, x) / (2 * Math.PI)) * 65536) | 0;
  return (-a) & 0xFFFF;
}

/** 1:1 `AnimSwordsDanceBlade` (battle_anim_effects_2.c:1470) : épée posée sur
 *  l'attaquant (+args[0..1]) — attend la fin de l'affine anim (grow) puis Step. */
function AnimSwordsDanceBlade(sprite: _ESprite): void {
  InitSpritePosToAnimAttacker(sprite, false);
  sprite.invisible = false;
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, AnimSwordsDanceBlade_Step as never);
}

/** 1:1 `AnimSwordsDanceBlade_Step` (battle_anim_effects_2.c:1477) : l'épée
 *  monte de 32 px en 6 frames (translation linéaire) puis destroy. */
function AnimSwordsDanceBlade_Step(sprite: _ESprite): void {
  sprite.data[0] = 6;
  sprite.data[2] = sprite.x;
  sprite.data[4] = sprite.y - 32;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
}

/** 1:1 `AnimSonicBoomProjectile` (battle_anim_effects_2.c:1493) : projectile
 *  attaquant → cible, sprite tourné dans la direction du mouvement
 *  (ArcTan2Neg + 0xF000). Miroir côté : négation args[1..3] en MUTANT les args
 *  vifs comme le C (vue par InitSpritePosToAnimAttacker). IsContest()=false. */
function AnimSonicBoomProjectile(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  const tgt = _pItf().getTarget?.() ?? 1;
  // IsContest() == false → seule la branche else-if subsiste.
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) {
    args[2] = -(args[2] | 0);
    args[1] = -(args[1] | 0);
    args[3] = -(args[3] | 0);
  }
  InitSpritePosToAnimAttacker(sprite, true);
  sprite.invisible = false;
  const targetXPos = ((GetBattlerSpriteCoord(tgt, 2 /* X_2 */) + (args[2] | 0)) << 16) >> 16;
  const targetYPos = ((GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */) + (args[3] | 0)) << 16) >> 16;
  let rotation = _ArcTan2Neg(targetXPos - sprite.x, targetYPos - sprite.y);
  rotation = (rotation + 0xF000) & 0xFFFF; // u16 wrap
  // IsContest() == false → pas de rotation -= 0x6000.
  const sid = (sprite as { spriteId?: number }).spriteId;
  if (sid !== undefined) TrySetSpriteRotScale(sid, false, 0x100, 0x100, rotation);
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = targetXPos;
  sprite.data[4] = targetYPos;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _destroyAnimSpriteCb as never);
}

/** 1:1 `AnimFurySwipes` (battle_anim_effects_2.c:3607) : griffure — offsets
 *  args[0..1] depuis la position de création, anim de table args[2], destroy
 *  quand l'anim est finie. */
function AnimFurySwipes(sprite: _ESprite): void {
  if (sprite.data[0] === 0) {
    const args = _pItf().getArgs?.() ?? [0, 0, 0];
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    _StartSpriteAnim(sprite, args[2] | 0);
    sprite.invisible = false;
    sprite.data[0]++;
  } else if (sprite.animEnded) {
    _pItf().DestroyAnimSprite?.(sprite);
  }
}

registerAnimCallbacks({
  AnimSwordsDanceBlade: AnimSwordsDanceBlade as never,
  AnimSonicBoomProjectile: AnimSonicBoomProjectile as never,
  AnimFurySwipes: AnimFurySwipes as never,
});

// ═════════════════════════════════════════════════════════════════════════════
// VAGUE « Protect / Milk Drink / Bow » (2026-06-11, append-only) :
// AnimProtect (+_Step, battle_anim_effects_1.c.c:3922/:3944), AnimMilkBottle (+_Step1/_Step2,
// :3987/:4003/:4078), AnimBowMon (+_Step1.._Step4, :4400-:4503).
// Plomberie du bloc préfixée _p1 (anti-collision vagues parallèles).
// ═════════════════════════════════════════════════════════════════════════════
// Imports additionnels du bloc (hoistés ESM — légal en fin de fichier) :
import {
  PrepareBattlerSpriteForRotScale as _p1PrepRotScale,
  SetSpriteRotScale as _p1SetRotScale,
  SetBattlerSpriteYOffsetFromRotation as _p1YOffFromRot,
  ResetSpriteRotScale as _p1ResetRotScale,
} from './battle_anim_mons';

// constants/battle_anim.h : ANIM_SPRITES_START(10000) + 280
const ANIM_TAG_PROTECT = 10280;

/** Runtime lazy du bloc (GPU regs + gSprites + palettes) — pattern repo. */
function _p1Rt(): {
  SetGpuReg?: (off: number, v: number) => void;
  gSprites?: Map<number, { x2: number; y2: number }>;
  gba?: { oam?: Array<{ priority?: number }> };
  gPlttBufferFaded?: { get: (i: number) => number; set: (i: number, v: number) => void };
} | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
/** s16 (= cast/stockage s16 data[] décomp). */
function _p1S16(v: number): number { return (v << 16) >> 16; }
/** 1:1 `GetBattlerSide(b)` — 0 = B_SIDE_PLAYER. */
function _p1Side(b: number): number { return b & 1; }
/** io_reg.h `BLDALPHA_BLEND(target1, target2)` = target1 | target2 << 8. */
function _p1BldAlphaBlend(target1: number, target2: number): number {
  return ((target1 & 0xFF) | ((target2 & 0xFF) << 8)) & 0xFFFF;
}
/** Miroir `sprite->oam.priority = n` (OAM brute via oamIndex — pattern ice/fight). */
function _p1SetOamPriority(sprite: unknown, priority: number): void {
  const sp = sprite as { oamIndex?: number };
  const oam = sp.oamIndex !== undefined ? _p1Rt()?.gba?.oam?.[sp.oamIndex] : undefined;
  if (oam) oam.priority = priority & 3;
}
/** gBattlerSpriteIds[battler] (surface __battleControllerOpponent — pattern repo). */
function _p1BattlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return (id === undefined || id === null || id < 0) ? 0xFF : id;
}
/** 1:1 `GetBattlerSpriteCoord2` (battle_anim_mons.c:294) : ≡ GetBattlerSpriteCoord
 *  sauf la source species (gAnimBattlerSpecies vs party live) — Transform/Contest
 *  non modélisés → délégation strictement identique (précédent battle_anim_bug). */
function _p1GetBattlerSpriteCoord2(battler: number, coordType: number): number {
  return GetBattlerSpriteCoord(battler, coordType);
}
/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) — IsContest()=false ;
 *  GetAnimBgAttribute(2/1, BG_ANIM_PRIORITY) → 2/1 (valeurs vanilla posées par le
 *  setup anim du runtime ; position = battler en simples — précédent effects_3). */
function _p1GetBattlerSpriteBGPriority(battler: number): number {
  const position = battler;
  if (position === 0 || position === 3) return 2; // PLAYER_LEFT / OPPONENT_RIGHT
  else return 1;
}
/** 1:1 `TranslateSpriteLinearById` (battle_anim_mons.c:651) : déplace le sprite
 *  d'id data[3] de (data[1], data[2]) pendant data[0] frames → data6. */
function _p1TranslateSpriteLinearById(sprite: _ESprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    const target = _p1Rt()?.gSprites?.get(sprite.data[3]);
    if (target) {
      target.x2 += sprite.data[1];
      target.y2 += sprite.data[2];
    }
  } else {
    SetCallbackToStoredInData6(sprite as never);
  }
}
/** 1:1 `DestroyAnimSpriteAndDisableBlend` (battle_anim_mons.c:741). */
function _p1DestroyAnimSpriteAndDisableBlend(sprite: _ESprite): void {
  const rt = _p1Rt();
  rt?.SetGpuReg?.(0x50 /* REG_OFFSET_BLDCNT */, 0);
  rt?.SetGpuReg?.(0x52 /* REG_OFFSET_BLDALPHA */, 0);
  _pItf().DestroyAnimSprite?.(sprite);
}

// ─── AnimProtect (battle_anim_effects_1.c.c:3922) — gProtectSpriteTemplate (ObjBlend 64x64) ─

/** 1:1 `AnimProtect` (battle_anim_effects_1.c.c:3922) : le mur de Protect/Detect — position
 *  attaquant via GetBattlerSpriteCoord2 (+args[0..1]), priorité BG (+1 côté
 *  joueur), blend BLDCNT TGT2_ALL (EVA 0/EVB 16 au départ), data[0]=durée
 *  (args[2]), data[2]=base palette OBJ du tag PROTECT (rotation de teinte). */
function AnimProtect(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0, 0, 0];
  const atk = _pItf().getAttacker?.() ?? 0;
  // if (IsContest()) cmd->unk1 += 8; — IsContest()=false (doctrine repo).
  sprite.x = _p1GetBattlerSpriteCoord2(atk, 0 /* BATTLER_COORD_X */) + (args[0] | 0);
  sprite.y = _p1GetBattlerSpriteCoord2(atk, 1 /* BATTLER_COORD_Y */) + (args[1] | 0);
  if (_p1Side(atk) === 0 /* B_SIDE_PLAYER */ /* || IsContest() */)
    _p1SetOamPriority(sprite, _p1GetBattlerSpriteBGPriority(atk) + 1);
  else
    _p1SetOamPriority(sprite, _p1GetBattlerSpriteBGPriority(atk));

  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[2] = OBJ_PLTT_ID(IndexOfSpritePaletteTag(ANIM_TAG_PROTECT));
  sprite.data[7] = 16;
  const rt = _p1Rt();
  rt?.SetGpuReg?.(0x50 /* BLDCNT */, 0x3F40 /* BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND */);
  rt?.SetGpuReg?.(0x52 /* BLDALPHA */, _p1BldAlphaBlend(16 - sprite.data[7], sprite.data[7]));
  sprite.callback = AnimProtect_Step;
}

/** 1:1 `AnimProtect_Step` (battle_anim_effects_1.c.c:3944) : dérive X fixed-point (-data[5]>>8,
 *  +96/frame), rotation des couleurs 1..7 de la palette du tag toutes les 2
 *  frames, fade-in EVA jusqu'à 10 (data[7]>6) pendant la durée, puis fade-out
 *  (data[7]→16) → invisible + DestroyAnimSpriteAndDisableBlend. */
function AnimProtect_Step(sprite: _ESprite): void {
  sprite.data[5] = _p1S16(sprite.data[5] + 96);
  sprite.x2 = -(sprite.data[5] >> 8);
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    const pb = _p1Rt()?.gPlttBufferFaded;
    // Garde runtime : palette du tag non chargée (IndexOfSpritePaletteTag=0xFF
    // → index hors PLTT) → skip la rotation de teinte, flux blend conservé.
    // Décomp : impossible (loadspritegfx la charge toujours avant).
    if (pb && sprite.data[2] + 8 <= 512) {
      const savedPal = pb.get(sprite.data[2] + 1);
      let i = 0;
      while (i < 6) {
        const id = sprite.data[2] + (++i);
        pb.set(id, pb.get(id + 1));
      }
      pb.set(sprite.data[2] + 7, savedPal);
    }
  }

  if (sprite.data[7] > 6 && sprite.data[0] > 0 && ++sprite.data[6] > 1) {
    sprite.data[6] = 0;
    sprite.data[7] -= 1;
    _p1Rt()?.SetGpuReg?.(0x52, _p1BldAlphaBlend(16 - sprite.data[7], sprite.data[7]));
  }

  if (sprite.data[0] > 0) {
    sprite.data[0] -= 1;
  } else if (++sprite.data[6] > 1) {
    sprite.data[6] = 0;
    sprite.data[7]++;
    _p1Rt()?.SetGpuReg?.(0x52, _p1BldAlphaBlend(16 - sprite.data[7], sprite.data[7]));
    if (sprite.data[7] === 16) {
      sprite.invisible = true;
      sprite.callback = _p1DestroyAnimSpriteAndDisableBlend;
    }
  }
}

// ─── AnimMilkBottle (battle_anim_effects_1.c.c:3987) — gMilkBottleSpriteTemplate ───────────

/** 1:1 `AnimMilkBottle` (battle_anim_effects_1.c.c:3987) : la bouteille de Milk Drink —
 *  centrée cible, y-24 (0xFFE8 s16), blend EVA0/EVB16, fade-in (Step1 case 0)
 *  → bascule affine 1 (case 1) → balancement (Step2) + descente + fade-out
 *  (case 2) → invisible → reset blend + destroy. */
function AnimMilkBottle(sprite: _ESprite): void {
  const tgt = _pItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, 2 /* BATTLER_COORD_X_2 */);
  sprite.y = _p1S16(GetBattlerSpriteCoord(tgt, 3 /* BATTLER_COORD_Y_PIC_OFFSET */) + 0xFFE8); // y - 24 (s16 1:1)
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[6] = 0;
  sprite.data[7] = 16;
  const rt = _p1Rt();
  rt?.SetGpuReg?.(0x50 /* BLDCNT */, 0x3F40 /* BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND */);
  rt?.SetGpuReg?.(0x52 /* BLDALPHA */, _p1BldAlphaBlend(sprite.data[6], sprite.data[7]));
  sprite.callback = AnimMilkBottle_Step1;
}

/** 1:1 `AnimMilkBottle_Step1` (battle_anim_effects_1.c.c:4003). */
function AnimMilkBottle_Step1(sprite: _ESprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[2] > 0) {
        sprite.data[2] = 0;
        if (((++sprite.data[1]) & 1) !== 0) {
          if (sprite.data[6] <= 15)
            sprite.data[6]++;
        } else if (sprite.data[7] > 0) {
          sprite.data[7]--;
        }

        _p1Rt()?.SetGpuReg?.(0x52, _p1BldAlphaBlend(sprite.data[6], sprite.data[7]));
        if (sprite.data[6] === 16 && sprite.data[7] === 0) {
          sprite.data[1] = 0;
          sprite.data[0]++;
        }
      }
      break;
    case 1:
      if (++sprite.data[1] > 8) {
        sprite.data[1] = 0;
        _StartSpriteAffineAnim(sprite, 1); // gMilkBottleAffineAnimTable[1] (penche)
        sprite.data[0]++;
      }
      break;
    case 2:
      AnimMilkBottle_Step2(sprite, 16, 4);
      if (++sprite.data[1] > 2) {
        sprite.data[1] = 0;
        sprite.y++;
      }

      if (++sprite.data[2] <= 29)
        break;

      if (sprite.data[2] & 1) {
        if (sprite.data[6] > 0)
          sprite.data[6]--;
      } else if (sprite.data[7] <= 15) {
        sprite.data[7]++;
      }

      _p1Rt()?.SetGpuReg?.(0x52, _p1BldAlphaBlend(sprite.data[6], sprite.data[7]));
      if (sprite.data[6] === 0 && sprite.data[7] === 16) {
        sprite.data[1] = 0;
        sprite.data[2] = 0;
        sprite.data[0]++;
      }
      break;
    case 3:
      sprite.invisible = true;
      sprite.data[0]++;
      break;
    case 4:
      _p1Rt()?.SetGpuReg?.(0x50, 0);
      _p1Rt()?.SetGpuReg?.(0x52, _p1BldAlphaBlend(0, 0));
      _pItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

/** 1:1 `AnimMilkBottle_Step2` (battle_anim_effects_1.c.c:4078) : balancement — data[4] ±2
 *  par fenêtres de data[3] (0..11 / 18..41 / 48..59, cycle 60), x2 = data[4]/9,
 *  y2 = |data[4]/14|. (unk1/unk2 inutilisés — signature C conservée.) */
function AnimMilkBottle_Step2(sprite: _ESprite, _unk1: number, _unk2: number): void {
  if (sprite.data[3] <= 11)
    sprite.data[4] += 2;

  if (((sprite.data[3] - 0x12) & 0xFFFF) <= 0x17) // (u16)(data[3] - 18) <= 23
    sprite.data[4] -= 2;

  if (sprite.data[3] > 0x2F)
    sprite.data[4] += 2;

  sprite.x2 = Math.trunc(sprite.data[4] / 9);
  sprite.y2 = Math.trunc(sprite.data[4] / 14);
  if (sprite.y2 < 0)
    sprite.y2 *= -1;

  sprite.data[3]++;
  if (sprite.data[3] > 0x3B)
    sprite.data[3] = 0;
}

// ─── AnimBowMon (battle_anim_effects_1.c.c:4400) — gBowMonSpriteTemplate (contrôleur) ──────

/** 1:1 `AnimBowMon` (battle_anim_effects_1.c.c:4400) : sprite contrôleur INVISIBLE qui fait
 *  « s'incliner » l'ATTAQUANT (salut de Slack Off…). args[0] : 0 = avance +
 *  rotation (Step1), 1 = recule (Step2), 2 = attente 9f + rotation inverse
 *  (Step3), autre = destroy direct (Step4). */
function AnimBowMon(sprite: _ESprite): void {
  const args = _pItf().getArgs?.() ?? [0];
  sprite.invisible = true; // 1:1 décomp (contrôleur)
  sprite.data[0] = 0;
  switch (args[0] | 0) {
    case 0:
      sprite.callback = AnimBowMon_Step1;
      break;
    case 1:
      sprite.callback = AnimBowMon_Step2;
      break;
    case 2:
      sprite.callback = AnimBowMon_Step3;
      break;
    default:
      sprite.callback = AnimBowMon_Step4;
      break;
  }
}

/** 1:1 `AnimBowMon_Step1` (battle_anim_effects_1.c.c:4423) : translate l'attaquant de ±2 px/f
 *  pendant 6 frames (vers la cible) puis enchaîne la rotation (Step1_Callback). */
function AnimBowMon_Step1(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.data[0] = 6;
  sprite.data[1] = _p1Side(atk) ? 2 : -2;
  sprite.data[2] = 0;
  sprite.data[3] = _p1BattlerSpriteId(atk);
  StoreSpriteCallbackInData6(sprite as never, AnimBowMon_Step1_Callback as never);
  sprite.callback = _p1TranslateSpriteLinearById;
}

/** 1:1 `AnimBowMon_Step1_Callback` (battle_anim_effects_1.c.c:4433) : rotation ±0x300/frame
 *  (4 frames) du sprite du mon via SetSpriteRotScale + y2 dérivé de la matrice. */
function AnimBowMon_Step1_Callback(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  if (sprite.data[0] === 0) {
    sprite.data[3] = _p1BattlerSpriteId(atk);
    _p1PrepRotScale(sprite.data[3], 0 /* ST_OAM_OBJ_NORMAL */);
    sprite.data[6] = _p1Side(atk);
    sprite.data[4] = sprite.data[6] ? 0x300 : -0x300; // (data[6] = side) ? ... (affectation imbriquée C dépliée)
    sprite.data[5] = 0;
  }

  sprite.data[5] = _p1S16(sprite.data[5] + sprite.data[4]);
  _p1SetRotScale(sprite.data[3], 0x100, 0x100, sprite.data[5] & 0xFFFF);
  _p1YOffFromRot(sprite.data[3]);
  if (++sprite.data[0] > 3) {
    sprite.data[0] = 0;
    sprite.callback = AnimBowMon_Step4;
  }
}

/** 1:1 `AnimBowMon_Step2` (battle_anim_effects_1.c.c:4453) : recule l'attaquant de ±3 px/f
 *  pendant 4 frames → destroy (Step4). */
function AnimBowMon_Step2(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  sprite.data[0] = 4;
  sprite.data[1] = _p1Side(atk) ? -3 : 3;
  sprite.data[2] = 0;
  sprite.data[3] = _p1BattlerSpriteId(atk);
  StoreSpriteCallbackInData6(sprite as never, AnimBowMon_Step4 as never);
  sprite.callback = _p1TranslateSpriteLinearById;
}

/** 1:1 `AnimBowMon_Step3` (battle_anim_effects_1.c.c:4463) : attend 9 frames puis lance la
 *  rotation inverse (Step3_Callback). */
function AnimBowMon_Step3(sprite: _ESprite): void {
  if (++sprite.data[0] > 8) {
    sprite.data[0] = 0;
    sprite.callback = AnimBowMon_Step3_Callback;
  }
}

/** 1:1 `AnimBowMon_Step3_Callback` (battle_anim_effects_1.c.c:4472) : redresse le mon —
 *  rotation depuis ±0xC00/-0xF400 par pas de ±0x400 (3 frames) puis
 *  ResetSpriteRotScale → Step4. */
function AnimBowMon_Step3_Callback(sprite: _ESprite): void {
  const atk = _pItf().getAttacker?.() ?? 0;
  if (sprite.data[0] === 0) {
    sprite.data[3] = _p1BattlerSpriteId(atk);
    sprite.data[6] = _p1Side(atk);
    if (_p1Side(atk) !== 0 /* != B_SIDE_PLAYER */) {
      sprite.data[4] = _p1S16(0xFC00); // -0x400
      sprite.data[5] = 0xC00;
    } else {
      sprite.data[4] = 0x400;
      sprite.data[5] = _p1S16(0xF400); // -0xC00
    }
  }

  sprite.data[5] = _p1S16(sprite.data[5] + sprite.data[4]);
  _p1SetRotScale(sprite.data[3], 0x100, 0x100, sprite.data[5] & 0xFFFF);
  _p1YOffFromRot(sprite.data[3]);
  if (++sprite.data[0] > 2) {
    _p1ResetRotScale(sprite.data[3]);
    sprite.callback = AnimBowMon_Step4;
  }
}

/** 1:1 `AnimBowMon_Step4` (battle_anim_effects_1.c.c:4500). */
function AnimBowMon_Step4(sprite: _ESprite): void {
  _pItf().DestroyAnimSprite?.(sprite);
}

registerAnimCallbacks({
  AnimProtect: AnimProtect as never,
  AnimMilkBottle: AnimMilkBottle as never,
  AnimBowMon: AnimBowMon as never,
});

// ─── VAGUE F28 : AnimTask_SkullBashPosition (battle_anim_effects_1.c.c, 2 hits) ───────────
// mode 0 = recul + bascule rotation + tremblement + charge ; mode 1 = reset.
import {
  PrepareBattlerSpriteForRotScale as _sbPrep, SetSpriteRotScale as _sbSet,
  ResetSpriteRotScale as _sbReset, SetBattlerSpriteYOffsetFromRotation as _sbYRot,
} from './battle_anim_mons';
import { registerAnimTasks as _sbRegT } from '../engine/battle/battle-anim-registry';
function _sbItf(): { getArgs?: () => number[]; getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_SkullBashPosition(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _sbItf();
  const a = itf.getArgs?.() ?? [];
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = sid;
  const side = atk & 1; // 0=player
  task.data[1] = side;
  task.data[2] = 0;
  switch (a[0]) {
    default:
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
    case 0:
      task.data[2] = 0;
      task.data[3] = 8;
      task.data[4] = 0;
      task.data[5] = side === 0 ? -3 : 3;
      task.func = _SkullBashSet;
      break;
    case 1:
      task.data[3] = 8;
      task.data[4] = side === 0 ? -0x600 : 0x600;
      task.data[5] = side === 0 ? -0xC0 : 0xC0;
      task.func = _SkullBashReset;
      break;
  }
}
function _SkullBashSet(task: { taskId: number; data: number[] }): void {
  const itf = _sbItf();
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[0]);
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[2]) {
    case 0:
      if (task.data[3]) {
        task.data[4] += task.data[5];
        sp.x2 = task.data[4];
        task.data[3]--;
      } else {
        task.data[3] = 8;
        task.data[4] = 0;
        task.data[5] = task.data[1] === 0 ? -0xC0 : 0xC0;
        _sbPrep(task.data[0], 0);
        task.data[2]++;
      }
      break;
    case 1:
      if (task.data[3]) {
        task.data[4] += task.data[5];
        _sbSet(task.data[0], 0x100, 0x100, task.data[4] & 0xFFFF);
        _sbYRot(task.data[0]);
        task.data[3]--;
      } else {
        task.data[3] = 8;
        task.data[4] = sp.x2;
        task.data[5] = task.data[1] === 0 ? 2 : -2;
        task.data[6] = 1;
        task.data[2]++;
      }
      break;
    case 2:
      if (task.data[3]) {
        if (task.data[6]) {
          task.data[6]--;
        } else {
          sp.x2 = (task.data[3] & 1) ? task.data[4] + task.data[5] : task.data[4] - task.data[5];
          task.data[6] = 1;
          task.data[3]--;
        }
      } else {
        sp.x2 = task.data[4];
        task.data[3] = 12;
        task.data[2]++;
      }
      break;
    case 3:
      if (task.data[3]) {
        task.data[3]--;
      } else {
        task.data[3] = 3;
        task.data[4] = sp.x2;
        task.data[5] = task.data[1] === 0 ? 8 : -8;
        task.data[2]++;
      }
      break;
    case 4:
      if (task.data[3]) {
        task.data[4] += task.data[5];
        sp.x2 = task.data[4];
        task.data[3]--;
      } else {
        itf.DestroyAnimVisualTask?.(task.taskId);
      }
      break;
  }
}
function _SkullBashReset(task: { taskId: number; data: number[] }): void {
  const itf = _sbItf();
  if (task.data[3]) {
    task.data[4] -= task.data[5];
    _sbSet(task.data[0], 0x100, 0x100, task.data[4] & 0xFFFF);
    _sbYRot(task.data[0]);
    task.data[3]--;
  } else {
    _sbReset(task.data[0]);
    itf.DestroyAnimVisualTask?.(task.taskId);
  }
}
/** 1:1 `gParticlesColorBlendTable` (battle_anim_effects_1.c.c:1973) + les 2 tasks MusicNotes
 *  rainbow (6 hits — Sing/HealBell/GrassWhistle) : pose les 4 palettes de
 *  particules colorées (alloc par tag), le clear les libère. */
const _gParticlesColorBlendTable: ReadonlyArray<readonly [number, readonly number[]]> = [
  [10072, [32767, 29535, 27359, 25151, 22975]],
  [10097, [32767, 27641, 22516, 17391, 13290]],
  [10185, [32767, 25599, 18431, 11263, 4095]],
  [10175, [32767, 32666, 32597, 32528, 32460]],
];
function AnimTask_MusicNotesRainbowBlend(task: { taskId: number }): void {
  const spr = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number; AllocSpritePalette?: (t: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { set?: (i: number, v: number) => void } } | undefined;
  const pf = rt?.gPlttBufferFaded;
  // la 1re ligne : la palette EXISTANTE du tag MUSIC_NOTES, recolorée
  const first = _gParticlesColorBlendTable[0];
  let idx = spr?.IndexOfSpritePaletteTag?.(first[0]) ?? 0xFF;
  if (idx !== 0xFF && pf?.set) {
    for (let i = 1; i < 6 && i - 1 < first[1].length; i++) pf.set(256 + idx * 16 + i, first[1][i - 1]);
  }
  // les 3 suivantes : ALLOC d une palette par tag + couleurs
  for (let j = 1; j < _gParticlesColorBlendTable.length; j++) {
    const [tag, cols] = _gParticlesColorBlendTable[j];
    idx = spr?.AllocSpritePalette?.(tag) ?? 0xFF;
    if (idx !== 0xFF && pf?.set) {
      for (let i = 1; i < 6 && i - 1 < cols.length; i++) pf.set(256 + idx * 16 + i, cols[i - 1]);
    }
  }
  _sbItf().DestroyAnimVisualTask?.(task.taskId);
}
function AnimTask_MusicNotesClearRainbowBlend(task: { taskId: number }): void {
  const spr = (globalThis as Record<string, unknown>).__sprite as { FreeSpritePaletteByTag?: (t: number) => void } | undefined;
  for (let j = 1; j < _gParticlesColorBlendTable.length; j++) {
    spr?.FreeSpritePaletteByTag?.(_gParticlesColorBlendTable[j][0]);
  }
  _sbItf().DestroyAnimVisualTask?.(task.taskId);
}
_sbRegT({
  AnimTask_SkullBashPosition: AnimTask_SkullBashPosition as never,
  AnimTask_MusicNotesRainbowBlend: AnimTask_MusicNotesRainbowBlend as never,
  AnimTask_MusicNotesClearRainbowBlend: AnimTask_MusicNotesClearRainbowBlend as never,
});

// ─── VAGUE F37 : Conversion ×2 (battle_anim_effects_1.c.c:4856 + :4908) ───────────────────
function _cvRt(): { SetGpuReg?: (off: number, v: number) => void } {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
/** 1:1 `AnimTask_ConversionAlphaBlend` (battle_anim_effects_1.c.c:4856) : fondu BLDALPHA
 *  16-n/n par pas de 4f, signal args[7]=0xFFFF une frame, puis destroy. */
function AnimTask_ConversionAlphaBlend(task: { taskId: number; data: number[] }): void {
  const itf = _sbItf() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  if (task.data[2] === 1) {
    const args = itf.getArgs?.();
    if (args) args[7] = 0xFFFF;
    task.data[2]++;
  } else if (task.data[2] === 2) {
    itf.DestroyAnimVisualTask?.(task.taskId);
  } else {
    if (++task.data[0] === 4) {
      task.data[0] = 0;
      task.data[1]++;
      _cvRt().SetGpuReg?.(0x52, ((16 - task.data[1]) & 0xFFFF) | (task.data[1] << 8));
      if (task.data[1] === 16) task.data[2]++;
    }
  }
}
/** 1:1 `AnimTask_Conversion2AlphaBlend` (battle_anim_effects_1.c.c:4908) : fondu inverse. */
function AnimTask_Conversion2AlphaBlend(task: { taskId: number; data: number[] }): void {
  if (++task.data[0] === 4) {
    task.data[0] = 0;
    task.data[1]++;
    _cvRt().SetGpuReg?.(0x52, (task.data[1] & 0xFFFF) | ((16 - task.data[1]) << 8));
    if (task.data[1] === 16) {
      (_sbItf() as { DestroyAnimVisualTask?: (id: number) => void }).DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
_sbRegT({
  AnimTask_ConversionAlphaBlend: AnimTask_ConversionAlphaBlend as never,
  AnimTask_Conversion2AlphaBlend: AnimTask_Conversion2AlphaBlend as never,
});

// --- VAGUE F52 : AnimTask_DoubleTeam (battle_anim_effects_1.c.c:5173-5245) ----------------
// 2 clones assombris (palette BENT_SPOON blend noir 11/16) qui oscillent en
// Sin dephases de 128, pendant que le BG du mon est COUPE (DISPCNT).
import { BlendPalette as _dtBlend } from '../engine/system/decomp-globals';
import { gSineTable as _dtSine } from './trig';

type _DtTask = { taskId: number; data: number[]; func?: unknown };
function _dtItf(): { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _dtMons(): {
  CloneBattlerSpriteWithBlend?: (a: number) => number;
  DestroySpriteWithActiveSheet?: (s: unknown) => void;
  GetBattlerSpriteBGPriorityRank?: (b: number) => number;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimMons as never) ?? {};
}
function _dtBgVisible(rank: number, on: boolean): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { bg: (i: number) => { config: { visible: boolean } } } } | undefined;
  const cfg = rt?.gba?.bg(rank === 1 ? 1 : 2)?.config;
  if (cfg) cfg.visible = on; // 1:1 Clear/SetGpuRegBits(DISPCNT, BGn_ON)
}

/** 1:1 AnimTask_DoubleTeam (battle_anim_effects_1.c.c:5173). */
function AnimTask_DoubleTeam(task: _DtTask): void {
  const itf = _dtItf();
  const mons = _dtMons();
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  task.data[0] = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  if (task.data[0] === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const spApi = (globalThis as Record<string, unknown>).__sprite as { AllocSpritePalette?: (t: number) => number; FreeSpritePaletteByTag?: (t: number) => void } | undefined;
  task.data[1] = spApi?.AllocSpritePalette?.(10097 /* ANIM_TAG_BENT_SPOON */) ?? 0xFF;
  const rt = (globalThis as Record<string, unknown>).__rt as {
    gSprites?: Map<number, { data: number[]; callback: unknown; oamIndex: number; x2: number }>;
    gba?: { oam: Array<{ paletteBank: number }> };
    gPlttBufferUnfaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
    gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
  } | undefined;
  const atkSp = rt?.gSprites?.get(task.data[0]);
  const monPal = atkSp ? (rt?.gba?.oam[atkSp.oamIndex]?.paletteBank ?? 0) : 0;
  if (task.data[1] !== 0xFF && rt?.gPlttBufferUnfaded?.get && rt.gPlttBufferUnfaded.set) {
    const r3 = 256 + task.data[1] * 16;
    const r4 = 256 + monPal * 16;
    for (let i = 1; i < 16; i++) rt.gPlttBufferUnfaded.set(r3 + i, rt.gPlttBufferUnfaded.get(r4 + i));
    _dtBlend(r3, 16, 11, 0 /* RGB_BLACK */);
  }
  task.data[3] = 0;
  for (let i = 0; i < 2; i++) {
    const obj = mons.CloneBattlerSpriteWithBlend?.(0) ?? -1;
    if (obj < 0) break;
    const clone = rt?.gSprites?.get(obj);
    const cloneOam = clone ? rt?.gba?.oam[clone.oamIndex] : undefined;
    if (cloneOam && task.data[1] !== 0xFF) cloneOam.paletteBank = task.data[1];
    if (clone) {
      clone.data[0] = 0;
      clone.data[1] = i << 7;
      clone.data[2] = task.taskId;
      clone.data[3] = 0;
      clone.callback = _AnimDoubleTeam as never;
      task.data[3]++;
    }
  }
  task.func = _DoubleTeam_Step;
  const rank = mons.GetBattlerSpriteBGPriorityRank?.(atk) ?? 2;
  _dtBgVisible(rank, false);
}
/** 1:1 AnimTask_DoubleTeam_Step. */
function _DoubleTeam_Step(task: _DtTask): void {
  if (!task.data[3]) {
    const rank = _dtMons().GetBattlerSpriteBGPriorityRank?.(_dtItf().getAttacker?.() ?? 0) ?? 2;
    _dtBgVisible(rank, true);
    const spApi = (globalThis as Record<string, unknown>).__sprite as { FreeSpritePaletteByTag?: (t: number) => void } | undefined;
    spApi?.FreeSpritePaletteByTag?.(10097);
    _dtItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
/** 1:1 AnimDoubleTeam : oscillation Sin amortie, 64 pas puis meurt. */
function _AnimDoubleTeam(sprite: { data: number[]; x2: number }): void {
  if (++sprite.data[3] > 1) {
    sprite.data[3] = 0;
    sprite.data[0]++;
  }
  if (sprite.data[0] > 64) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
    const t = rt?.gTasks?.get(sprite.data[2]);
    if (t) t.data[3]--;
    _dtMons().DestroySpriteWithActiveSheet?.(sprite);
  } else {
    sprite.data[4] = Math.trunc((_dtSine[sprite.data[0]] ?? 0) / 6);
    sprite.data[5] = Math.trunc((_dtSine[sprite.data[0]] ?? 0) / 13);
    sprite.data[1] = (sprite.data[1] + sprite.data[5]) & 0xFF;
    sprite.x2 = Sin(sprite.data[1], sprite.data[4]);
  }
}
_sbRegT({ AnimTask_DoubleTeam: AnimTask_DoubleTeam as never });

// --- VAGUE F53 : ShrinkTargetCopy / Mimic (battle_anim_effects_1.c.c:2762-2837) -----------
// La cible "copie" : glisse en x (vitesse Q8.8 arg0) en GRANDISSANT (+16/f)
// en blend, attend le signal args[7]=0xFFFF, restore.
type _StcTask = { taskId: number; data: number[]; func?: unknown };
function _stcItf(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _stcMons(): {
  PrepareBattlerSpriteForRotScale?: (id: number, m: number) => void;
  SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
  ResetSpriteRotScale?: (id: number) => void;
  SetBattlerSpriteYOffsetFromYScale?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimMons as never) ?? {};
}
function _stcRt(): {
  gSprites?: Map<number, { x2: number; y2: number; invisible?: boolean; oamIndex: number }>;
  gba?: { oam: Array<{ priority: number }>; bg: (i: number) => { config: { priority: number } } };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _stcTargetSpriteId(): number {
  const b = _stcItf().getTarget?.() ?? 1;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
/** 1:1 GetBattlerSpriteBGPriority (battle_anim_mons.c.c) : priority du BG anim 1/2. */
function _stcBgPriority(battler: number): number {
  const pos = battler & 3;
  const bgId = (pos === 0 || pos === 3) ? 2 : 1;
  return _stcRt().gba?.bg(bgId)?.config?.priority ?? 2;
}

/** 1:1 AnimTask_ShrinkTargetCopy (battle_anim_effects_1.c.c:2762). args=[vitesseX Q8.8, frames]. */
function AnimTask_ShrinkTargetCopy(task: _StcTask): void {
  const itf = _stcItf();
  const args = itf.getArgs?.() ?? [128, 24];
  const spriteId = _stcTargetSpriteId();
  const rt = _stcRt();
  const sp = spriteId !== 0xFF ? rt.gSprites?.get(spriteId) : undefined;
  if (!sp || sp.invisible) {
    itf.DestroyAnimVisualTask?.(task.taskId);
    return;
  }
  _stcMons().PrepareBattlerSpriteForRotScale?.(spriteId, 1 /* ST_OAM_OBJ_BLEND */);
  const oam = rt.gba?.oam[sp.oamIndex];
  task.data[14] = oam?.priority ?? 2;
  if (oam) oam.priority = _stcBgPriority(itf.getTarget?.() ?? 1);
  task.data[15] = task.data[14]; // single : pas de DEF_PARTNER (1:1 net)
  task.data[0] = args[0] | 0;
  task.data[1] = args[1] | 0;
  task.data[11] = 0x100;
  task.data[10] = 0;
  task.data[13] = 0; // state interne Step2
  task.func = _DuplicateAndShrink_Step1;
}
function _DuplicateAndShrink_Step1(task: _StcTask): void {
  const itf = _stcItf();
  const spriteId = _stcTargetSpriteId();
  const sp = spriteId !== 0xFF ? _stcRt().gSprites?.get(spriteId) : undefined;
  task.data[10] += task.data[0];
  if (sp) {
    sp.x2 = task.data[10] >> 8;
    if (((itf.getTarget?.() ?? 1) & 1) !== 0 /* != B_SIDE_PLAYER */) sp.x2 = -sp.x2;
  }
  task.data[11] += 16;
  _stcMons().SetSpriteRotScale?.(spriteId, task.data[11], task.data[11], 0);
  _stcMons().SetBattlerSpriteYOffsetFromYScale?.(spriteId);
  if (--task.data[1] === 0) {
    task.data[13] = 0;
    task.func = _DuplicateAndShrink_Step2;
  }
}
function _DuplicateAndShrink_Step2(task: _StcTask): void {
  const itf = _stcItf();
  const args = itf.getArgs?.();
  if (args && (args[7] & 0xFFFF) === 0xFFFF) {
    if (task.data[13] === 0) {
      const spriteId = _stcTargetSpriteId();
      const rt = _stcRt();
      const sp = spriteId !== 0xFF ? rt.gSprites?.get(spriteId) : undefined;
      _stcMons().ResetSpriteRotScale?.(spriteId);
      if (sp) {
        sp.x2 = 0;
        sp.y2 = 0;
        const oam = rt.gba?.oam[sp.oamIndex];
        if (oam) oam.priority = task.data[14];
      }
      task.data[13]++;
      return;
    }
  } else {
    if (task.data[13] === 0) return;
  }
  task.data[13]++;
  if (task.data[13] === 3) itf.DestroyAnimVisualTask?.(task.taskId);
}
_sbRegT({ AnimTask_ShrinkTargetCopy: AnimTask_ShrinkTargetCopy as never });

// --- VAGUE F58 : AnimTask_CycleMagicalLeafPal (battle_anim_effects_1.c.c:3592) ------------
// Arc-en-ciel des feuilles : blend des palettes LEAF + RAZOR_LEAF a travers
// 7 couleurs (0..16 par couleur), jusqu'au signal args[7] = -1.
const _ML_RGB = (r: number, g: number, b: number): number => r | (g << 5) | (b << 10);
// 1:1 gMagicalLeafBlendColors (battle_anim_effects_1.c.c:1047)
const _gMagicalLeafBlendColors: ReadonlyArray<number> = [
  _ML_RGB(31, 0, 0),   // RGB_RED
  _ML_RGB(31, 19, 0),
  _ML_RGB(31, 31, 0),  // RGB_YELLOW
  _ML_RGB(0, 31, 0),   // RGB_GREEN
  _ML_RGB(5, 14, 31),
  _ML_RGB(22, 10, 31),
  _ML_RGB(22, 21, 31),
];
const _ML_TAG_LEAF = 10063;        // ANIM_TAG_LEAF (START+63)
const _ML_TAG_RAZOR_LEAF = 10160;  // ANIM_TAG_RAZOR_LEAF (START+160)

/** 1:1 AnimTask_CycleMagicalLeafPal. */
function AnimTask_CycleMagicalLeafPal(task: { taskId: number; data: number[] }): void {
  const itf = _sbItf() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const spApi = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  switch (task.data[0]) {
    case 0: {
      const leaf = spApi?.IndexOfSpritePaletteTag?.(_ML_TAG_LEAF) ?? 0xFF;
      const razor = spApi?.IndexOfSpritePaletteTag?.(_ML_TAG_RAZOR_LEAF) ?? 0xFF;
      task.data[8] = leaf === 0xFF ? -1 : 256 + leaf * 16;
      task.data[12] = razor === 0xFF ? -1 : 256 + razor * 16;
      task.data[0]++;
      break;
    }
    case 1:
      if (++task.data[9] >= 0) {
        task.data[9] = 0;
        if (task.data[8] >= 0) _dtBlend(task.data[8], 16, task.data[10], _gMagicalLeafBlendColors[task.data[11]]);
        if (task.data[12] >= 0) _dtBlend(task.data[12], 16, task.data[10], _gMagicalLeafBlendColors[task.data[11]]);
        if (++task.data[10] === 17) {
          task.data[10] = 0;
          if (++task.data[11] === 7) task.data[11] = 0;
        }
      }
      break;
  }
  const args = itf.getArgs?.();
  if (args && ((args[7] << 16) >> 16) === -1) {
    itf.DestroyAnimVisualTask?.(task.taskId);
  }
}
_sbRegT({ AnimTask_CycleMagicalLeafPal: AnimTask_CycleMagicalLeafPal as never });

// --- VAGUE F68 : AnimTask_MoonlightEndFade (battle_anim_effects_1.c.c:5003-5106) ----------
// Fondu blanc-lune RGB(27,29,31) : fade hardware (mask 32-bit BG+OBJ via
// BeginNormalPaletteFade) + montee progressive 13/14/15>>3 ecrite DIRECTEMENT
// dans les banks BG du mask, signal aux sprites Moon/Sparkle, re-fade inverse.
import { BeginNormalPaletteFade as _mlBeginFade } from '../engine/system/decomp-bridge';

const _ML_WHITE_MOON = 27 | (29 << 5) | (31 << 10); // RGB(27,29,31)
type _MlTask = { taskId: number; data: number[]; func?: unknown };
function _mlItf(): { DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _mlMasks(): {
  GetBattlePalettesMask?: (a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean) => number;
  GetBattleMonSpritePalettesMask?: (a: number, b: number, c: number, d: number) => number;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimMons as never) ?? {};
}
function _mlRt(): {
  gPaletteFade?: { active?: boolean };
  gPlttBufferFaded?: { set?: (i: number, v: number) => void };
  gSprites?: Map<number, { data: number[]; oamIndex: number; inUse?: boolean }>;
  gba?: { oam: Array<{ tileId: number }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _mlSlotOf(tag: number): number {
  const sp = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  return sp?.IndexOfSpritePaletteTag?.(tag) ?? 0xFF;
}
/** Signale les sprites des sheets MOON/SPARKLE (data[0]=1, 1:1 template-match). */
function _mlSignalMoonSprites(): void {
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
  const rt = _mlRt();
  const ranges: Array<[number, number]> = [];
  for (const tag of [10194 /* ANIM_TAG_MOON (START+194) */, 10195 /* ANIM_TAG_GREEN_SPARKLE (START+195) */]) {
    const start = dg?.GetSpriteTileStartByTag?.(tag) ?? 0xFFFF;
    if (start !== 0xFFFF) ranges.push([start, start + 96]);
  }
  for (const sp of rt.gSprites?.values() ?? []) {
    if (sp.inUse === false) continue;
    const t0 = rt.gba?.oam[sp.oamIndex]?.tileId ?? -1;
    for (const [a, b] of ranges) {
      if (t0 >= a && t0 < b) { sp.data[0] = 1; break; }
    }
  }
}

/** 1:1 AnimTask_MoonlightEndFade (battle_anim_effects_1.c.c:5003). */
function AnimTask_MoonlightEndFade(task: _MlTask): void {
  const m = _mlMasks();
  const a = ((m.GetBattlePalettesMask?.(true, false, false, false, false, false, false) ?? 0xE) & 0xFFFF) >>> 0;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = a;
  task.data[4] = 0;
  task.data[5] = 0;
  task.data[6] = 0;
  task.data[7] = 13;
  task.data[8] = 14;
  task.data[9] = 15;
  let b = (m.GetBattleMonSpritePalettesMask?.(1, 1, 1, 1) ?? 0) >>> 0;
  const c = (a | b) >>> 0;
  // StorePointerInVars 1:1-net : mask u32 scinde data[14]/[15]
  task.data[14] = c & 0xFFFF;
  task.data[15] = (c >>> 16) & 0xFFFF;
  const moonSlot = _mlSlotOf(10194);
  if (moonSlot !== 0xFF) b = (b | (0x10000 << moonSlot)) >>> 0;
  const d = _mlSlotOf(10195);
  const mask = d !== 0xFF ? ((0x10000 << d) | b) >>> 0 : b;
  _mlBeginFade(mask, 0, 0, 16, _ML_WHITE_MOON);
  task.func = _MoonlightEndFade_Step;
  _MoonlightEndFade_Step(task); // 1:1 appel immediat
}
function _MoonlightEndFade_Step(task: _MlTask): void {
  const rt = _mlRt();
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 0) {
        task.data[1] = 0;
        let color: number;
        if (++task.data[2] <= 15) {
          task.data[4] += task.data[7];
          task.data[5] += task.data[8];
          task.data[6] += task.data[9];
          const red = task.data[4] >> 3;
          const green = task.data[5] >> 3;
          const blue = task.data[6] >> 3;
          color = (red | (green << 5) | (blue << 10)) & 0x7FFF;
        } else {
          color = _ML_WHITE_MOON;
          task.data[0]++;
        }
        // ecrit les couleurs 1..15 des banks BG du mask data[3]
        let bitmask = 1;
        let r3 = 0;
        const pf = rt.gPlttBufferFaded;
        for (let i = 0; i <= 15; i++) {
          if (task.data[3] & bitmask) {
            for (let j = 1; j <= 15; j++) pf?.set?.(r3 + j, color);
          }
          bitmask <<= 1;
          r3 += 16;
        }
      }
      break;
    case 1:
      if (!rt.gPaletteFade?.active) {
        _mlSignalMoonSprites();
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      if (++task.data[1] > 30) {
        const mask = ((task.data[15] & 0xFFFF) << 16 | (task.data[14] & 0xFFFF)) >>> 0;
        _mlBeginFade(mask, 0, 16, 0, _ML_WHITE_MOON);
        task.data[0]++;
      }
      break;
    case 3:
      if (!rt.gPaletteFade?.active) _mlItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
_sbRegT({ AnimTask_MoonlightEndFade: AnimTask_MoonlightEndFade as never });

// --- VAGUE F80 : AnimTask_SporeDoubleBattle (battle_anim_effects_1.c.c:2463) --------------
// Double battle uniquement (priorite BG du partner) ; en SINGLE (notre scope)
// = destroy direct 1:1 (la branche IsDoubleBattle est hors-scope link/multi).
function AnimTask_SporeDoubleBattle(task: { taskId: number }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { DestroyAnimVisualTask?: (id: number) => void };
  itf.DestroyAnimVisualTask?.(task.taskId);
}
_sbRegT({ AnimTask_SporeDoubleBattle: AnimTask_SporeDoubleBattle as never });

// --- VAGUE F81 : AnimTask_LeafBlade (battle_anim_effects_1.c.c:3255-3464) -----------------
// Lame-Feuille : UNE feuille pilotée par la task fait 6 ARCS successifs
// autour de la cible (positions ±(w/2+10)/±(h/2+10), anim de sprite 0..6 par
// segment, subpriority oscillante ±2, pause 5f entre segments via l'état
// 0xFF), en semant chaque tick une TRAÎNE clignotante (8 flips puis meurt en
// décrémentant data[12]) ; fin quand toutes les traînes sont mortes.
import { gBattlerPartyIndexes as _lbPartyIdx } from '../engine/battle/state';
import { gEnemyParty as _lbEnemyParty, gPlayerParty as _lbPlayerParty, GetMonData as _lbGetMon, MON_DATA_SPECIES as _lbSpeciesK } from '../engine/battle/party-storage';
import { reverseDecompConstant as _lbRevConst } from '../engine/system/decomp-constants';
import { getMonFrontPicCoords as _lbFrontCoords, getMonBackPicCoords as _lbBackCoords } from './data/mon_pic_coords';

type _LbTask = { taskId: number; data: number[]; func?: unknown };
type _LbSprite = {
  x: number; y: number; x2: number; y2: number; data: number[];
  callback: unknown; oamIndex?: number; subpriority?: number; invisible?: boolean;
  anims?: unknown; tileBase?: number; animNum?: number; animCmdIndex?: number;
  animDelayCounter?: number; animBeginning?: boolean; animEnded?: boolean;
};
function _lbRt(): {
  gSprites?: Map<number, _LbSprite>;
  gTasks?: Map<number, { data: number[] }>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  DestroySprite?: (i: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _lbItf(): { getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _lbPicDim(battler: number, which: 'w' | 'h'): number {
  const party = (battler & 1) !== 0 ? _lbEnemyParty : _lbPlayerParty;
  const species = _lbGetMon(party[_lbPartyIdx[battler]] as never, _lbSpeciesK) as number;
  const name = _lbRevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = (battler & 1) === 0 ? _lbBackCoords(name) : _lbFrontCoords(name);
  return which === 'w' ? coords.w : coords.h;
}
/** Spawn d'une feuille (template gLeafBladeSpriteTemplate tags-only, tag LEAF
 *  10063, 16x16, anims gLeafBladeAnimTable posées pour StartSpriteAnim). */
function _lbSpawnLeaf(x: number, y: number, subprio: number): number {
  const rt = _lbRt();
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number; anims?: unknown } | undefined } | undefined;
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.('gLeafBladeSpriteTemplate');
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = rt.CreateSpriteInline?.({ oam: { shape: 0, size: 1, priority: 2 }, images: [] } as never, x, y, subprio) ?? -1;
  if (sid < 0) return -1;
  const sp = rt.gSprites?.get(sid);
  const oam = sp && sp.oamIndex !== undefined ? rt.gba?.oam[sp.oamIndex] : undefined;
  if (oam && tileStart !== 0xFFFF) {
    oam.tileId = tileStart;
    const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
    if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
  }
  if (sp && tpl?.anims) {
    sp.anims = tpl.anims as never;
    sp.tileBase = tileStart !== 0xFFFF ? tileStart : 0;
    sp.animNum = 0; sp.animCmdIndex = 0; sp.animDelayCounter = 0;
    sp.animBeginning = true; sp.animEnded = false;
  }
  return sid;
}
function _lbStartAnim(sp: _LbSprite | undefined, n: number): void {
  if (sp && sp.anims) {
    sp.animNum = n; sp.animCmdIndex = 0; sp.animDelayCounter = 0;
    sp.animBeginning = true; sp.animEnded = false;
  }
}
function _lbGetPosFactor(sp: _LbSprite): number {
  return sp.data[4] < sp.y ? -8 : 8;
}
/** Recentre le sprite et prépare l'arc suivant (corps commun des cases impaires). */
function _lbRearm(task: _LbTask, sp: _LbSprite, destX: number, destY: number, animNum: number, subprioDelta: number): void {
  sp.x += sp.x2; sp.y += sp.y2;
  sp.x2 = 0; sp.y2 = 0;
  sp.data[0] = 10;
  sp.data[1] = sp.x;
  sp.data[2] = destX;
  sp.data[3] = sp.y;
  sp.data[4] = destY;
  sp.data[5] = _lbGetPosFactor(sp);
  task.data[4] += subprioDelta;
  task.data[3] = animNum;
  sp.subpriority = task.data[4];
  _lbStartAnim(sp, animNum);
  InitAnimArcTranslation(sp as never);
  task.data[0]++;
}
/** 1:1 AnimTask_LeafBlade (battle_anim_effects_1.c.c:3255). */
function AnimTask_LeafBlade(task: _LbTask): void {
  const itf = _lbItf();
  const tgt = itf.getTarget?.() ?? 1;
  task.data[4] = _GetBattlerSpriteSubpriority(tgt) - 1;
  task.data[6] = GetBattlerSpriteCoord(tgt, 2);
  task.data[7] = GetBattlerSpriteCoord(tgt, 3);
  task.data[10] = _lbPicDim(tgt, 'w');
  task.data[11] = _lbPicDim(tgt, 'h');
  task.data[5] = (tgt & 1) !== 0 ? 1 : -1;
  task.data[9] = 56 - task.data[5] * 64;
  task.data[8] = task.data[7] - task.data[9] + task.data[6];
  task.data[2] = _lbSpawnLeaf(task.data[8], task.data[9], task.data[4]);
  if (task.data[2] < 0) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const sp = _lbRt().gSprites?.get(task.data[2]);
  if (sp) {
    sp.data[0] = 10;
    sp.data[1] = task.data[8];
    sp.data[2] = task.data[6] - (Math.trunc(task.data[10] / 2) + 10) * task.data[5];
    sp.data[3] = task.data[9];
    sp.data[4] = task.data[7] + (Math.trunc(task.data[11] / 2) + 10) * task.data[5];
    sp.data[5] = _lbGetPosFactor(sp);
    InitAnimArcTranslation(sp as never);
  }
  task.func = _LeafBlade_Step;
}
/** 1:1 AnimTask_LeafBlade_Step (machine 0..13 + 0xFF pause). */
function _LeafBlade_Step(task: _LbTask): void {
  const rt = _lbRt();
  const sp = rt.gSprites?.get(task.data[2]);
  if (!sp && task.data[0] !== 13) { _lbItf().DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[0]) {
    case 0: case 2: case 4: case 6: case 8: case 10: case 12:
      _LeafBlade_Trail(task);
      if (sp && TranslateAnimHorizontalArc(sp as never)) {
        if (task.data[0] === 12) {
          for (const [sid, s2] of rt.gSprites ?? new Map()) {
            if (s2 === sp) { rt.DestroySprite?.(sid); break; }
          }
          task.data[0] = 13;
        } else {
          task.data[15] = task.data[0] + 1;
          task.data[0] = 0xFF;
        }
      }
      break;
    case 1:
      if (sp) _lbRearm(task, sp, task.data[6], task.data[7], 1, 2);
      break;
    case 3:
      if (sp) _lbRearm(task, sp, task.data[6] - (Math.trunc(task.data[10] / 2) + 10) * task.data[5], task.data[7] - (Math.trunc(task.data[11] / 2) + 10) * task.data[5], 2, 0);
      break;
    case 5:
      if (sp) _lbRearm(task, sp, task.data[6] + (Math.trunc(task.data[10] / 2) + 10) * task.data[5], task.data[7] + (Math.trunc(task.data[11] / 2) + 10) * task.data[5], 3, -2);
      break;
    case 7:
      if (sp) _lbRearm(task, sp, task.data[6], task.data[7], 4, 2);
      break;
    case 9:
      if (sp) _lbRearm(task, sp, task.data[6] - (Math.trunc(task.data[10] / 2) + 10) * task.data[5], task.data[7] + (Math.trunc(task.data[11] / 2) + 10) * task.data[5], 5, 0);
      break;
    case 11:
      if (sp) _lbRearm(task, sp, task.data[8], task.data[9], 6, -2);
      break;
    case 13:
      if (task.data[12] === 0) _lbItf().DestroyAnimVisualTask?.(task.taskId);
      break;
    case 0xFF:
      if (++task.data[1] > 5) {
        task.data[1] = 0;
        task.data[0] = task.data[15];
      }
      break;
  }
}
/** 1:1 AnimTask_LeafBlade_Step2 : sème une traîne clignotante chaque tick. */
function _LeafBlade_Trail(task: _LbTask): void {
  task.data[14]++;
  if (task.data[14] > 0) {
    task.data[14] = 0;
    const rt = _lbRt();
    const main = rt.gSprites?.get(task.data[2]);
    if (!main) return;
    const sid = _lbSpawnLeaf(main.x + main.x2, main.y + main.y2, task.data[4]);
    if (sid < 0) return;
    const sp = rt.gSprites?.get(sid);
    if (sp) {
      sp.data[6] = task.taskId;
      sp.data[7] = 12;
      task.data[12]++;
      sp.data[0] = task.data[13] & 1;
      task.data[13]++;
      _lbStartAnim(sp, task.data[3]);
      sp.subpriority = task.data[4];
      sp.callback = _LeafBlade_TrailFlicker as never;
    }
  }
}
/** 1:1 AnimTask_LeafBlade_Step2_Callback : 8 flips puis meurt (décrémente d12). */
function _LeafBlade_TrailFlicker(sprite: _LbSprite): void {
  sprite.data[0]++;
  if (sprite.data[0] > 1) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
    if (sprite.data[1] > 8) {
      const rt = _lbRt();
      const task = rt.gTasks?.get(sprite.data[6]);
      if (task) task.data[sprite.data[7]]--;
      for (const [sid, s2] of rt.gSprites ?? new Map()) {
        if (s2 === (sprite as unknown)) { rt.DestroySprite?.(sid); break; }
      }
    }
  }
}
_sbRegT({ AnimTask_LeafBlade: AnimTask_LeafBlade as never });

// --- VAGUE F82 : AnimPresentHealParticle (battle_anim_effects_1.c.c:3089) -----------------
// La particule de soin de Present (cible alliee) : chute lineaire
// (y2 = velocityY * frame depuis la position cible+offsets), destroy quand
// l'anim de sprite (AnimCmd du template generated) se termine. Le callback
// etait le SEUL manquant du template → registerAnimCallbacks le debloque
// pour le createsprite du script (sweep : sprite:gPresentHealParticle x9).
function AnimPresentHealParticle(sprite: { x: number; y: number; y2: number; data: number[]; animEnded?: boolean; callback: unknown }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { getArgs?: () => number[]; DestroyAnimSprite?: (s: unknown) => void };
  if (!sprite.data[0]) {
    InitSpritePosToAnimTarget(sprite as never, false);
    sprite.data[1] = (itf.getArgs?.() ?? [0, 0, 1])[2] | 0; // velocityY
  }
  sprite.data[0]++;
  sprite.y2 = sprite.data[1] * sprite.data[0];
  if (sprite.animEnded) itf.DestroyAnimSprite?.(sprite);
}
registerAnimCallbacks({ AnimPresentHealParticle: AnimPresentHealParticle as never });

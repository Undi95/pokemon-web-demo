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
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, StartAnimLinearTranslation, StoreSpriteCallbackInData6, InitAnimArcTranslation, TranslateAnimHorizontalArc } from './battle_anim_mons';
import { Cos } from './trig';
import { AnimTranslateLinear, InitSpritePosToAnimTarget, InitAnimLinearTranslation, TranslateAnimHorizontalArc as ArcT, SetSpriteCoordsToAnimAttackerCoords, TranslateSpriteLinearFixedPoint, SetAnimSpriteInitialXOffset } from './battle_anim_mons';
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
/** 1:1 `AnimMovePowderParticle` (effects_1.c:2195) : args [x, y, durée,
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

/** 1:1 `AnimFlyingParticle` (effects_1.c:3517) : particule qui traverse
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

/** 1:1 `AnimPowerAbsorptionOrb` (effects_1.c) : args [x, y, durée] — l'orbe
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

/** 1:1 `AnimTranslateLinearSingleSineWave` (effects_1.c, 2 tpl) : projectile
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

/** 1:1 `AnimMoveTwisterParticle` (effects_1.c, 2 tpl) : la particule de
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

/** 1:1 `AnimSolarBeamBigOrb` (effects_1.c) : orbe attaquant->cible, anim
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

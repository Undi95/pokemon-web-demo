/**
 * battle_anim_water.ts — miroir PARTIEL de `src/battle_anim_water.c`
 * (décomp pokeemeraude) : BUBBLE/Écume, goal T4 2026-06-11.
 * gWaterBubbleProjectileSpriteTemplate (:114, ANIM_TAG_BUBBLE 10146, OAM
 * 16x16) — callback net-effect : le projectile générique (la trajectoire
 * sinusoïdale AnimWaterBubbleProjectile = dette douce).
 * GFX : bubble.png 16x48 (3 frames) byte-exact.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import {
  TranslateAnimSpriteToTargetMonLocation, InitSpritePosToAnimAttacker,
  InitAnimLinearTranslation, AnimTranslateLinear, GetBattlerSpriteCoord,
} from './battle_anim_mons';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { Sin } from './trig';

export const ANIM_TAG_BUBBLE = 10146;
const sSheet = { data: 'gAnimGfx_Bubble', size: 384, tag: ANIM_TAG_BUBBLE };
const sPal = { data: 'gAnimPal_Bubble', tag: ANIM_TAG_BUBBLE };
export function LoadAnimBubbleGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_BUBBLE) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}
registerAnimTemplates([
  { name: 'gWaterBubbleProjectileSpriteTemplate', tileTag: ANIM_TAG_BUBBLE, paletteTag: ANIM_TAG_BUBBLE, oam: { shape: 0, size: 1 }, load: LoadAnimBubbleGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
]);

// ─── VAGUE 2a : AnimToTargetInSinWave 1:1 (battle_anim_water.c) — 6 templates
// générés (bulles/projectiles eau...) : trajectoire linéaire + onde Sin.
type _SwSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _swItf(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimToTargetInSinWave(sprite: _SwSprite): void {
  const args = _swItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
  const tgt = _swItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = 30;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* X_2 */);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */);
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = Math.trunc(0xD200 / sprite.data[0]);
  sprite.data[7] = args[3] | 0;
  const retArg = (args[7] | 0) & 0xFFFF;
  if (retArg > 127) {
    sprite.data[6] = (retArg - 127) * 256;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] = retArg * 256;
  }
  sprite.callback = AnimToTargetInSinWave_Step;
  AnimToTargetInSinWave_Step(sprite);
}
function AnimToTargetInSinWave_Step(sprite: _SwSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    _swItf().DestroyAnimSprite?.(sprite);
    return;
  }
  sprite.y2 += Sin((sprite.data[6] >> 8) & 0xFF, sprite.data[7]);
  if ((sprite.data[6] + sprite.data[5]) >> 8 > 127) {
    sprite.data[6] = 0;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] += sprite.data[5];
  }
}
registerAnimCallbacks({ AnimToTargetInSinWave: AnimToTargetInSinWave as never });

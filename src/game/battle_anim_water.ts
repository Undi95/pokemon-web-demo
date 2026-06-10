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
import { TranslateAnimSpriteToTargetMonLocation } from './battle_anim_fire';

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

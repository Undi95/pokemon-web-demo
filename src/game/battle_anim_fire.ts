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
 * Dettes : le reste de battle_anim_fire.c (flammes grandes, FireSpin…).
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

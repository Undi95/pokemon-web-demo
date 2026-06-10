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

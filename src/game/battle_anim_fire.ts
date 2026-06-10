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

const sSheet = { data: 'gAnimGfx_SmallEmber', size: 2560, tag: ANIM_TAG_SMALL_EMBER, targetTileBase: 864 };
const sPal = { data: 'gAnimPal_SmallEmber', tag: ANIM_TAG_SMALL_EMBER };
export function LoadAnimSmallEmberGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_SMALL_EMBER) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; oamIndex?: number; spriteId?: number;
  callback: ((s: AnimSprite) => void) | null;
  _storedCb6?: ((s: AnimSprite) => void) | null;
};

function _rt(): { gSprites?: Map<number, AnimSprite> } | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _battlerSprite(battler: number): AnimSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? _rt()?.gSprites?.get(id) : undefined;
}
function _u16(v: number): number { return v & 0xFFFF; }

/** 1:1 `InitAnimLinearTranslation` (battle_anim_mons.c) — deltas fixed-point
 *  avec bit 0 = signe (gauche/haut). */
function InitAnimLinearTranslation(sprite: AnimSprite): void {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = _u16(Math.abs(x) << 8);
  let yDelta = _u16(Math.abs(y) << 8);
  xDelta = Math.floor(xDelta / sprite.data[0]);
  yDelta = Math.floor(yDelta / sprite.data[0]);
  if (movingLeft) xDelta |= 1; else xDelta &= ~1;
  if (movingUp) yDelta |= 1; else yDelta &= ~1;
  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}

/** 1:1 `AnimTranslateLinear` — retourne true quand fini. */
function AnimTranslateLinear(sprite: AnimSprite): boolean {
  if (!sprite.data[0]) return true;
  const v1 = _u16(sprite.data[1]);
  const v2 = _u16(sprite.data[2]);
  const x = _u16(sprite.data[3] + v1);
  const y = _u16(sprite.data[4] + v2);
  sprite.x2 = (v1 & 1) ? -(x >> 8) : (x >> 8);
  sprite.y2 = (v2 & 1) ? -(y >> 8) : (y >> 8);
  sprite.data[3] = x;
  sprite.data[4] = y;
  sprite.data[0]--;
  return false;
}
function AnimTranslateLinear_WithFollowup(sprite: AnimSprite): void {
  if (AnimTranslateLinear(sprite)) {
    const cb = sprite._storedCb6;
    if (cb) cb(sprite);
    else _itf().DestroyAnimSprite?.(sprite);
  }
}
function StartAnimLinearTranslation(sprite: AnimSprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimLinearTranslation(sprite);
  sprite.callback = AnimTranslateLinear_WithFollowup;
  sprite.callback(sprite);
}

/** 1:1 `TranslateAnimSpriteToTargetMonLocation` (battle_anim_mons.c) — LE
 *  PROJECTILE générique : args [startXOff, startYOff, tgtXOff, tgtYOff,
 *  durée, flags]. Départ attaquant, arrivée cible, destroy à l'arrivée. */
export function TranslateAnimSpriteToTargetMonLocation(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 20, 0];
  const atk = _itf().getAttacker?.() ?? 0;
  const tgt = _itf().getTarget?.() ?? 1;
  const monA = _battlerSprite(atk);
  if (monA) {
    sprite.x = monA.x + (monA.x2 ?? 0) + args[0];
    sprite.y = monA.y + (monA.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) args[2] = -args[2];
  const monT = _battlerSprite(tgt);
  sprite.data[0] = args[4] || 20;
  sprite.data[2] = (monT ? monT.x + (monT.x2 ?? 0) : 120) + args[2];
  sprite.data[4] = (monT ? monT.y + (monT.y2 ?? 0) : 80) + args[3];
  sprite._storedCb6 = ((s: AnimSprite) => { _itf().DestroyAnimSprite?.(s); });
  StartAnimLinearTranslation(sprite);
}

registerAnimTemplates([
  { name: 'gEmberSpriteTemplate', tileTag: ANIM_TAG_SMALL_EMBER, paletteTag: ANIM_TAG_SMALL_EMBER, oam: { shape: 0, size: 2 }, load: LoadAnimSmallEmberGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
  // 1:1 gEmberFlareSpriteTemplate : même gfx, callback AnimEmberFlare (flammes
  // au point d'impact) — net-effect : même projectile court (dette douce :
  // l'oscillation flare).
  { name: 'gEmberFlareSpriteTemplate', tileTag: ANIM_TAG_SMALL_EMBER, paletteTag: ANIM_TAG_SMALL_EMBER, oam: { shape: 0, size: 2 }, load: LoadAnimSmallEmberGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
]);

/**
 * battle_anim_normal.ts — miroir PARTIEL de `src/battle_anim_normal.c`
 * (décomp pokeemeraude) : le HITSPLAT (l'impact blanc des coups physiques),
 * premier sprite d'anim de move VISIBLE (goal T4 2026-06-10).
 *
 * Porté 1:1 :
 *   - gBasicHitSplatSpriteTemplate (:169) — tileTag/palTag ANIM_TAG_IMPACT
 *     (10135), OAM 32x32 affine blend, callback AnimHitSplatBasic.
 *   - AnimHitSplatBasic (:~520) : StartSpriteAffineAnim(variante) +
 *     InitSpritePosToAnimTarget/Attacker + RunStoredCallbackWhenAffineAnimEnds
 *     → DestroyAnimSprite. Adaptation plateforme : la variante affine
 *     (sAffineAnims_HitSplat 0-3 = scales) → SetSpriteRotScale + timer 12
 *     frames (même net-effect : flash d'impact qui scale puis disparaît).
 *
 * GFX : impact.png extrait → impact.4bpp.bin (512B, 16 tiles 32x32) +
 * impact.gbapal — charge par TAG via le MÉCANISME DECOMP (assetCache +
 * LoadCompressedSpriteSheetUsingHeap), exactement comme les balls.
 *
 * Dettes : les autres templates du fichier (HandleInvert/Persistent/Random/
 * OnMonEdge/CrossImpact/Flashing...) + ConfusionDuck + BlendColorCycle — par
 * vagues avec les moves consommateurs.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { SetSpriteRotScale, PrepareBattlerSpriteForRotScale } from './battle_anim_mons';

export const ANIM_TAG_IMPACT = 10135; // ANIM_SPRITES_START(10000) + 135, battle_anim.h:145

// 1:1 gBattleAnimPicTable/PaletteTable entries pour ANIM_TAG_IMPACT
// (battle_anim_data : {gBattleAnimSpriteGfx_Impact, 0x0200, ANIM_TAG_IMPACT}).
const sAnimSpriteSheet_Impact = { data: 'gAnimGfx_Impact', size: 512, tag: ANIM_TAG_IMPACT };
const sAnimSpritePalette_Impact = { data: 'gAnimPal_Impact', tag: ANIM_TAG_IMPACT };

/** Charge la sheet+palette du tag IMPACT si pas déjà en VRAM (pattern LoadBallGfx). */
export function LoadAnimImpactGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_IMPACT) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sAnimSpriteSheet_Impact);
    LoadCompressedSpritePaletteUsingHeap(sAnimSpritePalette_Impact);
  }
}

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean;
  callback: ((s: AnimSprite) => void) | null;
  spriteId?: number; oamIndex?: number;
};

function _rt(): { gSprites?: Map<number, AnimSprite>; DestroySprite?: (id: number) => void } | undefined {
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

/** 1:1 `AnimHitSplatBasic` (battle_anim_normal.c) — net-effect plateforme :
 *  args = [x, y, relativeTo, animation]. Position sur la cible (ou attaquant)
 *  + offsets, scale-in affine ~12 frames, destroy. */
function AnimHitSplatBasic(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0];
  const relativeTo = args[2];
  const battler = relativeTo === 0 ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  const mon = _battlerSprite(battler);
  if (mon) {
    sprite.x = mon.x + (mon.x2 ?? 0) + args[0];
    sprite.y = mon.y + (mon.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  sprite.data[7] = 0;            // timer
  sprite.data[6] = args[3] & 3;  // variante affine (0-3)
  if (sprite.spriteId !== undefined) {
    PrepareBattlerSpriteForRotScale(sprite.spriteId, 1 /* ST_OAM_OBJ_BLEND 1:1 oam ObjBlend */);
  }
  sprite.callback = _HitSplat_Step;
}
function _HitSplat_Step(sprite: AnimSprite): void {
  sprite.data[7]++;
  // 1:1-net sAffineAnims_HitSplat : scale-in rapide (0x80→0x100 sur ~8 frames)
  // puis hold ; variantes 1-3 = scales finaux réduits (impacts plus petits).
  const t = Math.min(sprite.data[7], 8);
  const final = 256 - (sprite.data[6] * 32);
  const scale = 128 + Math.floor(((final - 128) * t) / 8);
  if (sprite.spriteId !== undefined) {
    // inverse : SetSpriteRotScale attend le "scale param" (256=1:1 ; >256=plus petit)
    const param = Math.max(64, Math.floor((256 * 256) / scale));
    SetSpriteRotScale(sprite.spriteId, param, param, 0);
  }
  if (sprite.data[7] >= 13) {
    _itf().DestroyAnimSprite?.(sprite);
  }
}

// ─── Enregistrement registry ────────────────────────────────────────────────
registerAnimTemplates([
  { name: 'gBasicHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatBasic as never },
  // 1:1 : gHandleInvertHitSplatSpriteTemplate partage gfx+callback (l'invert X
  // est ignoré par AnimHitSplatBasic de base — dette douce).
  { name: 'gHandleInvertHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatBasic as never },
]);

/**
 * pokemon_animation.ts — miroir PARTIEL ASSUMÉ de `src/pokemon_animation.c`
 * (décomp pokeemeraude) : les anims de MOUVEMENT des fronts à l'apparition
 * (bounce/shake/stretch), déclenchées par DoMonFrontSpriteAnimation
 * (`_BattleAnimateFrontSprite`, game/battle_main.ts).
 *
 * Portées 1:1 (top de distribution pokemon-anims.json, 386 species) :
 *   - ANIM_V_SQUISH_AND_BOUNCE (50 species) + _SLOW (16) — pokemon_animation.c:1834
 *   - ANIM_V_STRETCH (32)  — Anim_VerticalStretch (:~2050)
 *   - ANIM_V_SHAKE (25)    — VerticalShake (:1368)
 *   - ANIM_GROW_VIBRATE (18) — Anim_GrowVibrate (:1257)
 *   - ANIM_H_SHAKE (17)    — HorizontalShake (:~1350)
 *   = ~158/386 species (41%). Les 56 autres ANIM_* = fallback no-op avec
 *   warn-once (DETTE explicite, même calibre : portage incrémental).
 *
 * Adaptations plateforme (documentées) :
 *   - HandleStartAffineAnim/HandleSetAffineData/SetAffineData → Prepare/Set
 *     SpriteRotScale (game/battle_anim_mons, matrice OAM réelle — le squish
 *     EST visible) ; ResetSpriteAfterAnim → ResetSpriteRotScale.
 *   - Task_HandleMonAnimation : version plate (sauve data[0]/data[2], clear
 *     data[2..7], sDontFlip=TRUE, callback=anim ; WaitAnimEnd restaure).
 *   - TryFlipX : no-op (sDontFlip=TRUE posé 1:1 par la task pour les fronts).
 */

import { Sin } from './trig';
import { getRuntime } from '../engine/system/decomp-globals';
import {
  SetSpriteRotScale, PrepareBattlerSpriteForRotScale, ResetSpriteRotScale,
} from './battle_anim_mons';

type MonSprite = {
  data: number[]; x2: number; y2: number;
  callback: ((s: MonSprite) => void) | null;
  spriteId?: number;
};

function _sid(sprite: MonSprite): number {
  if (sprite.spriteId !== undefined) return sprite.spriteId;
  const rt = getRuntime();
  if (!rt?.gSprites) return -1;
  for (const [id, sp] of rt.gSprites.entries()) {
    if ((sp as unknown) === (sprite as unknown)) return id;
  }
  return -1;
}

/** 1:1 `HandleStartAffineAnim` (net-effect plateforme : prépare la matrice). */
function HandleStartAffineAnim(sprite: MonSprite): void {
  const id = _sid(sprite);
  if (id >= 0) PrepareBattlerSpriteForRotScale(id, 0);
}
/** 1:1 `HandleSetAffineData`/`SetAffineData` → matrice réelle. */
function HandleSetAffineData(sprite: MonSprite, xScale: number, yScale: number, rotation: number): void {
  const id = _sid(sprite);
  if (id >= 0) SetSpriteRotScale(id, xScale, yScale, rotation);
}
/** 1:1 `ResetSpriteAfterAnim` (net-effect : reset matrice + affine off). */
function ResetSpriteAfterAnim(sprite: MonSprite): void {
  const id = _sid(sprite);
  if (id >= 0) ResetSpriteRotScale(id);
}

/** 1:1 `WaitAnimEnd` (pokemon_animation.c) : data[2] restauré (species),
 *  callback → dummy (fin d'anim de mouvement). */
function WaitAnimEnd(sprite: MonSprite): void {
  sprite.data[0] = sprite.data[14];   // restore battler (sauvé par Launch)
  sprite.data[2] = sprite.data[15];   // restore species
  sprite.callback = null;
}

// ─── VerticalSquishBounce (pokemon_animation.c:1834) ───────────────────────
function VerticalSquishBounce(sprite: MonSprite): void {
  let posY = 0;
  if (sprite.data[2] === 0) {
    HandleStartAffineAnim(sprite);
    sprite.data[3] = 0;
  }
  if (sprite.data[2] > sprite.data[0] * 3) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const yScale = Sin(sprite.data[4], 32) + 256;
    if (sprite.data[2] > sprite.data[0] && sprite.data[2] < sprite.data[0] * 2) {
      sprite.data[3] += Math.floor(128 / sprite.data[0]);
    }
    if (yScale > 256) posY = Math.floor((256 - yScale) / 8);
    sprite.y2 = -Sin(sprite.data[3], 10) - posY;
    HandleSetAffineData(sprite, 256 - Sin(sprite.data[4], 32), yScale, 0);
    sprite.data[2]++;
    sprite.data[4] = (sprite.data[4] + Math.floor(128 / sprite.data[0])) & 0xFF;
  }
}
function Anim_VerticalSquishBounce(sprite: MonSprite): void {
  sprite.data[0] = 16;
  VerticalSquishBounce(sprite);
  sprite.callback = VerticalSquishBounce;
}
/** 1:1 : la variante SLOW pose data[0]=32. */
function Anim_VerticalSquishBounce_Slow(sprite: MonSprite): void {
  sprite.data[0] = 32;
  VerticalSquishBounce(sprite);
  sprite.callback = VerticalSquishBounce;
}

// ─── VerticalShake (:1368) ──────────────────────────────────────────────────
function VerticalShake(sprite: MonSprite): void {
  const counter = sprite.data[2];
  if (counter > 2304) {
    sprite.callback = WaitAnimEnd;
    sprite.y2 = 0;
  } else {
    sprite.y2 = Sin(counter % 256, 3);
  }
  sprite.data[2] += sprite.data[0];
}
function Anim_VerticalShake(sprite: MonSprite): void {
  sprite.data[0] = 60;
  VerticalShake(sprite);
  sprite.callback = VerticalShake;
}

// ─── HorizontalShake (:~1350) ───────────────────────────────────────────────
function HorizontalShake(sprite: MonSprite): void {
  const counter = sprite.data[2];
  if (counter > 2304) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0;
  } else {
    sprite.x2 = Sin(counter % 256, sprite.data[7]);
  }
  sprite.data[2] += sprite.data[0];
}
function Anim_HorizontalShake(sprite: MonSprite): void {
  sprite.data[0] = 60;
  sprite.data[7] = 3;
  HorizontalShake(sprite);
  sprite.callback = HorizontalShake;
}

// ─── Anim_GrowVibrate (:1257) ───────────────────────────────────────────────
function Anim_GrowVibrate(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 40) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index = Math.floor(sprite.data[2] * 256 / 40) % 256;
    if (sprite.data[2] % 2 === 0) {
      sprite.data[4] = Sin(index, 32) + 256;
      sprite.data[5] = Sin(index, 32) + 256;
    } else {
      sprite.data[4] = Sin(index, 8) + 256;
      sprite.data[5] = Sin(index, 8) + 256;
    }
    HandleSetAffineData(sprite, sprite.data[4], sprite.data[5], 0);
  }
  sprite.data[2]++;
}

// ─── Anim_VerticalStretch (:~2050) ─────────────────────────────────────────
function Anim_VerticalStretch(sprite: MonSprite): void {
  let posY = 0;
  let index1 = 0;
  let index2 = 0;
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 40) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
    sprite.y2 = posY;
  } else {
    index2 = Math.floor((sprite.data[2] * 128) / 40);
    if (sprite.data[2] >= 10 && sprite.data[2] <= 29) {
      sprite.data[7] += 51;
      index1 = sprite.data[7] & 0xFF;
    }
    // sDontFlip = TRUE (fronts) → branche else 1:1 (scale X positif).
    sprite.data[4] = Sin(index2, 16) + 256;
    sprite.data[5] = (256 - Sin(index2, 40)) - Sin(index1, 8);
    if (sprite.data[5] !== 256) posY = Math.floor((256 - sprite.data[5]) / 8);
    sprite.y2 = -posY;
    HandleSetAffineData(sprite, sprite.data[4], sprite.data[5], 0);
  }
  sprite.data[2]++;
}

// ─── Table par NOM (pokemon-anims.json donne les noms ANIM_*) ──────────────
const _animsByName: Record<string, (s: MonSprite) => void> = {
  ANIM_V_SQUISH_AND_BOUNCE: Anim_VerticalSquishBounce,
  ANIM_V_SQUISH_AND_BOUNCE_SLOW: Anim_VerticalSquishBounce_Slow,
  ANIM_V_SHAKE: Anim_VerticalShake,
  ANIM_H_SHAKE: Anim_HorizontalShake,
  ANIM_GROW_VIBRATE: Anim_GrowVibrate,
  ANIM_V_STRETCH: Anim_VerticalStretch,
};
const _warned = new Set<string>();

/** 1:1 `LaunchAnimationTaskForFrontSprite` + `Task_HandleMonAnimation`
 *  (version plate) : sauve battler/species (data[14]/[15], restaurés par
 *  WaitAnimEnd), clear data[2..7], pose le callback anim. */
export function LaunchAnimationTaskForFrontSprite(spriteId: number, animName: string): void {
  const fn = _animsByName[animName];
  if (!fn) {
    if (!_warned.has(animName)) {
      _warned.add(animName);
      console.warn('[pokemon_animation] anim non portée (dette, top-5 porté):', animName);
    }
    return;
  }
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId) as unknown as MonSprite | undefined;
  if (!sprite) return;
  // 1:1 Task_HandleMonAnimation state 0.
  sprite.data[14] = sprite.data[0];   // tBattlerId sauvé
  sprite.data[15] = sprite.data[2];   // tSpeciesId sauvé
  for (let i = 2; i <= 7; i++) sprite.data[i] = 0;
  sprite.callback = fn as never;
}

// Surface lazy (battle_main _BattleAnimateFrontSprite, anti-cycle).
(globalThis as Record<string, unknown>).__pokemonAnimation = {
  LaunchAnimationTaskForFrontSprite,
};

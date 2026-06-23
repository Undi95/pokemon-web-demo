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

import { Sin, Cos } from './trig';
import { BlendPalette } from '../harness/runtime/decomp-globals';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import type { DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
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
  for (let id = 0; id < MAX_SPRITES; id++) {
    const sp = rt.gSprites[id];
    if (sp === undefined) continue;
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
  // Fix « session 96 » (porté de l'ancien engine/pokemon/pokemon-animation) :
  // DoMonFrontSpriteAnimation fait StartSpriteAnim(sprite,1) (switch 2-frame)
  // au début ; sans reset, le mon reste FIGÉ sur la frame alt en fin d'anim.
  // Le décomp laisse anim 1 (la ROM affiche frame 0 via le cycling du sprite
  // system) → on remet explicitement la frame BASE (0) pour matcher l'observable.
  // Gardé par le flag posé par DoMonFront → NO-OP en combat (Launch direct, pas
  // de switch 2-frame → pas de flag) : zéro risque sur le tileBase combat.
  const s = sprite as MonSprite & { _monFrontBaseFrameReset?: boolean; oamIndex?: number; tileBase?: number };
  if (s._monFrontBaseFrameReset) {
    s._monFrontBaseFrameReset = false;
    const id = _sid(sprite);
    const rt = getRuntime();
    if (id >= 0 && rt) {
      rt.StartSpriteAnim(id, 0);
      const oam = rt.gba?.oam?.[s.oamIndex ?? -1];
      if (oam) oam.tileId = s.tileBase ?? 0;
    }
  }
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


// ============================================================================
// VAGUE 2 (goal T2, user << importe-les tous >>) : LES 56 ANIM_* RESTANTES,
// 1:1 pokemon_animation.c. Fronts -> sDontFlip=TRUE 1:1 (TryFlipX/negation
// HandleSetAffineData = no-op, comme la vague 1).
// ============================================================================

// 1:1 `sAnims[MAX_BATTLERS_COUNT]` + sAnimIdx + InitAnimData + AddNewAnim
// (pokemon_animation.c:1037-1061).
type SAnim = { rotation: number; delay: number; runs: number; speed: number; data: number };
const sAnims: SAnim[] = [
  { rotation: 0, delay: 0, runs: 1, speed: 0, data: 0 },
  { rotation: 0, delay: 0, runs: 1, speed: 0, data: 0 },
  { rotation: 0, delay: 0, runs: 1, speed: 0, data: 0 },
  { rotation: 0, delay: 0, runs: 1, speed: 0, data: 0 },
];
let sAnimIdx = 0;
function InitAnimData(id: number): void {
  if (id >= 4) return;
  sAnims[id].rotation = 0; sAnims[id].delay = 0; sAnims[id].runs = 1;
  sAnims[id].speed = 0; sAnims[id].data = 0;
}
function AddNewAnim(): number {
  sAnimIdx = (sAnimIdx + 1) % 4;
  InitAnimData(sAnimIdx);
  return sAnimIdx;
}

/** OBJ_PLTT_ID du sprite mon (paletteNum REEL via l'OAM plat). */
function _objPlttOffset(sprite: MonSprite): number {
  const rt = getRuntime();
  const oamIndex = (sprite as { oamIndex?: number }).oamIndex;
  const pal = (rt as unknown as { gba?: { oam?: Array<{ paletteNum?: number }> } })?.gba?.oam?.[oamIndex ?? -1]?.paletteNum ?? 0;
  return (pal + 16) * 16;
}

// Tables 1:1 (pokemon_animation.c).
const sBounceRotateToSidesData: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
  [[0, 8, 8], [8, -8, 12], [-8, 8, 12], [8, -8, 12], [-8, 8, 12], [8, -8, 12], [-8, 0, 12], [0, 0, 0]],
  [[0, 8, 16], [8, -8, 24], [-8, 8, 24], [8, -8, 24], [-8, 8, 24], [8, -8, 24], [-8, 0, 24], [0, 0, 0]],
];
const sVerticalShakeData: ReadonlyArray<readonly [number, number]> = [
  [6, 30], [0xFE, 15], [6, 30], [0xFF, 0],   // -2/-1 stockes u8 1:1
];
const sZigzagData: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, 6], [2, 0, 6], [-2, 2, 6], [2, 0, 6], [-2, -2, 6], [2, 0, 6], [-2, 2, 6], [2, 0, 6], [-1, -1, 6], [0, 0, 0],
];
const sYellowFlashData: ReadonlyArray<readonly [number, number]> = [
  [0, 5], [1, 1], [0, 15], [1, 4], [0, 2], [1, 2], [0, 2], [1, 2], [0, 2], [1, 2], [0, 2], [1, 2], [0, 2], [0, 0xFF],
];
const RGB_BLACK = 0, RGB_YELLOW = 0x03FF, RGB_BLUE = 0x7C00, RGB_ORANGE_GLOW = 31 | (22 << 5);

/** 1:1 macro `GlowColor(color, colorIncrement, speed)` (pokemon_animation.c:1539). */
function GlowColor(sprite: MonSprite, color: number, colorIncrement: number, speed: number): void {
  if (sprite.data[2] === 0) sprite.data[7] = _objPlttOffset(sprite);
  if (sprite.data[2] > 128) {
    BlendPalette(sprite.data[7], 16, 0, color);
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.data[6] = Sin(sprite.data[2], colorIncrement);
    BlendPalette(sprite.data[7], 16, sprite.data[6], color);
  }
  sprite.data[2] += speed;
}

// --- Slides / shakes / vibrates ---------------------------------------------
function HorizontalSlide(sprite: MonSprite): void {
  if (sprite.data[2] > sprite.data[0]) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0;
  } else {
    sprite.x2 = Sin(Math.floor(sprite.data[2] * 384 / sprite.data[0]) % 256, 6);
  }
  sprite.data[2]++;
}
function Anim_HorizontalSlide(sprite: MonSprite): void { sprite.data[0] = 40; HorizontalSlide(sprite); sprite.callback = HorizontalSlide; }
function Anim_HorizontalSlide_Slow(sprite: MonSprite): void { sprite.data[0] = 80; HorizontalSlide(sprite); sprite.callback = HorizontalSlide; }

function VerticalSlide(sprite: MonSprite): void {
  if (sprite.data[2] > sprite.data[0]) {
    sprite.callback = WaitAnimEnd;
    sprite.y2 = 0;
  } else {
    sprite.y2 = -Sin(Math.floor(sprite.data[2] * 384 / sprite.data[0]) % 256, 6);
  }
  sprite.data[2]++;
}
function Anim_VerticalSlide(sprite: MonSprite): void { sprite.data[0] = 40; VerticalSlide(sprite); sprite.callback = VerticalSlide; }
function Anim_VerticalSlide_Slow(sprite: MonSprite): void { sprite.data[0] = 80; VerticalSlide(sprite); sprite.callback = VerticalSlide; }

function Anim_HorizontalShake_Slow(sprite: MonSprite): void {
  sprite.data[0] = 30; sprite.data[7] = 3;
  HorizontalShake(sprite); sprite.callback = HorizontalShake;
}
function Anim_HorizontalVibrate(sprite: MonSprite): void {
  if (sprite.data[2] > 40) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0;
  } else {
    const sign = (sprite.data[2] & 1) === 0 ? 1 : -1;
    sprite.x2 = Sin(Math.floor(sprite.data[2] * 128 / 40) % 256, 6) * sign;
  }
  sprite.data[2]++;
}
function Anim_CircularVibrate(sprite: MonSprite): void {
  if (sprite.data[2] > 512) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0; sprite.y2 = 0;
  } else {
    const sign = (sprite.data[2] & 1) === 0 ? 1 : -1;
    const amplitude = Sin(Math.floor(sprite.data[2] / 4), 8);
    const index = sprite.data[2] % 256;
    sprite.y2 = Sin(index, amplitude) * sign;
    sprite.x2 = Cos(index, amplitude) * sign;
  }
  sprite.data[2] += 9;
}
function VerticalShakeTwice(sprite: MonSprite): void {
  const index = sprite.data[2] & 0xFF;
  const var7 = sprite.data[6] & 0xFF;
  const var5 = sVerticalShakeData[sprite.data[5]][0];
  const var6 = sVerticalShakeData[sprite.data[5]][1];
  let amplitude = 0;
  if (var5 !== 0xFE) amplitude = Math.floor((var6 - var7) * var5 / var6);
  if (var5 === 0xFF) {
    sprite.callback = WaitAnimEnd;
    sprite.y2 = 0;
  } else {
    sprite.y2 = Sin(index, amplitude);
    if (var7 === var6) { sprite.data[5]++; sprite.data[6] = 0; }
    else { sprite.data[2] += sprite.data[0]; sprite.data[6]++; }
  }
}
function Anim_VerticalShakeTwice(sprite: MonSprite): void { sprite.data[0] = 48; VerticalShakeTwice(sprite); sprite.callback = VerticalShakeTwice; }

// --- Jumps / hops / zigzag ----------------------------------------------------
function VerticalJumps(sprite: MonSprite): void {
  let counter = sprite.data[2];
  if (counter > 384) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0; sprite.y2 = 0;
  } else {
    switch (Math.floor(counter / 128)) {
      case 0: case 1:
        sprite.y2 = -Sin(counter % 128, sprite.data[0] * 2);
        break;
      case 2: case 3:
        counter -= 256;
        sprite.y2 = -Sin(counter, sprite.data[0] * 3);
        break;
    }
  }
  sprite.data[2] += 12;
}
function Anim_VerticalJumps_Big(sprite: MonSprite): void { sprite.data[0] = 4; VerticalJumps(sprite); sprite.callback = VerticalJumps; }
function Anim_VerticalJumps_Small(sprite: MonSprite): void { sprite.data[0] = 3; VerticalJumps(sprite); sprite.callback = VerticalJumps; }

function Anim_HorizontalJumps(sprite: MonSprite): void {
  const counter = sprite.data[2];
  if (counter > 512) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0; sprite.y2 = 0;
  } else {
    switch (Math.floor(sprite.data[2] / 128)) {
      case 0: sprite.x2 = -Math.floor((counter % 128) * 8 / 128); break;
      case 1: sprite.x2 = Math.floor((counter % 128) / 16) - 8; break;
      case 2: sprite.x2 = Math.floor((counter % 128) / 16); break;
      case 3: sprite.x2 = -Math.floor((counter % 128) * 8 / 128) + 8; break;
    }
    sprite.y2 = -Sin(counter % 128, 8);
  }
  sprite.data[2] += 12;
}
function Anim_VerticalJumpsHorizontalJumps(sprite: MonSprite): void {
  let counter = sprite.data[2];
  if (counter > 768) {
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0; sprite.y2 = 0;
  } else {
    switch (Math.floor(counter / 128)) {
      case 0: case 1: sprite.x2 = 0; break;
      case 2: counter = 0; break;
      case 3: sprite.x2 = -Math.floor((counter % 128) * 8 / 128); break;
      case 4: sprite.x2 = Math.floor((counter % 128) / 8) - 8; break;
      case 5: sprite.x2 = -Math.floor((counter % 128) * 8 / 128) + 8; break;
    }
    sprite.y2 = -Sin(counter % 128, 8);
  }
  sprite.data[2] += 12;
}
function Anim_RapidHorizontalHops(sprite: MonSprite): void {
  if (sprite.data[2] > 2048) {
    sprite.callback = WaitAnimEnd;
    sprite.data[6] = 0;
  } else {
    switch (Math.floor(sprite.data[2] / 512) % 4) {
      case 0: sprite.x2 = -Math.floor((sprite.data[2] % 512) * 16 / 512); break;
      case 1: sprite.x2 = Math.floor((sprite.data[2] % 512) / 32) - 16; break;
      case 2: sprite.x2 = Math.floor((sprite.data[2] % 512) / 32); break;
      case 3: sprite.x2 = -Math.floor((sprite.data[2] % 512) * 16 / 512) + 16; break;
    }
    sprite.y2 = -Sin(sprite.data[2] % 128, 4);
    sprite.data[2] += 24;
  }
}
function Zigzag(sprite: MonSprite): void {
  if (sprite.data[2] === 0) sprite.data[3] = 0;
  if (sZigzagData[sprite.data[3]][2] === sprite.data[2]) {
    if (sZigzagData[sprite.data[3]][2] === 0) {
      sprite.callback = WaitAnimEnd;
    } else {
      sprite.data[3]++;
      sprite.data[2] = 0;
    }
  }
  if (sZigzagData[sprite.data[3]][2] === 0) {
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.x2 += sZigzagData[sprite.data[3]][0];
    sprite.y2 += sZigzagData[sprite.data[3]][1];
    sprite.data[2]++;
  }
}
function Anim_ZigzagFast(sprite: MonSprite): void { Zigzag(sprite); sprite.callback = Zigzag; }
function Anim_ZigzagSlow(sprite: MonSprite): void {
  if (sprite.data[2] === 0) sprite.data[0] = 0;
  if (sprite.data[0] <= 0) { Zigzag(sprite); sprite.data[0] = 1; }
  else sprite.data[0]--;
}

// --- Wobbles / pivots (rotation affine) ---------------------------------------
function VerticalSlideWobble(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 100) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index = Math.floor(sprite.data[2] * 256 / 100);
    const v = Math.floor(sprite.data[2] * 512 / 100) & 0xFF;
    sprite.y2 = Sin(index, sprite.data[0]);
    HandleSetAffineData(sprite, 256, 256, Sin(v, 3276));
  }
  sprite.data[2]++;
}
function Anim_VerticalSlideWobble(sprite: MonSprite): void { sprite.data[0] = 10; VerticalSlideWobble(sprite); sprite.callback = VerticalSlideWobble; }
function Anim_VerticalSlideWobble_Small(sprite: MonSprite): void { sprite.data[0] = 5; VerticalSlideWobble(sprite); sprite.callback = VerticalSlideWobble; }

function Anim_HorizontalSlideWobble(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 100) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.x2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index = Math.floor(sprite.data[2] * 256 / 100);
    const v = Math.floor(sprite.data[2] * 512 / 100) & 0xFF;
    sprite.x2 = Sin(index, 8);
    HandleSetAffineData(sprite, 256, 256, Sin(v, 3276));
  }
  sprite.data[2]++;
}
function RisingWobble(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 100) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index = Math.floor(sprite.data[2] * 256 / 100);
    const v = Math.floor(sprite.data[2] * 512 / 100) & 0xFF;
    sprite.y2 = -Sin(Math.floor(index / 2), sprite.data[0] * 2);
    HandleSetAffineData(sprite, 256, 256, Sin(v, 3276));
  }
  sprite.data[2]++;
}
function Anim_RisingWobble(sprite: MonSprite): void { sprite.data[0] = 5; RisingWobble(sprite); sprite.callback = RisingWobble; }

function Anim_HorizontalPivot(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 100) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index = Math.floor(sprite.data[2] * 256 / 100);
    sprite.y2 = Sin(index, 10);
    HandleSetAffineData(sprite, 256, 256, Sin(index, 3276));
  }
  sprite.data[2]++;
}

// --- Swings -------------------------------------------------------------------
function SwingConcave(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > sAnims[sprite.data[0]].data) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.x2 = 0;
    if (sAnims[sprite.data[0]].runs > 1) {
      sAnims[sprite.data[0]].runs--;
      sprite.data[2] = 0;
    } else {
      ResetSpriteAfterAnim(sprite);
      sprite.callback = WaitAnimEnd;
    }
  } else {
    const index = Math.floor(sprite.data[2] * 256 / sAnims[sprite.data[0]].data);
    sprite.x2 = -Sin(index, 10);
    HandleSetAffineData(sprite, 256, 256, Sin(index, 3276));
  }
  sprite.data[2]++;
}
function Anim_SwingConcave(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 100;
  SwingConcave(sprite); sprite.callback = SwingConcave;
}
function Anim_SwingConcave_Fast(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 50; sAnims[id].runs = 2;
  SwingConcave(sprite); sprite.callback = SwingConcave;
}
function Anim_SwingConcave_FastShort(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 50;
  SwingConcave(sprite); sprite.callback = SwingConcave;
}
function SwingConvex(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > sAnims[sprite.data[0]].data) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.x2 = 0;
    if (sAnims[sprite.data[0]].runs > 1) {
      sAnims[sprite.data[0]].runs--;
      sprite.data[2] = 0;
    } else {
      ResetSpriteAfterAnim(sprite);
      sprite.callback = WaitAnimEnd;
    }
  } else {
    const index = Math.floor(sprite.data[2] * 256 / sAnims[sprite.data[0]].data);
    sprite.x2 = -Sin(index, 10);
    HandleSetAffineData(sprite, 256, 256, -Sin(index, 3276));
  }
  sprite.data[2]++;
}
function Anim_SwingConvex(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 100;
  SwingConvex(sprite); sprite.callback = SwingConvex;
}
function Anim_SwingConvex_Fast(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 50; sAnims[id].runs = 2;
  SwingConvex(sprite); sprite.callback = SwingConvex;
}

// --- Rotations ------------------------------------------------------------------
function RotateToSides(sprite: MonSprite): void {
  if (sprite.data[2] === 0) { HandleStartAffineAnim(sprite); sprite.data[2]++; }
  if (sprite.data[7] > 254) {
    sprite.x2 = 0; sprite.y2 = 0;
    HandleSetAffineData(sprite, 256, 256, 0);
    if (sAnims[sprite.data[0]].runs > 1) {
      sAnims[sprite.data[0]].runs--;
      sprite.data[2] = 0;
      sprite.data[7] = 0;
    } else {
      ResetSpriteAfterAnim(sprite);
      sprite.callback = WaitAnimEnd;
    }
  } else {
    sprite.x2 = -Sin(sprite.data[7], 16);
    const rotation = Sin(sprite.data[7], 32);
    HandleSetAffineData(sprite, 256, 256, (rotation << 8) & 0xFFFF);
    sprite.data[7] += sAnims[sprite.data[0]].rotation;
  }
}
function Anim_RotateToSides_Twice(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 4; sAnims[id].runs = 2;
  RotateToSides(sprite); sprite.callback = RotateToSides;
}
function Anim_RotateUpToSides(sprite: MonSprite): void {
  if (sprite.data[2] === 0) { HandleStartAffineAnim(sprite); sprite.data[2]++; }
  if (sprite.data[7] > 254) {
    sprite.x2 = 0; sprite.y2 = 0;
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.x2 = -Sin(sprite.data[7], 16);
    sprite.y2 = -Sin(sprite.data[7] % 128, 16);
    const rotation = Sin(sprite.data[7], 32);
    HandleSetAffineData(sprite, 256, 256, (rotation << 8) & 0xFFFF);
    sprite.data[7] += 8;
  }
}
function BounceRotateToSides(sprite: MonSprite): void {
  const structId = sprite.data[0];
  const variable = sAnims[structId].rotation;
  const arrId = sAnims[structId].data;
  const r9 = sBounceRotateToSidesData[arrId][sprite.data[4]][0];
  const r10 = sBounceRotateToSidesData[arrId][sprite.data[4]][1] - r9;
  const r7 = sprite.data[3];
  if (sprite.data[2] === 0) { HandleStartAffineAnim(sprite); sprite.data[2]++; }
  if (sBounceRotateToSidesData[arrId][sprite.data[4]][2] === 0) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.x2 = 0; sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const dur = sBounceRotateToSidesData[arrId][sprite.data[4]][2];
    sprite.y2 = -Sin(Math.floor(r7 * 128 / dur), 10);
    sprite.x2 = Math.floor(r10 * r7 / dur) + r9;
    const rotation = Math.trunc(-(variable * sprite.x2) / 8);
    HandleSetAffineData(sprite, 256, 256, rotation & 0xFFFF);
    if (r7 === dur) { sprite.data[4]++; sprite.data[3] = 0; }
    else sprite.data[3]++;
  }
}
function Anim_BounceRotateToSides(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 4096;
  sAnims[id].data = sprite.data[6];
  BounceRotateToSides(sprite); sprite.callback = BounceRotateToSides;
}
function Anim_BounceRotateToSides_Slow(sprite: MonSprite): void {
  sprite.data[6] = 1;
  Anim_BounceRotateToSides(sprite);
}
function Anim_BounceRotateToSides_Small(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 2048;
  sAnims[id].data = sprite.data[6];
  BounceRotateToSides(sprite); sprite.callback = BounceRotateToSides;
}
function Anim_BounceRotateToSides_SmallSlow(sprite: MonSprite): void {
  sprite.data[6] = 1;
  Anim_BounceRotateToSides_Small(sprite);
}
function Twist(sprite: MonSprite): void {
  const id = sprite.data[0];
  if (sAnims[id].delay !== 0) {
    sAnims[id].delay--;
  } else {
    if (sprite.data[2] === 0 && sAnims[id].data === 0) {
      HandleStartAffineAnim(sprite);
      sAnims[id].data++;
    }
    if (sprite.data[2] > sAnims[id].rotation) {
      HandleSetAffineData(sprite, 256, 256, 0);
      if (sAnims[id].runs > 1) {
        sAnims[id].runs--;
        sAnims[id].delay = 10;
        sprite.data[2] = 0;
      } else {
        ResetSpriteAfterAnim(sprite);
        sprite.callback = WaitAnimEnd;
      }
    } else {
      sprite.data[6] = Sin(sprite.data[2] % 256, 4096);
      HandleSetAffineData(sprite, 256, 256, sprite.data[6]);
    }
    sprite.data[2] += 16;
  }
}
function Anim_Twist(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 512; sAnims[id].delay = 0;
  Twist(sprite); sprite.callback = Twist;
}
function Anim_Twist_Twice(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 1024; sAnims[id].delay = 0; sAnims[id].runs = 2;
  Twist(sprite); sprite.callback = Twist;
}
function Spin(sprite: MonSprite): void {
  const id = sprite.data[0];
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > sAnims[id].delay) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.data[6] = Math.floor(65536 / sAnims[id].data) * sprite.data[2];
    HandleSetAffineData(sprite, 256, 256, sprite.data[6] & 0xFFFF);
  }
  sprite.data[2]++;
}
function Anim_Spin(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].delay = 60; sAnims[id].data = 30;
  Spin(sprite); sprite.callback = Spin;
}
function CircleCounterclockwise(sprite: MonSprite): void {
  const id = sprite.data[0];
  if (sprite.data[2] > sAnims[id].rotation) {
    sprite.x2 = 0; sprite.y2 = 0;
    sprite.callback = WaitAnimEnd;
  } else {
    const index = (sprite.data[2] + 192) % 256;
    sprite.x2 = -Cos(index, sAnims[id].data * 2);
    sprite.y2 = Sin(index, sAnims[id].data) + sAnims[id].data;
  }
  sprite.data[2] += sAnims[id].speed;
}
function Anim_CircleCounterclockwise_Slow(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 512; sAnims[id].data = 3; sAnims[id].speed = 12;
  CircleCounterclockwise(sprite); sprite.callback = CircleCounterclockwise;
}

// --- Grow / shrink / stretch ------------------------------------------------------
function Anim_CircularStretchTwice(sprite: MonSprite): void {
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 40) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const v = Math.floor(sprite.data[2] * 512 / 40) % 256;
    sprite.data[4] = Sin(v, 32) + 256;
    sprite.data[5] = Cos(v, 32) + 256;
    HandleSetAffineData(sprite, sprite.data[4], sprite.data[5], 0);
  }
  sprite.data[2]++;
}
function ShrinkGrow(sprite: MonSprite): void {
  let posY = 0;
  if (sprite.data[2] > Math.floor(128 / sprite.data[6]) * sprite.data[7]) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const yScale = Sin(sprite.data[4], 32) + 256;
    if (yScale > 256) posY = Math.floor((256 - yScale) / 8);
    sprite.y2 = -posY;
    HandleSetAffineData(sprite, Sin(sprite.data[4], 48) + 256, yScale, 0);
    sprite.data[2]++;
    sprite.data[4] = (sprite.data[4] + sprite.data[6]) & 0xFF;
  }
}
function Anim_ShrinkGrow(sprite: MonSprite): void {
  if (sprite.data[2] === 0) {
    HandleStartAffineAnim(sprite);
    sprite.data[7] = 3;
    sprite.data[6] = 8;
  }
  ShrinkGrow(sprite);
}
function Anim_HorizontalStretch(sprite: MonSprite): void {
  let index1 = 0;
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 40) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  } else {
    const index2 = Math.floor(sprite.data[2] * 128 / 40);
    if (sprite.data[2] >= 10 && sprite.data[2] <= 29) {
      sprite.data[7] += 51;
      index1 = sprite.data[7] & 0xFF;
    }
    // sDontFlip=TRUE (fronts) -> branche else 1:1.
    sprite.data[4] = (256 - Sin(index2, 40)) - Sin(index1, 16);
    sprite.data[5] = Sin(index2, 16) + 256;
    HandleSetAffineData(sprite, sprite.data[4], sprite.data[5], 0);
  }
  sprite.data[2]++;
}
function Anim_GrowInStages(sprite: MonSprite): void {
  if (sprite.data[2] === 0) {
    HandleStartAffineAnim(sprite);
    sprite.data[5] = 0; sprite.data[6] = 0; sprite.data[7] = 0;
    sprite.data[2]++;
  }
  if (sprite.data[6] > 0) {
    sprite.data[6]--;
    if (sprite.data[5] !== 3) {
      let scale = Math.floor(8 * sprite.data[6] / 20);
      scale = Sin(sprite.data[7] - scale, 64);
      HandleSetAffineData(sprite, 256 - scale, 256 - scale, 0);
    }
  } else {
    let v: number;
    if (sprite.data[5] === 3) {
      if (sprite.data[7] > 63) {
        sprite.data[7] = 64;
        HandleSetAffineData(sprite, 256, 256, 0);
        ResetSpriteAfterAnim(sprite);
        sprite.callback = WaitAnimEnd;
      }
      v = Cos(sprite.data[7], 64);
    } else {
      v = Sin(sprite.data[7], 64);
      if (sprite.data[7] > 63) {
        sprite.data[5] = 3; sprite.data[6] = 10; sprite.data[7] = 0;
      } else if (v > 48 && sprite.data[5] === 1) {
        sprite.data[5] = 2; sprite.data[6] = 20;
      } else if (v > 16 && sprite.data[5] === 0) {
        sprite.data[5] = 1; sprite.data[6] = 20;
      }
    }
    sprite.data[7] += 2;
    HandleSetAffineData(sprite, 256 - v, 256 - v, 0);
  }
}
function Anim_LungeGrow(sprite: MonSprite): void {
  if (sprite.data[2] === 0) {
    HandleStartAffineAnim(sprite);
    sprite.data[2]++;
    sprite.data[7] = 0;
  }
  if (sprite.data[7] > 512) {
    sprite.x2 = 0;
    ResetSpriteAfterAnim(sprite);
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.x2 = -Sin(Math.floor((sprite.data[7] % 256) / 2), 16);
    sprite.data[7] += 8;
    const scale = -Sin(Math.floor((sprite.data[7] % 256) / 2), 64);
    HandleSetAffineData(sprite, 256 + scale, 256 + scale, 0);
  }
}
function Anim_CircleIntoBackground(sprite: MonSprite): void {
  if (sprite.data[2] === 0) {
    HandleStartAffineAnim(sprite);
    sprite.data[2]++;
    sprite.data[7] = 0;
  }
  if (sprite.data[7] > 512) {
    sprite.x2 = 0;
    ResetSpriteAfterAnim(sprite);
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.callback = WaitAnimEnd;
  } else {
    sprite.x2 = -Sin(sprite.data[7] % 256, 8);
    sprite.data[7] += 8;
    const scale = Sin(Math.floor((sprite.data[7] % 256) / 2), 96);
    HandleSetAffineData(sprite, 256 + scale, 256 + scale, 0);
  }
}
function DeepVerticalSquishBounce(sprite: MonSprite): void {
  if (sAnims[sprite.data[0]].delay !== 0) {
    sAnims[sprite.data[0]].delay--;
  } else {
    if (sprite.data[2] === 0) {
      HandleStartAffineAnim(sprite);
      sprite.data[4] = 0; sprite.data[5] = 0; sprite.data[2] = 1;
    }
    if (sprite.data[5] === 0) {
      sprite.data[7] = Sin(sprite.data[4], 256);
      sprite.y2 = Sin(sprite.data[4], 16);
      sprite.data[6] = Sin(sprite.data[4], 32);
      HandleSetAffineData(sprite, 256 - sprite.data[6], 256 + sprite.data[7], 0);
      if (sprite.data[4] === 128) { sprite.data[4] = 0; sprite.data[5] = 1; }
    } else if (sprite.data[5] === 1) {
      sprite.data[7] = Sin(sprite.data[4], 32);
      sprite.y2 = -Sin(sprite.data[4], 8);
      sprite.data[6] = Sin(sprite.data[4], 128);
      HandleSetAffineData(sprite, 256 + sprite.data[6], 256 - sprite.data[7], 0);
      if (sprite.data[4] === 128) {
        if (sAnims[sprite.data[0]].runs > 1) {
          sAnims[sprite.data[0]].runs--;
          sAnims[sprite.data[0]].delay = 10;
          sprite.data[4] = 0; sprite.data[5] = 0;
        } else {
          HandleSetAffineData(sprite, 256, 256, 0);
          ResetSpriteAfterAnim(sprite);
          sprite.callback = WaitAnimEnd;
        }
      }
    }
    sprite.data[4] += sAnims[sprite.data[0]].rotation;
  }
}
function Anim_DeepVerticalSquishBounce(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].rotation = 4;
  DeepVerticalSquishBounce(sprite); sprite.callback = DeepVerticalSquishBounce;
}

// --- Sequences composees -----------------------------------------------------
function BackAndLunge_4(sprite: MonSprite): void {
  sprite.x2 += 2;
  if (sprite.x2 > 0) {
    sprite.x2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  }
}
function BackAndLunge_3(sprite: MonSprite): void {
  if (sprite.data[3] > 11) {
    sprite.data[2] -= 2;
    if (sprite.data[2] < 0) sprite.data[2] = 0;
    HandleSetAffineData(sprite, 256, 256, (sprite.data[2] << 8) & 0xFFFF);
    if (sprite.data[2] === 0) sprite.callback = BackAndLunge_4;
  } else {
    sprite.x2 += sprite.data[4];
    sprite.data[4] *= -1;
    sprite.data[3]++;
  }
}
function BackAndLunge_2(sprite: MonSprite): void {
  sprite.x2 -= sprite.data[7];
  sprite.data[7]++;
  const rotation = Math.floor(sprite.data[5] * 6 / sprite.data[6]);
  if (++sprite.data[5] > sprite.data[6]) sprite.data[5] = sprite.data[6];
  HandleSetAffineData(sprite, 256, 256, (rotation * 256) & 0xFFFF);
  if (sprite.x2 < -8) {
    sprite.x2 = -8;
    sprite.data[4] = 2;
    sprite.data[3] = 0;
    sprite.data[2] = rotation;
    sprite.callback = BackAndLunge_3;
  }
}
function BackAndLunge_1(sprite: MonSprite): void {
  sprite.x2 -= sprite.data[7];
  sprite.data[7]++;
  if (sprite.x2 <= 0) {
    let variable = sprite.data[7];
    sprite.data[6] = 0;
    let subResult = sprite.x2;
    do {
      subResult -= variable;
      sprite.data[6]++;
      variable++;
    } while (subResult > -8);
    sprite.data[5] = 1;
    sprite.callback = BackAndLunge_2;
  }
}
function BackAndLunge_0(sprite: MonSprite): void {
  if (++sprite.x2 > 7) {
    sprite.x2 = 8;
    sprite.data[7] = 2;
    sprite.callback = BackAndLunge_1;
  }
}
function Anim_BackAndLunge(sprite: MonSprite): void {
  HandleStartAffineAnim(sprite);
  sprite.callback = BackAndLunge_0;
}
function FrontFlip_2(sprite: MonSprite): void {
  sprite.x2++;
  sprite.y2--;
  if (sprite.x2 >= 0) {
    sprite.x2 = 0; sprite.y2 = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  }
}
function FrontFlip_1(sprite: MonSprite): void {
  sprite.data[2] += 16;
  if (sprite.x2 <= -16) {
    sprite.x2 = -16; sprite.y2 = 16;
    sprite.data[2] = 0;
    sprite.callback = FrontFlip_2;
  } else {
    sprite.x2 -= 2;
    sprite.y2 += 2;
  }
  HandleSetAffineData(sprite, 256, 256, (sprite.data[2] << 8) & 0xFFFF);
}
function FrontFlip_0(sprite: MonSprite): void {
  sprite.x2++;
  sprite.y2--;
  if (sprite.x2 > 15) {
    sprite.data[2] = 0;
    sprite.callback = FrontFlip_1;
  }
}
function Anim_FrontFlip(sprite: MonSprite): void {
  HandleStartAffineAnim(sprite);
  sprite.callback = FrontFlip_0;
}
function TumblingFrontFlip(sprite: MonSprite): void {
  if (sAnims[sprite.data[0]].delay !== 0) {
    sAnims[sprite.data[0]].delay--;
  } else {
    if (sprite.data[2] === 0) {
      sprite.data[2]++;
      HandleStartAffineAnim(sprite);
      sprite.data[7] = sAnims[sprite.data[0]].speed;
      sprite.data[3] = -1;
      sprite.data[4] = -1;
      sprite.data[5] = 0;
      sprite.data[6] = 0;
    }
    sprite.x2 += sprite.data[7] * 2 * sprite.data[3];
    sprite.y2 += sprite.data[7] * sprite.data[4];
    sprite.data[6] += 8;
    if (sprite.x2 <= -16 || sprite.x2 >= 16) {
      sprite.x2 = sprite.data[3] * 16;
      sprite.data[3] *= -1;
      sprite.data[5]++;
    } else if (sprite.y2 <= -16 || sprite.y2 >= 16) {
      sprite.y2 = sprite.data[4] * 16;
      sprite.data[4] *= -1;
      sprite.data[5]++;
    }
    if (sprite.data[5] > 5 && sprite.x2 <= 0) {
      sprite.x2 = 0; sprite.y2 = 0;
      if (sAnims[sprite.data[0]].runs > 1) {
        sAnims[sprite.data[0]].runs--;
        sprite.data[5] = 0;
        sprite.data[6] = 0;
        sAnims[sprite.data[0]].delay = 10;
      } else {
        ResetSpriteAfterAnim(sprite);
        sprite.callback = WaitAnimEnd;
      }
    }
    HandleSetAffineData(sprite, 256, 256, (sprite.data[6] << 8) & 0xFFFF);
  }
}
function Anim_TumblingFrontFlip_Twice(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].speed = 1; sAnims[id].runs = 2;
  TumblingFrontFlip(sprite); sprite.callback = TumblingFrontFlip;
}
function Figure8(sprite: MonSprite): void {
  sprite.data[6] += 4;
  sprite.x2 = -Sin(sprite.data[6], 16);
  sprite.y2 = -Sin((sprite.data[6] * 2) & 0xFF, 8);
  if (sprite.data[6] > 192 && sprite.data[7] === 1) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.data[7]++;
  } else if (sprite.data[6] > 64 && sprite.data[7] === 0) {
    HandleSetAffineData(sprite, -256, 256, 0);
    sprite.data[7]++;
  }
  if (sprite.data[6] > 255) {
    sprite.x2 = 0; sprite.y2 = 0;
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
  }
}
function Anim_Figure8(sprite: MonSprite): void {
  HandleStartAffineAnim(sprite);
  sprite.data[6] = 0;
  sprite.data[7] = 0;
  sprite.callback = Figure8;
}
function RotateUpSlamDown_2(sprite: MonSprite): void {
  sprite.data[7] += 2;
  sprite.x2 = sprite.data[6] + Cos(sprite.data[7], sprite.data[6]);
  sprite.y2 = -Sin(sprite.data[7], sprite.data[6]);
  HandleSetAffineData(sprite, 256, 256, ((sprite.data[7] - 128) << 8) & 0xFFFF);
  if (sprite.data[7] >= 128) {
    sprite.x2 = 0; sprite.y2 = 0;
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.data[2] = 0;
    ResetSpriteAfterAnim(sprite);
    sprite.callback = Anim_VerticalShakeFromSlam;
  }
}
function RotateUpSlamDown_1(sprite: MonSprite): void {
  if (sprite.data[3] === 20) {
    sprite.callback = RotateUpSlamDown_2;
    sprite.data[3] = 0;
  }
  sprite.data[3]++;
}
function RotateUpSlamDown_0(sprite: MonSprite): void {
  sprite.data[7]--;
  sprite.x2 = sprite.data[6] + Cos(sprite.data[7], sprite.data[6]);
  sprite.y2 = -Sin(sprite.data[7], sprite.data[6]);
  HandleSetAffineData(sprite, 256, 256, ((sprite.data[7] - 128) << 8) & 0xFFFF);
  if (sprite.data[7] <= 120) {
    sprite.data[7] = 120;
    sprite.data[3] = 0;
    sprite.callback = RotateUpSlamDown_1;
  }
}
function Anim_RotateUpSlamDown(sprite: MonSprite): void {
  HandleStartAffineAnim(sprite);
  const c2c = (sprite as { centerToCornerVecX?: number }).centerToCornerVecX ?? -32;
  sprite.data[6] = -Math.floor(14 * c2c / 10);
  sprite.data[7] = 128;
  sprite.callback = RotateUpSlamDown_0;
}
// 1:1 : RotateUpSlamDown_2 enchaine sur Anim_VerticalShake (decomp:234).
function Anim_VerticalShakeFromSlam(sprite: MonSprite): void {
  const fn = _animsByName['ANIM_V_SHAKE'];
  if (fn) { fn(sprite); }
  else sprite.callback = WaitAnimEnd;
}
function HorizontalJumpsVerticalStretch_2(sprite: MonSprite): void {
  const counter = sprite.data[2];
  if (counter > 128) {
    if (sAnims[sprite.data[0]].runs > 1) {
      sAnims[sprite.data[0]].runs--;
      sAnims[sprite.data[0]].delay = 10;
      sprite.data[3] = 0;
      sprite.data[2] = 0;
      sprite.data[4] = 0;
      sprite.callback = HorizontalJumpsVerticalStretch_0;
    } else {
      ResetSpriteAfterAnim(sprite);
      sprite.callback = WaitAnimEnd;
    }
    sprite.x2 = 0; sprite.y2 = 0;
  } else {
    const v = sAnims[sprite.data[0]].data;
    sprite.x2 = Math.floor(v * ((counter % 128) * 8) / 128) + 8 * -v;
    sprite.y2 = -Sin(counter % 128, 8);
  }
  sprite.data[2] += 12;
}
function HorizontalJumpsVerticalStretch_1(sprite: MonSprite): void {
  if (sprite.data[2] > 48) {
    HandleSetAffineData(sprite, 256, 256, 0);
    sprite.y2 = 0;
    sprite.data[2] = 0;
    sprite.callback = HorizontalJumpsVerticalStretch_2;
  } else {
    const yScale = Sin(sprite.data[4], 64) + 256;
    if (sprite.data[2] >= 16 && sprite.data[2] <= 31) {
      sprite.data[3] += 8;
      sprite.x2 -= sAnims[sprite.data[0]].data;
    }
    let yDelta = 0;
    if (yScale > 256) yDelta = Math.floor((256 - yScale) / 8);
    sprite.y2 = -Sin(sprite.data[3], 20) - yDelta;
    HandleSetAffineData(sprite, 256 - Sin(sprite.data[4], 32), yScale, 0);
    sprite.data[2]++;
    sprite.data[4] = (sprite.data[4] + 8) & 0xFF;
  }
}
function HorizontalJumpsVerticalStretch_0(sprite: MonSprite): void {
  if (sAnims[sprite.data[0]].delay !== 0) {
    sAnims[sprite.data[0]].delay--;
  } else {
    const counter = sprite.data[2];
    if (sprite.data[2] > 128) {
      sprite.data[2] = 0;
      sprite.callback = HorizontalJumpsVerticalStretch_1;
    } else {
      const v = 8 * sAnims[sprite.data[0]].data;
      sprite.x2 = Math.floor(v * (counter % 128) / 128);
      sprite.y2 = -Sin(counter % 128, 8);
      sprite.data[2] += 12;
    }
  }
}
function Anim_HorizontalJumpsVerticalStretch(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = -1;
  HandleStartAffineAnim(sprite);
  sprite.data[3] = 0;
  HorizontalJumpsVerticalStretch_0(sprite);
  sprite.callback = HorizontalJumpsVerticalStretch_0;
}
function Anim_HorizontalJumpsVerticalStretch_Twice(sprite: MonSprite): void {
  const id = sprite.data[0] = AddNewAnim();
  sAnims[id].data = 1; sAnims[id].runs = 2;
  HandleStartAffineAnim(sprite);
  sprite.data[3] = 0;
  HorizontalJumpsVerticalStretch_0(sprite);
  sprite.callback = HorizontalJumpsVerticalStretch_0;
}
function Anim_TipMoveForward(sprite: MonSprite): void {
  const counter = sprite.data[2];
  if (sprite.data[2] === 0) HandleStartAffineAnim(sprite);
  if (sprite.data[2] > 35) {
    HandleSetAffineData(sprite, 256, 256, 0);
    ResetSpriteAfterAnim(sprite);
    sprite.callback = WaitAnimEnd;
    sprite.x2 = 0;
  } else {
    const index = Math.floor((counter - 10) * 128 / 20);
    if (counter < 10) HandleSetAffineData(sprite, 256, 256, (Math.floor(counter / 2) * 512) & 0xFFFF);
    else if (counter <= 29) sprite.x2 = -Sin(index, 5);
    else HandleSetAffineData(sprite, 256, 256, (Math.floor((35 - counter) / 2) * 1024) & 0xFFFF);
  }
  sprite.data[2]++;
}
function Anim_FourPetal(sprite: MonSprite): void {
  if (sprite.data[2] === 0) {
    sprite.data[6] = 0;
    sprite.data[7] = 64;
    sprite.data[2]++;
  }
  sprite.data[7] += 8;
  if (sprite.data[6] === 4) {
    if (sprite.data[7] > 63) { sprite.data[7] = 0; sprite.data[6]++; }
  } else {
    if (sprite.data[7] > 127) { sprite.data[7] = 0; sprite.data[6]++; }
  }
  switch (sprite.data[6]) {
    case 1:
      sprite.x2 = -Cos(sprite.data[7], 8);
      sprite.y2 = Sin(sprite.data[7], 8) - 8;
      break;
    case 2:
      sprite.x2 = Sin(sprite.data[7] + 128, 8) + 8;
      sprite.y2 = -Cos(sprite.data[7], 8);
      break;
    case 3:
      sprite.x2 = Cos(sprite.data[7], 8);
      sprite.y2 = Sin(sprite.data[7] + 128, 8) + 8;
      break;
    case 0: case 4:
      sprite.x2 = Sin(sprite.data[7], 8) - 8;
      sprite.y2 = Cos(sprite.data[7], 8);
      break;
    default:
      sprite.x2 = 0; sprite.y2 = 0;
      sprite.callback = WaitAnimEnd;
      break;
  }
}

// --- Glow / flash / flicker (palette) ----------------------------------------
function Anim_GlowBlack(sprite: MonSprite): void { GlowColor(sprite, RGB_BLACK, 16, 1); }
function Anim_GlowBlue(sprite: MonSprite): void { GlowColor(sprite, RGB_BLUE, 12, 2); }
function Anim_GlowOrange(sprite: MonSprite): void { GlowColor(sprite, RGB_ORANGE_GLOW, 12, 2); }
function Anim_FlashYellow(sprite: MonSprite): void {
  if (++sprite.data[2] === 1) {
    sprite.data[7] = _objPlttOffset(sprite);
    sprite.data[6] = 0;
    sprite.data[5] = 0;
    sprite.data[4] = 0;
  }
  if (sYellowFlashData[sprite.data[6]][1] === 0xFF) {
    sprite.callback = WaitAnimEnd;
  } else {
    if (sprite.data[4] === 1) {
      if (sYellowFlashData[sprite.data[6]][0]) BlendPalette(sprite.data[7], 16, 16, RGB_YELLOW);
      else BlendPalette(sprite.data[7], 16, 0, RGB_YELLOW);
      sprite.data[4] = 0;
    }
    if (sYellowFlashData[sprite.data[6]][1] === sprite.data[5]) {
      sprite.data[4] = 1;
      sprite.data[5] = 0;
      sprite.data[6]++;
    } else {
      sprite.data[5]++;
    }
  }
}
function Anim_FlickerIncreasing(sprite: MonSprite): void {
  const sp = sprite as MonSprite & { invisible?: boolean };
  if (sp.data[2] === 0) sp.data[7] = 0;
  if (sp.data[2] === sp.data[7]) {
    sp.data[7] = 0;
    sp.data[2]++;
    sp.invisible = false;
  } else {
    sp.data[7]++;
    sp.invisible = true;
  }
  if (sp.data[2] > 10) {
    sp.invisible = false;
    sp.callback = WaitAnimEnd;
  }
}

// ─── Table par NOM (pokemon-anims.json donne les noms ANIM_*) ──────────────
const _animsByName: Record<string, (s: MonSprite) => void> = {
  ANIM_V_SQUISH_AND_BOUNCE: Anim_VerticalSquishBounce,
  ANIM_V_SQUISH_AND_BOUNCE_SLOW: Anim_VerticalSquishBounce_Slow,
  ANIM_V_SHAKE: Anim_VerticalShake,
  ANIM_H_SHAKE: Anim_HorizontalShake,
  ANIM_GROW_VIBRATE: Anim_GrowVibrate,
  ANIM_V_STRETCH: Anim_VerticalStretch,
  // Vague 2 (56 anims, goal T2 << importe-les tous >>) :
  ANIM_SWING_CONCAVE: Anim_SwingConcave,
  ANIM_SWING_CONCAVE_FAST: Anim_SwingConcave_Fast,
  ANIM_SWING_CONCAVE_FAST_SHORT: Anim_SwingConcave_FastShort,
  ANIM_SWING_CONVEX: Anim_SwingConvex,
  ANIM_SWING_CONVEX_FAST: Anim_SwingConvex_Fast,
  ANIM_V_JUMPS_SMALL: Anim_VerticalJumps_Small,
  ANIM_V_JUMPS_BIG: Anim_VerticalJumps_Big,
  ANIM_V_JUMPS_H_JUMPS: Anim_VerticalJumpsHorizontalJumps,
  ANIM_H_JUMPS: Anim_HorizontalJumps,
  ANIM_H_JUMPS_V_STRETCH: Anim_HorizontalJumpsVerticalStretch,
  ANIM_H_JUMPS_V_STRETCH_TWICE: Anim_HorizontalJumpsVerticalStretch_Twice,
  ANIM_V_SLIDE: Anim_VerticalSlide,
  ANIM_V_SLIDE_SLOW: Anim_VerticalSlide_Slow,
  ANIM_H_SLIDE: Anim_HorizontalSlide,
  ANIM_H_SLIDE_SLOW: Anim_HorizontalSlide_Slow,
  ANIM_V_SLIDE_WOBBLE: Anim_VerticalSlideWobble,
  ANIM_V_SLIDE_WOBBLE_SMALL: Anim_VerticalSlideWobble_Small,
  ANIM_H_SLIDE_WOBBLE: Anim_HorizontalSlideWobble,
  ANIM_BOUNCE_ROTATE_TO_SIDES: Anim_BounceRotateToSides,
  ANIM_BOUNCE_ROTATE_TO_SIDES_SLOW: Anim_BounceRotateToSides_Slow,
  ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL: Anim_BounceRotateToSides_Small,
  ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL_SLOW: Anim_BounceRotateToSides_SmallSlow,
  ANIM_V_SHAKE_TWICE: Anim_VerticalShakeTwice,
  ANIM_H_SHAKE_SLOW: Anim_HorizontalShake_Slow,
  ANIM_H_VIBRATE: Anim_HorizontalVibrate,
  ANIM_CIRCULAR_VIBRATE: Anim_CircularVibrate,
  ANIM_H_STRETCH: Anim_HorizontalStretch,
  ANIM_CIRCULAR_STRETCH_TWICE: Anim_CircularStretchTwice,
  ANIM_SHRINK_GROW: Anim_ShrinkGrow,
  ANIM_GROW_IN_STAGES: Anim_GrowInStages,
  ANIM_LUNGE_GROW: Anim_LungeGrow,
  ANIM_CIRCLE_INTO_BG: Anim_CircleIntoBackground,
  ANIM_DEEP_V_SQUISH_AND_BOUNCE: Anim_DeepVerticalSquishBounce,
  ANIM_TWIST: Anim_Twist,
  ANIM_TWIST_TWICE: Anim_Twist_Twice,
  ANIM_SPIN: Anim_Spin,
  ANIM_CIRCLE_C_CLOCKWISE_SLOW: Anim_CircleCounterclockwise_Slow,
  ANIM_ROTATE_TO_SIDES_TWICE: Anim_RotateToSides_Twice,
  ANIM_ROTATE_UP_TO_SIDES: Anim_RotateUpToSides,
  ANIM_ROTATE_UP_SLAM_DOWN: Anim_RotateUpSlamDown,
  ANIM_RISING_WOBBLE: Anim_RisingWobble,
  ANIM_H_PIVOT: Anim_HorizontalPivot,
  ANIM_ZIGZAG_FAST: Anim_ZigzagFast,
  ANIM_ZIGZAG_SLOW: Anim_ZigzagSlow,
  ANIM_RAPID_H_HOPS: Anim_RapidHorizontalHops,
  ANIM_BACK_AND_LUNGE: Anim_BackAndLunge,
  ANIM_FRONT_FLIP: Anim_FrontFlip,
  ANIM_TUMBLING_FRONT_FLIP_TWICE: Anim_TumblingFrontFlip_Twice,
  ANIM_FIGURE_8: Anim_Figure8,
  ANIM_TIP_MOVE_FORWARD: Anim_TipMoveForward,
  ANIM_FOUR_PETAL: Anim_FourPetal,
  ANIM_GLOW_BLACK: Anim_GlowBlack,
  ANIM_GLOW_BLUE: Anim_GlowBlue,
  ANIM_GLOW_ORANGE: Anim_GlowOrange,
  ANIM_FLASH_YELLOW: Anim_FlashYellow,
  ANIM_FLICKER_INCREASING: Anim_FlickerIncreasing,
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
  const sprite = rt?.gSprites?.[spriteId] as unknown as MonSprite | undefined;
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

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATION DoMonFrontSpriteAnimation + table espèce→anim + Stop/Reset
// (anciennement src/engine/pokemon/pokemon-animation.ts, fusionné ici — la
// décomp n'a qu'UN fichier pokemon_animation.c). DoMonFrontSpriteAnimation est
// en réalité dans pokemon.c:6779 mais c'est l'entrée consommateur de l'anim de
// front, donc on la garde avec le moteur. Le moteur d'anim utilisé = celui de
// CE fichier (chemin OAM réel battle_anim_mons), pas un 2e chemin affine.
//
// Consommateurs (via decomp-globals re-export) : Birch/intro (pokeball arc end),
// évo/Pokédex, main_menu (Stop/Reset cleanup). battle_main passe par
// __pokemonAnimation.LaunchAnimationTaskForFrontSprite (inchangé).
// ═══════════════════════════════════════════════════════════════════════════

// ─── ANIM_* numeric constants (1:1 include/pokemon_animation.h) ──────────────
// Utilisés pour le pont id-numérique → nom ANIM_* (override DoMonFront) vers le
// registre string-keyed _animsByName ci-dessus.
export const ANIM_V_SQUISH_AND_BOUNCE = 0;
export const ANIM_CIRCULAR_STRETCH_TWICE = 1;
export const ANIM_H_VIBRATE = 2;
export const ANIM_H_SLIDE = 3;
export const ANIM_V_SLIDE = 4;
export const ANIM_BOUNCE_ROTATE_TO_SIDES = 5;
export const ANIM_V_JUMPS_H_JUMPS = 6;
export const ANIM_GROW_VIBRATE = 9;
export const ANIM_H_SHAKE = 15;
export const ANIM_V_SHAKE = 16;
export const ANIM_TWIST = 18;
export const ANIM_SHRINK_GROW = 19;
export const ANIM_H_STRETCH = 22;
export const ANIM_V_STRETCH = 23;
export const ANIM_V_SHAKE_TWICE = 25;
export const ANIM_V_JUMPS_BIG = 30;
export const ANIM_V_SQUISH_AND_BOUNCE_SLOW = 69;
export const ANIM_H_SLIDE_SLOW = 70;
export const ANIM_V_SLIDE_SLOW = 71;
export const ANIM_V_JUMPS_SMALL = 82;

const ANIM_NAME_TO_ID: Readonly<Record<string, number>> = {
  ANIM_V_SQUISH_AND_BOUNCE, ANIM_CIRCULAR_STRETCH_TWICE, ANIM_H_VIBRATE,
  ANIM_H_SLIDE, ANIM_V_SLIDE, ANIM_BOUNCE_ROTATE_TO_SIDES, ANIM_V_JUMPS_H_JUMPS,
  ANIM_GROW_VIBRATE, ANIM_H_SHAKE, ANIM_V_SHAKE, ANIM_TWIST, ANIM_SHRINK_GROW,
  ANIM_H_STRETCH, ANIM_V_STRETCH, ANIM_V_SHAKE_TWICE, ANIM_V_JUMPS_BIG,
  ANIM_V_SQUISH_AND_BOUNCE_SLOW, ANIM_H_SLIDE_SLOW, ANIM_V_SLIDE_SLOW,
  ANIM_V_JUMPS_SMALL,
};
/** Inverse id→nom (pour l'override numérique de DoMonFront). */
const ANIM_ID_TO_NAME: Readonly<Record<number, string>> = Object.fromEntries(
  Object.entries(ANIM_NAME_TO_ID).map(([name, id]) => [id, name]),
);

// ─── Table espèce → nom ANIM_* (1:1 décomp sMonFrontAnimIdsTable, pokemon.c) ──
// Hydratée depuis le fichier extrait (387 espèces). On stocke directement le
// NOM ANIM_* (pas l'id) pour router vers le registre string `_animsByName` de ce
// fichier → Birch/Pokédex bénéficient de TOUS les anims portés (pas juste 2).
const _sMonFrontAnimNames = new Map<number, string>([
  [295 /* SPECIES_LOTAD */, 'ANIM_V_SQUISH_AND_BOUNCE'],
  [296 /* SPECIES_LOMBRE */, 'ANIM_V_SQUISH_AND_BOUNCE'],
  [297 /* SPECIES_LUDICOLO */, 'ANIM_V_SQUISH_AND_BOUNCE'],
]);

/** Bridge du fichier extrait (SPECIES_X / ANIM_Y string) → Map espèce→nom.
 *  Fire-and-forget au module load (1ère utilisation arrive après le boot). */
async function _hydrateMonFrontAnimNames(): Promise<void> {
  try {
    const [tablesMod, speciesMod] = await Promise.all([
      import('./engine/decomp-data/src/mon-anim-tables-data'),
      import('../include/constants/species'),
    ]);
    const speciesNameToId = speciesMod as unknown as Record<string, number>;
    for (const [speciesName, animName] of tablesMod.RAW_MON_FRONT_ANIM_IDS) {
      const speciesId = speciesNameToId[speciesName];
      if (typeof speciesId === 'number' && typeof animName === 'string') {
        _sMonFrontAnimNames.set(speciesId, animName);
      }
    }
    if (tablesMod.RAW_MON_FRONT_ANIM_IDS.length > 0) {
      console.log(`[pokemon_animation] hydrated ${tablesMod.RAW_MON_FRONT_ANIM_IDS.length} species → front anim names`);
    }
  } catch {
    // Fichier extrait absent/malformé → fallback Map minimale (triplet Lotad).
  }
}
void _hydrateMonFrontAnimNames();

/** Nom ANIM_* pour une espèce (défaut ANIM_V_SQUISH_AND_BOUNCE). */
function getMonFrontAnimName(species: number): string {
  return _sMonFrontAnimNames.get(species) ?? 'ANIM_V_SQUISH_AND_BOUNCE';
}

// ─── Sentinelles callback (1:1 décomp src/sprite.c) ─────────────────────────
export function SpriteCallbackDummy(_sprite: DecompSprite, _rt: DecompRuntime): void { /* no-op */ }
export function SpriteCallbackDummy_2(_sprite: DecompSprite, _rt: DecompRuntime): void { /* no-op */ }

/** 1:1 décomp src/pokemon.c HasTwoFramesAnimation (sMonHasTwoFramesAnimationTable).
 *  Stub : la plupart des Gen 3 ont 2 frames → défaut TRUE (1:1 fallback sûr). */
export function HasTwoFramesAnimation(_species: number): boolean {
  return true;
}

const SKIP_FRONT_ANIM = 0x80;

/** Tiles par frame d'anim front pic, dérivé de l'OAM shape/size (mon = 64×64). */
function _tilesPerMonPicFrame(shape: number, size: number): number {
  const SQUARE: ReadonlyArray<[number, number]> = [[8, 8], [16, 16], [32, 32], [64, 64]];
  const H_RECT: ReadonlyArray<[number, number]> = [[16, 8], [32, 8], [32, 16], [64, 32]];
  const V_RECT: ReadonlyArray<[number, number]> = [[8, 16], [8, 32], [16, 32], [32, 64]];
  const table = shape === 0 ? SQUARE : shape === 1 ? H_RECT : V_RECT;
  const [w, h] = table[size & 3] ?? [8, 8];
  return (w / 8) * (h / 8);
}

/** 1:1 décomp `DoMonFrontSpriteAnimation` (pokemon.c:6779) : cry + pan,
 *  StartSpriteAnim(sprite,1) si 2-frame, puis lance l'idle anim (= le mon
 *  « respire » à l'apparition). panMode 0=-25, 1=+25, 2+=0 ; bit 7 (SKIP) skippe
 *  l'anim. Câblé Birch (decomp-globals), évo, Pokédex.
 *
 *  Le launch interne route vers le registre string `_animsByName` (moteur OAM
 *  réel battle_anim_mons de CE fichier) via le nom ANIM_* de l'espèce. */
export function DoMonFrontSpriteAnimation(
  rt: DecompRuntime,
  sprite: DecompSprite,
  species: number,
  noCry: boolean,
  panModeAnimFlag: number,
  playCryFn: (species: number, pan: number) => void,
  /** Override numérique (sentinelle -1 = lookup par espèce). */
  frontAnimIdOverride: number = -1,
): void {
  const skipAnim = !!(panModeAnimFlag & SKIP_FRONT_ANIM);
  const panMode = panModeAnimFlag & ~SKIP_FRONT_ANIM;
  const pan = panMode === 0 ? -25 : panMode === 1 ? 25 : 0;

  if (skipAnim) {
    if (!noCry) playCryFn(species, pan);
    sprite.callback = SpriteCallbackDummy;
    return;
  }

  if (!noCry) {
    playCryFn(species, pan);
    if (HasTwoFramesAnimation(species)) {
      // 1:1 StartSpriteAnim(sprite, 1) + write oam.tileId direct (sprites créés
      // via CreateSpriteAtOam où StartSpriteAnim no-op).
      rt.StartSpriteAnim(sprite.spriteId, 1);
      const tilesPerFrame = _tilesPerMonPicFrame(sprite.shape, sprite.size);
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.tileId = (sprite.tileBase || 0) + tilesPerFrame;
      // Marque le sprite pour le retour frame BASE en fin d'anim (cf. WaitAnimEnd,
      // fix session 96). Le flag distingue le chemin DoMonFront (Birch/non-combat,
      // switch 2-frame fait) du chemin Launch direct (combat, pas de switch).
      (sprite as DecompSprite & { _monFrontBaseFrameReset?: boolean })._monFrontBaseFrameReset = true;
    }
  }

  // 1:1 pokemon.c:6820 — frontAnimId via sMonFrontAnimIdsTable[species-1].
  // Override numérique → nom via ANIM_ID_TO_NAME ; sinon nom direct par espèce.
  const animName = frontAnimIdOverride >= 0
    ? (ANIM_ID_TO_NAME[frontAnimIdOverride] ?? 'ANIM_V_SQUISH_AND_BOUNCE')
    : getMonFrontAnimName(species);

  // Route vers le moteur de CE fichier (LaunchAnimationTaskForFrontSprite ci-dessus,
  // signature spriteId+nom). Le décomp pose ensuite callback=SpriteCallbackDummy_2 ;
  // notre Launch pose directement le callback de l'anim (= != SpriteCallbackDummy,
  // les waiters passent toujours).
  LaunchAnimationTaskForFrontSprite(sprite.spriteId, animName);
}

/** Stoppe l'idle anim d'un sprite (= DESTROY/sortie de scène). 1:1 pattern :
 *  sprite.callback = SpriteCallbackDummy. */
export function StopMonFrontSpriteAnimation(rt: DecompRuntime, spriteId: number): void {
  const sprite = rt.gSprites[spriteId];
  if (sprite) sprite.callback = SpriteCallbackDummy;
}

/** Reset toutes les anims mon (= transitions de scène). #1 ne tient pas de Map
 *  d'anims actives (l'état vit dans sprite.data + sprite.callback) → no-op. */
export function ResetAllMonAnimations(): void {
  /* no-op : pas de registre runtime d'anims en cours dans cette impl. */
}

/**
 * game/battle_anim_mons.ts — Port MIROIR 1:1 de `battle_anim_mons.c`.
 *
 * Source de verite : `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mons.c`
 *
 * ⚠️ Port PARTIEL (battle_anim_mons.c = 2500+ l.). Cette premiere tranche = les
 * primitives de TRANSLATION d'arc/lineaire, PURES (n'operent que sur le sprite +
 * Sin), prerequis du port send-out (pokeball.c : InitAnimArcTranslation +
 * TranslateAnimHorizontalArc + AnimTranslateLinear). Les tranches suivantes y
 * ajouteront GetBattlerSpriteCoord + sBattlerCoords + le reste, dans l'ordre du
 * fichier decomp.
 *
 * Fonctions portees (tranche 1) :
 *   - InitAnimLinearTranslation (1065-1091)
 *   - InitAnimArcTranslation (785-792)
 *   - AnimTranslateLinear (1111-1139)
 *   - TranslateAnimHorizontalArc (794-801)
 *   - TranslateAnimVerticalArc (803-810)
 *   - SetSpritePrimaryCoordsFromSecondaryCoords (812-817)
 *
 * Dette (non portees ici, pas requises par le send-out) :
 *   - StartAnimLinearTranslation / AnimTranslateLinear_WithFollowup (1093/1141) :
 *     dependent de SetCallbackToStoredInData6 (callback stocke en data[6]/data[7]
 *     comme une ADRESSE — non transposable trivialement a nos callbacks-objets).
 *
 * Adaptation HW-emu :
 *   - La decomp s'appuie sur les types `s16 data[]` / `u16` locaux pour le
 *     wraparound 16-bit implicite. Notre `DecompSprite.data` est `number[]` (non
 *     borne) → on reproduit le wraparound EXPLICITEMENT : `& 0xFFFF` a l'ecriture
 *     des deltas u16 (data[1]/data[2]/data[3]/data[4]/data[6]/data[7]) et a la
 *     lecture, `toS16()` la ou la decomp lit un `s16` (data[2]-data[1], data[5]).
 *     Les valeurs restent identiques bit-a-bit a la decomp.
 */

import type { DecompSprite } from '../engine/system/decomp-runtime';
import { Sin } from './trig';

/** Reinterprete les 16 bits bas de `v` en s16 signe (= cast (s16) decomp). */
function toS16(v: number): number {
  return (v << 16) >> 16;
}

/** 1:1 decomp battle_anim_mons.c:1065 `void InitAnimLinearTranslation(struct Sprite *sprite)`.
 *  Pre-condition : data[0]=nbFrames, data[1]=startX, data[2]=destX, data[3]=startY,
 *  data[4]=destY. Post : data[1]=xDelta(u16), data[2]=yDelta(u16), data[3]=data[4]=0.
 *  Bit 0 de chaque delta encode le SIGNE (movingLeft/movingUp). */
export function InitAnimLinearTranslation(sprite: DecompSprite): void {
  const d = sprite.data;
  const x = toS16(d[2]) - toS16(d[1]);   // int x = data[2] - data[1];
  const y = toS16(d[4]) - toS16(d[3]);   // int y = data[4] - data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = (Math.abs(x) << 8) & 0xFFFF;   // u16 xDelta = abs(x) << 8;
  let yDelta = (Math.abs(y) << 8) & 0xFFFF;   // u16 yDelta = abs(y) << 8;
  xDelta = Math.floor(xDelta / d[0]) & 0xFFFF;   // xDelta /= data[0];
  yDelta = Math.floor(yDelta / d[0]) & 0xFFFF;   // yDelta /= data[0];
  if (movingLeft) xDelta |= 1; else xDelta &= ~1;
  if (movingUp) yDelta |= 1; else yDelta &= ~1;
  d[1] = xDelta & 0xFFFF;
  d[2] = yDelta & 0xFFFF;
  d[4] = 0;
  d[3] = 0;
}

/** 1:1 decomp battle_anim_mons.c:785 `void InitAnimArcTranslation(struct Sprite *sprite)`.
 *  Capture x/y courants comme depart, calcule les deltas lineaires, puis prepare
 *  l'increment de phase sinus data[6]=0x8000/nbFrames pour la bosse d'arc. */
export function InitAnimArcTranslation(sprite: DecompSprite): void {
  const d = sprite.data;
  d[1] = sprite.x;   // sprite->data[1] = sprite->x;
  d[3] = sprite.y;   // sprite->data[3] = sprite->y;
  InitAnimLinearTranslation(sprite);
  d[6] = Math.floor(0x8000 / d[0]) & 0xFFFF;   // data[6] = 0x8000 / data[0];
  d[7] = 0;
}

/** 1:1 decomp battle_anim_mons.c:1111 `bool8 AnimTranslateLinear(struct Sprite *sprite)`.
 *  Avance la translation lineaire d'un pas : pose x2/y2, decremente data[0].
 *  Retourne TRUE quand data[0]==0 (translation terminee). */
export function AnimTranslateLinear(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (!d[0]) return true;            // if (!sprite->data[0]) return TRUE;
  const v1 = d[1] & 0xFFFF;          // u16 v1 = data[1];
  const v2 = d[2] & 0xFFFF;          // u16 v2 = data[2];
  let x = d[3] & 0xFFFF;             // u16 x = data[3];
  let y = d[4] & 0xFFFF;             // u16 y = data[4];
  x = (x + v1) & 0xFFFF;             // x += v1;
  y = (y + v2) & 0xFFFF;             // y += v2;
  sprite.x2 = (v1 & 1) ? -(x >> 8) : (x >> 8);
  sprite.y2 = (v2 & 1) ? -(y >> 8) : (y >> 8);
  d[3] = x;                          // sprite->data[3] = x;
  d[4] = y;                          // sprite->data[4] = y;
  d[0]--;                            // sprite->data[0]--;
  return false;
}

/** 1:1 decomp battle_anim_mons.c:794 `bool8 TranslateAnimHorizontalArc(struct Sprite *sprite)`.
 *  Translation lineaire + bosse sinusoidale ajoutee a y2 (arc "horizontal" : la
 *  trajectoire monte/descend en cloche pendant le deplacement X). */
export function TranslateAnimHorizontalArc(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (AnimTranslateLinear(sprite)) return true;
  d[7] = (d[7] + d[6]) & 0xFFFF;     // sprite->data[7] += sprite->data[6];
  sprite.y2 += Sin((d[7] >> 8) & 0xFF, toS16(d[5]));   // y2 += Sin((u8)(data[7] >> 8), data[5]);
  return false;
}

/** 1:1 decomp battle_anim_mons.c:803 `bool8 TranslateAnimVerticalArc(struct Sprite *sprite)`.
 *  Translation lineaire + bosse sinusoidale ajoutee a x2. */
export function TranslateAnimVerticalArc(sprite: DecompSprite): boolean {
  const d = sprite.data;
  if (AnimTranslateLinear(sprite)) return true;
  d[7] = (d[7] + d[6]) & 0xFFFF;     // sprite->data[7] += sprite->data[6];
  sprite.x2 += Sin((d[7] >> 8) & 0xFF, toS16(d[5]));   // x2 += Sin((u8)(data[7] >> 8), data[5]);
  return false;
}

/** 1:1 decomp battle_anim_mons.c:812 `void SetSpritePrimaryCoordsFromSecondaryCoords(struct Sprite *sprite)`.
 *  Integre x2/y2 dans x/y (fige la position courante de l'arc) puis remet x2/y2 a 0. */
export function SetSpritePrimaryCoordsFromSecondaryCoords(sprite: DecompSprite): void {
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
}

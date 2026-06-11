/**
 * battle_anim_dragon.ts — miroir PARTIEL de `src/battle_anim_dragon.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Porté 1:1 :
 *   - AnimOutrageFlame (:191) — gOutrageFlameSpriteTemplate (Outrage).
 *   - StartDragonFireTranslation (:218) — helper statique commun Breath/Rage.
 *   - AnimDragonRageFirePlume (:246) — gDragonRageFirePlumeSpriteTemplate.
 *   - AnimDragonFireToTarget (:268) — gDragonBreathFireSpriteTemplate +
 *     gDragonRageFireSpitSpriteTemplate (Draco-Souffle / Draco-Rage).
 *   - AnimDragonDanceOrb (+_Step :276/:298) — gDragonDanceOrbSpriteTemplate.
 *
 * Skips propres : AnimTask_DragonDanceWaver(+Step+UpdateDragonDanceScanlineEffect)
 * = effet scanline (gScanlineEffectRegBuffers/DMA BG HOFS) ; AnimOverheatFlame
 * (+_Step) = hors lot, DÉJÀ porté 1:1 dans battle_anim_fire.ts (:479) — NE PAS
 * re-porter ici (double registration).
 *
 * Dettes douces : GetBattlerSpriteCoordAttr(HEIGHT/WIDTH) approximé par la
 * frame mon 64x64 documentée (rayon orbe = 32, même approx que
 * battle_anim_fight.ts:48) ; le C lit gBattlerAttacker (≡ attaquant d'anim
 * pendant un move).
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord, SetSpriteCoordsToAnimAttackerCoords, SetAnimSpriteInitialXOffset,
  StartAnimLinearTranslation, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  DestroySpriteAndMatrix, TranslateSpriteLinearAndFlicker,
} from './battle_anim_mons';
import { Sin, Cos } from './trig';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _vItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _startSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}
function _startSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n; spF.affineAnimBeginning = true; spF.affineAnimEnded = false;
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735) — transcrit
 *  localement (pas encore exporté par battle_anim_mons.ts) : attend animEnded
 *  puis enchaîne sur le callback stocké en data6. */
function _RunStoredCallbackWhenAnimEnds(sprite: _VSprite): void {
  if ((sprite as { animEnded?: boolean }).animEnded) SetCallbackToStoredInData6(sprite as never);
}
/** Filet local (précédent battle_anim_effects_3.ts) : si la table `anims` n'a
 *  pas été posée par Cmd_createsprite, animEnded n'arrivera jamais → compte la
 *  durée 1:1 de sAnim_DragonRageFirePlume (5 frames × 5 ticks = 25) et enchaîne. */
function _PlumeNoAnimFallback(sprite: _VSprite): void {
  if (++sprite.data[7] >= 25) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `AnimOutrageFlame` (battle_anim_dragon.c:191) : flamme au centre de
 *  l'attaquant qui dérive (vélocités 8.8 fixed-point, négées côté ennemi) en
 *  clignotant tous les data[5] frames (TranslateSpriteLinearAndFlicker), puis
 *  destroy. args [x, y, durée, xVel(8.8), yVel(8.8), flickerPériode]. */
function AnimOutrageFlame(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 30, 1280, 0, 3];
  const atk = _vItf().getAttacker?.() ?? 0;
  let xVelocity = args[3] | 0;
  let yVelocity = args[4] | 0;
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* BATTLER_COORD_X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* BATTLER_COORD_Y_PIC_OFFSET */);
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) {
    sprite.x -= args[0] | 0;
    xVelocity = -xVelocity;
    yVelocity = -yVelocity;
  } else {
    sprite.x += args[0] | 0;
  }
  sprite.y += args[1] | 0;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = xVelocity;
  sprite.data[3] = yVelocity;
  sprite.data[5] = args[5] | 0;
  sprite.invisible = true; // 1:1 : démarre invisible, le flicker (data[0] % data[5]) la révèle
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = TranslateSpriteLinearAndFlicker;
}

/** 1:1 `StartDragonFireTranslation` (battle_anim_dragon.c:218) : départ centre
 *  attaquant (X_2/Y_PIC_OFFSET), translation linéaire vers le centre cible,
 *  destroy à l'arrivée. args [initialX, initialY, targetX, targetY, durée].
 *  NOTE décomp authentique : côté ennemi `sprite->x -= cmd->initialY`
 *  (initialY, PAS initialX — transcrit tel quel) ; anim 1 (frames flippées)
 *  seulement côté joueur. */
function StartDragonFireTranslation(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 20];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* BATTLER_COORD_X_2 */);
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3 /* BATTLER_COORD_Y_PIC_OFFSET */);
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) {
    sprite.x -= args[1] | 0; // sic décomp : initialY
    sprite.y += args[1] | 0;
    sprite.data[2] -= args[2] | 0;
    sprite.data[4] += args[3] | 0;
  } else {
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[2] += args[2] | 0;
    sprite.data[4] += args[3] | 0;
    _startSpriteAnim(sprite, 1);
  }
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
}

/** 1:1 `AnimDragonRageFirePlume` (battle_anim_dragon.c:246) : panache de feu
 *  posé sur l'attaquant (args[0]==ANIM_ATTACKER) ou la cible, offset X miroir
 *  attaquant→cible (SetAnimSpriteInitialXOffset), joue son anim (5 frames × 5
 *  ticks, ANIMCMD_END) puis destroy. args [relativeTo, x, y]. */
function AnimDragonRageFirePlume(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [1, 5, 0];
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    const atk = _vItf().getAttacker?.() ?? 0;
    sprite.x = GetBattlerSpriteCoord(atk, 0 /* BATTLER_COORD_X */);
    sprite.y = GetBattlerSpriteCoord(atk, 1 /* BATTLER_COORD_Y */);
  } else {
    const tgt = _vItf().getTarget?.() ?? 1;
    sprite.x = GetBattlerSpriteCoord(tgt, 0 /* BATTLER_COORD_X */);
    sprite.y = GetBattlerSpriteCoord(tgt, 1 /* BATTLER_COORD_Y */);
  }
  SetAnimSpriteInitialXOffset(sprite, args[1] | 0);
  sprite.y += args[2] | 0;
  sprite.invisible = false;
  sprite.data[7] = 0;
  sprite.callback = (sprite as { anims?: unknown }).anims ? _RunStoredCallbackWhenAnimEnds : _PlumeNoAnimFallback;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
}

/** 1:1 `AnimDragonFireToTarget` (battle_anim_dragon.c:268) : Draco-Souffle et
 *  Draco-Rage — la flamme part en affine anim 1 (rotation 0 au lieu de 127)
 *  côté ennemi, puis translation attaquant→cible (StartDragonFireTranslation). */
function AnimDragonFireToTarget(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) _startSpriteAffineAnim(sprite, 1);
  StartDragonFireTranslation(sprite);
}

/** 1:1 `AnimDragonDanceOrb` (battle_anim_dragon.c:276) : orbe de Danse-Draco
 *  en orbite autour du centre attaquant. Rayon initial = max(hauteur,largeur)/2
 *  du battler — GetBattlerSpriteCoordAttr approximé par la frame 64x64
 *  documentée → 32 (dette douce, même approx que battle_anim_fight.ts).
 *  args [angle 0..255] (scripts : (256*n)/360 ∈ {0,43,85,128,170,213}). */
function AnimDragonDanceOrb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const atk = _vItf().getAttacker?.() ?? 0; // décomp : gBattlerAttacker (≡ attaquant d'anim pendant le move)
  sprite.x = GetBattlerSpriteCoord(atk, 2 /* BATTLER_COORD_X_2 */);
  sprite.y = GetBattlerSpriteCoord(atk, 3 /* BATTLER_COORD_Y_PIC_OFFSET */);
  sprite.data[4] = 0;
  sprite.data[5] = 1;
  sprite.data[6] = (args[0] | 0) & 0xFF; // garde-fou table trig (no-op pour les angles script 0..213)
  sprite.data[7] = 32; // max(64,64)/2 — approx GetBattlerSpriteCoordAttr(HEIGHT/WIDTH)
  sprite.x2 = Cos(sprite.data[6], sprite.data[7]);
  sprite.y2 = Sin(sprite.data[6], sprite.data[7]);
  sprite.invisible = false;
  sprite.callback = AnimDragonDanceOrb_Step;
}
/** 1:1 `AnimDragonDanceOrb_Step` (battle_anim_dragon.c:298) : phase 0 — orbite
 *  60 frames, vitesse angulaire data[5] 1→16 (par paliers de 6 frames) ; phase
 *  1 — spirale vers l'extérieur (rayon +8/frame, clampé 0x96) 21 frames puis
 *  destroy. */
function AnimDragonDanceOrb_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[6] = (sprite.data[6] - sprite.data[5]) & 0xFF;
      sprite.x2 = Cos(sprite.data[6], sprite.data[7]);
      sprite.y2 = Sin(sprite.data[6], sprite.data[7]);
      if (++sprite.data[4] > 5) {
        sprite.data[4] = 0;
        if (sprite.data[5] <= 15) { // && C court-circuité : n'incrémente que si <= 15
          ++sprite.data[5];
          if (sprite.data[5] > 15) sprite.data[5] = 16;
        }
      }
      if (++sprite.data[3] > 0x3C) {
        sprite.data[3] = 0;
        sprite.data[0]++;
      }
      break;
    case 1:
      sprite.data[6] = (sprite.data[6] - sprite.data[5]) & 0xFF;
      if (sprite.data[7] <= 0x95) { // && C court-circuité : n'ajoute 8 que si <= 0x95
        sprite.data[7] += 8;
        if (sprite.data[7] > 0x95) sprite.data[7] = 0x96;
      }
      sprite.x2 = Cos(sprite.data[6], sprite.data[7]);
      sprite.y2 = Sin(sprite.data[6], sprite.data[7]);
      if (++sprite.data[4] > 5) {
        sprite.data[4] = 0;
        if (sprite.data[5] <= 15) {
          ++sprite.data[5];
          if (sprite.data[5] > 15) sprite.data[5] = 16;
        }
      }
      if (++sprite.data[3] > 20) _vItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

registerAnimCallbacks({
  AnimOutrageFlame: AnimOutrageFlame as never,
  AnimDragonFireToTarget: AnimDragonFireToTarget as never,
  AnimDragonRageFirePlume: AnimDragonRageFirePlume as never,
  AnimDragonDanceOrb: AnimDragonDanceOrb as never,
});

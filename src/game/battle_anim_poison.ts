/**
 * battle_anim_poison.ts — miroir PARTIEL de `src/battle_anim_poison.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Porté 1:1 :
 *   - AnimSludgeProjectile (+_Step) (:180) — Sludge/Sludge Bomb : arc atk→cible.
 *   - AnimAcidPoisonBubble (+_Step) (:203) — Acid : arc vers position moyenne cible.
 *   - AnimSludgeBombHitParticle (+_Step) (:231) — éclats décélérés fixed-point.
 *   - AnimAcidPoisonDroplet (:258) — goutte qui tombe (translation linéaire).
 *   - InitPoisonGasCloudAnim + MovePoisonGasCloud (battle_anim_ice.c:1194/:1241 —
 *     le template gPoisonGasCloudSpriteTemplate vit dans battle_anim_ice.c.c mais c'est l'anim
 *     de POISON_GAS) : 3 états data[7]&0xFF (vol vers cible / orbite / sortie écran).
 *
 * Dettes douces : AnimBubbleEffect (+_Step) hors lot (after-effect bulles
 * poison/bubble/bubblebeam) ; branche IsContest jamais prise (pas de contest).
 * Helpers battle_anim_mons.c NON exportés par battle_anim_mons.ts → transcrits
 * localement préfixés _ (SetAverageBattlerPositions, InitSpriteDataForLinear-
 * Translation, InitAnimLinearTranslationWithSpeed, GetBattlerSpriteBGPriority).
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker,
  InitAnimArcTranslation, TranslateAnimHorizontalArc,
  TranslateSpriteLinearFixedPoint, StartAnimLinearTranslation,
  StoreSpriteCallbackInData6, InitAnimLinearTranslation, AnimTranslateLinear,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { gSineTable } from './trig';
import { GetBattlerPosition } from '../engine/battle/util';
import { gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';

// ANTI-CYCLE ESM : accès LAZY à l'interpréteur via la surface globale.
type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; subpriority?: number; oamIndex?: number; callback: unknown;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

const DISPLAY_WIDTH = 240;

// 1:1 GetBattlerSide / GET_BATTLER_SIDE2 = GetBattlerPosition(b) & BIT_SIDE(1).
// 0 = B_SIDE_PLAYER (les deux macros décomp sont la même formule).
function _GetBattlerSide(battler: number): number {
  return GetBattlerPosition(battler) & 1;
}
// 1:1 battle_util.c IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function _IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

// 1:1 StartSpriteAnim (sprite.c) — pose animNum + flags, l'anim system runtime tick.
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) : position moyenne
 *  battler+partenaire (doubles) ; en simple, partner = battler → coord du battler.
 *  Out-params C (s16 *x/*y) → retour { x, y }. (IsContest → false, pas de contest.) */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  const xCoordType = !respectMonPicOffsets ? BATTLER_COORD_X : BATTLER_COORD_X_2;
  const yCoordType = !respectMonPicOffsets ? BATTLER_COORD_Y : BATTLER_COORD_Y_PIC_OFFSET;
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  let partnerX: number, partnerY: number;
  if (_IsDoubleBattle()) {
    partnerX = GetBattlerSpriteCoord(battler ^ 2 /* BATTLE_PARTNER */, xCoordType);
    partnerY = GetBattlerSpriteCoord(battler ^ 2, yCoordType);
  } else {
    partnerX = battlerX;
    partnerY = battlerY;
  }
  return { x: Math.trunc((battlerX + partnerX) / 2), y: Math.trunc((battlerY + partnerY) / 2) };
}

/** Réinterprète les 16 bits bas en s16 (= cast (s16) décomp). */
function _s16(v: number): number { return (v << 16) >> 16; }

/** 1:1 `InitSpriteDataForLinearTranslation` (battle_anim_mons.c:1055) — les
 *  deltas <<8 sont TRONQUÉS s16 (le C stocke dans des s16 locaux). */
function _InitSpriteDataForLinearTranslation(sprite: _VSprite): void {
  const x = _s16((sprite.data[2] - sprite.data[1]) << 8);
  const y = _s16((sprite.data[4] - sprite.data[3]) << 8);
  sprite.data[1] = Math.trunc(x / sprite.data[0]);
  sprite.data[2] = Math.trunc(y / sprite.data[0]);
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}

/** 1:1 `InitAnimLinearTranslationWithSpeed` (battle_anim_mons.c:1155) : data[0]
 *  = VITESSE → recalcule la durée abs(d2-d1)<<8 / vitesse puis init linéaire. */
function _InitAnimLinearTranslationWithSpeed(sprite: _VSprite): void {
  const v1 = Math.abs(sprite.data[2] - sprite.data[1]) << 8;
  sprite.data[0] = Math.trunc(v1 / sprite.data[0]);
  InitAnimLinearTranslation(sprite as never);
}

/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063). IsContest→false ;
 *  GetAnimBgAttribute(2|1, BG_ANIM_PRIORITY) : les priorités BG anim sont
 *  STATIQUES dans ce runtime (reset interpréteur BG1=1/BG2=2, SetAnimBgAttribute
 *  = stub no-op, monbg non câblé) → constantes documentées. */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = GetBattlerPosition(battler);
  return (position === 0 /* B_POSITION_PLAYER_LEFT */ || position === 3 /* B_POSITION_OPPONENT_RIGHT */)
    ? 2   // GetAnimBgAttribute(2, BG_ANIM_PRIORITY)
    : 1;  // GetAnimBgAttribute(1, BG_ANIM_PRIORITY)
}

// gBattlerSpriteIds[battler] — même résolution que battle_anim_throw (validée capture).
function _battlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return (id === undefined || id === null || id < 0) ? 0xFF : id;
}
function _spriteById(id: number): _VSprite | undefined {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, _VSprite> } | undefined;
  return rt?.gSprites?.get(id);
}
// OamEntry hardware du sprite (pattern battle_interface/pokeball : rt.gba.oam[oamIndex]).
// syncSpritesToOam ne ré-écrit PAS priority → la mutation persiste (1:1 sprite->oam.priority).
function _oamOf(sprite: _VSprite): { priority?: number } | undefined {
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ priority?: number }> } } | undefined;
  const idx = sprite.oamIndex;
  return (idx !== undefined && idx >= 0) ? rt?.gba?.oam?.[idx] : undefined;
}

// ─── AnimSludgeProjectile (battle_anim_poison.c:180) ────────────────────────

/** 1:1 `AnimSludgeProjectile` (battle_anim_poison.c:180) : projectile boue
 *  attaquant→cible en arc (amplitude data[5]=-30), durée args[2] ;
 *  args[3]==0 → StartSpriteAnim 2 (frame SludgeBombHit). */
function AnimSludgeProjectile(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 20, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  if (!args[3]) _StartSpriteAnim(sprite, 2);
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2];
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[5] = -30;
  InitAnimArcTranslation(sprite as never);
  sprite.callback = AnimSludgeProjectile_Step;
}
/** 1:1 `AnimSludgeProjectile_Step` (battle_anim_poison.c:197). */
function AnimSludgeProjectile_Step(sprite: _VSprite): void {
  if (TranslateAnimHorizontalArc(sprite as never)) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── AnimAcidPoisonBubble (battle_anim_poison.c:203) ────────────────────────

/** 1:1 `AnimAcidPoisonBubble` (battle_anim_poison.c:203) : arc attaquant →
 *  position MOYENNE cible (+args[4..5], args[4] miroir côté attaquant),
 *  durée args[2] ; args[3]==0 → StartSpriteAnim 2. */
function AnimAcidPoisonBubble(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 40, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if (!args[3]) _StartSpriteAnim(sprite, 2);
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  const avg = _SetAverageBattlerPositions(tgt, true);  // s16 l1, l2
  if (_GetBattlerSide(atk)) args[4] = -args[4];
  sprite.data[0] = args[2];
  sprite.data[2] = avg.x + args[4];
  sprite.data[4] = avg.y + args[5];
  sprite.data[5] = -30;
  InitAnimArcTranslation(sprite as never);
  sprite.callback = AnimAcidPoisonBubble_Step;
}
/** 1:1 `AnimAcidPoisonBubble_Step` (battle_anim_poison.c:225). */
function AnimAcidPoisonBubble_Step(sprite: _VSprite): void {
  if (TranslateAnimHorizontalArc(sprite as never)) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── AnimSludgeBombHitParticle (battle_anim_poison.c:231) ───────────────────

/** 1:1 `AnimSludgeBombHitParticle` (battle_anim_poison.c:231) : éclat projeté
 *  de (x,y) vers (+args[0], +args[1]) en args[2] frames, vélocité DÉCÉLÉRÉE
 *  chaque frame de data[5]/data[6] (= vel initiale / durée). */
function AnimSludgeBombHitParticle(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [10, 10, 20];
  sprite.invisible = false;
  sprite.data[0] = args[2];
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + args[0];
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + args[1];
  _InitSpriteDataForLinearTranslation(sprite);
  sprite.data[5] = Math.trunc(sprite.data[1] / args[2]);
  sprite.data[6] = Math.trunc(sprite.data[2] / args[2]);
  sprite.callback = AnimSludgeBombHitParticle_Step;
}
/** 1:1 `AnimSludgeBombHitParticle_Step` (battle_anim_poison.c:247). */
function AnimSludgeBombHitParticle_Step(sprite: _VSprite): void {
  TranslateSpriteLinearFixedPoint(sprite as never);
  sprite.data[1] -= sprite.data[5];
  sprite.data[2] -= sprite.data[6];
  if (!sprite.data[0]) _vItf().DestroyAnimSprite?.(sprite);
}

// ─── AnimAcidPoisonDroplet (battle_anim_poison.c:258) ───────────────────────

/** 1:1 `AnimAcidPoisonDroplet` (battle_anim_poison.c:258) : goutte posée sur la
 *  position moyenne cible (+args[0..1], args[0] miroir côté), qui TOMBE de
 *  data[0]=args[4] px (dest y = y+durée, 1:1) en glissant de args[2] en x. */
function AnimAcidPoisonDroplet(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 20];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  const avg = _SetAverageBattlerPositions(tgt, true);  // écrit sprite->x/y direct en C
  sprite.x = avg.x;
  sprite.y = avg.y;
  if (_GetBattlerSide(atk) !== 0 /* B_SIDE_PLAYER */) args[0] = -args[0];
  sprite.x += args[0];
  sprite.y += args[1];
  sprite.invisible = false;
  sprite.data[0] = args[4];
  sprite.data[2] = sprite.x + args[2];
  sprite.data[4] = sprite.y + sprite.data[0];
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, ((s: unknown) => { _vItf().DestroyAnimSprite?.(s); }) as never);
}

// ─── InitPoisonGasCloudAnim (battle_anim_ice.c:1194) — POISON_GAS ───────────

/** 1:1 `InitPoisonGasCloudAnim` (battle_anim_ice.c:1194) : nuage de gaz —
 *  args [durée, xOffAtk, yOffAtk, xOffTgt, yOffTgt, ?, ?, coordType] ;
 *  data[7] = 0x8000 si atk à gauche de tgt | prio BG cible <<8 | état (low byte) ;
 *  data[6] = 1 → sinus inversé (cible côté joueur). */
function InitPoisonGasCloudAnim(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [64, 0, 0, 0, 0, 0, 0, 1];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  sprite.data[0] = args[0];
  if (GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) < GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2))
    sprite.data[7] = 0x8000;  // Int16Array → -32768, sémantique s16 1:1

  if (_GetBattlerSide(tgt) === 0 /* B_SIDE_PLAYER (GET_BATTLER_SIDE2) */) {
    args[1] = -args[1];
    args[3] = -args[3];
    if ((sprite.data[7] & 0x8000) && _GetBattlerSide(atk) === 0) {
      const tgtSp = _spriteById(_battlerSpriteId(tgt));  // gSprites[GetAnimBattlerSpriteId(ANIM_TARGET)]
      if (tgtSp) sprite.subpriority = (tgtSp.subpriority ?? 0) + 1;
    }
    sprite.data[6] = 1;
  }

  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  if (args[7]) {
    sprite.data[1] = sprite.x + args[1];
    sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + args[3];
    sprite.data[3] = sprite.y + args[2];
    sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + args[4];
    sprite.data[7] |= _GetBattlerSpriteBGPriority(tgt) << 8;
  } else {
    sprite.data[1] = sprite.x + args[1];
    sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X) + args[3];
    sprite.data[3] = sprite.y + args[2];
    sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y) + args[4];
    sprite.data[7] |= _GetBattlerSpriteBGPriority(tgt) << 8;
  }
  // if (IsContest()) … : jamais (pas de contest dans ce runtime).
  InitAnimLinearTranslation(sprite as never);
  sprite.callback = MovePoisonGasCloud;
}

/** 1:1 `MovePoisonGasCloud` (battle_anim_ice.c:1241) : 3 états (data[7]&0xFF) —
 *  0: vol sinueux vers la cible ; 1: orbite autour (swap OAM priority devant/
 *  derrière selon la phase) ; 2: dérive hors écran → destroy. */
function MovePoisonGasCloud(sprite: _VSprite): void {
  const tgt = _vItf().getTarget?.() ?? 1;
  let value: number;
  switch (sprite.data[7] & 0xFF) {
    case 0:
      AnimTranslateLinear(sprite as never);
      value = gSineTable[sprite.data[5]];
      sprite.x2 += value >> 4;
      if (sprite.data[6]) sprite.data[5] = (sprite.data[5] - 8) & 0xFF;
      else sprite.data[5] = (sprite.data[5] + 8) & 0xFF;

      if (sprite.data[0] <= 0) {
        sprite.data[0] = 80;
        sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X);
        sprite.data[1] = sprite.x;
        sprite.data[2] = sprite.x;
        sprite.y += sprite.y2;
        sprite.data[3] = sprite.y;
        sprite.data[4] = sprite.y + 29;
        sprite.data[7]++;
        // IsContest→false : branche GET_BATTLER_SIDE2 seule.
        if (_GetBattlerSide(tgt) !== 0 /* != B_SIDE_PLAYER */) sprite.data[5] = 204;
        else sprite.data[5] = 80;

        sprite.y2 = 0;
        value = gSineTable[sprite.data[5]];
        sprite.x2 = value >> 3;
        sprite.data[5] = (sprite.data[5] + 2) & 0xFF;
        InitAnimLinearTranslation(sprite as never);
      }
      break;
    case 1: {
      AnimTranslateLinear(sprite as never);
      value = gSineTable[sprite.data[5]];
      sprite.x2 += value >> 3;
      sprite.y2 += (gSineTable[sprite.data[5] + 0x40] * -3) >> 8;  // index ≤ 319, table 320 entrées
      // !IsContest() : swap de priorité OBJ quand le nuage passe devant/derrière
      // le mon (oam.priority = u16:2 bitfield → & 3, 1:1 troncature hardware).
      const var0 = (sprite.data[5] - 0x40) & 0xFFFF;  // u16 var0
      const oam = _oamOf(sprite);
      if (var0 <= 0x7F) {
        if (oam) oam.priority = (sprite.data[7] >> 8) & 3;
      } else {
        if (oam) oam.priority = ((sprite.data[7] >> 8) + 1) & 3;
      }
      sprite.data[5] = (sprite.data[5] + 4) & 0xFF;

      if (sprite.data[0] <= 0) {
        sprite.data[0] = 0x300;  // vitesse pour InitAnimLinearTranslationWithSpeed
        sprite.data[1] = sprite.x += sprite.x2;
        sprite.data[3] = sprite.y += sprite.y2;
        sprite.data[4] = sprite.y + 4;
        // IsContest→false : sortie côté cible.
        if (_GetBattlerSide(tgt) !== 0 /* != B_SIDE_PLAYER */) sprite.data[2] = DISPLAY_WIDTH + 16;
        else sprite.data[2] = -16;

        sprite.data[7]++;
        sprite.x2 = 0;
        sprite.y2 = 0;
        _InitAnimLinearTranslationWithSpeed(sprite);
      }
      break;
    }
    case 2:
      if (AnimTranslateLinear(sprite as never)) {
        // 1:1 : FreeOamMatrix (si affine) + DestroySprite + gAnimVisualTaskCount--
        // = net-effect exact de DestroyAnimSprite (battle_anim.c:266).
        _vItf().DestroyAnimSprite?.(sprite);
      }
      break;
  }
}

registerAnimCallbacks({
  AnimSludgeProjectile: AnimSludgeProjectile as never,
  AnimAcidPoisonBubble: AnimAcidPoisonBubble as never,
  AnimSludgeBombHitParticle: AnimSludgeBombHitParticle as never,
  AnimAcidPoisonDroplet: AnimAcidPoisonDroplet as never,
  InitPoisonGasCloudAnim: InitPoisonGasCloudAnim as never,
});

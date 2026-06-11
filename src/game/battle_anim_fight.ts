/**
 * battle_anim_fight.ts — miroir PARTIEL de `src/battle_anim_fight.c`
 * (décomp pokeemeraude), vague 3h 2026-06-11.
 * Les poings/pieds : AnimBasicFistOrFoot, AnimFistOrFootRandomPos,
 * AnimSpinningKickOrPunch (+ finish 20f). Le gfx = ANIM_TAG_HANDS_AND_FEET
 * (table générée, anims variantes par args).
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget, GetBattlerSpriteCoord,
  StartAnimLinearTranslation, InitAnimLinearTranslation, AnimTranslateLinear,
  AnimTranslateLinear_WithFollowup, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  DestroySpriteAndMatrix,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { Sin } from './trig';
import {
  GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
} from '../engine/battle/util';
import { getRuntime } from '../engine/system/decomp-globals';

type _FSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _fItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _startAnim(sprite: unknown, num: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && num >= 0) { spA.animNum = num; spA.animBeginning = true; spA.animEnded = false; }
}
function _waitThenDestroy(sprite: _FSprite): void {
  if (--sprite.data[0] <= 0) _fItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimBasicFistOrFoot` : args [x, y, durée, anchor, animNum]. */
function AnimBasicFistOrFoot(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 30, 0, 0];
  _startAnim(sprite, args[4] | 0);
  if ((args[3] | 0) === 0) InitSpritePosToAnimAttacker(sprite as never, true);
  else InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.callback = _waitThenDestroy;
}

/** 1:1 `AnimFistOrFootRandomPos` : position aléatoire SUR le battler
 *  (LCG local — Random2 décomp), args [anchor, durée, animNum(-1=random)]. */
let _lcg = 0x1234;
function _rand2(): number { _lcg = (_lcg * 1103515245 + 24691) & 0xFFFFFFFF; return (_lcg >>> 16) & 0xFFFF; }
function AnimFistOrFootRandomPos(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 30, -1];
  const battler = (args[0] | 0) === 0 ? (_fItf().getAttacker?.() ?? 0) : (_fItf().getTarget?.() ?? 1);
  let animNum = args[2] | 0;
  if (animNum < 0) animNum = _rand2() % 5;
  _startAnim(sprite, animNum);
  sprite.x = GetBattlerSpriteCoord(battler, 2);
  sprite.y = GetBattlerSpriteCoord(battler, 3);
  // largeur/hauteur du battler : approx 64x64 (GetBattlerSpriteCoordAttr — dette douce)
  const xMod = 32, yMod = 16;
  let x = _rand2() % xMod;
  let y = _rand2() % yMod;
  if (_rand2() & 1) x = -x;
  if (_rand2() & 1) y = -y;
  if ((battler & 1) === 0) y -= 16;
  sprite.x += x;
  sprite.y += y;
  sprite.invisible = false;
  sprite.data[0] = args[1] | 0;
  sprite.callback = _waitThenDestroy;
}

/** 1:1 `AnimSpinningKickOrPunch`(+Finish 20f) : args [x, y, animNum, durée]. */
function AnimSpinningKickOrPunch(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 30];
  InitSpritePosToAnimTarget(sprite as never, true);
  _startAnim(sprite, args[2] | 0);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.callback = _SpinningKick_Wait;
}
function _SpinningKick_Wait(sprite: _FSprite): void {
  if (--sprite.data[0] <= 0) {
    sprite.data[0] = 20;
    sprite.callback = _waitThenDestroy;
  }
}

registerAnimCallbacks({
  AnimBasicFistOrFoot: AnimBasicFistOrFoot as never,
  AnimFistOrFootRandomPos: AnimFistOrFootRandomPos as never,
  AnimSpinningKickOrPunch: AnimSpinningKickOrPunch as never,
});

// ════════════════════════════════════════════════════════════════════════════
// Vague 2026-06-11 (suite) — miroir 1:1 du reste de battle_anim_fight.c :
// CrossChop, SlidingKick, Stomp, DizzyPunch, BrickBreak (mur + éclats),
// Superpower (orbe + rochers + boule de feu), ArmThrust, Revenge, FocusPunch,
// JumpKick / SlideHandOrFootToTarget (KarateChop & co).
// ════════════════════════════════════════════════════════════════════════════

// ── Plomberie locale (helpers décomp hors fight.c, transcrits préfixés _) ────

/** 1:1 `IsContest()` : pas de concours dans ce runtime web → toujours false
 *  (structure des branches conservée telle quelle). */
function _IsContest(): boolean { return false; }

/** 1:1 `GetBattlerSide(battler)` = GetBattlerPosition(battler) & BIT_SIDE(1).
 *  0 = B_SIDE_PLAYER. */
function _GetBattlerSide(battler: number): number { return GetBattlerPosition(battler) & 1; }

/** Wrapper nominal `DestroyAnimSprite` (surface lazy) pour stockage data6. */
function _DestroyAnimSprite(sprite: unknown): void { _fItf().DestroyAnimSprite?.(sprite); }

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décrémente data[0],
 *  puis enchaîne sur le callback stocké en data6. */
function _WaitAnimForDuration(sprite: _FSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735) : attend
 *  sprite->animEnded puis enchaîne data6. */
function _RunStoredCallbackWhenAnimEnds(sprite: _FSprite): void {
  if ((sprite as unknown as { animEnded?: boolean }).animEnded) SetCallbackToStoredInData6(sprite as never);
}

/** Accès lazy au runtime (SetGpuReg/GetGpuReg + OAM live) — même pattern que
 *  battle_anim_throw.ts. */
function _rtF(): {
  SetGpuReg?: (off: number, v: number) => void;
  GetGpuReg?: (off: number) => number;
  gba?: { oam?: Array<{ tileId: number; priority: number }> };
} | null {
  return (getRuntime() as never) ?? null;
}

/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) :
 *  GetAnimBgAttribute(2 ou 1, BG_ANIM_PRIORITY) = BGxCNT & 3 selon la position. */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = GetBattlerPosition(battler);
  if (_IsContest())
    return 2;
  else if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_RIGHT)
    return (_rtF()?.GetGpuReg?.(0x00C /* REG_OFFSET_BG2CNT */) ?? 0) & 3;
  else
    return (_rtF()?.GetGpuReg?.(0x00A /* REG_OFFSET_BG1CNT */) ?? 0) & 3;
}

/** Miroir de `sprite->oam.priority = N` : pousse la priorité BG dans l'entrée
 *  OAM live du sprite (le sync runtime ne propage pas `priority`). */
function _setOamPriority(sprite: unknown, priority: number): void {
  const sp = sprite as { oamIndex?: number };
  const oam = sp.oamIndex !== undefined ? _rtF()?.gba?.oam?.[sp.oamIndex] : undefined;
  if (oam) oam.priority = priority & 3;
}

/** Miroir de `sprite->oam.tileNum += delta` : décale la base tile du sprite
 *  (tileBase, relue par le tick anim) ET l'entrée OAM live. */
function _addOamTile(sprite: unknown, delta: number): void {
  const sp = sprite as { tileBase?: number; oamIndex?: number };
  if (typeof sp.tileBase === 'number') sp.tileBase += delta;
  const oam = sp.oamIndex !== undefined ? _rtF()?.gba?.oam?.[sp.oamIndex] : undefined;
  if (oam) oam.tileId += delta;
}

/** 1:1 `StorePointerInVars` (battle_anim_mons.c:1947) : split d'une valeur
 *  32-bit dans deux slots s16 (lo/hi). */
function _StorePointerInVars(data: number[], loIdx: number, hiIdx: number, value: number): void {
  data[loIdx] = value & 0xFFFF;
  data[hiIdx] = (value >> 16) & 0xFFFF;
}

/** 1:1 `LoadPointerFromVars` (battle_anim_mons.c:1954) : recompose la valeur
 *  32-bit signée depuis (u16)lo | ((u16)hi << 16). */
function _LoadPointerFromVars(lo: number, hi: number): number {
  return ((lo & 0xFFFF) | ((hi & 0xFFFF) << 16)) | 0;
}

/** 1:1 `AnimTravelDiagonally` (battle_anim_mons.c:1591) : translation linéaire
 *  vers (coord du battler + args[2..3]) en args[4] frames ; args[5] = anchor,
 *  args[6] = coordType (0 = Y_PIC_OFFSET/respect offsets). NB : le double
 *  InitSpritePosToAnimTarget inconditionnel est DANS le décomp (quirk GF). */
function _AnimTravelDiagonally(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
  let respectMonPicOffsets: boolean;
  let coordType: number;
  if (!args[6]) {
    respectMonPicOffsets = true;
    coordType = BATTLER_COORD_Y_PIC_OFFSET;
  } else {
    respectMonPicOffsets = false;
    coordType = BATTLER_COORD_Y;
  }
  let battler: number;
  if ((args[5] | 0) === 0 /* ANIM_ATTACKER */) {
    InitSpritePosToAnimAttacker(sprite as never, respectMonPicOffsets);
    battler = _fItf().getAttacker?.() ?? 0;
  } else {
    InitSpritePosToAnimTarget(sprite as never, respectMonPicOffsets);
    battler = _fItf().getTarget?.() ?? 1;
  }
  if (_GetBattlerSide(_fItf().getAttacker?.() ?? 0))
    args[2] = -args[2];
  InitSpritePosToAnimTarget(sprite as never, respectMonPicOffsets);
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + (args[2] | 0);
  sprite.data[4] = GetBattlerSpriteCoord(battler, coordType) + (args[3] | 0);
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

// ── Callbacks de battle_anim_fight.c ─────────────────────────────────────────

/** 1:1 `AnimSlideHandOrFootToTarget` (battle_anim_fight.c:421) : main/pied
 *  (KarateChop & co) qui glisse en diagonale vers la cible ; args[7]==1 →
 *  miroir des offsets côté adverse ; args[6] = animNum (zéroé avant le travel). */
function AnimSlideHandOrFootToTarget(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
  if ((args[7] | 0) === 1 && _GetBattlerSide(_fItf().getAttacker?.() ?? 0) !== 0 /* != B_SIDE_PLAYER */) {
    args[1] = -args[1];
    args[3] = -args[3];
  }
  _startAnim(sprite, args[6] | 0);
  args[6] = 0;
  sprite.invisible = false;
  _AnimTravelDiagonally(sprite);
}

/** 1:1 `AnimJumpKick` (battle_anim_fight.c:434) : variante contest-miroir de
 *  AnimSlideHandOrFootToTarget (IsContest=false ici → délégation directe). */
function AnimJumpKick(sprite: _FSprite): void {
  if (_IsContest()) {
    const args = _fItf().getArgs?.() ?? [0, 0, 0, 0];
    args[1] = -args[1];
    args[3] = -args[3];
  }
  AnimSlideHandOrFootToTarget(sprite);
}

/** 1:1 `AnimCrossChopHand` (battle_anim_fight.c:530) : main qui s'écarte de
 *  20px (gauche/droite selon args[2], hFlip à droite) en 30 frames puis revient. */
function AnimCrossChopHand(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0];
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = 30;
  if ((args[2] | 0) === 0) {
    sprite.data[2] = sprite.x - 20;
  } else {
    sprite.data[2] = sprite.x + 20;
    (sprite as unknown as { hFlip?: boolean }).hFlip = true;
  }
  sprite.data[4] = sprite.y - 20;
  sprite.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(sprite as never, AnimCrossChopHand_Step as never);
}

/** 1:1 `AnimCrossChopHand_Step` (battle_anim_fight.c:550) : à la frame 11,
 *  replie x2/y2 dans x/y et relance une translation retour (8 frames) → destroy. */
function AnimCrossChopHand_Step(sprite: _FSprite): void {
  if (++sprite.data[5] === 11) {
    sprite.data[2] = sprite.x - sprite.x2;
    sprite.data[4] = sprite.y - sprite.y2;
    sprite.data[0] = 8;
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
  }
}

/** 1:1 `AnimSlidingKick` (battle_anim_fight.c:568) : pied (Rolling Kick /
 *  Low Kick) qui glisse de args[2] px en args[3] frames avec rebond Sin
 *  (amplitude args[5], pas de phase args[4]). BATTLE_PARTNER = battler^2. */
function AnimSlidingKick(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const attacker = _fItf().getAttacker?.() ?? 0;
  const target = _fItf().getTarget?.() ?? 1;
  if ((attacker ^ 2) === target && GetBattlerPosition(target) < B_POSITION_PLAYER_RIGHT)
    args[0] *= -1;
  InitSpritePosToAnimTarget(sprite as never, true);
  if (_GetBattlerSide(attacker) !== 0 /* != B_SIDE_PLAYER */)
    args[2] = -args[2];
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + (args[2] | 0);
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y;
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = args[5] | 0;
  sprite.data[6] = args[4] | 0;
  sprite.data[7] = 0;
  sprite.callback = AnimSlidingKick_Step;
}

/** 1:1 `AnimSlidingKick_Step` (battle_anim_fight.c:593) : translation + bosse
 *  Sin sur y2 ; destroy à la fin de la translation. */
function AnimSlidingKick_Step(sprite: _FSprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.y2 += Sin((sprite.data[7] >> 8) & 0xFF, sprite.data[5]);
    sprite.data[7] += sprite.data[6];
  } else {
    _fItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimStompFoot` (battle_anim_fight.c:636) : pied de Stomp — attente
 *  initiale args[2] frames au-dessus de la cible. */
function AnimStompFoot(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0];
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.callback = AnimStompFoot_Step;
}

/** 1:1 `AnimStompFoot_Step` (battle_anim_fight.c:644) : fin de l'attente →
 *  translation 6 frames vers (X_2, Y_PIC_OFFSET) de la cible. */
function AnimStompFoot_Step(sprite: _FSprite): void {
  if (--sprite.data[0] === -1) {
    sprite.data[0] = 6;
    sprite.data[2] = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(sprite as never, AnimStompFoot_End as never);
  }
}

/** 1:1 `AnimStompFoot_End` (battle_anim_fight.c:657) : pause 15 frames sur
 *  place puis destroy. */
function AnimStompFoot_End(sprite: _FSprite): void {
  sprite.data[0] = 15;
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimDizzyPunchDuck` (battle_anim_fight.c:665) : canard de Dizzy Punch —
 *  dérive X fixed-point (args[2]) + onde Sin (amplitude args[3]), clignote
 *  au-delà de la phase 100, destroy au-delà de 120. */
function AnimDizzyPunchDuck(sprite: _FSprite): void {
  if (sprite.data[0] === 0) {
    const args = _fItf().getArgs?.() ?? [0, 0, 0, 0];
    InitSpritePosToAnimTarget(sprite as never, true);
    sprite.invisible = false;
    sprite.data[1] = args[2] | 0;
    sprite.data[2] = args[3] | 0;
    sprite.data[0]++;
  } else {
    sprite.data[4] += sprite.data[1];
    sprite.x2 = sprite.data[4] >> 8;
    sprite.y2 = Sin(sprite.data[3] & 0xFF, sprite.data[2]);
    sprite.data[3] = (sprite.data[3] + 3) & 0xFF;
    if (sprite.data[3] > 100)
      sprite.invisible = (sprite.data[3] % 2) !== 0;
    if (sprite.data[3] > 120)
      _fItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimBrickBreakWall` (battle_anim_fight.c:690) : le mur bleu de
 *  Brick Break — args [anchor, x, y, holdFrames, shakeFrames]. */
function AnimBrickBreakWall(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_X);
    sprite.y = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_Y);
  } else {
    sprite.x = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_X);
    sprite.y = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_Y);
  }
  sprite.x += args[1] | 0;
  sprite.y += args[2] | 0;
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = 0;
  sprite.callback = AnimBrickBreakWall_Step;
}

/** 1:1 `AnimBrickBreakWall_Step` (battle_anim_fight.c:713) : hold data[1]
 *  frames, puis secousse x2 = ±2 toutes les 2 frames pendant data[2] frames. */
function AnimBrickBreakWall_Step(sprite: _FSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (--sprite.data[1] === 0) {
        if (sprite.data[2] === 0)
          _fItf().DestroyAnimSprite?.(sprite);
        else
          sprite.data[0]++;
      }
      break;
    case 1:
      if (++sprite.data[1] > 1) {
        sprite.data[1] = 0;
        sprite.data[3]++;
        if (sprite.data[3] & 1)
          sprite.x2 = 2;
        else
          sprite.x2 = -2;
      }
      if (--sprite.data[2] === 0)
        _fItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

/** 1:1 `AnimBrickBreakWallShard` (battle_anim_fight.c:744) : éclat de mur —
 *  args [anchor, shardId 0-3 (tuile + direction ±3/±3), x, y]. */
function AnimBrickBreakWallShard(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0];
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_X) + (args[2] | 0);
    sprite.y = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_Y) + (args[3] | 0);
  } else {
    sprite.x = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_X) + (args[2] | 0);
    sprite.y = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_Y) + (args[3] | 0);
  }
  _addOamTile(sprite, (args[1] | 0) * 16);  // sprite->oam.tileNum += gBattleAnimArgs[1] * 16;
  sprite.invisible = false;
  sprite.data[0] = 0;
  switch (args[1] | 0) {
    case 0:
      sprite.data[6] = -3;
      sprite.data[7] = -3;
      break;
    case 1:
      sprite.data[6] = 3;
      sprite.data[7] = -3;
      break;
    case 2:
      sprite.data[6] = -3;
      sprite.data[7] = 3;
      break;
    case 3:
      sprite.data[6] = 3;
      sprite.data[7] = 3;
      break;
    default:
      _fItf().DestroyAnimSprite?.(sprite);
      return;
  }
  sprite.callback = AnimBrickBreakWallShard_Step;
}

/** 1:1 `AnimBrickBreakWallShard_Step` (battle_anim_fight.c:786) : vole en
 *  diagonale (data[6]/data[7] px/frame) pendant 40 frames puis destroy. */
function AnimBrickBreakWallShard_Step(sprite: _FSprite): void {
  sprite.x += sprite.data[6];
  sprite.y += sprite.data[7];
  if (++sprite.data[0] > 40)
    _fItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSuperpowerOrb` (battle_anim_fight.c:795) : l'orbe de Superpower —
 *  grossit (affine) 180 frames sur l'attaquant puis file sur l'autre battler.
 *  NB : le décomp lit `gBattlerAttacker` pour les coords ; pendant une anim de
 *  move gBattleAnimAttacker == gBattlerAttacker → getAttacker() est exact. */
function AnimSuperpowerOrb(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0];
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_Y_PIC_OFFSET);
    _setOamPriority(sprite, _GetBattlerSpriteBGPriority(_fItf().getAttacker?.() ?? 0));
    sprite.data[7] = _fItf().getTarget?.() ?? 1;
  } else {
    _setOamPriority(sprite, _GetBattlerSpriteBGPriority(_fItf().getTarget?.() ?? 1));
    sprite.data[7] = _fItf().getAttacker?.() ?? 0;
  }
  sprite.invisible = false;
  sprite.data[0] = 0;
  sprite.data[1] = 12;
  sprite.data[2] = 8;
  sprite.callback = AnimSuperpowerOrb_Step;
}

/** 1:1 `AnimSuperpowerOrb_Step` (battle_anim_fight.c:816) : à la frame 180,
 *  coupe le blending (BLDCNT=0) et translate vers le battler data[7] en 16
 *  frames → DestroySpriteAndMatrix. */
function AnimSuperpowerOrb_Step(sprite: _FSprite): void {
  if (++sprite.data[0] === 180) {
    _rtF()?.SetGpuReg?.(0x050 /* REG_OFFSET_BLDCNT */, 0);
    sprite.data[0] = 16;
    sprite.data[1] = sprite.x;
    sprite.data[2] = GetBattlerSpriteCoord(sprite.data[7], BATTLER_COORD_X_2);
    sprite.data[3] = sprite.y;
    sprite.data[4] = GetBattlerSpriteCoord(sprite.data[7], BATTLER_COORD_Y_PIC_OFFSET);
    InitAnimLinearTranslation(sprite as never);
    StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
    sprite.callback = AnimTranslateLinear_WithFollowup;
  }
}

/** 1:1 `AnimSuperpowerRock` (battle_anim_fight.c:835) : rocher flottant —
 *  args [x, yVel fixed-point, variante tuile (×4), délai de chute]. Y 32-bit
 *  (y<<8) packé dans data[4]/data[5] (StorePointerInVars). */
function AnimSuperpowerRock(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0];
  sprite.x = args[0] | 0;
  sprite.y = 120;
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  _StorePointerInVars(sprite.data, 4, 5, sprite.y << 8);
  sprite.data[6] = args[1] | 0;
  _addOamTile(sprite, (args[2] | 0) * 4);  // sprite->oam.tileNum += gBattleAnimArgs[2] * 4;
  sprite.callback = AnimSuperpowerRock_Step1;
}

/** 1:1 `AnimSuperpowerRock_Step1` (battle_anim_fight.c:849) : monte (y 32-bit
 *  -= data[6] par frame) pendant data[0] frames (destroy si y < -8), puis arme
 *  la trajectoire attaquant→cible (deltas ×16) et passe à Step2. */
function AnimSuperpowerRock_Step1(sprite: _FSprite): void {
  if (sprite.data[0] !== 0) {
    let var0 = _LoadPointerFromVars(sprite.data[4], sprite.data[5]);
    var0 -= sprite.data[6];
    _StorePointerInVars(sprite.data, 4, 5, var0);
    sprite.y = var0 >> 8;
    if (sprite.y < -8)
      _fItf().DestroyAnimSprite?.(sprite);
    else
      sprite.data[0]--;
  } else {
    const pos0 = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_X_2);
    const pos1 = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_Y_PIC_OFFSET);
    const pos2 = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_X_2);
    const pos3 = GetBattlerSpriteCoord(_fItf().getTarget?.() ?? 1, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.data[0] = pos2 - pos0;
    sprite.data[1] = pos3 - pos1;
    sprite.data[2] = sprite.x << 4;
    sprite.data[3] = sprite.y << 4;
    sprite.callback = AnimSuperpowerRock_Step2;
  }
}

/** 1:1 `AnimSuperpowerRock_Step2` (battle_anim_fight.c:882) : avance en
 *  fixed-point ×16 vers la cible ; destroy hors écran (edgeX u16 > 256,
 *  y < -8 ou y > 120). */
function AnimSuperpowerRock_Step2(sprite: _FSprite): void {
  sprite.data[2] += sprite.data[0];
  sprite.data[3] += sprite.data[1];
  sprite.x = sprite.data[2] >> 4;
  sprite.y = sprite.data[3] >> 4;
  const edgeX = (sprite.x + 8) & 0xFFFF;  // u16 edgeX = sprite->x + 8;
  if (edgeX > 256 || sprite.y < -8 || sprite.y > 120)
    _fItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSuperpowerFireball` (battle_anim_fight.c:896) : météore de
 *  Superpower — translate en 16 frames vers l'autre battler ; flips OAM
 *  (matrixNum |= H/VFLIP, sprite AffineOff → hFlip/vFlip runtime) côté joueur.
 *  Même note gBattlerAttacker == gBattleAnimAttacker que l'orbe. */
function AnimSuperpowerFireball(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0];
  let battler: number;
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(_fItf().getAttacker?.() ?? 0, BATTLER_COORD_Y_PIC_OFFSET);
    battler = _fItf().getTarget?.() ?? 1;
    _setOamPriority(sprite, _GetBattlerSpriteBGPriority(_fItf().getAttacker?.() ?? 0));
  } else {
    battler = _fItf().getAttacker?.() ?? 0;
    _setOamPriority(sprite, _GetBattlerSpriteBGPriority(_fItf().getTarget?.() ?? 1));
  }
  const spFlip = sprite as unknown as { hFlip?: boolean; vFlip?: boolean };
  if (_IsContest())
    spFlip.hFlip = true;                       // oam.matrixNum |= ST_OAM_HFLIP
  else if (_GetBattlerSide(battler) === 0 /* B_SIDE_PLAYER */) {
    spFlip.hFlip = true;                       // oam.matrixNum |= ST_OAM_HFLIP | ST_OAM_VFLIP
    spFlip.vFlip = true;
  }
  sprite.invisible = false;
  sprite.data[0] = 16;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET);
  InitAnimLinearTranslation(sprite as never);
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
  sprite.callback = AnimTranslateLinear_WithFollowup;
}

/** 1:1 `AnimArmThrustHit` (battle_anim_fight.c:937) : paume d'Arm Thrust sur
 *  la cible — args [x2, y2, durée, animNum]. DETTE DOUCE : `gAnimMoveTurn`
 *  n'est pas exposé sur la surface lazy → turn=0 (l'alternance G/D entre les
 *  coups multiples est perdue ; le flip côté joueur reste 1:1). */
function AnimArmThrustHit(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0, 0];
  const target = _fItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(target, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(target, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[0] | 0;
  sprite.data[3] = args[1] | 0;
  sprite.data[4] = args[2] | 0;
  let turn = 0;  // = gAnimMoveTurn (non exposé — dette douce documentée)
  if (_GetBattlerSide(target) === 0 /* B_SIDE_PLAYER */)
    turn++;
  if (turn & 1) {
    sprite.data[2] = -sprite.data[2];
    sprite.data[1]++;
  }
  _startAnim(sprite, sprite.data[1]);
  sprite.x2 = sprite.data[2];
  sprite.y2 = sprite.data[3];
  sprite.invisible = false;
  sprite.callback = AnimArmThrustHit_Step;
}

/** 1:1 `AnimArmThrustHit_Step` (battle_anim_fight.c:929) : destroy quand
 *  data[0] atteint la durée data[4]. */
function AnimArmThrustHit_Step(sprite: _FSprite): void {
  if (sprite.data[0] === sprite.data[4])
    _fItf().DestroyAnimSprite?.(sprite);
  sprite.data[0]++;
}

/** 1:1 `AnimRevengeScratch` (battle_anim_fight.c:964) : griffure violette de
 *  Revenge — anim 1 (vFlip) côté adverse ; joue l'anim puis destroy
 *  (RunStoredCallbackWhenAnimEnds). */
function AnimRevengeScratch(sprite: _FSprite): void {
  const args = _fItf().getArgs?.() ?? [0, 0, 0];
  if ((args[2] | 0) === 0 /* ANIM_ATTACKER */)
    InitSpritePosToAnimAttacker(sprite as never, false);
  else
    InitSpritePosToAnimTarget(sprite as never, false);
  sprite.invisible = false;
  if (_IsContest())
    _startAnim(sprite, 2);
  else if (_GetBattlerSide(_fItf().getAttacker?.() ?? 0) !== 0 /* != B_SIDE_PLAYER */)
    _startAnim(sprite, 1);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimFocusPunchFist` (battle_anim_fight.c:985) : le poing de Focus
 *  Punch — après la fin de l'affine anim (rétrécissement), tremble en X
 *  (Sin pas 40, amplitude 2) pendant 40 frames puis destroy. */
function AnimFocusPunchFist(sprite: _FSprite): void {
  sprite.invisible = false;
  if ((sprite as unknown as { affineAnimEnded?: boolean }).affineAnimEnded) {
    sprite.data[1] = (sprite.data[1] + 40) & 0xFF;
    sprite.x2 = Sin(sprite.data[1], 2);
    if (++sprite.data[0] > 40)
      _fItf().DestroyAnimSprite?.(sprite);
  }
}

registerAnimCallbacks({
  AnimSlideHandOrFootToTarget: AnimSlideHandOrFootToTarget as never,
  AnimJumpKick: AnimJumpKick as never,
  AnimCrossChopHand: AnimCrossChopHand as never,
  AnimSlidingKick: AnimSlidingKick as never,
  AnimStompFoot: AnimStompFoot as never,
  AnimDizzyPunchDuck: AnimDizzyPunchDuck as never,
  AnimBrickBreakWall: AnimBrickBreakWall as never,
  AnimBrickBreakWallShard: AnimBrickBreakWallShard as never,
  AnimSuperpowerOrb: AnimSuperpowerOrb as never,
  AnimSuperpowerRock: AnimSuperpowerRock as never,
  AnimSuperpowerFireball: AnimSuperpowerFireball as never,
  AnimArmThrustHit: AnimArmThrustHit as never,
  AnimRevengeScratch: AnimRevengeScratch as never,
  AnimFocusPunchFist: AnimFocusPunchFist as never,
});

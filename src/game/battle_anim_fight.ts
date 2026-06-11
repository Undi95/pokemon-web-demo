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
} from './battle_anim_mons';

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

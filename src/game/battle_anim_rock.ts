/**
 * battle_anim_rock.ts — miroir PARTIEL de `src/battle_anim_rock.c`
 * (décomp pokeemeraude), vague 2c 2026-06-11.
 * AnimParticleInVortex(+Step) 1:1 (:363) — 3 templates générés (sandstorm,
 * whirlpool, fire spin particles...) : montée fixed-point + onde Sin X.
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget } from './battle_anim_mons';
import { Sin } from './trig';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _vItf(): { getArgs?: () => number[]; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 `AnimParticleInVortex` (rock.c:363) : args [x, y, yVel, durée, dPhase,
 *  amplitude, anchor]. La particule MONTE (y2 négatif) en spiralant. */
function AnimParticleInVortex(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 64, 30, 4, 8, 0];
  if ((args[6] | 0) === 0) InitSpritePosToAnimAttacker(sprite as never, false);
  else InitSpritePosToAnimTarget(sprite as never, false);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.data[1] = args[2] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
  sprite.callback = _ParticleInVortex_Step;
}
function _ParticleInVortex_Step(sprite: _VSprite): void {
  sprite.data[4] = (sprite.data[4] + sprite.data[1]) & 0xFFFF;
  sprite.y2 = -((sprite.data[4] << 16 >> 16) >> 8);
  sprite.x2 = Sin(sprite.data[5] & 0xFF, sprite.data[3]);
  sprite.data[5] = (sprite.data[5] + sprite.data[2]) & 0xFF;
  if (--sprite.data[0] === -1) {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

registerAnimCallbacks({ AnimParticleInVortex: AnimParticleInVortex as never });

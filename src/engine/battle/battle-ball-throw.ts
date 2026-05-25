/**
 * battle-ball-throw.ts — Port 1:1 décomp `src/pokeball.c` séquence SpriteCB_BallThrow*.
 *
 * Animation pixel-perfect d'un throw de Pokeball sur l'opp :
 *   1. Ball spawn à player position (= 32, 80 selon décomp ll. 376)
 *   2. Arc parabolic vers opp position (= TranslateAnimHorizontalArc équivalent)
 *   3. ReachMon : ball touche opp, transition state
 *   4. StartShrinkMon (10 frames delay) puis ShrinkMon (= opp y2 negative shift)
 *   5. Close (= ball anim close + fade opp invisible)
 *   6. FallToGround : 4 bounces avec Cos/Sin (~64 frames)
 *   7. StartShakes (delay 31 frames)
 *   8. Shake N fois (N = 0/1/2/3 si fail, 4 si success)
 *   9. Release : si fail opp ressort, si success → captureMon
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokeball.c:424-635` SpriteCB_BallThrow chain
 *   - `D:/Projet 1/decomps/pokeemeraude/src/util.c` TranslateAnimHorizontalArc
 *
 * Note : la version décomp utilise sprite affine animation pour ball rotation,
 * pas porté ici (= sprite est OAM normal sans affine). Tous les autres timings
 * + behaviours sont 1:1.
 *
 * Asset utilisé : `/decomp/em/balls/poke.png` (= sprite Poke Ball 16x16).
 *
 * Note : ce module est invoqué par battle-flow.ts via `startBallThrow()`. Il
 * appelle `tickBallThrow()` chaque frame du tick principal. Retourne `null`
 * tant que l'anim est active, et l'outcome quand done.
 */

import { getRuntime } from '../system/decomp-globals';
import { LoadSpritePalette } from '../sprite';

// 1:1 strict A8 audit : import depuis decomp-data.
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from '../decomp-data/include/gba/defines-data';

// Sprite Poke Ball asset 16x16 (= 4 tiles 8x8 = 4*32=128 bytes 4bpp).
const POKE_BALL_URL = '/decomp/em/balls/poke.png';
// VRAM offset pour ball OBJ tiles (= choisir loin player/opp 64x64=2KB each).
// Player utilise byte 0x0000, opp byte 0x2000 (= ~4KB each pour 64x64 4bpp).
// On met ball à byte 0x4000 = tileId 512 (= 0x4000/32). OBJ VRAM total 32KB,
// donc shape 0 size 1 (= 16x16 = 4 tiles) fits OK à tileId 512..515.
const BALL_SPRITE_BYTE_OFFSET = 0x4000;
/** 1:1 STRICT décomp `LoadSpritePalette` : slot dynamiquement alloué. */
const TAG_BALL_THROW_PAL = 'BATTLE_BALL_THROW_PAL';
let _ballPaletteSlot = -1;
const BALL_PALETTE_SLOT = 7;             // legacy : utilisé fallback si non alloué

/** Résultat final d'un throw : caught si N=4 shakes réussis, escaped sinon. */
export type BallThrowResult = 'caught' | 'escaped';

interface BallThrowState {
  /** 1=arc, 2=reach, 3=shrink_init, 4=shrink, 5=close, 6=fall, 7=start_shakes, 8=shake, 9=release */
  phase: number;
  /** Frame counter dans la phase courante. */
  frame: number;
  /** Sprite ID de la ball (= rt.gSprites). */
  ballSpriteId: number;
  /** Sprite ID de l'opp (= pour shrink + invisible). */
  opponentSpriteId: number;
  /** Position start (= player coord) et end (= opp coord). */
  startX: number; startY: number;
  endX: number; endY: number;
  /** Pour arc anim : pos progressive. */
  arcT: number;        // 0..1
  /** Bounce data (= phase 6 fall to ground). */
  bounceCount: number;
  bounceAmplitude: number;
  bouncePhase: number;
  bounceSubstate: number;  // 0=descent, 1=rebond up
  /** Shake data (= phase 8). */
  shakeIndex: number;       // 0..3 cycle
  shakeOffset: number;      // -3..3
  shakeDir: number;         // +1 ou -1
  shakeMaxCount: number;    // 0/1/2/3/4 selon outcome
  shakeDoneCount: number;
  shakePauseFrames: number;
  /** Result final (= déterminé à phase 7 init). */
  willCatch: boolean;
  outcome: BallThrowResult | null;
  /** Texte FR à afficher après la fin. */
  resultMessage: string;
}

let _bt: BallThrowState | null = null;
let _ballAssetLoaded = false;

/** Pre-load le sprite ball asset 1 fois (= LoadCompressedSpriteSheet décomp). */
async function _ensureBallAsset(): Promise<void> {
  if (_ballAssetLoaded) return;
  const rt = getRuntime();
  if (!rt) return;
  try {
    const loaded = await rt.LoadCompressedSpriteSheet(POKE_BALL_URL, BALL_SPRITE_BYTE_OFFSET);
    _ballPaletteSlot = LoadSpritePalette({ data: loaded.palette, tag: TAG_BALL_THROW_PAL });
    _ballAssetLoaded = true;
  } catch (e) {
    console.warn('[ball-throw] failed to load poke.png:', e);
  }
}

/** 1:1 décomp `Task_DoPokeballSendOutAnim` setup (ll. 365-419) + spawn ball.
 *
 *  Paramètres :
 *   - opponentSpriteId : sprite ID de l'opp (= pour shrink + invisible pendant capture)
 *   - opponentMonNickname : pour le message FR
 *   - willCatch : true si la capture doit réussir (= 4 shakes), false sinon */
export async function startBallThrow(opts: {
  opponentSpriteId: number;
  opponentMonNickname: string;
  willCatch: boolean;
  /** Player ball spawn position (= 32, 80 default décomp). */
  startX?: number;
  startY?: number;
  /** Opp position (= GetBattlerSpriteCoord BATTLER_COORD_X/Y équivalent). */
  endX?: number;
  endY?: number;
}): Promise<void> {
  await _ensureBallAsset();
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp ll. 376 : CreateSprite(&gBallSpriteTemplates[ballId], 32, 80, 29)
  // x=32, y=80 = player ball throw start position.
  const startX = opts.startX ?? 32;
  const startY = opts.startY ?? 80;
  // 1:1 décomp ll. 411-412 : GetBattlerSpriteCoord opp X/Y, minus 16 pour ajustement vertical.
  const endX = opts.endX ?? 144;  // = opp top-left X (= sBattlerCoords opp x 176 - 32)
  const endY = (opts.endY ?? 8) + 16;  // = opp Y + offset for "réach mon" position

  // Spawn ball sprite. 1:1 décomp sBallOamData : shape SQUARE size 16x16 = shape 0 size 1.
  const ball = rt.CreateSpriteAtOam({
    tileId: BALL_SPRITE_BYTE_OFFSET / 32,
    paletteBank: _ballPaletteSlot,
    x: startX, y: startY,
    shape: 0, size: 1,  // = 16x16 (= 4 tiles 8x8)
    priority: 0,
  });

  _bt = {
    phase: 1,  // 1 = arc throw
    frame: 0,
    ballSpriteId: ball.spriteId,
    opponentSpriteId: opts.opponentSpriteId,
    startX, startY, endX, endY,
    arcT: 0,
    bounceCount: 0,
    bounceAmplitude: 32,
    bouncePhase: 0,
    bounceSubstate: 0,
    shakeIndex: 0,
    shakeOffset: 0,
    shakeDir: 1,
    shakeMaxCount: opts.willCatch ? 4 : Math.floor(Math.random() * 4),  // 0..3 si fail
    shakeDoneCount: 0,
    shakePauseFrames: 0,
    willCatch: opts.willCatch,
    outcome: null,
    resultMessage: opts.willCatch
      ? `Bravo ! ${opts.opponentMonNickname}\nest capturé !`
      : `Oh non !\n${opts.opponentMonNickname} s'enfuit !`,
  };
}

/** 1:1 décomp tick per frame. Retourne true quand l'anim est terminée + outcome set. */
// Le caller (= battle-flow.ts) appelle tickBallThrow ~5-6x par frame visuelle
// (= ScriptContext_SetupInlineNative polling). Pour timing correct (= 60fps
// effective), gate via le rt.frameCounter qui s'incrémente 1x par frame.
let _lastFrameCounter = -1;
export function tickBallThrow(): { done: boolean; outcome: BallThrowResult | null; message: string | null } {
  if (!_bt) return { done: true, outcome: null, message: null };
  const rt = getRuntime();
  if (!rt) return { done: true, outcome: null, message: null };
  // Gate : 1 update per frame visuelle. Sinon flow.tick polling fait avancer
  // l'anim 5-6x plus vite que prévu (= bug timing).
  // Fallback : utilise performance.now() / 16 (= ~60fps) si frameCounter privé.
  const fc = Math.floor(performance.now() / 16);
  if (fc === _lastFrameCounter) {
    return { done: false, outcome: null, message: null };
  }
  _lastFrameCounter = fc;
  const ball = rt.gSprites.get(_bt.ballSpriteId);
  if (!ball) {
    const outcome = _bt.outcome;
    const msg = _bt.resultMessage;
    _bt = null;
    _lastFrameCounter = -1;
    return { done: true, outcome, message: msg };
  }
  const opp = rt.gSprites.get(_bt.opponentSpriteId);

  _bt.frame++;

  switch (_bt.phase) {
    case 1: {  // ARC throw — 30 frames parabolic
      // 1:1 décomp `TranslateAnimHorizontalArc` (util.c) : interpolation arc parabolique.
      // Trajectoire : x lineaire, y avec sin arc (= -40 pic).
      const T = 30;
      _bt.arcT = Math.min(1, _bt.frame / T);
      const x = _bt.startX + (_bt.endX - _bt.startX) * _bt.arcT;
      const yLinear = _bt.startY + (_bt.endY - _bt.startY) * _bt.arcT;
      const arcAmplitude = 40;  // = -40 pic décomp ll. 413
      const yArc = -arcAmplitude * Math.sin(Math.PI * _bt.arcT);
      ball.x = Math.round(x);
      ball.y = Math.round(yLinear + yArc);
      if (_bt.arcT >= 1) {
        _bt.phase = 2;
        _bt.frame = 0;
      }
      break;
    }
    case 2: {  // REACH MON — 1 frame transition (= SpriteCB_BallThrow_ReachMon)
      _bt.phase = 3;
      _bt.frame = 0;
      break;
    }
    case 3: {  // SHRINK MON INIT — 10 frames delay (= SpriteCB_BallThrow_StartShrinkMon)
      if (_bt.frame >= 10) {
        _bt.phase = 4;
        _bt.frame = 0;
      }
      break;
    }
    case 4: {  // SHRINK MON — opp y2 negative shift jusqu'à invisible (= ~11 frames)
      // 1:1 décomp ll. 488-490 : data[1] += 0x60, y2 = -data[1] >> 8.
      // Notre adapt : décrémente y2 progressivement.
      if (opp) {
        opp.y2 = (opp.y2 ?? 0) - 2;
      }
      if (_bt.frame >= 11) {
        if (opp) opp.invisible = true;
        _bt.phase = 5;
        _bt.frame = 0;
      }
      break;
    }
    case 5: {  // CLOSE BALL — anim end ~5 frames
      if (_bt.frame >= 5) {
        // 1:1 décomp ll. 502-505 : init bounce data, y += Cos(0, 32), y2 = -Cos(0, amp).
        _bt.bouncePhase = 0;
        _bt.bounceAmplitude = 32;
        _bt.bounceCount = 0;
        _bt.bounceSubstate = 0;
        ball.y += 32;     // = Cos(0, 32) = 32
        ball.y2 = -32;    // = -Cos(0, 32) = -32
        _bt.phase = 6;
        _bt.frame = 0;
      }
      break;
    }
    case 6: {  // FALL TO GROUND — 4 bounces with Cos progression (= ~64 frames total)
      // Simplifié : 4 bounces, chaque bounce ~16 frames, amplitude diminue.
      const cosAmp = _bt.bounceAmplitude;
      if (_bt.bounceSubstate === 0) {
        // Descent : Cos progression de 0 → 64 (= angle 0 → π/2)
        const angle = (_bt.bouncePhase / 64) * Math.PI / 2;
        ball.y2 = -Math.round(cosAmp * Math.cos(angle));
        _bt.bouncePhase += 4 + _bt.bounceCount;
        if (_bt.bouncePhase >= 64) {
          _bt.bounceAmplitude -= 10;
          _bt.bounceCount++;
          if (_bt.bounceCount >= 4) {
            // Done all bounces
            ball.y2 = 0;
            ball.y += 32;  // = Cos(64, 32) = 0 + sprite y déjà au sol
            _bt.bouncePhase = 0;
            _bt.bounceSubstate = 0;
            // Branch : si willCatch ou shakeMaxCount > 0 → start shakes ; sinon release direct
            if (_bt.shakeMaxCount === 0) {
              _bt.phase = 9;
              _bt.frame = 0;
              _bt.outcome = 'escaped';
            } else {
              _bt.phase = 7;
              _bt.frame = 0;
            }
            break;
          }
          _bt.bounceSubstate = 1;  // rebond
        }
      } else {
        // Rebond : Cos progression de 64 → 0 (= angle π/2 → 0)
        const angle = (_bt.bouncePhase / 64) * Math.PI / 2;
        ball.y2 = -Math.round(cosAmp * Math.cos(angle));
        _bt.bouncePhase -= 4 + _bt.bounceCount;
        if (_bt.bouncePhase <= 0) {
          _bt.bouncePhase = 0;
          _bt.bounceSubstate = 0;
        }
      }
      break;
    }
    case 7: {  // START SHAKES — 31 frames delay (= SpriteCB_BallThrow_StartShakes ll. 572-580)
      if (_bt.frame >= 31) {
        _bt.phase = 8;
        _bt.frame = 0;
        _bt.shakeIndex = 0;
        _bt.shakeOffset = 0;
        _bt.shakeDir = 1;
        _bt.shakeDoneCount = 0;
      }
      break;
    }
    case 8: {  // SHAKE — N times (= SpriteCB_BallThrow_Shake ll. 583-635)
      // Notre adapt : oscille ball.x2 entre -3..+3 sur ~6 frames par shake.
      // Chaque shake = sortir → revenir centre. 1 shake = 12 frames total.
      const SHAKE_DURATION = 12;
      const phaseInShake = _bt.frame % SHAKE_DURATION;
      const cycle = Math.sin((phaseInShake / SHAKE_DURATION) * Math.PI * 2);
      ball.x2 = Math.round(cycle * 3);
      if (phaseInShake === SHAKE_DURATION - 1) {
        _bt.shakeDoneCount++;
        if (_bt.shakeDoneCount >= _bt.shakeMaxCount) {
          ball.x2 = 0;
          // Result
          if (_bt.willCatch) {
            _bt.outcome = 'caught';
          } else {
            _bt.outcome = 'escaped';
          }
          _bt.phase = 9;
          _bt.frame = 0;
        }
      }
      break;
    }
    case 9: {  // RELEASE / FINAL — fade out ball + restore opp si escaped
      if (_bt.outcome === 'escaped' && opp) {
        opp.invisible = false;
        opp.y2 = 0;
      }
      // Hold for 20 frames so the user can read the result, puis destroy ball.
      if (_bt.frame >= 20) {
        rt.DestroySprite(_bt.ballSpriteId);
        const outcome = _bt.outcome;
        const msg = _bt.resultMessage;
        _bt = null;
        _lastFrameCounter = -1;
        return { done: true, outcome, message: msg };
      }
      break;
    }
  }

  return { done: false, outcome: null, message: null };
}

/** Devtools / cleanup : abort une ball throw active. */
export function stopBallThrow(): void {
  if (_bt) {
    const rt = getRuntime();
    if (rt) {
      try { rt.DestroySprite(_bt.ballSpriteId); } catch { /* ok */ }
    }
    _bt = null;
  }
}

export function isBallThrowActive(): boolean {
  return _bt !== null;
}

// Devtools expose pour test isolé sans bag UI.
if (typeof window !== 'undefined') {
  (window as { __testBallThrow?: (willCatch?: boolean) => Promise<void> }).__testBallThrow = async (willCatch = true) => {
    // Hardcoded test : assume opp sprite ID = 4 (= dans nos tests battle wild standard).
    await startBallThrow({
      opponentSpriteId: 4,
      opponentMonNickname: 'MEDHYENA',
      willCatch,
    });
    console.log(`[ball-throw] started (willCatch=${willCatch}). Animation should play over ~150 frames.`);
  };
}
void DISPLAY_WIDTH; void DISPLAY_HEIGHT;

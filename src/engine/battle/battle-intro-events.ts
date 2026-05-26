/**
 * battle/battle-intro-events.ts — Wire 1:1 strict des events INTRO vers
 * les modules visuels (= battle-intro.ts, battle-ball-throw.ts).
 *
 * Source de vérité (côté décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` —
 *     EmitIntroSlide + EmitIntroTrainerBallThrow + EmitDrawTrainerPic +
 *     EmitLoadMonSprite.
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controller_opponent.c` +
 *     `src/battle_controller_player.c` — consumer côté controller qui
 *     handle ces events.
 *
 * Mécanique :
 *   - K8 BattleIntro*SendsOutMonAnimation appelle BtlController_EmitX → enqueue
 *     event dans gBattleEventQueue.
 *   - Notre wire consumeBattleIntroEvents drain ces events et trigger les
 *     animations visuelles correspondantes (= startBallThrow, startBattleIntroSlide).
 *
 * Le drainage est appelé par battle-flow.ts dans les états INTRO_TEXT /
 * BATTLE_INTRO_SLIDE pour processer les events queue + maintenir flag
 * `gBattleControllerExecFlags` (= bloque jusqu'à animation complete).
 */

import {
  CONTROLLER_INTROSLIDE, CONTROLLER_INTROTRAINERBALLTHROW,
  CONTROLLER_DRAWTRAINERPIC, CONTROLLER_LOADMONSPRITE,
  dequeueBattleEvent, peekBattleEvent, getBattleEventQueueSize,
  type BattleEvent,
} from './battle-event-queue';
import { clearBattlerExecFlag } from './battle-controllers';

// ─── Animation hooks (= wired by caller from battle-flow) ──────────────────

interface IntroAnimHooks {
  /** Start ball throw → caller drives via tickBallThrow. */
  startBallThrow?: (battler: number) => void;
  /** Start trainer pic loading + display. */
  drawTrainerPic?: (battler: number) => void;
  /** Load mon sprite gfx + display. */
  loadMonSprite?: (battler: number) => void;
  /** Start intro slide BG (= WIN0V split). */
  startIntroSlide?: (terrainId: number) => void;
}

let _hooks: IntroAnimHooks = {};

/** Wire hooks pour drive les animations depuis battle-flow.ts. */
export function setIntroAnimHooks(hooks: IntroAnimHooks): void {
  _hooks = { ..._hooks, ...hooks };
}

// ─── consumeBattleIntroEvents — drain + dispatch ───────────────────────────

/** Drain les events INTRO de la queue et trigger les animations.
 *  Retourne le nombre d'events processés ce tick (= debug). */
export function consumeBattleIntroEvents(): number {
  let processed = 0;
  while (getBattleEventQueueSize() > 0) {
    const event = peekBattleEvent();
    if (!event) break;
    // Filter : on consume seulement les events INTRO connus. Les autres
    // restent en queue pour les consumers spécifiques (= move anim, etc.).
    if (!_isIntroEvent(event)) break;

    dequeueBattleEvent();
    _dispatchIntroEvent(event);
    processed++;
  }
  return processed;
}

function _isIntroEvent(event: BattleEvent): boolean {
  const t = (event as { type: number }).type;
  return t === CONTROLLER_INTROSLIDE
      || t === CONTROLLER_INTROTRAINERBALLTHROW
      || t === CONTROLLER_DRAWTRAINERPIC
      || t === CONTROLLER_LOADMONSPRITE;
}

function _dispatchIntroEvent(event: BattleEvent): void {
  const t = (event as { type: number }).type;
  const battler = (event as { battler?: number }).battler ?? 0;

  switch (t) {
    case CONTROLLER_INTROSLIDE: {
      const terrainId = (event as { terrainId?: number }).terrainId ?? 0;
      _hooks.startIntroSlide?.(terrainId);
      // 1:1 décomp : controller sets exec flag, then clears on completion.
      // Notre wire : clear immediate ; battle-flow.ts attend la fin de l'anim
      // via tickBattleIntroSlide.
      clearBattlerExecFlag(battler);
      break;
    }
    case CONTROLLER_INTROTRAINERBALLTHROW: {
      _hooks.startBallThrow?.(battler);
      clearBattlerExecFlag(battler);
      break;
    }
    case CONTROLLER_DRAWTRAINERPIC: {
      _hooks.drawTrainerPic?.(battler);
      clearBattlerExecFlag(battler);
      break;
    }
    case CONTROLLER_LOADMONSPRITE: {
      _hooks.loadMonSprite?.(battler);
      clearBattlerExecFlag(battler);
      break;
    }
    default:
      // Non-intro event : skip (= ne devrait pas arriver vu _isIntroEvent filter).
      break;
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleIntroEvents = {
  consumeBattleIntroEvents,
  setIntroAnimHooks,
};

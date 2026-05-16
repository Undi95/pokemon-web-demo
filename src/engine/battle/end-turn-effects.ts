/**
 * battle/end-turn-effects.ts — 1:1 décomp `DoFieldEndTurnEffects` (battle_util.c:1168-1421)
 * + `DoBattlerEndTurnEffects` (battle_util.c:1447-2200, partial port).
 *
 * Architecture 1:1 strict :
 *   - `DoFieldEndTurnEffects()` : iterate ENDTURN_X state machine via
 *     gBattleStruct.turnCountersTracker + turnSideTracker. Retourne le script
 *     label à exec OU null si fini. Caller (= turn loop) exec le label
 *     synchronously via runBattleScript, puis re-call jusqu'à null.
 *   - `DoBattlerEndTurnEffects()` : (Phase 1.4 L extension) per-battler effects
 *     (FutureSight trigger, PerishSong, Ingrain, Leech Seed, Poison/Burn tick,
 *     Wrap, Curse, Nightmare, Yawn, etc.).
 *
 * Note : Le décomp utilise `BattleScriptExecute(ptr)` qui set
 * gBattlescriptCurrInstr et push gBattleMainFunc à callback stack. Notre port
 * retourne le label, le caller exec via runBattleScript (= sync run jusqu'à
 * `end` opcode).
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:1153-2200`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/battle_string_ids.h:445-451`
 */

import {
  gBattleStruct, gAbsentBattlerFlags, gBattlersCount,
  gSideTimers, gSideStatuses, gWishFutureKnock,
  gBattleMons, gBattleWeather, setBattleWeather,
  setBattlerAttacker, setBattlerTarget, setActiveBattler,
  gBattleCommunication, gBattleScripting,
  gBattlerByTurnOrder,
} from './state';
import {
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN_PERMANENT,
  B_WEATHER_RAIN_DOWNPOUR,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_TEMPORARY, B_WEATHER_SANDSTORM_PERMANENT,
  B_WEATHER_SUN, B_WEATHER_SUN_TEMPORARY, B_WEATHER_SUN_PERMANENT,
  B_WEATHER_HAIL, B_WEATHER_HAIL_TEMPORARY,
  SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN, SIDE_STATUS_MIST, SIDE_STATUS_SAFEGUARD,
  MULTISTRING_CHOOSER,
} from './constants';
import { gBitTable } from './battle-controllers';
import { gBattleTextBuff1, PREPARE_MOVE_BUFFER } from './text-buffers';
import {
  MOVE_REFLECT, MOVE_LIGHT_SCREEN, MOVE_MIST,
} from '../decomp-data/auto/include/constants/moves-data';

// 1:1 décomp battle_string_ids.h:445-447 + 450-451.
const B_MSG_RAIN_CONTINUES = 0;
const B_MSG_DOWNPOUR_CONTINUES = 1;
const B_MSG_RAIN_STOPPED = 2;
const B_MSG_SANDSTORM = 0;
const B_MSG_HAIL = 1;

// 1:1 décomp `B_ANIM_SANDSTORM_CONTINUES = 12, B_ANIM_HAIL_CONTINUES = 13`
// (auto-data battle_anim-data.ts).
const B_ANIM_SANDSTORM_CONTINUES = 12;
const B_ANIM_HAIL_CONTINUES = 13;

// 1:1 décomp battle_util.c:1153-1166 — ENDTURN_X enum.
const ENDTURN_ORDER         = 0;
const ENDTURN_REFLECT       = 1;
const ENDTURN_LIGHT_SCREEN  = 2;
const ENDTURN_MIST          = 3;
const ENDTURN_SAFEGUARD     = 4;
const ENDTURN_WISH          = 5;
const ENDTURN_RAIN          = 6;
const ENDTURN_SANDSTORM     = 7;
const ENDTURN_SUN           = 8;
const ENDTURN_HAIL          = 9;
const ENDTURN_FIELD_COUNT   = 10;

/** Résultat d'un appel à `DoFieldEndTurnEffects` :
 *  - `null` : fini (= tous les ENDTURN_X consumés), turn loop peut avancer
 *  - `{ scriptLabel }` : script à exec, puis re-call DoFieldEndTurnEffects */
export type EndTurnFieldResult = null | { scriptLabel: string };

/** 1:1 décomp `GetWhoStrikesFirst(battler1, battler2, ignoreChosenMoves)`
 *  (battle_util.c). Stub : retourne battler avec plus high speed.
 *  Phase 1.4 L extension : full port avec Trick Room / Quick Claw / etc. */
function _GetWhoStrikesFirst(b1: number, b2: number, _ignoreChosen: boolean): boolean {
  // Retourne TRUE si b2 strikes first (= mon1 needs swap).
  const s1 = gBattleMons[b1]?.speed ?? 0;
  const s2 = gBattleMons[b2]?.speed ?? 0;
  return s2 > s1;
}

/** 1:1 décomp `SwapTurnOrder(i, j)` (battle_util.c). */
function _SwapTurnOrder(i: number, j: number): void {
  const tmp = gBattlerByTurnOrder[i];
  gBattlerByTurnOrder[i] = gBattlerByTurnOrder[j];
  gBattlerByTurnOrder[j] = tmp;
}

/** 1:1 décomp `DoFieldEndTurnEffects()` (battle_util.c:1168-1421).
 *
 *  Process : iterate ENDTURN_X cases via gBattleStruct.turnCountersTracker
 *  jusqu'à trouver un effect (= script à exec) OU finish (= ENDTURN_FIELD_COUNT).
 *
 *  Retourne :
 *    - null : tous les ENDTURN_X consumés, turn loop peut avancer
 *    - { scriptLabel } : caller doit exec le script puis re-call.
 *
 *  Pour caller : `let r; while (r = DoFieldEndTurnEffects()) runBattleScript(r.scriptLabel);` */
export function DoFieldEndTurnEffects(): EndTurnFieldResult {
  // 1:1 décomp battle_util.c:1173-1178 : init gBattlerAttacker/Target au premier
  // battler non-absent.
  let attacker = 0;
  while (attacker < gBattlersCount && (gAbsentBattlerFlags & gBitTable[attacker])) {
    attacker++;
  }
  setBattlerAttacker(attacker);
  let target = 0;
  while (target < gBattlersCount && (gAbsentBattlerFlags & gBitTable[target])) {
    target++;
  }
  setBattlerTarget(target);

  // 1:1 décomp `do { ... } while (effect == 0);` — loop jusqu'à effect found.
  let safety = 0;
  while (safety++ < 50) {
    let effect = 0;
    let scriptLabel: string | null = null;

    switch (gBattleStruct.turnCountersTracker) {
      case ENDTURN_ORDER: {
        // 1:1 décomp ll. 1186-1206 : init gBattlerByTurnOrder + speed sort + fallthrough.
        for (let i = 0; i < gBattlersCount; i++) {
          gBattlerByTurnOrder[i] = i;
        }
        for (let i = 0; i < gBattlersCount - 1; i++) {
          for (let j = i + 1; j < gBattlersCount; j++) {
            if (_GetWhoStrikesFirst(gBattlerByTurnOrder[i], gBattlerByTurnOrder[j], false)) {
              _SwapTurnOrder(i, j);
            }
          }
        }
        gBattleStruct.turnCountersTracker++;
        gBattleStruct.turnSideTracker = 0;
        // fall through (= continue do-while, switch sera ENDTURN_REFLECT au prochain iter).
        continue;
      }

      case ENDTURN_REFLECT: {
        // 1:1 décomp ll. 1208-1232.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].reflectBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_REFLECT) {
            if (--gSideTimers[side].reflectTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_REFLECT;
              PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_REFLECT);
              scriptLabel = 'BattleScript_SideStatusWoreOff';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_LIGHT_SCREEN: {
        // 1:1 décomp ll. 1233-1258.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].lightscreenBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_LIGHTSCREEN) {
            if (--gSideTimers[side].lightscreenTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_LIGHTSCREEN;
              gBattleCommunication[MULTISTRING_CHOOSER] = side;
              PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_LIGHT_SCREEN);
              scriptLabel = 'BattleScript_SideStatusWoreOff';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_MIST: {
        // 1:1 décomp ll. 1259-1281.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].mistBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideTimers[side].mistTimer !== 0 && --gSideTimers[side].mistTimer === 0) {
            gSideStatuses[side] &= ~SIDE_STATUS_MIST;
            gBattleCommunication[MULTISTRING_CHOOSER] = side;
            PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_MIST);
            scriptLabel = 'BattleScript_SideStatusWoreOff';
            effect++;
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_SAFEGUARD: {
        // 1:1 décomp ll. 1282-1305.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].safeguardBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_SAFEGUARD) {
            if (--gSideTimers[side].safeguardTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_SAFEGUARD;
              scriptLabel = 'BattleScript_SafeguardEnds';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_WISH: {
        // 1:1 décomp ll. 1306-1326.
        while (gBattleStruct.turnSideTracker < gBattlersCount) {
          const active = gBattlerByTurnOrder[gBattleStruct.turnSideTracker];
          setActiveBattler(active);
          if (gWishFutureKnock.wishCounter[active] !== 0
              && --gWishFutureKnock.wishCounter[active] === 0
              && gBattleMons[active].hp !== 0) {
            setBattlerTarget(active);
            scriptLabel = 'BattleScript_WishComesTrue';
            effect++;
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
        }
        break;
      }

      case ENDTURN_RAIN: {
        // 1:1 décomp ll. 1327-1356.
        if (gBattleWeather & B_WEATHER_RAIN) {
          if (!(gBattleWeather & B_WEATHER_RAIN_PERMANENT)) {
            if (--gWishFutureKnock.weatherDuration === 0) {
              setBattleWeather(gBattleWeather & ~B_WEATHER_RAIN_TEMPORARY & ~B_WEATHER_RAIN_DOWNPOUR);
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_STOPPED;
            } else if (gBattleWeather & B_WEATHER_RAIN_DOWNPOUR) {
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DOWNPOUR_CONTINUES;
            } else {
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_CONTINUES;
            }
          } else if (gBattleWeather & B_WEATHER_RAIN_DOWNPOUR) {
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DOWNPOUR_CONTINUES;
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_CONTINUES;
          }
          scriptLabel = 'BattleScript_RainContinuesOrEnds';
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_SANDSTORM: {
        // 1:1 décomp ll. 1357-1376.
        if (gBattleWeather & B_WEATHER_SANDSTORM) {
          if (!(gBattleWeather & B_WEATHER_SANDSTORM_PERMANENT)
              && --gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_SANDSTORM_TEMPORARY);
            scriptLabel = 'BattleScript_SandStormHailEnds';
          } else {
            scriptLabel = 'BattleScript_DamagingWeatherContinues';
          }
          gBattleScripting.animArg1 = B_ANIM_SANDSTORM_CONTINUES;
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SANDSTORM;
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_SUN: {
        // 1:1 décomp ll. 1377-1394.
        if (gBattleWeather & B_WEATHER_SUN) {
          if (!(gBattleWeather & B_WEATHER_SUN_PERMANENT)
              && --gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_SUN_TEMPORARY);
            scriptLabel = 'BattleScript_SunlightFaded';
          } else {
            scriptLabel = 'BattleScript_SunlightContinues';
          }
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_HAIL: {
        // 1:1 décomp ll. 1395-1414.
        if (gBattleWeather & B_WEATHER_HAIL) {
          if (--gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_HAIL_TEMPORARY);
            scriptLabel = 'BattleScript_SandStormHailEnds';
          } else {
            scriptLabel = 'BattleScript_DamagingWeatherContinues';
          }
          gBattleScripting.animArg1 = B_ANIM_HAIL_CONTINUES;
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_HAIL;
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_FIELD_COUNT: {
        // 1:1 décomp ll. 1415-1417 : finish marker.
        effect++;
        // Return null pour signaler que la field phase est terminée.
        // (Décomp retourne `gBattleMainFunc != BattleTurnPassed` ce qui est TRUE
        // si tous les effects ont été processés. Nous : null = done.)
        return null;
      }

      default:
        // Sécurité : reset et fini.
        gBattleStruct.turnCountersTracker = 0;
        gBattleStruct.turnSideTracker = 0;
        return null;
    }

    // Si on a un script label, retourne-le pour exec par le caller.
    if (scriptLabel) return { scriptLabel };
    // Sinon (= effect = 0 ET pas de label), continue do-while pour next case.
  }
  // Safety bailout (= ne devrait pas arriver).
  return null;
}

/** Reset le state machine `DoFieldEndTurnEffects` au début d'un nouveau turn.
 *  Appelé par turn loop avant de lancer la phase end-of-turn. */
export function resetFieldEndTurnEffectsState(): void {
  gBattleStruct.turnCountersTracker = 0;
  gBattleStruct.turnSideTracker = 0;
}


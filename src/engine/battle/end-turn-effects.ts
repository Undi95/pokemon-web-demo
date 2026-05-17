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
  gBattlerByTurnOrder, gBattleTypeFlags,
} from './state';
import {
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN_PERMANENT,
  B_WEATHER_RAIN_DOWNPOUR,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_TEMPORARY, B_WEATHER_SANDSTORM_PERMANENT,
  B_WEATHER_SUN, B_WEATHER_SUN_TEMPORARY, B_WEATHER_SUN_PERMANENT,
  B_WEATHER_HAIL, B_WEATHER_HAIL_TEMPORARY,
  SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN, SIDE_STATUS_MIST, SIDE_STATUS_SAFEGUARD,
  MULTISTRING_CHOOSER, BATTLE_TYPE_ARENA,
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

// ─── DoBattlerEndTurnEffects (battle_util.c:1447-1766) ─────────────────────

// 1:1 décomp battle_util.c:1423-1445 — ENDTURN_X per-battler enum.
const ENDTURN_INGRAIN     = 0;
const ENDTURN_ABILITIES   = 1;
const ENDTURN_ITEMS1      = 2;
const ENDTURN_LEECH_SEED  = 3;
const ENDTURN_POISON      = 4;
const ENDTURN_BAD_POISON  = 5;
const ENDTURN_BURN        = 6;
const ENDTURN_NIGHTMARES  = 7;
const ENDTURN_CURSE       = 8;
const ENDTURN_WRAP        = 9;
const ENDTURN_UPROAR      = 10;
const ENDTURN_THRASH      = 11;
const ENDTURN_DISABLE     = 12;
const ENDTURN_ENCORE      = 13;
const ENDTURN_LOCK_ON     = 14;
const ENDTURN_CHARGE      = 15;
const ENDTURN_TAUNT       = 16;
const ENDTURN_YAWN        = 17;
const ENDTURN_ITEMS2      = 18;
const ENDTURN_BATTLER_COUNT = 19;

// 1:1 décomp battle.h status1/2/3 bit masks. AUDIT BUG FIX : 10+ constantes
// hardcoded étaient FAUSSES (= différentes de constants.ts). Now import direct.
import {
  STATUS1_POISON, STATUS1_BURN, STATUS1_SLEEP, STATUS1_ANY,
  STATUS1_TOXIC_POISON, STATUS1_TOXIC_COUNTER, STATUS1_TOXIC_TURN,
  STATUS2_NIGHTMARE, STATUS2_CURSED, STATUS2_WRAPPED, STATUS2_WRAPPED_TURN,
  STATUS2_LOCK_CONFUSE, STATUS2_LOCK_CONFUSE_TURN, STATUS2_MULTIPLETURNS,
  STATUS2_CONFUSION, STATUS2_UPROAR, STATUS2_UPROAR_TURN,
  STATUS3_ROOTED, STATUS3_LEECHSEED, STATUS3_LEECHSEED_BATTLER,
  STATUS3_ALWAYS_HITS, STATUS3_ALWAYS_HITS_TURN, STATUS3_CHARGED_UP,
  STATUS3_YAWN, STATUS3_YAWN_TURN, STATUS3_PERISH_SONG,
} from './constants';

// gStatuses3 + autres globals (= lazy via globalThis pour éviter circular deps).
import { gStatuses3, gHitMarker, setHitMarker, gDisableStructs, gBattleMoveDamage, setBattleMoveDamage, gSpecialStatuses, gBattlerAttacker } from './state';
import { AbilityBattleEffects, ABILITYEFFECT_ENDTURN, consumeAbilityWantedScript } from './ability-battle-effects';
import { ItemBattleEffects, ITEMEFFECT_NORMAL, consumeItemWantedScript } from './item-battle-effects';
// 1:1 décomp battle.h:182, 201.
// AUDIT BUG FIX : était 1<<13 / 1<<12 (= faux, jamais set/clear correct bit).
const HITMARKER_GRUDGE        = 1 << 24;
const HITMARKER_IGNORE_BIDE   = 1 << 5;

/** Type étendu pour DoBattlerEndTurnEffects : retourne `null` si fini,
 *  `{ scriptLabel }` pour exec script, ou `{ scriptLabel, retVal: 2 }` pour
 *  signaler le special case UPROAR (= ne pas incrementer turnEffectsTracker). */
export type EndTurnBattlerResult = null | { scriptLabel: string; uproarWoke?: boolean };

/** Stub `UproarWakeUpCheck(battler)` — Phase 1.4 L extension. */
function _UproarWakeUpCheck(_battler: number): boolean {
  // 1:1 décomp battle_util.c — check si STATUS2_UPROAR actif sur un autre battler
  // qui n'a pas Soundproof. Retourne TRUE si oui (= bloque le sleep).
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleMons[i].status2 & STATUS2_UPROAR) return true;
  }
  return false;
}

/** 1:1 décomp `WasUnableToUseMove(battler)` (battle_util.c:877-891). */
function _WasUnableToUseMoveETT(battler: number): boolean {
  const p = gProtectStructsImport[battler];
  if (!p) return false;
  return Boolean(
    p.prlzImmobility || p.targetNotAffected || p.usedImprisonedMove
    || p.loveImmobility || p.usedDisabledMove || p.usedTauntedMove
    || p.flag2Unknown || p.flinchImmobility || p.confusionSelfDmg
  );
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875). */
function _CancelMultiTurnMovesETT(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~0x00100000 /* STATUS2_BIDE */;
  gStatuses3[battler] &= ~STATUS3_ROOTED;
  gStatuses3[battler] &= ~0x10 /* STATUS3_SEMI_INVULNERABLE proxy */;
}

import { gProtectStructs as gProtectStructsImport } from './state';

/** 1:1 décomp `DoBattlerEndTurnEffects()` (battle_util.c:1447-1766).
 *  Per-battler end-of-turn state machine. Iterate gBattlerByTurnOrder ×
 *  ENDTURN_BATTLER_COUNT cases jusqu'à trouver un effect (= script à exec).
 *
 *  Retourne :
 *    - null : tous les battler×effect consumés, fini
 *    - { scriptLabel } : script à exec puis re-call
 *    - { scriptLabel, uproarWoke: true } : UPROAR case spécial (= ne pas
 *      incrementer tracker, re-iter sur même battler/case). */
export function DoBattlerEndTurnEffects(): EndTurnBattlerResult {
  // 1:1 décomp ll. 1451 : set marker GRUDGE + IGNORE_BIDE pour le tour entier.
  setHitMarker(gHitMarker | HITMARKER_GRUDGE | HITMARKER_IGNORE_BIDE);

  let safety = 0;
  while (safety++ < 500) {
    if (gBattleStruct.turnEffectsBattlerId >= gBattlersCount
        || gBattleStruct.turnEffectsTracker > ENDTURN_BATTLER_COUNT) {
      // 1:1 décomp ll. 1764-1765 : clear markers + return 0.
      setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
      return null;
    }

    const active = gBattlerByTurnOrder[gBattleStruct.turnEffectsBattlerId];
    setActiveBattler(active);
    setBattlerAttacker(active);

    if (gAbsentBattlerFlags & gBitTable[active]) {
      gBattleStruct.turnEffectsBattlerId++;
      continue;
    }

    let effect = 0;
    let scriptLabel: string | null = null;

    switch (gBattleStruct.turnEffectsTracker) {
      case ENDTURN_INGRAIN: {
        if ((gStatuses3[active] & STATUS3_ROOTED)
            && gBattleMons[active].hp !== gBattleMons[active].maxHP
            && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 16);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(-dmg);
          scriptLabel = 'BattleScript_IngrainTurnHeal';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ABILITIES: {
        // 1:1 décomp battle_util.c:1477-1481 — delegate à
        // AbilityBattleEffects(ABILITYEFFECT_ENDTURN, gActiveBattler, 0, 0, 0).
        const e = AbilityBattleEffects(ABILITYEFFECT_ENDTURN, active, 0, 0, 0);
        if (e !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ITEMS1: {
        // 1:1 décomp battle_util.c:1483-1487 — delegate à
        // ItemBattleEffects(ITEMEFFECT_NORMAL, gActiveBattler, FALSE).
        const e = ItemBattleEffects(ITEMEFFECT_NORMAL, active, false);
        if (e !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ITEMS2: {
        // 1:1 décomp battle_util.c:1751-1754 — delegate à
        // ItemBattleEffects(ITEMEFFECT_NORMAL, gActiveBattler, TRUE).
        const e = ItemBattleEffects(ITEMEFFECT_NORMAL, active, true);
        if (e !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_LEECH_SEED: {
        if ((gStatuses3[active] & STATUS3_LEECHSEED)
            && gBattleMons[gStatuses3[active] & STATUS3_LEECHSEED_BATTLER].hp !== 0
            && gBattleMons[active].hp !== 0) {
          const receiver = gStatuses3[active] & STATUS3_LEECHSEED_BATTLER;
          setBattlerTarget(receiver);
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          gBattleScripting.animArg1 = receiver;
          gBattleScripting.animArg2 = gBattlerAttacker;
          scriptLabel = 'BattleScript_LeechSeedTurnDrain';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_POISON: {
        if ((gBattleMons[active].status1 & STATUS1_POISON) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_PoisonTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BAD_POISON: {
        if ((gBattleMons[active].status1 & STATUS1_TOXIC_POISON) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 16);
          if (dmg === 0) dmg = 1;
          // 1:1 décomp : increment toxic counter unless == 15.
          if ((gBattleMons[active].status1 & STATUS1_TOXIC_COUNTER) !== STATUS1_TOXIC_TURN(15)) {
            gBattleMons[active].status1 += STATUS1_TOXIC_TURN(1);
          }
          dmg *= (gBattleMons[active].status1 & STATUS1_TOXIC_COUNTER) >> 8;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_PoisonTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BURN: {
        if ((gBattleMons[active].status1 & STATUS1_BURN) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_BurnTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_NIGHTMARES: {
        if ((gBattleMons[active].status2 & STATUS2_NIGHTMARE) && gBattleMons[active].hp !== 0) {
          if (gBattleMons[active].status1 & STATUS1_SLEEP) {
            let dmg = Math.floor(gBattleMons[active].maxHP / 4);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
            scriptLabel = 'BattleScript_NightmareTurnDmg';
            effect++;
          } else {
            // 1:1 décomp : R/S bug fix — clear nightmare if awake.
            gBattleMons[active].status2 &= ~STATUS2_NIGHTMARE;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_CURSE: {
        if ((gBattleMons[active].status2 & STATUS2_CURSED) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 4);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_CurseTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_WRAP: {
        if ((gBattleMons[active].status2 & STATUS2_WRAPPED) && gBattleMons[active].hp !== 0) {
          gBattleMons[active].status2 -= STATUS2_WRAPPED_TURN(1);
          const wrapMoveLow = gBattleStruct.wrappedMove[active * 2 + 0];
          const wrapMoveHigh = gBattleStruct.wrappedMove[active * 2 + 1];
          if (gBattleMons[active].status2 & STATUS2_WRAPPED) {
            // Still wrapped, damage.
            gBattleScripting.animArg1 = wrapMoveLow;
            gBattleScripting.animArg2 = wrapMoveHigh;
            gBattleTextBuff1[0] = 0xFD /* B_BUFF_PLACEHOLDER_BEGIN */;
            gBattleTextBuff1[1] = 2 /* B_BUFF_MOVE */;
            gBattleTextBuff1[2] = wrapMoveLow;
            gBattleTextBuff1[3] = wrapMoveHigh;
            gBattleTextBuff1[4] = 0xFF /* EOS */;
            scriptLabel = 'BattleScript_WrapTurnDmg';
            let dmg = Math.floor(gBattleMons[active].maxHP / 16);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
          } else {
            // Broke free.
            gBattleTextBuff1[0] = 0xFD;
            gBattleTextBuff1[1] = 2;
            gBattleTextBuff1[2] = wrapMoveLow;
            gBattleTextBuff1[3] = wrapMoveHigh;
            gBattleTextBuff1[4] = 0xFF;
            scriptLabel = 'BattleScript_WrapEnds';
          }
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_UPROAR: {
        // 1:1 décomp ll. 1608-1656 : Uproar — wake up sleeping mons + countdown.
        if (gBattleMons[active].status2 & STATUS2_UPROAR) {
          // Step 1 : check if any battler is sleeping (and not Soundproof) → wake.
          let wokeBattler = -1;
          for (let b = 0; b < gBattlersCount; b++) {
            if ((gBattleMons[b].status1 & STATUS1_SLEEP)
                && gBattleMons[b].ability !== 43 /* ABILITY_SOUNDPROOF */) {
              gBattleMons[b].status1 &= ~STATUS1_SLEEP;
              gBattleMons[b].status2 &= ~STATUS2_NIGHTMARE;
              gBattleCommunication[MULTISTRING_CHOOSER] = 1;
              wokeBattler = b;
              break;
            }
          }
          if (wokeBattler !== -1) {
            // 1:1 décomp : exec MonWokeUpInUproar + ne pas incrementer tracker (= retry case).
            scriptLabel = 'BattleScript_MonWokeUpInUproar';
            // gBattleStruct.turnEffectsTracker reste pareil → re-iter UPROAR au next call.
            return { scriptLabel, uproarWoke: true };
          }
          // Step 2 : décrement timer.
          gBattleMons[active].status2 -= STATUS2_UPROAR_TURN(1);
          if (_WasUnableToUseMoveETT(active)) {
            _CancelMultiTurnMovesETT(active);
            gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_UPROAR_ENDS */;
          } else if (gBattleMons[active].status2 & STATUS2_UPROAR) {
            gBattleCommunication[MULTISTRING_CHOOSER] = 0 /* B_MSG_UPROAR_CONTINUES */;
            gBattleMons[active].status2 |= STATUS2_MULTIPLETURNS;
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_UPROAR_ENDS */;
            _CancelMultiTurnMovesETT(active);
          }
          scriptLabel = 'BattleScript_PrintUproarOverTurns';
          effect = 1;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_THRASH: {
        if (gBattleMons[active].status2 & STATUS2_LOCK_CONFUSE) {
          gBattleMons[active].status2 -= STATUS2_LOCK_CONFUSE_TURN(1);
          if (_WasUnableToUseMoveETT(active)) {
            _CancelMultiTurnMovesETT(active);
          } else if (!(gBattleMons[active].status2 & STATUS2_LOCK_CONFUSE)
                     && (gBattleMons[active].status2 & STATUS2_MULTIPLETURNS)) {
            gBattleMons[active].status2 &= ~STATUS2_MULTIPLETURNS;
            if (!(gBattleMons[active].status2 & STATUS2_CONFUSION)) {
              // 1:1 décomp battle_util.c:1669-1672 + battle_script_commands.c:2533-2546.
              // SetMoveEffect(TRUE, 0) avec MOVE_EFFECT_CONFUSION → apply inline :
              // - Si ability OWN_TEMPO ou déjà CONFUSION : skip.
              // - Sinon : status2 |= CONFUSION_TURN((Random()%4)+2) = 2-5 turns bits 0-2.
              const ABILITY_OWN_TEMPO = 20;
              if (gBattleMons[active].ability !== ABILITY_OWN_TEMPO) {
                const confTurns = ((Math.floor(Math.random() * 0x10000) % 4) + 2);
                gBattleMons[active].status2 |= confTurns; // bits 0-2.
                if (gBattleMons[active].status2 & STATUS2_CONFUSION) {
                  scriptLabel = 'BattleScript_ThrashConfuses';
                  effect++;
                }
              }
            }
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_DISABLE: {
        if (gDisableStructs[active].disableTimer !== 0) {
          let i = 0;
          for (; i < 4 /* MAX_MON_MOVES */; i++) {
            if (gDisableStructs[active].disabledMove === gBattleMons[active].moves[i]) break;
          }
          if (i === 4) {
            // Mon no longer has the disabled move.
            gDisableStructs[active].disabledMove = 0 /* MOVE_NONE */;
            gDisableStructs[active].disableTimer = 0;
          } else if (--gDisableStructs[active].disableTimer === 0) {
            gDisableStructs[active].disabledMove = 0;
            scriptLabel = 'BattleScript_DisabledNoMore';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ENCORE: {
        if (gDisableStructs[active].encoreTimer !== 0) {
          if (gBattleMons[active].moves[gDisableStructs[active].encoredMovePos]
              !== gDisableStructs[active].encoredMove) {
            gDisableStructs[active].encoredMove = 0;
            gDisableStructs[active].encoreTimer = 0;
          } else if (--gDisableStructs[active].encoreTimer === 0
                     || gBattleMons[active].pp[gDisableStructs[active].encoredMovePos] === 0) {
            gDisableStructs[active].encoredMove = 0;
            gDisableStructs[active].encoreTimer = 0;
            scriptLabel = 'BattleScript_EncoredNoMore';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_LOCK_ON: {
        if (gStatuses3[active] & STATUS3_ALWAYS_HITS) {
          gStatuses3[active] -= STATUS3_ALWAYS_HITS_TURN(1);
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_CHARGE: {
        if (gDisableStructs[active].chargeTimer && --gDisableStructs[active].chargeTimer === 0) {
          gStatuses3[active] &= ~STATUS3_CHARGED_UP;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_TAUNT: {
        if (gDisableStructs[active].tauntTimer) {
          gDisableStructs[active].tauntTimer--;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_YAWN: {
        if (gStatuses3[active] & STATUS3_YAWN) {
          gStatuses3[active] -= STATUS3_YAWN_TURN(1);
          if (!(gStatuses3[active] & STATUS3_YAWN)
              && !(gBattleMons[active].status1 & STATUS1_ANY)
              && gBattleMons[active].ability !== 72 /* ABILITY_VITAL_SPIRIT */
              && gBattleMons[active].ability !== 15 /* ABILITY_INSOMNIA */
              && !_UproarWakeUpCheck(active)) {
            _CancelMultiTurnMovesETT(active);
            // 1:1 décomp : STATUS1_SLEEP_TURN((Random() & 3) + 2) — 2-5 turns sleep.
            const sleepTurns = ((Math.floor(Math.random() * 0x10000) & 3) + 2);
            gBattleMons[active].status1 |= sleepTurns;
            scriptLabel = 'BattleScript_YawnMakesAsleep';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BATTLER_COUNT: {
        // 1:1 décomp ll. 1755-1758 : finish marker — reset tracker + advance battler.
        gBattleStruct.turnEffectsTracker = 0;
        gBattleStruct.turnEffectsBattlerId++;
        break;
      }

      default:
        // Sécurité.
        gBattleStruct.turnEffectsTracker = 0;
        gBattleStruct.turnEffectsBattlerId++;
        break;
    }

    if (effect !== 0 && scriptLabel) {
      return { scriptLabel };
    }
  }
  // Safety bailout.
  setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
  return null;
}

/** Reset le state machine `DoBattlerEndTurnEffects` au début d'un nouveau turn. */
export function resetBattlerEndTurnEffectsState(): void {
  gBattleStruct.turnEffectsTracker = 0;
  gBattleStruct.turnEffectsBattlerId = 0;
}

// ─── HandleWishPerishSongOnTurnEnd (battle_util.c:1768-1872) ───────────────

/** 1:1 décomp `HandleWishPerishSongOnTurnEnd()` (battle_util.c:1768).
 *  3-state machine : FutureSight trigger → PerishSong tick → Arena judgment.
 *
 *  Retourne :
 *    - null : fini, turn loop peut avancer
 *    - { scriptLabel } : exec script puis re-call. */
export function HandleWishPerishSongOnTurnEnd(): EndTurnFieldResult {
  setHitMarker(gHitMarker | HITMARKER_GRUDGE | HITMARKER_IGNORE_BIDE);

  let safety = 0;
  while (safety++ < 50) {
    switch (gBattleStruct.wishPerishSongState) {
      case 0: {
        // 1:1 décomp ll. 1775-1815 : FutureSight / Doom Desire trigger.
        while (gBattleStruct.wishPerishSongBattlerId < gBattlersCount) {
          const active = gBattleStruct.wishPerishSongBattlerId;
          setActiveBattler(active);
          if (gAbsentBattlerFlags & gBitTable[active]) {
            gBattleStruct.wishPerishSongBattlerId++;
            continue;
          }
          gBattleStruct.wishPerishSongBattlerId++;
          if (gWishFutureKnock.futureSightCounter[active] !== 0
              && --gWishFutureKnock.futureSightCounter[active] === 0
              && gBattleMons[active].hp !== 0) {
            // MOVE_FUTURE_SIGHT = 248, MOVE_DOOM_DESIRE = 353 (= magie noir vs lumière).
            const fsMove = gWishFutureKnock.futureSightMove[active];
            const B_MSG_FUTURE_SIGHT = 0;
            const B_MSG_DOOM_DESIRE = 1;
            gBattleCommunication[MULTISTRING_CHOOSER] = (fsMove === 248)
              ? B_MSG_FUTURE_SIGHT : B_MSG_DOOM_DESIRE;
            PREPARE_MOVE_BUFFER(gBattleTextBuff1, fsMove);
            setBattlerTarget(active);
            setBattlerAttacker(gWishFutureKnock.futureSightAttacker[active]);
            setBattleMoveDamage(gWishFutureKnock.futureSightDmg[active]);
            // gSpecialStatuses[target].shellBellDmg = IGNORE_SHELL_BELL (= sentinel
            // qui désactive le drain Shell Bell pour ce hit).
            const IGNORE_SHELL_BELL = -0x80000000;
            gSpecialStatuses[active].shellBellDmg = IGNORE_SHELL_BELL;
            // 1:1 décomp ll. 1802-1806 : si partner aussi à 0 (= double battle),
            // clear SIDE_STATUS_FUTUREATTACK pour le côté target.
            // BATTLE_PARTNER(b) = b ^ 2 (= flip side bit).
            const partner = active ^ 2;
            const SIDE_STATUS_FUTUREATTACK = 1 << 3;
            if (gWishFutureKnock.futureSightCounter[active] === 0
                && (partner >= gBattlersCount
                    || gWishFutureKnock.futureSightCounter[partner] === 0)) {
              const targetSide = active & 1; // GET_BATTLER_SIDE = battler & 1
              gSideStatuses[targetSide] &= ~SIDE_STATUS_FUTUREATTACK;
            }
            return { scriptLabel: 'BattleScript_MonTookFutureAttack' };
          }
        }
        gBattleStruct.wishPerishSongState = 1;
        gBattleStruct.wishPerishSongBattlerId = 0;
        // fall through → continue loop pour case 1.
        continue;
      }

      case 1: {
        // 1:1 décomp ll. 1818-1843 : PerishSong countdown.
        while (gBattleStruct.wishPerishSongBattlerId < gBattlersCount) {
          const active = gBattlerByTurnOrder[gBattleStruct.wishPerishSongBattlerId];
          setActiveBattler(active);
          setBattlerAttacker(active);
          if (gAbsentBattlerFlags & gBitTable[active]) {
            gBattleStruct.wishPerishSongBattlerId++;
            continue;
          }
          gBattleStruct.wishPerishSongBattlerId++;
          if (gStatuses3[active] & STATUS3_PERISH_SONG) {
            // 1:1 décomp : PREPARE_BYTE_NUMBER_BUFFER(gBattleTextBuff1, 1, perishSongTimer).
            gBattleTextBuff1[0] = 0xFD /* B_BUFF_PLACEHOLDER_BEGIN */;
            gBattleTextBuff1[1] = 1 /* B_BUFF_NUMBER */;
            gBattleTextBuff1[2] = 1; // byteCount
            gBattleTextBuff1[3] = 1; // maxDigits
            gBattleTextBuff1[4] = gDisableStructs[active].perishSongTimer;
            gBattleTextBuff1[5] = 0xFF /* EOS */;
            let scriptLabel: string;
            if (gDisableStructs[active].perishSongTimer === 0) {
              gStatuses3[active] &= ~STATUS3_PERISH_SONG;
              setBattleMoveDamage(gBattleMons[active].hp);
              scriptLabel = 'BattleScript_PerishSongTakesLife';
            } else {
              gDisableStructs[active].perishSongTimer--;
              scriptLabel = 'BattleScript_PerishSongCountGoesDown';
            }
            return { scriptLabel };
          }
        }
        gBattleStruct.wishPerishSongState = 2;
        gBattleStruct.wishPerishSongBattlerId = 0;
        continue;
      }

      case 2: {
        // 1:1 décomp ll. 1852-1866 : Arena judgment (= Battle Frontier Arena).
        // Skip pour wild/trainer normal battles (= BATTLE_TYPE_ARENA non set).
        if ((gBattleTypeFlags & BATTLE_TYPE_ARENA)
            && gBattleStruct.arenaTurnCounter === 2
            && gBattleMons[0].hp !== 0 && gBattleMons[1].hp !== 0) {
          // 1:1 décomp ll. 1859-1864 : cancel multi-turn moves + jugement.
          _CancelMultiTurnMovesETT(0);
          _CancelMultiTurnMovesETT(1);
          gBattleStruct.wishPerishSongState++;
          return { scriptLabel: 'BattleScript_ArenaDoJudgment' };
        }
        setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
        return null;
      }

      default:
        setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
        return null;
    }
  }
  setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
  return null;
}

/** Reset le state machine `HandleWishPerishSongOnTurnEnd` au début d'un turn. */
export function resetWishPerishSongState(): void {
  gBattleStruct.wishPerishSongState = 0;
  gBattleStruct.wishPerishSongBattlerId = 0;
}

// Suppress unused warnings.
void gBattleMoveDamage;
void gBattlerAttacker;

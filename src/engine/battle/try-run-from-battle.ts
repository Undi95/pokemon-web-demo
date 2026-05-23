/**
 * battle/try-run-from-battle.ts — 1:1 décomp `TryRunFromBattle(u8 battler)`
 * (battle_util.c:407-485).
 *
 * Décide si le battler arrive à fuir le combat selon :
 *   - Held item HOLD_EFFECT_CAN_ALWAYS_RUN (= Smoke Ball / Float Stone).
 *   - Ability ABILITY_RUN_AWAY (= always succeeds en wild non-Pyramid).
 *   - Frontier/Trainer Hill : auto-success.
 *   - Calcul de chance basé sur speed + runTries (= boost à chaque essai).
 *
 * Retourne true si la fuite réussit (+ set gBattleOutcome = B_OUTCOME_RAN +
 * gCurrentTurnActionNumber = gBattlersCount pour terminer immédiatement).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:407-485`.
 */

import {
  gBattleMons, gBattleStruct,
  gBattleTypeFlags, gBattlersCount,
  setBattleOutcome, setCurrentTurnActionNumber,
  setLastUsedAbility, setLastUsedItem,
  setPotentialItemEffectBattler,
  gProtectStructs,
} from './state';
import {
  ABILITY_RUN_AWAY,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_DOUBLE,
  B_OUTCOME_RAN,
  FLEE_ITEM, FLEE_ABILITY,
  PYRAMID_LOCATION_NONE,
  BATTLE_OPPOSITE,
} from './constants';
import { HOLD_EFFECT_CAN_ALWAYS_RUN } from '../decomp-data/include/constants/hold_effects-data';
import { GetItemHoldEffect } from './data/item-hold-effects';
import { Random } from '../random';

// ─── Stubs externes 1:1 décomp ──────────────────────────────────────────

/** 1:1 décomp `CurrentBattlePyramidLocation()` (battle_pyramid.c). Retourne
 *  PYRAMID_LOCATION_NONE quand on est pas dans la Battle Pyramid (= jamais
 *  pour notre cas tutorial / wild Zigzagton). */
function CurrentBattlePyramidLocation(): number {
  return PYRAMID_LOCATION_NONE;
}

/** 1:1 décomp `GetPyramidRunMultiplier()` (battle_pyramid.c). Multiplicateur
 *  d'escape factor selon la position dans la Pyramid. Return 100 par défaut
 *  (= rare hors Frontier). */
function GetPyramidRunMultiplier(): number {
  return 100;
}

// ─── TryRunFromBattle 1:1 décomp ────────────────────────────────────────

/** 1:1 décomp `TryRunFromBattle(u8 battler)` (battle_util.c:407-485). */
export function TryRunFromBattle(battler: number): boolean {
  let effect = 0;
  let holdEffect: number;
  let pyramidMultiplier: number;
  let speedVar: number;

  // 1:1 décomp ll.414-417 : Enigma Berry test (stub - on assume item normal).
  // if (gBattleMons[battler].item === ITEM_ENIGMA_BERRY)
  //   holdEffect = gEnigmaBerries[battler].holdEffect;
  // else
  holdEffect = GetItemHoldEffect(gBattleMons[battler].item);

  setPotentialItemEffectBattler(battler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) {
    setLastUsedItem(gBattleMons[battler].item);
    gProtectStructs[battler].fleeType = FLEE_ITEM;
    effect++;
  } else if (gBattleMons[battler].ability === ABILITY_RUN_AWAY) {
    if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
      gBattleStruct.runTries++;
      pyramidMultiplier = GetPyramidRunMultiplier();
      speedVar = Math.floor(
        (gBattleMons[battler].speed * pyramidMultiplier) /
        gBattleMons[BATTLE_OPPOSITE(battler)].speed
      ) + (gBattleStruct.runTries * 30);
      if (speedVar > (Random() & 0xFF)) {
        setLastUsedAbility(ABILITY_RUN_AWAY);
        gProtectStructs[battler].fleeType = FLEE_ABILITY;
        effect++;
      }
    } else {
      setLastUsedAbility(ABILITY_RUN_AWAY);
      gProtectStructs[battler].fleeType = FLEE_ABILITY;
      effect++;
    }
  } else if ((gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL))
             && (gBattleTypeFlags & BATTLE_TYPE_TRAINER)) {
    effect++;
  } else {
    if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
      if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
        pyramidMultiplier = GetPyramidRunMultiplier();
        speedVar = Math.floor(
          (gBattleMons[battler].speed * pyramidMultiplier) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else if (gBattleMons[battler].speed < gBattleMons[BATTLE_OPPOSITE(battler)].speed) {
        speedVar = Math.floor(
          (gBattleMons[battler].speed * 128) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else {
        // same speed or faster
        effect++;
      }
    }

    gBattleStruct.runTries++;
  }

  if (effect !== 0) {
    setCurrentTurnActionNumber(gBattlersCount);
    setBattleOutcome(B_OUTCOME_RAN);
  }

  return effect !== 0;
}

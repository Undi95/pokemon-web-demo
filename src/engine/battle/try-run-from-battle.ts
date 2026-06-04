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
  gActiveBattler, gStatuses3, gBattleScripting, gBattleCommunication,
  setBattleOutcome, setCurrentTurnActionNumber,
  setLastUsedAbility, setLastUsedItem,
  setPotentialItemEffectBattler,
  gProtectStructs,
} from './state';
import {
  ABILITY_RUN_AWAY, ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP,
  ABILITY_LEVITATE, ABILITY_MAGNET_PULL,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_FIRST_BATTLE,
  B_OUTCOME_RAN,
  FLEE_ITEM, FLEE_ABILITY,
  PYRAMID_LOCATION_NONE,
  BATTLE_OPPOSITE,
  GET_BATTLER_SIDE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED,
  STATUS3_ROOTED,
  TYPE_FLYING, TYPE_STEEL,
} from './constants';
import { HOLD_EFFECT_CAN_ALWAYS_RUN } from '../decomp-data/include/constants/hold_effects-data';
import { GetItemHoldEffect } from './data/item-hold-effects';
import { Random } from '../system/random';
import { AbilityBattleEffects, ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER } from './ability-battle-effects';

// ─── BATTLE_RUN_* return codes (= constants/battle.h) ──────────────────────

/** 1:1 décomp `BATTLE_RUN_SUCCESS` (= 0). */
export const BATTLE_RUN_SUCCESS = 0;
/** 1:1 décomp `BATTLE_RUN_FORBIDDEN` (= 1). Status (Bind/etc.), First Battle
 *  (= "Don't be a coward!") ; message direct. */
export const BATTLE_RUN_FORBIDDEN = 1;
/** 1:1 décomp `BATTLE_RUN_FAILURE` (= 2). Shadow Tag/Arena Trap/Magnet Pull
 *  block ; message via gBattleCommunication[MULTISTRING_CHOOSER]. */
export const BATTLE_RUN_FAILURE = 2;

/** 1:1 décomp `MULTISTRING_CHOOSER` index dans gBattleCommunication = 5. */
const MULTISTRING_CHOOSER = 5;

/** 1:1 décomp `B_MSG_*` indices (include/constants/battle_string_ids.h:565-569).
 *  Ces valeurs indexent gNoEscapeStringIds[] (battle_message.c:900) :
 *  [0]=CANTESCAPE, [1]=DONTLEAVEBIRCH, [2]=PREVENTSESCAPE. */
const B_MSG_CANT_ESCAPE = 0;
const B_MSG_DONT_LEAVE_BIRCH = 1;
const B_MSG_PREVENTS_ESCAPE = 2;

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

// ─── IsRunningFromBattleImpossible (battle_main.c:4021-4084) — 1:1 décomp ──

/** Helper : check si un battler est de type donné. Mock pour le tutorial
 *  Birch (= Torchic Fire / Mudkip Water / Treecko Grass, jamais Flying/Steel). */
function IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (battle_main.c:4021-4084).
 *
 *  Check si le battler ACTIF peut fuir le combat. Returns :
 *  - BATTLE_RUN_SUCCESS : fuite permise → caller appelle TryRunFromBattle
 *  - BATTLE_RUN_FAILURE : abilité opposite bloque (Shadow Tag/Arena Trap/
 *    Magnet Pull) → message via gBattleCommunication[MULTISTRING_CHOOSER]
 *  - BATTLE_RUN_FORBIDDEN : status/first battle bloque → message direct
 *
 *  Pour le Birch tutorial (BATTLE_TYPE_FIRST_BATTLE) : retourne FORBIDDEN
 *  + B_MSG_DONT_LEAVE_BIRCH ("Don't be a coward!").
 */
export function IsRunningFromBattleImpossible(): number {
  let holdEffect: number;
  let side: number;
  let i: number;

  // 1:1 décomp ll. 4027-4030 : check Enigma Berry vs normal hold effect.
  // Stub : on assume item normal (= ITEM_ENIGMA_BERRY pas porté).
  holdEffect = GetItemHoldEffect(gBattleMons[gActiveBattler].item);

  setPotentialItemEffectBattler(gActiveBattler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) return BATTLE_RUN_SUCCESS;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) return BATTLE_RUN_SUCCESS;
  if (gBattleMons[gActiveBattler].ability === ABILITY_RUN_AWAY) return BATTLE_RUN_SUCCESS;

  side = GET_BATTLER_SIDE(gActiveBattler);

  // 1:1 décomp ll. 4043-4063 : check opponents abilities Shadow Tag / Arena Trap.
  for (i = 0; i < gBattlersCount; i++) {
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[i].ability === ABILITY_SHADOW_TAG) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[gActiveBattler].ability !== ABILITY_LEVITATE
        && !IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_FLYING)
        && gBattleMons[i].ability === ABILITY_ARENA_TRAP) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
  }

  // 1:1 décomp ll. 4064-4071 : Magnet Pull vs Steel-type check.
  const magnetPullCheck = AbilityBattleEffects(
    ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER, gActiveBattler,
    ABILITY_MAGNET_PULL, 0, 0,
  );
  if (magnetPullCheck !== 0 && IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_STEEL)) {
    gBattleScripting.battler = magnetPullCheck - 1;
    setLastUsedAbility(gBattleMons[magnetPullCheck - 1].ability);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
    return BATTLE_RUN_FAILURE;
  }

  // 1:1 décomp ll. 4072-4077 : status check (Wrap/Bind/Mean Look/Spider Web).
  if ((gBattleMons[gActiveBattler].status2 & (STATUS2_ESCAPE_PREVENTION | STATUS2_WRAPPED))
      || (gStatuses3[gActiveBattler] & STATUS3_ROOTED)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_ESCAPE;
    return BATTLE_RUN_FORBIDDEN;
  }

  // 1:1 décomp ll. 4078-4082 : BIRCH TUTORIAL ⇒ "Don't be a coward!" message.
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DONT_LEAVE_BIRCH;
    return BATTLE_RUN_FORBIDDEN;
  }

  return BATTLE_RUN_SUCCESS;
}

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

// ─── K14b wire — auto-enregistrement sur globalThis (convention, cf ability-battle-
//     effects:985). La voie L action-selection (battle-action-selection.ts:596) appelle
//     IsRunningFromBattleImpossible au choix de FUITE (battle_main.c:4322-4351) → si trap,
//     pose STATE_SELECTION_SCRIPT + BattleScript_PrintCantEscapeFromBattle. Le sous-système
//     selection-script est désormais PORTÉ (loop 2026-06-03 : _runBattleScriptingCommand→
//     stepBattleScriptCommand, offsets→getBattleScriptOffset, Cmd_endselectionscript→
//     gBattleStruct.selectionScriptFinished) → plus de soft-lock.
(globalThis as { IsRunningFromBattleImpossible?: () => number }).IsRunningFromBattleImpossible = IsRunningFromBattleImpossible;

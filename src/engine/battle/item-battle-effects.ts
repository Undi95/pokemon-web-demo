/**
 * battle/item-battle-effects.ts — 1:1 décomp `ItemBattleEffects(caseID,
 * battlerId, moveTurn)` (battle_util.c:3240..3800, ~557 lignes).
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:3240..3800`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle_util.h:41..47`
 *     ITEMEFFECT_*
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/hold_effects.h`
 *     HOLD_EFFECT_*
 *
 * Cases :
 *   - ITEMEFFECT_ON_SWITCH_IN (= 26l, ✓ porté)
 *   - ITEMEFFECT_NORMAL (= ~290l berries triggers, ⚠️ stubbed)
 *   - ITEMEFFECT_DUMMY (= no-op, ✓ porté)
 *   - ITEMEFFECT_MOVE_END (= ~145l post-move items, ⚠️ stubbed)
 *   - ITEMEFFECT_KINGSROCK_SHELLBELL (= ~70l Kings Rock/Shell Bell, ✓ porté)
 *
 * État porté (session 136) : 3/5 cases (~25% lignes), 2 stubbés.
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gActiveBattler, setActiveBattler,
  gBattlersCount, gCurrentMove, gBattleCommunication,
  gBattleMoveDamage, setBattleMoveDamage,
  gHitMarker, setHitMarker,
  gLastUsedItem, setLastUsedItem,
  gBattleScripting, gPotentialItemEffectBattler, setPotentialItemEffectBattler,
  gMoveResultFlags,
  gSpecialStatuses,
  setBattlerAttacker,
} from './state';
import { Random, getBattleScriptOffset } from './script-interpreter';
import {
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE,
  MOVE_EFFECT_BYTE, MOVE_EFFECT_FLINCH,
  MOVE_RESULT_NO_EFFECT,
  FLAG_KINGS_ROCK_AFFECTED,
  IGNORE_SHELL_BELL,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
  STATUS1_PARALYSIS, STATUS1_BURN, STATUS1_FREEZE, STATUS1_SLEEP, STATUS1_ANY,
  STATUS1_POISON, STATUS1_TOXIC_POISON,
  STATUS2_CONFUSION, STATUS2_NIGHTMARE, STATUS2_INFATUATION,
} from './constants';
import { getBattleMove } from './data/battle-moves';
import {
  GetItemHoldEffect, GetItemHoldEffectParam,
} from './data/item-hold-effects';
import { SetMoveEffect } from './set-move-effect';
import type { BattleScriptContext } from './script-interpreter';

// ─── ITEMEFFECT_* enum (= 1:1 décomp battle_util.h:41-47) ────────────────

export const ITEMEFFECT_ON_SWITCH_IN          = 0;
export const ITEMEFFECT_NORMAL                = 1;
export const ITEMEFFECT_DUMMY                 = 2;
export const ITEMEFFECT_MOVE_END              = 3;
export const ITEMEFFECT_KINGSROCK_SHELLBELL   = 4;

// ─── ITEM_NO_EFFECT / ITEM_STATS_CHANGE return codes ─────────────────────

const ITEM_NO_EFFECT = 0;
const ITEM_STATS_CHANGE = 1;

// ─── HOLD_EFFECT_* enum (constants/hold_effects.h) — 1:1 décomp ──────────

const HOLD_EFFECT_RESTORE_HP     = 1;
const HOLD_EFFECT_CURE_PAR       = 4;
const HOLD_EFFECT_CURE_SLP       = 5;
const HOLD_EFFECT_CURE_PSN       = 6;
const HOLD_EFFECT_CURE_BRN       = 7;
const HOLD_EFFECT_CURE_FRZ       = 8;
const HOLD_EFFECT_CURE_CONFUSION = 10;
const HOLD_EFFECT_CURE_STATUS    = 11;
const HOLD_EFFECT_CURE_ATTRACT   = 12;
const HOLD_EFFECT_RESTORE_STATS  = 23;
const HOLD_EFFECT_FLINCH         = 30;
const HOLD_EFFECT_DOUBLE_PRIZE   = 32;
const HOLD_EFFECT_LEFTOVERS      = 43;
const HOLD_EFFECT_SHELL_BELL     = 62;

// ─── Helpers : status1 masks ─────────────────────────────────────────────
const STATUS1_PSN_ANY = STATUS1_POISON | STATUS1_TOXIC_POISON;
const STATUS1_TOXIC_COUNTER = 0xF00; // 1:1 décomp battle.h:128.

// ─── ITEM_* return codes 1:1 décomp ──────────────────────────────────────
const ITEM_HP_CHANGE     = 2;
const ITEM_STATUS_CHANGE = 3;
const ITEM_EFFECT_OTHER  = 4;

// ─── Helpers ────────────────────────────────────────────────────────────────

const ITEM_ENIGMA_BERRY = 175; // ITEM_ENIGMA_BERRY = 175 dans le décomp.

/** Module-local global pour le script label voulu. Caller via
 *  consumeItemWantedScript() pour récupérer. */
let _lastWantedScriptLabel: string | null = null;

export function consumeItemWantedScript(): string | null {
  const v = _lastWantedScriptLabel;
  _lastWantedScriptLabel = null;
  return v;
}

/** Module-local stub `gBattleStruct->moneyMultiplier`. */
let _moneyMultiplier = 1;
export function getMoneyMultiplier(): number { return _moneyMultiplier; }
export function setMoneyMultiplier(v: number) { _moneyMultiplier = v; }

// ─── Main fn ────────────────────────────────────────────────────────────────

/** 1:1 décomp `ItemBattleEffects(u8 caseID, u8 battlerId, bool8 moveTurn)`.
 *  Returns ITEM_NO_EFFECT (=0) ou ITEM_STATS_CHANGE (=1). */
export function ItemBattleEffects(caseID: number, battlerId: number, moveTurn: boolean): number {
  let effect = ITEM_NO_EFFECT;

  setLastUsedItem(gBattleMons[battlerId].item);
  const battlerHoldEffect = gLastUsedItem === ITEM_ENIGMA_BERRY
    ? 0 /* gEnigmaBerries non porté */
    : GetItemHoldEffect(gLastUsedItem);
  // battlerHoldEffectParam pas utilisé pour ON_SWITCH_IN ; skip pour économie.

  const atkItem = gBattleMons[gBattlerAttacker].item;
  const atkHoldEffect = atkItem === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffect(atkItem);
  const atkHoldEffectParam = atkItem === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffectParam(atkItem);

  // 1:1 décomp : defItem variables sont UNUSED (comment décomp:3273), skip.

  switch (caseID) {
    case ITEMEFFECT_ON_SWITCH_IN: {
      // 1:1 décomp battle_util.c:3288-3313.
      switch (battlerHoldEffect) {
        case HOLD_EFFECT_DOUBLE_PRIZE:
          if (GET_BATTLER_SIDE(battlerId) === B_SIDE_PLAYER) {
            setMoneyMultiplier(2);
          }
          break;
        case HOLD_EFFECT_RESTORE_STATS:
          for (let i = 0; i < NUM_BATTLE_STATS; i++) {
            if (gBattleMons[battlerId].statStages[i] < DEFAULT_STAT_STAGE) {
              gBattleMons[battlerId].statStages[i] = DEFAULT_STAT_STAGE;
              effect = ITEM_STATS_CHANGE;
            }
          }
          if (effect !== ITEM_NO_EFFECT) {
            gBattleScripting.battler = battlerId;
            setPotentialItemEffectBattler(battlerId);
            setActiveBattler(battlerId);
            setBattlerAttacker(battlerId);
            _lastWantedScriptLabel = 'BattleScript_WhiteHerbEnd2';
          }
          break;
      }
      break;
    }

    case ITEMEFFECT_DUMMY:
      // 1:1 décomp battle_util.c:3606 — no-op.
      break;

    case ITEMEFFECT_KINGSROCK_SHELLBELL: {
      // 1:1 décomp battle_util.c:3752-3800.
      if (gBattleMoveDamage) {
        switch (atkHoldEffect) {
          case HOLD_EFFECT_FLINCH:
            if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
                && (gSpecialStatuses[gBattlerTarget].physicalDmg !== 0
                    || gSpecialStatuses[gBattlerTarget].specialDmg !== 0) /* TARGET_TURN_DAMAGED */
                && (Random() % 100) < atkHoldEffectParam
                && (getBattleMove(gCurrentMove).flags & FLAG_KINGS_ROCK_AFFECTED)
                && gBattleMons[gBattlerTarget].hp) {
              gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_FLINCH;
              // 1:1 décomp : BattleScriptPushCursor() + SetMoveEffect(FALSE, 0) + BattleScriptPop().
              // Notre port : create scratch ctx pour appel SetMoveEffect. Le caller doit
              // wire le retour ailleurs (= bytecode interpreter pas wired ici).
              // Pour le moment, set MOVE_EFFECT_BYTE et signal caller via wantedScript.
              _lastWantedScriptLabel = '__KINGS_ROCK_FLINCH_QUEUED';
              // Note : décomp utilise BattleScriptPush/Pop = paired (= effective no-op
              // sur le script pointer). On rely sur le caller pour faire SetMoveEffect.
              void SetMoveEffect; void getBattleScriptOffset;
              effect = ITEM_STATS_CHANGE;
            }
            break;
          case HOLD_EFFECT_SHELL_BELL:
            if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
                && gSpecialStatuses[gBattlerTarget].shellBellDmg !== 0
                && gSpecialStatuses[gBattlerTarget].shellBellDmg !== IGNORE_SHELL_BELL
                && gBattlerAttacker !== gBattlerTarget
                && gBattleMons[gBattlerAttacker].hp !== gBattleMons[gBattlerAttacker].maxHP
                && gBattleMons[gBattlerAttacker].hp !== 0) {
              setLastUsedItem(atkItem);
              setPotentialItemEffectBattler(gBattlerAttacker);
              gBattleScripting.battler = gBattlerAttacker;
              let dmg = Math.floor(gSpecialStatuses[gBattlerTarget].shellBellDmg / atkHoldEffectParam) * -1;
              if (dmg === 0) dmg = -1;
              setBattleMoveDamage(dmg);
              gSpecialStatuses[gBattlerTarget].shellBellDmg = 0;
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_Ret';
              effect = ITEM_STATS_CHANGE;
            }
            break;
        }
      }
      break;
    }

    case ITEMEFFECT_NORMAL: {
      // 1:1 décomp battle_util.c:3314-3605 — berries triggers.
      // Cases portés : RESTORE_HP, RESTORE_STATS, LEFTOVERS, CURE_PAR/PSN/BRN/FRZ/SLP/CONFUSION/STATUS/ATTRACT.
      // Stubbed : RESTORE_PP (= party data), CONFUSE_*, ATTACK_UP..SP_DEF_UP, CRITICAL_UP, RANDOM_STAT_UP.
      if (gBattleMons[battlerId].hp) {
        const battlerHoldEffectParam = gLastUsedItem === ITEM_ENIGMA_BERRY
          ? 0 : GetItemHoldEffectParam(gLastUsedItem);
        switch (battlerHoldEffect) {
          case HOLD_EFFECT_RESTORE_HP:
            if (gBattleMons[battlerId].hp <= gBattleMons[battlerId].maxHP / 2 && !moveTurn) {
              let dmg = battlerHoldEffectParam;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_RemoveItem';
              effect = ITEM_HP_CHANGE;
            }
            break;
          case HOLD_EFFECT_RESTORE_STATS:
            for (let i = 0; i < NUM_BATTLE_STATS; i++) {
              if (gBattleMons[battlerId].statStages[i] < DEFAULT_STAT_STAGE) {
                gBattleMons[battlerId].statStages[i] = DEFAULT_STAT_STAGE;
                effect = ITEM_STATS_CHANGE;
              }
            }
            if (effect !== ITEM_NO_EFFECT) {
              gBattleScripting.battler = battlerId;
              setPotentialItemEffectBattler(battlerId);
              setActiveBattler(battlerId);
              setBattlerAttacker(battlerId);
              _lastWantedScriptLabel = 'BattleScript_WhiteHerbEnd2';
            }
            break;
          case HOLD_EFFECT_LEFTOVERS:
            if (gBattleMons[battlerId].hp < gBattleMons[battlerId].maxHP && !moveTurn) {
              let dmg = Math.floor(gBattleMons[battlerId].maxHP / 16);
              if (dmg === 0) dmg = 1;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_End2';
              effect = ITEM_HP_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PAR:
            if (gBattleMons[battlerId].status1 & STATUS1_PARALYSIS) {
              gBattleMons[battlerId].status1 &= ~STATUS1_PARALYSIS;
              _lastWantedScriptLabel = 'BattleScript_BerryCurePrlzEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PSN:
            if (gBattleMons[battlerId].status1 & STATUS1_PSN_ANY) {
              // 1:1 décomp : clear STATUS1_PSN_ANY | STATUS1_TOXIC_COUNTER.
              gBattleMons[battlerId].status1 &= ~(STATUS1_PSN_ANY | STATUS1_TOXIC_COUNTER);
              _lastWantedScriptLabel = 'BattleScript_BerryCurePsnEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_BRN:
            if (gBattleMons[battlerId].status1 & STATUS1_BURN) {
              gBattleMons[battlerId].status1 &= ~STATUS1_BURN;
              _lastWantedScriptLabel = 'BattleScript_BerryCureBrnEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_FRZ:
            if (gBattleMons[battlerId].status1 & STATUS1_FREEZE) {
              gBattleMons[battlerId].status1 &= ~STATUS1_FREEZE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureFrzEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_SLP:
            if (gBattleMons[battlerId].status1 & STATUS1_SLEEP) {
              gBattleMons[battlerId].status1 &= ~STATUS1_SLEEP;
              gBattleMons[battlerId].status2 &= ~STATUS2_NIGHTMARE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureSlpEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_CONFUSION:
            if (gBattleMons[battlerId].status2 & STATUS2_CONFUSION) {
              gBattleMons[battlerId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureConfusionEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_ATTRACT:
            if (gBattleMons[battlerId].status2 & STATUS2_INFATUATION) {
              gBattleMons[battlerId].status2 &= ~STATUS2_INFATUATION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            // 1:1 décomp partial : clear tous status1 + STATUS2_CONFUSION
            // (sans le text buffer plural logic).
            if ((gBattleMons[battlerId].status1 & STATUS1_ANY)
                || (gBattleMons[battlerId].status2 & STATUS2_CONFUSION)) {
              gBattleMons[battlerId].status2 &= ~STATUS2_NIGHTMARE;
              gBattleMons[battlerId].status1 = 0;
              gBattleMons[battlerId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
        }
        // TODO porter : RESTORE_PP (=party data), CONFUSE_FOOD_BERRIES
        // (FLAVOR_SPICY/DRY/SWEET/BITTER/SOUR macro), ATTACK_UP..SP_DEF_UP +
        // CRITICAL_UP + RANDOM_STAT_UP (= ChangeStatBuffs).
      }
      void moveTurn;
      break;
    }

    case ITEMEFFECT_MOVE_END: {
      // 1:1 décomp battle_util.c:3608-3751.
      // Iterate tous battlers pour appliquer berry cures post-move.
      // Note : 1:1 décomp utilise BattleScriptPushCursor() — équivalent à push
      // current script ptr (= dispatch loop ne touche pas après notre return).
      // Notre port stocke le label voulu via _lastWantedScriptLabel.
      for (let bId = 0; bId < gBattlersCount; bId++) {
        const item = gBattleMons[bId].item;
        const heff = item === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffect(item);
        setLastUsedItem(item);
        switch (heff) {
          case HOLD_EFFECT_CURE_PAR:
            if (gBattleMons[bId].status1 & STATUS1_PARALYSIS) {
              gBattleMons[bId].status1 &= ~STATUS1_PARALYSIS;
              _lastWantedScriptLabel = 'BattleScript_BerryCureParRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PSN:
            if (gBattleMons[bId].status1 & STATUS1_PSN_ANY) {
              gBattleMons[bId].status1 &= ~(STATUS1_PSN_ANY | STATUS1_TOXIC_COUNTER);
              _lastWantedScriptLabel = 'BattleScript_BerryCurePsnRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_BRN:
            if (gBattleMons[bId].status1 & STATUS1_BURN) {
              gBattleMons[bId].status1 &= ~STATUS1_BURN;
              _lastWantedScriptLabel = 'BattleScript_BerryCureBrnRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_FRZ:
            if (gBattleMons[bId].status1 & STATUS1_FREEZE) {
              gBattleMons[bId].status1 &= ~STATUS1_FREEZE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureFrzRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_SLP:
            if (gBattleMons[bId].status1 & STATUS1_SLEEP) {
              gBattleMons[bId].status1 &= ~STATUS1_SLEEP;
              gBattleMons[bId].status2 &= ~STATUS2_NIGHTMARE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureSlpRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_CONFUSION:
            if (gBattleMons[bId].status2 & STATUS2_CONFUSION) {
              gBattleMons[bId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureConfusionRet';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_ATTRACT:
            if (gBattleMons[bId].status2 & STATUS2_INFATUATION) {
              gBattleMons[bId].status2 &= ~STATUS2_INFATUATION;
              gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = 7 /* B_MSG_CURED_PROBLEM */;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusRet';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            if ((gBattleMons[bId].status1 & STATUS1_ANY)
                || (gBattleMons[bId].status2 & STATUS2_CONFUSION)) {
              gBattleMons[bId].status1 = 0;
              gBattleMons[bId].status2 &= ~(STATUS2_CONFUSION | STATUS2_NIGHTMARE);
              gBattleCommunication[5] = 7 /* B_MSG_CURED_PROBLEM */;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_RESTORE_STATS:
            for (let i = 0; i < NUM_BATTLE_STATS; i++) {
              if (gBattleMons[bId].statStages[i] < DEFAULT_STAT_STAGE) {
                gBattleMons[bId].statStages[i] = DEFAULT_STAT_STAGE;
                effect = ITEM_STATS_CHANGE;
              }
            }
            if (effect !== ITEM_NO_EFFECT) {
              gBattleScripting.battler = bId;
              setPotentialItemEffectBattler(bId);
              setActiveBattler(bId);
              setBattlerAttacker(bId);
              _lastWantedScriptLabel = 'BattleScript_WhiteHerbRet';
            }
            break;
        }
        if (effect !== ITEM_NO_EFFECT) {
          gBattleScripting.battler = bId;
          break;
        }
      }
      void gHitMarker; void setHitMarker;
      break;
    }

    default:
      break;
  }

  return effect;
}

// Silence unused for now (= used by future MOVE_END/NORMAL ports).
void getMoneyMultiplier;

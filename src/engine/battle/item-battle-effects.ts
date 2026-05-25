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
  setEffectBattler,
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
  STATUS1_POISON, STATUS1_TOXIC_POISON, STATUS1_TOXIC_COUNTER,
  STATUS2_CONFUSION, STATUS2_NIGHTMARE, STATUS2_INFATUATION, STATUS2_FOCUS_ENERGY,
  STAT_ATK, STAT_DEF, STAT_SPEED, STAT_SPATK, STAT_SPDEF,
  MAX_STAT_STAGE,
  SET_STATCHANGER,
  NUM_STATS,
  MAX_MON_MOVES,
} from './constants';
import { getBattleMove } from './data/battle-moves';
import {
  GetItemHoldEffect, GetItemHoldEffectParam,
} from './data/item-hold-effects';
import { GetFlavorRelationByPersonality } from './data/flavor-compat';
import { SetMoveEffect } from './set-move-effect';
import {
  gPlayerParty, gEnemyParty, GetMonData, SetMonData,
  MON_DATA_MOVE1, MON_DATA_PP1, MON_DATA_PP_BONUSES,
} from './party-storage';
import { gBattlerPartyIndexes } from './state';
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
// AUDIT FIX session 136 : mes hardcoded values étaient TOUS faux pour les
// CURE_*. Import direct du fichier auto-extracted (= source de vérité). */
import {
  HOLD_EFFECT_RESTORE_HP, HOLD_EFFECT_RESTORE_PP,
  HOLD_EFFECT_CURE_PAR, HOLD_EFFECT_CURE_SLP, HOLD_EFFECT_CURE_PSN,
  HOLD_EFFECT_CURE_BRN, HOLD_EFFECT_CURE_FRZ,
  HOLD_EFFECT_CURE_CONFUSION, HOLD_EFFECT_CURE_STATUS, HOLD_EFFECT_CURE_ATTRACT,
  HOLD_EFFECT_CONFUSE_SPICY, HOLD_EFFECT_CONFUSE_DRY,
  HOLD_EFFECT_CONFUSE_SWEET, HOLD_EFFECT_CONFUSE_BITTER, HOLD_EFFECT_CONFUSE_SOUR,
  HOLD_EFFECT_ATTACK_UP, HOLD_EFFECT_DEFENSE_UP, HOLD_EFFECT_SPEED_UP,
  HOLD_EFFECT_SP_ATTACK_UP, HOLD_EFFECT_SP_DEFENSE_UP,
  HOLD_EFFECT_CRITICAL_UP, HOLD_EFFECT_RANDOM_STAT_UP,
  HOLD_EFFECT_RESTORE_STATS,
  HOLD_EFFECT_FLINCH, HOLD_EFFECT_DOUBLE_PRIZE,
  HOLD_EFFECT_LEFTOVERS,
  HOLD_EFFECT_SHELL_BELL,
} from '../decomp-data/include/constants/hold_effects-data';

// 1:1 décomp text-buffers (= gBattleTextBuff1/2 + PREPARE_*_BUFFER macros).
import {
  gBattleTextBuff1 as _gBattleTextBuff1_IBE,
  gBattleTextBuff2 as _gBattleTextBuff2_IBE,
  PREPARE_STAT_BUFFER as _PREPARE_STAT_BUFFER_IBE,
  PREPARE_FLAVOR_BUFFER as _PREPARE_FLAVOR_BUFFER_IBE,
  PREPARE_MOVE_BUFFER as _PREPARE_MOVE_BUFFER_IBE,
  B_BUFF_PLACEHOLDER_BEGIN as _B_BUFF_BEGIN_IBE,
  B_BUFF_STRING as _B_BUFF_STRING_IBE,
  B_BUFF_EOS as _B_BUFF_EOS_IBE,
} from './text-buffers';

// 1:1 décomp battle_string_ids.h.
const STRINGID_STATSHARPLY = 209;
const STRINGID_STATROSE    = 210;

/** 1:1 décomp battle_util.c:3417 — PREPARE_STRING_BUFFER(gBattleTextBuff2, STRINGID_X). */
function _PREPARE_STRING_BUFFER_IBE(buf: Uint8Array, stringId: number): void {
  buf[0] = _B_BUFF_BEGIN_IBE;
  buf[1] = _B_BUFF_STRING_IBE;
  buf[2] = stringId & 0xFF;
  buf[3] = (stringId >> 8) & 0xFF;
  buf[4] = _B_BUFF_EOS_IBE;
}

/** 1:1 décomp `StringCopy(gBattleTextBuff1, gStatusConditionString_XJpn)`.
 *  Notre version FR direct (= POISON/SOMMEIL/PARALYSIE/BRÛLURE/GEL/CONFUSION/AMOUR).
 *  Utilisé par HOLD_EFFECT_CURE_ATTRACT/CURE_STATUS (= Mental Herb, Lum Berry). */
function _writeStatusFrToBuffIBE(buf: Uint8Array, status1: number, status2: number): void {
  let s = '';
  if (status1 & (STATUS1_POISON | STATUS1_TOXIC_POISON)) s = 'POISON';
  else if (status1 & STATUS1_SLEEP) s = 'SOMMEIL';
  else if (status1 & STATUS1_PARALYSIS) s = 'PARALYSIE';
  else if (status1 & STATUS1_BURN) s = 'BRÛLURE';
  else if (status1 & STATUS1_FREEZE) s = 'GEL';
  else if (status2 & STATUS2_CONFUSION) s = 'CONFUSION';
  else if (status2 & STATUS2_INFATUATION) s = 'AMOUR';
  for (let i = 0; i < buf.length; i++) buf[i] = 0;
  for (let i = 0; i < s.length && i < buf.length - 1; i++) {
    buf[i] = s.charCodeAt(i) & 0xFF;
  }
  buf[Math.min(s.length, buf.length - 1)] = _B_BUFF_EOS_IBE;
}

// ─── Helpers : status1 masks ─────────────────────────────────────────────
const STATUS1_PSN_ANY = STATUS1_POISON | STATUS1_TOXIC_POISON;

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
          case HOLD_EFFECT_RESTORE_PP:
            // 1:1 décomp battle_util.c:3330-3365 (Leppa Berry).
            if (!moveTurn) {
              const mon = GET_BATTLER_SIDE(battlerId) === B_SIDE_PLAYER
                ? gPlayerParty[gBattlerPartyIndexes[battlerId]]
                : gEnemyParty[gBattlerPartyIndexes[battlerId]];
              let foundIdx = -1;
              let foundMove = 0;
              let foundPp = 0;
              for (let i = 0; i < MAX_MON_MOVES; i++) {
                const m = GetMonData(mon, MON_DATA_MOVE1 + i) as number;
                const pp = GetMonData(mon, MON_DATA_PP1 + i) as number;
                if (m && pp === 0) {
                  foundIdx = i;
                  foundMove = m;
                  foundPp = pp;
                  break;
                }
              }
              if (foundIdx !== -1) {
                // 1:1 décomp : CalculatePPWithBonus pour max PP. Stub : on
                // utilise getBattleMove(move).pp comme max.
                const maxPP = getBattleMove(foundMove).pp;
                let newPp = foundPp + battlerHoldEffectParam;
                if (newPp > maxPP) newPp = maxPP;
                // 1:1 décomp battle_util.c:3357 — afficher le move name
                // pour {B_BUFF1} dans message "X recharge {B_BUFF1}!".
                _PREPARE_MOVE_BUFFER_IBE(_gBattleTextBuff1_IBE, foundMove);
                SetMonData(mon, MON_DATA_PP1 + foundIdx, newPp);
                // Sync au battler aussi (= gBattleMons[battlerId].pp[idx]).
                gBattleMons[battlerId].pp[foundIdx] = newPp;
                _lastWantedScriptLabel = 'BattleScript_BerryPPHealEnd2';
                effect = 3 /* ITEM_PP_CHANGE */;
              }
              void MON_DATA_PP_BONUSES;
            }
            break;
          case HOLD_EFFECT_RESTORE_HP:
            // AUDIT BUG FIX : case label was missing — code was unreachable.
            // 1:1 décomp battle_util.c:3319-3329 (Berry HP restore).
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
          case HOLD_EFFECT_CONFUSE_SPICY:
          case HOLD_EFFECT_CONFUSE_DRY:
          case HOLD_EFFECT_CONFUSE_SWEET:
          case HOLD_EFFECT_CONFUSE_BITTER:
          case HOLD_EFFECT_CONFUSE_SOUR: {
            // 1:1 décomp TRY_EAT_CONFUSE_BERRY(flavor) macro (battle_util.c:3210).
            // Mapping holdEffect → flavor (= SPICY/DRY/SWEET/BITTER/SOUR = 0..4).
            const _flavorOf = (heff: number): number =>
              heff - HOLD_EFFECT_CONFUSE_SPICY;
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / 2) && !moveTurn) {
              const flavor = _flavorOf(battlerHoldEffect);
              // 1:1 décomp battle_util.c:3213.
              _PREPARE_FLAVOR_BUFFER_IBE(_gBattleTextBuff1_IBE, flavor);
              let dmg = Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam);
              if (dmg === 0) dmg = 1;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              const relation = GetFlavorRelationByPersonality(gBattleMons[battlerId].personality, flavor);
              if (relation < 0) {
                _lastWantedScriptLabel = 'BattleScript_BerryConfuseHealEnd2';
              } else {
                _lastWantedScriptLabel = 'BattleScript_ItemHealHP_RemoveItem';
              }
              effect = ITEM_HP_CHANGE;
            }
            break;
          }
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
              // 1:1 décomp battle_util.c (Mental Herb) — StringCopy(LoveJpn).
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[battlerId].status1,
                gBattleMons[battlerId].status2,
              );
              gBattleMons[battlerId].status2 &= ~STATUS2_INFATUATION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            // 1:1 décomp partial : clear tous status1 + STATUS2_CONFUSION.
            if ((gBattleMons[battlerId].status1 & STATUS1_ANY)
                || (gBattleMons[battlerId].status2 & STATUS2_CONFUSION)) {
              // 1:1 décomp battle_util.c (Lum Berry) — StringCopy status name.
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[battlerId].status1,
                gBattleMons[battlerId].status2,
              );
              gBattleMons[battlerId].status2 &= ~STATUS2_NIGHTMARE;
              gBattleMons[battlerId].status1 = 0;
              gBattleMons[battlerId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
        }
        // ─── Stat-up berries (= TRY_EAT_STAT_UP_BERRY macro inline) ──────
        // Helper inline pour stat-up berries (= macro TRY_EAT_STAT_UP_BERRY).
        const _tryStatUpBerry = (stat: number): boolean => {
          if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
              && !moveTurn
              && gBattleMons[battlerId].statStages[stat] < MAX_STAT_STAGE) {
            // 1:1 décomp battle_util.c:3231 TRY_EAT_STAT_UP_BERRY macro.
            _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, stat);
            setEffectBattler(battlerId);
            gBattleScripting.statChanger = SET_STATCHANGER(stat, 1, false);
            gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + stat;
            gBattleScripting.animArg2 = 0;
            _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
            effect = ITEM_STATS_CHANGE;
            return true;
          }
          return false;
        };
        switch (battlerHoldEffect) {
          case HOLD_EFFECT_ATTACK_UP:
            // 1:1 décomp battle_util.c:3412-3424 — version spéciale Attack berry
            // qui ajoute PREPARE_STRING_BUFFER(STATROSE) "augmente" pour le buff2.
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
                && !moveTurn
                && gBattleMons[battlerId].statStages[STAT_ATK] < MAX_STAT_STAGE) {
              _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, STAT_ATK);
              _PREPARE_STRING_BUFFER_IBE(_gBattleTextBuff2_IBE, STRINGID_STATROSE);
              setEffectBattler(battlerId);
              gBattleScripting.statChanger = SET_STATCHANGER(STAT_ATK, 1, false);
              gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + STAT_ATK;
              gBattleScripting.animArg2 = 0;
              _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
              effect = ITEM_STATS_CHANGE;
            }
            break;
          case HOLD_EFFECT_DEFENSE_UP:    _tryStatUpBerry(STAT_DEF);   break;
          case HOLD_EFFECT_SPEED_UP:      _tryStatUpBerry(STAT_SPEED); break;
          case HOLD_EFFECT_SP_ATTACK_UP:  _tryStatUpBerry(STAT_SPATK); break;
          case HOLD_EFFECT_SP_DEFENSE_UP: _tryStatUpBerry(STAT_SPDEF); break;
          case HOLD_EFFECT_CRITICAL_UP:
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
                && !moveTurn
                && !(gBattleMons[battlerId].status2 & STATUS2_FOCUS_ENERGY)) {
              gBattleMons[battlerId].status2 |= STATUS2_FOCUS_ENERGY;
              _lastWantedScriptLabel = 'BattleScript_BerryFocusEnergyEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_RANDOM_STAT_UP:
            // 1:1 décomp battle_util.c:3447-3481 : Starf berry.
            if (!moveTurn
                && gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)) {
              let i = 0;
              for (; i < NUM_STATS - 1; i++) {
                if (gBattleMons[battlerId].statStages[STAT_ATK + i] < MAX_STAT_STAGE) break;
              }
              if (i !== NUM_STATS - 1) {
                // Pick random non-max stat.
                do {
                  i = Random() % (NUM_STATS - 1);
                } while (gBattleMons[battlerId].statStages[STAT_ATK + i] === MAX_STAT_STAGE);
                // 1:1 décomp battle_util.c:3462 PREPARE_STAT_BUFFER(stat).
                _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, i + 1);
                // 1:1 décomp battle_util.c:3464-3471 buff2 multi-string =
                // STATSHARPLY + STATROSE (= "X augmente beaucoup!").
                _gBattleTextBuff2_IBE[0] = _B_BUFF_BEGIN_IBE;
                _gBattleTextBuff2_IBE[1] = _B_BUFF_STRING_IBE;
                _gBattleTextBuff2_IBE[2] = STRINGID_STATSHARPLY & 0xFF;
                _gBattleTextBuff2_IBE[3] = (STRINGID_STATSHARPLY >> 8) & 0xFF;
                _gBattleTextBuff2_IBE[4] = _B_BUFF_STRING_IBE;
                _gBattleTextBuff2_IBE[5] = STRINGID_STATROSE & 0xFF;
                _gBattleTextBuff2_IBE[6] = (STRINGID_STATROSE >> 8) & 0xFF;
                _gBattleTextBuff2_IBE[7] = _B_BUFF_EOS_IBE;
                setEffectBattler(battlerId);
                gBattleScripting.statChanger = SET_STATCHANGER(i + 1, 2, false);
                gBattleScripting.animArg1 = 21 /* STAT_ANIM_PLUS2 */ + (i + 1);
                gBattleScripting.animArg2 = 0;
                _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
                effect = ITEM_STATS_CHANGE;
              }
            }
            break;
        }
      }
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
              // 1:1 décomp battle_util.c:3683 (Mental Herb) — StringCopy LoveJpn.
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[bId].status1,
                gBattleMons[bId].status2,
              );
              gBattleMons[bId].status2 &= ~STATUS2_INFATUATION;
              gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = 7 /* B_MSG_CURED_PROBLEM */;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusRet';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            if ((gBattleMons[bId].status1 & STATUS1_ANY)
                || (gBattleMons[bId].status2 & STATUS2_CONFUSION)) {
              // 1:1 décomp battle_util.c:3691-3713 (Lum Berry) — StringCopy
              // status name. Notre FR direct vs décomp EN qui garde JPN bytes.
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[bId].status1,
                gBattleMons[bId].status2,
              );
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

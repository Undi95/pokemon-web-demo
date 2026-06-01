/**
 * battle/stat-stages.ts — 1:1 décomp `ChangeStatBuffs`
 * (`D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:6940-7110`).
 *
 * Logic complète :
 * 1. Resolve target (= AFFECTS_USER → attacker, sinon → target).
 * 2. Strip flags AFFECTS_USER + CERTAIN + NOT_PROTECT_AFFECTED.
 * 3. Si stat decrease :
 *    - Mist (gSideTimers) bloque sauf si certain ou MOVE_CURSE — wired session 141
 *    - JumpIfMoveAffectedByProtect — port partial session 138
 *    - Clear Body / White Smoke bloquent → push BattleScript_AbilityNoStatLoss
 *    - Keen Eye bloque ACC drop
 *    - Hyper Cutter bloque ATK drop
 *    - Shield Dust si flags == 0
 *    - Apply decrease.
 * 4. Si stat increase :
 *    - Apply increase.
 * 5. Clamp à [MIN, MAX_STAT_STAGE].
 * 6. Set MULTISTRING_CHOOSER pour le message.
 * 7. Si stat wont change et STAT_CHANGE_ALLOW_PTR → set MOVE_RESULT_MISSED.
 * 8. Return STAT_CHANGE_WORKED / DIDNT_WORK.
 *
 * Stubs : gSideTimers.mistTimer, JumpIfMoveAffectedByProtect, BattleScriptPush,
 * RecordAbilityBattle, gSpecialStatuses.statLowered. Notre port : skip path
 * "couldn't lower" qui fait un push script + return DIDNT_WORK.
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gCurrentMove,
  gMoveResultFlags,
  gBattleCommunication,
  gSideTimers,
  gSpecialStatuses,
  gBattleScripting,
  setMoveResultFlags,
  setActiveBattler,
  setLastUsedAbility,
} from './state';
import { GET_BATTLER_SIDE } from './constants';
import {
  MOVE_EFFECT_AFFECTS_USER,
  MOVE_EFFECT_CERTAIN,
  STAT_CHANGE_ALLOW_PTR,
  STAT_CHANGE_NOT_PROTECT_AFFECTED,
  STAT_CHANGE_WORKED,
  STAT_CHANGE_DIDNT_WORK,
  GET_STAT_BUFF_VALUE,
  MULTISTRING_CHOOSER,
  MIN_STAT_STAGE,
  MAX_STAT_STAGE,
  STAT_ACC,
  STAT_ATK,
  ABILITY_CLEAR_BODY,
  ABILITY_WHITE_SMOKE,
  ABILITY_KEEN_EYE,
  ABILITY_HYPER_CUTTER,
  ABILITY_SHIELD_DUST,
  MOVE_CURSE,
  B_MSG_STAT_WONT_INCREASE,
  B_MSG_STAT_WONT_DECREASE,
  MOVE_RESULT_MISSED,
} from './constants';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_SS,
  gBattleTextBuff2 as _gBattleTextBuff2_SS,
  PREPARE_STAT_BUFFER,
  B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_STRING, B_BUFF_EOS,
} from './text-buffers';

// 1:1 décomp `include/constants/battle_string_ids.h:209-212`.
const STRINGID_STATSHARPLY = 209;
const STRINGID_STATROSE = 210;
const STRINGID_STATHARSHLY = 211;
const STRINGID_STATFELL = 212;

/** Deps script-context injectées par le wrapper Cmd_statbuffchange. Les fonctions
 *  qui ont besoin du BattleScriptContext (push/jump/protect/record) vivent dans
 *  battle-script-commands.ts / battle-controllers.ts → import direct = cycle ESM.
 *  On les injecte donc à l'appel (pattern setter-injection). 1:1 décomp :
 *  BattleScriptPush + gBattlescriptCurrInstr + JumpIfMoveAffectedByProtect(0)
 *  + getBattleScriptOffset + RecordAbilityBattle. */
export interface StatBuffScriptDeps {
  /** BattleScriptPush(ctx, offset) — push l'adresse de retour (BS_ptr). */
  pushReturnPtr: (offset: number) => void;
  /** gBattlescriptCurrInstr = offset. */
  setScriptPtr: (offset: number) => void;
  /** getBattleScriptOffset(label) — résout BattleScript_* → offset bytecode. */
  offsetOf: (label: string) => number;
  /** JumpIfMoveAffectedByProtect(0) — true si bloqué par Abri/Détection. */
  isAffectedByProtect: () => boolean;
  /** RecordAbilityBattle(battler, ability) — tracking IA. */
  recordAbility: (battler: number, ability: number) => void;
}

/** 1:1 décomp `ChangeStatBuffs(s8 statValue, u8 statId, u8 flags, const u8 *BS_ptr)`
 *  (battle_script_commands.c:6940-7110).
 *
 *  statValue : signed delta. NEGATIVE bit (0x80) set si decrease, sinon increase.
 *              Magnitude encoded via GET_STAT_BUFF_VALUE (= bits 4-6).
 *  statId    : STAT_ATK..STAT_EVASION.
 *  flags     : STAT_CHANGE_* + MOVE_EFFECT_* bits.
 *  BS_ptr    : jump target (offset bytecode) si STAT_CHANGE_ALLOW_PTR et fail.
 *  deps      : si fourni (chemin opcode), active les push+jumps vers les scripts de
 *              message des protections (Brume/Clear Body/etc.) + la branche Protect. */
export function ChangeStatBuffs(
  statValue: number,
  statId: number,
  flags: number,
  BS_ptr: number,
  deps?: StatBuffScriptDeps,
): number {
  let certain = false;
  let notProtectAffected = false;
  let activeBattler: number;

  if (flags & MOVE_EFFECT_AFFECTS_USER) {
    activeBattler = gBattlerAttacker;
  } else {
    activeBattler = gBattlerTarget;
  }
  setActiveBattler(activeBattler);

  flags &= ~MOVE_EFFECT_AFFECTS_USER;

  if (flags & MOVE_EFFECT_CERTAIN) certain = true;
  flags &= ~MOVE_EFFECT_CERTAIN;

  if (flags & STAT_CHANGE_NOT_PROTECT_AFFECTED) notProtectAffected = true;
  flags &= ~STAT_CHANGE_NOT_PROTECT_AFFECTED;
  void notProtectAffected;  // deferred use when JumpIfMoveAffectedByProtect fully ported

  // 1:1 décomp battle_script_commands.c:6961.
  PREPARE_STAT_BUFFER(_gBattleTextBuff1_SS, statId);

  const mon = gBattleMons[activeBattler];
  const isDecrease = (statValue & 0x80) !== 0;  // STAT_BUFF_NEGATIVE bit

  // signed conversion : if NEGATIVE bit set, statValue is -GET_VALUE.
  const magnitude = GET_STAT_BUFF_VALUE(statValue);
  let appliedDelta = isDecrease ? -magnitude : magnitude;

  if (isDecrease) {
    // 1:1 décomp battle_script_commands.c:6965-7041. Chaîne else-if (= comme décomp) :
    // Mist → Protect → Clear Body/White Smoke → Keen Eye → Hyper Cutter → Shield Dust.
    // Quand flags === STAT_CHANGE_ALLOW_PTR (chemin opcode) + `deps` fournis : on push
    // BS_ptr + jump au script de message (qui finit par `return` → repop BS_ptr).
    if (
      gSideTimers[GET_BATTLER_SIDE(activeBattler)].mistTimer
      && !certain && gCurrentMove !== MOVE_CURSE
    ) {
      // 1:1 décomp 6968-6981 : Brume (Mist).
      if (deps && flags === STAT_CHANGE_ALLOW_PTR) {
        if (gSpecialStatuses[activeBattler].statLowered) {
          deps.setScriptPtr(BS_ptr);
        } else {
          deps.pushReturnPtr(BS_ptr);
          gBattleScripting.battler = activeBattler;
          deps.setScriptPtr(deps.offsetOf('BattleScript_MistProtected'));
          gSpecialStatuses[activeBattler].statLowered = 1;
        }
      }
      return STAT_CHANGE_DIDNT_WORK;
    } else if (
      // 1:1 décomp 6984-6989 : bloqué par Abri/Détection (Protect).
      gCurrentMove !== MOVE_CURSE && !notProtectAffected
      && deps !== undefined && deps.isAffectedByProtect()
    ) {
      deps.setScriptPtr(deps.offsetOf('BattleScript_ButItFailed'));
      return STAT_CHANGE_DIDNT_WORK;
    } else if (
      (mon.ability === ABILITY_CLEAR_BODY || mon.ability === ABILITY_WHITE_SMOKE)
      && !certain && gCurrentMove !== MOVE_CURSE
    ) {
      // 1:1 décomp 6990-7011 : Clear Body / White Smoke (toutes les baisses).
      if (deps && flags === STAT_CHANGE_ALLOW_PTR) {
        if (gSpecialStatuses[activeBattler].statLowered) {
          deps.setScriptPtr(BS_ptr);
        } else {
          deps.pushReturnPtr(BS_ptr);
          gBattleScripting.battler = activeBattler;
          deps.setScriptPtr(deps.offsetOf('BattleScript_AbilityNoStatLoss'));
          setLastUsedAbility(mon.ability);
          deps.recordAbility(activeBattler, mon.ability);
          gSpecialStatuses[activeBattler].statLowered = 1;
        }
      }
      return STAT_CHANGE_DIDNT_WORK;
    } else if (mon.ability === ABILITY_KEEN_EYE && !certain && statId === STAT_ACC) {
      // 1:1 décomp 7012-7024 : Keen Eye bloque la baisse de PRÉCISION.
      if (deps && flags === STAT_CHANGE_ALLOW_PTR) {
        deps.pushReturnPtr(BS_ptr);
        gBattleScripting.battler = activeBattler;
        deps.setScriptPtr(deps.offsetOf('BattleScript_AbilityNoSpecificStatLoss'));
        setLastUsedAbility(mon.ability);
        deps.recordAbility(activeBattler, mon.ability);
      }
      return STAT_CHANGE_DIDNT_WORK;
    } else if (mon.ability === ABILITY_HYPER_CUTTER && !certain && statId === STAT_ATK) {
      // 1:1 décomp 7025-7037 : Hyper Cutter bloque la baisse d'ATTAQUE.
      if (deps && flags === STAT_CHANGE_ALLOW_PTR) {
        deps.pushReturnPtr(BS_ptr);
        gBattleScripting.battler = activeBattler;
        deps.setScriptPtr(deps.offsetOf('BattleScript_AbilityNoSpecificStatLoss'));
        setLastUsedAbility(mon.ability);
        deps.recordAbility(activeBattler, mon.ability);
      }
      return STAT_CHANGE_DIDNT_WORK;
    } else if (mon.ability === ABILITY_SHIELD_DUST && flags === 0) {
      // 1:1 décomp 7038-7041 : Shield Dust bloque les effets secondaires (flags == 0).
      return STAT_CHANGE_DIDNT_WORK;
    }

    // 1:1 décomp battle_script_commands.c:7044-7057. Build gBattleTextBuff2.
    const sv = -magnitude;  // statValue = -GET_STAT_BUFF_VALUE(statValue) (= -magnitude).
    _gBattleTextBuff2_SS[0] = B_BUFF_PLACEHOLDER_BEGIN;
    let idx = 1;
    if (sv === -2) {
      _gBattleTextBuff2_SS[1] = B_BUFF_STRING;
      _gBattleTextBuff2_SS[2] = STRINGID_STATHARSHLY & 0xFF;
      _gBattleTextBuff2_SS[3] = (STRINGID_STATHARSHLY >> 8) & 0xFF;
      idx = 4;
    }
    _gBattleTextBuff2_SS[idx++] = B_BUFF_STRING;
    _gBattleTextBuff2_SS[idx++] = STRINGID_STATFELL & 0xFF;
    _gBattleTextBuff2_SS[idx++] = (STRINGID_STATFELL >> 8) & 0xFF;
    _gBattleTextBuff2_SS[idx] = B_BUFF_EOS;

    // 1:1 décomp : if stage already MIN → set MULTISTRING_CHOOSER to WONT_DECREASE.
    if (mon.statStages[statId] === MIN_STAT_STAGE) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STAT_WONT_DECREASE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = gBattlerTarget === activeBattler
        ? 1 /* B_MSG_DEFENDER_STAT_FELL */
        : 0 /* B_MSG_ATTACKER_STAT_FELL */;
    }
  } else {
    // 1:1 décomp battle_script_commands.c:7067-7080. Build gBattleTextBuff2.
    const sv = magnitude;  // statValue = GET_STAT_BUFF_VALUE(statValue).
    _gBattleTextBuff2_SS[0] = B_BUFF_PLACEHOLDER_BEGIN;
    let idx = 1;
    if (sv === 2) {
      _gBattleTextBuff2_SS[1] = B_BUFF_STRING;
      _gBattleTextBuff2_SS[2] = STRINGID_STATSHARPLY & 0xFF;
      _gBattleTextBuff2_SS[3] = (STRINGID_STATSHARPLY >> 8) & 0xFF;
      idx = 4;
    }
    _gBattleTextBuff2_SS[idx++] = B_BUFF_STRING;
    _gBattleTextBuff2_SS[idx++] = STRINGID_STATROSE & 0xFF;
    _gBattleTextBuff2_SS[idx++] = (STRINGID_STATROSE >> 8) & 0xFF;
    _gBattleTextBuff2_SS[idx] = B_BUFF_EOS;

    // stat increase
    if (mon.statStages[statId] === MAX_STAT_STAGE) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STAT_WONT_INCREASE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = gBattlerTarget === activeBattler
        ? 1 /* B_MSG_DEFENDER_STAT_ROSE */
        : 0 /* B_MSG_ATTACKER_STAT_ROSE */;
    }
  }

  // Apply delta + clamp.
  mon.statStages[statId] += appliedDelta;
  if (mon.statStages[statId] < MIN_STAT_STAGE) mon.statStages[statId] = MIN_STAT_STAGE;
  if (mon.statStages[statId] > MAX_STAT_STAGE) mon.statStages[statId] = MAX_STAT_STAGE;

  // If "wont change" : if ALLOW_PTR set → set MISSED, else return DIDNT_WORK.
  const wontChange = gBattleCommunication[MULTISTRING_CHOOSER] === B_MSG_STAT_WONT_INCREASE
    || gBattleCommunication[MULTISTRING_CHOOSER] === B_MSG_STAT_WONT_DECREASE;
  if (wontChange && (flags & STAT_CHANGE_ALLOW_PTR)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
  }
  if (wontChange && !(flags & STAT_CHANGE_ALLOW_PTR)) {
    return STAT_CHANGE_DIDNT_WORK;
  }

  return STAT_CHANGE_WORKED;
}

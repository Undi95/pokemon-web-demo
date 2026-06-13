/**
 * game/battle_script_commands.ts — MIROIR 1:1 (partiel) de
 * `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`.
 *
 * Fichier amorcé par migration (éclatement de l'interpréteur d'opcodes côté
 * engine vers le miroir game/, comme pokemon.ts). Contient pour l'instant la
 * SECTION TYPE-CALC (battle_script_commands.c:1321-1499) :
 *   - `ModulateDmgByType(multiplier)` (1321) : multiplie gBattleMoveDamage par
 *     multiplier/10 + set MOVE_RESULT_* flags selon SE/NVE/no effect.
 *   - `AttacksThisTurn(battler, move)` (8224) : 1 si charging turn, sinon 2.
 *   - `Cmd_typecalc` (1355) : iterate gTypeEffectiveness chart, STAB +1.5,
 *     Levitate immunity, Wonder Guard immunity. Skip si gCurrentMove == STRUGGLE.
 *
 * Le reste de battle_script_commands.c (l'interpréteur d'opcodes complet,
 * encore dans src/engine/battle/battle-script-commands.ts) sera absorbé ici
 * lors de la migration finale du groupe ; ces définitions dédupliqueront alors
 * par tsc (TS2300).
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gCurrentMove,
  gMoveResultFlags,
  gBattleMoveDamage,
  gLastLandedMoves,
  gLastHitByType,
  gBattleCommunication,
  gBattleWeather,
  gHitMarker,
  gProtectStructs,
  gSideTimers,
  gSpecialStatuses,
  gBattleScripting,
  setMoveResultFlags,
  setBattleMoveDamage,
  setLastUsedAbility,
  setActiveBattler,
} from '../engine/battle/state';
import { B_WEATHER_SUN, HITMARKER_CHARGING } from '../engine/battle/constants';
import {
  EFFECT_SOLAR_BEAM, EFFECT_SKULL_BASH, EFFECT_RAZOR_WIND, EFFECT_SKY_ATTACK,
  EFFECT_SEMI_INVULNERABLE, EFFECT_BIDE,
} from '../engine/decomp-data/include/constants/battle_move_effects-data';
import { getBattleMove } from '../engine/battle/data/battle-moves';
import {
  gTypeEffectiveness,
  TYPE_FORESIGHT,
  TYPE_ENDTABLE,
  TYPE_MUL_NO_EFFECT,
  TYPE_MUL_NOT_EFFECTIVE,
  TYPE_MUL_SUPER_EFFECTIVE,
} from '../engine/battle/data/type-effectiveness';
import {
  MOVE_STRUGGLE,
  MOVE_RESULT_MISSED,
  MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NO_EFFECT,
  STATUS2_FORESIGHT,
  ABILITY_LEVITATE,
  ABILITY_WONDER_GUARD,
  TYPE_GROUND,
  MISS_TYPE,
  B_MSG_GROUND_MISS,
  B_MSG_AVOIDED_DMG,
  GET_BATTLER_SIDE,
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
} from '../engine/battle/constants';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_SS,
  gBattleTextBuff2 as _gBattleTextBuff2_SS,
  PREPARE_STAT_BUFFER,
  B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_STRING, B_BUFF_EOS,
} from '../engine/battle/text-buffers';
import { RecordAbilityBattle } from '../engine/battle/util';

// ─── ModulateDmgByType ──────────────────────────────────────────────────────

/** 1:1 décomp `ModulateDmgByType(u8 multiplier)` (battle_script_commands.c:1321). */
function ModulateDmgByType(multiplier: number): void {
  let dmg = Math.floor(gBattleMoveDamage * multiplier / 10);
  if (dmg === 0 && multiplier !== 0) dmg = 1;
  setBattleMoveDamage(dmg);

  let flags = gMoveResultFlags;
  switch (multiplier) {
    case TYPE_MUL_NO_EFFECT:
      flags |= MOVE_RESULT_DOESNT_AFFECT_FOE;
      flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
      flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
      break;
    case TYPE_MUL_NOT_EFFECTIVE:
      if (getBattleMove(gCurrentMove).power && !(flags & MOVE_RESULT_NO_EFFECT)) {
        if (flags & MOVE_RESULT_SUPER_EFFECTIVE) {
          flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
        } else {
          flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
        }
      }
      break;
    case TYPE_MUL_SUPER_EFFECTIVE:
      if (getBattleMove(gCurrentMove).power && !(flags & MOVE_RESULT_NO_EFFECT)) {
        if (flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
        } else {
          flags |= MOVE_RESULT_SUPER_EFFECTIVE;
        }
      }
      break;
  }
  setMoveResultFlags(flags);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (include/battle.h:472). */
function isBattlerOfType(battlerIdx: number, type: number): boolean {
  const mon = gBattleMons[battlerIdx];
  // `BattleMon.type1` + `type2` (= notre struct correspond aux types[0]/types[1]).
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `GET_MOVE_TYPE(move, typeArg)` (include/battle.h:458). Pour
 *  l'instant, pas de dynamicMoveType state, donc retourne move.type direct. */
function getMoveType(move: number): number {
  return getBattleMove(move).type;
}

/** 1:1 décomp `AttacksThisTurn(u8 battler, u16 move)` (battle_script_commands.c:8224-8242) :
 *  ```c
 *  static u8 AttacksThisTurn(u8 battler, u16 move) // returns 1 if charging turn, otherwise 2
 *  {
 *      // first argument is unused
 *      if (gBattleMoves[move].effect == EFFECT_SOLAR_BEAM
 *          && (gBattleWeather & B_WEATHER_SUN))
 *          return 2;
 *      if (gBattleMoves[move].effect == EFFECT_SKULL_BASH
 *       || gBattleMoves[move].effect == EFFECT_RAZOR_WIND
 *       || gBattleMoves[move].effect == EFFECT_SKY_ATTACK
 *       || gBattleMoves[move].effect == EFFECT_SOLAR_BEAM
 *       || gBattleMoves[move].effect == EFFECT_SEMI_INVULNERABLE
 *       || gBattleMoves[move].effect == EFFECT_BIDE)
 *      {
 *          if ((gHitMarker & HITMARKER_CHARGING))
 *              return 1;
 *      }
 *      return 2;
 *  }
 *  ```
 *  Wonder Guard check (= `AttacksThisTurn() == 2`) skip si charging turn. */
export function attacksThisTurn(_battler: number, move: number): number {
  const effect = getBattleMove(move).effect;
  if (effect === EFFECT_SOLAR_BEAM && (gBattleWeather & B_WEATHER_SUN)) {
    return 2;
  }
  if (effect === EFFECT_SKULL_BASH
   || effect === EFFECT_RAZOR_WIND
   || effect === EFFECT_SKY_ATTACK
   || effect === EFFECT_SOLAR_BEAM
   || effect === EFFECT_SEMI_INVULNERABLE
   || effect === EFFECT_BIDE) {
    if (gHitMarker & HITMARKER_CHARGING) {
      return 1;
    }
  }
  return 2;
}

// ─── Cmd_typecalc ───────────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_typecalc` (battle_script_commands.c:1355-1424).
 *
 *  Logic :
 *  1. Si move == STRUGGLE → advance, skip type effectiveness.
 *  2. Calcul moveType.
 *  3. Si attacker.types include moveType → STAB ×1.5.
 *  4. Si target.ability == LEVITATE && moveType == GROUND → immunité, MISS_TYPE.
 *  5. Iterate gTypeEffectiveness table :
 *     - skip FORESIGHT bloc si target n'a pas STATUS2_FORESIGHT
 *     - match (atkType, defType[0]) → ModulateDmgByType
 *     - match (atkType, defType[1]) → ModulateDmgByType
 *  6. Si target.ability == WONDER_GUARD && pas super-effective et move power > 0 →
 *     immunité.
 *  7. Si MOVE_RESULT_DOESNT_AFFECT_FOE → set protectStruct.targetNotAffected. */
export function Cmd_typecalc(): boolean {
  if (gCurrentMove === MOVE_STRUGGLE) {
    return false;
  }

  const moveType = getMoveType(gCurrentMove);

  // STAB ×1.5.
  if (isBattlerOfType(gBattlerAttacker, moveType)) {
    let dmg = gBattleMoveDamage * 15;
    dmg = Math.floor(dmg / 10);
    setBattleMoveDamage(dmg);
  }

  const targetMon = gBattleMons[gBattlerTarget];

  // Levitate immunity vs Ground.
  if (targetMon.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    setLastUsedAbility(targetMon.ability);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_GROUND_MISS;
    RecordAbilityBattle(gBattlerTarget, targetMon.ability);
  } else {
    // Iterate type chart.
    let i = 0;
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (targetMon.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      }
      if (gTypeEffectiveness[i] === moveType) {
        // Check type1.
        if (gTypeEffectiveness[i + 1] === targetMon.type1) {
          ModulateDmgByType(gTypeEffectiveness[i + 2]);
        }
        // Check type2 (= si différent de type1).
        if (gTypeEffectiveness[i + 1] === targetMon.type2 && targetMon.type1 !== targetMon.type2) {
          ModulateDmgByType(gTypeEffectiveness[i + 2]);
        }
      }
      i += 3;
    }
  }

  // Wonder Guard immunity (= pas super-effective et move power > 0).
  if (
    targetMon.ability === ABILITY_WONDER_GUARD
    && attacksThisTurn(gBattlerAttacker, gCurrentMove) === 2
    && (!(gMoveResultFlags & MOVE_RESULT_SUPER_EFFECTIVE)
       || ((gMoveResultFlags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
           === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
    && getBattleMove(gCurrentMove).power
  ) {
    setLastUsedAbility(ABILITY_WONDER_GUARD);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_AVOIDED_DMG;
    RecordAbilityBattle(gBattlerTarget, ABILITY_WONDER_GUARD);
  }

  // 1:1 décomp pokemon.c:Cmd_typecalc :
  // `if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE)
  //    gProtectStructs[gBattlerAttacker].targetNotAffected = 1;`
  if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) {
    gProtectStructs[gBattlerAttacker].targetNotAffected = 1;
  }

  return false;
}

// ─── ChangeStatBuffs (battle_script_commands.c:6940-7110) ───────────────────

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

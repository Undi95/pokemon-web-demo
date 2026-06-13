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
  gEffectBattler,
  setEffectBattler,
  gActiveBattler,
  setHitMarker,
  gSideStatuses,
  gBattlersCount,
  gHpDealt,
  gPaydayMoney,
  setPaydayMoney,
  gLastUsedAbility,
  gBattleTypeFlags,
  gWishFutureKnock,
  gBattlerPartyIndexes,
  gDisableStructs,
  gLockedMoves,
  gBattleStruct,
  gCritMultiplier,
  gDynamicBasePower,
  setDynamicBasePower,
  gStatuses3,
  setMoveResultFlags,
  setBattleMoveDamage,
  setLastUsedAbility,
  setActiveBattler,
  setLastUsedItem as setLastUsedItemSME,
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
  STATUS3_CHARGED_UP,
  TYPE_ELECTRIC,
} from '../engine/battle/constants';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_SS,
  gBattleTextBuff2 as _gBattleTextBuff2_SS,
  PREPARE_STAT_BUFFER,
  B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_STRING, B_BUFF_EOS,
} from '../engine/battle/text-buffers';
import { RecordAbilityBattle } from '../engine/battle/util';

// ─── Imports additionnels pour la section SetMoveEffect (battle_script_commands.c) ─
import type { BattleScriptContext } from '../engine/battle/script-interpreter';
import { getBattleScriptOffset, Random } from '../engine/battle/script-interpreter';
import { ITEM_ENIGMA_BERRY } from '../engine/decomp-data/include/constants/items-data';
import {
  RecordAbilityBattle as _recordAbilityBattleSME,
  RecordAbilityBattle as _recordAbilityBattleFullSME,
} from '../engine/battle/util';
import { CancelMultiTurnMoves } from './battle_util';
// ─── Imports additionnels pour la section TypeCalc/AI_CalcDmg (battle_script_commands.c) ─
import { CalculateBaseDamage } from './pokemon';
import { getSpeciesInfo } from '../engine/data/game-data';
import { reverseDecompConstant, resolveDecompConstant } from '../engine/system/decomp-constants';
import {
  STATUS1_SLEEP, STATUS1_POISON, STATUS1_BURN, STATUS1_FREEZE,
  STATUS1_PARALYSIS, STATUS1_TOXIC_POISON, STATUS1_ANY,
  STATUS2_SUBSTITUTE, STATUS2_CONFUSION,
  STATUS2_RECHARGE, STATUS2_RAGE,
  STATUS2_MULTIPLETURNS, STATUS2_UPROAR, STATUS2_WRAPPED,
  STATUS2_ESCAPE_PREVENTION, STATUS2_NIGHTMARE,
  STATUS2_LOCK_CONFUSE, STATUS2_FLINCHED,
  SIDE_STATUS_SAFEGUARD,
  HITMARKER_STATUS_ABILITY_EFFECT, HITMARKER_SYNCHRONIZE_EFFECT,
  ABILITY_IMMUNITY, ABILITY_VITAL_SPIRIT, ABILITY_INSOMNIA,
  ABILITY_WATER_VEIL, ABILITY_LIMBER, ABILITY_MAGMA_ARMOR,
  ABILITY_OWN_TEMPO, ABILITY_INNER_FOCUS, ABILITY_STICKY_HOLD,
  ABILITY_SOUNDPROOF,
  SET_STAT_BUFF_VALUE, STAT_BUFF_NEGATIVE,
  STATUS1_SLEEP_TURN as _STATUS1_SLEEP_TURN_FN,
  IS_BATTLER_OF_TYPE,
  TYPE_POISON, TYPE_STEEL, TYPE_FIRE, TYPE_ICE,
  B_SIDE_PLAYER, B_SIDE_OPPONENT,
  BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_SECRET_BASE,
} from '../engine/battle/constants';

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

// ═══ SetMoveEffect + tables (battle_script_commands.c:608-2780) ═══════════

// 1:1 décomp `IS_ITEM_MAIL(itemId)` (mail.h:6-17).
const _MAIL_ITEMS_SME = new Set([
  121 /* ITEM_ORANGE_MAIL */, 122 /* ITEM_HARBOR_MAIL */,
  123 /* ITEM_GLITTER_MAIL */, 124 /* ITEM_MECH_MAIL */,
  125 /* ITEM_WOOD_MAIL */,    126 /* ITEM_WAVE_MAIL */,
  127 /* ITEM_BEAD_MAIL */,    128 /* ITEM_SHADOW_MAIL */,
  129 /* ITEM_TROPIC_MAIL */,  130 /* ITEM_DREAM_MAIL */,
  131 /* ITEM_FAB_MAIL */,     132 /* ITEM_RETRO_MAIL */,
]);
function _isItemMailSME(itemId: number): boolean {
  return _MAIL_ITEMS_SME.has(itemId);
}

// ─── 1:1 décomp sStatusFlagsForMoveEffects[] (battle_script_commands.c:608) ─

/** 1:1 décomp `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]`. Maps
 *  MOVE_EFFECT_* (0..53) → status1/status2 flag. */
const sStatusFlagsForMoveEffects: number[] = [];
sStatusFlagsForMoveEffects[1 /* MOVE_EFFECT_SLEEP */] = STATUS1_SLEEP;
sStatusFlagsForMoveEffects[2 /* MOVE_EFFECT_POISON */] = STATUS1_POISON;
sStatusFlagsForMoveEffects[3 /* MOVE_EFFECT_BURN */] = STATUS1_BURN;
sStatusFlagsForMoveEffects[4 /* MOVE_EFFECT_FREEZE */] = STATUS1_FREEZE;
sStatusFlagsForMoveEffects[5 /* MOVE_EFFECT_PARALYSIS */] = STATUS1_PARALYSIS;
sStatusFlagsForMoveEffects[6 /* MOVE_EFFECT_TOXIC */] = STATUS1_TOXIC_POISON;
sStatusFlagsForMoveEffects[7 /* MOVE_EFFECT_CONFUSION */] = STATUS2_CONFUSION;
sStatusFlagsForMoveEffects[8 /* MOVE_EFFECT_FLINCH */] = STATUS2_FLINCHED;
sStatusFlagsForMoveEffects[10 /* MOVE_EFFECT_UPROAR */] = STATUS2_UPROAR;
sStatusFlagsForMoveEffects[12 /* MOVE_EFFECT_CHARGING */] = STATUS2_MULTIPLETURNS;
sStatusFlagsForMoveEffects[13 /* MOVE_EFFECT_WRAP */] = STATUS2_WRAPPED;
sStatusFlagsForMoveEffects[29 /* MOVE_EFFECT_RECHARGE */] = STATUS2_RECHARGE;
sStatusFlagsForMoveEffects[32 /* MOVE_EFFECT_PREVENT_ESCAPE */] = STATUS2_ESCAPE_PREVENTION;
sStatusFlagsForMoveEffects[33 /* MOVE_EFFECT_NIGHTMARE */] = STATUS2_NIGHTMARE;
sStatusFlagsForMoveEffects[53 /* MOVE_EFFECT_THRASH */] = STATUS2_LOCK_CONFUSE;

// ─── 1:1 décomp sMoveEffectBS_Ptrs[] (battle_script_commands.c:627) ────────

/** 1:1 décomp `sMoveEffectBS_Ptrs[]`. Maps MOVE_EFFECT_* → label name de
 *  BattleScript_MoveEffect*. */
const sMoveEffectBS_Ptrs_labels: string[] = [];
const _DEFAULT_LABEL = 'BattleScript_MoveEffectSleep';
sMoveEffectBS_Ptrs_labels[0] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[1 /* MOVE_EFFECT_SLEEP */] = 'BattleScript_MoveEffectSleep';
sMoveEffectBS_Ptrs_labels[2 /* MOVE_EFFECT_POISON */] = 'BattleScript_MoveEffectPoison';
sMoveEffectBS_Ptrs_labels[3 /* MOVE_EFFECT_BURN */] = 'BattleScript_MoveEffectBurn';
sMoveEffectBS_Ptrs_labels[4 /* MOVE_EFFECT_FREEZE */] = 'BattleScript_MoveEffectFreeze';
sMoveEffectBS_Ptrs_labels[5 /* MOVE_EFFECT_PARALYSIS */] = 'BattleScript_MoveEffectParalysis';
sMoveEffectBS_Ptrs_labels[6 /* MOVE_EFFECT_TOXIC */] = 'BattleScript_MoveEffectToxic';
sMoveEffectBS_Ptrs_labels[7 /* MOVE_EFFECT_CONFUSION */] = 'BattleScript_MoveEffectConfusion';
sMoveEffectBS_Ptrs_labels[8 /* MOVE_EFFECT_FLINCH */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[9 /* MOVE_EFFECT_TRI_ATTACK */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[10 /* MOVE_EFFECT_UPROAR */] = 'BattleScript_MoveEffectUproar';
sMoveEffectBS_Ptrs_labels[11 /* MOVE_EFFECT_PAYDAY */] = 'BattleScript_MoveEffectPayDay';
sMoveEffectBS_Ptrs_labels[12 /* MOVE_EFFECT_CHARGING */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[13 /* MOVE_EFFECT_WRAP */] = 'BattleScript_MoveEffectWrap';
sMoveEffectBS_Ptrs_labels[14 /* MOVE_EFFECT_RECOIL_25 */] = 'BattleScript_MoveEffectRecoil';
// Stat+1 / Stat-1 / Stat+2 / Stat-2 / others default to sleep (= no-op).
for (let i = 15; i <= 28; i++) sMoveEffectBS_Ptrs_labels[i] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[29 /* MOVE_EFFECT_RECHARGE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[30 /* MOVE_EFFECT_RAGE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[31 /* MOVE_EFFECT_STEAL_ITEM */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[32 /* MOVE_EFFECT_PREVENT_ESCAPE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[33 /* MOVE_EFFECT_NIGHTMARE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[34 /* MOVE_EFFECT_ALL_STATS_UP */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[35 /* MOVE_EFFECT_RAPIDSPIN */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[36 /* MOVE_EFFECT_REMOVE_PARALYSIS */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[37 /* MOVE_EFFECT_ATK_DEF_DOWN */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[38 /* MOVE_EFFECT_RECOIL_33 */] = 'BattleScript_MoveEffectRecoil';

function _resolveMoveEffectBS(effect: number): number {
  const label = sMoveEffectBS_Ptrs_labels[effect] ?? _DEFAULT_LABEL;
  return getBattleScriptOffset(label);
}

// ─── 1:1 décomp helper stubs ────────────────────────────────────────────────

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullSME(battler, ability);
}

/** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Renvoie
 *  l'index dans gBattlerByTurnOrder[]. Notre port : retourne battler. */
function _getBattlerTurnOrderNum(battler: number): number {
  return battler;
}

/** Décomp `gCurrentTurnActionNumber`. Notre port : 0. */
const _gCurrentTurnActionNumber = 0;

/** 1:1 décomp `WEATHER_HAS_EFFECT` macro — `(!CloudNine && !AirLock)`.
 *  Notre port : true. */
const _WEATHER_HAS_EFFECT = true;

/** Décomp `BATTLE_TYPE_TRAINER_HILL` — utilisé pour `MOVE_EFFECT_STEAL_ITEM`
 *  block. Notre const peut être 0 si on n'a pas le flag. */
const _BATTLE_TYPE_TRAINER_HILL_FLAG = BATTLE_TYPE_TRAINER_HILL ?? 0;

// ─── B_MSG_* constants utilisés par SetMoveEffect ─────────────────────────

const B_MSG_ABILITY_PREVENTS_ABILITY_STATUS = 1;
const B_MSG_ABILITY_PREVENTS_MOVE_STATUS = 0;
const B_MSG_STATUS_HAD_NO_EFFECT = 2;
const B_MSG_STATUSED = 0;
const B_MSG_STATUSED_BY_ABILITY = 1;
const MULTISTRING_CHOOSER_IDX = 5;
const MOVE_EFFECT_BYTE_IDX = 3;

// ─── Macros INCREMENT_RESET_RETURN / RESET_RETURN ─────────────────────────

/** 1:1 décomp `INCREMENT_RESET_RETURN` macro :
 *  gBattlescriptCurrInstr++; gBattleCommunication[MOVE_EFFECT_BYTE] = 0; return;
 *
 *  Note : le `++` du décomp = avance past l'opcode byte. Dans notre impl,
 *  le dispatch loop a déjà fait `ctx.scriptPtr++` AVANT d'appeler le handler.
 *  Donc on n'a PLUS rien à advance ici. */
function _incrementResetReturn(_ctx: BattleScriptContext): void {
  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

/** 1:1 décomp `RESET_RETURN` macro :
 *  gBattleCommunication[MOVE_EFFECT_BYTE] = 0; return; */
function _resetReturn(): void {
  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

// ─── Trapping moves list (utilisé par MOVE_EFFECT_WRAP MULTISTRING) ───────

/** 1:1 décomp `gTrappingMoves[]` (= moves qui wrap : BIND, WRAP, FIRE_SPIN,
 *  CLAMP, WHIRLPOOL, SAND_TOMB). */
const _gTrappingMoves: number[] = [
  20  /* MOVE_BIND */,
  35  /* MOVE_WRAP */,
  83  /* MOVE_FIRE_SPIN */,
  128 /* MOVE_CLAMP */,
  250 /* MOVE_WHIRLPOOL */,
  328 /* MOVE_SAND_TOMB */,
];

// ─── Main fn ────────────────────────────────────────────────────────────────

/** 1:1 décomp `SetMoveEffect(bool primary, u8 certain)` (battle_script_commands.c:2218).
 *  Applique le secondary effect d'un move : status, stat changes, recoil, etc.
 *
 *  `ctx` = script context (= notre équivalent gBattlescriptCurrInstr / push stack).
 *  `primary` = TRUE si appelé via seteffectprimary (= status garanti, ignore
 *              ability immunities pour la plupart).
 *  `certain` = MOVE_EFFECT_CERTAIN bit (= effect garanti même contre certaines
 *              abilities). */
export function SetMoveEffect(ctx: BattleScriptContext, primary: boolean, certain: number): void {
  let statusChanged = false;
  let affectsUser = 0;
  let noSunCanFreeze = true;

  if (gBattleCommunication[MOVE_EFFECT_BYTE_IDX] & MOVE_EFFECT_AFFECTS_USER) {
    setEffectBattler(gBattlerAttacker);
    gBattleCommunication[MOVE_EFFECT_BYTE_IDX] &= ~MOVE_EFFECT_AFFECTS_USER;
    affectsUser = MOVE_EFFECT_AFFECTS_USER;
    gBattleScripting.battler = gBattlerTarget;
  } else {
    setEffectBattler(gBattlerTarget);
    gBattleScripting.battler = gBattlerAttacker;
  }

  // SHIELD_DUST early-return.
  if (gBattleMons[gEffectBattler].ability === ABILITY_SHIELD_DUST
      && !(gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
      && !primary
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= 9) {
    _incrementResetReturn(ctx);
    return;
  }

  // SAFEGUARD early-return.
  if ((gSideStatuses[GET_BATTLER_SIDE(gEffectBattler)] & SIDE_STATUS_SAFEGUARD)
      && !(gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
      && !primary
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= 7) {
    _incrementResetReturn(ctx);
    return;
  }

  // HP == 0 + not PAYDAY/STEAL → skip.
  if (gBattleMons[gEffectBattler].hp === 0
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] !== 11 /* MOVE_EFFECT_PAYDAY */
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] !== 31 /* MOVE_EFFECT_STEAL_ITEM */) {
    _incrementResetReturn(ctx);
    return;
  }

  // SUBSTITUTE blocks non-self effects.
  if ((gBattleMons[gEffectBattler].status2 & STATUS2_SUBSTITUTE)
      && affectsUser !== MOVE_EFFECT_AFFECTS_USER) {
    _incrementResetReturn(ctx);
    return;
  }

  const PRIMARY_STATUS_MOVE_EFFECT_LOCAL = 6 /* MOVE_EFFECT_TOXIC */;

  if (gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= PRIMARY_STATUS_MOVE_EFFECT_LOCAL) {
    // ─── Primary status effects (Sleep, Poison, Burn, Freeze, Paralysis, Toxic) ─
    const statusFlag = sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]];

    if (statusFlag === STATUS1_SLEEP) {
      // 1:1 décomp Sleep case.
      if (gBattleMons[gEffectBattler].ability !== ABILITY_SOUNDPROOF) {
        let i = 0;
        for (; i < gBattlersCount && !(gBattleMons[i].status2 & STATUS2_UPROAR); i++) {}
        setActiveBattler(i);
      } else {
        setActiveBattler(gBattlersCount);
      }
      if (gBattleMons[gEffectBattler].status1) {
        // already statused → skip
      } else if (gActiveBattler !== gBattlersCount) {
        // uproar active → skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_VITAL_SPIRIT) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_INSOMNIA) {
        // skip
      } else {
        CancelMultiTurnMoves(gEffectBattler);
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_POISON) {
      // 1:1 décomp Poison case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_IMMUNITY);
        _recordAbilityBattle(gEffectBattler, ABILITY_IMMUNITY);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if ((IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
            || IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL))
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)) {
        // skip
      } else if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL)) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY) {
        // skip
      } else {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_BURN) {
      // 1:1 décomp Burn case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_WATER_VEIL
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_WATER_VEIL);
        _recordAbilityBattle(gEffectBattler, ABILITY_WATER_VEIL);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_BRNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_FIRE)
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_BRNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_FIRE)) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_WATER_VEIL) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_FREEZE) {
      // 1:1 décomp Freeze case.
      if (_WEATHER_HAS_EFFECT && (gBattleWeather & B_WEATHER_SUN)) {
        noSunCanFreeze = false;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_ICE)) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (!noSunCanFreeze) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_MAGMA_ARMOR) {
        // skip
      } else {
        CancelMultiTurnMoves(gEffectBattler);
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_PARALYSIS) {
      // 1:1 décomp Paralysis case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_LIMBER) {
        if (primary || certain === MOVE_EFFECT_CERTAIN) {
          setLastUsedAbility(ABILITY_LIMBER);
          _recordAbilityBattle(gEffectBattler, ABILITY_LIMBER);
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_PRLZPrevention');
          if (off >= 0) ctx.scriptPtr = off;
          if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
            gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
            setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
          }
          _resetReturn();
          return;
        }
        // else fall through (= no statusChanged, will hit increment-reset-return below).
      } else if (!gBattleMons[gEffectBattler].status1) {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_TOXIC_POISON) {
      // 1:1 décomp Toxic case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_IMMUNITY);
        _recordAbilityBattle(gEffectBattler, ABILITY_IMMUNITY);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if ((IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
            || IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL))
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (!IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
                  && !IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL)) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY) {
          // skip
        } else {
          gBattleMons[gEffectBattler].status1 &= ~STATUS1_TOXIC_POISON;
          gBattleMons[gEffectBattler].status1 &= ~STATUS1_POISON;
          statusChanged = true;
        }
      } else {
        setMoveResultFlags(gMoveResultFlags | 0x4 /* MOVE_RESULT_DOESNT_AFFECT_FOE */);
      }
    }

    if (statusChanged) {
      // 1:1 décomp : apply status1 + push current+1 + jump à sMoveEffectBS_Ptrs[effect].
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      if (sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]] === STATUS1_SLEEP) {
        gBattleMons[gEffectBattler].status1 |= _STATUS1_SLEEP_TURN_FN((Random() & 3) + 2);
      } else {
        gBattleMons[gEffectBattler].status1 |= sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]];
      }
      const off = _resolveMoveEffectBS(gBattleCommunication[MOVE_EFFECT_BYTE_IDX]);
      if (off >= 0) ctx.scriptPtr = off;
      setActiveBattler(gEffectBattler);
      // BtlController_EmitSetMonData (= sync battler status1 → party storage). Wired via batch C bridge.
      if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUSED_BY_ABILITY;
        setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
      } else {
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUSED;
      }
      const eff = gBattleCommunication[MOVE_EFFECT_BYTE_IDX];
      if (eff === 2 /* POISON */ || eff === 6 /* TOXIC */ || eff === 5 /* PARALYSIS */ || eff === 3 /* BURN */) {
        // 1:1 décomp l.2508-2510 : écrire synchronizeMoveEffect PUIS poser le HITMARKER.
        // Synchro (ability-battle-effects.ts) LIT gBattleStruct.synchronizeMoveEffect pour
        // rejouer le statut sur l'attaquant — sans cette écriture il lisait 0 (statut faux/aucun).
        gBattleStruct.synchronizeMoveEffect = eff;
        setHitMarker(gHitMarker | HITMARKER_SYNCHRONIZE_EFFECT);
      }
      return;
    } else {
      // Not statusChanged → reset + advance.
      gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
      // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      return;
    }
  } else {
    // ─── Secondary effects (CONFUSION, FLINCH, UPROAR, PAYDAY, etc.) ──────
    if (gBattleMons[gEffectBattler].status2 & sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]]) {
      // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
    } else {
      const eff = gBattleCommunication[MOVE_EFFECT_BYTE_IDX];
      if (eff === 7 /* CONFUSION */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_OWN_TEMPO
            || (gBattleMons[gEffectBattler].status2 & STATUS2_CONFUSION)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= ((Random() % 4 + 2) & STATUS2_CONFUSION);
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 8 /* FLINCH */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_INNER_FOCUS) {
          if (primary || certain === MOVE_EFFECT_CERTAIN) {
            setLastUsedAbility(ABILITY_INNER_FOCUS);
            _recordAbilityBattle(gEffectBattler, ABILITY_INNER_FOCUS);
            const off = getBattleScriptOffset('BattleScript_FlinchPrevention');
            if (off >= 0) ctx.scriptPtr = off;
          } else {
            // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
          }
        } else {
          if (_getBattlerTurnOrderNum(gEffectBattler) > _gCurrentTurnActionNumber) {
            gBattleMons[gEffectBattler].status2 |= sStatusFlagsForMoveEffects[eff];
          }
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 10 /* UPROAR */) {
        if (!(gBattleMons[gEffectBattler].status2 & STATUS2_UPROAR)) {
          gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
          gLockedMoves[gEffectBattler] = gCurrentMove;
          gBattleMons[gEffectBattler].status2 |= ((Random() & 3) + 2) << 4; // STATUS2_UPROAR_TURN
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
        } else {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 11 /* PAYDAY */) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          const oldPayday = gPaydayMoney;
          let newPayday = gPaydayMoney + gBattleMons[gBattlerAttacker].level * 5;
          if (oldPayday > newPayday) newPayday = 0xFFFF;
          setPaydayMoney(newPayday);
        }
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 9 /* TRI_ATTACK */) {
        if (gBattleMons[gEffectBattler].status1) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = (Random() % 3) + 3;
          SetMoveEffect(ctx, false, 0);
          return;
        }
      } else if (eff === 12 /* CHARGING */) {
        gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
        gLockedMoves[gEffectBattler] = gCurrentMove;
        gProtectStructs[gEffectBattler].chargingTurn = 1;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 13 /* WRAP */) {
        if (gBattleMons[gEffectBattler].status2 & STATUS2_WRAPPED) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= ((Random() & 3) + 3) << 13; // STATUS2_WRAPPED_TURN
          // 1:1 décomp battle_script_commands.c:2620-2622 :
          //   wrappedMove[battler*2 + 0] = move & 0xFF (lo)
          //   wrappedMove[battler*2 + 1] = (move >> 8) & 0xFF (hi)
          //   wrappedBy[battler] = attacker
          gBattleStruct.wrappedMove[gEffectBattler * 2 + 0] = gCurrentMove & 0xFF;
          gBattleStruct.wrappedMove[gEffectBattler * 2 + 1] = (gCurrentMove >> 8) & 0xFF;
          gBattleStruct.wrappedBy[gEffectBattler] = gBattlerAttacker;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
          // 1:1 décomp : MULTISTRING_CHOOSER = index of move in gTrappingMoves[].
          let idx = 0;
          for (; idx < _gTrappingMoves.length - 1; idx++) {
            if (_gTrappingMoves[idx] === gCurrentMove) break;
          }
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = idx;
        }
      } else if (eff === 14 /* RECOIL_25 */) {
        let dmg = Math.floor(gHpDealt / 4);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff >= 15 && eff <= 21 /* ATK..EVS_PLUS_1 */) {
        const stat = eff - 15 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(1), stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatUp');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 22 && eff <= 28 /* ATK..EVS_MINUS_1 */) {
        const stat = eff - 22 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(1) | STAT_BUFF_NEGATIVE, stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatDown');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 39 && eff <= 45 /* ATK..EVS_PLUS_2 */) {
        const stat = eff - 39 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(2), stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatUp');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 46 && eff <= 52 /* ATK..EVS_MINUS_2 */) {
        const stat = eff - 46 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(2) | STAT_BUFF_NEGATIVE, stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatDown');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 29 /* RECHARGE */) {
        gBattleMons[gEffectBattler].status2 |= STATUS2_RECHARGE;
        gDisableStructs[gEffectBattler].rechargeTimer = 2;
        gLockedMoves[gEffectBattler] = gCurrentMove;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 30 /* RAGE */) {
        gBattleMons[gBattlerAttacker].status2 |= STATUS2_RAGE;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 31 /* STEAL_ITEM */) {
        // 1:1 décomp battle_script_commands.c:2738-2803.
        if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
          // gBattlescriptCurrInstr++  →  advance (dispatch déjà advance).
        } else {
          const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
          const nonLocalFlags = (BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_FRONTIER
                               | BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK
                               | BATTLE_TYPE_SECRET_BASE);
          if (sideAttacker === B_SIDE_OPPONENT && !(gBattleTypeFlags & nonLocalFlags)) {
            // Opponents ne stealent pas (= prevent perma loss en wild).
          } else if (!(gBattleTypeFlags & nonLocalFlags)
              && (gWishFutureKnock.knockedOffMons[sideAttacker]
                  & (1 << gBattlerPartyIndexes[gBattlerAttacker]))) {
            // Knock Off déjà déclenché sur attacker → pas de re-steal.
          } else if (gBattleMons[gBattlerTarget].item
              && gBattleMons[gBattlerTarget].ability === ABILITY_STICKY_HOLD) {
            // Sticky Hold ability bloque steal.
            ctx.scriptPtrStack.push(ctx.scriptPtr);
            const off = getBattleScriptOffset('BattleScript_NoItemSteal');
            if (off >= 0) ctx.scriptPtr = off;
            setLastUsedAbility(gBattleMons[gBattlerTarget].ability);
            _recordAbilityBattleSME(gBattlerTarget, gBattleMons[gBattlerTarget].ability);
          } else if (gBattleMons[gBattlerAttacker].item !== 0 /* ITEM_NONE */
              || gBattleMons[gBattlerTarget].item === ITEM_ENIGMA_BERRY
              || _isItemMailSME(gBattleMons[gBattlerTarget].item)
              || gBattleMons[gBattlerTarget].item === 0 /* ITEM_NONE */) {
            // Conditions fail (= attacker porte déjà un item, target item mail/none/enigma).
          } else {
            // 1:1 décomp full STEAL_ITEM path.
            gBattleStruct.changedItems[gBattlerAttacker] = gBattleMons[gBattlerTarget].item;
            setLastUsedItemSME(gBattleMons[gBattlerTarget].item);
            gBattleMons[gBattlerTarget].item = 0 /* ITEM_NONE */;

            // BtlController_EmitSetMonData REQUEST_HELDITEM_BATTLE wired via batch C bridge.
            // Notre impl : direct write sur gBattleMons.item.
            setActiveBattler(gBattlerAttacker);
            setActiveBattler(gBattlerTarget);

            ctx.scriptPtrStack.push(ctx.scriptPtr);
            const off = getBattleScriptOffset('BattleScript_ItemSteal');
            if (off >= 0) ctx.scriptPtr = off;

            gBattleStruct.choicedMove[gBattlerTarget] = 0;
          }
        }
      } else if (eff === 32 /* PREVENT_ESCAPE */) {
        gBattleMons[gBattlerTarget].status2 |= STATUS2_ESCAPE_PREVENTION;
        gDisableStructs[gBattlerTarget].battlerPreventingEscape = gBattlerAttacker;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 33 /* NIGHTMARE */) {
        gBattleMons[gBattlerTarget].status2 |= STATUS2_NIGHTMARE;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 34 /* ALL_STATS_UP */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_AllStatsUp');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 35 /* RAPIDSPIN */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_RapidSpinAway');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 36 /* REMOVE_PARALYSIS */) {
        if (!(gBattleMons[gBattlerTarget].status1 & STATUS1_PARALYSIS)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gBattlerTarget].status1 &= ~STATUS1_PARALYSIS;
          setActiveBattler(gBattlerTarget);
          // EmitSetMonData stub
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_TargetPRLZHeal');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 37 /* ATK_DEF_DOWN */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_AtkDefDown');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 38 /* RECOIL_33 */) {
        let dmg = Math.floor(gHpDealt / 3);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 53 /* THRASH */) {
        if (gBattleMons[gEffectBattler].status2 & STATUS2_LOCK_CONFUSE) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
          gLockedMoves[gEffectBattler] = gCurrentMove;
          gBattleMons[gEffectBattler].status2 |= ((Random() & 1) + 2) << 10; // STATUS2_LOCK_CONFUSE_TURN
        }
      } else if (eff === 54 /* KNOCK_OFF */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_STICKY_HOLD) {
          if (gBattleMons[gEffectBattler].item === 0) {
            // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
          } else {
            setLastUsedAbility(ABILITY_STICKY_HOLD);
            const off = getBattleScriptOffset('BattleScript_StickyHoldActivates');
            if (off >= 0) ctx.scriptPtr = off;
            _recordAbilityBattle(gEffectBattler, ABILITY_STICKY_HOLD);
          }
        } else if (gBattleMons[gEffectBattler].item) {
          // 1:1 décomp battle_script_commands.c:2882-2884 :
          //   gLastUsedItem = gBattleMons[gEffectBattler].item;
          //   gBattleMons[gEffectBattler].item = ITEM_NONE;
          //   gWishFutureKnock.knockedOffMons[side] |= gBitTable[partyIdx];
          setLastUsedItemSME(gBattleMons[gEffectBattler].item);
          gBattleMons[gEffectBattler].item = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_KnockedOff');
          if (off >= 0) ctx.scriptPtr = off;
        } else {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 59 /* MOVE_EFFECT_SP_ATK_TWO_DOWN (battle.h:304) = Surchauffe/Overheat ; 55=NOTHING_37 (no-op) */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_SAtkDown2');
        if (off >= 0) ctx.scriptPtr = off;
      } else {
        // Unknown effect → advance.
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      }
    }
  }

  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

// Silence unused.
void STATUS1_ANY;

// ═══ Formes-fonction TypeCalc / AI_CalcDmg / AI_TypeCalc (battle_script_commands.c:1306-1636) ═══
// (helpers isBattlerOfType + attacksThisTurn réutilisés depuis la section type-calc ci-dessus)

/** 1:1 décomp `ModulateDmgByType2(u8 multiplier, u16 move, u8 *flags)`
 *  (battle_script_commands.c:1502-1534). `flags` = ref-objet pour émuler `u8*`. */
function ModulateDmgByType2(multiplier: number, move: number, ref: { flags: number }): void {
  let dmg = Math.floor(gBattleMoveDamage * multiplier / 10);
  if (dmg === 0 && multiplier !== 0) dmg = 1;
  setBattleMoveDamage(dmg);

  switch (multiplier) {
    case TYPE_MUL_NO_EFFECT:
      ref.flags |= MOVE_RESULT_DOESNT_AFFECT_FOE;
      ref.flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
      ref.flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
      break;
    case TYPE_MUL_NOT_EFFECTIVE:
      if (getBattleMove(move).power && !(ref.flags & MOVE_RESULT_NO_EFFECT)) {
        if (ref.flags & MOVE_RESULT_SUPER_EFFECTIVE) {
          ref.flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
        } else {
          ref.flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
        }
      }
      break;
    case TYPE_MUL_SUPER_EFFECTIVE:
      if (getBattleMove(move).power && !(ref.flags & MOVE_RESULT_NO_EFFECT)) {
        if (ref.flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          ref.flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
        } else {
          ref.flags |= MOVE_RESULT_SUPER_EFFECTIVE;
        }
      }
      break;
  }
}

/** 1:1 décomp `u8 TypeCalc(u16 move, u8 attacker, u8 defender)`
 *  (battle_script_commands.c:1536-1592).
 *
 *  Mute `gBattleMoveDamage` (STAB ×1.5 + ModulateDmgByType2 par type).
 *  Retourne `flags` (MOVE_RESULT_*) SANS écrire gMoveResultFlags
 *  (= 1:1 vanilla, cf. en-tête de fichier). */
export function TypeCalc(move: number, attacker: number, defender: number): number {
  let i = 0;
  const ref = { flags: 0 };
  let moveType: number;

  if (move === MOVE_STRUGGLE) return 0;

  moveType = getBattleMove(move).type;

  // check stab
  if (isBattlerOfType(attacker, moveType)) {
    let dmg = gBattleMoveDamage * 15;
    dmg = Math.floor(dmg / 10);
    setBattleMoveDamage(dmg);
  }

  const def = gBattleMons[defender];
  if (def.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    ref.flags |= (MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
  } else {
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (def.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      } else if (gTypeEffectiveness[i] === moveType) {
        // check type1
        if (gTypeEffectiveness[i + 1] === def.type1) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
        // check type2
        if (gTypeEffectiveness[i + 1] === def.type2 && def.type1 !== def.type2) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
      }
      i += 3;
    }
  }

  if (
    def.ability === ABILITY_WONDER_GUARD && !(ref.flags & MOVE_RESULT_MISSED)
    && attacksThisTurn(attacker, move) === 2
    && (!(ref.flags & MOVE_RESULT_SUPER_EFFECTIVE)
       || ((ref.flags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
           === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
    && getBattleMove(move).power
  ) {
    ref.flags |= MOVE_RESULT_MISSED;
  }
  return ref.flags;
}

/** 1:1 décomp `void AI_CalcDmg(u8 attacker, u8 defender)`
 *  (battle_script_commands.c:1306-1319). Renseigne `gBattleMoveDamage`. */
export function AI_CalcDmg(attacker: number, defender: number): void {
  const sideStatus = gSideStatuses[GET_BATTLER_SIDE(defender)];
  const { damage } = CalculateBaseDamage(
    gBattleMons[attacker],
    gBattleMons[defender],
    gCurrentMove,
    sideStatus,
    gDynamicBasePower,
    gBattleStruct.dynamicMoveType,
    attacker,
    defender,
  );
  let dmg = damage;
  setDynamicBasePower(0);
  dmg = dmg * gCritMultiplier * gBattleScripting.dmgMultiplier;

  if ((gStatuses3[attacker] & STATUS3_CHARGED_UP) && getBattleMove(gCurrentMove).type === TYPE_ELECTRIC) {
    dmg *= 2;
  }
  if (gProtectStructs[attacker].helpingHand) {
    dmg = Math.floor(dmg * 15 / 10);
  }
  setBattleMoveDamage(dmg);
}

/** Résout un species id numérique → [type1, type2] numériques via
 *  l'auto-extrait décomp `getSpeciesInfo` (= gSpeciesInfo[species].types).
 *  Même pattern que party-storage.fillBattleMonFromParty. Exporté pour
 *  ai-switch-items (GetMostSuitableMonToSwitchInto). */
export function speciesTypes(speciesId: number): [number, number] {
  const speciesEnum = reverseDecompConstant(speciesId, 'SPECIES_');
  const info = speciesEnum ? getSpeciesInfo(speciesEnum) : undefined;
  if (!info?.types) return [0, 0];
  const t1 = resolveDecompConstant(info.types[0] ?? '');
  const t2 = resolveDecompConstant(info.types[1] ?? info.types[0] ?? '');
  return [typeof t1 === 'number' ? t1 : 0, typeof t2 === 'number' ? t2 : 0];
}

/** 1:1 décomp `u8 AI_TypeCalc(u16 move, u16 targetSpecies, u8 targetAbility)`
 *  (battle_script_commands.c:1594-1636). Sibling de `TypeCalc` MAIS :
 *  - types lus depuis gSpeciesInfo[targetSpecies] (= hypothétique, pas un
 *    battler en jeu) ;
 *  - AUCUN STAB (pas d'attaquant) ;
 *  - bloc FORESIGHT TOUJOURS sauté (pas de check STATUS2_FORESIGHT) ;
 *  - Wonder Guard → `flags |= MOVE_RESULT_DOESNT_AFFECT_FOE` (≠ TypeCalc qui
 *    met MOVE_RESULT_MISSED).
 *  Utilisé par battle_ai_switch_items.c (ShouldSwitchIfWonderGuard /
 *  FindMonWithFlagsAndSuperEffective / etc.). */
export function AI_TypeCalc(move: number, targetSpecies: number, targetAbility: number): number {
  let i = 0;
  const ref = { flags: 0 };
  const [type1, type2] = speciesTypes(targetSpecies);

  if (move === MOVE_STRUGGLE) return 0;

  const moveType = getBattleMove(move).type;

  if (targetAbility === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    ref.flags = MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE;
  } else {
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        i += 3;
        continue;
      }
      if (gTypeEffectiveness[i] === moveType) {
        if (gTypeEffectiveness[i + 1] === type1) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
        if (gTypeEffectiveness[i + 1] === type2 && type1 !== type2) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
      }
      i += 3;
    }
  }

  if (targetAbility === ABILITY_WONDER_GUARD
    && (!(ref.flags & MOVE_RESULT_SUPER_EFFECTIVE)
       || ((ref.flags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
           === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
    && getBattleMove(move).power) {
    ref.flags |= MOVE_RESULT_DOESNT_AFFECT_FOE;
  }
  return ref.flags;
}

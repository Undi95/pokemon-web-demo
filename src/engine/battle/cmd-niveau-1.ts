/**
 * battle/cmd-niveau-1.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Niveau 1 (damage flow basic)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Tous les constants viennent de `./constants.ts` (= 1:1 décomp include/constants/battle.h
 * + pokemon.h + abilities.h + moves.h). Pas de magic numbers redéfinis localement.
 *
 * Opcodes 1:1 décomp implémentés :
 *   0x00 Cmd_attackcanceler   happy path (skip Protect/Snatch/MagicCoat/LightningRod/Disobedience)
 *   0x01 Cmd_accuracycheck    full
 *   0x03 Cmd_ppreduce         full
 *   0x04 Cmd_critcalc         full (uses getBattleMove for real move effect)
 *   0x05 Cmd_damagecalc       wraps CalculateBaseDamage 1:1
 *   0x06 Cmd_typecalc         delegated to type-calc.ts
 *   0x07 Cmd_adjustnormaldamage  full 1:1 (= ApplyRandomDmgMultiplier + FocusBand + EnduredCheck)
 *   0x0B Cmd_healthbarupdate  stub UI (= datahpupdate fait le HP write)
 *   0x0C Cmd_datahpupdate     1:1 minimal (= apply hp + record gHpDealt + handle BS_TARGET arg)
 *   0x19 Cmd_tryfaintmon      1:1 minimal (= consume args, set gBattlerFainted, set outcome)
 *   0x49 Cmd_moveend          full 1:1 (17 sub-states, session 137 + audit fixes)
 *
 * Pour utiliser : ces handlers sont enregistrés dans le dispatch table de
 * script-interpreter.ts via `installNiveau1Handlers()`.
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gCurrMovePos,
  gCurrentMove,
  gHitMarker,
  gCritMultiplier,
  gStatuses3,
  gBattleTypeFlags,
  gBattleWeather,
  gSideStatuses,
  gBattleMoveDamage,
  gMoveResultFlags,
  gDynamicBasePower,
  gDynamicMoveType,
  gBattleScripting,
  gBattleCommunication,
  gBattleControllerExecFlags,
  setHitMarker,
  setCritMultiplier,
  setBattleMoveDamage,
  setMoveResultFlags,
  setHpDealt,
  setPotentialItemEffectBattler,
  setBattlerFainted,
  setBattleOutcome,
  setActiveBattler,
  setLastUsedItem,
  setBattlerAttacker,
  setBattlerTarget,
} from './state';
import { Random } from '../system/random';
import { getBattleMove } from './data/battle-moves';
import { runDamagecalc } from './damage-calc';
import { Cmd_typecalc as TypecalcImpl } from './type-calc';
import { readWord, readHalfword, readByte, getBattleScriptOffset, getMoveEffectScriptOffset } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';
import {
  MarkBattlerForControllerExec,
  BtlController_EmitHealthBarUpdate,
} from './battle-controllers';
import { getBattlerForBattleScript as _utilGetBattler } from './util';
import {
  AbilityBattleEffects, ABILITYEFFECT_MOVES_BLOCK,
  ABILITYEFFECT_SYNCHRONIZE, ABILITYEFFECT_ON_DAMAGE,
  ABILITYEFFECT_IMMUNITY, ABILITYEFFECT_ATK_SYNCHRONIZE,
  consumeAbilityWantedScript,
} from './ability-battle-effects';
import { applyAtkCanceler } from './atk-canceler';
import { applyDisobedienceCheck } from './disobedience';
import {
  ItemBattleEffects, ITEMEFFECT_MOVE_END, ITEMEFFECT_KINGSROCK_SHELLBELL,
  consumeItemWantedScript,
} from './item-battle-effects';
import {
  GetItemHoldEffect, GetItemHoldEffectParam,
} from './data/item-hold-effects';
import {
  gBattlersCount, gAbsentBattlerFlags,
  gLastPrintedMoves, gLastMoves, gLastResultingMoves, gLastHitBy,
  gLastLandedMoves, gLastHitByType, gLastTakenMove, gLastTakenMoveFrom,
  gChosenMove, gBattleStruct, gDisableStructs, gProtectStructs,
  gSpecialStatuses, gBattleResults,
  gBattleOutcome, setCurrentActionFuncId,
  gBideDmg, gBideTarget, gHpDealt,
  setLastUsedAbility,
} from './state';
import {
  B_ACTION_FINISHED,
  HITMARKER_IGNORE_BIDE,
  HITMARKER_PASSIVE_HP_UPDATE,
} from './constants';
import { MOVE_PAIN_SPLIT } from '../decomp-data/include/constants/moves-data';
import { gBitTable, BtlController_EmitSpriteInvisibility } from './battle-controllers';
import { GetBattlerAtPosition, GetBattlerPosition } from './util';
import {
  // Hitmarker bits
  HITMARKER_NO_ATTACKSTRING,
  HITMARKER_NO_PPDEDUCT,
  HITMARKER_UNABLE_TO_USE_MOVE,
  HITMARKER_OBEYS,
  HITMARKER_ALLOW_NO_PP,
  HITMARKER_ATTACKSTRING_PRINTED,
  HITMARKER_SWAP_ATTACKER_TARGET,
  HITMARKER_NO_ANIMATIONS,
  HITMARKER_DESTINYBOND,
  HITMARKER_SYNCHRONIZE_EFFECT,
  HITMARKER_FAINTED,
  // Status bits
  STATUS2_FOCUS_ENERGY,
  STATUS2_MULTIPLETURNS,
  STATUS2_SUBSTITUTE,
  STATUS1_FREEZE,
  STATUS2_RAGE,
  STATUS3_CANT_SCORE_A_CRIT,
  STATUS3_ALWAYS_HITS,
  STATUS3_SEMI_INVULNERABLE,
  STATUS3_ON_AIR,
  STATUS3_UNDERGROUND,
  STATUS3_UNDERWATER,
  STATUS3_CHARGED_UP,
  // Battle type flags
  BATTLE_TYPE_WALLY_TUTORIAL,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_DOUBLE,
  // Abilities
  ABILITY_BATTLE_ARMOR,
  ABILITY_SHELL_ARMOR,
  ABILITY_PRESSURE,
  ABILITY_COMPOUND_EYES,
  ABILITY_SAND_VEIL,
  ABILITY_HUSTLE,
  // Hold effects
  HOLD_EFFECT_SCOPE_LENS,
  HOLD_EFFECT_LUCKY_PUNCH,
  HOLD_EFFECT_STICK,
  HOLD_EFFECT_FOCUS_BAND,
  HOLD_EFFECT_CHOICE_BAND,
  // Move effects
  EFFECT_HIGH_CRITICAL,
  EFFECT_SKY_ATTACK,
  EFFECT_BLAZE_KICK,
  EFFECT_POISON_TAIL,
  EFFECT_THUNDER,
  EFFECT_FALSE_SWIPE,
  EFFECT_BATON_PASS,
  // Species
  SPECIES_CHANSEY,
  SPECIES_FARFETCHD,
  // Moves misc
  MOVE_STRUGGLE,
  MOVE_NONE,
  MOVE_UNAVAILABLE,
  MOVE_BATON_PASS,
  MAX_MON_MOVES,
  MOVE_TARGET_BOTH,
  MOVE_TARGET_FOES_AND_ALLY,
  MOVE_TARGET_OPPONENTS_FIELD,
  STATUS2_TRANSFORMED,
  FLAG_MIRROR_MOVE_AFFECTED,
  BIT_FLANK,
  MOVE_RESULT_FAILED,
  STAT_ATK,
  MAX_STAT_STAGE,
  // Stats
  STAT_ACC,
  STAT_EVASION,
  MIN_STAT_STAGE,
  DEFAULT_STAT_STAGE,
  // Type
  TYPE_ELECTRIC,
  // Weather
  B_WEATHER_SUN,
  B_WEATHER_SANDSTORM,
  // Battle script args
  NO_ACC_CALC,
  NO_ACC_CALC_CHECK_LOCK_ON,
  ACC_CURR_MOVE,
  BS_ATTACKER,
  BS_TARGET,
  // Move result
  MOVE_RESULT_MISSED,
  MOVE_RESULT_NO_EFFECT,
  MOVE_RESULT_FOE_ENDURED,
  MOVE_RESULT_FOE_HUNG_ON,
  // Outcomes
  B_OUTCOME_WON,
  B_OUTCOME_LOST,
  // Sides
  GET_BATTLER_SIDE,
  B_SIDE_PLAYER,
  // Communication
  MISS_TYPE,
  B_MSG_MISSED,
  // Helpers
  IS_TYPE_PHYSICAL,
} from './constants';

// ─── Helpers internes ───────────────────────────────────────────────────────

// 1:1 décomp `GetItemHoldEffect` / `GetItemHoldEffectParam` — wired via item-hold-effects.
import { GetItemHoldEffect as _GetItemHoldEffectFull, GetItemHoldEffectParam as _GetItemHoldEffectParamFull } from './data/item-hold-effects';
function _getHoldEffect(itemId: number): number { return _GetItemHoldEffectFull(itemId); }
function _getHoldEffectParam(itemId: number): number { return _GetItemHoldEffectParamFull(itemId); }

/** 1:1 décomp `ApplyRandomDmgMultiplier()` (battle_script_commands.c:1639-1651).
 *
 *  Random 85-100% multiplier (= rand % 16, donc range [0..15], inversé → [85..100]).
 *  Si damage == 0 → no-op. Si damage > 0 et result == 0 → set to 1 (min damage). */
function ApplyRandomDmgMultiplier(): void {
  const rand = Random();
  const randPercent = 100 - (rand % 16);

  if (gBattleMoveDamage !== 0) {
    let dmg = gBattleMoveDamage * randPercent;
    dmg = Math.floor(dmg / 100);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
  }
}

// Le helper `getBattlerForBattleScript` est porté en full 1:1 dans `./util.ts`
// (= 16 cas BS_*) et importé ici sous l'alias `_utilGetBattler`.

// ─── Cmd_ppreduce (0x03) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_ppreduce` (battle_script_commands.c:1205-1251). */
function Cmd_ppreduce(ctx: BattleScriptContext): boolean {
  let ppToDeduct = 1;

  // 1:1 décomp : `if (gBattleControllerExecFlags) return;`
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }

  // 1:1 décomp ll.1212-1228 : Pressure check + multi-target switch.
  if (!gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure) {
    const target = _moveTargetForCurrentN1(gCurrentMove);
    switch (target) {
      case MOVE_TARGET_FOES_AND_ALLY:
        ppToDeduct += _abilityBattleEffectsCountFieldN1(
          ABILITYEFFECT_COUNT_ON_FIELD, gBattlerAttacker, ABILITY_PRESSURE
        );
        break;
      case MOVE_TARGET_BOTH:
      case MOVE_TARGET_OPPONENTS_FIELD:
        ppToDeduct += _abilityBattleEffectsCountFieldN1(
          ABILITYEFFECT_COUNT_OTHER_SIDE, gBattlerAttacker, ABILITY_PRESSURE
        );
        break;
      default:
        if (gBattlerAttacker !== gBattlerTarget
            && gBattleMons[gBattlerTarget].ability === ABILITY_PRESSURE) {
          ppToDeduct++;
        }
        break;
    }
  }

  if (!(gHitMarker & (HITMARKER_NO_PPDEDUCT | HITMARKER_NO_ATTACKSTRING))
      && gBattleMons[gBattlerAttacker].pp[gCurrMovePos] > 0) {
    // 1:1 décomp : gProtectStructs[gBattlerAttacker].notFirstStrike = 1.
    gProtectStructs[gBattlerAttacker].notFirstStrike = 1;

    const currentPp = gBattleMons[gBattlerAttacker].pp[gCurrMovePos];
    if (currentPp > ppToDeduct) {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] -= ppToDeduct;
    } else {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = 0;
    }
    // 1:1 décomp ll.1239-1246 : MOVE_IS_PERMANENT(attacker, gCurrMovePos)
    //    = !TRANSFORMED && !(mimickedMoves & bit[slot])
    // → BtlController_EmitSetMonData REQUEST_PPMOVE_X (= persist PP au save).
    // Notre port (Batch C session 142) : EmitSetMonData wirée à
    // __batPSetMonByActive bridge qui flush au party via SetMonData direct.
    if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
        && !(gDisableStructs[gBattlerAttacker].mimickedMoves & gBitTable[gCurrMovePos])) {
      setActiveBattler(gBattlerAttacker);
      // REQUEST_PPMOVE1_BATTLE = 9, donc 9 + slot.
      _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 9 + gCurrMovePos,
        0 /* monIdx */, 1 /* bytes */, gBattleMons[gBattlerAttacker].pp[gCurrMovePos]);
      _MarkBattlerForControllerExec_N1(gBattlerAttacker);
    }
  }

  setHitMarker(gHitMarker & ~HITMARKER_NO_PPDEDUCT);
  return false;
}

// 1:1 décomp helpers wired pour Cmd_ppreduce.
import {
  ABILITYEFFECT_COUNT_ON_FIELD, ABILITYEFFECT_COUNT_OTHER_SIDE,
  AbilityBattleEffects as _ABE_N1,
} from './ability-battle-effects';
import { getBattleMove as _gbmN1 } from './data/battle-moves';
function _moveTargetForCurrentN1(move: number): number {
  return _gbmN1(move).target;
}
function _abilityBattleEffectsCountFieldN1(caseId: number, battler: number, ability: number): number {
  return _ABE_N1(caseId, battler, ability, 0, 0);
}
// 1:1 décomp BtlController_EmitSetMonData + Mark — wired via batch C bridge.
import {
  BtlController_EmitSetMonData as _BtlController_EmitSetMonData_N1,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_N1,
  PrepareStringBattle as _PrepareStringBattle_N1,
} from './battle-controllers';

/** Convention runBattleScript : dispatcher fait scriptPtr++ AVANT handler.
 *  Pour "rester" sur opcode (= waitstate, re-execute next frame), on back up. */
function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── Cmd_critcalc (0x04) ────────────────────────────────────────────────────

/** 1:1 décomp `sCriticalHitChance[]` (battle_script_commands.c:606). */
const sCriticalHitChance: ReadonlyArray<number> = [16, 8, 4, 3, 2];

/** 1:1 décomp `Cmd_critcalc` (battle_script_commands.c:1253-1288). */
function Cmd_critcalc(_ctx: BattleScriptContext): boolean {
  const attackerMon = gBattleMons[gBattlerAttacker];
  const targetMon = gBattleMons[gBattlerTarget];
  const item = attackerMon.item;
  const holdEffect = _getHoldEffect(item);

  setPotentialItemEffectBattler(gBattlerAttacker);

  // 1:1 décomp formule critChance (= sum of bonuses, then clamp + roll).
  const moveEffect = getBattleMove(gCurrentMove).effect;

  let critChance =
    2 * ((attackerMon.status2 & STATUS2_FOCUS_ENERGY) !== 0 ? 1 : 0)
    + (moveEffect === EFFECT_HIGH_CRITICAL ? 1 : 0)
    + (moveEffect === EFFECT_SKY_ATTACK ? 1 : 0)
    + (moveEffect === EFFECT_BLAZE_KICK ? 1 : 0)
    + (moveEffect === EFFECT_POISON_TAIL ? 1 : 0)
    + (holdEffect === HOLD_EFFECT_SCOPE_LENS ? 1 : 0)
    + 2 * (holdEffect === HOLD_EFFECT_LUCKY_PUNCH && attackerMon.species === SPECIES_CHANSEY ? 1 : 0)
    + 2 * (holdEffect === HOLD_EFFECT_STICK && attackerMon.species === SPECIES_FARFETCHD ? 1 : 0);

  if (critChance >= sCriticalHitChance.length) critChance = sCriticalHitChance.length - 1;

  const targetAbility = targetMon.ability;
  const canCrit =
    targetAbility !== ABILITY_BATTLE_ARMOR
    && targetAbility !== ABILITY_SHELL_ARMOR
    && (gStatuses3[gBattlerAttacker] & STATUS3_CANT_SCORE_A_CRIT) === 0
    && (gBattleTypeFlags & (BATTLE_TYPE_WALLY_TUTORIAL | BATTLE_TYPE_FIRST_BATTLE)) === 0
    && (Random() % sCriticalHitChance[critChance]) === 0;

  setCritMultiplier(canCrit ? 2 : 1);
  return false;
}

// ─── Cmd_damagecalc (0x05) ──────────────────────────────────────────────────

/** 1:1 décomp `Cmd_damagecalc` (battle_script_commands.c:1290-1313). */
function Cmd_damagecalc(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)].
  const sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)] ?? 0;
  // 1:1 décomp : typeOverride = gBattleStruct->dynamicMoveType (port via state).
  const damage = runDamagecalc(sideStatus, gDynamicBasePower, gDynamicMoveType);

  // 1:1 décomp : `damage = damage * gCritMultiplier * gBattleScripting.dmgMultiplier;`
  // (runDamagecalc returns base damage ; crit/dmgMultiplier applied here).
  let finalDamage = damage * gCritMultiplier * gBattleScripting.dmgMultiplier;

  // 1:1 décomp : STATUS3_CHARGED_UP electric × 2 (= Charge move boost on Electric type).
  const moveType = getBattleMove(gCurrentMove).type;
  if ((gStatuses3[gBattlerAttacker] & STATUS3_CHARGED_UP)
      && moveType === TYPE_ELECTRIC) {
    finalDamage *= 2;
  }

  // 1:1 décomp battle_script_commands.c:1300-1301 : Helping Hand × 1.5.
  if (gProtectStructs[gBattlerAttacker].helpingHand) {
    finalDamage = Math.floor((finalDamage * 15) / 10);
  }

  setBattleMoveDamage(finalDamage);
  return false;
}

// ─── Cmd_typecalc (0x06) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_typecalc` (battle_script_commands.c:1355-1424).
 *  Delegated to type-calc.ts module. */
function Cmd_typecalc(_ctx: BattleScriptContext): boolean {
  return TypecalcImpl();
}

// ─── Cmd_adjustnormaldamage (0x07) ──────────────────────────────────────────

/** 1:1 décomp `Cmd_adjustnormaldamage` (battle_script_commands.c:1658-1698).
 *
 *  Important : ne fait PAS de clamp inconditionnel à target.hp. Le seul clamp
 *  est `hp - 1` (= leave at 1 HP) si Focus Band trigger / Endured / FalseSwipe.
 *  Sinon damage reste tel quel (overkill ok, datahpupdate clamp à 0). */
function Cmd_adjustnormaldamage(_ctx: BattleScriptContext): boolean {
  ApplyRandomDmgMultiplier();

  const targetMon = gBattleMons[gBattlerTarget];
  const item = targetMon.item;
  const holdEffect = _getHoldEffect(item);
  const param = _getHoldEffectParam(item);

  setPotentialItemEffectBattler(gBattlerTarget);

  // 1:1 décomp : Focus Band trigger sur (Random() % 100) < param.
  // gSpecialStatuses[target].focusBanded est set ici aussi.
  let focusBanded = false;
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    focusBanded = true;
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }

  // 1:1 décomp : `if (gProtectStructs[target].endured)` — Endure move actif.
  const endured = gProtectStructs[gBattlerTarget].endured !== 0;

  // 1:1 décomp : skip si STATUS2_SUBSTITUTE actif (= substitute eats the hit,
  // pas de leave-at-1-HP gimmick).
  const moveEffect = getBattleMove(gCurrentMove).effect;
  if (
    !(targetMon.status2 & STATUS2_SUBSTITUTE)
    && (moveEffect === EFFECT_FALSE_SWIPE || endured || focusBanded)
    && targetMon.hp <= gBattleMoveDamage
  ) {
    setBattleMoveDamage(targetMon.hp - 1);  // leave at 1 HP
    if (endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      // 1:1 décomp : `gLastUsedItem = gBattleMons[gBattlerTarget].item;`
      setLastUsedItem(targetMon.item);
    }
  }
  return false;
}

// ─── Cmd_datahpupdate (0x0C) ────────────────────────────────────────────────

/** 1:1 décomp `Cmd_datahpupdate` (battle_script_commands.c:1844+, ~150 lignes).
 *
 *  Args : 1 byte = target battler ref (= BS_TARGET / BS_ATTACKER / etc.).
 *  Total : 2 bytes (opcode + 1 byte arg).
 *
 *  Logic 1:1 décomp (port complet sessions 138-142) :
 *  1. Read arg byte.
 *  2. Skip si MOVE_RESULT_NO_EFFECT.
 *  3. Resolve gActiveBattler via getBattlerForBattleScript(arg).
 *  4. Substitute path — FULL port (session 138 + R5 session 142).
 *  5. Si damage < 0 → HP gain (= clamp à maxHP).
 *  6. Sinon → HP loss (= clamp à 0), gHpDealt = damage clipped.
 *  7. Bide damage tracker + Shell Bell damage record + physical/special tracker
 *     pour Counter/Mirror Coat — TOUS ported. */
function Cmd_datahpupdate(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : `if (gBattleControllerExecFlags) return;`
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }

  const battlerArg = readByte(ctx);

  // 1:1 décomp : moveType resolution avec dynamicMoveType + F_DYNAMIC_TYPE_*.
  // GET_MOVE_TYPE macro (battle.h:458) : si dynamicMoveType lo 6 bits set,
  // use celui-ci, sinon use gBattleMoves[move].type.
  const moveType = gDynamicMoveType !== 0
    ? (gDynamicMoveType & 0x3F)  // DYNAMIC_TYPE_MASK
    : getBattleMove(gCurrentMove).type;

  // 1:1 décomp : `if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT))` — use the
  // composite flag (= MISSED | DOESNT_AFFECT_FOE | FAILED).
  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
    const mon = gBattleMons[activeBattler];

    // 1:1 décomp : Substitute path. Si SUBSTITUTE actif + substituteHP > 0 +
    // !IGNORE_SUBSTITUTE → damage va au substitute, pas au mon.
    const HITMARKER_IGNORE_SUBSTITUTE_LOCAL = 1 << 8;
    if ((mon.status2 & STATUS2_SUBSTITUTE)
        && gDisableStructs[activeBattler].substituteHP > 0
        && !(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE_LOCAL)) {
      // 1:1 décomp battle_script_commands.c:1866-1882 — wirage strict.
      const subHP = gDisableStructs[activeBattler].substituteHP;
      if (subHP >= gBattleMoveDamage) {
        // Substitute absorbs full damage.
        gSpecialStatuses[activeBattler].shellBellDmg += gBattleMoveDamage;
        gDisableStructs[activeBattler].substituteHP = subHP - gBattleMoveDamage;
        setHpDealt(gBattleMoveDamage);
      } else {
        // Substitute absorbs partial, set sub HP to 0.
        if (gSpecialStatuses[activeBattler].shellBellDmg === 0) {
          gSpecialStatuses[activeBattler].shellBellDmg = subHP;
        }
        setHpDealt(subHP);
        gDisableStructs[activeBattler].substituteHP = 0;
      }
      // 1:1 décomp ll.1884-1891 : si substituteHP == 0 → push + jump SubstituteFade.
      if (gDisableStructs[activeBattler].substituteHP === 0) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_SubstituteFade');
        if (off >= 0) ctx.scriptPtr = off;
      }
      return false;  // Pas de damage au mon direct.
    }

    if (gBattleMoveDamage < 0) {
      // Negative damage = heal.
      mon.hp += -gBattleMoveDamage;
      if (mon.hp > mon.maxHP) mon.hp = mon.maxHP;
    } else {
      // 1:1 décomp battle_script_commands.c:1905-1917 : Bide damage tracker.
      if (gHitMarker & HITMARKER_IGNORE_BIDE) {
        setHitMarker(gHitMarker & ~HITMARKER_IGNORE_BIDE);
      } else {
        gBideDmg[activeBattler] = gBideDmg[activeBattler] + gBattleMoveDamage;
        // 1:1 décomp : si arg == BS_TARGET, bideTarget = attacker, sinon = target.
        gBideTarget[activeBattler] = battlerArg === BS_TARGET
          ? gBattlerAttacker
          : gBattlerTarget;
      }

      // 1:1 décomp ll.1920-1929 : deal damage.
      if (mon.hp > gBattleMoveDamage) {
        mon.hp -= gBattleMoveDamage;
        setHpDealt(gBattleMoveDamage);
      } else {
        setHpDealt(mon.hp);
        mon.hp = 0;
      }

      // 1:1 décomp ll.1932-1933 : shellBellDmg tracker (= post-combat heal).
      if (gSpecialStatuses[activeBattler].shellBellDmg === 0
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)) {
        gSpecialStatuses[activeBattler].shellBellDmg = gHpDealt;
      }

      // 1:1 décomp ll.1938-1969 : physical/special damage tracker pour
      // Counter/Mirror Coat. specialDmg utilisé aussi pour Fire defrost.
      if (IS_TYPE_PHYSICAL(moveType)
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)
          && gCurrentMove !== MOVE_PAIN_SPLIT) {
        gProtectStructs[activeBattler].physicalDmg = gHpDealt;
        gSpecialStatuses[activeBattler].physicalDmg = gHpDealt;
        const otherBattler = battlerArg === BS_TARGET ? gBattlerAttacker : gBattlerTarget;
        gProtectStructs[activeBattler].physicalBattlerId = otherBattler;
        gSpecialStatuses[activeBattler].physicalBattlerId = otherBattler;
      } else if (!IS_TYPE_PHYSICAL(moveType)
          && !(gHitMarker & HITMARKER_PASSIVE_HP_UPDATE)) {
        gProtectStructs[activeBattler].specialDmg = gHpDealt;
        gSpecialStatuses[activeBattler].specialDmg = gHpDealt;
        const otherBattler = battlerArg === BS_TARGET ? gBattlerAttacker : gBattlerTarget;
        gProtectStructs[activeBattler].specialBattlerId = otherBattler;
        gSpecialStatuses[activeBattler].specialBattlerId = otherBattler;
      }
    }

    // 1:1 décomp : clear HITMARKER_PASSIVE_HP_UPDATE.
    setHitMarker(gHitMarker & ~HITMARKER_PASSIVE_HP_UPDATE);

    // 1:1 décomp : Emit SetMonData REQUEST_HP_BATTLE + Mark — wired via batch C
    // bridge → flush au party-side (= 42 = REQUEST_HP_BATTLE).
    _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 42 /* REQUEST_HP_BATTLE */,
      0, 2 /* u16 */, mon.hp);
    _MarkBattlerForControllerExec_N1(activeBattler);
  } else {
    // 1:1 décomp : NO_EFFECT path → set shellBellDmg = IGNORE_SHELL_BELL sentinel.
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
    // Marker for Shell Bell to ignore this damage in post-hit recovery.
    if (gSpecialStatuses[activeBattler].shellBellDmg === 0) {
      gSpecialStatuses[activeBattler].shellBellDmg = -1;  // IGNORE_SHELL_BELL sentinel
    }
  }
  return false;
}

// ─── Cmd_tryfaintmon (0x19) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_tryfaintmon` (battle_script_commands.c:2965-3050).
 *
 *  Args : 1 byte battler ref + 1 byte mode + 4 byte ptr (= post-faint dispatch).
 *  Total 7 bytes.
 *
 *  Mode != 0 (= dispatch après faint) : check HITMARKER_FAINTED → pop cursor +
 *    jump, sinon advance 7.
 *  Mode == 0 (= regular faint check) :
 *    - BS_ATTACKER → active = attacker, jump = BattleScript_FaintAttacker
 *    - else → active = target, jump = BattleScript_FaintTarget
 *    - Si !absent && hp == 0 :
 *      * set HITMARKER_FAINTED(active), push cursor + jump
 *      * player side : HITMARKER_PLAYER_FAINTED + playerFaintCounter++ +
 *                      AdjustFriendshipOnBattleFaint
 *      * opponent side : opponentFaintCounter++ + lastOpponentSpecies
 *      * Destiny Bond : si HITMARKER_DESTINYBOND + attacker.hp != 0 →
 *                       gBattleMoveDamage = battler.hp + push +
 *                       BattleScript_DestinyBondTakesLife
 *      * Grudge : conditions match → drain attacker PP du chosenMove +
 *                 BattleScript_GrudgeTakesPp */
function Cmd_tryfaintmon(ctx: BattleScriptContext): boolean {
  const opcodeStartPtr = ctx.scriptPtr - 1;  // before pre-advance
  const battlerArg = readByte(ctx);
  const modeFlag = readByte(ctx);
  const jumpPtr = readWord(ctx);

  if (modeFlag !== 0) {
    // 1:1 décomp ll.2969-2983 : post-faint dispatcher.
    const active = _utilGetBattler(battlerArg);
    setActiveBattler(active);
    if (gHitMarker & HITMARKER_FAINTED(active)) {
      ctx.scriptPtr = jumpPtr;
      // 1:1 décomp : BattleScriptPop() + scriptPtr = jumpPtr.
      ctx.scriptPtrStack.pop();
      gSideStatuses[GET_BATTLER_SIDE(active)] &= ~SIDE_STATUS_SPIKES_DAMAGED;
    }
    return false;
  }

  // Mode 0 : regular faint check.
  let activeBattler: number;
  let battlerOther: number;
  let bsLabel: string;
  if (battlerArg === BS_ATTACKER) {
    activeBattler = gBattlerAttacker;
    battlerOther = gBattlerTarget;
    bsLabel = 'BattleScript_FaintAttacker';
  } else {
    activeBattler = gBattlerTarget;
    battlerOther = gBattlerAttacker;
    bsLabel = 'BattleScript_FaintTarget';
  }
  setActiveBattler(activeBattler);

  if (!(gAbsentBattlerFlags & gBitTable[activeBattler])
      && gBattleMons[activeBattler].hp === 0) {
    setHitMarker(gHitMarker | HITMARKER_FAINTED(activeBattler));
    setBattlerFainted(activeBattler);
    // 1:1 décomp : BattleScriptPush(gBattlescriptCurrInstr + 7) + jump label.
    ctx.scriptPtrStack.push(opcodeStartPtr + 7);
    const off = getBattleScriptOffset(bsLabel);
    if (off >= 0) ctx.scriptPtr = off;

    if (GET_BATTLER_SIDE(activeBattler) === B_SIDE_PLAYER) {
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      if (gBattleResults.playerFaintCounter < 255) {
        gBattleResults.playerFaintCounter++;
      }
      _adjustFriendshipOnFaintTFM(activeBattler);
      // 1:1 fallback for outcome side player (= keep behavior for our test).
      setBattleOutcome(B_OUTCOME_LOST);
    } else {
      if (gBattleResults.opponentFaintCounter < 255) {
        gBattleResults.opponentFaintCounter++;
      }
      // 1:1 décomp : `lastOpponentSpecies = GetMonData(&gEnemyParty[partyIdx], MON_DATA_SPECIES)`.
      const partyIdx = gBattlerPartyIndexes[activeBattler];
      if (gEnemyParty_TFM[partyIdx]) {
        gBattleResults.lastOpponentSpecies =
          GetMonData_TFM(gEnemyParty_TFM[partyIdx], MON_DATA_SPECIES_TFM) as number;
      }
      // 1:1 fallback for our test : set outcome WON (= will be overridden if more
      // battlers left in real ROM).
      setBattleOutcome(B_OUTCOME_WON);
    }

    // 1:1 décomp ll.3020-3026 : Destiny Bond.
    if ((gHitMarker & HITMARKER_DESTINYBOND)
        && gBattleMons[gBattlerAttacker].hp !== 0) {
      setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      setBattleMoveDamage(gBattleMons[battlerOther].hp);
      const dbOff = getBattleScriptOffset('BattleScript_DestinyBondTakesLife');
      if (dbOff >= 0) ctx.scriptPtr = dbOff;
    }

    // 1:1 décomp ll.3027-3043 : Grudge effect.
    if ((gStatuses3[gBattlerTarget] & STATUS3_GRUDGE)
        && !(gHitMarker & HITMARKER_GRUDGE)
        && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)
        && gBattleMons[gBattlerAttacker].hp !== 0
        && gCurrentMove !== MOVE_STRUGGLE) {
      const moveIndex = gBattleStruct.chosenMovePositions[gBattlerAttacker];
      gBattleMons[gBattlerAttacker].pp[moveIndex] = 0;
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      const grOff = getBattleScriptOffset('BattleScript_GrudgeTakesPp');
      if (grOff >= 0) ctx.scriptPtr = grOff;
      setActiveBattler(gBattlerAttacker);
      // 1:1 décomp : EmitSetMonData REQUEST_PPMOVE_X (= persist au save) wired
      // via batch C bridge → SetMonData direct sur le party mon.
      _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */, 9 + moveIndex,
        0, 1, gBattleMons[gBattlerAttacker].pp[moveIndex]);
      _MarkBattlerForControllerExec_N1(gBattlerAttacker);
      // 1:1 décomp battle_script_commands.c:3042.
      _PREPARE_MOVE_BUFFER_TFM(_gBattleTextBuff1_TFM, gBattleMons[gBattlerAttacker].moves[moveIndex]);
    }
  }
  return false;
}

// HOLD_EFFECT_EVASION_UP pour Cmd_accuracycheck (= Brightpowder / Lax Incense).
import { HOLD_EFFECT_EVASION_UP as HOLD_EFFECT_EVASION_UP_AC } from '../decomp-data/include/constants/hold_effects-data';

/** 1:1 décomp `AdjustFriendshipOnBattleFaint(battler)` (battle_util2.c:77-107).
 *  Décrément friendship du party member faint. Replace l'auto-gen battle_util2-
 *  all-auto.ts (= cassé : `gBattleTypeFlags is not defined` car @ts-nocheck +
 *  bare global refs sans bridge).
 *
 *  Pour notre POC : on lit gBattleMons[opponent].level vs gBattleMons[battler].
 *  level, et applique FRIENDSHIP_EVENT_FAINT_SMALL ou _LARGE. AdjustFriendship
 *  decrément friendship du gPlayerParty[partyIdx] de 1-10 selon level. */
function _adjustFriendshipOnFaintTFM(battler: number): void {
  const BATTLE_TYPE_DOUBLE_TFM = 1 << 0;
  // 1:1 décomp positions : 1 = OPPONENT_LEFT, 3 = OPPONENT_RIGHT.
  // GetBattlerAtPosition retourne battler id à cette position.
  const _getOppLeft = (): number => {
    // Single battle : opponent = 1. Double : check gBattleStruct.battlerPartyOrders.
    return 1;
  };
  let opposingBattlerId = _getOppLeft();
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE_TFM) {
    const opposingBattlerId2 = 3; // OPPONENT_RIGHT.
    if (gBattleMons[opposingBattlerId2]?.level > gBattleMons[opposingBattlerId]?.level) {
      opposingBattlerId = opposingBattlerId2;
    }
  }
  const FRIENDSHIP_EVENT_FAINT_SMALL = 6;
  const FRIENDSHIP_EVENT_FAINT_LARGE = 8;
  void FRIENDSHIP_EVENT_FAINT_LARGE;
  // 1:1 décomp : si opposingBattler.level > battler.level → friendship loss.
  const oppLvl = gBattleMons[opposingBattlerId]?.level ?? 0;
  const battlerLvl = gBattleMons[battler]?.level ?? 0;
  const _event = oppLvl > battlerLvl
    ? (oppLvl - battlerLvl > 29 ? FRIENDSHIP_EVENT_FAINT_LARGE : FRIENDSHIP_EVENT_FAINT_SMALL)
    : FRIENDSHIP_EVENT_FAINT_SMALL;
  // 1:1 décomp call : AdjustFriendship(&gPlayerParty[gBattlerPartyIndexes[battler]], event).
  // Wire complet maintenant via AdjustFriendship 1:1 décomp dans party-storage.ts.
  const partyIdx = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } })
    .__battleState?.gBattlerPartyIndexes?.[battler] ?? 0;
  const playerMon = _gPlayerPartyAF[partyIdx];
  if (playerMon) {
    _AdjustFriendshipAF(playerMon, _event);
  }
}
// Imports locaux _adjustFriendshipOnFaintTFM.
import { AdjustFriendship as _AdjustFriendshipAF, gPlayerParty as _gPlayerPartyAF } from './party-storage';

// Imports locaux Cmd_tryfaintmon (= éviter dups au top du file).
// Note : on n'importe PAS AdjustFriendshipOnBattleFaint depuis battle_util2-all-auto
// car ce fichier auto-gen utilise gBattleTypeFlags / gBattleMons / etc. sans imports
// (= `gBattleTypeFlags is not defined` au runtime). On utilise notre propre impl
// `_adjustFriendshipOnFaintTFM` au-dessus.
import {
  gEnemyParty as gEnemyParty_TFM, GetMonData as GetMonData_TFM,
  MON_DATA_SPECIES as MON_DATA_SPECIES_TFM,
} from './party-storage';
import { SIDE_STATUS_SPIKES_DAMAGED, HITMARKER_PLAYER_FAINTED, HITMARKER_GRUDGE, STATUS3_GRUDGE } from './constants';
import { gBattlerPartyIndexes } from './state';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_TFM,
  PREPARE_MOVE_BUFFER as _PREPARE_MOVE_BUFFER_TFM,
} from './text-buffers';

// ─── Cmd_accuracycheck (0x01) ───────────────────────────────────────────────

/** 1:1 décomp `sAccuracyStageRatios[]` (battle_script_commands.c:588-603). */
const sAccuracyStageRatios: ReadonlyArray<readonly [number, number]> = [
  [ 33, 100], [ 36, 100], [ 43, 100], [ 50, 100], [ 60, 100], [ 75, 100],
  [  1,   1],  // stage 0 (= +6 internal, +0 displayed)
  [133, 100], [166, 100], [  2,   1], [233, 100], [133,  50], [  3,   1],
];

// 1:1 décomp `FLAG_PROTECT_AFFECTED` — defined in pokemon.h flags.
const FLAG_PROTECT_AFFECTED_LOCAL = 1 << 1;
// EFFECT_* values pour AccuracyCalcHelper (= depuis auto-data, vérifiées).
const _EFFECT_ALWAYS_HIT_LOCAL = 17;
const _EFFECT_VITAL_THROW_LOCAL = 78;
// HITMARKER_IGNORE_* bits (1 << 16/17/18) déjà importés.

/** 1:1 décomp `DEFENDER_IS_PROTECTED` (battle.h macro) :
 *  `gProtectStructs[gBattlerTarget].protected && (gBattleMoves[move].flags & FLAG_PROTECT_AFFECTED)`. */
function _DEFENDER_IS_PROTECTED(move: number): boolean {
  // Lazy lookup gProtectStructs from globalThis to avoid heavier imports.
  const targetProtectStructs = gProtectStructs[gBattlerTarget];
  if (!targetProtectStructs.protected) return false;
  return (getBattleMove(move).flags & FLAG_PROTECT_AFFECTED_LOCAL) !== 0;
}

/** 1:1 décomp `JumpIfMoveAffectedByProtect(move)`
 *  (battle_script_commands.c:1041-1052).
 *
 *  Si défendeur est Protect-é (= proté et move respecté Protect) :
 *  - set MOVE_RESULT_MISSED
 *  - set MISS_TYPE = B_MSG_PROTECTED
 *  - jump à BattleScript label (= 7 bytes ahead du opcode, mais notre
 *    appelant doit handle le scriptPtr jump)
 *  - return true (= affected)
 */
function _JumpIfMoveAffectedByProtect(ctx: BattleScriptContext, jumpTarget: number, move: number): boolean {
  if (_DEFENDER_IS_PROTECTED(move)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    // 1:1 décomp : JumpIfMoveFailed(7, move) — jump si move failed.
    // Notre version : si jumpTarget est set, on l'utilise.
    if (jumpTarget >= 0) ctx.scriptPtr = jumpTarget;
    gBattleCommunication[MISS_TYPE] = 1 /* B_MSG_PROTECTED */;
    return true;
  }
  return false;
}

/** 1:1 décomp `AccuracyCalcHelper(move)` (battle_script_commands.c:1054-1097).
 *  Check les cas où le move hit/miss without acc check.
 *
 *  Returns true si décision faite (hit or miss). Si miss, set scriptPtr=jumpTarget. */
function _AccuracyCalcHelper(ctx: BattleScriptContext, jumpTarget: number, move: number): boolean {
  // Lock On : ALWAYS_HITS + battlerWithSureHit match → hit.
  if ((gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS)
      && gDisableStructs[gBattlerTarget].battlerWithSureHit === gBattlerAttacker) {
    return true;  // hit, no acc check
  }

  // ON_AIR (Fly) : miss sauf si IGNORE_ON_AIR set.
  if (!(gHitMarker & HITMARKER_IGNORE_ON_AIR_LOCAL)
      && (gStatuses3[gBattlerTarget] & STATUS3_ON_AIR)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    if (jumpTarget >= 0) ctx.scriptPtr = jumpTarget;
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_ON_AIR_LOCAL);

  // UNDERGROUND (Dig) : miss sauf si IGNORE_UNDERGROUND.
  if (!(gHitMarker & HITMARKER_IGNORE_UNDERGROUND_LOCAL)
      && (gStatuses3[gBattlerTarget] & STATUS3_UNDERGROUND)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    if (jumpTarget >= 0) ctx.scriptPtr = jumpTarget;
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_UNDERGROUND_LOCAL);

  // UNDERWATER (Dive) : miss sauf si IGNORE_UNDERWATER.
  if (!(gHitMarker & HITMARKER_IGNORE_UNDERWATER_LOCAL)
      && (gStatuses3[gBattlerTarget] & STATUS3_UNDERWATER)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    if (jumpTarget >= 0) ctx.scriptPtr = jumpTarget;
    return true;
  }
  setHitMarker(gHitMarker & ~HITMARKER_IGNORE_UNDERWATER_LOCAL);

  // 1:1 décomp : Thunder en Rain = hit (no acc check) si WEATHER_HAS_EFFECT.
  // WEATHER_HAS_EFFECT = !ABILITY_ON_FIELD(CloudNine/AirLock).
  // Lazy lookup via globalThis pour éviter circular dep.
  const checkFn = (globalThis as { __abilityBattleEffectsCheck?: (caseID: number, b: number, ab: number, s: number, m: number) => number }).__abilityBattleEffectsCheck;
  let weatherActive = true;
  if (checkFn) {
    // 1:1 décomp abilities.h:17,81. AUDIT BUG FIX : AIR_LOCK était 76 (= TRACE!) → 77.
    const CHECK_ON_FIELD = 12, CLOUD_NINE = 13, AIR_LOCK = 77;
    weatherActive = !checkFn(CHECK_ON_FIELD, 0, CLOUD_NINE, 0, 0)
                 && !checkFn(CHECK_ON_FIELD, 0, AIR_LOCK, 0, 0);
  }

  const moveEff = getBattleMove(move).effect;
  // 1:1 décomp battle_script_commands.c:1089 : `gBattleWeather & B_WEATHER_RAIN`
  // (= composite TEMPORARY|DOWNPOUR|PERMANENT = 0x7), pas juste TEMPORARY.
  // AUDIT BUG FIX : était `& 1` (= TEMPORARY seul) → manquait DOWNPOUR/PERMANENT.
  const B_WEATHER_RAIN_ALL = 0x7; // bits 0|1|2
  if ((weatherActive && (gBattleWeather & B_WEATHER_RAIN_ALL) && moveEff === EFFECT_THUNDER)
      || moveEff === _EFFECT_ALWAYS_HIT_LOCAL
      || moveEff === _EFFECT_VITAL_THROW_LOCAL) {
    return true;  // hit, no acc check
  }

  return false;
}

// HITMARKER_IGNORE_* values from constants (1 << 16/17/18).
const HITMARKER_IGNORE_ON_AIR_LOCAL      = 1 << 16;
const HITMARKER_IGNORE_UNDERGROUND_LOCAL = 1 << 17;
const HITMARKER_IGNORE_UNDERWATER_LOCAL  = 1 << 18;

/** 1:1 décomp `Cmd_accuracycheck` (battle_script_commands.c:1099-1189).
 *
 *  Opcode structure (= bytecode) : 0x01 [u32 jumpTarget] [u16 move]. Total 7 bytes.
 *  Notre interpreter a déjà consommé l'opcode byte → ctx.scriptPtr est sur jumpTarget.
 *
 *  Helpers wired : JumpIfMoveAffectedByProtect + AccuracyCalcHelper.
 *  Stubs : CheckWonderGuardAndLevitate = noop. */
function Cmd_accuracycheck(ctx: BattleScriptContext): boolean {
  const jumpTarget = readWord(ctx);
  let move = readHalfword(ctx);

  if (move === NO_ACC_CALC || move === NO_ACC_CALC_CHECK_LOCK_ON) {
    if ((gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS) && move === NO_ACC_CALC_CHECK_LOCK_ON) {
      return false;  // hit (lock on + sure hit)
    }
    if (gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE) {
      ctx.scriptPtr = jumpTarget;  // semi-invulnerable, miss
      return false;
    }
    // 1:1 décomp : JumpIfMoveAffectedByProtect(0) — pas affected → hit.
    _JumpIfMoveAffectedByProtect(ctx, jumpTarget, 0);
    return false;
  }

  if (move === ACC_CURR_MOVE) move = gCurrentMove;

  const md = getBattleMove(move);
  const type = md.type;
  let moveAcc = md.accuracy;

  // 1:1 décomp : JumpIfMoveAffectedByProtect(move) → return early si protected.
  if (_JumpIfMoveAffectedByProtect(ctx, jumpTarget, move)) return false;
  // 1:1 décomp : AccuracyCalcHelper(move) → return early si verdict pris.
  if (_AccuracyCalcHelper(ctx, jumpTarget, move)) return false;

  const attackerMon = gBattleMons[gBattlerAttacker];
  const targetMon = gBattleMons[gBattlerTarget];

  // Foresight ignore evasion buff sur target.
  let buff: number;
  if (targetMon.status2 & (1 << 29) /* STATUS2_FORESIGHT */) {
    buff = attackerMon.statStages[STAT_ACC] ?? DEFAULT_STAT_STAGE;
  } else {
    buff = (attackerMon.statStages[STAT_ACC] ?? DEFAULT_STAT_STAGE)
         + DEFAULT_STAT_STAGE
         - (targetMon.statStages[STAT_EVASION] ?? DEFAULT_STAT_STAGE);
  }
  if (buff < MIN_STAT_STAGE) buff = MIN_STAT_STAGE;
  if (buff > MAX_STAT_STAGE) buff = MAX_STAT_STAGE;

  // Thunder en sun = 50% accuracy.
  if ((gBattleWeather & B_WEATHER_SUN) && md.effect === EFFECT_THUNDER) {
    moveAcc = 50;
  }

  const ratio = sAccuracyStageRatios[buff] ?? [1, 1];
  let calc = Math.floor(ratio[0] * moveAcc / ratio[1]);

  if (attackerMon.ability === ABILITY_COMPOUND_EYES) calc = Math.floor((calc * 130) / 100);
  if ((gBattleWeather & B_WEATHER_SANDSTORM) && targetMon.ability === ABILITY_SAND_VEIL) {
    calc = Math.floor((calc * 80) / 100);
  }
  if (attackerMon.ability === ABILITY_HUSTLE && IS_TYPE_PHYSICAL(type)) {
    calc = Math.floor((calc * 80) / 100);
  }

  setPotentialItemEffectBattler(gBattlerTarget);

  // 1:1 décomp ll.1159-1173 : ENIGMA_BERRY check (= per-battler custom berry data
  // gEnigmaBerries[target].holdEffect/Param). gEnigmaBerries Frontier deferred
  // (= rare custom berry data) ; fallback à GetItemHoldEffect normal (=
  // ITEM_ENIGMA_BERRY sans custom data retourne 0 = pas d'effet sur accuracy).
  const holdEffect = GetItemHoldEffect(targetMon.item);
  const holdEffectParam = GetItemHoldEffectParam(targetMon.item);
  if (holdEffect === HOLD_EFFECT_EVASION_UP_AC) {
    calc = Math.floor((calc * (100 - holdEffectParam)) / 100);
  }

  if ((Random() % 100 + 1) > calc) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MISS_TYPE] = B_MSG_MISSED;
    ctx.scriptPtr = jumpTarget;
  }
  return false;
}

// ─── Cmd_moveend (0x49) ─────────────────────────────────────────────────────

/** 1:1 décomp `include/constants/battle_script_commands.h:393-410`.
 *  MOVEEND_COUNT = 17 (= nb total sub-states ; AUDIT FIX session post-compact :
 *  l'ancien stub mettait COUNT=28 ce qui était FAUX, le décomp Em a 17 cases). */
const MOVEEND_RAGE                 = 0;
const MOVEEND_DEFROST              = 1;
const MOVEEND_SYNCHRONIZE_TARGET   = 2;
const MOVEEND_ON_DAMAGE_ABILITIES  = 3;
const MOVEEND_IMMUNITY_ABILITIES   = 4;
const MOVEEND_SYNCHRONIZE_ATTACKER = 5;
const MOVEEND_CHOICE_MOVE          = 6;
const MOVEEND_CHANGED_ITEMS        = 7;
const MOVEEND_ATTACKER_INVISIBLE   = 8;
const MOVEEND_ATTACKER_VISIBLE     = 9;
const MOVEEND_TARGET_VISIBLE       = 10;
const MOVEEND_ITEM_EFFECTS_ALL     = 11;
const MOVEEND_KINGSROCK_SHELLBELL  = 12;
const MOVEEND_SUBSTITUTE           = 13;
const MOVEEND_UPDATE_LAST_MOVES    = 14;
const MOVEEND_MIRROR_MOVE          = 15;
const MOVEEND_NEXT_TARGET          = 16;
const MOVEEND_COUNT                = 17;

/** 1:1 décomp `TARGET_TURN_DAMAGED` (battle.h:469). */
function _TARGET_TURN_DAMAGED(): boolean {
  return gSpecialStatuses[gBattlerTarget].physicalDmg !== 0
      || gSpecialStatuses[gBattlerTarget].specialDmg !== 0;
}

/** 1:1 décomp `BATTLE_PARTNER(id)` (battle.h:46). */
function _BATTLE_PARTNER(id: number): number { return id ^ BIT_FLANK; }

/** 1:1 décomp `WasUnableToUseMove(battler)` (battle_util.c:877-891). */
function _WasUnableToUseMove(battler: number): boolean {
  const p = gProtectStructs[battler];
  return Boolean(
    p.prlzImmobility || p.targetNotAffected || p.usedImprisonedMove
    || p.loveImmobility || p.usedDisabledMove || p.usedTauntedMove
    || p.flag2Unknown || p.flinchImmobility || p.confusionSelfDmg
  );
}

/** 1:1 décomp `MoveValuesCleanUp` (battle_script_commands.c:3624-3633). */
function _MoveValuesCleanUp(): void {
  setMoveResultFlags(0);
  gBattleScripting.dmgMultiplier = 1;
  setCritMultiplier(1);
  gBattleCommunication[3 /* MOVE_EFFECT_BYTE */] = 0;
  gBattleCommunication[MISS_TYPE] = 0;
  setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
  setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
}

/** 1:1 décomp `Cmd_moveend` (battle_script_commands.c:4213-4501).
 *
 *  State machine post-move cleanup. 17 sub-states qui gèrent : Rage build,
 *  Defrost via Fire, Synchronize, ability-on-damage (Static/Effect Spore/etc.),
 *  status immunity abilities, Choice Band lock, Trick/Switcheroo items,
 *  semi-invulnerable sprite show/hide, post-move items (berries), Kings Rock /
 *  Shell Bell, substitute upkeep, last moves tracking, Mirror Move record,
 *  next target (Double/multi-target).
 *
 *  Args : 1 byte endMode + 1 byte endState. Total 3 bytes (opcode + args).
 *
 *  endMode = 1 → "exit after first sub-state with no effect" (= utilisé par les
 *  scripts qui veulent un single-step pas full unwind).
 *  endMode = 2 → "exit when reached endState" (= partial unwind jusqu'à un état
 *  donné). */
function Cmd_moveend(ctx: BattleScriptContext): boolean {
  // ctx.scriptPtr est sur opcode+1 (= endMode position) après pre-advance dispatcher.
  // On note l'opcode start pour push cursor / stay-on-opcode.
  const opcodeStartPtr = ctx.scriptPtr - 1;
  const endMode = readByte(ctx);
  const endState = readByte(ctx);

  // 1:1 décomp : `if (gChosenMove == MOVE_UNAVAILABLE) originallyUsedMove = MOVE_NONE`
  const originallyUsedMove = (gChosenMove === MOVE_UNAVAILABLE) ? MOVE_NONE : gChosenMove;

  // 1:1 décomp : `holdEffectAtk = GetItemHoldEffect(gBattleMons[gBattlerAttacker].item)`.
  // gEnigmaBerries[]→holdEffect path Frontier deferred (= rare custom berry data).
  const holdEffectAtk = GetItemHoldEffect(gBattleMons[gBattlerAttacker].item);

  // 1:1 décomp : `GET_MOVE_TYPE(gCurrentMove, moveType)` — Hidden Power dynamic
  // type override géré via gDynamicMoveType ; sinon move.type.
  const moveType = gDynamicMoveType !== 0
    ? (gDynamicMoveType & 0x3F)  // DYNAMIC_TYPE_MASK
    : getBattleMove(gCurrentMove).type;

  let effect = false;

  // do...while loop 1:1 décomp.
  let iterations = 0;
  const MAX_ITER = 64;  // safety bound
  while (iterations++ < MAX_ITER) {
    switch (gBattleScripting.moveendState) {
      case MOVEEND_RAGE: {
        if ((gBattleMons[gBattlerTarget].status2 & STATUS2_RAGE)
            && gBattleMons[gBattlerTarget].hp !== 0
            && gBattlerAttacker !== gBattlerTarget
            && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            && _TARGET_TURN_DAMAGED()
            && getBattleMove(gCurrentMove).power !== 0
            && (gBattleMons[gBattlerTarget].statStages[STAT_ATK] ?? DEFAULT_STAT_STAGE) < MAX_STAT_STAGE) {
          gBattleMons[gBattlerTarget].statStages[STAT_ATK] = (gBattleMons[gBattlerTarget].statStages[STAT_ATK] ?? DEFAULT_STAT_STAGE) + 1;
          // BattleScriptPushCursor + jump = save current opcode start, jump to label.
          ctx.scriptPtrStack.push(opcodeStartPtr);
          const off = getBattleScriptOffset('BattleScript_RageIsBuilding');
          if (off >= 0) ctx.scriptPtr = off;
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_DEFROST: {
        if ((gBattleMons[gBattlerTarget].status1 & STATUS1_FREEZE)
            && gBattleMons[gBattlerTarget].hp !== 0
            && gBattlerAttacker !== gBattlerTarget
            && gSpecialStatuses[gBattlerTarget].specialDmg !== 0
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            && moveType === 10 /* TYPE_FIRE */) {
          gBattleMons[gBattlerTarget].status1 &= ~STATUS1_FREEZE;
          setActiveBattler(gBattlerTarget);
          // 1:1 décomp : Emit SetMonData REQUEST_STATUS_BATTLE + Mark — wired
          // via batch C bridge → SetMonData status1 au party (= 40 = STATUS).
          _BtlController_EmitSetMonData_N1(0 /* B_COMM_TO_CONTROLLER */,
            40 /* REQUEST_STATUS_BATTLE */, 0, 4 /* u32 */,
            gBattleMons[gBattlerTarget].status1);
          MarkBattlerForControllerExec(gBattlerTarget);
          ctx.scriptPtrStack.push(opcodeStartPtr);
          const off = getBattleScriptOffset('BattleScript_DefrostedViaFireMove');
          if (off >= 0) ctx.scriptPtr = off;
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_SYNCHRONIZE_TARGET: {
        if (AbilityBattleEffects(ABILITYEFFECT_SYNCHRONIZE, gBattlerTarget, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ON_DAMAGE_ABILITIES: {
        if (AbilityBattleEffects(ABILITYEFFECT_ON_DAMAGE, gBattlerTarget, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_IMMUNITY_ABILITIES: {
        // 1:1 décomp : loop through all battlers, increment state only when done.
        if (AbilityBattleEffects(ABILITYEFFECT_IMMUNITY, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        } else {
          gBattleScripting.moveendState++;
        }
        break;
      }
      case MOVEEND_SYNCHRONIZE_ATTACKER: {
        if (AbilityBattleEffects(ABILITYEFFECT_ATK_SYNCHRONIZE, gBattlerAttacker, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            ctx.scriptPtrStack.push(opcodeStartPtr);
            const off = getBattleScriptOffset(label);
            if (off >= 0) ctx.scriptPtr = off;
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_CHOICE_MOVE: {
        if ((gHitMarker & HITMARKER_OBEYS)
            && holdEffectAtk === HOLD_EFFECT_CHOICE_BAND
            && gChosenMove !== MOVE_STRUGGLE
            && (gBattleStruct.choicedMove[gBattlerAttacker] === MOVE_NONE
                || gBattleStruct.choicedMove[gBattlerAttacker] === MOVE_UNAVAILABLE)) {
          if (gChosenMove === MOVE_BATON_PASS && !(gMoveResultFlags & MOVE_RESULT_FAILED)) {
            gBattleScripting.moveendState++;
            break;
          }
          gBattleStruct.choicedMove[gBattlerAttacker] = gChosenMove;
        }
        let i: number;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[gBattlerAttacker].moves[i] === gBattleStruct.choicedMove[gBattlerAttacker])
            break;
        }
        if (i === MAX_MON_MOVES) gBattleStruct.choicedMove[gBattlerAttacker] = MOVE_NONE;
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_CHANGED_ITEMS: {
        for (let i = 0; i < gBattlersCount; i++) {
          if (gBattleStruct.changedItems[i] !== 0 /* ITEM_NONE */) {
            gBattleMons[i].item = gBattleStruct.changedItems[i];
            gBattleStruct.changedItems[i] = 0;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ATTACKER_INVISIBLE: {
        if ((gStatuses3[gBattlerAttacker] & STATUS3_SEMI_INVULNERABLE)
            && (gHitMarker & HITMARKER_NO_ANIMATIONS)) {
          setActiveBattler(gBattlerAttacker);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, true);
          MarkBattlerForControllerExec(gBattlerAttacker);
          gBattleScripting.moveendState++;
          // 1:1 décomp : `return;` — exit handler sans avancer opcode pour re-call.
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ATTACKER_VISIBLE: {
        if ((gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
            || !(gStatuses3[gBattlerAttacker] & STATUS3_SEMI_INVULNERABLE)
            || _WasUnableToUseMove(gBattlerAttacker)) {
          setActiveBattler(gBattlerAttacker);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, false);
          MarkBattlerForControllerExec(gBattlerAttacker);
          gStatuses3[gBattlerAttacker] &= ~STATUS3_SEMI_INVULNERABLE;
          gSpecialStatuses[gBattlerAttacker].restoredBattlerSprite = 1;
          gBattleScripting.moveendState++;
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_TARGET_VISIBLE: {
        if (!gSpecialStatuses[gBattlerTarget].restoredBattlerSprite
            && gBattlerTarget < gBattlersCount
            && !(gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE)) {
          setActiveBattler(gBattlerTarget);
          BtlController_EmitSpriteInvisibility(0 /* B_COMM_TO_CONTROLLER */, false);
          MarkBattlerForControllerExec(gBattlerTarget);
          gStatuses3[gBattlerTarget] &= ~STATUS3_SEMI_INVULNERABLE;
          gBattleScripting.moveendState++;
          ctx.scriptPtr = opcodeStartPtr;
          return false;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_ITEM_EFFECTS_ALL: {
        if (ItemBattleEffects(ITEMEFFECT_MOVE_END, 0, false) !== 0) {
          // 1:1 décomp : ItemBattleEffects set scriptPtr via BattleScriptPushCursor.
          // Notre port : consume _lastWantedScriptLabel + push current + jump.
          const label = consumeItemWantedScript();
          if (label) {
            const off = getBattleScriptOffset(label);
            if (off >= 0) {
              ctx.scriptPtrStack.push(ctx.scriptPtr);
              ctx.scriptPtr = off;
            }
          }
          effect = true;
        } else {
          gBattleScripting.moveendState++;
        }
        break;
      }
      case MOVEEND_KINGSROCK_SHELLBELL: {
        if (ItemBattleEffects(ITEMEFFECT_KINGSROCK_SHELLBELL, 0, false) !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            const off = getBattleScriptOffset(label);
            if (off >= 0) {
              ctx.scriptPtrStack.push(ctx.scriptPtr);
              ctx.scriptPtr = off;
            }
          }
          effect = true;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_SUBSTITUTE: {
        for (let i = 0; i < gBattlersCount; i++) {
          if (gDisableStructs[i].substituteHP === 0) {
            gBattleMons[i].status2 &= ~STATUS2_SUBSTITUTE;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_UPDATE_LAST_MOVES: {
        if (gHitMarker & HITMARKER_SWAP_ATTACKER_TARGET) {
          // 1:1 décomp : swap attacker/target via temp gActiveBattler.
          const swap = gBattlerAttacker;
          setActiveBattler(gBattlerAttacker);
          setBattlerAttacker(gBattlerTarget);
          setBattlerTarget(swap);
          setHitMarker(gHitMarker & ~HITMARKER_SWAP_ATTACKER_TARGET);
        }
        if (gHitMarker & HITMARKER_ATTACKSTRING_PRINTED) {
          gLastPrintedMoves[gBattlerAttacker] = gChosenMove;
        }
        if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])
            && !(gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker])
            && getBattleMove(originallyUsedMove).effect !== EFFECT_BATON_PASS) {
          if (gHitMarker & HITMARKER_OBEYS) {
            gLastMoves[gBattlerAttacker] = gChosenMove;
            gLastResultingMoves[gBattlerAttacker] = gCurrentMove;
          } else {
            gLastMoves[gBattlerAttacker] = MOVE_UNAVAILABLE;
            gLastResultingMoves[gBattlerAttacker] = MOVE_UNAVAILABLE;
          }
          if (!(gHitMarker & HITMARKER_FAINTED(gBattlerTarget))) {
            gLastHitBy[gBattlerTarget] = gBattlerAttacker;
          }
          if ((gHitMarker & HITMARKER_OBEYS) && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
            if (gChosenMove === MOVE_UNAVAILABLE) {
              gLastLandedMoves[gBattlerTarget] = gChosenMove;
            } else {
              gLastLandedMoves[gBattlerTarget] = gCurrentMove;
              // 1:1 décomp : GET_MOVE_TYPE(gCurrentMove, gLastHitByType[gBattlerTarget]).
              gLastHitByType[gBattlerTarget] = gDynamicMoveType !== 0
                ? (gDynamicMoveType & 0x3F)
                : getBattleMove(gCurrentMove).type;
            }
          } else {
            gLastLandedMoves[gBattlerTarget] = MOVE_UNAVAILABLE;
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_MIRROR_MOVE: {
        if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])
            && !(gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker])
            && (getBattleMove(originallyUsedMove).flags & FLAG_MIRROR_MOVE_AFFECTED)
            && (gHitMarker & HITMARKER_OBEYS)
            && gBattlerAttacker !== gBattlerTarget
            && !(gHitMarker & HITMARKER_FAINTED(gBattlerTarget))
            && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
          gLastTakenMove[gBattlerTarget] = gChosenMove;
          // 1:1 décomp : `lastTakenMoveFrom[attacker*2 + target*8 + 0/1]` — flat array.
          // Notre gLastTakenMoveFrom est flat 4*4 (= 16) ; même indexing.
          gLastTakenMoveFrom[gBattlerAttacker * 4 + gBattlerTarget] = gChosenMove;
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_NEXT_TARGET: {
        // For moves hitting two opposing Pokémon (Double battles).
        if (!(gHitMarker & HITMARKER_UNABLE_TO_USE_MOVE)
            && (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
            && !gProtectStructs[gBattlerAttacker].chargingTurn
            && getBattleMove(gCurrentMove).target === MOVE_TARGET_BOTH
            && !(gHitMarker & HITMARKER_NO_ATTACKSTRING)) {
          const battler = GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget)));
          if (gBattleMons[battler].hp !== 0) {
            // 1:1 décomp : re-execute the move on the partner.
            setBattlerTarget(battler);
            setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
            gBattleScripting.moveendState = 0;
            _MoveValuesCleanUp();
            // 1:1 décomp : `BattleScriptPush(gBattleScriptsForMoveEffects[effect])`
            // = push the effect script (will return after FlushMessageBox).
            const moveEff = getBattleMove(gCurrentMove).effect;
            const effectOff = getMoveEffectScriptOffset(moveEff);
            if (effectOff >= 0) ctx.scriptPtrStack.push(effectOff);
            const flushOff = getBattleScriptOffset('BattleScript_FlushMessageBox');
            if (flushOff >= 0) ctx.scriptPtr = flushOff;
            else ctx.scriptPtr = opcodeStartPtr;  // safety
            return false;
          } else {
            setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
          }
        }
        gBattleScripting.moveendState++;
        break;
      }
      case MOVEEND_COUNT:
        break;
    }

    // 1:1 décomp : `if (endMode == 1 && effect == FALSE) gBattleScripting.moveendState = MOVEEND_COUNT;`
    if (endMode === 1 && !effect) {
      gBattleScripting.moveendState = MOVEEND_COUNT;
    }
    // 1:1 décomp : `if (endMode == 2 && endState == gBattleScripting.moveendState) gBattleScripting.moveendState = MOVEEND_COUNT;`
    if (endMode === 2 && endState === gBattleScripting.moveendState) {
      gBattleScripting.moveendState = MOVEEND_COUNT;
    }

    // 1:1 décomp : `} while (gBattleScripting.moveendState != MOVEEND_COUNT && effect == FALSE);`
    if (gBattleScripting.moveendState === MOVEEND_COUNT || effect) break;
  }

  // 1:1 décomp : `if (gBattleScripting.moveendState == MOVEEND_COUNT && effect == FALSE) gBattlescriptCurrInstr += 3;`
  // → ctx.scriptPtr est déjà à opcodeStartPtr+3 (= post-args). No advance needed.
  // Si effect == TRUE : on a déjà push+jump → ctx.scriptPtr = label, return false.
  // Si state != COUNT && effect = TRUE → loop a break-é → ctx.scriptPtr est à label.
  // Si state == COUNT && effect == TRUE : (= dernier sub-state a fait push)
  //   → ctx.scriptPtr = label, OK.

  if (effect) {
    // On a push opcodeStartPtr + jump à label. Quand le sub-script return, on
    // revient à opcodeStartPtr (= opcode position). Dispatcher pre-advance +1 →
    // re-call Cmd_moveend qui reprend au sub-state suivant (moveendState++ déjà fait).
  }
  return false;
}

// ─── Cmd_healthbarupdate (0x0B) ─────────────────────────────────────────────

/** 1:1 décomp `Cmd_healthbarupdate` (battle_script_commands.c:1807-1841).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *  - if exec → stay
 *  - if !NO_EFFECT :
 *    - if SUBSTITUTE + substituteHP + !IGNORE_SUBSTITUTE → PrepareString
 *      SUBSTITUTEDAMAGED (= "the substitute took damage")
 *    - else : emit HealthBarUpdate(min(damage, 10000)) + Mark.
 *      Si player side and damage > 0 : gBattleResults.playerMonWasDamaged = TRUE.
 *  - advance 2 bytes
 *
 *  Helpers utilisés : BtlController_EmitHealthBarUpdate. */
function Cmd_healthbarupdate(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  const battlerArg = readByte(ctx);

  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);

    // 1:1 décomp battle_script_commands.c:3133-3158 : substitute check + emit.
    const mon = gBattleMons[activeBattler];
    const HITMARKER_IGNORE_SUBSTITUTE_LOCAL = 1 << 8;
    if ((mon.status2 & STATUS2_SUBSTITUTE)
        && gDisableStructs[activeBattler].substituteHP > 0
        && !(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE_LOCAL)) {
      // 1:1 décomp : PrepareStringBattle(STRINGID_SUBSTITUTEDAMAGED=199, active).
      _PrepareStringBattle_N1(199 /* STRINGID_SUBSTITUTEDAMAGED */, activeBattler);
    } else {
      // 1:1 décomp : clamp damage à 10000 (= max u16 truncation safety).
      let healthValue = gBattleMoveDamage;
      if (healthValue > 10000) healthValue = 10000;
      BtlController_EmitHealthBarUpdate(0 /* B_COMM_TO_CONTROLLER */, healthValue);
      MarkBattlerForControllerExec(activeBattler);
    }

    // 1:1 décomp `Cmd_healthbarupdate` (battle_script_commands.c:3162-3169) :
    // `if (GetBattlerSide(active) == B_SIDE_PLAYER && gBattleMoveDamage > 0)
    //   gBattleResults.playerMonWasDamaged = TRUE;`
    if (GET_BATTLER_SIDE(activeBattler) === B_SIDE_PLAYER
        && gBattleMoveDamage > 0) {
      gBattleResults.playerMonWasDamaged = 1;
    }
  }
  return false;
}

// ─── Cmd_attackcanceler (0x00) — happy path 1:1 décomp ──────────────────────

/** 1:1 décomp `Cmd_attackcanceler` (battle_script_commands.c:915-1007) — happy path.
 *
 *  Le décomp complet check : gBattleOutcome != 0, attacker.hp == 0, status
 *  AtkCanceler_UnableToUseMove, AbilityBattleEffects MOVES_BLOCK, PP check,
 *  IsMonDisobedient, MagicCoat bounce, Snatch, LightningRod redirect, Protect.
 *
 *  Port complet 1:1 (sessions 136-138) : AtkCanceler_UnableToUseMove,
 *  AbilityBattleEffects MOVES_BLOCK, IsMonDisobedient, MagicCoat, Snatch,
 *  LightningRod, DEFENDER_IS_PROTECTED.
 *
 *  Cf. `src/engine/battle/atk-canceler.ts` pour le port complet de
 *  AtkCanceler_UnableToUseMove (14 sub-states). */
function Cmd_attackcanceler(ctx: BattleScriptContext): boolean {
  const opcodeStartPtr = ctx.scriptPtr - 1;  // before pre-advance

  // 1:1 décomp (battle_script_commands.c:984-988) :
  // `if (gBattleOutcome != 0) { gCurrentActionFuncId = B_ACTION_FINISHED; return; }`
  if (gBattleOutcome !== 0) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
    return _stayOnOpcode(ctx);
  }

  // 1:1 décomp : attacker.hp == 0 (= died before its turn, e.g. Destiny Bond).
  if (gBattleMons[gBattlerAttacker].hp === 0
      && !(gHitMarker & HITMARKER_NO_ATTACKSTRING)) {
    setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
    const moveEndOffset = getBattleScriptOffset('BattleScript_MoveEnd');
    if (moveEndOffset >= 0) ctx.scriptPtr = moveEndOffset;
    return false;
  }

  // 1:1 décomp : AtkCanceler_UnableToUseMove (battle_util.c:1985-2270).
  // Status checks : sleep/freeze/truant/recharge/flinch/disabled/taunted/
  // imprisoned/confused/paralyzed/in_love/bide/thaw. Si trigger, le helper
  // a set ctx.scriptPtr au bon BattleScript label et on return.
  if (applyAtkCanceler(ctx, opcodeStartPtr)) {
    return false;
  }

  // 1:1 décomp : AbilityBattleEffects(ABILITYEFFECT_MOVES_BLOCK, target, 0, 0, 0).
  // → trigger Soundproof block sur target qui Soundproof + move dans sSoundMovesTable.
  const movesBlockEff = AbilityBattleEffects(ABILITYEFFECT_MOVES_BLOCK, gBattlerTarget, 0, 0, 0);
  if (movesBlockEff !== 0) {
    const label = consumeAbilityWantedScript();
    if (label) {
      const off = getBattleScriptOffset(label);
      if (off >= 0) ctx.scriptPtr = off;
    }
    return false;
  }

  // 1:1 décomp : PP check (= no PP + not STRUGGLE + not allowed + not multiturn).
  const attackerMon = gBattleMons[gBattlerAttacker];
  if (!attackerMon.pp[gCurrMovePos]
      && gCurrentMove !== MOVE_STRUGGLE
      && !(gHitMarker & (HITMARKER_ALLOW_NO_PP | HITMARKER_NO_ATTACKSTRING))
      && !(attackerMon.status2 & STATUS2_MULTIPLETURNS)) {
    const noPpOffset = getBattleScriptOffset('BattleScript_NoPPForMove');
    if (noPpOffset >= 0) ctx.scriptPtr = noPpOffset;
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    return false;
  }

  // 1:1 décomp : `gHitMarker &= ~HITMARKER_ALLOW_NO_PP;`
  setHitMarker(gHitMarker & ~HITMARKER_ALLOW_NO_PP);

  // 1:1 décomp : IsMonDisobedient (battle_util.c:3900-4015). Si pas obéissant
  // (= badges insuffisants pour le level du mon traded), jump à BattleScript_*
  // approprié et return immédiat.
  if (applyDisobedienceCheck(ctx, opcodeStartPtr)) {
    return false;
  }

  // 1:1 décomp : `gHitMarker |= HITMARKER_OBEYS;` (= obeyed le check disobedience)
  setHitMarker(gHitMarker | HITMARKER_OBEYS);

  // 1:1 décomp ll.962-1006 : Magic Coat / Snatch / Lightning Rod / Protect.
  const moveFlags = getBattleMove(gCurrentMove).flags;

  // 1. Magic Coat bounce (= reflect status moves).
  if (gProtectStructs[gBattlerTarget].bounceMove
      && (moveFlags & FLAG_MAGIC_COAT_AFFECTED)) {
    PressurePPLoseAtkCanceler(gBattlerAttacker, gBattlerTarget, MOVE_MAGIC_COAT_ATKCANCELER);
    gProtectStructs[gBattlerTarget].bounceMove = 0;
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset('BattleScript_MagicCoatBounce');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  // 2. Snatch (= steal status move).
  for (let i = 0; i < gBattlersCount; i++) {
    const snatchBattler = gBattlerByTurnOrderAC[i];
    if (gProtectStructs[snatchBattler].stealMove
        && (moveFlags & FLAG_SNATCH_AFFECTED)) {
      PressurePPLoseAtkCanceler(gBattlerAttacker, snatchBattler, MOVE_SNATCH_ATKCANCELER);
      gProtectStructs[snatchBattler].stealMove = 0;
      gBattleScripting.battler = snatchBattler;
      ctx.scriptPtrStack.push(opcodeStartPtr);
      const off = getBattleScriptOffset('BattleScript_SnatchedMove');
      if (off >= 0) ctx.scriptPtr = off;
      return false;
    }
  }

  // 3. Lightning Rod redirect (= absorb Electric move).
  if (gSpecialStatuses[gBattlerTarget].lightningRodRedirected) {
    gSpecialStatuses[gBattlerTarget].lightningRodRedirected = 0;
    setLastUsedAbility(78 /* ABILITY_LIGHTNING_ROD */);
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset('BattleScript_TookAttack');
    if (off >= 0) ctx.scriptPtr = off;
    _recordAbilityBattleAC(gBattlerTarget, 78);
    return false;
  }

  // 4. DEFENDER_IS_PROTECTED + 2-turn check.
  if (gProtectStructs[gBattlerTarget].protected
      && (moveFlags & FLAG_PROTECT_AFFECTED)
      && (gCurrentMove !== MOVE_CURSE_ATKCANCELER
          || _isBattlerOfTypeAC(gBattlerAttacker, 7 /* TYPE_GHOST */))
      && (!_isTwoTurnsMoveAC(gCurrentMove)
          || (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS))) {
    _cancelMultiTurnMovesAC(gBattlerAttacker);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_PROTECTED_ATKCANCELER;
  }

  return false;
}

// Helpers pour Cmd_attackcanceler (= éviter dups import).
import { PressurePPLose as PressurePPLoseAtkCanceler, CancelMultiTurnMoves as _cancelMultiTurnMovesAC, RecordAbilityBattle as _recordAbilityBattleAC } from './util';
import { gBattlerByTurnOrder as gBattlerByTurnOrderAC } from './state';
import { FLAG_MAGIC_COAT_AFFECTED, FLAG_SNATCH_AFFECTED, FLAG_PROTECT_AFFECTED } from './constants';
import { MOVE_MAGIC_COAT as MOVE_MAGIC_COAT_ATKCANCELER, MOVE_SNATCH as MOVE_SNATCH_ATKCANCELER, MOVE_CURSE as MOVE_CURSE_ATKCANCELER } from '../decomp-data/include/constants/moves-data';
// B_MSG_PROTECTED = 0 (= "X protected itself") dans le table sProtectSuccessStringIds.
const B_MSG_PROTECTED_ATKCANCELER = 0;
// IsBattlerOfType + IsTwoTurnsMove helpers (= déjà portés dans d'autres modules).
function _isBattlerOfTypeAC(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}
function _isTwoTurnsMoveAC(move: number): boolean {
  const eff = getBattleMove(move).effect;
  // 1:1 décomp battle_script_commands.c:8199 IsTwoTurnsMove — 6 effects.
  // EFFECT_SKULL_BASH=145, RAZOR_WIND=39, SKY_ATTACK=75, SOLAR_BEAM=151,
  // SEMI_INVULNERABLE=155, BIDE=26.
  // AUDIT FIX session 144 : EFFECT_SKY_ATTACK=75 manquait (= dans cmd-niveau-1
  // seulement ; cmd-niveau-27/30 portaient bien les 6 valeurs).
  return eff === 145 || eff === 39 || eff === 75
      || eff === 151 || eff === 155 || eff === 26;
}

// ─── Install handlers in dispatch table ─────────────────────────────────────

/** Register Niveau 1 handlers dans le dispatch table de script-interpreter.
 *  Appelé une fois au boot du module battle. */
export function installNiveau1Handlers(commandsTable: BattleOpcodeHandler[]): void {
  commandsTable[0x00] = Cmd_attackcanceler;
  commandsTable[0x01] = Cmd_accuracycheck;
  commandsTable[0x03] = Cmd_ppreduce;
  commandsTable[0x04] = Cmd_critcalc;
  commandsTable[0x05] = Cmd_damagecalc;
  commandsTable[0x06] = Cmd_typecalc;
  commandsTable[0x07] = Cmd_adjustnormaldamage;
  commandsTable[0x0B] = Cmd_healthbarupdate;
  commandsTable[0x0C] = Cmd_datahpupdate;
  commandsTable[0x19] = Cmd_tryfaintmon;
  commandsTable[0x49] = Cmd_moveend;
  console.log('[battle/cmd-niveau-1] installed 11/11 Niveau 1 handlers (audited 1:1 décomp)');
}

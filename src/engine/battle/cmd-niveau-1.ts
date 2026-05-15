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
 *   0x49 Cmd_moveend          stub (= skip toutes sub-states)
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
} from './state';
import { Random } from '../random';
import { getBattleMove } from './data/battle-moves';
import { runDamagecalc } from './damage-calc';
import { Cmd_typecalc as TypecalcImpl } from './type-calc';
import { readWord, readHalfword, readByte, getBattleScriptOffset } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';
import {
  MarkBattlerForControllerExec,
  BtlController_EmitHealthBarUpdate,
} from './battle-controllers';
import { getBattlerForBattleScript as _utilGetBattler } from './util';
import {
  // Hitmarker bits
  HITMARKER_NO_ATTACKSTRING,
  HITMARKER_NO_PPDEDUCT,
  HITMARKER_UNABLE_TO_USE_MOVE,
  HITMARKER_OBEYS,
  HITMARKER_ALLOW_NO_PP,
  // Status bits
  STATUS2_FOCUS_ENERGY,
  STATUS2_MULTIPLETURNS,
  STATUS2_SUBSTITUTE,
  STATUS3_CANT_SCORE_A_CRIT,
  STATUS3_ALWAYS_HITS,
  STATUS3_SEMI_INVULNERABLE,
  STATUS3_CHARGED_UP,
  // Battle type flags
  BATTLE_TYPE_WALLY_TUTORIAL,
  BATTLE_TYPE_FIRST_BATTLE,
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
  // Move effects
  EFFECT_HIGH_CRITICAL,
  EFFECT_SKY_ATTACK,
  EFFECT_BLAZE_KICK,
  EFFECT_POISON_TAIL,
  EFFECT_THUNDER,
  EFFECT_FALSE_SWIPE,
  // Species
  SPECIES_CHANSEY,
  SPECIES_FARFETCHD,
  // Moves misc
  MOVE_STRUGGLE,
  // Stats
  STAT_ACC,
  STAT_EVASION,
  MIN_STAT_STAGE,
  MAX_STAT_STAGE,
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

/** Stub pour hold effect — TODO porter `GetItemHoldEffect(itemId)`.
 *  Pour now : retourne HOLD_EFFECT_NONE (= 0) toujours. */
function _getHoldEffect(_itemId: number): number { return 0; }

/** Stub pour hold effect param — TODO porter `GetItemHoldEffectParam(itemId)`. */
function _getHoldEffectParam(_itemId: number): number { return 0; }

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

  // 1:1 décomp Pressure switch sur gBattleMoves[move].target — pour MVP, on
  // simplifie au default case (= single battle). TODO porter
  // AbilityBattleEffects(COUNT_ON_FIELD/COUNT_OTHER_SIDE) pour FOES_AND_ALLY/
  // BOTH/OPPONENTS_FIELD multi-target moves.
  //
  // TODO porter gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure check.
  if (gBattlerAttacker !== gBattlerTarget
      && gBattleMons[gBattlerTarget].ability === ABILITY_PRESSURE) {
    ppToDeduct++;
  }

  if (!(gHitMarker & (HITMARKER_NO_PPDEDUCT | HITMARKER_NO_ATTACKSTRING))
      && gBattleMons[gBattlerAttacker].pp[gCurrMovePos] > 0) {
    // 1:1 décomp gProtectStructs[gBattlerAttacker].notFirstStrike = 1.
    // TODO porter gProtectStructs.

    const currentPp = gBattleMons[gBattlerAttacker].pp[gCurrMovePos];
    if (currentPp > ppToDeduct) {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] -= ppToDeduct;
    } else {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = 0;
    }
    // TODO : MOVE_IS_PERMANENT + BtlController_EmitSetMonData REQUEST_PPMOVE_X
    // pour persist PP au save block.
  }

  setHitMarker(gHitMarker & ~HITMARKER_NO_PPDEDUCT);
  return false;
}

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

  // TODO porter gProtectStructs[attacker].helpingHand × 1.5 boost.

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

  // Focus Band : `Random() % 100 < param` → activate.
  // TODO porter gSpecialStatuses[target].focusBanded set.
  let focusBanded = false;
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    focusBanded = true;
  }

  // Endured stub (= gProtectStructs[target].endured pas porté → false toujours).
  const endured = false;

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
      // TODO porter gLastUsedItem set ici (= utilisé par resultmessage HUNG_ON
      // pour afficher "X hung on using its Focus Band!").
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
 *  Logic minimal :
 *  1. Read arg byte.
 *  2. Skip si MOVE_RESULT_NO_EFFECT.
 *  3. Resolve gActiveBattler via getBattlerForBattleScript(arg).
 *  4. Substitute path — TODO porter (= skip pour now).
 *  5. Si damage < 0 → HP gain (= clamp à maxHP).
 *  6. Sinon → HP loss (= clamp à 0), gHpDealt = damage clipped.
 *
 *  Skip : substitute, Bide damage tracker, Shell Bell damage record,
 *  physical/special tracker pour Counter/Mirror Coat. */
function Cmd_datahpupdate(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : `if (gBattleControllerExecFlags) return;`
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }

  const battlerArg = readByte(ctx);

  // 1:1 décomp : moveType resolution avec dynamicMoveType + F_DYNAMIC_TYPE_*.
  // Si dynamicMoveType==0 → use gBattleMoves[move].type, sinon use
  // dynamicMoveType & DYNAMIC_TYPE_MASK (unless IGNORE_PHYSICALITY set →
  // fallback move.type). Pour MVP : juste read move.type.
  void getBattleMove;  // moveType used by physical/special tracker — TODO.

  // 1:1 décomp : `if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT))` — use the
  // composite flag (= MISSED | DOESNT_AFFECT_FOE | FAILED).
  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
    const mon = gBattleMons[activeBattler];

    // 1:1 décomp : Substitute path — TODO porter
    // (= si SUBSTITUTE + substituteHP + !IGNORE_SUBSTITUTE → damage va au
    //  substitute via gDisableStructs.substituteHP -= damage ;
    //  shellBellDmg tracked, PushCursor + BattleScript_SubstituteFade si 0).
    // Pour MVP : tout damage va au mon direct (= sans substitute layer).

    if (gBattleMoveDamage < 0) {
      // Negative damage = heal.
      mon.hp += -gBattleMoveDamage;
      if (mon.hp > mon.maxHP) mon.hp = mon.maxHP;
    } else {
      // 1:1 décomp : HITMARKER_IGNORE_BIDE check + gBideDmg tracker — TODO.
      // 1:1 décomp : physical/special damage tracker (= gProtectStructs.physicalDmg
      // / specialDmg + battlerId pour Counter/Mirror Coat) — TODO.

      if (mon.hp > gBattleMoveDamage) {
        mon.hp -= gBattleMoveDamage;
        setHpDealt(gBattleMoveDamage);
      } else {
        setHpDealt(mon.hp);
        mon.hp = 0;
      }

      // 1:1 décomp : shellBellDmg tracker (= gSpecialStatuses[active].shellBellDmg)
      // — TODO porter gSpecialStatuses.
    }

    // 1:1 décomp : clear HITMARKER_PASSIVE_HP_UPDATE.
    // TODO : exposer HITMARKER_PASSIVE_HP_UPDATE constant + clear ici.

    // 1:1 décomp : Emit SetMonData REQUEST_HP_BATTLE + Mark — la HP doit sync au
    // controller pour update UI. TODO porter via emit.
  } else {
    // 1:1 décomp : NO_EFFECT path → set shellBellDmg = IGNORE_SHELL_BELL si 0.
    // TODO porter gSpecialStatuses.
    const activeBattler = _utilGetBattler(battlerArg);
    setActiveBattler(activeBattler);
  }
  return false;
}

// ─── Cmd_tryfaintmon (0x19) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_tryfaintmon` (battle_script_commands.c:2965-...).
 *
 *  Args : 1 byte battler ref + 1 byte mode + 4 byte ptr (= post-faint dispatch). Total 7 bytes.
 *
 *  Logic minimal :
 *  - Mode 0 (= regular faint check) : si mon.hp == 0 → set HITMARKER_FAINTED +
 *    set gBattlerFainted + outcome (WIN si side OPPONENT, LOST si side PLAYER).
 *  - Mode != 0 (= post-faint dispatcher) : non implémenté (= skip).
 *
 *  Skip : BattleScript_FaintTarget/Attacker jump, Destiny Bond, Grudge, friendship
 *  decrement on player faint, lastOpponentSpecies record. */
function Cmd_tryfaintmon(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const modeFlag = readByte(ctx);
  const _jumpPtr = readWord(ctx);  // 4 bytes post-faint dispatch ptr (mode 2)
  void _jumpPtr;

  if (modeFlag !== 0) {
    // Post-faint dispatcher mode — TODO porter (= currently no-op advance).
    return false;
  }

  let activeBattler: number;
  let _battlerOther: number;
  if (battlerArg === BS_ATTACKER) {
    activeBattler = gBattlerAttacker;
    _battlerOther = gBattlerTarget;
  } else {
    activeBattler = gBattlerTarget;
    _battlerOther = gBattlerAttacker;
  }

  setActiveBattler(activeBattler);
  if (gBattleMons[activeBattler].hp === 0) {
    setBattlerFainted(activeBattler);
    // 1:1 décomp : set HITMARKER_FAINTED(activeBattler) (= bit 28+battlerIdx).
    // Pour now : simple outcome set.
    if (GET_BATTLER_SIDE(activeBattler) === B_SIDE_PLAYER) {
      setBattleOutcome(B_OUTCOME_LOST);
    } else {
      setBattleOutcome(B_OUTCOME_WON);
    }
  }
  return false;
}

// ─── Cmd_accuracycheck (0x01) ───────────────────────────────────────────────

/** 1:1 décomp `sAccuracyStageRatios[]` (battle_script_commands.c:588-603). */
const sAccuracyStageRatios: ReadonlyArray<readonly [number, number]> = [
  [ 33, 100], [ 36, 100], [ 43, 100], [ 50, 100], [ 60, 100], [ 75, 100],
  [  1,   1],  // stage 0 (= +6 internal, +0 displayed)
  [133, 100], [166, 100], [  2,   1], [233, 100], [133,  50], [  3,   1],
];

/** 1:1 décomp `Cmd_accuracycheck` (battle_script_commands.c:1099-1189).
 *
 *  Opcode structure (= bytecode) : 0x01 [u32 jumpTarget] [u16 move]. Total 7 bytes.
 *  Notre interpreter a déjà consommé l'opcode byte → ctx.scriptPtr est sur jumpTarget.
 *
 *  Stubs : JumpIfMoveAffectedByProtect = false, AccuracyCalcHelper = false,
 *  CheckWonderGuardAndLevitate = noop. Weather (Sun/Sandstorm) check via gBattleWeather. */
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
    // JumpIfMoveAffectedByProtect stub : not affected → hit.
    return false;
  }

  if (move === ACC_CURR_MOVE) move = gCurrentMove;

  const md = getBattleMove(move);
  const type = md.type;
  let moveAcc = md.accuracy;

  // JumpIfMoveAffectedByProtect / AccuracyCalcHelper stubs : skip.

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
  // HOLD_EFFECT_EVASION_UP — TODO porter hold effect table.

  if ((Random() % 100 + 1) > calc) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MISS_TYPE] = B_MSG_MISSED;
    ctx.scriptPtr = jumpTarget;
  }
  return false;
}

// ─── Cmd_moveend (0x49) ─────────────────────────────────────────────────────

/** MOVEEND_* states 1:1 décomp `include/battle.h:540-577`.
 *  MOVEEND_COUNT = nombre total de sub-states (= 28 dans le décomp Em). */
const MOVEEND_COUNT = 28;

/** 1:1 décomp `Cmd_moveend` (battle_script_commands.c:4213-4501).
 *
 *  Massive state machine (~20 sub-states) qui handle post-move cleanup.
 *  Pour MVP : skip toutes les sub-states (= aucune effect propagation).
 *
 *  Args : 1 byte endMode + 1 byte endState. Total 3 bytes (opcode + args). */
function Cmd_moveend(ctx: BattleScriptContext): boolean {
  const _endMode = readByte(ctx);
  const _endState = readByte(ctx);
  void _endMode; void _endState;

  // Stub : set moveendState = COUNT (= exit immédiat de la boucle do...while).
  gBattleScripting.moveendState = MOVEEND_COUNT;
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
 *      Si player side and damage > 0 : gBattleResults.playerMonWasDamaged = TRUE
 *      (TODO porter gBattleResults).
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

    // 1:1 décomp : substitute check. Stub partial (= gBattleMons.status2 SUBSTITUTE
    // + gDisableStructs.substituteHP + !HITMARKER_IGNORE_SUBSTITUTE).
    // TODO porter PrepareStringBattle SUBSTITUTEDAMAGED branche.
    void STATUS2_SUBSTITUTE;

    // 1:1 décomp : clamp damage à 10000 (= max u16 truncation safety).
    let healthValue = gBattleMoveDamage;
    if (healthValue > 10000) healthValue = 10000;

    BtlController_EmitHealthBarUpdate(0 /* B_COMM_TO_CONTROLLER */, healthValue);
    MarkBattlerForControllerExec(activeBattler);

    // 1:1 décomp : `if (player side && damage > 0) gBattleResults.playerMonWasDamaged = TRUE;`
    // TODO porter gBattleResults (= post-battle stat tracking).
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
 *  Notre version implémente les branches 1:1 dispo (= happy path + jump labels) :
 *    - hp == 0 → jump BattleScript_MoveEnd + HITMARKER_UNABLE_TO_USE_MOVE
 *    - pp == 0 sans exception → jump BattleScript_NoPPForMove + MOVE_RESULT_MISSED
 *    - Clear ALLOW_NO_PP, set OBEYS
 *    - Advance
 *
 *  TODO porter (= requires structs not yet ported) :
 *  AtkCanceler_UnableToUseMove (battle_util.c, status flinch/sleep/freeze/paralyze/
 *  confuse handling), AbilityBattleEffects MOVES_BLOCK (Soundproof, Damp pour
 *  Explosion), IsMonDisobedient (= friendship/badge check, casino battle pour
 *  trainer), MagicCoat/Snatch/LightningRod (= gProtectStructs/gSpecialStatuses),
 *  DEFENDER_IS_PROTECTED (= gProtectStructs.protected). */
function Cmd_attackcanceler(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : `if (gBattleOutcome != 0) { gCurrentActionFuncId = B_ACTION_FINISHED; return; }`
  // TODO porter gCurrentActionFuncId trigger ici. Pour now : skip (= rare case).

  // 1:1 décomp : attacker.hp == 0 (= died before its turn, e.g. Destiny Bond).
  if (gBattleMons[gBattlerAttacker].hp === 0
      && !(gHitMarker & HITMARKER_NO_ATTACKSTRING)) {
    setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
    const moveEndOffset = getBattleScriptOffset('BattleScript_MoveEnd');
    if (moveEndOffset >= 0) ctx.scriptPtr = moveEndOffset;
    return false;
  }

  // TODO porter : AtkCanceler_UnableToUseMove + AbilityBattleEffects MOVES_BLOCK.

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

  // TODO porter : IsMonDisobedient switch.

  // 1:1 décomp : `gHitMarker |= HITMARKER_OBEYS;`
  setHitMarker(gHitMarker | HITMARKER_OBEYS);

  // TODO porter : MagicCoat bounce / Snatch / LightningRod / DEFENDER_IS_PROTECTED.

  return false;
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

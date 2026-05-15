/**
 * battle/cmd-niveau-1.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Niveau 1 (damage flow basic)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus dans ce niveau :
 *   0x03 Cmd_ppreduce             ✅ implémenté (path happy, sans Pressure ability)
 *   0x04 Cmd_critcalc             ✅ implémenté (sans hold effect specifics)
 *   0x05 Cmd_damagecalc           ⏳ partial (CalculateBaseDamage stub)
 *   0x06 Cmd_typecalc             ⏳ TODO (gros : ~300 lignes type chart + immunités)
 *   0x07 Cmd_adjustnormaldamage   ⏳ TODO
 *   0x0B Cmd_healthbarupdate      ⏳ TODO (UI sync)
 *   0x0C Cmd_datahpupdate         ⏳ TODO
 *   0x19 Cmd_tryfaintmon          ⏳ TODO
 *   0x49 Cmd_moveend              ⏳ TODO (state machine post-move)
 *   0x00 Cmd_attackcanceler       ⏳ TODO (énorme : protect, magic coat, snatch, etc.)
 *   0x01 Cmd_accuracycheck        ⏳ TODO
 *
 * Pour utiliser : ces handlers sont enregistrés dans le dispatch table de
 * script-interpreter.ts via `installNiveau1Handlers()`.
 *
 * Roadmap : `D:/Projet 1/pokemon-web-demo/memory/SESSION-132-BACKING-SYSTEMS.md`
 * + `D:/Projet 1/pokemon-web-demo/memory/ROADMAP-FUTURE-PROOF-2026-05-14.md`.
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
  gBattleScripting,
  gBattleCommunication,
  setHitMarker,
  setCritMultiplier,
  setBattleMoveDamage,
  setMoveResultFlags,
  setPotentialItemEffectBattler,
  setBattlerFainted,
  setBattleOutcome,
} from './state';
import { Random } from '../random';
import { getBattleMove } from './data/battle-moves';
import { runDamagecalc } from './damage-calc';
import { Cmd_typecalc as TypecalcImpl } from './type-calc';
import { readWord, readHalfword, readByte } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `include/constants/battle.h` HITMARKER_*. */
const HITMARKER_NO_ATTACKSTRING = 0x00000040;
const HITMARKER_NO_PPDEDUCT     = 0x00000080;

/** 1:1 décomp STATUS2_FOCUS_ENERGY. */
const STATUS2_FOCUS_ENERGY = 0x00100000;

/** 1:1 décomp STATUS3_CANT_SCORE_A_CRIT. */
const STATUS3_CANT_SCORE_A_CRIT = 0x10000000;

/** 1:1 décomp BATTLE_TYPE_FIRST_BATTLE / WALLY_TUTORIAL.
 *  Ces battles ont des modificateurs spécifiques (= no crits).  */
const BATTLE_TYPE_WALLY_TUTORIAL = 0x10000000;
const BATTLE_TYPE_FIRST_BATTLE   = 0x00000100;

/** 1:1 décomp ABILITY_PRESSURE / BATTLE_ARMOR / SHELL_ARMOR (= include/constants/pokemon.h). */
const ABILITY_BATTLE_ARMOR = 4;
const ABILITY_SHELL_ARMOR  = 75;

/** 1:1 décomp `sCriticalHitChance[]` (battle_script_commands.c:606).
 *  Indexed par critChance (clamped à 0..4). */
const sCriticalHitChance: ReadonlyArray<number> = [16, 8, 4, 3, 2];

/** Stubs pour les data tables (= move effects, abilities, hold effects).
 *  Quand le port aura ces tables, on remplace par real lookup. */
function _getMoveEffect(_moveId: number): number { return 0; }
function _getHoldEffect(_itemId: number): number { return 0; }
function _getMonAbility(monIdx: number): number {
  return gBattleMons[monIdx]?.ability ?? 0;
}

// ─── Cmd_ppreduce (0x03) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_ppreduce` (battle_script_commands.c:1205-1251).
 *
 *  Logic :
 *  1. Si battle controllers en cours d'anim, return (= pause).
 *  2. Calcule ppToDeduct (= 1 par défaut, +1 si target a Pressure ability et est différent de l'attacker).
 *  3. Si pas HITMARKER_NO_PPDEDUCT et pas HITMARKER_NO_ATTACKSTRING, et pp[curMovePos] > 0 :
 *     - decrement pp[curMovePos] de ppToDeduct (clamp à 0).
 *     - sync pp au mon data persistant (= skip pour now, pas de battle controllers).
 *  4. Clear HITMARKER_NO_PPDEDUCT.
 *  5. Advance script ptr.
 *
 *  Notre simplification : gBattleControllerExecFlags = 0 toujours (= pas de
 *  controllers async pour now). Pressure ability handling implémenté basique
 *  (= +1 si target ability == PRESSURE et target != attacker). */
function Cmd_ppreduce(_ctx: BattleScriptContext): boolean {
  let ppToDeduct = 1;

  // 1:1 décomp : pas de gSpecialStatuses[].ppNotAffectedByPressure tracking pour
  // now (= move target check + Pressure ability check sont skip). Le default
  // case du switch :
  //   if (gBattlerAttacker != gBattlerTarget && target.ability == ABILITY_PRESSURE)
  //     ppToDeduct++;
  const ABILITY_PRESSURE = 46;  // include/constants/pokemon.h
  if (gBattlerAttacker !== gBattlerTarget
      && _getMonAbility(gBattlerTarget) === ABILITY_PRESSURE) {
    ppToDeduct++;
  }

  if (!(gHitMarker & (HITMARKER_NO_PPDEDUCT | HITMARKER_NO_ATTACKSTRING))
      && gBattleMons[gBattlerAttacker].pp[gCurrMovePos] > 0) {
    // 1:1 décomp gProtectStructs[gBattlerAttacker].notFirstStrike = 1.
    // Skip pour now (= gProtectStructs not yet ported).

    const currentPp = gBattleMons[gBattlerAttacker].pp[gCurrMovePos];
    if (currentPp > ppToDeduct) {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] -= ppToDeduct;
    } else {
      gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = 0;
    }
    // 1:1 décomp : MOVE_IS_PERMANENT check + BtlController_EmitSetMonData sync
    // au persistent mon data. Skip pour now — pp persistence se fait à la fin
    // du combat via le team data writeback.
  }

  setHitMarker(gHitMarker & ~HITMARKER_NO_PPDEDUCT);
  // gBattlescriptCurrInstr++ → équivalent : advance scriptPtr (déjà fait par le
  // loop dans runBattleScript car le handler returns false).
  return false;
}

// ─── Cmd_critcalc (0x04) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_critcalc` (battle_script_commands.c:1253-1288).
 *
 *  Logic :
 *  1. Lookup attacker item hold effect (= Scope Lens, Lucky Punch, Stick).
 *  2. critChance = 0..N points selon :
 *     - status2 & FOCUS_ENERGY : +2
 *     - move.effect EFFECT_HIGH_CRITICAL : +1
 *     - move.effect EFFECT_SKY_ATTACK / BLAZE_KICK / POISON_TAIL : +1 chacun
 *     - hold effect SCOPE_LENS : +1
 *     - hold effect LUCKY_PUNCH + species CHANSEY : +2
 *     - hold effect STICK + species FARFETCHD : +2
 *  3. Clamp critChance à [0, 4] (= len(sCriticalHitChance) - 1).
 *  4. Si target n'a pas BATTLE_ARMOR / SHELL_ARMOR
 *     et attacker.statuses3 n'a pas CANT_SCORE_A_CRIT
 *     et battleType n'est pas WALLY_TUTORIAL / FIRST_BATTLE
 *     et `Random() % sCriticalHitChance[critChance] == 0`
 *     → gCritMultiplier = 2; sinon = 1.
 *
 *  Note : le FIRST_BATTLE check (= notre tutoriel Birch vs Zigzagon) FORCE
 *  pas de crit. Cohérent 1:1 ROM. */
function Cmd_critcalc(_ctx: BattleScriptContext): boolean {
  const attackerMon = gBattleMons[gBattlerAttacker];
  const targetMon = gBattleMons[gBattlerTarget];
  const item = attackerMon.item;
  const holdEffect = _getHoldEffect(item);

  setPotentialItemEffectBattler(gBattlerAttacker);

  // 1:1 décomp formule critChance.
  const HOLD_EFFECT_SCOPE_LENS  = 0x36;  // 54 (cf. include/constants/hold_effects.h)
  const HOLD_EFFECT_LUCKY_PUNCH = 0x37;  // 55
  const HOLD_EFFECT_STICK       = 0x38;  // 56
  const SPECIES_CHANSEY   = 113;
  const SPECIES_FARFETCHD = 83;
  const EFFECT_HIGH_CRITICAL = 43;
  const EFFECT_SKY_ATTACK    = 56;
  const EFFECT_BLAZE_KICK    = 90;
  const EFFECT_POISON_TAIL   = 96;
  const moveEffect = _getMoveEffect(gCurrentMove);

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

/** 1:1 décomp `Cmd_damagecalc` (battle_script_commands.c:1290-1313).
 *
 *  Wraps CalculateBaseDamage avec gCritMultiplier × dmgMultiplier.
 *  + STATUS3_CHARGED_UP electric ×2, gProtectStructs.helpingHand ×1.5 (= TODO). */
function Cmd_damagecalc(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)].
  // Notre BATTLER_SIDE = idx & 1 (= player side 0, opponent side 1).
  const sideStatus = gSideStatuses[gBattlerTarget & 1] ?? 0;
  const damage = runDamagecalc(sideStatus, gDynamicBasePower, gBattleScripting.battlerWithAbility & 0x3F);
  // TODO porter STATUS3_CHARGED_UP / helping_hand check here.
  setBattleMoveDamage(damage);
  return false;
}

// ─── Cmd_typecalc (0x06) ────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_typecalc` (battle_script_commands.c:1355-1424).
 *  Delegated to type-calc.ts module. */
function Cmd_typecalc(_ctx: BattleScriptContext): boolean {
  return TypecalcImpl();
}

// ─── Cmd_adjustnormaldamage (0x07) ──────────────────────────────────────────

/** 1:1 décomp `Cmd_adjustnormaldamage` (battle_script_commands.c:1658-1700).
 *
 *  Apply final modifiers :
 *  - Substitute check : skip
 *  - parental bond : skip
 *  - HM moves : skip
 *  - clamp damage to defender.hp
 *  - skip si HITMARKER_NO_ATTACKSTRING ou IGNORE_SUBSTITUTE
 *
 *  Notre version : simpler clamp + advance. TODO : substitute, etc. */
function Cmd_adjustnormaldamage(_ctx: BattleScriptContext): boolean {
  // Clamp damage to defender.hp (= 1:1 décomp ; le décomp lit aussi un byte
  // jumpPtr en arg mais pour l'instant on skip car le clamp est inconditionnel).
  const targetMon = gBattleMons[gBattlerTarget];
  if (gBattleMoveDamage >= targetMon.hp) {
    setBattleMoveDamage(targetMon.hp);
  }
  return false;
}

// ─── Cmd_datahpupdate (0x0C) ────────────────────────────────────────────────

/** 1:1 décomp `Cmd_datahpupdate` (battle_script_commands.c:1844-...).
 *
 *  Apply gBattleMoveDamage à target.hp + update gHpDealt + handle substitute. */
function Cmd_datahpupdate(_ctx: BattleScriptContext): boolean {
  // Le décomp lit u8 battlerArg (LO bits) + path substitute. Pour MVP : direct apply.
  const target = gBattleMons[gBattlerTarget];
  let newHp = target.hp - gBattleMoveDamage;
  if (newHp < 0) newHp = 0;
  if (newHp > target.maxHP) newHp = target.maxHP;
  target.hp = newHp;
  return false;
}

// ─── Cmd_tryfaintmon (0x19) ─────────────────────────────────────────────────

/** 1:1 décomp `Cmd_tryfaintmon` (battle_script_commands.c:2965-...).
 *
 *  Si target.hp == 0 → set gBattlerFainted = target + jump faint script.
 *  Notre version : set gBattlerFainted + set gBattleOutcome si toutes les mons
 *  du défender side sont KO (= simpler que 1:1 jusqu'à ce que les controllers
 *  soient portés). */
function Cmd_tryfaintmon(_ctx: BattleScriptContext): boolean {
  const target = gBattleMons[gBattlerTarget];
  if (target.hp === 0) {
    setBattlerFainted(gBattlerTarget);
    // Pour MVP single battle : si l'ennemi est KO, set WIN ; si joueur KO, set LOST.
    if ((gBattlerTarget & 1) === 1) {
      // Opponent side fainted.
      setBattleOutcome(1);  // B_OUTCOME_WON
    } else {
      setBattleOutcome(2);  // B_OUTCOME_LOST
    }
  }
  return false;
}

// ─── Cmd_accuracycheck (0x01) ───────────────────────────────────────────────

/** 1:1 décomp `sAccuracyStageRatios[]` (battle_script_commands.c:588-603). */
const sAccuracyStageRatios: ReadonlyArray<readonly [number, number]> = [
  [ 33, 100], [ 36, 100], [ 43, 100], [ 50, 100], [ 60, 100], [ 75, 100],
  [  1,   1],
  [133, 100], [166, 100], [  2,   1], [233, 100], [133,  50], [  3,   1],
];

const NO_ACC_CALC                = 0xFFFE;
const NO_ACC_CALC_CHECK_LOCK_ON  = 0xFFFD;
const ACC_CURR_MOVE              = 0;

const STAT_ACC     = 6;
const STAT_EVASION = 7;
const MIN_STAT_STAGE = 0;
const MAX_STAT_STAGE = 12;
const DEFAULT_STAT_STAGE = 6;

const ABILITY_COMPOUND_EYES = 14;
const ABILITY_SAND_VEIL     = 8;
const ABILITY_HUSTLE_ACC    = 55;

const B_WEATHER_SUN       = 0x60;
const B_WEATHER_SANDSTORM = 0x18;
const EFFECT_THUNDER      = 152;

const MISS_TYPE = 6;
const B_MSG_MISSED      = 0;

const STATUS3_ALWAYS_HITS = 0x3 << 8;
const STATUS3_ON_AIR      = 0x1 << 6;
const STATUS3_UNDERGROUND = 0x1 << 7;
const STATUS3_UNDERWATER  = 0x1 << 16;

const STATUS2_FORESIGHT_ACC = 1 << 29;
const MOVE_RESULT_MISSED_ACC = 1 << 0;

function isPhysicalAcc(t: number): boolean { return t < 9; }

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
    if (gStatuses3[gBattlerTarget] & (STATUS3_ON_AIR | STATUS3_UNDERGROUND | STATUS3_UNDERWATER)) {
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

  let buff: number;
  if (targetMon.status2 & STATUS2_FORESIGHT_ACC) {
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
  if (attackerMon.ability === ABILITY_HUSTLE_ACC && isPhysicalAcc(type)) {
    calc = Math.floor((calc * 80) / 100);
  }

  setPotentialItemEffectBattler(gBattlerTarget);
  // HOLD_EFFECT_EVASION_UP - TODO porter hold effect table.

  if ((Random() % 100 + 1) > calc) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED_ACC);
    gBattleCommunication[MISS_TYPE] = B_MSG_MISSED;
    ctx.scriptPtr = jumpTarget;  // jump to miss handler
  }
  return false;
}

// ─── Cmd_moveend (0x49) ─────────────────────────────────────────────────────

/** MOVEEND_* states 1:1 décomp `include/battle.h:540-577`. */
const MOVEEND_COUNT = 28;

/** 1:1 décomp `Cmd_moveend` (battle_script_commands.c:4213-4501).
 *
 *  Massive state machine (~20 sub-states) qui handle post-move cleanup :
 *  RAGE, DEFROST, SYNCHRONIZE (both sides), ON_DAMAGE_ABILITIES, IMMUNITY,
 *  CHOICE_MOVE, ITEM_EFFECTS, KING'S ROCK, MIRROR_MOVE update, NEXT_TARGET
 *  (= double battle multi-target), etc.
 *
 *  Pour MVP : skip toutes les sub-states (= no effect propagation). C'est OK
 *  pour single battles simples sans hold items, sans status. Quand on porte
 *  les helpers (AbilityBattleEffects, ItemBattleEffects, MoveValuesCleanUp,
 *  BattleScriptPushCursor), on swap les stubs.
 *
 *  Args structure (= 3 bytes total) :
 *    byte 0 = opcode 0x49
 *    byte 1 = endMode (1 = stop on first effect, 2 = stop at endState, 0 = process all)
 *    byte 2 = endState (only meaningful si endMode == 2)
 *
 *  Notre interpreter a déjà consommé byte 0 → readByte ×2 pour args. */
function Cmd_moveend(ctx: BattleScriptContext): boolean {
  const endMode = readByte(ctx);
  const endState = readByte(ctx);
  void endState;

  // Stub : skip all sub-states (= aucune effect). Set moveendState = COUNT
  // pour exit immédiat de la boucle `do ... while`.
  gBattleScripting.moveendState = MOVEEND_COUNT;

  // 1:1 décomp end-of-loop logic :
  //   if (endMode == 1 && effect == FALSE) moveendState = COUNT
  //   if (endMode == 2 && endState == moveendState) moveendState = COUNT
  //   if (moveendState == COUNT && effect == FALSE) gBattlescriptCurrInstr += 3
  // Notre version : déjà advancé via readByte×2 (= équivalent +3 incluant opcode).
  void endMode;
  return false;
}

// ─── Cmd_healthbarupdate (0x0B) ─────────────────────────────────────────────

/** 1:1 décomp `Cmd_healthbarupdate` (battle_script_commands.c:1807-1843).
 *
 *  Apply gBattleMoveDamage à health bar UI (= async via BtlController_EmitHealthBarUpdate
 *  + wait via gBattleControllerExecFlags). Pour MVP : skip UI animation, juste advance.
 *
 *  Args : 1 byte = target battler arg (= u8 byte after opcode).
 *  Total : 2 bytes (opcode + 1 byte battler arg). */
function Cmd_healthbarupdate(ctx: BattleScriptContext): boolean {
  const _battlerArg = readByte(ctx);
  void _battlerArg;
  // TODO : real UI sync. For now : datahpupdate (0x0C) does the actual HP write.
  // This handler just signals the UI to animate, which we skip.
  return false;
}

// ─── Cmd_attackcanceler (0x00) — happy path ─────────────────────────────────

const HITMARKER_UNABLE_TO_USE_MOVE = 0x00000001;
const HITMARKER_OBEYS              = 0x00100000;
const HITMARKER_NO_ATTACKSTRING_AC = 0x00000040;
const MOVE_RESULT_MISSED_AC = 1 << 0;

/** 1:1 décomp `Cmd_attackcanceler` (battle_script_commands.c:915-1007) — happy path.
 *
 *  Le décomp complet check : gBattleOutcome != 0, attacker.hp == 0, status
 *  AtkCanceler_UnableToUseMove (= sleep/paralyze/freeze/confuse/infatuation/
 *  disable/imprison/truant/recharge), AbilityBattleEffects MOVES_BLOCK
 *  (= Soundproof), PP check, IsMonDisobedient, MagicCoat bounce, Snatch,
 *  LightningRod redirect, Protect.
 *
 *  Notre version happy path :
 *    - Check attacker.hp == 0 → set MOVE_RESULT_MISSED + bail
 *    - Check pp == 0 (sauf MOVE_STRUGGLE et NO_PPDEDUCT) → bail
 *    - Set HITMARKER_OBEYS (= 1:1 décomp set quand on passe les checks)
 *    - Advance (= happy path : no protect/snatch/etc.)
 *
 *  Skip pour now : MagicCoat, Snatch, LightningRod, Protect, Disobedience —
 *  TODO porter quand gProtectStructs / gSpecialStatuses / IsMonDisobedient
 *  sont implémentés. */
function Cmd_attackcanceler(_ctx: BattleScriptContext): boolean {
  // gBattleOutcome != 0 → finish (= TODO via gCurrentActionFuncId, skip pour now).
  // if (gBattleOutcome) return; — skip

  // attacker.hp == 0 (= died before its turn, e.g. Destiny Bond).
  if (gBattleMons[gBattlerAttacker].hp === 0
      && !(gHitMarker & HITMARKER_NO_ATTACKSTRING_AC)) {
    setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
    // Décomp : gBattlescriptCurrInstr = BattleScript_MoveEnd (= jump).
    // Pour MVP : juste set le flag missed et continue.
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED_AC);
    return false;
  }

  // PP check.
  const attackerMon = gBattleMons[gBattlerAttacker];
  const MOVE_STRUGGLE_AC = 165;
  if (!attackerMon.pp[gCurrMovePos]
      && gCurrentMove !== MOVE_STRUGGLE_AC
      && !(gHitMarker & HITMARKER_NO_ATTACKSTRING_AC)
      && !(attackerMon.status2 & (1 << 21) /* STATUS2_MULTIPLETURNS */)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED_AC);
    return false;
  }

  // Clear HITMARKER_ALLOW_NO_PP (= 0x10000), set OBEYS.
  setHitMarker((gHitMarker & ~(1 << 16)) | HITMARKER_OBEYS);

  // TODO : MagicCoat, Snatch, LightningRod, Protect, Disobedience.

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
  // Niveau 1 COMPLET — 11/11 opcodes installed.
  // Notes :
  //   - attackcanceler : happy path (= skip MagicCoat/Snatch/LightningRod/Protect/Disobedience)
  //   - healthbarupdate : stub (= no UI animation, just advance — datahpupdate fait le HP write)
  //   - moveend : stub (= skip toutes sub-states, exit immédiat)
  // Ces 3 derniers seront upgrade fully 1:1 quand gProtectStructs / gSpecialStatuses /
  // ItemBattleEffects / AbilityBattleEffects sont portés (= post-Niveau 1).
  void setHitMarker;
  console.log('[battle/cmd-niveau-1] installed 11/11 Niveau 1 handlers');
}

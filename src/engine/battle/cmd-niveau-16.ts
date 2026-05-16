/**
 * battle/cmd-niveau-16.ts — Phase 1 Niveau 16 (damage calcs spéciaux) — 9 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x94 damagetohalftargethp        (1 byte — gBattleMoveDamage = target.hp/2)
 *   0xA1 counterdamagecalculator     (5 bytes — Counter ×2 physicalDmg)
 *   0xA2 mirrorcoatdamagecalculator  (5 bytes — Mirror Coat ×2 specialDmg)
 *   0xAC remaininghptopower          (1 byte — Flail/Reversal hp-based power)
 *   0xB3 rolloutdamagecalculation    (1 byte — Rollout ×2 per turn)
 *   0xB5 furycuttercalc              (1 byte — Fury Cutter ×2 per consec hit)
 *   0xB7 presentdamagecalculation    (1 byte — Random 40/80/120/heal)
 *   0xB9 magnitudedamagecalculation  (1 byte — Random magnitude 4..10)
 *   0xDD weightdamagecalculation     (1 byte — Low Kick weight-based power)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:749 sFlailHpScaleToPowerTable`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:774 sWeightToDamageTable`
 *   - `decomps/pokeemeraude/src/battle_util.c:864 CancelMultiTurnMoves`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random, getBattleScriptOffset } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage, setDynamicBasePower,
  gMoveResultFlags, setMoveResultFlags,
  gCurrentMove, gProtectStructs, gSpecialStatuses,
  gSideTimers, gDisableStructs, gLockedMoves,
  gBattlersCount, gAbsentBattlerFlags,
  gBattleMons as _gBattleMons,  // alias pour les loops
} from './state';
import {
  MOVE_RESULT_NO_EFFECT, MOVE_RESULT_DOESNT_AFFECT_FOE,
  STATUS2_MULTIPLETURNS, STATUS2_DEFENSE_CURL,
  GET_BATTLER_SIDE, IGNORE_SHELL_BELL,
} from './constants';
import { CancelMultiTurnMoves, GetScaledHPFraction } from './util';
import { gBitTable } from './battle-controllers';
import { getBattleMove } from './data/battle-moves';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_16,
  PREPARE_BYTE_NUMBER_BUFFER,
} from './text-buffers';

// ─── 1:1 décomp tables (battle_script_commands.c:749, 774) ─────────────────

/** 1:1 décomp `sFlailHpScaleToPowerTable[]` (battle_script_commands.c:749).
 *  Format : [hpFractionMax, power] paires. */
const sFlailHpScaleToPowerTable: number[] = [
  1, 200,
  4, 150,
  9, 100,
  16, 80,
  32, 40,
  48, 20,
];

/** 1:1 décomp `sWeightToDamageTable[]` (battle_script_commands.c:774).
 *  Format : [minWeightHectograms, basePower] paires + sentinel 0xFFFF. */
const sWeightToDamageTable: number[] = [
  100, 20,
  250, 40,
  500, 60,
  1000, 80,
  2000, 100,
  0xFFFF, 0xFFFF,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `GetPokedexHeightWeight(natDexNum, idx)` (= field helper).
 *  Pour MVP, on retourne 0 (= petits poids, gDynamicBasePower=20). Pas porté
 *  car ce sont les weights officiels Pokedex (= data côté field, pas battle). */
function _getPokedexWeight(_species: number): number {
  // TODO porter table gBaseStats[].height + sIndoorTrainerBattleResultFlags
  // ou gPokedexDataPtr->weights. Pour l'instant retourne 0 = défaut petit
  // pokemon (= Low Kick deals minimum power).
  return 0;
}

// ─── 0x94 damagetohalftargethp ────────────────────────────────────────────

/** 1:1 décomp Cmd_damagetohalftargethp. 1 byte.
 *  Super Fang : damage = target.hp / 2 (min 1). */
function Cmd_damagetohalftargethp(_ctx: BattleScriptContext): boolean {
  let dmg = Math.floor(gBattleMons[gBattlerTarget].hp / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xA1 counterdamagecalculator ─────────────────────────────────────────

/** 1:1 décomp Cmd_counterdamagecalculator. 5 bytes. */
function Cmd_counterdamagecalculator(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(ps.physicalBattlerId);

  if (ps.physicalDmg
      && sideAttacker !== sideTarget
      && gBattleMons[ps.physicalBattlerId].hp) {
    setBattleMoveDamage(ps.physicalDmg * 2);
    if (gSideTimers[sideTarget].followmeTimer
        && gBattleMons[gSideTimers[sideTarget].followmeTarget].hp) {
      setBattlerTarget(gSideTimers[sideTarget].followmeTarget);
    } else {
      setBattlerTarget(ps.physicalBattlerId);
    }
    return false;
  }
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xA2 mirrorcoatdamagecalculator ──────────────────────────────────────

/** 1:1 décomp Cmd_mirrorcoatdamagecalculator. 5 bytes. */
function Cmd_mirrorcoatdamagecalculator(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(ps.specialBattlerId);

  if (ps.specialDmg
      && sideAttacker !== sideTarget
      && gBattleMons[ps.specialBattlerId].hp) {
    setBattleMoveDamage(ps.specialDmg * 2);
    if (gSideTimers[sideTarget].followmeTimer
        && gBattleMons[gSideTimers[sideTarget].followmeTarget].hp) {
      setBattlerTarget(gSideTimers[sideTarget].followmeTarget);
    } else {
      setBattlerTarget(ps.specialBattlerId);
    }
    return false;
  }
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xAC remaininghptopower ──────────────────────────────────────────────

/** 1:1 décomp Cmd_remaininghptopower. 1 byte. Flail / Reversal damage. */
function Cmd_remaininghptopower(_ctx: BattleScriptContext): boolean {
  const hpFraction = GetScaledHPFraction(
    gBattleMons[gBattlerAttacker].hp,
    gBattleMons[gBattlerAttacker].maxHP,
    48,
  );
  let i = 0;
  for (i = 0; i < sFlailHpScaleToPowerTable.length; i += 2) {
    if (hpFraction <= sFlailHpScaleToPowerTable[i]) break;
  }
  // 1:1 décomp : table parcourue par pas de 2 ; power à [i+1].
  setDynamicBasePower(sFlailHpScaleToPowerTable[i + 1]);
  return false;
}

// ─── 0xB3 rolloutdamagecalculation ────────────────────────────────────────

/** 1:1 décomp Cmd_rolloutdamagecalculation. 1 byte. */
function Cmd_rolloutdamagecalculation(ctx: BattleScriptContext): boolean {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    CancelMultiTurnMoves(gBattlerAttacker);
    const off = getBattleScriptOffset('BattleScript_MoveMissedPause');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS)) {
    gDisableStructs[gBattlerAttacker].rolloutTimer = 5;
    gDisableStructs[gBattlerAttacker].rolloutTimerStartValue = 5;
    gBattleMons[gBattlerAttacker].status2 |= STATUS2_MULTIPLETURNS;
    gLockedMoves[gBattlerAttacker] = gCurrentMove;
  }
  gDisableStructs[gBattlerAttacker].rolloutTimer--;
  if (gDisableStructs[gBattlerAttacker].rolloutTimer === 0) {
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_MULTIPLETURNS;
  }
  let power = getBattleMove(gCurrentMove).power;
  // 1:1 décomp : i loop de 1 à (5 - rolloutTimer)-1, double power chaque iter.
  const iters = 5 - gDisableStructs[gBattlerAttacker].rolloutTimer;
  for (let i = 1; i < iters; i++) {
    power *= 2;
  }
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_DEFENSE_CURL) {
    power *= 2;
  }
  setDynamicBasePower(power);
  return false;
}

// ─── 0xB5 furycuttercalc ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_furycuttercalc. 1 byte. */
function Cmd_furycuttercalc(ctx: BattleScriptContext): boolean {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    gDisableStructs[gBattlerAttacker].furyCutterCounter = 0;
    const off = getBattleScriptOffset('BattleScript_MoveMissedPause');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (gDisableStructs[gBattlerAttacker].furyCutterCounter !== 5) {
    gDisableStructs[gBattlerAttacker].furyCutterCounter++;
  }
  let power = getBattleMove(gCurrentMove).power;
  for (let i = 1; i < gDisableStructs[gBattlerAttacker].furyCutterCounter; i++) {
    power *= 2;
  }
  setDynamicBasePower(power);
  return false;
}

// ─── 0xB7 presentdamagecalculation ────────────────────────────────────────

/** 1:1 décomp Cmd_presentdamagecalculation. 1 byte. */
function Cmd_presentdamagecalculation(ctx: BattleScriptContext): boolean {
  const rand = Random() & 0xFF;
  if (rand < 102) {
    setDynamicBasePower(40);
  } else if (rand < 178) {
    setDynamicBasePower(80);
  } else if (rand < 204) {
    setDynamicBasePower(120);
  } else {
    let heal = Math.floor(gBattleMons[gBattlerTarget].maxHP / 4);
    if (heal === 0) heal = 1;
    setBattleMoveDamage(-heal);
  }

  if (rand < 204) {
    const off = getBattleScriptOffset('BattleScript_HitFromCritCalc');
    if (off >= 0) ctx.scriptPtr = off;
  } else if (gBattleMons[gBattlerTarget].maxHP === gBattleMons[gBattlerTarget].hp) {
    const off = getBattleScriptOffset('BattleScript_AlreadyAtFullHp');
    if (off >= 0) ctx.scriptPtr = off;
  } else {
    setMoveResultFlags(gMoveResultFlags & ~MOVE_RESULT_DOESNT_AFFECT_FOE);
    const off = getBattleScriptOffset('BattleScript_PresentHealTarget');
    if (off >= 0) ctx.scriptPtr = off;
  }
  return false;
}

// ─── 0xB9 magnitudedamagecalculation ──────────────────────────────────────

/** 1:1 décomp Cmd_magnitudedamagecalculation. 1 byte. */
function Cmd_magnitudedamagecalculation(_ctx: BattleScriptContext): boolean {
  let magnitude = Random() % 100;
  if (magnitude < 5) {
    setDynamicBasePower(10);
    magnitude = 4;
  } else if (magnitude < 15) {
    setDynamicBasePower(30);
    magnitude = 5;
  } else if (magnitude < 35) {
    setDynamicBasePower(50);
    magnitude = 6;
  } else if (magnitude < 65) {
    setDynamicBasePower(70);
    magnitude = 7;
  } else if (magnitude < 85) {
    setDynamicBasePower(90);
    magnitude = 8;
  } else if (magnitude < 95) {
    setDynamicBasePower(110);
    magnitude = 9;
  } else {
    setDynamicBasePower(150);
    magnitude = 10;
  }
  // 1:1 décomp battle_script_commands.c : `PREPARE_BYTE_NUMBER_BUFFER(gBattleTextBuff1, 2, magnitude)`.
  PREPARE_BYTE_NUMBER_BUFFER(_gBattleTextBuff1_16, 2, magnitude);

  // 1:1 décomp : foreach battler, skip self, break si non-absent (= pick first).
  let target = 0;
  for (target = 0; target < gBattlersCount; target++) {
    if (target === gBattlerAttacker) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  return false;
}

// ─── 0xDD weightdamagecalculation ─────────────────────────────────────────

/** 1:1 décomp Cmd_weightdamagecalculation. 1 byte. Low Kick / Grass Knot. */
function Cmd_weightdamagecalculation(_ctx: BattleScriptContext): boolean {
  const weight = _getPokedexWeight(gBattleMons[gBattlerTarget].species);
  let i = 0;
  // 1:1 décomp : iter pairs jusqu'à trouver weight > min ou hit sentinel 0xFFFF.
  for (i = 0; sWeightToDamageTable[i] !== 0xFFFF; i += 2) {
    if (sWeightToDamageTable[i] > weight) break;
  }
  if (sWeightToDamageTable[i] !== 0xFFFF) {
    setDynamicBasePower(sWeightToDamageTable[i + 1]);
  } else {
    setDynamicBasePower(120);
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau16Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x94] = Cmd_damagetohalftargethp;
  commands[0xA1] = Cmd_counterdamagecalculator;
  commands[0xA2] = Cmd_mirrorcoatdamagecalculator;
  commands[0xAC] = Cmd_remaininghptopower;
  commands[0xB3] = Cmd_rolloutdamagecalculation;
  commands[0xB5] = Cmd_furycuttercalc;
  commands[0xB7] = Cmd_presentdamagecalculation;
  commands[0xB9] = Cmd_magnitudedamagecalculation;
  commands[0xDD] = Cmd_weightdamagecalculation;
}

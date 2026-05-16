/**
 * battle/cmd-niveau-2.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Niveau 2 (stat stages + status)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus :
 *   0x16 Cmd_seteffectprimary             FULL (wired SetMoveEffect via batch 136)
 *   0x17 Cmd_seteffectsecondary           FULL (wired SetMoveEffect via batch 136)
 *   0x18 Cmd_clearstatusfromeffect        FULL
 *   0x47 Cmd_setgraphicalstatchangevalues FULL
 *   0x48 Cmd_playstatchangeanimation      anim emit (= UI Phase 1.4)
 *   0x89 Cmd_statbuffchange               FULL (= wraps ChangeStatBuffs)
 *   0x8A Cmd_normalisebuffs               FULL (= Haze, reset all stat stages)
 *   0x98 Cmd_updatestatusicon             status icon emit (= UI Phase 1.4)
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattleScripting,
  gBattleCommunication,
  gBattlersCount,
  gBattleControllerExecFlags,
  gBattleTypeFlags,
  gSideTimers,
  gAbsentBattlerFlags,
  setActiveBattler,
} from './state';
import { readByte, readWord } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';
import { ChangeStatBuffs } from './stat-stages';
import { SetMoveEffect } from './set-move-effect';
import {
  GET_STAT_BUFF_ID,
  GET_STAT_BUFF_VALUE,
  SET_STAT_BUFF_VALUE,
  STAT_BUFF_NEGATIVE,
  STAT_CHANGE_WORKED,
  STAT_CHANGE_ALLOW_PTR,
  MOVE_EFFECT_BYTE,
  MULTISTRING_CHOOSER,
  NUM_BATTLE_STATS,
  DEFAULT_STAT_STAGE,
  MIN_STAT_STAGE,
  MAX_STAT_STAGE,
  STAT_ATK,
  STAT_ACC,
  ABILITY_CLEAR_BODY,
  ABILITY_WHITE_SMOKE,
  ABILITY_KEEN_EYE,
  ABILITY_HYPER_CUTTER,
  BS_ATTACKER,
  BS_ATTACKER_WITH_PARTNER,
  BATTLE_TYPE_DOUBLE,
  GET_BATTLER_SIDE,
  B_COMM_TO_CONTROLLER,
} from './constants';
import {
  MarkBattlerForControllerExec, gBitTable,
  BtlController_EmitStatusIconUpdate,
  BtlController_EmitBattleAnimation,
} from './battle-controllers';
import { getBattlerForBattleScript } from './util';

// 1:1 décomp `include/battle_anim.h:195-202` STAT_ANIM_* — verified values.
const STAT_ANIM_PLUS1            = 14;
const STAT_ANIM_PLUS2            = 38;
const STAT_ANIM_MINUS1           = 21;
const STAT_ANIM_MINUS2           = 45;
const STAT_ANIM_MULTIPLE_PLUS1   = 55;
const STAT_ANIM_MULTIPLE_PLUS2   = 56;
const STAT_ANIM_MULTIPLE_MINUS1  = 57;
const STAT_ANIM_MULTIPLE_MINUS2  = 58;

// Stat anim flags (= include/constants/battle_script_commands.h:375-378).
const STAT_CHANGE_NEGATIVE        = 1 << 0;
const STAT_CHANGE_BY_TWO          = 1 << 1;
const STAT_CHANGE_MULTIPLE_STATS  = 1 << 2;
const STAT_CHANGE_CANT_PREVENT    = 1 << 3;

// B_ANIM_* (battle_anim.h) — used by playstatchangeanimation Emit call.
const B_ANIM_STATS_CHANGE = 0;

// MOVE_EFFECT_* indices (battle.h:245-298) — pour la status flags table.
const MOVE_EFFECT_SLEEP          = 1;
const MOVE_EFFECT_POISON         = 2;
const MOVE_EFFECT_BURN           = 3;
const MOVE_EFFECT_FREEZE         = 4;
const MOVE_EFFECT_PARALYSIS      = 5;
const MOVE_EFFECT_TOXIC          = 6;
const MOVE_EFFECT_CONFUSION      = 7;
const MOVE_EFFECT_FLINCH         = 8;
const MOVE_EFFECT_UPROAR         = 10;
const MOVE_EFFECT_CHARGING       = 12;
const MOVE_EFFECT_WRAP           = 13;
const MOVE_EFFECT_RECHARGE       = 29;
const MOVE_EFFECT_PREVENT_ESCAPE = 32;
const MOVE_EFFECT_NIGHTMARE      = 33;
const MOVE_EFFECT_THRASH         = 53;

// 1:1 décomp `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]` (battle_script_commands.c:608-625).
// Partial table mais 1:1 décomp pour les 15 entries définies.
const _statusFlagsForMoveEffects: Record<number, number> = {
  [MOVE_EFFECT_SLEEP]:          0x7,         // STATUS1_SLEEP
  [MOVE_EFFECT_POISON]:         1 << 3,      // STATUS1_POISON
  [MOVE_EFFECT_BURN]:           1 << 4,      // STATUS1_BURN
  [MOVE_EFFECT_FREEZE]:         1 << 5,      // STATUS1_FREEZE
  [MOVE_EFFECT_PARALYSIS]:      1 << 6,      // STATUS1_PARALYSIS
  [MOVE_EFFECT_TOXIC]:          1 << 7,      // STATUS1_TOXIC_POISON
  [MOVE_EFFECT_CONFUSION]:      0x7,         // STATUS2_CONFUSION
  [MOVE_EFFECT_FLINCH]:         1 << 3,      // STATUS2_FLINCHED
  [MOVE_EFFECT_UPROAR]:         0x70,        // STATUS2_UPROAR
  [MOVE_EFFECT_CHARGING]:       1 << 12,     // STATUS2_MULTIPLETURNS
  [MOVE_EFFECT_WRAP]:           0xE000,      // STATUS2_WRAPPED
  [MOVE_EFFECT_RECHARGE]:       1 << 22,     // STATUS2_RECHARGE
  [MOVE_EFFECT_PREVENT_ESCAPE]: 1 << 26,     // STATUS2_ESCAPE_PREVENTION
  [MOVE_EFFECT_NIGHTMARE]:      1 << 27,     // STATUS2_NIGHTMARE
  [MOVE_EFFECT_THRASH]:         0xC00,       // STATUS2_LOCK_CONFUSE
};

// 1:1 décomp `PRIMARY_STATUS_MOVE_EFFECT` (battle.h:251) = MOVE_EFFECT_TOXIC = 6.
const PRIMARY_STATUS_MOVE_EFFECT = MOVE_EFFECT_TOXIC;

/** Stay sur opcode (= waitstate). Voir cmd-niveau-4 pour convention. */
function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `gAbsentBattlerFlags` — wired depuis state.ts (= bitmask absent battlers).

// ─── Cmd_statbuffchange (0x89) ──────────────────────────────────────────────

/** 1:1 décomp `Cmd_statbuffchange` (battle_script_commands.c:7103-7108).
 *
 *  Args : 1 byte flags + 4 byte jumpPtr. Total 6 bytes (opcode + 5).
 *
 *  Wraps `ChangeStatBuffs(gBattleScripting.statChanger & 0xF0, statId, flags, jumpPtr)`.
 *  Si SUCCESS → advance via consume args. Si FAIL → ChangeStatBuffs déjà advancé
 *  le scriptPtr (= push BS_ptr), donc on n'advance pas via readByte ici.
 *
 *  Notre version : toujours consume args (= pas de push BS_ptr support encore). */
function Cmd_statbuffchange(ctx: BattleScriptContext): boolean {
  const flags = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const result = ChangeStatBuffs(
    gBattleScripting.statChanger & 0xF0,         // statValue (= magnitude + sign bit)
    GET_STAT_BUFF_ID(gBattleScripting.statChanger),  // statId
    flags,
    jumpPtr,
  );

  // Décomp : `if (result == STAT_CHANGE_WORKED) gBattlescriptCurrInstr += 6`.
  // Si DIDNT_WORK avec ALLOW_PTR : BS_ptr a été push (= ctx.scriptPtr changed).
  // Notre version : on a déjà advancé via readByte+readWord, donc 6 bytes consumés.
  // Si on devait jump à BS_ptr, on le ferait ici (= TODO push/pop stack).
  if (result !== STAT_CHANGE_WORKED && (flags & STAT_CHANGE_ALLOW_PTR)) {
    // 1:1 décomp aurait set gBattlescriptCurrInstr = BS_ptr (= jump).
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_normalisebuffs (0x8A) — Haze ───────────────────────────────────────

/** 1:1 décomp `Cmd_normalisebuffs` (battle_script_commands.c:7111-7122).
 *  Reset all stat stages of all battlers to DEFAULT_STAT_STAGE (= Haze move). */
function Cmd_normalisebuffs(_ctx: BattleScriptContext): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    for (let j = 0; j < NUM_BATTLE_STATS; j++) {
      gBattleMons[i].statStages[j] = DEFAULT_STAT_STAGE;
    }
  }
  return false;
}

// ─── Cmd_setgraphicalstatchangevalues (0x47) ────────────────────────────────

/** 1:1 décomp `Cmd_setgraphicalstatchangevalues` (battle_script_commands.c:4091-4112).
 *
 *  Set gBattleScripting.animArg1 (= stat anim id) basé sur statChanger value.
 *  animArg2 = 0. */
function Cmd_setgraphicalstatchangevalues(_ctx: BattleScriptContext): boolean {
  let value = 0;
  const statChanger = gBattleScripting.statChanger;
  // GET_STAT_BUFF_VALUE2(n) = n & 0xF0 (= bits 4-7 = magnitude with sign).
  const valueMag = statChanger & 0xF0;

  if (valueMag === SET_STAT_BUFF_VALUE(1)) value = STAT_ANIM_PLUS1 + 1;
  else if (valueMag === SET_STAT_BUFF_VALUE(2)) value = STAT_ANIM_PLUS2 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(1) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS1 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(2) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS2 + 1;

  gBattleScripting.animArg1 = GET_STAT_BUFF_ID(statChanger) + value - 1;
  gBattleScripting.animArg2 = 0;
  return false;
}

// ─── Cmd_playstatchangeanimation (0x48) ─────────────────────────────────────

/** 1:1 décomp `Cmd_playstatchangeanimation` (battle_script_commands.c:4114-4210).
 *
 *  Args : 1 byte battler ref + 1 byte statsToCheck mask + 1 byte flags.
 *  Total 4 bytes.
 *
 *  Logique :
 *  - Pour chaque bit set dans statsToCheck (stat index 0..7 = HP..EVASION) :
 *    - Si negative + CANT_PREVENT : skip ability/mist guards, just check
 *      statStages[i] > MIN_STAT_STAGE → set anim id + count++.
 *    - Si negative sans CANT_PREVENT : skip aussi si mistTimer ou ability
 *      CLEAR_BODY/WHITE_SMOKE (or KEEN_EYE for ACC, HYPER_CUTTER for ATK) →
 *      statStages > MIN → anim + count++.
 *    - Si positive : statStages < MAX → anim + count++.
 *  - Si MULTIPLE_STATS + countOnly1 → skip anim (= will play single via separate).
 *  - Sinon si count > 0 + !statAnimPlayed → emit B_ANIM_STATS_CHANGE + Mark.
 *  - Advance +4 byte total. */
function Cmd_playstatchangeanimation(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  let statsToCheck = readByte(ctx);
  const flags = readByte(ctx);

  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);

  let currStat = 0;
  let statAnimId = 0;
  let changeableStatsCount = 0;

  if (flags & STAT_CHANGE_NEGATIVE) {
    const startingStatAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MINUS2 : STAT_ANIM_MINUS1;

    while (statsToCheck !== 0) {
      if (statsToCheck & 1) {
        if (flags & STAT_CHANGE_CANT_PREVENT) {
          if (gBattleMons[activeBattler].statStages[currStat] > MIN_STAT_STAGE) {
            statAnimId = startingStatAnimId + currStat;
            changeableStatsCount++;
          }
        } else if (
          !gSideTimers[GET_BATTLER_SIDE(activeBattler)].mistTimer
          && gBattleMons[activeBattler].ability !== ABILITY_CLEAR_BODY
          && gBattleMons[activeBattler].ability !== ABILITY_WHITE_SMOKE
          && !(gBattleMons[activeBattler].ability === ABILITY_KEEN_EYE && currStat === STAT_ACC)
          && !(gBattleMons[activeBattler].ability === ABILITY_HYPER_CUTTER && currStat === STAT_ATK)
        ) {
          if (gBattleMons[activeBattler].statStages[currStat] > MIN_STAT_STAGE) {
            statAnimId = startingStatAnimId + currStat;
            changeableStatsCount++;
          }
        }
      }
      statsToCheck >>= 1;
      currStat++;
    }

    if (changeableStatsCount > 1) {
      statAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MULTIPLE_MINUS2 : STAT_ANIM_MULTIPLE_MINUS1;
    }
  } else {
    const startingStatAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_PLUS2 : STAT_ANIM_PLUS1;

    while (statsToCheck !== 0) {
      if ((statsToCheck & 1) && gBattleMons[activeBattler].statStages[currStat] < MAX_STAT_STAGE) {
        statAnimId = startingStatAnimId + currStat;
        changeableStatsCount++;
      }
      statsToCheck >>= 1;
      currStat++;
    }

    if (changeableStatsCount > 1) {
      statAnimId = (flags & STAT_CHANGE_BY_TWO) ? STAT_ANIM_MULTIPLE_PLUS2 : STAT_ANIM_MULTIPLE_PLUS1;
    }
  }

  if ((flags & STAT_CHANGE_MULTIPLE_STATS) && changeableStatsCount < 2) {
    // Skip anim emit (= will play singles separately).
  } else if (changeableStatsCount !== 0 && !gBattleScripting.statAnimPlayed) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, B_ANIM_STATS_CHANGE, statAnimId);
    MarkBattlerForControllerExec(activeBattler);
    if ((flags & STAT_CHANGE_MULTIPLE_STATS) && changeableStatsCount > 1) {
      gBattleScripting.statAnimPlayed = 1;
    }
  }
  return false;
}

// ─── Cmd_seteffectprimary (0x16) + Cmd_seteffectsecondary (0x17) ────────────

/** 1:1 décomp `Cmd_seteffectprimary` (battle_script_commands.c:2941-2944).
 *  Calls `SetMoveEffect(TRUE, 0)`. */
function Cmd_seteffectprimary(ctx: BattleScriptContext): boolean {
  SetMoveEffect(ctx, true, 0);
  return false;
}

/** 1:1 décomp `Cmd_seteffectsecondary` (battle_script_commands.c:2946-2949).
 *  Calls `SetMoveEffect(FALSE, 0)`. */
function Cmd_seteffectsecondary(ctx: BattleScriptContext): boolean {
  SetMoveEffect(ctx, false, 0);
  return false;
}

// ─── Cmd_clearstatusfromeffect (0x18) ───────────────────────────────────────

/** 1:1 décomp `Cmd_clearstatusfromeffect` (battle_script_commands.c:2951-2963).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *
 *  Clear le status flag correspondant au current move effect (= MOVE_EFFECT_BYTE)
 *  depuis status1 si <= PRIMARY_STATUS_MOVE_EFFECT, sinon status2.
 *  Reset MOVE_EFFECT_BYTE + multihitMoveEffect. */
function Cmd_clearstatusfromeffect(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);

  const moveEffect = gBattleCommunication[MOVE_EFFECT_BYTE];
  const statusFlag = _statusFlagsForMoveEffects[moveEffect] ?? 0;

  if (moveEffect <= PRIMARY_STATUS_MOVE_EFFECT) {
    gBattleMons[activeBattler].status1 &= ~statusFlag;
  } else {
    gBattleMons[activeBattler].status2 &= ~statusFlag;
  }

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── Cmd_updatestatusicon (0x98) ────────────────────────────────────────────

/** 1:1 décomp `Cmd_updatestatusicon` (battle_script_commands.c:7702-7733).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *  - if exec → stay.
 *  - if arg != BS_ATTACKER_WITH_PARTNER : single battler emit.
 *  - else : emit pour attacker (= si pas absent), puis si DOUBLE emit pour
 *    partner (= si pas absent). */
function Cmd_updatestatusicon(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  const battlerArg = readByte(ctx);

  if (battlerArg !== BS_ATTACKER_WITH_PARTNER) {
    const activeBattler = getBattlerForBattleScript(battlerArg);
    setActiveBattler(activeBattler);
    BtlController_EmitStatusIconUpdate(
      B_COMM_TO_CONTROLLER,
      gBattleMons[activeBattler].status1,
      gBattleMons[activeBattler].status2,
    );
    MarkBattlerForControllerExec(activeBattler);
  } else {
    setActiveBattler(gBattlerAttacker);
    if (!(gAbsentBattlerFlags & gBitTable[gBattlerAttacker])) {
      BtlController_EmitStatusIconUpdate(
        B_COMM_TO_CONTROLLER,
        gBattleMons[gBattlerAttacker].status1,
        gBattleMons[gBattlerAttacker].status2,
      );
      MarkBattlerForControllerExec(gBattlerAttacker);
    }
    if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      // 1:1 décomp : partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(attacker))).
      // Pour single battle MVP, skip (= jamais DOUBLE en MVP).
      // TODO porter quand doubles supportés : GetBattlerAtPosition + BATTLE_PARTNER macro.
    }
  }
  return false;
}

void MULTISTRING_CHOOSER;
void GET_STAT_BUFF_VALUE;
void STAT_CHANGE_CANT_PREVENT;
void STAT_CHANGE_MULTIPLE_STATS;

// ─── Install handlers ───────────────────────────────────────────────────────

export function installNiveau2Handlers(commandsTable: BattleOpcodeHandler[]): void {
  commandsTable[0x16] = Cmd_seteffectprimary;
  commandsTable[0x17] = Cmd_seteffectsecondary;
  commandsTable[0x18] = Cmd_clearstatusfromeffect;
  commandsTable[0x47] = Cmd_setgraphicalstatchangevalues;
  commandsTable[0x48] = Cmd_playstatchangeanimation;
  commandsTable[0x89] = Cmd_statbuffchange;
  commandsTable[0x8A] = Cmd_normalisebuffs;
  commandsTable[0x98] = Cmd_updatestatusicon;
  console.log('[battle/cmd-niveau-2] installed 8/8 Niveau 2 handlers (stat stages + status)');
}

/**
 * battle/cmd-niveau-9.ts — Phase 1 Niveau 9 (status-set opcodes) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x7F setseeded             (1 byte — set LeechSeed if not Grass/already seeded)
 *   0x9A setfocusenergy        (1 byte — set STATUS2_FOCUS_ENERGY, fail si set)
 *   0xA7 setalwayshitflag      (1 byte — set STATUS3_ALWAYS_HITS_TURN(2))
 *   0xAA setdestinybond        (1 byte — set STATUS2_DESTINY_BOND)
 *   0xAF cursetarget           (5 bytes — set STATUS2_CURSED, set damage maxHP/2)
 *   0xB1 setforesight          (1 byte — set STATUS2_FORESIGHT on target)
 *   0xBF setdefensecurlbit     (1 byte — set STATUS2_DEFENSE_CURL)
 *   0xC7 setminimize           (1 byte — set STATUS3_MINIMIZED si OBEYS)
 *   0xCD cureifburnedparalyzedorpoisoned (5 bytes — clear status1 + emit data)
 *   0xCE settorment            (5 bytes — set STATUS2_TORMENT)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle.h:161` (STATUS3_ALWAYS_HITS_TURN)
 *   - `decomps/pokeemeraude/include/constants/battle_string_ids.h` (B_MSG_*)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  gStatuses3, gDisableStructs, gMoveResultFlags, setMoveResultFlags,
  gBattleCommunication, setBattleMoveDamage,
  gHitMarker, setActiveBattler,
} from './state';
import {
  STATUS1_POISON, STATUS1_BURN, STATUS1_PARALYSIS, STATUS1_TOXIC_POISON,
  STATUS2_FOCUS_ENERGY, STATUS2_DESTINY_BOND, STATUS2_CURSED,
  STATUS2_DEFENSE_CURL, STATUS2_TORMENT, STATUS2_FORESIGHT,
  STATUS3_LEECHSEED, STATUS3_ALWAYS_HITS, STATUS3_MINIMIZED,
  STATUS3_ALWAYS_HITS_TURN,
  MOVE_RESULT_FAILED, MOVE_RESULT_MISSED, MOVE_RESULT_NO_EFFECT,
  MULTISTRING_CHOOSER,
  B_MSG_FOCUS_ENERGY_FAILED, B_MSG_GETTING_PUMPED,
  B_MSG_LEECH_SEED_SET, B_MSG_LEECH_SEED_MISS, B_MSG_LEECH_SEED_FAIL,
  HITMARKER_OBEYS,
  TYPE_GRASS, REQUEST_STATUS_BATTLE,
  IS_BATTLER_OF_TYPE,
} from './constants';
import { MarkBattlerForControllerExec, BtlController_EmitSetMonData } from './battle-controllers';

// ─── 0x7F setseeded ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setseeded. 1 byte.
 *  Note : décomp `gStatuses3[target] |= gBattlerAttacker` — store l'attacker id
 *  dans STATUS3_LEECHSEED_BATTLER (= bits 0+1, max 4 battlers). On reproduit. */
function Cmd_setseeded(_ctx: BattleScriptContext): boolean {
  if ((gMoveResultFlags & MOVE_RESULT_NO_EFFECT) || (gStatuses3[gBattlerTarget] & STATUS3_LEECHSEED)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_MISS;
  } else if (IS_BATTLER_OF_TYPE(gBattleMons[gBattlerTarget].type1, gBattleMons[gBattlerTarget].type2, TYPE_GRASS)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_FAIL;
  } else {
    gStatuses3[gBattlerTarget] |= gBattlerAttacker;
    gStatuses3[gBattlerTarget] |= STATUS3_LEECHSEED;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LEECH_SEED_SET;
  }
  return false;
}

// ─── 0x9A setfocusenergy ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setfocusenergy. 1 byte. */
function Cmd_setfocusenergy(_ctx: BattleScriptContext): boolean {
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_FOCUS_ENERGY) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_FOCUS_ENERGY_FAILED;
  } else {
    gBattleMons[gBattlerAttacker].status2 |= STATUS2_FOCUS_ENERGY;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_GETTING_PUMPED;
  }
  return false;
}

// ─── 0xA7 setalwayshitflag ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setalwayshitflag. 1 byte. */
function Cmd_setalwayshitflag(_ctx: BattleScriptContext): boolean {
  gStatuses3[gBattlerTarget] &= ~STATUS3_ALWAYS_HITS;
  gStatuses3[gBattlerTarget] |= STATUS3_ALWAYS_HITS_TURN(2);
  gDisableStructs[gBattlerTarget].battlerWithSureHit = gBattlerAttacker;
  return false;
}

// ─── 0xAA setdestinybond ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setdestinybond. 1 byte. */
function Cmd_setdestinybond(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_DESTINY_BOND;
  return false;
}

// ─── 0xAF cursetarget ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_cursetarget. 5 bytes (u32 ptr pour le fail-jump). */
function Cmd_cursetarget(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_CURSED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gBattleMons[gBattlerTarget].status2 |= STATUS2_CURSED;
  let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);
  return false;
}

// ─── 0xB1 setforesight ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setforesight. 1 byte. */
function Cmd_setforesight(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerTarget].status2 |= STATUS2_FORESIGHT;
  return false;
}

// ─── 0xBF setdefensecurlbit ────────────────────────────────────────────────

/** 1:1 décomp Cmd_setdefensecurlbit. 1 byte. */
function Cmd_setdefensecurlbit(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_DEFENSE_CURL;
  return false;
}

// ─── 0xC7 setminimize ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setminimize. 1 byte. */
function Cmd_setminimize(_ctx: BattleScriptContext): boolean {
  if (gHitMarker & HITMARKER_OBEYS) {
    gStatuses3[gBattlerAttacker] |= STATUS3_MINIMIZED;
  }
  return false;
}

// ─── 0xCD cureifburnedparalyzedorpoisoned ──────────────────────────────────

/** 1:1 décomp Cmd_cureifburnedparalyzedorpoisoned. 5 bytes (u32 ptr fail). */
function Cmd_cureifburnedparalyzedorpoisoned(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const status = gBattleMons[gBattlerAttacker].status1;
  const targetMask = STATUS1_POISON | STATUS1_BURN | STATUS1_PARALYSIS | STATUS1_TOXIC_POISON;
  if (status & targetMask) {
    gBattleMons[gBattlerAttacker].status1 = 0;
    setActiveBattler(gBattlerAttacker);
    _emitSetMonData(REQUEST_STATUS_BATTLE);
    MarkBattlerForControllerExec(gBattlerAttacker);
    // Continue (= already advanced past args).
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

/** 1:1 décomp `BtlController_EmitSetMonData(buf, requestId, monIdx, bytes, data)`.
 *  Wired via battle-controllers helper (= no-op MVP côté framework UI mais
 *  signature 1:1 décomp). */
function _emitSetMonData(requestId: number): void {
  BtlController_EmitSetMonData(0 /* B_COMM_TO_CONTROLLER */, requestId, 0, 0, null);
}

// ─── 0xCE settorment ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_settorment. 5 bytes (u32 ptr fail). */
function Cmd_settorment(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_TORMENT) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gBattleMons[gBattlerTarget].status2 |= STATUS2_TORMENT;
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau9Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x7F] = Cmd_setseeded;
  commands[0x9A] = Cmd_setfocusenergy;
  commands[0xA7] = Cmd_setalwayshitflag;
  commands[0xAA] = Cmd_setdestinybond;
  commands[0xAF] = Cmd_cursetarget;
  commands[0xB1] = Cmd_setforesight;
  commands[0xBF] = Cmd_setdefensecurlbit;
  commands[0xC7] = Cmd_setminimize;
  commands[0xCD] = Cmd_cureifburnedparalyzedorpoisoned;
  commands[0xCE] = Cmd_settorment;
}

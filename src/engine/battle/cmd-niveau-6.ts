/**
 * battle/cmd-niveau-6.ts — Phase 1 Niveau 6 (UI/audio misc) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x11 printselectionstring        (3 bytes : opcode + u16 stringId)
 *   0x14 printselectionstringfromtable (5 bytes : opcode + u32 tblPtr)
 *   0x54 playse                       (3 bytes : opcode + u16 songId)
 *   0x55 fanfare                      (3 bytes : opcode + u16 songId)
 *   0x56 playfaintcry                 (2 bytes : opcode + 1 byte battler)
 *   0x5C hitanimation                 (2 bytes : opcode + 1 byte battler)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Note : tous ces opcodes sont des thin wrappers BtlController_Emit*. Pour
 * MVP, on appelle nos stubs locaux + Mark, ce qui set le bit dans gBattle
 * ControllerExecFlags. tickBattleControllers le clear next iteration.
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readHalfword, readWord } from './script-interpreter';
import {
  gBattleControllerExecFlags, gBattlerAttacker,
  gMoveResultFlags, gHitMarker, gBattleMons,
  gDisableStructs, gBattleCommunication,
  setActiveBattler,
} from './state';
import {
  MOVE_RESULT_NO_EFFECT, HITMARKER_IGNORE_SUBSTITUTE, STATUS2_SUBSTITUTE,
  MSG_DISPLAY, MULTISTRING_CHOOSER,
} from './constants';
import {
  MarkBattlerForControllerExec,
  BtlController_EmitPlaySE, BtlController_EmitPlayFanfareOrBGM,
  BtlController_EmitFaintingCry, BtlController_EmitHitAnimation,
  BtlController_EmitPrintSelectionString,
} from './battle-controllers';
import { B_COMM_TO_CONTROLLER } from './constants';
import { getBattlerForBattleScript } from './util';
import { getBattleScriptBytecode } from './script-interpreter';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** Lit u16 little-endian au offset table dans bytecode. */
function _readU16FromBytecode(offset: number): number {
  const bc = getBattleScriptBytecode();
  if (!bc) return 0;
  if (offset < 0 || offset + 1 >= bc.length) return 0;
  return bc[offset] | (bc[offset + 1] << 8);
}

// ─── 0x11 printselectionstring ──────────────────────────────────────────────

/** 1:1 décomp Cmd_printselectionstring. 3 bytes. */
function Cmd_printselectionstring(ctx: BattleScriptContext): boolean {
  // Note : décomp ne guard PAS sur gBattleControllerExecFlags, contrairement à
  // printstring. C'est intentionnel — selection string utilise un slot UI
  // séparé. On suit le décomp 1:1.
  const stringId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPrintSelectionString(B_COMM_TO_CONTROLLER, stringId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x14 printselectionstringfromtable ─────────────────────────────────────

/** 1:1 décomp Cmd_printselectionstringfromtable. 5 bytes. */
function Cmd_printselectionstringfromtable(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  const tableOffset = readWord(ctx);
  const idx = gBattleCommunication[MULTISTRING_CHOOSER];
  const stringId = _readU16FromBytecode(tableOffset + idx * 2);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPrintSelectionString(B_COMM_TO_CONTROLLER, stringId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x54 playse ────────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_playse. 3 bytes. */
function Cmd_playse(ctx: BattleScriptContext): boolean {
  const songId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, songId);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x55 fanfare ───────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_fanfare. 3 bytes. */
function Cmd_fanfare(ctx: BattleScriptContext): boolean {
  const songId = readHalfword(ctx);
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitPlayFanfareOrBGM(B_COMM_TO_CONTROLLER, songId, false);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x56 playfaintcry ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_playfaintcry. 2 bytes. */
function Cmd_playfaintcry(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  BtlController_EmitFaintingCry(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x5C hitanimation ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_hitanimation. 2 bytes. */
function Cmd_hitanimation(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);

  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    // Skip anim, advance done (already done by readByte).
    return false;
  } else if (!(gHitMarker & HITMARKER_IGNORE_SUBSTITUTE) ||
             !(gBattleMons[active].status2 & STATUS2_SUBSTITUTE) ||
             gDisableStructs[active].substituteHP === 0) {
    BtlController_EmitHitAnimation(B_COMM_TO_CONTROLLER);
    MarkBattlerForControllerExec(active);
  }
  // else : skip (= substitute prevented animation).
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau6Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x11] = Cmd_printselectionstring;
  commands[0x14] = Cmd_printselectionstringfromtable;
  commands[0x54] = Cmd_playse;
  commands[0x55] = Cmd_fanfare;
  commands[0x56] = Cmd_playfaintcry;
  commands[0x5C] = Cmd_hitanimation;
}

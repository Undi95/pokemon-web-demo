/**
 * battle/cmd-niveau-4.ts — Phase 1 Niveau 4 (animations + UI) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x09 attackanimation
 *   0x0A waitanimation
 *   0x10 printstring
 *   0x12 waitmessage
 *   0x13 printfromtable
 *   0x67 yesnobox
 *
 * Tous ces opcodes interagissent avec `gBattleControllerExecFlags` (= waitstate
 * pattern) et appellent des `BtlController_Emit*` (anim/text) ou affichent un
 * yes/no box via `HandleBattleWindow` + `BattlePutTextOnWindow`.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/pokemon-web-demo/public/decomp/em/extracted-all/battle_script_commands.json`
 *     (= bodies extraits)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (= helpers)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` (= emit fns)
 *
 * Convention scriptPtr (= note importante) :
 *   - Lorsque le dispatcher entre dans un handler, `ctx.scriptPtr` est déjà
 *     positionné post-opcode (= pointe au premier byte arg ou au prochain
 *     opcode).
 *   - Pour "rester" sur l'opcode courant (= wait), le handler doit faire
 *     `ctx.scriptPtr--` puis `return true` (pause). Next frame re-entre ici.
 *   - Pour avancer normalement, le handler consume ses args via readByte/Halfword/
 *     Word, puis `return false`.
 *   - Pour jumper (= goto/BattleScript_X), le handler set `ctx.scriptPtr = jumpPtr`
 *     puis `return false`.
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import {
  readHalfword, readWord,
  getBattleScriptOffset, getBattleScriptBytecode,
} from './script-interpreter';
import {
  gBattleControllerExecFlags,
  gHitMarker, gCurrentMove,
  gMoveResultFlags, gMultiHitCounter,
  gBattlerAttacker, gBattlerTarget,
  gBattleMons, gBattleMoveDamage, gBattleMovePower,
  gDisableStructs, gBattleScripting,
  gBattleCommunication, gPauseCounterBattle,
  setActiveBattler, setPauseCounterBattle,
} from './state';
import {
  HITMARKER_NO_ANIMATIONS,
  MOVE_TRANSFORM, MOVE_SUBSTITUTE,
  MOVE_TARGET_BOTH, MOVE_TARGET_FOES_AND_ALLY, MOVE_TARGET_DEPENDS,
  MOVE_RESULT_NO_EFFECT,
  STATUS2_SUBSTITUTE,
  MSG_DISPLAY, MULTISTRING_CHOOSER, CURSOR_POSITION,
  B_COMM_TO_CONTROLLER,
  B_WIN_YESNO, WINDOW_CLEAR,
  YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END,
} from './constants';
import {
  MarkBattlerForControllerExec,
  BattleScriptPush,
  BtlController_EmitMoveAnimation,
  PrepareStringBattle,
  HandleBattleWindow, BattlePutTextOnWindow,
  BattleCreateYesNoCursorAt, BattleDestroyYesNoCursorAt,
  PlaySE, JOY_NEW,
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN,
  SE_SELECT,
} from './battle-controllers';
import { getBattleMove } from './data/battle-moves';

// ─── Helper : "go back to this opcode" pattern ─────────────────────────────

/** Convention runBattleScript : dispatcher fait `scriptPtr++` AVANT d'appeler
 *  handler. Donc à l'entrée du handler, scriptPtr est post-opcode. Pour "rester"
 *  sur l'opcode (= waitstate, re-execute next frame), on backe up. */
function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x09 attackanimation ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_attackanimation (battle_script_commands.c).
 *  No args (= 1 byte total). */
function Cmd_attackanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }

  const isNoAnimMode = (gHitMarker & HITMARKER_NO_ANIMATIONS) &&
                       (gCurrentMove !== MOVE_TRANSFORM && gCurrentMove !== MOVE_SUBSTITUTE);

  if (isNoAnimMode) {
    // BattleScriptPush(gBattlescriptCurrInstr + 1) = push offset of NEXT opcode.
    // Notre ctx.scriptPtr est déjà à NEXT opcode (post-dispatcher-advance).
    BattleScriptPush(ctx, ctx.scriptPtr);
    const pauseOffset = getBattleScriptOffset('BattleScript_Pausex20');
    if (pauseOffset >= 0) {
      ctx.scriptPtr = pauseOffset;
    }
    gBattleScripting.animTurn++;
    gBattleScripting.animTargetsHit++;
    return false;
  }

  const move = getBattleMove(gCurrentMove);
  const target = move?.target ?? 0;
  if ((target & MOVE_TARGET_BOTH ||
       target & MOVE_TARGET_FOES_AND_ALLY ||
       target & MOVE_TARGET_DEPENDS) &&
      gBattleScripting.animTargetsHit) {
    // Already animated for this multi-target move, skip.
    // ctx.scriptPtr already at next opcode = OK.
    return false;
  }

  if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    let multihit: number;

    setActiveBattler(gBattlerAttacker);

    if (gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE) {
      multihit = gMultiHitCounter;
    } else if (gMultiHitCounter !== 0 && gMultiHitCounter !== 1) {
      if (gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
        multihit = 1;
      } else {
        multihit = gMultiHitCounter;
      }
    } else {
      multihit = gMultiHitCounter;
    }

    BtlController_EmitMoveAnimation(
      B_COMM_TO_CONTROLLER,
      gCurrentMove,
      gBattleScripting.animTurn,
      gBattleMovePower,
      gBattleMoveDamage,
      gBattleMons[gBattlerAttacker].friendship,
      gDisableStructs[gBattlerAttacker],
      multihit,
    );
    gBattleScripting.animTurn++;
    gBattleScripting.animTargetsHit++;
    MarkBattlerForControllerExec(gBattlerAttacker);
    return false;
  } else {
    // MOVE_RESULT_NO_EFFECT : pause path (= push + Pausex20).
    BattleScriptPush(ctx, ctx.scriptPtr);
    const pauseOffset = getBattleScriptOffset('BattleScript_Pausex20');
    if (pauseOffset >= 0) {
      ctx.scriptPtr = pauseOffset;
    }
    return false;
  }
}

// ─── 0x0A waitanimation ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_waitanimation. No args. Wait until exec flags clear. */
function Cmd_waitanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags === 0) {
    // Advance (already past opcode).
    return false;
  }
  return _stayOnOpcode(ctx);
}

// ─── 0x10 printstring ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_printstring. 1 byte opcode + u16 stringId = 3 bytes total. */
function Cmd_printstring(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  // T2_READ_16(gBattlescriptCurrInstr + 1) = read u16 at opcode+1.
  // Notre dispatcher a déjà skip l'opcode → ctx.scriptPtr = opcode+1.
  const stringId = readHalfword(ctx);  // advances 2 bytes → ctx.scriptPtr now opcode+3.
  PrepareStringBattle(stringId, gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

// ─── 0x12 waitmessage ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_waitmessage. 1 byte opcode + u16 toWait = 3 bytes total. */
function Cmd_waitmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  if (!gBattleCommunication[MSG_DISPLAY]) {
    // No message active, skip args + advance.
    ctx.scriptPtr += 2;
    return false;
  }
  // Peek u16 toWait (= we'll back up if waiting more).
  const opcodeOffset = ctx.scriptPtr;
  const toWait = readHalfword(ctx);  // advances past args.
  const newCounter = gPauseCounterBattle + 1;
  setPauseCounterBattle(newCounter);
  if (newCounter >= toWait) {
    setPauseCounterBattle(0);
    gBattleCommunication[MSG_DISPLAY] = 0;
    // Already advanced past args, keep going.
    return false;
  }
  // Stay on opcode (= rewind to opcode start) for next tick.
  ctx.scriptPtr = opcodeOffset - 1;
  return true;
}

// ─── 0x13 printfromtable ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_printfromtable. 1 byte opcode + u32 ptr = 5 bytes total. */
function Cmd_printfromtable(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  // const u16 *ptr = T1_READ_PTR(gBattlescriptCurrInstr + 1); ptr += chooser;
  // PrepareStringBattle(*ptr, gBattlerAttacker);
  const tableOffset = readWord(ctx);  // advances 4 bytes.
  const idx = gBattleCommunication[MULTISTRING_CHOOSER];
  const bc = _readBytecodeForString(tableOffset, idx);
  PrepareStringBattle(bc, gBattlerAttacker);
  gBattleCommunication[MSG_DISPLAY] = 1;
  return false;
}

/** Helper : lit u16 little-endian au offset (tableOffset + idx*2) dans le
 *  bytecode global. Le décomp utilise gBattlescriptCurrInstr + 1 comme ptr
 *  vers const u16[] table inline dans le script. */
function _readBytecodeForString(tableOffset: number, idx: number): number {
  const bc = getBattleScriptBytecode();
  if (!bc) return 0;
  const offset = tableOffset + idx * 2;
  if (offset < 0 || offset + 1 >= bc.length) return 0;
  return bc[offset] | (bc[offset + 1] << 8);
}

// ─── 0x67 yesnobox ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnobox. No args. State machine via gBattleCommunication[0]:
 *  case 0 = init window+cursor, case 1 = poll input.
 *
 *  MVP : pas d'input wired, on auto-confirme YES (= cursor=0) au premier tick
 *  case 1 pour ne pas bloquer le script.
 *  TODO : remplacer par real input handling une fois wired au framework UI. */
function Cmd_yesnobox(ctx: BattleScriptContext): boolean {
  switch (gBattleCommunication[0]) {
    case 0:
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, 0);
      BattlePutTextOnWindow(0 /* gText_BattleYesNoChoice */, B_WIN_YESNO);
      gBattleCommunication[0]++;
      gBattleCommunication[CURSOR_POSITION] = 0;
      BattleCreateYesNoCursorAt(0);
      return _stayOnOpcode(ctx);

    case 1:
      // 1:1 décomp poll input. JOY_NEW stubbé → on test puis fallback MVP.
      if (JOY_NEW(DPAD_UP) && gBattleCommunication[CURSOR_POSITION] !== 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 0;
        BattleCreateYesNoCursorAt(0);
      }
      if (JOY_NEW(DPAD_DOWN) && gBattleCommunication[CURSOR_POSITION] === 0) {
        PlaySE(SE_SELECT);
        BattleDestroyYesNoCursorAt(gBattleCommunication[CURSOR_POSITION]);
        gBattleCommunication[CURSOR_POSITION] = 1;
        BattleCreateYesNoCursorAt(1);
      }
      if (JOY_NEW(B_BUTTON)) {
        gBattleCommunication[CURSOR_POSITION] = 1;
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        // Advance — ctx.scriptPtr déjà post-opcode = OK.
        return false;
      } else if (JOY_NEW(A_BUTTON)) {
        PlaySE(SE_SELECT);
        HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
        return false;
      }
      // MVP fallback : auto-confirm YES après 1 frame en case 1.
      // TODO : retirer ce hack une fois real input wired.
      gBattleCommunication[CURSOR_POSITION] = 0;
      HandleBattleWindow(YESNOBOX_X_START, YESNOBOX_Y_START, YESNOBOX_X_END, YESNOBOX_Y_END, WINDOW_CLEAR);
      return false;

    default:
      // Reset state pour éviter dead state si appelé recursivement.
      gBattleCommunication[0] = 0;
      return false;
  }
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau4Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x09] = Cmd_attackanimation;
  commands[0x0A] = Cmd_waitanimation;
  commands[0x10] = Cmd_printstring;
  commands[0x12] = Cmd_waitmessage;
  commands[0x13] = Cmd_printfromtable;
  commands[0x67] = Cmd_yesnobox;
}

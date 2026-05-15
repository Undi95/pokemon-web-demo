/**
 * battle/cmd-niveau-32.ts — Phase 1 Niveau 32 (learn move / party / handle ball) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x50 openpartyscreen           (1 byte — open party UI state machine — stub)
 *   0x51 switchhandleorder         (3 bytes — switch order state machine — stub)
 *   0x59 handlelearnnewmove        (10 bytes — try teach new move)
 *   0x5A yesnoboxlearnmove         (5 bytes — yes/no learn move — stub)
 *   0x5B yesnoboxstoplearningmove  (5 bytes — yes/no stop learning — stub)
 *   0x6C drawlvlupbox              (1 byte — level-up stats box state machine — stub)
 *   0xEF handleballthrow           (1 byte — Pokéball capture state machine — stub)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note : ces 7 opcodes sont des state machines UI lourdes (party screen,
 *  yesno box, palette fade, naming screen, ball anim). Notre port = MVP stubs
 *  qui advance pour permettre le bytecode de progresser. Les vrais behaviors
 *  UI seront wired post-Phase 1. */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, setActiveBattler,
  gBattleTypeFlags,
  gBattleControllerExecFlags,
} from './state';
import {
  MOVE_NONE,
  STATUS2_TRANSFORMED,
  BATTLE_TYPE_DOUBLE,
} from './constants';
import { GetBattlerAtPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT } from './util';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 stub `MonTryLearningNewMove(mon, firstMove)` (pokemon.c).
 *  MVP : retourne MOVE_NONE (= rien à apprendre). */
function _monTryLearningNewMove(_battlerIdx: number, _firstMove: number): number {
  return MOVE_NONE;
}

const MON_HAS_MAX_MOVES = 0xFFFF;

/** 1:1 stub `GiveMoveToBattleMon(battleMon, move)` (battle_util.c).
 *  Insère move dans le premier slot vide. */
function _giveMoveToBattleMon(battlerIdx: number, move: number): void {
  const mon = gBattleMons[battlerIdx];
  for (let i = 0; i < 4; i++) {
    if (mon.moves[i] === MOVE_NONE) {
      mon.moves[i] = move;
      break;
    }
  }
}

// ─── 0x50 openpartyscreen ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_openpartyscreen. 1 byte (~12k chars de state machine).
 *  MVP stub : advance direct. */
function Cmd_openpartyscreen(_ctx: BattleScriptContext): boolean {
  // TODO porter party screen state machine + party_menu UI.
  return false;
}

// ─── 0x51 switchhandleorder ───────────────────────────────────────────────

/** 1:1 décomp Cmd_switchhandleorder. 3 bytes (u8 battler + u8 caseId).
 *  MVP stub : consomme args + advance. */
function Cmd_switchhandleorder(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  readByte(ctx);  // battler
  readByte(ctx);  // caseId
  // TODO porter switch handler state machine.
  return false;
}

// ─── 0x59 handlelearnnewmove ──────────────────────────────────────────────

/** 1:1 décomp Cmd_handlelearnnewmove. 10 bytes (2 ptrs + 1 firstMove flag). */
function Cmd_handlelearnnewmove(ctx: BattleScriptContext): boolean {
  const learnedMovePtr = readWord(ctx);
  const nothingToLearnPtr = readWord(ctx);
  const firstMoveFlag = readByte(ctx);

  let learnMove = _monTryLearningNewMove(0 /* expGetterMonId proxy */, firstMoveFlag);
  // 1:1 décomp : while (learnMove == MON_ALREADY_KNOWS_MOVE) try again.
  // Notre stub retourne toujours MOVE_NONE → boucle skip.
  let safety = 0;
  while (learnMove === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */ && safety++ < 100) {
    learnMove = _monTryLearningNewMove(0, 0);
  }

  if (learnMove === MOVE_NONE) {
    ctx.scriptPtr = nothingToLearnPtr;
    return false;
  }
  if (learnMove === MON_HAS_MAX_MOVES) {
    // Déjà 4 moves : continue (= fall through).
    return false;
  }

  // 1:1 décomp : si battler player local match expGetterMonId, GiveMove.
  const playerLeft = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(playerLeft);
  if (!(gBattleMons[playerLeft].status2 & STATUS2_TRANSFORMED)) {
    _giveMoveToBattleMon(playerLeft, learnMove);
  }
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    const playerRight = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    setActiveBattler(playerRight);
    if (!(gBattleMons[playerRight].status2 & STATUS2_TRANSFORMED)) {
      _giveMoveToBattleMon(playerRight, learnMove);
    }
  }
  ctx.scriptPtr = learnedMovePtr;
  return false;
}

// ─── 0x5A yesnoboxlearnmove ───────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxlearnmove. 5 bytes (u32 ptr). State machine. */
function Cmd_yesnoboxlearnmove(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // forgetMovePtr — consume arg.
  // MVP stub : skip state machine, advance direct.
  // TODO porter yesno + summary screen + forget move flow.
  return false;
}

// ─── 0x5B yesnoboxstoplearningmove ────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxstoplearningmove. 5 bytes (u32 ptr). State machine. */
function Cmd_yesnoboxstoplearningmove(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // stopPtr.
  // MVP stub : skip state machine, advance direct.
  return false;
}

// ─── 0x6C drawlvlupbox ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_drawlvlupbox. 1 byte. State machine via
 *  gBattleScripting.drawlvlupboxState. MVP stub : advance direct. */
function Cmd_drawlvlupbox(_ctx: BattleScriptContext): boolean {
  // TODO porter level-up stats box rendering (= bg + sprite + text scroll).
  return false;
}

// ─── 0xEF handleballthrow ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_handleballthrow. 1 byte (~5k chars state machine).
 *  Pokéball catch state machine : calc odds, anim shakes, check break.
 *  MVP stub : skip (= simulate "always escape" pour MVP, vraie capture
 *  pas implémentée). */
function Cmd_handleballthrow(_ctx: BattleScriptContext): boolean {
  // TODO porter ball throw state machine + odds calc + shake anim.
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau32Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x50] = Cmd_openpartyscreen;
  commands[0x51] = Cmd_switchhandleorder;
  commands[0x59] = Cmd_handlelearnnewmove;
  commands[0x5A] = Cmd_yesnoboxlearnmove;
  commands[0x5B] = Cmd_yesnoboxstoplearningmove;
  commands[0x6C] = Cmd_drawlvlupbox;
  commands[0xEF] = Cmd_handleballthrow;
}

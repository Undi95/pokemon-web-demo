/**
 * battle/cmd-niveau-7.ts — Phase 1 Niveau 7 (mutation + flow control) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x26 setmultihit          (2 bytes : opcode + u8 count)
 *   0x27 decrementmultihit    (5 bytes : opcode + u32 jumpPtr)
 *   0x44 endselectionscript   (1 byte — set gBattleStruct.selectionScriptFinished)
 *   0x4B returnatktoball      (1 byte — recall attacker if not fainted)
 *   0x5F swapattackerwithtarget (1 byte — swap gBattlerAttacker/gBattlerTarget)
 *   0x60 incrementgamestat    (2 bytes : opcode + u8 statId)
 *   0x68 cancelallactions     (1 byte — gActionsByTurnOrder[i] = CANCEL_PARTNER)
 *   0x80 manipulatedamage     (2 bytes : opcode + u8 case)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/battle_script_commands.h:363-365`
 *     (DMG_CHANGE_SIGN/RECOIL_FROM_MISS/DOUBLED)
 *   - `decomps/pokeemeraude/include/battle.h:27,40` (B_ACTION_USE_MOVE/CANCEL_PARTNER)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gMultiHitCounter, setMultiHitCounter,
  gBattlerAttacker, gBattlerTarget, gBattlersCount,
  setBattlerAttacker, setBattlerTarget, setActiveBattler,
  gHitMarker, setHitMarker,
  gBattleMons, gBattleMoveDamage, setBattleMoveDamage,
} from './state';
import {
  HITMARKER_SWAP_ATTACKER_TARGET, HITMARKER_FAINTED,
  GET_BATTLER_SIDE, B_SIDE_PLAYER, B_COMM_TO_CONTROLLER,
} from './constants';
import {
  MarkBattlerForControllerExec, BtlController_EmitReturnMonToBall,
} from './battle-controllers';

// ─── DMG_* enum (battle_script_commands.h:363-365) — 1:1 décomp ────────────
const DMG_CHANGE_SIGN      = 0;
const DMG_RECOIL_FROM_MISS = 1;
const DMG_DOUBLED          = 2;

// ─── B_ACTION_* (battle.h:27,40) — 1:1 décomp ──────────────────────────────
const B_ACTION_CANCEL_PARTNER = 12;

// ─── State stubs (= structs pas encore portés) ──────────────────────────────

/** 1:1 décomp `gActionsByTurnOrder[MAX_BATTLERS_COUNT]` — action queue per
 *  turn. Cmd_cancelallactions iterates et set CANCEL_PARTNER. Pour MVP,
 *  on stocke ici. */
export const gActionsByTurnOrder: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct.selectionScriptFinished[MAX_BATTLERS_COUNT]` —
 *  flag per battler que la selection script a terminé. Pour MVP, simple array. */
export const _selectionScriptFinished: boolean[] = [false, false, false, false];

// ─── 0x26 setmultihit ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setmultihit. 2 bytes. */
function Cmd_setmultihit(ctx: BattleScriptContext): boolean {
  // gMultiHitCounter = gBattlescriptCurrInstr[1]; gBattlescriptCurrInstr += 2;
  const count = readByte(ctx);
  setMultiHitCounter(count);
  return false;
}

// ─── 0x27 decrementmultihit ────────────────────────────────────────────────

/** 1:1 décomp Cmd_decrementmultihit. 5 bytes (opcode + u32 jumpPtr).
 *  Decomp:
 *    if (--gMultiHitCounter == 0) gBattlescriptCurrInstr += 5;
 *    else gBattlescriptCurrInstr = T2_READ_PTR(gBattlescriptCurrInstr + 1);
 */
function Cmd_decrementmultihit(ctx: BattleScriptContext): boolean {
  // Entry: ctx.scriptPtr = opcode+1.
  const jumpPtr = readWord(ctx); // advances → opcode+5
  const newCounter = gMultiHitCounter - 1;
  setMultiHitCounter(newCounter);
  if (newCounter === 0) {
    // Continue (= already at opcode+5).
    return false;
  }
  // Jump back to the loop start.
  ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0x44 endselectionscript ───────────────────────────────────────────────

/** 1:1 décomp Cmd_endselectionscript. No args.
 *  Décomp:
 *    *(gBattlerAttacker + gBattleStruct->selectionScriptFinished) = TRUE;
 *  (= équivalent à `selectionScriptFinished[gBattlerAttacker] = TRUE`).
 *  Note : le décomp ne fait PAS `gBattlescriptCurrInstr++`. Le main battle
 *  loop voit selectionScriptFinished et break le sous-script. Notre équivalent
 *  = stay sur opcode + return true (= pause) pour laisser le caller exit. */
function Cmd_endselectionscript(ctx: BattleScriptContext): boolean {
  _selectionScriptFinished[gBattlerAttacker] = true;
  return _stayOnOpcode(ctx);
}

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x4B returnatktoball ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_returnatktoball. 1 byte. */
function Cmd_returnatktoball(_ctx: BattleScriptContext): boolean {
  setActiveBattler(gBattlerAttacker);
  if (!(gHitMarker & HITMARKER_FAINTED(gBattlerAttacker))) {
    BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
    MarkBattlerForControllerExec(gBattlerAttacker);
  }
  return false;
}

// ─── 0x5F swapattackerwithtarget ───────────────────────────────────────────

/** 1:1 décomp Cmd_swapattackerwithtarget. No args. */
function Cmd_swapattackerwithtarget(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : gActiveBattler = gBattlerAttacker (temp pour swap).
  setActiveBattler(gBattlerAttacker);
  const savedAttacker = gBattlerAttacker;
  setBattlerAttacker(gBattlerTarget);
  setBattlerTarget(savedAttacker);
  if (gHitMarker & HITMARKER_SWAP_ATTACKER_TARGET) {
    setHitMarker(gHitMarker & ~HITMARKER_SWAP_ATTACKER_TARGET);
  } else {
    setHitMarker(gHitMarker | HITMARKER_SWAP_ATTACKER_TARGET);
  }
  return false;
}

// ─── 0x60 incrementgamestat ────────────────────────────────────────────────

/** 1:1 décomp Cmd_incrementgamestat. 2 bytes. */
function Cmd_incrementgamestat(ctx: BattleScriptContext): boolean {
  const statId = readByte(ctx);
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    _incrementGameStat(statId);
  }
  return false;
}

/** Stub IncrementGameStat — TODO wire à la persistence game stats. */
function _incrementGameStat(statId: number): void {
  // TODO : appel real game stat increment (= save block).
  void statId;
}

// ─── 0x68 cancelallactions ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_cancelallactions. No args. */
function Cmd_cancelallactions(_ctx: BattleScriptContext): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    gActionsByTurnOrder[i] = B_ACTION_CANCEL_PARTNER;
  }
  return false;
}

// ─── 0x80 manipulatedamage ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_manipulatedamage. 2 bytes. */
function Cmd_manipulatedamage(ctx: BattleScriptContext): boolean {
  const caseId = readByte(ctx);
  switch (caseId) {
    case DMG_CHANGE_SIGN:
      setBattleMoveDamage(gBattleMoveDamage * -1);
      break;
    case DMG_RECOIL_FROM_MISS: {
      let dmg = Math.floor(gBattleMoveDamage / 2);
      if (dmg === 0) dmg = 1;
      const halfMax = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
      if (halfMax < dmg) dmg = halfMax;
      setBattleMoveDamage(dmg);
      break;
    }
    case DMG_DOUBLED:
      setBattleMoveDamage(gBattleMoveDamage * 2);
      break;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau7Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x26] = Cmd_setmultihit;
  commands[0x27] = Cmd_decrementmultihit;
  commands[0x44] = Cmd_endselectionscript;
  commands[0x4B] = Cmd_returnatktoball;
  commands[0x5F] = Cmd_swapattackerwithtarget;
  commands[0x60] = Cmd_incrementgamestat;
  commands[0x68] = Cmd_cancelallactions;
  commands[0x80] = Cmd_manipulatedamage;
}

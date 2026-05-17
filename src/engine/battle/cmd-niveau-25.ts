/**
 * battle/cmd-niveau-25.ts — Phase 1 Niveau 25 (anim variants + mimic + castform) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x45 playanimation              (7 bytes — battle anim emit)
 *   0x46 playanimation_var          (10 bytes — battle anim via u8* ptr)
 *   0x9D mimicattackcopy            (5 bytes — Mimic copy last opp move)
 *   0xE6 docastformchangeanimation  (1 byte  — Castform anim emit)
 *   0xE7 trycastformdatachange      (1 byte  — Castform data update)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:725 sMovesForbiddenToCopy`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setChosenMove,
  setActiveBattler,
  gHitMarker,
  gStatuses3, gDisableStructs,
  gLastMoves, gCurrMovePos,
  gBattleScripting, gBattleStruct,
} from './state';
import {
  STATUS2_TRANSFORMED, STATUS3_SEMI_INVULNERABLE,
  HITMARKER_NO_ANIMATIONS,
  MAX_MON_MOVES, MOVE_NONE, MOVE_UNAVAILABLE,
  B_ANIM_CASTFORM_CHANGE, CASTFORM_SUBSTITUTE,
  STATUS2_SUBSTITUTE,
  B_COMM_TO_CONTROLLER,
  sMovesForbiddenToCopy, MIMIC_FORBIDDEN_END,
} from './constants';
import {
  BtlController_EmitBattleAnimation, MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattlerForBattleScript } from './util';
import { getBattleMove } from './data/battle-moves';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_25,
  PREPARE_MOVE_BUFFER,
} from './text-buffers';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `IsMoveUncopyableByMimic(u16 move)` (battle_script_commands.c:7838). */
function IsMoveUncopyableByMimic(move: number): boolean {
  let i = 0;
  while (sMovesForbiddenToCopy[i] !== MIMIC_FORBIDDEN_END
         && sMovesForbiddenToCopy[i] !== move) i++;
  return sMovesForbiddenToCopy[i] !== MIMIC_FORBIDDEN_END;
}

/** Test si l'anim id est une weather "continues" anim.
 *  AUDIT BUG FIX : valeurs étaient 1..4 (= STATS_CHANGE/SUBSTITUTE_FADE area)
 *  → vraies = 10..13 (battle_anim.h:367-370). */
function _isWeatherContinuesAnim(animId: number): boolean {
  // 1:1 décomp battle_anim.h:367-370 :
  //   B_ANIM_RAIN_CONTINUES=10, SUN_CONTINUES=11, SANDSTORM_CONTINUES=12, HAIL_CONTINUES=13.
  return animId >= 10 && animId <= 13;
}

/** B_ANIM_STATS_CHANGE/SNATCH_MOVE/SUBSTITUTE_FADE — always play.
 *  AUDIT BUG FIX : valeurs étaient 0/5/6 → vraies = 1/17/2 (battle_anim.h:358,374). */
function _isAlwaysPlayAnim(animId: number): boolean {
  // 1:1 décomp battle_anim.h :
  //   B_ANIM_STATS_CHANGE=1, B_ANIM_SUBSTITUTE_FADE=2, B_ANIM_SNATCH_MOVE=17.
  return animId === 1 || animId === 2 || animId === 17;
}

// ─── 0x45 playanimation ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_playanimation. 7 bytes (u8 battler + u8 anim_id + u32 arg_ptr).
 *  Notre bytecode stocke directement les valeurs au lieu de pointers — on lit
 *  un u32 comme argument value direct (= bytecode extractor déjà flat). */
function Cmd_playanimation(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const animId = readByte(ctx);
  const argument = readWord(ctx);  // u32 — décomp lit u16 via T2_READ_PTR(u32 ptr)
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  if (_isAlwaysPlayAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gHitMarker & HITMARKER_NO_ANIMATIONS) {
    // Décomp : BattleScriptPush(... + 7); jump à BattleScript_Pausex20.
    // Notre port : on a déjà avancé de 7 → simulate pause via stay then advance.
    // Note : court délai animation deferred (= advance direct sans wait).
    return false;
  }
  if (_isWeatherContinuesAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gStatuses3[active] & STATUS3_SEMI_INVULNERABLE) {
    // Skip anim, just advance.
    return false;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument & 0xFFFF);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x46 playanimation_var ───────────────────────────────────────────────

/** 1:1 décomp Cmd_playanimation_var. 10 bytes (u8 battler + u32 anim_ptr + u32 arg_ptr).
 *  Décomp déréfère animationIdPtr (u8*) et argumentPtr (u16*). Notre bytecode
 *  stocke les valeurs directly — on lit 4 bytes pour chaque mais utilise seulement
 *  les low bytes/words. */
function Cmd_playanimation_var(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const animId = readWord(ctx) & 0xFF;  // u8 anim id via u32 ptr
  const argument = readWord(ctx) & 0xFFFF;  // u16 argument via u32 ptr
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  if (_isAlwaysPlayAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gHitMarker & HITMARKER_NO_ANIMATIONS) {
    return false;
  }
  if (_isWeatherContinuesAnim(animId)) {
    BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
    MarkBattlerForControllerExec(active);
    return false;
  }
  if (gStatuses3[active] & STATUS3_SEMI_INVULNERABLE) {
    return false;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, animId, argument);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x9D mimicattackcopy ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_mimicattackcopy. 5 bytes (u32 fail jump). */
function Cmd_mimicattackcopy(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setChosenMove(MOVE_UNAVAILABLE);

  if (IsMoveUncopyableByMimic(gLastMoves[gBattlerTarget])
      || (gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
      || gLastMoves[gBattlerTarget] === MOVE_NONE
      || gLastMoves[gBattlerTarget] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[gBattlerAttacker].moves[i] === gLastMoves[gBattlerTarget]) break;
  }
  if (i !== MAX_MON_MOVES) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Move not already known : replace at gCurrMovePos.
  gBattleMons[gBattlerAttacker].moves[gCurrMovePos] = gLastMoves[gBattlerTarget];
  const targetMovePp = getBattleMove(gLastMoves[gBattlerTarget]).pp;
  gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = targetMovePp < 5 ? targetMovePp : 5;
  // 1:1 décomp battle_script_commands.c:7876.
  PREPARE_MOVE_BUFFER(_gBattleTextBuff1_25, gLastMoves[gBattlerTarget]);
  gDisableStructs[gBattlerAttacker].mimickedMoves |= gBitTable[gCurrMovePos];
  return false;
}

// ─── 0xE6 docastformchangeanimation ───────────────────────────────────────

/** 1:1 décomp Cmd_docastformchangeanimation. 1 byte. */
function Cmd_docastformchangeanimation(_ctx: BattleScriptContext): boolean {
  const active = gBattleScripting.battler;
  setActiveBattler(active);
  if (gBattleMons[active].status2 & STATUS2_SUBSTITUTE) {
    gBattleStruct.formToChangeInto = gBattleStruct.formToChangeInto | CASTFORM_SUBSTITUTE;
  }
  BtlController_EmitBattleAnimation(B_COMM_TO_CONTROLLER, B_ANIM_CASTFORM_CHANGE, gBattleStruct.formToChangeInto);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0xE7 trycastformdatachange ───────────────────────────────────────────

/** 1:1 décomp Cmd_trycastformdatachange (battle_script_commands.c).
 *  Si CastformDataTypeChange retourne form != 0 → push cursor + jump
 *  BattleScript_CastformChange + set gBattleStruct->formToChangeInto. */
function Cmd_trycastformdatachange(ctx: BattleScriptContext): boolean {
  const form = _castformDataTypeChangeN25(gBattleScripting.battler);
  if (form) {
    gBattleStruct.formToChangeInto = form - 1;
    const off = getBattleScriptOffsetN25('BattleScript_CastformChange');
    if (off >= 0) {
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      ctx.scriptPtr = off;
    }
  }
  return false;
}

// Imports for Cmd_trycastformdatachange (= dup avec top of file → utiliser ceux existants).
import { _castformDataTypeChange as _castformDataTypeChangeN25 } from './ability-battle-effects';
import { getBattleScriptOffset as getBattleScriptOffsetN25 } from './script-interpreter';

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau25Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x45] = Cmd_playanimation;
  commands[0x46] = Cmd_playanimation_var;
  commands[0x9D] = Cmd_mimicattackcopy;
  commands[0xE6] = Cmd_docastformchangeanimation;
  commands[0xE7] = Cmd_trycastformdatachange;
}

/**
 * battle/cmd-niveau-5.ts — Phase 1 Niveau 5 (result + messages + faint) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x02 attackstring        ("X used Y!")
 *   0x0D critmessage         ("A critical hit!")
 *   0x0E effectivenesssound  (SE selon effectiveness)
 *   0x0F resultmessage       (texte SE/NVE/MISS/etc.)
 *   0x1A dofaintanimation    (faint anim emit + Mark)
 *   0x1B cleareffectsonfaint (clear status + FaintClearSetData)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json` (bodies)
 *   - `decomps/pokeemeraude/src/battle_script_commands.c`
 *   - `decomps/pokeemeraude/src/battle_main.c` (= FaintClearSetData)
 *   - `decomps/pokeemeraude/src/battle_message.c:891-898` (= gMissStringIds[])
 *
 * Args sizes (asm/macros/battle_script.inc) :
 *   attackstring/critmessage/effectivenesssound/resultmessage = 1 byte
 *   dofaintanimation/cleareffectsonfaint = 2 bytes (1-byte battler arg)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { getBattleScriptOffset, readByte } from './script-interpreter';
import {
  gBattleControllerExecFlags, gHitMarker, setHitMarker,
  gMoveResultFlags, setMoveResultFlags,
  gCritMultiplier, gBattlerAttacker, gBattlerTarget,
  gBattleMons, gBattleCommunication,
  setLastUsedItem, setPotentialItemEffectBattler, setActiveBattler,
  gBattleTypeFlags,
} from './state';
import {
  HITMARKER_NO_ATTACKSTRING, HITMARKER_ATTACKSTRING_PRINTED,
  MOVE_RESULT_MISSED, MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE, MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_FAILED, MOVE_RESULT_ONE_HIT_KO,
  MOVE_RESULT_FOE_ENDURED, MOVE_RESULT_FOE_HUNG_ON,
  MOVE_RESULT_NO_EFFECT,
  MSG_DISPLAY, MISS_TYPE,
  B_MSG_AVOIDED_ATK,
  STRINGID_USEDMOVE, STRINGID_CRITICALHIT,
  STRINGID_SUPEREFFECTIVE, STRINGID_NOTVERYEFFECTIVE,
  STRINGID_ONEHITKO, STRINGID_PKMNENDUREDHIT,
  STRINGID_BUTITFAILED, STRINGID_ITDOESNTAFFECT,
  STRINGID_ATTACKMISSED, STRINGID_PKMNPROTECTEDITSELF,
  STRINGID_PKMNAVOIDEDATTACK, STRINGID_AVOIDEDDAMAGE,
  STRINGID_PKMNMAKESGROUNDMISS,
  B_COMM_TO_CONTROLLER,
  SE_SUPER_EFFECTIVE, SE_NOT_EFFECTIVE, SE_EFFECTIVE,
  REQUEST_STATUS_BATTLE,
  BATTLE_TYPE_ARENA,
} from './constants';
import {
  MarkBattlerForControllerExec, BattleScriptPush,
  PrepareStringBattle, BtlController_EmitPlaySE,
  BtlController_EmitFaintAnimation, BtlController_EmitSetMonData,
} from './battle-controllers';
import { getBattlerForBattleScript, FaintClearSetData } from './util';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `gMissStringIds[B_MSG_*]` (battle_message.c:891-898). */
const gMissStringIds: number[] = [
  STRINGID_ATTACKMISSED,       // B_MSG_MISSED      = 0
  STRINGID_PKMNPROTECTEDITSELF, // B_MSG_PROTECTED   = 1
  STRINGID_PKMNAVOIDEDATTACK,   // B_MSG_AVOIDED_ATK = 2
  STRINGID_AVOIDEDDAMAGE,       // B_MSG_AVOIDED_DMG = 3
  STRINGID_PKMNMAKESGROUNDMISS, // B_MSG_GROUND_MISS = 4
];

// ─── 0x02 attackstring ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_attackstring. No args. */
function Cmd_attackstring(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  if (!(gHitMarker & (HITMARKER_NO_ATTACKSTRING | HITMARKER_ATTACKSTRING_PRINTED))) {
    PrepareStringBattle(STRINGID_USEDMOVE, gBattlerAttacker);
    setHitMarker(gHitMarker | HITMARKER_ATTACKSTRING_PRINTED);
  }
  // Décomp: gBattlescriptCurrInstr++; gBattleCommunication[MSG_DISPLAY] = 0;
  // (= MSG_DISPLAY clear ici, contrairement aux autres print qui le set à 1)
  gBattleCommunication[MSG_DISPLAY] = 0;
  return false;
}

// ─── 0x0D critmessage ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_critmessage. No args. */
function Cmd_critmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  if (gCritMultiplier === 2 && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    PrepareStringBattle(STRINGID_CRITICALHIT, gBattlerAttacker);
    gBattleCommunication[MSG_DISPLAY] = 1;
  }
  return false;
}

// ─── 0x0E effectivenesssound ────────────────────────────────────────────────

/** 1:1 décomp Cmd_effectivenesssound. No args. */
function Cmd_effectivenesssound(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  setActiveBattler(gBattlerTarget);
  if (!(gMoveResultFlags & MOVE_RESULT_MISSED)) {
    const flagsNoMiss = gMoveResultFlags & ~MOVE_RESULT_MISSED & 0xFF;
    switch (flagsNoMiss) {
      case MOVE_RESULT_SUPER_EFFECTIVE:
        BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_SUPER_EFFECTIVE);
        MarkBattlerForControllerExec(gBattlerTarget);
        break;
      case MOVE_RESULT_NOT_VERY_EFFECTIVE:
        BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_NOT_EFFECTIVE);
        MarkBattlerForControllerExec(gBattlerTarget);
        break;
      case MOVE_RESULT_DOESNT_AFFECT_FOE:
      case MOVE_RESULT_FAILED:
        // No SE.
        break;
      case MOVE_RESULT_FOE_ENDURED:
      case MOVE_RESULT_ONE_HIT_KO:
      case MOVE_RESULT_FOE_HUNG_ON:
      default:
        if (gMoveResultFlags & MOVE_RESULT_SUPER_EFFECTIVE) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_SUPER_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        } else if (gMoveResultFlags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_NOT_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        } else if (!(gMoveResultFlags & (MOVE_RESULT_DOESNT_AFFECT_FOE | MOVE_RESULT_FAILED))) {
          BtlController_EmitPlaySE(B_COMM_TO_CONTROLLER, SE_EFFECTIVE);
          MarkBattlerForControllerExec(gBattlerTarget);
        }
        break;
    }
  }
  return false;
}

// ─── 0x0F resultmessage ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_resultmessage. No args. */
function Cmd_resultmessage(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) {
    return _stayOnOpcode(ctx);
  }
  let stringId = 0;

  const missAndNotAffect = (gMoveResultFlags & MOVE_RESULT_MISSED) &&
    (!(gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) ||
      gBattleCommunication[MISS_TYPE] > B_MSG_AVOIDED_ATK);

  if (missAndNotAffect) {
    stringId = gMissStringIds[gBattleCommunication[MISS_TYPE]] ?? 0;
    gBattleCommunication[MSG_DISPLAY] = 1;
  } else {
    gBattleCommunication[MSG_DISPLAY] = 1;
    const flagsNoMiss = gMoveResultFlags & ~MOVE_RESULT_MISSED & 0xFF;
    switch (flagsNoMiss) {
      case MOVE_RESULT_SUPER_EFFECTIVE:
        stringId = STRINGID_SUPEREFFECTIVE;
        break;
      case MOVE_RESULT_NOT_VERY_EFFECTIVE:
        stringId = STRINGID_NOTVERYEFFECTIVE;
        break;
      case MOVE_RESULT_ONE_HIT_KO:
        stringId = STRINGID_ONEHITKO;
        break;
      case MOVE_RESULT_FOE_ENDURED:
        stringId = STRINGID_PKMNENDUREDHIT;
        break;
      case MOVE_RESULT_FAILED:
        stringId = STRINGID_BUTITFAILED;
        break;
      case MOVE_RESULT_DOESNT_AFFECT_FOE:
        stringId = STRINGID_ITDOESNTAFFECT;
        break;
      case MOVE_RESULT_FOE_HUNG_ON:
        setLastUsedItem(gBattleMons[gBattlerTarget].item);
        setPotentialItemEffectBattler(gBattlerTarget);
        setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
        // BattleScriptPushCursor : push current opcode-1 (= return here next).
        // Notre ctx.scriptPtr est déjà au prochain opcode (post-dispatcher
        // advance). Le décomp push gBattlescriptCurrInstr (= position courante
        // au DÉBUT de l'opcode). On reproduit en pushant scriptPtr-1.
        BattleScriptPush(ctx, ctx.scriptPtr - 1);
        _jumpTo(ctx, 'BattleScript_FocusBandActivates');
        return false;
      default:
        if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) {
          stringId = STRINGID_ITDOESNTAFFECT;
        } else if (gMoveResultFlags & MOVE_RESULT_ONE_HIT_KO) {
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_ONE_HIT_KO | MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_OneHitKOMsg');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FOE_ENDURED) {
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_EnduredMsg');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FOE_HUNG_ON) {
          setLastUsedItem(gBattleMons[gBattlerTarget].item);
          setPotentialItemEffectBattler(gBattlerTarget);
          setMoveResultFlags(gMoveResultFlags & ~(MOVE_RESULT_FOE_ENDURED | MOVE_RESULT_FOE_HUNG_ON));
          BattleScriptPush(ctx, ctx.scriptPtr - 1);
          _jumpTo(ctx, 'BattleScript_FocusBandActivates');
          return false;
        } else if (gMoveResultFlags & MOVE_RESULT_FAILED) {
          stringId = STRINGID_BUTITFAILED;
        } else {
          gBattleCommunication[MSG_DISPLAY] = 0;
        }
    }
  }

  if (stringId) {
    PrepareStringBattle(stringId, gBattlerAttacker);
  }

  return false;
}

function _jumpTo(ctx: BattleScriptContext, label: string): void {
  const offset = getBattleScriptOffset(label);
  if (offset >= 0) {
    ctx.scriptPtr = offset;
  }
}

// ─── 0x1A dofaintanimation ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_dofaintanimation. 2 bytes (opcode + 1-byte battler arg). */
function Cmd_dofaintanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  // Entry: ctx.scriptPtr = opcode+1 (= battler arg).
  // Decomp reads gBattlescriptCurrInstr[1] = arg byte, then advances +=2.
  // Our readByte at this position reads the arg + advances. Then ctx.scriptPtr
  // = opcode+2 = next opcode. ✓
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  BtlController_EmitFaintAnimation(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x1B cleareffectsonfaint ──────────────────────────────────────────────

/** 1:1 décomp Cmd_cleareffectsonfaint. 2 bytes. */
function Cmd_cleareffectsonfaint(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags !== 0) {
    return _stayOnOpcode(ctx);
  }
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);

  if (!(gBattleTypeFlags & BATTLE_TYPE_ARENA) || gBattleMons[active].hp === 0) {
    gBattleMons[active].status1 = 0;
    // 1:1 décomp : sizeof(gBattleMons[active].status1) = sizeof(u32) = 4 bytes.
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, 0, 4, gBattleMons[active].status1);
    MarkBattlerForControllerExec(active);
  }

  FaintClearSetData();
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau5Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x02] = Cmd_attackstring;
  commands[0x0D] = Cmd_critmessage;
  commands[0x0E] = Cmd_effectivenesssound;
  commands[0x0F] = Cmd_resultmessage;
  commands[0x1A] = Cmd_dofaintanimation;
  commands[0x1B] = Cmd_cleareffectsonfaint;
}

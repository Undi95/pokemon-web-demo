/**
 * battle/cmd-niveau-8.ts — Phase 1 Niveau 8 (utility + dynamic) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x42 jumpiftype2       (7 bytes : opcode + u8 battler + u8 type + u32 ptr)
 *   0x6F makevisible       (2 bytes : opcode + u8 battler)
 *   0x82 jumpifnotfirstturn (5 bytes : opcode + u32 ptr)
 *   0xC1 hiddenpowercalc   (1 byte — calc gDynamicBasePower + gDynamicMoveType
 *                            from IVs)
 *   0xE3 jumpifhasnohp     (6 bytes : opcode + u8 battler + u32 ptr)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:455-456` (F_DYNAMIC_TYPE_*)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattlerAttacker, gBattleMons, gDisableStructs,
  setActiveBattler, setDynamicBasePower, setDynamicMoveType,
} from './state';
import {
  TYPE_MYSTERY, NUMBER_OF_MON_TYPES,
  F_DYNAMIC_TYPE_IGNORE_PHYSICALITY, F_DYNAMIC_TYPE_SET,
} from './constants';
import { MarkBattlerForControllerExec } from './battle-controllers';
import { getBattlerForBattleScript } from './util';

// ─── 0x42 jumpiftype2 ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpiftype2. 7 bytes. */
function Cmd_jumpiftype2(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const type = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const battler = getBattlerForBattleScript(battlerArg);
  const mon = gBattleMons[battler];
  if (type === mon.type1 || type === mon.type2) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0x6F makevisible ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_makevisible. 2 bytes. */
function Cmd_makevisible(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  _emitSpriteInvisibility(false);
  MarkBattlerForControllerExec(active);
  return false;
}

/** 1:1 stub `BtlController_EmitSpriteInvisibility(buf, isInvisible)`. MVP no-op. */
function _emitSpriteInvisibility(_isInvisible: boolean): void {
  // TODO : toggle sprite visibility au framework UI.
}

// ─── 0x82 jumpifnotfirstturn ───────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnotfirstturn. 5 bytes. */
function Cmd_jumpifnotfirstturn(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].isFirstTurn) {
    // 1:1 : gBattlescriptCurrInstr += 5 (= advance, already done)
    return false;
  }
  ctx.scriptPtr = jumpPtr;
  return false;
}

// ─── 0xC1 hiddenpowercalc ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_hiddenpowercalc. No args.
 *  Calc power from IVs bit 1 of {hp,atk,def,speed,spAttack,spDefense}.
 *  Calc type from IVs bit 0 of same fields.
 *  Set gDynamicBasePower + gDynamicMoveType with F_DYNAMIC_TYPE_SET +
 *  F_DYNAMIC_TYPE_IGNORE_PHYSICALITY flags. */
function Cmd_hiddenpowercalc(_ctx: BattleScriptContext): boolean {
  const mon = gBattleMons[gBattlerAttacker];
  const powerBits =
      ((mon.hpIV       & 2) >> 1) |
      ((mon.attackIV   & 2) << 0) |
      ((mon.defenseIV  & 2) << 1) |
      ((mon.speedIV    & 2) << 2) |
      ((mon.spAttackIV & 2) << 3) |
      ((mon.spDefenseIV & 2) << 4);

  const typeBits =
      ((mon.hpIV       & 1) << 0) |
      ((mon.attackIV   & 1) << 1) |
      ((mon.defenseIV  & 1) << 2) |
      ((mon.speedIV    & 1) << 3) |
      ((mon.spAttackIV & 1) << 4) |
      ((mon.spDefenseIV & 1) << 5);

  setDynamicBasePower(Math.floor((40 * powerBits) / 63) + 30);

  let dynamicType = Math.floor(((NUMBER_OF_MON_TYPES - 3) * typeBits) / 63) + 1;
  if (dynamicType >= TYPE_MYSTERY) {
    dynamicType++;
  }
  dynamicType |= F_DYNAMIC_TYPE_IGNORE_PHYSICALITY | F_DYNAMIC_TYPE_SET;
  setDynamicMoveType(dynamicType);

  return false;
}

// ─── 0xE3 jumpifhasnohp ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifhasnohp. 6 bytes. */
function Cmd_jumpifhasnohp(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const jumpPtr = readWord(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  if (gBattleMons[active].hp === 0) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau8Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x42] = Cmd_jumpiftype2;
  commands[0x6F] = Cmd_makevisible;
  commands[0x82] = Cmd_jumpifnotfirstturn;
  commands[0xC1] = Cmd_hiddenpowercalc;
  commands[0xE3] = Cmd_jumpifhasnohp;
}

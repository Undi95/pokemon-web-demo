/**
 * battle/cmd-niveau-14.ts — Phase 1 Niveau 14 (turn/action management) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x57 endlinkbattle           (1 byte — EmitEndLinkBattle stub + Mark)
 *   0xC0 recoverbasedonsunlight  (5 bytes — Synthesis/Moonlight/MorningSun, weather-based)
 *   0xCA setforcedtarget         (1 byte — Follow Me)
 *   0xD0 settaunt                (5 bytes — Taunt, 2-turn timer)
 *   0xF4 subattackerhpbydmg      (1 byte — Submission/TakeDown recoil)
 *   0xF5 removeattackerstatus1   (1 byte — Rest healing cure)
 *   0xF6 finishaction            (1 byte — set gCurrentActionFuncId = B_ACTION_FINISHED)
 *   0xF7 finishturn              (1 byte — finishaction + ActionNumber = battlersCount)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:39` (B_ACTION_FINISHED=12)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage,
  gBattleWeather, gDisableStructs,
  gSideTimers, gBattleOutcome,
  gBattlersCount, setCurrentActionFuncId, setCurrentTurnActionNumber,
  setActiveBattler,
} from './state';
import {
  B_WEATHER_SUN, GET_BATTLER_SIDE, B_COMM_TO_CONTROLLER,
} from './constants';
import {
  MarkBattlerForControllerExec, BtlController_EmitEndLinkBattle,
} from './battle-controllers';
import { GetBattlerAtPosition, B_POSITION_PLAYER_LEFT } from './util';

// ─── B_ACTION_FINISHED (battle.h:39) — 1:1 décomp ──────────────────────────
const B_ACTION_FINISHED = 12;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** MVP `WEATHER_HAS_EFFECT` — true sauf Cloud Nine / Air Lock on field. Pour
 *  MVP, on assume toujours true (= les abilities pas implémentées). */
function _weatherHasEffect(): boolean { return true; }

// ─── 0x57 endlinkbattle ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_endlinkbattle. 1 byte. */
function Cmd_endlinkbattle(_ctx: BattleScriptContext): boolean {
  const active = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(active);
  BtlController_EmitEndLinkBattle(B_COMM_TO_CONTROLLER, gBattleOutcome);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0xC0 recoverbasedonsunlight ───────────────────────────────────────────

/** 1:1 décomp Cmd_recoverbasedonsunlight. 5 bytes (u32 fail jump si full HP). */
function Cmd_recoverbasedonsunlight(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : `gBattlerTarget = gBattlerAttacker;` (= self-target).
  setBattlerTarget(gBattlerAttacker);
  if (gBattleMons[gBattlerAttacker].hp === gBattleMons[gBattlerAttacker].maxHP) {
    ctx.scriptPtr = failJump;
    return false;
  }
  let dmg: number;
  if (gBattleWeather === 0 || !_weatherHasEffect()) {
    dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 2);
  } else if (gBattleWeather & B_WEATHER_SUN) {
    dmg = Math.floor(20 * gBattleMons[gBattlerAttacker].maxHP / 30);
  } else {
    dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 4);
  }
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(-dmg);
  return false;
}

// ─── 0xCA setforcedtarget ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setforcedtarget. 1 byte. */
function Cmd_setforcedtarget(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  gSideTimers[side].followmeTimer = 1;
  gSideTimers[side].followmeTarget = gBattlerAttacker;
  return false;
}

// ─── 0xD0 settaunt ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_settaunt. 5 bytes (u32 fail jump si déjà tauntTimer). */
function Cmd_settaunt(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gDisableStructs[gBattlerTarget].tauntTimer === 0) {
    gDisableStructs[gBattlerTarget].tauntTimer = 2;
    gDisableStructs[gBattlerTarget].tauntTimer2 = 2;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xF4 subattackerhpbydmg ───────────────────────────────────────────────

/** 1:1 décomp Cmd_subattackerhpbydmg. 1 byte. */
function Cmd_subattackerhpbydmg(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].hp -= gBattleMoveDamage;
  return false;
}

// ─── 0xF5 removeattackerstatus1 ────────────────────────────────────────────

/** 1:1 décomp Cmd_removeattackerstatus1. 1 byte. */
function Cmd_removeattackerstatus1(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status1 = 0;
  return false;
}

// ─── 0xF6 finishaction ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_finishaction. Set gCurrentActionFuncId = B_ACTION_FINISHED.
 *  Décomp : main battle loop voit le flag et break le script (= ne re-call
 *  pas runBattleScript). Notre équivalent : set scriptPtr = -1 (= script done),
 *  return true (= paused = signal "fin"). Sans ça : stayOnOpcode infinite
 *  loop (= main battle loop pas wired chez nous). */
function Cmd_finishaction(ctx: BattleScriptContext): boolean {
  setCurrentActionFuncId(B_ACTION_FINISHED);
  ctx.scriptPtr = -1;
  return true;
}

// ─── 0xF7 finishturn ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_finishturn. Set gCurrentActionFuncId + gCurrentTurnActionNumber.
 *  Idem finishaction : main battle loop break. Chez nous : scriptPtr = -1. */
function Cmd_finishturn(ctx: BattleScriptContext): boolean {
  setCurrentActionFuncId(B_ACTION_FINISHED);
  setCurrentTurnActionNumber(gBattlersCount);
  ctx.scriptPtr = -1;
  return true;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau14Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x57] = Cmd_endlinkbattle;
  commands[0xC0] = Cmd_recoverbasedonsunlight;
  commands[0xCA] = Cmd_setforcedtarget;
  commands[0xD0] = Cmd_settaunt;
  commands[0xF4] = Cmd_subattackerhpbydmg;
  commands[0xF5] = Cmd_removeattackerstatus1;
  commands[0xF6] = Cmd_finishaction;
  commands[0xF7] = Cmd_finishturn;
}

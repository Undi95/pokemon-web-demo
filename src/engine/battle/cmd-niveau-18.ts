/**
 * battle/cmd-niveau-18.ts — Phase 1 Niveau 18 (status anims + abilities + weather) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x64 statusanimation         (2 bytes — STATUS1 sprite anim)
 *   0x65 status2animation        (6 bytes — STATUS2 sprite anim)
 *   0x66 chosenstatusanimation   (7 bytes — explicit status anim)
 *   0xD3 trycopyability          (5 bytes — Role Play)
 *   0xDA tryswapabilities        (5 bytes — Skill Swap)
 *   0xE9 setweatherballtype      (1 byte  — Weather Ball type swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  gBattleScripting, gMoveResultFlags,
  gStatuses3, gDisableStructs,
  gBattleControllerExecFlags, gHitMarker,
  gBattleWeather, setActiveBattler,
  gLastUsedAbility, setLastUsedAbility,
  setDynamicMoveType,
} from './state';
import {
  STATUS3_SEMI_INVULNERABLE,
  HITMARKER_NO_ANIMATIONS,
  ABILITY_NONE, ABILITY_WONDER_GUARD,
  MOVE_RESULT_NO_EFFECT,
  B_WEATHER_ANY, B_WEATHER_RAIN, B_WEATHER_SANDSTORM, B_WEATHER_SUN, B_WEATHER_HAIL,
  TYPE_WATER, TYPE_ROCK, TYPE_FIRE, TYPE_ICE, TYPE_NORMAL,
  F_DYNAMIC_TYPE_SET, B_COMM_TO_CONTROLLER,
} from './constants';
import {
  BtlController_EmitStatusAnimation, MarkBattlerForControllerExec,
} from './battle-controllers';
import { getBattlerForBattleScript } from './util';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** MVP `WEATHER_HAS_EFFECT` — true sauf Cloud Nine / Air Lock on field. */
function _weatherHasEffect(): boolean { return true; }

// ─── 0x64 statusanimation ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_statusanimation. 2 bytes (u8 battler arg). */
function Cmd_statusanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, false, gBattleMons[active].status1);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0x65 status2animation ────────────────────────────────────────────────

/** 1:1 décomp Cmd_status2animation. 6 bytes (u8 battler + u32 wantedToAnimate mask). */
function Cmd_status2animation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const wantedToAnimate = readWord(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, true, gBattleMons[active].status2 & wantedToAnimate);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0x66 chosenstatusanimation ───────────────────────────────────────────

/** 1:1 décomp Cmd_chosenstatusanimation. 7 bytes (u8 battler + u8 isStatus2 + u32 status). */
function Cmd_chosenstatusanimation(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const isStatus2Byte = readByte(ctx);
  const wantedStatus = readWord(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  if (!(gStatuses3[active] & STATUS3_SEMI_INVULNERABLE)
      && gDisableStructs[active].substituteHP === 0
      && !(gHitMarker & HITMARKER_NO_ANIMATIONS)) {
    BtlController_EmitStatusAnimation(B_COMM_TO_CONTROLLER, isStatus2Byte !== 0, wantedStatus);
    MarkBattlerForControllerExec(active);
  }
  return false;
}

// ─── 0xD3 trycopyability ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_trycopyability. 5 bytes. Role Play. */
function Cmd_trycopyability(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].ability !== ABILITY_NONE
      && gBattleMons[gBattlerTarget].ability !== ABILITY_WONDER_GUARD) {
    gBattleMons[gBattlerAttacker].ability = gBattleMons[gBattlerTarget].ability;
    setLastUsedAbility(gBattleMons[gBattlerTarget].ability);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xDA tryswapabilities ────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryswapabilities. 5 bytes. Skill Swap. */
function Cmd_tryswapabilities(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];
  if ((atk.ability === ABILITY_NONE && tgt.ability === ABILITY_NONE)
      || atk.ability === ABILITY_WONDER_GUARD
      || tgt.ability === ABILITY_WONDER_GUARD
      || (gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const abilityAtk = atk.ability;
  atk.ability = tgt.ability;
  tgt.ability = abilityAtk;
  return false;
}

// ─── 0xE9 setweatherballtype ──────────────────────────────────────────────

/** 1:1 décomp Cmd_setweatherballtype. 1 byte. */
function Cmd_setweatherballtype(_ctx: BattleScriptContext): boolean {
  if (_weatherHasEffect()) {
    if (gBattleWeather & B_WEATHER_ANY) {
      gBattleScripting.dmgMultiplier = 2;
    }
    let dynType: number;
    if (gBattleWeather & B_WEATHER_RAIN) {
      dynType = TYPE_WATER | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_SANDSTORM) {
      dynType = TYPE_ROCK | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_SUN) {
      dynType = TYPE_FIRE | F_DYNAMIC_TYPE_SET;
    } else if (gBattleWeather & B_WEATHER_HAIL) {
      dynType = TYPE_ICE | F_DYNAMIC_TYPE_SET;
    } else {
      dynType = TYPE_NORMAL | F_DYNAMIC_TYPE_SET;
    }
    setDynamicMoveType(dynType);
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau18Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x64] = Cmd_statusanimation;
  commands[0x65] = Cmd_status2animation;
  commands[0x66] = Cmd_chosenstatusanimation;
  commands[0xD3] = Cmd_trycopyability;
  commands[0xDA] = Cmd_tryswapabilities;
  commands[0xE9] = Cmd_setweatherballtype;
}

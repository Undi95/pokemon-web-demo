/**
 * battle/cmd-niveau-10.ts — Phase 1 Niveau 10 (weather + side status + charge) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x70 recordlastability   (2 bytes — RecordAbilityBattle(active, gLastUsedAbility))
 *   0x7D setrain             (1 byte — set B_WEATHER_RAIN_TEMPORARY + 5 turns)
 *   0x7E setreflect          (1 byte — set SIDE_STATUS_REFLECT + 5 turns)
 *   0x92 setlightscreen      (1 byte — set SIDE_STATUS_LIGHTSCREEN + 5 turns)
 *   0x95 setsandstorm        (1 byte — set B_WEATHER_SANDSTORM_TEMPORARY + 5 turns)
 *   0x99 setmist             (1 byte — set SIDE_STATUS_MIST + 5 turns)
 *   0xB8 setsafeguard        (1 byte — set SIDE_STATUS_SAFEGUARD + 5 turns)
 *   0xBB setsunny            (1 byte — set B_WEATHER_SUN_TEMPORARY + 5 turns)
 *   0xC8 sethail             (1 byte — set B_WEATHER_HAIL_TEMPORARY + 5 turns)
 *   0xCB setcharge           (1 byte — set STATUS3_CHARGED_UP + chargeTimer=2)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/battle.h:418-432` (struct SideTimer)
 *   - `decomps/pokeemeraude/include/battle.h:401-413` (struct WishFutureKnock)
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte } from './script-interpreter';
import {
  gBattleWeather, setBattleWeather,
  gBattlerAttacker, gSideStatuses, setSideStatus,
  gSideTimers, gWishFutureKnock,
  gMoveResultFlags, setMoveResultFlags, gBattleCommunication,
  gStatuses3, gDisableStructs,
  gBattleTypeFlags, gLastUsedAbility,
  setActiveBattler,
} from './state';
import {
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_TEMPORARY,
  B_WEATHER_SUN, B_WEATHER_SUN_TEMPORARY,
  B_WEATHER_HAIL, B_WEATHER_HAIL_TEMPORARY,
  SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN, SIDE_STATUS_MIST,
  SIDE_STATUS_SAFEGUARD,
  STATUS3_CHARGED_UP,
  MOVE_RESULT_MISSED, MOVE_RESULT_FAILED,
  MULTISTRING_CHOOSER,
  B_MSG_STARTED_RAIN, B_MSG_STARTED_SANDSTORM, B_MSG_STARTED_SUNLIGHT,
  B_MSG_STARTED_HAIL, B_MSG_WEATHER_FAILED,
  B_MSG_SIDE_STATUS_FAILED, B_MSG_SET_REFLECT_SINGLE, B_MSG_SET_REFLECT_DOUBLE,
  B_MSG_SET_LIGHTSCREEN_SINGLE, B_MSG_SET_LIGHTSCREEN_DOUBLE,
  B_MSG_SET_SAFEGUARD, B_MSG_SET_MIST, B_MSG_MIST_FAILED,
  BATTLE_TYPE_DOUBLE,
  GET_BATTLER_SIDE,
} from './constants';
import { getBattlerForBattleScript } from './util';

// ─── 0x70 recordlastability ────────────────────────────────────────────────

/** 1:1 décomp Cmd_recordlastability. 2 bytes (1-byte battler arg).
 *  Note : décomp a un BUGFIX qui change l'advance de +1 à +2 ; on suit le
 *  fix (= 2 bytes au total). */
function Cmd_recordlastability(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const active = getBattlerForBattleScript(battlerArg);
  setActiveBattler(active);
  _recordAbilityBattle(active, gLastUsedAbility);
  return false;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts (= AI tracking module).
import { RecordAbilityBattle as _recordAbilityBattleFull } from './util';
function _recordAbilityBattle(battlerId: number, ability: number): void {
  _recordAbilityBattleFull(battlerId, ability);
}

// ─── 0x7D setrain ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setrain. 1 byte. */
function Cmd_setrain(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_RAIN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_RAIN_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_RAIN;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0x7E setreflect ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setreflect. 1 byte. */
function Cmd_setreflect(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_REFLECT) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_REFLECT);
    gSideTimers[side].reflectTimer = 5;
    gSideTimers[side].reflectBattlerId = gBattlerAttacker;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && _countAliveMonsAtkSide() === 2) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_REFLECT_DOUBLE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_REFLECT_SINGLE;
    }
  }
  return false;
}

// ─── 0x92 setlightscreen ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_setlightscreen. 1 byte. */
function Cmd_setlightscreen(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_LIGHTSCREEN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_LIGHTSCREEN);
    gSideTimers[side].lightscreenTimer = 5;
    gSideTimers[side].lightscreenBattlerId = gBattlerAttacker;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && _countAliveMonsAtkSide() === 2) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_LIGHTSCREEN_DOUBLE;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_LIGHTSCREEN_SINGLE;
    }
  }
  return false;
}

// ─── 0x95 setsandstorm ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsandstorm. 1 byte. */
function Cmd_setsandstorm(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_SANDSTORM) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_SANDSTORM_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_SANDSTORM;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0x99 setmist ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setmist. 1 byte. */
function Cmd_setmist(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideTimers[side].mistTimer) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_MIST_FAILED;
  } else {
    gSideTimers[side].mistTimer = 5;
    gSideTimers[side].mistBattlerId = gBattlerAttacker;
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_MIST);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_MIST;
  }
  return false;
}

// ─── 0xB8 setsafeguard ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsafeguard. 1 byte. */
function Cmd_setsafeguard(_ctx: BattleScriptContext): boolean {
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_SAFEGUARD) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SIDE_STATUS_FAILED;
  } else {
    setSideStatus(side, gSideStatuses[side] | SIDE_STATUS_SAFEGUARD);
    gSideTimers[side].safeguardTimer = 5;
    gSideTimers[side].safeguardBattlerId = gBattlerAttacker;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SET_SAFEGUARD;
  }
  return false;
}

// ─── 0xBB setsunny ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setsunny. 1 byte. */
function Cmd_setsunny(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_SUN) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_SUN_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_SUNLIGHT;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0xC8 sethail ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_sethail. 1 byte. */
function Cmd_sethail(_ctx: BattleScriptContext): boolean {
  if (gBattleWeather & B_WEATHER_HAIL) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEATHER_FAILED;
  } else {
    setBattleWeather(B_WEATHER_HAIL_TEMPORARY);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STARTED_HAIL;
    gWishFutureKnock.weatherDuration = 5;
  }
  return false;
}

// ─── 0xCB setcharge ────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setcharge. 1 byte. */
function Cmd_setcharge(_ctx: BattleScriptContext): boolean {
  gStatuses3[gBattlerAttacker] |= STATUS3_CHARGED_UP;
  gDisableStructs[gBattlerAttacker].chargeTimer = 2;
  gDisableStructs[gBattlerAttacker].chargeTimerStartValue = 2;
  return false;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Partial 1:1 décomp `CountAliveMonsInBattle(BATTLE_ALIVE_ATK_SIDE)`. Pour
 *  single battle MVP, retourne 1 (= attacker seul). Pour vraies doubles
 *  battles, faudra compter les 2 battlers du côté attacker actifs (hp > 0). */
function _countAliveMonsAtkSide(): number {
  // TODO porter check sur les 2 battlers de l'atk side en doubles battles.
  return 1;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau10Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x70] = Cmd_recordlastability;
  commands[0x7D] = Cmd_setrain;
  commands[0x7E] = Cmd_setreflect;
  commands[0x92] = Cmd_setlightscreen;
  commands[0x95] = Cmd_setsandstorm;
  commands[0x99] = Cmd_setmist;
  commands[0xB8] = Cmd_setsafeguard;
  commands[0xBB] = Cmd_setsunny;
  commands[0xC8] = Cmd_sethail;
  commands[0xCB] = Cmd_setcharge;
}

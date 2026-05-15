/**
 * battle/cmd-niveau-15.ts — Phase 1 Niveau 15 (protect / sport / environment) — 10 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x40 jumpifaffectedbyprotect    (5 bytes — DEFENDER_IS_PROTECTED + JumpIfMoveFailed)
 *   0xC2 selectfirstvalidtarget     (1 byte  — pick non-absent non-self battler)
 *   0xCF jumpifnodamage             (5 bytes — check gProtectStructs.physicalDmg/specialDmg)
 *   0xD1 trysethelpinghand          (5 bytes — set partner.helpingHand)
 *   0xD5 trysetroots                (5 bytes — set STATUS3_ROOTED)
 *   0xD6 doubledamagedealtifdamaged (1 byte  — Counter / MirrorCoat double-up)
 *   0xDF trysetmagiccoat            (5 bytes — set gProtectStructs.bounceMove)
 *   0xE0 trysetsnatch               (5 bytes — set gProtectStructs.stealMove)
 *   0xE4 getsecretpowereffect       (1 byte  — env→MOVE_EFFECT_*)
 *   0xE8 settypebasedhalvers        (5 bytes — Mud/Water Sport STATUS3_*)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:1009 JumpIfMoveFailed`
 *   - `decomps/pokeemeraude/include/constants/battle.h:245-275 MOVE_EFFECT_*`
 *   - `decomps/pokeemeraude/include/constants/battle.h:311-320 BATTLE_ENVIRONMENT_*`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, getBattleScriptOffset } from './script-interpreter';
import {
  AbilityBattleEffects, ABILITYEFFECT_ABSORBING, consumeAbilityWantedScript,
} from './ability-battle-effects';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gCurrentMove, gMoveResultFlags, setMoveResultFlags,
  gProtectStructs, gSpecialStatuses,
  gStatuses3, gLastLandedMoves, gLastHitByType,
  gBattleCommunication, gBattleTypeFlags, gBattlersCount,
  gAbsentBattlerFlags, gCurrentTurnActionNumber,
  gBattleEnvironment,
  gHitMarker, setHitMarker,
} from './state';
import {
  MOVE_RESULT_MISSED, MOVE_RESULT_NO_EFFECT,
  MISS_TYPE, MOVE_EFFECT_BYTE, MULTISTRING_CHOOSER,
  B_MSG_PROTECTED, B_MSG_WEAKEN_ELECTRIC, B_MSG_WEAKEN_FIRE,
  FLAG_PROTECT_AFFECTED,
  STATUS3_ROOTED, STATUS3_MUDSPORT, STATUS3_WATERSPORT,
  STATUS2_DESTINY_BOND, HITMARKER_GRUDGE, HITMARKER_DESTINYBOND,
  GET_BATTLER_SIDE,
  MOVE_EFFECT_POISON, MOVE_EFFECT_SLEEP, MOVE_EFFECT_PARALYSIS,
  MOVE_EFFECT_ACC_MINUS_1, MOVE_EFFECT_DEF_MINUS_1,
  MOVE_EFFECT_ATK_MINUS_1, MOVE_EFFECT_SPD_MINUS_1,
  MOVE_EFFECT_CONFUSION, MOVE_EFFECT_FLINCH,
  BATTLE_ENVIRONMENT_GRASS, BATTLE_ENVIRONMENT_LONG_GRASS,
  BATTLE_ENVIRONMENT_SAND, BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER, BATTLE_ENVIRONMENT_POND,
  BATTLE_ENVIRONMENT_MOUNTAIN, BATTLE_ENVIRONMENT_CAVE,
  EFFECT_MUD_SPORT, BATTLE_TYPE_DOUBLE,
  BATTLE_PARTNER,
} from './constants';
import { gBattleScripting } from './state';
import { gBitTable } from './battle-controllers';
import { GetBattlerAtPosition } from './util';
import { getBattleMove } from './data/battle-moves';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `GetBattlerPosition(battler)` — read from gBattlerPositions[].
 *  Pour MVP single battle, gBattlerPositions est identity. */
function GetBattlerPosition(battler: number): number { return battler; }

/** 1:1 décomp `DEFENDER_IS_PROTECTED` macro (battle_script_commands.c:57).
 *  `((gProtectStructs[gBattlerTarget].protected) &&
 *    (gBattleMoves[gCurrentMove].flags & FLAG_PROTECT_AFFECTED))` */
function DEFENDER_IS_PROTECTED(): boolean {
  if (!gProtectStructs[gBattlerTarget].protected) return false;
  return (getBattleMove(gCurrentMove).flags & FLAG_PROTECT_AFFECTED) !== 0;
}

/** 1:1 décomp `JumpIfMoveFailed(adder, move)` (battle_script_commands.c:1009).
 *  Si MOVE_RESULT_NO_EFFECT set : clear last-landed + jump fail.
 *  Sinon : TrySetDestinyBondToHappen + AbilityBattleEffects(ABSORBING).
 *  Si ABSORBING absorbed (= return truthy), exit sans advance.
 *  Sinon advance par `adder` bytes.
 *
 *  Notre port : AbilityBattleEffects(ABILITYEFFECT_ABSORBING) pas encore porté
 *  → return 0 (= n'absorbe pas). TrySetDestinyBondToHappen importé depuis N11.
 *
 *  Ce helper est en TS un void qui mute ctx.scriptPtr. Le caller passe
 *  `failJump` déjà lu (= T1_READ_PTR(instr+1)) et le ctx.scriptPtr déjà avancé
 *  par les readWord (= équivalent du `gBattlescriptCurrInstr + adder` post-read).
 *  Donc adder=5 → on a déjà lu 1 opcode + 4 bytes failJump = ctx.scriptPtr est
 *  au bon endroit, pas d'advance supplémentaire. */
function _jumpIfMoveFailed(ctx: BattleScriptContext, failJump: number): void {
  if (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) {
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    ctx.scriptPtr = failJump;
    return;
  }
  // 1:1 décomp : TrySetDestinyBondToHappen + AbilityBattleEffects(ABSORBING).
  _trySetDestinyBondToHappen();
  // 1:1 décomp : if (AbilityBattleEffects(ABSORBING, target, 0, 0, move)) return;
  // → Volt/Water Absorb heal ou Flash Fire boost.
  const absorbEff = AbilityBattleEffects(ABILITYEFFECT_ABSORBING, gBattlerTarget, 0, 0, gCurrentMove);
  if (absorbEff !== 0) {
    const label = consumeAbilityWantedScript();
    if (label) {
      const off = getBattleScriptOffset(label);
      if (off >= 0) ctx.scriptPtr = off;
    }
    // Note : return sans advance — le helper a déjà set scriptPtr.
    return;
  }
}

/** 1:1 décomp `TrySetDestinyBondToHappen` (battle_script_commands.c:8288).
 *  Si target a DESTINY_BOND set et sides différents et !HITMARKER_GRUDGE →
 *  set HITMARKER_DESTINYBOND (= attacker mourra aussi). */
function _trySetDestinyBondToHappen(): void {
  const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
  const sideTarget = GET_BATTLER_SIDE(gBattlerTarget);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_DESTINY_BOND)
      && sideAttacker !== sideTarget
      && !(gHitMarker & HITMARKER_GRUDGE)) {
    setHitMarker(gHitMarker | HITMARKER_DESTINYBOND);
  }
}

// ─── 0x40 jumpifaffectedbyprotect ─────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifaffectedbyprotect. 5 bytes. */
function Cmd_jumpifaffectedbyprotect(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (DEFENDER_IS_PROTECTED()) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    _jumpIfMoveFailed(ctx, failJump);
    gBattleCommunication[MISS_TYPE] = B_MSG_PROTECTED;
  }
  // Else : déjà au bon offset (= ctx.scriptPtr a avancé de 5 bytes : 1 opcode + 4 readWord).
  return false;
}

// ─── 0xC2 selectfirstvalidtarget ──────────────────────────────────────────

/** 1:1 décomp Cmd_selectfirstvalidtarget. 1 byte. */
function Cmd_selectfirstvalidtarget(_ctx: BattleScriptContext): boolean {
  let target = 0;
  for (target = 0; target < gBattlersCount; target++) {
    if (target === gBattlerAttacker) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  return false;
}

// ─── 0xCF jumpifnodamage ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnodamage. 5 bytes. */
function Cmd_jumpifnodamage(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const ps = gProtectStructs[gBattlerAttacker];
  if (ps.physicalDmg || ps.specialDmg) {
    // Damage was dealt : continue (= déjà avancé par readWord).
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xD1 trysethelpinghand ───────────────────────────────────────────────

/** 1:1 décomp Cmd_trysethelpinghand. 5 bytes. */
function Cmd_trysethelpinghand(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
  setBattlerTarget(partner);
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
      && !(gAbsentBattlerFlags & gBitTable[partner])
      && !gProtectStructs[gBattlerAttacker].helpingHand
      && !gProtectStructs[partner].helpingHand) {
    gProtectStructs[partner].helpingHand = 1;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xD5 trysetroots ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetroots. 5 bytes. */
function Cmd_trysetroots(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_ROOTED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerAttacker] |= STATUS3_ROOTED;
  return false;
}

// ─── 0xD6 doubledamagedealtifdamaged ──────────────────────────────────────

/** 1:1 décomp Cmd_doubledamagedealtifdamaged. 1 byte.
 *  Counter / Mirror Coat double damage si target hit attacker ce turn. */
function Cmd_doubledamagedealtifdamaged(_ctx: BattleScriptContext): boolean {
  const ps = gProtectStructs[gBattlerAttacker];
  if ((ps.physicalDmg !== 0 && ps.physicalBattlerId === gBattlerTarget)
      || (ps.specialDmg !== 0 && ps.specialBattlerId === gBattlerTarget)) {
    gBattleScripting.dmgMultiplier = 2;
  }
  return false;
}

// ─── 0xDF trysetmagiccoat ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetmagiccoat. 5 bytes. */
function Cmd_trysetmagiccoat(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setBattlerTarget(gBattlerAttacker);
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    // Dernier à agir ce turn → Magic Coat fail (no incoming move to bounce).
    ctx.scriptPtr = failJump;
    return false;
  }
  gProtectStructs[gBattlerAttacker].bounceMove = 1;
  return false;
}

// ─── 0xE0 trysetsnatch ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetsnatch. 5 bytes. */
function Cmd_trysetsnatch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gProtectStructs[gBattlerAttacker].stealMove = 1;
  return false;
}

// ─── 0xE4 getsecretpowereffect ────────────────────────────────────────────

/** 1:1 décomp Cmd_getsecretpowereffect. 1 byte.
 *  Set gBattleCommunication[MOVE_EFFECT_BYTE] selon gBattleEnvironment. */
function Cmd_getsecretpowereffect(_ctx: BattleScriptContext): boolean {
  let effect: number;
  switch (gBattleEnvironment) {
    case BATTLE_ENVIRONMENT_GRASS:      effect = MOVE_EFFECT_POISON; break;
    case BATTLE_ENVIRONMENT_LONG_GRASS: effect = MOVE_EFFECT_SLEEP; break;
    case BATTLE_ENVIRONMENT_SAND:       effect = MOVE_EFFECT_ACC_MINUS_1; break;
    case BATTLE_ENVIRONMENT_UNDERWATER: effect = MOVE_EFFECT_DEF_MINUS_1; break;
    case BATTLE_ENVIRONMENT_WATER:      effect = MOVE_EFFECT_ATK_MINUS_1; break;
    case BATTLE_ENVIRONMENT_POND:       effect = MOVE_EFFECT_SPD_MINUS_1; break;
    case BATTLE_ENVIRONMENT_MOUNTAIN:   effect = MOVE_EFFECT_CONFUSION; break;
    case BATTLE_ENVIRONMENT_CAVE:       effect = MOVE_EFFECT_FLINCH; break;
    default:                            effect = MOVE_EFFECT_PARALYSIS; break;
  }
  gBattleCommunication[MOVE_EFFECT_BYTE] = effect;
  return false;
}

// ─── 0xE8 settypebasedhalvers ─────────────────────────────────────────────

/** 1:1 décomp Cmd_settypebasedhalvers. 5 bytes.
 *  Mud Sport (= halve Electric) ou Water Sport (= halve Fire). */
function Cmd_settypebasedhalvers(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let worked = false;
  const move = getBattleMove(gCurrentMove);
  if (move.effect === EFFECT_MUD_SPORT) {
    if (!(gStatuses3[gBattlerAttacker] & STATUS3_MUDSPORT)) {
      gStatuses3[gBattlerAttacker] |= STATUS3_MUDSPORT;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEAKEN_ELECTRIC;
      worked = true;
    }
  } else {
    // EFFECT_WATER_SPORT
    if (!(gStatuses3[gBattlerAttacker] & STATUS3_WATERSPORT)) {
      gStatuses3[gBattlerAttacker] |= STATUS3_WATERSPORT;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WEAKEN_FIRE;
      worked = true;
    }
  }
  if (worked) return false;
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau15Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x40] = Cmd_jumpifaffectedbyprotect;
  commands[0xC2] = Cmd_selectfirstvalidtarget;
  commands[0xCF] = Cmd_jumpifnodamage;
  commands[0xD1] = Cmd_trysethelpinghand;
  commands[0xD5] = Cmd_trysetroots;
  commands[0xD6] = Cmd_doubledamagedealtifdamaged;
  commands[0xDF] = Cmd_trysetmagiccoat;
  commands[0xE0] = Cmd_trysetsnatch;
  commands[0xE4] = Cmd_getsecretpowereffect;
  commands[0xE8] = Cmd_settypebasedhalvers;
}

/**
 * battle/cmd-niveau-22.ts — Phase 1 Niveau 22 (cleanup/stockpile/dmg adjust) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x08 adjustnormaldamage2     (1 byte  — Endure/Focus Band post-random)
 *   0x25 movevaluescleanup       (1 byte  — reset move-cycle state)
 *   0x4A typecalc2               (1 byte  — Foresight typecalc loop)
 *   0x69 adjustsetdamage         (1 byte  — Set dmg with Endure/Focus Band/FalseSwipe)
 *   0x85 stockpile               (1 byte  — Stockpile counter+1)
 *   0x86 stockpiletobasedamage   (5 bytes — Spit Up dmg from counter)
 *   0x87 stockpiletohpheal       (5 bytes — Swallow heal from counter)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:3624 MoveValuesCleanUp`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage,
  gMoveResultFlags, setMoveResultFlags,
  gCurrentMove, gHitMarker, setHitMarker,
  gBattleScripting, gBattleCommunication,
  gCritMultiplier, setCritMultiplier,
  gProtectStructs, gSpecialStatuses,
  gDisableStructs,
  gSideStatuses, gSideTimers,
  gLastUsedItem, setLastUsedItem,
  gPotentialItemEffectBattler, setPotentialItemEffectBattler,
  gLastLandedMoves, gLastUsedAbility, setLastUsedAbility,
} from './state';
import {
  STATUS2_SUBSTITUTE, STATUS2_FORESIGHT,
  MOVE_RESULT_FOE_ENDURED, MOVE_RESULT_FOE_HUNG_ON,
  MOVE_RESULT_MISSED, MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE, MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_NO_EFFECT,
  HOLD_EFFECT_FOCUS_BAND,
  HITMARKER_DESTINYBOND, HITMARKER_SYNCHRONIZE_EFFECT,
  MOVE_EFFECT_BYTE, MISS_TYPE, MULTISTRING_CHOOSER,
  B_MSG_STOCKPILED, B_MSG_CANT_STOCKPILE,
  B_MSG_SWALLOW_FAILED, B_MSG_SWALLOW_FULL_HP,
  B_MSG_GROUND_MISS, B_MSG_PROTECTED, B_MSG_AVOIDED_DMG,
  EFFECT_FALSE_SWIPE,
  ABILITY_LEVITATE, ABILITY_WONDER_GUARD, TYPE_GROUND,
  GET_BATTLER_SIDE,
} from './constants';
import {
  gTypeEffectiveness, TYPE_FORESIGHT, TYPE_ENDTABLE,
  TYPE_MUL_NO_EFFECT, TYPE_MUL_NOT_EFFECTIVE, TYPE_MUL_SUPER_EFFECTIVE,
} from './data/type-effectiveness';
import { getBattleMove } from './data/battle-moves';
import { runDamagecalc } from './damage-calc';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 stub `GetItemHoldEffect` (= cf N21). */
function _getItemHoldEffect(_item: number): number { return 0; }
function _getItemHoldEffectParam(_item: number): number { return 0; }
function _recordItemEffectBattle(_b: number, _h: number): void {}
function _recordAbilityBattle(_b: number, _a: number): void {}

/** 1:1 décomp `ApplyRandomDmgMultiplier()` (battle_util.c). Multiplie damage
 *  par random 85-100%. */
function _applyRandomDmgMultiplier(): void {
  if (gBattleMoveDamage === 0) return;
  // 1:1 décomp : random 85..100/100.
  const rand = (Random() % 16) + 85;
  setBattleMoveDamage(Math.max(1, Math.floor((gBattleMoveDamage * rand) / 100)));
}

/** 1:1 décomp `MoveValuesCleanUp()` (battle_script_commands.c:3624). */
function _moveValuesCleanUp(): void {
  setMoveResultFlags(0);
  gBattleScripting.dmgMultiplier = 1;
  setCritMultiplier(1);
  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleCommunication[MISS_TYPE] = 0;
  setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
  setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
}

// ─── 0x08 adjustnormaldamage2 ─────────────────────────────────────────────

/** 1:1 décomp Cmd_adjustnormaldamage2. 1 byte. */
function Cmd_adjustnormaldamage2(_ctx: BattleScriptContext): boolean {
  _applyRandomDmgMultiplier();
  const holdEffect = _getItemHoldEffect(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam(gBattleMons[gBattlerTarget].item);
  setPotentialItemEffectBattler(gBattlerTarget);
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }
  if (!(gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE)
      && (gProtectStructs[gBattlerTarget].endured || gSpecialStatuses[gBattlerTarget].focusBanded)
      && gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
    setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
    if (gProtectStructs[gBattlerTarget].endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    }
  }
  return false;
}

// ─── 0x25 movevaluescleanup ───────────────────────────────────────────────

/** 1:1 décomp Cmd_movevaluescleanup. 1 byte. */
function Cmd_movevaluescleanup(_ctx: BattleScriptContext): boolean {
  _moveValuesCleanUp();
  return false;
}

// ─── 0x4A typecalc2 ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_typecalc2. 1 byte. Foresight-aware type calc (= no STAB,
 *  no Wonder Guard skip on power=0 check). */
function Cmd_typecalc2(_ctx: BattleScriptContext): boolean {
  let flags = 0;
  let i = 0;
  const moveType = getBattleMove(gCurrentMove).type;
  const tgt = gBattleMons[gBattlerTarget];

  if (tgt.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    setLastUsedAbility(tgt.ability);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
    gLastLandedMoves[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_GROUND_MISS;
    _recordAbilityBattle(gBattlerTarget, gLastUsedAbility);
  } else {
    // 1:1 décomp : itère gTypeEffectiveness chart.
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (tgt.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      }
      if (gTypeEffectiveness[i] === moveType) {
        // 1er check : types[0].
        if (gTypeEffectiveness[i + 1] === tgt.type1) {
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_NO_EFFECT) {
            setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_DOESNT_AFFECT_FOE);
            break;
          }
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_NOT_EFFECTIVE) {
            flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
          }
          if (gTypeEffectiveness[i + 2] === TYPE_MUL_SUPER_EFFECTIVE) {
            flags |= MOVE_RESULT_SUPER_EFFECTIVE;
          }
        }
        // 2e check : types[1] (si différent de types[0]).
        if (gTypeEffectiveness[i + 1] === tgt.type2) {
          if (tgt.type1 !== tgt.type2 && gTypeEffectiveness[i + 2] === TYPE_MUL_NO_EFFECT) {
            setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_DOESNT_AFFECT_FOE);
            break;
          }
          if (gTypeEffectiveness[i + 1] === tgt.type2
              && tgt.type1 !== tgt.type2
              && gTypeEffectiveness[i + 2] === TYPE_MUL_NOT_EFFECTIVE) {
            flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
          }
          if (gTypeEffectiveness[i + 1] === tgt.type2
              && tgt.type1 !== tgt.type2
              && gTypeEffectiveness[i + 2] === TYPE_MUL_SUPER_EFFECTIVE) {
            flags |= MOVE_RESULT_SUPER_EFFECTIVE;
          }
        }
      }
      i += 3;
    }
  }

  // 1:1 décomp Wonder Guard check.
  // AttacksThisTurn check = 2 (= 2nd or later turn for Solar Beam/SkyAttack).
  // Pour MVP, on simule AttacksThisTurn(attacker, move) = 2 (= always treated
  // as ready).
  if (tgt.ability === ABILITY_WONDER_GUARD
      && !(flags & MOVE_RESULT_NO_EFFECT)
      && (!(flags & MOVE_RESULT_SUPER_EFFECTIVE)
          || ((flags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
              === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
      && getBattleMove(gCurrentMove).power) {
    setLastUsedAbility(ABILITY_WONDER_GUARD);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_AVOIDED_DMG;
    _recordAbilityBattle(gBattlerTarget, gLastUsedAbility);
  }
  if (gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE) {
    gProtectStructs[gBattlerAttacker].targetNotAffected = 1;
  }
  // Note : décomp utilise `flags` pour Wonder Guard mais set gMoveResultFlags
  // dans no-effect path. On reprend gMoveResultFlags directement quand le set
  // est synchrone. flags local n'est pas appliqué à gMoveResultFlags ici
  // (= 1:1 décomp ne le fait pas non plus ! les flags ne servent qu'au check
  // Wonder Guard).
  return false;
}

// ─── 0x69 adjustsetdamage ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_adjustsetdamage. 1 byte. Endure / Focus Band / False Swipe. */
function Cmd_adjustsetdamage(_ctx: BattleScriptContext): boolean {
  const holdEffect = _getItemHoldEffect(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam(gBattleMons[gBattlerTarget].item);
  setPotentialItemEffectBattler(gBattlerTarget);
  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }
  const moveEffect = getBattleMove(gCurrentMove).effect;
  if (!(gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE)
      && (moveEffect === EFFECT_FALSE_SWIPE
          || gProtectStructs[gBattlerTarget].endured
          || gSpecialStatuses[gBattlerTarget].focusBanded)
      && gBattleMons[gBattlerTarget].hp <= gBattleMoveDamage) {
    setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
    if (gProtectStructs[gBattlerTarget].endured) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    }
  }
  return false;
}

// ─── 0x85 stockpile ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_stockpile. 1 byte. */
function Cmd_stockpile(_ctx: BattleScriptContext): boolean {
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 3) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_STOCKPILE;
    return false;
  }
  gDisableStructs[gBattlerAttacker].stockpileCounter++;
  // PREPARE_BYTE_NUMBER_BUFFER : TODO porter text placeholder.
  gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_STOCKPILED;
  return false;
}

// ─── 0x86 stockpiletobasedamage ───────────────────────────────────────────

/** 1:1 décomp Cmd_stockpiletobasedamage. 5 bytes (u32 fail jump). Spit Up. */
function Cmd_stockpiletobasedamage(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 0) {
    ctx.scriptPtr = jumpPtr;
    return false;
  }
  if (gBattleCommunication[MISS_TYPE] !== B_MSG_PROTECTED) {
    // 1:1 décomp : CalculateBaseDamage + counter multiplier + HelpingHand.
    const baseDmg = runDamagecalc(
      gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)],
      0,  // dynamicBasePower
      0,  // dynamicMoveType
    );
    let dmg = baseDmg * gDisableStructs[gBattlerAttacker].stockpileCounter;
    gBattleScripting.animTurn = gDisableStructs[gBattlerAttacker].stockpileCounter;
    if (gProtectStructs[gBattlerAttacker].helpingHand) {
      dmg = Math.floor((dmg * 15) / 10);
    }
    setBattleMoveDamage(dmg);
  }
  gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
  return false;
}

// ─── 0x87 stockpiletohpheal ───────────────────────────────────────────────

/** 1:1 décomp Cmd_stockpiletohpheal. 5 bytes (u32 fail jump). Swallow. */
function Cmd_stockpiletohpheal(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  if (gDisableStructs[gBattlerAttacker].stockpileCounter === 0) {
    ctx.scriptPtr = jumpPtr;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SWALLOW_FAILED;
    return false;
  }
  if (gBattleMons[gBattlerAttacker].maxHP === gBattleMons[gBattlerAttacker].hp) {
    gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
    ctx.scriptPtr = jumpPtr;
    setBattlerTarget(gBattlerAttacker);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SWALLOW_FULL_HP;
    return false;
  }
  // 1:1 décomp : 1<<(3-counter) divisor. counter=1 → 1/4, =2 → 1/2, =3 → 1/1.
  const divisor = 1 << (3 - gDisableStructs[gBattlerAttacker].stockpileCounter);
  let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / divisor);
  if (dmg === 0) dmg = 1;
  dmg *= -1;
  setBattleMoveDamage(dmg);
  gBattleScripting.animTurn = gDisableStructs[gBattlerAttacker].stockpileCounter;
  gDisableStructs[gBattlerAttacker].stockpileCounter = 0;
  setBattlerTarget(gBattlerAttacker);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau22Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x08] = Cmd_adjustnormaldamage2;
  commands[0x25] = Cmd_movevaluescleanup;
  commands[0x4A] = Cmd_typecalc2;
  commands[0x69] = Cmd_adjustsetdamage;
  commands[0x85] = Cmd_stockpile;
  commands[0x86] = Cmd_stockpiletobasedamage;
  commands[0x87] = Cmd_stockpiletohpheal;
}

// Suppress unused warnings.
void gSideTimers;
void gCritMultiplier;
void gPotentialItemEffectBattler;

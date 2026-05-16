/**
 * battle/handle-action.ts — Port 1:1 décomp `HandleAction_*` action dispatchers.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:78-...`
 * Voir aussi `battle_main.c:538-548` pour le table dispatch.
 *
 * Action handlers :
 *   B_ACTION_USE_MOVE  → HandleAction_UseMove    (~210l, full port)
 *   B_ACTION_USE_ITEM  → HandleAction_UseItem    (= STUB, item battle UI)
 *   B_ACTION_SWITCH    → HandleAction_Switch     (= STUB minimal)
 *   B_ACTION_RUN       → HandleAction_Run        (= STUB minimal)
 *   B_ACTION_EXEC_SCRIPT → HandleAction_RunBattleScript (= no-op, script déjà running)
 *
 * Le caller (= battle main loop) :
 *  1. Set gCurrentActionFuncId = B_ACTION_USE_MOVE/SWITCH/etc. depuis action queue.
 *  2. Call le dispatch handler approprié (= handleActionTable[funcId]).
 *  3. Handler set gBattlescriptCurrInstr = label approprié + gCurrentActionFuncId = B_ACTION_EXEC_SCRIPT.
 *  4. Battle loop run le script via runBattleScript.
 */

import {
  gBattleMons, gBattlerAttacker, setBattlerAttacker,
  gBattlerTarget, setBattlerTarget,
  gActiveBattler, setActiveBattler,
  gCurrentMove, setCurrentMove,
  gChosenMove, setChosenMove,
  gCurrMovePos, setCurrMovePos,
  gChosenMovePos, setChosenMovePos,
  gChosenMoveByBattler,
  gBattlerByTurnOrder, gCurrentTurnActionNumber,
  gBattleTypeFlags, gBattlersCount,
  gAbsentBattlerFlags,
  gBattleStruct, gBattleResults,
  setCritMultiplier, setMultiHitCounter, setMoveResultFlags,
  gHitMarker, setHitMarker,
  gBattleScripting,
  gBattleCommunication,
  gLockedMoves,
  gProtectStructs, gDisableStructs, gSpecialStatuses,
  gSideTimers,
  setCurrentActionFuncId,
  setLastUsedAbility,
} from './state';
import {
  STATUS2_MULTIPLETURNS, STATUS2_RECHARGE,
  HITMARKER_NO_PPDEDUCT,
  MOVE_NONE, MOVE_STRUGGLE,
  MOVE_TARGET_SELECTED, MOVE_TARGET_USER, MOVE_TARGET_RANDOM,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE, BATTLE_TYPE_ARENA,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
  BATTLE_OPPOSITE,
  ABILITY_LIGHTNING_ROD,
  TYPE_ELECTRIC,
  NO_TARGET_OVERRIDE,
  B_ACTION_FINISHED, B_ACTION_EXEC_SCRIPT,
  MULTISTRING_CHOOSER,
} from './constants';
import { gBitTable } from './battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
  RecordAbilityBattle, ClearFuryCutterDestinyBondGrudge,
} from './util';
import { getBattleMove } from './data/battle-moves';
import { getMoveEffectScriptOffset, getBattleScriptOffset } from './script-interpreter';
import type { BattleScriptContext } from './script-interpreter';
import { Random } from '../random';

const B_MSG_INCAPABLE_OF_POWER = 0;  // STUB Battle Palace

/** 1:1 stub `BATTLE_PARTNER(id)` — défini déjà dans constants mais we inline. */
function _BATTLE_PARTNER(id: number): number { return id ^ 2 /* BIT_FLANK */; }

/** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Retourne l'index
 *  i tel que `gBattlerByTurnOrder[i] === battler`. */
function _GetBattlerTurnOrderNum(battler: number): number {
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattlerByTurnOrder[i] === battler) return i;
  }
  return 0;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
const _RecordAbilityBattle = RecordAbilityBattle;

/** Resolve gBattleStruct.moveTarget[battler] — pour MVP utilise gBattlerTarget
 *  inchangé (= state actuel). TODO porter table dédiée. */
function _getMoveTargetForBattler(_battler: number): number {
  return gBattlerTarget;
}

function _setMoveTargetForBattler(_battler: number, _target: number): void {
  // STUB : pas de moveTarget array séparé. La cible est set via gBattlerTarget.
  setBattlerTarget(_target);
}

/** 1:1 décomp `GetMoveTarget` (battle_util.c:3811). Re-exporté depuis
 *  cmd-niveau-34 (= déjà porté). Pour éviter circular import, inline ici. */
function _GetMoveTarget(move: number, setTarget: number): number {
  let targetBattler = 0;
  let moveTarget: number;
  let side: number;

  if (setTarget !== NO_TARGET_OVERRIDE) {
    moveTarget = setTarget - 1;
  } else {
    moveTarget = getBattleMove(move).target;
  }

  switch (moveTarget) {
    case MOVE_TARGET_SELECTED: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else {
        side = GET_BATTLER_SIDE(gBattlerAttacker);
        let safetyIter = 0;
        do {
          targetBattler = Random() % gBattlersCount;
          safetyIter++;
        } while (
          (targetBattler === gBattlerAttacker
           || side === GET_BATTLER_SIDE(targetBattler)
           || (gAbsentBattlerFlags & (1 << targetBattler)))
          && safetyIter < 100
        );
      }
      break;
    }
    case MOVE_TARGET_USER:
      targetBattler = gBattlerAttacker;
      break;
    default:
      // MOVE_TARGET_BOTH, FOES_AND_ALLY, OPPONENTS_FIELD, RANDOM, etc.
      targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      if (gAbsentBattlerFlags & (1 << targetBattler)) {
        targetBattler ^= 2;
      }
      break;
  }
  return targetBattler;
}

/** 1:1 décomp `HandleAction_UseMove` (battle_util.c:78-292). */
export function HandleAction_UseMove(ctx?: BattleScriptContext): void {
  let var_ = 4;

  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  // Skip si absent.
  if (gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker]) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
    return;
  }

  // Reset combat state (= 1:1 décomp).
  setCritMultiplier(1);
  gBattleScripting.dmgMultiplier = 1;
  gBattleStruct.atkCancelerTracker = 0;
  setMoveResultFlags(0);
  setMultiHitCounter(0);
  gBattleCommunication[5 /* MISS_TYPE */] = 0;

  // 1:1 décomp : `gCurrMovePos = gChosenMovePos = gBattleStruct->chosenMovePositions[attacker]`.
  // STUB : utilise gChosenMoveByBattler comme alias (TODO porter chosenMovePositions[]).
  // Pour MVP : keep gCurrMovePos as set by action queue / UI.

  // Choose move 1:1 décomp.
  if (gProtectStructs[gBattlerAttacker].noValidMoves) {
    gProtectStructs[gBattlerAttacker].noValidMoves = 0;
    setCurrentMove(MOVE_STRUGGLE);
    setChosenMove(MOVE_STRUGGLE);
    setHitMarker(gHitMarker | HITMARKER_NO_PPDEDUCT);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(MOVE_STRUGGLE, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS
             || gBattleMons[gBattlerAttacker].status2 & STATUS2_RECHARGE) {
    setCurrentMove(gLockedMoves[gBattlerAttacker]);
    setChosenMove(gLockedMoves[gBattlerAttacker]);
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove === gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encore forces same move
    const encored = gDisableStructs[gBattlerAttacker].encoredMove;
    setCurrentMove(encored);
    setChosenMove(encored);
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(encored, NO_TARGET_OVERRIDE));
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove !== gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encored move was overwritten — reset
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    gDisableStructs[gBattlerAttacker].encoredMove = MOVE_NONE;
    gDisableStructs[gBattlerAttacker].encoredMovePos = 0;
    gDisableStructs[gBattlerAttacker].encoreTimer = 0;
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].moves[gCurrMovePos] !== gChosenMoveByBattler[gBattlerAttacker]) {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
  }

  if (gBattleMons[gBattlerAttacker].hp !== 0) {
    // 1:1 décomp `HandleAction_UseMove` (battle_util.c:165-175).
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      gBattleResults.lastUsedMovePlayer = gCurrentMove;
    } else {
      gBattleResults.lastUsedMoveOpponent = gCurrentMove;
    }
  }

  // Choose target.
  const side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[side].followmeTimer !== 0
      && getBattleMove(gCurrentMove).target === MOVE_TARGET_SELECTED
      && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gSideTimers[side].followmeTarget)
      && gBattleMons[gSideTimers[side].followmeTarget].hp !== 0) {
    setBattlerTarget(gSideTimers[side].followmeTarget);
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && gSideTimers[side].followmeTimer === 0
             && (getBattleMove(gCurrentMove).power !== 0
                 || getBattleMove(gCurrentMove).target !== MOVE_TARGET_USER)
             && gBattleMons[_getMoveTargetForBattler(gBattlerAttacker)].ability !== ABILITY_LIGHTNING_ROD
             && getBattleMove(gCurrentMove).type === TYPE_ELECTRIC) {
    // Lightning Rod redirect double battle.
    const sideAtk = GET_BATTLER_SIDE(gBattlerAttacker);
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      if (sideAtk !== GET_BATTLER_SIDE(active)
          && _getMoveTargetForBattler(gBattlerAttacker) !== active
          && gBattleMons[active].ability === ABILITY_LIGHTNING_ROD
          && _GetBattlerTurnOrderNum(active) < var_) {
        var_ = _GetBattlerTurnOrderNum(active);
      }
    }
    if (var_ === 4) {
      // Pas de Lightning Rod trouvé — pick target normal.
      if (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
            : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
        } else {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
            : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
        }
      } else {
        setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
      }
      // Absent battler redirect to partner.
      if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        } else {
          setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
          if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
            setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
          }
        }
      }
    } else {
      // Lightning Rod redirect actif.
      setActiveBattler(gBattlerByTurnOrder[var_]);
      _RecordAbilityBattle(gActiveBattler, gBattleMons[gActiveBattler].ability);
      gSpecialStatuses[gActiveBattler].lightningRodRedirected = 1;
      setBattlerTarget(gActiveBattler);
    }
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM)) {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
        : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
    } else {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
        : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
    }
    if ((gAbsentBattlerFlags & gBitTable[gBattlerTarget])
        && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
      setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
    }
  } else {
    setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
    if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
      if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
        setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
      } else {
        setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
        if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        }
      }
    }
  }

  // Battle Palace fallback (= rare cas trainer Palace).
  let scriptPtr = -1;
  if ((gBattleTypeFlags & BATTLE_TYPE_PALACE) && gProtectStructs[gBattlerAttacker].palaceUnableToUseMove) {
    if (gBattleMons[gBattlerAttacker].hp === 0) {
      setCurrentActionFuncId(B_ACTION_FINISHED);
      return;
    }
    // STUB gPalaceSelectionBattleScripts — pas porté.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_INCAPABLE_OF_POWER;
    scriptPtr = getBattleScriptOffset('BattleScript_MoveUsedLoafingAround');
  } else {
    // 1:1 décomp : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect]`.
    const moveEffect = getBattleMove(gCurrentMove).effect;
    scriptPtr = getMoveEffectScriptOffset(moveEffect);
  }

  // Battle Arena : BattleArena_AddMindPoints. STUB Battle Frontier post-Phase 1.
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    // STUB BattleArena_AddMindPoints.
    void setLastUsedAbility;
  }

  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);

  // Si ctx fourni, on set scriptPtr direct (= utilisé quand HandleAction est
  // appelé depuis le battle main loop).
  if (ctx && scriptPtr >= 0) {
    ctx.scriptPtr = scriptPtr;
  }
}

/** 1:1 décomp `HandleAction_Switch` (battle_util.c:294-310). */
export function HandleAction_Switch(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  // STUB gBattle_BG0_X/Y = 0 — BG scroll registers GBA (= no-op web canvas).
  // STUB gActionSelectionCursor / gMoveSelectionCursor — UI cursor state.
  // STUB PREPARE_MON_NICK_BUFFER (= text buffer setup MOVE_NICK pour print).
  gBattleScripting.battler = gBattlerAttacker;
  const off = getBattleScriptOffset('BattleScript_ActionSwitch');
  if (ctx && off >= 0) ctx.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  // 1:1 décomp ll.308-309 : incrémente playerSwitchesCounter (cap à 255 u8).
  if (gBattleResults.playerSwitchesCounter < 255) {
    gBattleResults.playerSwitchesCounter++;
  }
}

/** 1:1 décomp `HandleAction_UseItem` (battle_util.c:312+). STUB partial.
 *  Wirage minimal : set attacker + ClearFuryCutterDestinyBondGrudge.
 *  TODO Phase 1.4 : full item battle flow (= read gBattleBufferB[1..2] pour item ID,
 *  switch sur effect, run bytecode item-use). */
export function HandleAction_UseItem(_ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  setBattlerTarget(gBattlerAttacker);
  ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
  // TODO Phase 1.4 : full item battle flow.
  setCurrentActionFuncId(B_ACTION_FINISHED);
}

/** 1:1 décomp `HandleAction_Run` (battle_util.c:487-539). */
export function HandleAction_Run(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  if (gBattleTypeFlags & (_BATTLE_TYPE_LINK_HAR | _BATTLE_TYPE_RECORDED_LINK_HAR)) {
    // 1:1 décomp ll.491-510 : link battle run = all link battlers lose/win.
    setCurrentTurnActionNumberHAR(gBattlersCount);
    for (let i = 0; i < gBattlersCount; i++) {
      _setActiveBattlerHAR(i);
      if (GET_BATTLER_SIDE(i) === B_SIDE_PLAYER) {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_LOST = 2 ; combiné avec outcome existant via OR.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 2);
        }
      } else {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_WON = 1.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 1);
        }
      }
    }
    // OUTCOME_LINK_BATTLE_RAN = 1 << 7 = 0x80.
    // STUB gSaveBlock2Ptr.frontier.disableRecordBattle = TRUE (= Frontier post-Phase 1).
    return;
  }

  // Normal battle.
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    if (!_TryRunFromBattleHAR(gBattlerAttacker)) {
      // Failed to run away.
      ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_CANT_ESCAPE_2_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      if (ctx && off >= 0) ctx.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    }
    // Si TryRunFromBattle a réussi : il a déjà set gBattleOutcome = RAN +
    // gCurrentTurnActionNumber = gBattlersCount.
  } else {
    // Wild opponent essaie de fuir (= Roar / Whirlwind sur joueur).
    if (gBattleMons[gBattlerAttacker].status2 & (_STATUS2_WRAPPED_HAR | _STATUS2_ESCAPE_PREVENTION_HAR)) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_ATTACKER_CANT_ESCAPE_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      if (ctx && off >= 0) ctx.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    } else {
      setCurrentTurnActionNumberHAR(gBattlersCount);
      _setBattleOutcomeHAR(6 /* B_OUTCOME_MON_FLED */);
    }
  }
}

// Imports locaux HandleAction_Run.
import { TryRunFromBattle as _TryRunFromBattleHAR } from './try-run-from-battle';
import { getBattleScriptOffset as _getBattleScriptOffsetHAR } from './script-interpreter';
import {
  setBattleOutcome as _setBattleOutcomeHAR,
  setCurrentTurnActionNumber as setCurrentTurnActionNumberHAR,
  gChosenActionByBattler as _gChosenActionByBattlerHAR,
  setActiveBattler as _setActiveBattlerHAR,
  gBattleOutcome as _gBattleOutcomeHAR,
} from './state';
import {
  BATTLE_TYPE_LINK as _BATTLE_TYPE_LINK_HAR,
  BATTLE_TYPE_RECORDED_LINK as _BATTLE_TYPE_RECORDED_LINK_HAR,
  STATUS2_WRAPPED as _STATUS2_WRAPPED_HAR,
  STATUS2_ESCAPE_PREVENTION as _STATUS2_ESCAPE_PREVENTION_HAR,
} from './constants';

const _B_ACTION_RUN_HAR = 3;
// 1:1 décomp `B_MSG_CANT_ESCAPE_2` / `B_MSG_ATTACKER_CANT_ESCAPE` (= index dans
// sRoarUsedStringIds / sNoEscapeStringIds).
const _B_MSG_CANT_ESCAPE_2_HAR = 1;
const _B_MSG_ATTACKER_CANT_ESCAPE_HAR = 0;

/** 1:1 décomp `HandleAction_RunBattleScript`. No-op puisque script déjà actif. */
export function HandleAction_RunBattleScript(_ctx?: BattleScriptContext): void {
  // Script déjà en cours via le bytecode interpreter — rien à faire.
}

/** 1:1 décomp `HandleAction_TryFinish` (battle_util.c:638-645). */
export function HandleAction_TryFinish(_ctx?: BattleScriptContext): void {
  // STUB HandleFaintedMonActions : retourne true tant qu'il y a faint flow,
  // false quand done. Pour Phase 1, on assume done immédiatement.
  // TODO Phase 1.4 : port HandleFaintedMonActions complet.
  _gBattleStructHAF.faintedActionsState = 0;
  setCurrentActionFuncId(B_ACTION_FINISHED);
}

const _HM_RESET_BITS =
  _HITMARKER_DESTINYBOND_HAF | _HITMARKER_IGNORE_SUBSTITUTE_HAF
  | _HITMARKER_ATTACKSTRING_PRINTED_HAF | _HITMARKER_NO_PPDEDUCT_HAF
  | _HITMARKER_STATUS_ABILITY_EFFECT_HAF | _HITMARKER_IGNORE_ON_AIR_HAF
  | _HITMARKER_IGNORE_UNDERGROUND_HAF | _HITMARKER_IGNORE_UNDERWATER_HAF
  | _HITMARKER_PASSIVE_HP_UPDATE_HAF | _HITMARKER_OBEYS_HAF
  | _HITMARKER_WAKE_UP_CLEAR_HAF | _HITMARKER_SYNCHRONIZE_EFFECT_HAF
  | _HITMARKER_CHARGING_HAF | _HITMARKER_NEVER_SET_HAF;

/** 1:1 décomp `HandleAction_NothingIsFainted` (battle_util.c:647-656). */
export function HandleAction_NothingIsFainted(_ctx?: BattleScriptContext): void {
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);
}

/** 1:1 décomp `HandleAction_ActionFinished` (battle_util.c:658-684). */
export function HandleAction_ActionFinished(_ctx?: BattleScriptContext): void {
  // 1:1 décomp : monToSwitchIntoId[battlerByTurnOrder[current]] = PARTY_SIZE.
  _gBattleStructHAF.monToSwitchIntoId[_gBattlerByTurnOrderHAF[_gCurrentTurnActionNumberHAF]] = 6 /* PARTY_SIZE */;
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  _SpecialStatusesClearHAF();
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);

  setCurrentMove(0);
  setBattleMoveDamageHAR(0);
  setMoveResultFlags(0);
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  _gLastLandedMovesHAF[gBattlerAttacker] = 0;
  _gLastHitByTypeHAF[gBattlerAttacker] = 0;
  _gBattleStructHAF.dynamicMoveType = 0;
  setDynamicBasePowerHAR(0);
  gBattleScripting.moveendState = 0;
  gBattleCommunication[3] = 0;  // MOVE_EFFECT_BYTE
  gBattleCommunication[4] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  // STUB gBattleResources.battleScriptsStack.size = 0 (= notre scriptPtrStack
  // est géré par BattleScriptContext, pas ici).
}

/** 1:1 décomp `SpecialStatusesClear()` (battle_util.c). Reset gSpecialStatuses
 *  pour tous les battlers à blank. */
function _SpecialStatusesClearHAF(): void {
  for (let i = 0; i < gBattlersCount; i++) {
    const ss = _gSpecialStatusesHAF[i];
    ss.statLowered = 0;
    ss.lightningRodRedirected = 0;
    ss.restoredBattlerSprite = 0;
    ss.intimidatedMon = 0;
    ss.traced = 0;
    ss.ppNotAffectedByPressure = 0;
    ss.faintedHasReplacement = 0;
    ss.focusBanded = 0;
    ss.shellBellDmg = 0;
    ss.physicalDmg = 0;
    ss.specialDmg = 0;
    ss.physicalBattlerId = 0;
    ss.specialBattlerId = 0;
  }
}

// Imports HandleAction_TryFinish/NothingIsFainted/ActionFinished.
import {
  gBattleStruct as _gBattleStructHAF,
  gCurrentTurnActionNumber as _gCurrentTurnActionNumberHAF,
  gActionsByTurnOrder as _gActionsByTurnOrderHAF,
  gBattlerByTurnOrder as _gBattlerByTurnOrderHAF,
  gHitMarker as _gHitMarkerHAF,
  gLastLandedMoves as _gLastLandedMovesHAF,
  gLastHitByType as _gLastHitByTypeHAF,
  gSpecialStatuses as _gSpecialStatusesHAF,
  setBattleMoveDamage as setBattleMoveDamageHAR,
  setDynamicBasePower as setDynamicBasePowerHAR,
} from './state';
import {
  HITMARKER_DESTINYBOND as _HITMARKER_DESTINYBOND_HAF,
  HITMARKER_IGNORE_SUBSTITUTE as _HITMARKER_IGNORE_SUBSTITUTE_HAF,
  HITMARKER_ATTACKSTRING_PRINTED as _HITMARKER_ATTACKSTRING_PRINTED_HAF,
  HITMARKER_NO_PPDEDUCT as _HITMARKER_NO_PPDEDUCT_HAF,
  HITMARKER_STATUS_ABILITY_EFFECT as _HITMARKER_STATUS_ABILITY_EFFECT_HAF,
  HITMARKER_IGNORE_ON_AIR as _HITMARKER_IGNORE_ON_AIR_HAF,
  HITMARKER_IGNORE_UNDERGROUND as _HITMARKER_IGNORE_UNDERGROUND_HAF,
  HITMARKER_IGNORE_UNDERWATER as _HITMARKER_IGNORE_UNDERWATER_HAF,
  HITMARKER_PASSIVE_HP_UPDATE as _HITMARKER_PASSIVE_HP_UPDATE_HAF,
  HITMARKER_OBEYS as _HITMARKER_OBEYS_HAF,
  HITMARKER_WAKE_UP_CLEAR as _HITMARKER_WAKE_UP_CLEAR_HAF,
  HITMARKER_SYNCHRONIZE_EFFECT as _HITMARKER_SYNCHRONIZE_EFFECT_HAF,
  HITMARKER_CHARGING as _HITMARKER_CHARGING_HAF,
  HITMARKER_NEVER_SET as _HITMARKER_NEVER_SET_HAF,
} from './constants';

/** Dispatch table 1:1 décomp `sTurnActionsFuncsTable[]` (battle_main.c:536-552).
 *  Indexed par gCurrentActionFuncId (B_ACTION_*). 14 entries. */
export const handleActionTable: ReadonlyArray<(ctx?: BattleScriptContext) => void> = [
  HandleAction_UseMove,            // 0  B_ACTION_USE_MOVE
  HandleAction_UseItem,            // 1  B_ACTION_USE_ITEM
  HandleAction_Switch,             // 2  B_ACTION_SWITCH
  HandleAction_Run,                // 3  B_ACTION_RUN
  HandleAction_RunBattleScript,    // 4  STUB safari watch (= HandleAction_WatchesCarefully)
  HandleAction_RunBattleScript,    // 5  STUB safari ball
  HandleAction_RunBattleScript,    // 6  STUB safari pokeblock
  HandleAction_RunBattleScript,    // 7  STUB safari go near
  HandleAction_RunBattleScript,    // 8  STUB safari run
  HandleAction_RunBattleScript,    // 9  STUB wally throw
  HandleAction_RunBattleScript,    // 10 B_ACTION_EXEC_SCRIPT
  HandleAction_TryFinish,          // 11 B_ACTION_TRY_FINISH
  HandleAction_ActionFinished,     // 12 B_ACTION_FINISHED
  HandleAction_NothingIsFainted,   // 13 B_ACTION_NOTHING_FAINTED
];

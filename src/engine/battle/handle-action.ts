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

/** 1:1 décomp `HandleAction_Run` (battle_util.c). STUB minimal.
 *  Set outcome RAN si réussit, sinon MISSED. */
export function HandleAction_Run(_ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  // TODO Phase 1.4 : full run logic avec Shadow Tag / Arena Trap / Magnet Pull /
  // escape factor. Pour MVP : assume success.
  setCurrentActionFuncId(B_ACTION_FINISHED);
}

/** 1:1 décomp `HandleAction_RunBattleScript`. No-op puisque script déjà actif. */
export function HandleAction_RunBattleScript(_ctx?: BattleScriptContext): void {
  // Script déjà en cours via le bytecode interpreter — rien à faire.
}

/** Dispatch table 1:1 décomp `sBattleStateFuncs[]` (battle_main.c:537-549).
 *  Indexed par gCurrentActionFuncId (B_ACTION_*). */
export const handleActionTable: ReadonlyArray<(ctx?: BattleScriptContext) => void> = [
  HandleAction_UseMove,         // 0 B_ACTION_USE_MOVE
  HandleAction_UseItem,         // 1 B_ACTION_USE_ITEM
  HandleAction_Switch,          // 2 B_ACTION_SWITCH
  HandleAction_Run,             // 3 B_ACTION_RUN
  HandleAction_RunBattleScript, // 4 STUB safari watch
  HandleAction_RunBattleScript, // 5 STUB safari ball
  HandleAction_RunBattleScript, // 6 STUB safari pokeblock
  HandleAction_RunBattleScript, // 7 STUB safari go near
  HandleAction_RunBattleScript, // 8 STUB safari run
  HandleAction_RunBattleScript, // 9 STUB wally throw
  HandleAction_RunBattleScript, // 10 B_ACTION_EXEC_SCRIPT
];

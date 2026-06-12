/**
 * battle/handle-action.ts — Port 1:1 décomp `HandleAction_*` action dispatchers.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:78-...`
 * Voir aussi `battle_main.c:538-548` pour le table dispatch.
 *
 * Action handlers :
 *   B_ACTION_USE_MOVE  → HandleAction_UseMove    (~210l, full port)
 *   B_ACTION_USE_ITEM  → HandleAction_UseItem    (= partial port, item battle UI Phase 1.4 deferred)
 *   B_ACTION_SWITCH    → HandleAction_Switch     (= minimal port)
 *   B_ACTION_RUN       → HandleAction_Run        (= minimal port)
 *   B_ACTION_EXEC_SCRIPT → HandleAction_RunBattleScript (= no-op, script déjà running)
 *
 * Le caller (= battle main loop) :
 *  1. Set gCurrentActionFuncId = B_ACTION_USE_MOVE/SWITCH/etc. depuis action queue.
 *  2. Call le dispatch handler approprié (= sTurnActionsFuncsTable[funcId], battle-turn-dispatch.ts).
 *  3. Handler set gBattlescriptCurrInstr = label approprié + gCurrentActionFuncId = B_ACTION_EXEC_SCRIPT.
 *  4. Battle loop run le script via runBattleScript.
 */

import {
  gLastUsedItem,
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
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattlerPartyIndexes,
  gBattleControllerExecFlags,
  setBattlerFainted, setAbsentBattlerFlags,
} from './state';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_HA,
  PREPARE_MON_NICK_BUFFER,
} from './text-buffers';
import {
  STATUS2_MULTIPLETURNS, STATUS2_RECHARGE,
  HITMARKER_NO_PPDEDUCT,
  MOVE_NONE, MOVE_STRUGGLE,
  MOVE_TARGET_SELECTED, MOVE_TARGET_USER, MOVE_TARGET_RANDOM,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE, BATTLE_TYPE_ARENA, BATTLE_TYPE_SAFARI,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
  BATTLE_OPPOSITE,
  ABILITY_LIGHTNING_ROD,
  TYPE_ELECTRIC,
  NO_TARGET_OVERRIDE,
  B_ACTION_FINISHED, B_ACTION_EXEC_SCRIPT,
  MULTISTRING_CHOOSER,
  MISS_TYPE,
} from './constants';
import { gBitTable } from './battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
  RecordAbilityBattle, ClearFuryCutterDestinyBondGrudge,
} from './util';
import { getBattleMove } from './data/battle-moves';
// 1:1 décomp battle_util.c:1942-1945 — HandleFaintedMonActions case 6 applique les
// effets de switch-in (Intimidate/Trace/Forecast + items). Import direct (= pas de
// cycle : ability/item-battle-effects n'importent pas handle-action) ; même pattern
// que end-turn-effects.ts.
import {
  AbilityBattleEffects,
  ABILITYEFFECT_INTIMIDATE1, ABILITYEFFECT_TRACE, ABILITYEFFECT_FORECAST,
  consumeAbilityWantedScript,
} from './ability-battle-effects';
import {
  ItemBattleEffects, ITEMEFFECT_NORMAL, consumeItemWantedScript,
} from './item-battle-effects';
import {
  getMoveEffectScriptOffset, getBattleScriptOffset,
  stepBattleScriptCommand, gBattleScriptContext,
} from './script-interpreter';
import type { BattleScriptContext } from './script-interpreter';
import { Random } from '../system/random';

const B_MSG_INCAPABLE_OF_POWER = 0;  // Battle Palace deferred

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

/** 1:1 décomp battle_util.c : `gBattlerTarget = *(gBattleStruct->moveTarget + gBattlerAttacker)`
 *  (branche move SELECTED normale). La table par-battler `gBattleStruct.moveTarget[]`
 *  (state.ts:542) est posée par la sélection (SetActionsAndBattlersTurnOrder) ; le
 *  harness la pose aussi. N'affecte QUE la voie L (HandleAction_UseMove) — la voie V
 *  saute au script d'effet sans passer ici. */
function _getMoveTargetForBattler(battler: number): number {
  return gBattleStruct.moveTarget[battler];
}

function _setMoveTargetForBattler(_battler: number, _target: number): void {
  // moveTarget array deferred. La cible est set via gBattlerTarget.
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
  gBattleCommunication[MISS_TYPE] = 0;  // 1:1 décomp battle_util.c:96 (MISS_TYPE=6)

  // 1:1 décomp battle_util.c:99 : `gCurrMovePos = gChosenMovePos = gBattleStruct->chosenMovePositions[attacker]`.
  // INDISPENSABLE : sans cette ligne, gCurrMovePos restait à 0 → TOUS les branches
  // ci-dessous (moves[gCurrMovePos]) utilisaient moves[0] → le joueur ne pouvait JAMAIS
  // jouer un move autre que le slot 0 (sélectionner Leer slot 1 jouait Pound slot 0).
  // Bug masqué jusqu'ici car harness/AI/tests utilisaient toujours le slot 0.
  // chosenMovePositions[] est posé par : in-game (battle-action-selection.ts:620 depuis
  // gBattleBufferB[2]), AI (ai-script-commands.ts:436-437), harness (battle-decomp-loop.ts:395).
  setCurrMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);
  setChosenMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);

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
    // gPalaceSelectionBattleScripts Frontier deferred.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_INCAPABLE_OF_POWER;
    scriptPtr = getBattleScriptOffset('BattleScript_MoveUsedLoafingAround');
  } else {
    // 1:1 décomp : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect]`.
    const moveEffect = getBattleMove(gCurrentMove).effect;
    scriptPtr = getMoveEffectScriptOffset(moveEffect as number);
  }

  // Battle Arena : BattleArena_AddMindPoints. Battle Frontier deferred post-Phase 1.
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    // BattleArena_AddMindPoints deferred.
    void setLastUsedAbility;
  }

  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);

  // 1:1 décomp battle_util.c:285 : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[effect]`.
  // On pose le scriptPtr sur le ctx persistant (= le global gBattlescriptCurrInstr),
  // que HandleAction_RunBattleScript steppera commande par commande (1×/frame,
  // gated sur gBattleControllerExecFlags). La voie V passe son propre ctx local.
  const c = ctx ?? gBattleScriptContext;
  if (scriptPtr >= 0) {
    c.scriptPtr = scriptPtr;
  }
}

/** 1:1 décomp `HandleAction_Switch` (battle_util.c:294-310). */
export function HandleAction_Switch(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  // 1:1 décomp battle_util.c : gBattle_BG0_X/Y = 0 — BG scroll registers GBA
  // (= no-op web canvas, le scroll est piloté par le renderer side).
  // gActionSelectionCursor / gMoveSelectionCursor reset au switch.
  gActionSelectionCursor[gBattlerAttacker] = 0;
  gMoveSelectionCursor[gBattlerAttacker] = 0;
  // 1:1 décomp battle_util.c : PREPARE_MON_NICK_BUFFER. battlerPartyIndexes
  // dans le décomp = gBattleStruct->battlerPartyIndexes ; notre port utilise
  // gBattlerPartyIndexes pour le party slot courant de chaque battler.
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_HA, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  gBattleScripting.battler = gBattlerAttacker;
  const off = getBattleScriptOffset('BattleScript_ActionSwitch');
  // ctx est undefined quand appelé via le turn dispatch (sTurnActionsFuncsTable() sans
  // arg) → fallback sur le ctx PERSISTANT gBattleScriptContext (= celui que steppe
  // HandleAction_RunBattleScript). Sans ce fallback le scriptPtr n'était JAMAIS posé
  // → le mon ne swappait pas, tour figé à RunTurnActionsFunctions (bug switch loop #9).
  // Pattern `ctx ?? gBattleScriptContext` = handle-action.ts:357/482.
  const c = ctx ?? gBattleScriptContext;
  if (off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  // 1:1 décomp ll.308-309 : incrémente playerSwitchesCounter (cap à 255 u8).
  if (gBattleResults.playerSwitchesCounter < 255) {
    gBattleResults.playerSwitchesCounter++;
  }
}

/** 1:1 décomp `HandleAction_UseItem` (battle_util.c:312+). partial port.
 *  Wirage minimal : set attacker + ClearFuryCutterDestinyBondGrudge.
 *  Phase 1.4 : full item battle flow deferred (= read gBattleBufferB[1..2] pour item ID,
 *  switch sur effect, run bytecode item-use). */
export function HandleAction_UseItem(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  setBattlerTarget(gBattlerAttacker);
  ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
  // 1:1 decomp battle_util.c:318 : gLastUsedItem = bufferB[1] | bufferB[2]<<8
  // (deja pose 1:1 par STATE_WAIT_ACTION_CASE_CHOSEN -> setLastUsedItem).
  const item = gLastUsedItem;
  if (item > 0 && item <= 12 /* LAST_BALL = ITEM_PREMIER_BALL */) {
    // 1:1 : gBattlescriptCurrInstr = gBattlescriptsForBallThrow[item] — la table
    // (battle_scripts_2.s:15) pointe BattleScript_BallThrow pour toutes les balls
    // (Safari = BattleScript_SafariBallThrow, item 5 en Safari uniquement).
    const off = getBattleScriptOffset('BattleScript_BallThrow');
    // Le dispatcher C7 (RunTurnActionsFunctions) appelle les handlers SANS ctx
    // -> fallback 1:1 sur le ctx PERSISTANT (gBattleScriptContext), comme
    // HandleEndTurn_BattleWon.
    const c = ctx ?? gBattleScriptContext;
    if (off >= 0 && c) {
      c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
  // 1:1 decomp battle_util.c:324-330 : POKE_DOLL(80)/FLUFFY_TAIL(81) ->
  // BattleScript_RunByUsingItem (fuite garantie wild) ; autres items joueur ->
  // BattleScript_PlayerUsesItem (message + finishaction ; l effet medecine/X a
  // deja ete applique cote bag/party 1:1). Branche AI trainer items = dette.
  if (item === 80 || item === 81) {
    const off2 = getBattleScriptOffset('BattleScript_RunByUsingItem');
    const c2 = ctx ?? gBattleScriptContext;
    if (off2 >= 0 && c2) {
      c2.scriptPtr = off2;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  } else if (item > 0) {
    const off3 = getBattleScriptOffset('BattleScript_PlayerUsesItem');
    const c3 = ctx ?? gBattleScriptContext;
    if (off3 >= 0 && c3) {
      c3.scriptPtr = off3;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
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
    // Frontier deferred : gSaveBlock2Ptr.frontier.disableRecordBattle = TRUE (= Frontier post-Phase 1).
    return;
  }

  // Normal battle.
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    if (!_TryRunFromBattleHAR(gBattlerAttacker)) {
      // Failed to run away.
      ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_CANT_ESCAPE_2_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 décomp `gBattlescriptCurrInstr = BattleScript_PrintFailedToRunString` :
      // la table sTurnActionsFuncsTable appelle SANS ctx → fallback OBLIGATOIRE sur
      // le ctx persistant (sinon le script n'est jamais pointé → B_ACTION_EXEC_SCRIPT
      // steppe l'ancien pointeur = soft-lock silencieux au menu, bug user fuite).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    }
    // Si TryRunFromBattle a réussi : il a déjà set gBattleOutcome = RAN +
    // gCurrentTurnActionNumber = gBattlersCount.
  } else {
    // Wild opponent essaie de fuir (= Roar / Whirlwind sur joueur).
    if (gBattleMons[gBattlerAttacker].status2 & (_STATUS2_WRAPPED_HAR | _STATUS2_ESCAPE_PREVENTION_HAR)) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_ATTACKER_CANT_ESCAPE_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 : même fallback ctx persistant (appel sans ctx depuis la table d'actions).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
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
// 1:1 décomp battle_string_ids.h:564-569 (index dans gNoEscapeStringIds) :
// CANT_ESCAPE=0, DONT_LEAVE_BIRCH=1, PREVENTS_ESCAPE=2, CANT_ESCAPE_2=3,
// ATTACKER_CANT_ESCAPE=4. (Les anciennes valeurs 1/0 affichaient le message
// Birch « Ne me laisse pas comme ça! » sur un échec de fuite sauvage.)
const _B_MSG_CANT_ESCAPE_2_HAR = 3;
const _B_MSG_ATTACKER_CANT_ESCAPE_HAR = 4;

/** 1:1 décomp `HandleAction_RunBattleScript` (battle_util.c:3805-3809) :
 *  `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
 *
 *  Step UNE commande du battle script par frame, et SEULEMENT quand aucun
 *  controller n'est en cours d'exécution (texte/anim/hp update finis). Le pacing
 *  per-frame émerge : RunTurnActionsFunctions appelle ceci 1×/frame ; une
 *  commande bloquante (printstring/animation/datahpupdate) fait
 *  MarkBattlerForControllerExec → le flag bloque le prochain step ; le controller
 *  func (tické par BattleMainCB1) clear le flag quand fini → step reprend. */
export function HandleAction_RunBattleScript(ctx?: BattleScriptContext): void {
  const c = ctx ?? gBattleScriptContext;
  if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(c);
  }
}

/** 1:1 décomp `HandleAction_TryFinish` (battle_util.c:638-645). Appelle
 *  HandleFaintedMonActions chaque frame ; tant que TRUE (un script EXP/faint est
 *  en cours), on attend ; quand FALSE (tout le flow post-faint est fini) →
 *  faintedActionsState=0 + gCurrentActionFuncId=B_ACTION_FINISHED. */
export function HandleAction_TryFinish(_ctx?: BattleScriptContext): void {
  if (!HandleFaintedMonActions()) {
    gBattleStruct.faintedActionsState = 0;
    setCurrentActionFuncId(B_ACTION_FINISHED);
  }
}

/** 1:1 décomp `FAINTED_ACTIONS_MAX_CASE` = 7 (battle_util.c). */
const _FAINTED_ACTIONS_MAX_CASE = 7;
const _PARTY_SIZE_HFM = 6;

/** `BattleScriptExecute(label)` via le hook globalThis (= évite le cycle
 *  handle-action ↔ battle-main-functions ; même pattern que turn-dispatch). */
function _BattleScriptExecuteHFM(label: string): void {
  const bm = (globalThis as Record<string, unknown>).__battleMainFunctions as
    { BattleScriptExecute?: (l: string) => void } | undefined;
  if (bm?.BattleScriptExecute) bm.BattleScriptExecute(label);
  else console.warn('[handle-action] BattleScriptExecute hook absent (battle-main-functions pas chargé)');
}

/** 1:1 inline `HasNoMonsToSwitch(battler, …)` (battle_util.c) — true si AUCUN
 *  autre mon vivant dans le party du battler. (= ne peut pas remplacer.) */
function _HasNoMonsToSwitchHFM(battler: number): boolean {
  const partyIdx = gBattlerPartyIndexes[battler] ?? 0;
  const party = (battler & 1) === 0
    ? (globalThis as { gPlayerParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gPlayerParty
    : (globalThis as { gEnemyParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gEnemyParty;
  if (!party) return true;
  for (let j = 0; j < _PARTY_SIZE_HFM; j++) {
    if (j === partyIdx) continue;
    const m = party[j];
    if (m?.species && (m.hp ?? 0) > 0 && !m.isEgg) return false;
  }
  return true;
}

/** 1:1 inline `OpponentSwitchInResetSentPokesToOpponentValue(battler)`
 *  (battle_util.c:915-932) — recompute gSentPokesToOpponent[flank]. */
function _OpponentSwitchInResetHFM(battler: number): void {
  if ((battler & 1) !== 1) return;  // GET_BATTLER_SIDE != B_SIDE_OPPONENT.
  const flank = (battler & 2) >>> 1;
  const sentPokes = (globalThis as { gSentPokesToOpponent?: number[] }).gSentPokesToOpponent;
  if (!sentPokes) return;
  let bits = 0;
  for (let i = 0; i < gBattlersCount; i += 2) {
    if (!(gAbsentBattlerFlags & gBitTable[i])) bits |= gBitTable[gBattlerPartyIndexes[i] ?? 0];
  }
  sentPokes[flank] = bits;
}

/** 1:1 décomp `HandleFaintedMonActions()` (battle_util.c:1877-1954). State machine
 *  `faintedActionsState` (0..7) : EXP (GiveExp) → faint/« K.O. » (HandleFaintedMon)
 *  → effets switch-in. Return TRUE quand un script est lancé (BattleScriptExecute
 *  bascule gBattleMainFunc → le script tourne per-frame ; la fonction est
 *  re-appelée par TryFinish au frame suivant) ; FALSE quand fini (state == MAX). */
export function HandleFaintedMonActions(): boolean {
  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) return false;
  do {
    switch (gBattleStruct.faintedActionsState) {
      case 0:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 1;
        for (let i = 0; i < gBattlersCount; i++) {
          if ((gAbsentBattlerFlags & gBitTable[i]) && !_HasNoMonsToSwitchHFM(i)) {
            setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[i]);
          }
        }
        // décomp = fall through vers case 1 ; ici break → le do-while ré-entre
        // au switch avec state=1 (= équivalent exact).
        break;
      case 1: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          const expBit = gBitTable[gBattlerPartyIndexes[b] ?? 0] ?? 1;
          if (gBattleMons[b].hp === 0
              && !(gBattleStruct.givenExpMons & expBit)
              && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_GiveExp');
            gBattleStruct.faintedActionsState = 2;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 3;
        break;
      }
      case 2:
        _OpponentSwitchInResetHFM(gBattleStruct.faintedActionsBattlerId);
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 3;
        else gBattleStruct.faintedActionsState = 1;
        break;
      case 3:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 4;
        // décomp = fall through vers case 4 ; break → do-while ré-entre à state=4.
        break;
      case 4: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          if (gBattleMons[b].hp === 0 && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_HandleFaintedMon');
            gBattleStruct.faintedActionsState = 5;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 6;
        break;
      }
      case 5:
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 6;
        else gBattleStruct.faintedActionsState = 4;
        break;
      case 6:
        // 1:1 décomp battle_util.c:1942-1947 :
        //   if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0,0,0,0)
        //    || AbilityBattleEffects(ABILITYEFFECT_TRACE, 0,0,0,0)
        //    || ItemBattleEffects(ITEMEFFECT_NORMAL, 0, TRUE)
        //    || AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0,0,0,0))
        //       return TRUE;          // un script switch-in a été mis en file
        //   gBattleStruct->faintedActionsState++;   // → état 7
        //
        // Dans la décomp, AbilityBattleEffects/ItemBattleEffects mettent le script
        // en file (BattleScriptPushCursorAndCallback) et retournent l'effet != 0 ;
        // ici notre port délègue l'exécution au caller : on consomme le label voulu
        // (consume*WantedScript) puis on le lance via _BattleScriptExecuteHFM (=
        // l'équivalent du BattleScriptExecute interne). Le `return true` reproduit
        // le `return TRUE` (= le caller re-appelle au frame suivant).
        if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (ItemBattleEffects(ITEMEFFECT_NORMAL, 0, true) !== 0) {
          const label = consumeItemWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        gBattleStruct.faintedActionsState++;
        break;
      case _FAINTED_ACTIONS_MAX_CASE:
        break;
    }
  } while (gBattleStruct.faintedActionsState !== _FAINTED_ACTIONS_MAX_CASE);
  return false;
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
  // 1:1 décomp battle_util.c:683 : gBattleResources->battleScriptsStack->size = 0.
  // Notre équivalent = vider le call-stack du ctx persistant pour que le tour
  // suivant reparte propre (= évite une fuite de scriptPtrStack entre tours).
  gBattleScriptContext.scriptPtrStack.length = 0;
  gBattleScriptContext.comparisonResult = 0;
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

// NB : la table de dispatch d'actions 1:1 (`sTurnActionsFuncsTable`, battle_main.c:536) vit
// dans battle-turn-dispatch.ts (= le port de battle_main.c, là où vit aussi
// RunTurnActionsFunctions), qui importe les HandleAction_* DIRECTEMENT (imports ESM). On ne
// duplique donc PAS la table ici, et on n'expose plus de registre globalThis.__handleAction
// (l'ancien `handleActionTable` + le registre étaient des duplicatas morts — retirés, B6).

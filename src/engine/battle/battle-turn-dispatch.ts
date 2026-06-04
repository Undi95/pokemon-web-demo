/**
 * battle/battle-turn-dispatch.ts — Port 1:1 strict des dispatch tables turn +
 * helpers connexes.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - sTurnActionsFuncsTable (536-552) — dispatch B_ACTION_* → HandleAction_*
 *   - sEndTurnFuncsTable (554-567) — dispatch outcome → HandleEndTurn_*
 *   - CheckFocusPunch_ClearVarsBeforeTurnStarts (4906-4935)
 *   - RunTurnActionsFunctions (4937-4958)
 *   - TryCorrectShedinjaLanguage (2645-2657)
 *   - GetBattleWindowTemplatePixelWidth (2659-2662)
 *
 * Mécanique :
 *   - sTurnActionsFuncsTable[14] : per-action func dispatcher (USE_MOVE,
 *     USE_ITEM, SWITCH, RUN, SAFARI variants, EXEC_SCRIPT, FINISHED, etc.)
 *   - sEndTurnFuncsTable[11] : per-outcome func dispatcher (WON, LOST, RAN,
 *     CAUGHT, etc. → HandleEndTurn_*)
 *   - CheckFocusPunch : iterate battlers pour Focus Punch setup pré-turn
 *   - RunTurnActionsFunctions : drive le dispatcher chaque tick
 *
 * Dépendances :
 *   - K8 battle-main-functions.ts : HandleEndTurn_* fns portées
 *   - handle-action.ts : HandleAction_UseMove/Item/Switch/Run/etc.
 *   - state.ts : gCurrentActionFuncId, gCurrentTurnActionNumber, gActionsByTurnOrder,
 *     gBattleOutcome, gHitMarker, gBattleStruct.focusPunchBattlerId,
 *     gChosenMoveByBattler, gBattlerAttacker, gActiveBattler
 */

import {
  gActiveBattler, gBattlerAttacker, gBattlersCount,
  gBattleStruct, gChosenMoveByBattler,
  gBattleMons, gDisableStructs, gProtectStructs,
  gHitMarker, gBattleOutcome, gCurrentTurnActionNumber,
  gCurrentActionFuncId, gActionsByTurnOrder,
  gBattleCommunication, gBattleScripting,
  gDynamicBasePower,
  setActiveBattler, setBattlerAttacker,
  setHitMarker, setCurrentActionFuncId, setCurrentTurnActionNumber,
  setDynamicBasePower,
} from './state';
import {
  HITMARKER_RUN, HITMARKER_PASSIVE_HP_UPDATE, HITMARKER_NO_ATTACKSTRING,
  HITMARKER_UNABLE_TO_USE_MOVE,
  STATUS1_SLEEP, MOVE_FOCUS_PUNCH,
  B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  B_ACTION_SAFARI_WATCH_CAREFULLY, B_ACTION_SAFARI_BALL,
  B_ACTION_SAFARI_POKEBLOCK, B_ACTION_SAFARI_GO_NEAR, B_ACTION_SAFARI_RUN,
  B_ACTION_WALLY_THROW, B_ACTION_EXEC_SCRIPT, B_ACTION_TRY_FINISH,
  B_ACTION_FINISHED, B_ACTION_NOTHING_FAINTED,
  B_OUTCOME_WON, B_OUTCOME_LOST, B_OUTCOME_DREW, B_OUTCOME_RAN,
  B_OUTCOME_PLAYER_TELEPORTED, B_OUTCOME_CAUGHT, B_OUTCOME_MON_TELEPORTED,
} from './constants';
// 1:1 décomp : sTurnActionsFuncsTable contient des POINTEURS DIRECTS vers les HandleAction_*
// (battle_main.c:536). Import ESM direct — AUCUN cycle (handle-action n'importe pas
// battle-turn-dispatch, ni rien dans sa chaîne ; vérifié) → on retire le lookup
// globalThis.__handleAction (qui n'évitait qu'un cycle imaginaire).
import {
  HandleAction_UseMove, HandleAction_UseItem, HandleAction_Switch,
  HandleAction_Run, HandleAction_RunBattleScript, HandleAction_TryFinish,
  HandleAction_ActionFinished, HandleAction_NothingIsFainted,
} from './handle-action';
// 1:1 décomp : sEndTurnFuncsTable contient des pointeurs directs vers HandleEndTurn_*
// (battle_main.c:554) ; gBattleMainFunc est posé via setBattleMainFunc. Import ESM direct
// (battle-main-functions n'importe NI battle-turn-dispatch NI battle-flow ; vérifié) → on
// retire le lookup/setter globalThis.__battleMainFunctions.
import {
  setBattleMainFunc,
  HandleEndTurn_ContinueBattle, HandleEndTurn_BattleWon, HandleEndTurn_BattleLost,
  HandleEndTurn_RanFromBattle, HandleEndTurn_MonFled, HandleEndTurn_FinishBattle,
} from './battle-main-functions';

// ─── Type pour HandleAction_* + HandleEndTurn_* ────────────────────────────

type ActionHandler = () => void;
type EndTurnHandler = () => void;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `TryClearRageStatuses()` (battle_util.c). */
function _TryClearRageStatuses(): void {
  // Dette R3 : Rage status clear cascade vers util.ts.
}

/** 1:1 décomp `BattleScriptExecute(bsPtr)`. */
function _BattleScriptExecute(_bsPtr: unknown): void {
  // Dette R3 : wire vers script-interpreter.ts.
  console.warn('[battle-turn-dispatch] BattleScriptExecute called — script interpreter wire needed');
}

/** 1:1 décomp `BattleScript_FocusPunchSetUp` (battle_scripts_1.s). */
const BattleScript_FocusPunchSetUp = {} as unknown;

/** 1:1 décomp `B_OUTCOME_MON_FLED` = 6. */
const B_OUTCOME_MON_FLED = 6;
/** 1:1 décomp `B_OUTCOME_NO_SAFARI_BALLS` = 8. */
const B_OUTCOME_NO_SAFARI_BALLS = 8;
/** 1:1 décomp `B_OUTCOME_FORFEITED` = 9. */
const B_OUTCOME_FORFEITED_LOCAL = 9;

// ─── sTurnActionsFuncsTable (battle_main.c:536-552) — 1:1 décomp ───────────

/** 1:1 décomp `sTurnActionsFuncsTable[]`. Per-action func dispatch.
 *  Indexé par B_ACTION_* enum. */
export const sTurnActionsFuncsTable: ActionHandler[] = [];

function _initTurnActionsFuncsTable(): void {
  sTurnActionsFuncsTable[B_ACTION_USE_MOVE] = HandleAction_UseMove;
  sTurnActionsFuncsTable[B_ACTION_USE_ITEM] = HandleAction_UseItem;
  sTurnActionsFuncsTable[B_ACTION_SWITCH] = HandleAction_Switch;
  sTurnActionsFuncsTable[B_ACTION_RUN] = HandleAction_Run;
  // [C] Dette Safari/Wally : les vrais HandleAction_WatchesCarefully / SafariZoneBallThrow /
  // ThrowPokeblock / GoNear / SafariZoneRun / WallyBallThrow ne sont pas portés → alias vers
  // HandleAction_RunBattleScript (= comportement actuel INCHANGÉ ; à porter séparément).
  sTurnActionsFuncsTable[B_ACTION_SAFARI_WATCH_CAREFULLY] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_BALL] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_POKEBLOCK] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_GO_NEAR] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_RUN] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_WALLY_THROW] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_EXEC_SCRIPT] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_TRY_FINISH] = HandleAction_TryFinish;
  sTurnActionsFuncsTable[B_ACTION_FINISHED] = HandleAction_ActionFinished;
  sTurnActionsFuncsTable[B_ACTION_NOTHING_FAINTED] = HandleAction_NothingIsFainted;
}
_initTurnActionsFuncsTable();

// ─── sEndTurnFuncsTable (battle_main.c:554-567) — 1:1 décomp ───────────────

/** 1:1 décomp `sEndTurnFuncsTable[]`. Per-outcome end-turn dispatcher. */
export const sEndTurnFuncsTable: EndTurnHandler[] = [];

function _initEndTurnFuncsTable(): void {
  sEndTurnFuncsTable[0] = HandleEndTurn_ContinueBattle;
  sEndTurnFuncsTable[B_OUTCOME_WON] = HandleEndTurn_BattleWon;
  sEndTurnFuncsTable[B_OUTCOME_LOST] = HandleEndTurn_BattleLost;
  sEndTurnFuncsTable[B_OUTCOME_DREW] = HandleEndTurn_BattleLost;
  sEndTurnFuncsTable[B_OUTCOME_RAN] = HandleEndTurn_RanFromBattle;
  sEndTurnFuncsTable[B_OUTCOME_PLAYER_TELEPORTED] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_MON_FLED] = HandleEndTurn_MonFled;
  sEndTurnFuncsTable[B_OUTCOME_CAUGHT] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_NO_SAFARI_BALLS] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_FORFEITED_LOCAL] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_MON_TELEPORTED] = HandleEndTurn_FinishBattle;
}
_initEndTurnFuncsTable();

// ─── CheckFocusPunch_ClearVarsBeforeTurnStarts (4906-4935) — 1:1 décomp ────

/** 1:1 décomp `CheckFocusPunch_ClearVarsBeforeTurnStarts()` (battle_main.c:4906-4935).
 *
 *  Iterate battlers : pour chaque battler qui a chosen MOVE_FOCUS_PUNCH +
 *  pas asleep + pas truant + has valid moves → execute BattleScript_FocusPunchSetUp.
 *  Sinon : continue itération.
 *
 *  Quand fini → clear turn vars + set gBattleMainFunc = RunTurnActionsFunctions.
 */
export function CheckFocusPunch_ClearVarsBeforeTurnStarts(): void {
  if (!(gHitMarker & HITMARKER_RUN)) {
    while (gBattleStruct.focusPunchBattlerId < gBattlersCount) {
      const id = gBattleStruct.focusPunchBattlerId;
      setActiveBattler(id);
      setBattlerAttacker(id);
      gBattleStruct.focusPunchBattlerId++;

      if (gChosenMoveByBattler[gActiveBattler] === MOVE_FOCUS_PUNCH
          && !(gBattleMons[gActiveBattler].status1 & STATUS1_SLEEP)
          && !(gDisableStructs[gBattlerAttacker].truantCounter)
          && !(gProtectStructs[gActiveBattler].noValidMoves)) {
        _BattleScriptExecute(BattleScript_FocusPunchSetUp);
        return;
      }
    }
  }

  _TryClearRageStatuses();
  setCurrentTurnActionNumber(0);
  setCurrentActionFuncId(gActionsByTurnOrder[gCurrentTurnActionNumber]);
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;

  // 1:1 décomp : gBattleMainFunc = RunTurnActionsFunctions.
  setBattleMainFunc(RunTurnActionsFunctions);

  gBattleCommunication[3] = 0;
  gBattleCommunication[4] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  // 1:1 décomp : gBattleResources->battleScriptsStack->size = 0.
  // Dette R3 : script stack tracker.
  void gDynamicBasePower;
}

// ─── RunTurnActionsFunctions (4937-4958) — 1:1 décomp ──────────────────────

/** 1:1 décomp `RunTurnActionsFunctions()` (battle_main.c:4937-4958).
 *
 *  Drive le dispatcher per-action. Si tous les battlers ont agi → switch
 *  vers sEndTurnFuncsTable[outcome]. */
export function RunTurnActionsFunctions(): void {
  if (gBattleOutcome !== 0) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
  }

  gBattleStruct.savedTurnActionNumber = gCurrentTurnActionNumber;

  // 1:1 décomp : sTurnActionsFuncsTable[gCurrentActionFuncId]().
  const handler = sTurnActionsFuncsTable[gCurrentActionFuncId];
  if (handler) handler();

  if (gCurrentTurnActionNumber >= gBattlersCount) {
    // Tous battlers ont agi → end-turn dispatch.
    setHitMarker(gHitMarker & ~HITMARKER_PASSIVE_HP_UPDATE);

    // 1:1 décomp : gBattleMainFunc = sEndTurnFuncsTable[outcome & 0x7F].
    const endTurnHandler = sEndTurnFuncsTable[gBattleOutcome & 0x7F];
    // 1:1 décomp : gBattleMainFunc = sEndTurnFuncsTable[outcome & 0x7F].
    if (endTurnHandler) setBattleMainFunc(endTurnHandler);
  } else if (gBattleStruct.savedTurnActionNumber !== gCurrentTurnActionNumber) {
    // Action turn done → clear hitmarker bits pour next battler.
    setHitMarker(gHitMarker & ~HITMARKER_NO_ATTACKSTRING);
    setHitMarker(gHitMarker & ~HITMARKER_UNABLE_TO_USE_MOVE);
  }
}

// ─── TryCorrectShedinjaLanguage (2645-2657) — 1:1 décomp ───────────────────

/** 1:1 décomp `TryCorrectShedinjaLanguage(mon)` (battle_main.c:2645-2657).
 *  Edge case : Shedinja avec nickname Japonais original → set language à
 *  Japonais. Affecte la decoder qui handle nickname display proprement. */
export function TryCorrectShedinjaLanguage(_mon: unknown): void {
  // Dette R3 : GetMonData + StringCompareWithoutExtCtrlCodes + sText_ShedinjaJpnName.
  // Edge case ultra-rare ; pour notre démo Birch tutorial : pas applicable.
}

// ─── GetBattleWindowTemplatePixelWidth (2659-2662) — 1:1 décomp ────────────

/** 1:1 décomp `GetBattleWindowTemplatePixelWidth(windowsType, tableId)`
 *  (battle_main.c:2659-2662). Returns gBattleWindowTemplates[windowsType][tableId].width * 8. */
export function GetBattleWindowTemplatePixelWidth(windowsType: number, tableId: number): number {
  // Dette R3 : gBattleWindowTemplates[][] data table.
  void windowsType; void tableId;
  return 64;  // default width approximation
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleTurnDispatch = {
  sTurnActionsFuncsTable, sEndTurnFuncsTable,
  CheckFocusPunch_ClearVarsBeforeTurnStarts,
  RunTurnActionsFunctions,
  TryCorrectShedinjaLanguage,
  GetBattleWindowTemplatePixelWidth,
};

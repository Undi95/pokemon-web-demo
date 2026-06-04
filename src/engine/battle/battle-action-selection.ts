/**
 * battle/battle-action-selection.ts — Port 1:1 strict de HandleTurnActionSelectionState.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:4116-4552`
 *
 * Cette fn est le state machine principal pour la sélection des actions
 * battlers à chaque tour. ~425 lignes, 8 states + per-action branching.
 *
 * STATES enum (battle_main.c:4116-4127) :
 *   - STATE_TURN_START_RECORD       (0) : recorded battle copy moves
 *   - STATE_BEFORE_ACTION_CHOSEN    (1) : choose action (EmitChooseAction)
 *   - STATE_WAIT_ACTION_CHOSEN      (2) : process action (USE_MOVE, USE_ITEM, etc.)
 *   - STATE_WAIT_ACTION_CASE_CHOSEN (3) : process sub-action (= chosen move/item/mon)
 *   - STATE_WAIT_ACTION_CONFIRMED_STANDBY (4) : emit LinkStandbyMsg
 *   - STATE_WAIT_ACTION_CONFIRMED   (5) : confirmed counter++
 *   - STATE_SELECTION_SCRIPT        (6) : exec selection battle script
 *   - STATE_WAIT_SET_BEFORE_ACTION  (7) : return to BEFORE_ACTION_CHOSEN
 *   - STATE_SELECTION_SCRIPT_MAY_RUN (8) : selection script with FORFEIT option
 *
 * Note : cascade massive vers controller IPC + bytecode + recorded battle.
 * Le port maintient la structure state machine 1:1 strict avec dette R3
 * explicite pour les helpers cascade non-applicables à notre démo offline.
 *
 * Dépendances :
 *   - state.ts : gActiveBattler, gBattlersCount, gBattleCommunication,
 *     gBattleStruct, gBattleMons, gDisableStructs, gProtectStructs,
 *     gChosenActionByBattler, gChosenMoveByBattler, gBattleTypeFlags,
 *     gHitMarker, gBattleBufferB (= dette R3 controller IPC buffer)
 *   - constants.ts : B_ACTION_* + BATTLE_TYPE_* + STATUS2_*
 *   - util.ts : GetBattlerAtPosition, GetBattlerPosition, BATTLE_PARTNER
 *   - K17 battle-turn-helpers : AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch
 *   - K8 battle-main-functions : setBattleMainFunc
 */

import {
  gActiveBattler, gBattlersCount, gBattleCommunication,
  gBattleStruct, gBattleMons, gDisableStructs, gProtectStructs,
  gChosenActionByBattler, gChosenMoveByBattler,
  gBattleTypeFlags, gHitMarker,
  gBattlerAttacker, gStatuses3,
  gLastUsedItem, gLastUsedAbility,
  setActiveBattler, setBattlerAttacker, setHitMarker,
  setLastUsedItem,
  gBattleControllerExecFlags, setBattleControllerExecFlags,
} from './state';
// IPC controller réel (écriture bufferA + exec flags) — remplace les stubs
// noop locaux pour que le menu d'action interagisse VRAIMENT avec le player
// controller (1:1 décomp battle_controllers.c). Pas de cycle : ipc n'importe
// pas action-selection.
import { PrepareBufferDataTransfer } from './battle-controllers-ipc';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK, BATTLE_TYPE_MULTI,
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_ARENA,
  BATTLE_TYPE_EREADER_TRAINER, BATTLE_TYPE_PALACE,
  B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  B_ACTION_SAFARI_BALL, B_ACTION_SAFARI_POKEBLOCK, B_ACTION_SAFARI_WATCH_CAREFULLY,
  B_ACTION_SAFARI_GO_NEAR, B_ACTION_SAFARI_RUN, B_ACTION_WALLY_THROW,
  B_ACTION_NOTHING_FAINTED, B_ACTION_CANCEL_PARTNER,
  STATUS2_WRAPPED, STATUS2_ESCAPE_PREVENTION, STATUS2_MULTIPLETURNS,
  STATUS2_RECHARGE,
  STATUS3_ROOTED,
  ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP, ABILITY_LEVITATE, ABILITY_MAGNET_PULL,
  ABILITY_NONE,
  TYPE_FLYING, TYPE_STEEL,
  BIT_FLANK, BATTLE_PARTNER,
} from './constants';
import { GetBattlerPosition, GetBattlerAtPosition } from './util';
import { getBattleMove } from './data/battle-moves';

// ─── STATE enum 1:1 décomp (4116-4127) ─────────────────────────────────────

export const STATE_TURN_START_RECORD = 0;
export const STATE_BEFORE_ACTION_CHOSEN = 1;
export const STATE_WAIT_ACTION_CHOSEN = 2;
export const STATE_WAIT_ACTION_CASE_CHOSEN = 3;
export const STATE_WAIT_ACTION_CONFIRMED_STANDBY = 4;
export const STATE_WAIT_ACTION_CONFIRMED = 5;
export const STATE_SELECTION_SCRIPT = 6;
export const STATE_WAIT_SET_BEFORE_ACTION = 7;
export const STATE_SELECTION_SCRIPT_MAY_RUN = 8;

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

const ACTIONS_CONFIRMED_COUNT = 4;
const PARTY_SIZE = 6;
const MAX_BATTLERS_COUNT = 4;
const MAX_MON_MOVES = 4;
const B_FLANK_LEFT = 0;
const B_COMM_TO_CONTROLLER = 0;

// PARTY_ACTION_* constants (= constants/party_menu.h).
const PARTY_ACTION_CHOOSE_MON = 0;
const PARTY_ACTION_CANT_SWITCH = 4;
const PARTY_ACTION_ABILITY_PREVENTS = 5;

// LINK_STANDBY_MSG_* constants.
const LINK_STANDBY_MSG_STOP_BOUNCE = 0;
const LINK_STANDBY_STOP_BOUNCE_ONLY = 1;

// BATTLE_TYPE_FRONTIER_NO_PYRAMID (= mask).
const BATTLE_TYPE_FRONTIER_NO_PYRAMID = 1 << 11;
const BATTLE_TYPE_INGAME_PARTNER = 1 << 23;

// CONTROLLER_* opcodes (battle_controllers.h) — pour les emits engine→controller
// (= bufferA[0]). Lus par PlayerBufferRunCommand → sPlayerBufferCommands[opcode].
const CONTROLLER_CHOOSEACTION = 0x12;
const CONTROLLER_CHOOSEMOVE = 0x14;
const CONTROLLER_OPENBAG = 0x15;
const CONTROLLER_CHOOSEPOKEMON = 0x16;
const CONTROLLER_LINKSTANDBYMSG = 0x35;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gBitTable[i]`. */
const _gBitTable: number[] = (() => {
  const t = new Array(32);
  for (let i = 0; i < 32; i++) t[i] = 1 << i;
  return t;
})();

/** 1:1 décomp `gBattleBufferB[battler][i]` controller IPC buffer.
 *  Pour notre port : lazy globalThis lookup (= dette R3 complete buffer). */
function _getBattleBufferB(battler: number, offset: number): number {
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  return stateMod?.gBattleBufferB?.[battler]?.[offset] ?? 0;
}

function _setBattleBufferB(battler: number, offset: number, value: number): void {
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  const buf = stateMod?.gBattleBufferB?.[battler];
  if (buf) buf[offset] = value;
}

/** 1:1 décomp `gSelectionBattleScripts[battler]`. */
const gSelectionBattleScripts: number[] = [0, 0, 0, 0];

/** Wire vers l'interpréteur de battle-script (globalThis, évite le cycle ESM
 *  battle-action-selection ↔ script-interpreter ↔ battle-script-commands). */
function _scriptInterp() {
  return (globalThis as { __scriptInterp?: { stepBattleScriptCommand: (ctx: { scriptPtr: number }) => void; gBattleScriptContext: { scriptPtr: number }; getBattleScriptOffset: (label: string) => number } }).__scriptInterp;
}
/** 1:1 décomp `gBattlescriptCurrInstr` = `gBattleScriptContext.scriptPtr` de l'interpréteur
 *  (le selection-script tourne sur le MÊME ptr que le tour, exactement comme le décomp ;
 *  le tour repose le ptr via HandleAction_UseMove ensuite → 0 corruption). */
function _setBattlescriptCurrInstr(v: number): void { const si = _scriptInterp(); if (si) si.gBattleScriptContext.scriptPtr = v; }
function _getBattlescriptCurrInstr(): number { const si = _scriptInterp(); return si ? si.gBattleScriptContext.scriptPtr : 0; }
/** Résout un label de battle-script en offset bytecode (via l'interpréteur). */
function _getBattleScriptOffset(label: string): number { const si = _scriptInterp(); return si ? si.getBattleScriptOffset(label) : -1; }

/** 1:1 décomp `RecordedBattle_CopyBattlerMoves()`. */
function _RecordedBattle_CopyBattlerMoves(): void {
  // Dette R3 : recorded battle moves copy.
}

/** 1:1 décomp `RecordedBattle_SetBattlerAction(battler, action)`. */
function _RecordedBattle_SetBattlerAction(_battler: number, _action: number): void {
  // Dette R3.
}

/** 1:1 décomp `RecordedBattle_ClearBattlerAction(battler, count)`. */
function _RecordedBattle_ClearBattlerAction(_battler: number, _count: number): void {
  // Dette R3.
}

/** 1:1 décomp `RecordedBattle_CheckMovesetChanges(mode)`. */
function _RecordedBattle_CheckMovesetChanges(_mode: number): void {
  // Dette R3.
}

/** 1:1 décomp `BtlController_EmitChooseAction(buf, action, itemId)`
 *  (battle_controllers.c:1199) : écrit bufferA[0..3] = CHOOSEACTION/action/itemId.
 *  → PlayerBufferRunCommand dispatch PlayerHandleChooseAction (installe le menu
 *  + l'input handler). */
function _BtlController_EmitChooseAction(buf: number, action: number, itemId: number): void {
  PrepareBufferDataTransfer(buf,
    new Uint8Array([CONTROLLER_CHOOSEACTION, action, itemId & 0xFF, (itemId >> 8) & 0xFF]), 4);
}

/** 1:1 décomp `BtlController_EmitChooseMove(buf, isDouble, NoPpNumber, movePpData)`
 *  (battle_controllers.c:1219). Écrit bufferA[0..3]=CHOOSEMOVE+flags PUIS sérialise
 *  le `ChooseMoveStruct` byte-par-byte à partir de bufferA[4] (= `for i<sizeof :
 *  buffer[4+i]=((u8*)movePpData)[i]`).
 *
 *  Layout ChooseMoveStruct (battle.h) : moves[4] u16 @0 ; currentPp[4] u8 @8 ;
 *  maxPp[4] u8 @12 ; species u16 @16 ; monType1/monType2 u8 @18/19. Dans bufferA,
 *  tout est décalé de +4 (l'en-tête opcode).
 *
 *  CRITIQUE — ce buffer N'EST PAS optionnel : `OpponentHandleChooseMove` (branche
 *  wild) ET `_readChooseMoveStruct` (player) LISENT les moves depuis bufferA[4..].
 *  Sans sérialisation, moves[]=0 → le `do { } while (move == MOVE_NONE)` du random
 *  pick wild boucle À L'INFINI (gel). (L'ancien raccourci « opcode seul » = bug.) */
function _BtlController_EmitChooseMove(
  buf: number, isDouble: boolean, noPp: boolean,
  moveInfo: { species: number; monTypes: number[]; moves: number[]; currentPp: number[]; maxPp: number[] },
): void {
  const data = new Uint8Array(4 + 20);
  data[0] = CONTROLLER_CHOOSEMOVE;
  data[1] = isDouble ? 1 : 0;
  data[2] = noPp ? 1 : 0;
  data[3] = 0;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const mv = moveInfo.moves[i] ?? 0;
    data[4 + i * 2] = mv & 0xFF;             // moves[i] lo   (@4,6,8,10)
    data[5 + i * 2] = (mv >> 8) & 0xFF;      // moves[i] hi
    data[12 + i] = (moveInfo.currentPp[i] ?? 0) & 0xFF;  // currentPp[i] (@12..15)
    data[16 + i] = (moveInfo.maxPp[i] ?? 0) & 0xFF;      // maxPp[i]     (@16..19)
  }
  const sp = moveInfo.species ?? 0;
  data[20] = sp & 0xFF;                       // species lo  (@20)
  data[21] = (sp >> 8) & 0xFF;                // species hi  (@21)
  data[22] = (moveInfo.monTypes[0] ?? 0) & 0xFF;  // monType1 (@22)
  data[23] = (moveInfo.monTypes[1] ?? 0) & 0xFF;  // monType2 (@23)
  PrepareBufferDataTransfer(buf, data, data.length);
}

/** 1:1 décomp `BtlController_EmitChooseItem(buf, battlePartyOrder)`
 *  (battle_controllers.c:1232-1240) : écrit gBattleBufferA[active] = [OPENBAG,
 *  partyOrder[0..2]] (4 bytes). INDISPENSABLE : sans ça (ancien stub vide), le
 *  `_MarkBattlerForControllerExec` qui suit re-dispatchait le bufferA[0] PÉRIMÉ →
 *  PlayerHandleChooseItem jamais appelé → bag jamais ouvert → SOFT-LOCK à
 *  STATE_WAIT_ACTION_CASE_CHOSEN (= SAC, MÊME bug que le switch loop #9). */
function _BtlController_EmitChooseItem(buf: number, partyOrder: number[]): void {
  const data = new Uint8Array(4);
  data[0] = CONTROLLER_OPENBAG;
  for (let i = 0; i < 3; i++) data[1 + i] = (partyOrder[i] ?? 0) & 0xFF;
  PrepareBufferDataTransfer(buf, data, 4);
}

/** 1:1 décomp `BtlController_EmitChoosePokemon(buf, caseId, slotId, abilityId, data)`
 *  (battle_controllers.c:1242-1253) : écrit gBattleBufferA[active] = [CHOOSEPOKEMON,
 *  caseId, slotId, abilityId, data[0..2]] (8 bytes). INDISPENSABLE : sans ça (ancien
 *  stub vide), le `_MarkBattlerForControllerExec` qui suit (l.515) re-dispatchait le
 *  bufferA[0] PÉRIMÉ → PlayerHandleChoosePokemon JAMAIS appelé → party menu jamais
 *  ouvert → SOFT-LOCK à STATE_WAIT_ACTION_CASE_CHOSEN (= bug switch volontaire loop #8/9).
 *  MÊME classe que le fix _BtlController_EmitLinkStandbyMsg ci-dessous. */
function _BtlController_EmitChoosePokemon(
  buf: number, caseId: number, mon: number, ability: number, partyOrder: number[],
): void {
  const data = new Uint8Array(8);
  data[0] = CONTROLLER_CHOOSEPOKEMON;
  data[1] = caseId & 0xFF;
  data[2] = mon & 0xFF;
  data[3] = ability & 0xFF;
  for (let i = 0; i < 3; i++) data[4 + i] = (partyOrder[i] ?? 0) & 0xFF;
  PrepareBufferDataTransfer(buf, data, 8);
}

/** 1:1 décomp `BtlController_EmitLinkStandbyMsg(buf, mode, record)`
 *  (battle_controllers.c) : écrit bufferA[0]=LINKSTANDBYMSG + mode → le controller
 *  dispatch PlayerHandleLinkStandbyMsg/OpponentHandleLinkStandbyMsg (qui complètent
 *  immédiatement hors-link).
 *
 *  CRITIQUE — STATE_WAIT_ACTION_CONFIRMED_STANDBY appelle MarkBattlerForControllerExec
 *  (arme l'exec flag) JUSTE APRÈS cet emit. Si l'emit n'écrit PAS un nouvel opcode
 *  (ancien stub noop), le controller re-lit l'ANCIEN bufferA[0] (= CHOOSEMOVE) → le
 *  menu de moves se ré-ouvre en boucle, le battler ne CONFIRME jamais →
 *  ACTIONS_CONFIRMED_COUNT bloqué < gBattlersCount → le tour ne démarre jamais. */
function _BtlController_EmitLinkStandbyMsg(buf: number, mode: number, frame: boolean): void {
  PrepareBufferDataTransfer(buf,
    new Uint8Array([CONTROLLER_LINKSTANDBYMSG, mode & 0xFF, frame ? 1 : 0, 0]), 4);
}

/** 1:1 décomp `BtlController_EmitEndBounceEffect(buf)`. */
function _BtlController_EmitEndBounceEffect(_buf: number): void {
  // Dette R3.
}

/** 1:1 décomp `MarkBattlerForControllerExec(battler)` (battle_util.c) : set le bit
 *  battler dans gBattleControllerExecFlags → le controller s'exécute au prochain
 *  tick de BattleMainCB1. */
function _MarkBattlerForControllerExec(battler: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags | _gBitTable[battler]);
}

/** 1:1 décomp `IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(battler)`
 *  (battle.h) : le controller est ENCORE actif tant que son exec flag est set.
 *  La sélection d'action gate dessus (`if (!...) proceed`) → attend que le
 *  controller (= input joueur) ait fini. (Avant : `return false` = auto-confirme
 *  sans jamais attendre l'input → BUG non-1:1.) */
function _IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(battler: number): boolean {
  return (gBattleControllerExecFlags & _gBitTable[battler]) !== 0;
}

/** 1:1 décomp `IsPlayerPartyAndPokemonStorageFull()`. */
function _IsPlayerPartyAndPokemonStorageFull(): boolean {
  return false;
}

/** 1:1 décomp `AreAllMovesUnusable()`. */
function _AreAllMovesUnusable(): boolean {
  // Dette R3 : check si tous les moves unusable (= struggle case).
  return false;
}

/** 1:1 décomp `TrySetCantSelectMoveBattleScript()`. */
function _TrySetCantSelectMoveBattleScript(): boolean {
  return false;
}

/** 1:1 décomp `gPPUpGetMask[MAX_MON_MOVES]` (pokemon.c) : masque 2 bits par slot. */
const _gPPUpGetMask = [0x03, 0x0C, 0x30, 0xC0];

/** 1:1 décomp `CalculatePPWithBonus(move, ppBonuses, moveIndex)` (pokemon.c) :
 *  `basePP + (basePP * 20 * nbPPUp) / 100`, nbPPUp = `(gPPUpGetMask[idx] &
 *  ppBonuses) >> (2*idx)` (0..3), basePP = `gBattleMoves[move].pp`.
 *  AVANT : stub → 35 fixe → max PP faux pour tout move ≠35 PP (ex Leer affiché
 *  « 30/35 » au lieu de « 30/30 »). */
function _CalculatePPWithBonus(move: number, ppBonuses: number, idx: number): number {
  const basePP = getBattleMove(move).pp;
  const ppUps = (_gPPUpGetMask[idx] & ppBonuses) >> (2 * idx);
  return (basePP + Math.floor((basePP * 20 * ppUps) / 100)) & 0xFF;
}

/** 1:1 décomp `ABILITY_ON_OPPOSING_FIELD(battler, ability)`. */
function _ABILITY_ON_OPPOSING_FIELD(_battler: number, _ability: number): number {
  return 0;
}

/** 1:1 décomp `AbilityBattleEffects(effect, battler, ability, ...)`. */
function _AbilityBattleEffects(_effect: number, _battler: number, _ability: number, _a: number, _b: number): number {
  return 0;
}

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)`. */
function _IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (= K14b wire). */
function _IsRunningFromBattleImpossible(): number {
  // Wire vers try-run-from-battle.ts (= K14b).
  const m = (globalThis as { IsRunningFromBattleImpossible?: () => number }).IsRunningFromBattleImpossible;
  return m?.() ?? 0;
}

/** 1:1 décomp `BATTLE_RUN_SUCCESS` = 0. */
const BATTLE_RUN_SUCCESS = 0;

/** 1:1 décomp `BattleScriptExecute(label)` : démarre un battle-script IMBRIQUÉ via le
 *  callback stack (push gBattleMainFunc → RunBattleScriptCommands_PopCallbacksStack →
 *  step jusqu'à end2 → pop → reprend HandleTurnActionSelectionState). Wire vers
 *  battle-main-functions (globalThis, évite le cycle ESM). Mécanisme déjà validé (fin
 *  de combat). Utilisé ici pour PrintCantRunFromTrainer (« Pas question de fuir! »). */
function _BattleScriptExecute(label: string): void {
  const bmf = (globalThis as { __battleMainFunctions?: { BattleScriptExecute?: (label: string) => void } }).__battleMainFunctions;
  if (bmf?.BattleScriptExecute) bmf.BattleScriptExecute(label);
}

/** 1:1 décomp `gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]()` : exécute UNE
 *  commande du selection-script via l'interpréteur (sur gBattleScriptContext, dont
 *  scriptPtr a été posé par _setBattlescriptCurrInstr). Print-only + endselectionscript
 *  → pas de Cmd_end/B_ACTION_TRY_FINISH, ctx du tour non corrompu. */
function _runBattleScriptingCommand(_opcode: number): void {
  const si = _scriptInterp();
  if (si) si.stepBattleScriptCommand(si.gBattleScriptContext);
}

/** 1:1 décomp `SwitchPartyOrderInGameMulti(battler, monIdx)`. */
function _SwitchPartyOrderInGameMulti(_battler: number, _monIdx: number): void {
  // Dette R3 : ingame multi party order swap.
}

/** 1:1 décomp `gBattlePalaceMoveSelectionRngValue` + `gRngValue`. */
let _gBattlePalaceMoveSelectionRngValue = 0;
let _gRngValue = 0;
function _setRngValue(v: number): void { _gRngValue = v; }

// BattleScript_* offsets résolus lazily via _getBattleScriptOffset(label) au point
// d'usage (le wire interpréteur n'est posé qu'au runtime, pas à l'import).

/** Wire vers K17 helpers. */
function _AllAtActionConfirmed(): boolean {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    AllAtActionConfirmed?: () => boolean;
  } | undefined;
  return m?.AllAtActionConfirmed?.() ?? false;
}

function _UpdateBattlerPartyOrdersOnSwitch(): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    UpdateBattlerPartyOrdersOnSwitch?: () => void;
  } | undefined;
  m?.UpdateBattlerPartyOrdersOnSwitch?.();
}

/** Wire vers K17 SetActionsAndBattlersTurnOrder. */
function _SetActionsAndBattlersTurnOrder(): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    SetActionsAndBattlersTurnOrder?: () => void;
  } | undefined;
  m?.SetActionsAndBattlersTurnOrder?.();
}

/** Wire vers K8 setBattleMainFunc. */
function _setBattleMainFunc(fn: () => void): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setBattleMainFunc?: (fn: () => void) => void;
  } | undefined;
  m?.setBattleMainFunc?.(fn);
}

// ─── HandleTurnActionSelectionState (battle_main.c:4129-4552) ──────────────

/** 1:1 décomp `HandleTurnActionSelectionState()` (battle_main.c:4129-4552).
 *  State machine principal pour sélection des actions battlers à chaque tour.
 *
 *  Iterate battlers + dispatch sur gBattleCommunication[battler] state.
 *  Final check : si tous battlers confirmé → SetActionsAndBattlersTurnOrder. */
export function HandleTurnActionSelectionState(): void {
  let i: number;

  gBattleCommunication[ACTIONS_CONFIRMED_COUNT] = 0;

  for (let active = 0; active < gBattlersCount; active++) {
    setActiveBattler(active);
    const position = GetBattlerPosition(active);

    switch (gBattleCommunication[active]) {
      case STATE_TURN_START_RECORD:
        // 1:1 décomp ll. 4139-4142.
        _RecordedBattle_CopyBattlerMoves();
        gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
        break;

      case STATE_BEFORE_ACTION_CHOSEN:
        // 1:1 décomp ll. 4143-4174.
        gBattleStruct.monToSwitchIntoId[active] = PARTY_SIZE;

        if ((gBattleTypeFlags & BATTLE_TYPE_MULTI)
            || (position & BIT_FLANK) === B_FLANK_LEFT
            || (gBattleStruct.absentBattlerFlags & _gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(position))])
            || gBattleCommunication[GetBattlerAtPosition(BATTLE_PARTNER(position))] === STATE_WAIT_ACTION_CONFIRMED) {

          if (gBattleStruct.absentBattlerFlags & _gBitTable[active]) {
            gChosenActionByBattler[active] = B_ACTION_NOTHING_FAINTED;
            if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED;
            } else {
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
            }
          } else {
            if ((gBattleMons[active].status2 & STATUS2_MULTIPLETURNS)
                || (gBattleMons[active].status2 & STATUS2_RECHARGE)) {
              gChosenActionByBattler[active] = B_ACTION_USE_MOVE;
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
            } else {
              _BtlController_EmitChooseAction(B_COMM_TO_CONTROLLER, gChosenActionByBattler[0],
                _getBattleBufferB(0, 1) | (_getBattleBufferB(0, 2) << 8));
              _MarkBattlerForControllerExec(active);
              gBattleCommunication[active]++;
            }
          }
        }
        break;

      case STATE_WAIT_ACTION_CHOSEN:
        // 1:1 décomp ll. 4175-4353.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 1));
          gChosenActionByBattler[active] = _getBattleBufferB(active, 1);

          const chosenAction = _getBattleBufferB(active, 1);

          if (chosenAction === B_ACTION_USE_MOVE) {
            // 1:1 décomp ll. 4183-4220.
            if (_AreAllMovesUnusable()) {
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;  // FALSE
              gBattleStruct.stateIdAfterSelScript[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
              gBattleStruct.moveTarget[active] = _getBattleBufferB(active, 3);
              return;
            } else if (gDisableStructs[active].encoredMove !== 0) {
              gChosenMoveByBattler[active] = gDisableStructs[active].encoredMove;
              gBattleStruct.chosenMovePositions[active] = gDisableStructs[active].encoredMovePos;
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
              return;
            } else {
              // 1:1 décomp ll. 4199-4218 : ChooseMoveStruct moveInfo populate + Emit.
              const moveInfo = {
                species: gBattleMons[active].species,
                monTypes: [gBattleMons[active].type1, gBattleMons[active].type2],
                moves: [0, 0, 0, 0] as number[],
                currentPp: [0, 0, 0, 0] as number[],
                maxPp: [0, 0, 0, 0] as number[],
              };
              for (i = 0; i < MAX_MON_MOVES; i++) {
                moveInfo.moves[i] = gBattleMons[active].moves[i];
                moveInfo.currentPp[i] = gBattleMons[active].pp[i];
                moveInfo.maxPp[i] = _CalculatePPWithBonus(
                  gBattleMons[active].moves[i],
                  gBattleMons[active].ppBonuses,
                  i,
                );
              }

              _BtlController_EmitChooseMove(B_COMM_TO_CONTROLLER,
                (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0, false, moveInfo);
              _MarkBattlerForControllerExec(active);
            }
          } else if (chosenAction === B_ACTION_USE_ITEM) {
            // 1:1 décomp ll. 4221-4239 : item use check link/frontier restriction.
            if (gBattleTypeFlags & (BATTLE_TYPE_LINK
                                    | BATTLE_TYPE_FRONTIER_NO_PYRAMID
                                    | BATTLE_TYPE_EREADER_TRAINER
                                    | BATTLE_TYPE_RECORDED_LINK)) {
              _RecordedBattle_ClearBattlerAction(active, 1);
              gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_ActionSelectionItemsCantBeUsed');
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;
              gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
              return;
            } else {
              _BtlController_EmitChooseItem(B_COMM_TO_CONTROLLER, gBattleStruct.battlerPartyOrders[active]);
              _MarkBattlerForControllerExec(active);
            }
          } else if (chosenAction === B_ACTION_SWITCH) {
            // 1:1 décomp ll. 4240-4267 : switch ability check (Shadow Tag/Arena Trap/Magnet Pull).
            gBattleStruct.battlerPartyIndexes[active] = active /* gBattlerPartyIndexes[active] */;

            if ((gBattleMons[active].status2 & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION))
                || (gBattleTypeFlags & BATTLE_TYPE_ARENA)
                || (gStatuses3[active] & STATUS3_ROOTED)) {
              _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CANT_SWITCH,
                PARTY_SIZE, ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
            } else if ((i = _ABILITY_ON_OPPOSING_FIELD(active, ABILITY_SHADOW_TAG))
                       || ((i = _ABILITY_ON_OPPOSING_FIELD(active, ABILITY_ARENA_TRAP))
                           && !_IS_BATTLER_OF_TYPE(active, TYPE_FLYING)
                           && gBattleMons[active].ability !== ABILITY_LEVITATE)
                       || ((i = _AbilityBattleEffects(15 /* ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER */,
                                                      active, ABILITY_MAGNET_PULL, 0, 0))
                           && _IS_BATTLER_OF_TYPE(active, TYPE_STEEL))) {
              _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER,
                ((i - 1) << 4) | PARTY_ACTION_ABILITY_PREVENTS,
                PARTY_SIZE, gLastUsedAbility, gBattleStruct.battlerPartyOrders[active]);
            } else {
              // 1:1 décomp ll. 4258-4264 : double battle partner switch coordination.
              if (active === 2 && gChosenActionByBattler[0] === B_ACTION_SWITCH) {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  gBattleStruct.monToSwitchIntoId[0], ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              } else if (active === 3 && gChosenActionByBattler[1] === B_ACTION_SWITCH) {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  gBattleStruct.monToSwitchIntoId[1], ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              } else {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  PARTY_SIZE, ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              }
            }
            _MarkBattlerForControllerExec(active);
          } else if (chosenAction === B_ACTION_SAFARI_BALL) {
            // 1:1 décomp ll. 4268-4277.
            if (_IsPlayerPartyAndPokemonStorageFull()) {
              gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_PrintFullBox');
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;
              gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
              return;
            }
          } else if (chosenAction === B_ACTION_SAFARI_POKEBLOCK) {
            _BtlController_EmitChooseItem(B_COMM_TO_CONTROLLER, gBattleStruct.battlerPartyOrders[active]);
            _MarkBattlerForControllerExec(active);
          } else if (chosenAction === B_ACTION_CANCEL_PARTNER) {
            // 1:1 décomp ll. 4282-4320 : cancel partner action.
            const partner = GetBattlerAtPosition(BATTLE_PARTNER(position));
            gBattleCommunication[active] = STATE_WAIT_SET_BEFORE_ACTION;
            gBattleCommunication[partner] = STATE_BEFORE_ACTION_CHOSEN;
            _RecordedBattle_ClearBattlerAction(active, 1);

            if ((gBattleMons[partner].status2 & STATUS2_MULTIPLETURNS)
                || (gBattleMons[partner].status2 & STATUS2_RECHARGE)) {
              _BtlController_EmitEndBounceEffect(B_COMM_TO_CONTROLLER);
              _MarkBattlerForControllerExec(active);
              return;
            } else if (gChosenActionByBattler[partner] === B_ACTION_SWITCH) {
              _RecordedBattle_ClearBattlerAction(partner, 2);
            } else if (gChosenActionByBattler[partner] === B_ACTION_RUN) {
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else if (gChosenActionByBattler[partner] === B_ACTION_USE_MOVE
                       && (gProtectStructs[partner].noValidMoves
                           || gDisableStructs[partner].encoredMove)) {
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else if ((gBattleTypeFlags & BATTLE_TYPE_PALACE)
                       && gChosenActionByBattler[partner] === B_ACTION_USE_MOVE) {
              _setRngValue(_gBattlePalaceMoveSelectionRngValue);
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else {
              _RecordedBattle_ClearBattlerAction(partner, 3);
            }
            _BtlController_EmitEndBounceEffect(B_COMM_TO_CONTROLLER);
            _MarkBattlerForControllerExec(active);
            return;
          }

          // 1:1 décomp ll. 4322-4351 : trainer flee block + IsRunningFromBattleImpossible.
          if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
              && (gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL))
              && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_AskIfWantsToForfeitMatch');
            gBattleCommunication[active] = STATE_SELECTION_SCRIPT_MAY_RUN;
            gBattleStruct.selectionScriptFinished[active] = 0;
            gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
            return;
          } else if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
                     && !(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
                     && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            _BattleScriptExecute('BattleScript_PrintCantRunFromTrainer');
            gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
          } else if (_IsRunningFromBattleImpossible() !== BATTLE_RUN_SUCCESS
                     && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_PrintCantEscapeFromBattle');
            gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
            gBattleStruct.selectionScriptFinished[active] = 0;
            gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
            return;
          } else {
            gBattleCommunication[active]++;
          }
        }
        break;

      case STATE_WAIT_ACTION_CASE_CHOSEN:
        // 1:1 décomp ll. 4354-4457 : per-action sub-state processing.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          const chosen = gChosenActionByBattler[active];

          if (chosen === B_ACTION_USE_MOVE) {
            const subAction = _getBattleBufferB(active, 1);
            // 1:1 décomp ll. 4360-4404.
            if (subAction >= 3 && subAction <= 9) {
              gChosenActionByBattler[active] = subAction;
              return;
            } else if (subAction === 15) {
              gChosenActionByBattler[active] = B_ACTION_SWITCH;
              _UpdateBattlerPartyOrdersOnSwitch();
              return;
            } else {
              _RecordedBattle_CheckMovesetChanges(1 /* B_RECORD_MODE_PLAYBACK */);
              const moveValue = _getBattleBufferB(active, 2) | (_getBattleBufferB(active, 3) << 8);
              if (moveValue === 0xFFFF) {
                gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
                _RecordedBattle_ClearBattlerAction(active, 1);
              } else if (_TrySetCantSelectMoveBattleScript()) {
                _RecordedBattle_ClearBattlerAction(active, 1);
                gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
                gBattleStruct.selectionScriptFinished[active] = 0;
                _setBattleBufferB(active, 1, B_ACTION_USE_MOVE);
                gBattleStruct.stateIdAfterSelScript[active] = STATE_WAIT_ACTION_CHOSEN;
                return;
              } else {
                if (!(gBattleTypeFlags & BATTLE_TYPE_PALACE)) {
                  _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 2));
                  _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 3));
                }
                gBattleStruct.chosenMovePositions[active] = _getBattleBufferB(active, 2);
                gChosenMoveByBattler[active] = gBattleMons[active].moves[gBattleStruct.chosenMovePositions[active]];
                gBattleStruct.moveTarget[active] = _getBattleBufferB(active, 3);
                gBattleCommunication[active]++;
              }
            }
          } else if (chosen === B_ACTION_USE_ITEM) {
            const itemValue = _getBattleBufferB(active, 1) | (_getBattleBufferB(active, 2) << 8);
            if (itemValue === 0) {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
            } else {
              setLastUsedItem(itemValue);
              gBattleCommunication[active]++;
            }
          } else if (chosen === B_ACTION_SWITCH) {
            if (_getBattleBufferB(active, 1) === PARTY_SIZE) {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
              _RecordedBattle_ClearBattlerAction(active, 1);
            } else {
              _UpdateBattlerPartyOrdersOnSwitch();
              gBattleCommunication[active]++;
            }
          } else if (chosen === B_ACTION_RUN) {
            setHitMarker(gHitMarker | 1 /* HITMARKER_RUN */);
            gBattleCommunication[active]++;
          } else if (chosen === B_ACTION_SAFARI_WATCH_CAREFULLY
                     || chosen === B_ACTION_SAFARI_BALL
                     || chosen === B_ACTION_SAFARI_GO_NEAR
                     || chosen === B_ACTION_WALLY_THROW) {
            gBattleCommunication[active]++;
          } else if (chosen === B_ACTION_SAFARI_POKEBLOCK) {
            const pokeblockValue = _getBattleBufferB(active, 1) | (_getBattleBufferB(active, 2) << 8);
            if (pokeblockValue !== 0) {
              gBattleCommunication[active]++;
            } else {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
            }
          } else if (chosen === B_ACTION_SAFARI_RUN) {
            setHitMarker(gHitMarker | 1 /* HITMARKER_RUN */);
            gBattleCommunication[active]++;
          }
        }
        break;

      case STATE_WAIT_ACTION_CONFIRMED_STANDBY:
        // 1:1 décomp ll. 4458-4479.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          const allConfirmed = _AllAtActionConfirmed();
          if (((gBattleTypeFlags & BATTLE_TYPE_MULTI) || !(gBattleTypeFlags & BATTLE_TYPE_DOUBLE))
              || (position & BIT_FLANK) !== B_FLANK_LEFT
              || (gBattleStruct.absentBattlerFlags & _gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(position))])) {
            _BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_MSG_STOP_BOUNCE, allConfirmed);
          } else {
            _BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_STOP_BOUNCE_ONLY, allConfirmed);
          }
          _MarkBattlerForControllerExec(active);
          gBattleCommunication[active]++;
        }
        break;

      case STATE_WAIT_ACTION_CONFIRMED:
        // 1:1 décomp ll. 4480-4485.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          gBattleCommunication[ACTIONS_CONFIRMED_COUNT]++;
        }
        break;

      case STATE_SELECTION_SCRIPT:
        // 1:1 décomp ll. 4486-4501.
        if (gBattleStruct.selectionScriptFinished[active]) {
          gBattleCommunication[active] = gBattleStruct.stateIdAfterSelScript[active];
        } else {
          setBattlerAttacker(active);
          _setBattlescriptCurrInstr(gSelectionBattleScripts[active]);
          if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
            _runBattleScriptingCommand(_getBattlescriptCurrInstr());
          }
          gSelectionBattleScripts[active] = _getBattlescriptCurrInstr();
        }
        break;

      case STATE_WAIT_SET_BEFORE_ACTION:
        // 1:1 décomp ll. 4502-4507.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
        }
        break;

      case STATE_SELECTION_SCRIPT_MAY_RUN:
        // 1:1 décomp ll. 4508-4533.
        if (gBattleStruct.selectionScriptFinished[active]) {
          if (_getBattleBufferB(active, 1) === B_ACTION_NOTHING_FAINTED) {
            setHitMarker(gHitMarker | 1 /* HITMARKER_RUN */);
            gChosenActionByBattler[active] = B_ACTION_RUN;
            gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
          } else {
            _RecordedBattle_ClearBattlerAction(active, 1);
            gBattleCommunication[active] = gBattleStruct.stateIdAfterSelScript[active];
          }
        } else {
          setBattlerAttacker(active);
          _setBattlescriptCurrInstr(gSelectionBattleScripts[active]);
          if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
            _runBattleScriptingCommand(_getBattlescriptCurrInstr());
          }
          gSelectionBattleScripts[active] = _getBattlescriptCurrInstr();
        }
        break;
    }
  }

  // 1:1 décomp ll. 4537-4551 : check si tous battlers ont confirmé.
  if (gBattleCommunication[ACTIONS_CONFIRMED_COUNT] === gBattlersCount) {
    _RecordedBattle_CheckMovesetChanges(0 /* B_RECORD_MODE_RECORDING */);
    _setBattleMainFunc(_SetActionsAndBattlersTurnOrder);

    if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
      for (i = 0; i < gBattlersCount; i++) {
        if (gChosenActionByBattler[i] === B_ACTION_SWITCH) {
          _SwitchPartyOrderInGameMulti(i, gBattleStruct.monToSwitchIntoId[i]);
        }
      }
    }
  }

  // Suppress unused refs (= imports utilisés indirectement).
  void gActiveBattler; void gBattlerAttacker; void gLastUsedItem;
  void MAX_BATTLERS_COUNT;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleActionSelection = {
  HandleTurnActionSelectionState,
  STATE_TURN_START_RECORD, STATE_BEFORE_ACTION_CHOSEN, STATE_WAIT_ACTION_CHOSEN,
  STATE_WAIT_ACTION_CASE_CHOSEN, STATE_WAIT_ACTION_CONFIRMED_STANDBY,
  STATE_WAIT_ACTION_CONFIRMED, STATE_SELECTION_SCRIPT,
  STATE_WAIT_SET_BEFORE_ACTION, STATE_SELECTION_SCRIPT_MAY_RUN,
};

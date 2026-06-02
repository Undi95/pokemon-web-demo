/**
 * battle/battle-controller-opponent.ts — Port 1:1 strict de l'Opponent Controller.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controller_opponent.c`
 * (~2027 lignes C, ~95 handlers).
 *
 * Structure symétrique au Player controller (K31) :
 *   - sOpponentBufferCommands[CONTROLLER_CMDS_COUNT] : dispatch table
 *   - SetControllerToOpponent : install OpponentBufferRunCommand
 *   - OpponentBufferRunCommand : dispatch sOpponentBufferCommands[bufferA[0]]()
 *   - OpponentBufferExecCompleted : reset func + clear exec flag
 *
 * **User priority** : nécessaire pour premier combat rival.
 *
 * ## Différence vs Player
 *
 * Opponent controller :
 *   - Pas d'input UI (= ChooseAction/Move/Item sont AI-driven)
 *   - Sprite côté droit du screen
 *   - Wild battle : sprite mon front
 *   - Trainer battle : sprite trainer pic puis send-out
 *
 * ## Port progressif
 *
 * **Phase A (this commit)** : dispatcher + 56 handlers core (= structure
 * 1:1 strict avec ExecCompleted immediate pour permettre flow).
 *
 * **Phase B/C** : AI choose move complet + send-out anim cascade visuels.
 *
 * Dépendances :
 *   - K29 battle-controllers-ipc : gBattleBufferA/B + PrepareBufferDataTransfer
 *   - state.ts : gActiveBattler + gBattleTypeFlags
 *   - battle-controllers.ts : gBitTable + MarkBattlerForControllerExec
 */

import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gAbsentBattlerFlags, gBattlerTarget, setBattlerTarget,
  setBattlerControllerFunc,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE,
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_ROAMER,
  B_ACTION_EXEC_SCRIPT, B_ACTION_RUN,
  B_ACTION_SAFARI_WATCH_CAREFULLY,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_BOTH,
  MAX_MON_MOVES, MOVE_NONE,
} from './constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
} from './battle-controllers-ipc';
import { gBitTable } from './battle-controllers';
import {
  GetBattlerAtPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
} from './util';
import { getBattleMove } from './data/battle-moves';
import { gEnemyParty, GetMonData, MON_DATA_HP } from './party-storage';

// ─── Constants 1:1 décomp (= same as Player) ───────────────────────────────

const CONTROLLER_CMDS_COUNT = 56;
const CONTROLLER_TERMINATOR_NOP = 55;

// CONTROLLER_* opcodes (= duplicate from K31 pour avoid cross-import cycle).
const CONTROLLER_GETMONDATA = 0x00;
const CONTROLLER_GETRAWMONDATA = 0x01;
const CONTROLLER_SETMONDATA = 0x02;
const CONTROLLER_SETRAWMONDATA = 0x03;
const CONTROLLER_LOADMONSPRITE = 0x04;
const CONTROLLER_SWITCHINANIM = 0x05;
const CONTROLLER_RETURNMONTOBALL = 0x06;
const CONTROLLER_DRAWTRAINERPIC = 0x07;
const CONTROLLER_TRAINERSLIDE = 0x08;
const CONTROLLER_TRAINERSLIDEBACK = 0x09;
const CONTROLLER_FAINTANIMATION = 0x0A;
const CONTROLLER_PALETTEFADE = 0x0B;
const CONTROLLER_SUCCESSBALLTHROWANIM = 0x0C;
const CONTROLLER_BALLTHROWANIM = 0x0D;
const CONTROLLER_PAUSE = 0x0E;
const CONTROLLER_MOVEANIMATION = 0x0F;
const CONTROLLER_PRINTSTRING = 0x10;
const CONTROLLER_PRINTSTRINGPLAYERONLY = 0x11;
const CONTROLLER_CHOOSEACTION = 0x12;
const CONTROLLER_YESNOBOX = 0x13;
const CONTROLLER_CHOOSEMOVE = 0x14;
const CONTROLLER_OPENBAG = 0x15;
const CONTROLLER_CHOOSEPOKEMON = 0x16;
const CONTROLLER_23 = 0x17;
const CONTROLLER_HEALTHBARUPDATE = 0x18;
const CONTROLLER_EXPUPDATE = 0x19;
const CONTROLLER_STATUSICONUPDATE = 0x1A;
const CONTROLLER_STATUSANIMATION = 0x1B;
const CONTROLLER_STATUSXOR = 0x1C;
const CONTROLLER_DATATRANSFER = 0x1D;
const CONTROLLER_DMA3TRANSFER = 0x1E;
const CONTROLLER_PLAYBGM = 0x1F;
const CONTROLLER_32 = 0x20;
const CONTROLLER_TWORETURNVALUES = 0x21;
const CONTROLLER_CHOSENMONRETURNVALUE = 0x22;
const CONTROLLER_ONERETURNVALUE = 0x23;
const CONTROLLER_ONERETURNVALUE_DUPLICATE = 0x24;
const CONTROLLER_CLEARUNKVAR = 0x25;
const CONTROLLER_SETUNKVAR = 0x26;
const CONTROLLER_CLEARUNKFLAG = 0x27;
const CONTROLLER_TOGGLEUNKFLAG = 0x28;
const CONTROLLER_HITANIMATION = 0x29;
const CONTROLLER_CANTSWITCH = 0x2A;
const CONTROLLER_PLAYSE = 0x2B;
const CONTROLLER_PLAYFANFAREORBGM = 0x2C;
const CONTROLLER_FAINTINGCRY = 0x2D;
const CONTROLLER_INTROSLIDE = 0x2E;
const CONTROLLER_INTROTRAINERBALLTHROW = 0x2F;
const CONTROLLER_DRAWPARTYSTATUSSUMMARY = 0x30;
const CONTROLLER_HIDEPARTYSTATUSSUMMARY = 0x31;
const CONTROLLER_ENDBOUNCE = 0x32;
const CONTROLLER_SPRITEINVISIBILITY = 0x33;
const CONTROLLER_BATTLEANIMATION = 0x34;
const CONTROLLER_LINKSTANDBYMSG = 0x35;
const CONTROLLER_RESETACTIONMOVESELECTION = 0x36;
const CONTROLLER_ENDLINKBATTLE = 0x37;

// ─── gBattlerControllerFuncs lazy lookup (= shared avec K31) ───────────────

function _setBattlerControllerFunc(battler: number, fn: () => void): void {
  // 1:1 décomp `gBattlerControllerFuncs[gActiveBattler] = fn` : écrit dans la
  // table PARTAGÉE (state.ts), la même que tick BattleMainCB1 + player.
  setBattlerControllerFunc(battler, fn);
}

// ─── OpponentBufferRunCommand + ExecCompleted ──────────────────────────────

/** 1:1 décomp `OpponentBufferExecCompleted()` (battle_controller_opponent.c). */
function OpponentBufferExecCompleted(): void {
  _setBattlerControllerFunc(gActiveBattler, OpponentBufferRunCommand);
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    // Dette R3 : link path (user "Report").
    gBattleBufferA[gActiveBattler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[gActiveBattler]);
  }
}

/** 1:1 décomp `OpponentBufferRunCommand()` (battle_controller_opponent.c:180-189). */
export function OpponentBufferRunCommand(): void {
  if (gBattleControllerExecFlags & gBitTable[gActiveBattler]) {
    const opcode = gBattleBufferA[gActiveBattler][0];
    if (opcode < CONTROLLER_CMDS_COUNT) {
      const handler = sOpponentBufferCommands[opcode];
      if (handler) handler();
      else OpponentBufferExecCompleted();
    } else {
      OpponentBufferExecCompleted();
    }
  }
}

// ─── SetControllerToOpponent (battle_controller_opponent.c:175-178) ────────

/** 1:1 décomp `SetControllerToOpponent()` (battle_controller_opponent.c:175-178). */
export function SetControllerToOpponent(): void {
  _setBattlerControllerFunc(gActiveBattler, OpponentBufferRunCommand);
}

// ─── 56 handlers (structure 1:1 strict + ExecCompleted) ────────────────────

/** Handlers symétriques au Player. Spécificités opponent :
 *  - ChooseAction/Move : AI-driven (= notre AI bytecode K1)
 *  - DrawTrainerPic : opponent trainer pic
 *  - Sprite côté droit screen
 *  - Send-out anim wild ou trainer */

function OpponentHandleGetMonData(): void {
  // 1:1 décomp : copy enemy mon → buffer. Dette R3 full serialize.
  const monData = new Uint8Array(0x80);
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, monData, 4);
  void gBattleBufferB;
  OpponentBufferExecCompleted();
}

function OpponentHandleGetRawMonData(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetMonData(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetRawMonData(): void { OpponentBufferExecCompleted(); }
function OpponentHandleLoadMonSprite(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleSwitchInAnim()` (battle_controller_opponent.c:1160-1166).
 *  Set gBattleStruct.monToSwitchIntoId = PARTY_SIZE + set party index +
 *  StartSendOutAnim opponent + install SwitchIn_TryShinyAnim. */
function OpponentHandleSwitchInAnim(): void {
  _setMonToSwitchIntoId(gActiveBattler, _PARTY_SIZE);
  _setBattlerPartyIndex(gActiveBattler, gBattleBufferA[gActiveBattler][1]);
  _StartSendOutAnim_Opponent(gActiveBattler, gBattleBufferA[gActiveBattler][2] !== 0);
  _installSwitchInTryShinyAnim(gActiveBattler);
}

/** 1:1 décomp `PARTY_SIZE` = 6. */
const _PARTY_SIZE = 6;

/** Wire helpers via globalThis. */
function _setMonToSwitchIntoId(_battler: number, _v: number): void {
  // Dette R3 : gBattleStruct.monToSwitchIntoId[battler] = v.
  const m = (globalThis as { __battleState?: { gBattleStruct?: { monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.monToSwitchIntoId) m.gBattleStruct.monToSwitchIntoId[_battler] = _v;
}

function _setBattlerPartyIndex(battler: number, idx: number): void {
  const m = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } }).__battleState;
  if (m?.gBattlerPartyIndexes) m.gBattlerPartyIndexes[battler] = idx;
}

function _StartSendOutAnim_Opponent(battler: number, dontClearSubstituteBit: boolean): void {
  // Dette R3 : full sprite cascade + DoPokeballSendOutAnimation POKEBALL_OPPONENT.
  const m = (globalThis as { __battleBallThrow?: { doPokeballSendOutAnimationOpponent?: (b: number, c: boolean) => void } }).__battleBallThrow;
  m?.doPokeballSendOutAnimationOpponent?.(battler, dontClearSubstituteBit);
}

function _installSwitchInTryShinyAnim(_battler: number): void {
  // Dette R3 : full shiny anim controller. Pour now : immediate.
  // Note : called via gBattlerControllerFuncs install par controller dispatch,
  // mais nous appelons via le hook qui mappe vers OpponentBufferExecCompleted.
  OpponentBufferExecCompleted();
}
function OpponentHandleReturnMonToBall(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDrawTrainerPic(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlide(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlideBack(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleFaintAnimation()` (battle_controller_opponent.c:1408-1426).
 *  State machine 2-step symétrique au PlayerHandleFaintAnimation :
 *    State 0 : behindSubstitute check + animationState++
 *    State 1 : !specialAnimActive → reset state + PlaySE12 SE_FAINT TARGET pan
 *      + sprite callback SpriteCB_FaintOpponentMon + install HideHealthboxAfterMonFaint. */
function OpponentHandleFaintAnimation(): void {
  const animState = _getHealthBoxAnimationState(gActiveBattler);
  if (animState === 0) {
    if (_isBehindSubstitute(gActiveBattler)) {
      _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
    }
    _setHealthBoxAnimationState(gActiveBattler, animState + 1);
  } else {
    if (!_isSpecialAnimActive(gActiveBattler)) {
      _setHealthBoxAnimationState(gActiveBattler, 0);
      _PlaySE12WithPanning(_SE_FAINT_OP, _SOUND_PAN_TARGET);
      _triggerFaintSlideAnim_Opponent(gActiveBattler);
      // Install HideHealthboxAfterMonFaint (dette R3 hide healthbox).
      OpponentBufferExecCompleted();
    }
  }
}

const _B_ANIM_SUBSTITUTE_TO_MON = 6;
const _SE_FAINT_OP = 21;
const _SOUND_PAN_TARGET = 63;

function _getHealthBoxAnimationState(battler: number): number {
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxAnimationState?: (b: number) => number } }).__battleSpritesData;
  return m?.getHealthBoxAnimationState?.(battler) ?? 0;
}
function _setHealthBoxAnimationState(battler: number, v: number): void {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: (b: number, v: number) => void } }).__battleSpritesData;
  m?.setHealthBoxAnimationState?.(battler, v);
}
function _isBehindSubstitute(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isBehindSubstitute?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isBehindSubstitute?.(battler);
}
function _isSpecialAnimActive(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isSpecialAnimActive?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isSpecialAnimActive?.(battler);
}
function _InitAndLaunchSpecialAnimation(_a: number, _at: number, _t: number, _aid: number): void {
  const m = (globalThis as { __battleAnim?: { initAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleAnim;
  m?.initAndLaunchSpecialAnimation?.(_a, _at, _t, _aid);
}
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
function _triggerFaintSlideAnim_Opponent(battler: number): void {
  const m = (globalThis as { __battleFaintAnim?: { triggerFaintSlide?: (b: number) => void } }).__battleFaintAnim;
  m?.triggerFaintSlide?.(battler);
}
function OpponentHandlePaletteFade(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSuccessBallThrowAnim(): void { OpponentBufferExecCompleted(); }
function OpponentHandleBallThrowAnim(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePause(): void { OpponentBufferExecCompleted(); }
function OpponentHandleMoveAnimation(): void { OpponentBufferExecCompleted(); }

function OpponentHandlePrintString(): void {
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  void stringId;
  OpponentBufferExecCompleted();
}
function OpponentHandlePrintSelectionString(): void { OpponentBufferExecCompleted(); }

/** 1:1 décomp `OpponentHandleChooseAction()` (battle_controller_opponent.c:1540-1544).
 *  AI_TrySwitchOrUseItem + OpponentBufferExecCompleted (= AI decide switch/item
 *  ou use move). */
function OpponentHandleChooseAction(): void {
  _AI_TrySwitchOrUseItem();
  OpponentBufferExecCompleted();
}

function OpponentHandleYesNoBox(): void { OpponentBufferExecCompleted(); }

/** 1:1 décomp `OpponentHandleChooseMove()` (battle_controller_opponent.c:1551-1613).
 *  PALACE → ChooseMoveAndTargetInBattlePalace (dette R3 Frontier) ; sinon
 *  if (TRAINER | FIRST_BATTLE | SAFARI | ROAMER) → AI bytecode K1 :
 *    - BattleAI_SetupAIData(ALL_MOVES_MASK) + BattleAI_ChooseMoveOrAction
 *    - switch chosenMoveId : AI_CHOICE_WATCH=SAFARI_WATCH ; AI_CHOICE_FLEE=
 *      B_ACTION_RUN ; 6=B_ACTION_UNK_15 ; default=EXEC_SCRIPT moveIdx + target
 *      avec moveTarget USER/USER_OR_SELECTED override gActiveBattler + BOTH
 *      override player_left/right.
 *  sinon (= wild non-trainer) → random move pick + target single/double. */
function OpponentHandleChooseMove(): void {
  if (gBattleTypeFlags & BATTLE_TYPE_PALACE) {
    // Dette R3 : Frontier subsystem (user "Report").
    BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, _ChooseMoveAndTargetInBattlePalace());
    OpponentBufferExecCompleted();
    return;
  }

  // Read ChooseMoveStruct depuis bufferA[4..] : moves[4] u16.
  const buf = gBattleBufferA[gActiveBattler];
  const moves: number[] = [];
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    moves[i] = buf[4 + i * 2] | (buf[5 + i * 2] << 8);
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TRAINER | BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_SAFARI | BATTLE_TYPE_ROAMER)) {
    // AI bytecode path (= notre K1 BattleAI_ChooseMoveOrAction).
    _BattleAI_SetupAIData(_ALL_MOVES_MASK);
    const chosenMoveId = _BattleAI_ChooseMoveOrAction();

    switch (chosenMoveId) {
      case _AI_CHOICE_WATCH:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_SAFARI_WATCH_CAREFULLY, 0);
        break;
      case _AI_CHOICE_FLEE:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_RUN, 0);
        break;
      case 6:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, _B_ACTION_UNK_15, gBattlerTarget);
        break;
      default: {
        const moveTarget = _getMoveTarget(moves[chosenMoveId]);
        if (moveTarget & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) {
          setBattlerTarget(gActiveBattler);
        }
        if (moveTarget & MOVE_TARGET_BOTH) {
          let target = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
          if (gAbsentBattlerFlags & gBitTable[target]) {
            target = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
          }
          setBattlerTarget(target);
        }
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (gBattlerTarget << 8));
        break;
      }
    }
    OpponentBufferExecCompleted();
  } else {
    // Wild non-trainer non-first : random move pick.
    let chosenMoveId: number;
    let move: number;
    do {
      chosenMoveId = _MOD(_Random(), MAX_MON_MOVES);
      move = moves[chosenMoveId];
    } while (move === MOVE_NONE);

    const moveTarget = _getMoveTarget(move);
    if (moveTarget & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (gActiveBattler << 8));
    } else if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (GetBattlerAtPosition(_Random() & 2) << 8));
    } else {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) << 8));
    }
    OpponentBufferExecCompleted();
  }
}

/** 1:1 décomp `ALL_MOVES_MASK` = 0xF (battle_ai.h). */
const _ALL_MOVES_MASK = 0xF;

/** 1:1 décomp `AI_CHOICE_WATCH` = 5 (ai-state.ts). */
const _AI_CHOICE_WATCH = 5;

/** 1:1 décomp `AI_CHOICE_FLEE` = 4 (ai-state.ts). */
const _AI_CHOICE_FLEE = 4;

/** 1:1 décomp `B_ACTION_UNK_15` = 15 (battle.h:43). */
const _B_ACTION_UNK_15 = 15;

/** Wire AI APIs via globalThis lazy lookup (= éviter cycle ESM). */
function _AI_TrySwitchOrUseItem(): void {
  const m = (globalThis as { __battleAi?: { AI_TrySwitchOrUseItem?: () => void } }).__battleAi;
  m?.AI_TrySwitchOrUseItem?.();
}
function _BattleAI_SetupAIData(mask: number): void {
  const m = (globalThis as { __battleAi?: { BattleAI_SetupAIData?: (m: number) => void } }).__battleAi;
  m?.BattleAI_SetupAIData?.(mask);
}
function _BattleAI_ChooseMoveOrAction(): number {
  const m = (globalThis as { __battleAi?: { BattleAI_ChooseMoveOrAction?: () => number } }).__battleAi;
  return m?.BattleAI_ChooseMoveOrAction?.() ?? 0;
}
function _ChooseMoveAndTargetInBattlePalace(): number {
  // Dette R3 : Frontier subsystem.
  return 0;
}

/** 1:1 décomp `gBattleMoves[move].target`. Via getBattleMove (id numérique, .target
 *  résolu en nombre) — gameDataMoves est keyé par ENUM ("MOVE_X"), `parseInt(k,10)`
 *  = NaN → ne matchait jamais → toujours 0 (l'IA ne ciblait jamais USER/BOTH
 *  correctement pour ses moves auto-ciblés ou de zone). */
function _getMoveTarget(move: number): number {
  const t = getBattleMove(move).target;
  return typeof t === 'number' ? t : 0;
}

/** 1:1 décomp `MOD(a, b)` = a % b (gba/macro.h). */
function _MOD(a: number, b: number): number { return a % b; }

/** 1:1 décomp `Random()` (random.c). Wire vers RNG global. */
function _Random(): number {
  const m = (globalThis as { __rng?: { random?: () => number } }).__rng;
  if (m?.random) return m.random() & 0xFFFF;
  return Math.floor(Math.random() * 0x10000);
}

function OpponentHandleChooseItem(): void { OpponentBufferExecCompleted(); }
/** Wire switch-in choice APIs (lazy globalThis = éviter cycle ESM). */
function _GetMostSuitableMonToSwitchInto(): number {
  const m = (globalThis as { __battleAi?: { GetMostSuitableMonToSwitchInto?: () => number } }).__battleAi;
  return m?.GetMostSuitableMonToSwitchInto?.() ?? _PARTY_SIZE;
}
function _getAiMonToSwitchIntoId(b: number): number {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { AI_monToSwitchIntoId?: number[] } } }).__battleState;
  return m?.gBattleStruct?.AI_monToSwitchIntoId?.[b] ?? _PARTY_SIZE;
}
function _setAiMonToSwitchIntoId(b: number, v: number): void {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { AI_monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.AI_monToSwitchIntoId) m.gBattleStruct.AI_monToSwitchIntoId[b] = v;
}
function _getBattlerPartyIndexOpp(b: number): number {
  const m = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } }).__battleState;
  return m?.gBattlerPartyIndexes?.[b] ?? 0;
}

/** 1:1 décomp `OpponentHandleChoosePokemon()` (battle_controller_opponent.c:1621-1676).
 *  Choisit le mon à envoyer : AI_monToSwitchIntoId pré-choisi, sinon
 *  GetMostSuitableMonToSwitchInto, sinon fallback (1er mon non-fainté != mon actif).
 *  Pose `gBattleStruct.monToSwitchIntoId[active]` + émet CHOSENMONRETURNVALUE
 *  (bufferB[1]=chosenMonId, lu par l'engine → monToSwitchIntoId → getswitchedmondata
 *  rafraîchit gBattleMons). Single battle : battler1 = gActiveBattler (l'opponent).
 *  Était un STUB → le 2e mon dresseur n'était jamais chargé (freeze switch-in). */
function OpponentHandleChoosePokemon(): void {
  let chosenMonId: number;
  if (_getAiMonToSwitchIntoId(gActiveBattler) === _PARTY_SIZE) {
    chosenMonId = _GetMostSuitableMonToSwitchInto();
    if (chosenMonId === _PARTY_SIZE) {
      // 1:1 décomp 1655-1663 (chemin single) : 1er mon vivant qui n'est pas le mon actif.
      chosenMonId = 0;
      for (let i = 0; i < _PARTY_SIZE; i++) {
        if ((GetMonData(gEnemyParty[i] as never, MON_DATA_HP) as number) !== 0
            && i !== _getBattlerPartyIndexOpp(gActiveBattler)) {
          chosenMonId = i;
          break;
        }
      }
    }
  } else {
    chosenMonId = _getAiMonToSwitchIntoId(gActiveBattler);
    _setAiMonToSwitchIntoId(gActiveBattler, _PARTY_SIZE);
  }
  _setMonToSwitchIntoId(gActiveBattler, chosenMonId);
  // 1:1 BtlController_EmitChosenMonReturnValue : bufferB[0]=CONTROLLER_CHOSENMONRETURNVALUE
  // (0x22), [1]=chosenMonId → l'engine le lit pour poser monToSwitchIntoId.
  const buf = new Uint8Array(8);
  buf[0] = 0x22;
  buf[1] = chosenMonId;
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, buf, 5);
  OpponentBufferExecCompleted();
}
function OpponentHandleCmd23(): void { OpponentBufferExecCompleted(); }
function OpponentHandleHealthBarUpdate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleExpUpdate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusIconUpdate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusXor(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDataTransfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDMA3Transfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePlayBGM(): void { OpponentBufferExecCompleted(); }
function OpponentHandleCmd32(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTwoReturnValues(): void { OpponentBufferExecCompleted(); }
function OpponentHandleChosenMonReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue_Duplicate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleClearUnkVar(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetUnkVar(): void { OpponentBufferExecCompleted(); }
function OpponentHandleClearUnkFlag(): void { OpponentBufferExecCompleted(); }
function OpponentHandleToggleUnkFlag(): void { OpponentBufferExecCompleted(); }
function OpponentHandleHitAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleCantSwitch(): void { OpponentBufferExecCompleted(); }

function OpponentHandlePlaySE(): void {
  const seId = gBattleBufferA[gActiveBattler][1] | (gBattleBufferA[gActiveBattler][2] << 8);
  void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(seId));
  OpponentBufferExecCompleted();
}

function OpponentHandlePlayFanfareOrBGM(): void { OpponentBufferExecCompleted(); }
function OpponentHandleFaintingCry(): void { OpponentBufferExecCompleted(); }
function OpponentHandleIntroSlide(): void { OpponentBufferExecCompleted(); }
function OpponentHandleIntroTrainerBallThrow(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDrawPartyStatusSummary(): void { OpponentBufferExecCompleted(); }
function OpponentHandleHidePartyStatusSummary(): void { OpponentBufferExecCompleted(); }
function OpponentHandleEndBounceEffect(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSpriteInvisibility(): void { OpponentBufferExecCompleted(); }
function OpponentHandleBattleAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleLinkStandbyMsg(): void { OpponentBufferExecCompleted(); }
function OpponentHandleResetActionMoveSelection(): void { OpponentBufferExecCompleted(); }
function OpponentHandleEndLinkBattle(): void { OpponentBufferExecCompleted(); }
function OpponentCmdEnd(): void { /* NOP terminator */ }

// ─── sOpponentBufferCommands dispatch table (1:1 décomp 107-173) ───────────

/** 1:1 décomp `sOpponentBufferCommands[CONTROLLER_CMDS_COUNT]`. */
export const sOpponentBufferCommands: Array<() => void> = new Array(CONTROLLER_CMDS_COUNT);

function _initSOpponentBufferCommands(): void {
  sOpponentBufferCommands[CONTROLLER_GETMONDATA] = OpponentHandleGetMonData;
  sOpponentBufferCommands[CONTROLLER_GETRAWMONDATA] = OpponentHandleGetRawMonData;
  sOpponentBufferCommands[CONTROLLER_SETMONDATA] = OpponentHandleSetMonData;
  sOpponentBufferCommands[CONTROLLER_SETRAWMONDATA] = OpponentHandleSetRawMonData;
  sOpponentBufferCommands[CONTROLLER_LOADMONSPRITE] = OpponentHandleLoadMonSprite;
  sOpponentBufferCommands[CONTROLLER_SWITCHINANIM] = OpponentHandleSwitchInAnim;
  sOpponentBufferCommands[CONTROLLER_RETURNMONTOBALL] = OpponentHandleReturnMonToBall;
  sOpponentBufferCommands[CONTROLLER_DRAWTRAINERPIC] = OpponentHandleDrawTrainerPic;
  sOpponentBufferCommands[CONTROLLER_TRAINERSLIDE] = OpponentHandleTrainerSlide;
  sOpponentBufferCommands[CONTROLLER_TRAINERSLIDEBACK] = OpponentHandleTrainerSlideBack;
  sOpponentBufferCommands[CONTROLLER_FAINTANIMATION] = OpponentHandleFaintAnimation;
  sOpponentBufferCommands[CONTROLLER_PALETTEFADE] = OpponentHandlePaletteFade;
  sOpponentBufferCommands[CONTROLLER_SUCCESSBALLTHROWANIM] = OpponentHandleSuccessBallThrowAnim;
  sOpponentBufferCommands[CONTROLLER_BALLTHROWANIM] = OpponentHandleBallThrowAnim;
  sOpponentBufferCommands[CONTROLLER_PAUSE] = OpponentHandlePause;
  sOpponentBufferCommands[CONTROLLER_MOVEANIMATION] = OpponentHandleMoveAnimation;
  sOpponentBufferCommands[CONTROLLER_PRINTSTRING] = OpponentHandlePrintString;
  sOpponentBufferCommands[CONTROLLER_PRINTSTRINGPLAYERONLY] = OpponentHandlePrintSelectionString;
  sOpponentBufferCommands[CONTROLLER_CHOOSEACTION] = OpponentHandleChooseAction;
  sOpponentBufferCommands[CONTROLLER_YESNOBOX] = OpponentHandleYesNoBox;
  sOpponentBufferCommands[CONTROLLER_CHOOSEMOVE] = OpponentHandleChooseMove;
  sOpponentBufferCommands[CONTROLLER_OPENBAG] = OpponentHandleChooseItem;
  sOpponentBufferCommands[CONTROLLER_CHOOSEPOKEMON] = OpponentHandleChoosePokemon;
  sOpponentBufferCommands[CONTROLLER_23] = OpponentHandleCmd23;
  sOpponentBufferCommands[CONTROLLER_HEALTHBARUPDATE] = OpponentHandleHealthBarUpdate;
  sOpponentBufferCommands[CONTROLLER_EXPUPDATE] = OpponentHandleExpUpdate;
  sOpponentBufferCommands[CONTROLLER_STATUSICONUPDATE] = OpponentHandleStatusIconUpdate;
  sOpponentBufferCommands[CONTROLLER_STATUSANIMATION] = OpponentHandleStatusAnimation;
  sOpponentBufferCommands[CONTROLLER_STATUSXOR] = OpponentHandleStatusXor;
  sOpponentBufferCommands[CONTROLLER_DATATRANSFER] = OpponentHandleDataTransfer;
  sOpponentBufferCommands[CONTROLLER_DMA3TRANSFER] = OpponentHandleDMA3Transfer;
  sOpponentBufferCommands[CONTROLLER_PLAYBGM] = OpponentHandlePlayBGM;
  sOpponentBufferCommands[CONTROLLER_32] = OpponentHandleCmd32;
  sOpponentBufferCommands[CONTROLLER_TWORETURNVALUES] = OpponentHandleTwoReturnValues;
  sOpponentBufferCommands[CONTROLLER_CHOSENMONRETURNVALUE] = OpponentHandleChosenMonReturnValue;
  sOpponentBufferCommands[CONTROLLER_ONERETURNVALUE] = OpponentHandleOneReturnValue;
  sOpponentBufferCommands[CONTROLLER_ONERETURNVALUE_DUPLICATE] = OpponentHandleOneReturnValue_Duplicate;
  sOpponentBufferCommands[CONTROLLER_CLEARUNKVAR] = OpponentHandleClearUnkVar;
  sOpponentBufferCommands[CONTROLLER_SETUNKVAR] = OpponentHandleSetUnkVar;
  sOpponentBufferCommands[CONTROLLER_CLEARUNKFLAG] = OpponentHandleClearUnkFlag;
  sOpponentBufferCommands[CONTROLLER_TOGGLEUNKFLAG] = OpponentHandleToggleUnkFlag;
  sOpponentBufferCommands[CONTROLLER_HITANIMATION] = OpponentHandleHitAnimation;
  sOpponentBufferCommands[CONTROLLER_CANTSWITCH] = OpponentHandleCantSwitch;
  sOpponentBufferCommands[CONTROLLER_PLAYSE] = OpponentHandlePlaySE;
  sOpponentBufferCommands[CONTROLLER_PLAYFANFAREORBGM] = OpponentHandlePlayFanfareOrBGM;
  sOpponentBufferCommands[CONTROLLER_FAINTINGCRY] = OpponentHandleFaintingCry;
  sOpponentBufferCommands[CONTROLLER_INTROSLIDE] = OpponentHandleIntroSlide;
  sOpponentBufferCommands[CONTROLLER_INTROTRAINERBALLTHROW] = OpponentHandleIntroTrainerBallThrow;
  sOpponentBufferCommands[CONTROLLER_DRAWPARTYSTATUSSUMMARY] = OpponentHandleDrawPartyStatusSummary;
  sOpponentBufferCommands[CONTROLLER_HIDEPARTYSTATUSSUMMARY] = OpponentHandleHidePartyStatusSummary;
  sOpponentBufferCommands[CONTROLLER_ENDBOUNCE] = OpponentHandleEndBounceEffect;
  sOpponentBufferCommands[CONTROLLER_SPRITEINVISIBILITY] = OpponentHandleSpriteInvisibility;
  sOpponentBufferCommands[CONTROLLER_BATTLEANIMATION] = OpponentHandleBattleAnimation;
  sOpponentBufferCommands[CONTROLLER_LINKSTANDBYMSG] = OpponentHandleLinkStandbyMsg;
  sOpponentBufferCommands[CONTROLLER_RESETACTIONMOVESELECTION] = OpponentHandleResetActionMoveSelection;
  sOpponentBufferCommands[CONTROLLER_ENDLINKBATTLE] = OpponentHandleEndLinkBattle;
  sOpponentBufferCommands[CONTROLLER_TERMINATOR_NOP] = OpponentCmdEnd;
}
_initSOpponentBufferCommands();

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleControllerOpponent = {
  sOpponentBufferCommands,
  SetControllerToOpponent, OpponentBufferRunCommand,
};

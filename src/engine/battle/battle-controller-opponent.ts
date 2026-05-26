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
} from './state';
import { BATTLE_TYPE_LINK } from './constants';
import { gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE, PrepareBufferDataTransfer } from './battle-controllers-ipc';
import { gBitTable } from './battle-controllers';

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
  const pc = (globalThis as Record<string, unknown>).__battleControllerPlayer as {
    getBattlerControllerFunc?: (b: number) => (() => void) | null;
  } | undefined;
  // Notre architecture : globalThis.__battleControllerFuncs[battler] = fn.
  // Cascade dette R3 : full battler controller dispatch system.
  void pc; void battler; void fn;
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
function OpponentHandleSwitchInAnim(): void { OpponentBufferExecCompleted(); }
function OpponentHandleReturnMonToBall(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDrawTrainerPic(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlide(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlideBack(): void { OpponentBufferExecCompleted(); }
function OpponentHandleFaintAnimation(): void { OpponentBufferExecCompleted(); }
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

function OpponentHandleChooseAction(): void {
  // 1:1 décomp : Opponent ne choisit pas via UI, c'est l'AI bytecode (= K1).
  // EmitTwoReturnValues(B_ACTION_USE_MOVE).
  const tmpData = new Uint8Array([2 /* B_ACTION_USE_MOVE */, 0, 0, 0]);
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, tmpData, 4);
  OpponentBufferExecCompleted();
}

function OpponentHandleYesNoBox(): void { OpponentBufferExecCompleted(); }

function OpponentHandleChooseMove(): void {
  // 1:1 décomp : Opponent ChooseMove = appel AI BattleAI_ChooseMoveOrAction
  // (= ai-script-commands.ts existing) puis EmitTwoReturnValues avec move idx.
  // Dette R3 Phase B : wire complet vers AI bytecode.
  const tmpData = new Uint8Array([10 /* B_ACTION_EXEC_SCRIPT */, 0, 0, 0]);
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, tmpData, 4);
  OpponentBufferExecCompleted();
}

function OpponentHandleChooseItem(): void { OpponentBufferExecCompleted(); }
function OpponentHandleChoosePokemon(): void { OpponentBufferExecCompleted(); }
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

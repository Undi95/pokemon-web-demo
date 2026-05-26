/**
 * battle/battle-controller-player.ts — Port 1:1 strict du Player Controller.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controller_player.c`
 * (~3147 lignes C, 112 handlers).
 *
 * **User priority** : "On est obligé de faire les controllers individuels
 * sinon les combats ne marcheront pas". Sans Player controller, impossible
 * de faire le premier combat rival qui nécessite le full IPC dispatch.
 *
 * ## Architecture 1:1 strict
 *
 * sPlayerBufferCommands[CONTROLLER_CMDS_COUNT] : dispatch table indexée par
 * gBattleBufferA[active][0] = opcode. Chaque handler lit data depuis bufferA
 * (= command), execute, écrit response → bufferB via BtlController_EmitX.
 *
 * SetControllerToPlayer : install PlayerBufferRunCommand comme controller
 * func du battler player.
 *
 * PlayerBufferRunCommand : check gBattleControllerExecFlags & bit → dispatch
 * sPlayerBufferCommands[bufferA[0]]() ou ExecCompleted.
 *
 * PlayerBufferExecCompleted : reset controller func + clear exec flag.
 *
 * ## Port progressif
 *
 * **Phase A (this commit)** : dispatcher + ~25 handlers core pour combat
 * tutorial Birch + premier rival.
 *
 * **Phase B (next)** : input handlers (HandleInputChooseAction/Move/Target)
 * + ChoosePokemon + ChooseItem complete.
 *
 * **Phase C** : Wally tutorial + reste 60 handlers.
 *
 * Dépendances :
 *   - K29 battle-controllers-ipc : gBattleBufferA/B + PrepareBufferDataTransfer
 *   - K27/K28/K29 helpers wirés
 *   - battle-controllers.ts : MarkBattlerForControllerExec + emitters
 *   - state.ts : gActiveBattler + gBattleTypeFlags
 */

import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gActionSelectionCursor, gMoveSelectionCursor, gAbsentBattlerFlags,
  gPlayerDpadHoldFrames, setPlayerDpadHoldFrames, incPlayerDpadHoldFrames,
  gNumberOfMovesToChoose, setNumberOfMovesToChoose,
  gMultiUsePlayerCursor, setMultiUsePlayerCursor,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI, BATTLE_TYPE_PALACE,
  B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  B_ACTION_CANCEL_PARTNER, B_ACTION_EXEC_SCRIPT,
} from './constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
} from './battle-controllers-ipc';
import {
  gBitTable, MarkBattlerForControllerExec, BattlePutTextOnWindow,
  JOY_NEW, JOY_REPEAT,
  A_BUTTON, B_BUTTON, START_BUTTON,
  DPAD_LEFT, DPAD_RIGHT, DPAD_UP, DPAD_DOWN, DPAD_ANY,
  SE_SELECT,
} from './battle-controllers';
// PlaySE wired via globalThis.__PlaySE (exposé par decomp-globals ligne ~722) —
// évite cycle ESM avec import direct.
function PlaySE(seId: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
import {
  DoBounceEffect, BOUNCE_HEALTHBOX, BOUNCE_MON,
} from './battle-sprite-callbacks';
import {
  B_WIN_ACTION_PROMPT, B_WIN_ACTION_MENU,
  B_WIN_MOVE_NAME_1, B_WIN_PP, B_WIN_PP_REMAINING, B_WIN_MOVE_TYPE,
} from './battle-windows';
import { SELECT_BUTTON } from './battle-controllers';
import {
  GetBattlerPosition, GetBattlerAtPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  GetDefaultMoveTarget,
} from './util';
import {
  TYPE_GHOST, MOVE_NONE, MAX_MON_MOVES, MOVE_CURSE,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_SELECTED,
  MOVE_TARGET_RANDOM, MOVE_TARGET_BOTH, MOVE_TARGET_DEPENDS,
  MOVE_TARGET_FOES_AND_ALLY, MOVE_TARGET_OPPONENTS_FIELD,
  BATTLE_ALIVE_EXCEPT_ACTIVE,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE,
} from './constants';
import { gSaveBlock2Ptr } from '../save/save-block-state';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `CONTROLLER_CMDS_COUNT` = 56 (= battle_controllers.h). */
const CONTROLLER_CMDS_COUNT = 56;

/** 1:1 décomp `CONTROLLER_TERMINATOR_NOP` = 55 (= NOP terminator). */
const CONTROLLER_TERMINATOR_NOP = 55;

/** 1:1 décomp `B_COMM_CONTROLLER_IS_DONE` = 2. */
const B_COMM_CONTROLLER_IS_DONE = 2;

// CONTROLLER_* opcodes (battle_controllers.h:7-50) — référencés dans dispatch.
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

// ─── gBattlerControllerFuncs (battle.h) ────────────────────────────────────

/** 1:1 décomp `gBattlerControllerFuncs[MAX_BATTLERS_COUNT]`. */
const gBattlerControllerFuncs: Array<(() => void) | null> = [null, null, null, null];

/** Helper export pour battle-flow.ts ou autres pour install controller. */
export function getBattlerControllerFunc(battler: number): (() => void) | null {
  return gBattlerControllerFuncs[battler];
}

// ─── PlayerBufferRunCommand + PlayerBufferExecCompleted ────────────────────

/** 1:1 décomp `PlayerBufferExecCompleted()` (battle_controller_player.c:200-214).
 *  Reset controller func + clear exec flag battler. */
function PlayerBufferExecCompleted(): void {
  gBattlerControllerFuncs[gActiveBattler] = PlayerBufferRunCommand;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    // Dette R3 : link path (= user "Report jusqu'à fin projet").
    gBattleBufferA[gActiveBattler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[gActiveBattler]);
  }
  void B_COMM_CONTROLLER_IS_DONE;
}

/** 1:1 décomp `PlayerBufferRunCommand()` (battle_controller_player.c:216-225).
 *  Main controller dispatcher : if exec flag set, run opcode handler ou
 *  ExecCompleted si opcode hors range. */
export function PlayerBufferRunCommand(): void {
  if (gBattleControllerExecFlags & gBitTable[gActiveBattler]) {
    const opcode = gBattleBufferA[gActiveBattler][0];
    if (opcode < CONTROLLER_CMDS_COUNT) {
      const handler = sPlayerBufferCommands[opcode];
      if (handler) handler();
      else PlayerBufferExecCompleted();
    } else {
      PlayerBufferExecCompleted();
    }
  }
}

// ─── SetControllerToPlayer (battle_controller_player.c:193-198) ────────────

/** 1:1 décomp `SetControllerToPlayer()` (battle_controller_player.c:193-198).
 *  Install PlayerBufferRunCommand comme controller du battler actif. */
export function SetControllerToPlayer(): void {
  gBattlerControllerFuncs[gActiveBattler] = PlayerBufferRunCommand;
  _gDoingBattleAnim = false;
  setPlayerDpadHoldFrames(0);
}

let _gDoingBattleAnim = false;

// ─── Constants 1:1 décomp (= include/constants/* + battle_message.c text) ──

/** 1:1 décomp `OPTIONS_BUTTON_MODE_L_EQUALS_A` = 2 (include/constants/global.h:125). */
const OPTIONS_BUTTON_MODE_L_EQUALS_A = 2;

/** 1:1 décomp `LAST_BALL` = ITEM_PREMIER_BALL (= dernier ItemBall enum).
 *  include/constants/items.h : ITEM_PREMIER_BALL = 12 dans Emerald. */
const LAST_BALL = 12;

/** 1:1 décomp `gText_BattleMenu` (battle_message.c:1276) = "ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE". */
const gText_BattleMenu = 'ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON{CLEAR_TO 56}FUITE';

/** 1:1 décomp `gText_WhatWillPkmnDo` (battle_message.c:1272) = "Que doit faire\n{B_ACTIVE_NAME_WITH_PREFIX}?". */
const gText_WhatWillPkmnDo = 'Que doit faire\n{B_ACTIVE_NAME_WITH_PREFIX}?';

// ─── Cascade helpers — 1:1 strict ports ────────────────────────────────────

/** 1:1 décomp `ActionSelectionCreateCursorAt(cursorPosition, baseTileNum)`
 *  (battle_controller_player.c:1530-1538). Place le cursor sprite (tile baseTileNum+1
 *  et +2) à la position 7*(cursor & 1) + 16 col, 35 + (cursor & 2) row du BG0
 *  tilemap, palette 0x11. Puis CopyBgTilemapBufferToVram(0). */
export function ActionSelectionCreateCursorAt(cursorPosition: number, baseTileNum: number): void {
  const src = new Uint16Array([baseTileNum + 1, baseTileNum + 2]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    7 * (cursorPosition & 1) + 16, 35 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `ActionSelectionDestroyCursorAt(cursorPosition)`
 *  (battle_controller_player.c:1540-1548). Same que Create mais avec tile = 0x1016
 *  (= tile invisible / fond uniforme). */
export function ActionSelectionDestroyCursorAt(cursorPosition: number): void {
  const src = new Uint16Array([0x1016, 0x1016]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    7 * (cursorPosition & 1) + 16, 35 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 signature décomp `CopyToBgTilemapBufferRect_ChangePalette(bg, src, x, y,
 *  w, h, palette)` (bg.c). Copie un rect au BG tilemap buffer + change palette.
 *  Dette R3 : full BG tilemap manip GBA-specific cascade vers gba-window-system /
 *  Phaser BG. Pour now : route vers globalThis hook pour brancher UI plus tard. */
function _CopyToBgTilemapBufferRect_ChangePalette(
  bg: number, src: Uint16Array, x: number, y: number, w: number, h: number, palette: number,
): void {
  const hook = (globalThis as { __bgTilemap?: {
    copyToBufferRectChangePalette?: (bg: number, src: Uint16Array, x: number, y: number, w: number, h: number, palette: number) => void;
  } }).__bgTilemap;
  if (hook?.copyToBufferRectChangePalette) {
    hook.copyToBufferRectChangePalette(bg, src, x, y, w, h, palette);
  }
}

/** 1:1 décomp `CopyBgTilemapBufferToVram(bg)` (bg.c). Flush tilemap buffer
 *  → VRAM. Wire vers gba-window-system équivalent. */
function _CopyBgTilemapBufferToVram(bg: number): void {
  const hook = (globalThis as { __bgTilemap?: {
    copyBufferToVram?: (bg: number) => void;
  } }).__bgTilemap;
  if (hook?.copyBufferToVram) hook.copyBufferToVram(bg);
}

/** 1:1 décomp `BattleTv_ClearExplosionFaintCause()` (battle_tv.c).
 *  Dette R3 : recorded battle TV stats (= user "Report jusqu'à fin projet"). */
function _BattleTv_ClearExplosionFaintCause(): void {
  // No-op : recorded battle/TV stats non porté.
}

/** 1:1 signature décomp `BattleStringExpandPlaceholdersToDisplayedString(src)`
 *  (battle_message.c). Equivalent `BattleStringExpandPlaceholders(src,
 *  gDisplayedStringBattle)`. Pour now : route vers le decoder/string-expand
 *  existant via globalThis hook (battle-string-decoder). */
function _BattleStringExpandPlaceholdersToDisplayedString(src: string): string {
  const m = (globalThis as Record<string, unknown>).__battleStringDecoder as {
    expandPlaceholders?: (src: string) => string;
  } | undefined;
  if (m?.expandPlaceholders) return m.expandPlaceholders(src);
  // Fallback : retourner src tel quel (= no expansion). Phase L1 suffisant.
  return src;
}

/** 1:1 décomp `SwapHpBarsWithHpText()` (battle_interface.c). Toggle entre
 *  affichage HP bar et affichage HP texte (= START_BUTTON in battle).
 *  Dette R3 : full HP bar/text toggle cascade dans battle-healthbox. */
function _SwapHpBarsWithHpText(): void {
  // Dette R3 : healthbox swap HP bar ↔ text display.
}

/** 1:1 décomp `IsDma3ManagerBusyWithBgCopy()` (dma3_manager.c). GBA-specific
 *  DMA queue check pour la copy tilemap → VRAM. Pour notre port web :
 *  return false (= jamais busy, copies sont synchrones via Phaser). */
function _IsDma3ManagerBusyWithBgCopy(): boolean {
  return false;
}

/** 1:1 décomp `HandleInputChooseTarget()` (battle_controller_player.c:339-468).
 *  Dette R3 Phase B : double battles target selection. Single battle = pas appelé. */
function HandleInputChooseTarget(): void {
  // Dette R3 : double battle target selection (= Phase B post-L1).
}

// ─── L2 — Move Selection helpers (battle_controller_player.c) ──────────────

/** 1:1 décomp `MoveSelectionCreateCursorAt(cursorPosition, baseTileNum)`
 *  (battle_controller_player.c:1510-1518). Place le move cursor sprite à
 *  9*(cursor & 1)+1 col, 55+(cursor & 2) row du BG0 tilemap, palette 0x11. */
export function MoveSelectionCreateCursorAt(cursorPosition: number, baseTileNum: number): void {
  const src = new Uint16Array([baseTileNum + 1, baseTileNum + 2]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    9 * (cursorPosition & 1) + 1, 55 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `MoveSelectionDestroyCursorAt(cursorPosition)`
 *  (battle_controller_player.c:1520-1528). */
export function MoveSelectionDestroyCursorAt(cursorPosition: number): void {
  const src = new Uint16Array([0x1016, 0x1016]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    9 * (cursorPosition & 1) + 1, 55 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `struct ChooseMoveStruct` (battle_controllers.h). Mapped sur
 *  `gBattleBufferA[active][4..]`. Layout :
 *    - offset 4..11 : moves[4] (u16 each)
 *    - offset 12..15 : currentPp[4] (u8 each)
 *    - offset 16..19 : maxPp[4] (u8 each)
 *    - offset 20..21 : species (u16) — pas utilisé ici
 *    - offset 22..23 : monTypes[2] (u8 each) — TYPE_GHOST check Curse */
interface ChooseMoveStruct {
  moves: number[];      // 4 entries
  currentPp: number[];  // 4 entries
  maxPp: number[];      // 4 entries
  monTypes: number[];   // 2 entries (mon's primary+secondary type)
}

/** Helper : read ChooseMoveStruct depuis gBattleBufferA[battler][4..]. */
function _readChooseMoveStruct(battler: number): ChooseMoveStruct {
  const buf = gBattleBufferA[battler];
  const moves: number[] = [];
  const currentPp: number[] = [];
  const maxPp: number[] = [];
  const monTypes: number[] = [];
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    moves[i] = buf[4 + i * 2] | (buf[5 + i * 2] << 8);
    currentPp[i] = buf[12 + i];
    maxPp[i] = buf[16 + i];
  }
  monTypes[0] = buf[22];
  monTypes[1] = buf[23];
  return { moves, currentPp, maxPp, monTypes };
}

/** 1:1 décomp `gMoveNames[move]` lookup. Wire vers gameData via globalThis. */
function _getMoveName(move: number): string {
  const dt = (globalThis as { gameDataMoves?: Record<string, { name?: string; nameFr?: string }> }).gameDataMoves;
  if (!dt) return String(move);
  // Cherche entry par numericId.
  for (const k of Object.keys(dt)) {
    const e = dt[k];
    const idMatch = parseInt(k, 10);
    if (idMatch === move) return (e?.nameFr ?? e?.name ?? k);
  }
  return String(move);
}

/** 1:1 décomp `gTypeNames[type]` lookup. */
function _getTypeName(type: number): string {
  // 1:1 décomp include/data/text/type_names.h FR.
  const FR_TYPES = ['NORMAL', 'COMBAT', 'VOL', 'POISON', 'SOL', 'ROCHE', 'INSECTE',
    'SPECTRE', 'ACIER', '???', 'FEU', 'EAU', 'PLANTE', 'ÉLECTRIK', 'PSY',
    'GLACE', 'DRAGON', 'TÉNÈBRES'];
  return FR_TYPES[type] ?? 'NORMAL';
}

/** 1:1 décomp `gBattleMoves[move].target`. Wire vers gameDataMoves.target. */
function _getMoveTarget(move: number): number {
  const dt = (globalThis as { gameDataMoves?: Record<string, { target?: number }> }).gameDataMoves;
  if (!dt) return MOVE_TARGET_SELECTED;
  for (const k of Object.keys(dt)) {
    if (parseInt(k, 10) === move) return (dt[k]?.target ?? MOVE_TARGET_SELECTED);
  }
  return MOVE_TARGET_SELECTED;
}

/** 1:1 décomp `MoveSelectionDisplayMoveNames()` (1456-1471). */
function MoveSelectionDisplayMoveNames(): void {
  const moveInfo = _readChooseMoveStruct(gActiveBattler);
  setNumberOfMovesToChoose(0);
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    MoveSelectionDestroyCursorAt(i);
    BattlePutTextOnWindow(_getMoveName(moveInfo.moves[i]), i + B_WIN_MOVE_NAME_1);
    if (moveInfo.moves[i] !== MOVE_NONE) {
      setNumberOfMovesToChoose(gNumberOfMovesToChoose + 1);
    }
  }
}

/** 1:1 décomp `MoveSelectionDisplayPpString()` (1473-1477). */
function MoveSelectionDisplayPpString(): void {
  BattlePutTextOnWindow('PP', B_WIN_PP);
}

/** 1:1 décomp `MoveSelectionDisplayPpNumber()` (1479-1494). */
function MoveSelectionDisplayPpNumber(): void {
  // 1:1 décomp : early return si bufferA[2] (= no PP display flag) set.
  if (gBattleBufferA[gActiveBattler][2] === 1 /* TRUE */) return;

  _SetPpNumbersPaletteInMoveSelection();
  const moveInfo = _readChooseMoveStruct(gActiveBattler);
  const cur = gMoveSelectionCursor[gActiveBattler];
  // Format "XX/YY" right-aligned 2 chars each.
  const cp = String(moveInfo.currentPp[cur]).padStart(2, ' ');
  const mp = String(moveInfo.maxPp[cur]).padStart(2, ' ');
  BattlePutTextOnWindow(`${cp}/${mp}`, B_WIN_PP_REMAINING);
}

/** 1:1 décomp `MoveSelectionDisplayMoveType()` (1496-1508). */
function MoveSelectionDisplayMoveType(): void {
  const moveInfo = _readChooseMoveStruct(gActiveBattler);
  const cur = gMoveSelectionCursor[gActiveBattler];
  // 1:1 décomp : "TYPE/" + typeName du move courant via gBattleMoves[move].type.
  const move = moveInfo.moves[cur];
  const moveType = _getMoveType(move);
  BattlePutTextOnWindow(`TYPE/${_getTypeName(moveType)}`, B_WIN_MOVE_TYPE);
}

/** 1:1 décomp `gBattleMoves[move].type`. */
function _getMoveType(move: number): number {
  const dt = (globalThis as { gameDataMoves?: Record<string, { type?: number }> }).gameDataMoves;
  if (!dt) return 0;
  for (const k of Object.keys(dt)) {
    if (parseInt(k, 10) === move) return (dt[k]?.type ?? 0);
  }
  return 0;
}

/** 1:1 décomp `SetPpNumbersPaletteInMoveSelection()` (battle_controller_player.c).
 *  Dette R3 : palette color PP number selon current/max ratio (vert/orange/rouge). */
function _SetPpNumbersPaletteInMoveSelection(): void {
  // Dette R3 : palette PP number color cascade.
}

/** 1:1 décomp `InitMoveSelectionsVarsAndStrings()` (2643-2651). Setup move UI. */
export function InitMoveSelectionsVarsAndStrings(): void {
  MoveSelectionDisplayMoveNames();
  setMultiUsePlayerCursor(0xFF);
  MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
  MoveSelectionDisplayPpString();
  MoveSelectionDisplayPpNumber();
  MoveSelectionDisplayMoveType();
}

/** 1:1 décomp `HandleChooseMoveAfterDma3()` (2607-2615). Wait DMA3 + reset
 *  BG0 scroll à (0, DISPLAY_HEIGHT * 2) + install HandleInputChooseMove. */
function HandleChooseMoveAfterDma3(): void {
  if (!_IsDma3ManagerBusyWithBgCopy()) {
    _setBattleBG0(0, DISPLAY_HEIGHT * 2);
    gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseMove;
  }
}

/** 1:1 décomp `PlayerChooseMoveInBattlePalace()` (2619-2627). Battle Palace
 *  variant : RNG-driven move pick. Dette R3 : Frontier subsystem (= user
 *  "Report jusqu'à fin projet"). Pour now : stub R3 immediate complete. */
function PlayerChooseMoveInBattlePalace(): void {
  // Dette R3 : Battle Palace move selection. Skip pour non-Frontier.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `HandleInputChooseMove()` (battle_controller_player.c:471-615).
 *  Controller func active pendant le menu MOVE select. Loop frame :
 *    - JOY_NEW(A_BUTTON) → calc moveTarget (= MOVE_CURSE special TYPE_GHOST,
 *      else gBattleMoves[move].target) + canSelectTarget logic (single vs
 *      double) → EmitTwoReturnValues(B_ACTION_EXEC_SCRIPT, moveIdx | cursor<<8)
 *      ou install HandleInputChooseTarget pour double battle.
 *    - JOY_NEW(B_BUTTON) | dpad-hold-59 → EmitTwoReturnValues(B_ACTION_EXEC_SCRIPT,
 *      0xFFFF) (= cancel back to ChooseAction).
 *    - JOY_NEW(DPAD_*) → toggle cursor bit 0 / bit 1 + Destroy/Create cursor +
 *      DisplayPpNumber + DisplayMoveType.
 *    - JOY_NEW(SELECT_BUTTON) → switch moves (HandleMoveSwitching) — dette R3. */
function HandleInputChooseMove(): void {
  let canSelectTarget: number = 0;
  const moveInfo = _readChooseMoveStruct(gActiveBattler);

  if (JOY_REPEAT(DPAD_ANY) && gSaveBlock2Ptr.optionsButtonMode === OPTIONS_BUTTON_MODE_L_EQUALS_A) {
    incPlayerDpadHoldFrames();
  } else {
    setPlayerDpadHoldFrames(0);
  }

  if (JOY_NEW(A_BUTTON)) {
    let moveTarget: number;

    PlaySE(SE_SELECT);
    const curMove = moveInfo.moves[gMoveSelectionCursor[gActiveBattler]];
    if (curMove === MOVE_CURSE) {
      // 1:1 décomp : Curse cible auto USER si mon n'est pas GHOST.
      if (moveInfo.monTypes[0] !== TYPE_GHOST && moveInfo.monTypes[1] !== TYPE_GHOST) {
        moveTarget = MOVE_TARGET_USER;
      } else {
        moveTarget = MOVE_TARGET_SELECTED;
      }
    } else {
      moveTarget = _getMoveTarget(curMove);
    }

    if (moveTarget & MOVE_TARGET_USER) {
      setMultiUsePlayerCursor(gActiveBattler);
    } else {
      setMultiUsePlayerCursor(GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gActiveBattler))));
    }

    if (!gBattleBufferA[gActiveBattler][1]) { // not a double battle
      if ((moveTarget & MOVE_TARGET_USER_OR_SELECTED) && !gBattleBufferA[gActiveBattler][2]) {
        canSelectTarget++;
      }
    } else { // double battle
      if (!(moveTarget & (MOVE_TARGET_RANDOM | MOVE_TARGET_BOTH | MOVE_TARGET_DEPENDS | MOVE_TARGET_FOES_AND_ALLY | MOVE_TARGET_OPPONENTS_FIELD | MOVE_TARGET_USER))) {
        canSelectTarget++; // either selected or user
      }

      if (moveInfo.currentPp[gMoveSelectionCursor[gActiveBattler]] === 0) {
        canSelectTarget = 0;
      } else if (!(moveTarget & (MOVE_TARGET_USER | MOVE_TARGET_USER_OR_SELECTED))
                 && _countAliveMonsInBattle(BATTLE_ALIVE_EXCEPT_ACTIVE) <= 1) {
        setMultiUsePlayerCursor(GetDefaultMoveTarget(gActiveBattler));
        canSelectTarget = 0;
      }
    }

    if (!canSelectTarget) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, gMoveSelectionCursor[gActiveBattler] | (gMultiUsePlayerCursor << 8));
      PlayerBufferExecCompleted();
    } else {
      gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseTarget;

      if (moveTarget & (MOVE_TARGET_USER | MOVE_TARGET_USER_OR_SELECTED)) {
        setMultiUsePlayerCursor(gActiveBattler);
      } else if (gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)]) {
        setMultiUsePlayerCursor(GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
      } else {
        setMultiUsePlayerCursor(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
      }
      _SpriteCB_ShowAsMoveTarget(gMultiUsePlayerCursor);
    }
  } else if (JOY_NEW(B_BUTTON) || gPlayerDpadHoldFrames > 59) {
    PlaySE(SE_SELECT);
    BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, 0xFFFF);
    PlayerBufferExecCompleted();
  } else if (JOY_NEW(DPAD_LEFT)) {
    if (gMoveSelectionCursor[gActiveBattler] & 1) {
      MoveSelectionDestroyCursorAt(gMoveSelectionCursor[gActiveBattler]);
      gMoveSelectionCursor[gActiveBattler] ^= 1;
      PlaySE(SE_SELECT);
      MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
      MoveSelectionDisplayPpNumber();
      MoveSelectionDisplayMoveType();
    }
  } else if (JOY_NEW(DPAD_RIGHT)) {
    if (!(gMoveSelectionCursor[gActiveBattler] & 1)
        && (gMoveSelectionCursor[gActiveBattler] ^ 1) < gNumberOfMovesToChoose) {
      MoveSelectionDestroyCursorAt(gMoveSelectionCursor[gActiveBattler]);
      gMoveSelectionCursor[gActiveBattler] ^= 1;
      PlaySE(SE_SELECT);
      MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
      MoveSelectionDisplayPpNumber();
      MoveSelectionDisplayMoveType();
    }
  } else if (JOY_NEW(DPAD_UP)) {
    if (gMoveSelectionCursor[gActiveBattler] & 2) {
      MoveSelectionDestroyCursorAt(gMoveSelectionCursor[gActiveBattler]);
      gMoveSelectionCursor[gActiveBattler] ^= 2;
      PlaySE(SE_SELECT);
      MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
      MoveSelectionDisplayPpNumber();
      MoveSelectionDisplayMoveType();
    }
  } else if (JOY_NEW(DPAD_DOWN)) {
    if (!(gMoveSelectionCursor[gActiveBattler] & 2)
        && (gMoveSelectionCursor[gActiveBattler] ^ 2) < gNumberOfMovesToChoose) {
      MoveSelectionDestroyCursorAt(gMoveSelectionCursor[gActiveBattler]);
      gMoveSelectionCursor[gActiveBattler] ^= 2;
      PlaySE(SE_SELECT);
      MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
      MoveSelectionDisplayPpNumber();
      MoveSelectionDisplayMoveType();
    }
  } else if (JOY_NEW(SELECT_BUTTON)) {
    // 1:1 décomp : move switching mode (HandleMoveSwitching). Dette R3 :
    // swap moves + PP persisté via SetMonData (= ~150l C). Phase L2+ ou L3.
    void _HandleMoveSwitching_stub;
  }
}

/** 1:1 décomp `HandleMoveSwitching()` (battle_controller_player.c:667-810).
 *  Dette R3 : SELECT_BUTTON swap moves + persist via SetMonData. Non critique
 *  pour Birch tutorial (= mon a 2 moves Tackle+Growl, pas de swap UI). */
function _HandleMoveSwitching_stub(): void {
  // Dette R3 : full move swap UI + persist Phase L2+ post-tutorial.
}

/** 1:1 décomp `B_POSITION_OPPONENT_LEFT/RIGHT` (battle.h). */
const B_POSITION_OPPONENT_LEFT = 1;
const B_POSITION_OPPONENT_RIGHT = 3;

/** 1:1 décomp `SpriteCB_ShowAsMoveTarget(battler)`. Dette R3 : target sprite
 *  highlight via gSprites[gBattlerSpriteIds[battler]].callback. */
function _SpriteCB_ShowAsMoveTarget(_battler: number): void {
  // Dette R3 : sprite callback highlight target.
}

/** 1:1 décomp `CountAliveMonsInBattle(caseId)` local port pour HandleInput
 *  ChooseMove. Cf damage-calc.ts copy (= éviter re-export cycle). */
function _countAliveMonsInBattle(caseId: number): number {
  let retVal = 0;
  if (caseId === BATTLE_ALIVE_EXCEPT_ACTIVE /* 0 */) {
    for (let i = 0; i < 4; i++) {
      if (i !== gActiveBattler && !(gAbsentBattlerFlags & (1 << i))) retVal++;
    }
  }
  return retVal;
}

// ─── Cascade helpers (= K8/K27/K28/K29 wires) ──────────────────────────────

/** 1:1 décomp `CopyPlayerMonData(monId, dst)` (battle_controller_player.c:115).
 *  Sérialize player party mon → buffer. Pour now : minimal copy. */
function _CopyPlayerMonData(monId: number, dst: Uint8Array): number {
  // Dette R3 : full BattlePokemon struct serialize (~88 bytes per mon).
  // Cascade vers party-storage + BattlePokemon struct.
  void monId; void dst;
  return 0;
}

/** 1:1 décomp `SetPlayerMonData(monId)` (battle_controller_player.c:116). */
function _SetPlayerMonData(monId: number): void {
  // Dette R3 : deserialize bufferA → player party mon.
  void monId;
}

/** 1:1 décomp `StartSendOutAnim(battler, dontClearSubstituteBit)`. */
function _StartSendOutAnim(_battler: number, _dontClearSubstituteBit: boolean): void {
  // Dette R3 : ball send-out animation (= cascade visuels K9).
}

/** Helper : wire vers battle-string-decoder pour text msgs. */
function _PlayerHandlePrintString_decode(stringId: number): void {
  // Wire vers battle-string-decoder via lazy lookup pour éviter cycle ESM.
  // Pour now : enqueue PrintString event si pas déjà géré par battle-flow.
  const m = (globalThis as Record<string, unknown>).__battleStringDecoder as {
    decodeBattleString?: (sid: number, msgData: unknown) => string;
  } | undefined;
  if (m?.decodeBattleString) {
    // 1:1 décomp : BattlePutTextOnWindow(decoded, B_WIN_MSG).
    // Dette R3 : full text window wire.
    void m;
  }
  void stringId;
}

// ─── HANDLERS Phase A (~25 core) ───────────────────────────────────────────

/** 1:1 décomp `PlayerHandleGetMonData()` (battle_controller_player.c). */
function PlayerHandleGetMonData(): void {
  const monsToCheck = gBattleBufferA[gActiveBattler][2];
  const monData = new Uint8Array(0x80);
  let size = 0;
  if (monsToCheck === 0) {
    // Single mon : current battler party index.
    size = _CopyPlayerMonData(0 /* gBattlerPartyIndexes[active] */, monData);
  } else {
    // Multi mon : iterate party.
    for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
      if (monsToCheck & (1 << i)) {
        size += _CopyPlayerMonData(i, monData);
      }
    }
  }
  // 1:1 décomp : BtlController_EmitDataTransfer response.
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, monData, size + 4);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSetMonData()` (battle_controller_player.c). */
function PlayerHandleSetMonData(): void {
  const monsToCheck = gBattleBufferA[gActiveBattler][2];
  if (monsToCheck === 0) {
    _SetPlayerMonData(0 /* gBattlerPartyIndexes[active] */);
  } else {
    for (let i = 0; i < 6; i++) {
      if (monsToCheck & (1 << i)) _SetPlayerMonData(i);
    }
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSetRawMonData()`. Dette R3 : raw byte write. */
function PlayerHandleSetRawMonData(): void {
  // Dette R3 : memcpy raw bytes bufferA → mon.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleLoadMonSprite()`. */
function PlayerHandleLoadMonSprite(): void {
  // Dette R3 : full sprite load (= BattleLoadPlayerMonSpriteGfx + sprite spawn).
  // Cascade vers battle-flow sprite system existing.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSwitchInAnim()`. */
function PlayerHandleSwitchInAnim(): void {
  const partyId = gBattleBufferA[gActiveBattler][1];
  const dontClearSubstituteBit = gBattleBufferA[gActiveBattler][2] !== 0;
  // 1:1 décomp : gBattlerPartyIndexes[active] = partyId + StartSendOutAnim.
  void partyId;
  _StartSendOutAnim(gActiveBattler, dontClearSubstituteBit);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleReturnMonToBall()`. */
function PlayerHandleReturnMonToBall(): void {
  // Dette R3 : return-to-ball anim cascade vers battle-ball-throw.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleDrawTrainerPic()`. */
function PlayerHandleDrawTrainerPic(): void {
  // Dette R3 : trainer pic load + display.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleTrainerSlide()`. */
function PlayerHandleTrainerSlide(): void {
  // Dette R3 : trainer slide-in.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleTrainerSlideBack()`. */
function PlayerHandleTrainerSlideBack(): void {
  // Dette R3 : trainer slide-back.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleFaintAnimation()`. */
function PlayerHandleFaintAnimation(): void {
  // Dette R3 : faint slide anim (= cascade vers K13 battle-faint-anim).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePaletteFade()`. */
function PlayerHandlePaletteFade(): void {
  // Dette R3 : palette fade. Pour now : direct complete.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSuccessBallThrowAnim()`. */
function PlayerHandleSuccessBallThrowAnim(): void {
  // Dette R3 : success ball throw (= capture anim).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleBallThrowAnim()`. */
function PlayerHandleBallThrowAnim(): void {
  // Dette R3 : ball throw caseId (cascade vers K9 battle-ball-throw).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePause()`. */
function PlayerHandlePause(): void {
  // 1:1 décomp : pause timer based.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleMoveAnimation()`. */
function PlayerHandleMoveAnimation(): void {
  // Dette R3 : move animation play (= cascade visuels K1 per-move).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePrintString()`. */
function PlayerHandlePrintString(): void {
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  _PlayerHandlePrintString_decode(stringId);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePrintSelectionString()`. */
function PlayerHandlePrintSelectionString(): void {
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  _PlayerHandlePrintString_decode(stringId);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleChooseAction()` (battle_controller_player.c:2575-2589).
 *  Setup action menu + install HandleChooseActionAfterDma3 qui chain ensuite
 *  HandleInputChooseAction quand DMA3 idle. */
function PlayerHandleChooseAction(): void {
  let i: number;
  gBattlerControllerFuncs[gActiveBattler] = HandleChooseActionAfterDma3;
  _BattleTv_ClearExplosionFaintCause();
  BattlePutTextOnWindow(gText_BattleMenu, B_WIN_ACTION_MENU);

  for (i = 0; i < 4; i++) {
    ActionSelectionDestroyCursorAt(i);
  }
  ActionSelectionCreateCursorAt(gActionSelectionCursor[gActiveBattler], 0);
  // 1:1 décomp : BattleStringExpandPlaceholdersToDisplayedString(gText_WhatWillPkmnDo);
  // BattlePutTextOnWindow(gDisplayedStringBattle, B_WIN_ACTION_PROMPT);
  const expanded = _BattleStringExpandPlaceholdersToDisplayedString(gText_WhatWillPkmnDo);
  BattlePutTextOnWindow(expanded, B_WIN_ACTION_PROMPT);
}

/** 1:1 décomp `HandleChooseActionAfterDma3()` (battle_controller_player.c:2565-2573).
 *  Wait DMA3 idle puis reset BG0 scroll à (0, DISPLAY_HEIGHT) (= révèle section
 *  ACTION du BG0 tilemap vertical) et install HandleInputChooseAction comme
 *  controller func du battler actif. */
function HandleChooseActionAfterDma3(): void {
  if (!_IsDma3ManagerBusyWithBgCopy()) {
    _setBattleBG0(0, DISPLAY_HEIGHT);
    gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseAction;
  }
}

/** 1:1 décomp `DISPLAY_HEIGHT` = 160 (gba/defines.h). GBA screen height. */
const DISPLAY_HEIGHT = 160;

/** Helper interne : set gBattle_BG0_X/Y via battleVBlankState (= 1:1 décomp
 *  gBattle_BG0_X = x / gBattle_BG0_Y = y). Le VBlank handler push aux registers
 *  REG_OFFSET_BG0HOFS/VOFS chaque frame. */
function _setBattleBG0(x: number, y: number): void {
  // Lazy lookup via globalThis car battle-vblank-helpers n'est pas import directement.
  const m = (globalThis as { __battleVBlankHelpers?: { battleVBlankState?: { bg0_x: number; bg0_y: number } } }).__battleVBlankHelpers;
  if (m?.battleVBlankState) {
    m.battleVBlankState.bg0_x = x;
    m.battleVBlankState.bg0_y = y;
  }
}

/** 1:1 décomp `HandleInputChooseAction()` (battle_controller_player.c:233-330).
 *  Controller func active pendant le menu ATTAQUE/SAC/POKéMON/FUITE. Loop frame-
 *  par-frame qui :
 *    - DoBounceEffect healthbox + mon (= bounce visuel actif battler)
 *    - JOY_NEW(A_BUTTON) → EmitTwoReturnValues(B_ACTION_USE_MOVE/USE_ITEM/SWITCH/RUN)
 *      selon cursor 2x2 ; PlaySE + PlayerBufferExecCompleted
 *    - JOY_NEW(DPAD_*) → toggle cursor bit (L/R = bit 0, U/D = bit 1) +
 *      Destroy/Create cursor sprite + PlaySE
 *    - JOY_NEW(B_BUTTON) || gPlayerDpadHoldFrames > 59 → CANCEL_PARTNER (double
 *      battles uniquement)
 *    - JOY_NEW(START_BUTTON) → SwapHpBarsWithHpText (toggle HP bar/text)
 */
function HandleInputChooseAction(): void {
  const itemId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);

  DoBounceEffect(gActiveBattler, BOUNCE_HEALTHBOX, 7, 1);
  DoBounceEffect(gActiveBattler, BOUNCE_MON, 7, 1);

  if (JOY_REPEAT(DPAD_ANY) && gSaveBlock2Ptr.optionsButtonMode === OPTIONS_BUTTON_MODE_L_EQUALS_A) {
    incPlayerDpadHoldFrames();
  } else {
    setPlayerDpadHoldFrames(0);
  }

  if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);

    switch (gActionSelectionCursor[gActiveBattler]) {
      case 0: // Top left
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_USE_MOVE, 0);
        break;
      case 1: // Top right
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_USE_ITEM, 0);
        break;
      case 2: // Bottom left
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_SWITCH, 0);
        break;
      case 3: // Bottom right
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_RUN, 0);
        break;
    }
    PlayerBufferExecCompleted();
  } else if (JOY_NEW(DPAD_LEFT)) {
    if (gActionSelectionCursor[gActiveBattler] & 1) { // if is B_ACTION_USE_ITEM or B_ACTION_RUN
      PlaySE(SE_SELECT);
      ActionSelectionDestroyCursorAt(gActionSelectionCursor[gActiveBattler]);
      gActionSelectionCursor[gActiveBattler] ^= 1;
      ActionSelectionCreateCursorAt(gActionSelectionCursor[gActiveBattler], 0);
    }
  } else if (JOY_NEW(DPAD_RIGHT)) {
    if (!(gActionSelectionCursor[gActiveBattler] & 1)) { // if is B_ACTION_USE_MOVE or B_ACTION_SWITCH
      PlaySE(SE_SELECT);
      ActionSelectionDestroyCursorAt(gActionSelectionCursor[gActiveBattler]);
      gActionSelectionCursor[gActiveBattler] ^= 1;
      ActionSelectionCreateCursorAt(gActionSelectionCursor[gActiveBattler], 0);
    }
  } else if (JOY_NEW(DPAD_UP)) {
    if (gActionSelectionCursor[gActiveBattler] & 2) { // if is B_ACTION_SWITCH or B_ACTION_RUN
      PlaySE(SE_SELECT);
      ActionSelectionDestroyCursorAt(gActionSelectionCursor[gActiveBattler]);
      gActionSelectionCursor[gActiveBattler] ^= 2;
      ActionSelectionCreateCursorAt(gActionSelectionCursor[gActiveBattler], 0);
    }
  } else if (JOY_NEW(DPAD_DOWN)) {
    if (!(gActionSelectionCursor[gActiveBattler] & 2)) { // if is B_ACTION_USE_MOVE or B_ACTION_USE_ITEM
      PlaySE(SE_SELECT);
      ActionSelectionDestroyCursorAt(gActionSelectionCursor[gActiveBattler]);
      gActionSelectionCursor[gActiveBattler] ^= 2;
      ActionSelectionCreateCursorAt(gActionSelectionCursor[gActiveBattler], 0);
    }
  } else if (JOY_NEW(B_BUTTON) || gPlayerDpadHoldFrames > 59) {
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
        && GetBattlerPosition(gActiveBattler) === B_POSITION_PLAYER_RIGHT
        && !(gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)])
        && !(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
      if (gBattleBufferA[gActiveBattler][1] === B_ACTION_USE_ITEM) {
        // Add item to bag if it is a ball
        if (itemId <= LAST_BALL) {
          _AddBagItem_battle(itemId, 1);
        } else {
          return;
        }
      }
      PlaySE(SE_SELECT);
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_CANCEL_PARTNER, 0);
      PlayerBufferExecCompleted();
    }
  } else if (JOY_NEW(START_BUTTON)) {
    _SwapHpBarsWithHpText();
  }
  // Unused but suppress lint : HandleInputChooseTarget référencé pour cascade.
  void HandleInputChooseTarget;
}

/** 1:1 signature décomp `AddBagItem(itemId, count)` (item.c). Wire lazy vers
 *  bag.ts existant via globalThis pour éviter cycle ESM massif. */
function _AddBagItem_battle(itemId: number, count: number): void {
  const m = (globalThis as { __bagApi?: { AddBagItem?: (id: string, c: number) => boolean } }).__bagApi;
  if (m?.AddBagItem) m.AddBagItem(String(itemId), count);
}

/** 1:1 décomp `PlayerHandleYesNoBox()`. */
function PlayerHandleYesNoBox(): void {
  // 1:1 décomp : yes/no input loop. Auto-confirme YES pour now.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleChooseMove()` (battle_controller_player.c:2629-2641).
 *  Setup move selection menu : si Battle Palace → install
 *  PlayerChooseMoveInBattlePalace ; sinon → InitMoveSelectionsVarsAndStrings +
 *  install HandleChooseMoveAfterDma3. */
function PlayerHandleChooseMove(): void {
  if (gBattleTypeFlags & BATTLE_TYPE_PALACE) {
    // 1:1 décomp : arenaMindPoints[battler] = 8 + install Palace handler.
    // Dette R3 : Frontier subsystem (= user "Report jusqu'à fin projet").
    gBattlerControllerFuncs[gActiveBattler] = PlayerChooseMoveInBattlePalace;
  } else {
    InitMoveSelectionsVarsAndStrings();
    gBattlerControllerFuncs[gActiveBattler] = HandleChooseMoveAfterDma3;
  }
}

/** 1:1 décomp `PlayerHandleChooseItem()`. */
function PlayerHandleChooseItem(): void {
  // Dette R3 Phase B : bag UI item select. Pour now : assume 0 (= cancel).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleChoosePokemon()`. */
function PlayerHandleChoosePokemon(): void {
  // Dette R3 Phase B : party menu mon select. Pour now : assume PARTY_SIZE (= cancel).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleCmd23()`. */
function PlayerHandleCmd23(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleHealthBarUpdate()`. */
function PlayerHandleHealthBarUpdate(): void {
  // Wire vers K10 HP bar drain. Pour now : immediate complete.
  // Cascade : startBattleBarDrain via K10.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleExpUpdate()`. */
function PlayerHandleExpUpdate(): void {
  // Wire vers EXP bar fill. Pour now : immediate complete.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleStatusIconUpdate()`. */
function PlayerHandleStatusIconUpdate(): void {
  // Wire vers healthbox status icon. Pour now : immediate.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleStatusAnimation()`. */
function PlayerHandleStatusAnimation(): void {
  // Dette R3 : status anim (paralyse blue / sleep zZ / etc.).
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleStatusXor()`. */
function PlayerHandleStatusXor(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleDataTransfer()`. */
function PlayerHandleDataTransfer(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleDMA3Transfer()`. */
function PlayerHandleDMA3Transfer(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePlayBGM()`. */
function PlayerHandlePlayBGM(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleCmd32()`. */
function PlayerHandleCmd32(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleTwoReturnValues()`. */
function PlayerHandleTwoReturnValues(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleChosenMonReturnValue()`. */
function PlayerHandleChosenMonReturnValue(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleOneReturnValue()`. */
function PlayerHandleOneReturnValue(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleOneReturnValue_Duplicate()`. */
function PlayerHandleOneReturnValue_Duplicate(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleClearUnkVar()` etc. */
function PlayerHandleClearUnkVar(): void { PlayerBufferExecCompleted(); }
function PlayerHandleSetUnkVar(): void { PlayerBufferExecCompleted(); }
function PlayerHandleClearUnkFlag(): void { PlayerBufferExecCompleted(); }
function PlayerHandleToggleUnkFlag(): void { PlayerBufferExecCompleted(); }

/** 1:1 décomp `PlayerHandleHitAnimation()`. */
function PlayerHandleHitAnimation(): void {
  // Wire vers sprite shake (= startShake battle-flow). Pour now : immediate.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleCantSwitch()`. */
function PlayerHandleCantSwitch(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePlaySE()`. */
function PlayerHandlePlaySE(): void {
  const seId = gBattleBufferA[gActiveBattler][1] | (gBattleBufferA[gActiveBattler][2] << 8);
  PlaySE(seId);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandlePlayFanfareOrBGM()`. */
function PlayerHandlePlayFanfareOrBGM(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleFaintingCry()`. */
function PlayerHandleFaintingCry(): void {
  // Dette R3 : cry pokemon faint variant.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleIntroSlide()`. */
function PlayerHandleIntroSlide(): void {
  // Wire vers K16 battle-intro-events. Pour now : immediate.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleIntroTrainerBallThrow()`. */
function PlayerHandleIntroTrainerBallThrow(): void {
  // Wire vers K16 battle-intro-events + cascade visuels K9.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleDrawPartyStatusSummary()`. */
function PlayerHandleDrawPartyStatusSummary(): void {
  // Wire vers K19 BufferPartyVsScreenHealth + UI display.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleHidePartyStatusSummary()`. */
function PlayerHandleHidePartyStatusSummary(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleEndBounceEffect()`. */
function PlayerHandleEndBounceEffect(): void {
  // Wire vers K20 EndBounceEffect.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSpriteInvisibility()`. */
function PlayerHandleSpriteInvisibility(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleBattleAnimation()`. */
function PlayerHandleBattleAnimation(): void {
  // Wire vers K1 battle-anim-interpreter LaunchBattleAnimation.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleLinkStandbyMsg()`. */
function PlayerHandleLinkStandbyMsg(): void {
  // Dette R3 : link standby (= user "Report").
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleResetActionMoveSelection()`. */
function PlayerHandleResetActionMoveSelection(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleEndLinkBattle()`. */
function PlayerHandleEndLinkBattle(): void {
  // Dette R3 : end link battle (= user "Report").
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerCmdEnd()` (= NOP terminator). */
function PlayerCmdEnd(): void {
  // Marker fin de buffer.
}

/** 1:1 décomp `PlayerHandleGetRawMonData()`. */
function PlayerHandleGetRawMonData(): void {
  PlayerBufferExecCompleted();
}

// ─── sPlayerBufferCommands dispatch table (battle_controller_player.c:123) ─

/** 1:1 décomp `sPlayerBufferCommands[CONTROLLER_CMDS_COUNT]` (123-182).
 *  Dispatch table 56 entries indexée par bufferA[0] = opcode. */
export const sPlayerBufferCommands: Array<() => void> = new Array(CONTROLLER_CMDS_COUNT);

function _initSPlayerBufferCommands(): void {
  sPlayerBufferCommands[CONTROLLER_GETMONDATA] = PlayerHandleGetMonData;
  sPlayerBufferCommands[CONTROLLER_GETRAWMONDATA] = PlayerHandleGetRawMonData;
  sPlayerBufferCommands[CONTROLLER_SETMONDATA] = PlayerHandleSetMonData;
  sPlayerBufferCommands[CONTROLLER_SETRAWMONDATA] = PlayerHandleSetRawMonData;
  sPlayerBufferCommands[CONTROLLER_LOADMONSPRITE] = PlayerHandleLoadMonSprite;
  sPlayerBufferCommands[CONTROLLER_SWITCHINANIM] = PlayerHandleSwitchInAnim;
  sPlayerBufferCommands[CONTROLLER_RETURNMONTOBALL] = PlayerHandleReturnMonToBall;
  sPlayerBufferCommands[CONTROLLER_DRAWTRAINERPIC] = PlayerHandleDrawTrainerPic;
  sPlayerBufferCommands[CONTROLLER_TRAINERSLIDE] = PlayerHandleTrainerSlide;
  sPlayerBufferCommands[CONTROLLER_TRAINERSLIDEBACK] = PlayerHandleTrainerSlideBack;
  sPlayerBufferCommands[CONTROLLER_FAINTANIMATION] = PlayerHandleFaintAnimation;
  sPlayerBufferCommands[CONTROLLER_PALETTEFADE] = PlayerHandlePaletteFade;
  sPlayerBufferCommands[CONTROLLER_SUCCESSBALLTHROWANIM] = PlayerHandleSuccessBallThrowAnim;
  sPlayerBufferCommands[CONTROLLER_BALLTHROWANIM] = PlayerHandleBallThrowAnim;
  sPlayerBufferCommands[CONTROLLER_PAUSE] = PlayerHandlePause;
  sPlayerBufferCommands[CONTROLLER_MOVEANIMATION] = PlayerHandleMoveAnimation;
  sPlayerBufferCommands[CONTROLLER_PRINTSTRING] = PlayerHandlePrintString;
  sPlayerBufferCommands[CONTROLLER_PRINTSTRINGPLAYERONLY] = PlayerHandlePrintSelectionString;
  sPlayerBufferCommands[CONTROLLER_CHOOSEACTION] = PlayerHandleChooseAction;
  sPlayerBufferCommands[CONTROLLER_YESNOBOX] = PlayerHandleYesNoBox;
  sPlayerBufferCommands[CONTROLLER_CHOOSEMOVE] = PlayerHandleChooseMove;
  sPlayerBufferCommands[CONTROLLER_OPENBAG] = PlayerHandleChooseItem;
  sPlayerBufferCommands[CONTROLLER_CHOOSEPOKEMON] = PlayerHandleChoosePokemon;
  sPlayerBufferCommands[CONTROLLER_23] = PlayerHandleCmd23;
  sPlayerBufferCommands[CONTROLLER_HEALTHBARUPDATE] = PlayerHandleHealthBarUpdate;
  sPlayerBufferCommands[CONTROLLER_EXPUPDATE] = PlayerHandleExpUpdate;
  sPlayerBufferCommands[CONTROLLER_STATUSICONUPDATE] = PlayerHandleStatusIconUpdate;
  sPlayerBufferCommands[CONTROLLER_STATUSANIMATION] = PlayerHandleStatusAnimation;
  sPlayerBufferCommands[CONTROLLER_STATUSXOR] = PlayerHandleStatusXor;
  sPlayerBufferCommands[CONTROLLER_DATATRANSFER] = PlayerHandleDataTransfer;
  sPlayerBufferCommands[CONTROLLER_DMA3TRANSFER] = PlayerHandleDMA3Transfer;
  sPlayerBufferCommands[CONTROLLER_PLAYBGM] = PlayerHandlePlayBGM;
  sPlayerBufferCommands[CONTROLLER_32] = PlayerHandleCmd32;
  sPlayerBufferCommands[CONTROLLER_TWORETURNVALUES] = PlayerHandleTwoReturnValues;
  sPlayerBufferCommands[CONTROLLER_CHOSENMONRETURNVALUE] = PlayerHandleChosenMonReturnValue;
  sPlayerBufferCommands[CONTROLLER_ONERETURNVALUE] = PlayerHandleOneReturnValue;
  sPlayerBufferCommands[CONTROLLER_ONERETURNVALUE_DUPLICATE] = PlayerHandleOneReturnValue_Duplicate;
  sPlayerBufferCommands[CONTROLLER_CLEARUNKVAR] = PlayerHandleClearUnkVar;
  sPlayerBufferCommands[CONTROLLER_SETUNKVAR] = PlayerHandleSetUnkVar;
  sPlayerBufferCommands[CONTROLLER_CLEARUNKFLAG] = PlayerHandleClearUnkFlag;
  sPlayerBufferCommands[CONTROLLER_TOGGLEUNKFLAG] = PlayerHandleToggleUnkFlag;
  sPlayerBufferCommands[CONTROLLER_HITANIMATION] = PlayerHandleHitAnimation;
  sPlayerBufferCommands[CONTROLLER_CANTSWITCH] = PlayerHandleCantSwitch;
  sPlayerBufferCommands[CONTROLLER_PLAYSE] = PlayerHandlePlaySE;
  sPlayerBufferCommands[CONTROLLER_PLAYFANFAREORBGM] = PlayerHandlePlayFanfareOrBGM;
  sPlayerBufferCommands[CONTROLLER_FAINTINGCRY] = PlayerHandleFaintingCry;
  sPlayerBufferCommands[CONTROLLER_INTROSLIDE] = PlayerHandleIntroSlide;
  sPlayerBufferCommands[CONTROLLER_INTROTRAINERBALLTHROW] = PlayerHandleIntroTrainerBallThrow;
  sPlayerBufferCommands[CONTROLLER_DRAWPARTYSTATUSSUMMARY] = PlayerHandleDrawPartyStatusSummary;
  sPlayerBufferCommands[CONTROLLER_HIDEPARTYSTATUSSUMMARY] = PlayerHandleHidePartyStatusSummary;
  sPlayerBufferCommands[CONTROLLER_ENDBOUNCE] = PlayerHandleEndBounceEffect;
  sPlayerBufferCommands[CONTROLLER_SPRITEINVISIBILITY] = PlayerHandleSpriteInvisibility;
  sPlayerBufferCommands[CONTROLLER_BATTLEANIMATION] = PlayerHandleBattleAnimation;
  sPlayerBufferCommands[CONTROLLER_LINKSTANDBYMSG] = PlayerHandleLinkStandbyMsg;
  sPlayerBufferCommands[CONTROLLER_RESETACTIONMOVESELECTION] = PlayerHandleResetActionMoveSelection;
  sPlayerBufferCommands[CONTROLLER_ENDLINKBATTLE] = PlayerHandleEndLinkBattle;
  sPlayerBufferCommands[CONTROLLER_TERMINATOR_NOP] = PlayerCmdEnd;
}
_initSPlayerBufferCommands();

// ─── Devtools expose ───────────────────────────────────────────────────────

void MarkBattlerForControllerExec;

(globalThis as Record<string, unknown>).__battleControllerPlayer = {
  sPlayerBufferCommands,
  SetControllerToPlayer, PlayerBufferRunCommand,
  getBattlerControllerFunc,
  // L1 wires exposés pour tests déterministes A_BUTTON cursor input loop.
  HandleInputChooseAction, HandleChooseActionAfterDma3,
  ActionSelectionCreateCursorAt, ActionSelectionDestroyCursorAt,
  PlayerHandleChooseAction,
  // L2 wires exposés pour tests déterministes Move selection input loop.
  HandleInputChooseMove, HandleChooseMoveAfterDma3,
  MoveSelectionCreateCursorAt, MoveSelectionDestroyCursorAt,
  InitMoveSelectionsVarsAndStrings, PlayerHandleChooseMove,
};

/**
 * src/game/battle_controller_player.ts — MIROIR 1:1 de
 * `src/battle_controller_player.c` (D:/Projet 1/decomps/pokeemeraude).
 *
 * MIGRÉ depuis engine/battle/battle-controller-player.ts (2026-06-10) après
 * certification de la TABLE des 57 commandes (audit awk + croisement handler par
 * handler — cf. mémoire migration-combat-progress) :
 *   - corps 1:1 : tout le flux INPUT (HandleInputChooseAction/Move/Target +
 *     HandleMoveSwitching), GetMonData/SetMonData/SwitchInAnim/ReturnMonToBall/
 *     DrawTrainerPic/FaintAnimation (machine 2-step + FaintSlide)/PrintString
 *     (byte-level)/ChooseAction/YesNoBox/ChooseMove/ChooseItem/ChoosePokemon/
 *     HealthBarUpdate/ExpUpdate (barre EXP)/StatusIconUpdate/HitAnimation/PlaySE/
 *     FaintingCry/IntroSlide/IntroTrainerBallThrow (send-out chain)/
 *     DrawPartyStatusSummary/HidePartyStatusSummary/EndBounce/SpriteInvisibility/
 *     LinkStandbyMsg (STOP_BOUNCE — débloque le faint joueur)/
 *     ResetActionMoveSelection/UnkVar×4.
 *   - 1:1 comportemental documenté : GetRawMonData/SetRawMonData/PaletteFade/
 *     Cmd23/DMA3Transfer/PlayBGM (émetteurs décomp UNUSED = code mort),
 *     Pause (busy-loop sans effet), TrainerSlide/SlideBack (positions
 *     link/doubles, non atteints en single), EndLinkBattle (sortie = voie L).
 *   - DETTES documentées en place : MoveAnimation/StatusAnimation/
 *     BattleAnimation (chantier anims), SuccessBallThrow/BallThrow (capture),
 *     PlayFanfareOrBGM (règle BGM/SE), fades fin de combat.
 *
 * L'ancien chemin engine/battle/battle-controller-player.ts = SHIM re-export
 * (side-effects inclus : install table + __battleControllerPlayer + imports
 * './battle-message' et './battle-healthbox-l').
 */

// Charge le décodeur texte BYTE-LEVEL (battle-message.ts) : son top-level pose
// `__battleMessage` sur globalThis + déclenche loadBattleCharmap. PlayerHandlePrintString
// (voie L) l'utilise via lookup globalThis = chemin byte-level pur 1:1 (remplace
// l'ancien décodeur partiel JS-string pour les messages de combat).
import '../engine/battle/battle-message';
// Couche healthbox VOIE L (modèle décomp : gHealthboxSpriteIds + UpdateHealthboxAttribute
// + MoveBattleBarGraphically). Side-effect import : s'enregistre sur globalThis.__battleHealthbox
// (que _gHealthboxSpriteId / _UpdateHealthboxAttribute lisent) + branche le hook MoveBattleBarGraphically.
import '../engine/battle/battle-healthbox-l';
import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gActionSelectionCursor, gMoveSelectionCursor, gAbsentBattlerFlags,
  gPlayerDpadHoldFrames, setPlayerDpadHoldFrames, incPlayerDpadHoldFrames,
  gNumberOfMovesToChoose, setNumberOfMovesToChoose,
  gMultiUsePlayerCursor, setMultiUsePlayerCursor,
  gBattlerControllerFuncs, setBattlerControllerFunc,
  gDoingBattleAnim as gDoingBattleAnimState, setGDoingBattleAnim, gBattlerTarget,
} from '../engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI, BATTLE_TYPE_PALACE,
  B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  B_ACTION_CANCEL_PARTNER, B_ACTION_EXEC_SCRIPT,
} from '../engine/battle/constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
  BtlController_EmitOneReturnValue,
  gUnusedControllerStruct,
} from '../engine/battle/battle-controllers-ipc';
import {
  gBitTable, MarkBattlerForControllerExec, BattlePutTextOnWindow,
  JOY_NEW, JOY_REPEAT, JOY_HELD,
  A_BUTTON, B_BUTTON, START_BUTTON,
  DPAD_LEFT, DPAD_RIGHT, DPAD_UP, DPAD_DOWN, DPAD_ANY,
  SE_SELECT,
} from '../engine/battle/battle-controllers';
// PlaySE wired via globalThis.__PlaySE (exposé par decomp-globals ligne ~722) —
// évite cycle ESM avec import direct.
function PlaySE(seId: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
import {
  DoBounceEffect, EndBounceEffect, BOUNCE_HEALTHBOX, BOUNCE_MON,
} from '../engine/battle/battle-sprite-callbacks';
import {
  B_WIN_ACTION_PROMPT, B_WIN_ACTION_MENU, B_WIN_MSG,
  B_WIN_MOVE_NAME_1, B_WIN_PP, B_WIN_PP_REMAINING, B_WIN_MOVE_TYPE,
} from '../engine/battle/battle-windows';
import { SELECT_BUTTON } from '../engine/battle/battle-controllers';
import {
  GetBattlerPosition, GetBattlerAtPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  GetDefaultMoveTarget,
} from '../engine/battle/util';
import {
  TYPE_GHOST, MOVE_NONE, MAX_MON_MOVES, MOVE_CURSE,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_SELECTED,
  MOVE_TARGET_RANDOM, MOVE_TARGET_BOTH, MOVE_TARGET_DEPENDS,
  MOVE_TARGET_FOES_AND_ALLY, MOVE_TARGET_OPPONENTS_FIELD,
  BATTLE_ALIVE_EXCEPT_ACTIVE,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE,
} from '../engine/battle/constants';
import { gSaveBlock2Ptr } from '../engine/save/save-block-state';
import {
  gPlayerParty, GetMonData,
  MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_LEVEL, MON_DATA_STATUS, MON_DATA_IS_EGG,
  MON_DATA_EXP, MON_DATA_SPECIES,
  SetBattleMonDataFromBuffer,
} from '../engine/battle/party-storage';
import { gBattlerPartyIndexes, setActiveBattler } from '../engine/battle/state';
import { HandleIntroSlide } from './battle_intro';
import {
  SetBattleBarStruct, MoveBattleBar, HEALTH_BAR, EXP_BAR,
} from '../engine/battle/battle-hp-bar';
// Party summary (barre + 6 balls, 1:1 battle_interface.c party-summary slice).
import {
  CreatePartyStatusSummarySprites, SetTaskFuncToHidePartyStatusSummary,
  ensurePartySummaryAssets, gBattlerStatusSummaryTaskId,
  type HpAndStatus as _PSHpAndStatus,
} from '../engine/battle/battle-party-summary';
import {
  setPartyStatusSummaryShown as _setPartyStatusSummaryShown,
  isPartyStatusSummaryShown as _isPartyStatusSummaryShown,
  getPartyStatusDelayTimer as _getPartyStatusDelayTimer,
  setPartyStatusDelayTimer as _setPartyStatusDelayTimer,
} from '../engine/battle/battle-sprites-data';
import { GET_BATTLER_SIDE as _PS_SIDE, B_SIDE_PLAYER as _PS_B_SIDE_PLAYER } from '../engine/battle/constants';
import { getExpForLevel } from '../engine/battle/data/experience-tables';
import { getSpeciesGrowthRate } from '../engine/battle/data/species-runtime';
import { LoadPalette, BG_PLTT_ID, getRuntime, SpriteCallbackDummy } from '../engine/system/decomp-globals';
import { reverseDecompConstant } from '../engine/system/decomp-constants';
// Helper partagé de création de sprite de battler (gère back=joueur / front=ennemi).
// opponent.ts n'importe PAS player.ts → pas de cycle ESM.
import { _loadAndCreateBattlerMonSprite, setBattlerDeferReveal, getBattlerMonSpriteId } from './battle_controller_opponent';
import {
  showTrainerBackSprite,
  getTrainerSpriteId, destroyTrainerBackSprite,
} from '../engine/battle/battle-sendout-anim';
import {
  StartAnimLinearTranslation, StoreSpriteCallbackInData6,
  SetSpritePrimaryCoordsFromSecondaryCoords,
} from './battle_anim_mons';
import { DoPokeballSendOutAnimation, POKEBALL_PLAYER_SENDOUT } from './pokeball';
import { StartSpriteAnim } from '../engine/system/sprite-animation';
import type { DecompTask, DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { isBallAnimActive } from '../engine/battle/battle-sprites-data';
import { reverseDecompConstant as _reverseDecompConstantPlayer } from '../engine/system/decomp-constants';
import { getMoveName as _getMoveNameFrFromData } from '../engine/data/game-data';
import { getBattleMove } from '../engine/battle/data/battle-moves';
import { getPPTextPalette } from '../engine/battle/battle-bg';
// BG tilemap réel (curseur menu action/move) — 1:1 décomp bg.c. gba-window-system
// n'importe PAS battle/ → pas de cycle.
import { CopyRectToBgTilemapBufferRect, CopyBgTilemapBufferToVram } from '../engine/ui/gba-window-system';
// ANTI-CYCLE ESM (regression T3 : l'import statique de battle_gfx_sfx_util
// bloquait l'INTRO — meme TDZ que pokeball/ST_OAM_AFFINE_DOUBLE) : lazy.
function _InitAndLaunchChosenStatusAnimation(isStatus2: boolean, status: number): void {
  const m = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as { InitAndLaunchChosenStatusAnimation?: (a: boolean, b: number) => void } | undefined;
  m?.InitAndLaunchChosenStatusAnimation?.(isStatus2, status);
}
function _isStatusAnimActiveBC(battler: number): boolean {
  const m = (globalThis as Record<string, unknown>).__battleSpritesData as { isStatusAnimActive?: (b: number) => boolean } | undefined;
  return m?.isStatusAnimActive?.(battler) ?? false;
}

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
// Table partagée unique : importée depuis state.ts (= le décomp n'a qu'UNE
// table globale gBattlerControllerFuncs). Player/opponent/setup y écrivent,
// BattleMainCB1 la tick.

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
 *  tilemap, palette 0x11. R2 wire : delegate au battle-flow setActionCursor
 *  (= text printer `>` mark) si combat actif, sinon BG tilemap manip. */
export function ActionSelectionCreateCursorAt(cursorPosition: number, baseTileNum: number): void {
  // R2 : delegate au battle-flow rendering réel si combat actif.
  // 1:1 décomp BG tilemap fallback.
  const src = new Uint16Array([baseTileNum + 1, baseTileNum + 2]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    7 * (cursorPosition & 1) + 16, 35 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `ActionSelectionDestroyCursorAt(cursorPosition)`
 *  (battle_controller_player.c:1540-1548). R2 wire : no-op si combat actif
 *  (= setActionCursor remplace `>` par ` ` au prochain refresh), sinon BG tilemap. */
export function ActionSelectionDestroyCursorAt(cursorPosition: number): void {
  const src = new Uint16Array([0x1016, 0x1016]);
  _CopyToBgTilemapBufferRect_ChangePalette(
    0, src,
    7 * (cursorPosition & 1) + 16, 35 + (cursorPosition & 2),
    1, 2, 0x11,
  );
  _CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `CopyToBgTilemapBufferRect_ChangePalette(bg, src, destX, destY,
 *  rectWidth, rectHeight, palette)` (bg.c:946-949) :
 *  ```c
 *  CopyRectToBgTilemapBufferRect(bg, src, 0, 0, rectWidth, rectHeight,
 *                                destX, destY, rectWidth, rectHeight, palette, 0, 0);
 *  ```
 *  C'est CE qui dessine le curseur ▶ du menu (tiles src=[baseTile+1, baseTile+2])
 *  au BG0 tilemap, palette 0x11 (= CopyTileMapEntry case 17 → écrit src verbatim).
 *  AVANT : routait vers le hook `__bgTilemap` JAMAIS wiré en voie L → curseur INVISIBLE
 *  (user "je bosse à l'aveugle"). Câblé vers le vrai CopyRectToBgTilemapBufferRect
 *  (gba-window-system) qui écrit gbaBg.tilemap (lu par le compositor chaque frame). */
function _CopyToBgTilemapBufferRect_ChangePalette(
  bg: number, src: Uint16Array, x: number, y: number, w: number, h: number, palette: number,
): void {
  CopyRectToBgTilemapBufferRect(bg, src, 0, 0, w, h, x, y, w, h, palette, 0, 0);
}

/** 1:1 décomp `CopyBgTilemapBufferToVram(bg)` (bg.c). Notre compositor lit
 *  gbaBg.tilemap chaque frame → no-op (cf. gba-window-system). */
function _CopyBgTilemapBufferToVram(bg: number): void {
  CopyBgTilemapBufferToVram(bg);
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
  // 1:1 décomp BattleStringExpandPlaceholdersToDisplayedString : substitue les
  // {B_X} (dont {B_ACTIVE_NAME_WITH_PREFIX} = nom du mon actif) via le decoder.
  // Avant : cherchait __battleStringDecoder (jamais exposé) → fallback `return src`
  // → "Que doit faire {B_ACTIVE_NAME_WITH_PREFIX}?" brut à l'écran. Le bon objet est
  // __battleStringDecoderApi.expandPlaceholders(src, msgData) + snapshot msgData.
  const api = (globalThis as { __battleStringDecoderApi?: { expandPlaceholders?: (src: string, msgData: unknown) => string } }).__battleStringDecoderApi;
  if (api?.expandPlaceholders) {
    const snap = (globalThis as { __battleControllers?: { snapshotMsgData?: () => unknown } }).__battleControllers;
    const msgData = snap?.snapshotMsgData?.() ?? {};
    return api.expandPlaceholders(src, msgData);
  }
  // Fallback : retourner src tel quel (= no expansion).
  return src;
}

/** 1:1 décomp `SwapHpBarsWithHpText()` (battle_interface.c:1376-1448). Toggle
 *  HP bar ↔ HP texte (START en combat). Le gate décomp ligne 1383 :
 *  `side != B_SIDE_OPPONENT && (IsDoubleBattle() || side != B_SIDE_PLAYER)`
 *  → en combat SINGLE les deux battlers sont SKIPPÉS = NO-OP TOTAL. Ce stub vide
 *  est donc COMPORTEMENTALEMENT 1:1 en single ; le corps (hpNumbersNoBars toggle +
 *  re-render) ne sera porté qu'avec les DOUBLES (non atteignables aujourd'hui). */
function _SwapHpBarsWithHpText(): void {
  // No-op 1:1 en single (cf. doc) — corps doubles différé.
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
 *  (battle_controller_player.c:1510-1518). R2 wire : delegate au battle-flow
 *  setMoveCursor si combat actif. */
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
 *  (battle_controller_player.c:1520-1528). R2 wire : no-op si combat actif. */
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

/** 1:1 décomp `gMoveNames[move]` lookup. gameData expose les noms par ENUM
 *  ("MOVE_POUND"), PAS par numéro → convertir le move id numérique en enum
 *  (reverseDecompConstant) puis lire le nom FR via getMoveName (= même mécanisme
 *  que le decoder de strings `_moveName`). Avant : lookup numérique sur
 *  gameDataMoves (keyé par enum) → échouait toujours → le menu de moves affichait
 *  l'ID brut ("1","43","71","98") au lieu des noms (bug texte menu). */
function _getMoveName(move: number): string {
  // 1:1 décomp `gMoveNames[move]` : table PLATE indexée par id, MOVE_NONE inclus
  // (gMoveNames[MOVE_NONE] = "--", cf. data/text/move_names.h:3). Avant :
  // `if (!move) return String(move)` affichait "0" pour les slots de move vides
  // (bug user "slots vides = 0"). On résout MOVE_NONE EXPLICITEMENT car
  // reverseDecompConstant(0,'MOVE_') est ambigu (MOVE_TARGET_SELECTED=0 partage
  // le préfixe 'MOVE_' → l'ordre d'itération pourrait renvoyer le mauvais enum).
  const enumName = move === MOVE_NONE ? 'MOVE_NONE' : reverseDecompConstant(move, 'MOVE_');
  if (enumName) {
    const fr = _getMoveNameFrFromData(enumName);
    if (fr && fr !== enumName) return fr;
    return enumName.replace(/^MOVE_/, '');
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

/** 1:1 décomp `gBattleMoves[move].target`. Via getBattleMove (id numérique, .target
 *  résolu en nombre) — même bug que _getMoveType : gameDataMoves est keyé par ENUM,
 *  `parseInt(k,10)===move` ne matchait jamais → toujours MOVE_TARGET_SELECTED (les
 *  moves USER comme Danse-Lames ciblaient l'adversaire au lieu du lanceur). */
function _getMoveTarget(move: number): number {
  const t = getBattleMove(move).target;
  return typeof t === 'number' ? t : MOVE_TARGET_SELECTED;
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
  // 1:1 décomp MoveSelectionDisplayMoveType (battle_controller_player.c:1496-1508) :
  // "TYPE/" (label, rendu dans le font de la fenêtre B_WIN_MOVE_TYPE = FONT_NARROW)
  // PUIS EXT_CTRL_CODE_FONT + FONT_NORMAL avant le nom du type → le type lui-même
  // passe en FONT_NORMAL. {FONT NORMAL} = notre encodage de ces 3 bytes.
  BattlePutTextOnWindow(`TYPE/{FONT NORMAL}${_getTypeName(moveType)}`, B_WIN_MOVE_TYPE);
}

/** 1:1 décomp `gBattleMoves[move].type`. Via getBattleMove (= _moves[] indexé par
 *  id numérique, .type résolu en nombre) — PAS gameDataMoves qui est keyé par ENUM
 *  ("MOVE_X") : `parseInt("MOVE_EMBER",10)` = NaN → aucun match → tout retombait sur
 *  0 = TYPE_NORMAL (le menu de move affichait "NORMAL" pour TOUS les moves). */
function _getMoveType(move: number): number {
  const t = getBattleMove(move).type;
  return typeof t === 'number' ? t : 0;
}

/** 1:1 décomp `GetCurrentPpToMaxPpState` (battle_message.c:3124-3155). Retourne
 *  0..3 = sélecteur de paire de couleurs dans gPPTextPalette selon le ratio
 *  currentPp/maxPp (3 = plein, 1/2 = bas/vide). */
function GetCurrentPpToMaxPpState(currentPp: number, maxPp: number): number {
  if (maxPp === currentPp) return 3;
  else if (maxPp <= 2) return currentPp > 1 ? 3 : 2 - currentPp;
  else if (maxPp <= 7) return currentPp > 2 ? 3 : 2 - currentPp;
  else {
    if (currentPp === 0) return 2;
    if (currentPp <= Math.floor(maxPp / 4)) return 1;
    if (currentPp > Math.floor(maxPp / 2)) return 3;
  }
  return 0;
}

/** 1:1 décomp `SetPpNumbersPaletteInMoveSelection()` (battle_message.c:3110-3122).
 *  Recolore le slot palette BG 5 — entry 12 (fg = TEXT_DYNAMIC_COLOR_3) et entry
 *  11 (shadow = TEXT_DYNAMIC_COLOR_2) — depuis gPPTextPalette[var*2 + {0,1}] selon
 *  l'état PP du move sous le curseur. Sans ça les chiffres PP gardaient les
 *  couleurs par défaut du slot 5 (= bug couleur PP signalé user). */
function _SetPpNumbersPaletteInMoveSelection(): void {
  const palPtr = getPPTextPalette();
  if (!palPtr) return;  // gPPTextPalette pas encore préchargé (hors setup combat)
  const moveInfo = _readChooseMoveStruct(gActiveBattler);
  const cur = gMoveSelectionCursor[gActiveBattler];
  const v = GetCurrentPpToMaxPpState(moveInfo.currentPp[cur], moveInfo.maxPp[cur]);
  // 1:1 décomp : gPlttBuffer[BG_PLTT_ID(5)+12] = palPtr[v*2+0] ;
  //              gPlttBuffer[BG_PLTT_ID(5)+11] = palPtr[v*2+1].
  // entries 11 & 12 contiguës → un LoadPalette (src[0]→11, src[1]→12) qui écrit
  // gPlttBufferUnfaded + Faded (≡ le CpuCopy16 unfaded→faded du décomp).
  LoadPalette(new Uint16Array([palPtr[v * 2 + 1], palPtr[v * 2 + 0]]), BG_PLTT_ID(5) + 11, 4);
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

  if (JOY_HELD(DPAD_ANY) && gSaveBlock2Ptr.optionsButtonMode === OPTIONS_BUTTON_MODE_L_EQUALS_A) { // AUDIT 2026-06 : C:476 = JOY_HELD (était JOY_REPEAT ; ChooseAction :1329 reste JOY_REPEAT 1:1 C:240).
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

/** 1:1 décomp `SetPlayerMonData(monId)` (battle_controller_player.c:116) : désérialise
 *  gBattleBufferA[active] + applique au mon `monId` de gPlayerParty via SetMonData. */
function _SetPlayerMonData(monId: number): void {
  SetBattleMonDataFromBuffer(monId, gBattleBufferA[gActiveBattler], gActiveBattler);
}

/** 1:1 décomp `StartSendOutAnim(battler, dontClearSubstituteBit)`
 *  (battle_controller_player.c:2196-2225). Setup sprite invisible callback +
 *  CreateSprite mon + DoPokeballSendOutAnimation. Wire vers __battleBallThrow
 *  hook (= K9 cascade visuels) — pour now appelle hook si dispo. */
function _StartSendOutAnim(battler: number, dontClearSubstituteBit: boolean): void {
  _ClearTemporarySpeciesSpriteData(battler, dontClearSubstituteBit);
  gBattlerPartyIndexes[battler] = gBattleBufferA[battler][1];
  // 1:1 décomp StartSendOutAnim (battle_controller_player.c:2196) : crée le sprite du mon
  // (back-pic du nouveau mon entrant) INVISIBLE puis DoPokeballSendOutAnimation. Le mon
  // sort d'une POKÉBALL → deferReveal (révélé à l'émergence par la chaîne ball, phase 1).
  // En L `_loadAndCreateBattlerMonSprite` (load gfx + CreateSprite) est ASYNC : on lance
  // la ball dès que la création est faite (le gfx a été (re)chargé au reshow → cache-hit
  // rapide). Réutilise la chaîne de waits healthbox 1:1 de l'intro (_PlayerIntroSendOutWait).
  setBattlerDeferReveal(battler, true);
  void _loadAndCreateBattlerMonSprite(battler, false).then(() => {
    const rt = getRuntime();
    if (!rt) return;
    const saved = gActiveBattler;
    setActiveBattler(battler);
    DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT);   // 1:1 l.2224
    _sendOutPhase = 1;
    gBattlerControllerFuncs[battler] = _PlayerIntroSendOutWait;
    setActiveBattler(saved);
  });
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
    // 1:1 décomp : SetPlayerMonData(gBattlerPartyIndexes[gActiveBattler]).
    _SetPlayerMonData(gBattlerPartyIndexes[gActiveBattler]);
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

/** 1:1 décomp `PlayerHandleSwitchInAnim()` (battle_controller_player.c:2185-2194).
 *  ClearTemporarySpeciesSpriteData + set gBattlerPartyIndexes + load sprite
 *  gfx + reset cursors + StartSendOutAnim + install Switch_TryShinyHealthbox. */
function PlayerHandleSwitchInAnim(): void {
  const battler = gActiveBattler;
  _ClearTemporarySpeciesSpriteData(battler, gBattleBufferA[battler][2] !== 0);
  gBattlerPartyIndexes[battler] = gBattleBufferA[battler][1];   // 1:1 l.2188
  gActionSelectionCursor[battler] = 0;
  gMoveSelectionCursor[battler] = 0;
  // Harness (__battleTextInstant) : les SpriteCB/Task ne tournent pas (callbacks tickés
  // sans runOneFrame) → création directe du mon + healthbox + complete (cf intro send-out).
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    void _loadAndCreateBattlerMonSprite(battler, false);
    _ShowHealthboxOnSendOut(battler);
    PlayerBufferExecCompleted();
    return;
  }
  // 1:1 l.2192 StartSendOutAnim : le nouveau mon sort d'une ball (crée le sprite +
  // DoPokeballSendOutAnimation + chaîne de waits healthbox). _BattleControllerDummy tient
  // le flag exec jusqu'à ce que _StartSendOutAnim (.then async) installe _PlayerIntroSendOutWait.
  _StartSendOutAnim(battler, gBattleBufferA[battler][2] !== 0);
  gBattlerControllerFuncs[battler] = _BattleControllerDummy;
}

/** 1:1 décomp `ClearTemporarySpeciesSpriteData(battler, dontClearSubstituteBit)`. */
function _ClearTemporarySpeciesSpriteData(_battler: number, _dontClear: boolean): void {
  // Dette R3 : gBattleSpritesDataPtr.battlerData[battler] cleanup
  // (= cascade sprite engine GBA). Wire vers globalThis __battleSpritesData.
  const m = (globalThis as { __battleSpritesData?: { clearTemporarySpeciesSpriteData?: (b: number, c: boolean) => void } }).__battleSpritesData;
  if (m?.clearTemporarySpeciesSpriteData) m.clearTemporarySpeciesSpriteData(_battler, _dontClear);
}

/** 1:1 décomp `PlayerHandleReturnMonToBall()` (battle_controller_player.c:2227). Le mon
 *  sortant doit DISPARAÎTRE avant le send-out du remplaçant. Décomp : bufferA[1]==0 →
 *  anim de rappel (DoSwitchOutAnimation : B_ANIM_SWITCH_OUT_PLAYER_MON, le mon rétrécit
 *  dans la ball) ; sinon → suppression directe (FreeSpriteOamMatrix + DestroySprite +
 *  SetHealthboxSpriteInvisible). DETTE 1:1 : l'anim de rappel (special anim) n'est pas
 *  encore portée → suppression directe dans les DEUX cas (le mon disparaît proprement,
 *  son sprite n'est plus orphelin = corrige "le mon ne change pas" au switch). */
function PlayerHandleReturnMonToBall(): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(gActiveBattler);
  const sprite = rt?.gSprites?.get(spriteId);
  if (sprite && rt?.gSprites) {
    // 1:1 l.2237-2238 FreeSpriteOamMatrix + DestroySprite (mon post-reshow = statique,
    // pas de matrice affine à libérer).
    sprite.inUse = false;
    sprite.callback = null;
    rt.gSprites.delete(spriteId);
  }
  // 1:1 l.2239 SetHealthboxSpriteInvisible(gHealthboxSpriteIds[battler]).
  const hb = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteInvisible?: (id: number) => void } }).__battleHealthbox;
  hb?.SetHealthboxSpriteInvisible?.(_gHealthboxSpriteId(gActiveBattler));
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `SpriteCB_TrainerSlideVertical(struct Sprite *sprite)` (battle_gfx_sfx_util.c). */
function SpriteCB_TrainerSlideVertical(sprite: DecompSprite): void {
  sprite.y2 -= 2;
  if (sprite.y2 === 0) sprite.callback = SpriteCallbackDummy;
}

/** 1:1 décomp `SpriteCB_TrainerSlideIn(struct Sprite *sprite)` (battle_gfx_sfx_util.c).
 *  Slide horizontal (x2 += sSpeedX=data[0]) GATÉ sur gIntroSlideFlags bit0 (gèle pendant l'ouverture
 *  des bandes WIN0V — MÊME gate que le mon sauvage SpriteCB_MoveWildMonToRight, prouvé wiré) ; à
 *  x2==0, enchaîne le slide vertical (si y2) sinon SpriteCallbackDummy (= slide fini, lu par
 *  CompleteOnBattlerSpriteCallbackDummy). Tické par AnimateSprites (RunSpriteCallbacks). */
function SpriteCB_TrainerSlideIn(sprite: DecompSprite): void {
  // gIntroSlideFlags via __battleMainFunctions (pattern anti-cycle ESM, cf. PlayerHandleIntroSlide).
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as { getIntroSlideFlags?: () => number } | undefined;
  if (!((bmf?.getIntroSlideFlags?.() ?? 0) & 1)) {
    sprite.x2 += sprite.data[0];   // sSpeedX
    if (sprite.x2 === 0) {
      if (sprite.y2 !== 0) sprite.callback = SpriteCB_TrainerSlideVertical;
      else sprite.callback = SpriteCallbackDummy;
    }
  }
}

/** 1:1 décomp `PlayerHandleDrawTrainerPic()` (battle_controller_player.c:2270-2351).
 *  Crée le back-pic dresseur joueur (xPos=80) off-screen DROITE (x2=DISPLAY_WIDTH posé par
 *  showTrainerBackSprite), pose sSpeedX=-2 + callback=SpriteCB_TrainerSlideIn (slide piloté par
 *  AnimateSprites, GATÉ gIntroSlideFlags = 1:1, PLUS d'ad-hoc startIntroSlideIn/tickIntroSlideIn),
 *  puis attend la fin du slide (CompleteOnBattlerSpriteCallbackDummy) avant ExecCompleted → le flag
 *  exec reste SET pendant le slide = cadence l'intro. */
let _trainerSlideStarted = false;
function PlayerHandleDrawTrainerPic(): void {
  // Harness : court-circuit (le slide dépend des SpriteCB tickés = freeze harness). Cf.
  // PlayerHandleIntroTrainerBallThrow.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    PlayerBufferExecCompleted();
    return;
  }
  const gender = ((globalThis as { gSaveBlock2Ptr?: { playerGender?: number } }).gSaveBlock2Ptr?.playerGender) ?? 0;
  _trainerSlideStarted = false;
  const rt = getRuntime();
  // showTrainerBackSprite (async) charge brendan/may.png + crée le sprite à x2=DISPLAY_WIDTH (yPos=80,
  // 1:1 (8-size)*4+80 pour un back-pic 64×64). 1:1 ll. 2345-2347 : sSpeedX=-2, callback=SpriteCB_TrainerSlideIn.
  void showTrainerBackSprite(gender, 80, 80).then((tid) => {
    const tr = rt && tid >= 0 ? rt.gSprites.get(tid) : null;
    if (tr) {
      tr.data[0] = -2;                        // sSpeedX
      tr.callback = SpriteCB_TrainerSlideIn;  // slide-in 1:1 (x2 DISPLAY_WIDTH → 0, gaté gIntroSlideFlags)
    }
    _trainerSlideStarted = true;
  }).catch(() => { _trainerSlideStarted = true; });
  // 1:1 l. 2350 : gBattlerControllerFuncs = CompleteOnBattlerSpriteCallbackDummy.
  gBattlerControllerFuncs[gActiveBattler] = _CompleteOnTrainerSlideIn;
}
/** 1:1 décomp `CompleteOnBattlerSpriteCallbackDummy()` (battle_controllers.c) : attend que le sprite
 *  du dresseur ait fini son slide (callback === SpriteCallbackDummy) puis ExecCompleted. Le flag exec
 *  reste set jusque-là = cadence l'intro. `_trainerSlideStarted` gate l'async (sprite créé après load). */
function _CompleteOnTrainerSlideIn(): void {
  if (!_trainerSlideStarted) return;
  const rt = getRuntime();
  const tid = getTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites.get(tid) : null;
  if (!tr || tr.callback === SpriteCallbackDummy) PlayerBufferExecCompleted();
}

/** 1:1 COMPORTEMENTAL : `trainerslidein` passe une POSITION (BS_ATTACKER=1 →
 *  OPPONENT_LEFT en single ; BS_FAINTED=3 → OPPONENT_RIGHT, inexistant en single)
 *  → le controller PLAYER ne reçoit jamais TRAINERSLIDE en local single (le slide
 *  du back joueur = link multi, VERSION_* gates). Corps décomp (:2484) différé. */
function PlayerHandleTrainerSlide(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 COMPORTEMENTAL : non atteint en single (cf. PlayerHandleTrainerSlide).
 *  Corps décomp (:2516) = translation x→-40 50f + StartSpriteAnim(1) — différé. */
function PlayerHandleTrainerSlideBack(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleFaintAnimation()` (battle_controller_player.c:2408-2429).
 *  State machine 2-step :
 *    State 0 : check substitute → InitAndLaunchSpecialAnimation SUBSTITUTE_TO_MON
 *      → animationState++
 *    State 1 : si specialAnimActive done → HandleLowHpMusicChange + PlaySE12
 *      SE_FAINT panning + setup sprite speedY=5 + callback SpriteCB_FaintSlideAnim
 *      (= K13) + install FreeMonSpriteAfterFaintAnim. */
function PlayerHandleFaintAnimation(): void {
  // __battleSpritesData (animationState) pas encore câblé → la state machine 1:1
  // ci-dessous bouclerait en state 0 (_setHealthBoxAnimationState no-op → animState
  // reste 0). On GARDE le port 1:1 (dormant) mais ExecComplete direct tant que le
  // backing est absent (visuel faint via le path enqueue, Dette R3). Retirer la garde
  // dès que __battleSpritesData sera câblé.
  if (!_healthBoxAnimStateWired()) { PlayerBufferExecCompleted(); return; }
  const animState = _getHealthBoxAnimationState(gActiveBattler);
  if (animState === 0) {
    if (_isBehindSubstitute(gActiveBattler)) {
      _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
    }
    _setHealthBoxAnimationState(gActiveBattler, animState + 1);
  } else {
    if (!_isSpecialAnimActive(gActiveBattler)) {
      _setHealthBoxAnimationState(gActiveBattler, 0);
      _HandleLowHpMusicChange(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);
      _PlaySE12WithPanning(_SE_FAINT, _SOUND_PAN_ATTACKER);
      // 1:1 décomp : trigger K13 SpriteCB_FaintSlideAnim avec speedY=5.
      _triggerFaintSlideAnim(gActiveBattler);
      gBattlerControllerFuncs[gActiveBattler] = _FreeMonSpriteAfterFaintAnim;
    }
  }
}

/** 1:1 décomp `B_ANIM_SUBSTITUTE_TO_MON` (battle_anim.h). */
const _B_ANIM_SUBSTITUTE_TO_MON = 5; // AUDIT 2026-06 : 5 = SUBSTITUTE_TO_MON (battle_anim.h:387) ; était 6 (anim inverse).

/** 1:1 décomp `SE_FAINT` (constants/songs.h). */
const _SE_FAINT = 16; // 1:1 décomp songs.h:22 SE_FAINT=16. AUDIT 2026-06 : était 21 (= SE_PIN).

/** 1:1 décomp `SOUND_PAN_ATTACKER` (battle.h). */
const _SOUND_PAN_ATTACKER = -64;

/** Helpers state machine healthbox animationState (= gBattleSpritesDataPtr). */
function _getHealthBoxAnimationState(battler: number): number {
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxAnimationState?: (b: number) => number } }).__battleSpritesData;
  return m?.getHealthBoxAnimationState?.(battler) ?? 0;
}
/** True si le backing __battleSpritesData.animationState est câblé (= les setters
 *  persistent). Sinon les state machines basées dessus (FaintAnimation) bouclent
 *  → on les court-circuite en ExecComplete (visuel via enqueue, Dette R3). */
export function _healthBoxAnimStateWired(): boolean {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: unknown } }).__battleSpritesData;
  return typeof m?.setHealthBoxAnimationState === 'function';
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

/** 1:1 décomp `InitAndLaunchSpecialAnimation(active, attacker, target, animId)`. */
function _InitAndLaunchSpecialAnimation(_active: number, _attacker: number, _target: number, _animId: number): void {
  const m = (globalThis as { __battleAnim?: { initAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleAnim;
  m?.initAndLaunchSpecialAnimation?.(_active, _attacker, _target, _animId);
}

/** 1:1 décomp `HandleLowHpMusicChange(mon, battler)`. */
function _HandleLowHpMusicChange(_mon: unknown, _battler: number): void {
  const m = (globalThis as { __battleHealthbox?: { handleLowHpMusicChange?: (mon: unknown, b: number) => void } }).__battleHealthbox;
  m?.handleLowHpMusicChange?.(_mon, _battler);
}

/** 1:1 décomp `PlaySE12WithPanning(seId, pan)`. */
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  // Pour now : appel PlaySE simple via __PlaySE (= pas de pan stereo).
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}

/** Trigger K13 SpriteCB_FaintSlideAnim sur le sprite mon battler.
 *  Wire vers __battleFaintAnim si exposé (= K13 cascade). */
function _triggerFaintSlideAnim(battler: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(getBattlerMonSpriteId(battler));
  if (!sprite) return;
  const fa = (globalThis as { __battleFaintAnim?: { TriggerFaintSlide?: (s: unknown, x: number, y: number) => void } }).__battleFaintAnim;
  // 1:1 décomp (battle_controller_player.c:2421-2423) : sSpeedX=0, sSpeedY=5,
  // callback = SpriteCB_FaintSlideAnim (= le back-sprite GLISSE vers le bas hors-écran).
  fa?.TriggerFaintSlide?.(sprite, 0, 5);
}

/** 1:1 décomp `FreeMonSpriteAfterFaintAnim()` (battle_controller_player.c:1314-1326) :
 *  attend que le sprite mon soit sous l'écran (y + y2 > DISPLAY_HEIGHT) → DestroySprite +
 *  SetHealthboxSpriteInvisible + ExecCompleted. Le tick de la slide vient d'AnimateSprites. */
function _FreeMonSpriteAfterFaintAnim(): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(gActiveBattler);
  const sprite = rt?.gSprites?.get(spriteId);
  if (!sprite || ((sprite.y ?? 0) + (sprite.y2 ?? 0) > 160 /* DISPLAY_HEIGHT */)) {
    // 1:1 DestroySprite : cacher l'OAM AVANT de retirer de la Map (même bug fantôme
    // que le faint adverse, cf. DestroySprite de battle_main section C1) — sinon
    // l'image du back-sprite resterait affichée (slot orphelin, plus aucun sync).
    if (sprite && rt?.gSprites) { rt.DestroySprite(spriteId); rt.gSprites.delete(spriteId); }
    const hb = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteInvisible?: (id: number) => void } }).__battleHealthbox;
    hb?.SetHealthboxSpriteInvisible?.(_gHealthboxSpriteId(gActiveBattler));
    PlayerBufferExecCompleted();
  }
}

/** 1:1 COMPORTEMENTAL : `BtlController_EmitPaletteFade` n'a AUCUN call-site décomp
 *  (code mort) → jamais émis ; complete direct = 1:1. (Corps décomp = fade noir 16
 *  steps — le fade de fin de combat réel passe par la voie L teardown.) */
function PlayerHandlePaletteFade(): void {
  PlayerBufferExecCompleted();
}

/** Décomp = ballThrowCaseId BALL_3_SHAKES_SUCCESS + B_ANIM_BALL_THROW (special
 *  anim) — chantier CAPTURE/anims (dette, émis par les scripts de capture). */
function PlayerHandleSuccessBallThrowAnim(): void {
  PlayerBufferExecCompleted();
}

/** Décomp = ballThrowCaseId bufferA[1] + B_ANIM_BALL_THROW — chantier CAPTURE/anims
 *  (dette, émis par les scripts de capture). */
/** 1:1 decomp `PlayerHandleBallThrowAnim()` (battle_controller_player.c:~1530) :
 *  ballThrowCaseId = bufferA[1] ; gDoingBattleAnim = TRUE ;
 *  InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW) ; attend la fin.
 *  Divergence documentee : le script asm Special_BallThrow est ABSENT du
 *  bytecode extrait -> sequence TS 1:1 Special_BallThrow_TS (battle-anim-throw),
 *  fin observee via gDoingBattleAnim (cleared 1:1 par Capture/Release/Block). */
function PlayerHandleBallThrowAnim(): void {
  const caseId = gBattleBufferA[gActiveBattler]?.[1] ?? 0;
  const bs = (globalThis as Record<string, unknown>).__battleState as { gBattleStruct?: Record<string, unknown> } | undefined;
  if (bs?.gBattleStruct) bs.gBattleStruct.ballThrowCaseId = caseId;
  setGDoingBattleAnim(true);
  // 1:1 InitAndLaunchSpecialAnimation : pose attacker/target puis lance l'anim.
  const ba = (globalThis as Record<string, unknown>).__battleAnim as { SetAnimBattlers?: (a: number, d: number) => void } | undefined;
  ba?.SetAnimBattlers?.(gActiveBattler, gBattlerTarget);
  const bat = (globalThis as Record<string, unknown>).__battleAnimThrow as { Special_BallThrow_TS?: () => void } | undefined;
  bat?.Special_BallThrow_TS?.();
  setBattlerControllerFunc(gActiveBattler, CompleteOnSpecialAnimDone);
}

/** 1:1 decomp `CompleteOnSpecialAnimDone()` (battle_controller_player.c) :
 *  complete quand l'anim speciale est finie (gDoingBattleAnim cleared par la
 *  chaine capture ; specialAnimActive non modelise = gDoingBattleAnim suffit). */
function CompleteOnSpecialAnimDone(): void {
  if (!gDoingBattleAnimState) PlayerBufferExecCompleted();
}

/** 1:1 EXACT : le corps décomp est un busy-loop `while (timer != 0) timer--;`
 *  sans AUCUN effet observable (pas de yield frame) → complete direct = identique. */
function PlayerHandlePause(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleMoveAnimation()`. */
// Machine a etats DoMoveAnimation (1:1 healthBoxesData[b].animationState ;
// module-local par battler). Goal T4 2026-06-10.
const _moveAnimState: number[] = [0, 0, 0, 0];
const _moveAnimMove: number[] = [0, 0, 0, 0];
type _AnimItf = {
  DoMoveAnim?: (move: number) => void;
  tickAnimScript?: () => void;
  isAnimScriptActive?: () => boolean;
};
function _animItf(): _AnimItf {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as _AnimItf) ?? {};
}

/** 1:1 décomp `PlayerHandleMoveAnimation()` (battle_controller_player.c) :
 *  lit le move du buffer, lance la state machine PlayerDoMoveAnimation.
 *  Dettes : IsMoveWithoutAnimation, substitute swap (cases 0/2 partiels),
 *  gAnimMoveTurn/Power/Dmg/Friendship surfaces. */
function PlayerHandleMoveAnimation(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    _moveAnimMove[gActiveBattler] = buf[1] | (buf[2] << 8);
    _moveAnimState[gActiveBattler] = 0;
    gBattlerControllerFuncs[gActiveBattler] = PlayerDoMoveAnimation;
  }
}

/** 1:1 décomp `PlayerDoMoveAnimation()` : case 0 substitute (dette, skip) →
 *  case 1 DoMoveAnim → case 2 tick jusqu'à !gAnimScriptActive → case 3 done. */
function PlayerDoMoveAnimation(): void {
  const itf = _animItf();
  switch (_moveAnimState[gActiveBattler]) {
    case 0:
      // 1:1 : substitute -> InitAndLaunchSpecialAnimation(SUBSTITUTE_TO_MON)
      // (dette substitute) ; sinon passe direct.
      _moveAnimState[gActiveBattler] = 1;
      break;
    case 1:
      if (itf.DoMoveAnim) itf.DoMoveAnim(_moveAnimMove[gActiveBattler]);
      _moveAnimState[gActiveBattler] = 2;
      break;
    case 2:
      itf.tickAnimScript?.();
      if (!itf.isAnimScriptActive?.()) _moveAnimState[gActiveBattler] = 3;
      break;
    case 3:
      _moveAnimState[gActiveBattler] = 0;
      PlayerBufferExecCompleted();
      break;
  }
}

/** 1:1 décomp `PlayerHandlePrintString()` (battle_controller_player.c:2543-2555).
 *  Reset BG0 scroll + BufferStringBattle (= decodeBattleString) +
 *  BattlePutTextOnWindow B_WIN_MSG + install CompleteOnInactiveTextPrinter2 +
 *  BattleTv_SetDataBasedOnString + BattleArena_DeductSkillPoints. */
function PlayerHandlePrintString(): void {
  _setBattleBG0(0, 0);
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  // Voie L : décodeur texte BYTE-LEVEL pur 1:1 (battle-message.ts) →
  // gDisplayedStringBattle (bytes charmap) → BattlePutTextOnWindowBytes (rendu
  // sans round-trip). Fallback sur l'ancien décodeur JS-string si indispo/erreur
  // (charmap pas encore chargée au tout 1er message, ou bug → robustesse).
  let usedByte = false;
  try {
    const bm = (globalThis as { __battleMessage?: {
      BufferStringBattle?: (id: number, md: unknown) => number;
      gDisplayedStringBattle?: Uint8Array;
      getBattleCharmap?: () => Record<string, number> | null;
    } }).__battleMessage;
    const ctrls = (globalThis as { __battleControllers?: {
      BattlePutTextOnWindowBytes?: (b: Uint8Array, w: number) => void;
      getLastPrintStringMsgData?: (b?: number) => unknown;
      snapshotMsgData?: () => unknown;
    } }).__battleControllers;
    if (bm?.BufferStringBattle && bm.gDisplayedStringBattle && bm.getBattleCharmap?.()
        && ctrls?.BattlePutTextOnWindowBytes) {
      const msgData = ctrls.getLastPrintStringMsgData?.(gActiveBattler) ?? ctrls.snapshotMsgData?.() ?? {};
      bm.BufferStringBattle(stringId, msgData);
      ctrls.BattlePutTextOnWindowBytes(bm.gDisplayedStringBattle, B_WIN_MSG);
      usedByte = true;
    }
  } catch (e) {
    console.warn('[L] PlayerHandlePrintString : byte path failed, fallback JS-string :', e);
  }
  if (!usedByte) {
    const decoded = _BufferStringBattle(stringId);
    BattlePutTextOnWindow(decoded, B_WIN_MSG);
  }
  gBattlerControllerFuncs[gActiveBattler] = CompleteOnInactiveTextPrinter2;
  _BattleTv_SetDataBasedOnString(stringId);
  _BattleArena_DeductSkillPoints(gActiveBattler, stringId);
}

/** 1:1 décomp `PlayerHandlePrintSelectionString()` (battle_controller_player.c:2557-2563).
 *  Si battler côté player → PlayerHandlePrintString, sinon ExecCompleted. */
function PlayerHandlePrintSelectionString(): void {
  if (GET_BATTLER_SIDE(gActiveBattler) === 0 /* B_SIDE_PLAYER */) {
    PlayerHandlePrintString();
  } else {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `BufferStringBattle(stringId)` (battle_message.c:1968-2950).
 *  Decode stringId + msgData snapshot → French text. Wired vers
 *  decodeBattleString existant via globalThis lookup pour éviter cycle ESM. */
function _BufferStringBattle(stringId: number): string {
  const api = (globalThis as { __battleStringDecoderApi?: { decodeBattleString?: (id: number, msgData: unknown) => string } }).__battleStringDecoderApi;
  if (!api?.decodeBattleString) {
    console.warn('[L5] BufferStringBattle : decoder API not exposed');
    return `[stringId=${stringId}]`;
  }
  // 1:1 décomp : le BattleMsgData est celui FIGÉ par EmitPrintString (bufferA[4..]),
  // PAS un re-snapshot live. Sinon gBattlerAttacker/Target ont déjà changé quand le
  // handler s'exécute → mauvais nom dans le message ("ARCKO" au lieu de "WAILMER").
  // Fallback snapshot live si aucun EmitPrintString figé (= robustesse).
  const ctrls = (globalThis as { __battleControllers?: { snapshotMsgData?: () => unknown; getLastPrintStringMsgData?: (b?: number) => unknown } }).__battleControllers;
  const msgData = ctrls?.getLastPrintStringMsgData?.(gActiveBattler) ?? ctrls?.snapshotMsgData?.() ?? {};
  return api.decodeBattleString(stringId, msgData);
}

/** 1:1 décomp `CompleteOnInactiveTextPrinter2()` (battle_controller_player.c:1339-1343).
 *  Poll IsTextPrinterActive(B_WIN_MSG) → quand done, ExecCompleted.
 *  Wire vers state global compteur de printer + A_BUTTON skip
 *  (= comportement décomp 1:1). */
function CompleteOnInactiveTextPrinter2(): void {
  if (!_IsTextPrinterActive(B_WIN_MSG)) {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `IsTextPrinterActive(windowId)` (text.c:347 = sTextPrinters[id].active).
 *  Returns true tant que le printer typewriter pour ce window est actif. Le gate de
 *  combat (CompleteOnInactiveTextPrinter2) DOIT suivre le VRAI printer (gba-text-system),
 *  qui gère `\p` (CHAR_PROMPT_SCROLL) = flèche ▼ + attente A/B. Avant, ce gate lisait un
 *  shim setTimeout AVEUGLE (__textPrinterState) qui flippait le flag après ~N frames sans
 *  connaître `\p` ni l'input → le message d'intro « Un X sauvage apparaît! » défilait sans
 *  attendre le joueur (écart 1:1, retour user). */
function _IsTextPrinterActive(windowId: number): boolean {
  // Flag de TEST __battleTextInstant : court-circuit (les harness sync/async ne doivent pas
  // rester bloqués sur l'attente d'input). Identique à l'ancien comportement sous ce flag
  // (le shim retournait aussi false) → zéro régression harness. Inerte sans le flag.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) return false;
  // 1:1 : suit le VRAI printer (gère \p/flèche/A/B).
  const real = (globalThis as { __gbaIsTextPrinterActive?: (w: number) => boolean }).__gbaIsTextPrinterActive;
  if (real) return real(windowId);
  // Fallback : shim __textPrinterState (avant chargement charmap / API indispo au 1er message).
  const m = (globalThis as { __textPrinterState?: Record<number, boolean> }).__textPrinterState;
  return !!(m?.[windowId]);
}

/** 1:1 décomp `BattleTv_SetDataBasedOnString(stringId)` (battle_tv.c).
 *  Dette R3 : recorded battle TV stats (= user "Report jusqu'à fin projet"). */
function _BattleTv_SetDataBasedOnString(_stringId: number): void {
  // No-op : recorded battle/TV stats non porté.
}

/** 1:1 décomp `BattleArena_DeductSkillPoints(battler, stringId)`
 *  (battle_arena.c). Dette R3 : Frontier Arena subsystem. */
function _BattleArena_DeductSkillPoints(_battler: number, _stringId: number): void {
  // No-op : Frontier subsystem non porté.
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

/** 1:1 décomp `PlayerHandleChooseItem()` (battle_controller_player.c:2653-2663).
 *  BeginNormalPaletteFade + install OpenBagAndChooseItem + set
 *  gBattlerInMenuId + copy gBattlePartyCurrentOrder depuis bufferA[1+i]. */
function PlayerHandleChooseItem(): void {
  _BeginNormalPaletteFade(_PALETTES_ALL, 0, 0, 0x10, _RGB_BLACK);
  gBattlerControllerFuncs[gActiveBattler] = _OpenBagAndChooseItem;
  _setBattlerInMenuId(gActiveBattler);

  // 1:1 décomp : copy 3 bytes depuis bufferA[1..3] → gBattlePartyCurrentOrder[0..2].
  for (let i = 0; i < 3; i++) {
    _setBattlePartyCurrentOrder(i, gBattleBufferA[gActiveBattler][1 + i]);
  }
}

/** 1:1 décomp `PlayerHandleChoosePokemon()` (battle_controller_player.c:2665-2688).
 *  Copy gBattlePartyCurrentOrder depuis bufferA[4..] (3 bytes) + branche
 *  Arena → EmitChosenMonReturnValue ; default → BeginNormalPaletteFade +
 *  install OpenPartyMenuToChooseMon + setup gBattleStruct slot fields. */
function PlayerHandleChoosePokemon(): void {
  // 1:1 décomp : copy 3 bytes bufferA[4..6] → gBattlePartyCurrentOrder[0..2].
  for (let i = 0; i < 3; i++) {
    _setBattlePartyCurrentOrder(i, gBattleBufferA[gActiveBattler][4 + i]);
  }

  // 1:1 décomp : BATTLE_TYPE_ARENA branch (= Frontier subsystem, user "Report").
  if ((gBattleTypeFlags & _BATTLE_TYPE_ARENA) && (gBattleBufferA[gActiveBattler][1] & 0xF) !== _PARTY_ACTION_CANT_SWITCH) {
    _BtlController_EmitChosenMonReturnValue(B_COMM_TO_ENGINE, _getPartyIdx(gActiveBattler) + 1, _getBattlePartyCurrentOrderSlice());
    PlayerBufferExecCompleted();
  } else {
    // 1:1 décomp : create dummy task + setup gBattleStruct slots + fade out
    // + install OpenPartyMenuToChooseMon.
    _setBattleControllerData(gActiveBattler, _CreateTask_TaskDummy(0xFF));
    _setTaskData(gActiveBattler, 0, gBattleBufferA[gActiveBattler][1] & 0xF);
    _setBattleStructField('battlerPreventingSwitchout', gBattleBufferA[gActiveBattler][1] >> 4);
    _setBattleStructField('prevSelectedPartySlot', gBattleBufferA[gActiveBattler][2]);
    _setBattleStructField('abilityPreventingSwitchout', gBattleBufferA[gActiveBattler][3]);
    _BeginNormalPaletteFade(_PALETTES_ALL, 0, 0, 0x10, _RGB_BLACK);
    gBattlerControllerFuncs[gActiveBattler] = _OpenPartyMenuToChooseMon;
    _setBattlerInMenuId(gActiveBattler);
  }
}

/** 1:1 décomp `BATTLE_TYPE_ARENA` = 1 << 19. */
const _BATTLE_TYPE_ARENA = 1 << 19;

/** 1:1 décomp `PARTY_ACTION_CANT_SWITCH` (party_menu.h). */
const _PARTY_ACTION_CANT_SWITCH = 5;

/** 1:1 décomp `PALETTES_ALL` = 0xFFFFFFFF (palette.h). */
const _PALETTES_ALL = 0xFFFFFFFF;

/** 1:1 décomp `RGB_BLACK` = 0 (gba/rgb.h). */
const _RGB_BLACK = 0;

/** Wires globalThis lazy lookup. */
function _BeginNormalPaletteFade(_palettes: number, _delay: number, _startY: number, _endY: number, _color: number): void {
  const g = globalThis as { __rt?: { BeginNormalPaletteFade?: (p: number, d: number, sy: number, ey: number, c: number) => void } };
  g.__rt?.BeginNormalPaletteFade?.(_palettes, _delay, _startY, _endY, _color);
}

function _OpenBagAndChooseItem(): void {
  // 1:1 decomp OpenBagAndChooseItem (battle_controller_player.c:2640s) : attend
  // la fin du fade-to-black (PlayerHandleChooseItem), installe
  // CompleteWhenChoseItem, FreeAllWindowBuffers (plateforme : le swap CB2 du
  // bag s'en charge), CB2_BagMenuFromBattle -> chez nous l'UI reelle
  // bag-screen en mode BATTLE avec le reshow decomp en retour (MEME pattern
  // que _OpenPartyMenuToChooseMon, valide switch).
  if (getRuntime()?.gPaletteFade?.active) return;
  gBattlerControllerFuncs[gActiveBattler] = _CompleteWhenChoseItem;
  (globalThis as Record<string, unknown>).__battleBagResultItemId = 0;
  (globalThis as Record<string, unknown>).__battleReshowDone = false;
  void Promise.all([
    import('../engine/bag/bag-screen'),
    import('../engine/battle/reshow-battle-screen'),
  ]).then(([bag, reshow]) => {
    bag.OpenBagScreenForBattle(reshow.CB2_SetUpReshowBattleScreenAfterMenu);
  });
}

/** 1:1 decomp CompleteWhenChoseItem : `callback2 == BattleMainCB2 && !fade ->
 *  EmitOneReturnValue(BUFFER_B, gSpecialVar_ItemId) + completed`. Equivalent L :
 *  reshow termine (__battleReshowDone) + fade fini ; gSpecialVar_ItemId =
 *  bridge __battleBagResultItemId (0 = annule -> la machine C5 re-affiche le
 *  menu, itemValue 0). */
function _CompleteWhenChoseItem(): void {
  const reshowDone = (globalThis as { __battleReshowDone?: boolean }).__battleReshowDone === true;
  if (!reshowDone || getRuntime()?.gPaletteFade?.active) return;
  const itemId = (globalThis as { __battleBagResultItemId?: number }).__battleBagResultItemId ?? 0;
  BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, itemId);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `OpenPartyMenuToChooseMon` → `WaitForMonSelection`
 *  (battle_controller_player.c:1345-1373). Le décomp ouvre le party menu in-battle
 *  (`OpenPartyMenuInBattle`, scene swap UI) puis `WaitForMonSelection` émet
 *  `EmitChosenMonReturnValue(gSelectedMonPartyId)`. L'UI party-menu in-battle est
 *  dette R3 (chantier visuel à venir, jugé A/B sur la ROM). HEADLESS = stand-in
 *  déterministe de la sélection joueur : on choisit le 1er mon éligible (species != 0,
 *  hp > 0, !isEgg, != mon actif K.O.) — exactement ce que le joueur fait au party
 *  screen pour remplacer un mon tombé (PARTY_ACTION_SEND_OUT). Intégration identique
 *  à `OpponentHandleChoosePokemon` (vérifiée) : pose `monToSwitchIntoId[battler]`
 *  directement (notre `Cmd_switchhandleorder` case 0 est un no-op : il lit
 *  monToSwitchIntoId déjà setté) PUIS émet `CHOSENMONRETURNVALUE`. Aucun mon trouvé
 *  → PARTY_SIZE (= branche else de WaitForMonSelection ; ne devrait pas arriver car
 *  `Cmd_openpartyscreen` gate l'ouverture via HasNoMonsToSwitch). */
function _OpenPartyMenuToChooseMon(): void {
  // 1:1 décomp `OpenPartyMenuToChooseMon` (battle_controller_player.c:1345) : attend
  // `!gPaletteFade.active` (fin du fade-to-black de PlayerHandleChoosePokemon), puis
  // installe WaitForMonSelection, FreeAllWindowBuffers, OpenPartyMenuInBattle(caseId).
  // En L : on OUVRE LE VRAI party menu (OpenPartyScreenForBattleSwitch, = l'UI portée
  // 1:1 de party_menu.c) avec, comme exit-callback, le VRAI reshow décomp
  // (CB2_SetUpReshowBattleScreenAfterMenu, reshow_battle_screen.ts) — PAS le reshow-pump
  // ad-hoc non-1:1 de battle-flow (voie V).
  if (getRuntime()?.gPaletteFade?.active) return;
  gBattlerControllerFuncs[gActiveBattler] = _WaitForMonSelection;
  const activeSlot = gBattlerPartyIndexes[gActiveBattler];
  // 1:1 : caseId = action party (bufferA[1]&0xF). PARTY_ACTION_SEND_OUT(=1, remplacement
  // après K.O.) = non-annulable ; switch volontaire = annulable.
  const caseId = gBattleBufferA[gActiveBattler][1] & 0xF;
  const allowCancel = caseId !== 1 /* PARTY_ACTION_SEND_OUT */;
  (globalThis as Record<string, unknown>).__battleSwitchResultSlot = -1;
  (globalThis as Record<string, unknown>).__battleReshowDone = false;
  // Imports dynamiques : évitent le cycle statique controller↔party-screen/reshow
  // (= pattern voie V battle-flow:4655) ; one-shot à l'ouverture (pas per-frame).
  void Promise.all([
    import('../engine/ui/party-screen'),
    import('../engine/battle/reshow-battle-screen'),
  ]).then(([party, reshow]) => {
    party.OpenPartyScreenForBattleSwitch(reshow.CB2_SetUpReshowBattleScreenAfterMenu, {
      activeSlot, allowCancel,
    });
  });
}

/** 1:1 décomp `WaitForMonSelection` (battle_controller_player.c:1357). Attend que le
 *  reshow soit terminé (équivalent L sync de `gMain.callback2 == BattleMainCB2`, via le
 *  flag `__battleReshowDone` posé par le reshow) ET le fade-in fini, puis émet la
 *  sélection : slot choisi, ou PARTY_SIZE si annulé. */
function _WaitForMonSelection(): void {
  const reshowDone = (globalThis as { __battleReshowDone?: boolean }).__battleReshowDone === true;
  if (!reshowDone || getRuntime()?.gPaletteFade?.active) return;
  const slot = (globalThis as { __battleSwitchResultSlot?: number }).__battleSwitchResultSlot ?? -1;
  let chosenMonId: number;
  if (slot >= 0) {
    chosenMonId = slot;
    // L : l'engine (Cmd_switchhandleorder) lit `monToSwitchIntoId` → on le pose depuis
    // la sélection joueur (en plus de l'émission 1:1 ci-dessous).
    _setMonToSwitchIntoId(gActiveBattler, chosenMonId);
  } else {
    chosenMonId = _PARTY_SIZE;   // 1:1 : annulation → PARTY_SIZE (else-branch décomp)
  }
  _BtlController_EmitChosenMonReturnValue(B_COMM_TO_ENGINE, chosenMonId, _getBattlePartyCurrentOrderSlice());
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PARTY_SIZE` (constants/party_menu.h). */
const _PARTY_SIZE = 6;

/** Wire `gBattleStruct.monToSwitchIntoId[battler] = v` (lazy globalThis = éviter
 *  cycle ESM). = même helper que côté opponent (battle-controller-opponent.ts:201). */
function _setMonToSwitchIntoId(battler: number, v: number): void {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.monToSwitchIntoId) m.gBattleStruct.monToSwitchIntoId[battler] = v;
}

function _setBattlerInMenuId(battler: number): void {
  const g = globalThis as { __battleMenu?: { gBattlerInMenuId?: number } };
  if (g.__battleMenu) g.__battleMenu.gBattlerInMenuId = battler;
}

function _setBattlePartyCurrentOrder(idx: number, val: number): void {
  const g = globalThis as { __battleMenu?: { gBattlePartyCurrentOrder?: number[] } };
  if (!g.__battleMenu) g.__battleMenu = {};
  if (!g.__battleMenu.gBattlePartyCurrentOrder) g.__battleMenu.gBattlePartyCurrentOrder = [0, 0, 0];
  g.__battleMenu.gBattlePartyCurrentOrder[idx] = val;
}

function _getBattlePartyCurrentOrderSlice(): number[] {
  const g = globalThis as { __battleMenu?: { gBattlePartyCurrentOrder?: number[] } };
  return g.__battleMenu?.gBattlePartyCurrentOrder ?? [0, 0, 0];
}

function _getPartyIdx(battler: number): number {
  return gBattlerPartyIndexes[battler];
}

function _BtlController_EmitChosenMonReturnValue(bufferId: number, partyId: number, order: number[]): void {
  // 1:1 décomp battle_controllers.c:1381-1390 : setup CONTROLLER_CHOSENMON
  // RETURNVALUE + partyId + order[0..2] → buffer.
  const CONTROLLER_CHOSENMONRETURNVALUE = 0x22;
  const buf = new Uint8Array(8);
  buf[0] = CONTROLLER_CHOSENMONRETURNVALUE;
  buf[1] = partyId;
  for (let i = 0; i < 3; i++) buf[2 + i] = order[i] ?? 0;
  PrepareBufferDataTransfer(bufferId, buf, 5);
}

function _setBattleControllerData(_battler: number, _v: number): void {
  // Dette R3 : gBattleControllerData[battler] = taskId.
  const g = globalThis as { __battleSpritesData?: { gBattleControllerData?: number[] } };
  if (g.__battleSpritesData?.gBattleControllerData) g.__battleSpritesData.gBattleControllerData[_battler] = _v;
}

function _CreateTask_TaskDummy(_priority: number): number {
  // Dette R3 : full Task system port. Pour now : return 0 (= dummy id).
  return 0;
}

function _setTaskData(_taskId: number, _idx: number, _v: number): void {
  // Dette R3 : gTasks[taskId].data[idx] = v.
}

function _setBattleStructField(field: string, v: number): void {
  const g = globalThis as { __battleState?: { gBattleStruct?: Record<string, unknown> } };
  if (g.__battleState?.gBattleStruct) g.__battleState.gBattleStruct[field] = v;
}

/** 1:1 décomp `PlayerHandleCmd23()`. */
function PlayerHandleCmd23(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleHealthBarUpdate()` (battle_controller_player.c:2697-2724).
 *  Read hpVal signed s16 depuis bufferA[2..3] + LoadBattleBarGfx(0) + setup
 *  K10 SetBattleBarStruct depuis party data + install CompleteOnHealthbarDone
 *  qui tick MoveBattleBar jusqu'à -1 return. R2 wire : delegate aussi au
 *  battle-flow scheduleHpBarUpdate pour rendering Phaser réel. */
function PlayerHandleHealthBarUpdate(): void {
  _LoadBattleBarGfx(0);
  // hpVal signed s16 (= delta HP, négatif = damage, positif = heal).
  let hpVal = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  if (hpVal & 0x8000) hpVal -= 0x10000; // sign-extend

  // 1:1 décomp : gPlayerPartyLostHP stat tracking (Battle Dome).
  if (hpVal > 0) _gPlayerPartyLostHP += hpVal;

  const partyIdx = gBattlerPartyIndexes[gActiveBattler];
  const mon = gPlayerParty[partyIdx];

  if (hpVal !== INSTANT_HP_BAR_DROP) {
    const maxHP = GetMonData(mon, MON_DATA_MAX_HP) as number;
    const curHP = GetMonData(mon, MON_DATA_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, curHP, hpVal);
  } else {
    const maxHP = GetMonData(mon, MON_DATA_MAX_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, 0, hpVal);
    _UpdateHpTextInHealthbox(_gHealthboxSpriteId(gActiveBattler), 0, HP_CURRENT_LOCAL);
  }

  // R2 : wire vers battle-flow scheduleHpBarUpdate pour rendering Phaser
  // (= update HP visible + redraw HP bar window). Convertit delta hpVal en
  // delta direct (= damage négatif = HP loss).

  gBattlerControllerFuncs[gActiveBattler] = CompleteOnHealthbarDone;
}

/** 1:1 décomp `INSTANT_HP_BAR_DROP` = 0x7FFF (battle_controllers.h:149). */
const INSTANT_HP_BAR_DROP = 0x7FFF;

/** 1:1 décomp `HP_CURRENT` (battle_interface.h). */
const HP_CURRENT_LOCAL = 0;

/** 1:1 décomp `gPlayerPartyLostHP` (battle_main.c). Stat HP perdue cumulative
 *  Battle Dome (= jamais read en jeu normal). */
let _gPlayerPartyLostHP = 0;
void _gPlayerPartyLostHP; // suppress lint unused

/** 1:1 décomp `gHealthboxSpriteIds[battler]` (battle_main.c). Dette R3 :
 *  full healthbox sprite système (= K10 wire). Pour now retourne 0
 *  (= stub R3 sprite id, K10 SetBattleBarStruct l'utilise mais
 *  MoveBattleBarGraphically est hook no-op tant que healthbox UI pas wirée). */
function _gHealthboxSpriteId(_battler: number): number {
  const m = (globalThis as { __battleHealthbox?: { gHealthboxSpriteIds?: number[] } }).__battleHealthbox;
  return m?.gHealthboxSpriteIds?.[_battler] ?? 0;
}

/** 1:1 décomp `LoadBattleBarGfx(barId)` (battle_interface.c). Dette R3 :
 *  load HP/EXP bar palette/tiles VRAM. */
function _LoadBattleBarGfx(_barId: number): void {
  // Dette R3 : palette/tiles VRAM load.
}

/** 1:1 décomp `UpdateHpTextInHealthbox(spriteId, value, hpId)`
 *  (battle_interface.c). Dette R3 : redraw HP text in healthbox window. */
function _UpdateHpTextInHealthbox(spriteId: number, value: number, hpId: number): void {
  const m = (globalThis as { __battleHealthbox?: { UpdateHpTextInHealthbox?: (s: number, v: number, h: number) => void } }).__battleHealthbox;
  m?.UpdateHpTextInHealthbox?.(spriteId, value, hpId);
}

/** 1:1 décomp `SetHealthboxSpriteVisible(spriteId)` via __battleHealthbox. */
function _SetHealthboxSpriteVisible(spriteId: number): void {
  const m = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteVisible?: (s: number) => void } }).__battleHealthbox;
  m?.SetHealthboxSpriteVisible?.(spriteId);
}

/** 1:1 décomp : montre + glisse le healthbox au send-out (Intro_TryShinyAnimShowHealthbox)
 *  via la couche voie-L __battleHealthbox. */
function _ShowHealthboxOnSendOut(battler: number): void {
  const m = (globalThis as { __battleHealthbox?: { ShowHealthboxOnSendOut?: (b: number) => void } }).__battleHealthbox;
  m?.ShowHealthboxOnSendOut?.(battler);
}

/** 1:1 décomp `CompleteOnHealthbarDone()` (battle_controller_player.c).
 *  Tick MoveBattleBar chaque frame jusqu'à return -1 (= anim complete),
 *  puis exec complete. */
function CompleteOnHealthbarDone(): void {
  const ret = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), HEALTH_BAR, 0);
  // 1:1 décomp `CompleteOnHealthbarDone` (battle_controller_player.c) : SetHealthboxSprite
  // Visible + (si ret != -1) UpdateHpTextInHealthbox(ret, HP_CURRENT) → les digits PV
  // s'animent AVEC la barre pendant le drain ; sinon ExecCompleted (anim finie).
  _SetHealthboxSpriteVisible(_gHealthboxSpriteId(gActiveBattler));
  if (ret !== -1) {
    _UpdateHpTextInHealthbox(_gHealthboxSpriteId(gActiveBattler), ret, HP_CURRENT_LOCAL);
  } else {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleExpUpdate()` (battle_controller_player.c:2726-2748).
 *  Read monId depuis bufferA[1] + check MAX_LEVEL skip + expPoints depuis
 *  bufferA[2..3] s16 + LoadBattleBarGfx(1) + CreateTask Task_GiveExpToMon
 *  + install BattleControllerDummy. */
function PlayerHandleExpUpdate(): void {
  const monId = gBattleBufferA[gActiveBattler][1];
  const mon = gPlayerParty[monId];
  const level = GetMonData(mon, MON_DATA_LEVEL) as number;

  if (level >= MAX_LEVEL_LOCAL) {
    PlayerBufferExecCompleted();
  } else {
    _LoadBattleBarGfx(1);
    // expPoints signed s16
    let expPoints = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
    if (expPoints & 0x8000) expPoints -= 0x10000;
    // 1:1 décomp : CreateTask Task_GiveExpToMon avec data params.
    // Dette R3 : full Task system (= scheduler tasks à porter L7+).
    // Pour now, setup EXP via SetBattleBarStruct EXP_BAR + install
    // CompleteOnExpBarDone (1:1 strict comportement équivalent).
    // 1:1 décomp : la barre EXP s'anime de currExpBarValue à currExpBarValue+expGained
    // (cf. UpdateHealthboxAttribute EXP_BAR, battle_interface.c:2197-2204 :
    //   currExpBarValue = exp - currLevelExp ; maxExpBarValue = nextLevelExp - currLevelExp).
    // Cmd_getexp a déjà appliqué le SEGMENT d'exp AVANT EmitExpUpdate → on lit l'exp COURANTE
    // (post-segment) et on recule de expPoints pour la valeur de DÉPART de l'anim. À l'instant
    // de l'EmitExpUpdate (case 3), le niveau est encore celui du segment (level-up = case 4, après).
    const species = GetMonData(mon, MON_DATA_SPECIES) as number;
    const newExp = GetMonData(mon, MON_DATA_EXP) as number;
    const gr = getSpeciesGrowthRate(species);
    const currLevelExp = getExpForLevel(gr, level);
    const maxExpBarValue = getExpForLevel(gr, level + 1) - currLevelExp;
    const newExpInLevel = newExp - currLevelExp;
    const oldExpInLevel = newExpInLevel - expPoints;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxExpBarValue, oldExpInLevel, expPoints);
    gBattlerControllerFuncs[gActiveBattler] = _CompleteOnExpBarDone;
  }
}

/** 1:1 décomp `MAX_LEVEL` = 100. */
const MAX_LEVEL_LOCAL = 100;

/** Helper : poll EXP bar anim done (= MoveBattleBar EXP_BAR === -1). */
function _CompleteOnExpBarDone(): void {
  const ret = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), EXP_BAR, 0);
  if (ret === -1) {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleStatusIconUpdate()` (battle_controller_player.c:2755-2766).
 *  Wait IsBattleSEPlaying done + UpdateHealthboxAttribute(STATUS_ICON) +
 *  clear statusAnimActive + install CompleteOnFinishedStatusAnimation. */
function PlayerHandleStatusIconUpdate(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const partyIdx = gBattlerPartyIndexes[gActiveBattler];
    const mon = gPlayerParty[partyIdx];
    _UpdateHealthboxAttribute(_gHealthboxSpriteId(gActiveBattler), mon, _HEALTHBOX_STATUS_ICON);
    // 1:1 décomp : clear gBattleSpritesDataPtr.healthBoxesData[battler].statusAnimActive.
    _clearHealthboxStatusAnimActive(gActiveBattler);
    gBattlerControllerFuncs[gActiveBattler] = _CompleteOnFinishedStatusAnimation;
  }
}

/** 1:1 décomp `HEALTHBOX_STATUS_ICON` (battle_interface.h). */
const _HEALTHBOX_STATUS_ICON = 9;

/** 1:1 décomp `UpdateHealthboxAttribute(spriteId, mon, elementId)`. */
function _UpdateHealthboxAttribute(_spriteId: number, _mon: unknown, _elementId: number): void {
  const m = (globalThis as { __battleHealthbox?: { updateHealthboxAttribute?: (s: number, m: unknown, e: number) => void } }).__battleHealthbox;
  if (m?.updateHealthboxAttribute) m.updateHealthboxAttribute(_spriteId, _mon, _elementId);
}

/** Stub clear statusAnimActive (= gBattleSpritesDataPtr structure). */
function _clearHealthboxStatusAnimActive(_battler: number): void {
  // Dette R3 : gBattleSpritesDataPtr healthBoxesData[battler].statusAnimActive = 0.
}

/** 1:1 décomp `IsBattleSEPlaying(battler)` (battle_main.c). Dette R3 :
 *  check SE channel active per battler. Pour now return false (= done). */
function _IsBattleSEPlaying(_battler: number): boolean {
  return false;
}

/** 1:1 décomp `CompleteOnFinishedStatusAnimation()`. */
function _CompleteOnFinishedStatusAnimation(): void {
  // Dette R3 : poll statusAnimActive flag. Pour now : immediate complete.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleStatusAnimation()` (battle_controller_player.c) :
 *  InitAndLaunchChosenStatusAnimation(bufferA[1], bufferA[2..5] u32) puis
 *  attendre la fin (CompleteOnFinishedStatusAnimation). Goal T3 2026-06-10. */
function PlayerHandleStatusAnimation(): void {
  // 1:1 (T3) — re-active : la « regression » etait les bytecodes scripts_1/2
  // re-casses par les recompiles T4, PAS ce handler.
  _PlayerHandleStatusAnimation_REAL();
}
function _PlayerHandleStatusAnimation_REAL(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    const status = (buf[2] | (buf[3] << 8) | (buf[4] << 16) | (buf[5] << 24)) >>> 0;
    _InitAndLaunchChosenStatusAnimation(buf[1] !== 0, status);
    gBattlerControllerFuncs[gActiveBattler] = CompleteOnFinishedStatusAnimation;
  }
}
void _PlayerHandleStatusAnimation_REAL;

/** 1:1 décomp `CompleteOnFinishedStatusAnimation()`. */
function CompleteOnFinishedStatusAnimation(): void {
  if (!_isStatusAnimActiveBC(gActiveBattler) && !_IsBattleSEPlaying(gActiveBattler)) {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleStatusXor()`. */
function PlayerHandleStatusXor(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleDataTransfer()`. */
function PlayerHandleDataTransfer(): void {
  PlayerBufferExecCompleted();
}

/** 1:1 COMPORTEMENTAL : `BtlController_EmitDMA3Transfer` n'a AUCUN call-site
 *  décomp (code mort) → jamais émis ; complete direct = 1:1. */
function PlayerHandleDMA3Transfer(): void {
  PlayerBufferExecCompleted();
}

/** Décomp = PlayBGM(bufferA[1|2]) — infra BGM = NE PAS TOUCHER (règle), et
 *  `BtlController_EmitPlayBGM` n'a aucun call-site décomp (code mort) → 1:1. */
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
// 1:1 décomp : les 4 handlers UnkVar/UnkFlag écrivent gUnusedControllerStruct
// (struct EWRAM partagée, battle_controllers.c — importée de battle-controllers-ipc).
function PlayerHandleClearUnkVar(): void {
  gUnusedControllerStruct.unk = 0;             // 1:1
  PlayerBufferExecCompleted();
}
function PlayerHandleSetUnkVar(): void {
  gUnusedControllerStruct.unk = gBattleBufferA[gActiveBattler][1];  // 1:1
  PlayerBufferExecCompleted();
}
function PlayerHandleClearUnkFlag(): void {
  gUnusedControllerStruct.flag = 0;            // 1:1
  PlayerBufferExecCompleted();
}
function PlayerHandleToggleUnkFlag(): void {
  gUnusedControllerStruct.flag ^= 1;           // 1:1
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleHitAnimation()` (battle_controller_player.c:2877-2890) : si le sprite
 *  mon est visible → data[1]=0 + installe DoHitAnimBlinkSpriteEffect (= clignote). Sinon ExecComplete. */
function PlayerHandleHitAnimation(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(getBattlerMonSpriteId(gActiveBattler));
  if (!sprite || sprite.invisible === true) { PlayerBufferExecCompleted(); return; }
  _gDoingBattleAnim = true;
  sprite.data[1] = 0;
  // DoHitAnimHealthboxEffect (healthbox bob, pokeball.c:1284) = Dette R3 (effet secondaire, déféré).
  gBattlerControllerFuncs[gActiveBattler] = _DoHitAnimBlinkSpriteEffect;
}

/** 1:1 décomp `DoHitAnimBlinkSpriteEffect()` : toggle sprite.invisible tous les 4 frames sur 32
 *  frames (= 4 clignotements) puis restore visible + ExecCompleted. Tické par le controller tick. */
function _DoHitAnimBlinkSpriteEffect(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(getBattlerMonSpriteId(gActiveBattler));
  if (!sprite) { _gDoingBattleAnim = false; PlayerBufferExecCompleted(); return; }
  if (sprite.data[1] === 32) {
    sprite.data[1] = 0;
    sprite.invisible = false;
    _gDoingBattleAnim = false;
    PlayerBufferExecCompleted();
  } else {
    if ((sprite.data[1] % 4) === 0) sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
  }
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

/** 1:1 décomp `PlayerHandleFaintingCry()` : PlayCry_ByMode(species, -25, CRY_MODE_FAINT).
 *  Cri via le mécanisme prouvé `playCry` (= pokeball.ts:551) ; pan -25 (côté joueur)
 *  et le pitch-down FAINT = dette du mécanisme cri (même dette que le send-out). */
function PlayerHandleFaintingCry(): void {
  const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler] ?? 0];
  const species = mon ? (GetMonData(mon as never, MON_DATA_SPECIES) as number) : 0;
  const nm = species ? reverseDecompConstant(species, 'SPECIES_') : null;
  if (nm) void import('../engine/system/music').then(({ playCry }) => playCry(nm)).catch(() => {});
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleIntroSlide()` (battle_controller_player.c) :
 *  ```c
 *  HandleIntroSlide(gBattleBufferA[gActiveBattler][1]);  // arg = terrainId (env)
 *  gIntroSlideFlags |= 1;
 *  PlayerBufferExecCompleted();
 *  ```
 *  Voie L : `startBattleIntroSlideL` = `HandleIntroSlide` (= CreateTask
 *  BattleIntroSlide1) → charge le fond d'entrée strié + ouvre les bandes WIN0V +
 *  scroll terrain. Tickée par BattleMainCB2. (gIntroSlideFlags = raffinement A/B.) */
function PlayerHandleIntroSlide(): void {
  HandleIntroSlide(gBattleBufferA[gActiveBattler][1]);  // 1:1 → CreateTask(BattleIntroSlideN), tickée par RunTasks
  // 1:1 décomp battle_controller_player.c:2936 `gIntroSlideFlags |= 1;` : gèle les SpriteCB de
  // slide (mon sauvage = SpriteCB_MoveWildMonToRight) pendant l'ouverture des bandes ; remis à 0
  // par tickBattleIntroSlideL case 2 → le mon ne glisse qu'APRÈS l'ouverture (timing 1:1).
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getIntroSlideFlags?: () => number; setIntroSlideFlags?: (v: number) => void;
  } | undefined;
  if (bmf?.getIntroSlideFlags && bmf.setIntroSlideFlags) bmf.setIntroSlideFlags(bmf.getIntroSlideFlags() | 1);
  PlayerBufferExecCompleted();
}

// ─── Send-out joueur 1:1 : lancer pokéball + émergence + chaîne de WAITS (= le timing) ────
// Le timing de l'intro vient de ces waits : tant qu'une Intro_* func est installée dans
// gBattlerControllerFuncs[], le bit exec du battler reste SET → gBattleMainFunc gèle sur l'état
// send-out (1:1 : c'EST le timer de l'intro). Avant, PlayerHandleIntroTrainerBallThrow faisait
// ExecCompleted IMMÉDIAT → 0 frame → « timing trop rapide, il manque des anims » (retour user).
// On porte : throw dresseur + ball (31f, startTrainerThrow lance la ball à la frame 31) →
// émergence du mon (getSendOutStatus done) → healthbox slide-in (Intro_TryShinyAnimShowHealthbox)
// → fin du slide (Intro_WaitForShinyAnimAndHealthbox) → délai 3f (Intro_DelayAndEnd) → ExecCompleted.
let _sendOutPhase = -1;
let _sendOutHbFrames = 0;
let _introEndDelay = 0;

/** 1:1 décomp `PlayerHandleIntroTrainerBallThrow()` (battle_controller_player.c:2946-2974).
 *  Anime le back-sprite dresseur (lancer = slide-off gauche destX=-40 sur 50f via
 *  StartAnimLinearTranslation), stocke SpriteCB_FreePlayerSpriteLoadMonSprite (= free dresseur en
 *  fin de slide), crée Task_StartSendOutAnim (= lance la ball à la frame 31), install
 *  BattleControllerDummy. Pilotage 100% SpriteCB + Task (AnimateSprites/RunTasks) → PLUS d'ad-hoc
 *  startTrainerThrow/tickTrainerThrow (qui ne tournait que sous BattleMainCB2 = cause du freeze voie V). */
function PlayerHandleIntroTrainerBallThrow(): void {
  const battler = gActiveBattler;
  // 1:1 décomp PlayerHandleIntroTrainerBallThrow (battle_controller_player.c:2974-2975) :
  // si le party-summary est affiché → lance son retrait (fade+slide via la task Hide).
  if (_isPartyStatusSummaryShown(battler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[battler]);
  }
  // Harness (__battleTextInstant) : court-circuit (callback1/2 tickés SANS runOneFrame → les
  // SpriteCB/Task ne tourneraient pas = freeze harness). Mon créé + healthbox + ExecCompleted.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    void _loadAndCreateBattlerMonSprite(battler, false);
    _ShowHealthboxOnSendOut(battler);
    PlayerBufferExecCompleted();
    return;
  }
  // Le mon sort d'une POKÉBALL → reste INVISIBLE jusqu'à l'émergence (deferReveal).
  setBattlerDeferReveal(battler, true);
  void _loadAndCreateBattlerMonSprite(battler, false);

  const rt = getRuntime();
  // 1:1 ll. 2951-2960 : le back-sprite dresseur slide-off gauche (destX=-40, 50f) ; à la fin de la
  // translation, SpriteCB_FreePlayerSpriteLoadMonSprite (stocké en data6) le libère.
  const trainerId = getTrainerSpriteId();
  const tr = rt && trainerId >= 0 ? rt.gSprites.get(trainerId) : null;
  if (tr) {
    SetSpritePrimaryCoordsFromSecondaryCoords(tr);   // fold x2/y2 → x/y (fige la pose slid-in)
    tr.data[0] = 50;        // nbFrames
    tr.data[2] = -40;       // destX
    tr.data[4] = tr.y;      // destY (= pas de mouvement vertical)
    tr.data[5] = battler;   // sBattlerId (lu par SpriteCB_FreePlayerSpriteLoadMonSprite)
    tr.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(tr, SpriteCB_FreePlayerSpriteLoadMonSprite);
    // 1:1 décomp l.2960 `StartSpriteAnim(&gSprites[...], 1)` : joue l'anim de LANCER du back-pic
    // (sAnimCmd_Brendan_1/May : frame 0→1→2→0→3) pendant que le sprite glisse-off (callback) +
    // que la ball part. Les frames sont câblées sur le back-pic dans showTrainerBackSprite
    // (anims + usingSheet + sheetTileStart) ; AnimateSprite avance la séquence chaque frame.
    StartSpriteAnim(tr as never, 1);
  }
  // 1:1 ll. 2966-2967 : CreateTask(Task_StartSendOutAnim, 5) ; tBattlerId = gActiveBattler.
  if (rt) {
    const taskId = rt.CreateTask((t) => Task_StartSendOutAnim(t, rt), 5);
    const task = rt.gTasks.get(taskId);
    if (task) task.data[0] = battler;   // tBattlerId
  }
  _sendOutPhase = -1;
  // 1:1 l. 2973 : gBattlerControllerFuncs = BattleControllerDummy (le Task + les SpriteCB cadencent ;
  // le flag exec reste SET jusqu'à ExecCompleted dans _PlayerIntroSendOutWait).
  gBattlerControllerFuncs[battler] = _BattleControllerDummy;
}

/** 1:1 décomp `BattleControllerDummy()` (battle_controllers.c) — no-op (le Task drive le send-out). */
function _BattleControllerDummy(): void { /* no-op */ }

/** 1:1 décomp `Task_StartSendOutAnim(u8 taskId)` (battle_controller_player.c:2993-3023).
 *  Attend 31 frames (tStartTimer) puis lance la ball (1:1 StartSendOutAnim →
 *  DoPokeballSendOutAnimation, pokeball.ts) et passe le controller à la chaîne de waits healthbox. */
function Task_StartSendOutAnim(task: DecompTask, rt: DecompRuntime): void {
  if (task.data[1] < 31) { task.data[1]++; return; }   // tStartTimer < 31
  const battler = task.data[0];                          // tBattlerId
  const saved = gActiveBattler;
  setActiveBattler(battler);
  // 1:1 l. 3007 StartSendOutAnim(battler, FALSE) : la ball part + déclenche l'émergence du mon.
  DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT);
  // 1:1 l. 3019 gBattlerControllerFuncs = Intro_TryShinyAnimShowHealthbox (= notre chaîne phases 1-3).
  _sendOutPhase = 1;
  gBattlerControllerFuncs[battler] = _PlayerIntroSendOutWait;
  setActiveBattler(saved);
  rt.DestroyTask(task.taskId);
}

/** 1:1 décomp `SpriteCB_FreePlayerSpriteLoadMonSprite(struct Sprite *sprite)`
 *  (battle_controller_player.c:2976-2988). Fin du slide-off du back-sprite dresseur : le libère
 *  (FreeSpriteOamMatrix + FreeSpritePaletteByTag + DestroySprite). Le mon (créé deferReveal) est
 *  révélé par la chaîne ball (phase 1, ballAnimActive==FALSE) → pas de double-reveal ici. */
function SpriteCB_FreePlayerSpriteLoadMonSprite(_sprite: DecompSprite, _rt: DecompRuntime): void {
  destroyTrainerBackSprite();
}

/** Chaîne de waits healthbox du send-out joueur (post-ball), 1:1
 *  Intro_TryShinyAnimShowHealthbox → Intro_WaitForShinyAnimAndHealthbox → Intro_DelayAndEnd.
 *  Démarrée par Task_StartSendOutAnim (phase 1). */
function _PlayerIntroSendOutWait(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  switch (_sendOutPhase) {
    case 1: {  // 1:1 Intro_TryShinyAnimShowHealthbox : attend la fin de l'anim ball (ballAnimActive==FALSE)
      if (isBallAnimActive(battler) === false) {
        setBattlerDeferReveal(battler, false);    // révèle le mon (émergé de la ball)
        // 1:1 Intro_TryShinyAnimShowHealthbox : healthbox slide-in QUAND la ball est finie.
        _ShowHealthboxOnSendOut(battler);
        _sendOutHbFrames = 0;
        _sendOutPhase = 2;
      }
      break;
    }
    case 2: {  // 1:1 Intro_WaitForShinyAnimAndHealthbox : attend la fin du slide healthbox
      _sendOutHbFrames++;
      const hb = (globalThis as Record<string, unknown>).__battleHealthbox as { gHealthboxSpriteIds?: number[] } | undefined;
      const hbId = hb?.gHealthboxSpriteIds?.[battler] ?? -1;
      const hbSpr = hbId >= 0 ? rt?.gSprites?.get(hbId) : null;
      const cbName = (hbSpr?.callback as { name?: string } | null | undefined)?.name;
      const slideDone = !hbSpr || cbName !== 'SpriteCB_HealthboxSlideIn';
      if (slideDone || _sendOutHbFrames > 40) {
        _introEndDelay = 4;   // 1:1 introEndDelay=3 (+1 pour le pré-décrément du décomp)
        _sendOutPhase = 3;
      }
      break;
    }
    case 3: {  // 1:1 Intro_DelayAndEnd : décompte puis ExecCompleted (clear le flag → menu)
      if (--_introEndDelay < 0) {
        _sendOutPhase = -1;
        PlayerBufferExecCompleted();
      }
      break;
    }
    default:
      PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleDrawPartyStatusSummary()` (battle_controller_player.c:3028).
 *  Crée la barre + 6 balls d'état d'équipe (intro dresseur / switch-out). partyInfo
 *  = bufferA[4..] (6 × struct HpAndStatus {u16 hp; u32 status} = 8B chacun, 1:1
 *  l'emit). Divergence plateforme : gfx préchargés async PUIS création. */
function PlayerHandleDrawPartyStatusSummary(): void {
  if (gBattleBufferA[gActiveBattler][1] !== 0 && _PS_SIDE(gActiveBattler) === _PS_B_SIDE_PLAYER) {
    PlayerBufferExecCompleted();
  } else {
    _setPartyStatusSummaryShown(gActiveBattler, true);
    const ba = gBattleBufferA[gActiveBattler];
    const partyInfo: _PSHpAndStatus[] = [];
    for (let i = 0; i < 6; i++) {
      const o = 4 + i * 8;
      partyInfo.push({
        hp: (ba[o] | (ba[o + 1] << 8)) & 0xFFFF,
        status: ((ba[o + 4] | (ba[o + 5] << 8) | (ba[o + 6] << 16) | (ba[o + 7] << 24)) >>> 0),
      });
    }
    const skipPlayer = ba[1] !== 0;
    const isBattleStart = ba[2] !== 0;
    const b = gActiveBattler;
    void ensurePartySummaryAssets().then(() => {
      gBattlerStatusSummaryTaskId[b] = CreatePartyStatusSummarySprites(b, partyInfo, skipPlayer, isBattleStart);
    });
    _setPartyStatusDelayTimer(gActiveBattler, 0);
    // 1:1 :3041 « If intro, skip the delay after drawing ».
    if (isBattleStart) _setPartyStatusDelayTimer(gActiveBattler, 93);
    gBattlerControllerFuncs[gActiveBattler] = EndDrawPartyStatusSummary;
  }
}

/** 1:1 décomp `EndDrawPartyStatusSummary()` (battle_controller_player.c:3048) :
 *  `if (partyStatusDelayTimer++ > 92) { timer = 0; complete }`. */
function EndDrawPartyStatusSummary(): void {
  const t = _getPartyStatusDelayTimer(gActiveBattler);
  _setPartyStatusDelayTimer(gActiveBattler, t + 1);
  if (t > 92) {
    _setPartyStatusDelayTimer(gActiveBattler, 0);
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleHidePartyStatusSummary()` (battle_controller_player.c:3057). */
function PlayerHandleHidePartyStatusSummary(): void {
  if (_isPartyStatusSummaryShown(gActiveBattler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[gActiveBattler]);
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleEndBounceEffect()` (battle_controller_player.c:3064-3068) :
 *  arrete le bob healthbox + mon (= quand l'action est choisie, l'engine emet ENDBOUNCE). */
function PlayerHandleEndBounceEffect(): void {
  EndBounceEffect(gActiveBattler, BOUNCE_HEALTHBOX);
  EndBounceEffect(gActiveBattler, BOUNCE_MON);
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleSpriteInvisibility()`. */
function PlayerHandleSpriteInvisibility(): void {
  // 1:1 décomp (battle_controller_player.c:3071-3079) : si le sprite du battler est
  // présent → sprite.invisible = bufferA[1] + CopyBattleSpriteInvisibility (mémorise
  // dans battlerData.invisible, restauré par le reshow — mon en Vol/Tunnel).
  const g = globalThis as {
    __battleControllerPlayer?: { getBattlerMonSpriteId?: (b: number) => number };
    __battleGfxSfxUtil?: { CopyBattleSpriteInvisibility?: (b: number) => void };
  };
  const monId = g.__battleControllerPlayer?.getBattlerMonSpriteId?.(gActiveBattler) ?? -1;
  const spr = monId >= 0 ? getRuntime()?.gSprites.get(monId) : undefined;
  if (spr && (spr as { inUse?: boolean }).inUse) {   // ≈ IsBattlerSpritePresent (single)
    (spr as { invisible: boolean }).invisible = gBattleBufferA[gActiveBattler][1] !== 0;
    g.__battleGfxSfxUtil?.CopyBattleSpriteInvisibility?.(gActiveBattler);
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleBattleAnimation()`. */
function PlayerHandleBattleAnimation(): void {
  // Wire vers K1 battle-anim-interpreter LaunchBattleAnimation.
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleLinkStandbyMsg()`. */
/** 1:1 décomp `PlayerHandleLinkStandbyMsg()` (battle_controller_player.c:3097-3115) :
 *  ÉMIS EN SINGLE AUSSI (STATE_WAIT_ACTION_CONFIRMED_STANDBY, battle_main.c:4470) —
 *  c'est LUI qui ARRÊTE le bounce (healthbox + mon) à la confirmation de l'action.
 *  Sans ça, le bouncer-sprite écrase y2 du mon chaque frame → le faint slide du mon
 *  joueur ne descend jamais → _FreeMonSpriteAfterFaintAnim soft-lock (chemin défaite).
 *  Le bob reprend au prochain menu (DoBounceEffect re-appelé par HandleInputChooseAction).
 *  RecordedBattle_RecordAllBattlerData = recorded non modélisé (no-op). */
function PlayerHandleLinkStandbyMsg(): void {
  // 1:1 switch décomp (fallthrough MSG_STOP_BOUNCE→STOP_BOUNCE_ONLY déplié, tsc strict) :
  const mode = gBattleBufferA[gActiveBattler][1];
  if (mode === 0 || mode === 2)   // LINK_STANDBY_MSG_STOP_BOUNCE | LINK_STANDBY_MSG_ONLY
    _PrintLinkStandbyMsg();       // gaté BATTLE_TYPE_LINK (décomp :3186) → no-op en single
  if (mode === 0 || mode === 1) { // LINK_STANDBY_MSG_STOP_BOUNCE | LINK_STANDBY_STOP_BOUNCE_ONLY
    EndBounceEffect(gActiveBattler, BOUNCE_HEALTHBOX);
    EndBounceEffect(gActiveBattler, BOUNCE_MON);
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PrintLinkStandbyMsg()` (battle_controller_player.c:3184-3191) :
 *  gaté `gBattleTypeFlags & BATTLE_TYPE_LINK` → no-op total en local single
 *  (le texte « Attente du lien » = link-only, dette si le link arrive un jour). */
function _PrintLinkStandbyMsg(): void {
  // no-op 1:1 hors link (gate décomp).
}

/** 1:1 décomp `PlayerHandleResetActionMoveSelection()`. */
/** 1:1 décomp `PlayerHandleResetActionMoveSelection()` (battle_controller_player.c:3119) :
 *  remet les curseurs action/move à 0 (émis par Transform/Mimic — RESET_MOVE_SELECTION,
 *  battle_script_commands.c:7805 ; notre émission : battle-script-commands.ts:6616). */
function PlayerHandleResetActionMoveSelection(): void {
  const mode = gBattleBufferA[gActiveBattler][1];
  switch (mode) {
    case 0:   // RESET_ACTION_MOVE_SELECTION
      gActionSelectionCursor[gActiveBattler] = 0;
      gMoveSelectionCursor[gActiveBattler] = 0;
      break;
    case 1:   // RESET_ACTION_SELECTION
      gActionSelectionCursor[gActiveBattler] = 0;
      break;
    case 2:   // RESET_MOVE_SELECTION
      gMoveSelectionCursor[gActiveBattler] = 0;
      break;
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleEndLinkBattle()`. */
/** Décomp (:3138) : gBattleOutcome=bufferA[1] (déjà posé par le moteur chez nous) +
 *  frontier.disableRecordBattle (frontier) + FadeOutMapMusic (règle BGM) +
 *  BeginFastPaletteFade (dette fade fin) + SetBattleEndCallbacks. Plateforme : la
 *  SORTIE (teardown + retour OW) est pilotée par la voie L (battle-decomp-loop,
 *  A/B : victoire ET défaite → MainCB2_Overworld2) → complete direct ici. */
function PlayerHandleEndLinkBattle(): void {
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
  getBattlerControllerFunc, setBattlerControllerFunc,
  // L1 wires exposés pour tests déterministes A_BUTTON cursor input loop.
  HandleInputChooseAction, HandleChooseActionAfterDma3,
  ActionSelectionCreateCursorAt, ActionSelectionDestroyCursorAt,
  PlayerHandleChooseAction, PlayerBufferExecCompleted,
  // L2 wires exposés pour tests déterministes Move selection input loop.
  HandleInputChooseMove, HandleChooseMoveAfterDma3,
  MoveSelectionCreateCursorAt, MoveSelectionDestroyCursorAt,
  InitMoveSelectionsVarsAndStrings, PlayerHandleChooseMove,
  // L5 wires exposés pour tests déterministes PrintString decoder + window.
  PlayerHandlePrintString, PlayerHandlePrintSelectionString,
  CompleteOnInactiveTextPrinter2,
  // L6/L7/L8 wires exposés pour tests déterministes HealthBar/Exp/Status.
  PlayerHandleHealthBarUpdate, CompleteOnHealthbarDone,
  PlayerHandleExpUpdate,
  PlayerHandleStatusIconUpdate,
  // L9/L10 wires exposés pour tests déterministes SwitchIn/Faint anims.
  PlayerHandleSwitchInAnim, PlayerHandleFaintAnimation,
  // L3/L4 wires exposés pour tests déterministes party/bag in-battle.
  PlayerHandleChoosePokemon, PlayerHandleChooseItem,
};

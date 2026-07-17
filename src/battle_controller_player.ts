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
import './battle_message';
// Couche healthbox VOIE L (modèle décomp : gHealthboxSpriteIds + UpdateHealthboxAttribute
// + MoveBattleBarGraphically). Side-effect import : s'enregistre sur globalThis.__battleHealthbox
// (que _gHealthboxSpriteId / _UpdateHealthboxAttribute lisent) + branche le hook MoveBattleBarGraphically.
import './battle_interface'; // side-effect miroir (ex-shim battle-healthbox-l)
import { DestroySprite } from './sprite';
import { PlayCry_ByMode } from './sound';
import { CRY_MODE_FAINT } from '../include/constants/sound';
import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gActionSelectionCursor, gMoveSelectionCursor, gAbsentBattlerFlags,
  gPlayerDpadHoldFrames, setPlayerDpadHoldFrames, incPlayerDpadHoldFrames,
  gNumberOfMovesToChoose, setNumberOfMovesToChoose,
  gMultiUsePlayerCursor, setMultiUsePlayerCursor,
  gBattlerControllerFuncs, setBattlerControllerFunc,
  gDoingBattleAnim as gDoingBattleAnimState, setGDoingBattleAnim, gBattlerTarget,
} from './engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI, BATTLE_TYPE_PALACE,
  BATTLE_TYPE_SAFARI,
  B_ACTION_USE_MOVE, B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  B_ACTION_CANCEL_PARTNER, B_ACTION_EXEC_SCRIPT,
} from './engine/battle/constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
  BtlController_EmitOneReturnValue,
  gUnusedControllerStruct,
} from './battle_controllers';
import {
  gBitTable, BattlePutTextOnWindow,
  JOY_NEW, JOY_REPEAT, JOY_HELD,
  A_BUTTON, B_BUTTON, START_BUTTON,
  DPAD_LEFT, DPAD_RIGHT, DPAD_UP, DPAD_DOWN, DPAD_ANY,
  SE_SELECT,
} from './battle_controllers';
import { MarkBattlerForControllerExec } from './battle_util';
import { isBallThrowAnimActive } from './battle_anim_throw';
// PlaySE wired via globalThis.__PlaySE (exposé par decomp-globals ligne ~722) —
// évite cycle ESM avec import direct.
function PlaySE(seId: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
import {
  DoBounceEffect, EndBounceEffect, BOUNCE_HEALTHBOX, BOUNCE_MON,
} from './engine/battle/battle-sprite-callbacks';
import {
  B_WIN_ACTION_PROMPT, B_WIN_ACTION_MENU, B_WIN_MSG,
  B_WIN_MOVE_NAME_1, B_WIN_PP, B_WIN_PP_REMAINING, B_WIN_MOVE_TYPE,
} from '../include/constants/battle';
import { SELECT_BUTTON } from './battle_controllers';
import { GetBattlerPosition, GetBattlerAtPosition } from './engine/battle/util';
// ANTI-TDZ : B_POSITION_* depuis leur foyer 1:1 (include/constants/battle.ts, quasi-feuille)
// — via engine/battle/util (en cycle), le binding restait en TDZ quand ce module s'évaluait
// en premier → la table top-level sTargetIdentities (:1003, bcp.c:184) crashait le boot.
import { B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT } from '../include/constants/battle';
import { GetDefaultMoveTarget } from './pokemon';
import {
  TYPE_GHOST, MOVE_NONE, MAX_MON_MOVES, MOVE_CURSE,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_SELECTED,
  MOVE_TARGET_RANDOM, MOVE_TARGET_BOTH, MOVE_TARGET_DEPENDS,
  MOVE_TARGET_FOES_AND_ALLY, MOVE_TARGET_OPPONENTS_FIELD,
  BATTLE_ALIVE_EXCEPT_ACTIVE,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE,
} from './engine/battle/constants';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  gPlayerParty, GetMonData,
  MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_LEVEL, MON_DATA_STATUS, MON_DATA_IS_EGG,
  MON_DATA_EXP, MON_DATA_SPECIES, MON_DATA_MOVE1,
  SetBattleMonDataFromBuffer,
} from './engine/battle/party-storage';
import { gBattlerPartyIndexes, setActiveBattler, gBattlersCount, setBattlerInMenuId } from './engine/battle/state';
import { HandleIntroSlide } from './battle_intro';
import {
  SetBattleBarStruct, MoveBattleBar, HEALTH_BAR, EXP_BAR,
} from './battle_interface';
// Party summary (barre + 6 balls, 1:1 battle_interface.c party-summary slice).
import {
  CreatePartyStatusSummarySprites, SetTaskFuncToHidePartyStatusSummary,
  ensurePartySummaryAssets, gBattlerStatusSummaryTaskId,
  type HpAndStatus as _PSHpAndStatus,
} from './battle_interface';
import {
  setPartyStatusSummaryShown as _setPartyStatusSummaryShown,
  isPartyStatusSummaryShown as _isPartyStatusSummaryShown,
  getPartyStatusDelayTimer as _getPartyStatusDelayTimer,
  setPartyStatusDelayTimer as _setPartyStatusDelayTimer,
} from './engine/battle/battle-sprites-data';
import { B_ANIM_SWITCH_OUT_PLAYER_MON } from '../include/constants/battle_anim';
import { GET_BATTLER_SIDE as _PS_SIDE, B_SIDE_PLAYER as _PS_B_SIDE_PLAYER } from './engine/battle/constants';
import { getExpForLevel } from './data/pokemon/experience_tables';
import { getSpeciesGrowthRate } from './data/pokemon/species_info';
import { LoadPalette, BG_PLTT_ID, getRuntime, SpriteCallbackDummy, PlayFanfare } from '../harness/runtime/decomp-globals';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
// Helper partagé de création de sprite de battler (gère back=joueur / front=ennemi).
// opponent.ts n'importe PAS player.ts → pas de cycle ESM.
import { _loadAndCreateBattlerMonSprite, setBattlerDeferReveal, getBattlerMonSpriteId } from './battle_controller_opponent';
import {
  showTrainerBackSprite,
  getTrainerSpriteId, destroyTrainerBackSprite,
} from './engine/battle/battle-sendout-anim';
import {
  StartAnimLinearTranslation, StoreSpriteCallbackInData6,
  SetSpritePrimaryCoordsFromSecondaryCoords,
} from './battle_anim_mons';
import { DoPokeballSendOutAnimation } from './pokeball';
import { POKEBALL_PLAYER_SENDOUT } from '../include/pokeball';
import { StartSpriteAnim } from './sprite';
import type { DecompTask, DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { isBallAnimActive, setBallAnimActive } from './engine/battle/battle-sprites-data';
import { reverseDecompConstant as _reverseDecompConstantPlayer } from '../harness/runtime/decomp-constants';
import { getMoveName as _getMoveNameFrFromData } from './engine/data/game-data';
import { getBattleMove } from './data/battle_moves';
import { getPPTextPalette } from './battle_bg';
// BG tilemap réel (curseur menu action/move) — 1:1 décomp bg.c. gba-window-system
// n'importe PAS battle/ → pas de cycle.
import { CopyRectToBgTilemapBufferRect, CopyBgTilemapBufferToVram, FreeAllWindowBuffers } from './window';
// gSpecialVar_ItemId : lu par CompleteWhenChoseItem (1:1 bcp.c:1390). script-vars est
// cycle-safe ici (déjà transitif via battle_util ; save.ts n'importe rien de battle).
import { gSpecialVar } from './engine/script/script-vars';
import { getString } from '../harness/runtime/decomp-strings';
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

// gText_BattleMenu (battle_message.c:1276) « ATTAQUE{CLEAR_TO 56}SAC\nPOKéMON... » :
// tiré de getString() au point d'usage (anti-hardcode ; .replace \n littéral → saut de
// ligne pour un input byte-identique à l'ancien const).

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

/** 1:1 décomp `BattleTv_ClearExplosionFaintCause()` — porté 1:1 battle_tv.ts
 *  (transpilé, ex-stub dette R3 soldé). Import dyn anti-cycle (battle_tv → tv →
 *  overworld ; le contrôleur est tiré tôt par battle_main). */
function _BattleTv_ClearExplosionFaintCause(): void {
  void import('./battle_tv').then((m) => m.BattleTv_ClearExplosionFaintCause());
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

/** 1:1 `hMain_Data7` (= data[7] décomp) : le port réutilise data[7] du sprite box LEFT
 *  pour le RIGHT sprite id (le runtime n'a pas d'oam.affineParam-u8), donc data[7] ne DOIT
 *  pas être touché. hMain_Data7 est WRITE-ONLY partout dans le décomp (jamais lu) → toggle
 *  sur un stockage parallèle par battler, 1:1 comportemental. */
const _hMainData7: number[] = [0, 0, 0, 0];

/** 1:1 décomp `SwapHpBarsWithHpText()` (battle_interface.c:1376-1442). Toggle HP bar ↔
 *  chiffres PV (touche START en combat). Gate l.1383-1385 :
 *  `box au repos (callback==SpriteCallbackDummy) && side != OPPONENT && (double || side != PLAYER)`
 *  → en SINGLE aucun battler ne passe (side != OPP && side != PLAYER = impossible) = NO-OP total
 *  (comportement single INCHANGÉ). En DOUBLE : réduit à side == PLAYER. Les primitives healthbox
 *  passent par le hook __battleHealthbox (où vivent les internals VRAM, step 3/4/5). */
function _SwapHpBarsWithHpText(): void {
  const hb = (globalThis as { __battleHealthbox?: {
    gHealthboxSpriteIds?: number[];
    isHealthboxAtRest?: (id: number) => boolean;
    toggleHpNumbersNoBars?: (b: number) => number;
    clearHealthbarTiles?: (id: number) => void;
    UpdateHpTextInHealthboxInDoubles?: (id: number, v: number, hp: number) => void;
    UpdateStatusIconInHealthboxById?: (id: number) => void;
    UpdateHealthboxAttribute?: (id: number, mon: unknown, el: number) => void;
    copyFrameEndBarToHealthbox?: (id: number) => void;
    HEALTHBOX_HEALTH_BAR?: number;
  } }).__battleHealthbox;
  if (!hb || !hb.gHealthboxSpriteIds) return;
  const ids = hb.gHealthboxSpriteIds;
  const HP_CURRENT = 0, HP_MAX = 1;                       // 1:1 battle_interface.h
  const HEALTHBOX_HEALTH_BAR = hb.HEALTHBOX_HEALTH_BAR ?? 5;
  const isDouble = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;

  for (let i = 0; i < gBattlersCount; i++) {              // 1:1 l.1381
    const side = GET_BATTLER_SIDE(i);
    // 1:1 gate l.1383-1385 : box au repos && side != B_SIDE_OPPONENT(1) && (double || side != B_SIDE_PLAYER(0)).
    if (!(hb.isHealthboxAtRest?.(ids[i])
          && side !== 1
          && (isDouble || side !== 0))) continue;

    // 1:1 l.1389-1390 : gBattleSpritesDataPtr->battlerData[i].hpNumbersNoBars ^= 1.
    const noBars = (hb.toggleHpNumbersNoBars?.(i) ?? 0) !== 0;

    if (side === 0 /* B_SIDE_PLAYER — seul cas atteignable ici */) {   // 1:1 l.1391
      if (!isDouble) continue;                              // 1:1 l.1393-1394
      if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) continue;  // 1:1 l.1395-1396
      const mon = gPlayerParty[gBattlerPartyIndexes[i]];
      if (noBars) {  // 1:1 l.1398-1405 : bars → text
        hb.clearHealthbarTiles?.(ids[i]);  // 1:1 l.1402 CpuFill32(0, bar, 0x100)
        hb.UpdateHpTextInHealthboxInDoubles?.(ids[i], GetMonData(mon, MON_DATA_HP) as number, HP_CURRENT);
        hb.UpdateHpTextInHealthboxInDoubles?.(ids[i], GetMonData(mon, MON_DATA_MAX_HP) as number, HP_MAX);
      } else {  // 1:1 l.1406-1411 : text → bars
        hb.UpdateStatusIconInHealthboxById?.(ids[i]);
        hb.UpdateHealthboxAttribute?.(ids[i], mon, HEALTHBOX_HEALTH_BAR);
        hb.copyFrameEndBarToHealthbox?.(ids[i]);  // 1:1 l.1410 GFX_FRAME_END_BAR → box+0x680
      }
    }
    // 1:1 l.1413-1438 : la branche `else` (OPPONENT) est UNREACHABLE — le gate exige
    // side != B_SIDE_OPPONENT. Le décomp la conserve (bars↔text adverse + PrintSafariMonInfo)
    // mais elle n'exécute JAMAIS → non transcrite (dépendrait de PrintSafariMonInfo non porté).

    _hMainData7[i] ^= 1;   // 1:1 l.1439 (write-only, cf. _hMainData7).
  }
}

/** 1:1 décomp `IsDma3ManagerBusyWithBgCopy()` (dma3_manager.c). GBA-specific
 *  DMA queue check pour la copy tilemap → VRAM. Pour notre port web :
 *  return false (= jamais busy, copies sont synchrones via Phaser). */
function _IsDma3ManagerBusyWithBgCopy(): boolean {
  return false;
}

/** 1:1 décomp `HandleInputChooseTarget()` (battle_controller_player.c:339-468).
 *  Sélection de la cible en combat DOUBLE : installé par HandleInputChooseMove
 *  (:685) quand `canSelectTarget`. Lit les inputs 1:1 :
 *    - A → valide la cible (Emit B_ACTION_EXEC_SCRIPT moveIdx | target<<8).
 *    - B / hold-59 → retour HandleInputChooseMove.
 *    - DPAD LEFT|UP / RIGHT|DOWN → déplace le curseur cible (sTargetIdentities).
 *  Adaptation : les `gSprites[gBattlerSpriteIds[X]].callback = SpriteCB_*` du
 *  décomp deviennent `_SpriteCB_Show/HideAsMoveTarget(X)` (même dette R3 cosmétique
 *  que HandleInputChooseMove :694 ; la flèche cible n'est pas encore rendue).
 *  AVANT (2026-07-11) : corps VIDE (stub « Dette R3 ») → une fois installé, aucune
 *  touche lue et jamais de PlayerBufferExecCompleted → FREEZE input en double. */
function HandleInputChooseTarget(): void {
  let i: number;
  const identities = sTargetIdentities; // memcpy local (lecture seule) 1:1.

  DoBounceEffect(gMultiUsePlayerCursor, BOUNCE_HEALTHBOX, 15, 1);

  // what a weird loop (commentaire décomp) : EndBounce sur tous SAUF la cible.
  i = 0;
  if (gBattlersCount !== 0) {
    do {
      if (i !== gMultiUsePlayerCursor) EndBounceEffect(i, BOUNCE_HEALTHBOX);
      i++;
    } while (i < gBattlersCount);
  }

  if (JOY_HELD(DPAD_ANY) && gSaveBlock2Ptr.optionsButtonMode === OPTIONS_BUTTON_MODE_L_EQUALS_A) {
    incPlayerDpadHoldFrames();
  } else {
    setPlayerDpadHoldFrames(0);
  }

  if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    _SpriteCB_HideAsMoveTarget(gMultiUsePlayerCursor);
    BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, gMoveSelectionCursor[gActiveBattler] | (gMultiUsePlayerCursor << 8));
    EndBounceEffect(gMultiUsePlayerCursor, BOUNCE_HEALTHBOX);
    PlayerBufferExecCompleted();
  } else if (JOY_NEW(B_BUTTON) || gPlayerDpadHoldFrames > 59) {
    PlaySE(SE_SELECT);
    _SpriteCB_HideAsMoveTarget(gMultiUsePlayerCursor);
    gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseMove;
    DoBounceEffect(gActiveBattler, BOUNCE_HEALTHBOX, 7, 1);
    DoBounceEffect(gActiveBattler, BOUNCE_MON, 7, 1);
    EndBounceEffect(gMultiUsePlayerCursor, BOUNCE_HEALTHBOX);
  } else if (JOY_NEW(DPAD_LEFT | DPAD_UP)) {
    PlaySE(SE_SELECT);
    _SpriteCB_HideAsMoveTarget(gMultiUsePlayerCursor);

    do {
      const currSelIdentity = GetBattlerPosition(gMultiUsePlayerCursor);

      for (i = 0; i < MAX_BATTLERS_COUNT; i++) {
        if (currSelIdentity === identities[i]) break;
      }
      do {
        // UBFIX (include/config.h:58 défini dans ce décomp) : wrap circulaire au
        // dernier index. Le chemin non-UBFIX lit identities[MAX_BATTLERS_COUNT]
        // (OOB stack) — non reproductible en JS.
        if (--i < 0) i = MAX_BATTLERS_COUNT - 1;
        setMultiUsePlayerCursor(GetBattlerAtPosition(identities[i]));
      } while (gMultiUsePlayerCursor === gBattlersCount);

      i = 0;
      switch (GetBattlerPosition(gMultiUsePlayerCursor)) {
        case B_POSITION_PLAYER_LEFT:
        case B_POSITION_PLAYER_RIGHT:
          if (gActiveBattler !== gMultiUsePlayerCursor) {
            i++;
          } else if (_getMoveTarget(GetMonData(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], MON_DATA_MOVE1 + gMoveSelectionCursor[gActiveBattler]) as number) & MOVE_TARGET_USER_OR_SELECTED) {
            i++;
          }
          break;
        case B_POSITION_OPPONENT_LEFT:
        case B_POSITION_OPPONENT_RIGHT:
          i++;
          break;
      }

      if (gAbsentBattlerFlags & gBitTable[gMultiUsePlayerCursor]) i = 0;
    } while (i === 0);
    _SpriteCB_ShowAsMoveTarget(gMultiUsePlayerCursor);
  } else if (JOY_NEW(DPAD_RIGHT | DPAD_DOWN)) {
    PlaySE(SE_SELECT);
    _SpriteCB_HideAsMoveTarget(gMultiUsePlayerCursor);

    do {
      const currSelIdentity = GetBattlerPosition(gMultiUsePlayerCursor);

      for (i = 0; i < MAX_BATTLERS_COUNT; i++) {
        if (currSelIdentity === identities[i]) break;
      }
      do {
        if (++i > 3) i = 0;
        setMultiUsePlayerCursor(GetBattlerAtPosition(identities[i]));
      } while (gMultiUsePlayerCursor === gBattlersCount);

      i = 0;
      switch (GetBattlerPosition(gMultiUsePlayerCursor)) {
        case B_POSITION_PLAYER_LEFT:
        case B_POSITION_PLAYER_RIGHT:
          if (gActiveBattler !== gMultiUsePlayerCursor) {
            i++;
          } else if (_getMoveTarget(GetMonData(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], MON_DATA_MOVE1 + gMoveSelectionCursor[gActiveBattler]) as number) & MOVE_TARGET_USER_OR_SELECTED) {
            i++;
          }
          break;
        case B_POSITION_OPPONENT_LEFT:
        case B_POSITION_OPPONENT_RIGHT:
          i++;
          break;
      }

      if (gAbsentBattlerFlags & gBitTable[gMultiUsePlayerCursor]) i = 0;
    } while (i === 0);
    _SpriteCB_ShowAsMoveTarget(gMultiUsePlayerCursor);
  }
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
    // 1:1 décomp (goal T5) : mode réarrangement des moves.
    if (gNumberOfMovesToChoose > 1 && !(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
      MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 29);
      if (gMoveSelectionCursor[gActiveBattler] !== 0) setMultiUsePlayerCursor(0);
      else setMultiUsePlayerCursor(gMoveSelectionCursor[gActiveBattler] + 1);
      MoveSelectionCreateCursorAt(gMultiUsePlayerCursor, 27);
      BattlePutTextOnWindow('Échanger' + String.fromCharCode(10) + 'lequel?' /* 1:1 gText_BattleSwitchWhich */, 11 /* B_WIN_SWITCH_PROMPT */);
      gBattlerControllerFuncs[gActiveBattler] = HandleMoveSwitching;
    }
  }
}

/** 1:1 décomp `HandleMoveSwitching()` (battle_controller_player.c:667-810),
 *  goal T5 2026-06-11 : A/SELECT → swap (bufferA ChooseMoveStruct +
 *  gBattleMons.moves/pp/ppBonuses + persistance party mon) ; DPAD → bouge le
 *  2e curseur ; B → annule. Re-render menu + retour HandleInputChooseMove. */
function HandleMoveSwitching(): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(SELECT_BUTTON)) {
    PlaySE(SE_SELECT);
    if (gMoveSelectionCursor[gActiveBattler] !== gMultiUsePlayerCursor) {
      const buf = gBattleBufferA[gActiveBattler];
      const a = gMoveSelectionCursor[gActiveBattler];
      const b = gMultiUsePlayerCursor;
      // swap moves (u16) + currentPp + maxPp dans le ChooseMoveStruct (bufferA).
      for (const [off, sz] of [[4, 2], [12, 1], [16, 1]] as const) {
        for (let k = 0; k < sz; k++) {
          const t = buf[off + a * sz + k];
          buf[off + a * sz + k] = buf[off + b * sz + k];
          buf[off + b * sz + k] = t;
        }
      }
      // swap gBattleMons[active].moves/pp + ppBonuses (2 bits par slot) 1:1.
      const bm = ((globalThis as Record<string, unknown>).__battleState as { gBattleMons?: Array<{ moves: number[]; pp: number[]; ppBonuses: number }> })?.gBattleMons?.[gActiveBattler];
      if (bm) {
        [bm.moves[a], bm.moves[b]] = [bm.moves[b], bm.moves[a]];
        [bm.pp[a], bm.pp[b]] = [bm.pp[b], bm.pp[a]];
        const bitsA = (bm.ppBonuses >> (a * 2)) & 3;
        const bitsB = (bm.ppBonuses >> (b * 2)) & 3;
        bm.ppBonuses = (bm.ppBonuses & ~((3 << (a * 2)) | (3 << (b * 2)))) | (bitsA << (b * 2)) | (bitsB << (a * 2));
      }
      // persistance party mon (SetMonData MON_DATA_MOVE/PP/PP_BONUSES 1:1).
      const party = (globalThis as Record<string, unknown>).gPlayerParty as Array<{ moves?: number[]; pp?: number[]; ppBonuses?: number }> | undefined;
      const idx = (gBattlerPartyIndexes as number[])[gActiveBattler] ?? 0;
      const mon = party?.[idx];
      if (mon?.moves && mon.pp) {
        [mon.moves[a], mon.moves[b]] = [mon.moves[b], mon.moves[a]];
        [mon.pp[a], mon.pp[b]] = [mon.pp[b], mon.pp[a]];
        if (mon.ppBonuses !== undefined) {
          const pA = (mon.ppBonuses >> (a * 2)) & 3;
          const pB = (mon.ppBonuses >> (b * 2)) & 3;
          mon.ppBonuses = (mon.ppBonuses & ~((3 << (a * 2)) | (3 << (b * 2)))) | (pA << (b * 2)) | (pB << (a * 2));
        }
      }
      gMoveSelectionCursor[gActiveBattler] = gMultiUsePlayerCursor;
    }
    // re-render + retour au choix de move (1:1 fin de HandleMoveSwitching).
    MoveSelectionDisplayMoveNames();
    MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
    MoveSelectionDisplayPpString();
    MoveSelectionDisplayPpNumber();
    MoveSelectionDisplayMoveType();
    gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseMove;
    return;
  }
  if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    MoveSelectionDestroyCursorAt(gMultiUsePlayerCursor);
    MoveSelectionCreateCursorAt(gMoveSelectionCursor[gActiveBattler], 0);
    MoveSelectionDisplayPpString();
    MoveSelectionDisplayPpNumber();
    MoveSelectionDisplayMoveType();
    gBattlerControllerFuncs[gActiveBattler] = HandleInputChooseMove;
    return;
  }
  // DPAD : bouge le 2e curseur (1:1 mêmes toggles que le menu).
  const cur = gMultiUsePlayerCursor;
  let next = cur;
  if (JOY_NEW(DPAD_LEFT) && (cur & 1)) next = cur ^ 1;
  else if (JOY_NEW(DPAD_RIGHT) && !(cur & 1) && ((cur ^ 1) < gNumberOfMovesToChoose)) next = cur ^ 1;
  else if (JOY_NEW(DPAD_UP) && (cur & 2)) next = cur ^ 2;
  else if (JOY_NEW(DPAD_DOWN) && !(cur & 2) && ((cur ^ 2) < gNumberOfMovesToChoose)) next = cur ^ 2;
  if (next !== cur) {
    PlaySE(SE_SELECT);
    MoveSelectionDestroyCursorAt(cur);
    setMultiUsePlayerCursor(next);
    MoveSelectionCreateCursorAt(next, 27);
  }
}

/** 1:1 décomp `B_POSITION_OPPONENT_LEFT/RIGHT` (battle.h). */
const B_POSITION_OPPONENT_LEFT = 1;
const B_POSITION_OPPONENT_RIGHT = 3;

/** 1:1 décomp `MAX_BATTLERS_COUNT` (include/constants/battle.h). */
const MAX_BATTLERS_COUNT = 4;

/** 1:1 décomp `sTargetIdentities[MAX_BATTLERS_COUNT]` (battle_controller_player.c:184).
 *  Ordre de parcours du curseur de cible en double battle :
 *  {PLAYER_LEFT, PLAYER_RIGHT, OPPONENT_RIGHT, OPPONENT_LEFT}. */
const sTargetIdentities = [
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_RIGHT, B_POSITION_OPPONENT_LEFT,
];

/** 1:1 décomp `gSprites[gBattlerSpriteIds[battler]].callback = SpriteCB_ShowAsMoveTarget`
 *  (battle_controller_player.c:425,467,540,860). Installe le blink de cible : SpriteCB_ShowAsMoveTarget
 *  pose data[3]=8 + callback=SpriteCB_BlinkVisible qui toggle sprite.invisible tous les 8 frames
 *  (porté 1:1 battle_main.c:2814-2828). Le callback est tické chaque frame par
 *  AnimateSprites→RunSpriteCallbacks ; le compositor honore sprite.invisible.
 *  Résolution du sprite = getRuntime().gSprites[getBattlerMonSpriteId(battler)] (registre voie-L
 *  gBattlerSpriteIds, précédent opponent.ts:_startOpponentFaintAnim :1053). La fonction est pontée
 *  via __battleSpriteCallbacks (bridge globalThis existant, battle_main.ts:3965) — bcp n'importe
 *  PAS battle_main : pas de nouvelle arête statique (→ pas de bombe TDZ à l'init). */
function _SpriteCB_ShowAsMoveTarget(battler: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
  if (!sprite) return;
  const cb = (globalThis as { __battleSpriteCallbacks?: { SpriteCB_ShowAsMoveTarget?: (s: DecompSprite) => void } })
    .__battleSpriteCallbacks?.SpriteCB_ShowAsMoveTarget;
  if (cb) sprite.callback = cb;
}

/** 1:1 décomp `gSprites[gBattlerSpriteIds[battler]].callback = SpriteCB_HideAsMoveTarget`
 *  (battle_controller_player.c:367,375,384,430,494,501,538). Restaure l'invisibilité initiale
 *  (SpriteCB_HideAsMoveTarget : sprite.invisible = data[4]; callback = SpriteCallbackDummy_2 —
 *  1:1 battle_main.c:2830-2835) → arrête le blink. Même résolution sprite + même pont
 *  __battleSpriteCallbacks que _SpriteCB_ShowAsMoveTarget. */
function _SpriteCB_HideAsMoveTarget(battler: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
  if (!sprite) return;
  const cb = (globalThis as { __battleSpriteCallbacks?: { SpriteCB_HideAsMoveTarget?: (s: DecompSprite) => void } })
    .__battleSpriteCallbacks?.SpriteCB_HideAsMoveTarget;
  if (cb) sprite.callback = cb;
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
 *  gBattleBufferA[active] + applique au mon `monId` de gPlayerParty via SetMonData.
 *  @body-parity-ok délègue SetBattleMonDataFromBuffer→_applySetMonData (party-storage.ts), switch 20 cas ; contest-stats hors combat différées */
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

/** 1:1 décomp `PlayerHandleReturnMonToBall()` (battle_controller_player.c:2227-2242).
 *  bufferA[1]==0 → anim de rappel (DoSwitchOutAnimation : le mon rétrécit dans la
 *  ball, B_ANIM_SWITCH_OUT_PLAYER_MON) ; sinon → skip anim, suppression directe
 *  (FreeSpriteOamMatrix + DestroySprite + SetHealthboxSpriteInvisible). */
function PlayerHandleReturnMonToBall(): void {
  if (gBattleBufferA[gActiveBattler][1] === 0) {
    _setHealthBoxAnimationState(gActiveBattler, 0);
    gBattlerControllerFuncs[gActiveBattler] = DoSwitchOutAnimation;
  } else {
    _freeMonSpriteAndHideHealthbox(gActiveBattler);
    PlayerBufferExecCompleted();
  }
}

/** Corps partagé 1:1 l.2237-2239 / l.1331-1334 : FreeSpriteOamMatrix + DestroySprite
 *  (rt.DestroySprite libère la matrice allouée — mécanisme décomp) +
 *  SetHealthboxSpriteInvisible(gHealthboxSpriteIds[battler]). */
function _freeMonSpriteAndHideHealthbox(battler: number): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(battler);
  const sprite = rt?.gSprites?.[spriteId];
  if (sprite && rt) {
    // 1:1 décomp : DestroySprite AVEC sprite.inUse ENCORE vrai → il libère les tuiles OBJ
    // (FREE_SPRITE_TILE) + masque l'OAM. L'ancien `sprite.inUse = false` ici faisait
    // early-return DestroySprite (`if (!inUse) return`) → tuiles JAMAIS libérées = fuite VRAM
    // → pool OBJ 1024 tuiles saturé après quelques switchs → mons non spawnés (disparaissent)
    // ou tuiles poubelle. Retiré (divergence non-1:1). callback=null = inoffensif (ResetSprite le fait).
    sprite.callback = null;
    DestroySprite(spriteId);
  }
  const hb = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteInvisible?: (id: number) => void } }).__battleHealthbox;
  hb?.SetHealthboxSpriteInvisible?.(_gHealthboxSpriteId(battler));
}

/** 1:1 décomp `DoSwitchOutAnimation()` (battle_controller_player.c:2244-2264) :
 *  case 0 = si behindSubstitute → B_ANIM_SUBSTITUTE_TO_MON d'abord ; case 1 =
 *  quand la special anim est libre → B_ANIM_SWITCH_OUT_PLAYER_MON (rétrécissement
 *  dans la ball) puis FreeMonSpriteAfterSwitchOutAnim. */
function DoSwitchOutAnimation(): void {
  switch (_getHealthBoxAnimationState(gActiveBattler)) {
    case 0:
      if (_isBehindSubstitute(gActiveBattler))
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
      _setHealthBoxAnimationState(gActiveBattler, 1);
      break;
    case 1:
      if (!_isSpecialAnimActive(gActiveBattler)) {
        _setHealthBoxAnimationState(gActiveBattler, 0);
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, B_ANIM_SWITCH_OUT_PLAYER_MON);
        gBattlerControllerFuncs[gActiveBattler] = FreeMonSpriteAfterSwitchOutAnim;
      }
      break;
  }
}

/** 1:1 décomp `FreeMonSpriteAfterSwitchOutAnim()` (battle_controller_player.c:1328-1338) :
 *  attend la fin de la special anim (le shrink) → destroy sprite + healthbox
 *  invisible + ExecCompleted. */
function FreeMonSpriteAfterSwitchOutAnim(): void {
  if (!_isSpecialAnimActive(gActiveBattler)) {
    _freeMonSpriteAndHideHealthbox(gActiveBattler);
    PlayerBufferExecCompleted();
  }
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
    const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
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
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
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

// ─── Chaîne SwitchIn player 1:1 (battle_controller_player.c:1065-1125) ──────
// CÂBLAGE : la machine _sendOutPhase (intro+switch, A/B-validée) couvre le même
// comportement en compact ; ces fonctions nommées 1:1 sont les états décomp
// exacts — re-câblage nominal fin = au refactor du send-out player (dette douce).

/** 1:1 décomp `SwitchIn_CleanShinyAnimShowSubstitute()` (:1065-1086). */
export function SwitchIn_CleanShinyAnimShowSubstitute(): void {
  const monId = getBattlerMonSpriteId(gActiveBattler);
  const spr = getRuntime()?.gSprites?.[monId];
  const cbName = (spr?.callback as { name?: string } | null)?.name ?? 'null';
  const shiny = (globalThis as Record<string, unknown>).__battleAnimThrowShiny as {
    isShinyAnimFinished?: (b: number) => boolean; resetShinyAnimFlags?: (b: number) => void;
  } | undefined;
  if ((shiny?.isShinyAnimFinished?.(gActiveBattler) ?? true)
    && (cbName === 'SpriteCallbackDummy' || cbName === 'SpriteCallbackDummy_2' || spr?.callback === null)) {
    (globalThis as { __battleGfxSfxUtil?: { CopyBattleSpriteInvisibility?: (b: number) => void } })
      .__battleGfxSfxUtil?.CopyBattleSpriteInvisibility?.(gActiveBattler);
    // 1:1 reset shiny anim (even if it didn't occur) + free GOLD_STARS (tasks T5).
    shiny?.resetShinyAnimFlags?.(gActiveBattler);
    if (_isBehindSubstitute(gActiveBattler))
      _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, 6 /* B_ANIM_MON_TO_SUBSTITUTE */);
    gBattlerControllerFuncs[gActiveBattler] = SwitchIn_HandleSoundAndEnd;
  }
}

/** 1:1 décomp `SwitchIn_HandleSoundAndEnd()` (:1087-1097) — volume BGM via hook
 *  m4a toléré (infra BGM non modifiée). */
export function SwitchIn_HandleSoundAndEnd(): void {
  const cryPlaying = !!(globalThis as { __isCryPlaying?: () => boolean }).__isCryPlaying?.();
  if (!_isSpecialAnimActive(gActiveBattler) && !cryPlaying) {
    (globalThis as { __m4aMPlayVolumeControlBGMFull?: () => void }).__m4aMPlayVolumeControlBGMFull?.();
    _HandleLowHpMusicChange(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `Task_PlayerController_RestoreBgmAfterCry(taskId)` (:1117-1125) :
 *  attend la fin du cri → restore volume BGM → DestroyTask. Caller décomp =
 *  PlayerHandleFaintingCry/HandleIntro (création au cri baissé). */
export function Task_PlayerController_RestoreBgmAfterCry(task: { taskId: number }): void {
  const cryPlaying = !!(globalThis as { __isCryPlaying?: () => boolean }).__isCryPlaying?.();
  if (!cryPlaying) {
    (globalThis as { __m4aMPlayVolumeControlBGMFull?: () => void }).__m4aMPlayVolumeControlBGMFull?.();
    getRuntime()?.DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `CompleteOnFinishedBattleAnimation()` (:1566-1571) : attend la fin
 *  d'une anim de la table General (animFromTableActive, battle_gfx_sfx_util). */
export function CompleteOnFinishedBattleAnimation(): void {
  const active = !!(globalThis as { __battleGfxSfxUtil?: { isAnimFromTableActive?: (b: number) => boolean } })
    .__battleGfxSfxUtil?.isAnimFromTableActive?.(gActiveBattler);
  if (!active) PlayerBufferExecCompleted();
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

/** 1:1 décomp `InitAndLaunchSpecialAnimation(active, attacker, target, animId)`
 *  (battle_gfx_sfx_util.c:523). Surface __battleGfxSfxUtil (anti-cycle ESM) —
 *  l'ancien wire `__battleAnim.initAndLaunchSpecialAnimation` n'existait NULLE
 *  PART (no-op silencieux). */
function _InitAndLaunchSpecialAnimation(_active: number, _attacker: number, _target: number, _animId: number): void {
  const m = (globalThis as { __battleGfxSfxUtil?: { InitAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleGfxSfxUtil;
  m?.InitAndLaunchSpecialAnimation?.(_active, _attacker, _target, _animId);
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
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
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
  const sprite = rt?.gSprites?.[spriteId];
  if (!sprite || ((sprite.y ?? 0) + (sprite.y2 ?? 0) > 160 /* DISPLAY_HEIGHT */)) {
    // 1:1 DestroySprite : cacher l'OAM AVANT de retirer de la Map (même bug fantôme
    // que le faint adverse, cf. DestroySprite de battle_main section C1) — sinon
    // l'image du back-sprite resterait affichée (slot orphelin, plus aucun sync).
    if (sprite && rt?.gSprites) { DestroySprite(spriteId); rt.gSprites[spriteId] = undefined; }
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
  // 1:1 InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler,
  //   GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT), B_ANIM_BALL_THROW)
  //   (battle_controller_player.c:2454) → gBattleAnimTarget = defBattler. Le
  //   TARGET de l'anim est le mon adverse GAUCHE *déterministe*, PAS gBattlerTarget :
  //   ce dernier peut avoir été ré-écrit entre Cmd_handleballthrow et l'exécution
  //   ASYNC du contrôleur → le shrink (gBattlerSpriteIds[gBattleAnimTarget])
  //   partait sur le mauvais mon = NOTRE Pokémon rétrécissait (bug user 2026-06-13).
  const ba = (globalThis as Record<string, unknown>).__battleAnim as { SetAnimBattlers?: (a: number, d: number) => void } | undefined;
  ba?.SetAnimBattlers?.(gActiveBattler, GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
  const bat = (globalThis as Record<string, unknown>).__battleAnimThrow as { Special_BallThrow_TS?: () => void } | undefined;
  bat?.Special_BallThrow_TS?.();
  setBattlerControllerFunc(gActiveBattler, CompleteOnSpecialAnimDone);
}

/** 1:1 decomp `CompleteOnFinishedBattleAnimation()` (battle_controller_player.c) :
 *  complete quand l'anim DU TABLEAU est finie (animFromTableActive). Pour le
 *  throw = isBallThrowAnimActive (cleared à la destruction de la ball, ~sTimer
 *  315 + fade out). L'ancien gate gDoingBattleAnim (cleared à sTimer 95) rendait
 *  la main TROP TÔT → le message Gotcha + {PLAY_BGM MUS_CAUGHT} partaient en
 *  même temps que l'intro-jingle SE de :95 (bug user, tempo ROM ≈ +3,7 s). */
function CompleteOnSpecialAnimDone(): void {
  if (!gDoingBattleAnimState && !isBallThrowAnimActive()) PlayerBufferExecCompleted();
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
  setAnimMoveTurn?: (v: number) => void;
  setAnimMovePower?: (v: number) => void;
  setAnimMoveDmg?: (v: number) => void;
  setAnimFriendship?: (v: number) => void;
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
    // 1:1 decomp : gAnimMoveTurn/Power/Dmg/Friendship/Weather poses depuis le
    // buffer AVANT l'anim (les AnimTask les lisent : ShakeTargetBasedOnMove
    // PowerOrDmg, WeatherBall, ArmThrust multihit...). Surface globale (les
    // miroirs anim y accedent sans cycle ESM).
    const g = globalThis as Record<string, unknown>;
    g.__gAnimMoveTurn = buf[3];
    g.__gAnimMovePower = buf[4] | (buf[5] << 8);
    g.__gAnimMoveDmg = (buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0;
    g.__gAnimFriendship = buf[10];
    g.__gWeatherMoveAnim = buf[12] | (buf[13] << 8);
    // + les VRAIS gAnimMove* de l'interpreter (lus par choosetwoturnanim/
    // jumpifmoveturn/IsPowerOver99/Frustration...) — WIRE MORT #7 : les
    // __gAnimMove* ci-dessus n'étaient lus par personne côté interpreter.
    const itfT = _animItf();
    itfT.setAnimMoveTurn?.(buf[3]);
    itfT.setAnimMovePower?.(buf[4] | (buf[5] << 8));
    itfT.setAnimMoveDmg?.((buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0);
    itfT.setAnimFriendship?.(buf[10]);
    _moveAnimState[gActiveBattler] = 0;
    gBattlerControllerFuncs[gActiveBattler] = PlayerDoMoveAnimation;
    // 1:1 :2489 BattleTv_SetDataBasedOnMove(move, gWeatherMoveAnim, gAnimDisableStructPtr)
    // — gAnimDisableStructPtr ≙ gDisableStructs[gActiveBattler].
    const _mv = _moveAnimMove[gActiveBattler];
    const _weather = buf[12] | (buf[13] << 8);
    void import('./battle_tv').then((m) =>
      import('./engine/battle/state').then((st) =>
        m.BattleTv_SetDataBasedOnMove(_mv, _weather, st.gDisableStructs[gActiveBattler])));
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
      // 1:1 decomp : SetBattlerSpriteAffineMode(ST_OAM_AFFINE_OFF) AVANT
      // DoMoveAnim — les mons ne sont plus affines pendant l'anim (anti
      // corruption matrice/scale, retours user Wailord x3).
      ((globalThis as Record<string, unknown>).__SetBattlerSpriteAffineMode as ((m: number) => void) | undefined)?.(0);
      if (itf.DoMoveAnim) itf.DoMoveAnim(_moveAnimMove[gActiveBattler]);
      _moveAnimState[gActiveBattler] = 2;
      break;
    case 2:
      itf.tickAnimScript?.();
      if (!itf.isAnimScriptActive?.()) {
        // 1:1 decomp : ST_OAM_AFFINE_NORMAL au retour (matrice restauree).
        ((globalThis as Record<string, unknown>).__SetBattlerSpriteAffineMode as ((m: number) => void) | undefined)?.(1);
        _moveAnimState[gActiveBattler] = 3;
      }
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

/** 1:1 décomp `BattleTv_SetDataBasedOnString(stringId)` — porté 1:1 battle_tv.ts
 *  (transpilé, ex-stub dette R3 soldé). Le micro-délai dyn est sans effet
 *  observable (les stats TV sont lues en fin de combat). */
function _BattleTv_SetDataBasedOnString(stringId: number): void {
  void import('./battle_tv').then((m) => m.BattleTv_SetDataBasedOnString(stringId));
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
  BattlePutTextOnWindow(getString('gText_BattleMenu').replace(/\\n/g, '\n'), B_WIN_ACTION_MENU);

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
/** 1:1 décomp `PlayerHandleYesNoBox()` (battle_controller_player.c) — goal T5 :
 *  dessine la box yes/no + curseur à 1 (NON par défaut 1:1) + installe
 *  PlayerHandleYesNoInput. (gMultiUsePlayerCursor = 1 1:1.) */
function PlayerHandleYesNoBox(): void {
  if ((gActiveBattler & 1) === 0 /* B_SIDE_PLAYER */) {
    const bc = (globalThis as Record<string, unknown>).__battleControllers as {
      HandleBattleWindow?: (x1: number, y1: number, x2: number, y2: number, flags: number) => void;
      BattlePutTextOnWindow?: (text: string, windowId: number) => void;
      BattleCreateYesNoCursorAt?: (pos: number) => void;
    } | undefined;
    bc?.HandleBattleWindow?.(0x18, 8, 0x1D, 0x0D, 0);
    bc?.BattlePutTextOnWindow?.('OUI' + String.fromCharCode(10) + 'NON', 12 /* B_WIN_YESNO */);
    setMultiUsePlayerCursor(1);
    bc?.BattleCreateYesNoCursorAt?.(1);
    gBattlerControllerFuncs[gActiveBattler] = PlayerHandleYesNoInput;
  } else {
    PlayerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerHandleYesNoInput()` : UP/DOWN bougent le curseur,
 *  A → emit B_ACTION_UNK_14 (NON, 14) ou B_ACTION_NOTHING_FAINTED (OUI, 13),
 *  B → clear + complete sans emit. */
function PlayerHandleYesNoInput(): void {
  const bc = (globalThis as Record<string, unknown>).__battleControllers as {
    HandleBattleWindow?: (x1: number, y1: number, x2: number, y2: number, flags: number) => void;
    BattleCreateYesNoCursorAt?: (pos: number) => void;
    BattleDestroyYesNoCursorAt?: (pos: number) => void;
  } | undefined;
  if (JOY_NEW(DPAD_UP) && gMultiUsePlayerCursor !== 0) {
    PlaySE(SE_SELECT);
    bc?.BattleDestroyYesNoCursorAt?.(gMultiUsePlayerCursor);
    setMultiUsePlayerCursor(0);
    bc?.BattleCreateYesNoCursorAt?.(0);
  }
  if (JOY_NEW(DPAD_DOWN) && gMultiUsePlayerCursor === 0) {
    PlaySE(SE_SELECT);
    bc?.BattleDestroyYesNoCursorAt?.(gMultiUsePlayerCursor);
    setMultiUsePlayerCursor(1);
    bc?.BattleCreateYesNoCursorAt?.(1);
  }
  if (JOY_NEW(A_BUTTON)) {
    bc?.HandleBattleWindow?.(0x18, 8, 0x1D, 0x0D, 1 /* WINDOW_CLEAR */);
    PlaySE(SE_SELECT);
    if (gMultiUsePlayerCursor !== 0) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, 14 /* B_ACTION_UNK_14 */, 0);
    } else {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, 13 /* B_ACTION_NOTHING_FAINTED */, 0);
    }
    PlayerBufferExecCompleted();
  } else if (JOY_NEW(B_BUTTON)) {
    bc?.HandleBattleWindow?.(0x18, 8, 0x1D, 0x0D, 1 /* WINDOW_CLEAR */);
    PlaySE(SE_SELECT);
    PlayerBufferExecCompleted();
  }
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
  // 1:1 décomp `OpenBagAndChooseItem` (battle_controller_player.c:1375) : attend la fin
  // du fade-to-black (PlayerHandleChooseItem), installe CompleteWhenChoseItem,
  // ReshowBattleScreenDummy (no-op décomp), FreeAllWindowBuffers, CB2_BagMenuFromBattle.
  if (getRuntime()?.gPaletteFade?.active) return;                       // 1:1 :1377
  gBattlerControllerFuncs[gActiveBattler] = _CompleteWhenChoseItem;     // 1:1 :1379
  // Gate reshow (= « gMain.callback2 == BattleMainCB2 » du décomp) remis à zéro pour CE
  // sac ; posé à true par ReshowBattleScreenAfterMenu au retour (idiome _WaitForMonSelection).
  (globalThis as Record<string, unknown>).__battleReshowDone = false;
  // 1:1 :1380-1382 ReshowBattleScreenDummy() [no-op] ; FreeAllWindowBuffers() ;
  // CB2_BagMenuFromBattle() — bascule LOT 5 : item_menu.ts (miroir 1:1) au lieu du clone
  // bag-screen.ts. Import différé anti-cycle (item_menu↔bcp, reshow↔bcp ; précédent pokenav.ts).
  // FreeAllWindowBuffers + CB2_BagMenuFromBattle sont gardés ADJACENTS dans le .then() (comme
  // le décomp) : sinon libérer les fenêtres combat pendant le gap async (avant que CB2_Bag
  // prenne la main) laisserait BattleMainCB2 rendre des buffers libérés. Le pont reshow
  // globalThis est posé AVANT d'ouvrir le sac : _cb2SetUpReshowBattleScreenAfterMenu2
  // (item_menu.ts) le lit à la fermeture du sac → SetMainCallback2(ReshowBattleScreenAfterMenu).
  void Promise.all([
    import('./item_menu'),
    import('./reshow_battle_screen'),
  ]).then(([bag, reshow]) => {
    (globalThis as Record<string, unknown>).__CB2_SetUpReshowBattleScreenAfterMenu2 = reshow.CB2_SetUpReshowBattleScreenAfterMenu2;
    FreeAllWindowBuffers();          // 1:1 :1381
    bag.CB2_BagMenuFromBattle();     // 1:1 :1382
  }).catch((e) => console.error('[OpenBagAndChooseItem]', e));
}

/** 1:1 décomp `CompleteWhenChoseItem` (battle_controller_player.c:1386) :
 *  `if (gMain.callback2 == BattleMainCB2 && !gPaletteFade.active) {
 *      BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, gSpecialVar_ItemId);
 *      PlayerBufferExecCompleted(); }`.
 *  Le check « callback2 == BattleMainCB2 » (= reshow terminé, retour à la boucle combat)
 *  a pour équivalent L sync/cycle-free `__battleReshowDone` — posé par
 *  ReshowBattleScreenAfterMenu (reshow_battle_screen.ts:250), MÊME idiome que
 *  `_WaitForMonSelection`. gSpecialVar.ItemId = objet choisi dans le sac (item_menu.ts:2022)
 *  ou 0 si annulé B (LIST_CANCEL, item_menu.ts:2008 → la state-machine combat re-prompte). */
function _CompleteWhenChoseItem(): void {
  const reshowDone = (globalThis as { __battleReshowDone?: boolean }).__battleReshowDone === true;
  if (!reshowDone || getRuntime()?.gPaletteFade?.active) return;
  BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, gSpecialVar.ItemId);
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
  // 1:1 : caseId = partyAction (bufferA[1]&0xF) : 0 = CHOOSE_MON (switch volontaire),
  // 1 = SEND_OUT (forcé K.O.), 2 = CANT_SWITCH, 4 = ABILITY_PREVENTS — passé tel
  // quel à OpenPartyMenuInBattle (party_menu.c:5774), qui branche 1:1 dessus.
  const caseId = gBattleBufferA[gActiveBattler][1] & 0xF;
  (globalThis as Record<string, unknown>).__battleReshowDone = false;
  // Imports dynamiques : évitent le cycle statique controller↔party-screen/reshow
  // (= pattern voie V battle-flow:4655) ; one-shot à l'ouverture (pas per-frame).
  // Le module party est capturé (_partyModForSwitch) pour que WaitForMonSelection
  // lise les globals 1:1 gPartyMenuUseExitCallback/gSelectedMonPartyId (LOT 7).
  void Promise.all([
    import('./party_menu'),
    import('./reshow_battle_screen'),
  ]).then(([party, reshow]) => {
    _partyModForSwitch = party;
    party.OpenPartyScreenForBattleSwitch(reshow.CB2_SetUpReshowBattleScreenAfterMenu, {
      activeSlot, caseId,
    });
  });
}

/** Module party_menu capturé à l'ouverture du switch (import dynamique one-shot) —
 *  les exports `let` ESM sont des live bindings : WaitForMonSelection y lit l'état
 *  1:1 posé par TrySwitchInPokemon. */
let _partyModForSwitch: typeof import('./party_menu') | null = null;

/** 1:1 décomp `WaitForMonSelection` (battle_controller_player.c:1357-1373). Attend
 *  que le reshow soit terminé (équivalent L sync de `gMain.callback2 == BattleMainCB2`,
 *  via le flag `__battleReshowDone` posé par le reshow) ET le fade-in fini, puis :
 *    gPartyMenuUseExitCallback == TRUE → EmitChosenMonReturnValue(gSelectedMonPartyId)
 *    sinon (annulation)              → EmitChosenMonReturnValue(PARTY_SIZE)
 *  (LOT 7 : lit les globals 1:1 du party menu — plus de __battleSwitchResultSlot.) */
function _WaitForMonSelection(): void {
  const reshowDone = (globalThis as { __battleReshowDone?: boolean }).__battleReshowDone === true;
  if (!reshowDone || getRuntime()?.gPaletteFade?.active) return;
  let chosenMonId: number;
  if (_partyModForSwitch?.gPartyMenuUseExitCallback === true) {   // 1:1 :1361
    chosenMonId = _partyModForSwitch.gSelectedMonPartyId ?? 0;    // 1:1 :1362
    // L : l'engine (Cmd_switchhandleorder) lit `monToSwitchIntoId` → on le pose depuis
    // la sélection joueur (en plus de l'émission 1:1 ci-dessous).
    _setMonToSwitchIntoId(gActiveBattler, chosenMonId);
  } else {
    chosenMonId = _PARTY_SIZE;   // 1:1 :1364 annulation → PARTY_SIZE
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
  // LOT 7 : source canonique = state.gBattlerInMenuId (lue par switchInDeps →
  // TrySwitchInPokemon 1:1). L'ancien pont __battleMenu.gBattlerInMenuId n'avait
  // AUCUN lecteur (dual-source éliminée).
  setBattlerInMenuId(battler);
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
    // 1:1 décomp : receivedValue NÉGATIF = gain (la barre MONTE old->old+gained).
    // Fix user 2026-06-11 « pas de gain d exp sur la barre » : le positif la
    // faisait reculer/no-op. + PlaySE(SE_EXP=33) 1:1 (battle_controller_player.c:1215).
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxExpBarValue, oldExpInLevel, -expPoints);
    PlaySE(33 /* SE_EXP */);
    gBattlerControllerFuncs[gActiveBattler] = _CompleteOnExpBarDone;
  }
}

/** 1:1 décomp `MAX_LEVEL` = 100. */
const MAX_LEVEL_LOCAL = 100;

/** Helper : poll EXP bar anim done (= MoveBattleBar EXP_BAR === -1). */
function _CompleteOnExpBarDone(): void {
  const ret = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), EXP_BAR, 0);
  if (ret === -1) {
    // 1:1 décomp Task_UpdateLvlInHealthbox (battle_controller_player.c:1263) :
    // après la barre EXP, UpdateHealthboxAttribute(HEALTHBOX_ALL) recompose
    // niveau + PV + barre depuis la party — sans ça la box gardait l'ancien
    // niveau/PV après un level-up (verdict A/B « N.5 reste après lvl 6 »).
    const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler]];
    _UpdateHealthboxAttribute(_gHealthboxSpriteId(gActiveBattler), mon, 0 /* HEALTHBOX_ALL */);
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
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite || sprite.invisible === true) { PlayerBufferExecCompleted(); return; }
  _gDoingBattleAnim = true;
  sprite.data[1] = 0;
  // 1:1 DoHitAnimHealthboxEffect (pokeball.c) — goal T5 2026-06-10.
  // ⚠️ CAPTURER gActiveBattler AVANT l'import async : lu à la RÉSOLUTION de la
  // promesse (post-boucle CB1) il vaut toujours le DERNIER battler itéré →
  // la healthbox ENNEMIE secouait quel que soit le tapé (verdict A/B).
  const hitBattler = gActiveBattler;
  void import('./pokeball').then((m) => m.DoHitAnimHealthboxEffect?.(hitBattler)).catch(() => {});
  gBattlerControllerFuncs[gActiveBattler] = _DoHitAnimBlinkSpriteEffect;
}

/** 1:1 décomp `DoHitAnimBlinkSpriteEffect()` : toggle sprite.invisible tous les 4 frames sur 32
 *  frames (= 4 clignotements) puis restore visible + ExecCompleted. Tické par le controller tick. */
function _DoHitAnimBlinkSpriteEffect(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
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

/** 1:1 décomp `PlayerHandlePlayFanfareOrBGM()` (battle_controller_player.c:2882) :
 *  bufferA[3] → BattleStopLowHpSound + PlayBGM(songId) ; SINON → PlayFanfare(songId)
 *  (one-shot qui PAUSE le BGM et le REPREND à la fin — sound.c). L'ancien code
 *  jouait la fanfare via m4aSongNumStart = SUR le slot BGM → écrasait la fanfare
 *  de victoire sans jamais la reprendre (bug user 2026-06-12 « le SE de la barre
 *  d'exp ne remet pas le BGM » = la fanfare MUS_LEVEL_UP tuait MUS_VICTORY_WILD). */
function PlayerHandlePlayFanfareOrBGM(): void {
  const buf = gBattleBufferA[gActiveBattler];
  const songId = buf[1] | (buf[2] << 8);
  const isBGM = buf[3] !== 0;
  if (songId) {
    if (isBGM) {
      const m4a = (globalThis as Record<string, unknown>).__m4aSongNumStart as ((id: number, loop?: boolean) => void) | undefined;
      m4a?.(songId, true);
    } else {
      PlayFanfare(songId);
    }
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleFaintingCry()` (battle_controller_player.c:2925-2931) :
 *  PlayCry_ByMode(species, -25, CRY_MODE_FAINT). Le `if (species)` protège le
 *  moteur natif (PlayCryInternal fait `species--` → -1 sur species 0). */
function PlayerHandleFaintingCry(): void {
  const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler] ?? 0];
  const species = mon ? (GetMonData(mon as never, MON_DATA_SPECIES) as number) : 0;
  if (species) PlayCry_ByMode(species, -25, CRY_MODE_FAINT);
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
  const tr = rt && trainerId >= 0 ? rt.gSprites[trainerId] : null;
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
    const task = rt.gTasks[taskId];
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
  // 1:1 ll.3009-3018 : en DOUBLE non-multi, LE MÊME ball-throw envoie AUSSI le partenaire
  // (BATTLE_PARTNER). Le décomp n'émet le IntroTrainerBallThrow qu'à UN battler par côté —
  // battle_main.c BattleIntroPlayer1SendsOutMonAnimation:3799 ne passe à Player2 QUE si
  // BATTLE_TYPE_MULTI ; le flanc 2 est donc sorti ICI, par ce même task.
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && !(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    const partner = battler ^ 2;   // 1:1 l.3013 gActiveBattler ^= BIT_FLANK (BATTLE_PARTNER)
    setActiveBattler(partner);
    gBattleBufferA[partner][1] = gBattlerPartyIndexes[partner];   // 1:1 l.3014
    // 1:1 ll.3015-3016 BattleLoadPlayerMonSpriteGfx(partner) + StartSendOutAnim(partner, FALSE) :
    // crée le sprite du partenaire (back-pic, INVISIBLE via deferReveal) puis lance SA ball.
    // Load gfx ASYNC (plateforme L) → DoPokeballSendOutAnimation dans le .then quand le sprite
    // existe. ballAnimActive pré-posé SYNC (setBallAnimActive) : sinon _PlayerIntroSendOutWait
    // (phase 1) verrait ballAnimActive[partner]=false AVANT le throw et révélerait le mon trop
    // tôt — même garde que _StartSendOutAnim_Opponent (battle_controller_opponent.ts:650).
    setBattlerDeferReveal(partner, true);
    setBallAnimActive(partner, true);
    void _loadAndCreateBattlerMonSprite(partner, false).then(() => {
      const s2 = gActiveBattler;
      setActiveBattler(partner);
      DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT);
      setActiveBattler(s2);
    }).catch((e) => console.error('[Task_StartSendOutAnim partner]', e));
    setActiveBattler(battler);   // 1:1 l.3017 gActiveBattler ^= BIT_FLANK (retour à l'actif)
  }
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
      // 1:1 :310 : en DOUBLE non-multi, attend que LES DEUX balls du côté soient finies
      // (!ballAnimActive[active] && !ballAnimActive[partner]) avant de montrer les healthboxes.
      const isDouble = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0 && (gBattleTypeFlags & BATTLE_TYPE_MULTI) === 0;
      const partner = battler ^ 2;
      const ballsDone = isBallAnimActive(battler) === false && (!isDouble || isBallAnimActive(partner) === false);
      if (ballsDone) {
        setBattlerDeferReveal(battler, false);    // révèle le mon (émergé de la ball)
        // 1:1 :314-322 : en double non-multi, montre AUSSI le healthbox du partenaire
        // (BATTLE_PARTNER) — UpdateHealthboxAttribute + StartHealthboxSlideIn + SetVisible.
        if (isDouble) {
          setBattlerDeferReveal(partner, false);
          _ShowHealthboxOnSendOut(partner);
        }
        // 1:1 Intro_TryShinyAnimShowHealthbox : healthbox slide-in QUAND la ball est finie.
        _ShowHealthboxOnSendOut(battler);
        _sendOutHbFrames = 0;
        _sendOutPhase = 2;
      }
      break;
    }
    case 2: {  // 1:1 Intro_WaitForShinyAnimAndHealthbox : attend la fin du slide healthbox
      _sendOutHbFrames++;
      // 1:1 :236-238 (twoMons) : en double, le slide est fini quand LES DEUX healthboxes du
      // côté ont repris SpriteCallbackDummy (callback != SpriteCB_HealthboxSlideIn).
      const isDouble = (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0 && (gBattleTypeFlags & BATTLE_TYPE_MULTI) === 0;
      const hb = (globalThis as Record<string, unknown>).__battleHealthbox as { gHealthboxSpriteIds?: number[] } | undefined;
      const hbSlideDone = (b: number): boolean => {
        const id = hb?.gHealthboxSpriteIds?.[b] ?? -1;
        const spr = id >= 0 ? rt?.gSprites?.[id] : null;
        const nm = (spr?.callback as { name?: string } | null | undefined)?.name;
        return !spr || nm !== 'SpriteCB_HealthboxSlideIn';
      };
      const slideDone = hbSlideDone(battler) && (!isDouble || hbSlideDone(battler ^ 2));
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
  const spr = monId >= 0 ? getRuntime()?.gSprites[monId] : undefined;
  if (spr && (spr as { inUse?: boolean }).inUse) {   // ≈ IsBattlerSpritePresent (single)
    (spr as { invisible: boolean }).invisible = gBattleBufferA[gActiveBattler][1] !== 0;
    g.__battleGfxSfxUtil?.CopyBattleSpriteInvisibility?.(gActiveBattler);
  }
  PlayerBufferExecCompleted();
}

/** 1:1 décomp `PlayerHandleBattleAnimation()` (battle_controller_player.c:3083) :
 *  lance l'anim GÉNÉRALE (gBattleAnims_General[animationId], ex. B_ANIM_STATS_CHANGE)
 *  via TryHandleLaunchBattleTableAnimation — skippée → complete direct, sinon
 *  attend la fin (CompleteOnFinishedBattleAnimation). Était un STUB ExecCompleted
 *  → AUCUNE anim générale (stats ±, statuts board…) ne jouait côté joueur. */
function PlayerHandleBattleAnimation(): void {
  if (_IsBattleSEPlaying(gActiveBattler)) return;
  const buf = gBattleBufferA[gActiveBattler];
  const animationId = buf[1];
  const argument = buf[2] | (buf[3] << 8);
  const gfx = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as {
    TryHandleLaunchBattleTableAnimation?: (a: number, b: number, c: number, id: number, arg: number) => boolean;
    isAnimFromTableActive?: (b: number) => boolean;
  } | undefined;
  // 1:1 :3088 — atk/def = gActiveBattler ×3 (l'anim générale joue SUR le
  // battler affecté, pas sur l'attaquant du tour).
  const skipped = gfx?.TryHandleLaunchBattleTableAnimation?.(
    gActiveBattler, gActiveBattler, gActiveBattler, animationId, argument) ?? true;
  if (skipped) PlayerBufferExecCompleted();
  else gBattlerControllerFuncs[gActiveBattler] = PlayerCompleteOnFinishedBattleAnimation;
  // 1:1 :3093 BattleTv_SetDataBasedOnAnimation(animationId).
  void import('./battle_tv').then((m) => m.BattleTv_SetDataBasedOnAnimation(animationId));
}

/** 1:1 décomp `CompleteOnFinishedBattleAnimation()` (côté player) : attend la
 *  fin de l'anim de table (animFromTableActive retombe) puis complete. */
function PlayerCompleteOnFinishedBattleAnimation(): void {
  const gfx = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as {
    isAnimFromTableActive?: (b: number) => boolean;
  } | undefined;
  if (!gfx?.isAnimFromTableActive?.(gActiveBattler)) PlayerBufferExecCompleted();
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

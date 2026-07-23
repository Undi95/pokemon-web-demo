/**
 * move_relearner.ts — MIROIR 1:1 de `src/move_relearner.c` (le Maître des
 * Capacités : Fallarbor / rappel de capacités contre une Écaille Cœur).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/move_relearner.c`.
 *
 * ── Contenu ─────────────────────────────────────────────────────────────────
 * (A) La state-machine complète (DoMoveRelearnerMain + tous ses helpers,
 *     move_relearner.c:114-959), transcrite état-par-état 1:1.
 * (B) La FAMILLE fenêtres/liste du Move Relearner qui vit dans
 *     `menu_specialized.c` (InitMoveRelearnerWindows, LoadMoveRelearnerMovesList,
 *     MoveRelearner{Load,Menu}…Description, MoveRelearnerCursorCallback,
 *     MoveRelearnerPrintMessage, MoveRelearnerRunTextPrinters,
 *     MoveRelearnerCreateYesNoMenu + templates), co-localisée ici sur consigne
 *     (elle n'est consommée QUE par ce sous-système). Chaque bloc cite la ligne
 *     `menu_specialized.c` d'origine.
 * (C) MoveRelearnerShowHideHearts (move_relearner.c, exportée).
 *
 * `GetMoveRelearnerMoves` (la « liste ») est portée dans `pokemon.c`→`pokemon.ts`
 * (son foyer 1:1), et importée ici.
 *
 * ── Adaptations moteur (précédents cités) ───────────────────────────────────
 *  • Frame-kernel (RunTasks / AnimateSprites / BuildOamBuffer /
 *    DoScheduledBgTilemapCopiesToVram / UpdatePaletteFade + LoadOam /
 *    ProcessSpriteCopyRequests / TransferPlttBuffer) = AUTO-TICKÉ par le runtime
 *    (précédent prouvé : item_menu.ts MainCB2_BagMenuRun, pokemon_summary_screen
 *    MainCB2_SummaryRun). CB2_MoveRelearnerMain se contente d'appeler
 *    DoMoveRelearnerMain chaque frame.
 *  • gSpecialVar_0x8004 / 0x8005 = VarGet/VarSet(0x8004|0x8005) (précédent
 *    battle_factory.ts).
 *  • gFieldCallback = ... → globalThis (précédent overworld.ts / decoration.ts).
 *  • gTempScrollArrowTemplate (scratch global décomp) = copie locale de
 *    sMoveListScrollArrowsTemplate (net-effect identique).
 *  • SetBackdropFromColor (pas de foyer porté) = LoadPalette d'une couleur en
 *    index backdrop 0 (net-effect identique sous fade noir).
 *  • Données concours : move numérique → 'MOVE_X' (reverseDecompConstant) →
 *    getContestMove / getContestEffect (le modèle porté keye par enum string).
 *  • Assets ui_learn_move.png chargés via png-loader (public/decomp/em/ui/
 *    interface/ui_learn_move.png). Le gate HURLE en console si le chargement rate.
 *
 * ⚠️ Câblage restant (NON fait ici — specials-registry.ts VERROUILLÉ) :
 *   special TeachMoveRelearnerMove ; special de retour depuis l'écran résumé
 *   (CB2_InitLearnMoveReturnFromSelectMove est déjà pris en charge en interne
 *   via le callback passé à ShowSelectMovePokemonSummaryScreen). Voir la note du
 *   rapport pour la liste des specials à enregistrer.
 */

import { LoadPalette, ResetTasks, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { loadTileBin, extractPngPlte } from '../harness/gba/png-loader';
import { SetMainCallback2, SetVBlankCallback } from './main';
import {
  BeginNormalPaletteFade, gPaletteFade, PALETTES_ALL, BG_PLTT_ID,
} from './palette';
import { SetGpuReg } from './gpu_regs';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_BLDCNT,
  DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON,
  A_BUTTON, DPAD_LEFT, DPAD_RIGHT,
} from '../include/gba/io_reg';
import { RGB_BLACK } from '../include/gba/defines';
import {
  ResetVramOamAndBgCntRegs, ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates,
  ResetAllBgsCoordinates, ShowBg, ClearScheduledBgCopiesToVram, ScheduleBgCopyTilemapToVram,
  FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram, InitWindows, FreeAllWindowBuffers,
  COPYWIN_GFX, type BgTemplate, type WindowTemplate,
} from './window';
import {
  DrawStdFrameWithCustomTileAndPalette, AddTextPrinterParameterized2,
  GetPlayerTextSpeedDelay, CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
} from './menu';
import { MENU_B_PRESSED } from '../include/menu';
import {
  AddTextPrinterParameterized, DeactivateAllTextPrinters, RunTextPrinters,
  IsTextPrinterActive, gTextFlags, GetStringWidth,
} from './text';
import { GetStringCenterAlignXOffset, GetStringRightAlignXOffset } from './international_string_util';
import { LoadUserWindowBorderGfx } from './text_window';
import {
  ListMenuInit, ListMenu_ProcessInput, ListMenuGetScrollAndRow, DestroyListMenuTask,
  AddScrollIndicatorArrowPair, RemoveScrollIndicatorArrowPair, gMultiuseListMenuTemplate,
  SCROLL_ARROW_LEFT, SCROLL_ARROW_RIGHT, SCROLL_ARROW_UP, SCROLL_ARROW_DOWN,
  LIST_NOTHING_CHOSEN, LIST_CANCEL,
  type ScrollArrowsTemplate, type ListMenuItem,
} from './list_menu';
import {
  CreateSprite, StartSpriteAnim as _StartSpriteAnim, gSprites, LoadSpriteSheet, LoadSpritePalette,
  ResetSpriteData, ANIMCMD_FRAME, ANIMCMD_END, gDummySpriteAffineAnimTable,
  FreeAllSpritePalettes, PLTT_SIZE_4BPP, type AnimCmd,
} from './sprite';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
// StartSpriteAnim : wrapper local (DecompSprite.anims `unknown[][]` vs AnimDispatchSprite
// `AnimCmd[][]` → cast `as never`, précédent rayquaza_scene.ts:80). Call-sites 1:1.
function StartSpriteAnim(sprite: DecompSprite, animNum: number): void {
  _StartSpriteAnim(sprite as never, animNum);
}
import { PlaySE, JOY_NEW } from './battle_controllers';
import { GetLRKeysPressed } from './menu_helpers';
import { PlayFanfare, IsFanfareTaskInactive } from './sound';
import { MUS_LEVEL_UP, SE_SELECT } from '../include/constants/songs';
import {
  StringExpandPlaceholders, StringCopy, StringCopy_Nickname, ConvertIntToDecimalStringN,
  STR_CONV_MODE_LEFT_ALIGN, gStringVar1, gStringVar2, gStringVar3, gStringVar4,
} from '../include/string_util';
import { getString } from '../harness/runtime/decomp-strings';
import {
  gPlayerParty, gPlayerPartyCount, GetMonData, GiveMoveToMon, SetMonMoveSlot,
  RemoveMonPPBonus, GetMoveRelearnerMoves, type Pokemon,
} from './pokemon';
import {
  MON_DATA_MOVE1, MON_DATA_NICKNAME,
} from '../include/pokemon';
import { MON_HAS_MAX_MOVES } from '../include/constants/pokemon';
import { MAX_MON_MOVES } from '../include/constants/global';
import { ShowSelectMovePokemonSummaryScreen } from './pokemon_summary_screen';
import {
  gMoveNames, gMoveDescriptions, gBattleMoves,
  getContestMove, getContestEffect, getContestEffectDescription,
} from './engine/data/game-data';
import { LockPlayerFieldControls } from './script';
import { FieldCB_ContinueScriptHandleMusic } from './field_screen_effect';
// 1:1 CB2_ReturnToField : foyer porté = CB2_ReturnToField_Manual (overworld.ts).
import { CB2_ReturnToField_Manual as CB2_ReturnToField } from './overworld';
import { encodeOwText } from './text';
import { VarGet, VarSet } from './event_data';
import { CreateTask, DestroyTask } from './task';
import { TASK_NONE } from '../include/task';
import { reverseDecompConstant, resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { sContestNames } from './contest_strings';

// ─── Constantes de fontes (1:1 include/constants/... — cf. shop.ts) ──────────
const FONT_NORMAL = 1;
const FONT_NARROW = 7;
const TEXT_SKIP_DRAW = 0xFF;

// ─── États (1:1 move_relearner.c:114-143) ────────────────────────────────────
const MENU_STATE_FADE_TO_BLACK = 0;
const MENU_STATE_WAIT_FOR_FADE = 1;
const MENU_STATE_UNREACHABLE = 2;
const MENU_STATE_SETUP_BATTLE_MODE = 3;
const MENU_STATE_IDLE_BATTLE_MODE = 4;
const MENU_STATE_SETUP_CONTEST_MODE = 5;
const MENU_STATE_IDLE_CONTEST_MODE = 6;
const MENU_STATE_PRINT_TEACH_MOVE_PROMPT = 8;
const MENU_STATE_TEACH_MOVE_CONFIRM = 9;
const MENU_STATE_PRINT_GIVE_UP_PROMPT = 12;
const MENU_STATE_GIVE_UP_CONFIRM = 13;
const MENU_STATE_FADE_AND_RETURN = 14;
const MENU_STATE_RETURN_TO_FIELD = 15;
const MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT = 16;
const MENU_STATE_WAIT_FOR_TRYING_TO_LEARN = 17;
const MENU_STATE_CONFIRM_DELETE_OLD_MOVE = 18;
const MENU_STATE_PRINT_WHICH_MOVE_PROMPT = 19;
const MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN = 20;
const MENU_STATE_PRINT_STOP_TEACHING = 24;
const MENU_STATE_WAIT_FOR_STOP_TEACHING = 25;
const MENU_STATE_CONFIRM_STOP_TEACHING = 26;
const MENU_STATE_CHOOSE_SETUP_STATE = 27;
const MENU_STATE_FADE_FROM_SUMMARY_SCREEN = 28;
const MENU_STATE_TRY_OVERWRITE_MOVE = 29;
const MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE = 30;
const MENU_STATE_PRINT_TEXT_THEN_FANFARE = 31;
const MENU_STATE_WAIT_FOR_FANFARE = 32;
const MENU_STATE_WAIT_FOR_A_BUTTON = 33;

// 1:1 move_relearner.c:146-151 — versions des cœurs (sélectionnées par anim).
const APPEAL_HEART_EMPTY = 0;
const APPEAL_HEART_FULL = 1;
const JAM_HEART_EMPTY = 2;
const JAM_HEART_FULL = 3;

const TAG_MODE_ARROWS = 5325;
const TAG_LIST_ARROWS = 5425;
const GFXTAG_UI = 5525;
const PALTAG_UI = 5526;

// 1:1 move_relearner.c:158 : max(MAX_LEVEL_UP_MOVES, 25). MAX_LEVEL_UP_MOVES=20 → 25.
const MAX_RELEARNER_MOVES = 25;

// ─── Fenêtres du Move Relearner (1:1 menu_specialized.h) ─────────────────────
const RELEARNERWIN_DESC_BATTLE = 0;
const RELEARNERWIN_DESC_CONTEST = 1;
const RELEARNERWIN_MOVE_LIST = 2;
const RELEARNERWIN_MSG = 3;
// RELEARNERWIN_YESNO = 4 (inutilisé, cf. menu_specialized.c).

const MON_DATA_MOVE = MON_DATA_MOVE1; // alias local

// ─── EWRAM structs (1:1 move_relearner.c:160-186) ────────────────────────────
interface MoveRelearnerStruct {
  state: number;
  heartSpriteIds: number[];   // [16]
  movesToLearn: number[];     // [MAX_RELEARNER_MOVES]
  partyMon: number;
  moveSlot: number;
  menuItems: ListMenuItem[];  // [MAX_RELEARNER_MOVES]
  numMenuChoices: number;
  numToShowAtOnce: number;
  moveListMenuTask: number;
  moveListScrollArrowTask: number;
  moveDisplayArrowTask: number;
  scrollOffset: number;
}

let sMoveRelearnerStruct: MoveRelearnerStruct | null = null;

const sMoveRelearnerMenuState = {
  listOffset: 0,
  listRow: 0,
  showContestInfo: false,
};

// ─── Assets ui_learn_move.png (INCGFX_U16/U8 dans le C) ──────────────────────
let sUI_Tiles: Uint8Array | null = null;   // 1:1 sUI_Tiles (.4bpp)
let sUI_Pal: Uint16Array | null = null;     // 1:1 sUI_Pal (.gbapal)

/** Charge la spritesheet + palette du Move Relearner. Le gate HURLE si ça rate
 *  (Règle 3 : jamais un chargement silencieux). Lancé fire-and-forget au moment
 *  de TeachMoveRelearnerMove (le fade dure 16 frames → assets prêts à l'init). */
async function preloadMoveRelearnerAssets(): Promise<void> {
  if (sUI_Tiles && sUI_Pal) return;
  const url = '/decomp/em/ui/interface/ui_learn_move.png';
  sUI_Tiles = await loadTileBin(url, 4);
  const pal = await extractPngPlte(url);
  if (!pal) {
    console.error('[move_relearner] extractPngPlte a renvoyé null pour', url);
    sUI_Pal = new Uint16Array(16);
    return;
  }
  sUI_Pal = pal;
}

// ─── OAM des cœurs (1:1 move_relearner.c:189-206 sHeartSpriteOamData 8x8) ─────
const sHeartSpriteOamData = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0, x: 0, matrixNum: 0, size: 0, tileNum: 0,
  priority: 0, paletteNum: 0, affineParam: 0,
};
// sUnusedOam1/sUnusedOam2 (move_relearner.c:208-244) omis (jamais référencés).

// ─── SpriteSheet / SpritePalette (1:1 move_relearner.c:246-256) ──────────────
function sMoveRelearnerSpriteSheet(): { data: Uint8Array; size: number; tag: number } {
  const data = sUI_Tiles ?? new Uint8Array(0);
  return { data, size: data.length, tag: GFXTAG_UI };
}
function sMoveRelearnerPalette(): { data: Uint16Array; tag: number } {
  return { data: sUI_Pal ?? new Uint16Array(16), tag: PALTAG_UI };
}

// ─── ScrollArrowsTemplates (1:1 move_relearner.c:258-286) ────────────────────
const sDisplayModeArrowsTemplate: ScrollArrowsTemplate = {
  firstArrowType: SCROLL_ARROW_LEFT,
  firstX: 27, firstY: 16,
  secondArrowType: SCROLL_ARROW_RIGHT,
  secondX: 117, secondY: 16,
  fullyUpThreshold: -1, fullyDownThreshold: -1,
  tileTag: TAG_MODE_ARROWS, palTag: TAG_MODE_ARROWS, palNum: 0,
};

const sMoveListScrollArrowsTemplate: ScrollArrowsTemplate = {
  firstArrowType: SCROLL_ARROW_UP,
  firstX: 192, firstY: 8,
  secondArrowType: SCROLL_ARROW_DOWN,
  secondX: 192, secondY: 104,
  fullyUpThreshold: 0, fullyDownThreshold: 0,
  tileTag: TAG_LIST_ARROWS, palTag: TAG_LIST_ARROWS, palNum: 0,
};

// ─── Anims des cœurs (1:1 move_relearner.c:288-323) ──────────────────────────
const sHeartSprite_AppealEmptyFrame: AnimCmd[] = [ANIMCMD_FRAME(8, 5), ANIMCMD_END];
const sHeartSprite_AppealFullFrame: AnimCmd[] = [ANIMCMD_FRAME(9, 5), ANIMCMD_END];
const sHeartSprite_JamEmptyFrame: AnimCmd[] = [ANIMCMD_FRAME(10, 5), ANIMCMD_END];
const sHeartSprite_JamFullFrame: AnimCmd[] = [ANIMCMD_FRAME(11, 5), ANIMCMD_END];
const sHeartSpriteAnimationCommands: AnimCmd[][] = [];
sHeartSpriteAnimationCommands[APPEAL_HEART_EMPTY] = sHeartSprite_AppealEmptyFrame;
sHeartSpriteAnimationCommands[APPEAL_HEART_FULL] = sHeartSprite_AppealFullFrame;
sHeartSpriteAnimationCommands[JAM_HEART_EMPTY] = sHeartSprite_JamEmptyFrame;
sHeartSpriteAnimationCommands[JAM_HEART_FULL] = sHeartSprite_JamFullFrame;

// 1:1 move_relearner.c:325-334 — sConstestMoveHeartSprite (sic).
function sConstestMoveHeartSprite() {
  return {
    tileTag: GFXTAG_UI,
    paletteTag: PALTAG_UI,
    oam: sHeartSpriteOamData,
    anims: sHeartSpriteAnimationCommands,
    images: null as unknown,
    affineAnims: gDummySpriteAffineAnimTable,
    callback: SpriteCallbackDummy,
  };
}

// ─── BgTemplates (1:1 move_relearner.c:336-359) ──────────────────────────────
const sMoveRelearnerMenuBackgroundTemplates: BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
];

// ─── Helper backdrop (adaptation, cf. en-tête) ───────────────────────────────
function SetBackdropFromColor(color: number): void {
  LoadPalette(new Uint16Array([color]), 0, 2);
}

// ─── VBlankCB (1:1 move_relearner.c:375-380 — transferts auto-tickés) ────────
function VBlankCB_MoveRelearner(): void { /* LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer auto */ }

// 1:1 move_relearner.c:383-388 — TeachMoveRelearnerMove (Pokémon à enseigner = VAR_0x8004).
export function TeachMoveRelearnerMove(): void {
  LockPlayerFieldControls();
  // Précharge les assets pendant le fade (gate hurlant).
  preloadMoveRelearnerAssets().catch((e) => console.error('[move_relearner] preload assets:', e));
  CreateTask(Task_WaitForFadeOut, 10);
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
}

// 1:1 move_relearner.c:390-398
function Task_WaitForFadeOut(taskId: number): void {
  if (!gPaletteFade.active) {
    SetMainCallback2(CB2_InitLearnMove);
    (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScriptHandleMusic;
    DestroyTask(taskId);
  }
}

// 1:1 move_relearner.c:400-427
function CB2_InitLearnMove(): void {
  ResetSpriteData();
  FreeAllSpritePalettes();
  ResetTasks();
  ClearScheduledBgCopiesToVram();
  sMoveRelearnerStruct = allocZeroedStruct();
  sMoveRelearnerStruct.partyMon = VarGet(0x8004);
  SetVBlankCallback(VBlankCB_MoveRelearner);

  InitMoveRelearnerBackgroundLayers();
  InitMoveRelearnerWindows(false);

  sMoveRelearnerMenuState.listOffset = 0;
  sMoveRelearnerMenuState.listRow = 0;
  sMoveRelearnerMenuState.showContestInfo = false;

  CreateLearnableMovesList();

  LoadSpriteSheet(sMoveRelearnerSpriteSheet());
  LoadSpritePalette(sMoveRelearnerPalette());
  CreateUISprites();

  sMoveRelearnerStruct.moveListMenuTask = ListMenuInit(gMultiuseListMenuTemplate, sMoveRelearnerMenuState.listOffset, sMoveRelearnerMenuState.listRow);
  SetBackdropFromColor(RGB_BLACK);
  SetMainCallback2(CB2_MoveRelearnerMain);
}

// 1:1 move_relearner.c:429-451
function CB2_InitLearnMoveReturnFromSelectMove(): void {
  ResetSpriteData();
  FreeAllSpritePalettes();
  ResetTasks();
  ClearScheduledBgCopiesToVram();
  sMoveRelearnerStruct = allocZeroedStruct();
  sMoveRelearnerStruct.state = MENU_STATE_FADE_FROM_SUMMARY_SCREEN;
  sMoveRelearnerStruct.partyMon = VarGet(0x8004);
  sMoveRelearnerStruct.moveSlot = VarGet(0x8005);
  SetVBlankCallback(VBlankCB_MoveRelearner);

  InitMoveRelearnerBackgroundLayers();
  InitMoveRelearnerWindows(sMoveRelearnerMenuState.showContestInfo);
  CreateLearnableMovesList();

  LoadSpriteSheet(sMoveRelearnerSpriteSheet());
  LoadSpritePalette(sMoveRelearnerPalette());
  CreateUISprites();

  sMoveRelearnerStruct.moveListMenuTask = ListMenuInit(gMultiuseListMenuTemplate, sMoveRelearnerMenuState.listOffset, sMoveRelearnerMenuState.listRow);
  SetBackdropFromColor(RGB_BLACK);
  SetMainCallback2(CB2_MoveRelearnerMain);
}

function allocZeroedStruct(): MoveRelearnerStruct {
  return {
    state: 0,
    heartSpriteIds: new Array(16).fill(0),
    movesToLearn: new Array(MAX_RELEARNER_MOVES).fill(0),
    partyMon: 0,
    moveSlot: 0,
    menuItems: [],
    numMenuChoices: 0,
    numToShowAtOnce: 0,
    moveListMenuTask: 0,
    moveListScrollArrowTask: TASK_NONE,
    moveDisplayArrowTask: TASK_NONE,
    scrollOffset: 0,
  };
}

// 1:1 move_relearner.c:453-466
function InitMoveRelearnerBackgroundLayers(): void {
  ResetVramOamAndBgCntRegs();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sMoveRelearnerMenuBackgroundTemplates, sMoveRelearnerMenuBackgroundTemplates.length);
  ResetAllBgsCoordinates();
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
  ShowBg(0);
  ShowBg(1);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
}

// 1:1 move_relearner.c:468-476 — le frame-kernel est auto-tické (cf. en-tête).
function CB2_MoveRelearnerMain(): void {
  DoMoveRelearnerMain();
}

// 1:1 move_relearner.c:478-482
function PrintMessageWithPlaceholders(src: string): void {
  StringExpandPlaceholders(gStringVar4, src);
  MoveRelearnerPrintMessage(gStringVar4);
}

// 1:1 move_relearner.c:484-703 — DoMoveRelearnerMain (state machine).
function DoMoveRelearnerMain(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  switch (s.state) {
    case MENU_STATE_FADE_TO_BLACK:
      s.state++;
      HideHeartSpritesAndShowTeachMoveText(false);
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      break;
    case MENU_STATE_WAIT_FOR_FADE:
      if (!gPaletteFade.active)
        s.state = MENU_STATE_IDLE_BATTLE_MODE;
      break;
    case MENU_STATE_UNREACHABLE:
      s.state++;
      break;
    case MENU_STATE_SETUP_BATTLE_MODE:
      HideHeartSpritesAndShowTeachMoveText(false);
      s.state++;
      AddScrollArrows();
      break;
    case MENU_STATE_IDLE_BATTLE_MODE:
      HandleInput(false);
      break;
    case MENU_STATE_SETUP_CONTEST_MODE:
      ShowTeachMoveText(false);
      s.state++;
      AddScrollArrows();
      break;
    case MENU_STATE_IDLE_CONTEST_MODE:
      HandleInput(true);
      break;
    case MENU_STATE_PRINT_TEACH_MOVE_PROMPT:
      if (!MoveRelearnerRunTextPrinters()) {
        MoveRelearnerCreateYesNoMenu();
        s.state++;
      }
      break;
    case MENU_STATE_TEACH_MOVE_CONFIRM: {
      const selection = Menu_ProcessInputNoWrapClearOnChoose();
      if (selection === 0) {
        if (GiveMoveToMon(gPlayerParty[s.partyMon], GetCurrentSelectedMove()) !== MON_HAS_MAX_MOVES) {
          PrintMessageWithPlaceholders(getString('gText_MoveRelearnerPkmnLearnedMove'));
          VarSet(0x8004, 1); // TRUE
          s.state = MENU_STATE_PRINT_TEXT_THEN_FANFARE;
        } else {
          s.state = MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT;
        }
      } else if (selection === MENU_B_PRESSED || selection === 1) {
        if (sMoveRelearnerMenuState.showContestInfo === false)
          s.state = MENU_STATE_SETUP_BATTLE_MODE;
        else if (sMoveRelearnerMenuState.showContestInfo === true)
          s.state = MENU_STATE_SETUP_CONTEST_MODE;
      }
      break;
    }
    case MENU_STATE_PRINT_GIVE_UP_PROMPT:
      if (!MoveRelearnerRunTextPrinters()) {
        MoveRelearnerCreateYesNoMenu();
        s.state++;
      }
      break;
    case MENU_STATE_GIVE_UP_CONFIRM: {
      const selection = Menu_ProcessInputNoWrapClearOnChoose();
      if (selection === 0) {
        VarSet(0x8004, 0); // FALSE
        s.state = MENU_STATE_FADE_AND_RETURN;
      } else if (selection === MENU_B_PRESSED || selection === 1) {
        if (sMoveRelearnerMenuState.showContestInfo === false)
          s.state = MENU_STATE_SETUP_BATTLE_MODE;
        else if (sMoveRelearnerMenuState.showContestInfo === true)
          s.state = MENU_STATE_SETUP_CONTEST_MODE;
      }
      break;
    }
    case MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT:
      PrintMessageWithPlaceholders(getString('gText_MoveRelearnerPkmnTryingToLearnMove'));
      s.state++;
      break;
    case MENU_STATE_WAIT_FOR_TRYING_TO_LEARN:
      if (!MoveRelearnerRunTextPrinters()) {
        MoveRelearnerCreateYesNoMenu();
        s.state = MENU_STATE_CONFIRM_DELETE_OLD_MOVE;
      }
      break;
    case MENU_STATE_CONFIRM_DELETE_OLD_MOVE: {
      const selection = Menu_ProcessInputNoWrapClearOnChoose();
      if (selection === 0) {
        PrintMessageWithPlaceholders(getString('gText_MoveRelearnerWhichMoveToForget'));
        s.state = MENU_STATE_PRINT_WHICH_MOVE_PROMPT;
      } else if (selection === MENU_B_PRESSED || selection === 1) {
        s.state = MENU_STATE_PRINT_STOP_TEACHING;
      }
      break;
    }
    case MENU_STATE_PRINT_STOP_TEACHING:
      StringCopy(gStringVar2, encodeOwText(gMoveNames[GetCurrentSelectedMove()]));
      PrintMessageWithPlaceholders(getString('gText_MoveRelearnerStopTryingToTeachMove'));
      s.state++;
      break;
    case MENU_STATE_WAIT_FOR_STOP_TEACHING:
      if (!MoveRelearnerRunTextPrinters()) {
        MoveRelearnerCreateYesNoMenu();
        s.state++;
      }
      break;
    case MENU_STATE_CONFIRM_STOP_TEACHING: {
      const selection = Menu_ProcessInputNoWrapClearOnChoose();
      if (selection === 0) {
        s.state = MENU_STATE_CHOOSE_SETUP_STATE;
      } else if (selection === MENU_B_PRESSED || selection === 1) {
        // 1:1 : quel intérêt ? repassé à PRINT_TRYING_TO_LEARN_PROMPT juste après.
        if (sMoveRelearnerMenuState.showContestInfo === false)
          s.state = MENU_STATE_SETUP_BATTLE_MODE;
        else if (sMoveRelearnerMenuState.showContestInfo === true)
          s.state = MENU_STATE_SETUP_CONTEST_MODE;
        s.state = MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT;
      }
      break;
    }
    case MENU_STATE_CHOOSE_SETUP_STATE:
      if (!MoveRelearnerRunTextPrinters()) {
        FillWindowPixelBuffer(RELEARNERWIN_MSG, 0x11);
        if (sMoveRelearnerMenuState.showContestInfo === false)
          s.state = MENU_STATE_SETUP_BATTLE_MODE;
        else if (sMoveRelearnerMenuState.showContestInfo === true)
          s.state = MENU_STATE_SETUP_CONTEST_MODE;
      }
      break;
    case MENU_STATE_PRINT_WHICH_MOVE_PROMPT:
      if (!MoveRelearnerRunTextPrinters()) {
        s.state = MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN;
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      }
      break;
    case MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN:
      if (!gPaletteFade.active) {
        ShowSelectMovePokemonSummaryScreen(
          gPlayerParty, s.partyMon, gPlayerPartyCount - 1,
          CB2_InitLearnMoveReturnFromSelectMove,
          reverseDecompConstant(GetCurrentSelectedMove(), 'MOVE_') ?? 'MOVE_NONE',
        );
        FreeMoveRelearnerResources();
      }
      break;
    case 21:
      if (!MoveRelearnerRunTextPrinters())
        s.state = MENU_STATE_FADE_AND_RETURN;
      break;
    case 22:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      break;
    case MENU_STATE_FADE_AND_RETURN:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      s.state++;
      break;
    case MENU_STATE_RETURN_TO_FIELD:
      if (!gPaletteFade.active) {
        FreeMoveRelearnerResources();
        SetMainCallback2(CB2_ReturnToField);
      }
      break;
    case MENU_STATE_FADE_FROM_SUMMARY_SCREEN:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      s.state++;
      if (sMoveRelearnerMenuState.showContestInfo === false)
        HideHeartSpritesAndShowTeachMoveText(true);
      else if (sMoveRelearnerMenuState.showContestInfo === true)
        ShowTeachMoveText(true);
      RemoveScrollArrows();
      CopyWindowToVram(RELEARNERWIN_MSG, COPYWIN_GFX);
      break;
    case MENU_STATE_TRY_OVERWRITE_MOVE:
      if (!gPaletteFade.active) {
        if (s.moveSlot === MAX_MON_MOVES) {
          s.state = MENU_STATE_PRINT_STOP_TEACHING;
        } else {
          const move = GetMonData(gPlayerParty[s.partyMon], MON_DATA_MOVE + s.moveSlot) as number;
          StringCopy(gStringVar3, encodeOwText(gMoveNames[move]));
          RemoveMonPPBonus(gPlayerParty[s.partyMon], s.moveSlot);
          SetMonMoveSlot(gPlayerParty[s.partyMon], GetCurrentSelectedMove(), s.moveSlot);
          StringCopy(gStringVar2, encodeOwText(gMoveNames[GetCurrentSelectedMove()]));
          PrintMessageWithPlaceholders(getString('gText_MoveRelearnerAndPoof'));
          s.state = MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE;
          VarSet(0x8004, 1); // TRUE
        }
      }
      break;
    case MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE:
      if (!MoveRelearnerRunTextPrinters()) {
        PrintMessageWithPlaceholders(getString('gText_MoveRelearnerPkmnForgotMoveAndLearnedNew'));
        s.state = MENU_STATE_PRINT_TEXT_THEN_FANFARE;
        PlayFanfare(MUS_LEVEL_UP);
      }
      break;
    case MENU_STATE_PRINT_TEXT_THEN_FANFARE:
      if (!MoveRelearnerRunTextPrinters()) {
        PlayFanfare(MUS_LEVEL_UP);
        s.state = MENU_STATE_WAIT_FOR_FANFARE;
      }
      break;
    case MENU_STATE_WAIT_FOR_FANFARE:
      if (IsFanfareTaskInactive())
        s.state = MENU_STATE_WAIT_FOR_A_BUTTON;
      break;
    case MENU_STATE_WAIT_FOR_A_BUTTON:
      if (JOY_NEW(A_BUTTON)) {
        PlaySE(SE_SELECT);
        s.state = MENU_STATE_FADE_AND_RETURN;
      }
      break;
  }
}

// 1:1 move_relearner.c:705-714
function FreeMoveRelearnerResources(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  RemoveScrollArrows();
  // 1:1 DestroyListMenuTask(task, &listOffset, &listRow) : le port renvoie {scrollOffset, selectedRow}.
  {
    const r = DestroyListMenuTask(s.moveListMenuTask);
    sMoveRelearnerMenuState.listOffset = r.scrollOffset;
    sMoveRelearnerMenuState.listRow = r.selectedRow;
  }
  FreeAllWindowBuffers();
  sMoveRelearnerStruct = null; // FREE_AND_SET_NULL
  ResetSpriteData();
  FreeAllSpritePalettes();
}

// 1:1 move_relearner.c:716-732
function HideHeartSpritesAndShowTeachMoveText(onlyHideSprites: boolean): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  for (let i = 0; i < 16; i++)
    gSprites[s.heartSpriteIds[i]]!.invisible = true;

  if (!onlyHideSprites) {
    StringExpandPlaceholders(gStringVar4, getString('gText_TeachWhichMoveToPkmn'));
    FillWindowPixelBuffer(RELEARNERWIN_MSG, 0x11);
    AddTextPrinterParameterized(RELEARNERWIN_MSG, FONT_NORMAL, gStringVar4, 0, 1, 0, null);
  }
}

// 1:1 move_relearner.c:734-778
function HandleInput(showContest: boolean): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  const itemId = ListMenu_ProcessInput(s.moveListMenuTask);
  // 1:1 ListMenuGetScrollAndRow(task, &listOffset, &listRow) : le port renvoie l'objet.
  {
    const r = ListMenuGetScrollAndRow(s.moveListMenuTask);
    sMoveRelearnerMenuState.listOffset = r.scrollOffset;
    sMoveRelearnerMenuState.listRow = r.selectedRow;
  }

  switch (itemId) {
    case LIST_NOTHING_CHOSEN:
      if (!(JOY_NEW(DPAD_LEFT | DPAD_RIGHT)) && !GetLRKeysPressed())
        break;
      PlaySE(SE_SELECT);
      if (showContest === false) {
        PutWindowTilemap(RELEARNERWIN_DESC_CONTEST);
        s.state = MENU_STATE_SETUP_CONTEST_MODE;
        sMoveRelearnerMenuState.showContestInfo = true;
      } else {
        PutWindowTilemap(RELEARNERWIN_DESC_BATTLE);
        s.state = MENU_STATE_SETUP_BATTLE_MODE;
        sMoveRelearnerMenuState.showContestInfo = false;
      }
      ScheduleBgCopyTilemapToVram(1);
      MoveRelearnerShowHideHearts(GetCurrentSelectedMove());
      break;
    case LIST_CANCEL:
      PlaySE(SE_SELECT);
      RemoveScrollArrows();
      s.state = MENU_STATE_PRINT_GIVE_UP_PROMPT;
      StringExpandPlaceholders(gStringVar4, getString('gText_MoveRelearnerGiveUp'));
      MoveRelearnerPrintMessage(gStringVar4);
      break;
    default:
      PlaySE(SE_SELECT);
      RemoveScrollArrows();
      s.state = MENU_STATE_PRINT_TEACH_MOVE_PROMPT;
      StringCopy(gStringVar2, encodeOwText(gMoveNames[itemId]));
      StringExpandPlaceholders(gStringVar4, getString('gText_MoveRelearnerTeachMoveConfirm'));
      MoveRelearnerPrintMessage(gStringVar4);
      break;
  }
}

// 1:1 move_relearner.c:780-783
function GetCurrentSelectedMove(): number {
  const s = sMoveRelearnerStruct!;
  return s.menuItems[sMoveRelearnerMenuState.listRow + sMoveRelearnerMenuState.listOffset].id as number;
}

// 1:1 move_relearner.c:794-802
function ShowTeachMoveText(shouldDoNothingInstead: boolean): void {
  if (shouldDoNothingInstead === false) {
    StringExpandPlaceholders(gStringVar4, getString('gText_TeachWhichMoveToPkmn'));
    FillWindowPixelBuffer(RELEARNERWIN_MSG, 0x11);
    AddTextPrinterParameterized(RELEARNERWIN_MSG, FONT_NORMAL, gStringVar4, 0, 1, 0, null);
  }
}

// 1:1 move_relearner.c:804-829
function CreateUISprites(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  s.moveDisplayArrowTask = TASK_NONE;
  s.moveListScrollArrowTask = TASK_NONE;
  AddScrollArrows();

  // Cœurs "appeal".
  for (let i = 0; i < 8; i++)
    s.heartSpriteIds[i] = CreateSprite(sConstestMoveHeartSprite(), (i - Math.floor(i / 4) * 4) * 8 + 104, Math.floor(i / 4) * 8 + 36, 0);

  // Cœurs "jam" (l'anim bascule plein/vide).
  for (let i = 0; i < 8; i++) {
    s.heartSpriteIds[i + 8] = CreateSprite(sConstestMoveHeartSprite(), (i - Math.floor(i / 4) * 4) * 8 + 104, Math.floor(i / 4) * 8 + 52, 0);
    StartSpriteAnim(gSprites[s.heartSpriteIds[i + 8]]!, 2);
  }

  for (let i = 0; i < 16; i++)
    gSprites[s.heartSpriteIds[i]]!.invisible = true;
}

// 1:1 move_relearner.c:831-843
function AddScrollArrows(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  if (s.moveDisplayArrowTask === TASK_NONE)
    s.moveDisplayArrowTask = AddScrollIndicatorArrowPair(sDisplayModeArrowsTemplate, () => s.scrollOffset);

  if (s.moveListScrollArrowTask === TASK_NONE) {
    // 1:1 : gTempScrollArrowTemplate = sMoveListScrollArrowsTemplate ; tweak
    // fullyDownThreshold. Scratch global → copie locale (net-effect identique).
    const tmpl: ScrollArrowsTemplate = { ...sMoveListScrollArrowsTemplate };
    tmpl.fullyDownThreshold = s.numMenuChoices - s.numToShowAtOnce;
    s.moveListScrollArrowTask = AddScrollIndicatorArrowPair(tmpl, () => sMoveRelearnerMenuState.listOffset);
  }
}

// 1:1 move_relearner.c:845-857
function RemoveScrollArrows(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;
  if (s.moveDisplayArrowTask !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(s.moveDisplayArrowTask);
    s.moveDisplayArrowTask = TASK_NONE;
  }
  if (s.moveListScrollArrowTask !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(s.moveListScrollArrowTask);
    s.moveListScrollArrowTask = TASK_NONE;
  }
}

// 1:1 move_relearner.c:859-880
function CreateLearnableMovesList(): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;

  s.numMenuChoices = GetMoveRelearnerMoves(gPlayerParty[s.partyMon], s.movesToLearn);

  for (let i = 0; i < s.numMenuChoices; i++) {
    s.menuItems[i] = {
      name: gMoveNames[s.movesToLearn[i]],
      id: s.movesToLearn[i],
    };
  }

  const nickname = GetMonData(gPlayerParty[s.partyMon], MON_DATA_NICKNAME) as Uint8Array | string;
  StringCopy_Nickname(gStringVar1, nickname as Uint8Array);
  s.menuItems[s.numMenuChoices] = { name: getString('gText_Cancel'), id: LIST_CANCEL };
  s.numMenuChoices++;
  s.numToShowAtOnce = LoadMoveRelearnerMovesList(s.menuItems, s.numMenuChoices);
}

// 1:1 move_relearner.c:882-931 — MoveRelearnerShowHideHearts (exportée).
export function MoveRelearnerShowHideHearts(move: number): void {
  const s = sMoveRelearnerStruct;
  if (!s) return;

  if (!sMoveRelearnerMenuState.showContestInfo || move === LIST_CANCEL) {
    for (let i = 0; i < 16; i++)
      gSprites[s.heartSpriteIds[i]]!.invisible = true;
  } else {
    const moveEnum = reverseDecompConstant(move, 'MOVE_') ?? 'MOVE_NONE';
    const contestMove = getContestMove(moveEnum);
    const effect = contestMove ? getContestEffect(contestMove.effect) : undefined;

    let numHearts = (Math.trunc((effect?.appeal ?? 0) / 10)) & 0xFF;
    if (numHearts === 0xFF) numHearts = 0;
    for (let i = 0; i < 8; i++) {
      if (i < numHearts)
        StartSpriteAnim(gSprites[s.heartSpriteIds[i]]!, 1);
      else
        StartSpriteAnim(gSprites[s.heartSpriteIds[i]]!, 0);
      gSprites[s.heartSpriteIds[i]]!.invisible = false;
    }

    numHearts = (Math.trunc((effect?.jam ?? 0) / 10)) & 0xFF;
    if (numHearts === 0xFF) numHearts = 0;
    for (let i = 0; i < 8; i++) {
      if (i < numHearts)
        StartSpriteAnim(gSprites[s.heartSpriteIds[i + 8]]!, 3);
      else
        StartSpriteAnim(gSprites[s.heartSpriteIds[i + 8]]!, 2);
      gSprites[s.heartSpriteIds[i + 8]]!.invisible = false;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Famille fenêtres/liste — 1:1 menu_specialized.c (co-localisée, cf. en-tête)
// ═══════════════════════════════════════════════════════════════════════════

// 1:1 menu_specialized.c:117-155 — sMoveRelearnerWindowTemplates.
const sMoveRelearnerWindowTemplates: WindowTemplate[] = [
  /* [RELEARNERWIN_DESC_BATTLE]  */ { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 16, height: 12, paletteNum: 15, baseBlock: 0xA },
  /* [RELEARNERWIN_DESC_CONTEST] */ { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 16, height: 12, paletteNum: 15, baseBlock: 0xCA },
  /* [RELEARNERWIN_MOVE_LIST]    */ { bg: 1, tilemapLeft: 19, tilemapTop: 1, width: 10, height: 12, paletteNum: 15, baseBlock: 0x18A },
  /* [RELEARNERWIN_MSG]          */ { bg: 1, tilemapLeft: 4, tilemapTop: 15, width: 22, height: 4, paletteNum: 15, baseBlock: 0x202 },
  /* [RELEARNERWIN_YESNO]        */ { bg: 0, tilemapLeft: 22, tilemapTop: 8, width: 5, height: 4, paletteNum: 15, baseBlock: 0x25A },
  /* DUMMY_WIN_TEMPLATE          */ { bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
];

// 1:1 menu_specialized.c:159-169 — sMoveRelearnerYesNoMenuTemplate.
const sMoveRelearnerYesNoMenuTemplate: WindowTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 8, width: 5, height: 4, paletteNum: 15, baseBlock: 0x25A };

// 1:1 menu_specialized.c:171-191 — sMoveRelearnerMovesListTemplate.
const sMoveRelearnerMovesListTemplate = {
  items: null as unknown as ListMenuItem[],
  moveCursorFunc: MoveRelearnerCursorCallback,
  itemPrintFunc: null,
  totalItems: 0,
  maxShowed: 0,
  windowId: RELEARNERWIN_MOVE_LIST,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 1,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: 0,       // LIST_NO_MULTIPLE_SCROLL
  fontId: FONT_NORMAL,
  cursorKind: 0,           // CURSOR_BLACK_ARROW
};

// 1:1 menu_specialized.c:713-741 — InitMoveRelearnerWindows.
export function InitMoveRelearnerWindows(useContestWindow: boolean): void {
  InitWindows(sMoveRelearnerWindowTemplates);
  DeactivateAllTextPrinters();
  LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));
  LoadPalette('gStandardMenuPalette', BG_PLTT_ID(15), PLTT_SIZE_4BPP);

  for (let i = 0; i < sMoveRelearnerWindowTemplates.length - 1; i++)
    FillWindowPixelBuffer(i, 0x11); // PIXEL_FILL(1)

  if (!useContestWindow) {
    PutWindowTilemap(RELEARNERWIN_DESC_BATTLE);
    DrawStdFrameWithCustomTileAndPalette(RELEARNERWIN_DESC_BATTLE, false, 0x1, 0xE);
  } else {
    PutWindowTilemap(RELEARNERWIN_DESC_CONTEST);
    DrawStdFrameWithCustomTileAndPalette(RELEARNERWIN_DESC_CONTEST, false, 1, 0xE);
  }
  PutWindowTilemap(RELEARNERWIN_MOVE_LIST);
  PutWindowTilemap(RELEARNERWIN_MSG);
  DrawStdFrameWithCustomTileAndPalette(RELEARNERWIN_MOVE_LIST, false, 1, 0xE);
  DrawStdFrameWithCustomTileAndPalette(RELEARNERWIN_MSG, false, 1, 0xE);
  MoveRelearnerDummy();
  ScheduleBgCopyTilemapToVram(1);
}

// 1:1 menu_specialized.c:743-746
function MoveRelearnerDummy(): void { /* empty */ }

// 1:1 menu_specialized.c:748-760 — LoadMoveRelearnerMovesList.
export function LoadMoveRelearnerMovesList(items: ListMenuItem[], numChoices: number): number {
  Object.assign(gMultiuseListMenuTemplate, sMoveRelearnerMovesListTemplate);
  gMultiuseListMenuTemplate.totalItems = numChoices;
  gMultiuseListMenuTemplate.items = items;
  if (numChoices < 6)
    gMultiuseListMenuTemplate.maxShowed = numChoices;
  else
    gMultiuseListMenuTemplate.maxShowed = 6;
  return gMultiuseListMenuTemplate.maxShowed;
}

// 1:1 include/data/text/type_names.h (ROM FR — précédent pokedex.ts:2615 / battle_message.ts:798).
const gTypeNames: readonly string[] = ['NORMAL', 'COMBAT', 'VOL', 'POISON', 'SOL', 'ROCHE', 'INSECTE',
  'SPECTRE', 'ACIER', '???', 'FEU', 'EAU', 'PLANTE', 'ÉLECTRIK', 'PSY',
  'GLACE', 'DRAGON', 'TÉNÈBRES'];
function _getTypeName(typeEnum: string): string {
  const idx = resolveDecompConstant(typeEnum) as number | undefined;
  return (idx !== undefined ? gTypeNames[idx] : undefined) ?? typeEnum;
}

// 1:1 menu_specialized.c:762-822 — MoveRelearnerLoadBattleMoveDescription.
function MoveRelearnerLoadBattleMoveDescription(chosenMove: number): void {
  const buffer = new Uint8Array(32);
  FillWindowPixelBuffer(RELEARNERWIN_DESC_BATTLE, 0x11);
  let str: string | Uint8Array = getString('gText_MoveRelearnerBattleMoves');
  let x = GetStringCenterAlignXOffset(FONT_NORMAL, str, 128);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, x, 1, TEXT_SKIP_DRAW, null);

  str = getString('gText_MoveRelearnerPP');
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, 4, 41, TEXT_SKIP_DRAW, null);

  str = getString('gText_MoveRelearnerPower');
  x = GetStringRightAlignXOffset(FONT_NORMAL, str, 106);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, x, 25, TEXT_SKIP_DRAW, null);

  str = getString('gText_MoveRelearnerAccuracy');
  x = GetStringRightAlignXOffset(FONT_NORMAL, str, 106);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, x, 41, TEXT_SKIP_DRAW, null);

  if (chosenMove === LIST_CANCEL) {
    CopyWindowToVram(RELEARNERWIN_DESC_BATTLE, COPYWIN_GFX);
    return;
  }
  const move = gBattleMoves[chosenMove];
  str = _getTypeName(move.type);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, 4, 25, TEXT_SKIP_DRAW, null);

  x = 4 + GetStringWidth(getString('gText_MoveRelearnerPP'), FONT_NORMAL, 0);
  ConvertIntToDecimalStringN(buffer, move.pp, STR_CONV_MODE_LEFT_ALIGN, 2);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, buffer, x, 41, TEXT_SKIP_DRAW, null);

  if (move.power < 2) {
    str = getString('gText_ThreeDashes');
  } else {
    ConvertIntToDecimalStringN(buffer, move.power, STR_CONV_MODE_LEFT_ALIGN, 3);
    str = buffer;
  }
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, 106, 25, TEXT_SKIP_DRAW, null);

  if (move.accuracy === 0) {
    str = getString('gText_ThreeDashes');
  } else {
    ConvertIntToDecimalStringN(buffer, move.accuracy, STR_CONV_MODE_LEFT_ALIGN, 3);
    str = buffer;
  }
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NORMAL, str, 106, 41, TEXT_SKIP_DRAW, null);

  // 1:1 gMoveDescriptionPointers[chosenMove - 1] → gMoveDescriptions[chosenMove]
  // (le port indexe les descriptions par id de move, MOVE_NONE exclu).
  str = gMoveDescriptions[chosenMove];
  AddTextPrinterParameterized(RELEARNERWIN_DESC_BATTLE, FONT_NARROW, str, 0, 65, 0, null);
}

// 1:1 menu_specialized.c:824-858 — MoveRelearnerMenuLoadContestMoveDescription.
function MoveRelearnerMenuLoadContestMoveDescription(chosenMove: number): void {
  MoveRelearnerShowHideHearts(chosenMove);
  FillWindowPixelBuffer(RELEARNERWIN_DESC_CONTEST, 0x11);
  let str: string = getString('gText_MoveRelearnerContestMovesTitle');
  let x = GetStringCenterAlignXOffset(FONT_NORMAL, str, 128);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_CONTEST, FONT_NORMAL, str, x, 1, TEXT_SKIP_DRAW, null);

  str = getString('gText_MoveRelearnerAppeal');
  x = GetStringRightAlignXOffset(FONT_NORMAL, str, 92);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_CONTEST, FONT_NORMAL, str, x, 25, TEXT_SKIP_DRAW, null);

  str = getString('gText_MoveRelearnerJam');
  x = GetStringRightAlignXOffset(FONT_NORMAL, str, 92);
  AddTextPrinterParameterized(RELEARNERWIN_DESC_CONTEST, FONT_NORMAL, str, x, 41, TEXT_SKIP_DRAW, null);

  if (chosenMove === LIST_CANCEL) { // MENU_NOTHING_CHOSEN == LIST_CANCEL == -2
    CopyWindowToVram(RELEARNERWIN_DESC_CONTEST, COPYWIN_GFX);
    return;
  }

  const moveEnum = reverseDecompConstant(chosenMove, 'MOVE_') ?? 'MOVE_NONE';
  const move = getContestMove(moveEnum);
  if (move) {
    // 1:1 gContestMoveTypeTextPointers[contestCategory] → sContestNames[category]
    // (nom de catégorie concours porté, cf. contest_strings.ts).
    const cat = resolveDecompConstant(move.contestCategory) as number | undefined;
    str = (cat !== undefined ? sContestNames[cat] : undefined) ?? move.contestCategory;
    AddTextPrinterParameterized(RELEARNERWIN_DESC_CONTEST, FONT_NORMAL, str, 4, 25, TEXT_SKIP_DRAW, null);

    // 1:1 gContestEffectDescriptionPointers[effect].
    str = getContestEffectDescription(move.effect);
    AddTextPrinterParameterized(RELEARNERWIN_DESC_CONTEST, FONT_NARROW, str, 0, 65, TEXT_SKIP_DRAW, null);
  }

  CopyWindowToVram(RELEARNERWIN_DESC_CONTEST, COPYWIN_GFX);
}

// 1:1 menu_specialized.c:860-866 — MoveRelearnerCursorCallback.
function MoveRelearnerCursorCallback(itemIndex: number, onInit: boolean, _list: unknown): void {
  if (onInit !== true)
    PlaySE(SE_SELECT);
  MoveRelearnerLoadBattleMoveDescription(itemIndex);
  MoveRelearnerMenuLoadContestMoveDescription(itemIndex);
}

// 1:1 menu_specialized.c:868-876 — MoveRelearnerPrintMessage.
export function MoveRelearnerPrintMessage(str: Uint8Array | string): void {
  FillWindowPixelBuffer(RELEARNERWIN_MSG, 0x11); // PIXEL_FILL(1)
  gTextFlags.canABSpeedUpPrint = true;
  const speed = GetPlayerTextSpeedDelay();
  // TEXT_COLOR_DARK_GRAY=2, TEXT_COLOR_WHITE=1, shadow=3 (1:1 args).
  AddTextPrinterParameterized2(RELEARNERWIN_MSG, FONT_NORMAL, str, speed, null, 2, 1, 3);
}

// 1:1 menu_specialized.c:878-882 — MoveRelearnerRunTextPrinters.
export function MoveRelearnerRunTextPrinters(): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(RELEARNERWIN_MSG);
}

// 1:1 menu_specialized.c:884-887 — MoveRelearnerCreateYesNoMenu.
export function MoveRelearnerCreateYesNoMenu(): void {
  CreateYesNoMenu(sMoveRelearnerYesNoMenuTemplate, 1, 0xE, 0);
}

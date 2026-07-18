/**
 * decoration.ts — Port 1:1 STRICT de `src/decoration.c` (décomp Émeraude, 2748 l.).
 *
 * VAGUE 1 (ce fichier) = le FLUX MENU décoration (secret base / chambre du joueur) :
 *   données/statiques du haut → fin du flux de menu (~ decoration.c:1176) + le flux
 *   TOSS (decoration.c:2719-2748) + `HasDecorationSpace`/`HasDecorationsInUse`.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/decoration.c`
 *   - `include/decoration.h`, `include/constants/decorations.h`,
 *     `include/constants/global.h` (DECOR_MAX_SECRET_BASE=16 / DECOR_MAX_PLAYERS_HOUSE=12).
 *
 * HORS VAGUE 1 (= VAGUE 2, PLACEMENT sur la map : curseur carte/caméra, avatar,
 * GraphicsDataBuffer) : `SetInitialPositions`/`WarpToInitialPosition` (decoration.c:1178+),
 * `Task_PlaceDecoration`/`ConfigureCameraObjectForPlacingDecoration`/`AttemptPlaceDecoration`
 * et suivants, tout le flux PUT-AWAY caméra (`Task_ContinuePuttingAwayDecorations`+),
 * `ShowDecorationOnMap`/`SetDecoration`. Quand une fonction de MENU y branche, un
 * garde-fou HURLANT documenté est posé (console.error `(placement) : vague 2`), jamais
 * de contournement silencieux (Règle 3).
 *
 * Adaptations moteur (chacune avec précédent cité au call-site) :
 *   - `SetCursorWithinListBounds`/`SetCursorScrollWithinListBounds` prennent un `ListPos`
 *     `{scroll,cursor}` (menu_helpers.ts) là où le C prend `u16 *scroll, u16 *cursor` →
 *     copie/réécriture (précédent item_menu.ts:830-839 `UpdatePocketListPosition`).
 *   - `ListMenuGetScrollAndRow`/`DestroyListMenuTask` RENVOIENT `{scrollOffset,selectedRow}`
 *     (précédent item_menu.ts:1578/1623).
 *   - `AddScrollIndicatorArrowPairParameterized(..., scrollOffsetGet)` : dernier arg =
 *     closure `() => sDecorationsScrollOffset` là où le C passe `&sDecorationsScrollOffset`.
 *   - gText / `gDecorations[].name` (= string JS) vers les fns byte-level
 *     (`StringCopy`/`StringAppend`/`StringLength`) : encodés via `encodeOwText(getString(k))`
 *     (précédent daycare.ts:1145). `StringExpandPlaceholders` accepte string → `getString(k)`.
 *   - `MenuAction.text` gText : getter LAZY (charmap/strings chargés après l'init du module).
 *   - callbacks task / DisplayItemMessageOnField / YesNoFuncTable : le runtime passe l'OBJET
 *     `DecompTask` (decomp-runtime.ts:567) là où le C passe `u8 taskId` → wrap `(t)=>Fn(t.taskId)`
 *     (convention `CreateTask((t)=>fn(t.taskId))`).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
import { DECOR_NONE } from '../include/constants/decorations';
import { DECOR_MAX_SECRET_BASE, DECOR_MAX_PLAYERS_HOUSE } from '../include/constants/global';
import { NUMBER_OF_MON_TYPES } from '../include/constants/pokemon';
import {
  gDecorations, gDecorationInventories,
  GetNumOwnedDecorations, GetNumOwnedDecorationsInCategory, CondenseDecorationsInCategory,
  DECORCAT_DESK, DECORCAT_DOLL, DECORCAT_CUSHION, DECORCAT_COUNT,
} from './decoration_inventory';
import {
  AddTextPrinterParameterized2, DisplayItemMessageOnField,
  DrawStdFrameWithCustomTileAndPalette, ClearStdWindowAndFrameToTransparent,
  ClearDialogWindowAndFrame, DrawDialogueFrame, PrintMenuTable,
  InitMenuInUpperLeftCornerNormal, Menu_GetCursorPos, Menu_ProcessInput,
  DisplayYesNoMenuDefaultYes, type MenuAction,
} from './menu';
import {
  SetCursorWithinListBounds, SetCursorScrollWithinListBounds, DoYesNoFuncWithChoice,
  type ListPos, type YesNoFuncTable,
} from './menu_helpers';
import {
  AddWindow, RemoveWindow, ClearWindowTilemap, FillWindowPixelBuffer,
  ScheduleBgCopyTilemapToVram,
} from './window';
import {
  gMultiuseListMenuTemplate, ListMenuInit, ListMenu_ProcessInput,
  ListMenuGetScrollAndRow, DestroyListMenuTask,
  AddScrollIndicatorArrowPairParameterized, RemoveScrollIndicatorArrowPair,
  LIST_CANCEL, LIST_NOTHING_CHOSEN, SCROLL_ARROW_UP, LIST_NO_MULTIPLE_SCROLL,
  CURSOR_BLACK_ARROW, type ListMenu, type ListMenuTemplate, type ListMenuItem,
} from './list_menu';
import {
  AddTextPrinterParameterized, GetStringRightAlignXOffset, encodeOwText,
  FONT_NORMAL, FONT_NARROW, TEXT_SKIP_DRAW,
} from './text';
import { PIXEL_FILL, type WindowTemplate } from '../include/window';
import {
  TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY, CHAR_SLASH,
} from '../include/constants/characters';
import {
  StringExpandPlaceholders, StringCopy, StringAppend, StringLength,
  ConvertIntToDecimalStringN, gStringVar1, gStringVar4,
} from './string_util';
import { STR_CONV_MODE_RIGHT_ALIGN } from '../include/string_util';
import { GetMaxWidthInMenuTable } from './international_string_util';
import { gTasks, DestroyTask } from './task';
import { TASK_NONE } from '../include/task';
import { BG_PLTT_ID, gPaletteFade } from './palette';
import { LoadPalette, JOY_NEW } from '../harness/runtime/decomp-globals';
import { PlaySE } from './sound';
import { SE_SELECT } from '../include/constants/songs';
import { ScriptContext_SetupScript, LockPlayerFieldControls } from './script';
import { MENU_NOTHING_CHOSEN, MENU_B_PRESSED } from '../include/menu';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

// ─── 1:1 décomp `typedef void (*TaskFunc)(u8 taskId)` (task.h) ────────────────
type TaskFunc = (taskId: number) => void;

// ─── 1:1 décomp #defines task data (decoration.c:46-56) ──────────────────────
// Le MENU ne référence que ces 2 index ; les autres (tCursorX=0, tCursorY=1,
// tInitialX=3, tInitialY=4, tDecorWidth=5, tDecorHeight=6, tButton=10,
// tDecorationItemsMenuCommand=12) appartiennent au PLACEMENT (VAGUE 2).
const tDecorationMenuCommand = 11; // data[11]
const tMenuTaskId = 13;            // data[13]

// ─── 1:1 décomp #defines (decoration.c:58-63) ───────────────────────────────
const DECOR_MENU_PLACE = 0;
const DECOR_MENU_TOSS = 1;
const DECOR_MENU_TRADE = 2;
// DECOR_ITEMS_MENU_PLACE / DECOR_ITEMS_MENU_PUT_AWAY (decoration.c:62-63) = VAGUE 2.

// ─── 1:1 décomp `enum Windows` (decoration.c:98-105) ─────────────────────────
const WINDOW_MAIN_MENU = 0;
const WINDOW_DECORATION_CATEGORIES = 1;
const WINDOW_DECORATION_CATEGORY_SUMMARY = 2;
const WINDOW_DECORATION_CATEGORY_ITEMS = 3;
const WINDOW_COUNT = 4;

// ─── 1:1 décomp `include/menu.h:22-23` (NUMBER_OF_MON_TYPES + 6/7) ────────────
const MENU_INFO_ICON_BALL_RED = NUMBER_OF_MON_TYPES + 6;
const MENU_INFO_ICON_BALL_BLUE = NUMBER_OF_MON_TYPES + 7;

// ─── 1:1 décomp `struct DecorationItemsMenu` (decoration.c:65-72) ─────────────
interface DecorationItemsMenu {
  items: ListMenuItem[];          // struct ListMenuItem items[41]
  names: Uint8Array[];            // u8 names[41][24]
  numMenuItems: number;           // u8
  maxShownItems: number;          // u8
  scrollIndicatorsTaskId: number; // u8
}

// ─── 1:1 décomp `struct DecorationPCContext` (decoration.c:90-96) ─────────────
interface DecorationPCContext {
  items: number[];      // u8 *items (réf. SaveBlock1)
  pos: number[];        // u8 *pos   (réf. SaveBlock1)
  size: number;         // u8
  isPlayerRoom: boolean;// u8
}

// ─── 1:1 décomp EWRAM (decoration.c:107-128) — SOUS-ENSEMBLE utilisé par le MENU
// (les statiques PLACEMENT : sPlaceDecorationGraphicsDataBuffer, sCurDecorMapX/Y,
//  sDecor_CameraSpriteObjectIdx1/2, sDecorationLastDirectionMoved, sDecorSelectorOam,
//  sDecorRearrangementDataBuffer, sCurDecorSelectedInRearrangement = VAGUE 2).

/** 1:1 `EWRAM_DATA u8 *gCurDecorationItems = NULL` (decoration.c:107). Référence
 *  vers `gDecorationInventories[cat].items` (partage de pointer). Init [] = matérialise
 *  le NULL C (les chemins d'accès sont gardés par numMenuItems/sNumOwned…). */
export let gCurDecorationItems: number[] = [];
let sDecorationActionsCursorPos = 0;             // decoration.c:108
let sNumOwnedDecorationsInCurCategory = 0;       // decoration.c:109
const sSecretBaseItemsIndicesBuffer = new Uint8Array(DECOR_MAX_SECRET_BASE);  // :110
const sPlayerRoomItemsIndicesBuffer = new Uint8Array(DECOR_MAX_PLAYERS_HOUSE);// :111
let sDecorationsCursorPos = 0;                   // decoration.c:112 (u16)
let sDecorationsScrollOffset = 0;                // decoration.c:113 (u16)
export let gCurDecorationIndex = 0;              // decoration.c:114 (u8)
let sCurDecorationCategory: number = DECORCAT_DESK; // decoration.c:115
const sDecorationContext: DecorationPCContext = { items: [], pos: [], size: 0, isPlayerRoom: false }; // :117
const sDecorMenuWindowIds: number[] = new Array(WINDOW_COUNT).fill(0);       // decoration.c:118
let sDecorationItemsMenu: DecorationItemsMenu | null = null;                  // decoration.c:119

// ─── 1:1 décomp données MENU (decoration.c:211-320) ──────────────────────────

/** 1:1 `sDecorationCategoryNames[]` (decoration.c:211-221). gText → clés (résolues
 *  LAZY via `encodeOwText(getString(k))` au call-site, précédent daycare.ts:1145). */
const sDecorationCategoryNames: readonly string[] = [
  'gText_Desk',
  'gText_Chair',
  'gText_Plant',
  'gText_Ornament',
  'gText_Mat',
  'gText_Poster',
  'gText_Doll',
  'gText_Cushion',
];

/** 1:1 `sDecorationMainMenuActions[]` (decoration.c:223-241). `.text` = getter LAZY
 *  (getString résolu à l'accès) ; `.func` = handler statique (hoisté). */
const sDecorationMainMenuActions: readonly MenuAction[] = [
  { get text() { return getString('gText_Decorate'); }, func: DecorationMenuAction_Decorate },
  { get text() { return getString('gText_PutAway'); }, func: DecorationMenuAction_PutAway },
  { get text() { return getString('gText_Toss2'); }, func: DecorationMenuAction_Toss },
  { get text() { return getString('gText_Cancel'); }, func: DecorationMenuAction_Cancel },
];

/** 1:1 `sSecretBasePCMenuItemDescriptions[]` (decoration.c:243-249). gText → clés
 *  (résolues via getString au call-site ; passées à AddTextPrinter = string OK). */
const sSecretBasePCMenuItemDescriptions: readonly string[] = [
  'gText_PutOutSelectedDecorItem',
  'gText_StoreChosenDecorInPC',
  'gText_ThrowAwayUnwantedDecors',
  'gText_GoBackPrevMenu',
];

/** 1:1 `sSecretBasePC_SelectedDecorationActions[][2]` (decoration.c:251-256).
 *  [PLACE], [TOSS], [TRADE] × {action, cancel}. */
const sSecretBasePC_SelectedDecorationActions: readonly (readonly TaskFunc[])[] = [
  [DecorationItemsMenuAction_AttemptPlace, DecorationItemsMenuAction_Cancel],
  [DecorationItemsMenuAction_AttemptToss, DecorationItemsMenuAction_Cancel],
  [DecorationItemsMenuAction_Trade, DecorationItemsMenuAction_Cancel],
];

/** 1:1 `sDecorationWindowTemplates[WINDOW_COUNT]` (decoration.c:258-296). */
const sDecorationWindowTemplates: readonly WindowTemplate[] = [
  {
    bg: 0, tilemapLeft: 1, tilemapTop: 1,
    width: 18, height: 2 * sDecorationMainMenuActions.length,
    paletteNum: 15, baseBlock: 0x0001,
  },
  {
    bg: 0, tilemapLeft: 1, tilemapTop: 1,
    width: 13, height: 18,
    paletteNum: 13, baseBlock: 0x0091,
  },
  {
    bg: 0, tilemapLeft: 17, tilemapTop: 1,
    width: 12, height: 2,
    paletteNum: 15, baseBlock: 0x017b,
  },
  {
    bg: 0, tilemapLeft: 16, tilemapTop: 13,
    width: 13, height: 6,
    paletteNum: 15, baseBlock: 0x0193,
  },
];

/** 1:1 `sDecorationMenuPalette[] = INCGFX_U16("graphics/decorations/decoration_menu.pal")`
 *  (decoration.c:298). Asset chargé par symbole via getAsset (précédent credits.ts:1780
 *  `LoadPalette('symbol', BG_PLTT_ID(n), 32)`). Clé asset à enregistrer au câblage
 *  (public/decomp/em/decorations/decoration_menu.pal existe). `sizeof()` → 32 octets
 *  (16 couleurs ; LoadPalette ignore sizeBytes pour un symbole string). */
const sDecorationMenuPalette = 'sDecorationMenuPalette';

/** 1:1 `sDecorationItemsListMenuTemplate` (decoration.c:300-320). */
const sDecorationItemsListMenuTemplate: ListMenuTemplate = {
  items: [],                                        // .items = NULL
  moveCursorFunc: DecorationItemsMenu_OnCursorMove,
  itemPrintFunc: DecorationItemsMenu_PrintDecorationInUse,
  totalItems: 0,
  maxShowed: 0,
  windowId: 0,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 9,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 0,                                // FALSE
  itemVerticalPadding: 0,
  scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
  fontId: FONT_NARROW,
  cursorKind: CURSOR_BLACK_ARROW,
};

/** 1:1 `sTossDecorationYesNoFunctions` (decoration.c:509-513). */
const sTossDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: (t) => TossDecoration(t.taskId),
  noFunc: (t) => DontTossDecoration(t.taskId),
};

// ═════════════════════════════════════════════════════════════════════════════
//  Fonctions du flux MENU (decoration.c:515-1176 + 2295-2305 + 2719-2748)
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `InitDecorationContextItems` (decoration.c:515-531). */
export function InitDecorationContextItems(): void {
  if (sCurDecorationCategory < DECORCAT_COUNT)
    gCurDecorationItems = gDecorationInventories[sCurDecorationCategory].items;

  if (sDecorationContext.isPlayerRoom === false) {
    sDecorationContext.items = gSaveBlock1Ptr.secretBases[0].decorations as number[];
    sDecorationContext.pos = gSaveBlock1Ptr.secretBases[0].decorationPositions as number[];
  }

  if (sDecorationContext.isPlayerRoom === true) {
    sDecorationContext.items = gSaveBlock1Ptr.playerRoomDecorations as number[];
    sDecorationContext.pos = gSaveBlock1Ptr.playerRoomDecorationPositions as number[];
  }
}

/** 1:1 décomp `static u8 AddDecorationWindow(u8 windowIndex)` (decoration.c:533-556). */
function AddDecorationWindow(windowIndex: number): number {
  let template: WindowTemplate;
  if (windowIndex === WINDOW_MAIN_MENU) {
    template = { ...sDecorationWindowTemplates[WINDOW_MAIN_MENU] }; // struct copy
    template.width = GetMaxWidthInMenuTable(sDecorationMainMenuActions, sDecorationMainMenuActions.length);
    if (template.width > 18)
      template.width = 18;

    sDecorMenuWindowIds[windowIndex] = AddWindow(template);
  } else {
    sDecorMenuWindowIds[windowIndex] = AddWindow(sDecorationWindowTemplates[windowIndex]);
  }

  DrawStdFrameWithCustomTileAndPalette(sDecorMenuWindowIds[windowIndex], false, 0x214, 14);
  ScheduleBgCopyTilemapToVram(0);
  return sDecorMenuWindowIds[windowIndex];
}

/** 1:1 décomp `static void RemoveDecorationWindow(u8 windowIndex)` (decoration.c:558-564). */
function RemoveDecorationWindow(windowIndex: number): void {
  ClearStdWindowAndFrameToTransparent(sDecorMenuWindowIds[windowIndex], false);
  ClearWindowTilemap(sDecorMenuWindowIds[windowIndex]);
  RemoveWindow(sDecorMenuWindowIds[windowIndex]);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `static void AddDecorationActionsWindow(void)` (decoration.c:566-571). */
function AddDecorationActionsWindow(): void {
  const windowId = AddDecorationWindow(WINDOW_MAIN_MENU);
  PrintMenuTable(windowId, sDecorationMainMenuActions.length, sDecorationMainMenuActions);
  InitMenuInUpperLeftCornerNormal(windowId, sDecorationMainMenuActions.length, sDecorationActionsCursorPos);
}

/** 1:1 décomp `static void InitDecorationActionsWindow(void)` (decoration.c:573-579). */
function InitDecorationActionsWindow(): void {
  sDecorationActionsCursorPos = 0;
  LockPlayerFieldControls();
  AddDecorationActionsWindow();
  PrintCurMainMenuDescription();
}

/** 1:1 décomp `void DoSecretBaseDecorationMenu(u8 taskId)` (decoration.c:581-589). */
export function DoSecretBaseDecorationMenu(taskId: number): void {
  InitDecorationActionsWindow();
  sDecorationContext.items = gSaveBlock1Ptr.secretBases[0].decorations as number[];
  sDecorationContext.pos = gSaveBlock1Ptr.secretBases[0].decorationPositions as number[];
  sDecorationContext.size = DECOR_MAX_SECRET_BASE;
  sDecorationContext.isPlayerRoom = false;
  gTasks[taskId].func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `void DoPlayerRoomDecorationMenu(u8 taskId)` (decoration.c:591-599). */
export function DoPlayerRoomDecorationMenu(taskId: number): void {
  InitDecorationActionsWindow();
  sDecorationContext.items = gSaveBlock1Ptr.playerRoomDecorations as number[];
  sDecorationContext.pos = gSaveBlock1Ptr.playerRoomDecorationPositions as number[];
  sDecorationContext.size = DECOR_MAX_PLAYERS_HOUSE;
  sDecorationContext.isPlayerRoom = true;
  gTasks[taskId].func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `static void HandleDecorationActionsMenuInput(u8 taskId)` (decoration.c:601-623). */
function HandleDecorationActionsMenuInput(taskId: number): void {
  if (!gPaletteFade.active) {
    const menuPos = Menu_GetCursorPos();
    switch (Menu_ProcessInput()) {
      default:
        PlaySE(SE_SELECT);
        (sDecorationMainMenuActions[sDecorationActionsCursorPos].func as TaskFunc)(taskId);
        break;
      case MENU_NOTHING_CHOSEN:
        sDecorationActionsCursorPos = Menu_GetCursorPos();
        if (menuPos !== sDecorationActionsCursorPos)
          PrintCurMainMenuDescription();
        break;
      case MENU_B_PRESSED:
        PlaySE(SE_SELECT);
        DecorationMenuAction_Cancel(taskId);
        break;
    }
  }
}

/** 1:1 décomp `static void PrintCurMainMenuDescription(void)` (decoration.c:625-629). */
function PrintCurMainMenuDescription(): void {
  FillWindowPixelBuffer(0, PIXEL_FILL(1));
  AddTextPrinterParameterized2(0, FONT_NORMAL, getString(sSecretBasePCMenuItemDescriptions[sDecorationActionsCursorPos]), 0, null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
}

/** 1:1 décomp `static void DecorationMenuAction_Decorate(u8 taskId)` (decoration.c:631-644). */
function DecorationMenuAction_Decorate(taskId: number): void {
  if (GetNumOwnedDecorations() === 0) {
    StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorations'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationActionsAfterInvalidSelection(t.taskId));
  } else {
    gTasks[taskId].data[tDecorationMenuCommand] = DECOR_MENU_PLACE;
    sCurDecorationCategory = DECORCAT_DESK;
    SecretBasePC_PrepMenuForSelectingStoredDecors(taskId);
  }
}

/** 1:1 décomp `static void DecorationMenuAction_PutAway(u8 taskId)` (decoration.c:646-661). */
function DecorationMenuAction_PutAway(taskId: number): void {
  if (!HasDecorationsInUse(taskId)) {
    StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorationsInUse'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationActionsAfterInvalidSelection(t.taskId));
  } else {
    // 1:1 :655-659 — bascule vers le flux PUT-AWAY (caméra/placement sur la map) =
    // VAGUE 2 (Task_ContinuePuttingAwayDecorations non porté). Garde-fou HURLANT : on
    // NE touche PAS à l'écran (pas de RemoveDecorationWindow/FadeScreen) → menu reste sain.
    console.error('[decoration] DecorationMenuAction_PutAway → Task_ContinuePuttingAwayDecorations (placement) : vague 2 non portée');
  }
}

/** 1:1 décomp `static void DecorationMenuAction_Toss(u8 taskId)` (decoration.c:663-676). */
function DecorationMenuAction_Toss(taskId: number): void {
  if (GetNumOwnedDecorations() === 0) {
    StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorations'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationActionsAfterInvalidSelection(t.taskId));
  } else {
    gTasks[taskId].data[tDecorationMenuCommand] = DECOR_MENU_TOSS;
    sCurDecorationCategory = DECORCAT_DESK;
    SecretBasePC_PrepMenuForSelectingStoredDecors(taskId);
  }
}

/** 1:1 décomp `static void DecorationMenuAction_Cancel(u8 taskId)` (decoration.c:678-690). */
function DecorationMenuAction_Cancel(taskId: number): void {
  RemoveDecorationWindow(WINDOW_MAIN_MENU);
  if (!sDecorationContext.isPlayerRoom) {
    ScriptContext_SetupScript('SecretBase_EventScript_PCCancel');
    DestroyTask(taskId);
  } else {
    // 1:1 :688 ReshowPlayerPC(taskId) — player_pc.c ; non exporté par le port maison
    // player_pc.ts. Garde-fou (câblage retour player-room = ultérieur).
    console.error('[decoration] DecorationMenuAction_Cancel → ReshowPlayerPC (player_pc) : non porté');
  }
}

/** 1:1 décomp `static void ReturnToDecorationActionsAfterInvalidSelection(u8 taskId)` (decoration.c:692-696). */
function ReturnToDecorationActionsAfterInvalidSelection(taskId: number): void {
  PrintCurMainMenuDescription();
  gTasks[taskId].func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `static void SecretBasePC_PrepMenuForSelectingStoredDecors(u8 taskId)` (decoration.c:698-704). */
function SecretBasePC_PrepMenuForSelectingStoredDecors(taskId: number): void {
  LoadPalette(sDecorationMenuPalette, BG_PLTT_ID(13), 32); // sizeof(sDecorationMenuPalette)
  ClearDialogWindowAndFrame(0, false);
  RemoveDecorationWindow(WINDOW_MAIN_MENU);
  InitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `static void InitDecorationCategoriesWindow(u8 taskId)` (decoration.c:706-712). */
function InitDecorationCategoriesWindow(taskId: number): void {
  const windowId = AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  PrintDecorationCategoryMenuItems(taskId);
  InitMenuInUpperLeftCornerNormal(windowId, DECORCAT_COUNT + 1, sCurDecorationCategory);
  gTasks[taskId].func = (t) => HandleDecorationCategoriesMenuInput(t.taskId);
}

/** 1:1 décomp `static void ReinitDecorationCategoriesWindow(u8 taskId)` (decoration.c:714-720). */
function ReinitDecorationCategoriesWindow(taskId: number): void {
  FillWindowPixelBuffer(sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES], PIXEL_FILL(1));
  PrintDecorationCategoryMenuItems(taskId);
  InitMenuInUpperLeftCornerNormal(sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES], DECORCAT_COUNT + 1, sCurDecorationCategory);
  gTasks[taskId].func = (t) => HandleDecorationCategoriesMenuInput(t.taskId);
}

/** 1:1 décomp `static void PrintDecorationCategoryMenuItems(u8 taskId)` (decoration.c:722-743). */
function PrintDecorationCategoryMenuItems(taskId: number): void {
  let i: number;
  const windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES];
  const isPlayerRoom = sDecorationContext.isPlayerRoom;
  let shouldDisable = false;
  if (isPlayerRoom === true && gTasks[taskId].data[tDecorationMenuCommand] === DECOR_MENU_PLACE)
    shouldDisable = true;

  for (i = 0; i < DECORCAT_COUNT; i++) {
    // Only DOLL and CUSHION decorations are enabled when decorating the player's room.
    if (shouldDisable === true && i !== DECORCAT_DOLL && i !== DECORCAT_CUSHION)
      PrintDecorationCategoryMenuItem(windowId, i, 8, i * 16, true, TEXT_SKIP_DRAW);
    else
      PrintDecorationCategoryMenuItem(windowId, i, 8, i * 16, false, TEXT_SKIP_DRAW);
  }

  AddTextPrinterParameterized(windowId, FONT_NORMAL, getString(gTasks[taskId].data[tDecorationMenuCommand] === DECOR_MENU_TRADE ? 'gText_Exit' : 'gText_Cancel'), 8, i * 16 + 1, 0, null);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `static void PrintDecorationCategoryMenuItem(u8 winid, u8 category, u8 x, u8 y, bool8 disabled, u8 speed)` (decoration.c:745-761). */
function PrintDecorationCategoryMenuItem(winid: number, category: number, x: number, y: number, disabled: boolean, speed: number): void {
  let width: number;
  let str: Uint8Array;

  width = x === 8 ? 104 : 96;
  y++;
  ColorMenuItemString(gStringVar4, disabled);
  str = gStringVar4.subarray(StringLength(gStringVar4)); // StringLength(gStringVar4) + gStringVar4
  StringCopy(str, encodeOwText(getString(sDecorationCategoryNames[category])));
  AddTextPrinterParameterized(winid, FONT_NORMAL, gStringVar4, x, y, speed, null);
  str = ConvertIntToDecimalStringN(str, GetNumOwnedDecorationsInCategory(category), STR_CONV_MODE_RIGHT_ALIGN, 2);
  str[0] = CHAR_SLASH; str = str.subarray(1); // *(str++) = CHAR_SLASH
  ConvertIntToDecimalStringN(str, gDecorationInventories[category].size, STR_CONV_MODE_RIGHT_ALIGN, 2);
  x = GetStringRightAlignXOffset(gStringVar4, width, FONT_NORMAL);
  AddTextPrinterParameterized(winid, FONT_NORMAL, gStringVar4, x, y, speed, null);
}

/** 1:1 décomp `static void ColorMenuItemString(u8 *str, bool8 disabled)` (decoration.c:763-776).
 *  `gText_Color161Shadow161 = _("{COLOR 161}{SHADOW}0")` (strings.c:540) → bytes ext-ctrl
 *  (FC 01 A1 FC 03 …) via encodeOwText ; str[2]=color, str[5]=shadow patchés. */
function ColorMenuItemString(str: Uint8Array, disabled: boolean): void {
  StringCopy(str, encodeOwText(getString('gText_Color161Shadow161')));
  if (disabled === true) {
    str[2] = 4;
    str[5] = 5;
  } else {
    str[2] = 2;
    str[5] = 3;
  }
}

/** 1:1 décomp `static void HandleDecorationCategoriesMenuInput(u8 taskId)` (decoration.c:778-799). */
function HandleDecorationCategoriesMenuInput(taskId: number): void {
  if (!gPaletteFade.active) {
    const input = Menu_ProcessInput();
    switch (input) {
      case MENU_B_PRESSED:
      case DECORCAT_COUNT: // CANCEL
        PlaySE(SE_SELECT);
        ExitDecorationCategoriesMenu(taskId);
        break;
      case MENU_NOTHING_CHOSEN:
        break;
      default:
        PlaySE(SE_SELECT);
        sCurDecorationCategory = input;
        SelectDecorationCategory(taskId);
        break;
    }
  }
}

/** 1:1 décomp `static void SelectDecorationCategory(u8 taskId)` (decoration.c:801-819). */
function SelectDecorationCategory(taskId: number): void {
  sNumOwnedDecorationsInCurCategory = GetNumOwnedDecorationsInCategory(sCurDecorationCategory);
  if (sNumOwnedDecorationsInCurCategory !== 0) {
    CondenseDecorationsInCategory(sCurDecorationCategory);
    gCurDecorationItems = gDecorationInventories[sCurDecorationCategory].items;
    IdentifyOwnedDecorationsCurrentlyInUse(taskId);
    sDecorationsScrollOffset = 0;
    sDecorationsCursorPos = 0;
    gTasks[taskId].func = (t) => ShowDecorationItemsWindow(t.taskId);
  } else {
    RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
    StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorations'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationCategoriesAfterInvalidSelection(t.taskId));
  }
}

/** 1:1 décomp `static void ReturnToDecorationCategoriesAfterInvalidSelection(u8 taskId)` (decoration.c:821-825). */
function ReturnToDecorationCategoriesAfterInvalidSelection(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  InitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `static void ExitDecorationCategoriesMenu(u8 taskId)` (decoration.c:827-833). */
function ExitDecorationCategoriesMenu(taskId: number): void {
  if (gTasks[taskId].data[tDecorationMenuCommand] !== DECOR_MENU_TRADE)
    ReturnToActionsMenuFromCategories(taskId);
  else
    ExitTraderDecorationMenu(taskId);
}

/** 1:1 décomp `static void ReturnToActionsMenuFromCategories(u8 taskId)` (decoration.c:835-842). */
function ReturnToActionsMenuFromCategories(taskId: number): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  AddDecorationActionsWindow();
  DrawDialogueFrame(0, false);
  PrintCurMainMenuDescription();
  gTasks[taskId].func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `void ShowDecorationCategoriesWindow(u8 taskId)` (decoration.c:844-851). */
export function ShowDecorationCategoriesWindow(taskId: number): void {
  LoadPalette(sDecorationMenuPalette, BG_PLTT_ID(13), 32); // sizeof(sDecorationMenuPalette)
  ClearDialogWindowAndFrame(0, false);
  gTasks[taskId].data[tDecorationMenuCommand] = DECOR_MENU_TRADE;
  sCurDecorationCategory = DECORCAT_DESK;
  InitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `void CopyDecorationCategoryName(u8 *dest, u8 category)` (decoration.c:853-856). */
export function CopyDecorationCategoryName(dest: Uint8Array, category: number): void {
  StringCopy(dest, encodeOwText(getString(sDecorationCategoryNames[category])));
}

/** 1:1 décomp `static void ExitTraderDecorationMenu(u8 taskId)` (decoration.c:858-862). */
function ExitTraderDecorationMenu(taskId: number): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  // 1:1 :861 ExitTraderMenu(taskId) — trader.c (non exporté ; flux échangeur hors vague 1).
  console.error('[decoration] ExitTraderDecorationMenu → ExitTraderMenu (trader.c) : non porté');
  void taskId;
}

/** 1:1 décomp `static void InitDecorationItemsMenuLimits(void)` (decoration.c:864-871). */
function InitDecorationItemsMenuLimits(): void {
  sDecorationItemsMenu!.numMenuItems = sNumOwnedDecorationsInCurCategory + 1;
  if (sDecorationItemsMenu!.numMenuItems > 8)
    sDecorationItemsMenu!.maxShownItems = 8;
  else
    sDecorationItemsMenu!.maxShownItems = sDecorationItemsMenu!.numMenuItems;
}

/** 1:1 décomp `static void InitDecorationItemsMenuScrollAndCursor(void)` (decoration.c:873-876).
 *  `&sDecorationsScrollOffset, &sDecorationsCursorPos` → ListPos (précédent item_menu.ts:830). */
function InitDecorationItemsMenuScrollAndCursor(): void {
  const pos: ListPos = { scroll: sDecorationsScrollOffset, cursor: sDecorationsCursorPos };
  SetCursorWithinListBounds(pos, sDecorationItemsMenu!.maxShownItems, sDecorationItemsMenu!.numMenuItems);
  sDecorationsScrollOffset = pos.scroll;
  sDecorationsCursorPos = pos.cursor;
}

/** 1:1 décomp `static void InitDecorationItemsMenuScrollAndCursor2(void)` (decoration.c:878-881). */
function InitDecorationItemsMenuScrollAndCursor2(): void {
  const pos: ListPos = { scroll: sDecorationsScrollOffset, cursor: sDecorationsCursorPos };
  SetCursorScrollWithinListBounds(pos, sDecorationItemsMenu!.maxShownItems, sDecorationItemsMenu!.numMenuItems, 8);
  sDecorationsScrollOffset = pos.scroll;
  sDecorationsCursorPos = pos.cursor;
}

/** 1:1 décomp `static void PrintDecorationItemMenuItems(u8 taskId)` (decoration.c:883-909). */
function PrintDecorationItemMenuItems(taskId: number): void {
  let i: number;
  const data = gTasks[taskId].data;

  if ((sCurDecorationCategory < DECORCAT_DOLL || sCurDecorationCategory > DECORCAT_CUSHION) && sDecorationContext.isPlayerRoom === true && data[tDecorationMenuCommand] === DECOR_MENU_PLACE)
    ColorMenuItemString(gStringVar1, true);
  else
    ColorMenuItemString(gStringVar1, false);

  for (i = 0; i < sDecorationItemsMenu!.numMenuItems - 1; i++) {
    CopyDecorationMenuItemName(sDecorationItemsMenu!.names[i], gCurDecorationItems[i]);
    sDecorationItemsMenu!.items[i].name = sDecorationItemsMenu!.names[i];
    sDecorationItemsMenu!.items[i].id = i;
  }

  StringCopy(sDecorationItemsMenu!.names[i], encodeOwText(getString('gText_Cancel')));
  sDecorationItemsMenu!.items[i].name = sDecorationItemsMenu!.names[i];
  sDecorationItemsMenu!.items[i].id = LIST_CANCEL;
  Object.assign(gMultiuseListMenuTemplate, sDecorationItemsListMenuTemplate); // gMultiuse = sDecorationItemsListMenuTemplate
  gMultiuseListMenuTemplate.windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES];
  gMultiuseListMenuTemplate.totalItems = sDecorationItemsMenu!.numMenuItems;
  gMultiuseListMenuTemplate.items = sDecorationItemsMenu!.items;
  gMultiuseListMenuTemplate.maxShowed = sDecorationItemsMenu!.maxShownItems;
}

/** 1:1 décomp `static void CopyDecorationMenuItemName(u8 *dest, u16 decoration)` (decoration.c:911-915). */
function CopyDecorationMenuItemName(dest: Uint8Array, decoration: number): void {
  StringCopy(dest, gStringVar1);
  StringAppend(dest, encodeOwText(gDecorations[decoration].name));
}

/** 1:1 décomp `static void DecorationItemsMenu_OnCursorMove(s32 itemIndex, bool8 flag, struct ListMenu *menu)` (decoration.c:917-923). */
function DecorationItemsMenu_OnCursorMove(itemIndex: number, flag: boolean, menu: ListMenu): void {
  void menu;
  if (flag !== true)
    PlaySE(SE_SELECT);

  PrintDecorationItemDescription(itemIndex);
}

/** 1:1 décomp `static void DecorationItemsMenu_PrintDecorationInUse(u8 windowId, u32 itemIndex, u8 y)` (decoration.c:925-934). */
function DecorationItemsMenu_PrintDecorationInUse(windowId: number, itemIndex: number, y: number): void {
  if (itemIndex !== LIST_CANCEL) {
    if (IsDecorationIndexInSecretBase(itemIndex + 1) === true)
      BlitMenuInfoIcon(windowId, MENU_INFO_ICON_BALL_RED, 92, y + 2);
    else if (IsDecorationIndexInPlayersRoom(itemIndex + 1) === true)
      BlitMenuInfoIcon(windowId, MENU_INFO_ICON_BALL_BLUE, 92, y + 2);
  }
}

/** 1:1 décomp `static void AddDecorationItemsScrollIndicators(void)` (decoration.c:936-950).
 *  `&sDecorationsScrollOffset` → closure `() => sDecorationsScrollOffset`. */
function AddDecorationItemsScrollIndicators(): void {
  if (sDecorationItemsMenu!.scrollIndicatorsTaskId === TASK_NONE) {
    sDecorationItemsMenu!.scrollIndicatorsTaskId = AddScrollIndicatorArrowPairParameterized(
      SCROLL_ARROW_UP,
      0x3c,
      0x0c,
      0x94,
      sDecorationItemsMenu!.numMenuItems - sDecorationItemsMenu!.maxShownItems,
      0x6e,
      0x6e,
      () => sDecorationsScrollOffset);
  }
}

/** 1:1 décomp `static void RemoveDecorationItemsScrollIndicators(void)` (decoration.c:952-959). */
function RemoveDecorationItemsScrollIndicators(): void {
  if (sDecorationItemsMenu!.scrollIndicatorsTaskId !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(sDecorationItemsMenu!.scrollIndicatorsTaskId);
    sDecorationItemsMenu!.scrollIndicatorsTaskId = TASK_NONE;
  }
}

/** 1:1 décomp `static void AddDecorationItemsWindow(u8 taskId)` (decoration.c:961-965). */
function AddDecorationItemsWindow(taskId: number): void {
  AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  InitDecorationItemsWindow(taskId);
}

/** 1:1 décomp `static void InitDecorationItemsWindow(u8 taskId)` (decoration.c:967-980). */
function InitDecorationItemsWindow(taskId: number): void {
  const data = gTasks[taskId].data;
  AddDecorationWindow(WINDOW_DECORATION_CATEGORY_ITEMS);
  ShowDecorationCategorySummaryWindow(sCurDecorationCategory);
  sDecorationItemsMenu = NewDecorationItemsMenu(); // AllocZeroed(sizeof(*sDecorationItemsMenu))
  sDecorationItemsMenu.scrollIndicatorsTaskId = TASK_NONE;
  InitDecorationItemsMenuLimits();
  InitDecorationItemsMenuScrollAndCursor();
  InitDecorationItemsMenuScrollAndCursor2();
  PrintDecorationItemMenuItems(taskId);
  data[tMenuTaskId] = ListMenuInit(gMultiuseListMenuTemplate, sDecorationsScrollOffset, sDecorationsCursorPos);
  AddDecorationItemsScrollIndicators();
}

/** 1:1 décomp `static void ShowDecorationItemsWindow(u8 taskId)` (decoration.c:982-986). */
function ShowDecorationItemsWindow(taskId: number): void {
  InitDecorationItemsWindow(taskId);
  gTasks[taskId].func = (t) => HandleDecorationItemsMenuInput(t.taskId);
}

/** 1:1 décomp `static void HandleDecorationItemsMenuInput(u8 taskId)` (decoration.c:988-1018). */
function HandleDecorationItemsMenuInput(taskId: number): void {
  const data = gTasks[taskId].data;
  if (!gPaletteFade.active) {
    const input = ListMenu_ProcessInput(data[tMenuTaskId]);
    {
      const sr = ListMenuGetScrollAndRow(data[tMenuTaskId]);
      sDecorationsScrollOffset = sr.scrollOffset;
      sDecorationsCursorPos = sr.selectedRow;
    }
    switch (input) {
      case LIST_NOTHING_CHOSEN:
        break;
      case LIST_CANCEL:
        PlaySE(SE_SELECT);
        sSecretBasePC_SelectedDecorationActions[data[tDecorationMenuCommand]][1](taskId);
        break;
      default:
        PlaySE(SE_SELECT);
        gCurDecorationIndex = input;
        RemoveDecorationItemsScrollIndicators();
        {
          const sr = DestroyListMenuTask(data[tMenuTaskId]);
          sDecorationsScrollOffset = sr.scrollOffset;
          sDecorationsCursorPos = sr.selectedRow;
        }
        RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
        RemoveDecorationItemsOtherWindows();
        sDecorationItemsMenu = null; // Free(sDecorationItemsMenu)
        sSecretBasePC_SelectedDecorationActions[data[tDecorationMenuCommand]][0](taskId);
        break;
    }
  }
}

/** 1:1 décomp `static void ShowDecorationCategorySummaryWindow(u8 category)` (decoration.c:1020-1023). */
function ShowDecorationCategorySummaryWindow(category: number): void {
  PrintDecorationCategoryMenuItem(AddDecorationWindow(WINDOW_DECORATION_CATEGORY_SUMMARY), category, 0, 0, false, 0);
}

/** 1:1 décomp `static void PrintDecorationItemDescription(s32 itemIndex)` (decoration.c:1025-1038). */
function PrintDecorationItemDescription(itemIndex: number): void {
  const windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORY_ITEMS];
  let str: string;

  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  if ((itemIndex >>> 0) >= sNumOwnedDecorationsInCurCategory)
    str = getString('gText_GoBackPrevMenu');
  else
    str = getString(gDecorations[gCurDecorationItems[itemIndex]].description);

  AddTextPrinterParameterized(windowId, FONT_NORMAL, str, 0, 1, 0, null);
}

/** 1:1 décomp `static void RemoveDecorationItemsOtherWindows(void)` (decoration.c:1040-1044). */
function RemoveDecorationItemsOtherWindows(): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORY_ITEMS);
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORY_SUMMARY);
}

/** 1:1 décomp `static bool8 IsDecorationIndexInSecretBase(u8 idx)` (decoration.c:1046-1056). */
function IsDecorationIndexInSecretBase(idx: number): boolean {
  let i: number;
  for (i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) {
    if (sSecretBaseItemsIndicesBuffer[i] === idx)
      return true;
  }

  return false;
}

/** 1:1 décomp `static bool8 IsDecorationIndexInPlayersRoom(u8 idx)` (decoration.c:1058-1068). */
function IsDecorationIndexInPlayersRoom(idx: number): boolean {
  let i: number;
  for (i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) {
    if (sPlayerRoomItemsIndicesBuffer[i] === idx)
      return true;
  }

  return false;
}

/** 1:1 décomp `static void IdentifyOwnedDecorationsCurrentlyInUseInternal(u8 taskId)` (decoration.c:1070-1121). */
function IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId: number): void {
  void taskId;
  let i: number, j: number, k: number;
  let count: number;

  count = 0;
  sSecretBaseItemsIndicesBuffer.fill(0); // memset(..., 0, sizeof)
  sPlayerRoomItemsIndicesBuffer.fill(0);

  for (i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) {
    if ((gSaveBlock1Ptr.secretBases[0].decorations as number[])[i] !== DECOR_NONE) {
      for (j = 0; j < gDecorationInventories[sCurDecorationCategory].size; j++) {
        if (gCurDecorationItems[j] === (gSaveBlock1Ptr.secretBases[0].decorations as number[])[i]) {
          for (k = 0; k < count && sSecretBaseItemsIndicesBuffer[k] !== j + 1; k++)
            ;

          if (k === count) {
            sSecretBaseItemsIndicesBuffer[count] = j + 1;
            count++;
            break;
          }
        }
      }
    }
  }

  count = 0;
  for (i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) {
    if ((gSaveBlock1Ptr.playerRoomDecorations as number[])[i] !== DECOR_NONE) {
      for (j = 0; j < gDecorationInventories[sCurDecorationCategory].size; j++) {
        if (gCurDecorationItems[j] === (gSaveBlock1Ptr.playerRoomDecorations as number[])[i] && IsDecorationIndexInSecretBase(j + 1) !== true) {
          for (k = 0; k < count && sPlayerRoomItemsIndicesBuffer[k] !== j + 1; k++);
          if (k === count) {
            sPlayerRoomItemsIndicesBuffer[count] = j + 1;
            count++;
            break;
          }
        }
      }
    }
  }
}

/** 1:1 décomp `static void IdentifyOwnedDecorationsCurrentlyInUse(u8 taskId)` (decoration.c:1123-1126). */
function IdentifyOwnedDecorationsCurrentlyInUse(taskId: number): void {
  IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);
}

/** 1:1 décomp `bool8 IsSelectedDecorInThePC(void)` (decoration.c:1128-1144). */
export function IsSelectedDecorInThePC(): boolean {
  let i: number;
  for (i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) {
    if (sSecretBaseItemsIndicesBuffer[i] === sDecorationsScrollOffset + sDecorationsCursorPos + 1)
      return false;

    if (i < sPlayerRoomItemsIndicesBuffer.length
      && sPlayerRoomItemsIndicesBuffer[i] === sDecorationsScrollOffset + sDecorationsCursorPos + 1) {
      return false;
    }
  }

  return true;
}

/** 1:1 décomp `static void Task_ShowDecorationItemsWindow(u8 taskId)` (decoration.c:1146-1150). */
function Task_ShowDecorationItemsWindow(taskId: number): void {
  AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  ShowDecorationItemsWindow(taskId);
}

/** 1:1 décomp `static void DontTossDecoration(u8 taskId)` (decoration.c:1152-1156). */
function DontTossDecoration(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  gTasks[taskId].func = (t) => Task_ShowDecorationItemsWindow(t.taskId);
}

/** 1:1 décomp `static void ReturnToDecorationItemsAfterInvalidSelection(u8 taskId)` (decoration.c:1158-1166). */
function ReturnToDecorationItemsAfterInvalidSelection(taskId: number): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    ClearDialogWindowAndFrame(0, false);
    AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
    ShowDecorationItemsWindow(taskId);
  }
}

/** 1:1 décomp `static void DecorationItemsMenuAction_Cancel(u8 taskId)` (decoration.c:1168-1176). */
function DecorationItemsMenuAction_Cancel(taskId: number): void {
  const data = gTasks[taskId].data;
  RemoveDecorationItemsScrollIndicators();
  RemoveDecorationItemsOtherWindows();
  DestroyListMenuTask(data[tMenuTaskId]); // (tMenuTaskId, NULL, NULL)
  sDecorationItemsMenu = null; // Free(sDecorationItemsMenu)
  ReinitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `static bool8 HasDecorationSpace(void)` (decoration.c:1313-1323). */
function HasDecorationSpace(): boolean {
  let i: number;
  for (i = 0; i < sDecorationContext.size; i++) {
    if (sDecorationContext.items[i] === DECOR_NONE)
      return true;
  }

  return false;
}

/** 1:1 décomp `static void DecorationItemsMenuAction_AttemptPlace(u8 taskId)` (decoration.c:1325-1359).
 *  Validation MENU 1:1 ; la branche succès (Task_PlaceDecoration = caméra/placement)
 *  est gardée VAGUE 2. Les messages d'erreur restent (logique menu). */
function DecorationItemsMenuAction_AttemptPlace(taskId: number): void {
  if (sDecorationContext.isPlayerRoom === true && sCurDecorationCategory !== DECORCAT_DOLL && sCurDecorationCategory !== DECORCAT_CUSHION) {
    StringExpandPlaceholders(gStringVar4, getString('gText_CantPlaceInRoom'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationItemsAfterInvalidSelection(t.taskId));
  } else if (IsSelectedDecorInThePC() === true) {
    if (HasDecorationSpace() === true) {
      // 1:1 :1336-1338 — lance le placement caméra (Task_PlaceDecoration) = VAGUE 2.
      console.error('[decoration] DecorationItemsMenuAction_AttemptPlace → Task_PlaceDecoration (placement) : vague 2 non portée');
    } else {
      ConvertIntToDecimalStringN(gStringVar1, sDecorationContext.size, STR_CONV_MODE_RIGHT_ALIGN, 2);
      if (sDecorationContext.isPlayerRoom === false) {
        StringExpandPlaceholders(gStringVar4, getString('gText_NoMoreDecorations'));
      } else {
        StringExpandPlaceholders(gStringVar4, getString('gText_NoMoreDecorations2'));
      }
      DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationItemsAfterInvalidSelection(t.taskId));
    }
  } else {
    StringExpandPlaceholders(gStringVar4, getString('gText_InUseAlready'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationItemsAfterInvalidSelection(t.taskId));
  }
}

/** 1:1 décomp `static bool8 HasDecorationsInUse(u8 taskId)` (decoration.c:2295-2305). */
function HasDecorationsInUse(taskId: number): boolean {
  void taskId;
  let i: number;
  for (i = 0; i < sDecorationContext.size; i++) {
    if (sDecorationContext.items[i] !== DECOR_NONE)
      return true;
  }

  return false;
}

/** 1:1 décomp `void DecorationItemsMenuAction_Trade(u8 taskId)` — définie dans trader.c:176
 *  (hors decoration.c). Le flux TRADE (échangeur) n'est pas porté → garde-fou documenté. */
function DecorationItemsMenuAction_Trade(taskId: number): void {
  void taskId;
  console.error('[decoration] DecorationItemsMenuAction_Trade (trader.c:176) : hors vague 1 / non porté');
}

/** 1:1 décomp `static void DecorationItemsMenuAction_AttemptToss(u8 taskId)` (decoration.c:2719-2732). */
function DecorationItemsMenuAction_AttemptToss(taskId: number): void {
  if (IsSelectedDecorInThePC() === true) {
    StringCopy(gStringVar1, encodeOwText(gDecorations[gCurDecorationItems[gCurDecorationIndex]].name));
    StringExpandPlaceholders(gStringVar4, getString('gText_DecorationWillBeDiscarded'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => TossDecorationPrompt(t.taskId));
  } else {
    StringExpandPlaceholders(gStringVar4, getString('gText_CantThrowAwayInUse'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationItemsAfterInvalidSelection(t.taskId));
  }
}

/** 1:1 décomp `static void TossDecorationPrompt(u8 taskId)` (decoration.c:2734-2738). */
function TossDecorationPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sTossDecorationYesNoFunctions);
}

/** 1:1 décomp `static void TossDecoration(u8 taskId)` (decoration.c:2740-2748). */
function TossDecoration(taskId: number): void {
  gCurDecorationItems[gCurDecorationIndex] = DECOR_NONE;
  sNumOwnedDecorationsInCurCategory = GetNumOwnedDecorationsInCategory(sCurDecorationCategory);
  CondenseDecorationsInCategory(sCurDecorationCategory);
  IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);
  StringExpandPlaceholders(gStringVar4, getString('gText_DecorationThrownAway'));
  DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationItemsAfterInvalidSelection(t.taskId));
}

// ─── Helpers d'adaptation moteur ─────────────────────────────────────────────

/** Matérialise `sDecorationItemsMenu = AllocZeroed(sizeof(struct DecorationItemsMenu))`
 *  (decoration.c:972) : items[41] (ListMenuItem), names[41][24] (u8), compteurs = 0.
 *  `AllocZeroed<T>` du bridge renvoie `{}` → on alloue les tableaux imbriqués ici. */
function NewDecorationItemsMenu(): DecorationItemsMenu {
  const items: ListMenuItem[] = [];
  const names: Uint8Array[] = [];
  for (let i = 0; i < 41; i++) {
    items.push({ name: '', id: 0 });
    names.push(new Uint8Array(24));
  }
  return { items, names, numMenuItems: 0, maxShownItems: 0, scrollIndicatorsTaskId: 0 };
}

let sWarnedMenuInfoIcon = false;
/** 1:1 décomp `BlitMenuInfoIcon(windowId, iconId, x, y)` (menu.c:2098) — MAIS l'infra
 *  PARTAGÉE (feuille gMenuInfoIcons + `MENU_INFO_ICON_*` + `BlitMenuInfoIcon` dans menu.c)
 *  n'est pas encore un module partagé (item_menu.ts en tient une COPIE privée liée à ses
 *  assets bag). Les icônes « ball rouge/bleu » (déco en cours d'utilisation) = cosmétique.
 *  Garde-fou documenté (log 1×) jusqu'au port de la feuille partagée. */
function BlitMenuInfoIcon(_windowId: number, _iconId: number, _x: number, _y: number): void {
  if (!sWarnedMenuInfoIcon) {
    console.error('[decoration] BlitMenuInfoIcon (menu.c:2098) : feuille menu-info-icons non portée en module partagé — icônes « en usage » masquées (cosmétique)');
    sWarnedMenuInfoIcon = true;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  PONT scrcmd PRÉ-EXISTANT (NON-1:1) — dette à réconcilier avec decoration_inventory.ts
// ─────────────────────────────────────────────────────────────────────────────
//  `scrcmd.ts:218` importe `DecorationAdd`/`DecorationCheckSpace` d'ICI. Ces 4 shims
//  = adaptation « liste plate capacité 256 » (héritage du squelette). Le VRAI 1:1
//  per-catégorie vit dans `decoration_inventory.ts` (DecorationAdd/Remove/CheckSpace/
//  CheckHasDecoration). DÉRIVE connue : à terme, câbler scrcmd sur decoration_inventory
//  et supprimer ces shims. Laissés INTACTS ici (retour number = 1/0 attendu par
//  `setResult`/gSpecialVar_Result) pour ne rien casser hors de la vague MENU.
// ═════════════════════════════════════════════════════════════════════════════

const DECORATION_CAPACITY = 256;

/** shim scrcmd — `gSaveBlock1Ptr->decorations[]` (liste plate, lazy-init). NON-1:1. */
function decorationsArr(): number[] {
  if (!gSaveBlock1Ptr) return [];
  if (!gSaveBlock1Ptr.decorations) gSaveBlock1Ptr.decorations = [];
  return gSaveBlock1Ptr.decorations as number[];
}

/** shim scrcmd `DecorationAdd(decorId)` → 1 = ajouté, 0 = plein. NON-1:1 (voir bannière). */
export function DecorationAdd(decorId: number): number {
  const arr = decorationsArr();
  if (arr.length < DECORATION_CAPACITY) { arr.push(decorId); return 1; }
  return 0;
}

/** shim scrcmd `DecorationRemove(decorId)` → 1 = retiré, 0 = absent. NON-1:1. */
export function DecorationRemove(decorId: number): number {
  const arr = decorationsArr();
  const idx = arr.indexOf(decorId);
  if (idx >= 0) { arr.splice(idx, 1); return 1; }
  return 0;
}

/** shim scrcmd `DecorationCheckSpace(decorId)` → 1 = place dispo, 0 = plein. NON-1:1. */
export function DecorationCheckSpace(_decorId: number): number {
  return decorationsArr().length < DECORATION_CAPACITY ? 1 : 0;
}

/** shim scrcmd `CheckHasDecoration(decorId)` → 1 = possédée, 0 = non. NON-1:1. */
export function CheckHasDecoration(decorId: number): number {
  return decorationsArr().includes(decorId) ? 1 : 0;
}

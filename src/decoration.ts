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

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
import {
  DECOR_NONE, DECOR_STAND, DECOR_SLIDE, DECOR_SOLID_BOARD, DECOR_SAND_ORNAMENT,
  DECOR_SILVER_SHIELD, DECOR_GOLD_SHIELD, DECOR_REGISTEEL_DOLL,
} from '../include/constants/decorations';
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
import { gTasks, DestroyTask, CreateTask } from './task';
import { TASK_NONE } from '../include/task';
import { BG_PLTT_ID, gPaletteFade } from './palette';
import { LoadPalette, JOY_NEW } from '../harness/runtime/decomp-globals';
import { PlaySE } from './sound';
import { SE_SELECT, SE_FAILURE } from '../include/constants/songs';
import { ScriptContext_SetupScript, LockPlayerFieldControls } from './script';
import { MENU_NOTHING_CHOSEN, MENU_B_PRESSED } from '../include/menu';
import { A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT } from '../include/gba/io_reg';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
// ─── VAGUE 2 (PLACEMENT) — imports moteur (chacun avec précédent au call-site) ────
import { gFieldCamera, DrawWholeMapView } from './field_camera';
import {
  gMapHeader, MapGridGetMetatileIdAt, MapGridGetMetatileBehaviorAt, GetMetatileAttributesById,
  MapGridSetMetatileIdAt, MapGridSetMetatileEntryAt,
  NUM_TILES_IN_PRIMARY, NUM_TILES_PER_METATILE, MAP_OFFSET,
  MAPGRID_ELEVATION_SHIFT, MAPGRID_IMPASSABLE,
  METATILE_ATTR_LAYER_SHIFT, METATILE_LAYER_TYPE_NORMAL,
  UNPACK_BEHAVIOR,
} from './fieldmap';
import { CreateObjectGraphicsSprite, GetObjectEventIdByPosition } from './event_object_movement';
import {
  gSprites, CreateSprite, DestroySprite, LoadSpritePalette, FreeSpritePaletteByTag, LoadSpriteSheet,
  gDummySpriteAffineAnimTable, TILE_SIZE_4BPP, PLTT_SIZE_4BPP, TAG_NONE,
} from './sprite';
import { FadeScreen, IsWeatherNotFadingIn, FADE_TO_BLACK } from './field_weather';
import { FadeInFromBlack } from './field_screen_effect';
import { PlayerGetDestCoords, GetPlayerFacingDirection } from './field_player_avatar';
import { FlagGet } from './engine/script/script-vars';
import { FLAG_DECORATION_1, FLAG_DECORATION_14 } from '../include/constants/flags';
import { SetWarpDestination, WarpIntoMap, CB2_ReturnToField_Manual } from './overworld';
import { SetMainCallback2 } from './main';
import { TryPutSecretBaseVisitOnAir } from './tv';
import {
  MetatileBehavior_IsSecretBaseImpassable, MetatileBehavior_IsSecretBaseNorthWall,
  MetatileBehavior_IsSecretBaseTrainerSpot, MetatileBehavior_IsSecretBaseHole,
  MetatileBehavior_IsNormal, MetatileBehavior_HoldsLargeDecoration, MetatileBehavior_HoldsSmallDecoration,
  MetatileBehavior_IsSecretBasePC, MetatileBehavior_IsPlayerRoomPCOn,
} from './metatile_behavior';
import { JOY_HELD, SpriteCallbackDummy, getRuntime } from '../harness/runtime/decomp-globals';
import { BG_TILE_H_FLIP, BG_TILE_V_FLIP } from '../harness/runtime/decomp-helpers';
import { OBJECT_EVENTS_COUNT, MALE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST, OBJECT_EVENT_TEMPLATES_COUNT } from '../include/constants/global';
import { OBJ_EVENT_GFX_BRENDAN_DECORATING, OBJ_EVENT_GFX_MAY_DECORATING } from '../include/constants/event_objects';
import { METATILE_SecretBase_SandOrnament_BrokenBase } from '../include/constants/metatile_labels';
import type { Decoration } from './data/decoration/header';

// ─── 1:1 décomp `typedef void (*TaskFunc)(u8 taskId)` (task.h) ────────────────
type TaskFunc = (taskId: number) => void;

// ─── 1:1 décomp #defines task data (decoration.c:46-56) ──────────────────────
const tCursorX = 0;                     // data[0]
const tCursorY = 1;                     // data[1]
const tState = 2;                       // data[2]
const tInitialX = 3;                    // data[3]
const tInitialY = 4;                    // data[4]
const tDecorWidth = 5;                  // data[5]
const tDecorHeight = 6;                 // data[6]
const tButton = 10;                     // data[10]
const tDecorationMenuCommand = 11;      // data[11]
const tDecorationItemsMenuCommand = 12; // data[12]
const tMenuTaskId = 13;                 // data[13]

// ─── 1:1 décomp #defines (decoration.c:58-63) ───────────────────────────────
const DECOR_MENU_PLACE = 0;
const DECOR_MENU_TOSS = 1;
const DECOR_MENU_TRADE = 2;
const DECOR_ITEMS_MENU_PLACE = 0;    // decoration.c:62
const DECOR_ITEMS_MENU_PUT_AWAY = 1; // decoration.c:63

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

/** 1:1 décomp `static void DecorationMenuAction_PutAway(u8 taskId)` (decoration.c:646-661).
 *  VAGUE 3 : la branche succès lance le flux PUT-AWAY (Task_ContinuePuttingAwayDecorations). */
function DecorationMenuAction_PutAway(taskId: number): void {
  if (!HasDecorationsInUse(taskId)) {
    StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorationsInUse'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnToDecorationActionsAfterInvalidSelection(t.taskId));
  } else {
    RemoveDecorationWindow(WINDOW_MAIN_MENU);
    ClearDialogWindowAndFrame(0, false);
    FadeScreen(FADE_TO_BLACK, 0);
    gTasks[taskId].data[tState] = 0;
    gTasks[taskId].func = (t) => Task_ContinuePuttingAwayDecorations(t.taskId);
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
      // 1:1 :1336-1338 — lance le placement caméra (Task_PlaceDecoration) — VAGUE 2 câblée.
      FadeScreen(FADE_TO_BLACK, 0);
      gTasks[taskId].data[tState] = 0;
      gTasks[taskId].func = (t) => Task_PlaceDecoration(t.taskId);
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
//  VAGUE 2 — LE PLACEMENT SUR LA MAP (decoration.c:1178-2176 + curseur partagé)
//  Transcription 1:1. Le flux PUT-AWAY / rearrangement (:2178-2718) = VAGUE 3 :
//  quand une fonction vague-2 y branche → garde-fou HURLANT + retour sain.
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1:1 décomp #defines (decoration.c:42-44) ───────────────────────────────
const PLACE_DECORATION_SELECTOR_TAG = 0xbe5;
const PLACE_DECORATION_PLAYER_TAG = 0x008;
/** 1:1 `#define NUM_DECORATION_FLAGS (FLAG_DECORATION_14 - FLAG_DECORATION_1 + 1)`
 *  (decoration.c:44). = 14. Consommé par SetDecoration (:1287) — spawn object-event
 *  gardé-fou dans le port. */
const NUM_DECORATION_FLAGS = FLAG_DECORATION_14 - FLAG_DECORATION_1 + 1;

// ─── 1:1 décomp enums non exportés par le port (valeurs = include/decoration.h:4-28,
//  constants/decorations.h:125, global.fieldmap.h:20, constants/maps.h:28). Définis
//  localement, précédent vague 1 (MENU_INFO_ICON_*, DECOR_MENU_* locaux). ───────────
const DECORPERM_SOLID_FLOOR = 0;   // decoration.h:9
const DECORPERM_PASS_FLOOR = 1;    // decoration.h:10
const DECORPERM_BEHIND_FLOOR = 2;  // decoration.h:11
const DECORPERM_NA_WALL = 3;       // decoration.h:12
const DECORPERM_SPRITE = 4;        // decoration.h:13
const DECORSHAPE_1x1 = 0;          // decoration.h:18
const DECORSHAPE_2x1 = 1;          // decoration.h:19
const DECORSHAPE_3x1 = 2;          // decoration.h:20 (unused)
const DECORSHAPE_4x2 = 3;          // decoration.h:21
const DECORSHAPE_2x2 = 4;          // decoration.h:22
const DECORSHAPE_1x2 = 5;          // decoration.h:23
const DECORSHAPE_1x3 = 6;          // decoration.h:24 (unused)
const DECORSHAPE_2x4 = 7;          // decoration.h:25
const DECORSHAPE_3x3 = 8;          // decoration.h:26
const DECORSHAPE_3x2 = 9;          // decoration.h:27
const NUM_DECORATIONS = DECOR_REGISTEEL_DOLL; // constants/decorations.h:125
const ELEVATION_INVALID = 0xFFFF;  // global.fieldmap.h:20
const WARP_ID_NONE = -1;           // constants/maps.h:28

// 1:1 OamData enum (sprite.h) — tous 0 ; défini local (précédent : port éparpille
// ST_OAM_* entre include/sprite.ts et harness/decomp-helpers.ts).
const ST_OAM_AFFINE_OFF = 0;
const ST_OAM_OBJ_NORMAL = 0;
const ST_OAM_4BPP = 0;

// 1:1 `JOY_HELD(DPAD_ANY)` — DPAD_ANY = OR des 4 directions (io_reg n'exporte que
// DPAD_ANY_EXPR ; défini local, 1:1 io_reg.h).
const DPAD_ANY = DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN;

// ─── 1:1 décomp EWRAM PLACEMENT (decoration.c:120-126) ───────────────────────
// (sDecorRearrangementDataBuffer:127 / sCurDecorSelectedInRearrangement:128 = VAGUE 3.)

/** 1:1 `struct PlaceDecorationGraphicsDataBuffer` (decoration.c:74-80).
 *  `decoration` = `const struct Decoration *` → l'objet Decoration (ou null pour le NULL C). */
interface PlaceDecorationGraphicsDataBuffer {
  decoration: Decoration | null;
  tiles: Uint16Array;  // u16 tiles[0x40]
  image: Uint8Array;   // u8 image[0x800]
  palette: Uint16Array;// u16 palette[16]
}
const sPlaceDecorationGraphicsDataBuffer: PlaceDecorationGraphicsDataBuffer = {
  decoration: null,
  tiles: new Uint16Array(0x40),
  image: new Uint8Array(0x800),
  palette: new Uint16Array(16),
};
let sCurDecorMapX = 0;                 // decoration.c:121 (u16)
let sCurDecorMapY = 0;                 // decoration.c:122 (u16)
let sDecor_CameraSpriteObjectIdx1 = 0; // decoration.c:123 (u8)
let sDecor_CameraSpriteObjectIdx2 = 0; // decoration.c:124 (u8)
let sDecorationLastDirectionMoved = 0; // decoration.c:125 (u8)

/** 1:1 `struct OamData sDecorSelectorOam` (decoration.c:126). Objet mutable (écrit par
 *  SetDecorSelectionBoxOamAttributes) ; consommé comme `oam` par les SpriteTemplate (any). */
const sDecorSelectorOam = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0, x: 0, matrixNum: 0, size: 0, tileNum: 0, priority: 0, paletteNum: 0,
};

// ─── 1:1 décomp `sDecorTilemaps[]` + tables associées (data/decoration/tilemaps.h) ──
const sDecorTilemap_1x1_Tiles = [0x00, 0x01, 0x02, 0x03];
const sDecorTilemap_3x1_Tiles = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d];
const sDecorTilemap_2x2_Tiles = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f];
const sDecorTilemap_1x3_Tiles = [0x00, 0x01, 0x04, 0x05, 0x08, 0x09, 0x0c, 0x0d, 0x10, 0x11, 0x14, 0x15];
const sDecorTilemap_2x1_Tiles = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07];
const sDecorTilemap_4x2_Tiles = [
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
];
const sDecorTilemap_3x3_Tiles = [
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d,
];
const sDecorTilemap_3x2_Tiles = [
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d,
];
const sDecorTilemap_1x1_Y = [0x00, 0x00, 0x00, 0x00];
const sDecorTilemap_2x1_Y = [0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x01];
const sDecorTilemap_3x1_Y = [0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02];
const sDecorTilemap_4x2_Y = [
  0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03,
  0x04, 0x04, 0x05, 0x05, 0x06, 0x06, 0x07, 0x07, 0x04, 0x04, 0x05, 0x05, 0x06, 0x06, 0x07, 0x07,
];
const sDecorTilemap_2x2_Y = [0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x02, 0x02, 0x03, 0x03];
const sDecorTilemap_1x2_Y = [0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01];
const sDecorTilemap_1x3_Y = [0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02];
const sDecorTilemap_2x4_Y = [
  0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x02, 0x02, 0x03, 0x03,
  0x04, 0x04, 0x05, 0x05, 0x04, 0x04, 0x05, 0x05, 0x06, 0x06, 0x07, 0x07, 0x06, 0x06, 0x07, 0x07,
];
const sDecorTilemap_3x3_Y = [
  0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02,
  0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05,
  0x06, 0x06, 0x07, 0x07, 0x08, 0x08, 0x06, 0x06, 0x07, 0x07, 0x08, 0x08,
];
const sDecorTilemap_3x2_Y = [
  0x00, 0x00, 0x01, 0x01, 0x02, 0x02, 0x00, 0x00, 0x01, 0x01, 0x02, 0x02,
  0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05,
];
const sDecorTilemap_1x1_X = [0x04, 0x05, 0x06, 0x07];
const sDecorTilemap_2x1_X = [0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07];
const sDecorTilemap_3x1_X = [0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07];
const sDecorTilemap_4x2_X = [
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
];
const sDecorTilemap_2x2_X = [0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07];
const sDecorTilemap_1x2_X = [0x04, 0x05, 0x06, 0x07, 0x04, 0x05, 0x06, 0x07];
const sDecorTilemap_1x3_X = [0x04, 0x05, 0x06, 0x07, 0x04, 0x05, 0x06, 0x07, 0x04, 0x05, 0x06, 0x07];
const sDecorTilemap_2x4_X = [
  0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07,
  0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07,
];
const sDecorTilemap_3x3_X = [
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
];
const sDecorTilemap_3x2_X = [
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
  0x04, 0x05, 0x04, 0x05, 0x04, 0x05, 0x06, 0x07, 0x06, 0x07, 0x06, 0x07,
];

/** 1:1 `DECORSIZE(width, height) = width*height*4` (tilemaps.h:174). */
const DECORSIZE = (width: number, height: number): number => width * height * 4;

/** 1:1 `sDecorTilemaps[]` (tilemaps.h:176-241), indexé par DECORSHAPE. */
interface DecorTilemap { tiles: number[]; y: number[]; x: number[]; size: number; }
const sDecorTilemaps: readonly DecorTilemap[] = [
  /* [DECORSHAPE_1x1] */ { tiles: sDecorTilemap_1x1_Tiles, y: sDecorTilemap_1x1_Y, x: sDecorTilemap_1x1_X, size: DECORSIZE(1, 1) },
  /* [DECORSHAPE_2x1] */ { tiles: sDecorTilemap_2x1_Tiles, y: sDecorTilemap_2x1_Y, x: sDecorTilemap_2x1_X, size: DECORSIZE(2, 1) },
  /* [DECORSHAPE_3x1] */ { tiles: sDecorTilemap_3x1_Tiles, y: sDecorTilemap_3x1_Y, x: sDecorTilemap_3x1_X, size: DECORSIZE(3, 1) },
  /* [DECORSHAPE_4x2] */ { tiles: sDecorTilemap_4x2_Tiles, y: sDecorTilemap_4x2_Y, x: sDecorTilemap_4x2_X, size: DECORSIZE(4, 2) },
  /* [DECORSHAPE_2x2] */ { tiles: sDecorTilemap_2x2_Tiles, y: sDecorTilemap_2x2_Y, x: sDecorTilemap_2x2_X, size: DECORSIZE(2, 2) },
  /* [DECORSHAPE_1x2] */ { tiles: sDecorTilemap_2x1_Tiles, y: sDecorTilemap_1x2_Y, x: sDecorTilemap_1x2_X, size: DECORSIZE(1, 2) },
  /* [DECORSHAPE_1x3] */ { tiles: sDecorTilemap_1x3_Tiles, y: sDecorTilemap_1x3_Y, x: sDecorTilemap_1x3_X, size: DECORSIZE(1, 3) },
  /* [DECORSHAPE_2x4] */ { tiles: sDecorTilemap_4x2_Tiles, y: sDecorTilemap_2x4_Y, x: sDecorTilemap_2x4_X, size: DECORSIZE(2, 4) },
  /* [DECORSHAPE_3x3] */ { tiles: sDecorTilemap_3x3_Tiles, y: sDecorTilemap_3x3_Y, x: sDecorTilemap_3x3_X, size: DECORSIZE(3, 3) },
  /* [DECORSHAPE_3x2] */ { tiles: sDecorTilemap_3x2_Tiles, y: sDecorTilemap_3x2_Y, x: sDecorTilemap_3x2_X, size: DECORSIZE(3, 2) },
];

/** 1:1 `sDecorationMovementInfo[]` (decoration.c:325-342), indexé par DECORSHAPE.
 *  `shape`/`size` = SPRITE_SHAPE/SPRITE_SIZE(dim) résolus (gba/types.h:117-118, table OAM
 *  GBA) : macros compile-time → valeurs inlinées avec la dim en commentaire (1:1). */
const sDecorationMovementInfo: readonly { shape: number; size: number; cameraX: number; cameraY: number }[] = [
  /* [DECORSHAPE_1x1] */ { shape: 0, size: 1, cameraX: 120, cameraY: 78 }, // SPRITE_SHAPE/SIZE(16x16)
  /* [DECORSHAPE_2x1] */ { shape: 1, size: 2, cameraX: 128, cameraY: 78 }, // (32x16)
  /* [DECORSHAPE_3x1] */ { shape: 1, size: 3, cameraX: 144, cameraY: 86 }, // (64x32)
  /* [DECORSHAPE_4x2] */ { shape: 1, size: 3, cameraX: 144, cameraY: 70 }, // (64x32)
  /* [DECORSHAPE_2x2] */ { shape: 0, size: 2, cameraX: 128, cameraY: 70 }, // (32x32)
  /* [DECORSHAPE_1x2] */ { shape: 2, size: 2, cameraX: 120, cameraY: 70 }, // (16x32)
  /* [DECORSHAPE_1x3] */ { shape: 2, size: 3, cameraX: 128, cameraY: 86 }, // (32x64)
  /* [DECORSHAPE_2x4] */ { shape: 2, size: 3, cameraX: 128, cameraY: 54 }, // (32x64)
  /* [DECORSHAPE_3x3] */ { shape: 0, size: 3, cameraX: 144, cameraY: 70 }, // (64x64)
  /* [DECORSHAPE_3x2] */ { shape: 1, size: 3, cameraX: 144, cameraY: 70 }, // (64x32)
];

/** 1:1 `sDecorSelectorAnimCmd0`/`sDecorSelectorAnimCmds` (decoration.c:344-350). 1 frame
 *  statique (ANIMCMD_FRAME(0,0) + END) → `anims` équivalent = pas d'animation (le sprite
 *  affiche la frame 0). Représenté null-compatible (SpriteTemplate.anims du port). */
const sDecorSelectorAnimCmds: ReadonlyArray<ReadonlyArray<unknown>> = [[{ type: 'frame', imageValue: 0, duration: 0 }, { type: 'end' }]];

/** 1:1 `sDecorSelectorSpriteFrameImages` (decoration.c:352-356). data → &image[]. */
const sDecorSelectorSpriteFrameImages = { data: sPlaceDecorationGraphicsDataBuffer.image, size: 0x800 };

/** 1:1 `sDecorationSelectorSpriteTemplate` (decoration.c:358-367). `images` = tableau de 1
 *  (le port veut `ReadonlyArray<SpriteFrameImage>` là où le C passe `&frameImages`). */
const sDecorationSelectorSpriteTemplate = {
  tileTag: TAG_NONE,
  paletteTag: PLACE_DECORATION_SELECTOR_TAG,
  oam: sDecorSelectorOam,
  anims: sDecorSelectorAnimCmds,
  images: [sDecorSelectorSpriteFrameImages],
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy,
};

/** 1:1 `sDecorWhilePlacingSpriteTemplate` (decoration.c:369-378). images = NULL (voie sheet). */
const sDecorWhilePlacingSpriteTemplate = {
  tileTag: 0x0000,
  paletteTag: 0x0000,
  oam: sDecorSelectorOam,
  anims: sDecorSelectorAnimCmds,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy,
};

/** 1:1 `sSpritePal_PlaceDecoration` (decoration.c:380-384). data → &palette[]. */
const sSpritePal_PlaceDecoration = { data: sPlaceDecorationGraphicsDataBuffer.palette, tag: PLACE_DECORATION_SELECTOR_TAG };

/** 1:1 `sPlaceDecorationYesNoFunctions` (decoration.c:386-390). */
const sPlaceDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: (t) => PlaceDecoration(t.taskId),
  noFunc: (t) => ContinueDecorating(t.taskId),
};

/** 1:1 `sCancelDecoratingYesNoFunctions` (decoration.c:392-396). */
const sCancelDecoratingYesNoFunctions: YesNoFuncTable = {
  yesFunc: (t) => CancelDecorating(t.taskId),
  noFunc: (t) => ContinueDecorating(t.taskId),
};

/** 1:1 `sPlacePutAwayYesNoFunctions[]` (decoration.c:398-408). Appelé DIRECTEMENT par
 *  Task_SelectLocation avec un `u8 taskId` (≠ DoYesNoFuncWithChoice) → funcs = TaskFunc.
 *  [1] (put-away) = VAGUE 3 (garde-fous). */
const sPlacePutAwayYesNoFunctions: readonly { yesFunc: TaskFunc; noFunc: TaskFunc }[] = [
  { yesFunc: AttemptPlaceDecoration, noFunc: AttemptCancelPlaceDecoration },
  { yesFunc: AttemptPutAwayDecoration, noFunc: AttemptCancelPutAwayDecoration },
];

/** 1:1 `sDecorationStandElevations[]` (decoration.c:410-414). */
const sDecorationStandElevations: readonly number[] = [4, 4, 4, 4, 0, 3, 3, 0];

/** 1:1 `sDecorationSlideElevation[]` (decoration.c:416-422). */
const sDecorationSlideElevation: readonly number[] = [4, 4, 4, 4, 0, 4, 3, 0];

/** 1:1 `sDecorShapeSizes[]` (decoration.c:424-435), indexé par DECORSHAPE. */
const sDecorShapeSizes: readonly number[] = [4, 8, 16, 32, 16, 8, 16, 32, 64, 32];

// ═════════════════════════════════════════════════════════════════════════════
//  GARDE-FOUS D'ASSETS NON PORTÉS (vague 2) — précédent BlitMenuInfoIcon (:997).
//  Chacun HURLE 1× ; le flux 1:1 tourne INERTE (blanc) sans crash tant que l'asset
//  n'est pas porté. JAMAIS de contournement silencieux (Règle 3).
// ═════════════════════════════════════════════════════════════════════════════

/** `gDecorations[].tiles` = `const u16 *` (tiles.h). Dans le port c'est encore un STUB
 *  `string` (clé 'DecorGfx_*', data/decoration/header.ts:234) : le port de tiles.h (643 l.
 *  de u16 arrays) est un chantier asset distinct. Sans lui, TOUT le rendu map/gfx du
 *  placement est INERTE. Getter HURLANT (1×) → tableau de 0 (les boucles 1:1 tournent
 *  sans NaN/crash ; aucune vraie tuile posée). Quand tiles.h sera porté :
 *  `return gDecorations[decoration].tiles as unknown as number[]`. */
const sMissingDecorTiles: number[] = new Array(0x40).fill(0);
let sWarnedDecorTilesMissing = false;
function GetDecorTiles(decoration: number): number[] {
  if (!sWarnedDecorTilesMissing) {
    console.error('[decoration] gDecorations[].tiles (tiles.h u16 arrays) = STUB string (data/decoration/header.ts:234) — rendu map/gfx du placement INERTE tant que tiles.h non porté');
    sWarnedDecorTilesMissing = true;
  }
  void decoration;
  return sMissingDecorTiles;
}

/** `gTilesetPointer_SecretBase(RedCave)` = `const struct Tileset *` (tilesets.h) — les
 *  pointeurs bruts tiles/palettes/metatiles de la base secrète ne sont PAS exposés par le
 *  système de tilesets du port. Modélisés null (= le pointeur C). Les helpers gfx-buffer
 *  (CopyTile/CopyPalette/GetMetatile) HURLENT (1×) et laissent le buffer VIDE. */
interface SecretBaseTilesetPtr { tiles: Uint8Array; palettes: Uint16Array; metatiles: Uint16Array; }
const gTilesetPointer_SecretBase = null as SecretBaseTilesetPtr | null;
const gTilesetPointer_SecretBaseRedCave = null as SecretBaseTilesetPtr | null;
let sWarnedSecretBaseTileset = false;
function WarnSecretBaseTilesetMissing(): void {
  if (!sWarnedSecretBaseTileset) {
    console.error('[decoration] gTilesetPointer_SecretBase(RedCave) : tilesets bruts base secrète non exposés par le port — buffers gfx du sélecteur laissés VIDES (INERTE)');
    sWarnedSecretBaseTileset = true;
  }
}

/** ADAPTATION : `sprite->oam.priority` du décomp vit dans `rt.gba.oam[oamIndex]` (le port
 *  APLATIT `struct Sprite` — DecompSprite n'a pas de champ `.oam`). Précédent
 *  naming_screen.ts:1786 / party_menu.ts:1736 (`rt.gba.oam[spr.oamIndex].priority`). */
function SetDecorSpriteOamPriority(spriteId: number, priority: number): void {
  const rt = getRuntime();
  const spr = rt.gSprites[spriteId];
  if (spr) rt.gba.oam[spr.oamIndex].priority = priority;
}

/** 1:1 décomp `static void SetInitialPositions(u8 taskId)` (decoration.c:1178-1183).
 *  `PlayerGetDestCoords(&tCursorX, &tCursorY)` → le port RENVOIE `{x,y}` (adaptation, même
 *  esprit que ListMenuGetScrollAndRow vague 1). */
function SetInitialPositions(taskId: number): void {
  gTasks[taskId].data[tInitialX] = gSaveBlock1Ptr.pos.x;
  gTasks[taskId].data[tInitialY] = gSaveBlock1Ptr.pos.y;
  const dest = PlayerGetDestCoords();
  gTasks[taskId].data[tCursorX] = dest.x;
  gTasks[taskId].data[tCursorY] = dest.y;
}

/** 1:1 décomp `static void WarpToInitialPosition(u8 taskId)` (decoration.c:1185-1190). */
function WarpToInitialPosition(taskId: number): void {
  DrawWholeMapView();
  SetWarpDestination(gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum, WARP_ID_NONE, gTasks[taskId].data[tInitialX], gTasks[taskId].data[tInitialY]);
  WarpIntoMap();
}

/** 1:1 décomp `static u16 GetDecorationElevation(u8 decoration, u8 tileIndex)` (decoration.c:1192-1206). */
function GetDecorationElevation(decoration: number, tileIndex: number): number {
  let elevation = ELEVATION_INVALID;
  switch (decoration) {
    case DECOR_STAND:
      elevation = sDecorationStandElevations[tileIndex] << MAPGRID_ELEVATION_SHIFT;
      return elevation;
    case DECOR_SLIDE:
      elevation = sDecorationSlideElevation[tileIndex] << MAPGRID_ELEVATION_SHIFT;
      return elevation;
    default:
      return elevation;
  }
}

/** 1:1 décomp `static void ShowDecorationOnMap_(u16 mapX, u16 mapY, u8 decWidth, u8 decHeight, u16 decoration)` (decoration.c:1208-1243).
 *  `gDecorations[decoration].tiles[k]` → `GetDecorTiles(decoration)[k]` (STUB tiles.h). */
function ShowDecorationOnMap_(mapX: number, mapY: number, decWidth: number, decHeight: number, decoration: number): void {
  let i: number, j: number;
  let x: number, y: number;
  let attributes: number;
  let impassableFlag: number;
  let overlapsWall: number;
  let elevation: number;
  const decor = gDecorations[decoration];
  const tiles = GetDecorTiles(decoration);

  for (j = 0; j < decHeight; j++) {
    y = mapY - decHeight + 1 + j;
    for (i = 0; i < decWidth; i++) {
      x = mapX + i;
      attributes = GetMetatileAttributesById(NUM_TILES_IN_PRIMARY + tiles[j * decWidth + i]);
      if (MetatileBehavior_IsSecretBaseImpassable(UNPACK_BEHAVIOR(attributes)) === true
        || (decor.permission !== DECORPERM_PASS_FLOOR && (attributes >> METATILE_ATTR_LAYER_SHIFT) !== METATILE_LAYER_TYPE_NORMAL))
        impassableFlag = MAPGRID_IMPASSABLE;
      else
        impassableFlag = 0;

      // Choose the metatile that has the wall background instead of the floor if overlapping a wall.
      if (decor.permission !== DECORPERM_NA_WALL && MetatileBehavior_IsSecretBaseNorthWall(MapGridGetMetatileBehaviorAt(x, y)) === true)
        overlapsWall = 1;
      else
        overlapsWall = 0;

      elevation = GetDecorationElevation(decor.id, j * decWidth + i);
      if (elevation !== ELEVATION_INVALID)
        MapGridSetMetatileEntryAt(x, y, (tiles[j * decWidth + i] + (NUM_TILES_IN_PRIMARY | overlapsWall)) | impassableFlag | elevation);
      else
        MapGridSetMetatileIdAt(x, y, (tiles[j * decWidth + i] + (NUM_TILES_IN_PRIMARY | overlapsWall)) | impassableFlag);
    }
  }
}

/** 1:1 décomp `void ShowDecorationOnMap(u16 mapX, u16 mapY, u16 decoration)` (decoration.c:1245-1280). */
export function ShowDecorationOnMap(mapX: number, mapY: number, decoration: number): void {
  switch (gDecorations[decoration].shape) {
    case DECORSHAPE_1x1: ShowDecorationOnMap_(mapX, mapY, 1, 1, decoration); break;
    case DECORSHAPE_2x1: ShowDecorationOnMap_(mapX, mapY, 2, 1, decoration); break;
    case DECORSHAPE_3x1: ShowDecorationOnMap_(mapX, mapY, 3, 1, decoration); break; // unused
    case DECORSHAPE_4x2: ShowDecorationOnMap_(mapX, mapY, 4, 2, decoration); break;
    case DECORSHAPE_2x2: ShowDecorationOnMap_(mapX, mapY, 2, 2, decoration); break;
    case DECORSHAPE_1x2: ShowDecorationOnMap_(mapX, mapY, 1, 2, decoration); break;
    case DECORSHAPE_1x3: ShowDecorationOnMap_(mapX, mapY, 1, 3, decoration); break; // unused
    case DECORSHAPE_2x4: ShowDecorationOnMap_(mapX, mapY, 2, 4, decoration); break;
    case DECORSHAPE_3x3: ShowDecorationOnMap_(mapX, mapY, 3, 3, decoration); break;
    case DECORSHAPE_3x2: ShowDecorationOnMap_(mapX, mapY, 3, 2, decoration); break;
  }
}

/** 1:1 décomp `void SetDecoration(void)` (decoration.c:1282-1311) — special object-event
 *  (SecretBase_EventScript_SetDecoration). GARDE-FOU : dépend d'infra NON portée 1:1 —
 *  gSpecialVar_0x8004..8007/Result (port = VarSet/VarGet par id, pas de globals),
 *  VarSet(VAR_OBJ_GFX_ID_0+...), TrySpawnObjectEvent (signature port divergente),
 *  TryMoveObjectEventToMapCoords, TryOverrideObjectEventTemplateCoords (non porté),
 *  + sPlaceDecorationGraphicsDataBuffer.decoration->tiles[0] (tiles.h STUB). HURLE 1×. */
let sWarnedSetDecoration = false;
export function SetDecoration(): void {
  if (!sWarnedSetDecoration) {
    console.error('[decoration] SetDecoration (decoration.c:1282) : spawn object-event + specials + tiles.h non portés 1:1 — placement des décorations SPRITE différé');
    sWarnedSetDecoration = true;
  }
}

/** 1:1 décomp `static void Task_PlaceDecoration(u8 taskId)` (decoration.c:1361-1389). */
function Task_PlaceDecoration(taskId: number): void {
  switch (gTasks[taskId].data[tState]) {
    case 0:
      if (!gPaletteFade.active) {
        SetInitialPositions(taskId);
        gTasks[taskId].data[tState] = 1;
      }
      break;
    case 1:
      gPaletteFade.bufferTransferDisabled = true;
      ConfigureCameraObjectForPlacingDecoration(sPlaceDecorationGraphicsDataBuffer, gCurDecorationItems[gCurDecorationIndex]);
      SetUpDecorationShape(taskId);
      SetUpPlacingDecorationPlayerAvatar(taskId, sPlaceDecorationGraphicsDataBuffer);
      FadeInFromBlack();
      gPaletteFade.bufferTransferDisabled = false;
      gTasks[taskId].data[tState] = 2;
      break;
    case 2:
      if (IsWeatherNotFadingIn() === true) {
        gTasks[taskId].data[tDecorationItemsMenuCommand] = DECOR_ITEMS_MENU_PLACE;
        ContinueDecorating(taskId);
      }
      break;
  }
}

/** 1:1 décomp `static void ConfigureCameraObjectForPlacingDecoration(struct PlaceDecorationGraphicsDataBuffer *data, u8 decor)` (decoration.c:1391-1399). */
function ConfigureCameraObjectForPlacingDecoration(data: PlaceDecorationGraphicsDataBuffer, decor: number): void {
  sDecor_CameraSpriteObjectIdx1 = gSprites[gFieldCamera.spriteId]!.data[0];
  gFieldCamera.spriteId = gpu_pal_decompress_alloc_tag_and_upload(data, decor);
  SetDecorSpriteOamPriority(gFieldCamera.spriteId, 1);
  gSprites[gFieldCamera.spriteId]!.callback = InitializePuttingAwayCursorSprite;
  gSprites[gFieldCamera.spriteId]!.x = sDecorationMovementInfo[data.decoration!.shape].cameraX;
  gSprites[gFieldCamera.spriteId]!.y = sDecorationMovementInfo[data.decoration!.shape].cameraY;
}

/** 1:1 décomp `static void SetUpPlacingDecorationPlayerAvatar(u8 taskId, struct PlaceDecorationGraphicsDataBuffer *data)` (decoration.c:1401-1417). */
function SetUpPlacingDecorationPlayerAvatar(taskId: number, data: PlaceDecorationGraphicsDataBuffer): void {
  let x: number;

  x = ((16 * (gTasks[taskId].data[tDecorWidth] & 0xff) + sDecorationMovementInfo[data.decoration!.shape].cameraX - 8 * ((gTasks[taskId].data[tDecorWidth] & 0xff) - 1)) & 0xff);
  if (data.decoration!.shape === DECORSHAPE_3x1 || data.decoration!.shape === DECORSHAPE_3x3 || data.decoration!.shape === DECORSHAPE_3x2)
    x -= 8;

  if (gSaveBlock2Ptr.playerGender === MALE)
    sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_BRENDAN_DECORATING, SpriteCallbackDummy, x, 72, 0);
  else
    sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_MAY_DECORATING, SpriteCallbackDummy, x, 72, 0);

  SetDecorSpriteOamPriority(sDecor_CameraSpriteObjectIdx2, 1);
  DestroySprite(gSprites[sDecor_CameraSpriteObjectIdx1]);
  sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;
}

/** 1:1 décomp `static void SetUpDecorationShape(u8 taskId)` (decoration.c:1419-1465). */
function SetUpDecorationShape(taskId: number): void {
  switch (gDecorations[gCurDecorationItems[gCurDecorationIndex]].shape) {
    case DECORSHAPE_1x1: gTasks[taskId].data[tDecorWidth] = 1; gTasks[taskId].data[tDecorHeight] = 1; break;
    case DECORSHAPE_2x1: gTasks[taskId].data[tDecorWidth] = 2; gTasks[taskId].data[tDecorHeight] = 1; break;
    case DECORSHAPE_3x1: gTasks[taskId].data[tDecorWidth] = 3; gTasks[taskId].data[tDecorHeight] = 1; break;
    case DECORSHAPE_4x2: gTasks[taskId].data[tDecorWidth] = 4; gTasks[taskId].data[tDecorHeight] = 2; break;
    case DECORSHAPE_2x2: gTasks[taskId].data[tDecorWidth] = 2; gTasks[taskId].data[tDecorHeight] = 2; break;
    case DECORSHAPE_1x2: gTasks[taskId].data[tDecorWidth] = 1; gTasks[taskId].data[tDecorHeight] = 2; break;
    case DECORSHAPE_1x3: gTasks[taskId].data[tDecorWidth] = 1; gTasks[taskId].data[tDecorHeight] = 3; gTasks[taskId].data[tCursorY]++; break;
    case DECORSHAPE_2x4: gTasks[taskId].data[tDecorWidth] = 2; gTasks[taskId].data[tDecorHeight] = 4; break;
    case DECORSHAPE_3x3: gTasks[taskId].data[tDecorWidth] = 3; gTasks[taskId].data[tDecorHeight] = 3; break;
    case DECORSHAPE_3x2: gTasks[taskId].data[tDecorWidth] = 3; gTasks[taskId].data[tDecorHeight] = 2; break;
  }
}

/** 1:1 décomp `static void AttemptPlaceDecoration(u8 taskId)` (decoration.c:1467-1474). */
function AttemptPlaceDecoration(taskId: number): void {
  gTasks[taskId].data[tButton] = 0;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[7] = 1;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.data[7] = 1;
  ResetCursorMovement();
  AttemptPlaceDecoration_(taskId);
}

/** 1:1 décomp `static void AttemptCancelPlaceDecoration(u8 taskId)` (decoration.c:1476-1484). */
function AttemptCancelPlaceDecoration(taskId: number): void {
  gTasks[taskId].data[tButton] = 0;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[7] = 1;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.data[7] = 1;
  ResetCursorMovement();
  StringExpandPlaceholders(gStringVar4, getString('gText_CancelDecorating'));
  DisplayItemMessageOnField(taskId, gStringVar4, (t) => CancelDecoratingPrompt(t.taskId));
}

/** 1:1 décomp `static bool8 IsSecretBaseTrainerSpot(u8 behaviorAt, u16 layerType)` (decoration.c:1486-1491). */
function IsSecretBaseTrainerSpot(behaviorAt: number, layerType: number): boolean {
  if (!(MetatileBehavior_IsSecretBaseTrainerSpot(behaviorAt) === true && layerType === METATILE_LAYER_TYPE_NORMAL))
    return false;
  return true;
}

/** 1:1 décomp `static bool8 IsntInitialPosition(u8 taskId, s16 x, s16 y, u16 layerType)` (decoration.c:1493-1501).
 *  Can't place decoration where the player was standing when they interacted with the PC. */
function IsntInitialPosition(taskId: number, x: number, y: number, layerType: number): boolean {
  if (x === gTasks[taskId].data[tInitialX] + MAP_OFFSET
    && y === gTasks[taskId].data[tInitialY] + MAP_OFFSET
    && layerType !== METATILE_LAYER_TYPE_NORMAL)
    return false;
  return true;
}

/** 1:1 décomp `static bool8 IsFloorOrBoardAndHole(u16 behaviorAt, const struct Decoration *decoration)` (decoration.c:1503-1515). */
function IsFloorOrBoardAndHole(behaviorAt: number, decoration: Decoration): boolean {
  if (MetatileBehavior_IsSecretBaseTrainerSpot(behaviorAt) !== true) {
    if (decoration.id === DECOR_SOLID_BOARD && MetatileBehavior_IsSecretBaseHole(behaviorAt) === true)
      return true;

    if (MetatileBehavior_IsNormal(behaviorAt))
      return true;
  }

  return false;
}

/** 1:1 décomp `GetLayerType(tileId)` (decoration.c:1517-1526, branche non-BUGFIX = celle
 *  compilée par défaut) : `GetMetatileAttributesById(tileId) & METATILE_ATTR_LAYER_MASK`.
 *  L'extraction est incomplète (voir commentaire décomp) mais GF ne compare qu'à 0. */
function GetLayerType(tileId: number): number {
  return GetMetatileAttributesById(tileId) & 0xF000; // METATILE_ATTR_LAYER_MASK
}

/** 1:1 décomp `static bool8 CanPlaceDecoration(u8 taskId, const struct Decoration *decoration)` (decoration.c:1528-1640).
 *  `decoration->tiles[k]` → `GetDecorTiles(decoration.id)[k]` (STUB tiles.h). */
function CanPlaceDecoration(taskId: number, decoration: Decoration): boolean {
  let i: number;
  let j: number;
  let behaviorAt: number;
  let layerType: number;
  let mapY: number;
  let mapX: number;
  let curY: number;
  let curX: number;
  const tiles = GetDecorTiles(decoration.id);
  mapY = gTasks[taskId].data[tDecorHeight];
  mapX = gTasks[taskId].data[tDecorWidth];

  switch (decoration.permission) {
    case DECORPERM_SOLID_FLOOR:
    case DECORPERM_PASS_FLOOR:
      for (i = 0; i < mapY; i++) {
        curY = gTasks[taskId].data[tCursorY] - i;
        for (j = 0; j < mapX; j++) {
          curX = gTasks[taskId].data[tCursorX] + j;
          behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
          layerType = GetLayerType(NUM_TILES_IN_PRIMARY + tiles[(mapY - 1 - i) * mapX + j]);
          if (!IsFloorOrBoardAndHole(behaviorAt, decoration))
            return false;

          if (!IsntInitialPosition(taskId, curX, curY, layerType))
            return false;

          behaviorAt = GetObjectEventIdByPosition(curX, curY, 0);
          if (behaviorAt !== 0 && behaviorAt !== OBJECT_EVENTS_COUNT)
            return false;
        }
      }
      break;
    case DECORPERM_BEHIND_FLOOR:
      for (i = 0; i < mapY - 1; i++) {
        curY = gTasks[taskId].data[tCursorY] - i;
        for (j = 0; j < mapX; j++) {
          curX = gTasks[taskId].data[tCursorX] + j;
          behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
          layerType = GetLayerType(NUM_TILES_IN_PRIMARY + tiles[(mapY - 1 - i) * mapX + j]);
          if (!MetatileBehavior_IsNormal(behaviorAt) && !IsSecretBaseTrainerSpot(behaviorAt, layerType))
            return false;

          if (!IsntInitialPosition(taskId, curX, curY, layerType))
            return false;

          if (GetObjectEventIdByPosition(curX, curY, 0) !== OBJECT_EVENTS_COUNT)
            return false;
        }
      }

      curY = gTasks[taskId].data[tCursorY] - mapY + 1;
      for (j = 0; j < mapX; j++) {
        curX = gTasks[taskId].data[tCursorX] + j;
        behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
        layerType = GetLayerType(NUM_TILES_IN_PRIMARY + tiles[j]);
        if (!MetatileBehavior_IsNormal(behaviorAt) && !MetatileBehavior_IsSecretBaseNorthWall(behaviorAt))
          return false;

        if (!IsntInitialPosition(taskId, curX, curY, layerType))
          return false;

        behaviorAt = GetObjectEventIdByPosition(curX, curY, 0);
        if (behaviorAt !== 0 && behaviorAt !== OBJECT_EVENTS_COUNT)
          return false;
      }
      break;
    case DECORPERM_NA_WALL:
      for (i = 0; i < mapY; i++) {
        curY = gTasks[taskId].data[tCursorY] - i;
        for (j = 0; j < mapX; j++) {
          curX = gTasks[taskId].data[tCursorX] + j;
          if (!MetatileBehavior_IsSecretBaseNorthWall(MapGridGetMetatileBehaviorAt(curX, curY)))
            return false;

          if (MapGridGetMetatileIdAt(curX, curY + 1) === METATILE_SecretBase_SandOrnament_BrokenBase)
            return false;
        }
      }
      break;
    case DECORPERM_SPRITE:
      curY = gTasks[taskId].data[tCursorY];
      for (j = 0; j < mapX; j++) {
        curX = gTasks[taskId].data[tCursorX] + j;
        behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
        if (decoration.shape === DECORSHAPE_1x2) {
          if (!MetatileBehavior_HoldsLargeDecoration(behaviorAt))
            return false;
        } else if (!MetatileBehavior_HoldsSmallDecoration(behaviorAt)) {
          if (!MetatileBehavior_HoldsLargeDecoration(behaviorAt))
            return false;
        }

        if (GetObjectEventIdByPosition(curX, curY, 0) !== OBJECT_EVENTS_COUNT)
          return false;
      }
      break;
  }
  return true;
}

/** 1:1 décomp `static void AttemptPlaceDecoration_(u8 taskId)` (decoration.c:1642-1655). */
function AttemptPlaceDecoration_(taskId: number): void {
  if (CanPlaceDecoration(taskId, gDecorations[gCurDecorationItems[gCurDecorationIndex]]) === true) {
    StringExpandPlaceholders(gStringVar4, getString('gText_PlaceItHere'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => PlaceDecorationPrompt(t.taskId));
  } else {
    PlaySE(SE_FAILURE);
    StringExpandPlaceholders(gStringVar4, getString('gText_CantBePlacedHere'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => CantPlaceDecorationPrompt(t.taskId));
  }
}

/** 1:1 décomp `static void PlaceDecorationPrompt(u8 taskId)` (decoration.c:1657-1661). */
function PlaceDecorationPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sPlaceDecorationYesNoFunctions);
}

/** 1:1 décomp `static void PlaceDecoration(u8 taskId)` (decoration.c:1663-1683). */
function PlaceDecoration(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  PlaceDecoration_(taskId);
  if (gDecorations[gCurDecorationItems[gCurDecorationIndex]].permission !== DECORPERM_SPRITE) {
    ShowDecorationOnMap(gTasks[taskId].data[tCursorX], gTasks[taskId].data[tCursorY], gCurDecorationItems[gCurDecorationIndex]);
  } else {
    sCurDecorMapX = gTasks[taskId].data[tCursorX] - MAP_OFFSET;
    sCurDecorMapY = gTasks[taskId].data[tCursorY] - MAP_OFFSET;
    ScriptContext_SetupScript('SecretBase_EventScript_SetDecoration');
  }

  gSprites[sDecor_CameraSpriteObjectIdx1]!.y += 2;
  // 1:1 `gMapHeader.regionMapSectionId == MAPSEC_SECRET_BASE` — le port stocke la section
  // comme NOM (string), précédent pokedex_area_screen.ts:203 (`!== 'MAPSEC_NONE'`).
  if (gMapHeader!.regionMapSectionId === 'MAPSEC_SECRET_BASE')
    TryPutSecretBaseVisitOnAir();

  CancelDecorating_(taskId);
}

/** 1:1 décomp `static void PlaceDecoration_(u8 taskId)` (decoration.c:1685-1721). */
function PlaceDecoration_(taskId: number): void {
  let i: number;

  for (i = 0; i < sDecorationContext.size; i++) {
    if (sDecorationContext.items[i] === DECOR_NONE) {
      sDecorationContext.items[i] = gCurDecorationItems[gCurDecorationIndex];
      sDecorationContext.pos[i] = ((gTasks[taskId].data[tCursorX] - MAP_OFFSET) << 4) + (gTasks[taskId].data[tCursorY] - MAP_OFFSET);
      break;
    }
  }

  if (!sDecorationContext.isPlayerRoom) {
    for (i = 0; i < DECOR_MAX_SECRET_BASE; i++) {
      if (sSecretBaseItemsIndicesBuffer[i] === DECOR_NONE) {
        sSecretBaseItemsIndicesBuffer[i] = gCurDecorationIndex + 1;
        break;
      }
    }
  } else {
    for (i = 0; i < DECOR_MAX_PLAYERS_HOUSE; i++) {
      if (sPlayerRoomItemsIndicesBuffer[i] === DECOR_NONE) {
        sPlayerRoomItemsIndicesBuffer[i] = gCurDecorationIndex + 1;
        break;
      }
    }
  }
}

/** 1:1 décomp `static void CancelDecoratingPrompt(u8 taskId)` (decoration.c:1723-1727). */
function CancelDecoratingPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sCancelDecoratingYesNoFunctions);
}

/** 1:1 décomp `static void CancelDecorating(u8 taskId)` (decoration.c:1729-1733). */
function CancelDecorating(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  CancelDecorating_(taskId);
}

/** 1:1 décomp `static void CancelDecorating_(u8 taskId)` (decoration.c:1735-1740). */
function CancelDecorating_(taskId: number): void {
  FadeScreen(FADE_TO_BLACK, 0);
  gTasks[taskId].data[tState] = 0;
  gTasks[taskId].func = (t) => c1_overworld_prev_quest(t.taskId);
}

/** 1:1 décomp `static void c1_overworld_prev_quest(u8 taskId)` (decoration.c:1742-1762).
 *  `gFieldCallback = ...` → globalThis (précédent overworld.ts:1429) ; `SetMainCallback2(
 *  CB2_ReturnToField)` → CB2_ReturnToField_Manual (variante « _Manual » + discriminant
 *  harness du port). */
function c1_overworld_prev_quest(taskId: number): void {
  switch (gTasks[taskId].data[tState]) {
    case 0:
      LockPlayerFieldControls();
      if (!gPaletteFade.active) {
        WarpToInitialPosition(taskId);
        gTasks[taskId].data[tState] = 1;
      }
      break;
    case 1:
      FreePlayerSpritePalette();
      FreeSpritePaletteByTag(PLACE_DECORATION_SELECTOR_TAG);
      (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_InitDecorationItemsWindow;
      SetMainCallback2(CB2_ReturnToField_Manual);
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void Task_InitDecorationItemsWindow(u8 taskId)` (decoration.c:1764-1786).
 *  `HideSecretBaseDecorationSprites` (secret_base.c) non porté → garde-fou. */
function Task_InitDecorationItemsWindow(taskId: number): void {
  switch (gTasks[taskId].data[tState]) {
    case 0:
      HideSecretBaseDecorationSprites();
      gTasks[taskId].data[tState]++;
      break;
    case 1:
      ScriptContext_SetupScript('SecretBase_EventScript_InitDecorations');
      gTasks[taskId].data[tState]++;
      break;
    case 2:
      LockPlayerFieldControls();
      gTasks[taskId].data[tState]++;
      break;
    case 3:
      if (IsWeatherNotFadingIn() === true)
        gTasks[taskId].func = (t) => HandleDecorationItemsMenuInput(t.taskId);
      break;
  }
}

/** 1:1 décomp `static void FieldCB_InitDecorationItemsWindow(void)` (decoration.c:1788-1797). */
function FieldCB_InitDecorationItemsWindow(): void {
  let taskId: number;

  LockPlayerFieldControls();
  FadeInFromBlack();
  taskId = CreateTask((t: DecompTask) => Task_InitDecorationItemsWindow(t.taskId), 8);
  AddDecorationItemsWindow(taskId);
  gTasks[taskId].data[tState] = 0;
}

/** 1:1 décomp `static bool8 ApplyCursorMovement_IsInvalid(u8 taskId)` (decoration.c:1799-1827). */
function ApplyCursorMovement_IsInvalid(taskId: number): boolean {
  const data = gTasks[taskId].data;
  if (sDecorationLastDirectionMoved === DIR_SOUTH && data[tCursorY] - data[tDecorHeight] - 6 < 0) {
    data[tCursorY]++;
    return false;
  }

  if (sDecorationLastDirectionMoved === DIR_NORTH && data[tCursorY] - 7 >= gMapHeader!.mapLayout!.height) {
    data[tCursorY]--;
    return false;
  }

  if (sDecorationLastDirectionMoved === DIR_WEST && data[tCursorX] - 7 < 0) {
    data[tCursorX]++;
    return false;
  }

  if (sDecorationLastDirectionMoved === DIR_EAST && data[tCursorX] + data[tDecorWidth] - 8 >= gMapHeader!.mapLayout!.width) {
    data[tCursorX]--;
    return false;
  }

  return true;
}

/** 1:1 décomp `static bool8 IsHoldingDirection(void)` (decoration.c:1829-1836). */
function IsHoldingDirection(): boolean {
  const heldKeys = JOY_HELD(DPAD_ANY);
  if (heldKeys !== DPAD_UP && heldKeys !== DPAD_DOWN && heldKeys !== DPAD_LEFT && heldKeys !== DPAD_RIGHT)
    return false;

  return true;
}

/** 1:1 décomp `static void ResetCursorMovement(void)` (decoration.c:1838-1843). */
function ResetCursorMovement(): void {
  sDecorationLastDirectionMoved = 0;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[2] = 0;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[3] = 0;
}

/** 1:1 décomp `static void Task_SelectLocation(u8 taskId)` (decoration.c:1845-1912).
 *  Curseur PARTAGÉ placement + put-away : `sPlacePutAwayYesNoFunctions[cmd]` appelé avec
 *  le `taskId` brut (u8). */
function Task_SelectLocation(taskId: number): void {
  const data = gTasks[taskId].data;
  if (!gSprites[sDecor_CameraSpriteObjectIdx1]!.data[4]) {
    if (data[tButton] === A_BUTTON) {
      sPlacePutAwayYesNoFunctions[data[tDecorationItemsMenuCommand]].yesFunc(taskId);
      return;
    }

    if (data[tButton] === B_BUTTON) {
      sPlacePutAwayYesNoFunctions[data[tDecorationItemsMenuCommand]].noFunc(taskId);
      return;
    }

    if ((JOY_HELD(DPAD_ANY)) === DPAD_UP) {
      sDecorationLastDirectionMoved = DIR_SOUTH;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[2] = 0;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[3] = -2;
      data[tCursorY]--;
    }

    if ((JOY_HELD(DPAD_ANY)) === DPAD_DOWN) {
      sDecorationLastDirectionMoved = DIR_NORTH;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[2] = 0;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[3] = 2;
      data[tCursorY]++;
    }

    if ((JOY_HELD(DPAD_ANY)) === DPAD_LEFT) {
      sDecorationLastDirectionMoved = DIR_WEST;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[2] = -2;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[3] = 0;
      data[tCursorX]--;
    }

    if ((JOY_HELD(DPAD_ANY)) === DPAD_RIGHT) {
      sDecorationLastDirectionMoved = DIR_EAST;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[2] = 2;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.data[3] = 0;
      data[tCursorX]++;
    }

    if (!IsHoldingDirection() || !ApplyCursorMovement_IsInvalid(taskId))
      ResetCursorMovement();
  }

  if (sDecorationLastDirectionMoved) {
    gSprites[sDecor_CameraSpriteObjectIdx1]!.data[4]++;
    gSprites[sDecor_CameraSpriteObjectIdx1]!.data[4] &= 7;
  }

  if (!data[tButton]) {
    if (JOY_NEW(A_BUTTON))
      data[tButton] = A_BUTTON;

    if (JOY_NEW(B_BUTTON))
      data[tButton] = B_BUTTON;
  }
}

/** 1:1 décomp `static void ContinueDecorating(u8 taskId)` (decoration.c:1914-1920). */
function ContinueDecorating(taskId: number): void {
  ClearDialogWindowAndFrame(0, true);
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[7] = 0;
  gTasks[taskId].data[tButton] = 0;
  gTasks[taskId].func = (t) => Task_SelectLocation(t.taskId);
}

/** 1:1 décomp `static void CantPlaceDecorationPrompt(u8 taskId)` (decoration.c:1922-1926). */
function CantPlaceDecorationPrompt(taskId: number): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))
    ContinueDecorating(taskId);
}

/** 1:1 décomp `static void ClearPlaceDecorationGraphicsDataBuffer(struct PlaceDecorationGraphicsDataBuffer *data)` (decoration.c:1928-1931).
 *  `CpuFill16(0, data, sizeof(*data))` → zéro tous les champs (précédent .fill(0), battle_transition.ts:1276). */
function ClearPlaceDecorationGraphicsDataBuffer(data: PlaceDecorationGraphicsDataBuffer): void {
  data.decoration = null;
  data.tiles.fill(0);
  data.image.fill(0);
  data.palette.fill(0);
}

/** 1:1 décomp `static void CopyPalette(u16 *dest, u16 pal)` (decoration.c:1933-1936). */
function CopyPalette(dest: Uint16Array, pal: number): void {
  const ts = gTilesetPointer_SecretBase;
  if (ts === null) { WarnSecretBaseTilesetMissing(); return; }
  // CpuFastCopy(&palettes[pal*16], dest, PLTT_SIZE_4BPP=32B=16 u16)
  for (let i = 0; i < PLTT_SIZE_4BPP / 2; i++) dest[i] = ts.palettes[pal * 16 + i];
}

/** 1:1 décomp `static void CopyTile(u8 *dest, u16 tile)` (decoration.c:1938-1979). */
function CopyTile(dest: Uint8Array, tile: number): void {
  const ts = gTilesetPointer_SecretBase;
  if (ts === null) { WarnSecretBaseTilesetMissing(); return; }
  const buffer = new Uint8Array(TILE_SIZE_4BPP); // u8 ALIGNED(4) buffer[TILE_SIZE_4BPP]
  let mode: number;
  let i: number;

  mode = tile >> 10;
  if (tile !== 0)
    tile &= 0x03FF;

  // CpuFastCopy(&tiles[tile*TILE_SIZE_4BPP], buffer, TILE_SIZE_4BPP)
  for (i = 0; i < TILE_SIZE_4BPP; i++) buffer[i] = ts.tiles[tile * TILE_SIZE_4BPP + i];
  switch (mode) {
    case 0:
      for (i = 0; i < TILE_SIZE_4BPP; i++) dest[i] = buffer[i]; // CpuFastCopy(buffer, dest, TILE_SIZE_4BPP)
      break;
    case BG_TILE_H_FLIP(0) >> 10:
      for (i = 0; i < 8; i++) {
        dest[4 * i + 0] = (buffer[4 * (i + 1) - 1] >> 4) + ((buffer[4 * (i + 1) - 1] & 0x0F) << 4);
        dest[4 * i + 1] = (buffer[4 * (i + 1) - 2] >> 4) + ((buffer[4 * (i + 1) - 2] & 0x0F) << 4);
        dest[4 * i + 2] = (buffer[4 * (i + 1) - 3] >> 4) + ((buffer[4 * (i + 1) - 3] & 0x0F) << 4);
        dest[4 * i + 3] = (buffer[4 * (i + 1) - 4] >> 4) + ((buffer[4 * (i + 1) - 4] & 0x0F) << 4);
      }
      break;
    case BG_TILE_V_FLIP(0) >> 10:
      for (i = 0; i < 8; i++) {
        dest[4 * i + 0] = buffer[4 * (7 - i) + 0];
        dest[4 * i + 1] = buffer[4 * (7 - i) + 1];
        dest[4 * i + 2] = buffer[4 * (7 - i) + 2];
        dest[4 * i + 3] = buffer[4 * (7 - i) + 3];
      }
      break;
    case BG_TILE_H_FLIP(BG_TILE_V_FLIP(0)) >> 10:
      for (i = 0; i < 32; i++) {
        dest[i] = (buffer[31 - i] >> 4) + ((buffer[31 - i] & 0x0F) << 4);
      }
      break;
  }
}

/** 1:1 décomp `static void SetDecorSelectionBoxTiles(struct PlaceDecorationGraphicsDataBuffer *data)` (decoration.c:1981-1986). */
function SetDecorSelectionBoxTiles(data: PlaceDecorationGraphicsDataBuffer): void {
  let i: number;
  for (i = 0; i < 64; i++)
    CopyTile(data.image.subarray(i * TILE_SIZE_4BPP), data.tiles[i]);
}

/** 1:1 décomp `static u16 GetMetatile(u16 tile)` (decoration.c:1988-1991). */
function GetMetatile(tile: number): number {
  const ts = gTilesetPointer_SecretBaseRedCave;
  if (ts === null) { WarnSecretBaseTilesetMissing(); return 0; }
  return ts.metatiles[tile] & 0xFFF;
}

/** 1:1 décomp `static void SetDecorSelectionMetatiles(struct PlaceDecorationGraphicsDataBuffer *data)` (decoration.c:1993-2003). */
function SetDecorSelectionMetatiles(data: PlaceDecorationGraphicsDataBuffer): void {
  let i: number;
  let shape: number;
  const decTiles = GetDecorTiles(data.decoration!.id);

  shape = data.decoration!.shape;
  for (i = 0; i < sDecorTilemaps[shape].size; i++) {
    data.tiles[sDecorTilemaps[shape].tiles[i]] = GetMetatile(decTiles[sDecorTilemaps[shape].y[i]] * NUM_TILES_PER_METATILE + sDecorTilemaps[shape].x[i]);
  }
}

/** 1:1 décomp `static void SetDecorSelectionBoxOamAttributes(u8 decorShape)` (decoration.c:2005-2019). */
function SetDecorSelectionBoxOamAttributes(decorShape: number): void {
  sDecorSelectorOam.y = 0;
  sDecorSelectorOam.affineMode = ST_OAM_AFFINE_OFF;
  sDecorSelectorOam.objMode = ST_OAM_OBJ_NORMAL;
  sDecorSelectorOam.mosaic = false;
  sDecorSelectorOam.bpp = ST_OAM_4BPP;
  sDecorSelectorOam.shape = sDecorationMovementInfo[decorShape].shape;
  sDecorSelectorOam.x = 0;
  sDecorSelectorOam.matrixNum = 0;
  sDecorSelectorOam.size = sDecorationMovementInfo[decorShape].size;
  sDecorSelectorOam.tileNum = 0;
  sDecorSelectorOam.priority = 0;
  sDecorSelectorOam.paletteNum = 0;
}

/** 1:1 décomp `static void InitializePuttingAwayCursorSprite(struct Sprite *sprite)` (decoration.c:2021-2030). */
function InitializePuttingAwayCursorSprite(sprite: any): void {
  sprite.data[2] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
  sprite.data[6] = 0;
  sprite.data[7] = 0;
  sprite.callback = InitializePuttingAwayCursorSprite2;
}

/** 1:1 décomp `static void InitializePuttingAwayCursorSprite2(struct Sprite *sprite)` (decoration.c:2032-2048). */
function InitializePuttingAwayCursorSprite2(sprite: any): void {
  if (sprite.data[7] === 0) {
    if (sprite.data[6] < 15)
      sprite.invisible = 0;
    else
      sprite.invisible = 1;

    sprite.data[6]++;
    sprite.data[6] &= 0x1F;
  } else {
    sprite.invisible = false;
  }
}

/** 1:1 décomp `static u8 gpu_pal_decompress_alloc_tag_and_upload(struct PlaceDecorationGraphicsDataBuffer *data, u8 decor)` (decoration.c:2050-2064).
 *  L'index palette lit `RedCave->metatiles[tiles[0]*8+7] >> 12` (tileset non porté → garde). */
function gpu_pal_decompress_alloc_tag_and_upload(data: PlaceDecorationGraphicsDataBuffer, decor: number): number {
  ClearPlaceDecorationGraphicsDataBuffer(data);
  data.decoration = gDecorations[decor];
  if (data.decoration.permission === DECORPERM_SPRITE)
    return CreateObjectGraphicsSprite(GetDecorTiles(data.decoration.id)[0], SpriteCallbackDummy, 0, 0, 1);

  FreeSpritePaletteByTag(PLACE_DECORATION_SELECTOR_TAG);
  SetDecorSelectionMetatiles(data);
  SetDecorSelectionBoxOamAttributes(data.decoration.shape);
  SetDecorSelectionBoxTiles(data);
  // CopyPalette(data->palette, ((u16 *)RedCave->metatiles)[(tiles[0]*NUM_TILES_PER_METATILE)+7] >> 12)
  let palIndex = 0;
  const rc = gTilesetPointer_SecretBaseRedCave;
  if (rc !== null) palIndex = rc.metatiles[(GetDecorTiles(data.decoration.id)[0] * NUM_TILES_PER_METATILE) + 7] >> 12;
  else WarnSecretBaseTilesetMissing();
  CopyPalette(data.palette, palIndex);
  LoadSpritePalette(sSpritePal_PlaceDecoration);
  return CreateSprite(sDecorationSelectorSpriteTemplate, 0, 0, 0);
}

/** 1:1 décomp `static u8 AddDecorationIconObjectFromIconTable(u16 tilesTag, u16 paletteTag, u8 decor)` (decoration.c:2066-2093).
 *  GARDE-FOU : dépend de `LZDecompressWram` (decompress.c) + des buffers temporaires item-icon
 *  (`AllocItemIconTemporaryBuffers`/`gItemIconDecompressionBuffer`/`gItemIcon4x4Buffer`/…) +
 *  `gDecorIconTable` (data/decoration/icon.h) — NON portés. HURLE 1× → MAX_SPRITES (échec). */
let sWarnedIconTable = false;
function AddDecorationIconObjectFromIconTable(tilesTag: number, paletteTag: number, decor: number): number {
  void tilesTag; void paletteTag; void decor;
  if (!sWarnedIconTable) {
    console.error('[decoration] AddDecorationIconObjectFromIconTable (decoration.c:2066) : LZDecompressWram + buffers temp item-icon + gDecorIconTable (icon.h) non portés — icônes déco différées');
    sWarnedIconTable = true;
  }
  return MAX_SPRITES;
}

/** 1:1 décomp `static const u32 *GetDecorationIconPicOrPalette(u16 decor, u8 mode)` (decoration.c:2095-2101).
 *  GARDE-FOU : `gDecorIconTable` (data/decoration/icon.h) non porté. */
function GetDecorationIconPicOrPalette(decor: number, mode: number): Uint8Array | null {
  if (decor > NUM_DECORATIONS)
    decor = DECOR_NONE;
  void mode;
  if (!sWarnedIconTable) {
    console.error('[decoration] gDecorIconTable (data/decoration/icon.h) non porté — GetDecorationIconPicOrPalette null');
    sWarnedIconTable = true;
  }
  return null;
}

/** 1:1 décomp `static u8 AddDecorationIconObjectFromObjectEvent(u16 tilesTag, u16 paletteTag, u8 decor)` (decoration.c:2103-2137). */
function AddDecorationIconObjectFromObjectEvent(tilesTag: number, paletteTag: number, decor: number): number {
  let spriteId: number;
  const sheet: { data: Uint8Array; size: number; tag: number } = { data: sPlaceDecorationGraphicsDataBuffer.image, size: 0, tag: 0 };
  const palette: { data: Uint16Array; tag: number } = { data: sPlaceDecorationGraphicsDataBuffer.palette, tag: 0 };
  let template: any;

  ClearPlaceDecorationGraphicsDataBuffer(sPlaceDecorationGraphicsDataBuffer);
  sPlaceDecorationGraphicsDataBuffer.decoration = gDecorations[decor];
  if (sPlaceDecorationGraphicsDataBuffer.decoration.permission !== DECORPERM_SPRITE) {
    SetDecorSelectionMetatiles(sPlaceDecorationGraphicsDataBuffer);
    SetDecorSelectionBoxOamAttributes(sPlaceDecorationGraphicsDataBuffer.decoration.shape);
    SetDecorSelectionBoxTiles(sPlaceDecorationGraphicsDataBuffer);
    // CopyPalette(palette, ((u16 *)RedCave->metatiles)[(tiles[0]*NUM_TILES_PER_METATILE)+7] >> 12)
    let palIndex = 0;
    const rc = gTilesetPointer_SecretBaseRedCave;
    if (rc !== null) palIndex = rc.metatiles[(GetDecorTiles(sPlaceDecorationGraphicsDataBuffer.decoration.id)[0] * NUM_TILES_PER_METATILE) + 7] >> 12;
    else WarnSecretBaseTilesetMissing();
    CopyPalette(sPlaceDecorationGraphicsDataBuffer.palette, palIndex);
    sheet.data = sPlaceDecorationGraphicsDataBuffer.image;
    sheet.size = sDecorShapeSizes[sPlaceDecorationGraphicsDataBuffer.decoration.shape] * TILE_SIZE_4BPP;
    sheet.tag = tilesTag;
    LoadSpriteSheet(sheet);
    palette.data = sPlaceDecorationGraphicsDataBuffer.palette;
    palette.tag = paletteTag;
    LoadSpritePalette(palette);
    template = { ...sDecorWhilePlacingSpriteTemplate };
    template.tileTag = tilesTag;
    template.paletteTag = paletteTag;
    spriteId = CreateSprite(template, 0, 0, 0);
  } else {
    spriteId = CreateObjectGraphicsSprite(GetDecorTiles(sPlaceDecorationGraphicsDataBuffer.decoration.id)[0], SpriteCallbackDummy, 0, 0, 1);
  }
  return spriteId;
}

/** 1:1 décomp `u8 AddDecorationIconObject(u8 decor, s16 x, s16 y, u8 priority, u16 tilesTag, u16 paletteTag)` (decoration.c:2139-2176).
 *  `gDecorIconTable[decor][0] == NULL` → via GetDecorationIconPicOrPalette-style garde (icon.h
 *  non porté → traité comme NULL → voie FromObjectEvent, gfx-buffer garde-fouée). */
export function AddDecorationIconObject(decor: number, x: number, y: number, priority: number, tilesTag: number, paletteTag: number): number {
  let spriteId: number;

  if (decor > NUM_DECORATIONS) {
    spriteId = AddDecorationIconObjectFromIconTable(tilesTag, paletteTag, DECOR_NONE);
    if (spriteId === MAX_SPRITES)
      return MAX_SPRITES;

    gSprites[spriteId]!.x2 = x + 4;
    gSprites[spriteId]!.y2 = y + 4;
  } else if (DecorIconTableEntryIsNull(decor)) {
    spriteId = AddDecorationIconObjectFromObjectEvent(tilesTag, paletteTag, decor);
    if (spriteId === MAX_SPRITES)
      return MAX_SPRITES;

    gSprites[spriteId]!.x2 = x;
    if (decor === DECOR_SILVER_SHIELD || decor === DECOR_GOLD_SHIELD)
      gSprites[spriteId]!.y2 = y - 4;
    else
      gSprites[spriteId]!.y2 = y;
  } else {
    spriteId = AddDecorationIconObjectFromIconTable(tilesTag, paletteTag, decor);
    if (spriteId === MAX_SPRITES)
      return MAX_SPRITES;

    gSprites[spriteId]!.x2 = x + 4;
    gSprites[spriteId]!.y2 = y + 4;
  }

  SetDecorSpriteOamPriority(spriteId, priority);
  return spriteId;
}

/** `gDecorIconTable[decor][0] == NULL` — icon.h non porté → toutes les entrées traitées NULL
 *  (voie object-event). HURLE via GetDecorationIconPicOrPalette. */
function DecorIconTableEntryIsNull(decor: number): boolean {
  void GetDecorationIconPicOrPalette(decor, 0); // hurle 1× (icon.h non porté)
  return true;
}

// ═════════════════════════════════════════════════════════════════════════════
//  VAGUE 3 — PUT-AWAY / REARRANGEMENT (decoration.c:2178-2717)
//  Transcription 1:1 du flux « ranger une décoration » : marquage des décos sous le
//  curseur partagé (Task_SelectLocation, vague 2), retrait des metatiles, retour au
//  menu déco. Les 2 specials SCRIPT-SIDE de cette plage (PutAwayDecorationIteration
//  :2191, GetObjectEventLocalIdByFlag :2217) NE sont PAS transcrits ici : les specials
//  `void(void)` du port vivent dans engine/script/specials-registry.ts
//  (GetObjectEventLocalIdByFlag = 1:1 :3101 ; PutAwayDecorationIteration = listé). Les
//  dupliquer ici = VRAIE DUPE (contre-contrat). Assets gbagfx (brendan/may.pal,
//  put_away_cursor.4bpp) non inlinés → garde-fous HURLANTS (pattern GetDecorTiles).
// ═════════════════════════════════════════════════════════════════════════════

/** VAGUE 3 : `MAX_SPRITES` — sprite.h:36 (MAX_SPRITES=64) ; défini local (le port disperse
 *  la constante). Renvoyé par AddDecorationIconObjectFromIconTable (= échec). */
const MAX_SPRITES = 64;

// ─── 1:1 décomp EWRAM put-away (decoration.c:116, 127-128) ───────────────────

/** 1:1 `EWRAM_DATA static u32 UNUSED sFiller[2]` (decoration.c:116). Padding inutilisé
 *  (matérialisé pour la complétude de la carte EWRAM ; jamais lu). */
const sFiller = new Uint32Array(2);

/** 1:1 `struct DecorRearrangementDataBuffer` (decoration.h:82-88). `flagId` = `u16` (id de
 *  flag numérique) dans le décomp ; le port stocke les flags par NOM (string, cf.
 *  ObjectEventTemplate.flagId). Écrit par SetDecorRearrangementFlagIdIfFlagUnset, relu
 *  UNIQUEMENT par le special PutAwayDecorationIteration (specials-registry.ts) → typé
 *  `string` pour rester cohérent avec la représentation flag du port. */
interface DecorRearrangementDataBuffer { idx: number; width: number; height: number; flagId: string; }

/** 1:1 `EWRAM_DATA static struct DecorRearrangementDataBuffer sDecorRearrangementDataBuffer[DECOR_MAX_SECRET_BASE]`
 *  (decoration.c:127). Init `{}` → chaque entrée à 0 (flagId = '' = pas de flag). */
const sDecorRearrangementDataBuffer: DecorRearrangementDataBuffer[] =
  Array.from({ length: DECOR_MAX_SECRET_BASE }, () => ({ idx: 0, width: 0, height: 0, flagId: '' }));

let sCurDecorSelectedInRearrangement = 0; // decoration.c:128 (u8)

// ─── 1:1 décomp données put-away (decoration.c:437-507) ──────────────────────

/** 1:1 `sBrendanPalette[]/sMayPalette[] = INCGFX_U16("graphics/decorations/{brendan,may}.pal")`
 *  (decoration.c:437-439). Assets gbapal NON inlinés (comme sDecorationMenuPalette:298) →
 *  placeholder 16 couleurs = 0 ; le vrai chargement passera par le système d'assets. Garde-fou
 *  HURLANT (1×) au call-site (LoadPlayerSpritePalette). */
const sBrendanPalette = new Uint16Array(16);
const sMayPalette = new Uint16Array(16);

/** 1:1 `sDecorationPuttingAwayCursor[] = INCGFX_U8("graphics/decorations/put_away_cursor.png", ".4bpp")`
 *  (decoration.c:453). Feuille 16×16 4bpp (0x80 octets) NON inlinée → placeholder zéro
 *  (sprite curseur INERTE/transparent tant que l'asset n'est pas câblé). */
const sDecorationPuttingAwayCursor = new Uint8Array(0x80);

/** 1:1 `sReturnDecorationYesNoFunctions` (decoration.c:441-445). */
const sReturnDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: (t) => PutAwayDecoration(t.taskId),
  noFunc: (t) => ContinuePuttingAwayDecorations(t.taskId),
};

/** 1:1 `sStopPuttingAwayDecorationsYesNoFunctions` (decoration.c:447-451). */
const sStopPuttingAwayDecorationsYesNoFunctions: YesNoFuncTable = {
  yesFunc: (t) => StopPuttingAwayDecorations(t.taskId),
  noFunc: (t) => ContinuePuttingAwayDecorations(t.taskId),
};

/** 1:1 `sSpritePal_PuttingAwayCursorBrendan/May` (decoration.c:455-465). data → &{brendan,may}Palette. */
const sSpritePal_PuttingAwayCursorBrendan = { data: sBrendanPalette, tag: PLACE_DECORATION_PLAYER_TAG };
const sSpritePal_PuttingAwayCursorMay = { data: sMayPalette, tag: PLACE_DECORATION_PLAYER_TAG };

/** 1:1 `struct OamData sPuttingAwayCursorOamData` (decoration.c:467-479). SPRITE_SHAPE/SIZE(16x16)
 *  = shape 0 / size 1 (table OAM GBA, gba/types.h) ; priority 1. Même jeu de champs que
 *  sDecorSelectorOam (vague 2). */
const sPuttingAwayCursorOamData = {
  y: 0, affineMode: ST_OAM_AFFINE_OFF, objMode: ST_OAM_OBJ_NORMAL, mosaic: false, bpp: ST_OAM_4BPP,
  shape: 0, x: 0, matrixNum: 0, size: 1, tileNum: 0, priority: 1, paletteNum: 0,
};

/** 1:1 `sPuttingAwayCursorAnimCmd0`/`sPuttingAwayCursorAnimCmds` (decoration.c:481-490). 1 frame statique. */
const sPuttingAwayCursorAnimCmd0: ReadonlyArray<unknown> = [{ type: 'frame', imageValue: 0, duration: 0 }, { type: 'end' }];
const sPuttingAwayCursorAnimCmds: ReadonlyArray<ReadonlyArray<unknown>> = [sPuttingAwayCursorAnimCmd0];

/** 1:1 `struct SpriteFrameImage sPuttingAwayCursorPicTable` (decoration.c:492-496). data → &sDecorationPuttingAwayCursor. */
const sPuttingAwayCursorPicTable = { data: sDecorationPuttingAwayCursor, size: sDecorationPuttingAwayCursor.length };

/** 1:1 `sPuttingAwayCursorSpriteTemplate` (decoration.c:498-507). callback = InitializeCameraSprite1. */
const sPuttingAwayCursorSpriteTemplate = {
  tileTag: TAG_NONE,
  paletteTag: PLACE_DECORATION_PLAYER_TAG,
  oam: sPuttingAwayCursorOamData,
  anims: sPuttingAwayCursorAnimCmds,
  images: [sPuttingAwayCursorPicTable],
  affineAnims: gDummySpriteAffineAnimTable,
  callback: InitializeCameraSprite1,
};

// ─── 1:1 décomp fonctions put-away (decoration.c:2178-2717) ──────────────────

/** 1:1 décomp `static void ClearDecorationContextIndex(u8 idx)` (decoration.c:2178-2182). */
function ClearDecorationContextIndex(idx: number): void {
  sDecorationContext.items[idx] = DECOR_NONE;
  sDecorationContext.pos[idx] = 0;
}

/** 1:1 décomp `static void ClearRearrangementNonSprites(void)` (decoration.c:2231-2258).
 *  `gMapHeader.mapLayout->map[...]` → `gMapHeader!.mapLayout!.map[...]` (précédent ts:1815). */
function ClearRearrangementNonSprites(): void {
  let i: number;
  let y: number;
  let x: number;
  let posX: number;
  let posY: number;
  let perm: number;

  for (i = 0; i < sCurDecorSelectedInRearrangement; i++) {
    perm = gDecorations[sDecorationContext.items[sDecorRearrangementDataBuffer[i].idx]].permission;
    posX = sDecorationContext.pos[sDecorRearrangementDataBuffer[i].idx] >> 4;
    posY = sDecorationContext.pos[sDecorRearrangementDataBuffer[i].idx] & 0x0F;
    if (perm !== DECORPERM_SPRITE) {
      for (y = 0; y < sDecorRearrangementDataBuffer[i].height; y++) {
        for (x = 0; x < sDecorRearrangementDataBuffer[i].width; x++) {
          MapGridSetMetatileEntryAt(posX + MAP_OFFSET + x, posY + MAP_OFFSET - y, gMapHeader!.mapLayout!.map[posX + x + gMapHeader!.mapLayout!.width * (posY - y)] | 0x3000);
        }
      }

      ClearDecorationContextIndex(sDecorRearrangementDataBuffer[i].idx);
    }
  }
}

/** 1:1 décomp `static void Task_PutAwayDecoration(u8 taskId)` (decoration.c:2260-2293).
 *  Le script SecretBase_EventScript_PutAwayDecoration appelle le special
 *  PutAwayDecorationIteration (porté côté specials-registry.ts). */
function Task_PutAwayDecoration(taskId: number): void {
  switch (gTasks[taskId].data[tState]) {
    case 0:
      ClearRearrangementNonSprites();
      gTasks[taskId].data[tState] = 1;
      break;
    case 1:
      if (!gPaletteFade.active) {
        DrawWholeMapView();
        ScriptContext_SetupScript('SecretBase_EventScript_PutAwayDecoration');
        ClearDialogWindowAndFrame(0, true);
        gTasks[taskId].data[tState] = 2;
      }
      break;
    case 2:
      LockPlayerFieldControls();
      IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);
      FadeInFromBlack();
      gTasks[taskId].data[tState] = 3;
      break;
    case 3:
      if (IsWeatherNotFadingIn() === true) {
        StringExpandPlaceholders(gStringVar4, getString('gText_DecorationReturnedToPC'));
        DisplayItemMessageOnField(taskId, gStringVar4, (t) => ContinuePuttingAwayDecorationsPrompt(t.taskId));
        if (gMapHeader!.regionMapSectionId === 'MAPSEC_SECRET_BASE')
          TryPutSecretBaseVisitOnAir();
      }
      break;
  }
}

/** 1:1 décomp `static void SetUpPuttingAwayDecorationPlayerAvatar(void)` (decoration.c:2307-2322).
 *  `gSprites[...].oam.priority` → SetDecorSpriteOamPriority (précédent vague 2, ts:1325). */
function SetUpPuttingAwayDecorationPlayerAvatar(): void {
  GetPlayerFacingDirection();
  sDecor_CameraSpriteObjectIdx1 = gSprites[gFieldCamera.spriteId]!.data[0];
  LoadPlayerSpritePalette();
  gFieldCamera.spriteId = CreateSprite(sPuttingAwayCursorSpriteTemplate, 120, 80, 0);
  if (gSaveBlock2Ptr.playerGender === MALE)
    sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_BRENDAN_DECORATING, SpriteCallbackDummy, 136, 72, 0);
  else
    sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_MAY_DECORATING, SpriteCallbackDummy, 136, 72, 0);

  SetDecorSpriteOamPriority(sDecor_CameraSpriteObjectIdx2, 1);
  DestroySprite(gSprites[sDecor_CameraSpriteObjectIdx1]);
  sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;
  SetDecorSpriteOamPriority(sDecor_CameraSpriteObjectIdx1, 1);
}

/** 1:1 décomp `static void Task_ContinuePuttingAwayDecorations(u8 taskId)` (decoration.c:2324-2353). */
function Task_ContinuePuttingAwayDecorations(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[tState]) {
    case 0:
      if (!gPaletteFade.active) {
        SetInitialPositions(taskId);
        data[tState] = 1;
        data[tDecorHeight] = 1;
        data[tDecorWidth] = 1;
      }
      break;
    case 1:
      SetUpPuttingAwayDecorationPlayerAvatar();
      FadeInFromBlack();
      data[tState] = 2;
      break;
    case 2:
      if (IsWeatherNotFadingIn() === true) {
        data[tDecorationItemsMenuCommand] = DECOR_ITEMS_MENU_PUT_AWAY;
        ContinuePuttingAwayDecorations(taskId);
      }
      break;
  }
}

/** 1:1 décomp `static void ContinuePuttingAwayDecorations(u8 taskId)` (decoration.c:2355-2365). */
function ContinuePuttingAwayDecorations(taskId: number): void {
  ClearDialogWindowAndFrame(0, true);
  gSprites[sDecor_CameraSpriteObjectIdx1]!.data[7] = 0;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.invisible = false;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.callback = InitializeCameraSprite1;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.x = 136;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.y = 72;
  gTasks[taskId].data[tButton] = 0;
  gTasks[taskId].func = (t) => Task_SelectLocation(t.taskId);
}

/** 1:1 décomp `static void AttemptPutAwayDecoration(u8 taskId)` (decoration.c:2367-2372).
 *  VAGUE 3 : câblé par sPlacePutAwayYesNoFunctions[1].yesFunc (Task_SelectLocation). */
function AttemptPutAwayDecoration(taskId: number): void {
  gTasks[taskId].data[tButton] = 0;
  ResetCursorMovement();
  AttemptPutAwayDecoration_(taskId);
}

/** 1:1 décomp `static void AttemptCancelPutAwayDecoration(u8 taskId)` (decoration.c:2374-2382).
 *  VAGUE 3 : câblé par sPlacePutAwayYesNoFunctions[1].noFunc (Task_SelectLocation). */
function AttemptCancelPutAwayDecoration(taskId: number): void {
  gTasks[taskId].data[tButton] = 0;
  ResetCursorMovement();
  gSprites[sDecor_CameraSpriteObjectIdx1]!.invisible = false;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.callback = SpriteCallbackDummy;
  StringExpandPlaceholders(gStringVar4, getString('gText_StopPuttingAwayDecorations'));
  DisplayItemMessageOnField(taskId, gStringVar4, (t) => StopPuttingAwayDecorationsPrompt(t.taskId));
}

/** 1:1 décomp `static void AttemptPutAwayDecoration_(u8 taskId)` (decoration.c:2384-2412). */
function AttemptPutAwayDecoration_(taskId: number): void {
  let behavior: number;

  AttemptMarkDecorUnderCursorForRemoval(taskId);
  if (sCurDecorSelectedInRearrangement !== 0) {
    StringExpandPlaceholders(gStringVar4, getString('gText_ReturnDecorationToPC'));
    DisplayItemMessageOnField(taskId, gStringVar4, (t) => ReturnDecorationPrompt(t.taskId));
  } else {
    const data = gTasks[taskId].data;
    behavior = MapGridGetMetatileBehaviorAt(data[tCursorX], data[tCursorY]);
    if (MetatileBehavior_IsSecretBasePC(behavior) === true || MetatileBehavior_IsPlayerRoomPCOn(behavior) === true) {
      gSprites[sDecor_CameraSpriteObjectIdx1]!.invisible = false;
      gSprites[sDecor_CameraSpriteObjectIdx1]!.callback = SpriteCallbackDummy;
      StringExpandPlaceholders(gStringVar4, getString('gText_StopPuttingAwayDecorations'));
      DisplayItemMessageOnField(taskId, gStringVar4, (t) => StopPuttingAwayDecorationsPrompt(t.taskId));
    } else {
      StringExpandPlaceholders(gStringVar4, getString('gText_NoDecorationHere'));
      DisplayItemMessageOnField(taskId, gStringVar4, (t) => ContinuePuttingAwayDecorationsPrompt(t.taskId));
    }
  }
}

/** 1:1 décomp `static void ContinuePuttingAwayDecorationsPrompt(u8 taskId)` (decoration.c:2414-2418). */
function ContinuePuttingAwayDecorationsPrompt(taskId: number): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))
    ContinuePuttingAwayDecorations(taskId);
}

/** 1:1 décomp `static void SetDecorRearrangementShape(u8 decor, struct DecorRearrangementDataBuffer *data)` (decoration.c:2420-2472). */
function SetDecorRearrangementShape(decor: number, data: DecorRearrangementDataBuffer): void {
  if (gDecorations[decor].shape === DECORSHAPE_1x1) {
    data.width = 1;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x1) {
    data.width = 2;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x1) {
    data.width = 3;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_4x2) {
    data.width = 4;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x2) {
    data.width = 2;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_1x2) {
    data.width = 1;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_1x3) {
    data.width = 1;
    data.height = 3;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x4) {
    data.width = 2;
    data.height = 4;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x3) {
    data.width = 3;
    data.height = 3;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x2) {
    data.width = 3;
    data.height = 2;
  }
}

/** 1:1 décomp `static void SetCameraSpritePosition(u8 x, u8 y)` (decoration.c:2474-2480). */
function SetCameraSpritePosition(x: number, y: number): void {
  gSprites[sDecor_CameraSpriteObjectIdx1]!.invisible = true;
  gSprites[sDecor_CameraSpriteObjectIdx1]!.callback = SpriteCallbackDummy;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.x = x * 16 + 136;
  gSprites[sDecor_CameraSpriteObjectIdx2]!.y = y * 16 + 72;
}

/** 1:1 décomp `static bool8 DecorationIsUnderCursor(u8 taskId, u8 idx, struct DecorRearrangementDataBuffer *data)` (decoration.c:2482-2505). */
function DecorationIsUnderCursor(taskId: number, idx: number, data: DecorRearrangementDataBuffer): boolean {
  let x: number;
  let y: number;
  let xOff: number;
  let yOff: number;
  let ht: number;

  x = gTasks[taskId].data[tCursorX] - MAP_OFFSET;
  y = gTasks[taskId].data[tCursorY] - MAP_OFFSET;
  xOff = sDecorationContext.pos[idx] >> 4;
  yOff = sDecorationContext.pos[idx] & 0x0F;
  ht = data.height;
  if (sDecorationContext.items[idx] === DECOR_SAND_ORNAMENT && MapGridGetMetatileIdAt(xOff + MAP_OFFSET, yOff + MAP_OFFSET) === METATILE_SecretBase_SandOrnament_BrokenBase)
    ht--;

  if (x >= xOff && x < xOff + data.width && y > yOff - ht && y <= yOff) {
    SetCameraSpritePosition(data.width - (x - xOff + 1), yOff - y);
    return true;
  }

  return false;
}

/** 1:1 décomp `static void SetDecorRearrangementFlagIdIfFlagUnset(void)` (decoration.c:2507-2523).
 *  ADAPTATION : `gSaveBlock1Ptr->objectEventTemplates[i]` — le port stocke un tableau de
 *  LONGUEUR VARIABLE (≠ fixe OBJECT_EVENT_TEMPLATES_COUNT ; précédent TrySpawnObjectEvents,
 *  event_object_movement.ts:8520) → garde `undefined` (pas de crash sur slot absent).
 *  `.flagId` = NOM de flag (string) → `FlagGet(string)` (script-vars.ts, précédent
 *  event_object_movement.ts:7260). */
function SetDecorRearrangementFlagIdIfFlagUnset(): void {
  let xOff: number;
  let yOff: number;
  let i: number;

  xOff = sDecorationContext.pos[sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx] >> 4;
  yOff = sDecorationContext.pos[sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx] & 0x0F;
  for (i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++) {
    const tmpl = gSaveBlock1Ptr.objectEventTemplates[i];
    if (tmpl === undefined) continue;
    if (tmpl.x === xOff && tmpl.y === yOff && !FlagGet(tmpl.flagId)) {
      sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].flagId = tmpl.flagId;
      break;
    }
  }
}

/** 1:1 décomp `static bool8 AttemptMarkSpriteDecorUnderCursorForRemoval(u8 taskId)` (decoration.c:2525-2547).
 *  `sDecorRearrangementDataBuffer` (nu) = `&sDecorRearrangementDataBuffer[0]` → l'entrée [0]. */
function AttemptMarkSpriteDecorUnderCursorForRemoval(taskId: number): boolean {
  let i: number;

  for (i = 0; i < sDecorationContext.size; i++) {
    if (sDecorationContext.items[i] !== DECOR_NONE) {
      if (gDecorations[sDecorationContext.items[i]].permission === DECORPERM_SPRITE) {
        SetDecorRearrangementShape(sDecorationContext.items[i], sDecorRearrangementDataBuffer[0]);
        if (DecorationIsUnderCursor(taskId, i, sDecorRearrangementDataBuffer[0]) === true) {
          sDecorRearrangementDataBuffer[0].idx = i;
          SetDecorRearrangementFlagIdIfFlagUnset();
          sCurDecorSelectedInRearrangement = 1;
          return true;
        }
      }
    }
  }
  return false;
}

/** 1:1 décomp `static void MarkSpriteDecorsInBoundsForRemoval(u8 left, u8 top, u8 right, u8 bottom)` (decoration.c:2549-2568). */
function MarkSpriteDecorsInBoundsForRemoval(left: number, top: number, right: number, bottom: number): void {
  let i: number;
  let xOff: number;
  let yOff: number;
  let decor: number;

  for (i = 0; i < sDecorationContext.size; i++) {
    decor = sDecorationContext.items[i];
    xOff = sDecorationContext.pos[i] >> 4;
    yOff = sDecorationContext.pos[i] & 0x0F;
    if (decor !== DECOR_NONE && gDecorations[decor].permission === DECORPERM_SPRITE && left <= xOff && top <= yOff && right >= xOff && bottom >= yOff) {
      sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx = i;
      SetDecorRearrangementFlagIdIfFlagUnset();
      sCurDecorSelectedInRearrangement++;
    }
  }
}

/** 1:1 décomp `static void AttemptMarkDecorUnderCursorForRemoval(u8 taskId)` (decoration.c:2570-2607). */
function AttemptMarkDecorUnderCursorForRemoval(taskId: number): void {
  let i: number;
  let xOff: number;
  let yOff: number;
  let var1: number;
  let var2: number;

  sCurDecorSelectedInRearrangement = 0;
  if (AttemptMarkSpriteDecorUnderCursorForRemoval(taskId) !== true) {
    // Not a sprite.
    for (i = 0; i < sDecorationContext.size; i++) {
      var1 = sDecorationContext.items[i];
      if (var1 !== DECOR_NONE) {
        SetDecorRearrangementShape(var1, sDecorRearrangementDataBuffer[0]);
        if (DecorationIsUnderCursor(taskId, i, sDecorRearrangementDataBuffer[0]) === true) {
          sDecorRearrangementDataBuffer[0].idx = i;
          sCurDecorSelectedInRearrangement++;
          break;
        }
      }
    }
    if (sCurDecorSelectedInRearrangement !== 0) {
      xOff = sDecorationContext.pos[sDecorRearrangementDataBuffer[0].idx] >> 4;
      yOff = sDecorationContext.pos[sDecorRearrangementDataBuffer[0].idx] & 0x0F;
      var1 = yOff - sDecorRearrangementDataBuffer[0].height + 1;
      var2 = sDecorRearrangementDataBuffer[0].width + xOff - 1;

      // Remove any dolls/cushions on this decoration.
      MarkSpriteDecorsInBoundsForRemoval(xOff, var1, var2, yOff);
    }
  }
}

/** 1:1 décomp `static void ReturnDecorationPrompt(u8 taskId)` (decoration.c:2609-2613). */
function ReturnDecorationPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sReturnDecorationYesNoFunctions);
}

/** 1:1 décomp `static void PutAwayDecoration(u8 taskId)` (decoration.c:2615-2620). */
function PutAwayDecoration(taskId: number): void {
  FadeScreen(FADE_TO_BLACK, 0);
  gTasks[taskId].data[tState] = 0;
  gTasks[taskId].func = (t) => Task_PutAwayDecoration(t.taskId);
}

/** 1:1 décomp `static void StopPuttingAwayDecorationsPrompt(u8 taskId)` (decoration.c:2622-2626). */
function StopPuttingAwayDecorationsPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sStopPuttingAwayDecorationsYesNoFunctions);
}

/** 1:1 décomp `static void StopPuttingAwayDecorations(u8 taskId)` (decoration.c:2628-2632). */
function StopPuttingAwayDecorations(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  StopPuttingAwayDecorations_(taskId);
}

/** 1:1 décomp `static void StopPuttingAwayDecorations_(u8 taskId)` (decoration.c:2634-2639). */
function StopPuttingAwayDecorations_(taskId: number): void {
  FadeScreen(FADE_TO_BLACK, 0);
  gTasks[taskId].data[tState] = 0;
  gTasks[taskId].func = (t) => Task_StopPuttingAwayDecorations(t.taskId);
}

/** 1:1 décomp `static void Task_StopPuttingAwayDecorations(u8 taskId)` (decoration.c:2641-2659).
 *  `gFieldCallback = ...` → globalThis (précédent ts:1766) ; `SetMainCallback2(CB2_ReturnToField)`
 *  → CB2_ReturnToField_Manual (variante « _Manual » du port ; précédent ts:1767). */
function Task_StopPuttingAwayDecorations(taskId: number): void {
  switch (gTasks[taskId].data[tState]) {
    case 0:
      if (!gPaletteFade.active) {
        WarpToInitialPosition(taskId);
        gTasks[taskId].data[tState] = 1;
      }
      break;
    case 1:
      FreePlayerSpritePalette();
      (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_StopPuttingAwayDecorations;
      SetMainCallback2(CB2_ReturnToField_Manual);
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void Task_ReinitializeDecorationMenuHandler(u8 taskId)` (decoration.c:2661-2683). */
function Task_ReinitializeDecorationMenuHandler(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[tState]) {
    case 0:
      HideSecretBaseDecorationSprites();
      data[tState]++;
      break;
    case 1:
      ScriptContext_SetupScript('SecretBase_EventScript_InitDecorations');
      data[tState]++;
      break;
    case 2:
      LockPlayerFieldControls();
      data[tState]++;
      break;
    case 3:
      if (IsWeatherNotFadingIn() === true)
        gTasks[taskId].func = (t) => HandleDecorationActionsMenuInput(t.taskId);
      break;
  }
}

/** 1:1 décomp `static void FieldCB_StopPuttingAwayDecorations(void)` (decoration.c:2685-2694). */
function FieldCB_StopPuttingAwayDecorations(): void {
  let taskId: number;

  FadeInFromBlack();
  DrawDialogueFrame(0, true);
  InitDecorationActionsWindow();
  taskId = CreateTask((t: DecompTask) => Task_ReinitializeDecorationMenuHandler(t.taskId), 8);
  gTasks[taskId].data[tState] = 0;
}

/** 1:1 décomp `static void InitializeCameraSprite1(struct Sprite *sprite)` (decoration.c:2696-2704). */
function InitializeCameraSprite1(sprite: any): void {
  sprite.data[0]++;
  sprite.data[0] &= 0x1F;
  if (sprite.data[0] > 15)
    sprite.invisible = true;
  else
    sprite.invisible = false;
}

let sWarnedPuttingAwayCursorPal = false;
/** 1:1 décomp `static void LoadPlayerSpritePalette(void)` (decoration.c:2706-2712).
 *  Assets brendan/may.pal non inlinés (placeholder 0) → garde-fou HURLANT 1×. */
function LoadPlayerSpritePalette(): void {
  if (!sWarnedPuttingAwayCursorPal) {
    console.error('[decoration] sBrendan/sMayPalette (graphics/decorations/{brendan,may}.pal) non inlinés — palette curseur put-away = 0 (INERTE)');
    sWarnedPuttingAwayCursorPal = true;
  }
  if (gSaveBlock2Ptr.playerGender === MALE)
    LoadSpritePalette(sSpritePal_PuttingAwayCursorBrendan);
  else
    LoadSpritePalette(sSpritePal_PuttingAwayCursorMay);
}

/** 1:1 décomp `static void FreePlayerSpritePalette(void)` (decoration.c:2714-2717). Appelé par
 *  c1_overworld_prev_quest (vague 2) ET Task_StopPuttingAwayDecorations (vague 3). */
function FreePlayerSpritePalette(): void {
  FreeSpritePaletteByTag(PLACE_DECORATION_PLAYER_TAG);
}

/** `HideSecretBaseDecorationSprites` (secret_base.c) — non porté → garde-fou (retour placement/put-away). */
let sWarnedHideSbDecorSprites = false;
function HideSecretBaseDecorationSprites(): void {
  if (!sWarnedHideSbDecorSprites) {
    console.error('[decoration] HideSecretBaseDecorationSprites (secret_base.c) : non porté — retour (Task_InitDecorationItemsWindow / Task_ReinitializeDecorationMenuHandler) INERTE');
    sWarnedHideSbDecorSprites = true;
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

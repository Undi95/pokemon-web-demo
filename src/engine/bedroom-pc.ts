/**
 * bedroom-pc.ts — Port 1:1 décomp `src/player_pc.c` (= PC personnel chambre).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/player_pc.c` (= BedroomPC / PlayerPC
 *     entry points, InitPlayerPCMenu, PlayerPCProcessMenuInput, PlayerPC_TurnOff)
 *   - `data/maps/LittlerootTown_*House_2F/scripts.inc` (= EventScript_TurnOffPlayerPC
 *     scripts qui call back script-runtime)
 *
 * Pattern overlay (= différent du CB2-swap wallclock) :
 *   1. `OpenBedroomPC(isBedroom)` set sIsOpen + spawn UI windows ON TOP of overworld
 *   2. `TickBedroomPC()` polled chaque frame depuis TestOverworldScene main loop
 *   3. State machine : main_menu → item_storage (sub-menu) → msg_wait → closing
 *   4. À la fermeture (= TurnOff via B-press ou SORTIR selection) :
 *      - BedroomPC mode → ScriptContext_SetupScript(EventScript_TurnOffPlayerPC)
 *        (= playse SE_PC_OFF + special DoPCTurnOffEffect)
 *      - PlayerPC mode → SignalWaitState (= unblock script `waitstate` opcode)
 *
 * 4 options BedroomPC (= sBedroomPC_OptionOrder) :
 *   ITEM_STORAGE — PC OBJET (sub-menu RETIRER/DEPOSER/JETER/SORTIR)
 *   MAILBOX      — COURRIER (vide en early game → "Aucun MAIL.")
 *   DECORATION   — DÉCORATION (vide en early game → fallback msg)
 *   TURN_OFF     — SORTIR (= éteindre le PC)
 *
 * 3 options PlayerPC (= sPlayerPC_OptionOrder), pas DECORATION :
 *   ITEM_STORAGE / MAILBOX / TURN_OFF
 *
 * ItemStorage déférée (= PC items list + bag menu deposit/withdraw). Pour
 * la démo : sub-menu navigable, mais les actions affichent "Pas d'OBJETS."
 * si le PC est vide (= 1:1 décomp ItemStorage_Withdraw early-return).
 *
 * Mailbox déférée (= mail list + read/move/give). 0 mail en early game →
 * "Aucun MAIL." (= 1:1 décomp PlayerPC_Mailbox case count == 0).
 *
 * Decoration déférée (= DoPlayerRoomDecorationMenu = decoration.c gigantesque).
 * Fallback message en attendant le port.
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, DrawDialogueFrame, ClearDialogWindowAndFrame,
  LoadMessageBoxGfx, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3, GetStringCenterAlignXOffset, GetStringRightAlignXOffset } from './gba-text-system';
import {
  InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap,
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
} from './gba-menu-system';
import { getRuntime, PlaySE } from './decomp-globals';
import { SignalWaitState } from './script-opcodes';
import { ScriptContext_SetupScript } from './script-runtime';
import { gameState } from './game-state';
import { getString } from './gba-strings';
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import {
  CountUsedPCItemSlots, RemovePCItem, CompactPCItems, PC_ITEMS_COUNT,
} from './pc-items';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  type ListMenuTemplate, type ListMenuItem,
} from './list-menu';
import { AddBagItem } from './bag';
import { getItemNameFr } from './data-tables';
import { GetItemDescription } from './decomp-bridge';

// ─── Constantes 1:1 décomp ──────────────────────────────────────────────────

const A_BUTTON = 0x01;
const B_BUTTON = 0x02;

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;

// 1:1 décomp menu.c:25-27. Cf. start-menu.ts.
const STD_WINDOW_PALETTE_NUM = 14;
const STD_WINDOW_BASE_TILE_NUM = 0x214;

// 1:1 décomp menu.c Menu_ProcessInputNoWrap return values.
const MENU_NOTHING_CHOSEN = -2;
const MENU_B_PRESSED = -1;

// 1:1 décomp player_pc.c:239-268 sWindowTemplates_MainMenus :
//   WIN_MAIN_MENU         { bg=0, left=1, top=1, w=9, h=6, palette=15, baseBlock=1 } (= PlayerPC, 3 options)
//   WIN_MAIN_MENU_BEDROOM { bg=0, left=1, top=1, w=9, h=8, palette=15, baseBlock=1 } (= BedroomPC, 4 options)
//   WIN_ITEM_STORAGE_MENU { bg=0, left=1, top=1, w=10, h=8, palette=15, baseBlock=1 } (= sub-menu)
// Décomp override : `windowTemplate.width = GetMaxWidthInSubsetOfMenuTable(...)`.
// FR labels = "STOCKAGE OBJ." (13 chars) > "ITEM STORAGE" (12). On élargit
// width=12 pour matcher la string FR la plus large + cursor space (= ~96 px).
// 1:1 décomp player_pc.c:239-268 sWindowTemplates_MainMenus :
//   WIN_MAIN_MENU         h=6 (= 3 PlayerPC options : 3*16=48 + frame fit)
//   WIN_MAIN_MENU_BEDROOM h=8 (= 4 BedroomPC options : 4*16=64 + frame fit)
// Décomp override width via GetMaxWidthInSubsetOfMenuTable. FR labels longest
// = "STOCKAGE OBJ." (13 chars * ~6 px = 78 px). Width=11 (= 88 px content) +
// frame border = matches the actual décomp render. Height 1:1 décomp.
const WIN_MAIN_MENU_PLAYER: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 11, height: 6,
  paletteNum: 15, baseBlock: 1,
};
const WIN_MAIN_MENU_BEDROOM: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 11, height: 8,
  paletteNum: 15, baseBlock: 1,
};
const WIN_ITEM_STORAGE_MENU: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 12, height: 8,
  paletteNum: 15, baseBlock: 1,
};

// 1:1 décomp player_pc.c:298-354 sWindowTemplates_ItemStorage (= ItemStorage UI
// quand la list des PC items est ouverte). 5 windows simultanées :
//   ITEMPC_WIN_LIST     left=16 top=1  w=13 h=18 baseBlock=0x001 → liste items (droite)
//   ITEMPC_WIN_MESSAGE  left=1  top=13 w=13 h=6  baseBlock=0x0EB → description (bas-gauche)
//   ITEMPC_WIN_ICON     left=1  top=8  w=3  h=3  baseBlock=0x153 → item icon sprite anchor (skip pour démo)
//   ITEMPC_WIN_TITLE    left=1  top=1  w=13 h=2  baseBlock=0x139 → titre centered "RETIRER OBJET"
//   ITEMPC_WIN_QUANTITY left=8  top=9  w=6  h=2  baseBlock=0x15C → quantity rolling
const WIN_PC_LIST: WindowTemplate = {
  bg: 0, tilemapLeft: 16, tilemapTop: 1, width: 13, height: 18,
  paletteNum: 15, baseBlock: 0x001,
};
const WIN_PC_MESSAGE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 13, width: 13, height: 6,
  paletteNum: 15, baseBlock: 0x0EB,
};
const WIN_PC_TITLE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 13, height: 2,
  paletteNum: 15, baseBlock: 0x139,
};
const WIN_PC_QUANTITY: WindowTemplate = {
  bg: 0, tilemapLeft: 8, tilemapTop: 9, width: 6, height: 2,
  paletteNum: 15, baseBlock: 0x15C,
};
const WIN_PC_YESNO: WindowTemplate = {
  bg: 0, tilemapLeft: 9, tilemapTop: 7, width: 5, height: 4,
  paletteNum: 15, baseBlock: 0x168,
};

// 1:1 décomp WIN_DIALOGUE (= field-message-box.ts STANDARD_TEXT_BOX_TEMPLATE).
// baseBlock = 0x194 (1:1 avec field-message-box) pour éviter overlap avec :
//   - frame dialogue tiles à DLG_WINDOW_BASE_TILE_NUM=0xFC..0xFC+0x1C (28 tiles)
//   - window menu pixel buffers à baseBlock=1 (= 108 tiles pour 12×9 menu)
//   - sub-menu pixel buffers à baseBlock=1 (réutilisé après remove main menu)
// Sans ce séparation, le pixel buffer du dialogue ÉCRIT par-dessus les
// frame tiles → bordure cassée avec pixels de texte parasites.
const WIN_DIALOGUE: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4,
  paletteNum: 15, baseBlock: 0x194,
};

// ─── State ──────────────────────────────────────────────────────────────────

interface PCOption {
  /** Texte affiché (= déjà résolu en FR via getString). */
  label: string;
  /** Action handler (= 1:1 décomp sPlayerPCMenuActions[i].func.void_u8). */
  action: () => void;
}

type SubState =
  | 'main_menu'        // 1:1 décomp PlayerPCProcessMenuInput
  | 'item_storage'     // 1:1 décomp ItemStorageMenuProcessInput (sub-menu RETIRER/DEPOSER/JETER/SORTIR)
  | 'pc_list'          // 1:1 décomp ItemStorage_ProcessInput (= liste PC items active)
  | 'pc_action_msg'    // 1:1 décomp ItemStorage_HandleRemoveItem / ItemStorage_HandleErrorMessageInput
  | 'pc_toss_confirm'  // 1:1 décomp YesNo toss confirm
  | 'decoration_menu'  // 1:1 décomp HandleDecorationActionsMenuInput (DECORER/RANGER/JETER/SORTIR)
  | 'msg_wait'         // showing "No items"/"No mail" message ; A press → return prev
  | 'closing';         // cleanup en cours

let sIsOpen = false;
let sIsBedroomMode = false;  // true=BedroomPC (4 opts), false=PlayerPC (3 opts)
let sMainWindowId = -1;
let sSubWindowId = -1;
let sDialogueWindowId = -1;
let sSubState: SubState = 'main_menu';
let sMsgReturnState: SubState = 'main_menu';
let sOptions: PCOption[] = [];

// ─── ItemStorage state (= 1:1 décomp gPlayerPCItemPageInfo + sItemStorageMenu) ──
let sPCListWindowId = -1;
let sPCMessageWindowId = -1;
let sPCTitleWindowId = -1;
let sPCQuantityWindowId = -1;
let sPCYesNoWindowId = -1;
let sPCListTaskId = -1;
let sPCListItems: ListMenuItem[] = [];
let sPCInTossMode = false;  // 1:1 décomp tInTossMenu
let sPCItemCount = 0;       // 1:1 décomp gPlayerPCItemPageInfo.count (incluant Cancel)
let sPCActionMsgIsError = false;  // true = error msg (= no_room/too_important), false = remove confirmed

// ─── API publique ──────────────────────────────────────────────────────────

export function IsBedroomPCOpen(): boolean {
  return sIsOpen;
}

/** 1:1 décomp `BedroomPC(void)` / `PlayerPC(void)` (player_pc.c:373/380).
 *  Setup top-menu order + open menu UI. */
export function OpenBedroomPC(isBedroom: boolean): void {
  if (sIsOpen) return;
  sIsOpen = true;
  sIsBedroomMode = isBedroom;
  sSubState = 'main_menu';
  _showSticky(getString('gText_WhatWouldYouLike'));
  _openMainMenu();
  console.log(`[bedroom-pc] opened (mode=${isBedroom ? 'BEDROOM' : 'PLAYER'})`);
}

/** Tick called per-frame depuis MainCB2_Overworld. Drive l'input. */
export function TickBedroomPC(): void {
  if (!sIsOpen) return;
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;

  switch (sSubState) {
    case 'main_menu':       _tickMainMenu(newKeys); break;
    case 'item_storage':    _tickItemStorage(newKeys); break;
    case 'pc_list':         _tickPCList(newKeys); break;
    case 'pc_action_msg':   _tickPCActionMsg(newKeys); break;
    case 'pc_toss_confirm': _tickPCTossConfirm(newKeys); break;
    case 'decoration_menu': _tickDecorationMenu(newKeys); break;
    case 'msg_wait':        _tickMsgWait(newKeys); break;
    case 'closing':         _tickClosing(); break;
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** 1:1 décomp `DisplayItemMessageOnField` part `LoadMessageBoxAndBorderGfx`+
 *  draw frame + print str. Window sticky (= ne se ferme pas sur A press). */
function _showSticky(text: string): void {
  if (sDialogueWindowId < 0) {
    sDialogueWindowId = AddWindow(WIN_DIALOGUE);
  }
  // 1:1 décomp `LoadMessageBoxAndBorderGfx` : charge la tilemap + palette du
  // dialogue frame en VRAM. Sans ça → frame box renders en pixels du fond +
  // bordure cassée (= bug user-flag : "Que voulez-vous faire?" était entouré
  // de pixels disjoints à la 1ère ouverture).
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sDialogueWindowId, true);
  AddTextPrinterParameterized3(
    sDialogueWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, text,
  );
}

function _clearSticky(): void {
  if (sDialogueWindowId >= 0) {
    ClearDialogWindowAndFrame(sDialogueWindowId, true);
    RemoveWindow(sDialogueWindowId);
    sDialogueWindowId = -1;
  }
}

/** 1:1 décomp `InitPlayerPCMenu` (player_pc.c:393) :
 *    AddWindow + SetStandardWindowBorderStyle + PrintMenuActionTextsInUpperLeftCorner
 *    + InitMenuInUpperLeftCornerNormal + ScheduleBgCopyTilemapToVram.
 *
 *  Build sOptions selon sIsBedroomMode (= 4 vs 3 entries). */
function _openMainMenu(): void {
  sOptions = sIsBedroomMode ? _buildBedroomOptions() : _buildPlayerOptions();
  // 1:1 décomp : windowTemplate = WIN_MAIN_MENU (3 opts) ou WIN_MAIN_MENU_BEDROOM (4 opts).
  const tmpl = sIsBedroomMode ? WIN_MAIN_MENU_BEDROOM : WIN_MAIN_MENU_PLAYER;
  sMainWindowId = AddWindow(tmpl);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(
    sMainWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  _printMenuOptions(sMainWindowId, sOptions);
  InitMenuInUpperLeftCornerNormal(sMainWindowId, sOptions.length, 0);
}

function _buildBedroomOptions(): PCOption[] {
  return [
    { label: getString('gText_ItemStorage'),  action: _openItemStorage },
    { label: getString('gText_Mailbox'),      action: _openMailboxEmpty },
    { label: getString('gText_Decoration'),   action: _openDecorationEmpty },
    { label: getString('gText_TurnOff'),      action: _turnOff },
  ];
}

function _buildPlayerOptions(): PCOption[] {
  return [
    { label: getString('gText_ItemStorage'),  action: _openItemStorage },
    { label: getString('gText_Mailbox'),      action: _openMailboxEmpty },
    { label: getString('gText_TurnOff'),      action: _turnOff },
  ];
}

/** Print options text + render cursor row 0 (= InitMenuInUpperLeftCornerNormal). */
function _printMenuOptions(windowId: number, opts: PCOption[]): void {
  for (let i = 0; i < opts.length; i++) {
    AddTextPrinterParameterized3(
      windowId, FONT_NORMAL,
      8 /* cursor + space */, 1 + i * 16 /* line height 16 */,
      [1, 2, 3], TEXT_SKIP_DRAW, opts[i].label,
    );
  }
}

function _removeMainWindow(): void {
  if (sMainWindowId >= 0) {
    ClearStdWindowAndFrame(sMainWindowId, true);
    RemoveWindow(sMainWindowId);
    sMainWindowId = -1;
  }
}

function _removeSubWindow(): void {
  if (sSubWindowId >= 0) {
    ClearStdWindowAndFrame(sSubWindowId, true);
    RemoveWindow(sSubWindowId);
    sSubWindowId = -1;
  }
}

// ─── Main menu tick (= 1:1 décomp PlayerPCProcessMenuInput) ─────────────────

function _tickMainMenu(_newKeys: number): void {
  const sel = Menu_ProcessInputNoWrap();
  if (sel === MENU_NOTHING_CHOSEN) return;
  if (sel === MENU_B_PRESSED) {
    PlaySE(Songs.SE_SELECT);
    _removeMainWindow();
    _turnOff();  // 1:1 décomp : B_PRESSED → PlayerPC_TurnOff
    return;
  }
  PlaySE(Songs.SE_SELECT);
  _removeMainWindow();
  sOptions[sel].action();
}

// ─── Actions main menu options ──────────────────────────────────────────────

/** 1:1 décomp `PlayerPC_ItemStorage` (player_pc.c:451) :
 *    InitItemStorageMenu(taskId, MENU_WITHDRAW);
 *    gTasks[taskId].func = ItemStorageMenuProcessInput;
 *
 *  Open sub-menu RETIRER/DEPOSER/JETER/SORTIR. */
function _openItemStorage(): void {
  sSubState = 'item_storage';
  sSubWindowId = AddWindow(WIN_ITEM_STORAGE_MENU);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(
    sSubWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  const subOpts: PCOption[] = [
    { label: getString('gText_WithdrawItem'),  action: _itemStorageWithdraw },
    { label: getString('gText_DepositItem'),   action: _itemStorageDeposit },
    { label: getString('gText_TossItem'),      action: _itemStorageToss },
    { label: getString('gText_Cancel'),        action: _itemStorageExit },
  ];
  _printMenuOptions(sSubWindowId, subOpts);
  InitMenuInUpperLeftCornerNormal(sSubWindowId, subOpts.length, 0);
  // Update sticky dialogue with the description of the first option (=
  // 1:1 décomp `ItemStorageMenuPrint(sItemStorage_OptionDescriptions[MENU_WITHDRAW])`).
  _showSticky(getString('gText_TakeOutItemsFromPC'));
}

/** 1:1 décomp `ItemStorage_Withdraw` (player_pc.c:591-607) :
 *    tUsedSlots = CountUsedPCItemSlots();
 *    if (tUsedSlots != 0) ItemStorage_Enter(taskId, FALSE);
 *    else                 DisplayItemMessageOnField(taskId, gText_NoItems, PlayerPC_ItemStorage); */
function _itemStorageWithdraw(): void {
  PlaySE(Songs.SE_SELECT);
  if (CountUsedPCItemSlots() === 0) {
    _removeSubWindow();
    _showMessageThenReturn(getString('gText_NoItems'), 'main_menu');
    return;
  }
  _itemStorageEnter(false);
}

/** 1:1 décomp `ItemStorage_Deposit` (player_pc.c:555-569) :
 *    gTasks[taskId].func = Task_ItemStorage_Deposit;
 *    FadeScreen(FADE_TO_BLACK, 0);
 *  Puis Task_ItemStorage_Deposit : CleanupOverworldWindowsAndTilemaps() +
 *  CB2_GoToItemDepositMenu().
 *  Le bag-menu en mode DEPOSIT n'est pas porté 1:1 séparément encore — pour
 *  la démo placeholder honnête. */
function _itemStorageDeposit(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  // TODO 1:1 décomp : ouvrir bag-menu en mode DEPOSIT (= CB2_GoToItemDepositMenu).
  // Pour l'instant, fallback msg honnête.
  _showMessageThenReturn(getString('gText_NoItems'), 'main_menu');
}

/** 1:1 décomp `ItemStorage_Toss` (player_pc.c:609-624) : same flow que Withdraw
 *  mais toss=TRUE. */
function _itemStorageToss(): void {
  PlaySE(Songs.SE_SELECT);
  if (CountUsedPCItemSlots() === 0) {
    _removeSubWindow();
    _showMessageThenReturn(getString('gText_NoItems'), 'main_menu');
    return;
  }
  _itemStorageEnter(true);
}

// ─── ItemStorage UI complet (= 1:1 décomp player_pc.c:626-1510) ─────────────

/** 1:1 décomp `ItemStorage_Enter` (player_pc.c:626-642) :
 *    tInTossMenu = toss;
 *    ItemStorage_EraseMainMenu(taskId);
 *    gPlayerPCItemPageInfo.cursorPos = 0;
 *    gPlayerPCItemPageInfo.itemsAbove = 0;
 *    SetPlayerPCListCount(taskId);
 *    ItemStorage_Init();
 *    [...] ItemStorage_CreateListMenu */
function _itemStorageEnter(toss: boolean): void {
  sPCInTossMode = toss;
  _removeSubWindow();
  _clearSticky();
  sSubState = 'pc_list';
  _itemStorageCreateListMenu();
}

/** 1:1 décomp `ItemStorage_CreateListMenu` (player_pc.c:1139-1163).
 *
 *  Setup 4 windows (TITLE + ICON + MESSAGE + LIST) + ListMenuInit + scroll. */
function _itemStorageCreateListMenu(): void {
  // 1:1 décomp ItemStorage_AddWindow pour TITLE, ICON, MESSAGE (et LIST plus tard).
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  sPCTitleWindowId = AddWindow(WIN_PC_TITLE);
  DrawStdFrameWithCustomTileAndPalette(
    sPCTitleWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  sPCMessageWindowId = AddWindow(WIN_PC_MESSAGE);
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  sPCListWindowId = AddWindow(WIN_PC_LIST);
  DrawStdFrameWithCustomTileAndPalette(
    sPCListWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );

  // 1:1 décomp ItemStorage_CreateListMenu lignes 1149-1154 : title text centered.
  // FR : "RETIRER OBJET" (= gText_WithdrawItem) ou "JETER OBJET" (= gText_TossItem).
  const titleText = sPCInTossMode
    ? getString('gText_TossItem')
    : getString('gText_WithdrawItem');
  AddTextPrinterParameterized3(
    sPCTitleWindowId, FONT_NORMAL,
    GetStringCenterAlignXOffset(titleText, WIN_PC_TITLE.width * 8),
    1, [1, 2, 3], TEXT_SKIP_DRAW, titleText,
  );

  // 1:1 décomp ItemStorage_RefreshListMenu (player_pc.c:986-1009) :
  // build sListItems[] avec items du PC + "RETOUR" en dernier.
  _itemStorageRefreshList();

  // ListMenuInit avec template 1:1 décomp sListMenuTemplate_ItemStorage.
  const template: ListMenuTemplate = {
    items: sPCListItems,
    moveCursorFunc: _itemStorageMoveCursor,
    itemPrintFunc: _itemStoragePrintMenuItem,
    totalItems: sPCItemCount,
    maxShowed: Math.min(8, sPCItemCount),
    windowId: sPCListWindowId,
    header_X: 0, item_X: 8, cursor_X: 0,
    upText_Y: 9, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: 7,  // FONT_NARROW
    cursorKind: 0,  // CURSOR_BLACK_ARROW
  };
  sPCListTaskId = ListMenuInit(template, 0, 0);

  // Init description sur le 1er item (= 1:1 décomp ItemStorage_MoveCursor onInit).
  _itemStoragePrintDescription(sPCListItems[0]?.id ?? -1);
}

/** 1:1 décomp `ItemStorage_RefreshListMenu` (player_pc.c:986-1009).
 *  Build sPCListItems[] depuis gameState.pcItems + ajoute RETOUR à la fin. */
function _itemStorageRefreshList(): void {
  CompactPCItems();  // 1:1 décomp ItemStorage_CompactList → CompactPCItems
  const used = CountUsedPCItemSlots();
  sPCItemCount = used + 1;  // +1 pour Cancel
  sPCListItems = [];
  for (let i = 0; i < used; i++) {
    sPCListItems.push({
      name: getItemNameFr(gameState.pcItems[i].itemKey),
      id: i,
    });
  }
  // 1:1 décomp player_pc.c:999-1001 : last entry = LIST_CANCEL.
  sPCListItems.push({ name: getString('gText_Cancel2'), id: -2 /* LIST_CANCEL */ });
}

/** 1:1 décomp `ItemStorage_MoveCursor` (player_pc.c:1016-1029) :
 *  PlaySE(SE_SELECT) + ItemStorage_EraseItemIcon + ItemStorage_DrawItemIcon +
 *  ItemStorage_PrintDescription. */
function _itemStorageMoveCursor(itemId: number, onInit: boolean, _list: unknown): void {
  if (!onInit) PlaySE(Songs.SE_SELECT);
  _itemStoragePrintDescription(itemId);
}

/** 1:1 décomp `ItemStorage_PrintMenuItem` (player_pc.c:1031-1046) :
 *  Print quantity "× N" right-aligned à 104 px pour chaque item (= pas pour Cancel). */
function _itemStoragePrintMenuItem(windowId: number, itemId: number, yOffset: number): void {
  if (itemId === -2) return;  // LIST_CANCEL : pas de quantity
  const qty = gameState.pcItems[itemId].quantity;
  const qtyStr = `× ${String(qty).padStart(3, ' ')}`;
  // FONT_NARROW = 7.
  AddTextPrinterParameterized3(
    windowId, 7 /* FONT_NARROW */,
    GetStringRightAlignXOffset(qtyStr, 104), yOffset,
    [1, 2, 3], TEXT_SKIP_DRAW, qtyStr,
  );
}

/** 1:1 décomp `ItemStorage_PrintDescription` (player_pc.c:1048-1061).
 *  Affiche la description de l'item courant (ou gText_GoBackPrevMenu pour Cancel). */
function _itemStoragePrintDescription(itemId: number): void {
  if (sPCMessageWindowId < 0) return;
  let description: string;
  if (itemId === -2) {
    description = getString('gText_GoBackPrevMenu');
  } else if (itemId >= 0 && itemId < PC_ITEMS_COUNT) {
    description = String(GetItemDescription(gameState.pcItems[itemId].itemKey));
  } else {
    description = '';
  }
  // 1:1 décomp FillWindowPixelBuffer(windowId, PIXEL_FILL(1)) avant le printer.
  // Notre helper redraw le frame avec un fill clean.
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    sPCMessageWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, description,
  );
}

/** 1:1 décomp `ItemStorage_ProcessInput` (player_pc.c:1213-1245). */
function _tickPCList(_newKeys: number): void {
  const sel = ListMenu_ProcessInput(sPCListTaskId);
  // sel = -1 = nothing, -2 = LIST_CANCEL, >=0 = item index.
  if (sel === -1) return;  // LIST_NOTHING_CHOSEN
  if (sel === -2) {
    // LIST_CANCEL
    PlaySE(Songs.SE_SELECT);
    _itemStorageExitItemList();
    return;
  }
  // Selected an item.
  PlaySE(Songs.SE_SELECT);
  _itemStorageDoItemAction(sel);
}

/** 1:1 décomp `ItemStorage_DoItemAction` (player_pc.c:1353-1390).
 *
 *  Démarre une action Withdraw/Toss sur l'item à `pos`. Si quantity == 1,
 *  fait l'action immédiate. Sinon, devrait ouvrir le quantity rolling
 *  (= simplifié à 1 pour la démo). */
function _itemStorageDoItemAction(pos: number): void {
  const slot = gameState.pcItems[pos];
  if (!sPCInTossMode) {
    if (slot.quantity === 1) {
      _itemStorageDoItemWithdraw(pos, 1);
      return;
    }
    // 1:1 décomp : devrait ouvrir quantity rolling. Pour démo : withdraw all.
    _itemStorageDoItemWithdraw(pos, slot.quantity);
  } else {
    if (slot.quantity === 1) {
      _itemStorageStartToss(pos, 1);
      return;
    }
    _itemStorageStartToss(pos, slot.quantity);
  }
}

/** 1:1 décomp `ItemStorage_DoItemWithdraw` (player_pc.c:1424-1444). */
function _itemStorageDoItemWithdraw(pos: number, qty: number): void {
  const slot = gameState.pcItems[pos];
  if (AddBagItem(slot.itemKey, qty)) {
    // 1:1 décomp : gStringVar1 = item name, gStringVar2 = qty → "{PLAYER} a retiré N {STR_VAR_1}!"
    const itemName = getItemNameFr(slot.itemKey);
    const msg = `Retiré ${qty} ${itemName}.`;
    _itemStoragePrintWindowMessage(msg);
    sPCActionMsgIsError = false;
    sSubState = 'pc_action_msg';
    // Mark pos pour remove après confirmation A_BUTTON.
    sPCLastActionPos = pos;
    sPCLastActionQty = qty;
  } else {
    _itemStoragePrintWindowMessage(getString('gText_NoRoomInBag'));
    sPCActionMsgIsError = true;
    sSubState = 'pc_action_msg';
  }
}

/** Marker pour l'action en cours, lue à confirmation A press. */
let sPCLastActionPos = -1;
let sPCLastActionQty = 0;

/** 1:1 décomp `ItemStorage_DoItemToss` (player_pc.c:1446-1466). */
function _itemStorageStartToss(pos: number, qty: number): void {
  const slot = gameState.pcItems[pos];
  // 1:1 décomp GetItemImportance check (= pas de toss pour items importants).
  // Pour la démo on assume aucun item PC n'est important (= TM/HM exclus du PC).
  sPCLastActionPos = pos;
  sPCLastActionQty = qty;
  const itemName = getItemNameFr(slot.itemKey);
  const msg = `Vraiment jeter ${qty} ${itemName} ?`;
  _itemStoragePrintWindowMessage(msg);
  // Spawn YesNo menu (= 1:1 décomp CreateYesNoMenuWithCallbacks).
  CreateYesNoMenu(WIN_PC_YESNO, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 1);  // default = NO
  sSubState = 'pc_toss_confirm';
}

function _tickPCTossConfirm(_newKeys: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();
  // -2 = nothing, -1 = B, 0 = YES, 1 = NO.
  if (res === -2) return;
  if (res === 0) {
    // YES → throw away
    PlaySE(Songs.SE_SELECT);
    const slot = gameState.pcItems[sPCLastActionPos];
    const itemName = getItemNameFr(slot.itemKey);
    const msg = `${sPCLastActionQty} ${itemName} jeté(s).`;
    _itemStoragePrintWindowMessage(msg);
    sPCActionMsgIsError = false;
    sSubState = 'pc_action_msg';
  } else {
    // NO ou B
    PlaySE(Songs.SE_SELECT);
    // Reprint description of selected item + return to list input.
    _itemStoragePrintDescription(sPCLastActionPos);
    sSubState = 'pc_list';
  }
}

/** 1:1 décomp `ItemStorage_HandleRemoveItem` (player_pc.c:1481-1494) ou
 *  `ItemStorage_HandleErrorMessageInput` (player_pc.c:1496-1504). */
function _tickPCActionMsg(newKeys: number): void {
  if (newKeys & (A_BUTTON | B_BUTTON)) {
    PlaySE(Songs.SE_SELECT);
    if (!sPCActionMsgIsError && sPCLastActionPos >= 0) {
      // 1:1 décomp : RemovePCItem + DestroyListMenuTask + ItemStorage_CompactList + RefreshListMenu + ListMenuInit.
      RemovePCItem(sPCLastActionPos, sPCLastActionQty);
      DestroyListMenuTask(sPCListTaskId);
      _itemStorageRefreshList();
      const template: ListMenuTemplate = {
        items: sPCListItems,
        moveCursorFunc: _itemStorageMoveCursor,
        itemPrintFunc: _itemStoragePrintMenuItem,
        totalItems: sPCItemCount,
        maxShowed: Math.min(8, sPCItemCount),
        windowId: sPCListWindowId,
        header_X: 0, item_X: 8, cursor_X: 0,
        upText_Y: 9, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
        lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
        fontId: 7, cursorKind: 0,
      };
      sPCListTaskId = ListMenuInit(template, 0, 0);
    }
    sPCLastActionPos = -1;
    sPCLastActionQty = 0;
    // Reprint description (= ItemStorage_PrintMessage avec current item).
    _itemStoragePrintDescription(sPCListItems[0]?.id ?? -2);
    sSubState = 'pc_list';
  }
}

/** Print message in WIN_PC_MESSAGE (clear + write). */
function _itemStoragePrintWindowMessage(text: string): void {
  if (sPCMessageWindowId < 0) return;
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    sPCMessageWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, text,
  );
}

/** 1:1 décomp `ItemStorage_ExitItemList` (player_pc.c:1263-1272) :
 *    ItemStorage_EraseItemIcon + RemoveScrollIndicator + DestroyListMenuTask +
 *    ItemStorage_Free + gTasks[taskId].func = ItemStorage_ReturnToMenuSelect. */
function _itemStorageExitItemList(): void {
  // Cleanup all 4 PC windows.
  if (sPCListTaskId >= 0) {
    DestroyListMenuTask(sPCListTaskId);
    sPCListTaskId = -1;
  }
  _removePCWindows();
  // 1:1 décomp `ItemStorage_ReturnToMenuSelect` : InitItemStorageMenu(taskId, MENU_WITHDRAW/MENU_TOSS).
  sSubState = 'item_storage';
  _openItemStorage();
}

function _removePCWindows(): void {
  for (const id of [sPCListWindowId, sPCMessageWindowId, sPCTitleWindowId,
                    sPCQuantityWindowId, sPCYesNoWindowId]) {
    if (id >= 0) {
      ClearStdWindowAndFrame(id, true);
      RemoveWindow(id);
    }
  }
  sPCListWindowId = -1;
  sPCMessageWindowId = -1;
  sPCTitleWindowId = -1;
  sPCQuantityWindowId = -1;
  sPCYesNoWindowId = -1;
}

/** 1:1 décomp `ItemStorage_Exit` (player_pc.c:644) :
 *    ItemStorage_EraseMainMenu(taskId);
 *    ReshowPlayerPC(taskId);  ← DisplayItemMessageOnField + InitPlayerPCMenu */
function _itemStorageExit(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  sSubState = 'main_menu';
  _showSticky(getString('gText_WhatWouldYouLike'));
  _openMainMenu();
}

function _tickItemStorage(_newKeys: number): void {
  const sel = Menu_ProcessInputNoWrap();
  if (sel === MENU_NOTHING_CHOSEN) return;
  if (sel === MENU_B_PRESSED) {
    PlaySE(Songs.SE_SELECT);
    _itemStorageExit();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  switch (sel) {
    case 0: _itemStorageWithdraw(); break;
    case 1: _itemStorageDeposit(); break;
    case 2: _itemStorageToss(); break;
    case 3: _itemStorageExit(); break;
  }
}

/** 1:1 décomp `PlayerPC_Mailbox` (player_pc.c:457) : count == 0 → "No mail." */
function _openMailboxEmpty(): void {
  _showMessageThenReturn(getString('gText_NoMailHere'), 'main_menu');
}

/** 1:1 décomp `PlayerPC_Decoration` (player_pc.c:487-490) :
 *    DoPlayerRoomDecorationMenu(taskId);
 *
 *  Ouvre le sub-menu Decoration (= 1:1 décomp decoration.c:591-599) avec
 *  4 options : DECORER / RANGER / JETER / SORTIR (= sDecorationMainMenuActions).
 *  Notre port : ouvre une fenêtre menu + sticky description per option.
 *
 *  Les actions DECORER/RANGER/JETER déclenchent le UI complet decoration.c
 *  (= ~5000 lignes, place item dans le room, list categories, etc.).
 *  En early game : GetNumOwnedDecorations() == 0 + HasDecorationsInUse() == FALSE
 *  → tous renvoient un msg honnête depuis strings.json. */
function _openDecorationEmpty(): void {
  _removeMainWindow();
  _clearSticky();
  sSubState = 'decoration_menu';
  // 1:1 décomp `InitDecorationActionsWindow` : crée le window "main menu" decoration.
  sSubWindowId = AddWindow(WIN_ITEM_STORAGE_MENU);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(
    sSubWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  // 1:1 décomp sDecorationMainMenuActions : 4 options.
  const decoOpts: PCOption[] = [
    { label: getString('gText_Decorate'),  action: _decorationActionDecorate },
    { label: getString('gText_PutAway'),   action: _decorationActionPutAway },
    { label: getString('gText_Toss2'),     action: _decorationActionToss },
    { label: getString('gText_Cancel'),    action: _decorationActionCancel },
  ];
  _printMenuOptions(sSubWindowId, decoOpts);
  InitMenuInUpperLeftCornerNormal(sSubWindowId, decoOpts.length, 0);
  // 1:1 décomp `PrintCurMainMenuDescription` (decoration.c:625-629) : print
  // description du first option dans la sticky.
  _showSticky(getString('gText_PutOutSelectedDecorItem'));
}

/** 1:1 décomp `DecorationMenuAction_Decorate` (decoration.c:631-644) :
 *    if (GetNumOwnedDecorations() == 0)
 *        DisplayItemMessageOnField(taskId, gText_NoDecorations, ...);
 *    else
 *        gTasks[taskId].tDecorationMenuCommand = DECOR_MENU_PLACE;
 *        SecretBasePC_PrepMenuForSelectingStoredDecors(taskId);
 *  En early game : aucune décoration → branch NoDecorations. */
function _decorationActionDecorate(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  _showMessageThenReturn(getString('gText_NoDecorations'), 'main_menu');
}

/** 1:1 décomp `DecorationMenuAction_PutAway` (decoration.c:646-661) :
 *    if (!HasDecorationsInUse(taskId)) → gText_NoDecorationsInUse */
function _decorationActionPutAway(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  _showMessageThenReturn(getString('gText_NoDecorationsInUse'), 'main_menu');
}

/** 1:1 décomp `DecorationMenuAction_Toss` (decoration.c:663-678) : same
 *  flow que Decorate (= gText_NoDecorations si aucune deco). */
function _decorationActionToss(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  _showMessageThenReturn(getString('gText_NoDecorations'), 'main_menu');
}

/** 1:1 décomp `DecorationMenuAction_Cancel` (decoration.c) :
 *    HideStartMenu(); ReshowPlayerPC(taskId); */
function _decorationActionCancel(): void {
  PlaySE(Songs.SE_SELECT);
  _removeSubWindow();
  sSubState = 'main_menu';
  _showSticky(getString('gText_WhatWouldYouLike'));
  _openMainMenu();
}

/** 1:1 décomp `HandleDecorationActionsMenuInput` (decoration.c:601-623). */
function _tickDecorationMenu(_newKeys: number): void {
  const sel = Menu_ProcessInputNoWrap();
  if (sel === MENU_NOTHING_CHOSEN) return;
  if (sel === MENU_B_PRESSED) {
    PlaySE(Songs.SE_SELECT);
    _decorationActionCancel();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  switch (sel) {
    case 0: _decorationActionDecorate(); break;
    case 1: _decorationActionPutAway(); break;
    case 2: _decorationActionToss(); break;
    case 3: _decorationActionCancel(); break;
  }
}

/** 1:1 décomp `PlayerPC_TurnOff` (player_pc.c:492) :
 *    if (BEDROOM) ScriptContext_SetupScript(EventScript_TurnOffPlayerPC);
 *    else         ScriptContext_Enable();
 *    DestroyTask(taskId); */
function _turnOff(): void {
  _removeMainWindow();
  _clearSticky();
  sSubState = 'closing';
}

function _tickClosing(): void {
  if (sIsBedroomMode) {
    // 1:1 décomp : run TurnOffPlayerPC script per gender (= playse SE_PC_OFF
    // + special DoPCTurnOffEffect + releaseall + end).
    const gender = gameState.gender;
    const scriptLabel = gender === 'MALE'
      ? 'LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC'
      : 'LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC';
    ScriptContext_SetupScript(scriptLabel);
  } else {
    // PlayerPC mode : just unblock the calling script `waitstate` opcode.
    SignalWaitState();
  }
  sIsOpen = false;
  sSubState = 'main_menu';
  console.log('[bedroom-pc] closed');
}

// ─── Message display helper ─────────────────────────────────────────────────

/** Show a simple message in the sticky dialogue + state→msg_wait.
 *  When user presses A/B, the message clears + sub-state→prevState. */
function _showMessageThenReturn(text: string, returnState: SubState): void {
  _showSticky(text);
  sMsgReturnState = returnState;
  sSubState = 'msg_wait';
}

function _tickMsgWait(newKeys: number): void {
  if (newKeys & (A_BUTTON | B_BUTTON)) {
    PlaySE(Songs.SE_SELECT);
    if (sMsgReturnState === 'main_menu') {
      sSubState = 'main_menu';
      _showSticky(getString('gText_WhatWouldYouLike'));
      _openMainMenu();
    } else if (sMsgReturnState === 'item_storage') {
      // Re-open item storage sub-menu (= 1:1 décomp ItemStorage_Withdraw
      // fallback : DisplayItemMessageOnField → callback `PlayerPC_ItemStorage`).
      _openItemStorage();
    }
  }
}

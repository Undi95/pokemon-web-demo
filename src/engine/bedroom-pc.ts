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
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save-block-state';
import { FEMALE } from './decomp-globals';
import { getString } from './gba-strings';
import { setStringVar } from './string-buffers';
import { StringExpandPlaceholders } from './gba-text-system';
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import {
  CountUsedPCItemSlots, RemovePCItem, CompactPCItems, AddPCItem, PC_ITEMS_COUNT,
} from './pc-items';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  type ListMenuTemplate, type ListMenuItem,
} from './list-menu';
import { AddBagItem } from './bag';
import { getItemNameFr } from './data-tables';
import { GetItemDescription } from './decomp-bridge';
import {
  AddItemIconSprite, MAX_SPRITES,
} from './item-icon';
import { FreeSpriteTilesByTag } from './decomp-globals';

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
  | 'pc_qty_rolling'   // 1:1 décomp ItemStorage_HandleQuantityRolling (D-pad adjust qty)
  | 'pc_swap'          // 1:1 décomp ItemStorage_ProcessItemSwapInput (SELECT pressed)
  | 'pc_action_msg'    // 1:1 décomp ItemStorage_HandleRemoveItem / ItemStorage_HandleErrorMessageInput
  | 'pc_toss_confirm'  // 1:1 décomp YesNo toss confirm
  | 'mailbox_list'     // 1:1 décomp Mailbox_ProcessInput (list-menu mails même vide)
  | 'decoration_menu'  // 1:1 décomp HandleDecorationActionsMenuInput (DECORER/RANGER/JETER/SORTIR)
  | 'deposit_list'     // 1:1 décomp CB2_GoToItemDepositMenu : list bag items + select → AddPCItem
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

// 1:1 décomp player_pc.c:82 :
//   #define TAG_ITEM_ICON 5110
const TAG_ITEM_ICON = 5110;
let sPCIconSpriteId = -1;  // 1:1 décomp sItemStorageMenu->spriteId (init = SPRITE_NONE)

// 1:1 décomp tQuantity (= gTasks.data[2]) pour le rolling quantity.
let sPCQuantitySelected = 1;
// 1:1 décomp toSwapPos (= sItemStorageMenu->toSwapPos) — pos en cours de swap.
let sPCSwapFromPos = -1;
// 1:1 décomp NOT_SWAPPING = 0xFF ; on utilise -1 en TS.
const NOT_SWAPPING = -1;

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
    case 'pc_qty_rolling':  _tickPCQuantityRolling(newKeys); break;
    case 'pc_swap':         _tickPCSwap(newKeys); break;
    case 'pc_action_msg':   _tickPCActionMsg(newKeys); break;
    case 'pc_toss_confirm': _tickPCTossConfirm(newKeys); break;
    case 'mailbox_list':    _tickMailboxList(newKeys); break;
    case 'decoration_menu': _tickDecorationMenu(newKeys); break;
    case 'deposit_list':    _tickDepositList(newKeys); break;
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
 *  CB2_GoToItemDepositMenu(). CB2 swap vers bag-menu en mode DEPOSIT.
 *
 *  Notre port : inline DEPOSIT UI (= list bag items + select → AddPCItem +
 *  RemoveBagItem). Réutilise pattern ItemStorage UI (= list-menu + desc). */
/** 1:1 décomp `ItemStorage_Deposit` (player_pc.c:555-559) :
 *    gTasks[taskId].func = Task_ItemStorage_Deposit;
 *    FadeScreen(FADE_TO_BLACK, 0);
 *  Puis `Task_ItemStorage_Deposit` (561-569) après fade :
 *    CleanupOverworldWindowsAndTilemaps();
 *    CB2_GoToItemDepositMenu();   ← bascule sur le BAG MENU en mode ItemPC
 *    DestroyTask(taskId);
 *  Le `CB2_GoToItemDepositMenu` ouvre le bag complet (= GoToBagMenu(
 *  ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, CB2_PlayerPCExitBagMenu)) qui
 *  permet de choisir un item depuis le sac, prompt qty, deposit, return PC.
 *
 *  Notre port (honest min) : ferme le PC + ouvre le bag overworld. Le
 *  context menu deposit complet (= "DEPOSER" + qty rolling depuis le bag)
 *  reste à câbler dans `bag-screen.ts` sous le flag mode `ITEM_PC`. */
function _itemStorageDeposit(): void {
  PlaySE(Songs.SE_SELECT);
  // 1:1 décomp : ferme le PC entièrement avant d'ouvrir le bag.
  // Cleanup state.
  _removeSubWindow();
  _clearSticky();
  _removePCWindows();
  _itemStorageEraseItemIcon();
  if (sPCListTaskId >= 0) {
    DestroyListMenuTask(sPCListTaskId);
    sPCListTaskId = -1;
  }
  sIsOpen = false;
  // Open bag en mode ITEMPC (= 1:1 décomp `CB2_GoToItemDepositMenu` →
  // `GoToBagMenu(ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, CB2_PlayerPCExitBagMenu)`).
  // Le exitCallback = re-open PC menu après close du bag (= 1:1 décomp
  // `CB2_PlayerPCExitBagMenu` → `ItemStorage_ReshowAfterBagMenu`).
  void import('./bag-screen').then(({ OpenBagScreen, BAG_LOCATION_ITEMPC }) => {
    OpenBagScreen(undefined, BAG_LOCATION_ITEMPC, () => {
      // Re-open le PC menu — switch directement vers RETIRER (= user-flag
      // "dès qu'on depose on est switch vers le retrait").
      void import('./bedroom-pc').then(({ OpenBedroomPC }) => {
        // isBedroom=true → re-ouvre le PC dans la bedroom (= chambre joueur).
        // 1:1 décomp `ItemStorage_ReshowAfterBagMenu` reload le state PlayerPC
        // tel qu'il était à l'open (= bedroom). PC de Centre Pokémon = isBedroom=false.
        OpenBedroomPC(true);
        // Auto-switch vers item_storage RETIRER pour cohérence flow user.
        // Use timeout pour laisser le main menu se draw d'abord.
        setTimeout(() => {
          if (sIsOpen && sSubState === 'main_menu') {
            // Simulate user pressing A on "STOCKAGE OBJ.": _openItemStorage.
            // Direct call to _itemStorageEnter(false) puis bypass main_menu.
          }
        }, 100);
      });
    });
  });
}

// ─── DEPOSIT bag → PC UI ────────────────────────────────────────────────────

let sDepositListItems: ListMenuItem[] = [];
let sDepositBagSlotIndices: number[] = [];  // map listIndex → bag.items[slotIdx]

/** Ouvre la list-menu des items du bag (= pocket ITEMS uniquement, comme décomp).
 *  1:1 décomp : ItemDeposit_OpenBagMenu → liste les items pocket "Items" du bag. */
function _depositOpenList(): void {
  // Setup 3 windows : TITLE / MESSAGE / LIST (= même layout que ItemStorage).
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
  // Title centered "DEPOSER OBJET".
  const titleText = getString('gText_DepositItem');
  AddTextPrinterParameterized3(
    sPCTitleWindowId, FONT_NORMAL,
    GetStringCenterAlignXOffset(titleText, WIN_PC_TITLE.width * 8),
    1, [1, 2, 3], TEXT_SKIP_DRAW, titleText,
  );
  // Build list-items depuis bag.items (pocket Items uniquement, 1:1 décomp DEPOSIT
  // ne dépose que les pocket Items).
  sDepositListItems = [];
  sDepositBagSlotIndices = [];
  const bagItems = gSaveBlock1Ptr.bag.items;
  for (let i = 0; i < bagItems.length; i++) {
    if (bagItems[i].itemKey) {
      sDepositListItems.push({
        name: getItemNameFr(bagItems[i].itemKey),
        id: sDepositListItems.length,
      });
      sDepositBagSlotIndices.push(i);
    }
  }
  // Cancel entry à la fin.
  sDepositListItems.push({ name: getString('gText_Cancel2'), id: -2 });
  // Build list-menu.
  const template: ListMenuTemplate = {
    items: sDepositListItems,
    moveCursorFunc: _depositMoveCursor,
    itemPrintFunc: _depositPrintMenuItem,
    totalItems: sDepositListItems.length,
    maxShowed: Math.min(8, sDepositListItems.length),
    windowId: sPCListWindowId,
    header_X: 0, item_X: 8, cursor_X: 0,
    upText_Y: 9, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: 7, cursorKind: 0,
  };
  sPCListTaskId = ListMenuInit(template, 0, 0);
  // Init icon + description.
  const firstId = sDepositListItems[0]?.id ?? -2;
  if (firstId === -2) {
    _itemStorageDrawItemIcon('ITEM_LIST_END');
  } else {
    const bagIdx = sDepositBagSlotIndices[firstId];
    _itemStorageDrawItemIcon(gSaveBlock1Ptr.bag.items[bagIdx].itemKey);
  }
  _depositPrintDescription(firstId);
}

function _depositMoveCursor(itemId: number, onInit: boolean, _list: unknown): void {
  if (!onInit) PlaySE(Songs.SE_SELECT);
  _itemStorageEraseItemIcon();
  if (itemId === -2) {
    _itemStorageDrawItemIcon('ITEM_LIST_END');
  } else if (itemId >= 0 && itemId < sDepositBagSlotIndices.length) {
    const bagIdx = sDepositBagSlotIndices[itemId];
    _itemStorageDrawItemIcon(gSaveBlock1Ptr.bag.items[bagIdx].itemKey);
  }
  _depositPrintDescription(itemId);
}

function _depositPrintMenuItem(windowId: number, itemId: number, yOffset: number): void {
  if (itemId === -2) return;
  if (itemId < 0 || itemId >= sDepositBagSlotIndices.length) return;
  const bagIdx = sDepositBagSlotIndices[itemId];
  const qty = gSaveBlock1Ptr.bag.items[bagIdx].quantity;
  const qtyStr = `× ${String(qty).padStart(3, ' ')}`;
  AddTextPrinterParameterized3(
    windowId, 7 /* FONT_NARROW */,
    GetStringRightAlignXOffset(qtyStr, 104), yOffset,
    [1, 2, 3], TEXT_SKIP_DRAW, qtyStr,
  );
}

function _depositPrintDescription(itemId: number): void {
  if (sPCMessageWindowId < 0) return;
  let description: string;
  if (itemId === -2) {
    description = getString('gText_GoBackPrevMenu');
  } else if (itemId >= 0 && itemId < sDepositBagSlotIndices.length) {
    const bagIdx = sDepositBagSlotIndices[itemId];
    description = String(GetItemDescription(gSaveBlock1Ptr.bag.items[bagIdx].itemKey));
  } else {
    description = '';
  }
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    sPCMessageWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, description,
  );
}

function _tickDepositList(_newKeys: number): void {
  const sel = ListMenu_ProcessInput(sPCListTaskId);
  if (sel === -1) return;
  if (sel === -2) {
    PlaySE(Songs.SE_SELECT);
    _depositExitList();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  // 1:1 décomp `Task_ItemContext_Deposit` (item_menu.c:2203-2221) :
  //   tItemCount = 1;
  //   if (qty == 1) TryDepositItem(taskId);
  //   else { msg "DepositHowMany" + AddItemQuantityWindow + Task_ChooseHowManyToDeposit }
  const bagIdx = sDepositBagSlotIndices[sel];
  const slot = gSaveBlock1Ptr.bag.items[bagIdx];
  sPCLastActionPos = sel;  // bagIdx via mapping sDepositBagSlotIndices[sel]
  sPCQuantitySelected = 1;
  if (slot.quantity === 1) {
    _depositDoDeposit(bagIdx, 1);
    return;
  }
  // 1:1 décomp : "Déposer combien?" via gText_DepositHowManyVar1.
  const itemName = getItemNameFr(slot.itemKey);
  setStringVar(1, itemName);
  const tpl = getString('gText_DepositHowManyVar1') ?? 'Déposer combien?';
  _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
  _itemStorageShowQuantityWindow();
  // Réutilise pc_qty_rolling via flag sPCInDepositQtyMode (= variant deposit).
  sSubState = 'pc_qty_rolling';
  sPCInDepositQtyMode = true;
}

let sPCInDepositQtyMode = false;

/** 1:1 décomp `TryDepositItem` (item_menu.c:2248-2274) : AddPCItem + remove from bag,
 *  ou error "no room". Sur success → message + switch state vers withdraw (= user-flag :
 *  après dépôt, switch vers RETIRER au lieu de rester dans dépôt). */
function _depositDoDeposit(bagIdx: number, qty: number): void {
  const slot = gSaveBlock1Ptr.bag.items[bagIdx];
  const itemName = getItemNameFr(slot.itemKey);
  if (AddPCItem(slot.itemKey, qty)) {
    slot.quantity -= qty;
    if (slot.quantity === 0) slot.itemKey = '';
    // 1:1 décomp `gText_DepositedVar2Var1s` = "{STR_VAR_2} {STR_VAR_1} déposé(s)."
    setStringVar(1, itemName);
    setStringVar(2, String(qty));
    const tpl = getString('gText_DepositedVar2Var1s') ?? '{STR_VAR_2} {STR_VAR_1} déposé(s).';
    _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
    sPCActionMsgIsError = false;
    sPCDepositJustDone = true;  // = switch vers RETIRER au prochain A press
    sPCLastActionPos = -1;
    sSubState = 'pc_action_msg';
  } else {
    // 1:1 décomp `gText_NoRoomForItems` = "Pas de place pour les objets."
    _itemStoragePrintWindowMessage(getString('gText_NoRoomForItems') ?? 'Pas de place pour les objets.');
    sPCActionMsgIsError = true;
    sSubState = 'pc_action_msg';
  }
}

let sPCDepositJustDone = false;

function _depositExitList(): void {
  _itemStorageEraseItemIcon();
  if (sPCListTaskId >= 0) {
    DestroyListMenuTask(sPCListTaskId);
    sPCListTaskId = -1;
  }
  _removePCWindows();
  sSubState = 'item_storage';
  _openItemStorage();
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
  sPCListTaskId = ListMenuInit(_buildPCListTemplate(), 0, 0);

  // Init icon + description sur le 1er item (= 1:1 décomp ItemStorage_MoveCursor onInit).
  const firstId = sPCListItems[0]?.id ?? -2;
  if (firstId === -2) {
    _itemStorageDrawItemIcon('ITEM_LIST_END');
  } else {
    _itemStorageDrawItemIcon(gSaveBlock1Ptr.pcItems[firstId].itemKey);
  }
  _itemStoragePrintDescription(firstId);
}

/** 1:1 décomp `ItemStorage_RefreshListMenu` (player_pc.c:986-1009).
 *  Build sPCListItems[] depuis gSaveBlock1Ptr.pcItems + ajoute RETOUR à la fin. */
function _itemStorageRefreshList(): void {
  CompactPCItems();  // 1:1 décomp ItemStorage_CompactList → CompactPCItems
  const used = CountUsedPCItemSlots();
  sPCItemCount = used + 1;  // +1 pour Cancel
  sPCListItems = [];
  for (let i = 0; i < used; i++) {
    sPCListItems.push({
      name: getItemNameFr(gSaveBlock1Ptr.pcItems[i].itemKey),
      id: i,
    });
  }
  // 1:1 décomp player_pc.c:999-1001 : last entry = LIST_CANCEL.
  sPCListItems.push({ name: getString('gText_Cancel2'), id: -2 /* LIST_CANCEL */ });
}

/** 1:1 décomp `ItemStorage_MoveCursor` (player_pc.c:1016-1029) :
 *    if (onInit != TRUE) PlaySE(SE_SELECT);
 *    if (toSwapPos == NOT_SWAPPING) {
 *        ItemStorage_EraseItemIcon();
 *        if (id != LIST_CANCEL)
 *            ItemStorage_DrawItemIcon(pcItems[id].itemId);
 *        else
 *            ItemStorage_DrawItemIcon(ITEM_LIST_END);
 *        ItemStorage_PrintDescription(id);
 *    }
 *
 *  En swap mode, le cursor move ne change pas l'icone (= track l'item en
 *  cours de swap visuellement via la swap arrow). */
function _itemStorageMoveCursor(itemId: number, onInit: boolean, _list: unknown): void {
  if (!onInit) PlaySE(Songs.SE_SELECT);
  if (sPCSwapFromPos === NOT_SWAPPING) {
    _itemStorageEraseItemIcon();
    if (itemId === -2) {
      // LIST_CANCEL : draw "return" icon (= ITEM_LIST_END dans le décomp).
      _itemStorageDrawItemIcon('ITEM_LIST_END');
    } else if (itemId >= 0 && itemId < PC_ITEMS_COUNT) {
      _itemStorageDrawItemIcon(gSaveBlock1Ptr.pcItems[itemId].itemKey);
    }
    _itemStoragePrintDescription(itemId);
  }
}

/** 1:1 décomp `ItemStorage_DrawItemIcon` (player_pc.c:1096-1114) :
 *    if (spriteId == SPRITE_NONE) {
 *        FreeSpriteTilesByTag(TAG_ITEM_ICON); FreeSpritePaletteByTag(TAG_ITEM_ICON);
 *        spriteId = AddItemIconSprite(TAG_ITEM_ICON, TAG_ITEM_ICON, itemId);
 *        gSprites[spriteId].oam.priority = 0;
 *        gSprites[spriteId].x2 = 24;
 *        gSprites[spriteId].y2 = 80;
 *    } */
function _itemStorageDrawItemIcon(itemKey: string): void {
  if (sPCIconSpriteId !== -1) return;  // already drawn
  FreeSpriteTilesByTag(TAG_ITEM_ICON);
  const spriteId = AddItemIconSprite(TAG_ITEM_ICON, TAG_ITEM_ICON, itemKey);
  if (spriteId === MAX_SPRITES) return;
  sPCIconSpriteId = spriteId;
  // 1:1 décomp lines 1109-1111 : oam priority=0, x2=24, y2=80 (= sprite anchor).
  const rt = getRuntime() as unknown as {
    gSprites?: Map<number, { x2: number; y2: number; oam?: { priority: number } }>
  } | null;
  const spr = rt?.gSprites?.get(spriteId);
  if (spr) {
    spr.x2 = 24;
    spr.y2 = 80;
    if (spr.oam) spr.oam.priority = 0;
  }
}

/** 1:1 décomp `ItemStorage_EraseItemIcon` (player_pc.c:1116-1126). */
function _itemStorageEraseItemIcon(): void {
  if (sPCIconSpriteId === -1) return;
  FreeSpriteTilesByTag(TAG_ITEM_ICON);
  // 1:1 décomp : DestroySprite(&gSprites[*spriteIdLoc]).
  const rt = getRuntime() as unknown as {
    DestroySprite?: (spriteId: number) => void;
  } | null;
  rt?.DestroySprite?.(sPCIconSpriteId);
  sPCIconSpriteId = -1;
}

/** 1:1 décomp `ItemStorage_PrintMenuItem` (player_pc.c:1031-1046) :
 *  Print quantity "× N" right-aligned à 104 px pour chaque item (= pas pour Cancel). */
function _itemStoragePrintMenuItem(windowId: number, itemId: number, yOffset: number): void {
  if (itemId === -2) return;  // LIST_CANCEL : pas de quantity
  const qty = gSaveBlock1Ptr.pcItems[itemId].quantity;
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
    description = String(GetItemDescription(gSaveBlock1Ptr.pcItems[itemId].itemKey));
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
function _tickPCList(newKeys: number): void {
  // 1:1 décomp lines 1217-1226 : SELECT button → start item swap (sauf si Cancel).
  if (newKeys & SELECT_BUTTON) {
    const used = CountUsedPCItemSlots();
    // currentRow = cursor pos dans la list ; LIST_CANCEL = last row (index used).
    // Skip si on est sur Cancel ou si la list est vide.
    if (used > 0) {
      // 1:1 décomp listMenuGetScrollAndRow + check `!= count - 1` (= pas sur Cancel).
      // Simple heuristic : cursor pos = ListMenuGetSelectedRow ; we use sPCListTaskId.
      const rt = getRuntime() as unknown as { _listMenus?: Map<number, { selectedRow: number; scrollOffset: number }> } | null;
      const list = rt?._listMenus?.get(sPCListTaskId);
      const cursorPos = list ? (list.scrollOffset + list.selectedRow) : 0;
      if (cursorPos < used) {
        PlaySE(Songs.SE_SELECT);
        _itemStorageStartItemSwap(cursorPos);
        return;
      }
    }
  }
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

/** 1:1 décomp `ItemStorage_StartItemSwap` (player_pc.c:1274-1284) :
 *    ListMenuSetTemplateField(LISTFIELD_CURSORKIND, CURSOR_INVISIBLE);
 *    sItemStorageMenu->toSwapPos = currentPos;
 *    ItemStorage_SetSwapArrow + ItemStorage_UpdateSwapLinePos;
 *    CopyItemName(... gStringVar1); ItemStorage_PrintMessage(MSG_SWITCH_WHICH_ITEM);
 *    gTasks.func = ItemStorage_ProcessItemSwapInput; */
function _itemStorageStartItemSwap(pos: number): void {
  sPCSwapFromPos = pos;
  const itemName = getItemNameFr(gSaveBlock1Ptr.pcItems[pos].itemKey);
  _itemStoragePrintWindowMessage(`Déplacer ${itemName} où ?`);
  sSubState = 'pc_swap';
}

/** 1:1 décomp `ItemStorage_ProcessItemSwapInput` (player_pc.c:1286-1316) :
 *    if (SELECT) → ItemStorage_FinishItemSwap(taskId, FALSE);
 *    else input = ListMenu_ProcessInput(...) ; on selection : finish swap. */
function _tickPCSwap(newKeys: number): void {
  if ((newKeys & SELECT_BUTTON) || (newKeys & A_BUTTON)) {
    // 1:1 décomp lines 1292-1297 : SELECT/A → finish swap (commit).
    const rt = getRuntime() as unknown as { _listMenus?: Map<number, { selectedRow: number; scrollOffset: number }> } | null;
    const list = rt?._listMenus?.get(sPCListTaskId);
    const newPos = list ? (list.scrollOffset + list.selectedRow) : 0;
    _itemStorageFinishItemSwap(newPos, false);
    return;
  }
  if (newKeys & B_BUTTON) {
    // 1:1 décomp lines 1306-1311 : B (canceled via LIST_CANCEL) → finish without move.
    _itemStorageFinishItemSwap(-1, true);
    return;
  }
  // Continue list input (= cursor move).
  ListMenu_ProcessInput(sPCListTaskId);
}

/** 1:1 décomp `ItemStorage_FinishItemSwap` (player_pc.c:1318-1338). */
function _itemStorageFinishItemSwap(newPos: number, canceled: boolean): void {
  PlaySE(Songs.SE_SELECT);
  const fromPos = sPCSwapFromPos;
  if (!canceled && fromPos !== newPos && fromPos !== newPos - 1 && newPos >= 0) {
    // Move slot fromPos → newPos in gSaveBlock1Ptr.pcItems.
    _moveItemSlotInList(fromPos, newPos);
    _itemStorageRefreshList();
    // Re-init the list with new items.
    DestroyListMenuTask(sPCListTaskId);
    const template = _buildPCListTemplate();
    sPCListTaskId = ListMenuInit(template, 0, 0);
  }
  sPCSwapFromPos = NOT_SWAPPING;
  // Restore description + icon for current cursor pos.
  const rt = getRuntime() as unknown as { _listMenus?: Map<number, { selectedRow: number; scrollOffset: number }> } | null;
  const list = rt?._listMenus?.get(sPCListTaskId);
  const cursorPos = list ? (list.scrollOffset + list.selectedRow) : 0;
  const itemKey = cursorPos < CountUsedPCItemSlots()
    ? gSaveBlock1Ptr.pcItems[cursorPos].itemKey
    : 'ITEM_LIST_END';
  _itemStorageEraseItemIcon();
  _itemStorageDrawItemIcon(itemKey);
  _itemStoragePrintDescription(cursorPos < CountUsedPCItemSlots() ? cursorPos : -2);
  sSubState = 'pc_list';
}

/** 1:1 décomp `MoveItemSlotInList(itemSlots, fromPos, toPos)` (item.c). */
function _moveItemSlotInList(fromPos: number, toPos: number): void {
  const pcItems = gSaveBlock1Ptr.pcItems;
  const tmp = { itemKey: pcItems[fromPos].itemKey, quantity: pcItems[fromPos].quantity };
  if (fromPos < toPos) {
    for (let i = fromPos; i < toPos - 1; i++) {
      pcItems[i].itemKey = pcItems[i + 1].itemKey;
      pcItems[i].quantity = pcItems[i + 1].quantity;
    }
    pcItems[toPos - 1].itemKey = tmp.itemKey;
    pcItems[toPos - 1].quantity = tmp.quantity;
  } else if (fromPos > toPos) {
    for (let i = fromPos; i > toPos; i--) {
      pcItems[i].itemKey = pcItems[i - 1].itemKey;
      pcItems[i].quantity = pcItems[i - 1].quantity;
    }
    pcItems[toPos].itemKey = tmp.itemKey;
    pcItems[toPos].quantity = tmp.quantity;
  }
}

/** Helper : factorize list template build (= 1:1 décomp sListMenuTemplate_ItemStorage). */
function _buildPCListTemplate(): ListMenuTemplate {
  return {
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
}

/** 1:1 décomp `ItemStorage_DoItemAction` (player_pc.c:1353-1390).
 *
 *  Démarre une action Withdraw/Toss sur l'item à `pos`. Si quantity == 1,
 *  fait l'action immédiate. Sinon → quantity rolling (= 1:1 décomp prompt
 *  "Combien ?" + window WIN_QUANTITY + D-pad up/down adjust). */
function _itemStorageDoItemAction(pos: number): void {
  sPCLastActionPos = pos;
  const slot = gSaveBlock1Ptr.pcItems[pos];
  sPCQuantitySelected = 1;  // 1:1 décomp tQuantity = 1
  if (!sPCInTossMode) {
    if (slot.quantity === 1) {
      // 1:1 décomp player_pc.c:1362-1367 : qty == 1 → withdraw immédiat.
      _itemStorageDoItemWithdraw(pos, 1);
      return;
    }
    // 1:1 décomp lines 1369-1371 :
    //   CopyItemName(itemId, gStringVar1);
    //   ItemStorage_PrintMessage(GetMessage(MSG_HOW_MANY_TO_WITHDRAW)); → gText_WithdrawHowManyItems
    //   "Vous voulez en\nretirer combien?"
    const itemName = getItemNameFr(slot.itemKey);
    setStringVar(1, itemName);
    const tpl = getString('gText_WithdrawHowManyItems') ?? 'Vous voulez en\nretirer combien?';
    _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
  } else {
    if (slot.quantity === 1) {
      _itemStorageStartToss(pos, 1);
      return;
    }
    // 1:1 décomp lines 1383-1384 :
    //   CopyItemName(itemId, gStringVar1);
    //   ItemStorage_PrintMessage(GetMessage(MSG_HOW_MANY_TO_TOSS)); → gText_TossHowManyVar1s
    //   "En jeter combien?"
    const itemName = getItemNameFr(slot.itemKey);
    setStringVar(1, itemName);
    const tpl = getString('gText_TossHowManyVar1s') ?? 'En jeter combien?';
    _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
  }
  // 1:1 décomp line 1388 : ItemStorage_PrintItemQuantity dans WIN_QUANTITY.
  _itemStorageShowQuantityWindow();
  sSubState = 'pc_qty_rolling';
}

/** 1:1 décomp `ItemStorage_PrintItemQuantity` (player_pc.c:1345-1350) :
 *    ConvertIntToDecimalStringN(gStringVar1, value, mode, n);
 *    StringExpandPlaceholders(gStringVar4, gText_xVar1);
 *    AddTextPrinter(... "x N" centered dans windowId, 48 px wide). */
function _itemStorageShowQuantityWindow(): void {
  if (sPCQuantityWindowId < 0) {
    sPCQuantityWindowId = AddWindow(WIN_PC_QUANTITY);
    LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
    DrawStdFrameWithCustomTileAndPalette(
      sPCQuantityWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
    );
  } else {
    DrawStdFrameWithCustomTileAndPalette(
      sPCQuantityWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
    );
  }
  const qtyStr = `× ${String(sPCQuantitySelected).padStart(2, '0')}`;
  AddTextPrinterParameterized3(
    sPCQuantityWindowId, FONT_NORMAL,
    GetStringCenterAlignXOffset(qtyStr, WIN_PC_QUANTITY.width * 8),
    1, [1, 2, 3], TEXT_SKIP_DRAW, qtyStr,
  );
}

function _itemStorageRemoveQuantityWindow(): void {
  if (sPCQuantityWindowId < 0) return;
  ClearStdWindowAndFrame(sPCQuantityWindowId, true);
  RemoveWindow(sPCQuantityWindowId);
  sPCQuantityWindowId = -1;
}

/** 1:1 décomp `AdjustQuantityAccordingToDPadInput` (item_menu.c:utility) +
 *  `ItemStorage_HandleQuantityRolling` (player_pc.c:1392-1422). */
function _tickPCQuantityRolling(newKeys: number): void {
  // 1:1 décomp `AdjustQuantityAccordingToDPadInput` : qty bounds depend du mode.
  // Withdraw/Toss : pc slot.quantity (= items dans le PC).
  // Deposit : bag slot.quantity (= items dans le bag à déposer).
  const pos = sPCLastActionPos;
  const maxQty = sPCInDepositQtyMode
    ? gSaveBlock1Ptr.bag.items[sDepositBagSlotIndices[pos]].quantity
    : gSaveBlock1Ptr.pcItems[pos].quantity;
  let changed = false;
  // 1:1 décomp DPAD UP / DOWN / LEFT / RIGHT adjust qty (+/- 1, +/- 10).
  if (newKeys & DPAD_UP)    { sPCQuantitySelected = Math.min(maxQty, sPCQuantitySelected + 1); changed = true; }
  if (newKeys & DPAD_DOWN)  { sPCQuantitySelected = Math.max(1, sPCQuantitySelected - 1); changed = true; }
  if (newKeys & DPAD_RIGHT) { sPCQuantitySelected = Math.min(maxQty, sPCQuantitySelected + 10); changed = true; }
  if (newKeys & DPAD_LEFT)  { sPCQuantitySelected = Math.max(1, sPCQuantitySelected - 10); changed = true; }
  if (changed) {
    _itemStorageShowQuantityWindow();
    return;
  }
  if (newKeys & A_BUTTON) {
    // 1:1 décomp lines 1405-1411 : qty confirmed → withdraw/toss/deposit.
    PlaySE(Songs.SE_SELECT);
    _itemStorageRemoveQuantityWindow();
    if (sPCInDepositQtyMode) {
      const bagIdx = sDepositBagSlotIndices[pos];
      sPCInDepositQtyMode = false;
      _depositDoDeposit(bagIdx, sPCQuantitySelected);
    } else if (!sPCInTossMode) {
      _itemStorageDoItemWithdraw(pos, sPCQuantitySelected);
    } else {
      _itemStorageStartToss(pos, sPCQuantitySelected);
    }
  } else if (newKeys & B_BUTTON) {
    // 1:1 décomp lines 1413-1420 : canceled → restore description + return list.
    PlaySE(Songs.SE_SELECT);
    _itemStorageRemoveQuantityWindow();
    if (sPCInDepositQtyMode) {
      sPCInDepositQtyMode = false;
      _depositPrintDescription(pos);
      sSubState = 'deposit_list';
    } else {
      _itemStoragePrintDescription(pos);
      sSubState = 'pc_list';
    }
  }
}

const DPAD_UP    = 0x40;
const DPAD_DOWN  = 0x80;
const DPAD_LEFT  = 0x20;
const DPAD_RIGHT = 0x10;
const SELECT_BUTTON = 0x04;

/** 1:1 décomp `ItemStorage_DoItemWithdraw` (player_pc.c:1424-1444) :
 *    CopyItemName(itemId, gStringVar1);
 *    ConvertIntToDecimalStringN(gStringVar2, tQuantity, LEFT_ALIGN, 3);
 *    ItemStorage_PrintMessage(GetMessage(MSG_WITHDREW_ITEM)); → gText_WithdrawXItems
 *    "{STR_VAR_1}:\nretiré {STR_VAR_2}." */
function _itemStorageDoItemWithdraw(pos: number, qty: number): void {
  const slot = gSaveBlock1Ptr.pcItems[pos];
  if (AddBagItem(slot.itemKey, qty)) {
    // 1:1 décomp StringExpandPlaceholders avec STR_VAR_1=item, STR_VAR_2=qty.
    const itemName = getItemNameFr(slot.itemKey);
    setStringVar(1, itemName);
    setStringVar(2, String(qty));
    const tpl = getString('gText_WithdrawXItems') ?? '{STR_VAR_1}:\nretiré {STR_VAR_2}.';
    _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
    sPCActionMsgIsError = false;
    sSubState = 'pc_action_msg';
    // Mark pos pour remove après confirmation A_BUTTON.
    sPCLastActionPos = pos;
    sPCLastActionQty = qty;
  } else {
    // 1:1 décomp MSG_NO_MORE_ROOM = gText_NoRoomInBag "Il n'y a plus de\nplace dans le SAC."
    _itemStoragePrintWindowMessage(getString('gText_NoRoomInBag') ?? "Il n'y a plus de\nplace dans le SAC.");
    sPCActionMsgIsError = true;
    sSubState = 'pc_action_msg';
  }
}

/** Marker pour l'action en cours, lue à confirmation A press. */
let sPCLastActionPos = -1;
let sPCLastActionQty = 0;

/** 1:1 décomp `ItemStorage_DoItemToss` (player_pc.c:1446-1466) :
 *    if (!GetItemImportance(itemId)) {
 *      CopyItemName(itemId, gStringVar1);
 *      ConvertIntToDecimalStringN(gStringVar2, tQuantity, LEFT_ALIGN, 3);
 *      ItemStorage_PrintMessage(GetMessage(MSG_OKAY_TO_THROW_AWAY)); → gText_ConfirmTossItems
 *      "{STR_VAR_1}:\nen jeter {STR_VAR_2}?"
 *      CreateYesNoMenuWithCallbacks(taskId, ..., 1, &ItemTossYesNoFuncs);
 *    } */
function _itemStorageStartToss(pos: number, qty: number): void {
  const slot = gSaveBlock1Ptr.pcItems[pos];
  // 1:1 décomp GetItemImportance check (= pas de toss pour items importants).
  // Pour la démo on assume aucun item PC n'est important (= TM/HM exclus du PC).
  sPCLastActionPos = pos;
  sPCLastActionQty = qty;
  const itemName = getItemNameFr(slot.itemKey);
  setStringVar(1, itemName);
  setStringVar(2, String(qty));
  const tpl = getString('gText_ConfirmTossItems') ?? '{STR_VAR_1}:\nen jeter {STR_VAR_2}?';
  _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
  // Spawn YesNo menu (= 1:1 décomp CreateYesNoMenuWithCallbacks).
  CreateYesNoMenu(WIN_PC_YESNO, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 1);  // default = NO
  sSubState = 'pc_toss_confirm';
}

function _tickPCTossConfirm(_newKeys: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();
  // -2 = nothing, -1 = B, 0 = YES, 1 = NO.
  if (res === -2) return;
  if (res === 0) {
    // YES → throw away. 1:1 décomp ItemStorage_TossItemYes :
    //   ItemStorage_PrintMessage(GetMessage(MSG_THREW_AWAY_ITEM)); → gText_ThrewAwayVar2Var1s
    //   "{STR_VAR_1}:\njeté {STR_VAR_2}."
    PlaySE(Songs.SE_SELECT);
    const slot = gSaveBlock1Ptr.pcItems[sPCLastActionPos];
    const itemName = getItemNameFr(slot.itemKey);
    setStringVar(1, itemName);
    setStringVar(2, String(sPCLastActionQty));
    const tpl = getString('gText_ThrewAwayVar2Var1s') ?? '{STR_VAR_1}:\njeté {STR_VAR_2}.';
    _itemStoragePrintWindowMessage(StringExpandPlaceholders('', tpl));
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
    // CASE 1 : DEPOSIT just done → switch vers RETIRER (= user-flag :
    // "dès qu'on depose un item on est switch vers le retrait").
    // 1:1 décomp `CB2_PlayerPCExitBagMenu` (player_pc.c:571) qui retour au PC
    // après le bag, ici on simule en cleanup + re-open Withdraw menu.
    if (sPCDepositJustDone) {
      sPCDepositJustDone = false;
      sPCLastActionPos = -1;
      sPCLastActionQty = 0;
      // Cleanup deposit list + windows.
      _itemStorageEraseItemIcon();
      if (sPCListTaskId >= 0) {
        DestroyListMenuTask(sPCListTaskId);
        sPCListTaskId = -1;
      }
      _removePCWindows();
      // Switch vers RETIRER (= _itemStorageWithdraw flow direct).
      sPCInTossMode = false;
      _itemStorageEnter(false);
      return;
    }
    // CASE 2 : Withdraw / Toss success → RemovePCItem + refresh list.
    if (!sPCActionMsgIsError && sPCLastActionPos >= 0) {
      // 1:1 décomp : RemovePCItem + DestroyListMenuTask + ItemStorage_CompactList + RefreshListMenu + ListMenuInit.
      RemovePCItem(sPCLastActionPos, sPCLastActionQty);
      DestroyListMenuTask(sPCListTaskId);
      _itemStorageRefreshList();
      sPCListTaskId = ListMenuInit(_buildPCListTemplate(), 0, 0);
    }
    sPCLastActionPos = -1;
    sPCLastActionQty = 0;
    // Reprint icon + description (= ItemStorage_MoveCursor sur new first item).
    const firstId = sPCListItems[0]?.id ?? -2;
    _itemStorageEraseItemIcon();
    if (firstId === -2) _itemStorageDrawItemIcon('ITEM_LIST_END');
    else _itemStorageDrawItemIcon(gSaveBlock1Ptr.pcItems[firstId].itemKey);
    _itemStoragePrintDescription(firstId);
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
  // Cleanup all PC windows + icon sprite.
  _itemStorageEraseItemIcon();
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

/** 1:1 décomp `PlayerPC_Mailbox` (player_pc.c:457-485) :
 *    count = GetMailboxMailCount();
 *    if (count == 0) DisplayItemMessageOnField(..., gText_NoMailHere, ...);
 *    else { MailboxMenu_Alloc + Mailbox_DrawMailboxMenu → list mails + actions }
 *
 *  Notre port : on affiche le visuel de la liste mailbox MÊME SI count == 0
 *  (= juste "RETOUR"), pour montrer l'UI dans la démo. Le décomp affiche un
 *  msgbox dans ce cas, on peut faire pareil ou montrer la liste.
 *
 *  Le user a demandé "juste le visuel des menus" — on fait l'UI minimum :
 *  liste mailbox avec items (vide en early game) + RETOUR. */
function _openMailboxEmpty(): void {
  _removeMainWindow();
  _clearSticky();
  sSubState = 'mailbox_list';
  _mailboxOpenList();
}

// ─── Mailbox UI ────────────────────────────────────────────────────────────

let sMailboxListItems: ListMenuItem[] = [];

function _mailboxOpenList(): void {
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
  // Title centered "BOITE LETTRE" (= gText_Mailbox, décomp affiche dans MAILBOXWIN_TITLE).
  const titleText = getString('gText_Mailbox');
  AddTextPrinterParameterized3(
    sPCTitleWindowId, FONT_NORMAL,
    GetStringCenterAlignXOffset(titleText, WIN_PC_TITLE.width * 8),
    1, [1, 2, 3], TEXT_SKIP_DRAW, titleText,
  );
  // Build mailbox list (= vide en early game ; only RETOUR).
  // 1:1 décomp : iterate gSaveBlock1Ptr->mail[PARTY_SIZE..MAIL_COUNT] où itemId != ITEM_NONE.
  // Notre runtime n'a pas mail data extensive → list always vide.
  sMailboxListItems = [];
  sMailboxListItems.push({ name: getString('gText_Cancel2'), id: -2 });

  const template: ListMenuTemplate = {
    items: sMailboxListItems,
    moveCursorFunc: null,
    itemPrintFunc: null,
    totalItems: sMailboxListItems.length,
    maxShowed: sMailboxListItems.length,
    windowId: sPCListWindowId,
    header_X: 0, item_X: 8, cursor_X: 0,
    upText_Y: 9, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: 7, cursorKind: 0,
  };
  sPCListTaskId = ListMenuInit(template, 0, 0);
  // Description = "Aucun MAIL." (= décomp gText_NoMailHere) ou neutre.
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    sPCMessageWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, getString('gText_NoMailHere'),
  );
}

function _tickMailboxList(_newKeys: number): void {
  const sel = ListMenu_ProcessInput(sPCListTaskId);
  if (sel === -1) return;
  // -2 = LIST_CANCEL ou >= 0 = mail selected (jamais accessible si vide).
  if (sel === -2 || sel >= 0) {
    PlaySE(Songs.SE_SELECT);
    _mailboxExitList();
  }
}

function _mailboxExitList(): void {
  if (sPCListTaskId >= 0) {
    DestroyListMenuTask(sPCListTaskId);
    sPCListTaskId = -1;
  }
  _removePCWindows();
  sSubState = 'main_menu';
  _showSticky(getString('gText_WhatWouldYouLike'));
  _openMainMenu();
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
    const scriptLabel = gSaveBlock2Ptr.playerGender === FEMALE
      ? 'LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC'
      : 'LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC';
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

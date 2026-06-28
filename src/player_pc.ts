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

import { DestroySprite } from './sprite';
import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, DrawDialogueFrame, ClearDialogWindowAndFrame,
  DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
  FillBgTilemapBufferRect,
  type WindowTemplate,
} from './window';
import { LoadUserWindowBorderGfx, LoadMessageBoxGfx } from './text_window';
import { GetStringCenterAlignXOffset, GetStringRightAlignXOffset } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap, CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { getRuntime, PlaySE } from '../harness/runtime/decomp-globals';
import { SignalWaitState } from './scrcmd';
import { ScriptContext_SetupScript } from './script';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { MAIL_COUNT, PARTY_SIZE } from './engine/save/save-blocks';
import { ReadMail } from './mail';
import { CB2_ReturnToField_Manual } from './overworld';
import { ITEM_NONE, ClearMail } from './mail_data';
import { FEMALE } from '../harness/runtime/decomp-globals';
import { getString } from './engine/ui/gba-strings';
import { setStringVar, encodeOwText, decodeOwBytes } from '../include/text';
import { StringExpandPlaceholders, gStringVar4 } from '../include/string_util';
import * as Songs from '../include/constants/songs';
import {
  CountUsedPCItemSlots, RemovePCItem, CompactPCItems, AddPCItem, PC_ITEMS_COUNT,
} from './engine/pokemon/pc-items';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  ListMenuGetYCoordForPrintingArrowCursor,
  type ListMenuTemplate, type ListMenuItem,
} from './list_menu';
import { AddBagItem, gBagPockets, ITEMS_POCKET } from './engine/bag/bag';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { getItemNameFr } from '../harness/runtime/data-tables';
import { GetItemDescription } from './item';
import {
  AddItemIconSprite, MAX_SPRITES, preloadItemIconAssets,
} from './item_icon';
import { FreeSpriteTilesByTag } from '../harness/runtime/decomp-globals';
import { FreeSpritePaletteByTag } from './sprite';

// ─── Constantes 1:1 décomp ──────────────────────────────────────────────────
// A_BUTTON/B_BUTTON imports depuis decomp-data (= A8 audit).
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
// TEXT_SKIP_DRAW import depuis decomp-data.
import { TEXT_SKIP_DRAW } from './engine/decomp-data/include/text-data';

// FONT_NORMAL = text.h enum local (= pas extrait decomp-data, hardcode 1:1 justifié).
const FONT_NORMAL = 1;

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
//   ITEMPC_WIN_ICON     left=1  top=8  w=3  h=3  baseBlock=0x153 → frame autour du sprite item icon
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
const WIN_PC_ICON: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 8, width: 3, height: 3,
  paletteNum: 15, baseBlock: 0x153,
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
  | 'mailbox_options'  // 1:1 décomp Mailbox_MailOptionsProcessInput (LIRE/AU SAC/DONNER/RETOUR)
  | 'mailbox_confirm_movetobag' // 1:1 décomp Mailbox_HandleConfirmMoveToBag (YesNo)
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
let sPCIconWindowId = -1;  // 1:1 décomp ITEMPC_WIN_ICON (frame autour du sprite icon).
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

// 1:1 décomp player_pc.c:88 `#define SWAP_LINE_LENGTH 7`.
const SWAP_LINE_LENGTH = 7;

// 1:1 décomp player_pc.c:57-65 ITEMPC_WIN_* enum (pour ItemStorage_Add/RemoveWindow).
const ITEMPC_WIN_LIST = 0;
const ITEMPC_WIN_MESSAGE = 1;
const ITEMPC_WIN_ICON = 2;
const ITEMPC_WIN_TITLE = 3;
const ITEMPC_WIN_QUANTITY = 4;
const ITEMPC_WIN_YESNO = 5;
const ITEMPC_WIN_COUNT = 6;
// 1:1 décomp player_pc.c:67 `#define ITEMPC_WIN_LIST_END ITEMPC_WIN_TITLE`.
const ITEMPC_WIN_LIST_END = ITEMPC_WIN_TITLE;

// 1:1 décomp window.h `#define WINDOW_NONE 0xFF`.
const WINDOW_NONE = 0xFF;
// 1:1 décomp sprite.h `#define SPRITE_NONE 0xFF`.
const SPRITE_NONE = 0xFF;

/** 1:1 décomp `struct ItemStorageMenu` (player_pc.c:90-98).
 *  Allocated par `ItemStorage_Init()`, freed par `ItemStorage_Free()`. */
interface ItemStorageMenuState {
  listItems: ListMenuItem[];
  itemNames: string[];
  /** windowIds[ITEMPC_WIN_COUNT] = WINDOW_NONE par défaut. */
  windowIds: number[];
  /** toSwapPos = NOT_SWAPPING par défaut (= 0xFF). */
  toSwapPos: number;
  /** spriteId = SPRITE_NONE par défaut (= 0xFF). */
  spriteId: number;
  /** swapLineSpriteIds[SWAP_LINE_LENGTH] = SPRITE_NONE par défaut. */
  swapLineSpriteIds: number[];
}

/** 1:1 décomp `static EWRAM_DATA struct ItemStorageMenu *sItemStorageMenu = NULL`
 *  (player_pc.c:182). Set par `ItemStorage_Init()`, free par `ItemStorage_Free()`. */
let sItemStorageMenu: ItemStorageMenuState | null = null;

/** 1:1 décomp `struct PlayerPCItemPageStruct` (player_pc.h:13-21) :
 *      u16 cursorPos;
 *      u16 itemsAbove;
 *      u16 pageItems;
 *      u16 count;
 *      u8 scrollIndicatorTaskId;
 *
 *  `EWRAM_DATA struct PlayerPCItemPageStruct gPlayerPCItemPageInfo = {}`
 *  (player_pc.c:181). Exposé (= public via header) pour mailbox/item storage
 *  pagination state partagé. */
export interface PlayerPCItemPageStruct {
  cursorPos: number;
  itemsAbove: number;
  pageItems: number;
  count: number;
  scrollIndicatorTaskId: number;
}
export const gPlayerPCItemPageInfo: PlayerPCItemPageStruct = {
  cursorPos: 0,
  itemsAbove: 0,
  pageItems: 0,
  count: 0,
  scrollIndicatorTaskId: -1,  // 1:1 TASK_NONE = 0xFF en C, on garde -1 en TS
};

/** 1:1 décomp `static void SetPlayerPCListCount(u8 taskId)` (player_pc.c:651-657) :
 *      if (gPlayerPCItemPageInfo.count > 7)
 *          gPlayerPCItemPageInfo.pageItems = 8;
 *      else
 *          gPlayerPCItemPageInfo.pageItems = gPlayerPCItemPageInfo.count + 1; */
function SetPlayerPCListCount(): void {
  if (gPlayerPCItemPageInfo.count > 7)
    gPlayerPCItemPageInfo.pageItems = 8;
  else
    gPlayerPCItemPageInfo.pageItems = gPlayerPCItemPageInfo.count + 1;
}

/** 1:1 décomp `void CopyItemName_PlayerPC(u8 *string, u16 itemId)` (player_pc.c:1011-1014) :
 *      CopyItemName(itemId, string);
 *
 *  Notre `getItemNameFr(itemKey)` matche le pattern (string itemKey vs u16
 *  itemId est la seule différence). Wrap pour exposer le nom 1:1. */
export function CopyItemName_PlayerPC(itemKey: string): string {
  return getItemNameFr(itemKey);
}

/** Note : on garde une CONSTANTE séparée alignée 1:1 décomp (0xFF) pour le
 *  struct sItemStorageMenu, distincte du `NOT_SWAPPING = -1` qui est la valeur
 *  négative TS utilisée par `sPCSwapFromPos` (var séparée legacy).
 *  Migration future : unifier les 2. */
const NOT_SWAPPING_C = 0xFF;

/** 1:1 décomp `static void ItemStorage_Init(void)` (player_pc.c:945-951) :
 *      sItemStorageMenu = AllocZeroed(sizeof(*sItemStorageMenu));
 *      memset(sItemStorageMenu->windowIds, WINDOW_NONE, ITEMPC_WIN_COUNT);
 *      sItemStorageMenu->toSwapPos = NOT_SWAPPING;
 *      sItemStorageMenu->spriteId = SPRITE_NONE; */
export function ItemStorage_Init(): void {
  sItemStorageMenu = {
    listItems: [],
    itemNames: [],
    windowIds: new Array(ITEMPC_WIN_COUNT).fill(WINDOW_NONE),
    toSwapPos: NOT_SWAPPING_C,
    spriteId: SPRITE_NONE,
    swapLineSpriteIds: new Array(SWAP_LINE_LENGTH).fill(SPRITE_NONE),
  };
}

/** 1:1 décomp `static u8 ItemStorage_AddWindow(u8 i)` (player_pc.c:961-971) :
 *      u8 *windowIdLoc = &sItemStorageMenu->windowIds[i];
 *      if (*windowIdLoc == WINDOW_NONE) {
 *          *windowIdLoc = AddWindow(&sWindowTemplates_ItemStorage[i]);
 *          DrawStdFrameWithCustomTileAndPalette(*windowIdLoc, FALSE, 0x214, 0xE);
 *          ScheduleBgCopyTilemapToVram(0);
 *      }
 *      return *windowIdLoc; */
export function ItemStorage_AddWindow(i: number): number {
  if (!sItemStorageMenu) return WINDOW_NONE;
  if (sItemStorageMenu.windowIds[i] === WINDOW_NONE) {
    const tpl = _sWindowTemplates_ItemStorage(i);
    if (!tpl) return WINDOW_NONE;
    const wid = AddWindow(tpl);
    sItemStorageMenu.windowIds[i] = wid;
    DrawStdFrameWithCustomTileAndPalette(wid, false, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);
    // ScheduleBgCopyTilemapToVram(0) — no-op chez nous (auto-tick).
  }
  return sItemStorageMenu.windowIds[i];
}

/** 1:1 décomp `static void ItemStorage_RemoveWindow(u8 i)` (player_pc.c:973-984). */
export function ItemStorage_RemoveWindow(i: number): void {
  if (!sItemStorageMenu) return;
  const wid = sItemStorageMenu.windowIds[i];
  if (wid !== WINDOW_NONE) {
    ClearStdWindowAndFrame(wid, false);
    RemoveWindow(wid);
    sItemStorageMenu.windowIds[i] = WINDOW_NONE;
  }
}

/** 1:1 décomp `static void ItemStorage_Free(void)` (player_pc.c:953-959) :
 *      for (i = 0; i < ITEMPC_WIN_COUNT; i++)
 *          ItemStorage_RemoveWindow(i);
 *      Free(sItemStorageMenu); */
export function ItemStorage_Free(): void {
  if (!sItemStorageMenu) return;
  for (let i = 0; i < ITEMPC_WIN_COUNT; i++)
    ItemStorage_RemoveWindow(i);
  sItemStorageMenu = null;
}

/** 1:1 décomp `sWindowTemplates_ItemStorage[ITEMPC_WIN_COUNT]` (player_pc.c:298-354).
 *  Lookup par enum index pour `ItemStorage_AddWindow`. */
function _sWindowTemplates_ItemStorage(i: number): WindowTemplate | null {
  switch (i) {
    case ITEMPC_WIN_LIST:     return WIN_PC_LIST;
    case ITEMPC_WIN_MESSAGE:  return WIN_PC_MESSAGE;
    case ITEMPC_WIN_ICON:     return WIN_PC_ICON;
    case ITEMPC_WIN_TITLE:    return WIN_PC_TITLE;
    case ITEMPC_WIN_QUANTITY: return WIN_PC_QUANTITY;
    case ITEMPC_WIN_YESNO:    return WIN_PC_YESNO;
    default: return null;
  }
}

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
    case 'mailbox_options': _tickMailboxOptions(newKeys); break;
    case 'mailbox_confirm_movetobag': _tickMailboxConfirmMoveToBag(newKeys); break;
    case 'decoration_menu': _tickDecorationMenu(newKeys); break;
    case 'deposit_list':    _tickDepositList(newKeys); break;
    case 'msg_wait':        _tickMsgWait(newKeys); break;
    case 'closing':         _tickClosing(); break;
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** 1:1 décomp `DisplayItemMessageOnField` part `LoadMessageBoxAndBorderGfx`+
 *  draw frame + print str. Window sticky (= ne se ferme pas sur A press). */
function _showSticky(text: string | Uint8Array): void {
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
  void import('./engine/bag/bag-screen').then(({ OpenBagScreen, BAG_LOCATION_ITEMPC }) => {
    OpenBagScreen(undefined, BAG_LOCATION_ITEMPC, () => {
      // Re-open le PC menu — switch directement vers RETIRER (= user-flag
      // "dès qu'on depose on est switch vers le retrait").
      void import('./player_pc').then(({ OpenBedroomPC }) => {
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
  const bagItems = gBagPockets[ITEMS_POCKET].itemSlots;
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
    _itemStorageDrawItemIcon(gBagPockets[ITEMS_POCKET].itemSlots[bagIdx].itemKey);
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
    _itemStorageDrawItemIcon(gBagPockets[ITEMS_POCKET].itemSlots[bagIdx].itemKey);
  }
  _depositPrintDescription(itemId);
}

function _depositPrintMenuItem(windowId: number, itemId: number, yOffset: number): void {
  if (itemId === -2) return;
  if (itemId < 0 || itemId >= sDepositBagSlotIndices.length) return;
  const bagIdx = sDepositBagSlotIndices[itemId];
  const qty = gBagPockets[ITEMS_POCKET].itemSlots[bagIdx].quantity;
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
    description = String(GetItemDescription(gBagPockets[ITEMS_POCKET].itemSlots[bagIdx].itemKey));
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
  const slot = gBagPockets[ITEMS_POCKET].itemSlots[bagIdx];
  sPCLastActionPos = sel;  // bagIdx via mapping sDepositBagSlotIndices[sel]
  sPCQuantitySelected = 1;
  if (slot.quantity === 1) {
    _depositDoDeposit(bagIdx, 1);
    return;
  }
  // 1:1 décomp : "Déposer combien?" via gText_DepositHowManyVar1.
  const itemName = getItemNameFr(slot.itemKey);
  setStringVar(1, itemName);
  const tpl = getString('gText_DepositHowManyVar1');
  ItemStorage_PrintMessage(tpl);
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
  const slot = gBagPockets[ITEMS_POCKET].itemSlots[bagIdx];
  const itemName = getItemNameFr(slot.itemKey);
  if (AddPCItem(slot.itemKey, qty)) {
    slot.quantity -= qty;
    if (slot.quantity === 0) slot.itemKey = '';
    // 1:1 décomp `gText_DepositedVar2Var1s` = "{STR_VAR_1}:\ndéposé {STR_VAR_2}."
    setStringVar(1, itemName);
    setStringVar(2, String(qty));
    const tpl = getString('gText_DepositedVar2Var1s');
    ItemStorage_PrintMessage(tpl);
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
  // Clear la zone GAUCHE inter-windows à tile 0 (transparent) — sinon notre
  // BG0 garde du contenu opaque (= fond noir entre TITRE/ICON/MESSAGE
  // user-flag). Le décomp laisse transparaître l'OW BG dans ces zones ;
  // chez nous le BG0 doit être explicitement transparent.
  FillBgTilemapBufferRect(0, 0, 0, 0, 16, 20, 0);
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
  // 1:1 STRICT décomp ItemStorage_AddWindow(ITEMPC_WIN_ICON) (player_pc.c:963-969) :
  //   *windowIdLoc = AddWindow(&sWindowTemplates_ItemStorage[i]);
  //   DrawStdFrameWithCustomTileAndPalette(*windowIdLoc, FALSE, 0x214, 0xE);
  // Puis player_pc.c:1155 : CopyWindowToVram(... ITEMPC_WIN_ICON, COPYWIN_GFX).
  //
  // Décomp : DrawStdFrame fait fillWindowPixelBuffer(PIXEL_FILL(1)) = idx 1
  // = blanc + writeWindowTilemap → pixel buffer = fond blanc dans le tilemap.
  // Le sprite OAM (priority 0) est posé par-dessus le BG = visible.
  //
  // Bug B1 2026-05-24 : workaround "tile 0 transparent" laissait passer la
  // tile 0 noire du BG → fond noir derrière le sprite item. Retour 1:1 strict.
  sPCIconWindowId = AddWindow(WIN_PC_ICON);
  DrawStdFrameWithCustomTileAndPalette(
    sPCIconWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
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
  const initialIconKey = firstId === -2 ? 'ITEM_LIST_END' : gSaveBlock1Ptr.pcItems[firstId].itemKey;
  // AddItemIconSprite est SYNC mais nécessite que les assets soient préchargés
  // (= _iconAssets cache, sinon retourne MAX_SPRITES). Le bag-menu préchargé
  // au open mais le PC peut être ouvert sans passer par le sac. Fire-and-forget :
  // 1er draw rate si pas en cache, le _itemStorageMoveCursor au prochain scroll
  // re-trigger. Idempotent (= bag open après n'a pas de surcoût).
  void preloadItemIconAssets().then(() => _itemStorageDrawItemIcon(initialIconKey));
  _itemStorageDrawItemIcon(initialIconKey);  // sync attempt if cache déjà chaud
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
  // 1:1 STRICT décomp player_pc.c:1103-1104 :
  //   FreeSpriteTilesByTag(TAG_ITEM_ICON);
  //   FreeSpritePaletteByTag(TAG_ITEM_ICON);
  // Sans Free palette, le tag reste alloué → LoadSpritePalette dans
  // AddItemIconSprite voit le tag déjà bound → skip load → sprite hérite de
  // la palette précédente (= POTION violet vs RETOUR bleu cross-bleed).
  FreeSpriteTilesByTag(TAG_ITEM_ICON);
  FreeSpritePaletteByTag(TAG_ITEM_ICON);
  const spriteId = AddItemIconSprite(TAG_ITEM_ICON, TAG_ITEM_ICON, itemKey);
  if (spriteId === MAX_SPRITES) return;
  sPCIconSpriteId = spriteId;
  // 1:1 décomp lines 1109-1111 : oam priority=0, x2=24, y2=80 (= sprite anchor).
  // Fix B2 : `spr.oam.priority` n'existe pas dans DecompSprite (= no-op cast).
  // Le hardware OAM est `rt.gba.oam[sprite.oamIndex].priority`. Sans ce fix, le
  // sprite reste à priority 1 (= default gItemIconSpriteTemplate) → caché par
  // BG0 priority 0 (= window pixel buffer après B1).
  const rt = getRuntime() as unknown as {
    gSprites?: Array<{ x2: number; y2: number; oamIndex: number } | undefined>;
    gba?: { oam?: Array<{ priority: number }> };
  } | null;
  const spr = rt?.gSprites?.[spriteId];
  if (spr) {
    spr.x2 = 24;
    spr.y2 = 80;
    const oamEntry = rt?.gba?.oam?.[spr.oamIndex];
    if (oamEntry) oamEntry.priority = 0;
  }
}

/** 1:1 décomp `ItemStorage_EraseItemIcon` (player_pc.c:1116-1126). */
function _itemStorageEraseItemIcon(): void {
  if (sPCIconSpriteId === -1) return;
  // 1:1 STRICT décomp player_pc.c:1121-1122 : free TILES + PALETTE.
  FreeSpriteTilesByTag(TAG_ITEM_ICON);
  FreeSpritePaletteByTag(TAG_ITEM_ICON);
  // 1:1 décomp : DestroySprite(&gSprites[*spriteIdLoc]).
  const rt = getRuntime() as unknown as {
    DestroySprite?: (spriteId: number) => void;
  } | null;
  DestroySprite(sPCIconSpriteId);
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
  // 1:1 décomp gText_MoveVar1Where (« Où voulez-vous placer {STR_VAR_1}? ») — extrait, pas inline.
  _itemStoragePrintWindowMessage(getString('gText_MoveVar1Where').replace('{STR_VAR_1}', itemName).replace(/\\n/g, '\n'));
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
    ItemStorage_PrintMessage(tpl);
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
    ItemStorage_PrintMessage(tpl);
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
    ? gBagPockets[ITEMS_POCKET].itemSlots[sDepositBagSlotIndices[pos]].quantity
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

// 1:1 strict A8 audit : import GBA keys depuis decomp-data.
import {
  DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, SELECT_BUTTON,
} from '../include/gba/io_reg';

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
    const tpl = getString('gText_WithdrawXItems');
    ItemStorage_PrintMessage(tpl);
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
  ItemStorage_PrintMessage(tpl);
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
    const tpl = getString('gText_ThrewAwayVar2Var1s');
    ItemStorage_PrintMessage(tpl);
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
function _itemStoragePrintWindowMessage(text: string | Uint8Array): void {
  if (sPCMessageWindowId < 0) return;
  DrawStdFrameWithCustomTileAndPalette(
    sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    sPCMessageWindowId, FONT_NORMAL, 0, 1,
    [1, 2, 3], TEXT_SKIP_DRAW, text,
  );
}

// ─── 1:1 décomp player_pc.c:70-80 MSG_* constants ────────────────────────────
const MSG_SWITCH_WHICH_ITEM    = 0xFFF7;
const MSG_OKAY_TO_THROW_AWAY   = 0xFFF8;
const MSG_TOO_IMPORTANT        = 0xFFF9;
const MSG_NO_MORE_ROOM         = 0xFFFA;
const MSG_THREW_AWAY_ITEM      = 0xFFFB;
const MSG_HOW_MANY_TO_TOSS     = 0xFFFC;
const MSG_WITHDREW_ITEM        = 0xFFFD;
const MSG_HOW_MANY_TO_WITHDRAW = 0xFFFE;
const MSG_GO_BACK_TO_PREV      = 0xFFFF;

/** 1:1 décomp `static const u8 *ItemStorage_GetMessage(u16 itemId)`
 *  (player_pc.c:1165-1203). Switch sur MSG_* → retourne le gText FR
 *  correspondant. Default (= itemId réel) → GetItemDescription(itemId). */
function ItemStorage_GetMessage(itemIdOrMsg: number): string {
  switch (itemIdOrMsg) {
    case MSG_GO_BACK_TO_PREV:      return getString('gText_GoBackPrevMenu');
    case MSG_HOW_MANY_TO_WITHDRAW: return getString('gText_WithdrawHowManyItems');
    case MSG_WITHDREW_ITEM:        return getString('gText_WithdrawXItems');
    case MSG_HOW_MANY_TO_TOSS:     return getString('gText_TossHowManyVar1s');
    case MSG_THREW_AWAY_ITEM:      return getString('gText_ThrewAwayVar2Var1s');
    case MSG_NO_MORE_ROOM:         return getString('gText_NoRoomInBag');
    case MSG_TOO_IMPORTANT:        return getString('gText_TooImportantToToss');
    case MSG_OKAY_TO_THROW_AWAY:   return getString('gText_ConfirmTossItems');
    case MSG_SWITCH_WHICH_ITEM:    return getString('gText_MoveVar1Where');
    default:
      // 1:1 GetItemDescription : si pas un MSG_*, on retourne la description de
      // l'item. Notre `GetItemDescription` prend un itemKey string, donc on
      // retourne string vide si itemIdOrMsg n'est pas un MSG_* (= caller doit
      // utiliser le helper différent pour les items réels).
      return '';
  }
}

/** 1:1 décomp `static void ItemStorage_PrintMessage(const u8 *string)`
 *  (player_pc.c:1205-1211) :
 *      windowId = sItemStorageMenu->windowIds[ITEMPC_WIN_MESSAGE];
 *      FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
 *      StringExpandPlaceholders(gStringVar4, string);
 *      AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar4, 0, 1, 0, NULL); */
function ItemStorage_PrintMessage(text: string): void {
  // 1:1 : StringExpandPlaceholders(gStringVar4, text) résout {STR_VAR_*} (bytes 0xFD).
  // text = source FR lisible → encodeOwText (préproc) → expand byte dans gStringVar4.
  StringExpandPlaceholders(gStringVar4, encodeOwText(text));
  _itemStoragePrintWindowMessage(gStringVar4);
}

/** 1:1 décomp `static void ItemStorage_PrintItemQuantity(u8 windowId, u16 value,
 *               u32 mode, u8 x, u8 y, u8 n)` (player_pc.c:1345-1350) :
 *      ConvertIntToDecimalStringN(gStringVar1, value, mode, n);
 *      StringExpandPlaceholders(gStringVar4, gText_xVar1);
 *      AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar4,
 *          GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 48), y, 0, NULL); */
function ItemStorage_PrintItemQuantity(windowId: number, value: number, _mode: number, _x: number, y: number, n: number): void {
  if (windowId < 0) return;
  // 1:1 ConvertIntToDecimalStringN avec LEADING_ZEROS (= STR_CONV_MODE_LEADING_ZEROS = 1).
  // Notre `padStart` matche pour mode 1.
  const valStr = String(value).padStart(n, '0');
  setStringVar(1, valStr);
  const tpl = getString('gText_xVar1') ?? '×{STR_VAR_1}';
  StringExpandPlaceholders(gStringVar4, encodeOwText(tpl));
  const expanded = gStringVar4;
  // 1:1 GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 48) → centré dans 48 px.
  const xPos = GetStringCenterAlignXOffset(expanded, 48);
  // Clear window pixel buffer + print centré.
  DrawStdFrameWithCustomTileAndPalette(
    windowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  AddTextPrinterParameterized3(
    windowId, FONT_NORMAL, xPos, y,
    [1, 2, 3], TEXT_SKIP_DRAW, expanded,
  );
}

// ─── 1:1 décomp Mailbox MoveToBag YesNo flow (player_pc.c:828-879) ──────────

/** 1:1 décomp `static void Mailbox_AskConfirmMoveToBag(u8 taskId)`
 *  (player_pc.c:833-837) :
 *      DisplayYesNoMenuDefaultYes();
 *      gTasks[taskId].func = Mailbox_HandleConfirmMoveToBag; */
function _mailboxAskConfirmMoveToBag(): void {
  // 1:1 décomp DisplayYesNoMenuDefaultYes : YesNo menu avec YES par défaut.
  CreateYesNoMenu(WIN_PC_YESNO, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 0);
  sSubState = 'mailbox_confirm_movetobag';
}

/** 1:1 décomp `static void Mailbox_HandleConfirmMoveToBag(u8 taskId)`
 *  (player_pc.c:839-855) :
 *      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
 *        case 0: Mailbox_DoMailMoveToBag(taskId); break;  // Yes
 *        case MENU_B_PRESSED: PlaySE(SE_SELECT);
 *        case 1: Mailbox_CancelMoveToBag(taskId); break;  // No
 *      } */
function _tickMailboxConfirmMoveToBag(_newKeys: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();
  if (res === -2) return;  // MENU_NOTHING_CHOSEN
  if (res === 0) {
    // YES → DoMailMoveToBag
    _mailboxDoMailMoveToBag();
  } else {
    // NO ou B → CancelMoveToBag
    PlaySE(Songs.SE_SELECT);
    _mailboxCancelMoveToBag();
  }
}

/** 1:1 décomp `static void Mailbox_DoMailMoveToBag(u8 taskId)`
 *  (player_pc.c:857-874) :
 *      mail = &gSaveBlock1Ptr->mail[selected];
 *      if (!AddBagItem(mail->itemId, 1))
 *          DisplayItemMessageOnField(taskId, gText_BagIsFull, Mailbox_Cancel);
 *      else {
 *          DisplayItemMessageOnField(taskId, gText_MailToBagMessageErased, Mailbox_Cancel);
 *          ClearMail(mail);
 *          Mailbox_CompactMailList();
 *          gPlayerPCItemPageInfo.count--;
 *          if (...) gPlayerPCItemPageInfo.itemsAbove--;
 *          SetPlayerPCListCount(taskId);
 *      } */
function _mailboxDoMailMoveToBag(): void {
  const mailIdx = sMailboxSelectedIdx;
  if (mailIdx < 0) {
    _mailboxCancel();
    return;
  }
  const mail = gSaveBlock1Ptr.mail[mailIdx];
  // 1:1 décomp player_pc.c:860 : `if (!AddBagItem(mail->itemId, 1))`.
  // mail.itemId est u16 ITEM_* enum value (= 121 = ITEM_ORANGE_MAIL, etc.).
  // Notre AddBagItem prend itemKey string : conversion via reverseDecompConstant.
  const itemKey = reverseDecompConstant(mail.itemId, 'ITEM_');
  // Si l'itemId n'est pas mappable (= mail.itemId = 0 = ITEM_NONE, mail slot
  // vide, ou itemId hors range), considérer l'add comme échec (= bag full
  // équivalent côté flow utilisateur).
  const success = itemKey ? AddBagItem(itemKey, 1) : false;
  if (!success) {
    // 1:1 gText_BagIsFull
    _showSticky(getString('gText_BagIsFull'));
    sSubState = 'msg_wait';
    sMsgReturnState = 'mailbox_list';
    return;
  }
  // 1:1 : ClearMail + CompactMailList + count--.
  ClearMail(mail);
  Mailbox_CompactMailList();
  // Affiche message + return to list.
  _showSticky(getString('gText_MailToBagMessageErased'));
  sSubState = 'msg_wait';
  sMsgReturnState = 'mailbox_list';
}

/** 1:1 décomp `static void Mailbox_CancelMoveToBag(u8 taskId)`
 *  (player_pc.c:876-879) :
 *      Mailbox_Cancel(taskId); */
function _mailboxCancelMoveToBag(): void {
  _mailboxCancel();
}

/** 1:1 décomp `Mailbox_PrintWhatToDoWithPlayerMailText(taskId)` (player_pc.c:738-744) :
 *      StringCopy(gStringVar1, gSaveBlock1Ptr->mail[...].playerName);
 *      ConvertInternationalPlayerNameStripChar(gStringVar1, CHAR_SPACE);
 *      StringExpandPlaceholders(gStringVar4, gText_WhatToDoWithVar1sMail);
 *      DisplayItemMessageOnField(taskId, gStringVar4, Mailbox_PrintMailOptions); */
function Mailbox_PrintWhatToDoWithPlayerMailText(mailIdx: number): void {
  const playerName = decodeOwBytes(Uint8Array.from(gSaveBlock1Ptr.mail[mailIdx].playerName)).trimEnd() || 'MAIL';
  setStringVar(1, playerName);
  const tpl = getString('gText_WhatToDoWithVar1sMail') ?? 'Que faire avec\nle MAIL de {STR_VAR_1}?';
  StringExpandPlaceholders(gStringVar4, encodeOwText(tpl));
  _showSticky(gStringVar4);
}

/** 1:1 décomp `Mailbox_ReturnToPlayerPC(taskId)` (player_pc.c:746-756). Alias. */
function Mailbox_ReturnToPlayerPC(): void {
  _mailboxExitList();
}

/** 1:1 décomp `Mailbox_NoPokemonForMail(taskId)` (player_pc.c:931-934). */
function Mailbox_NoPokemonForMail(): void {
  _showSticky(getString('gText_NoPokemon'));
  sSubState = 'msg_wait';
  sMsgReturnState = 'mailbox_list';
}

/** 1:1 décomp `Mailbox_FadeAndReadMail(taskId)` (player_pc.c:792-801) :
 *      if (!gPaletteFade.active) {
 *          MailboxMenu_Free();
 *          CleanupOverworldWindowsAndTilemaps();
 *          ReadMail(&mail[...], Mailbox_ReturnToFieldFromReadMail, TRUE);
 *      }
 *  Notre port : pas de vraie fade (= absente du stack), appel direct ReadMail. */
function Mailbox_FadeAndReadMail(mailIdx: number): void {
  // 1:1 TODO : fade FADE_TO_BLACK + wait !gPaletteFade.active avant ReadMail.
  ReadMail(
    gSaveBlock1Ptr.mail[mailIdx],
    () => OpenBedroomPC(sIsBedroomMode),
    true,
  );
}

// ─── Suppression unused warnings ──────────────────────────────────────────────
// Les helpers 1:1 ci-dessus (Mailbox_PrintWhatToDoWithPlayerMailText / ReturnToPlayerPC /
// NoPokemonForMail / FadeAndReadMail) sont définis 1:1 strict mais pas tous
// utilisés par notre dispatch state machine actuel (= certains sont des wrappers
// pour le code en task system décomp). On les void pour TypeScript no-unused.
void Mailbox_PrintWhatToDoWithPlayerMailText;
void Mailbox_ReturnToPlayerPC;
void Mailbox_NoPokemonForMail;
void Mailbox_FadeAndReadMail;

// ─── 1:1 décomp ItemStorage swap line helpers (player_pc.c:1082-1094, 1340-1343) ──

/** Couleurs texte 1:1 décomp `sSwapArrowTextColors[]` (player_pc.c:356) :
 *      TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_DARK_GRAY */
const sSwapArrowTextColors: readonly number[] = [1, 3, 2];

/** 1:1 décomp `static void ItemStorage_SetSwapArrow(u8 listTaskId, u8 b, u8 speed)`
 *  (player_pc.c:1082-1085) :
 *      ItemStorage_DrawSwapArrow(ListMenuGetYCoordForPrintingArrowCursor(listTaskId), b, speed); */
function ItemStorage_SetSwapArrow(listTaskId: number, b: number, speed: number): void {
  const y = ListMenuGetYCoordForPrintingArrowCursor(listTaskId);
  ItemStorage_DrawSwapArrow(y, b, speed);
}

/** 1:1 décomp `static void ItemStorage_DrawSwapArrow(u8 y, u8 b, u8 speed)`
 *  (player_pc.c:1087-1094) :
 *      windowId = sItemStorageMenu->windowIds[ITEMPC_WIN_LIST];
 *      if (b == 0xFF)
 *          FillWindowPixelRect(windowId, PIXEL_FILL(1), 0, y,
 *              GetMenuCursorDimensionByFont(FONT_NORMAL, 0),
 *              GetMenuCursorDimensionByFont(FONT_NORMAL, 1));
 *      else
 *          AddTextPrinterParameterized4(windowId, FONT_NORMAL, 0, y, 0, 0,
 *              sSwapArrowTextColors, speed, gText_SelectorArrow2); */
function ItemStorage_DrawSwapArrow(y: number, b: number, speed: number): void {
  const wid = sItemStorageMenu?.windowIds[ITEMPC_WIN_LIST]
    ?? (sPCListWindowId >= 0 ? sPCListWindowId : -1);
  if (wid < 0) return;
  if (b === 0xFF) {
    // 1:1 FillWindowPixelRect clear (= efface l'arrow). Notre helper équivalent
    // est `_itemStoragePrintWindowMessage` mais ça clear pas l'arrow zone précise.
    // STUB acceptable : draw direct sans clear (= l'overwrite suffit pour les
    // cas où l'arrow change de position).
    return;
  }
  // 1:1 AddTextPrinterParameterized4 avec sSwapArrowTextColors + gText_SelectorArrow2.
  // Notre helper équivalent ici utilise AddTextPrinterParameterized3 avec
  // 3-color array. sSwapArrowTextColors matche le format [bg, fg, shadow].
  AddTextPrinterParameterized3(
    wid, FONT_NORMAL, 0, y,
    sSwapArrowTextColors as [number, number, number],
    speed,
    getString('gText_SelectorArrow2') ?? '▶',
  );
}

/** 1:1 décomp `static void ItemStorage_UpdateSwapLinePos(u8 y)`
 *  (player_pc.c:1340-1343) :
 *      UpdateSwapLineSpritesPos(sItemStorageMenu->swapLineSpriteIds,
 *          SWAP_LINE_LENGTH, 128, (y+1) * 16); */
function ItemStorage_UpdateSwapLinePos(y: number): void {
  // 1:1 UpdateSwapLineSpritesPos depuis swap-line.ts si disponible.
  // STUB : les swap line sprites ne sont pas spawn dans notre flow actuel
  // (= CreateSwapLineSprites pas appelé dans ItemStorage_Enter). Warn doux.
  void y;
  void sItemStorageMenu;
  // Pas de warn pour éviter le bruit ; le call est silent no-op tant que
  // les sprites ne sont pas spawn.
}

// Suppression unused warnings.
void ItemStorage_SetSwapArrow;
void ItemStorage_DrawSwapArrow;
void ItemStorage_UpdateSwapLinePos;

// ─── 1:1 aliases (= nom décomp strict, déléguent au code TS existant) ────────
//
// Le code interne utilise des préfixes `_itemStorageXxx` historiques. Ces
// aliases exposent les noms 1:1 décomp pour matcher la sémantique strict (=
// "ItemStorage_Xxx" du décomp player_pc.c). Migration architecturale différée.
export const ItemStorage_Withdraw = _itemStorageWithdraw;
export const ItemStorage_Deposit = _itemStorageDeposit;
export const ItemStorage_Toss = _itemStorageToss;
export const ItemStorage_Enter = _itemStorageEnter;
export const ItemStorage_CreateListMenu = _itemStorageCreateListMenu;
export const ItemStorage_ProcessInput = _tickPCList;
export const ItemStorage_RefreshListMenu = _itemStorageRefreshList;
export const ItemStorage_MoveCursor = _itemStorageMoveCursor;
export const ItemStorage_DrawItemIcon = _itemStorageDrawItemIcon;
export const ItemStorage_EraseItemIcon = _itemStorageEraseItemIcon;
export const ItemStorage_PrintMenuItem = _itemStoragePrintMenuItem;
export const ItemStorage_PrintDescription = _itemStoragePrintDescription;
export const ItemStorage_DoItemAction = _itemStorageDoItemAction;
export const ItemStorage_DoItemWithdraw = _itemStorageDoItemWithdraw;
export const ItemStorage_DoItemToss = _itemStorageStartToss;
export const ItemStorage_HandleQuantityRolling = _tickPCQuantityRolling;
export const ItemStorage_StartItemSwap = _itemStorageStartItemSwap;
export const ItemStorage_ProcessItemSwapInput = _tickPCSwap;
export const ItemStorage_FinishItemSwap = _itemStorageFinishItemSwap;
export const ItemStorage_ExitItemList = _itemStorageExitItemList;
export const ItemStorage_Exit = _itemStorageExit;

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
                    sPCIconWindowId, sPCQuantityWindowId, sPCYesNoWindowId]) {
    if (id >= 0) {
      ClearStdWindowAndFrame(id, true);
      RemoveWindow(id);
    }
  }
  sPCListWindowId = -1;
  sPCMessageWindowId = -1;
  sPCTitleWindowId = -1;
  sPCIconWindowId = -1;
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

/** 1:1 décomp `static u8 GetMailboxMailCount(void)` (player_pc.c:668-678) :
 *      u8 mailInPC, i;
 *      for (mailInPC = 0, i = PARTY_SIZE; i < MAIL_COUNT; i++)
 *          if (gSaveBlock1Ptr->mail[i].itemId != ITEM_NONE)
 *              mailInPC++;
 *      return mailInPC; */
function GetMailboxMailCount(): number {
  let mailInPC = 0;
  for (let i = PARTY_SIZE; i < MAIL_COUNT; i++)
    if (gSaveBlock1Ptr.mail[i].itemId !== ITEM_NONE)
      mailInPC++;
  return mailInPC;
}

/** 1:1 décomp `static void Mailbox_CompactMailList(void)` (player_pc.c:680-693).
 *  Bubble-sort : push slots vides (itemId == ITEM_NONE) à la fin. */
function Mailbox_CompactMailList(): void {
  for (let i = PARTY_SIZE; i < MAIL_COUNT - 1; i++) {
    for (let j = i + 1; j < MAIL_COUNT; j++) {
      if (gSaveBlock1Ptr.mail[i].itemId === ITEM_NONE) {
        // 1:1 SWAP(mail[i], mail[j]) — échange complet du struct Mail.
        const temp = gSaveBlock1Ptr.mail[i];
        gSaveBlock1Ptr.mail[i] = gSaveBlock1Ptr.mail[j];
        gSaveBlock1Ptr.mail[j] = temp;
      }
    }
  }
}

/** 1:1 décomp `PlayerPC_Mailbox` (player_pc.c:457-485) :
 *    count = GetMailboxMailCount();
 *    if (count == 0) DisplayItemMessageOnField(taskId, gText_NoMailHere, ReshowPlayerPC);
 *    else { compact list ; MailboxMenu_Alloc ; Mailbox_DrawMailboxMenu ; }
 *
 *  Notre port : check count via GetMailboxMailCount(), affiche la liste si non
 *  vide (= 1:1 strict), sinon msgbox "Aucun MAIL." sticky.
 *
 *  Le sub-état `mailbox_list` est utilisé pour les 2 cas (= 1 seule fenêtre liste
 *  avec items réels ou juste RETOUR si vide). */
function _openMailboxEmpty(): void {
  _removeMainWindow();
  _clearSticky();
  // 1:1 décomp count = GetMailboxMailCount() + Mailbox_CompactMailList si non vide.
  const count = GetMailboxMailCount();
  if (count > 0) Mailbox_CompactMailList();
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
  // Boîte message ("Pas de LETTRE ici.") créée plus bas, UNIQUEMENT si vide
  // (1:1 décomp : avec du courrier = titre + liste seuls, aucune boîte message).
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
  // Build mailbox list (= 1:1 décomp Mailbox_DrawMailboxMenu + MailboxMenu_CreateList).
  // Itère gSaveBlock1Ptr.mail[PARTY_SIZE..MAIL_COUNT] où itemId != ITEM_NONE,
  // ajoute chaque playerName + ajoute RETOUR à la fin (= 1:1 LIST_CANCEL).
  sMailboxListItems = [];
  for (let i = PARTY_SIZE; i < MAIL_COUNT; i++) {
    const m = gSaveBlock1Ptr.mail[i];
    if (m.itemId !== ITEM_NONE) {
      // 1:1 décomp : `playerName` du sender utilisé comme label dans la list.
      sMailboxListItems.push({ name: decodeOwBytes(Uint8Array.from(m.playerName)).trimEnd() || 'MAIL', id: i });
    }
  }
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
  // 1:1 décomp `PlayerPC_Mailbox` (player_pc.c:683-700) : "Pas de LETTRE ici."
  // UNIQUEMENT si la boîte est vide (count == 0). Avec du courrier, le décomp
  // affiche le menu mailbox (titre + liste) SANS boîte message → l'ancien code
  // l'imprimait inconditionnellement = texte faux ("pas de lettre" alors qu'il
  // y en a une). On ne crée la boîte que dans le cas vide.
  if (GetMailboxMailCount() === 0) {
    sPCMessageWindowId = AddWindow(WIN_PC_MESSAGE);
    DrawStdFrameWithCustomTileAndPalette(
      sPCMessageWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
    );
    AddTextPrinterParameterized3(
      sPCMessageWindowId, FONT_NORMAL, 0, 1,
      [1, 2, 3], TEXT_SKIP_DRAW, getString('gText_NoMailHere'),
    );
  }
}

/** Index du mail sélectionné dans gSaveBlock1Ptr.mail (PARTY_SIZE..MAIL_COUNT).
 *  Set par _tickMailboxList sur sélection, lu par les Mailbox_DoMail* actions. */
let sMailboxSelectedIdx = -1;

function _tickMailboxList(_newKeys: number): void {
  const sel = ListMenu_ProcessInput(sPCListTaskId);
  if (sel === -1) return;  // LIST_NOTHING_CHOSEN
  if (sel === -2) {
    // 1:1 décomp LIST_CANCEL → Mailbox_ReturnToPlayerPC (player_pc.c:719-722).
    PlaySE(Songs.SE_SELECT);
    _mailboxExitList();
    return;
  }
  // 1:1 décomp Mailbox_ProcessInput default branch (player_pc.c:724-734) :
  //   PlaySE + MailboxMenu_RemoveWindow + DestroyListMenuTask +
  //   gTasks[taskId].func = Mailbox_PrintWhatToDoWithPlayerMailText
  //   → DisplayItemMessageOnField + Mailbox_PrintMailOptions (= sub-menu 4 opts)
  PlaySE(Songs.SE_SELECT);
  sMailboxSelectedIdx = sel;
  // 1:1 décomp Mailbox_ProcessInput default branch (player_pc.c:726-729) :
  //   MailboxMenu_RemoveWindow(MAILBOXWIN_TITLE) + RemoveWindow(MAILBOXWIN_LIST)
  //   + DestroyListMenuTask. SANS le retrait des fenêtres de liste, le menu
  //   d'options se dessine PAR-DESSUS la liste → texte superposé (redraw sale).
  //   `_removePCWindows` efface title/message/list (les 3 fenêtres de la vue
  //   liste ; icon/quantity/yesno sont -1) et flush le tilemap (ClearStdWindowAndFrame
  //   true). Le dialogue « Que faire… » (sDialogueWindowId) et les options
  //   (sSubWindowId) sont des fenêtres séparées, non touchées. `_mailboxCancel`
  //   re-crée la liste via `_mailboxOpenList` → symétrique.
  if (sPCListTaskId >= 0) {
    DestroyListMenuTask(sPCListTaskId);
    sPCListTaskId = -1;
  }
  _removePCWindows();
  // 1:1 Mailbox_PrintWhatToDoWithPlayerMailText : sticky msg "Que faire avec
  // le MAIL de <playerName>?" puis options menu.
  const playerName = decodeOwBytes(Uint8Array.from(gSaveBlock1Ptr.mail[sel].playerName)).trimEnd() || 'MAIL';
  setStringVar(1, playerName);
  const tpl = getString('gText_WhatToDoWithVar1sMail') ?? 'Que faire avec\nle MAIL de {STR_VAR_1}?';
  StringExpandPlaceholders(gStringVar4, encodeOwText(tpl));
  _showSticky(gStringVar4);
  _mailboxPrintMailOptions();
}

/** 1:1 décomp `Mailbox_PrintMailOptions(taskId)` (player_pc.c:758-765) :
 *      windowId = MailboxMenu_AddWindow(MAILBOXWIN_OPTIONS);
 *      PrintMenuTable(windowId, ARRAY_COUNT(gMailboxMailOptions), gMailboxMailOptions);
 *      InitMenuInUpperLeftCornerNormal(windowId, ARRAY_COUNT(gMailboxMailOptions), 0);
 *      gTasks[taskId].func = Mailbox_MailOptionsProcessInput; */
function _mailboxPrintMailOptions(): void {
  // 1:1 décomp gMailboxMailOptions (player_pc.c:231-237) :
  //   { gText_Read,      Mailbox_DoMailRead }
  //   { gText_MoveToBag, Mailbox_MoveToBag }
  //   { gText_Give2,     Mailbox_Give }
  //   { gText_Cancel2,   Mailbox_Cancel }
  const opts: PCOption[] = [
    { label: getString('gText_Read'),      action: _mailboxDoMailRead },
    { label: getString('gText_MoveToBag'), action: _mailboxMoveToBag },
    { label: getString('gText_Give2'),     action: _mailboxGive },
    { label: getString('gText_Cancel2'),   action: _mailboxCancel },
  ];
  sSubWindowId = AddWindow(WIN_ITEM_STORAGE_MENU);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(
    sSubWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM,
  );
  sOptions = opts;
  _printMenuOptions(sSubWindowId, opts);
  InitMenuInUpperLeftCornerNormal(sSubWindowId, opts.length, 0);
  sSubState = 'mailbox_options';
}

/** 1:1 décomp `Mailbox_MailOptionsProcessInput(taskId)` (player_pc.c:767-784). */
function _tickMailboxOptions(_newKeys: number): void {
  const sel = Menu_ProcessInputNoWrap();
  if (sel === MENU_NOTHING_CHOSEN) return;
  if (sel === MENU_B_PRESSED) {
    PlaySE(Songs.SE_SELECT);
    _mailboxCancel();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  sOptions[sel]?.action();
}

/** 1:1 décomp `Mailbox_DoMailRead(taskId)` (player_pc.c:786-790) :
 *      FadeScreen(FADE_TO_BLACK, 0); gTasks[taskId].func = Mailbox_FadeAndReadMail;
 *  → après fade : MailboxMenu_Free + CleanupOverworldWindowsAndTilemaps +
 *    ReadMail(&mail, Mailbox_ReturnToFieldFromReadMail, TRUE) */
function _mailboxDoMailRead(): void {
  _removeSubWindow();
  _clearSticky();
  _removePCWindows();
  const mailIdx = sMailboxSelectedIdx;
  sMailboxSelectedIdx = -1;
  sIsOpen = false;  // close PC (= 1:1 MailboxMenu_Free)
  ReadMail(
    gSaveBlock1Ptr.mail[mailIdx],
    () => {
      // 1:1 décomp `Mailbox_ReturnToFieldFromReadMail` (player_pc.c:803) :
      //   gFieldCallback = Mailbox_ReshowAfterMail;
      //   SetMainCallback2(CB2_ReturnToField);
      // CB2_ReturnToField re-init l'overworld (torn-down par ReadMail/Cleanup), PUIS
      // RunFieldCallback appelle gFieldCallback (= reshow PC) → le PC overlay se rouvre
      // sur le field restauré, avec callback2 = MainCB2_Overworld qui tick TickBedroomPC.
      // BUG corrigé : l'ancien code posait `OpenBedroomPC` DIRECTEMENT comme callback2
      // (pas un CB2 + saute le retour-field) → l'overworld ne tournait plus → écran noir.
      (globalThis as Record<string, unknown>).gFieldCallback = () => OpenBedroomPC(sIsBedroomMode);
      CB2_ReturnToField_Manual();
    },
    true,
  );
}

/** 1:1 décomp `Mailbox_MoveToBag(taskId)` (player_pc.c:828-830) :
 *      DisplayItemMessageOnField(taskId, gText_MessageWillBeLost,
 *                                Mailbox_AskConfirmMoveToBag);
 *  → 1:1 strict : affiche sticky msg "Le message sera perdu, OK?" puis
 *  YesNo prompt via Mailbox_AskConfirmMoveToBag → HandleConfirm → DoMailMoveToBag. */
function _mailboxMoveToBag(): void {
  _removeSubWindow();
  // 1:1 gText_MessageWillBeLost : "Le message sera perdu, OK?"
  _showSticky(getString('gText_MessageWillBeLost') ?? 'Le message sera perdu, OK?');
  _mailboxAskConfirmMoveToBag();
}

/** 1:1 décomp `Mailbox_Give(taskId)` (player_pc.c:881-892) :
 *      if (CalculatePlayerPartyCount() == 0) Mailbox_NoPokemonForMail(taskId);
 *      else FadeScreen + gTasks.func = Mailbox_DoGiveMailPokeMenu;
 *  → ChooseMonToGiveMailFromMailbox (= party_menu.c, port futur) */
function _mailboxGive(): void {
  console.warn('[bedroom-pc] _mailboxGive — STUB, port 1:1 complet différé (party_menu.c)');
  _mailboxCancel();
}

/** 1:1 décomp `Mailbox_Cancel(taskId)` (player_pc.c:936-943) :
 *      MailboxMenu_RemoveWindow(MAILBOXWIN_OPTIONS);
 *      ClearDialogWindowAndFrame(0, FALSE);
 *      Mailbox_DrawMailboxMenu(taskId);  ← redraw list
 *      gTasks[taskId].func = Mailbox_ProcessInput;
 *
 *  Notre port : retour à mailbox_list state, redraw list. */
function _mailboxCancel(): void {
  _removeSubWindow();
  sMailboxSelectedIdx = -1;
  sSubState = 'mailbox_list';
  // Redraw list (= 1:1 Mailbox_DrawMailboxMenu).
  _mailboxOpenList();
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

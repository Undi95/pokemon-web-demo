/**
 * shop.ts — miroir 1:1 de `src/shop.c` (le Pokémart : menu Acheter/Vendre/Quitter
 * + menu d'achat).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/shop.c`.
 *
 * ── Couche DONNÉES ──────────────────────────────────────────────────────────
 * Dans la décomp, l'opcode `pokemart <Label>` passe à `CreatePokemartMenu` un
 * POINTEUR vers un tableau `u16[]` de constantes d'objets (les `.2byte ITEM_*`
 * d'un label dans `data/maps/<X>/scripts.inc`, terminé par `pokemartlistend`).
 * L'extracteur de scripts a jeté ces `.2byte` → on les récupère dans
 * `public/decomp/em/mart-lists.json` ; `GetMartItemList(label)` les résout.
 *
 * ── Couche UI (pattern overlay, calqué sur player_pc.ts) ────────────────────
 * La décomp fait un CB2-swap (CB2_InitBuyMenu) qui REDESSINE la map derrière le
 * menu (BuyMenuDrawMapGraphics). Ici on dessine le menu en OVERLAY au-dessus de
 * l'overworld vivant → l'overworld EST le fond (= équivalent visuel de la « map
 * derrière », sans porter le redraw métatiles). Différences assumées : pas de
 * fade, pas d'icônes d'objets ni de flèches de scroll (= polish différé), et le
 * sous-menu VENDRE (CB2_GoToSellMenu = item_menu.c) reste à câbler.
 *
 * Lifecycle (comme player_pc) : `OpenPokemart(itemList)` ouvre l'overlay,
 * `TickShop()` est pollé chaque frame depuis TestOverworldScene, `IsShopMenuOpen()`
 * dit au script bloqué (opcode `pokemart` via `_runUIOverlay`) quand reprendre.
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, DrawDialogueFrame, ClearDialogWindowAndFrame,
  DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
  FillWindowPixelBuffer, PutWindowTilemap,
  type WindowTemplate,
} from './engine/ui/gba-window-system';
import { LoadUserWindowBorderGfx, LoadMessageBoxGfx } from './text_window';
import {
  AddTextPrinterParameterized3, GetStringRightAlignXOffset,
  StringExpandPlaceholders, gStringVar4,
} from './engine/ui/gba-text-system';
import {
  InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap,
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
} from './engine/ui/gba-menu-system';
import { getRuntime, PlaySE } from '../harness/runtime/decomp-globals';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  type ListMenuTemplate, type ListMenuItem,
} from './list_menu';
import { GetItemName, GetItemPrice, GetItemPocket, GetItemDescription } from './item';
import { AddBagItem, GetBagItemQuantity } from './engine/bag/bag';
import { GetMoney, IsEnoughMoney, RemoveMoney } from './money';
import { DrawMoneyBox, HideMoneyBox, ChangeAmountInMoneyBox } from './engine/ui/money-box-ui';
import { AdjustQuantityAccordingToDPadInput, type IntRef } from './menu_helpers';
import { IncrementGameStat } from './field_player_avatar';
import { getString } from './engine/ui/gba-strings';
import { setStringVar } from './engine/system/string-buffers';
import * as Songs from '../include/constants/songs';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { TEXT_SKIP_DRAW } from './engine/decomp-data/include/text-data';
import { GAME_STAT_SHOPPED } from '../include/constants/game_stat';

// ─── Chargement de la table mart (data décomp) ───────────────────────────────
let sMartLists: Record<string, string[]> | null = null;

/** Charge `mart-lists.json` (une fois, au boot — fire-and-forget en bas de
 *  fichier). L'opcode `pokemart` ne tire que bien plus tard → table prête. */
export async function InitMartLists(): Promise<void> {
  if (sMartLists) return;
  try {
    const resp = await fetch('/decomp/em/mart-lists.json');
    if (!resp.ok) {
      console.error('[shop] échec fetch /decomp/em/mart-lists.json:', resp.status);
      sMartLists = {};
      return;
    }
    sMartLists = await resp.json();
    const n = Object.keys(sMartLists ?? {}).length;
    console.log(`[shop] chargé ${n} listes mart depuis /decomp/em/mart-lists.json`);
  } catch (e) {
    console.error('[shop] InitMartLists a throw:', e);
    sMartLists = {};
  }
}

/** Résout un label de Pokémart en son tableau de constantes d'objets. 1:1
 *  décomp : c'est le `u16 *itemsForSale` que `CreatePokemartMenu` reçoit. */
export function GetMartItemList(label: string): string[] {
  if (!sMartLists) return [];
  return sMartLists[label] ?? [];
}

// ─── Constantes 1:1 décomp ───────────────────────────────────────────────────
const FONT_NORMAL = 1;
const FONT_NARROW = 7;
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;     // palette des TILES de bordure de cadre.
const SHOP_WIN_PAL = 15;      // palette du CONTENU (gStandardMenuPalette : idx1=crème,
                              // idx2=gris foncé, idx3=gris clair) = 1:1 décomp templates.
const TEXT_COLOR_SET: [number, number, number] = [1, 2, 3];

// menu.h : MENU_NOTHING_CHOSEN = -2, MENU_B_PRESSED = -1.
const MENU_NOTHING_CHOSEN = -2;
const MENU_B_PRESSED = -1;
// list_menu.h : LIST_NOTHING_CHOSEN = -1, LIST_CANCEL = -2.
const LIST_NOTHING_CHOSEN = -1;
const LIST_CANCEL = -2;
// 1:1 décomp shop.c:45 `#define MAX_ITEMS_SHOWN 8`.
const MAX_ITEMS_SHOWN = 8;
// 1:1 décomp item.h `#define MAX_BAG_ITEM_CAPACITY 99`.
const MAX_BAG_ITEM_CAPACITY = 99;

// 1:1 décomp shop.c enum MART_TYPE_*.
const MART_TYPE_NORMAL = 0;

// ─── Window templates (1:1 décomp shop.c sShop*WindowTemplates) ──────────────
// Buy/Sell/Quit menu (1:1 sShopMenuWindowTemplates[WIN_BUY_SELL_QUIT], width
// élargie à 8 pour "ACHETER/VENDRE/QUITTER").
const WIN_SHOP_MENU: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 8, height: 6, paletteNum: SHOP_WIN_PAL, baseBlock: 0x8,
};
// Buy screen (1:1 sShopBuyMenuWindowTemplates).
const WIN_ITEM_LIST: WindowTemplate = {
  bg: 0, tilemapLeft: 14, tilemapTop: 2, width: 15, height: 16, paletteNum: SHOP_WIN_PAL, baseBlock: 0x32,
};
const WIN_ITEM_DESCRIPTION: WindowTemplate = {
  bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 14, height: 6, paletteNum: SHOP_WIN_PAL, baseBlock: 0x122,
};
const WIN_QUANTITY_IN_BAG: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 11, width: 12, height: 2, paletteNum: SHOP_WIN_PAL, baseBlock: 0x176,
};
const WIN_QUANTITY_PRICE: WindowTemplate = {
  bg: 0, tilemapLeft: 18, tilemapTop: 11, width: 10, height: 2, paletteNum: SHOP_WIN_PAL, baseBlock: 0x18E,
};
// Message dialogue (bas de l'écran) — 1:1 sShopBuyMenuWindowTemplates[WIN_MESSAGE].
const WIN_MESSAGE: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: DLG_WINDOW_PALETTE_NUM, baseBlock: 0x1A2,
};
// Yes/No (1:1 sShopBuyMenuYesNoWindowTemplates).
const WIN_YESNO: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: SHOP_WIN_PAL, baseBlock: 0x20E,
};

// ─── État (= sMartInfo + sShopData + substate machine) ──────────────────────
type ShopSubState =
  | 'shop_menu'      // Task_ShopMenu (Acheter/Vendre/Quitter)
  | 'buy_list'       // Task_BuyMenu (liste d'items)
  | 'buy_qty'        // Task_BuyHowManyDialogueHandleInput
  | 'buy_confirm'    // BuyMenuConfirmPurchase (Yes/No)
  | 'buy_msg';       // BuyMenuDisplayMessage (attend A/B → continuation)

let sShopOpen = false;
let sSubState: ShopSubState = 'shop_menu';
let sMartType = MART_TYPE_NORMAL;
let sItemList: string[] = [];          // 1:1 sMartInfo.itemList (constantes d'objets)
let sItemCount = 0;                    // 1:1 sMartInfo.itemCount

let sShopMenuWindowId = -1;
let sListWindowId = -1;
let sDescWindowId = -1;
let sBagQtyWindowId = -1;
let sPriceQtyWindowId = -1;
let sMessageWindowId = -1;
let sListTaskId = -1;

let sSelectedIndex = -1;               // index dans sItemList (= list id)
let sSelectedKey = '';                 // sItemList[sSelectedIndex]
const sQuantity: IntRef = { value: 1 };// 1:1 tItemCount
let sTotalCost = 0;                    // 1:1 sShopData.totalCost
let sMaxQuantity = 0;                  // 1:1 sShopData.maxQuantity
let sPendingMsgCont: (() => void) | null = null; // continuation post-message

// ─── Helpers fenêtres ────────────────────────────────────────────────────────
function _addStdWindow(tmpl: WindowTemplate): number {
  const wid = AddWindow(tmpl);
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  DrawStdFrameWithCustomTileAndPalette(wid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  return wid;
}

function _removeWindow(idRef: () => number, set: (v: number) => void): void {
  const id = idRef();
  if (id >= 0) {
    ClearStdWindowAndFrame(id, true);
    RemoveWindow(id);
    set(-1);
  }
}

/** 1:1 décomp `BuyMenuDisplayMessage` : affiche un message dialogue en bas +
 *  stocke la continuation appelée sur A/B (= net-effect du callback). */
function _displayMessage(text: string, cont: (() => void) | null): void {
  if (sMessageWindowId < 0) sMessageWindowId = AddWindow(WIN_MESSAGE);
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sMessageWindowId, true);
  AddTextPrinterParameterized3(sMessageWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, text);
  sPendingMsgCont = cont;
  sSubState = 'buy_msg';
}

function _clearMessage(): void {
  if (sMessageWindowId >= 0) {
    ClearDialogWindowAndFrame(sMessageWindowId, true);
    RemoveWindow(sMessageWindowId);
    sMessageWindowId = -1;
  }
}

// ─── Public lifecycle ────────────────────────────────────────────────────────
export function IsShopMenuOpen(): boolean {
  return sShopOpen;
}

/** 1:1 décomp `CreatePokemartMenu(itemsForSale)` (shop.c:1249) :
 *    CreateShopMenu(MART_TYPE_NORMAL);
 *    SetShopItemsForSale(itemsForSale);
 *    ClearItemPurchases();
 *    SetShopMenuCallback(ScriptContext_Enable);
 *  `itemList` = tableau de constantes (résolu depuis le label par l'opcode).
 *  La reprise du script est gérée par `_runUIOverlay` (close → resume). */
export function OpenPokemart(itemList: string[]): void {
  if (sShopOpen) return;
  sShopOpen = true;
  _setShopItemsForSale(itemList);
  _createShopMenu(MART_TYPE_NORMAL);
  console.log(`[shop] Pokémart ouvert (${sItemCount} objets)`);
}

/** Tick pollé chaque frame depuis TestOverworldScene. */
export function TickShop(): void {
  if (!sShopOpen) return;
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys as number;
  switch (sSubState) {
    case 'shop_menu':   _tickShopMenu(); break;
    case 'buy_list':    _tickBuyMenu(); break;
    case 'buy_qty':     _tickBuyQuantity(newKeys); break;
    case 'buy_confirm': _tickBuyConfirm(); break;
    case 'buy_msg':     _tickBuyMessage(newKeys); break;
  }
}

// ─── SetShopItemsForSale (1:1 shop.c:378) ────────────────────────────────────
function _setShopItemsForSale(items: string[]): void {
  sItemList = items.slice();
  sItemCount = items.length;
}

// ─── CreateShopMenu (1:1 shop.c:340) ─────────────────────────────────────────
function _createShopMenu(martType: number): void {
  sMartType = martType;
  sShopMenuWindowId = _addStdWindow(WIN_SHOP_MENU);
  // 1:1 décomp PrintMenuTable + InitMenuInUpperLeftCornerNormal (Acheter/Vendre/Quitter).
  const labels = [getString('gText_ShopBuy'), getString('gText_ShopSell'), getString('gText_ShopQuit')];
  for (let i = 0; i < labels.length; i++) {
    AddTextPrinterParameterized3(sShopMenuWindowId, FONT_NORMAL, 8, 1 + i * 16, TEXT_COLOR_SET, TEXT_SKIP_DRAW, labels[i]);
  }
  InitMenuInUpperLeftCornerNormal(sShopMenuWindowId, labels.length, 0);
  sSubState = 'shop_menu';
}

// ─── Task_ShopMenu (1:1 shop.c:393) ──────────────────────────────────────────
function _tickShopMenu(): void {
  const sel = Menu_ProcessInputNoWrap();
  if (sel === MENU_NOTHING_CHOSEN) return;
  if (sel === MENU_B_PRESSED) {
    PlaySE(Songs.SE_SELECT);
    _handleShopMenuQuit();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  switch (sel) {
    case 0: _handleShopMenuBuy(); break;
    case 1: _handleShopMenuSell(); break;
    case 2: _handleShopMenuQuit(); break;
  }
}

// ─── Task_HandleShopMenuBuy (1:1 shop.c:416) → ouvre le menu d'achat ─────────
function _handleShopMenuBuy(): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  _initBuyMenu();
}

// ─── Task_HandleShopMenuSell (1:1 shop.c:425) → déféré (bag sell menu) ───────
function _handleShopMenuSell(): void {
  // 1:1 décomp : CB2_GoToSellMenu (item_menu.c) — non porté. Report honnête.
  _displayMessage(getString('gText_AnythingElseICanHelp') ?? '…', () => {
    _clearMessage();
    _createShopMenu(sMartType);
  });
}

// ─── Task_HandleShopMenuQuit (1:1 shop.c:440) ───────────────────────────────
function _handleShopMenuQuit(): void {
  _closeShop();
}

function _closeShop(): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  _exitBuyMenuWindows();
  _clearMessage();
  sShopOpen = false;  // → _runUIOverlay détecte la fermeture, le script reprend
  console.log('[shop] Pokémart fermé');
}

// ─── CB2_InitBuyMenu (1:1 shop.c:501) — version overlay ─────────────────────
function _initBuyMenu(): void {
  // Money box (1:1 AddMoneyLabelObject + PrintMoneyAmountInMoneyBoxWithBorder).
  DrawMoneyBox(GetMoney(), 0, 0);
  // List + description windows.
  sListWindowId = _addStdWindow(WIN_ITEM_LIST);
  sDescWindowId = _addStdWindow(WIN_ITEM_DESCRIPTION);
  // 1:1 BuyMenuBuildListMenuTemplate + ListMenuInit.
  sListTaskId = ListMenuInit(_buildBuyListTemplate(), 0, 0);
  sSubState = 'buy_list';
}

function _exitBuyMenuWindows(): void {
  if (sListTaskId >= 0) { DestroyListMenuTask(sListTaskId); sListTaskId = -1; }
  HideMoneyBox();
  _removeWindow(() => sListWindowId, v => (sListWindowId = v));
  _removeWindow(() => sDescWindowId, v => (sDescWindowId = v));
  _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
  _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
}

// ─── BuyMenuBuildListMenuTemplate (1:1 shop.c:556) ──────────────────────────
function _buildBuyListTemplate(): ListMenuTemplate {
  const items: ListMenuItem[] = [];
  for (let i = 0; i < sItemCount; i++) {
    items.push({ name: GetItemName(sItemList[i]), id: i });
  }
  // 1:1 décomp : dernière entrée = ANNULER (LIST_CANCEL).
  items.push({ name: getString('gText_Cancel2') ?? 'ANNULER', id: LIST_CANCEL });
  const total = sItemCount + 1;
  return {
    items,
    moveCursorFunc: _buyMenuMoveCursor,
    itemPrintFunc: _buyMenuPrintPriceInList,
    totalItems: total,
    maxShowed: Math.min(MAX_ITEMS_SHOWN, total),
    windowId: sListWindowId,
    header_X: 0, item_X: 8, cursor_X: 0,
    // fillValue 1 (opaque) au lieu du 0 décomp : la décomp a un cadre vert
    // (gShopMenu) derrière la liste ; en overlay on n'a pas ce fond → on rend la
    // liste opaque pour la lisibilité (cadre shop 1:1 = polish différé).
    upText_Y: 1, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: FONT_NARROW, cursorKind: 0,
  };
}

// ─── BuyMenuPrintItemDescriptionAndShowItemIcon (1:1 shop.c:591) ────────────
// (icône d'objet différée — on ne met à jour que la description.)
function _buyMenuMoveCursor(index: number, onInit: boolean, _list: unknown): void {
  if (!onInit) PlaySE(Songs.SE_SELECT);
  const description = index === LIST_CANCEL
    ? (getString('gText_QuitShopping') ?? '')
    : GetItemDescription(sItemList[index]);
  // 0x11 (opaque, color idx 1) au lieu du PIXEL_FILL(0) décomp : en overlay,
  // transparent laisserait passer l'overworld → fond opaque pour lisibilité.
  FillWindowPixelBuffer(sDescWindowId, 0x11);
  AddTextPrinterParameterized3(sDescWindowId, FONT_NORMAL, 3, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, description);
}

// ─── BuyMenuPrintPriceInList (1:1 shop.c:620) ───────────────────────────────
function _buyMenuPrintPriceInList(windowId: number, index: number, y: number): void {
  if (index === LIST_CANCEL) return;
  const price = GetItemPrice(sItemList[index]);
  setStringVar(1, String(price));
  StringExpandPlaceholders(gStringVar4, getString('gText_PokedollarVar1') ?? '{STR_VAR_1}¥');
  const x = GetStringRightAlignXOffset(gStringVar4, 120, FONT_NARROW);
  AddTextPrinterParameterized3(windowId, FONT_NARROW, x, y, TEXT_COLOR_SET, TEXT_SKIP_DRAW, gStringVar4);
}

// ─── Task_BuyMenu (1:1 shop.c:964) ──────────────────────────────────────────
function _tickBuyMenu(): void {
  const sel = ListMenu_ProcessInput(sListTaskId);
  if (sel === LIST_NOTHING_CHOSEN) return;
  if (sel === LIST_CANCEL) {
    PlaySE(Songs.SE_SELECT);
    _exitBuyMenu();
    return;
  }
  PlaySE(Songs.SE_SELECT);
  sSelectedIndex = sel;
  sSelectedKey = sItemList[sel];
  // 1:1 décomp : totalCost = GetItemPrice (>> PokeNews non porté).
  sTotalCost = GetItemPrice(sSelectedKey);
  if (!IsEnoughMoney(sTotalCost)) {
    _displayMessage(getString('gText_YouDontHaveMoney') ?? '', _buyReturnToItemList);
    return;
  }
  // 1:1 décomp : CopyItemName → gStringVar1 ; TM/HM → nom du capacité en var2.
  setStringVar(1, GetItemName(sSelectedKey));
  let tpl: string;
  if (GetItemPocket(sSelectedKey) === 'POCKET_TM_HM') {
    tpl = getString('gText_Var1CertainlyHowMany2') ?? '{STR_VAR_1}?';
  } else {
    tpl = getString('gText_Var1CertainlyHowMany') ?? '{STR_VAR_1}?';
  }
  StringExpandPlaceholders(gStringVar4, tpl);
  // Affiche le message « combien ? » puis ouvre la sélection de quantité.
  _displayMessageSticky(gStringVar4);
  _buyHowManyDialogueInit();
}

/** Message affiché sans attendre A/B (= reste pendant la sélection qty). */
function _displayMessageSticky(text: string | Uint8Array): void {
  if (sMessageWindowId < 0) sMessageWindowId = AddWindow(WIN_MESSAGE);
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sMessageWindowId, true);
  AddTextPrinterParameterized3(sMessageWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, text);
}

// ─── Task_BuyHowManyDialogueInit (1:1 shop.c:1030) ──────────────────────────
function _buyHowManyDialogueInit(): void {
  const quantityInBag = GetBagItemQuantity(sSelectedKey);
  sBagQtyWindowId = _addStdWindow(WIN_QUANTITY_IN_BAG);
  setStringVar(1, String(quantityInBag));
  StringExpandPlaceholders(gStringVar4, getString('gText_InBagVar1') ?? 'SAC: {STR_VAR_1}');
  AddTextPrinterParameterized3(sBagQtyWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, gStringVar4);

  sQuantity.value = 1;
  sPriceQtyWindowId = _addStdWindow(WIN_QUANTITY_PRICE);
  // maxQuantity = argent / prix unitaire, plafonné à MAX_BAG_ITEM_CAPACITY.
  const unitPrice = GetItemPrice(sSelectedKey);
  const maxByMoney = Math.floor(GetMoney() / unitPrice);
  sMaxQuantity = Math.min(maxByMoney, MAX_BAG_ITEM_CAPACITY);
  _buyMenuPrintItemQuantityAndPrice();
  sSubState = 'buy_qty';
}

// ─── BuyMenuPrintItemQuantityAndPrice (1:1 shop.c:1182) ─────────────────────
function _buyMenuPrintItemQuantityAndPrice(): void {
  FillWindowPixelBuffer(sPriceQtyWindowId, 0x11);
  setStringVar(1, String(sQuantity.value));
  StringExpandPlaceholders(gStringVar4, getString('gText_xVar1') ?? '×{STR_VAR_1}');
  AddTextPrinterParameterized3(sPriceQtyWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, gStringVar4);
  setStringVar(1, String(sTotalCost));
  StringExpandPlaceholders(gStringVar4, getString('gText_PokedollarVar1') ?? '{STR_VAR_1}¥');
  const x = GetStringRightAlignXOffset(gStringVar4, 78, FONT_NORMAL);
  AddTextPrinterParameterized3(sPriceQtyWindowId, FONT_NORMAL, x, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, gStringVar4);
}

// ─── Task_BuyHowManyDialogueHandleInput (1:1 shop.c:1056) ───────────────────
function _tickBuyQuantity(newKeys: number): void {
  if (AdjustQuantityAccordingToDPadInput(sQuantity, sMaxQuantity)) {
    sTotalCost = GetItemPrice(sSelectedKey) * sQuantity.value;
    _buyMenuPrintItemQuantityAndPrice();
    return;
  }
  if (newKeys & A_BUTTON) {
    PlaySE(Songs.SE_SELECT);
    _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
    _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
    // 1:1 décomp : message « {VAR1}? Vous en voulez {VAR2}? Ça fera {VAR3}¥ ».
    setStringVar(1, GetItemName(sSelectedKey));
    setStringVar(2, String(sQuantity.value));
    setStringVar(3, String(sTotalCost));
    StringExpandPlaceholders(gStringVar4, getString('gText_Var1AndYouWantedVar2') ?? '{STR_VAR_1}? {STR_VAR_2}? {STR_VAR_3}¥');
    _buyMenuConfirmPurchase(gStringVar4);
    return;
  }
  if (newKeys & B_BUTTON) {
    PlaySE(Songs.SE_SELECT);
    _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
    _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
    _buyReturnToItemList();
  }
}

// ─── BuyMenuConfirmPurchase (1:1 shop.c:1092) ───────────────────────────────
function _buyMenuConfirmPurchase(text: string | Uint8Array): void {
  _displayMessageSticky(text);
  CreateYesNoMenu(WIN_YESNO, STD_FRAME_TILE, STD_FRAME_PAL, 0);
  sSubState = 'buy_confirm';
}

function _tickBuyConfirm(): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();
  // -2 = rien, -1 = B, 0 = OUI, 1 = NON.
  if (res === -2) return;
  if (res === 0) {
    PlaySE(Songs.SE_SELECT);
    _buyMenuTryMakePurchase();
  } else {
    PlaySE(Songs.SE_SELECT);
    _buyReturnToItemList();
  }
}

// ─── BuyMenuTryMakePurchase (1:1 shop.c:1097) ───────────────────────────────
function _buyMenuTryMakePurchase(): void {
  if (AddBagItem(sSelectedKey, sQuantity.value)) {
    // 1:1 décomp : message « Tenez ! Merci. » → BuyMenuSubtractMoney → wait A/B.
    _buyMenuSubtractMoney();
    _displayMessage(getString('gText_HereYouGoThankYou') ?? 'Merci!', _afterItemPurchase);
  } else {
    _displayMessage(getString('gText_NoMoreRoomForThis') ?? '', _buyReturnToItemList);
  }
}

// ─── BuyMenuSubtractMoney (1:1 shop.c:1131) ─────────────────────────────────
function _buyMenuSubtractMoney(): void {
  IncrementGameStat(GAME_STAT_SHOPPED);
  RemoveMoney(sTotalCost);
  PlaySE(Songs.SE_SHOP);
  ChangeAmountInMoneyBox(GetMoney());
}

// ─── Task_ReturnToItemListAfterItemPurchase (1:1 shop.c:1144) ───────────────
function _afterItemPurchase(): void {
  // 1:1 décomp : 10+ Poké Balls → une HONOR BALL offerte.
  if (sSelectedKey === 'ITEM_POKE_BALL' && sQuantity.value >= 10 && AddBagItem('ITEM_PREMIER_BALL', 1)) {
    _displayMessage(getString('gText_ThrowInPremierBall') ?? '', _buyReturnToItemList);
  } else {
    _buyReturnToItemList();
  }
}

// ─── BuyMenuReturnToItemList (1:1 shop.c:1169) ──────────────────────────────
function _buyReturnToItemList(): void {
  _clearMessage();
  sSubState = 'buy_list';
}

// ─── ExitBuyMenu (1:1 shop.c:1193) → retour au menu Acheter/Vendre/Quitter ──
function _exitBuyMenu(): void {
  _exitBuyMenuWindows();
  // 1:1 décomp : « Je peux faire autre chose ? » puis re-affiche le shop menu.
  _createShopMenu(sMartType);
}

// ─── BuyMenuDisplayMessage tick (attend A/B → continuation) ─────────────────
function _tickBuyMessage(newKeys: number): void {
  if (newKeys & (A_BUTTON | B_BUTTON)) {
    PlaySE(Songs.SE_SELECT);
    const cont = sPendingMsgCont;
    sPendingMsgCont = null;
    if (cont) cont();
  }
}

// ─── Exposition dev (sonde déterministe) ─────────────────────────────────────
{
  const _g = globalThis as Record<string, unknown>;
  _g.__GetMartItemList = GetMartItemList;
  _g.__InitMartLists = InitMartLists;
  _g.__shopState = () => ({ open: sShopOpen, sub: sSubState, count: sItemCount, sel: sSelectedKey, qty: sQuantity.value, cost: sTotalCost });
}

// 1:1 net-effect : précharge la table dès l'import (= boot via scrcmd.ts).
void InitMartLists();

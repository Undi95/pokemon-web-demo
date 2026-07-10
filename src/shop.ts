/**
 * shop.ts — miroir 1:1 de `src/shop.c` (le Pokémart : menu Acheter/Vendre/Quitter
 * + menu d'achat).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/shop.c`.
 *
 * ── Couche DONNÉES ──────────────────────────────────────────────────────────
 * L'opcode `pokemart <Label>` passe à `CreatePokemartMenu` un pointeur vers un
 * tableau `u16[]` d'objets (les `.2byte ITEM_*` d'un label dans scripts.inc).
 * L'extracteur de scripts a jeté ces `.2byte` → récupérés dans
 * `public/decomp/em/mart-lists.json` ; `GetMartItemList(label)` les résout.
 *
 * ── Couche UI (2 niveaux, 1:1 décomp) ───────────────────────────────────────
 *  1. Menu Acheter/Vendre/Quitter = OVERLAY sur l'overworld (CreateShopMenu).
 *     1:1 décomp : la décomp n'y fait PAS de CB2-swap (juste une window).
 *     Tické par TickShop (depuis MainCB2_Overworld).
 *  2. Menu d'ACHAT = SCÈNE PLEIN ÉCRAN (CB2-swap), 1:1 décomp CB2_InitBuyMenu :
 *     fade → reset BG/sprites → cadre `gShopMenu` sur BG1 + fenêtres sur BG0 →
 *     ListMenuInit + Task_BuyMenu (gTasks). Calqué sur bag-screen.ts (CB2 swap
 *     prouvé). Au close : fade + SetMainCallback2(return) reconstruit l'OW +
 *     re-montre le menu shop. Le script reste bloqué (IsShopMenuOpen) tant que
 *     le shop n'est pas QUITTÉ.
 *
 *  Increment 1 (ce commit) : cadre + fenêtres + liste + achat, FOND NOIR
 *  derrière (la map redessinée BuyMenuDrawMapGraphics = increment 2 ;
 *  icône d'objet + label ARGENT + flèches scroll = increment 3).
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, DrawDialogueFrame, ClearDialogWindowAndFrame,
  ClearWindowTilemap, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
  FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  InitWindows, ShowBg, HideBg, ScheduleBgCopyTilemapToVram,
  type WindowTemplate,
} from './window';
import { LoadUserWindowBorderGfx, LoadMessageBoxGfx } from './text_window';
import {
  MapGridGetMetatileIdAt, MapGridGetMetatileLayerTypeAt,
  NUM_METATILES_IN_PRIMARY, NUM_METATILES_TOTAL, NUM_TILES_PER_METATILE,
  METATILE_LAYER_TYPE_NORMAL, METATILE_LAYER_TYPE_COVERED, METATILE_LAYER_TYPE_SPLIT,
  gMapHeader,
} from './fieldmap';
import { GetStringRightAlignXOffset, CHAR_SPACER_STR } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { StringExpandPlaceholders, gStringVar4 } from '../include/string_util';
import { GetPlayerTextSpeedDelay } from './menu';
import { ShowFieldMessage, IsFieldMessageBoxHidden } from './field_message_box';
import { encodeOwText } from './text';
import { InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap } from './menu';
import {
  getRuntime, PlaySE, LoadPalette, BlendPalettes,
  FreeAllSpritePalettes, ResetPaletteFade, ResetTasks, FreeSpriteTilesByTag,
} from '../harness/runtime/decomp-globals';
import { ResetSpriteData, FreeSpritePaletteByTag, DestroySprite, IndexOfSpritePaletteTag, GetSpriteTileStartByTag } from './sprite';
import { AddItemIconSprite, MAX_SPRITES, preloadItemIconAssets } from './item_icon';
import { assetCache, LoadCompressedSpriteSheet, LoadSpritePalette } from '../harness/runtime/decomp-globals';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  type ListMenuTemplate, type ListMenuItem,
} from './list_menu';
import { GetItemName, GetItemPrice, GetItemPocket, GetItemDescription } from './item';
import { AddBagItem, CountTotalItemQuantityInBag } from './engine/bag/bag';
import { CB2_GoToSellMenu, _setSellMenuExitCallback } from './item_menu';
import { GetMoney, IsEnoughMoney, RemoveMoney, AddMoneyLabelObject, RemoveMoneyLabelObject, PreloadMoneyLabelAsset, PrintMoneyAmountInMoneyBoxWithBorder, PrintMoneyAmountInMoneyBox } from './money';
import { AdjustQuantityAccordingToDPadInput, CreateYesNoMenuWithCallbacks, DisplayMessageAndContinueTask, type IntRef, type YesNoFuncTable } from './menu_helpers';
import { IncrementGameStat, GetXYCoordsOneStepInFrontOfPlayer } from './field_player_avatar';
import { getString } from '../harness/runtime/decomp-strings';
import { setStringVar } from '../include/text';
import { FadeScreen, FADE_TO_BLACK, FADE_FROM_BLACK } from './field_weather';
import { loadTileBin, loadTilemapBin, extractPngPlte } from '../harness/gba/png-loader';
import { CB2_ReturnToFieldLocal_Manual } from './overworld';
import { CreateTask, DestroyTask } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import * as Songs from '../include/constants/songs';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { TEXT_SKIP_DRAW } from '../include/text';
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

// ── Cadres : DEUX contextes distincts (les confondre = LA cause des cadres noirs) ──
// 1. Menu OVERLAY Acheter/Vendre/Quitter (dans l'OVERWORLD) : 1:1 décomp CreateShopMenu →
//    SetStandardWindowBorderStyle = la bordure std DÉJÀ chargée par le terrain (tile 0x214,
//    palette 14, menu.c:25-27). On NE recharge rien → on réutilise la bordure OW. (Marche déjà.)
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;
// 2. BUY-MENU plein écran : 1:1 décomp BuyMenuInitWindows (shop.c:751-752) charge DEUX gfx :
//    LoadUserWindowBorderGfx(WIN_MONEY, 1,   BG_PLTT_ID(13)) → cadre std (money/quantité/yes-no)
//      = tile 1,   palette 13.
//    LoadMessageBoxGfx     (WIN_MONEY, 0xA, BG_PLTT_ID(14)) → cadre dialogue (WIN_MESSAGE)
//      = tile 0xA, palette 14.
//    Layout SANS collision : cadre std 1..9, cadre dialogue 0xA..0x17, contenu WIN_MONEY à
//    0x1E (30). L'ancien bug « money box teal » = DrawMoneyBox générique (baseBlock 0x8 =
//    tiles 8..27) qui chevauchait le gfx du cadre dialogue (0xA..0x17). WIN_MONEY (0x1E) règle ça.
const BUY_FRAME_TILE = 1;
const BUY_FRAME_PAL = 13;
const DLG_FRAME_TILE = 0xA;
const MSG_FRAME_PAL = 14;
const SHOP_WIN_PAL = 15;      // palette du CONTENU des fenêtres (= textbox/dialogue OW persistée).
const SHOP_MENU_PAL = 12;     // 1:1 décomp SHOP_MENU_PALETTE_ID : palette du cadre gShopMenu.
// 1:1 décomp `sShopBuyMenuTextColors[][3]` (shop.c:333) : triplets [fond, texte, ombre].
// TEXT_COLOR_SET = COLORID_NORMAL (descriptions/quantité/message). COLORID_ITEM_LIST a fond=0
// (transparent → laisse voir le panneau jaune) : fond=1 sur les prix = le bug « fond blanc ».
const TEXT_COLOR_SET: [number, number, number] = [1, 2, 3];   // COLORID_NORMAL
const COLORID_ITEM_LIST: [number, number, number] = [0, 2, 3];

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
// 1:1 décomp shop.c:43 `#define TAG_ITEM_ICON_BASE 2110`.
const TAG_ITEM_ICON = 2110;

// ─── Window templates ────────────────────────────────────────────────────────
// Menu Acheter/Vendre/Quitter (overlay) — 1:1 sShopMenuWindowTemplates, width 8.
const WIN_SHOP_MENU: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 8, height: 6, paletteNum: SHOP_WIN_PAL, baseBlock: 0x8,
};
// Buy screen (1:1 sShopBuyMenuWindowTemplates).
// WIN_MONEY = sa PROPRE fenêtre (baseBlock 0x1E), déliée du DrawMoneyBox overworld
// (baseBlock 0x8). C'est l'intuition « tout délier de la textbox » : chaque fenêtre du
// buy-menu a son baseBlock dédié, aucune ne marche sur le gfx d'une autre.
const WIN_MONEY: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 2, paletteNum: SHOP_WIN_PAL, baseBlock: 0x1E,
};
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
const WIN_MESSAGE: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: DLG_WINDOW_PALETTE_NUM, baseBlock: 0x1A2,
};
const WIN_YESNO: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: SHOP_WIN_PAL, baseBlock: 0x20E,
};

// ─── État (= sMartInfo + sShopData + substate machine) ──────────────────────
type ShopSubState =
  | 'shop_menu'          // Task_ShopMenu (overlay)
  | 'buy_goto'           // Task_GoToBuyOrSellMenu (attend le fade → CB2 swap)
  | 'sell_goto'          // Task_GoToBuyOrSellMenu côté vente (fade → CB2_GoToSellMenu)
  | 'buy_list'           // Task_BuyMenu (gTasks, plein écran)
  | 'buy_qty'            // Task_BuyHowManyDialogueHandleInput
  | 'buy_after_purchase' // Task_ReturnToItemListAfterItemPurchase (attend A/B)
  | 'reopen_msg';        // Task_ReturnToShopMenu (DisplayItemMessageOnField → re-ouvre le menu)

let sShopOpen = false;
let sSubState: ShopSubState = 'shop_menu';
let sMartType = MART_TYPE_NORMAL;
let sItemList: string[] = [];          // 1:1 sMartInfo.itemList (constantes d'objets)
let sItemCount = 0;                    // 1:1 sMartInfo.itemCount

let sShopMenuWindowId = -1;
let sMoneyWindowId = -1;               // 1:1 WIN_MONEY (buy-menu, baseBlock 0x1E)
let sListWindowId = -1;
let sDescWindowId = -1;
let sBagQtyWindowId = -1;
let sPriceQtyWindowId = -1;
let sMessageWindowId = -1;
let sReopenMsgShown = false;           // 1:1 garde de Task_ReturnToShopMenu (1 seul Show)
let sListTaskId = -1;
let sBuyTaskId = -1;                    // gTasks task du buy menu
let sIconSpriteId = -1;                 // sprite icône d'objet (slot unique)

let sSelectedIndex = -1;
let sSelectedKey = '';
const sQuantity: IntRef = { value: 1 };
let sTotalCost = 0;
let sMaxQuantity = 0;

// Assets cadre gShopMenu (chargés une fois).
interface ShopAssets {
  frameTiles: Uint8Array; frameTilemap: Uint16Array; framePal: Uint16Array;
}
let sAssets: ShopAssets | null = null;
let sAssetsLoading = false;

// ─── BG layout du buy screen (1:1 sShopBuyMenuBgTemplates) ──────────────────
// BG0 char2 map31 prio0 (fenêtres) ; BG1 char0 map30 prio1 (cadre gShopMenu) ;
// BG2/BG3 = map redessinée (increment 2, noir pour l'instant).
const BUY_BG0_CHAR = 2, BUY_BG0_MAP = 31;
const BUY_BG1_CHAR = 0, BUY_BG1_MAP = 30;
// 1:1 décomp sShopBuyMenuBgTemplates : BG2 char0 map29, BG3 char0 map28. Les trois
// BG (1/2/3) partagent charBase 0 = tuiles du tileset de TERRAIN (primary 0..511,
// secondary 512..1023), réutilisées par BuyMenuDrawMapBg pour dessiner la carte.
const BUY_BG2_CHAR = 0, BUY_BG2_MAP = 29;
const BUY_BG3_CHAR = 0, BUY_BG3_MAP = 28;
// 1:1 décomp : gShopMenu_Gfx décompressé au tile 0x3E3 (au-dessus des tuiles tileset),
// et BuyMenuCopyMenuBgToBg1TilemapBuffer ajoute 0x3E3 aux entrées du tilemap du cadre.
const SHOP_MENU_BASE_TILE = 0x3E3;

// ─── Helpers fenêtres ────────────────────────────────────────────────────────
/** Cadre std du menu OVERLAY (overworld) — 1:1 SetStandardWindowBorderStyle : tile 0x214,
 *  palette 14, la bordure DÉJÀ chargée par le terrain. RÉSERVÉ à WIN_SHOP_MENU. */
function _addStdWindow(tmpl: WindowTemplate): number {
  const wid = AddWindow(tmpl);
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  DrawStdFrameWithCustomTileAndPalette(wid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  return wid;
}

/** Cadre std d'une fenêtre du BUY-MENU — 1:1 décomp DrawStdFrameWithCustomTileAndPalette(wid,
 *  …, 1, 13) (quantité). Le gfx (tile 1, palette 13) est préchargé une fois par
 *  `_buyMenuInitWindows` (≠ 0x214/14 du menu overlay overworld). */
function _addBuyStdWindow(tmpl: WindowTemplate): number {
  const wid = AddWindow(tmpl);
  DrawStdFrameWithCustomTileAndPalette(wid, true, BUY_FRAME_TILE, BUY_FRAME_PAL);
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

/** 1:1 décomp `BuyMenuDisplayMessage` (shop.c:763) :
 *  1:1 BuyMenuDisplayMessage (shop.c:763) via la PRIMITIVE PARTAGÉE
 *  DisplayMessageAndContinueTask (menu_helpers.ts) : dessine le cadre dialogue (tile 0xA,
 *  pal 14), imprime ANIMÉ, et repointe le témoin gTasks[sBuyTaskId].func vers
 *  Task_ContinueTaskAfterMessagePrints. Quand le printer a fini, la continuation est appelée :
 *  elle RESTAURE Task_BuyMenu (le dispatcher) puis enchaîne. Plus de _tickBuyMessage maison. */
function _displayMessage(text: string | Uint8Array, cont: (() => void) | null): void {
  if (sMessageWindowId < 0) sMessageWindowId = AddWindow(WIN_MESSAGE);
  LoadMessageBoxGfx(sMessageWindowId, DLG_FRAME_TILE, MSG_FRAME_PAL * 16);
  DisplayMessageAndContinueTask(sBuyTaskId, sMessageWindowId, DLG_FRAME_TILE, MSG_FRAME_PAL,
    FONT_NORMAL, GetPlayerTextSpeedDelay(), text, () => { _restoreBuyTaskFunc(); cont?.(); });
  // 1:1 décomp shop.c:766 : flush le cadre (BUFFER tilemap BG0 → VRAM).
  ScheduleBgCopyTilemapToVram(0);
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

/** 1:1 décomp `CreatePokemartMenu(itemsForSale)` (shop.c:1249). La reprise du
 *  script est gérée par `_runUIOverlay` (close → resume). */
export function OpenPokemart(itemList: string[]): void {
  if (sShopOpen) return;
  sShopOpen = true;
  void _loadShopAssets();        // précharge le cadre (prêt au moment du Buy)
  void preloadItemIconAssets();  // précharge les icônes d'objets (sprite synchrone après)
  _setShopItemsForSale(itemList);
  ClearItemPurchases();          // 1:1 shop.c:1253
  _createShopMenu(MART_TYPE_NORMAL);
  console.log(`[shop] Pokémart ouvert (${sItemCount} objets)`);
}

/** 1:1 décomp `ScrCmd_pokemart` net-effect (scrcmd.c:1886 : CreatePokemartMenu(ptr) +
 *  ScriptContext_Stop) : ouvre le Pokémart en OVERLAY et renvoie le POLL de native script
 *  (true = shop fermé → reprise du script). Source UNIQUE parsé + byte-VM (voie A) :
 *  le label produits est résolu en liste d'items via GetMartItemList. */
export function doPokemart(productsLabel: string): () => boolean {
  const itemList = GetMartItemList(productsLabel);
  if (itemList.length === 0) console.warn(`[pokemart] '${productsLabel}' — liste d'objets vide (label inconnu ?)`);
  let opened = false;
  void Promise.resolve().then(() => { OpenPokemart(itemList); opened = true; });
  return () => { if (!opened) return false; return !IsShopMenuOpen(); };
}

/** Tick pollé chaque frame depuis TestOverworldScene (= overworld actif).
 *  Ne gère que le menu overlay (shop_menu) + la transition vers le buy menu
 *  (buy_goto attend le fade). Le buy menu plein écran est tické par Task_BuyMenu
 *  (gTasks) sous son propre CB2. */
export function TickShop(): void {
  if (!sShopOpen) return;
  const rt = getRuntime();
  if (!rt) return;
  switch (sSubState) {
    case 'shop_menu':  _tickShopMenu(); break;
    case 'buy_goto':   _tickGoToBuyMenu(); break;
    case 'sell_goto':  _tickGoToSellMenu(); break;
    case 'reopen_msg': _tickReopenShopMenu(); break;
  }
}

// ─── SetShopItemsForSale (1:1 shop.c:378) ────────────────────────────────────
function _setShopItemsForSale(items: string[]): void {
  sItemList = items.slice();
  sItemCount = items.length;
}

// ─── CreateShopMenu (1:1 shop.c:340) — overlay ──────────────────────────────
function _createShopMenu(martType: number): void {
  sMartType = martType;
  // 1:1 décomp : CreateShopMenu NE recharge AUCUNE palette. La palette 15 (= contenu
  // des fenêtres) est celle du dialogue/textbox OW déjà en place (chargée par la field
  // message box). L'ancien `LoadPalette(sStdMenuPal, 15)` ÉCRASAIT cette palette 15 →
  // le cadre du dialogue de terrain (« En quoi puis-je vous aider ? », palette 15) virait
  // au noir = le bug 1. On s'appuie sur la palette 15 OW, exactement comme la décomp.
  sShopMenuWindowId = _addStdWindow(WIN_SHOP_MENU);
  const labels = [getString('gText_ShopBuy'), getString('gText_ShopSell'), getString('gText_ShopQuit')];
  for (let i = 0; i < labels.length; i++) {
    AddTextPrinterParameterized3(sShopMenuWindowId, FONT_NORMAL, 8, 1 + i * 16, TEXT_COLOR_SET, TEXT_SKIP_DRAW, labels[i]);
  }
  InitMenuInUpperLeftCornerNormal(sShopMenuWindowId, labels.length, 0);
  CopyWindowToVram(sShopMenuWindowId, 3 /* COPYWIN_FULL */);
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

// ─── Task_HandleShopMenuBuy (1:1 shop.c:416) → fade puis CB2-swap ───────────
function _handleShopMenuBuy(): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  // 1:1 décomp : FadeScreen(FADE_TO_BLACK, 0) puis Task_GoToBuyOrSellMenu.
  FadeScreen(FADE_TO_BLACK, 0);
  sSubState = 'buy_goto';
}

// ─── Task_GoToBuyOrSellMenu (1:1 shop.c:452) ────────────────────────────────
function _tickGoToBuyMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  // 1:1 décomp : SetMainCallback2(CB2_InitBuyMenu). Le buy menu prend l'écran.
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_InitBuyMenu);
}

// ─── Task_HandleShopMenuSell (1:1 shop.c:425) → fade puis CB2 swap vers le sac ─
function _handleShopMenuSell(): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  // 1:1 décomp : tCallbackHi/Lo = CB2_GoToSellMenu ; func = Task_GoToBuyOrSellMenu ;
  // FadeScreen(FADE_TO_BLACK, 0).
  FadeScreen(FADE_TO_BLACK, 0);
  sSubState = 'sell_goto';
}

// ─── Task_GoToBuyOrSellMenu côté vente (1:1 shop.c:452) ─────────────────────
function _tickGoToSellMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  // 1:1 décomp : SetMainCallback2(CB2_GoToSellMenu) → GoToBagMenu(ITEMMENULOCATION_SHOP,
  // POCKETS_COUNT, CB2_ExitSellMenu). Le sac prend l'écran en mode vente.
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_GoToSellMenu);
}

// ─── CB2_ExitSellMenu (1:1 shop.c:434) — retour OW + re-montre le menu shop ──
/** 1:1 décomp `CB2_ExitSellMenu` :
 *    gFieldCallback = MapPostLoadHook_ReturnToShopMenu ; SetMainCallback2(CB2_ReturnToField).
 *  Identique au tail de `Task_ExitBuyMenu` : reconstruit l'OW puis 'reopen_msg' affiche
 *  « Autre chose ? » avant de re-montrer le menu Acheter/Vendre/Quitter. */
export function CB2_ExitSellMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  (globalThis as Record<string, unknown>).gFieldCallback = () => {
    sReopenMsgShown = false;
    sSubState = 'reopen_msg';
  };
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}
// Enregistre l'exitCallback côté bag (le sac ne peut pas importer shop = cycle ESM).
_setSellMenuExitCallback(CB2_ExitSellMenu);

// ─── Task_HandleShopMenuQuit (1:1 shop.c:440) ───────────────────────────────
function _handleShopMenuQuit(): void {
  _closeShop();
}

function _closeShop(): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  _clearMessage();
  sShopOpen = false;  // → _runUIOverlay détecte la fermeture, le script reprend
  console.log('[shop] Pokémart fermé');
}

// ════════════════════════════════════════════════════════════════════════════
//  MENU D'ACHAT PLEIN ÉCRAN (CB2-swap, 1:1 CB2_InitBuyMenu)
// ════════════════════════════════════════════════════════════════════════════

/** Charge le cadre gShopMenu (tiles + tilemap + palette) une fois. */
async function _loadShopAssets(): Promise<void> {
  if (sAssets || sAssetsLoading) return;
  sAssetsLoading = true;
  try {
    const [frameTiles, frameTilemap, framePal] = await Promise.all([
      loadTileBin('/decomp/em/shop/menu.png', 4),
      loadTilemapBin('/decomp/em/shop/menu.bin'),
      extractPngPlte('/decomp/em/shop/menu.png'),
    ]);
    sAssets = {
      frameTiles, frameTilemap, framePal: framePal ?? new Uint16Array(16),
    };
    void PreloadMoneyLabelAsset(); // label ARGENT (money.ts) — précharge money.png pour shop+sac
    console.log(`[shop] cadre gShopMenu chargé (${frameTiles.length}o tiles, ${frameTilemap.length} entrées)`);
  } catch (e) {
    console.error('[shop] échec chargement cadre gShopMenu:', e);
  } finally {
    sAssetsLoading = false;
  }
}

/** 1:1 décomp `CB2_InitBuyMenu` (shop.c:501) — state machine. Tickée par le
 *  runtime (callback2 actif) jusqu'au swap vers MainCB2_BuyMenuRun. */
function CB2_InitBuyMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
      // 1:1 décomp CB2_InitBuyMenu case 1 (FreeTempTileDataBuffersIfPossible) :
      // on ATTEND que le cadre gShopMenu soit chargé (fetch async) avant
      // d'initialiser les BG — sinon _loadShopFrameToVram tourne sur sAssets=null
      // → cadre noir. (Notre pipeline d'assets = fetch, pas DMA ROM.)
      if (!sAssets) { void _loadShopAssets(); return; }
      // 1:1 décomp : SetVBlankHBlankCallbacksToNull + reset OAM/scanline/palette/
      // sprites/tasks + alloc sShopData + BuyMenuBuildListMenuTemplate.
      rt.SetVBlankCallback(null);
      FreeAllSpritePalettes();
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      ResetSpriteData();
      ResetTasks();
      _initBuyMenuBgs(rt);
      _buyMenuInitWindows();
      _loadShopFrameToVram(rt);
      rt.gMain.state++;
      break;
    case 1:
      rt.gMain.state++;
      break;
    default: {
      // 1:1 décomp : BuyMenuDrawGraphics + ListMenuInit + CreateTask(Task_BuyMenu)
      // + BlendPalettes + BeginNormalPaletteFade + SetMainCallback2(CB2_BuyMenu).
      _buyMenuDrawGraphics();
      _buildBuyList();
      sBuyTaskId = CreateTask(Task_BuyMenu, 8);
      BlendPalettes(0xFFFFFFFF, 16, 0);
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.SetVBlankCallback(VBlankCB_BuyMenu);
      rt.SetMainCallback2(MainCB2_BuyMenuRun);
      sSubState = 'buy_list';
      break;
    }
  }
}

// 1:1 net-effect : runtime auto-tick (RunTasks/AnimateSprites/BuildOam/
// UpdatePaletteFade + transferts). Marqueurs de nommage.
function MainCB2_BuyMenuRun(): void { /* runtime auto-tick */ }
function VBlankCB_BuyMenu(): void { /* transferts auto */ }

/** 1:1 décomp `BuyMenuInitBgs` (shop.c:717) — reset + config BG (calqué sur
 *  bag-screen _initBagBgs : manip directe rt.gba). */
function _initBuyMenuBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  // 1:1 décomp BuyMenuInitBgs : ResetBgsAndClearDma3 + InitBgsFromTemplates.
  // ⚠️ La décomp NE clear PAS la VRAM ni les palettes BG : le tileset de TERRAIN
  // (char base 0, tiles 0..1023) et ses palettes (banks 0..12) PERSISTENT de
  // l'overworld → BuyMenuDrawMapBg réutilise ces tuiles+couleurs pour dessiner la
  // carte derrière le menu. On préserve donc 0x0000..0x7FFF (tuiles) + les palettes,
  // et on ne clear que ce que le menu redessine (tilemaps des 4 BG + char base 2).
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  // OAM reset (1:1 CpuFastFill(0, OAM) — ResetSpriteData déjà fait dans CB2 case 0).
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0; oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  // InitBgsFromTemplates(0, sShopBuyMenuBgTemplates, 4) : les 4 BG.
  const cfg = (i: 0 | 1 | 2 | 3, char: number, map: number, pri: number) => {
    const c = rt.gba.bg(i).config;
    c.charBaseIndex = char; c.mapBaseIndex = map; c.screenSize = 0;
    c.paletteMode = 0; c.priority = pri; c.visible = true; c.hofs = 0; c.vofs = 0;
  };
  cfg(0, BUY_BG0_CHAR, BUY_BG0_MAP, 0);
  cfg(1, BUY_BG1_CHAR, BUY_BG1_MAP, 1);
  cfg(2, BUY_BG2_CHAR, BUY_BG2_MAP, 2);
  cfg(3, BUY_BG3_CHAR, BUY_BG3_MAP, 3);
  // 1:1 FillBgTilemapBufferRect_Palette0(0..3) : clear les 4 tilemaps (mapBase),
  // PAS les tuiles. + char base 2 (tuiles BG0 = fenêtres/texte, redessinées).
  const clearRegion = (off: number, len: number) => { for (let k = 0; k < len; k++) rt.gba.vram[off + k] = 0; };
  clearRegion(BUY_BG0_MAP * 0x800, 0x800);
  clearRegion(BUY_BG1_MAP * 0x800, 0x800);
  clearRegion(BUY_BG2_MAP * 0x800, 0x800);
  clearRegion(BUY_BG3_MAP * 0x800, 0x800);
  clearRegion(2 * 0x4000, 0x4000);  // char base 2 (BG0 tuiles)
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  rt.SetGpuReg(0x1C, 0); rt.SetGpuReg(0x1E, 0);
  // DISPCNT : OBJ_ON | OBJ_1D_MAP | BG0..3_ON.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400 | 0x800);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); ShowBg(2); ShowBg(3);
}

/** 1:1 décomp `BuyMenuDecompressBgGraphics` + `BuyMenuCopyMenuBgToBg1Tilemap
 *  Buffer` (shop.c:740/936) : tiles du cadre en VRAM (BG1 char) + tilemap sur
 *  BG1 avec palette SHOP_MENU_PAL, + palette du cadre en slot 12. */
function _loadShopFrameToVram(rt: ReturnType<typeof getRuntime>): void {
  if (!rt || !sAssets) return;
  // 1:1 BuyMenuDecompressBgGraphics (shop.c:740) : DecompressAndCopyTileDataToVram(1,
  // gShopMenu_Gfx, 0x3A0, 0x3E3, 0) → tuiles du cadre au tile 0x3E3, JUSTE au-dessus
  // des tuiles du tileset de terrain (0..0x3E2) qu'on préserve pour la carte de fond.
  // Le tilemap du cadre est superposé plus tard par _buyMenuCopyMenuBgToBg1 (après la
  // carte), exactement comme la décomp (BuyMenuDrawGraphics : map d'abord, cadre ensuite).
  const charOff = SHOP_MENU_BASE_TILE * 32;
  const maxBytes = Math.max(0, 0x8000 - charOff);
  rt.gba.vram.set(sAssets.frameTiles.subarray(0, Math.min(sAssets.frameTiles.length, maxBytes)), charOff);
  // Palette du cadre → BG slot 12 (1:1 LoadCompressedPalette(gShopMenu_Pal, BG_PLTT_ID(12))).
  LoadPalette(sAssets.framePal, SHOP_MENU_PAL * 16, sAssets.framePal.length * 2);
}

// ─── 1:1 décomp BuyMenuDrawMapGraphics (shop.c:781-848) ─────────────────────
// La carte autour du joueur (15×10 metatiles) est dessinée derrière le menu en
// réutilisant les tuiles du tileset de terrain (char base 0, persistées de
// l'overworld). Mapping buffers décomp → nos BG (SetBgTilemapBuffer 717-723) :
// buf[1]=BG1, buf[3]=BG2, buf[2]=BG3. Le routage des couches est identique à
// field_camera DrawMetatile (NORMAL: bas→BG2/haut→BG1 ; COVERED: bas→BG3/haut→BG2 ;
// SPLIT: bas→BG3/haut→BG1).

/** 1:1 décomp `BuyMenuDrawMapMetatileLayer` (shop.c:841) : écrit un metatile 2×2
 *  (4 tiles) dans la tilemap d'un BG à la position `off` (top-left, grille 32 large). */
function _drawMapMetatileLayer(bgIdx: 0 | 1 | 2 | 3, off: number, src: Uint16Array, srcOff: number): void {
  const rt = getRuntime(); if (!rt) return;
  const tm = rt.gba.bg(bgIdx).tilemap;
  tm[off] = src[srcOff] | 0;
  tm[off + 1] = src[srcOff + 1] | 0;
  tm[off + 32] = src[srcOff + 2] | 0;
  tm[off + 33] = src[srcOff + 3] | 0;
}

/** 1:1 décomp `BuyMenuDrawMapMetatile` (shop.c:819). */
function _drawMapMetatile(x: number, y: number, src: Uint16Array, srcOff: number, layerType: number): void {
  const off = x * 2 + y * 64;
  switch (layerType) {
    case METATILE_LAYER_TYPE_NORMAL:
      _drawMapMetatileLayer(2, off, src, srcOff);      // bottom → BG2 (buf[3])
      _drawMapMetatileLayer(1, off, src, srcOff + 4);  // top → BG1 (buf[1])
      break;
    case METATILE_LAYER_TYPE_COVERED:
      _drawMapMetatileLayer(3, off, src, srcOff);      // bottom → BG3 (buf[2])
      _drawMapMetatileLayer(2, off, src, srcOff + 4);  // top → BG2 (buf[3])
      break;
    case METATILE_LAYER_TYPE_SPLIT:
      _drawMapMetatileLayer(3, off, src, srcOff);      // bottom → BG3 (buf[2])
      _drawMapMetatileLayer(1, off, src, srcOff + 4);  // top → BG1 (buf[1])
      break;
  }
}

/** 1:1 décomp `BuyMenuCheckForOverlapWithMenuBg` (shop.c:949) : true si la tuile
 *  metatile (x,y) du cadre gShopMenu est VIDE → on dessine le vrai layerType ;
 *  sinon (sous le cadre) on force COVERED (carte poussée dans les BG arrière). */
function _checkOverlapWithMenuBg(x: number, y: number): boolean {
  if (!sAssets) return true;
  const tm = sAssets.frameTilemap;
  const o = x * 2 + y * 64;
  return tm[o] === 0 && tm[o + 32] === 0 && tm[o + 1] === 0 && tm[o + 33] === 0;
}

/** 1:1 décomp `BuyMenuDrawMapBg` (shop.c:788) : dessine la carte 15×10 metatiles
 *  centrée sur (joueur+1 pas devant)-4 dans les tilemaps BG1/2/3. */
function _buyMenuDrawMapBg(): void {
  const mapLayout = gMapHeader?.mapLayout;
  if (!mapLayout) return;
  const f = GetXYCoordsOneStepInFrontOfPlayer();
  const x0 = f.x - 4, y0 = f.y - 4;
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 15; i++) {
      let metatile = MapGridGetMetatileIdAt(x0 + i, y0 + j);
      if (metatile >= NUM_METATILES_TOTAL) metatile = 0;
      const layerType = _checkOverlapWithMenuBg(i, j)
        ? MapGridGetMetatileLayerTypeAt(x0 + i, y0 + j)
        : METATILE_LAYER_TYPE_COVERED;
      let src: Uint16Array, srcOff: number;
      if (metatile < NUM_METATILES_IN_PRIMARY) {
        src = mapLayout.primaryTileset.metatiles;
        srcOff = metatile * NUM_TILES_PER_METATILE;
      } else {
        src = mapLayout.secondaryTileset.metatiles;
        srcOff = (metatile - NUM_METATILES_IN_PRIMARY) * NUM_TILES_PER_METATILE;
      }
      _drawMapMetatile(i, j, src, srcOff, layerType);
    }
  }
}

/** 1:1 décomp `BuyMenuCopyMenuBgToBg1TilemapBuffer` (shop.c:936) : superpose le cadre
 *  gShopMenu sur BG1, palette SHOP_MENU_PAL + base tile 0x3E3 (entrées 0 = carte visible). */
function _buyMenuCopyMenuBgToBg1(): void {
  const rt = getRuntime(); if (!rt || !sAssets) return;
  const tm = rt.gba.bg(1).tilemap;
  const src = sAssets.frameTilemap;
  for (let i = 0; i < src.length && i < tm.length; i++) {
    if (src[i] !== 0) tm[i] = (src[i] + ((SHOP_MENU_PAL << 12) | SHOP_MENU_BASE_TILE)) & 0xFFFF;
  }
}

/** 1:1 décomp `BuyMenuInitWindows` (shop.c:747) :
 *    InitWindows(sShopBuyMenuWindowTemplates);
 *    DeactivateAllTextPrinters();
 *    LoadUserWindowBorderGfx(WIN_MONEY, 1,   BG_PLTT_ID(13));   → cadre std  tile 1,   pal 13
 *    LoadMessageBoxGfx     (WIN_MONEY, 0xA, BG_PLTT_ID(14));    → cadre dialogue 0xA,  pal 14
 *    PutWindowTilemap(WIN_MONEY); PutWindowTilemap(WIN_ITEM_LIST); PutWindowTilemap(WIN_ITEM_DESCRIPTION);
 *  On inclut WIN_MONEY dans InitWindows (baseBlock 0x1E = SA fenêtre, déliée) ; les
 *  fenêtres quantité/message/yes-no sont AddWindow à la demande (mêmes baseBlocks décomp). */
function _buyMenuInitWindows(): void {
  const ids = InitWindows([WIN_MONEY, WIN_ITEM_LIST, WIN_ITEM_DESCRIPTION]);
  sMoneyWindowId = ids[0];
  sListWindowId = ids[1];
  sDescWindowId = ids[2];
  // 1:1 : le gfx du cadre std (tile 1, pal 13) ET du cadre dialogue (tile 0xA, pal 14)
  // chargés UNE fois ici. Toutes les fenêtres du buy-menu les réutilisent — zéro collision.
  LoadUserWindowBorderGfx(sMoneyWindowId, BUY_FRAME_TILE, BUY_FRAME_PAL * 16);
  LoadMessageBoxGfx(sMoneyWindowId, DLG_FRAME_TILE, MSG_FRAME_PAL * 16);
  PutWindowTilemap(sMoneyWindowId);
  FillWindowPixelBuffer(sListWindowId, 0x00); PutWindowTilemap(sListWindowId);
  FillWindowPixelBuffer(sDescWindowId, 0x00); PutWindowTilemap(sDescWindowId);
}

/** 1:1 décomp `BuyMenuDrawGraphics` (shop.c:769) : carte + cadre + label ARGENT + money box
 *  (sur SA fenêtre WIN_MONEY, tile 1/pal 13) + schedule copies. */
function _buyMenuDrawGraphics(): void {
  _buyMenuDrawMapBg();          // 1:1 BuyMenuDrawMapGraphics : la carte derrière le menu
  _buyMenuCopyMenuBgToBg1();    // 1:1 BuyMenuCopyMenuBgToBg1TilemapBuffer : cadre par-dessus
  AddMoneyLabelObject(24, 11);  // 1:1 shop.c:773 AddMoneyLabelObject(24, 11) (French diff) — money.ts
  // 1:1 shop.c:774 : PrintMoneyAmountInMoneyBoxWithBorder(WIN_MONEY, 1, 13, GetMoney(...)).
  FillWindowPixelBuffer(sMoneyWindowId, 0x00);
  PrintMoneyAmountInMoneyBoxWithBorder(sMoneyWindowId, BUY_FRAME_TILE, BUY_FRAME_PAL, GetMoney());
  CopyWindowToVram(sMoneyWindowId, 3 /* COPYWIN_FULL */);
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
}

// AddMoneyLabelObject / RemoveMoneyLabelObject = portés 1:1 dans money.ts (= money.c).

// ─── BuyMenuBuildListMenuTemplate (1:1 shop.c:556) ──────────────────────────
function _buildBuyList(): void {
  sListTaskId = ListMenuInit(_buildBuyListTemplate(), 0, 0);
}

function _buildBuyListTemplate(): ListMenuTemplate {
  const items: ListMenuItem[] = [];
  for (let i = 0; i < sItemCount; i++) {
    items.push({ name: GetItemName(sItemList[i]), id: i });
  }
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
    // fillValue 0 (transparent) : le cadre gShopMenu (BG1) fournit le panneau
    // jaune derrière la liste — 1:1 décomp sShopBuyMenuListTemplate.
    upText_Y: 1, cursorPal: 2, fillValue: 0, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: FONT_NARROW, cursorKind: 0,
  };
}

// ─── BuyMenuPrintItemDescriptionAndShowItemIcon (1:1 shop.c:591) ────────────
function _buyMenuMoveCursor(index: number, onInit: boolean, _list: unknown): void {
  if (!onInit) PlaySE(Songs.SE_SELECT);
  // 1:1 décomp BuyMenuAddItemIcon : icône de l'objet sélectionné (ITEM_LIST_END
  // pour ANNULER → icône « retour »). Slot unique (vs 2-slots décomp ; pattern
  // player_pc prouvé).
  _drawBuyMenuItemIcon(index === LIST_CANCEL ? 'ITEM_LIST_END' : sItemList[index]);
  const description = index === LIST_CANCEL
    ? (getString('gText_QuitShopping') ?? '')
    : GetItemDescription(sItemList[index]);
  FillWindowPixelBuffer(sDescWindowId, 0x00);
  AddTextPrinterParameterized3(sDescWindowId, FONT_NORMAL, 3, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, description);
}

/** 1:1 décomp `BuyMenuAddItemIcon` (shop.c:680) : sprite icône à x2=24, y2=88,
 *  priority 0. Slot unique (free + re-add à chaque déplacement du curseur). */
function _drawBuyMenuItemIcon(itemKey: string): void {
  _removeBuyMenuItemIcon();
  const spriteId = AddItemIconSprite(TAG_ITEM_ICON, TAG_ITEM_ICON, itemKey);
  if (spriteId === MAX_SPRITES) return;
  sIconSpriteId = spriteId;
  const rt = getRuntime() as unknown as {
    gSprites?: Array<{ x2: number; y2: number; oamIndex: number } | undefined>;
    gba?: { oam?: Array<{ priority: number }> };
  } | null;
  const spr = rt?.gSprites?.[spriteId];
  if (spr) {
    spr.x2 = 24; spr.y2 = 88;  // 1:1 décomp shop.c:693-694
    const o = rt?.gba?.oam?.[spr.oamIndex];
    // 1:1 : la décomp ne force PAS la priorité (laisse l'icône SOUS les fenêtres BG0).
    // Priorité 1 = au-dessus de la carte (BG1/2/3) mais SOUS le BG0 → la fenêtre
    // « SAC: » (WIN_QUANTITY_IN_BAG, top=11 = pile sous l'icône) couvre l'icône. (était 0
    // = icône DEVANT les fenêtres = chevauchait la box SAC, bug user.)
    if (o) o.priority = 1;
  }
}

/** 1:1 décomp `BuyMenuRemoveItemIcon` (shop.c:705). */
function _removeBuyMenuItemIcon(): void {
  if (sIconSpriteId < 0) return;
  FreeSpriteTilesByTag(TAG_ITEM_ICON);
  FreeSpritePaletteByTag(TAG_ITEM_ICON);
  DestroySprite(sIconSpriteId);
  sIconSpriteId = -1;
}

// ─── BuyMenuPrintPriceInList (1:1 shop.c:620) ───────────────────────────────
function _buyMenuPrintPriceInList(windowId: number, index: number, y: number): void {
  if (index === LIST_CANCEL) return;
  const price = GetItemPrice(sItemList[index]);
  setStringVar(1, String(price));
  StringExpandPlaceholders(gStringVar4, getString('gText_PokedollarVar1') ?? '{STR_VAR_1}¥');
  const x = GetStringRightAlignXOffset(gStringVar4, 120, FONT_NARROW);
  // 1:1 décomp shop.c:645 : sShopBuyMenuTextColors[COLORID_ITEM_LIST] (fond 0 transparent),
  // PAS COLORID_NORMAL (fond 1 = le bug « prix sur fond blanc »).
  AddTextPrinterParameterized3(windowId, FONT_NARROW, x, y, COLORID_ITEM_LIST, TEXT_SKIP_DRAW, gStringVar4);
}

// ─── Task_BuyMenu (1:1 shop.c:964) — gTasks task, dispatch des substates ────
function Task_BuyMenu(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  const newKeys = rt.gMain.newKeys as number;
  switch (sSubState) {
    case 'buy_list':           _tickBuyMenu(); break;
    case 'buy_qty':            _tickBuyQuantity(newKeys); break;
    case 'buy_after_purchase': _tickAfterItemPurchase(newKeys); break;
  }
}

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
  // 1:1 shop.c:984 : ClearWindowTilemap(WIN_ITEM_DESCRIPTION) — cache la description (le
  // message va occuper le bas). Restaurée par _buyReturnToItemList. (Scroll arrows + cursor
  // gris = non portés, hors des 5 bugs.)
  if (sDescWindowId >= 0) ClearWindowTilemap(sDescWindowId);
  sTotalCost = GetItemPrice(sSelectedKey);
  if (!IsEnoughMoney(sTotalCost)) {
    _displayMessage(getString('gText_YouDontHaveMoney'), _buyReturnToItemList);
    return;
  }
  setStringVar(1, GetItemName(sSelectedKey));
  const tpl = (GetItemPocket(sSelectedKey) === 'POCKET_TM_HM')
    ? getString('gText_Var1CertainlyHowMany2')
    : getString('gText_Var1CertainlyHowMany');
  StringExpandPlaceholders(gStringVar4, tpl);
  // 1:1 shop.c:1009 : BuyMenuDisplayMessage(gText_Var1CertainlyHowMany, Task_BuyHowManyDialogueInit).
  // Le message s'ANIME ; quand il a fini, la continuation dessine les fenêtres quantité (le
  // message RESTE = c'est ça la « stickiness », pas un cas spécial).
  _displayMessage(gStringVar4, _buyHowManyDialogueInit);
}

// ─── Task_BuyHowManyDialogueInit (1:1 shop.c:1030) — continuation du message ─
function _buyHowManyDialogueInit(): void {
  // 1:1 shop.c:1034 : u16 quantityInBag = CountTotalItemQuantityInBag(tItemId);
  const quantityInBag = CountTotalItemQuantityInBag(sSelectedKey);
  // 1:1 shop.c:1037 : DrawStdFrameWithCustomTileAndPalette(WIN_QUANTITY_IN_BAG, FALSE, 1, 13).
  sBagQtyWindowId = _addBuyStdWindow(WIN_QUANTITY_IN_BAG);
  // 1:1 décomp shop.c:1038 : ConvertIntToDecimalStringN(STR_CONV_MODE_RIGHT_ALIGN,
  // MAX_ITEM_DIGITS+1=4) → nombre aligné à DROITE avec padding CHAR_SPACER. « SAC:    4 ».
  setStringVar(1, String(quantityInBag).padStart(4, CHAR_SPACER_STR));
  StringExpandPlaceholders(gStringVar4, getString('gText_InBagVar1'));
  AddTextPrinterParameterized3(sBagQtyWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, gStringVar4);
  sQuantity.value = 1;
  // 1:1 shop.c:1042 : DrawStdFrameWithCustomTileAndPalette(WIN_QUANTITY_PRICE, FALSE, 1, 13).
  sPriceQtyWindowId = _addBuyStdWindow(WIN_QUANTITY_PRICE);
  const unitPrice = GetItemPrice(sSelectedKey);
  sMaxQuantity = Math.min(Math.floor(GetMoney() / unitPrice), MAX_BAG_ITEM_CAPACITY);
  _buyMenuPrintItemQuantityAndPrice();
  ScheduleBgCopyTilemapToVram(0);  // 1:1 shop.c:1044 : flush les cadres quantité.
  sSubState = 'buy_qty';
}

function _buyMenuPrintItemQuantityAndPrice(): void {
  FillWindowPixelBuffer(sPriceQtyWindowId, 0x11);
  // 1:1 décomp shop.c:1188 : ConvertIntToDecimalStringN(STR_CONV_MODE_LEADING_ZEROS,
  // BAG_ITEM_CAPACITY_DIGITS=2) → « 01 » (pas « 1 »).
  setStringVar(1, String(sQuantity.value).padStart(2, '0'));
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
    if (sListWindowId >= 0) PutWindowTilemap(sListWindowId);  // 1:1 shop.c:1074
    setStringVar(1, GetItemName(sSelectedKey));
    setStringVar(2, String(sQuantity.value));
    setStringVar(3, String(sTotalCost));
    StringExpandPlaceholders(gStringVar4, getString('gText_Var1AndYouWantedVar2'));
    // 1:1 shop.c:1078 : BuyMenuDisplayMessage(gText_Var1AndYouWantedVar2, BuyMenuConfirmPurchase).
    _displayMessage(gStringVar4, _buyMenuConfirmPurchase);
    return;
  }
  if (newKeys & B_BUTTON) {
    PlaySE(Songs.SE_SELECT);
    _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
    _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
    _buyReturnToItemList();
  }
}

// ─── BuyMenuConfirmPurchase (1:1 shop.c:1092) — via la primitive partagée ────
// 1:1 décomp `sShopPurchaseYesNoFuncs = { BuyMenuTryMakePurchase, BuyMenuReturnToItemList }`.
// Nos callbacks RESTAURENT d'abord le témoin `gTasks[sBuyTaskId].func = Task_BuyMenu` (que
// CreateYesNoMenuWithCallbacks avait repointé vers Task_CallYesOrNoCallback), puis enchaînent
// (la suite pose le substate). C'est le passage de témoin 1:1 — plus de dispatch yes/no maison.
const sShopPurchaseYesNoFuncs: YesNoFuncTable = {
  yesFunc: () => { _restoreBuyTaskFunc(); _buyMenuTryMakePurchase(); },
  noFunc:  () => { _restoreBuyTaskFunc(); _buyReturnToItemList(); },
};

function _restoreBuyTaskFunc(): void {
  const rt = getRuntime();
  if (rt && sBuyTaskId >= 0) rt.gTasks[sBuyTaskId].func = Task_BuyMenu;
}

function _buyMenuConfirmPurchase(): void {
  // 1:1 shop.c:1092 : CreateYesNoMenuWithCallbacks(taskId, &template, 1,0,0, 1, 13, funcs).
  // La primitive crée la boîte OUI/NON + repointe gTasks[sBuyTaskId].func vers
  // Task_CallYesOrNoCallback (= le yes/no se gère seul, plus de substate 'buy_confirm').
  CreateYesNoMenuWithCallbacks(sBuyTaskId, WIN_YESNO, 1, 0, 0, BUY_FRAME_TILE, BUY_FRAME_PAL, sShopPurchaseYesNoFuncs);
}

// ─── historique d'achats (Smart Shopper TV) ──────────────────────────────────

/** 1:1 décomp `EWRAM_DATA struct ItemSlot gMartPurchaseHistory[SMARTSHOPPER_NUM_ITEMS]`
 *  (shop.c:113) — achats de la session mart courante, lus par le TV show Smart
 *  Shopper (tv.c SmartShopper_BeforeInterview). itemId = clé item ('ITEM_X') ou 0. */
export const gMartPurchaseHistory: Array<{ itemId: string | number; quantity: number }> =
  Array.from({ length: 3 /* SMARTSHOPPER_NUM_ITEMS */ }, () => ({ itemId: 0, quantity: 0 }));
let sPurchaseHistoryId = 0;

/** 1:1 décomp `ClearItemPurchases` (shop.c:1211). */
function ClearItemPurchases(): void {
  sPurchaseHistoryId = 0;
  for (const s of gMartPurchaseHistory) { s.itemId = 0; s.quantity = 0; }
}

/** 1:1 décomp `RecordItemPurchase(taskId)` (shop.c:1217) — tItemId/tItemCount =
 *  nos sSelectedKey/sQuantity (task data → module state, adaptation shop.ts). */
function RecordItemPurchase(): void {
  for (let i = 0; i < gMartPurchaseHistory.length; i++) {
    if (gMartPurchaseHistory[i].itemId === sSelectedKey && gMartPurchaseHistory[i].quantity !== 0) {
      if (gMartPurchaseHistory[i].quantity + sQuantity.value > 255)
        gMartPurchaseHistory[i].quantity = 255;
      else
        gMartPurchaseHistory[i].quantity += sQuantity.value;
      return;
    }
  }
  if (sPurchaseHistoryId < gMartPurchaseHistory.length) {
    gMartPurchaseHistory[sPurchaseHistoryId].itemId = sSelectedKey;
    gMartPurchaseHistory[sPurchaseHistoryId].quantity = sQuantity.value;
    sPurchaseHistoryId++;
  }
}

// ─── BuyMenuTryMakePurchase (1:1 shop.c:1097) — callback YES du yes/no ───────
function _buyMenuTryMakePurchase(): void {
  if (sListWindowId >= 0) PutWindowTilemap(sListWindowId);  // 1:1 shop.c:1101
  if (AddBagItem(sSelectedKey, sQuantity.value)) {
    // 1:1 : BuyMenuDisplayMessage(gText_HereYouGoThankYou, BuyMenuSubtractMoney). L'argent est
    // retiré APRÈS l'impression du « Tenez! Merci infiniment. » (= continuation = SE_SHOP cha-ching).
    _displayMessage(getString('gText_HereYouGoThankYou'), _buyMenuSubtractMoney);
    RecordItemPurchase();  // 1:1 shop.c:1108
  } else {
    _displayMessage(getString('gText_NoMoreRoomForThis'), _buyReturnToItemList);
  }
}

// ─── BuyMenuSubtractMoney (1:1 shop.c:1131) — continuation du « Tenez! » ─────
function _buyMenuSubtractMoney(): void {
  IncrementGameStat(GAME_STAT_SHOPPED);
  RemoveMoney(sTotalCost);
  PlaySE(Songs.SE_SHOP);
  // 1:1 shop.c:1136 : PrintMoneyAmountInMoneyBox(WIN_MONEY, GetMoney(...), 0) — SANS
  // FillWindowPixelBuffer (la décomp n'en met pas). Le champ argent est large fixe (6+¥) et
  // le text-printer repeint SON fond ; le reste de l'intérieur (blanc, posé par le cadre au
  // draw initial) reste intact. Un FillWindowPixelBuffer(0) ici rendait transparent (invisible)
  // le côté de la box non couvert par les chiffres (régression repérée à la MaJ de l'argent).
  PrintMoneyAmountInMoneyBox(sMoneyWindowId, GetMoney(), 0);
  CopyWindowToVram(sMoneyWindowId, 2 /* COPYWIN_GFX */);
  // 1:1 : gTasks[taskId].func = Task_ReturnToItemListAfterItemPurchase (attend A/B).
  sSubState = 'buy_after_purchase';
}

// ─── Task_ReturnToItemListAfterItemPurchase (1:1 shop.c:1144) ───────────────
function _tickAfterItemPurchase(newKeys: number): void {
  if (!(newKeys & (A_BUTTON | B_BUTTON))) return;
  PlaySE(Songs.SE_SELECT);
  // 1:1 : acheter 10+ Poké Balls → Premier Ball offerte.
  if (sSelectedKey === 'ITEM_POKE_BALL' && sQuantity.value >= 10 && AddBagItem('ITEM_PREMIER_BALL', 1)) {
    _displayMessage(getString('gText_ThrowInPremierBall'), _buyReturnToItemList);
  } else {
    _buyReturnToItemList();
  }
}

// ─── BuyMenuReturnToItemList (1:1 shop.c:1169) ──────────────────────────────
function _buyReturnToItemList(): void {
  // 1:1 décomp BuyMenuReturnToItemList (shop.c:1169) : ré-affiche la liste ET la
  // DESCRIPTION, couvertes par le message / l'écran d'achat (« SAC: »). Sans le
  // PutWindowTilemap(WIN_ITEM_DESCRIPTION), la description disparaissait après un
  // aller-retour (bug user : « il manque les infos sur l'objet »).
  _clearMessage();
  if (sListWindowId >= 0) PutWindowTilemap(sListWindowId);
  if (sDescWindowId >= 0) PutWindowTilemap(sDescWindowId);
  ScheduleBgCopyTilemapToVram(0);
  sSubState = 'buy_list';
}

// ─── ExitBuyMenu (1:1 shop.c:1193) → fade + retour OW + re-montre shop menu ─
function _exitBuyMenu(): void {
  FadeScreen(FADE_TO_BLACK, 0);
  // Task_ExitBuyMenu attend le fade puis cleanup + retour OW. Task_BuyMenu est détruit
  // ci-dessous → le substate devient inerte jusqu'au reopen (pas besoin de park).
  const rt = getRuntime();
  if (!rt) return;
  // Remplace Task_BuyMenu par un task d'attente de fade.
  if (sBuyTaskId >= 0) { DestroyTask(sBuyTaskId); sBuyTaskId = -1; }
  sBuyTaskId = CreateTask(Task_ExitBuyMenu, 8);
}

function Task_ExitBuyMenu(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  // Cleanup buy menu windows + list + icône + label ARGENT + money box (WIN_MONEY).
  if (sListTaskId >= 0) { DestroyListMenuTask(sListTaskId); sListTaskId = -1; }
  _removeBuyMenuItemIcon();
  RemoveMoneyLabelObject();
  _removeWindow(() => sMoneyWindowId, v => (sMoneyWindowId = v));
  _removeWindow(() => sListWindowId, v => (sListWindowId = v));
  _removeWindow(() => sDescWindowId, v => (sDescWindowId = v));
  _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
  _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
  _clearMessage();
  if (sBuyTaskId >= 0) { DestroyTask(sBuyTaskId); sBuyTaskId = -1; }
  // 1:1 décomp : gFieldCallback = MapPostLoadHook_ReturnToShopMenu ;
  // SetMainCallback2(CB2_ReturnToField). Reconstruit l'OW puis (via 'reopen_msg')
  // affiche « Je peux faire quelque chose d'autre ? » AVANT de re-montrer le menu shop.
  // sShopOpen reste true → le script reste bloqué.
  (globalThis as Record<string, unknown>).gFieldCallback = () => {
    sReopenMsgShown = false;
    sSubState = 'reopen_msg';
  };
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

// ─── Task_ReturnToShopMenu (1:1 shop.c:468) — après retour au terrain ───────
// 1:1 : DisplayItemMessageOnField(gText_AnythingElseICanHelp, ShowShopMenuAfterExitingBuyOrSellMenu).
// Le « bug 5 » (dialogue de sortie manquant) = ce message qui était sauté ; on l'affiche
// via la field message box (= fenêtre 0, le vrai DisplayItemMessageOnField), PUIS on re-crée
// le menu Acheter/Vendre/Quitter quand le texte a fini de s'imprimer (il reste visible).
function _tickReopenShopMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;  // ≈ IsWeatherNotFadingIn (attend le fade-in OW)
  if (!sReopenMsgShown) {
    if (ShowFieldMessage(encodeOwText(getString('gText_AnythingElseICanHelp')))) {
      sReopenMsgShown = true;
    }
    return;
  }
  if (!IsFieldMessageBoxHidden()) return;  // attend la fin de l'impression
  sReopenMsgShown = false;
  _createShopMenu(sMartType);
}


// ─── Exposition dev (sonde déterministe) ─────────────────────────────────────
{
  const _g = globalThis as Record<string, unknown>;
  _g.__GetMartItemList = GetMartItemList;
  _g.__InitMartLists = InitMartLists;
  _g.__shopState = () => ({ open: sShopOpen, sub: sSubState, count: sItemCount, sel: sSelectedKey, qty: sQuantity.value, cost: sTotalCost });
  _g.__OpenPokemart = OpenPokemart; // hook debug (= __shopState) : ouvrir un Mart au runtime pour tester achat/vente
}

// 1:1 net-effect : précharge la table dès l'import (= boot via scrcmd.ts).
void InitMartLists();

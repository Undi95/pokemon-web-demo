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
  DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM,
  FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  InitWindows, ShowBg, HideBg, ScheduleBgCopyTilemapToVram,
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
import {
  getRuntime, PlaySE, LoadPalette, BlendPalettes,
  FreeAllSpritePalettes, ResetPaletteFade, ResetTasks,
} from '../harness/runtime/decomp-globals';
import { ResetSpriteData } from './sprite';
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
import { FadeScreen, FADE_TO_BLACK, FADE_FROM_BLACK } from './engine/system/fade-screen';
import { loadTileBin, loadTilemapBin, extractPngPlte, loadGbaPal } from '../harness/gba/png-loader';
import { CB2_ReturnToFieldLocal_Manual } from './engine/ui/option-menu-return';
import { CreateTask, DestroyTask } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
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
const STD_FRAME_PAL = 14;     // palette des TILES de bordure de cadre std.
const SHOP_WIN_PAL = 15;      // palette du CONTENU des fenêtres (gStandardMenuPalette).
const SHOP_MENU_PAL = 12;     // 1:1 décomp SHOP_MENU_PALETTE_ID : palette du cadre gShopMenu.
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

// ─── Window templates ────────────────────────────────────────────────────────
// Menu Acheter/Vendre/Quitter (overlay) — 1:1 sShopMenuWindowTemplates, width 8.
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
const WIN_MESSAGE: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: DLG_WINDOW_PALETTE_NUM, baseBlock: 0x1A2,
};
const WIN_YESNO: WindowTemplate = {
  bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: SHOP_WIN_PAL, baseBlock: 0x20E,
};

// ─── État (= sMartInfo + sShopData + substate machine) ──────────────────────
type ShopSubState =
  | 'shop_menu'      // Task_ShopMenu (overlay)
  | 'buy_goto'       // Task_GoToBuyOrSellMenu (attend le fade → CB2 swap)
  | 'buy_list'       // Task_BuyMenu (gTasks, plein écran)
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
let sBuyTaskId = -1;                    // gTasks task du buy menu

let sSelectedIndex = -1;
let sSelectedKey = '';
const sQuantity: IntRef = { value: 1 };
let sTotalCost = 0;
let sMaxQuantity = 0;
let sPendingMsgCont: (() => void) | null = null;

// Assets cadre gShopMenu (chargés une fois).
interface ShopAssets { frameTiles: Uint8Array; frameTilemap: Uint16Array; framePal: Uint16Array; }
let sAssets: ShopAssets | null = null;
let sAssetsLoading = false;
// Palette std menu (slot 15) — vidée par le BG-takeover du buy menu puis non
// rechargée par le reload OW ; on la recharge dans _createShopMenu (sinon texte
// + intérieur de cadre noir sur noir = invisibles au re-affichage).
let sStdMenuPal: Uint16Array | null = null;

// ─── BG layout du buy screen (1:1 sShopBuyMenuBgTemplates) ──────────────────
// BG0 char2 map31 prio0 (fenêtres) ; BG1 char0 map30 prio1 (cadre gShopMenu) ;
// BG2/BG3 = map redessinée (increment 2, noir pour l'instant).
const BUY_BG0_CHAR = 2, BUY_BG0_MAP = 31;
const BUY_BG1_CHAR = 0, BUY_BG1_MAP = 30;

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

/** 1:1 décomp `BuyMenuDisplayMessage` : message dialogue en bas + continuation
 *  appelée sur A/B. */
function _displayMessage(text: string, cont: (() => void) | null): void {
  if (sMessageWindowId < 0) sMessageWindowId = AddWindow(WIN_MESSAGE);
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sMessageWindowId, true);
  AddTextPrinterParameterized3(sMessageWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, text);
  sPendingMsgCont = cont;
  sSubState = 'buy_msg';
}

/** Message affiché sans attendre A/B (= reste pendant la sélection qty). */
function _displayMessageSticky(text: string | Uint8Array): void {
  if (sMessageWindowId < 0) sMessageWindowId = AddWindow(WIN_MESSAGE);
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  DrawDialogueFrame(sMessageWindowId, true);
  AddTextPrinterParameterized3(sMessageWindowId, FONT_NORMAL, 0, 1, TEXT_COLOR_SET, TEXT_SKIP_DRAW, text);
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
  void _loadShopAssets(); // précharge le cadre (prêt au moment du Buy)
  _setShopItemsForSale(itemList);
  _createShopMenu(MART_TYPE_NORMAL);
  console.log(`[shop] Pokémart ouvert (${sItemCount} objets)`);
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
    case 'shop_menu': _tickShopMenu(); break;
    case 'buy_goto':  _tickGoToBuyMenu(); break;
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
  // Recharge la palette std menu (15) — vidée par le buy menu / reload OW.
  if (sStdMenuPal) LoadPalette(sStdMenuPal, SHOP_WIN_PAL * 16, 32);
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

// ─── Task_HandleShopMenuSell (1:1 shop.c:425) → déféré ──────────────────────
function _handleShopMenuSell(): void {
  // CB2_GoToSellMenu (item_menu.c) — non porté. Report honnête : reste au menu.
  _displayMessageOnShopMenu(getString('gText_AnythingElseICanHelp') ?? '…');
}

/** Affiche un message bref puis re-montre le menu Acheter/Vendre/Quitter
 *  (overlay). Utilisé pour le VENDRE non porté. */
function _displayMessageOnShopMenu(text: string): void {
  _removeWindow(() => sShopMenuWindowId, v => (sShopMenuWindowId = v));
  _displayMessage(text, () => { _clearMessage(); _createShopMenu(sMartType); });
}

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
    const [frameTiles, frameTilemap, framePal, stdMenuPal] = await Promise.all([
      loadTileBin('/decomp/em/shop/menu.png', 4),
      loadTilemapBin('/decomp/em/shop/menu.bin'),
      extractPngPlte('/decomp/em/shop/menu.png'),
      loadGbaPal('/decomp/em/interface/std_menu.pal'),
    ]);
    sAssets = { frameTiles, frameTilemap, framePal: framePal ?? new Uint16Array(16) };
    sStdMenuPal = stdMenuPal;
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
  // ResetVramOamAndBgCntRegs : DISPCNT/BGxCNT=0, clear VRAM/OAM/PLTT.
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0; oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) { rt.gPlttBufferUnfaded.set(i, 0); rt.gPlttBufferFaded.set(i, 0); }
  for (let i = 0; i < 256; i++) { rt.gba.palette.loadBgRange(i, [0]); rt.gba.palette.loadObjRange(i, [0]); }
  // InitBgsFromTemplates(0, sShopBuyMenuBgTemplates, 4).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = BUY_BG0_CHAR; bg0c.mapBaseIndex = BUY_BG0_MAP; bg0c.screenSize = 0;
  bg0c.paletteMode = 0; bg0c.priority = 0; bg0c.visible = true; bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = BUY_BG1_CHAR; bg1c.mapBaseIndex = BUY_BG1_MAP; bg1c.screenSize = 0;
  bg1c.paletteMode = 0; bg1c.priority = 1; bg1c.visible = true; bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config; bg2c.visible = false;
  const bg3c = rt.gba.bg(3).config; bg3c.visible = false;
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  // DISPCNT : OBJ_ON | OBJ_1D_MAP | BG0_ON | BG1_ON.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); HideBg(2); HideBg(3);
}

/** 1:1 décomp `BuyMenuDecompressBgGraphics` + `BuyMenuCopyMenuBgToBg1Tilemap
 *  Buffer` (shop.c:740/936) : tiles du cadre en VRAM (BG1 char) + tilemap sur
 *  BG1 avec palette SHOP_MENU_PAL, + palette du cadre en slot 12. */
function _loadShopFrameToVram(rt: ReturnType<typeof getRuntime>): void {
  if (!rt || !sAssets) return;
  // Tiles du cadre → BG1 char block (offset 0 ; tile 0 reste transparent car
  // les entrées tilemap de valeur 0 ne sont pas écrites — cf. décomp `if(src!=0)`).
  const charOff = BUY_BG1_CHAR * 0x4000;
  rt.gba.vram.set(sAssets.frameTiles, charOff);
  // Tilemap → BG1 map block. 1:1 BuyMenuCopyMenuBgToBg1TilemapBuffer : on ajoute
  // la palette SHOP_MENU_PAL (<<12) aux entrées non nulles (les bits de flip
  // H/V 0x400/0x800 sont déjà dans les entrées menu.bin).
  const mapOff = BUY_BG1_MAP * 0x800;
  const tm = sAssets.frameTilemap;
  for (let i = 0; i < tm.length && i < 1024; i++) {
    let entry = tm[i];
    if ((entry & 0x3FF) !== 0) entry = (entry | (SHOP_MENU_PAL << 12)) & 0xFFFF;
    else entry = 0;
    rt.gba.vram[mapOff + i * 2] = entry & 0xFF;
    rt.gba.vram[mapOff + i * 2 + 1] = (entry >> 8) & 0xFF;
  }
  // Palette du cadre → BG slot 12.
  LoadPalette(sAssets.framePal, SHOP_MENU_PAL * 16, sAssets.framePal.length * 2);
}

/** 1:1 décomp `BuyMenuInitWindows` (shop.c:747). InitWindows + borders/msgbox
 *  + std menu palette (15). Fenêtres list/desc SANS DrawStdFrame (le cadre
 *  gShopMenu fournit les boîtes ; les fenêtres sont transparentes par-dessus). */
function _buyMenuInitWindows(): void {
  const ids = InitWindows([WIN_ITEM_LIST, WIN_ITEM_DESCRIPTION]);
  sListWindowId = ids[0];
  sDescWindowId = ids[1];
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  FillWindowPixelBuffer(sListWindowId, 0x00); PutWindowTilemap(sListWindowId);
  FillWindowPixelBuffer(sDescWindowId, 0x00); PutWindowTilemap(sDescWindowId);
}

/** 1:1 décomp `BuyMenuDrawGraphics` (shop.c:769) : money box + schedule copies.
 *  (BuyMenuDrawMapGraphics = increment 2.) */
function _buyMenuDrawGraphics(): void {
  DrawMoneyBox(GetMoney(), 0, 0);
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
}

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
  const description = index === LIST_CANCEL
    ? (getString('gText_QuitShopping') ?? '')
    : GetItemDescription(sItemList[index]);
  FillWindowPixelBuffer(sDescWindowId, 0x00);
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

// ─── Task_BuyMenu (1:1 shop.c:964) — gTasks task, dispatch des substates ────
function Task_BuyMenu(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  const newKeys = rt.gMain.newKeys as number;
  switch (sSubState) {
    case 'buy_list':    _tickBuyMenu(); break;
    case 'buy_qty':     _tickBuyQuantity(newKeys); break;
    case 'buy_confirm': _tickBuyConfirm(); break;
    case 'buy_msg':     _tickBuyMessage(newKeys); break;
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
  sTotalCost = GetItemPrice(sSelectedKey);
  if (!IsEnoughMoney(sTotalCost)) {
    _displayMessage(getString('gText_YouDontHaveMoney') ?? '', _buyReturnToItemList);
    return;
  }
  setStringVar(1, GetItemName(sSelectedKey));
  const tpl = (GetItemPocket(sSelectedKey) === 'POCKET_TM_HM')
    ? getString('gText_Var1CertainlyHowMany2') ?? '{STR_VAR_1}?'
    : getString('gText_Var1CertainlyHowMany') ?? '{STR_VAR_1}?';
  StringExpandPlaceholders(gStringVar4, tpl);
  _displayMessageSticky(gStringVar4);
  _buyHowManyDialogueInit();
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
  const unitPrice = GetItemPrice(sSelectedKey);
  sMaxQuantity = Math.min(Math.floor(GetMoney() / unitPrice), MAX_BAG_ITEM_CAPACITY);
  _buyMenuPrintItemQuantityAndPrice();
  sSubState = 'buy_qty';
}

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
  if (res === -2) return;
  PlaySE(Songs.SE_SELECT);
  if (res === 0) _buyMenuTryMakePurchase();
  else _buyReturnToItemList();
}

// ─── BuyMenuTryMakePurchase (1:1 shop.c:1097) ───────────────────────────────
function _buyMenuTryMakePurchase(): void {
  if (AddBagItem(sSelectedKey, sQuantity.value)) {
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

// ─── ExitBuyMenu (1:1 shop.c:1193) → fade + retour OW + re-montre shop menu ─
function _exitBuyMenu(): void {
  FadeScreen(FADE_TO_BLACK, 0);
  // Task_ExitBuyMenu : attend le fade puis cleanup + retour OW.
  sSubState = 'buy_msg'; // park (Task_BuyMenu skip pendant gPaletteFade.active)
  sPendingMsgCont = null;
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
  // Cleanup buy menu windows + list.
  if (sListTaskId >= 0) { DestroyListMenuTask(sListTaskId); sListTaskId = -1; }
  HideMoneyBox();
  _removeWindow(() => sListWindowId, v => (sListWindowId = v));
  _removeWindow(() => sDescWindowId, v => (sDescWindowId = v));
  _removeWindow(() => sBagQtyWindowId, v => (sBagQtyWindowId = v));
  _removeWindow(() => sPriceQtyWindowId, v => (sPriceQtyWindowId = v));
  _clearMessage();
  if (sBuyTaskId >= 0) { DestroyTask(sBuyTaskId); sBuyTaskId = -1; }
  // 1:1 décomp : gFieldCallback = MapPostLoadHook_ReturnToShopMenu ;
  // SetMainCallback2(CB2_ReturnToField). Reconstruit l'OW puis re-montre le
  // menu shop (overlay). sShopOpen reste true → le script reste bloqué.
  (globalThis as Record<string, unknown>).gFieldCallback = () => {
    _createShopMenu(sMartType);
  };
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
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

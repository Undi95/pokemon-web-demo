// AUTO-GENERATED from src/shop.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/shop.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SCROLL_ARROW = 2100;
export const TAG_ITEM_ICON_BASE = 2110;
export const MAX_ITEMS_SHOWN = 8;
export const SHOP_MENU_PALETTE_ID = 12;
/** Raw expr: `data[1]` */
export const tItemCount_EXPR = "data[1]";
/** Raw expr: `data[5]` */
export const tItemId_EXPR = "data[5]";
/** Raw expr: `data[7]` */
export const tListTaskId_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tCallbackHi_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tCallbackLo_EXPR = "data[9]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_BUY_SELL_QUIT: 0,
  WIN_BUY_QUIT: 1,
} as const;
export const ENUM_WIN_1 = {
  WIN_MONEY: 0,
  WIN_ITEM_LIST: 1,
  WIN_ITEM_DESCRIPTION: 2,
  WIN_QUANTITY_IN_BAG: 3,
  WIN_QUANTITY_PRICE: 4,
  WIN_MESSAGE: 5,
} as const;
export const ENUM_COLORID_2 = {
  COLORID_NORMAL: 0,
  COLORID_ITEM_LIST: 1,
  COLORID_GRAY_CURSOR: 2,
} as const;
export const ENUM_MART_3 = {
  MART_TYPE_NORMAL: 0,
  MART_TYPE_DECOR: 1,
  MART_TYPE_DECOR2: 2,
} as const;
export const ENUM_OBJ_4 = {
  OBJ_EVENT_ID: 0,
  X_COORD: 1,
  Y_COORD: 2,
  ANIM_NUM: 3,
  LAYER_TYPE: 4,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sShopMenuWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 9, height: 6, paletteNum: 15, baseBlock: 8 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 9, height: 4, paletteNum: 15, baseBlock: 8 },
] as const;
export const sShopBuyMenuWindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 2, paletteNum: 15, baseBlock: 30 },
  { bg: 0, tilemapLeft: 14, tilemapTop: 2, width: 15, height: 16, paletteNum: 15, baseBlock: 50 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 14, height: 6, paletteNum: 15, baseBlock: 290 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 11, width: 12, height: 2, paletteNum: 15, baseBlock: 374 },
  { bg: 0, tilemapLeft: 18, tilemapTop: 11, width: 10, height: 2, paletteNum: 15, baseBlock: 398 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 418 },
] as const;
export const sShopBuyMenuYesNoWindowTemplates = { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 526 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sShopBuyMenuBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── MenuAction ─────────────────────────────────────────────────────────────
export const sShopMenuActions_BuySellQuit = [
  { void_u8: "Task_HandleShopMenuBuy" },
  { void_u8: "Task_HandleShopMenuSell" },
  { void_u8: "Task_HandleShopMenuQuit" },
] as const;
export const sShopMenuActions_BuyQuit = [
  { void_u8: "Task_HandleShopMenuBuy" },
  { void_u8: "Task_HandleShopMenuQuit" },
] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct MartInfo", name: 'sMartInfo', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPurchaseHistoryId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct ItemSlot", name: 'gMartPurchaseHistory', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_ShopMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleShopMenuQuit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_InitBuyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Task_GoToBuyOrSellMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'MapPostLoadHook_ReturnToShopMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ReturnToShopMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowShopMenuAfterExitingBuyOrSellMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuDrawGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuAddScrollIndicatorArrows', ret: "void", arity: 0, params: "void" },
  { name: 'Task_BuyMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuBuildListMenuTemplate', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuInitBgs', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuInitWindows', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuDecompressBgGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuSetListEntry', ret: "void", arity: 3, params: "struct ListMenuItem *, u16, u8 *" },
  { name: 'BuyMenuAddItemIcon', ret: "void", arity: 2, params: "u16, u8" },
  { name: 'BuyMenuRemoveItemIcon', ret: "void", arity: 2, params: "u16, u8" },
  { name: 'BuyMenuPrint', ret: "void", arity: 6, params: "u8 windowId, const u8 *text, u8 x, u8 y, s8 speed, u8 colorSet" },
  { name: 'BuyMenuDrawMapGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuCopyMenuBgToBg1TilemapBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuCollectObjectEventData', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuDrawObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuDrawMapBg', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuCheckForOverlapWithMenuBg', ret: "bool8", arity: 2, params: "int, int" },
  { name: 'BuyMenuDrawMapMetatile', ret: "void", arity: 4, params: "s16, s16, const u16 *, u8" },
  { name: 'BuyMenuDrawMapMetatileLayer', ret: "void", arity: 4, params: "u16 *dest, s16 offset1, s16 offset2, const u16 *src" },
  { name: 'BuyMenuCheckIfObjectEventOverlapsMenuBg', ret: "bool8", arity: 1, params: "s16 *" },
  { name: 'ExitBuyMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitBuyMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuTryMakePurchase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuReturnToItemList', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_BuyHowManyDialogueInit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuConfirmPurchase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuPrintItemQuantityAndPrice', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_BuyHowManyDialogueHandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuSubtractMoney', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RecordItemPurchase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReturnToItemListAfterItemPurchase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReturnToItemListAfterDecorationPurchase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleShopMenuBuy', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleShopMenuSell', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BuyMenuPrintItemDescriptionAndShowItemIcon', ret: "void", arity: 3, params: "s32 item, bool8 onInit, struct ListMenu *list" },
  { name: 'BuyMenuPrintPriceInList', ret: "void", arity: 3, params: "u8 windowId, u32 itemId, u8 y" },
  { name: 'CreateShopMenu', ret: "u8", arity: 1, params: "u8 martType" },
  { name: 'SetShopItemsForSale', ret: "void", arity: 1, params: "const u16 *items" },
  { name: 'CB2_ExitSellMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayItemMessageOnField', ret: "else", arity: 3, params: "taskId, gText_AnythingElseICanHelp, ShowShopMenuAfterExitingBuyOrSellMenu" },
  { name: 'CB2_BuyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_BuyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuFreeMemory', ret: "void", arity: 0, params: "void" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "name, gDecorations[item].name" },
  { name: 'BuyMenuRemoveScrollIndicatorArrows', ret: "void", arity: 0, params: "void" },
  { name: 'BuyMenuPrintCursor', ret: "void", arity: 2, params: "u8 scrollIndicatorsTaskId, u8 colorSet" },
  { name: 'BuyMenuDisplayMessage', ret: "void", arity: 3, params: "u8 taskId, const u8 *text, TaskFunc callback" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_YouWantedVar1ThatllBeVar2" },
  { name: 'ClearItemPurchases', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePokemartMenu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
  { name: 'CreateDecorationShop1Menu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
  { name: 'CreateDecorationShop2Menu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BuyHowManyDialogueHandleInput',
  'Task_BuyHowManyDialogueInit',
  'Task_BuyMenu',
  'Task_ExitBuyMenu',
  'Task_GoToBuyOrSellMenu',
  'Task_HandleShopMenuBuy',
  'Task_HandleShopMenuQuit',
  'Task_HandleShopMenuSell',
  'Task_ReturnToItemListAfterDecorationPurchase',
  'Task_ReturnToItemListAfterItemPurchase',
  'Task_ReturnToShopMenu',
  'Task_ShopMenu',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_BuyMenu',
  'CB2_ExitSellMenu',
  'CB2_InitBuyMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'decoration.h',
  'decoration_inventory.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_weather.h',
  'fieldmap.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'item_icon.h',
  'item_menu.h',
  'list_menu.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'menu_helpers.h',
  'money.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'scanline_effect.h',
  'script.h',
  'shop.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'text_window.h',
  'tv.h',
  'constants/decorations.h',
  'constants/items.h',
  'constants/metatile_behaviors.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;

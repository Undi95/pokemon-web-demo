// AUTO-GENERATED from src/item_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/item_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_POCKET_SCROLL_ARROW = 110;
export const TAG_BAG_SCROLL_ARROW = 111;
/** Raw expr: `((max(BAG_TMHM_COUNT,              \` */
export const MAX_POCKET_ITEMS_EXPR = "((max(BAG_TMHM_COUNT,              \\";
export const MAX_ITEMS_SHOWN = 8;
export const NOT_SWAPPING = 255;
/** Raw expr: `data[0]` */
export const tListTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tListPosition_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tQuantity_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tNeverRead_EXPR = "data[3]";
/** Raw expr: `data[8]` */
export const tItemCount_EXPR = "data[8]";
/** Raw expr: `data[10]` */
export const tMsgWindowId_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tPocketSwitchDir_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tPocketSwitchTimer_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tPocketSwitchState_EXPR = "data[13]";
/** Raw expr: `data[3]` */
export const tUsingRegisteredKeyItem_EXPR = "data[3]";
/** Raw expr: `data[8]` */
export const tTimer_EXPR = "data[8]";
export const WALLY_BAG_DELAY = 102;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SWITCH_0 = {
  SWITCH_POCKET_NONE: 0,
  SWITCH_POCKET_LEFT: 1,
  SWITCH_POCKET_RIGHT: 2,
} as const;
export const ENUM_ACTION_1 = {
  ACTION_USE: 0,
  ACTION_TOSS: 1,
  ACTION_REGISTER: 2,
  ACTION_GIVE: 3,
  ACTION_CANCEL: 4,
  ACTION_BATTLE_USE: 5,
  ACTION_CHECK: 6,
  ACTION_WALK: 7,
  ACTION_DESELECT: 8,
  ACTION_CHECK_TAG: 9,
  ACTION_CONFIRM: 10,
  ACTION_SHOW: 11,
  ACTION_GIVE_FAVOR_LADY: 12,
  ACTION_CONFIRM_QUIZ_LADY: 13,
  ACTION_DUMMY: 14,
} as const;
export const ENUM_WIN_2 = {
  WIN_ITEM_LIST: 0,
  WIN_DESCRIPTION: 1,
  WIN_POCKET_NAME: 2,
  WIN_TMHM_INFO_ICONS: 3,
  WIN_TMHM_INFO: 4,
  WIN_MESSAGE: 5,
} as const;
export const ENUM_COLORID_3 = {
  COLORID_NORMAL: 0,
  COLORID_POCKET_NAME: 1,
  COLORID_GRAY_CURSOR: 2,
  COLORID_UNUSED: 3,
  COLORID_TMHM_INFO: 4,
  COLORID_NONE: 255,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sDefaultBagWindows = [
  { bg: 0, tilemapLeft: 14, tilemapTop: 2, width: 15, height: 16, paletteNum: 1, baseBlock: 39 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 14, height: 6, paletteNum: 1, baseBlock: 279 },
  { bg: 0, tilemapLeft: 4, tilemapTop: 1, width: 8, height: 2, paletteNum: 1, baseBlock: 417 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 13, width: 5, height: 6, paletteNum: 12, baseBlock: 363 },
  { bg: 0, tilemapLeft: 7, tilemapTop: 13, width: 4, height: 6, paletteNum: 12, baseBlock: 393 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 433 },
] as const;
export const sContextMenuWindowTemplates = [
  { bg: 1, tilemapLeft: 22, tilemapTop: 17, width: 7, height: 2, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 15, tilemapTop: 15, width: 14, height: 4, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 15, tilemapTop: 13, width: 14, height: 6, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 433 },
  { bg: 1, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 24, tilemapTop: 17, width: 5, height: 2, paletteNum: 15, baseBlock: 541 },
  { bg: 1, tilemapLeft: 18, tilemapTop: 11, width: 10, height: 2, paletteNum: 15, baseBlock: 581 },
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 2, paletteNum: 15, baseBlock: 561 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates_ItemMenu = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRegisteredSelect_Gfx': { path: 'graphics/bag/select_button.png', ext: '.4bpp', type: 'u8' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct BagPosition", name: 'gBagPosition', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_ItemId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_Bag', ret: "void", arity: 0, params: "void" },
  { name: 'SetupBagMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'BagMenu_InitBGs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBagMenu_Graphics', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadBagMenuTextWindows', ret: "void", arity: 0, params: "void" },
  { name: 'AllocateBagItemListBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBagItemListBuffers', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintPocketNames', ret: "void", arity: 2, params: "const u8 *, const u8 *" },
  { name: 'CopyPocketNameToWindow', ret: "void", arity: 1, params: "u32" },
  { name: 'DrawPocketIndicatorSquare', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'CreatePocketScrollArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePocketSwitchArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyPocketSwitchArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'PrepareTMHMMoveWindow', ret: "void", arity: 0, params: "void" },
  { name: 'IsWallysBag', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_WallyTutorialBagMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BagMenu_HandleInput', ret: "void", arity: 1, params: "u8" },
  { name: 'GetItemNameFromPocket', ret: "void", arity: 2, params: "u8 *, u16" },
  { name: 'PrintItemDescription', ret: "void", arity: 1, params: "int" },
  { name: 'BagMenu_PrintCursorAtPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'BagMenu_Print', ret: "void", arity: 9, params: "u8, u8, const u8 *, u8, u8, u8, u8, u8, u8" },
  { name: 'Task_CloseBagMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'AddItemMessageWindow', ret: "u8", arity: 1, params: "u8" },
  { name: 'RemoveItemMessageWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ReturnToItemList', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintItemQuantity', ret: "void", arity: 3, params: "u8 windowId, s16 quantity, u32 speed" },
  { name: 'BagMenu_AddWindow', ret: "u8", arity: 1, params: "u8" },
  { name: 'GetSwitchBagPocketDirection', ret: "u8", arity: 0, params: "void" },
  { name: 'SwitchBagPocket', ret: "void", arity: 3, params: "u8, s16, bool16" },
  { name: 'CanSwapItems', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartItemSwap', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SwitchBagPocket', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSwappingItemsInput', ret: "void", arity: 1, params: "u8" },
  { name: 'DoItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'CancelItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintTMHMMoveData', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintContextMenuItems', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintContextMenuItemGrid', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'Task_ItemContext_SingleRow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_MultipleRows', ret: "void", arity: 1, params: "u8" },
  { name: 'IsValidContextMenuPos', ret: "bool8", arity: 1, params: "s8" },
  { name: 'BagMenu_RemoveWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintThereIsNoPokemon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChooseHowManyToToss', ret: "void", arity: 1, params: "u8" },
  { name: 'AskTossItems', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RemoveItemFromBag', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_Cancel', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleErrorMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintItemCantBeHeld', ret: "void", arity: 1, params: "u8" },
  { name: 'DisplayCurrentMoneyWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DisplaySellItemPriceAndConfirm', ret: "void", arity: 1, params: "u8" },
  { name: 'InitSellHowManyInput', ret: "void", arity: 1, params: "u8" },
  { name: 'AskSellItems', ret: "void", arity: 1, params: "u8" },
  { name: 'RemoveMoneyWindow', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ChooseHowManyToSell', ret: "void", arity: 1, params: "u8" },
  { name: 'SellItem', ret: "void", arity: 1, params: "u8" },
  { name: 'WaitAfterItemSell', ret: "void", arity: 1, params: "u8" },
  { name: 'TryDepositItem', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChooseHowManyToDeposit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'WaitDepositErrorMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_ApprenticeExitBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_FavorLadyExitBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_QuizLadyExitBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePocketItemLists', ret: "void", arity: 0, params: "void" },
  { name: 'InitPocketListPositions', ret: "void", arity: 0, params: "void" },
  { name: 'InitPocketScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'CreateBagInputHandlerTask', ret: "u8", arity: 1, params: "u8" },
  { name: 'DrawItemListBgRow', ret: "void", arity: 1, params: "u8" },
  { name: 'BagMenu_MoveCursorCallback', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'BagMenu_ItemPrintCallback', ret: "void", arity: 3, params: "u8, u32, u8" },
  { name: 'ItemMenu_UseOutOfBattle', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_Toss', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_Register', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_Give', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_UseInBattle', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_CheckTag', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_Show', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_GiveFavorLady', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemMenu_ConfirmQuizLady', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_Normal', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_GiveToParty', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_Sell', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_Deposit', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemContext_GiveToPC', ret: "void", arity: 1, params: "u8" },
  { name: 'ConfirmToss', ret: "void", arity: 1, params: "u8" },
  { name: 'CancelToss', ret: "void", arity: 1, params: "u8" },
  { name: 'ConfirmSell', ret: "void", arity: 1, params: "u8" },
  { name: 'CancelSell', ret: "void", arity: 1, params: "u8" },
  { name: 'ResetBagScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BagMenuFromStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BagMenuFromBattle', ret: "void", arity: 0, params: "void" },
  { name: 'GoToBattlePyramidBagMenu', ret: "else", arity: 2, params: "PYRAMIDBAG_LOC_BATTLE, CB2_SetUpReshowBattleScreenAfterMenu2" },
  { name: 'CB2_ChooseBerry', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseBerryForMachine', ret: "void", arity: 1, params: "MainCallback exitCallback" },
  { name: 'CB2_GoToSellMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GoToItemDepositMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ApprenticeOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'FavorLadyOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'QuizLadyOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GoToBagMenu', ret: "void", arity: 3, params: "u8 location, u8 pocket, MainCallback exitCallback" },
  { name: 'CB2_BagMenuRun', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_BagMenuRun', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCompressedSpriteSheet', ret: "else", arity: 1, params: "&gBagFemaleSpriteSheet" },
  { name: 'AddBagItemIconSprite', ret: "else", arity: 2, params: "ITEM_LIST_END, gBagMenu->itemIconSlot" },
  { name: 'BagMenu_PrintCursor', ret: "void", arity: 2, params: "u8 listTaskId, u8 colorIndex" },
  { name: 'BagDestroyPocketScrollArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'FreeBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Task_FadeAndCloseBagMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "gBagPosition.exitCallback" },
  { name: 'UpdatePocketItemList', ret: "void", arity: 1, params: "u8 pocketId" },
  { name: 'UpdatePocketListPosition', ret: "void", arity: 1, params: "u8 pocketId" },
  { name: 'GetItemListPosition', ret: "u8", arity: 1, params: "u8 pocketId" },
  { name: 'DisplayItemMessage', ret: "void", arity: 4, params: "u8 taskId, u8 fontId, const u8 *str, TaskFunc callback" },
  { name: 'CloseItemMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AddItemQuantityWindow', ret: "void", arity: 1, params: "u8 windowType" },
  { name: 'PrintItemSoldAmount', ret: "void", arity: 3, params: "int windowId, int numSold, int moneyEarned" },
  { name: 'ChangeBagPocketId', ret: "void", arity: 2, params: "u8 *bagPocketId, s8 deltaBagPocketId" },
  { name: 'FillBgTilemapBufferRect_Palette0', ret: "else", arity: 6, params: "2, 0x102B, x + 5, 3, 1, 1" },
  { name: 'OpenContextMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RemoveContextWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ItemUseOutOfBattle_Berry', ret: "else", arity: 1, params: "taskId" },
  { name: 'CB2_ReturnToBagMenuPocket', ret: "void", arity: 0, params: "void" },
  { name: 'UseRegisteredKeyItemOnField', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrepareBagForWallyTutorial', ret: "void", arity: 0, params: "void" },
  { name: 'RestoreBagAfterWallyTutorial', ret: "void", arity: 0, params: "void" },
  { name: 'DoWallyTutorialBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BagMenu_GetWindowId', ret: "UNUSED", arity: 1, params: "u8 windowType" },
  { name: 'BagMenu_YesNo', ret: "void", arity: 3, params: "u8 taskId, u8 windowType, const struct YesNoFuncTable *funcTable" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BagMenu_HandleInput',
  'Task_ChooseHowManyToDeposit',
  'Task_ChooseHowManyToSell',
  'Task_ChooseHowManyToToss',
  'Task_CloseBagMenu',
  'Task_FadeAndCloseBagMenu',
  'Task_HandleSwappingItemsInput',
  'Task_ItemContext_Deposit',
  'Task_ItemContext_GiveToPC',
  'Task_ItemContext_GiveToParty',
  'Task_ItemContext_MultipleRows',
  'Task_ItemContext_Normal',
  'Task_ItemContext_Sell',
  'Task_ItemContext_SingleRow',
  'Task_RemoveItemFromBag',
  'Task_SwitchBagPocket',
  'Task_WallyTutorialBagMenu',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ApprenticeExitBagMenu',
  'CB2_Bag',
  'CB2_BagMenuFromBattle',
  'CB2_BagMenuFromStartMenu',
  'CB2_BagMenuRun',
  'CB2_ChooseBerry',
  'CB2_FavorLadyExitBagMenu',
  'CB2_GoToItemDepositMenu',
  'CB2_GoToSellMenu',
  'CB2_QuizLadyExitBagMenu',
  'CB2_ReturnToBagMenuPocket',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'item_menu.h',
  'battle.h',
  'battle_controllers.h',
  'battle_pyramid.h',
  'frontier_util.h',
  'battle_pyramid_bag.h',
  'berry_tag_screen.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'field_player_avatar.h',
  'field_specials.h',
  'graphics.h',
  'gpu_regs.h',
  'international_string_util.h',
  'item.h',
  'item_menu_icons.h',
  'item_use.h',
  'lilycove_lady.h',
  'list_menu.h',
  'link.h',
  'mail.h',
  'malloc.h',
  'map_name_popup.h',
  'menu.h',
  'money.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'player_pc.h',
  'pokemon.h',
  'pokemon_summary_screen.h',
  'scanline_effect.h',
  'script.h',
  'shop.h',
  'sound.h',
  'sprite.h',
  'strings.h',
  'string_util.h',
  'task.h',
  'text_window.h',
  'menu_helpers.h',
  'window.h',
  'apprentice.h',
  'battle_pike.h',
  'constants/items.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;

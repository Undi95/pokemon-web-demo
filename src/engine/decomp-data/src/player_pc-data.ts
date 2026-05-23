// AUTO-GENERATED from src/player_pc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/player_pc.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `ITEMPC_WIN_TITLE` */
export const ITEMPC_WIN_LIST_END_EXPR = "ITEMPC_WIN_TITLE";
export const TAG_ITEM_ICON = 5110;
export const TAG_SCROLL_ARROW = 5112;
export const NOT_SWAPPING = 255;
export const SWAP_LINE_LENGTH = 7;
/** Raw expr: `ARRAY_COUNT(sBedroomPC_OptionOrder)` */
export const NUM_BEDROOM_PC_OPTIONS_EXPR = "ARRAY_COUNT(sBedroomPC_OptionOrder)";
/** Raw expr: `ARRAY_COUNT(sPlayerPC_OptionOrder)` */
export const NUM_PLAYER_PC_OPTIONS_EXPR = "ARRAY_COUNT(sPlayerPC_OptionOrder)";
/** Raw expr: `data[1]` */
export const tUsedSlots_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tQuantity_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tInTossMenu_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWindowId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tListTaskId_EXPR = "data[5]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MENU_0 = {
  MENU_ITEMSTORAGE: 0,
  MENU_MAILBOX: 1,
  MENU_DECORATION: 2,
  MENU_TURNOFF: 3,
} as const;
export const ENUM_MENU_1 = {
  MENU_WITHDRAW: 0,
  MENU_DEPOSIT: 1,
  MENU_TOSS: 2,
  MENU_EXIT: 3,
} as const;
export const ENUM_WIN_2 = {
  WIN_MAIN_MENU: 0,
  WIN_MAIN_MENU_BEDROOM: 1,
  WIN_ITEM_STORAGE_MENU: 2,
} as const;
export const ENUM_ITEMPC_3 = {
  ITEMPC_WIN_LIST: 0,
  ITEMPC_WIN_MESSAGE: 1,
  ITEMPC_WIN_ICON: 2,
  ITEMPC_WIN_TITLE: 3,
  ITEMPC_WIN_QUANTITY: 4,
  ITEMPC_WIN_YESNO: 5,
  ITEMPC_WIN_COUNT: 6,
} as const;
export const ENUM_MSG_4 = {
  MSG_SWITCH_WHICH_ITEM: 65527,
  MSG_OKAY_TO_THROW_AWAY: 65528,
  MSG_TOO_IMPORTANT: 65529,
  MSG_NO_MORE_ROOM: 65530,
  MSG_THREW_AWAY_ITEM: 65531,
  MSG_HOW_MANY_TO_TOSS: 65532,
  MSG_WITHDREW_ITEM: 65533,
  MSG_HOW_MANY_TO_WITHDRAW: 65534,
  MSG_GO_BACK_TO_PREV: 65535,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates_MainMenus = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 9, height: 6, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 9, height: 8, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 8, paletteNum: 15, baseBlock: 1 },
] as const;
export const sWindowTemplates_ItemStorage = [
  { bg: 0, tilemapLeft: 16, tilemapTop: 1, width: 13, height: 18, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 13, width: 13, height: 6, paletteNum: 15, baseBlock: 235 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 8, width: 3, height: 3, paletteNum: 15, baseBlock: 339 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 13, height: 2, paletteNum: 15, baseBlock: 313 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 9, width: 6, height: 2, paletteNum: 15, baseBlock: 348 },
  { bg: 0, tilemapLeft: 9, tilemapTop: 7, width: 5, height: 4, paletteNum: 15, baseBlock: 360 },
] as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sItemStorage_OptionDescriptions = ['gText_TakeOutItemsFromPC', 'gText_StoreItemsInPC', 'gText_ThrowAwayItemsInPC', 'gText_GoBackPrevMenu'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sTopMenuNumOptions', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct PlayerPCItemPageStruct", name: 'gPlayerPCItemPageInfo', isArray: false, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPlayerPCMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerPCProcessMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'InitItemStorageMenu', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'GetMailboxMailCount', ret: "u8", arity: 0, params: "void" },
  { name: 'Mailbox_CompactMailList', ret: "void", arity: 0, params: "void" },
  { name: 'Mailbox_DrawMailboxMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_ProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_PrintWhatToDoWithPlayerMailText', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_ReturnToPlayerPC', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_PrintMailOptions', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_MailOptionsProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerPC_ItemStorage', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerPC_Mailbox', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerPC_Decoration', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerPC_TurnOff', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_DoMailMoveToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_DoMailRead', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_MoveToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_Give', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_Cancel', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_CancelMoveToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_HandleConfirmMoveToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_AskConfirmMoveToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_DoGiveMailPokeMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_NoPokemonForMail', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_FadeAndReadMail', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_ReturnToFieldFromReadMail', ret: "void", arity: 0, params: "void" },
  { name: 'Mailbox_ReshowAfterMail', ret: "void", arity: 0, params: "void" },
  { name: 'Mailbox_HandleReturnToProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Mailbox_UpdateMailListAfterDeposit', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_Withdraw', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_Deposit', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_Toss', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_Exit', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_TossItemYes', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_TossItemNo', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorageMenuPrint', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'ItemStorageMenuProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'SetPlayerPCListCount', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_HandleReturnToProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_Enter', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'ItemStorage_CreateListMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_ProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemStorage_Deposit', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_ReshowAfterBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_DoItemWithdraw', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_DoItemToss', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_HandleQuantityRolling', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_ExitItemList', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_StartItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_DoItemAction', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_FinishItemSwap', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'ItemStorage_HandleRemoveItem', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_HandleErrorMessageInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_ReturnToListInput', ret: "void", arity: 1, params: "u8" },
  { name: 'CopyItemName_PlayerPC', ret: "void", arity: 2, params: "u8 *, u16" },
  { name: 'ItemStorage_Init', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_DrawSwapArrow', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'ItemStorage_RemoveWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_UpdateSwapLinePos', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_ProcessItemSwapInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_EraseItemIcon', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_DrawItemIcon', ret: "void", arity: 1, params: "u16" },
  { name: 'ItemStorage_PrintDescription', ret: "void", arity: 1, params: "s32" },
  { name: 'ItemStorage_EraseMainMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemStorage_MoveCursor', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'ItemStorage_PrintMenuItem', ret: "void", arity: 3, params: "u8, u32, u8" },
  { name: 'NewGameInitPCItems', ret: "void", arity: 0, params: "void" },
  { name: 'BedroomPC', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPC', ret: "void", arity: 0, params: "void" },
  { name: 'ReshowPlayerPC', ret: "void", arity: 1, params: "u8 var" },
  { name: 'ScriptContext_SetupScript', ret: "else", arity: 1, params: "LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC" },
  { name: 'CB2_PlayerPCExitBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyTask', ret: "else", arity: 1, params: "taskId" },
  { name: 'Mailbox_ReturnToMailListAfterDeposit', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_Free', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_AddWindow', ret: "u8", arity: 1, params: "u8 i" },
  { name: 'ItemStorage_RefreshListMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_AddScrollIndicator', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_RemoveScrollIndicator', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_SetSwapArrow', ret: "void", arity: 3, params: "u8 listTaskId, u8 b, u8 speed" },
  { name: 'AddTextPrinterParameterized4', ret: "else", arity: 9, params: "windowId, FONT_NORMAL, 0, y, 0, 0, sSwapArrowTextColors, speed, gText_SelectorArrow2" },
  { name: 'ItemStorage_CompactList', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_CompactCursor', ret: "void", arity: 0, params: "void" },
  { name: 'ItemStorage_PrintMessage', ret: "void", arity: 1, params: "const u8 *string" },
  { name: 'ItemStorage_ReturnToMenuSelect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemStorage_PrintItemQuantity', ret: "void", arity: 6, params: "u8 windowId, u16 value, u32 mode, u8 x, u8 y, u8 n" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ItemStorage_Deposit',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_PlayerPCExitBagMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'constants/songs.h',
  'bg.h',
  'decoration.h',
  'event_scripts.h',
  'event_object_movement.h',
  'field_screen_effect.h',
  'field_weather.h',
  'international_string_util.h',
  'item.h',
  'item_icon.h',
  'item_menu.h',
  'constants/items.h',
  'list_menu.h',
  'mail.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'menu_helpers.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'player_pc.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'window.h',
  'menu_specialized.h',
] as const;

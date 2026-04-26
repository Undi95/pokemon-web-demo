// AUTO-GENERATED from src/mystery_gift_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const LIST_MENU_TILE_NUM = 10;
/** Raw expr: `BG_PLTT_ID(14)` */
export const LIST_MENU_PAL_NUM_EXPR = "BG_PLTT_ID(14)";
export const DOWN_ARROW_X = 208;
export const DOWN_ARROW_Y = 20;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_HEADER: 0,
  WIN_MSG: 1,
  WIN_UNK: 2,
} as const;
export const ENUM_MG_1 = {
  MG_STATE_TO_MAIN_MENU: 0,
  MG_STATE_MAIN_MENU: 1,
  MG_STATE_DONT_HAVE_ANY: 2,
  MG_STATE_SOURCE_PROMPT: 3,
  MG_STATE_SOURCE_PROMPT_INPUT: 4,
  MG_STATE_CLIENT_LINK_START: 5,
  MG_STATE_CLIENT_LINK_WAIT: 6,
  MG_STATE_CLIENT_COMMUNICATING: 7,
  MG_STATE_CLIENT_LINK: 8,
  MG_STATE_CLIENT_YES_NO: 9,
  MG_STATE_CLIENT_MESSAGE: 10,
  MG_STATE_CLIENT_ASK_TOSS: 11,
  MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED: 12,
  MG_STATE_CLIENT_LINK_END: 13,
  MG_STATE_CLIENT_COMM_COMPLETED: 14,
  MG_STATE_CLIENT_RESULT_MSG: 15,
  MG_STATE_CLIENT_ERROR: 16,
  MG_STATE_SAVE_LOAD_GIFT: 17,
  MG_STATE_LOAD_GIFT: 18,
  MG_STATE_UNUSED: 19,
  MG_STATE_HANDLE_GIFT_INPUT: 20,
  MG_STATE_HANDLE_GIFT_SELECT: 21,
  MG_STATE_ASK_TOSS: 22,
  MG_STATE_ASK_TOSS_UNRECEIVED: 23,
  MG_STATE_TOSS: 24,
  MG_STATE_TOSS_SAVE: 25,
  MG_STATE_TOSSED: 26,
  MG_STATE_GIFT_INPUT_EXIT: 27,
  MG_STATE_RECEIVE: 28,
  MG_STATE_SEND: 29,
  MG_STATE_SERVER_LINK_WAIT: 30,
  MG_STATE_SERVER_LINK_START: 31,
  MG_STATE_SERVER_LINK: 32,
  MG_STATE_SERVER_LINK_END: 33,
  MG_STATE_SERVER_LINK_END_WAIT: 34,
  MG_STATE_SERVER_RESULT_MSG: 35,
  MG_STATE_SERVER_ERROR: 36,
  MG_STATE_EXIT: 37,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sMainWindows = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: "DISPLAY_TILE_WIDTH", height: 2, paletteNum: 12, baseBlock: 19 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 12, baseBlock: 79 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 15, width: "DISPLAY_TILE_WIDTH", height: 5, paletteNum: 13, baseBlock: 79 },
] as const;
export const sWindowTemplate_YesNoMsg_Wide = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 12, baseBlock: 229 } as const;
export const sWindowTemplate_YesNoMsg = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 20, height: 4, paletteNum: 12, baseBlock: 229 } as const;
export const sWindowTemplate_GiftSelect = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 19, height: 4, paletteNum: 12, baseBlock: 229 } as const;
export const sWindowTemplate_ThreeOptions = { bg: 0, tilemapLeft: 8, tilemapTop: 6, width: 14, height: 6, paletteNum: 12, baseBlock: 341 } as const;
export const sWindowTemplate_YesNoBox = { bg: 0, tilemapLeft: 23, tilemapTop: 15, width: 6, height: 4, paletteNum: 12, baseBlock: 341 } as const;
export const sWindowTemplate_GiftSelect_3Options = { bg: 0, tilemapLeft: 22, tilemapTop: 11, width: 7, height: 8, paletteNum: 12, baseBlock: 341 } as const;
export const sWindowTemplate_GiftSelect_2Options = { bg: 0, tilemapLeft: 22, tilemapTop: 13, width: 7, height: 6, paletteNum: 12, baseBlock: 341 } as const;
export const sWindowTemplate_GiftSelect_1Option = { bg: 0, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 12, baseBlock: 341 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBGTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sTextboxBorder_Pal': { path: 'graphics/interface/mystery_gift_textbox_border.png', ext: '.gbapal', type: 'u16' },
  'sTextboxBorder_Gfx': { path: 'graphics/interface/mystery_gift_textbox_border.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sUnusedMenuTexts = ['gText_VarietyOfEventsImportedWireless', 'gText_WonderCardsInPossession', 'gText_ReadNewsThatArrived', 'gText_ReturnToTitle'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDownArrowCounterAndYCoordIdx', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gGiftIsFromEReader', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadMysteryGiftTextboxBorder', ret: "void", arity: 1, params: "u8 bgId" },
  { name: 'CreateMysteryGiftTask', ret: "void", arity: 0, params: "void" },
  { name: 'Task_MysteryGift', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'VBlankCB_MysteryGiftEReader', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_MysteryGiftEReader', ret: "void", arity: 0, params: "void" },
  { name: 'HandleMysteryGiftOrEReaderSetup', ret: "bool32", arity: 1, params: "s32 isEReader" },
  { name: 'CB2_InitMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitEReader', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB_FreeAllBuffersAndReturnToInitTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMysteryGiftOrEReaderHeader', ret: "void", arity: 2, params: "bool8 isEReader, bool32 useCancel" },
  { name: 'MG_DrawTextBorder', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'MG_DrawCheckerboardPattern', ret: "void", arity: 1, params: "u32 bg" },
  { name: 'FillBgTilemapBufferRect', ret: "else", arity: 7, params: "bg, 2, j, i + 2, 1, 1, 17" },
  { name: 'ClearScreenInBg0', ret: "void", arity: 1, params: "bool32 ignoreTopTwoRows" },
  { name: 'MG_AddMessageTextPrinter', ret: "void", arity: 1, params: "const u8 *str" },
  { name: 'ClearMessage', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMysteryGiftMenuMessage', ret: "bool32", arity: 2, params: "u8 *textState, const u8 *str" },
  { name: 'HideDownArrow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowDownArrow', ret: "void", arity: 0, params: "void" },
  { name: 'HideDownArrowAndWaitButton', ret: "UNUSED", arity: 1, params: "u8 *textState" },
  { name: 'PrintStringAndWait2Seconds', ret: "bool32", arity: 2, params: "u8 *counter, const u8 *str" },
  { name: 'MysteryGift_HandleThreeOptionMenu', ret: "u32", arity: 3, params: "u8 *unused0, u16 *unused1, u8 whichMenu" },
  { name: 'DoMysteryGiftYesNo', ret: "s8", arity: 4, params: "u8 *textState, u16 *windowId, bool8 yesNoBoxPlacement, const u8 *str" },
  { name: 'HandleGiftSelectMenu', ret: "s32", arity: 4, params: "u8 *textState, u16 *windowId, bool32 cannotToss, bool32 cannotSend" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_WhatToDoWithNews" },
  { name: 'ValidateCardOrNews', ret: "bool32", arity: 1, params: "bool32 isWonderNews" },
  { name: 'HandleLoadWonderCardOrNews', ret: "bool32", arity: 2, params: "u8 *state, bool32 isWonderNews" },
  { name: 'ClearSavedNewsOrCard', ret: "bool32", arity: 1, params: "bool32 isWonderNews" },
  { name: 'ClearSavedWonderNewsAndRelated', ret: "else", arity: 0, params: "" },
  { name: 'ExitWonderCardOrNews', ret: "bool32", arity: 2, params: "bool32 isWonderNews, bool32 useCancel" },
  { name: 'AskDiscardGift', ret: "s32", arity: 3, params: "u8 *textState, u16 *windowId, bool32 isWonderNews" },
  { name: 'PrintThrownAway', ret: "bool32", arity: 2, params: "u8 *textState, bool32 isWonderNews" },
  { name: 'SaveOnMysteryGiftMenu', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'GetClientResultMessage', ret: "u8 *", arity: 4, params: "bool32 *successMsg, bool8 isWonderNews, bool8 sourceIsFriend, u32 msgId" },
  { name: 'PrintSuccessMessage', ret: "bool32", arity: 3, params: "u8 *state, const u8 *msg, u16 *timer" },
  { name: 'GetServerResultMessage', ret: "u8 *", arity: 3, params: "bool32 *wonderSuccess, bool8 sourceIsFriend, u32 msgId" },
  { name: 'PrintServerResultMessage', ret: "bool32", arity: 4, params: "u8 *state, u16 *timer, bool8 sourceIsFriend, u32 msgId" },
  { name: 'WonderNews_SetReward', ret: "else", arity: 1, params: "WONDER_NEWS_RECV_WIRELESS" },
  { name: 'GetMysteryGiftBaseBlock', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_MysteryGift',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitEReader',
  'CB2_InitMysteryGift',
  'CB2_MysteryGiftEReader',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'text.h',
  'task.h',
  'malloc.h',
  'gpu_regs.h',
  'scanline_effect.h',
  'text_window.h',
  'bg.h',
  'window.h',
  'strings.h',
  'text_window.h',
  'menu.h',
  'palette.h',
  'constants/songs.h',
  'sound.h',
  'mystery_gift_menu.h',
  'union_room.h',
  'title_screen.h',
  'ereader_screen.h',
  'international_string_util.h',
  'list_menu.h',
  'string_util.h',
  'mystery_gift.h',
  'mystery_gift_view.h',
  'save.h',
  'link.h',
  'mystery_gift_client.h',
  'mystery_gift_server.h',
  'event_data.h',
  'link_rfu.h',
  'wonder_news.h',
  'constants/cable_club.h',
] as const;

// AUTO-GENERATED from src/union_room_chat.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/union_room_chat.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_MESSAGE_LENGTH = 15;
export const PALTAG_INTERFACE = 0;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tI_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCurrLinkPlayer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBlockReceivedStatus_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tLinkPlayerCount_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tNextState_EXPR = "data[5]";
export const KEYBOARD_HOFS_END = 56;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_UNION_0 = {
  UNION_ROOM_KB_PAGE_UPPER: 0,
  UNION_ROOM_KB_PAGE_LOWER: 1,
  UNION_ROOM_KB_PAGE_EMOJI: 2,
  UNION_ROOM_KB_PAGE_REGISTER: 3,
  UNION_ROOM_KB_PAGE_COUNT: 4,
} as const;
export const ENUM_CHAT_1 = {
  CHAT_MESSAGE_NONE: 0,
  CHAT_MESSAGE_CHAT: 1,
  CHAT_MESSAGE_JOIN: 2,
  CHAT_MESSAGE_LEAVE: 3,
  CHAT_MESSAGE_DROP: 4,
  CHAT_MESSAGE_DISBAND: 5,
} as const;
export const ENUM_STDMESSAGE_2 = {
  STDMESSAGE_QUIT_CHATTING: 0,
  STDMESSAGE_REGISTER_WHERE: 1,
  STDMESSAGE_REGISTER_HERE: 2,
  STDMESSAGE_INPUT_TEXT: 3,
  STDMESSAGE_EXITING_CHAT: 4,
  STDMESSAGE_LEADER_LEFT: 5,
  STDMESSAGE_ASK_SAVE: 6,
  STDMESSAGE_ASK_OVERWRITE: 7,
  STDMESSAGE_SAVING_NO_OFF: 8,
  STDMESSAGE_SAVED_THE_GAME: 9,
  STDMESSAGE_WARN_LEADER_LEAVE: 10,
} as const;
export const ENUM_CHAT_3 = {
  CHAT_FUNC_JOIN: 0,
  CHAT_FUNC_HANDLE_INPUT: 1,
  CHAT_FUNC_SWITCH: 2,
  CHAT_FUNC_ASK_QUIT: 3,
  CHAT_FUNC_SEND: 4,
  CHAT_FUNC_REGISTER: 5,
  CHAT_FUNC_EXIT: 6,
  CHAT_FUNC_DROP: 7,
  CHAT_FUNC_DISBANDED: 8,
  CHAT_FUNC_SAVE_AND_EXIT: 9,
} as const;
export const ENUM_CHATDISPLAY_4 = {
  CHATDISPLAY_FUNC_LOAD_GFX: 0,
  CHATDISPLAY_FUNC_MOVE_KB_CURSOR: 1,
  CHATDISPLAY_FUNC_CURSOR_BLINK: 2,
  CHATDISPLAY_FUNC_SHOW_KB_SWAP_MENU: 3,
  CHATDISPLAY_FUNC_HIDE_KB_SWAP_MENU: 4,
  CHATDISPLAY_FUNC_SWITCH_PAGES: 5,
  CHATDISPLAY_FUNC_ASK_QUIT_CHATTING: 6,
  CHATDISPLAY_FUNC_DESTROY_YESNO: 7,
  CHATDISPLAY_FUNC_UPDATE_MSG: 8,
  CHATDISPLAY_FUNC_ASK_REGISTER_TEXT: 9,
  CHATDISPLAY_FUNC_CANCEL_REGISTER: 10,
  CHATDISPLAY_FUNC_RETURN_TO_KB: 11,
  CHATDISPLAY_FUNC_SCROLL_CHAT: 12,
  CHATDISPLAY_FUNC_PRINT_INPUT_TEXT: 13,
  CHATDISPLAY_FUNC_ASK_SAVE: 14,
  CHATDISPLAY_FUNC_ASK_OVERWRITE_SAVE: 15,
  CHATDISPLAY_FUNC_PRINT_SAVING: 16,
  CHATDISPLAY_FUNC_PRINT_SAVED_GAME: 17,
  CHATDISPLAY_FUNC_PRINT_EXITING_CHAT: 18,
  CHATDISPLAY_FUNC_PRINT_LEADER_LEFT: 19,
  CHATDISPLAY_FUNC_ASK_CONFIRM_LEADER_LEAVE: 20,
} as const;
export const ENUM_CHAT_5 = {
  CHAT_EXIT_NONE: 0,
  CHAT_EXIT_ONLY_LEADER: 1,
  CHAT_EXIT_DROPPED: 2,
  CHAT_EXIT_DISBANDED: 3,
} as const;
export const ENUM_GFXTAG_6 = {
  GFXTAG_KEYBOARD_CURSOR: 0,
  GFXTAG_TEXT_ENTRY_ARROW: 1,
  GFXTAG_TEXT_ENTRY_CURSOR: 2,
  GFXTAG_RBUTTON_ICON: 3,
  GFXTAG_RBUTTON_LABELS: 4,
} as const;
export const ENUM_WIN_7 = {
  WIN_CHAT_HISTORY: 0,
  WIN_TEXT_ENTRY: 1,
  WIN_KEYBOARD: 2,
  WIN_SWAP_MENU: 3,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWinTemplates = [
  { bg: 3, tilemapLeft: 8, tilemapTop: 1, width: 21, height: 19, paletteNum: 15, baseBlock: 1 },
  { bg: 1, tilemapLeft: 9, tilemapTop: 18, width: 15, height: 2, paletteNum: 12, baseBlock: 122 },
  { bg: 1, tilemapLeft: 0, tilemapTop: 2, width: 6, height: 15, paletteNum: 7, baseBlock: 32 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 2, width: 7, height: 9, paletteNum: 14, baseBlock: 19 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 23, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 1 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_KeyboardCursor = { shape: "SPRITE_SHAPE(64x32)", size: "SPRITE_SIZE(64x32)", priority: 1 } as const;
export const sOam_TextEntrySprite = { shape: "SPRITE_SHAPE(8x16)", size: "SPRITE_SIZE(8x16)", priority: 2 } as const;
export const sOam_RButtonIcon = { shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 2 } as const;
export const sOam_RButtonLabel = { shape: "SPRITE_SHAPE(32x16)", size: "SPRITE_SIZE(32x16)", priority: 2 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_KeyboardCursor = { tileTag: "GFXTAG_KEYBOARD_CURSOR", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_KeyboardCursor", anims: "sAnims_KeyboardCursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_TextEntryCursor = { tileTag: "GFXTAG_TEXT_ENTRY_CURSOR", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_TextEntrySprite", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_TextEntryCursor" } as const;
export const sSpriteTemplate_TextEntryArrow = { tileTag: "GFXTAG_TEXT_ENTRY_ARROW", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_TextEntrySprite", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_TextEntryArrow" } as const;
export const sSpriteTemplate_RButtonIcon = { tileTag: "GFXTAG_RBUTTON_ICON", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_RButtonIcon", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_RButtonLabels = { tileTag: "GFXTAG_RBUTTON_LABELS", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_RButtonLabel", anims: "sAnims_RButtonLabels", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheets = [
  { data: "sKeyboardCursorTiles", size: 4096, tag: "GFXTAG_KEYBOARD_CURSOR" },
  { data: "sTextEntryArrowTiles", size: 64, tag: "GFXTAG_TEXT_ENTRY_ARROW" },
  { data: "sTextEntryCursorTiles", size: 64, tag: "GFXTAG_TEXT_ENTRY_CURSOR" },
  { data: "sRButtonGfxTiles", size: 128, tag: "GFXTAG_RBUTTON_ICON" },
  { data: "gUnionRoomChat_RButtonLabels", size: 1024, tag: "GFXTAG_RBUTTON_LABELS" },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette = { data: "sUnionRoomChatInterfacePal", tag: "PALTAG_INTERFACE" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedPalette': { path: 'graphics/union_room_chat/unused.pal', ext: '.gbapal', type: 'u16' },
  'sChatMessagesWindow_Pal': { path: 'graphics/union_room_chat/chat_messages_window.pal', ext: '.gbapal', type: 'u16' },
  'sUnionRoomChatInterfacePal': { path: 'graphics/union_room_chat/interface.pal', ext: '.gbapal', type: 'u16' },
  'sKeyboardCursorTiles': { path: 'graphics/union_room_chat/keyboard_cursor.png', ext: '.4bpp.lz', type: 'u32' },
  'sTextEntryCursorTiles': { path: 'graphics/union_room_chat/text_entry_cursor.png', ext: '.4bpp.lz', type: 'u32' },
  'sTextEntryArrowTiles': { path: 'graphics/union_room_chat/text_entry_arrow.png', ext: '.4bpp.lz', type: 'u32' },
  'sRButtonGfxTiles': { path: 'graphics/union_room_chat/r_button.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sChatMainFunctions = ['Chat_Join', 'Chat_HandleInput', 'Chat_Switch', 'Chat_AskQuitChatting', 'Chat_SendMessage', 'Chat_Register', 'Chat_Exit', 'Chat_Drop', 'Chat_Disbanded', 'Chat_SaveAndExit'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitUnionRoomChat', ret: "void", arity: 1, params: "struct UnionRoomChat *" },
  { name: 'CB2_LoadInterface', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_UnionRoomChatMain', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_UnionRoomChatMain', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandlePlayerInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Chat_Join', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_HandleInput', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_Switch', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_AskQuitChatting', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_Exit', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_Drop', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_Disbanded', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_SendMessage', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_Register', ret: "void", arity: 0, params: "void" },
  { name: 'Chat_SaveAndExit', ret: "void", arity: 0, params: "void" },
  { name: 'SetChatFunction', ret: "void", arity: 1, params: "u16" },
  { name: 'HandleDPadInput', ret: "bool32", arity: 0, params: "void" },
  { name: 'AppendTextToMessage', ret: "void", arity: 0, params: "void" },
  { name: 'DeleteLastMessageCharacter', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchCaseOfLastMessageCharacter', ret: "void", arity: 0, params: "void" },
  { name: 'ChatMessageIsNotEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'RegisterTextAtRow', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMessageEntryBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'SaveRegisteredTexts', ret: "void", arity: 0, params: "void" },
  { name: 'PrepareSendBuffer_Null', ret: "void", arity: 1, params: "u8 *" },
  { name: 'PrepareSendBuffer_Join', ret: "void", arity: 1, params: "u8 *" },
  { name: 'PrepareSendBuffer_Chat', ret: "void", arity: 1, params: "u8 *" },
  { name: 'PrepareSendBuffer_Leave', ret: "void", arity: 1, params: "u8 *" },
  { name: 'PrepareSendBuffer_Drop', ret: "void", arity: 1, params: "u8 *" },
  { name: 'PrepareSendBuffer_Disband', ret: "void", arity: 1, params: "u8 *" },
  { name: 'Task_ReceiveChatMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryAllocDisplay', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsDisplaySubtask0Active', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeDisplay', ret: "void", arity: 0, params: "void" },
  { name: 'RunDisplaySubtasks', ret: "void", arity: 0, params: "void" },
  { name: 'StartDisplaySubtask', ret: "void", arity: 2, params: "u16, u8" },
  { name: 'IsDisplaySubtaskActive', ret: "bool8", arity: 1, params: "u8" },
  { name: 'ProcessMenuInput', ret: "s8", arity: 0, params: "void" },
  { name: 'TryAllocSprites', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitScanlineEffect', ret: "void", arity: 0, params: "void" },
  { name: 'InitDisplay', ret: "void", arity: 1, params: "struct UnionRoomChatDisplay *" },
  { name: 'ResetDisplaySubtasks', ret: "void", arity: 0, params: "void" },
  { name: 'FreeSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ResetGpuBgState', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgTilemapBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'ClearBg0', ret: "void", arity: 0, params: "void" },
  { name: 'LoadKeyboardWindowGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChatWindowGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChatUnkPalette', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChatMessagesWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DrawKeyboardWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadKeyboardSwapWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTextEntryWindow', ret: "void", arity: 0, params: "void" },
  { name: 'CreateKeyboardCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTextEntrySprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateRButtonSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ShowKeyboardSwapMenu', ret: "void", arity: 0, params: "void" },
  { name: 'HideKeyboardSwapMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SetKeyboardCursorInvisibility', ret: "void", arity: 1, params: "bool32" },
  { name: 'SlideKeyboardPageOut', ret: "bool32", arity: 0, params: "void" },
  { name: 'PrintCurrentKeyboardPage', ret: "void", arity: 0, params: "void" },
  { name: 'SlideKeyboardPageIn', ret: "bool32", arity: 0, params: "void" },
  { name: 'MoveKeyboardCursor', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateRButtonLabel', ret: "void", arity: 0, params: "void" },
  { name: 'AddStdMessageWindow', ret: "void", arity: 2, params: "int, u16" },
  { name: 'AddYesNoMenuAt', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'HideStdMessageWindow', ret: "void", arity: 0, params: "void" },
  { name: 'HideYesNoMenuWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyStdMessageWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyYesNoMenuWindow', ret: "void", arity: 0, params: "void" },
  { name: 'FillTextEntryWindow', ret: "void", arity: 3, params: "u16, u16, u8" },
  { name: 'DrawTextEntryMessage', ret: "void", arity: 5, params: "u16, u8 *, u8, u8, u8" },
  { name: 'SetRegisteredTextPalette', ret: "void", arity: 1, params: "bool32" },
  { name: 'PrintChatMessage', ret: "void", arity: 3, params: "u16, u8 *, u8" },
  { name: 'StartKeyboardCursorAnim', ret: "void", arity: 0, params: "void" },
  { name: 'TryKeyboardCursorReopen', ret: "bool32", arity: 0, params: "void" },
  { name: 'UpdateSlidingKeyboard', ret: "void", arity: 1, params: "s16" },
  { name: 'FinishSlidingKeyboard', ret: "void", arity: 1, params: "s16" },
  { name: 'Display_Dummy', ret: "bool32", arity: 1, params: "u8 *" },
  { name: 'Display_LoadGfx', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_ShowKeyboardSwapMenu', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_HideKeyboardSwapMenu', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_SwitchPages', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_MoveKeyboardCursor', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AskQuitChatting', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_DestroyYesNoDialog', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_UpdateMessageBuffer', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AskRegisterText', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_CancelRegister', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_ReturnToKeyboard', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_ScrollChat', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AnimateKeyboardCursor', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_PrintInputText', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_PrintExitingChat', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_PrintLeaderLeft', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AskSave', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AskOverwriteSave', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_PrintSavingDontTurnOff', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_PrintSavedTheGame', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'Display_AskConfirmLeaderLeave', ret: "bool32", arity: 1, params: "u8 *state" },
  { name: 'SpriteCB_TextEntryCursor', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TextEntryArrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'EnterUnionRoomChat', ret: "void", arity: 0, params: "void" },
  { name: 'FreeUnionRoomChat', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumOverflowCharsInMessage', ret: "u16", arity: 0, params: "void" },
  { name: 'ProcessReceivedChatMessage', ret: "bool32", arity: 2, params: "u8 *dest, u8 *recvMessage" },
  { name: 'GetCurrentKeyboardPage', ret: "u8", arity: 0, params: "void" },
  { name: 'GetCurrentKeyboardColAndRow', ret: "void", arity: 2, params: "u8 *col, u8 *row" },
  { name: 'GetLengthOfMessageEntry', ret: "int", arity: 0, params: "void" },
  { name: 'GetBufferSelectionRegion', ret: "void", arity: 2, params: "u32 *x, u32 *width" },
  { name: 'GetLimitedMessageStartPos', ret: "u16", arity: 0, params: "void" },
  { name: 'GetReceivedPlayerIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'GetTextEntryCursorPosition', ret: "int", arity: 0, params: "void" },
  { name: 'GetShouldShowCaseToggleIcon', ret: "int", arity: 0, params: "void" },
  { name: 'InitUnionRoomChatRegisteredTexts', ret: "void", arity: 0, params: "void" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "sSprites->keyboardCursor, 3" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandlePlayerInput',
  'Task_ReceiveChatMessage',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LoadInterface',
  'CB2_UnionRoomChatMain',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bg.h',
  'decompress.h',
  'dma3.h',
  'dynamic_placeholder_text_util.h',
  'gpu_regs.h',
  'graphics.h',
  'link.h',
  'link_rfu.h',
  'load_save.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'save.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'union_room_chat.h',
  'window.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;

// AUTO-GENERATED from src/easy_chat.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/easy_chat.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_ALPHABET_ROWS = 4;
export const NUM_GROUP_NAME_ROWS = 4;
export const NUM_WORD_SELECT_ROWS = 4;
export const NUM_BUTTON_ROWS = 3;
export const NUM_ALPHABET_COLUMNS = 7;
export const NUM_GROUP_NAME_COLUMNS = 2;
export const NUM_WORD_SELECT_COLUMNS = 2;
export const FRAME_OFFSET_ORANGE = 4096;
export const FRAME_OFFSET_GREEN = 16384;
export const FRAME_TILE_TRANSPARENT = 0;
export const FRAME_TILE_TOP_L_CORNER = 1;
export const FRAME_TILE_TOP_EDGE = 2;
export const FRAME_TILE_TOP_R_CORNER = 3;
export const FRAME_TILE_L_EDGE = 5;
export const FRAME_TILE_R_EDGE = 7;
export const FRAME_TILE_BOTTOM_L_CORNER = 9;
export const FRAME_TILE_BOTTOM_EDGE = 10;
export const FRAME_TILE_BOTTOM_R_CORNER = 11;
export const TASKIDX_WORDS = 2;
export const TASKIDX_EXIT_CALLBACK = 4;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tType_EXPR = "data[1]";
/** Raw expr: `data[TASKIDX_WORDS]` */
export const tWords_EXPR = "data[TASKIDX_WORDS]";
/** Raw expr: `data[TASKIDX_EXIT_CALLBACK]` */
export const tExitCallback_EXPR = "data[TASKIDX_EXIT_CALLBACK]";
/** Raw expr: `data[6]` */
export const tFuncId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tPersonType_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sDelayTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sAnimateCursor_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PALTAG_0 = {
  PALTAG_TRIANGLE_CURSOR: 0,
  PALTAG_RECTANGLE_CURSOR: 1,
  PALTAG_MISC_UI: 2,
  PALTAG_RS_INTERVIEW_FRAME: 3,
} as const;
export const ENUM_GFXTAG_1 = {
  GFXTAG_TRIANGLE_CURSOR: 0,
  GFXTAG_RECTANGLE_CURSOR: 1,
  GFXTAG_SCROLL_INDICATOR: 2,
  GFXTAG_START_SELECT_BUTTONS: 3,
  GFXTAG_MODE_WINDOW: 4,
  GFXTAG_RS_INTERVIEW_FRAME: 5,
  GFXTAG_BUTTON_WINDOW: 6,
} as const;
export const ENUM_INPUTSTATE_2 = {
  INPUTSTATE_PHRASE: 0,
  INPUTSTATE_MAIN_SCREEN_BUTTONS: 1,
  INPUTSTATE_KEYBOARD: 2,
  INPUTSTATE_WORD_SELECT: 3,
  INPUTSTATE_EXIT_PROMPT: 4,
  INPUTSTATE_DELETE_ALL_YES_NO: 5,
  INPUTSTATE_CONFIRM_WORDS_YES_NO: 6,
  INPUTSTATE_QUIZ_QUESTION: 7,
  INPUTSTATE_WAIT_FOR_MSG: 8,
  INPUTSTATE_START_CONFIRM_LYRICS: 9,
  INPUTSTATE_CONFIRM_LYRICS_YES_NO: 10,
} as const;
export const ENUM_MAINSTATE_3 = {
  MAINSTATE_FADE_IN: 0,
  MAINSTATE_HANDLE_INPUT: 1,
  MAINSTATE_RUN_FUNC: 2,
  MAINSTATE_TO_QUIZ_LADY: 3,
  MAINSTATE_EXIT: 4,
  MAINSTATE_WAIT_FADE_IN: 5,
} as const;
export const ENUM_MSG_4 = {
  MSG_INSTRUCTIONS: 0,
  MSG_CONFIRM_DELETE: 1,
  MSG_CONFIRM_EXIT: 2,
  MSG_CONFIRM: 3,
  MSG_CREATE_QUIZ: 4,
  MSG_SELECT_ANSWER: 5,
  MSG_SONG_TOO_SHORT: 6,
  MSG_CANT_DELETE_LYRICS: 7,
  MSG_COMBINE_TWO_WORDS: 8,
  MSG_CANT_QUIT: 9,
} as const;
export const ENUM_ECFUNC_5 = {
  ECFUNC_NONE: 0,
  ECFUNC_REPRINT_PHRASE: 1,
  ECFUNC_UPDATE_MAIN_CURSOR: 2,
  ECFUNC_UPDATE_MAIN_CURSOR_ON_BUTTONS: 3,
  ECFUNC_PROMPT_DELETE_ALL: 4,
  ECFUNC_PROMPT_EXIT: 5,
  ECFUNC_PROMPT_CONFIRM: 6,
  ECFUNC_CLOSE_PROMPT: 7,
  ECFUNC_CLOSE_PROMPT_AFTER_DELETE: 8,
  ECFUNC_OPEN_KEYBOARD: 9,
  ECFUNC_CLOSE_KEYBOARD: 10,
  ECFUNC_OPEN_WORD_SELECT: 11,
  ECFUNC_CLOSE_WORD_SELECT: 12,
  ECFUNC_PROMPT_CONFIRM_LYRICS: 13,
  ECFUNC_RETURN_TO_KEYBOARD: 14,
  ECFUNC_UPDATE_KEYBOARD_CURSOR: 15,
  ECFUNC_GROUP_NAMES_SCROLL_DOWN: 16,
  ECFUNC_GROUP_NAMES_SCROLL_UP: 17,
  ECFUNC_UPDATE_WORD_SELECT_CURSOR: 18,
  ECFUNC_WORD_SELECT_SCROLL_UP: 19,
  ECFUNC_WORD_SELECT_SCROLL_DOWN: 20,
  ECFUNC_WORD_SELECT_PAGE_UP: 21,
  ECFUNC_WORD_SELECT_PAGE_DOWN: 22,
  ECFUNC_SWITCH_KEYBOARD_MODE: 23,
  ECFUNC_EXIT: 24,
  ECFUNC_QUIZ_QUESTION: 25,
  ECFUNC_QUIZ_ANSWER: 26,
  ECFUNC_SET_QUIZ_QUESTION: 27,
  ECFUNC_SET_QUIZ_ANSWER: 28,
  ECFUNC_MSG_CREATE_QUIZ: 29,
  ECFUNC_MSG_SELECT_ANSWER: 30,
  ECFUNC_MSG_SONG_TOO_SHORT: 31,
  ECFUNC_MSG_CANT_DELETE_LYRICS: 32,
  ECFUNC_MSG_COMBINE_TWO_WORDS: 33,
  ECFUNC_MSG_CANT_EXIT: 34,
} as const;
export const ENUM_TEXT_6 = {
  TEXT_GROUPS: 0,
  TEXT_ALPHABET: 1,
  TEXT_WORD_SELECT: 2,
} as const;
export const ENUM_FRAMEID_7 = {
  FRAMEID_GENERAL_2x2: 0,
  FRAMEID_GENERAL_2x3: 1,
  FRAMEID_MAIL: 2,
  FRAMEID_COMBINE_TWO_WORDS: 3,
  FRAMEID_INTERVIEW_SHOW_PERSON: 4,
  FRAMEID_INTERVIEW: 5,
  FRAMEID_QUIZ_ANSWER: 6,
  FRAMEID_QUIZ_QUESTION: 7,
  FRAMEID_QUIZ_SET_QUESTION: 8,
} as const;
export const ENUM_FOOTER_8 = {
  FOOTER_NORMAL: 0,
  FOOTER_QUIZ: 1,
  FOOTER_ANSWER: 2,
  NUM_FOOTER_TYPES: 3,
} as const;
export const ENUM_INPUT_9 = {
  INPUT_RIGHT: 0,
  INPUT_LEFT: 1,
  INPUT_UP: 2,
  INPUT_DOWN: 3,
  INPUT_START: 4,
  INPUT_SELECT: 5,
} as const;
export const ENUM_WINANIM_10 = {
  WINANIM_OPEN_KEYBOARD: 0,
  WINANIM_CLOSE_KEYBOARD: 1,
  WINANIM_OPEN_WORD_SELECT: 2,
  WINANIM_CLOSE_WORD_SELECT: 3,
  WINANIM_RETURN_TO_KEYBOARD: 4,
  WINANIM_KEYBOARD_SWITCH_OUT: 5,
  WINANIM_KEYBOARD_SWITCH_IN: 6,
} as const;
export const ENUM_WIN_11 = {
  WIN_TITLE: 0,
  WIN_MSG: 1,
  WIN_INPUT_SELECT: 2,
} as const;
export const ENUM_RECTCURSOR_12 = {
  RECTCURSOR_ANIM_ON_GROUP: 0,
  RECTCURSOR_ANIM_ON_BUTTON: 1,
  RECTCURSOR_ANIM_ON_OTHERS: 2,
  RECTCURSOR_ANIM_ON_LETTER: 3,
} as const;
export const ENUM_MODEWINDOW_13 = {
  MODEWINDOW_ANIM_HIDDEN: 0,
  MODEWINDOW_ANIM_TO_GROUP: 1,
  MODEWINDOW_ANIM_TO_ALPHABET: 2,
  MODEWINDOW_ANIM_TO_HIDDEN: 3,
  MODEWINDOW_ANIM_TRANSITION: 4,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sEasyChatWindowTemplates = [
  { bg: 1, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 10, baseBlock: 16 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4, paletteNum: 15, baseBlock: 10 },
  { bg: 2, tilemapLeft: 1, tilemapTop: 0, width: 28, height: 32, paletteNum: 3, baseBlock: 0 },
] as const;
export const sEasyChatYesNoWindowTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 106 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sEasyChatBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 128 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_TriangleCursor = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_RectangleCursor = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_ModeWindow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_ButtonWindow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_StartSelectButton = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_ScrollIndicator = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_TriangleCursor = { tileTag: "PALTAG_TRIANGLE_CURSOR", paletteTag: "GFXTAG_TRIANGLE_CURSOR", oam: "&sOamData_TriangleCursor", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Cursor" } as const;
export const sSpriteTemplate_RectangleCursor = { tileTag: "GFXTAG_RECTANGLE_CURSOR", paletteTag: "PALTAG_RECTANGLE_CURSOR", oam: "&sOamData_RectangleCursor", anims: "sAnims_RectangleCursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Cursor" } as const;
export const sSpriteTemplate_ModeWindow = { tileTag: "GFXTAG_MODE_WINDOW", paletteTag: "PALTAG_MISC_UI", oam: "&sOamData_ModeWindow", anims: "sAnims_ModeWindow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ButtonWindow = { tileTag: "GFXTAG_BUTTON_WINDOW", paletteTag: "PALTAG_MISC_UI", oam: "&sOamData_ButtonWindow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_StartSelectButton = { tileTag: "GFXTAG_START_SELECT_BUTTONS", paletteTag: "PALTAG_MISC_UI", oam: "&sOamData_StartSelectButton", anims: "sAnims_TwoFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ScrollIndicator = { tileTag: "GFXTAG_SCROLL_INDICATOR", paletteTag: "PALTAG_MISC_UI", oam: "&sOamData_ScrollIndicator", anims: "sAnims_TwoFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheets = [
  { data: "sTriangleCursor_Gfx", size: "sizeof(sTriangleCursor_Gfx)", tag: "GFXTAG_TRIANGLE_CURSOR" },
  { data: "sScrollIndicator_Gfx", size: "sizeof(sScrollIndicator_Gfx)", tag: "GFXTAG_SCROLL_INDICATOR" },
  { data: "sStartSelectButtons_Gfx", size: "sizeof(sStartSelectButtons_Gfx)", tag: "GFXTAG_START_SELECT_BUTTONS" },
] as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sCompressedSpriteSheets = [
  { data: "sRSInterviewFrame_Gfx", size: 2048, tag: "GFXTAG_RS_INTERVIEW_FRAME" },
  { data: "gEasyChatRectangleCursor_Gfx", size: 4096, tag: "GFXTAG_RECTANGLE_CURSOR" },
  { data: "gEasyChatButtonWindow_Gfx", size: 2048, tag: "GFXTAG_BUTTON_WINDOW" },
  { data: "gEasyChatMode_Gfx", size: 4096, tag: "GFXTAG_MODE_WINDOW" },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalettes = [
  { data: "sTriangleCursor_Pal", tag: "PALTAG_TRIANGLE_CURSOR" },
  { data: "gEasyChatRectangleCursor_Pal", tag: "PALTAG_RECTANGLE_CURSOR" },
  { data: "gEasyChatButtonWindow_Pal", tag: "PALTAG_MISC_UI" },
  { data: "sRSInterviewFrame_Pal", tag: "PALTAG_RS_INTERVIEW_FRAME" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sTriangleCursor_Pal': { path: 'graphics/easy_chat/triangle_cursor.png', ext: '.gbapal', type: 'u16' },
  'sTriangleCursor_Gfx': { path: 'graphics/easy_chat/triangle_cursor.png', ext: '.4bpp', type: 'u32' },
  'sScrollIndicator_Gfx': { path: 'graphics/easy_chat/scroll_indicator.png', ext: '.4bpp', type: 'u32' },
  'sStartSelectButtons_Gfx': { path: 'graphics/easy_chat/start_select_buttons.png', ext: '.4bpp', type: 'u32' },
  'sRSInterviewFrame_Pal': { path: 'graphics/easy_chat/interview_frame.png', ext: '.gbapal', type: 'u16' },
  'sRSInterviewFrame_Gfx': { path: 'graphics/easy_chat/interview_frame.png', ext: '.4bpp.lz', type: 'u32' },
  'sTextInputFrameOrange_Pal': { path: 'graphics/easy_chat/text_input_frame_orange.pal', ext: '.gbapal', type: 'u16' },
  'sTextInputFrameGreen_Pal': { path: 'graphics/easy_chat/text_input_frame_green.pal', ext: '.gbapal', type: 'u16' },
  'sTextInputFrame_Gfx': { path: 'graphics/easy_chat/text_input_frame.png', ext: '.4bpp.lz', type: 'u32' },
  'sTitleText_Pal': { path: 'graphics/easy_chat/title_text.pal', ext: '.gbapal', type: 'u16' },
  'sText_Pal': { path: 'graphics/easy_chat/text.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sEasyChatKeyboardAlphabet = ['gText_EasyChatKeyboard_ABCDEFothers', 'gText_EasyChatKeyboard_GHIJKL', 'gText_EasyChatKeyboard_MNOPQRS', 'gText_EasyChatKeyboard_TUVWXYZ'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_InitEasyChatScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_EasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'InitEasyChatScreen', ret: "bool8", arity: 1, params: "u8" },
  { name: 'Task_EasyChatScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'ExitEasyChatScreen', ret: "void", arity: 1, params: "MainCallback" },
  { name: 'IsFuncIdForQuizLadyScreen', ret: "bool32", arity: 1, params: "u16" },
  { name: 'EnterQuizLadyScreen', ret: "void", arity: 1, params: "u16" },
  { name: 'InitEasyChatScreenStruct', ret: "bool8", arity: 3, params: "u8, u16 *, u8" },
  { name: 'FreeEasyChatScreenStruct', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_Phrase', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_MainScreenButtons', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_Keyboard', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_WordSelect', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_ExitPrompt', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_ConfirmWordsYesNo', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_DeleteAllYesNo', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_QuizQuestion', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_WaitForMsg', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_StartConfirmLyrics', ret: "u16", arity: 0, params: "void" },
  { name: 'HandleEasyChatInput_ConfirmLyricsYesNo', ret: "u16", arity: 0, params: "void" },
  { name: 'StartConfirmExitPrompt', ret: "u16", arity: 0, params: "void" },
  { name: 'TryConfirmWords', ret: "u16", arity: 0, params: "void" },
  { name: 'GetEasyChatScreenFrameId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetEachChatScreenTemplateId', ret: "u8", arity: 1, params: "u8" },
  { name: 'GetQuizTitle', ret: "void", arity: 1, params: "u8 *" },
  { name: 'ClearUnusedField', ret: "void", arity: 0, params: "void" },
  { name: 'InitEasyChatScreenControl', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadEasyChatScreen', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeEasyChatScreenControl', ret: "void", arity: 0, params: "void" },
  { name: 'StartEasyChatFunction', ret: "void", arity: 1, params: "u16" },
  { name: 'RunEasyChatFunction', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitEasyChatScreenWordData', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeEasyChatScreenWordData', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumUnlockedEasyChatGroups', ret: "u8", arity: 0, params: "void" },
  { name: 'FooterHasFourOptions', ret: "int", arity: 0, params: "void" },
  { name: 'DoDeleteAllButton', ret: "int", arity: 0, params: "void" },
  { name: 'DoQuizButton', ret: "int", arity: 0, params: "void" },
  { name: 'ExitKeyboardToMainScreen', ret: "int", arity: 0, params: "void" },
  { name: 'SelectKeyboardGroup', ret: "int", arity: 0, params: "void" },
  { name: 'StartSwitchKeyboardMode', ret: "int", arity: 0, params: "void" },
  { name: 'DeleteSelectedWord', ret: "int", arity: 0, params: "void" },
  { name: 'MoveKeyboardCursor', ret: "u16", arity: 1, params: "int" },
  { name: 'MoveWordSelectCursor', ret: "u16", arity: 1, params: "u32" },
  { name: 'SelectNewWord', ret: "int", arity: 0, params: "void" },
  { name: 'GetEasyChatBackupState', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveCurrentPhrase', ret: "void", arity: 0, params: "void" },
  { name: 'SetSpecialEasyChatResult', ret: "void", arity: 0, params: "void" },
  { name: 'GetEasyChatCompleted', ret: "bool32", arity: 0, params: "void" },
  { name: 'ResetCurrentPhrase', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCurrentPhraseToSaved', ret: "void", arity: 0, params: "void" },
  { name: 'IsQuizQuestionEmpty', ret: "int", arity: 0, params: "void" },
  { name: 'IsQuizAnswerEmpty', ret: "int", arity: 0, params: "void" },
  { name: 'IsCurrentPhraseFull', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsCurrentPhraseEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetSelectedGroupIndex', ret: "u16", arity: 0, params: "void" },
  { name: 'GetUnlockedEasyChatGroupId', ret: "u8", arity: 1, params: "u8" },
  { name: 'SetSelectedWordGroup', ret: "void", arity: 2, params: "bool32, u16" },
  { name: 'GetSelectedAlphabetGroupId', ret: "int", arity: 0, params: "void" },
  { name: 'GetNumWordsInSelectedGroup', ret: "u16", arity: 0, params: "void" },
  { name: 'SetSelectedWord', ret: "void", arity: 1, params: "u16" },
  { name: 'GetSelectedWordIndex', ret: "u16", arity: 0, params: "void" },
  { name: 'GetWordFromSelectedGroup', ret: "u16", arity: 1, params: "u16" },
  { name: 'DummyWordCheck', ret: "bool32", arity: 1, params: "int" },
  { name: 'GetWordIndexToReplace', ret: "u16", arity: 0, params: "void" },
  { name: 'MoveKeyboardCursor_GroupNames', ret: "int", arity: 1, params: "u32" },
  { name: 'MoveKeyboardCursor_Alphabet', ret: "int", arity: 1, params: "u32" },
  { name: 'MoveKeyboardCursor_ButtonWindow', ret: "int", arity: 1, params: "u32" },
  { name: 'ReduceToValidKeyboardColumn', ret: "void", arity: 0, params: "void" },
  { name: 'SetKeyboardCursorInButtonWindow', ret: "void", arity: 0, params: "void" },
  { name: 'IsSelectedKeyboardIndexInvalid', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetKeyboardCursorToLastColumn', ret: "void", arity: 0, params: "void" },
  { name: 'GetLastAlphabetColumn', ret: "u8", arity: 1, params: "u8" },
  { name: 'ReduceToValidWordSelectColumn', ret: "void", arity: 0, params: "void" },
  { name: 'IsSelectedWordIndexInvalid', ret: "bool8", arity: 0, params: "void" },
  { name: 'DidPlayerInputMysteryGiftPhrase', ret: "int", arity: 0, params: "void" },
  { name: 'DidPlayerInputABerryMasterWifePhrase', ret: "u16", arity: 0, params: "void" },
  { name: 'InitEasyChatScreenControl_', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadEasyChatPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'InitEasyChatBgs', ret: "void", arity: 0, params: "void" },
  { name: 'AdjustBgTilemapForFooter', ret: "void", arity: 0, params: "void" },
  { name: 'BufferFrameTilemap', ret: "void", arity: 1, params: "u16 *" },
  { name: 'AddPhraseWindow', ret: "void", arity: 0, params: "void" },
  { name: 'AddMainScreenButtonWindow', ret: "void", arity: 0, params: "void" },
  { name: 'PrintTitle', ret: "void", arity: 0, params: "void" },
  { name: 'PrintInitialInstructions', ret: "void", arity: 0, params: "void" },
  { name: 'PrintCurrentPhrase', ret: "void", arity: 0, params: "void" },
  { name: 'DrawLowerWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadEasyChatGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMainCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Cursor', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetWindowDimensions', ret: "void", arity: 4, params: "u8, u8, u8, u8" },
  { name: 'CreateScrollIndicatorSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateStartSelectButtonSprites', ret: "void", arity: 0, params: "void" },
  { name: 'TryAddInterviewObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'ReprintPhrase', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateMainCursor', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateMainCursorOnButtons', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowConfirmDeleteAllPrompt', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowConfirmExitPrompt', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowConfirmPrompt', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClosePrompt', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClosePromptAfterDeleteAll', ret: "bool8", arity: 0, params: "void" },
  { name: 'OpenKeyboard', ret: "bool8", arity: 0, params: "void" },
  { name: 'CloseKeyboard', ret: "bool8", arity: 0, params: "void" },
  { name: 'OpenWordSelect', ret: "bool8", arity: 0, params: "void" },
  { name: 'CloseWordSelect', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowConfirmLyricsPrompt', ret: "bool8", arity: 0, params: "void" },
  { name: 'ReturnToKeyboard', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateKeyboardCursor', ret: "bool8", arity: 0, params: "void" },
  { name: 'GroupNamesScrollDown', ret: "bool8", arity: 0, params: "void" },
  { name: 'GroupNamesScrollUp', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateWordSelectCursor', ret: "bool8", arity: 0, params: "void" },
  { name: 'WordSelectScrollUp', ret: "bool8", arity: 0, params: "void" },
  { name: 'WordSelectScrollDown', ret: "bool8", arity: 0, params: "void" },
  { name: 'WordSelectPageScrollUp', ret: "bool8", arity: 0, params: "void" },
  { name: 'WordSelectPageScrollDown', ret: "bool8", arity: 0, params: "void" },
  { name: 'SwitchKeyboardMode', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowCreateQuizMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowSelectAnswerMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowSongTooShortMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowCantDeleteLyricsMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowCombineTwoWordsMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowCantExitMsg', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetMainCursorPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'GetFooterOptionXOffset', ret: "int", arity: 1, params: "int" },
  { name: 'StopMainCursorAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEasyChatStdMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateEasyChatYesNoMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'StartMainCursorAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PrintKeyboardText', ret: "void", arity: 0, params: "void" },
  { name: 'InitLowerWindowAnim', ret: "void", arity: 1, params: "int" },
  { name: 'CreateSideWindowSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSideWindow', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateRectangleCursorSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetScrollIndicatorXPos', ret: "void", arity: 1, params: "bool32" },
  { name: 'UpdateLowerWindowAnim', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateScrollIndicatorsVisibility', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyRectangleCursorSprites', ret: "void", arity: 0, params: "void" },
  { name: 'HideModeWindow', ret: "void", arity: 0, params: "void" },
  { name: 'HideScrollIndicators', ret: "void", arity: 0, params: "void" },
  { name: 'SetModeWindowToTransition', ret: "void", arity: 0, params: "void" },
  { name: 'DestroySideWindowSprites', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsModeWindowAnimActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateModeWindowAnim', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateRectangleCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'InitLowerWindowScroll', ret: "void", arity: 2, params: "s16, u8" },
  { name: 'UpdateLowerWindowScroll', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClearWordSelectWindow', ret: "void", arity: 0, params: "void" },
  { name: 'InitLowerWindowText', ret: "void", arity: 1, params: "u32" },
  { name: 'CreateWordSelectCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateStartSelectButtonsVisibility', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyWordSelectCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'HideStartSelectButtons', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWordSelectCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'PrintWordSelectNextRowDown', ret: "void", arity: 0, params: "void" },
  { name: 'PrintWordSelectNextRowUp', ret: "void", arity: 0, params: "void" },
  { name: 'GetLowerWindowScrollOffset', ret: "int", arity: 0, params: "void" },
  { name: 'PrintWordSelectRowsPageDown', ret: "void", arity: 0, params: "void" },
  { name: 'PrintWordSelectRowsPageUp', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEasyChatTextWithColors', ret: "void", arity: 9, params: "u8, u8, const u8 *, u8, u8, u8, u8, u8, u8" },
  { name: 'ResetLowerWindowScroll', ret: "void", arity: 0, params: "void" },
  { name: 'PrintKeyboardGroupNames', ret: "void", arity: 0, params: "void" },
  { name: 'PrintKeyboardAlphabet', ret: "void", arity: 0, params: "void" },
  { name: 'PrintInitialWordSelectText', ret: "void", arity: 0, params: "void" },
  { name: 'PrintWordSelectText', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'EraseWordSelectRows', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DrawLowerWindowFrame', ret: "void", arity: 1, params: "u8" },
  { name: 'BufferLowerWindowFrame', ret: "void", arity: 4, params: "int, int, int, int" },
  { name: 'SetRectangleCursorPos_GroupMode', ret: "void", arity: 2, params: "s8, s8" },
  { name: 'SetRectangleCursorPos_AlphabetMode', ret: "void", arity: 2, params: "s8, s8" },
  { name: 'SpriteCB_WordSelectCursor', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetWordSelectCursorPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'EasyChatIsNationalPokedexEnabled', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetRandomUnlockedEasyChatPokemon', ret: "u16", arity: 0, params: "void" },
  { name: 'SetUnlockedEasyChatGroups', ret: "void", arity: 0, params: "void" },
  { name: 'SetUnlockedWordsByAlphabet', ret: "void", arity: 0, params: "void" },
  { name: 'IsEasyChatWordUnlocked', ret: "u8", arity: 1, params: "u16" },
  { name: 'SetSelectedWordGroup_GroupMode', ret: "u16", arity: 1, params: "u16" },
  { name: 'SetSelectedWordGroup_AlphabetMode', ret: "u16", arity: 1, params: "u16" },
  { name: 'IsEasyChatIndexAndGroupUnlocked', ret: "bool8", arity: 2, params: "u16, u8" },
  { name: 'IsRestrictedWordSpecies', ret: "int", arity: 1, params: "u16" },
  { name: 'DoQuizAnswerEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'DoQuizQuestionEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'DoQuizSetAnswerEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'DoQuizSetQuestionEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'DoEasyChatScreen', ret: "void", arity: 4, params: "u8 type, u16 *words, MainCallback exitCallback, u8 displayedPersonType" },
  { name: 'VBlankCB_EasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'StartEasyChatScreen', ret: "void", arity: 2, params: "u8 taskId, TaskFunc taskFunc" },
  { name: 'ShowEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_QuizLadyQuestion', ret: "void", arity: 0, params: "void" },
  { name: 'QuizLadyShowQuizQuestion', ret: "void", arity: 0, params: "void" },
  { name: 'GetQuizLadyScreenByFuncId', ret: "int", arity: 1, params: "u16 funcId" },
  { name: 'IsCurrentFrame2x5', ret: "bool32", arity: 0, params: "void" },
  { name: 'DidPhraseChange', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetEasyChatScreenType', ret: "u8", arity: 0, params: "void" },
  { name: 'GetNumRows', ret: "u8", arity: 0, params: "void" },
  { name: 'GetNumColumns', ret: "u8", arity: 0, params: "void" },
  { name: 'GetMainCursorColumn', ret: "u8", arity: 0, params: "void" },
  { name: 'GetMainCursorRow', ret: "u8", arity: 0, params: "void" },
  { name: 'GetEasyChatInstructionsText', ret: "void", arity: 2, params: "const u8 **str1, const u8 **str2" },
  { name: 'GetEasyChatConfirmText', ret: "void", arity: 2, params: "const u8 **str1, const u8 **str2" },
  { name: 'GetEasyChatConfirmExitText', ret: "void", arity: 2, params: "const u8 **str1, const u8 **str2" },
  { name: 'GetEasyChatConfirmDeletionText', ret: "void", arity: 2, params: "const u8 **str1, const u8 **str2" },
  { name: 'GetKeyboardCursorColAndRow', ret: "void", arity: 2, params: "s8 *column, s8 *row" },
  { name: 'GetInAlphabetMode', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetKeyboardScrollOffset', ret: "u8", arity: 0, params: "void" },
  { name: 'GetWordSelectColAndRow', ret: "void", arity: 2, params: "s8 *column, s8 *row" },
  { name: 'GetWordSelectScrollOffset', ret: "u8", arity: 0, params: "void" },
  { name: 'GetWordSelectLastRow', ret: "u8", arity: 0, params: "void" },
  { name: 'UnusedDummy', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'CanScrollUp', ret: "bool32", arity: 0, params: "void" },
  { name: 'CanScrollDown', ret: "bool32", arity: 0, params: "void" },
  { name: 'FooterHasFourOptions_', ret: "int", arity: 0, params: "void" },
  { name: 'IsPhraseDifferentThanPlayerInput', ret: "bool8", arity: 2, params: "const u16 *phrase, u8 phraseLength" },
  { name: 'GetDisplayedPersonType', ret: "u8", arity: 0, params: "void" },
  { name: 'BufferCurrentPhraseToStringVar2', ret: "void", arity: 0, params: "void" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "sScreenControl->modeWindowSprite, MODEWINDOW_ANIM_TO_ALPHABET" },
  { name: 'GetFooterIndex', ret: "int", arity: 0, params: "void" },
  { name: 'IsEasyChatGroupUnlocked', ret: "bool8", arity: 1, params: "u8 groupId" },
  { name: 'EasyChat_GetNumWordsInGroup', ret: "u16", arity: 1, params: "u8 groupId" },
  { name: 'IsEasyChatWordInvalid', ret: "bool8", arity: 1, params: "u16 easyChatWord" },
  { name: 'IsBardWordInvalid', ret: "bool8", arity: 1, params: "u16 easyChatWord" },
  { name: 'GetEasyChatWordStringLength', ret: "u16", arity: 1, params: "u16 easyChatWord" },
  { name: 'CanPhraseFitInXRowsYCols', ret: "bool8", arity: 4, params: "const u16 *easyChatWords, u8 numRows, u8 numColumns, u16 maxLength" },
  { name: 'GetRandomEasyChatWordFromGroup', ret: "u16", arity: 1, params: "u16 groupId" },
  { name: 'GetRandomEasyChatWordFromUnlockedGroup', ret: "u16", arity: 1, params: "u16 groupId" },
  { name: 'ShowEasyChatProfile', ret: "void", arity: 0, params: "void" },
  { name: 'BufferDeepLinkPhrase', ret: "void", arity: 0, params: "void" },
  { name: 'IsTrendySayingUnlocked', ret: "bool8", arity: 1, params: "u8 wordIndex" },
  { name: 'UnlockTrendySaying', ret: "void", arity: 1, params: "u8 wordIndex" },
  { name: 'GetNumTrendySayingsUnlocked', ret: "u8", arity: 0, params: "void" },
  { name: 'UnlockRandomTrendySaying', ret: "u16", arity: 0, params: "void" },
  { name: 'GetRandomUnlockedTrendySaying', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'InitEasyChatPhrases', ret: "void", arity: 0, params: "void" },
  { name: 'IsEasyChatGroupUnlocked2', ret: "bool8", arity: 1, params: "u8 groupId" },
  { name: 'InitializeEasyChatWordArray', ret: "void", arity: 2, params: "u16 *words, u16 length" },
  { name: 'InitQuestionnaireWords', ret: "void", arity: 0, params: "void" },
  { name: 'IsEasyChatAnswerUnlocked', ret: "bool32", arity: 1, params: "int easyChatWord" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EasyChatScreen',
  'Task_InitEasyChatScreen',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_EasyChatScreen',
  'CB2_QuizLadyQuestion',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bard_music.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'dewford_trend.h',
  'dynamic_placeholder_text_util.h',
  'easy_chat.h',
  'event_data.h',
  'event_object_movement.h',
  'field_message_box.h',
  'field_weather.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'main.h',
  'mystery_gift.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'pokedex.h',
  'random.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text_window.h',
  'window.h',
  'constants/event_objects.h',
  'constants/lilycove_lady.h',
  'constants/mauville_old_man.h',
  'constants/songs.h',
  'constants/rgb.h',
  'data/easy_chat/easy_chat_groups.h',
  'data/easy_chat/easy_chat_words_by_letter.h',
] as const;

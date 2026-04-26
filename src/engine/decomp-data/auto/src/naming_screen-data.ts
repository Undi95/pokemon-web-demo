// AUTO-GENERATED from src/naming_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/naming_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const KBROW_COUNT = 4;
export const KBCOL_COUNT = 9;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tFrameCount_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tButtonId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tKeepFlashing_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tAllowFlash_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tColor_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tColorIncr_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tColorDelay_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tColorDelta_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const sX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sPrevX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sPrevY_EXPR = "data[3]";
/** Raw expr: `data[4] & 0x00FF` */
export const sInvisible_EXPR = "data[4] & 0x00FF";
/** Raw expr: `data[4] & 0xFF00` */
export const sFlashing_EXPR = "data[4] & 0xFF00";
/** Raw expr: `data[5]` */
export const sColor_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sColorIncr_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sColorDelay_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sDelay_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sXPosId_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sYPosId_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sPage_EXPR = "data[1]";
/** Raw expr: `data[6]` */
export const sTextSpriteId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sButtonSpriteId_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tKeyboardEvent_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_INPUT_0 = {
  INPUT_NONE: 0,
  INPUT_DPAD_UP: 1,
  INPUT_DPAD_DOWN: 2,
  INPUT_DPAD_LEFT: 3,
  INPUT_DPAD_RIGHT: 4,
  INPUT_A_BUTTON: 5,
  INPUT_B_BUTTON: 6,
  INPUT_LR_BUTTON: 7,
  INPUT_SELECT: 8,
  INPUT_START: 9,
} as const;
export const ENUM_GFXTAG_1 = {
  GFXTAG_BACK_BUTTON: 0,
  GFXTAG_OK_BUTTON: 1,
  GFXTAG_PAGE_SWAP_FRAME: 2,
  GFXTAG_PAGE_SWAP_BUTTON: 3,
  GFXTAG_PAGE_SWAP_UPPER: 4,
  GFXTAG_PAGE_SWAP_LOWER: 5,
  GFXTAG_PAGE_SWAP_OTHERS: 6,
  GFXTAG_CURSOR: 7,
  GFXTAG_CURSOR_SQUISHED: 8,
  GFXTAG_CURSOR_FILLED: 9,
  GFXTAG_INPUT_ARROW: 10,
  GFXTAG_UNDERSCORE: 11,
} as const;
export const ENUM_PALTAG_2 = {
  PALTAG_MENU: 0,
  PALTAG_PAGE_SWAP_UPPER: 1,
  PALTAG_PAGE_SWAP_LOWER: 2,
  PALTAG_PAGE_SWAP_OTHERS: 3,
  PALTAG_PAGE_SWAP: 4,
  PALTAG_CURSOR: 5,
  PALTAG_BACK_BUTTON: 6,
  PALTAG_OK_BUTTON: 7,
} as const;
export const ENUM_WIN_3 = {
  WIN_KB_PAGE_1: 0,
  WIN_KB_PAGE_2: 1,
  WIN_TEXT_ENTRY: 2,
  WIN_TEXT_ENTRY_BOX: 3,
  WIN_BANNER: 4,
  WIN_COUNT: 5,
} as const;
export const ENUM_KBPAGE_4 = {
  KBPAGE_SYMBOLS: 0,
  KBPAGE_LETTERS_UPPER: 1,
  KBPAGE_LETTERS_LOWER: 2,
  KBPAGE_COUNT: 3,
} as const;
export const ENUM_KEYBOARD_5 = {
  KEYBOARD_LETTERS_LOWER: 0,
  KEYBOARD_LETTERS_UPPER: 1,
  KEYBOARD_SYMBOLS: 2,
} as const;
export const ENUM_PAGE_6 = {
  PAGE_SWAP_UPPER: 0,
  PAGE_SWAP_OTHERS: 1,
  PAGE_SWAP_LOWER: 2,
} as const;
export const ENUM_KEY_7 = {
  KEY_ROLE_CHAR: 0,
  KEY_ROLE_PAGE: 1,
  KEY_ROLE_BACKSPACE: 2,
  KEY_ROLE_OK: 3,
} as const;
export const ENUM_BUTTON_8 = {
  BUTTON_PAGE: 0,
  BUTTON_BACK: 1,
  BUTTON_OK: 2,
  BUTTON_COUNT: 3,
} as const;
export const ENUM_STATE_9 = {
  STATE_FADE_IN: 0,
  STATE_WAIT_FADE_IN: 1,
  STATE_HANDLE_INPUT: 2,
  STATE_MOVE_TO_OK_BUTTON: 3,
  STATE_START_PAGE_SWAP: 4,
  STATE_WAIT_PAGE_SWAP: 5,
  STATE_PRESSED_OK: 6,
  STATE_WAIT_SENT_TO_PC_MESSAGE: 7,
  STATE_FADE_OUT: 8,
  STATE_EXIT: 9,
} as const;
export const ENUM_INPUT_10 = {
  INPUT_STATE_DISABLED: 0,
  INPUT_STATE_ENABLED: 1,
  INPUT_STATE_OVERRIDE: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 48 },
  { bg: 2, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 200 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 6, width: 17, height: 2, paletteNum: 10, baseBlock: 48 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 4, width: 17, height: 2, paletteNum: 10, baseBlock: 82 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: "DISPLAY_TILE_WIDTH", height: 2, paletteNum: 11, baseBlock: 116 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, priority: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, priority: 1 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, priority: 2 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, priority: 3 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_8x8 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0 } as const;
export const sOam_16x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0 } as const;
export const sOam_32x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 0, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_PageSwapFrame = { tileTag: "GFXTAG_PAGE_SWAP_FRAME", paletteTag: "PALTAG_PAGE_SWAP", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PageSwap" } as const;
export const sSpriteTemplate_PageSwapButton = { tileTag: "GFXTAG_PAGE_SWAP_BUTTON", paletteTag: "PALTAG_PAGE_SWAP_UPPER", oam: "&sOam_32x16", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_PageSwapText = { tileTag: "GFXTAG_PAGE_SWAP_UPPER", paletteTag: "PALTAG_PAGE_SWAP", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_BackButton = { tileTag: "GFXTAG_BACK_BUTTON", paletteTag: "PALTAG_BACK_BUTTON", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_OkButton = { tileTag: "GFXTAG_OK_BUTTON", paletteTag: "PALTAG_OK_BUTTON", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Cursor = { tileTag: "GFXTAG_CURSOR", paletteTag: "PALTAG_CURSOR", oam: "&sOam_16x16", anims: "sAnims_Cursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Cursor" } as const;
export const sSpriteTemplate_InputArrow = { tileTag: "GFXTAG_INPUT_ARROW", paletteTag: "PALTAG_PAGE_SWAP_OTHERS", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_InputArrow" } as const;
export const sSpriteTemplate_Underscore = { tileTag: "GFXTAG_UNDERSCORE", paletteTag: "PALTAG_PAGE_SWAP_OTHERS", oam: "&sOam_8x8", anims: "sAnims_Loop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Underscore" } as const;
export const sSpriteTemplate_PCIcon = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MENU", oam: "&sOam_8x8", anims: "sAnims_PCIcon", images: "sImageTable_PCIcon", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPCIconOff_Gfx': { path: 'graphics/naming_screen/pc_icon_off.png', ext: '.4bpp', type: 'u8' },
  'sPCIconOn_Gfx': { path: 'graphics/naming_screen/pc_icon_on.png', ext: '.4bpp', type: 'u8' },
  'sKeyboard_Pal': { path: 'graphics/naming_screen/keyboard.pal', ext: '.gbapal', type: 'u16' },
  'sRival_Pal': { path: 'graphics/naming_screen/rival.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sTransferredToPCMessages = ['gText_PkmnTransferredSomeonesPC', 'gText_PkmnTransferredLanettesPC', 'gText_PkmnTransferredSomeonesPCBoxFull', 'gText_PkmnTransferredLanettesPCBoxFull'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const x: readonly number[] = [0,-4,-2,-1] as const;
export const y: readonly number[] = [2,3,2,1] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sPageSwapAnimStateFuncs = ['PageSwapAnimState_Init', 'PageSwapAnimState_1', 'PageSwapAnimState_2', 'PageSwapAnimState_Done'] as const;
export const sPageSwapSpriteFuncs = ['PageSwapSprite_Init', 'PageSwapSprite_Idle', 'PageSwapSprite_SlideOff', 'PageSwapSprite_SlideOn'] as const;
export const sIconFunctions = ['NamingScreen_NoIcon', 'NamingScreen_CreatePlayerIcon', 'NamingScreen_CreatePCIcon', 'NamingScreen_CreateMonIcon', 'NamingScreen_CreateWaldaDadIcon'] as const;
export const sKeyboardKeyHandlers = ['KeyboardKeyHandler_Character', 'KeyboardKeyHandler_Page', 'KeyboardKeyHandler_Backspace', 'KeyboardKeyHandler_OK'] as const;
export const sInputFuncs = ['Input_Disabled', 'Input_Enabled', 'Input_Override'] as const;
export const sDrawTextEntryBoxFuncs = ['DrawNormalTextEntryBox', 'DrawNormalTextEntryBox', 'DrawMonTextEntryBox', 'DrawMonTextEntryBox', 'DrawNormalTextEntryBox'] as const;
export const sDrawGenderIconFuncs = ['DummyGenderIcon', 'DrawGenderIcon'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_LoadNamingScreen', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_Init', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_InitBGs', ret: "void", arity: 0, params: "void" },
  { name: 'CreateNamingScreenTask', ret: "void", arity: 0, params: "void" },
  { name: 'Task_NamingScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'MainState_FadeIn', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_WaitFadeIn', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_HandleInput', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_MoveToOKButton', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_PressedOKButton', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_FadeOut', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_Exit', ret: "bool8", arity: 0, params: "void" },
  { name: 'DisplaySentToPCMessage', ret: "void", arity: 0, params: "void" },
  { name: 'MainState_WaitSentToPCMessage', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_StartPageSwap', ret: "bool8", arity: 0, params: "void" },
  { name: 'MainState_WaitPageSwap', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartPageSwapAnim', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandlePageSwapAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'IsPageSwapAnimNotInProgress', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryStartButtonFlash', ret: "void", arity: 3, params: "u8, bool8, bool8" },
  { name: 'Task_UpdateButtonFlash', ret: "void", arity: 1, params: "u8" },
  { name: 'GetButtonPalOffset', ret: "u16", arity: 1, params: "u8" },
  { name: 'RestoreButtonColor', ret: "void", arity: 1, params: "u8" },
  { name: 'StartButtonFlash', ret: "void", arity: 3, params: "struct Task *, u8, bool8" },
  { name: 'CreateSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'SetCursorPos', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'GetCursorPos', ret: "void", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'MoveCursorToOKButton', ret: "void", arity: 0, params: "void" },
  { name: 'SetCursorInvisibility', ret: "void", arity: 1, params: "u8" },
  { name: 'SetCursorFlashing', ret: "void", arity: 1, params: "bool8" },
  { name: 'IsCursorAnimFinished', ret: "u8", arity: 0, params: "void" },
  { name: 'GetCurrentPageColumnCount', ret: "u8", arity: 0, params: "void" },
  { name: 'CreatePageSwapButtonSprites', ret: "void", arity: 0, params: "void" },
  { name: 'StartPageSwapButtonAnim', ret: "void", arity: 0, params: "void" },
  { name: 'SetPageSwapButtonGfx', ret: "void", arity: 3, params: "u8, struct Sprite *, struct Sprite *" },
  { name: 'CreateBackOkSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTextEntrySprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateInputTargetIcon', ret: "void", arity: 0, params: "void" },
  { name: 'HandleKeyboardEvent', ret: "u8", arity: 0, params: "void" },
  { name: 'SwapKeyboardPage', ret: "u8", arity: 0, params: "void" },
  { name: 'GetInputEvent', ret: "u8", arity: 0, params: "void" },
  { name: 'SetInputState', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawTextEntryBox', ret: "void", arity: 0, params: "void" },
  { name: 'GetTextEntryPosition', ret: "u8", arity: 0, params: "void" },
  { name: 'DeleteTextCharacter', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextCharacter', ret: "bool8", arity: 0, params: "void" },
  { name: 'BufferCharacter', ret: "void", arity: 1, params: "u8" },
  { name: 'SaveInputText', ret: "void", arity: 0, params: "void" },
  { name: 'LoadGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateHelperTasks', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'DrawBgTilemap', ret: "void", arity: 2, params: "u8, const void *" },
  { name: 'NamingScreen_Dummy', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DrawTextEntry', ret: "void", arity: 0, params: "void" },
  { name: 'PrintKeyboardKeys', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DrawKeyboardPageOnDeck', ret: "void", arity: 0, params: "void" },
  { name: 'PrintControls', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_NamingScreen', ret: "void", arity: 0, params: "void" },
  { name: 'ResetVHBlank', ret: "void", arity: 0, params: "void" },
  { name: 'SetVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_NamingScreen', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_ShowBgs', ret: "void", arity: 0, params: "void" },
  { name: 'IsWideLetter', ret: "bool8", arity: 1, params: "u8" },
  { name: 'DoNamingScreen', ret: "void", arity: 6, params: "u8 templateNum, u8 *destBuffer, u16 monSpecies, u16 monGender, u32 monPersonality, MainCallback returnCallback" },
  { name: 'SetSpritesVisible', ret: "void", arity: 0, params: "void" },
  { name: 'PageToNextGfxId', ret: "u8", arity: 1, params: "u8 page" },
  { name: 'CurrentPageToNextKeyboardId', ret: "u8", arity: 0, params: "void" },
  { name: 'CurrentPageToKeyboardId', ret: "u8", arity: 0, params: "void" },
  { name: 'PageSwapAnimState_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PageSwapAnimState_1', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PageSwapAnimState_2', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PageSwapAnimState_Done', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'CreateButtonFlashTask', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Cursor', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_InputArrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Underscore', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SquishCursor', ret: "void", arity: 0, params: "void" },
  { name: 'GetKeyRoleAtCursorPos', ret: "u8", arity: 0, params: "void" },
  { name: 'PageSwapSprite_Init', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'PageSwapSprite_Idle', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'PageSwapSprite_SlideOff', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'PageSwapSprite_SlideOn', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_PageSwap', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'NamingScreen_NoIcon', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_CreatePlayerIcon', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_CreatePCIcon', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_CreateMonIcon', ret: "void", arity: 0, params: "void" },
  { name: 'NamingScreen_CreateWaldaDadIcon', ret: "void", arity: 0, params: "void" },
  { name: 'KeyboardKeyHandler_Character', ret: "bool8", arity: 1, params: "u8" },
  { name: 'KeyboardKeyHandler_Page', ret: "bool8", arity: 1, params: "u8" },
  { name: 'KeyboardKeyHandler_Backspace', ret: "bool8", arity: 1, params: "u8" },
  { name: 'KeyboardKeyHandler_OK', ret: "bool8", arity: 1, params: "u8" },
  { name: 'Input_Disabled', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'Input_Enabled', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'Input_Override', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'Task_HandleInput', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleDpadMovement', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'CreateInputHandlerTask', ret: "void", arity: 0, params: "void" },
  { name: 'DrawNormalTextEntryBox', ret: "void", arity: 0, params: "void" },
  { name: 'DrawMonTextEntryBox', ret: "void", arity: 0, params: "void" },
  { name: 'DummyGenderIcon', ret: "void", arity: 0, params: "void" },
  { name: 'DrawGenderIcon', ret: "void", arity: 0, params: "void" },
  { name: 'TryDrawGenderIcon', ret: "void", arity: 0, params: "void" },
  { name: 'GetCharAtKeyboardPos', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'GetPreviousTextCaretPosition', ret: "u8", arity: 0, params: "void" },
  { name: 'Debug_NamingScreenPlayer', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Debug_NamingScreenBox', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Debug_NamingScreenCaughtMon', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Debug_NamingScreenNickname', ret: "UNUSED", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleInput',
  'Task_HandlePageSwapAnim',
  'Task_NamingScreen',
  'Task_UpdateButtonFlash',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LoadNamingScreen',
  'CB2_NamingScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'naming_screen.h',
  'malloc.h',
  'palette.h',
  'task.h',
  'sprite.h',
  'string_util.h',
  'window.h',
  'bg.h',
  'gpu_regs.h',
  'pokemon.h',
  'field_specials.h',
  'field_player_avatar.h',
  'event_object_movement.h',
  'event_data.h',
  'constants/songs.h',
  'pokemon_storage_system.h',
  'graphics.h',
  'sound.h',
  'trig.h',
  'field_effect.h',
  'pokemon_icon.h',
  'data.h',
  'strings.h',
  'menu.h',
  'text_window.h',
  'overworld.h',
  'walda_phrase.h',
  'main.h',
  'constants/event_objects.h',
  'constants/rgb.h',
] as const;

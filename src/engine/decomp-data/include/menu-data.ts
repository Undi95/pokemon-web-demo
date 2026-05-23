// AUTO-GENERATED from include/menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/menu.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const MENU_CURSOR_DELTA_NONE = 0;
export const MENU_CURSOR_DELTA_UP = -1;
export const MENU_CURSOR_DELTA_DOWN = 1;
export const MENU_CURSOR_DELTA_LEFT = -1;
export const MENU_CURSOR_DELTA_RIGHT = 1;
/** Raw expr: `(NUMBER_OF_MON_TYPES + 1)` */
export const MENU_INFO_ICON_TYPE_EXPR = "(NUMBER_OF_MON_TYPES + 1)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 2)` */
export const MENU_INFO_ICON_POWER_EXPR = "(NUMBER_OF_MON_TYPES + 2)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 3)` */
export const MENU_INFO_ICON_ACCURACY_EXPR = "(NUMBER_OF_MON_TYPES + 3)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 4)` */
export const MENU_INFO_ICON_PP_EXPR = "(NUMBER_OF_MON_TYPES + 4)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 5)` */
export const MENU_INFO_ICON_EFFECT_EXPR = "(NUMBER_OF_MON_TYPES + 5)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 6)` */
export const MENU_INFO_ICON_BALL_RED_EXPR = "(NUMBER_OF_MON_TYPES + 6)";
/** Raw expr: `(NUMBER_OF_MON_TYPES + 7)` */
export const MENU_INFO_ICON_BALL_BLUE_EXPR = "(NUMBER_OF_MON_TYPES + 7)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SAVE_0 = {
  SAVE_MENU_NAME: 0,
  SAVE_MENU_CAUGHT: 1,
  SAVE_MENU_PLAY_TIME: 2,
  SAVE_MENU_LOCATION: 3,
  SAVE_MENU_BADGES: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FreeAllOverworldWindowBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'InitStandardTextBoxWindows', ret: "void", arity: 0, params: "void" },
  { name: 'InitTextBoxGfxAndPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'RunTextPrintersAndIsPrinter0Active', ret: "u16", arity: 0, params: "void" },
  { name: 'LoadMessageBoxAndBorderGfx', ret: "void", arity: 0, params: "void" },
  { name: 'DrawDialogueFrame', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'ClearStdWindowAndFrame', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'PrintPlayerNameOnWindow', ret: "void", arity: 4, params: "u8 windowId, const u8 *src, u16 x, u16 y" },
  { name: 'ClearDialogWindowAndFrame', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'SetStandardWindowBorderStyle', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'DisplayYesNoMenuDefaultYes', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerTextSpeed', ret: "u32", arity: 0, params: "void" },
  { name: 'GetPlayerTextSpeedDelay', ret: "u8", arity: 0, params: "void" },
  { name: 'Menu_LoadStdPalAt', ret: "void", arity: 1, params: "u16 offset" },
  { name: 'BgDmaFill', ret: "void", arity: 4, params: "u32 bg, u8 value, int offset, int size" },
  { name: 'AddTextPrinterParameterized3', ret: "void", arity: 7, params: "u8 windowId, u8 fontId, u8 left, u8 top, const u8 *color, s8 speed, const u8 *str" },
  { name: 'ClearStdWindowAndFrameToTransparent', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'SetWindowTemplateFields', ret: "void", arity: 8, params: "struct WindowTemplate *template, u8 bg, u8 left, u8 top, u8 width, u8 height, u8 paletteNum, u16 baseBlock" },
  { name: 'DrawStdFrameWithCustomTileAndPalette', ret: "void", arity: 4, params: "u8 windowId, bool8 copyToVram, u16 baseTileNum, u8 paletteNum" },
  { name: 'ScheduleBgCopyTilemapToVram', ret: "void", arity: 1, params: "u8 bgId" },
  { name: 'PrintMenuTable', ret: "void", arity: 3, params: "u8 windowId, u8 itemCount, const struct MenuAction *menuActions" },
  { name: 'InitMenuInUpperLeftCornerNormal', ret: "u8", arity: 3, params: "u8 windowId, u8 itemCount, u8 initialCursorPos" },
  { name: 'Menu_GetCursorPos', ret: "u8", arity: 0, params: "void" },
  { name: 'Menu_ProcessInput', ret: "s8", arity: 0, params: "void" },
  { name: 'Menu_ProcessInputNoWrap', ret: "s8", arity: 0, params: "void" },
  { name: 'BlitMenuInfoIcon', ret: "void", arity: 4, params: "u8 windowId, u8 iconId, u16 x, u16 y" },
  { name: 'ResetTempTileDataBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'FreeTempTileDataBuffersIfPossible', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateWindowTemplate', ret: "WindowTemplate", arity: 7, params: "u8 bg, u8 left, u8 top, u8 width, u8 height, u8 paletteNum, u16 baseBlock" },
  { name: 'CreateYesNoMenu', ret: "void", arity: 4, params: "const struct WindowTemplate *window, u16 baseTileNum, u8 paletteNum, u8 initialCursorPos" },
  { name: 'DecompressAndLoadBgGfxUsingHeap', ret: "void", arity: 5, params: "u8 bgId, const void *src, u32 size, u16 offset, u8 mode" },
  { name: 'Menu_ProcessInputNoWrapClearOnChoose', ret: "s8", arity: 0, params: "void" },
  { name: 'ProcessMenuInput_other', ret: "s8", arity: 0, params: "void" },
  { name: 'DoScheduledBgTilemapCopiesToVram', ret: "void", arity: 0, params: "void" },
  { name: 'ClearScheduledBgCopiesToVram', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextPrinterParameterized4', ret: "void", arity: 9, params: "u8 windowId, u8 fontId, u8 left, u8 top, u8 letterSpacing, u8 lineSpacing, const u8 *color, s8 speed, const u8 *str" },
  { name: 'DrawDialogFrameWithCustomTileAndPalette', ret: "void", arity: 4, params: "u8 windowId, bool8 copyToVram, u16 tileNum, u8 paletteNum" },
  { name: 'PrintMenuActionTextsInUpperLeftCorner', ret: "void", arity: 4, params: "u8 windowId, u8 itemCount, const struct MenuAction *menuActions, const u8 *actionIds" },
  { name: 'ClearDialogWindowAndFrameToTransparent', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'copy_decompressed_tile_data_to_vram', ret: "u16", arity: 5, params: "u8 bgId, const void *src, u16 size, u16 offset, u8 mode" },
  { name: 'AddTextPrinterForMessage', ret: "void", arity: 1, params: "bool8 allowSkippingDelayWithButtonPress" },
  { name: 'PrintMenuActionTexts', ret: "void", arity: 9, params: "u8 windowId, u8 fontId, u8 left, u8 top, u8 letterSpacing, u8 lineHeight, u8 itemCount, const struct MenuAction *menuActions, const u8 *actionIds" },
  { name: 'PrintMenuActionGrid', ret: "void", arity: 9, params: "u8 windowId, u8 fontId, u8 left, u8 top, u8 optionWidth, u8 horizontalCount, u8 verticalCount, const struct MenuAction *menuActions, const u8 *actionIds" },
  { name: 'InitMenuActionGrid', ret: "u8", arity: 5, params: "u8 windowId, u8 optionWidth, u8 columns, u8 rows, u8 initialCursorPos" },
  { name: 'ChangeMenuGridCursorPosition', ret: "u8", arity: 2, params: "s8 deltaX, s8 deltaY" },
  { name: 'GetStartMenuWindowId', ret: "u8", arity: 0, params: "void" },
  { name: 'ListMenuLoadStdPalAt', ret: "void", arity: 2, params: "u8 palOffset, u8 palId" },
  { name: 'Menu_MoveCursor', ret: "u8", arity: 1, params: "s8 cursorDelta" },
  { name: 'Menu_MoveCursorNoWrapAround', ret: "u8", arity: 1, params: "s8 cursorDelta" },
  { name: 'DrawStdWindowFrame', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'AddStartMenuWindow', ret: "u8", arity: 1, params: "u8 numActions" },
  { name: 'InitMenuNormal', ret: "u8", arity: 7, params: "u8 windowId, u8 fontId, u8 left, u8 top, u8 cursorHeight, u8 numChoices, u8 initialCursorPos" },
  { name: 'LoadMessageBoxAndFrameGfx', ret: "void", arity: 2, params: "u8 windowId, bool8 copyToVram" },
  { name: 'AddTextPrinterForMessage_2', ret: "void", arity: 1, params: "bool8 allowSkippingDelayWithButtonPress" },
  { name: 'RemoveStartMenuWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayYesNoMenuWithDefault', ret: "void", arity: 1, params: "u8 initialCursorPos" },
  { name: 'BufferSaveMenuText', ret: "void", arity: 3, params: "u8 textId, u8 *dest, u8 color" },
  { name: 'RemoveMapNamePopUpWindow', ret: "void", arity: 0, params: "void" },
  { name: 'GetMapNamePopUpWindowId', ret: "u8", arity: 0, params: "void" },
  { name: 'AddMapNamePopUpWindow', ret: "u8", arity: 0, params: "void" },
  { name: 'SetBgTilemapPalette', ret: "void", arity: 6, params: "u8 bgId, u8 left, u8 top, u8 width, u8 height, u8 palette" },
  { name: 'AddValToTilemapBuffer', ret: "void", arity: 5, params: "void *ptr, int delta, int width, int height, bool32 isAffine" },
  { name: 'EraseFieldMessageBox', ret: "void", arity: 1, params: "bool8 copyToVram" },
  { name: 'PrintMenuGridTable', ret: "void", arity: 5, params: "u8 windowId, u8 optionWidth, u8 columns, u8 rows, const struct MenuAction *menuActions" },
  { name: 'Menu_ProcessGridInput', ret: "s8", arity: 0, params: "void" },
  { name: 'InitMenuInUpperLeftCorner', ret: "u8", arity: 4, params: "u8 windowId, u8 itemCount, u8 initialCursorPos, bool8 APressMuted" },
  { name: 'Menu_ProcessInputNoWrapAround_other', ret: "s8", arity: 0, params: "void" },
  { name: 'CopyToBufferFromBgTilemap', ret: "void", arity: 6, params: "u8 bgId, u16 *dest, u8 left, u8 top, u8 width, u8 height" },
  { name: 'HofPCTopBar_AddWindow', ret: "u8", arity: 5, params: "u8 bg, u8 xPos, u8 yPos, u8 palette, u16 baseTile" },
  { name: 'HofPCTopBar_RemoveWindow', ret: "void", arity: 0, params: "void" },
  { name: 'HofPCTopBar_Print', ret: "void", arity: 3, params: "const u8 *string, u8 left, bool8 copyToVram" },
  { name: 'HofPCTopBar_PrintPair', ret: "void", arity: 5, params: "const u8 *string, const u8 *string2, bool8 noBg, u8 left, bool8 copyToVram" },
  { name: 'ResetBgPositions', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextPrinterWithCustomSpeedForMessage', ret: "void", arity: 2, params: "bool8 allowSkippingDelayWithButtonPress, u8 speed" },
  { name: 'EraseYesNoWindow', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMenuActionTextsAtPos', ret: "void", arity: 7, params: "u8 windowId, u8 fontId, u8 left, u8 top, u8 lineHeight, u8 itemCount, const struct MenuAction *menuActions" },
  { name: 'Menu_LoadStdPal', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'task.h',
  'text.h',
  'window.h',
] as const;

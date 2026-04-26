// AUTO-GENERATED from include/menu_helpers.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/menu_helpers.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MENU_L_PRESSED = 1;
export const MENU_R_PRESSED = 2;
/** Raw expr: `(1 << 7)` */
export const SWAP_LINE_HAS_MARGIN_EXPR = "(1 << 7)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetVramOamAndBgCntRegs', ret: "void", arity: 0, params: "void" },
  { name: 'ResetAllBgsCoordinates', ret: "void", arity: 0, params: "void" },
  { name: 'SetVBlankHBlankCallbacksToNull', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayMessageAndContinueTask', ret: "void", arity: 8, params: "u8 taskId, u8 windowId, u16 tileNum, u8 paletteNum, u8 fontId, u8 textSpeed, const u8 *string, void *taskFunc" },
  { name: 'RunTextPrintersRetIsActive', ret: "bool16", arity: 1, params: "u8 textPrinterId" },
  { name: 'DoYesNoFuncWithChoice', ret: "void", arity: 2, params: "u8 taskId, const struct YesNoFuncTable *data" },
  { name: 'CreateYesNoMenuWithCallbacks', ret: "void", arity: 8, params: "u8 taskId, const struct WindowTemplate *template, u8 unused1, u8 unused2, u8 unused3, u16 tileStart, u8 palette, const struct YesNoFuncTable *yesNo" },
  { name: 'AdjustQuantityAccordingToDPadInput', ret: "bool8", arity: 2, params: "s16 *quantity, u16 max" },
  { name: 'GetLRKeysPressed', ret: "u8", arity: 0, params: "void" },
  { name: 'GetLRKeysPressedAndHeld', ret: "u8", arity: 0, params: "void" },
  { name: 'IsHoldingItemAllowed', ret: "bool8", arity: 1, params: "u16 itemId" },
  { name: 'IsWritingMailAllowed', ret: "bool8", arity: 1, params: "u16 itemId" },
  { name: 'MenuHelpers_IsLinkActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'MenuHelpers_ShouldWaitForLinkRecv', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetItemListPerPageCount', ret: "void", arity: 5, params: "struct ItemSlot *slots, u8 slotsCount, u8 *pageItems, u8 *totalItems, u8 maxPerPage" },
  { name: 'SetCursorWithinListBounds', ret: "void", arity: 4, params: "u16 *scrollOffset, u16 *cursorPos, u8 maxShownItems, u8 totalItems" },
  { name: 'SetCursorScrollWithinListBounds', ret: "void", arity: 5, params: "u16 *scrollOffset, u16 *cursorPos, u8 shownItems, u8 totalItems, u8 maxShownItems" },
  { name: 'LoadListMenuSwapLineGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSwapLineSprites', ret: "void", arity: 2, params: "u8 *spriteIds, u8 count" },
  { name: 'DestroySwapLineSprites', ret: "void", arity: 2, params: "u8 *spriteIds, u8 count" },
  { name: 'SetSwapLineSpritesInvisibility', ret: "void", arity: 3, params: "u8 *spriteIds, u8 count, bool8 invisible" },
  { name: 'UpdateSwapLineSpritesPos', ret: "void", arity: 4, params: "u8 *spriteIds, u8 count, s16 x, u16 y" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'task.h',
  'window.h',
] as const;

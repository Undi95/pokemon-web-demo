// AUTO-GENERATED from include/list_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/list_menu.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const LIST_NOTHING_CHOSEN = -1;
export const LIST_CANCEL = -2;
export const LIST_HEADER = -3;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_LIST_0 = {
  LIST_NO_MULTIPLE_SCROLL: 0,
  LIST_MULTIPLE_SCROLL_DPAD: 1,
  LIST_MULTIPLE_SCROLL_L_R: 2,
} as const;
export const ENUM_CURSOR_1 = {
  CURSOR_BLACK_ARROW: 0,
  CURSOR_INVISIBLE: 1,
  CURSOR_RED_OUTLINE: 2,
  CURSOR_RED_ARROW: 3,
} as const;
export const ENUM_SCROLL_2 = {
  SCROLL_ARROW_LEFT: 0,
  SCROLL_ARROW_RIGHT: 1,
  SCROLL_ARROW_UP: 2,
  SCROLL_ARROW_DOWN: 3,
} as const;
export const ENUM_ListMenuFields = {
  LISTFIELD_MOVECURSORFUNC: 0,
  LISTFIELD_MOVECURSORFUNC2: 1,
  LISTFIELD_TOTALITEMS: 2,
  LISTFIELD_MAXSHOWED: 3,
  LISTFIELD_WINDOWID: 4,
  LISTFIELD_HEADERX: 5,
  LISTFIELD_ITEMX: 6,
  LISTFIELD_CURSORX: 7,
  LISTFIELD_UPTEXTY: 8,
  LISTFIELD_CURSORPAL: 9,
  LISTFIELD_FILLVALUE: 10,
  LISTFIELD_CURSORSHADOWPAL: 11,
  LISTFIELD_LETTERSPACING: 12,
  LISTFIELD_ITEMVERTICALPADDING: 13,
  LISTFIELD_SCROLLMULTIPLE: 14,
  LISTFIELD_FONTID: 15,
  LISTFIELD_CURSORKIND: 16,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoMysteryGiftListMenu', ret: "s32", arity: 5, params: "const struct WindowTemplate *windowTemplate, const struct ListMenuTemplate *listMenuTemplate, u8 drawMode, u16 tileNum, u16 palOffset" },
  { name: 'ListMenuInit', ret: "u8", arity: 3, params: "struct ListMenuTemplate *listMenuTemplate, u16 scrollOffset, u16 selectedRow" },
  { name: 'ListMenuInitInRect', ret: "u8", arity: 4, params: "struct ListMenuTemplate *listMenuTemplate, struct ListMenuWindowRect *rect, u16 scrollOffset, u16 selectedRow" },
  { name: 'ListMenu_ProcessInput', ret: "s32", arity: 1, params: "u8 listTaskId" },
  { name: 'DestroyListMenuTask', ret: "void", arity: 3, params: "u8 listTaskId, u16 *scrollOffset, u16 *selectedRow" },
  { name: 'RedrawListMenu', ret: "void", arity: 1, params: "u8 listTaskId" },
  { name: 'ChangeListMenuPals', ret: "void", arity: 4, params: "u8 listTaskId, u8 cursorPal, u8 fillValue, u8 cursorShadowPal" },
  { name: 'ChangeListMenuCoords', ret: "void", arity: 3, params: "u8 listTaskId, u8 x, u8 y" },
  { name: 'ListMenuTestInput', ret: "s32", arity: 6, params: "struct ListMenuTemplate *template, u32 scrollOffset, u32 selectedRow, u16 keys, u16 *newScrollOffset, u16 *newSelectedRow" },
  { name: 'ListMenuGetCurrentItemArrayId', ret: "void", arity: 2, params: "u8 listTaskId, u16 *arrayId" },
  { name: 'ListMenuGetScrollAndRow', ret: "void", arity: 3, params: "u8 listTaskId, u16 *scrollOffset, u16 *selectedRow" },
  { name: 'ListMenuGetYCoordForPrintingArrowCursor', ret: "u16", arity: 1, params: "u8 listTaskId" },
  { name: 'ListMenuOverrideSetColors', ret: "void", arity: 3, params: "u8 cursorPal, u8 fillValue, u8 cursorShadowPal" },
  { name: 'ListMenuDefaultCursorMoveFunc', ret: "void", arity: 3, params: "s32 itemIndex, bool8 onInit, struct ListMenu *list" },
  { name: 'ListMenuGetTemplateField', ret: "s32", arity: 2, params: "u8 taskId, u8 field" },
  { name: 'ListMenuSetTemplateField', ret: "void", arity: 3, params: "u8 taskId, u8 field, s32 value" },
  { name: 'AddScrollIndicatorArrowPair', ret: "u8", arity: 2, params: "const struct ScrollArrowsTemplate *arrowInfo, u16 *scrollOffset" },
  { name: 'AddScrollIndicatorArrowPairParameterized', ret: "u8", arity: 8, params: "u32 arrowType, s32 commonPos, s32 firstPos, s32 secondPos, s32 fullyDownThreshold, s32 tileTag, s32 palTag, u16 *scrollOffset" },
  { name: 'RemoveScrollIndicatorArrowPair', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ScrollIndicatorArrowPairOnMainMenu', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ScrollIndicatorArrowPairOnMainMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'window.h',
] as const;

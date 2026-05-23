// AUTO-GENERATED from src/list_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/list_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `CURSOR_RED_OUTLINE` */
export const CURSOR_OBJECT_START_EXPR = "CURSOR_RED_OUTLINE";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tAnimNum_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBounceDir_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tMultiplier_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFrequency_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tSinePos_EXPR = "data[5]";
/** Raw expr: `data[15]` */
export const tIsScrolled_EXPR = "data[15]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_ScrollArrowIndicator = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_RedArrowCursor = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_ScrollArrowIndicator = { tileTag: 0, paletteTag: 0, oam: "&sOamData_ScrollArrowIndicator", anims: "sSpriteAnimTable_ScrollArrowIndicator", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallback_ScrollIndicatorArrow" } as const;
export const sSpriteTemplate_RedArrowCursor = { tileTag: 0, paletteTag: 0, oam: "&sOamData_RedArrowCursor", anims: "sSpriteAnimTable_RedArrowCursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallback_RedArrowCursor" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRedInterface_Pal': { path: 'graphics/interface/red.pal', ext: '.gbapal', type: 'u16' },
  'sScrollIndicator_Gfx': { path: 'graphics/interface/scroll_indicator.png', ext: '.4bpp.lz', type: 'u32' },
  'sArrowCursor_Gfx': { path: 'graphics/interface/arrow_cursor.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct ScrollArrowsTemplate", name: 'gTempScrollArrowTemplate', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct ListMenuTemplate", name: 'gMultiuseListMenuTemplate', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ListMenuInitInternal', ret: "u8", arity: 3, params: "struct ListMenuTemplate *listMenuTemplate, u16 scrollOffset, u16 selectedRow" },
  { name: 'ListMenuChangeSelection', ret: "bool8", arity: 4, params: "struct ListMenu *list, bool8 updateCursorAndCallCallback, u8 count, bool8 movingDown" },
  { name: 'ListMenuPrintEntries', ret: "void", arity: 4, params: "struct ListMenu *list, u16 startIndex, u16 yOffset, u16 count" },
  { name: 'ListMenuDrawCursor', ret: "void", arity: 1, params: "struct ListMenu *list" },
  { name: 'ListMenuCallSelectionChangedCallback', ret: "void", arity: 2, params: "struct ListMenu *list, u8 onInit" },
  { name: 'ListMenuAddCursorObject', ret: "u8", arity: 2, params: "struct ListMenu *list, u32 cursorObjId" },
  { name: 'Task_ScrollIndicatorArrowPair', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ListMenuAddRedOutlineCursorObject', ret: "u8", arity: 1, params: "struct CursorStruct *cursor" },
  { name: 'ListMenuAddRedArrowCursorObject', ret: "u8", arity: 1, params: "struct CursorStruct *cursor" },
  { name: 'ListMenuUpdateRedOutlineCursorObject', ret: "void", arity: 3, params: "u8 taskId, u16 x, u16 y" },
  { name: 'ListMenuUpdateRedArrowCursorObject', ret: "void", arity: 3, params: "u8 taskId, u16 x, u16 y" },
  { name: 'ListMenuRemoveRedOutlineCursorObject', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ListMenuRemoveRedArrowCursorObject', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ListMenuAddCursorObjectInternal', ret: "u8", arity: 2, params: "struct CursorStruct *cursor, u32 cursorObjId" },
  { name: 'ListMenuUpdateCursorObject', ret: "void", arity: 4, params: "u8 taskId, u16 x, u16 y, u32 cursorObjId" },
  { name: 'ListMenuRemoveCursorObject', ret: "void", arity: 2, params: "u8 taskId, u32 cursorObjId" },
  { name: 'SpriteCallback_ScrollIndicatorArrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCallback_RedArrowCursor', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ListMenuDummyTask', ret: "void", arity: 1, params: "u8 taskId" },
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
  { name: 'ListMenuPrint', ret: "void", arity: 4, params: "struct ListMenu *list, const u8 *str, u8 x, u8 y" },
  { name: 'ListMenuErasePrintedCursor', ret: "void", arity: 2, params: "struct ListMenu *list, u16 selectedRow" },
  { name: 'ListMenuUpdateSelectedRowIndexAndScrollOffset', ret: "u8", arity: 2, params: "struct ListMenu *list, bool8 movingDown" },
  { name: 'ListMenuScroll', ret: "void", arity: 3, params: "struct ListMenu *list, u8 count, bool8 movingDown" },
  { name: 'ListMenuOverrideSetColors', ret: "void", arity: 3, params: "u8 cursorPal, u8 fillValue, u8 cursorShadowPal" },
  { name: 'ListMenuDefaultCursorMoveFunc', ret: "void", arity: 3, params: "s32 itemIndex, bool8 onInit, struct ListMenu *list" },
  { name: 'ListMenuGetTemplateField', ret: "s32", arity: 2, params: "u8 taskId, u8 field" },
  { name: 'ListMenuSetTemplateField', ret: "void", arity: 3, params: "u8 taskId, u8 field, s32 value" },
  { name: 'AddScrollIndicatorArrowObject', ret: "u8", arity: 5, params: "u8 arrowDir, u8 x, u8 y, u16 tileTag, u16 palTag" },
  { name: 'AddScrollIndicatorArrowPair', ret: "u8", arity: 2, params: "const struct ScrollArrowsTemplate *arrowInfo, u16 *scrollOffset" },
  { name: 'AddScrollIndicatorArrowPairParameterized', ret: "u8", arity: 8, params: "u32 arrowType, s32 commonPos, s32 firstPos, s32 secondPos, s32 fullyDownThreshold, s32 tileTag, s32 palTag, u16 *scrollOffset" },
  { name: 'Task_ScrollIndicatorArrowPairOnMainMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RemoveScrollIndicatorArrowPair', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_RedOutlineCursor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ListMenuGetRedOutlineCursorSpriteCount', ret: "u8", arity: 2, params: "u16 rowWidth, u16 rowHeight" },
  { name: 'ListMenuSetUpRedOutlineCursorSpriteOamTable', ret: "void", arity: 3, params: "u16 rowWidth, u16 rowHeight, struct Subsprite *subsprites" },
  { name: 'Task_RedArrowCursor', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_RedArrowCursor',
  'Task_RedOutlineCursor',
  'Task_ScrollIndicatorArrowPair',
  'Task_ScrollIndicatorArrowPairOnMainMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'menu.h',
  'list_menu.h',
  'window.h',
  'text_window.h',
  'main.h',
  'task.h',
  'trig.h',
  'decompress.h',
  'palette.h',
  'malloc.h',
  'strings.h',
  'sound.h',
  'constants/songs.h',
] as const;

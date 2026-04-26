// AUTO-GENERATED from src/pokenav_ribbons_list.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_ribbons_list.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RIBBONS_0 = {
  RIBBONS_MON_LIST_FUNC_NONE: 0,
  RIBBONS_MON_LIST_FUNC_MOVE_UP: 1,
  RIBBONS_MON_LIST_FUNC_MOVE_DOWN: 2,
  RIBBONS_MON_LIST_FUNC_PAGE_UP: 3,
  RIBBONS_MON_LIST_FUNC_PAGE_DOWN: 4,
  RIBBONS_MON_LIST_FUNC_EXIT: 5,
  RIBBONS_MON_LIST_FUNC_OPEN_RIBBONS_SUMMARY: 6,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sRibbonsMonListWindowTemplate = { bg: 1, tilemapLeft: 1, tilemapTop: 6, width: 7, height: 2, paletteNum: 1, baseBlock: 20 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sMonRibbonListBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMonRibbonListUi_Pal': { path: 'graphics/pokenav/ribbons/list_ui.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleRibbonsMonListInput_WaitListInit', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsMonList *" },
  { name: 'HandleRibbonsMonListInput', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsMonList *" },
  { name: 'RibbonsMonMenu_ReturnToMainMenu', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsMonList *" },
  { name: 'RibbonsMonMenu_ToSummaryScreen', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsMonList *" },
  { name: 'BuildPartyMonRibbonList', ret: "u32", arity: 1, params: "s32" },
  { name: 'InitBoxMonRibbonList', ret: "u32", arity: 1, params: "s32" },
  { name: 'BuildBoxMonRibbonList', ret: "u32", arity: 1, params: "s32" },
  { name: 'GetMonRibbonListLoopTaskFunc', ret: "u32", arity: 1, params: "s32" },
  { name: 'InsertMonListItem', ret: "void", arity: 2, params: "struct Pokenav_RibbonsMonList *, struct PokenavMonListItem *" },
  { name: 'LoopedTask_OpenRibbonsMonList', ret: "u32", arity: 1, params: "s32" },
  { name: 'GetRibbonsMonCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoopedTask_RibbonsListMoveCursorUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RibbonsListMoveCursorDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RibbonsListMovePageUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RibbonsListMovePageDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RibbonsListReturnToMainMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RibbonsListOpenSummary', ret: "u32", arity: 1, params: "s32" },
  { name: 'DrawListIndexNumber', ret: "void", arity: 3, params: "s32, s32, s32" },
  { name: 'AddRibbonsMonListWindow', ret: "void", arity: 1, params: "struct Pokenav_RibbonsMonMenu *" },
  { name: 'UpdateIndexNumberDisplay', ret: "void", arity: 1, params: "struct Pokenav_RibbonsMonMenu *" },
  { name: 'CreateRibbonMonsList', ret: "void", arity: 0, params: "void" },
  { name: 'BufferRibbonMonInfoText', ret: "void", arity: 2, params: "struct PokenavListItem *, u8 *" },
  { name: 'PokenavCallback_Init_MonRibbonList', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_RibbonsMonListFromSummary', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetRibbonsMonListCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeRibbonsMonList', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateMonListBgs', ret: "u32", arity: 0, params: "void" },
  { name: 'GetRibbonsMonListCount', ret: "s32", arity: 0, params: "void" },
  { name: 'GetMonRibbonSelectedMonData', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetRibbonListMenuCurrIndex', ret: "s32", arity: 0, params: "void" },
  { name: 'PlayerHasRibbonsMon', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'OpenRibbonsMonList', ret: "bool32", arity: 0, params: "void" },
  { name: 'OpenRibbonsMonListFromRibbonsSummary', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateRibbonsMonListLoopedTask', ret: "void", arity: 1, params: "s32 idx" },
  { name: 'IsRibbonsMonListLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeRibbonsMonMenu', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokenav.h',
  'bg.h',
  'menu.h',
  'palette.h',
  'window.h',
  'sound.h',
  'string_util.h',
  'international_string_util.h',
  'constants/songs.h',
  'graphics.h',
] as const;

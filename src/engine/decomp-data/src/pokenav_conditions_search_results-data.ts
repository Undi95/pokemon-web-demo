// AUTO-GENERATED from src/pokenav_conditions_search_results.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions_search_results.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CONDITION_0 = {
  CONDITION_SEARCH_FUNC_NONE: 0,
  CONDITION_SEARCH_FUNC_MOVE_UP: 1,
  CONDITION_SEARCH_FUNC_MOVE_DOWN: 2,
  CONDITION_SEARCH_FUNC_PAGE_UP: 3,
  CONDITION_SEARCH_FUNC_PAGE_DOWN: 4,
  CONDITION_SEARCH_FUNC_EXIT: 5,
  CONDITION_SEARCH_FUNC_SELECT_MON: 6,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sSearchResultListMenuWindowTemplate = { bg: 1, tilemapLeft: 1, tilemapTop: 6, width: 7, height: 2, paletteNum: 1, baseBlock: 20 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sConditionSearchResultBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sListBg_Pal': { path: 'graphics/pokenav/condition/search_results_list.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleConditionSearchInput_WaitSetup', ret: "u32", arity: 1, params: "struct Pokenav_SearchResults *" },
  { name: 'HandleConditionSearchInput', ret: "u32", arity: 1, params: "struct Pokenav_SearchResults *" },
  { name: 'OpenConditionGraphFromSearchList', ret: "u32", arity: 1, params: "struct Pokenav_SearchResults *" },
  { name: 'ReturnToConditionSearchList', ret: "u32", arity: 1, params: "struct Pokenav_SearchResults *" },
  { name: 'GetConditionSearchLoopedTask', ret: "u32", arity: 1, params: "s32" },
  { name: 'BuildPartyMonSearchResults', ret: "u32", arity: 1, params: "s32" },
  { name: 'InitBoxMonSearchResults', ret: "u32", arity: 1, params: "s32" },
  { name: 'BuildBoxMonSearchResults', ret: "u32", arity: 1, params: "s32" },
  { name: 'ConvertConditionsToListRanks', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveSearchListCursorUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveSearchListCursorDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveSearchListPageUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveSearchListPageDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ExitConditionSearchMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_SelectSearchResult', ret: "u32", arity: 1, params: "s32" },
  { name: 'InsertMonListItem', ret: "void", arity: 2, params: "struct Pokenav_SearchResults *, struct PokenavMonListItem *" },
  { name: 'GetSearchResultCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoopedTask_OpenConditionSearchResults', ret: "u32", arity: 1, params: "s32" },
  { name: 'AddSearchResultListMenuWindow', ret: "void", arity: 1, params: "struct Pokenav_SearchResultsGfx *" },
  { name: 'PrintSearchResultListMenuItems', ret: "void", arity: 1, params: "struct Pokenav_SearchResultsGfx *" },
  { name: 'CreateSearchResultsList', ret: "void", arity: 0, params: "void" },
  { name: 'BufferSearchMonListItem', ret: "void", arity: 2, params: "struct PokenavMonListItem *, u8 *" },
  { name: 'PokenavCallback_Init_ConditionSearch', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_ReturnToMonSearchList', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetConditionSearchResultsCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeSearchResultSubstruct1', ret: "void", arity: 0, params: "void" },
  { name: 'GetReturningFromGraph', ret: "u32", arity: 0, params: "void" },
  { name: 'GetSearchResultsMonDataList', ret: "PokenavMonListItem *", arity: 0, params: "void" },
  { name: 'GetSearchResultsMonListCount', ret: "u16", arity: 0, params: "void" },
  { name: 'GetSearchResultsSelectedMonRank', ret: "s32", arity: 0, params: "void" },
  { name: 'GetSearchResultsCurrentListIndex', ret: "u16", arity: 0, params: "void" },
  { name: 'OpenConditionSearchResults', ret: "bool32", arity: 0, params: "void" },
  { name: 'OpenConditionSearchListFromGraph', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateSearchResultsLoopedTask', ret: "void", arity: 1, params: "s32 idx" },
  { name: 'IsSearchResultLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeSearchResultSubstruct2', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokenav.h',
  'bg.h',
  'graphics.h',
  'menu.h',
  'palette.h',
  'window.h',
  'sound.h',
  'dynamic_placeholder_text_util.h',
  'strings.h',
  'string_util.h',
  'international_string_util.h',
  'constants/songs.h',
] as const;

// AUTO-GENERATED from src/pokenav_conditions.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const CONDITION_MONS_LOADED = 3;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPartyConditionListParameters', ret: "void", arity: 0, params: "void" },
  { name: 'InitSearchResultsConditionList', ret: "void", arity: 0, params: "void" },
  { name: 'HandleConditionMenuInput', ret: "u32", arity: 1, params: "struct Pokenav_ConditionMenu *" },
  { name: 'GetConditionReturnCallback', ret: "u32", arity: 1, params: "struct Pokenav_ConditionMenu *" },
  { name: 'OpenMarkingsMenu', ret: "u32", arity: 1, params: "struct Pokenav_ConditionMenu *" },
  { name: 'ConditionGraphHandleDpadInput', ret: "u8", arity: 1, params: "struct Pokenav_ConditionMenu *" },
  { name: 'SwitchConditionSummaryIndex', ret: "u8", arity: 1, params: "bool8" },
  { name: 'CopyMonNameGenderLocation', ret: "void", arity: 2, params: "s16, u8" },
  { name: 'GetMonConditionGraphData', ret: "void", arity: 2, params: "s16, u8" },
  { name: 'ConditionGraphDrawMonPic', ret: "void", arity: 2, params: "s16, u8" },
  { name: 'PokenavCallback_Init_ConditionGraph_Party', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_ConditionGraph_Search', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetConditionGraphMenuCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'SetBoxMonDataAt', ret: "else", arity: 4, params: "boxId, monId, MON_DATA_MARKINGS, &markings" },
  { name: 'FreeConditionGraphMenuSubstruct1', ret: "void", arity: 0, params: "void" },
  { name: 'LoadConditionGraphMenuGfx', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoadNextConditionMenuMonData', ret: "bool32", arity: 1, params: "u8 mode" },
  { name: 'GetMonListCount', ret: "u16", arity: 0, params: "void" },
  { name: 'GetConditionGraphCurrentListIndex', ret: "u16", arity: 0, params: "void" },
  { name: 'GetConditionGraphMenuCurrentLoadIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'GetConditionGraphMenuToLoadListIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'GetConditionGraphMenuToLoadId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetConditionMonDataBuffer', ret: "u16", arity: 0, params: "void" },
  { name: 'IsConditionMenuSearchMode', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryGetMonMarkId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetNumConditionMonSparkles', ret: "u8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'data.h',
  'decompress.h',
  'main.h',
  'menu_specialized.h',
  'mon_markings.h',
  'pokenav.h',
  'pokemon.h',
  'pokemon_storage_system.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'constants/songs.h',
] as const;

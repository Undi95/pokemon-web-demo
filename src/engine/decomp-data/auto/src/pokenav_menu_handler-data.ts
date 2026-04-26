// AUTO-GENERATED from src/pokenav_menu_handler.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_menu_handler.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'UpdateMenuCursorPos', ret: "bool32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'ReturnToConditionMenu', ret: "void", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'ReturnToMainMenu', ret: "void", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'GetMenuId', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'SetMenuIdAndCB', ret: "void", arity: 2, params: "struct Pokenav_Menu *, u32" },
  { name: 'CB2_ReturnToConditionMenu', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'CB2_ReturnToMainMenu', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleConditionSearchMenuInput', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleConditionMenuInput', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleCantOpenRibbonsInput', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleMainMenuInputEndTutorial', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleMainMenuInputTutorial', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'HandleMainMenuInput', ret: "u32", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'SetMenuInputHandler', ret: "void", arity: 1, params: "struct Pokenav_Menu *" },
  { name: 'GetPokenavMainMenuType', ret: "u8", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_MainMenuCursorOnMap', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_MainMenuCursorOnMatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_MainMenuCursorOnRibbons', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_ConditionMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_ConditionSearchMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetMenuHandlerCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeMenuHandlerSubstruct1', ret: "void", arity: 0, params: "void" },
  { name: 'GetPokenavMenuType', ret: "int", arity: 0, params: "void" },
  { name: 'GetPokenavCursorPos', ret: "int", arity: 0, params: "void" },
  { name: 'GetCurrentMenuItemId', ret: "int", arity: 0, params: "void" },
  { name: 'GetHelpBarTextId', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokenav.h',
  'event_data.h',
  'main.h',
  'sound.h',
  'constants/songs.h',
] as const;

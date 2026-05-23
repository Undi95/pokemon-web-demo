// AUTO-GENERATED from include/script_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/script_menu.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ScriptMenu_Multichoice', ret: "bool8", arity: 4, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress" },
  { name: 'ScriptMenu_MultichoiceWithDefault', ret: "bool8", arity: 5, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress, u8 defaultChoice" },
  { name: 'ScriptMenu_YesNo', ret: "bool8", arity: 2, params: "u8 left, u8 top" },
  { name: 'ScriptMenu_MultichoiceGrid', ret: "bool8", arity: 5, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress, u8 columnCount" },
  { name: 'ScriptMenu_ShowPokemonPic', ret: "bool8", arity: 3, params: "u16 species, u8 x, u8 y" },
  { name: 'ConvertPixelWidthToTileWidth', ret: "int", arity: 1, params: "int width" },
  { name: 'CreateWindowFromRect', ret: "u8", arity: 4, params: "u8 x, u8 y, u8 width, u8 height" },
  { name: 'ClearToTransparentAndRemoveWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'DisplayTextAndGetWidth', ret: "int", arity: 2, params: "const u8 *str, int prevWidth" },
  { name: 'ScriptMenu_AdjustLeftCoordFromWidth', ret: "int", arity: 2, params: "int left, int width" },
  { name: 'ScriptMenu_CreatePCMultichoice', ret: "bool16", arity: 0, params: "void" },
  { name: 'ScriptMenu_DisplayPCStartupPrompt', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/script_menu.h',
] as const;

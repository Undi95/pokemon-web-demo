// AUTO-GENERATED from include/international_string_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/international_string_util.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ConvertInternationalPlayerName', ret: "void", arity: 1, params: "u8 *str" },
  { name: 'TVShowConvertInternationalString', ret: "void", arity: 3, params: "u8 *dest, const u8 *src, int language" },
  { name: 'GetStringCenterAlignXOffset', ret: "int", arity: 3, params: "int fontId, const u8 *str, int totalWidth" },
  { name: 'GetStringRightAlignXOffset', ret: "int", arity: 3, params: "int fontId, const u8 *str, int totalWidth" },
  { name: 'GetStringCenterAlignXOffsetWithLetterSpacing', ret: "int", arity: 4, params: "int fontId, const u8 *str, int totalWidth, int letterSpacing" },
  { name: 'GetStringWidthDifference', ret: "int", arity: 4, params: "int fontId, const u8 *str, int totalWidth, int letterSpacing" },
  { name: 'GetMaxWidthInMenuTable', ret: "int", arity: 2, params: "const struct MenuAction *actions, int numActions" },
  { name: 'GetMaxWidthInSubsetOfMenuTable', ret: "int", arity: 3, params: "const struct MenuAction *actions, const u8 *actionIds, int numActions" },
  { name: 'Intl_GetListMenuWidth', ret: "int", arity: 1, params: "const struct ListMenuTemplate *listMenu" },
  { name: 'CopyMonCategoryText', ret: "void", arity: 2, params: "int dexNum, u8 *dest" },
  { name: 'PadNameString', ret: "void", arity: 2, params: "u8 *dest, u8 padChar" },
  { name: 'ConvertInternationalPlayerNameStripChar', ret: "void", arity: 2, params: "u8 *str, u8 removeChar" },
  { name: 'ConvertInternationalContestantName', ret: "void", arity: 1, params: "u8 *str" },
  { name: 'GetNicknameLanguage', ret: "int", arity: 1, params: "u8 *str" },
  { name: 'FillWindowTilesByRow', ret: "void", arity: 5, params: "int windowId, int columnStart, int rowStart, int numFillTiles, int numRows" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'menu.h',
  'list_menu.h',
] as const;

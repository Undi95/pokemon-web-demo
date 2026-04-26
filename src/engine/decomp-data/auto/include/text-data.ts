// AUTO-GENERATED from include/text.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/text.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TEXT_SKIP_DRAW = 255;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_FONT_0 = {
  FONT_SMALL: 0,
  FONT_NORMAL: 1,
  FONT_SHORT: 2,
  FONT_SHORT_COPY_1: 3,
  FONT_SHORT_COPY_2: 4,
  FONT_SHORT_COPY_3: 5,
  FONT_BRAILLE: 6,
  FONT_NARROW: 7,
  FONT_SMALL_NARROW: 8,
  FONT_BOLD: 9,
} as const;
export const ENUM_RENDER_1 = {
  RENDER_PRINT: 0,
  RENDER_FINISH: 1,
  RENDER_REPEAT: 2,
  RENDER_UPDATE: 3,
} as const;
export const ENUM_RENDER_2 = {
  RENDER_STATE_HANDLE_CHAR: 0,
  RENDER_STATE_WAIT: 1,
  RENDER_STATE_CLEAR: 2,
  RENDER_STATE_SCROLL_START: 3,
  RENDER_STATE_SCROLL: 4,
  RENDER_STATE_WAIT_SE: 5,
  RENDER_STATE_PAUSE: 6,
} as const;
export const ENUM_FONTATTR_3 = {
  FONTATTR_MAX_LETTER_WIDTH: 0,
  FONTATTR_MAX_LETTER_HEIGHT: 1,
  FONTATTR_LETTER_SPACING: 2,
  FONTATTR_LINE_SPACING: 3,
  FONTATTR_UNKNOWN: 4,
  FONTATTR_COLOR_FOREGROUND: 5,
  FONTATTR_COLOR_BACKGROUND: 6,
  FONTATTR_COLOR_SHADOW: 7,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DeactivateAllTextPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'RunTextPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'IsTextPrinterActive', ret: "bool16", arity: 1, params: "u8 id" },
  { name: 'GenerateFontHalfRowLookupTable', ret: "void", arity: 3, params: "u8 fgColor, u8 bgColor, u8 shadowColor" },
  { name: 'SaveTextColors', ret: "void", arity: 3, params: "u8 *fgColor, u8 *bgColor, u8 *shadowColor" },
  { name: 'RestoreTextColors', ret: "void", arity: 3, params: "u8 *fgColor, u8 *bgColor, u8 *shadowColor" },
  { name: 'DecompressGlyphTile', ret: "void", arity: 2, params: "const void *src_, void *dest_" },
  { name: 'CopyGlyphToWindow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'ClearTextSpan', ret: "void", arity: 2, params: "struct TextPrinter *textPrinter, u32 width" },
  { name: 'GetMenuCursorDimensionByFont', ret: "u8", arity: 2, params: "u8 fontId, u8 whichDimension" },
  { name: 'TextPrinterInitDownArrowCounters', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterDrawDownArrow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterClearDownArrow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWaitAutoMode', ret: "bool8", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWaitWithDownArrow', ret: "bool16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWait', ret: "bool16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'DrawDownArrow', ret: "void", arity: 7, params: "u8 windowId, u16 x, u16 y, u8 bgColor, bool8 drawArrow, u8 *counter, u8 *yCoordIndex" },
  { name: 'GetStringWidth', ret: "s32", arity: 3, params: "u8 fontId, const u8 *str, s16 letterSpacing" },
  { name: 'RenderTextHandleBold', ret: "u8", arity: 3, params: "u8 *pixels, u8 fontId, u8 *str" },
  { name: 'DrawKeypadIcon', ret: "u8", arity: 4, params: "u8 windowId, u8 keypadIconId, u16 x, u16 y" },
  { name: 'GetKeypadIconTileOffset', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'GetKeypadIconWidth', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'GetKeypadIconHeight', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'SetDefaultFontsPointer', ret: "void", arity: 0, params: "void" },
  { name: 'GetFontAttribute', ret: "u8", arity: 2, params: "u8 fontId, u8 attributeId" },
  { name: 'FontFunc_Braille', ret: "u16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'GetGlyphWidth_Braille', ret: "u32", arity: 2, params: "u16 glyphId, bool32 isJapanese" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/characters.h',
] as const;

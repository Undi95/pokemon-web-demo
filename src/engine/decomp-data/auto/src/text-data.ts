// AUTO-GENERATED from src/text.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/text.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sDownArrowTiles': { path: 'graphics/fonts/down_arrow.png', ext: '.4bpp', type: 'u8' },
  'sDarkDownArrowTiles': { path: 'graphics/fonts/down_arrow_alt.png', ext: '.4bpp', type: 'u8' },
  'sUnusedFRLGBlankedDownArrow': { path: 'graphics/fonts/unused_frlg_blanked_down_arrow.png', ext: '.4bpp', type: 'u8' },
  'sUnusedFRLGDownArrow': { path: 'graphics/fonts/unused_frlg_down_arrow.png', ext: '.4bpp', type: 'u8' },
  'sKeypadIconTiles': { path: 'graphics/fonts/keypad_icons.png', ext: '.4bpp', type: 'u8' },
  'sFontBoldJapaneseGlyphs': { path: 'graphics/fonts/japanese_bold.png', ext: '.hwjpnfont', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sFontHalfRowOffsets: readonly number[] = [0,1,2,0,3,4,5,3,6,7,8,6,0,1,2,0,9,10,11,9,12,13,14,12,15,16,17,15,9,10,11,9,18,19,20,18,21,22,23,21,24,25,26,24,18,19,20,18,0,1,2,0,3,4,5,3,6,7,8,6,0,1,2,0,27,28,29,27,30,31,32,30,33,34,35,33,27,28,29,27,36,37,38,36,39,40,41,39,42,43,44,42,36,37,38,36,45,46,47,45,48,49,50,48,51,52,53,51,45,46,47,45,27,28,29,27,30,31,32,30,33,34,35,33,27,28,29,27,54,55,56,54,57,58,59,57,60,61,62,60,54,55,56,54,63,64,65,63,66,67,68,66,69,70,71,69,63,64,65,63,72,73,74,72,75,76,77,75,78,79,80,78,72,73,74,72,54,55,56,54,57,58,59,57,60,61,62,60,54,55,56,54,0,1,2,0,3,4,5,3,6,7,8,6,0,1,2,0,9,10,11,9,12,13,14,12,15,16,17,15,9,10,11,9,18,19,20,18,21,22,23,21,24,25,26,24,18,19,20,18,0,1,2,0,3,4,5,3,6,7,8,6,0,1,2,0] as const;
export const sDownArrowYCoords: readonly number[] = [0,1,2,1] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct TextPrinter", name: 'sTempTextPrinter', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct TextPrinter", name: 'sTextPrinters', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "bool8", name: 'gDisableTextPrinters', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "struct TextGlyph", name: 'gCurGlyph', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "TextFlags", name: 'gTextFlags', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RenderText', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'RenderFont', ret: "u32", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_Small', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_Normal', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_Short', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_ShortCopy1', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_ShortCopy2', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_ShortCopy3', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_Narrow', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'FontFunc_SmallNarrow', ret: "u16", arity: 1, params: "struct TextPrinter *" },
  { name: 'DecompressGlyph_Small', ret: "void", arity: 2, params: "u16, bool32" },
  { name: 'DecompressGlyph_Normal', ret: "void", arity: 2, params: "u16, bool32" },
  { name: 'DecompressGlyph_Short', ret: "void", arity: 2, params: "u16, bool32" },
  { name: 'DecompressGlyph_Narrow', ret: "void", arity: 2, params: "u16, bool32" },
  { name: 'DecompressGlyph_SmallNarrow', ret: "void", arity: 2, params: "u16, bool32" },
  { name: 'DecompressGlyph_Bold', ret: "void", arity: 1, params: "u16" },
  { name: 'GetGlyphWidth_Small', ret: "u32", arity: 2, params: "u16, bool32" },
  { name: 'GetGlyphWidth_Normal', ret: "u32", arity: 2, params: "u16, bool32" },
  { name: 'GetGlyphWidth_Short', ret: "u32", arity: 2, params: "u16, bool32" },
  { name: 'GetGlyphWidth_Narrow', ret: "u32", arity: 2, params: "u16, bool32" },
  { name: 'GetGlyphWidth_SmallNarrow', ret: "u32", arity: 2, params: "u16, bool32" },
  { name: 'SetFontsPointer', ret: "void", arity: 1, params: "const struct FontInfo *fonts" },
  { name: 'DeactivateAllTextPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'RunTextPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'IsTextPrinterActive', ret: "bool16", arity: 1, params: "u8 id" },
  { name: 'GenerateFontHalfRowLookupTable', ret: "void", arity: 3, params: "u8 fgColor, u8 bgColor, u8 shadowColor" },
  { name: 'SaveTextColors', ret: "void", arity: 3, params: "u8 *fgColor, u8 *bgColor, u8 *shadowColor" },
  { name: 'RestoreTextColors', ret: "void", arity: 3, params: "u8 *fgColor, u8 *bgColor, u8 *shadowColor" },
  { name: 'DecompressGlyphTile', ret: "void", arity: 2, params: "const void *src_, void *dest_" },
  { name: 'GetLastTextColor', ret: "UNUSED", arity: 1, params: "u8 colorType" },
  { name: 'GLYPH_COPY', ret: "void", arity: 7, params: "u8 *windowTiles, u32 widthOffset, u32 j, u32 i, u32 *glyphPixels, s32 width, s32 height" },
  { name: 'CopyGlyphToWindow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'ClearTextSpan', ret: "void", arity: 2, params: "struct TextPrinter *textPrinter, u32 width" },
  { name: 'TextPrinterInitDownArrowCounters', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterDrawDownArrow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterClearDownArrow', ret: "void", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWaitAutoMode', ret: "bool8", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWaitWithDownArrow', ret: "bool16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'TextPrinterWait', ret: "bool16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'DrawDownArrow', ret: "void", arity: 7, params: "u8 windowId, u16 x, u16 y, u8 bgColor, bool8 drawArrow, u8 *counter, u8 *yCoordIndex" },
  { name: 'GetStringWidthFixedWidthFont', ret: "UNUSED", arity: 3, params: "const u8 *str, u8 fontId, u8 letterSpacing" },
  { name: 'GetStringWidth', ret: "s32", arity: 3, params: "u8 fontId, const u8 *str, s16 letterSpacing" },
  { name: 'RenderTextHandleBold', ret: "u8", arity: 3, params: "u8 *pixels, u8 fontId, u8 *str" },
  { name: 'DrawKeypadIcon', ret: "u8", arity: 4, params: "u8 windowId, u8 keypadIconId, u16 x, u16 y" },
  { name: 'GetKeypadIconTileOffset', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'GetKeypadIconWidth', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'GetKeypadIconHeight', ret: "u8", arity: 1, params: "u8 keypadIconId" },
  { name: 'SetDefaultFontsPointer', ret: "void", arity: 0, params: "void" },
  { name: 'GetFontAttribute', ret: "u8", arity: 2, params: "u8 fontId, u8 attributeId" },
  { name: 'GetMenuCursorDimensionByFont', ret: "u8", arity: 2, params: "u8 fontId, u8 whichDimension" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'main.h',
  'm4a.h',
  'palette.h',
  'sound.h',
  'constants/songs.h',
  'string_util.h',
  'window.h',
  'text.h',
  'blit.h',
  'menu.h',
  'dynamic_placeholder_text_util.h',
  'fonts.h',
] as const;

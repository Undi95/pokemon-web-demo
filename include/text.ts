/**
 * include/text.ts — miroir 1:1 (PARTIEL) de `decomp/include/text.h`.
 *
 * Re-export de notre préproc source→bytes (analogue de `_("…")`) + de la surface
 * text.h relocalisée (VAGUE 2) : FontIds, FONTATTR_*, TEXT_SKIP_DRAW,
 * GetFontAttribute/GetMenuCursorDimensionByFont. Le reste (RENDER_STATE_*,
 * struct TextPrinter, RenderText…) sera absorbé à mesure que text.c est
 * relocalisé. cf. docs/TEXT-DATA-1TO1-MIGRATION-PLAN.md.
 */
export { encodeOwTextSource, encodeOwText, isOwCharmapReady, decodeOwBytes } from '../src/text';

// text.h — FontIds + attributs de font (relocalisés depuis engine/ui, 1:1 text.c).
export {
  FONT_SMALL, FONT_NORMAL, FONT_SHORT,
  FONT_SHORT_COPY_1, FONT_SHORT_COPY_2, FONT_SHORT_COPY_3,
  FONT_BRAILLE, FONT_NARROW, FONT_SMALL_NARROW, FONT_BOLD,
  TEXT_SKIP_DRAW,
  FONTATTR_MAX_LETTER_WIDTH, FONTATTR_MAX_LETTER_HEIGHT, FONTATTR_LETTER_SPACING,
  FONTATTR_LINE_SPACING, FONTATTR_UNKNOWN, FONTATTR_COLOR_FOREGROUND,
  FONTATTR_COLOR_BACKGROUND, FONTATTR_COLOR_SHADOW,
  GetFontAttribute, GetMenuCursorDimensionByFont,
  GetStringWidth, GetStringRightAlignXOffset, GetStringCenterAlignXOffset,
} from '../src/text';
export type { FontInfo } from '../src/text';

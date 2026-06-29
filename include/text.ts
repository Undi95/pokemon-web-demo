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

// Bridge gStringVar / playerName (relocalisé depuis engine/system/string-buffers).
export {
  setStringVar, getStringVar, clearStringVars,
  GetPlayerName, GetPlayerNameString, SetPlayerName,
} from '../src/text';

// ─── text.h — constantes DÉFINIES ICI (leaf 1:1, = include/text.h) ───────────
// Ce fichier EST le foyer 1:1 de ces #define/enum (avant : re-export depuis
// src/text.ts ; absorbé ici 2026-06-29 depuis decomp-data/include/text-data.ts).
// Littéraux = pas de dépendance sur src/text → leaf SANS cycle (string_util peut
// les importer malgré le cycle src/text↔string_util). 🚩 WART (dedup différé) :
// src/text.ts garde TEMPORAIREMENT ses propres copies de ces consts (8 fichiers
// les importent direct de './text' mêlées à des fonctions) ; le dedup = src/text
// importe d'ici, mais ça forme le cycle src/text↔include/text (à faire/vérifier
// à part, cycle-safe). Valeurs IDENTIQUES (1:1 text.h) → zéro divergence runtime.

/** 1:1 décomp `include/text.h:10-21` enum FontIds. */
export const FONT_SMALL = 0;
export const FONT_NORMAL = 1;
export const FONT_SHORT = 2;
export const FONT_SHORT_COPY_1 = 3;
export const FONT_SHORT_COPY_2 = 4;
export const FONT_SHORT_COPY_3 = 5;
export const FONT_BRAILLE = 6;
export const FONT_NARROW = 7;
export const FONT_SMALL_NARROW = 8;
export const FONT_BOLD = 9;
/** 1:1 décomp `#define TEXT_SKIP_DRAW 0xFF` (text.h:8). */
export const TEXT_SKIP_DRAW = 0xFF;
/** 1:1 décomp `include/text.h:42-51` enum (attributeId de GetFontAttribute). */
export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;
export const FONTATTR_UNKNOWN = 4;
export const FONTATTR_COLOR_FOREGROUND = 5;
export const FONTATTR_COLOR_BACKGROUND = 6;
export const FONTATTR_COLOR_SHADOW = 7;

// Fonctions text.c (re-export depuis src/text — APRÈS les littéraux ci-dessus
// pour que l'ordre d'eval reste sûr si un cycle se forme via les fonctions).
export {
  GetFontAttribute, GetMenuCursorDimensionByFont,
  GetStringWidth, GetStringRightAlignXOffset, GetStringCenterAlignXOffset,
} from '../src/text';
export type { FontInfo } from '../src/text';

/**
 * option-menu-extras.ts
 * ----------------------
 * Helpers DÉRIVÉS du décomp option_menu.c, complémentaires au fichier
 * AUTO-GENERATED `decomp-data/option-menu-data.ts`. Ces données sont
 * recalculées/structurées spécifiquement pour le rendu web (PNG tile mapping,
 * choices mapping, layouts).
 *
 * Le fichier généré contient les structs/enums/constantes brutes du .c.
 * Ce fichier ajoute les transformations spécifiques rendu web.
 *
 * Cf. decomp-data/option-menu-data.ts (auto) + AUDIT_1_1_GBA.md.
 */

// ─── Frame composition bounds (option_menu.c:647-671 DrawBgWindowFrames) ────
// FillBgTilemapBufferRect bounds (top corners row 0/4, bot corners row 3/19).
export const FRAME_BOUNDS = {
  HEADER:  { tileL: 1, tileT: 0,  tileR: 28, tileB: 3  },
  OPTIONS: { tileL: 1, tileT: 4,  tileR: 28, tileB: 19 },
} as const;

// ─── Frame TILE indices dans PNG text_window/N.png ───────────────────────────
// LoadBgTiles charge 9 tiles séquentiels (offsets 0-8). Tile 4 (centre) skipped.
// PNG layout 24×24 = 3×3 grid 8×8, row-major.
export const FRAME_TILE = {
  TOP_L:  { col: 0, row: 0 },
  TOP_E:  { col: 1, row: 0 },
  TOP_R:  { col: 2, row: 0 },
  LEFT_E: { col: 0, row: 1 },
  RIGHT_E:{ col: 2, row: 1 },
  BOT_L:  { col: 0, row: 2 },
  BOT_E:  { col: 1, row: 2 },
  BOT_R:  { col: 2, row: 2 },
} as const;

// ─── Choices positions (DrawOptionMenuChoice calls, option_menu.c:380-619) ──
export const CHOICE_X_LEFT = 104;
export const CHOICE_X_RIGHT_ALIGN = 198;

// ─── Highlight WIN0 (option_menu.c:374-378 HighlightOptionMenuItem) ─────────
export const HIGHLIGHT_WIN0_X = { left: 16, right: 224 };
export const HIGHLIGHT_WIN0_ROW_HEIGHT = 16;
export const HIGHLIGHT_WIN0_Y_OFFSET = 40;
export const HIGHLIGHT_BLDY = 4;

// ─── Fade timing (option_menu.c:251 in, :360 out) ───────────────────────────
// BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK) → 16 frames @ 60fps
export const FADE_FRAMES = 16;
export const FADE_DURATION_MS = Math.round(FADE_FRAMES * 1000 / 60); // 267ms

// ─── Header text rendering (option_menu.c:621-626 DrawHeaderText) ───────────
export const HEADER_TEXT_X = 8;
export const HEADER_TEXT_Y = 1;
export const ITEM_LABEL_X = 8;
export const ITEM_LABEL_Y_OFFSET = 1;

// ─── Number of frames available (text_window.c WINDOW_FRAMES_COUNT) ─────────
export const WINDOW_FRAMES_COUNT = 20;

// ─── Frame palette load (option_menu.c:198-203) ─────────────────────────────
export const FRAME_PALETTE_PREFIX = 'text_window';

// ─── Menu items mapping label/choices/option key (option_menu.c:79-88) ──────
// `sOptionMenuItemsNames` du décomp = labels seuls. Pour le rendu web on a
// besoin du mapping vers les choices et la clé d'option JS.
export const MENUITEMS_DATA = [
  { id: 'TEXTSPEED',   labelKey: 'gText_TextSpeed',        choices: ['gText_TextSpeedSlow', 'gText_TextSpeedMid', 'gText_TextSpeedFast'], optKey: 'textSpeed' },
  { id: 'BATTLESCENE', labelKey: 'gText_BattleScene',      choices: ['gText_BattleSceneOn', 'gText_BattleSceneOff'], optKey: 'battleSceneOff' },
  { id: 'BATTLESTYLE', labelKey: 'gText_BattleStyle',      choices: ['gText_BattleStyleShift', 'gText_BattleStyleSet'], optKey: 'battleStyle' },
  { id: 'SOUND',       labelKey: 'gText_Sound',            choices: ['gText_SoundMono', 'gText_SoundStereo'], optKey: 'sound' },
  { id: 'BUTTONMODE',  labelKey: 'gText_ButtonMode',       choices: ['gText_ButtonTypeNormal', 'gText_ButtonTypeLR', 'gText_ButtonTypeLEqualsA'], optKey: 'buttonMode' },
  { id: 'FRAMETYPE',   labelKey: 'gText_Frame',            choices: ['gText_FrameType'], optKey: 'windowFrameType' },
  { id: 'CANCEL',      labelKey: 'gText_OptionMenuCancel', choices: [], optKey: '' },
] as const;

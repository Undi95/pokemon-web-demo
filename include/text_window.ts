/**
 * include/text_window.ts — miroir 1:1 de `decomp/include/text_window.h`.
 *
 * Ré-exporte l'API publique de `src/game/text_window.ts` (= les prototypes de
 * `text_window.h`). Les modules qui « incluent text_window.h » importent d'ici.
 */
export {
  WINDOW_FRAMES_COUNT,
  GetWindowFrameTilesPal,
  LoadMessageBoxGfx,
  LoadWindowGfx,
  LoadUserWindowBorderGfx,
  LoadUserWindowBorderGfx_,
  LoadUserWindowBorderGfxOnBg,
  DrawTextBorderOuter,
  DrawTextBorderInner,
  rbox_fill_rectangle,
  GetTextWindowPalette,
  GetOverworldTextboxPalettePtr,
  preloadTextWindowFrames,
} from '../src/text_window';
export type { TilesPal } from '../src/text_window';

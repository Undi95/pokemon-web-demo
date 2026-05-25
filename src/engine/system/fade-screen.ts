/**
 * 1:1 décomp `field_weather.c:FadeScreen(u8 mode, s8 delay)` (l.380).
 *
 * Helper utilisé par TOUTES les scènes pour fade in/out screen. Wrap
 * `BeginNormalPaletteFade(PALETTES_ALL, delay, startY, endY, color)` avec
 * mapping mode → params.
 *
 * Décomp body (= simplified, sans weather palette branch utilisé par
 * RAIN/SNOW/FOG qui n'est pas critique pour notre flow Bourg-en-Vol) :
 *
 *     switch (mode) {
 *     case FADE_FROM_BLACK: fadeColor = RGB_BLACK; fadeOut = FALSE; break;
 *     case FADE_FROM_WHITE: fadeColor = RGB_WHITEALPHA; fadeOut = FALSE; break;
 *     case FADE_TO_BLACK:   fadeColor = RGB_BLACK; fadeOut = TRUE; break;
 *     case FADE_TO_WHITE:   fadeColor = RGB_WHITEALPHA; fadeOut = TRUE; break;
 *     default: return;
 *     }
 *     if (fadeOut)
 *         BeginNormalPaletteFade(PALETTES_ALL, delay, 0, 16, fadeColor);
 *     else
 *         BeginNormalPaletteFade(PALETTES_ALL, delay, 16, 0, fadeColor);
 *
 * Note `delay` argument : 1:1 décomp `BeginNormalPaletteFade` parsing
 * (palette.c:166-175) :
 *   - delay >= 0 : `delayPerStep = delay` (= frames de pause entre brightness
 *     steps). `deltaY = 2` (default). Fade dure ~ (16/2) * (1 + delay) frames.
 *   - delay <  0 : `deltaY = 2 + (-delay)` (= step plus grand). Fade plus rapide.
 *
 * Defaults d'usage dans le décomp :
 *   - Bag/options menus  : delay=0 → 16 frames (= ~267ms à 60Hz)
 *   - Battle transitions : delay=0 ou -1 → faster
 *   - Cinematic moments   : delay=2..4 → slower (= cf Game Freak intro fade)
 *
 * 1:1 décomp `constants/field_weather.h` :
 */
export const FADE_FROM_BLACK = 0;
export const FADE_TO_BLACK = 1;
export const FADE_FROM_WHITE = 2;
export const FADE_TO_WHITE = 3;

import { getRuntime } from '../system/decomp-globals';

/** 1:1 décomp `FadeScreen(u8 mode, s8 delay)` — kick off un fade IN ou OUT
 *  depuis/vers BLACK ou WHITE. À call quand on swap scène ou trigger un
 *  cutscene/cinematic transition. Le caller doit ensuite attendre
 *  `!gPaletteFade.active` (= polling dans une Task ou state machine).
 *
 *  @param mode    FADE_FROM_BLACK / FADE_TO_BLACK / FADE_FROM_WHITE / FADE_TO_WHITE
 *  @param delay   Délai entre steps (= 0 default normal speed ; <0 plus rapide ; >0 plus lent) */
export function FadeScreen(mode: number, delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  let color: number;
  let fadeOut: boolean;
  switch (mode) {
    case FADE_FROM_BLACK: color = 0 /* RGB_BLACK */; fadeOut = false; break;
    case FADE_FROM_WHITE: color = 0x7FFF /* RGB_WHITEALPHA = RGB_WHITE */; fadeOut = false; break;
    case FADE_TO_BLACK:   color = 0 /* RGB_BLACK */; fadeOut = true; break;
    case FADE_TO_WHITE:   color = 0x7FFF /* RGB_WHITEALPHA = RGB_WHITE */; fadeOut = true; break;
    default: return;  // 1:1 décomp early return sans BeginNormalPaletteFade
  }
  if (fadeOut) {
    // 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, delay, 0, 16, fadeColor)`.
    rt.BeginNormalPaletteFade(0xFFFFFFFF, delay, 0, 16, color);
  } else {
    // 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, delay, 16, 0, fadeColor)`.
    rt.BeginNormalPaletteFade(0xFFFFFFFF, delay, 16, 0, color);
  }
}

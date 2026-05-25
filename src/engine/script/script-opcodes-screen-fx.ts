/**
 * script-opcodes-screen-fx.ts — opcodes fade screen + flash 1:1 décomp
 * `field_screen_effect.c` + `palette.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_fadescreen`              (l. 626-631) : FadeScreen(mode, 0) + waitfade.
 *   `ScrCmd_fadescreenspeed`         (l. 633-641) : FadeScreen(mode, speed) + waitfade.
 *   `ScrCmd_fadescreenswapbuffers`   (l. 643-672) : FadeScreenSwap + waitfade.
 *   `ScrCmd_setflashlevel`           (l. 612-624) : SetFlashLevel(level).
 *   `ScrCmd_animateflash`            (l. 605-610) : AnimateFlash(level).
 *
 * Modes 1:1 décomp constants/field_weather.h :
 *   FADE_FROM_BLACK = 0  →  startY=0x10, endY=0, color=BLACK
 *   FADE_TO_BLACK   = 1  →  startY=0, endY=0x10, color=BLACK
 *   FADE_FROM_WHITE = 2  →  startY=0x10, endY=0, color=WHITE
 *   FADE_TO_WHITE   = 3  →  startY=0, endY=0x10, color=WHITE
 *
 * gFlashLevel (overworld.c) : 0 = pas d'obscurité, 7 = obscurité maximale
 * (= ASTUCE FLASH HM). Mask noir avec cercle transparent autour du player.
 */

import { registerOpcode, SetupNativeScript } from './script-runtime';
import { getRuntime } from '../system/decomp-globals';
import { parseValue } from './script-opcodes-helpers';

const FADE_MODE_FROM_BLACK = 0;
const FADE_MODE_TO_BLACK = 1;
const FADE_MODE_FROM_WHITE = 2;
const FADE_MODE_TO_WHITE = 3;

function _resolveFadeMode(arg: string): number {
  if (arg === 'FADE_FROM_BLACK') return FADE_MODE_FROM_BLACK;
  if (arg === 'FADE_TO_BLACK') return FADE_MODE_TO_BLACK;
  if (arg === 'FADE_FROM_WHITE') return FADE_MODE_FROM_WHITE;
  if (arg === 'FADE_TO_WHITE') return FADE_MODE_TO_WHITE;
  return parseValue(arg);
}

function _doFadeScreen(mode: number, _delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp palette.c : start/end/color selon mode.
  const isToBlack = mode === FADE_MODE_TO_BLACK;
  const isToWhite = mode === FADE_MODE_TO_WHITE;
  const isFromBlack = mode === FADE_MODE_FROM_BLACK;
  const isFromWhite = mode === FADE_MODE_FROM_WHITE;
  const startY = (isFromBlack || isFromWhite) ? 0x10 : 0;
  const endY = (isToBlack || isToWhite) ? 0x10 : 0;
  const color = (isToWhite || isFromWhite) ? 'RGB_WHITEALPHA' : 'RGB_BLACK';
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, startY, endY, color);
}

// 1:1 décomp scrcmd.c:ScrCmd_fadescreen (lignes 626-631) :
//   FadeScreen(mode, 0); SetupNativeScript(ctx, IsPaletteNotActive);
registerOpcode('fadescreen', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  // 1:1 décomp : SetupNativeScript(ctx, IsPaletteNotActive) — attend que le fade
  // soit terminé avant de continuer.
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenspeed', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  const speed = parseValue(args[1]);
  _doFadeScreen(mode, speed);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenswapbuffers', (ctx, args) => {
  // 1:1 décomp scrcmd.c:643 — variante qui swap gPlttBufferUnfaded ↔
  // gPaletteDecompressionBuffer avant fade. Pour l'instant : same as fadescreen.
  // Dette : implémenter le swap buffer 1:1 strict palette.c.
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

// ─── Flash (1:1 décomp ScrCmd_setflashlevel/animateflash) ───────────────────

/** 1:1 décomp `gFlashLevel` (overworld.c). 0 = pas d'obscurité, 7 = obscurité
 *  maximale (= ASTUCE FLASH HM). Affiche une mask noire avec un cercle
 *  transparent autour du player. Notre port stocke ici, le rendering field
 *  scene lit cette valeur pour appliquer le mask. */
let _gFlashLevel = 0;

// `setflashlevel` early stub (= last-wins, real impl ci-dessous écrase).
registerOpcode('setflashlevel', (_ctx, _args) => false);

// `animateflash` early stub.
registerOpcode('animateflash', (_ctx, _args) => false);

// 1:1 décomp ScrCmd_setflashlevel (scrcmd.c:612-624) :
//   SetFlashLevel(VarGet(level)).
// Level 0 = pas d'obscurité (= salle illuminée), 7 = obscurité maximale.
registerOpcode('setflashlevel', (_ctx, args) => {
  const level = parseValue(args[0] ?? '0') & 0xF;
  _gFlashLevel = level;
  (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
  return false;
});

// 1:1 décomp ScrCmd_animateflash (scrcmd.c:605-610) :
//   AnimateFlash(level) ; ScriptContext_Stop ; return TRUE.
// Fade animation entre l'ancien level et le nouveau (= radial transition).
registerOpcode('animateflash', (ctx, args) => {
  const targetLevel = parseValue(args[0] ?? '0') & 0xF;
  const startLevel = _gFlashLevel;
  let frame = 0;
  const totalFrames = 16;
  const poll = (): boolean => {
    frame++;
    // Lerp linéaire entre startLevel et targetLevel.
    _gFlashLevel = Math.round(startLevel + (targetLevel - startLevel) * (frame / totalFrames));
    (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
    if (frame >= totalFrames) {
      _gFlashLevel = targetLevel;
      (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
      return true;
    }
    return false;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

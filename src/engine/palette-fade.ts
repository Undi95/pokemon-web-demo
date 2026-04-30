/**
 * palette-fade.ts
 * ----------------
 * Helper Phaser pour reproduire `BeginNormalPaletteFade` du décomp (palette.c).
 *
 * Le décomp anime les couleurs PLTT (palette) entre 2 valeurs (startY/endY)
 * sur N frames vers une couleur cible (RGB_BLACK/RGB_WHITEALPHA/...).
 *
 * Notre simplification web : Phaser camera.fadeIn/fadeOut wrappe le visuel
 * équivalent (toute la scène fade vers/depuis la couleur).
 *
 * Args décomp (1:1) :
 *   palettes  : bitmask des palettes affectées (PALETTES_ALL=0xFFFFFFFF, etc.)
 *   delay     : frames entre chaque pas (généralement 0)
 *   startY    : alpha initial (0=normal, 16=fully tinted)
 *   endY      : alpha final
 *   color     : couleur tint (RGB_BLACK, RGB_WHITEALPHA, etc.)
 *
 * Conversion web :
 *   fade duration ms ≈ |endY - startY| * (delay+1) * 16ms
 *   color RGB_BLACK = (0,0,0), RGB_WHITEALPHA = (255,255,255), etc.
 */
import Phaser from 'phaser';

/** Couleurs tint connues (extraites de include/constants/rgb.h via _common-constants). */
const RGB_COLORS: Record<string, [number, number, number]> = {
  RGB_BLACK: [0, 0, 0],
  RGB_WHITE: [255, 255, 255],
  RGB_WHITEALPHA: [255, 255, 255],
  RGB_RED: [248, 0, 0],
  RGB_GREEN: [0, 248, 0],
  RGB_BLUE: [0, 0, 248],
};

export interface PaletteFadeOpts {
  delay?: number;       // frames entre pas (default 0)
  startY: number;       // 0-16
  endY: number;         // 0-16
  color?: string;       // 'RGB_BLACK' etc. (default RGB_BLACK)
}

/**
 * Wrap Phaser camera fade en respectant les semantics décomp.
 * Si startY > endY = fade IN (de tint vers normal). Si startY < endY = fade OUT.
 */
export function beginPaletteFade(scene: Phaser.Scene, opts: PaletteFadeOpts): Promise<void> {
  const delay = opts.delay ?? 0;
  const color = RGB_COLORS[opts.color ?? 'RGB_BLACK'] ?? [0, 0, 0];
  const steps = Math.abs(opts.endY - opts.startY);
  const durationMs = Math.max(16, steps * (delay + 1) * 16); // au moins 1 frame

  return new Promise((resolve) => {
    if (opts.startY > opts.endY) {
      // fade IN : tint → normal
      scene.cameras.main.fadeIn(durationMs, color[0], color[1], color[2]);
      scene.cameras.main.once('camerafadeincomplete', () => resolve());
    } else if (opts.startY < opts.endY) {
      // fade OUT : normal → tint
      scene.cameras.main.fadeOut(durationMs, color[0], color[1], color[2]);
      scene.cameras.main.once('camerafadeoutcomplete', () => resolve());
    } else {
      resolve(); // pas de fade
    }
  });
}

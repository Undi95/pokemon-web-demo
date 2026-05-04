/**
 * palette-fade.ts
 * ----------------
 * ⚠️ @deprecated — Phase D-cleanup audit session 83.
 *
 * Wrapper Phaser legacy de `BeginNormalPaletteFade`. Conservé temporairement
 * pour les 2 scenes Phaser legacy (`BirchSpeechScene.ts`, `MainMenuScene.ts`)
 * qui n'ont pas encore été migrées vers le runtime décomp natif.
 *
 * **NE PAS utiliser dans du nouveau code**. Utiliser à la place :
 *   `getRuntime()?.BeginNormalPaletteFade(palettes, delay, startY, endY, color)`
 * (= 1:1 décomp src/palette.c, écrit gPlttBufferUnfaded → Faded → PLTT register
 *  via TransferPlttBuffer au VBlank).
 *
 * Migration plan (= future session) :
 *   1. Migrer BirchSpeechScene → CB2_NewGameBirchSpeech_* state machine
 *      (= déjà transpilée dans `main_menu-callbacks-auto.ts`, juste à wirer).
 *   2. Migrer MainMenuScene → CB2_InitMainMenu (= déjà transpilé, juste à
 *      remplacer Phaser scene par GameScene + CB2 wiring).
 *   3. Supprimer ce fichier (= duplication parallèle au CB2 décomp éliminée).
 *
 * Args décomp (1:1) :
 *   palettes  : bitmask des palettes affectées (PALETTES_ALL=0xFFFFFFFF, etc.)
 *   delay     : frames entre chaque pas (généralement 0)
 *   startY    : alpha initial (0=normal, 16=fully tinted)
 *   endY      : alpha final
 *   color     : couleur tint (RGB_BLACK, RGB_WHITEALPHA, etc.)
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
 *
 * ⚠️ @deprecated — utiliser `getRuntime().BeginNormalPaletteFade()` à la place.
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

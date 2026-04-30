import Phaser from 'phaser';
import { composeGbaTilemap } from '../util/compose-tilemap';

const BASE = '/decomp/em/intro';

/**
 * Scene 0 — Copyright screen (Game Freak / Nintendo / Creatures Inc.)
 *
 * Durée totale 157 frames @ 60fps = 2.6s
 *   - Fade in  : 16 frames = 267ms
 *   - Hold     : 124 frames = 2067ms
 *   - Fade out : 16 frames = 267ms
 *
 * Assets :
 *   - copyright.png = atlas 312×8 (39 tiles 8×8) palette grayscale
 *   - copyright.bin = tilemap 32×32 entries u16
 *
 * Skip : appui sur n'importe quelle touche → saute vers GameScene.
 */
export class CopyrightScene extends Phaser.Scene {
  private skipped = false;

  constructor() {
    super({ key: 'CopyrightScene' });
  }

  preload() {
    this.load.image('intro-copyright-atlas', `${BASE}/copyright.png`);
    this.load.binary('intro-copyright-bin', `${BASE}/copyright.bin`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    const tilemapBuf = this.cache.binary.get('intro-copyright-bin') as ArrayBuffer;
    composeGbaTilemap(this, 'intro-copyright-atlas', tilemapBuf, 'intro-copyright', {
      widthTiles: 32,
      heightTiles: 32,
    });

    const img = this.add.image(0, 0, 'intro-copyright').setOrigin(0, 0);
    img.setAlpha(0);

    // Fade in 16 frames
    this.tweens.add({ targets: img, alpha: 1, duration: 267, ease: 'Linear' });

    // Hold 124 frames, puis fade out 16 frames → GameScene
    this.time.delayedCall(267 + 2067, () => {
      if (this.skipped) return;
      this.tweens.add({
        targets: img,
        alpha: 0,
        duration: 267,
        ease: 'Linear',
        onComplete: () => this.goToGame(),
      });
    });

    // Skip sur n'importe quelle touche
    this.input.keyboard?.on('keydown', () => this.skip());
  }

  private skip(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.tweens.killAll();
    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.goToGame();
    });
  }

  private goToGame(): void {
    this.scene.start('GameScene');
  }
}

import Phaser from 'phaser';
import { getRuntime } from '../engine/decomp-globals';

/**
 * Overlay debug affiché sur TOUTES les scènes.
 * Remplace le statusText vert local de GameScene par un overlay global.
 */
export class DebugOverlayScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'DebugOverlayScene', active: true });
  }

  create() {
    this.statusText = this.add.text(2, 2, 'debug...', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#00FF88',
      backgroundColor: '#00000088',
    }).setScrollFactor(0).setDepth(999999);

    // Met à jour toutes les 30 frames (~0.5s)
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateDebug(),
      loop: true,
    });
  }

  private updateDebug() {
    try {
      const rt = getRuntime();
      this.statusText.setText(
        `frame:${rt.gIntroFrameCounter} tasks:${rt.gTasks.size} sprites:${rt.gSprites.size} fps:${Math.round(this.game.loop.actualFps)}`,
      );
    } catch {
      this.statusText.setText(`fps:${Math.round(this.game.loop.actualFps)}`);
    }
  }
}

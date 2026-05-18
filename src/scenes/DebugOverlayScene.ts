import Phaser from 'phaser';
import { getRuntime } from '../engine/decomp-globals';

/**
 * Overlay debug affiché sur TOUTES les scènes.
 * Remplace le statusText vert local de GameScene par un overlay global.
 *
 * MASQUÉ PAR DÉFAUT (sinon il recouvre la vraie barre de titre du jeu et
 * trompe la lecture visuelle / l'A/B vs ROM). Toggle via la touche « & »
 * (AZERTY : touche du « 1 », non-shiftée).
 */
export class DebugOverlayScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private _visible = false;
  private _keyHandler?: (e: KeyboardEvent) => void;

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
    // Masqué par défaut.
    this.statusText.setVisible(this._visible);

    // Met à jour toutes les 30 frames (~0.5s) — seulement si visible.
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateDebug(),
      loop: true,
    });

    // Toggle « & » (window listener = marche quelle que soit la scène
    // focus). Cleanup au SHUTDOWN/DESTROY de la scène.
    this._keyHandler = (e: KeyboardEvent): void => {
      if (e.key === '&') {
        this._visible = !this._visible;
        this.statusText.setVisible(this._visible);
        if (this._visible) this.updateDebug();
      }
    };
    window.addEventListener('keydown', this._keyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    });
  }

  private updateDebug() {
    if (!this._visible) return;
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

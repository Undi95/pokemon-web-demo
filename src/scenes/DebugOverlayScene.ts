import Phaser from 'phaser';
import { getRuntime } from '../engine/decomp-globals';

/**
 * Overlay debug affiché sur TOUTES les scènes.
 * Remplace le statusText vert local de GameScene par un overlay global.
 *
 * MASQUÉ PAR DÉFAUT (sinon il recouvre la vraie barre de titre du jeu et
 * trompe la lecture visuelle / l'A/B vs ROM).
 *
 * Touches (= AZERTY top-row, non-shiftées) :
 *   « & » — toggle visibilité du devmenu.
 *   « é » — freeze / unfreeze la frame en cours (= `runtime.paused`).
 *           Actif uniquement quand le devmenu est visible. Utile pour
 *           figer un bug visuel et le montrer sans qu'il bouge.
 *   « " » — toggle noclip (= player marche à travers tout). Actif
 *           uniquement quand le devmenu est visible. Bypass dans
 *           `player-avatar.checkPlayerCollision` via le flag global
 *           `__devNoclip`.
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
    // Le scheduler de Phaser tourne sur `game.loop`, indépendant de
    // `runtime.paused` → le tag [FROZEN] continue de s'afficher correctement
    // quand on freeze la frame logique.
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateDebug(),
      loop: true,
    });

    // Window listener (= marche quelle que soit la scène focus). Cleanup
    // au SHUTDOWN/DESTROY de la scène.
    this._keyHandler = (e: KeyboardEvent): void => {
      // « & » — toggle visibilité, toujours actif.
      if (e.key === '&') {
        this._visible = !this._visible;
        this.statusText.setVisible(this._visible);
        if (this._visible) this.updateDebug();
        return;
      }
      // Les commandes ci-dessous = uniquement quand devmenu ouvert
      // (= évite trigger accidentel pendant gameplay normal).
      if (!this._visible) return;
      // « é » — freeze runtime tick (= rt.paused gate `tickFixed`,
      // cf. decomp-runtime.ts:1976). Phaser garde le rendu actif
      // → la dernière frame logique reste visible figée.
      if (e.key === 'é') {
        const rt = getRuntime();
        rt.paused = !rt.paused;
        this.updateDebug();
        return;
      }
      // « " » — toggle noclip. Bypass dans player-avatar.ts via flag global.
      if (e.key === '"') {
        const g = globalThis as unknown as { __devNoclip?: boolean };
        g.__devNoclip = !g.__devNoclip;
        this.updateDebug();
        return;
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
      const frozen = rt.paused ? ' [FROZEN]' : '';
      const noclip = (globalThis as unknown as { __devNoclip?: boolean }).__devNoclip
        ? ' [NOCLIP]' : '';
      this.statusText.setText(
        `frame:${rt.gIntroFrameCounter} tasks:${rt.gTasks.size} sprites:${rt.gSprites.size} fps:${Math.round(this.game.loop.actualFps)}${frozen}${noclip}`,
      );
    } catch {
      this.statusText.setText(`fps:${Math.round(this.game.loop.actualFps)}`);
    }
  }
}

import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';

export class MenuOverlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuOverlayScene' });
  }

  create() {
    // Dim background
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.5);

    // Menu panel (right side, retro Gen 3 style)
    const panelW = 96;
    const panelH = 180;
    const panelX = GAME_W - panelW - 4;
    const panelY = 4;
    const panel = this.add.rectangle(
      panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 0xf8f8f8, 1
    );
    panel.setStrokeStyle(2, 0x202020);

    const entries = [
      'POKeDEX',
      'POKeMON',
      'SAC',
      'DRESSEUR',
      'OPTIONS',
      'SAUVEGARDE',
      'FERMER'
    ];
    entries.forEach((entry, i) => {
      this.add.text(panelX + 8, panelY + 10 + i * 22, entry, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#202020'
      });
    });

    // Selection arrow
    this.add.text(panelX + 2, panelY + 10, '>', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#202020'
    });

    // Hint
    this.add.text(8, GAME_H - 12, '[B] ferme le menu', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#ffffff'
    });

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
        this.scene.stop();
        this.scene.resume('OverworldScene');
      }
    });
  }
}

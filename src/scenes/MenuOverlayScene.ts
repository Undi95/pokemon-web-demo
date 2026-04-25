import Phaser from 'phaser';
import { GAME_W } from '../main';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { createMenu } from '../engine/menu';
import { applyAlphaFromTopLeft } from '../util/image-alpha';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';
import { gameState } from '../engine/game-state';

const TEXTBOX_URL = '/decomp/em/ui/text_window/1.png';
const STRINGS_URL = '/decomp/em/strings.json';

export class MenuOverlayScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuOverlayScene' }); }

  preload() {
    if (!this.textures.exists('ui-textbox-src')) this.load.image('ui-textbox-src', TEXTBOX_URL);
    if (!this.cache.json.has('strings')) this.load.json('strings', STRINGS_URL);
    preloadBitmapFont(this);
    preloadDialogueAssets(this);
  }

  create() {
    setupBitmapFont(this);
    applyAlphaFromTopLeft(this, 'ui-textbox-src', 'ui-textbox-a');

    const s = this.cache.json.get('strings') as Record<string, string>;
    const playerName = gameState.playerName || 'UNDI';

    // Start menu Emerald : 7 options (nom joueur inclus comme "trainer card")
    const labels = [
      'POKéDEX',
      'POKéMON',
      'SAC',
      playerName,
      s.gText_MenuSave ?? 'SAUVER',
      s.gText_MenuOption ?? 'OPTIONS',
      'RETOUR'
    ];

    const panelW = 104;
    const panelX = GAME_W - panelW - 4;
    const panelY = 4;

    const menu = createMenu({
      scene: this, x: panelX, y: panelY, width: panelW, labels,
      onSelect: (_idx, label) => {
        if (label === 'RETOUR') { this.close(menu); return; }
        if (label === 'SAUVER' || label === (s.gText_MenuSave ?? '')) {
          this.saveGame(menu);
          return;
        }
        // POKéDEX / POKéMON / SAC / [nom] / OPTIONS : à implémenter
      },
      onCancel: () => this.close(menu)
    });
  }

  private async saveGame(menu: { destroy: () => void }) {
    menu.destroy();
    gameState.save();
    const dialogue = new DialogueBox(this);
    await dialogue.show('Partie sauvegardée!');
    this.close({ destroy: () => { } });
  }

  private close(menu: { destroy: () => void }) {
    menu.destroy();
    this.scene.stop();
    this.scene.resume('OverworldScene');
  }
}

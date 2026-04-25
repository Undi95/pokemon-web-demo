import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { createMenu } from '../engine/menu';
import { applyAlphaFromTopLeft } from '../util/image-alpha';
import { gameState } from '../engine/game-state';

const TEXTBOX_URL = '/decomp/em/ui/text_window/1.png';
const STRINGS_URL = '/decomp/em/strings.json';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  preload() {
    this.load.image('ui-textbox-src', TEXTBOX_URL);
    if (!this.cache.json.has('strings')) this.load.json('strings', STRINGS_URL);
    preloadBitmapFont(this);
  }

  create() {
    this.cameras.main.setBackgroundColor('#202030');
    setupBitmapFont(this);
    applyAlphaFromTopLeft(this, 'ui-textbox-src', 'ui-textbox-a');

    const s = this.cache.json.get('strings') as Record<string, string>;
    const hasSave = gameState.load();
    const labels: string[] = [];
    const actions: string[] = [];
    if (hasSave) { labels.push(s.gText_MainMenuContinue); actions.push('CONTINUE'); }
    labels.push(s.gText_MainMenuNewGame); actions.push('NEW_GAME');
    labels.push(s.gText_MainMenuOption); actions.push('OPTION');

    const panelW = 180;
    const panelX = (GAME_W - panelW) / 2;
    const panelY = (GAME_H - labels.length * 14 - 14) / 2;

    createMenu({
      scene: this, x: panelX, y: panelY, width: panelW, labels,
      onSelect: (idx) => {
        const a = actions[idx];
        if (a === 'NEW_GAME') this.scene.start('BirchSpeechScene');
        else if (a === 'CONTINUE') {
          const m = gameState.map ?? { name: 'LittlerootTown', x: 10, y: 10 };
          this.scene.start('OverworldScene', { mapName: m.name, spawnX: m.x, spawnY: m.y });
        }
        // OPTION : TODO
      }
    });
  }
}

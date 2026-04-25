import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { applyAlphaFromTopLeft } from '../util/image-alpha';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { createMenu } from '../engine/menu';

const BIRCH_URL = '/decomp/em/boot/birch_speech/birch.png';
const STRINGS_URL = '/decomp/em/strings.json';

export class BirchSpeechScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private s!: Record<string, string>;

  constructor() { super({ key: 'BirchSpeechScene' }); }

  preload() {
    this.load.image('birch-src', BIRCH_URL);
    if (!this.cache.json.has('strings')) this.load.json('strings', STRINGS_URL);
    preloadDialogueAssets(this);
    preloadBitmapFont(this);
  }

  create() {
    this.cameras.main.setBackgroundColor('#0040a0');
    setupBitmapFont(this);
    this.s = this.cache.json.get('strings') as Record<string, string>;
    this.dialogue = new DialogueBox(this);

    applyAlphaFromTopLeft(this, 'birch-src', 'birch-a');
    this.add.image(GAME_W / 2, GAME_H / 2 - 20, 'birch-a');

    void this.runSpeech();
  }

  private async runSpeech() {
    await this.dialogue.show(this.s.gText_Birch_Welcome);
    await this.dialogue.show(this.s.gText_Birch_MainSpeech);
    await this.dialogue.show(this.s.gText_Birch_AndYouAre);
    const gender = await this.askGender();
    localStorage.setItem('em_gender', gender);
    this.scene.start('NamingScene');
  }

  private async askGender(): Promise<'MALE' | 'FEMALE'> {
    await this.dialogue.show(this.s.gText_Birch_BoyOrGirl);
    return new Promise((resolve) => {
      const labels = [this.s.gText_BirchBoy, this.s.gText_BirchGirl];
      const panelW = 80;
      const menu = createMenu({
        scene: this,
        x: GAME_W / 2 - panelW / 2, y: GAME_H / 2 - 20,
        width: panelW, labels,
        depth: 500000,
        onSelect: (idx) => {
          menu.destroy();
          resolve(idx === 0 ? 'MALE' : 'FEMALE');
        }
      });
    });
  }
}

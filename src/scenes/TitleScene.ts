import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { registerTransparentImage } from '../util/sprite-transparency';
import { primeAudio, playMidiLoop } from '../engine/music';

/**
 * Écran titre.
 *
 * Rayquaza + clouds : composés correctement via `render-title.mjs`
 * (tileset + tilemap + palette 4bpp).
 *
 * Logo Pokémon : TODO — le format 8bpp du logo avec tile IDs qui
 * débordent du char block (0..798) n'est pas encore géré. On affiche
 * l'atlas tel quel en placeholder. Voir DEV_LOG section "Title logo 8bpp".
 */

const BASE = '/decomp/em/boot/title_screen';
const CRY_URL = '/decomp/em/cries/rayquaza.wav';

export class TitleScene extends Phaser.Scene {
  private pressStart?: Phaser.GameObjects.Image;
  private transitioning = false;

  constructor() { super({ key: 'TitleScene' }); }

  preload() {
    this.load.image('title-rayquaza', `${BASE}/rayquaza-rendered.png`);
    this.load.image('title-clouds', `${BASE}/clouds-rendered.png`);
    this.load.image('title-logo', `${BASE}/pokemon_logo.png`); // atlas brut pour l'instant
    this.load.image('title-version', `${BASE}/emerald_version.png`);
    this.load.image('title-press-start', `${BASE}/press_start.png`);
    this.load.audio('cry-rayquaza', CRY_URL);
  }

  create() {
    this.cameras.main.setBackgroundColor('#4878b8');

    // Rayquaza centré, l'image rendue inclut déjà le fond dégradé
    registerTransparentImage(this, 'title-rayquaza', 'title-rayquaza-a');
    const rq = this.add.image(GAME_W / 2, GAME_H / 2, 'title-rayquaza-a');
    rq.setScale(0.8);

    // Clouds par-dessus Rayquaza
    registerTransparentImage(this, 'title-clouds', 'title-clouds-a');
    const cl = this.add.image(GAME_W / 2, GAME_H / 2 + 10, 'title-clouds-a');
    cl.setScale(0.8);
    cl.setAlpha(0.7);

    // Version "ÉMERAUDE" (sprite simple)
    registerTransparentImage(this, 'title-version', 'title-version-a');
    this.add.image(GAME_W / 2 + 30, 80, 'title-version-a');

    // "APPUYEZ SUR START" clignotant
    registerTransparentImage(this, 'title-press-start', 'title-press-start-a');
    this.pressStart = this.add.image(GAME_W / 2, GAME_H - 40, 'title-press-start-a');
    this.tweens.add({
      targets: this.pressStart, alpha: 0.3,
      duration: 650, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    this.input.keyboard?.once('keydown', async () => {
      if (this.transitioning) return;
      this.transitioning = true;
      await primeAudio();
      try { this.sound.play('cry-rayquaza', { volume: 0.7 }); } catch { /* ignore */ }
      void playMidiLoop('/decomp/em/music/mus_title.mid');
      this.time.delayedCall(900, () => this.scene.start('MainMenuScene'));
    });
  }
}

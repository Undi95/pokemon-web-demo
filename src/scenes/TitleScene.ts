import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { registerTransparentImage } from '../util/sprite-transparency';
import { playMidiLoop, playCry } from '../engine/music';

/**
 * Écran titre Pokémon Émeraude.
 *
 * Cf. audit Agent (session 36) — `D:\Projet 1\decomps\pokeemeraude\src\title_screen.c` :
 *   - BG0 = Rayquaza tilemap (rayquaza.png + rayquaza.bin)
 *   - BG1 = Clouds parallax (clouds.png + clouds.bin) avec wave scanline effect
 *   - BG2 = Logo Pokémon 8bpp affine (pokemon_logo.png)
 *   - Sprites OAM : Version Emerald (2×64×32) + Press Start (5×32×8)
 *
 * Timeline approximative :
 *   - Frame 0-50   : fade in noir → titre
 *   - Frame 50-256 : Rayquaza monte du bas (Phase1)
 *   - Frame 80    : Logo shine #1 traverse
 *   - Frame 192   : Logo shine #2 traverse
 *   - Frame 256+  : Version Emerald apparaît + reveal
 *   - Frame 400+  : Press Start blink + input ready
 *
 * Audio : prime déjà fait par BootScene → playMidiLoop direct au create.
 *
 * SIMPLIFICATIONS MVP :
 *   - Logo Pokémon 8bpp affine BG → atlas crop simple (TODO 1:1 avec affine matrix)
 *   - Wave scanline effect clouds → static (TODO shader vertex displacement)
 *   - Logo shine animations → skip pour cette session
 */

const BASE = '/decomp/em/boot/title_screen';

export class TitleScene extends Phaser.Scene {
  private pressStart?: Phaser.GameObjects.Image;
  private transitioning = false;

  constructor() { super({ key: 'TitleScene' }); }

  preload() {
    this.load.image('title-rayquaza', `${BASE}/rayquaza-rendered.png`);
    this.load.image('title-clouds', `${BASE}/clouds-rendered.png`);
    this.load.image('title-logo', `${BASE}/pokemon_logo-rendered.png`); // pré-rendu existant
    this.load.image('title-version', `${BASE}/emerald_version.png`);
    this.load.image('title-press-start', `${BASE}/press_start.png`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // 1. Rayquaza monte du bas (Phase1 → Phase2 du décomp)
    registerTransparentImage(this, 'title-rayquaza', 'title-rayquaza-a');
    const rq = this.add.image(GAME_W / 2, GAME_H + 80, 'title-rayquaza-a');
    rq.setScale(0.8).setDepth(1);
    this.tweens.add({
      targets: rq, y: GAME_H / 2, duration: 2500, ease: 'Quad.Out',
    });

    // 2. Clouds par-dessus Rayquaza (alpha 0.7 pour effet brouillard)
    registerTransparentImage(this, 'title-clouds', 'title-clouds-a');
    const cl = this.add.image(GAME_W / 2, GAME_H / 2 + 10, 'title-clouds-a');
    cl.setScale(0.8).setAlpha(0.7).setDepth(2);

    // 3. Logo Pokémon (apparaît après remontée Rayquaza)
    registerTransparentImage(this, 'title-logo', 'title-logo-a');
    const logo = this.add.image(GAME_W / 2, 50, 'title-logo-a');
    logo.setScale(0.55).setAlpha(0).setDepth(3);
    this.tweens.add({
      targets: logo, alpha: 1, duration: 800, delay: 1500, ease: 'Linear',
    });

    // 4. Version "ÉMERAUDE" (apparaît avec slide up)
    registerTransparentImage(this, 'title-version', 'title-version-a');
    const version = this.add.image(GAME_W / 2 + 30, 95, 'title-version-a');
    version.setAlpha(0).setDepth(3);
    this.tweens.add({
      targets: version, alpha: 1, y: 80, duration: 600, delay: 2300, ease: 'Quad.Out',
    });

    // 5. "APPUYEZ SUR START" clignotant (apparaît tout à la fin)
    registerTransparentImage(this, 'title-press-start', 'title-press-start-a');
    this.pressStart = this.add.image(GAME_W / 2, GAME_H - 40, 'title-press-start-a');
    this.pressStart.setAlpha(0).setDepth(3);
    this.time.delayedCall(3000, () => {
      if (!this.pressStart) return;
      this.tweens.add({
        targets: this.pressStart, alpha: 1, duration: 400,
      });
      // Blink (period 32 frames = 533ms d'après audit décomp `& 16` bit toggle)
      this.tweens.add({
        targets: this.pressStart, alpha: 0.3,
        duration: 533, yoyo: true, repeat: -1, ease: 'Sine.InOut',
        delay: 400,
      });
    });

    // 6. Cri Rayquaza (à l'apparition du logo) + musique titre
    this.time.delayedCall(800, () => {
      try { playCry('rayquaza'); } catch { /* ignore */ }
    });
    void playMidiLoop('/decomp/em/music/mus_title.mid');

    // 7. Press Start input → MainMenuScene
    this.input.keyboard?.once('keydown', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());
  }

  private startGame(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.fadeOut(400, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}

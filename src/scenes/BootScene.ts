import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { primeAudio } from '../engine/music';

/**
 * Splash de boot : 1 click pour prime l'audio (autoplay policy browser),
 * puis lance IntroScene avec son.
 *
 * Sans cette scène, le user gesture devrait être sur IntroScene → l'utilisateur
 * doit cliquer pendant que la cinématique joue, et le clic skip aussi (mauvaise UX).
 *
 * Ici : écran "Cliquez pour démarrer" → click → primeAudio() → start IntroScene.
 * Plus aucune interaction nécessaire pendant l'intro.
 */
export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    const title = this.add.text(GAME_W / 2, GAME_H / 2 - 16, 'Pokémon Émeraude', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);

    const prompt = this.add.text(GAME_W / 2, GAME_H / 2 + 16, '▶ Click pour démarrer', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt, alpha: 0.4, duration: 600, yoyo: true, repeat: -1,
      ease: 'Sine.InOut',
    });

    const startBoot = async () => {
      this.input.removeAllListeners();
      title.setText('Chargement audio...');
      prompt.setVisible(false);
      await primeAudio();
      this.scene.start('IntroScene');
    };

    this.input.once('pointerdown', startBoot);
    this.input.keyboard?.once('keydown', startBoot);
  }
}

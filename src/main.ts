import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { TitleScene } from './scenes/TitleScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { BirchSpeechScene } from './scenes/BirchSpeechScene';
import { NamingScene } from './scenes/NamingScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { MenuOverlayScene } from './scenes/MenuOverlayScene';

export const TILE_SIZE = 16;
// Résolution NATIVE Pokemon Émeraude GBA = 240×160 px = 15×10 tiles de 16 px.
// Le décomp utilise des coords pixel exactes (textbox à x=16, y=120, etc.) qui
// ne sont valides QUE pour cette résolution. Le zoom Phaser fait l'upscaling
// pour l'affichage, sans toucher aux coords logiques internes.
export const MAP_W = 15;
export const MAP_H = 10;
export const GAME_W = MAP_W * TILE_SIZE; // 240
export const GAME_H = MAP_H * TILE_SIZE; // 160

const DEFAULT_ZOOM = 4;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  zoom: DEFAULT_ZOOM,
  pixelArt: true,
  backgroundColor: '#000000',
  scene: [BootScene, IntroScene, TitleScene, MainMenuScene, BirchSpeechScene, NamingScene, OverworldScene, BattleScene, MenuOverlayScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  }
};

const game = new Phaser.Game(config);

// Expose contrôle zoom à window pour les boutons HTML.
(window as unknown as { setGameZoom: (z: number) => void }).setGameZoom = (z: number) => {
  game.scale.setZoom(Math.max(1, Math.min(8, z)));
};

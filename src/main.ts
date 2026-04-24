import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { MenuOverlayScene } from './scenes/MenuOverlayScene';

export const TILE_SIZE = 16;
export const MAP_W = 20;
export const MAP_H = 15;
export const GAME_W = MAP_W * TILE_SIZE;
export const GAME_H = MAP_H * TILE_SIZE;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  zoom: 3,
  pixelArt: true,
  backgroundColor: '#000000',
  scene: [OverworldScene, BattleScene, MenuOverlayScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  }
};

new Phaser.Game(config);

import Phaser from 'phaser';
import { TestGbaScene } from './scenes/TestGbaScene';
import { GameScene } from './scenes/GameScene';
import { DebugOverlayScene } from './scenes/DebugOverlayScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { BirchSpeechScene } from './scenes/BirchSpeechScene';
import { NamingScene } from './scenes/NamingScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { MenuOverlayScene } from './scenes/MenuOverlayScene';
import { OptionMenuScene } from './scenes/OptionMenuScene';

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

// ⚠️ Phase 0+ : la "ROM" Pokemon Émeraude tourne intégralement dans GameScene
// (= 1:1 décomp `AgbMain` boot loop). TestGbaScene reste en 1ère position pour
// tester l'engine GBA + audio M4A sans déclencher la chaîne de scènes.
//
// Toutes les anciennes scenes Phaser custom (IntroScene, TitleScene, MainMenuScene,
// BirchSpeechScene, NamingScene, OverworldScene, BattleScene, IntroSceneGba,
// IntroScene2Gba, TitleSceneGba, BootScene, OptionMenuScene, MenuOverlayScene)
// sont conservées sur disque mais sorties du scene array — elles seront soit
// portées vers le boot loop décomp (= Tasks transcrites), soit supprimées.
//
// Boot flow Phase 0c+ :
//   TestGbaScene (1er) → click/key → GameScene → copyright → intro → title → MainMenuScene
//   GameScene → init Gba + DecompRuntime + audio → SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
//             → tickFixed 60Hz → toute la chaîne CB2/Task décomp se déroule.
//   DebugOverlayScene : overlay global (fps / frame / tasks / sprites) sur toutes les scènes.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  zoom: DEFAULT_ZOOM,
  pixelArt: true,
  backgroundColor: '#000000',
  scene: [TestGbaScene, GameScene, MainMenuScene, BirchSpeechScene, NamingScene, OverworldScene, BattleScene, MenuOverlayScene, OptionMenuScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  // 1:1 GBA = 60Hz strict. forceSetTimeOut:true = bypass requestAnimationFrame
  // qui peut throttle à 30Hz selon vsync/tab. Avec setTimeout(16.67), Phaser
  // tick exactement 60 fois/sec → audio + animations + frame counter alignés.
  // Sans ça, music/sons/cris désynchronisent par rapport à la logique 60Hz.
  fps: {
    target: 60,
    forceSetTimeOut: true,
    smoothStep: false,
  },
};

const game = new Phaser.Game(config);

// Lance l'overlay debug en parallèle sur toutes les scènes
void game.scene.add('DebugOverlayScene', DebugOverlayScene, true);

// Expose contrôle zoom à window pour les boutons HTML.
(window as unknown as { setGameZoom: (z: number) => void }).setGameZoom = (z: number) => {
  game.scale.setZoom(Math.max(1, Math.min(8, z)));
};

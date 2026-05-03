import Phaser from 'phaser';

// ─── Dev cache-bust : monkey-patch fetch() pour ajouter ?_cb=<bootTimestamp>
// aux URLs locales (relatives ou same-origin). Chaque rechargement de page
// = nouveau timestamp → contourne HTTP cache du browser sur les assets PNG/.bin/
// .pal/.wav/.json/.mid. Évite les bugs de cache stale en dev (ex: vieux tilemap
// chargé alors qu'on vient de modifier l'extracteur).
//
// Production (import.meta.env.PROD) : skip — laissons le cache normal.
if (!import.meta.env.PROD) {
  const _origFetch = window.fetch.bind(window);
  const _bootCb = String(Date.now());
  window.fetch = (input, init) => {
    try {
      const u = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
      // Local URL = relative path, or same origin /decomp/* / /src/* etc.
      const isLocal = u.startsWith('/') || u.startsWith(window.location.origin);
      if (isLocal && !u.includes('_cb=')) {
        const sep = u.includes('?') ? '&' : '?';
        const newUrl = `${u}${sep}_cb=${_bootCb}`;
        return _origFetch(newUrl, init);
      }
    } catch { /* fallthrough */ }
    return _origFetch(input as any, init);
  };
}

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
import { createAudioDevtool } from './util/audio-devtool';
import './util/remap-modal'; // exposes window.openRemapModal for the topbar button

// Audio devtool panel (top-right corner). Dev only. Disable via
// localStorage.setItem('audioDevtool', 'off').
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createAudioDevtool());
  } else {
    createAudioDevtool();
  }
}

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
  // Restrict input listeners to the canvas only (= clicks/keys outside the
  // game window don't start/affect the game). Default Phaser behavior is to
  // listen window-wide which interferes with the audio devtool topbar.
  input: {
    windowEvents: false,
  },
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

// Pas de pause sur visibilitychange : retiré sur demande. L'onglet en arrière-plan
// laisse tourner game + musique. Si le MIDI loop boucle pendant que tab masqué,
// no big deal (acceptable comportement web).

// Expose contrôle zoom à window pour les boutons HTML.
(window as unknown as { setGameZoom: (z: number) => void }).setGameZoom = (z: number) => {
  game.scale.setZoom(Math.max(1, Math.min(8, z)));
};

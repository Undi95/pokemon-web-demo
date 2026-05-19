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
import { BirchRuntimeScene } from './scenes/BirchRuntimeScene';
import { OverworldScene } from './scenes/OverworldScene';
import { TestOverworldScene } from './scenes/TestOverworldScene';
import { createAudioDevtool } from './util/audio-devtool';
import './util/remap-modal'; // exposes window.openRemapModal for the topbar button
import { setMasterVolume } from './engine/m4a/audio-context';

// Audio devtool panel (top-right corner). Dev only. Disable via
// localStorage.setItem('audioDevtool', 'off').
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createAudioDevtool());
  } else {
    createAudioDevtool();
  }
}

// 1:1 décomp main.c `LoadGameSave` au boot AVANT que MainMenu se launch.
// Set `gSaveFileStatus` pour que `Task_MainMenuCheckSaveFile` puisse choisir
// HAS_SAVED_GAME vs HAS_NO_SAVED_GAME au menu screen.
import { LoadGameSave } from './engine/save-system';
import { SetSaveFileStatus } from './engine/gba-menu-system';
// Side-effect import : pose window.rng debug helpers (= dev console access).
import { SeedRngAndSetTrainerId } from './engine/random';
// Side-effect import : pose window.dev.audit.* helpers (= state inspection,
// asset cache, save slots, tile preview, audit reports). Cf. dev-audit-tools.ts.
import './engine/dev-audit-tools';
// Side-effect import : pose window.dev.breakpoint.* helpers (= pause-on-event
// pour debugging frame-precise : fade-out/fade-in/map-change/palette-leak/etc.).
import './engine/dev-breakpoint-tools';
// Side-effect import : pose window.dev.bridge.* helpers (= coverage du
// decomp-bridge.ts + tracking helpers manquants par module auto-généré).
import './engine/dev-bridge-audit-tools';
// Side-effect import : pose window.dev.movementDispatch.* — bridge string
// action names → MovementAction_*_StepN auto-fonctions.
import './engine/movement-action-dispatch';
// Side-effect import : pose window.dev.battle.startTrainer (= trainer battle
// flow registered au boot pour debug). Sans ça, le devtool n'est registered
// qu'après le premier dynamic import depuis _runTrainerBattle opcode.
import './engine/trainer-battle-flow';
// Side-effect import : init RTC core (= PC time as source) + register
// `globalThis.__rtcModule` pour save sync. Cf. session 124 fix Bug 4.
import { exposeRtcDevApi } from './engine/rtc';
exposeRtcDevApi();

// Audit session 126 fix Bug #3 : expose les bridge fns (gMain, FlagSet,
// Overworld_GetMapHeaderByGroupAndId, MapGridGetCollisionAt, etc) sur globalThis
// AU BOOT, avant que Phaser.Game crée les scenes. Avant : exposeGbaGlobals() était
// appelé par GameScene.create() / TestOverworldScene.create(), mais le runtime tick
// pouvait fire CB2_ContinueSavedGame depuis runOneFrame avant qu'une scene n'ait
// fait son create() → identifiers libres dans les auto-files (= overworld-all-auto.ts
// LoadSaveblockMapHeader) cherchaient les fns sur globalThis et trouvaient undefined
// → ReferenceError → boot crash. L'expose au boot main.ts garantit dispo sur globalThis
// avant tout tick. Idempotent : ré-appel par les scenes ne fait que re-set les mêmes
// valeurs (pas de side-effect négatif).
import { exposeGbaGlobals } from './engine/gba-global-scope';
exposeGbaGlobals();

// Audit session 126 LOT D2 : preload multichoice lists data depuis
// `public/decomp/em/multichoice-lists.json` (= 102 lists, 114 index entries
// extraits via `scripts/extract-multichoice-lists.mjs` du décomp script_menu.h).
// Async, idempotent. Sans ça : `multichoice` opcode fallback "VAR_RESULT=0" =
// 1st option auto, dialogues à choix cassés (Latias TV broadcast, contests,
// PC menus, etc.).
import { loadMultichoiceLists } from './engine/multichoice-data';
void loadMultichoiceLists();

// Audit session 126 (post-test) : devtools "voir sans voir l'écran" pour audit
// avancé via console JS uniquement. window.scope.help() pour usage.
import { installScopeDevtools } from './engine/dev-scope';
installScopeDevtools();

// Session 127 : preload bag screen graphics (sprite sac + dots + button).
// Async, idempotent. Au 1er Open du bag, les assets sont déjà cached.
import { preloadBagAssets, initItemIconMap } from './engine/bag-screen';
preloadBagAssets();
void initItemIconMap();

// Session 127 : preload text-tables.json AU BOOT (= species/moves/items/abilities
// FR). Avant : juste loadé par starter-choose-flow.ts on demand → bag screen
// affiché AVANT starter-choose (= ?nointro avec save advanced) tombe sur des
// descriptions vides. Maintenant les tables sont disponibles dès boot.
import { loadTextTables, type TextTables } from './engine/data-tables';
void (async () => {
  try {
    const resp = await fetch('/decomp/em/text-tables.json');
    if (resp.ok) {
      const json = await resp.json() as TextTables;
      loadTextTables(json);
    }
  } catch (e) {
    console.warn('[main] text-tables preload failed', e);
  }
})();

// Phase 2 substrat (2026-05-19) : preload constants.json AU BOOT (=
// species/moves/items/abilities/natures enum→id). AVANT : chargé UNIQUEMENT
// par OverworldScene (= scène LEGACY, morte dans les 2 chemins vivants :
// GameScene prod + TestOverworldScene debug) → `constants` singleton null →
// getItemId/getSpeciesId/getMoveId = 0 partout dans la boucle réelle (bug
// systémique exposé par le sac : liste vide). Aligné sur les autres tables
// préchargées ici. Idempotent (OverworldScene legacy re-set = même data).
import { loadConstantsTable, type ConstantsTable } from './engine/data-tables';
void (async () => {
  try {
    const resp = await fetch('/decomp/em/constants.json');
    if (resp.ok) {
      const json = await resp.json() as ConstantsTable;
      loadConstantsTable(json);
    }
  } catch (e) {
    console.warn('[main] constants preload failed', e);
  }
})();

// Session 127 : preload strings.json AU BOOT (= gText_* du décomp).
// Sans ça, les screens qui appellent getString() voient "[MISSING:gText_...]".
// Pattern 1:1 ABSOLU ZÉRO HARDCODE : tous les textes FR viennent du décomp.
import { initStringsFromDecomp } from './engine/gba-strings';
void initStringsFromDecomp();

// Session 136 audit fix : preload battle moves data + battle script bytecode
// AU BOOT. Sans ces calls, `getBattleMove(moveId)` retournait toujours
// EMPTY_MOVE (= flags=0, power=0, type=0), et le bytecode interpreter ne
// trouvait pas ses labels (= scriptPtr=-1 partout). Toutes les opcodes battle
// qui appellent `getBattleMove(...).flags & FLAG_MAKES_CONTACT` fail silent
// (= secondary effects/ability triggers/etc. ne marchent jamais).
import { loadBattleMoves } from './engine/battle/data/battle-moves';
import { loadBattleScriptBytecode } from './engine/battle/script-interpreter';
import { loadAiScriptBytecode } from './engine/battle/ai/ai-state';
import { loadItemHoldEffects } from './engine/battle/data/item-hold-effects';
import { loadItemEffects } from './engine/battle/data/item-effects';
import { loadGameData } from './engine/data/game-data';
void loadBattleMoves();
void loadBattleScriptBytecode();
// 1:1 décomp : bytecode AI (gBattleAI_ScriptsTable + scripts) chargé au boot,
// requis par BattleAI_ChooseMoveOrAction (combats dresseurs).
void loadAiScriptBytecode();
void loadItemHoldEffects();
// 1:1 décomp : gItemEffectTable (octets itemEffect[]) requis par
// ShouldUseItem/GetAI_ItemType/GetItemEffectParamOffset (AI dresseur objet).
void loadItemEffects();
// 1:1 décomp : game-data (species/moves/learnsets/abilities) doit être chargé
// au boot pour que createPokemonInstance pick le bon learnset 1:1 (= avant
// fallback [tackle, growl] partout). Aussi : ability-battle-effects /
// item-battle-effects lookup gSpeciesInfo via __game_data.
void loadGameData().then(async () => {
  const gd = await import('./engine/data/game-data');
  (globalThis as { __game_data?: unknown }).__game_data = gd;
});

const _saveLoadStatus = LoadGameSave();
SetSaveFileStatus(_saveLoadStatus);
console.log(`[main] LoadGameSave at boot → status=${_saveLoadStatus}`);

// 1:1 décomp `SeedRngAndSetTrainerId()` (main.c:201). Appelée au boot très
// early dans `Init()` (= main loop init). Seed gRngValue + store sTrainerId
// pour que `InitPlayerTrainerId()` au new game ait un base déterministe par
// run. Sans ça, `(Random() << 16) | sTrainerId` ferait playerTrainerId = 0
// pour la 1ère save de chaque session = trainer ID identique = bugs Pokemon
// ownership checks.
SeedRngAndSetTrainerId();

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

// La "ROM" Pokemon Émeraude tourne intégralement dans GameScene
// (= 1:1 décomp `AgbMain` boot loop). TestGbaScene reste en 1ère position pour
// tester l'engine GBA + audio sans déclencher la chaîne de scènes.
//
// Boot flow :
//   TestGbaScene (1er) → click/key → GameScene
//   GameScene → init Gba + DecompRuntime + audio → SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
//             → tickFixed 60Hz → toute la chaîne CB2/Task décomp se déroule
//             (Copyright → Intro → Title → Main Menu native).
//   BirchRuntimeScene : host alternatif pour le flow Birch sur runtime décomp natif.
//   OverworldScene : scène legacy conservée (= ré-utilisable post Phase 4 overworld native).
//   DebugOverlayScene : overlay global (fps / frame / tasks / sprites) sur toutes les scènes.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  zoom: DEFAULT_ZOOM,
  pixelArt: true,
  backgroundColor: '#000000',
  // Boot scene order :
  //   - Default : TestGbaScene en 1ère position (= Lotad sprite spinning au
  //     centre, palette + audio test). User appuie sur A → GameScene qui run
  //     l'intro complète via CB2_InitCopyrightScreenAfterBootup :
  //       Copyright → Anim1 → Anim2 → Anim3 → TitleScreen → MainMenu (New
  //       Game) → Birch intro (Lotad pokeball + naming).
  //   - `?nointro` ou `?nointro=1` : skip direct vers TestOverworldScene
  //     (= dev shortcut pour tester l'overworld sans repasser par l'intro
  //     à chaque refresh).
  // Les autres scènes restent dispo via game.scene.start() dans la chain.
  scene: (() => {
    if (typeof window === 'undefined') return [TestGbaScene];
    const params = new URLSearchParams(window.location.search);
    // ?nointro → skip title screen + resume save existante.
    // ?debug → preset complet (tous items, all flags) + spawn Bourg.
    // Les 2 skip le title screen (cf. boot-mode.ts decideBootMode).
    const noIntro = params.has('nointro') || params.has('debug');
    // ?truck → dev shortcut pour tester la cinematic intro (= reset save + truck) — DEV ONLY.
    const truckTest = params.has('truck');
    // Phase 4.10 user request session 121 : NE PLUS auto-skip title sur save
    // existante. L'intro joue toujours, l'utilisateur choisit "Continuer" dans
    // le MainMenu pour charger sa save (= 1:1 décomp Pokémon classique flow).
    // Le save load lui-même est fait au boot par LoadGameSave (cf. main.ts).
    const hasResumableSave = false;
    try {
      // Legacy compat (= ancienne save v1) — pas utilisé pour skipTitle mais
      // on évite de foutre en l'air si la migration v1→v2 a déjà eu lieu.
      const raw = localStorage.getItem('em_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        void (!!(parsed && parsed.playerName && parsed.map && parsed.map.name));
      }
    } catch { /* localStorage may be disabled — fallback to title */ }
    const skipTitle = noIntro || truckTest || hasResumableSave;
    return skipTitle
      ? [TestOverworldScene, TestGbaScene, GameScene, BirchRuntimeScene, OverworldScene]
      : [TestGbaScene, GameScene, BirchRuntimeScene, TestOverworldScene, OverworldScene];
  })(),
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
  // 1:1 GBA = 60Hz strict. forceSetTimeOut:true fait Phaser utiliser
  // setTimeout(16.67) au lieu de requestAnimationFrame (= bypass throttle
  // rAF quand tab inactive ou monitor refresh non-60Hz). Critical pour
  // audio/anim sync 60Hz.
  //
  // Optim : update() ne fait du rendu que si tickFixed accumule au moins
  // 1 frame logique (= évite gba.tick + putImageData spam quand le tick
  // est appelé > 60Hz). Voir TestOverworldScene.update().
  fps: {
    target: 60,
    forceSetTimeOut: true,
    smoothStep: false,
  },
};

const game = new Phaser.Game(config);
// Expose game globally for cross-module access (= dev tools, scene-launching specials).
(window as any).__phaserGame = game;

// Lance l'overlay debug en parallèle sur toutes les scènes
void game.scene.add('DebugOverlayScene', DebugOverlayScene, true);

// Pas de pause sur visibilitychange : retiré sur demande. L'onglet en arrière-plan
// laisse tourner game + musique. Si le MIDI loop boucle pendant que tab masqué,
// no big deal (acceptable comportement web).

// Expose contrôle zoom à window pour les boutons HTML.
(window as unknown as { setGameZoom: (z: number) => void }).setGameZoom = (z: number) => {
  game.scale.setZoom(Math.max(1, Math.min(8, z)));
};

// ─── Volume master (= slider topbar, visible user-facing) ─────────────────
// Le devtool audio a un slider miroir (synchro via storage event + custom event).
// Persiste dans localStorage.audioDevtoolVolume (= partagé avec le devtool).
const VOLUME_KEY = 'audioDevtoolVolume';
const initialVolStr = localStorage.getItem(VOLUME_KEY);
const initialVol = Math.max(0, Math.min(1, parseFloat(initialVolStr ?? '1') || 1));
setMasterVolume(initialVol);

function syncVolumeUI(v: number): void {
  const slider = document.getElementById('game-volume') as HTMLInputElement | null;
  const label = document.getElementById('game-volume-value');
  const pct = Math.round(v * 100);
  if (slider) slider.value = String(pct);
  if (label) label.textContent = `${pct}%`;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncVolumeUI(initialVol));
  } else {
    syncVolumeUI(initialVol);
  }
}

(window as unknown as { setGameVolume: (v: number | string) => void }).setGameVolume = (v) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  if (!Number.isFinite(n)) return;
  const clamped = Math.max(0, Math.min(100, n));
  const norm = clamped / 100;
  setMasterVolume(norm);
  localStorage.setItem(VOLUME_KEY, String(norm));
  syncVolumeUI(norm);
  // Notifie le devtool audio que le volume a changé (pour sync slider).
  window.dispatchEvent(new CustomEvent('audio-volume-changed', { detail: { volume: norm } }));
};

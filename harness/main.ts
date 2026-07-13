import Phaser from 'phaser';

// ─── Intercepteur réseau des assets décomp (MOTEUR, hors 1:1) ────────────────
// Remplace l'ancien monkey-patch cache-bust inline. Route les fetch d'assets décomp
// du jeu (code 1:1, INCHANGÉ) vers un cache persistant (Cache API) + déduplication +
// préchargement appris — pour que l'octet soit déjà là quand le code 1:1 le demande
// (instantané, comme la ROM). Modules /src/ (HMR) + blob m4a : cache-bust dev préservé.
// Escape dev : ?freshassets / window.__decompNet.clear(). Détail : decomp-asset-net.ts.
// Doit s'installer AVANT tout fetch du jeu → tout début de main.
import { installDecompAssetNet } from './runtime/decomp-asset-net';
installDecompAssetNet();

import { GameScene } from './scenes/GameScene';
import { DebugOverlayScene } from './scenes/DebugOverlayScene';
// Devtools v2 (2026-07-10) : sidebar F2 générée du registre de commandes unique
// (parité console/UI, cf. harness/devtools/registry.ts). Remplace devtools-panel
// v1 ET util/audio-devtool (absorbé en catégorie Audio) — fichiers archivés.
import { mountDevtoolsV2 } from './devtools/panel-v2';
// Chantier « c » Step 0 (2026-06-22) : BirchRuntimeScene = host MORT (jamais
// `scene.start`'d ; le flow Birch tourne dans GameScene via la chaîne CB2 main menu,
// cf. docs/RUNTIME-MERGE-PLAN.md). Dé-enregistré du scene array. Fichier conservé
// jusqu'au nettoyage final (Step 5).
// import { BirchRuntimeScene } from './scenes/BirchRuntimeScene';
// import { OverworldScene } from './scenes/OverworldScene';  // LEGACY-RETIRÉ — voir test ci-dessous
import { TestOverworldScene } from './scenes/TestOverworldScene';
import './util/remap-modal'; // exposes window.openRemapModal for the topbar button
// Side-effect : install window.cheat debug helpers (= skipIntro/heal/resetSave).
import './devtools/dev-cheat';
import { setMasterVolume } from './m4a/audio-context';
import { installAudioArbiter } from './m4a/audio-arbiter';

// 1:1 décomp main.c `LoadGameSave` au boot AVANT que MainMenu se launch.
// Set `gSaveFileStatus` pour que `Task_MainMenuCheckSaveFile` puisse choisir
// HAS_SAVED_GAME vs HAS_NO_SAVED_GAME au menu screen.
import { LoadGameSave } from '../src/save';
import { SetSaveFileStatus } from '../src/save';
// Side-effect import : pose window.rng debug helpers (= dev console access).
import { SeedRngAndSetTrainerId } from '../src/main';
import './devtools/rng-debug'; // enregistre window.rng au boot
// Side-effect import : pose window.dev.audit.* helpers (= state inspection,
// asset cache, save slots, tile preview, audit reports). Cf. dev-audit-tools.ts.
import './devtools/dev-audit-tools';
// Side-effect import : pose window.__testDamage (banc déterministe du calcul de dégâts,
// diag « Arcko encaisse Surf de Léviator » sans piloter un combat). Cf. dev-damage-probe.ts.
import './devtools/dev-damage-probe';
// Side-effect import : pose window.dev.breakpoint.* helpers (= pause-on-event
// pour debugging frame-precise : fade-out/fade-in/map-change/palette-leak/etc.).
import './devtools/dev-breakpoint-tools';
// Side-effect import : pose window.dev.bridge.* helpers (= coverage du
// decomp-bridge.ts + tracking helpers manquants par module auto-généré).
import './devtools/dev-bridge-audit-tools';
// Side-effect import : pose window.dev.fx.* helpers (= overworld / field effects :
// tp, player, force-spawn FLDEFF_* via le chemin live, list sprites d'effet). Cf.
// dev-fieldfx-tools.ts. Sert à vérifier les ports field_effect_helpers.c en jeu.
import './devtools/dev-fieldfx-tools';
// Side-effect import : pose window.dev.battle.startTrainer (= trainer battle
// flow registered au boot pour debug). Sans ça, le devtool n'est registered
// qu'après le premier dynamic import depuis _runTrainerBattle opcode.
// Side-effect import : init RTC core (= PC time as source) + register
// `globalThis.__rtcModule` pour save sync. Cf. session 124 fix Bug 4.
import { exposeRtcDevApi } from '../src/rtc';
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
import { exposeGbaGlobals } from './runtime/gba-global-scope';
exposeGbaGlobals();

// Audit session 126 LOT D2 : preload multichoice lists data depuis
// `public/decomp/em/multichoice-lists.json` (= 102 lists, 114 index entries
// extraits via `scripts/extract-multichoice-lists.mjs` du décomp script_menu.h).
// Async, idempotent. Sans ça : `multichoice` opcode fallback "VAR_RESULT=0" =
// 1st option auto, dialogues à choix cassés (Latias TV broadcast, contests,
// PC menus, etc.).
import { loadMultichoiceLists } from '../src/script_menu';
void loadMultichoiceLists();

// Audit session 126 (post-test) : devtools "voir sans voir l'écran" pour audit
// avancé via console JS uniquement. window.scope.help() pour usage.
import { installScopeDevtools } from './devtools/dev-scope';
installScopeDevtools();

// Session 127 : preload bag screen graphics (sprite sac + dots + button).
// Async, idempotent. Au 1er Open du bag, les assets sont déjà cached.
import { preloadBagAssets, initItemIconMap } from '../src/engine/bag/bag-screen';
preloadBagAssets();
void initItemIconMap();

// Session 127 : preload text-tables.json AU BOOT (= species/moves/items/abilities
// FR). Avant : juste loadé par starter-choose-flow.ts on demand → bag screen
// affiché AVANT starter-choose (= ?nointro avec save advanced) tombe sur des
// descriptions vides. Maintenant les tables sont disponibles dès boot.
import { loadTextTables, type TextTables } from './runtime/data-tables';
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
import { loadConstantsTable, type ConstantsTable } from './runtime/data-tables';
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
import { initStringsFromDecomp } from './runtime/decomp-strings';
void initStringsFromDecomp();

// Session 136 audit fix : preload battle moves data + battle script bytecode
// AU BOOT. Sans ces calls, `getBattleMove(moveId)` retournait toujours
// EMPTY_MOVE (= flags=0, power=0, type=0), et le bytecode interpreter ne
// trouvait pas ses labels (= scriptPtr=-1 partout). Toutes les opcodes battle
// qui appellent `getBattleMove(...).flags & FLAG_MAKES_CONTACT` fail silent
// (= secondary effects/ability triggers/etc. ne marchent jamais).
import { loadBattleMoves } from '../src/data/battle_moves';
import { loadBattleScriptBytecode } from '../src/engine/battle/script-interpreter';
import { loadAiScriptBytecode } from '../src/engine/battle/ai/ai-state';
import { loadItemHoldEffects } from '../src/item';
import { loadItemEffects } from '../src/data/pokemon/item_effects';
import { loadGameData } from '../src/engine/data/game-data';
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
  const gd = await import('../src/engine/data/game-data');
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

// La "ROM" Pokemon Émeraude tourne intégralement dans GameScene (= 1:1 décomp
// `AgbMain` boot loop), OU dans TestOverworldScene (host unifié, défaut).
// TestGbaScene (ancien launcher « press A » du lecteur MIDI legacy) a été retiré
// avec la dissolution du shim son (2026-07-11).
//
// Boot flow :
//   TestOverworldScene (défaut, host unifié) → boote intro + OW dans UN runtime.
//   GameScene (legacy, ?no-un) → init Gba + DecompRuntime + audio →
//             SetMainCallback2(CB2_InitCopyrightScreenAfterBootup) → tickFixed 60Hz
//             → chaîne CB2/Task décomp (Copyright → Intro → Title → Main Menu native).
//   (BirchRuntimeScene + OverworldScene = hosts MORTS dé-enregistrés, cf. chantier « c ».)
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
  //   - Default : TestOverworldScene en 1ère position (host unifié — boote l'intro
  //     complète puis l'OW dans un seul runtime : Copyright → Anim1/2/3 →
  //     TitleScreen → MainMenu (New Game) → Birch intro (Lotad pokeball + naming)).
  //   - `?nointro`/`?debug`/… : TestOverworldScene en boot direct OW (introMode=false).
  //   - `?no-un` : chemin legacy GameScene (intro dans son runtime) puis OW.
  // Les autres scènes restent dispo via game.scene.start() dans la chain.
  scene: (() => {
    if (typeof window === 'undefined') return [TestOverworldScene, GameScene];
    const params = new URLSearchParams(window.location.search);
    // ?no-un → chemin LEGACY 2 scènes, ARCHIVÉ mais dispo (décision user 2026-07-10) :
    // GameScene (chaîne intro dans SON runtime) → scene.start(TestOverworldScene) pour
    // l'OW. Chaque scène recrée un runtime → RNG/seed/état de boot PERDUS aux
    // transitions — c'est pour ça que le défaut est désormais le host unifié ci-dessous.
    if (params.has('no-un')) return [GameScene, TestOverworldScene];
    // DÉFAUT = HOST UNIFIÉ (ex-?unified du chantier « c », basculé par défaut —
    // user 2026-07-10) : TestOverworldScene boote TOUT dans UN SEUL runtime
    // 1:1 AgbMain (Copyright → intro → Title → MainMenu → Birch → OW via
    // SetMainCallback2, ZÉRO scene.start ; RNG/seed/état boot continus).
    // Les presets dev (?nointro/?debug/?clock/?truck) prennent la même scène en
    // boot direct OW (introMode=false — cf. TestOverworldScene.create).
    // GameScene reste ENREGISTRÉE (dispo via ESC / ?no-un).
    return [TestOverworldScene, GameScene];
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

// DEVTOOLS V2 (sidebar droite, toggle F2 ou bouton flottant 🛠) : générée du
// registre de commandes unique — parité console (dev.cmd/dev.cmds) / UI. Pousse
// le layout (padding-right body) au lieu de recouvrir le canvas. Observe l'état
// live via globalThis.__rt — n'altère le runtime que via les leviers devtools
// prévus (rt.paused/stepBudget/speedMultiplier) + le harness combat. Idempotent.
mountDevtoolsV2();

// Pas de pause sur visibilitychange : retiré sur demande. L'onglet en arrière-plan
// laisse tourner game + musique. Si le MIDI loop boucle pendant que tab masqué,
// no big deal (acceptable comportement web).
// MAIS entre PLUSIEURS instances (pane Browser de l'app + onglet du user),
// une seule sonne à la fois : la dernière focusée (cf. audio-arbiter.ts).
installAudioArbiter();

// Moteur son m4a NATIF : précharge le blob de données (3,3 Mo byte-exact ROM)
// dès le boot pour que la première musique parte sans retard. Le worklet et
// le dispatch vivent dans decomp-globals (ensureNativeEngine).
import('./m4a/native')
  .then(({ M4A_NATIVE, initM4aNative }) => { if (M4A_NATIVE) return initM4aNative().then(() => undefined); })
  .catch((e) => console.error('[m4a-native] preload', e));

// Harnais E2E (plan fin-de-budget) : scénarios de jeu scriptés + rapport
// JSON objectif — console : __e2e.run('boot-overworld') / __e2e.list().
import('./e2e/scenarios')
  .then(() => import('./e2e/runner'))
  .then(({ installE2e }) => installE2e())
  .catch((e) => console.error('[e2e] install', e));

// ─── Zoom pixel-perfect DPR-aware ──────────────────────────────────────────
// Le canvas RENDU reste à la résolution NATIVE GBA (240×160). On ne touche QUE
// la taille CSS pour que les PIXELS PHYSIQUES = 240×z (multiple ENTIER) →
// `image-rendering: pixelated` (cf. index.html) fait un upscale N× exact =
// pixel-perfect à CHAQUE zoom.
//
// Avant : on laissait Phaser poser CSS = 240×z. Mais avec un devicePixelRatio
// ≠ 1 (ex. Windows à 125 % → dpr 1.25), les pixels physiques = CSS×dpr tombaient
// sur un facteur NON entier (240×1×1.25=300=2.5×, 240×3×1.25=900=3.75×, …) sauf
// x4 par hasard (240×4×1.25=1200=5× pile) → flou en x1/x2/x3/x5/x6, net qu'en x4.
// On divise la CSS par dpr → physique = 240×z entier → net partout.
let _currentZoom = DEFAULT_ZOOM;
function applyPixelPerfectZoom(z: number): void {
  _currentZoom = Math.max(1, Math.min(8, Math.round(z)));
  const canvas = game.canvas;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${(GAME_W * _currentZoom) / dpr}px`;
  canvas.style.height = `${(GAME_H * _currentZoom) / dpr}px`;
  // Surligne le bouton zoom actif dans la topbar.
  document.querySelectorAll<HTMLElement>('.tb-zoom-btn').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.zoom) === _currentZoom);
  });
}
(window as unknown as { setGameZoom: (z: number) => void }).setGameZoom = applyPixelPerfectZoom;
// Applique le zoom par défaut (override la CSS posée par config.zoom) une fois le
// canvas créé, puis re-applique si le dpr change (browser zoom Ctrl+±, ou fenêtre
// déplacée vers un écran de scaling différent — les deux émettent 'resize').
game.events.once(Phaser.Core.Events.READY, () => applyPixelPerfectZoom(DEFAULT_ZOOM));
window.addEventListener('resize', () => applyPixelPerfectZoom(_currentZoom));

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

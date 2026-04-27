/**
 * GameScene — host unique de la "ROM" Pokemon Émeraude.
 *
 * 1:1 décomp `AgbMain` (src/main.c) :
 *   while (1) {
 *     gMain.callback2();    // = scène courante state machine (CB2_*)
 *     RunTasks();            // = gTasks itère
 *     AnimateSprites();      // = sprite anim cycle + sprite CB
 *     BuildOamBuffer();      // = sync sprite → OAM
 *   }
 *
 * Notre engine = `rt.tickFixed(dt)` qui fait exactement ça à 60Hz.
 *
 * Cette scene Phaser = juste l'HÔTE du canvas. Aucune logique de jeu ici.
 * Toute la logique est dans les `CB2_*`/`Task_*`/`SpriteCB_*` transcrits
 * mécaniquement depuis le décomp (auto/src/*-callbacks-auto.ts), exécutés
 * par DecompRuntime.tickFixed.
 *
 * PHASE 0b (état actuel) : on saute le copyright (déjà dispo en TestGba) et
 * on lance directement Task_Scene1_Load (1:1 transcrite). Si la state machine
 * tourne correctement, on enchaîne automatiquement Scene 1 → Scene 2 → Scene 3
 * → Title via les transitions inter-tasks transcrites.
 *
 * Phase 0c (next) : implementer la vraie chaîne CB2_InitCopyrightScreenAfterBootup
 * → SetUpCopyrightScreen state machine → SetMainCallback2(MainCB2_Intro) +
 * CreateTask(Task_Scene1_Load).
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { DecompRuntime } from '../engine/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations, lz77Trace, assetCache } from '../engine/decomp-globals';
import { preloadScene1Assets, preloadScene2Assets, preloadScene3Assets } from '../engine/intro-asset-loader';
import { Task_Scene1_Load } from '../engine/decomp-data/auto/src/intro-callbacks-auto';

export class GameScene extends Phaser.Scene {
  private gba!: Gba;
  private rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private booted = false;

  constructor() { super({ key: 'GameScene' }); }

  create() {
    console.log('[GameScene] create()');
    this.cameras.main.setBackgroundColor('#000000');

    // Engine GBA pixel-perfect + bridge Phaser
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'game-frame');
    this.rt = new DecompRuntime(this.gba);

    // Wire le runtime singleton (utilisé par decomp-globals helpers depuis les Tasks)
    setGlobalRuntime(this.rt);
    resetObjAllocations();

    // Expose debug pour inspecter dans la console : window.debug.rt, debug.gba etc.
    (window as unknown as { debug: unknown }).debug = {
      rt: this.rt, gba: this.gba,
      lz77Trace,                                       // tableau de tous les LZ77 calls
      assetCache,                                      // Map des assets préchargés
      cacheKeys: () => Array.from(assetCache.keys()),
      assetLen: (sym: string) => assetCache.get(sym)?.length ?? -1,
      bg0vram: () => Array.from(this.gba.bg(0).vram.subarray(0, 32)),
      bg0tilemap: () => Array.from(this.gba.bg(0).tilemap.subarray(0, 16)),
      bg0visible: () => this.gba.bg(0).config.visible,
      bg0cnt: () => this.gba.bg(0).config,
      bgPal0: () => Array.from({ length: 16 }, (_, i) => this.gba.palette.getBgRgba(0, i, 0)),
      brightness: () => this.gba.blend.brightness,
      blendMode: () => this.gba.blend.mode,
    };

    const frameImg = this.add.image(0, 0, 'game-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    this.statusText = this.add.text(2, 2, 'GameScene boot...', {
      fontFamily: 'monospace', fontSize: '7px', color: '#FFFFFF',
      backgroundColor: '#000000',
    }).setDepth(100);

    // Audio : pas de prime ici. Notre M4A engine maison (`src/engine/m4a/`)
    // est lazy-init via m4aSongNumStart() au moment où une song est demandée
    // par les Tasks décomp (= 1:1 ROM behavior). Plus de SpessaSynth.

    // Pré-charge async les assets Scene 1, puis pose Task_Scene1_Load
    void this.bootIntro();

    // Skip via input
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[GameScene] ESC → TestGbaScene');
      this.scene.start('TestGbaScene');
    });
    this.input.on('pointerdown', () => {
      console.log('[GameScene] click | tasks:', this.rt.gTasks.size,
                  '| sprites:', this.rt.gSprites.size,
                  '| frame:', this.rt.gIntroFrameCounter);
    });

    console.log('[GameScene] create() done — preloading assets...');
  }

  private async bootIntro(): Promise<void> {
    try {
      this.statusText?.setText('Preloading Scene 1+2+3 assets...');
      await preloadScene1Assets();
      await preloadScene2Assets();
      await preloadScene3Assets();
      this.statusText?.setText('Assets ready, posting Task_Scene1_Load').setColor('#88FFCC');

      // MainCB2_Intro stub : 1:1 décomp src/intro.c MainCB2_Intro qui fait juste
      // "AnimateSprites + RunTasks + BuildOamBuffer + UpdatePaletteFade + tick frame
      // counter". Ces opérations sont déjà dans tickFixed → notre stub = no-op pur.
      this.rt.SetMainCallback2(() => { /* MainCB2_Intro = no-op (tickFixed handles all) */ });

      // Pose Task_Scene1_Load. La signature transcrite = (task, rt). Notre runTasks
      // appelle `func(task)` (1 arg) → on wrap pour passer rt en closure.
      const taskId = this.rt.CreateTask((task) => Task_Scene1_Load(task, this.rt), 0);
      console.log('[GameScene] Task_Scene1_Load posted, taskId =', taskId);

      this.booted = true;
      this.statusText?.setText('Boot loop ON. Scene 1 ticking...').setColor('#00FF88');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[GameScene] bootIntro failed:', e);
      this.statusText?.setText(`BOOT ERR: ${msg}`).setColor('#FF4040');
    }
  }

  update(_: number, deltaMs: number) {
    if (!this.rt) return;
    // Tick le runtime décomp (1:1 AgbMain main loop). Try/catch pour révéler
    // les erreurs silencieuses que Phaser swallow (= ne s'arrête pas mais
    // skip update suivants). Phase 3 debug Task_Scene3_Groudon GameScene halt.
    try {
      this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[GameScene.update] tickFixed THREW:', e);
      console.error('[GameScene.update] stack:', (e as Error).stack);
    }
    try {
      if (this.bridge) this.bridge.tick();
    } catch (e) {
      console.error('[GameScene.update] bridge.tick THREW:', e);
    }
    // Status update : montre l'état du runtime en live
    if (this.booted && this.statusText && (this.rt.gIntroFrameCounter % 30 === 0)) {
      this.statusText.setText(
        `frame: ${this.rt.gIntroFrameCounter} | tasks: ${this.rt.gTasks.size} | sprites: ${this.rt.gSprites.size}`,
      );
    }
  }
}

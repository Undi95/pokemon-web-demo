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
import { DecompRuntime, type CB2Callback } from '../engine/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations, lz77Trace, assetCache } from '../engine/decomp-globals';
import { preloadFontData } from '../engine/gba-text-system';
import { exposeGbaGlobals } from '../engine/gba-global-scope';
import { preloadScene1Assets, preloadScene2Assets, preloadScene3Assets, preloadTitleAssets } from '../engine/intro-asset-loader';
import {
  Task_Scene1_Load, MainCB2_EndIntro,
  SpriteCB_Sparkle, SpriteCB_Volbeat, SpriteCB_Torchic, SpriteCB_Manectric,
  SpriteCB_GroudonRocks, SpriteCB_KyogreBubbles, SpriteCB_Lightning,
  SpriteCB_WaterDrop_Ripple, SpriteCB_WaterDropHalf, SpriteCB_WaterDrop,
  SpriteCB_WaterDrop_Slide, SpriteCB_WaterDrop_ReachLeafEnd,
  SpriteCB_WaterDrop_DangleFromLeaf, SpriteCB_WaterDrop_Fall, SpriteCB_WaterDropShort,
  SpriteCB_PlayerOnBicycle, SpriteCB_Flygon, SpriteCB_LogoLetter,
  SpriteCB_GameFreakLogo, SpriteCB_FlygonSilhouette, SpriteCB_RayquazaOrb,
} from '../engine/decomp-data/auto/src/intro-callbacks-auto';
import { CB2_InitTitleScreen } from '../engine/decomp-data/auto/src/title_screen-callbacks-auto';
import { CB2_InitCopyrightScreenAfterBootup, MainCB2_Intro } from '../engine/copyright-boot';

export class GameScene extends Phaser.Scene {
  private gba!: Gba;
  private rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private booted = false;
  private mainCb2Intro: CB2Callback | null = null;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

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
    exposeGbaGlobals();

    // Enregistre les sprite callbacks de l'intro pour que CreateSpriteFromTemplate
    // puisse les résoudre depuis les templates (les fonctions ESM ne sont pas sur globalThis).
    this.rt.spriteCallbacks.set('SpriteCB_Sparkle', SpriteCB_Sparkle);
    this.rt.spriteCallbacks.set('SpriteCB_Volbeat', SpriteCB_Volbeat);
    this.rt.spriteCallbacks.set('SpriteCB_Torchic', SpriteCB_Torchic);
    this.rt.spriteCallbacks.set('SpriteCB_Manectric', SpriteCB_Manectric);
    this.rt.spriteCallbacks.set('SpriteCB_GroudonRocks', SpriteCB_GroudonRocks);
    this.rt.spriteCallbacks.set('SpriteCB_KyogreBubbles', SpriteCB_KyogreBubbles);
    this.rt.spriteCallbacks.set('SpriteCB_Lightning', SpriteCB_Lightning);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Ripple', SpriteCB_WaterDrop_Ripple);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDropHalf', SpriteCB_WaterDropHalf);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop', SpriteCB_WaterDrop);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Slide', SpriteCB_WaterDrop_Slide);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_ReachLeafEnd', SpriteCB_WaterDrop_ReachLeafEnd);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_DangleFromLeaf', SpriteCB_WaterDrop_DangleFromLeaf);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Fall', SpriteCB_WaterDrop_Fall);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDropShort', SpriteCB_WaterDropShort);
    this.rt.spriteCallbacks.set('SpriteCB_PlayerOnBicycle', SpriteCB_PlayerOnBicycle);
    this.rt.spriteCallbacks.set('SpriteCB_Flygon', SpriteCB_Flygon);
    this.rt.spriteCallbacks.set('SpriteCB_LogoLetter', SpriteCB_LogoLetter);
    this.rt.spriteCallbacks.set('SpriteCB_GameFreakLogo', SpriteCB_GameFreakLogo);
    this.rt.spriteCallbacks.set('SpriteCB_FlygonSilhouette', SpriteCB_FlygonSilhouette);
    this.rt.spriteCallbacks.set('SpriteCB_RayquazaOrb', SpriteCB_RayquazaOrb);

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

    // Audio : pas de prime ici. Notre M4A engine maison (`src/engine/m4a/`)
    // est lazy-init via m4aSongNumStart() au moment où une song est demandée
    // par les Tasks décomp (= 1:1 ROM behavior). Plus de SpessaSynth.

    // Pré-charge async les assets (intro + fonts), puis pose Task_Scene1_Load
    void this.bootIntro();

    // Skip intro : A/B/START/SELECT à tout moment avant le title screen
    // NOTE: désactivé car il interfère avec le Title Screen (réinitialise CB2_InitTitleScreen)
    // L'intro tourne correctement jusqu'au Title Screen naturellement.
    // this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
    //   const k = e.key.toLowerCase();
    //   if (k === 'w' || k === 'x' || k === 'b' || k === 'n' || k === 'enter' || k === ' ') {
    //     if (this.rt.gMain.callback2 === this.mainCb2Intro) {
    //       console.log('[GameScene] Skip intro → CB2_InitTitleScreen');
    //       this.rt.SetMainCallback2(CB2_InitTitleScreen);
    //     }
    //   }
    // });

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

    this.createKeys();
    console.log('[GameScene] create() done — preloading assets...');
  }

  private async bootIntro(): Promise<void> {
    try {
      await preloadScene1Assets();
      await preloadScene2Assets();
      await preloadScene3Assets();
      await preloadTitleAssets();
      await preloadFontData();

      // Transfère les palettes additionnelles préchargées dans le runtime
      // pour que CpuCopy16 puisse les utiliser (e.g. text.pal pour color cycle).
      const textPal = assetCache.get('gIntroGameFreakTextFade_Pal') as Uint16Array | undefined;
      if (textPal) this.rt.setExtraPalette('gIntroGameFreakTextFade_Pal', textPal);

      // MainCB2_Intro = skip intro on any key press (décomp 1:1)
      this.mainCb2Intro = MainCB2_Intro;

      // Boot 1:1 décomp : CB2_InitCopyrightScreenAfterBootup → SetUpCopyrightScreen
      // state machine → fade in → hold → fade out → MainCB2_Intro + Task_Scene1_Load
      this.rt.SetMainCallback2(CB2_InitCopyrightScreenAfterBootup);
      console.log('[GameScene] CB2_InitCopyrightScreenAfterBootup set');

      this.booted = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[GameScene] bootIntro failed:', e);
    }
  }

  update(_: number, deltaMs: number) {
    if (!this.rt) return;
    this.pollInput();
    // Tick le runtime décomp (1:1 AgbMain main loop). Try/catch pour révéler
    // les erreurs silencieuses que Phaser swallow (= ne s'arrête pas mais
    // skip update suivants). Phase 3 debug Task_Scene3_Groudon GameScene halt.
    try {
      this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[GameScene.update] tickFixed THREW:', e);
      console.error('[GameScene.update] stack:', (e as Error).stack);
    }
    // Main Menu now runs purely on GBA engine (no Phaser scene fallback)
    // CB2_InitMainMenu / CB2_MainMenu are handled by the decomp runtime directly
    try {
      if (this.bridge) this.bridge.tick();
    } catch (e) {
      console.error('[GameScene.update] bridge.tick THREW:', e);
    }
    // Status update : montre l'état du runtime en live

  }

  private heldKeys = 0;

  private createKeys(): void {
    // Utilise les événements natifs keydown/keyup au lieu de Phaser Key objects
    // car Puppeteer + Phaser addKey ne détectent pas toujours les touches.
    window.addEventListener('keydown', (e) => {
      const mask = this.keyToMask(e.key);
      if (mask) {
        this.heldKeys |= mask;
      }
    });
    window.addEventListener('keyup', (e) => {
      const mask = this.keyToMask(e.key);
      if (mask) {
        this.heldKeys &= ~mask;
      }
    });
  }

  private keyToMask(key: string): number {
    switch (key.toLowerCase()) {
      case 'w': return 0x01;        // A
      case 'x': return 0x02;        // B
      case 'n': return 0x04;        // SELECT
      case 'b': return 0x08;        // START
      case 'enter': return 0x08;    // START (alternative)
      case 'arrowright': return 0x10;
      case 'arrowleft': return 0x20;
      case 'arrowup': return 0x40;
      case 'arrowdown': return 0x80;
      case 'z': return 0x100;       // R
      case 'a': return 0x200;       // L
      case ' ': return 0x08;        // START (alternative)
      default: return 0;
    }
  }

  private pollInput(): void {
    // Copie les touches détenues dans le runtime pour que tickFixed puisse
    // calculer newKeys (= front montant) chaque frame.
    this.rt.gMain.heldKeys = this.heldKeys;
  }
}

/**
 * GameScene — host unique de la "ROM" Pokemon Émeraude.
 *
 * 1:1 décomp `AgbMain` (src/main.c) :
 *   while (1) {
 *     gMain.callback2();    // = scène courante state machine
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
 * Boot flow 1:1 décomp :
 *   GameScene.create() : init Gba + DecompRuntime + audio
 *   → SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
 *     → state machine copyright (3 cases : init, fadein, start_intro)
 *     → CreateTask(Task_Scene1_Load) + SetMainCallback2(MainCB2_Intro)
 *       → Task_Scene1_Load (init BG/sprites Scene 1) + Task_Scene1_FadeIn
 *         → Task_Scene1_WaterDrops
 *           → Task_Scene2_Load → Task_Scene2_BikeRide → Task_Scene2_End
 *             → Task_Scene3_Load → ... → SetMainCallback2(CB2_InitTitleScreen)
 *               → Task_TitleScreenPhase1/2/3
 *                 → SetMainCallback2(CB2_InitMainMenu)
 *                   → ... etc jusqu'à CB2_LoadMap (overworld) + CB2_InitBattle
 *
 * PHASE 0a (état actuel) : démontre le BOOT LOOP. CB2 squelette qui pose
 * un BG copyright après N frames → swap vers CB2 finale qui no-op.
 * Validation visuelle = copyright Pokemon Emerald s'affiche sans aucune
 * intervention manuelle, juste le runtime qui tick.
 *
 * Phase 0b (next) : remplacer CB2 squelette par CB2_InitCopyrightScreenAfterBootup
 * réelle + wirer Task_Scene1_Load via helpers globaux (LoadPalette, LZ77UnCompVram).
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { loadIndexedPng, loadTilemapBin } from '../engine/gba/png-loader';
import { DecompRuntime, BG_PLTT_ID, REG_OFFSET_DISPCNT, REG_OFFSET_BG0CNT, BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE, BGCNT_16COLOR, BGCNT_TXT256x256, DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_BG0_ON } from '../engine/decomp-runtime';
import type { CB2Callback } from '../engine/decomp-runtime';
import { primeAudio } from '../engine/music';

export class GameScene extends Phaser.Scene {
  private gba!: Gba;
  private rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private booted = false;

  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // Engine GBA pixel-perfect + bridge Phaser
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'game-frame');
    this.rt = new DecompRuntime(this.gba);

    const frameImg = this.add.image(0, 0, 'game-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    this.statusText = this.add.text(2, 2, 'Boot loop init...', {
      fontFamily: 'monospace', fontSize: '7px', color: '#FFFFFF',
    }).setDepth(100);

    // Pose la CB2 d'entrée (= state machine copyright). Async pour pouvoir
    // pré-charger les assets globaux (audio voicegroups, etc.) avant de tick.
    void this.bootRom();

    // Skip via input (placeholder Phase 0a) → log + reboot test scene
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('TestGbaScene'));
    this.input.on('pointerdown', () => {
      console.log('[GameScene] click → state', this.rt.gMain.state, 'frame', this.rt.gIntroFrameCounter);
    });
  }

  private async bootRom(): Promise<void> {
    try {
      // Audio prime (si pas déjà fait par TestGbaScene/BootScene)
      await primeAudio();

      // Pose la CB2 initiale = équivalent Phase 0a de CB2_InitCopyrightScreenAfterBootup.
      // Une vraie state machine (cases case 0/1/2/3) qui :
      //   case 0 : load copyright BG + setup BGCNT/DISPCNT
      //   case 1+: tick (= attendre N frames pour démo)
      //   case END: SetMainCallback2(null) (placeholder Phase 0a)
      this.rt.SetMainCallback2(this.makeCB2_PhaseZeroDemo());
      this.booted = true;
      this.statusText?.setText('Boot loop ON. CB2 ticking...').setColor('#88FF88');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[GameScene] bootRom failed:', e);
      this.statusText?.setText(`BOOT ERR: ${msg}`).setColor('#FF4040');
    }
  }

  /** Phase 0a CB2 squelette — demo le mécanisme gMain.callback2 dispatch.
   *
   *  state 0 : load copyright BG + DISPCNT enable BG0 (1 frame)
   *  state 1 : wait 120 frames (~2s) — visualise que le tick tourne bien
   *  state 2 : SetMainCallback2(null) → arrêt boot loop, GameScene reste statique
   *
   *  Ça PROUVE que :
   *  - GameScene tick rt.tickFixed à 60Hz
   *  - rt dispatch gMain.callback2 chaque frame
   *  - state machine progresse (state++)
   *  - SetMainCallback2 swap fonctionne
   *  - Le PNG copyright décodé via Gba.loadPalette/vram s'affiche pixel-perfect.
   */
  private makeCB2_PhaseZeroDemo(): CB2Callback {
    return (rt: DecompRuntime) => {
      switch (rt.gMain.state) {
        case 0: {
          // Pre-load copyright assets (async, donc on garde le state à 0 le temps)
          // Trick : on lance l'async une fois, on incrémente après resolve.
          if (!this._copyrightLoading) {
            this._copyrightLoading = true;
            void this.loadCopyrightAssets().then(() => {
              this.statusText?.setText('Copyright BG loaded. Ticking N frames...');
              rt.gMain.state = 1;
            });
          }
          break;
        }
        case 1: {
          // Wait 120 frames (= 2s) puis next state
          if (rt.gIntroFrameCounter > 120) {
            rt.gMain.state = 2;
            this.statusText?.setText('CB2 swap → null (Phase 0a end). Press ESC = TestGbaScene.').setColor('#FFCC00');
          }
          break;
        }
        case 2: {
          // Phase 0a finale : on STOP le callback2 (= simule SetMainCallback2(null)
          // jusqu'à ce que Phase 0b implémente la vraie chaîne CB2_InitCopyright →
          // CreateTask(Task_Scene1_Load) + SetMainCallback2(MainCB2_Intro)).
          rt.SetMainCallback2(null);
          break;
        }
      }
    };
  }
  private _copyrightLoading = false;

  /** Charge le copyright BG dans BG0 (1:1 décomp `LoadCopyrightGraphics`).
   *  Phase 0b remplacera ça par les LZ77 réels via Task_Scene1_Load. */
  private async loadCopyrightAssets(): Promise<void> {
    const bgPng = await loadIndexedPng('/decomp/em/intro/copyright.png');
    const tilemap = await loadTilemapBin('/decomp/em/intro/copyright.bin');
    this.gba.palette.loadBgRange(BG_PLTT_ID(0), bgPng.palette);
    this.gba.bg(0).vram.set(bgPng.charData.subarray(0, this.gba.bg(0).vram.length));
    this.gba.bg(0).tilemap.set(tilemap.subarray(0, this.gba.bg(0).tilemap.length));
    this.rt.SetGpuReg(REG_OFFSET_BG0CNT,
      BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(7) | BGCNT_16COLOR | BGCNT_TXT256x256);
    this.rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON);
  }

  update(_: number, deltaMs: number) {
    if (!this.booted) return;
    // Tick le runtime décomp (1:1 AgbMain main loop)
    this.rt.tickFixed(deltaMs);
    // Compose la frame GBA + push au canvas Phaser
    this.bridge.tick();
  }
}

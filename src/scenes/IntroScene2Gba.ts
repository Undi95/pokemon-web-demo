/**
 * IntroScene2Gba — Scène 2 de l'intro Pokemon Emerald (bike ride avec parallax)
 * SUR ENGINE GBA-COMPAT.
 *
 * Source de vérité 1:1 :
 *   - `D:\Projet 1\decomps\pokeemeraude\src\intro.c` Task_Scene2_Load (1357),
 *     Task_Scene2_CreateSprites (1375), Task_Scene2_BikeRide (1420).
 *   - `D:\Projet 1\decomps\pokeemeraude\src\intro_credits_graphics.c` :
 *     LoadIntroPart2Graphics (729), SetIntroPart2BgCnt (761),
 *     CreateBicycleBgAnimationTask (924), Task_BicycleBgAnimation (~940).
 *   - Timer constants intro.c lignes 162-171.
 *
 * BG configs 1:1 décomp SetIntroPart2BgCnt(1) :
 *   BG3 : priority 3, charBase 0, screenBase 6,  4bpp 256×256 — trees (parallax lent)
 *   BG2 : priority 2, charBase 0, screenBase 7,  4bpp 256×256 — clouds_bg (parallax moyen)
 *   BG1 : priority 1, charBase 1, screenBase 15, 4bpp 256×256 — grass (parallax rapide, foreground)
 *
 * Scroll horizontal via CreateBicycleBgAnimationTask(1, 0x4000, 0x400, 0x10) :
 *   BG1 hofs += 0x4000 / 65536 = 0.25 px/frame  (foreground rapide, en réalité dans le décomp ça scrolle vers la GAUCHE = -hofs)
 *   BG2 hofs += 0x400  / 65536 ≈ 0.0156 px/frame
 *   BG3 hofs += 0x10   / 65536 ≈ 0.00024 px/frame
 *
 * Note : dans le décomp Task_BicycleBgAnimation, hofs accumulé en Q16 puis high
 * word écrit dans REG_BG*HOFS. Mes accumulateurs bgXHofsQ16 reproduisent ça.
 *
 * SCOPE session :
 *   ✅ 3 BG layers Scene 2 + scrolling horizontal parallax
 *   🚧 Sprites OAM (Brendan/May + bicycle + Manectric/Torchic/Volbeat/Flygon) — TODO
 *   🚧 State machine timers (TIMER_MANECTRIC_ENTER etc) — TODO
 *
 * Pour cette première version on charge les BGs et on transition vers Title à
 * TIMER_START_SCENE_3 (skip Scene 3 pour l'instant, à implémenter ensuite).
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { loadIndexedPng, loadIndexedPngWithPal, loadGbaPal, loadTilemapBin } from '../engine/gba/png-loader';
import { LAYER_BG0, LAYER_BG1, LAYER_BG2, LAYER_BG3, LAYER_OBJ, LAYER_BD } from '../engine/gba/types';

// Timer constants 1:1 intro.c:162-171
const TIMER_START_SCENE_2     = 1026;
const TIMER_END_SCENE_2       = 1946;
const TIMER_START_SCENE_3     = 2068;

// CreateBicycleBgAnimationTask scroll speeds 1:1 décomp (Q16 fixed, par frame)
const BG1_HSPEED_Q16 = 0x4000;   // grass foreground rapide
const BG2_HSPEED_Q16 = 0x400;    // clouds_bg moyen
const BG3_HSPEED_Q16 = 0x10;     // trees fond très lent

const enum Phase {
  PLAY = 0,
  EXIT = 1,
}

export class IntroScene2Gba extends Phaser.Scene {
  private gba!: Gba;
  private bridge!: GbaPhaserBridge;
  private phase: Phase = Phase.PLAY;
  /** Frame counter relatif au début de Scene 2 (= TIMER_START_SCENE_2 dans le décomp). */
  private sceneFrame = 0;
  private exiting = false;
  private loaded = false;

  /** Q16 accumulateurs hofs par BG (high word → REG_BGnHOFS). */
  private bgHofsQ16: number[] = [0, 0, 0, 0];
  /** Accumulator pour fixed-step 60Hz (= GBA framerate exact). Phaser update peut
   *  tourner à >60Hz selon refresh rate écran (144Hz typique) → sans throttle,
   *  sceneFrame avance trop vite et la scene se termine en 7s au lieu de 17s. */
  private accumulatorMs = 0;
  private static readonly FRAME_TIME_MS = 1000 / 60;

  constructor() { super({ key: 'IntroScene2Gba' }); }

  init() {
    this.phase = Phase.PLAY;
    this.sceneFrame = 0;
    this.exiting = false;
    this.loaded = false;
    this.bgHofsQ16 = [0, 0, 0, 0];
    this.accumulatorMs = 0;
  }

  shutdown() {
    console.log('[Intro2Gba] shutdown()');
    this.bridge?.destroy();
  }

  create() {
    console.log('[Intro2Gba] create()');
    this.cameras.main.resetFX();
    this.cameras.main.setBackgroundColor('#000000');

    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'intro2-gba-frame');
    const frameImg = this.add.image(0, 0, 'intro2-gba-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    void this.loadAssets();

    // Skip universel
    this.input.keyboard?.once('keydown', () => this.exitToTitleScreen());
    this.input.once('pointerdown', () => this.exitToTitleScreen());
  }

  update(_time: number, delta: number) {
    if (this.exiting) return;
    this.bridge.tick();
    if (!this.loaded) return;

    // Fixed-step 60Hz : accumule delta, ne process qu'à 16.67ms exact.
    // Garantit que sceneFrame avance comme sur GBA (60fps réels), pas selon
    // le refresh rate écran browser (peut être 144Hz).
    this.accumulatorMs += delta;
    let safety = 5;
    while (this.accumulatorMs >= IntroScene2Gba.FRAME_TIME_MS && safety-- > 0) {
      this.accumulatorMs -= IntroScene2Gba.FRAME_TIME_MS;
      this.tickGbaFrame();
      if (this.exiting) return;
    }
    if (this.accumulatorMs > 10 * IntroScene2Gba.FRAME_TIME_MS) this.accumulatorMs = 0;
  }

  /** Une frame GBA logique (60Hz). Appelé par update() via accumulator. */
  private tickGbaFrame(): void {
    this.sceneFrame++;
    const f = this.sceneFrame;

    // 1:1 Task_BicycleBgAnimation : accumule hofs en Q16, écrit high word dans BGnHOFS.
    this.bgHofsQ16[1] += BG1_HSPEED_Q16;
    this.bgHofsQ16[2] += BG2_HSPEED_Q16;
    this.bgHofsQ16[3] += BG3_HSPEED_Q16;
    this.gba.bg(1).config.hofs = (this.bgHofsQ16[1] >> 16) & 0xFF;
    this.gba.bg(2).config.hofs = (this.bgHofsQ16[2] >> 16) & 0xFF;
    this.gba.bg(3).config.hofs = (this.bgHofsQ16[3] >> 16) & 0xFF;

    // Fade out blanc à TIMER_END_SCENE_2 - TIMER_START_SCENE_2 (= 920 frames)
    const fadeStart = TIMER_END_SCENE_2 - TIMER_START_SCENE_2;
    const sceneDuration = TIMER_START_SCENE_3 - TIMER_START_SCENE_2;
    if (f >= fadeStart && f < sceneDuration) {
      if (this.gba.blend.mode !== 2) this.gba.blend.mode = 2;
      const fadeT = (f - fadeStart) / (sceneDuration - fadeStart);
      this.gba.blend.brightness = Math.min(16, Math.round(fadeT * 16));
    }

    // Transition à TIMER_START_SCENE_3 - TIMER_START_SCENE_2 (= 1042 frames = ~17.4s @ 60Hz)
    if (f >= sceneDuration) {
      console.log('[Intro2Gba] Scene 2 ended at frame', f, '→ Title');
      this.exitToTitleScreen();
    }
  }

  private async loadAssets(): Promise<void> {
    try {
      const BASE = '/decomp/em/intro/scene_2';

      // Setup blend pour fade in 16 frames
      this.gba.blend.mode = 3;
      this.gba.blend.target1 = LAYER_BG0 | LAYER_BG1 | LAYER_BG2 | LAYER_BG3 | LAYER_OBJ | LAYER_BD;
      this.gba.blend.brightness = 16;

      // ─── BG3 : trees (4bpp 256×256, charBase 0, screenBase 6) ──────────────
      // 1:1 LoadIntroPart2Graphics : trees.png + trees_map.bin + trees pal embedded
      const treesPng = await loadIndexedPng(`${BASE}/trees.png`);
      const treesTilemap = await loadTilemapBin(`${BASE}/trees_map.bin`);
      this.gba.palette.loadBgRange(0, treesPng.palette);  // BG_PLTT_ID(0) ← trees pal
      this.gba.bg(3).vram.set(treesPng.charData.subarray(0, 32768));
      this.gba.bg(3).tilemap.set(treesTilemap.subarray(0, 4096));
      const bg3 = this.gba.bg(3).config;
      bg3.visible = true;
      bg3.priority = 3;
      bg3.charBaseIndex = 0;
      bg3.mapBaseIndex = 6;
      bg3.screenSize = 0;       // 256×256
      bg3.paletteMode = 0;       // 4bpp
      bg3.hofs = 0;
      bg3.vofs = 0;

      // ─── BG2 : clouds_bg (4bpp 256×256, charBase 0, screenBase 7) ──────────
      const cloudsBgPal = await loadGbaPal(`${BASE}/clouds_bg.pal`);
      // ⚠️ 4bpp : match pixels uniquement contre 16 premières colors (bank 0)
      const cloudsBgPng = await loadIndexedPngWithPal(`${BASE}/clouds_bg.png`, cloudsBgPal.subarray(0, 16));
      const cloudsBgTilemap = await loadTilemapBin(`${BASE}/clouds_bg_map.bin`);
      // Note : clouds_bg pal va dans bank 1 OBJ slot ? Décomp utilise BG_PLTT_ID
      // partagé entre BG2/BG3. Pour notre engine on charge à un offset disponible.
      // Pour l'instant on superpose à banks 1+ (= flat[16..]) en espérant que le
      // tilemap référence ces banks correctement. À raffiner si visuel cassé.
      this.gba.palette.loadBgRange(16, cloudsBgPal);
      this.gba.bg(2).vram.set(cloudsBgPng.charData.subarray(0, 32768));
      this.gba.bg(2).tilemap.set(cloudsBgTilemap.subarray(0, 4096));
      const bg2 = this.gba.bg(2).config;
      bg2.visible = true;
      bg2.priority = 2;
      bg2.charBaseIndex = 0;
      bg2.mapBaseIndex = 7;
      bg2.screenSize = 0;
      bg2.paletteMode = 0;
      bg2.hofs = 0;
      bg2.vofs = 0;

      // ─── BG1 : grass (4bpp 256×256, charBase 1, screenBase 15) ─────────────
      // 1:1 LoadIntroPart2Graphics : grass.png + grass_map.bin + grass pal embedded
      const grassPng = await loadIndexedPng(`${BASE}/grass.png`);
      const grassTilemap = await loadTilemapBin(`${BASE}/grass_map.bin`);
      this.gba.palette.loadBgRange(15 * 16, grassPng.palette);  // BG_PLTT_ID(15)
      this.gba.bg(1).vram.set(grassPng.charData.subarray(0, 32768));
      this.gba.bg(1).tilemap.set(grassTilemap.subarray(0, 4096));
      const bg1 = this.gba.bg(1).config;
      bg1.visible = true;
      bg1.priority = 1;
      bg1.charBaseIndex = 1;
      bg1.mapBaseIndex = 15;
      bg1.screenSize = 0;
      bg1.paletteMode = 0;
      bg1.hofs = 0;
      bg1.vofs = 0;

      // BG0 unused
      this.gba.bg(0).config.visible = false;

      this.sceneFrame = 0;
      this.loaded = true;
      console.log('[Intro2Gba] All assets loaded, scrolling start');
    } catch (e) {
      console.error('[Intro2Gba] Asset load failed:', e);
      this.exitToTitleScreen();
    }
  }

  private exitToTitleScreen(): void {
    if (this.exiting) return;
    this.exiting = true;
    this.phase = Phase.EXIT;
    console.log('[Intro2Gba] exit → TitleSceneGba');
    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Defer scene.start past camera callback (cf. IntroSceneGba même bug)
      this.time.delayedCall(0, () => {
        const mgr = this.scene.manager;
        mgr.start('TitleSceneGba');
        mgr.stop('IntroScene2Gba');
      });
    });
  }
}

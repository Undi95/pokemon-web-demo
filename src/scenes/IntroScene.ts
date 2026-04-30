import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { primeAudio, playMidiLoop, playCry, playSE } from '../engine/music';
import { composeGbaTilemap } from '../util/compose-tilemap';
import { loadOamSprite } from '../util/oam-sprite';
import { registerTransparentImage } from '../util/sprite-transparency';
// 1:1 décomp src/intro.c — timers extraits par pipeline Phase 1 (auto/src/intro-data.ts)
// Tous les TIMER_X sont des frame counts à 60fps depuis le décomp.
import {
  // Scene 1 timers
  TIMER_BIG_DROP_START, TIMER_LOGO_APPEAR, TIMER_LOGO_LETTERS_COLOR,
  TIMER_BIG_DROP_FALLS, TIMER_LOGO_BLEND_OUT, TIMER_LOGO_DISAPPEAR,
  TIMER_SMALL_DROP_1, TIMER_SMALL_DROP_2,
  TIMER_SPARKLES, TIMER_FLYGON_SILHOUETTE_APPEAR,
  TIMER_END_PAN_UP, TIMER_END_SCENE_1, TIMER_START_SCENE_2,
  // Scene 2 timers (frames absolus depuis début intro ; conv. relative via - TIMER_START_SCENE_2)
  TIMER_MANECTRIC_ENTER, TIMER_PLAYER_DRIFT_BACK, TIMER_MANECTRIC_RUN_CIRCULAR,
  TIMER_PLAYER_MOVE_FORWARD, TIMER_TORCHIC_ENTER,
  TIMER_FLYGON_ENTER, TIMER_PLAYER_MOVE_BACKWARD,
  TIMER_PLAYER_HOLD_POSITION, TIMER_PLAYER_EXIT,
  TIMER_TORCHIC_SPEED_UP, TIMER_TORCHIC_EXIT,
  TIMER_END_SCENE_2, TIMER_START_SCENE_3,
} from '../engine/decomp-data/auto/src/intro-data';

/** Frames @ 60fps → ms. 1 frame = 16.67ms. */
const FRAMES_TO_MS = 1000 / 60;

/**
 * Cinématique d'intro Pokémon Émeraude — port du décomp `src/intro.c` (3435 L).
 *
 * Source de vérité : audit Agent Explore "very thorough" du 2026-04-25.
 *
 * 4 scènes séquentielles, chacune avec sa propre state machine :
 *   - Scene 0 : copyright Game Freak / Nintendo (~5.3 sec, statique)
 *   - Scene 1 : GF Logo + pan-up + Flygon silhouette (~17 sec)
 *   - Scene 2 : joueur à vélo + Pokémon qui rejoignent (~16 sec)
 *   - Scene 3 : combat Groudon/Kyogre → Rayquaza (~50 sec)
 *
 * Skip universel : appui sur n'importe quelle touche → saute à TitleScene.
 *
 * IMPLÉMENTATION INCRÉMENTALE :
 *   ✅ Session 1 (actuelle) : structure + Scene 0 (copyright)
 *   🚧 Session 2 : Scene 1 (logo GF + pan + Flygon)
 *   🚧 Session 3 : Scene 2 (vélo + Pokémon parallax)
 *   🚧 Session 4 : Scene 3 (combat légendaires)
 *
 * Cf. DEV_LOG session 34 + DECOMP_MAP.md "Séquence boot".
 */

const BASE = '/decomp/em/intro';
const RENDERED = '/decomp/em/intro-rendered';

enum IntroPhase {
  COPYRIGHT = 0,  // Scene 0
  GF_LOGO   = 1,  // Scene 1
  BIKE_RIDE = 2,  // Scene 2
  LEGENDS   = 3,  // Scene 3
  DONE      = 4,  // → TitleScene
}

export class IntroScene extends Phaser.Scene {
  private phase = IntroPhase.COPYRIGHT;
  private phaseStartTime = 0;
  private skipped = false;

  constructor() { super({ key: 'IntroScene' }); }

  preload() {
    // Scene 0 : copyright atlas tiles + tilemap
    this.load.image('intro-copyright-atlas', `${BASE}/copyright.png`);
    this.load.binary('intro-copyright-bin', `${BASE}/copyright.bin`);

    // === Tous les assets sont pré-traités via scripts/extract-intro-rendered.py ===
    // (PNG indexed + tilemap u16 + palette JASC → PNG RGBA composé final)
    // Phaser charge directement les PNG composés, plus besoin de compose runtime.

    // Scene 1 : 4 BG layers déjà composés + sprites avec transparence
    for (let i = 0; i < 4; i++) {
      this.load.image(`intro1-bg${i}`, `${RENDERED}/scene_1/bg${i}.png`);
    }
    this.load.image('intro1-flygon', `${RENDERED}/scene_1/flygon.png`);
    this.load.image('intro1-drops-logo', `${RENDERED}/scene_1/drops_logo.png`);
    // Sparkle = spritesheet 5 frames de 16×16 (atlas 16×128 → 5 frames + padding)
    this.load.spritesheet('intro1-sparkle', `${RENDERED}/scene_1/sparkle.png`, { frameWidth: 16, frameHeight: 16 });

    // Scene 2 : 4 BG layers composés + sprites animés en spritesheets
    // (atlas verticaux du décomp = N frames empilées de WxW chacune)
    this.load.image('intro2-clouds-bg', `${RENDERED}/scene_2/clouds_bg_composed.png`);
    this.load.image('intro2-trees',     `${RENDERED}/scene_2/trees_composed.png`);
    this.load.image('intro2-houses',    `${RENDERED}/scene_2/houses_composed.png`);
    this.load.image('intro2-grass',     `${RENDERED}/scene_2/grass_composed.png`);
    // Spritesheets : { frameWidth, frameHeight } = OAM shape du décomp
    this.load.spritesheet('intro2-brendan',   `${RENDERED}/scene_2/brendan.png`,   { frameWidth: 64, frameHeight: 64 }); // 4 frames walk
    this.load.spritesheet('intro2-may',       `${RENDERED}/scene_2/may.png`,       { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('intro2-bicycle',   `${RENDERED}/scene_2/bicycle.png`,   { frameWidth: 64, frameHeight: 32 }); // 4 frames roues
    this.load.spritesheet('intro2-manectric', `${RENDERED}/scene_2/manectric.png`, { frameWidth: 64, frameHeight: 64 }); // 4 frames run
    this.load.spritesheet('intro2-torchic',   `${RENDERED}/scene_2/torchic.png`,   { frameWidth: 32, frameHeight: 32 }); // 6 frames (walk×4 + trip×2)
    this.load.spritesheet('intro2-volbeat',   `${RENDERED}/scene_2/volbeat.png`,   { frameWidth: 32, frameHeight: 32 }); // 2 frames flap
    this.load.spritesheet('intro2-flygon',    `${RENDERED}/scene_2/flygon.png`,    { frameWidth: 64, frameHeight: 64 }); // 2 frames flap

    // Scene 3 : Groudon/Kyogre avec palette bg.pal appliquée (256 colors), tilemaps composés
    this.load.image('intro3-pokeball',  `${RENDERED}/scene_3/pokeball.png`);
    this.load.image('intro3-groudon',   `${RENDERED}/scene_3/groudon.png`);
    this.load.image('intro3-kyogre',    `${RENDERED}/scene_3/kyogre.png`);
    this.load.image('intro3-rayquaza',  `${RENDERED}/scene_3/rayquaza.png`);
    this.load.image('intro3-clouds-l',  `${RENDERED}/scene_3/clouds_left.png`);
    this.load.image('intro3-clouds-r',  `${RENDERED}/scene_3/clouds_right.png`);
    this.load.image('intro3-lightning', `${RENDERED}/scene_3/lightning.png`);
    this.load.image('intro3-bubbles',   `${RENDERED}/scene_3/bubbles.png`);
    this.load.image('intro3-misc',      `${RENDERED}/scene_3/misc.png`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // Skip universel : appui clavier ou clic
    this.input.keyboard?.on('keydown', () => this.skip());
    this.input.on('pointerdown', () => this.skip());

    // Démarre le pipeline audio dès le boot pour que la musique soit prête
    // au moment de Scene 1 (Task_Scene1_FadeIn lance MUS_INTRO frame 1).
    void primeAudio();

    this.startPhase(IntroPhase.COPYRIGHT);
  }

  /** Passe à la phase suivante OU à TitleScene si DONE. */
  private nextPhase(): void {
    this.phase++;
    if (this.phase >= IntroPhase.DONE) {
      this.scene.start('TitleScene');
      return;
    }
    this.startPhase(this.phase);
  }

  /** Programme un callback à frame N depuis le début de la phase courante.
   *  1:1 décomp src/intro.c où chaque task incrémente un frame counter et
   *  vérifie `if (counter == TIMER_X)`. Notre adaptation : `time.delayedCall`
   *  à `tFrame × 16.67ms` depuis le démarrage de la phase, avec skip-guard.
   *  Source de vérité : auto/src/intro-data.ts (TIMER_X constants extraits). */
  private scheduleAt(tFrame: number, fn: () => void): Phaser.Time.TimerEvent {
    return this.time.delayedCall(tFrame * FRAMES_TO_MS, () => {
      if (this.skipped) return;
      fn();
    });
  }

  /** Variante Scene 2 : convertit un TIMER_X global (frame depuis début intro)
   *  en frame relatif depuis Scene 2 (= - TIMER_START_SCENE_2). */
  private scheduleAtScene2(globalTimerFrame: number, fn: () => void): Phaser.Time.TimerEvent {
    return this.scheduleAt(globalTimerFrame - TIMER_START_SCENE_2, fn);
  }

  /** Skip toute la cinématique → TitleScene immédiate. */
  private skip(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.tweens.killAll();
    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TitleScene');
    });
  }

  /** Lance la phase donnée. Dispatch vers la méthode de scene correspondante. */
  private startPhase(phase: IntroPhase): void {
    this.phase = phase;
    this.phaseStartTime = this.time.now;
    // Cleanup des objets de la phase précédente
    this.children.removeAll();

    switch (phase) {
      case IntroPhase.COPYRIGHT:
        this.runCopyright();
        break;
      case IntroPhase.GF_LOGO:
        this.runGfLogo();
        break;
      case IntroPhase.BIKE_RIDE:
        this.runBikeRide();
        break;
      case IntroPhase.LEGENDS:
        this.runLegends();
        break;
    }
  }

  // ============================================================================
  // SCENE 0 — Copyright (Game Freak / Nintendo) — durée totale 157 frames = 2.6s
  // ============================================================================
  // Source `src/intro.c:SetUpCopyrightScreen` (gMain.state machine) :
  //   - state 0 (COPYRIGHT_INITIALIZE)   : setup VRAM/PLTT + fade in 16 frames
  //   - state 1..139 (default fall-through): hold (state++ chaque frame)
  //   - state 140 (COPYRIGHT_START_FADE) : démarre fade out 16 frames vers noir
  //   - state 141 (COPYRIGHT_START_INTRO): wait fade complete → Scene 1
  //
  // Assets :
  //   - copyright.png = atlas 312×8 (39 tiles 8×8) palette grayscale
  //   - copyright.bin = tilemap 32×32 entries u16, contenu utile rows 6-12, cols 7-22
  //
  // Le BG GBA s'affiche au coin (0,0) sans offset → setOrigin(0,0) à (0,0)
  // reproduit exactement la fenêtre visible 240×160 (les 16 px de droite du
  // canvas 256 sont coupés comme sur GBA).
  private runCopyright(): void {
    this.cameras.main.setBackgroundColor('#000000');

    const tilemapBuf = this.cache.binary.get('intro-copyright-bin') as ArrayBuffer;
    composeGbaTilemap(this, 'intro-copyright-atlas', tilemapBuf, 'intro-copyright', {
      widthTiles: 32, heightTiles: 32,
    });

    const img = this.add.image(0, 0, 'intro-copyright').setOrigin(0, 0);
    img.setAlpha(0);

    // Fade in 16 frames = 267ms
    this.tweens.add({ targets: img, alpha: 1, duration: 267, ease: 'Linear' });

    // Hold 124 frames effectif (140 - 16 fade in) = 2067ms, puis fade out 16f = 267ms
    this.time.delayedCall(267 + 2067, () => {
      if (this.skipped) return;
      this.tweens.add({
        targets: img, alpha: 0, duration: 267, ease: 'Linear',
        onComplete: () => this.nextPhase(),
      });
    });
  }

  // ============================================================================
  // SCENE 1 — Game Freak Logo + Pan Up + Flygon Silhouette (~17 sec, ~1026 frames)
  // ============================================================================
  // Source `src/intro.c:Task_Scene1_*` :
  //   - 4 BG layers parallax (bg0..bg3) tilemaps 32×32 partageant l'atlas bg.png
  //   - Pan up vertical via vOfs registers GBA (deltas Q16 fixed-point)
  //   - GF logo + water drops via sprites OAM
  //   - MUS_INTRO démarre frame 1
  //
  // SIMPLIFICATIONS MVP (vs décomp pixel-perfect) :
  //   - Pas d'animation lettres GF avec affine matrices (juste fade in/out)
  //   - Water drops simplifiés (1 sprite par drop, pas de upper/lower/reflection)
  //   - Sparkles via Phaser tween (pas de spritesheet 4-frame)
  //   - Pas de palette cycle pour les lettres GF (couleur fixe)
  //
  // Timeline approximative (frame counter intro.c) :
  //    1     : MUS_INTRO start, fade in palette
  //   76     : big water drop appears (slide leaf)
  //  128-272 : GF logo blend in puis blend out
  //  368/384 : 2 small drops
  //  560-832 : sparkles génération (11 positions)
  //  832     : Flygon silhouette monte depuis le bas
  //  904-1007: pan up se termine
  // 1007-1026: fade out white → Scene 2
  /**
   * Scene 1 — GF Logo + drops + Flygon silhouette + pan-up.
   * Refait 1:1 décomp via timer scheduler consommant TIMER_X depuis pipeline
   * (auto/src/intro-data.ts). Chaque event = appel scheduleAt(TIMER_X, fn).
   *
   * Timeline complète (TIMER_X frames @ 60fps, source décomp src/intro.c) :
   *   t=0    : init BG layers + démarrage musique MUS_INTRO + pan-up tween
   *   t=76   (TIMER_BIG_DROP_START)             : grosse goutte démarre tomber
   *   t=128  (TIMER_LOGO_APPEAR)                : logo GF fade in
   *   t=144  (TIMER_LOGO_LETTERS_COLOR)         : letters change couleur
   *   t=251  (TIMER_BIG_DROP_FALLS)             : grosse goutte se brise
   *   t=256  (TIMER_LOGO_BLEND_OUT)             : logo blend mode out
   *   t=272  (TIMER_LOGO_DISAPPEAR)             : logo fade out complet
   *   t=368  (TIMER_SMALL_DROP_1)               : petite goutte 1
   *   t=384  (TIMER_SMALL_DROP_2)               : petite goutte 2
   *   t=560  (TIMER_SPARKLES)                   : 11 sparkles flash sequence
   *   t=832  (TIMER_FLYGON_SILHOUETTE_APPEAR)   : Flygon silhouette monte
   *   t=904  (TIMER_END_PAN_UP)                 : fin du pan-up
   *   t=1007 (TIMER_END_SCENE_1)                : fade out blanc
   *   t=1026 (TIMER_START_SCENE_2)              : Scene 2 démarre
   */
  private runGfLogo(): void {
    void playMidiLoop('/decomp/em/music/mus_intro.mid');

    // 1. 4 BG layers parallax (PNGs composés via extract-intro-rendered.py).
    // Speeds = u16 fractions du décomp (intro.c BG_REG_*HOFS_PER_FRAME).
    const bgLayers: Phaser.GameObjects.Image[] = [];
    const PAN_SPEEDS = [
      0x8000 / 0x10000, // bg0 = 0.5 px/frame
      0x8000 / 0x10000, // bg1 = 0.5
      0x6000 / 0x10000, // bg2 = 0.375 (le plus lent)
      0xC000 / 0x10000, // bg3 = 0.75 (le plus rapide)
    ];
    const INITIAL_VOFS = [40, 24, 80, 0];
    for (let i = 0; i < 4; i++) {
      const img = this.add.image(0, -INITIAL_VOFS[i], `intro1-bg${i}`).setOrigin(0, 0);
      img.setDepth(i);
      bgLayers.push(img);
    }

    // 2. Pan up : tween Y de chaque layer pendant TIMER_END_SCENE_1 frames
    const phaseDurationMs = TIMER_END_SCENE_1 * FRAMES_TO_MS;
    for (let i = 0; i < 4; i++) {
      const distancePx = PAN_SPEEDS[i] * TIMER_END_SCENE_1;
      this.tweens.add({
        targets: bgLayers[i],
        y: bgLayers[i].y - distancePx,
        duration: phaseDurationMs,
        ease: 'Linear',
      });
    }

    // 3. GF logo : sprite résolu via oam-sprites.json (auto-extract du décomp)
    const logoFrame = loadOamSprite(this, 'GameFreakLogo', 'intro1-drops-logo');
    const logo = this.add.image(GAME_W / 2, GAME_H / 2 - 6, 'intro1-drops-logo', logoFrame);
    logo.setAlpha(0).setDepth(10);

    // Logo fade in à TIMER_LOGO_APPEAR (frame 128)
    this.scheduleAt(TIMER_LOGO_APPEAR, () => {
      this.tweens.add({
        targets: logo, alpha: 1,
        duration: (TIMER_LOGO_LETTERS_COLOR - TIMER_LOGO_APPEAR) * FRAMES_TO_MS,  // 16 frames
        ease: 'Linear',
      });
    });

    // Logo blend out à TIMER_LOGO_BLEND_OUT (frame 256) → disappear TIMER_LOGO_DISAPPEAR (272)
    this.scheduleAt(TIMER_LOGO_BLEND_OUT, () => {
      this.tweens.add({
        targets: logo, alpha: 0,
        duration: (TIMER_LOGO_DISAPPEAR - TIMER_LOGO_BLEND_OUT) * FRAMES_TO_MS,  // 16 frames
        ease: 'Linear',
      });
    });

    // 4. Sparkles : 11 positions fixes (sSparkleCoords du décomp), démarrent à
    // TIMER_SPARKLES, échelonnées de ~12 frames chacune.
    const SPARKLE_POS: ReadonlyArray<[number, number]> = [
      [124, 40], [102, 30], [77, 30], [54, 15], [148, 9],
      [63, 28], [93, 40], [148, 32], [173, 41], [94, 20], [208, 38],
    ];
    if (!this.anims.exists('sparkle-flash')) {
      this.anims.create({
        key: 'sparkle-flash',
        frames: this.anims.generateFrameNumbers('intro1-sparkle', { frames: [0, 1, 2, 3, 4] }),
        frameRate: 30, repeat: -1,
      });
    }
    SPARKLE_POS.forEach(([x, y], idx) => {
      this.scheduleAt(TIMER_SPARKLES + idx * 12, () => {
        const s = this.add.sprite(x, y, 'intro1-sparkle', 0).play('sparkle-flash');
        s.setDepth(15);
        this.time.delayedCall(200, () => s.destroy());
      });
    });

    // 5. Flygon silhouette à TIMER_FLYGON_SILHOUETTE_APPEAR (frame 832)
    // Monte du bas + oscillation horizontale Sin.
    this.scheduleAt(TIMER_FLYGON_SILHOUETTE_APPEAR, () => {
      const flygonFrame = loadOamSprite(this, 'FlygonSilhouette', 'intro1-flygon');
      const flygon = this.add.image(GAME_W / 2, GAME_H + 16, 'intro1-flygon', flygonFrame);
      flygon.setDepth(8);
      // Distance & duration depuis TIMER_FLYGON_SILHOUETTE_APPEAR à TIMER_END_PAN_UP
      const flygonDurationMs = (TIMER_END_PAN_UP - TIMER_FLYGON_SILHOUETTE_APPEAR) * FRAMES_TO_MS;
      this.tweens.add({
        targets: flygon, y: -32, duration: flygonDurationMs, ease: 'Sine.InOut',
      });
      // Oscillation X (1:1 décomp Sin lookup)
      const startTime = this.time.now;
      flygon.setData('updater', () => {
        const t = (this.time.now - startTime) / 1000;
        flygon.x = GAME_W / 2 + Math.sin(t * 2) * 30;
      });
      this.events.on('update', () => {
        const upd = flygon.getData('updater');
        if (upd && flygon.active) upd();
      });
    });

    // 6. Fade out blanc à TIMER_END_SCENE_1 → Scene 2 à TIMER_START_SCENE_2.
    // Durée fade = TIMER_START_SCENE_2 - TIMER_END_SCENE_1 = 19 frames (~317ms).
    this.scheduleAt(TIMER_END_SCENE_1, () => {
      const fadeDurationMs = (TIMER_START_SCENE_2 - TIMER_END_SCENE_1) * FRAMES_TO_MS;
      this.cameras.main.fadeOut(fadeDurationMs, 255, 255, 255);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.cameras.main.resetFX();
        this.nextPhase();
      });
    });
  }

  // ============================================================================
  // SCENE 2 — Bike Ride + Running Pokémon (~16 sec, frames 1026-1946)
  // ============================================================================
  // Sprites OAM (résolus via oam-sprites.json) :
  //   - Brendan/May 64×64 + BrendanBicycle/MayBicycle 64×32
  //   - Manectric 64×64, Torchic 32×32, Volbeat 32×32, FlygonLatias 64×64
  //
  // Backgrounds parallax (clouds_bg + trees + houses + grass) avec scroll horizontal.
  //
  // Timeline (frames depuis 1026 = t=0 dans cette scène) :
  //   t=0      : init, sprites créés hors écran à droite
  //   t=62     : Manectric apparaît (DISPLAY_WIDTH+32, 128)
  //   t=83     : Player drift back (sState=1, x++)
  //   t=142    : Manectric run circular
  //   t=188    : Player forward (sState=0, x--)
  //   t=198    : Torchic apparaît (DISPLAY_WIDTH+48, 110)
  //   t=368    : Flygon enters (Latias variant)
  //   t=372    : Player back (sState=2, x++)
  //   t=550    : Player static (sState=3)
  //   t=701    : Player exit (sState=4, x-=2)
  //   t=709    : Torchic speedup
  //   t=830    : Torchic exit
  //   t=920    : Fade out blanc → Scene 3
  private runBikeRide(): void {
    // Détermine gender player (par défaut Brendan, sera depuis save data plus tard)
    const isMay = false;
    const playerKey = isMay ? 'intro2-may' : 'intro2-brendan';
    const playerSprite = isMay ? 'May' : 'Brendan';
    const bicycleSprite = isMay ? 'MayBicycle' : 'BrendanBicycle';

    // 1. 4 BG layers parallax horizontal (PNGs pré-composés)
    const bgLayers: { img: Phaser.GameObjects.Image; speed: number }[] = [];
    const BG_CONFIGS: [string, number, number][] = [
      ['intro2-clouds-bg', 0, 8],   // ciel
      ['intro2-trees',     1, 30],  // arbres
      ['intro2-houses',    2, 50],  // maisons
      ['intro2-grass',     3, 80],  // herbe (premier plan)
    ];
    for (const [key, depth, speed] of BG_CONFIGS) {
      const img = this.add.image(0, 0, key).setOrigin(0, 0);
      img.setDepth(depth);
      bgLayers.push({ img, speed });
    }

    // 2. Sprites Pokémon avec animations Phaser (cf. audit Agent timings)
    // Création des animations si pas déjà créées (cache global)
    const ensureAnim = (key: string, sheet: string, frames: number[], frameRate: number, repeat = -1) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(sheet, { frames }),
        frameRate, repeat,
      });
    };
    ensureAnim('manectric-run', 'intro2-manectric', [0, 1, 2, 3], 15);  // 4t per frame = 15fps
    ensureAnim('torchic-walk',  'intro2-torchic',   [0, 1, 2, 1], 12);  // 5t per frame = 12fps
    ensureAnim('torchic-run',   'intro2-torchic',   [0, 1, 2, 1], 20);  // 3t per frame = 20fps
    ensureAnim('volbeat-flap',  'intro2-volbeat',   [0, 1], 10);
    ensureAnim('flygon-flap',   'intro2-flygon',    [0, 1], 8);
    ensureAnim('brendan-bike',  'intro2-brendan',   [0, 1, 2, 3], 15);
    ensureAnim('may-bike',      'intro2-may',       [0, 1, 2, 3], 15);
    ensureAnim('bike-roue',     'intro2-bicycle',   [0, 1, 2, 3], 15);

    const manectric = this.add.sprite(GAME_W + 32, 128, 'intro2-manectric', 0);
    manectric.setDepth(5).setVisible(false).play('manectric-run');

    const torchic = this.add.sprite(GAME_W + 48, 110, 'intro2-torchic', 0);
    torchic.setDepth(5).setVisible(false).play('torchic-walk');

    const volbeat = this.add.sprite(GAME_W + 32, 80, 'intro2-volbeat', 0);
    volbeat.setDepth(5).setVisible(false).play('volbeat-flap');

    const flygon = this.add.sprite(-64, 60, 'intro2-flygon', 0);
    flygon.setDepth(6).setVisible(false).play('flygon-flap');

    // 3. Player sur vélo (2 sprites animés simultanément)
    const player = this.add.sprite(GAME_W + 32, 100, playerKey, 0).play(isMay ? 'may-bike' : 'brendan-bike');
    const bike = this.add.sprite(GAME_W + 32, 108, 'intro2-bicycle', 0).play('bike-roue');
    player.setDepth(7);
    bike.setDepth(7);

    // 4. Scroll BG parallax pendant toute la durée Scene 2.
    // 1:1 décomp : Scene 2 dure TIMER_END_SCENE_2 - TIMER_START_SCENE_2 = 920 frames.
    const sceneDurationFrames = TIMER_END_SCENE_2 - TIMER_START_SCENE_2;
    const sceneDurationMs = sceneDurationFrames * FRAMES_TO_MS;
    for (const { img, speed } of bgLayers) {
      const distance = (sceneDurationMs / 1000) * speed;
      this.tweens.add({
        targets: img, x: img.x - distance,
        duration: sceneDurationMs, ease: 'Linear',
      });
    }

    // 5. Timeline 1:1 décomp via TIMER_X (auto/src/intro-data.ts).
    // Tous les delays viennent du pipeline — plus aucun ms hardcodé.

    // Manectric à TIMER_MANECTRIC_ENTER (frame 1088 = relative 62) — entre par la droite
    this.scheduleAtScene2(TIMER_MANECTRIC_ENTER, () => {
      manectric.setVisible(true);
      this.tweens.add({
        targets: manectric, x: 100,
        duration: (TIMER_MANECTRIC_RUN_CIRCULAR - TIMER_MANECTRIC_ENTER) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Player entrée initiale jusqu'à TIMER_PLAYER_DRIFT_BACK
    this.tweens.add({
      targets: [player, bike], x: 120,
      duration: (TIMER_PLAYER_DRIFT_BACK - TIMER_START_SCENE_2) * FRAMES_TO_MS,
      delay: 0, ease: 'Linear',
    });

    // Player drift back (sState=1, x++) à TIMER_PLAYER_DRIFT_BACK
    this.scheduleAtScene2(TIMER_PLAYER_DRIFT_BACK, () => {
      this.tweens.add({
        targets: [player, bike], x: '+=20',
        duration: (TIMER_PLAYER_MOVE_FORWARD - TIMER_PLAYER_DRIFT_BACK) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Player move forward (sState=0, x--) à TIMER_PLAYER_MOVE_FORWARD
    this.scheduleAtScene2(TIMER_PLAYER_MOVE_FORWARD, () => {
      this.tweens.add({
        targets: [player, bike], x: '-=30',
        duration: (TIMER_PLAYER_MOVE_BACKWARD - TIMER_PLAYER_MOVE_FORWARD) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Player move backward (sState=2, x++) à TIMER_PLAYER_MOVE_BACKWARD
    this.scheduleAtScene2(TIMER_PLAYER_MOVE_BACKWARD, () => {
      this.tweens.add({
        targets: [player, bike], x: '+=15',
        duration: (TIMER_PLAYER_HOLD_POSITION - TIMER_PLAYER_MOVE_BACKWARD) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Player exit (sState=4, x-=2) à TIMER_PLAYER_EXIT
    this.scheduleAtScene2(TIMER_PLAYER_EXIT, () => {
      this.tweens.add({
        targets: [player, bike], x: -100,
        duration: (TIMER_END_SCENE_2 - TIMER_PLAYER_EXIT) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Torchic enter à TIMER_TORCHIC_ENTER, court jusqu'au speed_up
    this.scheduleAtScene2(TIMER_TORCHIC_ENTER, () => {
      torchic.setVisible(true);
      this.tweens.add({
        targets: torchic, x: 80,
        duration: (TIMER_TORCHIC_SPEED_UP - TIMER_TORCHIC_ENTER) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Torchic speedup → exit à TIMER_TORCHIC_SPEED_UP
    this.scheduleAtScene2(TIMER_TORCHIC_SPEED_UP, () => {
      torchic.play('torchic-run');
      this.tweens.add({
        targets: torchic, x: -50,
        duration: (TIMER_TORCHIC_EXIT - TIMER_TORCHIC_SPEED_UP) * FRAMES_TO_MS,
        ease: 'Linear',
      });
    });

    // Volbeat : entre tôt (pas de TIMER_X explicit, hardcoded ~30 frames),
    // fait des oscillations (trajectoire figure-8 simplifiée)
    this.scheduleAt(30, () => {
      volbeat.setVisible(true);
      const startTime = this.time.now;
      const updater = () => {
        if (!volbeat.active) return;
        const t = (this.time.now - startTime) / 1000;
        volbeat.x = GAME_W - t * 18;
        volbeat.y = 80 + Math.sin(t * 3) * 30;
        if (volbeat.x < -32) volbeat.destroy();
      };
      this.events.on('update', updater);
    });

    // Flygon (Latias) enters à TIMER_FLYGON_ENTER (frame 1394 = relative 368)
    this.scheduleAtScene2(TIMER_FLYGON_ENTER, () => {
      flygon.setVisible(true);
      const startTime = this.time.now;
      const updater = () => {
        if (!flygon.active) return;
        const t = (this.time.now - startTime) / 1000;
        flygon.x = -64 + t * 50;
        flygon.y = 60 + Math.sin(t * 2) * 15;
      };
      this.events.on('update', updater);
    });

    // 6. Fade out blanc final à TIMER_END_SCENE_2 → Scene 3 à TIMER_START_SCENE_3
    this.scheduleAtScene2(TIMER_END_SCENE_2, () => {
      const fadeDurationMs = (TIMER_START_SCENE_3 - TIMER_END_SCENE_2) * FRAMES_TO_MS;
      this.cameras.main.fadeOut(fadeDurationMs, 255, 255, 255);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.cameras.main.resetFX();
        this.nextPhase();
      });
    });
  }

  // ============================================================================
  // SCENE 3 — Legendaries Battle (~50 sec, frames 2068-5100)
  // ============================================================================
  // Sequence (timings approximatifs depuis t=0 = entrée Scene 3) :
  //   t=0      : MUS_INTRO_BATTLE start, Pokéball spin (zoom/rotate affine BG2)
  //   t=2000   : Pokéball fade vers blanc, transition Groudon
  //   t=3500   : Groudon affiché (bg + sprite) + rocks flottants + palette pulse
  //   t=6000   : Groudon cry (PlayCryInternal SPECIES_GROUDON)
  //   t=9500   : Fade vers blanc, transition Kyogre
  //   t=11000  : Kyogre affiché + bubbles + palette cycle
  //   t=14000  : Kyogre cry
  //   t=18000  : Fade vers blanc, transition clouds
  //   t=20000  : Clouds collide au centre (BG0 gauche + BG1 droite, vitesses inverses)
  //   t=25000  : Lightning bolts (3 sprites x2 sets)
  //   t=27000  : Rayquaza pan-in + zoom (PanFadeAndZoomScreen)
  //   t=32000  : Rayquaza orb create (CreateSprite RayquazaOrb) + SE_INTRO_BLAST
  //   t=34000  : Orb blend dark
  //   t=36000  : Fade blanc final → TitleScene
  //
  // SIMPLIFICATIONS MVP (sans affine GBA hardware) :
  //   - Pokéball spin : Phaser tween rotation/scale (vs affine matrix)
  //   - Groudon/Kyogre : sprites entiers (vs tilemap 512×512 GBA + scroll)
  //   - Pas de palette pulse/cycle (vs CpuCopy16 PLTT chaque frame)
  //   - Pas de WIN0/WIN1 cinema bars (vs OBJWIN GBA)
  //   - Rocks/bubbles simplifiés (sprites simples, pas de OAM affine)
  private runLegends(): void {
    void playMidiLoop('/decomp/em/music/mus_intro_battle.mid');

    this.cameras.main.setBackgroundColor('#000000');

    // 1. Pokéball spin (t=0 → 2000ms) — PNG composé via tilemap pokeball_map.bin
    const pokeball = this.add.image(GAME_W / 2, GAME_H / 2, 'intro3-pokeball');
    pokeball.setDepth(0).setScale(0.5);
    // Spin + grow
    this.tweens.add({
      targets: pokeball, scale: 1.5, duration: 2000, ease: 'Quad.Out',
    });
    this.tweens.add({
      targets: pokeball, angle: 720, duration: 2000, ease: 'Linear',
    });
    // Fade out vers la fin
    this.time.delayedCall(1700, () => {
      if (this.skipped) return;
      this.tweens.add({ targets: pokeball, alpha: 0, duration: 300 });
    });

    // 2. Groudon (t=3500 → 9500ms) — PNG 128×128 avec palette bg.pal appliquée
    this.time.delayedCall(3500, () => {
      if (this.skipped) return;
      const groudon = this.add.image(GAME_W / 2, GAME_H / 2, 'intro3-groudon');
      groudon.setDepth(2).setAlpha(0).setScale(1.2);
      this.tweens.add({ targets: groudon, alpha: 1, duration: 500 });
      // Pan effect : groudon "respire" (subtle scale pulse)
      this.tweens.add({
        targets: groudon, scale: 1.4, duration: 1500, yoyo: true, repeat: 1,
        ease: 'Sine.InOut',
      });
      // Cri Groudon à t+2500ms (frame équivalent ~6000ms global)
      this.time.delayedCall(2500, () => {
        if (this.skipped) return;
        try { playCry('groudon'); } catch { /* ignore */ }
      });
      // Fade out à t+5500ms
      this.time.delayedCall(5500, () => {
        if (!this.skipped) this.tweens.add({ targets: groudon, alpha: 0, duration: 500 });
      });
    });

    // 3. Kyogre (t=11000 → 18000ms) — PNG 128×128 avec palette bg.pal appliquée
    this.time.delayedCall(11000, () => {
      if (this.skipped) return;
      const kyogre = this.add.image(GAME_W / 2, GAME_H / 2, 'intro3-kyogre');
      kyogre.setDepth(2).setAlpha(0).setScale(1.2);
      this.tweens.add({ targets: kyogre, alpha: 1, duration: 500 });
      this.tweens.add({
        targets: kyogre, scale: 1.4, duration: 1500, yoyo: true, repeat: 1,
        ease: 'Sine.InOut',
      });
      // Bubbles autour du kyogre
      const BUBBLE_POS: [number, number][] = [
        [66, 64], [96, 96], [128, 64], [144, 48], [160, 72], [176, 96],
      ];
      const bubbleFrame = loadOamSprite(this, 'Bubbles', 'intro3-bubbles');
      BUBBLE_POS.forEach(([x, y], i) => {
        this.time.delayedCall(500 + i * 100, () => {
          if (this.skipped) return;
          const b = this.add.image(x, y, 'intro3-bubbles', bubbleFrame);
          b.setDepth(3);
          this.tweens.add({
            targets: b, y: y - 60, alpha: 0, duration: 2000, ease: 'Linear',
            onComplete: () => b.destroy(),
          });
        });
      });
      this.time.delayedCall(2500, () => {
        if (this.skipped) return;
        try { playCry('kyogre'); } catch { /* ignore */ }
      });
      this.time.delayedCall(6000, () => {
        if (!this.skipped) this.tweens.add({ targets: kyogre, alpha: 0, duration: 500 });
      });
    });

    // 4. Clouds collide (t=20000 → 25000ms) — PNGs left/right pré-composés
    this.time.delayedCall(20000, () => {
      if (this.skipped) return;
      const cloudL = this.add.image(-GAME_W, 0, 'intro3-clouds-l').setOrigin(0, 0).setDepth(4);
      const cloudR = this.add.image(GAME_W, 0, 'intro3-clouds-r').setOrigin(0, 0).setDepth(4);
      this.tweens.add({ targets: cloudL, x: 0, duration: 4000, ease: 'Quad.In' });
      this.tweens.add({ targets: cloudR, x: 0, duration: 4000, ease: 'Quad.In' });
    });

    // 5. Lightning bolts (t=25000 → 27000ms)
    this.time.delayedCall(25000, () => {
      if (this.skipped) return;
      const lightningFrame = loadOamSprite(this, 'Lightning', 'intro3-lightning');
      const POSITIONS: [number, number][] = [
        [200, 48], [200, 80], [200, 112], [40, 48], [40, 80], [40, 112],
      ];
      POSITIONS.forEach(([x, y], i) => {
        this.time.delayedCall(i * 150, () => {
          if (this.skipped) return;
          const bolt = this.add.image(x, y, 'intro3-lightning', lightningFrame);
          bolt.setDepth(8);
          this.tweens.add({
            targets: bolt, alpha: 0, duration: 300,
            onComplete: () => bolt.destroy(),
          });
        });
      });
    });

    // 6. Rayquaza pan-in + zoom (t=27000 → 34000ms) — PNG composé 256×256
    this.time.delayedCall(27000, () => {
      if (this.skipped) return;
      const rayquaza = this.add.image(GAME_W / 2, GAME_H / 2, 'intro3-rayquaza');
      rayquaza.setDepth(6).setAlpha(0).setScale(0.5);
      this.tweens.add({ targets: rayquaza, alpha: 1, duration: 800 });
      this.tweens.add({ targets: rayquaza, scale: 0.9, duration: 5000, ease: 'Quad.Out' });
      // Cri Rayquaza
      this.time.delayedCall(2000, () => {
        if (!this.skipped) {
          try { playCry('rayquaza'); } catch { /* ignore */ }
        }
      });
    });

    // 7. Orb create + flash final (t=32000 → 36000ms)
    this.time.delayedCall(32000, () => {
      if (this.skipped) return;
      const orbFrame = loadOamSprite(this, 'RayquazaOrb', 'intro3-misc');
      const orb = this.add.image(GAME_W / 2, GAME_H / 2 + 8, 'intro3-misc', orbFrame);
      orb.setDepth(10).setScale(0.5);
      void playSE('se_intro_blast');
      this.tweens.add({
        targets: orb, scale: 3, alpha: 0, duration: 2000, ease: 'Quad.Out',
        onComplete: () => orb.destroy(),
      });
    });

    // 8. Fade blanc final → TitleScene (t=35000ms)
    this.time.delayedCall(35000, () => {
      if (this.skipped) return;
      this.cameras.main.fadeOut(800, 255, 255, 255);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.cameras.main.resetFX();
        this.nextPhase();
      });
    });
  }
}

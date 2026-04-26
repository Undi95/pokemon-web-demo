import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { applyAlphaFromTopLeft, applyAlphaToSpritesheet } from '../util/image-alpha';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { createMenu } from '../engine/menu';
import { composeBgTilemap } from '../engine/compose-bg-tilemap';
import { playMidiLoop, playSE, playCry } from '../engine/music';
import { preloadWindowAssets, setupWindowAssets } from '../engine/window-renderer';
// Décomp data : structures auto-générées depuis main_menu.c (decomp-data/main-menu-data.ts)
// Permet de consommer les constantes 1:1 sans hardcode (ex. timer 0xD8 frames, fades).
import { PALETTE_FADES } from '../engine/decomp-data/main-menu-data';
import { beginPaletteFade } from '../engine/palette-fade';

const BIRCH_URL = '/decomp/em/boot/birch_speech/birch.png';
const SHADOW_TILES_URL = '/decomp/em/boot/birch_speech/shadow.png';
const BG_MAP_URL = '/decomp/em/boot/birch_speech/map.bin';
const STRINGS_URL = '/decomp/em/strings.json';
const LOTAD_URL = '/decomp/em/pokemon/lotad/front.png';
// PNG -rgba.png variants : pré-process Python (process_sprite_alpha.py) qui lit
// indexed et sort RGBA avec idx 0 → alpha 0. Évite le problème des palettes où
// idx 0 = idx N (ex. poke.png idx 0 et idx 5 = blanc) qui casse RGB-transparentise.
const POKEBALL_URL = '/decomp/em/balls/poke-rgba.png';
const PARTICLES_URL = '/decomp/em/battle_anims/particles-rgba.png';

export class BirchSpeechScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private s!: Record<string, string>;
  private platformLayerRef: Phaser.GameObjects.Image | null = null;
  private lotadSprite: Phaser.GameObjects.Image | null = null;

  constructor() { super({ key: 'BirchSpeechScene' }); }

  preload() {
    this.load.image('birch-src', BIRCH_URL);
    this.load.image('lotad-src', LOTAD_URL);
    this.load.spritesheet('pokeball-src', POKEBALL_URL, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('particles-src', PARTICLES_URL, { frameWidth: 8, frameHeight: 8 });
    if (!this.cache.json.has('strings')) this.load.json('strings', STRINGS_URL);
    preloadDialogueAssets(this);
    preloadBitmapFont(this);
    preloadWindowAssets(this);
  }

  create() {
    // Fallback bg color tant que le BG composé async n'est pas prêt
    this.cameras.main.setBackgroundColor('#082058');
    setupBitmapFont(this);
    setupWindowAssets(this);
    this.s = this.cache.json.get('strings') as Record<string, string>;
    this.dialogue = new DialogueBox(this);

    // BG complet composé (sky + grass + platform tous visibles).
    void composeBgTilemap(this, {
      cacheKey: 'birch-speech-bg',
      tilesUrl: SHADOW_TILES_URL,
      mapBinUrl: BG_MAP_URL,
      mapW: 32, mapH: 20,
    }).then(key => {
      if (key) this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-10);
    });

    // Overlay noir sur l'ellipse platform (simulation `sBirchSpeechPlatformBlackPal`
    // du décomp main_menu.c:1282 qui charge palette 1 en NOIR initial puis fade
    // vers normal à 3.6s via Task_NewGameBirchSpeech_FadePlatformOut).
    //
    // Position EXACTE depuis dump map.bin (tilemap.bin parsing) :
    //   - Platform tiles aux rows 9-12, cols 7-22 inclusive (16 cols × 4 rows)
    //   - Pixel rect : x=56 à x=184 (128 wide), y=72 à y=104 (32 tall)
    // Rect mask plutôt qu'ellipse : couvre les coins du rect platform (les 4 px
    // qui dépassaient l'ellipse). Le BG autour étant noir uniforme (tile 5 = empty),
    // un rect noir se fond dedans = invisible jusqu'au reveal.
    const platformMask = this.add.graphics();
    platformMask.fillStyle(0x000000, 1);
    platformMask.fillRect(56, 72, 128, 32);
    platformMask.setDepth(-8);
    this.platformLayerRef = platformMask as unknown as Phaser.GameObjects.Image;

    // Birch sprite 64×64 position 1:1 décomp (136, 60) — INVISIBLE au start (alpha 0)
    // 1:1 décomp `Task_NewGameBirchSpeech_WaitToShowBirch` main_menu.c:1299-1318
    applyAlphaFromTopLeft(this, 'birch-src', 'birch-a');
    const birchSprite = this.add.image(136, 60, 'birch-a').setOrigin(0.5, 0.5).setDepth(5);
    birchSprite.setAlpha(0);

    // Lotad sprite 64×64 invisible — révélé sur EXT_CTRL_CODE_PAUSE du dialog
    // Position 1:1 décomp main_menu.c:1373-1374
    applyAlphaFromTopLeft(this, 'lotad-src', 'lotad-a');
    this.lotadSprite = this.add.image(100, 75, 'lotad-a').setOrigin(0.5, 0.5).setDepth(4);
    this.lotadSprite.setAlpha(0);

    // pokeball-src et particles-src sont maintenant les *-rgba.png pré-processés
    // → alpha déjà correct, pas besoin de transparentise runtime.

    // Musique 1:1 décomp (`PlayBGM(MUS_ROUTE122)` main_menu.c:1295)
    void playMidiLoop('/decomp/em/music/mus_route122.mid');

    void this.runIntroAndSpeech(birchSprite);
  }

  /**
   * Sequence d'intro 1:1 décomp main_menu.c:1266-1344 :
   *   1. Task_NewGameBirchSpeech_Init : `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)`
   *      = fade-in depuis noir 16 frames (267ms). Puis tTimer = 0xD8 (216 frames = 3.6s).
   *   2. Task_NewGameBirchSpeech_WaitToShowBirch : décrémente tTimer 216 frames.
   *      Quand 0 : show Birch sprite + fade-in alpha sur 10 frames.
   *   3. Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome : tTimer = 80 frames (1.3s).
   *      Quand 0 : show dialog box + AddTextPrinter "Bonjour!".
   */
  private async runIntroAndSpeech(birchSprite: Phaser.GameObjects.Image) {
    // Step 1 : fade-in initial depuis noir (PALETTE_FADES[0] dans main-menu-data.ts =
    // {palettes: PALETTES_ALL, delay: 0, startY: 16, endY: 0, color: RGB_BLACK})
    await beginPaletteFade(this, PALETTE_FADES[0]);

    // Step 2 : timer 3.6s avant Birch fade-in (1:1 tTimer = 0xD8 = 216 frames)
    await this.delay(216 * 1000 / 60); // 3600ms

    // Step 3 : Birch sprite fade-in (alpha 0→1) + platform "lights up" SIMULTANÉMENT.
    // 1:1 décomp Task_NewGameBirchSpeech_WaitToShowBirch (main_menu.c:1314-1315) :
    //   NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 10);  // sprite alpha
    //   NewGameBirchSpeech_StartFadePlatformOut(taskId, 20);          // platform pal black→normal
    // Sur web : Birch sprite alpha 0→1 + platform mask alpha 1→0 (= reveal du gold ellipse)
    await Promise.all([
      new Promise<void>((resolve) => {
        this.tweens.add({
          targets: birchSprite, alpha: 1, duration: 10 * 1000 / 60,
          onComplete: () => resolve(),
        });
      }),
      new Promise<void>((resolve) => {
        if (!this.platformLayerRef) { resolve(); return; }
        this.tweens.add({
          targets: this.platformLayerRef, alpha: 0, duration: 20 * 1000 / 60,
          onComplete: () => resolve(),
        });
      }),
    ]);

    // Step 4 : timer 80 frames avant le 1er dialog (1:1 tTimer = 80)
    await this.delay(80 * 1000 / 60); // ~1333ms

    // Step 5 : enchaîner les dialogues normalement
    await this.runSpeech();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  private async runSpeech() {
    // 1:1 décomp main_menu.c task chain :
    //   Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome → show Welcome
    //   Task_NewGameBirchSpeech_ThisIsAPokemon → show ThisIsAPokemon WITH callback
    //     callback fires sur EXT_CTRL_CODE_PAUSE = release Lotad pokeball
    //   Task_NewGameBirchSpeech_MainSpeech → show MainSpeech
    //   Task_NewGameBirchSpeech_AndYouAre → show AndYouAre
    await this.dialogue.show(this.s.gText_Birch_Welcome);
    await this.dialogue.show(this.s.gText_ThisIsAPokemon, {
      onPause: () => this.releaseLotad(),
    });
    await this.dialogue.show(this.s.gText_Birch_MainSpeech);
    await this.dialogue.show(this.s.gText_Birch_AndYouAre);
    const gender = await this.askGender();
    localStorage.setItem('em_gender', gender);
    this.scene.start('NamingScene');
  }

  /**
   * Reveal du Lotad sur PAUSE du texte "Voici ce qu'on appelle un POKéMON".
   * 1:1 décomp `Task_NewGameBirchSpeechSub_InitPokeBall` (main_menu.c:1369-1381) +
   * `CreatePokeballSpriteToReleaseMon` (pokeball.c:1031, x=112 y=58) +
   * `SpriteCB_PokeballReleaseMon` (pokeball.c:1057) state machine :
   *   1. Pokeball spawn fermée (frame 0) à (112, 58)
   *   2. Délai (sDelay frames)
   *   3. StartSpriteAnim(1) : pokeball s'ouvre (frames 0→1→2)
   *   4. AnimateBallOpenParticles + LaunchBallFadeMon (white flash)
   *   5. Mon (Lotad) visible + StartSpriteAffineAnim BATTLER_AFFINE_EMERGE
   *   6. Lotad emerges via sin curve vers (sFinalMonX=100, sFinalMonY=75)
   *   7. Pokeball sprite invisible quand animEnded
   */
  private releaseLotad(): void {
    if (!this.lotadSprite) return;
    // Pokeball à (112, 58) — position 1:1 décomp main_menu.c:1378
    const pokeball = this.add.sprite(112, 58, 'pokeball-src', 0).setOrigin(0.5, 0.5).setDepth(6);

    if (!this.anims.exists('pokeball-open')) {
      this.anims.create({
        key: 'pokeball-open',
        frames: this.anims.generateFrameNumbers('pokeball-src', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // Délai 32 frames (533ms) avant ouverture. 1:1 décomp `sprite->sDelay = 32`
    // dans CreatePokeballSpriteToReleaseMon main_menu.c:1378 (arg delay=32).
    this.time.delayedCall(32 * 1000 / 60, () => {
      pokeball.play('pokeball-open');
      // SE_BALL_OPEN 1:1 décomp battle_anim_throw.c:1588 `PlaySE(SE_BALL_OPEN)`
      void playSE('se_ball_open');
      // Sparkles particles 1:1 décomp AnimateBallOpenParticles. 16 particules spawnées
      // une par frame, chacune fait un mouvement sin/cos rotatif vers l'extérieur.
      this.spawnPokeballParticles(pokeball.x, pokeball.y - 5);
      // Flash blanc subtil (= LaunchBallFadeMonTaskForPokeball)
      const flash = this.add.rectangle(0, 0, GAME_W, GAME_H, 0xFFFFFF, 0)
        .setOrigin(0, 0).setDepth(1000);
      this.tweens.add({
        targets: flash, alpha: { from: 0, to: 0.5, duration: 80 },
        yoyo: true, onComplete: () => flash.destroy(),
      });
      // Lotad émerge — 1:1 décomp pokeball.c:1077 :
      //   StartSpriteAffineAnim(&gSprites[spriteId], BATTLER_AFFINE_EMERGE);
      //   data.c:144 sAffineAnim_Battler_Emerge :
      //     AFFINEANIMCMD_FRAME(0x28, 0x28, 0, 0)   = scale 0x28/0x100 = 0.156 instant
      //     AFFINEANIMCMD_FRAME(0x12, 0x12, 0, 12)  = scale +0x12/frame × 12 frames → 1.0
      // + LaunchBallFadeMonTaskForPokeball : palette fade WHITE → normal (silhouette effet)
      // Web : setTintFill(0xFFFFFF) = silhouette blanche, clearTint() après scale anim.
      const lotad = this.lotadSprite!;
      lotad.setPosition(112, 58).setAlpha(1);
      lotad.scaleX = 0.156;
      lotad.scaleY = 0.156;
      lotad.setTintFill(0xFFFFFF); // silhouette blanche initiale (= palette white)
      // Combo tween scale + position 1:1 SpriteCB_ReleasedMonFlyOut (32 frames)
      this.tweens.add({
        targets: lotad,
        scaleX: 1.0, scaleY: 1.0,
        x: 100, y: 75,
        duration: 32 * 1000 / 60,
        ease: 'Sine.easeOut',
        onComplete: () => {
          lotad.clearTint(); // reveal normal colors à la fin
          void playCry('lotad'); // Cri 1:1 décomp
        },
      });
      // Tint pink intermédiaire à mi-anim (silhouette se "colore" graduellement vers normal)
      this.time.delayedCall(16 * 1000 / 60, () => {
        lotad.setTintFill(0xFFB0D0); // pink à mi-parcours
      });
      pokeball.once('animationcomplete', () => pokeball.destroy());
    });
  }

  /**
   * Spawn 16 sparkles depuis (x, y) avec mouvement spiral outward.
   * 1:1 décomp PokeBallOpenParticleAnimation (battle_anim_throw.c:1599) :
   *   - Spawn 16 sprites (un par frame), 8x8 chacun
   *   - Chaque sprite : x2 = Sin(angle, radius), y2 = Cos(angle, radius)
   *   - Radius +2 par frame jusqu'à 50 = ~25 frames d'expansion
   *   - angle initial = (i % 8) * 32 (= étalé sur 8 directions)
   *   - frame 0-7 d'abord, puis frames 8-15 (= 2 vagues de 8)
   */
  private spawnPokeballParticles(centerX: number, centerY: number): void {
    const TOTAL = 16;
    for (let i = 0; i < TOTAL; i++) {
      // Spawn différé d'1 frame entre chaque (1:1 data[0]++ par tick)
      this.time.delayedCall(i * 16, () => {
        if (!this.scene.isActive()) return;
        const initialAngleIdx = (i < 8 ? i : i - 8); // 1:1 décomp `var0 -= 8` si var0 ≥ 8
        const angleRad = (initialAngleIdx * 32 / 256) * 2 * Math.PI; // GBA Sin/Cos table 256 = 2π
        const sparkle = this.add.image(centerX, centerY, 'particles-src', 0)
          .setOrigin(0.5, 0.5).setDepth(7);
        // Tween : radius 0→50 sur 25 frames (~417ms), avec mouvement circulaire
        const startTime = performance.now();
        const tickFn = () => {
          const elapsed = performance.now() - startTime;
          const radius = Math.min(50, elapsed / 16 * 2); // +2 par frame
          sparkle.x = centerX + Math.sin(angleRad) * radius;
          sparkle.y = centerY + Math.cos(angleRad) * radius;
          if (radius >= 50) {
            sparkle.destroy();
            return;
          }
          this.time.delayedCall(16, tickFn);
        };
        tickFn();
      });
    }
  }

  private async askGender(): Promise<'MALE' | 'FEMALE'> {
    await this.dialogue.show(this.s.gText_Birch_BoyOrGirl);
    return new Promise((resolve) => {
      const labels = [this.s.gText_BirchBoy, this.s.gText_BirchGirl];
      const panelW = 80;
      const menu = createMenu({
        scene: this,
        x: GAME_W / 2 - panelW / 2, y: GAME_H / 2 - 20,
        width: panelW, labels,
        depth: 500000,
        onSelect: (idx) => {
          menu.destroy();
          resolve(idx === 0 ? 'MALE' : 'FEMALE');
        }
      });
    });
  }
}

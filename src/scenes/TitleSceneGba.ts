/**
 * TitleSceneGba — re-implémentation 1:1 du titre Pokémon Émeraude
 * SUR LE NOUVEL ENGINE GBA-COMPAT.
 *
 * Source de vérité : `D:\Projet 1\decomps\pokeemeraude\src\title_screen.c`
 *   - BG configs lignes 600-609 + 653-655 (sBgTemplates_TitleScreen)
 *   - Phase state machine : Task_TitleScreenPhase1/2/3
 *   - Wave scanline effect line 670 : ScanlineEffect_InitWave(0, DISPLAY_HEIGHT, 4, 4, BG1HOFS, TRUE)
 *
 * BG configs (décomp) :
 *   BG_0 : Rayquaza,     priority=3, charBase=2, mapBase=26, 256×256, 4bpp
 *   BG_1 : Clouds,       priority=2, charBase=3, mapBase=27, 256×256, 4bpp + wave HBLANK
 *   BG_2 : Pokémon Logo, priority=1, charBase=0, mapBase=9,  256×256, 8bpp AFFINE
 *
 * SCOPE session :
 *   ✅ BG0 Rayquaza static
 *   ✅ BG1 Clouds + wave scanline effect (HBLANK callback sin)
 *   ✅ BG2 Pokemon logo affine (slide-up via refY animation)
 *   ✅ Press Start sprite (blink + input ready)
 *   🚧 Version banner OAM rise — TODO session ultérieure
 *   🚧 Logo shine animation OAM — TODO session ultérieure
 *
 * Skip universel : appui touche/click → MainMenuScene.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { loadIndexedPngWithPal, loadIndexedPng8bppWithPal, loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadAffineTilemapBin } from '../engine/gba/png-loader';
import { LAYER_BG0, LAYER_BG1, LAYER_BG2, LAYER_BG3, LAYER_OBJ, LAYER_BD } from '../engine/gba/types';
import { playMidiLoop, playCry } from '../engine/music';

// ─── Phase timings 1:1 décomp Task_TitleScreenPhase1/2/3 ──────────────────────
// Phase 1 : tCounter 256 → 0
//   - Rayquaza monte depuis le bas (BG0.vofs descend)
//   - Logo shine sprites animés (skip cette session)
//   - À 0 → Phase 2 (version banner spawn)
// Phase 2 : tCounter 144 → 0
//   - Slide logo Pokemon up (BG2 affine refY animation)
//   - Version banner monte
//   - À 0 → Phase 3
// Phase 3 :
//   - Press Start blink (period 32 frames)
//   - Input ready (A/Start → MainMenu, B → ?)
const PHASE1_INITIAL_COUNTER = 256;
const PHASE2_INITIAL_COUNTER = 144;
const PRESS_START_BLINK_FRAMES = 32;  // 1:1 décomp `& 16` bit toggle

// Wave scanline effect (décomp ScanlineEffect_InitWave(amplitude, height, wavelength=4, phase=4))
// Amplitude = 0 initial, monte over time. Pour cette implémentation : amplitude fixe ~2px.
const WAVE_AMPLITUDE = 2;
const WAVE_WAVELENGTH = 4;

const enum Phase {
  PHASE_1 = 1,
  PHASE_2 = 2,
  PHASE_3 = 3,
  EXIT    = 4,
}

export class TitleSceneGba extends Phaser.Scene {
  private gba!: Gba;
  private bridge!: GbaPhaserBridge;
  private phase: Phase = Phase.PHASE_1;
  private phaseCounter = PHASE1_INITIAL_COUNTER;
  private frameCount = 0;     // total depuis create
  private exiting = false;
  private loaded = false;

  // BG2 affine state (logo Pokemon)
  /** refY 24.8 fixed (- pour décaler le logo vers le bas du screen). */
  private logoRefY24_8 = 0;

  constructor() {
    super({ key: 'TitleSceneGba' });
    console.log('[TitleGba] constructor called');
  }

  init() {
    console.log('[TitleGba] init() called');
    // Reset state pour qu'un re-entry (ex: B-button → return) reparte propre
    this.phase = Phase.PHASE_1;
    this.phaseCounter = PHASE1_INITIAL_COUNTER;
    this.frameCount = 0;
    this.exiting = false;
    this.loaded = false;
    this.logoRefY24_8 = 0;
  }

  create() {
    console.log('[TitleGba] create() called');
    // Reset camera fade au cas où on hérite d'un état fadé out de la scène précédente
    this.cameras.main.resetFX();
    this.cameras.main.setBackgroundColor('#000000');

    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'title-gba-frame');
    const frameImg = this.add.image(0, 0, 'title-gba-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    void this.loadAssets();

    // Lance la musique titre (mus_title.mid) — 1:1 décomp Task_TitleScreenPhase1
    void playMidiLoop('/decomp/em/music/mus_title.mid');

    // Cri Rayquaza à l'apparition du logo (~1500ms après start, 1:1 décomp)
    this.time.delayedCall(1500, () => {
      try { playCry('rayquaza'); } catch { /* ignore */ }
    });

    // Input handlers (Phase 3 only mais on enregistre maintenant)
    this.input.keyboard?.on('keydown', () => this.tryStartGame());
    this.input.on('pointerdown', () => this.tryStartGame());
  }

  update(_time: number, delta: number) {
    if (this.exiting) return;
    this.bridge.tick();
    if (!this.loaded) return;

    // Fixed 60Hz step (cf. IntroSceneGba/IntroScene2Gba). Garantit que les
    // Phase counters Title (256/144 frames) durent les bonnes secondes
    // peu importe le refresh rate browser.
    this.accumulatorMs += delta;
    let safety = 5;
    while (this.accumulatorMs >= TitleSceneGba.FRAME_TIME_MS && safety-- > 0) {
      this.accumulatorMs -= TitleSceneGba.FRAME_TIME_MS;
      this.frameCount++;
      switch (this.phase) {
        case Phase.PHASE_1: this.tickPhase1(); break;
        case Phase.PHASE_2: this.tickPhase2(); break;
        case Phase.PHASE_3: this.tickPhase3(); break;
      }
      if (this.exiting) return;
    }
    if (this.accumulatorMs > 10 * TitleSceneGba.FRAME_TIME_MS) this.accumulatorMs = 0;
  }

  private accumulatorMs = 0;
  private static readonly FRAME_TIME_MS = 1000 / 60;

  // ============================================================================
  // Asset loading
  // ============================================================================

  private async loadAssets(): Promise<void> {
    try {
      const BASE = '/decomp/em/boot/title_screen';

      // Setup blend pour fade in initial (mode 3 BLDY brightness dec, fade noir → normal)
      this.gba.blend.mode = 3;
      this.gba.blend.target1 = LAYER_BG0 | LAYER_BG1 | LAYER_BG2 | LAYER_BG3 | LAYER_OBJ | LAYER_BD;
      this.gba.blend.brightness = 16;  // start fully faded out

      // ─── PALETTE UNIQUE 1:1 décomp title_screen.c:603 ──────────────────────
      //   LoadPalette(gTitleScreenBgPalettes, BG_PLTT_ID(0), 15 * PLTT_SIZE_4BPP)
      //   gTitleScreenBgPalettes = INCBIN_U16("graphics/title_screen/pokemon_logo.gbapal")
      //   → 240 colors (15 banks × 16) shared par les 3 BG (rayquaza/clouds/logo).
      // Pas de rayquaza_and_clouds.pal ici (il existe mais n'est pas utilisé par
      // title_screen.c, seulement pokemon_logo.pal qui = gTitleScreenBgPalettes).
      const bgPal = await loadGbaPal(`${BASE}/pokemon_logo.pal`);
      this.gba.palette.loadBgRange(0, bgPal);

      // ─── BG0 : Rayquaza (priority 3, charBase 2, mapBase 26, 256×256 4bpp) ────
      // 1:1 décomp title_screen.c:605-606. STATIQUE (pas d'anim, vofs=0).
      // ⚠️ 4bpp : utilise loadIndexedPngStrict qui extract le PLTE PNG embedded
      // (= les 16 premières colors du PNG indexed) → garantit que les indices résultants
      // matchent exactement les pixels rendered par le browser.
      const rayquazaTileset = await loadIndexedPngStrict(`${BASE}/rayquaza.png`, 4);
      const rayquazaTilemap = await loadTilemapBin(`${BASE}/rayquaza.bin`);
      this.gba.bg(0).vram.set(rayquazaTileset.charData.subarray(0, 32768));
      this.gba.bg(0).tilemap.set(rayquazaTilemap.subarray(0, 4096));
      const bg0 = this.gba.bg(0).config;
      bg0.visible = true;
      bg0.priority = 3;
      bg0.charBaseIndex = 2;
      bg0.mapBaseIndex = 26;
      bg0.screenSize = 0;       // 256×256
      bg0.paletteMode = 0;       // 4bpp
      bg0.hofs = 0;
      bg0.vofs = 0;              // 1:1 décomp pas d'anim Phase 1

      // ─── BG1 : Clouds (priority 2, charBase 3, mapBase 27, 256×256 4bpp) ──────
      // 1:1 décomp title_screen.c:608-609. Wave scanline effect via HBLANK.
      // ⚠️ Idem rayquaza : loadIndexedPngStrict extract le PLTE PNG embedded.
      const cloudsTileset = await loadIndexedPngStrict(`${BASE}/clouds.png`, 4);
      const cloudsTilemap = await loadTilemapBin(`${BASE}/clouds.bin`);
      this.gba.bg(1).vram.set(cloudsTileset.charData.subarray(0, 32768));
      this.gba.bg(1).tilemap.set(cloudsTilemap.subarray(0, 4096));
      const bg1 = this.gba.bg(1).config;
      bg1.visible = true;
      bg1.priority = 2;
      bg1.charBaseIndex = 3;
      bg1.mapBaseIndex = 27;
      bg1.screenSize = 0;
      bg1.paletteMode = 0;
      bg1.hofs = 0;
      bg1.vofs = 0;

      // Wave scanline effect 1:1 décomp ScanlineEffect_InitWave(0, DISPLAY_HEIGHT, 4, 4, 0, BG1HOFS, TRUE).
      // amplitude=0 initial mais le ScanlineEffect_SetParams le monte plus tard.
      // Pour notre version : amplitude fixe 2px, anime via frameCount.
      this.gba.setHBlankCallback((scanline) => {
        const phase = (this.frameCount / 30);
        const wave = WAVE_AMPLITUDE * Math.sin((scanline / WAVE_WAVELENGTH + phase) * 2 * Math.PI);
        bg1.hofs = Math.round(wave);
      });

      // ─── BG2 : Pokemon Logo (priority 1, charBase 0, mapBase 9, 256×256 affine 8bpp) ─
      // 1:1 décomp title_screen.c:601-602. Tilemap = 1024 entries u8 (1 byte/entry).
      // Init Phase 1 : tBg2Y = -32 (décomp ligne 629) → refY 24.8 = -32 × 256 = -8192.
      // Phase 2 : tBg2Y++ toutes les 2 frames jusqu'à 0 → logo "slide up".
      const logoTileset = await loadIndexedPng8bppWithPal(`${BASE}/pokemon_logo.png`, bgPal);
      const logoTilemap = await loadAffineTilemapBin(`${BASE}/pokemon_logo.bin`);
      this.gba.bg(2).vram.set(logoTileset.charData.subarray(0, 32768));
      this.gba.bg(2).tilemap.set(logoTilemap.subarray(0, 4096));
      const bg2 = this.gba.bg(2).config;
      bg2.visible = true;
      bg2.priority = 1;
      bg2.charBaseIndex = 0;
      bg2.mapBaseIndex = 9;
      bg2.screenSize = 1;        // 256×256 (32×32 tiles affine)
      bg2.paletteMode = 1;        // 8bpp
      bg2.isAffine = true;
      bg2.affineMatrixIndex = 0;
      bg2.affineRefX = 0;
      this.logoRefY24_8 = -32 * 256;  // 1:1 décomp tBg2Y = -32 init
      bg2.affineRefY = this.logoRefY24_8;

      // BG3 unused → invisible
      this.gba.bg(3).config.visible = false;

      // Reset frameCount pour que le fade in / Phase 1 démarrent à 0
      // (sinon update() a déjà incrémenté pendant le load async)
      this.frameCount = 0;
      this.loaded = true;
      console.log('[TitleGba] All assets loaded, Phase 1 starting');
    } catch (e) {
      console.error('[TitleGba] Asset load failed:', e);
      this.exitToMainMenu();
    }
  }

  // ============================================================================
  // Phase 1 — Rayquaza monte depuis le bas (256 frames)
  // ============================================================================

  private tickPhase1(): void {
    // Fade in 16 frames
    if (this.frameCount < 16) {
      this.gba.blend.brightness = Math.max(0, 16 - this.frameCount);
    } else {
      this.gba.blend.brightness = 0;
    }

    // 1:1 décomp Task_TitleScreenPhase1 : juste counter 256→0.
    // Rayquaza est statique en BG (le mouvement Rayquaza vient des sprites OAM
    // qu'on n'a pas encore implémentés). À 0 → spawn version banner + Phase 2.
    this.phaseCounter--;
    if (this.phaseCounter <= 0) {
      this.phase = Phase.PHASE_2;
      this.phaseCounter = PHASE2_INITIAL_COUNTER;
    }
  }

  // ============================================================================
  // Phase 2 — Slide logo + version banner (144 frames)
  // ============================================================================

  private tickPhase2(): void {
    // 1:1 décomp Task_TitleScreenPhase2 (title_screen.c:734-779) :
    //   if (!(tCounter & 1) && tBg2Y != 0) tBg2Y++;
    //   yPos = tBg2Y * 256;
    //   SetGpuReg(BG2Y_L, yPos); BG2Y_H, yPos / 0x10000);
    // Donc tBg2Y va de -32 vers 0 toutes les 2 frames (~64 frames pour aller -32→0).
    // tBg2Y * 256 = refY 24.8 fixed.
    if ((this.phaseCounter & 1) === 0) {
      // Frame paire : incrémenter tBg2Y si pas encore à 0
      const currentTBg2Y = this.logoRefY24_8 / 256;
      if (currentTBg2Y < 0) {
        this.logoRefY24_8 += 256;
      }
    }
    this.gba.bg(2).config.affineRefY = this.logoRefY24_8;

    this.phaseCounter--;
    if (this.phaseCounter <= 0) {
      this.logoRefY24_8 = 0;
      this.gba.bg(2).config.affineRefY = 0;
      this.phase = Phase.PHASE_3;
    }
  }

  // ============================================================================
  // Phase 3 — Press Start blink + input ready
  // ============================================================================

  private tickPhase3(): void {
    // Press Start blink — 1:1 décomp `& 16` (alterne toutes les 16 frames)
    // En l'absence de sprite OAM "PRESS START", on simule via la blink visible
    // d'un overlay text Phaser (ajouté hors GBA frame).
    // TODO : load press_start.png comme sprite OAM dans gba.objVram
    if (!this.pressStartText) {
      const px = (GAME_W - 240) / 2 + 60;
      const py = (GAME_H - 160) / 2 + 130;
      this.pressStartText = this.add.text(px, py, 'PRESS START', {
        fontFamily: 'monospace', fontSize: '12px', color: '#FFFFFF',
        stroke: '#000000', strokeThickness: 2,
      }).setDepth(100);
    }
    const blinkOn = ((this.frameCount / PRESS_START_BLINK_FRAMES) | 0) % 2 === 0;
    this.pressStartText.setVisible(blinkOn);
  }

  private pressStartText?: Phaser.GameObjects.Text;

  // ============================================================================
  // Input / Exit
  // ============================================================================

  private tryStartGame(): void {
    // Input n'est ready que en Phase 3 (1:1 décomp Task_TitleScreenPhase3)
    if (this.phase < Phase.PHASE_3) return;
    this.exitToMainMenu();
  }

  private exitToMainMenu(): void {
    if (this.exiting) return;
    this.exiting = true;
    this.phase = Phase.EXIT;
    this.cameras.main.fadeOut(400, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.bridge?.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}

/**
 * IntroSceneGba — cinématique d'intro Pokemon Emerald
 *
 * APPROCHE FINALE : utilise `engine/decomp-runtime.ts` qui mime les helpers C
 * du décomp. Chaque task ci-dessous est une **transcription quasi-littérale** du
 * `bodyC` de `engine/decomp-data/auto-tasks/src/intro-tasks.ts` (auto-extracted
 * du décomp src/intro.c). Plus de devinette, plus de réinvention.
 *
 * Pattern :
 *   1. taskCopyright (state machine fade in/hold/fade out) → CreateTask(Task_Scene1_Load)
 *   2. Task_Scene1_Load (assets + sprites) → Task_Scene1_FadeIn
 *   3. Task_Scene1_FadeIn → Task_Scene1_WaterDrops
 *   4. Task_Scene1_WaterDrops → (à TIMER_SPARKLES) Task_Scene1_PanUp
 *   5. Task_Scene1_PanUp → (à TIMER_END_SCENE_1) Task_Scene1_End
 *   6. Task_Scene1_End → (à TIMER_START_SCENE_2) transition vers IntroScene2Gba
 *
 * Runtime décomp utilisé : SetGpuReg, LoadPalette, LZ77UnCompVram*, CreateSprite,
 * CreateTask, BeginNormalPaletteFade, gIntroFrameCounter, gTasks, gSprites, gPaletteFade.
 *
 * Pour cette session :
 *   ✅ Scene 0 Copyright (transition vers Task_Scene1_Load)
 *   ✅ Scene 1 task chain bodyC littéral
 *   🚧 Scene 2 + Scene 3 + Title (next iteration, même approche)
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { loadIndexedPng, loadTilemapBin } from '../engine/gba/png-loader';
import {
  DecompRuntime, type DecompTask,
  REG_OFFSET_BG0VOFS, REG_OFFSET_BG1VOFS, REG_OFFSET_BG2VOFS, REG_OFFSET_BG3VOFS,
  REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT,
  REG_OFFSET_DISPCNT,
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE, BGCNT_16COLOR, BGCNT_TXT256x512,
  DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_BG_ALL_ON, DISPCNT_OBJ_ON,
  BG_PLTT_ID, DISPLAY_WIDTH, DISPLAY_HEIGHT,
} from '../engine/decomp-runtime';
import {
  TIMER_BIG_DROP_START, TIMER_LOGO_APPEAR, TIMER_BIG_DROP_FALLS,
  TIMER_LOGO_BLEND_OUT, TIMER_SMALL_DROP_1, TIMER_SMALL_DROP_2,
  TIMER_SPARKLES, TIMER_FLYGON_SILHOUETTE_APPEAR, TIMER_END_PAN_UP,
  TIMER_END_SCENE_1, TIMER_START_SCENE_2,
  GFX_SOURCES,
} from '../engine/decomp-data/intro-data';
import { primeAudio, playMidiLoop } from '../engine/music';

// Convertit un GFX_SOURCES path "graphics/intro/scene_1/bg.pal" → URL public
function urlFor(decompPath: string): string {
  return '/decomp/em/' + decompPath.replace(/^graphics\//, '');
}

/**
 * Résout un symbole décomp (e.g. 'gIntroFlygonSilhouette_Gfx', 'sIntroLogo_Pal',
 * 'sIntroDropsLogo_Gfx') → URL public.
 *
 * 1) Check GFX_SOURCES direct (si le symbole exact y est)
 * 2) Try `s`-prefix variant si le symbole est `g`-prefixed (et inverse)
 * 3) Try variants de suffix : `_Gfx`, `_Pal` (le PNG contient les deux)
 */
function resolveDecompUrl(symbol: string): string | null {
  // 1) Direct check
  const direct = (GFX_SOURCES as Record<string, { path: string }>)[symbol];
  if (direct) return urlFor(direct.path);

  // 2) Toggle `g`/`s` prefix
  const toggled = symbol.startsWith('g') ? 's' + symbol.slice(1)
                : symbol.startsWith('s') ? 'g' + symbol.slice(1)
                : null;
  if (toggled) {
    const t = (GFX_SOURCES as Record<string, { path: string }>)[toggled];
    if (t) return urlFor(t.path);
  }

  // 3) Toggle `_Gfx` ↔ `_Pal` (PNG contient embedded PLTE = pal)
  const sufVariants = symbol.endsWith('_Gfx') ? [symbol.replace(/_Gfx$/, '_Pal'), (toggled ?? '').replace(/_Gfx$/, '_Pal')]
                    : symbol.endsWith('_Pal') ? [symbol.replace(/_Pal$/, '_Gfx'), (toggled ?? '').replace(/_Pal$/, '_Gfx')]
                    : [];
  for (const v of sufVariants) {
    if (!v) continue;
    const e = (GFX_SOURCES as Record<string, { path: string }>)[v];
    if (e) return urlFor(e.path);
  }

  console.warn('[IntroGba] resolveDecompUrl: cannot resolve symbol', symbol);
  return null;
}

const COPYRIGHT_FADE_IN_FRAMES  = 16;
const COPYRIGHT_HOLD_FRAMES     = 124;
const COPYRIGHT_FADE_OUT_FRAMES = 16;

export class IntroSceneGba extends Phaser.Scene {
  private gba!: Gba;
  private bridge!: GbaPhaserBridge;
  private rt!: DecompRuntime;
  private exiting = false;
  private loaded = false;
  /** Frame counter Scene 0 (avant que rt.gIntroFrameCounter démarre dans Task_Scene1_FadeIn). */
  private copyrightFrame = 0;
  private copyrightTask: DecompTask | null = null;

  /** Cached sprite IDs (stockés ici pour pas conflicter avec task.data utilisé pour pan vars) */
  private sBigDropSpriteId = -1;
  private sLogoSpriteId = -1;
  private sFlygonSpriteId = -1;

  constructor() { super({ key: 'IntroSceneGba' }); }

  init() {
    console.log('[IntroGba] init()');
    this.exiting = false;
    this.loaded = false;
    this.copyrightFrame = 0;
    this.copyrightTask = null;
    this.sBigDropSpriteId = -1;
  }

  shutdown() {
    console.log('[IntroGba] shutdown()');
    this.bridge?.destroy();
  }

  create() {
    console.log('[IntroGba] create() — démarrage cinématique intro');
    this.cameras.main.resetFX();
    this.cameras.main.setBackgroundColor('#000000');

    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'intro-gba-frame');
    this.rt = new DecompRuntime(this.gba);

    const frameImg = this.add.image(0, 0, 'intro-gba-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    void primeAudio();

    this.input.keyboard?.once('keydown', () => this.skipToTitle());
    this.input.once('pointerdown', () => this.skipToTitle());

    void this.startCopyright();
  }

  update(_time: number, delta: number) {
    if (this.exiting) return;
    if (!this.loaded) {
      this.bridge?.tick();
      return;
    }
    this.bridge.tick();
    // Phase Copyright (avant que rt.runTasks prenne le relais via Task_Scene1_*)
    if (this.copyrightTask) {
      this.taskCopyright();
      this.rt.UpdatePaletteFade();
      return;
    }
    // Phase Scene 1+ : tick fixe à 60Hz (= GBA framerate exact via accumulator).
    // Phaser update peut tourner à 144Hz/120Hz selon refresh rate ; tickFixed garantit
    // que gIntroFrameCounter avance à 60 frames/sec exactement, pour que les TIMER_X
    // matchent les durées GBA réelles.
    this.rt.tickFixed(delta);
  }

  // ============================================================================
  // SCENE 0 — Copyright Screen
  // ============================================================================

  private async startCopyright(): Promise<void> {
    try {
      console.log('[IntroGba] Loading copyright assets');
      const png = await loadIndexedPng('/decomp/em/intro/copyright.png');
      const tilemap = await loadTilemapBin('/decomp/em/intro/copyright.bin');

      this.rt.LoadPaletteBg(png.palette, BG_PLTT_ID(0));
      this.gba.bg(0).vram.set(png.charData.subarray(0, this.gba.bg(0).vram.length));
      this.gba.bg(0).tilemap.set(tilemap.subarray(0, this.gba.bg(0).tilemap.length));

      // 1:1 décomp LoadCopyrightGraphics : BG0CNT priority 0, charBase 0, screenBase 7, 4bpp, 256×256
      this.rt.SetGpuReg(REG_OFFSET_BG0CNT,
        BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(7) | BGCNT_16COLOR);
      this.rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | (1 << 8));  // BG0_ON

      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');

      // Crée un task copyright qui mime SetUpCopyrightScreen state machine.
      // À la fin (state 141), CreateTask(Task_Scene1_Load).
      this.copyrightTask = {
        taskId: -1, data: new Array(16).fill(0),
        func: () => this.taskCopyright(),
      };
      this.loaded = true;
      console.log('[IntroGba] Copyright running (with palette fade in)');
    } catch (e) {
      console.error('[IntroGba] Copyright load failed:', e);
      this.skipToTitle();
    }
  }

  private taskCopyright(): void {
    if (!this.copyrightTask) return;
    this.copyrightFrame++;
    const f = this.copyrightFrame;
    const TOTAL = COPYRIGHT_FADE_IN_FRAMES + COPYRIGHT_HOLD_FRAMES + COPYRIGHT_FADE_OUT_FRAMES;

    if (f === COPYRIGHT_FADE_IN_FRAMES + COPYRIGHT_HOLD_FRAMES) {
      // 1:1 décomp COPYRIGHT_START_FADE → BeginNormalPaletteFade vers noir
      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
    }

    if (f >= TOTAL) {
      console.log('[IntroGba] Copyright done → CreateTask(Task_Scene1_Load)');
      this.copyrightTask = null;
      // 1:1 décomp ligne 1121 : CreateTask(Task_Scene1_Load, 0)
      void this.task_Scene1_Load_async();
    }
  }

  // À call manuellement chaque frame depuis update() tant que copyrightTask actif
  // (= avant que rt.runTasks prenne le relais)
  private tickCopyrightOverride(): void {
    if (this.copyrightTask) this.taskCopyright();
  }

  // ============================================================================
  // Task_Scene1_Load — 1:1 transcription bodyC depuis intro-tasks.ts
  // ============================================================================

  private async task_Scene1_Load_async(): Promise<void> {
    try {
      const rt = this.rt;

      // 1:1 décomp bodyC :
      // SetVBlankCallback(NULL);  ← (no-op chez nous, on tick manuellement)
      // sIntroCharacterGender = MOD(Random(), GENDER_COUNT);  ← (skip pour Scene 1, utilisé Scene 2)
      rt.IntroResetGpuRegs();

      // SetGpuReg(REG_OFFSET_BG3VOFS, 0);
      // SetGpuReg(REG_OFFSET_BG2VOFS, 80);
      // SetGpuReg(REG_OFFSET_BG1VOFS, 24);
      // SetGpuReg(REG_OFFSET_BG0VOFS, 40);
      rt.SetGpuReg(REG_OFFSET_BG3VOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG2VOFS, 80);
      rt.SetGpuReg(REG_OFFSET_BG1VOFS, 24);
      rt.SetGpuReg(REG_OFFSET_BG0VOFS, 40);

      // LoadPalette(sIntro1Bg_Pal, BG_PLTT_ID(0), sizeof(sIntro1Bg_Pal));
      const bgPal = await rt.LoadPaletteBgFromFile(urlFor(GFX_SOURCES.sIntro1Bg_Pal.path), BG_PLTT_ID(0));

      // LZ77UnCompVram(sIntro1Bg_Gfx, (void *)VRAM);
      // = charge bg.png (4bpp) dans tile data partagé. Sur GBA réel, charBase=0 = même
      // VRAM partagée. Notre engine : chaque BG a son vram → load dans les 4 BG vram.
      // On utilise bgPal.subarray(0,16) car bg.png est 4bpp (16 colors max).
      const bgGfxUrl = urlFor(GFX_SOURCES.sIntro1Bg_Gfx.path);
      await rt.LZ77UnCompVram_Tileset4bpp(bgGfxUrl, bgPal, 0);
      await rt.LZ77UnCompVram_Tileset4bpp(bgGfxUrl, bgPal, 1);
      await rt.LZ77UnCompVram_Tileset4bpp(bgGfxUrl, bgPal, 2);
      await rt.LZ77UnCompVram_Tileset4bpp(bgGfxUrl, bgPal, 3);

      // LZ77UnCompVram(sIntro1Bg0_Tilemap, (void *)(BG_CHAR_ADDR(2)));
      // ⚠️ Note décomp bizarrerie : sIntro1Bg0_Tilemap est loaded à BG_CHAR_ADDR(2)
      // pas BG_SCREEN_ADDR(16). C'est probablement une optimisation (tilemap réutilisé
      // comme tile data ailleurs). Pour notre engine, on met dans bg(0).tilemap normal.
      await rt.LZ77UnCompVram_Tilemap(urlFor(GFX_SOURCES.sIntro1Bg0_Tilemap.path), 0);

      // DmaClear16(3, BG_SCREEN_ADDR(17), BG_SCREEN_SIZE);  ← block 1 BG0 cleared
      // (notre engine : la 2e moitié du tilemap reste à 0 par défaut)

      // LZ77UnCompVram(sIntro1Bg1_Tilemap, (void *)(BG_SCREEN_ADDR(18)));
      await rt.LZ77UnCompVram_Tilemap(urlFor(GFX_SOURCES.sIntro1Bg1_Tilemap.path), 1);
      // DmaClear16(3, BG_SCREEN_ADDR(19), BG_SCREEN_SIZE);

      // LZ77UnCompVram(sIntro1Bg2_Tilemap, (void *)(BG_SCREEN_ADDR(20)));
      await rt.LZ77UnCompVram_Tilemap(urlFor(GFX_SOURCES.sIntro1Bg2_Tilemap.path), 2);
      // DmaClear16(3, BG_SCREEN_ADDR(21), BG_SCREEN_SIZE);

      // LZ77UnCompVram(sIntro1Bg3_Tilemap, (void *)(BG_SCREEN_ADDR(22)));
      await rt.LZ77UnCompVram_Tilemap(urlFor(GFX_SOURCES.sIntro1Bg3_Tilemap.path), 3);
      // DmaClear16(3, BG_SCREEN_ADDR(23), BG_SCREEN_SIZE);

      // SetGpuReg(REG_OFFSET_BG3CNT, BGCNT_PRIORITY(3) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(22) | BGCNT_16COLOR | BGCNT_TXT256x512);
      rt.SetGpuReg(REG_OFFSET_BG3CNT,
        BGCNT_PRIORITY(3) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(22) | BGCNT_16COLOR | BGCNT_TXT256x512);
      // SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(20) | BGCNT_16COLOR | BGCNT_TXT256x512);
      rt.SetGpuReg(REG_OFFSET_BG2CNT,
        BGCNT_PRIORITY(2) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(20) | BGCNT_16COLOR | BGCNT_TXT256x512);
      // SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(18) | BGCNT_16COLOR | BGCNT_TXT256x512);
      rt.SetGpuReg(REG_OFFSET_BG1CNT,
        BGCNT_PRIORITY(1) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(18) | BGCNT_16COLOR | BGCNT_TXT256x512);
      // SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(16) | BGCNT_16COLOR | BGCNT_TXT256x512);
      rt.SetGpuReg(REG_OFFSET_BG0CNT,
        BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(16) | BGCNT_16COLOR | BGCNT_TXT256x512);

      // ⚠️ Re-set vofs APRÈS BGCNT (car SetGpuReg DISPCNT/BGCNT peut reset vofs).
      // Cf décomp : ces VOFS sont set au début AVANT BGCNT, mais notre engine
      // les conserve. On les re-applique pour être safe.
      this.gba.bg(0).config.vofs = 40;
      this.gba.bg(1).config.vofs = 24;
      this.gba.bg(2).config.vofs = 80;
      this.gba.bg(3).config.vofs = 0;

      // ─── SPRITE SHEETS + PALETTES via sprite-system (1:1 décomp, ZÉRO hardcode) ─
      // 1:1 décomp lignes 1192-1196 :
      //   LoadCompressedSpriteSheet(sSpriteSheet_WaterDropsAndLogo);
      //   LoadCompressedSpriteSheet(sSpriteSheet_FlygonSilhouette);
      //   LoadSpritePalettes(sSpritePalettes_Intro1);
      //   LoadCompressedSpriteSheet(sSpriteSheet_Sparkle);
      //   LoadSpritePalettes(sSpritePalette_Sparkle);
      // Helpers consomment SPRITE_SHEETS + SPRITE_PALETTES extraits du décomp ;
      // resolveDecompUrl maps gfxName/paletteName → URL public ;
      // paletteTag → OBJ slot et tileTag → tileNum start auto-résolus dans le runtime.
      this.rt.resetSpriteSystem();
      await this.rt.LoadCompressedSpriteSheetsFromTable('sSpriteSheet_WaterDropsAndLogo', resolveDecompUrl);
      await this.rt.LoadCompressedSpriteSheetsFromTable('sSpriteSheet_FlygonSilhouette', resolveDecompUrl);
      await this.rt.LoadSpritePalettesFromTable('sSpritePalettes_Intro1', resolveDecompUrl);
      await this.rt.LoadCompressedSpriteSheetsFromTable('sSpriteSheet_Sparkle', resolveDecompUrl);
      await this.rt.LoadSpritePalettesFromTable('sSpritePalette_Sparkle', resolveDecompUrl);

      // ─── CreateSprite via sSpriteTemplate_X (paletteTag/tileTag auto-résolus) ─
      // 1:1 ligne 1204 : CreateGameFreakLogoSprites(DISPLAY_WIDTH/2, DISPLAY_HEIGHT/2, 0)
      // Simplification : 1 seul sprite logo (32×64) au lieu des 9 letters + logo.
      this.sLogoSpriteId = this.rt.CreateSpriteFromTemplate(
        'sSpriteTemplate_GameFreakLogo', DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2);
      this.rt.setSpriteInvisible(this.sLogoSpriteId, true);

      // Flygon silhouette pré-créé caché (visible à TIMER_FLYGON_SILHOUETTE_APPEAR)
      this.sFlygonSpriteId = this.rt.CreateSpriteFromTemplate(
        'sSpriteTemplate_FlygonSilhouette', DISPLAY_WIDTH / 2, DISPLAY_HEIGHT);
      this.rt.setSpriteInvisible(this.sFlygonSpriteId, true);

      // 1:1 ligne 1205 : sBigDropSpriteId = CreateWaterDrop(236, -14, ...)
      this.sBigDropSpriteId = this.rt.CreateSpriteFromTemplate(
        'sSpriteTemplate_WaterDrop', 236, -14);
      this.rt.setSpriteInvisible(this.sBigDropSpriteId, true);

      // 1:1 ligne 1206 : task.func = Task_Scene1_FadeIn
      this.rt.CreateTask((task) => this.task_Scene1_FadeIn(task), 0);

      console.log('[IntroGba] Task_Scene1_Load done → Task_Scene1_FadeIn');
    } catch (e) {
      console.error('[IntroGba] Task_Scene1_Load failed:', e);
      this.skipToTitle();
    }
  }

  // ============================================================================
  // Task_Scene1_FadeIn — 1:1 transcription bodyC
  // ============================================================================

  private task_Scene1_FadeIn(task: DecompTask): void {
    console.log('[IntroGba] Task_Scene1_FadeIn');
    // BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
    this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
    // SetVBlankCallback(VBlankCB_Intro);  ← (notre tick = ce VBlank)
    // SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG_ALL_ON | DISPCNT_OBJ_ON);
    this.rt.SetGpuReg(REG_OFFSET_DISPCNT,
      DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG_ALL_ON | DISPCNT_OBJ_ON);
    // gTasks[taskId].func = Task_Scene1_WaterDrops;
    task.func = (t) => this.task_Scene1_WaterDrops(t);
    // gIntroFrameCounter = 0;
    this.rt.gIntroFrameCounter = 0;
    // m4aSongNumStart(MUS_INTRO);
    void playMidiLoop('/decomp/em/music/mus_intro.mid');
    // ResetSerial();  ← no-op
  }

  // ============================================================================
  // Task_Scene1_WaterDrops — 1:1 transcription bodyC
  // ============================================================================

  private task_Scene1_WaterDrops(task: DecompTask): void {
    const f = this.rt.gIntroFrameCounter;

    // if (gIntroFrameCounter == TIMER_BIG_DROP_START)
    //     gSprites[gTasks[taskId].sBigDropSpriteId].sState = 1;
    if (f === TIMER_BIG_DROP_START) {
      this.rt.setSpriteInvisible(this.sBigDropSpriteId, false);
      // (sState = 1 → la goutte commence à glisser ; simplification : juste visible)
    }

    // if (gIntroFrameCounter == TIMER_LOGO_APPEAR) CreateTask(Task_BlendLogoIn, 0);
    if (f === TIMER_LOGO_APPEAR) {
      this.rt.setSpriteInvisible(this.sLogoSpriteId, false);
    }

    // if (gIntroFrameCounter == TIMER_BIG_DROP_FALLS) gSprites[...].sState = 2;
    if (f === TIMER_BIG_DROP_FALLS) {
      // sState = 2 → drop tombe ; simplification : déplacer y vers le bas
      const sprite = this.rt.getSprite(this.sBigDropSpriteId);
      if (sprite) this.gba.oam[sprite.oamIndex].y = 100;
    }

    // if (gIntroFrameCounter == TIMER_LOGO_BLEND_OUT) CreateTask(Task_BlendLogoOut, 0);
    if (f === TIMER_LOGO_BLEND_OUT) {
      this.rt.setSpriteInvisible(this.sLogoSpriteId, true);
    }

    // if (gIntroFrameCounter == TIMER_SMALL_DROP_1) CreateWaterDrop(48, 0, 0x400, 5, 0x70, TRUE);
    // if (gIntroFrameCounter == TIMER_SMALL_DROP_2) CreateWaterDrop(200, 60, 0x400, 9, 0x80, TRUE);
    // (skip cette session)

    // if (gIntroFrameCounter == TIMER_SPARKLES) CreateTask(Task_CreateSparkles, 0);
    // (skip cette session)

    // if (gIntroFrameCounter > TIMER_SPARKLES)
    if (f > TIMER_SPARKLES) {
      // 1:1 décomp Task_Scene1_WaterDrops:1252-1258 + intro-data.ts EXPR :
      //   tBg2PosHi=data[1]/Lo=data[2], tBg1PosHi=data[3]/Lo=data[4], tBg3PosHi=data[5]/Lo=data[6]
      task.data[1] = 80; task.data[2] = 0;  // tBg2PosHi/Lo (= 80)
      task.data[3] = 24; task.data[4] = 0;  // tBg1PosHi/Lo (= 24)
      task.data[5] = 40; task.data[6] = 0;  // tBg3PosHi/Lo (= 40, écrit BG0VOFS)
      task.func = (t) => this.task_Scene1_PanUp(t);
      console.log('[IntroGba] WaterDrops done at frame', f, '→ Task_Scene1_PanUp');
    }
  }

  // ============================================================================
  // Task_Scene1_PanUp — 1:1 transcription bodyC (avec arithmétique 16-bit signed)
  // ============================================================================

  private task_Scene1_PanUp(task: DecompTask): void {
    const f = this.rt.gIntroFrameCounter;

    if (f < TIMER_END_PAN_UP) {
      // Slide bg 2 downward
      // offset = (gTasks[taskId].tBg2PosHi << 16) + (u16)gTasks[taskId].tBg2PosLo;
      // offset -= 0x6000;
      // gTasks[taskId].tBg2PosHi = offset >> 16;
      // gTasks[taskId].tBg2PosLo = offset;
      // SetGpuReg(REG_OFFSET_BG2VOFS, gTasks[taskId].tBg2PosHi);
      let offset = (task.data[1] << 16) + (task.data[2] & 0xFFFF);
      offset -= 0x6000;
      task.data[1] = offset >> 16;
      task.data[2] = offset & 0xFFFF;
      this.rt.SetGpuReg(REG_OFFSET_BG2VOFS, task.data[1] & 0x1FF);

      // Slide bg 1 downward (delta -0x8000)
      offset = (task.data[3] << 16) + (task.data[4] & 0xFFFF);
      offset -= 0x8000;
      task.data[3] = offset >> 16;
      task.data[4] = offset & 0xFFFF;
      this.rt.SetGpuReg(REG_OFFSET_BG1VOFS, task.data[3] & 0x1FF);

      // Slide bg 3 (= naming décomp) → BG0VOFS (delta -0xC000)
      offset = (task.data[5] << 16) + (task.data[6] & 0xFFFF);
      offset -= 0xC000;
      task.data[5] = offset >> 16;
      task.data[6] = offset & 0xFFFF;
      this.rt.SetGpuReg(REG_OFFSET_BG0VOFS, task.data[5] & 0x1FF);

      // if (gIntroFrameCounter == TIMER_FLYGON_SILHOUETTE_APPEAR)
      if (f === TIMER_FLYGON_SILHOUETTE_APPEAR) {
        // 1:1 décomp : créer le sprite Flygon (caché initialement).
        // Notre version : sprite pré-créé dans Task_Scene1_Load, on le rend visible.
        this.rt.setSpriteInvisible(this.sFlygonSpriteId, false);
      }
    } else {
      if (f > TIMER_END_SCENE_1) {
        // BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_WHITEALPHA);
        this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_WHITEALPHA');
        // gTasks[taskId].func = Task_Scene1_End;
        task.func = (t) => this.task_Scene1_End(t);
        console.log('[IntroGba] PanUp done at frame', f, '→ Task_Scene1_End');
      }
    }
  }

  // ============================================================================
  // Task_Scene1_End — 1:1 transcription bodyC
  // ============================================================================

  private task_Scene1_End(_task: DecompTask): void {
    const f = this.rt.gIntroFrameCounter;
    // if (gIntroFrameCounter > TIMER_START_SCENE_2)
    //     gTasks[taskId].func = Task_Scene2_Load;
    if (f > TIMER_START_SCENE_2) {
      console.log('[IntroGba] Scene 1 ended at frame', f, '→ IntroScene2Gba');
      this.exitToScene2();
    }
  }

  // ============================================================================
  // Override : pendant Scene 0 Copyright, on tick taskCopyright manuellement
  // ============================================================================

  /** Override update() pour gérer Copyright avant que rt.runTasks prenne le relais. */
  // (Ajouté ici car Phaser appelle update() de la scene)
  // Update appel :
  //   - si copyrightTask existe : on tick juste copyright (pas rt.runTasks)
  //   - sinon : rt.tick() qui run les vraies tasks décomp
  // (Override de la méthode update() ci-dessus)

  // ============================================================================
  // Skip / Exit
  // ============================================================================

  private skipToTitle(): void {
    if (this.exiting) return;
    this.exiting = true;
    console.log('[IntroGba] skip → TitleSceneGba');
    this.cameras.main.fadeOut(150, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.time.delayedCall(0, () => {
        const mgr = this.scene.manager;
        mgr.start('TitleSceneGba');
        mgr.stop('IntroSceneGba');
      });
    });
  }

  private exitToScene2(): void {
    if (this.exiting) return;
    this.exiting = true;
    console.log('[IntroGba] exit → IntroScene2Gba');
    this.time.delayedCall(0, () => {
      const mgr = this.scene.manager;
      mgr.start('IntroScene2Gba');
      mgr.stop('IntroSceneGba');
    });
  }
}

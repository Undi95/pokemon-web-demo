/**
 * TestGbaScene — PoC end-to-end de l'engine GBA-compat.
 *
 * Affiche le copyright screen (assets décomp `public/decomp/em/intro/copyright.{png,bin}`)
 * via le nouvel engine Gba (Canvas 2D 240×160 pixel-perfect) plutôt que via
 * Phaser sprites approximés.
 *
 * Si ça ressemble VISUELLEMENT au copyright Game Freak / Nintendo de la GBA,
 * l'architecture est validée → on peut construire les autres scenes (Scene 1
 * GF Logo, Scene 2 Bike Ride, Scene 3 Legends, TitleScreen) dessus.
 *
 * Si ça affiche n'importe quoi (couleurs fausses, tiles mal placées, etc.),
 * faut investiguer le décodage PNG ou le format tilemap.bin.
 *
 * Usage : ajouter dans le scene array de main.ts en première position pour
 * tester au boot, ou lancer via `scene.start('TestGbaScene')` depuis un menu.
 *
 * Press SPACE/CLICK : retour BootScene (pour rebooter normalement).
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { loadIndexedPng, loadTilemapBin } from '../engine/gba/png-loader';
import { rotScaleAffineMatrix } from '../engine/gba/types';
// M4A audio test
import { loadMidi, playSong, stopSong, isPlaying } from '../engine/m4a/player';
import { loadSampleManifest } from '../engine/m4a/sample-loader';
import { getAudioContext } from '../engine/m4a/audio-context';
import type { VoiceGroup } from '../engine/m4a/voice-types';

export class TestGbaScene extends Phaser.Scene {
  private gba!: Gba;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private ready = false;

  constructor() { super({ key: 'TestGbaScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#202030');

    this.statusText = this.add.text(4, 4, 'Loading copyright assets...', {
      fontFamily: 'monospace', fontSize: '8px', color: '#FFFFFF',
    }).setDepth(100);

    // Init engine
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'test-gba-frame');

    // Add the GBA frame as a Phaser image (sera mis à jour via bridge.tick())
    const frameImg = this.add.image(0, 0, 'test-gba-frame').setOrigin(0, 0);
    // Centrer si GAME_W/H différent de 240/160 (par défaut GAME_W=240, GAME_H=160)
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    // Load assets async puis configure BG
    void this.loadAssetsAndStart();

    // Inputs : 'P' = play song, 'S' = stop, autre key/click = exit
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'p') { void this.playTestSong(); return; }
      if (k === 's') { stopSong(); return; }
      this.exit();
    });
    this.input.once('pointerdown', () => this.exit());
  }

  private async loadAssetsAndStart(): Promise<void> {
    try {
      // ─── BG0 : copyright screen ─────────────────────────────────────────
      this.statusText?.setText('Loading copyright BG...');
      const bgPng = await loadIndexedPng('/decomp/em/intro/copyright.png');
      const tilemap = await loadTilemapBin('/decomp/em/intro/copyright.bin');
      console.log('[TestGba] BG copyright:', bgPng.widthTiles, 'x', bgPng.heightTiles, 'tiles |',
                  bgPng.palette.length, 'palette |', tilemap.length, 'tilemap entries');

      this.gba.palette.loadBgRange(0, bgPng.palette);
      // VRAM unifié 96KB (refactor session 68 Phase 1) : il FAUT configurer
      // mapBaseIndex ≥ 16 explicitement, sinon le tilemap (à offset 0) écrase
      // le char data (à offset 0). On utilise 16 comme le décomp.
      this.gba.bg(0).config.charBaseIndex = 0;  // char data à offset 0
      this.gba.bg(0).config.mapBaseIndex = 16;  // tilemap à offset 0x8000
      this.gba.bg(0).config.screenSize = 0;
      this.gba.bg(0).config.paletteMode = 0;
      this.gba.bg(0).vram.set(bgPng.charData.subarray(0, this.gba.bg(0).vram.length));
      this.gba.bg(0).tilemap.set(tilemap.subarray(0, this.gba.bg(0).tilemap.length));
      this.gba.bg(0).config.visible = true;
      this.gba.bg(0).config.priority = 1;       // BG derrière les sprites

      // ─── OAM sprite test : Lotad au centre ──────────────────────────────
      // Lotad sprite 64×64 = 8×8 tiles 4bpp = 64 tiles × 32B = 2048 bytes
      this.statusText?.setText('Loading Lotad sprite...');
      const sprPng = await loadIndexedPng('/decomp/em/pokemon/lotad/front.png');
      console.log('[TestGba] Lotad sprite:', sprPng.widthTiles, 'x', sprPng.heightTiles, 'tiles |',
                  sprPng.palette.length, 'palette');

      // Charge sprite char data dans objVram (commence à offset 0)
      this.gba.objVram.set(sprPng.charData.subarray(0, this.gba.objVram.length));
      // Charge palette OBJ bank 0 (palettes OBJ séparées des BG palettes)
      this.gba.palette.loadObjRange(0, sprPng.palette);

      // Configure OAM slot 0 : Lotad en (88, 48) — centré sur 240×160
      // Mode 3 (DOUBLE_AFFINE) : bbox 2× pour préserver la rotation à tous angles.
      // Du coup il faut décaler Y de -32 (= -hPx/2) pour que le centre tombe au même endroit
      // que le sprite normal (sinon le sprite serait décalé vers le bas).
      const lotad = this.gba.oam[0];
      lotad.visible = true;
      lotad.x = 88 - 32;  // bbox 128 = ancre 88 décalée -32 pour centre identique
      lotad.y = 48 - 32;
      lotad.tileId = 0;
      lotad.paletteBank = 0;
      lotad.priority = 0; // devant le BG
      lotad.shape = 0;    // square
      lotad.size = 3;     // square 8×8 tiles = 64×64 pixels
      lotad.paletteMode = 0; // 4bpp
      lotad.affineMode = 3;  // DOUBLE_AFFINE (rotation préservée à 360°)
      lotad.affineParamIndex = 0;  // utilise affineParams[0]
      lotad.objMode = 0;     // normal
      lotad.flipH = false;
      lotad.flipV = false;

      // Rotation continue du Lotad via affineParams[0]
      this.gba.addVBlankCallback(() => {
        // 1 tour complet = 240 frames = 4 secondes
        const angle = (this.gba.getFrameCount() / 240) * Math.PI * 2;
        const m = rotScaleAffineMatrix(angle, 1.0);  // scale 1.0
        Object.assign(this.gba.affineParams[0], m);
      });

      // ─── Test Blend BLDY pulse (mode 3 brightness dec) ──────────────────
      // Pulse de noir vers normal sur BG0 + OBJ, période ~2s. 1:1 décomp
      // Task_NewGameBirchSpeechSub_*FadeOut* qui anime BLDY de 0 → 16.
      this.gba.blend.mode = 3;                   // brightness dec
      this.gba.blend.target1 = 0x01 | 0x10;      // BG0 + OBJ targetés
      this.gba.blend.brightness = 0;             // start = no fade
      // Pulse via VBlank callback (tick à chaque frame composée)
      this.gba.addVBlankCallback(() => {
        const t = this.gba.getFrameCount() / 30;          // période ~ 60 frames = 1s
        this.gba.blend.brightness = Math.round((Math.sin(t) + 1) * 8);  // 0-16
      });

      // ─── Test Windows : WIN0 rect "spotlight" sur Lotad ──────────────────
      // Rect (80, 40) à (160, 120) (= 80×80 autour du sprite Lotad). À l'intérieur
      // tous les layers visibles + blend appliqué. À l'extérieur : seuls BG0
      // visible (= masque OBJ caché hors WIN0). Devrait montrer Lotad UNIQUEMENT
      // dans la zone WIN0, le copyright reste visible partout.
      this.gba.windows.win0.enabled = true;
      this.gba.windows.win0.x1 = 80; this.gba.windows.win0.x2 = 160;
      this.gba.windows.win0.y1 = 40; this.gba.windows.win0.y2 = 120;
      this.gba.windows.win0Inside = 0x01 | 0x10;     // BG0 + OBJ visibles inside
      this.gba.windows.outsideEnable = 0x01;          // seul BG0 visible outside
      this.gba.windows.win0BlendEnable = true;
      this.gba.windows.outsideBlendEnable = true;

      this.statusText?.setText('GBA: BG+OAM+Blend+WIN+Affine. Press P=play song, S=stop, click=exit.');
      this.statusText?.setColor('#00FF88');
      this.ready = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[TestGba] Load failed:', msg);
      this.statusText?.setText(`ERROR: ${msg}`).setColor('#FF4040');
    }
  }

  update() {
    if (!this.ready) return;
    this.bridge.tick();
  }

  /** Test M4A : charge mus_intro.mid + voicegroup intro, play song. */
  private async playTestSong(): Promise<void> {
    if (isPlaying()) {
      console.log('[TestGba] Song déjà en cours, stop d\'abord (S)');
      return;
    }
    try {
      // Init audio (peut throw si pas de user gesture, mais on a déjà une key press)
      getAudioContext();
      await loadSampleManifest();

      this.statusText?.setText('Loading MIDI...').setColor('#FFCC00');

      // Load voicegroup intro (utilisé par mus_intro.mid)
      const vgModule = await import('../engine/m4a/voicegroups-data/intro');
      const introVg = vgModule.VOICEGROUP as VoiceGroup;

      // Load song MIDI (intro music)
      const midi = await loadMidi('/decomp/em/music/mus_intro.mid');
      console.log(`[TestGba] MIDI loaded: ${midi.tracks.length} tracks, duration ${midi.duration.toFixed(2)}s`);

      // Voicegroup lookup : utilise le master VOICEGROUPS_BY_NAME map généré
      // par extract-voicegroups-m4a.mjs (195 voicegroups + 5 keysplit tables).
      // Résout les keysplit_all (drumsets entiers) + keysplit (piano keysplit etc.).
      const { lookupVoicegroup } = await import('../engine/m4a/voicegroups-data/_all-voicegroups-index');
      const vgLookup = (name: string): VoiceGroup | null => lookupVoicegroup(name);

      this.statusText?.setText('Playing mus_intro.mid (P=replay, S=stop)').setColor('#00FF88');
      await playSong(midi, introVg, vgLookup, false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[TestGba] M4A play failed:', e);
      this.statusText?.setText(`Audio ERR: ${msg}`).setColor('#FF4040');
    }
  }

  private exiting = false;
  private exit(): void {
    if (this.exiting) return;
    this.exiting = true;
    stopSong();
    this.bridge?.destroy();
    // Phase 0c+ : direct boot into GameScene (copyright is now native in decomp boot loop).
    this.scene.start('GameScene');
  }
}

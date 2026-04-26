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

    // Inputs
    this.input.keyboard?.once('keydown', () => this.exit());
    this.input.once('pointerdown', () => this.exit());
  }

  private async loadAssetsAndStart(): Promise<void> {
    try {
      // 1. Load PNG indexed (copyright.png, 312×8 = 39 tiles palette grayscale)
      this.statusText?.setText('Loading copyright.png...');
      const png = await loadIndexedPng('/decomp/em/intro/copyright.png');
      console.log('[TestGba] PNG loaded:', png.widthPx, 'x', png.heightPx,
                  '|', png.widthTiles, 'x', png.heightTiles, 'tiles',
                  '|', png.palette.length, 'palette entries');

      // 2. Load tilemap.bin (32×32 entries u16)
      this.statusText?.setText('Loading copyright.bin...');
      const tilemap = await loadTilemapBin('/decomp/em/intro/copyright.bin');
      console.log('[TestGba] Tilemap loaded:', tilemap.length, 'entries');

      // 3. Configure GBA :
      //   - Palette bank 0 = palette du copyright
      //   - BG0.vram = char data (tile pixels)
      //   - BG0.tilemap = tilemap entries
      //   - BG0.config : 4bpp, screenSize 32×32, visible
      this.gba.palette.loadBgRange(0, png.palette);
      this.gba.bg(0).vram.set(png.charData.subarray(0, this.gba.bg(0).vram.length));
      // tilemap fits dans Uint16Array(4096), copy directly
      this.gba.bg(0).tilemap.set(tilemap.subarray(0, this.gba.bg(0).tilemap.length));
      this.gba.bg(0).config.visible = true;
      this.gba.bg(0).config.priority = 0;
      this.gba.bg(0).config.screenSize = 0;     // 32×32 tiles
      this.gba.bg(0).config.paletteMode = 0;    // 4bpp

      this.statusText?.setText('GBA engine running. Click to exit.');
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

  private exit(): void {
    this.bridge?.destroy();
    this.scene.start('BootScene');
  }
}

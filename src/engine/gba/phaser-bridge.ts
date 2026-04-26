/**
 * Bridge entre l'engine Gba (Canvas 2D interne) et Phaser.
 *
 * Création d'une texture Phaser à partir du frame buffer GBA, et update à
 * chaque frame. Phaser affiche cette texture comme une Image normale.
 *
 * Usage dans une scène :
 *   private bridge!: GbaPhaserBridge;
 *
 *   create() {
 *     const gba = new Gba();
 *     // ... setup palette/bg/tilemap ...
 *     this.bridge = new GbaPhaserBridge(this, gba, 'gba-frame');
 *     this.add.image(0, 0, 'gba-frame').setOrigin(0, 0);
 *   }
 *
 *   update() {
 *     this.bridge.tick();  // tick GBA + update texture
 *   }
 */
import Phaser from 'phaser';
import { Gba } from './gba';
import { SCREEN_W, SCREEN_H } from './types';

export class GbaPhaserBridge {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;

  constructor(
    private scene: Phaser.Scene,
    public readonly gba: Gba,
    public readonly textureKey: string,
  ) {
    // Crée un canvas 2D 240×160 dans le DOM (off-screen, pas attaché)
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('GbaPhaserBridge: failed to create 2D context');
    this.ctx = ctx;
    this.imageData = this.ctx.createImageData(SCREEN_W, SCREEN_H);

    // Enregistre comme texture Phaser. addCanvas crée un CanvasTexture
    // qui partage les pixels avec notre canvas DOM.
    if (this.scene.textures.exists(textureKey)) {
      this.scene.textures.remove(textureKey);
    }
    this.scene.textures.addCanvas(textureKey, this.canvas);
  }

  /** Tick : render la frame GBA + update la texture Phaser. */
  tick(): void {
    this.gba.tick();
    // Copy frame buffer GBA → ImageData → Canvas
    this.imageData.data.set(this.gba.getFrameBuffer());
    this.ctx.putImageData(this.imageData, 0, 0);
    // Notify Phaser que la texture a changé
    const tex = this.scene.textures.get(this.textureKey);
    if (tex && (tex as Phaser.Textures.CanvasTexture).refresh) {
      (tex as Phaser.Textures.CanvasTexture).refresh();
    }
  }

  /** Cleanup quand la scène se ferme. */
  destroy(): void {
    if (this.scene.textures.exists(this.textureKey)) {
      this.scene.textures.remove(this.textureKey);
    }
  }
}

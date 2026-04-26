/**
 * Compose une tilemap GBA dans un canvas Phaser à l'exécution.
 *
 * Le décomp Pokémon Émeraude livre les BG sous forme :
 *   - PNG atlas (toutes les tiles 8×8 alignées horizontalement)
 *   - tilemap .bin (suite de u16 little-endian, 1 entry par tile output)
 *
 * Format d'une entry tilemap GBA (16-bit) :
 *   bits 0-9   : tile_id (0..1023)
 *   bit  10    : horizontal flip
 *   bit  11    : vertical flip
 *   bits 12-15 : palette index (0..15)
 *
 * Pour les images "single palette" comme copyright, palette_index est ignoré.
 *
 * Cf. window-renderer.ts pour le même pattern appliqué aux textboxes.
 */
import Phaser from 'phaser';

export interface ComposeTilemapOpts {
  /** Largeur en TILES (pas en pixels) du résultat. */
  widthTiles: number;
  /** Hauteur en TILES du résultat. */
  heightTiles: number;
}

/**
 * Compose une tilemap depuis un atlas PNG + buffer .bin et la registre comme
 * texture Phaser sous `outKey`.
 *
 * @returns le canvas créé (utile pour debug / passage à add.image)
 */
export function composeGbaTilemap(
  scene: Phaser.Scene,
  atlasKey: string,
  tilemapBuf: ArrayBuffer,
  outKey: string,
  opts: ComposeTilemapOpts
): HTMLCanvasElement {
  const { widthTiles, heightTiles } = opts;
  const w = widthTiles * 8;
  const h = heightTiles * 8;

  const atlas = scene.textures.get(atlasKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const atlasWidthTiles = Math.floor(atlas.width / 8);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const view = new DataView(tilemapBuf);
  const total = Math.min(widthTiles * heightTiles, tilemapBuf.byteLength / 2);

  for (let i = 0; i < total; i++) {
    const entry = view.getUint16(i * 2, true);
    const tileId = entry & 0x3FF;
    const hFlip = (entry & 0x400) !== 0;
    const vFlip = (entry & 0x800) !== 0;

    if (tileId >= atlasWidthTiles) continue; // tile vide / hors atlas

    const sx = tileId * 8;
    const sy = 0;
    const tx = (i % widthTiles) * 8;
    const ty = Math.floor(i / widthTiles) * 8;

    if (!hFlip && !vFlip) {
      ctx.drawImage(atlas as CanvasImageSource, sx, sy, 8, 8, tx, ty, 8, 8);
    } else {
      // Flip via save/scale/translate
      ctx.save();
      ctx.translate(tx + (hFlip ? 8 : 0), ty + (vFlip ? 8 : 0));
      ctx.scale(hFlip ? -1 : 1, vFlip ? -1 : 1);
      ctx.drawImage(atlas as CanvasImageSource, sx, sy, 8, 8, 0, 0, 8, 8);
      ctx.restore();
    }
  }

  if (scene.textures.exists(outKey)) scene.textures.remove(outKey);
  scene.textures.addCanvas(outKey, canvas);
  return canvas;
}

/**
 * Helper : charge un .bin tilemap depuis une URL et compose dans le même flow.
 * À appeler après que l'atlas soit chargé (dans create() après preload()).
 */
export async function composeGbaTilemapFromUrl(
  scene: Phaser.Scene,
  atlasKey: string,
  tilemapUrl: string,
  outKey: string,
  opts: ComposeTilemapOpts
): Promise<void> {
  const buf = await fetch(tilemapUrl).then(r => r.arrayBuffer());
  composeGbaTilemap(scene, atlasKey, buf, outKey, opts);
}

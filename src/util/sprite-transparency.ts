import Phaser from 'phaser';

/**
 * Emerald PNGs are indexed 4bpp where palette color 0 is the "transparent"
 * color by convention, but the PNG itself has no alpha channel set. This
 * reads the top-left pixel, treats that color as transparent, and rebuilds
 * the texture as a canvas with actual alpha=0 for those pixels.
 */
function makeCanvasWithTransparency(
  src: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const tr = px[0], tg = px[1], tb = px[2];
  for (let i = 0; i < px.length; i += 4) {
    if (px[i] === tr && px[i + 1] === tg && px[i + 2] === tb) px[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

export function registerTransparentSpriteSheet(
  scene: Phaser.Scene,
  sourceKey: string,
  newKey: string,
  frameWidth: number,
  frameHeight: number
): void {
  if (scene.textures.exists(newKey)) return;
  const src = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const canvas = makeCanvasWithTransparency(src);
  const canvasTexture = scene.textures.addCanvas(newKey, canvas);
  if (!canvasTexture) return;
  const cols = Math.floor(canvas.width / frameWidth);
  const rows = Math.floor(canvas.height / frameHeight);
  let frameIdx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      canvasTexture.add(frameIdx++, 0, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
    }
  }
}

export function registerTransparentImage(
  scene: Phaser.Scene,
  sourceKey: string,
  newKey: string
): void {
  if (scene.textures.exists(newKey)) return;
  const src = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const canvas = makeCanvasWithTransparency(src);
  scene.textures.addCanvas(newKey, canvas);
}

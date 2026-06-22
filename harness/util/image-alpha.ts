import Phaser from 'phaser';

/**
 * Processus standard pour les PNG indexés du décomp : la première couleur de
 * palette (pixel (0,0)) est la couleur "transparente" par convention. On
 * recompose le PNG en canvas avec alpha=0 sur tous les pixels de cette couleur.
 */
export function applyAlphaFromTopLeft(
  scene: Phaser.Scene,
  srcKey: string,
  outKey: string
): void {
  if (scene.textures.exists(outKey)) return;
  const img = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  const tr = p[0], tg = p[1], tb = p[2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  scene.textures.addCanvas(outKey, c);
}

/**
 * Variante pour spritesheets : transparentise + recrée les frames N×M.
 * Le PNG indexé décomp utilise idx 0 = couleur BG transparente convention.
 * Sample pixel (0,0) RGB et alpha=0 partout où matche, puis re-frames.
 */
export function applyAlphaToSpritesheet(
  scene: Phaser.Scene,
  srcKey: string,
  outKey: string,
  frameWidth: number,
  frameHeight: number,
): void {
  if (scene.textures.exists(outKey)) return;
  const img = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  const tr = p[0], tg = p[1], tb = p[2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  const tex = scene.textures.addCanvas(outKey, c);
  if (!tex) return;
  // Re-add frames (Phaser canvas texture starts with __BASE only).
  const cols = Math.floor(c.width / frameWidth);
  const rows = Math.floor(c.height / frameHeight);
  let frameIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      tex.add(frameIdx, 0, col * frameWidth, r * frameHeight, frameWidth, frameHeight);
      frameIdx++;
    }
  }
}

import Phaser from 'phaser';

/**
 * Rendu de texte variable-width depuis latin_normal.png.
 *
 * latin_normal.png = 256×512, 16 cols × 32 rows de cellules 16×16 (la moitié
 * haute est utilisée pour les bytes 0x00-0xFF). On détermine la largeur
 * effective de chaque glyphe en scannant les pixels non-transparents (après
 * alpha-processing), puis on rend avec un pas variable = largeur + 1px.
 */

const CELL_W = 16;
const CELL_H = 16;
const COLS = 16;
const LINE_H = 15;
const CHAR_GAP = 0; // pas d'espacement additionnel entre glyphes (1 px est inclus dans les cellules)

const FONT_KEY = 'ui-font-latin-normal';
const FONT_URL = '/decomp/em/ui/fonts/latin_normal.png';
const FONT_A_KEY = 'ui-font-a';
const CHARMAP_KEY = 'ui-charmap';
const CHARMAP_URL = '/decomp/em/ui/charmap.json';
const WIDTHS_KEY = 'font-widths';

export function preloadBitmapFont(scene: Phaser.Scene) {
  scene.load.image(FONT_KEY, FONT_URL);
  scene.load.json(CHARMAP_KEY, CHARMAP_URL);
}

/**
 * Process le PNG avec alpha + calcule la table de largeur pour chaque byte.
 * Largeur = colonne du dernier pixel non-transparent + 1 (ou 3 pour espace).
 */
export function setupBitmapFont(scene: Phaser.Scene): void {
  if (scene.textures.exists(FONT_A_KEY) && scene.registry.has(WIDTHS_KEY)) return;

  const img = scene.textures.get(FONT_KEY).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  const tr = p[0], tg = p[1], tb = p[2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  if (!scene.textures.exists(FONT_A_KEY)) scene.textures.addCanvas(FONT_A_KEY, c);

  // Scan largeur par glyphe (bytes 0x00-0xFF, top half du PNG)
  const widths = new Uint8Array(256);
  const W = c.width;
  for (let byte = 0; byte < 256; byte++) {
    const col = byte % COLS;
    const row = Math.floor(byte / COLS);
    const x0 = col * CELL_W;
    const y0 = row * CELL_H;
    let maxX = -1;
    for (let y = 0; y < CELL_H; y++) {
      for (let x = 0; x < CELL_W; x++) {
        const alpha = p[((y0 + y) * W + (x0 + x)) * 4 + 3];
        if (alpha > 0 && x > maxX) maxX = x;
      }
    }
    // Espace (byte 0) et glyphes vides : largeur par défaut 3px
    widths[byte] = maxX >= 0 ? (maxX + 1) : 3;
  }
  scene.registry.set(WIDTHS_KEY, widths);
}

function charWidth(ch: string, charmap: Record<string, number>, widths: Uint8Array): number {
  const byte = charmap[ch] ?? charmap[' '] ?? 0;
  return (widths[byte] || 3) + CHAR_GAP;
}

function stringWidth(s: string, charmap: Record<string, number>, widths: Uint8Array): number {
  let w = 0;
  for (const ch of s) w += charWidth(ch, charmap, widths);
  return w;
}

/**
 * Rend un texte multi-ligne variable-width en canvas, prêt à être utilisé
 * comme texture Phaser.
 */
export function renderTextToCanvas(
  scene: Phaser.Scene,
  text: string,
  maxWidth: number
): HTMLCanvasElement {
  const charmap = scene.cache.json.get(CHARMAP_KEY) as Record<string, number>;
  const widths = scene.registry.get(WIDTHS_KEY) as Uint8Array;
  const fontCanvas = scene.textures.get(FONT_A_KEY).getSourceImage() as HTMLCanvasElement;

  const paragraphs = text.split('\n');
  const lines: string[] = [];
  const spaceW = charWidth(' ', charmap, widths);
  for (const para of paragraphs) {
    if (!para) { lines.push(''); continue; }
    const words = para.split(' ');
    let cur = '';
    let curW = 0;
    for (const w of words) {
      const ww = stringWidth(w, charmap, widths);
      const needed = cur ? curW + spaceW + ww : ww;
      if (needed > maxWidth && cur) { lines.push(cur); cur = w; curW = ww; }
      else { cur = cur ? cur + ' ' + w : w; curW = needed; }
    }
    if (cur) lines.push(cur);
  }

  const canvasW = Math.max(1, Math.min(
    maxWidth,
    Math.max(...lines.map(l => stringWidth(l, charmap, widths)))
  ));
  const canvasH = Math.max(1, lines.length * LINE_H);
  const out = document.createElement('canvas');
  out.width = canvasW;
  out.height = canvasH;
  const octx = out.getContext('2d')!;

  for (let ly = 0; ly < lines.length; ly++) {
    let x = 0;
    for (const ch of lines[ly]) {
      const byte = charmap[ch] ?? charmap[' '] ?? 0;
      const col = byte % COLS;
      const row = Math.floor(byte / COLS);
      octx.drawImage(
        fontCanvas,
        col * CELL_W, row * CELL_H, CELL_W, CELL_H,
        x, ly * LINE_H, CELL_W, CELL_H
      );
      x += charWidth(ch, charmap, widths);
    }
  }
  return out;
}

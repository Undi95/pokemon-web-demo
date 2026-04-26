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
  // Détecte la BG color en samplant le centre de la cell 0 (espace = BG pure).
  // Pixel(0,0) ne marche PAS si le PNG a un TRNS chunk : alpha = 0 mais RGB =
  // (0,0,0) → on transparentiserait les noirs au lieu de la BG bleu, et tous
  // les glyphes resteraient en blocs 16×16 opaques (bug session 28 cursor).
  const sampleOffset = (Math.floor(CELL_H / 2) * c.width + Math.floor(CELL_W / 2)) * 4;
  const tr = p[sampleOffset], tg = p[sampleOffset + 1], tb = p[sampleOffset + 2];
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
 * Options de rendu d'un texte (palette remap minimal côté web).
 */
export interface RenderTextOpts {
  /**
   * Si true, transparentise les pixels BLANCS (palette font idx 3).
   *
   * Pourquoi : dans le décomp, font_idx 3 = "BG fill du glyphe" qui est
   * remappé au render time via TextPrinter à la couleur bg de la fenêtre
   * (souvent TEXT_COLOR_TRANSPARENT pour cursor/menu).
   *
   * Notre PNG charge avec idx 3 = (255,255,255) opaque. Sans flag, on garde
   * le blanc → nickel sur dialog blanc, mais le cursor ▶ devient un carré
   * blanc qui devient noir avec setTint. Avec flag : carré blanc → transparent
   * → cursor = vrai triangle.
   */
  transparentizeWhite?: boolean;
  /**
   * Si true (DEFAULT), remappe les couleurs du PNG font vers les couleurs
   * "dialog text" du décomp via TextPrinter :
   *   - font idx 1 (PNG dark gray 56,56,56)  → output WHITE (255,255,255) = invisible sur bg blanc
   *   - font idx 2 (PNG light gray 216,216,216) → output DARK GRAY (96,96,96) = visible OUTLINE
   *
   * Ce remap reproduit `sTextColors[] = { TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_WHITE,
   * TEXT_COLOR_DARK_GRAY }` du décomp (menu.c:110) où le BODY est blanc invisible
   * et le SHADOW est dark gray visible. Sinon le texte a un halo light gray.
   */
  authenticColors?: boolean;
}

/**
 * Rend un texte multi-ligne variable-width en canvas, prêt à être utilisé
 * comme texture Phaser.
 */
export function renderTextToCanvas(
  scene: Phaser.Scene,
  text: string,
  maxWidth: number,
  opts: RenderTextOpts = {},
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

  // Post-process : reproduit le pipeline TextPrinter du décomp.
  //
  // Encoding font tile (cf. src/text.c GenerateFontHalfRowLookupTable l.363) :
  //   - tile value 0 → bg slot   (palette[bgColor])
  //   - tile value 1 → fg slot   (palette[fgColor])
  //   - tile value 2 → shadow slot (palette[shadowColor])
  // PNG indexé idx 0/1/2/3 mappe à : transparent / fg slot / shadow slot / bg slot.
  //
  // sFontInfos[FONT_NORMAL] (src/text.c:131) : { fgColor=2, bgColor=1, shadowColor=3 }
  // gMessageBox_Pal : palette[1]=(248,248,248) blanc, palette[2]=(96,96,96) dark gray,
  //                   palette[3]=(208,208,200) cream
  //
  // Donc :
  //   - PNG idx 1 (56,56,56) → palette[fg=2] (96,96,96) DARK GRAY = visible body
  //   - PNG idx 2 (216,216,216) → palette[shadow=3] (208,208,200) CREAM = subtle shadow
  //   - PNG idx 3 (255,255,255) → palette[bg=1] (248,248,248) WHITE = matches dialog interior
  //
  // transparentizeWhite (cursor) : idx 3 → alpha=0 au lieu de white (pour éviter
  // le carré blanc visible qui devient noir avec setTint).
  const needsPostProcess = opts.transparentizeWhite || opts.authenticColors;
  if (needsPostProcess) {
    const data = octx.getImageData(0, 0, out.width, out.height);
    const p = data.data;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] === 0) continue;
      const r = p[i], g = p[i + 1], b = p[i + 2];
      // Cursor : idx 3 (white) → alpha=0 AVANT le remap.
      if (opts.transparentizeWhite && r === 255 && g === 255 && b === 255) {
        p[i + 3] = 0;
        continue;
      }
      if (opts.authenticColors) {
        if (r === 56 && g === 56 && b === 56) {
          // body dark → palette[fg=2]
          p[i] = 96; p[i + 1] = 96; p[i + 2] = 96;
        } else if (r === 216 && g === 216 && b === 216) {
          // shadow light gray → palette[shadow=3] cream (subtle, presque invisible)
          p[i] = 208; p[i + 1] = 208; p[i + 2] = 200;
        } else if (r === 255 && g === 255 && b === 255) {
          // bg fill white → palette[bg=1] (matches dialog interior 248,248,248)
          p[i] = 248; p[i + 1] = 248; p[i + 2] = 248;
        }
      }
    }
    octx.putImageData(data, 0, 0);
  }

  return out;
}

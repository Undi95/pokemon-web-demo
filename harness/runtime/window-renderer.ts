/**
 * WindowRenderer — composition de fenêtres UI à partir des données extraites
 * du décomp pokeemeraude. AUCUN HARDCODE de position : toutes les coordonnées
 * et tailles viennent de `public/decomp/em/window-templates.json` (extrait par
 * `scripts/extract-window-templates.mjs`).
 *
 * Cf. WINDOWS_BOXES_REFERENCE.md pour le catalogue des templates et palettes.
 *
 * Usage typique :
 *   1. Au boot (OverworldScene.preload) : `preloadWindowAssets(scene)`
 *   2. À la création (afterMapLoad) : `setupWindowAssets(scene)`
 *   3. Pour afficher : `const w = createWindow(scene, 'sStandardTextBox_WindowTemplates')`
 *      → retourne `{ frame, pixelX, pixelY, pixelW, pixelH, template }`
 */
import Phaser from 'phaser';

/** Champs d'un struct WindowTemplate du décomp. */
export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number | string;     // peut être "DISPLAY_TILE_WIDTH" non résolu
  height: number | string;
  paletteNum: number;
  baseBlock: number | string;
}

/** Palette 16 couleurs RGB (extraite des .pal JASC du décomp). */
export interface Palette {
  colors: Array<[number, number, number]>;
}

export interface CreateWindowOpts {
  /** Frame PNG à utiliser (1-20 ou 'message_box'). Défaut : 1 (cadre standard). */
  frameId?: number | 'message_box';
  /** Nom de palette à appliquer (text_pal1-4, etc.). Si absent → PNG natif. */
  paletteName?: string;
  /** Overrides de position si template dynamique (multichoice, money). */
  tilemapLeft?: number;
  tilemapTop?: number;
  width?: number;
  height?: number;
  /** Profondeur Phaser. Défaut 200000 (au-dessus du jeu). */
  depth?: number;
}

export interface WindowHandle {
  frame: Phaser.GameObjects.NineSlice;
  template: WindowTemplate;
  pixelX: number; pixelY: number; pixelW: number; pixelH: number;
}

// ─── État global (chargé au boot) ────────────────────────────────────────────

let templates: Record<string, WindowTemplate | WindowTemplate[]> = {};
let palettes: Record<string, Palette> = {};

export function loadWindowTemplates(t: Record<string, WindowTemplate | WindowTemplate[]>) {
  templates = t || {};
}

export function loadWindowPalettes(p: Record<string, Palette>) {
  palettes = p || {};
}

export function getWindowTemplate(name: string): WindowTemplate | null {
  const raw = templates[name];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Mapping `template.paletteNum` → nom de palette dans `palettes.json`.
 *
 * Convention décomp (cf. include/menu.h) :
 *  - 15 = DLG_WINDOW_PALETTE_NUM → palette message_box (≈ text_pal1)
 *  - 14 = STD_WINDOW_PALETTE_NUM → palette std_menu
 *  - 1  = OPTION_MENU_PAL → option_menu_text
 *  - 10 = naming screen
 *  - 11 = banner
 *  - autres : fallback text_pal1
 *
 * Si la palette demandée n'existe pas dans palettes.json, retourne undefined
 * (= utilise les couleurs natives du PNG, qui matchent text_pal1 par défaut).
 */
export function getPaletteNameForNum(paletteNum: number): string | undefined {
  switch (paletteNum) {
    case 15: return 'text_pal1';
    case 14: return 'std_menu';
    case 1:  return 'option_menu_text';
    case 10: return undefined;  // naming screen, palette dans graphics/interface/
    case 11: return undefined;  // banner
    default: return undefined;
  }
}

/** Position pixel d'un template (sans créer la frame). Utilisé par menu.ts. */
export function getTemplatePixelRect(name: string): { x: number; y: number; w: number; h: number } | null {
  const t = getWindowTemplate(name);
  if (!t) return null;
  const w = typeof t.width === 'number' ? t.width : 0;
  const h = typeof t.height === 'number' ? t.height : 0;
  return { x: t.tilemapLeft * 8, y: t.tilemapTop * 8, w: w * 8, h: h * 8 };
}

// ─── Préchargement des assets PNG ────────────────────────────────────────────

const FRAME_KEY_PREFIX = 'wnd-frame-';     // frame brute chargée du PNG
const FRAME_TEX_PREFIX = 'wnd-tex-';       // texture composée (frame × palette)

/** Liste les frames disponibles (text_window/{1..20}.png + message_box.png). */
function frameUrl(frameId: number | 'message_box'): string {
  if (frameId === 'message_box') return '/decomp/em/ui/text_window/message_box.png';
  return `/decomp/em/ui/text_window/${frameId}.png`;
}

function frameKey(frameId: number | 'message_box'): string {
  return `${FRAME_KEY_PREFIX}${frameId}`;
}

/** Charge tous les frames PNG + le JSON templates/palettes. */
export function preloadWindowAssets(scene: Phaser.Scene) {
  for (let i = 1; i <= 20; i++) {
    const k = frameKey(i);
    if (!scene.textures.exists(k)) scene.load.image(k, frameUrl(i));
  }
  const mb = frameKey('message_box');
  if (!scene.textures.exists(mb)) scene.load.image(mb, frameUrl('message_box'));

  if (!scene.cache.json.has('window-templates')) {
    scene.load.json('window-templates', '/decomp/em/window-templates.json');
  }
  if (!scene.cache.json.has('window-palettes')) {
    scene.load.json('window-palettes', '/decomp/em/palettes.json');
  }
}

/** Wire les JSON dans l'état global. Appeler après scene.load. */
export function setupWindowAssets(scene: Phaser.Scene) {
  const t = scene.cache.json.get('window-templates') as Record<string, WindowTemplate | WindowTemplate[]> | undefined;
  if (t) loadWindowTemplates(t);
  const p = scene.cache.json.get('window-palettes') as Record<string, Palette> | undefined;
  if (p) loadWindowPalettes(p);
}

// ─── Composition de texture (frame × palette) ────────────────────────────────

/**
 * Compose une texture à partir d'une frame PNG + palette RGB du décomp.
 *
 * Méthode : on lit les pixels du PNG, on extrait l'ordre d'apparition unique
 * des couleurs (qui correspond à l'ordre des slots de palette dans le PNG
 * indexé original), puis on remplace chaque pixel par la couleur cible de la
 * palette à l'index correspondant.
 *
 * Limite : suppose que les couleurs du PNG sont DISTINCTES (sinon le mapping
 * fusionne des slots). En pratique vrai pour les frames text_window.
 *
 * Si pas de palette demandée, retourne la texture native du PNG (la plus
 * fidèle visuellement car déjà colorée par le décompiler).
 */
function ensureComposedTexture(scene: Phaser.Scene, frameId: number | 'message_box', paletteName?: string): string {
  const srcKey = frameKey(frameId);
  if (!paletteName) return srcKey;

  const targetKey = `${FRAME_TEX_PREFIX}${frameId}-${paletteName}`;
  if (scene.textures.exists(targetKey)) return targetKey;
  if (!scene.textures.exists(srcKey)) return srcKey;

  const pal = palettes[paletteName];
  if (!pal || pal.colors.length === 0) return srcKey;

  const src = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const canvas = document.createElement('canvas');
  canvas.width = src.width; canvas.height = src.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return srcKey;
  ctx.drawImage(src as CanvasImageSource, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = data.data;
  // Construit un map ordre-d'apparition → index palette.
  const colorIndex = new Map<number, number>();
  let nextIdx = 0;
  for (let i = 0; i < p.length; i += 4) {
    const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2];
    if (!colorIndex.has(key)) {
      colorIndex.set(key, nextIdx++);
      if (nextIdx >= 16) break;
    }
  }
  // Sample idx 0 BG (pixel 0,0) AVANT remap pour pouvoir transparentiser après.
  const bgR0 = p[0], bgG0 = p[1], bgB0 = p[2];
  // Remappe chaque pixel.
  for (let i = 0; i < p.length; i += 4) {
    const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2];
    const idx = colorIndex.get(key);
    if (idx !== undefined) {
      const c = pal.colors[idx];
      if (c) { p[i] = c[0]; p[i + 1] = c[1]; p[i + 2] = c[2]; }
    }
  }
  // Transparentise la couleur BG (devenue pal[0] après remap, ou bgR0/G0/B0
  // si pas dans la palette). Évite la bordure verte/cyan parasite autour.
  const palBg = pal.colors[0];
  const tR = palBg ? palBg[0] : bgR0;
  const tG = palBg ? palBg[1] : bgG0;
  const tB = palBg ? palBg[2] : bgB0;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tR && p[i + 1] === tG && p[i + 2] === tB) p[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  scene.textures.addCanvas(targetKey, canvas);
  return targetKey;
}

// ─── API publique ────────────────────────────────────────────────────────────

// ─── Composition tile-par-tile pour message_box (dialog box) ─────────────────

/**
 * Compose une dialog box authentique depuis `message_box.png` (14 tiles 7×2).
 *
 * Reproduit `WindowFunc_DrawDialogueFrame` (src/menu.c:319-412) :
 *   - Ligne haute : tiles 1, 3, 4×(w-1), 5, 6
 *   - Intérieur (h lignes) : tile 7 | tile 9×(w+1) | tile 10
 *   - Ligne basse : V_FLIP des mêmes tiles que le haut
 *
 * Canvas total = (widthTiles+3) × (heightTiles+2) tiles (= ajout 2 tiles à
 * gauche / 1 à droite / 1 en haut / 1 en bas vs zone de texte).
 *
 * Anchor : la position d'origine du template correspond au tile (col=2, row=1)
 * du canvas composé.
 */
function composeDialogTexture(scene: Phaser.Scene, widthTiles: number, heightTiles: number): string {
  const cacheKey = `wnd-dlg-${widthTiles}x${heightTiles}`;
  if (scene.textures.exists(cacheKey)) return cacheKey;

  const srcKey = frameKey('message_box');
  if (!scene.textures.exists(srcKey)) return srcKey;
  const src = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;

  const totalCols = widthTiles + 3;   // 2 left padding + width + 1 right padding
  const totalRows = heightTiles + 2;  // 1 top + height + 1 bottom
  const canvas = document.createElement('canvas');
  canvas.width = totalCols * 8;
  canvas.height = totalRows * 8;
  const ctx = canvas.getContext('2d');
  if (!ctx) return srcKey;

  // Désactive le smoothing pour pixel art
  ctx.imageSmoothingEnabled = false;

  // Dessine la tile #i (0-13 dans la grille 7×2 source) à la position (tx, ty) tile.
  function drawTile(tileIdx: number, tx: number, ty: number, vFlip = false) {
    const sx = (tileIdx % 7) * 8;
    const sy = Math.floor(tileIdx / 7) * 8;
    if (!vFlip) {
      ctx!.drawImage(src as CanvasImageSource, sx, sy, 8, 8, tx * 8, ty * 8, 8, 8);
    } else {
      ctx!.save();
      ctx!.translate(tx * 8, ty * 8 + 8);
      ctx!.scale(1, -1);
      ctx!.drawImage(src as CanvasImageSource, sx, sy, 8, 8, 0, 0, 8, 8);
      ctx!.restore();
    }
  }

  // ─── Haut (row 0) ─────────────────────────────────────────────────────────
  drawTile(1, 0, 0);
  drawTile(3, 1, 0);
  for (let i = 0; i < widthTiles - 1; i++) drawTile(4, 2 + i, 0);
  drawTile(5, widthTiles + 1, 0);
  drawTile(6, widthTiles + 2, 0);

  // ─── Intérieur (rows 1 à heightTiles) ────────────────────────────────────
  // Décomp : tile 9 fill au BG layer + FillWindowPixelBuffer(idx 1) au window layer.
  // Le window layer recouvre l'intérieur — l'utilisateur voit BLANC PUR (palette
  // text_pal1[1] = #FFFFFF), pas tile 9. On reproduit ce comportement en
  // remplissant les cellules intérieures avec blanc pur après avoir dessiné les
  // bords. Tile 7/10 (bords gauche/droit "extra") restent visibles.
  for (let r = 1; r <= heightTiles; r++) {
    drawTile(7, 0, r);
    for (let c = 0; c < widthTiles + 1; c++) drawTile(9, 1 + c, r);
    drawTile(10, widthTiles + 2, r);
  }
  // Overlay couleur INTÉRIEUR sur cols 1 à widthTiles+1, rows 1 à heightTiles.
  // Reproduit `FillWindowPixelBuffer(windowId, PIXEL_FILL(1))` du décomp = remplit
  // avec palette[1] de gMessageBox_Pal = (248,248,248) (presque blanc, pas pur).
  // Cf. message_box.png embedded palette idx 1.
  ctx.fillStyle = 'rgb(248,248,248)';
  ctx.fillRect(1 * 8, 1 * 8, (widthTiles + 1) * 8, heightTiles * 8);

  // ─── Bas (row heightTiles+1) — V_FLIP des tiles du haut ──────────────────
  const br = heightTiles + 1;
  drawTile(1, 0, br, true);
  drawTile(3, 1, br, true);
  for (let i = 0; i < widthTiles - 1; i++) drawTile(4, 2 + i, br, true);
  drawTile(5, widthTiles + 1, br, true);
  drawTile(6, widthTiles + 2, br, true);

  // Transparentise la couleur BG (idx 0 PNG = vert décomp ~112/200/160). Sans
  // ça : bordure verte/cyan autour du cadre car les tiles "bord" du PNG ont
  // des pixels extérieurs en idx 0. Cf. décomp `gMessageBox_Pal` palette[0] =
  // green, ne s'affiche jamais sur GBA car BG layer dessous (palette ≠).
  // On sample le PNG source à pixel (0,0) qui est garanti BG idx 0.
  const srcImg = src as HTMLImageElement;
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = srcImg.width; probeCanvas.height = srcImg.height;
  const probeCtx = probeCanvas.getContext('2d')!;
  probeCtx.drawImage(srcImg as CanvasImageSource, 0, 0);
  const probe = probeCtx.getImageData(0, 0, 1, 1).data;
  const bgR = probe[0], bgG = probe[1], bgB = probe[2];
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === bgR && p[i + 1] === bgG && p[i + 2] === bgB) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);

  scene.textures.addCanvas(cacheKey, canvas);
  return cacheKey;
}

/**
 * Crée une dialog box authentique (message_box.png composé tile-par-tile).
 * Retourne le handle avec position pixel ajustée (le "anchor" du template
 * est à 2 tiles à gauche / 1 tile en haut du coin haut-gauche du canvas).
 */
export function createDialogWindow(scene: Phaser.Scene, name: string, opts: CreateWindowOpts = {}): WindowHandle | null {
  const t = getWindowTemplate(name);
  if (!t) return null;

  const widthTiles = opts.width ?? (typeof t.width === 'number' ? t.width : 0);
  const heightTiles = opts.height ?? (typeof t.height === 'number' ? t.height : 0);
  if (!widthTiles || !heightTiles) return null;

  const tilemapLeft = opts.tilemapLeft ?? t.tilemapLeft;
  const tilemapTop = opts.tilemapTop ?? t.tilemapTop;

  // Le canvas composé démarre 2 tiles à gauche et 1 tile au-dessus de la zone texte.
  const canvasX = (tilemapLeft - 2) * 8;
  const canvasY = (tilemapTop - 1) * 8;
  const canvasW = (widthTiles + 3) * 8;
  const canvasH = (heightTiles + 2) * 8;

  const texKey = composeDialogTexture(scene, widthTiles, heightTiles);
  // Image standard (pas NineSlice : la composition gère déjà la taille exacte).
  const img = scene.add.image(canvasX, canvasY, texKey).setOrigin(0, 0);
  img.setScrollFactor(0).setDepth(opts.depth ?? 200000);

  // On retourne un faux NineSlice via cast (Image partage l'API positionnelle).
  return {
    frame: img as unknown as Phaser.GameObjects.NineSlice,
    template: t,
    pixelX: tilemapLeft * 8,    // anchor = position du texte
    pixelY: tilemapTop * 8,
    pixelW: widthTiles * 8,
    pixelH: heightTiles * 8,
  };
}

/**
 * Crée une fenêtre 9-slice à la position du template demandé.
 * Retourne null si template inconnu (caller doit fallback).
 *
 * @param name Nom du template (ex. 'sStandardTextBox_WindowTemplates', 'sYesNo_WindowTemplates')
 */
export function createWindow(scene: Phaser.Scene, name: string, opts: CreateWindowOpts = {}): WindowHandle | null {
  const t = getWindowTemplate(name);
  if (!t) {
    console.warn('[window-renderer] template inconnu:', name);
    return null;
  }

  const tilemapLeft = opts.tilemapLeft ?? t.tilemapLeft;
  const tilemapTop = opts.tilemapTop ?? t.tilemapTop;
  const widthTiles = opts.width ?? (typeof t.width === 'number' ? t.width : 0);
  const heightTiles = opts.height ?? (typeof t.height === 'number' ? t.height : 0);

  if (!widthTiles || !heightTiles) {
    console.warn('[window-renderer] dimensions invalides pour', name, t);
    return null;
  }

  const pixelX = tilemapLeft * 8;
  const pixelY = tilemapTop * 8;
  const pixelW = widthTiles * 8;
  const pixelH = heightTiles * 8;

  const frameId = opts.frameId ?? 1;
  // Si caller ne précise pas paletteName, on déduit du template.paletteNum.
  // (Cf. audit 1:1 GBA vs web port — le décomp remappe au runtime selon paletteNum.)
  const palName = opts.paletteName ?? getPaletteNameForNum(t.paletteNum);
  const texKey = ensureComposedTexture(scene, frameId, palName);

  const ns = scene.add.nineslice(
    pixelX + pixelW / 2, pixelY + pixelH / 2,
    texKey, 0,
    pixelW, pixelH,
    8, 8, 8, 8,
  );
  ns.setScrollFactor(0).setDepth(opts.depth ?? 200000);

  return { frame: ns, template: t, pixelX, pixelY, pixelW, pixelH };
}

/**
 * Types de base pour l'émulation GBA-compat sur Canvas 2D.
 *
 * Référence : décomp pokeemeraude (auto/include/gba/io_reg-data.ts pour les
 * regs hardware exacts) + GBATEK (https://problemkaputt.de/gbatek.htm).
 *
 * Résolution écran : 240 × 160 pixels.
 * Modes graphiques utilisés par Pokemon Emerald :
 *   - Mode 0 : 4 BG text layers (BG0-3), pas d'affine
 *   - Mode 1 : BG0/BG1 text + BG2 affine
 *   - Mode 2 : BG2/BG3 affine seulement
 * (Modes 3-5 bitmap pas utilisés par le jeu)
 */

export const SCREEN_W = 240;
export const SCREEN_H = 160;

/** RGB15 GBA (5 bits par canal, 0-31) → packed u16. Bit 15 ignoré. */
export type Rgb15 = number;

/** RGBA888 (4 bytes : R, G, B, A 0-255). */
export type Rgba8 = readonly [number, number, number, number];

/** Décode un Rgb15 GBA en RGBA888. */
export function rgb15ToRgba8(rgb15: Rgb15): Rgba8 {
  const r = (rgb15 & 0x1F);
  const g = ((rgb15 >> 5) & 0x1F);
  const b = ((rgb15 >> 10) & 0x1F);
  // ×8 + (×8 / 32) approx pour étendre 5-bit → 8-bit (formule GBATEK).
  // En pratique simple ×8 marche : 31 × 8 = 248, déjà très clair.
  return [r * 8, g * 8, b * 8, 255];
}

/** Encode 3 canaux 0-255 → Rgb15 GBA. */
export function rgba8ToRgb15(r: number, g: number, b: number): Rgb15 {
  return ((b >> 3) & 0x1F) << 10 | ((g >> 3) & 0x1F) << 5 | ((r >> 3) & 0x1F);
}

/** Tile data 8x8 pixels. Chaque entrée = index dans la palette du tile. */
export type TilePixels = Uint8Array; // 64 bytes (8×8 indices 0..15 ou 0..255)

/** BG tilemap entry — u16 packed :
 *    bits  0- 9 : tile index (0-1023)
 *    bit  10    : flip horizontal
 *    bit  11    : flip vertical
 *    bits 12-15 : palette bank (0-15, 4bpp seulement, ignoré en 8bpp)
 */
export interface BgMapEntry {
  tileId: number;       // 0-1023
  flipH: boolean;
  flipV: boolean;
  paletteBank: number;  // 0-15
}

/** Décode un u16 tilemap entry → BgMapEntry. */
export function decodeBgMapEntry(packed: number): BgMapEntry {
  return {
    tileId: packed & 0x3FF,
    flipH: !!(packed & 0x400),
    flipV: !!(packed & 0x800),
    paletteBank: (packed >> 12) & 0xF,
  };
}

/** Configuration d'un BG layer (BG0-3). 1:1 décomp struct BgConfig. */
export interface BgConfig {
  /** Layer visible (= effective visibility used by compositor). */
  visible: boolean;
  /** 1:1 décomp : ShowBg/HideBg set un FLAG queue qui n'est appliqué qu'au
   *  prochain VBlank (= via SyncBgVisibilityAndMode). Sans ça, on a un flash
   *  pendant les CB2 init de scène (= BG visible avant que la palette soit
   *  loaded). Notre runtime sync `pendingVisible → visible` à la fin de
   *  runOneFrame (= équivalent VBlank). */
  pendingVisible: boolean | null;
  /** Priority 0-3 (0 = devant). En cas d'égalité : BG0 > BG1 > BG2 > BG3. */
  priority: number;
  /** Char base (où sont stockées les tile data en VRAM). 0-3 (×16KB). */
  charBaseIndex: number;
  /** Map base (où est stocké le tilemap en VRAM). 0-31 (×2KB). */
  mapBaseIndex: number;
  /** 1:1 décomp `BgTemplate.baseTile` (bg.c) — offset (en tuiles) ajouté au placement
   *  VRAM (bg.c:382 `(baseTile + destOffset) * 0x20`) ET aux numéros de tuiles du tilemap
   *  des fenêtres (window.c:325 `baseTile + baseBlock`). Permet à 2 BG partageant un charBase
   *  de sous-allouer sans collision (easy_chat BG0/BG2 charBase 0 : BG2 baseTile 0x80). */
  baseTile: number;
  /** Screen size 0-3 (signification dépend de isAffine) :
   *  Text BG : 32×32 / 64×32 / 32×64 / 64×64 tiles
   *  Affine BG : 16×16 / 32×32 / 64×64 / 128×128 tiles
   */
  screenSize: 0 | 1 | 2 | 3;
  /** 0 = 4bpp (16 colors per palette bank), 1 = 8bpp (256 colors).
   *  En affine mode, toujours 8bpp (paletteMode ignoré). */
  paletteMode: 0 | 1;
  /** Mosaic effect : si true, le BG est mosaicé selon les facteurs de mosaicH/mosaicV. */
  mosaic: boolean;
  /** Wraparound (BG2/BG3 affine only) — si true, le BG répète indéfiniment. */
  wraparound: boolean;
  /** Scroll horizontal (REG_BGnHOFS, text BG only). */
  hofs: number;
  /** Scroll vertical (REG_BGnVOFS, text BG only). */
  vofs: number;
  /** Si true, ce BG est rendu en mode AFFINE (BG2/BG3 dans Mode 1/2 GBA).
   *  Les champs hofs/vofs sont ignorés ; on utilise affineRefX/Y + affineMatrixIndex.
   *  Le tilemap est en u8 (1 byte par tile = tileId 0-255), les flips/palette ignorés.
   *  Toujours 8bpp. */
  isAffine: boolean;
  /** Reference point X (28.8 fixed). Position de la matrice affine. */
  affineRefX: number;
  /** Reference point Y (28.8 fixed). */
  affineRefY: number;
  /** Index dans Gba.bgAffineMatrices[2] (BG2 = 0, BG3 = 1 typiquement). */
  affineMatrixIndex: 0 | 1;
}

/** Mosaic configuration globale (REG_MOSAIC).
 *  Active per-layer via BgConfig.mosaic ou OamEntry.mosaic. */
export interface MosaicConfig {
  /** Facteur horizontal BG : 0 = pas d'effet, 1-15 = repeat le pixel sur N+1 colonnes. */
  bgH: number;
  /** Facteur vertical BG : 0 = pas, 1-15 = repeat sur N+1 lignes. */
  bgV: number;
  /** Facteur horizontal OBJ. */
  objH: number;
  /** Facteur vertical OBJ. */
  objV: number;
}

export function defaultMosaicConfig(): MosaicConfig {
  return { bgH: 0, bgV: 0, objH: 0, objV: 0 };
}

/** OAM entry — 128 sprites disponibles. 1:1 décomp struct OamData u16 attr0/1/2.
 *  Cf. auto/src/decompress-data.ts ou similar pour layout exact. */
export interface OamEntry {
  /** Sprite visible (attr0 bit 8 + 9 != hide). */
  visible: boolean;
  /** Y position (attr0 bits 0-7). 8-bit signed extended (0-159 typique). */
  y: number;
  /** X position (attr1 bits 0-8). 9-bit signed extended (0-239 typique). */
  x: number;
  /** Tile index (attr2 bits 0-9). */
  tileId: number;
  /** Palette bank OBJ (attr2 bits 12-15) en 4bpp (8bpp ignoré). */
  paletteBank: number;
  /** Priority vs BG layers (attr2 bits 10-11), 0 = devant. */
  priority: number;
  /** Sprite size : (shape, size) → (w, h) en tiles 8×8.
   *    shape 0 (square) : sizes 1×1 / 2×2 / 4×4 / 8×8 tiles
   *    shape 1 (wide)   : 2×1 / 4×1 / 4×2 / 8×4 tiles
   *    shape 2 (tall)   : 1×2 / 1×4 / 2×4 / 4×8 tiles
   */
  shape: 0 | 1 | 2;
  size: 0 | 1 | 2 | 3;
  /** Flip H/V (4bpp normal mode only). */
  flipH: boolean;
  flipV: boolean;
  /** 8bpp mode (256-color palette OBJ index 0). */
  paletteMode: 0 | 1;
  /** Mosaic. */
  mosaic: boolean;
  /** OBJ mode (attr0 bits 10-11) : NORMAL / SEMI_TRANSPARENT / OBJ_WINDOW. */
  objMode: 0 | 1 | 2;
  /** Affine mode (attr0 bit 8 + 9) : NORMAL / AFFINE / HIDE / DOUBLE. */
  affineMode: 0 | 1 | 2 | 3;
  /** Affine matrix slot (0-31, attr1 bits 9-13) si affineMode != NORMAL. */
  affineParamIndex: number;
  /** 1:1 struct OamData.affineParam (offset 0x06, u16) — champ DISTINCT de
   *  affineParamIndex (matrixNum). Detourne comme registre SCRATCH 16-bit par
   *  certains sprite callbacks (ex. SpriteCB_PlayerMonSendOut_2 : sBattler en byte
   *  bas + compteur de frame en byte haut). Non synchronise vers le hardware OAM
   *  par le compositor (usage purement logique cote sprite callbacks). */
  affineParam: number;
  /** Sub-priority used by `BuildSpritePriorities` (= sprite.c:361) to order
   *  same-priority OBJs : `priority = subpriority | (oam.priority << 8)`,
   *  sort ASC. Lower subpriority drawn ON TOP. Hardware GBA OAM doesn't
   *  have a subpriority field — décomp synthesizes it from the SpriteTemplate's
   *  4th CreateSprite arg. We mirror it here so the compositor can sort
   *  correctly (= 1:1 décomp BuildSpritePriorities + SortSprites). */
  subpriority: number;
}

/** Sprite size lookup [shape][size] → [width_tiles, height_tiles]. */
export const OAM_SIZES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // shape 0 : square
  [[1, 1], [2, 2], [4, 4], [8, 8]],
  // shape 1 : wide
  [[2, 1], [4, 1], [4, 2], [8, 4]],
  // shape 2 : tall
  [[1, 2], [1, 4], [2, 4], [4, 8]],
];

/** Default OAM entry (hidden, all zero). */
export function defaultOamEntry(): OamEntry {
  return {
    visible: false,
    x: 0, y: 0,
    tileId: 0,
    paletteBank: 0,
    priority: 0,
    shape: 0, size: 0,
    flipH: false, flipV: false,
    paletteMode: 0,
    mosaic: false,
    objMode: 0,
    affineMode: 0,
    affineParamIndex: 0,
    affineParam: 0,
    subpriority: 0xFF,  // 1:1 décomp default for sentinel slots (sprite.c:168)
  };
}

/** Default BgConfig (text BG, hidden, all-zero). */
export function defaultBgConfig(): BgConfig {
  return {
    visible: false,
    pendingVisible: null,
    priority: 0,
    charBaseIndex: 0,
    mapBaseIndex: 0,
    baseTile: 0,
    screenSize: 0,
    paletteMode: 0,
    mosaic: false,
    wraparound: false,
    hofs: 0,
    vofs: 0,
    isAffine: false,
    affineRefX: 0,
    affineRefY: 0,
    affineMatrixIndex: 0,
  };
}

/** Affine matrix BG2/BG3 ou OAM (8.8 fixed point — valeur 256 = 1.0).
 *  Transform appliquée pour OAM rotscale :
 *    Pour chaque pixel screen (sx, sy) dans la bounding box centrée sur le
 *    sprite, on calcule la coord source dans la texture :
 *      texX = (pa × (sx - cx) + pb × (sy - cy)) / 256 + w/2
 *      texY = (pc × (sx - cx) + pd × (sy - cy)) / 256 + h/2
 *
 *  Identité (sprite non transformé) :  pa=256, pb=0, pc=0, pd=256
 *  Rotation θ :  pa=cos(θ)×256, pb=-sin(θ)×256, pc=sin(θ)×256, pd=cos(θ)×256
 *  Scale s : pa = pd = (1/s) × 256  (1/s car matrice inverse appliquée au screen) */
export interface AffineMatrix {
  pa: number;  // 8.8 fixed
  pb: number;
  pc: number;
  pd: number;
}

/** Identity affine matrix : sprite non transformé (1.0 scale, 0° rotation). */
export function identityAffineMatrix(): AffineMatrix {
  return { pa: 256, pb: 0, pc: 0, pd: 256 };
}

/** Construit une matrice affine pour rotation (radians) + scale uniforme.
 *  scale = 1.0 → pas de zoom. scale > 1 = zoom out (sprite plus petit à l'écran).
 *  scale < 1 = zoom in (sprite plus grand). */
export function rotScaleAffineMatrix(rotationRadians: number, scale: number): AffineMatrix {
  const inv = 1 / scale;
  const cos = Math.cos(rotationRadians) * inv;
  const sin = Math.sin(rotationRadians) * inv;
  return {
    pa: Math.round(cos * 256),
    pb: Math.round(-sin * 256),
    pc: Math.round(sin * 256),
    pd: Math.round(cos * 256),
  };
}

/** Window config (WIN0/WIN1) — rect inclusion. */
export interface WindowRect {
  enabled: boolean;
  x1: number;  // left (inclusive)
  x2: number;  // right (exclusive)
  y1: number;  // top (inclusive)
  y2: number;  // bottom (exclusive)
}

/** GBA hardware windows : WIN0/WIN1 (rect inclusion) + WINOBJ (zones définies par
 *  les sprites objMode=OBJ_WINDOW) + WINOUT (everywhere else).
 *  Si toutes windows = enabled false, alors bypass complet (tous layers visibles partout).
 *  Sinon les bitmasks insideX/outside contrôlent quels layers sont visibles.
 *
 *  Bitmasks utilisent LAYER_BG0/BG1/BG2/BG3/OBJ/BD constants.
 *  Priority : WIN0 > WIN1 > WINOBJ > WINOUT */
export interface Windows {
  win0: WindowRect;
  win1: WindowRect;
  /** Layers visibles à l'INTÉRIEUR de WIN0 (WININ_WIN0). */
  win0Inside: number;
  /** Layers visibles à l'INTÉRIEUR de WIN1 (WININ_WIN1). */
  win1Inside: number;
  /** Layers visibles à l'EXTÉRIEUR de toutes windows (WINOUT). */
  outsideEnable: number;
  /** Si true, applique l'effet de blend uniquement à l'intérieur de WIN0. */
  win0BlendEnable: boolean;
  /** Si true, applique l'effet de blend uniquement à l'intérieur de WIN1. */
  win1BlendEnable: boolean;
  /** Si true, applique l'effet de blend à l'extérieur de toutes windows. */
  outsideBlendEnable: boolean;
  /** WINOBJ enable (= certains sprites ont objMode === 2 et définissent la zone). */
  winObjEnabled: boolean;
  /** Layers visibles dans la zone WINOBJ (WIN_OBJ + WININ_OBJ). */
  winObjInside: number;
  /** Si true, applique l'effet de blend dans la zone WINOBJ. */
  winObjBlendEnable: boolean;
}

export function defaultWindows(): Windows {
  return {
    win0: { enabled: false, x1: 0, x2: 0, y1: 0, y2: 0 },
    win1: { enabled: false, x1: 0, x2: 0, y1: 0, y2: 0 },
    win0Inside: 0x3F,    // tout visible
    win1Inside: 0x3F,
    outsideEnable: 0x3F,
    win0BlendEnable: true,
    win1BlendEnable: true,
    outsideBlendEnable: true,
    winObjEnabled: false,
    winObjInside: 0x3F,
    winObjBlendEnable: true,
  };
}

/** True si aucune window n'est enabled (= bypass tout). */
export function windowsAreOff(w: Windows): boolean {
  return !w.win0.enabled && !w.win1.enabled && !w.winObjEnabled;
}

/** Blend control (REG_BLDCNT / BLDALPHA / BLDY). */
export interface BlendConfig {
  /** Mode 0 = off, 1 = alpha, 2 = brightness inc, 3 = brightness dec. */
  mode: 0 | 1 | 2 | 3;
  /** Bitmask des layers cible 1 (BG0=0x01, BG1=0x02, BG2=0x04, BG3=0x08, OBJ=0x10, BD=0x20). */
  target1: number;
  /** Bitmask des layers cible 2. */
  target2: number;
  /** Alpha 0-16 (target1 weight, BLDALPHA bits 0-4). */
  alpha1: number;
  /** Alpha 0-16 (target2 weight, BLDALPHA bits 8-12). */
  alpha2: number;
  /** BLDY 0-16 (brightness inc/dec weight). */
  brightness: number;
}

/** Layer mask bits — pour BlendConfig.target1/target2 + WININ/WINOUT enables. */
export const LAYER_BG0 = 0x01;
export const LAYER_BG1 = 0x02;
export const LAYER_BG2 = 0x04;
export const LAYER_BG3 = 0x08;
export const LAYER_OBJ = 0x10;
export const LAYER_BD  = 0x20;  // backdrop

/** Layer ID enum pour tracking du top layer par pixel.
 *  Mappé sur les bitmask LAYER_X via `(1 << id)`. */
export const enum LayerId {
  BG0 = 0,
  BG1 = 1,
  BG2 = 2,
  BG3 = 3,
  OBJ = 4,
  BD = 5,
}

export function defaultBlendConfig(): BlendConfig {
  return {
    mode: 0,
    target1: 0,
    target2: 0,
    alpha1: 0,
    alpha2: 0,
    brightness: 0,
  };
}

/** HBLANK callback — appelé pour chaque scanline 0-159 avant rendu de cette scanline. */
export type HBlankCallback = (scanline: number) => void;

/** VBLANK callback — appelé après rendu de la frame complète, avant la suivante. */
export type VBlankCallback = () => void;

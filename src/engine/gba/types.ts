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
  /** Layer visible. */
  visible: boolean;
  /** Priority 0-3 (0 = devant). En cas d'égalité : BG0 > BG1 > BG2 > BG3. */
  priority: number;
  /** Char base (où sont stockées les tile data en VRAM). 0-3 (×16KB). */
  charBaseIndex: number;
  /** Map base (où est stocké le tilemap en VRAM). 0-31 (×2KB). */
  mapBaseIndex: number;
  /** Screen size 0-3 :
   *    0 = 32×32 tiles  (256×256 px, 1 screen-block)
   *    1 = 64×32 tiles  (512×256 px, 2 horizontal)
   *    2 = 32×64 tiles  (256×512 px, 2 vertical)
   *    3 = 64×64 tiles  (512×512 px, 4 quadrants)
   */
  screenSize: 0 | 1 | 2 | 3;
  /** 0 = 4bpp (16 colors per palette bank), 1 = 8bpp (256 colors). */
  paletteMode: 0 | 1;
  /** Mosaic effect (rarement utilisé, skip MVP). */
  mosaic: boolean;
  /** Wraparound (BG2/BG3 affine only). */
  wraparound: boolean;
  /** Scroll horizontal (REG_BGnHOFS). */
  hofs: number;
  /** Scroll vertical (REG_BGnVOFS). */
  vofs: number;
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

/** Affine matrix BG2/BG3 ou OAM (8.8 fixed point).
 *  Transform pixel : [pa pb] [x]   [dx]
 *                    [pc pd] [y] + [dy] */
export interface AffineMatrix {
  pa: number;  // 8.8 fixed
  pb: number;
  pc: number;
  pd: number;
}

/** Window config (WIN0/WIN1) — rect inclusion. */
export interface WindowRect {
  enabled: boolean;
  x1: number;  // left (inclusive)
  x2: number;  // right (exclusive)
  y1: number;  // top (inclusive)
  y2: number;  // bottom (exclusive)
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

/** HBLANK callback — appelé pour chaque scanline 0-159 avant rendu de cette scanline. */
export type HBlankCallback = (scanline: number) => void;

/** VBLANK callback — appelé après rendu de la frame complète, avant la suivante. */
export type VBlankCallback = () => void;

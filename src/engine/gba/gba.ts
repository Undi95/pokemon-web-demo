/**
 * Public API de l'engine GBA-compat.
 *
 * Usage typique :
 *   const gba = new Gba();
 *   gba.palette.loadBgRange(0, [...]);          // palette init
 *   gba.bg(1).vram.set(charData);               // tileset
 *   gba.bg(1).tilemap.set(mapData);             // tilemap
 *   gba.bg(1).config.visible = true;
 *   gba.bg(1).config.priority = 0;
 *   gba.bg(1).config.charBaseIndex = 0;
 *   gba.bg(1).config.mapBaseIndex = 31;
 *   gba.bg(1).config.screenSize = 0;
 *   gba.bg(1).config.paletteMode = 0; // 4bpp
 *
 *   // En boucle (à brancher sur Phaser update à 60fps) :
 *   gba.tick();                                  // run V-blank callbacks + compose frame
 *   const buffer = gba.getFrameBuffer();         // Uint8ClampedArray RGBA 240×160×4
 *
 * Pour l'intégration Phaser : voir GbaPhaserBridge dans phaser-bridge.ts.
 */
import {
  type AffineMatrix, type BgConfig, type BlendConfig, type HBlankCallback, type MosaicConfig,
  type OamEntry, type VBlankCallback, type Windows,
  defaultBgConfig, defaultBlendConfig, defaultMosaicConfig, defaultOamEntry, defaultWindows,
  identityAffineMatrix, SCREEN_W, SCREEN_H,
} from './types';
import { PaletteBanks } from './palette';
import { composeFrame } from './compositor';

export interface GbaBg {
  config: BgConfig;
  /** Char data (tile pixels). 4bpp = 32B/tile, 8bpp = 64B/tile. Max 32 KB / char base. */
  vram: Uint8Array;
  /** Tilemap entries u16. Taille selon screenSize : 32×32=1024, 64×32/32×64=2048, 64×64=4096. */
  tilemap: Uint16Array;
}

export class Gba {
  readonly palette = new PaletteBanks();
  /** 4 BG layers (BG0-3). 1:1 GBA. */
  private readonly bgs: GbaBg[] = [
    { config: defaultBgConfig(), vram: new Uint8Array(32768), tilemap: new Uint16Array(4096) },
    { config: defaultBgConfig(), vram: new Uint8Array(32768), tilemap: new Uint16Array(4096) },
    { config: defaultBgConfig(), vram: new Uint8Array(32768), tilemap: new Uint16Array(4096) },
    { config: defaultBgConfig(), vram: new Uint8Array(32768), tilemap: new Uint16Array(4096) },
  ];
  /** OAM : 128 sprites, par défaut tous invisibles. */
  readonly oam: OamEntry[] = Array.from({ length: 128 }, () => defaultOamEntry());
  /** OBJ char data (sprite tile pixels). 32 KB max sur GBA réel. */
  readonly objVram = new Uint8Array(32768);
  /** Blend (BLDCNT/BLDALPHA/BLDY) : mode 0 par défaut = off. */
  readonly blend: BlendConfig = defaultBlendConfig();
  /** Windows (WIN0/WIN1 + WININ/WINOUT) : disabled par défaut = bypass complet. */
  readonly windows: Windows = defaultWindows();
  /** 32 affine matrix slots pour OAM rotscale (mode 1/3) et BG2/BG3 affine.
   *  Toutes initialisées à identité (pa=256, pb=0, pc=0, pd=256 = 1.0 scale, 0 rotation). */
  readonly affineParams: AffineMatrix[] = Array.from({ length: 32 }, () => identityAffineMatrix());
  /** 2 affine matrix slots dédiés aux BG2/BG3 affine (séparés des OAM). */
  readonly bgAffineMatrices: [AffineMatrix, AffineMatrix] = [identityAffineMatrix(), identityAffineMatrix()];
  /** Mosaic config global (REG_MOSAIC). */
  readonly mosaic: MosaicConfig = defaultMosaicConfig();
  /** Frame buffer 240×160 RGBA. */
  private frameBuffer = new Uint8ClampedArray(SCREEN_W * SCREEN_H * 4);
  private hblankCb: HBlankCallback | null = null;
  private vblankCbs: Set<VBlankCallback> = new Set();
  /** Compteur global de frames depuis la création. Utile pour les state machines décomp. */
  private frameCounter = 0;

  /** Accès à un BG layer (0-3). */
  bg(index: 0 | 1 | 2 | 3): GbaBg {
    return this.bgs[index];
  }

  /** Set HBLANK callback (un seul à la fois, replace le précédent).
   *  Appelé pour chaque scanline 0-159 AVANT son rendu. */
  setHBlankCallback(cb: HBlankCallback | null): void {
    this.hblankCb = cb;
  }

  /** Ajoute un VBLANK callback (multiples possibles, appelés dans l'ordre add). */
  addVBlankCallback(cb: VBlankCallback): void {
    this.vblankCbs.add(cb);
  }
  removeVBlankCallback(cb: VBlankCallback): void {
    this.vblankCbs.delete(cb);
  }

  /** Render une frame complète + run VBLANK callbacks.
   *  À appeler à 60fps. */
  tick(): void {
    // 1. Compose la frame (BG layers + OAM sprites + blend + windows + affine + mosaic)
    composeFrame(
      this.frameBuffer, this.bgs, this.palette,
      this.oam, this.objVram,
      this.blend, this.windows, this.affineParams,
      this.bgAffineMatrices, this.mosaic,
      this.hblankCb ?? undefined,
    );

    // 2. Run VBLANK callbacks
    for (const cb of this.vblankCbs) {
      try { cb(); } catch (e) { console.error('[gba] vblank cb error:', e); }
    }

    this.frameCounter++;
  }

  /** Frame buffer courant (RGBA 240×160). Lecture seule (ne pas mutate). */
  getFrameBuffer(): Uint8ClampedArray {
    return this.frameBuffer;
  }

  /** Compteur de frames depuis création (utile pour state machines basées sur frame count). */
  getFrameCount(): number {
    return this.frameCounter;
  }

  /** Reset complet (palette, BG, OAM, frame buffer, callbacks). */
  reset(): void {
    this.palette.reset();
    for (const bg of this.bgs) {
      Object.assign(bg.config, defaultBgConfig());
      bg.vram.fill(0);
      bg.tilemap.fill(0);
    }
    for (let i = 0; i < this.oam.length; i++) {
      Object.assign(this.oam[i], defaultOamEntry());
    }
    this.objVram.fill(0);
    Object.assign(this.blend, defaultBlendConfig());
    Object.assign(this.windows, defaultWindows());
    for (const m of this.affineParams) Object.assign(m, identityAffineMatrix());
    for (const m of this.bgAffineMatrices) Object.assign(m, identityAffineMatrix());
    Object.assign(this.mosaic, defaultMosaicConfig());
    this.frameBuffer.fill(0);
    this.hblankCb = null;
    this.vblankCbs.clear();
    this.frameCounter = 0;
  }
}

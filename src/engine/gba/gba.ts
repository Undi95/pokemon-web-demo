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
import { type BgConfig, type HBlankCallback, type VBlankCallback, SCREEN_W, SCREEN_H } from './types';
import { PaletteBanks } from './palette';
import { composeFrame } from './compositor';

export interface GbaBg {
  config: BgConfig;
  /** Char data (tile pixels). 4bpp = 32B/tile, 8bpp = 64B/tile. Max 32 KB / char base. */
  vram: Uint8Array;
  /** Tilemap entries u16. Taille selon screenSize : 32×32=1024, 64×32/32×64=2048, 64×64=4096. */
  tilemap: Uint16Array;
}

function defaultBgConfig(): BgConfig {
  return {
    visible: false,
    priority: 0,
    charBaseIndex: 0,
    mapBaseIndex: 0,
    screenSize: 0,
    paletteMode: 0,
    mosaic: false,
    wraparound: false,
    hofs: 0,
    vofs: 0,
  };
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
    // 1. Compose la frame
    composeFrame(this.frameBuffer, this.bgs, this.palette, this.hblankCb ?? undefined);

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

  /** Reset complet (palette, BG, frame buffer, callbacks). */
  reset(): void {
    this.palette.reset();
    for (const bg of this.bgs) {
      Object.assign(bg.config, defaultBgConfig());
      bg.vram.fill(0);
      bg.tilemap.fill(0);
    }
    this.frameBuffer.fill(0);
    this.hblankCb = null;
    this.vblankCbs.clear();
    this.frameCounter = 0;
  }
}

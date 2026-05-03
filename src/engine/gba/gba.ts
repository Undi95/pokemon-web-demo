/**
 * Public API de l'engine GBA-compat.
 *
 * Usage typique :
 *   const gba = new Gba();
 *   gba.palette.loadBgRange(0, [...]);          // palette init
 *   gba.bg(1).vram.set(charData);               // tileset (= write dans vram unifié)
 *   gba.bg(1).tilemap.set(mapData);             // tilemap (= write dans vram unifié)
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
 *
 * VRAM 1:1 GBA hardware (refactor session 68 Phase 1 Action 2) :
 *   - VRAM unifié 96KB (0x06000000-0x06017FFF, mémoire-mappée GBA)
 *   - BG charBase 0-3 = bytes 0/0x4000/0x8000/0xC000 (16KB par charBase)
 *   - BG screenBase 0-31 = bytes 0/0x800/.../0xF800 (2KB par screenBase)
 *   - bg(n).vram retourne une VIEW Uint8Array du charBase de ce BG
 *   - bg(n).tilemap retourne une VIEW Uint16Array du mapBase de ce BG
 *   - Les writes via .set() vont dans le buffer unifié → BG avec mêmes
 *     charBase/mapBase voient les mêmes data automatiquement (1:1 hardware
 *     shared VRAM). Plus de hack "copier dans 4 vram séparés".
 */
import {
  type AffineMatrix, type BgConfig, type BlendConfig, type HBlankCallback, type MosaicConfig,
  type OamEntry, type VBlankCallback, type Windows,
  defaultBgConfig, defaultBlendConfig, defaultMosaicConfig, defaultOamEntry, defaultWindows,
  identityAffineMatrix, SCREEN_W, SCREEN_H,
} from './types';
import { PaletteBanks } from './palette';
import { composeFrame } from './compositor';

/** Taille tilemap en entries u16 selon screenSize (1:1 GBA hardware) — TEXT BG mode. */
const TILEMAP_SIZES_BY_SCREEN_SIZE: Readonly<Record<0 | 1 | 2 | 3, number>> = {
  0: 1024,  // 32×32 tiles = 1 screen base = 0x800 bytes
  1: 2048,  // 64×32 tiles = 2 screen bases (TL, TR)
  2: 2048,  // 32×64 tiles = 2 screen bases (TL, BL)
  3: 4096,  // 64×64 tiles = 4 screen bases (TL, TR, BL, BR)
};
/** Taille tilemap en entries u8 (mais view u16 chez nous) pour AFFINE BG.
 *  GBATEK : affine BG = 1 byte par tile. ScreenSize 0/1/2/3 = 16²/32²/64²/128². */
const AFFINE_TILEMAP_ENTRIES: Readonly<Record<0 | 1 | 2 | 3, number>> = {
  0: 256,    // 16×16 = 256 entries
  1: 1024,   // 32×32 = 1024 entries
  2: 4096,   // 64×64 = 4096 entries
  3: 16384,  // 128×128 = 16384 entries
};

export interface GbaBg {
  config: BgConfig;
  /** Char data view dans VRAM unifié au offset `charBaseIndex × 0x4000`. 16KB.
   *  4bpp = 32B/tile = 512 tiles max. 8bpp = 64B/tile = 256 tiles max. */
  readonly vram: Uint8Array;
  /** Tilemap view u16 dans VRAM unifié au offset `mapBaseIndex × 0x800`.
   *  Taille selon screenSize (1024/2048/4096 entries). */
  readonly tilemap: Uint16Array;
}

export class Gba {
  readonly palette = new PaletteBanks();
  /** VRAM unifié 96KB (1:1 GBA hardware 0x06000000-0x06017FFF). Toutes les
   *  reads/writes BG passent par cette mémoire — bg(n).vram et bg(n).tilemap
   *  sont des views Uint8Array/Uint16Array sur ce buffer. */
  readonly vram = new Uint8Array(0x18000);
  /** BgConfig par BG (0-3). 1:1 GBA. */
  private readonly bgConfigs: BgConfig[] = [
    defaultBgConfig(), defaultBgConfig(), defaultBgConfig(), defaultBgConfig(),
  ];
  /** OAM : 128 sprites, par défaut tous invisibles. */
  readonly oam: OamEntry[] = Array.from({ length: 128 }, () => defaultOamEntry());
  /** OBJ char data (sprite tile pixels). 32 KB en modes 0-2 (= text/affine, ce que
   *  Pokemon Emerald utilise). En modes 3-5 (= bitmap, unused Emerald), seul 16 KB
   *  serait dispo (le BG bitmap mange la première moitié). 1:1 GBATEK OBJ_VRAM0_SIZE. */
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

  /** Cache des objets GbaBg pour ne pas recréer un nouveau wrapper à chaque
   *  bg(n) call (= eviter alloc). Les getters internes vram/tilemap recréent
   *  leurs views à chaque accès (pour reflect le charBase/mapBase actuel). */
  private readonly bgWrappers: GbaBg[] = (() => {
    const arr: GbaBg[] = [];
    return arr;
  })();

  constructor() {
    // Init bgWrappers : les getters lisent bgConfigs[i] et vram dynamiquement.
    for (let i = 0; i < 4; i++) {
      const cfg = this.bgConfigs[i];
      const vramBuf = this.vram;
      this.bgWrappers.push({
        config: cfg,
        get vram(): Uint8Array {
          // View jusqu'à 32KB dans VRAM unifié au charBaseIndex actuel.
          // 1:1 GBA : charBase 0-3 = byte offset 0/0x4000/0x8000/0xC000. En 4bpp
          // un BG peut référencer tiles 0-1023 (= 32KB, soit 2 charBase blocks).
          // On expose 32KB max, capped par taille restante VRAM.
          const off = (cfg.charBaseIndex & 3) * 0x4000;
          const len = Math.min(0x8000, vramBuf.byteLength - off);
          return new Uint8Array(vramBuf.buffer, vramBuf.byteOffset + off, len);
        },
        get tilemap(): Uint16Array {
          // View u16 dans VRAM unifié au mapBaseIndex actuel.
          // 1:1 GBA : screenBase 0-31 = byte offset 0/0x800/.../0xF800.
          // Taille différente entre Text (entries u16) et Affine (entries u8 ;
          // notre view en u16 lit 2 entries u8 par u16 → on doit doubler le
          // nombre d'entries pour couvrir les bytes d'origine).
          const off = (cfg.mapBaseIndex & 31) * 0x800;
          // Affine : tilemap est u8 dans VRAM mais notre view u16 contient
          // chaque u8 source comme entry distincte (loadAffineTilemapBin a déjà
          // expandé u8 → u16). Donc numEntries = nombre de tiles directement.
          const numEntries = cfg.isAffine
            ? (AFFINE_TILEMAP_ENTRIES[cfg.screenSize] ?? 256)
            : (TILEMAP_SIZES_BY_SCREEN_SIZE[cfg.screenSize] ?? 1024);
          // Cap par taille VRAM restante (évite out-of-bounds si mapBase haut + screenSize 3)
          const remainingBytes = vramBuf.byteLength - off;
          const cappedEntries = Math.min(numEntries, Math.floor(remainingBytes / 2));
          return new Uint16Array(vramBuf.buffer, vramBuf.byteOffset + off, cappedEntries);
        },
      });
    }
  }

  /** Accès à un BG layer (0-3). Retourne le wrapper qui expose `config`,
   *  `vram` (view Uint8Array), `tilemap` (view Uint16Array). */
  bg(index: 0 | 1 | 2 | 3): GbaBg {
    return this.bgWrappers[index];
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
      this.frameBuffer, this.bgWrappers, this.palette,
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
    this.vram.fill(0);
    for (const cfg of this.bgConfigs) {
      Object.assign(cfg, defaultBgConfig());
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

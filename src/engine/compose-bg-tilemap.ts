/**
 * Util générique : compose un BG GBA depuis tiles.png + map.bin runtime.
 *
 * Pattern partagé entre BirchSpeechScene, IntroScene, etc. Évite duplication
 * de la logique présente dans `battle-terrain.ts`.
 *
 * - tiles.png = atlas N×M tiles 8×8
 * - map.bin = u16 entries (low 10 bits = tile_id, bit 10 = flipH, bit 11 = flipV,
 *             bits 12-15 = palette ignorée MVP)
 * - dimensions du tilemap supposées = `mapW × mapH` (caller fournit ou auto-détecte)
 *
 * Cf. décomp `LZ77UnCompVram` pour load tiles + map en VRAM, puis BG hardware
 * affiche le tout. Notre équivalent : Phaser RenderTexture composé une fois.
 */
import Phaser from 'phaser';

const cachedKeys = new Set<string>();

export interface ComposeBgOptions {
  /** Cache key sortie (réutilisé si déjà composé) */
  cacheKey: string;
  /** URL du PNG tileset (8×8 tiles atlas) */
  tilesUrl: string;
  /** URL du map.bin (u16 little-endian per tile) */
  mapBinUrl: string;
  /** Largeur tilemap en tiles (défaut 32 = standard GBA BG) */
  mapW?: number;
  /** Hauteur tilemap en tiles (défaut 20 = écran visible GBA) */
  mapH?: number;
  /** Si défini, rend SEULEMENT les tiles dont palette (bits 12-15) matche.
   *  Permet de séparer les layers (ex. sky+grass [pal 0] vs platform [pal 1]
   *  pour BirchSpeech intro où le platform fade-in séparément). */
  paletteFilter?: number;
}

export async function composeBgTilemap(
  scene: Phaser.Scene,
  opts: ComposeBgOptions,
): Promise<string | null> {
  const { cacheKey, tilesUrl, mapBinUrl } = opts;
  const mapW = opts.mapW ?? 32;
  const mapH = opts.mapH ?? 20;

  if (cachedKeys.has(cacheKey) && scene.textures.exists(cacheKey)) return cacheKey;

  // 1. Fetch map.bin
  let mapBuf: ArrayBuffer;
  try {
    const r = await fetch(mapBinUrl);
    if (!r.ok) { console.warn(`[compose-bg] map.bin fail ${mapBinUrl}`); return null; }
    mapBuf = await r.arrayBuffer();
  } catch (e) {
    console.warn(`[compose-bg] fetch fail ${mapBinUrl}:`, e); return null;
  }

  // 2. Load tileset comme spritesheet 8×8
  const tilesKey = `bg-tiles-${cacheKey}`;
  if (!scene.textures.exists(tilesKey)) {
    await new Promise<void>(resolve => {
      scene.load.spritesheet(tilesKey, tilesUrl, { frameWidth: 8, frameHeight: 8 });
      scene.load.once('complete', () => resolve());
      scene.load.once('loaderror', () => { console.warn(`[compose-bg] tiles fail ${tilesUrl}`); resolve(); });
      scene.load.start();
    });
  }
  if (!scene.textures.exists(tilesKey)) return null;

  // 3. Parse + compose
  const map = new Uint16Array(mapBuf);
  const tilesTex = scene.textures.get(tilesKey);
  const maxFrame = Math.max(0, tilesTex.frameTotal - 2); // -1 __BASE, -1 sécurité
  const rt = scene.add.renderTexture(0, 0, mapW * 8, mapH * 8).setVisible(false);
  const tmp = scene.add.image(0, 0, tilesKey, 0).setOrigin(0, 0).setVisible(false);

  const paletteFilter = opts.paletteFilter;
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      const idx = y * mapW + x;
      if (idx >= map.length) continue;
      const entry = map[idx];
      const tileId = entry & 0x3FF;
      if (tileId > maxFrame) continue;
      // Filter par palette si demandé (1:1 GBA palette banks)
      if (paletteFilter !== undefined) {
        const tilePalette = (entry >> 12) & 0xF;
        if (tilePalette !== paletteFilter) continue;
      }
      tmp.setFrame(tileId);
      tmp.flipX = !!((entry >> 10) & 1);
      tmp.flipY = !!((entry >> 11) & 1);
      rt.draw(tmp, x * 8, y * 8);
    }
  }
  tmp.destroy();
  rt.saveTexture(cacheKey);
  rt.destroy();
  cachedKeys.add(cacheKey);
  return cacheKey;
}

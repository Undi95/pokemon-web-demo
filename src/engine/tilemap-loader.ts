import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';

export interface TilesetPairInfo {
  primaryTileset: string;
  secondaryTileset: string | null;
  atlasCols: number;
  atlasRows: number;
  atlasWidth: number;
  atlasHeight: number;
  totalMetatiles: number;
  numPrimaryMetatiles: number;
  numSecondaryMetatiles: number;
  primaryMetatileIdStart: number;
  secondaryMetatileIdStart: number;
}

export interface LoadedTilemap {
  lowerLayer: Phaser.Tilemaps.TilemapLayer;
  upperLayer: Phaser.Tilemaps.TilemapLayer;
  collisions: number[][];
  widthTiles: number;
  heightTiles: number;
  widthPx: number;
  heightPx: number;
}

/**
 * Convert a game metatile ID (0..1023) to the atlas position used by our
 * pre-rendered metatile atlases. Primary metatiles occupy ids 0..numPrimary-1
 * and sit at atlas positions 0..numPrimary-1. Secondary metatiles live in the
 * game's 512..511+numSecondary id space, and sit in the atlas right after the
 * primary block.
 */
function metatileIdToAtlasPos(gameId: number, info: TilesetPairInfo): number {
  if (gameId < 512) return gameId < info.numPrimaryMetatiles ? gameId : -1;
  const offset = gameId - 512;
  if (offset >= info.numSecondaryMetatiles) return -1;
  return info.numPrimaryMetatiles + offset;
}

/**
 * Build the two Phaser tilemap layers (lower + upper) for the given layout.
 *
 * Preconditions — these assets must have been preloaded in the scene:
 *   - 'metatiles-lower' : atlas image
 *   - 'metatiles-upper' : atlas image
 *   - 'pair-info'       : TilesetPairInfo JSON
 *   - 'map-bin'         : raw map.bin as an ArrayBuffer (use this.load.binary)
 */
export function buildTilemap(
  scene: Phaser.Scene,
  widthTiles: number,
  heightTiles: number
): LoadedTilemap {
  const info = scene.cache.json.get('pair-info') as TilesetPairInfo;
  const mapBinRaw = scene.cache.binary.get('map-bin') as ArrayBuffer;
  const mapBinView = new DataView(mapBinRaw);

  // Build data grid (atlas positions) + collisions
  const dataGrid: number[][] = [];
  const collisions: number[][] = [];
  for (let y = 0; y < heightTiles; y++) {
    const dataRow: number[] = [];
    const collRow: number[] = [];
    for (let x = 0; x < widthTiles; x++) {
      const byteIdx = (y * widthTiles + x) * 2;
      if (byteIdx + 1 >= mapBinRaw.byteLength) {
        dataRow.push(-1);
        collRow.push(1);
        continue;
      }
      const entry = mapBinView.getUint16(byteIdx, true); // little-endian
      const metatileId = entry & 0x03FF;
      const collision = (entry >> 10) & 0x03;
      dataRow.push(metatileIdToAtlasPos(metatileId, info));
      collRow.push(collision > 0 ? 1 : 0);
    }
    dataGrid.push(dataRow);
    collisions.push(collRow);
  }

  // Phaser tilemap from data
  const map = scene.make.tilemap({
    data: dataGrid,
    tileWidth: 16,
    tileHeight: 16,
    width: widthTiles,
    height: heightTiles
  });
  const lowerTS = map.addTilesetImage('metatiles-lower', 'metatiles-lower', 16, 16, 0, 0)!;
  const lowerLayer = map.createLayer(0, lowerTS, 0, 0)!;
  lowerLayer.setDepth(0);

  // Second tilemap (same data) for the upper layer
  const upperMap = scene.make.tilemap({
    data: dataGrid,
    tileWidth: 16,
    tileHeight: 16,
    width: widthTiles,
    height: heightTiles
  });
  const upperTS = upperMap.addTilesetImage('metatiles-upper', 'metatiles-upper', 16, 16, 0, 0)!;
  const upperLayer = upperMap.createLayer(0, upperTS, 0, 0)!;
  upperLayer.setDepth(20);

  return {
    lowerLayer,
    upperLayer,
    collisions,
    widthTiles,
    heightTiles,
    widthPx: widthTiles * 16,
    heightPx: heightTiles * 16
  };
}

/**
 * Construit un motif 32×32 depuis border.bin (8 octets = 2×2 metatiles),
 * et le fait répéter autour de la map via une TileSprite Phaser pour remplir
 * les zones hors-map (comportement fidèle au jeu original).
 */
export function buildBorderTileSprite(
  scene: Phaser.Scene,
  widthPx: number,
  heightPx: number
): Phaser.GameObjects.TileSprite {
  const info = scene.cache.json.get('pair-info') as TilesetPairInfo;
  const borderRaw = scene.cache.binary.get('border-bin') as ArrayBuffer;
  const view = new DataView(borderRaw);

  // Compose un canvas 32×32 en recopiant les 4 metatiles depuis l'atlas lower.
  const lowerAtlas = scene.textures.get('metatiles-lower').getSourceImage() as HTMLImageElement;
  const upperAtlas = scene.textures.get('metatiles-upper').getSourceImage() as HTMLImageElement;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < 4; i++) {
    if (i * 2 + 1 >= borderRaw.byteLength) break;
    const entry = view.getUint16(i * 2, true);
    const metatileId = entry & 0x03FF;
    const atlasPos = metatileIdToAtlasPos(metatileId, info);
    if (atlasPos < 0) continue;
    const sx = (atlasPos % info.atlasCols) * 16;
    const sy = Math.floor(atlasPos / info.atlasCols) * 16;
    const dx = (i % 2) * 16;
    const dy = Math.floor(i / 2) * 16;
    ctx.drawImage(lowerAtlas, sx, sy, 16, 16, dx, dy, 16, 16);
    ctx.drawImage(upperAtlas, sx, sy, 16, 16, dx, dy, 16, 16);
  }

  const key = 'border-tile';
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas);

  // TileSprite largement plus grande que la map, centrée sur elle : couvre les
  // débordements de caméra. On la place à depth -1 pour qu'elle soit sous les
  // couches de tilemap.
  const extraW = GAME_W * 2;
  const extraH = GAME_H * 2;
  const ts = scene.add.tileSprite(
    -extraW,
    -extraH,
    widthPx + extraW * 2,
    heightPx + extraH * 2,
    key
  );
  ts.setOrigin(0, 0);
  ts.setDepth(-1);
  return ts;
}

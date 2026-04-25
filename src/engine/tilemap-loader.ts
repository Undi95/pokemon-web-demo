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
  /** Behavior metatile par tile (cf. include/constants/metatile_behaviors.h).
   *  0 = MB_NORMAL. Permet de différencier portes/escaliers/herbe/eau. */
  behaviors: number[][];
  widthTiles: number;
  heightTiles: number;
  widthPx: number;
  heightPx: number;
}

/** Metatile behavior IDs utilisés pour la logique de warp/spawn (cf. décomp). */
export const MB_NORMAL = 0x00;
export const MB_NON_ANIMATED_DOOR = 0x60;
export const MB_LADDER = 0x61;
export const MB_EAST_ARROW_WARP = 0x62;
export const MB_WEST_ARROW_WARP = 0x63;
export const MB_NORTH_ARROW_WARP = 0x64;
export const MB_SOUTH_ARROW_WARP = 0x65;
export const MB_AQUA_HIDEOUT_WARP = 0x67;
export const MB_LAVARIDGE_GYM_1F_WARP = 0x68;
export const MB_ANIMATED_DOOR = 0x69;
export const MB_UP_ESCALATOR = 0x6A;
export const MB_DOWN_ESCALATOR = 0x6B;
export const MB_WATER_DOOR = 0x6C;

/** True si le metatile est une porte qui doit déclencher un step-down auto au spawn. */
export function isDoorWarp(behavior: number): boolean {
  return behavior === MB_NON_ANIMATED_DOOR
      || behavior === MB_ANIMATED_DOOR
      || behavior === MB_WATER_DOOR;
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

  // Behaviors par metatile id global (0..1023). Lus depuis les .bin attributes
  // des deux tilesets de la pair courante (preloaded as 'attrs-primary'/'attrs-secondary').
  const behaviorByMetatileId = new Uint8Array(1024);
  const readAttrs = (key: string, idStart: number, count: number) => {
    const buf = scene.cache.binary.get(key) as ArrayBuffer | undefined;
    if (!buf) return;
    const v = new DataView(buf);
    for (let i = 0; i < count && i * 2 + 1 < buf.byteLength; i++) {
      // bits 0-7 = behavior (Gen 3 metatile attribute layout)
      behaviorByMetatileId[idStart + i] = v.getUint16(i * 2, true) & 0xFF;
    }
  };
  readAttrs('attrs-primary', info.primaryMetatileIdStart, info.numPrimaryMetatiles);
  readAttrs('attrs-secondary', info.secondaryMetatileIdStart, info.numSecondaryMetatiles);

  // Build data grid (atlas positions) + collisions + behaviors
  const dataGrid: number[][] = [];
  const collisions: number[][] = [];
  const behaviors: number[][] = [];
  for (let y = 0; y < heightTiles; y++) {
    const dataRow: number[] = [];
    const collRow: number[] = [];
    const behRow: number[] = [];
    for (let x = 0; x < widthTiles; x++) {
      const byteIdx = (y * widthTiles + x) * 2;
      if (byteIdx + 1 >= mapBinRaw.byteLength) {
        dataRow.push(-1);
        collRow.push(1);
        behRow.push(0);
        continue;
      }
      const entry = mapBinView.getUint16(byteIdx, true); // little-endian
      const metatileId = entry & 0x03FF;
      const collision = (entry >> 10) & 0x03;
      dataRow.push(metatileIdToAtlasPos(metatileId, info));
      collRow.push(collision > 0 ? 1 : 0);
      behRow.push(behaviorByMetatileId[metatileId] ?? 0);
    }
    dataGrid.push(dataRow);
    collisions.push(collRow);
    behaviors.push(behRow);
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
  // Depth élevé : sprites utilisent depth = sprite.y (peut dépasser 1000),
  // donc l'upper layer doit être au-dessus pour préserver l'occlusion
  // toits/cimes d'arbres.
  upperLayer.setDepth(100000);

  return {
    lowerLayer,
    upperLayer,
    collisions,
    behaviors,
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

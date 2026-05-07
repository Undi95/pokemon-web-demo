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
  /** Layer 3 : upper tiles des metatiles NORMAL/SPLIT — couvre le joueur (tree tops).
   *  Cf. METATILE_LAYER_TYPE_* (include/global.fieldmap.h:49). */
  upperCoverLayer: Phaser.Tilemaps.TilemapLayer;
  collisions: number[][];
  /** Behavior metatile par tile (cf. include/constants/metatile_behaviors.h).
   *  0 = MB_NORMAL. Permet de différencier portes/escaliers/herbe/eau. */
  behaviors: number[][];
  widthTiles: number;
  heightTiles: number;
  widthPx: number;
  heightPx: number;
}

/** Metatile behavior IDs 1:1 décomp `include/constants/metatile_behaviors.h`.
 *  Re-export depuis le ENUM_MB_0 auto-extrait pour garantir l'alignement avec
 *  le décomp source (= source unique de vérité).
 *
 *  Note historique : avant cet alignement, ces constantes étaient hardcoded
 *  avec valeurs hex (= MB_BATTLE_PYRAMID_WARP=0x12, etc.) qui dévivaient des
 *  vraies valeurs de l'enum (= MB_BATTLE_PYRAMID_WARP=13). Bug latent : tile
 *  collision incorrect pour ces metatiles. Fix audit Opus session 102. */
import { ENUM_MB_0 } from './decomp-data/auto/include/constants/metatile_behaviors-data';
export const MB_NORMAL                     = ENUM_MB_0.MB_NORMAL;
export const MB_TALL_GRASS                 = ENUM_MB_0.MB_TALL_GRASS;
export const MB_LONG_GRASS                 = ENUM_MB_0.MB_LONG_GRASS;
export const MB_BATTLE_PYRAMID_WARP        = ENUM_MB_0.MB_BATTLE_PYRAMID_WARP;
export const MB_MOSSDEEP_GYM_WARP          = ENUM_MB_0.MB_MOSSDEEP_GYM_WARP;
export const MB_MT_PYRE_HOLE               = ENUM_MB_0.MB_MT_PYRE_HOLE;
export const MB_LAVARIDGE_GYM_B1F_WARP     = ENUM_MB_0.MB_LAVARIDGE_GYM_B1F_WARP;
// Impassable directionnels — 1:1 décomp `IsEastBlocked/IsWestBlocked/etc.`
// (metatile_behavior.c:933-977). Bloquent quand player essaie de quitter ce
// tile dans la dir donnée (= utilisé par IsMetatileDirectionallyImpassable
// via gOppositeDirectionBlockedMetatileFuncs).
export const MB_IMPASSABLE_EAST            = ENUM_MB_0.MB_IMPASSABLE_EAST;
export const MB_IMPASSABLE_WEST            = ENUM_MB_0.MB_IMPASSABLE_WEST;
export const MB_IMPASSABLE_NORTH           = ENUM_MB_0.MB_IMPASSABLE_NORTH;
export const MB_IMPASSABLE_SOUTH           = ENUM_MB_0.MB_IMPASSABLE_SOUTH;
export const MB_IMPASSABLE_NORTHEAST       = ENUM_MB_0.MB_IMPASSABLE_NORTHEAST;
export const MB_IMPASSABLE_NORTHWEST       = ENUM_MB_0.MB_IMPASSABLE_NORTHWEST;
export const MB_IMPASSABLE_SOUTHEAST       = ENUM_MB_0.MB_IMPASSABLE_SOUTHEAST;
export const MB_IMPASSABLE_SOUTHWEST       = ENUM_MB_0.MB_IMPASSABLE_SOUTHWEST;
// Ledges (= jump 1-way drop) — 1:1 décomp `IsJumpEast/IsJumpWest/etc.`
// (metatile_behavior.c:143-173). Player saute si walks dans cette direction
// depuis ces tiles.
export const MB_JUMP_EAST                  = ENUM_MB_0.MB_JUMP_EAST;
export const MB_JUMP_WEST                  = ENUM_MB_0.MB_JUMP_WEST;
export const MB_JUMP_NORTH                 = ENUM_MB_0.MB_JUMP_NORTH;
export const MB_JUMP_SOUTH                 = ENUM_MB_0.MB_JUMP_SOUTH;
export const MB_JUMP_NORTHEAST             = ENUM_MB_0.MB_JUMP_NORTHEAST;
export const MB_JUMP_NORTHWEST             = ENUM_MB_0.MB_JUMP_NORTHWEST;
export const MB_JUMP_SOUTHEAST             = ENUM_MB_0.MB_JUMP_SOUTHEAST;
export const MB_JUMP_SOUTHWEST             = ENUM_MB_0.MB_JUMP_SOUTHWEST;
export const MB_NON_ANIMATED_DOOR          = ENUM_MB_0.MB_NON_ANIMATED_DOOR;
export const MB_LADDER                     = ENUM_MB_0.MB_LADDER;
export const MB_EAST_ARROW_WARP            = ENUM_MB_0.MB_EAST_ARROW_WARP;
export const MB_WEST_ARROW_WARP            = ENUM_MB_0.MB_WEST_ARROW_WARP;
export const MB_NORTH_ARROW_WARP           = ENUM_MB_0.MB_NORTH_ARROW_WARP;
export const MB_SOUTH_ARROW_WARP           = ENUM_MB_0.MB_SOUTH_ARROW_WARP;
export const MB_CRACKED_FLOOR_HOLE         = ENUM_MB_0.MB_CRACKED_FLOOR_HOLE;
export const MB_AQUA_HIDEOUT_WARP          = ENUM_MB_0.MB_AQUA_HIDEOUT_WARP;
export const MB_LAVARIDGE_GYM_1F_WARP      = ENUM_MB_0.MB_LAVARIDGE_GYM_1F_WARP;
export const MB_ANIMATED_DOOR              = ENUM_MB_0.MB_ANIMATED_DOOR;
export const MB_UP_ESCALATOR               = ENUM_MB_0.MB_UP_ESCALATOR;
export const MB_DOWN_ESCALATOR             = ENUM_MB_0.MB_DOWN_ESCALATOR;
export const MB_WATER_DOOR                 = ENUM_MB_0.MB_WATER_DOOR;
export const MB_WATER_SOUTH_ARROW_WARP     = ENUM_MB_0.MB_WATER_SOUTH_ARROW_WARP;
export const MB_DEEP_SOUTH_WARP            = ENUM_MB_0.MB_DEEP_SOUTH_WARP;
export const MB_SECRET_BASE_BREAKABLE_DOOR = ENUM_MB_0.MB_SECRET_BASE_BREAKABLE_DOOR;
export const MB_IMPASSABLE_SOUTH_AND_NORTH = ENUM_MB_0.MB_IMPASSABLE_SOUTH_AND_NORTH;
export const MB_IMPASSABLE_WEST_AND_EAST   = ENUM_MB_0.MB_IMPASSABLE_WEST_AND_EAST;

import type { Facing } from './character-anims';

/** Porte (entrée/sortie maison). À l'arrivée, l'auto-step DOWN s'effectue.
 *  Cf. `MetatileBehavior_IsWarpDoor` du décomp. */
export function isDoorWarp(behavior: number): boolean {
  return behavior === MB_NON_ANIMATED_DOOR
      || behavior === MB_ANIMATED_DOOR
      || behavior === MB_WATER_DOOR;
}

/** Porte animée (anim ouverture frame par frame quand on warp).
 *  Cf. `MetatileBehavior_IsWarpDoor` du décomp. */
export function isAnimatedDoor(behavior: number): boolean {
  return behavior === MB_ANIMATED_DOOR;
}

/** Tile qui warp INSTANTANÉMENT au step (pas besoin de push direction supplémentaire) :
 *  ladders, escalators, AquaHideout, Lavaridge gym, et les portes non-animées.
 *  Cf. `IsWarpMetatileBehavior` + branches d'instant warp dans field_control_avatar.c. */
export function isInstantStepWarp(behavior: number): boolean {
  return behavior === MB_LADDER
      || behavior === MB_NON_ANIMATED_DOOR
      || behavior === MB_WATER_DOOR
      || behavior === MB_DEEP_SOUTH_WARP
      || behavior === MB_UP_ESCALATOR
      || behavior === MB_DOWN_ESCALATOR
      || behavior === MB_AQUA_HIDEOUT_WARP
      || behavior === MB_LAVARIDGE_GYM_1F_WARP
      || behavior === MB_LAVARIDGE_GYM_B1F_WARP
      || behavior === MB_MOSSDEEP_GYM_WARP
      || behavior === MB_BATTLE_PYRAMID_WARP;
}

/** Arrow warp : tile qui ne warp QUE si le joueur push la direction de l'arrow
 *  alors qu'il est sur la tile (heldDirection == arrow direction). C'est le
 *  comportement des "tapis de sortie" des maisons (MB_SOUTH_ARROW_WARP). */
export function isArrowWarp(behavior: number): boolean {
  return behavior === MB_EAST_ARROW_WARP
      || behavior === MB_WEST_ARROW_WARP
      || behavior === MB_NORTH_ARROW_WARP
      || behavior === MB_SOUTH_ARROW_WARP
      || behavior === MB_WATER_SOUTH_ARROW_WARP;
}

/** Direction qu'il faut tenir/push pour qu'un arrow warp se déclenche. */
export function getArrowWarpDirection(behavior: number): Facing | null {
  switch (behavior) {
    case MB_EAST_ARROW_WARP: return 'right';
    case MB_WEST_ARROW_WARP: return 'left';
    case MB_NORTH_ARROW_WARP: return 'up';
    case MB_SOUTH_ARROW_WARP:
    case MB_WATER_SOUTH_ARROW_WARP: return 'down';
    default: return null;
  }
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
/** Keys de cache pour buildTilemap. Toutes optionnelles avec defaults pour
 *  backward-compat. Pour rendre plusieurs maps simultanément (seamless world),
 *  passer des keys uniques par map (ex. `pair-info-${mapName}`). */
export interface TilemapKeys {
  pairInfo?: string;
  mapBin?: string;
  attrsPrimary?: string;
  attrsSecondary?: string;
  metatilesLower?: string;
  metatilesUpper?: string;
  /** Offset en pixels des layers (utilisé pour positionner adjacent maps en world). */
  offsetX?: number;
  offsetY?: number;
}

export function buildTilemap(
  scene: Phaser.Scene,
  widthTiles: number,
  heightTiles: number,
  keys: TilemapKeys = {}
): LoadedTilemap {
  const k = {
    pairInfo: keys.pairInfo ?? 'pair-info',
    mapBin: keys.mapBin ?? 'map-bin',
    attrsPrimary: keys.attrsPrimary ?? 'attrs-primary',
    attrsSecondary: keys.attrsSecondary ?? 'attrs-secondary',
    metatilesLower: keys.metatilesLower ?? 'metatiles-lower',
    metatilesUpper: keys.metatilesUpper ?? 'metatiles-upper',
    offsetX: keys.offsetX ?? 0,
    offsetY: keys.offsetY ?? 0,
  };
  const info = scene.cache.json.get(k.pairInfo) as TilesetPairInfo;
  const mapBinRaw = scene.cache.binary.get(k.mapBin) as ArrayBuffer;
  const mapBinView = new DataView(mapBinRaw);

  // Behaviors + layerType par metatile id global (0..1023). Lus depuis les .bin
  // attributes des deux tilesets. Format: u16 par metatile, bits 0-11 = behavior,
  // bits 12-15 = layerType (0=NORMAL covers player, 1=COVERED no cover, 2=SPLIT covers).
  // Cf. include/global.fieldmap.h:36-53.
  const behaviorByMetatileId = new Uint8Array(1024);
  const layerTypeByMetatileId = new Uint8Array(1024);
  const readAttrs = (key: string, idStart: number, count: number) => {
    const buf = scene.cache.binary.get(key) as ArrayBuffer | undefined;
    if (!buf) return;
    const v = new DataView(buf);
    for (let i = 0; i < count && i * 2 + 1 < buf.byteLength; i++) {
      const attr = v.getUint16(i * 2, true);
      behaviorByMetatileId[idStart + i] = attr & 0xFF;
      layerTypeByMetatileId[idStart + i] = (attr >> 12) & 0x0F;
    }
  };
  readAttrs(k.attrsPrimary, info.primaryMetatileIdStart, info.numPrimaryMetatiles);
  readAttrs(k.attrsSecondary, info.secondaryMetatileIdStart, info.numSecondaryMetatiles);

  // Build data grids (atlas positions) + collisions + behaviors.
  // 3 grids : lower (always), upperLow (COVERED), upperHigh (NORMAL/SPLIT).
  // Per metatile, le upper sub-tiles vont SOIT dans upperLow (sous joueur)
  // SOIT dans upperHigh (couvre joueur) selon layerType.
  const dataGrid: number[][] = [];
  const upperLowGrid: number[][] = [];   // COVERED → sous joueur
  const upperHighGrid: number[][] = [];  // NORMAL/SPLIT → couvre joueur
  const collisions: number[][] = [];
  const behaviors: number[][] = [];
  for (let y = 0; y < heightTiles; y++) {
    const dataRow: number[] = [];
    const upLowRow: number[] = [];
    const upHighRow: number[] = [];
    const collRow: number[] = [];
    const behRow: number[] = [];
    for (let x = 0; x < widthTiles; x++) {
      const byteIdx = (y * widthTiles + x) * 2;
      if (byteIdx + 1 >= mapBinRaw.byteLength) {
        dataRow.push(-1);
        upLowRow.push(-1);
        upHighRow.push(-1);
        collRow.push(1);
        behRow.push(0);
        continue;
      }
      const entry = mapBinView.getUint16(byteIdx, true);
      const metatileId = entry & 0x03FF;
      const collision = (entry >> 10) & 0x03;
      const atlasPos = metatileIdToAtlasPos(metatileId, info);
      const layerType = layerTypeByMetatileId[metatileId] ?? 0;
      dataRow.push(atlasPos);
      // METATILE_LAYER_TYPE_COVERED (1) → upper sub-tiles BAS depth (sous joueur).
      // NORMAL (0) / SPLIT (2) → upper sub-tiles HAUT depth (couvre joueur).
      if (layerType === 1) {
        upLowRow.push(atlasPos);
        upHighRow.push(-1);
      } else {
        upLowRow.push(-1);
        upHighRow.push(atlasPos);
      }
      collRow.push(collision > 0 ? 1 : 0);
      behRow.push(behaviorByMetatileId[metatileId] ?? 0);
    }
    dataGrid.push(dataRow);
    upperLowGrid.push(upLowRow);
    upperHighGrid.push(upHighRow);
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
  // Tileset name doit être unique par addTilesetImage (sinon Phaser le rejette)
  const lowerTS = map.addTilesetImage(k.metatilesLower, k.metatilesLower, 16, 16, 0, 0)!;
  const lowerLayer = map.createLayer(0, lowerTS, k.offsetX, k.offsetY)!;
  lowerLayer.setDepth(0);

  // Upper-LOW : metatiles COVERED (player walks OVER them, ex. small flowers).
  const upperLowMap = scene.make.tilemap({
    data: upperLowGrid, tileWidth: 16, tileHeight: 16, width: widthTiles, height: heightTiles
  });
  const upperLowTS = upperLowMap.addTilesetImage(k.metatilesUpper + '-lo', k.metatilesUpper, 16, 16, 0, 0)!;
  const upperLayer = upperLowMap.createLayer(0, upperLowTS, k.offsetX, k.offsetY)!;
  upperLayer.setDepth(10); // sous joueur (~120)

  // Upper-HIGH : metatiles NORMAL/SPLIT (couvrent joueur, ex. tree tops).
  const upperHighMap = scene.make.tilemap({
    data: upperHighGrid, tileWidth: 16, tileHeight: 16, width: widthTiles, height: heightTiles
  });
  const upperHighTS = upperHighMap.addTilesetImage(k.metatilesUpper + '-hi', k.metatilesUpper, 16, 16, 0, 0)!;
  const upperCoverLayer = upperHighMap.createLayer(0, upperHighTS, k.offsetX, k.offsetY)!;
  upperCoverLayer.setDepth(100000); // couvre joueur (cf. behavior GBA)

  return {
    lowerLayer,
    upperLayer,
    upperCoverLayer,
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

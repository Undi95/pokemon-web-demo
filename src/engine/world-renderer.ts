/**
 * WorldRenderer — gère un "monde continu" multi-maps fidèle au décomp
 * (`gBackupMapLayout` dans src/fieldmap.c).
 *
 * Concept : la current map + ses 4 connections (N/S/E/W) sont chargées et
 * rendues simultanément avec leurs offsets relatifs. Le joueur a des
 * coordonnées WORLD (en tiles) qui peuvent dépasser les bornes de la current.
 * À la traversée d'une bordure, on "promote" silencieusement la map adjacente
 * en current (pas de scene.restart, pas de fade).
 *
 * Cf. SEAMLESS_RENDERING_REFERENCE.md pour le détail du décomp.
 */
import Phaser from 'phaser';
import type { MapJson, ResolvedNpc } from './npc-loader';
import { buildTilemap, type LoadedTilemap, type TilemapKeys } from './tilemap-loader';
import type { ParsedScripts } from './script-runner';

const BASE = '/decomp/em';
const TILE_SIZE = 16;

export interface LayoutDef {
  id: string; name: string;
  width: number; height: number;
  primary_tileset: string; secondary_tileset?: string;
  blockdata_filepath: string; border_filepath: string;
}

export interface MapInstance {
  mapName: string;          // ex. "LittlerootTown"
  mapId: string;            // ex. "MAP_LITTLEROOT_TOWN"
  mapJson: MapJson;
  layout: LayoutDef;
  parsedScripts: ParsedScripts;
  tilemap: LoadedTilemap;
  /** Offset en TILES dans le monde (par rapport à la current = (0,0)). */
  worldOffsetX: number;
  worldOffsetY: number;
  /** NPCs résolus mais pas encore spawnés (à reprendre lors du switch current). */
  resolvedNpcs: ResolvedNpc[];
  /** NPCs spawnés actuellement (avec leur sprite Phaser). */
  spawnedNpcs?: Array<ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }>;
}

function tilesetDir(gname: string): string {
  return gname.replace(/^gTileset_/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Préfixe les cache keys par le nom de map pour éviter les collisions multi-maps. */
function makeKeys(mapName: string, offsetX: number, offsetY: number): TilemapKeys {
  return {
    pairInfo: `pair-info-${mapName}`,
    mapBin: `map-bin-${mapName}`,
    attrsPrimary: `attrs-primary-${mapName}`,
    attrsSecondary: `attrs-secondary-${mapName}`,
    metatilesLower: `metatiles-lower-${mapName}`,
    metatilesUpper: `metatiles-upper-${mapName}`,
    offsetX, offsetY,
  };
}

export class WorldRenderer {
  scene: Phaser.Scene;
  loaded: Map<string, MapInstance> = new Map();
  currentMapName!: string;
  /** Index global des layouts (chargé une fois, partagé). */
  private layoutsIndex!: { layouts: LayoutDef[] };
  private layoutToPair!: Record<string, string>;
  private mapIds!: Record<string, string>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Initialise les indices globaux. À appeler 1 fois après preload. */
  initIndices() {
    this.layoutsIndex = this.scene.cache.json.get('layouts-index') as { layouts: LayoutDef[] };
    this.layoutToPair = this.scene.cache.json.get('layout-to-pair') as Record<string, string>;
    this.mapIds = this.scene.cache.json.get('map-ids') as Record<string, string>;
  }

  /** Récupère l'instance de la current map. */
  current(): MapInstance {
    return this.loaded.get(this.currentMapName)!;
  }

  /** Récupère une map loaded par son nom. */
  get(mapName: string): MapInstance | undefined {
    return this.loaded.get(mapName);
  }

  /** Convertit un mapId (MAP_X) vers son dossier (LittlerootTown). */
  mapIdToName(mapId: string): string | undefined {
    return this.mapIds[mapId];
  }

  /** Pre-load assets d'une map en background. Promise resolved quand cache prêt. */
  async preloadMapAssets(mapName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const layoutsIndex = this.layoutsIndex;
      const layoutToPair = this.layoutToPair;
      // Find la layout via map.json (besoin du JSON pour ça)
      const mapJsonKey = `map-json-${mapName}`;
      const scriptsKey = `scripts-${mapName}`;
      // Fetch JSON in 2 phases : map.json + scripts.json, puis on parse pour
      // savoir le layout, puis on load les binaires + atlases.
      const loader = this.scene.load;
      let needPhase2 = false;
      if (!this.scene.cache.json.has(mapJsonKey)) {
        loader.json(mapJsonKey, `${BASE}/maps/${mapName}.json`);
      }
      if (!this.scene.cache.json.has(scriptsKey)) {
        loader.json(scriptsKey, `${BASE}/scripts/${mapName}.json`);
      }
      loader.once('complete', () => {
        const mapJson = this.scene.cache.json.get(mapJsonKey) as MapJson;
        const layout = layoutsIndex.layouts.find(l => l.id === mapJson.layout);
        if (!layout) { reject(new Error(`Layout introuvable pour ${mapName}`)); return; }
        const pair = layoutToPair[mapJson.layout];
        if (!pair) { reject(new Error(`Pair introuvable pour layout ${mapJson.layout}`)); return; }
        const layoutDir = layout.blockdata_filepath.replace(/^data\/layouts\//, '').replace(/\/map\.bin$/, '');
        const primDir = tilesetDir(layout.primary_tileset);

        const k = makeKeys(mapName, 0, 0);
        if (!this.scene.textures.exists(k.metatilesLower!)) {
          loader.image(k.metatilesLower!, `${BASE}/tileset-pairs/${pair}/metatiles-lower.png`);
          loader.image(k.metatilesUpper!, `${BASE}/tileset-pairs/${pair}/metatiles-upper.png`);
          needPhase2 = true;
        }
        if (!this.scene.cache.json.has(k.pairInfo!)) {
          loader.json(k.pairInfo!, `${BASE}/tileset-pairs/${pair}/info.json`);
          needPhase2 = true;
        }
        if (!this.scene.cache.binary.has(k.mapBin!)) {
          loader.binary(k.mapBin!, `${BASE}/layouts/${layoutDir}/map.bin`);
          needPhase2 = true;
        }
        if (!this.scene.cache.binary.has(k.attrsPrimary!)) {
          loader.binary(k.attrsPrimary!, `${BASE}/tilesets/primary/${primDir}/metatile_attributes.bin`);
          needPhase2 = true;
        }
        if (layout.secondary_tileset && !this.scene.cache.binary.has(k.attrsSecondary!)) {
          const secDir = tilesetDir(layout.secondary_tileset);
          loader.binary(k.attrsSecondary!, `${BASE}/tilesets/secondary/${secDir}/metatile_attributes.bin`);
          needPhase2 = true;
        }
        if (needPhase2) {
          loader.once('complete', () => resolve());
          loader.start();
        } else {
          resolve();
        }
      });
      loader.start();
    });
  }

  /** Build un MapInstance pour `mapName` à un certain offset world. Suppose que
   *  preloadMapAssets a été appelé et résolu. Build les TilemapLayer aux
   *  positions adaptées. NE spawn PAS les NPCs (à faire séparément). */
  buildMapInstance(
    mapName: string,
    worldOffsetX: number,
    worldOffsetY: number,
    resolvedNpcs: ResolvedNpc[]
  ): MapInstance {
    const mapJsonKey = `map-json-${mapName}`;
    const scriptsKey = `scripts-${mapName}`;
    const mapJson = this.scene.cache.json.get(mapJsonKey) as MapJson;
    const layout = this.layoutsIndex.layouts.find(l => l.id === mapJson.layout)!;
    const parsedScripts = this.scene.cache.json.get(scriptsKey) as ParsedScripts;
    const k = makeKeys(mapName, worldOffsetX * TILE_SIZE, worldOffsetY * TILE_SIZE);
    const tilemap = buildTilemap(this.scene, layout.width, layout.height, k);
    const inst: MapInstance = {
      mapName,
      mapId: mapJson.id,
      mapJson, layout, parsedScripts, tilemap,
      worldOffsetX, worldOffsetY,
      resolvedNpcs,
    };
    this.loaded.set(mapName, inst);
    return inst;
  }

  /** Lookup tile à des coords world. Cherche dans toutes les loaded maps.
   *  Retourne behavior, collision, et la map dans laquelle la tile se trouve. */
  getTileAt(worldX: number, worldY: number): {
    behavior: number; collision: number; mapInstance?: MapInstance;
  } {
    for (const inst of this.loaded.values()) {
      const lx = worldX - inst.worldOffsetX;
      const ly = worldY - inst.worldOffsetY;
      if (lx < 0 || ly < 0 || lx >= inst.layout.width || ly >= inst.layout.height) continue;
      const beh = inst.tilemap.behaviors[ly]?.[lx] ?? 0;
      const col = inst.tilemap.collisions[ly]?.[lx] ?? 0;
      return { behavior: beh, collision: col, mapInstance: inst };
    }
    return { behavior: 0, collision: 1 }; // hors monde = bloqué
  }

  /** Détecte si le joueur a traversé une bordure de current map vers une
   *  adjacent loaded. Retourne la new currentMap si oui. */
  detectTraversal(worldX: number, worldY: number): MapInstance | null {
    const cur = this.current();
    const lx = worldX - cur.worldOffsetX;
    const ly = worldY - cur.worldOffsetY;
    if (lx >= 0 && ly >= 0 && lx < cur.layout.width && ly < cur.layout.height) return null;
    // Out of current bounds → cherche quelle adjacent contient le worldXY
    for (const inst of this.loaded.values()) {
      if (inst === cur) continue;
      const ax = worldX - inst.worldOffsetX;
      const ay = worldY - inst.worldOffsetY;
      if (ax >= 0 && ay >= 0 && ax < inst.layout.width && ay < inst.layout.height) {
        return inst;
      }
    }
    return null;
  }

  /** Promote une adjacent en current — vraiment seamless.
   *  Shift tous les TilemapLayer + NPCs + player sprite par (-newCurrent.offset)
   *  pour maintenir l'invariante "current map a worldOffset (0, 0)". Camera
   *  follow le sprite donc viewport relatif ne change pas — visuellement
   *  AUCUN changement perçu par l'user.
   *
   *  Cette invariante simplifie tous les calculs de pixel (pas besoin d'ajouter
   *  l'offset partout). C'est le pattern du décomp (`gBackupMapLayout` est
   *  toujours centré sur la current map).
   *
   *  @param playerSprite optionnel — si fourni, shifté avec le reste
   *  @param camera optionnel — si fourni, scroll shifté aussi (évite flash 1 frame)
   */
  promoteToCurrent(newCurrent: MapInstance, playerSprite?: Phaser.GameObjects.Sprite, camera?: Phaser.Cameras.Scene2D.Camera) {
    const dxTiles = -newCurrent.worldOffsetX;
    const dyTiles = -newCurrent.worldOffsetY;
    const dxPx = dxTiles * TILE_SIZE;
    const dyPx = dyTiles * TILE_SIZE;
    for (const inst of this.loaded.values()) {
      inst.worldOffsetX += dxTiles;
      inst.worldOffsetY += dyTiles;
      inst.tilemap.lowerLayer.x += dxPx;
      inst.tilemap.lowerLayer.y += dyPx;
      inst.tilemap.upperLayer.x += dxPx;
      inst.tilemap.upperLayer.y += dyPx;
      inst.tilemap.upperCoverLayer.x += dxPx;
      inst.tilemap.upperCoverLayer.y += dyPx;
      if (inst.spawnedNpcs) {
        for (const npc of inst.spawnedNpcs) {
          npc.sprite.x += dxPx;
          npc.sprite.y += dyPx;
          npc.sprite.setDepth(npc.sprite.y);
        }
      }
    }
    if (playerSprite) {
      playerSprite.x += dxPx;
      playerSprite.y += dyPx;
      playerSprite.setDepth(playerSprite.y);
    }
    if (camera) {
      camera.scrollX += dxPx;
      camera.scrollY += dyPx;
    }
    this.currentMapName = newCurrent.mapName;
  }

  /** Convertit un tile coord (relative à la old current) → tile coord
   *  (relative à la new current). Utilise les worldOffset stockés. */
  remapTile(oldCurrent: MapInstance, newCurrent: MapInstance, tileX: number, tileY: number): { x: number; y: number } {
    const worldX = tileX + oldCurrent.worldOffsetX;
    const worldY = tileY + oldCurrent.worldOffsetY;
    return { x: worldX - newCurrent.worldOffsetX, y: worldY - newCurrent.worldOffsetY };
  }

  /** Calcule l'offset world d'une adjacent par rapport à current selon
   *  direction + connection.offset (cf. data/maps/<X>/connections.inc). */
  computeAdjacentOffset(currentLayout: LayoutDef, adjLayout: LayoutDef, direction: string, connOffset: number): { x: number; y: number } {
    if (direction === 'up') return { x: connOffset, y: -adjLayout.height };
    if (direction === 'down') return { x: connOffset, y: currentLayout.height };
    if (direction === 'left') return { x: -adjLayout.width, y: connOffset };
    if (direction === 'right') return { x: currentLayout.width, y: connOffset };
    return { x: 0, y: 0 };
  }

  /** Détruit une map instance (tilemap + sprites). Pour unload des adjacents
   *  qui sortent de portée après plusieurs traversées. */
  unload(mapName: string) {
    const inst = this.loaded.get(mapName);
    if (!inst) return;
    inst.tilemap.lowerLayer.destroy();
    inst.tilemap.upperLayer.destroy();
    inst.tilemap.upperCoverLayer.destroy();
    if (inst.spawnedNpcs) {
      for (const npc of inst.spawnedNpcs) npc.sprite.destroy();
    }
    this.loaded.delete(mapName);
  }
}

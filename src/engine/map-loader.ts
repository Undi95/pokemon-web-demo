/**
 * map-loader.ts — moteur natif de chargement de map décomp 1:1.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/fieldmap.c` (= InitMap, MapGridGet*,
 *     CopyMapTilesetsToVram, LoadMapTilesetPalettes)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_camera.c` (= DrawMetatile,
 *     DrawWholeMapView, MapPosToBgTilemapOffset)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (= struct
 *     Tileset, MapLayout, MapHeader, MapEvents, masks/shifts)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/fieldmap.h` (= constantes
 *     NUM_TILES_*, NUM_PALS_*, MAP_OFFSET, MAX_MAP_DATA_SIZE)
 *
 * Données consommées (= déjà extraites par scripts/extract-decomp-all.mjs) :
 *   - `/decomp/em/maps/<MapName>.json`               — header + events
 *   - `/decomp/em/layouts-index.json`                — table layouts
 *   - `/decomp/em/layouts/<MapName>/{map,border}.bin` — blockdata u16
 *   - `/decomp/em/tilesets/{primary,secondary}/<name>/{tiles.png,metatiles.bin,
 *     metatile_attributes.bin,palettes/00.pal..15.pal}`
 *   - `/decomp/em/scripts/<MapName>.json`            — script + texts
 *
 * Format des fichiers binaires (1:1 ROM) :
 *   - map.bin / border.bin : u16 LE blocks (= u10 metatileId + u2 collision +
 *     u4 elevation, cf. MAPGRID_*_MASK).
 *   - metatiles.bin : 16 bytes par metatile = 8 u16 = 4 bottom BG tiles + 4 top.
 *     Chaque u16 BG tile = u10 tileNum + u1 hflip + u1 vflip + u4 paletteBank.
 *   - metatile_attributes.bin : 2 bytes par metatile = u8 behavior + u4 unused
 *     + u4 layerType (0=NORMAL, 1=COVERED, 2=SPLIT).
 *
 * BG Layer assignement overworld (1:1 décomp field_camera.c) :
 *   - BG0 : windows / dialogue (= pas géré ici, séparément)
 *   - BG1 : top layer (= NORMAL/SPLIT top tiles → couvre player)
 *   - BG2 : middle layer (= COVERED top tiles, NORMAL/SPLIT bottom alt)
 *   - BG3 : bottom layer (= NORMAL fallback, COVERED bottom, SPLIT bottom)
 *
 * VRAM layout (1:1 décomp fieldmap.c) :
 *   - charBase 0 : tileset tiles (= primary 0..511 puis secondary 512..1023).
 *     Chaque tile = 32 bytes (4bpp 8x8). Total = 1024 × 32 = 32 KB.
 *   - mapBase BG1/BG2/BG3 : 32x32 u16 tilemaps = 2 KB each.
 *
 * Palette banks (1:1 décomp BG_PLTT_ID) :
 *   - Banks 0-5 : primary tileset palettes[0..5]
 *   - Banks 6-12 : secondary tileset palettes[6..12]
 *   - Banks 13-15 : réservé (text windows, sprites overflow, etc.)
 *
 * Ce module n'est PAS asynchrone à l'exécution : les fonctions InitMap +
 * MapGridGet* sont synchrones après loadMapByName() async qui pré-fetch tout.
 */
import type { DecompRuntime } from './decomp-runtime';
import { LoadBgTiles, LoadPalette } from './decomp-globals';
import { extractPngPlte, loadIndexedPngStrict } from './gba/png-loader';

// ─── Constants 1:1 décomp include/fieldmap.h ────────────────────────────────

export const NUM_TILES_IN_PRIMARY = 512;
export const NUM_TILES_TOTAL = 1024;
export const NUM_METATILES_IN_PRIMARY = 512;
export const NUM_METATILES_TOTAL = 1024;
export const NUM_PALS_IN_PRIMARY = 6;
export const NUM_PALS_TOTAL = 13;
export const MAX_MAP_DATA_SIZE = 10240;
export const NUM_TILES_PER_METATILE = 8;
export const MAP_OFFSET = 7;
export const MAP_OFFSET_W = MAP_OFFSET * 2 + 1; // 15
export const MAP_OFFSET_H = MAP_OFFSET * 2;     // 14

// ─── Constants 1:1 décomp include/global.fieldmap.h ────────────────────────

export const MAPGRID_METATILE_ID_MASK = 0x03FF;  // bits 0-9
export const MAPGRID_COLLISION_MASK   = 0x0C00;  // bits 10-11
export const MAPGRID_ELEVATION_MASK   = 0xF000;  // bits 12-15
export const MAPGRID_METATILE_ID_SHIFT = 0;
export const MAPGRID_COLLISION_SHIFT  = 10;
export const MAPGRID_ELEVATION_SHIFT  = 12;
export const MAPGRID_UNDEFINED  = MAPGRID_METATILE_ID_MASK;
export const MAPGRID_IMPASSABLE = MAPGRID_COLLISION_MASK;

export const METATILE_ATTR_BEHAVIOR_MASK = 0x00FF;  // bits 0-7
export const METATILE_ATTR_LAYER_MASK    = 0xF000;  // bits 12-15
export const METATILE_ATTR_BEHAVIOR_SHIFT = 0;
export const METATILE_ATTR_LAYER_SHIFT   = 12;

export const METATILE_LAYER_TYPE_NORMAL  = 0;
export const METATILE_LAYER_TYPE_COVERED = 1;
export const METATILE_LAYER_TYPE_SPLIT   = 2;

export const MB_INVALID = 0xFF;

// ─── Type definitions 1:1 décomp ────────────────────────────────────────────

/** 1:1 décomp `struct Tileset` (global.fieldmap.h:64-73). */
export interface Tileset {
  isCompressed: boolean;
  isSecondary: boolean;
  /** Char data 4bpp packed (= 32 bytes par tile). Pour primary : 512 tiles
   *  = 16384 bytes. Pour secondary : 512 tiles = 16384 bytes. */
  tiles: Uint8Array;
  /** Palettes : array de 16 banks de 16 colors each (= 16 × 32 = 512 bytes par
   *  tileset). Décomp utilise banks[0..5] primary + banks[6..12] secondary. */
  palettes: Uint16Array[];
  /** Metatiles : 8 u16 par metatile (= 4 bottom BG tiles + 4 top BG tiles).
   *  Chaque u16 = tileNum (10 bits) + hflip (1) + vflip (1) + palette (4). */
  metatiles: Uint16Array;
  /** Metatile attributes : u16 par metatile = behavior (8 bits) + layer (4 bits). */
  metatileAttributes: Uint16Array;
  /** Tileset animation callback (rare, non-implémenté pour l'instant). */
  callback: (() => void) | null;
}

/** 1:1 décomp `struct MapLayout` (global.fieldmap.h:75-83). */
export interface MapLayout {
  /** ID layout (e.g. 'LAYOUT_LITTLEROOT_TOWN'). Notre extension. */
  id: string;
  /** Width en metatiles (sans bordure). */
  width: number;
  /** Height en metatiles (sans bordure). */
  height: number;
  /** Border : 4 u16 (= 2x2 metatile pattern qui repeat hors map). */
  border: Uint16Array;
  /** Map data : width × height u16 (= MAPGRID format). */
  map: Uint16Array;
  primaryTileset: Tileset;
  secondaryTileset: Tileset;
}

/** 1:1 décomp `struct ObjectEventTemplate` (global.fieldmap.h:92-110). */
export interface ObjectEventTemplate {
  localId: number;
  graphicsId: number;  // résolu depuis OBJ_EVENT_GFX_* string
  graphicsIdRaw: string;
  kind: number;        // = 0 (OBJ_KIND_NORMAL)
  x: number;
  y: number;
  elevation: number;
  movementType: number;
  movementTypeRaw: string;
  movementRangeX: number;
  movementRangeY: number;
  trainerType: number;
  trainerRange_berryTreeId: number;
  /** Script symbol name (e.g. 'LittlerootTown_EventScript_Twin'). */
  script: string;
  /** Flag symbol name (e.g. 'FLAG_HIDE_LITTLEROOT_TOWN_FAT_MAN'). */
  flagId: string;
}

/** 1:1 décomp `struct WarpEvent` (global.fieldmap.h:112-119). */
export interface WarpEvent {
  x: number;
  y: number;
  elevation: number;
  warpId: number;
  destMap: string;     // e.g. 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F'
}

/** 1:1 décomp `struct CoordEvent` (global.fieldmap.h:121-128). */
export interface CoordEvent {
  x: number;
  y: number;
  elevation: number;
  trigger: string;     // e.g. 'VAR_LITTLEROOT_TOWN_STATE'
  index: number;       // var_value
  script: string;
}

/** 1:1 décomp `struct BgEvent` (global.fieldmap.h:130-143). */
export interface BgEvent {
  x: number;
  y: number;
  elevation: number;
  /** 'sign' / 'hidden_item' / 'secret_base'. */
  kind: string;
  playerFacingDir: string;
  script: string;
}

/** 1:1 décomp `struct MapEvents` (global.fieldmap.h:145-155). */
export interface MapEvents {
  objectEvents: ObjectEventTemplate[];
  warps: WarpEvent[];
  coordEvents: CoordEvent[];
  bgEvents: BgEvent[];
}

/** 1:1 décomp `struct MapConnection` (global.fieldmap.h:157-163). */
export interface MapConnection {
  /** 1=south, 2=north, 3=west, 4=east, 5=dive, 6=emerge. */
  direction: number;
  directionRaw: string;
  offset: number;
  /** Destination map ID (e.g. 'MAP_ROUTE101'). */
  destMap: string;
}

/** 1:1 décomp `struct MapHeader` (global.fieldmap.h:171-191). */
export interface MapHeader {
  /** Map ID (e.g. 'MAP_LITTLEROOT_TOWN'). Notre extension pour debug. */
  id: string;
  mapLayout: MapLayout;
  events: MapEvents;
  /** Script symbol (e.g. 'LittlerootTown_MapScripts'). */
  mapScripts: string;
  connections: MapConnection[];
  /** BGM song id (e.g. 'MUS_LITTLEROOT'). */
  music: string;
  mapLayoutId: string;
  regionMapSectionId: string;
  cave: boolean;
  weather: string;
  mapType: string;
  allowCycling: boolean;
  allowEscaping: boolean;
  allowRunning: boolean;
  showMapName: boolean;
  battleType: string;
}

/** 1:1 décomp `struct BackupMapLayout` (global.fieldmap.h:85-90). */
export interface BackupMapLayout {
  width: number;
  height: number;
  /** u16 array of size MAX_MAP_DATA_SIZE (= 10240). Pointer-equivalent to
   *  sBackupMapData; we store the array directly. */
  map: Uint16Array;
}

/** 1:1 décomp `struct Camera` (global.fieldmap.h:364-369). */
export interface Camera {
  active: boolean;
  x: number;
  y: number;
}

// ─── Globals 1:1 décomp EWRAM ───────────────────────────────────────────────

/** 1:1 décomp `EWRAM_DATA static u16 sBackupMapData[MAX_MAP_DATA_SIZE]`
 *  (fieldmap.c:28). Pré-alloué une fois, réutilisé à chaque InitMap. */
const sBackupMapData = new Uint16Array(MAX_MAP_DATA_SIZE);

/** 1:1 décomp `EWRAM_DATA struct MapHeader gMapHeader = {0}` (fieldmap.c:29).
 *  Set par loadMapByName() avant l'appel à InitMap. */
export let gMapHeader: MapHeader | null = null;

/** 1:1 décomp `EWRAM_DATA struct Camera gCamera = {0}` (fieldmap.c:30). */
export const gCamera: Camera = { active: false, x: 0, y: 0 };

/** 1:1 décomp `COMMON_DATA struct BackupMapLayout gBackupMapLayout = {0}`
 *  (fieldmap.c:34). Backing storage for runtime map queries. */
export const gBackupMapLayout: BackupMapLayout = {
  width: 0,
  height: 0,
  map: sBackupMapData,
};

// ─── PACK / UNPACK helpers 1:1 décomp ───────────────────────────────────────

export const UNPACK_METATILE  = (data: number): number => (data & MAPGRID_METATILE_ID_MASK) >>> MAPGRID_METATILE_ID_SHIFT;
export const UNPACK_COLLISION = (data: number): number => (data & MAPGRID_COLLISION_MASK) >>> MAPGRID_COLLISION_SHIFT;
export const UNPACK_ELEVATION = (data: number): number => (data & MAPGRID_ELEVATION_MASK) >>> MAPGRID_ELEVATION_SHIFT;
export const UNPACK_BEHAVIOR  = (data: number): number => (data & METATILE_ATTR_BEHAVIOR_MASK) >>> METATILE_ATTR_BEHAVIOR_SHIFT;
export const UNPACK_LAYER_TYPE = (data: number): number => (data & METATILE_ATTR_LAYER_MASK) >>> METATILE_ATTR_LAYER_SHIFT;

// ─── Async loaders (= fetch + parse depuis /decomp/em/) ─────────────────────

const BASE = '/decomp/em';

/** Cache des tilesets déjà chargés (= une fois loadé, plus de fetch). */
const tilesetCache = new Map<string, Tileset>();

/** Cache des layouts déjà chargés. */
const layoutCache = new Map<string, MapLayout>();

/** Cache des map headers. */
const mapHeaderCache = new Map<string, MapHeader>();

/** Convertit `gTileset_Petalburg` → `petalburg` (= path filename). */
function tilesetGNameToPath(gname: string): string {
  return gname.replace(/^gTileset_/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Détermine `primary/<dir>` ou `secondary/<dir>` selon le nom GF.
 *  Tilesets primary canoniques : `gTileset_General/Building/SecretBase`.
 *  Tous les autres sont secondary. */
function tilesetSubdir(gname: string): { sub: 'primary' | 'secondary'; dir: string } {
  const dir = tilesetGNameToPath(gname);
  const isPrimary = dir === 'general' || dir === 'building' || dir === 'secret_base';
  return { sub: isPrimary ? 'primary' : 'secondary', dir };
}

/** Parse un fichier .pal au format JASC-PAL (text, 16 colors RGB888 → RGB15).
 *  Format :
 *    Line 0 : "JASC-PAL"
 *    Line 1 : "0100"
 *    Line 2 : N (= num colors, normalement 16)
 *    Lines 3..N+2 : "R G B" (decimal 0-255 each).
 *  Retourne Uint16Array de N colors RGB15. */
function parseJascPal(text: string): Uint16Array {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== 'JASC-PAL') {
    throw new Error(`parseJascPal: not JASC-PAL header (got '${lines[0]}')`);
  }
  const n = parseInt(lines[2], 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`parseJascPal: invalid color count '${lines[2]}'`);
  }
  const out = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    const parts = lines[3 + i].trim().split(/\s+/);
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    // RGB888 → RGB15 : take top 5 bits of each channel.
    out[i] = ((b & 0xF8) << 7) | ((g & 0xF8) << 2) | ((r & 0xF8) >> 3);
  }
  return out;
}

/** Async load d'un tileset depuis `/decomp/em/tilesets/{primary,secondary}/<dir>/`.
 *  - tiles.png → décodé via PNG PLTE strict (= indices 0-15 fidèles à la ROM)
 *  - metatiles.bin → u16 array
 *  - metatile_attributes.bin → u16 array
 *  - palettes/00.pal..15.pal → 16 RGB15 banks (= JASC-PAL parsed)
 *
 *  Cached via `tilesetCache`. Idempotent. */
export async function loadTileset(gname: string): Promise<Tileset> {
  const cached = tilesetCache.get(gname);
  if (cached) return cached;

  const { sub, dir } = tilesetSubdir(gname);
  const baseUrl = `${BASE}/tilesets/${sub}/${dir}`;

  // Charge tiles.png en utilisant PLTE strict → préserve indices 4bpp ROM.
  const png = await loadIndexedPngStrict(`${baseUrl}/tiles.png`, 4);

  // Charge metatiles.bin (= 8 u16 par metatile).
  const metatilesBuf = await fetch(`${baseUrl}/metatiles.bin`).then(r => {
    if (!r.ok) throw new Error(`metatiles.bin fetch failed: ${baseUrl} → ${r.status}`);
    return r.arrayBuffer();
  });
  const metatiles = new Uint16Array(metatilesBuf);

  // Charge metatile_attributes.bin (= u16 par metatile).
  const attrsBuf = await fetch(`${baseUrl}/metatile_attributes.bin`).then(r => {
    if (!r.ok) throw new Error(`metatile_attributes.bin fetch failed: ${baseUrl} → ${r.status}`);
    return r.arrayBuffer();
  });
  const metatileAttributes = new Uint16Array(attrsBuf);

  // Charge palettes/00..15.pal en parallèle.
  const palettes: Uint16Array[] = await Promise.all(
    Array.from({ length: 16 }, (_, i) => {
      const idx = i.toString().padStart(2, '0');
      return fetch(`${baseUrl}/palettes/${idx}.pal`).then(async r => {
        if (!r.ok) {
          // Pas toutes les banks existent (= e.g. tileset secondary peut
          // avoir < 16 banks). Retourne bank vide (= 16 black colors).
          return new Uint16Array(16);
        }
        return parseJascPal(await r.text());
      });
    })
  );

  const tileset: Tileset = {
    isCompressed: false, // notre PNG est déjà décompressé
    isSecondary: sub === 'secondary',
    tiles: png.charData,
    palettes,
    metatiles,
    metatileAttributes,
    callback: null,
  };
  tilesetCache.set(gname, tileset);
  return tileset;
}

/** Async load d'un layout depuis `layouts-index.json` + `layouts/<name>/{map,border}.bin`.
 *  Charge aussi les 2 tilesets associés (primary + secondary). */
export async function loadLayout(layoutId: string): Promise<MapLayout> {
  const cached = layoutCache.get(layoutId);
  if (cached) return cached;

  const idx = await fetch(`${BASE}/layouts-index.json`).then(r => r.json()) as {
    layouts: Array<{
      id: string; name: string; width: number; height: number;
      primary_tileset: string; secondary_tileset: string;
      border_filepath: string; blockdata_filepath: string;
    }>;
  };
  const def = idx.layouts.find(l => l.id === layoutId);
  if (!def) throw new Error(`loadLayout: unknown layoutId '${layoutId}'`);

  // border_filepath = e.g. "data/layouts/LittlerootTown/border.bin"
  // → on remplace `data/` par `${BASE}/` pour atteindre nos extracts.
  const borderUrl = `${BASE}/${def.border_filepath.replace(/^data\//, '')}`;
  const mapUrl = `${BASE}/${def.blockdata_filepath.replace(/^data\//, '')}`;

  const [borderBuf, mapBuf, primary, secondary] = await Promise.all([
    fetch(borderUrl).then(r => r.arrayBuffer()),
    fetch(mapUrl).then(r => r.arrayBuffer()),
    loadTileset(def.primary_tileset),
    loadTileset(def.secondary_tileset),
  ]);

  const layout: MapLayout = {
    id: def.id,
    width: def.width,
    height: def.height,
    border: new Uint16Array(borderBuf),
    map: new Uint16Array(mapBuf),
    primaryTileset: primary,
    secondaryTileset: secondary,
  };
  layoutCache.set(layoutId, layout);
  return layout;
}

/** Convertit une chaîne "MOVEMENT_TYPE_FACE_UP" → enum int (1:1 décomp).
 *  Utilisé pour parser les map JSONs. */
function parseMovementType(s: string): number {
  // Mapping minimal pour les types les plus utilisés. À étendre selon besoins.
  // 1:1 décomp `data/object_events/movement_type_constants.h`.
  const map: Record<string, number> = {
    MOVEMENT_TYPE_NONE: 0,
    MOVEMENT_TYPE_LOOK_AROUND: 1,
    MOVEMENT_TYPE_WANDER_AROUND: 2,
    MOVEMENT_TYPE_WANDER_UP_AND_DOWN: 3,
    MOVEMENT_TYPE_WANDER_DOWN_AND_UP: 4,
    MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT: 5,
    MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT: 6,
    MOVEMENT_TYPE_FACE_UP: 7,
    MOVEMENT_TYPE_FACE_DOWN: 8,
    MOVEMENT_TYPE_FACE_LEFT: 9,
    MOVEMENT_TYPE_FACE_RIGHT: 10,
  };
  return map[s] ?? 0;
}

/** Convertit "OBJ_EVENT_GFX_TWIN" → numeric ID. Mapping étendu via fetch des
 *  graphics-id-table si besoin. Pour l'instant on garde la string en raw. */
function parseGraphicsId(s: string): number {
  // Notre impl utilisera `graphicsIdRaw` pour résoudre le PNG. Le numeric ID
  // décomp n'est pas critique pour le rendu (= juste un index gObjectEventGraphicsInfo).
  return 0;  // placeholder, resolved via raw string
}

/** Convertit "MOVEMENT_TYPE_FACE_UP" via mapping. Idem graphicsId. */
const directionMap: Record<string, number> = {
  CONNECTION_NONE: 0,
  CONNECTION_SOUTH: 1,
  CONNECTION_NORTH: 2,
  CONNECTION_WEST: 3,
  CONNECTION_EAST: 4,
  CONNECTION_DIVE: 5,
  CONNECTION_EMERGE: 6,
  // Map JSONs use lowercase form.
  down: 1, south: 1,
  up: 2, north: 2,
  left: 3, west: 3,
  right: 4, east: 4,
  dive: 5, emerge: 6,
};

/** Async load d'un map header depuis `/decomp/em/maps/<MapName>.json`.
 *  Note : le JSON utilise `id` au format `MAP_X_Y` mais le fichier filename
 *  est `MapName.json` (= camelCase). On utilise `map-ids.json` pour mapper. */
export async function loadMapHeader(mapId: string): Promise<MapHeader> {
  const cached = mapHeaderCache.get(mapId);
  if (cached) return cached;

  // Résout MAP_LITTLEROOT_TOWN → LittlerootTown (= filename).
  const idsTable = await fetch(`${BASE}/map-ids.json`).then(r => r.json()) as Record<string, string>;
  const fileName = idsTable[mapId];
  if (!fileName) throw new Error(`loadMapHeader: unknown mapId '${mapId}'`);

  const json = await fetch(`${BASE}/maps/${fileName}.json`).then(r => r.json()) as {
    id: string; name: string; layout: string; music: string;
    region_map_section: string; requires_flash: boolean; weather: string;
    map_type: string; allow_cycling: boolean; allow_escaping: boolean;
    allow_running: boolean; show_map_name: boolean; battle_scene: string;
    connections?: Array<{ map: string; offset: number; direction: string }>;
    object_events?: Array<{
      local_id?: string; graphics_id: string; x: number; y: number;
      elevation: number; movement_type: string;
      movement_range_x: number; movement_range_y: number;
      trainer_type: string; trainer_sight_or_berry_tree_id: string;
      script: string; flag: string;
    }>;
    warp_events?: Array<{
      x: number; y: number; elevation: number;
      dest_map: string; dest_warp_id: number;
    }>;
    coord_events?: Array<{
      type: string; x: number; y: number; elevation: number;
      var?: string; var_value?: string; script?: string;
    }>;
    bg_events?: Array<{
      type: string; x: number; y: number; elevation: number;
      player_facing_dir?: string; script?: string;
    }>;
  };

  const layout = await loadLayout(json.layout);

  // Build events (= localId auto-assigné en index si non fourni).
  const objectEvents: ObjectEventTemplate[] = (json.object_events ?? []).map((e, i) => ({
    localId: e.local_id ? 0 /* resolved at runtime via constants */ : i + 1,
    graphicsId: parseGraphicsId(e.graphics_id),
    graphicsIdRaw: e.graphics_id,
    kind: 0,
    x: e.x,
    y: e.y,
    elevation: e.elevation,
    movementType: parseMovementType(e.movement_type),
    movementTypeRaw: e.movement_type,
    movementRangeX: e.movement_range_x,
    movementRangeY: e.movement_range_y,
    trainerType: 0,
    trainerRange_berryTreeId: 0,
    script: e.script,
    flagId: e.flag,
  }));

  const warps: WarpEvent[] = (json.warp_events ?? []).map(w => ({
    x: w.x, y: w.y, elevation: w.elevation,
    warpId: w.dest_warp_id, destMap: w.dest_map,
  }));

  const coordEvents: CoordEvent[] = (json.coord_events ?? [])
    .filter(c => c.type === 'trigger')
    .map(c => ({
      x: c.x, y: c.y, elevation: c.elevation,
      trigger: c.var ?? '',
      index: parseInt(c.var_value ?? '0', 10),
      script: c.script ?? '',
    }));

  const bgEvents: BgEvent[] = (json.bg_events ?? []).map(b => ({
    x: b.x, y: b.y, elevation: b.elevation,
    kind: b.type,
    playerFacingDir: b.player_facing_dir ?? 'BG_EVENT_PLAYER_FACING_ANY',
    script: b.script ?? '',
  }));

  const connections: MapConnection[] = (json.connections ?? []).map(c => ({
    direction: directionMap[c.direction] ?? 0,
    directionRaw: c.direction,
    offset: c.offset,
    destMap: c.map,
  }));

  const header: MapHeader = {
    id: json.id,
    mapLayout: layout,
    events: { objectEvents, warps, coordEvents, bgEvents },
    mapScripts: `${json.name}_MapScripts`,
    connections,
    music: json.music,
    mapLayoutId: json.layout,
    regionMapSectionId: json.region_map_section,
    cave: json.requires_flash,
    weather: json.weather,
    mapType: json.map_type,
    allowCycling: json.allow_cycling,
    allowEscaping: json.allow_escaping,
    allowRunning: json.allow_running,
    showMapName: json.show_map_name,
    battleType: json.battle_scene,
  };
  mapHeaderCache.set(mapId, header);
  return header;
}

/** Pré-load complet d'une map (= tilesets + layout + header).
 *  Set `gMapHeader`. Synchroniquement disponible après. */
export async function loadMapByName(mapId: string): Promise<MapHeader> {
  const header = await loadMapHeader(mapId);
  gMapHeader = header;
  return header;
}

// ─── 1:1 décomp fieldmap.c InitMap pipeline ─────────────────────────────────

/** 1:1 décomp `InitMap()` (fieldmap.c:71-76).
 *  Init layout data + run on-load script + secret base entrance metatiles.
 *  Note : SetOccupiedSecretBaseEntranceMetatiles + RunOnLoadMapScript = stubs
 *  pour l'instant (pas critiques pour rendu basic). */
export function InitMap(): void {
  if (!gMapHeader) throw new Error('InitMap: gMapHeader is null (call loadMapByName first)');
  InitMapLayoutData(gMapHeader);
  // SetOccupiedSecretBaseEntranceMetatiles(gMapHeader.events);  // TODO Phase 4.5
  // RunOnLoadMapScript();                                       // TODO Phase 4.7
}

/** 1:1 décomp `InitMapLayoutData(mapHeader)` (fieldmap.c:100-117).
 *  Build gBackupMapLayout : remplit sBackupMapData avec MAPGRID_UNDEFINED puis
 *  copie le contenu de mapLayout.map en (MAP_OFFSET, MAP_OFFSET) avec width/
 *  height incluant la bordure. */
function InitMapLayoutData(mapHeader: MapHeader): void {
  const mapLayout = mapHeader.mapLayout;
  // CpuFastFill16(MAPGRID_UNDEFINED, sBackupMapData, sizeof(sBackupMapData));
  sBackupMapData.fill(MAPGRID_UNDEFINED);
  gBackupMapLayout.map = sBackupMapData;
  const width = mapLayout.width + MAP_OFFSET_W;
  gBackupMapLayout.width = width;
  const height = mapLayout.height + MAP_OFFSET_H;
  gBackupMapLayout.height = height;
  if (width * height <= MAX_MAP_DATA_SIZE) {
    InitBackupMapLayoutData(mapLayout.map, mapLayout.width, mapLayout.height);
    InitBackupMapLayoutConnections(mapHeader);
  } else {
    console.warn(`[map-loader] map ${mapHeader.id} too big (${width}x${height} > ${MAX_MAP_DATA_SIZE})`);
  }
}

/** 1:1 décomp `InitBackupMapLayoutData(map, width, height)` (fieldmap.c:119-131).
 *  Copy `width * height` u16 from mapLayout.map → gBackupMapLayout.map à l'offset
 *  `(7, 7)` (= MAP_OFFSET dans les deux axes). */
function InitBackupMapLayoutData(map: Uint16Array, width: number, height: number): void {
  // dest = gBackupMapLayout.map + gBackupMapLayout.width * 7 + MAP_OFFSET
  let destOffset = gBackupMapLayout.width * MAP_OFFSET + MAP_OFFSET;
  let srcOffset = 0;
  for (let y = 0; y < height; y++) {
    // CpuCopy16(map, dest, width * 2)
    sBackupMapData.set(map.subarray(srcOffset, srcOffset + width), destOffset);
    destOffset += gBackupMapLayout.width;
    srcOffset += width;
  }
}

/** 1:1 décomp `InitBackupMapLayoutConnections(mapHeader)` (fieldmap.c:133-169).
 *  Phase 4.1 : stub. Phase 4.6 implémentera south/north/west/east connections. */
function InitBackupMapLayoutConnections(_mapHeader: MapHeader): void {
  // TODO Phase 4.6 : FillSouthConnection / FillNorthConnection / etc.
}

// ─── 1:1 décomp fieldmap.c MapGridGet* ──────────────────────────────────────

/** 1:1 décomp `AreCoordsWithinMapGridBounds(x, y)` (fieldmap.c:62). */
function AreCoordsWithinMapGridBounds(x: number, y: number): boolean {
  return x >= 0 && x < gBackupMapLayout.width && y >= 0 && y < gBackupMapLayout.height;
}

/** 1:1 décomp `GetBorderBlockAt(x, y)` (fieldmap.c:51-60).
 *  Border = 2x2 metatile pattern repeated outside map. */
function GetBorderBlockAt(x: number, y: number): number {
  if (!gMapHeader) return MAPGRID_UNDEFINED;
  const border = gMapHeader.mapLayout.border;
  const i = ((x + 1) & 1) + ((y + 1) & 1) * 2;
  return border[i] | MAPGRID_IMPASSABLE;
}

/** 1:1 décomp `GetMapGridBlockAt(x, y)` (fieldmap.c:64). */
function GetMapGridBlockAt(x: number, y: number): number {
  if (AreCoordsWithinMapGridBounds(x, y)) {
    return gBackupMapLayout.map[x + gBackupMapLayout.width * y];
  }
  return GetBorderBlockAt(x, y);
}

/** 1:1 décomp `MapGridGetElevationAt(x, y)` (fieldmap.c:345-353). */
export function MapGridGetElevationAt(x: number, y: number): number {
  const block = GetMapGridBlockAt(x, y);
  if (block === MAPGRID_UNDEFINED) return 0;
  return UNPACK_ELEVATION(block);
}

/** 1:1 décomp `MapGridGetCollisionAt(x, y)` (fieldmap.c:355-363). */
export function MapGridGetCollisionAt(x: number, y: number): number {
  const block = GetMapGridBlockAt(x, y);
  if (block === MAPGRID_UNDEFINED) return 1;  // TRUE = impassable
  return UNPACK_COLLISION(block);
}

/** 1:1 décomp `MapGridGetMetatileIdAt(x, y)` (fieldmap.c:365-373). */
export function MapGridGetMetatileIdAt(x: number, y: number): number {
  const block = GetMapGridBlockAt(x, y);
  if (block === MAPGRID_UNDEFINED) {
    return UNPACK_METATILE(GetBorderBlockAt(x, y));
  }
  return UNPACK_METATILE(block);
}

/** 1:1 décomp `MapGridGetMetatileBehaviorAt(x, y)` (fieldmap.c:375-379). */
export function MapGridGetMetatileBehaviorAt(x: number, y: number): number {
  const metatile = MapGridGetMetatileIdAt(x, y);
  return UNPACK_BEHAVIOR(GetMetatileAttributesById(metatile));
}

/** 1:1 décomp `MapGridGetMetatileLayerTypeAt(x, y)` (fieldmap.c:381-385). */
export function MapGridGetMetatileLayerTypeAt(x: number, y: number): number {
  const metatile = MapGridGetMetatileIdAt(x, y);
  return UNPACK_LAYER_TYPE(GetMetatileAttributesById(metatile));
}

/** 1:1 décomp `GetMetatileAttributesById(metatile)` (fieldmap.c:409-426). */
export function GetMetatileAttributesById(metatile: number): number {
  if (!gMapHeader) return MB_INVALID;
  if (metatile < NUM_METATILES_IN_PRIMARY) {
    return gMapHeader.mapLayout.primaryTileset.metatileAttributes[metatile] ?? MB_INVALID;
  }
  if (metatile < NUM_METATILES_TOTAL) {
    return gMapHeader.mapLayout.secondaryTileset.metatileAttributes[metatile - NUM_METATILES_IN_PRIMARY] ?? MB_INVALID;
  }
  return MB_INVALID;
}

/** 1:1 décomp `MapGridSetMetatileIdAt(x, y, metatile)` (fieldmap.c:387-397). */
export function MapGridSetMetatileIdAt(x: number, y: number, metatile: number): void {
  if (AreCoordsWithinMapGridBounds(x, y)) {
    const i = x + y * gBackupMapLayout.width;
    gBackupMapLayout.map[i] = (gBackupMapLayout.map[i] & MAPGRID_ELEVATION_MASK)
      | (metatile & ~MAPGRID_ELEVATION_MASK);
  }
}

/** 1:1 décomp `MapGridSetMetatileEntryAt(x, y, metatile)` (fieldmap.c:399-407). */
export function MapGridSetMetatileEntryAt(x: number, y: number, metatile: number): void {
  if (AreCoordsWithinMapGridBounds(x, y)) {
    gBackupMapLayout.map[x + gBackupMapLayout.width * y] = metatile;
  }
}

/** 1:1 décomp `MapGridSetMetatileImpassabilityAt(x, y, impassable)` (fieldmap.c:816-825). */
export function MapGridSetMetatileImpassabilityAt(x: number, y: number, impassable: boolean): void {
  if (AreCoordsWithinMapGridBounds(x, y)) {
    const i = x + gBackupMapLayout.width * y;
    if (impassable) {
      gBackupMapLayout.map[i] |= MAPGRID_COLLISION_MASK;
    } else {
      gBackupMapLayout.map[i] &= ~MAPGRID_COLLISION_MASK;
    }
  }
}

// ─── 1:1 décomp fieldmap.c CopyMapTilesetsToVram + LoadMapTilesetPalettes ──

/** 1:1 décomp `CopyTilesetToVramUsingHeap(tileset, numTiles, offset)` (fieldmap.c:853-862).
 *  Notre version : copie tileset.tiles → BG VRAM via LoadBgTiles. Pas de
 *  décompression LZ77 nécessaire (= notre PNG est déjà décompressé). */
function CopyTilesetToVram(tileset: Tileset | null, numTiles: number, offset: number): void {
  if (!tileset) return;
  // 1:1 décomp `LoadBgTiles(2, tileset->tiles, numTiles * 32, offset);`
  // numTiles * 32 = bytes (= 4bpp 8x8 = 32 bytes/tile). offset = tile slot
  // dans BG charBase 2.
  // Notre LoadBgTiles attend (bg, src, sizeBytes, destTileOffset).
  LoadBgTiles(2, tileset.tiles, numTiles * 32, offset);
}

/** 1:1 décomp `LoadTilesetPalette(tileset, destOffset, size)` (fieldmap.c:875-898).
 *  - Primary : load BLACK at destOffset[0], then palettes[0]+1..end (= 16 colors -1).
 *  - Secondary : load palettes[NUM_PALS_IN_PRIMARY=6]..end.
 *
 *  destOffset = flat palette index dans gPlttBuffer (0..511, BG = 0..255).
 *  size = bytes (= numColors * 2). */
function LoadTilesetPalette(tileset: Tileset | null, destOffset: number, size: number): void {
  if (!tileset) return;
  const PLTT_SIZEOF_1 = 2;  // 1 RGB15 = 2 bytes

  if (tileset.isSecondary === false) {
    // Primary : loadBlack à destOffset[0], puis tileset.palettes[0]+1 (= skip
    // first color = make transparent) pour le reste de size.
    const black = new Uint16Array([0]);
    LoadPalette(black, destOffset, PLTT_SIZEOF_1);
    // tileset.palettes[0] is bank 0 (16 colors). On skip [0] et load [1..15] +
    // banks suivants jusqu'à size atteinte.
    // Notre version simplifiée : flatten palettes[0..NUM_PALS_IN_PRIMARY-1] et
    // skip first color (= replaced by black).
    const flat = flattenPaletteBanks(tileset.palettes, 0, NUM_PALS_IN_PRIMARY);
    // size - PLTT_SIZEOF_1 = bytes restantes = (NUM_PALS_IN_PRIMARY * 16 - 1) * 2
    const restEntries = (size - PLTT_SIZEOF_1) / 2;
    LoadPalette(flat.subarray(1, 1 + restEntries), destOffset + 1, restEntries * 2);
  } else {
    // Secondary : load palettes[NUM_PALS_IN_PRIMARY=6]..jusqu'à size.
    // Décomp : `LoadPalette(tileset->palettes[NUM_PALS_IN_PRIMARY], destOffset, size);`
    // C'est un cast pointer → 16 u16 par bank, on flatten palettes[6..12] = 7 banks.
    const flat = flattenPaletteBanks(tileset.palettes, NUM_PALS_IN_PRIMARY, NUM_PALS_TOTAL);
    const numEntries = size / 2;
    LoadPalette(flat.subarray(0, numEntries), destOffset, size);
  }
  // ApplyGlobalTintToPaletteEntries (FRLG-only, no-op pour Emerald).
}

/** Flatten N palette banks (16 colors each) en un seul Uint16Array. */
function flattenPaletteBanks(banks: Uint16Array[], startBank: number, endBank: number): Uint16Array {
  const numBanks = endBank - startBank;
  const out = new Uint16Array(numBanks * 16);
  for (let b = 0; b < numBanks; b++) {
    const src = banks[startBank + b];
    if (src) out.set(src.subarray(0, 16), b * 16);
  }
  return out;
}

/** 1:1 décomp `CopyMapTilesetsToVram(mapLayout)` (fieldmap.c:925-932). */
export function CopyMapTilesetsToVram(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  CopyTilesetToVram(mapLayout.primaryTileset, NUM_TILES_IN_PRIMARY, 0);
  CopyTilesetToVram(mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
}

/** 1:1 décomp `LoadMapTilesetPalettes(mapLayout)` (fieldmap.c:934-941).
 *  Banks 0-5 primary + banks 6-12 secondary = 13 banks total = 13 * 16 colors
 *  = 208 entries dans gPlttBuffer (BG slots 0-207).
 *
 *  Notre BG_PLTT_ID(N) = N*16 (= flat index dans gPlttBuffer 0-255). */
export function LoadMapTilesetPalettes(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  const PLTT_SIZE_4BPP = 32;  // 16 colors * 2 bytes = 32 bytes per bank
  // BG_PLTT_ID(0) = 0
  LoadTilesetPalette(mapLayout.primaryTileset, 0, NUM_PALS_IN_PRIMARY * PLTT_SIZE_4BPP);
  // BG_PLTT_ID(NUM_PALS_IN_PRIMARY=6) = 96
  LoadTilesetPalette(mapLayout.secondaryTileset,
    NUM_PALS_IN_PRIMARY * 16,
    (NUM_PALS_TOTAL - NUM_PALS_IN_PRIMARY) * PLTT_SIZE_4BPP);
}

// ─── 1:1 décomp field_camera.c DrawMetatile + DrawWholeMapView ──────────────

/** Tilemap buffers BG1/BG2/BG3 (= 32x32 u16 = 1024 entries each).
 *  1:1 décomp `gOverworldTilemapBuffer_Bg1/Bg2/Bg3`. Écrits par DrawMetatile,
 *  copiés en VRAM mapBase via flushOverworldTilemaps().
 *
 *  Note : décomp utilise BG3 = bottom, BG2 = middle, BG1 = top. Notre rt.gba
 *  expose bg(1).tilemap, bg(2).tilemap, bg(3).tilemap qui sont des views
 *  Uint16Array sur la VRAM unifié. On peut donc écrire directement dans ces
 *  views — mais on garde un buffer séparé pour matcher décomp + permettre les
 *  scrolls partiels via copyBGToVRAM. */
const gOverworldTilemapBuffer_Bg1 = new Uint16Array(32 * 32);
const gOverworldTilemapBuffer_Bg2 = new Uint16Array(32 * 32);
const gOverworldTilemapBuffer_Bg3 = new Uint16Array(32 * 32);

/** 1:1 décomp `DrawMetatile(layerType, tiles, offset)` (field_camera.c:245-310).
 *  Place les 8 BG tiles d'un metatile dans les 3 BG layers selon layerType. */
export function DrawMetatile(layerType: number, tiles: Uint16Array, tilesOffset: number, mapOffset: number): void {
  // tilesOffset = index dans tiles[] où démarrent les 8 u16 du metatile (= metatileId * 8).
  // mapOffset = position dans le 32x32 BG screen (= y*32 + x). Le metatile occupe
  //             4 BG tiles : (mapOffset, mapOffset+1, mapOffset+0x20, mapOffset+0x21).
  const t = tiles;
  const o = tilesOffset;
  const m = mapOffset;

  switch (layerType) {
    case METATILE_LAYER_TYPE_SPLIT:
      // Bottom 4 → BG3
      gOverworldTilemapBuffer_Bg3[m] = t[o];
      gOverworldTilemapBuffer_Bg3[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg3[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg3[m + 0x21] = t[o + 3];
      // Middle = transparent
      gOverworldTilemapBuffer_Bg2[m] = 0;
      gOverworldTilemapBuffer_Bg2[m + 1] = 0;
      gOverworldTilemapBuffer_Bg2[m + 0x20] = 0;
      gOverworldTilemapBuffer_Bg2[m + 0x21] = 0;
      // Top 4 → BG1
      gOverworldTilemapBuffer_Bg1[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg1[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg1[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg1[m + 0x21] = t[o + 7];
      break;

    case METATILE_LAYER_TYPE_COVERED:
      // Bottom 4 → BG3
      gOverworldTilemapBuffer_Bg3[m] = t[o];
      gOverworldTilemapBuffer_Bg3[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg3[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg3[m + 0x21] = t[o + 3];
      // Top 4 → BG2
      gOverworldTilemapBuffer_Bg2[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg2[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg2[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg2[m + 0x21] = t[o + 7];
      // Top BG1 = transparent
      gOverworldTilemapBuffer_Bg1[m] = 0;
      gOverworldTilemapBuffer_Bg1[m + 1] = 0;
      gOverworldTilemapBuffer_Bg1[m + 0x20] = 0;
      gOverworldTilemapBuffer_Bg1[m + 0x21] = 0;
      break;

    case METATILE_LAYER_TYPE_NORMAL:
    default:
      // 1:1 décomp : "garbage" pattern 0x3014 sur BG3 (= caché par BG2 normalement).
      gOverworldTilemapBuffer_Bg3[m] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 1] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 0x20] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 0x21] = 0x3014;
      // Bottom 4 → BG2
      gOverworldTilemapBuffer_Bg2[m] = t[o];
      gOverworldTilemapBuffer_Bg2[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg2[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg2[m + 0x21] = t[o + 3];
      // Top 4 → BG1 (couvre player)
      gOverworldTilemapBuffer_Bg1[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg1[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg1[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg1[m + 0x21] = t[o + 7];
      break;
  }
}

/** 1:1 décomp `DrawMetatileAt(mapLayout, offset, x, y)` (field_camera.c:226-243).
 *  Lookup metatileId via MapGridGetMetatileIdAt(x, y) puis dispatch dans le bon
 *  tileset (primary / secondary) pour récupérer les 8 u16 BG tiles. */
export function DrawMetatileAt(mapLayout: MapLayout, mapOffset: number, x: number, y: number): void {
  let metatileId = MapGridGetMetatileIdAt(x, y);
  let metatiles: Uint16Array;
  if (metatileId > NUM_METATILES_TOTAL) metatileId = 0;
  if (metatileId < NUM_METATILES_IN_PRIMARY) {
    metatiles = mapLayout.primaryTileset.metatiles;
  } else {
    metatiles = mapLayout.secondaryTileset.metatiles;
    metatileId -= NUM_METATILES_IN_PRIMARY;
  }
  DrawMetatile(MapGridGetMetatileLayerTypeAt(x, y), metatiles, metatileId * NUM_TILES_PER_METATILE, mapOffset);
}

/** 1:1 décomp `DrawWholeMapViewInternal(x, y, mapLayout)` (field_camera.c:100-121).
 *  Draw les 16x16 metatiles visibles (= 32x32 BG tiles = 256x256 px). Position
 *  (x, y) = top-left metatile coord dans gBackupMapLayout. xTileOffset/yTileOffset
 *  = 0 par défaut (= no scroll wrap). */
export function DrawWholeMapView(camX: number, camY: number, mapLayout: MapLayout): void {
  // 1:1 décomp : i de 0 à 32 par pas de 2 (= 16 metatiles), j de 0 à 32 par pas
  // de 2. Chaque metatile occupe 2x2 BG tiles dans le screen 32x32.
  for (let i = 0; i < 32; i += 2) {
    const ty = i;  // BG tile row (= xTileOffset = 0 simplification)
    const r6 = ty * 32;
    for (let j = 0; j < 32; j += 2) {
      const tx = j;  // BG tile col
      DrawMetatileAt(mapLayout, r6 + tx, camX + j / 2, camY + i / 2);
    }
  }
}

/** Push les 3 tilemap buffers BG1/BG2/BG3 vers la VRAM mapBase respective.
 *  À call après DrawWholeMapView ou DrawMetatileAt. */
export function flushOverworldTilemaps(rt: DecompRuntime): void {
  // BG1 mapBase = e.g. 28 (= mapBaseIndex 28 → VRAM offset 28 * 0x800 = 0xE000).
  // bg(N).tilemap est un Uint16Array view sur la VRAM unifié à l'offset mapBase.
  rt.gba.bg(1).tilemap.set(gOverworldTilemapBuffer_Bg1);
  rt.gba.bg(2).tilemap.set(gOverworldTilemapBuffer_Bg2);
  rt.gba.bg(3).tilemap.set(gOverworldTilemapBuffer_Bg3);
}

/** Reset les buffers tilemap (= clear). À call avant DrawWholeMapView pour
 *  éviter résidu de map précédente. */
export function clearOverworldTilemaps(): void {
  gOverworldTilemapBuffer_Bg1.fill(0);
  gOverworldTilemapBuffer_Bg2.fill(0);
  gOverworldTilemapBuffer_Bg3.fill(0);
}

// ─── 1:1 décomp camera helpers (subset, pour test) ──────────────────────────

/** 1:1 décomp `SetCameraFocusCoords(x, y)` (fieldmap.c:792-796).
 *  Note : décomp utilise gSaveBlock1Ptr->pos. Phase 4.1 simplification :
 *  variables locales au module (= pas de save game encore). */
let _camFocusX = 0;
let _camFocusY = 0;
export function SetCameraFocusCoords(x: number, y: number): void {
  _camFocusX = x - MAP_OFFSET;
  _camFocusY = y - MAP_OFFSET;
}

/** 1:1 décomp `GetCameraFocusCoords(x, y)` (fieldmap.c:798-802). */
export function GetCameraFocusCoords(): { x: number; y: number } {
  return { x: _camFocusX + MAP_OFFSET, y: _camFocusY + MAP_OFFSET };
}

/** Returns the current backup map camera origin (= top-left of view in
 *  gBackupMapLayout coords). Used by DrawWholeMapView. */
export function GetCameraBackupCoords(): { x: number; y: number } {
  return { x: _camFocusX, y: _camFocusY };
}

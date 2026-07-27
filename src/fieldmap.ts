/**
 * fieldmap.ts — miroir 1:1 décomp `src/fieldmap.c` (moteur de map overworld).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/fieldmap.c` (= InitMap,
 *     InitMapFromSavedGame, MapGridGet* + MapGridSet*, SaveMapView,
 *     LoadSavedMapView, MoveMapViewToBackup, GetMapBorderIdAt,
 *     GetPostCameraMoveMapBorderId,
 *     CanCameraMoveInDirection, SetPositionFromConnection, GetIncomingConnection,
 *     GetMapConnectionAtPos, SetCameraFocusCoords, CopyMapTilesetsToVram,
 *     LoadMapTilesetPalettes)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (= struct
 *     Tileset, MapLayout, MapHeader, MapEvents, masks/shifts)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/fieldmap.h` (= constantes
 *     NUM_TILES_*, NUM_PALS_*, MAP_OFFSET, MAX_MAP_DATA_SIZE)
 *
 * Voisins décomp (= NE sont PAS ici) : le RENDU des metatiles (DrawMetatile,
 * DrawWholeMapView, RedrawMapSlice*, DrawMetatileAt) est dans `field-camera.ts`
 * (field_camera.c) ; `GetMapConnection(dir)` est dans `game/overworld.ts`
 * (overworld.c:740).
 *
 * ── DÉVIATION assumée (couche de chargement async maison) ──
 * Le décomp suppose les données de map déjà mappées en ROM (accès sync). Notre
 * port FETCH les assets extraits par scripts/extract-decomp-all.mjs ; cette
 * couche async (loadTileset / loadLayout / loadMapHeader / loadMapByName) + les
 * hooks d'intégration scene (setOnLoadMapScriptHook / setRedrawWholeMapViewHook)
 * n'ont pas d'équivalent décomp = glu maison nécessaire (≈ le ROM mapping). Une
 * fois loadMapByName() résolu, InitMap + MapGridGet* tournent sync 1:1 strict.
 *
 * Données consommées :
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
 * VRAM layout (1:1 décomp fieldmap.c) :
 *   - charBase 0 : tileset tiles (= primary 0..511 puis secondary 512..1023).
 *     Chaque tile = 32 bytes (4bpp 8x8). Total = 1024 × 32 = 32 KB.
 *   - mapBase BG1/BG2/BG3 : 32x32 u16 tilemaps = 2 KB each (écrits par le rendu
 *     dans field-camera.ts).
 *
 * Palette banks (1:1 décomp BG_PLTT_ID) :
 *   - Banks 0-5 : primary tileset palettes[0..5]
 *   - Banks 6-12 : secondary tileset palettes[6..12]
 *   - Banks 13-15 : réservé (text windows, sprites overflow, etc.)
 */
import { LoadBgTiles, LoadPalette } from '../harness/runtime/decomp-globals';
import { extractPngPlte, loadIndexedPngStrict } from '../harness/gba/png-loader';
import { setPrimaryTilesetAnimCallback, setSecondaryTilesetAnimCallback } from './tileset_anims';
import { GenerateBattlePyramidFloorLayout } from './battle_pyramid';
import { GenerateTrainerHillFloorLayout } from './trainer_hill';
// Étape 5 SAVE-SYSTEM-1TO1 : `gSaveBlock1Ptr->mapView` (= le SEUL array u16[256]
// utilisé par SaveMapView/LoadSavedMapView/MoveMapViewToBackup ; 1:1 décomp).
import { GetSaveBlock1 } from './save';
// Chantier OW 1:1 — `gSaveBlock1Ptr->pos` (= Coords16, global.h:992) source unique
// pour camera focus + player logical position. Refactor SaveMapView/MoveMapViewTo
// Backup/CameraMove 1:1 strict décomp lit/écrit cette pos au lieu de prendre des
// args (= élimine désync historique cam.x ≠ player.x).
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { DIR_TO_DX, DIR_TO_DY } from './event_object_movement';
import { BERRY_TREE_ID_BY_NAME } from '../include/constants/berry';
import {
  CONNECTION_DIVE, CONNECTION_EMERGE, CONNECTION_NONE, CONNECTION_INVALID,
} from '../include/constants/global';
import {
  MetatileBehavior_IsLongGrass_Duplicate,
  MetatileBehavior_IsLongGrassSouthEdge,
} from './metatile_behavior';
import {
  METATILE_General_Grass,
  METATILE_Fortree_LongGrass_Root,
  METATILE_Fortree_SecretBase_LongGrass_BottomLeft,
  METATILE_Fortree_SecretBase_LongGrass_BottomMid,
  METATILE_Fortree_SecretBase_LongGrass_BottomRight,
  METATILE_Fortree_SecretBase_LongGrass_TopLeft,
  METATILE_Fortree_SecretBase_LongGrass_TopMid,
  METATILE_Fortree_SecretBase_LongGrass_TopRight,
  METATILE_SecretBase_SandOrnament_Top,
  METATILE_SecretBase_SandOrnament_TopWall,
  METATILE_SecretBase_SandOrnament_Base1,
  METATILE_SecretBase_BreakableDoor_TopClosed,
  METATILE_SecretBase_BreakableDoor_BottomClosed,
} from '../include/constants/metatile_labels';

// ─── Hook registry RunOnLoadMapScript (HOISTÉ — anti-TDZ) ───────────────────
//
// Set par script-runtime.ts (qui sait parser/run les map_scripts entries) ;
// map-loader évite l'import direct via ce registre. ⚠️ DOIT être déclaré ICI,
// avant TOUT autre import lourd : étape 5 SAVE-SYSTEM-1TO1 a ajouté des imports
// (save-system, metatile-behavior-helpers) qui changent l'ordre d'init du cycle
// map-loader↔script-runtime ; script-runtime appelle `setOnLoadMapScriptHook`
// à son top-level PENDANT l'évaluation de map-loader. Si le `let` était plus
// bas → ReferenceError TDZ « Cannot access '_runOnLoadMapScriptHook' before
// initialization » → tout le bundle crash au boot. Hoisté = initialisé tôt.
// ⚠️ `var` (PAS `let`) volontaire : ESM hoiste `var` et l'initialise à
// `undefined` AU DÉBUT de l'évaluation du module, AVANT que la chaîne d'imports
// (qui re-entre map-loader via le cycle script-runtime/field-camera et appelle
// ces setters à leur top-level) ne s'exécute. Avec `let`, la liaison reste en
// TDZ tant que sa ligne n'a pas tourné → ReferenceError au boot (étape 5 a
// ajouté des imports qui ré-ordonnent le cycle). `var` = registry-hook
// tolérant aux cycles, 0 changement de comportement runtime.
// eslint-disable-next-line no-var
var _runOnLoadMapScriptHook: (() => void) | null = null;
export function setOnLoadMapScriptHook(fn: () => void): void {
  _runOnLoadMapScriptHook = fn;
}

/** Phase 4.10 hook registry : déclenche un BG redraw après que
 *  `InitBackupMapLayoutConnections` ait été re-run (= TransitionToConnection
 *  retry async). Hook setté par field-camera.ts:696 à son top-level → `var`
 *  hoisté (même anti-TDZ que ci-dessus). */
// eslint-disable-next-line no-var
var _redrawWholeMapViewHook: (() => void) | null = null;
export function setRedrawWholeMapViewHook(fn: () => void): void {
  _redrawWholeMapViewHook = fn;
}

// ─── DEVTOOLS debug maps (hors 1:1 ; jamais armé en prod) ────────────────────
// Point d'accroche MINIMAL pour les cartes de test devtools (MAP_DEBUG_*). Le
// registre vit côté harness (harness/devtools/debug-maps.ts) et n'écrit RIEN
// dans public/decomp/em (données du jeu intactes) : il fabrique un MapHeader en
// mémoire à partir des tilesets EXISTANTS (loadTileset). Le provider n'est armé
// que si le harness appelle setDebugMapProvider (installDebugMaps) — en prod il
// reste null et ce chemin est un no-op total. `var` hoisté = même anti-TDZ que
// les hooks ci-dessus (le harness peut l'armer tôt).
// eslint-disable-next-line no-var
var _debugMapProvider: ((mapId: string) => Promise<MapHeader | null>) | null = null;
export function setDebugMapProvider(fn: ((mapId: string) => Promise<MapHeader | null>) | null): void {
  _debugMapProvider = fn;
}

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
  /** Tileset name (= chemin normalisé, ex: "general", "petalburg"). Extension
   *  non-décomp pour permettre le routing des callbacks d'animation. */
  name: string;
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
  /** Raw local_id from JSON (e.g. 'LOCALID_LITTLEROOT_MOM'). Empty string if no
   *  local_id specified in source map JSON. Used by movement-system pour résoudre
   *  applymovement LOCALID_X args vers le bon ObjectEvent. */
  localIdRaw: string;
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
  /** 1:1 décomp BG_EVENT_HIDDEN_ITEM (bgUnion packé) : nom du flag anti-re-ramassage
   *  (= gSpecialVar_0x8004) + item caché (= gSpecialVar_0x8005). Undefined si non-hidden. */
  hiddenItemFlag?: string;
  hiddenItemId?: string;
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
    name: dir,
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

/** 1:1 décomp `include/constants/trainer_types.h`. Résout la string du map JSON
 *  (`trainer_type`) → id numérique (packé dans ObjectEvent.trainerType). */
function parseTrainerType(s: string | undefined): number {
  const map: Record<string, number> = {
    TRAINER_TYPE_NONE: 0,
    TRAINER_TYPE_NORMAL: 1,
    TRAINER_TYPE_SEE_ALL_DIRECTIONS: 2,
    TRAINER_TYPE_BURIED: 3,
  };
  if (s === undefined || s === '') return 0;
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

/** Résout le champ packé `trainer_sight_or_berry_tree_id` (string JSON) en number :
 *  "7" → 7 (trainer sight range), "BERRY_TREE_ROUTE_104_CHERI_1" → 8 (berryTreeId),
 *  "0"/vide → 0. */
function _resolveBerryOrSightId(raw: string | undefined): number {
  if (!raw) return 0;
  const s = raw.trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return BERRY_TREE_ID_BY_NAME[s] ?? 0;
}

/** Async load d'un map header depuis `/decomp/em/maps/<MapName>.json`.
 *  Note : le JSON utilise `id` au format `MAP_X_Y` mais le fichier filename
 *  est `MapName.json` (= camelCase). On utilise `map-ids.json` pour mapper. */
export async function loadMapHeader(mapId: string): Promise<MapHeader> {
  const cached = mapHeaderCache.get(mapId);
  if (cached) return cached;

  // DEVTOOLS debug maps : MAP_DEBUG_* servi par le registre harness (aucun fetch
  // dans public/decomp/em). No-op en prod (provider jamais armé). Cf. setDebugMapProvider.
  if (_debugMapProvider && mapId.startsWith('MAP_DEBUG_')) {
    const provided = await _debugMapProvider(mapId);
    if (provided) { mapHeaderCache.set(mapId, provided); return provided; }
  }

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
      // Note : dest_warp_id est sérialisé `string` (= "1") dans les JSON décomp.
      // À runtime on parseInt() pour matcher le type WarpEvent.warpId: number.
      dest_map: string; dest_warp_id: string | number;
    }>;
    coord_events?: Array<{
      type: string; x: number; y: number; elevation: number;
      var?: string; var_value?: string; script?: string;
      // type === 'weather' : la coord event pose une météo (COORD_EVENT_WEATHER_*).
      weather?: string;
    }>;
    bg_events?: Array<{
      type: string; x: number; y: number; elevation: number;
      player_facing_dir?: string; script?: string;
      // 1:1 décomp BG_EVENT_HIDDEN_ITEM : le flag anti-re-ramassage + l'item caché
      // (le décomp les packe dans bgUnion.script ; notre JSON les donne nommés).
      flag?: string; item?: string;
    }>;
  };

  const layout = await loadLayout(json.layout);

  // Build events (= localId auto-assigné en index si non fourni).
  const objectEvents: ObjectEventTemplate[] = (json.object_events ?? []).map((e, i) => ({
    // 1:1 décomp : localId = index dans le array (1-based, 0 = LOCALID_NONE).
    // Les constants LOCALID_X (= e.local_id) résolvent à cet index au compile-time
    // dans le décomp. On l'assigne ici uniformly (= peu importe si localIdRaw set).
    localId: i + 1,
    // FIX localId↔localIdRaw : les opcodes (removeobject/applymovement/…) matchent par
    // `localIdRaw` (string), mais `gSpecialVar_LastTalked = objectEvent.localId` (number). Un objet
    // SANS constante `local_id` nommée (= arbre coupable, rocher Rock Smash…) avait localIdRaw=''
    // → `VAR_LAST_TALKED` (= localId 1) ne résolvait vers AUCUN localIdRaw → removeobject échouait
    // (arbre jamais retiré après Cut). On donne un localIdRaw SYNTHÉTIQUE unique `__LOCALID_<n>`
    // (préfixe `__` = zéro collision avec un vrai LOCALID_X) → template + objet spawné cohérents,
    // `resolveObjectLocalIdRaw` (fallback par localId numérique) retourne ce synthétique → match OK.
    localIdRaw: e.local_id ?? `__LOCALID_${i + 1}`,
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
    // 1:1 décomp : champ packé `trainerRange_berryTreeId` = trainer sight range
    // (trainers, valeur numérique) OU berryTreeId (berry trees, constante
    // `BERRY_TREE_ROUTE_*`). La source JSON met une string : "7" (sight) ou
    // "BERRY_TREE_ROUTE_104_CHERI_1" (id berry) ou "0". Résolu ici (= était
    // hardcodé à 0 → toutes les berry trees lisaient berryTrees[0]).
    // 1:1 décomp : trainerType (TRAINER_TYPE_NORMAL/SEE_ALL_DIRECTIONS/BURIED) résolu
    // depuis le map JSON — requis par l'aggro dresseurs (CheckForTrainersWantingBattle).
    trainerType: parseTrainerType(e.trainer_type),
    trainerRange_berryTreeId: _resolveBerryOrSightId(e.trainer_sight_or_berry_tree_id),
    script: e.script,
    flagId: e.flag,
  }));

  const warps: WarpEvent[] = (json.warp_events ?? []).map(w => ({
    x: w.x, y: w.y, elevation: w.elevation,
    // HOTFIX P2 : dest_warp_id arrive en string ("1"), parseInt pour matcher
    // le type number et éviter les bugs futurs sur arithmétique (= "1"+1="11").
    warpId: typeof w.dest_warp_id === 'string' ? parseInt(w.dest_warp_id, 10) : w.dest_warp_id,
    destMap: w.dest_map,
  }));

  // 1:1 décomp `struct CoordEvent` : un coord event est SOIT un trigger de script
  // (type 'trigger' : var/var_value/script) SOIT un trigger de météo (type 'weather' :
  // script == NULL côté décomp, `trigger` = COORD_EVENT_WEATHER_*). On garde les DEUX
  // (avant : les weather étaient jetés → la cendre Route 113 ne se posait jamais en
  // marchant). Pour les weather : script='' + trigger=la constante météo (1:1 décomp
  // qui range la météo dans le champ trigger quand script est NULL).
  const coordEvents: CoordEvent[] = (json.coord_events ?? [])
    .filter(c => c.type === 'trigger' || c.type === 'weather')
    .map(c => (c.type === 'weather'
      ? { x: c.x, y: c.y, elevation: c.elevation, trigger: c.weather ?? '', index: 0, script: '' }
      : {
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
    hiddenItemFlag: b.flag,
    hiddenItemId: b.item,
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

/** Accès SYNC au cache des map headers (clé = constante 'MAP_*'). Consommé par
 *  `Overworld_GetMapHeaderByGroupAndId` (overworld.ts) — la décomp lit
 *  `gMapGroups[group][num]` en ROM (sync) ; notre équivalent est ce cache,
 *  peuplé par `loadMapHeader` (boot + prefetch connexions depth 2 + pré-chargement
 *  du header destination avant un warp, executeWarp Phase 2). Retourne null si
 *  la map n'a jamais été chargée. */
export function getCachedMapHeader(mapId: string): MapHeader | null {
  return mapHeaderCache.get(mapId) ?? null;
}

/** Pré-load complet d'une map (= tilesets + layout + header + connexions).
 *  Set `gMapHeader`. Synchroniquement disponible après.
 *
 *  Phase 4.8 : prefetch les map headers de toutes les connexions (depth 1)
 *  pour que `InitBackupMapLayoutConnections` (= sync) puisse les lire dans le
 *  cache. Sans ce prefetch, les border tiles seraient MAPGRID_UNDEFINED →
 *  visuel cassé + collision wall au lieu de peek vers la map adjacente.
 *
 *  Phase 4.10 fix bug 1 (= "connections disparaissent au hasard") : extend
 *  prefetch à DEPTH 2 (= connections of connections). Critique car
 *  TransitionToConnection est SYNC : il appelle InitBackupMapLayoutConnections
 *  immédiatement après le swap, donc les connections de la NEW map doivent
 *  être déjà cached AU MOMENT du swap pour que les borders se remplissent.
 *
 *  Sans depth 2 : cross-border vers Route 101 → InitMap appelle FillN avec
 *  Oldale, qui n'est pas cached → warning + border laissé à MAPGRID_UNDEFINED
 *  → bord nord de Route 101 visuel cassé jusqu'au prochain re-init.
 *
 *  Avec depth 2 : Bourg → prefetch depth 1 (= Route 101) + depth 2 (= Oldale,
 *  via Route 101's connections). Quand on cross vers Route 101, FillS(Bourg)
 *  + FillN(Oldale) tous deux succès. */
export async function loadMapByName(mapId: string): Promise<MapHeader> {
  const header = await loadMapHeader(mapId);

  // Prefetch immediate connections (= depth 1). Cache les headers + layouts
  // pour que InitBackupMapLayoutConnections puisse les lire sync. Skip dive/
  // emerge (= 5/6) qui ne sont pas des border fills. Errors silencieuses (=
  // si la connection map n'existe pas, on log warning + skip cette connexion
  // dans Fill*Connection).
  if (header.connections.length > 0) {
    const depth1Headers = await Promise.all(
      header.connections
        .filter(c => c.direction >= CONNECTION_SOUTH && c.direction <= CONNECTION_EAST)
        .map(c => loadMapHeader(c.destMap).catch((e: unknown) => {
          console.warn(`[map-loader] failed to prefetch connection ${c.destMap}:`, e);
          return null;
        })),
    );

    // Phase 4.10 fix bug 1 : depth 2 prefetch. Pour chaque connection depth-1
    // chargée, prefetch SES connections (= les maps qu'on atteindra au prochain
    // cross-border). Ça évite que `TransitionToConnection.InitMap` voie ces
    // maps comme "not cached" → FillX skipped → bord du nouvelle map cassé.
    const depth2Targets = new Set<string>();
    for (const h of depth1Headers) {
      if (!h) continue;
      for (const c of h.connections) {
        if (c.direction >= CONNECTION_SOUTH && c.direction <= CONNECTION_EAST) {
          // Skip self-reference (= back to current map, déjà cached).
          if (c.destMap === header.id) continue;
          depth2Targets.add(c.destMap);
        }
      }
    }
    if (depth2Targets.size > 0) {
      await Promise.all(
        [...depth2Targets].map(destMap => loadMapHeader(destMap).catch((e: unknown) => {
          console.warn(`[map-loader] failed to prefetch depth-2 connection ${destMap}:`, e);
          return null;
        })),
      );
    }
  }

  gMapHeader = header;
  // Audit Opus §3.3 : expose globalThis pour script-runtime.RunOnLoadMapScript
  // (= évite circular import map-loader ↔ script-runtime).
  (globalThis as Record<string, unknown>).gMapHeader = header;
  return header;
}

/** ADAPTATION ROM→fetch : setter pour `gMapHeader`. En ROM, `LoadCurrentMapData` /
 *  `LoadSaveblockMapHeader` (overworld.c) font `gMapHeader = *Overworld_GetMapHeader...`
 *  (copie de struct sync) ; `gMapHeader` étant un export `let`, un autre module ne peut
 *  pas le réassigner directement en ESM. Ce setter réplique le pattern interne de
 *  `loadMapByName` (`gMapHeader = h` + miroir globalThis) et est consommé par les deux
 *  fonctions ci-dessus sur un header DÉJÀ préchargé par le harness (cf. executeWarp). */
export function SetGMapHeader(header: MapHeader): void {
  gMapHeader = header;
  (globalThis as Record<string, unknown>).gMapHeader = header;
}

// ─── 1:1 décomp fieldmap.c InitMap pipeline ─────────────────────────────────
// (_runOnLoadMapScriptHook + setOnLoadMapScriptHook sont HOISTÉS en tête de
//  module — cf. juste après les imports — pour éviter une TDZ : étape 5 a
//  ajouté des imports (save-system/metatile-behavior-helpers) qui ré-ordonnent
//  le cycle map-loader↔script-runtime, et script-runtime appelle
//  setOnLoadMapScriptHook PENDANT l'init de map-loader.)

// _redrawWholeMapViewHook + setRedrawWholeMapViewHook : HOISTÉS en tête de
// module (cf. juste après les imports), même raison TDZ que
// _runOnLoadMapScriptHook (field-camera.ts:696 appelle setRedrawWholeMapViewHook
// à son top-level pendant l'init du cycle).

/** 1:1 décomp `InitMap()` (fieldmap.c:71-76).
 *  Init layout data + run on-load script + secret base entrance metatiles.
 *
 *  Audit Opus §3.3 : `RunOnLoadMapScript` était commenté TODO Phase 4.7 mais
 *  est nécessaire pour les map_scripts entries `MAP_SCRIPT_ON_LOAD` qui
 *  modifient le map au load (= setdooropen, hide/show NPCs). Maintenant
 *  wired via hook registry. */
export function InitMap(): void {
  if (!gMapHeader) throw new Error('InitMap: gMapHeader is null (call loadMapByName first)');
  InitMapLayoutData(gMapHeader);
  // SetOccupiedSecretBaseEntranceMetatiles(gMapHeader.events);  // TODO Phase 4.7
  // 1:1 décomp `RunOnLoadMapScript` (fieldmap.c:75) — script-runtime sait
  // dispatch via mapScripts entries. Audit session 125 : auparavant on
  // skippait ce hook en mode restore option menu pour éviter corruption tile
  // (= setmetatile + VarGet=0 sur METATILE_* writes 0/wall). Maintenant que
  // VarGet resolve les constants via decomp-constants table (= 1:1 ROM
  // assembleur compile-time resolution), le hook fonctionne et on peut le
  // re-enable.
  if (_runOnLoadMapScriptHook) _runOnLoadMapScriptHook();
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

/** Connection flags : tracking de quelles directions ont une connexion sur la
 *  map courante. Lu par `GetMapBorderIdAt` pour décider si une position dans
 *  la zone border map vers une connexion ou est invalide.
 *  1:1 décomp `sMapConnectionFlags` (fieldmap.c). */
const sMapConnectionFlags = { south: false, north: false, west: false, east: false };

export function GetMapConnectionFlags(): Readonly<typeof sMapConnectionFlags> {
  return sMapConnectionFlags;
}

/** 1:1 décomp `GetMapHeaderFromConnection(connection)` (fieldmap.c:66-69) :
 *    return Overworld_GetMapHeaderByGroupAndId(connection->mapGroup, connection->mapNum);
 *  Adaptation modèle : notre identité-map est un mapId string (`connection.destMap`) et nos
 *  headers sont indexés par string dans `mapHeaderCache` (pas de table mapGroup/mapNum). Le
 *  résultat est identique (le header de la map pointée par la connexion). Renvoie null si la
 *  map n'est pas (encore) en cache (= prefetch manqué ; les appelants gèrent déjà le null). */
export function GetMapHeaderFromConnection(connection: MapConnection): MapHeader | null {
  return mapHeaderCache.get(connection.destMap) ?? null;
}

/** 1:1 décomp `InitBackupMapLayoutConnections(mapHeader)` (fieldmap.c:133-169).
 *  Pour chaque connexion (south/north/west/east), copie les metatiles de la
 *  map connectée dans la border area de gBackupMapLayout via FillX_Connection.
 *
 *  Prérequis : les map headers des connexions doivent être déjà loadés en
 *  cache (= via `loadMapByName` qui prefetch les connexions).
 *  Si un header de connexion manque (= pas en cache, pas de await possible
 *  ici car InitMap est sync), on log un warning + skip cette connexion. */
function InitBackupMapLayoutConnections(mapHeader: MapHeader): void {
  // Reset flags pour la new map.
  sMapConnectionFlags.south = false;
  sMapConnectionFlags.north = false;
  sMapConnectionFlags.west = false;
  sMapConnectionFlags.east = false;

  if (!mapHeader.connections || mapHeader.connections.length === 0) return;

  for (const connection of mapHeader.connections) {
    const cMap = GetMapHeaderFromConnection(connection);
    if (!cMap) {
      console.warn(`[map-loader] connection ${connection.destMap} not in cache, skipping fill (= prefetch missed)`);
      continue;
    }
    const offset = connection.offset;
    switch (connection.direction) {
      case CONNECTION_SOUTH:
        FillSouthConnection(mapHeader, cMap, offset);
        sMapConnectionFlags.south = true;
        break;
      case CONNECTION_NORTH:
        FillNorthConnection(mapHeader, cMap, offset);
        sMapConnectionFlags.north = true;
        break;
      case CONNECTION_WEST:
        FillWestConnection(mapHeader, cMap, offset);
        sMapConnectionFlags.west = true;
        break;
      case CONNECTION_EAST:
        FillEastConnection(mapHeader, cMap, offset);
        sMapConnectionFlags.east = true;
        break;
      // dive/emerge (5/6) : skipped (= pas de border fill, juste warps).
    }
  }
}

// 1:1 décomp `CONNECTION_*` constants (constants/global.h).
export const CONNECTION_SOUTH = 1;
export const CONNECTION_NORTH = 2;
export const CONNECTION_WEST = 3;
export const CONNECTION_EAST = 4;

/** 1:1 décomp `FillConnection(x, y, connectedMapHeader, x2, y2, width, height)`
 *  (fieldmap.c:171-188). Copy `width * height` metatiles depuis la connection
 *  map à (x2, y2) vers gBackupMapLayout à (x, y). */
function FillConnection(
  x: number, y: number,
  cMap: MapHeader,
  x2: number, y2: number,
  width: number, height: number,
): void {
  const cMapWidth = cMap.mapLayout.width;
  const src = cMap.mapLayout.map;
  const destWidth = gBackupMapLayout.width;

  for (let i = 0; i < height; i++) {
    const srcOffset = (y2 + i) * cMapWidth + x2;
    const destOffset = (y + i) * destWidth + x;
    sBackupMapData.set(src.subarray(srcOffset, srcOffset + width), destOffset);
  }
}

/** 1:1 décomp `FillSouthConnection` (fieldmap.c:190-227). Fills the bottom
 *  border (= rows mapHeight+MAP_OFFSET..) avec les top rows de la connected map. */
function FillSouthConnection(mapHeader: MapHeader, cMap: MapHeader, offset: number): void {
  const cWidth = cMap.mapLayout.width;
  let x = offset + MAP_OFFSET;
  const y = mapHeader.mapLayout.height + MAP_OFFSET;
  let x2: number;
  let width: number;

  if (x < 0) {
    x2 = -x;
    x += cWidth;
    width = (x < gBackupMapLayout.width) ? x : gBackupMapLayout.width;
    x = 0;
  } else {
    x2 = 0;
    width = (x + cWidth < gBackupMapLayout.width) ? cWidth : gBackupMapLayout.width - x;
  }

  if (width > 0) FillConnection(x, y, cMap, x2, 0, width, MAP_OFFSET);
}

/** 1:1 décomp `FillNorthConnection` (fieldmap.c:229-268). Fills the top border
 *  (= rows 0..MAP_OFFSET-1) avec les bottom rows de la connected map. */
function FillNorthConnection(mapHeader: MapHeader, cMap: MapHeader, offset: number): void {
  const cWidth = cMap.mapLayout.width;
  const cHeight = cMap.mapLayout.height;
  let x = offset + MAP_OFFSET;
  const y2 = cHeight - MAP_OFFSET;
  let x2: number;
  let width: number;

  if (x < 0) {
    x2 = -x;
    x += cWidth;
    width = (x < gBackupMapLayout.width) ? x : gBackupMapLayout.width;
    x = 0;
  } else {
    x2 = 0;
    width = (x + cWidth < gBackupMapLayout.width) ? cWidth : gBackupMapLayout.width - x;
  }
  // Suppress unused mapHeader warning (used for symmetry with décomp signature).
  void mapHeader;

  if (width > 0) FillConnection(x, 0, cMap, x2, y2, width, MAP_OFFSET);
}

/** 1:1 décomp `FillWestConnection` (fieldmap.c:270-306). Fills the left border. */
function FillWestConnection(mapHeader: MapHeader, cMap: MapHeader, offset: number): void {
  const cWidth = cMap.mapLayout.width;
  const cHeight = cMap.mapLayout.height;
  let y = offset + MAP_OFFSET;
  const x2 = cWidth - MAP_OFFSET;
  let y2: number;
  let height: number;

  if (y < 0) {
    y2 = -y;
    height = (y + cHeight < gBackupMapLayout.height) ? y + cHeight : gBackupMapLayout.height;
    y = 0;
  } else {
    y2 = 0;
    height = (y + cHeight < gBackupMapLayout.height) ? cHeight : gBackupMapLayout.height - y;
  }
  void mapHeader;

  if (height > 0) FillConnection(0, y, cMap, x2, y2, MAP_OFFSET, height);
}

/** 1:1 décomp `FillEastConnection` (fieldmap.c:308-?). Fills the right border. */
function FillEastConnection(mapHeader: MapHeader, cMap: MapHeader, offset: number): void {
  const cHeight = cMap.mapLayout.height;
  const x = mapHeader.mapLayout.width + MAP_OFFSET;
  let y = offset + MAP_OFFSET;
  let y2: number;
  let height: number;

  if (y < 0) {
    y2 = -y;
    height = (y + cHeight < gBackupMapLayout.height) ? y + cHeight : gBackupMapLayout.height;
    y = 0;
  } else {
    y2 = 0;
    height = (y + cHeight < gBackupMapLayout.height) ? cHeight : gBackupMapLayout.height - y;
  }

  // 1:1 décomp `fieldmap.c:341` : width = `MAP_OFFSET + 1` (= 8), NOT `MAP_OFFSET` (= 7).
  // L'extra colonne fill la 8e col du buffer côté EAST. Sans elle, dernière col
  // est MAPGRID_UNDEFINED → tile garbage = "1 case off" sur border EAST cross.
  if (height > 0) FillConnection(x, y, cMap, 0, y2, MAP_OFFSET + 1, height);
}

/** 1:1 décomp `IsCoordInConnectingMap(int coord, int max)` (fieldmap.c:734-740).
 *  Returns TRUE si `coord` est dans `[0, max)`. */
function IsCoordInConnectingMap(coord: number, max: number): boolean {
  return coord >= 0 && coord < max;
}

/** 1:1 décomp `IsPosInConnectingMap(const struct MapConnection *connection, int x, int y)`
 *  (fieldmap.c:742-756). Check si une position (x, y) dans la map source est dans
 *  la connection map's bounds adjusté par offset. */
function IsPosInConnectingMap(connection: MapConnection, x: number, y: number): boolean {
  const cMap = GetMapHeaderFromConnection(connection);
  if (!cMap) return false;
  switch (connection.direction) {
    case CONNECTION_SOUTH:
    case CONNECTION_NORTH:
      return IsCoordInConnectingMap(x - connection.offset, cMap.mapLayout.width);
    case CONNECTION_WEST:
    case CONNECTION_EAST:
      return IsCoordInConnectingMap(y - connection.offset, cMap.mapLayout.height);
  }
  return false;
}

// Note : GetMapConnection (overworld.c:740) est désormais dans `game/overworld.ts`
// (sa vraie maison). GetMapConnectionAtPos ci-dessous reste ici = fieldmap.c:758.

/** 1:1 décomp `GetMapConnectionAtPos(s16 x, s16 y)` (fieldmap.c:758-790).
 *  Returns la connexion appropriée à la position gBackup (x, y), si on est dans
 *  la zone border. Utilisé par metatile dispatch sur les borders pour rerouter
 *  vers la connection map.
 *
 *  Le décomp utilise `CONNECTION_DIVE = 5` et `CONNECTION_EMERGE = 6` pour
 *  surf/dive. Notre port skip ces directions (= pas de surf/dive supportés).
 *  Migré vers imports decomp-data global-data.ts (cleanup B7). */
export function GetMapConnectionAtPos(x: number, y: number): MapConnection | null {
  if (!gMapHeader || !gMapHeader.connections) return null;
  for (const connection of gMapHeader.connections) {
    const direction = connection.direction;
    if ((direction === CONNECTION_DIVE || direction === CONNECTION_EMERGE)
      || (direction === CONNECTION_NORTH && y > MAP_OFFSET - 1)
      || (direction === CONNECTION_SOUTH && y < gMapHeader.mapLayout.height + MAP_OFFSET)
      || (direction === CONNECTION_WEST && x > MAP_OFFSET - 1)
      || (direction === CONNECTION_EAST && x < gMapHeader.mapLayout.width + MAP_OFFSET)) {
      continue;
    }
    if (IsPosInConnectingMap(connection, x - MAP_OFFSET, y - MAP_OFFSET)) {
      return connection;
    }
  }
  return null;
}

/** 1:1 décomp `GetMapBorderIdAt(x, y)` (fieldmap.c:568-605).
 *  Retourne CONNECTION_NORTH/SOUTH/WEST/EAST si (x, y) (= en gBackupMapLayout
 *  coords) est dans la zone border et la connexion existe. Retourne
 *  CONNECTION_NONE si dans la map valide. CONNECTION_INVALID si hors map +
 *  pas de connexion. */
export function GetMapBorderIdAt(x: number, y: number): number {
  if (GetMapGridBlockAt(x, y) === MAPGRID_UNDEFINED) return CONNECTION_INVALID;

  if (x >= (gBackupMapLayout.width - (MAP_OFFSET + 1))) {
    if (!sMapConnectionFlags.east) return CONNECTION_INVALID;
    return CONNECTION_EAST;
  } else if (x < MAP_OFFSET) {
    if (!sMapConnectionFlags.west) return CONNECTION_INVALID;
    return CONNECTION_WEST;
  } else if (y >= (gBackupMapLayout.height - MAP_OFFSET)) {
    if (!sMapConnectionFlags.south) return CONNECTION_INVALID;
    return CONNECTION_SOUTH;
  } else if (y < MAP_OFFSET) {
    if (!sMapConnectionFlags.north) return CONNECTION_INVALID;
    return CONNECTION_NORTH;
  } else {
    return CONNECTION_NONE;
  }
}

// 1:1 décomp `CONNECTION_NONE = 0` et `CONNECTION_INVALID = -1` (include/constants/global.h:147-148).
// Migré vers imports decomp-data global-data.ts (cleanup B7).
// FIX BUG : décomp utilise -1 signed (= 0xFF dans u8 cast), nous utilisons
// directement -1 number TS. Les `=== CONNECTION_INVALID` compares restent
// strict mais valent maintenant `=== -1` (= match le décomp s32 return).

// ─── 1:1 décomp camera focus / coords helpers (fieldmap.c:792-814) ──────────
//
// Source unique pour position joueur + camera focus = `gSaveBlock1Ptr->pos`
// (Coords16, global.h:992). NE PAS dupliquer dans des locals — alias direct.

/** 1:1 décomp `SetCameraFocusCoords(u16 x, u16 y)` (fieldmap.c:792-796). Set
 *  la camera focus à (x - MAP_OFFSET, y - MAP_OFFSET) en map-local coords. */
export function SetCameraFocusCoords(x: number, y: number): void {
  gSaveBlock1Ptr.pos.x = x - MAP_OFFSET;
  gSaveBlock1Ptr.pos.y = y - MAP_OFFSET;
}

/** 1:1 décomp `GetCameraFocusCoords(u16 *x, u16 *y)` (fieldmap.c:798-802).
 *  Retourne (pos.x + MAP_OFFSET, pos.y + MAP_OFFSET) = focus en gBackupMapLayout
 *  coords (= équivalent player gBackup coords). */
export function GetCameraFocusCoords(): { x: number; y: number } {
  return {
    x: gSaveBlock1Ptr.pos.x + MAP_OFFSET,
    y: gSaveBlock1Ptr.pos.y + MAP_OFFSET,
  };
}

/** 1:1 décomp `SetCameraCoords(u16 x, u16 y)` (fieldmap.c:804-808). UNUSED
 *  côté décomp mais porté 1:1 pour exhaustivité. Écrit directement
 *  gSaveBlock1Ptr->pos en map-local coords. */
export function SetCameraCoords(x: number, y: number): void {
  gSaveBlock1Ptr.pos.x = x;
  gSaveBlock1Ptr.pos.y = y;
}

/** 1:1 décomp `GetCameraCoords(u16 *x, u16 *y)` (fieldmap.c:810-814). */
export function GetCameraCoords(): { x: number; y: number } {
  return {
    x: gSaveBlock1Ptr.pos.x,
    y: gSaveBlock1Ptr.pos.y,
  };
}

/** 1:1 décomp `GetPostCameraMoveMapBorderId(int x, int y)` (fieldmap.c:607-610).
 *  Predicts le border id à (pos + MAP_OFFSET + delta). Utilisé par CameraMove
 *  pour décider si le step va traverser un border vers une connexion. */
export function GetPostCameraMoveMapBorderId(x: number, y: number): number {
  return GetMapBorderIdAt(
    gSaveBlock1Ptr.pos.x + MAP_OFFSET + x,
    gSaveBlock1Ptr.pos.y + MAP_OFFSET + y,
  );
}

/** 1:1 décomp `CanCameraMoveInDirection(int direction)` (fieldmap.c:612-622).
 *  TRUE si avancer d'1 metatile dans cette direction ne sortirait pas hors-map
 *  (= CONNECTION_INVALID). Note décomp utilise `gDirectionToVectors[direction]`
 *  (event_object_movement.c:907) ; notre équivalent = DIR_TO_DX/DY tables
 *  (direction-coords.ts). */
export function CanCameraMoveInDirection(direction: number): boolean {
  const x = gSaveBlock1Ptr.pos.x + MAP_OFFSET + DIR_TO_DX[direction];
  const y = gSaveBlock1Ptr.pos.y + MAP_OFFSET + DIR_TO_DY[direction];
  return GetMapBorderIdAt(x, y) !== CONNECTION_INVALID;
}

// ─── Phase 4.8 : seamless cross-border transition (1:1 décomp) ───────────────

/** 1:1 STRICT décomp `IsCoordInIncomingConnectingMap(coord, srcMax, destMax, offset)`
 *  (fieldmap.c:717-732) :
 *    offset2 = max(offset, 0) ;
 *    if (destMax + offset < srcMax) srcMax = destMax + offset ;   // clamp à la largeur dest
 *    return offset2 <= coord && coord <= srcMax ;                 // borne INCLUSIVE
 *  (L'ancienne version approximait — `void srcMax` + borne exclusive — corrigé 1:1.) */
function IsCoordInIncomingConnectingMap(coord: number, srcMax: number, destMax: number, offset: number): boolean {
  let offset2 = offset;
  if (offset2 < 0)
    offset2 = 0;
  if (destMax + offset < srcMax)
    srcMax = destMax + offset;
  if (offset2 <= coord && coord <= srcMax)
    return true;
  return false;
}

/** 1:1 décomp `IsPosInIncomingConnectingMap` (fieldmap.c:701-715).
 *  Checks if a position (x, y) in the current map maps onto the connection's
 *  destination map (= the connection isn't an "edge" the player can cross
 *  here — only spans certain offset ranges). */
function IsPosInIncomingConnectingMap(direction: number, x: number, y: number, connection: MapConnection): boolean {
  const cMap = GetMapHeaderFromConnection(connection);
  if (!cMap || !gMapHeader) return false;
  switch (direction) {
    case CONNECTION_SOUTH:
    case CONNECTION_NORTH:
      return IsCoordInIncomingConnectingMap(x, gMapHeader.mapLayout.width, cMap.mapLayout.width, connection.offset);
    case CONNECTION_WEST:
    case CONNECTION_EAST:
      return IsCoordInIncomingConnectingMap(y, gMapHeader.mapLayout.height, cMap.mapLayout.height, connection.offset);
  }
  return false;
}

/** 1:1 décomp `GetIncomingConnection` (fieldmap.c:680-699). Find the
 *  connection in current map that matches a border crossing direction +
 *  player position (= offset range). */
export function GetIncomingConnection(direction: number, x: number, y: number): MapConnection | null {
  if (!gMapHeader) return null;
  for (const connection of gMapHeader.connections) {
    if (connection.direction === direction && IsPosInIncomingConnectingMap(direction, x, y, connection)) {
      return connection;
    }
  }
  return null;
}

/** 1:1 décomp `SetPositionFromConnection` (fieldmap.c:624-647). Computes the
 *  new player logical position in the destination map based on connection
 *  direction + offset.
 *
 *  Note : décomp set `gSaveBlock1Ptr->pos.x/y` à BORDER coords (= juste avant
 *  le step) PUIS apply delta. NOTRE impl applique delta au step end via
 *  PlayerStep's moveCoords → on ne doit PAS appliquer le delta ici sinon
 *  double-count. Returns la pos AVANT delta apply (= équivalent décomp post-
 *  SetPositionFromConnection mais pré `pos += delta`).
 *
 *  @param curPosX/Y  Player logical position in OLD map (= avant cross). Pour
 *                    NORTH/SOUTH : curPosX utilisé pour calculer offset shift x.
 *                    Pour EAST/WEST : curPosY utilisé pour offset shift y. */
// Note : `ComputeConnectionDestPos` (= variant qui retournait { camX, camY }
// au lieu d'écrire pos directement) supprimé chantier OW PHASE B. Remplacé
// 1:1 décomp par `SetPositionFromConnection` ci-dessous qui écrit gSaveBlock1Ptr
// .pos directement. Tous les callers (= field-camera.ts:CameraMove) ont été
// migrés.

/** 1:1 décomp `SetPositionFromConnection(connection, direction, x, y)`
 *  (fieldmap.c:624-647). ÉCRIT directement dans `gSaveBlock1Ptr.pos` la nouvelle
 *  pre-step position dans la new map. Le caller `CameraMove` fait ensuite
 *  `pos += x/y` pour atteindre la post-step pos (= 1:1 décomp fieldmap.c:673-674).
 *
 *  Notre archi diverge : on N'EXECUTE PAS le `pos += delta` après (= PlayerStep
 *  finalize le delta dans step end). Donc `pos` reste à pre-step value (= border)
 *  à la sortie de SetPositionFromConnection.
 *
 *  Decomp PRE-condition : `gSaveBlock1Ptr.pos.x/y` = OLD player position (= avant
 *  cross). La fonction OVERWRITE en partie (= certains champs) selon direction.
 *  Donc on doit appeler `SetPositionFromConnection` AVANT `TransitionToConnection`
 *  (= swap gMapHeader), car la pre-condition lit l'offset connection. */
export function SetPositionFromConnection(
  connection: MapConnection,
  direction: number,
  x: number,
  y: number,
): void {
  const cMap = GetMapHeaderFromConnection(connection);
  if (!cMap) return;
  switch (direction) {
    case CONNECTION_EAST:
      // 1:1 décomp `pos.x = -x;` (= -deltaX = -1 si EAST move). Step end +deltaX
      // → 0 = WEST border col du new map.
      gSaveBlock1Ptr.pos.x = -x;
      gSaveBlock1Ptr.pos.y -= connection.offset;
      break;
    case CONNECTION_WEST:
      // 1:1 décomp `pos.x = mapHeader->mapLayout->width;`. Step end -deltaX →
      // last valid col du new map.
      gSaveBlock1Ptr.pos.x = cMap.mapLayout.width;
      gSaveBlock1Ptr.pos.y -= connection.offset;
      break;
    case CONNECTION_SOUTH:
      gSaveBlock1Ptr.pos.x -= connection.offset;
      gSaveBlock1Ptr.pos.y = -y;
      break;
    case CONNECTION_NORTH:
      gSaveBlock1Ptr.pos.x -= connection.offset;
      gSaveBlock1Ptr.pos.y = cMap.mapLayout.height;
      break;
  }
}

/** Transition seamless vers une map connectée. Sync : assume tous les assets
 *  de la connexion sont déjà cached (= via prefetch depth 1 dans loadMapByName).
 *
 *  1:1 décomp `LoadMapFromCameraTransition` (overworld.c:784-825) version
 *  simplifiée pour notre web context :
 *    - Swap gMapHeader vers la connection map.
 *    - Re-init gBackupMapLayout (= InitMap).
 *    - Sync copy new secondary tileset to VRAM (primary stays = shared).
 *    - Sync load new secondary palette.
 *    - Update gMapHeader globalThis ref.
 *
 *  Le caller (= CameraUpdate via warp-system trigger) doit ensuite :
 *    - Update player.x/y selon ComputeConnectionDestPos.
 *    - Update _camPos correspondant.
 *    - Re-spawn NPCs (= async, OK car player près du border, NPCs au centre/loin).
 *    - Trigger background prefetch des connections de la new map (= depth+1
 *      pour seamless next hop).
 *
 *  @returns true si le swap a réussi (= cMap was cached). false si manqué
 *  (= besoin async load, fallback to warp-style transition par caller). */
export function TransitionToConnection(connection: MapConnection): boolean {
  const cMap = GetMapHeaderFromConnection(connection);
  if (!cMap) {
    console.warn(`[map-loader] TransitionToConnection: ${connection.destMap} not cached`);
    return false;
  }

  // 1:1 décomp `ApplyCurrentWarp` + `LoadCurrentMapData` : update gMapHeader.
  gMapHeader = cMap;
  (globalThis as Record<string, unknown>).gMapHeader = cMap;

  // 1:1 décomp `LoadMapFromCameraTransition` (overworld.c:805-807) :
  //     SetDefaultFlashLevel();
  //     Overworld_ClearSavedMusic();
  //     RunOnTransitionMapScript();
  // → le `savedMusic` (posé par `playbgm <song>, TRUE` = Overworld_SetSavedMusic) ne
  // SURVIT PAS à un changement de map : sans ce clear il est relu à vie par
  // Overworld_PlaySpecialMapMusic (overworld.c:1146). Placé ici = AVANT
  // RunOnTransitionMapScript (que le pilote de connexion lance après ce swap) et avant
  // InitMap, comme le décomp. Import dynamique : src/overworld.ts importe DÉJÀ ce
  // module (overworld.ts:17) → un import statique fermerait le cycle ESM (TDZ au boot).
  void import('./overworld')
    .then((m) => m.Overworld_ClearSavedMusic())
    .catch((e) => console.error('[map-loader] LoadMapFromCameraTransition : Overworld_ClearSavedMusic KO', e));

  // 1:1 décomp `InitMap` : rebuild gBackupMapLayout + run on-load script.
  // NB : InitMap call InitBackupMapLayoutConnections qui depend du cache des
  // connections de cMap. Si pas cached (= depth 2 manquante), borders unfilled
  // pour cette frame (= sera fillé async via prefetch en background).
  InitMap();

  // 1:1 décomp `CopySecondaryTilesetToVramUsingHeap` + `LoadSecondaryTilesetPalette` :
  // primary tileset partagé entre les 2 maps connectées (= reste en VRAM tel quel),
  // mais secondary peut différer → reload sync.
  CopySecondaryTilesetToVram(cMap.mapLayout);
  LoadSecondaryTilesetPalette(cMap.mapLayout);

  // 1:1 décomp `InitSecondaryTilesetAnimation` : re-init secondary anim
  // callback (= primary anim non touché).
  // NB : geré via setSecondaryTilesetAnimCallback dans CopyMapTilesetsToVram,
  // mais on n'appelle que le secondary ici donc need explicit re-set.
  setSecondaryTilesetAnimCallback(cMap.mapLayout.secondaryTileset?.name ?? '');

  // Phase 4.10 fix bug 1 (= "connections disparaissent au hasard") :
  // Detect si certaines connections de cMap manquent du cache (= prefetch
  // pas fini). Si oui, fire async prefetch + RETRY InitBackupMapLayoutConnections
  // une fois les maps loaded → fills any missed border. Sans ça, si depth-2
  // prefetch n'a pas eu le temps de finir (= user cross border 2 fois rapide),
  // les borders restent MAPGRID_UNDEFINED → visuel cassé.
  const missingConns = cMap.connections.filter(c =>
    c.direction >= CONNECTION_SOUTH && c.direction <= CONNECTION_EAST
    && !mapHeaderCache.has(c.destMap),
  );

  // Trigger background prefetch des connections de cMap (= depth+1 pour seamless
  // next hop). Si déjà en cache, no-op rapide.
  if (missingConns.length > 0) {
    console.warn(`[map-loader] TransitionToConnection: ${missingConns.length} connection(s) not cached (= ${missingConns.map(c => c.destMap).join(', ')}), will retry post-load`);
    void prefetchConnections(cMap).then(() => {
      // Après async load done, vérifier que cMap est TOUJOURS la map active
      // (= user n'a pas cross une autre border entretemps). Si oui, refill
      // les borders + force redraw via hook (= circular import évité).
      if (gMapHeader === cMap) {
        console.log(`[map-loader] connection prefetch done, refilling borders + redraw`);
        InitBackupMapLayoutConnections(cMap);
        if (_redrawWholeMapViewHook) _redrawWholeMapViewHook();
      }
    });
  } else {
    void prefetchConnections(cMap);
  }

  return true;
}

// ─── 1:1 décomp SaveMapView / MoveMapViewToBackup / ClearSavedMapView ────────
//
// Mécanisme décomp pour visual continuité parfaite au cross-border.
// AVANT le cross : SaveMapView snapshot 14×15 metatiles autour du player.
// APRÈS le cross + step delta apply : MoveMapViewToBackup réinjecte ce snapshot
// dans NEW map's sBackupMapData à la position adjacente du border traversé.
// Effet : les metatiles visibles AU MOMENT du cross sont EXACTEMENT le contenu
// OLD map (plutôt que le edge tiles de la connection map qui peuvent légèrement
// différer ou être désaligné de 1 metatile à cause du delta cross-step).
//
// Source vérité : `D:/Projet 1/decomps/pokeemeraude/src/fieldmap.c:428-566`.

/** 1:1 décomp `gSaveBlock1Ptr->mapView` (struct SaveBlock1 +0x34, u16[0x100]).
 *
 *  ⚠️ Étape 5 SAVE-SYSTEM-1TO1 : c'est LE MÊME array que le décomp utilise pour
 *  ses DEUX usages (= `mapView = gSaveBlock1Ptr->mapView;` aux 3 sites
 *  fieldmap.c:434/479/523) :
 *    (a) scratch transition connexion : SaveMapView→MoveMapViewToBackup→Clear ;
 *    (b) persistance save : InitSave (start_menu.c:879) → SaveMapView remplit le
 *        champ → sérialisé par le moteur secteurs (étape 3) → reload →
 *        InitMapFromSavedGame → LoadSavedMapView le consomme → ClearSavedMapView.
 *  Avant l'étape 5 on avait un buffer module-local séparé (= la save ne portait
 *  JAMAIS les tiles). Maintenant unifié sur `GetSaveBlock1().mapView` (number[256]
 *  sérialisable) = strictement 1:1 décomp (un seul array, deux usages). */
function _mapView(): number[] {
  return GetSaveBlock1().mapView;
}

/** 1:1 décomp `SaveMapView(void)` (fieldmap.c:428-443) — no-args.
 *  Copy MAP_OFFSET_H × MAP_OFFSET_W metatiles depuis sBackupMapData (= camera
 *  area + 2 rows top/bottom buffer + 0 col buffer) vers gSaveBlock1Ptr->mapView.
 *  Lit `gSaveBlock1Ptr.pos.x/y` (= 1:1 décomp `gSaveBlock1Ptr->pos.x/y`) — post
 *  chantier OW PHASE A, c'est la source unique. */
export function SaveMapView(): void {
  const mapView = _mapView();
  const width = gBackupMapLayout.width;
  const posX = gSaveBlock1Ptr.pos.x;
  const posY = gSaveBlock1Ptr.pos.y;
  let mapViewIdx = 0;
  for (let i = posY; i < posY + MAP_OFFSET_H; i++) {
    for (let j = posX; j < posX + MAP_OFFSET_W; j++) {
      mapView[mapViewIdx++] = sBackupMapData[width * i + j];
    }
  }
}

/** 1:1 décomp `SavedMapViewIsEmpty(void)` (fieldmap.c:445-465).
 *  OR de toutes les entrées ; retourne TRUE ssi marker == 0.
 *
 *  ⚠️ Le décomp `#ifndef UBFIX` itère `i < 0x200` sur un array de 0x100 (= BUG
 *  de lecture HORS-BORNES de la mémoire EWRAM adjacente à mapView). C'est de
 *  l'UB C INTRADUISIBLE en JS : il n'y a aucune « mémoire adjacente » définie à
 *  répliquer (≠ le bug RNG qui est DÉTERMINISTE et reste gardé 1:1). On porte
 *  donc la branche `#else UBFIX` du décomp LUI-MÊME (= `ARRAY_COUNT` = 0x100).
 *  Ce n'est PAS une déviation gameplay : SaveMapView n'écrit que 210 entrées et
 *  ClearSavedMapView remet tout à 0, donc [0..0x200) et [0..0x100) donnent le
 *  même verdict en pratique. Documenté honnêtement (WORKING-MODE règle 2). */
function SavedMapViewIsEmpty(): boolean {
  const mapView = _mapView();
  let marker = 0;
  for (let i = 0; i < 0x100; i++) marker |= mapView[i];
  return marker === 0;
}

/** 1:1 décomp `ClearSavedMapView(void)` (fieldmap.c:467-470).
 *  CpuFill16(0, gSaveBlock1Ptr->mapView, sizeof(...)) = 0x100 u16. */
export function ClearSavedMapView(): void {
  const mapView = _mapView();
  for (let i = 0; i < 0x100; i++) mapView[i] = 0;
}

/** 1:1 décomp `MoveMapViewToBackup(u8 direction)` (fieldmap.c:512-566).
 *  Restore _savedMapView snapshot dans NEW map's sBackupMapData à offset
 *  approprié selon direction. Direction-specific x0/y0/r8/r9 shifts d'1 metatile
 *  pour aligner avec le cross-step delta.
 *
 *  Appelé APRÈS TransitionToConnection (= sBackupMapData rebuilt par InitMap
 *  pour new map) et AVANT clearOverworldTilemaps + DrawWholeMapView (= sinon
 *  snapshot serait overwrite par new map's content au render).
 *
 *  Décomp utilise `gSaveBlock1Ptr->pos.x/y` qui est le player logical pos
 *  POST-step (= post `pos += x/y` dans CameraMove fieldmap.c:673-674). Nos
 *  conventions : caller doit passer post-step pos en LOGICAL coords du new map.
 *
 *  ClearSavedMapView() called automatiquement à la fin (= 1:1 décomp). */
export function MoveMapViewToBackup(direction: number): void {
  const mapView = _mapView();
  const width = gBackupMapLayout.width;
  // 1:1 décomp `x0 = gSaveBlock1Ptr->pos.x; y0 = gSaveBlock1Ptr->pos.y;`
  // (fieldmap.c:527-528). Post chantier OW PHASE A.2 : pos est la source unique.
  const posX = gSaveBlock1Ptr.pos.x;
  const posY = gSaveBlock1Ptr.pos.y;
  let r9 = 0;
  let r8 = 0;
  let x0 = posX;
  let y0 = posY;
  let x2 = MAP_OFFSET_W;
  let y2 = MAP_OFFSET_H;
  switch (direction) {
    case CONNECTION_NORTH:
      y0 += 1;
      y2 = MAP_OFFSET_H - 1;
      break;
    case CONNECTION_SOUTH:
      r8 = 1;
      y2 = MAP_OFFSET_H - 1;
      break;
    case CONNECTION_WEST:
      x0 += 1;
      x2 = MAP_OFFSET_W - 1;
      break;
    case CONNECTION_EAST:
      r9 = 1;
      x2 = MAP_OFFSET_W - 1;
      break;
  }
  // 1:1 décomp double-loop (fieldmap.c:550-563). Bug décomp préservé : i et j
  // sont incrementés en parallèle (= équivalents à x dans la boucle interne).
  // Donc src = mapView[(y+r8)*MAP_OFFSET_W + r9 + x],
  //     dest = sBackupMapData[x0 + width*(y+y0) + x].
  // Bounds-check : si dest hors gBackupMapLayout (= très edge cases), skip
  // pour éviter array OOB. Décomp pas de check car SaveMapView garantit src
  // bounds via pos.x/y in [0, mapW-1] / [0, mapH-1], et width MAP_OFFSET = 7
  // assure target stays within.
  for (let y = 0; y < y2; y++) {
    let i = 0;
    let j = 0;
    for (let x = 0; x < x2; x++) {
      const desti = width * (y + y0);
      const srci = (y + r8) * MAP_OFFSET_W + r9;
      const destIdx = x0 + desti + j;
      if (destIdx >= 0 && destIdx < sBackupMapData.length) {
        sBackupMapData[destIdx] = mapView[srci + i];
      }
      i++;
      j++;
    }
  }
  ClearSavedMapView();
}

// ─── 1:1 décomp LoadSavedMapView (= reprise « même état » des tiles autour) ───
//
// Étape 5 SAVE-SYSTEM-1TO1. Au reload d'une save, InitMapFromSavedGame appelle
// LoadSavedMapView qui ré-injecte les 14×15 metatiles sauvegardés (= ce que le
// player voyait au moment du save) dans le sBackupMapData de la map fraîchement
// chargée, AVANT RunOnLoadMapScript. Source vérité : fieldmap.c:472-510 +
// fieldmap.c:827-840 (SkipCopying) + fldeff_misc.c:1180 (IsLargeBreakable) +
// fldeff_cut.c:394-417/592-639 (LongGrass window fixups).

/** 1:1 décomp `CurMapIsSecretBase(void)` (secret_base.c).
 *  Le subsystem Secret Base est DÉFÉRÉ (cf. mémoire opcodes-backing-work-todo).
 *  Aucune map supportée par le port n'est une secret base → retourne FALSE =
 *  comportement STRICTEMENT 1:1 pour 100 % des maps jouables. Quand le
 *  subsystem Secret Base sera porté, remplacer par le vrai check
 *  `VarGet(VAR_CURRENT_SECRET_BASE) != 0 && ...` (honnête, WORKING-MODE r.2). */
function CurMapIsSecretBase(): boolean {
  return false;
}

/** 1:1 décomp `IsLargeBreakableDecoration(metatileId, checkBase)` (fldeff_misc
 *  .c:1180-1201). Hors secret base → FALSE immédiat (1:1). */
function IsLargeBreakableDecoration(metatileId: number, checkBase: boolean): boolean {
  if (!CurMapIsSecretBase()) return false;
  if (!checkBase) {
    if (metatileId === METATILE_SecretBase_SandOrnament_Top || metatileId === METATILE_SecretBase_SandOrnament_TopWall) return true;
    if (metatileId === METATILE_SecretBase_BreakableDoor_TopClosed) return true;
  } else {
    if (metatileId === METATILE_SecretBase_SandOrnament_Base1) return true;
    if (metatileId === METATILE_SecretBase_BreakableDoor_BottomClosed) return true;
  }
  return false;
}

/** 1:1 décomp `SkipCopyingMetatileFromSavedMap(u16 *mapBlock, u16 mapWidth,
 *  u8 yMode)` (fieldmap.c:827-840). Le décomp passe un POINTEUR sur la cellule
 *  sBackupMapData ; on passe l'index linéaire équivalent (mêmes décalages
 *  ±mapWidth). yMode 0xFF → FALSE (= toujours copier). */
function SkipCopyingMetatileFromSavedMap(blockIdx: number, mapWidth: number, yMode: number): boolean {
  if (yMode === 0xFF) return false;
  if (yMode === 0) blockIdx -= mapWidth;
  else blockIdx += mapWidth;
  if (IsLargeBreakableDecoration(UNPACK_METATILE(sBackupMapData[blockIdx]), yMode !== 0) === true) return true;
  return false;
}

// 1:1 décomp `enum { LONG_GRASS_NONE, FIELD, BASE_LEFT, BASE_CENTER, BASE_RIGHT }`
// (fldeff_cut.c:394-401).
const LONG_GRASS_NONE = 0;
const LONG_GRASS_FIELD = 1;
const LONG_GRASS_BASE_LEFT = 2;
const LONG_GRASS_BASE_CENTER = 3;
const LONG_GRASS_BASE_RIGHT = 4;

/** 1:1 décomp `GetLongGrassCaseAt(s16 x, s16 y)` (fldeff_cut.c:403-417).
 *  Exporté : partagé entre LoadSavedMapView (ici) et le sous-système Coupe-herbe
 *  (fldeff_cut.ts SetCutGrassMetatiles/HandleLongGrassOnHyper). */
export function GetLongGrassCaseAt(x: number, y: number): number {
  const metatileId = MapGridGetMetatileIdAt(x, y);
  if (metatileId === METATILE_General_Grass) return LONG_GRASS_FIELD;
  else if (metatileId === METATILE_Fortree_SecretBase_LongGrass_TopLeft) return LONG_GRASS_BASE_LEFT;
  else if (metatileId === METATILE_Fortree_SecretBase_LongGrass_TopMid) return LONG_GRASS_BASE_CENTER;
  else if (metatileId === METATILE_Fortree_SecretBase_LongGrass_TopRight) return LONG_GRASS_BASE_RIGHT;
  else return LONG_GRASS_NONE;
}

/** 1:1 décomp `FixLongGrassMetatilesWindowTop(s16 x, s16 y)` (fldeff_cut.c:592). */
function FixLongGrassMetatilesWindowTop(x: number, y: number): void {
  const metatileBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MetatileBehavior_IsLongGrass_Duplicate(metatileBehavior)) {
    switch (GetLongGrassCaseAt(x, y + 1)) {
      case LONG_GRASS_FIELD:
        MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_LongGrass_Root);
        break;
      case LONG_GRASS_BASE_LEFT:
        MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomLeft);
        break;
      case LONG_GRASS_BASE_CENTER:
        MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomMid);
        break;
      case LONG_GRASS_BASE_RIGHT:
        MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomRight);
        break;
    }
  }
}

/** 1:1 décomp `FixLongGrassMetatilesWindowBottom(s16 x, s16 y)` (fldeff_cut.c
 *  :615-639). */
function FixLongGrassMetatilesWindowBottom(x: number, y: number): void {
  if (MapGridGetMetatileIdAt(x, y) === METATILE_General_Grass) {
    const metatileBehavior = MapGridGetMetatileBehaviorAt(x, y + 1);
    if (MetatileBehavior_IsLongGrassSouthEdge(metatileBehavior)) {
      const metatileId = MapGridGetMetatileIdAt(x, y + 1);
      switch (metatileId) {
        case METATILE_Fortree_LongGrass_Root:
          MapGridSetMetatileIdAt(x, y + 1, METATILE_General_Grass);
          break;
        case METATILE_Fortree_SecretBase_LongGrass_BottomLeft:
          MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_TopLeft);
          break;
        case METATILE_Fortree_SecretBase_LongGrass_BottomMid:
          MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_TopMid);
          break;
        case METATILE_Fortree_SecretBase_LongGrass_BottomRight:
          MapGridSetMetatileIdAt(x, y + 1, METATILE_Fortree_SecretBase_LongGrass_TopRight);
          break;
      }
    }
  }
}

/** 1:1 décomp `LoadSavedMapView(void)` (fieldmap.c:472-510).
 *  Si la save view n'est pas vide, ré-injecte les 14×15 metatiles sauvegardés
 *  dans sBackupMapData (avec gestion yMode pour les decorations breakable +
 *  fixups long-grass top/bottom), puis ClearSavedMapView.
 *
 *  Le décomp utilise `i` et `j` APRÈS les boucles : à la sortie de la double
 *  boucle `for (i = y; i < y + MAP_OFFSET_H; i++)`, C a `i == y + MAP_OFFSET_H`
 *  → reproduit exactement via `iAfter` dans le test du second loop. */
export function LoadSavedMapView(): void {
  const mapView = _mapView();
  if (!SavedMapViewIsEmpty()) {
    if (!gMapHeader) return;
    const mapHeight = gMapHeader.mapLayout.height;
    const width = gBackupMapLayout.width;
    const x = GetSaveBlock1().pos.x;
    const y = GetSaveBlock1().pos.y;
    let mapViewIdx = 0;
    let i = y;
    for (i = y; i < y + MAP_OFFSET_H; i++) {
      let yMode: number;
      if (i === y && i !== 0) yMode = 0;
      else if (i === y + MAP_OFFSET_H - 1 && i !== mapHeight - 1) yMode = 1;
      else yMode = 0xFF;

      for (let j = x; j < x + MAP_OFFSET_W; j++) {
        const blockIdx = j + width * i;
        if (!SkipCopyingMetatileFromSavedMap(blockIdx, width, yMode)) {
          sBackupMapData[blockIdx] = mapView[mapViewIdx];
        }
        mapViewIdx++;
      }
    }
    // 1:1 décomp : `i` vaut ici `y + MAP_OFFSET_H` (valeur post-boucle C).
    const iAfter = i;
    for (let j = x; j < x + MAP_OFFSET_W; j++) {
      if (y !== 0) FixLongGrassMetatilesWindowTop(j, y - 1);
      if (iAfter < mapHeight - 1) FixLongGrassMetatilesWindowBottom(j, y + MAP_OFFSET_H - 1);
    }
    ClearSavedMapView();
  }
}

/** 1:1 décomp `InitMapFromSavedGame(void)` (fieldmap.c:78-86).
 *  Variante d'InitMap utilisée UNIQUEMENT au resume d'une save (= décomp
 *  CB2_ContinueSavedGame), JAMAIS sur un warp normal (= InitMap) → évite de
 *  ré-injecter une mapView stale dans une autre map.
 *
 *  Ordre décomp STRICT (critique) : InitMapLayoutData → [SecretBase déférés] →
 *  LoadSavedMapView → RunOnLoadMapScript → [TVScreens déféré]. LoadSavedMapView
 *  DOIT précéder RunOnLoadMapScript (sinon les setmetatile du script ON_LOAD
 *  seraient écrasés par la vue sauvegardée). */
export function InitMapFromSavedGame(): void {
  if (!gMapHeader) throw new Error('InitMapFromSavedGame: gMapHeader is null (call loadMapByName first)');
  InitMapLayoutData(gMapHeader);
  // InitSecretBaseAppearance(FALSE) + SetOccupiedSecretBaseEntranceMetatiles
  //   (gMapHeader.events) : subsystem Secret Base DÉFÉRÉ (no-op 1:1 pour toutes
  //   les maps supportées ; InitMap() marque déjà SetOccupied... TODO Phase 4.7
  //   — cohérent, honnête WORKING-MODE r.2).
  LoadSavedMapView();
  if (_runOnLoadMapScriptHook) _runOnLoadMapScriptHook();
  // UpdateTVScreensOnMap(gBackupMapLayout.width, gBackupMapLayout.height) :
  //   subsystem TV DÉFÉRÉ (no-op 1:1 ; aucune TV sur les maps supportées).
}

/** 1:1 décomp `InitBattlePyramidMap(bool8 setPlayerPosition)` (fieldmap.c:88-92) :
 *    CpuFastFill16(MAPGRID_UNDEFINED, sBackupMapData, sizeof(sBackupMapData));
 *    GenerateBattlePyramidFloorLayout(sBackupMapData, setPlayerPosition);
 *  Notre `sBackupMapData` = `gBackupMapLayout.map` (même buffer). Contenu post-game (Battle
 *  Pyramid) — la génération est fidèle ; cf. battle_pyramid.ts pour la limite data (layouts). */
export function InitBattlePyramidMap(setPlayerPosition: boolean): void {
  gBackupMapLayout.map.fill(MAPGRID_UNDEFINED);
  GenerateBattlePyramidFloorLayout(gBackupMapLayout.map, setPlayerPosition);
}

/** 1:1 décomp `InitTrainerHillMap(void)` (fieldmap.c:94-98) :
 *    CpuFastFill16(MAPGRID_UNDEFINED, sBackupMapData, sizeof(sBackupMapData));
 *    GenerateTrainerHillFloorLayout(sBackupMapData);
 *  Notre `sBackupMapData` = `gBackupMapLayout.map`. Contenu post-game (Trainer Hill) ;
 *  cf. trainer_hill.ts pour la limite data (layouts d'étage). */
export function InitTrainerHillMap(): void {
  gBackupMapLayout.map.fill(MAPGRID_UNDEFINED);
  GenerateTrainerHillFloorLayout(gBackupMapLayout.map);
}

/** Helper : prefetch les map headers des connexions immédiates d'une map.
 *  Async, fire-and-forget. Errors silencieuses (= warning logged). */
async function prefetchConnections(header: MapHeader): Promise<void> {
  if (!header.connections || header.connections.length === 0) return;
  // Phase 4.10 fix bug 1 : depth-2 prefetch. Charge depth 1 (= immediate
  // connections of `header`) puis depth 2 (= connections de chacune). Ça
  // garantit qu'au prochain cross-border depuis cette map, les connections
  // de la new map sont déjà cached → InitBackupMapLayoutConnections fills
  // proprement (= pas de border MAPGRID_UNDEFINED).
  const depth1 = await Promise.all(
    header.connections
      .filter(c => c.direction >= CONNECTION_SOUTH && c.direction <= CONNECTION_EAST)
      .map(c => loadMapHeader(c.destMap).catch((e: unknown) => {
        console.warn(`[map-loader] prefetchConnections failed for ${c.destMap}:`, e);
        return null;
      })),
  );
  // Depth 2 prefetch (parallel pour tous les targets, dedup via Set).
  const depth2 = new Set<string>();
  for (const h of depth1) {
    if (!h) continue;
    for (const c of h.connections) {
      if (c.direction >= CONNECTION_SOUTH && c.direction <= CONNECTION_EAST
          && c.destMap !== header.id) {
        depth2.add(c.destMap);
      }
    }
  }
  if (depth2.size > 0) {
    await Promise.all(
      [...depth2].map(d => loadMapHeader(d).catch((e: unknown) => {
        console.warn(`[map-loader] prefetchConnections depth-2 failed for ${d}:`, e);
        return null;
      })),
    );
  }
}

/** Sync helper : copy secondary tileset to VRAM only. Used by
 *  TransitionToConnection (= primary stays in VRAM, only secondary differs).
 *  1:1 décomp `CopySecondaryTilesetToVramUsingHeap`. */
function CopySecondaryTilesetToVram(mapLayout: MapLayout): void {
  if (!mapLayout.secondaryTileset) return;
  CopyTilesetToVram(
    mapLayout.secondaryTileset,
    NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY,
    NUM_TILES_IN_PRIMARY,
  );
}

/** Sync helper : load secondary palette only. 1:1 décomp `LoadSecondaryTilesetPalette`. */
function LoadSecondaryTilesetPalette(mapLayout: MapLayout): void {
  if (!mapLayout.secondaryTileset) return;
  const PLTT_SIZE_4BPP = 32;
  LoadTilesetPalette(
    mapLayout.secondaryTileset,
    NUM_PALS_IN_PRIMARY * 16,
    (NUM_PALS_TOTAL - NUM_PALS_IN_PRIMARY) * PLTT_SIZE_4BPP,
  );
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

/** 1:1 décomp `CopyTilesetToVram(tileset, numTiles, offset)` (fieldmap.c:845-851) :
 *  `LoadBgTiles(2, tileset->tiles, numTiles * 32, offset)` direct (DMA, pas de heap).
 *  numTiles * 32 = octets (4bpp 8x8 = 32 octets/tile) ; offset = slot tile dans BG charBase 2.
 *  Notre tileset PNG est déjà décompressé → pas de décompression LZ77. */
function CopyTilesetToVram(tileset: Tileset | null, numTiles: number, offset: number): void {
  if (!tileset) return;
  LoadBgTiles(2, tileset.tiles, numTiles * 32, offset);
}

/** 1:1 décomp `CopyTilesetToVramUsingHeap(tileset, numTiles, offset)` (fieldmap.c:853-862) :
 *    if (!tileset->isCompressed) LoadBgTiles(...) ; else DecompressAndLoadBgGfxUsingHeap(...).
 *  Nos tilesets PNG sont TOUJOURS non-compressés (isCompressed=false) → branche LoadBgTiles
 *  (= identique à CopyTilesetToVram chez nous, le distinguo heap/DMA n'a pas de sens ici). */
function CopyTilesetToVramUsingHeap(tileset: Tileset | null, numTiles: number, offset: number): void {
  if (!tileset) return;
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
    // size - PLTT_SIZEOF_1 = bytes restantes = (NUM_PALS_IN_PRIMARY * 16 - 1) * 2.
    // 1:1 décomp bound check (Audit BIG section 2.7) : si la map n'utilise pas
    // tous les banks (= tileset.palettes.length < NUM_PALS_IN_PRIMARY), `flat`
    // contient des banks zéro à la fin. Sans cap, on écraserait des entries
    // valides du précédent map avec des zéros → tile color stomping.
    // → Cap restEntries à la vraie taille du flat (= numBanks*16 - 1 skipFirst).
    const flatMaxEntries = Math.max(0, flat.length - 1);
    const restEntries = Math.min((size - PLTT_SIZEOF_1) / 2, flatMaxEntries);
    LoadPalette(flat.subarray(1, 1 + restEntries), destOffset + 1, restEntries * 2);
    ApplyGlobalTintToPaletteEntries(destOffset + 1, restEntries);  // no-op Emerald (1:1 décomp)
  } else {
    // Secondary : load palettes[NUM_PALS_IN_PRIMARY=6]..jusqu'à size.
    // Décomp : `LoadPalette(tileset->palettes[NUM_PALS_IN_PRIMARY], destOffset, size);`
    // C'est un cast pointer → 16 u16 par bank, on flatten palettes[6..12] = 7 banks.
    const flat = flattenPaletteBanks(tileset.palettes, NUM_PALS_IN_PRIMARY, NUM_PALS_TOTAL);
    // 1:1 décomp bound check (Audit BIG section 2.7) : cap numEntries à
    // tileset.palettes available banks pour éviter d'écrire des zéros par-dessus
    // entries valides.
    const numEntries = Math.min(size / 2, flat.length);
    LoadPalette(flat.subarray(0, numEntries), destOffset, numEntries * 2);
    ApplyGlobalTintToPaletteEntries(destOffset, numEntries);  // no-op Emerald (1:1 décomp)
  }
}

/** 1:1 décomp `ApplyGlobalTintToPaletteSlot(u8 slot, u8 count)` (fieldmap.c:870-873) :
 *  fonction VIDE marquée UNUSED dans la décomp (vestige FRLG global tint). Portée 1:1 = no-op. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ApplyGlobalTintToPaletteSlot(_slot: number, _count: number): void {
}

/** 1:1 décomp `ApplyGlobalTintToPaletteEntries(u16 offset, u16 size)` (fieldmap.c:865-868) :
 *  fonction VIDE pour Emerald (le global tint FRLG n'y est pas implémenté). Portée 1:1 = no-op.
 *  Appelée par LoadTilesetPalette après chaque LoadPalette (= structure d'appel décomp). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ApplyGlobalTintToPaletteEntries(_offset: number, _size: number): void {
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

/** 1:1 décomp `CopyPrimaryTilesetToVram(mapLayout)` (fieldmap.c:900-903).
 *  (CopySecondaryTilesetToVram + LoadSecondaryTilesetPalette existent déjà plus haut,
 *  helpers de TransitionToConnection.) */
export function CopyPrimaryTilesetToVram(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  CopyTilesetToVram(mapLayout.primaryTileset, NUM_TILES_IN_PRIMARY, 0);
}

/** 1:1 décomp `CopySecondaryTilesetToVramUsingHeap(mapLayout)` (fieldmap.c:910-913). */
export function CopySecondaryTilesetToVramUsingHeap(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  CopyTilesetToVramUsingHeap(mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
}

/** 1:1 décomp `CopyMapTilesetsToVram(mapLayout)` (fieldmap.c:925-932) : charge primary +
 *  secondary tilesets en VRAM (variantes UsingHeap dans la décomp ; chez nous = LoadBgTiles
 *  direct, le distinguo heap n'a pas de sens).
 *  Extension : set les callbacks d'animation tileset via setPrimary/SecondaryTilesetAnimCallback
 *  (tileset-anims.ts), routés par tileset.name. InitTilesetAnimations() est appelé APRÈS. */
export function CopyMapTilesetsToVram(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  CopyTilesetToVramUsingHeap(mapLayout.primaryTileset, NUM_TILES_IN_PRIMARY, 0);
  CopyTilesetToVramUsingHeap(mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
  setPrimaryTilesetAnimCallback(mapLayout.primaryTileset?.name ?? '');
  setSecondaryTilesetAnimCallback(mapLayout.secondaryTileset?.name ?? '');
}

/** 1:1 décomp `LoadPrimaryTilesetPalette(mapLayout)` (fieldmap.c:915-918) :
 *    LoadTilesetPalette(primaryTileset, BG_PLTT_ID(0), NUM_PALS_IN_PRIMARY * PLTT_SIZE_4BPP).
 *  Notre BG_PLTT_ID(0) = 0 ; PLTT_SIZE_4BPP = 32 (16 couleurs × 2 octets). */
function LoadPrimaryTilesetPalette(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  LoadTilesetPalette(mapLayout.primaryTileset, 0, NUM_PALS_IN_PRIMARY * 32);
}

/** 1:1 décomp `LoadMapTilesetPalettes(mapLayout)` (fieldmap.c:934-941).
 *  Banks 0-5 primary + banks 6-12 secondary = 13 banks total = 13 * 16 colors
 *  = 208 entries dans gPlttBuffer (BG slots 0-207). */
export function LoadMapTilesetPalettes(mapLayout: MapLayout | null): void {
  if (!mapLayout) return;
  LoadPrimaryTilesetPalette(mapLayout);
  LoadSecondaryTilesetPalette(mapLayout);
}

// Note : DrawMetatile + buffers gOverworldTilemapBuffer_Bg* + flushOverworldTilemaps
// + clearOverworldTilemaps sont désormais dans `field-camera.ts` (= 1:1 décomp
// field_camera.c:245-310, leur vraie maison). DrawMetatileAt / DrawWholeMapView /
// RedrawMapSlice* / MapPosToBgTilemapOffset y étaient déjà. GetMapConnection est
// passé dans `game/overworld.ts` (overworld.c:740). Ce fichier ne garde donc plus
// QUE fieldmap.c (+ glu de chargement async maison) → futur `game/fieldmap.ts`.


// ─── SetCurrentMapLayout 1:1 (fieldmap.c) — ex-engine/field/map-layout-swap.ts (lot 13) ──
// ⚠️ DETTE : _LAYOUT_IDX_TO_ID est VIDE (mapping idx → layoutId à extraire de
// include/constants/layouts.h) → setmaplayoutindex warn et no-op. gMapHeader et
// loadLayout sont locaux à ce fichier (imports de l'ex-module supprimés).
/** Tableau idx → layoutId pour Em (= 1:1 data/layouts/layouts.h enum order).
 *  Extraction TODO : générer ce mapping depuis le décomp `include/constants/layouts.h`
 *  via une étape build. Pour l'instant : empty (= future). */
const _LAYOUT_IDX_TO_ID: ReadonlyMap<number, string> = new Map();

/** 1:1 décomp `SetCurrentMapLayout(layoutId)` (fieldmap.c).
 *  Swap le layout courant + trigger BG re-render. */
export async function SetCurrentMapLayout(layoutIdx: number): Promise<void> {
  // Store demand request — field scene poll cette valeur.
  (globalThis as Record<string, unknown>).gPendingMapLayoutIndex = layoutIdx;

  const layoutId = _LAYOUT_IDX_TO_ID.get(layoutIdx);
  if (!layoutId) {
    console.warn(`[map-layout-swap] layoutIdx ${layoutIdx} not in _LAYOUT_IDX_TO_ID — TODO extract from decomp layouts.h`);
    return;
  }

  try {
    const newLayout = await loadLayout(layoutId);
    // 1:1 décomp : update gMapHeader.mapLayout in place. Le scene field
    // detect la changé via gPendingMapLayoutIndex flag et re-render BG.
    (gMapHeader as unknown as { mapLayout: unknown }).mapLayout = newLayout;
    (gMapHeader as unknown as { mapLayoutId: string }).mapLayoutId = layoutId;
    console.log(`[map-layout-swap] swapped to layout '${layoutId}' (idx=${layoutIdx})`);
    // Signal au scene field qu'il faut re-render.
    (globalThis as Record<string, unknown>).gMapLayoutReloadRequested = true;
  } catch (e) {
    console.warn(`[map-layout-swap] failed to load layout '${layoutId}':`, e);
  }
}

// Auto-register sur globalThis pour script-opcode.
(globalThis as { __mapLayoutSwap?: Record<string, unknown> }).__mapLayoutSwap = {
  SetCurrentMapLayout,
};

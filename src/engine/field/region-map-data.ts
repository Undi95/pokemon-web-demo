/**
 * region-map-data.ts — Données 1:1 décomp pour la carte de Hoenn.
 *
 * Sources :
 *   - `data/region_map/region_map_layout.h` (= sRegionMap_MapSectionLayout 15×28)
 *   - `data/region_map/region_map_sections.json` (= gRegionMapEntries[])
 *     Émeraude FR, exporté par les outils décomp.
 *
 * Chargé async au boot via fetch JSON (= déjà copié dans
 * `public/decomp/em/region_map/region_map_data.json`).
 */

export interface RegionMapEntry {
  /** Mapsec id constant (= MAPSEC_LITTLEROOT_TOWN, etc.). */
  id: string;
  /** Nom à afficher (= FR officiel "BOURG-EN-VOL", "ROUTE 101", etc.). */
  name: string;
  /** Position x sur la grille worldmap (= 0..27 = MAPCURSOR_X - MAPCURSOR_X_MIN). */
  x: number;
  /** Position y (= 0..14 = MAPCURSOR_Y - MAPCURSOR_Y_MIN). */
  y: number;
  /** Largeur en tiles (= zone de la mapsec sur la worldmap). */
  width: number;
  /** Hauteur en tiles. */
  height: number;
}

/** sRegionMap_MapSectionLayout[MAP_HEIGHT=15][MAP_WIDTH=28] décomp.
 *  Chaque cell = mapsec id à cette position dans la worldmap. Cursor se
 *  déplace de tile en tile, et le mapsec id détermine le nom affiché. */
export type RegionMapLayout = ReadonlyArray<ReadonlyArray<string>>;

/** gRegionMapEntries[] décomp. Indexé par mapsec id (= string). */
export type RegionMapEntries = ReadonlyMap<string, RegionMapEntry>;

interface RawData {
  entries: RegionMapEntry[];
  layout: string[][];
}

let _entries: RegionMapEntries | null = null;
let _layout: RegionMapLayout | null = null;
let _loadPromise: Promise<void> | null = null;

/** Charge le JSON une fois (= module-level cache). À call AVANT InitRegionMap. */
export async function preloadRegionMapData(): Promise<void> {
  if (_entries && _layout) return;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const res = await fetch('/decomp/em/region_map/region_map_data.json');
    if (!res.ok) throw new Error(`region_map_data.json fetch failed : ${res.status}`);
    const raw = await res.json() as RawData;
    const map = new Map<string, RegionMapEntry>();
    for (const e of raw.entries) map.set(e.id, e);
    _entries = map;
    _layout = raw.layout.map(row => Object.freeze(row.slice()));
    console.log(`[region-map-data] loaded : ${raw.entries.length} entries, ${raw.layout.length}×${raw.layout[0]?.length ?? 0} layout`);
  })();
  return _loadPromise;
}

/** Returns la map des entries indexés par mapsec id. Throw si pas preloaded. */
export function getRegionMapEntries(): RegionMapEntries {
  if (!_entries) throw new Error('region-map-data : not preloaded, call preloadRegionMapData() first');
  return _entries;
}

/** Returns le layout 15×28 (= mapsec id à chaque tile). Throw si pas preloaded. */
export function getRegionMapLayout(): RegionMapLayout {
  if (!_layout) throw new Error('region-map-data : not preloaded, call preloadRegionMapData() first');
  return _layout;
}

/** 1:1 décomp `GetMapSecIdAt(x, y)` (region_map.c:957). Returns le mapsec id à
 *  la position (x, y) cursor coords (= MAPCURSOR_X_MIN..MAX, MAPCURSOR_Y_MIN..MAX).
 *  Si hors range, retourne 'MAPSEC_NONE'. */
export function GetMapSecIdAt(x: number, y: number): string {
  if (!_layout) return 'MAPSEC_NONE';
  // Constants 1:1 décomp region_map.c:43-46
  const MAPCURSOR_X_MIN = 1;
  const MAPCURSOR_Y_MIN = 2;
  const MAP_WIDTH = 28;
  const MAP_HEIGHT = 15;
  const MAPCURSOR_X_MAX = MAPCURSOR_X_MIN + MAP_WIDTH - 1;
  const MAPCURSOR_Y_MAX = MAPCURSOR_Y_MIN + MAP_HEIGHT - 1;
  if (y < MAPCURSOR_Y_MIN || y > MAPCURSOR_Y_MAX || x < MAPCURSOR_X_MIN || x > MAPCURSOR_X_MAX) {
    return 'MAPSEC_NONE';
  }
  const row = y - MAPCURSOR_Y_MIN;
  const col = x - MAPCURSOR_X_MIN;
  return _layout[row]?.[col] ?? 'MAPSEC_NONE';
}

/** 1:1 décomp `GetMapName(dest, regionMapId, padLength)` (region_map.c:1568).
 *  Retourne le nom du mapsec (= depuis gRegionMapEntries[mapSecId].name) ou
 *  une chaîne de pad chars si invalide. */
export function GetMapName(regionMapId: string): string {
  if (!_entries) return '';
  const e = _entries.get(regionMapId);
  return e ? e.name : '';
}

// ─── MapsecType (= 1:1 décomp region_map.c:1175-1220 GetMapsecType) ─────────

/** 1:1 décomp `enum MapsecType` (region_map.h) :
 *    MAPSECTYPE_NONE         = 0  (= pas de name window)
 *    MAPSECTYPE_ROUTE        = 1  (= route ou cave default)
 *    MAPSECTYPE_CITY_CANFLY  = 2  (= city + visitée → vol dispo)
 *    MAPSECTYPE_CITY_CANTFLY = 3  (= city + jamais visitée)
 *    MAPSECTYPE_BATTLE_FRONTIER = 4 */
export const MAPSECTYPE_NONE = 0;
export const MAPSECTYPE_ROUTE = 1;
export const MAPSECTYPE_CITY_CANFLY = 2;
export const MAPSECTYPE_CITY_CANTFLY = 3;
export const MAPSECTYPE_BATTLE_FRONTIER = 4;

/** Map des mapsecs CITY/TOWN au flag visit correspondant (= 1:1 décomp
 *  region_map.c:1175-1212 switch case `FLAG_VISITED_*`). */
const CITY_VISIT_FLAGS: Record<string, string> = {
  MAPSEC_LITTLEROOT_TOWN:   'FLAG_VISITED_LITTLEROOT_TOWN',
  MAPSEC_OLDALE_TOWN:       'FLAG_VISITED_OLDALE_TOWN',
  MAPSEC_DEWFORD_TOWN:      'FLAG_VISITED_DEWFORD_TOWN',
  MAPSEC_LAVARIDGE_TOWN:    'FLAG_VISITED_LAVARIDGE_TOWN',
  MAPSEC_FALLARBOR_TOWN:    'FLAG_VISITED_FALLARBOR_TOWN',
  MAPSEC_VERDANTURF_TOWN:   'FLAG_VISITED_VERDANTURF_TOWN',
  MAPSEC_PACIFIDLOG_TOWN:   'FLAG_VISITED_PACIFIDLOG_TOWN',
  MAPSEC_PETALBURG_CITY:    'FLAG_VISITED_PETALBURG_CITY',
  MAPSEC_SLATEPORT_CITY:    'FLAG_VISITED_SLATEPORT_CITY',
  MAPSEC_MAUVILLE_CITY:     'FLAG_VISITED_MAUVILLE_CITY',
  MAPSEC_RUSTBORO_CITY:     'FLAG_VISITED_RUSTBORO_CITY',
  MAPSEC_FORTREE_CITY:      'FLAG_VISITED_FORTREE_CITY',
  MAPSEC_LILYCOVE_CITY:     'FLAG_VISITED_LILYCOVE_CITY',
  MAPSEC_MOSSDEEP_CITY:     'FLAG_VISITED_MOSSDEEP_CITY',
  MAPSEC_SOOTOPOLIS_CITY:   'FLAG_VISITED_SOOTOPOLIS_CITY',
  MAPSEC_EVER_GRANDE_CITY:  'FLAG_VISITED_EVER_GRANDE_CITY',
};

/** 1:1 décomp `GetMapsecType(mapSecId)` (region_map.c:1175-1220). Retourne
 *  le type du mapsec courant : NONE si invalide, CITY_CANFLY/CANTFLY pour les
 *  villes selon flag visit, BATTLE_FRONTIER pour mapsec spécial, sinon ROUTE.
 *
 *  @param flagGetter callback pour FlagGet (= injection pour éviter dep cycle
 *                    sur game-state.ts). Typique : `(f) => gameState.hasFlag(f)`. */
export function GetMapsecType(mapSecId: string, flagGetter: (flag: string) => boolean): number {
  if (mapSecId === 'MAPSEC_NONE' || !mapSecId) return MAPSECTYPE_NONE;
  // Cities : check FLAG_VISITED_*.
  const visitFlag = CITY_VISIT_FLAGS[mapSecId];
  if (visitFlag) {
    return flagGetter(visitFlag) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
  }
  // Battle Frontier : check FLAG_LANDMARK_BATTLE_FRONTIER.
  if (mapSecId === 'MAPSEC_BATTLE_FRONTIER') {
    return flagGetter('FLAG_LANDMARK_BATTLE_FRONTIER') ? MAPSECTYPE_BATTLE_FRONTIER : MAPSECTYPE_NONE;
  }
  // Southern Island : check FLAG_LANDMARK_SOUTHERN_ISLAND.
  if (mapSecId === 'MAPSEC_SOUTHERN_ISLAND') {
    return flagGetter('FLAG_LANDMARK_SOUTHERN_ISLAND') ? MAPSECTYPE_ROUTE : MAPSECTYPE_NONE;
  }
  return MAPSECTYPE_ROUTE;
}

// ─── CorrectSpecialMapSecId (= 1:1 décomp region_map.c:1227-1246) ───────────

/** 1:1 décomp `sRegionMap_SpecialPlaceLocations[][2]` (region_map.c:133-163).
 *  Mappe les mapsecs spéciaux (= UNDERWATER, AQUA_HIDEOUT, PETALBURG_WOODS, etc.)
 *  vers leur mapsec parent affiché sur la worldmap. */
const SPECIAL_PLACE_LOCATIONS: Record<string, string> = {
  MAPSEC_UNDERWATER_105:           'MAPSEC_ROUTE_105',
  MAPSEC_UNDERWATER_124:           'MAPSEC_ROUTE_124',
  // Politique préproc repo : vanilla (BUGFIX ABSENT) → UNDERWATER_125 pointe ROUTE_129
  // (bug ROM conservé 1:1, aligné sur region_map.ts:412 — consolidation item 3).
  MAPSEC_UNDERWATER_125:           'MAPSEC_ROUTE_129',
  MAPSEC_UNDERWATER_126:           'MAPSEC_ROUTE_126',
  MAPSEC_UNDERWATER_127:           'MAPSEC_ROUTE_127',
  MAPSEC_UNDERWATER_128:           'MAPSEC_ROUTE_128',
  MAPSEC_UNDERWATER_129:           'MAPSEC_ROUTE_129',
  MAPSEC_UNDERWATER_SOOTOPOLIS:    'MAPSEC_SOOTOPOLIS_CITY',
  MAPSEC_UNDERWATER_SEAFLOOR_CAVERN: 'MAPSEC_ROUTE_128',
  MAPSEC_AQUA_HIDEOUT:             'MAPSEC_LILYCOVE_CITY',
  MAPSEC_AQUA_HIDEOUT_OLD:         'MAPSEC_LILYCOVE_CITY',
  MAPSEC_MAGMA_HIDEOUT:            'MAPSEC_ROUTE_112',
  MAPSEC_UNDERWATER_SEALED_CHAMBER: 'MAPSEC_ROUTE_134',
  MAPSEC_PETALBURG_WOODS:          'MAPSEC_ROUTE_104',
  MAPSEC_JAGGED_PASS:              'MAPSEC_ROUTE_112',
  MAPSEC_MT_PYRE:                  'MAPSEC_ROUTE_122',
  MAPSEC_SKY_PILLAR:               'MAPSEC_ROUTE_131',
  MAPSEC_MIRAGE_TOWER:             'MAPSEC_ROUTE_111',
  MAPSEC_TRAINER_HILL:             'MAPSEC_ROUTE_111',
  MAPSEC_DESERT_UNDERPASS:         'MAPSEC_ROUTE_114',
  MAPSEC_ALTERING_CAVE:            'MAPSEC_ROUTE_103',
  MAPSEC_ARTISAN_CAVE:             'MAPSEC_ROUTE_103',
  MAPSEC_ABANDONED_SHIP:           'MAPSEC_ROUTE_108',
};

/** 1:1 décomp `CorrectSpecialMapSecId_Internal(mapSecId)` (region_map.c:1227-1246).
 *  Convertit les mapsecs spéciaux (= underwater, hideouts, etc.) vers leur
 *  parent affiché sur la worldmap. Skip les marine cave ids (= traités via
 *  GetTerraOrMarineCaveMapSecId qui dépend de VAR_ABNORMAL_WEATHER_LOCATION,
 *  non porté pour la démo). */
export function CorrectSpecialMapSecId(mapSecId: string): string {
  return SPECIAL_PLACE_LOCATIONS[mapSecId] ?? mapSecId;
}

// ─── GetPositionOfCursorWithinMapSec (= 1:1 décomp region_map.c:1294-1340) ──

/** 1:1 décomp `GetPositionOfCursorWithinMapSec(void)` (region_map.c:1294).
 *  Compte le nombre de tiles dans le même mapsec à gauche du cursor (= en
 *  remontant les lignes au besoin). Utilisé pour disambig multi-tile mapsecs
 *  comme "ROUTE 116 (NORD/SUD)" en affichant `mapSecName + (posWithinMapSec).
 *
 *  Pour la démo, on retourne juste 0 (= pas d'index disambig affiché). Le
 *  field_region_map.c utilise juste le mapsec name sans index, donc OK 1:1. */
export function GetPositionOfCursorWithinMapSec(_cursorX: number, _cursorY: number, _mapSecId: string): number {
  return 0;
}

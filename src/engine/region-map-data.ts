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

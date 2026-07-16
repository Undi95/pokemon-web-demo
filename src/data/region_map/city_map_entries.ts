/**
 * city_map_entries.ts — miroir 1:1 décomp `src/data/region_map/city_map_entries.h`
 * (#include de pokenav_region_map.c:147) : `sPokenavCityMaps[NUM_CITY_MAPS=22]`,
 * la table {mapSecId, index, tilemap} des plans de ville du zoom Pokénav.
 *
 * `tilemap` = GETTER live : les `gPokenavCityMap_*` sont remplis async par
 * PrefetchCityMapTilemaps (leçon d'or MEMORY « data top-level dérivée d'un asset
 * async = LAZY », cf. pokenav match call). Ordre des entrées 1:1 du .h.
 */
import {
  MAPSEC_DEWFORD_TOWN, MAPSEC_EVER_GRANDE_CITY, MAPSEC_FALLARBOR_TOWN, MAPSEC_FORTREE_CITY,
  MAPSEC_LAVARIDGE_TOWN, MAPSEC_LILYCOVE_CITY, MAPSEC_LITTLEROOT_TOWN, MAPSEC_MAUVILLE_CITY,
  MAPSEC_MOSSDEEP_CITY, MAPSEC_OLDALE_TOWN, MAPSEC_PACIFIDLOG_TOWN, MAPSEC_PETALBURG_CITY,
  MAPSEC_RUSTBORO_CITY, MAPSEC_SLATEPORT_CITY, MAPSEC_SOOTOPOLIS_CITY, MAPSEC_VERDANTURF_TOWN,
} from '../../../include/constants/region_map_sections';
import {
  gPokenavCityMap_Dewford_0, gPokenavCityMap_EverGrande_0, gPokenavCityMap_EverGrande_1,
  gPokenavCityMap_Fallarbor_0, gPokenavCityMap_Fortree_0, gPokenavCityMap_Lavaridge_0,
  gPokenavCityMap_Lilycove_0, gPokenavCityMap_Lilycove_1, gPokenavCityMap_Littleroot_0,
  gPokenavCityMap_Mauville_0, gPokenavCityMap_Mauville_1, gPokenavCityMap_Mossdeep_0,
  gPokenavCityMap_Mossdeep_1, gPokenavCityMap_Oldale_0, gPokenavCityMap_Pacifidlog_0,
  gPokenavCityMap_Petalburg_0, gPokenavCityMap_Rustboro_0, gPokenavCityMap_Rustboro_1,
  gPokenavCityMap_Slateport_0, gPokenavCityMap_Slateport_1, gPokenavCityMap_Sootopolis_0,
  gPokenavCityMap_Verdanturf_0,
} from './city_map_tilemaps';

/** 1:1 `struct CityMapEntry` (pokenav_region_map.c:42). */
export interface CityMapEntry {
  mapSecId: number;
  index: number;
  readonly tilemap: Uint16Array | null;
}

/** 1:1 `static const struct CityMapEntry sPokenavCityMaps[NUM_CITY_MAPS]` (city_map_entries.h:1). */
export const sPokenavCityMaps: readonly CityMapEntry[] = [
  { mapSecId: MAPSEC_LITTLEROOT_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Littleroot_0; } },
  { mapSecId: MAPSEC_OLDALE_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Oldale_0; } },
  { mapSecId: MAPSEC_DEWFORD_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Dewford_0; } },
  { mapSecId: MAPSEC_LAVARIDGE_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Lavaridge_0; } },
  { mapSecId: MAPSEC_FALLARBOR_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Fallarbor_0; } },
  { mapSecId: MAPSEC_VERDANTURF_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Verdanturf_0; } },
  { mapSecId: MAPSEC_PACIFIDLOG_TOWN, index: 0, get tilemap() { return gPokenavCityMap_Pacifidlog_0; } },
  { mapSecId: MAPSEC_PETALBURG_CITY, index: 0, get tilemap() { return gPokenavCityMap_Petalburg_0; } },
  { mapSecId: MAPSEC_SLATEPORT_CITY, index: 0, get tilemap() { return gPokenavCityMap_Slateport_0; } },
  { mapSecId: MAPSEC_SLATEPORT_CITY, index: 1, get tilemap() { return gPokenavCityMap_Slateport_1; } },
  { mapSecId: MAPSEC_MAUVILLE_CITY, index: 0, get tilemap() { return gPokenavCityMap_Mauville_0; } },
  { mapSecId: MAPSEC_MAUVILLE_CITY, index: 1, get tilemap() { return gPokenavCityMap_Mauville_1; } },
  { mapSecId: MAPSEC_RUSTBORO_CITY, index: 0, get tilemap() { return gPokenavCityMap_Rustboro_0; } },
  { mapSecId: MAPSEC_RUSTBORO_CITY, index: 1, get tilemap() { return gPokenavCityMap_Rustboro_1; } },
  { mapSecId: MAPSEC_FORTREE_CITY, index: 0, get tilemap() { return gPokenavCityMap_Fortree_0; } },
  { mapSecId: MAPSEC_LILYCOVE_CITY, index: 0, get tilemap() { return gPokenavCityMap_Lilycove_0; } },
  { mapSecId: MAPSEC_LILYCOVE_CITY, index: 1, get tilemap() { return gPokenavCityMap_Lilycove_1; } },
  { mapSecId: MAPSEC_MOSSDEEP_CITY, index: 0, get tilemap() { return gPokenavCityMap_Mossdeep_0; } },
  { mapSecId: MAPSEC_MOSSDEEP_CITY, index: 1, get tilemap() { return gPokenavCityMap_Mossdeep_1; } },
  { mapSecId: MAPSEC_SOOTOPOLIS_CITY, index: 0, get tilemap() { return gPokenavCityMap_Sootopolis_0; } },
  { mapSecId: MAPSEC_EVER_GRANDE_CITY, index: 0, get tilemap() { return gPokenavCityMap_EverGrande_0; } },
  { mapSecId: MAPSEC_EVER_GRANDE_CITY, index: 1, get tilemap() { return gPokenavCityMap_EverGrande_1; } },
];

/**
 * city_map_tilemaps.ts — miroir 1:1 décomp `src/data/region_map/city_map_tilemaps.h`
 * (#include de pokenav_region_map.c:83) : les 22 tilemaps 10×10 des plans de ville
 * du zoom Pokénav (`gPokenavCityMap_*`).
 *
 * ADAPTATION MOTEUR (pipeline assets — précédent pokenav_main_menu.ts
 * `_pokenavLoadHeaderGraphics` + pokenav_match_call_gfx.ts `_loadMatchCallUiGfx`) :
 * la ROM INCBIN des blobs LZ (`.bin.lz`) décompressés en jeu par LZ77UnCompWram ;
 * côté web les `.bin` servis dans public/decomp/em/pokenav/region_map/city_maps/
 * sont les sources DÉCOMPRESSÉES (200 octets = 100 entrées u16 = 10×10), chargées
 * async par PrefetchCityMapTilemaps() (appelé au prefetch Pokénav). Les lecteurs
 * (LoopedTask_DecompressCityMaps) lisent la valeur LIVE via city_map_entries.ts.
 */
import { loadTilemapBin } from '../../../harness/gba/png-loader';

// ─── 1:1 ordre du .h (city_map_tilemaps.h:1-22) ─────────────────────────────
export let gPokenavCityMap_Lavaridge_0: Uint16Array | null = null;
export let gPokenavCityMap_Fallarbor_0: Uint16Array | null = null;
export let gPokenavCityMap_Fortree_0: Uint16Array | null = null;
export let gPokenavCityMap_Slateport_0: Uint16Array | null = null;
export let gPokenavCityMap_Slateport_1: Uint16Array | null = null;
export let gPokenavCityMap_Rustboro_0: Uint16Array | null = null;
export let gPokenavCityMap_Rustboro_1: Uint16Array | null = null;
export let gPokenavCityMap_Pacifidlog_0: Uint16Array | null = null;
export let gPokenavCityMap_Mauville_1: Uint16Array | null = null;
export let gPokenavCityMap_Mauville_0: Uint16Array | null = null;
export let gPokenavCityMap_Oldale_0: Uint16Array | null = null;
export let gPokenavCityMap_Lilycove_1: Uint16Array | null = null;
export let gPokenavCityMap_Lilycove_0: Uint16Array | null = null;
export let gPokenavCityMap_Littleroot_0: Uint16Array | null = null;
export let gPokenavCityMap_Dewford_0: Uint16Array | null = null;
export let gPokenavCityMap_Sootopolis_0: Uint16Array | null = null;
export let gPokenavCityMap_EverGrande_0: Uint16Array | null = null;
export let gPokenavCityMap_EverGrande_1: Uint16Array | null = null;
export let gPokenavCityMap_Verdanturf_0: Uint16Array | null = null;
export let gPokenavCityMap_Mossdeep_1: Uint16Array | null = null;
export let gPokenavCityMap_Mossdeep_0: Uint16Array | null = null;
export let gPokenavCityMap_Petalburg_0: Uint16Array | null = null;

let _state: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';

/** true quand les 22 tilemaps sont chargés. */
export function CityMapTilemapsReady(): boolean {
  return _state === 'ready';
}

/** Précharge les 22 tilemaps (idempotent). Gate côté lecteur : les entrées de
 *  sPokenavCityMaps restent `tilemap: null` tant que le fetch n'a pas fini —
 *  l'adaptateur LZ77UnCompWram de pokenav_region_map HURLE si null (Règle 3). */
export function PrefetchCityMapTilemaps(): void {
  if (_state !== 'idle') return;
  _state = 'loading';
  const base = '/decomp/em/pokenav/region_map/city_maps';
  void (async () => {
    try {
      [
        gPokenavCityMap_Lavaridge_0, gPokenavCityMap_Fallarbor_0, gPokenavCityMap_Fortree_0,
        gPokenavCityMap_Slateport_0, gPokenavCityMap_Slateport_1,
        gPokenavCityMap_Rustboro_0, gPokenavCityMap_Rustboro_1,
        gPokenavCityMap_Pacifidlog_0,
        gPokenavCityMap_Mauville_1, gPokenavCityMap_Mauville_0,
        gPokenavCityMap_Oldale_0,
        gPokenavCityMap_Lilycove_1, gPokenavCityMap_Lilycove_0,
        gPokenavCityMap_Littleroot_0, gPokenavCityMap_Dewford_0, gPokenavCityMap_Sootopolis_0,
        gPokenavCityMap_EverGrande_0, gPokenavCityMap_EverGrande_1,
        gPokenavCityMap_Verdanturf_0,
        gPokenavCityMap_Mossdeep_1, gPokenavCityMap_Mossdeep_0,
        gPokenavCityMap_Petalburg_0,
      ] = await Promise.all([
        loadTilemapBin(`${base}/lavaridge_0.bin`), loadTilemapBin(`${base}/fallarbor_0.bin`), loadTilemapBin(`${base}/fortree_0.bin`),
        loadTilemapBin(`${base}/slateport_0.bin`), loadTilemapBin(`${base}/slateport_1.bin`),
        loadTilemapBin(`${base}/rustboro_0.bin`), loadTilemapBin(`${base}/rustboro_1.bin`),
        loadTilemapBin(`${base}/pacifidlog_0.bin`),
        loadTilemapBin(`${base}/mauville_1.bin`), loadTilemapBin(`${base}/mauville_0.bin`),
        loadTilemapBin(`${base}/oldale_0.bin`),
        loadTilemapBin(`${base}/lilycove_1.bin`), loadTilemapBin(`${base}/lilycove_0.bin`),
        loadTilemapBin(`${base}/littleroot_0.bin`), loadTilemapBin(`${base}/dewford_0.bin`), loadTilemapBin(`${base}/sootopolis_0.bin`),
        loadTilemapBin(`${base}/ever_grande_0.bin`), loadTilemapBin(`${base}/ever_grande_1.bin`),
        loadTilemapBin(`${base}/verdanturf_0.bin`),
        loadTilemapBin(`${base}/mossdeep_1.bin`), loadTilemapBin(`${base}/mossdeep_0.bin`),
        loadTilemapBin(`${base}/petalburg_0.bin`),
      ]);
      _state = 'ready';
    } catch (e) {
      _state = 'failed';
      console.error('[region-map city maps] chargement tilemaps ÉCHOUÉ — les plans de ville du zoom seront vides :', e);
    }
  })();
}

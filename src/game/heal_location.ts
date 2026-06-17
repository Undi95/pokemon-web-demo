/**
 * heal_location.ts — Port 1:1 de `src/data/heal_locations.json` + `heal_location.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/data/heal_locations.json
 *
 * Table des lieux de soins (Centres Pokémon / maison départ) : chaque `setrespawn`
 * (heal) pose un `HEAL_LOCATION_*` ID dans `gSaveBlock1Ptr.respawnLocation`, et
 * le respawn (whiteout) / le move Téléport le résout en (map, x, y) via cette
 * table. Le décomp utilise (mapGroup, mapNum) ; le port étant name-based, on
 * garde directement le NOM de map (= json `map`).
 */

/** 1:1 décomp `struct HealLocation` (heal_location.h) — name-based dans le port. */
export interface HealLocation {
  id: string;
  map: string;
  x: number;
  y: number;
}

/** 1:1 décomp `sHealLocations[]` (data/heal_locations.json) — 22 lieux de soins. */
export const sHealLocations: readonly HealLocation[] = [
  { id: 'HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F', map: 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F', x: 4, y: 2 },
  { id: 'HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F', map: 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F', x: 4, y: 2 },
  { id: 'HEAL_LOCATION_PETALBURG_CITY', map: 'MAP_PETALBURG_CITY', x: 20, y: 17 },
  { id: 'HEAL_LOCATION_SLATEPORT_CITY', map: 'MAP_SLATEPORT_CITY', x: 19, y: 20 },
  { id: 'HEAL_LOCATION_MAUVILLE_CITY', map: 'MAP_MAUVILLE_CITY', x: 22, y: 6 },
  { id: 'HEAL_LOCATION_RUSTBORO_CITY', map: 'MAP_RUSTBORO_CITY', x: 16, y: 39 },
  { id: 'HEAL_LOCATION_FORTREE_CITY', map: 'MAP_FORTREE_CITY', x: 5, y: 7 },
  { id: 'HEAL_LOCATION_LILYCOVE_CITY', map: 'MAP_LILYCOVE_CITY', x: 24, y: 15 },
  { id: 'HEAL_LOCATION_MOSSDEEP_CITY', map: 'MAP_MOSSDEEP_CITY', x: 28, y: 17 },
  { id: 'HEAL_LOCATION_SOOTOPOLIS_CITY', map: 'MAP_SOOTOPOLIS_CITY', x: 43, y: 32 },
  { id: 'HEAL_LOCATION_EVER_GRANDE_CITY', map: 'MAP_EVER_GRANDE_CITY', x: 27, y: 49 },
  { id: 'HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE', map: 'MAP_LITTLEROOT_TOWN', x: 5, y: 9 },
  { id: 'HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE', map: 'MAP_LITTLEROOT_TOWN', x: 14, y: 9 },
  { id: 'HEAL_LOCATION_OLDALE_TOWN', map: 'MAP_OLDALE_TOWN', x: 6, y: 17 },
  { id: 'HEAL_LOCATION_DEWFORD_TOWN', map: 'MAP_DEWFORD_TOWN', x: 2, y: 11 },
  { id: 'HEAL_LOCATION_LAVARIDGE_TOWN', map: 'MAP_LAVARIDGE_TOWN', x: 9, y: 7 },
  { id: 'HEAL_LOCATION_FALLARBOR_TOWN', map: 'MAP_FALLARBOR_TOWN', x: 14, y: 8 },
  { id: 'HEAL_LOCATION_VERDANTURF_TOWN', map: 'MAP_VERDANTURF_TOWN', x: 16, y: 4 },
  { id: 'HEAL_LOCATION_PACIFIDLOG_TOWN', map: 'MAP_PACIFIDLOG_TOWN', x: 8, y: 16 },
  { id: 'HEAL_LOCATION_EVER_GRANDE_CITY_POKEMON_LEAGUE', map: 'MAP_EVER_GRANDE_CITY', x: 18, y: 6 },
  { id: 'HEAL_LOCATION_SOUTHERN_ISLAND_EXTERIOR', map: 'MAP_SOUTHERN_ISLAND_EXTERIOR', x: 15, y: 20 },
  { id: 'HEAL_LOCATION_BATTLE_FRONTIER_OUTSIDE_EAST', map: 'MAP_BATTLE_FRONTIER_OUTSIDE_EAST', x: 3, y: 52 },
];

/** Résout un `HEAL_LOCATION_*` ID (= `gSaveBlock1Ptr.respawnLocation`) en lieu
 *  de soins (map, x, y). Tolère l'ID avec ou sans préfixe `HEAL_LOCATION_`.
 *  ≈ décomp `GetHealLocation` (heal_location.c) mais par NOM. */
export function GetHealLocationByName(id: string | undefined | null): HealLocation | null {
  if (!id) return null;
  const full = id.startsWith('HEAL_LOCATION_') ? id : `HEAL_LOCATION_${id}`;
  return sHealLocations.find((h) => h.id === full) ?? null;
}

/**
 * save_location.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/save_location.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/save_location.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { MAP_CONSTANTS } from '../include/constants/map_groups';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKECENTER_SAVEWARP = 2; // 1:1 include/save_location.h:6 (à consolider dans include/)
const LOBBY_SAVEWARP = 4; // 1:1 include/save_location.h:7 (à consolider dans include/)
const UNK_SPECIAL_SAVE_WARP_FLAG_3 = 8; // 1:1 include/save_location.h:8 (à consolider dans include/)
const CHAMPION_SAVEWARP = 128; // 1:1 include/save_location.h:13 (à consolider dans include/)

const LIST_END = 0xFFFF; // 1:1 save_location.c:4

/** 1:1 `static bool32 IsCurMapInLocationList(const u16 *list)` (save_location.c:6-18). */
function IsCurMapInLocationList(list: Uint16Array): boolean {
  let i = 0;
  let map = (gSaveBlock1Ptr.location.mapGroup << 8) + gSaveBlock1Ptr.location.mapNum;
  for (i = 0; list[i] != LIST_END; i++)
  {
    if (list[i] == map)
      return true;
  }
  return false;
}

/** 1:1 (save_location.c:20) */
const sSaveLocationPokeCenterList = Uint16Array.from([
  MAP_CONSTANTS.MAP_OLDALE_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_OLDALE_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_DEWFORD_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_DEWFORD_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_LAVARIDGE_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_LAVARIDGE_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_FALLARBOR_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_FALLARBOR_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_VERDANTURF_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_VERDANTURF_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_PETALBURG_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_PETALBURG_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_SLATEPORT_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_SLATEPORT_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_MAUVILLE_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_MAUVILLE_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_RUSTBORO_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_RUSTBORO_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_FORTREE_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_FORTREE_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_LILYCOVE_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_LILYCOVE_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_MOSSDEEP_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_MOSSDEEP_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_SOOTOPOLIS_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_SOOTOPOLIS_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F,
  MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F,
  MAP_CONSTANTS.MAP_BATTLE_FRONTIER_POKEMON_CENTER_1F,
  MAP_CONSTANTS.MAP_BATTLE_FRONTIER_POKEMON_CENTER_2F,
  MAP_CONSTANTS.MAP_BATTLE_COLOSSEUM_2P,
  MAP_CONSTANTS.MAP_TRADE_CENTER,
  MAP_CONSTANTS.MAP_RECORD_CORNER,
  MAP_CONSTANTS.MAP_BATTLE_COLOSSEUM_4P,
  LIST_END,
]);

/** 1:1 `static bool32 IsCurMapPokeCenter(void)` (save_location.c:63-66). */
function IsCurMapPokeCenter(): boolean {
  return IsCurMapInLocationList(sSaveLocationPokeCenterList);
}

/** 1:1 (save_location.c:68) */
const sSaveLocationReloadLocList = Uint16Array.from([
  MAP_CONSTANTS.MAP_BATTLE_FRONTIER_BATTLE_TOWER_LOBBY,
  LIST_END,
]);

/** 1:1 `static bool32 IsCurMapReloadLocation(void)` (save_location.c:74-77). */
function IsCurMapReloadLocation(): boolean {
  return IsCurMapInLocationList(sSaveLocationReloadLocList);
}

// Nulled out list. Unknown what this would have been.

/** 1:1 (save_location.c:80) */
const sEmptyMapList = Uint16Array.from([
  LIST_END,
]);

/** 1:1 `static bool32 IsCurMapInEmptyList(void)` (save_location.c:85-88). */
function IsCurMapInEmptyList(): boolean {
  return IsCurMapInLocationList(sEmptyMapList);
}

/** 1:1 `static void TrySetPokeCenterWarpStatus(void)` (save_location.c:90-96). */
function TrySetPokeCenterWarpStatus(): void {
  if (!IsCurMapPokeCenter())
    gSaveBlock2Ptr.specialSaveWarpFlags &= ~POKECENTER_SAVEWARP;
  else
    gSaveBlock2Ptr.specialSaveWarpFlags |= POKECENTER_SAVEWARP;
}

/** 1:1 `static void TrySetReloadWarpStatus(void)` (save_location.c:98-104). */
function TrySetReloadWarpStatus(): void {
  if (!IsCurMapReloadLocation())
    gSaveBlock2Ptr.specialSaveWarpFlags &= ~LOBBY_SAVEWARP;
  else
    gSaveBlock2Ptr.specialSaveWarpFlags |= LOBBY_SAVEWARP;
}

// Unknown save warp flag. Never set because map list is empty.

/** 1:1 `static void TrySetUnknownWarpStatus(void)` (save_location.c:107-113). */
function TrySetUnknownWarpStatus(): void {
  if (!IsCurMapInEmptyList())
    gSaveBlock2Ptr.specialSaveWarpFlags &= ~UNK_SPECIAL_SAVE_WARP_FLAG_3;
  else
    gSaveBlock2Ptr.specialSaveWarpFlags |= UNK_SPECIAL_SAVE_WARP_FLAG_3;
}

/** 1:1 `void TrySetMapSaveWarpStatus(void)` (save_location.c:115-120). */
export function TrySetMapSaveWarpStatus(): void {
  TrySetPokeCenterWarpStatus();
  TrySetReloadWarpStatus();
  TrySetUnknownWarpStatus();
}

// In FRLG, only bits 0, 4, and 5 are set when the Pokédex is received.

// Bits 1, 2, 3, and 15 are instead set by SetPostgameFlags.

// These flags are read by Pokémon Colosseum/XD for linking. XD Additionally requires FLAG_SYS_GAME_CLEAR

/** 1:1 `void SetUnlockedPokedexFlags(void)` (save_location.c:125-134). */
export function SetUnlockedPokedexFlags(): void {
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 15);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 0);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 1);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 2);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 4);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 5);
  gSaveBlock2Ptr.gcnLinkFlags |= (1 << 3);
}

/** 1:1 `void SetChampionSaveWarp(void)` (save_location.c:136-139). */
export function SetChampionSaveWarp(): void {
  gSaveBlock2Ptr.specialSaveWarpFlags |= CHAMPION_SAVEWARP;
}

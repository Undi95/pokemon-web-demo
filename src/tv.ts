/**
 * tv-screen.ts — Port 1:1 du système TV screen du décomp Émeraude.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/tv.c:826-879` :
 *      UpdateTVScreensOnMap + SetTVMetatilesOnMap + TurnOnTVScreen + TurnOffTVScreen
 *   - `D:/Projet 1/decomps/pokeemeraude/src/tv.c:3359-3384` :
 *      CheckForPlayersHouseNews (= état logique TV maison du joueur)
 *
 * Comportement 1:1 décomp :
 *   - Au map load INDOOR (= overworld.c:872 `LoadMapHeaderInternal` if isIndoor),
 *     `UpdateTVScreensOnMap` est appelé. Il dispatch selon `CheckForPlayersHouseNews()` :
 *
 *     - `PLAYERS_HOUSE_TV_LATI` (1) → set TOUTES les TVs à METATILE_Building_TV_On
 *       (= tile cycling actif via TilesetAnim_Building).
 *     - `PLAYERS_HOUSE_TV_MOVIE` (2) → no change (= TV reste à sa valeur map.bin).
 *     - `PLAYERS_HOUSE_TV_NONE` (0) default branch :
 *         * Lilycove motel → toujours TV_On.
 *         * FLAG_SYS_TV_START + (TV show on air || PokeNews || GabbyTy) → TV_On.
 *         * Sinon : pas de change.
 *
 *   - `CheckForPlayersHouseNews()` retourne (1:1 tv.c:3359-3384) :
 *     - 0 (NONE) si pas dans la maison du joueur (= gender-aware)
 *     - 1 (LATI) si FLAG_SYS_TV_LATIAS_LATIOS set
 *     - 2 (MOVIE) si FLAG_SYS_TV_HOME set (= post-event maman PetalburgGymReport)
 *     - **1 (LATI) DEFAULT** (= early-game, dans la maison, FLAG_SYS_TV_HOME pas
 *       encore set) → TV cycle pour l'event maman ✓
 *
 *   - `TurnOnTVScreen()` / `TurnOffTVScreen()` : helpers de l'event maman. Set
 *     tous les MB_TELEVISION metatiles à TV_On ou TV_Off + DrawWholeMapView.
 *
 * Wiring :
 *   - TestOverworldScene.loadAndInitMap : appelle `UpdateTVScreensOnMap()` après
 *     `InitMap` indoor (= 1:1 overworld.c:872 chain).
 *   - specials-registry : TurnOnTVScreen / TurnOffTVScreen wirés.
 */

import { gMapHeader, MapGridGetMetatileBehaviorAt, MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_COLLISION_MASK } from './fieldmap';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { MALE, FEMALE } from '../harness/runtime/decomp-globals';
import { FlagSet, FlagClear, FlagGet } from './engine/script/script-vars';
import { GetMonData } from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import {
  MON_DATA_COOL_RIBBON, MON_DATA_BEAUTY_RIBBON, MON_DATA_CUTE_RIBBON, MON_DATA_SMART_RIBBON,
  MON_DATA_TOUGH_RIBBON, MON_DATA_CHAMPION_RIBBON, MON_DATA_WINNING_RIBBON, MON_DATA_VICTORY_RIBBON,
  MON_DATA_ARTIST_RIBBON, MON_DATA_EFFORT_RIBBON, MON_DATA_MARINE_RIBBON, MON_DATA_LAND_RIBBON,
  MON_DATA_SKY_RIBBON, MON_DATA_COUNTRY_RIBBON, MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON,
  MON_DATA_WORLD_RIBBON,
} from '../include/pokemon';
import { DrawWholeMapView } from './field_camera';
import {
  METATILE_Building_TV_On,
  METATILE_Building_TV_Off,
} from '../include/constants/metatile_labels';
import { ENUM_MB_0 as MB } from '../include/constants/metatile_behaviors';

// 1:1 décomp `include/constants/tv.h:79-81` :
//   #define PLAYERS_HOUSE_TV_NONE  0
//   #define PLAYERS_HOUSE_TV_LATI  1
//   #define PLAYERS_HOUSE_TV_MOVIE 2
export const PLAYERS_HOUSE_TV_NONE  = 0;
export const PLAYERS_HOUSE_TV_LATI  = 1;
export const PLAYERS_HOUSE_TV_MOVIE = 2;

/** 1:1 décomp `CheckForPlayersHouseNews` (tv.c:3359-3384).
 *
 *  Comportement :
 *    1. Si pas dans le map group de la maison du joueur → NONE
 *    2. Si pas dans la map précise (= BRENDANS_HOUSE_1F pour MALE, MAYS_HOUSE_1F
 *       pour FEMALE) → NONE
 *    3. Si FLAG_SYS_TV_LATIAS_LATIOS set → LATI (= news flash Lati)
 *    4. Si FLAG_SYS_TV_HOME set → MOVIE (= déjà vu l'event papa, plus de cycling)
 *    5. **DEFAULT = LATI** (= early-game, TV cycle active)
 */
export function CheckForPlayersHouseNews(): number {
  // Notre TS utilise gMapHeader.id (= string literal) au lieu de mapGroup/mapNum.
  const mapId = gMapHeader?.id ?? '';
  const isMaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  const isFemaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F';
  const isInPlayersHouse =
    (gSaveBlock2Ptr.playerGender === MALE   && isMaleHouse) ||
    (gSaveBlock2Ptr.playerGender === FEMALE && isFemaleHouse);
  if (!isInPlayersHouse) return PLAYERS_HOUSE_TV_NONE;
  if (FlagGet('FLAG_SYS_TV_LATIAS_LATIOS')) return PLAYERS_HOUSE_TV_LATI;
  if (FlagGet('FLAG_SYS_TV_HOME')) return PLAYERS_HOUSE_TV_MOVIE;
  // 1:1 décomp tv.c:3383 : `return PLAYERS_HOUSE_TV_LATI;` (= bug-or-feature
  // default qui fait que la TV cycle en early-game maison).
  return PLAYERS_HOUSE_TV_LATI;
}

/** 1:1 décomp `SetTVMetatilesOnMap` (tv.c:854-867). Itère sur TOUS les tiles
 *  de la map et set le metatile_id à `metatileId | MAPGRID_COLLISION_MASK` pour
 *  ceux dont metatile_behavior == MB_TELEVISION. */
export function SetTVMetatilesOnMap(width: number, height: number, metatileId: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 1:1 décomp : `MapGridGetMetatileBehaviorAt(x, y)`. Notre helper TS
      // attend (x + MAP_OFFSET, y + MAP_OFFSET) internal coords car
      // `gBackupMapLayout` utilise un buffer 32x32 wrapped autour du player.
      if (MapGridGetMetatileBehaviorAt(x + MAP_OFFSET, y + MAP_OFFSET) === MB.MB_TELEVISION) {
        MapGridSetMetatileIdAt(x + MAP_OFFSET, y + MAP_OFFSET, metatileId | MAPGRID_COLLISION_MASK);
      }
    }
  }
}

/** 1:1 décomp `UpdateTVScreensOnMap` (tv.c:826-852). Appelé au map load indoor
 *  via `overworld.c:872 LoadMapHeaderInternal` if !outdoor branch. Set les
 *  TVs à ON ou OFF selon le state CheckForPlayersHouseNews. */
export function UpdateTVScreensOnMap(width: number, height: number): void {
  FlagSet('FLAG_SYS_TV_WATCH');
  switch (CheckForPlayersHouseNews()) {
    case PLAYERS_HOUSE_TV_LATI:
      SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
      break;
    case PLAYERS_HOUSE_TV_MOVIE:
      // 1:1 décomp comment : "Don't flash TV for movie text in player's house"
      break;
    // case PLAYERS_HOUSE_TV_NONE (default) :
    default: {
      // 1:1 décomp : Lilycove Motel 1F → always TV_On (= NPC dans l'hôtel
      // regarde la TV en permanence).
      const mapId = gMapHeader?.id ?? '';
      if (mapId === 'MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_1F') {
        SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
        break;
      }
      // 1:1 décomp : FLAG_SYS_TV_START set + TV show / PokeNews / GabbyTy on air
      // → TV_On. Pour notre démo on n'a pas encore le TV show generator runtime
      // (= FindAnyTVShowOnTheAir, FindAnyPokeNewsOnTheAir, IsGabbyAndTyShowOnTheAir
      // = stub no-op-équivalent). Honnête-min : check FLAG_SYS_TV_START seulement.
      // Tant que TV show gen pas implémenté, condition probably TRUE post-TV-start
      // mais sans show actif = false branche → no change. Honnête deferred port
      // documenté ici (= si user voit TV statique post-FLAG_SYS_TV_START attendue
      // ON, c'est ce stub).
      if (FlagGet('FLAG_SYS_TV_START')) {
        // Honnête-min : sans TV show generator, on suppose au moins 1 show
        // disponible → TV_On. C'est la behavior la plus proche du décomp en
        // attendant le port complet du TV show system.
        FlagClear('FLAG_SYS_TV_WATCH');
        SetTVMetatilesOnMap(width, height, METATILE_Building_TV_On);
      }
      break;
    }
  }
}

/** 1:1 décomp `TurnOffTVScreen` (tv.c:869-873). Set TOUS les MB_TELEVISION
 *  metatiles à TV_Off + DrawWholeMapView (= refresh BG tilemap). Appelé par
 *  le special `TurnOffTVScreen` dans les scripts (ex: WatchGymBroadcast). */
export function TurnOffTVScreen(): void {
  if (!gMapHeader) return;
  const ml = gMapHeader.mapLayout;
  SetTVMetatilesOnMap(ml.width, ml.height, METATILE_Building_TV_Off);
  DrawWholeMapView();
}

/** 1:1 décomp `TurnOnTVScreen` (tv.c:875-879). Set TOUS les MB_TELEVISION
 *  metatiles à TV_On + DrawWholeMapView. Appelé par le special `TurnOnTVScreen`
 *  dans les scripts (ex: EventScript_LatiBroadcast). */
export function TurnOnTVScreen(): void {
  if (!gMapHeader) return;
  const ml = gMapHeader.mapLayout;
  SetTVMetatilesOnMap(ml.width, ml.height, METATILE_Building_TV_On);
  DrawWholeMapView();
}

/** 1:1 décomp `u8 GetRibbonCount(struct Pokemon *pokemon)` (tv.c:2277-2302) :
 *  somme des 17 rubans du mon (les 5 rubans concours = compteurs 0-4, les 12
 *  autres = bits 0/1 — GetMonData retourne la valeur brute dans les deux cas).
 *  Appelé par GameClear (post_battle_event_funcs.c) + contest_util + battle_tower. */
export function GetRibbonCount(pokemon: Pokemon): number {
  let nRibbons = 0;
  nRibbons += GetMonData(pokemon, MON_DATA_COOL_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_BEAUTY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_CUTE_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_SMART_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_TOUGH_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_CHAMPION_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_WINNING_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_VICTORY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_ARTIST_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_EFFORT_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_MARINE_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_LAND_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_SKY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_COUNTRY_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_NATIONAL_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_EARTH_RIBBON) as number;
  nRibbons += GetMonData(pokemon, MON_DATA_WORLD_RIBBON) as number;
  return nRibbons;
}

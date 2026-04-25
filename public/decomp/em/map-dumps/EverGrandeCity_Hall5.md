# EverGrandeCity_Hall5

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_HALL5`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_SHORT_HALL`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Warps (4)
- #0 (5,12) → `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F` warp #2
- #1 (5,2) → `MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM` warp #0
- #2 (4,12) → `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F` warp #2
- #3 (6,12) → `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F` warp #2

## Variables référencées (1)
- `VAR_TEMP_1`

## Scripts (3)
### EverGrandeCity_Hall5_MapScripts
```
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_Hall5_OnWarp
```
### EverGrandeCity_Hall5_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_Hall5_EventScript_TurnPlayerNorth
```
### EverGrandeCity_Hall5_EventScript_TurnPlayerNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```

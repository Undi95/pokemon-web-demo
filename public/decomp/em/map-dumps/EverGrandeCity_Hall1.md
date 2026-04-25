# EverGrandeCity_Hall1

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_HALL1`
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
- #0 (5,12) → `MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM` warp #1
- #1 (5,2) → `MAP_EVER_GRANDE_CITY_PHOEBES_ROOM` warp #0
- #2 (4,12) → `MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM` warp #1
- #3 (6,12) → `MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM` warp #1

## Variables référencées (1)
- `VAR_TEMP_1`

## Scripts (3)
### EverGrandeCity_Hall1_MapScripts
```
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_Hall1_OnWarp
```
### EverGrandeCity_Hall1_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_Hall1_EventScript_TurnPlayerNorth
```
### EverGrandeCity_Hall1_EventScript_TurnPlayerNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```

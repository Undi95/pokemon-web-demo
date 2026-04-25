# EverGrandeCity_Hall4

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_HALL4`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_HALL4`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Warps (2)
- #0 (5,33) → `MAP_EVER_GRANDE_CITY_DRAKES_ROOM` warp #1
- #1 (5,2) → `MAP_EVER_GRANDE_CITY_CHAMPIONS_ROOM` warp #0

## Variables référencées (1)
- `VAR_TEMP_1`

## Scripts (3)
### EverGrandeCity_Hall4_MapScripts
```
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_Hall4_OnWarp
```
### EverGrandeCity_Hall4_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_Hall4_EventScript_TurnPlayerNorth
```
### EverGrandeCity_Hall4_EventScript_TurnPlayerNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```

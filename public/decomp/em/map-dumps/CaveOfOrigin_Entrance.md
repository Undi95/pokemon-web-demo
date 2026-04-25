# CaveOfOrigin_Entrance

## Métadonnées
- **id** : `MAP_CAVE_OF_ORIGIN_ENTRANCE`
- **layout** : `LAYOUT_CAVE_OF_ORIGIN_ENTRANCE`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_CAVE_OF_ORIGIN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (9,20) → `MAP_SOOTOPOLIS_CITY` warp #3
- #1 (9,5) → `MAP_CAVE_OF_ORIGIN_1F` warp #0

## Scripts (2)
### CaveOfOrigin_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, CaveOfOrigin_Entrance_OnResume
```
### CaveOfOrigin_Entrance_OnResume
```
setescapewarp MAP_SOOTOPOLIS_CITY, 31, 17
end
```

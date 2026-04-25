# MarineCave_Entrance

## Métadonnées
- **id** : `MAP_MARINE_CAVE_ENTRANCE`
- **layout** : `LAYOUT_MARINE_CAVE_ENTRANCE`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_MARINE_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Warps (1)
- #0 (14,1) → `MAP_MARINE_CAVE_END` warp #0

## Scripts (2)
### MarineCave_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, MarineCave_Entrance_OnResume
```
### MarineCave_Entrance_OnResume
```
setdivewarp MAP_UNDERWATER_MARINE_CAVE, 9, 6
end
```

# TerraCave_Entrance

## Métadonnées
- **id** : `MAP_TERRA_CAVE_ENTRANCE`
- **layout** : `LAYOUT_TERRA_CAVE_ENTRANCE`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_TERRA_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (8,18) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (14,1) → `MAP_TERRA_CAVE_END` warp #0

## Flags référencés (1)
- `FLAG_ARRIVED_AT_TERRA_CAVE_ENTRANCE`

## Scripts (2)
### TerraCave_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, TerraCave_Entrance_OnTransition
```
### TerraCave_Entrance_OnTransition
```
setflag FLAG_ARRIVED_AT_TERRA_CAVE_ENTRANCE
end
```

# AlteringCave

## Métadonnées
- **id** : `MAP_ALTERING_CAVE`
- **layout** : `LAYOUT_ALTERING_CAVE`
- **music** : `MUS_RG_SEVII_CAVE`
- **region_map_section** : `MAPSEC_ALTERING_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (18,22) → `MAP_ROUTE103` warp #0

## Flags référencés (1)
- `FLAG_LANDMARK_ALTERING_CAVE`

## Scripts (2)
### AlteringCave_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, AlteringCave_OnTransition
```
### AlteringCave_OnTransition
```
setflag FLAG_LANDMARK_ALTERING_CAVE
end
```

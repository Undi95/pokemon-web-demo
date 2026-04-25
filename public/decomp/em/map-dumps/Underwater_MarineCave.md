# Underwater_MarineCave

## Métadonnées
- **id** : `MAP_UNDERWATER_MARINE_CAVE`
- **layout** : `LAYOUT_UNDERWATER_MARINE_CAVE`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_UNDERWATER_MARINE_CAVE`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (9,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Flags référencés (1)
- `FLAG_ARRIVED_AT_MARINE_CAVE_EMERGE_SPOT`

## Scripts (3)
### Underwater_MarineCave_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_MarineCave_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Underwater_MarineCave_OnTransition
```
### Underwater_MarineCave_OnTransition
```
setflag FLAG_ARRIVED_AT_MARINE_CAVE_EMERGE_SPOT
end
```
### Underwater_MarineCave_OnResume
```
setdivewarp MAP_MARINE_CAVE_ENTRANCE, 10, 17
end
```

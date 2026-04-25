# Underwater_SootopolisCity

## Métadonnées
- **id** : `MAP_UNDERWATER_SOOTOPOLIS_CITY`
- **layout** : `LAYOUT_UNDERWATER_SOOTOPOLIS_CITY`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_SOOTOPOLIS`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (9,8) → `MAP_UNDERWATER_ROUTE126` warp #0
- #1 (10,8) → `MAP_UNDERWATER_ROUTE126` warp #0

## Scripts (2)
### Underwater_SootopolisCity_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_SootopolisCity_OnResume
```
### Underwater_SootopolisCity_OnResume
```
setdivewarp MAP_SOOTOPOLIS_CITY, 29, 53
end
```

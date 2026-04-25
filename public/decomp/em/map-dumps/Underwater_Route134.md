# Underwater_Route134

## Métadonnées
- **id** : `MAP_UNDERWATER_ROUTE134`
- **layout** : `LAYOUT_UNDERWATER_ROUTE134`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_SEALED_CHAMBER`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (8,8) → `MAP_UNDERWATER_SEALED_CHAMBER` warp #0

## Scripts (2)
### Underwater_Route134_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_Route134_OnResume
```
### Underwater_Route134_OnResume
```
setdivewarp MAP_ROUTE134, 60, 31
end
```
